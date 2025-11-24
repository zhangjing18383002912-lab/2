// 不再在前端直接引入 GoogleGenAI，减少打包体积并避免网络问题
// 所有的逻辑已移动到 api/chat.ts

export const askMedicalAssistant = async (question: string, context: string): Promise<string> => {
  try {
    // 发送请求给自己的 Vercel 后端 (/api/chat)
    // 这样请求就是：浏览器 -> Vercel (海外) -> Google
    // 从而绕过本地的网络限制
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ question, context }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `请求失败: ${response.status}`);
    }

    return data.text;

  } catch (error: any) {
    console.error("Chat API Error:", error);
    
    // 友好的错误提示
    if (error.message.includes("404")) {
      return "配置错误：未找到后端 API。请确保文件 'api/chat.ts' 存在且 Vercel 部署正确。";
    }
    
    return `连接助手失败: ${error.message || "请稍后再试"}`;
  }
};