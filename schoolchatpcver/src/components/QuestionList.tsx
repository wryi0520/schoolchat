import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  MessageSquare, 
  CheckCircle, 
  Clock, 
  Sparkles, 
  BookMarked, 
  HelpCircle,
  ThumbsUp, 
  Eye, 
  TrendingUp,
  Image as ImageIcon,
  Calculator
} from 'lucide-react';
import { Question, School, User } from '../types.ts';

interface QuestionListProps {
  questions: Question[];
  currentSchool?: School;
  currentUser: User;
  onSelectQuestion: (question: Question) => void;
  onOpenCreateModal: () => void;
  onOpenAiGraderModal: () => void;
  selectedGrade: string;
  setSelectedGrade: (grade: string) => void;
  selectedSubject: string;
  setSelectedSubject: (subject: string) => void;
  selectedStatus: string;
  setSelectedStatus: (status: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const subjects = ['전체', '수학', '국어', '영어', '과학', '사회', '정보/기타'] as const;

export const QuestionList: React.FC<QuestionListProps> = ({
  questions,
  currentSchool,
  currentUser,
  onSelectQuestion,
  onOpenCreateModal,
  onOpenAiGraderModal,
  selectedGrade,
  setSelectedGrade,
  selectedSubject,
  setSelectedSubject,
  selectedStatus,
  setSelectedStatus,
  searchQuery,
  setSearchQuery
}) => {
  const [filterSeniorAnswerOnly, setFilterSeniorAnswerOnly] = useState(false);

  const displayedQuestions = questions.filter(q => {
    if (filterSeniorAnswerOnly) {
      return q.answers.some(a => a.isSenior);
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* School Exam Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-2xl p-6 text-white shadow-sm relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-blue-500/20 to-transparent pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-blue-300 text-xs font-semibold tracking-wider uppercase">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              {currentSchool?.name} 맞춤 학업 & Q&A 아카이브
            </div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight">
              {currentSchool?.name} 친구·선후배 Q&A
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm max-w-xl leading-relaxed">
              우리 학교 선생님들의 실제 출제 경향, 서술형 감점 기준, 시험 범위 맞춤 풀이를 질문하세요.
              답변 채택 시 <strong className="text-amber-300">1:1 공부 채팅(DM)</strong>이 즉시 열립니다!
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={onOpenAiGraderModal}
              className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-purple-200" />
              <span>AI 서술형 채점기 & 킬러 족보</span>
            </button>

            <button
              onClick={onOpenCreateModal}
              className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>새 질문 올리기</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-4">
        {/* Top Filter Row: Grade Tabs + Search */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-lg text-xs font-semibold text-slate-600">
            {[
              { id: 'all', label: '전체 학년' },
              { id: '1', label: '1학년' },
              { id: '2', label: '2학년' },
              { id: '3', label: '3학년' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setSelectedGrade(tab.id)}
                className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
                  selectedGrade === tab.id
                    ? 'bg-white text-blue-700 shadow-xs'
                    : 'hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="선생님 이름(예: 김영훈 쌤), 부교재 쪽수, 단원 키워드..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Bottom Filter Row: Subject Tabs + Status Filters */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-slate-400 font-medium mr-1">과목:</span>
            {subjects.map(subj => (
              <button
                key={subj}
                onClick={() => setSelectedSubject(subj === '전체' ? 'all' : subj)}
                className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                  (subj === '전체' && selectedSubject === 'all') || selectedSubject === subj
                    ? 'bg-blue-600 text-white font-bold'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {subj}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-1.5 text-slate-600 cursor-pointer">
              <input
                type="checkbox"
                checked={filterSeniorAnswerOnly}
                onChange={(e) => setFilterSeniorAnswerOnly(e.target.checked)}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="font-medium text-xs">선배 답변 있는 글만</span>
            </label>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-md px-2 py-1 text-xs text-slate-700"
            >
              <option value="all">전체 상태</option>
              <option value="open">답변 대기중</option>
              <option value="adopted">채택 완료 (DM 연계)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Question Cards List */}
      <div className="space-y-3">
        {displayedQuestions.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-500">
            <HelpCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">조건에 맞는 질문이 없습니다</h3>
            <p className="text-xs text-slate-500 mt-1">
              우리 학교 시험 범위나 선생님 문제 스타일에 대해 첫 번째 질문을 남겨보세요!
            </p>
            <button
              onClick={onOpenCreateModal}
              className="mt-4 inline-flex items-center gap-1.5 bg-blue-600 text-white text-xs font-semibold px-4 py-2 rounded-lg hover:bg-blue-700 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              질문 작성하기
            </button>
          </div>
        ) : (
          displayedQuestions.map(q => {
            const hasSeniorAnswer = q.answers.some(a => a.isSenior);
            const isAuthor = q.authorId === currentUser.id;

            return (
              <div
                key={q.id}
                onClick={() => onSelectQuestion(q)}
                className="group bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:border-blue-400 hover:shadow-md transition-all cursor-pointer relative"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-2 flex-1">
                    {/* Metadata Header */}
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      {q.status === 'adopted' ? (
                        <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                          <CheckCircle className="w-3.5 h-3.5" />
                          채택 완료
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                          <Clock className="w-3.5 h-3.5" />
                          답변 대기중
                        </span>
                      )}

                      <span className="font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                        {q.subject} · {q.targetGrade}학년
                      </span>

                      {q.teacherName && (
                        <span className="font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                          👨‍🏫 {q.teacherName}
                        </span>
                      )}

                      <span className="text-slate-500 font-medium">
                        {q.difficulty}
                      </span>

                      <span className="text-slate-400">·</span>
                      <span className="text-slate-600">
                        {q.authorName} ({q.authorGrade}학년)
                      </span>
                      {isAuthor && (
                        <span className="text-[10px] bg-slate-200 text-slate-700 font-bold px-1 rounded">
                          내 질문
                        </span>
                      )}
                    </div>

                    {/* Question Title */}
                    <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                      {q.title}
                    </h3>

                    {/* Content snippet */}
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {q.content}
                    </p>

                    {/* Latex Formula preview badge */}
                    {q.formulaLatex && (
                      <div className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-800 text-[11px] font-mono px-2.5 py-1 rounded-md border border-slate-200">
                        <Calculator className="w-3.5 h-3.5 text-blue-600" />
                        <span>수식: {q.formulaLatex}</span>
                      </div>
                    )}

                    {/* Exam Scope & Tags */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs">
                      <div className="inline-flex items-center gap-1 text-slate-600 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded text-[11px]">
                        <BookMarked className="w-3 h-3 text-slate-500" />
                        <span>시험 범위: {q.examScope}</span>
                      </div>

                      {q.photoUrl && (
                        <div className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[11px] font-semibold">
                          <ImageIcon className="w-3 h-3 text-emerald-600" />
                          <span>풀이 사진 포함</span>
                        </div>
                      )}

                      {q.aiHint && (
                        <div className="inline-flex items-center gap-1 text-purple-700 bg-purple-50 px-2 py-0.5 rounded text-[11px] font-semibold">
                          <Sparkles className="w-3 h-3 text-purple-600" />
                          <span>AI 쌤 스타일 분석 완료</span>
                        </div>
                      )}

                      {hasSeniorAnswer && (
                        <div className="inline-flex items-center gap-1 text-blue-700 bg-blue-50 px-2 py-0.5 rounded text-[11px] font-semibold">
                          <span>🎓 선배 멘토 답변 포함</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right side stats */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 text-xs text-slate-500 min-w-[90px]">
                    <div className="flex items-center gap-1.5 bg-slate-50 group-hover:bg-blue-50 px-2.5 py-1.5 rounded-lg font-bold text-slate-700 group-hover:text-blue-700 transition-colors">
                      <MessageSquare className="w-4 h-4 text-slate-500 group-hover:text-blue-600" />
                      <span>답변 {q.answers.length}개</span>
                    </div>

                    <div className="flex items-center gap-3 text-slate-400 text-[11px]">
                      <span className="flex items-center gap-1">
                        <ThumbsUp className="w-3 h-3" />
                        {q.likes}
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {q.views}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
