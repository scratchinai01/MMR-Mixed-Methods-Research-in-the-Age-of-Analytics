import React from 'react';
import { 
  BookOpen, 
  TrendingUp, 
  Sparkles, 
  HelpCircle, 
  Database, 
  CheckCircle2,
  Flame,
  GraduationCap,
  UploadCloud,
  Zap,
  Presentation
} from 'lucide-react';

interface HeaderProps {
  currentTab: 'reader' | 'replication' | 'critique' | 'thesis_report';
  onSelectTab: (tab: 'reader' | 'replication' | 'critique' | 'thesis_report') => void;
  onOpenMmrModal: () => void;
  onOpenGlossaryModal: () => void;
  finmindVerified: boolean;
  onOpenFinmindModal: () => void;
  onOpenUploadModal?: () => void;
  onOpenGeminiTestModal?: () => void;
  seniorMode: boolean;
  onToggleSeniorMode: () => void;
  returnToThesisSlide?: number | null;
  onReturnToThesis?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  onOpenMmrModal,
  onOpenGlossaryModal,
  finmindVerified,
  onOpenFinmindModal,
  onOpenUploadModal,
  onOpenGeminiTestModal,
  seniorMode,
  onToggleSeniorMode,
  returnToThesisSlide,
  onReturnToThesis,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-2">
          {/* Brand & Title */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-700 to-sky-600 flex items-center justify-center text-white shadow-sm shadow-indigo-200 shrink-0">
              <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-slate-900 text-sm sm:text-base lg:text-lg tracking-tight whitespace-nowrap">
                  台股研究復刻與沈浸式翻譯
                </span>
                <span className="hidden xl:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                  白天模式
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden 2xl:block truncate max-w-xs">
                Mixed Methods Research (MMR) × FinMind 實證沙盒
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center gap-1 sm:gap-1.5 shrink-0">
            <button
              onClick={() => onSelectTab('reader')}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                currentTab === 'reader'
                  ? 'bg-indigo-50 text-indigo-700 shadow-xs border border-indigo-100'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <BookOpen className="w-4 h-4 shrink-0" />
              <span>論文翻譯</span>
            </button>

            <button
              onClick={() => onSelectTab('replication')}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                currentTab === 'replication'
                  ? 'bg-indigo-50 text-indigo-700 shadow-xs border border-indigo-100'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <TrendingUp className="w-4 h-4 shrink-0" />
              <span>台股復刻</span>
              <span className="hidden xl:inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold bg-indigo-100 text-indigo-800">
                FinMind
              </span>
            </button>

            <button
              onClick={() => onSelectTab('critique')}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                currentTab === 'critique'
                  ? 'bg-indigo-50 text-indigo-700 shadow-xs border border-indigo-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
              <span>方法論思辨</span>
              <span className="hidden xl:inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold bg-indigo-100 text-indigo-800">
                實質價值
              </span>
            </button>

            <button
              onClick={() => onSelectTab('thesis_report')}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                currentTab === 'thesis_report'
                  ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-md shadow-indigo-200'
                  : 'text-indigo-900 bg-indigo-50/70 hover:bg-indigo-100/90 border border-indigo-200/60'
              }`}
            >
              <Presentation className="w-4 h-4 shrink-0 text-amber-300" />
              <span>論文報告</span>
              <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                currentTab === 'thesis_report' 
                  ? 'bg-amber-400 text-slate-950' 
                  : 'bg-amber-100 text-amber-900 border border-amber-300'
              }`}>
                口試簡報
              </span>
            </button>

            {/* Quick Return to Thesis PPT Button (當在其他頁面時高亮顯示) */}
            {returnToThesisSlide && currentTab !== 'thesis_report' && onReturnToThesis && (
              <button
                onClick={onReturnToThesis}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-extrabold text-xs shadow-md shadow-amber-300/40 border border-amber-300 transition-all animate-pulse cursor-pointer whitespace-nowrap"
                title={`返回剛才檢視的口試簡報 Slide ${returnToThesisSlide}`}
              >
                <Presentation className="w-3.5 h-3.5 text-slate-950" />
                <span>返回簡報 Slide {returnToThesisSlide}</span>
              </button>
            )}
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* FinMind Pro Status Pill */}
            <button
              onClick={onOpenFinmindModal}
              title="查看 FinMind 台股數據工具狀態與規格"
              className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs text-slate-700 transition-colors shrink-0 whitespace-nowrap"
            >
              <Database className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
              <span>FinMind 工具</span>
              {finmindVerified ? (
                <span className="flex items-center text-emerald-600 font-medium">
                  <CheckCircle2 className="w-3 h-3 ml-0.5" /> 連線
                </span>
              ) : (
                <span className="text-slate-400">沙盒中</span>
              )}
            </button>

            {/* Gemini API Status Test Button */}
            {onOpenGeminiTestModal && (
              <button
                onClick={onOpenGeminiTestModal}
                title="確定 Groq / Gemini API 是否開通與正常運作"
                className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-all active:scale-95 shrink-0 whitespace-nowrap shadow-2xs cursor-pointer"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>AI 連線狀態</span>
              </button>
            )}

            {/* Senior Large Font Mode Toggle Button */}
            <button
              onClick={onToggleSeniorMode}
              title="切換教授大字體模式 (70歲長者友善放大字體)"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs shrink-0 whitespace-nowrap ${
                seniorMode
                  ? 'bg-amber-400 text-slate-950 ring-2 ring-amber-500'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              <span>🧓 教授大字體</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-bold ${
                seniorMode ? 'bg-slate-950 text-amber-300' : 'bg-slate-200 text-slate-600'
              }`}>
                {seniorMode ? '1.3x 放大' : '標準'}
              </span>
            </button>

            {/* Glossary Button */}
            <button
              onClick={onOpenGlossaryModal}
              title="查看論文專業術語表 (SCAR, GEE, LM詞典...)"
              className="p-1.5 sm:p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors shrink-0 cursor-pointer"
            >
              <HelpCircle className="w-4 h-4" />
            </button>

            {/* Upload Paper MMR Analysis Button */}
            {onOpenUploadModal && (
              <button
                onClick={onOpenUploadModal}
                title="上傳學術論文 (PDF/TXT)，由 Gemini 深度診斷混合研究方法 (MMR)"
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition-all active:scale-95 shrink-0 whitespace-nowrap shadow-2xs cursor-pointer"
              >
                <UploadCloud className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-600 shrink-0" />
                <span>上傳論文</span>
                <span className="hidden sm:inline-block text-[10px] font-bold px-1.5 py-0.2 rounded bg-indigo-200/70 text-indigo-900">
                  MMR診斷
                </span>
              </button>
            )}

            {/* DEDICATED MIXED METHOD BUTTON WITH GEMINI AI */}
            <button
              onClick={onOpenMmrModal}
              className="relative group flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 shadow-sm shadow-indigo-200 hover:shadow-md transition-all active:scale-95 shrink-0 whitespace-nowrap cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-pulse text-amber-200 shrink-0" />
              <span className="tracking-wide">Mixed Method</span>
              <span className="hidden sm:inline-block text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-400 text-slate-950">
                AI
              </span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
