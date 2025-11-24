import { GoogleGenAI } from "@google/genai";

interface AIConfig {
  apiKey?: string;
  model?: string;
}

export const askMedicalAssistant = async (question: string, context: string, config: AIConfig): Promise<string> => {
  try {
    // 优先使用用户配置的 Key，否则使用环境变量
    const apiKey = config.apiKey || process.env.API_KEY;
    
    if (!apiKey) {
      return "请先在设置中配置 API Key，或联系管理员设置环境变量。";
    }

    const ai = new GoogleGenAI({ apiKey });
    
    // 智能选择模型：用户自定义 > 默认 Flash 模型
    const modelName = config.model || 'gemini-2.5-flash';

    const systemInstruction = `
      You are a compassionate and knowledgeable medical assistant specializing in gastric cancer education.
      Your audience consists of patients and their families in China.
      
      Current Context in App: ${context || 'General Gastric Cancer Education'}

      Rules:
      1. Answer in Simplified Chinese (zh-CN).
      2. Be encouraging, clear, and easy to understand.
      3. If the user asks for medical advice, provide general info but advise consulting a doctor.
      4. Keep answers concise (under 300 words).
      5. Use Markdown for formatting.
      6. If the context mentions 'Fried Frailty Scale', analyze the score and provide specific exercise/diet advice.
    `;

    const response = await ai.models.generateContent({
      model: modelName,
      contents: question,
      config: {
        systemInstruction: systemInstruction,
      }
    });

    return response.text || "抱歉，我没有生成有效的内容。";

  } catch (error: any) {
    console.error("Gemini SDK Error:", error);
    return `助手暂时不可用: ${error.message || "未知错误"}`;
  }
};