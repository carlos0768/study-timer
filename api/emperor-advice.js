export default async function handler(req, res) {
    // CORSヘッダーを設定
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // OPTIONSリクエスト（プリフライト）への対応
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { prompt } = req.body;

        if (!prompt) {
            return res.status(400).json({ error: 'Prompt is required' });
        }

        // Vercel環境変数からAPIキーを取得
        const apiKey = process.env.OPENAI_API_KEY;
        
        if (!apiKey) {
            return res.status(500).json({ error: 'API key not configured' });
        }

        // OpenAI APIを呼び出し
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'gpt-4o-mini',
                messages: [
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                max_tokens: 150,
                temperature: 0.8
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error?.message || 'OpenAI API error');
        }

        const data = await response.json();
        const advice = data.choices[0].message.content.trim();

        res.status(200).json({ advice });

    } catch (error) {
        console.error('Emperor advice error:', error);
        res.status(500).json({ 
            error: 'Failed to get emperor advice',
            message: error.message 
        });
    }
}