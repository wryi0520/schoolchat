import React, { useState } from 'react';
import { 
  X, 
  CheckCircle2, 
  Sparkles, 
  MessageSquare, 
  ThumbsUp, 
  Send, 
  ShieldAlert, 
  UserMinus, 
  GraduationCap, 
  BookOpen, 
  AlertTriangle,
  Lightbulb,
  ExternalLink,
  ChevronRight,
  Calculator,
  Image as ImageIcon
} from 'lucide-react';
import { Question, Answer, User } from '../types.ts';
import { sounds, mathSnippets } from '../utils/soundAndMath.ts';

interface QuestionDetailModalProps {
  question: Question;
  currentUser: User;
  onClose: () => void;
  onAdoptAnswer: (answerId: string) => Promise<string | undefined>;
  onSubmitAnswer: (content: string, teacherTip?: string, handwrittenPhoto?: string, formulaLatex?: string) => Promise<void>;
  onLikeQuestion: () => void;
  onGoToChatRoom: (roomId: string) => void;
  onRequestAiHint: () => Promise<void>;
  onOpenAiGraderModal?: () => void;
  onReport: (type: 'question' | 'answer', id: string, authorName: string) => void;
  onBlockUser: (userId: string, userName: string) => void;
}

export const QuestionDetailModal: React.FC<QuestionDetailModalProps> = ({
  question,
  currentUser,
  onClose,
  onAdoptAnswer,
  onSubmitAnswer,
  onLikeQuestion,
  onGoToChatRoom,
  onRequestAiHint,
  onOpenAiGraderModal,
  onReport,
  onBlockUser
}) => {
  const [answerContent, setAnswerContent] = useState('');
  const [teacherTip, setTeacherTip] = useState('');
  const [formulaInput, setFormulaInput] = useState('');
  const [photoInput, setPhotoInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [adoptedRoomId, setAdoptedRoomId] = useState<string | null>(null);
  const [previewPhoto, setPreviewPhoto] = useState<string | null>(null);

  const isAuthor = question.authorId === currentUser.id;
  const isSameSchool = question.schoolId === currentUser.schoolId;

  const handleAdopt = async (answerId: string) => {
    if (!window.confirm('이 답변을 채택하시겠습니까? 채택 시 답변자에게 포인트가 지급되고 1:1 공부 대화방이 즉시 열립니다.')) {
      return;
    }
    sounds.playAdoptFanfare();
    const roomId = await onAdoptAnswer(answerId);
    if (roomId) {
      setAdoptedRoomId(roomId);
    }
  };

  const handleAnswerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!answerContent.trim()) return;

    setIsSubmitting(true);
    sounds.playSendChime();
    try {
      await onSubmitAnswer(
        answerContent.trim(),
        teacherTip.trim() || undefined,
        photoInput.trim() || undefined,
        formulaInput.trim() || undefined
      );
      setAnswerContent('');
      setTeacherTip('');
      setFormulaInput('');
      setPhotoInput('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAiHintClick = async () => {
    setIsAiLoading(true);
    try {
      await onRequestAiHint();
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 md:p-6 overflow-y-auto">
      {/* Lightbox photo preview */}
      {previewPhoto && (
        <div
          onClick={() => setPreviewPhoto(null)}
          className="fixed inset-0 z-60 bg-black/80 flex items-center justify-center p-4 cursor-pointer"
        >
          <div className="max-w-2xl w-full">
            <img src={previewPhoto} alt="확대" className="w-full max-h-[85vh] object-contain rounded-xl" />
          </div>
        </div>
      )}

      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <span className="font-bold text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
              {question.schoolName}
            </span>
            <span className="text-xs font-semibold text-slate-700">
              {question.subject} · {question.targetGrade}학년
            </span>
            {question.status === 'adopted' && (
              <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> 채택 완료
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {onOpenAiGraderModal && (
              <button
                onClick={onOpenAiGraderModal}
                className="text-xs font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 px-2.5 py-1 rounded-lg flex items-center gap-1 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">AI 서술형 채점기</span>
              </button>
            )}
            <button
              onClick={() => onReport('question', question.id, question.authorName)}
              className="text-slate-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-50 transition-colors cursor-pointer text-xs flex items-center gap-1"
              title="부적절한 게시물 신고"
            >
              <ShieldAlert className="w-4 h-4" />
              <span className="hidden sm:inline">신고</span>
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Question Details */}
          <div className="space-y-4">
            <h2 className="text-xl font-extrabold text-slate-900 leading-snug">
              {question.title}
            </h2>

            {/* Author info & Metadata */}
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 py-2 border-y border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                  {question.authorName[0]}
                </div>
                <div>
                  <span className="font-bold text-slate-800">{question.authorName}</span>
                  <span className="text-slate-400 mx-1">·</span>
                  <span>{question.schoolName} {question.authorGrade}학년</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span>{new Date(question.createdAt).toLocaleDateString()}</span>
                <span>조회 {question.views}</span>
                <button
                  onClick={onLikeQuestion}
                  className="flex items-center gap-1 text-blue-600 hover:text-blue-700 font-semibold cursor-pointer"
                >
                  <ThumbsUp className="w-3.5 h-3.5" />
                  <span>공감 {question.likes}</span>
                </button>
              </div>
            </div>

            {/* Teacher and Exam Scope callout */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="bg-blue-50/70 border border-blue-100 p-3 rounded-xl flex items-center gap-2 text-blue-900">
                <GraduationCap className="w-4 h-4 text-blue-600 shrink-0" />
                <div>
                  <span className="text-blue-500 text-[11px] block">담당 선생님</span>
                  <span className="font-bold">{question.teacherName || '담당 쌤 미지정'}</span>
                </div>
              </div>

              <div className="bg-amber-50/70 border border-amber-100 p-3 rounded-xl flex items-center gap-2 text-amber-900">
                <BookOpen className="w-4 h-4 text-amber-600 shrink-0" />
                <div>
                  <span className="text-amber-600 text-[11px] block">시험 범위 및 교재</span>
                  <span className="font-bold">{question.examScope}</span>
                </div>
              </div>
            </div>

            {/* Latex Formula if exists */}
            {question.formulaLatex && (
              <div className="bg-slate-100 rounded-xl p-3 text-xs font-mono text-slate-900 border border-slate-200 flex items-center gap-2">
                <Calculator className="w-4 h-4 text-blue-600 shrink-0" />
                <div>
                  <span className="text-slate-500 text-[10px] block font-sans">질문 수식:</span>
                  <span>{question.formulaLatex}</span>
                </div>
              </div>
            )}

            {/* Photo preview if exists */}
            {question.photoUrl && (
              <div className="rounded-xl overflow-hidden border border-slate-200">
                <img
                  src={question.photoUrl}
                  alt="질문 사진"
                  onClick={() => setPreviewPhoto(question.photoUrl || null)}
                  className="w-full max-h-56 object-cover cursor-pointer hover:opacity-95"
                />
              </div>
            )}

            {/* Question Text */}
            <div className="text-sm text-slate-800 whitespace-pre-wrap leading-relaxed bg-slate-50/50 p-4 rounded-xl border border-slate-100">
              {question.content}
            </div>

            {/* Tags */}
            {question.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {question.tags.map(tag => (
                  <span key={tag} className="text-xs text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* AI School Study Mentor Box */}
          <div className="bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 border border-purple-200 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-purple-600 text-white flex items-center justify-center shadow-xs">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-purple-950 flex items-center gap-1.5">
                    AI 쌤 출제 스타일 & 단계별 힌트 가이드
                    <span className="text-[10px] bg-purple-200 text-purple-800 font-extrabold px-1.5 py-0.2 rounded">Gemini AI</span>
                  </h4>
                  <p className="text-[11px] text-purple-700">
                    직접 답을 스포하지 않고, 우리 학교 {question.teacherName}의 출제 경향과 사고 흐름을 분석합니다.
                  </p>
                </div>
              </div>

              <button
                onClick={handleAiHintClick}
                disabled={isAiLoading}
                className="text-xs font-bold text-purple-700 hover:text-purple-900 bg-white border border-purple-200 px-2.5 py-1.5 rounded-lg shadow-xs hover:bg-purple-50 transition-colors cursor-pointer flex items-center gap-1"
              >
                <Sparkles className="w-3.5 h-3.5" />
                {isAiLoading ? '분석 중...' : '새로고침'}
              </button>
            </div>

            {question.aiHint ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 pt-1 text-xs">
                <div className="bg-white/80 backdrop-blur-xs rounded-xl p-3 border border-purple-100 space-y-1">
                  <span className="font-bold text-purple-900 flex items-center gap-1">
                    🎯 출제 및 감점 포인트
                  </span>
                  <p className="text-slate-700 leading-relaxed text-[11px]">
                    {question.aiHint.teacherAnalysis}
                  </p>
                </div>

                <div className="bg-white/80 backdrop-blur-xs rounded-xl p-3 border border-purple-100 space-y-1">
                  <span className="font-bold text-blue-900 flex items-center gap-1">
                    <Lightbulb className="w-3.5 h-3.5 text-blue-600" /> 단계별 사고 유도
                  </span>
                  <p className="text-slate-700 leading-relaxed text-[11px]">
                    {question.aiHint.stepHint}
                  </p>
                </div>

                <div className="bg-white/80 backdrop-blur-xs rounded-xl p-3 border border-purple-100 space-y-1">
                  <span className="font-bold text-amber-900 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" /> 빈출 오답 함정
                  </span>
                  <p className="text-slate-700 leading-relaxed text-[11px]">
                    {question.aiHint.trapAlert}
                  </p>
                </div>
              </div>
            ) : null}
          </div>

          {/* Adopted Chat Room Banner Notification */}
          {adoptedRoomId && (
            <div className="bg-emerald-50 border-2 border-emerald-400 p-4 rounded-xl flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-emerald-900">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <span className="font-bold block text-sm">답변 채택 완료! 1:1 대화방이 활성화되었습니다.</span>
                  <span>답변해준 선배/친구와 1:1로 질문을 이어가고 맞춤 시험 팁을 받아보세요.</span>
                </div>
              </div>
              <button
                onClick={() => onGoToChatRoom(adoptedRoomId)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-2 rounded-lg flex items-center gap-1 shrink-0 cursor-pointer shadow-xs"
              >
                <span>대화방 바로가기</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Answers Section */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-blue-600" />
                답변 <span className="text-blue-600">{question.answers.length}</span>개
              </h3>
              <span className="text-xs text-slate-500">
                {question.status === 'adopted' ? '채택이 완료된 질문입니다' : '질문자가 채택 시 1:1 채팅이 열립니다'}
              </span>
            </div>

            {question.answers.length === 0 ? (
              <div className="bg-slate-50 rounded-xl p-8 text-center text-slate-500 text-xs border border-dashed border-slate-200">
                아직 등록된 답변이 없습니다. 같은 학교 선배 또는 친구라면 첫 번째 답변을 작성해보세요!
              </div>
            ) : (
              <div className="space-y-4">
                {question.answers.map(ans => {
                  const isAnsAdopted = ans.isAdopted || question.adoptedAnswerId === ans.id;

                  return (
                    <div
                      key={ans.id}
                      className={`rounded-xl p-4 sm:p-5 transition-all relative ${
                        isAnsAdopted
                          ? 'bg-emerald-50/70 border-2 border-emerald-400 shadow-xs'
                          : 'bg-white border border-slate-200'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs text-white ${
                            ans.isSenior ? 'bg-indigo-600' : 'bg-blue-600'
                          }`}>
                            {ans.authorName[0]}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-xs text-slate-900">{ans.authorName}</span>
                              {ans.isSenior && (
                                <span className="text-[10px] bg-indigo-100 text-indigo-800 font-bold px-1.5 py-0.5 rounded">
                                  선배 멘토 ({ans.authorGrade}학년)
                                </span>
                              )}
                              {isAnsAdopted && (
                                <span className="text-[10px] bg-emerald-600 text-white font-bold px-2 py-0.5 rounded flex items-center gap-1 shadow-xs">
                                  <CheckCircle2 className="w-3 h-3" /> 채택된 답변
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-slate-400">
                              {new Date(ans.createdAt).toLocaleString()}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => onReport('answer', ans.id, ans.authorName)}
                            className="text-slate-400 hover:text-red-500 p-1 rounded text-xs"
                            title="답변 신고"
                          >
                            <ShieldAlert className="w-3.5 h-3.5" />
                          </button>
                          {ans.authorId !== currentUser.id && (
                            <button
                              onClick={() => onBlockUser(ans.authorId, ans.authorName)}
                              className="text-slate-400 hover:text-slate-700 p-1 rounded text-xs"
                              title="작성자 차단"
                            >
                              <UserMinus className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="mt-3 text-xs sm:text-sm text-slate-800 whitespace-pre-wrap leading-relaxed">
                        {ans.content}
                      </div>

                      {/* Formula latex if attached */}
                      {ans.formulaLatex && (
                        <div className="mt-2.5 p-2.5 bg-slate-100 rounded-lg font-mono text-xs text-slate-900 border border-slate-200">
                          📐 공식 풀이: {ans.formulaLatex}
                        </div>
                      )}

                      {/* Handwritten photo if attached */}
                      {ans.handwrittenPhoto && (
                        <div className="mt-3 rounded-xl overflow-hidden border border-slate-200 max-w-sm">
                          <img
                            src={ans.handwrittenPhoto}
                            alt="선배 풀이 노트"
                            onClick={() => setPreviewPhoto(ans.handwrittenPhoto || null)}
                            className="w-full h-40 object-cover cursor-pointer hover:opacity-95"
                          />
                          <span className="text-[10px] text-slate-500 p-1 block bg-slate-50">
                            🔍 선배 손글씨 풀이 노트 (클릭하여 확대)
                          </span>
                        </div>
                      )}

                      {/* Teacher Tip Box */}
                      {ans.teacherTip && (
                        <div className="mt-3 bg-amber-50 border border-amber-200/80 rounded-lg p-3 text-xs text-amber-900 flex items-start gap-2">
                          <Lightbulb className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold block text-amber-800">
                              선배가 전수하는 {question.teacherName} 꿀팁:
                            </span>
                            <span className="text-amber-950">{ans.teacherTip}</span>
                          </div>
                        </div>
                      )}

                      {/* Bottom Footer */}
                      <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                        <div className="text-slate-400">
                          {ans.upvotes > 0 && <span>추천 {ans.upvotes}</span>}
                        </div>

                        <div className="flex items-center gap-2">
                          {isAuthor && question.status !== 'adopted' && (
                            <button
                              onClick={() => handleAdopt(ans.id)}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded-lg shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                              <span>답변 채택하기 (1:1 DM 활성화)</span>
                            </button>
                          )}

                          {isAnsAdopted && (
                            <button
                              onClick={() => onGoToChatRoom(`room-1`)}
                              className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-3 py-1.5 rounded-lg shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                            >
                              <MessageSquare className="w-4 h-4" />
                              <span>채택자 1:1 대화창 열기</span>
                              <ExternalLink className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Write Answer Form */}
          {isSameSchool ? (
            <div className="bg-slate-50 rounded-2xl p-4 sm:p-5 border border-slate-200 space-y-3">
              <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <span>답변 작성하기</span>
                {currentUser.grade > question.targetGrade && (
                  <span className="text-xs bg-indigo-100 text-indigo-800 font-semibold px-2 py-0.5 rounded">
                    🎓 선배 멘토 자격으로 답변
                  </span>
                )}
              </h4>

              <form onSubmit={handleAnswerSubmit} className="space-y-3">
                <textarea
                  rows={4}
                  placeholder="후배나 친구에게 도움이 되는 상세한 설명이나 풀이 과정을 적어주세요..."
                  value={answerContent}
                  onChange={(e) => setAnswerContent(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  required
                />

                <input
                  type="text"
                  placeholder="💡 (선택) 선생님 출제 팁 (예: 이 쌤은 서술형에서 단위 안 쓰면 1점 깎으심)"
                  value={teacherTip}
                  onChange={(e) => setTeacherTip(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 placeholder-slate-400"
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="flex items-center gap-1">
                    <input
                      type="text"
                      placeholder="📐 수식 LaTeX (선택)"
                      value={formulaInput}
                      onChange={(e) => setFormulaInput(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800"
                    />
                    <button
                      type="button"
                      onClick={() => setFormulaInput('t = \\cos x, \\quad (-1 \\le t \\le 1)')}
                      className="text-[10px] text-blue-600 hover:underline shrink-0"
                    >
                      +예시
                    </button>
                  </div>

                  <div className="flex items-center gap-1">
                    <input
                      type="text"
                      placeholder="📷 손글씨 풀이 사진 URL (선택)"
                      value={photoInput}
                      onChange={(e) => setPhotoInput(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setPhotoInput(
                          'https://images.unsplash.com/photo-1596495578065-6e0763fa1178?w=600&auto=format&fit=crop&q=80'
                        )
                      }
                      className="text-[10px] text-emerald-600 hover:underline shrink-0"
                    >
                      +풀이사진
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-slate-500">
                    채택 시 <strong className="text-amber-600">50 포인트</strong> 지급 및 1:1 멘토링 채팅이 연결됩니다.
                  </span>
                  <button
                    type="submit"
                    disabled={isSubmitting || !answerContent.trim()}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-bold text-xs px-4 py-2 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{isSubmitting ? '등록 중...' : '답변 등록'}</span>
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-800 text-center">
              ⚠️ 동일 학교({question.schoolName}) 학생만 이 게시판에 답변을 달 수 있습니다.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
