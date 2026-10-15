import React, { useState, useMemo, useEffect } from 'react';
import { aiClick } from '../services/aiGate.ts';
import { makeUtterance } from '../services/ttsVoice.ts';
import { 
  BENCHMARK_PAPERS,
  PAPER_SECTIONS, 
  GLOSSARY_DICT
} from '../data/paperContent.ts';
import { 
  Search, 
  Sparkles, 
  BookOpen, 
  Languages, 
  Check, 
  ExternalLink,
  ChevronRight,
  TrendingDown,
  TrendingUp,
  Table as TableIcon,
  Info,
  Layers,
  Copy,
  FileText,
  X,
  GraduationCap,
  Globe,
  Volume2,
  VolumeX,
  Image as ImageIcon,
  Maximize2,
  ZoomIn,
  Zap,
  Presentation,
  ArrowLeft,
  Lightbulb,
  PanelLeftClose,
  PanelLeftOpen
} from 'lucide-react';
import { PdfImmersiveReader } from './PdfImmersiveReader.tsx';
import { PARA_EXPLAIN, buildExplainMarkdown } from '../data/paraExplain.ts';
import { findTerms } from '../data/termVocab.ts';
import { GLOSSARY_PLUS } from '../data/glossaryPlus.ts';

/** 段落下方的名詞小標籤：原本指定的＋英文原文中實際出現、且名詞辭典有條目的名詞（最多 4 個，避免版面雜亂） */
// 一般英文也常用、不一定是專有名詞的字：仍列在「深入解說」，但不做成標籤
const CHIP_SKIP = new Set(['significant', 'moderate', 'benchmark', 'uncertainty', 'dictionary', 'control variables']);
const chipCache = new Map<string, string[]>();
function chipTermsFor(para: { id: string; en: string; glossaryTerms?: string[] }): string[] {
  const hit = chipCache.get(para.id);
  if (hit) return hit;
  const auto = findTerms(para.en, 99)
    .filter((t) => !CHIP_SKIP.has(t.en.toLowerCase()))
    .map((t) => t.g).filter((g): g is string => !!g && !!GLOSSARY_PLUS[g]);
  const list = [...new Set([...(para.glossaryTerms || []), ...auto])].slice(0, 4);
  chipCache.set(para.id, list);
  return list;
}
import { ImageLightboxModal } from './ImageLightboxModal.tsx';
import { PARA_KIND_LABEL } from '../data/paperAudit.ts';
import { getTrajectoryCounts } from '../services/firebase.ts';
import type { ParaMeta } from '../App.tsx';

interface PaperReaderProps {
  onAskGemini: (context: string, meta?: ParaMeta) => void;
  onOpenGlossaryTerm: (term: string) => void;
  onExplainPara?: (title: string, source: string, markdown: string, meta?: ParaMeta) => void;
  onNavigateToCritique?: () => void;
  onOpenMmrModal?: () => void;
  initialSection?: string;
  returnToThesisSlide?: number | null;
  onReturnToThesis?: () => void;
}

export const PaperReader: React.FC<PaperReaderProps> = ({
  onAskGemini,
  onOpenGlossaryTerm,
  onExplainPara,
  onNavigateToCritique,
  onOpenMmrModal,
  initialSection = 'abstract',
  returnToThesisSlide,
  onReturnToThesis,
}) => {
  const selectedPaperId: string = 'raman_2022';
  const currentPaper = BENCHMARK_PAPERS.find(p => p.id === selectedPaperId) || BENCHMARK_PAPERS[0];
  const ORIGINAL_PAPER_SOURCE = currentPaper.source;
  const PAPER_PARAGRAPHS = currentPaper.paragraphs;
  const PAPER_TABLES = currentPaper.tables;

  const [activeSection, setActiveSection] = useState<string>(initialSection);
  // 學習軌跡：各段落已累積的解析與追問筆數
  const [trajCounts, setTrajCounts] = useState<Record<string, number>>({});
  useEffect(() => {
    let alive = true;
    const load = (force = false) => getTrajectoryCounts(force).then((c) => { if (alive) setTrajCounts(c); }).catch(() => {});
    load();
    const onUpd = () => load(true);
    window.addEventListener('trajectory-updated', onUpd);
    return () => { alive = false; window.removeEventListener('trajectory-updated', onUpd); };
  }, []);

  React.useEffect(() => {
    if (initialSection) {
      setActiveSection(initialSection);
      setTimeout(() => document.getElementById(`sec-${initialSection}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 300);
    }
  }, [initialSection]);
  const [readingMode, setReadingMode] = useState<'bilingual' | 'zh' | 'en'>('bilingual');
  // 預設只顯示論文原文（含依原文表格整理與參考文獻）；延伸解說可自行打開
  const [showExtended, setShowExtended] = useState<boolean>(() => {
    try { return localStorage.getItem('reader-show-extended') === '1'; } catch { return false; }
  });
  const toggleExtended = () => {
    setShowExtended((v) => { try { localStorage.setItem('reader-show-extended', v ? '0' : '1'); } catch { /* 無法儲存 */ } return !v; });
  };
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [fontSize, setFontSize] = useState<'normal' | 'large'>('normal');
  const [showSourceModal, setShowSourceModal] = useState<boolean>(false);
  const [copiedApa, setCopiedApa] = useState<boolean>(false);
  const [copiedBibtex, setCopiedBibtex] = useState<boolean>(false);
  const [showImageLightbox, setShowImageLightbox] = useState<boolean>(false);
  const [selectedLightboxImgId, setSelectedLightboxImgId] = useState<string>('img1');
  const [readingParaId, setReadingParaId] = useState<string | null>(null);
  const [readingLang, setReadingLang] = useState<'en' | 'zh' | null>(null);
  const [showMultiPaperBanner, setShowMultiPaperBanner] = useState<boolean>(true);

  const openLightboxWithImage = (imgId: string) => {
    setSelectedLightboxImgId(imgId);
    setShowImageLightbox(true);
  };

  React.useEffect(() => {
    const availableSections = new Set(PAPER_PARAGRAPHS.map((p) => p.section));
    if (!availableSections.has(activeSection)) {
      if (availableSections.has('abstract')) {
        setActiveSection('abstract');
      } else if (availableSections.has('meta')) {
        setActiveSection('meta');
      } else {
        const first = PAPER_PARAGRAPHS[0]?.section;
        if (first) setActiveSection(first);
      }
    }
  }, [selectedPaperId, PAPER_PARAGRAPHS]);

  const handleSpeakParagraph = (id: string, text: string, lang: 'en' | 'zh') => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      alert('您的瀏覽器不支援語音合成功能');
      return;
    }

    if (readingParaId === id && readingLang === lang) {
      window.speechSynthesis.cancel();
      setReadingParaId(null);
      setReadingLang(null);
      return;
    }

    window.speechSynthesis.cancel();
    // 使用全站「語音」設定所選的聲音與語速
    const utterance = makeUtterance(text, lang === 'zh' ? 'zh' : 'en');

    utterance.onend = () => {
      setReadingParaId(null);
      setReadingLang(null);
    };

    utterance.onerror = () => {
      setReadingParaId(null);
      setReadingLang(null);
    };

    setReadingParaId(id);
    setReadingLang(lang);
    window.speechSynthesis.speak(utterance);
  };

  // Filter paragraphs based on section and search
  const filteredParagraphs = useMemo(() => {
    return PAPER_PARAGRAPHS.filter((p) => {
      const matchesSection = showExtended || p.kind !== 'extended'; // 一頁式：所有章節依序排開；延伸解說可隱藏
      const matchesSearch =
        searchQuery.trim() === '' ||
        p.en.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.zh.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSection && matchesSearch;
    });
  }, [activeSection, searchQuery, selectedPaperId, PAPER_PARAGRAPHS, showExtended]);

  const handleCopyApa = () => {
    navigator.clipboard.writeText(ORIGINAL_PAPER_SOURCE.apaCitation);
    setCopiedApa(true);
    setTimeout(() => setCopiedApa(false), 2000);
  };

  // 原文逐字閱讀器（使用者自行上傳 PDF，在瀏覽器中解析）
  const [pdfReaderOpen, setPdfReaderOpen] = useState(false);
  // 左側目錄可收合（記住使用者的選擇）
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(() => {
    try { return localStorage.getItem('reader-sidebar-open') !== '0'; } catch { return true; }
  });
  const toggleSidebar = (open: boolean) => {
    setSidebarOpen(open);
    try { localStorage.setItem('reader-sidebar-open', open ? '1' : '0'); } catch { /* 無法儲存 */ }
  };
  const goSec = (id: string) => {
    setActiveSection(id);
    setSearchQuery('');
    setTimeout(() => document.getElementById(`sec-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
  };
  const [deepParaId, setDeepParaId] = useState<string | null>(null);

  // 捲動時自動標示目前章節（左側大綱亮起）
  useEffect(() => {
    const onScroll = () => {
      let cur = '';
      let best = -Infinity;
      document.querySelectorAll<HTMLElement>('[data-sec]').forEach((el) => {
        const top = el.getBoundingClientRect().top;
        if (top < 220 && top > best) { best = top; cur = el.dataset.sec || ''; }
      });
      if (cur) setActiveSection(cur);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleCopyBibtex = () => {
    navigator.clipboard.writeText(ORIGINAL_PAPER_SOURCE.bibtex);
    setCopiedBibtex(true);
    setTimeout(() => setCopiedBibtex(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Return to Thesis Banner (若從口試簡報點擊跳轉至此，頂部清晰提供返回入口) */}
      {returnToThesisSlide && onReturnToThesis && (
        <div className="bg-gradient-to-r from-amber-500/15 via-indigo-600/15 to-transparent border border-amber-400/50 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-md backdrop-blur-md animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold shadow-md shadow-amber-300/40 shrink-0">
              <Presentation className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-slate-900 text-sm">
                  已為您定位口試簡報第 {returnToThesisSlide} 頁對應之論文原文
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400 text-slate-950">
                  PPT 雙向聯動
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                此處展示該頁之雙語對照內容與註釋。查閱完畢後，點擊右方按鈕即可隨時一鍵無縫返回簡報！
              </p>
            </div>
          </div>
          <button
            onClick={onReturnToThesis}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-extrabold text-xs sm:text-sm shadow-md shadow-amber-300/40 border border-amber-300 transition-all active:scale-95 cursor-pointer group"
            title="一鍵返回口試簡報（或鍵盤按 Esc）"
          >
            <ArrowLeft className="w-4 h-4 text-slate-950 group-hover:-translate-x-0.5 transition-transform" />
            <span>返回口試簡報 (Slide {returnToThesisSlide})</span>
            <span className="px-1.5 py-0.5 rounded bg-slate-950/10 text-[10px] font-mono hidden md:inline">
              Esc 返回
            </span>
          </button>
        </div>
      )}

      {/* 原文逐字＋沉浸式翻譯：上傳 PDF */}
      <div className="rounded-2xl border border-indigo-200 bg-gradient-to-r from-indigo-50 to-white p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="font-bold text-slate-900">原文一字不漏＋沉浸式翻譯</div>
          <p className="text-xs text-slate-600 mt-0.5">
            上傳您手上的論文 PDF，逐段顯示 PDF 原文，下方附繁體中文譯文，並可對照 PDF 原頁。PDF 只在您的瀏覽器中解析，不會上傳或公開。
          </p>
        </div>
        <button onClick={aiClick(() => setPdfReaderOpen(true))} title="翻譯需主帳號登入"
          className="h-10 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold shrink-0">
          上傳 PDF 開始閱讀
        </button>
      </div>
      {pdfReaderOpen && <PdfImmersiveReader onClose={() => setPdfReaderOpen(false)} />}

      {/* 三篇文獻（Raman／Wang／Afego）的 MMR 判別比較移至「Mixed Method」視窗；論文翻譯只呈現本篇 Raman et al. (2022) */}

      {/* Paper Hero Header */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-5 mb-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-md text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/60">
              {ORIGINAL_PAPER_SOURCE.journal}
            </span>
            <span className="px-3 py-1 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
              {ORIGINAL_PAPER_SOURCE.journalImpact}
            </span>
            <a
              href={ORIGINAL_PAPER_SOURCE.doiUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-mono font-medium text-slate-600 hover:text-indigo-600 bg-slate-100 hover:bg-indigo-50 border border-slate-200 transition-colors"
              title="點擊前往官方 DOI 原文頁面"
            >
              <ExternalLink className="w-3.5 h-3.5 text-indigo-500" />
              <span>DOI: {ORIGINAL_PAPER_SOURCE.doi}</span>
            </a>
            <button
              onClick={() => setShowSourceModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-xs"
            >
              <Globe className="w-3.5 h-3.5 text-amber-200" />
              <span>查找原文位置與官方來源</span>
            </button>
          </div>

          {/* Reading Controls */}
          <div className="flex items-center gap-3">
            {/* View Mode Switcher */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-medium">
              <button
                onClick={() => setReadingMode('bilingual')}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                  readingMode === 'bilingual'
                    ? 'bg-white text-indigo-700 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Languages className="w-3.5 h-3.5" />
                <span>雙語對照</span>
              </button>
              <button
                onClick={() => setReadingMode('zh')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  readingMode === 'zh'
                    ? 'bg-white text-indigo-700 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>繁體中文</span>
              </button>
              <button
                onClick={() => setReadingMode('en')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  readingMode === 'en'
                    ? 'bg-white text-indigo-700 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>English</span>
              </button>
            </div>

            {/* 延伸解說顯示切換 */}
            {selectedPaperId === 'raman_2022' && (
              <button
                onClick={toggleExtended}
                className={`px-2.5 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${showExtended ? 'bg-slate-700 text-white border-slate-700' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
                title="原文段落已與期刊正式版 PDF 逐字核對；延伸解說是本平台補充，不是論文內容"
              >
                {showExtended ? '隱藏延伸解說' : '顯示延伸解說'}
              </button>
            )}

            {/* Font Size Toggle */}
            <button
              onClick={() => setFontSize(fontSize === 'normal' ? 'large' : 'normal')}
              className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-xs font-semibold rounded-lg text-slate-700 transition-colors"
              title="調整字體大小"
            >
              {fontSize === 'normal' ? 'A+' : 'A-'}
            </button>
          </div>
        </div>

        {/* Paper Title */}
        <div className="space-y-3">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold font-serif text-slate-950 tracking-tight leading-snug">
            {ORIGINAL_PAPER_SOURCE.titleEn}
          </h1>
          <h2 className="text-lg sm:text-xl font-medium text-indigo-900 leading-normal">
            {ORIGINAL_PAPER_SOURCE.titleZh}
          </h2>
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs sm:text-sm text-slate-500 pt-1">
            <p>
              作者：{ORIGINAL_PAPER_SOURCE.authors.map(a => `${a.name} (${a.affil})`).join(' • ')}
            </p>
            <button
              onClick={() => setShowSourceModal(true)}
              className="text-indigo-600 hover:text-indigo-800 font-medium underline flex items-center gap-1"
            >
              <span>查看詳細引用與出版資訊</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Quick Value Callout Banner */}
          {onNavigateToCritique && (
            <div className="mt-4 p-3.5 rounded-xl bg-gradient-to-r from-indigo-50 via-sky-50 to-emerald-50 border border-indigo-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5">
                <span className="w-2 h-2 rounded-full bg-indigo-500 shrink-0" />
                <span className="text-slate-800">
                  {selectedPaperId === 'wang_2023' ? (
                    <><strong>/MMR文獻篩選【方法論對照教學】：</strong> 香港股市事件研究與消費者實驗結合。作者使用多階段設計，經 9 步篩選精準定位為 Multi-study Quantitative Design。</>
                  ) : selectedPaperId === 'afego_2021' ? (
                    <><strong>質性內容分析破譯市場反應：</strong> 抵制參與宣告產生 +2.68% 異常報酬，證實質性論述能有效解釋量化市場反饋。</>
                  ) : (
                    <><strong>深入探索本篇核心機理與方法論價值：</strong> Table 2 揭示「營收暴增 + 新聞過熱」超額報酬反而修正 (-102.094) 的市場預期機制。</>
                  )}
                </span>
              </div>
              <button
                onClick={onNavigateToCritique}
                className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold shrink-0 text-xs flex items-center gap-1.5 transition-colors shadow-2xs"
              >
                <span>{selectedPaperId === 'wang_2023' ? '查看文獻方法論對照' : '探索文獻核心方法與價值'}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ---------------- Wang et al. (2023) /MMR文獻篩選 爭議案例與反例專題剖析 ---------------- */}
      {selectedPaperId === 'wang_2023' && (
        <div className="bg-slate-950 text-white rounded-3xl p-6 sm:p-8 border-2 border-rose-500/50 shadow-2xl space-y-6">
          {/* Top Title & Official Links */}
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b border-slate-800 pb-5">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-3 py-1 rounded-full text-xs font-black bg-rose-600 text-white flex items-center gap-1 shadow-md">
                  <span>🔴 /MMR文獻篩選【反例比較】</span>
                </span>
                <span className="px-2.5 py-0.5 rounded-md text-[11px] font-mono bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  這不是典型 MMR（作者雖宣稱 Mixed Methods 但實質為 Multi-study Quantitative Design）
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-white mt-2 flex items-center gap-2">
                <span>The Impacts of Logo Dynamism and Product Types on Brand Market Performance</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Wang, Liu & Chen (2023) • <em>Journal of Business Research (JBR)</em>, Vol. 166, Article 114060 • DOI: 10.1016/j.jbusres.2023.114060
              </p>
            </div>

            {/* Official Source Action Buttons */}
            <div className="flex items-center gap-2 flex-wrap shrink-0">
              <a
                href="https://www.sciencedirect.com/science/article/pii/S0148296323004186?casa_token=x_GFXZM-9JIAAAAA:9kUsr8s3TJuqCW3K1EFOJfYliL-vRfZUb1-dsEqNybUl5wfGKGuxRL-vpgA4JwVW6uciJ1CyeIQ"
                target="_blank"
                rel="noreferrer"
                className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md transition-all"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>ScienceDirect 正式文章頁面</span>
              </a>
              <a
                href="https://www.researchgate.net/publication/371981313_The_impacts_of_logo_dynamism_and_product_types_on_brand_market_performance"
                target="_blank"
                rel="noreferrer"
                className="px-3.5 py-2 rounded-xl bg-teal-700 hover:bg-teal-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-md transition-all"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>ResearchGate 文章頁面</span>
              </a>
              <button
                onClick={() => openLightboxWithImage('img6')}
                className="px-3.5 py-2 rounded-xl bg-rose-700 hover:bg-rose-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-md transition-all"
              >
                <ZoomIn className="w-3.5 h-3.5" />
                <span>放大檢視反例圖表</span>
              </button>
            </div>
          </div>

          {/* Core Content Grid: Left ASCII/YAML Card + Right Gamma Image */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* Left Column: Standard /MMR文獻篩選 Output Box (5 cols) */}
            <div className="lg:col-span-5 bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-800 font-mono text-xs space-y-3 flex flex-col justify-between">
              <div className="flex items-center justify-between text-amber-300 font-bold border-b border-slate-800 pb-2">
                <span>📋 /MMR文獻篩選 標準輸出判定表</span>
                <span className="text-[10px] text-rose-400 bg-rose-950/80 px-2 py-0.5 rounded border border-rose-800">非典型 MMR</span>
              </div>

              <pre className="text-slate-300 leading-relaxed overflow-x-auto text-[11px] sm:text-xs">
{`╔════════════════════════════════════════════╗
║             /MMR文獻篩選                  ║
╠════════════════════════════════════════════╣
║ 論文                                       ║
║ The Impacts of Logo Dynamism and          ║
║ Product Types on Brand Market Performance ║
║                                            ║
║ Wang, Liu & Chen (2023)                   ║
║ Journal of Business Research              ║
║ DOI: 10.1016/j.jbusres.2023.114060        ║
╠════════════════════════════════════════════╣
║ 作者是否宣稱 Mixed Methods?               ║
║ 🟢 YES                                    ║
║                                            ║
║ 是否有多種研究方法?                       ║
║ 🟢 YES                                    ║
║                                            ║
║ 是否包含 QUAN?                            ║
║ 🟢 YES                                    ║
║                                            ║
║ 是否包含真正 QUAL?                        ║
║ 🔴 NO                                     ║
║                                            ║
║ QUAN + QUAL 方法論整合?                   ║
║ 🔴 不足                                   ║
║                                            ║
║ 是否屬「真正 MMR」?                       ║
║ 🔴 NO（嚴格篩選標準）                     ║
║                                            ║
║ 建議分類                                  ║
║ Multi-study Quantitative Research         ║
║ / Mixed Research Methods                  ║
╚════════════════════════════════════════════╝`}
              </pre>

              <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400">
                ⭐ <strong>最重要的判斷</strong>：出版社摘要雖明確寫「Mixed methods are employed」，而且包含 Pilot study ➔ Event study ➔ Experiment 1 ➔ Experiment 2。但全文實質為多重量化設計串聯，未見質性資料（QUAL）與跨典範整合。
              </div>
            </div>

            {/* Right Column: Independent Infographic Image Preview (7 cols) */}
            <div className="lg:col-span-7 bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-800 space-y-3 flex flex-col justify-between">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-200 flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-rose-400" />
                  <span>主題七：/MMR文獻篩選 反例全景圖解 (Gamma 原圖同步)</span>
                </span>
                <a
                  href="/images/gamma/70dbe7ce78974009a403a083b190751d.webp"
                  target="_blank"
                  rel="noreferrer"
                  className="text-rose-400 hover:text-rose-300 flex items-center gap-1 text-[11px] font-semibold"
                >
                  <span>開啟原圖</span>
                  <Maximize2 className="w-3 h-3" />
                </a>
              </div>

              <div 
                onClick={() => openLightboxWithImage('img6')}
                className="group relative rounded-xl overflow-hidden border border-slate-800 bg-slate-950 cursor-pointer shadow-inner flex items-center justify-center max-h-72"
              >
                <img
                  src="/images/gamma/70dbe7ce78974009a403a083b190751d.webp"
                  alt="/MMR文獻篩選 反例教學：Wang et al. (2023)"
                  className="w-full h-auto object-contain group-hover:scale-105 transition-transform duration-300 opacity-90 group-hover:opacity-100"
                  loading="lazy"
                />
                <div className="absolute inset-0 flex items-end justify-end p-2.5 pointer-events-none opacity-80 group-hover:opacity-100 transition-opacity">
                  <span className="px-3 py-1.5 rounded-xl bg-slate-900/90 backdrop-blur-md text-white text-xs font-semibold flex items-center gap-1.5 shadow-md group-hover:scale-105 transition-transform">
                    <ZoomIn className="w-3.5 h-3.5 text-rose-400" />
                    <span>點擊放大檢視第 6 張高畫質篩選圖表</span>
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-[10px] font-mono text-slate-300 pt-1">
                <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
                  <div className="text-slate-400">Study 0 Pilot</div>
                  <div className="text-amber-300 font-bold">Forbes 100 (QUAN)</div>
                </div>
                <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
                  <div className="text-slate-400">Study 1 Event</div>
                  <div className="text-amber-300 font-bold">港股 CAR (QUAN)</div>
                </div>
                <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
                  <div className="text-slate-400">Study 2 Exp 1</div>
                  <div className="text-amber-300 font-bold">控制實驗 (QUAN)</div>
                </div>
                <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
                  <div className="text-slate-400">Study 3 Exp 2</div>
                  <div className="text-amber-300 font-bold">中介機制 (QUAN)</div>
                </div>
              </div>
            </div>
          </div>

          {/* 9 步篩選流程圖 & 為什麼不是真正 MMR 深度剖析 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
            {/* Left: 9 步篩選檢查流程 */}
            <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-3">
              <h4 className="text-sm font-bold text-amber-300 flex items-center gap-2">
                <span>🔎 /MMR文獻篩選 9 步標準查核流程鏈</span>
              </h4>
              <div className="font-mono text-xs text-slate-300 space-y-1.5 p-3 rounded-xl bg-slate-950 border border-slate-800 leading-relaxed overflow-x-auto">
                <div>/MMR文獻篩選</div>
                <div className="pl-4 text-slate-500">↓</div>
                <div className="pl-2">① QUAN 是否存在：<span className="text-emerald-400 font-bold">✅ 存在 (Forbes次級資料 + 港股CAR + 實驗)</span></div>
                <div className="pl-4 text-slate-500">↓</div>
                <div className="pl-2">② QUAL 是否存在：<span className="text-rose-400 font-bold">🔴 不存在 (無訪談、無文本編碼、無質性觀察)</span></div>
                <div className="pl-4 text-slate-500">↓</div>
                <div className="pl-2">③ 是否有 QUAN + QUAL：<span className="text-rose-400 font-bold">🔴 否 (全部為量化方法)</span></div>
                <div className="pl-4 text-slate-500">↓</div>
                <div className="pl-2">④ 是否真正 Integration：<span className="text-rose-400 font-bold">🔴 不足 (各研究各自獨立推論，無跨範型整合)</span></div>
                <div className="pl-4 text-slate-500">↓</div>
                <div className="pl-2">⑤ Integration 發生在哪一階段：<span className="text-slate-500">🔴 不適用</span></div>
                <div className="pl-4 text-slate-500">↓</div>
                <div className="pl-2">⑥ MMR Design：<span className="text-slate-500">🔴 不適用 Creswell 四大主要 MMR 設計</span></div>
                <div className="pl-4 text-slate-500">↓</div>
                <div className="pl-2">⑦ QUAN : QUAL 比例：<span className="text-amber-300 font-bold">100 : 0 (純量化)</span></div>
                <div className="pl-4 text-slate-500">↓</div>
                <div className="pl-2">⑧ 是否只是 Multi-method：<span className="text-emerald-400 font-bold">🟢 YES (多重研究方法組合)</span></div>
                <div className="pl-4 text-slate-500">↓</div>
                <div className="pl-2 font-bold text-rose-400">⑨ 最終判定：🔴 FALSE MMR（建議標註為 Multi-study Quantitative Design）</div>
              </div>
            </div>

            {/* Right: 為什麼這篇不是「真正 MMR」的 4 大核心理由 */}
            <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-3 flex flex-col justify-between">
              <div>
                <h4 className="text-sm font-bold text-rose-300 flex items-center gap-2">
                  <span>⚡ 這篇為什麼不是「真正 MMR」？4 大判準剖析</span>
                </h4>
                <div className="space-y-2 mt-3 text-xs leading-relaxed text-slate-300">
                  <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-rose-600/30 text-rose-400 font-bold flex items-center justify-center shrink-0 text-xs">1</span>
                    <div><strong className="text-white">沒有質性資料/方法：</strong> 全文未見訪談、焦點團體、內容主題分析等任何質性研究方法。</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-rose-600/30 text-rose-400 font-bold flex items-center justify-center shrink-0 text-xs">2</span>
                    <div><strong className="text-white">四個研究都是量化方法：</strong> Pilot study (資料分析)、Event study、兩個行為實驗研究，本質皆為 QUAN。</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-rose-600/30 text-rose-400 font-bold flex items-center justify-center shrink-0 text-xs">3</span>
                    <div><strong className="text-white">缺乏 QUAN + QUAL 整合：</strong> 各研究為獨立平行的量化方法，沒有質性與量化的交錯並行或跨資料源整合。</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-rose-600/30 text-rose-400 font-bold flex items-center justify-center shrink-0 text-xs">4</span>
                    <div><strong className="text-white">屬於 Multi-study Quantitative Design：</strong> 這是經典的「多研究方法組合」，不是典型 Mixed Methods Research (MMR)。</div>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400">🎓 博士論文答辯建議：以此篇作為反例，向審稿人口委展示界定真偽 MMR 的學術功力！</span>
                <button
                  onClick={() => onAskGemini('請依據 /MMR文獻篩選 標準，深度比較 Raman et al. (2022) 的真 MMR 與 Wang et al. (2023) 的多重研究量化設計之本質差異？')}
                  className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-colors shadow-xs"
                >
                  AI 深度對比
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Grid: Left TOC Sidebar + Right Content */}
      <div className={`grid grid-cols-1 items-start ${sidebarOpen ? 'lg:grid-cols-12 gap-8' : 'lg:grid-cols-[56px_minmax(0,1fr)] gap-4 lg:gap-6'}`}>
        {/* 收合狀態：細長章節列 */}
        {!sidebarOpen && (
          <nav className="flex lg:flex-col items-center gap-1.5 bg-white rounded-2xl border border-slate-200 shadow-xs p-1.5 overflow-x-auto lg:overflow-visible lg:sticky lg:top-[130px] no-scrollbar" aria-label="論文章節">
            <button onClick={() => toggleSidebar(true)} title="展開目錄"
              className="w-10 h-10 shrink-0 rounded-xl flex items-center justify-center text-slate-600 hover:bg-indigo-50 hover:text-indigo-700">
              <PanelLeftOpen className="w-5 h-5" />
            </button>
            <div className="w-px h-6 lg:w-6 lg:h-px bg-slate-200 shrink-0" />
            {PAPER_SECTIONS.map((sec) => {
              const m = sec.titleZh.match(/^(\d+)/);
              const short = m ? m[1] : sec.titleZh.slice(0, 1);
              const on = activeSection === sec.id && !searchQuery;
              return (
                <button key={sec.id} onClick={() => goSec(sec.id)} title={sec.titleZh}
                  className={`w-10 h-10 shrink-0 rounded-xl text-sm font-bold transition-colors ${on ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>
                  {short}
                </button>
              );
            })}
          </nav>
        )}
        {/* Left Column: TOC Navigation (4 cols on lg) */}
        <div className={`lg:col-span-4 space-y-5 lg:sticky lg:top-[130px] lg:max-h-[calc(100vh-150px)] lg:overflow-y-auto no-scrollbar ${sidebarOpen ? '' : 'hidden'}`}>
          {/* Search Box */}
          <div className="flex items-center gap-2">
          <button onClick={() => toggleSidebar(false)} title="收起目錄"
            className="w-11 h-11 shrink-0 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-indigo-700 hover:border-indigo-300">
            <PanelLeftClose className="w-5 h-5" />
          </button>
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="搜尋論文段落、變數或關鍵字..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-hidden focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 text-slate-800 shadow-xs"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
              >
                清除
              </button>
            )}
          </div>
          </div>

          {/* Quick Sidebar MMR Infographic Card */}
          <div
            onClick={() => setShowImageLightbox(true)}
            className="p-3.5 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white border border-indigo-500/30 shadow-xs cursor-pointer group hover:border-indigo-400 transition-all flex items-center gap-3"
            title="點擊放大查看 1536×1024 MMR 全景架構圖"
          >
            <div className="w-14 h-11 rounded-lg overflow-hidden shrink-0 border border-indigo-400/40 relative bg-slate-950">
              <img
                src="/images/paper_framework_diagram.png"
                alt="MMR 縮圖"
                onError={(e) => {
                  e.currentTarget.src = "/images/gamma/21329b1e9960461ea76049af3c5883ef.webp";
                }}
                className="w-full h-full object-contain transition-transform"
              />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent flex items-center justify-center transition-colors">
                <ZoomIn className="w-3.5 h-3.5 text-white drop-shadow-xs" />
              </div>
            </div>
            <div className="overflow-hidden flex-1">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-white truncate">MMR 全景架構圖</span>
                <span className="px-1.5 py-0.2 rounded text-[9px] bg-indigo-500 text-white font-semibold">1536px</span>
              </div>
              <div className="text-[11px] text-indigo-200/80 truncate mt-0.5">點擊開啟無損高清燈箱</div>
            </div>
            <Maximize2 className="w-4 h-4 text-indigo-400 group-hover:text-white shrink-0 transition-colors" />
          </div>

          {/* Section List */}
          <div className="bg-white rounded-2xl p-3 border border-slate-200 shadow-xs space-y-1">
            <div className="px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
              論文章節大綱導覽
            </div>
            {PAPER_SECTIONS.map((sec) => (
              <button
                key={sec.id}
                onClick={() => {
                  setActiveSection(sec.id);
                  setSearchQuery('');
                  setTimeout(() => document.getElementById(`sec-${sec.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
                }}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all flex items-center justify-between group ${
                  activeSection === sec.id && !searchQuery
                    ? 'bg-indigo-50 text-indigo-700 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <div className="truncate">
                  <div className="truncate text-slate-900 group-hover:text-indigo-600 transition-colors">
                    {sec.titleZh}
                  </div>
                  <div className="text-[11px] text-slate-400 truncate font-mono">
                    {sec.titleEn}
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
              </button>
            ))}
          </div>

          {/* Key Findings Card */}
          <div className="bg-gradient-to-br from-indigo-50/80 to-purple-50/60 p-5 rounded-2xl border border-indigo-100 text-xs space-y-3">
            <div className="font-bold text-indigo-950 flex items-center gap-1.5 text-sm">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              本論文 3 大實證震撼結論
            </div>
            {selectedPaperId === 'wang_2023' ? (
              <ul className="space-y-2 text-slate-600 leading-relaxed">
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 mt-1.5 shrink-0" />
                  <span>
                    <strong>動態標誌溢酬：</strong>動態 Logo 帶來顯著較高的累積異常報酬 (CAR = +1.84%, p &lt; 0.001)。
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-600 mt-1.5 shrink-0" />
                  <span>
                    <strong>產品類型調節：</strong>享樂型產品 (Hedonic) 相較實用型產品更具強烈的市場視覺溢酬效果。
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5 shrink-0" />
                  <span>
                    <strong>MMR 典範：</strong>成功將香港股市 205 家事件研究與消費者心理控制實驗完美融合。
                  </span>
                </li>
              </ul>
            ) : selectedPaperId === 'afego_2021' ? (
              <ul className="space-y-2 text-slate-600 leading-relaxed">
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 mt-1.5 shrink-0" />
                  <span>
                    <strong>社會倡議信號：</strong>企業宣布參與抵制活動產生平均 +2.68% (p &lt; 0.001) 累積異常報酬。
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-600 mt-1.5 shrink-0" />
                  <span>
                    <strong>質性內容驅動：</strong>企業溝通框架的質性編碼直接解釋了量化股票市場的異象反應。
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5 shrink-0" />
                  <span>
                    <strong>窗口穩健性：</strong>在 [-2, +1]、[-1, +2] 與 [0, +3] 多個窗口下皆呈現穩健正向異常反應。
                  </span>
                </li>
              </ul>
            ) : (
              <ul className="space-y-2 text-slate-600 leading-relaxed">
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 mt-1.5 shrink-0" />
                  <span>
                    <strong>情緒不對稱性：</strong>負面新聞情緒衝擊 (β = -11.119***) 遠比正面情緒更具穿透力與破壞力。
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-600 mt-1.5 shrink-0" />
                  <span>
                    <strong>邊際遞減效應：</strong>在高營收成長時，正面情緒激勵效果強烈遞減 (Sales_growth × Pos = -102.094**)。
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5 shrink-0" />
                  <span>
                    <strong>機器學習飛躍：</strong>加入新聞文字指標後，提升決策樹準確率從 <strong>67.9% 飆升至 99.7%</strong>！
                  </span>
                </li>
              </ul>
            )}
          </div>
        </div>

        {/* Right Column: Paragraph Content & Tables (8 cols on lg) */}
        <div className={`space-y-6 min-w-0 ${sidebarOpen ? 'lg:col-span-8' : ''}`}>
          {/* TTS Feature Prompt Banner */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-indigo-50/90 via-purple-50/70 to-sky-50/80 border border-indigo-200/80 flex items-center justify-between gap-3 text-xs shadow-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <Volume2 className="w-4 h-4 animate-pulse" />
              </div>
              <div>
                <span className="font-bold text-indigo-950">即時選取 TTS 語音朗讀已就緒：</span>
                <span className="text-slate-600 ml-1">
                  隨時在網頁上<strong>滑鼠框選任何中英文句子</strong>，將自動浮現 TTS 播放列進行自然語音朗讀！
                </span>
              </div>
            </div>
            <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-200/60 text-indigo-800 shrink-0">
              雙語支援 • 自由變速
            </span>
          </div>

          {/* Paragraph Cards */}
          {filteredParagraphs.map((para, pi) => (
            <React.Fragment key={para.id}>
            {!searchQuery && (pi === 0 || filteredParagraphs[pi - 1].section !== para.section) && (() => {
              const sec = PAPER_SECTIONS.find((x) => x.id === para.section);
              return (
                <div id={`sec-${para.section}`} data-sec={para.section} className="scroll-mt-40 pt-4 flex items-baseline gap-3 border-b-2 border-indigo-200 pb-2">
                  <h2 className="text-xl font-extrabold text-slate-900">{sec?.titleZh || para.section}</h2>
                  <span className="text-xs font-mono text-slate-400">{sec?.titleEn}</span>
                </div>
              );
            })()}
            <article
              key={para.id}
              className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200/90 shadow-xs hover:border-indigo-200 transition-all space-y-4"
            >
              {/* PDF Original Page Indicator & SubSection Title */}
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs border-b border-slate-100 pb-2.5">
                <div className="flex items-center gap-2 flex-wrap">
                  {para.kind && para.kind !== 'original' ? (
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${para.kind === 'extended' ? 'bg-slate-100 text-slate-600 border-slate-300 border-dashed' : 'bg-teal-50 text-teal-800 border-teal-200'}`}
                      title={para.kind === 'extended' ? '本平台補充的解說，不是論文原文' : undefined}>
                      {PARA_KIND_LABEL[para.kind]}
                    </span>
                  ) : null}
                  {para.pdfPage !== '非原文' && (
                  <span className="font-mono text-[11px] font-semibold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-md">
                    {para.pdfPage || 'PDF 原文位置'}
                  </span>
                  )}
                  {para.subSection && (
                    <span className="text-xs font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md">
                      {para.subSection}
                    </span>
                  )}
                </div>
                {para.kind !== 'extended' && <a
                  href={ORIGINAL_PAPER_SOURCE.doiUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] text-slate-400 hover:text-indigo-600 flex items-center gap-1 transition-colors"
                  title="前往 ScienceDirect 對照原始期刊論文"
                >
                  <ExternalLink className="w-3 h-3" />
                  <span>對照 Elsevier 原文</span>
                </a>}
              </div>

              {/* English Version */}
              {(readingMode === 'bilingual' || readingMode === 'en') && (
                <div className={`text-slate-800 leading-relaxed font-sans ${
                  fontSize === 'large' ? 'text-base sm:text-lg leading-relaxed' : 'text-sm sm:text-base leading-relaxed'
                } whitespace-pre-line`}>
                  {para.en}
                </div>
              )}

              {/* Chinese Translation */}
              {(readingMode === 'bilingual' || readingMode === 'zh') && (
                <div className={`text-slate-900 leading-relaxed font-serif ${
                  readingMode === 'bilingual' ? 'pt-3 border-t border-slate-100 text-indigo-950/90' : ''
                } ${
                  fontSize === 'large' ? 'text-base sm:text-lg leading-relaxed' : 'text-sm sm:text-base leading-relaxed'
                } whitespace-pre-line`}>
                  {para.zh}
                </div>
              )}

              {/* Action Toolbar & Glossary Chips */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 text-xs">
                {/* Paragraph Audio TTS Buttons */}
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleSpeakParagraph(para.id, para.en, 'en')}
                    className={`flex items-center gap-1 px-2.5 py-1 text-xs rounded-lg transition-colors font-medium ${
                      readingParaId === para.id && readingLang === 'en'
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-indigo-700 hover:bg-indigo-50 border border-slate-200'
                    }`}
                    title="朗讀本段英文原文 (EN)"
                  >
                    {readingParaId === para.id && readingLang === 'en' ? (
                      <>
                        <VolumeX className="w-3.5 h-3.5" />
                        <span>停止英文</span>
                      </>
                    ) : (
                      <>
                        <Volume2 className="w-3.5 h-3.5 text-indigo-600" />
                        <span>朗讀英文</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => handleSpeakParagraph(para.id, para.zh, 'zh')}
                    className={`flex items-center gap-1 px-2.5 py-1 text-xs rounded-lg transition-colors font-medium ${
                      readingParaId === para.id && readingLang === 'zh'
                        ? 'bg-purple-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-purple-700 hover:bg-purple-50 border border-slate-200'
                    }`}
                    title="朗讀本段中文翻譯 (ZH)"
                  >
                    {readingParaId === para.id && readingLang === 'zh' ? (
                      <>
                        <VolumeX className="w-3.5 h-3.5" />
                        <span>停止中文</span>
                      </>
                    ) : (
                      <>
                        <Volume2 className="w-3.5 h-3.5 text-purple-600" />
                        <span>朗讀中文</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Glossary terms & Ask Gemini */}
                <div className="flex flex-wrap items-center gap-1.5 ml-auto">
                  {chipTermsFor(para).map((term) => (
                    <button
                      key={term}
                      onClick={() => onOpenGlossaryTerm(term)}
                      title={`${GLOSSARY_PLUS[term]?.zh || term}：點開看白話、公式與例子`}
                      className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-indigo-100 text-slate-700 hover:text-indigo-800 font-mono text-[11px] transition-colors flex items-center gap-1"
                    >
                      <Info className="w-3 h-3 text-indigo-600" />
                      <span>{term}</span>
                    </button>
                  ))}

                  {/* Ask AI Button */}
                  <button
                    onClick={() => setDeepParaId(deepParaId === para.id ? null : para.id)}
                    className={`flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-xl border transition-colors ${deepParaId === para.id ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400 hover:text-slate-800'}`}
                    title="本段英文專有名詞的中文與白話解釋（不使用 AI）"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>深入解說</span>
                  </button>
                  {(trajCounts[para.id] || 0) > 0 && (
                    <button
                      onClick={() => {
                        const meta = { paraId: para.id, paraLabel: para.subSection || para.id, openTrajectory: true };
                        if (PARA_EXPLAIN[para.id] && onExplainPara) onExplainPara(`💡 白話解說：${para.subSection || '本段'}`, para.zh, buildExplainMarkdown(PARA_EXPLAIN[para.id]), meta);
                        else onAskGemini(`${para.en}\n\n【中文翻譯】\n${para.zh}`, meta);
                      }}
                      className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-xl border border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100 transition-colors"
                      title="這一段過去的解析與追問紀錄（不使用 AI）"
                    >
                      <span aria-hidden>🧠</span>
                      <span>學習軌跡 {trajCounts[para.id]}</span>
                    </button>
                  )}
                  {PARA_EXPLAIN[para.id] && onExplainPara ? (
                    <button
                      onClick={() => onExplainPara(`💡 白話解說：${para.subSection || '本段'}`, para.zh, buildExplainMarkdown(PARA_EXPLAIN[para.id]), { paraId: para.id, paraLabel: para.subSection || para.id })}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-emerald-800 hover:text-white bg-emerald-100 hover:bg-emerald-600 rounded-xl transition-all border border-emerald-300/60 shadow-xs active:scale-95 cursor-pointer"
                      title="預先寫好的白話解說與生活例子（不使用 AI，不花費用）"
                    >
                      <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                      <span>白話解說</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => onAskGemini(`${para.en}\n\n【中文翻譯】\n${para.zh}`, { paraId: para.id, paraLabel: para.subSection || para.id })}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-purple-800 hover:text-white bg-purple-100 hover:bg-purple-600 rounded-xl transition-all border border-purple-300/60 shadow-xs active:scale-95 cursor-pointer"
                      title="使用 Gemini AI 解析此段"
                    >
                      <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                      <span>⚡ AI 解析</span>
                    </button>
                  )}
                </div>
              </div>
              {deepParaId === para.id && (() => {
                const terms = findTerms(para.en);
                return (
                  <div className="mt-3 pt-3 border-t border-slate-100 animate-in fade-in duration-150">
                    <div className="text-[11px] text-slate-400 mb-2">本段專有名詞 {terms.length} 個・點 🔊 聽英文發音</div>
                    {terms.length ? (
                      <dl className="grid sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
                        {terms.map((t) => (
                          <div key={t.en} className="flex items-start gap-2 min-w-0">
                            <button onClick={() => { try { window.speechSynthesis.cancel(); window.speechSynthesis.speak(makeUtterance(t.en, 'en')); } catch { /* 無語音 */ } }}
                              className="shrink-0 text-slate-400 hover:text-indigo-600 mt-0.5" title="英文發音">
                              <Volume2 className="w-3.5 h-3.5" />
                            </button>
                            <div className="min-w-0">
                              <dt className="leading-snug">
                                <span className="font-mono text-[12.5px] text-slate-500">{t.en}</span>
                                <span className="mx-1.5 text-slate-300">·</span>
                                <span className="font-semibold text-slate-800">{t.zh}</span>
                                {t.g && (
                                  <button onClick={() => onOpenGlossaryTerm(t.g!)} className="ml-1.5 text-[11px] text-indigo-500 hover:text-indigo-700 hover:underline">公式／例子</button>
                                )}
                              </dt>
                              <dd className="text-slate-600 text-[13px] leading-relaxed">{t.x}</dd>
                            </div>
                          </div>
                        ))}
                      </dl>
                    ) : (
                      <p className="text-sm text-slate-500">本段沒有需要特別解釋的專有名詞。</p>
                    )}
                  </div>
                );
              })()}
            </article>
            </React.Fragment>
          ))}

          {/* Section Tables (Shown when activeSection is results or methods) */}
          {!searchQuery && (
            <div className="space-y-8 pt-4">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-lg border-b border-slate-200 pb-3">
                <TableIcon className="w-5 h-5 text-indigo-600" />
                <span>論文實證統計數據表 (Table 1 ~ Table 8)</span>
              </div>

              {PAPER_TABLES.map((table) => (
                <div key={table.id} className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                  <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
                    <h3 className="font-bold text-slate-900 text-base">{table.titleZh}</h3>
                    <div className="text-xs text-slate-500 font-mono mt-0.5">{table.titleEn}</div>
                    <p className="text-xs text-slate-600 mt-1">{table.description}</p>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs sm:text-sm">
                      <thead>
                        <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-700 font-semibold">
                          {table.headers.map((h, i) => (
                            <th key={i} className="px-4 py-3 whitespace-nowrap">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700 font-mono">
                        {table.rows.map((row, rIdx) => {
                          const isKeyRow = String(row[0]).includes('Sales_growth X Positive') || String(row[0]).includes('Boosted Decision Tree');
                          return (
                            <tr key={rIdx} className={isKeyRow ? 'bg-amber-50/70 font-semibold text-amber-950' : 'hover:bg-slate-50/80 transition-colors'}>
                              {row.map((cell, cIdx) => (
                                <td key={cIdx} className="px-4 py-2.5 whitespace-nowrap">
                                  {cell}
                                </td>
                              ))}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {table.footer && (
                    <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 italic">
                      {table.footer}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Interactive Appendix Interaction Plots (When on conclusion / results) */}
          {!searchQuery && (
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
              <div className="border-b border-slate-200 pb-3">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-indigo-600" />
                  論文附錄交互作用圖解 (Appendix: Interaction Plots)
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  重現論文第 28-29 頁交互作用圖：展示情緒高低如何調節營收成長率對 SCAR 的影響
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Plot 1: Sentiments and Sales Growth */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <h4 className="font-semibold text-slate-900 text-xs mb-3 text-center">
                    圖 A: 正面新聞情緒 × 營收成長率 (邊際效應遞減)
                  </h4>
                  <div className="h-48 relative flex items-center justify-center border-l-2 border-b-2 border-slate-400 m-4">
                    {/* Low Positive Line (Steep slope) */}
                    <svg className="absolute inset-0 w-full h-full overflow-visible">
                      <line x1="10%" y1="85%" x2="90%" y2="15%" stroke="#4f46e5" strokeWidth="2.5" />
                      <circle cx="10%" cy="85%" r="4" fill="#4f46e5" />
                      <circle cx="90%" cy="15%" r="4" fill="#4f46e5" />
                      {/* High Positive Line (Flatter slope showing diminishing effect) */}
                      <line x1="10%" y1="70%" x2="90%" y2="40%" stroke="#9333ea" strokeWidth="2" strokeDasharray="4" />
                      <circle cx="10%" cy="70%" r="4" fill="#9333ea" />
                      <circle cx="90%" cy="40%" r="4" fill="#9333ea" />
                    </svg>
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-500 px-4">
                    <span>低營收成長 (Low Sales Growth)</span>
                    <span>高營收成長 (High Sales Growth)</span>
                  </div>
                  <div className="mt-3 text-[11px] text-slate-600 bg-white p-2.5 rounded-lg border border-slate-200">
                    <span className="text-indigo-600 font-bold">實證意涵：</span>實線（低正面情緒）斜率陡峭；虛線（高正面情緒）在高營收成長時斜率走平，證實利多已被充分定價，邊際效應遞減。
                  </div>
                </div>

                {/* Plot 2: Sentiments and MB Ratio */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <h4 className="font-semibold text-slate-900 text-xs mb-3 text-center">
                    圖 B: 負面新聞情緒 × 市值淨值比 (高評價股懲罰加劇)
                  </h4>
                  <div className="h-48 relative flex items-center justify-center border-l-2 border-b-2 border-slate-400 m-4">
                    <svg className="absolute inset-0 w-full h-full overflow-visible">
                      {/* Low Negative Line */}
                      <line x1="10%" y1="80%" x2="90%" y2="20%" stroke="#059669" strokeWidth="2.5" />
                      <circle cx="10%" cy="80%" r="4" fill="#059669" />
                      <circle cx="90%" cy="20%" r="4" fill="#059669" />
                      {/* High Negative Line (Pushed down severely) */}
                      <line x1="10%" y1="90%" x2="90%" y2="55%" stroke="#dc2626" strokeWidth="2" strokeDasharray="4" />
                      <circle cx="10%" cy="90%" r="4" fill="#dc2626" />
                      <circle cx="90%" cy="55%" r="4" fill="#dc2626" />
                    </svg>
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-500 px-4">
                    <span>低淨值比 (價值股)</span>
                    <span>高淨值比 (成長股)</span>
                  </div>
                  <div className="mt-3 text-[11px] text-slate-600 bg-white p-2.5 rounded-lg border border-slate-200">
                    <span className="text-rose-600 font-bold">實證意涵：</span>紅色虛線（高負面情緒）全面下壓，尤其高估值成長股遭遇負面新聞時，超額報酬修正幅度更為劇烈。
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Original Paper Source & Citation Modal */}
      {showSourceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div 
            className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden text-slate-800"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-slate-200 bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500 text-white flex items-center justify-center font-bold shadow-md">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-white">論文原文位置與官方出版來源</h3>
                  <p className="text-xs text-slate-300">
                    International Journal of Information Management (IJIM)
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowSourceModal(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-5 text-xs sm:text-sm">
              {/* Paper Title & Journal info */}
              <div className="p-4 rounded-xl bg-indigo-50/70 border border-indigo-200 space-y-2">
                <div className="font-bold text-slate-900 text-sm leading-snug font-serif">
                  {ORIGINAL_PAPER_SOURCE.titleEn}
                </div>
                <div className="text-xs text-indigo-900 font-medium">
                  {ORIGINAL_PAPER_SOURCE.titleZh}
                </div>
                <div className="text-xs text-slate-500 pt-1 border-t border-indigo-100 flex flex-wrap gap-y-1 gap-x-3">
                  <span><strong>期刊：</strong>{ORIGINAL_PAPER_SOURCE.journal}</span>
                  <span><strong>卷期：</strong>{ORIGINAL_PAPER_SOURCE.volume}</span>
                  <span><strong>評級：</strong>{ORIGINAL_PAPER_SOURCE.journalImpact}</span>
                </div>
              </div>

              {/* Direct Access Links */}
              <div className="space-y-2">
                <div className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                  官方出版與學術取得管道 (點擊直接前往)：
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <a
                    href={ORIGINAL_PAPER_SOURCE.doiUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 rounded-xl border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/50 flex items-center justify-between group transition-all"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                        DOI
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 text-xs group-hover:text-indigo-600 transition-colors">
                          官方 DOI 永久連結
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          doi.org/10.1016/...
                        </div>
                      </div>
                    </div>
                    <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                  </a>

                  <a
                    href={ORIGINAL_PAPER_SOURCE.scienceDirectUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 rounded-xl border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/50 flex items-center justify-between group transition-all"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-700 flex items-center justify-center font-bold text-xs">
                        SD
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 text-xs group-hover:text-indigo-600 transition-colors">
                          Elsevier ScienceDirect
                        </div>
                        <div className="text-[11px] text-slate-400">
                          官方期刊全文與 PDF
                        </div>
                      </div>
                    </div>
                    <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                  </a>

                  <a
                    href={ORIGINAL_PAPER_SOURCE.googleScholarUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 rounded-xl border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/50 flex items-center justify-between group transition-all"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                        GS
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 text-xs group-hover:text-indigo-600 transition-colors">
                          Google Scholar 學術搜尋
                        </div>
                        <div className="text-[11px] text-slate-400">
                          查找引用文獻與開放存取
                        </div>
                      </div>
                    </div>
                    <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                  </a>

                  <a
                    href="mailto:vvenkatesh@vvenkatesh.us"
                    className="p-3 rounded-xl border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/50 flex items-center justify-between group transition-all"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                        @
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 text-xs group-hover:text-indigo-600 transition-colors">
                          通訊作者 Prof. Venkatesh
                        </div>
                        <div className="text-[11px] text-slate-400">
                          vvenkatesh@vvenkatesh.us
                        </div>
                      </div>
                    </div>
                    <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                  </a>
                </div>
              </div>

              {/* Authors List */}
              <div className="space-y-1.5 pt-1">
                <div className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                  原著作者與所屬機構：
                </div>
                <div className="space-y-1">
                  {ORIGINAL_PAPER_SOURCE.authors.map((auth, i) => (
                    <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200 text-xs">
                      <span className="font-semibold text-slate-800">{auth.name}</span>
                      <span className="text-slate-500">{auth.affil}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Citations Copy */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                    學術引用格式 (APA 7th & BibTeX)：
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleCopyApa}
                      className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
                    >
                      {copiedApa ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedApa ? '已複製 APA' : '複製 APA 7th'}</span>
                    </button>
                    <button
                      onClick={handleCopyBibtex}
                      className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
                    >
                      {copiedBibtex ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedBibtex ? '已複製 BibTeX' : '複製 BibTeX'}</span>
                    </button>
                  </div>
                </div>

                <div className="bg-slate-900 text-indigo-300 p-3 rounded-xl font-mono text-xs overflow-x-auto leading-relaxed">
                  {ORIGINAL_PAPER_SOURCE.apaCitation}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                本系統沈浸式翻譯段落皆標註有「對應原著 PDF 頁碼」便於嚴格查核
              </span>
              <button
                onClick={() => setShowSourceModal(false)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold transition-colors"
              >
                關閉視窗
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Global High-Res Methodology Infographic Lightbox */}
      <ImageLightboxModal
        isOpen={showImageLightbox}
        onClose={() => setShowImageLightbox(false)}
        onAskGemini={onAskGemini}
      />
    </div>
  );
};
