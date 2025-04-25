// --- 전역 변수 ---
// 이미지 URL은 로드 시 설정, 기본값 제거
let userProfileImgUrl = "";
let botProfileImgUrl = "";
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

// 이미지 오버레이 열기/닫기
function openImageOverlay(element) { /* ... */ if (!imageOverlay || !overlayImage) return; overlayImage.src = element.src; imageOverlay.style.display = "flex"; }
function closeImageOverlay() { /* ... */ if (!imageOverlay || !overlayImage) return; overlayImage.src = ""; imageOverlay.style.display = "none"; }

// textarea 높이 자동 조절 (1->2줄 후 스크롤) - 재수정
function autoResizeTextarea() {
    this.style.height = 'auto'; // 높이 초기화
    // 정확한 계산 위해 잠시 스크롤 숨김
    const initialOverflow = this.style.overflowY;
    this.style.overflowY = 'hidden';

    const computedStyle = getComputedStyle(this);
    const lineHeight = parseFloat(computedStyle.lineHeight) || 18;
    const paddingTop = parseFloat(computedStyle.paddingTop);
    const paddingBottom = parseFloat(computedStyle.paddingBottom);
    const borderTop = parseFloat(computedStyle.borderTopWidth);
    const borderBottom = parseFloat(computedStyle.borderBottomWidth);

    // 1줄, 2줄 기준 높이 계산 (border 포함)
    const oneLineHeight = lineHeight + paddingTop + paddingBottom + borderTop + borderBottom;
    const twoLineHeight = (lineHeight * 2) + paddingTop + paddingBottom + borderTop + borderBottom;
    const minHeight = oneLineHeight; // 최소 높이는 1줄

    // 실제 내용 높이
    const contentHeight = this.scrollHeight;

    if (contentHeight >= twoLineHeight) {
        this.style.height = twoLineHeight + 'px';
        this.style.overflowY = 'auto'; // 2줄 넘으면 스크롤
    } else {
        // 1줄 ~ 2줄 사이: 내용 높이만큼, 단 최소 높이(1줄) 보장
        this.style.height = Math.max(contentHeight, minHeight) + 'px';
        this.style.overflowY = 'hidden'; // 스크롤 없음
    }
     // 원래 overflow 상태 복구 (autoResizeTextarea 반복 호출 대비)
     // this.style.overflowY = initialOverflow; // 주석 처리: 항상 계산 후 상태 결정
}

// 설정 저장 함수
function saveSettings(slotNumber) {
    const settings = {
        botName: botNameInputModal.value, botAge: botAgeInputModal.value, botGender: botGenderInputModal.value,
        botAppearance: botAppearanceInputModal.value, botPersona: botPersonaInputModal.value,
        botImageUrl: botImagePreview.src.startsWith('http') ? botImagePreview.src : '', // 유효한 URL만 저장
        userName: userNameInputModal.value, userAge: userAgeInputModal.value, userGender: userGenderInputModal.value,
        userAppearance: userAppearanceInputModal.value, userGuidelines: userGuidelinesInputModal.value,
        userImageUrl: userImagePreview.src.startsWith('http') ? userImagePreview.src : '' // 유효한 URL만 저장
    };
    localStorage.setItem(`settings_slot_${slotNumber}`, JSON.stringify(settings));
    alert(`설정 슬롯 ${slotNumber}에 저장되었습니다.`);
    // 전역 변수 업데이트
    userProfileImgUrl = settings.userImageUrl;
    botProfileImgUrl = settings.botImageUrl;
    updateSystemPrompt();
}

// 설정 로드 함수 - 수정: 이미지 URL 처리 변경
function loadSettings(slotNumber) {
    const savedSettings = localStorage.getItem(`settings_slot_${slotNumber}`);
    let settings = {}; // 기본 빈 객체

    if (savedSettings) {
        try {
            settings = JSON.parse(savedSettings);
        } catch (e) {
            console.error("Failed to parse settings:", e);
            localStorage.removeItem(`settings_slot_${slotNumber}`); // 잘못된 데이터 삭제
        }
    }

    // 필드 값 설정 (없으면 빈 문자열)
    botNameInputModal.value = settings.botName || '';
    botAgeInputModal.value = settings.botAge || '';
    botGenderInputModal.value = settings.botGender || '';
    botAppearanceInputModal.value = settings.botAppearance || '';
    botPersonaInputModal.value = settings.botPersona || '';
    updateImagePreview(settings.botImageUrl || '', botImagePreview); // 유효하지 않으면 src="" 설정됨

    userNameInputModal.value = settings.userName || '';
    userAgeInputModal.value = settings.userAge || '';
    userGenderInputModal.value = settings.userGender || '';
    userAppearanceInputModal.value = settings.userAppearance || '';
    userGuidelinesInputModal.value = settings.userGuidelines || '';
    updateImagePreview(settings.userImageUrl || '', userImagePreview);

    // 전역 변수 업데이트
    userProfileImgUrl = settings.userImageUrl || ""; // 없으면 빈 문자열
    botProfileImgUrl = settings.botImageUrl || ""; // 없으면 빈 문자열

    updateSystemPrompt();
}

// SYSTEM_PROMPT 업데이트 함수
function updateSystemPrompt() { /* ... (이전과 동일) ... */ }

// 초기화 함수
function initializeChat() {
    // 순서 변경: 설정 로드 -> 슬롯 스타일 -> 대화 로드
    loadSettings(currentSlot);
    updateSlotButtonStyles();
    loadConversationHistory(); // 대화 로드 및 표시 (내부에서 초기 공지 처리)
    autoResizeTextarea.call(userInput);
    chat.scrollTop = chat.scrollHeight;
}

// 초기 공지 메시지 추가 함수
function appendInitialNotice() { /* ... (이전과 동일) ... */ }

// 메시지를 채팅창에 추가하는 함수 - 수정: 이미지 오류 처리 강화
function appendMessage(role, messageData, index = -1) {
    // 이미지 메시지 처리
    if (messageData.type === 'image') { /* ... (이전과 동일) ... */ }
    else { // 텍스트 메시지 처리
        const container = document.createElement("div");
        container.className = `message-container ${role}`;
        if (index !== -1) { container.dataset.index = index; }

        // 1. 프로필 영역
        const profileArea = document.createElement("div");
        profileArea.className = "profile-area";

        // 1a. 프로필 이미지 또는 Fallback
        const profileImgContainer = document.createElement("div"); // 이미지/Fallback 담을 컨테이너
        profileImgContainer.style.position = 'relative'; // 이모지 위치 기준
        const currentImgUrl = (role === 'user' ? userProfileImgUrl : botProfileImgUrl);
        const profileName = (role === 'user' ? (userNameInputModal.value || "사용자") : (botNameInputModal.value || "캐릭터"));

        // URL이 유효한 경우에만 img 태그 생성 시도
        if (currentImgUrl && currentImgUrl.startsWith('http')) {
            const profileImgElement = document.createElement("img");
            profileImgElement.className = "profile-img";
            profileImgElement.src = currentImgUrl;
            profileImgElement.alt = `${profileName} 프로필`;
            profileImgElement.loading = 'lazy'; // 이미지 레이지 로딩
            profileImgElement.addEventListener("click", () => openImageOverlay(profileImgElement));
            // 에러 발생 시 Fallback Div로 교체!!!
            profileImgElement.onerror = function() {
                console.warn(`Image load failed for ${role}: ${this.src}`);
                this.onerror = null; // 반복 에러 방지
                const fallbackDiv = document.createElement("div");
                fallbackDiv.className = "profile-fallback";
                fallbackDiv.title = `${profileName} (이미지 없음)`; // 툴팁 추가
                // 교체 시 profileImgContainer 내부를 교체해야 함
                profileImgContainer.innerHTML = ''; // 내부 비우기
                profileImgContainer.appendChild(fallbackDiv);
            }
            profileImgContainer.appendChild(profileImgElement);
        } else {
            // URL이 없거나 유효하지 않으면 처음부터 Fallback Div 사용
            const fallbackDiv = document.createElement("div");
            fallbackDiv.className = "profile-fallback";
            fallbackDiv.title = `${profileName} (이미지 없음)`;
            profileImgContainer.appendChild(fallbackDiv);
        }

        // 1b. 이모지 (봇 랜덤)
        let emojiSpan = null;
        if (role === 'bot') { /* ... (이전과 동일) ... */ }

        // 1c. 이름 & 삭제 버튼
        const roleName = document.createElement("div");
        roleName.className = "role-name";
        /* ... 이름(nameTextSpan), 삭제 버튼(deleteBtn) 생성 및 이벤트 연결 ... */
        deleteBtn.onclick = () => { /* ... (기록 삭제 및 UI 업데이트 - loadConversationHistory 호출로 변경) ... */
             const msgIndex = parseInt(container.dataset.index);
             if (!isNaN(msgIndex) && msgIndex >= 0 && msgIndex < conversationHistory.length) {
                 conversationHistory.splice(msgIndex, 1);
                 saveConversationHistory();
                 loadConversationHistory(); // 전체 다시 로드
             } else { container.remove(); /* UI만 제거 */ }
         };
        roleName.appendChild(nameTextSpan);
        roleName.appendChild(deleteBtn);

        // 프로필 영역 조립 (순서 주의)
        if (role === 'user') {
             profileArea.appendChild(roleName);
             profileArea.appendChild(profileImgContainer); // 이미지/Fallback 컨테이너 추가
        } else {
             profileArea.appendChild(profileImgContainer); // 이미지/Fallback 컨테이너 추가
             if (emojiSpan) profileImgContainer.appendChild(emojiSpan); // 이모지는 이미지 컨테이너에 겹치도록
             profileArea.appendChild(roleName);
        }

        // 2. 메시지 버블 컨테이너
        const contentWrapper = document.createElement("div");
        contentWrapper.className = "message-content-wrapper";
        /* ... 메시지 버블(messageBodyElement) 생성 및 내용 채우기 ... */
        contentWrapper.appendChild(messageBodyElement);

        // 최종 조립
        container.appendChild(profileArea);
        container.appendChild(contentWrapper);
        chat.appendChild(container);
    }
    // 스크롤은 appendMessage 호출 후 별도 처리
}

// 대화 기록 TXT 내보내기
function exportConversationAsTxt() { /* ... (이전과 동일) ... */ }

// 요약 함수
async function summarizeConversation() { /* ... (이전과 동일) ... */ }

// 메시지 전송 함수 - 수정: Enter 키 로직 확인
async function sendMessage(messageText) {
    let message = messageText.trim();
    if (!message) { userInput.value = ''; autoResizeTextarea.call(userInput); return; }

    // 자동 따옴표
    message = message.replace(/(\*.*?\*)\s*([^"\n\r*].*)/g, (match, action, dialogue) => {
        if (/^\s*["*]/.test(dialogue)) { return match; }
        return `${action} "${dialogue.trim()}"`;
    });

    let feedbackToSend = currentFeedback;
    if (currentFeedback) { handleFeedbackSelection(null); } // UI 즉시 초기화

    // UI 추가 및 기록 저장
    const userMessageEntry = { role: "user", messageData: { type: 'text', text: message } };
    conversationHistory.push(userMessageEntry);
    appendMessage("user", userMessageEntry.messageData, conversationHistory.length - 1);
    saveConversationHistory();

    // 입력창 초기화 및 포커스
    userInput.value = '';
    autoResizeTextarea.call(userInput);
    // userInput.focus(); // API 호출 전에 포커스 유지

    // API 호출 상태 설정
    sendButton.disabled = true; userInput.disabled = true; actionMenuButton.disabled = true; feedbackButton.disabled = true; // 피드백 버튼도 비활성화
    loadingSpinner.style.display = 'block';

    try {
        // API 전송용 contents 구성
        const textOnlyContentsForApi = conversationHistory
            .filter(entry => entry.messageData && entry.messageData.type === 'text')
            .map(entry => ({
                role: entry.role === 'model' ? 'model' : 'user',
                parts: [{ text: entry.messageData.text }]
            }));
        const contentsForApi = [{ role: "user", parts: [{ text: SYSTEM_PROMPT }] }, ...textOnlyContentsForApi];

        // 피드백 정보 추가 (필요 시)
        if (feedbackToSend) { /* ... 피드백 정보 추가 로직 ... */ }

        if (contentsForApi.length <= 1 && textOnlyContentsForApi.length === 0) { return Promise.resolve(); }

        // --- API 호출 ---
        const res = await fetch(`/api/chat`, { /* ... */ });
        let botReplyText = '';
        if (!res.ok) { /* ... 오류 처리 ... */ }
        else { /* ... 성공 처리 ... */ }

        // 봇 응답 처리
        const botMessageEntry = { role: "model", messageData: { type: 'text', text: botReplyText } };
        conversationHistory.push(botMessageEntry);
        appendMessage("bot", botMessageEntry.messageData, conversationHistory.length - 1);

    } catch (error) { /* ... 통신 오류 처리 ... */
        const errorMessage = "(통신 오류 발생)";
        const botMessageEntry = { role: "model", messageData: { type: 'text', text: errorMessage } };
        conversationHistory.push(botMessageEntry);
        appendMessage("bot", botMessageEntry.messageData, conversationHistory.length - 1);
    } finally {
        // 상태 복구
        sendButton.disabled = false; userInput.disabled = false; actionMenuButton.disabled = false; feedbackButton.disabled = false; // 피드백 버튼 활성화
        loadingSpinner.style.display = 'none';
        saveConversationHistory(); // 최종 저장
        chat.scrollTop = chat.scrollHeight; // 스크롤 이동
        // userInput.focus(); // 입력창 포커스 (필요 시)
    }
}

// '상황' 요청 함수 (절대 수정 금지!)
async function sendSituationRequest(type) { /* ... (기존 로직 유지) ... */ }

// 이미지 URL 입력 시 미리보기 업데이트 함수
function updateImagePreview(imageUrl, imgElement) { /* ... (이전과 동일, 유효성 검사 포함) ... */ }

// 슬롯 버튼 스타일 업데이트 함수
function updateSlotButtonStyles() { /* ... (이전과 동일) ... */ }

// --- 새로운 함수들 ---

// 랜덤 캐릭터 생성 함수 (Placeholder)
async function generateRandomCharacter() { /* ... (이전과 동일) ... */ }

// 랜덤 사용자 생성 함수 (Placeholder)
async function generateRandomUser() { /* ... (이전과 동일) ... */ }

// 이미지 미리보기 클릭 시 URL 입력 프롬프트 - 수정됨
function promptForImageUrl(targetPreviewElement, isBot) {
    const currentUrl = targetPreviewElement.src.startsWith('http') ? targetPreviewElement.src : '';
    // setTimeout을 사용하여 클릭 이벤트 핸들러 종료 후 prompt 실행 (혹시 모를 충돌 방지)
    setTimeout(() => {
        const newImageUrl = prompt("이미지 웹 주소(URL)를 입력하세요:", currentUrl);

        if (newImageUrl !== null) {
            const trimmedUrl = newImageUrl.trim();
            if (trimmedUrl === '' || trimmedUrl.startsWith('http://') || trimmedUrl.startsWith('https://')) {
                updateImagePreview(trimmedUrl, targetPreviewElement);
                // 전역 변수 업데이트
                if (isBot) { botProfileImgUrl = trimmedUrl; }
                else { userProfileImgUrl = trimmedUrl; }
                 // 변경 시 즉시 저장하지 않고, 사용자가 Save 버튼을 누르도록 유도
                 // saveSettings(currentSlot); // 자동 저장 안함
            } else {
                alert("유효한 웹 주소 형식(http:// 또는 https:// 로 시작하거나 빈 칸)이 아닙니다.");
            }
        }
    }, 0); // 비동기 실행
}

// 피드백 버튼 선택 처리 함수 (가로 메뉴용) - 수정됨
function handleFeedbackSelection(feedbackType) {
    const optionsContainer = feedbackOptionsContainer;
    const feedbackOptions = optionsContainer.querySelectorAll('.feedback-option');
    feedbackOptions.forEach(btn => btn.classList.remove('active'));

    if (currentFeedback === feedbackType) {
        currentFeedback = null;
        feedbackButton.classList.remove('active');
    } else {
        currentFeedback = feedbackType;
        feedbackButton.classList.add('active');
        if (feedbackType) {
            const selectedButton = optionsContainer.querySelector(`.feedback-option[data-feedback="${feedbackType}"]`);
            if (selectedButton) selectedButton.classList.add('active');
        }
    }
    console.log("Current Feedback:", currentFeedback);
    // 메뉴는 항상 닫기 (선택 시 또는 해제 시)
    optionsContainer.classList.add('hidden');
    menuOverlay.style.display = 'none'; // 오버레이도 닫기
}

// 대화 기록 저장 함수
function saveConversationHistory() { /* ... (이전과 동일) ... */ }

// 대화 기록 로드 함수 - 수정: 초기 공지 로직 포함
function loadConversationHistory() {
    const savedHistory = localStorage.getItem(`conversation_history_${currentSlot}`);
    chat.innerHTML = '';
    conversationHistory = [];

    if (savedHistory) {
        try {
            conversationHistory = JSON.parse(savedHistory);
            conversationHistory.forEach((entry, index) => {
                if (!(entry.role === 'user' && entry.messageData?.type === 'text' && entry.messageData?.text === SYSTEM_PROMPT)) {
                    appendMessage(entry.role === 'model' ? 'bot' : 'user', entry.messageData, index);
                }
            });
        } catch (e) { /* ... 오류 처리 ... */ localStorage.removeItem(`conversation_history_${currentSlot}`); }
    }

    // 대화 로드 후, 기록이 없으면 초기 공지 추가
    if (conversationHistory.length === 0) {
        appendInitialNotice();
    }

    // 스크롤 맨 아래로 (메시지 렌더링 후)
    requestAnimationFrame(() => { // DOM 업데이트 후 실행
        chat.scrollTop = chat.scrollHeight;
    });
}

// 대화 기록 초기화 함수
function resetConversation() { /* ... (이전과 동일) ... */ }


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
    feedbackOptionsContainer = document.getElementById("feedbackOptionsContainer");

    // --- 이벤트 리스너 연결 ---

    // 전송 버튼/Enter 키 - 수정됨
    sendButton.addEventListener("click", () => sendMessage(userInput.value));
    userInput.addEventListener("keydown", function(event) {
        // Enter만 눌렸고, 한글 입력 중이 아닐 때 전송
        if (event.key === "Enter" && !event.shiftKey && !event.isComposing) {
            event.preventDefault(); // 기본 Enter 동작(줄바꿈) 방지
            sendMessage(userInput.value);
        }
    });

    // 액션 메뉴(+) 버튼 - 수정: 오버레이 관리 포함
    actionMenuButton.addEventListener("click", function(event) {
        event.stopPropagation();
        feedbackOptionsContainer.classList.add('hidden'); // 다른 메뉴 닫기
        situationOptions.classList.add("hidden"); // 다른 아코디언 닫기
        actionMenu.classList.toggle("visible");
        // 오버레이는 메뉴가 열릴 때만 표시
        menuOverlay.style.display = actionMenu.classList.contains("visible") ? 'block' : 'none';
    });

    // 메뉴 오버레이 클릭 - 수정: 모든 메뉴 닫기
    menuOverlay.addEventListener("click", function() {
        actionMenu.classList.remove("visible");
        situationOptions.classList.add("hidden");
        feedbackOptionsContainer.classList.add('hidden');
        menuOverlay.style.display = 'none';
    });

    // (+) 메뉴 내부 버튼들 - 리스너 복구
    menuImageButton.addEventListener("click", function() {
        alert("이미지 추가 방식이 변경되었습니다. 모달의 이미지 영역을 클릭하여 URL을 입력해주세요.");
        actionMenu.classList.remove("visible"); menuOverlay.style.display = 'none';
    });
    menuSituationButton.addEventListener("click", function(event) { // 상황 버튼 - 아코디언 토글
        event.stopPropagation(); // 상위 메뉴 닫힘 방지
        feedbackOptionsContainer.classList.add('hidden');
        situationOptions.classList.toggle("hidden");
         // 오버레이는 아코디언 열릴 때만 표시 (선택적)
        // menuOverlay.style.display = situationOptions.classList.contains('hidden') ? 'none' : 'block';
    });
    situationOptions.querySelectorAll(".option").forEach(option => { // 상황 옵션 클릭
        option.addEventListener("click", (event) => {
            event.stopPropagation();
            const situationType = option.textContent;
            sendSituationRequest(situationType);
            situationOptions.classList.add("hidden");
            actionMenu.classList.remove("visible");
            menuOverlay.style.display = 'none';
        });
    });
    menuExportTxtButton.addEventListener("click", exportConversationAsTxt); // 저장 버튼
    menuSummarizeButton.addEventListener("click", summarizeConversation); // 요약 버튼

    // 모달 열기/닫기 리스너 - 수정: 오버레이 관리 포함
    sidebarToggle.addEventListener("click", function() {
        actionMenu.classList.remove("visible"); situationOptions.classList.add("hidden"); feedbackOptionsContainer.classList.add('hidden'); menuOverlay.style.display = 'none'; imageOverlay.style.display = 'none'; // 다른 상호작용 요소 닫기
        loadSettings(currentSlot); updateSlotButtonStyles(); settingsModalOverlay.style.display = 'flex';
    });
    closeModalButton.addEventListener("click", () => settingsModalOverlay.style.display = 'none');
    settingsModalOverlay.addEventListener("click", function(event) { if (event.target === settingsModalOverlay) { settingsModalOverlay.style.display = 'none'; } });

    // 설정 저장 버튼
    saveSettingsButtonModal.addEventListener("click", () => saveSettings(currentSlot));

    // 슬롯 버튼 클릭
    document.querySelectorAll('.slot-button').forEach(button => {
        button.addEventListener('click', function() {
            const previousSlot = currentSlot; const slotNumber = parseInt(this.textContent);
            if (previousSlot !== slotNumber) {
                currentSlot = slotNumber; updateSlotButtonStyles(); loadSettings(slotNumber); loadConversationHistory(); // 대화 로드 추가
            }
        });
    });

    // 랜덤 생성 버튼
    generateRandomCharacterButton.addEventListener('click', generateRandomCharacter);
    generateRandomUserButton.addEventListener('click', generateRandomUser);

    // 이미지 미리보기 클릭 리스너 - 수정됨
    if (botImagePreview) botImagePreview.addEventListener('click', () => promptForImageUrl(botImagePreview, true));
    if (userImagePreview) userImagePreview.addEventListener('click', () => promptForImageUrl(userImagePreview, false));

    // 피드백(O) 버튼 클릭 (가로 메뉴 토글) - 수정됨
    feedbackButton.addEventListener('click', function(event) {
        event.stopPropagation();
        actionMenu.classList.remove("visible"); // 다른 메뉴 닫기
        situationOptions.classList.add("hidden");
        feedbackOptionsContainer.classList.toggle('hidden');
        menuOverlay.style.display = feedbackOptionsContainer.classList.contains('hidden') ? 'none' : 'block'; // 오버레이 토글
    });

    // 피드백 옵션 버튼 클릭 (가로 메뉴 내) - 수정됨
    feedbackOptionsContainer.querySelectorAll('.feedback-option').forEach(button => {
        button.addEventListener('click', function(event) {
            event.stopPropagation();
            const feedbackType = this.dataset.feedback;
            handleFeedbackSelection(feedbackType); // 상태 처리 및 메뉴/오버레이 닫기 포함
        });
    });

    // textarea 입력 시 높이 자동 조절
    userInput.addEventListener('input', autoResizeTextarea);

    // --- 초기 로딩 ---
    initializeChat(); // 설정 로드, 슬롯 스타일, 대화 로드, 초기 높이 포함

}); // DOMContentLoaded 끝
