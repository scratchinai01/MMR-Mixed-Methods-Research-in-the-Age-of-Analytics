import React from 'react';
import { VoicePickerButton } from './VoicePicker.tsx';
import { 
  BookOpen, 
  TrendingUp, 
  Sparkles, 
  HelpCircle, 
  Database, 
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
  // 分頁按鈕共用樣式：底線式分頁，目前所在分頁以靛藍底線標示
  const tabClass = (tab: HeaderProps['currentTab']) =>
    `relative flex items-center gap-1.5 px-3 h-11 text-sm font-semibold whitespace-nowrap transition-colors ${
      currentTab === tab
        ? 'text-indigo-700 after:absolute after:left-2 after:right-2 after:bottom-0 after:h-0.5 after:rounded-full after:bg-indigo-600'
        : 'text-slate-500 hover:text-slate-900'
    }`;

  // 右側工具列的小按鈕共用樣式
  const toolBtn =
    'flex items-center gap-1.5 h-9 px-2.5 rounded-lg text-xs font-semibold border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-colors whitespace-nowrap shrink-0';

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ── 第一列：品牌名稱（左）＋ 工具按鈕（右） ── */}
        <div className="flex items-center justify-between h-14 gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-sky-600 flex items-center justify-center text-white shrink-0">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="font-bold text-slate-900 text-sm sm:text-base tracking-tight truncate">
                台股研究復刻與沈浸式翻譯
              </div>
              <p className="text-[11px] text-slate-500 truncate hidden sm:block">
                Mixed Methods Research (MMR) × FinMind 實證沙盒
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {/* 連線狀態：FinMind 與 AI 合併成一組 */}
            <div className="hidden lg:flex items-center h-9 rounded-lg border border-slate-200 bg-slate-50 divide-x divide-slate-200 text-xs font-semibold text-slate-700 overflow-hidden">
              <button
                onClick={onOpenFinmindModal}
                title="查看 FinMind 台股數據工具狀態與規格"
                className="flex items-center gap-1.5 px-2.5 h-full hover:bg-slate-100 transition-colors"
              >
                <Database className="w-3.5 h-3.5 text-indigo-600" />
                <span>FinMind</span>
                <span className={`w-1.5 h-1.5 rounded-full ${finmindVerified ? 'bg-emerald-500' : 'bg-slate-300'}`} />
              </button>
              {onOpenGeminiTestModal && (
                <button
                  onClick={onOpenGeminiTestModal}
                  title="確定 Gemini API 是否開通與正常運作"
                  className="flex items-center gap-1.5 px-2.5 h-full hover:bg-slate-100 transition-colors"
                >
                  <Zap className="w-3.5 h-3.5 text-emerald-600" />
                  <span>AI 連線狀態</span>
                </button>
              )}
            </div>

            <button
              onClick={onToggleSeniorMode}
              title="切換教授大字體模式（放大全站字體）"
              className={`${toolBtn} ${seniorMode ? '!bg-amber-400 !border-amber-500 !text-slate-950' : ''}`}
            >
              <span className="font-bold">A+</span>
              <span className="hidden md:inline">{seniorMode ? '大字體 1.3x' : '大字體'}</span>
            </button>

            <VoicePickerButton className={toolBtn} />

            <button
              onClick={onOpenGlossaryModal}
              title="查看論文專業術語表 (SCAR, GEE, LM詞典...)"
              className={`${toolBtn} !px-2`}
            >
              <HelpCircle className="w-4 h-4" />
            </button>

            {onOpenUploadModal && (
              <button
                onClick={onOpenUploadModal}
                title="上傳學術論文 (PDF/TXT)，由 AI 深度診斷混合研究方法 (MMR)"
                className={`${toolBtn} !text-indigo-700 !border-indigo-200 !bg-indigo-50 hover:!bg-indigo-100`}
              >
                <UploadCloud className="w-4 h-4" />
                <span className="hidden md:inline">上傳論文</span>
              </button>
            )}

            <button
              onClick={onOpenMmrModal}
              title="Mixed Method 研究解析（AI）"
              className="flex items-center gap-1.5 h-9 px-3 rounded-lg text-xs font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transition-colors whitespace-nowrap shrink-0"
            >
              <Sparkles className="w-4 h-4 text-amber-200" />
              <span className="hidden sm:inline">Mixed Method</span>
              <span className="sm:hidden">MMR</span>
            </button>
          </div>
        </div>

        {/* ── 第二列：主要分頁（手機版可左右滑動） ── */}
        <div className="flex items-center justify-between gap-3 -mb-px">
          <nav className="flex items-center overflow-x-auto no-scrollbar -mx-3 px-1">
            <button onClick={() => onSelectTab('reader')} className={tabClass('reader')}>
              <BookOpen className="w-4 h-4 shrink-0" />
              <span>論文翻譯</span>
            </button>
            <button onClick={() => onSelectTab('replication')} className={tabClass('replication')}>
              <TrendingUp className="w-4 h-4 shrink-0" />
              <span>台股復刻</span>
            </button>
            <button onClick={() => onSelectTab('critique')} className={tabClass('critique')}>
              <Sparkles className="w-4 h-4 shrink-0" />
              <span>方法論思辨</span>
            </button>
            <button onClick={() => onSelectTab('thesis_report')} className={tabClass('thesis_report')}>
              <Presentation className="w-4 h-4 shrink-0" />
              <span>論文報告</span>
            </button>
          </nav>

          {/* 從簡報跳到其他頁時，提供快速返回 */}
          {returnToThesisSlide && currentTab !== 'thesis_report' && onReturnToThesis && (
            <button
              onClick={onReturnToThesis}
              title={`返回剛才檢視的口試簡報 Slide ${returnToThesisSlide}`}
              className="flex items-center gap-1.5 h-8 px-3 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs whitespace-nowrap shrink-0"
            >
              <Presentation className="w-3.5 h-3.5" />
              <span>返回簡報 Slide {returnToThesisSlide}</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
