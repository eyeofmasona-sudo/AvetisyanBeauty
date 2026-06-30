import express from "express";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import multer from "multer";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";
import { supabaseAdmin } from "./src/server/lib/supabaseAdmin.js";

function encodeWAV(pcmBuffer: Buffer, sampleRate: number, numChannels: number, bitsPerSample: number): Buffer {
  const byteRate = sampleRate * numChannels * (bitsPerSample / 8);
  const blockAlign = numChannels * (bitsPerSample / 8);
  const buffer = Buffer.alloc(44 + pcmBuffer.length);

  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + pcmBuffer.length, 4);
  buffer.write('WAVE', 8);
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20); // PCM
  buffer.writeUInt16LE(numChannels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(byteRate, 28);
  buffer.writeUInt16LE(blockAlign, 32);
  buffer.writeUInt16LE(bitsPerSample, 34);
  buffer.write('data', 36);
  buffer.writeUInt32LE(pcmBuffer.length, 40);

  pcmBuffer.copy(buffer, 44);
  return buffer;
}


import { GoogleGenAI, Modality, GenerateVideosOperation } from "@google/genai";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import { createInstagramWebhookRoute } from "./src/server/webhooks/instagramWebhookRoute.js";
import { createWhatsappWebhookRoute } from "./src/server/webhooks/whatsappWebhookRoute.js";
import { sendInstagramText, sendWhatsAppText, MetaSendError } from "./src/server/messaging/metaSend.js";
import { markMessageAnswered, getThread } from "./src/server/messaging/threadStore.js";

dotenv.config();

const isProduction = process.env.NODE_ENV === "production";

if (!process.env.JWT_SECRET) {
  if (isProduction) {
    console.error("FATAL: JWT_SECRET environment variable is required in production.");
    process.exit(1);
  }
  console.warn("WARNING: JWT_SECRET is not set. Using a random secret for this dev session only (admin sessions will not persist across restarts).");
}
const JWT_SECRET = process.env.JWT_SECRET || crypto.randomBytes(32).toString("hex");

/**
 * Creates and configures the Express application. Used both by the local
 * dev server (`npm run dev`) and by the Vercel Serverless Function
 * (`api/[[...path]].ts`). The function is idempotent — calling it multiple
 * times is safe.
 */
export async function createApp() {
  const app = express();

  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "https://www.googletagmanager.com", "https://connect.facebook.net"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "blob:", "https:"],
        mediaSrc: ["'self'", "data:", "blob:", "https:"],
        connectSrc: ["'self'", "https:", "wss:", "ws:"],
        frameSrc: ["'self'", "https:"],
        objectSrc: ["'none'"],
        frameAncestors: ["*"],
      },
    },
    crossOriginEmbedderPolicy: false,
    frameguard: false,
  }));

  const authRateLimit = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Too many attempts. Please try again later." },
  });

  const apiRateLimit = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Too many requests. Please try again later." },
  });

  function requireAdmin(req: express.Request, res: express.Response, next: express.NextFunction) {
    const token = req.cookies?.admin_token;
    if (!token) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    try {
      jwt.verify(token, JWT_SECRET);
      next();
    } catch (e) {
      return res.status(401).json({ error: "Unauthorized" });
    }
  }

  // Setup Encryption
  const APP_SECRET = process.env.APP_SECRET || '';
  if (!APP_SECRET) {
    console.warn("WARNING: APP_SECRET is not set in environment. Tokens will be encrypted using a volatile key and will be lost on restart.");
  }
  const encryptionKey = crypto.createHash('sha256').update(APP_SECRET || crypto.randomBytes(32).toString('hex')).digest();
  const IV_LENGTH = 12;

  function encryptToken(text: string) {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv('aes-256-gcm', encryptionKey, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag();
    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
  }

  function decryptToken(text: string) {
    const parts = text.split(':');
    if (parts.length !== 3) return null;
    const iv = Buffer.from(parts[0], 'hex');
    const authTag = Buffer.from(parts[1], 'hex');
    const encryptedText = Buffer.from(parts[2], 'hex');
    const decipher = crypto.createDecipheriv('aes-256-gcm', encryptionKey, iv);
    decipher.setAuthTag(authTag);
    try {
      let decrypted = decipher.update(encryptedText, undefined, 'utf8');
      decrypted += decipher.final('utf8');
      return decrypted;
    } catch (e) {
      return null;
    }
  }

  // Global tokens cache
  let instagramTokens: string[] = [];
  let instagramHandles: string[] = [];
  if (process.env.INSTAGRAM_ACCESS_TOKEN) {
    instagramTokens[0] = process.env.INSTAGRAM_ACCESS_TOKEN;
  }

  const ACCOUNTS_FILE = path.join(process.cwd(), 'instagram_accounts.json');

  // Load from local JSON file
  async function loadAccounts() {
    try {
      if (fs.existsSync(ACCOUNTS_FILE)) {
        const data = JSON.parse(fs.readFileSync(ACCOUNTS_FILE, 'utf8'));
        for (const item of data) {
          const token = decryptToken(item.encryptedToken);
          if (token && item.accountIndex !== undefined) {
            instagramTokens[item.accountIndex] = token;
            if (item.handle) instagramHandles[item.accountIndex] = item.handle;
          }
        }
        console.log(`Loaded ${instagramTokens.filter(Boolean).length} Instagram accounts from local file.`);
      }
    } catch (e) {
      console.error("Error loading accounts from local file:", e);
    }
  }

  // Save to local JSON file
  async function saveAccount(accountIndex: number, token: string, handle: string = '') {
    try {
      let data: any[] = [];
      if (fs.existsSync(ACCOUNTS_FILE)) {
        data = JSON.parse(fs.readFileSync(ACCOUNTS_FILE, 'utf8'));
      }
      const encryptedToken = encryptToken(token);
      const index = data.findIndex(item => item.accountIndex === accountIndex);
      if (index >= 0) {
        data[index] = { accountIndex, handle, encryptedToken, updatedAt: Date.now() };
      } else {
        data.push({ accountIndex, handle, encryptedToken, updatedAt: Date.now() });
      }
      fs.writeFileSync(ACCOUNTS_FILE, JSON.stringify(data, null, 2));
    } catch (e) {
      console.error("Error saving account to local file:", e);
    }
  }

  // Delete from local JSON file
  async function deleteAccount(accountIndex: number) {
    try {
      if (fs.existsSync(ACCOUNTS_FILE)) {
        let data = JSON.parse(fs.readFileSync(ACCOUNTS_FILE, 'utf8'));
        data = data.filter((item: any) => item.accountIndex !== accountIndex);
        fs.writeFileSync(ACCOUNTS_FILE, JSON.stringify(data, null, 2));
      }
    } catch (e) {
      console.error("Error deleting account from local file:", e);
    }
  }

  // Load accounts immediately
  await loadAccounts();

  app.use(cookieParser());

  // Use large body parser for images/base64, and save rawBody for signature verification
  app.use(express.json({
    limit: "50mb",
    verify: (req: any, res, buf) => {
      req.rawBody = buf.toString();
    }
  }));

  // Helper for GenAI initialization
  const getAi = () => {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY environment variable is missing");
    }
    return new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  };

  // --- Admin Auth Endpoints ---
  // NOTE: /api/auth/login-firebase has been removed — the admin panel now
  // uses username/password only. See AdminPanel.tsx.

  app.post("/api/auth/login", authRateLimit, (req, res) => {
    const { username, password } = req.body;
    const adminUser = process.env.ADMIN_USERNAME;
    const adminPass = process.env.ADMIN_PASSWORD;

    if (!adminUser || !adminPass) {
      res.status(500).json({ error: "Admin credentials not configured on server" });
      return;
    }

    if (username === adminUser && password === adminPass) {
      const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '12h' });
      res.cookie('admin_token', token, { httpOnly: true, secure: true, sameSite: 'none', maxAge: 12 * 60 * 60 * 1000 });
      res.json({ success: true });
    } else {
      res.status(401).json({ error: "Invalid credentials" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    res.clearCookie('admin_token', { httpOnly: true, secure: true, sameSite: 'none' });
    res.json({ success: true });
  });

  app.get("/api/auth/verify", (req, res) => {
    const token = req.cookies?.admin_token;
    if (!token) {
      res.json({ authenticated: false });
      return;
    }

    try {
      jwt.verify(token, JWT_SECRET);
      res.json({ authenticated: true });
    } catch (e) {
      res.json({ authenticated: false });
    }
  });

  // All Gemini/AI endpoints are admin-only: they consume paid API credits
  // and are not meant to be called directly by site visitors.
  app.use("/api/gemini", apiRateLimit, requireAdmin);
  app.use("/api/ai-messaging", apiRateLimit, requireAdmin);

  // 1. Text / Content Generation (for magic mode and ads)
  app.post("/api/gemini/generate", async (req, res) => {
    try {
      const { prompt, systemInstruction, model = "gemini-3.5-flash", isMagic = false } = req.body;
      const ai = getAi();

      const targetModel = isMagic ? "gemini-3.1-pro-preview" : model;

      const response = await ai.models.generateContent({
        model: targetModel,
        contents: prompt,
        config: systemInstruction ? { systemInstruction } : undefined,
      });
      res.json({ text: response.text });
    } catch (error: any) {
      console.error("Text Gen Error:", error);
      res.status(500).json({ error: error.message || "Failed to generate text" });
    }
  });

  // 2. Image Generation
  app.post("/api/gemini/image", async (req, res) => {
    try {
      const { prompt, negativePrompt, aspectRatio = "1:1", imageSize = "1K", numImages = 1 } = req.body;
      const ai = getAi();

      const fullPrompt = negativePrompt ? `${prompt} \n\nDO NOT INCLUDE: ${negativePrompt}` : prompt;

      const interaction = await ai.interactions.create({
        model: "gemini-3.1-flash-image",
        input: fullPrompt,
        response_modalities: ['image', 'text'],
        generation_config: {
          image_config: {
            aspect_ratio: aspectRatio,
            image_size: imageSize
          },
        },
      });

      // Find image part
      let imageBase64 = null;
      let mimeType = 'image/png';
      for (const step of interaction.steps) {
        if (step.type === 'model_output') {
          const imageContent = step.content?.find(c => c.type === 'image');
          if (imageContent && imageContent.data) {
            imageBase64 = imageContent.data;
            mimeType = imageContent.mime_type || 'image/png';
            break;
          }
        }
      }

      if (imageBase64) {
        res.json({ image: `data:${mimeType};base64,${imageBase64}` });
      } else {
        throw new Error("No image generated");
      }
    } catch (error: any) {
      console.error("Image Gen Error:", error);
      res.status(500).json({ error: error.message || "Failed to generate image" });
    }
  });

  // 3. Video Generation (Start)
  app.post("/api/gemini/video-start", async (req, res) => {
    try {
      const { prompt, firstFrame, lastFrame, aspectRatio = "16:9", resolution = "1080p", quality = "lite" } = req.body;
      const ai = getAi();

      const config: any = {
        numberOfVideos: 1,
        resolution,
        aspectRatio,
      };

      if (lastFrame) {
        config.lastFrame = {
          imageBytes: lastFrame.split(",")[1],
          mimeType: "image/jpeg",
        };
      }

      let imageConfig = undefined;
      if (firstFrame) {
        imageConfig = {
          imageBytes: firstFrame.split(",")[1],
          mimeType: "image/jpeg",
        };
      }

      const targetModel = quality === "high" ? "veo-3.1-generate-preview" : "veo-3.1-lite-generate-preview";

      const operation = await ai.models.generateVideos({
        model: targetModel,
        prompt: prompt,
        image: imageConfig,
        config,
      });

      res.json({ operationName: operation.name });
    } catch (error: any) {
      console.error("Video Gen Start Error:", error);
      res.status(500).json({ error: error.message || "Failed to start video generation" });
    }
  });

  // 4. Video Generation (Poll Status)
  app.post("/api/gemini/video-status", async (req, res) => {
    try {
      const { operationName } = req.body;
      const ai = getAi();

      const op = new GenerateVideosOperation();
      op.name = operationName;

      const updated = await ai.operations.getVideosOperation({ operation: op });
      res.json({ done: updated.done });
    } catch (error: any) {
      console.error("Video Gen Status Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // 5. Video Generation (Download)
  app.post("/api/gemini/video-download", async (req, res) => {
    try {
      const { operationName } = req.body;
      const ai = getAi();

      const op = new GenerateVideosOperation();
      op.name = operationName;

      const updated = await ai.operations.getVideosOperation({ operation: op });
      const uri = updated.response?.generatedVideos?.[0]?.video?.uri;

      if (!uri) {
        throw new Error("Video URI not available");
      }

      const videoRes = await fetch(uri, {
        headers: { "x-goog-api-key": process.env.GEMINI_API_KEY! },
      });

      res.setHeader("Content-Type", "video/mp4");
      const buffer = await videoRes.arrayBuffer();
      res.send(Buffer.from(buffer));
    } catch (error: any) {
      console.error("Video Download Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // 6. Text-to-Speech (TTS)
  app.post("/api/gemini/tts", async (req, res) => {
    try {
      const { prompt, voiceName = "Kore", lang = "ru", speed = 1.0, pitch = 1.0 } = req.body;
      const ai = getAi();

      let finalPrompt = prompt;
      let configLang = "ru-RU";
      if (lang === 'hy') {
        finalPrompt = `Please speak the following text clearly and naturally in Armenian language: \n\n${prompt}`;
        configLang = "hy-AM";
      } else if (lang === 'en') {
        finalPrompt = `Please speak the following text clearly and naturally in English: \n\n${prompt}`;
        configLang = "en-US";
      } else if (lang === 'ru') {
        finalPrompt = `Пожалуйста, произнеси следующий текст четко и естественно на русском языке: \n\n${prompt}`;
      }

      const response = await ai.models.generateContent({
        model: "gemini-3.1-flash-tts-preview",
        contents: [{ parts: [{ text: finalPrompt }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName },
            },
          },
        },
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

      if (base64Audio) {
        const pcmBuffer = Buffer.from(base64Audio, 'base64');
        const wavBuffer = encodeWAV(pcmBuffer, 24000, 1, 16);
        res.json({ audio: `data:audio/wav;base64,${wavBuffer.toString('base64')}` });
      } else {
        throw new Error("Failed to generate audio");
      }
    } catch (error: any) {
      console.error("TTS Error:", error);
      res.status(500).json({ error: error.message || "Failed to generate TTS" });
    }
  });

  // 7. Podcast Mode TTS (Multi-speaker)
  app.post("/api/gemini/podcast", async (req, res) => {
    try {
      const { prompt, speaker1 = "Joe", speaker2 = "Jane", voice1 = "Kore", voice2 = "Puck", lang = "ru" } = req.body;
      const ai = getAi();

      let instructionPrefix = "";
      if (lang === 'hy') {
        instructionPrefix = "Please speak the following podcast script clearly and naturally in Armenian language. Maintain the characters and flow:\n\n";
      } else if (lang === 'en') {
        instructionPrefix = "Please speak the following podcast script clearly and naturally in English. Maintain the characters and flow:\n\n";
      } else {
        instructionPrefix = "Пожалуйста, произнеси следующий сценарий подкаста четко и естественно на русском языке. Сохраняй интонации персонажей:\n\n";
      }

      const finalPrompt = instructionPrefix + prompt;

      const response = await ai.models.generateContent({
        model: "gemini-3.1-flash-tts-preview",
        contents: [{ parts: [{ text: finalPrompt }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            multiSpeakerVoiceConfig: {
              speakerVoiceConfigs: [
                {
                  speaker: speaker1,
                  voiceConfig: { prebuiltVoiceConfig: { voiceName: voice1 } }
                },
                {
                  speaker: speaker2,
                  voiceConfig: { prebuiltVoiceConfig: { voiceName: voice2 } }
                }
              ]
            }
          }
        }
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

      if (base64Audio) {
        const pcmBuffer = Buffer.from(base64Audio, 'base64');
        const wavBuffer = encodeWAV(pcmBuffer, 24000, 1, 16);
        res.json({ audio: `data:audio/wav;base64,${wavBuffer.toString('base64')}` });
      } else {
        throw new Error("Failed to generate podcast audio");
      }
    } catch (error: any) {
      console.error("Podcast TTS Error:", error);
      res.status(500).json({ error: error.message || "Failed to generate podcast" });
    }
  });

  // 8. Instagram Basic Display API Integration
  // Token management is admin-only; /api/instagram/posts stays public since it
  // only returns already-public media (no tokens) and feeds the homepage carousel.
  app.post("/api/instagram/token", apiRateLimit, requireAdmin, async (req, res) => {
    const { token, accountIndex = 0, handle = '' } = req.body;
    if (!token) {
      return res.status(400).json({ error: "Token is required" });
    }
    instagramTokens[accountIndex] = token;
    instagramHandles[accountIndex] = handle;
    await saveAccount(accountIndex, token, handle);
    res.json({ success: true, message: "Token stored securely" });
  });

  app.post("/api/instagram/token/remove", apiRateLimit, requireAdmin, async (req, res) => {
    const { accountIndex } = req.body;
    if (accountIndex !== undefined && accountIndex >= 0 && accountIndex < instagramTokens.length) {
       instagramTokens[accountIndex] = '';
       instagramHandles[accountIndex] = '';
       await deleteAccount(accountIndex);
    }
    res.json({ success: true, message: "Token removed" });
  });

  app.get("/api/instagram/status", requireAdmin, (req, res) => {
    const status = [0, 1].map(index => {
      return {
        accountIndex: index,
        connected: !!instagramTokens[index] && instagramTokens[index].trim() !== "",
        handle: instagramHandles[index] || ''
      };
    });
    res.json(status);
  });

  app.get("/api/instagram/posts", async (req, res) => {
    try {
      // PRIORITY 1: Read from instagram_media table (populated by the OAuth
      // flow + /api/meta/sync-instagram endpoint). This is the recommended
      // path — no live Meta API calls on every page load, just a DB read.
      const { data: mediaRows, error: mediaErr } = await supabaseAdmin
        .from('instagram_media')
        .select('id, caption, media_type, media_url, thumbnail_url, permalink, timestamp')
        .order('timestamp', { ascending: false })
        .limit(24);

      if (!mediaErr && mediaRows && mediaRows.length > 0) {
        const posts = mediaRows.map((post: any) => ({
          id: post.id,
          image: post.media_type === 'VIDEO' ? post.thumbnail_url || post.media_url : post.media_url,
          link: post.permalink,
          likes: 0,  // IG Graph API doesn't expose likes without additional queries
          comments: 0,
          caption: post.caption || "Instagram Post"
        }));
        return res.json({ posts, source: 'synced' });
      }

      // PRIORITY 2 (fallback): Legacy token-based fetch for the old manual
      // Instagram Connect flow. Will be deprecated once everyone migrates
      // to the OAuth flow.
      const validTokens = instagramTokens.filter(t => t && t.trim() !== "");
      if (validTokens.length === 0) {
        // No synced media AND no manual tokens → return empty array (not 401)
        // so the homepage carousel just shows an empty state instead of erroring.
        return res.json({ posts: [], source: 'empty' });
      }

      let allPosts: any[] = [];

      for (const token of validTokens) {
        try {
          const mediaResponse = await fetch(`https://graph.instagram.com/me/media?fields=id,caption,media_type,media_url,thumbnail_url,permalink,timestamp&access_token=${token}`);
          if (mediaResponse.ok) {
             const mediaData = await mediaResponse.json();
             if (mediaData.data && Array.isArray(mediaData.data)) {
                 allPosts = [...allPosts, ...mediaData.data];
             }
          } else {
             console.error("Failed to fetch posts for one token", await mediaResponse.text());
          }
        } catch (err) {
          console.error("Error fetching for a token", err);
        }
      }

      // Sort by timestamp descending
      allPosts.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      // Deduplicate by ID just in case
      const uniquePostsMap = new Map();
      allPosts.forEach(post => {
          if (!uniquePostsMap.has(post.id)) {
              uniquePostsMap.set(post.id, post);
          }
      });
      allPosts = Array.from(uniquePostsMap.values());

      // Format to match our InstagramPost interface
      const posts = allPosts.map((post: any) => ({
        id: post.id,
        image: post.media_type === 'VIDEO' ? post.thumbnail_url || post.media_url : post.media_url,
        link: post.permalink,
        likes: 0,
        comments: 0,
        caption: post.caption || "Instagram Post"
      }));

      res.json({ posts, source: 'legacy' });
    } catch (error: any) {
      console.error("Instagram API Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // 9. AI Messaging Webhooks (Instagram & WhatsApp)
  app.use("/api/webhooks/instagram", createInstagramWebhookRoute({ getAi }));
  app.use("/api/webhooks/whatsapp", createWhatsappWebhookRoute({ getAi }));

  // AI Classification and Generation Endpoint (manual/preview use from the admin UI)
  app.post("/api/ai-messaging/process", async (req, res) => {
    try {
      const { message, knowledgeBase } = req.body;
      const ai = getAi();
      const { draftAIReply } = await import("./src/server/messaging/aiDraft.js");

      const parsed = await draftAIReply(ai, message, knowledgeBase || []);
      res.json(parsed);
    } catch (error: any) {
      console.error("AI Messaging Process Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Sends an approved reply to the customer via the real channel (WhatsApp/Instagram)
  // and records it on the thread. Requires the relevant Meta credentials to be set;
  // returns a clear error otherwise instead of silently "succeeding".
  app.post("/api/ai-messaging/send", async (req, res) => {
    try {
      const { threadId, messageId, finalReply } = req.body;
      if (!threadId || !messageId || !finalReply) {
        return res.status(400).json({ error: "threadId, messageId and finalReply are required" });
      }

      const thread = await getThread(threadId);
      if (!thread) {
        return res.status(404).json({ error: "Thread not found" });
      }
      const channel = thread.channel as string;

      if (channel === 'whatsapp') {
        await sendWhatsAppText(thread.customer_handle as string, finalReply);
      } else if (channel === 'instagram') {
        await sendInstagramText(thread.customer_handle as string, finalReply);
      } else {
        return res.status(400).json({ error: `Unknown channel: ${channel}` });
      }

      await markMessageAnswered(threadId, messageId, finalReply);
      res.json({ success: true });
    } catch (error: any) {
      console.error("AI Messaging Send Error:", error);
      const status = error instanceof MetaSendError ? 502 : 500;
      res.status(status).json({ error: error.message || "Failed to send reply" });
    }
  });

  // 10. AI Knowledge CRUD (admin-only). The admin UI calls these instead of
  // writing to Supabase directly, since RLS blocks anon writes on
  // ai_knowledge.
  app.post("/api/ai-messaging/knowledge", async (req, res) => {
    try {
      const item = req.body;
      const now = Date.now();
      const { data, error } = await supabaseAdmin
        .from('ai_knowledge')
        .insert({ ...item, created_at: now, updated_at: now })
        .select('id')
        .single();
      if (error) throw error;
      res.json({ id: data.id });
    } catch (e: any) {
      console.error('Add knowledge error:', e);
      res.status(500).json({ error: e.message });
    }
  });

  app.patch("/api/ai-messaging/knowledge/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const patch = { ...req.body, updated_at: Date.now() };
      // Never allow overwriting the PK or timestamps from the client.
      delete patch.id;
      delete patch.created_at;
      const { error } = await supabaseAdmin
        .from('ai_knowledge')
        .update(patch)
        .eq('id', id);
      if (error) throw error;
      res.json({ success: true });
    } catch (e: any) {
      console.error('Update knowledge error:', e);
      res.status(500).json({ error: e.message });
    }
  });

  app.delete("/api/ai-messaging/knowledge/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { error } = await supabaseAdmin
        .from('ai_knowledge')
        .delete()
        .eq('id', id);
      if (error) throw error;
      res.json({ success: true });
    } catch (e: any) {
      console.error('Delete knowledge error:', e);
      res.status(500).json({ error: e.message });
    }
  });

  // 12. AI Templates CRUD (admin-only). Stores canned responses for the AI to
  // match incoming intents against. Kept in the public.ai_templates table.
  app.post("/api/ai-messaging/templates", async (req, res) => {
    try {
      const item = req.body || {};
      const now = Date.now();
      const { data, error } = await supabaseAdmin
        .from('ai_templates')
        .insert({ ...item, created_at: now, updated_at: now })
        .select('id')
        .single();
      if (error) throw error;
      res.json({ id: data.id });
    } catch (e: any) {
      console.error('Add template error:', e);
      res.status(500).json({ error: e.message });
    }
  });

  app.patch("/api/ai-messaging/templates/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const patch = { ...req.body, updated_at: Date.now() };
      delete patch.id;
      delete patch.created_at;
      const { error } = await supabaseAdmin
        .from('ai_templates')
        .update(patch)
        .eq('id', id);
      if (error) throw error;
      res.json({ success: true });
    } catch (e: any) {
      console.error('Update template error:', e);
      res.status(500).json({ error: e.message });
    }
  });

  app.delete("/api/ai-messaging/templates/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { error } = await supabaseAdmin
        .from('ai_templates')
        .delete()
        .eq('id', id);
      if (error) throw error;
      res.json({ success: true });
    } catch (e: any) {
      console.error('Delete template error:', e);
      res.status(500).json({ error: e.message });
    }
  });

  // 13. Update message status from the admin Inbox (mark as needs_human / ignored / etc).
  app.patch("/api/ai-messaging/threads/:threadId/messages/:messageId/status", async (req, res) => {
    try {
      const { threadId, messageId } = req.params;
      const { status, requires_human } = req.body;
      const now = Date.now();
      const patch: Record<string, any> = { status };
      if (requires_human !== undefined) patch.requires_human = requires_human;

      const { error: msgErr } = await supabaseAdmin
        .from('ai_messages')
        .update(patch)
        .eq('id', messageId)
        .eq('thread_id', threadId);
      if (msgErr) throw msgErr;

      const { error: threadErr } = await supabaseAdmin
        .from('ai_threads')
        .update({ status, updated_at: now })
        .eq('id', threadId);
      if (threadErr) throw threadErr;

      res.json({ success: true });
    } catch (e: any) {
      console.error('Update message status error:', e);
      res.status(500).json({ error: e.message });
    }
  });

  // ---------------------------------------------------------------------------
  // Meta OAuth flow for Instagram integration
  // ---------------------------------------------------------------------------
  // Endpoints:
  //   GET  /api/meta/oauth/start         — initiates OAuth (redirects to Facebook)
  //   GET  /api/meta/oauth/callback      — Meta redirects here with ?code=
  //   POST /api/meta/oauth/select-page   — admin picks which FB page to use
  //   POST /api/meta/oauth/disconnect    — removes the integration
  //   GET  /api/meta/oauth/status        — current integration status (no tokens)
  //   POST /api/meta/sync-instagram      — sync latest IG media into instagram_media
  //
  // State + pending OAuth session are stored in HTTP-only cookies to prevent
  // CSRF. Tokens are AES-256-GCM encrypted in the DB (see src/server/lib/crypto.ts).
  // The browser NEVER sees access_token values.
  // ---------------------------------------------------------------------------

  const { generateState } = await import('./src/server/lib/crypto.js');
  const {
    buildAuthUrl,
    exchangeCodeForShortLivedToken,
    inspectToken,
    exchangeForLongLivedToken,
    fetchFacebookPages,
    fetchInstagramAccount,
    fetchInstagramMedia,
    buildIntegrationRecord,
    isMetaOAuthConfigured,
    REQUIRED_SCOPES,
  } = await import('./src/server/meta/oauthFlow.js');
  const { encryptToken: encryptForOAuth, decryptToken: decryptForOAuth } = await import('./src/server/lib/crypto.js');

  // Cookie names + constants
  const OAUTH_STATE_COOKIE = 'meta_oauth_state';
  const OAUTH_PENDING_COOKIE = 'meta_oauth_pending';
  const OAUTH_COOKIE_MAX_AGE = 10 * 60; // 10 minutes

  /**
   * GET /api/meta/oauth/start
   * Generates a CSRF state, stores it in an HTTP-only cookie, and redirects
   * the browser to Facebook's OAuth dialog.
   */
  app.get("/api/meta/oauth/start", apiRateLimit, requireAdmin, (req, res) => {
    if (!isMetaOAuthConfigured()) {
      return res.status(500).send(
        renderOAuthErrorPage(
          'Meta OAuth not configured',
          'META_APP_ID, META_APP_SECRET, and META_REDIRECT_URI environment variables must be set on the server.'
        )
      );
    }
    const state = generateState();
    res.cookie(OAUTH_STATE_COOKIE, state, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',  // must be lax so the redirect from facebook.com carries the cookie
      maxAge: OAUTH_COOKIE_MAX_AGE,
    });
    const authUrl = buildAuthUrl(state);
    res.redirect(authUrl);
  });

  /**
   * GET /api/meta/oauth/callback
   * Meta redirects here with ?code=...&state=... after the user authorizes.
   *
   * Flow:
   *   1. Verify state matches the cookie (CSRF protection).
   *   2. Exchange code → short-lived token.
   *   3. Inspect token → check scopes are present.
   *   4. Exchange short-lived → long-lived (~60 days).
   *   5. Fetch /me/accounts → list of FB pages.
   *   6. If 0 pages → error page.
   *   7. If 1 page → save integration directly, redirect to admin.
   *   8. If >1 pages → render HTML page picker. Each page button POSTs to
   *      /api/meta/oauth/select-page with the chosen page_id.
   */
  app.get("/api/meta/oauth/callback", async (req, res) => {
    const { code, state } = req.query as { code?: string; state?: string };
    const cookieState = req.cookies?.[OAUTH_STATE_COOKIE];

    // Always clear the state cookie now that we've used it
    res.clearCookie(OAUTH_STATE_COOKIE);

    if (!code || !state) {
      return res.send(renderOAuthErrorPage('Authorization cancelled', 'No code or state was returned by Meta.'));
    }
    if (!cookieState || cookieState !== state) {
      return res.send(renderOAuthErrorPage('Invalid state', 'CSRF state mismatch. Please try connecting again.'));
    }

    try {
      // 1. Exchange code → short-lived token
      const shortLived = await exchangeCodeForShortLivedToken(code);

      // 2. Inspect to get granted scopes
      const inspection = await inspectToken(shortLived);
      if (!inspection.isValid) {
        return res.send(renderOAuthErrorPage('Invalid token', 'Meta returned an invalid access token.'));
      }

      // 3. Verify required scopes were granted
      const missingScopes = REQUIRED_SCOPES.filter((s) => !inspection.scopes.includes(s));
      if (missingScopes.length > 0) {
        return res.send(renderOAuthErrorPage(
          'Missing required permissions',
          `The following permissions were not granted: ${missingScopes.join(', ')}. Please reconnect and approve all requested permissions.`
        ));
      }

      // 4. Exchange → long-lived
      const longLived = await exchangeForLongLivedToken(shortLived);

      // 5. Fetch FB pages
      const pages = await fetchFacebookPages(longLived.accessToken);
      if (pages.length === 0) {
        return res.send(renderOAuthErrorPage(
          'No Facebook Page found',
          'Your Facebook account does not manage any Pages. Create or be assigned as an admin to a Facebook Page linked to your Instagram Business Account, then try again.'
        ));
      }

      // 6. Single page → save directly
      if (pages.length === 1) {
        const record = await buildIntegrationRecord(pages[0], longLived.accessToken, inspection.scopes);
        await upsertIntegration(record);
        return res.redirect('/hy/admin?meta_oauth=success');
      }

      // 7. Multiple pages → render HTML page picker
      // Store the long-lived token + scopes in a short-lived cookie so the
      // followup POST /api/meta/oauth/select-page can use it without re-doing
      // the OAuth dance. The cookie value is the encrypted token.
      const pendingPayload = JSON.stringify({
        token: encryptForOAuth(longLived.accessToken),
        expiresAt: longLived.expiresAt.toISOString(),
        scopes: inspection.scopes,
        pages: pages.map((p) => ({ id: p.id, name: p.name, hasIg: !!p.instagram_business_account })),
      });
      res.cookie(OAUTH_PENDING_COOKIE, pendingPayload, {
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        maxAge: 5 * 60, // 5 minutes — just enough to pick a page
      });
      return res.send(renderPagePicker(pages));
    } catch (e: any) {
      console.error('[meta/oauth] callback error:', e.message);
      return res.send(renderOAuthErrorPage('OAuth failed', e.message || String(e)));
    }
  });

  /**
   * POST /api/meta/oauth/select-page
   * Body: { pageId: string }
   *
   * Uses the pending OAuth cookie (set by /callback) to fetch the chosen
   * page's access token, then saves the integration. The pending cookie is
   * consumed and cleared.
   */
  app.post("/api/meta/oauth/select-page", apiRateLimit, requireAdmin, async (req, res) => {
    const { pageId } = req.body || {};
    if (!pageId) {
      return res.status(400).json({ error: 'pageId is required' });
    }

    const pendingCookie = req.cookies?.[OAUTH_PENDING_COOKIE];
    res.clearCookie(OAUTH_PENDING_COOKIE);
    if (!pendingCookie) {
      return res.status(400).json({ error: 'Pending OAuth session expired. Please reconnect.' });
    }

    try {
      const pending = JSON.parse(pendingCookie);
      const userToken = decryptForOAuth(pending.token);
      if (!userToken) {
        return res.status(400).json({ error: 'Failed to decrypt pending token. Please reconnect.' });
      }

      // Re-fetch pages (the page access_token wasn't cached for security).
      const pages = await fetchFacebookPages(userToken);
      const page = pages.find((p) => p.id === pageId);
      if (!page) {
        return res.status(400).json({ error: 'Selected page no longer available. Please reconnect.' });
      }

      const record = await buildIntegrationRecord(page, userToken, pending.scopes || []);
      await upsertIntegration(record);
      res.json({ success: true });
    } catch (e: any) {
      console.error('[meta/oauth] select-page error:', e.message);
      res.status(500).json({ error: e.message || 'Failed to save integration' });
    }
  });

  /**
   * POST /api/meta/oauth/disconnect
   * Marks the active integration as 'disconnected' (soft delete — keeps the
   * row for audit). Tokens are scrubbed.
   */
  app.post("/api/meta/oauth/disconnect", apiRateLimit, requireAdmin, async (req, res) => {
    try {
      const { error } = await supabaseAdmin
        .from('social_integrations')
        .update({
          status: 'disconnected',
          access_token_encrypted: '',
          last_error: 'Disconnected by admin on ' + new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('provider', 'instagram')
        .eq('status', 'active');
      if (error) throw error;
      res.json({ success: true });
    } catch (e: any) {
      console.error('[meta/oauth] disconnect error:', e.message);
      res.status(500).json({ error: e.message });
    }
  });

  /**
   * GET /api/meta/oauth/status
   * Returns the current Instagram integration status. NEVER includes the
   * access_token — only metadata the admin UI needs.
   */
  app.get("/api/meta/oauth/status", apiRateLimit, requireAdmin, async (req, res) => {
    try {
      const { data, error } = await supabaseAdmin
        .from('social_integrations')
        .select('id, facebook_page_id, facebook_page_name, instagram_account_id, instagram_username, instagram_profile_pic, token_type, token_expires_at, granted_scopes, status, last_sync_at, last_error, created_at')
        .eq('provider', 'instagram')
        .eq('status', 'active')
        .maybeSingle();
      if (error) throw error;
      if (!data) {
        return res.json({ connected: false, oauth_configured: isMetaOAuthConfigured() });
      }
      // Detect token expiry
      const now = new Date();
      const expiresAt = data.token_expires_at ? new Date(data.token_expires_at) : null;
      const isExpired = expiresAt ? expiresAt.getTime() < now.getTime() : false;
      res.json({
        connected: true,
        oauth_configured: isMetaOAuthConfigured(),
        integration: {
          id: data.id,
          facebook_page_id: data.facebook_page_id,
          facebook_page_name: data.facebook_page_name,
          instagram_account_id: data.instagram_account_id,
          instagram_username: data.instagram_username,
          instagram_profile_pic: data.instagram_profile_pic,
          token_type: data.token_type,
          token_expires_at: data.token_expires_at,
          granted_scopes: data.granted_scopes,
          last_sync_at: data.last_sync_at,
          last_error: data.last_error,
          created_at: data.created_at,
          is_expired: isExpired,
        },
      });
    } catch (e: any) {
      console.error('[meta/oauth] status error:', e.message);
      res.status(500).json({ error: e.message });
    }
  });

  /**
   * POST /api/meta/sync-instagram
   * Pulls the latest IG media for the active integration and stores it in
   * public.instagram_media. Triggered manually from the admin UI ("Sync now"
   * button) or by a future cron.
   */
  app.post("/api/meta/sync-instagram", apiRateLimit, requireAdmin, async (req, res) => {
    try {
      const { data: integration, error } = await supabaseAdmin
        .from('social_integrations')
        .select('id, instagram_account_id, access_token_encrypted')
        .eq('provider', 'instagram')
        .eq('status', 'active')
        .maybeSingle();
      if (error) throw error;
      if (!integration || !integration.instagram_account_id) {
        return res.status(400).json({ error: 'No active Instagram integration found.' });
      }

      const pageAccessToken = decryptForOAuth(integration.access_token_encrypted);
      if (!pageAccessToken) {
        return res.status(500).json({ error: 'Failed to decrypt stored access token. Please reconnect.' });
      }

      const media = await fetchInstagramMedia(integration.instagram_account_id, pageAccessToken, 24);

      // Upsert media (replace existing rows for this integration)
      await supabaseAdmin.from('instagram_media').delete().eq('integration_id', integration.id);
      if (media.length > 0) {
        const rows = media.map((m) => ({
          id: m.id,
          integration_id: integration.id,
          caption: m.caption || '',
          media_type: m.media_type,
          media_url: m.media_url,
          thumbnail_url: m.thumbnail_url,
          permalink: m.permalink,
          timestamp: new Date(m.timestamp).toISOString(),
          synced_at: new Date().toISOString(),
        }));
        const { error: upErr } = await supabaseAdmin.from('instagram_media').upsert(rows, { onConflict: 'id' });
        if (upErr) throw upErr;
      }

      await supabaseAdmin
        .from('social_integrations')
        .update({ last_sync_at: new Date().toISOString(), last_error: null, updated_at: new Date().toISOString() })
        .eq('id', integration.id);

      res.json({ success: true, synced: media.length });
    } catch (e: any) {
      console.error('[meta/oauth] sync error:', e.message);
      // Record the error on the integration row so the admin UI can display it
      await supabaseAdmin
        .from('social_integrations')
        .update({ last_error: e.message?.slice(0, 500), updated_at: new Date().toISOString() })
        .eq('provider', 'instagram')
        .eq('status', 'active');
      res.status(500).json({ error: e.message });
    }
  });

  /** Helper: upsert an integration record (replaces any existing active one). */
  async function upsertIntegration(record: any): Promise<void> {
    // Mark any existing active integration as disconnected
    await supabaseAdmin
      .from('social_integrations')
      .update({ status: 'disconnected', updated_at: new Date().toISOString() })
      .eq('provider', 'instagram')
      .eq('status', 'active');
    // Insert the new one
    const { error } = await supabaseAdmin
      .from('social_integrations')
      .insert({
        provider: 'instagram',
        ...record,
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    if (error) throw new Error(`Failed to save integration: ${error.message}`);
  }

  /** Helper: render a minimal HTML error page (used during OAuth callback). */
  function renderOAuthErrorPage(title: string, message: string): string {
    const adminUrl = '/hy/admin?meta_oauth=error&msg=' + encodeURIComponent(message);
    return `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Instagram connection error</title>
<style>body{background:#080808;color:#F5F5F5;font-family:system-ui,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;padding:1rem;}
.box{max-width:500px;text-align:center;background:#111;border:1px solid rgba(200,155,78,0.35);border-radius:24px;padding:2.5rem;}
h1{color:#C89B4E;font-size:1.5rem;margin:0 0 1rem;font-family:Georgia,serif;}
p{color:rgba(245,245,245,0.7);line-height:1.6;margin:0 0 1.5rem;font-size:0.95rem;}
a{display:inline-block;background:#C89B4E;color:#111;text-decoration:none;padding:0.75rem 1.5rem;border-radius:9999px;font-weight:500;font-size:0.9rem;}
</style></head><body><div class="box"><h1>${escapeHtml(title)}</h1><p>${escapeHtml(message)}</p><a href="${adminUrl}">Back to admin</a></div>
<script>setTimeout(function(){window.location.href='${adminUrl}';},5000);</script>
</body></html>`;
  }

  /** Helper: render the multi-page picker. */
  function renderPagePicker(pages: any[]): string {
    const items = pages.map((p) => {
      const igBadge = p.instagram_business_account
        ? '<span style="color:#C89B4E;font-size:0.8rem;margin-left:0.5rem;">Instagram linked</span>'
        : '<span style="color:rgba(245,245,245,0.4);font-size:0.8rem;margin-left:0.5rem;">No Instagram</span>';
      return `
        <form method="POST" action="/api/meta/oauth/select-page" style="margin:0;">
          <input type="hidden" name="pageId" value="${escapeHtml(p.id)}" />
          <button type="submit" style="display:flex;align-items:center;justify-content:space-between;width:100%;background:#111;border:1px solid rgba(200,155,78,0.25);border-radius:16px;padding:1rem 1.25rem;color:#F5F5F5;cursor:pointer;text-align:left;font-size:0.95rem;margin-bottom:0.5rem;transition:border-color 0.2s;" onmouseover="this.style.borderColor='#C89B4E'" onmouseout="this.style.borderColor='rgba(200,155,78,0.25)'">
            <span><strong>${escapeHtml(p.name)}</strong>${igBadge}</span>
            <span style="color:#C89B4E;">Select →</span>
          </button>
        </form>`;
    }).join('');
    return `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Select Facebook Page</title>
<style>body{background:#080808;color:#F5F5F5;font-family:system-ui,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;padding:1rem;}
.box{max-width:520px;width:100%;background:#111;border:1px solid rgba(200,155,78,0.35);border-radius:24px;padding:2.5rem;}
h1{color:#C89B4E;font-size:1.5rem;margin:0 0 0.5rem;font-family:Georgia,serif;text-align:center;}
p.subtitle{color:rgba(245,245,245,0.6);text-align:center;margin:0 0 1.5rem;font-size:0.9rem;}
.pages{display:flex;flex-direction:column;}
</style></head><body><div class="box"><h1>Select a Facebook Page</h1><p class="subtitle">Your Facebook account manages multiple Pages. Choose the one linked to your Instagram Business Account.</p><div class="pages">${items}</div></div></body></html>`;
  }

  function escapeHtml(s: string): string {
    return String(s).replace(/[&<>"']/g, (c) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]!));
  }

  // ---------------------------------------------------------------------------
  // Meta OAuth flow for WhatsApp Cloud API integration
  // ---------------------------------------------------------------------------
  // Endpoints:
  //   GET  /api/meta/whatsapp/oauth/start       — initiates OAuth (redirects to FB)
  //   GET  /api/meta/whatsapp/oauth/callback    — Meta redirects here with ?code=
  //   POST /api/meta/whatsapp/oauth/select      — admin picks WABA + phone number
  //   POST /api/meta/whatsapp/disconnect        — removes the integration
  //   GET  /api/meta/whatsapp/status            — current integration status
  //   POST /api/admin/whatsapp/send-test        — send a test message
  //
  // Stored in social_integrations with provider='whatsapp'. Tokens AES-256-GCM
  // encrypted, never exposed to the browser.
  // ---------------------------------------------------------------------------

  const {
    buildWhatsAppAuthUrl,
    exchangeCodeForShortLivedToken: waExchangeShort,
    inspectToken: waInspect,
    exchangeForLongLivedToken: waExchangeLong,
    fetchWhatsAppBusinessAccounts,
    fetchPhoneNumbers,
    subscribeAppToWaba,
    sendWhatsAppTextMessage,
    buildWhatsAppIntegrationRecord,
    isWhatsAppOAuthConfigured,
    WHATSAPP_REQUIRED_SCOPES,
  } = await import('./src/server/meta/whatsappOauthFlow.js');

  const WA_STATE_COOKIE = 'meta_wa_oauth_state';
  const WA_PENDING_COOKIE = 'meta_wa_oauth_pending';

  /**
   * GET /api/meta/whatsapp/oauth/start
   * Generates a CSRF state, stores it in an HTTP-only cookie, redirects to FB.
   */
  app.get("/api/meta/whatsapp/oauth/start", apiRateLimit, requireAdmin, (req, res) => {
    if (!isWhatsAppOAuthConfigured()) {
      return res.status(500).send(
        renderOAuthErrorPage(
          'Meta OAuth not configured',
          'META_APP_ID, META_APP_SECRET, and META_WHATSAPP_REDIRECT_URI (or META_REDIRECT_URI) environment variables must be set on the server.'
        )
      );
    }
    const state = generateState();
    res.cookie(WA_STATE_COOKIE, state, {
      httpOnly: true, secure: true, sameSite: 'lax', maxAge: 10 * 60,
    });
    res.redirect(buildWhatsAppAuthUrl(state));
  });

  /**
   * GET /api/meta/whatsapp/oauth/callback
   * Meta redirects here with ?code=...&state=... after the user authorizes.
   *
   * Flow:
   *   1. Verify state.
   *   2. Exchange code → short-lived → long-lived.
   *   3. Verify required scopes.
   *   4. Fetch businesses + WABAs.
   *   5. For each WABA, fetch phone numbers.
   *   6. Flatten into a list of (WABA, phone) pairs.
   *   7. If 0 pairs → error page.
   *   8. If 1 pair → save integration + subscribe webhook, redirect to admin.
   *   9. If >1 pairs → render HTML picker.
   */
  app.get("/api/meta/whatsapp/oauth/callback", async (req, res) => {
    const { code, state } = req.query as { code?: string; state?: string };
    const cookieState = req.cookies?.[WA_STATE_COOKIE];
    res.clearCookie(WA_STATE_COOKIE);

    if (!code || !state) {
      return res.send(renderOAuthErrorPage('Authorization cancelled', 'No code or state was returned by Meta.'));
    }
    if (!cookieState || cookieState !== state) {
      return res.send(renderOAuthErrorPage('Invalid state', 'CSRF state mismatch. Please try connecting again.'));
    }

    try {
      const shortLived = await waExchangeShort(code);
      const inspection = await waInspect(shortLived);
      if (!inspection.isValid) {
        return res.send(renderOAuthErrorPage('Invalid token', 'Meta returned an invalid access token.'));
      }
      const missingScopes = WHATSAPP_REQUIRED_SCOPES.filter((s) => !inspection.scopes.includes(s));
      if (missingScopes.length > 0) {
        return res.send(renderOAuthErrorPage(
          'Missing required permissions',
          `The following permissions were not granted: ${missingScopes.join(', ')}. Please reconnect and approve all requested permissions.`
        ));
      }
      const longLived = await waExchangeLong(shortLived);
      const { wabas } = await fetchWhatsAppBusinessAccounts(longLived.accessToken);
      if (wabas.length === 0) {
        return res.send(renderOAuthErrorPage(
          'No WhatsApp Business Account found',
          'Your Facebook account does not manage any WhatsApp Business Accounts. Create or be added to a WhatsApp Business Account, then try again.'
        ));
      }

      // For each WABA, fetch phone numbers (in parallel).
      const allPairs: Array<{
        businessId: string;
        businessName: string;
        wabaId: string;
        wabaName?: string;
        phoneId: string;
        displayPhone: string;
        verifiedName: string;
        quality?: string;
        verified?: string;
      }> = [];
      await Promise.all(
        wabas.map(async (entry) => {
          try {
            const phones = await fetchPhoneNumbers(entry.waba.id, longLived.accessToken);
            for (const p of phones) {
              allPairs.push({
                businessId: entry.businessId,
                businessName: entry.businessName,
                wabaId: entry.waba.id,
                wabaName: entry.waba.name,
                phoneId: p.id,
                displayPhone: p.display_phone_number,
                verifiedName: p.verified_name,
                quality: p.quality_rating,
                verified: p.code_verification_status,
              });
            }
          } catch (e: any) {
            console.error(`[wa/oauth] Failed to fetch phones for WABA ${entry.waba.id}:`, e.message);
          }
        })
      );

      if (allPairs.length === 0) {
        return res.send(renderOAuthErrorPage(
          'No phone numbers found',
          'Your WhatsApp Business Account does not have any phone numbers attached. Add a phone number in Meta Business Manager, then try again.'
        ));
      }

      // Single option → save directly
      if (allPairs.length === 1) {
        const pair = allPairs[0];
        await saveWhatsAppIntegration(pair, longLived.accessToken, inspection.scopes, encryptForOAuth);
        return res.redirect('/hy/admin?wa_oauth=success');
      }

      // Multiple options → render picker
      const pendingPayload = JSON.stringify({
        token: encryptForOAuth(longLived.accessToken),
        expiresAt: longLived.expiresAt.toISOString(),
        scopes: inspection.scopes,
        pairs: allPairs.map((p) => ({
          businessId: p.businessId,
          businessName: p.businessName,
          wabaId: p.wabaId,
          wabaName: p.wabaName,
          phoneId: p.phoneId,
          displayPhone: p.displayPhone,
          verifiedName: p.verifiedName,
        })),
      });
      res.cookie(WA_PENDING_COOKIE, pendingPayload, {
        httpOnly: true, secure: true, sameSite: 'lax', maxAge: 5 * 60,
      });
      return res.send(renderWhatsAppPicker(allPairs));
    } catch (e: any) {
      console.error('[wa/oauth] callback error:', e.message);
      return res.send(renderOAuthErrorPage('WhatsApp OAuth failed', e.message || String(e)));
    }
  });

  /**
   * POST /api/meta/whatsapp/oauth/select
   * Body: { wabaId, phoneId }
   *
   * Uses the pending OAuth cookie to look up the chosen WABA + phone number,
   * saves the integration, and subscribes the app to receive webhooks.
   */
  app.post("/api/meta/whatsapp/oauth/select", apiRateLimit, requireAdmin, async (req, res) => {
    const { wabaId, phoneId } = req.body || {};
    if (!wabaId || !phoneId) {
      return res.status(400).json({ error: 'wabaId and phoneId are required' });
    }

    const pendingCookie = req.cookies?.[WA_PENDING_COOKIE];
    res.clearCookie(WA_PENDING_COOKIE);
    if (!pendingCookie) {
      return res.status(400).json({ error: 'Pending OAuth session expired. Please reconnect.' });
    }

    try {
      const pending = JSON.parse(pendingCookie);
      const userToken = decryptForOAuth(pending.token);
      if (!userToken) {
        return res.status(400).json({ error: 'Failed to decrypt pending token. Please reconnect.' });
      }

      const pair = (pending.pairs || []).find((p: any) => p.wabaId === wabaId && p.phoneId === phoneId);
      if (!pair) {
        return res.status(400).json({ error: 'Selected WABA/phone no longer available. Please reconnect.' });
      }

      await saveWhatsAppIntegration(pair, userToken, pending.scopes || [], encryptForOAuth);
      res.json({ success: true });
    } catch (e: any) {
      console.error('[wa/oauth] select error:', e.message);
      res.status(500).json({ error: e.message || 'Failed to save integration' });
    }
  });

  /**
   * POST /api/meta/whatsapp/disconnect
   * Soft-deletes the active WhatsApp integration, scrubs tokens.
   */
  app.post("/api/meta/whatsapp/disconnect", apiRateLimit, requireAdmin, async (req, res) => {
    try {
      const { error } = await supabaseAdmin
        .from('social_integrations')
        .update({
          status: 'disconnected',
          access_token_encrypted: '',
          last_error: 'Disconnected by admin on ' + new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('provider', 'whatsapp')
        .eq('status', 'active');
      if (error) throw error;
      res.json({ success: true });
    } catch (e: any) {
      console.error('[wa/oauth] disconnect error:', e.message);
      res.status(500).json({ error: e.message });
    }
  });

  /**
   * GET /api/meta/whatsapp/status
   * Returns the current WhatsApp integration status. NEVER includes the token.
   */
  app.get("/api/meta/whatsapp/status", apiRateLimit, requireAdmin, async (req, res) => {
    try {
      const { data, error } = await supabaseAdmin
        .from('social_integrations')
        .select('id, meta_business_id, whatsapp_business_account_id, whatsapp_phone_number_id, display_phone_number, verified_name, token_type, token_expires_at, granted_scopes, webhook_status, status, last_message_at, last_sync_at, last_error, created_at')
        .eq('provider', 'whatsapp')
        .eq('status', 'active')
        .maybeSingle();
      if (error) throw error;
      if (!data) {
        return res.json({ connected: false, oauth_configured: isWhatsAppOAuthConfigured() });
      }
      const now = new Date();
      const expiresAt = data.token_expires_at ? new Date(data.token_expires_at) : null;
      const isExpired = expiresAt ? expiresAt.getTime() < now.getTime() : false;
      res.json({
        connected: true,
        oauth_configured: isWhatsAppOAuthConfigured(),
        integration: {
          id: data.id,
          meta_business_id: data.meta_business_id,
          whatsapp_business_account_id: data.whatsapp_business_account_id,
          whatsapp_phone_number_id: data.whatsapp_phone_number_id,
          display_phone_number: data.display_phone_number,
          verified_name: data.verified_name,
          token_type: data.token_type,
          token_expires_at: data.token_expires_at,
          granted_scopes: data.granted_scopes,
          webhook_status: data.webhook_status || 'not_configured',
          last_message_at: data.last_message_at,
          last_sync_at: data.last_sync_at,
          last_error: data.last_error,
          created_at: data.created_at,
          is_expired: isExpired,
        },
      });
    } catch (e: any) {
      console.error('[wa/oauth] status error:', e.message);
      res.status(500).json({ error: e.message });
    }
  });

  /**
   * POST /api/admin/whatsapp/send-test
   * Body: { to: "+37433101077", message: "Hello from Avetisyan Beauty Clinic!" }
   *
   * Sends a test message via WhatsApp Cloud API using the stored (encrypted)
   * access token. Useful for verifying the integration works end-to-end.
   */
  app.post("/api/admin/whatsapp/send-test", apiRateLimit, requireAdmin, async (req, res) => {
    try {
      const { to, message } = req.body || {};
      if (!to || !message) {
        return res.status(400).json({ error: 'to and message are required' });
      }
      // Normalize phone: strip spaces, +, dashes. WhatsApp wants digits only.
      const normalizedTo = String(to).replace(/[^\d]/g, '');

      const { data: integration, error } = await supabaseAdmin
        .from('social_integrations')
        .select('id, whatsapp_phone_number_id, access_token_encrypted')
        .eq('provider', 'whatsapp')
        .eq('status', 'active')
        .maybeSingle();
      if (error) throw error;
      if (!integration || !integration.whatsapp_phone_number_id) {
        return res.status(400).json({ error: 'No active WhatsApp integration found.' });
      }
      const accessToken = decryptForOAuth(integration.access_token_encrypted);
      if (!accessToken) {
        return res.status(500).json({ error: 'Failed to decrypt stored access token. Please reconnect.' });
      }
      const messageId = await sendWhatsAppTextMessage(
        integration.whatsapp_phone_number_id,
        accessToken,
        normalizedTo,
        message
      );
      // Update last_message_at
      await supabaseAdmin
        .from('social_integrations')
        .update({ last_message_at: new Date().toISOString(), updated_at: new Date().toISOString() })
        .eq('id', integration.id);
      res.json({ success: true, messageId });
    } catch (e: any) {
      console.error('[wa/send-test] error:', e.message);
      res.status(500).json({ error: e.message });
    }
  });

  /** Helper: save WhatsApp integration + subscribe webhook. */
  async function saveWhatsAppIntegration(
    pair: any,
    userToken: string,
    scopes: string[],
    encryptFn: (s: string) => string
  ): Promise<void> {
    // Mark any existing active integration as disconnected
    await supabaseAdmin
      .from('social_integrations')
      .update({ status: 'disconnected', updated_at: new Date().toISOString() })
      .eq('provider', 'whatsapp')
      .eq('status', 'active');

    const expiresIn = 60 * 24 * 60 * 60;
    const expiresAt = new Date(Date.now() + expiresIn * 1000);

    // Insert integration record
    const { data: inserted, error: insErr } = await supabaseAdmin
      .from('social_integrations')
      .insert({
        provider: 'whatsapp',
        meta_business_id: pair.businessId,
        whatsapp_business_account_id: pair.wabaId,
        whatsapp_phone_number_id: pair.phoneId,
        display_phone_number: pair.displayPhone,
        verified_name: pair.verifiedName,
        access_token_encrypted: encryptFn(userToken),
        token_type: 'long_lived',
        token_expires_at: expiresAt.toISOString(),
        granted_scopes: scopes,
        webhook_status: 'pending',
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select('id')
      .single();
    if (insErr) throw new Error(`Failed to save WhatsApp integration: ${insErr.message}`);

    // Try to subscribe the app to WABA + phone number webhooks.
    // If this fails, the integration is still saved but webhook_status stays 'pending'
    // so the admin UI shows a warning.
    try {
      const sub = await subscribeAppToWaba(pair.wabaId, pair.phoneId, userToken);
      let newStatus = 'not_configured';
      if (sub.wabaSubscribed && sub.phoneSubscribed) newStatus = 'subscribed';
      else if (sub.wabaSubscribed || sub.phoneSubscribed) newStatus = 'partial';
      await supabaseAdmin
        .from('social_integrations')
        .update({
          webhook_status: newStatus,
          last_error: sub.errors.length > 0 ? sub.errors.join('; ').slice(0, 500) : null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', inserted.id);
    } catch (e: any) {
      console.error('[wa/oauth] webhook subscribe failed:', e.message);
      await supabaseAdmin
        .from('social_integrations')
        .update({
          webhook_status: 'failed',
          last_error: `Webhook subscribe failed: ${e.message}`.slice(0, 500),
          updated_at: new Date().toISOString(),
        })
        .eq('id', inserted.id);
    }
  }

  /** Helper: render the multi-WABA/phone picker as a standalone HTML page. */
  function renderWhatsAppPicker(
    pairs: Array<{
      businessName: string;
      wabaName?: string;
      displayPhone: string;
      verifiedName: string;
      wabaId: string;
      phoneId: string;
    }>
  ): string {
    const items = pairs.map((p) => `
      <form method="POST" action="/api/meta/whatsapp/oauth/select" style="margin:0;">
        <input type="hidden" name="wabaId" value="${escapeHtml(p.wabaId)}" />
        <input type="hidden" name="phoneId" value="${escapeHtml(p.phoneId)}" />
        <button type="submit" style="display:flex;align-items:center;justify-content:space-between;width:100%;background:#111;border:1px solid rgba(200,155,78,0.25);border-radius:16px;padding:1rem 1.25rem;color:#F5F5F5;cursor:pointer;text-align:left;font-size:0.95rem;margin-bottom:0.5rem;transition:border-color 0.2s;" onmouseover="this.style.borderColor='#C89B4E'" onmouseout="this.style.borderColor='rgba(200,155,78,0.25)'">
          <span>
            <strong>${escapeHtml(p.verifiedName)}</strong>
            <span style="color:#C89B4E;font-size:0.85rem;margin-left:0.5rem;">${escapeHtml(p.displayPhone)}</span>
            <br/>
            <span style="color:rgba(245,245,245,0.5);font-size:0.75rem;">${escapeHtml(p.businessName)} · ${escapeHtml(p.wabaName || p.wabaId)}</span>
          </span>
          <span style="color:#C89B4E;">Select →</span>
        </button>
      </form>`).join('');
    return `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Select WhatsApp Number</title>
<style>body{background:#080808;color:#F5F5F5;font-family:system-ui,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;padding:1rem;}
.box{max-width:560px;width:100%;background:#111;border:1px solid rgba(200,155,78,0.35);border-radius:24px;padding:2.5rem;}
h1{color:#C89B4E;font-size:1.5rem;margin:0 0 0.5rem;font-family:Georgia,serif;text-align:center;}
p.subtitle{color:rgba(245,245,245,0.6);text-align:center;margin:0 0 1.5rem;font-size:0.9rem;}
</style></head><body><div class="box"><h1>Select a WhatsApp Number</h1><p class="subtitle">Choose the phone number to use for sending and receiving messages.</p>${items}</div></body></html>`;
  }

  // Setup File Uploads with Multer (fallback for any legacy local uploads)
  const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
  // In serverless environments (Vercel Lambda), the working directory is
  // read-only. mkdir would throw ENOENT — ignore. The local-uploads fallback
  // only applies in dev/standalone mode anyway; in production, all uploads
  // go directly to Supabase Storage.
  try {
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
  } catch (e) {
    // Read-only filesystem — skip silently.
  }

  // Generic site document write (replaces Firestore `site/{docId}.set(..., {merge:true})`).
  // Used by contentStore / galleryStore / settingsStore / aiAssistantStore for all writes.
  app.post("/api/db/site/:docId", apiRateLimit, requireAdmin, async (req, res) => {
    try {
      const { docId } = req.params;
      const data = req.body;
      const { error } = await supabaseAdmin
        .from('site')
        .upsert({ key: docId, data, updated_at: new Date().toISOString() }, { onConflict: 'key' });
      if (error) throw error;
      res.json({ success: true });
    } catch (e: any) {
      console.error("DB update error", e);
      res.status(500).json({ error: "Failed to update DB", details: e.message });
    }
  });

  // Allowlist of MIME types -> extensions accepted for uploads. Anything else
  // (executables, scripts, HTML, SVG, etc.) is rejected before being written to disk.
  const ALLOWED_UPLOAD_TYPES: Record<string, string> = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "image/gif": ".gif",
    "video/mp4": ".mp4",
    "video/webm": ".webm",
    "video/quicktime": ".mov",
  };

  // Files are uploaded to Supabase Storage (public `uploads` bucket) via the
  // service role key. Buffer the file in memory, then upload it; the public
  // URL is returned so the site can display the asset.
  const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit (videos are the largest expected upload)
    fileFilter: (req, file, cb) => {
      if (!ALLOWED_UPLOAD_TYPES[file.mimetype]) {
        return cb(new Error("Unsupported file type"));
      }
      cb(null, true);
    },
  });

  // Still serve any legacy files that were written to the local uploads folder
  // before the move to Supabase Storage.
  app.use('/uploads', express.static(uploadsDir));

  app.post("/api/upload", apiRateLimit, requireAdmin, (req, res) => {
    upload.single('file')(req, res, async (err: any) => {
      if (err) {
        return res.status(400).json({ error: err.message || "Upload rejected" });
      }
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }
      try {
        const ext = ALLOWED_UPLOAD_TYPES[req.file.mimetype] || path.extname(req.file.originalname);
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const objectPath = `uploads/${req.file.fieldname}-${uniqueSuffix}${ext}`;

        const { error: upErr } = await supabaseAdmin
          .storage
          .from('uploads')
          .upload(objectPath, req.file.buffer, {
            contentType: req.file.mimetype,
            upsert: false,
          });
        if (upErr) throw upErr;

        // Public bucket → use getPublicUrl for a stable, non-expiring URL.
        const { data: pubUrl } = supabaseAdmin
          .storage
          .from('uploads')
          .getPublicUrl(objectPath);

        res.json({ url: pubUrl.publicUrl });
      } catch (e: any) {
        console.error("Supabase upload error", e);
        res.status(500).json({ error: "Failed to upload file", details: e.message });
      }
    });
  });

  // Issue a short-lived signed upload URL for direct browser → Supabase Storage
  // uploads. This bypasses Vercel's 4.5 MB request body limit on serverless
  // functions and avoids the double-hop (browser → Lambda → Storage), so large
  // video uploads finish much faster.
  //
  // Flow:
  //   1. Admin client calls this endpoint with the file's MIME type.
  //   2. Server uses the service role key to mint a one-time signed upload URL
  //      for a fresh path in the `uploads` bucket.
  //   3. Client receives { path, token, publicUrl }.
  //   4. Client uses supabase-js's uploadToSignedUrl(path, token, file) to
  //      upload the file bytes directly to Supabase Storage.
  //   5. Client uses the returned publicUrl on the site.
  app.post("/api/upload/signed-url", apiRateLimit, requireAdmin, async (req, res) => {
    try {
      const { mimetype, filename } = req.body || {};
      const ext = ALLOWED_UPLOAD_TYPES[mimetype];
      if (!ext) {
        return res.status(400).json({ error: "Unsupported file type" });
      }
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const safeName = (filename || 'file')
        .replace(/[^a-zA-Z0-9.]/g, '_')
        .slice(0, 50);
      const objectPath = `uploads/${safeName}-${uniqueSuffix}${ext}`;

      const { data: signedData, error: signedErr } = await supabaseAdmin
        .storage
        .from('uploads')
        .createSignedUploadUrl(objectPath);

      if (signedErr) throw signedErr;

      const { data: pubUrl } = supabaseAdmin
        .storage
        .from('uploads')
        .getPublicUrl(objectPath);

      res.json({
        path: signedData.path,
        token: signedData.token,
        signedUrl: signedData.signedUrl,
        publicUrl: pubUrl.publicUrl,
      });
    } catch (e: any) {
      console.error("Signed URL error:", e);
      res.status(500).json({ error: "Failed to create upload URL", details: e.message });
    }
  });

  app.delete("/api/upload", apiRateLimit, requireAdmin, async (req, res) => {
    try {
      const { url } = req.body;
      if (!url) return res.status(400).json({ error: "No URL provided" });

      // Supabase storage public URLs look like:
      //   https://<project>.supabase.co/storage/v1/object/public/uploads/<path>
      // Try to extract the object path under the `uploads` bucket.
      const match = url.match(/\/storage\/v1\/object\/public\/uploads\/(.+)$/);
      if (match) {
        const objectPath = decodeURIComponent(match[1].split('?')[0]);
        const { error: delErr } = await supabaseAdmin
          .storage
          .from('uploads')
          .remove([objectPath]);
        if (delErr) console.error('Supabase storage delete error:', delErr);
      } else if (url.includes('firebasestorage.googleapis.com') || url.includes('storage.googleapis.com')) {
        // Legacy Firebase Storage URL — no-op (Firebase project is gone).
        console.log('Skipping delete of legacy Firebase Storage URL:', url);
      } else {
        // Legacy local file written before the move to Supabase Storage.
        const fileName = path.basename((url.split('/').pop() || '').split('?')[0]);
        if (fileName) {
          const filePath = path.join(uploadsDir, fileName);
          if (fs.existsSync(filePath)) {
             fs.unlinkSync(filePath);
          }
        }
      }
      res.json({ success: true });
    } catch (e) {
      console.error("Delete file error", e);
      res.status(500).json({ error: "Failed to delete file" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  return app;
}

// When invoked directly (npm run dev), start the standalone HTTP server.
// When imported by api/[[...path]].ts, only createApp() is called.
if (import.meta.url === `file://${process.argv[1]}`) {
  const PORT = Number(process.env.PORT) || 3000;
  createApp().then((app) => {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  }).catch((err) => {
    console.error('Failed to start server:', err);
    process.exit(1);
  });
}
