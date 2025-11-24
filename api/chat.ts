
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
  // 当用户在前端没有填写 Key 时，使用此处的配置。
  // Key 保存在服务器端，前端用户无法直接查看。
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
    
    // 如果用户填了 Key，就用用户的；否则用服务器默认的
    const apiKey = userConfig.apiKey ? userConfig.apiKey.trim() : SERVER_DEFAULT.API_KEY;
    
    // URL 和 Model 同理，如果前端传了空或者是默认初始值，我们也可以在这里兜底，
    // 但通常前端会传有效值。为了保险，如果为空则使用默认。
    let baseUrl = userConfig.baseUrl ? userConfig.baseUrl.trim() : SERVER_DEFAULT.BASE_URL;
    const model = userConfig.model ? userConfig.model.trim() : SERVER_DEFAULT.MODEL;

    if (!apiKey) {
      return res.status(400).json({ error: '未配置 API Key，且服务器无默认 Key。' });
    }

    // 3. URL 格式化处理
    if (baseUrl.endsWith('/')) {
        baseUrl = baseUrl.slice(0, -1);
    }
    
    // 智能补全: 如果 URL 不包含 /chat/completions，则添加它
    // SiliconFlow 的地址通常是 https://api.siliconflow.cn/v1/chat/completions
    if (!baseUrl.includes('/chat/completions')) {
        baseUrl = `${baseUrl}/chat/completions`;
    }

    // 4. 转发请求到第三方 API
    const response = await fetch(baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: model,
        messages: messages,
        temperature: 0.7,
        max_tokens: 1000,
        stream: false
      })
    });

    // 5. 安全处理响应
    const responseText = await response.text();
    let data;

    try {
        data = JSON.parse(responseText);
    } catch (e) {
        console.error("Upstream returned non-JSON:", responseText.slice(0, 200));
        const titleMatch = responseText.match(/<title>(.*?)<\/title>/i);
        const title = titleMatch ? titleMatch[1] : '未知页面';
        
        return res.status(500).json({ 
            error: `API 请求失败。目标服务器返回了网页而非 JSON。\n目标地址: ${baseUrl}\n网页标题: ${title}` 
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