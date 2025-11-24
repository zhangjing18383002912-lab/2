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

  try {
    const { messages, config } = req.body;

    if (!messages || !config || !config.apiKey || !config.baseUrl) {
      return res.status(400).json({ error: 'Missing configuration. Please check settings.' });
    }

    // 2. 构建目标 URL
    // 自动处理 URL 结尾的斜杠和路径
    let targetUrl = config.baseUrl;
    if (targetUrl.endsWith('/')) {
        targetUrl = targetUrl.slice(0, -1);
    }
    // 如果用户只填了域名 (如 https://api.deepseek.com)，自动补全 /chat/completions
    // 如果用户填了完整路径，则保留
    if (!targetUrl.includes('/chat/completions')) {
        targetUrl = `${targetUrl}/chat/completions`;
    }

    // 3. 转发请求到第三方 API (DeepSeek, OpenAI, Moonshot, etc.)
    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey.trim()}`
      },
      body: JSON.stringify({
        model: config.model || 'deepseek-chat',
        messages: messages, // 传入完整的对话历史
        temperature: 0.7,
        max_tokens: 1000,
        stream: false
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Upstream API Error:", data);
      const errorMsg = data.error?.message || `API Status: ${response.status}`;
      return res.status(response.status).json({ error: `第三方 API 报错: ${errorMsg}` });
    }

    // 4. 解析标准 OpenAI 格式响应
    // 绝大多数 AI 提供商（DeepSeek, Moonshot, Chatbox）都遵循此格式
    const text = data.choices?.[0]?.message?.content || "没有收到回复内容。";

    return res.status(200).json({ text });

  } catch (error: any) {
    console.error("Proxy Error:", error);
    return res.status(500).json({ error: `服务器代理错误: ${error.message}` });
  }
}