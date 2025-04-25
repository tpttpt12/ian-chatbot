// index.js 파일 (예시)

// 라이브러리 임포트
const { GoogleGenerativeAI } = require("@google/generative-ai");

// 발급받은 API 키를 여기에 입력합니다.
// 실제 서비스에서는 환경 변수 등을 사용하는 것이 더 안전합니다.
const API_KEY = "AIzaSyDAIlig95Mz1zdBf0Ey7vQFm56ktGN8U9I"; // <-- !!! 중요: 실제 키를 여기에 직접 입력하거나 더 안전한 방법을 사용하세요 !!!

// Gemini API 클라이언트 초기화
const genAI = new GoogleGenerativeAI(API_KEY);

async function run() {
  try {
    // 사용하려는 특정 모델 지정
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro-exp-03-25" });

    // 모델에 전달할 프롬프트 정의
    const prompt = "안녕하세요! 당신은 누구인가요?";

    // 텍스트 생성 요청 보내기
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text(); // 생성된 텍스트 가져오기

    // 결과 출력
    console.log(text);

  } catch (error) {
    console.error("API 호출 중 오류가 발생했습니다:", error);
  }
}

run();