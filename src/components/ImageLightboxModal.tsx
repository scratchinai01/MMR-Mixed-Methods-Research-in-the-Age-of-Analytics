import React, { useState, useEffect, useRef } from 'react';
import { DECK } from '../data/thesisDeck.tsx';
import { 
  X, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Download, 
  ExternalLink, 
  Maximize2, 
  Sparkles, 
  BookOpen, 
  Layers, 
  Check, 
  Copy,
  Info,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface ImageItem {
  id: string;
  url: string;
  title: string;
  caption: string;
  description: string;
}

interface ImageLightboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl?: string;
  fallbackUrl?: string;
  title?: string;
  caption?: string;
  initialImageId?: string;
  onAskGemini?: (prompt: string) => void;
}

export const ImageLightboxModal: React.FC<ImageLightboxModalProps> = ({
  isOpen,
  onClose,
  imageUrl,
  fallbackUrl,
  title = '混合方法研究 (MMR) 全景架構圖',
  caption = '結合量化財務與質性新聞文本之 3 階段協同架構 (Raman et al., 2022)',
  initialImageId = 'img1',
  onAskGemini
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [activeView, setActiveView] = useState<'image' | 'analysis'>('image');
  const [copiedUrl, setCopiedUrl] = useState<boolean>(false);

  const images: ImageItem[] = [
    {
      id: 'img1',
      url: 'https://cdn.gamma.app/qczcgzm3dplba12/21329b1e9960461ea76049af3c5883ef/original/image.png',
      title: '主題一：MMR 混合方法研究全景架構圖',
      caption: '實用主義哲學 • 三角交叉檢驗 • 數值廣度與敘事深度融合',
      description: '本圖精準概括了管理學 SSCI 頂級期刊對 MMR 的四維要求，直接對應本論文各項計量與機器學習設計。'
    },
    {
      id: 'img2',
      url: 'https://cdn.gamma.app/qczcgzm3dplba12/dc0eae2c65c94d7abcfa76f3816afecc/original/image.png',
      title: '主題二：雙軌傳導鏈與模型對比圖 (Model A vs. Model B)',
      caption: 'Compustat 財務計量 ＋ WSJ 文字情緒 ➔ GEE 回歸 ➔ 機器學習預測',
      description: '詳細展示了加入文字情緒指標前後，Two-Class Bayes Point Machine 預測準確率從 70.7% 顯著躍升至 84.0% (+13.3%) 的核心對比。'
    },
    {
      id: 'img3',
      url: 'https://cdn.gamma.app/qczcgzm3dplba12/9b94218218934b80a2ff622e4055a893/original/image.png',
      title: '主題三：三階段協同與正面效果遞減分析圖',
      caption: 'Identify ➔ Explain ➔ Predict • 嚴謹文獻判定與係數解讀',
      description: '揭示 Sales_growth × Positive = -102.094 的負係數真諦：當預期被完全透支（Priced to Perfection），超額報酬反而顯著為負。'
    },
    {
      id: 'img4',
      url: 'https://cdn.gamma.app/qczcgzm3dplba12/31f0cf8a12c34c6eafc11666ce048330/original/image.png',
      title: '主題四：SSCI 期刊查核與 8 項學術品質檢核總表',
      caption: 'Web of Science SSCI Q1 • 2025 JIF 31.0 • AJG 2 • 博士論文可信度高',
      description: '完整核對 WoS Core Collection、JIF 歷年演變（2022 JIF 21.0 vs 2025 JIF 31.0）、JCR Q1、AJG 2024=2、非 FT50 與文獻品質卡。'
    },
    {
      id: 'img5',
      url: 'https://cdn.gamma.app/qczcgzm3dplba12/ca044b88abba4ab9b7b11c9b1f51c3c3/original/image.png',
      title: '主題五：Mixed Methods Research 混合方法研究架構總覽',
      caption: '量化與質性雙軌整合 • 博士論文 20 大 Skills 導覽圖',
      description: '結合 Creswell 經典方法論與當代計量金融實證架構之全景總覽圖。'
    },
    {
      id: 'img6',
      url: 'https://cdn.gamma.app/qczcgzm3dplba12/70dbe7ce78974009a403a083b190751d/original/image.png',
      title: '主題六：/MMR文獻篩選 反例教學 (Wang et al., 2023 JBR)',
      caption: '這不是典型 MMR • 作者雖宣稱 Mixed Methods 但實質為 Multi-study Quantitative Design',
      description: '詳細拆解 Pilot study ➔ Event study ➔ Experiment 1 ➔ Experiment 2 全部為量化設計，缺乏 QUAL 資料與整合，為博士論文文獻篩選的經典爭議與反例對照！'
    },
    {
      id: 'img7',
      url: 'https://cdn.gamma.app/qczcgzm3dplba12/0405f12a37e64bb7a5577eb329abb03b/original/image.png',
      title: '主題七：/MMR文獻篩選 真正 MMR 典範 (Afego & Alagidede, 2021 JCMS)',
      caption: '屬於 MMR（收斂並行）• Content Analysis ＋ Event Study • 整合停在敘事層',
      description: '質性分析企業抵制聲明之動機與正當性價值（QUAL），量化檢驗 Facebook Boycott 公告後 4 天之股票異常報酬 +2.68%（QUAN），共同回答企業社會倡議的市場訊號效應！'
    },
    {
      id: 'img8',
      url: 'https://cdn.gamma.app/qczcgzm3dplba12/ceace1f12f5f471d90b70107fa6747b5/original/image.png',
      title: '主題八：資料轉化模式 Data Transformation Model (QUAL into quan)',
      caption: '★ Raman et al. (2022) 核心採用模式 • 符號表達式：QUAL ➔ 轉化成 quan 資料 ➔ 與 QUAN 相互關聯',
      description: '將 WSJ 2,500 篇非結構化新聞文字透過 NLP 與 LM 詞典轉化為量化情感分數（quan），再與 Compustat 財務數據與事件研究超額報酬（QUAN）進行深度面板計量與機器學習相互關聯！'
    },
    {
      id: 'img9',
      url: 'https://cdn.gamma.app/qczcgzm3dplba12/a258c799d57c43dbb989ede9ff39d03a/original/image.png',
      title: '主題九：本篇論文 (Raman et al., 2022) 的「真正價值」與四大深層經濟真相',
      caption: '情緒不是「主菜」而是放大鏡與扭曲器 • Table 2 正面效果遞減 (-102.094)',
      description: '深入剖析為何跑機器學習或 FinMind 數據會虧損：因為缺乏實用主義哲學與三角交叉檢驗。揭示 Sales_growth × Positive = -102.094 的反直覺真理與 Priced to Perfection 假說！'
    }
  ];

  // 依「論文發展＝簡報順序」排列：定位 → 理論架構 → 研究設計 → 方法 → 結果 → 文獻比較 → 延伸
  const ORDER: Array<{ id: string; stage: string; slides: string[] }> = [
    { id: 'img4', stage: '論文定位', slides: ['p1'] },
    { id: 'img3', stage: '三階段架構', slides: ['p4', 'p9'] },
    { id: 'img1', stage: 'MMR 是什麼', slides: ['p5'] },
    { id: 'img8', stage: '資料轉化設計', slides: ['p5', 'p8'] },
    { id: 'img2', stage: '方法：雙軌模型', slides: ['p9', 'p11'] },
    { id: 'img9', stage: '結果：效果遞減', slides: ['p10', 'r10', 'c3'] },
    { id: 'img6', stage: '對照：非典型 MMR', slides: ['c5'] },
    { id: 'img7', stage: '對照：典型 MMR', slides: ['c5'] },
    { id: 'img5', stage: '延伸：研究技能總覽', slides: ['c6'] },
  ];
  const CN = ['一', '二', '三', '四', '五', '六', '七', '八', '九'];
  const ordered = ORDER.map((o, i) => {
    const img = images.find((x) => x.id === o.id)!;
    const pages = o.slides.map((sid) => DECK.findIndex((d) => d.id === sid) + 1).filter((n) => n > 0);
    return { ...img, n: i + 1, stage: o.stage, pages, title: `主題${CN[i]}：${img.title.replace(/^主題.：/, '')}` };
  });

  const [selectedImgId, setSelectedImgId] = useState<string>(initialImageId);

  useEffect(() => {
    setSelectedImgId(initialImageId || 'img1');
    setZoomLevel(1);
  }, [isOpen, initialImageId]);

  const currentImage = ordered.find(img => img.id === selectedImgId) || ordered[0];
  const curIdx = Math.max(0, ordered.findIndex((img) => img.id === currentImage.id));
  const goImg = (d: number) => {
    const n = Math.min(Math.max(curIdx + d, 0), ordered.length - 1);
    if (n === curIdx) return;
    setSelectedImgId(ordered[n].id);
    setZoomLevel(1);
  };

  // 觸控／滑鼠左右滑動換圖
  const swipe = useRef<{ x: number; y: number; t: number } | null>(null);
  const onSwipeStart = (e: React.PointerEvent) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    swipe.current = { x: e.clientX, y: e.clientY, t: Date.now() };
  };
  const onSwipeEnd = (e: React.PointerEvent) => {
    const s0 = swipe.current;
    swipe.current = null;
    if (!s0) return;
    const dx = e.clientX - s0.x, dy = e.clientY - s0.y;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5 && Date.now() - s0.t < 800) goImg(dx < 0 ? 1 : -1);
  };

  // 目前的分頁標籤自動捲到看得見的位置
  const tabsRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    tabsRef.current?.querySelector<HTMLElement>(`[data-img="${currentImage.id}"]`)?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  }, [currentImage.id, isOpen]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') onClose();
      if (e.key === '+' || e.key === '=') handleZoomIn();
      if (e.key === '-') handleZoomOut();
      if (e.key === '0') handleResetZoom();
      if (e.key === 'ArrowRight') goImg(1);
      if (e.key === 'ArrowLeft') goImg(-1);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, zoomLevel, curIdx]);

  if (!isOpen) return null;

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 0.25, 2.5));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 0.25, 0.5));
  const handleResetZoom = () => setZoomLevel(1);

  const handleCopyLink = () => {
    const target = currentImage.url || fallbackUrl || '';
    navigator.clipboard.writeText(target);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = currentImage.url;
    a.download = `${currentImage.id}_Framework.png`;
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 lg:p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl border border-slate-700/50 w-full max-w-6xl max-h-[94vh] flex flex-col overflow-hidden text-slate-800"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Bar */}
        <div className="px-5 py-3.5 bg-slate-900 border-b border-slate-800 text-white flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white shrink-0 shadow-sm shadow-indigo-500/30">
              <BookOpen className="w-4 h-4" />
            </div>
            <div className="truncate">
              <h2 className="text-sm sm:text-base font-bold text-white truncate">
                {title}
              </h2>
              <p className="text-[11px] text-slate-400 truncate">
                {caption}
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* View Switcher */}
            <div className="flex bg-slate-800 p-0.5 rounded-lg border border-slate-700 text-xs">
              <button
                onClick={() => setActiveView('image')}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                  activeView === 'image'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                架構圖
              </button>
              <button
                onClick={() => setActiveView('analysis')}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                  activeView === 'analysis'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                論文實證對齊解析
              </button>
            </div>

            {/* Copy Link */}
            <button
              onClick={handleCopyLink}
              title="複製圖片連結"
              className="p-1.5 sm:p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            >
              {copiedUrl ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>

            {/* Download */}
            <button
              onClick={handleDownload}
              title="下載原始高清圖檔 (1536×1024)"
              className="p-1.5 sm:p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            >
              <Download className="w-4 h-4" />
            </button>

            {/* Close */}
            <button
              onClick={onClose}
              className="p-1.5 sm:p-2 text-slate-400 hover:text-white hover:bg-rose-600/80 rounded-lg transition-colors ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto bg-slate-950 flex flex-col">
          {activeView === 'image' ? (
            <div className="relative flex-1 min-h-[420px] flex items-center justify-center p-4 sm:p-6 overflow-auto">
              {/* Floating Zoom Toolbar */}
              <div className="absolute top-4 right-4 z-10 flex items-center gap-1 bg-slate-900/90 backdrop-blur-md px-2.5 py-1.5 rounded-xl border border-slate-700/80 text-white shadow-lg text-xs">
                <button
                  onClick={handleZoomOut}
                  disabled={zoomLevel <= 0.5}
                  className="p-1 hover:bg-slate-800 rounded-md disabled:opacity-40"
                  title="縮小 (-)"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <span className="font-mono px-1.5 text-indigo-300 font-semibold min-w-12 text-center">
                  {Math.round(zoomLevel * 100)}%
                </span>
                <button
                  onClick={handleZoomIn}
                  disabled={zoomLevel >= 2.5}
                  className="p-1 hover:bg-slate-800 rounded-md disabled:opacity-40"
                  title="放大 (+)"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <div className="w-px h-3.5 bg-slate-700 mx-0.5" />
                <button
                  onClick={handleResetZoom}
                  className="p-1 hover:bg-slate-800 rounded-md"
                  title="重置 100% (0)"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* The Image */}
              <div className="flex flex-col items-center justify-center w-full h-full pb-8">
                {/* 3 Theme Images Selector Tabs */}
                <div ref={tabsRef} className="flex items-center gap-1.5 mb-4 bg-slate-900/90 p-1.5 rounded-2xl border border-slate-700 shadow-lg max-w-full overflow-x-auto no-scrollbar">
                  {ordered.map((img) => (
                    <button
                      key={img.id}
                      data-img={img.id}
                      onClick={() => {
                        setSelectedImgId(img.id);
                        setZoomLevel(1);
                      }}
                      className={`shrink-0 px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                        selectedImgId === img.id
                          ? 'bg-indigo-600 text-white shadow-md'
                          : 'text-slate-300 hover:text-white hover:bg-slate-800'
                      }`}
                    >
                      <span className="w-5 h-5 rounded-md bg-white/10 flex items-center justify-center font-mono text-[11px]">{img.n}</span>
                      <span className="whitespace-nowrap">{img.stage}</span>
                    </button>
                  ))}
                </div>

                <div
                  className="relative w-full flex items-center justify-center select-none"
                  style={{ touchAction: 'pan-y pinch-zoom' }}
                  onPointerDown={onSwipeStart}
                  onPointerUp={onSwipeEnd}
                  onPointerCancel={() => { swipe.current = null; }}
                >
                  <div
                    className="transition-transform duration-150 ease-out origin-center flex items-center justify-center max-w-full"
                    style={{ transform: `scale(${zoomLevel})` }}
                  >
                    <img
                      src={currentImage.url}
                      alt={currentImage.title}
                      draggable={false}
                      className="rounded-2xl shadow-2xl max-w-full max-h-[66vh] object-contain border border-slate-700/80 bg-slate-900"
                    />
                  </div>
                  {/* 左右換圖按鈕 */}
                  <button onClick={() => goImg(-1)} disabled={curIdx === 0} aria-label="上一張"
                    className="absolute left-1 sm:left-3 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-slate-900/70 hover:bg-slate-800 border border-slate-600 text-white flex items-center justify-center disabled:opacity-0 transition-opacity">
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button onClick={() => goImg(1)} disabled={curIdx === ordered.length - 1} aria-label="下一張"
                    className="absolute right-1 sm:right-3 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-slate-900/70 hover:bg-slate-800 border border-slate-600 text-white flex items-center justify-center disabled:opacity-0 transition-opacity">
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </div>

                <div className="mt-4 text-center max-w-2xl px-4">
                  <h3 className="text-white font-bold text-sm sm:text-base">{currentImage.title}</h3>
                  <p className="text-xs text-indigo-200 mt-1">{currentImage.caption}</p>
                  {currentImage.pages.length > 0 && (
                    <p className="text-[11px] text-amber-300 mt-1.5">對應簡報：{currentImage.pages.map((n) => `第 ${n} 頁`).join('、')}・依論文發展順序排列（{currentImage.n} / {ordered.length}）</p>
                  )}
                </div>
              </div>

              {/* Bottom Quick Help Prompt */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 px-3.5 py-1 rounded-full bg-slate-900/80 border border-slate-700 text-[11px] text-slate-300 backdrop-blur-xs flex items-center gap-2 pointer-events-none">
                <Info className="w-3 h-3 text-indigo-400" />
                <span>左右滑動或按 ← → 換圖・+/- 縮放・切換上方「論文實證對齊解析」查看深入詮釋</span>
              </div>
            </div>
          ) : (
            /* Detailed Analytical Breakdown View */
            <div className="flex-1 bg-white p-6 sm:p-8 space-y-6 text-slate-800 overflow-y-auto">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
                <div>
                  <h3 className="text-xl font-bold text-slate-950 font-serif">
                    混合方法研究 (MMR) 架構圖與 Raman et al. (2022) 論文完美對齊
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    本圖精準概括了管理學 SSCI 頂級期刊對 MMR 的四維要求，直接對應本論文各項計量與機器學習設計
                  </p>
                </div>
                {onAskGemini && (
                  <button
                    onClick={() => onAskGemini('請依據 MMR 全景架構圖，詳細解說 Raman et al. (2022) 如何結合量化與質性數據？')}
                    className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 transition-all shadow-xs shrink-0"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-200" />
                    <span>Gemini 深入解析此架構</span>
                  </button>
                )}
              </div>

              {/* Four Pillar Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 1. 定義與核心概念 */}
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3">
                  <div className="flex items-center gap-2 text-indigo-700 font-bold text-sm">
                    <span className="w-6 h-6 rounded-lg bg-indigo-100 flex items-center justify-center text-xs">1</span>
                    <span>核心概念：整合數字廣度與敘事深度</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    <strong>圖片標示：</strong>混合方法研究是在同一個研究中，同時結合「量化研究 (Quantitative)」與「質性研究 (Qualitative)」。整合數字廣度與敘事深度，解決單一方法無法解答的複雜難題。
                  </p>
                  <div className="p-3 bg-white rounded-xl border border-indigo-100 text-xs text-indigo-950 space-y-1">
                    <div className="font-semibold text-indigo-700">📜 論文落實 (Raman et al., 2022)：</div>
                    <div>• <strong>數字廣度：</strong>Compustat 企業財務數據 (營收、市值、PE、MB) 與 Eventus 累積超額報酬 (SCAR)。</div>
                    <div>• <strong>敘事深度：</strong>華爾街日報 (WSJ) 2,500+ 篇財經新聞之 Loughran-McDonald 金融情緒詞庫解析。</div>
                  </div>
                </div>

                {/* 2. 哲學基礎 */}
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3">
                  <div className="flex items-center gap-2 text-purple-700 font-bold text-sm">
                    <span className="w-6 h-6 rounded-lg bg-purple-100 flex items-center justify-center text-xs">2</span>
                    <span>哲學基礎：實用主義 (Pragmatism)</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    <strong>圖片標示：</strong>強調用最有效、最能解決問題的方法與視角。不拘泥於純實證主義（Positivism）或純建構主義（Constructivism）的二元對立。
                  </p>
                  <div className="p-3 bg-white rounded-xl border border-purple-100 text-xs text-purple-950 space-y-1">
                    <div className="font-semibold text-purple-700">📜 論文落實 (Raman et al., 2022)：</div>
                    <div>• 論文在 P.5 明確指出結合<strong>資訊理論 (Information Theory)</strong>與<strong>適應性市場假說 (Adaptive Markets Hypothesis, AMH)</strong>。</div>
                    <div>• 視新聞情緒為驅動投資人心理適應與非理性修正的催化劑，唯有實用主義能破除純回測的黑天鵝盲區。</div>
                  </div>
                </div>

                {/* 3. 主要目的 */}
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3">
                  <div className="flex items-center gap-2 text-emerald-700 font-bold text-sm">
                    <span className="w-6 h-6 rounded-lg bg-emerald-100 flex items-center justify-center text-xs">3</span>
                    <span>主要目的：三角交叉檢驗 (Triangulation)</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    <strong>圖片標示：</strong>包含「三角交叉檢驗（相互印證）」、「互補（不同視角補充）」與「深化理解（提高研究效度）」。
                  </p>
                  <div className="p-3 bg-white rounded-xl border border-emerald-100 text-xs text-emerald-950 space-y-1">
                    <div className="font-semibold text-emerald-700">📜 論文落實 (Raman et al., 2022)：</div>
                    <div>• <strong>相互印證：</strong>GEE 面板計量模型證明情緒具有顯著調節效應，四種機器學習演算法 (Tree, Neural Net) 亦同步確認加入文本情緒能顯著降低預測誤差。</div>
                    <div>• <strong>互補：</strong>量化揭示統計相關，質性新聞文本可協助解釋正面情緒「效果遞減」的原因。</div>
                  </div>
                </div>

                {/* 4. 四大常見研究設計類型 */}
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3">
                  <div className="flex items-center gap-2 text-amber-700 font-bold text-sm">
                    <span className="w-6 h-6 rounded-lg bg-amber-100 flex items-center justify-center text-xs">4</span>
                    <span>研究設計類型：嵌入式與收斂平行設計</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    <strong>圖片標示：</strong>收斂平行設計 (Convergent Parallel)、解釋性順序設計 (Explanatory Sequential)、探索性順序設計 (Exploratory Sequential)、嵌入式設計 (Embedded)。
                  </p>
                  <div className="p-3 bg-white rounded-xl border border-amber-100 text-xs text-amber-950 space-y-1">
                    <div className="font-semibold text-amber-700">📜 論文落實 (Raman et al., 2022)：</div>
                    <div>• 本論文採用<strong>三階段協同架構 (Tri-phase Framework)</strong>：</div>
                    <div>  Phase 1: 結構化資料庫與新聞文本同步擷取 (收斂平行)</div>
                    <div>  Phase 2: GEE 計量經濟學檢驗因果假設 (解釋性)</div>
                    <div>  Phase 3: 機器學習演算法預測並對比增益效果 (驗證性)</div>
                  </div>
                </div>
              </div>

              {/* Bottom direct actions */}
              <div className="p-4 rounded-xl bg-slate-900 text-white flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  <span>原圖解析度：1536 × 1024 像素 (PNG 無損壓縮)，可隨時下載作為研究或教學簡報之用。</span>
                </div>
                <button
                  onClick={handleDownload}
                  className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 font-semibold flex items-center gap-1.5 transition-colors text-white"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>下載原圖</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
