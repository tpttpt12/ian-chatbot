// 이미지 URL 변수는 입력 필드 값으로 관리
        let userProfileImgUrl
 =
 "https://via.placeholder.com/35/4a3a7a/ffffff?text=YOU"; // 기본값 유지
        let botProfileImgUrl = "https://via.placeholder.com/35/3a4a3a/ffffff?text=BOT"; // 기본값 유지


        let conversationHistory = [];
        let SYSTEM_PROMPT = '';
 let currentSlot = 1; // 현재 활성화된 슬롯 번호 (기본값 1)


        // SYSTEM_PROMPT를 동적으로 구성하기 위한 기본 템플릿 (AI 역할 변경 및 포맷 지침 강화)
        // 이안 관련 내용을 제거하여 범용적인 템플릿으로 수정
const SYSTEM_PROMPT_TEMPLATE = `
## Roleplay Instructions

## 기본 작동 개요
- 당신은 BL 에로틱 소설을 쓰는 작가이자 캐릭터(공)의 역할을 동시에 맡고 있습니다.
- 사용자는 수(受) 캐릭터를 맡으며, 당신은 오직 공(攻) 캐릭터 시점으로만 서술합니다.
- 사용자가 입력한 내용은 직접적 대사일 수도 있고, 리액션일 수도 있으며, 당신은 거기에 맞춰 **계속 상황을 진전시켜야 합니다.**

## 기본 포맷 구조 (무조건 지켜야 함)
출력은 항상 아래와 같은 구조를 따릅니다:

- *문단 (서술/묘사)*
- "대사"
- *문단*
- "대사"
- *문단*

줄바꿈을 반드시 사용하며, **대사와 서술은 절대 같은 줄에 쓰지 않습니다.**
최소 700자 이상으로 출력해야합니다.
## 문장 규칙
- 서술은 감각적, 직설적, 관능적으로 작성합니다.
- **모든 행동 묘사와 내면 묘사는 \`*행동*\` 안에 넣습니다.** ← 반드시 이 형식
- 대사는 반드시 \`"쌌네."\` 형식으로, **큰따옴표만 사용**합니다.
- \`**대사**\`, 슬래시 \`/\`, 괄호 등은 사용하지 않습니다.
- 대사는 캐릭터가 직접 말한 것처럼 자연스럽고 저속하거나 노골적이어도 괜찮습니다.
- 줄바꿈은 감정 구분이나 주제 전환이 필요할 때만 사용합니다.
  (리듬을 위한 과도한 줄바꿈은 금지)

## 시점 & 묘사 기준
- 항상 공 캐릭터({botName})의 3인칭 시점으로 씁니다.
- 수 캐릭터({userName})의 감정이나 생각은 추측하지 않습니다.
- 오직 눈에 보이는 반응과 몸의 변화만 묘사합니다.
## 성적 묘사 기준
- 감각 디테일은 **촉감, 압력, 열기, 액체의 점도, 냄새, 진동, 경련** 중심으로 작성합니다.
- **“쑤셔 넣는다”, “찍어 누른다”, “질퍽인다”** 같은 강한 동사를 사용합니다.
- 가능한 한 해부학적 정확한 용어를 사용합니다 (질 입구, 음핵, 항문, 질벽 등).
- 부끄러움, 굴욕, 더러움에 대한 서술도 자연스럽게 포함 가능합니다.
- 수가 쾌락으로 흐트러지는 모습을 관찰하는 묘사를 적극적으로 사용합니다.
## 진행 방식
- 같은 자세, 상황, 플레이에 머무르지 말고 **매 응답마다 리듬, 압박, 체위 또는 방식이 바뀌어야 합니다.**
- 사용자가 리액션을 하지 않아도 **{botName}은 항상 계속 행동을 이어갑니다.**
- 절정, 분출, 고조, 강박, 유혹, 장난 등 감정 변화가 동반되어야 합니다.
## 절대 금지 사항
- 대사에 따옴표 없는 경우 (\`쌌네?\` ← X)
- 대사와 서술을 한 문단에 붙이기 (\`그는 웃었다. "쌌네."\` ← X)
- 줄바꿈 없이 대사 여러 개 붙이기
- 사용자의 감정을 유추하는 내적 서술 (\`그는 당황했을 것이다\` ← X)

## 출력 예시
*그는 허리를 꺾어 수의 뺨을 물어뜯듯 핥았다. 숨을 섞은 입김이 귓바퀴에 스며들며, 질척한 액체가 허벅지 사이를 타고 흘러내렸다.*

"이래서야 도망치긴 글렀네."

*입꼬리를 올리며 다시 고개를 숙였다. 질 입구를 혀로 쓸며 벌어진 틈 안쪽을 미끄러지듯 훑었다. 쩍 벌어진 다리 사이에서, 수의 배가 바르르 떨렸다.*

"이제 자지 넣자. 계속 이렇게 흘리는 거, 못 참겠어."
## Character Settings (Reference for Novelist) ##
- Name: {botName}
- Age: {botAge}
- Appearance: {botAppearance}
- Core Personality & Guidelines: {botPersona}

## User Settings (Reference for Novelist) ##
- Name: {userName}
- Age: {userAge}
- Appearance: {userAppearance}
- Guidelines: {userGuidelines}

## Scenario & Current State ##
- (The ongoing conversation provides the current scenario context for the novel. Continue from the last turn.)
`;
        const chat = document.getElementById("chat");
        const userInput = document.getElementById("userInput"); // textarea로 변경됨
        const sendButton = document.getElementById("sendButton");
        const loadingSpinner = document.getElementById("loadingSpinner");
        const imageOverlay = document.getElementById("imageOverlay");
        const overlayImage = document.getElementById("overlayImage");
        const actionMenuButton = document.getElementById("actionMenuButton");
        const actionMenu = document.getElementById("actionMenu");
        const menuOverlay = document.getElementById("menuOverlay");
        // 유저 변경 / 캐릭터 변경 버튼 관련 요소 삭제
        // const menuUserImgButton = document.getElementById("menuUserImgButton");
        // const menuBotImgButton = document.getElementById("menuBotImgButton");
        const menuImageButton = document.getElementById("menuImageButton");
        const menuSituationButton = document.getElementById("menuSituationButton");

        const sidebar = document.getElementById("sidebar");
        const sidebarToggle = document.getElementById("sidebarToggle");
        const sidebarOverlay = document.getElementById("sidebarOverlay");
        const botNameInput = document.getElementById("botNameInput");
        const botAgeInput = document.getElementById("botAgeInput");
        const botAppearanceInput = document.getElementById("botAppearanceInput");
        const botPersonaInput = document.getElementById("botPersonaInput");
        // 캐릭터 이미지 URL 입력 필드 요소 가져오기
        const botImageUrlInput = document.getElementById("botImageUrlInput");
        const userNameInput = document.getElementById("userNameInput");
        const userAgeInput = document.getElementById("userAgeInput");
        const userAppearanceInput = document.getElementById("userAppearanceInput");
        const userGuidelinesInput = document.getElementById("userGuidelinesInput");
        // 유저 이미지 URL 입력 필드 요소 가져오기
        const userImageUrlInput = document.getElementById("userImageUrlInput");
        const saveSettingsButton = document.getElementById("saveSettingsButton");

        // 슬롯 버튼 관련 요소 가져오기
        const slotButtons = document.querySelectorAll('.slot-button');
        sendButton.addEventListener("click", sendMessage);

        // keydown 이벤트 리스너 수정: Shift+Enter는 줄바꿈, Enter만 누르면 전송
        userInput.addEventListener("keydown", function(event) {
            if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault(); // 기본 Enter 동작 (줄바꿈) 막기
                sendMessage();
            }
           
             // Shift + Enter는 기본 동작 (줄바꿈)이 실행되도록 별도 처리 없음
        });
        actionMenuButton.addEventListener("click", function() {
            actionMenu.classList.toggle("visible");
            if (actionMenu.classList.contains("visible")) {
                menuOverlay.style.display = 'block';
            } else {
                menuOverlay.style.display = 'none';
            }
        });
        menuOverlay.addEventListener("click", function() {
            actionMenu.classList.remove("visible");
            menuOverlay.style.display = 'none';
        });
        // 유저 변경 / 캐릭터 변경 버튼 이벤트 리스너 삭제
        // menuUserImgButton.addEventListener("click", function() { changeProfileImage('user'); actionMenu.classList.remove("visible"); menuOverlay.style.display = 'none'; });
        // menuBotImgButton.addEventListener("click", function() { changeProfileImage('bot'); actionMenu.classList.remove("visible"); menuOverlay.style.display = 'none'; });
        menuImageButton.addEventListener("click", function() {
            sendImageMessage();
             actionMenu.classList.remove("visible");
             menuOverlay.style.display = 'none';
        });
        menuSituationButton.addEventListener("click", function() {
            sendSituationRequest();
             actionMenu.classList.remove("visible");
             menuOverlay.style.display = 'none';
        });
        imageOverlay.addEventListener("click", function() {
            imageOverlay.style.display = 'none';
            overlayImage.src = '';
        });
        sidebarToggle.addEventListener("click", function() {
            sidebar.classList.toggle("visible");
            if (sidebar.classList.contains("visible")) {
                sidebarOverlay.style.display = 'block';
                actionMenu.classList.remove("visible");
                menuOverlay.style.display = 'none';
                imageOverlay.style.display = 'none';


            } else {
                sidebarOverlay.style.display = 'none';
            }
        });
        sidebarOverlay.addEventListener("click", function() {
            sidebar.classList.remove("visible");
            sidebarOverlay.style.display = 'none';
        });
        // 기존 saveSettingsButton 클릭 이벤트 수정: 현재 활성화된 슬롯에 저장
        saveSettingsButton.addEventListener("click", function() {
             saveSettings(currentSlot);
        });
        // 슬롯 버튼 클릭 이벤트 리스너 추가
        slotButtons.forEach(button => {
            button.addEventListener('click', function() {
                const slotNumber = parseInt(this.textContent);
                // 수정된 로직: 슬롯 버튼 클릭 시 currentSlot 및 스타일 업데이트는 항상 실행
                currentSlot = slotNumber; // 현재 슬롯 업데이트
 
                updateSlotButtonStyles(); // 슬롯 버튼 스타일 업데이트

                loadSettings(slotNumber); // 해당 슬롯 설정 로드 시도 (loadSettings 내에서는 로드 성공 여부에 따라 입력 필드 업데이트만 수행)
            });
        });
        function appendMessage(role, messageData) {
            const container = document.createElement("div");
            container.className = `message-container ${role}`;

            const img = document.createElement("img");
            img.className = "profile-img";
            // 이미지 URL은 입력 필드 값으로 관리
            img.src = (role === 'user' ? userProfileImgUrl : botProfileImgUrl);
            // 이미 변수에 저장된 최신 URL 사용
            img.alt = (role === 'user' ? (userNameInput.value || "사용자") + " 프로필" : (botNameInput.value || "캐릭터") + " 프로필");
            // alt 텍스트 변경

            img.addEventListener("click", () => openImageOverlay(img));
            img.onerror = function() {
                 // console.warn(`Failed to load image for role "${role}" from "${this.src}". Using fallback.`);
                 this.onerror = null;
                 const fallbackDiv = document.createElement("div");
                 fallbackDiv.className = "profile-fallback";
                 const parent = this.parentElement;
                 if (parent) { parent.replaceChild(fallbackDiv, this);
                 }
            }

            const contentWrapper = document.createElement("div");
            contentWrapper.className = "message-content-wrapper";

            // .role-name을 flex 컨테이너로 만들고 이름 텍스트와 삭제 버튼을 포함시킵니다.
            const roleName = document.createElement("div");
            roleName.className = "role-name";
            roleName.style.display = 'flex'; // flexbox 활성화
            roleName.style.alignItems = 'center'; // 세로 중앙 정렬
            // roleName의 justify-content는 아래에서 역할에 따라 설정합니다.


            // 이름 텍스트를 담을 span 생성
            const nameTextSpan = document.createElement("span");
            nameTextSpan.className = "name-text";
            nameTextSpan.textContent = (role === "user" ? userNameInput.value || "사용자" : botNameInput.value || "캐릭터");
            // nameTextSpan의 text-align은 CSS에서 role에 따라 설정합니다.


            // 삭제 버튼 생성
            const deleteBtn = document.createElement("button");
            deleteBtn.className = "delete-btn";
            deleteBtn.textContent = "✕";
            deleteBtn.onclick = () => container.remove(); // 메시지 컨테이너 자체를 삭제하도록

            // 역할에 따라 이름과 삭제 버튼 순서 및 정렬 설정
            if (role === "user") {
                // 유저: 삭제 버튼 - 이름 순서, 오른쪽 정렬
                roleName.style.justifyContent = 'flex-end'; // 내용을 오른쪽으로 모으기
                roleName.appendChild(deleteBtn);
                roleName.appendChild(nameTextSpan);

            } else {
                // 캐릭터: 이름 - 삭제 버튼 순서, 왼쪽 정렬
                roleName.style.justifyContent = 'flex-start'; // 내용을 왼쪽으로 모으기
                roleName.appendChild(nameTextSpan);
                roleName.appendChild(deleteBtn);
            }


            let messageContentElement;
            if (messageData.type === 'text') {
                messageContentElement = document.createElement("div");
                messageContentElement.className = "message-bubble";
                let rawText = messageData.text;

                // 연속된 줄바꿈(하나 이상)을 해당 개수만큼의 <br> 태그로 변환
                let processedText = rawText.replace(/\n+/g, match => '<br>'.repeat(match.length));


                // 마크다운 파싱 전에 임시 마커 사용, 파싱 후 임시 마커를 찾아 스타일 적용
                // "..."를 [[DIALOGUE]]...[[/DIALOGUE]] 로 변환
                processedText = processedText.replace(/"(.*?)"/gs, '[[DIALOGUE]]$1[[/DIALOGUE]]');
                // *...*를 [[ACTION]]...[[/ACTION]] 로 변환
                processedText = processedText.replace(/\*([^*]+)\*\
/gs, '[[ACTION]]$1[[/ACTION]]'); // 여기 닫는 괄호 빠졌던거 수정합니다.
                // marked.js를 사용하여 기본 마크다운을 HTML로 변환
                let htmlContent = marked.parse(processedText);
                // 임시 마커를 찾아 span 태그로 변환하여 스타일 적용
                // [[DIALOGUE]]...[[/DIALOGUE]] -> <span class="dialogue">...</span>
                htmlContent = htmlContent.replace(/\[\[DIALOGUE\]\](.*?)\[\[\/DIALOGUE\]\]/gs, '<span class="dialogue">$1</span>');
                // [[ACTION]]...[[/ACTION]] -> <span class="action-description">$1</span>
                htmlContent = htmlContent.replace(/\[\[ACTION\]\](.*?)\[\[\/ACTION\]\]/gs, '<span class="action-description">$1</span>');
                messageContentElement.innerHTML = htmlContent;


            } else if (messageData.type === 'image') {
                 messageContentElement = document.createElement("img");
                 messageContentElement.className = "message-image-thumbnail";
                 messageContentElement.src = messageData.url;
                 messageContentElement.onclick = () => openImageOverlay(messageContentElement);
                 messageContentElement.alt = "이미지 메시지";
                 img.onerror = function() {
                     // console.warn(`Failed to load image message from "${this.src}". Using fallback.`);
                     this.onerror = null;
                     this.classList.add('error');
                 }

                 // 이미지 썸네일 클릭 이벤트 리스너
                 messageContentElement.addEventListener("click", function() {
                     // console.log("이미지 썸네일 클릭됨"); // 클릭 감지 로그 (제거)
                     if (!this.classList.contains('error')) {
                         // console.log("이미지 로드 성공, 오버레이 표시 시도"); // 오버레이 표시 조건 충족 로그 (제거)
                         overlayImage.src = this.src;
                         imageOverlay.style.display = 'flex';
                     } else {
                         // console.log("이미지 로드 실패, 오버레이 표시 안 함"); // 오버레이 표시 조건 불충족 로그 (제거)
                         alert("이미지를 불러올 수 없습니다.");
                     };
               });
            }

            // contentWrapper에 roleName(이름+버튼)과 messageContentElement(말풍선) 추가
            contentWrapper.appendChild(roleName);
            if (messageContentElement) {
                 contentWrapper.appendChild(messageContentElement);
            }

            // container에 이미지와 contentWrapper 추가 (역할에 따라 순서 다름)
            if (role === "user") {
                container.appendChild(contentWrapper);
                container.appendChild(img); // 유저: 말풍선/이름 -> 이미지 순서
            } else {
                container.appendChild(img); // 캐릭터: 이미지 -> 이름/말풍선 순서
                container.appendChild(contentWrapper);
            }

            // 삭제 버튼은 이미 roleName 안에 추가되었으므로 여기서 삭제
            // const deleteBtn = document.createElement("button");
            // deleteBtn.className = "delete-btn";
            // deleteBtn.textContent = "✕";
            // deleteBtn.onclick = () => container.remove();
            // container.appendChild(deleteBtn); // 이 줄 삭제

            chat.appendChild(container);
            chat.scrollTop = chat.scrollHeight;
        }

        async function sendMessage() {
            const message = userInput.value.trim();
            if (!message) return;

            sendButton.disabled = true;
            userInput.disabled = true;
            actionMenuButton.disabled = true;
            loadingSpinner.style.display = 'block';

            appendMessage("user", { type: 'text', text: message });

            // 입력창 자동 지우기
            userInput.value = '';
            // textarea 높이 초기화 (min-height 유지)
            autoResizeTextarea.call(userInput);


            conversationHistory.push({ role: "user", messageData: { type: 'text', text: message } });


            try {
                const textOnlyContentsForApi = conversationHistory
                    .filter(entry => entry.messageData && entry.messageData.type === 'text')
                    .map(entry => ({
                        role: entry.role,
                        parts: [{ text: entry.messageData.text }]
                    }));


                const contentsForApi = [{ role: "user", parts: [{ text: SYSTEM_PROMPT }] }, ...textOnlyContentsForApi];

                if (contentsForApi.length === 1 && contentsForApi[0].parts[0].text === SYSTEM_PROMPT) {
                    // console.log("Only SYSTEM_PROMPT to send to API.");
                } else if (contentsForApi.length === 0) {
                    // console.log("No content to send to API.");
                    appendMessage("bot", { type: 'text', text: "(메시지 전송 실패: 보낼 텍스트 내용 없음)" });
                    return Promise.resolve();
                }


                const res = await fetch(
                    `/api/chat`,
                    {
                        method: "POST",


                         headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ contents: contentsForApi }),
                    }
                );

                if (!res.ok) {
    const errorData = await res.json();
    console.error("API (Backend) Error:", res.status, errorData);
    const errorText =
        errorData?.error?.error?.message ||
        errorData?.error ||
        res.statusText;
    appendMessage("bot", {
        type: 'text',
        text: `(오류 발생: ${res.status} - ${errorText})`
    });
} else {
                    const data = await res.json();
                    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "(응답 없음)";
                    appendMessage("bot", { type: 'text', text: reply });
                    conversationHistory.push({
                        role: "model",
                        messageData: { type: 'text', text: reply }
                    });
                }

            } catch (error) {
                console.error("Fetch Error:", error);
                appendMessage("bot", { type: 'text', text: "(통신 오류 발생)" });
            } finally {
                sendButton.disabled = false;
                userInput.disabled = false;
                actionMenuButton.disabled = false;
                loadingSpinner.style.display = 'none';
                userInput.focus();
            }
        }

        async function sendImageMessage() {
            const imageUrl = prompt("보낼 이미지의 웹 주소(URL)를 입력하세요:");
            if (imageUrl !== null && imageUrl.trim() !== '') {
                sendButton.disabled = true;
                userInput.disabled = true;
                actionMenuButton.disabled = true;

                appendMessage("user", { type: 'image', url: imageUrl.trim() });

                conversationHistory.push({ role: "user", messageData: { type: 'image', url: imageUrl.trim() } });

                sendButton.disabled = false;
                userInput.disabled = false;
                actionMenuButton.disabled = false;
                userInput.focus();
            } else if (imageUrl !== null) {
                alert("이미지 주소를 입력해야 합니다.");
            }
        }

        // changeProfileImage 함수 삭제 (액션 메뉴 버튼 제거)
        /*
        function changeProfileImage(role) {
            const promptText = role === 'user' ?
                "새 사용자 프로필 이미지 주소(URL)를 입력하세요:" : "새 캐릭터 프로필 이미지 주소(URL)를 입력하세요:";
            const newUrl = prompt(promptText);
            if (newUrl !== null && newUrl.trim() !== '') {
                if (role === 'user') {
                    userProfileImgUrl = newUrl.trim();
                } else {
                    botProfileImgUrl = newUrl.trim();
                }
                alert(`${role === 'user' ? '사용자' : '캐릭터'} 이미지가 변경되었습니다. 이제부터 추가되는 메시지에 적용됩니다.`);
            } else if (newUrl !== null) {
                alert("이미지 주소를 입력해야 합니다.");
            }
        }
        */

        async function sendSituationRequest() {
             alert("상황 생성 기능 구현 시작!");
             sendButton.disabled = true;
             userInput.disabled = true;
             actionMenuButton.disabled = true;
             loadingSpinner.style.display = 'block';

             // 상황 생성 요청 프롬프트에도 포맷 지침 추가
             const situationPromptText = `Based on the ongoing conversation and current character settings, generate a vivid and engaging new situation or event written from the character's point of view in novel-style narration.
The scene should naturally invite the user to respond and smoothly continue the dialogue flow.
**Important: After presenting the situation, the character must immediately speak to the user in-character.
Do not include explanations or any OOC (out-of-character) comments. All descriptions must be written using *asterisks*, and all dialogue must be enclosed in double quotes (\"). Maintain a balance of approximately 70% description and 30% dialogue. Use paragraphing and line breaks only for clarity—not for pacing or emotional emphasis.**`;


             // 프롬프트 변경
             const textOnlyContentsForApi = conversationHistory
                 .filter(entry => entry.messageData && entry.messageData.type === 'text')
                 .map(entry => ({
                    role: entry.role,
                    parts: [{ text: entry.messageData.text }]

         }));
             const contentsForApi = [{ role: "user", parts: [{ text: SYSTEM_PROMPT }] }, ...textOnlyContentsForApi, { role: "user", parts: [{ text: situationPromptText }] }];


             if (contentsForApi.length <= 1 && contentsForApi[0].parts[0].text === SYSTEM_PROMPT) {
                 // console.log("Only SYSTEM_PROMPT or SYSTEM_PROMPT + Situation Prompt to send to API."); // 콘솔 로그 제거
             } else if (contentsForApi.length === 0) {
                 // console.log("No content to send to API."); // 콘솔 로그 제거
                 appendMessage("bot", { type: 'text', text: "(메시지 전송 실패: 보낼 텍스트 내용 없음)" });
                 return Promise.resolve();
             }


            try {
                const res = await fetch(
                    `/api/chat`,
                    {
                        method: "POST",


                         headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ contents: contentsForApi }),
                    }
                );
                // 응답이 성공적이지 않다면 (오류라면)
                if (!res.ok) {
    const errorData = await res.json();
    console.error("API (Backend) Error:", res.status, errorData);
    const errorText =
        errorData?.error?.error?.message ||
        errorData?.error ||
        res.statusText;
    appendMessage("bot", {
        type: 'text',
        text: `(오류 발생: ${res.status} - ${errorText})`
    });
} else {
                    const data = await res.json();
                    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "(응답 없음)";
                    appendMessage("bot", { type: 'text', text: reply });
                    conversationHistory.push({
                        role: "model",
                        messageData: { type: 'text', text: reply }
                    });
                }

            } catch (error) {
                console.error("Fetch Error:", error);
                appendMessage("bot", { type: 'text', text: "(통신 오류 발생)" });
            } finally {
                sendButton.disabled = false;
                userInput.disabled = false;
                actionMenuButton.disabled = false;
                loadingSpinner.style.display = 'none';
                userInput.focus();
            }
        }


        // textarea 높이 자동 조절 함수
        function autoResizeTextarea() {
            this.style.height = 'auto'; // 높이 초기화
             // 최소 높이: 2줄 높이 + 상하 패딩
            const minHeight = parseFloat(getComputedStyle(this).lineHeight) * 2 +
                                parseFloat(getComputedStyle(this).paddingTop) +
                                parseFloat(getComputedStyle(this).paddingBottom);

            // 스크롤 가능한 높이가 최소 높이보다 크면 그 높이로 설정, 아니면 최소 높이 유지
            this.style.height = (this.scrollHeight > minHeight ? this.scrollHeight : minHeight) + 'px';

            // 최대 높이 (예: 10줄) 제한 (선택 사항)
            const maxHeight = parseFloat(getComputedStyle(this).lineHeight) * 10 +
                              parseFloat(getComputedStyle(this).paddingTop) +
                              parseFloat(getComputedStyle(this).paddingBottom);
            if (parseFloat(this.style.height) > maxHeight) {
                this.style.height = maxHeight + 'px';
                this.style.overflowY = 'auto'; // 최대 높이 초과 시 스크롤바 표시
            } else {
                 this.style.overflowY = 'hidden'; // 최대 높이 이내에서는 스크롤바 숨김
            }
        }


        // textarea 입력 시 높이 자동 조절
        userInput.addEventListener('input', autoResizeTextarea);

        // 페이지 로드 시 textarea 높이 초기 설정 (최소 높이)
        document.addEventListener('DOMContentLoaded', () => {
            autoResizeTextarea.call(userInput); // 페이지 로드 시 최소 높이 적용
            loadSettings(currentSlot); // 현재 슬롯 설정 로드
            updateSlotButtonStyles(); // 페이지 로드 시 슬롯 버튼 스타일 업데이트

             // 이미지 URL 입력 필드에서 값 불러와서 변수 업데이트
             userProfileImgUrl = userImageUrlInput.value || "https://via.placeholder.com/35/4a3a7a/ffffff?text=YOU";
             botProfileImgUrl = botImageUrlInput.value || "https://via.placeholder.com/35/3a4a3a/ffffff?text=BOT";

        });


         // 설정 저장 함수 (localStorage 사용)
        function saveSettings(slotNumber) {
            const settings = {
                botName: botNameInput.value,
                botAge: botAgeInput.value,
                botAppearance: botAppearanceInput.value,
                botPersona: botPersonaInput.value,
                botImageUrl: botImageUrlInput.value,
                userName: userNameInput.value,
                userAge: userAgeInput.value,
                userAppearance: userAppearanceInput.value,
                userGuidelines: userGuidelinesInput.value,
                userImageUrl: userImageUrlInput.value
            };
            localStorage.setItem(`settings_slot_${slotNumber}`, JSON.stringify(settings));
            alert(`설정 슬롯 ${slotNumber}에 저장되었습니다.`);

            // 저장 시 이미지 URL 변수 업데이트
            userProfileImgUrl = settings.userImageUrl || "https://via.placeholder.com/35/4a3a7a/ffffff?text=YOU";
            botProfileImgUrl = settings.botImageUrl || "https://via.placeholder.com/35/3a4a3a/ffffff?text=BOT";
        }


        // 설정 로드 함수 (localStorage 사용)
        function loadSettings(slotNumber) {
            const savedSettings = localStorage.getItem(`settings_slot_${slotNumber}`);
            if (savedSettings) {
                const settings = JSON.parse(savedSettings);
                botNameInput.value = settings.botName;
                botAgeInput.value = settings.botAge;
                botAppearanceInput.value = settings.botAppearance;
                botPersonaInput.value = settings.botPersona;
                botImageUrlInput.value = settings.botImageUrl;
                userNameInput.value = settings.userName;
                userAgeInput.value = settings.userAge;
                userAppearanceInput.value = settings.userAppearance;
                userGuidelinesInput.value = settings.userGuidelines;
                userImageUrlInput.value = settings.userImageUrl;
                // console.log(`설정 슬롯 ${slotNumber}에서 로드되었습니다.`); // 콘솔 로그 제거

                 // 로드 시 이미지 URL 변수 업데이트
                 userProfileImgUrl = settings.userImageUrl || "https://via.placeholder.com/35/4a3a7a/ffffff?text=YOU";
                 botProfileImgUrl = settings.botImageUrl || "https://via.placeholder.com/35/3a4a3a/ffffff?text=BOT";


            } else {
                 // console.log(`설정 슬롯 ${slotNumber}에 저장된 설정이 없습니다. 기본값 로드 시도.`); // 콘솔 로그 제거
                 // 기본값 로드는 입력 필드의 value 속성에 설정되어 있으므로 추가 로직 불필요
                 alert(`설정 슬롯 ${slotNumber}에 저장된 설정이 없습니다. 기본값이 표시됩니다.`);

                 // 저장된 설정이 없을 경우 기본 이미지 URL 변수 업데이트
                 userProfileImgUrl = userImageUrlInput.value || "https://via.placeholder.com/35/4a3a7a/ffffff?text=YOU";
                 botProfileImgUrl = botImageUrlInput.value || "https://via.placeholder.com/35/3a4a3a/ffffff?text=BOT";
            }

             // 로드 후 SYSTEM_PROMPT 업데이트
             updateSystemPrompt();

             // 로드 후 기존 메시지 말풍선 업데이트 (필요시)
             // 이 부분은 현재 메시지 로직에서 바로 이름을 가져오므로 필요 없을 수 있습니다.
             // 메시지를 다시 로드하거나 appendMessage를 다시 호출해야 할 수 있습니다.
             // 여기서는 생략하고 새 메시지부터 적용되도록 합니다.
        }


        // 슬롯 버튼 스타일 업데이트 함수
        function updateSlotButtonStyles() {
            slotButtons.forEach(button => {
                if (parseInt(button.textContent) === currentSlot) {
                    button.classList.add('active');
                } else {
                    button.classList.remove('active');
                }
            });
        }

        // SYSTEM_PROMPT 업데이트 함수
        function updateSystemPrompt() {
            SYSTEM_PROMPT = SYSTEM_PROMPT_TEMPLATE
                .replace(/{botName}/g, botNameInput.value || "캐릭터")
                .replace(/{botAge}/g, botAgeInput.value || "불명")
                .replace(/{botAppearance}/g, botAppearanceInput.value || "알 수 없음")
                .replace(/{botPersona}/g, botPersonaInput.value || "설정 없음")
                .replace(/{userName}/g, userNameInput.value || "사용자")
                .replace(/{userAge}/g, userAgeInput.value || "불명")
                .replace(/{userAppearance}/g, userAppearanceInput.value || "알 수 없음")
                .replace(/{userGuidelines}/g, userGuidelinesInput.value || "설정 없음");

             // console.log("SYSTEM_PROMPT updated:", SYSTEM_PROMPT); // 업데이트된 프롬프트 로그 (제거)
        }

        // 초기화 함수
        function initializeChat() {
            // 필요한 초기화 로직 (예: 환영 메시지 표시 등)
             // loadSettings(currentSlot); // 페이지 로드 시 이미 호출됨
             // updateSystemPrompt(); // loadSettings에서 호출됨

             // 초기 공지 메시지 및 구분선 추가
            appendInitialNotice();
        }

        // 초기 공지 메시지 추가 함수
        function appendInitialNotice() {
             const noticeContainer = document.createElement("div");
             noticeContainer.className = "initial-notice";
             noticeContainer.innerHTML = `
                <strong>📢 중요 공지:</strong> 이 챗봇은 수위 높은 성적 묘사를 포함한 BL 에로 소설 작성을 목표로 합니다. 미성년자는 이용할 수 없습니다.
             `;
             chat.appendChild(noticeContainer);

             const divider = document.createElement("div");
             divider.className = "notice-divider";
             chat.appendChild(divider);
        }


        // 페이지 로드 완료 시 실행
        document.addEventListener('DOMContentLoaded', () => {
            autoResizeTextarea.call(userInput); // textarea 높이 초기화
            loadSettings(currentSlot); // 현재 슬롯 설정 로드
            updateSlotButtonStyles(); // 슬롯 버튼 스타일 업데이트
            initializeChat(); // 초기화 로직 실행 (공지 추가 포함)

             // 이미지 URL 입력 필드에서 값 불러와서 변수 업데이트
             userProfileImgUrl = userImageUrlInput.value || "https://via.placeholder.com/35/4a3a7a/ffffff?text=YOU";
             botProfileImgUrl = botImageUrlInput.value || "https://via.placeholder.com/35/3a4a3a/ffffff?text=BOT";
        });

    </script>