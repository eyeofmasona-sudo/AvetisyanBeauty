import type { GoogleGenAI } from '@google/genai';

export interface AIKnowledgeItemLike {
  category: string;
  question: string;
  answer_hy: string;
  answer_ru: string;
  answer_en: string;
  is_active: boolean;
  requires_human_review: boolean;
}

export interface AIDraftResult {
  detected_language: 'hy' | 'ru' | 'en' | 'unknown';
  requires_human: boolean;
  confidence: number;
  suggested_reply: string;
}

const SYSTEM_INSTRUCTION = `
You are an AI assistant for Avetisyan Beauty Clinic.
Your task is to answer simple and template questions from clients based on the approved knowledge base.
You are not a doctor. You do not diagnose. You do not prescribe treatment. You do not guarantee results.
If the question is individual, medical, or unclear — you must set requires_human to true.
Answer briefly, politely, and in the language of the client.
Always suggest a consultation or booking if appropriate.

Analyze the incoming message and output JSON ONLY with the following schema:
{
  "detected_language": "hy | ru | en | unknown",
  "requires_human": boolean,
  "confidence": number (0 to 1),
  "suggested_reply": "Your reply based on knowledge base, or empty string if requires_human is true"
}
`;

export async function draftAIReply(
  ai: GoogleGenAI,
  message: string,
  knowledgeBase: AIKnowledgeItemLike[]
): Promise<AIDraftResult> {
  const activeKnowledge = knowledgeBase.filter((k) => k.is_active);

  const response = await ai.models.generateContent({
    model: 'gemini-3.5-flash',
    contents: `Client Message: "${message}"\n\nKnowledge Base:\n${JSON.stringify(activeKnowledge)}`,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      responseMimeType: 'application/json',
    },
  });

  try {
    const parsed = JSON.parse(response.text || '{}');
    return {
      detected_language: parsed.detected_language ?? 'unknown',
      requires_human: Boolean(parsed.requires_human),
      confidence: typeof parsed.confidence === 'number' ? parsed.confidence : 0,
      suggested_reply: parsed.suggested_reply ?? '',
    };
  } catch (e) {
    console.error('Failed to parse AI draft response', e);
    return { detected_language: 'unknown', requires_human: true, confidence: 0, suggested_reply: '' };
  }
}
