import React, { useState, useEffect } from 'react';
import { 
  GraduationCap, 
  Lightbulb, 
  AlertTriangle, 
  Search, 
  BookOpen, 
  ArrowRight,
  School as SchoolIcon,
  Download,
  FileText,
  CheckCircle2,
  TrendingUp,
  Sparkles
} from 'lucide-react';
import { School, User, ExamBankItem } from '../types.ts';

interface TeachersBoardProps {
  currentSchool?: School;
  currentUser: User;
  onFilterByTeacher: (teacherName: string) => void;
  onOpenAiGraderModal?: () => void;
}

export const TeachersBoard: React.FC<TeachersBoardProps> = ({
  currentSchool,
  currentUser,
  onFilterByTeacher,
  onOpenAiGraderModal
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'teachers' | 'exambank'>('teachers');
  const [examBankList, setExamBankList] = useState<ExamBankItem[]>([]);
  const [downloadSuccessId, setDownloadSuccessId] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/exam-bank')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setExamBankList(data.items);
        }
      })
      .catch(console.error);
  }, [currentSchool?.id]);

  const teachers = currentSchool?.popularTeachers || [];

  const handleSimulateDownload = (itemId: string) => {
    setDownloadSuccessId(itemId);
    setTimeout(() => {
      setDownloadSuccessId(null);
    }, 2500);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 rounded-2xl p-6 text-white shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-blue-300 text-xs font-semibold uppercase">
            <SchoolIcon className="w-4 h-4" />
            <span>{currentSchool?.name} 선배 전수 족보 & 기출 자료실</span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold mt-1">
            선생님별 출제 스타일 족보 & 역대 기출 분석실
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
            우리 학교 선생님들의 고유한 출제 성향, 서술형 감점 기준표, 그리고 역대 중간/기말 킬러 문항 복기본입니다.
          </p>
        </div>

        {onOpenAiGraderModal && (
          <button
            onClick={onOpenAiGraderModal}
            className="self-start md:self-auto bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-purple-200" />
            <span>AI 서술형 채점기 열기</span>
          </button>
        )}
      </div>

      {/* Sub Tabs */}
      <div className="flex items-center border-b border-slate-200 pb-2 gap-3 text-xs font-bold">
        <button
          onClick={() => setActiveSubTab('teachers')}
          className={`pb-2 border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer ${
            activeSubTab === 'teachers'
              ? 'border-blue-600 text-blue-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          <span>담당 선생님별 출제 성향 & 팁 ({teachers.length}명)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('exambank')}
          className={`pb-2 border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer ${
            activeSubTab === 'exambank'
              ? 'border-blue-600 text-blue-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileText className="w-4 h-4 text-amber-500" />
          <span>역대 기출 킬러 복기본 ({examBankList.length}건)</span>
        </button>
      </div>

      {activeSubTab === 'teachers' ? (
        /* Teachers Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {teachers.map((teacher) => (
            <div
              key={teacher.name}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4 hover:border-blue-400 transition-colors"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-lg border border-blue-100">
                    <GraduationCap className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base text-slate-900">{teacher.name}</h3>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                      <span className="text-blue-600 font-bold bg-blue-50 px-1.5 py-0.2 rounded">
                        {teacher.subject}
                      </span>
                      <span>·</span>
                      <span>{currentSchool?.name}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => onFilterByTeacher(teacher.name)}
                  className="text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <span>관련 질문 모아보기</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Style Description */}
              <div className="bg-slate-50 rounded-xl p-3 text-xs space-y-1">
                <span className="font-bold text-slate-800 flex items-center gap-1">
                  📝 출제 스타일 & 특징
                </span>
                <p className="text-slate-600 leading-relaxed text-[11px]">
                  {teacher.styleDescription}
                </p>
              </div>

              {/* Killer Topics */}
              {teacher.pastKillerTopics && (
                <div className="space-y-1 text-xs">
                  <span className="font-bold text-slate-700 text-[11px] block">
                    ⚡ 빈출 킬러 출제 단원:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {teacher.pastKillerTopics.map((topic) => (
                      <span
                        key={topic}
                        className="bg-indigo-50 text-indigo-700 font-medium text-[11px] px-2 py-0.5 rounded"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Exam Tips */}
              <div className="bg-amber-50/80 border border-amber-200/80 rounded-xl p-3 text-xs space-y-1 text-amber-950">
                <span className="font-bold text-amber-800 flex items-center gap-1">
                  <Lightbulb className="w-3.5 h-3.5 text-amber-600" /> 선배들의 실전 득점 꿀팁
                </span>
                <p className="leading-relaxed text-[11px] text-amber-900">
                  {teacher.examTips}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Exam Bank Archive Grid */
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-xs text-blue-900 flex items-center justify-between">
            <div>
              <span className="font-bold block text-sm">
                📚 {currentSchool?.name} 역대 기출 복기 & 킬러 리포트 아카이브
              </span>
              <span>선배들이 직접 응시하고 복기한 서술형 정답률과 킬러 문제 분석입니다.</span>
            </div>
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-lg">
              선배 검증 완료 🛡️
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {examBankList.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between space-y-4 hover:border-blue-400 transition-colors"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-extrabold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                        {item.year}년 {item.semester}
                      </span>
                      <h4 className="font-bold text-base text-slate-900 mt-1">
                        {item.subject} ({item.teacherName})
                      </h4>
                    </div>

                    <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded">
                      난이도: {item.difficultyRating}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl leading-relaxed">
                    {item.trendSummary}
                  </p>

                  <div className="space-y-1">
                    <span className="text-[11px] font-bold text-slate-700 block">
                      주요 킬러 복기 포인트:
                    </span>
                    <ul className="space-y-1 text-[11px] text-slate-600 list-disc list-inside">
                      {item.killerTopics.map((k, i) => (
                        <li key={i}>{k}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">
                    열람 {item.downloadCount}회
                  </span>

                  <button
                    onClick={() => handleSimulateDownload(item.id)}
                    className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    {downloadSuccessId === item.id ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>복기본 열람 완료</span>
                      </>
                    ) : (
                      <>
                        <Download className="w-3.5 h-3.5" />
                        <span>족보 복기본 보기</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
