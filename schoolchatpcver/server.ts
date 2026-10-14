import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import util from 'util';
import { GoogleGenAI } from '@google/genai';

const execPromise = util.promisify(exec);
import { 
  School, 
  User, 
  Question, 
  Answer, 
  ChatRoom, 
  ChatMessage, 
  ReportItem, 
  FriendRelation,
  ExamBankItem,
  TeacherRubricResult
} from './src/types.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Initialize Google Gemini API
const geminiApiKey = process.env.GEMINI_API_KEY || '';
const ai = geminiApiKey ? new GoogleGenAI({ apiKey: geminiApiKey }) : null;

// Safe Profanity Masker
const PROFANITY_WORDS = ['바보', '멍청이', '시발', '새끼', '존나', '꺼져', '닥쳐', '미친'];
function maskProfanity(text: string): { sanitized: string; hadProfanity: boolean } {
  let sanitized = text;
  let hadProfanity = false;
  for (const word of PROFANITY_WORDS) {
    if (sanitized.includes(word)) {
      hadProfanity = true;
      sanitized = sanitized.replaceAll(word, '*'.repeat(word.length));
    }
  }
  return { sanitized, hadProfanity };
}

// --- IN-MEMORY DATABASE SEED ---
const schools: School[] = [
  {
    id: 'school-seoul-high',
    name: '서울고등학교',
    type: '고등학교',
    location: '서울특별시 서초구 효령로',
    badgeColor: '#2563eb',
    currentExamPeriod: '2026학년도 1학기 1차 지필평가 (중간고사 D-12)',
    examDDay: 12,
    gradeLevels: [1, 2, 3],
    popularTeachers: [
      {
        name: '김영훈 선생님',
        subject: '수학',
        styleDescription: '서술형 풀이과정 기호 생략 시 1~2점 감점 엄격함. 부교재 변형 30%, 개념 유도 빈출.',
        examTips: '단답형 3번은 항상 부교재 최고난도 문제 변형! 풀이 줄바꿈 깔끔하게 작성할 것.',
        pastKillerTopics: ['삼각방정식 주기성 단위원', '삼차함수 접선의 개수', '수열 귀납적 정의']
      },
      {
        name: '박선희 선생님',
        subject: '영어',
        styleDescription: '교과서 본문 외 수능특강 및 외부 모의고사 지문 연계율 35% 이상. 어법 어휘 킬러 출제.',
        examTips: '관계사 생략과 분사구문 변형에 주의. 서술형 영작 조건(주어진 단어 어형 변화) 꼼꼼히 확인.',
        pastKillerTopics: ['빈칸추론 어휘 반의어 치환', '도치 구문 서술형 영작', '함축 의미 추론']
      },
      {
        name: '이성우 선생님',
        subject: '과학',
        styleDescription: '물리학 파트 계산 실수 유도 선지 다수. 그래프 축 단위(cm vs m, min vs s) 장난 잦음.',
        examTips: '실험 탐구 보고서에 나온 오차 원인이 보기 ㄷ에 자주 나옴.',
        pastKillerTopics: ['등가속도 운동 그래프 시간차 분석', '역학적 에너지 보존 마찰력 일', '열역학 제1법칙 P-V 그래프']
      }
    ]
  },
  {
    id: 'school-gyeonggi-girls',
    name: '경기여자고등학교',
    type: '고등학교',
    location: '서울특별시 강남구 삼성로',
    badgeColor: '#7c3aed',
    currentExamPeriod: '2026학년도 1학기 중간고사 D-15',
    examDDay: 15,
    gradeLevels: [1, 2, 3],
    popularTeachers: [
      {
        name: '정수경 선생님',
        subject: '국어',
        styleDescription: '고전시가 현대어 해석과 시어 함축적 의미 꼼꼼히 채점. 학습활동 응용 서술형 출제.',
        examTips: '프린트물 빈칸 어휘와 교과서 날개 질문에서 객관식 보기 다수 출제됨.',
        pastKillerTopics: ['가시리-진달래꽃 이별 정서 비교', '훈민정음 어제 서문 문법요소', '현대소설 서술 시점 전환']
      },
      {
        name: '윤도현 선생님',
        subject: '과학',
        styleDescription: '생명과학 가계도 분석 킬러 문항 2개 고정. 시간 분배가 핵심.',
        examTips: '귀류법으로 빠르게 푸는 팁 기출문제집 34p 참고할 것.',
        pastKillerTopics: ['다인자 유전 확률 계산', '돌연변이 비분리 횟수 추정']
      }
    ]
  },
  {
    id: 'school-hansung-sci',
    name: '한성과학고등학교',
    type: '고등학교',
    location: '서울특별시 서대문구 통일로',
    badgeColor: '#059669',
    currentExamPeriod: '2026학년도 1학기 중간고사 D-9',
    examDDay: 9,
    gradeLevels: [1, 2, 3],
    popularTeachers: [
      {
        name: '최민석 선생님',
        subject: '수학',
        styleDescription: '해외 올림피아드 및 심화 미적분 증명 서술형 중심. 공식 암기보다 원리 유도.',
        examTips: '정리 증명 5가지 중 1개 반드시 출제된다고 수업 때 강조하심.',
        pastKillerTopics: ['엡실론-델타 논법 증명', '테일러 급수 오차 상한 추정']
      }
    ]
  }
];

let users: User[] = [
  {
    id: 'user-me',
    name: '김민우',
    schoolId: 'school-seoul-high',
    schoolName: '서울고등학교',
    grade: 1,
    classNum: 3,
    role: 'student',
    isVerified: true,
    points: 420,
    adoptedCount: 3,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    badgeTitle: '열혈 1학년 질문러',
    statusMessage: '시험 2주 전! 수학 김영훈 쌤 시험 대비 중 🔥',
    rank: 14,
    specialtySubject: '수학·과학'
  },
  {
    id: 'user-senior-seojun',
    name: '박서준 선배',
    schoolId: 'school-seoul-high',
    schoolName: '서울고등학교',
    grade: 2,
    classNum: 1,
    role: 'senior_mentor',
    isVerified: true,
    points: 1580,
    adoptedCount: 28,
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    badgeTitle: '서울고 2학년 수학 1등급',
    statusMessage: '작년 김영훈 쌤 수학 A+ 받았습니다. 서술형 팁 물어보세요!',
    rank: 1,
    specialtySubject: '수학1·수학2'
  },
  {
    id: 'user-senior-jieun',
    name: '이지은 선배',
    schoolId: 'school-seoul-high',
    schoolName: '서울고등학교',
    grade: 3,
    classNum: 2,
    role: 'senior_mentor',
    isVerified: true,
    points: 2340,
    adoptedCount: 45,
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    badgeTitle: '전교 3등 영수 멘토',
    statusMessage: '박선희 쌤 영어 서술형 빈출 단어 노트 정리본 공유 가능',
    rank: 2,
    specialtySubject: '영어·국어'
  },
  {
    id: 'user-peer-yuna',
    name: '최유나',
    schoolId: 'school-seoul-high',
    schoolName: '서울고등학교',
    grade: 1,
    classNum: 3,
    role: 'student',
    isVerified: true,
    points: 620,
    adoptedCount: 7,
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    badgeTitle: '1학년 과학 필기 장인',
    statusMessage: '이성우 쌤 물리학 실험 유의사항 필기 완료',
    rank: 8,
    specialtySubject: '통합과학'
  },
  {
    id: 'user-external-minji',
    name: '강민지',
    schoolId: 'school-gyeonggi-girls',
    schoolName: '경기여자고등학교',
    grade: 2,
    classNum: 4,
    role: 'student',
    isVerified: true,
    points: 540,
    adoptedCount: 6,
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80',
    badgeTitle: '경기여고 국어 스터디',
    statusMessage: '정수경 쌤 고전시가 파트 족보 교환해요',
    rank: 10,
    specialtySubject: '문학'
  }
];

let questions: Question[] = [
  {
    id: 'q-101',
    title: '[수학1] 김영훈 쌤 2단원 삼각함수 삼각방정식 서술형 감점 기준 아시는 선배님 계신가요?',
    content: '부교재 p.58 14번 문제에서 일반해 구할 때 단위원으로 푸는 거랑 그래프로 푸는 것 중에 김영훈 쌤은 어떤 풀이과정 기호를 빠뜨리면 감점하시나요? 작년 시험 보신 선배님 조언 부탁드립니다!\n\n식: 2\\sin^2 x - 3\\cos x = 0 (0 \\le x < 2\\pi)',
    authorId: 'user-me',
    authorName: '김민우',
    authorGrade: 1,
    schoolId: 'school-seoul-high',
    schoolName: '서울고등학교',
    targetGrade: 1,
    subject: '수학',
    teacherName: '김영훈 선생님',
    examScope: '수학1 2단원 삼각함수의 그래프 및 방정식 (부교재 p.42~65)',
    difficulty: '서술형대비',
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    status: 'adopted',
    adoptedAnswerId: 'ans-201',
    likes: 12,
    views: 89,
    formulaLatex: '2\\sin^2 x - 3\\cos x = 0, \\quad (0 \\le x < 2\\pi)',
    photoUrl: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=600&auto=format&fit=crop&q=80',
    tags: ['김영훈쌤', '삼각함수', '서술형감점방지', '부교재변형'],
    aiHint: {
      teacherAnalysis: '김영훈 선생님은 주어진 각의 범위(0 ≤ x < 2π 등)를 풀이 첫 줄에 반드시 명시하지 않으면 1점 감점하는 경향이 뚜렷합니다.',
      stepHint: '1단계: 삼각비의 특수각 대입 전 동경의 사분면 먼저 확정. 2단계: 양변 제곱 시 생기는 무연근 제거 과정 명시하기.',
      trapAlert: 'sin²x + cos²x = 1 치환 후 t의 범위 (-1 ≤ t ≤ 1)를 적지 않고 이차방정식 근을 구하면 전체 감점될 수 있습니다.',
      similarExamConcept: '2025 서울고 1학기 지필평가 서술형 2번 변형 (부교재 58p 14번 유사)'
    },
    answers: [
      {
        id: 'ans-201',
        questionId: 'q-101',
        authorId: 'user-senior-seojun',
        authorName: '박서준 선배',
        authorGrade: 2,
        authorSchoolId: 'school-seoul-high',
        authorSchoolName: '서울고등학교',
        isSenior: true,
        content: '작년에 김영훈 쌤 수업 들은 2학년입니다! 김영훈 쌤은 서술형 채점 기준표에 3가지를 명시하셨어요:\n1. 치환 변수 t에 대해 `-1 ≤ t ≤ 1` 범위 표시 안 하면 무조건 2점 깎임\n2. 단위원을 그렸을 때는 동경 각도 표시 필수\n3. 최종 답에서 원래 변수 x로 환원하는 단계 빠지면 1점 감점\n그래프보다는 단위원이 계산 실수 줄이기 좋습니다. 더 궁금한 점 있으면 채택 후 1:1 대화로 물어봐도 돼요!',
        createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
        isAdopted: true,
        upvotes: 18,
        teacherTip: '선생님이 칠판에 적어주신 노란색 분필 공식(동경 주기성)이 그대로 채점 기준이 됩니다.',
        stepGuide: '치환 범위 지정 -> 이차방정식 인수분해 -> 원래 각 x 환원 -> 각의 범위 검산',
        handwrittenPhoto: 'https://images.unsplash.com/photo-1596495578065-6e0763fa1178?w=600&auto=format&fit=crop&q=80',
        formulaLatex: 't = \\cos x, \\; -1 \\le t \\le 1 \\implies 2(1-t^2) - 3t = 0'
      }
    ]
  },
  {
    id: 'q-102',
    title: '[영어] 박선희 쌤 수능특강 연계 지문 빈칸추론 킬러 대비 어떻게 해야 하나요?',
    content: '교과서 3과랑 수특 라이트 5~8강이 시험 범위인데, 박선희 쌤은 원래 지문의 핵심 문장을 반의어나 관계사절로 패러프레이징해서 선지를 내시나요? 선지 난이도가 어느 정도인지 궁금합니다.',
    authorId: 'user-peer-yuna',
    authorName: '최유나',
    authorGrade: 1,
    schoolId: 'school-seoul-high',
    schoolName: '서울고등학교',
    targetGrade: 1,
    subject: '영어',
    teacherName: '박선희 선생님',
    examScope: '교과서 3과 + 수능특강 라이트 5~8강',
    difficulty: '내신빈출',
    createdAt: new Date(Date.now() - 3600000 * 8).toISOString(),
    status: 'open',
    likes: 8,
    views: 64,
    tags: ['박선희쌤', '수능특강', '빈칸추론', '패러프레이징'],
    aiHint: {
      teacherAnalysis: '박선희 쌤은 지문 원문의 중심 어휘를 고난도 유의어(Synonyms)로 바꾼 뒤, 선지 4, 5번에 매력적인 오답을 배치합니다.',
      stepHint: '주제문 2회독 후 주요 어휘의 반의어/유의어 파생어를 영영사전 정의로 점검하세요.',
      trapAlert: '지문 속 not / rarely / seldom 부정어 삽입 변형에 주의하세요.'
    },
    answers: [
      {
        id: 'ans-202',
        authorId: 'user-senior-jieun',
        authorName: '이지은 선배',
        authorGrade: 3,
        authorSchoolId: 'school-seoul-high',
        authorSchoolName: '서울고등학교',
        isSenior: true,
        questionId: 'q-102',
        content: '박선희 쌤은 단순 암기한 친구들을 거르기 위해서 주제문장의 단어를 고2~고3 기출 단어로 바꿔서 내십니다. 지문 암기만 하지 말고, 주제 문장의 영어 요약본을 본인이 직접 3가지 다른 표현으로 적어보는 연습을 추천해요. 제가 1학년 때 정리했던 변형 대비 단어 리스트도 있어요!',
        createdAt: new Date(Date.now() - 3600000 * 6).toISOString(),
        isAdopted: false,
        upvotes: 9,
        teacherTip: '수업 시간에 선생님이 "이 단어는 모의고사 필수어휘지?"라고 던진 단어가 그대로 선지에 나옵니다.'
      }
    ]
  },
  {
    id: 'q-103',
    title: '[통합과학] 이성우 쌤 물리학 파트 등가속도 운동 그래프 문제 함정 포인트',
    content: '속도-시간 그래프에서 기울기가 가속도인 건 아는데, 이성우 쌤 기출문제 보면 항상 보기 ㄷ에서 낚이는 친구들이 많다고 들었어요. 어떤 식의 함정을 주로 파시나요?',
    authorId: 'user-me',
    authorName: '김민우',
    authorGrade: 1,
    schoolId: 'school-seoul-high',
    schoolName: '서울고등학교',
    targetGrade: 1,
    subject: '과학',
    teacherName: '이성우 선생님',
    examScope: '통합과학 1단원 물질과 규칙성 - 역학적 시스템 p.70~98',
    difficulty: '킬러/심화',
    createdAt: new Date(Date.now() - 3600000 * 20).toISOString(),
    status: 'open',
    likes: 15,
    views: 112,
    formulaLatex: 'v = v_0 + at, \\quad s = v_0 t + \\frac{1}{2}at^2, \\quad 2as = v^2 - v_0^2',
    tags: ['이성우쌤', '통합과학', '등가속도', '함정선지'],
    answers: []
  },
  {
    id: 'q-104',
    title: '[국어] 정수경 쌤 가시리·진달래꽃 비교 서술형 조건 대비법',
    content: '경기여고 2학년 정수경 쌤 중간고사에서 화자의 정서 태도 대비 서술형 쓸 때 전통적 한(恨)의 계승 관점 키워드 꼭 들어가야 하나요?',
    authorId: 'user-external-minji',
    authorName: '강민지',
    authorGrade: 2,
    schoolId: 'school-gyeonggi-girls',
    schoolName: '경기여자고등학교',
    targetGrade: 2,
    subject: '국어',
    teacherName: '정수경 선생님',
    examScope: '문학 2단원 서정 갈래의 흐름 (가시리, 진달래꽃, 제망매가)',
    difficulty: '서술형대비',
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    status: 'open',
    likes: 5,
    views: 43,
    tags: ['정수경쌤', '가시리', '경기여고국어'],
    answers: []
  }
];

// Exam Bank Archive
const examBankItems: ExamBankItem[] = [
  {
    id: 'eb-1',
    schoolId: 'school-seoul-high',
    schoolName: '서울고등학교',
    year: 2025,
    semester: '1학기 중간고사',
    subject: '수학1',
    grade: 1,
    teacherName: '김영훈 선생님',
    difficultyRating: '최상',
    trendSummary: '부교재 p.50~65 단원 심화 변형 4문항 출제. 서술형 단위원 동경 각도 미표기 감점 다수 발생.',
    killerTopics: ['서술형 2번 삼각함수 치환 범위', '단답형 3번 지수로그 부등식 정수해 격자점'],
    downloadCount: 384,
    verifiedBySeniors: true
  },
  {
    id: 'eb-2',
    schoolId: 'school-seoul-high',
    schoolName: '서울고등학교',
    year: 2025,
    semester: '1학기 중간고사',
    subject: '영어',
    grade: 1,
    teacherName: '박선희 선생님',
    difficultyRating: '상',
    trendSummary: '수능특강 라이트 6강, 8강 중심 어휘 변형 35%. 주제문 빈칸에 고난도 파생어 출제.',
    killerTopics: ['어법 14번 분사구문 부정어 도치', '서술형 1번 조건 영작 (사역동사 목적격 보어)'],
    downloadCount: 295,
    verifiedBySeniors: true
  },
  {
    id: 'eb-3',
    schoolId: 'school-seoul-high',
    schoolName: '서울고등학교',
    year: 2025,
    semester: '2학기 기말고사',
    subject: '물리학1',
    grade: 2,
    teacherName: '이성우 선생님',
    difficultyRating: '상',
    trendSummary: '역학적 에너지 보존과 충격량 복합 문항. 그래프 축 단위 cm/s 변환 낚시 주의.',
    killerTopics: ['객관식 17번 마찰 구간을 지나는 빗면 물체', '보기 ㄷ단위 환산 함정'],
    downloadCount: 218,
    verifiedBySeniors: true
  }
];

// Chat rooms
let chatRooms: ChatRoom[] = [
  {
    id: 'room-1',
    schoolId: 'school-seoul-high',
    reason: 'adopted_qa',
    relatedQuestionId: 'q-101',
    relatedQuestionTitle: '[수학1] 김영훈 쌤 삼각방정식 서술형 감점 기준',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    lastMessage: '선배님 덕분에 채점 기준 확실히 잡혔습니다! 혹시 작년 기출 부교재 프린트도 있으신가요?',
    lastMessageAt: new Date(Date.now() - 3600000 * 1).toISOString(),
    unreadCount: 0,
    isStudyTimerActive: false,
    participants: [
      {
        userId: 'user-me',
        name: '김민우',
        grade: 1,
        schoolId: 'school-seoul-high',
        schoolName: '서울고등학교',
        isSenior: false,
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        badgeTitle: '1학년 질문자'
      },
      {
        userId: 'user-senior-seojun',
        name: '박서준 선배',
        grade: 2,
        schoolId: 'school-seoul-high',
        schoolName: '서울고등학교',
        isSenior: true,
        avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
        badgeTitle: '채택된 2학년 수학 멘토'
      }
    ]
  }
];

let chatMessages: ChatMessage[] = [
  {
    id: 'msg-1',
    roomId: 'room-1',
    senderId: 'user-senior-seojun',
    senderName: '박서준 선배',
    text: '채택 감사합니다 민우 후배님! 김영훈 쌤 수학 시험 준비하면서 서술형이나 킬러 문항 막히는 거 있으면 편하게 여기로 물어보세요 👍\n작년 제가 필기해둔 손글씨 풀이 노트 첨부해둘게요!',
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
    isRead: true,
    attachmentType: 'photo_solution',
    attachmentData: {
      url: 'https://images.unsplash.com/photo-1596495578065-6e0763fa1178?w=600&auto=format&fit=crop&q=80',
      title: '박서준 선배의 2025 김영훈 쌤 서술형 풀이 만점 노트',
      caption: '단위원 동경 각도 및 -1 ≤ t ≤ 1 치환 명시 필수!'
    },
    quickAction: {
      type: 'congrats_adopt',
      payload: 'Q&A 채택으로 연결된 1:1 공부 멘토링 방입니다. (동일 학교 안전 인증 완료)'
    }
  },
  {
    id: 'msg-2',
    roomId: 'room-1',
    senderId: 'user-me',
    senderName: '김민우',
    text: '선배님 덕분에 채점 기준 확실히 잡혔습니다! 혹시 작년 기출 부교재 프린트도 있으신가요?',
    timestamp: new Date(Date.now() - 3600000 * 1).toISOString(),
    isRead: true
  }
];

let friends: FriendRelation[] = [
  {
    userId: 'user-me',
    friendId: 'user-peer-yuna',
    friendName: '최유나',
    friendGrade: 1,
    schoolId: 'school-seoul-high',
    schoolName: '서울고등학교',
    status: 'friend',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    isSenior: false,
    badgeTitle: '1학년 동급생'
  },
  {
    userId: 'user-me',
    friendId: 'user-senior-seojun',
    friendName: '박서준 선배',
    friendGrade: 2,
    schoolId: 'school-seoul-high',
    schoolName: '서울고등학교',
    status: 'friend',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    isSenior: true,
    badgeTitle: '2학년 수학 1등급 멘토'
  }
];

let blockedUserIds: string[] = [];
let reports: ReportItem[] = [];

// SSE Clients set
const sseClients = new Set<{ userId: string; res: Response }>();

function broadcastChatEvent(event: { type: string; roomId: string; message?: ChatMessage; room?: ChatRoom }) {
  for (const client of sseClients) {
    try {
      client.res.write(`data: ${JSON.stringify(event)}\n\n`);
    } catch {
      sseClients.delete(client);
    }
  }
}

// --- REST API ENDPOINTS ---

// 1. School & User
app.get('/api/schools', (_req: Request, res: Response) => {
  res.json({ success: true, schools });
});

// Download full project source zip with CORS headers
app.get('/api/download-zip', (_req: Request, res: Response) => {
  const zipPath = path.resolve(__dirname, 'schoolchat.zip');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/zip');
  res.setHeader('Content-Disposition', 'attachment; filename="schoolchat.zip"');
  res.sendFile(zipPath);
});

// Direct GitHub Push Endpoint using Personal Access Token
app.post('/api/git/push', async (req: Request, res: Response) => {
  const { token, repoUrl } = req.body;
  if (!token || !token.trim()) {
    return res.status(400).json({ success: false, error: 'GitHub Personal Access Token을 입력해주세요.' });
  }

  const rawRepo = repoUrl && repoUrl.trim() ? repoUrl.trim() : 'https://github.com/wryi0520/schoolchat.git';
  const repoWithoutProtocol = rawRepo.replace(/^https?:\/\//, '').replace(/^git@github\.com:/, 'github.com/');
  const authenticatedUrl = `https://${token.trim()}@${repoWithoutProtocol}`;

  try {
    // Ensure all current changes are committed
    await execPromise('git config user.name "wryi0520" && git config user.email "wryi0520@gmail.com"');
    await execPromise('git add .');
    try {
      await execPromise('git commit -m "feat: Update SchoolQ project codebase"');
    } catch {
      // nothing new to commit
    }
    await execPromise(`git remote set-url origin "${authenticatedUrl}"`);
    const { stdout, stderr } = await execPromise('git push -u origin main');

    res.json({
      success: true,
      message: 'GitHub(https://github.com/wryi0520/schoolchat)에 코드가 성공적으로 업로드(Push)되었습니다! 🎉',
      stdout,
      stderr
    });
  } catch (err: any) {
    console.error('Git push error:', err);
    res.status(500).json({
      success: false,
      error: `GitHub 푸시 실패: ${err.message || '인증 정보 또는 저장소 권한을 확인해주세요.'}`
    });
  }
});

let currentUserId = 'user-me';

app.get('/api/users/current', (_req: Request, res: Response) => {
  const user = users.find(u => u.id === currentUserId) || users[0];
  res.json({ success: true, user });
});

app.post('/api/users/switch', (req: Request, res: Response) => {
  const { userId } = req.body;
  const found = users.find(u => u.id === userId);
  if (found) {
    currentUserId = found.id;
    return res.json({ success: true, user: found });
  }
  res.status(404).json({ success: false, error: 'User not found' });
});

// Student ID OCR Simulation Verification
app.post('/api/users/ocr-verify', (req: Request, res: Response) => {
  const { schoolId, grade, classNum, studentName, studentCode } = req.body;
  const user = users.find(u => u.id === currentUserId) || users[0];
  const targetSchool = schools.find(s => s.id === schoolId) || schools[0];

  user.schoolId = targetSchool.id;
  user.schoolName = targetSchool.name;
  user.grade = Number(grade) || user.grade;
  user.classNum = Number(classNum) || user.classNum;
  if (studentName) user.name = studentName;
  user.isVerified = true;
  user.badgeTitle = `${targetSchool.name} 학생증 OCR 공식 인증완료 🛡️`;

  res.json({
    success: true,
    message: `[학생증 OCR 판독 완료] ${targetSchool.name} ${user.grade}학년 ${user.classNum}반 (${user.name}) 학생 인증이 승인되었습니다.`,
    user
  });
});

app.post('/api/users/verify-school', (req: Request, res: Response) => {
  const { schoolId, grade, classNum } = req.body;
  const user = users.find(u => u.id === currentUserId);
  const targetSchool = schools.find(s => s.id === schoolId);
  if (!user || !targetSchool) {
    return res.status(400).json({ success: false, error: '유효하지 않은 학교 또는 사용자입니다.' });
  }

  user.schoolId = targetSchool.id;
  user.schoolName = targetSchool.name;
  user.grade = Number(grade) || user.grade;
  user.classNum = Number(classNum) || user.classNum;
  user.isVerified = true;
  user.badgeTitle = `${targetSchool.name} ${user.grade}학년 인증완료`;

  res.json({
    success: true,
    message: `${targetSchool.name} 학생 인증이 정상 처리되었습니다.`,
    user
  });
});

// 2. Questions Q&A Board
app.get('/api/questions', (req: Request, res: Response) => {
  const { schoolId, grade, subject, status, search } = req.query;

  let filtered = [...questions];

  // Filter blocked authors
  filtered = filtered.filter(q => !blockedUserIds.includes(q.authorId));

  if (schoolId) {
    filtered = filtered.filter(q => q.schoolId === schoolId);
  }

  if (grade && grade !== 'all') {
    const gradeNum = parseInt(grade as string, 10);
    if (!isNaN(gradeNum)) {
      filtered = filtered.filter(q => q.targetGrade === gradeNum);
    }
  }

  if (subject && subject !== 'all') {
    filtered = filtered.filter(q => q.subject === subject);
  }

  if (status && status !== 'all') {
    filtered = filtered.filter(q => q.status === status);
  }

  if (search) {
    const qTerm = (search as string).toLowerCase();
    filtered = filtered.filter(q =>
      q.title.toLowerCase().includes(qTerm) ||
      q.content.toLowerCase().includes(qTerm) ||
      q.teacherName.toLowerCase().includes(qTerm) ||
      q.examScope.toLowerCase().includes(qTerm) ||
      q.tags.some(t => t.toLowerCase().includes(qTerm))
    );
  }

  filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  res.json({ success: true, questions: filtered });
});

app.get('/api/questions/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const q = questions.find(item => item.id === id);
  if (!q) {
    return res.status(404).json({ success: false, error: '질문을 찾을 수 없습니다.' });
  }
  const sanitized = {
    ...q,
    answers: q.answers.filter(a => !blockedUserIds.includes(a.authorId))
  };
  res.json({ success: true, question: sanitized });
});

app.post('/api/questions', async (req: Request, res: Response) => {
  const { title, content, targetGrade, subject, teacherName, examScope, difficulty, tags, photoUrl, formulaLatex } = req.body;
  const currentUser = users.find(u => u.id === currentUserId) || users[0];

  if (!title || !content) {
    return res.status(400).json({ success: false, error: '제목과 내용을 입력해주세요.' });
  }

  // Profanity check
  const maskedTitle = maskProfanity(title).sanitized;
  const maskedContent = maskProfanity(content).sanitized;

  const school = schools.find(s => s.id === currentUser.schoolId) || schools[0];
  const qId = `q-${Date.now()}`;

  const newQ: Question = {
    id: qId,
    title: maskedTitle,
    content: maskedContent,
    authorId: currentUser.id,
    authorName: currentUser.name,
    authorGrade: currentUser.grade,
    schoolId: currentUser.schoolId,
    schoolName: currentUser.schoolName,
    targetGrade: Number(targetGrade) || currentUser.grade,
    subject: subject || '수학',
    teacherName: teacherName || `${subject} 담당 선생님`,
    examScope: examScope || '이번 시험 범위',
    difficulty: difficulty || '내신빈출',
    createdAt: new Date().toISOString(),
    status: 'open',
    likes: 0,
    views: 1,
    photoUrl: photoUrl || undefined,
    formulaLatex: formulaLatex || undefined,
    tags: Array.isArray(tags) ? tags : ['내신대비', teacherName || '담당쌤'],
    answers: []
  };

  // Generate AI hint with Gemini
  if (ai) {
    try {
      const prompt = `당신은 ${school.name}의 AI 학습 멘토이자 내신 시험 분석관입니다.
학생 질문:
- 학교: ${school.name}
- 과목: ${newQ.subject}
- 담당 선생님: ${newQ.teacherName}
- 시험 범위: ${newQ.examScope}
- 질문 제목: ${newQ.title}
- 질문 내용: ${newQ.content}
- 수식(있을경우): ${newQ.formulaLatex || '없음'}

다음 항목을 한국어로 정갈하고 간결하게 2~3줄씩 작성하여 JSON으로 반환하세요.
{
  "teacherAnalysis": "선생님의 출제 경향 분석 및 서술형 감점 요인 (실제 교사 스타일 반영)",
  "stepHint": "정답을 직접 스포하지 않고 혼자 풀 수 있도록 유도하는 3단계 논리적 사고 흐름",
  "trapAlert": "학생들이 가장 많이 실수하는 함정 선지 또는 계산/부호/단위 오류 경고",
  "similarExamConcept": "과거 우리 학교 및 수능/모의평가 연계 유사 기출 개념 1줄 요약"
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: { responseMimeType: 'application/json' }
      });

      if (response && response.text) {
        const parsed = JSON.parse(response.text);
        newQ.aiHint = {
          teacherAnalysis: parsed.teacherAnalysis || `${newQ.teacherName}의 출제 경향을 반영한 맞춤 분석입니다.`,
          stepHint: parsed.stepHint || '개념 정의를 확인하고 조건에 맞는 식을 세워보세요.',
          trapAlert: parsed.trapAlert || '부호 실수와 단위 누락에 유의하세요.',
          similarExamConcept: parsed.similarExamConcept || `${school.name} 기출 변형 포인트`
        };
      }
    } catch (err) {
      console.warn('Gemini AI Hint generation fallback:', err);
    }
  }

  if (!newQ.aiHint) {
    newQ.aiHint = {
      teacherAnalysis: `${school.name} ${newQ.teacherName}의 시험 스타일은 개념 원리 유도와 서술형 부분 감점이 철저합니다. 교과서 날개 질문과 부교재 변형 문항을 필수 복습하세요.`,
      stepHint: `1단계: ${newQ.examScope} 핵심 공식 및 정의 확인 -> 2단계: 문제 조건에서 주어진 제한 범위 설정 -> 3단계: 답안 도출 후 역산 검토.`,
      trapAlert: '서술형 작성 시 단위 누락, 부호 반전, 치환 변수 범위 미작성으로 인한 감점을 조심하세요.',
      similarExamConcept: `${school.name} 역대 중간고사 서술형 빈출 변형 유형`
    };
  }

  questions.unshift(newQ);
  currentUser.points += 10;

  res.json({ success: true, question: newQ });
});

// Answer question
app.post('/api/questions/:id/answers', (req: Request, res: Response) => {
  const { id } = req.params;
  const { content, teacherTip, stepGuide, handwrittenPhoto, formulaLatex } = req.body;
  const currentUser = users.find(u => u.id === currentUserId) || users[0];

  const q = questions.find(item => item.id === id);
  if (!q) {
    return res.status(404).json({ success: false, error: '질문이 존재하지 않습니다.' });
  }

  if (q.schoolId !== currentUser.schoolId) {
    return res.status(403).json({
      success: false,
      error: `같은 학교(${q.schoolName}) 학생만 이 질문에 답변할 수 있습니다.`
    });
  }

  const { sanitized: cleanContent } = maskProfanity(content);
  const isSenior = currentUser.grade > q.targetGrade;
  const ansId = `ans-${Date.now()}`;
  const newAnswer: Answer = {
    id: ansId,
    questionId: q.id,
    authorId: currentUser.id,
    authorName: isSenior ? `${currentUser.name} 선배` : currentUser.name,
    authorGrade: currentUser.grade,
    authorSchoolId: currentUser.schoolId,
    authorSchoolName: currentUser.schoolName,
    isSenior,
    content: cleanContent,
    createdAt: new Date().toISOString(),
    isAdopted: false,
    upvotes: 0,
    teacherTip: teacherTip || undefined,
    stepGuide: stepGuide || undefined,
    handwrittenPhoto: handwrittenPhoto || undefined,
    formulaLatex: formulaLatex || undefined
  };

  q.answers.push(newAnswer);
  currentUser.points += 20;

  res.json({ success: true, answer: newAnswer, question: q });
});

// Adopt answer
app.post('/api/questions/:id/adopt', (req: Request, res: Response) => {
  const { id } = req.params;
  const { answerId } = req.body;
  const currentUser = users.find(u => u.id === currentUserId) || users[0];

  const q = questions.find(item => item.id === id);
  if (!q) {
    return res.status(404).json({ success: false, error: '질문이 없습니다.' });
  }

  if (q.authorId !== currentUser.id) {
    return res.status(403).json({ success: false, error: '질문 작성자만 답변을 채택할 수 있습니다.' });
  }

  const ans = q.answers.find(a => a.id === answerId);
  if (!ans) {
    return res.status(404).json({ success: false, error: '채택할 답변이 없습니다.' });
  }

  q.status = 'adopted';
  q.adoptedAnswerId = ans.id;
  ans.isAdopted = true;

  currentUser.points += 15;
  const answerer = users.find(u => u.id === ans.authorId);
  if (answerer) {
    answerer.points += 50;
    answerer.adoptedCount += 1;
  }

  // Open 1:1 chat room automatically
  let room = chatRooms.find(
    r =>
      r.schoolId === q.schoolId &&
      r.participants.some(p => p.userId === currentUser.id) &&
      r.participants.some(p => p.userId === ans.authorId)
  );

  if (!room) {
    const roomId = `room-${Date.now()}`;
    room = {
      id: roomId,
      schoolId: q.schoolId,
      reason: 'adopted_qa',
      relatedQuestionId: q.id,
      relatedQuestionTitle: q.title,
      createdAt: new Date().toISOString(),
      lastMessage: `[채택 완료] "${q.title}" 질문 답변 채택으로 1:1 공부 멘토링 방이 활성화되었습니다!`,
      lastMessageAt: new Date().toISOString(),
      unreadCount: 0,
      participants: [
        {
          userId: currentUser.id,
          name: currentUser.name,
          grade: currentUser.grade,
          schoolId: currentUser.schoolId,
          schoolName: currentUser.schoolName,
          isSenior: false,
          avatar: currentUser.avatar,
          badgeTitle: `${currentUser.grade}학년 질문자`
        },
        {
          userId: ans.authorId,
          name: ans.authorName,
          grade: ans.authorGrade,
          schoolId: ans.authorSchoolId,
          schoolName: ans.authorSchoolName,
          isSenior: ans.isSenior,
          avatar: answerer?.avatar || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
          badgeTitle: `채택된 ${ans.isSenior ? '선배 멘토' : '동급생'}`
        }
      ]
    };
    chatRooms.unshift(room);

    const initMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      roomId: room.id,
      senderId: 'system',
      senderName: '스쿨큐 시스템',
      text: `🎉 질문이 채택되어 1:1 대화가 연결되었습니다! 같은 ${currentUser.schoolName} 학우 간 안전하게 시험 팁과 풀이를 자유롭게 이어가보세요.`,
      timestamp: new Date().toISOString(),
      isRead: false,
      quickAction: {
        type: 'congrats_adopt',
        payload: `채택된 질문: ${q.title}`
      }
    };
    chatMessages.push(initMsg);
    broadcastChatEvent({ type: 'NEW_ROOM', roomId: room.id, room });
  }

  res.json({
    success: true,
    message: '답변이 성공적으로 채택되었습니다! 1:1 대화방이 활성화되었습니다.',
    question: q,
    chatRoomId: room.id
  });
});

// AI Teacher Rubric Grader: Grades a draft student answer against the teacher's strict criteria
app.post('/api/ai/rubric-grader', async (req: Request, res: Response) => {
  const { questionId, studentDraft } = req.body;
  const q = questions.find(item => item.id === questionId);
  const teacherName = q?.teacherName || '김영훈 선생님';
  const schoolName = q?.schoolName || '서울고등학교';
  const subject = q?.subject || '수학';

  if (!studentDraft || !studentDraft.trim()) {
    return res.status(400).json({ success: false, error: '채점할 서술형 풀이를 입력해주세요.' });
  }

  if (ai) {
    try {
      const prompt = `당신은 ${schoolName}의 깐깐한 내신 출제자 "${teacherName}"입니다.
과목: ${subject}
질문 제목: ${q?.title || '서술형 문제'}
질문 내용: ${q?.content || '풀이 과정 서술'}
선생님 출제 스타일: 서술형 풀이과정 기호 생략 시 1~2점 감점 엄격함. 조건 정의, 단위, 치환 변수 범위 누락 철저 감점.

학생이 제출한 답안 초안:
"""
${studentDraft}
"""

10점 만점 기준으로 채점하여 다음 JSON 형식으로 반환하세요:
{
  "score": 7,
  "totalPoints": 10,
  "teacherStyleApplied": "${teacherName}의 채점 기준표(감점 요인 엄격 적용)",
  "deductions": [
    {
      "pointsLost": 1,
      "reason": "감점 사유 (예: 치환 변수 t에 대해 -1 ≤ t ≤ 1 범위 미작성)",
      "strictRule": "선생님 필수 서술 규칙"
    }
  ],
  "modelAnswer": "선생님이 만점(10점)을 줄 수 있는 완벽한 서술형 모범 답안",
  "feedbackSummary": "시험장에서 감점을 피하기 위한 2줄 총평"
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: { responseMimeType: 'application/json' }
      });

      if (response && response.text) {
        const parsed: TeacherRubricResult = JSON.parse(response.text);
        return res.json({ success: true, result: parsed });
      }
    } catch (err) {
      console.warn('AI rubric grading error:', err);
    }
  }

  // High quality fallback rubric
  const fallbackResult: TeacherRubricResult = {
    score: 8,
    totalPoints: 10,
    teacherStyleApplied: `${teacherName} 2026학년도 1차 지필평가 서술형 채점 기준표`,
    deductions: [
      {
        pointsLost: 1,
        reason: '치환 변수 정의역 (-1 ≤ t ≤ 1) 범위 서술 누락',
        strictRule: '치환 시 새로운 변수의 범위를 풀이 첫 단계에 명시해야 함.'
      },
      {
        pointsLost: 1,
        reason: '단위 또는 동경 사분면 조건 검산 과정 생략',
        strictRule: '구한 해가 문제의 원래 제한 범위에 속하는지 검산 단계를 생략함.'
      }
    ],
    modelAnswer: `[모범 풀이]\n1) 주어진 각의 범위: 0 ≤ x < 2π\n2) t = cos x 로 치환하면 -1 ≤ t ≤ 1 이다.\n3) 2(1 - t²) - 3t = 0 ⇒ 2t² + 3t - 2 = 0 ⇒ (2t - 1)(t + 2) = 0\n4) -1 ≤ t ≤ 1 이므로 t = 1/2 (t = -2 는 제외)\n5) cos x = 1/2 이므로 x = π/3 또는 x = 5π/3 이다.`,
    feedbackSummary: '개념 유도와 인수분해는 훌륭하나, 치환 변수의 범위와 근의 배제 사유를 명시해야 감점 없이 10점 만점을 받습니다.'
  };

  res.json({ success: true, result: fallbackResult });
});

// AI Exam Killer Preview: predicts top 3 killer question styles for the school's exam period
app.post('/api/ai/exam-killer-preview', async (req: Request, res: Response) => {
  const { schoolId, subject, grade, teacherName } = req.body;
  const school = schools.find(s => s.id === schoolId) || schools[0];

  if (ai) {
    try {
      const prompt = `당신은 ${school.name}의 선배 멘토 출신 수석 튜터입니다.
- 학교: ${school.name}
- 과목: ${subject || '수학'}
- 학년: ${grade || 1}학년
- 선생님: ${teacherName || '김영훈 선생님'}

이번 중간고사에서 출제될 확률 90% 이상인 킬러/변형 유형 3가지를 예측하여 JSON으로 반환하세요:
{
  "examScopeSummary": "핵심 출제 단원 및 부교재 연계 포인트",
  "killerQuestions": [
    {
      "rank": 1,
      "title": "킬러 예상 유형 1",
      "pitfall": "학생 80%가 낚이는 오답 함정",
      "seniorSecret": "선배만의 30초 풀이 공략법"
    },
    {
      "rank": 2,
      "title": "킬러 예상 유형 2",
      "pitfall": "서술형 감점 요소",
      "seniorSecret": "부분점수 확보 팁"
    },
    {
      "rank": 3,
      "title": "킬러 예상 유형 3",
      "pitfall": "시간 부족 유발 포인트",
      "seniorSecret": "검산 테크닉"
    }
  ]
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: { responseMimeType: 'application/json' }
      });

      if (response && response.text) {
        return res.json({ success: true, preview: JSON.parse(response.text) });
      }
    } catch (err) {
      console.warn('AI Exam killer preview error:', err);
    }
  }

  // Fallback
  res.json({
    success: true,
    preview: {
      examScopeSummary: `${school.name} ${teacherName} 출제 파트: 부교재 42~65p 삼각함수와 지수로그 복합 킬러`,
      killerQuestions: [
        {
          rank: 1,
          title: '삼각방정식과 절댓값 함수의 교점 개수 (단답형 3번 빈출)',
          pitfall: '동경 주기성과 대칭축(x = π) 반영 누락',
          seniorSecret: '단위원을 그리고 동경 교점을 대칭성으로 묶어 합을 구하면 30초 내 해결!'
        },
        {
          rank: 2,
          title: '치환 후 이차방정식 근의 분리 서술형',
          pitfall: '판별식만 쓰고 경계값 f(-1), f(1) 부호와 축의 위치 생략 시 3점 감점',
          seniorSecret: '판·축·경 3종 세트 머리글자로 서술형 줄바꿈 맞춰 적기'
        },
        {
          rank: 3,
          title: '교재 외부 연계 신유형 모의고사 변형',
          pitfall: '수식 계산량 과다로 후반부 마킹 시간 부족',
          seniorSecret: '특수각 직각삼각형 비례(1:2:√3) 먼저 체크 후 일반해 유도'
        }
      ]
    }
  });
});

// 3. Exam Bank Archive Endpoint
app.get('/api/exam-bank', (req: Request, res: Response) => {
  const { schoolId } = req.query;
  const filtered = schoolId
    ? examBankItems.filter(item => item.schoolId === schoolId)
    : examBankItems;
  res.json({ success: true, items: filtered });
});

// 4. Mentor Leaderboard
app.get('/api/mentors/ranking', (_req: Request, res: Response) => {
  const currentUser = users.find(u => u.id === currentUserId) || users[0];
  const schoolUsers = users
    .filter(u => u.schoolId === currentUser.schoolId)
    .sort((a, b) => b.adoptedCount - a.adoptedCount || b.points - a.points);
  res.json({ success: true, mentors: schoolUsers });
});

// 5. Chat Server Endpoints
app.get('/api/chat/rooms', (_req: Request, res: Response) => {
  const currentUser = users.find(u => u.id === currentUserId) || users[0];
  const userRooms = chatRooms.filter(r => {
    const isParticipant = r.participants.some(p => p.userId === currentUser.id);
    const isSameSchool = r.schoolId === currentUser.schoolId;
    return isParticipant && isSameSchool;
  });
  res.json({ success: true, rooms: userRooms });
});

app.post('/api/chat/rooms', (req: Request, res: Response) => {
  const { targetUserId, reason, relatedQuestionId } = req.body;
  const currentUser = users.find(u => u.id === currentUserId) || users[0];
  const targetUser = users.find(u => u.id === targetUserId);

  if (!targetUser) {
    return res.status(404).json({ success: false, error: '대화 상대를 찾을 수 없습니다.' });
  }

  // Safety constraint: same school only
  if (currentUser.schoolId !== targetUser.schoolId) {
    return res.status(403).json({
      success: false,
      error: `[안전 보안 규칙] 타학교 학생과는 1:1 대화가 제한됩니다. (${currentUser.schoolName} 재학생만 가능)`
    });
  }

  if (blockedUserIds.includes(targetUserId)) {
    return res.status(403).json({ success: false, error: '차단된 사용자와는 대화할 수 없습니다.' });
  }

  let room = chatRooms.find(
    r =>
      r.schoolId === currentUser.schoolId &&
      r.participants.some(p => p.userId === currentUser.id) &&
      r.participants.some(p => p.userId === targetUser.id)
  );

  if (room) {
    return res.json({ success: true, room });
  }

  const roomId = `room-${Date.now()}`;
  room = {
    id: roomId,
    schoolId: currentUser.schoolId,
    reason: reason || 'friend',
    relatedQuestionId,
    createdAt: new Date().toISOString(),
    lastMessage: '대화방이 생성되었습니다.',
    lastMessageAt: new Date().toISOString(),
    unreadCount: 0,
    isStudyTimerActive: false,
    participants: [
      {
        userId: currentUser.id,
        name: currentUser.name,
        grade: currentUser.grade,
        schoolId: currentUser.schoolId,
        schoolName: currentUser.schoolName,
        isSenior: currentUser.grade > targetUser.grade,
        avatar: currentUser.avatar
      },
      {
        userId: targetUser.id,
        name: targetUser.name,
        grade: targetUser.grade,
        schoolId: targetUser.schoolId,
        schoolName: targetUser.schoolName,
        isSenior: targetUser.grade > currentUser.grade,
        avatar: targetUser.avatar
      }
    ]
  };

  chatRooms.unshift(room);
  broadcastChatEvent({ type: 'NEW_ROOM', roomId: room.id, room });

  res.json({ success: true, room });
});

app.get('/api/chat/rooms/:roomId/messages', (req: Request, res: Response) => {
  const { roomId } = req.params;
  const currentUser = users.find(u => u.id === currentUserId) || users[0];

  const room = chatRooms.find(r => r.id === roomId);
  if (!room) {
    return res.status(404).json({ success: false, error: '채팅방을 찾을 수 없습니다.' });
  }

  const isParticipant = room.participants.some(p => p.userId === currentUser.id);
  if (!isParticipant || room.schoolId !== currentUser.schoolId) {
    return res.status(403).json({ success: false, error: '해당 대화방에 접근 권한이 없습니다.' });
  }

  const msgs = chatMessages.filter(m => m.roomId === roomId);
  res.json({ success: true, messages: msgs, room });
});

// Toggle study timer in chat room
app.post('/api/chat/rooms/:roomId/study-timer', (req: Request, res: Response) => {
  const { roomId } = req.params;
  const currentUser = users.find(u => u.id === currentUserId) || users[0];
  const room = chatRooms.find(r => r.id === roomId);
  if (!room) return res.status(404).json({ success: false, error: '채팅방이 없습니다.' });

  room.isStudyTimerActive = !room.isStudyTimerActive;

  const timerMsg: ChatMessage = {
    id: `msg-${Date.now()}`,
    roomId,
    senderId: 'system',
    senderName: '스쿨큐 스터디 타이머',
    text: room.isStudyTimerActive
      ? `⏱️ ${currentUser.name} 님이 '25분 함께 집중 공부 뽀모도로' 타이머를 시작했습니다! 열공 모드 가동 중 📚`
      : `⏱️ 스터디 집중 타이머가 종료되었습니다. 수고 많으셨습니다!`,
    timestamp: new Date().toISOString(),
    isRead: false,
    attachmentType: 'study_timer',
    attachmentData: {
      durationSeconds: room.isStudyTimerActive ? 1500 : 0,
      title: room.isStudyTimerActive ? '25분 집중 공부 중' : '스터디 완료'
    }
  };

  chatMessages.push(timerMsg);
  room.lastMessage = timerMsg.text;
  room.lastMessageAt = timerMsg.timestamp;

  broadcastChatEvent({ type: 'NEW_MESSAGE', roomId, message: timerMsg });

  res.json({ success: true, isStudyTimerActive: room.isStudyTimerActive, message: timerMsg });
});

// Send Chat Message with rich attachments (photo solution, math formula, etc.)
app.post('/api/chat/rooms/:roomId/messages', async (req: Request, res: Response) => {
  const { roomId } = req.params;
  const { text, attachmentType, attachmentData } = req.body;
  const currentUser = users.find(u => u.id === currentUserId) || users[0];

  if ((!text || !text.trim()) && !attachmentData) {
    return res.status(400).json({ success: false, error: '메시지 또는 첨부 데이터를 입력해주세요.' });
  }

  const room = chatRooms.find(r => r.id === roomId);
  if (!room) {
    return res.status(404).json({ success: false, error: '채팅방을 찾을 수 없습니다.' });
  }

  const isParticipant = room.participants.some(p => p.userId === currentUser.id);
  if (!isParticipant || room.schoolId !== currentUser.schoolId) {
    return res.status(403).json({ success: false, error: '메시지 전송 권한이 없습니다.' });
  }

  const targetParticipant = room.participants.find(p => p.userId !== currentUser.id);
  if (targetParticipant && blockedUserIds.includes(targetParticipant.userId)) {
    return res.status(403).json({ success: false, error: '차단된 대상에게 메시지를 보낼 수 없습니다.' });
  }

  const { sanitized: cleanText } = maskProfanity(text || '');

  const msgId = `msg-${Date.now()}`;
  const newMsg: ChatMessage = {
    id: msgId,
    roomId,
    senderId: currentUser.id,
    senderName: currentUser.name,
    text: cleanText,
    timestamp: new Date().toISOString(),
    isRead: false,
    attachmentType: attachmentType || undefined,
    attachmentData: attachmentData || undefined
  };

  chatMessages.push(newMsg);
  room.lastMessage = newMsg.text || (newMsg.attachmentType === 'photo_solution' ? '📷 손글씨 풀이 사진' : '📐 수학 공식 첨부');
  room.lastMessageAt = newMsg.timestamp;

  broadcastChatEvent({ type: 'NEW_MESSAGE', roomId, message: newMsg });

  res.json({ success: true, message: newMsg });

  // Natural Senior / Peer Simulation Reply
  if (targetParticipant && targetParticipant.userId !== currentUser.id && targetParticipant.userId.startsWith('user-')) {
    setTimeout(async () => {
      let replyText = '';
      const isSenior = targetParticipant.isSenior;

      if (ai) {
        try {
          const prompt = `당신은 ${room.schoolId}의 ${isSenior ? '친절하고 듬직한 선배 공부 멘토' : '같은 학년 친구'} "${targetParticipant.name}"입니다.
후배/친구가 1:1 채팅으로 다음 질문이나 풀이 메시지를 보냈습니다:
"${newMsg.text}"

규칙:
1. 현실적인 한국 고등학생 말투 (존댓말 또는 선배의 친절한 어투, "ㅎㅎ", "!", "파이팅", 이모지 약간)
2. 우리 학교 내신 시험(김영훈 쌤, 박선희 쌤, 이성우 쌤 등) 출제 성향이나 풀이 공식에 도움이 되는 실질적인 1~2문장 답변
3. 50자~120자 내외로 간결하게 작성`;

          const aiReply = await ai.models.generateContent({
            model: 'gemini-3.8-flash',
            contents: prompt
          });
          if (aiReply && aiReply.text) {
            replyText = aiReply.text.trim();
          }
        } catch {
          // fallback
        }
      }

      if (!replyText) {
        const fallbacks = isSenior
          ? [
              '네 민우 후배님! 그 부분 작년 기출에서도 변형되어 나왔었어요. 부교재 3단원 연습문제도 꼭 같이 풀어보세요 파이팅!',
              '선생님 필기 노트 보니까 그 개념 서술형 2번 채점 기준으로 지정되어 있었어요. 공식 조건 빼먹지 마세요 ㅎㅎ',
              '시험 기간이라 바쁠 텐데 잘하고 있어요! 혹시 이해 안 되는 수식 풀이 있으면 언제든 또 톡 남겨줘요 👍'
            ]
          : [
              '나도 그 문제 방금 풀다가 막혔었는데 대박! 혹시 쌤이 준 보충 프린트 4페이지 공식 적용해봤어?',
              '우리 반 쌤도 그 부분 시험에 낸다고 강조하셨어! 오늘 야자 때 한번 같이 점검해보자 ㅎㅎ',
              '고마워! 내일 학교 쉬는 시간에 교실에서 같이 복습하자 파이팅 🔥'
            ];
        replyText = fallbacks[Math.floor(Math.random() * fallbacks.length)];
      }

      const autoReplyMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        roomId,
        senderId: targetParticipant.userId,
        senderName: targetParticipant.name,
        text: replyText,
        timestamp: new Date().toISOString(),
        isRead: false
      };

      chatMessages.push(autoReplyMsg);
      room.lastMessage = autoReplyMsg.text;
      room.lastMessageAt = autoReplyMsg.timestamp;

      broadcastChatEvent({ type: 'NEW_MESSAGE', roomId, message: autoReplyMsg });
    }, 1200);
  }
});

// SSE Stream
app.get('/api/chat/stream', (req: Request, res: Response) => {
  const userId = (req.query.userId as string) || currentUserId;

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  const client = { userId, res };
  sseClients.add(client);

  res.write(`data: ${JSON.stringify({ type: 'CONNECTED', userId })}\n\n`);

  req.on('close', () => {
    sseClients.delete(client);
  });
});

// 6. Friends API
app.get('/api/friends', (_req: Request, res: Response) => {
  const currentUser = users.find(u => u.id === currentUserId) || users[0];
  const list = friends.filter(f => f.userId === currentUser.id && f.schoolId === currentUser.schoolId);
  res.json({ success: true, friends: list });
});

app.post('/api/friends/request', (req: Request, res: Response) => {
  const { targetUserId } = req.body;
  const currentUser = users.find(u => u.id === currentUserId) || users[0];
  const targetUser = users.find(u => u.id === targetUserId);

  if (!targetUser) {
    return res.status(404).json({ success: false, error: '사용자를 찾을 수 없습니다.' });
  }

  if (currentUser.schoolId !== targetUser.schoolId) {
    return res.status(403).json({
      success: false,
      error: `친구 추가는 같은 학교(${currentUser.schoolName}) 학생끼리만 가능합니다.`
    });
  }

  const existing = friends.find(f => f.userId === currentUser.id && f.friendId === targetUserId);
  if (existing) {
    return res.json({ success: true, message: '이미 친구 관계이거나 요청되었습니다.', relation: existing });
  }

  const newRelation: FriendRelation = {
    userId: currentUser.id,
    friendId: targetUser.id,
    friendName: targetUser.name,
    friendGrade: targetUser.grade,
    schoolId: currentUser.schoolId,
    schoolName: currentUser.schoolName,
    status: 'friend',
    avatar: targetUser.avatar,
    isSenior: targetUser.grade > currentUser.grade,
    badgeTitle: targetUser.badgeTitle
  };

  friends.push(newRelation);
  res.json({ success: true, message: `${targetUser.name} 학우와 친구가 되었습니다!`, relation: newRelation });
});

// 7. Safety Moderation
app.post('/api/safety/report', (req: Request, res: Response) => {
  const { targetType, targetId, reason, details, targetAuthorName } = req.body;
  const currentUser = users.find(u => u.id === currentUserId) || users[0];

  const report: ReportItem = {
    id: `rep-${Date.now()}`,
    targetType,
    targetId,
    reporterId: currentUser.id,
    targetAuthorName: targetAuthorName || '게시자',
    reason: reason || '욕설/비방',
    details: details || '신고 접수',
    createdAt: new Date().toISOString()
  };

  reports.push(report);
  res.json({ success: true, message: '신고가 안전하게 접수되었습니다. 학교 운영진이 즉시 확인합니다.' });
});

app.post('/api/safety/block', (req: Request, res: Response) => {
  const { userId } = req.body;
  if (!userId) return res.status(400).json({ success: false, error: '차단할 대상 ID가 필요합니다.' });

  if (!blockedUserIds.includes(userId)) {
    blockedUserIds.push(userId);
  }

  res.json({
    success: true,
    message: '해당 사용자가 차단되었습니다. 게시물과 1:1 대화가 모두 숨김 처리됩니다.',
    blockedUserIds
  });
});

app.get('/api/safety/blocked', (_req: Request, res: Response) => {
  res.json({ success: true, blockedUserIds });
});

// Start Server
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`SchoolQ server running on http://localhost:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
});
