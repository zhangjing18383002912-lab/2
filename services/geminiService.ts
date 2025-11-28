
interface AIConfig {
  apiKey?: string;
  baseUrl?: string;
  model?: string;
}

export const askMedicalAssistant = async (question: string, context: string, config: AIConfig): Promise<string> => {
  try {
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

    // 构造 OpenAI 兼容的 Messages 格式
    const messages = [
      { role: "system", content: systemInstruction },
      { role: "user", content: question }
    ];

    // Client-side safety timeout (60s) to prevent UI hanging forever
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000);

    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: messages,
        config: config
      }),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "请求失败");
    }

    return data.text || "抱歉，我没有生成有效的内容。";

  } catch (error: any) {
    console.error("AI Service Error:", error);
    if (error.name === 'AbortError') {
       return "助手响应超时。网络可能较慢，请稍后再试。";
    }
    return `助手暂时不可用: ${error.message || "未知错误"}`;
  }
};