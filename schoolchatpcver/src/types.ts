export interface School {
  id: string;
  name: string;
  type: '고등학교' | '중학교';
  location: string;
  badgeColor: string;
  popularTeachers: {
    name: string;
    subject: string;
    styleDescription: string;
    examTips: string;
    pastKillerTopics?: string[];
  }[];
  currentExamPeriod: string;
  gradeLevels: number[];
  examDDay?: number;
}

export interface User {
  id: string;
  name: string;
  schoolId: string;
  schoolName: string;
  grade: number;
  classNum: number;
  role: 'student' | 'senior_mentor';
  isVerified: boolean;
  points: number;
  adoptedCount: number;
  avatar: string;
  badgeTitle?: string;
  statusMessage?: string;
  rank?: number;
  specialtySubject?: string;
}

export interface Answer {
  id: string;
  questionId: string;
  authorId: string;
  authorName: string;
  authorGrade: number;
  authorSchoolId: string;
  authorSchoolName: string;
  isSenior: boolean;
  content: string;
  createdAt: string;
  isAdopted: boolean;
  upvotes: number;
  teacherTip?: string;
  stepGuide?: string;
  handwrittenPhoto?: string;
  formulaLatex?: string;
}

export interface Question {
  id: string;
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  authorGrade: number;
  schoolId: string;
  schoolName: string;
  targetGrade: number;
  subject: '수학' | '국어' | '영어' | '과학' | '사회' | '정보/기타';
  teacherName: string;
  examScope: string;
  difficulty: '기본개념' | '내신빈출' | '킬러/심화' | '서술형대비';
  createdAt: string;
  status: 'open' | 'adopted';
  adoptedAnswerId?: string;
  answers: Answer[];
  likes: number;
  views: number;
  tags: string[];
  photoUrl?: string;
  formulaLatex?: string;
  aiHint?: {
    teacherAnalysis: string;
    stepHint: string;
    trapAlert: string;
    similarExamConcept?: string;
  };
}

export interface ChatParticipant {
  userId: string;
  name: string;
  grade: number;
  schoolId: string;
  schoolName: string;
  isSenior: boolean;
  avatar: string;
  badgeTitle?: string;
}

export interface ChatRoom {
  id: string;
  schoolId: string;
  participants: ChatParticipant[];
  reason: 'adopted_qa' | 'friend';
  relatedQuestionId?: string;
  relatedQuestionTitle?: string;
  lastMessage?: string;
  lastMessageAt?: string;
  unreadCount?: number;
  createdAt: string;
  isStudyTimerActive?: boolean;
}

export interface ChatMessage {
  id: string;
  roomId: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: string;
  isRead: boolean;
  attachmentType?: 'photo_solution' | 'math_formula' | 'voice_memo' | 'study_timer';
  attachmentData?: {
    url?: string;
    title?: string;
    caption?: string;
    latex?: string;
    durationSeconds?: number;
  };
  quickAction?: {
    type: 'study_tip' | 'exam_range' | 'congrats_adopt';
    payload: string;
  };
}

export interface FriendRelation {
  userId: string;
  friendId: string;
  friendName: string;
  friendGrade: number;
  schoolId: string;
  schoolName: string;
  status: 'friend' | 'pending_sent' | 'pending_received';
  avatar: string;
  isSenior: boolean;
  badgeTitle?: string;
}

export interface ReportItem {
  id: string;
  targetType: 'question' | 'answer' | 'chat_message' | 'user';
  targetId: string;
  reporterId: string;
  targetAuthorName: string;
  reason: '욕설/비방' | '시험부정행위/답안유출' | '불법홍보' | '타학교/사칭' | '기타';
  details: string;
  createdAt: string;
}

export interface TeacherRubricResult {
  score: number;
  totalPoints: number;
  teacherStyleApplied: string;
  deductions: {
    pointsLost: number;
    reason: string;
    strictRule: string;
  }[];
  modelAnswer: string;
  feedbackSummary: string;
}

export interface ExamBankItem {
  id: string;
  schoolId: string;
  schoolName: string;
  year: number;
  semester: string;
  subject: string;
  grade: number;
  teacherName: string;
  difficultyRating: '최상' | '상' | '중상' | '중';
  trendSummary: string;
  killerTopics: string[];
  downloadCount: number;
  verifiedBySeniors: boolean;
}
