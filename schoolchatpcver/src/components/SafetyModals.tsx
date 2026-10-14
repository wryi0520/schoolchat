import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  ShieldAlert, 
  AlertTriangle, 
  CheckCircle2, 
  Lock, 
  FileText, 
  UserX,
  Camera,
  Scan,
  Sparkles
} from 'lucide-react';
import { School, User } from '../types.ts';

// 1. School Verification Modal with OCR Scanner
interface SchoolVerifyModalProps {
  currentUser: User;
  schools: School[];
  onClose: () => void;
  onVerifySuccess: (updatedUser: User) => void;
}

export const SchoolVerifyModal: React.FC<SchoolVerifyModalProps> = ({
  currentUser,
  schools,
  onClose,
  onVerifySuccess
}) => {
  const [selectedSchoolId, setSelectedSchoolId] = useState(currentUser.schoolId);
  const [grade, setGrade] = useState(currentUser.grade);
  const [classNum, setClassNum] = useState(currentUser.classNum);
  const [studentCode, setStudentCode] = useState('2026-SEOUL-10312');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isOcrScanning, setIsOcrScanning] = useState(false);

  const handleSimulateOcr = () => {
    setIsOcrScanning(true);
    setTimeout(() => {
      setSelectedSchoolId('school-seoul-high');
      setGrade(1);
      setClassNum(3);
      setStudentCode('2026-SEOUL-10312');
      setIsOcrScanning(false);
    }, 1500);
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifying(true);
    try {
      const res = await fetch('/api/users/ocr-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          schoolId: selectedSchoolId,
          grade,
          classNum,
          studentName: currentUser.name,
          studentCode
        })
      });
      const data = await res.json();
      if (data.success) {
        onVerifySuccess(data.user);
        alert(data.message);
        onClose();
      } else {
        alert(data.error || '인증 처리에 실패했습니다.');
      }
    } catch {
      alert('인증 통신 오류가 발생했습니다.');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-slate-900 text-sm">학교 학생증 OCR 공식 인증</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleVerify} className="p-6 space-y-4">
          {/* OCR Scanner Box */}
          <div className="bg-slate-900 text-white rounded-xl p-4 relative overflow-hidden space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                <Scan className="w-4 h-4 text-emerald-400" /> 학생증 카메라 자동 스캐너
              </span>
              <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                AI NEIS 연동
              </span>
            </div>

            {isOcrScanning ? (
              <div className="py-6 text-center space-y-2 relative">
                <div className="absolute inset-x-0 h-1 bg-emerald-400 animate-bounce" />
                <p className="text-xs font-mono text-emerald-300">
                  [OCR] 학생증 바코드 및 학교 직인 판독 중...
                </p>
              </div>
            ) : (
              <div className="text-center py-3 space-y-2">
                <p className="text-xs text-slate-300">
                  학생증 실물이나 모바일 학생증 화면을 스캔하면 학교/학번이 자동 입력됩니다.
                </p>
                <button
                  type="button"
                  onClick={handleSimulateOcr}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>학생증 1초 자동 스캔하기</span>
                </button>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">소속 학교</label>
            <select
              value={selectedSchoolId}
              onChange={(e) => setSelectedSchoolId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold text-slate-800"
            >
              {schools.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.location})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">학년</label>
              <select
                value={grade}
                onChange={(e) => setGrade(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold text-slate-800"
              >
                <option value={1}>1학년</option>
                <option value={2}>2학년</option>
                <option value={3}>3학년</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">반</label>
              <input
                type="number"
                min={1}
                max={20}
                value={classNum}
                onChange={(e) => setClassNum(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold text-slate-800"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              학생증 번호 또는 나이스(NEIS) 인증코드
            </label>
            <input
              type="text"
              value={studentCode}
              onChange={(e) => setStudentCode(e.target.value)}
              placeholder="예: 2026-SEOUL-10312"
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono text-slate-800"
              required
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={isVerifying}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2 rounded-lg transition-colors cursor-pointer"
            >
              {isVerifying ? '인증 처리 중...' : '학생증 즉시 인증'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// 2. Report Modal
interface ReportModalProps {
  targetType: 'question' | 'answer' | 'chat_message' | 'user';
  targetId: string;
  targetAuthorName: string;
  onClose: () => void;
  onSubmitReport: (reason: string, details: string) => Promise<void>;
}

export const ReportModal: React.FC<ReportModalProps> = ({
  targetType,
  targetAuthorName,
  onClose,
  onSubmitReport
}) => {
  const [reason, setReason] = useState<string>('욕설/비방');
  const [details, setDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmitReport(reason, details);
      alert('신고가 성공적으로 접수되었습니다. 학교 운영진이 즉시 확인합니다.');
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-red-600" />
            <h3 className="font-bold text-slate-900 text-sm">신고 접수하기</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="text-xs text-slate-600">
            대상: <strong className="text-slate-900">{targetAuthorName}</strong> 님의{' '}
            {targetType === 'question' ? '질문' : targetType === 'answer' ? '답변' : '메시지'}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">신고 사유</label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium text-slate-800"
            >
              <option value="욕설/비방">욕설 및 비방, 언어폭력</option>
              <option value="시험부정행위/답안유출">시험 부정행위 / 답안지 무단 유출</option>
              <option value="불법홍보">상업적 홍보 및 광고</option>
              <option value="타학교/사칭">타학교 학생 의심 / 신원 사칭</option>
              <option value="기타">기타 부적절한 행위</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">상세 내용 (선택)</label>
            <textarea
              rows={3}
              placeholder="구체적인 상황을 적어주시면 빠른 제재 처리에 도움이 됩니다."
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs text-slate-800 placeholder-slate-400"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-4 py-2 rounded-lg cursor-pointer"
            >
              {isSubmitting ? '접수 중...' : '신고 접수'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// 3. Safety Center View
interface SafetyCenterViewProps {
  currentUser: User;
  onOpenVerifyModal: () => void;
  blockedUserIds: string[];
  allUsers: User[];
}

export const SafetyCenterView: React.FC<SafetyCenterViewProps> = ({
  currentUser,
  onOpenVerifyModal,
  blockedUserIds,
  allUsers
}) => {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-900 rounded-2xl p-6 text-white shadow-xs">
        <div className="flex items-center gap-2 text-emerald-300 text-xs font-semibold uppercase">
          <ShieldCheck className="w-4 h-4" />
          <span>SchoolQ 클린 & 세이프티 센터</span>
        </div>
        <h1 className="text-xl md:text-2xl font-bold mt-1">
          안전하고 신뢰할 수 있는 학교 스터디 커뮤니티
        </h1>
        <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-xl">
          스쿨큐는 같은 학교 재학생 간의 안전한 공부 환경을 위해 4대 보안 원칙을 엄격하게 적용하고 있습니다.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            1
          </div>
          <h3 className="font-bold text-sm text-slate-900">철저한 동일 학교 폐쇄형 1:1 대화</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            외부 학교나 성인 외부인의 무분별한 접근을 차단하기 위해, 같은 학교 학생증 인증을 완료한 학우 간에만 1:1 채팅이 열립니다.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-2">
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            2
          </div>
          <h3 className="font-bold text-sm text-slate-900">Q&A 답변 채택 기반 대화 개설</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            아무나 말을 걸 수 있는 오픈채팅과 달리, 유익한 답변을 작성하여 질문자가 채택했거나 상호 친구로 동의한 경우에만 1:1 DM이 활성화됩니다.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-2">
          <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
            3
          </div>
          <h3 className="font-bold text-sm text-slate-900">원클릭 신고 및 유해 콘텐츠 블라인드</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            비방, 욕설, 시험 부정행위 답안 유출 등 부적절한 게시글이나 메시지는 즉시 신고되어 학교 운영진의 검토를 거쳐 조치됩니다.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-2">
          <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center font-bold">
            4
          </div>
          <h3 className="font-bold text-sm text-slate-900">완벽한 유저 차단 (게시물 및 채팅 숨김)</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            불편함을 주는 사용자는 프로필에서 언제든 즉각 차단할 수 있으며, 차단된 사용자의 모든 글과 메시지는 실시간으로 감춰집니다.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
            <span>내 학교 인증 상태:</span>
            <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-xs font-extrabold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {currentUser.schoolName} ({currentUser.grade}학년) 인증 완료
            </span>
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            전학이나 학년 변동이 있을 경우 학생증 인증을 다시 진행할 수 있습니다.
          </p>
        </div>

        <button
          onClick={onOpenVerifyModal}
          className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-4 py-2.5 rounded-xl cursor-pointer self-start sm:self-auto"
        >
          학생증 재인증 / 학교 변경
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-3">
        <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
          <UserX className="w-4 h-4 text-red-600" />
          <span>차단된 사용자 목록 ({blockedUserIds.length}명)</span>
        </h3>
        {blockedUserIds.length === 0 ? (
          <p className="text-xs text-slate-500">현재 차단된 사용자가 없습니다.</p>
        ) : (
          <div className="flex flex-wrap gap-2 pt-1">
            {blockedUserIds.map((uid) => {
              const u = allUsers.find((x) => x.id === uid);
              return (
                <div
                  key={uid}
                  className="bg-red-50 text-red-800 border border-red-200 rounded-lg px-3 py-1 text-xs font-semibold flex items-center gap-2"
                >
                  <span>{u ? u.name : uid}</span>
                  <span className="text-[10px] text-red-500">(차단됨)</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
