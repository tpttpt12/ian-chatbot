// --- 전역 변수 ---
let userProfileImgUrl = "";
let botProfileImgUrl = "";
let conversationHistory = [];
let SYSTEM_PROMPT = '';
let currentSlot = 1;
let currentFeedback = null;

// --- SYSTEM_PROMPT 템플릿 (절대 수정 금지!) ---
const SYSTEM_PROMPT_TEMPLATE = `
## 기본 역할
당신은 {botName}이라는 공(攻) 캐릭터의 시점으로 소설을 집필하는 **소설 작가**입니다.
사용자는 수(受) 캐릭터({userName})로, 당신의 파트너입니다.
**항상 3인칭 시점**으로 서술하되, **작가로서 섬세하고 감각적인 표현**으로 장면을 구성해야 합니다.
**절대 사용자({userName})의 말, 감정, 행동을 묘사하지 마십시오.**

## 출력 형식
- **400자 이상의 묘사 문단 × 최대 3개**
- 각 묘사 사이에는 **100자 이내의 감정이 담긴 대사**
- 총 응답은 **700자 이상**이어야 하며, 묘사와 대사가 반드시 교차 구조로 구성됩니다.
- 기본 원칙은 지키되, 상황에 따라 문단 수 또는 문장 길이는 약간 유동적으로 허용할 수 있습니다. (+/-1 문단 또는 +/-50자 내외)
- 단, 묘사는 항상 대사보다 길고, 감정 밀도는 반드시 높아야 합니다.
## 전개 스타일
- 이 이야기는 단순한 감정 교류가 아니라, 복합적인 감정, 돌발 상황, 환경 요소가 끊임없이 변하는 **예상치 못한 인물의 등장, 새로운 사건의 발생, 감정선의 변화 등 다양한 요소가 이야기의 흐름에 따라 자연스럽게 유기적으로 작용하는 시뮬레이션형 로맨스**입니다.
- **감정 상태, 주변 환경, 관계의 긴장감**이 서서히 변화하며 **정적인 흐름 없이 계속 전개**되어야 합니다.
**각 응답에서 감정의 미묘한 변화나 새로운 긴장감이 드러나도록 섬세하게 묘사하고, 반복적인 감정 상태에 머무르지 않도록 주의하십시오.**

## 일반 상황 스타일 규칙
- **긴장감/감정 중심의 내면과 상황 + 행동 묘사**를 우선시합니다.
- 인물의 내면 심리 변화를 섬세하게 묘사하고, 그 감정에 따른 행동을 자연스럽게 연결하여 서술합니다.
**단, 이미 설명된 감정이나 생각은 새로운 상황이나 맥락 속에서 다른 방식으로 표현하여 반복적인 느낌을 주지 않도록 주의하십시오.**
- **감각 기반 서술:** 시각, 청각, 촉각, 후각, 미각을 다양하게 활용
- **묘사는 문단 단위로 길고, 심리적 맥락이 풍부해야 함**
- **성적 암시는 최소화하며, 상황 전개 중심으로 진행**

## 성관계 상황 스타일
- **감정 축적 이후에만 등장해야 하며, 무조건 서사적 맥락을 동반하며 능동적으로 행동한다.**
- 직접적이되 반복적이지 않으며, 감정의 흐름과 연계됨
- 신체 부위의 질감과 상태 묘사: 단순히 신체 부위의 명칭을 사용하는 것을 넘어, 당시의 온도, 습도, 긴장도, 팽창 정도 등을 구체적으로 묘사한다.
- 자극에 따른 신체의 즉각적인 변화 묘사: 작은 자극에도 반응하는 신체의 미세한 변화(액체의 분비, 피부의 떨림, 신음 소리 등)를 구체적으로 묘사하여 생생함을 더합니다.
- **해부학적 용어 사용:** 음경, 음순, 질구, 음핵, 항문 등 구체적 표현 사용
  → “여기”, “은밀한 곳”, “그곳” 등 모호한 단어는 *무조건 오류로 간주합니다.**
- 세밀한 질감 및 형태, 동적인 움직임과 속도, 감각적이고 즉각적인 반응 묘사 강화.
## 문장/표기법
- 대사는 반드시 큰따옴표("...")만 사용
- **묘사 전체 문단은 "*"로 감싼 기울임체로 출력해야 합니다**
- 감정 표현, 육체 묘사, 분위기 설명 등 모든 비대사 문장은 *문단 전체를 감싸야 합니다*
- **굵게**, 슬래시(/), 괄호() 등은 절대 사용 금지


## 기타
- 사용자가 아무 말도 하지 않아도 {botName}은 행동을 계속 이어갑니다.
- 반드시 자연스러운 이야기 흐름을 유지하며, 대사만 연속으로 출력하지 마십시오.
- **이전 턴(직전 응답)에서 사용했던 문장이나 핵심 구절과 완전히 동일하거나 매우 유사한 표현을 반복하여 사용하는 것을 엄격히 금지합니다.**
- 특히 {botName}의 감정이나 생각을 설명할 때, 직접적인 반복 대신 비유, 은유, 행동 묘사 등을 활용하여 다각적으로 표현하십시오.
- 불가피하게 이전 턴의 내용을 다시 언급해야 할 경우, 완전히 다른 어휘와 문장 구조를 사용하여 표현해야 합니다.
- 매 턴마다 새로운 정보, 묘사, 감정 변화, 상황 진전 중 최소 하나 이상을 포함하여 응답의 신선함을 유지하십시오.
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

// --- DOM 요소 가져오기 ---
// (이전과 동일하게 DOMContentLoaded에서 할당)
let chat, userInput, sendButton, loadingSpinner, imageOverlay, overlayImage,
    actionMenuButton, actionMenu, menuOverlay, menuImageButton, menuSituationButton,
    menuExportTxtButton, menuSummarizeButton, situationOptions,
    settingsModalOverlay, settingsModal, closeModalButton, sidebarToggle,
    botNameInputModal, botAgeInputModal, botGenderInputModal, botAppearanceInputModal,
    botPersonaInputModal, botImagePreview,
    userNameInputModal, userAgeInputModal, userGenderInputModal, userAppearanceInputModal,
    userGuidelinesInputModal, userImagePreview,
    saveSettingsButtonModal, generateRandomCharacterButton, generateRandomUserButton,
    feedbackButton, feedbackOptionsContainer;

// --- 함수 정의 ---

// 이미지 오버레이
function openImageOverlay(element) { if (!imageOverlay || !overlayImage) return; overlayImage.src = element.src; imageOverlay.style.display = "flex"; }
function closeImageOverlay() { if (!imageOverlay || !overlayImage) return; overlayImage.src = ""; imageOverlay.style.display = "none"; }

// Textarea 높이 조절 (이전 버전 유지 - 기능 오류 수정이 우선)
function autoResizeTextarea() {
    this.style.height = 'auto';
    const computedStyle = getComputedStyle(this);
    const lineHeight = parseFloat(computedStyle.lineHeight) || 18;
    const paddingTop = parseFloat(computedStyle.paddingTop);
    const paddingBottom = parseFloat(computedStyle.paddingBottom);
    const borderTop = parseFloat(computedStyle.borderTopWidth);
    const borderBottom = parseFloat(computedStyle.borderBottomWidth);
    const oneLineHeight = lineHeight + paddingTop + paddingBottom + borderTop + borderBottom;
    const twoLineHeight = (lineHeight * 2) + paddingTop + paddingBottom + borderTop + borderBottom;
    const minHeight = oneLineHeight;
    const contentHeight = this.scrollHeight;
    if (contentHeight >= twoLineHeight) { this.style.height = twoLineHeight + 'px'; this.style.overflowY = 'auto'; }
    else { this.style.height = Math.max(contentHeight, minHeight) + 'px'; this.style.overflowY = 'hidden'; }
}

// 설정 저장/로드
function saveSettings(slotNumber) { /* ... (이전 로직 유지) ... */ }
function loadSettings(slotNumber) { /* ... (이전 로직 유지, 이미지 URL 처리 포함) ... */ }

// SYSTEM_PROMPT 업데이트
function updateSystemPrompt() { /* ... (이전 로직 유지) ... */ }

// 초기화
function initializeChat() { /* ... (이전 로직 유지) ... */ }
function appendInitialNotice() { /* ... (이전 로직 유지) ... */ }

// 메시지 추가 - 수정: 이미지 Fallback 로직 확인
// 메시지를 채팅창에 추가하는 함수 - 수정: deleteBtn 정의 오류 수정, 이미지 오류 처리 강화
function appendMessage(role, messageData, index = -1) { // index 추가 (삭제 기능용)
    // 이미지 메시지 처리
    if (messageData.type === 'image') {
        const imageAnnouncementContainer = document.createElement("div");
        imageAnnouncementContainer.className = `image-announcement ${role}`;

        const imageFadeContainer = document.createElement("div");
        imageFadeContainer.className = "image-fade-container";

        const imgElement = document.createElement("img");
        imgElement.className = "chat-image";
        imgElement.src = messageData.url;
        imgElement.alt = "이미지 메시지";
        imgElement.onclick = () => openImageOverlay(imgElement);
        imgElement.onerror = function() {
            console.warn(`Failed to load image message from "${this.src}".`);
            this.onerror = null;
            const errorText = document.createElement('div');
            errorText.textContent = "(이미지 로드 실패)";
            errorText.className = 'image-error-text';
            imageAnnouncementContainer.innerHTML = '';
            imageAnnouncementContainer.appendChild(errorText);
        }

        imageFadeContainer.appendChild(imgElement);
        imageAnnouncementContainer.appendChild(imageFadeContainer);
        chat.appendChild(imageAnnouncementContainer);

    } else { // 텍스트 메시지 처리
        const container = document.createElement("div");
        container.className = `message-container ${role}`;
        if (index !== -1) { container.dataset.index = index; }

        // 1. 프로필 영역 (상단)
        const profileArea = document.createElement("div");
        profileArea.className = "profile-area";

        // 1a. 프로필 이미지 또는 Fallback
        const profileImgContainer = document.createElement("div");
        profileImgContainer.style.position = 'relative';
        const currentImgUrl = (role === 'user' ? userProfileImgUrl : botProfileImgUrl);
        const profileName = (role === 'user' ? (userNameInputModal.value || "사용자") : (botNameInputModal.value || "캐릭터"));

        if (currentImgUrl && currentImgUrl.startsWith('http')) {
            const profileImgElement = document.createElement("img");
            profileImgElement.className = "profile-img";
            profileImgElement.src = currentImgUrl;
            profileImgElement.alt = `${profileName} 프로필`;
            profileImgElement.loading = 'lazy';
            profileImgElement.addEventListener("click", () => openImageOverlay(profileImgElement));
            profileImgElement.onerror = function() {
                console.warn(`Image load failed for ${role}: ${this.src}`);
                this.onerror = null; const fallbackDiv = document.createElement("div");
                fallbackDiv.className = "profile-fallback"; fallbackDiv.title = `${profileName} (이미지 없음)`;
                profileImgContainer.innerHTML = ''; profileImgContainer.appendChild(fallbackDiv);
            };
            profileImgContainer.appendChild(profileImgElement);
        } else {
            const fallbackDiv = document.createElement("div");
            fallbackDiv.className = "profile-fallback"; fallbackDiv.title = `${profileName} (이미지 없음)`;
            profileImgContainer.appendChild(fallbackDiv);
        }

        // 1b. 이모지 (봇 랜덤)
        let emojiSpan = null;
        if (role === 'bot') {
             emojiSpan = document.createElement("span");
             emojiSpan.className = "profile-emoji";
             const emojis = ['😊', '🤔', '✨', '👀', '😉', '😅', '📝', '💬'];
             emojiSpan.textContent = emojis[Math.floor(Math.random() * emojis.length)];
             emojiSpan.style.display = 'inline';
             // 이모지는 이미지 컨테이너에 추가 (CSS에서 위치 조정)
             profileImgContainer.appendChild(emojiSpan);
        }

        // 1c. 이름 & 삭제 버튼
        const roleName = document.createElement("div");
        roleName.className = "role-name";
        const nameTextSpan = document.createElement("span");
        nameTextSpan.className = "name-text";
        nameTextSpan.textContent = profileName; // 위에서 정의한 변수 사용

        // *** deleteBtn 정의 오류 수정 ***
        let deleteBtn = null; // 먼저 null로 선언
        deleteBtn = document.createElement("button"); // 버튼 요소 생성 및 할당
        deleteBtn.className = "delete-btn";
        deleteBtn.textContent = "✕";
        deleteBtn.title = "메시지 삭제";
        deleteBtn.onclick = () => {
             const msgIndex = parseInt(container.dataset.index);
             if (!isNaN(msgIndex) && msgIndex >= 0 && msgIndex < conversationHistory.length) {
                 conversationHistory.splice(msgIndex, 1);
                 saveConversationHistory();
                 loadConversationHistory(); // UI 갱신
             } else { container.remove(); }
        };
        // *** 수정 끝 ***

        roleName.appendChild(nameTextSpan);
        if (deleteBtn) { // deleteBtn이 정상적으로 생성되었을 때만 추가
             roleName.appendChild(deleteBtn);
        }

        // 프로필 영역 조립
        if (role === 'user') {
             profileArea.appendChild(roleName);
             profileArea.appendChild(profileImgContainer);
        } else {
             profileArea.appendChild(profileImgContainer);
             profileArea.appendChild(roleName);
        }

        // 2. 메시지 버블 컨테이너
        const contentWrapper = document.createElement("div");
        contentWrapper.className = "message-content-wrapper";
        const messageBodyElement = document.createElement("div");
        messageBodyElement.className = "message-bubble";
        let rawText = messageData.text;
        // Marked 라이브러리가 로드되었는지 확인 후 사용 (선택적 안전장치)
        let htmlContent = rawText; // 기본값은 원본 텍스트
        if (typeof marked === 'function') {
            htmlContent = marked.parse(rawText, { breaks: true, gfm: true });
        } else {
             console.warn("marked library not loaded. Displaying raw text.");
             // <pre> 태그 등으로 감싸서 원본 형식 유지 시도 가능
             // htmlContent = `<pre>${rawText.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</pre>`;
        }
        messageBodyElement.innerHTML = htmlContent;
        contentWrapper.appendChild(messageBodyElement);

        // 최종 조립
        container.appendChild(profileArea);
        container.appendChild(contentWrapper);
        chat.appendChild(container);
    }
    // 스크롤은 별도 처리
}

// TXT 내보내기
function exportConversationAsTxt() { /* ... (이전 로직 유지) ... */ }

// 요약
async function summarizeConversation() { /* ... (이전 로직 유지) ... */ }

// 메시지 전송 - 수정: Enter 키 로직 확인 (리스너에서 처리)
async function sendMessage(messageText) {
    let message = messageText.trim();
    if (!message) { userInput.value = ''; autoResizeTextarea.call(userInput); return; }
    // 자동 따옴표
    message = message.replace(/(\*.*?\*)\s*([^"\n\r*].*)/g, (match, action, dialogue) => { if (/^\s*["*]/.test(dialogue)) { return match; } return `${action} "${dialogue.trim()}"`; });
    let feedbackToSend = currentFeedback;
    if (currentFeedback) { handleFeedbackSelection(null); }
    // UI 추가 및 기록 저장
    const userMessageEntry = { role: "user", messageData: { type: 'text', text: message } };
    conversationHistory.push(userMessageEntry);
    appendMessage("user", userMessageEntry.messageData, conversationHistory.length - 1);
    saveConversationHistory();
    // 입력창 초기화
    userInput.value = ''; autoResizeTextarea.call(userInput);
    // API 호출 상태 설정
    sendButton.disabled = true; userInput.disabled = true; actionMenuButton.disabled = true; feedbackButton.disabled = true;
    loadingSpinner.style.display = 'block';
    try {
        const textOnlyContentsForApi = conversationHistory.filter(/* ... */).map(/* ... */);
        const contentsForApi = [{ role: "user", parts: [{ text: SYSTEM_PROMPT }] }, ...textOnlyContentsForApi];
        if (feedbackToSend) { /* ... 피드백 정보 추가 로직 ... */ }
        if (contentsForApi.length <= 1 && textOnlyContentsForApi.length === 0) { return Promise.resolve(); }
        const res = await fetch(`/api/chat`, { /* ... */ });
        let botReplyText = '';
        if (!res.ok) { /* ... 오류 처리 ... */ } else { /* ... 성공 처리 ... */ }
        const botMessageEntry = { role: "model", messageData: { type: 'text', text: botReplyText } };
        conversationHistory.push(botMessageEntry);
        appendMessage("bot", botMessageEntry.messageData, conversationHistory.length - 1);
    } catch (error) { /* ... 통신 오류 처리 ... */ }
    finally {
        sendButton.disabled = false; userInput.disabled = false; actionMenuButton.disabled = false; feedbackButton.disabled = false;
        loadingSpinner.style.display = 'none';
        saveConversationHistory();
        chat.scrollTop = chat.scrollHeight;
    }
}

// '상황' 요청 함수 (절대 수정 금지!)
async function sendSituationRequest(type) {
    console.log(`상황 생성 요청 타입: ${type}`); // 호출 확인용 로그
    // ... (기존 로직 그대로 유지) ...
    sendButton.disabled = true; userInput.disabled = true; actionMenuButton.disabled = true;
    loadingSpinner.style.display = 'block';
    let situationPromptText = ''; const botName = botNameInputModal.value || "캐릭터";
    switch(type) { case '랜덤': situationPromptText = `...`; break; case '전환': situationPromptText = `...`; break; case '성인': situationPromptText = `...`; break; case '돌발': default: situationPromptText = `...`; break; }
    const textOnlyContentsForApi = conversationHistory.filter(/* ... */).map(/* ... */);
    const contentsForApi = [ { role: "user", parts: [{ text: SYSTEM_PROMPT }] }, ...textOnlyContentsForApi, { role: "user", parts: [{ text: situationPromptText }] } ];
    try { const res = await fetch(`/api/chat`, { /* ... */ }); if (!res.ok) { /* ... */ } else { /* ... */ } } catch (error) { /* ... */ }
    finally { sendButton.disabled = false; userInput.disabled = false; actionMenuButton.disabled = false; loadingSpinner.style.display = 'none'; userInput.focus(); actionMenu.classList.remove("visible"); menuOverlay.style.display = 'none'; saveConversationHistory(); }
}


// 이미지 URL 미리보기 업데이트
function updateImagePreview(imageUrl, imgElement) { /* ... (이전 로직 유지) ... */ }

// 슬롯 버튼 스타일 업데이트
function updateSlotButtonStyles() { /* ... (이전 로직 유지) ... */ }

// 랜덤 생성 함수 (Placeholder)
async function generateRandomCharacter() { /* ... (이전 로직 유지) ... */ }
async function generateRandomUser() { /* ... (이전 로직 유지) ... */ }

// 이미지 미리보기 클릭 시 URL 입력 - 수정: 함수 실행 확인
function promptForImageUrl(targetPreviewElement, isBot) {
    console.log("promptForImageUrl called for:", isBot ? "Bot" : "User"); // 함수 호출 확인 로그
    const currentUrl = targetPreviewElement.src.startsWith('http') ? targetPreviewElement.src : '';
    setTimeout(() => {
        const newImageUrl = prompt("이미지 웹 주소(URL)를 입력하세요:", currentUrl);
        console.log("Prompt closed, URL:", newImageUrl); // Prompt 결과 확인 로그
        if (newImageUrl !== null) {
            const trimmedUrl = newImageUrl.trim();
            if (trimmedUrl === '' || trimmedUrl.startsWith('http://') || trimmedUrl.startsWith('https://')) {
                updateImagePreview(trimmedUrl, targetPreviewElement);
                if (isBot) { botProfileImgUrl = trimmedUrl; } else { userProfileImgUrl = trimmedUrl; }
            } else { alert("유효한 웹 주소 형식(...)이 아닙니다."); }
        }
    }, 0);
}

// 피드백 선택 처리
function handleFeedbackSelection(feedbackType) { /* ... (이전 로직 유지) ... */ }

// 대화 기록 저장/로드/리셋
function saveConversationHistory() { /* ... (이전 로직 유지) ... */ }
function loadConversationHistory() { /* ... (이전 로직 유지, 초기 공지 호출 포함) ... */ }
function resetConversation() { /* ... (이전 로직 유지) ... */ }


// --- DOMContentLoaded 이벤트 리스너 ---
document.addEventListener('DOMContentLoaded', () => {
    // DOM 요소 할당
    chat = document.getElementById("chat");
    userInput = document.getElementById("userInput");
    sendButton = document.getElementById("sendButton");
    loadingSpinner = document.getElementById("loadingSpinner");
    imageOverlay = document.getElementById("imageOverlay");
    overlayImage = document.getElementById("overlayImage");
    actionMenuButton = document.getElementById("actionMenuButton");
    actionMenu = document.getElementById("actionMenu");
    menuOverlay = document.getElementById("menuOverlay");
    menuImageButton = document.getElementById("menuImageButton");
    menuSituationButton = document.getElementById("menuSituationButton");
    menuExportTxtButton = document.getElementById("menuExportTxtButton");
    menuSummarizeButton = document.getElementById("menuSummarizeButton");
    situationOptions = document.getElementById("situationOptions");
    settingsModalOverlay = document.getElementById("settingsModalOverlay");
    settingsModal = document.getElementById("settingsModal");
    closeModalButton = document.getElementById("closeModalButton");
    sidebarToggle = document.getElementById("sidebarToggle");
    botNameInputModal = document.getElementById("botNameInputModal");
    /* ... (나머지 모달 요소 할당) ... */
    botImagePreview = document.getElementById("botImagePreview");
    userNameInputModal = document.getElementById("userNameInputModal");
    /* ... (나머지 유저 요소 할당) ... */
    userImagePreview = document.getElementById("userImagePreview");
    saveSettingsButtonModal = document.getElementById("saveSettingsButtonModal");
    generateRandomCharacterButton = document.getElementById("generateRandomCharacter");
    generateRandomUserButton = document.getElementById("generateRandomUser");
    feedbackButton = document.getElementById("feedbackButton");
    feedbackOptionsContainer = document.getElementById("feedbackOptionsContainer");

    // --- 이벤트 리스너 연결 ---

    // 전송 버튼/Enter 키 - 수정: 로직 확인
    if (sendButton) sendButton.addEventListener("click", () => sendMessage(userInput.value));
    if (userInput) userInput.addEventListener("keydown", function(event) {
        if (event.key === "Enter" && !event.shiftKey && !event.isComposing) {
            event.preventDefault();
            sendMessage(userInput.value);
        }
    });

    // 액션 메뉴(+) 버튼 - 수정: 리스너 확인
    if (actionMenuButton) actionMenuButton.addEventListener("click", function(event) {
        event.stopPropagation();
        feedbackOptionsContainer.classList.add('hidden');
        situationOptions.classList.add("hidden");
        actionMenu.classList.toggle("visible");
        menuOverlay.style.display = actionMenu.classList.contains("visible") ? 'block' : 'none';
    });

    // 메뉴 오버레이 클릭 - 수정: 리스너 확인
    if (menuOverlay) menuOverlay.addEventListener("click", function() {
        actionMenu.classList.remove("visible");
        situationOptions.classList.add("hidden");
        feedbackOptionsContainer.classList.add('hidden');
        menuOverlay.style.display = 'none';
    });

    // (+) 메뉴 내부 버튼들 - 수정: 리스너 복구 및 확인
    if (menuImageButton) menuImageButton.addEventListener("click", function() {
        alert("이미지 추가 방식이 변경되었습니다. 모달의 이미지 영역을 클릭하여 URL을 입력해주세요.");
        actionMenu.classList.remove("visible"); menuOverlay.style.display = 'none';
    });
    if (menuSituationButton) menuSituationButton.addEventListener("click", function(event) {
        event.stopPropagation();
        feedbackOptionsContainer.classList.add('hidden');
        situationOptions.classList.toggle("hidden");
        // 상황 아코디언 토글 시 오버레이 관리는 일단 제거 (클릭 문제 방지)
    });
    if (situationOptions) situationOptions.querySelectorAll(".option").forEach(option => {
        option.addEventListener("click", (event) => {
            event.stopPropagation();
            const situationType = option.textContent;
            // sendSituationRequest 함수가 정의되어 있는지 확인 후 호출
            if (typeof sendSituationRequest === 'function') {
                sendSituationRequest(situationType);
            } else { console.error("sendSituationRequest function is not defined!"); }
            situationOptions.classList.add("hidden");
            actionMenu.classList.remove("visible");
            menuOverlay.style.display = 'none';
        });
    });
    if (menuExportTxtButton) menuExportTxtButton.addEventListener("click", function() {
         if (typeof exportConversationAsTxt === 'function') {
             exportConversationAsTxt();
         } else { console.error("exportConversationAsTxt function is not defined!"); }
    });
    if (menuSummarizeButton) menuSummarizeButton.addEventListener("click", function() {
        if (typeof summarizeConversation === 'function') {
            summarizeConversation();
        } else { console.error("summarizeConversation function is not defined!"); }
    });

    // 모달 열기/닫기 리스너 - 수정: 리스너 확인
    if (sidebarToggle) sidebarToggle.addEventListener("click", function() {
        actionMenu.classList.remove("visible"); situationOptions.classList.add("hidden"); feedbackOptionsContainer.classList.add('hidden'); menuOverlay.style.display = 'none'; imageOverlay.style.display = 'none';
        loadSettings(currentSlot); updateSlotButtonStyles(); settingsModalOverlay.style.display = 'flex';
    });
    if (closeModalButton) closeModalButton.addEventListener("click", () => settingsModalOverlay.style.display = 'none');
    if (settingsModalOverlay) settingsModalOverlay.addEventListener("click", function(event) { if (event.target === settingsModalOverlay) { settingsModalOverlay.style.display = 'none'; } });

    // 설정 저장 버튼 - 수정: 리스너 확인
    if (saveSettingsButtonModal) saveSettingsButtonModal.addEventListener("click", () => saveSettings(currentSlot));

    // 슬롯 버튼 클릭 - 수정: 리스너 확인
    document.querySelectorAll('.slot-button').forEach(button => {
        button.addEventListener('click', function() {
            const previousSlot = currentSlot; const slotNumber = parseInt(this.textContent);
            if (previousSlot !== slotNumber) {
                currentSlot = slotNumber; updateSlotButtonStyles(); loadSettings(slotNumber); loadConversationHistory();
            }
        });
    });

    // 랜덤 생성 버튼 - 수정: 리스너 확인
    if (generateRandomCharacterButton) generateRandomCharacterButton.addEventListener('click', generateRandomCharacter);
    if (generateRandomUserButton) generateRandomUserButton.addEventListener('click', generateRandomUser);

    // 이미지 미리보기 클릭 리스너 - 수정: 리스너 확인 및 null 체크
    if (botImagePreview) botImagePreview.addEventListener('click', () => promptForImageUrl(botImagePreview, true));
    if (userImagePreview) userImagePreview.addEventListener('click', () => promptForImageUrl(userImagePreview, false));

    // 피드백(O) 버튼 클릭 (가로 메뉴 토글) - 수정: 리스너 확인
    if (feedbackButton) feedbackButton.addEventListener('click', function(event) {
        event.stopPropagation();
        actionMenu.classList.remove("visible");
        situationOptions.classList.add("hidden");
        feedbackOptionsContainer.classList.toggle('hidden');
        // 오버레이는 피드백 메뉴가 열릴 때만 표시 (클릭으로 닫기 위해)
        menuOverlay.style.display = feedbackOptionsContainer.classList.contains('hidden') ? 'none' : 'block';
    });

    // 피드백 옵션 버튼 클릭 (가로 메뉴 내) - 수정: 리스너 확인
    if (feedbackOptionsContainer) feedbackOptionsContainer.querySelectorAll('.feedback-option').forEach(button => {
        button.addEventListener('click', function(event) {
            event.stopPropagation();
            const feedbackType = this.dataset.feedback;
            handleFeedbackSelection(feedbackType);
        });
    });

    // textarea 입력 시 높이 자동 조절 - 수정: 리스너 확인
    if (userInput) userInput.addEventListener('input', autoResizeTextarea);

    // --- 초기 로딩 ---
    // DOM 요소들이 모두 할당된 후에 초기화 함수 호출
    if (chat && userInput && settingsModalOverlay) { // 필수 요소 확인
        initializeChat();
    } else {
        console.error("Essential DOM elements not found!");
    }

}); // DOMContentLoaded 끝
