// 이미지 URL 변수는 입력 필드 값으로 관리
let userProfileImgUrl = "https://via.placeholder.com/35/4a3a7a/ffffff?text=YOU"; // 기본값 유지
let botProfileImgUrl = "https://via.placeholder.com/35/3a4a3a/ffffff?text=BOT"; // 기본값 유지

let conversationHistory = [];
let SYSTEM_PROMPT = '';
let currentSlot = 1; // 현재 활성화된 슬롯 번호 (기본값 1)

// SYSTEM_PROMPT를 동적으로 구성하기 위한 기본 템플릿 (AI 역할 변경 및 포맷 지침 강화)
// 이안 관련 내용을 제거하여 범용적인 템플릿으로 수정
const SYSTEM_PROMPT_TEMPLATE = `
## 기본 역할
당신은 {botName}이라는 공(攻) 캐릭터입니다.  
사용자는 수(受) 캐릭터({userName})로, 오직 당신만 이야기합니다.  
항상 3인칭 시점으로 {botName}의 행동, 감정, 감각만 서술하십시오.  
**절대 사용자({userName})의 말, 감정, 행동을 묘사하지 마십시오.**

## 출력 형식
- **300자 이상의 묘사 문단 × 최소 3개**
- 각 묘사 사이에는 **30자 이내의 감정이 담긴 짧은 대사**  
- 총 응답은 **1000자 이상**이어야 하며, 묘사와 대사가 반드시 교차 구조로 구성됩니다.

## 스타일 규칙
- **감각 기반 묘사:** 시각, 청각, 촉각, 미각, 후각을 풍부하게 서술
- **해부학적 용어 사용:** “질 입구”, “항문”, “음핵” 등  
  → “여기”, “은밀한 곳” 같은 모호한 단어 금지
- **강한 동사 사용:** “쑤셔 넣다”, “찍어 누르다”, “질퍽이다” 등  
- **절제된 성적 묘사:** 무조건 에로틱하지 않으며, 긴장/심리 흐름을 동반해야 함

## 문장/표기법
- 대사는 반드시 큰따옴표("...") 사용  
- **\`*행동*\`**으로 감정/행동 강조 (마크다운 이탤릭)  
- 슬래시(/), 괄호(), 별표(** **) 등 **다른 서식은 금지**  
- 외국어, 러시아어 등 **비한글 문장 포함 절대 금지**

## 기타
사용자가 아무 말도 하지 않아도 {botName}은 행동을 계속 이어갑니다.  
반드시 자연스러운 이야기 흐름을 유지하며, 대사만 연속으로 출력하지 마십시오.

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
// 액션 메뉴 버튼 요소들 가져오기
const menuImageButton = document.getElementById("menuImageButton");
const menuSituationButton = document.getElementById("menuSituationButton");
const menuExportTxtButton = document.getElementById("menuExportTxtButton"); // TXT 내보내기 버튼 요소
const menuSummarizeButton = document.getElementById("menuSummarizeButton"); // 요약 버튼 요소


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
            if (parent) {
                parent.replaceChild(fallbackDiv, this);
            }
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
        // 순서 바꿈: 먼저 마크다운 처리
        let htmlContent = marked.parse(rawText, { breaks: true, gfm: true }); // 원본 텍스트 먼저 마크다운 파싱

        // 마크다운 처리된 HTML에서 대사/행동 치환
        htmlContent = htmlContent.replace(/"(.*?)"/gs, '<span class="dialogue">"$1"</span>');
        // htmlContent = htmlContent.replace(/<em>(.*?)<\/em>/gs, '<span class="action-description">$1</span>');
        messageBodyElement.innerHTML = htmlContent;

        // 텍스트 메시지일 때는 contentWrapper에 메시지 버블 추가
        contentWrapper.appendChild(messageBodyElement);

        // message-container에 요소들을 역할에 따라 추가
        if (role === "user") {
            // 유저: contentWrapper | 프로필 이미지 (CSS flex-direction: row 및 order로 배치)
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

// 대화 기록을 TXT 파일로 내보내는 함수 (수정됨)
function exportConversationAsTxt() {
    if (conversationHistory.length === 0) {
        alert("내보낼 대화 내용이 없습니다.");
        return;
    }

    let txtContent = "";

    // SYSTEM_PROMPT는 내보내지 않습니다.
    // conversationHistory 배열을 순회하며 텍스트 형식으로 변환
    conversationHistory.forEach(entry => {
        const role = entry.role; // "user" 또는 "model"
        const messageData = entry.messageData; // { type: 'text', text: '...' } 또는 { type: 'image', url: '...' }

        // SYSTEM_PROMPT 엔트리는 스킵
        if (entry.role === 'user' && messageData.type === 'text' && messageData.text === SYSTEM_PROMPT) {
             return; // continue 대신 return을 사용하여 forEach의 현재 반복을 건너뜁니다.
        }

        // --- 사용자 요청: 이미지 메시지인 경우 여기서 제외 ---
        if (messageData.type === 'image') {
            return; // forEach의 현재 반복을 건너뛰어 이미지 메시지 제외
        }
        // --- 이미지 메시지 제외 로직 끝 ---


        const name = (role === "user" ? userNameInput.value || "사용자" : botNameInput.value || "캐릭터");

        if (messageData.type === 'text') {
            let rawText = messageData.text; // 원본 텍스트 가져오기

            // --- 사용자 요청에 따른 정확한 마크다운 처리 ---
            let processedText = rawText; // 원본 텍스트로 시작

            // 1. *행동* -> 행동 (별표 제거) - 줄바꿈 처리 방식 개선
            processedText = processedText.replace(/\*([^*]+)\*/g, '$1');
            // 2. **볼드** -> "볼드" (별표 제거하고 큰따옴표로 감쌈) - 줄바꿈 처리 방식 개선
            processedText = processedText.replace(/\*\*([^*]+)\*\*/g, '"$1"');
            // 3. "대사" 는 이미 따옴표가 있으므로 그대로 둡니다. (추가 변환 없음) - 다른 마크다운 처리와 순서 중요

             // 기존 줄바꿈 유지
             processedText = processedText.replace(/\n/g, '\n');

            txtContent += `[${name}] : ${processedText.trim()}\n\n`; // 턴 사이에 엔터 두 번, 메시지 끝 공백 제거

        }
        // 다른 메시지 타입은 모두 제외 (현재는 이미지 제외)
    });

    // 마지막에 추가된 빈 줄 제거
    txtContent = txtContent.trimEnd();

    // Blob 객체 생성
    const blob = new Blob([txtContent], { type: 'text/plain;charset=utf-8' });

    // 다운로드 링크 생성 및 클릭
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'chat_history.txt'; // 다운로드될 파일 이름
    link.style.display = 'none'; // 화면에 보이지 않도록 숨김

    document.body.appendChild(link); // 링크를 문서에 추가
    link.click(); // 링크 클릭하여 다운로드 실행

    // 사용 후 링크 제거 및 URL 해제
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);

    // 메뉴 닫기
    actionMenu.classList.remove("visible");
    menuOverlay.style.display = 'none';
}

// 요약 함수 (나중에 구현)
async function summarizeConversation() { // async 함수로 변경
    // 요약 요청 시 버튼 비활성화 및 스피너 표시
    sendButton.disabled = true;
    userInput.disabled = true;
    actionMenuButton.disabled = true;
    loadingSpinner.style.display = 'block';
    // 요약 버튼 자체도 비활성화
    menuSummarizeButton.disabled = true;


    // 대화 기록에서 최근 10턴 가져오기
    // conversationHistory는 가장 오래된 메시지가 앞에 있습니다.
    // 따라서 마지막 10개를 가져오려면 slice 사용
    const recentHistory = conversationHistory.slice(-10);

    if (recentHistory.length === 0) {
        appendMessage("bot", { type: 'text', text: "(요약할 대화 내용이 충분하지 않습니다.)" });
         // 상태 초기화
        sendButton.disabled = false;
        userInput.disabled = false;
        actionMenuButton.disabled = false;
        loadingSpinner.style.display = 'none';
        menuSummarizeButton.disabled = false;
        actionMenu.classList.remove("visible");
        menuOverlay.style.display = 'none';
        return;
    }

    // 요약을 위한 프롬프트 구성
    // 모델에게 이전 대화 내용을 전달하고 요약을 요청하는 내용
    // 요약 프롬프트는 대화의 맥락을 제공하는 SYSTEM_PROMPT와 분리하여 마지막에 추가
    const summaryPromptText = `다음 대화 내용을 한국어로 간결하게 요약해줘. 요약은 제3자 시점에서 작성하고, 핵심 사건과 전개만 담되 군더더기 없는 자연스러운 문장으로 작성해. "요약:" 같은 머리말은 붙이지 말고, 그냥 텍스트만 출력해.`;

    // API 전송을 위한 contents 배열 구성
    // SYSTEM_PROMPT + 최근 10턴의 텍스트 메시지 + 요약 요청 프롬프트
    const contentsForApi = [{ role: "user", parts: [{ text: SYSTEM_PROMPT }] }];

     // 최근 대화 기록 중 텍스트 메시지만 API에 전달
    recentHistory.forEach(entry => {
        if (entry.messageData && entry.messageData.type === 'text') {
            // API로 보낼 때는 원래 마크다운과 구조를 유지하는 것이 모델 이해에 더 좋을 수 있습니다.
            // 여기서는 단순 텍스트만 추출해서 보냅니다.
            // 더 나은 요약을 원한다면 마크다운을 유지하거나 구조화된 형태로 보내는 것을 고려
            contentsForApi.push({
                role: entry.role,
                parts: [{ text: entry.messageData.text }]
            });
        }
        // 이미지 메시지는 요약을 위해 API에 보내지 않습니다.
    });

    contentsForApi.push({ role: "user", parts: [{ text: summaryPromptText }] });


    // API 호출
    try {
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
            console.error("API (Backend) Error for Summary:", res.status, errorData);
            const errorText =
                errorData?.error?.error?.message ||
                errorData?.error ||
                res.statusText;
            appendMessage("bot", {
                type: 'text',
                text: `(요약 오류 발생: ${res.status} - ${errorText})`
            });
        } else { // 응답 성공
            const data = await res.json();
            const summaryText = data.candidates?.[0]?.content?.parts?.[0]?.text || "(요약 응답 없음)";
            // 요약 결과를 시스템 메시지처럼 표시
            appendMessage("bot", { type: 'text', text: `--- 대화 요약 ---\n${summaryText}\n---` });
            // 요약 결과는 대화 기록에 추가하지 않습니다 (무한 요약 방지 및 기록 복잡성 감소)
        }

    } catch (error) {
        console.error("Fetch Error for Summary:", error);
        appendMessage("bot", { type: 'text', text: "(요약 통신 오류 발생)" });
    } finally {
        // API 호출 완료 시 상태 초기화
        sendButton.disabled = false;
        userInput.disabled = false;
        actionMenuButton.disabled = false;
        loadingSpinner.style.display = 'none';
        menuSummarizeButton.disabled = false; // 요약 버튼 다시 활성화
        userInput.focus();
         // 메뉴 닫기
        actionMenu.classList.remove("visible");
        menuOverlay.style.display = 'none';
    }
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
        const contentsForApi = [...textOnlyContentsForApi, { role: "user", parts: [{ text: SYSTEM_PROMPT }] }];
        if (contentsForApi.length === 1 && contentsForApi[0].parts[0].text === SYSTEM_PROMPT) {
            // SYSTEM_PROMPT 외 사용자 텍스트가 없을 경우 API 호출 안 함
            appendMessage("bot", { type: 'text', text: "(API 호출 스킵: 보낼 텍스트 내용 없음)" });
            return Promise.resolve(); // 함수 종료
        } else if (contentsForApi.length === 0) {
            // 예외적인 경우 (발생하지 않아야 함)
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
    // 메뉴 닫기 (기능 실행 후)
    actionMenu.classList.remove("visible");
    menuOverlay.style.display = 'none';
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
    const situationPromptText =`
You are writing a first-person narrative as the character {botName}. 
The scene has stalled or lost momentum. You must now introduce a new turning point: 
either escalate the current situation, or introduce a **sudden, immersive event** 
that dramatically changes the mood or setting.

Write in a sensory-rich, novel-style format with emphasis on *physical actions, emotional reactions*, and subtle tension.
Use minimal but meaningful dialogue only when needed. Avoid repetition and do not reference the user's past prompts.

Do not break character. Maintain continuity in tone and theme. Output should feel seamless in the flow of the story.
`;

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
        appendMessage("bot", { type: 'text', text: "(상황 생성 요청 스킵: 보낼 텍스트 내용 없음)" }); // 메시지 수정
        // API 호출 없으므로 상태 초기화
        sendButton.disabled = false;
        userInput.disabled = false;
        actionMenuButton.disabled = false;
        loadingSpinner.style.display = 'none';
        userInput.focus();
        // 메뉴 닫기 (기능 실행 후)
        actionMenu.classList.remove("visible");
        menuOverlay.style.display = 'none';
        return Promise.resolve(); // 함수 종료
    } else if (contentsForApi.length === 0) {
        // 예외적인 경우 (발생하지 않아야 함)
        appendMessage("bot", { type: 'text', text: "(상황 생성 요청 실패: 보낼 텍스트 내용 없음)" }); // 메시지 수정
        // API 호출 없으므로 상태 초기화
        sendButton.disabled = false;
        userInput.disabled = false;
        actionMenuButton.disabled = false;
        loadingSpinner.style.display = 'none';
        userInput.focus();
        // 메뉴 닫기 (기능 실행 후)
        actionMenu.classList.remove("visible");
        menuOverlay.style.display = 'none';
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
        // 메뉴 닫기 (기능 실행 후)
        actionMenu.classList.remove("visible");
        menuOverlay.style.display = 'none';
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
        채팅을 시작합니다. 사용자를 확인해주세요.
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
// 이미지 삽입 메뉴 버튼 클릭 (기능 실행 후 메뉴 닫도록 수정됨)
menuImageButton.addEventListener("click", function() {
    sendImageMessage(); // sendImageMessage 함수 호출
    // sendImageMessage 함수 안에서 메뉴 닫도록 코드가 이동됨
});
// 상황 메뉴 버튼 클릭 (기능 실행 후 메뉴 닫도록 수정됨)
menuSituationButton.addEventListener("click", function() {
    sendSituationRequest(); // sendSituationRequest 함수 호출
    // sendSituationRequest 함수 안에서 메뉴 닫도록 코드가 이동됨
});
// TXT 내보내기 메뉴 버튼 클릭 (새로 추가)
menuExportTxtButton.addEventListener("click", function() {
    exportConversationAsTxt(); // exportConversationAsTxt 함수 호출
    // exportConversationAsTxt 함수 안에서 메뉴 닫도록 코드가 추가됨
});
// 요약 메뉴 버튼 클릭 (새로 추가)
menuSummarizeButton.addEventListener("click", function() {
    summarizeConversation(); // summarizeConversation 함수 호출
    // summarizeConversation 함수 안에서 메뉴 닫도록 코드가 추가됨
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