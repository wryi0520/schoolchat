import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar.tsx';
import { QuestionList } from './components/QuestionList.tsx';
import { QuestionDetailModal } from './components/QuestionDetailModal.tsx';
import { CreateQuestionModal } from './components/CreateQuestionModal.tsx';
import { ChatView } from './components/ChatView.tsx';
import { TeachersBoard } from './components/TeachersBoard.tsx';
import { FriendsTab } from './components/FriendsTab.tsx';
import { SchoolVerifyModal, ReportModal, SafetyCenterView } from './components/SafetyModals.tsx';
import { AiRubricGraderModal } from './components/AiRubricGraderModal.tsx';
import { DownloadExportModal } from './components/DownloadExportModal.tsx';
import { User, School, Question, FriendRelation } from './types.ts';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [friends, setFriends] = useState<FriendRelation[]>([]);
  const [blockedUserIds, setBlockedUserIds] = useState<string[]>([]);

  // Navigation & Filter States
  const [activeTab, setActiveTab] = useState<'qa' | 'chat' | 'friends' | 'teachers' | 'safety'>('qa');
  const [selectedGrade, setSelectedGrade] = useState<string>('all');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);
  const [isAiGraderModalOpen, setIsAiGraderModalOpen] = useState(false);
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const [activeChatRoomId, setActiveChatRoomId] = useState<string | null>(null);

  // Report modal state
  const [reportModalData, setReportModalData] = useState<{
    isOpen: boolean;
    targetType: 'question' | 'answer' | 'chat_message' | 'user';
    targetId: string;
    targetAuthorName: string;
  } | null>(null);

  // Initial Data Load
  const fetchSchools = async () => {
    try {
      const res = await fetch('/api/schools');
      const data = await res.json();
      if (data.success) {
        setSchools(data.schools);
      }
    } catch (err) {
      console.error('Failed to fetch schools:', err);
    }
  };

  const fetchCurrentUser = async () => {
    try {
      const res = await fetch('/api/users/current');
      const data = await res.json();
      if (data.success) {
        setCurrentUser(data.user);
      }
    } catch (err) {
      console.error('Failed to fetch user:', err);
    }
  };

  const fetchBlockedUsers = async () => {
    try {
      const res = await fetch('/api/safety/blocked');
      const data = await res.json();
      if (data.success) {
        setBlockedUserIds(data.blockedUserIds);
      }
    } catch (err) {
      console.error('Failed to fetch blocked users:', err);
    }
  };

  const fetchQuestions = async () => {
    try {
      const params = new URLSearchParams();
      if (currentUser?.schoolId) params.append('schoolId', currentUser.schoolId);
      if (selectedGrade !== 'all') params.append('grade', selectedGrade);
      if (selectedSubject !== 'all') params.append('subject', selectedSubject);
      if (selectedStatus !== 'all') params.append('status', selectedStatus);
      if (searchQuery.trim()) params.append('search', searchQuery.trim());

      const res = await fetch(`/api/questions?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setQuestions(data.questions);
      }
    } catch (err) {
      console.error('Failed to fetch questions:', err);
    }
  };

  const fetchFriends = async () => {
    try {
      const res = await fetch('/api/friends');
      const data = await res.json();
      if (data.success) {
        setFriends(data.friends);
      }
    } catch (err) {
      console.error('Failed to fetch friends:', err);
    }
  };

  useEffect(() => {
    fetchSchools();
    fetchCurrentUser();
    fetchBlockedUsers();
    setAllUsers([
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
        name: '강민지 (타학교)',
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
    ]);
  }, []);

  useEffect(() => {
    if (currentUser) {
      fetchQuestions();
      fetchFriends();
    }
  }, [currentUser?.id, currentUser?.schoolId, selectedGrade, selectedSubject, selectedStatus, searchQuery]);

  // Account Switcher handler
  const handleSwitchUser = async (userId: string) => {
    try {
      const res = await fetch('/api/users/switch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });
      const data = await res.json();
      if (data.success) {
        setCurrentUser(data.user);
        setSelectedQuestion(null);
      }
    } catch (err) {
      console.error('Failed to switch user:', err);
    }
  };

  // Adopt Answer
  const handleAdoptAnswer = async (answerId: string): Promise<string | undefined> => {
    if (!selectedQuestion) return;
    try {
      const res = await fetch(`/api/questions/${selectedQuestion.id}/adopt`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answerId })
      });
      const data = await res.json();
      if (data.success) {
        setSelectedQuestion(data.question);
        fetchQuestions();
        if (currentUser) {
          setCurrentUser({ ...currentUser, points: currentUser.points + 15 });
        }
        return data.chatRoomId;
      } else {
        alert(data.error || '답변 채택에 실패했습니다.');
      }
    } catch (err) {
      console.error('Adopt error:', err);
    }
  };

  // Submit Answer
  const handleSubmitAnswer = async (
    content: string,
    teacherTip?: string,
    handwrittenPhoto?: string,
    formulaLatex?: string
  ) => {
    if (!selectedQuestion) return;
    const res = await fetch(`/api/questions/${selectedQuestion.id}/answers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content, teacherTip, handwrittenPhoto, formulaLatex })
    });
    const data = await res.json();
    if (data.success) {
      setSelectedQuestion(data.question);
      fetchQuestions();
      if (currentUser) {
        setCurrentUser({ ...currentUser, points: currentUser.points + 20 });
      }
    } else {
      alert(data.error || '답변 등록에 실패했습니다.');
    }
  };

  // Like Question
  const handleLikeQuestion = async () => {
    if (!selectedQuestion) return;
    const res = await fetch(`/api/questions/${selectedQuestion.id}/like`, { method: 'POST' });
    const data = await res.json();
    if (data.success) {
      setSelectedQuestion({ ...selectedQuestion, likes: data.likes });
      fetchQuestions();
    }
  };

  // Request AI Hint
  const handleRequestAiHint = async () => {
    if (!selectedQuestion) return;
    const res = await fetch(`/api/questions/${selectedQuestion.id}/ai-analyze`, { method: 'POST' });
    const data = await res.json();
    if (data.success) {
      setSelectedQuestion({ ...selectedQuestion, aiHint: data.aiHint });
      fetchQuestions();
    }
  };

  // Create Question
  const handleCreateQuestion = async (formData: any) => {
    const res = await fetch('/api/questions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    const data = await res.json();
    if (data.success) {
      fetchQuestions();
      if (currentUser) {
        setCurrentUser({ ...currentUser, points: currentUser.points + 10 });
      }
      setSelectedQuestion(data.question);
    } else {
      alert(data.error || '질문 등록에 실패했습니다.');
    }
  };

  // Start Chat or Go to Chat room
  const handleStartChatWithUser = async (targetUserId: string) => {
    try {
      const res = await fetch('/api/chat/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetUserId, reason: 'friend' })
      });
      const data = await res.json();
      if (data.success) {
        setActiveChatRoomId(data.room.id);
        setActiveTab('chat');
        setSelectedQuestion(null);
      } else {
        alert(data.error || '대화방 개설에 실패했습니다.');
      }
    } catch (err) {
      console.error('Failed to open chat:', err);
    }
  };

  // Add friend
  const handleAddFriend = async (targetUserId: string) => {
    try {
      const res = await fetch('/api/friends/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetUserId })
      });
      const data = await res.json();
      if (data.success) {
        alert(data.message);
        fetchFriends();
      } else {
        alert(data.error || '친구 추가에 실패했습니다.');
      }
    } catch (err) {
      console.error('Failed to add friend:', err);
    }
  };

  // Report handler
  const handleOpenReport = (type: any, id: string, targetName: string) => {
    setReportModalData({
      isOpen: true,
      targetType: type,
      targetId: id,
      targetAuthorName: targetName
    });
  };

  const handleSubmitReport = async (reason: string, details: string) => {
    if (!reportModalData) return;
    await fetch('/api/safety/report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        targetType: reportModalData.targetType,
        targetId: reportModalData.targetId,
        targetAuthorName: reportModalData.targetAuthorName,
        reason,
        details
      })
    });
  };

  // Block user handler
  const handleBlockUser = async (userId: string, userName: string) => {
    if (!window.confirm(`정말 ${userName} 님을 차단하시겠습니까? 차단 시 해당 사용자의 모든 질문, 답변, 1:1 대화가 즉시 숨김 처리됩니다.`)) {
      return;
    }
    const res = await fetch('/api/safety/block', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId })
    });
    const data = await res.json();
    if (data.success) {
      alert(data.message);
      fetchBlockedUsers();
      fetchQuestions();
      setSelectedQuestion(null);
    }
  };

  const currentSchool = schools.find((s) => s.id === currentUser?.schoolId);

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center space-y-2">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-500 font-bold">스쿨큐 학교 서버에 연결하는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      <Navbar
        currentUser={currentUser}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        allUsers={allUsers}
        onSwitchUser={handleSwitchUser}
        currentSchool={currentSchool}
        onOpenVerifyModal={() => setIsVerifyModalOpen(true)}
        onOpenDownloadModal={() => setIsDownloadModalOpen(true)}
        unreadChatCount={0}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6">
        {activeTab === 'qa' && (
          <QuestionList
            questions={questions}
            currentSchool={currentSchool}
            currentUser={currentUser}
            onSelectQuestion={(q) => setSelectedQuestion(q)}
            onOpenCreateModal={() => setIsCreateModalOpen(true)}
            onOpenAiGraderModal={() => setIsAiGraderModalOpen(true)}
            selectedGrade={selectedGrade}
            setSelectedGrade={setSelectedGrade}
            selectedSubject={selectedSubject}
            setSelectedSubject={setSelectedSubject}
            selectedStatus={selectedStatus}
            setSelectedStatus={setSelectedStatus}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />
        )}

        {activeTab === 'chat' && (
          <ChatView
            currentUser={currentUser}
            activeRoomId={activeChatRoomId}
            onSelectRoom={(id) => setActiveChatRoomId(id)}
            onReport={(type, id, targetName) => handleOpenReport(type, id, targetName)}
            onBlockUser={handleBlockUser}
          />
        )}

        {activeTab === 'friends' && (
          <FriendsTab
            currentUser={currentUser}
            allUsers={allUsers}
            friends={friends}
            currentSchool={currentSchool}
            onAddFriend={handleAddFriend}
            onStartChat={handleStartChatWithUser}
          />
        )}

        {activeTab === 'teachers' && (
          <TeachersBoard
            currentSchool={currentSchool}
            currentUser={currentUser}
            onFilterByTeacher={(name) => {
              setSearchQuery(name);
              setActiveTab('qa');
            }}
            onOpenAiGraderModal={() => setIsAiGraderModalOpen(true)}
          />
        )}

        {activeTab === 'safety' && (
          <SafetyCenterView
            currentUser={currentUser}
            onOpenVerifyModal={() => setIsVerifyModalOpen(true)}
            blockedUserIds={blockedUserIds}
            allUsers={allUsers}
          />
        )}
      </main>

      {/* Modals */}
      {selectedQuestion && (
        <QuestionDetailModal
          question={selectedQuestion}
          currentUser={currentUser}
          onClose={() => setSelectedQuestion(null)}
          onAdoptAnswer={handleAdoptAnswer}
          onSubmitAnswer={handleSubmitAnswer}
          onLikeQuestion={handleLikeQuestion}
          onGoToChatRoom={(roomId) => {
            setSelectedQuestion(null);
            setActiveChatRoomId(roomId);
            setActiveTab('chat');
          }}
          onRequestAiHint={handleRequestAiHint}
          onOpenAiGraderModal={() => setIsAiGraderModalOpen(true)}
          onReport={(type, id, authorName) => handleOpenReport(type, id, authorName)}
          onBlockUser={handleBlockUser}
        />
      )}

      {isCreateModalOpen && (
        <CreateQuestionModal
          currentUser={currentUser}
          currentSchool={currentSchool}
          onClose={() => setIsCreateModalOpen(false)}
          onSubmitQuestion={handleCreateQuestion}
        />
      )}

      {isAiGraderModalOpen && (
        <AiRubricGraderModal
          currentSchool={currentSchool}
          currentUser={currentUser}
          onClose={() => setIsAiGraderModalOpen(false)}
        />
      )}

      {isVerifyModalOpen && (
        <SchoolVerifyModal
          currentUser={currentUser}
          schools={schools}
          onClose={() => setIsVerifyModalOpen(false)}
          onVerifySuccess={(updatedUser) => {
            setCurrentUser(updatedUser);
            fetchQuestions();
          }}
        />
      )}

      {reportModalData?.isOpen && (
        <ReportModal
          targetType={reportModalData.targetType}
          targetId={reportModalData.targetId}
          targetAuthorName={reportModalData.targetAuthorName}
          onClose={() => setReportModalData(null)}
          onSubmitReport={handleSubmitReport}
        />
      )}

      {isDownloadModalOpen && (
        <DownloadExportModal onClose={() => setIsDownloadModalOpen(false)} />
      )}
    </div>
  );
}
