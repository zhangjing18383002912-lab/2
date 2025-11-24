// 此服务调用后端通用代理 (/api/chat)
// 支持任意 OpenAI 兼容接口 (DeepSeek, Moonshot, OpenAI, etc.)

interface AIConfig {
  baseUrl: string;
  apiKey: string;
  model: string;
}

export const askMedicalAssistant = async (question: string, context: string, config: AIConfig): Promise<string> => {
  try {
    // 构建系统提示词
    const systemPrompt = `
      You are a compassionate and knowledgeable medical assistant specializing in gastric cancer education.
      Your audience consists of patients and their families in China.
      
      Current Context in App: ${context || 'General Gastric Cancer Education'}

      Rules:
      1. Answer in Simplified Chinese (zh-CN).
      2. Be encouraging, clear, and easy to understand.
      3. If the user asks for medical advice, provide general info but advise consulting a doctor.
      4. Keep answers concise (under 300 words).
      5. Use Markdown for formatting.
    `;

    // 构建消息历史
    const messages = [
      { role: "system", content: systemPrompt },
      { role: "user", content: question }
    ];

    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        messages, 
        config 
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `请求失败: ${response.status}`);
    }

    return data.text;

  } catch (error: any) {
    console.error("Chat Client Error:", error);
    return `助手暂时不可用: ${error.message}`;
  }
};