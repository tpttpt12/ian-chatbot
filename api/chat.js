// --- 메시지 전송 함수 수정 (이제 백엔드 서버리스 함수를 호출) ---
 async function sendMessage() {
     const message = userInput.value.trim();
     if (!message) return;

     sendButton.disabled = true;
     userInput.disabled = true;

     appendMessage("user", message);
     // 대화 히스토리에는 사용자 메시지를 먼저 추가합니다.
     conversationHistory.push({
         role: "user",
         parts: [{ text: message }]
     });

     try {
         // 🚨 구글 API 엔드포인트 대신 Vercel 서버리스 함수 엔드포인트 호출 🚨
         // 🚨 API 키는 더 이상 URL에 포함시키지 않습니다 🚨
         const res = await fetch(
             `/api/chat`, // Vercel 서버리스 함수의 경로
             {
                 method: "POST",
                 headers: {
                     "Content-Type": "application/json",
                 },
                 // 서버리스 함수로 현재까지의 대화 히스토리 전체를 보냅니다.
                 body: JSON.stringify({ contents: conversationHistory }),
             }
         );

         // Vercel 서버리스 함수 응답 확인
         if (!res.ok) {
             const errorData = await res.json();
             console.error("API (Backend) Error:", res.status, errorData);
             appendMessage("bot", `(오류 발생: ${res.status} - ${errorData.error?.error?.message || errorData.error || res.statusText})`);
             // 에러 발생 시 마지막 사용자 메시지를 히스토리에서 제거
             conversationHistory.pop();

         } else {
             // Vercel 서버리스 함수로부터 받은 응답은 이미 구글 API의 응답 구조와 같아야 합니다.
             const data = await res.json();
             const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "(응답 없음)";
             appendMessage("bot", reply);

             // 봇 응답을 대화 히스토리에 추가
             conversationHistory.push({
                 role: "model",
                 parts: [{ text: reply }]
             });
         }

     } catch (error) {
         console.error("Fetch Error:", error);
         appendMessage("bot", "(통신 오류 발생)");
         // 에러 발생 시 마지막 사용자 메시지를 히스토리에서 제거
         conversationHistory.pop();
     } finally {
         sendButton.disabled = false;
         userInput.disabled = false;
         userInput.focus();
     }
 }
 // --- sendMessage 함수 수정 끝 ---

 // ... appendMessage 함수 (이전과 동일하게 두면 됩니다) ...
 // ... 이미지 변경 관련 코드 (이전과 동일하게 두면 됩니다) ...

 // 초기 메시지 예시 (이전과 동일)
 // appendMessage("bot", "...당신은 나의 피주머니... 그래, 이곳에 왔군요...");

</script>
