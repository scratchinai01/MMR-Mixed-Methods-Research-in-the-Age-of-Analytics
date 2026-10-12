import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  BookOpen, 
  GitMerge, 
  Layers, 
  ArrowRight, 
  CheckCircle2, 
  Send, 
  Loader2, 
  HelpCircle,
  TrendingUp,
  Cpu,
  RefreshCw,
  Compass,
  Image as ImageIcon,
  Maximize2,
  Download,
  ExternalLink,
  ZoomIn,
  Workflow,
  UploadCloud,
  TableProperties,
  GraduationCap,
  Scale
} from 'lucide-react';
import { ImageLightboxModal } from './ImageLightboxModal.tsx';
import { TriangulationAbcdeViewer } from './TriangulationAbcdeViewer.tsx';
import { Table42MajorDesignsViewer } from './Table42MajorDesignsViewer.tsx';
import { MarkdownReportViewer } from './MarkdownReportViewer.tsx';
import { callAiApi } from '../services/aiHelper.ts';
import { saveFollowupToFirestore } from '../services/firebase.ts';

interface MixedMethodModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAskGeminiAboutTopic?: (topic: string) => void;
  initialTab?: 'table42' | 'abcde' | 'infographic' | 'core' | 'designs' | 'paper' | 'gemini' | 'masterclass' | 'comparative';
  onOpenUploadModal?: () => void;
}

export const MixedMethodModal: React.FC<MixedMethodModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'table42',
  onOpenUploadModal,
}) => {
  const [activeTab, setActiveTab] = useState<'table42' | 'abcde' | 'infographic' | 'core' | 'designs' | 'paper' | 'gemini' | 'masterclass' | 'comparative'>(initialTab);
  const [showLightbox, setShowLightbox] = useState<boolean>(false);
  
  // Gemini AI query states
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState<Array<{ role: 'user' | 'ai'; text: string }>>([
    {
      role: 'ai',
      text: `您好！我是 **Gemini AI** 混合方法研究 (MMR) 與量化金融學術顧問。\n\n本研究論文《Mixed Methods Research in the Age of Analytics》（Raman et al., 2022）是資訊管理與計算財務領域將 **質性文本情緒（華爾街日報）** 與 **量化財務指標（Compustat）** 完美結合的典範。\n\n您可以點擊下方預設主題，或直接輸入您想深入探討的學術方法論或台股（FinMind 工具）實踐問題！`,
    },
  ]);

  if (!isOpen) return null;

  const handleAskGemini = async (questionText: string) => {
    if (!questionText.trim() || loading) return;
    const userMsg = questionText.trim();
    setChatHistory((prev) => [...prev, { role: 'user', text: userMsg }]);
    setQuery('');
    setLoading(true);

    try {
      const data = await callAiApi('/api/gemini/explain', {
        question: userMsg,
        context: `論文：Mixed Methods Research in the Age of Analytics (Raman et al., 2022, IJIM)。
核心變數：SCAR (累積超額報酬), Positive & Negative sentiment (Loughran-McDonald), PE_ratio, Sales_growth, MB_ratio, Size。
研究設計：三階段協同架構 (Identify -> Explain GEE -> Predict ML)，結合 FinMind 工具於台股實證復刻。`,
      });

      if (data && data.answer) {
        setChatHistory((prev) => [...prev, { role: 'ai', text: data.answer }]);
        // Persist follow-up to Firebase Firestore
        saveFollowupToFirestore({
          sourceModule: 'mmr_reader',
          topic: 'MMR 混合方法研究解析',
          question: userMsg,
          answer: data.answer,
          modelUsed: data.modelUsed || 'Gemini 2.5 Flash',
        }).catch(err => console.warn('Firebase followup save warning in MixedMethodModal:', err));
      } else {
        setChatHistory((prev) => [
          ...prev,
          { role: 'ai', text: data.fallback || '抱歉，暫時無法取得 AI 回應，請稍後重試。' },
        ]);
      }
    } catch (err: any) {
      setChatHistory((prev) => [
        ...prev,
        { role: 'ai', text: `調用 AI 發生錯誤：${err.message}` },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const presetQuestions = [
    '請深入解說 Creswell 圖 4.1 三角校正設計中的 (c) 資料轉化模式，以及 Raman et al. (2022) 論文如何運用？',
    '圖 4.1 中 a、b、c、d、e 五大三角校正模式的本質差異是什麼？各適用於何種金融市場研究？',
    '以台股台積電 (2330) 為例，如何使用 (c) 資料轉化模式將新聞文字轉化為 quan 變數並輸入 XGBoost？',
    '實用主義 (Pragmatism) 為何能打破傳統量化回測在黑天鵝事件的盲點？',
    '請深入解析 Table 2 關鍵交互作用項 Sales_growth X Positive 為何為顯著負值 (-102.094)？',
    '在台股實務中，Loughran-McDonald 金融情緒詞庫需要進行哪些中文化與在地化調校？',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden text-slate-800"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-slate-50 via-indigo-50/50 to-purple-50/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-sm shadow-indigo-200">
              <Sparkles className="w-5 h-5 text-amber-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900">
                  Mixed Methods Research (MMR) 混合方法研究解析
                </h2>
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-700">
                  Gemini AI 支援
                </span>
              </div>
              <p className="text-xs text-slate-500">
                融合數字的廣度（量化）與敘事的深度（質性）• 實用主義哲學 • 三角交叉檢驗
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 px-6 bg-white gap-2 overflow-x-auto text-sm font-medium">
          <button
            onClick={() => setActiveTab('table42')}
            className={`py-3 px-3.5 border-b-2 flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'table42'
                ? 'border-indigo-600 text-indigo-600 font-semibold bg-indigo-50/50'
                : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
            }`}
          >
            <TableProperties className="w-4 h-4 text-indigo-600" />
            <span>表 4.2 主要設計類型</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500 text-white">
              先定哪一種
            </span>
          </button>

          <button
            onClick={() => setActiveTab('abcde')}
            className={`py-3 px-3.5 border-b-2 flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'abcde'
                ? 'border-indigo-600 text-indigo-600 font-semibold bg-indigo-50/50'
                : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
            }`}
          >
            <Workflow className="w-4 h-4 text-indigo-600" />
            <span>三角校正 (ABCDE 型)</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
              圖 4.1 變型
            </span>
          </button>

          <button
            onClick={() => setActiveTab('infographic')}
            className={`py-3 px-3.5 border-b-2 flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'infographic'
                ? 'border-indigo-600 text-indigo-600 font-semibold bg-indigo-50/50'
                : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
            }`}
          >
            <ImageIcon className="w-4 h-4 text-indigo-600" />
            <span>MMR 全景架構圖</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-700">
              1536×1024
            </span>
          </button>

          <button
            onClick={() => setActiveTab('core')}
            className={`py-3 px-3.5 border-b-2 flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'core'
                ? 'border-indigo-600 text-indigo-600 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>核心概念與特色</span>
          </button>

          <button
            onClick={() => setActiveTab('designs')}
            className={`py-3 px-3.5 border-b-2 flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'designs'
                ? 'border-indigo-600 text-indigo-600 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
            }`}
          >
            <GitMerge className="w-4 h-4" />
            <span>四大常見研究設計類型</span>
          </button>

          <button
            onClick={() => setActiveTab('paper')}
            className={`py-3 px-3.5 border-b-2 flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'paper'
                ? 'border-indigo-600 text-indigo-600 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>本篇論文之 MMR 典範</span>
          </button>

          <button
            onClick={() => setActiveTab('comparative')}
            className={`py-3 px-3.5 border-b-2 flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'comparative'
                ? 'border-indigo-600 text-indigo-600 font-semibold bg-indigo-50/50'
                : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
            }`}
          >
            <Scale className="w-4 h-4 text-indigo-600" />
            <span>⚖️ 多元文獻比較</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-700">
              Logo 動態性 vs MMR
            </span>
          </button>

          <button
            onClick={() => setActiveTab('masterclass')}
            className={`py-3 px-3.5 border-b-2 flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'masterclass'
                ? 'border-indigo-600 text-indigo-600 font-semibold bg-amber-50/50'
                : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
            }`}
          >
            <GraduationCap className="w-4 h-4 text-amber-600" />
            <span>🎓 博士生方法論大師課</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-slate-950">
              QUAN → qual
            </span>
          </button>

          <button
            onClick={() => setActiveTab('gemini')}
            className={`py-3 px-3.5 border-b-2 flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'gemini'
                ? 'border-purple-600 text-purple-600 font-semibold bg-purple-50/50'
                : 'border-transparent text-slate-500 hover:text-purple-700 hover:border-slate-300'
            }`}
          >
            <Sparkles className="w-4 h-4 text-purple-500" />
            <span>Gemini AI 互動解說</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50 text-slate-700">
          {/* TAB 0: 表 4.2 主要的混合方法設計類型 (先定大類 ➔ 再定變型) */}
          {activeTab === 'table42' && (
            <div className="space-y-5">
              {onOpenUploadModal && (
                <div className="p-4 rounded-2xl bg-gradient-to-r from-rose-500 via-indigo-600 to-purple-600 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs shadow-md">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md text-white flex items-center justify-center shrink-0">
                      <UploadCloud className="w-5 h-5 text-amber-200" />
                    </div>
                    <div>
                      <div className="font-extrabold text-sm flex items-center gap-2">
                        <span>不確定您的論文屬於哪種主要設計？</span>
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-400 text-slate-950">AI 智慧判定</span>
                      </div>
                      <div className="text-white/85 mt-0.5">
                        上傳學術論文 (PDF/TXT)，由 Gemini 依據表 4.2 檢驗「時機與權重」，先判定大類、再推導子變型！
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      onClose();
                      onOpenUploadModal();
                    }}
                    className="px-4 py-2 rounded-xl bg-white text-indigo-900 font-bold hover:bg-slate-100 transition-all shrink-0 shadow-xs whitespace-nowrap active:scale-95"
                  >
                    上傳論文進行兩階段診斷 ➔
                  </button>
                </div>
              )}

              <Table42MajorDesignsViewer
                onAskGemini={(q) => {
                  setActiveTab('gemini');
                  handleAskGemini(q);
                }}
                onSelectDesign={(d) => {
                  if (d === 'triangulation') {
                    setActiveTab('abcde');
                  }
                }}
              />
            </div>
          )}

          {/* TAB 0.5: 三角校正設計 ABCDE 型 (圖 4.1 五大變型) */}
          {activeTab === 'abcde' && (
            <div className="space-y-5">
              {onOpenUploadModal && (
                <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-50 via-purple-50 to-amber-50 border border-indigo-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs shadow-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center shrink-0 shadow-sm shadow-indigo-500/20">
                      <UploadCloud className="w-5 h-5 text-amber-200" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
                        <span>想檢驗您的論文屬於哪種 ABCDE 型？</span>
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-indigo-600 text-white">NEW</span>
                      </div>
                      <div className="text-slate-600 mt-0.5">
                        上傳學術論文 (PDF / TXT)，Gemini 依據 Creswell 體系為您精準判定變型、檢驗雙軌整合深度與元推論！
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      onClose();
                      onOpenUploadModal();
                    }}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition-all shrink-0 shadow-xs hover:shadow whitespace-nowrap active:scale-95"
                  >
                    上傳論文進行 MMR 診斷 ➔
                  </button>
                </div>
              )}

              <TriangulationAbcdeViewer
                onAskGemini={(q) => {
                  setActiveTab('gemini');
                  handleAskGemini(q);
                }}
              />
            </div>
          )}

          {/* TAB 1: 核心概念與特色 */}
          {activeTab === 'core' && (
            <div className="space-y-6">
              {/* Infographic Teaser Banner */}
              <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-950 p-4 rounded-2xl text-white shadow-sm border border-indigo-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div 
                    onClick={() => setShowLightbox(true)}
                    className="w-20 h-14 rounded-xl overflow-hidden border border-indigo-400/30 shrink-0 bg-slate-950 relative group cursor-pointer shadow-xs"
                    title="點擊放大查看 1536×1024 高清圖"
                  >
                    <img 
                      src="/images/paper_framework_diagram.png" 
                      alt="MMR 架構圖縮圖" 
                      onError={(e) => {
                        e.currentTarget.src = "https://cdn.gamma.app/qczcgzm3dplba12/21329b1e9960461ea76049af3c5883ef/original/image.png";
                      }}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform" 
                    />
                    <div className="absolute inset-0 bg-black/30 group-hover:bg-transparent transition-colors flex items-center justify-center">
                      <ZoomIn className="w-4 h-4 text-white drop-shadow-sm" />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-white text-sm">混合方法研究 (MMR) 全景架構圖</h4>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-500 text-white">1536×1024</span>
                    </div>
                    <p className="text-xs text-indigo-200/80 mt-0.5">
                      完整涵蓋定義、實用主義哲學、三角交叉檢驗及四大常見研究設計類型。
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => setActiveTab('infographic')}
                    className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs transition-colors shadow-2xs"
                  >
                    前往圖解專頁
                  </button>
                  <button
                    onClick={() => setShowLightbox(true)}
                    className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                    title="燈箱全螢幕放大"
                  >
                    <Maximize2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
                <div className="flex items-center gap-2 text-indigo-900 font-bold text-base mb-2">
                  <div className="w-2 h-5 bg-indigo-600 rounded-sm"></div>
                  什麼是混合方法研究（Mixed Methods Research, MMR）？
                </div>
                <p className="text-slate-600 leading-relaxed text-sm">
                  混合方法研究是在<strong>同一個研究或專案計畫中</strong>，同時結合<strong>量化研究（Quantitative Research）</strong>與<strong>質性研究（Qualitative Research）</strong>的系統性方法論。它不只是簡單將兩種數據相加，而是透過精密的整合設計，發揮相輔相成的綜效。
                </p>
              </div>

              {/* Three Core Pillars */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-indigo-200 transition-all">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold mb-3">
                    01
                  </div>
                  <h3 className="font-bold text-slate-900 text-base mb-1.5">核心定義</h3>
                  <div className="text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-2">
                    Integration of Breadth & Depth
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    整合<strong>數字的廣度（量化）</strong>與<strong>敘事的深度（質性）</strong>。在金融投資中，財報數字呈現規模與成長廣度，而即時新聞與訴訟文本則揭示事件脈絡與情感深度，用來處理單一方法無法完整解答的複雜市場異象。
                  </p>
                </div>

                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-purple-200 transition-all">
                  <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center font-bold mb-3">
                    02
                  </div>
                  <h3 className="font-bold text-slate-900 text-base mb-1.5">哲學基礎：實用主義</h3>
                  <div className="text-xs font-semibold text-purple-600 uppercase tracking-wider mb-2">
                    Pragmatism Paradigm
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    主要奠基於<strong>實用主義（Pragmatism）</strong>，強調「用最有效、最能解決問題的方法與視角來設計研究」。破除純客觀實證論與純主觀詮釋論的二元對立，只要能提升超額報酬預測力與因果解釋度，即應協同採納。
                  </p>
                </div>

                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-emerald-200 transition-all">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold mb-3">
                    03
                  </div>
                  <h3 className="font-bold text-slate-900 text-base mb-1.5">主要目的：三角交叉檢驗</h3>
                  <div className="text-xs font-semibold text-emerald-600 uppercase tracking-wider mb-2">
                    Triangulation & Complementarity
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    透過<strong>三角交叉檢驗（Triangulation，相互印證）</strong>、互補與深化理解，大幅提升研究結果的內部與外部信效度。量化驗證假說、質性挖掘機轉，避免單純資料探勘（Data Snooping）帶來的虛假相關。
                  </p>
                </div>
              </div>

              {/* Comparison Box */}
              <div className="bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-transparent p-5 rounded-xl border border-indigo-100">
                <h4 className="font-bold text-indigo-950 text-sm mb-3 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-indigo-600" />
                  金融研究中的單一方法 vs. MMR 混合方法對照
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="bg-white p-3 rounded-lg border border-slate-200">
                    <span className="font-semibold text-slate-700 block mb-1">❌ 純量化研究盲點 (Quantitative Only)</span>
                    <span className="text-slate-500">
                      只看財報歷史數據（PE、營收），存在嚴重滯後性；遭遇資安洩漏、突發訴訟或地緣風險時，量化模型往往呈現多頭信號卻在黑天鵝中重挫。
                    </span>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-indigo-200">
                    <span className="font-semibold text-indigo-700 block mb-1">✅ MMR 混合方法優勢 (FinMind 工具落地)</span>
                    <span className="text-slate-600">
                      以財務量化為基石，即時疊加財經新聞情緒（Loughran-McDonald），利用 GEE 捕捉交互作用，機器學習分類準確率由 68% 躍升至 99.7%！
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: 四大常見研究設計類型 */}
          {activeTab === 'designs' && (
            <div className="space-y-4">
              <div className="text-sm text-slate-600 mb-2">
                Creswell & Plano Clark 提出的四種經典混合方法架構，在金融科技與量化投資中的具體對應：
              </div>

              {/* Design 1 */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-indigo-300 transition-all">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-0.5 rounded text-xs font-bold bg-blue-100 text-blue-800">
                      類型一
                    </span>
                    <h3 className="font-bold text-slate-900 text-base">
                      收斂平行設計（Convergent Parallel Design）
                    </h3>
                  </div>
                  <span className="text-xs text-slate-400 font-mono">QUAN + QUAL</span>
                </div>
                <p className="text-xs text-slate-600 mb-3 leading-relaxed">
                  <strong>定義：</strong>同一個時間區間內，同時獨立收集質性數據（如新聞文本情緒）與量化數據（如財務指標），在分析最後階段將兩者結果放在一起比較、整合或共同放入模型驗證。
                </p>
                <div className="bg-blue-50/70 p-3 rounded-lg border border-blue-100 text-xs text-blue-900">
                  <strong>台股 FinMind 實踐範例：</strong>同時調取 2330 台積電之季報財務比率（PE、Sales Growth）與 2,500 篇財經新聞情緒評分，在機器學習模型（Table 8）中平行特徵融合，對比預測精準度的顯著增益。
                </div>
              </div>

              {/* Design 2 */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-indigo-300 transition-all">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-0.5 rounded text-xs font-bold bg-amber-100 text-amber-800">
                      類型二
                    </span>
                    <h3 className="font-bold text-slate-900 text-base">
                      解釋性順序設計（Explanatory Sequential Design）
                    </h3>
                  </div>
                  <span className="text-xs text-slate-400 font-mono">QUAN → qual</span>
                </div>
                <p className="text-xs text-slate-600 mb-3 leading-relaxed">
                  <strong>定義：</strong>第一階段先執行大規模量化研究；第二階段再透過質性研究或文字分析深入解釋、釐清量化數據背後的原因與機轉（「為什麼會這樣？」）。
                </p>
                <div className="bg-amber-50/70 p-3 rounded-lg border border-amber-100 text-xs text-amber-900">
                  <strong>台股 FinMind 實踐範例：</strong>量化統計發現高營收成長股在特定季度出現超常負向報酬（SCAR 下跌），進一步調取該季度之質性新聞進行語意分析，發現背後存在海外擴廠資本支出失控或同業訴訟事件。
                </div>
              </div>

              {/* Design 3 */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-indigo-300 transition-all">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-0.5 rounded text-xs font-bold bg-emerald-100 text-emerald-800">
                      類型三
                    </span>
                    <h3 className="font-bold text-slate-900 text-base">
                      探索性順序設計（Exploratory Sequential Design）
                    </h3>
                  </div>
                  <span className="text-xs text-slate-400 font-mono">QUAL → quan</span>
                </div>
                <p className="text-xs text-slate-600 mb-3 leading-relaxed">
                  <strong>定義：</strong>第一階段先透過質性文本、專業訪談深入探索未知現象或建立新的假說／變數概念；第二階段再針對全市場大規模量化數據進行統計回測與檢定。
                </p>
                <div className="bg-emerald-50/70 p-3 rounded-lg border border-emerald-100 text-xs text-emerald-900">
                  <strong>台股 FinMind 實踐範例：</strong>先從 PTT 股版、法說會質詢逐字稿中探索新名詞（如「先進封裝 CoWoS 產能瓶頸」），將其定義為特定情緒詞庫後，再利用 FinMind 全市場 500 檔股票進行跨 10 年回測驗證。
                </div>
              </div>

              {/* Design 4 */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-indigo-300 transition-all">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-0.5 rounded text-xs font-bold bg-purple-100 text-purple-800">
                      類型四
                    </span>
                    <h3 className="font-bold text-slate-900 text-base">
                      嵌入式設計（Embedded Design）
                    </h3>
                  </div>
                  <span className="text-xs text-slate-400 font-mono">QUAN (qual)</span>
                </div>
                <p className="text-xs text-slate-600 mb-3 leading-relaxed">
                  <strong>定義：</strong>以其中一種研究方法為絕對主體、另一種方法為輔助支援（例如在大規模量化計量實驗中，嵌入局部的質性案例訪談或特定危機事件文本檢驗）。
                </p>
                <div className="bg-purple-50/70 p-3 rounded-lg border border-purple-100 text-xs text-purple-900">
                  <strong>台股 FinMind 實踐範例：</strong>建構純量化多因子選股模型（主體），但針對資安重大事件或董監涉訟時，嵌入特定文本規則作為「一票否決權」之風險濾網。
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: 本篇論文之 MMR 典範 */}
          {activeTab === 'paper' && (
            <div className="space-y-5">
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
                <h3 className="font-bold text-slate-900 text-base mb-2">
                  本篇論文如何實踐三階段協同架構 (Synergistic Framework)？
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  Raman et al. (2022) 在《IJIM》中提出了一套被學界推崇的標準三階段架構（Figure 1），兼具<strong>收斂平行</strong>與<strong>解釋性順序</strong>之雙重優勢：
                </p>

                <div className="relative flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
                  {/* Phase 1 */}
                  <div className="flex-1 bg-indigo-50/70 border border-indigo-200 p-3.5 rounded-xl w-full">
                    <div className="font-bold text-indigo-900 mb-1 flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px]">1</span>
                      Phase 1: 辨識與資料擷取 (Identify)
                    </div>
                    <p className="text-indigo-800">
                      • <strong>量化數據：</strong>Compustat 財務比率（PE, Sales Growth, MB, Size）<br />
                      • <strong>質性文本：</strong>Python 爬蟲獲取 2,500 篇 WSJ 報導，R 語言搭配 Loughran-McDonald 詞典抽取 Positive/Negative 情緒。
                    </p>
                  </div>

                  <ArrowRight className="hidden md:block w-5 h-5 text-slate-400 shrink-0" />

                  {/* Phase 2 */}
                  <div className="flex-1 bg-purple-50/70 border border-purple-200 p-3.5 rounded-xl w-full">
                    <div className="font-bold text-purple-900 mb-1 flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-purple-600 text-white flex items-center justify-center text-[10px]">2</span>
                      Phase 2: 機轉解釋 (Explain)
                    </div>
                    <p className="text-purple-800">
                      • 採用 <strong>GEE 廣義估計方程式</strong> 解決時間自相關。<br />
                      • 關鍵發現：<strong>Sales_growth × Positive (β = -102.094**)</strong>，證實好消息在高成長下產生邊際遞減！
                    </p>
                  </div>

                  <ArrowRight className="hidden md:block w-5 h-5 text-slate-400 shrink-0" />

                  {/* Phase 3 */}
                  <div className="flex-1 bg-emerald-50/70 border border-emerald-200 p-3.5 rounded-xl w-full">
                    <div className="font-bold text-emerald-900 mb-1 flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px]">3</span>
                      Phase 3: 預測評估 (Predict)
                    </div>
                    <p className="text-emerald-800">
                      • 60% 訓練 / 40% 測試集驗證。<br />
                      • 加入情緒後，Boosted Decision Tree 準確率自 67.9% 衝上 <strong>99.7%</strong>，AUC 達 <strong>99.9%</strong>！
                    </p>
                  </div>
                </div>
              </div>

              {/* Research Takeaways */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="bg-white p-4 rounded-xl border border-slate-200">
                  <div className="font-bold text-slate-900 mb-1">💡 為什麼需要實用主義 (Pragmatism)？</div>
                  <p className="text-slate-600 leading-relaxed">
                    實用主義不拘泥於傳統純數理統計或純文字詮釋的學術教條，而是問：「怎樣才能最精準預測企業異常報酬並防範地雷？」事實證明，結合兩種方法帶來了壓倒性的預測飛躍。
                  </p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200">
                  <div className="font-bold text-slate-900 mb-1">🎯 三角交叉檢驗 (Triangulation) 的勝利</div>
                  <p className="text-slate-600 leading-relaxed">
                    GEE 計量模型提供了因果與統計顯著性依據，而機器學習則驗證了非線性預測精度。兩者互相印證，排除了模型過度擬合（Overfitting）與單一視角的統計偏差。
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3.5: MMR 全景架構圖專頁 */}
          {activeTab === 'infographic' && (
            <div className="space-y-6">
              {/* Top Action Bar */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-900 text-base">
                      混合方法研究 (MMR) 全景圖解與方法論對齊
                    </h3>
                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-700">
                      1536 × 1024 高清原圖
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    結合「量化研究」的數字廣度與「質性研究」的敘事深度 • 實用主義哲學 • 三角交叉檢驗
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => setShowLightbox(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-xs transition-colors"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                    <span>燈箱全螢幕</span>
                  </button>
                  <a
                    href="/images/paper_framework_diagram.png"
                    download="MMR_Framework.png"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>下載</span>
                  </a>
                  <button
                    onClick={() => {
                      setActiveTab('gemini');
                      handleAskGemini('請依據這張 MMR 全景架構圖，詳細解析 Raman et al. (2022) 論文的方法論架構！');
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 font-semibold text-xs transition-colors border border-purple-200"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                    <span>Gemini 解析</span>
                  </button>
                </div>
              </div>

              {/* Central High-Res Graphic Container with Click to Expand */}
              <div 
                onClick={() => setShowLightbox(true)}
                className="group relative bg-slate-950 rounded-2xl p-3 sm:p-4 border border-slate-800 shadow-xl cursor-pointer overflow-hidden transition-all hover:border-indigo-500/60"
              >
                <div className="absolute top-4 right-4 z-10 opacity-90 group-hover:opacity-100 transition-opacity">
                  <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/60 backdrop-blur-md border border-white/20 text-white text-xs font-semibold shadow-lg">
                    <ZoomIn className="w-3.5 h-3.5 text-indigo-400" />
                    <span>點擊開啟無損全螢幕燈箱 (可任意縮放)</span>
                  </span>
                </div>

                <div className="flex items-center justify-center min-h-[300px] max-h-[560px] overflow-hidden rounded-xl bg-slate-900/50">
                  <img
                    src="/images/paper_framework_diagram.png"
                    alt="混合方法研究 (MMR) 全景架構圖"
                    onError={(e) => {
                      e.currentTarget.src = "https://cdn.gamma.app/qczcgzm3dplba12/21329b1e9960461ea76049af3c5883ef/original/image.png";
                    }}
                    className="max-h-[540px] w-auto object-contain rounded-lg group-hover:scale-[1.01] transition-transform duration-200"
                  />
                </div>

                <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400 px-2">
                  <span>💡 提示：此圖為高清 1536×1024 向量精繪圖，放大不會失真模糊。</span>
                  <span className="text-indigo-400 font-medium">支援鍵盤 ESC 關閉、+/- 縮放</span>
                </div>
              </div>

              {/* 4 Quadrants Detailed Academic Alignment Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-4.5 rounded-xl border border-slate-200 shadow-xs space-y-2">
                  <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                    <span className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center text-xs">A</span>
                    <span>1. 核心概念 (Core Concept)</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    整合<strong>數字的廣度</strong>（量化）與<strong>敘事的深度</strong>（質性）。本論文結合 S&P 500 企業的財報量化變數與華爾街日報即時財經新聞，破解單純歷史量化數據的嚴重時滯性。
                  </p>
                </div>

                <div className="bg-white p-4.5 rounded-xl border border-slate-200 shadow-xs space-y-2">
                  <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                    <span className="w-6 h-6 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center text-xs">B</span>
                    <span>2. 哲學基礎：實用主義 (Pragmatism)</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    強調用最能解決問題的方法。論文結合<strong>資訊理論 (Information Theory)</strong>與<strong>適應性市場假說 (AMH)</strong>，證明新聞情緒調節投資人定價心理，打破傳統有效市場假說 (EMH) 的理性假設。
                  </p>
                </div>

                <div className="bg-white p-4.5 rounded-xl border border-slate-200 shadow-xs space-y-2">
                  <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                    <span className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center text-xs">C</span>
                    <span>3. 三角交叉檢驗 (Triangulation)</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    GEE 計量模型確認<strong>營收成長 × 正面情緒</strong>具備顯著調節負效應（β = -102.094**），機器學習模型同步驗證加入情緒特徵能將預測準確率自 67.9% 推升至 99.7%，達到相互印證。
                  </p>
                </div>

                <div className="bg-white p-4.5 rounded-xl border border-slate-200 shadow-xs space-y-2">
                  <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                    <span className="w-6 h-6 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center text-xs">D</span>
                    <span>4. 四大常見研究設計類型</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    包含<strong>收斂平行設計、解釋性順序設計、探索性順序設計與嵌入式設計</strong>。本論文以三階段協同（擷取 ➔ GEE 因果解釋 ➔ 機器學習預測），完美實踐嵌入式與解釋性設計。
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Gemini 3.8 Flash AI 即時解析顧問 */}
          {activeTab === 'gemini' && (
            <div className="flex flex-col h-[520px]">
              {/* Chat Messages Log */}
              <div className="flex-1 overflow-y-auto space-y-4 pr-1 mb-4">
                {chatHistory.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex items-start gap-3 text-xs sm:text-sm ${
                      msg.role === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    {msg.role === 'ai' && (
                      <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shrink-0 shadow-xs">
                        <Sparkles className="w-4 h-4 text-amber-200" />
                      </div>
                    )}
                    <div
                      className={`max-w-[85%] rounded-2xl ${
                        msg.role === 'user'
                          ? 'bg-indigo-600 text-white shadow-xs rounded-tr-xs p-4 leading-relaxed whitespace-pre-wrap'
                          : 'bg-transparent text-slate-800 shadow-none'
                      }`}
                    >
                      {msg.role === 'user' ? (
                        msg.text
                      ) : (
                        <MarkdownReportViewer content={msg.text} fileName="Gemini_MMR_Consultant" />
                      )}
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex items-center gap-2 text-xs text-indigo-600 font-medium p-2 bg-indigo-50/50 rounded-lg w-fit">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Gemini 3.8 Flash 正在思考並撰寫學術分析...</span>
                  </div>
                )}
              </div>

              {/* Preset prompt buttons */}
              <div className="mb-3">
                <div className="text-[11px] font-semibold text-slate-400 mb-1.5 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-purple-500" />
                  點選熱門學術與台股實證問題：
                </div>
                <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                  {presetQuestions.map((q, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleAskGemini(q)}
                      disabled={loading}
                      className="px-2.5 py-1 rounded-full text-xs bg-white hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 border border-slate-200 hover:border-indigo-300 transition-all text-left truncate max-w-full"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>

              {/* Chat Input */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleAskGemini(query);
                }}
                className="flex items-center gap-2 bg-white p-1.5 rounded-xl border border-slate-300 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-100 transition-all shadow-xs"
              >
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="詢問 Gemini：關於混合方法研究 (MMR)、實用主義、GEE模型或台股復刻..."
                  className="flex-1 px-3 py-2 text-xs sm:text-sm bg-transparent outline-hidden text-slate-800 placeholder-slate-400"
                  disabled={loading}
                />
                <button
                  type="submit"
                  disabled={!query.trim() || loading}
                  className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>提問</span>
                </button>
              </form>
            </div>
          )}

          {/* TAB: 多元文獻比較 (Comparative) */}
          {activeTab === 'comparative' && (
            <div className="space-y-6 text-xs sm:text-sm text-slate-800 leading-relaxed">
              <div className="p-6 rounded-3xl bg-gradient-to-br from-indigo-950 via-slate-900 to-purple-950 text-white shadow-xl space-y-3">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-400 text-slate-950">
                    SSCI 嚴格學術審查報告
                  </span>
                  <span className="text-xs text-indigo-200 font-mono">Comparative Methodological Audit</span>
                </div>
                <h3 className="text-base sm:text-lg font-bold">
                  《The Impacts of Logo Dynamism and Product Types on Brand Market Performance: Quantitative Event Study and Qualitative Experiment Integration》是 MMR 嗎？
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  嚴格來說，這篇文獻比較偏向 <strong>Quantitative Multi-Method Research（量化多重方法研究）</strong> 而非典型的混合方法研究（MMR）。正如您所指出：「有量化＋有質性實驗」不等於自動成為 MMR。
                </p>
              </div>

              {/* Breakdown Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2.5">
                  <div className="font-bold text-slate-900 flex items-center gap-2 text-sm">
                    <span className="w-3 h-3 rounded-full bg-blue-600" />
                    <span>該文獻的雙軌研究設計</span>
                  </div>
                  <ul className="list-disc pl-4 space-y-1.5 text-xs text-slate-700">
                    <li><strong>第一階段 (QUAN)</strong>：事件研究法 (Event Study) 衡量標誌動態性對品牌市場超額報酬的衝擊。</li>
                    <li><strong>第二階段 (QUAN / 實驗)</strong>：讓受試者進行實驗觀看不同 Logo 並評分，檢定消費者心理反應。</li>
                    <li><strong>核心特徵</strong>：兩階段皆以「統計數字與量化檢定」為主，未見質性文本深度編碼與後設推論。</li>
                  </ul>
                </div>

                <div className="p-5 rounded-2xl bg-indigo-50/60 border border-indigo-100 shadow-xs space-y-2.5">
                  <div className="font-bold text-indigo-950 flex items-center gap-2 text-sm">
                    <span className="w-3 h-3 rounded-full bg-indigo-600" />
                    <span>為什麼這不能直接算 MMR？</span>
                  </div>
                  <ul className="list-disc pl-4 space-y-1.5 text-xs text-indigo-950/80">
                    <li><strong>缺乏質性本質 (Qualitative Nature)</strong>：實驗法收集的若為封閉式問卷分數，本質仍屬量化資料。</li>
                    <li><strong>缺乏 Integration 整合</strong>：真正的 MMR 要求 QUAN 與 QUAL 進行資料聯合展示（Joint Display）或互補解釋。</li>
                    <li><strong>學術定位區分</strong>：屬於 Quantitative Multi-Method，而非 Mixed Methods Research。</li>
                  </ul>
                </div>
              </div>

              {/* Comparison table */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Scale className="w-4 h-4 text-indigo-600" />
                  <span>三篇文獻方法論定性比較表</span>
                </h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-100 border-b border-slate-200 text-slate-900">
                        <th className="p-2.5">研究題目 / 典範</th>
                        <th className="p-2.5">資料類型 (QUAN / QUAL)</th>
                        <th className="p-2.5">是否為真實 MMR？</th>
                        <th className="p-2.5">整合層級 (Integration)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      <tr>
                        <td className="p-2.5 font-bold text-slate-900">Logo 動態性與品牌績效 (Event Study + Experiment)</td>
                        <td className="p-2.5">QUAN (事件研究) + QUAN/QUAL (實驗問卷)</td>
                        <td className="p-2.5 text-amber-700 font-semibold">⚠️ 偏向 Multi-Method (雙量化)</td>
                        <td className="p-2.5">結果層級對比，無深層因果轉化</td>
                      </tr>
                      <tr className="bg-indigo-50/30">
                        <td className="p-2.5 font-bold text-indigo-950">Raman et al. (2022) <span className="text-[10px] bg-indigo-100 text-indigo-800 px-1 py-0.5 rounded font-mono">IJIM 典範</span></td>
                        <td className="p-2.5">QUAN (Compustat) + QUAL (新聞文字 ➔ quan 轉化)</td>
                        <td className="p-2.5 text-emerald-700 font-bold">✅ 標準三角校正 (資料轉化模式)</td>
                        <td className="p-2.5">分析階段特徵合併 (Interaction Term)</td>
                      </tr>
                      <tr className="bg-emerald-50/40">
                        <td className="p-2.5 font-bold text-emerald-950">您的台股 FinMind 專案 <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1 py-0.5 rounded font-mono">解釋型依序</span></td>
                        <td className="p-2.5">QUAN (FinMind 財報/異常) ➔ QUAL (法說會/重訊語意)</td>
                        <td className="p-2.5 text-emerald-700 font-bold">⭐⭐⭐ 標準解釋型序貫 MMR</td>
                        <td className="p-2.5">異象驅動質性追蹤 ➔ 後設推論 (Meta-Inference)</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB: 博士生方法論大師課 (Masterclass) */}
          {activeTab === 'masterclass' && (
            <div className="space-y-6 text-xs sm:text-sm text-slate-800 leading-relaxed">
              <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white shadow-xl space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-amber-400 text-slate-950">
                  <span>🎓 博士生方法論大師課 (Masterclass)</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-extrabold text-white">
                  從哲學根基、溯因推理到聯合展示表與後設推論的完整實作指南
                </h3>
                <p className="text-xs sm:text-sm text-slate-300">
                  本大師課總結 Creswell、Morgan、Fetters 等權威學者精髓，專為高頻市場微結構與台股異常報酬研究打造。
                </p>
              </div>

              {/* 1. 速覽 */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
                <h4 className="font-bold text-slate-900 text-base flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-xs">0</span>
                  <span>一頁速覽（您的研究定位）</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-100">
                    <div className="font-bold text-indigo-900">設計名稱：解釋性依序設計 (QUAN → qual)</div>
                    <div className="text-slate-600 mt-1">具體變體：Follow-up Explanations Model（後續解釋模型）</div>
                  </div>
                  <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-100">
                    <div className="font-bold text-emerald-900">哲學基礎：實用主義 (Pragmatism)</div>
                    <div className="text-slate-600 mt-1">核心邏輯：溯因推理 (Abductive Reasoning) ─ 異象驅動質性追蹤</div>
                  </div>
                </div>
              </div>

              {/* 2. 4大條件 */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
                <h4 className="font-bold text-slate-900 text-base flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-xs">1</span>
                  <span>Creswell & Plano Clark (2018) 四大必要條件（審查委員會逐條檢查）</span>
                </h4>
                <ul className="list-disc pl-5 space-y-1.5 text-xs text-slate-700">
                  <li><strong>條件 1：蒐集並分析兩類資料</strong>（不僅是將新聞拿來舉例，而是具備嚴謹的文字情緒或質性編碼）。</li>
                  <li><strong>條件 2：整合 (Integration) 兩類資料與結果</strong>（兩股結果必須在分析或詮釋層「相遇」）。</li>
                  <li><strong>條件 3：具備明確設計名稱</strong>（論文中明寫 "explanatory sequential mixed methods design"）。</li>
                  <li><strong>條件 4：交代哲學假設與理論框架</strong>（如實用主義與適應性市場假說）。</li>
                </ul>
              </div>

              {/* 3. Joint Display */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
                <h4 className="font-bold text-slate-900 text-base flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-xs">2</span>
                  <span>聯合展示表 (Joint Display) 範例 — MMR 的靈魂</span>
                </h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-100 border-b border-slate-300 text-slate-900">
                        <th className="p-2">異常個案 / 事件</th>
                        <th className="p-2">量化特徵 (QUAN)</th>
                        <th className="p-2">質性發現 (qual)</th>
                        <th className="p-2">機制假說</th>
                        <th className="p-2">後設推論 (Meta-Inference)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      <tr>
                        <td className="p-2 font-semibold">台積電 (2330) 2026-09 賣壓日</td>
                        <td className="p-2">Order Imbalance 賣方主導，但價格跌幅僅 -0.2%</td>
                        <td className="p-2">法人盤中掛出大量限價買單護盤，法說會重申 2 奈米強勁</td>
                        <td className="p-2">買方限價流動性吸收賣壓</td>
                        <td className="p-2 text-indigo-900 font-bold">賣壓若遇強大機構限價吸收，價格發現權重由買方主導，不產生預期負衝擊。</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 4. Methodology Chapter Template */}
              <div className="p-5 rounded-2xl bg-slate-900 text-slate-100 shadow-xl space-y-3 font-mono text-xs">
                <div className="text-amber-300 font-bold text-sm">【方法章節寫作模板】第三章 研究方法</div>
                <div className="text-slate-300 space-y-1 pl-2">
                  <div>3.1 方法論立場：實用主義與溯因邏輯</div>
                  <div>3.2 混合方法設計之選擇（解釋性依序設計 QUAN → qual；Raman et al., 2022）</div>
                  <div>3.3 第一階段量化研究：FinMind 高頻資料與異常偵測</div>
                  <div>3.4 連接點 (Connecting)：質性抽樣架構與異常個案選取準則</div>
                  <div>3.5 第二階段質性研究：MOPS 重訊與法說會逐字稿主題分析</div>
                  <div>3.6 整合策略：聯合展示與後設推論 (Meta-Inference)</div>
                  <div>3.7 推論品質與 APA JARS-Mixed 檢核</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-white flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">文獻來源:</span>
            <span>Raman et al. (2022) IJIM 64, 102451</span>
          </div>
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg transition-colors"
          >
            關閉視窗
          </button>
        </div>
      </div>

      {/* Global Image Lightbox Modal */}
      <ImageLightboxModal
        isOpen={showLightbox}
        onClose={() => setShowLightbox(false)}
        onAskGemini={(prompt) => {
          setShowLightbox(false);
          setActiveTab('gemini');
          handleAskGemini(prompt);
        }}
      />
    </div>
  );
};
