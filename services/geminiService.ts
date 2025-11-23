import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const askMedicalAssistant = async (question: string, context: string): Promise<string> => {
  if (!apiKey) {
    return "API Key is missing. Please configure the environment.";
  }

  try {
    const systemInstruction = `
      You are a compassionate and knowledgeable medical assistant specializing in gastric cancer education.
      Your audience consists of patients and their families in China.
      
      Current Context in App: ${context}

      Rules:
      1. Answer in Simplified Chinese (zh-CN).
      2. Be encouraging, clear, and easy to understand (avoid overly dense jargon without explanation).
      3. If the user asks for medical advice (diagnosis/treatment), provide general information but strictly advise them to consult their doctor.
      4. Keep answers concise (under 200 words) unless asked for details.
      5. Use Markdown for formatting.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: question,
      config: {
        systemInstruction: systemInstruction,
      }
    });

    return response.text || "抱歉，我现在无法回答这个问题，请稍后再试。";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "连接助手时出现错误，请检查网络设置。";
  }
};