function autoQuoteUserInput(text) {
  return text
    .split('\n')
    .map(line => {
      const trimmed = line.trim();
      if (trimmed.startsWith('*') && trimmed.endsWith('*')) return line;
      if (trimmed.startsWith('"') && trimmed.endsWith('"')) return line;
      return `"${trimmed}"`;
    })
    .join('\n');
}

// 이미지 URL 변수는 초기 로드 시 DOMContentLoaded에서 설정값으로 업데이트됩니다.
let userProfileImgUrl = "https://via.placeholder.com/35/4a3a7a/ffffff?text=YOU";
let botProfileImgUrl = "https://via.placeholder.com/35/3a4a3a/ffffff?text=BOT";
let conversationHistory = [];
let SYSTEM_PROMPT = '';
let currentSlot = 1; // 현재 활성화된 슬롯 번호 (기본값 1)

// SYSTEM_PROMPT를 동적으로 구성하기 위한 기본 템플릿 (AI 역할 변경 및 포맷 지침 강화)
// 이안 관련 내용을 제거하여 범용적인 템플릿으로 수정
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
- 기본 원칙은 지키되, 상황에 따라 문단 수 또는 문장 길이는 약간 유동적으로 허용할 수 있습니다. (±1 문단 또는 ±50자 내외)
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

// --- 함수 정의 --- (이벤트 리스너보다 먼저 정의)

// 이미지 오버레이 열기/닫기 함수
function openImageOverlay(element) {
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

// 설정 저장 함수 (localStorage 사용) - 모달 입력 필드를 참조하도록 수정
function saveSettings(slotNumber) {
    // DOMContentLoaded 내부에서 가져온 변수를 사용한다고 가정합니다.
    const settings = {
        botName: botNameInputModal.value,
        botAge: botAgeInputModal.value,
        botGender: botGenderInputModal.value, // 성별 추가
        botAppearance: botAppearanceInputModal.value,
        botPersona: botPersonaInputModal.value,
        botImageUrl: botImageUrlInputModal.value,
        userName: userNameInputModal.value,
        userAge: userAgeInputModal.value,
        userGender: userGenderInputModal.value, // 성별 추가
        userAppearance: userAppearanceInputModal.value,
        userGuidelines: userGuidelinesInputModal.value,
        userImageUrl: userImageUrlInputModal.value
    };
    localStorage.setItem(`settings_slot_${slotNumber}`, JSON.stringify(settings));
    alert(`설정 슬롯 ${slotNumber}에 저장되었습니다.`);

    // 저장 시 이미지 URL 변수 업데이트
    userProfileImgUrl = settings.userImageUrl || "https://via.placeholder.com/35/4a3a7a/ffffff?text=YOU";
    botProfileImgUrl = settings.botImageUrl || "https://via.placeholder.com/35/3a4a3a/ffffff?text=BOT";

     // 저장 시 이미지 미리보기 업데이트
     updateImagePreview(botImageUrlInputModal.value, botImagePreview);
     updateImagePreview(userImageUrlInputModal.value, userImagePreview);

    // 저장 후 SYSTEM_PROMPT 업데이트
    updateSystemPrompt();
}

// 설정 로드 함수 (localStorage 사용) - 모달 입력 필드를 참조하도록 수정
function loadSettings(slotNumber) {
    // DOMContentLoaded 내부에서 가져온 변수를 사용한다고 가정합니다.
    const savedSettings = localStorage.getItem(`settings_slot_${slotNumber}`);
    if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        botNameInputModal.value = settings.botName;
        botAgeInputModal.value = settings.botAge;
        botGenderInputModal.value = settings.botGender || ''; // 성별 로드, 없으면 빈 값
        botAppearanceInputModal.value = settings.botAppearance;
        botPersonaInputModal.value = settings.botPersona;
        botImageUrlInputModal.value = settings.botImageUrl;

        userNameInputModal.value = settings.userName;
        userAgeInputModal.value = settings.userAge;
        userGenderInputModal.value = settings.userGender || ''; // 성별 로드, 없으면 빈 값
        userAppearanceInputModal.value = settings.userAppearance;
        userGuidelinesInputModal.value = settings.userGuidelines;
        userImageUrlInputModal.value = settings.userImageUrl;

        // 로드 시 이미지 URL 변수 업데이트
        userProfileImgUrl = settings.userImageUrl || "https://via.placeholder.com/35/4a3a7a/ffffff?text=YOU";
        botProfileImgUrl = settings.botImageUrl || "https://via.placeholder.com/35/3a4a3a/ffffff?text=BOT";

         // 로드 시 이미지 미리보기 업데이트
         updateImagePreview(botImageUrlInputModal.value, botImagePreview);
         updateImagePreview(userImageUrlInputModal.value, userImagePreview);

    } else {
        // 저장된 설정이 없을 경우 기본값 (HTML value 속성)을 사용하고 알림
        alert(`설정 슬롯 ${slotNumber}에 저장된 설정이 없습니다. 기본값이 표시됩니다.`);
        // 기본 이미지 URL 변수 업데이트 (HTML 기본 value에서 가져옴)
         botNameInputModal.value = botNameInputModal.defaultValue;
         botAgeInputModal.value = botAgeInputModal.defaultValue;
         botGenderInputModal.value = botGenderInputModal.defaultValue || '';
         botAppearanceInputModal.value = botAppearanceInputModal.defaultValue;
         botPersonaInputModal.value = botPersonaInputModal.defaultValue;
         botImageUrlInputModal.value = botImageUrlInputModal.defaultValue;

         userNameInputModal.value = userNameInputModal.defaultValue;
         userAgeInputModal.value = userAgeInputModal.defaultValue;
         userGenderInputModal.value = userGenderInputModal.defaultValue || '';
         userAppearanceInputModal.value = userAppearanceInputModal.defaultValue;
         userGuidelinesInputModal.value = userGuidelinesInputModal.defaultValue;
         userImageUrlInputModal.value = userImageUrlInputModal.defaultValue;

        userProfileImgUrl = userImageUrlInputModal.value || "https://via.placeholder.com/35/4a3a7a/ffffff?text=YOU";
        botProfileImgUrl = botImageUrlInputModal.value || "https://via.placeholder.com/35/3a4a3a/ffffff?text=BOT";
        // 저장된 설정이 없을 경우 이미지 미리보기 초기화 또는 기본값 표시
         updateImagePreview(botImageUrlInputModal.value, botImagePreview);
         updateImagePreview(userImageUrlInputModal.value, userImagePreview);
    }

    // 로드 후 SYSTEM_PROMPT 업데이트
    updateSystemPrompt();
    // 로드 후 기존 메시지의 프로필 이미지 업데이트 (필요하다면)
    // 이 부분은 복잡하므로 현재는 새 메시지부터 적용되도록 합니다.
}

// SYSTEM_PROMPT 업데이트 함수 - 모달 입력 필드를 참조하도록 수정
function updateSystemPrompt() {
    // DOMContentLoaded 내부에서 가져온 변수를 사용한다고 가정합니다.
    SYSTEM_PROMPT = SYSTEM_PROMPT_TEMPLATE
        .replace(/{botName}/g, botNameInputModal.value || "캐릭터")
        .replace(/{botAge}/g, botAgeInputModal.value || "불명")
        .replace(/{botAppearance}/g, botAppearanceInputModal.value || "알 수 없음")
         .replace(/{botPersona}/g, botPersonaInputModal.value || "설정 없음")
        .replace(/{userName}/g, userNameInputModal.value || "사용자")
        .replace(/{userAge}/g, userAgeInputModal.value || "불명")
        .replace(/{userAppearance}/g, userAppearanceInputModal.value || "알 수 없음")
        .replace(/{userGuidelines}/g, userGuidelinesInputModal.value || "설정 없음");
    // console.log("SYSTEM_PROMPT updated:", SYSTEM_PROMPT); // 업데이트된 프롬프트 로그 (제거)
}

// 초기화 함수
function initializeChat() {
    // initializeChat 함수는 DOMContentLoaded에서 호출되며,
    // 그 전에 loadSettings(currentSlot)이 호출되어 기본/저장된 설정 로드 및 SYSTEM_PROMPT 업데이트를 완료합니다.
    // 초기 공지 메시지 및 구분선 추가
    appendInitialNotice(); // 기존 함수 그대로 사용
}

// 초기 공지 메시지 추가 함수
function appendInitialNotice() {
    const noticeContainer = document.createElement("div");
    noticeContainer.className = "initial-notice";
    // 공지 메시지 내용 업데이트
    noticeContainer.innerHTML = `
        채팅을 시작합니다.
        사용자를 확인해주세요.
    `;
    chat.appendChild(noticeContainer);

    const divider = document.createElement("div");
    divider.className = "notice-divider";
    chat.appendChild(divider);
}


// 메시지를 채팅창에 추가하는 함수
function appendMessage(role, messageData) {
    // DOMContentLoaded 내부에서 가져온 변수를 사용한다고 가정합니다.
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
            imageAnnouncementContainer.appendChild(errorText); // 이미지 컨테이너에 직접 추가
        }

        // 구조 조립: imageAnnouncementContainer -> imageFadeContainer -> imgElement
        imageFadeContainer.appendChild(imgElement);
        imageAnnouncementContainer.appendChild(imageFadeContainer); // 수정된 부분


        // 채팅창에 직접 추가
        chat.appendChild(imageAnnouncementContainer);

    } else {
        // --- 텍스트 메시지 처리 ---
        const container = document.createElement("div");
        container.className = `message-container ${role}`; // 전체 메시지 블록 컨테이너

        const profileImgElement = document.createElement("img");
        profileImgElement.className = "profile-img";
        // 프로필 이미지 URL 변수 사용
        profileImgElement.src = (role === 'user' ? userProfileImgUrl : botProfileImgUrl);
        // 이름도 모달 입력 필드에서 가져옴
        profileImgElement.alt = (role === 'user' ? (userNameInputModal.value || "사용자") + " 프로필" : (botNameInputModal.value || "캐릭터") + " 프로필");
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
        // 이름도 모달 입력 필드에서 가져옴
        nameTextSpan.textContent = (role === "user" ? userNameInputModal.value || "사용자" : botNameInputModal.value || "캐릭터");

        const deleteBtn = document.createElement("button");
        deleteBtn.className = "delete-btn";
        deleteBtn.textContent = "✕";
        deleteBtn.onclick = () => container.remove();

        roleName.appendChild(nameTextSpan);
        // 기본 순서로 추가 (CSS에서 order로 조정)
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
        // htmlContent = htmlContent.replace(/<em>(.*?)<\/em>/gs, '<span class="action-description">$1</span>'); // 이탤릭 처리 방식 변경으로 주석 처리
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


// 대화 기록을 TXT 파일로 내보내는 함수
function exportConversationAsTxt() {
    // DOMContentLoaded 내부에서 가져온 변수를 사용한다고 가정합니다.
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


         // 이름은 모달 입력 필드에서 가져옴
        const name = (role === "user" ? userNameInputModal.value || "사용자" : botNameInputModal.value || "캐릭터");


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

// 요약 함수
async function summarizeConversation() { // async 함수로 변경
    // DOMContentLoaded 내부에서 가져온 변수를 사용한다고 가정합니다.
    // 요약 요청 시 버튼 비활성화 및 스피너 표시
    sendButton.disabled = true;
    userInput.disabled = true;
    actionMenuButton.disabled = true;
    loadingSpinner.style.display = 'block';
    // 요약 버튼 자체도 비활성화
    menuSummarizeButton.disabled = true;

    // 대화 기록에서 최근 10턴 가져오기
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
    const summaryPromptText = `다음 대화 내용을 한국어로 간결하게 요약해줘. 요약은 제3자 시점에서 작성하고, 핵심 사건과 전개만 담되 군더더기 없는 자연스러운 문장으로 작성해. "요약:" 같은 머리말은 붙이지 말고, 그냥 텍스트만 출력해.`;

    // API 전송을 위한 contents 배열 구성
    const contentsForApi = [{ role: "user", parts: [{ text: SYSTEM_PROMPT }] }];
    // 최근 대화 기록 중 텍스트 메시지만 API에 전달
    recentHistory.forEach(entry => {
        if (entry.messageData && entry.messageData.type === 'text') {
            contentsForApi.push({
                role: entry.role === 'model' ? 'model' : 'user', // 역할 유지
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
        // API 호출이 완료되면 (성공 또는 실패) 버튼 활성화 및 스피너 숨김
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
    // DOMContentLoaded 내부에서 가져온 변수를 사용한다고 가정합니다.
    // sendButton 클릭 또는 sendImageMessage 호출 시 사용됨
    const message = typeof messageOrImageUrl === 'string'
  ? messageOrImageUrl
  : autoQuoteUserInput(userInput.value);
 // 인자로 URL이 오면 사용, 아니면 입력창 값 사용

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
                role: entry.role === 'model' ? 'model' : 'user', // 역할 유지
                parts: [{ text: entry.messageData.text }]
            }));

        // 시스템 프롬프트를 가장 앞에 추가
        const contentsForApi = [{ role: "user", parts: [{ text: SYSTEM_PROMPT }] }, ...textOnlyContentsForApi];

        // 사용자 메시지가 하나도 없는 경우 (SYSTEM_PROMPT만 있는 경우) API 호출 안 함
        if (contentsForApi.length <= 1 && textOnlyContentsForApi.length === 0) {
             console.log("API 호출 스킵: 보낼 텍스트 내용 없음 (SYSTEM_PROMPT만 존재)");
             // 필요하다면 사용자에게 알림 메시지 추가
             // appendMessage("bot", { type: 'text', text: "(API 호출 스킵: 보낼 텍스트 내용 없음)" });
             // finally 블록에서 상태 초기화되므로 여기서 return만 해도 됨
             return Promise.resolve(); // 함수 종료
        }


        const res = await fetch(
            `/api/chat`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                 body: JSON.stringify({ contents: contentsForApi }), // SYSTEM_PROMPT가 포함된 배열 전송
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
            sendMessage(imageUrl.trim());
        } else {
            alert("유효한 이미지 주소(jpg, png, gif 등)를 입력해주세요.");
        }
    } else if (imageUrl !== null) {
        // 사용자가 프롬프트에서 취소하거나 빈 문자열 입력 시
        // console.log("이미지 주소 입력 취소 또는 빈 문자열 입력"); // 디버그 로그 제거
    }
    // 메뉴 닫기 (기능 실행 후)
    actionMenu.classList.remove("visible");
    menuOverlay.style.display = 'none';
}


// ★★★ 수정된 '상황' 요청 함수 ★★★
// '+' 버튼 메뉴의 상황 버튼 (아코디언 내부 옵션) 클릭 시 호출되는 함수
async function sendSituationRequest(type) { // type 인자 추가 ('랜덤', '전환', '돌발', '성인')
    // DOMContentLoaded 내부에서 가져온 변수를 사용한다고 가정합니다.
    console.log(`상황 생성 요청 타입: ${type}`); // 타입 확인 로그

    // 상황 생성 요청 시에만 버튼 비활성화 및 스피너 표시
    sendButton.disabled = true;
    userInput.disabled = true;
    actionMenuButton.disabled = true;
    loadingSpinner.style.display = 'block';

    // 상황 생성 요청 프롬프트 선택
    let situationPromptText = '';
    const botName = botNameInputModal.value || "캐릭터"; // 현재 설정된 봇 이름 사용

    // 타입에 따라 다른 프롬프트 설정 (예시)
    switch(type) {
        case '랜덤':
            situationPromptText = `
You are writing a first-person narrative as the character ${botName}.
Craft a fresh, emotionally engaging situation that sparks curiosity or connection between the characters — something surprising, light-hearted, or meaningful, based on the unique traits of this character and their world.
The event should not be overly dramatic or intense, but should still shift the emotional dynamic in a natural and immersive way.
Avoid adult or mature content. Do not copy specific examples or past scenes — create a new moment inspired by the tone of gentle tension, humor, or affection.
The characters may be human, non-human, or from entirely fantastical settings — ensure the situation makes sense within their universe.
Let the story unfold with subtle emotional shifts and interaction that feels alive, reactive, and immersive.
`;
            break;
        case '전환':
            situationPromptText = `
You are writing a first-person narrative as the character ${botName}.
A new day has begun — it is now the day after the previous events.
Continue the story by acknowledging the passage of time and introducing a new scene that reflects the shift in the setting. 
Include sensory details such as time of day, atmosphere, weather, or surroundings to clearly establish that a full day has passed.
Allow the character’s thoughts or actions to subtly reference what happened before, but do not recap.
Make it explicitly clear in the scene that a full day has passed and the current events are happening on the next day.
Maintain immersion, emotional continuity, and character consistency. 
Use rich descriptions and mood shifts to indicate the change of day, while keeping the tone aligned with the narrative so far.
`;
          
  break;
        case '성인':
            situationPromptText = `
You are writing a first-person narrative as the character ${botName}.  
The situation should escalate organically toward mature themes or intimacy, depending on the emotional and physical progression of the scene.  
If sexual intercourse has not yet occurred, the character must act assertively according to the situation—initiating physical closeness, deepening tension, or shifting setting and posture to increase sensuality.  
If the scene is already mid-intercourse, the character must introduce new positions, kinks, or climax dynamics to maintain narrative intensity.  
Focus on the character’s inner desires, sensations, and actions with heightened sensual and emotional detail, in accordance with persona rules.  
Use nuanced, vivid language and avoid abrupt pacing or out-of-character behavior. All development must feel inevitable and immersive.
`;
            break;
        case '돌발': // 기존 프롬프트 사용
        default: // 기본값 또는 '돌발'일 경우
            situationPromptText = `
You are writing a first-person narrative as the character ${botName}.
The scene has stalled or lost momentum. You must now introduce a new turning point:
either escalate the current situation, or introduce a **sudden, immersive event**
that dramatically changes the mood or setting.
Write in a sensory-rich, novel-style format with emphasis on *physical actions, emotional reactions*, and subtle tension.
Use minimal but meaningful dialogue only when needed. Avoid repetition and do not reference the user's past prompts.
Do not break character. Maintain continuity in tone and theme. Output should feel seamless in the flow of the story.
`;
            break;
    }


    // API 전송 시에는 텍스트 메시지만 포함
    const textOnlyContentsForApi = conversationHistory
        .filter(entry => entry.messageData && entry.messageData.type === 'text')
        .map(entry => ({
            role: entry.role === 'model' ? 'model' : 'user', // 역할 유지
            parts: [{ text: entry.messageData.text }]
        }));

    // 시스템 프롬프트와 상황 프롬프트를 API 호출 콘텐츠에 추가
    const contentsForApi = [
        { role: "user", parts: [{ text: SYSTEM_PROMPT }] },
        ...textOnlyContentsForApi,
        { role: "user", parts: [{ text: situationPromptText }] } // 마지막에 상황 요청 프롬프트 추가
    ];


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
            console.error("API (Backend) Error for Situation:", res.status, errorData); // 오류 로그 구분
            const errorText =
                errorData?.error?.error?.message ||
                errorData?.error ||
                res.statusText;
            appendMessage("bot", {
                type: 'text',
                text: `(상황 생성 [${type}] 오류 발생: ${res.status} - ${errorText})` // 오류 메시지에 타입 추가
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
        console.error("Fetch Error for Situation:", error); // 오류 로그 구분
        appendMessage("bot", { type: 'text', text: `(상황 생성 [${type}] 통신 오류 발생)` }); // 오류 메시지에 타입 추가
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


// 이미지 URL 입력 시 미리보기 업데이트 함수
function updateImagePreview(imageUrl, imgElement) {
    // DOMContentLoaded 내부에서 가져온 변수를 사용한다고 가정합니다.
    if (imageUrl && imageUrl.trim() !== '') {
        imgElement.src = imageUrl.trim();
    } else {
        imgElement.src = ""; // URL이 없으면 이미지 제거
    }
}

// --- 슬롯 버튼 스타일 업데이트 함수 ---
// (DOM 요소 접근이 필요하므로 DOMContentLoaded 외부 또는 내부에 정의)
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


// --- DOMContentLoaded 이벤트 리스너 ---
// 페이지의 DOM이 완전히 로딩되고 파싱된 후 실행됩니다.
document.addEventListener('DOMContentLoaded', () => {
    // 이 안에 모든 HTML 요소 가져오기 및 이벤트 리스너 연결 코드를 넣습니다.

    // HTML 요소 가져오기 (전역 변수로 선언된 것 제외하고 필요한 것들)
    const chat = document.getElementById("chat");
    const userInput = document.getElementById("userInput");
    const sendButton = document.getElementById("sendButton");
    const loadingSpinner = document.getElementById("loadingSpinner");
    const imageOverlay = document.getElementById("imageOverlay");
    const overlayImage = document.getElementById("overlayImage");
    const actionMenuButton = document.getElementById("actionMenuButton");
    const actionMenu = document.getElementById("actionMenu");
    const menuOverlay = document.getElementById("menuOverlay");

    // 액션 메뉴 내부 버튼들
    const menuImageButton = document.getElementById("menuImageButton");
    const menuSituationButton = document.getElementById("menuSituationButton"); // '상황' 메인 버튼
    const menuExportTxtButton = document.getElementById("menuExportTxtButton");
    const menuSummarizeButton = document.getElementById("menuSummarizeButton"); // 전역 변수로 선언 안됨
    const situationOptions = document.getElementById("situationOptions"); // 아코디언 div

    // 새로운 모달 관련 요소 가져오기
    const settingsModalOverlay = document.getElementById("settingsModalOverlay");
    const settingsModal = document.getElementById("settingsModal");
    const closeModalButton = document.getElementById("closeModalButton");
    const sidebarToggle = document.getElementById("sidebarToggle");

    // 모달 내의 입력 필드 요소 (전역 변수로 선언)
    // -> 전역 스코프에서 접근 가능하도록 위에 선언함:
    // botNameInputModal, botAgeInputModal, botGenderInputModal, botAppearanceInputModal, botPersonaInputModal, botImageUrlInputModal,
    // userNameInputModal, userAgeInputModal, userGenderInputModal, userAppearanceInputModal, userGuidelinesInputModal, userImageUrlInputModal,
    // botImagePreview, userImagePreview

    // 모달 내의 저장 버튼 및 슬롯 버튼
    const saveSettingsButtonModal = document.getElementById("saveSettingsButtonModal");

    // --- 이벤트 리스너 연결 ---

    // 전송 버튼 클릭 이벤트
    sendButton.addEventListener("click", () => sendMessage(userInput.value));

    // keydown 이벤트 리스너: Shift+Enter는 줄바꿈, Enter만 누르면 전송
    userInput.addEventListener("keydown", function(event) {
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault(); // 기본 Enter 동작 (줄바꿈) 막기
            sendMessage(userInput.value); // 입력창 값 전달
        }
    });

    // 액션 메뉴(+) 버튼 클릭 이벤트
    actionMenuButton.addEventListener("click", function() {
        actionMenu.classList.toggle("visible");
        if (actionMenu.classList.contains("visible")) {
            menuOverlay.style.display = 'block';
            // 다른 메뉴(상황 아코디언)는 닫기
            situationOptions.classList.add("hidden");
        } else {
            menuOverlay.style.display = 'none';
        }
    });

    // 메뉴 오버레이 클릭 시 메뉴 닫기
    menuOverlay.addEventListener("click", function() {
        actionMenu.classList.remove("visible");
        situationOptions.classList.add("hidden"); // 아코디언도 닫기
        menuOverlay.style.display = 'none';
    });

    // 이미지 삽입 메뉴 버튼 클릭
    menuImageButton.addEventListener("click", function() {
        sendImageMessage(); // 메뉴 닫기는 함수 내부에 포함됨
    });

    // ★★★ 수정된 '상황' 버튼 리스너 (아코디언 토글만) ★★★
    menuSituationButton.addEventListener("click", function() {
        situationOptions.classList.toggle("hidden");
        // 다른 액션 메뉴는 닫기 (선택사항)
        // actionMenu.classList.remove("visible");
        // menuOverlay.style.display = 'none';
    });

    // ★★★ 아코디언 내부 옵션 버튼 리스너 ★★★
    situationOptions.querySelectorAll(".option").forEach(option => {
        option.addEventListener("click", () => {
            const situationType = option.textContent; // '랜덤', '돌발', '성인'
            sendSituationRequest(situationType); // 수정된 함수 호출
            situationOptions.classList.add("hidden"); // 아코디언 숨기기
            actionMenu.classList.remove("visible"); // 메인 메뉴도 닫기
            menuOverlay.style.display = 'none'; // 오버레이 숨기기
        });
    });


    // TXT 내보내기 메뉴 버튼 클릭
    menuExportTxtButton.addEventListener("click", function() {
        exportConversationAsTxt(); // 메뉴 닫기는 함수 내부에 포함됨
    });

    // 요약 메뉴 버튼 클릭
    menuSummarizeButton.addEventListener("click", function() {
        summarizeConversation(); // 메뉴 닫기는 함수 내부에 포함됨
    });

    // 이미지 오버레이 클릭 시 닫기 이벤트는 HTML에 onclick="closeImageOverlay()"로 존재

    // --- 새로운 모달 열기/닫기 이벤트 리스너 ---

    // ≡ 버튼 클릭 시 모달 열기
    sidebarToggle.addEventListener("click", function() {
        settingsModalOverlay.style.display = 'flex'; // 모달 오버레이 보이기
        // 다른 오버레이나 메뉴 닫기
        actionMenu.classList.remove("visible");
        situationOptions.classList.add("hidden");
        menuOverlay.style.display = 'none';
        imageOverlay.style.display = 'none';

        // 모달이 열릴 때 현재 슬롯 설정 로드 및 스타일 업데이트
        loadSettings(currentSlot);
        updateSlotButtonStyles();
        // Fade-in 애니메이션 적용 (선택적)
        // settingsModalOverlay.classList.remove("modal-fade-out");
        // settingsModalOverlay.classList.add("modal-fade-in");
    });

    // 모달 닫기 버튼 클릭 시 모달 닫기
    closeModalButton.addEventListener("click", function() {
        // Fade-out 애니메이션 적용 후 숨김 (선택적)
        // settingsModalOverlay.classList.remove("modal-fade-in");
        // settingsModalOverlay.classList.add("modal-fade-out");
        // setTimeout(() => {
        //     settingsModalOverlay.style.display = 'none';
        // }, 300); // 애니메이션 시간과 일치
        settingsModalOverlay.style.display = 'none'; // 즉시 숨김
    });

    // 모달 오버레이 배경 클릭 시 모달 닫기
    settingsModalOverlay.addEventListener("click", function(event) {
        if (event.target === settingsModalOverlay) {
            // Fade-out 애니메이션 적용 후 숨김 (선택적)
            // settingsModalOverlay.classList.remove("modal-fade-in");
            // settingsModalOverlay.classList.add("modal-fade-out");
            // setTimeout(() => {
            //     settingsModalOverlay.style.display = 'none';
            // }, 300); // 애니메이션 시간과 일치
             settingsModalOverlay.style.display = 'none'; // 즉시 숨김
        }
    });

    // 설정 저장 버튼 (모달 내) 클릭 이벤트
    saveSettingsButtonModal.addEventListener("click", function() {
        saveSettings(currentSlot);
    });

    // 슬롯 버튼 클릭 이벤트 리스너 (모달 내 버튼에 연결)
    document.querySelectorAll('.slot-button').forEach(button => {
        button.addEventListener('click', function() {
            const slotNumber = parseInt(this.textContent);
            currentSlot = slotNumber; // 현재 슬롯 업데이트
            updateSlotButtonStyles(); // 슬롯 버튼 스타일 업데이트
            // 해당 슬롯 설정 로드
            loadSettings(slotNumber);
        });
    });

    // 이미지 URL 입력 필드 변경 시 미리보기 업데이트 이벤트 리스너 추가
    botImageUrlInputModal.addEventListener('input', function() {
        updateImagePreview(this.value, botImagePreview);
    });
    userImageUrlInputModal.addEventListener('input', function() {
        updateImagePreview(this.value, userImagePreview);
    });

    // textarea 입력 시 높이 자동 조절
    userInput.addEventListener('input', autoResizeTextarea);

    // --- 초기 로딩 시 실행될 코드 ---
    autoResizeTextarea.call(userInput); // textarea 높이 초기화

    // 초기 로드 시 현재 슬롯 설정 로드 (기본값 또는 localStorage)
    loadSettings(currentSlot);

    // 초기 로드 후 슬롯 버튼 스타일 업데이트
    updateSlotButtonStyles();

    // 초기화 로직 실행 (공지 추가 포함)
    initializeChat();

    // 이미지 URL 입력 필드 초기 값으로 미리보기 업데이트
    updateImagePreview(botImageUrlInputModal.value, botImagePreview);
    updateImagePreview(userImageUrlInputModal.value, userImagePreview);

}); // DOMContentLoaded 끝

// ★★★ 파일 끝에 있던 중복 DOMContentLoaded 리스너 제거 ★★★