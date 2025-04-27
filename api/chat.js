석남동나이트메어
monkey_nightmare
오프라인 표시



석남동나이트메어
 님이 착륙하셨어요. — 오전 10:24
사자님 — 오전 10:24
석남동나이트메어 — 오전 10:25
사자님 — 오전 10:25
음성으로 들어오실건가요?
석남동나이트메어 — 오전 10:25
네!
Vercel Free Plan에서 Gemini API (gemini-2.5-pro-exp-03-25) 사용 중 504 타임아웃 문의

제미니와 챗지피티를 통해 간단한 웹 챗봇을 개발하고 Vercel Free Plan에 배포했습니다. 백엔드에서는 Vercel Functions를 이용해 Google Gemini API (gemini-2.5-pro-exp-03-25 모델)를 호출하고 있습니다.

챗봇 사용 중, 특히 대화 기록이 길어지거나 시스템 프롬프트와 조합되었을 때 504 Gateway Timeout 오류가 발생하고 있습니다. Vercel 로그를 확인해보니, 백엔드 함수가 Google API 응답을 기다리다 10초 시간 제한을 초과하여 종료되는 것으로 파악됩니다.
(라고 제미니한테 물으니 이렇게 답변했습니다.)
확장
오류 문의 (코드).txt
5KB
혹시 자바,스타일 등이 문제여서 연결이 안 되는 건가해서 흰 페이지로 시도해도 영원히 504 코드가 떴습니다!
사자님 — 오전 10:32
module.exports = async (req, res) => {
    // CORS 설정 (프론트엔드와 백엔드가 다른 출처일 수 있으므로 필요)
    // 여기서는 모든 출처 (*) 에서 요청을 허용하도록 간단히 설정합니다.
    // 실제 운영 환경에서는 특정 프론트엔드 주소만 허용하도록 수정하는 것이 좋습니다.
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
확장
modify.txt
4KB
석남동나이트메어 — 오후 1:57
흑흑 선생님..
먼가 모델이 미묘하게 멍청해서 다시 확인하니... 2.0플래시로 되어있었네요... 

(제가 제일 바보..)
한번 확인해주시겠어요..?
저희는 해골물을 먹은 것 같습니다.. 
---

2.5프로로 수정해서 배포하니 다시 504 오류가 떳습니다... 😭😭
이미지
사자님 — 오후 1:57
잠시만용 확인해볼게요~
사자님 — 오후 2:10
혹시
postman 써보셨나요?
선생님 계실까용~~~
석남동나이트메어 — 오후 2:15
앗 ! 아니요 ! 처음봤습니다!
사자님 — 오후 2:15
그러면 가능하시다면
api key 를 공유해주실 수 있으실까요?
확인 후 바로
삭제하겠습니다
예민한 부분이라 좀 그렇다하시면 제가 postman 사용법을 알려드릴게요
일단 키는 삭제했구요, 연결 테스트 시에는 문제가 없는데
석남동나이트메어 — 오후 2:21
헉 넵
사자님 — 오후 2:21
이걸 실제 웹에서 연결해서
테스트를 좀 해보려고 해요
잠시만 기다려주세요~
석남동나이트메어 — 오후 2:21
넵 감사합니다!
사자님 — 오후 2:26
이상하네요 제 쪽에서 접속 테스트는 잘 되는데
잠깐 음성 채널 들어오실 수 있으실까요?
석남동나이트메어 — 오후 2:27
앗 넵!!

잠시만요 !!!
사자님 — 오후 2:29
요거 그냥 더블클릭해서 실행하시면 됩니다
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <title>Gemini API 브라우저 테스트</title>
</head>
확장
gemini-test.html
2KB
석남동나이트메어 — 오후 2:30
vercel.com
https://vercel.com/
Vercel
Vercel: Build and deploy the best web experiences with the Frontend...
Vercel's Frontend Cloud gives developers the frameworks, workflows, and infrastructure to build a faster, more personalized web.
Vercel: Build and deploy the best web experiences with the Frontend...
석남동나이트메어 — 오후 2:39
첨부 파일 형식: archive
api.zip
30.25 KB
사자님 — 오후 2:49
요대로 한 번 반영해서
// api/chat.js 파일 내용

// 환경 변수에서 API 키를 가져옵니다. Vercel 설정에서 추가해야 합니다.
const { GEMINI_API_KEY } = process.env;

// 구글 Generative AI 라이브러리를 사용해도 좋지만,
확장
chat.js
5KB
실행해보시겠어요?
석남동나이트메어 — 오후 2:52
이미지
사자님 — 오후 3:21
선생님
계십니까
ㅋㅋㅋㅋㅋㅋㅋㅋ
아 이거 504 에러가
석남동나이트메어 — 오후 3:21
🥹  네에..
사자님 — 오후 3:21
에러 메세지가 이상하게 나왔네...
이미지
석남동나이트메어 — 오후 3:21
헉 뭐야잇
😲  어케 하셨지..
사자님 — 오후 3:22
ㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋ
이거
fetch 경로 문제였네요
...ㅎㅎ...
석남동나이트메어 — 오후 3:22
😍  네에?~?~?~?~
사자님 — 오후 3:22
일단 파일 드릴게요
석남동나이트메어 — 오후 3:22
뭔지 모르겠지만 두근거려요
사자님 — 오후 3:23
이거 파일만
// --- 전역 변수 ---
let userProfileImgUrl = "";
let botProfileImgUrl = "";
let conversationHistory = [];
let SYSTEM_PROMPT = '';
let currentSlot = 1;... (29KB 남음)
확장
script.js
79KB
바꿔치기 해보세요
수정한건
const response = await fetch('https://ian-chatbot.vercel.app/api/chat', { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ contents: apiContents }) });
여기 https 부분 수정한거거든요
2.5-pro-exp-03-25 버전에서 아주 잘 실행됩니다..
ㅎㅎㅎ확인만 해주시면 제공해주신 키나 파일들 삭제처리로 마무리 하겠습니다~
석남동나이트메어 — 오후 3:24
꺅
사자님 — 오후 3:24
되나요?
석남동나이트메어 — 오후 3:25
😭 🫶 🫶
됩니다..
사자님 — 오후 3:25
다행이네요!!!
석남동나이트메어 — 오후 3:25
감사합니다.......................
진짜 구세주세요
😍
사자님 — 오후 3:25
ㅎㅎㅎㅎㅎㅎ
이 정도는 해야죠 저는 이걸로 밥 벌어먹고 사는 사람인데
ㅋㅋㅋㅋㅋㅋㅋ
석남동나이트메어 — 오후 3:26
ㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋ ㅠㅠㅠ 세기의 천재세요 챗지피티보다 똑똑한 여성 ㅠㅠ😭 🫶  정말 감사해요...
사자님 — 오후 3:26
네네~~~ 해결 잘 되어서 다행이구, 좋은 하루 되세요!
석남동나이트메어 — 오후 3:26
좋은 하루 되세요!
﻿
// api/chat.js 파일 내용

// 환경 변수에서 API 키를 가져옵니다. Vercel 설정에서 추가해야 합니다.
const { GEMINI_API_KEY } = process.env;

// 구글 Generative AI 라이브러리를 사용해도 좋지만,
// 프론트엔드와 유사하게 fetch를 사용하는 방식으로 작성하여 이해를 돕습니다.
// 실제 라이브러리 사용 시 더 편리하고 안정적일 수 있습니다.

export default async function handler(req, res) {
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
		// 타임아웃 설정
		const controller = new AbortController();
		const timeout = setTimeout(() => {
			controller.abort(); // 일정 시간 지나면 요청 강제 중단
		}, 120000); // 120초 (2분)


        if (!contents || !Array.isArray(contents)) {
             res.status(400).json({ error: 'Invalid request body: contents array is missing.' });
             return;
        }

        // 구글 Gemini API 엔드포인트 (프론트엔드에서 직접 호출했던 주소)
        const API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro-exp-03-25:generateContent";

        // 구글 Gemini API 호출 (API 키는 백엔드에서 사용)
        const googleRes = await fetch(`${API_URL}?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            // 프론트엔드에서 받은 대화 내용을 그대로 구글 API로 보냅니다.
            // === 여기를 수정합니다 ===
            body: JSON.stringify({
                contents: contents,
                generationConfig: {
                    temperature: 0.7,         // <<-- 온도 설정 (0.0 ~ 1.0 이상, 높을수록 창의적)
                    maxOutputTokens: 2048,    // <<-- 최대 출력 토큰 설정 (길이 제한 늘리기)
                    topP: 0.95,               // <<-- Top-p 샘플링 (선택적, 보통 0.9~1.0)
                    // topK: 40               // <<-- Top-k 샘플링 (선택적, 보통 40 전후)
                }
            }),
            // === 수정 끝 ===
			signal: controller.signal // 컨트롤러 연결
        });
		
		clearTimeout(timeout);

        // 구글 API 응답 확인
        if (!googleRes.ok) {
            const errorData = await googleRes.json();
            console.error("Error calling Google API:", googleRes.status, errorData);
            res.status(googleRes.status).json({ error: `Error from Google API: ${errorData.error?.message || googleRes.statusText}` });
            return;
        }

        // 구글 API 응답을 JSON으로 파싱
        const googleData = await googleRes.json();


        // 파싱된 응답을 프론트엔드로 다시 보냅니다.
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
chat.js
5KB
