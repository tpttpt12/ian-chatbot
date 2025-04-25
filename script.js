// --- 전역 변수 ---
let userProfileImgUrl = "";
let botProfileImgUrl = "";
let conversationHistory = [];
let SYSTEM_PROMPT = '';
let currentSlot = 1;
let currentFeedback = null;
console.log("Global variables initialized."); // 로그 추가

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
console.log("Defining functions..."); // 로그 추가

// 이미지 오버레이
function openImageOverlay(element) { console.log("openImageOverlay called"); try { if (!imageOverlay || !overlayImage) return; overlayImage.src = element.src; imageOverlay.style.display = "flex"; } catch (e) { console.error("Error in openImageOverlay:", e); } }
function closeImageOverlay() { console.log("closeImageOverlay called"); try { if (!imageOverlay || !overlayImage) return; overlayImage.src = ""; imageOverlay.style.display = "none"; } catch (e) { console.error("Error in closeImageOverlay:", e); } }

// Textarea 높이 조절
function autoResizeTextarea() {
    // console.log("autoResizeTextarea called"); // 너무 자주 호출되므로 주석 처리
    try {
        this.style.height = 'auto'; const initialOverflow = this.style.overflowY; this.style.overflowY = 'hidden';
        const computedStyle = getComputedStyle(this); const lineHeight = parseFloat(computedStyle.lineHeight) || 18;
        const paddingTop = parseFloat(computedStyle.paddingTop); const paddingBottom = parseFloat(computedStyle.paddingBottom);
        const borderTop = parseFloat(computedStyle.borderTopWidth); const borderBottom = parseFloat(computedStyle.borderBottomWidth);
        const oneLineHeight = lineHeight + paddingTop + paddingBottom + borderTop + borderBottom;
        const twoLineHeight = (lineHeight * 2) + paddingTop + paddingBottom + borderTop + borderBottom;
        const minHeight = oneLineHeight; const contentHeight = this.scrollHeight;
        if (contentHeight >= twoLineHeight) { this.style.height = twoLineHeight + 'px'; this.style.overflowY = 'auto'; }
        else { this.style.height = Math.max(contentHeight, minHeight) + 'px'; this.style.overflowY = 'hidden'; }
    } catch (e) { console.error("Error in autoResizeTextarea:", e); }
}

// 설정 저장
function saveSettings(slotNumber) {
    console.log(`saveSettings called for slot ${slotNumber}`);
    try {
        const settings = { /* ... */ };
        localStorage.setItem(`settings_slot_${slotNumber}`, JSON.stringify(settings));
        alert(`설정 슬롯 ${slotNumber}에 저장되었습니다.`);
        userProfileImgUrl = settings.userImageUrl; botProfileImgUrl = settings.botImageUrl;
        updateSystemPrompt();
    } catch (e) { console.error("Error in saveSettings:", e); alert("설정 저장 중 오류가 발생했습니다."); }
}

// 설정 로드
function loadSettings(slotNumber) {
    console.log(`loadSettings called for slot ${slotNumber}`);
    try {
        const savedSettings = localStorage.getItem(`settings_slot_${slotNumber}`);
        let settings = {};
        if (savedSettings) { try { settings = JSON.parse(savedSettings); } catch (e) { console.error("Failed to parse settings:", e); localStorage.removeItem(`settings_slot_${slotNumber}`); } }
        botNameInputModal.value = settings.botName || ''; /* ... */ updateImagePreview(settings.botImageUrl || '', botImagePreview);
        userNameInputModal.value = settings.userName || ''; /* ... */ updateImagePreview(settings.userImageUrl || '', userImagePreview);
        userProfileImgUrl = settings.userImageUrl || ""; botProfileImgUrl = settings.botImageUrl || "";
        updateSystemPrompt();
    } catch (e) { console.error("Error in loadSettings:", e); }
}

// SYSTEM_PROMPT 업데이트
function updateSystemPrompt() {
    // console.log("updateSystemPrompt called"); // 로그 너무 많을 수 있어 주석 처리
    try {
        SYSTEM_PROMPT = SYSTEM_PROMPT_TEMPLATE.replace(/* ... */);
    } catch (e) { console.error("Error in updateSystemPrompt:", e); }
}

// 초기화
function initializeChat() {
    console.log("initializeChat called");
    try {
        loadSettings(currentSlot);
        updateSlotButtonStyles();
        loadConversationHistory();
        if (conversationHistory.length === 0) { appendInitialNotice(); }
        autoResizeTextarea.call(userInput);
        chat.scrollTop = chat.scrollHeight;
        console.log("Chat initialized successfully.");
    } catch (e) { console.error("Error during initializeChat:", e); }
}

// 초기 공지 메시지
function appendInitialNotice() { console.log("appendInitialNotice called"); /* ... */ }

// 메시지 추가
function appendMessage(role, messageData, index = -1) {
    // console.log(`appendMessage called for role: ${role}, type: ${messageData.type}`); // 로그 너무 많을 수 있어 주석 처리
    try {
        if (messageData.type === 'image') { /* ... */ }
        else {
            const container = document.createElement("div"); /* ... */
            if (index !== -1) { container.dataset.index = index; }
            const profileArea = document.createElement("div"); /* ... */
            const profileImgContainer = document.createElement("div"); /* ... */
            const currentImgUrl = (role === 'user' ? userProfileImgUrl : botProfileImgUrl);
            const profileName = (role === 'user' ? (userNameInputModal?.value || "사용자") : (botNameInputModal?.value || "캐릭터")); // Optional chaining

            if (currentImgUrl && currentImgUrl.startsWith('http')) {
                const profileImgElement = document.createElement("img"); /* ... */
                profileImgElement.src = currentImgUrl; /* ... */
                profileImgElement.onerror = function() { /* ... Fallback으로 교체 ... */ };
                profileImgContainer.appendChild(profileImgElement);
            } else { const fallbackDiv = document.createElement("div"); /* ... */; profileImgContainer.appendChild(fallbackDiv); }

            let emojiSpan = null; if (role === 'bot') { /* ... 이모지 생성 ...*/ }
            const roleName = document.createElement("div"); /* ... */
            const nameTextSpan = document.createElement("span"); nameTextSpan.textContent = profileName; /* ... */

            // *** deleteBtn 정의 및 사용 ***
            let deleteBtn = null;
            try {
                deleteBtn = document.createElement("button"); // 생성
                deleteBtn.className = "delete-btn"; deleteBtn.textContent = "✕"; deleteBtn.title = "메시지 삭제";
                deleteBtn.onclick = () => { /* ... 삭제 로직 ... */ };
            } catch (e) { console.error("Error creating delete button:", e); }
            // *** ***

            roleName.appendChild(nameTextSpan);
            if (deleteBtn) { roleName.appendChild(deleteBtn); } // null 체크 후 추가

            if (role === 'user') { profileArea.appendChild(roleName); profileArea.appendChild(profileImgContainer); }
            else { profileArea.appendChild(profileImgContainer); if (emojiSpan) profileImgContainer.appendChild(emojiSpan); profileArea.appendChild(roleName); }

            const contentWrapper = document.createElement("div"); /* ... */
            const messageBodyElement = document.createElement("div"); /* ... */
            let rawText = messageData.text; let htmlContent = rawText;
            if (typeof marked === 'function') { try { htmlContent = marked.parse(rawText, { breaks: true, gfm: true }); } catch(e){ console.error("Marked parsing error:", e); } }
            else { console.warn("marked library not loaded."); }
            messageBodyElement.innerHTML = htmlContent; contentWrapper.appendChild(messageBodyElement);

            container.appendChild(profileArea); container.appendChild(contentWrapper); chat.appendChild(container);
        }
    } catch (e) { console.error("Error in appendMessage:", e); }
}

// TXT 내보내기
function exportConversationAsTxt() {
    console.log("exportConversationAsTxt called");
    try {
        /* ... (기존 로직) ... */
    } catch (e) { console.error("Error in exportConversationAsTxt:", e); alert("TXT 내보내기 중 오류 발생"); }
}

// 요약
async function summarizeConversation() {
    console.log("summarizeConversation called");
    // ... (기존 로직, try...catch 내부에 로그 추가 가능) ...
}

// 메시지 전송 - 수정: 로그 강화
async function sendMessage(messageText) {
    console.log("sendMessage called");
    let message = messageText.trim();
    if (!message) { console.log("sendMessage aborted: empty message"); userInput.value = ''; autoResizeTextarea.call(userInput); return; }
    console.log("Original message:", message);

    try {
        // 자동 따옴표
        message = message.replace(/(\*.*?\*)\s*([^"\n\r*].*)/g, (match, action, dialogue) => { if (/^\s*["*]/.test(dialogue)) { return match; } return `${action} "${dialogue.trim()}"`; });
        console.log("Processed message (quotes):", message);

        let feedbackToSend = currentFeedback;
        if (currentFeedback) { handleFeedbackSelection(null); }

        // UI 추가 및 기록 저장
        console.log("Appending user message to UI");
        const userMessageEntry = { role: "user", messageData: { type: 'text', text: message } };
        conversationHistory.push(userMessageEntry);
        appendMessage("user", userMessageEntry.messageData, conversationHistory.length - 1);
        saveConversationHistory();

        userInput.value = ''; autoResizeTextarea.call(userInput);
        console.log("Input cleared and resized");

        // API 호출 상태 설정
        sendButton.disabled = true; userInput.disabled = true; actionMenuButton.disabled = true; feedbackButton.disabled = true;
        loadingSpinner.style.display = 'block';
        console.log("UI disabled for API call");

        // API 전송용 contents 구성
        let contentsForApi;
        try {
            const textOnlyContentsForApi = conversationHistory
                .filter(entry => entry.messageData && entry.messageData.type === 'text')
                .map(entry => ({ role: entry.role === 'model' ? 'model' : 'user', parts: [{ text: entry.messageData.text }] }));
            contentsForApi = [{ role: "user", parts: [{ text: SYSTEM_PROMPT }] }, ...textOnlyContentsForApi];

            if (feedbackToSend) {
                 console.log(`Attaching feedback to API call: ${feedbackToSend}`);
                 const lastUserMessageIndex = contentsForApi.length -1;
                 if(contentsForApi[lastUserMessageIndex]?.role === 'user') { contentsForApi[lastUserMessageIndex].parts[0].text = `[사용자 피드백: ${feedbackToSend}] ${contentsForApi[lastUserMessageIndex].parts[0].text}`; }
            }
             console.log("API request contents prepared:", JSON.stringify(contentsForApi)); // 로그 추가 (내용 확인용, 길 수 있음)

        } catch (e) {
             console.error("Error preparing API contents:", e);
             throw e; // 에러 다시 던져서 finally 실행 후 종료
        }


        if (contentsForApi.length <= 1 && textOnlyContentsForApi.length === 0) {
             console.log("API call skipped: no text content");
             // throw new Error("API call skipped intentionally"); // 에러 발생시켜 finally로 가도록 수정
             // 그냥 여기서 finally 블록 내용 직접 실행하거나 return
              sendButton.disabled = false; userInput.disabled = false; actionMenuButton.disabled = false; feedbackButton.disabled = false;
              loadingSpinner.style.display = 'none';
              return; // finally 없이 여기서 종료
        }

        // --- 실제 API 호출 ---
        console.log("Sending API request...");
        const res = await fetch(`/api/chat`, {
             method: "POST",
             headers: { "Content-Type": "application/json" },
             body: JSON.stringify({ contents: contentsForApi }),
        });
        console.log("API response status:", res.status);

        let botReplyText = '';
        if (!res.ok) {
            let errorData = {};
            try { errorData = await res.json(); } catch (e) { console.error("Failed to parse error response JSON", e); }
            console.error("API (Backend) Error:", res.status, errorData);
            const errorText = errorData?.error?.error?.message || errorData?.error || res.statusText || "Unknown API error";
            botReplyText = `(오류 발생: ${res.status} - ${errorText})`;
        } else {
            const data = await res.json();
            console.log("API response data:", data);
            botReplyText = data.candidates?.[0]?.content?.parts?.[0]?.text || "(응답 없음)";
        }

        // 봇 응답 처리
        console.log("Appending bot message to UI");
        const botMessageEntry = { role: "model", messageData: { type: 'text', text: botReplyText } };
        conversationHistory.push(botMessageEntry);
        appendMessage("bot", botMessageEntry.messageData, conversationHistory.length - 1);

    } catch (error) {
        // sendMessage 함수 내 다른 예외 처리
        console.error("Error in sendMessage function:", error);
        // 사용자에게 표시할 오류 메시지 (선택적)
        try {
             const errorMessage = `(메시지 전송 중 오류 발생: ${error.message || '알 수 없는 오류'})`;
             const botMessageEntry = { role: "model", messageData: { type: 'text', text: errorMessage } };
             conversationHistory.push(botMessageEntry);
             appendMessage("bot", botMessageEntry.messageData, conversationHistory.length - 1);
        } catch (appendError) {
             console.error("Error appending error message:", appendError);
        }
    } finally {
        // 상태 복구 (반드시 실행되어야 함)
        console.log("sendMessage finally block executing.");
        try {
             sendButton.disabled = false;
             userInput.disabled = false;
             actionMenuButton.disabled = false;
             feedbackButton.disabled = false;
             loadingSpinner.style.display = 'none';
             saveConversationHistory(); // 최종 저장
             chat.scrollTop = chat.scrollHeight; // 스크롤 이동
             console.log("UI re-enabled.");
        } catch (e) {
             console.error("Error in finally block:", e);
        }
    }
}

// '상황' 요청 함수 (절대 수정 금지!)
async function sendSituationRequest(type) {
    console.log(`sendSituationRequest called with type: ${type}`); // 호출 로그 추가
    // 기존 로직 + try...catch 강화
    sendButton.disabled = true; userInput.disabled = true; actionMenuButton.disabled = true;
    loadingSpinner.style.display = 'block';
    try {
        let situationPromptText = ''; const botName = botNameInputModal.value || "캐릭터";
        switch(type) { /* ... */ }
        const textOnlyContentsForApi = conversationHistory.filter(/* ... */).map(/* ... */);
        const contentsForApi = [ { role: "user", parts: [{ text: SYSTEM_PROMPT }] }, ...textOnlyContentsForApi, { role: "user", parts: [{ text: situationPromptText }] } ];
        console.log("Sending situation request to API...");
        const res = await fetch(`/api/chat`, { /* ... */ });
        console.log("Situation API response status:", res.status);
        let botReplyText = '';
        if (!res.ok) { /* ... 오류 처리 ... */ } else { /* ... 성공 처리 ... */ }
        const botMessageEntry = { role: "model", messageData: { type: 'text', text: botReplyText } };
        conversationHistory.push(botMessageEntry);
        appendMessage("bot", botMessageEntry.messageData, conversationHistory.length - 1);
    } catch (error) {
        console.error("Error in sendSituationRequest:", error);
        appendMessage("bot", { type: 'text', text: `(상황 생성 [${type}] 통신 오류 발생)` });
        conversationHistory.push({ role: "model", messageData: { type: 'text', text: `(상황 생성 통신 오류)` } });
    } finally {
        sendButton.disabled = false; userInput.disabled = false; actionMenuButton.disabled = false;
        loadingSpinner.style.display = 'none'; userInput.focus();
        actionMenu.classList.remove("visible"); menuOverlay.style.display = 'none';
        saveConversationHistory();
    }
}


// 이미지 URL 미리보기 업데이트
function updateImagePreview(imageUrl, imgElement) {
    console.log(`updateImagePreview called. URL: ${imageUrl}`);
    try {
        if (imageUrl && imageUrl.trim() !== '' && imageUrl.trim().startsWith('http')) {
            imgElement.src = imageUrl.trim();
        } else {
            imgElement.src = ""; // 유효하지 않으면 src 제거 (CSS에서 Placeholder 처리)
        }
    } catch (e) { console.error("Error in updateImagePreview:", e); }
}

// 슬롯 버튼 스타일 업데이트
function updateSlotButtonStyles() { /* ... */ }

// 랜덤 생성 함수 (Placeholder)
async function generateRandomCharacter() { console.log("generateRandomCharacter called"); /* ... */ }
async function generateRandomUser() { console.log("generateRandomUser called"); /* ... */ }

// 이미지 미리보기 클릭 시 URL 입력
function promptForImageUrl(targetPreviewElement, isBot) {
    console.log("promptForImageUrl called for:", isBot ? "Bot" : "User");
    try {
        const currentUrl = targetPreviewElement.src.startsWith('http') ? targetPreviewElement.src : '';
        setTimeout(() => {
            try {
                const newImageUrl = prompt("이미지 웹 주소(URL)를 입력하세요:", currentUrl);
                console.log("Image URL prompt returned:", newImageUrl);
                if (newImageUrl !== null) {
                    const trimmedUrl = newImageUrl.trim();
                    if (trimmedUrl === '' || trimmedUrl.startsWith('http://') || trimmedUrl.startsWith('https://')) {
                        updateImagePreview(trimmedUrl, targetPreviewElement);
                        if (isBot) { botProfileImgUrl = trimmedUrl; } else { userProfileImgUrl = trimmedUrl; }
                    } else { alert("유효한 웹 주소 형식(...)이 아닙니다."); }
                }
            } catch (e) { console.error("Error inside promptForImageUrl timeout:", e); }
        }, 0);
    } catch (e) { console.error("Error in promptForImageUrl:", e); }
}

// 피드백 선택 처리
function handleFeedbackSelection(feedbackType) {
    console.log(`handleFeedbackSelection called with type: ${feedbackType}`);
    try {
        /* ... (기존 로직) ... */
        feedbackOptionsContainer.classList.add('hidden');
        menuOverlay.style.display = 'none';
    } catch (e) { console.error("Error in handleFeedbackSelection:", e); }
}

// 대화 기록 저장
function saveConversationHistory() { /* ... (기존 로직 + try/catch) ... */ }
// 대화 기록 로드
function loadConversationHistory() {
    console.log("loadConversationHistory called");
    try {
        const savedHistory = localStorage.getItem(`conversation_history_${currentSlot}`);
        chat.innerHTML = ''; conversationHistory = [];
        if (savedHistory) {
             try {
                 conversationHistory = JSON.parse(savedHistory);
                 console.log(`Loaded ${conversationHistory.length} messages from slot ${currentSlot}`);
                 conversationHistory.forEach((entry, index) => {
                     if (!(entry.role === 'user' && entry.messageData?.type === 'text' && entry.messageData?.text === SYSTEM_PROMPT)) {
                         appendMessage(entry.role === 'model' ? 'bot' : 'user', entry.messageData, index);
                     }
                 });
             } catch (e) { console.error("Failed to parse history:", e); localStorage.removeItem(`conversation_history_${currentSlot}`); }
        } else { console.log(`No history found for slot ${currentSlot}`); }

        if (conversationHistory.length === 0 && !chat.querySelector('.initial-notice')) { // 기록 없고, 공지 없을 때만 추가
            appendInitialNotice();
        }
        requestAnimationFrame(() => { if(chat) chat.scrollTop = chat.scrollHeight; }); // 스크롤 이동
    } catch (e) { console.error("Error in loadConversationHistory:", e); }
}
// 대화 기록 리셋
function resetConversation() { console.log("resetConversation called"); /* ... */ }


// --- DOMContentLoaded 이벤트 리스너 ---
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOMContentLoaded event fired.");
    try {
        // DOM 요소 할당
        console.log("Assigning DOM elements...");
        chat = document.getElementById("chat");
        userInput = document.getElementById("userInput");
        sendButton = document.getElementById("sendButton");
        // ... (다른 모든 요소 할당) ...
        feedbackOptionsContainer = document.getElementById("feedbackOptionsContainer");
        console.log("DOM elements assigned.");

        // 필수 요소 확인
        if (!chat || !userInput || !sendButton || !settingsModalOverlay /* ... 등등 */) {
            console.error("Essential DOM elements are missing! Aborting setup.");
            return; // 필수 요소 없으면 리스너 설정 중단
        }

        // --- 이벤트 리스너 연결 ---
        console.log("Attaching event listeners...");

        // 전송 버튼/Enter 키
        sendButton.addEventListener("click", () => { console.log("Send button clicked."); sendMessage(userInput.value); });
        userInput.addEventListener("keydown", function(event) {
            // console.log(`Keydown event: key=${event.key}, shift=${event.shiftKey}, composing=${event.isComposing}`); // 디버깅 시 사용
            if (event.key === "Enter" && !event.shiftKey && !event.isComposing) {
                console.log("Enter key pressed for sending message.");
                event.preventDefault();
                sendMessage(userInput.value);
            }
        });

        // 액션 메뉴(+) 버튼
        actionMenuButton.addEventListener("click", function(event) {
            console.log("Action menu button clicked.");
            event.stopPropagation();
            feedbackOptionsContainer.classList.add('hidden'); situationOptions.classList.add("hidden");
            actionMenu.classList.toggle("visible");
            menuOverlay.style.display = actionMenu.classList.contains("visible") ? 'block' : 'none';
        });

        // 메뉴 오버레이 클릭
        menuOverlay.addEventListener("click", function() {
            console.log("Menu overlay clicked.");
            actionMenu.classList.remove("visible"); situationOptions.classList.add("hidden"); feedbackOptionsContainer.classList.add('hidden');
            menuOverlay.style.display = 'none';
        });

        // (+) 메뉴 내부 버튼들
        menuImageButton.addEventListener("click", function() { console.log("Image button clicked."); /* ... */ });
        menuSituationButton.addEventListener("click", function(event) { console.log("Situation button clicked."); event.stopPropagation(); /* ... */ situationOptions.classList.toggle("hidden"); });
        if (situationOptions) situationOptions.querySelectorAll(".option").forEach(option => {
            option.addEventListener("click", (event) => {
                console.log(`Situation option clicked: ${option.textContent}`);
                event.stopPropagation(); const situationType = option.textContent;
                if (typeof sendSituationRequest === 'function') { sendSituationRequest(situationType); } else { console.error("sendSituationRequest function not defined!"); }
                situationOptions.classList.add("hidden"); actionMenu.classList.remove("visible"); menuOverlay.style.display = 'none';
            });
        });
        menuExportTxtButton.addEventListener("click", function() { console.log("Export button clicked."); if(typeof exportConversationAsTxt === 'function') exportConversationAsTxt(); else console.error("export function not defined"); });
        menuSummarizeButton.addEventListener("click", function() { console.log("Summarize button clicked."); if(typeof summarizeConversation === 'function') summarizeConversation(); else console.error("summarize function not defined");});

        // 모달 열기/닫기
        sidebarToggle.addEventListener("click", function() { console.log("Sidebar toggle clicked."); /* ... */ settingsModalOverlay.style.display = 'flex'; });
        closeModalButton.addEventListener("click", () => { console.log("Close modal button clicked."); settingsModalOverlay.style.display = 'none'; });
        settingsModalOverlay.addEventListener("click", function(event) { if (event.target === settingsModalOverlay) { console.log("Modal overlay clicked."); settingsModalOverlay.style.display = 'none'; } });

        // 설정 저장 버튼
        saveSettingsButtonModal.addEventListener("click", () => { console.log("Save settings button clicked."); saveSettings(currentSlot); });

        // 슬롯 버튼 클릭
        document.querySelectorAll('.slot-button').forEach(button => {
            button.addEventListener('click', function() { /* ... */ console.log(`Slot button ${this.textContent} clicked.`); /* ... */ loadConversationHistory(); });
        });

        // 랜덤 생성 버튼
        generateRandomCharacterButton.addEventListener('click', generateRandomCharacter);
        generateRandomUserButton.addEventListener('click', generateRandomUser);

        // 이미지 미리보기 클릭 리스너
        if (botImagePreview) botImagePreview.addEventListener('click', () => promptForImageUrl(botImagePreview, true));
        if (userImagePreview) userImagePreview.addEventListener('click', () => promptForImageUrl(userImagePreview, false));

        // 피드백(O) 버튼 클릭
        feedbackButton.addEventListener('click', function(event) {
            console.log("Feedback button clicked."); event.stopPropagation(); actionMenu.classList.remove("visible"); situationOptions.classList.add("hidden");
            feedbackOptionsContainer.classList.toggle('hidden');
            menuOverlay.style.display = feedbackOptionsContainer.classList.contains('hidden') ? 'none' : 'block';
        });

        // 피드백 옵션 버튼 클릭
        if (feedbackOptionsContainer) feedbackOptionsContainer.querySelectorAll('.feedback-option').forEach(button => {
            button.addEventListener('click', function(event) {
                console.log(`Feedback option clicked: ${this.dataset.feedback}`); event.stopPropagation(); const feedbackType = this.dataset.feedback;
                handleFeedbackSelection(feedbackType);
            });
        });

        // textarea 입력 시 높이 자동 조절
        userInput.addEventListener('input', autoResizeTextarea);

        // --- 초기 로딩 ---
        console.log("Running initial setup...");
        initializeChat();
        console.log("Initialization complete.");

    } catch (e) {
        console.error("Error during DOMContentLoaded setup:", e);
        // 사용자에게 치명적 오류 알림 (선택적)
        alert("페이지 초기화 중 심각한 오류가 발생했습니다. 콘솔 로그를 확인해주세요.");
    }

}); // DOMContentLoaded 끝

console.log("Script loaded and parsed."); // 스크립트 로드 완료 로그
