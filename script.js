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
// --- 함수 정의 --- (이벤트 리스너보다 먼저 정의)

// 이미지 오버레이 열기/닫기 함수
function openImageOverlay(element) { // 이미지 또는 프로필 이미지를 받도록 수정
    const overlay = document.getElementById("imageOverlay");
    const overlayImage = document.getElementById("overlayImage");
    overlayImage.src = element.src; // 클릭된 요소의 src 사용
    overlay.style.display = "flex";
}

function closeImageOverlay() {
    const overlay = document.getElementById("imageOverlay");
    const overlayImage = document.getElementById("overlayImage");
    overlay.style.display = "none";
    overlayImage.src = ""; // 이미지 소스 초기화
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

    // 이미지 URL 변수가 업데이트되면 기존 메시지의 프로필 이미지 src를 업데이트 시도 (선택 사항, 복잡할 수 있음)
    // 여기서는 새 메시지부터 적용되도록 합니다.
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
        채팅을 시작합니다.
        사용자 설정을 확인해주세요.
    `;
    chat.appendChild(noticeContainer);

    const divider = document.createElement("div");
    divider.className = "notice-divider";
    chat.appendChild(divider);
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
        // --- 텍스트 메시지 처리 ---
        const container = document.createElement("div");
        container.className = `message-container ${role}`; // 전체 메시지 블록 컨테이너

        const profileImgElement = document.createElement("img");
        profileImgElement.className = "profile-img";
        profileImgElement.src = (role === 'user' ? userProfileImgUrl : botProfileImgUrl);
        profileImgElement.alt = (role === 'user' ? (userNameInput.value || "사용자") + " 프로필" : (botNameInput.value || "캐릭터") + " 프로필");
        profileImgElement.addEventListener("click", () => openImageOverlay(profileImgElement));
        profileImgElement.onerror = function() {
            this.onerror = null;
            const fallbackDiv = document.createElement("div");
            fallbackDiv.className = "profile-fallback";
            const parent = this.parentElement;
            if (parent) { parent.replaceChild(fallbackDiv, this); }
        }

        const contentWrapper = document.createElement("div");
        contentWrapper.className = "message-content-wrapper"; // 이름/삭제 버튼과 텍스트 버블을 담을 컨테이너

        // 이름과 삭제 버튼 생성
        const roleName = document.createElement("div");
        roleName.className = "role-name";

        const nameTextSpan = document.createElement("span");
        nameTextSpan.className = "name-text";
        nameTextSpan.textContent = (role === "user" ? userNameInput.value || "사용자" : botNameInput.value || "캐릭터");

        const deleteBtn = document.createElement("button");
        deleteBtn.className = "delete-btn";
        deleteBtn.textContent = "✕";
        deleteBtn.onclick = () => container.remove();

        roleName.appendChild(nameTextSpan); // 기본 순서로 추가 (CSS에서 order로 조정)
        roleName.appendChild(deleteBtn);

        contentWrapper.appendChild(roleName); // 이름과 삭제 버튼 컨테이너 추가

        // 메시지 본문 요소 (텍스트 버블)
        const messageBodyElement = document.createElement("div");
        messageBodyElement.className = "message-bubble"; // 텍스트 메시지는 버블 클래스 사용
        let rawText = messageData.text;
        // 마크다운 처리 및 HTML 변환
        let processedText = rawText.replace(/\n+/g, match => '<br>'.repeat(match.length));
        processedText = processedText.replace(/"(.*?)"/gs, '[[DIALOGUE]]$1[[/DIALOGUE]]');
        processedText = processedText.replace(/\*([^*]+)\*/gs, '[[ACTION]]$1[[/ACTION]]');
        let htmlContent = marked.parse(processedText);
        htmlContent = htmlContent.replace(/\[\[DIALOGUE\]\](.*?)\[\[\/DIALOGUE\]\]/gs, '<span class="dialogue">$1</span>');
        htmlContent = htmlContent.replace(/\[\[ACTION\]\](.*?)\[\[\/ACTION\]\]/gs, '<span class="action-description">$1</span>');
        messageBodyElement.innerHTML = htmlContent;

        // 텍스트 메시지일 때는 contentWrapper에 메시지 버블 추가
        contentWrapper.appendChild(messageBodyElement);

        // message-container에 요소들을 역할에 따라 추가
        if (role === "user") {
            // 유저: contentWrapper | 프로필 이미지 (CSS flex-direction: row-reverse 및 order로 배치)
            container.appendChild(contentWrapper);
            container.appendChild(profileImgElement);
        } else { // role === "bot"
            // 캐릭터: 프로필 이미지 | contentWrapper (CSS flex-direction: row 및 order로 배치)
            container.appendChild(profileImgElement);
            container.appendChild(contentWrapper);
        }

        chat.appendChild(container);
    }

    // 메시지 추가 후 스크롤 이동
    chat.scrollTop = chat.scrollHeight;
}

// 메시지 전송 (텍스트 또는 이미지 URL) 함수
async function sendMessage(messageOrImageUrl) {
    // sendButton 클릭 또는 sendImageMessage 호출 시 사용됨
    const message = typeof messageOrImageUrl === 'string' ?
        messageOrImageUrl.trim() : userInput.value.trim(); // 인자로 URL이 오면 사용, 아니면 입력창 값 사용

    // 입력값이 비어있으면 아무것도 하지 않음
    if (!message) {
        // 이미지가 아닌 경우에만 입력창 값 사용 (이미지 프롬프트는 이미 trim 됨)
        if (typeof messageOrImageUrl !== 'string') {
            userInput.value = ''; // 입력창 비우기
            autoResizeTextarea.call(userInput); // textarea 높이 초기화
        }
        return;
    }

    // 이미지 URL인지 확인 (간단한 패턴 매칭)
    const imageUrlPattern = /\.(gif|jpe?g|png|webp|bmp)$/i;
    const isImageUrl = imageUrlPattern.test(message);

    // 이미지 메시지 처리
    if (isImageUrl) {
        // 이미지 URL이면 이미지 메시지로 처리
        appendMessage("user", { type: 'image', url: message });
        conversationHistory.push({ role: "user", messageData: { type: 'image', url: message } });
        // 이미지 URL 입력 후에는 API 호출 없이 즉시 표시 및 상태 초기화
        sendButton.disabled = false;
        userInput.disabled = false;
        actionMenuButton.disabled = false;
        loadingSpinner.style.display = 'none'; // 로딩 스피너 숨김
        userInput.value = ''; // 입력창 비우기
        autoResizeTextarea.call(userInput); // textarea 높이 초기화
        userInput.focus();
        return; // 이미지 메시지 처리 완료 후 함수 종료
    }

    // --- 텍스트 메시지 처리 및 API 호출 ---

    // 텍스트 메시지일 경우에만 버튼 비활성화 및 스피너 표시
    sendButton.disabled = true;
    userInput.disabled = true;
    actionMenuButton.disabled = true;
    loadingSpinner.style.display = 'block';

    // 텍스트 메시지 UI에 추가
    appendMessage("user", { type: 'text', text: message });
    // 입력창 자동 지우기 및 높이 초기화
    userInput.value = '';
    autoResizeTextarea.call(userInput);

    // 텍스트 메시지를 대화 기록에 추가
    conversationHistory.push({ role: "user", messageData: { type: 'text', text: message } });
    try {
        // API 전송 시에는 텍스트 메시지만 포함 (이미지 메시지는 API가 처리하지 않음)
        const textOnlyContentsForApi = conversationHistory
            .filter(entry => entry.messageData && entry.messageData.type === 'text')
            .map(entry => ({
                role: entry.role,
                parts: [{ text: entry.messageData.text }]
            }));
        const contentsForApi = [{ role: "user", parts: [{ text: SYSTEM_PROMPT }] }, ...textOnlyContentsForApi];
        if (contentsForApi.length === 1 && contentsForApi[0].parts[0].text === SYSTEM_PROMPT) {
            // SYSTEM_PROMPT 외 사용자 텍스트가 없을 경우 API 호출 안 함
            // console.log("Only SYSTEM_PROMPT to send to API."); // 디버그 로그 제거
            appendMessage("bot", { type: 'text', text: "(API 호출 스킵: 보낼 텍스트 내용 없음)" });
            return Promise.resolve(); // 함수 종료
        } else if (contentsForApi.length === 0) {
            // 예외적인 경우 (발생하지 않아야 함)
            // console.log("No content to send to API."); // 디버그 로그 제거
            appendMessage("bot", { type: 'text', text: "(메시지 전송 실패: 보낼 텍스트 내용 없음)" });
            return Promise.resolve(); // 함수 종료
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
        } else { // 응답이 성공적이라면
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
        // API 호출이 완료되면 (성공 또는 실패) 버튼 활성화 및 스피너 숨김
        sendButton.disabled = false;
        userInput.disabled = false;
        actionMenuButton.disabled = false;
        loadingSpinner.style.display = 'none';
        userInput.focus();
    }
}

// '+' 버튼 메뉴의 이미지 삽입 버튼 클릭 시 호출되는 함수
async function sendImageMessage() {
    const imageUrl = prompt("보낼 이미지의 웹 주소(URL)를 입력하세요:");
    if (imageUrl !== null && imageUrl.trim() !== '') {
        // 입력된 URL의 유효성을 간단히 검사
        const imageUrlPattern = /\.(gif|jpe?g|png|webp|bmp)$/i;
        if (imageUrlPattern.test(imageUrl.trim())) {
            // 유효한 URL 형식일 경우 sendMessage 함수에 이미지 URL을 인자로 전달
            // sendMessage 함수 내부에서 이미지 메시지인지 판단하여 처리
            sendMessage(imageUrl.trim());
        } else {
            alert("유효한 이미지 주소(jpg, png, gif 등)를 입력해주세요.");
        }
    } else if (imageUrl !== null) {
        // 사용자가 프롬프트에서 취소하거나 빈 문자열 입력 시
        //console.log("이미지 주소 입력 취소 또는 빈 문자열 입력"); // 디버그 로그 제거
    }
}

// '+' 버튼 메뉴의 상황 버튼 클릭 시 호출되는 함수
async function sendSituationRequest() {
    alert("상황 생성 기능 구현 시작!"); // 기능 구현 알림 유지

    // 상황 생성 요청 시에만 버튼 비활성화 및 스피너 표시
    sendButton.disabled = true;
    userInput.disabled = true;
    actionMenuButton.disabled = true;
    loadingSpinner.style.display = 'block';

    // 상황 생성 요청 프롬프트
    const situationPromptText = `Based on the ongoing conversation and current character settings, generate a vivid and engaging new situation or event written from the character's point of view in novel-style narration. The scene should naturally invite the user to respond and smoothly continue the dialogue flow. **Important: After presenting the situation, the character must immediately speak to the user in-character. Do not include explanations or any OOC (out-of-character) comments. All descriptions must be written using *asterisks*, and all dialogue must be enclosed in double quotes (\"). Maintain a balance of approximately 70% description and 30% dialogue. Use paragraphing and line breaks only for clarity—not for pacing or emotional emphasis.**`;

    // API 전송 시에는 텍스트 메시지만 포함 (이미지 메시지는 API가 처리하지 않음)
    const textOnlyContentsForApi = conversationHistory
        .filter(entry => entry.messageData && entry.messageData.type === 'text')
        .map(entry => ({
            role: entry.role,
            parts: [{ text: entry.messageData.text }]
        }));
    // 상황 프롬프트를 API 호출 콘텐츠에 추가
    const contentsForApi = [{ role: "user", parts: [{ text: SYSTEM_PROMPT }] }, ...textOnlyContentsForApi, { role: "user", parts: [{ text: situationPromptText }] }];

    if (contentsForApi.length <= 1 && contentsForApi[0].parts[0].text === SYSTEM_PROMPT) {
        // SYSTEM_PROMPT 외 사용자 텍스트가 없을 경우 API 호출 안 함
        // console.log("Only SYSTEM_PROMPT or SYSTEM_PROMPT + Situation Prompt to send to API."); // 디버그 로그 제거
        appendMessage("bot", { type: 'text', text: "(상황 생성 요청 스킵: 보낼 텍스트 내용 없음)" }); // 메시지 수정
        // API 호출 없으므로 상태 초기화
        sendButton.disabled = false;
        userInput.disabled = false;
        actionMenuButton.disabled = false;
        loadingSpinner.style.display = 'none';
        userInput.focus();
        return Promise.resolve(); // 함수 종료
    } else if (contentsForApi.length === 0) {
        // 예외적인 경우 (발생하지 않아야 함)
        // console.log("No content to send to API."); // 디버그 로그 제거
        appendMessage("bot", { type: 'text', text: "(상황 생성 요청 실패: 보낼 텍스트 내용 없음)" }); // 메시지 수정
        // API 호출 없으므로 상태 초기화
        sendButton.disabled = false;
        userInput.disabled = false;
        actionMenuButton.disabled = false;
        loadingSpinner.style.display = 'none';
        userInput.focus();
        return Promise.resolve(); // 함수 종료
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
                text: `(상황 생성 오류 발생: ${res.status} - ${errorText})` // 오류 메시지 수정
            });
        } else { // 응답이 성공적이라면
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
        appendMessage("bot", { type: 'text', text: "(상황 생성 통신 오류 발생)" }); // 오류 메시지 수정
    } finally {
        // API 호출이 완료되면 (성공 또는 실패) 버튼 활성화 및 스피너 숨김
        sendButton.disabled = false;
        userInput.disabled = false;
        actionMenuButton.disabled = false;
        loadingSpinner.style.display = 'none';
        userInput.focus();
    }
}

// 초기화 함수 및 DOMContentLoaded 리스너는 함수 정의 뒤에 배치

// --- 초기화 함수 ---
function initializeChat() {
    // 필요한 초기화 로직 (예: 환영 메시지 표시 등)
    // loadSettings(currentSlot); // DOMContentLoaded에서 이미 호출됨
    // updateSystemPrompt(); // loadSettings에서 호출됨

    // 초기 공지 메시지 및 구분선 추가
    appendInitialNotice();
}

// 초기 공지 메시지 추가 함수
function appendInitialNotice() {
    const noticeContainer = document.createElement("div");
    noticeContainer.className = "initial-notice";
    noticeContainer.innerHTML = `
        <strong>📢 중요 공지:</strong> 이 챗봇은 수위 높은 성적 묘사를 포함한 BL 에로 소설 작성을 목표로 합니다.
        미성년자는 이용할 수 없습니다.
    `;
    chat.appendChild(noticeContainer);

    const divider = document.createElement("div");
    divider.className = "notice-divider";
    chat.appendChild(divider);
}

// --- 이벤트 리스너 ---

// 전송 버튼 클릭 이벤트
sendButton.addEventListener("click", () => sendMessage(userInput.value)); // 입력창 값 전달

// keydown 이벤트 리스너 수정: Shift+Enter는 줄바꿈, Enter만 누르면 전송
userInput.addEventListener("keydown", function(event) {
    if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault(); // 기본 Enter 동작 (줄바꿈) 막기
        sendMessage(userInput.value); // 입력창 값 전달
    }
    // Shift + Enter는 기본 동작 (줄바꿈)이 실행되도록 별도 처리 없음
});
// 액션 메뉴 버튼 클릭 이벤트
actionMenuButton.addEventListener("click", function() {
    actionMenu.classList.toggle("visible");
    if (actionMenu.classList.contains("visible")) {
        menuOverlay.style.display = 'block';
    } else {
        menuOverlay.style.display = 'none';
    }
});
// 메뉴 오버레이 클릭 시 메뉴 닫기
menuOverlay.addEventListener("click", function() {
    actionMenu.classList.remove("visible");
    menuOverlay.style.display = 'none';
});
// 이미지 삽입 메뉴 버튼 클릭
menuImageButton.addEventListener("click", function() {
    sendImageMessage(); // sendImageMessage 함수 호출
    actionMenu.classList.remove("visible");
    menuOverlay.style.display = 'none';
});
// 상황 메뉴 버튼 클릭
menuSituationButton.addEventListener("click", function() {
    sendSituationRequest(); // sendSituationRequest 함수 호출
    actionMenu.classList.remove("visible");
    menuOverlay.style.display = 'none';
});
// 이미지 오버레이 클릭 시 닫기 이벤트 리스너는 HTML에 onclick="closeImageOverlay()"로 이미 존재하므로 JS에서는 추가할 필요 없습니다.
// 사이드바 토글 버튼 클릭
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
// 사이드바 오버레이 클릭 시 사이드바 닫기
sidebarOverlay.addEventListener("click", function() {
    sidebar.classList.remove("visible");
    sidebarOverlay.style.display = 'none';
});
// 설정 저장 버튼 클릭 이벤트
saveSettingsButton.addEventListener("click", function() {
    saveSettings(currentSlot); // saveSettings 함수 호출
});
// 슬롯 버튼 클릭 이벤트 리스너
slotButtons.forEach(button => {
    button.addEventListener('click', function() {
        const slotNumber = parseInt(this.textContent);
        // 수정된 로직: 슬롯 버튼 클릭 시 currentSlot 및 스타일 업데이트는 항상 실행
        currentSlot = slotNumber; // 현재 슬롯 업데이트

        updateSlotButtonStyles(); // 슬롯 버튼 스타일 업데이트

        loadSettings(slotNumber); // 해당 슬롯 설정 로드 시도 (loadSettings 내에서는 로드 성공 여부에 따라 입력 필드 업데이트만 수행)
    });
});
// textarea 입력 시 높이 자동 조절
userInput.addEventListener('input', autoResizeTextarea);
// 페이지 로드 완료 시 실행 (마지막에 배치)
document.addEventListener('DOMContentLoaded', () => {
    autoResizeTextarea.call(userInput); // textarea 높이 초기화
    loadSettings(currentSlot); // 현재 슬롯 설정 로드
    updateSlotButtonStyles(); // 슬롯 버튼 스타일 업데이트
    initializeChat(); // 초기화 로직 실행 (공지 추가 포함)

    // 이미지 URL 입력 필드에서 값 불러와서 변수 업데이트 (초기 로드 시)
    userProfileImgUrl = userImageUrlInput.value || "https://via.placeholder.com/35/4a3a7a/ffffff?text=YOU";
    botProfileImgUrl = botImageUrlInput.value || "https://via.placeholder.com/35/3a4a3a/ffffff?text=BOT";
});
