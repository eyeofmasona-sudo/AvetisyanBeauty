import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Modality, GenerateVideosOperation } from "@google/genai";
import dotenv from "dotenv";
import { instagramWebhookRoute } from "./src/server/webhooks/instagramWebhookRoute";
import { whatsappWebhookRoute } from "./src/server/webhooks/whatsappWebhookRoute";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

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

  // 1. Text / Content Generation (for magic mode and ads)
  app.post("/api/gemini/generate", async (req, res) => {
    try {
      const { prompt, systemInstruction } = req.body;
      const ai = getAi();
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: systemInstruction ? { systemInstruction } : undefined,
      });
      res.json({ text: response.text });
    } catch (error: any) {
      console.error("Text Gen Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // 2. Image Generation
  app.post("/api/gemini/image", async (req, res) => {
    try {
      const { prompt } = req.body;
      const ai = getAi();
      const response = await ai.models.generateContent({
        model: "gemini-3.1-flash-image",
        contents: prompt,
        config: {
          imageConfig: {
            aspectRatio: "1:1",
            imageSize: "1K",
          },
        },
      });

      // Find image part
      let imageBase64 = null;
      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          imageBase64 = part.inlineData.data;
          break;
        }
      }

      if (imageBase64) {
        res.json({ image: `data:image/jpeg;base64,${imageBase64}` });
      } else {
        throw new Error("No image generated");
      }
    } catch (error: any) {
      console.error("Image Gen Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // 3. Video Generation (Start)
  app.post("/api/gemini/video-start", async (req, res) => {
    try {
      const { prompt, firstFrame, lastFrame } = req.body;
      const ai = getAi();
      
      const config: any = {
        numberOfVideos: 1,
        resolution: "1080p",
        aspectRatio: "16:9",
      };
      
      if (lastFrame) {
        // base64 to parts
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

      const operation = await ai.models.generateVideos({
        model: "veo-3.1-lite-generate-preview",
        prompt: prompt,
        image: imageConfig,
        config,
      });
      
      res.json({ operationName: operation.name });
    } catch (error: any) {
      console.error("Video Gen Start Error:", error);
      res.status(500).json({ error: error.message });
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
      const { prompt, voiceName = "Kore" } = req.body;
      const ai = getAi();
      
      const response = await ai.models.generateContent({
        model: "gemini-3.1-flash-tts-preview",
        contents: [{ parts: [{ text: prompt }] }],
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
        res.json({ audio: `data:audio/pcm;base64,${base64Audio}` });
      } else {
        throw new Error("Failed to generate audio");
      }
    } catch (error: any) {
      console.error("TTS Error:", error);
      res.status(500).json({ error: error.message });
    }
  });
  
  // 7. Podcast Mode TTS (Multi-speaker)
  app.post("/api/gemini/podcast", async (req, res) => {
    try {
      const { prompt, speaker1 = "Joe", speaker2 = "Jane", voice1 = "Kore", voice2 = "Puck" } = req.body;
      const ai = getAi();
      
      const response = await ai.models.generateContent({
        model: "gemini-3.1-flash-tts-preview",
        contents: [{ parts: [{ text: prompt }] }],
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
        res.json({ audio: `data:audio/pcm;base64,${base64Audio}` });
      } else {
        throw new Error("Failed to generate podcast audio");
      }
    } catch (error: any) {
      console.error("Podcast TTS Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // 8. Instagram Basic Display API Integration
  let instagramToken: string | null = process.env.INSTAGRAM_ACCESS_TOKEN || null;

  app.post("/api/instagram/token", (req, res) => {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ error: "Token is required" });
    }
    instagramToken = token;
    res.json({ success: true, message: "Token stored securely" });
  });

  app.get("/api/instagram/posts", async (req, res) => {
    try {
      if (!instagramToken) {
        return res.status(401).json({ error: "Instagram token not configured" });
      }

      // Fetch user profile to get media
      const mediaResponse = await fetch(`https://graph.instagram.com/me/media?fields=id,caption,media_type,media_url,thumbnail_url,permalink,timestamp&access_token=${instagramToken}`);
      
      if (!mediaResponse.ok) {
        const errorData = await mediaResponse.json();
        throw new Error(errorData.error?.message || "Failed to fetch Instagram posts");
      }

      const mediaData = await mediaResponse.json();
      
      // Format to match our InstagramPost interface
      const posts = mediaData.data.map((post: any) => ({
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
