import express from "express";
import path from "path";
import fs from "fs";
import crypto from "crypto";

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

import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Modality, GenerateVideosOperation } from "@google/genai";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import { instagramWebhookRoute } from "./src/server/webhooks/instagramWebhookRoute";
import { whatsappWebhookRoute } from "./src/server/webhooks/whatsappWebhookRoute";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

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
  app.post("/api/auth/login", (req, res) => {
    const { username, password } = req.body;
    const adminUser = process.env.ADMIN_USERNAME;
    const adminPass = process.env.ADMIN_PASSWORD;
    const jwtSecret = process.env.JWT_SECRET || 'fallback_secret_only_for_dev';

    if (!adminUser || !adminPass) {
      res.status(500).json({ error: "Admin credentials not configured on server" });
      return;
    }

    if (username === adminUser && password === adminPass) {
      const token = jwt.sign({ username }, jwtSecret, { expiresIn: '12h' });
      res.cookie('admin_token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', maxAge: 12 * 60 * 60 * 1000 });
      res.json({ success: true });
    } else {
      res.status(401).json({ error: "Invalid credentials" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    res.clearCookie('admin_token');
    res.json({ success: true });
  });

  app.get("/api/auth/verify", (req, res) => {
    const token = req.cookies?.admin_token;
    if (!token) {
      res.json({ authenticated: false });
      return;
    }

    const jwtSecret = process.env.JWT_SECRET || 'fallback_secret_only_for_dev';
    try {
      jwt.verify(token, jwtSecret);
      res.json({ authenticated: true });
    } catch (e) {
      res.json({ authenticated: false });
    }
  });

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

  app.post("/api/instagram/token", async (req, res) => {
    const { token, accountIndex = 0, handle = '' } = req.body;
    if (!token) {
      return res.status(400).json({ error: "Token is required" });
    }
    instagramTokens[accountIndex] = token;
    instagramHandles[accountIndex] = handle;
    await saveAccount(accountIndex, token, handle);
    res.json({ success: true, message: "Token stored securely" });
  });

  app.post("/api/instagram/token/remove", async (req, res) => {
    const { accountIndex } = req.body;
    if (accountIndex !== undefined && accountIndex >= 0 && accountIndex < instagramTokens.length) {
       instagramTokens[accountIndex] = ''; // Or use splice, but keeping array size might be easier if we rely on indices 0 and 1
       instagramHandles[accountIndex] = '';
       await deleteAccount(accountIndex);
    }
    res.json({ success: true, message: "Token removed" });
  });

  app.get("/api/instagram/status", (req, res) => {
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
  app.use("/api/webhooks/instagram", instagramWebhookRoute);
  app.use("/api/webhooks/whatsapp", whatsappWebhookRoute);

  // AI Classification and Generation Endpoint
  app.post("/api/ai-messaging/process", async (req, res) => {
    try {
      const { message, settings, knowledgeBase } = req.body;
      const ai = getAi();
      
      const systemInstruction = `
        You are an AI assistant for Avetisyan Beauty Clinic.
        Your task is to answer simple and template questions from clients based on the approved knowledge base.
        You are not a doctor. You do not diagnose. You do not prescribe treatment. You do not guarantee results.
        If the question is individual, medical, or unclear — you must set requires_human to true.
        Answer briefly, politely, and in the language of the client.
        Always suggest a consultation or booking if appropriate.
        
        Analyze the incoming message and output JSON ONLY with the following schema:
        {
          "intent": "price_question | booking_request | address_question | working_hours | service_question | ... | human_required | unknown",
          "detected_language": "hy | ru | en",
          "requires_human": boolean,
          "confidence": number (0 to 1),
          "suggested_reply": "Your reply based on knowledge base, or empty if requires_human is true"
        }
      `;

      // Simplified call to Gemini (using JSON mode if supported, or standard generation)
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `Client Message: "${message}"\n\nKnowledge Base:\n${JSON.stringify(knowledgeBase)}`,
        config: { 
          systemInstruction,
          responseMimeType: "application/json"
        },
      });
      
      const resultText = response.text;
      let parsed = { requires_human: true, suggested_reply: "Error parsing AI response" };
      try {
        parsed = JSON.parse(resultText);
      } catch(e) {
        console.error("Failed to parse JSON from AI", e);
      }
      
      res.json(parsed);
    } catch (error: any) {
      console.error("AI Messaging Process Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
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
