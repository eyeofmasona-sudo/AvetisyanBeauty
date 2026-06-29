import express from "express";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import multer from "multer";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";
import { initializeApp, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { getStorage } from 'firebase-admin/storage';

// Initialize Firebase Admin
let firebaseAdminApp;
if (!getApps().length) {
  firebaseAdminApp = initializeApp({
    projectId: process.env.FIREBASE_PROJECT_ID || 'gen-lang-client-0533202242'
  });
} else {
  firebaseAdminApp = getApps()[0];
}
const db = getFirestore(firebaseAdminApp, "ai-studio-goldensunaesthet-06980057-72a8-4947-ad91-dd805dfcbaa5");

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
import { createInstagramWebhookRoute } from "./src/server/webhooks/instagramWebhookRoute";
import { createWhatsappWebhookRoute } from "./src/server/webhooks/whatsappWebhookRoute";
import { sendInstagramText, sendWhatsAppText, MetaSendError } from "./src/server/messaging/metaSend";
import { markMessageAnswered } from "./src/server/messaging/threadStore";

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

async function startServer() {
  const app = express();
  const PORT = 3000;

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
  app.post("/api/auth/login-firebase", authRateLimit, async (req, res) => {
    try {
      const { idToken } = req.body;
      const decodedToken = await getAuth(firebaseAdminApp).verifyIdToken(idToken);
      if (decodedToken.email === 'eyeofmasona@gmail.com' && decodedToken.email_verified) {
        const token = jwt.sign({ username: decodedToken.email }, JWT_SECRET, { expiresIn: '12h' });
        res.cookie('admin_token', token, { httpOnly: true, secure: true, sameSite: 'none', maxAge: 12 * 60 * 60 * 1000 });
        res.json({ success: true });
      } else {
        res.status(401).json({ error: "Unauthorized email" });
      }
    } catch (error) {
      console.error("Firebase auth error:", error);
      res.status(401).json({ error: "Invalid token" });
    }
  });

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
       instagramTokens[accountIndex] = ''; // Or use splice, but keeping array size might be easier if we rely on indices 0 and 1
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
      const validTokens = instagramTokens.filter(t => t && t.trim() !== "");
      if (validTokens.length === 0) {
        return res.status(401).json({ error: "Instagram tokens not configured" });
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
        likes: Math.floor(Math.random() * 500) + 50, // Basic Display API doesn't provide likes count
        comments: Math.floor(Math.random() * 50) + 5, // Basic Display API doesn't provide comments count
        caption: post.caption || "Instagram Post"
      }));

      res.json({ posts });
    } catch (error: any) {
      console.error("Instagram API Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // 9. AI Messaging Webhooks (Instagram & WhatsApp)
  app.use("/api/webhooks/instagram", createInstagramWebhookRoute({ db, getAi }));
  app.use("/api/webhooks/whatsapp", createWhatsappWebhookRoute({ db, getAi }));

  // AI Classification and Generation Endpoint (manual/preview use from the admin UI)
  app.post("/api/ai-messaging/process", async (req, res) => {
    try {
      const { message, knowledgeBase } = req.body;
      const ai = getAi();
      const { draftAIReply } = await import("./src/server/messaging/aiDraft");
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

      const threadSnap = await db.collection('ai_threads').doc(threadId).get();
      if (!threadSnap.exists) {
        return res.status(404).json({ error: "Thread not found" });
      }
      const thread = threadSnap.data() as any;

      if (thread.channel === 'whatsapp') {
        await sendWhatsAppText(thread.customer_handle, finalReply);
      } else if (thread.channel === 'instagram') {
        await sendInstagramText(thread.customer_handle, finalReply);
      } else {
        return res.status(400).json({ error: `Unknown channel: ${thread.channel}` });
      }

      await markMessageAnswered(db, threadId, messageId, finalReply);
      res.json({ success: true });
    } catch (error: any) {
      console.error("AI Messaging Send Error:", error);
      const status = error instanceof MetaSendError ? 502 : 500;
      res.status(status).json({ error: error.message || "Failed to send reply" });
    }
  });

  // Setup File Uploads with Multer
  const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  app.post("/api/db/site/:docId", apiRateLimit, requireAdmin, async (req, res) => {
    try {
      const { docId } = req.params;
      const data = req.body;
      await db.collection('site').doc(docId).set(data, { merge: true });
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

  // Files are uploaded to Firebase Storage (persistent) rather than the local
  // container disk, which is ephemeral on Cloud Run and would lose uploads on
  // every restart/redeploy. Buffer the file in memory, then write it to the
  // bucket with a Firebase download token so the returned URL is publicly
  // readable on the site.
  const STORAGE_BUCKET =
    process.env.FIREBASE_STORAGE_BUCKET || 'gen-lang-client-0533202242.firebasestorage.app';

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
  // before the move to Firebase Storage.
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
        const downloadToken = crypto.randomUUID();
        const bucket = getStorage(firebaseAdminApp).bucket(STORAGE_BUCKET);
        await bucket.file(objectPath).save(req.file.buffer, {
          resumable: false,
          contentType: req.file.mimetype,
          metadata: {
            contentType: req.file.mimetype,
            metadata: { firebaseStorageDownloadTokens: downloadToken },
          },
        });
        const url = `https://firebasestorage.googleapis.com/v0/b/${STORAGE_BUCKET}/o/${encodeURIComponent(objectPath)}?alt=media&token=${downloadToken}`;
        res.json({ url });
      } catch (e) {
        console.error("Firebase upload error", e);
        res.status(500).json({ error: "Failed to upload file" });
      }
    });
  });

  // Issue a short-lived V4 signed URL so the browser can upload large files
  // (especially videos) directly to Firebase Storage in a single network hop,
  // instead of streaming them through this backend (browser -> Cloud Run ->
  // Storage, i.e. transferring the file twice). Authorization here is the admin
  // cookie (requireAdmin); the signed URL itself grants the write, so this also
  // works for the username/password admin login which has no Firebase identity.
  // The object is tagged with a Firebase download token so the resulting URL is
  // publicly readable on the site, matching the multipart upload path above.
  //
  // Requirements on the live environment for this fast path to succeed:
  //  - the runtime service account can sign URLs (Service Account Token Creator
  //    role / IAM SignBlob), and
  //  - the bucket has a CORS rule allowing PUT (and the
  //    x-goog-meta-firebasestoragedownloadtokens / content-type headers) from
  //    the site origin.
  // If either is missing the signed URL or the browser PUT fails, and the
  // client falls back to the multipart /api/upload endpoint, so uploads keep
  // working either way.
  app.post("/api/upload/signed-url", apiRateLimit, requireAdmin, async (req, res) => {
    try {
      const { mimetype } = req.body || {};
      const ext = ALLOWED_UPLOAD_TYPES[mimetype];
      if (!ext) {
        return res.status(400).json({ error: "Unsupported file type" });
      }
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const objectPath = `uploads/file-${uniqueSuffix}${ext}`;
      const downloadToken = crypto.randomUUID();
      const bucket = getStorage(firebaseAdminApp).bucket(STORAGE_BUCKET);
      const [uploadUrl] = await bucket.file(objectPath).getSignedUrl({
        version: 'v4',
        action: 'write',
        expires: Date.now() + 15 * 60 * 1000, // 15 minutes
        contentType: mimetype,
        extensionHeaders: {
          'x-goog-meta-firebaseStorageDownloadTokens': downloadToken,
        },
      });
      const downloadUrl = `https://firebasestorage.googleapis.com/v0/b/${STORAGE_BUCKET}/o/${encodeURIComponent(objectPath)}?alt=media&token=${downloadToken}`;
      res.json({
        uploadUrl,
        downloadUrl,
        headers: {
          'Content-Type': mimetype,
          'x-goog-meta-firebaseStorageDownloadTokens': downloadToken,
        },
      });
    } catch (e) {
      console.error("Signed URL error", e);
      res.status(500).json({ error: "Failed to create upload URL" });
    }
  });

  app.delete("/api/upload", apiRateLimit, requireAdmin, async (req, res) => {
    try {
      const { url } = req.body;
      if (!url) return res.status(400).json({ error: "No URL provided" });

      if (url.includes('firebasestorage.googleapis.com')) {
        // Firebase download URL: .../o/<url-encoded object path>?alt=media&token=...
        const match = url.match(/\/o\/([^?]+)/);
        const objectPath = match ? decodeURIComponent(match[1]) : null;
        if (objectPath) {
          const bucket = getStorage(firebaseAdminApp).bucket(STORAGE_BUCKET);
          await bucket.file(objectPath).delete().catch(console.error);
        }
      } else if (url.includes('storage.googleapis.com')) {
        // Legacy public URL: https://storage.googleapis.com/<bucket>/uploads/<filename>
        const filename = (url.split('/').pop() || '').split('?')[0];
        if (filename) {
          const bucket = getStorage(firebaseAdminApp).bucket(STORAGE_BUCKET);
          await bucket.file(`uploads/${filename}`).delete().catch(console.error);
        }
      } else {
        // Legacy local file written before the move to Firebase Storage.
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

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
