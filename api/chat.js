// api/chat.js 파일 내용 (라이브러리 사용 버전)

// Google Generative AI 라이브러리 임포트
const { GoogleGenerativeAI } = require("@google/generative-ai");

// 환경 변수에서 API 키를 가져옵니다. (Vercel 설정에서 GEMINI_API_KEY 추가 필수)
const API_KEY = process.env.GEMINI_API_KEY;

module.exports = async (req, res) => {
    // CORS 설정 (프론트엔드와 백엔드가 다른 출처일 수 있으므로 필요)
    // 실제 운영 환경에서는 '*' 대신 특정 프론트엔드 주소만 허용하도록 수정하는 것이 좋습니다.
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    // 필요하다면 인증 정보 (쿠키 등)를 프론트엔드와 주고받을 때 사용
    res.setHeader('Access-Control-Allow-Credentials', 'true');


    // OPTIONS 요청 처리 (CORS 사전 요청)
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    // POST 요청만 처리
    if (req.method !== 'POST') {
        res.status(405).send('Method Not Allowed');
        return;
    }

    // API 키가 설정되지 않았다면 에러 반환
    if (!API_KEY) {
        console.error("GEMINI_API_KEY is not set in environment variables.");
        // 클라이언트에게 API 키 설정이 안 되었음을 알림
        res.status(500).json({ error: 'Server configuration error: API Key missing. Please check environment variables.' });
        return;
    }

    try {
        // 프론트엔드에서 보낸 데이터 (contents 배열과 modelName)를 요청 본문에서 가져옵니다.
        const { contents, modelName: requestedModelName } = req.body;

        // contents는 대화 이력을 담는 배열이므로 필수적으로 필요하다고 가정합니다.
        if (!contents || !Array.isArray(contents)) {
             res.status(400).json({ error: 'Invalid request body: "contents" array is missing or invalid.' });
             return;
        }

        // --- 사용할 모델 선택 로직 ---
        // 기본 모델은 원하는 것으로 설정 (예: 2.5 Pro Exp)
        let modelToUse = "gemini-2.5-pro-exp-03-25"; // <-- 기본값 또는 2.5 모델로 설정

        // 프론트엔드에서 modelName을 함께 보냈는지 확인하고 유효하면 사용
        if (requestedModelName && typeof requestedModelName === 'string') {
            // 중요: 여기에서 프론트엔드로부터 받은 모델 이름(requestedModelName)이
            // 실제로 사용 가능한 모델 이름 목록에 있는지 검증하는 로직을 추가하는 것이 좋습니다.
            // 예를 들어, ["gemini-pro", "gemini-1.5-flash", "gemini-2.5-pro-exp-03-25"] 등
            const validModels = ["gemini-2.0-flash"]; // <-- 사용 가능한 모델 목록 정의
            if (validModels.includes(requestedModelName)) {
                 modelToUse = requestedModelName; // 유효하면 해당 모델 사용
            } else {
                 console.warn(`[Backend] Received invalid requested model name: "${requestedModelName}". Using default model: "${modelToUse}"`);
                 // 유효하지 않은 모델 이름이 왔을 경우 오류 응답을 보낼 수도 있습니다.
                 // return res.status(400).json({ error: `Invalid model name provided: ${requestedModelName}. Valid models are: ${validModels.join(', ')}` });
            }
        }
        console.log(`[Backend] Using model: ${modelToUse}`); // 사용될 모델 로깅
        // --- 모델 선택 로직 끝 ---


        // Google Generative AI 클라이언트 초기화
        const genAI = new GoogleGenerativeAI(API_KEY);

        // *** 선택된 모델 이름(modelToUse)으로 모델 인스턴스 가져오기 ***
        const model = genAI.getGenerativeModel({ model: modelToUse });

        // 모델에게 보낼 요청 객체 생성
        // contents 배열을 그대로 전달하여 대화 이력을 사용합니다.
        const request = { contents: contents };

        // 모델 호출
        const result = await model.generateContent(request); // <-- 라이브러리 사용

        // 응답 파싱
        const response = await result.response;
        // 응답 본문에서 텍스트 추출 (라이브러리가 파싱해 줌)
        const generatedText = response.text();

        // 결과를 JSON 형태로 프론트엔드에 응답
        // 여기서는 간단히 텍스트만 포함하여 응답합니다.
        res.status(200).json({ text: generatedText });

    } catch (error) {
        console.error('[Backend] Error calling Gemini API:', error);
        // API 호출 실패 시 오류 응답
        // Google API에서 오는 상세 오류 메시지를 포함하여 프론트엔드에 전달
        let errorMessage = 'An unexpected error occurred on the server.';
        if (error.message) {
            errorMessage = `API Error: ${error.message}`;
        } else if (error.response && error.response.text) {
             // fetch 방식에서 오류 텍스트를 얻는 방식과 유사하게 처리할 수도 있지만,
             // 라이브러리는 보통 error.message에 상세 정보를 담습니다.
            errorMessage = `API Error: ${await error.response.text()}`; // 혹시 response 객체가 있다면 텍스트 추출 시도
        }


        res.status(500).json({
            error: errorMessage,
            // 개발 환경에서 디버깅을 위해 스택 트레이스 포함 (선택 사항)
            stack: process.env.NODE_ENV !== 'production' ? error.stack : undefined
        });
    }
};
