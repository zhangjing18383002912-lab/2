
/**
 * 调用 AI 助手 (流式模式)
 * 能够逐字显示结果，有效防止 Vercel 超时
 */
export const streamMedicalAssistant = async (
  question: string, 
  context: string,
  onChunk: (text: string) => void
): Promise<void> => {
  const systemInstruction = `
    你是一位专业的胃癌科普 AI 顾问 (Dr. AI)。
    
    当前上下文: ${context || '通用模式'}
    
    规则:
    1. 语言: 简体中文。
    2. 风格: 专业、温暖、富有同理心。
    3. 格式: 使用清晰的 Markdown。
    4. 免责: 必须表明你提供的是科普信息，不能替代医生诊断。
  `;

  const messages = [
    { role: "system", content: systemInstruction },
    { role: "user", content: question }
  ];

  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages }),
    });

    if (!response.ok) {
      const errJson = await response.json().catch(() => ({}));
      throw new Error(errJson.error || `连接失败 (${response.status})`);
    }

    if (!response.body) throw new Error("无响应数据");

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let done = false;
    let buffer = ''; // Buffer to hold incomplete lines

    while (!done) {
      const { value, done: doneReading } = await reader.read();
      done = doneReading;
      const chunkValue = decoder.decode(value, { stream: true });
      
      // Append new chunk to buffer
      buffer += chunkValue;
      
      // Split by newlines
      const lines = buffer.split('\n');
      
      // The last element is likely incomplete (or empty string if ends with \n), keep it in buffer
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmedLine = line.trim();
        if (!trimmedLine) continue;

        if (trimmedLine.startsWith('data: ')) {
          const dataStr = trimmedLine.slice(6);
          if (dataStr === '[DONE]') break;
          try {
            const data = JSON.parse(dataStr);
            const content = data.choices?.[0]?.delta?.content || '';
            if (content) {
              onChunk(content);
            }
          } catch (e) {
            // Ignore parse errors for truly partial chunks that shouldn't happen with line buffering
            console.warn("JSON parse error", e);
          }
        }
      }
    }
  } catch (error: any) {
    console.error("AI Stream Error:", error);
    onChunk(`\n\n[连接错误: ${error.message}]`);
  }
};

// 兼容旧接口，直接调用流式
export const askMedicalAssistant = async (
  question: string, 
  context: string
): Promise<string> => {
  let fullText = "";
  await streamMedicalAssistant(question, context, (chunk) => {
    fullText += chunk;
  });
  return fullText;
};
