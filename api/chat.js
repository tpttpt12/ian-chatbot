const { GEMINI_API_KEY } = process.env;

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        res.status(405).send('Method Not Allowed');
        return;
    }

    if (!GEMINI_API_KEY) {
        console.error("GEMINI_API_KEY is not set in environment variables.");
        res.status(500).json({ error: 'Server configuration error: API Key missing.' });
        return;
    }

    try {
        const { contents } = req.body;
        
        const controller = new AbortController();
        const timeout = setTimeout(() => {
            controller.abort();
        }, 120000);

        if (!contents || !Array.isArray(contents)) {
             res.status(400).json({ error: 'Invalid request body: contents array is missing.' });
             return;
        }

        const API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-04-17:generateContent";

        const googleRes = await fetch(`${API_URL}?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: contents,
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 8192,
                    topP: 0.95
                },
                safetySettings: [
                    {
                        category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                        threshold: "BLOCK_NONE"
                    },
                    {
                        category: "HARM_CATEGORY_HARASSMENT", 
                        threshold: "BLOCK_NONE"
                    },
                    {
                        category: "HARM_CATEGORY_HATE_SPEECH",
                        threshold: "BLOCK_NONE" 
                    },
                    {
                        category: "HARM_CATEGORY_DANGEROUS_CONTENT",
                        threshold: "BLOCK_NONE"
                    }
                ]
            }),
            signal: controller.signal
        });
        
        clearTimeout(timeout);

        if (!googleRes.ok) {
            const errorData = await googleRes.json();
            console.error("Error calling Google API:", googleRes.status, errorData);
            res.status(googleRes.status).json({ error: `Error from Google API: ${errorData.error?.message || googleRes.statusText}` });
            return;
        }

        const googleData = await googleRes.json();
        res.status(200).json(googleData);

    } catch (error) {
        console.error("Backend Error:", error);
        if (error.name === 'AbortError') {
            res.status(504).json({ error: 'Request timeout.' });
        } else {
            res.status(500).json({ error: 'An unexpected error occurred on the server.' });
        }
    }
};
