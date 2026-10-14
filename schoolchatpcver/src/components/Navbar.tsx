import React from 'react';
import { 
  GraduationCap, 
  MessageSquare, 
  BookOpen, 
  Users, 
  ShieldCheck, 
  Sparkles, 
  Coins, 
  CheckCircle2, 
  ArrowLeftRight,
  School as SchoolIcon,
  Download
} from 'lucide-react';
import { User, School } from '../types.ts';

interface NavbarProps {
  currentUser: User;
  activeTab: 'qa' | 'chat' | 'friends' | 'teachers' | 'safety';
  setActiveTab: (tab: 'qa' | 'chat' | 'friends' | 'teachers' | 'safety') => void;
  allUsers: User[];
  onSwitchUser: (userId: string) => void;
  currentSchool?: School;
  onOpenVerifyModal: () => void;
  onOpenDownloadModal: () => void;
  unreadChatCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  activeTab,
  setActiveTab,
  allUsers,
  onSwitchUser,
  currentSchool,
  onOpenVerifyModal,
  onOpenDownloadModal,
  unreadChatCount
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
      {/* Top Banner: School Authentication & Status */}
      <div className="bg-slate-900 text-slate-100 text-xs px-4 py-2">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 font-medium text-blue-300">
              <SchoolIcon className="w-3.5 h-3.5" />
              {currentUser.schoolName}
            </span>
            <span className="text-slate-400">·</span>
            <span className="text-slate-300">
              {currentUser.grade}학년 {currentUser.classNum}반
            </span>
            <span className="text-slate-400">·</span>
            {currentUser.isVerified ? (
              <span className="inline-flex items-center gap-1 text-emerald-400 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" />
                학교 인증 완료
              </span>
            ) : (
              <button 
                onClick={onOpenVerifyModal}
                className="inline-flex items-center gap-1 text-amber-300 hover:text-amber-200 underline font-medium cursor-pointer"
              >
                학생증 미인증 (클릭하여 인증하기)
              </button>
            )}
            {currentSchool?.currentExamPeriod && (
              <>
                <span className="text-slate-500 hidden sm:inline">|</span>
                <span className="text-amber-300 font-medium hidden sm:inline">
                  📅 {currentSchool.currentExamPeriod}
                </span>
              </>
            )}
          </div>

          {/* User Account Switcher for Demo testing */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-slate-400 text-xs">
              <ArrowLeftRight className="w-3.5 h-3.5" />
              <span>계정 전환:</span>
              <select
                value={currentUser.id}
                onChange={(e) => onSwitchUser(e.target.value)}
                className="bg-slate-800 text-white border border-slate-700 rounded px-2 py-0.5 text-xs focus:outline-hidden focus:ring-1 focus:ring-blue-400"
              >
                {allUsers.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.schoolName.slice(0, 3)}·{u.grade}학년{u.role === 'senior_mentor' ? ' 멘토' : ''})
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-1 text-amber-400 font-semibold">
              <Coins className="w-3.5 h-3.5" />
              <span>{currentUser.points} P</span>
            </div>
            <button
              onClick={onOpenDownloadModal}
              className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-[11px] px-2.5 py-1 rounded-md transition-colors cursor-pointer shadow-xs"
              title="GitHub 푸시 또는 소스코드 다운로드"
            >
              <Download className="w-3 h-3" />
              <span>GitHub 저장 / 다운로드</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Nav Bar */}
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div 
            onClick={() => setActiveTab('qa')}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-xl shadow-xs group-hover:bg-blue-700 transition-colors">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg text-slate-900 tracking-tight">스쿨큐</span>
                <span className="text-xs font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">SchoolQ</span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block">우리 학교 선후배 맞춤 Q&A & 안전 1:1 대화</p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <nav className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => setActiveTab('qa')}
            className={`flex items-center gap-2 px-3.5 py-2 text-sm font-semibold rounded-lg transition-colors cursor-pointer ${
              activeTab === 'qa'
                ? 'bg-blue-50 text-blue-700'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>학교 Q&A</span>
          </button>

          <button
            onClick={() => setActiveTab('chat')}
            className={`relative flex items-center gap-2 px-3.5 py-2 text-sm font-semibold rounded-lg transition-colors cursor-pointer ${
              activeTab === 'chat'
                ? 'bg-blue-50 text-blue-700'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>1:1 공부 채팅</span>
            {unreadChatCount > 0 && (
              <span className="w-2 h-2 rounded-full bg-red-500 absolute top-2 right-2 ring-2 ring-white animate-pulse" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('friends')}
            className={`flex items-center gap-2 px-3.5 py-2 text-sm font-semibold rounded-lg transition-colors cursor-pointer ${
              activeTab === 'friends'
                ? 'bg-blue-50 text-blue-700'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>선후배·친구</span>
          </button>

          <button
            onClick={() => setActiveTab('teachers')}
            className={`flex items-center gap-2 px-3.5 py-2 text-sm font-semibold rounded-lg transition-colors cursor-pointer ${
              activeTab === 'teachers'
                ? 'bg-blue-50 text-blue-700'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span className="hidden md:inline">선생님 스타일 족보</span>
            <span className="md:hidden">쌤 스타일</span>
          </button>

          <button
            onClick={() => setActiveTab('safety')}
            className={`flex items-center gap-1.5 px-3 py-2 text-sm font-semibold rounded-lg transition-colors cursor-pointer ${
              activeTab === 'safety'
                ? 'bg-emerald-50 text-emerald-700'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
            title="학교 인증 & 안전 신고 센터"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span className="hidden lg:inline">안전센터</span>
          </button>
        </nav>

        {/* Profile preview */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200">
          <img
            src={currentUser.avatar}
            alt={currentUser.name}
            className="w-8 h-8 rounded-full object-cover ring-2 ring-blue-100"
          />
          <div className="hidden xl:block text-left text-xs">
            <div className="font-bold text-slate-800 flex items-center gap-1">
              {currentUser.name}
              {currentUser.role === 'senior_mentor' && (
                <span className="text-[10px] text-blue-600 font-semibold bg-blue-50 px-1 rounded">멘토</span>
              )}
            </div>
            <div className="text-slate-500 text-[11px] truncate max-w-[120px]">
              {currentUser.badgeTitle || `${currentUser.grade}학년`}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
