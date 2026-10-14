import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  Award, 
  AlertTriangle, 
  CheckCircle2, 
  FileCheck, 
  GraduationCap, 
  ArrowRight,
  TrendingUp,
  Lightbulb
} from 'lucide-react';
import { School, User, TeacherRubricResult } from '../types.ts';

interface AiRubricGraderModalProps {
  currentSchool?: School;
  currentUser: User;
  onClose: () => void;
}

export const AiRubricGraderModal: React.FC<AiRubricGraderModalProps> = ({
  currentSchool,
  currentUser,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'rubric' | 'killer'>('rubric');

  // Rubric grader state
  const [selectedTeacher, setSelectedTeacher] = useState(
    currentSchool?.popularTeachers[0]?.name || '김영훈 선생님'
  );
  const [subject, setSubject] = useState('수학');
  const [studentDraft, setStudentDraft] = useState(
    `2sin²x - 3cosx = 0 에서
2(1 - cos²x) - 3cosx = 0
2 - 2cos²x - 3cosx = 0
2cos²x + 3cosx - 2 = 0
(2cosx - 1)(cosx + 2) = 0
cosx = 1/2 또는 cosx = -2
따라서 x = π/3, 5π/3 입니다.`
  );
  const [rubricResult, setRubricResult] = useState<TeacherRubricResult | null>(null);
  const [isGrading, setIsGrading] = useState(false);

  // Killer questions state
  const [killerData, setKillerData] = useState<any | null>(null);
  const [isKillerLoading, setIsKillerLoading] = useState(false);

  const handleRunGrader = async () => {
    if (!studentDraft.trim()) return;
    setIsGrading(true);
    try {
      const res = await fetch('/api/ai/rubric-grader', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionId: 'q-101',
          studentDraft: studentDraft.trim()
        })
      });
      const data = await res.json();
      if (data.success) {
        setRubricResult(data.result);
      }
    } catch (err) {
      console.error('Rubric grader error:', err);
    } finally {
      setIsGrading(false);
    }
  };

  const handleLoadKillerPreview = async () => {
    setIsKillerLoading(true);
    try {
      const res = await fetch('/api/ai/exam-killer-preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          schoolId: currentSchool?.id,
          subject,
          grade: currentUser.grade,
          teacherName: selectedTeacher
        })
      });
      const data = await res.json();
      if (data.success) {
        setKillerData(data.preview);
      }
    } catch (err) {
      console.error('Killer preview error:', err);
    } finally {
      setIsKillerLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 md:p-6 overflow-y-auto">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-purple-500 text-white flex items-center justify-center shadow-xs">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-base flex items-center gap-1.5">
                SchoolQ AI 학업 엔진
                <span className="text-[10px] bg-purple-400 text-slate-950 font-bold px-1.5 rounded">
                  Gemini Flash 3.8
                </span>
              </h3>
              <p className="text-purple-200 text-xs">
                {currentSchool?.name} 교사별 채점 기준표 및 시험 킬러 적중 분석기
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-purple-200 hover:text-white p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center border-b border-slate-200 bg-slate-50 px-6 pt-3 gap-3 text-xs font-bold">
          <button
            onClick={() => setActiveTab('rubric')}
            className={`pb-3 border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'rubric'
                ? 'border-purple-600 text-purple-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileCheck className="w-4 h-4" />
            <span>선생님 서술형 채점기 (Rubric Grader)</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('killer');
              if (!killerData) handleLoadKillerPreview();
            }}
            className={`pb-3 border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'killer'
                ? 'border-purple-600 text-purple-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <TrendingUp className="w-4 h-4 text-amber-500" />
            <span>이번 시험 예상 킬러 3선 분석</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {activeTab === 'rubric' ? (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-700">채점 대상 선생님:</span>
                  <select
                    value={selectedTeacher}
                    onChange={(e) => setSelectedTeacher(e.target.value)}
                    className="bg-slate-100 border border-slate-200 rounded-lg px-2.5 py-1 text-slate-800 font-semibold"
                  >
                    {currentSchool?.popularTeachers.map((t) => (
                      <option key={t.name} value={t.name}>
                        {t.name} ({t.subject} - 서술형 감점 기준 적용)
                      </option>
                    ))}
                  </select>
                </div>

                <span className="text-[11px] text-slate-400">
                  선생님의 실제 감점 규칙표를 기준으로 모의 채점합니다.
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  내 서술형 풀이 과정 초안 (입력 또는 예시 수정)
                </label>
                <textarea
                  rows={5}
                  value={studentDraft}
                  onChange={(e) => setStudentDraft(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs sm:text-sm text-slate-800 font-mono leading-relaxed focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={() =>
                    setStudentDraft(
                      `[문제: sin 2x + cos x = 0 서술형 풀이]\n치환 t = sin x\n범위 -1 <= t <= 1 지정\n방정식 정리: 2t*sqrt(1-t^2) + ...`
                    )
                  }
                  className="text-xs text-purple-700 underline font-semibold cursor-pointer"
                >
                  다른 서술형 문제 예시 불러오기
                </button>

                <button
                  onClick={handleRunGrader}
                  disabled={isGrading}
                  className="bg-purple-600 hover:bg-purple-700 disabled:bg-slate-300 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{isGrading ? '선생님 기준 채점 중...' : '서술형 감점 요소 채점하기'}</span>
                </button>
              </div>

              {/* Grading Result */}
              {rubricResult && (
                <div className="mt-4 bg-gradient-to-br from-purple-50/70 to-indigo-50/70 border border-purple-200 rounded-2xl p-5 space-y-4">
                  {/* Score header */}
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs text-purple-700 font-bold block">
                        {rubricResult.teacherStyleApplied}
                      </span>
                      <h4 className="text-lg font-extrabold text-slate-900 mt-0.5">
                        예상 채점 점수:{' '}
                        <span className="text-purple-700 text-2xl font-black">
                          {rubricResult.score}
                        </span>{' '}
                        / {rubricResult.totalPoints}점
                      </h4>
                    </div>

                    <div className="w-12 h-12 rounded-2xl bg-purple-600 text-white flex items-center justify-center font-black text-xl shadow-xs">
                      {rubricResult.score >= 9 ? 'A+' : rubricResult.score >= 7 ? 'B+' : 'C'}
                    </div>
                  </div>

                  {/* Deductions breakdown */}
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1">
                      <AlertTriangle className="w-4 h-4 text-amber-500" />
                      실제 시험장 예상 감점 사유 ({rubricResult.deductions.length}건)
                    </span>

                    {rubricResult.deductions.map((d, idx) => (
                      <div
                        key={idx}
                        className="bg-white rounded-xl p-3 border border-amber-200/80 text-xs flex items-start justify-between gap-3"
                      >
                        <div>
                          <span className="font-bold text-slate-900 block text-xs">
                            {d.reason}
                          </span>
                          <span className="text-slate-500 text-[11px] mt-0.5 block">
                            엄격 기준: {d.strictRule}
                          </span>
                        </div>
                        <span className="text-red-600 font-extrabold text-xs bg-red-50 px-2 py-1 rounded shrink-0">
                          -{d.pointsLost}점
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Model Answer */}
                  <div className="bg-white rounded-xl p-4 border border-purple-200 space-y-2">
                    <span className="text-xs font-bold text-purple-900 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      선생님이 만점(10점)을 주는 서술형 모범 답안
                    </span>
                    <pre className="text-xs text-slate-800 font-mono whitespace-pre-wrap leading-relaxed bg-slate-50 p-3 rounded-lg">
                      {rubricResult.modelAnswer}
                    </pre>
                  </div>

                  {/* Summary */}
                  <p className="text-xs text-slate-700 bg-purple-100/60 p-3 rounded-xl leading-relaxed">
                    💡 <strong>총평:</strong> {rubricResult.feedbackSummary}
                  </p>
                </div>
              )}
            </div>
          ) : (
            /* Killer questions tab */
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-slate-900">
                    {currentSchool?.name} {selectedTeacher} 중간고사 킬러 적중 예측
                  </h4>
                  <p className="text-xs text-slate-500">
                    선배들의 최근 3개년 기출 경향과 부교재 킬러 단원을 교차 분석한 결과입니다.
                  </p>
                </div>

                <button
                  onClick={handleLoadKillerPreview}
                  disabled={isKillerLoading}
                  className="text-xs font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>새로고침</span>
                </button>
              </div>

              {isKillerLoading ? (
                <div className="p-12 text-center text-xs text-slate-400 space-y-2">
                  <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="font-bold text-slate-700">학교 기출 족보를 심층 분석하는 중...</p>
                </div>
              ) : killerData ? (
                <div className="space-y-3">
                  <div className="bg-blue-50 border border-blue-200 p-3 rounded-xl text-xs text-blue-900 font-medium">
                    📌 <strong>핵심 출제 단원:</strong> {killerData.examScopeSummary}
                  </div>

                  <div className="space-y-3">
                    {killerData.killerQuestions?.map((k: any) => (
                      <div
                        key={k.rank}
                        className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-2"
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-lg bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">
                            {k.rank}
                          </span>
                          <h5 className="font-bold text-sm text-slate-900">{k.title}</h5>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
                          <div className="bg-red-50/70 border border-red-100 rounded-lg p-2.5 text-red-950">
                            <span className="font-bold text-red-700 block text-[11px]">
                              ⚠️ 80%가 낚이는 함정 포인트
                            </span>
                            <span className="text-slate-700 text-xs mt-0.5 block">
                              {k.pitfall}
                            </span>
                          </div>

                          <div className="bg-emerald-50/70 border border-emerald-100 rounded-lg p-2.5 text-emerald-950">
                            <span className="font-bold text-emerald-700 block text-[11px]">
                              ⚡ 선배의 30초 공략 테크닉
                            </span>
                            <span className="text-slate-700 text-xs mt-0.5 block">
                              {k.seniorSecret}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
