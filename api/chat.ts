import { GoogleGenAI } from "@google/genai";

export default async function handler(req: any, res: any) {
  // 1. 安全校验
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Server Error: API Key is missing in Vercel Environment Variables.' });
  }

  // 2. 只允许 POST 请求
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { question, context } = req.body;

    // 3. 初始化 Gemini (在服务器端运行)
    const ai = new GoogleGenAI({ apiKey: apiKey });

    const systemInstruction = `
      You are a compassionate and knowledgeable medical assistant specializing in gastric cancer education.
      Your audience consists of patients and their families in China.
      
      Current Context in App: ${context}

      Rules:
      1. Answer in Simplified Chinese (zh-CN).
      2. Be encouraging, clear, and easy to understand.
      3. If the user asks for medical advice, provide general info but advise consulting a doctor.
      4. Keep answers concise (under 200 words).
      5. Use Markdown for formatting.
    `;

    // 4. 调用 Google API
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: question,
      config: {
        systemInstruction: systemInstruction,
      }
    });

    // 5. 返回结果给前端
    const text = response.text || "抱歉，助手思考后没有返回内容。";
    return res.status(200).json({ text });

  } catch (error: any) {
    console.error("Server Side Gemini Error:", error);
    return res.status(500).json({ error: error.message || "Internal Server Error" });
  }
}