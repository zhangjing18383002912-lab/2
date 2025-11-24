// 此服务调用 Vercel 后端 (/api/chat) 以绕过网络限制并保护 Key

export const askMedicalAssistant = async (question: string, context: string): Promise<string> => {
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ question, context }),
    });

    const data = await response.json();

    if (!response.ok) {
      // 优先使用后端返回的 error 字段
      throw new Error(data.error || `请求失败: ${response.status}`);
    }

    return data.text;

  } catch (error: any) {
    console.error("Chat Client Error:", error);
    
    const errorMsg = (error.message || "").toLowerCase();
    
    // 针对旧版本代码缓存的特定错误
    if (errorMsg.includes("missing in vercel environment variables")) {
      return "部署更新中... 请等待几分钟后刷新页面。服务器正在应用新的 API Key。";
    }

    if (errorMsg.includes("404")) {
      return "连接错误：未找到后端服务 (404)。如果您在本地运行，请确保已启动 API 服务；如果在 Vercel，请检查部署状态。";
    }
    
    if (errorMsg.includes("api key") || errorMsg.includes("key not valid")) {
      return "配置错误：API Key 无效。请检查 Vercel 环境变量或代码设置。";
    }
    
    if (errorMsg.includes("failed to fetch")) {
      return "网络错误：无法连接到服务器。请检查您的网络连接。";
    }
    
    return `助手暂时不可用: ${error.message}`;
  }
};