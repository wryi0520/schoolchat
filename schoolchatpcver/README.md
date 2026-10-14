# 🏫 스쿨큐 (SchoolQ) - 우리 학교 맞춤 Q&A 및 실시간 1:1 공부 채팅 플랫폼

> 같은 학교·학년의 친구와 선후배끼리 공부 질문을 주고받고, 답변 채택 시 안전한 1:1 공부 채팅으로 연결되는 학교 맞춤형 학업 커뮤니티

---

## 📌 주요 특징 (Key Features)

1. **학교·학년 맞춤형 Q&A 게시판**
   - **선생님 출제 스타일 연계**: 각 학교 교사별 출제 성향(서술형 감점 기준, 부교재 변형율 등), 시험 범위 쪽수, 난이도를 지정해 질문
   - **학년·과목 필터링**: 1/2/3학년 및 수학, 국어, 영어, 과학, 사회 등 과목별 맞춤 필터링
   - **답변 채택 시스템**: 질문자가 가장 유익한 선배/친구의 답변을 채택하면 포인트 보상과 함께 1:1 대화방이 즉시 활성화

2. **실시간 1:1 공부 채팅 서버 (Express + SSE)**
   - **동일 학교 안전 정책**: 동일 학교 재학생 간에만 1:1 DM이 가능하며, 타학교 학생과의 DM 시도는 차단
   - **Q&A 채택 연계 활성화**: 채택된 답변자 또는 상호 친구 관계인 학생과만 1:1 공부 멘토링 방 개설
   - **실시간 스트림(SSE)**: Server-Sent Events 기반으로 실시간 메시지 전송 및 동기화
   - **손글씨 풀이 사진 & 수식 툴바**: 오답노트 사진 첨부/라이트박스 뷰어 및 LaTeX 수식 간편 삽입
   - **뽀모도로 25분 스터디 타이머**: 1:1 채팅방에서 함께 집중 모드 가동

3. **AI 학업 특화 엔진 (Google Gemini 3.8 Flash)**
   - **AI 선생님별 서술형 채점기 (Rubric Grader)**: 학생이 작성한 풀이 초안을 입력하면 담당 교사의 감점 기준표를 반영하여 모의 채점(점수, 감점 사유, 모범 답안) 도출
   - **중간고사 킬러 3선 적중 예측기**: 학교 시험 범위와 기출 경향을 분석하여 빈출 함정 선지와 선배의 공략 팁 브리핑
   - **3단계 사고 유도 힌트**: 정답을 직접 유출하지 않고 개념 ➡️ 단계별 유도 ➡️ 함정 경고를 통해 자율 학습 지원

4. **학교 인증 및 안전 시스템**
   - **학생증 카메라 OCR 자동 스캔 인증**: 학생증 판독을 통한 학교 공식 인증 워터마크 배지 발급
   - **실시간 비속어 필터링**: 유해 언어 자동 `***` 마스킹
   - **원클릭 신고 및 유저 차단**: 게시글/답변/메시지 즉시 신고 및 차단된 유저의 모든 콘텐츠 숨김 처리

---

## 🛠️ 기술 스택 (Tech Stack)

- **Frontend**: React 19, TypeScript, Tailwind CSS v4, Lucide React, Motion
- **Backend**: Node.js, Express, tsx
- **AI Engine**: Google GenAI SDK (`@google/genai`), Gemini 3.8 Flash (`gemini-3.8-flash`)
- **Real-Time Sync**: Server-Sent Events (SSE) + REST API
- **Audio Synthesizer**: Web Audio API

---

## 🚀 빠른 시작 (Getting Started)

### 1. 레포지토리 복제 및 패키지 설치
```bash
git clone <YOUR_GITHUB_REPO_URL>
cd schoolq
npm install
```

### 2. 환경 변수 설정 (`.env`)
`.env.example`을 복사하여 `.env` 파일을 생성하고 Gemini API 키를 입력합니다.
```bash
cp .env.example .env
```

```env
GEMINI_API_KEY="your-gemini-api-key"
PORT=3000
```

### 3. 개발 서버 실행
```bash
npm run dev
```
브라우저에서 `http://localhost:3000`으로 접속합니다.

### 4. 프로덕션 빌드
```bash
npm run build
npm start
```

---

## 📁 프로젝트 구조 (Directory Structure)

```
.
├── server.ts                    # Express 풀스택 백엔드 (SSE, REST API, Gemini 연동, Vite 미들웨어)
├── src/
│   ├── App.tsx                  # 메인 탭 및 상태 오케스트레이션
│   ├── types.ts                 # 전역 데이터 타입 정의 (School, User, Question, ChatRoom 등)
│   ├── index.css                # Tailwind CSS 글로벌 스타일링
│   ├── main.tsx                 # React 루트 진입점
│   ├── components/
│   │   ├── Navbar.tsx           # 상단 헤더, 학교 인증 배지, 계정 전환기
│   │   ├── QuestionList.tsx     # 학교·학년별 Q&A 목록 및 필터
│   │   ├── QuestionDetailModal.tsx # Q&A 상세, AI 힌트, 답변 채택, 1:1 대화 연결
│   │   ├── CreateQuestionModal.tsx # 새 질문 작성 (수식/사진/프리셋 지원)
│   │   ├── ChatView.tsx         # 실시간 1:1 공부 채팅방 (사진 첨부, 수식, 타이머)
│   │   ├── TeachersBoard.tsx    # 선생님 출제 스타일 족보 & 역대 기출 분석실
│   │   ├── FriendsTab.tsx       # 선후배·친구 네트워크, 명예의 전당, 매점 상점
│   │   ├── AiRubricGraderModal.tsx # AI 선생님 서술형 채점기 & 킬러 예측 모달
│   │   └── SafetyModals.tsx     # 학생증 OCR 인증, 신고/차단 센터
│   └── utils/
│       └── soundAndMath.ts      # Web Audio API 사운드 합성기 및 LaTeX 수식 모음
├── package.json
└── tsconfig.json
```
