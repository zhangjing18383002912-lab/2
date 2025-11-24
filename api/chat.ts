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
      return res.status(400).json({ error: '配置缺失，请检查 API Key 和 Base URL 设置。' });
    }

    // 2. 构建目标 URL
    // 去除首尾空格
    let targetUrl = (config.baseUrl || "").trim();
    
    // 去除结尾斜杠
    if (targetUrl.endsWith('/')) {
        targetUrl = targetUrl.slice(0, -1);
    }
    
    // 智能补全: 如果 URL 不包含 /chat/completions，则添加它
    // 这样可以兼容用户填写的 "https://api.deepseek.com" 或 "https://api.deepseek.com/chat/completions"
    if (!targetUrl.includes('/chat/completions')) {
        targetUrl = `${targetUrl}/chat/completions`;
    }

    // 3. 转发请求到第三方 API
    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey.trim()}`
      },
      body: JSON.stringify({
        model: config.model || 'deepseek-chat',
        messages: messages,
        temperature: 0.7,
        max_tokens: 1000,
        stream: false
      })
    });

    // 4. 安全处理响应 (防止返回 HTML 导致 JSON 解析崩溃)
    const responseText = await response.text();
    let data;

    try {
        data = JSON.parse(responseText);
    } catch (e) {
        // 解析失败，说明返回的不是 JSON (很可能是 HTML 404/403 页面)
        console.error("Upstream returned non-JSON:", responseText.slice(0, 200));
        
        // 尝试提取 HTML title 以帮助调试
        const titleMatch = responseText.match(/<title>(.*?)<\/title>/i);
        const title = titleMatch ? titleMatch[1] : '未知页面';
        
        return res.status(500).json({ 
            error: `API 地址错误或服务不可用。目标服务器返回了网页而非 JSON 数据。\n请求地址: ${targetUrl}\n网页标题: ${title}\n请检查 Base URL 是否正确。` 
        });
    }

    if (!response.ok) {
      console.error("Upstream API Error:", data);
      const errorMsg = data.error?.message || JSON.stringify(data.error) || `Status: ${response.status}`;
      return res.status(response.status).json({ error: `第三方 API 报错: ${errorMsg}` });
    }

    // 5. 解析标准 OpenAI 格式响应
    const text = data.choices?.[0]?.message?.content || "没有收到回复内容。";

    return res.status(200).json({ text });

  } catch (error: any) {
    console.error("Proxy Error:", error);
    return res.status(500).json({ error: `服务器内部错误: ${error.message}` });
  }
}