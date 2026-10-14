import React, { useState } from 'react';
import { 
  Users, 
  UserPlus, 
  MessageSquare, 
  GraduationCap, 
  Award, 
  CheckCircle2, 
  ShieldCheck, 
  Sparkles,
  Coins,
  Trophy,
  Gift,
  Check
} from 'lucide-react';
import { User, FriendRelation, School } from '../types.ts';

interface FriendsTabProps {
  currentUser: User;
  allUsers: User[];
  friends: FriendRelation[];
  currentSchool?: School;
  onAddFriend: (targetUserId: string) => Promise<void>;
  onStartChat: (targetUserId: string) => Promise<void>;
}

export const FriendsTab: React.FC<FriendsTabProps> = ({
  currentUser,
  allUsers,
  friends,
  currentSchool,
  onAddFriend,
  onStartChat
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'network' | 'ranking' | 'shop'>('network');
  const [filterType, setFilterType] = useState<'all' | 'seniors' | 'peers'>('all');
  const [redeemedItemId, setRedeemedItemId] = useState<string | null>(null);

  // Filter school students (only same school)
  const schoolStudents = allUsers.filter(
    (u) => u.schoolId === currentUser.schoolId && u.id !== currentUser.id
  );

  const displayedStudents = schoolStudents.filter((u) => {
    if (filterType === 'seniors') return u.grade > currentUser.grade;
    if (filterType === 'peers') return u.grade === currentUser.grade;
    return true;
  });

  // Ranking sorted by adopted count & points
  const rankedStudents = [...allUsers.filter((u) => u.schoolId === currentUser.schoolId)].sort(
    (a, b) => b.adoptedCount - a.adoptedCount || b.points - a.points
  );

  const isFriend = (userId: string) => {
    return friends.some((f) => f.friendId === userId && f.status === 'friend');
  };

  const handleRedeemGift = (itemTitle: string, id: string) => {
    setRedeemedItemId(id);
    setTimeout(() => {
      setRedeemedItemId(null);
    }, 2500);
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-900 rounded-2xl p-6 text-white shadow-xs">
        <div className="flex items-center gap-2 text-blue-300 text-xs font-semibold uppercase">
          <Users className="w-4 h-4" />
          <span>{currentSchool?.name} 피어 네트워크</span>
        </div>
        <h1 className="text-xl md:text-2xl font-bold mt-1">
          우리 학교 선후배 & 친구 스터디 네트워크
        </h1>
        <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-xl">
          학교 인증을 마친 같은 학교 선배와 친구들입니다. 친구를 맺거나 Q&A 답변을 채택하면
          안전한 1:1 공부 채팅으로 이어집니다.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
        <div className="flex items-center gap-2 text-xs font-bold">
          <button
            onClick={() => setActiveSubTab('network')}
            className={`pb-2 border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeSubTab === 'network'
                ? 'border-blue-600 text-blue-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>선후배·친구 목록 ({schoolStudents.length}명)</span>
          </button>

          <button
            onClick={() => setActiveSubTab('ranking')}
            className={`pb-2 border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeSubTab === 'ranking'
                ? 'border-blue-600 text-blue-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Trophy className="w-4 h-4 text-amber-500" />
            <span>명예의 전당 (채택 랭킹)</span>
          </button>

          <button
            onClick={() => setActiveSubTab('shop')}
            className={`pb-2 border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeSubTab === 'shop'
                ? 'border-blue-600 text-blue-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Gift className="w-4 h-4 text-purple-500" />
            <span>포인트 매점 상점</span>
          </button>
        </div>

        <div className="text-xs text-slate-500 font-medium hidden sm:block">
          내 친구 <strong className="text-blue-600">{friends.length}</strong>명
        </div>
      </div>

      {activeSubTab === 'network' ? (
        <>
          {/* Sub filter pills */}
          <div className="flex items-center gap-2 text-xs font-semibold">
            {[
              { id: 'all', label: '전체 학우' },
              { id: 'seniors', label: '선배 멘토' },
              { id: 'peers', label: '동급생 친구' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilterType(tab.id as any)}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  filterType === tab.id
                    ? 'bg-blue-600 text-white font-bold'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Students List Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayedStudents.map((student) => {
              const friendStatus = isFriend(student.id);
              const isSenior = student.grade > currentUser.grade;

              return (
                <div
                  key={student.id}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between space-y-4 hover:border-blue-300 transition-colors"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={student.avatar}
                          alt={student.name}
                          className="w-12 h-12 rounded-full object-cover ring-2 ring-blue-100"
                        />
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h3 className="font-bold text-sm text-slate-900">{student.name}</h3>
                            {isSenior ? (
                              <span className="text-[10px] bg-indigo-100 text-indigo-700 font-bold px-1.5 py-0.2 rounded">
                                {student.grade}학년 선배
                              </span>
                            ) : (
                              <span className="text-[10px] bg-slate-100 text-slate-700 font-medium px-1.5 py-0.2 rounded">
                                {student.grade}학년
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-blue-600 font-semibold block">
                            {student.badgeTitle || `${student.grade}학년 ${student.classNum}반`}
                          </span>
                        </div>
                      </div>

                      <span className="text-[10px] text-emerald-600 bg-emerald-50 font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5">
                        <ShieldCheck className="w-3 h-3" /> 인증완료
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl leading-relaxed">
                      "{student.statusMessage || '열공 중입니다!'}"
                    </p>

                    <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100">
                      <div className="flex items-center gap-1">
                        <Award className="w-3.5 h-3.5 text-amber-500" />
                        <span>채택 <strong className="text-slate-800">{student.adoptedCount}</strong>회</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Coins className="w-3.5 h-3.5 text-amber-500" />
                        <span>{student.points} P</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center gap-2">
                    {friendStatus ? (
                      <button
                        onClick={() => onStartChat(student.id)}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>1:1 채팅 열기</span>
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={() => onAddFriend(student.id)}
                          className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs py-2 rounded-xl flex items-center justify-center gap-1 cursor-pointer transition-colors"
                        >
                          <UserPlus className="w-3.5 h-3.5" />
                          <span>친구 추가</span>
                        </button>
                        <button
                          onClick={() => onStartChat(student.id)}
                          className="bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs px-3 py-2 rounded-xl flex items-center gap-1 cursor-pointer transition-colors"
                          title="1:1 채팅 시작"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      ) : activeSubTab === 'ranking' ? (
        /* Mentor Leaderboard */
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-500" />
                <span>{currentSchool?.name} 주간 선배 멘토 명예의 전당</span>
              </h3>
              <p className="text-xs text-slate-500">
                후배들의 질문에 가장 정확하고 명쾌한 답변을 달아 채택된 순위입니다.
              </p>
            </div>
            <span className="text-xs bg-amber-50 text-amber-800 font-bold px-2.5 py-1 rounded-lg">
              매주 월요일 갱신 🏆
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {rankedStudents.map((student, idx) => (
              <div
                key={student.id}
                className="py-3.5 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`w-7 h-7 rounded-xl font-black text-xs flex items-center justify-center ${
                      idx === 0
                        ? 'bg-amber-400 text-white shadow-xs'
                        : idx === 1
                        ? 'bg-slate-300 text-white'
                        : idx === 2
                        ? 'bg-amber-600 text-white'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {idx + 1}
                  </span>

                  <img
                    src={student.avatar}
                    alt={student.name}
                    className="w-10 h-10 rounded-full object-cover ring-1 ring-slate-200"
                  />

                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-xs text-slate-900">{student.name}</span>
                      <span className="text-[10px] text-slate-500">
                        ({student.grade}학년)
                      </span>
                      {student.specialtySubject && (
                        <span className="text-[10px] bg-blue-50 text-blue-700 font-bold px-1.5 py-0.2 rounded">
                          {student.specialtySubject}
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-400 block">
                      {student.badgeTitle}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs">
                  <div className="text-right">
                    <span className="font-extrabold text-slate-900 block">
                      채택 {student.adoptedCount}회
                    </span>
                    <span className="text-[11px] text-amber-600 font-semibold">
                      {student.points} P
                    </span>
                  </div>

                  {student.id !== currentUser.id && (
                    <button
                      onClick={() => onStartChat(student.id)}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-3 py-1.5 rounded-lg cursor-pointer"
                    >
                      질문하기
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Point Shop */
        <div className="space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center justify-between text-xs text-amber-950">
            <div>
              <span className="font-bold block text-sm">
                내 보유 스터디 포인트: <strong className="text-amber-600 text-base">{currentUser.points} P</strong>
              </span>
              <span>답변 채택 시 50P, 질문 작성 시 10P가 적립됩니다.</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
            {[
              { id: 'shop-1', title: '학교 매점 바나나우유 교환권', points: 300, icon: '🥛' },
              { id: 'shop-2', title: '시험 기간 모의고사 족보 다운로드권', points: 200, icon: '📄' },
              { id: 'shop-3', title: '내 질문 24시간 상단 고정 강조권', points: 500, icon: '🔥' },
              { id: 'shop-4', title: 'CU 편의점 3,000원 모바일 쿠폰', points: 1000, icon: '🏪' },
              { id: 'shop-5', title: '공부 멘토 인증 골드 뱃지 (프로필)', points: 1500, icon: '🥇' }
            ].map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col justify-between space-y-3"
              >
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{item.icon}</span>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{item.title}</h4>
                    <span className="text-amber-600 font-extrabold text-xs">
                      {item.points} P
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleRedeemGift(item.title, item.id)}
                  disabled={currentUser.points < item.points}
                  className="w-full bg-slate-900 hover:bg-slate-800 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold py-2 rounded-xl transition-colors cursor-pointer"
                >
                  {redeemedItemId === item.id ? (
                    <span className="flex items-center justify-center gap-1 text-emerald-400">
                      <Check className="w-3.5 h-3.5" /> 교환 신청 완료!
                    </span>
                  ) : (
                    '포인트로 교환'
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
