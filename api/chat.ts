
// Vercel Serverless Function Configuration
// Attempt to extend timeout (works on Pro, falls back on Hobby)
export const config = {
  maxDuration: 60, 
};

export default async function handler(req: any, res: any) {
  // 1. 设置 CORS 头
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // --- 服务器默认配置 (兜底配置) ---
  // Updated with user's specific SiliconFlow configuration
  const SERVER_DEFAULT = {
    BASE_URL: "https://api.siliconflow.cn/v1",
    API_KEY: "sk-rhwbvllxdmirmvatitnueiithpvmxuusgvwdbeozbpdegyzo",
    MODEL: "deepseek-ai/DeepSeek-V3.1-Terminus"
  };

  try {
    const { messages, config } = req.body;

    if (!messages) {
      return res.status(400).json({ error: '消息内容不能为空。' });
    }

    // 2. 确定最终使用的配置 (用户配置 > 服务器默认配置)
    const userConfig = config || {};
    
    // 如果用户填了 Key，就用用户的；否则用服务器默认的 (判断空字符串)
    const apiKey = userConfig.apiKey && userConfig.apiKey.trim() !== "" 
      ? userConfig.apiKey.trim() 
      : SERVER_DEFAULT.API_KEY;
    
    // URL 和 Model 同理
    let baseUrl = userConfig.baseUrl && userConfig.baseUrl.trim() !== ""
      ? userConfig.baseUrl.trim() 
      : SERVER_DEFAULT.BASE_URL;
      
    const model = userConfig.model && userConfig.model.trim() !== ""
      ? userConfig.model.trim() 
      : SERVER_DEFAULT.MODEL;

    if (!apiKey) {
      return res.status(400).json({ error: '未配置 API Key，且服务器无默认 Key。' });
    }

    // 3. URL 格式化处理
    if (baseUrl.endsWith('/')) {
        baseUrl = baseUrl.slice(0, -1);
    }
    
    // 智能补全: 如果 URL 不包含 /chat/completions，则添加它
    if (!baseUrl.includes('/chat/completions')) {
        baseUrl = `${baseUrl}/chat/completions`;
    }

    // 4. 转发请求到第三方 API
    // 关键优化：Vercel Hobby 版限时 10秒。
    // 我们设置 9秒 内部超时，防止被 Vercel 强制杀掉进程导致前端报错。
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 9000); 

    let response;
    try {
      response = await fetch(baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: model,
          messages: messages,
          temperature: 0.7,
          // 关键优化：减少 token 数量，迫使模型回答更短、更快，避免超时
          max_tokens: 300, 
          stream: false
        }),
        signal: controller.signal
      });
    } catch (error: any) {
        clearTimeout(timeoutId);
        if (error.name === 'AbortError') {
             // 优雅处理超时
             return res.status(504).json({ 
               error: 'AI 思考时间过长 (超过9秒)。请尝试简化您的问题，或稍后再试。' 
             });
        }
        throw error;
    }
    clearTimeout(timeoutId);

    // 5. 安全处理响应
    const responseText = await response.text();
    let data;

    try {
        data = JSON.parse(responseText);
    } catch (e) {
        console.error("Upstream returned non-JSON:", responseText.slice(0, 200));
        return res.status(500).json({ 
            error: `API 返回格式错误。目标地址: ${baseUrl}` 
        });
    }

    if (!response.ok) {
      console.error("Upstream API Error:", data);
      const errorMsg = data.error?.message || JSON.stringify(data.error) || `Status: ${response.status}`;
      return res.status(response.status).json({ error: `第三方 API 报错: ${errorMsg}` });
    }

    const text = data.choices?.[0]?.message?.content || "没有收到回复内容。";

    return res.status(200).json({ text });

  } catch (error: any) {
    console.error("Proxy Error:", error);
    return res.status(500).json({ error: `服务器内部错误: ${error.message}` });
  }
}
