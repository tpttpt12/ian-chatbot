// --- 전역 변수 ---
let userProfileImgUrl = "";
let botProfileImgUrl = "";
let conversationHistory = [];
let SYSTEM_PROMPT = '';
let currentSlot = 1;
let currentFeedback = null;
console.log("Global variables initialized.");

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

// --- DOM 요소 변수 (전역 선언) ---
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
console.log("Defining functions...");

// 이미지 오버레이
function openImageOverlay(element) { try { if (!imageOverlay || !overlayImage) return; overlayImage.src = element.src; imageOverlay.style.display = "flex"; } catch (e) { console.error("Error in openImageOverlay:", e); } }
function closeImageOverlay() { try { if (!imageOverlay || !overlayImage) return; overlayImage.src = ""; imageOverlay.style.display = "none"; } catch (e) { console.error("Error in closeImageOverlay:", e); } }

// Textarea 높이 조절 (1->2줄 후 스크롤) - 최종 수정
function autoResizeTextarea() {
    try {
        this.style.height = 'auto'; // 높이 초기화 중요
        this.style.overflowY = 'hidden'; // 일단 숨김

        const computedStyle = getComputedStyle(this);
        const lineHeight = parseFloat(computedStyle.lineHeight) || 18;
        const paddingTop = parseFloat(computedStyle.paddingTop);
        const paddingBottom = parseFloat(computedStyle.paddingBottom);
        const borderTop = parseFloat(computedStyle.borderTopWidth);
        const borderBottom = parseFloat(computedStyle.borderBottomWidth);

        const oneLineHeight = lineHeight + paddingTop + paddingBottom + borderTop + borderBottom;
        const twoLineHeight = (lineHeight * 2) + paddingTop + paddingBottom + borderTop + borderBottom;
        const minHeight = oneLineHeight; // 최소 1줄 높이

        const contentHeight = this.scrollHeight;

        if (contentHeight > twoLineHeight) { // 2줄보다 크면
            this.style.height = twoLineHeight + 'px'; // 2줄 높이로 고정
            this.style.overflowY = 'auto'; // 스크롤 활성화
        } else { // 2줄 이하일 때
            // 내용 높이만큼 설정하되, 최소 1줄 높이 보장
            this.style.height = Math.max(contentHeight, minHeight) + 'px';
            this.style.overflowY = 'hidden'; // 스크롤 없음
        }
    } catch (e) { console.error("Error in autoResizeTextarea:", e); }
}


// 설정 저장
function saveSettings(slotNumber) {
    console.log(`saveSettings called for slot ${slotNumber}`);
    try {
        const settings = {
            botName: botNameInputModal.value, botAge: botAgeInputModal.value, botGender: botGenderInputModal.value,
            botAppearance: botAppearanceInputModal.value, botPersona: botPersonaInputModal.value,
            botImageUrl: botImagePreview.src.startsWith('http') ? botImagePreview.src : '',
            userName: userNameInputModal.value, userAge: userAgeInputModal.value, userGender: userGenderInputModal.value,
            userAppearance: userAppearanceInputModal.value, userGuidelines: userGuidelinesInputModal.value,
            userImageUrl: userImagePreview.src.startsWith('http') ? userImagePreview.src : ''
        };
        localStorage.setItem(`settings_slot_${slotNumber}`, JSON.stringify(settings));
        alert(`설정 슬롯 ${slotNumber}에 저장되었습니다.`);
        userProfileImgUrl = settings.userImageUrl; botProfileImgUrl = settings.botImageUrl;
        updateSystemPrompt();
    } catch (e) { console.error("Error in saveSettings:", e); alert("설정 저장 중 오류가 발생했습니다."); }
}

// 설정 로드 - 최종 수정
function loadSettings(slotNumber) {
    console.log(`loadSettings called for slot ${slotNumber}`);
    try {
        const savedSettings = localStorage.getItem(`settings_slot_${slotNumber}`);
        let settings = {};
        if (savedSettings) { try { settings = JSON.parse(savedSettings); } catch (e) { console.error("Failed to parse settings for slot " + slotNumber + ":", e); localStorage.removeItem(`settings_slot_${slotNumber}`); } }

        // DOM 요소 null 체크 추가
        if(botNameInputModal) botNameInputModal.value = settings.botName || '';
        if(botAgeInputModal) botAgeInputModal.value = settings.botAge || '';
        if(botGenderInputModal) botGenderInputModal.value = settings.botGender || '';
        if(botAppearanceInputModal) botAppearanceInputModal.value = settings.botAppearance || '';
        if(botPersonaInputModal) botPersonaInputModal.value = settings.botPersona || '';
        if(botImagePreview) updateImagePreview(settings.botImageUrl || '', botImagePreview);

        if(userNameInputModal) userNameInputModal.value = settings.userName || '';
        if(userAgeInputModal) userAgeInputModal.value = settings.userAge || '';
        if(userGenderInputModal) userGenderInputModal.value = settings.userGender || '';
        if(userAppearanceInputModal) userAppearanceInputModal.value = settings.userAppearance || '';
        if(userGuidelinesInputModal) userGuidelinesInputModal.value = settings.userGuidelines || '';
        if(userImagePreview) updateImagePreview(settings.userImageUrl || '', userImagePreview);

        userProfileImgUrl = settings.userImageUrl || "";
        botProfileImgUrl = settings.botImageUrl || "";
        updateSystemPrompt();
    } catch (e) { console.error("Error in loadSettings:", e); }
}

// SYSTEM_PROMPT 업데이트
function updateSystemPrompt() {
    try {
        // DOM 요소 null 체크 추가
        const botName = botNameInputModal?.value || "캐릭터";
        const botAge = botAgeInputModal?.value || "불명";
        const botAppearance = botAppearanceInputModal?.value || "알 수 없음";
        const botPersona = botPersonaInputModal?.value || "설정 없음";
        const userName = userNameInputModal?.value || "사용자";
        const userAge = userAgeInputModal?.value || "불명";
        const userAppearance = userAppearanceInputModal?.value || "알 수 없음";
        const userGuidelines = userGuidelinesInputModal?.value || "설정 없음";

        SYSTEM_PROMPT = SYSTEM_PROMPT_TEMPLATE
            .replace(/{botName}/g, botName)
            .replace(/{botAge}/g, botAge)
            .replace(/{botAppearance}/g, botAppearance)
            .replace(/{botPersona}/g, botPersona)
            .replace(/{userName}/g, userName)
            .replace(/{userAge}/g, userAge)
            .replace(/{userAppearance}/g, userAppearance)
            .replace(/{userGuidelines}/g, userGuidelines);
    } catch (e) { console.error("Error in updateSystemPrompt:", e); }
}

// 초기화
function initializeChat() {
    console.log("initializeChat called");
    try {
        loadSettings(currentSlot);
        updateSlotButtonStyles();
        loadConversationHistory(); // 내부에서 초기 공지 처리
        if(userInput) autoResizeTextarea.call(userInput);
        if(chat) chat.scrollTop = chat.scrollHeight;
        console.log("Chat initialized successfully.");
    } catch (e) { console.error("Error during initializeChat:", e); }
}

// 초기 공지 메시지
function appendInitialNotice() {
    console.log("appendInitialNotice called");
    try{
        if (chat && !chat.querySelector('.initial-notice')) {
             const noticeContainer = document.createElement("div"); /* ... */
             chat.insertBefore(noticeContainer, chat.firstChild);
             const divider = document.createElement("div"); /* ... */
             chat.insertBefore(divider, noticeContainer.nextSibling);
        }
    } catch(e) { console.error("Error appending initial notice:", e); }
}

// 메시지 추가 - 최종 수정 (deleteBtn, 이미지 Fallback)
function appendMessage(role, messageData, index = -1) {
    try {
        if (!chat) { console.error("Chat element not found in appendMessage"); return; }

        if (messageData.type === 'image') {
            const imageAnnouncementContainer = document.createElement("div"); /* ... */
            const imageFadeContainer = document.createElement("div"); /* ... */
            const imgElement = document.createElement("img"); /* ... */
            imgElement.src = messageData.url; /* ... */
            imgElement.onerror = function() { /* ... 오류 처리 (Fallback Text) ... */ };
            imageFadeContainer.appendChild(imgElement); imageAnnouncementContainer.appendChild(imageFadeContainer); chat.appendChild(imageAnnouncementContainer);
        } else { // 텍스트 메시지
            const container = document.createElement("div"); container.className = `message-container ${role}`;
            if (index !== -1) { container.dataset.index = index; }

            const profileArea = document.createElement("div"); profileArea.className = "profile-area";
            const profileImgContainer = document.createElement("div"); profileImgContainer.style.position = 'relative';
            const currentImgUrl = (role === 'user' ? userProfileImgUrl : botProfileImgUrl);
            const profileName = (role === 'user' ? (userNameInputModal?.value || "사용자") : (botNameInputModal?.value || "캐릭터"));

            // 이미지 또는 Fallback 생성
            if (currentImgUrl && currentImgUrl.startsWith('http')) {
                const profileImgElement = document.createElement("img"); profileImgElement.className = "profile-img";
                profileImgElement.src = currentImgUrl; profileImgElement.alt = `${profileName} 프로필`; profileImgElement.loading = 'lazy';
                profileImgElement.addEventListener("click", () => openImageOverlay(profileImgElement));
                profileImgElement.onerror = function() {
                    console.warn(`Image load failed, showing fallback for ${role}: ${this.src}`); this.onerror = null;
                    const fallbackDiv = document.createElement("div"); fallbackDiv.className = "profile-fallback"; fallbackDiv.title = `${profileName} (이미지 없음)`;
                    // 이미지가 포함된 부모(여기서는 profileImgContainer)의 내용을 교체
                    if (profileImgContainer) {
                        profileImgContainer.innerHTML = ''; // 기존 img 태그 제거
                        profileImgContainer.appendChild(fallbackDiv);
                    }
                };
                profileImgContainer.appendChild(profileImgElement);
            } else {
                const fallbackDiv = document.createElement("div"); fallbackDiv.className = "profile-fallback"; fallbackDiv.title = `${profileName} (이미지 없음)`;
                profileImgContainer.appendChild(fallbackDiv);
            }

            // 이모지
            let emojiSpan = null;
            if (role === 'bot') { /* ... 이모지 생성 및 이미지 컨테이너에 추가 ... */
                 emojiSpan = document.createElement("span"); emojiSpan.className = "profile-emoji";
                 const emojis = ['😊', '🤔', '✨', '👀', '😉', '😅', '📝', '💬'];
                 emojiSpan.textContent = emojis[Math.floor(Math.random() * emojis.length)];
                 emojiSpan.style.display = 'inline';
                 profileImgContainer.appendChild(emojiSpan); // 이미지 컨테이너에 추가
            }

            // 이름 & 삭제 버튼
            const roleName = document.createElement("div"); roleName.className = "role-name";
            const nameTextSpan = document.createElement("span"); nameTextSpan.className = "name-text"; nameTextSpan.textContent = profileName;

            let deleteBtn = null; // *** deleteBtn 정의 수정 ***
            deleteBtn = document.createElement("button");
            deleteBtn.className = "delete-btn"; deleteBtn.textContent = "✕"; deleteBtn.title = "메시지 삭제";
            deleteBtn.onclick = () => {
                 const msgIndex = parseInt(container.dataset.index);
                 if (!isNaN(msgIndex) && msgIndex >= 0 && msgIndex < conversationHistory.length) {
                     conversationHistory.splice(msgIndex, 1); saveConversationHistory(); loadConversationHistory(); // UI 갱신
                 } else { container.remove(); }
            };

            roleName.appendChild(nameTextSpan);
            if (deleteBtn) { roleName.appendChild(deleteBtn); }

            // 프로필 영역 조립
            if (role === 'user') { profileArea.appendChild(roleName); profileArea.appendChild(profileImgContainer); }
            else { profileArea.appendChild(profileImgContainer); profileArea.appendChild(roleName); }

            // 메시지 버블
            const contentWrapper = document.createElement("div"); contentWrapper.className = "message-content-wrapper";
            const messageBodyElement = document.createElement("div"); messageBodyElement.className = "message-bubble";
            let rawText = messageData.text || ""; // Null 방지
            let htmlContent = rawText;
            if (typeof marked === 'function') { try { htmlContent = marked.parse(rawText, { breaks: true, gfm: true }); } catch(e){ console.error("Marked error:", e); htmlContent = rawText; } }
            else { console.warn("marked not loaded."); }
            messageBodyElement.innerHTML = htmlContent; contentWrapper.appendChild(messageBodyElement);

            // 최종 조립 및 추가
            container.appendChild(profileArea); container.appendChild(contentWrapper);
            chat.appendChild(container);
        }
        // 메시지 추가 후 스크롤 이동 (선택적)
        // requestAnimationFrame(() => { chat.scrollTop = chat.scrollHeight; });
    } catch (e) { console.error("Error in appendMessage:", e); }
}


// TXT 내보내기
function exportConversationAsTxt() {
    console.log("exportConversationAsTxt called");
    try {
        if (!conversationHistory || conversationHistory.length === 0) { alert("내보낼 대화 내용이 없습니다."); return; }
        let txtContent = "";
        const currentBotName = botNameInputModal?.value || "캐릭터"; // Optional chaining
        const currentUserName = userNameInputModal?.value || "사용자";

        conversationHistory.forEach(entry => {
            if (entry.role === 'user' && entry.messageData?.type === 'text' && entry.messageData?.text === SYSTEM_PROMPT) { return; }
            if (entry.messageData?.type === 'image') { return; } // 이미지 제외

            const name = (entry.role === "user" ? currentUserName : currentBotName);
            let rawText = entry.messageData?.text || ""; // Null 방지
            let processedText = rawText.replace(/\*([^*]+)\*/gs, '$1');
            txtContent += `[${name}] : ${processedText.trim()}\n\n`;
        });
        txtContent = txtContent.trimEnd();
        if (!txtContent) { alert("내보낼 텍스트 내용이 없습니다."); return; }
        const blob = new Blob([txtContent], { type: 'text/plain;charset=utf-8' });
        const link = document.createElement('a'); link.href = URL.createObjectURL(blob); link.download = 'chat_history.txt';
        document.body.appendChild(link); link.click(); document.body.removeChild(link); URL.revokeObjectURL(link.href);
        if(actionMenu) actionMenu.classList.remove("visible");
        if(menuOverlay) menuOverlay.style.display = 'none';
    } catch (e) { console.error("Error in exportConversationAsTxt:", e); alert("TXT 내보내기 중 오류 발생"); }
}

// 요약
async function summarizeConversation() {
    console.log("summarizeConversation called");
    if (!sendButton || !userInput || !actionMenuButton || !loadingSpinner || !menuSummarizeButton) return; // 요소 확인
    sendButton.disabled = true; userInput.disabled = true; actionMenuButton.disabled = true;
    loadingSpinner.style.display = 'block'; menuSummarizeButton.disabled = true;
    try {
        const recentHistory = conversationHistory.slice(-10);
        if (recentHistory.length === 0) { /* ... 처리 ... */ return; }
        const summaryPromptText = `...`;
        const contentsForApi = [{ role: "user", parts: [{ text: SYSTEM_PROMPT }] }];
        recentHistory.forEach(entry => { /* ... 처리 ... */ });
        contentsForApi.push({ role: "user", parts: [{ text: summaryPromptText }] });

        console.log("Sending summary request...");
        const res = await fetch(`/api/chat`, { /* ... */ });
        console.log("Summary API response status:", res.status);
        /* ... 응답 처리 ... */

    } catch (error) { console.error("Fetch Error for Summary:", error); /* ... 오류 메시지 표시 ... */ }
    finally {
        sendButton.disabled = false; userInput.disabled = false; actionMenuButton.disabled = false;
        loadingSpinner.style.display = 'none'; menuSummarizeButton.disabled = false;
        if(userInput) userInput.focus();
        if(actionMenu) actionMenu.classList.remove("visible");
        if(menuOverlay) menuOverlay.style.display = 'none';
    }
}

// 메시지 전송 - 최종 수정
async function sendMessage(messageText) {
    console.log("sendMessage called");
    if (!userInput || !sendButton || !actionMenuButton || !feedbackButton || !loadingSpinner) return; // 필수 요소 확인

    let message = messageText.trim();
    if (!message) { userInput.value = ''; autoResizeTextarea.call(userInput); return; }
    console.log("Original message:", message);

    try {
        message = message.replace(/(\*.*?\*)\s*([^"\n\r*].*)/g, (match, action, dialogue) => { /* ... 따옴표 처리 ... */ });
        console.log("Processed message (quotes):", message);

        let feedbackToSend = currentFeedback;
        if (currentFeedback) { handleFeedbackSelection(null); } // UI 초기화

        const userMessageEntry = { role: "user", messageData: { type: 'text', text: message } };
        conversationHistory.push(userMessageEntry);
        appendMessage("user", userMessageEntry.messageData, conversationHistory.length - 1); // appendMessage 내부에서 chat null 체크
        saveConversationHistory();

        userInput.value = ''; autoResizeTextarea.call(userInput);

        sendButton.disabled = true; userInput.disabled = true; actionMenuButton.disabled = true; feedbackButton.disabled = true;
        loadingSpinner.style.display = 'block';
        console.log("UI disabled for API call");

        let contentsForApi;
        try {
            const textOnlyContentsForApi = conversationHistory
                .filter(entry => entry.messageData && entry.messageData.type === 'text')
                .map(entry => ({ role: entry.role === 'model' ? 'model' : 'user', parts: [{ text: entry.messageData.text }] }));
            contentsForApi = [{ role: "user", parts: [{ text: SYSTEM_PROMPT }] }, ...textOnlyContentsForApi];
            if (feedbackToSend) { /* ... 피드백 추가 로직 ... */ }
            console.log("API request contents prepared.");
        } catch (e) { console.error("Error preparing API contents:", e); throw e; }

        if (contentsForApi.length <= 1 && !contentsForApi.some(c => c.role === 'user' && c.parts[0].text !== SYSTEM_PROMPT)) {
             console.log("API call skipped: no user text content");
             throw new Error("API call skipped intentionally"); // finally 실행시키기 위해 에러 발생
        }

        console.log("Sending API request...");
        const res = await fetch(`/api/chat`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ contents: contentsForApi }) });
        console.log("API response status:", res.status);

        let botReplyText = '';
        if (!res.ok) { /* ... 오류 처리 ... */ }
        else { /* ... 성공 처리 ... */ }

        const botMessageEntry = { role: "model", messageData: { type: 'text', text: botReplyText } };
        conversationHistory.push(botMessageEntry);
        appendMessage("bot", botMessageEntry.messageData, conversationHistory.length - 1);

    } catch (error) {
        console.error("Error in sendMessage function:", error);
        if (error.message !== "API call skipped intentionally") { // 스킵 에러는 무시
            try {
                const errorMessage = `(메시지 전송 중 오류 발생: ${error.message || '알 수 없는 오류'})`;
                const botMessageEntry = { role: "model", messageData: { type: 'text', text: errorMessage } };
                conversationHistory.push(botMessageEntry);
                appendMessage("bot", botMessageEntry.messageData, conversationHistory.length - 1);
            } catch (appendError) { console.error("Error appending error message:", appendError); }
        }
    } finally {
        console.log("sendMessage finally block executing.");
        try {
            // DOM 요소가 여전히 유효한지 확인 후 접근
            if(sendButton) sendButton.disabled = false;
            if(userInput) userInput.disabled = false;
            if(actionMenuButton) actionMenuButton.disabled = false;
            if(feedbackButton) feedbackButton.disabled = false;
            if(loadingSpinner) loadingSpinner.style.display = 'none';
            saveConversationHistory();
            if(chat) requestAnimationFrame(() => { chat.scrollTop = chat.scrollHeight; }); // 스크롤 이동
            console.log("UI re-enabled.");
        } catch (e) { console.error("Error in finally block:", e); }
    }
}


// '상황' 요청 함수 (절대 수정 금지!) - 최종 확인
async function sendSituationRequest(type) {
    console.log(`sendSituationRequest called with type: ${type}`);
    if (!sendButton || !userInput || !actionMenuButton || !loadingSpinner || !botNameInputModal) return; // 요소 확인

    sendButton.disabled = true; userInput.disabled = true; actionMenuButton.disabled = true;
    loadingSpinner.style.display = 'block';
    try {
        let situationPromptText = ''; const botName = botNameInputModal.value || "캐릭터";
        switch(type) { /* ... 프롬프트 설정 ... */ }
        const textOnlyContentsForApi = conversationHistory.filter(/* ... */).map(/* ... */);
        const contentsForApi = [ { role: "user", parts: [{ text: SYSTEM_PROMPT }] }, ...textOnlyContentsForApi, { role: "user", parts: [{ text: situationPromptText }] } ];
        console.log("Sending situation request to API...");
        const res = await fetch(`/api/chat`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ contents: contentsForApi }) });
        console.log("Situation API response status:", res.status);
        let botReplyText = '';
        if (!res.ok) { /* ... */ } else { /* ... */ }
        const botMessageEntry = { role: "model", messageData: { type: 'text', text: botReplyText } };
        conversationHistory.push(botMessageEntry);
        appendMessage("bot", botMessageEntry.messageData, conversationHistory.length - 1);
    } catch (error) { /* ... */ }
    finally {
        if(sendButton) sendButton.disabled = false; if(userInput) userInput.disabled = false; if(actionMenuButton) actionMenuButton.disabled = false;
        if(loadingSpinner) loadingSpinner.style.display = 'none'; if(userInput) userInput.focus();
        if(actionMenu) actionMenu.classList.remove("visible"); if(menuOverlay) menuOverlay.style.display = 'none';
        saveConversationHistory();
    }
}


// 이미지 URL 미리보기 업데이트
function updateImagePreview(imageUrl, imgElement) {
    // console.log(`updateImagePreview called. URL: ${imageUrl}`); // 너무 자주 호출됨
    try {
        if (!imgElement) return;
        if (imageUrl && imageUrl.trim() !== '' && imageUrl.trim().startsWith('http')) {
            imgElement.src = imageUrl.trim();
        } else {
            imgElement.src = "";
        }
    } catch (e) { console.error("Error in updateImagePreview:", e); }
}

// 슬롯 버튼 스타일 업데이트
function updateSlotButtonStyles() { try { document.querySelectorAll('.slot-button').forEach(button => { button.classList.toggle('active', parseInt(button.textContent) === currentSlot); }); } catch(e){ console.error("Error updating slot styles", e);}}

// 랜덤 생성 함수 (Placeholder)
async function generateRandomCharacter() { console.log("generateRandomCharacter called"); alert("랜덤 캐릭터 생성 기능 구현 예정"); }
async function generateRandomUser() { console.log("generateRandomUser called"); alert("랜덤 사용자 생성 기능 구현 예정"); }

// 이미지 미리보기 클릭 시 URL 입력 - 최종 수정
function promptForImageUrl(targetPreviewElement, isBot) {
    console.log("promptForImageUrl called for:", isBot ? "Bot" : "User");
    if (!targetPreviewElement) { console.error("Target preview element is missing in promptForImageUrl"); return; }
    try {
        const currentUrl = targetPreviewElement.src.startsWith('http') ? targetPreviewElement.src : '';
        // setTimeout 제거 (단순 prompt는 일반적으로 문제 없음)
        const newImageUrl = prompt("이미지 웹 주소(URL)를 입력하세요:", currentUrl);
        console.log("Image URL prompt returned:", newImageUrl);
        if (newImageUrl !== null) { // 취소 누르지 않은 경우
            const trimmedUrl = newImageUrl.trim();
            if (trimmedUrl === '' || trimmedUrl.startsWith('http://') || trimmedUrl.startsWith('https://')) {
                updateImagePreview(trimmedUrl, targetPreviewElement); // 미리보기 업데이트
                // 전역 변수 업데이트
                if (isBot) { botProfileImgUrl = trimmedUrl; }
                else { userProfileImgUrl = trimmedUrl; }
            } else {
                alert("유효한 웹 주소 형식(http:// 또는 https:// 로 시작하거나 빈 칸)이 아닙니다.");
            }
        }
    } catch (e) { console.error("Error in promptForImageUrl:", e); alert("URL 입력 중 오류가 발생했습니다."); }
}


// 피드백 선택 처리 - 최종 수정
function handleFeedbackSelection(feedbackType) {
    console.log(`handleFeedbackSelection called with type: ${feedbackType}`);
    try {
        if (!feedbackOptionsContainer || !feedbackButton) return; // 요소 확인
        const feedbackOptions = feedbackOptionsContainer.querySelectorAll('.feedback-option');
        feedbackOptions.forEach(btn => btn.classList.remove('active'));

        if (currentFeedback === feedbackType) {
            currentFeedback = null; feedbackButton.classList.remove('active');
        } else {
            currentFeedback = feedbackType; feedbackButton.classList.add('active');
            if (feedbackType) {
                const selectedButton = feedbackOptionsContainer.querySelector(`.feedback-option[data-feedback="${feedbackType}"]`);
                if (selectedButton) selectedButton.classList.add('active');
            }
        }
        console.log("Current Feedback:", currentFeedback);
        feedbackOptionsContainer.classList.add('hidden'); // 메뉴 닫기
        if(menuOverlay) menuOverlay.style.display = 'none'; // 오버레이 닫기
    } catch (e) { console.error("Error in handleFeedbackSelection:", e); }
}

// 대화 기록 저장 - 최종 수정
function saveConversationHistory() {
    try {
        if (typeof localStorage !== 'undefined') {
             localStorage.setItem(`conversation_history_${currentSlot}`, JSON.stringify(conversationHistory));
             // console.log(`Conversation history saved for slot ${currentSlot}. Length: ${conversationHistory.length}`); // 저장 확인 로그
        } else { console.warn("localStorage is not available."); }
    } catch (e) { console.error("Failed to save history for slot " + currentSlot + ":", e); /* ...오류 처리... */ }
}

// 대화 기록 로드 - 최종 수정
function loadConversationHistory() {
    console.log(`loadConversationHistory called for slot ${currentSlot}`);
    try {
        if (!chat) return; // chat 요소 없으면 중단
        chat.innerHTML = ''; // 로드 전 비우기
        conversationHistory = [];

        if (typeof localStorage !== 'undefined') {
            const savedHistory = localStorage.getItem(`conversation_history_${currentSlot}`);
            if (savedHistory) {
                 try {
                     conversationHistory = JSON.parse(savedHistory);
                     console.log(`Loaded ${conversationHistory.length} messages from slot ${currentSlot}`);
                     conversationHistory.forEach((entry, index) => {
                         if (!(entry.role === 'user' && entry.messageData?.type === 'text' && entry.messageData?.text === SYSTEM_PROMPT)) {
                             appendMessage(entry.role === 'model' ? 'bot' : 'user', entry.messageData, index);
                         }
                     });
                 } catch (e) { console.error("Failed to parse history for slot " + currentSlot + ":", e); localStorage.removeItem(`conversation_history_${currentSlot}`); }
            } else { console.log(`No history found for slot ${currentSlot}`); }
        } else { console.warn("localStorage is not available."); }

        // 초기 공지 추가 (기록 없을 때)
        if (conversationHistory.length === 0) {
            appendInitialNotice();
        }

        // 스크롤 맨 아래로
        requestAnimationFrame(() => { if(chat) chat.scrollTop = chat.scrollHeight; });
    } catch (e) { console.error("Error in loadConversationHistory:", e); }
}
// 대화 기록 리셋
function resetConversation() {
    console.log(`resetConversation called for slot ${currentSlot}`);
    try {
        if (confirm(`슬롯 ${currentSlot}의 대화 기록을 정말로 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`)) {
             conversationHistory = [];
             if (typeof localStorage !== 'undefined') {
                 localStorage.removeItem(`conversation_history_${currentSlot}`);
             }
             if (chat) chat.innerHTML = '';
             appendInitialNotice(); // 초기 공지 다시 표시
             alert(`슬롯 ${currentSlot}의 대화 기록이 초기화되었습니다.`);
        }
    } catch (e) { console.error("Error resetting conversation:", e); alert("대화 기록 초기화 중 오류 발생");}
}

// --- DOMContentLoaded 이벤트 리스너 - 최종 수정 ---
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOMContentLoaded event fired.");
    try {
        // DOM 요소 할당 (하나씩 확인하며 할당)
        function getElement(id) {
            const element = document.getElementById(id);
            if (!element) {
                console.error(`Essential DOM element missing: ID = '${id}'`);
                // alert(`페이지 오류: 필수 요소 '${id}'를 찾을 수 없습니다.`); // 필요시 사용자 알림
            }
            return element;
        }

        console.log("Assigning DOM elements...");
        chat = getElement("chat");
        userInput = getElement("userInput");
        sendButton = getElement("sendButton");
        loadingSpinner = getElement("loadingSpinner");
        imageOverlay = getElement("imageOverlay");
        overlayImage = getElement("overlayImage");
        actionMenuButton = getElement("actionMenuButton");
        actionMenu = getElement("actionMenu");
        menuOverlay = getElement("menuOverlay");
        menuImageButton = getElement("menuImageButton");
        menuSituationButton = getElement("menuSituationButton");
        menuExportTxtButton = getElement("menuExportTxtButton");
        menuSummarizeButton = getElement("menuSummarizeButton");
        situationOptions = getElement("situationOptions");
        settingsModalOverlay = getElement("settingsModalOverlay");
        settingsModal = getElement("settingsModal");
        closeModalButton = getElement("closeModalButton");
        sidebarToggle = getElement("sidebarToggle");
        botNameInputModal = getElement("botNameInputModal");
        botAgeInputModal = getElement("botAgeInputModal");
        botGenderInputModal = getElement("botGenderInputModal");
        botAppearanceInputModal = getElement("botAppearanceInputModal");
        botPersonaInputModal = getElement("botPersonaInputModal");
        botImagePreview = getElement("botImagePreview");
        userNameInputModal = getElement("userNameInputModal");
        userAgeInputModal = getElement("userAgeInputModal");
        userGenderInputModal = getElement("userGenderInputModal");
        userAppearanceInputModal = getElement("userAppearanceInputModal");
        userGuidelinesInputModal = getElement("userGuidelinesInputModal");
        userImagePreview = getElement("userImagePreview");
        saveSettingsButtonModal = getElement("saveSettingsButtonModal");
        generateRandomCharacterButton = getElement("generateRandomCharacter");
        generateRandomUserButton = getElement("generateRandomUser");
        feedbackButton = getElement("feedbackButton");
        feedbackOptionsContainer = getElement("feedbackOptionsContainer");

        // 필수 요소 중 하나라도 없으면 이후 로직 실행 중단
        if (!chat || !userInput || !sendButton || !settingsModalOverlay /* || 다른 필수 요소들... */) {
            console.error("Aborting setup due to missing essential DOM elements.");
            return;
        }
        console.log("Essential DOM elements assigned. Attaching event listeners...");

        // --- 이벤트 리스너 연결 (Null 체크 추가) ---
        if (sendButton) sendButton.addEventListener("click", () => { if(userInput) sendMessage(userInput.value); });
        if (userInput) userInput.addEventListener("keydown", function(event) { if (event.key === "Enter" && !event.shiftKey && !event.isComposing) { event.preventDefault(); sendMessage(userInput.value); } });
        if (actionMenuButton) actionMenuButton.addEventListener("click", function(event) { /* ... 메뉴 토글 ... */ });
        if (menuOverlay) menuOverlay.addEventListener("click", function() { /* ... 메뉴 닫기 ... */ });
        if (menuImageButton) menuImageButton.addEventListener("click", function() { /* ... 알림 ... */ });
        if (menuSituationButton) menuSituationButton.addEventListener("click", function(event) { /* ... 상황 아코디언 토글 ... */ });
        if (situationOptions) situationOptions.querySelectorAll(".option").forEach(option => { option.addEventListener("click", (event) => { /* ... sendSituationRequest 호출 ... */ }); });
        if (menuExportTxtButton) menuExportTxtButton.addEventListener("click", exportConversationAsTxt);
        if (menuSummarizeButton) menuSummarizeButton.addEventListener("click", summarizeConversation);
        if (sidebarToggle) sidebarToggle.addEventListener("click", function() { /* ... 모달 열기 ... */ });
        if (closeModalButton) closeModalButton.addEventListener("click", () => { if(settingsModalOverlay) settingsModalOverlay.style.display = 'none'; });
        if (settingsModalOverlay) settingsModalOverlay.addEventListener("click", function(event) { if (event.target === settingsModalOverlay) { settingsModalOverlay.style.display = 'none'; } });
        if (saveSettingsButtonModal) saveSettingsButtonModal.addEventListener("click", () => saveSettings(currentSlot));
        document.querySelectorAll('.slot-button').forEach(button => { button.addEventListener('click', function() { /* ... 슬롯 변경 ... */ }); });
        if (generateRandomCharacterButton) generateRandomCharacterButton.addEventListener('click', generateRandomCharacter);
        if (generateRandomUserButton) generateRandomUserButton.addEventListener('click', generateRandomUser);
        if (botImagePreview) botImagePreview.addEventListener('click', () => promptForImageUrl(botImagePreview, true));
        if (userImagePreview) userImagePreview.addEventListener('click', () => promptForImageUrl(userImagePreview, false));
        if (feedbackButton) feedbackButton.addEventListener('click', function(event) { /* ... 피드백 메뉴 토글 ... */ });
        if (feedbackOptionsContainer) feedbackOptionsContainer.querySelectorAll('.feedback-option').forEach(button => { button.addEventListener('click', function(event) { /* ... handleFeedbackSelection 호출 ... */ }); });
        if (userInput) userInput.addEventListener('input', autoResizeTextarea);

        console.log("Event listeners attached.");

        // --- 초기 로딩 ---
        console.log("Running initial setup...");
        initializeChat(); // 이 안에서 필요한 요소 null 체크 필요
        console.log("Initialization complete.");

    } catch (e) {
        console.error("Error during DOMContentLoaded setup:", e);
        alert("페이지 초기화 중 심각한 오류가 발생했습니다. 콘솔 로그를 확인해주세요.");
    }
}); // DOMContentLoaded 끝

console.log("Script loaded and parsed.");
