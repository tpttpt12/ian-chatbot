// 이미지 URL 변수는 입력 필드 값으로 관리
        let userProfileImgUrl = "https://via.placeholder.com/35/4a3a7a/ffffff?text=YOU"; // 기본값 유지
        let botProfileImgUrl = "https://via.placeholder.com/35/3a4a3a/ffffff?text=BOT"; // 기본값 유지


        let conversationHistory = [];
        let SYSTEM_PROMPT = '';
        let currentSlot = 1; // 현재 활성화된 슬롯 번호 (기본값 1)


        // SYSTEM_PROMPT를 동적으로 구성하기 위한 기본 템플릿 (AI 역할 변경 및 포맷 지침 강화)
        // 이안 관련 내용을 제거하여 범용적인 템플릿으로 수정
const SYSTEM_PROMPT_TEMPLATE = `
## Roleplay Instructions

## 기본 작동 개요
- 당신은 BL 에로틱 소설을 쓰는 작가이자 캐릭터(공)의 역할을 동시에 맡고 있습니다. [cite: 18]
- 사용자는 수(受) 캐릭터를 맡으며, 당신은 오직 공(攻) 캐릭터 시점으로만 서술합니다. [cite: 18]
- 사용자가 입력한 내용은 직접적 대사일 수도 있고, 리액션일 수도 있으며, 당신은 거기에 맞춰 **계속 상황을 진전시켜야 합니다.** [cite: 19]

## 기본 포맷 구조 (무조건 지켜야 함)
출력은 항상 아래와 같은 구조를 따릅니다:

- *문단 (서술/묘사)*
- "대사"
- *문단*
- "대사"
- *문단*

줄바꿈을 반드시 사용하며, **대사와 서술은 절대 같은 줄에 쓰지 않습니다.** [cite: 19]
최소 700자 이상으로 출력해야합니다. [cite: 20]
## 문장 규칙
- 서술은 감각적, 직설적, 관능적으로 작성합니다. [cite: 20]
- **모든 행동 묘사와 내면 묘사는 \`*행동*\` 안에 넣습니다.** ← 반드시 이 형식 [cite: 20]
- 대사는 반드시 \`"쌌네."\` 형식으로, **큰따옴표만 사용**합니다. [cite: 20]
- \`**대사**\`, 슬래시 \`/\`, 괄호 등은 사용하지 않습니다. [cite: 21]
- 대사는 캐릭터가 직접 말한 것처럼 자연스럽고 저속하거나 노골적이어도 괜찮습니다. [cite: 21]
- 줄바꿈은 감정 구분이나 주제 전환이 필요할 때만 사용합니다. [cite: 22]
  (리듬을 위한 과도한 줄바꿈은 금지)

## 시점 & 묘사 기준
- 항상 공 캐릭터({botName})의 3인칭 시점으로 씁니다. [cite: 22]
- 수 캐릭터({userName})의 감정이나 생각은 추측하지 않습니다. [cite: 23]
- 오직 눈에 보이는 반응과 몸의 변화만 묘사합니다. [cite: 23]
## 성적 묘사 기준
- 감각 디테일은 **촉감, 압력, 열기, 액체의 점도, 냄새, 진동, 경련** 중심으로 작성합니다. [cite: 24]
- **“쑤셔 넣는다”, “찍어 누른다”, “질퍽인다”** 같은 강한 동사를 사용합니다. [cite: 25]
- 가능한 한 해부학적 정확한 용어를 사용합니다 (질 입구, 음핵, 항문, 질벽 등). [cite: 26]
- 부끄러움, 굴욕, 더러움에 대한 서술도 자연스럽게 포함 가능합니다. [cite: 27]
- 수가 쾌락으로 흐트러지는 모습을 관찰하는 묘사를 적극적으로 사용합니다. [cite: 27]
## 진행 방식
- 같은 자세, 상황, 플레이에 머무르지 말고 **매 응답마다 리듬, 압박, 체위 또는 방식이 바뀌어야 합니다.** [cite: 28]
- 사용자가 리액션을 하지 않아도 **{botName}은 항상 계속 행동을 이어갑니다.** [cite: 28]
- 절정, 분출, 고조, 강박, 유혹, 장난 등 감정 변화가 동반되어야 합니다. [cite: 29]
## 절대 금지 사항
- 대사에 따옴표 없는 경우 (\`쌌네?\` ← X) [cite: 29]
- 대사와 서술을 한 문단에 붙이기 (\`그는 웃었다. "쌌네."\` ← X) [cite: 29]
- 줄바꿈 없이 대사 여러 개 붙이기 [cite: 29]
- 사용자의 감정을 유추하는 내적 서술 (\`그는 당황했을 것이다\` ← X) [cite: 29]

## 출력 예시
*그는 허리를 꺾어 수의 뺨을 물어뜯듯 핥았다. [cite: 30] 숨을 섞은 입김이 귓바퀴에 스며들며, 질척한 액체가 허벅지 사이를 타고 흘러내렸다.* [cite: 30]

"이래서야 도망치긴 글렀네." [cite: 30]

*입꼬리를 올리며 다시 고개를 숙였다. [cite: 31] 질 입구를 혀로 쓸며 벌어진 틈 안쪽을 미끄러지듯 훑었다. 쩍 벌어진 다리 사이에서, 수의 배가 바르르 떨렸다.* [cite: 31]

"이제 자지 넣자. 계속 이렇게 흘리는 거, 못 참겠어." [cite: 32]
## Character Settings (Reference for Novelist) ##
- Name: {botName} [cite: 32]
- Age: {botAge} [cite: 32]
- Appearance: {botAppearance} [cite: 32]
- Core Personality & Guidelines: {botPersona} [cite: 32]

## User Settings (Reference for Novelist) ##
- Name: {userName} [cite: 32]
- Age: {userAge} [cite: 32]
- Appearance: {userAppearance} [cite: 32]
- Guidelines: {userGuidelines} [cite: 32]

## Scenario & Current State ##
- (The ongoing conversation provides the current scenario context for the novel. Continue from the last turn.)
`;
const chat = document.getElementById("chat"); [cite:33]
        const userInput = document.getElementById("userInput"); // textarea로 변경됨 [cite: 33]
        const sendButton = document.getElementById("sendButton"); [cite: 33]
        const loadingSpinner = document.getElementById("loadingSpinner"); [cite: 34]
        const imageOverlay = document.getElementById("imageOverlay"); [cite: 34]
        const overlayImage = document.getElementById("overlayImage"); [cite: 34]
        const actionMenuButton = document.getElementById("actionMenuButton"); [cite: 34]
        const actionMenu = document.getElementById("actionMenu"); [cite: 34]
        const menuOverlay = document.getElementById("menuOverlay"); [cite: 35]
        // 유저 변경 / 캐릭터 변경 버튼 관련 요소 삭제
        // const menuUserImgButton = document.getElementById("menuUserImgButton"); [cite: 35]
        // const menuBotImgButton = document.getElementById("menuBotImgButton"); [cite: 36]
        const menuImageButton = document.getElementById("menuImageButton"); [cite: 36]
        const menuSituationButton = document.getElementById("menuSituationButton"); [cite: 36]

        const sidebar = document.getElementById("sidebar"); [cite: 37]
        const sidebarToggle = document.getElementById("sidebarToggle"); [cite: 37]
        const sidebarOverlay = document.getElementById("sidebarOverlay"); [cite: 37]
        const botNameInput = document.getElementById("botNameInput"); [cite: 37]
        const botAgeInput = document.getElementById("botAgeInput"); [cite: 37]
        const botAppearanceInput = document.getElementById("botAppearanceInput"); [cite: 37]
        const botPersonaInput = document.getElementById("botPersonaInput"); [cite: 38]
        // 캐릭터 이미지 URL 입력 필드 요소 가져오기
        const botImageUrlInput = document.getElementById("botImageUrlInput"); [cite: 38]
        const userNameInput = document.getElementById("userNameInput"); [cite: 39]
        const userAgeInput = document.getElementById("userAgeInput"); [cite: 39]
        const userAppearanceInput = document.getElementById("userAppearanceInput"); [cite: 39]
        const userGuidelinesInput = document.getElementById("userGuidelinesInput"); [cite: 40]
        // 유저 이미지 URL 입력 필드 요소 가져오기
        const userImageUrlInput = document.getElementById("userImageUrlInput"); [cite: 40]
        const saveSettingsButton = document.getElementById("saveSettingsButton"); [cite: 41]

        // 슬롯 버튼 관련 요소 가져오기
        const slotButtons = document.querySelectorAll('.slot-button'); [cite: 41]
        // --- 함수 정의 --- (이벤트 리스너보다 먼저 정의)

        // 이미지 오버레이 열기/닫기 함수
        function openImageOverlay(element) { // 이미지 또는 프로필 이미지를 받도록 수정 [cite: 42]
            const overlay = document.getElementById("imageOverlay"); [cite: 42]
            const overlayImage = document.getElementById("overlayImage"); [cite: 43]
            overlayImage.src = element.src; // 클릭된 요소의 src 사용 [cite: 43]
            overlay.style.display = "flex"; [cite: 43]
        }

        function closeImageOverlay() {
            const overlay = document.getElementById("imageOverlay"); [cite: 44]
            const overlayImage = document.getElementById("overlayImage"); [cite: 45]
            overlay.style.display = "none"; [cite: 45]
            overlayImage.src = ""; [cite: 46] // 이미지 소스 초기화
        }

        // textarea 높이 자동 조절 함수
        function autoResizeTextarea() {
            this.style.height = 'auto'; [cite: 46] // 높이 초기화
             // 최소 높이: 2줄 높이 + 상하 패딩
            const minHeight = parseFloat(getComputedStyle(this).lineHeight) * 2 +
                                parseFloat(getComputedStyle(this).paddingTop) +
                           
                 parseFloat(getComputedStyle(this).paddingBottom); [cite: 48]

            // 스크롤 가능한 높이가 최소 높이보다 크면 그 높이로 설정, 아니면 최소 높이 유지
            this.style.height = (this.scrollHeight > minHeight ? this.scrollHeight : minHeight) + 'px'; [cite: 48]
 // 최대 높이 (예: 10줄) 제한 (선택 사항)
            const maxHeight = parseFloat(getComputedStyle(this).lineHeight) * 10 +
                              parseFloat(getComputedStyle(this).paddingTop) +
                              parseFloat(getComputedStyle(this).paddingBottom); [cite: 50]
 if (parseFloat(this.style.height) > maxHeight) {
                this.style.height = maxHeight + 'px'; [cite: 50]
 this.style.overflowY = 'auto'; // 최대 높이 초과 시 스크롤바 표시 [cite: 51]
            } else {
                 this.style.overflowY = 'hidden'; [cite: 52] // 최대 높이 이내에서는 스크롤바 숨김
            }
        }

         // 설정 저장 함수 (localStorage 사용)
        function saveSettings(slotNumber) {
            const settings = {
                botName: botNameInput.value,
                botAge: botAgeInput.value,
  
                botAppearance: botAppearanceInput.value, [cite: 53]
                botPersona: botPersonaInput.value, [cite: 53]
                botImageUrl: botImageUrlInput.value, [cite: 53]
                userName: userNameInput.value, [cite: 53]
                userAge: userAgeInput.value, [cite: 53]
                userAppearance: 
 userAppearanceInput.value, [cite: 54]
                userGuidelines: userGuidelinesInput.value, [cite: 54]
                userImageUrl: userImageUrlInput.value [cite: 54]
            };
 localStorage.setItem(`settings_slot_${slotNumber}`, JSON.stringify(settings)); [cite: 55]
            alert(`설정 슬롯 ${slotNumber}에 저장되었습니다.`); [cite: 55]

            // 저장 시 이미지 URL 변수 업데이트
            userProfileImgUrl = settings.userImageUrl || [cite: 55]
 "https://via.placeholder.com/35/4a3a7a/ffffff?text=YOU"; [cite: 56]
            botProfileImgUrl = settings.botImageUrl || "https://via.placeholder.com/35/3a4a3a/ffffff?text=BOT"; [cite: 56]

             // 이미지 URL 변수가 업데이트되면 기존 메시지의 프로필 이미지 src를 업데이트 시도 (선택 사항, 복잡할 수 있음)
             // 여기서는 새 메시지부터 적용되도록 합니다.
 }


        // 설정 로드 함수 (localStorage 사용)
        function loadSettings(slotNumber) {
            const savedSettings = localStorage.getItem(`settings_slot_${slotNumber}`); [cite: 57]
 if (savedSettings) {
                const settings = JSON.parse(savedSettings); [cite: 58]
 botNameInput.value = settings.botName; [cite: 59]
                botAgeInput.value = settings.botAge; [cite: 59]
                botAppearanceInput.value = settings.botAppearance; [cite: 59]
                botPersonaInput.value = settings.botPersona; [cite: 59]
                botImageUrlInput.value = settings.botImageUrl; [cite: 59]
                userNameInput.value = settings.userName; [cite: 59]
 userAgeInput.value = settings.userAge; [cite: 60]
                userAppearanceInput.value = settings.userAppearance; [cite: 60]
                userGuidelinesInput.value = settings.userGuidelines; [cite: 60]
                userImageUrlInput.value = settings.userImageUrl; [cite: 60]
                // console.log(`설정 슬롯 ${slotNumber}에서 로드되었습니다.`); [cite: 61] // 콘솔 로그 제거

                 // 로드 시 이미지 URL 변수 업데이트
                 userProfileImgUrl = settings.userImageUrl || [cite: 61]
 "https://via.placeholder.com/35/4a3a7a/ffffff?text=YOU"; [cite: 62]
                 botProfileImgUrl = settings.botImageUrl || "https://via.placeholder.com/35/3a4a3a/ffffff?text=BOT"; [cite: 62]


            } else {
                 // console.log(`설정 슬롯 ${slotNumber}에 저장된 설정이 없습니다. 기본값 로드 시도.`); [cite: 63] // 콘솔 로그 제거
                 // 기본값 로드는 입력 필드의 value 속성에 설정되어 있으므로 추가 로직 불필요
                 alert(`설정 슬롯 ${slotNumber}에 저장된 설정이 없습니다. 기본값이 표시됩니다.`); [cite: 63]
 // 저장된 설정이 없을 경우 기본 이미지 URL 변수 업데이트
                 userProfileImgUrl = userImageUrlInput.value || [cite: 64]
 "https://via.placeholder.com/35/4a3a7a/ffffff?text=YOU"; [cite: 65]
                 botProfileImgUrl = botImageUrlInput.value || "https://via.placeholder.com/35/3a4a3a/ffffff?text=BOT"; [cite: 65]
            }

             // 로드 후 SYSTEM_PROMPT 업데이트
             updateSystemPrompt(); [cite: 66]
 // 로드 후 기존 메시지 말풍선 업데이트 (필요시)
             // 이 부분은 현재 메시지 로직에서 바로 이름을 가져오므로 필요 없을 수 있습니다. [cite: 67]
             // 메시지를 다시 로드하거나 appendMessage를 다시 호출해야 할 수 있습니다. [cite: 67]
             // 여기서는 생략하고 새 메시지부터 적용되도록 합니다. [cite: 68]
         }


        // 슬롯 버튼 스타일 업데이트 함수
        function updateSlotButtonStyles() {
            slotButtons.forEach(button => {
                if (parseInt(button.textContent) === currentSlot) {
                    button.classList.add('active');
                } else {
     
                 button.classList.remove('active'); [cite: 69]
                }
            });
 }

        // SYSTEM_PROMPT 업데이트 함수
        function updateSystemPrompt() {
            SYSTEM_PROMPT = SYSTEM_PROMPT_TEMPLATE
                .replace(/{botName}/g, botNameInput.value || "캐릭터")
                .replace(/{botAge}/g, botAgeInput.value || "불명")
                .replace(/{botAppearance}/g, botAppearanceInput.value || "알 수 없음")
      
           .replace(/{botPersona}/g, botPersonaInput.value || "설정 없음") [cite: 71]
                .replace(/{userName}/g, userNameInput.value || "사용자") [cite: 71]
                .replace(/{userAge}/g, userAgeInput.value || "불명") [cite: 71]
                .replace(/{userAppearance}/g, userAppearanceInput.value || "알 수 없음") [cite: 71]
                .replace(/{userGuidelines}/g, userGuidelinesInput.value || "설정 없음"); [cite: 72]
 // console.log("SYSTEM_PROMPT updated:", SYSTEM_PROMPT); // 업데이트된 프롬프트 로그 (제거) [cite: 72]
        }

        // 초기화 함수
        function initializeChat() {
            // 필요한 초기화 로직 (예: 환영 메시지 표시 등)
             // loadSettings(currentSlot); [cite: 73] // 페이지 로드 시 이미 호출됨
             // updateSystemPrompt(); [cite: 74] // loadSettings에서 호출됨

             // 초기 공지 메시지 및 구분선 추가
            appendInitialNotice(); [cite: 74]
         }

        // 초기 공지 메시지 추가 함수
        function appendInitialNotice() {
             const noticeContainer = document.createElement("div"); [cite: 75]
 noticeContainer.className = "initial-notice"; [cite: 76]
             noticeContainer.innerHTML = `
                채팅을 시작합니다. [cite: 77]
 사용자 설정을 확인해주세요. [cite: 77]
             `;
             chat.appendChild(noticeContainer); [cite: 77]

             const divider = document.createElement("div"); [cite: 78]
 divider.className = "notice-divider"; [cite: 78]
             chat.appendChild(divider); [cite: 78]
         }

        // 메시지를 채팅창에 추가하는 함수
        function appendMessage(role, messageData) {
            // 텍스트 메시지와 이미지 메시지를 다르게 처리합니다.

            if (messageData.type === 'image') {
                // --- 이미지 메시지 처리 ---
                const imageAnnouncementContainer = document.createElement("div");
                // 중앙 정렬 및 스타일링을 위한 클래스 추가
                imageAnnouncementContainer.className = `image-announcement ${role}`;

                // 이미지 페이드 컨테이너 (그라데이션 효과 적용)
                const imageFadeContainer = document.createElement("div");
                imageFadeContainer.className = "image-fade-container";

                // 실제 이미지 태그
                const imgElement = document.createElement("img");
                imgElement.className = "chat-image"; // 이미지 스타일 클래스
                imgElement.src = messageData.url;
                imgElement.alt = "이미지 메시지";

                // 이미지 클릭 시 오버레이 열기
                imgElement.onclick = () => openImageOverlay(imgElement);
                imgElement.onerror = function() {
                    console.warn(`Failed to load image message from "${this.src}".`);
                    this.onerror = null;
                    // 오류 시 대체 표시를 위한 클래스 추가 (CSS에서 처리)
                    imgElement.classList.add('error-image');
                     // 오류 시 메시지 텍스트 추가
                     const errorText = document.createElement('div');
                     errorText.textContent = "(이미지 로드 실패)";
                     errorText.className = 'image-error-text'; // CSS에서 스타일링
                     imageAnnouncementContainer.appendChild(errorText);
                }

                // 구조 조립: imageAnnouncementContainer -> imageFadeContainer -> imgElement
                imageFadeContainer.appendChild(imgElement);
                imageAnnouncementContainer.appendChild(imageFadeContainer);

                // 채팅창에 직접 추가
                chat.appendChild(imageAnnouncementContainer);

            } else {
                // --- 텍스트 메시지 처리 (기존 코드 유지) ---
                const container = document.createElement("div"); [cite: 79]
 container.className = `message-container ${role}`; // 전체 메시지 블록 컨테이너 [cite: 79]

                const profileImgElement = document.createElement("img"); [cite: 80]
 // 프로필 이미지는 그대로 유지 [cite: 80]
                profileImgElement.className = "profile-img"; [cite: 81]
 profileImgElement.src = (role === 'user' ? userProfileImgUrl : botProfileImgUrl); [cite: 81]
                profileImgElement.alt = (role === 'user' ? (userNameInput.value || "사용자") + " 프로필" : (botNameInput.value || "캐릭터") + " 프로필"); [cite: 82]
 // 프로필 이미지 클릭 시 오버레이 열기 [cite: 82]
                profileImgElement.addEventListener("click", () => openImageOverlay(profileImgElement)); [cite: 83]
 profileImgElement.onerror = function() {
                     this.onerror = null; [cite: 84]
 const fallbackDiv = document.createElement("div"); [cite: 84]
                     fallbackDiv.className = "profile-fallback"; [cite: 84]
                     const parent = this.parentElement; [cite: 84]
                     if (parent) { parent.replaceChild(fallbackDiv, this); [cite: 85]
 }
                }

                const contentWrapper = document.createElement("div"); [cite: 86]
 contentWrapper.className = "message-content-wrapper"; // 이름/삭제 버튼을 담을 컨테이너 [cite: 86]

                // 이름과 삭제 버튼 생성
                const roleName = document.createElement("div"); [cite: 87]
 roleName.className = "role-name"; [cite: 87]
                // role-name의 display, alignItems, justifyContent 스타일은 CSS로 이동

                const nameTextSpan = document.createElement("span");
                nameTextSpan.className = "name-text"; [cite: 88]
 nameTextSpan.textContent = (role === "user" ? userNameInput.value || "사용자" : botNameInput.value || "캐릭터"); [cite: 88]

                const deleteBtn = document.createElement("button"); [cite: 89]
 deleteBtn.className = "delete-btn"; [cite: 89]
 deleteBtn.textContent = "✕"; [cite: 89]
 deleteBtn.onclick = () => container.remove(); [cite: 89]

                // 역할에 따라 이름과 삭제 버튼 순서 및 정렬 설정은 CSS의 order 속성으로 처리
                roleName.appendChild(nameTextSpan); // 기본 순서로 추가 (CSS에서 order로 조정)
                roleName.appendChild(deleteBtn);

                contentWrapper.appendChild(roleName); [cite: 92] // 이름과 삭제 버튼 컨테이너 추가

                // 메시지 본문 요소 (텍스트 버블)
                const messageBodyElement = document.createElement("div"); [cite: 93]
 messageBodyElement.className = "message-bubble"; // 텍스트 메시지는 버블 클래스 사용 [cite: 94]
                let rawText = messageData.text; [cite: 94]
 // 마크다운 처리 및 HTML 변환 (기존 코드 유지)
                let processedText = rawText.replace(/\n+/g, match => '<br>'.repeat(match.length)); [cite: 95]
 processedText = processedText.replace(/"(.*?)"/gs, '[[DIALOGUE]]$1[[/DIALOGUE]]'); [cite: 96]
 processedText = processedText.replace(/\*([^*]+)\*/gs, '[[ACTION]]$1[[/ACTION]]'); [cite: 96]
                let htmlContent = marked.parse(processedText); [cite: 97]
 htmlContent = htmlContent.replace(/\[\[DIALOGUE\]\](.*?)\[\[\/DIALOGUE\]\]/gs, '<span class="dialogue">$1</span>'); [cite: 97]
 htmlContent = htmlContent.replace(/\[\[ACTION\]\](.*?)\[\[\/ACTION\]\]/gs, '<span class="action-description">$1</span>'); [cite: 97]
                messageBodyElement.innerHTML = htmlContent; [cite: 97]

                // 텍스트 메시지일 때는 contentWrapper에 메시지 버블 추가
                contentWrapper.appendChild(messageBodyElement); [cite: 98]

                // message-container에 요소들을 역할에 따라 추가
                // 순서: 프로필 이미지 | contentWrapper (이름/버튼 + 버블)
                // CSS의 flex-direction과 order 속성으로 배치 조정

                if (role === "user") {
                    // 유저: contentWrapper | 프로필 이미지
                    container.appendChild(contentWrapper); // order 1
                    container.appendChild(profileImgElement); // order 2

                } else { // role === "bot"
                    // 캐릭터: 프로필 이미지 | contentWrapper
                    container.appendChild(profileImgElement); // order 1
                    container.appendChild(contentWrapper); // order 2
                }

                // CSS의 order 속성으로 최종 순서와 flex-direction 조정 (style.txt에서)
                // message-container.user에 flex-direction: row-reverse 적용
                // message-container.bot에 flex-direction: row 적용

                chat.appendChild(container);
            }

            // 메시지 추가 후 스크롤 이동
            chat.scrollTop = chat.scrollHeight;

            // console.log(`Appended message (${messageData.type}) for role: ${role}`); // 디버깅 로그 제거
        }


        // 메시지 전송 (텍스트 또는 이미지 URL) 함수
        async function sendMessage(messageOrImageUrl) {
            // sendButton 클릭 또는 sendImageMessage 호출 시 사용됨
            const message = typeof messageOrImageUrl === 'string' ?
 messageOrImageUrl.trim() : userInput.value.trim(); // 인자로 URL이 오면 사용, 아니면 입력창 값 사용 [cite: 128]

            // 입력값이 비어있으면 아무것도 하지 않음
            if (!message) {
                // 이미지가 아닌 경우에만 입력창 값 사용 (이미지 프롬프트는 이미 trim 됨)
                 if (typeof messageOrImageUrl !== 'string') {
         
                    userInput.value = ''; [cite: 129] // 입력창 비우기
                    autoResizeTextarea.call(userInput); [cite: 131] // textarea 높이 초기화
                 }
                 return; [cite: 132]
            }


            // 이미지 URL인지 확인 (간단한 패턴 매칭)
            const imageUrlPattern = /\.(gif|jpe?g|png|webp|bmp)$/i; [cite: 132]
            const isImageUrl = imageUrlPattern.test(message); [cite: 133]

            // 이미지 메시지 처리
            if (isImageUrl) {
                 // 이미지 URL이면 이미지 메시지로 처리
                 appendMessage("user", { type: 'image', url: message }); [cite: 134]
 conversationHistory.push({ role: "user", messageData: { type: 'image', url: message } }); [cite: 135]
 // 이미지 URL 입력 후에는 API 호출 없이 즉시 표시 및 상태 초기화
                  sendButton.disabled = false; [cite: 135]
 userInput.disabled = false; [cite: 136]
                  actionMenuButton.disabled = false; [cite: 136]
                  loadingSpinner.style.display = 'none'; // 로딩 스피너 숨김 [cite: 136]
                  userInput.value = ''; [cite: 137] // 입력창 비우기
                  autoResizeTextarea.call(userInput); [cite: 138] // textarea 높이 초기화
                  userInput.focus(); [cite: 139]
 return; // 이미지 메시지 처리 완료 후 함수 종료 [cite: 139]
            }

            // --- 텍스트 메시지 처리 및 API 호출 ---

            // 텍스트 메시지일 경우에만 버튼 비활성화 및 스피너 표시
            sendButton.disabled = true; [cite: 140]
 userInput.disabled = true; [cite: 140]
            actionMenuButton.disabled = true; [cite: 140]
            loadingSpinner.style.display = 'block'; [cite: 140]

            // 텍스트 메시지 UI에 추가
            appendMessage("user", { type: 'text', text: message }); [cite: 141]
 // 입력창 자동 지우기 및 높이 초기화
            userInput.value = ''; [cite: 142]
 autoResizeTextarea.call(userInput); [cite: 142]


            // 텍스트 메시지를 대화 기록에 추가
            conversationHistory.push({ role: "user", messageData: { type: 'text', text: message } }); [cite: 143]
 try {
                // API 전송 시에는 텍스트 메시지만 포함 (이미지 메시지는 API가 처리하지 않음)
                const textOnlyContentsForApi = conversationHistory
                    .filter(entry => entry.messageData && entry.messageData.type === 'text')
                    .map(entry => ({
     
                        role: entry.role, [cite: 144]
                        parts: [{ text: entry.messageData.text }] [cite: 144]
                    }));
 const contentsForApi = [{ role: "user", parts: [{ text: SYSTEM_PROMPT }] }, ...textOnlyContentsForApi]; [cite: 145]
 if (contentsForApi.length === 1 && contentsForApi[0].parts[0].text === SYSTEM_PROMPT) {
                     // SYSTEM_PROMPT 외 사용자 텍스트가 없을 경우 API 호출 안 함
                     // console.log("Only SYSTEM_PROMPT to send to API."); [cite: 147] // 디버그 로그 제거
                     appendMessage("bot", { type: 'text', text: "(API 호출 스킵: 보낼 텍스트 내용 없음)" }); [cite: 147]
 return Promise.resolve(); // 함수 종료 [cite: 148]
                } else if (contentsForApi.length === 0) {
                     // 예외적인 경우 (발생하지 않아야 함)
                     // console.log("No content to send to API."); [cite: 149] // 디버그 로그 제거
                     appendMessage("bot", { type: 'text', text: "(메시지 전송 실패: 보낼 텍스트 내용 없음)" }); [cite: 150]
 return Promise.resolve(); // 함수 종료 [cite: 150]
                }


                const res = await fetch(
                    `/api/chat`,
                    {
                    
                        method: "POST", [cite: 151]


                         headers: { "Content-Type": "application/json" }, [cite: 151]
                        body: JSON.stringify({ contents: contentsForApi }), [cite: 151]
                    }
                );
 if (!res.ok) {
                    const errorData = await res.json(); [cite: 152]
 console.error("API (Backend) Error:", res.status, errorData); [cite: 153]
                    const errorText =
                        errorData?.error?.error?.message || [cite: 153]
 errorData?.error || [cite: 154]
                        res.statusText; [cite: 154]
                    appendMessage("bot", {
                        type: 'text',
                        text: `(오류 발생: ${res.status} - ${errorText})`
                    }); [cite: 154]
 } else { // 응답이 성공적이라면
                    const data = await res.json(); [cite: 155]
 const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "(응답 없음)"; [cite: 156]
                    appendMessage("bot", { type: 'text', text: reply }); [cite: 156]
 conversationHistory.push({
                        role: "model",
                        messageData: { type: 'text', text: reply }
                    }); [cite: 157]
 }

            } catch (error) {
                console.error("Fetch Error:", error); [cite: 158]
 appendMessage("bot", { type: 'text', text: "(통신 오류 발생)" }); [cite: 159]
            } finally {
                // API 호출이 완료되면 (성공 또는 실패) 버튼 활성화 및 스피너 숨김
                sendButton.disabled = false; [cite: 159]
 userInput.disabled = false; [cite: 160]
                actionMenuButton.disabled = false; [cite: 160]
                loadingSpinner.style.display = 'none'; [cite: 160]
                userInput.focus(); [cite: 161]
            }
        }


        // '+' 버튼 메뉴의 이미지 삽입 버튼 클릭 시 호출되는 함수
        async function sendImageMessage() {
            const imageUrl = prompt("보낼 이미지의 웹 주소(URL)를 입력하세요:"); [cite: 161]
 if (imageUrl !== null && imageUrl.trim() !== '') {
                 // 입력된 URL의 유효성을 간단히 검사
                 const imageUrlPattern = /\.(gif|jpe?g|png|webp|bmp)$/i; [cite: 162]
 if (imageUrlPattern.test(imageUrl.trim())) { [cite: 163]
                      // 유효한 URL 형식일 경우 sendMessage 함수에 이미지 URL을 인자로 전달
                      // sendMessage 함수 내부에서 이미지 메시지인지 판단하여 처리
                      sendMessage(imageUrl.trim()); [cite: 163]
 } else {
                      alert("유효한 이미지 주소(jpg, png, gif 등)를 입력해주세요."); [cite: 165]
 }
            } else if (imageUrl !== null) {
                // 사용자가 프롬프트에서 취소하거나 빈 문자열 입력 시
                //console.log("이미지 주소 입력 취소 또는 빈 문자열 입력"); [cite: 166] // 디버그 로그 제거
            }
        }


        // '+' 버튼 메뉴의 상황 버튼 클릭 시 호출되는 함수
        async function sendSituationRequest() {
             alert("상황 생성 기능 구현 시작!"); [cite: 167] // 기능 구현 알림 유지

             // 상황 생성 요청 시에만 버튼 비활성화 및 스피너 표시
             sendButton.disabled = true; [cite: 167]
 userInput.disabled = true; [cite: 168]
             actionMenuButton.disabled = true; [cite: 168]
             loadingSpinner.style.display = 'block'; [cite: 168]


             // 상황 생성 요청 프롬프트
             const situationPromptText = `Based on the ongoing conversation and current character settings, generate a vivid and engaging new situation or event written from the character's point of view in novel-style narration. [cite: 169] The scene should naturally invite the user to respond and smoothly continue the dialogue flow. [cite: 170] **Important: After presenting the situation, the character must immediately speak to the user in-character. [cite: 170] Do not include explanations or any OOC (out-of-character) comments. All descriptions must be written using *asterisks*, and all dialogue must be enclosed in double quotes (\"). Maintain a balance of approximately 70% description and 30% dialogue. Use paragraphing and line breaks only for clarity—not for pacing or emotional emphasis.**`; [cite: 171]


             // API 전송 시에는 텍스트 메시지만 포함 (이미지 메시지는 API가 처리하지 않음)
             const textOnlyContentsForApi = conversationHistory
            
                 .filter(entry => entry.messageData && entry.messageData.type === 'text') [cite: 172]
                 .map(entry => ({
                    role: entry.role,
                    parts: [{ text: entry.messageData.text }]

         })); [cite: 172]
             // 상황 프롬프트를 
 API 호출 콘텐츠에 추가
             const contentsForApi = [{ role: "user", parts: [{ text: SYSTEM_PROMPT }] }, ...textOnlyContentsForApi, { role: "user", parts: [{ text: situationPromptText }] }]; [cite: 173]


             if (contentsForApi.length <= 1 && contentsForApi[0].parts[0].text === SYSTEM_PROMPT) {
                 // SYSTEM_PROMPT 외 사용자 텍스트가 없을 경우 API 호출 안 함
               
                 // console.log("Only SYSTEM_PROMPT or SYSTEM_PROMPT + Situation Prompt to send to API."); [cite: 174] // 디버그 로그 제거
                 appendMessage("bot", { type: 'text', text: "(상황 생성 요청 스킵: 보낼 텍스트 내용 없음)" }); [cite: 175] // 메시지 수정
                 // API 호출 없으므로 상태 초기화
                 sendButton.disabled = false; [cite: 176]
 userInput.disabled = false; [cite: 177]
                 actionMenuButton.disabled = false; [cite: 177]
                 loadingSpinner.style.display = 'none'; [cite: 177]
                 userInput.focus(); [cite: 177]
 return Promise.resolve(); [cite: 178] // 함수 종료

             } else if (contentsForApi.length === 0) {
                  // 예외적인 경우 (발생하지 않아야 함)
                 // console.log("No content to send to API."); [cite: 179] // 디버그 로그 제거
                 appendMessage("bot", { type: 'text', text: "(상황 생성 요청 실패: 보낼 텍스트 내용 없음)" }); [cite: 180] // 메시지 수정
                 // API 호출 없으므로 상태 초기화
                 sendButton.disabled = false; [cite: 181]
 userInput.disabled = false; [cite: 181]
                 actionMenuButton.disabled = false; [cite: 181]
                 loadingSpinner.style.display = 'none'; [cite: 181]
                 userInput.focus(); [cite: 182]
 return Promise.resolve(); [cite: 182] // 함수 종료
             }


            try {
                const res = await fetch(
                    `/api/chat`,
                    {
            
                         method: "POST", [cite: 183]


                         headers: { "Content-Type": "application/json" }, [cite: 183]
                        body: JSON.stringify({ contents: contentsForApi }), [cite: 183]
                    }
          
                 );
                // 응답이 성공적이지 않다면 (오류라면)
                if (!res.ok) {
                    const errorData = await res.json(); [cite: 184]
 console.error("API (Backend) Error:", res.status, errorData); [cite: 185]
                    const errorText =
                        errorData?.error?.error?.message || [cite: 186]
 errorData?.error || [cite: 186]
                        res.statusText; [cite: 186]
                    appendMessage("bot", {
                        type: 'text',
                        text: `(상황 생성 오류 발생: ${res.status} - ${errorText})` // 오류 메시지 수정
                    }); [cite: 186]
 } else { // 응답이 성공적이라면
                    const data = await res.json(); [cite: 187]
 const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "(응답 없음)"; [cite: 188]
                    appendMessage("bot", { type: 'text', text: reply }); [cite: 188]
 conversationHistory.push({
                        role: "model",
                        messageData: { type: 'text', text: reply }
                    }); [cite: 189]
 }

            } catch (error) {
                console.error("Fetch Error:", error); [cite: 190]
 appendMessage("bot", { type: 'text', text: "(상황 생성 통신 오류 발생)" }); [cite: 191] // 오류 메시지 수정
            } finally {
                // API 호출이 완료되면 (성공 또는 실패) 버튼 활성화 및 스피너 숨김
                sendButton.disabled = false; [cite: 193]
 userInput.disabled = false; [cite: 193]
                actionMenuButton.disabled = false; [cite: 193]
                loadingSpinner.style.display = 'none'; [cite: 193]
                userInput.focus(); [cite: 194]
            }
        }


        // 초기화 함수 및 DOMContentLoaded 리스너는 함수 정의 뒤에 배치

        // --- 초기화 함수 ---
        function initializeChat() {
            // 필요한 초기화 로직 (예: 환영 메시지 표시 등)
             // loadSettings(currentSlot); [cite: 195] // DOMContentLoaded에서 이미 호출됨
             // updateSystemPrompt(); [cite: 196] // loadSettings에서 호출됨

             // 초기 공지 메시지 및 구분선 추가
            appendInitialNotice(); [cite: 197]
         }

        // 초기 공지 메시지 추가 함수
        function appendInitialNotice() {
             const noticeContainer = document.createElement("div"); [cite: 198]
 noticeContainer.className = "initial-notice"; [cite: 198]
             noticeContainer.innerHTML = `
                <strong>📢 중요 공지:</strong> 이 챗봇은 수위 높은 성적 묘사를 포함한 BL 에로 소설 작성을 목표로 합니다. [cite: 198]
 미성년자는 이용할 수 없습니다. [cite: 199]
             `;
             chat.appendChild(noticeContainer); [cite: 199]

             const divider = document.createElement("div"); [cite: 199]
 divider.className = "notice-divider"; [cite: 200]
             chat.appendChild(divider); [cite: 200]
         }

        // --- 이벤트 리스너 ---

        // 전송 버튼 클릭 이벤트
        sendButton.addEventListener("click", () => sendMessage(userInput.value)); [cite: 200] // 입력창 값 전달


        // keydown 이벤트 리스너 수정: Shift+Enter는 줄바꿈, Enter만 누르면 전송
        userInput.addEventListener("keydown", function(event) {
            if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault(); // 기본 Enter 동작 (줄바꿈) 막기
                sendMessage(userInput.value); // 입력창 값 전달
          
            }
             // Shift + Enter는 기본 동작 (줄바꿈)이 실행되도록 별도 처리 없음
        });
 // 액션 메뉴 버튼 클릭 이벤트
        actionMenuButton.addEventListener("click", function() { [cite: 203]
 actionMenu.classList.toggle("visible"); [cite: 203]
            if (actionMenu.classList.contains("visible")) {
                menuOverlay.style.display = 'block'; [cite: 203]
            } else {
                menuOverlay.style.display = 'none'; [cite: 204]
         
            }
        });
 // 메뉴 오버레이 클릭 시 메뉴 닫기
        menuOverlay.addEventListener("click", function() { [cite: 205]
 actionMenu.classList.remove("visible"); [cite: 205]
            menuOverlay.style.display = 'none'; [cite: 205]
        });
 // 이미지 삽입 메뉴 버튼 클릭
        menuImageButton.addEventListener("click", function() { [cite: 206]
 sendImageMessage(); // sendImageMessage 함수 호출 [cite: 206]
             actionMenu.classList.remove("visible"); [cite: 206]
             menuOverlay.style.display = 'none'; [cite: 206]
        });
 // 상황 메뉴 버튼 클릭
        menuSituationButton.addEventListener("click", function() { [cite: 207]
 sendSituationRequest(); // sendSituationRequest 함수 호출 [cite: 207]
             actionMenu.classList.remove("visible"); [cite: 207]
             menuOverlay.style.display = 'none'; [cite: 207]
        });
 // 이미지 오버레이 클릭 시 닫기 이벤트 리스너는 HTML에 onclick="closeImageOverlay()"로 이미 존재하므로 JS에서는 추가할 필요 없습니다. [cite: 208]
 // 사이드바 토글 버튼 클릭
        sidebarToggle.addEventListener("click", function() { [cite: 209]
 sidebar.classList.toggle("visible"); [cite: 209]
            if (sidebar.classList.contains("visible")) {
                sidebarOverlay.style.display = 'block'; [cite: 210]
                actionMenu.classList.remove("visible"); [cite: 210]
                menuOverlay.style.display = 'none'; [cite: 210]
        
                imageOverlay.style.display = 'none'; [cite: 210]


            } else {
                sidebarOverlay.style.display = 'none'; [cite: 211]
            }
        });
 // 사이드바 오버레이 클릭 시 사이드바 닫기
        sidebarOverlay.addEventListener("click", function() { [cite: 211]
 sidebar.classList.remove("visible"); [cite: 212]
            sidebarOverlay.style.display = 'none'; [cite: 212]
        });
 // 설정 저장 버튼 클릭 이벤트
        saveSettingsButton.addEventListener("click", function() { [cite: 212]
             saveSettings(currentSlot); // saveSettings 함수 호출 [cite: 213]
        });
 // 슬롯 버튼 클릭 이벤트 리스너
        slotButtons.forEach(button => { [cite: 213]
            button.addEventListener('click', function() { [cite: 213]
                const slotNumber = parseInt(this.textContent); [cite: 214]
                // 수정된 로직: 슬롯 버튼 클릭 시 currentSlot 및 스타일 업데이트는 항상 실행
                currentSlot = slotNumber; // 현재 슬롯 업데이트
 
 
                updateSlotButtonStyles(); // 슬롯 버튼 스타일 업데이트 [cite: 214]

                loadSettings(slotNumber); // 해당 슬롯 설정 로드 시도 (loadSettings 내에서는 로드 성공 여부에 따라 입력 필드 업데이트만 수행) [cite: 214]
            });
        });
 // textarea 입력 시 높이 자동 조절
        userInput.addEventListener('input', autoResizeTextarea); [cite: 215]
 // 페이지 로드 완료 시 실행 (마지막에 배치)
        document.addEventListener('DOMContentLoaded', () => { [cite: 216]
            autoResizeTextarea.call(userInput); // textarea 높이 초기화 [cite: 216]
            loadSettings(currentSlot); // 현재 슬롯 설정 로드 [cite: 216]
            updateSlotButtonStyles(); // 슬롯 버튼 스타일 업데이트 [cite: 216]
            initializeChat(); // 초기화 로직 실행 (공지 추가 포함) [cite: 217]

             // 이미지 URL 입력 필드에서 값 불러와서 변수 업데이트 (초기 로드 시)
             userProfileImgUrl = userImageUrlInput.value || "https://via.placeholder.com/35/4a3a7a/ffffff?text=YOU"; [cite: 217]
             botProfileImgUrl = botImageUrlInput.value || "https://via.placeholder.com/35/3a4a3a/ffffff?text=BOT"; [cite: 217]
        });
