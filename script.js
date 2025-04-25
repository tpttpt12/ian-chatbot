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
    botPersonaInputModal, /* botImageUrlInputModal, */ botImagePreview, // URL 입력 필드 삭제
    userNameInputModal, userAgeInputModal, userGenderInputModal, userAppearanceInputModal,
    userGuidelinesInputModal, /* userImageUrlInputModal, */ userImagePreview, // URL 입력 필드 삭제
    saveSettingsButtonModal, generateRandomCharacterButton, generateRandomUserButton, // 랜덤 버튼 추가
    feedbackButton, feedbackMenu; // 피드백 버튼/메뉴 추가

// --- 함수 정의 ---

// 이미지 오버레이 열기/닫기 함수
function openImageOverlay(element) {
    if (!imageOverlay || !overlayImage) return; // 요소 없으면 중단
    overlayImage.src = element.src;
    imageOverlay.style.display = "flex";
}

function closeImageOverlay() {
    if (!imageOverlay || !overlayImage) return;
    overlayImage.src = "";
    imageOverlay.style.display = "none";
}

// textarea 높이 자동 조절 함수 (1~2줄 동적 조절)
function autoResizeTextarea() {
    this.style.height = 'auto'; // 높이 초기화
    const computedStyle = getComputedStyle(this);
    const lineHeight = parseFloat(computedStyle.lineHeight);
    const paddingTop = parseFloat(computedStyle.paddingTop);
    const paddingBottom = parseFloat(computedStyle.paddingBottom);

    const oneLineHeight = lineHeight + paddingTop + paddingBottom;
    const twoLineHeight = (lineHeight * 2) + paddingTop + paddingBottom;

    // 스크롤 높이가 2줄 높이보다 크면, 높이를 2줄로 고정하고 스크롤 활성화
    if (this.scrollHeight > twoLineHeight) {
        this.style.height = twoLineHeight + 'px';
        this.style.overflowY = 'auto';
    }
    // 스크롤 높이가 1줄과 2줄 사이면, 스크롤 높이만큼 설정 (자연스럽게 늘어남)
    else if (this.scrollHeight > oneLineHeight) {
        this.style.height = this.scrollHeight + 'px';
        this.style.overflowY = 'hidden';
    }
    // 1줄 이하면 1줄 높이로 고정
    else {
        this.style.height = oneLineHeight + 'px';
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

    // 저장 시 이미지 URL 변수 업데이트 (미리보기 기준)
    userProfileImgUrl = settings.userImageUrl || "https://via.placeholder.com/35/4a3a7a/ffffff?text=YOU";
    botProfileImgUrl = settings.botImageUrl || "https://via.placeholder.com/35/3a4a3a/ffffff?text=BOT";

    // 저장 후 SYSTEM_PROMPT 업데이트
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
        updateImagePreview(settings.botImageUrl || '', botImagePreview); // 미리보기 업데이트 함수 사용

        userNameInputModal.value = settings.userName || '';
        userAgeInputModal.value = settings.userAge || '';
        userGenderInputModal.value = settings.userGender || '';
        userAppearanceInputModal.value = settings.userAppearance || '';
        userGuidelinesInputModal.value = settings.userGuidelines || '';
        updateImagePreview(settings.userImageUrl || '', userImagePreview); // 미리보기 업데이트 함수 사용

        // 로드 시 이미지 URL 전역 변수 업데이트
        userProfileImgUrl = settings.userImageUrl || "https://via.placeholder.com/35/4a3a7a/ffffff?text=YOU";
        botProfileImgUrl = settings.botImageUrl || "https://via.placeholder.com/35/3a4a3a/ffffff?text=BOT";

    } else {
        // 저장된 설정이 없을 경우 필드 초기화 및 기본 이미지 표시
        botNameInputModal.value = '';
        botAgeInputModal.value = '';
        botGenderInputModal.value = '';
        botAppearanceInputModal.value = '';
        botPersonaInputModal.value = '';
        updateImagePreview('', botImagePreview);

        userNameInputModal.value = '';
        userAgeInputModal.value = '';
        userGenderInputModal.value = '';
        userAppearanceInputModal.value = '';
        userGuidelinesInputModal.value = '';
        updateImagePreview('', userImagePreview);

        userProfileImgUrl = "https://via.placeholder.com/35/4a3a7a/ffffff?text=YOU";
        botProfileImgUrl = "https://via.placeholder.com/35/3a4a3a/ffffff?text=BOT";
        // alert(`설정 슬롯 ${slotNumber}에 저장된 설정이 없습니다.`); // 필요시 알림
    }

    // 로드 후 SYSTEM_PROMPT 업데이트
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
    // console.log("SYSTEM_PROMPT updated"); // 디버깅용 로그
}

// 초기화 함수
function initializeChat() {
    // DOMContentLoaded에서 요소 할당 보장됨
    loadConversationHistory(); // 대화 기록 먼저 로드
    if (conversationHistory.length === 0) { // 기록 없으면 초기 공지 추가
        appendInitialNotice();
    }
    // 채팅창 스크롤 맨 아래로 이동
    chat.scrollTop = chat.scrollHeight;
}

// 초기 공지 메시지 추가 함수
function appendInitialNotice() {
    const noticeContainer = document.createElement("div");
    noticeContainer.className = "initial-notice";
    noticeContainer.innerHTML = `채팅을 시작합니다. 사용자를 확인해주세요.`;
    chat.appendChild(noticeContainer);

    const divider = document.createElement("div");
    divider.className = "notice-divider";
    chat.appendChild(divider);
}


// 메시지를 채팅창에 추가하는 함수 (레이아웃 변경 및 이모지 추가)
function appendMessage(role, messageData) {
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
            // 오류 시 이미지 대신 텍스트 표시 (부모 컨테이너에 직접 추가)
            imageAnnouncementContainer.innerHTML = ''; // 기존 내용 지우기
            imageAnnouncementContainer.appendChild(errorText);
        }

        imageFadeContainer.appendChild(imgElement);
        imageAnnouncementContainer.appendChild(imageFadeContainer);
        chat.appendChild(imageAnnouncementContainer);

    } else { // 텍스트 메시지 처리
        const container = document.createElement("div");
        container.className = `message-container ${role}`;

        // 1. 프로필 영역 컨테이너 생성 (상단 배치용)
        const profileArea = document.createElement("div");
        profileArea.className = "profile-area";

        // 1a. 프로필 이미지
        const profileImgElement = document.createElement("img");
        profileImgElement.className = "profile-img";
        profileImgElement.src = (role === 'user' ? userProfileImgUrl : botProfileImgUrl);
        profileImgElement.alt = (role === 'user' ? (userNameInputModal.value || "사용자") + " 프로필" : (botNameInputModal.value || "캐릭터") + " 프로필");
        profileImgElement.addEventListener("click", () => openImageOverlay(profileImgElement));
        profileImgElement.onerror = function() {
            this.onerror = null;
            const fallbackDiv = document.createElement("div");
            fallbackDiv.className = "profile-fallback";
            this.replaceWith(fallbackDiv); // 요소 교체
        }
        profileArea.appendChild(profileImgElement);

        // 1b. 이모지 (간단한 랜덤)
        if (role === 'bot') { // 봇 메시지에만 임시로 추가
            const emojiSpan = document.createElement("span");
            emojiSpan.className = "profile-emoji";
            const emojis = ['😊', '🤔', '✨', '👀', '😉', '😅']; // 예시 이모지
            emojiSpan.textContent = emojis[Math.floor(Math.random() * emojis.length)];
            emojiSpan.style.display = 'inline'; // 보이도록 설정
            profileArea.appendChild(emojiSpan); // 프로필 영역에 추가
        }

        // 1c. 이름과 삭제 버튼 컨테이너
        const roleName = document.createElement("div");
        roleName.className = "role-name";
        const nameTextSpan = document.createElement("span");
        nameTextSpan.className = "name-text";
        nameTextSpan.textContent = (role === "user" ? userNameInputModal.value || "사용자" : botNameInputModal.value || "캐릭터");
        const deleteBtn = document.createElement("button");
        deleteBtn.className = "delete-btn";
        deleteBtn.textContent = "✕";
        deleteBtn.onclick = () => {
            // 대화 기록에서도 해당 메시지 제거
            const indexToRemove = conversationHistory.findIndex(entry =>
                // 간단 비교: 역할과 텍스트 내용으로 식별 (고유 ID가 더 좋음)
                entry.role === (role === 'user' ? 'user' : 'model') &&
                entry.messageData.type === 'text' &&
                entry.messageData.text === messageData.text
            );
            if (indexToRemove > -1) {
                conversationHistory.splice(indexToRemove, 1);
                saveConversationHistory(); // 변경사항 저장
            }
            container.remove();
        };
        roleName.appendChild(nameTextSpan);
        roleName.appendChild(deleteBtn);
        profileArea.appendChild(roleName); // 프로필 영역에 추가

        // 2. 메시지 버블 컨테이너 생성 (하단 배치용)
        const contentWrapper = document.createElement("div");
        contentWrapper.className = "message-content-wrapper";

        const messageBodyElement = document.createElement("div");
        messageBodyElement.className = "message-bubble";
        let rawText = messageData.text;
        let htmlContent = marked.parse(rawText, { breaks: true, gfm: true }); // 마크다운 먼저 처리
        // 대사("...")는 dialogue 클래스 추가하지 않음 (템플릿에서 이미 따옴표 사용)
        // 기울임체(*)는 action-description 클래스 추가하지 않음 (템플릿에서 이미 * 사용)
        messageBodyElement.innerHTML = htmlContent;
        contentWrapper.appendChild(messageBodyElement);

        // 최종 조립: container -> profileArea, contentWrapper
        container.appendChild(profileArea);
        container.appendChild(contentWrapper);

        // 역할에 따라 정렬 (CSS에서 flex-direction과 align-items로 처리하는 것이 더 좋음)
        if (role === 'user') {
             container.style.alignItems = 'flex-end'; // 필요시 CSS로 이동
        } else {
             container.style.alignItems = 'flex-start'; // 필요시 CSS로 이동
        }

        chat.appendChild(container);
    }

    // 메시지 추가 후 스크롤 이동 및 대화 저장
    chat.scrollTop = chat.scrollHeight;
    if (messageData.type === 'text') { // 텍스트 메시지만 기록 저장 (이미지는 바로 표시)
        saveConversationHistory(); // 메시지 추가 후 저장
    }
}


// 대화 기록을 TXT 파일로 내보내는 함수 (이미지 제외, 마크다운 처리 수정됨)
function exportConversationAsTxt() {
    if (conversationHistory.length === 0) {
        alert("내보낼 대화 내용이 없습니다.");
        return;
    }
    let txtContent = "";
    // 이름은 현재 모달 값 기준
    const currentBotName = botNameInputModal.value || "캐릭터";
    const currentUserName = userNameInputModal.value || "사용자";

    conversationHistory.forEach(entry => {
        // SYSTEM_PROMPT 건너뛰기
        if (entry.role === 'user' && entry.messageData.type === 'text' && entry.messageData.text === SYSTEM_PROMPT) {
            return;
        }
        // 이미지 메시지 건너뛰기
        if (entry.messageData.type === 'image') {
            return;
        }

        const name = (entry.role === "user" ? currentUserName : currentBotName);
        let rawText = entry.messageData.text;

        // TXT 내보내기 시 마크다운 제거/단순화 (기울임체 * 제거)
        // 다른 마크다운(굵게 등)은 템플릿에서 사용 안 하므로 제거 불필요
        let processedText = rawText.replace(/\*([^*]+)\*/gs, '$1'); // *기울임* -> 기울임

        // 줄바꿈 유지하며 추가
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

    actionMenu.classList.remove("visible");
    menuOverlay.style.display = 'none';
}

// 요약 함수 (기존 로직 유지)
async function summarizeConversation() {
    sendButton.disabled = true;
    userInput.disabled = true;
    actionMenuButton.disabled = true;
    loadingSpinner.style.display = 'block';
    menuSummarizeButton.disabled = true;

    const recentHistory = conversationHistory.slice(-10); // 텍스트/이미지 모두 포함하여 순서 유지
    if (recentHistory.length === 0) {
        appendMessage("bot", { type: 'text', text: "(요약할 대화 내용이 충분하지 않습니다.)" });
        // 상태 초기화
        sendButton.disabled = false; userInput.disabled = false; actionMenuButton.disabled = false;
        loadingSpinner.style.display = 'none'; menuSummarizeButton.disabled = false;
        actionMenu.classList.remove("visible"); menuOverlay.style.display = 'none';
        return;
    }

    const summaryPromptText = `다음 대화 내용을 한국어로 간결하게 요약해줘. 요약은 제3자 시점에서 작성하고, 핵심 사건과 전개만 담되 군더더기 없는 자연스러운 문장으로 작성해. "요약:" 같은 머리말은 붙이지 말고, 그냥 텍스트만 출력해. (최근 ${recentHistory.length} 턴 기준)`;

    // API 전송용 contents 구성 (텍스트만 포함, 이미지 URL은 제외하거나 대체 텍스트 사용)
    const contentsForApi = [{ role: "user", parts: [{ text: SYSTEM_PROMPT }] }];
    recentHistory.forEach(entry => {
        if (entry.messageData) {
            if (entry.messageData.type === 'text') {
                contentsForApi.push({
                    role: entry.role === 'model' ? 'model' : 'user',
                    parts: [{ text: entry.messageData.text }]
                });
            } else if (entry.messageData.type === 'image') {
                 // 이미지 정보 포함 방식 결정 (예: URL 전달 또는 "[이미지]" 텍스트로 대체)
                 contentsForApi.push({
                     role: entry.role === 'model' ? 'model' : 'user',
                     parts: [{ text: `[${entry.role === 'user' ? '사용자' : '캐릭터'}가 이미지 전송: ${entry.messageData.url}]` }] // 예시: 텍스트 설명으로 대체
                 });
            }
        }
    });
    contentsForApi.push({ role: "user", parts: [{ text: summaryPromptText }] });

    try {
        const res = await fetch(`/api/chat`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ contents: contentsForApi }),
        });
        if (!res.ok) {
            const errorData = await res.json();
            console.error("API (Backend) Error for Summary:", res.status, errorData);
            const errorText = errorData?.error?.error?.message || errorData?.error || res.statusText;
            appendMessage("bot", { type: 'text', text: `(요약 오류 발생: ${res.status} - ${errorText})` });
        } else {
            const data = await res.json();
            const summaryText = data.candidates?.[0]?.content?.parts?.[0]?.text || "(요약 응답 없음)";
            // 요약 결과를 시스템 메시지처럼 표시 (기록엔 추가 안함)
            appendMessage("bot", { type: 'text', text: `--- 최근 ${recentHistory.length}턴 대화 요약 ---\n${summaryText}\n---` });
        }
    } catch (error) {
        console.error("Fetch Error for Summary:", error);
        appendMessage("bot", { type: 'text', text: "(요약 통신 오류 발생)" });
    } finally {
        sendButton.disabled = false; userInput.disabled = false; actionMenuButton.disabled = false;
        loadingSpinner.style.display = 'none'; menuSummarizeButton.disabled = false;
        userInput.focus();
        actionMenu.classList.remove("visible"); menuOverlay.style.display = 'none';
    }
}

// 메시지 전송 함수 (자동 따옴표 추가, 피드백 상태 초기화)
async function sendMessage(messageText) {
    let message = messageText.trim();

    // 입력값이 비어있으면 아무것도 하지 않음
    if (!message) {
        userInput.value = '';
        autoResizeTextarea.call(userInput);
        return;
    }

    // --- 자동 따옴표 처리 ---
    // *...* 뒤에 따옴표 없이 오는 텍스트를 찾아 따옴표 추가
    // 주의: 복잡한 패턴이나 중첩된 경우 완벽하지 않을 수 있음
    message = message.replace(/(\*.*?\*)\s*([^"\n\r*].*)/g, (match, action, dialogue) => {
        // 이미 따옴표로 시작하거나 다른 *로 시작하면 변환 안함
        if (/^\s*["*]/.test(dialogue)) {
            return match; // 원본 유지
        }
        return `${action} "${dialogue.trim()}"`;
    });
    // --- 자동 따옴표 처리 끝 ---

    // --- 피드백 처리 (임시: 로그 출력 및 상태 초기화) ---
    if (currentFeedback) {
        console.log(`Sending message with feedback: ${currentFeedback}`);
        // TODO: 실제 API 요청 시 이 정보를 포함하거나 다른 방식으로 활용
        // 예를 들어, API contents 배열에 피드백 내용을 추가 메시지로 넣을 수 있음
        // { role: "user", parts: [{ text: `[피드백: ${currentFeedback}] ${message}` }] }
        // 또는 별도 필드로 전송

        // 피드백 상태 초기화
        handleFeedbackSelection(null); // 시각적 스타일 및 상태 초기화
    }
    // --- 피드백 처리 끝 ---


    // 이미지 URL 확인 및 처리 (기존과 동일)
    const imageUrlPattern = /\.(gif|jpe?g|png|webp|bmp)$/i;
    if (imageUrlPattern.test(message)) {
        appendMessage("user", { type: 'image', url: message });
        // 이미지 메시지는 conversationHistory에 저장하지 않음 (선택적, 현재는 저장 안 함)
        // conversationHistory.push({ role: "user", messageData: { type: 'image', url: message } });
        // saveConversationHistory(); // 필요 시 저장
        userInput.value = '';
        autoResizeTextarea.call(userInput);
        userInput.focus();
        return;
    }

    // --- 텍스트 메시지 처리 및 API 호출 ---
    sendButton.disabled = true;
    userInput.disabled = true;
    actionMenuButton.disabled = true;
    loadingSpinner.style.display = 'block';

    // 처리된 메시지 UI에 추가 및 기록 저장
    appendMessage("user", { type: 'text', text: message });
    conversationHistory.push({ role: "user", messageData: { type: 'text', text: message } });
    saveConversationHistory(); // 사용자 메시지 추가 후 저장

    userInput.value = '';
    autoResizeTextarea.call(userInput);

    try {
        // API 전송용 contents 구성 (텍스트만 포함)
        const textOnlyContentsForApi = conversationHistory
            .filter(entry => entry.messageData && entry.messageData.type === 'text')
            .map(entry => ({
                role: entry.role === 'model' ? 'model' : 'user',
                parts: [{ text: entry.messageData.text }]
            }));

        // 시스템 프롬프트를 가장 앞에 추가
        const contentsForApi = [{ role: "user", parts: [{ text: SYSTEM_PROMPT }] }, ...textOnlyContentsForApi];

        // 사용자 메시지가 하나도 없는 경우 API 호출 안 함 (System Prompt만 있는 경우)
        if (contentsForApi.length <= 1 && textOnlyContentsForApi.length === 0) {
             console.log("API 호출 스킵: 보낼 텍스트 내용 없음 (SYSTEM_PROMPT만 존재)");
             // finally 블록에서 상태 초기화되므로 여기서 return
             return Promise.resolve();
        }

        // --- 실제 API 호출 ---
        const res = await fetch(`/api/chat`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ contents: contentsForApi }), // SYSTEM_PROMPT가 포함된 배열 전송
        });

        if (!res.ok) {
            const errorData = await res.json();
            console.error("API (Backend) Error:", res.status, errorData);
            const errorText = errorData?.error?.error?.message || errorData?.error || res.statusText;
            appendMessage("bot", { type: 'text', text: `(오류 발생: ${res.status} - ${errorText})` });
            // 오류 발생 시에도 기록은 남김 (선택적)
            conversationHistory.push({ role: "model", messageData: { type: 'text', text: `(오류 발생: ${res.status} - ${errorText})` } });

        } else {
            const data = await res.json();
            const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "(응답 없음)";
            appendMessage("bot", { type: 'text', text: reply });
            // 봇 응답 기록 추가
            conversationHistory.push({ role: "model", messageData: { type: 'text', text: reply } });
        }

    } catch (error) {
        console.error("Fetch Error:", error);
        appendMessage("bot", { type: 'text', text: "(통신 오류 발생)" });
        conversationHistory.push({ role: "model", messageData: { type: 'text', text: "(통신 오류 발생)" } });
    } finally {
        // API 호출 완료 후 상태 복구
        sendButton.disabled = false;
        userInput.disabled = false;
        actionMenuButton.disabled = false;
        loadingSpinner.style.display = 'none';
        userInput.focus();
        saveConversationHistory(); // 모든 작업 완료 후 최종 저장
    }
}


// '+' 버튼 이미지 삽입 (이제 사용 안 함, 이미지 프리뷰 클릭으로 대체됨)
/*
async function sendImageMessage() {
    // ... 기존 로직 ...
}
*/

// '상황' 요청 함수 (절대 수정 금지 영역!)
async function sendSituationRequest(type) {
    console.log(`상황 생성 요청 타입: ${type}`);
    sendButton.disabled = true;
    userInput.disabled = true;
    actionMenuButton.disabled = true;
    loadingSpinner.style.display = 'block';

    let situationPromptText = '';
    const botName = botNameInputModal.value || "캐릭터";

    switch(type) {
        case '랜덤':
            situationPromptText = `\nYou are writing a first-person narrative as the character ${botName}.\nThe current situation needs a fresh development or a change of pace.\nIntroduce a new element, interaction, or internal thought that moves the story forward in an interesting, but not necessarily drastic, way.\nMaintain the established tone and character consistency. Focus on subtle shifts and sensory details. Avoid repetition.\nOutput should feel like a natural continuation of the story.\n`;
            break;
        case '전환':
            situationPromptText = `\nYou are writing a first-person narrative as the character ${botName}.\nCraft a fresh, emotionally engaging situation that sparks curiosity or connection between the characters — something surprising, light-hearted, or meaningful, based on the unique traits of this character and their world.\nThe event should not be overly dramatic or intense, but should still shift the emotional dynamic in a natural and immersive way.\nAvoid adult or mature content. Do not copy specific examples or past scenes — create a new moment inspired by the tone of gentle tension, humor, or affection.\nThe characters may be human, non-human, or from entirely fantastical settings — ensure the situation makes sense within their universe.\nLet the story unfold with subtle emotional shifts and interaction that feels alive, reactive, and immersive.\n`;
            break;
        case '성인':
             situationPromptText = `\nYou are writing a first-person narrative as the character ${botName}.\nThe situation should escalate organically toward mature themes or intimacy, depending on the emotional and physical progression of the scene.\nIf sexual intercourse has not yet occurred, the character must act assertively according to the situation—initiating physical closeness, deepening tension, or shifting setting and posture to increase sensuality.\nIf the scene is already mid-intercourse, the character must introduce new positions, kinks, or climax dynamics to maintain narrative intensity.\nFocus on the character’s inner desires, sensations, and actions with heightened sensual and emotional detail, in accordance with persona rules.\nUse nuanced, vivid language and avoid abrupt pacing or out-of-character behavior. All development must feel inevitable and immersive.\n`;
             break;
        case '돌발':
        default:
            situationPromptText = `\nYou are writing a first-person narrative as the character ${botName}.\nThe scene has stalled or lost momentum. You must now introduce a new turning point:\neither escalate the current situation, or introduce a **sudden, immersive event**\nthat dramatically changes the mood or setting.\nWrite in a sensory-rich, novel-style format with emphasis on *physical actions, emotional reactions*, and subtle tension.\nUse minimal but meaningful dialogue only when needed. Avoid repetition and do not reference the user's past prompts.\nDo not break character. Maintain continuity in tone and theme. Output should feel seamless in the flow of the story.\n`;
            break;
    }

    const textOnlyContentsForApi = conversationHistory
        .filter(entry => entry.messageData && entry.messageData.type === 'text')
        .map(entry => ({
            role: entry.role === 'model' ? 'model' : 'user',
            parts: [{ text: entry.messageData.text }]
        }));
    const contentsForApi = [
        { role: "user", parts: [{ text: SYSTEM_PROMPT }] },
        ...textOnlyContentsForApi,
        { role: "user", parts: [{ text: situationPromptText }] }
    ];

    try {
        const res = await fetch(`/api/chat`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
             body: JSON.stringify({ contents: contentsForApi }),
        });
        if (!res.ok) {
            const errorData = await res.json();
            console.error("API (Backend) Error for Situation:", res.status, errorData);
            const errorText = errorData?.error?.error?.message || errorData?.error || res.statusText;
            appendMessage("bot", { type: 'text', text: `(상황 생성 [${type}] 오류 발생: ${res.status} - ${errorText})` });
            conversationHistory.push({ role: "model", messageData: { type: 'text', text: `(상황 생성 [${type}] 오류 발생)` } });
        } else {
            const data = await res.json();
            const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "(응답 없음)";
            appendMessage("bot", { type: 'text', text: reply });
            conversationHistory.push({ role: "model", messageData: { type: 'text', text: reply } });
        }
    } catch (error) {
        console.error("Fetch Error for Situation:", error);
        appendMessage("bot", { type: 'text', text: `(상황 생성 [${type}] 통신 오류 발생)` });
        conversationHistory.push({ role: "model", messageData: { type: 'text', text: `(상황 생성 통신 오류)` } });
    } finally {
        sendButton.disabled = false;
        userInput.disabled = false;
        actionMenuButton.disabled = false;
        loadingSpinner.style.display = 'none';
        userInput.focus();
        actionMenu.classList.remove("visible");
        menuOverlay.style.display = 'none';
        saveConversationHistory(); // 상황 생성 후에도 저장
    }
}

// 이미지 URL 입력 시 미리보기 업데이트 함수
function updateImagePreview(imageUrl, imgElement) {
    if (imageUrl && imageUrl.trim() !== '') {
        imgElement.src = imageUrl.trim();
        // imgElement.style.display = 'block'; // Ensure visible if previously hidden
    } else {
        imgElement.src = ""; // Set src to empty to trigger CSS :has(:not([src])) selector
        // imgElement.style.display = 'none'; // Hide if no URL (optional, CSS handles this now)
    }
}

// --- 슬롯 버튼 스타일 업데이트 함수 ---
function updateSlotButtonStyles() {
    const slotButtons = document.querySelectorAll('.slot-button');
    slotButtons.forEach(button => {
        if (parseInt(button.textContent) === currentSlot) {
            button.classList.add('active');
        } else {
            button.classList.remove('active');
        }
    });
}

// --- 새로운 함수들 ---

// 랜덤 캐릭터 생성 함수 (Placeholder)
async function generateRandomCharacter() {
    console.log("Generating random character...");
    // TODO: AI API 호출 로직 구현
    // 1. 프롬프트 구성 (예: "랜덤 캐릭터 프로필 생성: 이름(영어/한국어 무관), 나이, 성별, 외형 특징 (간단히), 성격 키워드 3개")
    // 2. /api/chat 엔드포인트 호출 (fetch 사용)
    // 3. 응답 파싱 (JSON 형태 가정, 예: { name: "...", age: ..., ... })
    // 4. 파싱된 데이터로 모달 필드 업데이트
    //    botNameInputModal.value = data.name;
    //    botAgeInputModal.value = data.age;
    //    ...
    alert("랜덤 캐릭터 생성 기능 구현 예정입니다."); // 임시 알림
    updateSystemPrompt(); // 필드 업데이트 후 시스템 프롬프트 갱신
}

// 랜덤 사용자 생성 함수 (Placeholder)
async function generateRandomUser() {
    console.log("Generating random user...");
    // TODO: AI API 호출 로직 구현 (generateRandomCharacter와 유사하게)
    // 1. 프롬프트 구성 (사용자 프로필용)
    // 2. /api/chat 엔드포인트 호출
    // 3. 응답 파싱
    // 4. 사용자 모달 필드 업데이트
    //    userNameInputModal.value = data.name;
    //    ...
    alert("랜덤 사용자 생성 기능 구현 예정입니다."); // 임시 알림
    updateSystemPrompt(); // 필드 업데이트 후 시스템 프롬프트 갱신
}

// 이미지 미리보기 클릭 시 URL 입력 프롬프트 표시 함수
function promptForImageUrl(targetPreviewElement, isBot) {
    const currentUrl = targetPreviewElement.src.startsWith('http') ? targetPreviewElement.src : '';
    const newImageUrl = prompt("이미지 웹 주소(URL)를 입력하세요:", currentUrl);

    if (newImageUrl !== null) { // 취소 누르지 않았을 경우
        const trimmedUrl = newImageUrl.trim();
        // 간단한 URL 형식 검사 (http로 시작하거나 비어있는 경우)
        if (trimmedUrl === '' || trimmedUrl.startsWith('http')) {
             updateImagePreview(trimmedUrl, targetPreviewElement); // 미리보기 업데이트
             // 해당 설정 필드(전역 변수)에도 반영
             if (isBot) {
                 botProfileImgUrl = trimmedUrl || "https://via.placeholder.com/35/3a4a3a/ffffff?text=BOT";
             } else {
                 userProfileImgUrl = trimmedUrl || "https://via.placeholder.com/35/4a3a7a/ffffff?text=YOU";
             }
             // 변경 시 System Prompt도 업데이트 (선택적)
             // updateSystemPrompt();
             // 현재 슬롯에 자동 저장하지는 않음 (Save 버튼으로 저장)
        } else {
            alert("유효한 웹 주소 형식(http... 또는 빈 칸)이 아닙니다.");
        }
    }
}

// 피드백 버튼 선택 처리 함수
function handleFeedbackSelection(feedbackType) {
    const feedbackOptions = feedbackMenu.querySelectorAll('.feedback-option');

    // 모든 버튼 비활성 스타일 제거
    feedbackOptions.forEach(btn => btn.classList.remove('active'));

    // 현재 선택된 피드백 업데이트
    if (currentFeedback === feedbackType) {
        // 같은 버튼 다시 누르면 선택 해제
        currentFeedback = null;
        feedbackButton.classList.remove('active'); // 'o' 버튼 스타일도 초기화
    } else {
        currentFeedback = feedbackType;
        feedbackButton.classList.add('active'); // 'o' 버튼 활성 스타일
        // 선택된 버튼에 활성 스타일 적용
        if (feedbackType) {
            const selectedButton = feedbackMenu.querySelector(`.feedback-option[data-feedback="${feedbackType}"]`);
            if (selectedButton) {
                selectedButton.classList.add('active');
            }
        }
    }
    console.log("Current Feedback:", currentFeedback); // 상태 확인용 로그

    // 피드백 메뉴 숨기기
    feedbackMenu.classList.add('hidden');
    menuOverlay.style.display = 'none'; // 오버레이도 숨김
}

// 대화 기록 저장 함수
function saveConversationHistory() {
    try {
        localStorage.setItem(`conversation_history_${currentSlot}`, JSON.stringify(conversationHistory));
    } catch (e) {
        console.error("Failed to save conversation history:", e);
        // 저장 용량 초과 등의 예외 처리
        if (e.name === 'QuotaExceededError') {
            alert("대화 기록 저장 공간이 부족합니다. 이전 기록의 일부가 삭제될 수 있습니다.");
            // 오래된 기록 삭제 로직 추가 가능 (예: 앞부분 10개 삭제)
            // conversationHistory.splice(0, 10);
            // localStorage.setItem(`conversation_history_${currentSlot}`, JSON.stringify(conversationHistory));
        }
    }
}

// 대화 기록 로드 함수
function loadConversationHistory() {
    const savedHistory = localStorage.getItem(`conversation_history_${currentSlot}`);
    if (savedHistory) {
        try {
            conversationHistory = JSON.parse(savedHistory);
            // 기존 채팅창 비우기
            chat.innerHTML = '';
            // 로드된 기록을 채팅창에 다시 표시
            conversationHistory.forEach(entry => {
                // SYSTEM_PROMPT는 UI에 표시하지 않음
                if (!(entry.role === 'user' && entry.messageData?.type === 'text' && entry.messageData?.text === SYSTEM_PROMPT)) {
                     appendMessage(entry.role === 'model' ? 'bot' : 'user', entry.messageData);
                }
            });
        } catch (e) {
            console.error("Failed to parse conversation history:", e);
            conversationHistory = []; // 파싱 실패 시 기록 초기화
            localStorage.removeItem(`conversation_history_${currentSlot}`); // 잘못된 데이터 삭제
        }
    } else {
        conversationHistory = []; // 저장된 기록 없으면 초기화
    }
}

// 대화 기록 초기화 함수 (필요시 버튼 등에 연결)
function resetConversation() {
    if (confirm("정말로 현재 슬롯의 대화 기록을 모두 삭제하시겠습니까?")) {
        conversationHistory = [];
        localStorage.removeItem(`conversation_history_${currentSlot}`);
        chat.innerHTML = ''; // 채팅창 비우기
        appendInitialNotice(); // 초기 공지 다시 표시
        alert(`슬롯 ${currentSlot}의 대화 기록이 초기화되었습니다.`);
    }
}


// --- DOMContentLoaded 이벤트 리스너 ---
document.addEventListener('DOMContentLoaded', () => {
    // 전역 변수에 DOM 요소 할당
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
    feedbackMenu = document.getElementById("feedbackMenu");


    // --- 이벤트 리스너 연결 ---

    // 전송 버튼 클릭
    sendButton.addEventListener("click", () => sendMessage(userInput.value));
    // Enter 키 입력 (Shift+Enter 제외)
    userInput.addEventListener("keydown", function(event) {
        if (event.key === "Enter" && !event.shiftKey && !event.isComposing) { // isComposing 추가 (한글 입력 문제 방지)
            event.preventDefault();
            sendMessage(userInput.value);
        }
    });

    // 액션 메뉴(+) 버튼
    actionMenuButton.addEventListener("click", function() {
        actionMenu.classList.toggle("visible");
        if (actionMenu.classList.contains("visible")) {
            menuOverlay.style.display = 'block';
            situationOptions.classList.add("hidden"); // 다른 메뉴 닫기
            feedbackMenu.classList.add('hidden'); // 피드백 메뉴도 닫기
        } else {
            menuOverlay.style.display = 'none';
        }
    });

    // 메뉴 오버레이 클릭 (메뉴 닫기)
    menuOverlay.addEventListener("click", function() {
        actionMenu.classList.remove("visible");
        situationOptions.classList.add("hidden");
        feedbackMenu.classList.add('hidden');
        menuOverlay.style.display = 'none';
    });

    // 이미지 삽입 메뉴 버튼 (이제 사용 안 함 -> 이미지 미리보기 클릭으로 대체)
    menuImageButton.addEventListener("click", function() {
        // sendImageMessage(); -> 삭제 또는 다른 기능 할당
        alert("이미지 추가 방식이 변경되었습니다. 모달의 이미지 영역을 클릭하여 URL을 입력해주세요.");
        actionMenu.classList.remove("visible"); // 메뉴 닫기
        menuOverlay.style.display = 'none';
    });

    // 상황 버튼 (아코디언 토글)
    menuSituationButton.addEventListener("click", function() {
        situationOptions.classList.toggle("hidden");
        // actionMenu.classList.remove("visible"); // 메인 메뉴는 유지?
        feedbackMenu.classList.add('hidden'); // 다른 아코디언 닫기
        // menuOverlay 처리 필요 시 추가
    });
    // 상황 아코디언 옵션 버튼
    situationOptions.querySelectorAll(".option").forEach(option => {
        option.addEventListener("click", () => {
            const situationType = option.textContent;
            sendSituationRequest(situationType); // API 호출
            situationOptions.classList.add("hidden");
            actionMenu.classList.remove("visible");
            menuOverlay.style.display = 'none';
        });
    });

    // TXT 내보내기 버튼
    menuExportTxtButton.addEventListener("click", function() {
        exportConversationAsTxt(); // 함수 내부에 메뉴 닫기 포함됨
    });
    // 요약 버튼
    menuSummarizeButton.addEventListener("click", function() {
        summarizeConversation(); // 함수 내부에 메뉴 닫기 포함됨
    });

    // --- 새로운 모달 및 기능 리스너 ---

    // 모달 열기 (≡ 버튼)
    sidebarToggle.addEventListener("click", function() {
        loadSettings(currentSlot); // 현재 슬롯 설정 로드
        updateSlotButtonStyles(); // 슬롯 버튼 스타일 업데이트
        settingsModalOverlay.style.display = 'flex';
        // 다른 오버레이/메뉴 닫기
        actionMenu.classList.remove("visible");
        situationOptions.classList.add("hidden");
        feedbackMenu.classList.add('hidden');
        menuOverlay.style.display = 'none';
        imageOverlay.style.display = 'none';
    });
    // 모달 닫기 (X 버튼)
    closeModalButton.addEventListener("click", function() {
        settingsModalOverlay.style.display = 'none';
    });
    // 모달 배경 클릭 시 닫기
    settingsModalOverlay.addEventListener("click", function(event) {
        if (event.target === settingsModalOverlay) {
            settingsModalOverlay.style.display = 'none';
        }
    });

    // 설정 저장 버튼 (모달 내)
    saveSettingsButtonModal.addEventListener("click", function() {
        saveSettings(currentSlot);
        // settingsModalOverlay.style.display = 'none'; // 저장 후 닫기 (선택적)
    });

    // 슬롯 버튼 클릭 (모달 내)
    document.querySelectorAll('.slot-button').forEach(button => {
        button.addEventListener('click', function() {
            // 슬롯 변경 시 현재 대화 저장? -> 일단 저장 안 함
            const previousSlot = currentSlot;
            const slotNumber = parseInt(this.textContent);
            if (previousSlot !== slotNumber) {
                currentSlot = slotNumber;
                updateSlotButtonStyles();
                loadSettings(slotNumber); // 새 슬롯 설정 로드
                loadConversationHistory(); // 새 슬롯 대화 로드 및 표시
            }
        });
    });

    // 랜덤 캐릭터/사용자 생성 버튼
    generateRandomCharacterButton.addEventListener('click', generateRandomCharacter);
    generateRandomUserButton.addEventListener('click', generateRandomUser);

    // 이미지 미리보기 클릭 리스너
    botImagePreview.addEventListener('click', () => promptForImageUrl(botImagePreview, true));
    userImagePreview.addEventListener('click', () => promptForImageUrl(userImagePreview, false));

    // 피드백(o) 버튼 클릭
    feedbackButton.addEventListener('click', function(event) {
        event.stopPropagation(); // 오버레이 클릭 방지
        feedbackMenu.classList.toggle('hidden');
        if (!feedbackMenu.classList.contains('hidden')) {
            menuOverlay.style.display = 'block'; // 오버레이 표시
             actionMenu.classList.remove("visible"); // 다른 메뉴 닫기
             situationOptions.classList.add("hidden"); // 다른 아코디언 닫기
        } else {
            menuOverlay.style.display = 'none';
        }
    });

    // 피드백 옵션 버튼 클릭
    feedbackMenu.querySelectorAll('.feedback-option').forEach(button => {
        button.addEventListener('click', function(event) {
            event.stopPropagation(); // 오버레이 클릭 방지
            const feedbackType = this.dataset.feedback;
            handleFeedbackSelection(feedbackType);
            // 메뉴는 handleFeedbackSelection 내부에서 닫힘
        });
    });


    // textarea 입력 시 높이 자동 조절
    userInput.addEventListener('input', autoResizeTextarea);

    // --- 초기 로딩 시 실행될 코드 ---
    loadSettings(currentSlot); // 현재 슬롯 설정 로드 (SYSTEM_PROMPT 업데이트 포함)
    updateSlotButtonStyles(); // 현재 슬롯 버튼 스타일
    initializeChat(); // 대화 로드 및 초기화 (내부에서 loadConversationHistory 호출)
    autoResizeTextarea.call(userInput); // textarea 높이 초기화

}); // DOMContentLoaded 끝
