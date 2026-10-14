import React, { useState } from 'react';
import { 
  X, 
  Download, 
  Github, 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink, 
  Sparkles, 
  Copy, 
  Check, 
  FileArchive,
  Terminal
} from 'lucide-react';

interface DownloadExportModalProps {
  onClose: () => void;
}

export const DownloadExportModal: React.FC<DownloadExportModalProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'github' | 'zip'>('github');
  const [gitToken, setGitToken] = useState('');
  const [repoUrl, setRepoUrl] = useState('https://github.com/wryi0520/schoolchat.git');
  const [isPushing, setIsPushing] = useState(false);
  const [pushResult, setPushResult] = useState<{ success: boolean; message: string } | null>(null);

  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [copiedCurl, setCopiedCurl] = useState(false);

  // Reliable Blob-based download for iframe environments
  const handleBlobDownload = async () => {
    setIsDownloading(true);
    setDownloadSuccess(false);
    try {
      const res = await fetch('/api/download-zip');
      if (!res.ok) throw new Error('파일을 가져오지 못했습니다.');
      const blob = await res.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = blobUrl;
      a.download = 'schoolchat.zip';
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(blobUrl);
      }, 500);
      setDownloadSuccess(true);
    } catch (err: any) {
      alert('다운로드 오류: ' + (err.message || '다시 시도해주세요.'));
    } finally {
      setIsDownloading(false);
    }
  };

  const handleOpenDirect = () => {
    // Open in full window
    window.open('/api/download-zip', '_blank');
  };

  // Push directly to GitHub
  const handleGitPush = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gitToken.trim()) return;

    setIsPushing(true);
    setPushResult(null);
    try {
      const res = await fetch('/api/git/push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: gitToken.trim(),
          repoUrl: repoUrl.trim()
        })
      });
      const data = await res.json();
      if (data.success) {
        setPushResult({ success: true, message: data.message });
      } else {
        setPushResult({ success: false, message: data.error || '푸시에 실패했습니다.' });
      }
    } catch (err: any) {
      setPushResult({ success: false, message: '통신 오류: ' + err.message });
    } finally {
      setIsPushing(false);
    }
  };

  const curlCommand = `curl -O ${window.location.origin}/api/download-zip && unzip download-zip -d schoolchat`;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center">
              <Github className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm">GitHub 저장 및 소스코드 다운로드</h3>
              <p className="text-slate-500 text-[11px]">SchoolQ 프로젝트를 깃허브에 올리거나 PC로 받기</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex items-center border-b border-slate-200 bg-slate-100/60 px-6 pt-3 gap-4 text-xs font-bold">
          <button
            onClick={() => setActiveTab('github')}
            className={`pb-2.5 border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'github'
                ? 'border-blue-600 text-blue-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Github className="w-4 h-4" />
            <span>GitHub 즉시 자동 푸시 (추천 ⚡)</span>
          </button>

          <button
            onClick={() => setActiveTab('zip')}
            className={`pb-2.5 border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'zip'
                ? 'border-blue-600 text-blue-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileArchive className="w-4 h-4" />
            <span>내 PC로 ZIP 다운로드</span>
          </button>
        </div>

        <div className="p-6 space-y-4">
          {activeTab === 'github' ? (
            /* Direct GitHub Push */
            <form onSubmit={handleGitPush} className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-xs text-blue-900 leading-relaxed">
                💡 다운로드 받을 필요 없이, <strong>GitHub 개인 토큰(Personal Access Token)</strong>만 입력하시면
                여기서 <strong className="text-blue-700">https://github.com/wryi0520/schoolchat</strong>으로 바로 업로드해 드립니다!
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  GitHub 원격 저장소 URL
                </label>
                <input
                  type="text"
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono text-slate-800"
                  required
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700">
                    GitHub Personal Access Token (classic)
                  </label>
                  <a
                    href="https://github.com/settings/tokens/new"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-blue-600 hover:underline font-semibold flex items-center gap-0.5"
                  >
                    <span>토큰 발급하러 가기</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <input
                  type="password"
                  placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                  value={gitToken}
                  onChange={(e) => setGitToken(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  required
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  * 토큰 발급 시 <strong>`repo`</strong> 체크박스를 선택하셔야 푸시 권한이 부여됩니다.
                </span>
              </div>

              {pushResult && (
                <div
                  className={`p-3 rounded-xl border text-xs leading-relaxed ${
                    pushResult.success
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                      : 'bg-red-50 border-red-300 text-red-900'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-bold mb-0.5">
                    {pushResult.success ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>푸시 성공!</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-4 h-4 text-red-600" />
                        <span>푸시 실패</span>
                      </>
                    )}
                  </div>
                  <p className="text-[11px]">{pushResult.message}</p>
                  {pushResult.success && (
                    <a
                      href={repoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-blue-700 font-bold underline mt-2"
                    >
                      <span>내 깃허브 저장소 확인하기</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              )}

              <button
                type="submit"
                disabled={isPushing || !gitToken.trim()}
                className="w-full bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white font-bold text-xs py-2.5 rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <Github className="w-4 h-4" />
                <span>{isPushing ? 'GitHub 저장소로 푸시 중...' : 'GitHub으로 즉시 푸시하기'}</span>
              </button>
            </form>
          ) : (
            /* ZIP Download */
            <div className="space-y-4 text-xs">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-2 text-slate-800 font-bold">
                  <FileArchive className="w-4 h-4 text-blue-600" />
                  <span>schoolchat.zip (전체 풀스택 소스코드)</span>
                </div>
                <p className="text-slate-600 leading-relaxed text-[11px]">
                  웹 브라우저의 보안 정책으로 일반 다운로드가 막힌 경우, 아래 방법으로 직접 다운로드할 수 있습니다:
                </p>

                <div className="flex flex-col sm:flex-row gap-2 pt-1">
                  <button
                    onClick={handleBlobDownload}
                    disabled={isDownloading}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    <span>{isDownloading ? '다운로드 준비 중...' : 'PC로 직접 파일 받기'}</span>
                  </button>

                  <button
                    onClick={handleOpenDirect}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>새 창에서 다운로드</span>
                  </button>
                </div>

                {downloadSuccess && (
                  <div className="flex items-center gap-1.5 text-emerald-700 bg-emerald-50 p-2 rounded-lg font-bold text-xs">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>다운로드가 시작되었습니다! 브라우저 다운로드 폴더를 확인하세요.</span>
                  </div>
                )}
              </div>

              {/* Terminal command fallback */}
              <div className="space-y-1">
                <span className="font-bold text-slate-700 text-[11px] flex items-center gap-1">
                  <Terminal className="w-3.5 h-3.5" />
                  내 PC 터미널에서 한 줄로 받기:
                </span>
                <div className="bg-slate-900 text-slate-100 p-2.5 rounded-xl font-mono text-[10px] flex items-center justify-between">
                  <span className="truncate pr-2">curl -O {window.location.origin}/api/download-zip</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(`curl -O ${window.location.origin}/api/download-zip`);
                      setCopiedCurl(true);
                      setTimeout(() => setCopiedCurl(false), 2000);
                    }}
                    className="text-slate-400 hover:text-white shrink-0 cursor-pointer"
                  >
                    {copiedCurl ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
