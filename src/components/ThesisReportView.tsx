import React, { useState, useEffect, useRef } from 'react';
import { ConferencePaper } from './ConferencePaper.tsx';
import type { RepLink } from '../data/deckLinks.ts';
import { 
  Presentation, 
  FileText, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  Play, 
  Pause, 
  RotateCcw, 
  Printer, 
  Copy, 
  Check, 
  Sparkles, 
  Download, 
  BookOpen, 
  HelpCircle, 
  Award, 
  TrendingUp, 
  Cpu, 
  Share2, 
  Layers, 
  Maximize2, 
  Minimize2, 
  AlertTriangle, 
  ExternalLink,
  Table,
  CheckCircle2,
  Bookmark,
  Volume2,
  VolumeX,
  MessageSquare,
  Languages,
  ArrowRight,
  ArrowLeft,
  X,
  Type
} from 'lucide-react';
import { ThesisDeck, buildDeckScript } from './ThesisDeck.tsx';
import { DECK, DECK_TOTAL_MINUTES } from '../data/thesisDeck.tsx';
import { MathRenderer } from './MathRenderer.tsx';
import { TAIWAN_REPLICATION_GEE_TABLE } from '../data/finmindTaiwanData.ts';
import { useMlResults } from '../services/mlResults.ts';

export interface SlideMappingItem {
  id: number;
  title: string;
  readerSection: string;
  sectionLabel: string;
  taiwanFocus: string;
  enExcerpt: string;
  zhExcerpt: string;
  sourceCitation: string;
}


interface ThesisReportViewProps {
  onAskGemini: (prompt: string) => void;
  onNavigateToReplication?: (slideNum?: number, link?: RepLink) => void;
  onNavigateToReader?: (section?: string, slideNum?: number) => void;
  initialSlide?: number;
  onSlideChange?: (slide: number) => void;
}

export const ThesisReportView: React.FC<ThesisReportViewProps> = ({
  onAskGemini,
  onNavigateToReplication,
  onNavigateToReader,
  initialSlide = 1,
  onSlideChange,
}) => {
  // 機器學習比較表：有真實計算結果就用真實結果，否則顯示示範數字
  const mlResults = useMlResults();
  // Mode: 'slides' (簡報投影片投影模式) | 'manuscript' (學術書面報告書模式)
  const [viewMode, setViewMode] = useState<'slides' | 'manuscript'>('slides');
  const [currentSlide, setCurrentSlide] = useState<number>(initialSlide);
  const [showSpeakerNotes, setShowSpeakerNotes] = useState<boolean>(true);
  const [useSerifFont, setUseSerifFont] = useState<boolean>(false);
  const [fontFamily, setFontFamily] = useState<'sans' | 'serif' | 'mono'>('sans');
  const [fontScale, setFontScale] = useState<'sm' | 'md' | 'lg'>('md');
  const [copiedDraft, setCopiedDraft] = useState<boolean>(false);
  // 從台股復刻／論文翻譯跳回來時若仍在全螢幕，直接回到投影模式
  const [isFullscreen, setIsFullscreen] = useState<boolean>(() => typeof document !== 'undefined' && !!document.fullscreenElement);
  const [selectedCommitteeQ, setSelectedCommitteeQ] = useState<number | null>(null);

  // Side Drawer for Instant Bilingual Paper Text Preview
  const [sideDrawerOpen, setSideDrawerOpen] = useState<boolean>(false);

  // Current Slide Mapping Item

  // Sync initialSlide when changed
  useEffect(() => {
    if (initialSlide && initialSlide >= 1 && initialSlide <= DECK.length) {
      setCurrentSlide(initialSlide);
    }
  }, [initialSlide]);

  const goToSlide = (slideNum: number) => {
    const clamped = Math.max(1, Math.min(slideNum, 8));
    setCurrentSlide(clamped);
    onSlideChange?.(clamped);
  };

  // Slide Aspect Ratio & Deck Width States (解決 PPT 視覺太扁問題)
  const [aspectRatio, setAspectRatio] = useState<'16:10' | '16:9' | '4:3' | 'auto'>('16:10');
  const [deckWidth, setDeckWidth] = useState<'focused' | 'wide' | 'full'>('focused');

  // Timer states (Defense Practice Timer)
  // 預設兩小時（原文報告 40＋台股復刻 60＋復刻後比較 20）
  const [timerDurationMinutes, setTimerDurationMinutes] = useState<number>(DECK_TOTAL_MINUTES);
  const [timerSecondsLeft, setTimerSecondsLeft] = useState<number>(DECK_TOTAL_MINUTES * 60);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);

  const totalSlides = 8;
  const slideContainerRef = useRef<HTMLDivElement>(null);

  // Timer interval effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isTimerRunning && timerSecondsLeft > 0) {
      interval = setInterval(() => {
        setTimerSecondsLeft((prev) => {
          if (prev <= 1) {
            setIsTimerRunning(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning, timerSecondsLeft]);

  const handleResetTimer = (minutes = timerDurationMinutes) => {
    setIsTimerRunning(false);
    setTimerDurationMinutes(minutes);
    setTimerSecondsLeft(minutes * 60);
  };

  const formatTimer = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Keyboard navigation for slides
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (viewMode !== 'slides') return;
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') {
        e.preventDefault();
        setCurrentSlide((prev) => Math.min(prev + 1, totalSlides));
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        setCurrentSlide((prev) => Math.max(prev - 1, 1));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [viewMode, totalSlides]);

  // Fullscreen toggle
  // 全螢幕投影：整份文件進入全螢幕（不是只有投影片容器），
  // 這樣選字朗讀、翻譯、AI 解析、語音設定、名詞彈窗等浮層在全螢幕下都看得到。
  const toggleFullscreen = () => {
    if (!isFullscreen) {
      setIsFullscreen(true);
      document.documentElement.requestFullscreen?.().catch(() => {});
    } else {
      setIsFullscreen(false);
      if (document.fullscreenElement) document.exitFullscreen?.().catch(() => {});
    }
  };

  useEffect(() => {
    const onFsChange = () => { if (!document.fullscreenElement) setIsFullscreen(false); };
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  // 投影模式：鎖住背後頁面捲動；瀏覽器不支援全螢幕時 Esc 也能退出
  useEffect(() => {
    if (!isFullscreen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.body.classList.add('deck-present');
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape' && !document.fullscreenElement) setIsFullscreen(false); };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      document.body.classList.remove('deck-present');
      window.removeEventListener('keydown', onKey);
    };
  }, [isFullscreen]);

  // 離開簡報模式或離開本頁時，一併退出全螢幕
  useEffect(() => {
    if (viewMode !== 'slides' && isFullscreen) toggleFullscreen();
  }, [viewMode]);

  // Print manuscript handler
  const handlePrint = () => {
    window.print();
  };

  // Copy speech draft handler
  const handleCopyDraft = () => {
    const paper = viewMode === 'manuscript' ? (document.querySelector('.manuscript-container article') as HTMLElement | null)?.innerText : null;
    const speechDraft = paper || buildDeckScript({ data: mlResults.isDemo ? null : mlResults.data });
    navigator.clipboard.writeText(speechDraft);
    setCopiedDraft(true);
    setTimeout(() => setCopiedDraft(false), 2500);
  };


  return (
    <div className={`w-full min-h-screen bg-slate-100 ${useSerifFont ? 'font-serif' : 'font-sans'} text-slate-900 pb-24`}>
      {/* Print Specific CSS */}
      <style>{`
        @media print {
          body { background: white !important; font-size: 11pt !important; }
          header, nav, .no-print, button { display: none !important; }
          .manuscript-container { max-width: 100% !important; margin: 0 !important; padding: 0 !important; box-shadow: none !important; border: none !important; }
          .page-break { page-break-after: always; }
          .three-line-table { border-top: 2px solid #000 !important; border-bottom: 2px solid #000 !important; }
          .three-line-table th { border-bottom: 1px solid #000 !important; }
        }
      `}</style>

      {/* 頁面工具列：左為標題，右為模式切換與口試工具 */}
      <div className="sticky top-[101px] z-20 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 sm:px-6 lg:px-8 py-2.5">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 text-sm sm:text-base truncate">
                學術論文專題報告與口試答辯
              </span>
              <span className="hidden sm:inline px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 whitespace-nowrap">
                SSCI Q1 口試規格
              </span>
            </div>
            <p className="text-[11px] text-slate-500 hidden md:block truncate">
              Raman et al. (2022) IJIM 混合方法與台股實證全景報告
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* 模式切換 */}
          <div className="flex items-center h-9 bg-slate-100 p-0.5 rounded-lg border border-slate-200">
            <button
              onClick={() => setViewMode('slides')}
              className={`flex items-center gap-1.5 px-3 h-full rounded-md text-xs font-bold transition-all ${
                viewMode === 'slides'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Presentation className="w-3.5 h-3.5" />
              <span>簡報模式</span>
            </button>
            <button
              onClick={() => setViewMode('manuscript')}
              className={`flex items-center gap-1.5 px-3 h-full rounded-md text-xs font-bold transition-all ${
                viewMode === 'manuscript'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>書面報告</span>
            </button>
          </div>

            {/* Defense Timer Widget */}
            <div className="flex items-center gap-1.5 h-9 px-3 rounded-lg bg-slate-900 text-white text-xs font-mono border border-slate-800">
              <Clock className={`w-3.5 h-3.5 ${timerSecondsLeft < 120 ? 'text-rose-400 animate-pulse' : 'text-amber-400'}`} />
              <span className={`font-bold tracking-wider ${timerSecondsLeft < 120 ? 'text-rose-300' : 'text-white'}`}>
                {formatTimer(timerSecondsLeft)}
              </span>
              <button
                onClick={() => setIsTimerRunning(!isTimerRunning)}
                className="p-1 hover:text-amber-300 transition-colors cursor-pointer"
                title={isTimerRunning ? '暫停計時' : '開始計時'}
              >
                {isTimerRunning ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
              </button>
              <button
                onClick={() => handleResetTimer(timerDurationMinutes)}
                className="p-1 hover:text-slate-300 transition-colors cursor-pointer"
                title="重設計時器"
              >
                <RotateCcw className="w-3 h-3" />
              </button>
              <select
                aria-label="口試演練計時設定（分鐘）"
                value={timerDurationMinutes}
                onChange={(e) => handleResetTimer(Number(e.target.value))}
                className="bg-slate-800 text-slate-200 text-[10px] rounded px-1 py-0.5 outline-hidden border border-slate-700"
              >
                <option value={10}>10分</option>
                <option value={15}>15分</option>
                <option value={20}>20分</option>
                <option value={60}>60分</option>
                <option value={90}>90分</option>
                <option value={120}>120分</option>
              </select>
            </div>

            {/* Quick Actions */}
            <button
              onClick={handleCopyDraft}
              className="hidden md:flex items-center gap-1 h-9 px-3 rounded-lg bg-white border border-slate-200 hover:border-indigo-300 text-xs font-semibold text-slate-700 hover:text-indigo-600 transition-colors shadow-2xs"
              title="複製口試發表標準逐字講稿"
            >
              {copiedDraft ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedDraft ? '已複製講稿' : '複製口試講稿'}</span>
            </button>

            {viewMode === 'manuscript' ? (
              <button
                onClick={handlePrint}
                className="flex items-center gap-1 h-9 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-colors shadow-xs"
                title="列印或存為 PDF"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>列印 / 存 PDF</span>
              </button>
            ) : (
              <button
                onClick={toggleFullscreen}
                className="flex items-center gap-1 h-9 px-3 rounded-lg bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold transition-colors shadow-xs"
                title="全螢幕投影"
              >
                {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                <span>{isFullscreen ? '退出全螢幕' : '投影全螢幕'}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {/* ========================================================= */}
        {/* VIEW MODE 1: SLIDE PRESENTATION DECK (簡報投影片投影模式) */}
        {/* ========================================================= */}
        {viewMode === 'slides' && (
          // 兩小時三段式報告：原文報告 40｜台股復刻 60｜復刻後比較 20，每頁左右對照
          <div
            ref={slideContainerRef}
            className={isFullscreen ? 'fixed inset-0 z-[35] bg-slate-800 p-2 sm:p-3' : 'max-w-7xl mx-auto bg-slate-50'}
          >
            <ThesisDeck
              initialSlide={currentSlide}
              onSlideChange={(n) => { setCurrentSlide(n); onSlideChange?.(n); }}
              elapsedSeconds={timerDurationMinutes * 60 - timerSecondsLeft}
              timerActive={isTimerRunning}
              onJumpReplication={(link, n) => onNavigateToReplication?.(n, link)}
              onJumpReader={(section, n) => onNavigateToReader?.(section, n)}
              present={isFullscreen}
              onExitPresent={toggleFullscreen}
            />
          </div>
        )}

        {/* ========================================================= */}
        {/* VIEW MODE 2: FORMAL ACADEMIC MANUSCRIPT (論文書面報告模式) */}
        {/* ========================================================= */}
        {viewMode === 'manuscript' && (
          <div className="manuscript-container bg-white rounded-3xl border border-slate-300 shadow-xl p-8 sm:p-14 max-w-5xl mx-auto space-y-10">
            {/* Top Typography & Tools Bar */}
            <div className="no-print flex items-center justify-between border-b border-slate-200 pb-4 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-700">書面排版字體：</span>
                <button
                  onClick={() => setUseSerifFont(false)}
                  className={`px-2.5 py-1 rounded ${!useSerifFont ? 'bg-indigo-600 text-white font-bold' : 'bg-slate-100 text-slate-700'}`}
                >
                  無襯線體 (Sans-Serif)
                </button>
                <button
                  onClick={() => setUseSerifFont(true)}
                  className={`px-2.5 py-1 rounded font-serif ${useSerifFont ? 'bg-indigo-600 text-white font-bold' : 'bg-slate-100 text-slate-700'}`}
                >
                  學術明體 (Serif)
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyDraft}
                  className="flex items-center gap-1 px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
                >
                  {copiedDraft ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>複製書面稿</span>
                </button>
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-1 px-3 py-1 rounded-lg bg-indigo-600 text-white font-bold hover:bg-indigo-700"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>列印此學術報告</span>
                </button>
              </div>
            </div>

            <div className={useSerifFont ? 'font-serif' : ''}>
              <ConferencePaper data={mlResults.isDemo ? null : mlResults.data} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
