import { GoogleGenAI } from "@google/genai";

export default async function handler(req: any, res: any) {
  // 1. 设置 CORS 头，防止跨域问题干扰调试
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // 处理 OPTIONS 请求
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // 2. 这里的 Key 是您提供的，作为硬编码备选方案，确保一定能读取到
  // 警告：在生产环境中不建议将 Key 硬编码在代码中，这里是为了帮您快速跑通
  const FALLBACK_KEY = 'AIzaSyBwwoXLOc1HVNOvSsYiFoqcVzlfz_Qsw-k';
  
  // 优先读取环境变量，没有则使用备用 Key
  const rawKey = process.env.API_KEY || FALLBACK_KEY;
  const apiKey = rawKey ? rawKey.trim() : "";

  if (!apiKey) {
    console.error("Critical: No API Key found in env or fallback.");
    return res.status(500).json({ error: '配置错误：未找到 API Key。请检查代码或 Vercel 环境变量。' });
  }

  // 3. 只允许 POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { question, context } = req.body;

    if (!question) {
      return res.status(400).json({ error: 'Question is required' });
    }

    // 4. 初始化 Gemini
    const ai = new GoogleGenAI({ apiKey: apiKey });

    const systemInstruction = `
      You are a compassionate and knowledgeable medical assistant specializing in gastric cancer education.
      Your audience consists of patients and their families in China.
      
      Current Context in App: ${context || 'General Gastric Cancer Education'}

      Rules:
      1. Answer in Simplified Chinese (zh-CN).
      2. Be encouraging, clear, and easy to understand.
      3. If the user asks for medical advice, provide general info but advise consulting a doctor.
      4. Keep answers concise (under 200 words).
      5. Use Markdown for formatting.
    `;

    // 5. 生成内容
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: question,
      config: {
        systemInstruction: systemInstruction,
      }
    });

    const text = response.text || "助手没有返回文字内容。";
    return res.status(200).json({ text });

  } catch (error: any) {
    console.error("Gemini API Error:", error);
    
    // 错误信息处理
    const msg = error.message || error.toString();
    
    if (msg.includes("API key not valid") || msg.includes("400")) {
      return res.status(500).json({ error: "API Key 无效 (400)。请检查 Key 是否正确复制。" });
    }
    
    return res.status(500).json({ error: `调用 Google 服务失败: ${msg}` });
  }
}