// api/chat.js 파일 내용

// 환경 변수에서 API 키를 가져옵니다. Vercel 설정에서 추가해야 합니다.
const { GEMINI_API_KEY } = process.env;

// 구글 Generative AI 라이브러리를 사용해도 좋지만,
// 프론트엔드와 유사하게 fetch를 사용하는 방식으로 작성하여 이해를 돕습니다.
// 실제 라이브러리 사용 시 더 편리하고 안정적일 수 있습니다.

module.exports = async (req, res) => {
    // CORS 설정 (프론트엔드와 백엔드가 다른 출처일 수 있으므로 필요)
    // 여기서는 모든 출처 (*) 에서 요청을 허용하도록 간단히 설정합니다.
    // 실제 운영 환경에서는 특정 프론트엔드 주소만 허용하도록 수정하는 것이 좋습니다.
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // OPTIONS 요청 처리 (CORS 사전 요청)
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    // POST 요청 처리
    if (req.method !== 'POST') {
        res.status(405).send('Method Not Allowed');
        return;
    }

    // API 키가 설정되지 않았다면 에러 반환
    if (!GEMINI_API_KEY) {
        console.error("GEMINI_API_KEY is not set in environment variables.");
        res.status(500).json({ error: 'Server configuration error: API Key missing.' });
        return;
    }

    try {
        // 프론트엔드에서 보낸 대화 내용(contents)을 요청 본문에서 가져옵니다.
        const { contents } = req.body;

        if (!contents || !Array.isArray(contents)) {
             res.status(400).json({ error: 'Invalid request body: contents array is missing.' });
             return;
        }

        // 구글 Gemini API 엔드포인트 (프론트엔드에서 직접 호출했던 주소)
        const API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

        // 구글 Gemini API 호출 (API 키는 백엔드에서 사용)
        const googleRes = await fetch(`${API_URL}?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            // 프론트엔드에서 받은 대화 내용을 그대로 구글 API로 보냅니다.
            body: JSON.stringify({ contents: contents })
        });

// 구글 API 응답 확인
        if (!googleRes.ok) {
            // 응답이 성공적이지 않다면 JSON 대신 텍스트로 오류 정보 시도
            const errorText = await googleRes.text(); // <-- 수정된 부분
            console.error("Error calling Google API:", googleRes.status, errorText);

            // 프론트엔드에 보낼 오류 메시지 구성
            let displayErrorMessage = `Error from Google API: ${googleRes.status}`;
            try {
                // 만약 오류 응답이 JSON 형태였다면 파싱해서 메시지 추가 시도
                const errorJson = JSON.parse(errorText);
                displayErrorMessage += `: ${errorJson.error?.message || errorText}`;
            } catch (e) {
                // JSON 파싱 실패 시 텍스트 오류 메시지 그대로 사용
                displayErrorMessage += `: ${errorText}`;
            }

            res.status(googleRes.status).json({ error: displayErrorMessage });
            return;
        }

        // 구글 API 응답을 JSON으로 파싱
        const googleData = await googleRes.json();

        // 파싱된 응답을 프론트엔드로 다시 보냅니다.
        res.status(200).json(googleData);

    } catch (error) {
        console.error("Backend Error:", error);
        res.status(500).json({ error: 'An unexpected error occurred on the server.' });
    }
};
