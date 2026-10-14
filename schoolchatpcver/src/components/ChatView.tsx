import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, 
  ShieldCheck, 
  ShieldAlert, 
  UserX, 
  MessageSquare, 
  CheckCircle2, 
  Sparkles, 
  GraduationCap, 
  AlertCircle,
  Clock,
  Timer,
  Image,
  Calculator,
  Volume2,
  VolumeX,
  Maximize2,
  X
} from 'lucide-react';
import { ChatRoom, ChatMessage, User } from '../types.ts';
import { sounds, mathSnippets } from '../utils/soundAndMath.ts';

interface ChatViewProps {
  currentUser: User;
  activeRoomId: string | null;
  onSelectRoom: (roomId: string) => void;
  onReport: (type: 'chat_message' | 'user', id: string, targetName: string) => void;
  onBlockUser: (userId: string, userName: string) => void;
}

export const ChatView: React.FC<ChatViewProps> = ({
  currentUser,
  activeRoomId,
  onSelectRoom,
  onReport,
  onBlockUser
}) => {
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoadingRooms, setIsLoadingRooms] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isPartnerTyping, setIsPartnerTyping] = useState(false);
  const [crossSchoolError, setCrossSchoolError] = useState<string | null>(null);

  // Sound & Math tools
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showMathBar, setShowMathBar] = useState(false);
  const [previewPhotoUrl, setPreviewPhotoUrl] = useState<string | null>(null);

  // Study Timer (Pomodoro)
  const [timerSeconds, setTimerSeconds] = useState<number | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch Rooms
  const fetchRooms = async () => {
    try {
      const res = await fetch('/api/chat/rooms');
      const data = await res.json();
      if (data.success) {
        setRooms(data.rooms);
        if (!activeRoomId && data.rooms.length > 0) {
          onSelectRoom(data.rooms[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to load chat rooms:', err);
    } finally {
      setIsLoadingRooms(false);
    }
  };

  // Fetch Messages
  const fetchMessages = async (roomId: string) => {
    try {
      const res = await fetch(`/api/chat/rooms/${roomId}/messages`);
      const data = await res.json();
      if (data.success) {
        setMessages(data.messages);
      }
    } catch (err) {
      console.error('Failed to load messages:', err);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, [currentUser.id]);

  useEffect(() => {
    if (activeRoomId) {
      fetchMessages(activeRoomId);
      setIsPartnerTyping(false);
    }
  }, [activeRoomId]);

  // Pomodoro countdown effect
  useEffect(() => {
    if (timerSeconds === null || timerSeconds <= 0) return;
    const interval = setInterval(() => {
      setTimerSeconds((prev) => (prev && prev > 0 ? prev - 1 : null));
    }, 1000);
    return () => clearInterval(interval);
  }, [timerSeconds]);

  // SSE Stream
  useEffect(() => {
    const eventSource = new EventSource(`/api/chat/stream?userId=${currentUser.id}`);

    eventSource.onopen = () => setIsConnected(true);

    eventSource.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        if (payload.type === 'NEW_MESSAGE') {
          if (payload.roomId === activeRoomId) {
            setIsPartnerTyping(false);
            setMessages((prev) => [...prev, payload.message]);
            if (payload.message.senderId !== currentUser.id && soundEnabled) {
              sounds.playReceiveChime();
            }
          }
          setRooms((prev) =>
            prev.map((r) =>
              r.id === payload.roomId
                ? {
                    ...r,
                    lastMessage: payload.message.text,
                    lastMessageAt: payload.message.timestamp
                  }
                : r
            )
          );
        } else if (payload.type === 'NEW_ROOM') {
          setRooms((prev) => [payload.room, ...prev.filter((r) => r.id !== payload.room.id)]);
        }
      } catch (err) {
        console.error('SSE parse error:', err);
      }
    };

    eventSource.onerror = () => setIsConnected(false);

    return () => eventSource.close();
  }, [currentUser.id, activeRoomId, soundEnabled]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isPartnerTyping]);

  const handleSendMessage = async (textToSend?: string, attachmentData?: any, attachmentType?: any) => {
    const text = (textToSend !== undefined ? textToSend : inputText).trim();
    if ((!text && !attachmentData) || !activeRoomId || isSending) return;

    setIsSending(true);
    if (soundEnabled) sounds.playSendChime();

    try {
      const res = await fetch(`/api/chat/rooms/${activeRoomId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          attachmentType,
          attachmentData
        })
      });
      const data = await res.json();
      if (data.success) {
        if (!textToSend && !attachmentData) {
          setInputText('');
        }
        // Simulate partner typing indicator after user asks something
        setIsPartnerTyping(true);
        setTimeout(() => {
          setIsPartnerTyping(false);
        }, 1400);
      } else {
        alert(data.error || '메시지 전송에 실패했습니다.');
      }
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setIsSending(false);
    }
  };

  const handleSendPhotoNote = () => {
    const samplePhotos = [
      {
        url: 'https://images.unsplash.com/photo-1596495578065-6e0763fa1178?w=700&auto=format&fit=crop&q=80',
        title: '손글씨 서술형 풀이 & 단위원 동경 표시 노트',
        caption: '김영훈 쌤 1차 지필평가 감점 방지용 필수 줄바꿈 예시'
      },
      {
        url: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=700&auto=format&fit=crop&q=80',
        title: '물리학1 등가속도 v-t 그래프 복기 노트',
        caption: '이성우 쌤 보기 ㄷ 단위 함정 체크'
      }
    ];
    const picked = samplePhotos[Math.floor(Math.random() * samplePhotos.length)];
    handleSendMessage('손글씨 풀이 노트를 첨부했습니다. 참고해주세요!', picked, 'photo_solution');
  };

  const handleToggleTimer = async () => {
    if (!activeRoomId) return;
    try {
      const res = await fetch(`/api/chat/rooms/${activeRoomId}/study-timer`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        if (data.isStudyTimerActive) {
          setTimerSeconds(1500); // 25 min
        } else {
          setTimerSeconds(null);
        }
      }
    } catch (err) {
      console.error('Timer toggle error:', err);
    }
  };

  const handleTestExternalSchoolBlock = async () => {
    setCrossSchoolError(null);
    try {
      const res = await fetch('/api/chat/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetUserId: 'user-external-minji',
          reason: 'friend'
        })
      });
      const data = await res.json();
      if (!data.success) {
        setCrossSchoolError(data.error);
      }
    } catch {
      setCrossSchoolError('타학교 차단 통신 오류');
    }
  };

  const currentRoom = rooms.find((r) => r.id === activeRoomId);
  const partner = currentRoom?.participants.find((p) => p.userId !== currentUser.id);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col md:flex-row h-[80vh] min-h-[580px]">
      {/* Photo Lightbox */}
      {previewPhotoUrl && (
        <div 
          onClick={() => setPreviewPhotoUrl(null)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 cursor-pointer"
        >
          <div className="relative max-w-2xl w-full bg-slate-900 rounded-2xl overflow-hidden p-2">
            <button 
              onClick={() => setPreviewPhotoUrl(null)}
              className="absolute top-4 right-4 bg-black/60 text-white p-2 rounded-full hover:bg-black/80"
            >
              <X className="w-5 h-5" />
            </button>
            <img src={previewPhotoUrl} alt="노트 확대" className="w-full max-h-[80vh] object-contain rounded-xl" />
          </div>
        </div>
      )}

      {/* Left Column: Chat Rooms List */}
      <div className="w-full md:w-80 border-r border-slate-200 flex flex-col bg-slate-50/60 shrink-0">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-white">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-blue-600" />
            <h2 className="font-extrabold text-slate-900 text-sm">1:1 공부 채팅</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="text-slate-400 hover:text-slate-600 p-1 rounded"
              title={soundEnabled ? '효과음 끄기' : '효과음 켜기'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-blue-600" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
            </button>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
              <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'}`} />
              <span>{isConnected ? '실시간' : '대기'}</span>
            </div>
          </div>
        </div>

        {/* Safety Policy Notice & Test Button */}
        <div className="p-3 bg-blue-50/70 border-b border-blue-100 text-[11px] text-blue-900 flex flex-col gap-1.5">
          <div className="flex items-center gap-1.5 font-bold text-blue-950">
            <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
            <span>동일 학교 학생 안전 DM 보증</span>
          </div>
          <p className="text-slate-600 leading-tight">
            Q&A <span className="font-semibold text-blue-700">채택된 선배</span> 또는{' '}
            <span className="font-semibold text-blue-700">친구</span>만 1:1 대화가 가능합니다.
          </p>
          <button
            onClick={handleTestExternalSchoolBlock}
            className="self-start text-[10px] text-red-600 hover:text-red-700 underline font-semibold mt-0.5 cursor-pointer"
          >
            🛡️ 타학교 학생 DM 차단 규칙 테스트
          </button>
        </div>

        {/* Cross-school error alert */}
        {crossSchoolError && (
          <div className="m-3 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 space-y-1">
            <div className="flex items-center justify-between font-bold">
              <span className="flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 text-red-600" /> 안전 보호 작동
              </span>
              <button onClick={() => setCrossSchoolError(null)} className="text-red-500 hover:text-red-800 font-bold">
                ✕
              </button>
            </div>
            <p className="text-[11px] leading-relaxed">{crossSchoolError}</p>
          </div>
        )}

        {/* Room items list */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
          {isLoadingRooms ? (
            <div className="p-6 text-center text-xs text-slate-400">대화방을 불러오는 중...</div>
          ) : rooms.length === 0 ? (
            <div className="p-8 text-center text-slate-500 space-y-2">
              <MessageSquare className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-xs font-bold text-slate-700">활성화된 대화방이 없습니다</p>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Q&A 게시판에서 답변을 채택하거나 친구를 추가하면 1:1 대화방이 자동으로 열립니다.
              </p>
            </div>
          ) : (
            rooms.map((room) => {
              const other = room.participants.find((p) => p.userId !== currentUser.id);
              const isSelected = room.id === activeRoomId;

              return (
                <div
                  key={room.id}
                  onClick={() => onSelectRoom(room.id)}
                  className={`p-3.5 flex items-start gap-3 cursor-pointer transition-colors ${
                    isSelected ? 'bg-blue-50/80 border-l-4 border-blue-600' : 'hover:bg-slate-100/70'
                  }`}
                >
                  <img
                    src={other?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                    alt={other?.name}
                    className="w-10 h-10 rounded-full object-cover shrink-0 ring-1 ring-slate-200"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <div className="flex items-center gap-1.5 truncate">
                        <span className="font-bold text-xs text-slate-900 truncate">
                          {other?.name || '대화 상대'}
                        </span>
                        {other?.isSenior && (
                          <span className="text-[10px] bg-indigo-100 text-indigo-700 font-bold px-1 rounded shrink-0">
                            선배
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 shrink-0">
                        {room.lastMessageAt ? new Date(room.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 truncate mt-1">
                      {room.lastMessage || '대화가 시작되었습니다.'}
                    </p>

                    <div className="flex items-center gap-1.5 mt-1.5 text-[10px]">
                      {room.reason === 'adopted_qa' ? (
                        <span className="text-emerald-700 bg-emerald-50 font-bold px-1.5 py-0.2 rounded flex items-center gap-0.5">
                          <CheckCircle2 className="w-2.5 h-2.5" /> Q&A 채택 연결
                        </span>
                      ) : (
                        <span className="text-blue-700 bg-blue-50 font-medium px-1.5 py-0.2 rounded">
                          친구
                        </span>
                      )}
                      <span className="text-slate-400">·</span>
                      <span className="text-slate-500">{other?.grade}학년</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Right Column: Active Conversation */}
      <div className="flex-1 flex flex-col bg-white overflow-hidden">
        {currentRoom && partner ? (
          <>
            {/* Conversation Header */}
            <div className="px-5 py-3 border-b border-slate-200 flex items-center justify-between bg-white shadow-xs">
              <div className="flex items-center gap-3">
                <img
                  src={partner.avatar}
                  alt={partner.name}
                  className="w-9 h-9 rounded-full object-cover ring-2 ring-blue-100"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm text-slate-900">{partner.name}</h3>
                    <span className="text-xs text-slate-500">
                      ({partner.schoolName} {partner.grade}학년)
                    </span>
                    {partner.isSenior && (
                      <span className="text-[10px] bg-indigo-100 text-indigo-800 font-bold px-1.5 py-0.5 rounded">
                        🎓 선배 멘토
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-medium">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>동일 학교 인증 보증 · 1:1 안심 방</span>
                  </div>
                </div>
              </div>

              {/* Study Tools in Header: Pomodoro Timer & Report/Block */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleToggleTimer}
                  className={`text-xs font-bold px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer ${
                    timerSeconds !== null
                      ? 'bg-amber-100 text-amber-900 animate-pulse'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                  title="25분 함께 집중 공부 타이머 시작"
                >
                  <Timer className="w-3.5 h-3.5 text-amber-600" />
                  <span>
                    {timerSeconds !== null
                      ? `${Math.floor(timerSeconds / 60)}:${(timerSeconds % 60).toString().padStart(2, '0')}`
                      : '스터디 타이머'}
                  </span>
                </button>

                <button
                  onClick={() => onReport('user', partner.userId, partner.name)}
                  className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 text-xs flex items-center gap-1 cursor-pointer"
                  title="신고하기"
                >
                  <ShieldAlert className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onBlockUser(partner.userId, partner.name)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 text-xs flex items-center gap-1 cursor-pointer"
                  title="차단하기"
                >
                  <UserX className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Related Q&A Info Strip */}
            {currentRoom.relatedQuestionTitle && (
              <div className="bg-slate-50 border-b border-slate-100 px-5 py-2 flex items-center justify-between text-xs text-slate-600">
                <div className="flex items-center gap-2 truncate">
                  <span className="font-bold text-blue-700 shrink-0">연계 질문:</span>
                  <span className="truncate">{currentRoom.relatedQuestionTitle}</span>
                </div>
                <span className="text-[11px] text-emerald-600 font-semibold shrink-0">
                  채택 완료됨
                </span>
              </div>
            )}

            {/* Message Thread */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-50/40">
              <div className="bg-amber-50/80 border border-amber-200/80 rounded-xl p-3 text-center text-[11px] text-amber-900 max-w-lg mx-auto">
                <span className="font-bold">🔒 학교 안전 안심 대화 안내</span>
                <p className="mt-0.5 text-amber-800">
                  {currentUser.schoolName} 학생 간의 1:1 공부 대화방입니다. 개인정보 유출이나 비매너 언행은 학교 규정에 따라 제재됩니다.
                </p>
              </div>

              {messages.map((msg) => {
                const isMe = msg.senderId === currentUser.id;
                const isSystem = msg.senderId === 'system';

                if (isSystem) {
                  return (
                    <div key={msg.id} className="text-center my-3">
                      <div className="inline-block bg-blue-50 border border-blue-200 text-blue-900 text-xs px-4 py-2 rounded-xl max-w-md text-left">
                        <span className="font-bold block mb-1">🎉 스쿨큐 시스템 알림</span>
                        <p className="text-[11px] leading-relaxed">{msg.text}</p>
                      </div>
                    </div>
                  );
                }

                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                  >
                    <span className="text-[10px] text-slate-400 mb-1 px-1">
                      {isMe ? '나' : msg.senderName}
                    </span>

                    <div
                      className={`max-w-[82%] sm:max-w-md rounded-2xl px-4 py-2.5 text-xs sm:text-sm shadow-2xs leading-relaxed whitespace-pre-wrap ${
                        isMe
                          ? 'bg-blue-600 text-white rounded-br-xs'
                          : 'bg-white text-slate-800 border border-slate-200 rounded-bl-xs'
                      }`}
                    >
                      {msg.text}

                      {/* Photo Solution Attachment */}
                      {msg.attachmentType === 'photo_solution' && msg.attachmentData?.url && (
                        <div className="mt-2.5 rounded-xl overflow-hidden border border-slate-200/60 bg-black/5">
                          <img
                            src={msg.attachmentData.url}
                            alt="풀이 노트"
                            onClick={() => setPreviewPhotoUrl(msg.attachmentData?.url || null)}
                            className="w-full h-36 object-cover cursor-pointer hover:opacity-95 transition-opacity"
                          />
                          <div className={`p-2 text-[11px] ${isMe ? 'text-blue-100' : 'text-slate-700'}`}>
                            <span className="font-bold block">{msg.attachmentData.title}</span>
                            <span>{msg.attachmentData.caption}</span>
                          </div>
                        </div>
                      )}

                      {/* Math Formula Attachment */}
                      {msg.attachmentType === 'math_formula' && msg.attachmentData?.latex && (
                        <div className={`mt-2 p-2 rounded-lg font-mono text-xs ${isMe ? 'bg-blue-700 text-blue-100' : 'bg-slate-100 text-slate-800'}`}>
                          📐 공식: {msg.attachmentData.latex}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-1 px-1">
                      <span>
                        {new Date(msg.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                      {isMe && <span className="text-blue-500 font-bold">읽음</span>}
                    </div>
                  </div>
                );
              })}

              {/* Partner Typing Indicator */}
              {isPartnerTyping && (
                <div className="flex items-center gap-2 text-xs text-slate-500 bg-white border border-slate-200 rounded-full px-3 py-1.5 w-fit shadow-xs animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
                  <span>{partner.name} 님이 답변을 입력 중입니다... ✍️</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Math Formula Snippet Toolbar (Collapsible) */}
            {showMathBar && (
              <div className="bg-slate-100 border-t border-slate-200 p-2.5 flex items-center gap-2 overflow-x-auto text-xs">
                <span className="text-slate-500 font-bold text-[11px] shrink-0">수식 삽입:</span>
                {mathSnippets.map((m) => (
                  <button
                    key={m.label}
                    onClick={() => setInputText((prev) => prev + ` ${m.latex} `)}
                    className="bg-white hover:bg-blue-50 hover:text-blue-700 border border-slate-200 text-slate-700 text-[11px] px-2.5 py-1 rounded-md shrink-0 font-mono cursor-pointer transition-colors"
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            )}

            {/* Quick Study Prompt Chips */}
            <div className="px-5 py-2 bg-white border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto text-xs">
              <span className="text-slate-400 text-[11px] shrink-0">빠른 질문:</span>
              {[
                '선생님 서술형 감점 팁 더 알 수 있을까요?',
                '부교재 변형 문제 혹시 또 있었나요?',
                '답변해주셔서 정말 감사합니다! 시험 잘 볼게요 🔥'
              ].map((chip) => (
                <button
                  key={chip}
                  onClick={() => handleSendMessage(chip)}
                  className="bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-600 text-[11px] px-2.5 py-1 rounded-full whitespace-nowrap transition-colors cursor-pointer shrink-0"
                >
                  {chip}
                </button>
              ))}
            </div>

            {/* Message Input Box with Math & Attachment Actions */}
            <div className="p-4 bg-white border-t border-slate-200 space-y-2">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowMathBar(!showMathBar)}
                  className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
                    showMathBar ? 'bg-blue-50 border-blue-300 text-blue-700' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                  title="수학 공식 특수문자 삽입"
                >
                  <Calculator className="w-4 h-4" />
                  <span className="hidden sm:inline">공식</span>
                </button>

                <button
                  type="button"
                  onClick={handleSendPhotoNote}
                  className="p-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                  title="손글씨 풀이 오답노트 사진 첨부"
                >
                  <Image className="w-4 h-4 text-emerald-600" />
                  <span className="hidden sm:inline">풀이사진</span>
                </button>

                <input
                  type="text"
                  placeholder={`${partner.name}에게 보낼 메시지 (Enter로 전송)...`}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />

                <button
                  onClick={() => handleSendMessage()}
                  disabled={!inputText.trim() || isSending}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white p-2.5 rounded-xl shadow-xs transition-colors cursor-pointer flex items-center justify-center shrink-0"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-500 space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <MessageSquare className="w-8 h-8" />
            </div>
            <h3 className="font-bold text-base text-slate-800">대화방을 선택해주세요</h3>
            <p className="text-xs text-slate-500 max-w-sm">
              왼쪽 목록에서 대화할 선배나 친구를 선택하거나, Q&A 게시판에서 마음에 든 답변을 채택하여 새 공부 대화방을 시작하세요.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
