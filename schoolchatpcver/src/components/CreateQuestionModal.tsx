import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  BookOpen, 
  GraduationCap, 
  HelpCircle, 
  Calculator,
  Image as ImageIcon
} from 'lucide-react';
import { School, User } from '../types.ts';
import { mathSnippets } from '../utils/soundAndMath.ts';

interface CreateQuestionModalProps {
  currentUser: User;
  currentSchool?: School;
  onClose: () => void;
  onSubmitQuestion: (data: {
    title: string;
    content: string;
    targetGrade: number;
    subject: '수학' | '국어' | '영어' | '과학' | '사회' | '정보/기타';
    teacherName: string;
    examScope: string;
    difficulty: '기본개념' | '내신빈출' | '킬러/심화' | '서술형대비';
    tags: string[];
    formulaLatex?: string;
    photoUrl?: string;
  }) => Promise<void>;
}

const subjects = ['수학', '국어', '영어', '과학', '사회', '정보/기타'] as const;
const difficulties = ['기본개념', '내신빈출', '킬러/심화', '서술형대비'] as const;

export const CreateQuestionModal: React.FC<CreateQuestionModalProps> = ({
  currentUser,
  currentSchool,
  onClose,
  onSubmitQuestion
}) => {
  const [subject, setSubject] = useState<'수학' | '국어' | '영어' | '과학' | '사회' | '정보/기타'>('수학');
  const [targetGrade, setTargetGrade] = useState<number>(currentUser.grade || 1);
  const [teacherName, setTeacherName] = useState<string>('');
  const [customTeacher, setCustomTeacher] = useState<string>('');
  const [examScope, setExamScope] = useState<string>('');
  const [difficulty, setDifficulty] = useState<'기본개념' | '내신빈출' | '킬러/심화' | '서술형대비'>('내신빈출');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [formulaLatex, setFormulaLatex] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const popularTeachers = currentSchool?.popularTeachers || [];

  const handleApplyPreset = (presetType: 'math' | 'physics' | 'english') => {
    if (presetType === 'math') {
      setSubject('수학');
      setTeacherName(popularTeachers[0]?.name || '김영훈 선생님');
      setExamScope('수학1 2단원 삼각함수의 그래프 및 방정식 (부교재 p.58 14번)');
      setDifficulty('서술형대비');
      setTitle('[삼각방정식] 김영훈 쌤 서술형에서 단위원 동경 표시 빠지면 몇 점 깎이나요?');
      setContent('부교재 58페이지 14번 문제에서 2sin²x - 3cosx = 0 풀 때, 그래프로 푸는 것과 단위원으로 푸는 것 중 어떤 풀이를 더 선호하시나요? 작년 서술형 채점 기준 궁금합니다!');
      setFormulaLatex('2\\sin^2 x - 3\\cos x = 0, \\quad (0 \\le x < 2\\pi)');
      setPhotoUrl('https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=600&auto=format&fit=crop&q=80');
      setTagInput('김영훈쌤, 삼각방정식, 부교재변형');
    } else if (presetType === 'physics') {
      setSubject('과학');
      setTeacherName('이성우 선생님');
      setExamScope('통합과학 물질과 규칙성 역학적 시스템 (p.72~95)');
      setDifficulty('킬러/심화');
      setTitle('[물리학] 이성우 쌤 등가속도 v-t 그래프 보기 ㄷ 단위 낚시 질문');
      setContent('기출문제를 풀다 보면 보기 ㄷ에서 cm/s랑 m/s 단위 바꿔서 함정 파는 문제가 매년 나온다고 들었습니다. 이번 시험에서도 대비해야 할까요?');
      setFormulaLatex('v = v_0 + at, \\quad s = v_0 t + \\frac{1}{2}at^2');
      setTagInput('이성우쌤, 등가속도, 단위함정');
    } else {
      setSubject('영어');
      setTeacherName('박선희 선생님');
      setExamScope('교과서 3과 + 수능특강 라이트 6강, 8강');
      setDifficulty('내신빈출');
      setTitle('[영어] 박선희 쌤 수특 빈칸추론 선지 어휘 패러프레이징 난이도');
      setContent('원문 주제문 핵심 어휘를 유의어나 반의어로 바꿔서 출제하실 때 모의고사 몇 등급 수준의 단어로 변형하시나요? 선배님 팁 부탁드립니다.');
      setTagInput('박선희쌤, 수특라이트, 빈칸추론');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    const resolvedTeacher = teacherName === '직접입력' || !teacherName 
      ? (customTeacher.trim() || `${subject} 담당 선생님`)
      : teacherName;

    const tags = tagInput
      .split(',')
      .map(t => t.trim().replace(/^#/, ''))
      .filter(Boolean);

    if (resolvedTeacher && !tags.includes(resolvedTeacher)) {
      tags.push(resolvedTeacher);
    }

    setIsSubmitting(true);
    try {
      await onSubmitQuestion({
        title: title.trim(),
        content: content.trim(),
        targetGrade,
        subject,
        teacherName: resolvedTeacher,
        examScope: examScope.trim() || '이번 시험 범위',
        difficulty,
        tags,
        formulaLatex: formulaLatex.trim() || undefined,
        photoUrl: photoUrl.trim() || undefined
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 md:p-6 overflow-y-auto">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <HelpCircle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">우리 학교 공부 질문 올리기</h3>
              <p className="text-slate-500 text-xs">{currentSchool?.name} 학우와 선배들이 직접 답변합니다.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Fast presets toolbar */}
        <div className="bg-blue-50/70 border-b border-blue-100 px-6 py-2 flex items-center justify-between text-xs">
          <span className="text-blue-900 font-bold text-[11px]">⚡ 빠른 예시 질문 채우기:</span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => handleApplyPreset('math')}
              className="bg-white border border-blue-200 hover:bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-[11px] font-semibold cursor-pointer"
            >
              수학1 서술형
            </button>
            <button
              type="button"
              onClick={() => handleApplyPreset('physics')}
              className="bg-white border border-blue-200 hover:bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-[11px] font-semibold cursor-pointer"
            >
              물리학 단위함정
            </button>
            <button
              type="button"
              onClick={() => handleApplyPreset('english')}
              className="bg-white border border-blue-200 hover:bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-[11px] font-semibold cursor-pointer"
            >
              영어 수특연계
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">과목 선택</label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value as any)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium text-slate-800"
              >
                {subjects.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">대상 학년</label>
              <select
                value={targetGrade}
                onChange={(e) => setTargetGrade(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium text-slate-800"
              >
                <option value={1}>1학년 (고1/중1)</option>
                <option value={2}>2학년 (고2/중2)</option>
                <option value={3}>3학년 (고3/중3)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                <span>담당 선생님 (스타일 분석 연계)</span>
                <span className="text-[10px] text-blue-600">선배 족보 반영</span>
              </label>
              <select
                value={teacherName}
                onChange={(e) => setTeacherName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium text-slate-800 mb-1.5"
              >
                <option value="">선생님 선택</option>
                {popularTeachers.map(t => (
                  <option key={t.name} value={t.name}>
                    {t.name} ({t.subject})
                  </option>
                ))}
                <option value="직접입력">직접 입력하기</option>
              </select>
              {(teacherName === '직접입력' || !teacherName) && (
                <input
                  type="text"
                  placeholder="예: 김영훈 선생님"
                  value={customTeacher}
                  onChange={(e) => setCustomTeacher(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800"
                />
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                시험 범위 및 교재 쪽수
              </label>
              <input
                type="text"
                placeholder="예: 수학1 2단원 삼각함수 부교재 p.42~65"
                value={examScope}
                onChange={(e) => setExamScope(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 placeholder-slate-400"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">문제 난이도 유형</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {difficulties.map(d => (
                <button
                  type="button"
                  key={d}
                  onClick={() => setDifficulty(d)}
                  className={`py-2 px-3 text-xs font-bold rounded-lg border transition-colors cursor-pointer text-center ${
                    difficulty === d
                      ? 'bg-blue-50 border-blue-600 text-blue-700'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">질문 제목</label>
            <input
              type="text"
              placeholder="예: [삼각방정식] 김영훈 쌤 서술형 풀이에서 단위원 주기성 표시 빠지면 감점되나요?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              required
            />
          </div>

          {/* Math Formula Helper */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                <Calculator className="w-3.5 h-3.5 text-blue-600" />
                <span>수학·과학 공식 (LaTeX 표기, 선택)</span>
              </label>
              <div className="flex items-center gap-1">
                {mathSnippets.slice(0, 3).map((m) => (
                  <button
                    key={m.label}
                    type="button"
                    onClick={() => setFormulaLatex(m.latex)}
                    className="text-[10px] text-blue-600 hover:underline"
                  >
                    +{m.label}
                  </button>
                ))}
              </div>
            </div>
            <input
              type="text"
              placeholder="예: 2\sin^2 x - 3\cos x = 0"
              value={formulaLatex}
              onChange={(e) => setFormulaLatex(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-mono text-slate-800"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">질문 내용 및 막힌 부분</label>
            <textarea
              rows={4}
              placeholder="구체적으로 어느 부분(어떤 식이나 해설 단계)에서 이해가 안 가는지, 또는 작년 시험 기출 포인트가 궁금한지 자세히 적어주세요."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 leading-relaxed"
              required
            />
          </div>

          {/* Photo attachment simulation */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
              <ImageIcon className="w-3.5 h-3.5 text-emerald-600" />
              <span>문제/오답노트 사진 URL (선택)</span>
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="https://images.unsplash.com/..."
                value={photoUrl}
                onChange={(e) => setPhotoUrl(e.target.value)}
                className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400"
              />
              <button
                type="button"
                onClick={() =>
                  setPhotoUrl(
                    'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=600&auto=format&fit=crop&q=80'
                  )
                }
                className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1.5 rounded-lg font-medium cursor-pointer"
              >
                샘플 사진 넣기
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">태그</label>
            <input
              type="text"
              placeholder="예: 김영훈쌤, 부교재변형, 서술형감점"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400"
            />
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded-xl p-3 flex items-center gap-2.5 text-xs text-purple-900">
            <Sparkles className="w-5 h-5 text-purple-600 shrink-0" />
            <div className="leading-snug">
              <span className="font-bold block">AI 쌤 스타일 분석 & 3단계 힌트 자동 탑재</span>
              <span className="text-purple-700 text-[11px]">
                등록 즉시 Gemini Flash 3.8 모델이 교사별 출제 성향과 3단계 사고 유도 힌트를 생성합니다.
              </span>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
            <span className="text-[11px] text-slate-500">
              답변 채택 시 채택자와 안전한 1:1 공부 채팅이 활성화됩니다.
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                취소
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !title.trim() || !content.trim()}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-bold text-xs px-5 py-2.5 rounded-lg shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <span>{isSubmitting ? '등록 중...' : '질문 등록하기'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
