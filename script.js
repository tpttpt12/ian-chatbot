// --- 전역 변수 ---
let userProfileImgUrl = "https://via.placeholder.com/35/4a3a7a/ffffff?text=YOU";
let botProfileImgUrl = "https://via.placeholder.com/35/3a4a3a/ffffff?text=BOT";
let conversationHistory = []; // 대화 기록 배열
let SYSTEM_PROMPT = '';
let currentSlot = 1; // 현재 활성화된 슬롯 번호
let currentFeedback = null; // 현재 선택된 피드백 상태 (null, '지침', '반복', '명시', '칭찬')

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

// --- DOM 요소 가져오기 (DOMContentLoaded에서 할당) ---
let chat, userInput, sendButton, loadingSpinner, imageOverlay, overlayImage,
    actionMenuButton, actionMenu, menuOverlay, menuImageButton, menuSituationButton,
    menuExportTxtButton, menuSummarizeButton, situationOptions,
    settingsModalOverlay, settingsModal, closeModalButton, sidebarToggle,
    botNameInputModal, botAgeInputModal, botGenderInputModal, botAppearanceInputModal,
    botPersonaInputModal, botImagePreview,
    userNameInputModal, userAgeInputModal, userGenderInputModal, userAppearanceInputModal,
    userGuidelinesInputModal, userImagePreview,
    saveSettingsButtonModal, generateRandomCharacterButton, generateRandomUserButton,
    feedbackButton, feedbackOptionsContainer; // feedbackMenu -> feedbackOptionsContainer

// --- 함수 정의 ---

// 이미지 오버레이 열기/닫기 함수
function openImageOverlay(element) {
    if (!imageOverlay || !overlayImage) return;
    overlayImage.src = element.src;
    imageOverlay.style.display = "flex";
}

function closeImageOverlay() {
    if (!imageOverlay || !overlayImage) return;
    overlayImage.src = "";
    imageOverlay.style.display = "none";
}

// textarea 높이 자동 조절 함수 (1->2줄 후 스크롤) - 수정됨
function autoResizeTextarea() {
    this.style.height = 'auto'; // 높이 초기화
    const computedStyle = getComputedStyle(this);
    const lineHeight = parseFloat(computedStyle.lineHeight) || 18; // 기본값 설정 (예: 18px)
    const paddingTop = parseFloat(computedStyle.paddingTop);
    const paddingBottom = parseFloat(computedStyle.paddingBottom);
    const borderTop = parseFloat(computedStyle.borderTopWidth);
    const borderBottom = parseFloat(computedStyle.borderBottomWidth);

    const oneLineHeight = lineHeight + paddingTop + paddingBottom + borderTop + borderBottom;
    const twoLineHeight = (lineHeight * 2) + paddingTop + paddingBottom + borderTop + borderBottom;

    // 내용 높이 계산 (스크롤 높이 사용)
    const contentHeight = this.scrollHeight;

    // 높이 설정 로직
    if (contentHeight >= twoLineHeight) {
        // 내용이 2줄 이상이면 높이를 2줄로 고정하고 스크롤 활성화
        this.style.height = twoLineHeight + 'px';
        this.style.overflowY = 'auto';
    } else if (contentHeight > oneLineHeight) {
        // 내용이 1줄 초과 2줄 이하면 내용 높이에 맞춤
        this.style.height = contentHeight + 'px';
        this.style.overflowY = 'hidden';
    } else {
        // 내용이 1줄 이하면 1줄 높이로 설정 (최소 높이)
        // this.style.height = oneLineHeight + 'px'; // 명시적 설정 대신 min-height CSS 활용 가능
        this.style.overflowY = 'hidden';
    }
}


// 설정 저장 함수
function saveSettings(slotNumber) {
    const settings = {
        botName: botNameInputModal.value,
        botAge: botAgeInputModal.value,
        botGender: botGenderInputModal.value,
        botAppearance: botAppearanceInputModal.value,
        botPersona: botPersonaInputModal.value,
        botImageUrl: botImagePreview.src, // 미리보기 이미지 src 사용
        userName: userNameInputModal.value,
        userAge: userAgeInputModal.value,
        userGender: userGenderInputModal.value,
        userAppearance: userAppearanceInputModal.value,
        userGuidelines: userGuidelinesInputModal.value,
        userImageUrl: userImagePreview.src // 미리보기 이미지 src 사용
    };
    localStorage.setItem(`settings_slot_${slotNumber}`, JSON.stringify(settings));
    alert(`설정 슬롯 ${slotNumber}에 저장되었습니다.`);

    // 저장 시 이미지 URL 전역 변수 업데이트
    userProfileImgUrl = settings.userImageUrl || "https://via.placeholder.com/35/4a3a7a/ffffff?text=YOU";
    botProfileImgUrl = settings.botImageUrl || "https://via.placeholder.com/35/3a4a3a/ffffff?text=BOT";

    updateSystemPrompt();
}

// 설정 로드 함수
function loadSettings(slotNumber) {
    const savedSettings = localStorage.getItem(`settings_slot_${slotNumber}`);
    if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        botNameInputModal.value = settings.botName || '';
        botAgeInputModal.value = settings.botAge || '';
        botGenderInputModal.value = settings.botGender || '';
        botAppearanceInputModal.value = settings.botAppearance || '';
        botPersonaInputModal.value = settings.botPersona || '';
        updateImagePreview(settings.botImageUrl || '', botImagePreview);

        userNameInputModal.value = settings.userName || '';
        userAgeInputModal.value = settings.userAge || '';
        userGenderInputModal.value = settings.userGender || '';
        userAppearanceInputModal.value = settings.userAppearance || '';
        userGuidelinesInputModal.value = settings.userGuidelines || '';
        updateImagePreview(settings.userImageUrl || '', userImagePreview);

        userProfileImgUrl = settings.userImageUrl || "https://via.placeholder.com/35/4a3a7a/ffffff?text=YOU";
        botProfileImgUrl = settings.botImageUrl || "https://via.placeholder.com/35/3a4a3a/ffffff?text=BOT";

    } else {
        // 필드 초기화
        botNameInputModal.value = ''; botAgeInputModal.value = ''; botGenderInputModal.value = '';
        botAppearanceInputModal.value = ''; botPersonaInputModal.value = ''; updateImagePreview('', botImagePreview);
        userNameInputModal.value = ''; userAgeInputModal.value = ''; userGenderInputModal.value = '';
        userAppearanceInputModal.value = ''; userGuidelinesInputModal.value = ''; updateImagePreview('', userImagePreview);

        userProfileImgUrl = "https://via.placeholder.com/35/4a3a7a/ffffff?text=YOU";
        botProfileImgUrl = "https://via.placeholder.com/35/3a4a3a/ffffff?text=BOT";
    }
    updateSystemPrompt();
}

// SYSTEM_PROMPT 업데이트 함수
function updateSystemPrompt() {
    SYSTEM_PROMPT = SYSTEM_PROMPT_TEMPLATE
        .replace(/{botName}/g, botNameInputModal.value || "캐릭터")
        .replace(/{botAge}/g, botAgeInputModal.value || "불명")
        .replace(/{botAppearance}/g, botAppearanceInputModal.value || "알 수 없음")
        .replace(/{botPersona}/g, botPersonaInputModal.value || "설정 없음")
        .replace(/{userName}/g, userNameInputModal.value || "사용자")
        .replace(/{userAge}/g, userAgeInputModal.value || "불명")
        .replace(/{userAppearance}/g, userAppearanceInputModal.value || "알 수 없음")
        .replace(/{userGuidelines}/g, userGuidelinesInputModal.value || "설정 없음");
}

// 초기화 함수
function initializeChat() {
    loadSettings(currentSlot); // 설정 먼저 로드
    updateSlotButtonStyles(); // 슬롯 스타일 업데이트
    loadConversationHistory(); // 대화 기록 로드 및 표시
    if (conversationHistory.length === 0) {
        appendInitialNotice();
    }
    autoResizeTextarea.call(userInput); // 초기 높이 설정
    chat.scrollTop = chat.scrollHeight; // 스크롤 맨 아래로
}

// 초기 공지 메시지 추가 함수
function appendInitialNotice() {
    // 이미 내용이 있으면 추가하지 않음 (중복 방지)
    if (chat.querySelector('.initial-notice')) return;

    const noticeContainer = document.createElement("div");
    noticeContainer.className = "initial-notice";
    noticeContainer.innerHTML = `채팅을 시작합니다. 사용자를 확인해주세요.`;
    // 채팅창 맨 위에 추가 (다른 메시지 로드 후에 호출될 수 있으므로)
    chat.insertBefore(noticeContainer, chat.firstChild);

    const divider = document.createElement("div");
    divider.className = "notice-divider";
    chat.insertBefore(divider, noticeContainer.nextSibling);
}


// 메시지를 채팅창에 추가하는 함수 (레이아웃, 이모지, 삭제 기능)
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
        imgElement.onerror = function() { /* ...오류 처리 로직... */ }

        imageFadeContainer.appendChild(imgElement);
        imageAnnouncementContainer.appendChild(imageFadeContainer);
        chat.appendChild(imageAnnouncementContainer);

    } else { // 텍스트 메시지 처리
        const container = document.createElement("div");
        container.className = `message-container ${role}`;
        // 메시지 식별을 위한 data-index 속성 추가 (선택적)
        if (index !== -1) {
             container.dataset.index = index;
        }

        // 1. 프로필 영역 (상단)
        const profileArea = document.createElement("div");
        profileArea.className = "profile-area";

        // 1a. 프로필 이미지
        const profileImgElement = document.createElement("img");
        profileImgElement.className = "profile-img";
        profileImgElement.src = (role === 'user' ? userProfileImgUrl : botProfileImgUrl);
        profileImgElement.alt = (role === 'user' ? (userNameInputModal.value || "사용자") + " 프로필" : (botNameInputModal.value || "캐릭터") + " 프로필");
        profileImgElement.addEventListener("click", () => openImageOverlay(profileImgElement));
        profileImgElement.onerror = function() { /* ...오류 처리 로직... */ }

        // 1b. 이모지 (봇 랜덤)
        let emojiSpan = null;
        if (role === 'bot') {
            emojiSpan = document.createElement("span");
            emojiSpan.className = "profile-emoji";
            const emojis = ['😊', '🤔', '✨', '👀', '😉', '😅', '📝', '💬'];
            emojiSpan.textContent = emojis[Math.floor(Math.random() * emojis.length)];
            emojiSpan.style.display = 'inline';
        }

        // 1c. 이름 & 삭제 버튼
        const roleName = document.createElement("div");
        roleName.className = "role-name";
        const nameTextSpan = document.createElement("span");
        nameTextSpan.className = "name-text";
        nameTextSpan.textContent = (role === "user" ? userNameInputModal.value || "사용자" : botNameInputModal.value || "캐릭터");
        const deleteBtn = document.createElement("button");
        deleteBtn.className = "delete-btn";
        deleteBtn.textContent = "✕";
        deleteBtn.title = "메시지 삭제";
        deleteBtn.onclick = () => {
            const msgIndex = parseInt(container.dataset.index); // 데이터 속성에서 인덱스 가져오기
            if (!isNaN(msgIndex) && msgIndex >= 0 && msgIndex < conversationHistory.length) {
                // 사용자 확인 (선택적)
                // if (!confirm("메시지를 삭제하시겠습니까?")) return;

                // 대화 기록에서 해당 메시지 제거
                conversationHistory.splice(msgIndex, 1);
                saveConversationHistory(); // 변경사항 저장
                // UI 업데이트 (전체 다시 로드 또는 해당 요소만 제거)
                // container.remove(); // 해당 요소만 제거하는 방식 (간단)
                loadConversationHistory(); // 전체 다시 로드 (인덱스 문제 방지)
            } else {
                // 인덱스가 없거나 유효하지 않으면 그냥 UI에서만 제거 (기록 유지됨)
                 container.remove();
                 console.warn("Could not remove message from history due to missing or invalid index.");
            }
        };
        roleName.appendChild(nameTextSpan);
        roleName.appendChild(deleteBtn);

        // 프로필 영역 조립 (역할에 따라 순서 다름)
        if (role === 'user') {
             profileArea.appendChild(roleName); // 이름 먼저
             profileArea.appendChild(profileImgElement); // 이미지 다음
        } else {
             profileArea.appendChild(profileImgElement); // 이미지 먼저
             if (emojiSpan) profileArea.appendChild(emojiSpan); // 이모지
             profileArea.appendChild(roleName); // 이름 다음
        }

        // 2. 메시지 버블 컨테이너 (하단)
        const contentWrapper = document.createElement("div");
        contentWrapper.className = "message-content-wrapper";

        const messageBodyElement = document.createElement("div");
        messageBodyElement.className = "message-bubble";
        let rawText = messageData.text;
        let htmlContent = marked.parse(rawText, { breaks: true, gfm: true });
        messageBodyElement.innerHTML = htmlContent;
        contentWrapper.appendChild(messageBodyElement);

        // 최종 조립: container -> profileArea, contentWrapper
        container.appendChild(profileArea);
        container.appendChild(contentWrapper);

        chat.appendChild(container);
    }

    // 스크롤 이동은 이 함수를 호출하는 곳에서 처리 (로드 시 여러번 호출 방지)
    // chat.scrollTop = chat.scrollHeight;
}

// 대화 기록을 TXT 파일로 내보내는 함수
function exportConversationAsTxt() {
    // ... (이전과 동일한 로직) ...
    if (conversationHistory.length === 0) { alert("내보낼 대화 내용이 없습니다."); return; }
    let txtContent = "";
    const currentBotName = botNameInputModal.value || "캐릭터";
    const currentUserName = userNameInputModal.value || "사용자";

    conversationHistory.forEach(entry => {
        if (entry.role === 'user' && entry.messageData.type === 'text' && entry.messageData.text === SYSTEM_PROMPT) { return; }
        if (messageData.type === 'image') { return; } // 이미지 메시지 제외 확인

        const name = (entry.role === "user" ? currentUserName : currentBotName);
        let rawText = entry.messageData.text;
        let processedText = rawText.replace(/\*([^*]+)\*/gs, '$1');

        txtContent += `[${name}] : ${processedText.trim()}\n\n`;
    });
    txtContent = txtContent.trimEnd();
    const blob = new Blob([txtContent], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'chat_history.txt';
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
    actionMenu.classList.remove("visible"); menuOverlay.style.display = 'none';
}

// 요약 함수
async function summarizeConversation() {
    // ... (이전과 동일한 로직) ...
    sendButton.disabled = true; userInput.disabled = true; actionMenuButton.disabled = true;
    loadingSpinner.style.display = 'block'; menuSummarizeButton.disabled = true;
    const recentHistory = conversationHistory.slice(-10);
    if (recentHistory.length === 0) { /* ...처리... */ return; }
    const summaryPromptText = `...`; // 프롬프트
    const contentsForApi = [{ role: "user", parts: [{ text: SYSTEM_PROMPT }] }];
    recentHistory.forEach(entry => { /* ...텍스트/이미지 처리... */ });
    contentsForApi.push({ role: "user", parts: [{ text: summaryPromptText }] });
    try { /* ...fetch API... */ } catch (error) { /* ...오류 처리... */ }
    finally { /* ...상태 복구... */ }
}

// 메시지 전송 함수 (자동 따옴표, 피드백 처리)
async function sendMessage(messageText) {
    let message = messageText.trim();
    if (!message) { userInput.value = ''; autoResizeTextarea.call(userInput); return; }

    // 자동 따옴표 처리
    message = message.replace(/(\*.*?\*)\s*([^"\n\r*].*)/g, (match, action, dialogue) => {
        if (/^\s*["*]/.test(dialogue)) { return match; }
        return `${action} "${dialogue.trim()}"`;
    });

    // 피드백 처리 변수 (API 전송 시 사용)
    let feedbackToSend = currentFeedback;

    // 피드백 상태 UI 초기화 (메시지 보내는 즉시)
    if (currentFeedback) {
         handleFeedbackSelection(null); // 시각적 스타일 및 상태 초기화
    }

    // UI에 메시지 추가 및 기록 저장
    const userMessageEntry = { role: "user", messageData: { type: 'text', text: message } };
    conversationHistory.push(userMessageEntry);
    appendMessage("user", userMessageEntry.messageData, conversationHistory.length - 1); // 인덱스 전달
    saveConversationHistory();

    // 입력창 초기화
    userInput.value = '';
    autoResizeTextarea.call(userInput);
    userInput.focus(); // 포커스 유지

    // API 호출 상태 설정
    sendButton.disabled = true;
    userInput.disabled = true;
    actionMenuButton.disabled = true;
    loadingSpinner.style.display = 'block';

    try {
        // API 전송용 contents 구성 (텍스트만 포함)
        const textOnlyContentsForApi = conversationHistory
            .filter(entry => entry.messageData && entry.messageData.type === 'text')
            .map(entry => ({
                role: entry.role === 'model' ? 'model' : 'user',
                parts: [{ text: entry.messageData.text }]
            }));
        const contentsForApi = [{ role: "user", parts: [{ text: SYSTEM_PROMPT }] }, ...textOnlyContentsForApi];

        // 피드백 정보 추가 (예: 마지막 메시지에 접두사 추가)
        if (feedbackToSend) {
            console.log(`Attaching feedback to API call: ${feedbackToSend}`);
            // 예시: 마지막 사용자 메시지 파트에 피드백 정보 추가
            const lastUserMessageIndex = contentsForApi.length -1;
             if(contentsForApi[lastUserMessageIndex]?.role === 'user') {
                 contentsForApi[lastUserMessageIndex].parts[0].text = `[사용자 피드백: ${feedbackToSend}] ${contentsForApi[lastUserMessageIndex].parts[0].text}`;
             }
            // 또는 시스템 프롬프트에 추가하는 방식도 고려 가능
        }

        if (contentsForApi.length <= 1 && textOnlyContentsForApi.length === 0) {
             console.log("API 호출 스킵: 보낼 텍스트 내용 없음");
             return Promise.resolve();
        }

        // --- 실제 API 호출 ---
        const res = await fetch(`/api/chat`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ contents: contentsForApi }),
        });

        let botReplyText = '';
        if (!res.ok) {
            const errorData = await res.json();
            console.error("API (Backend) Error:", res.status, errorData);
            const errorText = errorData?.error?.error?.message || errorData?.error || res.statusText;
            botReplyText = `(오류 발생: ${res.status} - ${errorText})`;
        } else {
            const data = await res.json();
            botReplyText = data.candidates?.[0]?.content?.parts?.[0]?.text || "(응답 없음)";
        }

        // 봇 응답 UI 추가 및 기록 저장
        const botMessageEntry = { role: "model", messageData: { type: 'text', text: botReplyText } };
        conversationHistory.push(botMessageEntry);
        appendMessage("bot", botMessageEntry.messageData, conversationHistory.length - 1); // 인덱스 전달

    } catch (error) {
        console.error("Fetch Error:", error);
        const errorMessage = "(통신 오류 발생)";
        const botMessageEntry = { role: "model", messageData: { type: 'text', text: errorMessage } };
        conversationHistory.push(botMessageEntry);
        appendMessage("bot", botMessageEntry.messageData, conversationHistory.length - 1); // 인덱스 전달
    } finally {
        // API 호출 완료 후 상태 복구
        sendButton.disabled = false;
        userInput.disabled = false;
        actionMenuButton.disabled = false;
        loadingSpinner.style.display = 'none';
        // userInput.focus(); // 포커스는 이미 위에서 처리
        saveConversationHistory(); // 최종 저장
        // 스크롤 맨 아래로 이동
        chat.scrollTop = chat.scrollHeight;
    }
}

// '상황' 요청 함수 (절대 수정 금지 영역!)
async function sendSituationRequest(type) {
    // ... (기존 로직과 동일, 수정 없음) ...
    console.log(`상황 생성 요청 타입: ${type}`);
    sendButton.disabled = true; userInput.disabled = true; actionMenuButton.disabled = true;
    loadingSpinner.style.display = 'block';
    let situationPromptText = ''; const botName = botNameInputModal.value || "캐릭터";
    switch(type) { /* ... 프롬프트 설정 ... */ }
    const textOnlyContentsForApi = conversationHistory.filter(/*...*/).map(/*...*/);
    const contentsForApi = [ { role: "user", parts: [{ text: SYSTEM_PROMPT }] }, ...textOnlyContentsForApi, { role: "user", parts: [{ text: situationPromptText }] } ];
    try { /* ... fetch ... */ } catch (error) { /* ... 오류 처리 ... */ }
    finally { /* ... 상태 복구 ... */ saveConversationHistory(); }
}


// 이미지 URL 입력 시 미리보기 업데이트 함수
function updateImagePreview(imageUrl, imgElement) {
    if (imageUrl && imageUrl.trim() !== '' && imageUrl.trim().startsWith('http')) { // http로 시작하는지 확인 추가
        imgElement.src = imageUrl.trim();
    } else {
        imgElement.src = ""; // 유효하지 않거나 빈 URL이면 src 제거
    }
}

// 슬롯 버튼 스타일 업데이트 함수
function updateSlotButtonStyles() {
    document.querySelectorAll('.slot-button').forEach(button => {
        button.classList.toggle('active', parseInt(button.textContent) === currentSlot);
    });
}

// --- 새로운 함수들 ---

// 랜덤 캐릭터 생성 함수 (Placeholder)
async function generateRandomCharacter() {
    console.log("Generating random character...");
    alert("랜덤 캐릭터 생성 기능 구현 예정 (API 연동 필요)");
    // TODO: API 호출 및 필드 업데이트 로직
    // updateSystemPrompt();
}

// 랜덤 사용자 생성 함수 (Placeholder)
async function generateRandomUser() {
    console.log("Generating random user...");
    alert("랜덤 사용자 생성 기능 구현 예정 (API 연동 필요)");
    // TODO: API 호출 및 필드 업데이트 로직
    // updateSystemPrompt();
}

// 이미지 미리보기 클릭 시 URL 입력 프롬프트 - 수정됨
function promptForImageUrl(targetPreviewElement, isBot) {
    const currentUrl = targetPreviewElement.src.startsWith('http') ? targetPreviewElement.src : '';
    const newImageUrl = prompt("이미지 웹 주소(URL)를 입력하세요:", currentUrl);

    if (newImageUrl !== null) {
        const trimmedUrl = newImageUrl.trim();
        // URL 유효성 검사 강화 (간단히 http/https 또는 비어있는 경우만 허용)
        if (trimmedUrl === '' || trimmedUrl.startsWith('http://') || trimmedUrl.startsWith('https://')) {
             updateImagePreview(trimmedUrl, targetPreviewElement); // 미리보기 업데이트
             // 전역 변수 업데이트
             if (isBot) {
                 botProfileImgUrl = trimmedUrl || "https://via.placeholder.com/35/3a4a3a/ffffff?text=BOT";
             } else {
                 userProfileImgUrl = trimmedUrl || "https://via.placeholder.com/35/4a3a7a/ffffff?text=YOU";
             }
        } else {
            alert("유효한 웹 주소 형식(http:// 또는 https:// 로 시작하거나 빈 칸)이 아닙니다.");
        }
    }
}

// 피드백 버튼 선택 처리 함수 (가로 메뉴용) - 수정됨
function handleFeedbackSelection(feedbackType) {
    const optionsContainer = feedbackOptionsContainer; // 새로운 컨테이너 ID 사용
    const feedbackOptions = optionsContainer.querySelectorAll('.feedback-option');

    // 모든 옵션 버튼 비활성 스타일 제거
    feedbackOptions.forEach(btn => btn.classList.remove('active'));

    // 현재 선택된 피드백 업데이트
    if (currentFeedback === feedbackType) {
        // 같은 버튼 다시 누르면 선택 해제
        currentFeedback = null;
        feedbackButton.classList.remove('active'); // 'O' 버튼 스타일 초기화
    } else {
        currentFeedback = feedbackType;
        feedbackButton.classList.add('active'); // 'O' 버튼 활성 스타일
        // 선택된 버튼에 활성 스타일 적용
        if (feedbackType) {
            const selectedButton = optionsContainer.querySelector(`.feedback-option[data-feedback="${feedbackType}"]`);
            if (selectedButton) {
                selectedButton.classList.add('active');
            }
        }
    }
    console.log("Current Feedback:", currentFeedback);

    // 피드백 메뉴 숨기기 (항상)
    optionsContainer.classList.add('hidden'); // CSS Transition으로 스르륵 효과
    // menuOverlay.style.display = 'none'; // 오버레이 숨김 (별도 관리 필요 시)
}

// 대화 기록 저장 함수
function saveConversationHistory() {
    try {
        localStorage.setItem(`conversation_history_${currentSlot}`, JSON.stringify(conversationHistory));
    } catch (e) { console.error("Failed to save history:", e); /* ...오류 처리... */ }
}

// 대화 기록 로드 함수
function loadConversationHistory() {
    const savedHistory = localStorage.getItem(`conversation_history_${currentSlot}`);
    chat.innerHTML = ''; // 로드 전 기존 채팅창 비우기
    conversationHistory = []; // 내부 기록 초기화

    if (savedHistory) {
        try {
            const parsedHistory = JSON.parse(savedHistory);
            // 파싱된 기록으로 conversationHistory 업데이트
            conversationHistory = parsedHistory;
            // 로드된 기록을 UI에 표시 (인덱스 정보 포함)
            conversationHistory.forEach((entry, index) => {
                if (!(entry.role === 'user' && entry.messageData?.type === 'text' && entry.messageData?.text === SYSTEM_PROMPT)) {
                    appendMessage(entry.role === 'model' ? 'bot' : 'user', entry.messageData, index); // 인덱스 전달
                }
            });
        } catch (e) {
            console.error("Failed to parse history:", e);
            localStorage.removeItem(`conversation_history_${currentSlot}`);
        }
    }
    // 채팅창 스크롤 맨 아래로
    chat.scrollTop = chat.scrollHeight;
}

// 대화 기록 초기화 함수
function resetConversation() {
    // ... (이전과 동일) ...
}


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
    botAgeInputModal = document.getElementById("botAgeInputModal");
    botGenderInputModal = document.getElementById("botGenderInputModal");
    botAppearanceInputModal = document.getElementById("botAppearanceInputModal");
    botPersonaInputModal = document.getElementById("botPersonaInputModal");
    botImagePreview = document.getElementById("botImagePreview");
    userNameInputModal = document.getElementById("userNameInputModal");
    userAgeInputModal = document.getElementById("userAgeInputModal");
    userGenderInputModal = document.getElementById("userGenderInputModal");
    userAppearanceInputModal = document.getElementById("userAppearanceInputModal");
    userGuidelinesInputModal = document.getElementById("userGuidelinesInputModal");
    userImagePreview = document.getElementById("userImagePreview");
    saveSettingsButtonModal = document.getElementById("saveSettingsButtonModal");
    generateRandomCharacterButton = document.getElementById("generateRandomCharacter");
    generateRandomUserButton = document.getElementById("generateRandomUser");
    feedbackButton = document.getElementById("feedbackButton");
    feedbackOptionsContainer = document.getElementById("feedbackOptionsContainer"); // ID 변경됨

    // --- 이벤트 리스너 연결 ---

    // 전송 버튼/Enter 키
    sendButton.addEventListener("click", () => sendMessage(userInput.value));
    userInput.addEventListener("keydown", function(event) { /* ... (이전과 동일) ... */ });

    // 액션 메뉴(+) 버튼
    actionMenuButton.addEventListener("click", function() { /* ... (피드백 메뉴 닫기 추가) ... */
        feedbackOptionsContainer.classList.add('hidden'); // 피드백 메뉴 닫기
        actionMenu.classList.toggle("visible");
        menuOverlay.style.display = actionMenu.classList.contains("visible") ? 'block' : 'none';
        if (actionMenu.classList.contains("visible")) { situationOptions.classList.add("hidden"); }
    });

    // 메뉴 오버레이 클릭
    menuOverlay.addEventListener("click", function() {
        actionMenu.classList.remove("visible");
        situationOptions.classList.add("hidden");
        feedbackOptionsContainer.classList.add('hidden'); // 피드백 메뉴도 닫기
        menuOverlay.style.display = 'none';
    });

    // 이미지 삽입 메뉴 버튼 (동작 변경 알림)
    menuImageButton.addEventListener("click", function() { /* ... (이전과 동일) ... */ });
    // 상황 버튼 (아코디언 토글)
    menuSituationButton.addEventListener("click", function() { /* ... (피드백 메뉴 닫기 추가) ... */
        feedbackOptionsContainer.classList.add('hidden'); // 피드백 메뉴 닫기
        situationOptions.classList.toggle("hidden");
    });
    // 상황 옵션 버튼
    situationOptions.querySelectorAll(".option").forEach(option => { /* ... (이전과 동일) ... */ });
    // TXT 내보내기 버튼
    menuExportTxtButton.addEventListener("click", exportConversationAsTxt);
    // 요약 버튼
    menuSummarizeButton.addEventListener("click", summarizeConversation);

    // 모달 열기/닫기 리스너
    sidebarToggle.addEventListener("click", function() { /* ... (피드백 메뉴 닫기 추가) ... */
        feedbackOptionsContainer.classList.add('hidden');
        loadSettings(currentSlot); updateSlotButtonStyles(); settingsModalOverlay.style.display = 'flex';
        actionMenu.classList.remove("visible"); situationOptions.classList.add("hidden"); menuOverlay.style.display = 'none'; imageOverlay.style.display = 'none';
    });
    closeModalButton.addEventListener("click", () => settingsModalOverlay.style.display = 'none');
    settingsModalOverlay.addEventListener("click", function(event) { if (event.target === settingsModalOverlay) { settingsModalOverlay.style.display = 'none'; } });

    // 설정 저장 버튼
    saveSettingsButtonModal.addEventListener("click", () => saveSettings(currentSlot));

    // 슬롯 버튼 클릭
    document.querySelectorAll('.slot-button').forEach(button => {
        button.addEventListener('click', function() { /* ... (loadConversationHistory 호출 추가) ... */
            const previousSlot = currentSlot;
            const slotNumber = parseInt(this.textContent);
            if (previousSlot !== slotNumber) {
                currentSlot = slotNumber;
                updateSlotButtonStyles();
                loadSettings(slotNumber);
                loadConversationHistory(); // 슬롯 변경 시 대화 로드
            }
        });
    });

    // 랜덤 생성 버튼
    generateRandomCharacterButton.addEventListener('click', generateRandomCharacter);
    generateRandomUserButton.addEventListener('click', generateRandomUser);

    // 이미지 미리보기 클릭 리스너 - 수정됨
    if (botImagePreview) {
        botImagePreview.addEventListener('click', () => promptForImageUrl(botImagePreview, true));
    }
    if (userImagePreview) {
        userImagePreview.addEventListener('click', () => promptForImageUrl(userImagePreview, false));
    }


    // 피드백(O) 버튼 클릭 (가로 메뉴 토글) - 수정됨
    feedbackButton.addEventListener('click', function(event) {
        event.stopPropagation();
        feedbackOptionsContainer.classList.toggle('hidden');
        // 다른 메뉴 닫기
        actionMenu.classList.remove("visible");
        situationOptions.classList.add("hidden");
        // 오버레이 관리는 필요 시 추가 (메뉴 위에 다른 요소 클릭 방지용)
        // menuOverlay.style.display = feedbackOptionsContainer.classList.contains('hidden') ? 'none' : 'block';
    });

    // 피드백 옵션 버튼 클릭 (가로 메뉴 내) - 수정됨
    feedbackOptionsContainer.querySelectorAll('.feedback-option').forEach(button => {
        button.addEventListener('click', function(event) {
            event.stopPropagation();
            const feedbackType = this.dataset.feedback;
            handleFeedbackSelection(feedbackType); // 상태 처리 및 메뉴 닫기 포함
        });
    });

    // textarea 입력 시 높이 자동 조절
    userInput.addEventListener('input', autoResizeTextarea);

    // --- 초기 로딩 ---
    initializeChat(); // 설정 로드, 슬롯 스타일, 대화 로드 포함

}); // DOMContentLoaded 끝