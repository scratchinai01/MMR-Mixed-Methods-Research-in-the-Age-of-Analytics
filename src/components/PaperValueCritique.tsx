import React, { useState } from 'react';
import { 
  AlertTriangle, 
  Lightbulb, 
  TrendingDown, 
  TrendingUp, 
  Sparkles, 
  Sliders, 
  ShieldAlert, 
  Compass, 
  Layers, 
  Cpu, 
  CheckCircle2, 
  FileText, 
  HelpCircle, 
  Send, 
  Loader2, 
  RefreshCw,
  Flame,
  ArrowRight,
  Target,
  BarChart2,
  Zap,
  BookOpen,
  Maximize2,
  ZoomIn,
  Copy,
  Image as ImageIcon,
  Workflow,
  Presentation
} from 'lucide-react';
import { ImageLightboxModal } from './ImageLightboxModal.tsx';
import { MarkdownReportViewer } from './MarkdownReportViewer.tsx';
import { saveFollowupToFirestore } from '../services/firebase.ts';

interface PaperValueCritiqueProps {
  onAskGemini: (prompt: string) => void;
  onNavigateToTable?: (tableId: string) => void;
  initialTab?: 'traps' | 'real_value' | 'diagnostic' | 'gemini_critique' | 'phd_report' | 'mmr_verdict';
  onOpenUploadModal?: () => void;
  onNavigateToThesisReport?: () => void;
}

export const PaperValueCritique: React.FC<PaperValueCritiqueProps> = ({
  onAskGemini,
  onNavigateToTable,
  initialTab = 'traps',
  onOpenUploadModal,
  onNavigateToThesisReport
}) => {
  const [showImageLightbox, setShowImageLightbox] = useState<boolean>(false);
  const [selectedLightboxImageId, setSelectedLightboxImageId] = useState<string>('img1');

  const openLightboxWithImage = (imgId: string) => {
    setSelectedLightboxImageId(imgId);
    setShowImageLightbox(true);
  };

  // Value Diagnostic sliders
  const [causality, setCausality] = useState<number>(35);
  const [interaction, setInteraction] = useState<number>(40);
  const [metaInference, setMetaInference] = useState<number>(30);
  const [marketAdaptation, setMarketAdaptation] = useState<number>(35);
  const [alphaValue, setAlphaValue] = useState<number>(45);

  // Active critique tab
  const [critiqueTab, setCritiqueTab] = useState<'traps' | 'real_value' | 'diagnostic' | 'gemini_critique' | 'phd_report' | 'mmr_verdict'>(initialTab);

  React.useEffect(() => {
    if (initialTab) {
      setCritiqueTab(initialTab);
    }
  }, [initialTab]);

  // Gemini consultation states
  const [critiqueQuestion, setCritiqueQuestion] = useState<string>('');
  const [critiqueLoading, setCritiqueLoading] = useState<boolean>(false);
  const [critiqueResponse, setCritiqueResponse] = useState<string | null>(null);

  // Calculate composite score
  const totalScore = Math.round(
    causality * 0.25 + 
    interaction * 0.25 + 
    metaInference * 0.2 + 
    marketAdaptation * 0.15 + 
    alphaValue * 0.15
  );

  const getDiagnosticVerdict = (score: number) => {
    if (score < 45) {
      return {
        level: '表層工具型架構 (Superficial Framework Approach)',
        color: 'text-rose-600 bg-rose-50 border-rose-200',
        badge: '建議方向：深化因果機理',
        summary: '模型涵蓋了基礎統計公式與工具，若能進一步深化底層經濟因果機制與市場預期落差分析，研究論述將更具說服力與實務指導價值。',
        remedy: '聚焦情緒如何作為「調節變數」引導基本面定價，並建立質性敘事與量化面板的深層元推論。'
      };
    } else if (score < 75) {
      return {
        level: '預測導向型架構 (Predictive Modeling Approach)',
        color: 'text-amber-700 bg-amber-50 border-amber-200',
        badge: '發展方向：強化質性因果與解釋力',
        summary: '具備良好的統計預測精度，若能進一步補充深層因果解釋與極端異常值的質性元推論，面對市場結構轉變時將更加穩健。',
        remedy: '借鑒 Raman et al. (2022) 的非對稱調節項（如負面情緒 × MB比率）與異常值質性追蹤，深化因果解釋力。'
      };
    } else {
      return {
        level: '典範級高價值研究 (Exemplar Research & Actionable Alpha)',
        color: 'text-emerald-700 bg-emerald-50 border-emerald-200',
        badge: '卓越：兼具學術厚度與實戰價值',
        summary: '真正掌握了混合方法研究 (MMR) 的精髓：將質性敘事與量化面板進行深度交叉印證，不僅能精準捕捉「預期踏車效應」與非線性轉折，更具備強大的實戰決策指導價值！',
        remedy: '持續透過 FinMind 工具在地化即時特徵與台股微觀結構進行動態滾動校準。'
      };
    }
  };

  const currentVerdict = getDiagnosticVerdict(totalScore);

  const handleAskCritique = async (queryText?: string) => {
    const textToQuery = queryText || critiqueQuestion;
    if (!textToQuery.trim() || critiqueLoading) return;
    setCritiqueLoading(true);
    setCritiqueResponse(null);

    try {
      const resp = await fetch('/api/gemini/critique-value', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: textToQuery,
          diagnosticScores: {
            causality,
            interaction,
            metaInference,
            marketAdaptation,
            alphaValue
          },
          context: '學術方法論深度探討：如何在計量與金融科技研究中超越工具形式主義，深入挖掘真實經濟因果機理、市場預期落差與質量整合元推論的實質價值。'
        })
      });
      const data = await resp.json();
      if (data && data.answer) {
        setCritiqueResponse(data.answer);
        // Persist critique follow-up Q&A to Firebase
        saveFollowupToFirestore({
          sourceModule: 'value_critique',
          topic: textToQuery.slice(0, 100),
          question: textToQuery,
          answer: data.answer,
          modelUsed: data.modelUsed || 'Gemini 2.5 Flash',
        }).catch(err => console.warn('Firebase critique followup save warning:', err));
      } else {
        setCritiqueResponse(data.fallback || '無法取得分析結果，請檢查 API 設定。');
      }
    } catch (err: any) {
      setCritiqueResponse(`診斷失敗：${err.message}`);
    } finally {
      setCritiqueLoading(false);
    }
  };

  const presetCritiqueTopics = [
    {
      title: '如何讓計量與機器學習模型產生具突破性的實質價值？',
      query: '在當前大數據與計量金融研究中，研究者常結合 GEE、XGBoost 與情緒辭典，如何避免僅停留在工具堆疊，真正提煉出具備理論深度與實務突破的實質價值？'
    },
    {
      title: 'Table 2 核心秘密：Sales_growth × Positive 為何是 -102.094？',
      query: '請深入解構 Raman et al. (2022) Table 2 中最震撼的反直覺發現：為何營收超高成長碰到正面情緒，超額報酬反而暴跌（係數 -102.094）？這如何揭露了市場預期踏車效應的真價值？'
    },
    {
      title: '在地化調適：如何將美股文獻模型有效對接台股微觀結構？',
      query: '研究者若調取 FinMind 數據，欲將情緒與財務指標應用於台股實證與回測，應如何考量台股散戶生態、法人籌碼與資訊傳導特性，避免水土不服？'
    },
    {
      title: '如何落實兼具質性深度與量化廣度的高品質元推論（Meta-Inference）？',
      query: '請給出具體步驟：研究者與投資人如何避免把混合方法做成空洞的形式主義，真正提煉出具有高信效度、兼具質性深度與量化廣度的元推論（Meta-Inference）？'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-200">
      {/* Hero Banner: The Core Insight */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-10 border border-slate-800 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-10 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>方法論深度反思 • 萃取研究核心真價值</span>
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-white leading-tight">
            「從形式框架走向實質洞見」—— <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-indigo-200 to-sky-300">
              深入解構計量與混合研究的深層機理：如何超越表層工具，萃取研究的真實核心價值？
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 max-w-4xl leading-relaxed">
            在當代商業、財務與金融科技研究中，研究者最關鍵的突破點在於：<strong>如何避免僅止於複雜演算法或模型工具的形式堆疊，而能深入挖掘「經濟因果機理、非對稱預期落差與質量整合元推論」</strong>。本模組旨在協助研究者與量化實務者進行深度方法論思辨，將研究價值提升至頂級期刊與實戰決策的典範境界。
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => setCritiqueTab('mmr_verdict')}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-emerald-500/25 hover:bg-emerald-500/35 text-xs backdrop-blur-md text-emerald-200 border border-emerald-400/40 transition-all font-bold shadow-sm cursor-pointer ring-2 ring-emerald-400/20"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>論文判定：✅ MMR 標竿文獻 (點擊查看 7 項全文證據與整合流程圖)</span>
            </button>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 text-xs backdrop-blur-md text-slate-200 border border-white/10">
              <span className="w-2 h-2 rounded-full bg-indigo-400" />
              <span>思辨：超越表層工具，聚焦因果機制</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 text-xs backdrop-blur-md text-slate-200 border border-white/10">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span>突破：Table 2 預期踏車效應 (-102.094)</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 text-xs backdrop-blur-md text-slate-200 border border-white/10">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>典範：從統計擬合走向高價值元推論</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Tab Navigation */}
      <div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-2.5 rounded-2xl shadow-xs">
        <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto">
          <button
            onClick={() => setCritiqueTab('mmr_verdict')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
              critiqueTab === 'mmr_verdict'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-md'
                : 'text-emerald-900 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200'
            }`}
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-300" />
            <span>判定：✅ MMR 核心文獻判定</span>
            <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
              critiqueTab === 'mmr_verdict' ? 'bg-amber-400 text-slate-950' : 'bg-emerald-600 text-white'
            }`}>
              96分 YES
            </span>
          </button>

          <button
            onClick={() => setCritiqueTab('traps')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
              critiqueTab === 'traps'
                ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <span>5 大方法論思辨：避免形式化、萃取核心價值</span>
          </button>

          <button
            onClick={() => setCritiqueTab('real_value')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
              critiqueTab === 'real_value'
                ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Lightbulb className="w-4 h-4 text-amber-500" />
            <span>本篇標竿文獻的 4 大實質價值突破</span>
          </button>

          <button
            onClick={() => setCritiqueTab('diagnostic')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
              critiqueTab === 'diagnostic'
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Sliders className="w-4 h-4 text-emerald-600" />
            <span>研究價值與方法論實時診斷器</span>
          </button>

          <button
            onClick={() => setCritiqueTab('gemini_critique')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
              critiqueTab === 'gemini_critique'
                ? 'bg-purple-50 text-purple-700 border border-purple-200 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Sparkles className="w-4 h-4 text-purple-600" />
            <span>AI 學術思辨與方法論深度探討</span>
          </button>

          <button
            onClick={() => setCritiqueTab('phd_report')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
              critiqueTab === 'phd_report'
                ? 'bg-amber-100 text-amber-900 border border-amber-300 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <BookOpen className="w-4 h-4 text-amber-600" />
            <span>🎓 博士班專題研究報告</span>
          </button>
        </div>
      </div>

      {/* Tab: MMR Verdict & Full-Text Evidence */}
      {critiqueTab === 'mmr_verdict' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          {/* Header Banner */}
          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-emerald-950 via-slate-900 to-teal-950 text-white shadow-xl border border-emerald-800/40 space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-400 text-slate-950 flex items-center gap-1.5 shadow-sm">
                <CheckCircle2 className="w-4 h-4 fill-slate-950 text-emerald-400" />
                <span>判定：✅ MMR 核心文獻</span>
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                信心度：96 / 100 (高信心判定)
              </span>
              <span className="text-xs text-emerald-300/80">
                SSCI 頂級期刊 IJIM 64 (2022) 102451 實證檢定
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white leading-tight">
              這篇可以列為 <span className="text-emerald-400">Mixed Methods Research (MMR)</span> 文獻！
            </h2>

            <p className="text-sm sm:text-base text-slate-200 leading-relaxed max-w-4xl">
              而且<strong>不是「只有標題寫 Mixed-methods」</strong>；正文中有相當明確的混合資料、混合方法與整合架構證據。文章標題本身就直接是 <em>“Mixed-methods research in the age of analytics”</em>，而且摘要說明其將商業期刊的文字分析與量化財務指標結合，用來解釋超額報酬 (Abnormal Returns)。
            </p>
          </div>

          {/* MMR Design Classification Section: /MMR類型 */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-2 border-b border-slate-200 pb-4">
              <div>
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800 font-mono">
                  /MMR類型
                </span>
                <h3 className="text-xl font-extrabold text-slate-900 mt-1">
                  🎯 MMR 具體設計類型精準判定：Concurrent / Convergent Integrated Design
                </h3>
              </div>
              <span className="text-xs font-bold px-3 py-1 rounded-lg bg-emerald-100 text-emerald-900 border border-emerald-300">
                信心度 93% • 排除 Sequential
              </span>
            </div>

            {/* Data Transformation Model Special Callout Card with Gamma Image 8 */}
            <div className="p-6 rounded-3xl bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white space-y-4 shadow-xl border border-purple-500/40">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-purple-800/60 pb-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-purple-400 text-slate-950">
                      (c) 資料轉化模式
                    </span>
                    <span className="font-mono text-xs text-purple-200">
                      Data Transformation Model (QUAL into quan)
                    </span>
                  </div>
                  <div className="inline-block px-3 py-1 rounded-lg bg-amber-400 text-slate-950 text-xs font-bold shadow-sm mt-1">
                    ★ Raman et al. (2022) 核心採用模式
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => onAskGemini('請詳細解說「資料轉化模式 (QUAL into quan)」在 Raman et al. (2022) 中如何將 WSJ 2,500 篇新聞文本透過 LM 詞典轉化為量化情感指標？')}
                    className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md transition-colors"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>詢問此模式台股實務</span>
                  </button>
                  <a
                    href="https://cdn.gamma.app/qczcgzm3dplba12/ceace1f12f5f471d90b70107fa6747b5/original/image.png"
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-1 transition-colors"
                  >
                    <span>開啟原圖</span>
                    <Maximize2 className="w-3 h-3" />
                  </a>
                </div>
              </div>

              {/* Formula expression */}
              <div className="p-3.5 rounded-2xl bg-purple-950/80 border border-purple-400/40 font-mono text-xs sm:text-sm text-amber-300 font-bold flex items-center gap-2 shadow-inner">
                <span>符號表達式：</span>
                <span className="text-white">QUAL</span>
                <span className="text-purple-300">➔</span>
                <span className="text-sky-300">轉化成 quan 資料</span>
                <span className="text-purple-300">➔</span>
                <span className="text-emerald-300">與 QUAN 相互關聯</span>
              </div>

              {/* Gamma Image 8 Preview Card */}
              <div 
                onClick={() => openLightboxWithImage('img8')}
                className="group relative rounded-2xl overflow-hidden border border-purple-400/30 bg-slate-950 cursor-pointer shadow-inner max-h-64 flex items-center justify-center"
              >
                <img
                  src="https://cdn.gamma.app/qczcgzm3dplba12/ceace1f12f5f471d90b70107fa6747b5/original/image.png"
                  alt="資料轉化模式 Data Transformation Model"
                  className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-300 opacity-95 group-hover:opacity-100"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-slate-950/40 group-hover:bg-slate-950/10 transition-colors flex items-center justify-center">
                  <span className="px-3.5 py-1.5 rounded-xl bg-slate-900/90 backdrop-blur-md text-white text-xs font-bold flex items-center gap-2 shadow-lg group-hover:scale-105 transition-transform border border-purple-400/40">
                    <ZoomIn className="w-4 h-4 text-amber-300" />
                    <span>點擊放大檢視「資料轉化模式 (QUAL into quan)」高畫質架構圖</span>
                  </span>
                </div>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
              針對 Raman et al. (2022) 全文進行深度結構剖析，我們依據「<strong>資料取得 ➔ 分析 ➔ 整合 ➔ 結果</strong>」進行嚴格判定：本研究<strong>不是 Sequential（循序式）</strong>，也不是 Embedded（嵌入式），而是典型的 <strong>Concurrent / Convergent Integrated Design（並行／收斂整合型設計）</strong>！
            </p>

            {/* Design Evaluation Table */}
            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="bg-slate-100 text-slate-900 border-b border-slate-200 font-bold">
                    <th className="p-3.5">MMR 設計類型 (Design)</th>
                    <th className="p-3.5 text-center w-28">判定結果</th>
                    <th className="p-3.5 text-center w-20">信心度</th>
                    <th className="p-3.5">全文證據與方法學理由</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-sans text-xs">
                  <tr className="hover:bg-slate-50 transition-colors">
                    <td className="p-3.5 font-bold text-slate-900">Sequential Design (循序式)</td>
                    <td className="p-3.5 text-center"><span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 font-bold">❌ 否定</span></td>
                    <td className="p-3.5 text-center font-mono font-semibold text-slate-700">95%</td>
                    <td className="p-3.5 text-slate-700">無 QUAN ➔ qual 或 QUAL ➔ quan 的前後研究鏈（儘管文章提及 phases，但第一階段已同時獲取雙軌資料）。</td>
                  </tr>
                  <tr className="hover:bg-indigo-50/50 transition-colors font-bold">
                    <td className="p-3.5 text-indigo-950">Concurrent / Convergent (並行／收斂整合)</td>
                    <td className="p-3.5 text-center"><span className="px-2 py-0.5 rounded bg-emerald-600 text-white font-bold">🟢 YES</span></td>
                    <td className="p-3.5 text-center font-mono font-bold text-emerald-700">93%</td>
                    <td className="p-3.5 text-indigo-950">Quantitative financial data 與 Textual/Qualitative data 同時進入同一分析與交互模型。</td>
                  </tr>
                  <tr className="hover:bg-slate-50 transition-colors">
                    <td className="p-3.5 font-bold text-slate-900">Embedded Design (嵌入式)</td>
                    <td className="p-3.5 text-center"><span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 font-bold">❌ 否定</span></td>
                    <td className="p-3.5 text-center font-mono font-semibold text-slate-700">94%</td>
                    <td className="p-3.5 text-slate-700">無任何方法被明確「嵌入」另一主要研究設計中，雙軌地位對等。</td>
                  </tr>
                  <tr className="hover:bg-slate-50 transition-colors">
                    <td className="p-3.5 font-bold text-slate-900">Transformative Design (轉化性)</td>
                    <td className="p-3.5 text-center"><span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 font-bold">❌ 否定</span></td>
                    <td className="p-3.5 text-center font-mono font-semibold text-slate-700">97%</td>
                    <td className="p-3.5 text-slate-700">未以批判理論或社會正義作為研究主軸。</td>
                  </tr>
                  <tr className="hover:bg-slate-50 transition-colors">
                    <td className="p-3.5 font-bold text-slate-900">Multiphase Design (多階段)</td>
                    <td className="p-3.5 text-center"><span className="px-2 py-0.5 rounded bg-amber-100 text-amber-900 font-bold">⚠️ 部分特徵</span></td>
                    <td className="p-3.5 text-center font-mono font-semibold text-slate-700">75%</td>
                    <td className="p-3.5 text-slate-700">具備 Identify ➔ Explain ➔ Predict 三階段架構，但屬於巨集觀分析 framework 而非典型 Multiphase MMR。</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Why not sequential & integration proof */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
              <div className="p-5 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-2.5">
                <div className="font-bold text-amber-950 flex items-center gap-2 text-sm">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>為什麼不是 Sequential？（破解「phases」迷思）</span>
                </div>
                <p className="text-xs text-amber-900 leading-relaxed">
                  文章雖提及 <em>"sequence of phases" (Identify ➔ Explain ➔ Predict)</em>，但<strong>「有 phases」≠「Sequential Design」</strong>！因為在第一階段（Identify），作者已同時進行 <strong>“Quantitative and qualitative data acquisition”</strong>（同時處理量化財務與質性新聞文本）。這證實了其為並行並非前後循序。
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-2.5">
                <div className="font-bold text-emerald-950 flex items-center gap-2 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>最強的 Integration 證據：Model A vs. Model B</span>
                </div>
                <p className="text-xs text-emerald-900 leading-relaxed">
                  作者明確比較了 <strong>Model A (Quantitative only ➔ ML ➔ SCAR)</strong> 與 <strong>Model B (Quantitative + Textual ➔ ML ➔ SCAR)</strong>。加入文字情緒後，預測準確率顯著提升（例如 Two-Class Bayes Point Machine 從 70.7% 躍升至 84.0%），證明 Textual info 實質改變並補充了計量模型！
                </p>
              </div>
            </div>

            {/* Doctor Dissertation Citation Advice */}
            <div className="p-5 rounded-2xl bg-slate-900 text-slate-100 space-y-3 font-sans">
              <div className="text-amber-300 font-bold text-sm flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-amber-400" />
                <span>🎓 博士論文引用時之標準建議寫法</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed italic bg-slate-950 p-4 rounded-xl border border-slate-800">
                "Raman et al. (2022) 採用一種以 analytics 為基礎的整合型混合方法架構（Concurrent / Convergent Integrated Design），並行處理量化財務資料與企業新聞文字資料，透過 sentiment analysis、計量經濟模型與 machine learning 進行整合分析，以檢驗文字情緒與財務指標對累積異常報酬（SCAR）的直接及交互作用。"
              </p>
              <div className="text-[11px] text-slate-400">
                ⭐ 作者自述：文章在理論意涵中指出其具有 <em>"synergistic framework of data and methods"</em> 且可用於 <em>"leveraging mixed-methods"</em>。
              </div>
            </div>
          </div>


          {/* Section: /QUANQUAL比例 ＋ /MMR整合度 */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-2 border-b border-slate-200 pb-4">
              <div>
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-800 font-mono">
                  /QUANQUAL比例 ＋ /MMR整合度
                </span>
                <h3 className="text-xl font-extrabold text-slate-900 mt-1">
                  ⚖️ QUAN/QUAL 主導性比重與 4 層 Integration 整合深度剖析
                </h3>
              </div>
              <span className="text-xs font-bold px-3 py-1 rounded-lg bg-emerald-100 text-emerald-900 border border-emerald-300">
                Integration Score: 93 / 100 (Strong)
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
              針對 Raman et al. (2022) 全文，我們必須將「資料來源層級」與「分析方法主導性」分開判定。這篇的 QUAL 是<strong>文字資料 (Textual Data)</strong>，經由 sentiment analysis 轉化為量化指標，因此不能簡單視為傳統訪談。
            </p>

            {/* 1. /QUANQUAL比例 Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-sm">研究主導性：QUAN Dominant</span>
                  <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-blue-100 text-blue-800">QUAN 80% ～ 85%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden flex">
                  <div className="bg-indigo-600 h-full" style={{ width: '82%' }} title="QUAN 82%" />
                  <div className="bg-amber-500 h-full" style={{ width: '18%' }} title="QUAL/Text 18%" />
                </div>
                <ul className="list-disc pl-4 space-y-1 text-xs text-slate-700">
                  <li><strong>QUAN 分析主導 (80-85%)</strong>：核心結果依賴 GEE、固定/隨機效果、交互項與機器學習預測 SCAR。</li>
                  <li><strong>QUAL/Text 補充 (15-20%)</strong>：WSJ 2,500 篇新聞經 sentiment analysis 轉化為標準化數值，作為調節變數進入計量模型。</li>
                </ul>
              </div>

              <div className="p-5 rounded-2xl bg-indigo-50/50 border border-indigo-100 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-indigo-950 text-sm">4 層 Integration 整合度評估</span>
                  <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-emerald-100 text-emerald-800">Overall: 93 / 100</span>
                </div>
                <div className="space-y-1.5 text-xs text-indigo-950/90">
                  <div className="flex justify-between items-center bg-white p-2 rounded-lg border border-indigo-100">
                    <span>1. 資料來源整合 (Data Source)</span>
                    <span className="font-bold text-emerald-600">90 / 100 ✅</span>
                  </div>
                  <div className="flex justify-between items-center bg-white p-2 rounded-lg border border-indigo-100">
                    <span>2. 變數層級整合 (Variables & Interaction)</span>
                    <span className="font-bold text-emerald-600">95 / 100 ✅</span>
                  </div>
                  <div className="flex justify-between items-center bg-white p-2 rounded-lg border border-indigo-100">
                    <span>3. 分析模型整合 (Econometrics + ML)</span>
                    <span className="font-bold text-emerald-600">95 / 100 ✅</span>
                  </div>
                  <div className="flex justify-between items-center bg-white p-2 rounded-lg border border-indigo-100">
                    <span>4. 結果預測整合 (Model A vs B 改善率)</span>
                    <span className="font-bold text-emerald-600">95 / 100 ✅</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Model A vs Model B Breakthrough Proof */}
            <div className="p-5 rounded-2xl bg-emerald-50/60 border border-emerald-200 space-y-3">
              <h4 className="font-bold text-emerald-950 text-sm flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                <span>Model A (QUAN only) vs. Model B (QUAN + Text) 預測效能對比</span>
              </h4>
              <p className="text-xs text-emerald-900 leading-relaxed">
                文章最後證實：加入文字情緒指標後，整體預測準確率顯著提升、預測誤差大幅下降。例如以 <strong>Two-Class Bayes Point Machine</strong> 為例：
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-white rounded-xl border border-emerald-200 text-center">
                  <div className="text-slate-500 font-semibold">Model A (僅財務量化數據)</div>
                  <div className="text-lg font-extrabold text-slate-800 mt-1">70.7% 準確率</div>
                </div>
                <div className="p-3 bg-emerald-600 text-white rounded-xl border border-emerald-500 text-center shadow-md">
                  <div className="text-emerald-100 font-semibold">Model B (財務量化 + WSJ 文字情緒)</div>
                  <div className="text-lg font-extrabold text-amber-300 mt-1">84.0% 準確率 <span className="text-xs font-mono font-bold text-white">(+13.3%)</span></div>
                </div>
              </div>
            </div>

            {/* Doctoral Thesis Literature Matrix Card */}
            <div className="p-6 rounded-3xl bg-slate-950 text-white space-y-4 shadow-xl border border-slate-800">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-amber-400" />
                  <span className="font-bold text-sm sm:text-base text-amber-300">🎓 博士論文文獻矩陣 (Literature Matrix Card) 建議填寫摘要</span>
                </div>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  Raman et al. (2022) IJIM
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs font-mono">
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                  <div className="text-slate-400">MMR 判定</div>
                  <div className="text-emerald-400 font-bold mt-0.5">✅ YES (核心文獻)</div>
                </div>
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                  <div className="text-slate-400">Design 類型</div>
                  <div className="text-indigo-300 font-bold mt-0.5">Concurrent / Convergent</div>
                </div>
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                  <div className="text-slate-400">QUAN : QUAL 比例</div>
                  <div className="text-amber-300 font-bold mt-0.5">≈ 80 : 20 (QUAN Dominant)</div>
                </div>
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                  <div className="text-slate-400">QUAL 資料型態</div>
                  <div className="text-sky-300 font-bold mt-0.5">Textual / Computational</div>
                </div>
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                  <div className="text-slate-400">Integration 評分</div>
                  <div className="text-emerald-400 font-bold mt-0.5">93 / 100 (Strong)</div>
                </div>
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                  <div className="text-slate-400">核心應用領域</div>
                  <div className="text-purple-300 font-bold mt-0.5">財務計量 • 異常報酬 • 新聞情緒</div>
                </div>
              </div>
            </div>

            {/* Second Gamma Artifact Image */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800 flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-indigo-600" />
                  <span>額外架構與模型對比圖 (Gamma 原圖同步)</span>
                </span>
                <a
                  href="https://cdn.gamma.app/qczcgzm3dplba12/dc0eae2c65c94d7abcfa76f3816afecc/original/image.png"
                  target="_blank"
                  rel="noreferrer"
                  className="text-indigo-600 hover:text-indigo-800 flex items-center gap-1 text-[11px] font-semibold"
                >
                  <span>開啟原圖</span>
                  <Maximize2 className="w-3 h-3" />
                </a>
              </div>

              <div 
                onClick={() => openLightboxWithImage('img2')}
                className="group relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-950 cursor-pointer shadow-inner max-h-56 flex items-center justify-center"
              >
                <img
                  src="https://cdn.gamma.app/qczcgzm3dplba12/dc0eae2c65c94d7abcfa76f3816afecc/original/image.png"
                  alt="Raman et al. (2022) 模型對比與架構圖"
                  className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-300 opacity-90 group-hover:opacity-100"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-slate-950/30 group-hover:bg-slate-950/10 transition-colors flex items-center justify-center">
                  <span className="px-3 py-1.5 rounded-xl bg-slate-900/80 backdrop-blur-md text-white text-xs font-semibold flex items-center gap-1.5 shadow-md group-hover:scale-105 transition-transform">
                    <ZoomIn className="w-3.5 h-3.5" />
                    <span>點擊放大檢視第二張高畫質圖表 (雙軌模型對比)</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Third Gamma Artifact Image: Img 9 (主題九：本篇論文真正價值與四大深層經濟真相) */}
            <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-slate-950 text-white rounded-3xl p-6 sm:p-7 border border-indigo-500/30 shadow-xl space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2 border-b border-indigo-500/20 pb-3">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-400 text-slate-950 font-mono shadow-sm">
                    ★ 主題九精華
                  </span>
                  <h4 className="font-extrabold text-sm sm:text-base text-white">
                    本篇論文 (Raman et al., 2022) 的「真正價值」與四大深層經濟真相
                  </h4>
                </div>
                <button
                  onClick={() => openLightboxWithImage('img9')}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow transition-transform active:scale-95"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                  <span>檢視主題九大圖 (img9)</span>
                </button>
              </div>

              <p className="text-xs text-indigo-200 leading-relaxed">
                情緒不是「主菜」而是放大鏡與扭曲器！深入剖析為何跑機器學習或 FinMind 數據會虧損：因為缺乏實用主義哲學與三角交叉檢驗。揭示 <strong>Sales_growth × Positive = -102.094</strong> 的反直覺真理與 <strong>Priced to Perfection</strong> 假說。
              </p>

              <div 
                onClick={() => openLightboxWithImage('img9')}
                className="group relative rounded-2xl overflow-hidden border border-indigo-500/30 bg-slate-950 cursor-pointer shadow-inner max-h-64 flex items-center justify-center"
              >
                <img
                  src="https://cdn.gamma.app/qczcgzm3dplba12/a258c799d57c43dbb989ede9ff39d03a/original/image.png"
                  alt="主題九：本篇論文真正價值與四大深層經濟真相"
                  className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-300 opacity-95 group-hover:opacity-100"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-indigo-950/40 group-hover:bg-indigo-950/10 transition-colors flex items-center justify-center">
                  <span className="px-3.5 py-2 rounded-xl bg-slate-900/90 backdrop-blur-md text-amber-300 text-xs font-bold flex items-center gap-2 shadow-lg group-hover:scale-105 transition-transform border border-amber-400/30">
                    <ZoomIn className="w-4 h-4 text-amber-400" />
                    <span>點擊放大檢視主題九：真正價值與 4 大深層經濟真相</span>
                  </span>
                </div>
              </div>
            </div>

            {/* ---------------- 8 個查核項目：SSCI 深度學術檢核總表 ---------------- */}
            <div className="bg-slate-950 text-slate-100 rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-2xl space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-5">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500 text-slate-950 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>🟢 SSCI：YES (Q1 頂級期刊)</span>
                    </span>
                    <span className="px-2.5 py-0.5 rounded-md text-[11px] font-mono bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      8 項學術查核全通過
                    </span>
                  </div>
                  <h3 className="text-xl font-black text-white mt-2 flex items-center gap-2">
                    <span>🔍 8 個查核項目：Raman et al. (2022) 論文逐項嚴格核對</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    本篇論文為 Raman、Aljafari、Venkatesh、Richardson 發表於 <em>International Journal of Information Management</em> (Volume 64, 2022, Article 102451)，DOI: 10.1016/j.ijinfomgt.2021.102451。
                  </p>
                </div>

                <button
                  onClick={() => openLightboxWithImage('img4')}
                  className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg transition-transform active:scale-95 shrink-0"
                >
                  <ZoomIn className="w-4 h-4" />
                  <span>放大檢視 SSCI 檢核圖 (第 4 張圖)</span>
                </button>
              </div>

              {/* 8 項查核結果總表 Table */}
              <div className="overflow-x-auto rounded-2xl border border-slate-800">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-900 border-b border-slate-800 text-slate-300 font-bold">
                      <th className="p-3.5 w-32">查核項目</th>
                      <th className="p-3.5">查核結果與具體依據</th>
                      <th className="p-3.5 text-center w-28">學術判定</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80 font-sans">
                    <tr className="hover:bg-slate-900/40">
                      <td className="p-3.5 font-mono font-bold text-emerald-400">09 /WoS查核</td>
                      <td className="p-3.5 text-slate-300">
                        <strong>Web of Science Core Collection → SSCI (Social Sciences Citation Index)</strong>。<br />
                        Clarivate 官方收錄清單確認。ISSN: 0268-4012 / eISSN: 1873-4707。絕非僅收錄於 Scopus。
                      </td>
                      <td className="p-3.5 text-center font-bold text-emerald-400">✅ 確立</td>
                    </tr>
                    <tr className="hover:bg-slate-900/40">
                      <td className="p-3.5 font-mono font-bold text-emerald-400">10 /IF查詢</td>
                      <td className="p-3.5 text-slate-300">
                        最新 2025 JCR 資料年度 Journal Impact Factor (JIF) = <strong>31.0</strong>。<br />
                        <span className="text-[11px] text-slate-400">歷年演變：2021: 18.958 ➔ 2022: 21.0 ➔ 2023: 20.1 ➔ 2024: 27.0 ➔ 2025: 31.0</span>
                      </td>
                      <td className="p-3.5 text-center font-bold text-emerald-400">✅ 極高</td>
                    </tr>
                    <tr className="hover:bg-slate-900/40 bg-amber-500/5">
                      <td className="p-3.5 font-mono font-bold text-amber-400">11 /IF年份</td>
                      <td className="p-3.5 text-slate-300">
                        <strong>2022 年度發表時之 JIF 約為 21.0</strong>。不能直接將最新 2025 年的 31.0 回填描述為發表當年的 IF。<br />
                        <span className="text-amber-300 font-medium">建議博士論文標準寫法：</span>「該文於 2022 年發表時該刊 JIF 約為 21.0；目前最新 2025 JIF 為 31.0。」
                      </td>
                      <td className="p-3.5 text-center font-bold text-amber-400">⚠️ 註明年份</td>
                    </tr>
                    <tr className="hover:bg-slate-900/40">
                      <td className="p-3.5 font-mono font-bold text-emerald-400">12 /JCR分區</td>
                      <td className="p-3.5 text-slate-300">
                        <strong>JCR Q1</strong>，學科類別為 <em>Information Science & Library Science</em>。<br />
                        最新分區排名位於該領域第 1 名（約 1 / 172），居於全球頂尖領先群。
                      </td>
                      <td className="p-3.5 text-center font-bold text-emerald-400">✅ Q1 前端</td>
                    </tr>
                    <tr className="hover:bg-slate-900/40">
                      <td className="p-3.5 font-mono font-bold text-emerald-400">13 /期刊等級</td>
                      <td className="p-3.5 text-slate-300">
                        <strong>SSCI + JCR Q1 + 超高 JIF (31.0) + Scopus CiteScore ≈ 54.4 + ABDC 2025 A</strong>。<br />
                        在圖資與資訊管理體系中為最頂級高影響力期刊。
                      </td>
                      <td className="p-3.5 text-center font-bold text-emerald-400">✅ 頂尖／高影響力</td>
                    </tr>
                    <tr className="hover:bg-slate-900/40 bg-amber-500/5">
                      <td className="p-3.5 font-mono font-bold text-amber-400">14 /ABS判定</td>
                      <td className="p-3.5 text-slate-300">
                        <strong>AJG (ABS) 2024 = 2</strong>（領域：Information Management）。<br />
                        ⚠️ <strong>重要警示：</strong>JCR Q1 ≠ ABS 4*。商管學院若硬性限制 ABS 4/4*，則不可列為頂刊；若看 SSCI Q1 則屬超頂。
                      </td>
                      <td className="p-3.5 text-center font-bold text-amber-400">⚠️ AJG = 2</td>
                    </tr>
                    <tr className="hover:bg-slate-900/40 bg-rose-500/5">
                      <td className="p-3.5 font-mono font-bold text-rose-400">15 /FT50判定</td>
                      <td className="p-3.5 text-slate-300">
                        <strong>非 Financial Times 50 (FT50) 期刊</strong>。<br />
                        FT50 包含 ISR、MISQ 等，未納入 IJIM。若學校硬性要求 FT50 publication 則不符。
                      </td>
                      <td className="p-3.5 text-center font-bold text-rose-400">❌ 不是 FT50</td>
                    </tr>
                    <tr className="hover:bg-slate-900/40 bg-emerald-500/10">
                      <td className="p-3.5 font-mono font-bold text-emerald-300">/論文可信度</td>
                      <td className="p-3.5 text-slate-200">
                        <strong>整體可信度：高 ★★★★★</strong>。<br />
                        理由：① 頂級出版商 Elsevier 權威來源；② 名校作者群 (Virginia Tech, Pittsburgh, Arkansas)；③ 嚴謹混合大數據（S&P 500 + Compustat + Eventus + 2,500 篇 WSJ 全文）；④ LM 金融詞典與 GEE 固定/隨機效應；⑤ ML 預測 Model B (84.0%) 顯著超越 Model A (70.7%)。
                      </td>
                      <td className="p-3.5 text-center font-bold text-emerald-300">✅ 極高 (核心必讀)</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* 博士論文專用標準輸出卡片 (YAML 格式展示) */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* Left: /SSCI判定 標準輸出 */}
                <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-3 font-mono text-xs">
                  <div className="text-amber-300 font-bold text-xs flex items-center justify-between border-b border-slate-800 pb-2">
                    <span>📋 /SSCI判定 標準輸出格式</span>
                    <span className="text-[10px] text-slate-400">Confidence: 99 / 100</span>
                  </div>
                  <pre className="text-slate-300 leading-relaxed overflow-x-auto">
{`╔══════════════════════════════════════════╗
║             /SSCI判定                    ║
╠══════════════════════════════════════════╣
║ 期刊: International Journal of           ║
║       Information Management             ║
║ ISSN: 0268-4012 | eISSN: 1873-4707       ║
║ 出版社: Elsevier                         ║
║                                          ║
║ Web of Science Core Collection: ✅       ║
║ SSCI: 🟢 YES                             ║
║ SCIE: ❌  | A&HCI: ❌                     ║
║                                          ║
║ JCR Category:                            ║
║   Information Science & Library Science  ║
║ JCR Quartile: 🟢 Q1 (Rank: 1/172)        ║
║ 2025 JIF: 31.0 | 2022 JIF: ≈ 21.0        ║
║ AJG (ABS) 2024: 2                        ║
║ FT50: ❌ No                              ║
║ SSCI 判定信心度: 99 / 100                ║
╚══════════════════════════════════════════╝`}
                  </pre>
                </div>

                {/* Right: 博士論文文獻卡 & 論文圖像 */}
                <div className="space-y-4 flex flex-col justify-between">
                  <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-2 text-xs">
                    <div className="font-bold text-emerald-400 flex items-center gap-1.5">
                      <BookOpen className="w-4 h-4" />
                      <span>🎓 博士論文「文獻品質查核表」建議一覽行：</span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-950 font-mono text-emerald-300 border border-slate-800 text-[11px] leading-relaxed">
                      SSCI ✅ ｜ JCR Q1 (1/172) ✅ ｜ 2025 JIF 31.0 (2022 JIF ≈ 21.0) ✅ ｜ AJG 2024 = 2 ⚠️ ｜ FT50 ❌
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      💡 <strong>博士論文整合流程順序：</strong><br />
                      `/MMR判定` ➔ `/MMR類型` ➔ `/QUANQUAL比例` ➔ `/MMR整合度` ➔ <strong className="text-emerald-300">`/SSCI判定`</strong>
                    </p>
                  </div>

                  {/* Gamma Image 4 Preview Card */}
                  <div className="bg-slate-900 p-3.5 rounded-2xl border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-200 flex items-center gap-1.5">
                        <ImageIcon className="w-3.5 h-3.5 text-emerald-400" />
                        <span>主題四：SSCI 期刊查核與 8 項檢核總表圖</span>
                      </span>
                      <a
                        href="https://cdn.gamma.app/qczcgzm3dplba12/31f0cf8a12c34c6eafc11666ce048330/original/image.png"
                        target="_blank"
                        rel="noreferrer"
                        className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1 text-[11px] font-semibold"
                      >
                        <span>開啟原圖</span>
                        <Maximize2 className="w-3 h-3" />
                      </a>
                    </div>
                    <div 
                      onClick={() => openLightboxWithImage('img4')}
                      className="group relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 cursor-pointer shadow-inner w-full aspect-[16/10] sm:aspect-[16/9] flex items-center justify-center mt-2"
                    >
                      <img
                        src="https://cdn.gamma.app/qczcgzm3dplba12/31f0cf8a12c34c6eafc11666ce048330/original/image.png"
                        alt="SSCI 期刊查核與 8 項學術品質檢核總表圖"
                        className="w-full h-full object-contain p-1 group-hover:scale-102 transition-transform duration-300 opacity-95 group-hover:opacity-100"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-slate-950/0 group-hover:bg-slate-950/20 transition-all flex items-end justify-end p-2.5 pointer-events-none">
                        <span className="px-3 py-1.5 rounded-xl bg-slate-900/90 backdrop-blur-md text-white text-xs font-semibold flex items-center gap-1.5 shadow-md group-hover:scale-105 group-hover:bg-emerald-600 transition-all">
                          <ZoomIn className="w-3.5 h-3.5 text-emerald-400 group-hover:text-white" />
                          <span>點擊放大檢視第 4 張高畫質查核圖</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ---------------- 博士論文｜MMR＋SSCI＋IF 20 個 Skills 查核體系與導覽圖 ---------------- */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-md space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-200 pb-5">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-600 text-white flex items-center gap-1 shadow-xs">
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>博士論文標準規格體系</span>
                  </span>
                  <span className="px-2.5 py-0.5 rounded-md text-[11px] font-mono bg-indigo-50 text-indigo-700 border border-indigo-200">
                    20 個 Skills 完整對齊
                  </span>
                </div>
                <h3 className="text-xl font-black text-slate-900 mt-2 flex items-center gap-2">
                  <span>🎓 博士論文｜MMR＋SSCI＋IF 20 個 Skills 核心功能與指引</span>
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  結合 Raman et al. (2022) 全文實證，從「方法判定 ➔ 設計類型 ➔ 權重整合 ➔ 流程傳導 ➔ 期刊指標 (SSCI/JIF/ABS/FT50) ➔ 計量ML與博論寫作」，逐一建立博士班文獻審查標準武器庫。
                </p>
              </div>

              <button
                onClick={() => openLightboxWithImage('img5')}
                className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg transition-transform active:scale-95 shrink-0"
              >
                <ZoomIn className="w-4 h-4" />
                <span>放大檢視第 5 張導覽圖 (20 大 Skills)</span>
              </button>
            </div>

            {/* Theme 5 Image Independent Card */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800 flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-indigo-600" />
                  <span>主題五：博士論文 20 個 Skills 與 MMR 完整檢驗導覽圖 (Gamma 原圖同步)</span>
                </span>
                <a
                  href="https://cdn.gamma.app/qczcgzm3dplba12/ca044b88abba4ab9b7b11c9b1f51c3c3/original/image.png"
                  target="_blank"
                  rel="noreferrer"
                  className="text-indigo-600 hover:text-indigo-800 flex items-center gap-1 text-[11px] font-semibold"
                >
                  <span>開啟原圖 (高畫質)</span>
                  <Maximize2 className="w-3 h-3" />
                </a>
              </div>

              <div 
                onClick={() => openLightboxWithImage('img5')}
                className="group relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-950 cursor-pointer shadow-inner max-h-56 flex items-center justify-center"
              >
                <img
                  src="https://cdn.gamma.app/qczcgzm3dplba12/ca044b88abba4ab9b7b11c9b1f51c3c3/original/image.png"
                  alt="博士論文 20 個 Skills 與 MMR 完整檢驗導覽圖"
                  className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-300 opacity-90 group-hover:opacity-100"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-slate-950/30 group-hover:bg-slate-950/10 transition-colors flex items-center justify-center">
                  <span className="px-3.5 py-1.5 rounded-xl bg-slate-900/90 backdrop-blur-md text-white text-xs font-semibold flex items-center gap-1.5 shadow-md group-hover:scale-105 transition-transform">
                    <ZoomIn className="w-3.5 h-3.5 text-amber-300" />
                    <span>點擊放大檢視第五張高畫質圖表 (MMR + SSCI + IF 20 大 Skills 導覽圖)</span>
                  </span>
                </div>
              </div>
            </div>

            {/* 20 Skills Interactive Table */}
            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100 text-slate-900 border-b border-slate-200 font-bold">
                    <th className="p-3 w-12 text-center">#</th>
                    <th className="p-3 w-32">Skill 代碼</th>
                    <th className="p-3">核心功能與審查定義</th>
                    <th className="p-3">Raman et al. (2022) 論文具體實證</th>
                    <th className="p-3 text-center w-28">判定結果</th>
                    <th className="p-3 text-center w-24">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-sans">
                  <tr className="hover:bg-slate-50 transition-colors">
                    <td className="p-3 font-mono font-bold text-slate-500 text-center">01</td>
                    <td className="p-3 font-mono font-bold text-indigo-700 bg-indigo-50/50">/MMR判定</td>
                    <td className="p-3 text-slate-800 font-medium">判斷文章是否屬於 Mixed Methods Research</td>
                    <td className="p-3 text-slate-600">S&P 500 財務資料 (Compustat) ＋ WSJ 2,500 篇新聞文本 ＋ GEE 與機器學習</td>
                    <td className="p-3 text-center"><span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">✅ MMR YES (96%)</span></td>
                    <td className="p-3 text-center">
                      <button onClick={() => onAskGemini('請依據 /MMR判定，詳細解析 Raman et al. (2022) 判定為 Mixed Methods Research 的全部證據？')} className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold text-[11px]">解析</button>
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50 transition-colors">
                    <td className="p-3 font-mono font-bold text-slate-500 text-center">02</td>
                    <td className="p-3 font-mono font-bold text-indigo-700 bg-indigo-50/50">/MMR類型</td>
                    <td className="p-3 text-slate-800 font-medium">判斷 Sequential / Concurrent / Embedded / Transformative</td>
                    <td className="p-3 text-slate-600">排除 Sequential；確立為 Concurrent / Convergent Integrated Design (資料轉化模式)</td>
                    <td className="p-3 text-center"><span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">🟢 Convergent</span></td>
                    <td className="p-3 text-center">
                      <button onClick={() => onAskGemini('請依據 /MMR類型，說明為何 Raman et al. (2022) 是 Concurrent Integrated Design 而非 Sequential？')} className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold text-[11px]">解析</button>
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50 transition-colors">
                    <td className="p-3 font-mono font-bold text-slate-500 text-center">03</td>
                    <td className="p-3 font-mono font-bold text-indigo-700 bg-indigo-50/50">/QUANQUAL比例</td>
                    <td className="p-3 text-slate-800 font-medium">分析 QUAN : QUAL 比例與研究主導性</td>
                    <td className="p-3 text-slate-600">QUAN ≈ 80%～85% ｜ QUAL/Text ≈ 15%～20%；文字最後轉化為數值進入 GEE 與 ML</td>
                    <td className="p-3 text-center"><span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800">⚖️ QUAN 主導</span></td>
                    <td className="p-3 text-center">
                      <button onClick={() => onAskGemini('請依據 /QUANQUAL比例，解析這篇論文 80:20 權重分配在博論中的方法論意義？')} className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold text-[11px]">解析</button>
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50 transition-colors">
                    <td className="p-3 font-mono font-bold text-slate-500 text-center">04</td>
                    <td className="p-3 font-mono font-bold text-indigo-700 bg-indigo-50/50">/MMR整合度</td>
                    <td className="p-3 text-slate-800 font-medium">判斷量化與質化是否真正 Integration</td>
                    <td className="p-3 text-slate-600">資料、變數、分析與預測 4 層深度整合；建構非線性交互項並比較模型預測增量</td>
                    <td className="p-3 text-center"><span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-purple-100 text-purple-800">🔗 高度整合 (L4)</span></td>
                    <td className="p-3 text-center">
                      <button onClick={() => onAskGemini('請依據 /MMR整合度，詳細說明本篇如何達成 4 個層次的深層 Integration？')} className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold text-[11px]">解析</button>
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50 transition-colors">
                    <td className="p-3 font-mono font-bold text-slate-500 text-center">05</td>
                    <td className="p-3 font-mono font-bold text-indigo-700 bg-indigo-50/50">/MMR流程圖</td>
                    <td className="p-3 text-slate-800 font-medium">自動畫出 QUAN ➔ QUAL ➔ Integration 研究流程與傳導鏈</td>
                    <td className="p-3 text-slate-600">雙軌數據擷取 ➔ Sentiment NLP ➔ GEE 計量回歸 ➔ 機器學習預測 ➔ SCAR 超額報酬</td>
                    <td className="p-3 text-center"><span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-indigo-100 text-indigo-800">📊 雙軌傳導鏈</span></td>
                    <td className="p-3 text-center">
                      <button onClick={() => onAskGemini('請依據 /MMR流程圖，為我的博士論文生成標準雙軌研究傳導鏈的文字圖表？')} className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold text-[11px]">解析</button>
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50 transition-colors">
                    <td className="p-3 font-mono font-bold text-slate-500 text-center">06</td>
                    <td className="p-3 font-mono font-bold text-indigo-700 bg-indigo-50/50">/MMR證據表</td>
                    <td className="p-3 text-slate-800 font-medium">找出文章中的量化、質化與整合證據段落與表列</td>
                    <td className="p-3 text-slate-600">Methods 明確設有「Quantitative and qualitative data acquisition」等 7 大證據段落</td>
                    <td className="p-3 text-center"><span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">📑 7項證據全達標</span></td>
                    <td className="p-3 text-center">
                      <button onClick={() => onAskGemini('請依據 /MMR證據表，逐段列出 Raman et al. (2022) 論文中的 7 大 MMR 證據原文引句？')} className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold text-[11px]">解析</button>
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50 transition-colors">
                    <td className="p-3 font-mono font-bold text-slate-500 text-center">07</td>
                    <td className="p-3 font-mono font-bold text-indigo-700 bg-indigo-50/50">/SSCI判定</td>
                    <td className="p-3 text-slate-800 font-medium">判斷期刊是否收錄於 SSCI (Social Sciences Citation Index)</td>
                    <td className="p-3 text-slate-600">International Journal of Information Management (ISSN: 0268-4012, Elsevier)</td>
                    <td className="p-3 text-center"><span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">🟢 SSCI YES</span></td>
                    <td className="p-3 text-center">
                      <button onClick={() => onAskGemini('請依據 /SSCI判定，說明 IJIM 期刊在 Web of Science 中的收錄狀態與頂尖定位？')} className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold text-[11px]">解析</button>
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50 transition-colors">
                    <td className="p-3 font-mono font-bold text-slate-500 text-center">08</td>
                    <td className="p-3 font-mono font-bold text-indigo-700 bg-indigo-50/50">/WoS查核</td>
                    <td className="p-3 text-slate-800 font-medium">查核 Web of Science Core Collection 官方狀態</td>
                    <td className="p-3 text-slate-600">Clarivate 官方確認收錄於 SSCI Core Collection，非僅 Scopus 或 ESCI</td>
                    <td className="p-3 text-center"><span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">✅ Core Collection</span></td>
                    <td className="p-3 text-center">
                      <button onClick={() => onAskGemini('請依據 /WoS查核，說明 Web of Science Core Collection 與普通 Scopus 的本質差異？')} className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold text-[11px]">解析</button>
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50 transition-colors">
                    <td className="p-3 font-mono font-bold text-slate-500 text-center">09</td>
                    <td className="p-3 font-mono font-bold text-indigo-700 bg-indigo-50/50">/IF查詢</td>
                    <td className="p-3 text-slate-800 font-medium">查詢最新 Journal Impact Factor 數值</td>
                    <td className="p-3 text-slate-600">最新 2025 JCR 資料年度 Journal Impact Factor 高達 31.0</td>
                    <td className="p-3 text-center"><span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">📈 2025 JIF = 31.0</span></td>
                    <td className="p-3 text-center">
                      <button onClick={() => onAskGemini('請依據 /IF查詢，分析 IJIM JIF 從 18.958 飆升至 31.0 的引用動力學？')} className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold text-[11px]">解析</button>
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50 transition-colors">
                    <td className="p-3 font-mono font-bold text-slate-500 text-center">10</td>
                    <td className="p-3 font-mono font-bold text-indigo-700 bg-indigo-50/50">/IF年份</td>
                    <td className="p-3 text-slate-800 font-medium">判斷 IF 對應年度，避免引用錯誤年份</td>
                    <td className="p-3 text-slate-600">2022 年發表時 JIF 約 21.0；不可直接誤用 2025 年的 31.0 代表 2022 年</td>
                    <td className="p-3 text-center"><span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800">⚠️ 標明發表年度</span></td>
                    <td className="p-3 text-center">
                      <button onClick={() => onAskGemini('請依據 /IF年份，提醒博士生在論文中撰寫期刊影響因子時的規範寫法？')} className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold text-[11px]">解析</button>
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50 transition-colors">
                    <td className="p-3 font-mono font-bold text-slate-500 text-center">11</td>
                    <td className="p-3 font-mono font-bold text-indigo-700 bg-indigo-50/50">/JCR分區</td>
                    <td className="p-3 text-slate-800 font-medium">判斷 Q1 / Q2 / Q3 / Q4 及領域排名</td>
                    <td className="p-3 text-slate-600">Information Science & Library Science 學科排名第 1 / 172，位列頂尖 Q1 (Top 1%)</td>
                    <td className="p-3 text-center"><span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">🏆 Q1 (Rank 1/172)</span></td>
                    <td className="p-3 text-center">
                      <button onClick={() => onAskGemini('請依據 /JCR分區，說明 JCR Q1 在國內外大學教職升等與博論畢業標準中的採計權重？')} className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold text-[11px]">解析</button>
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50 transition-colors">
                    <td className="p-3 font-mono font-bold text-slate-500 text-center">12</td>
                    <td className="p-3 font-mono font-bold text-indigo-700 bg-indigo-50/50">/期刊等級</td>
                    <td className="p-3 text-slate-800 font-medium">整理 SSCI、JCR、IF、分區等級之多維度總結</td>
                    <td className="p-3 text-slate-600">SSCI ＋ JCR Q1 (1/172) ＋ JIF 31.0 ＋ 頂尖資訊管理學會關注</td>
                    <td className="p-3 text-center"><span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">⭐ 超高影響力頂刊</span></td>
                    <td className="p-3 text-center">
                      <button onClick={() => onAskGemini('請依據 /期刊等級，輸出 IJIM 在各大學術體系中的權威評級總表？')} className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold text-[11px]">解析</button>
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50 transition-colors">
                    <td className="p-3 font-mono font-bold text-slate-500 text-center">13</td>
                    <td className="p-3 font-mono font-bold text-indigo-700 bg-indigo-50/50">/ABS判定</td>
                    <td className="p-3 text-slate-800 font-medium">查核 ABS / AJG 等級 (警示：JCR Q1 ≠ ABS 4*)</td>
                    <td className="p-3 text-slate-600">Chartered ABS (AJG 2024) 評為 2 級；在英系商學院視為標準期刊，非 4/4*</td>
                    <td className="p-3 text-center"><span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800">⚠️ AJG 2024 = 2</span></td>
                    <td className="p-3 text-center">
                      <button onClick={() => onAskGemini('請依據 /ABS判定，深刻剖析為何高 JIF (31.0) 期刊在商管 AJG 中可能僅評為 2 級？')} className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold text-[11px]">解析</button>
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50 transition-colors">
                    <td className="p-3 font-mono font-bold text-slate-500 text-center">14</td>
                    <td className="p-3 font-mono font-bold text-indigo-700 bg-indigo-50/50">/FT50判定</td>
                    <td className="p-3 text-slate-800 font-medium">判斷是否屬 Financial Times 50 (FT50) 商管頂刊</td>
                    <td className="p-3 text-slate-600">未收錄於 Financial Times 50 期刊清單中（FT50 涵蓋 ISR、MISQ、JMIS 等）</td>
                    <td className="p-3 text-center"><span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800">❌ 不是 FT50</span></td>
                    <td className="p-3 text-center">
                      <button onClick={() => onAskGemini('請依據 /FT50判定，說明 FT50 清單的篩選邏輯與本篇投稿定位？')} className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold text-[11px]">解析</button>
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50 transition-colors">
                    <td className="p-3 font-mono font-bold text-slate-500 text-center">15</td>
                    <td className="p-3 font-mono font-bold text-indigo-700 bg-indigo-50/50">/論文可信度</td>
                    <td className="p-3 text-slate-800 font-medium">評估期刊與論文來源可信度與博士論文引用價值</td>
                    <td className="p-3 text-slate-600">Elsevier 旗艦、名校作者群、大樣本嚴謹計量與 ML 驗證；整體可信度極高</td>
                    <td className="p-3 text-center"><span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">✅ 極高 (核心典範)</span></td>
                    <td className="p-3 text-center">
                      <button onClick={() => onAskGemini('請依據 /論文可信度，撰寫一段可用於博士論文緒論中的文獻權威背書文字？')} className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold text-[11px]">解析</button>
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50 transition-colors">
                    <td className="p-3 font-mono font-bold text-slate-500 text-center">16</td>
                    <td className="p-3 font-mono font-bold text-indigo-700 bg-indigo-50/50">/變數對齊</td>
                    <td className="p-3 text-slate-800 font-medium">檢驗質化情緒特徵與量化財務指標之尺度與時序對齊</td>
                    <td className="p-3 text-slate-600">2013–2016 年 S&P 500 季度財務指標與 WSJ 當期新聞時序匹配，標準化與 Mean-centering</td>
                    <td className="p-3 text-center"><span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800">🔄 時序嚴格對齊</span></td>
                    <td className="p-3 text-center">
                      <button onClick={() => onAskGemini('請依據 /變數對齊，解析文本情感詞頻轉化為季度面板指標時的時間窗設定細節？')} className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold text-[11px]">解析</button>
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50 transition-colors">
                    <td className="p-3 font-mono font-bold text-slate-500 text-center">17</td>
                    <td className="p-3 font-mono font-bold text-indigo-700 bg-indigo-50/50">/計量架構</td>
                    <td className="p-3 text-slate-800 font-medium">檢核 GEE / 固定隨機效果 / 交互項之模型穩健性與內生性防禦</td>
                    <td className="p-3 text-slate-600">GEE 克服個體內序列自相關，指定 AR(1) 相關矩陣並採用 Robust Sandwich 標準誤</td>
                    <td className="p-3 text-center"><span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-indigo-100 text-indigo-800">📈 GEE 嚴謹穩健</span></td>
                    <td className="p-3 text-center">
                      <button onClick={() => onAskGemini('請依據 /計量架構，解析 GEE 在處理重複測量面板資料時相比 OLS 的統計優越性？')} className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold text-[11px]">解析</button>
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50 transition-colors">
                    <td className="p-3 font-mono font-bold text-slate-500 text-center">18</td>
                    <td className="p-3 font-mono font-bold text-indigo-700 bg-indigo-50/50">/ML預測力</td>
                    <td className="p-3 text-slate-800 font-medium">評估機器學習分類準確率增量 (ΔAccuracy) 與混淆矩陣</td>
                    <td className="p-3 text-slate-600">Model B (加入情緒特徵) 比 Model A (純量化) 分類準確率從 70.7% 顯著躍升至 84.0% (+13.3%)</td>
                    <td className="p-3 text-center"><span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">🤖 ΔAccuracy +13.3%</span></td>
                    <td className="p-3 text-center">
                      <button onClick={() => onAskGemini('請依據 /ML預測力，分析 Two-Class Bayes Point Machine 為何在非平衡樣本中表現最優？')} className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold text-[11px]">解析</button>
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50 transition-colors">
                    <td className="p-3 font-mono font-bold text-slate-500 text-center">19</td>
                    <td className="p-3 font-mono font-bold text-indigo-700 bg-indigo-50/50">/預期踏車效應</td>
                    <td className="p-3 text-slate-800 font-medium">剖析非線性交互項（-102.094）與 Priced to Perfection 假說</td>
                    <td className="p-3 text-slate-600">Table 2 實證交互項 Sales_growth × Positive = -102.094 (p &lt; 0.001) 揭示利多出盡反轉定價</td>
                    <td className="p-3 text-center"><span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800">⚡ 反直覺負係數</span></td>
                    <td className="p-3 text-center">
                      <button onClick={() => onAskGemini('請依據 /預期踏車效應，詳細推導 Sales_growth × Positive 負係數的資本市場微觀定價原理？')} className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold text-[11px]">解析</button>
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50 transition-colors">
                    <td className="p-3 font-mono font-bold text-slate-500 text-center">20</td>
                    <td className="p-3 font-mono font-bold text-indigo-700 bg-indigo-50/50">/博論寫作指引</td>
                    <td className="p-3 text-slate-800 font-medium">產出符合國際頂級期刊標準之方法論章節段落建議與答辯策略</td>
                    <td className="p-3 text-slate-600">Creswell 表 4.2 規範排版、實用主義世界觀論述、Meta-Inference 核心貢獻防禦</td>
                    <td className="p-3 text-center"><span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">🎓 頂刊寫作典範</span></td>
                    <td className="p-3 text-center">
                      <button onClick={() => onAskGemini('請依據 /博論寫作指引，生成符合 SSCI 審查標準之博士論文第三章方法論段落草稿？')} className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold text-[11px]">解析</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* MMR 判定表 */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Target className="w-5 h-5 text-emerald-600" />
                <span>MMR 嚴格判定表（依據正文全文證據檢驗）</span>
              </h3>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200">
                7 項核心判準全部達成
              </span>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="bg-slate-100 text-slate-900 border-b border-slate-200 font-bold">
                    <th className="p-3.5">判定項目</th>
                    <th className="p-3.5 text-center w-24">結果</th>
                    <th className="p-3.5">正文具體證據與段落</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-sans">
                  <tr className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3.5 font-bold text-slate-900">使用量化資料 (Quantitative Data)</td>
                    <td className="p-3.5 text-center">
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">✅ 達成</span>
                    </td>
                    <td className="p-3.5 text-slate-700">S&P 500 企業財務資料 (Compustat)、累積超額報酬 (SCAR / Eventus)、PE、Sales Growth、MB Ratio、Size。</td>
                  </tr>
                  <tr className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3.5 font-bold text-slate-900">使用質性／文字資料 (Qualitative/Textual Data)</td>
                    <td className="p-3.5 text-center">
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">✅ 達成</span>
                    </td>
                    <td className="p-3.5 text-slate-700">華爾街日報 (Wall Street Journal) 約 2,500 篇商業新聞全文內容、LM 專業金融詞典 sentiment。</td>
                  </tr>
                  <tr className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3.5 font-bold text-slate-900">同時處理 QUAN + QUAL/Text</td>
                    <td className="p-3.5 text-center">
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">✅ 達成</span>
                    </td>
                    <td className="p-3.5 text-slate-700">文章在 Methods 章節明確設置獨立小節：「Quantitative and qualitative data acquisition」。</td>
                  </tr>
                  <tr className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3.5 font-bold text-slate-900">混合資料進入分析 (Data Merging into Models)</td>
                    <td className="p-3.5 text-center">
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">✅ 達成</span>
                    </td>
                    <td className="p-3.5 text-slate-700">將文字轉化的 Textual metrics 與既有之 quantitative financial measures 同步放入統計矩陣。</td>
                  </tr>
                  <tr className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3.5 font-bold text-slate-900">方法整合 (Methodological Integration)</td>
                    <td className="p-3.5 text-center">
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">✅ 達成</span>
                    </td>
                    <td className="p-3.5 text-slate-700">Sentiment analysis (NLP) + 計量經濟學 (GEE / Panel 回歸) + 機器學習 (ML 演算法預測)。</td>
                  </tr>
                  <tr className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3.5 font-bold text-slate-900">結果整合 (Model Comparison & Joint Evidence)</td>
                    <td className="p-3.5 text-center">
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">✅ 達成</span>
                    </td>
                    <td className="p-3.5 text-slate-700">直接比較「quantitative only」與「quantitative + text」模型，證明加入文字情緒後預測誤差大幅收斂。</td>
                  </tr>
                  <tr className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3.5 font-bold text-slate-900">明確使用 mixed-methods 概念</td>
                    <td className="p-3.5 text-center">
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">✅ 達成</span>
                    </td>
                    <td className="p-3.5 text-slate-700">作者在 Section 5.1 理論意涵中直接稱為「our framework offers guidance with leveraging mixed-methods」。</td>
                  </tr>
                  <tr className="bg-emerald-50/70 border-t-2 border-emerald-300">
                    <td className="p-3.5 font-extrabold text-emerald-950 text-sm">MMR 總體判定</td>
                    <td className="p-3.5 text-center">
                      <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-600 text-white shadow-xs">🟢 YES</span>
                    </td>
                    <td className="p-3.5 font-bold text-emerald-900">高信心判定（96/100）：確立為 Analytics-based MMR 頂刊典範！</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* 為什麼這篇可以判定 MMR？三大深層證據剖析 */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-500" />
              <span>🔬 為什麼這篇可以判定 MMR？三大關鍵證據深度剖析</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Pillar 1: QUAN */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-blue-100 text-blue-800">
                    ① QUAN 軌道
                  </span>
                  <span className="text-xs font-bold text-emerald-600 font-mono">100% 明確</span>
                </div>
                <h4 className="font-bold text-slate-900 text-sm">財務指標與計量面板</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  量化部分包括：S&P 500、財務變數、SCAR、PE Ratio、Sales Growth、MB Ratio、GEE、Fixed Effects / Random Effects 及 Machine Learning。作者使用 Compustat、Eventus 蒐集 2013–2016 年 S&P 500 資料建立嚴謹面板回歸，量化硬核基石 100% 確立！
                </p>
              </div>

              {/* Pillar 2: QUAL/Text */}
              <div className="p-5 rounded-2xl bg-indigo-50/50 border border-indigo-100 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-indigo-100 text-indigo-800">
                    ② QUAL / Text 軌道
                  </span>
                  <span className="text-xs font-bold text-emerald-600 font-mono">100% 明確</span>
                </div>
                <h4 className="font-bold text-slate-900 text-sm">WSJ 自然語言文本與情緒</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  質性部分不是傳統訪談，而是 <strong>Wall Street Journal 的自然語言非結構化文字</strong>。抓取約 2,500 篇文章進行 sentiment analysis，且在 Methods 明確區分 quantitative measures 與 qualitative data。這點對博士論文建立非傳統質性採集至關重要！
                </p>
              </div>

              {/* Pillar 3: Integration */}
              <div className="p-5 rounded-2xl bg-emerald-50/50 border border-emerald-100 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-100 text-emerald-800">
                    ③ 最關鍵：Integration
                  </span>
                  <span className="text-xs font-bold text-emerald-600 font-mono">相融相生 ✅</span>
                </div>
                <h4 className="font-bold text-slate-900 text-sm">雙軌有機整合而非各行其是</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  作者不是把兩種資料各做一次分析各自結束，而是直接建立交互項（如 Sales_growth × Positive），並比較「quantitative only」與「quantitative + text」模型。<strong>文字資料實質改變並大幅改善了財務計量預測</strong>，這是最無可爭議的整合證據！
                </p>
              </div>
            </div>

            {/* ⭐ 更重要的證據：作者自己明確說「mixed-methods」 */}
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <div className="font-bold text-sm">⭐ 更關鍵的證據：作者在論文正文中直接自稱「mixed-methods」</div>
                <p className="text-xs leading-relaxed text-amber-900/90">
                  在第 5.1 節（Theoretical Implications），作者白紙黑字寫道：<br />
                  <code className="px-2 py-0.5 bg-amber-100/80 rounded font-mono font-bold text-amber-950">
                    "our framework offers guidance with leveraging mixed-methods"
                  </code><br />
                  作者直接把這個三階段架構定位為 mixed-methods。因此在您的博士論文或學術文獻分類中，可以<strong>理直氣壯地將其列為「🟢 MMR 核心代表文獻」</strong>，絕非「⚠️ 疑似 MMR」！
                </p>
              </div>
            </div>
          </div>

          {/* 整合傳導鏈圖解與 Gamma 原創架構圖 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: ASCII Flowchart */}
            <div className="bg-slate-950 text-slate-100 rounded-3xl p-6 shadow-xl border border-slate-800 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Workflow className="w-4 h-4 text-emerald-400" />
                    <span>論文雙軌整合傳導鏈 (Integration Chain)</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">Raman et al. (2022)</span>
                </div>
                <pre className="font-mono text-xs leading-relaxed text-slate-300 bg-slate-900/90 p-4 rounded-2xl border border-slate-800 overflow-x-auto">
{`                    MMR
                     │
       ┌─────────────┴─────────────┐
       ▼                           ▼
Quantitative Data              Textual Data
 (財務資料: Compustat)          (WSJ新聞: 2500篇)
       │                           │
       │                       Sentiment
       │                       Analysis
       │                           │
       └─────────────┬─────────────┘
                     ▼
              Econometric Model
                     │
                     ▼
              Interaction Effects
           (Sales_growth × Positive)
                     │
                     ▼
              Machine Learning
           (GBM, RF, NN, SVM, Ridge)
                     │
                     ▼
              Firm Performance
                     │
                     ▼
            Abnormal Returns (SCAR)`}
                </pre>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400">
                💡 <strong>核心機理</strong>：文字情緒指標作為調節變數進入計量回歸，揭露「預期踏車效應」，打破純量化模型的樣本外盲區。
              </div>
            </div>

            {/* Right: Scoreboard & Gamma Artifact */}
            <div className="space-y-4 flex flex-col justify-between">
              {/* Terminal Scorecard */}
              <div className="bg-slate-900 text-white rounded-3xl p-5 shadow-xl border border-emerald-500/30 font-mono text-xs space-y-2">
                <div className="text-center font-bold text-sm text-emerald-400 border-b border-slate-800 pb-2">
                  📊 /MMR 判定 最終評分板
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-slate-300 py-1">
                  <div>QUAN 資料：<span className="text-emerald-400 font-bold">✅ 100%</span></div>
                  <div>QUAL / Text：<span className="text-emerald-400 font-bold">✅ 100%</span></div>
                  <div>QUAN + QUAL：<span className="text-emerald-400 font-bold">✅ 確立</span></div>
                  <div>Integration：<span className="text-emerald-400 font-bold">✅ 實質改善</span></div>
                  <div>MMR 框架：<span className="text-emerald-400 font-bold">✅ 三階段協同</span></div>
                  <div>作者自稱 MMR：<span className="text-emerald-400 font-bold">✅ Section 5.1</span></div>
                </div>
                <div className="border-t border-slate-800 pt-2 flex items-center justify-between text-xs font-bold">
                  <span>MMR 判定結論：</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-500 text-slate-950 font-bold">🟢 YES (96 / 100)</span>
                </div>
                <div className="text-[11px] text-slate-400 pt-1">
                  • 類型：Analytics-based MMR<br />
                  • 結構：QUAN (財務) + Textual/QUAL (WSJ新聞)<br />
                  • 核心方法：Sentiment + Econometrics + Machine Learning
                </div>
              </div>

              {/* Embedded Gamma Architecture Image Card */}
              <div className="bg-white rounded-3xl p-4 border border-slate-200 shadow-xs space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800 flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-indigo-600" />
                    <span>核心架構圖 (Gamma 原圖同步)</span>
                  </span>
                  <a
                    href="https://cdn.gamma.app/qczcgzm3dplba12/9b94218218934b80a2ff622e4055a893/original/image.png"
                    target="_blank"
                    rel="noreferrer"
                    className="text-indigo-600 hover:text-indigo-800 flex items-center gap-1 text-[11px] font-semibold"
                  >
                    <span>開啟原圖</span>
                    <Maximize2 className="w-3 h-3" />
                  </a>
                </div>

                <div 
                  onClick={() => openLightboxWithImage('img3')}
                  className="group relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-950 cursor-pointer shadow-inner max-h-48 flex items-center justify-center"
                >
                  <img
                    src="https://cdn.gamma.app/qczcgzm3dplba12/9b94218218934b80a2ff622e4055a893/original/image.png"
                    alt="Raman et al. (2022) MMR 架構圖"
                    className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-300 opacity-90 group-hover:opacity-100"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-slate-950/30 group-hover:bg-slate-950/10 transition-colors flex items-center justify-center">
                    <span className="px-3 py-1.5 rounded-xl bg-slate-900/80 backdrop-blur-md text-white text-xs font-semibold flex items-center gap-1.5 shadow-md group-hover:scale-105 transition-transform">
                      <ZoomIn className="w-3.5 h-3.5" />
                      <span>點擊放大檢視第三張主題圖表 (三階段協同與預期踏車效應)</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ---------------- 第三篇 TRUE MMR 核心典範：Afego & Alagidede (2021 JCMS) ---------------- */}
          <div className="bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 text-slate-100 rounded-3xl p-6 sm:p-8 border-2 border-emerald-500/50 shadow-2xl space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-indigo-900/60 pb-5">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-400 text-slate-950 flex items-center gap-1 shadow-md">
                    <CheckCircle2 className="w-3.5 h-3.5 fill-slate-950 text-emerald-400" />
                    <span>/MMR文獻篩選 判定：🟢 TRUE MMR：YES</span>
                  </span>
                  <span className="px-2.5 py-0.5 rounded-md text-[11px] font-mono bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                    MMR Integration：91 / 100 — Strong
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-white mt-2 flex items-center gap-2">
                  <span>What Does Corporate Social Advocacy Signal? Evidence from Boycott Participation Decisions</span>
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 mt-1">
                  <strong>Afego & Alagidede (2021)</strong>, <em>Journal of Capital Markets Studies</em>, Vol. 5(1), pp. 49–68. DOI: 10.1108/JCMS-10-2020-0040 (CC BY 4.0 Open Access)
                </p>
              </div>

              <button
                onClick={() => openLightboxWithImage('img7')}
                className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 rounded-xl text-xs font-black flex items-center gap-2 shadow-lg transition-transform active:scale-95 shrink-0"
              >
                <ZoomIn className="w-4 h-4" />
                <span>放大檢視第三篇圖檔 (Gamma 原圖)</span>
              </button>
            </div>

            {/* Core Comparative Card: Logo Dynamism vs Afego */}
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-indigo-500/30 space-y-3 text-xs">
              <div className="flex items-center gap-2 font-bold text-amber-300">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>為什麼這篇和上一份 Logo Dynamism (Wang et al., 2023) 是完全不同的案例？</span>
              </div>
              <p className="text-slate-300 leading-relaxed">
                上一份 <strong>Wang et al. (2023)</strong> 雖然宣稱 Mixed Methods，但拆解後其實全部是量化（Pilot study ➔ Event study ➔ Experiment 1 ➔ Experiment 2），完全沒有真正質性資料，實質為 <strong>Multi-study Quantitative Research</strong>。<br />
                而 <strong>Afego & Alagidede (2021)</strong> 則是<strong>真正的 TRUE MMR</strong>：
                明確同時使用 🟣 <strong>QUAL：Content Analysis (企業公告質性內容分析)</strong> 與 🔵 <strong>QUAN：Event Study (股票市場事件研究)</strong>，兩者緊密咬合、共同回答同一個核心研究問題！
              </p>
            </div>

            {/* 核心判定表格 */}
            <div className="overflow-x-auto rounded-2xl border border-slate-800">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-900 text-slate-200 font-bold border-b border-slate-800">
                    <th className="p-3 w-48">MMR 篩選項目</th>
                    <th className="p-3 w-40 text-center">學術判定</th>
                    <th className="p-3">實證設計與依據說明</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 font-sans">
                  <tr className="hover:bg-slate-900/50">
                    <td className="p-3 font-semibold text-slate-300">QUAN</td>
                    <td className="p-3 text-center"><span className="px-2.5 py-0.5 rounded-full font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">🟢 YES</span></td>
                    <td className="p-3 text-slate-400">Event Study（市場模型估計 Facebook Boycott 公告異常報酬）</td>
                  </tr>
                  <tr className="hover:bg-slate-900/50">
                    <td className="p-3 font-semibold text-slate-300">QUAL</td>
                    <td className="p-3 text-center"><span className="px-2.5 py-0.5 rounded-full font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">🟢 YES</span></td>
                    <td className="p-3 text-slate-400">Content Analysis（歸納式內容分析企業官方聲明與道德立場）</td>
                  </tr>
                  <tr className="hover:bg-slate-900/50">
                    <td className="p-3 font-semibold text-slate-300">QUAL 方法</td>
                    <td className="p-3 text-center font-mono font-bold text-indigo-300">Content Analysis</td>
                    <td className="p-3 text-slate-400">解構執行長發言、道德框架、利他動機與利害關係人正當化敘事</td>
                  </tr>
                  <tr className="hover:bg-slate-900/50">
                    <td className="p-3 font-semibold text-slate-300">QUAN 方法</td>
                    <td className="p-3 text-center font-mono font-bold text-sky-300">Event Study</td>
                    <td className="p-3 text-slate-400">4 日事件窗口下測得 +2.68% 累積異常報酬（CAR, p &lt; 0.001）</td>
                  </tr>
                  <tr className="hover:bg-slate-900/50">
                    <td className="p-3 font-semibold text-slate-300">研究對象</td>
                    <td className="p-3 text-center font-medium text-slate-300">美股 Facebook Boycott</td>
                    <td className="p-3 text-slate-400">美國上市公司參與 #StopHateForProfit 廣告抵制抵制之行動決策</td>
                  </tr>
                  <tr className="hover:bg-slate-900/50">
                    <td className="p-3 font-semibold text-slate-300">是否同一研究問題</td>
                    <td className="p-3 text-center"><span className="px-2.5 py-0.5 rounded-full font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">🟢 YES</span></td>
                    <td className="p-3 text-slate-400">雙軌共同回答：企業社會倡議 (CSA) 究竟向資本市場傳遞何種訊號？</td>
                  </tr>
                  <tr className="hover:bg-slate-900/50">
                    <td className="p-3 font-semibold text-slate-300">QUAN + QUAL 整合</td>
                    <td className="p-3 text-center"><span className="px-2.5 py-0.5 rounded-full font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">🟢 YES (Strong)</span></td>
                    <td className="p-3 text-slate-400">QUAL 剖析「企業為何參與與如何正當化」，QUAN 測量「資本市場如何定價」</td>
                  </tr>
                  <tr className="hover:bg-slate-900/50">
                    <td className="p-3 font-semibold text-slate-300">作者明確稱 Mixed Methods</td>
                    <td className="p-3 text-center"><span className="px-2.5 py-0.5 rounded-full font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">🟢 YES</span></td>
                    <td className="p-3 text-slate-400">摘要與研究設計章節明確宣告採用 mixed-methods design</td>
                  </tr>
                  <tr className="hover:bg-slate-900/50 bg-rose-500/5">
                    <td className="p-3 font-semibold text-rose-300">是否只是 Multi-method?</td>
                    <td className="p-3 text-center"><span className="px-2.5 py-0.5 rounded-full font-bold bg-rose-500/20 text-rose-300 border border-rose-400/30">🔴 NO</span></td>
                    <td className="p-3 text-slate-400">並非單純兩套統計或多實驗拼湊，而是質性與量化互為因果依據</td>
                  </tr>
                  <tr className="bg-emerald-500/10 font-bold border-t border-emerald-500/40">
                    <td className="p-3 text-emerald-300">★ 真正 MMR (TRUE MMR)</td>
                    <td className="p-3 text-center"><span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-500 text-slate-950">🟢 YES</span></td>
                    <td className="p-3 text-emerald-200">高度契合博士論文 MMR Coding 標準，推薦與 Raman et al. (2022) 並列雙典範！</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* 双轨机制传导图与标准输出 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left: ASCII 双轨流程图 */}
              <div className="bg-slate-900/90 rounded-2xl p-5 border border-slate-800 space-y-3 font-mono text-xs">
                <div className="text-emerald-400 font-bold text-xs flex items-center justify-between border-b border-slate-800 pb-2">
                  <span>🔬 双轨机制传导图 (Integration Mechanism)</span>
                  <span className="text-[10px] text-slate-400">Afego & Alagidede (2021)</span>
                </div>
                <pre className="text-slate-300 leading-relaxed overflow-x-auto">
{`                 MMR
                  │
          ┌───────┴───────┐
          ▼               ▼
       QUAL              QUAN
   Content Analysis    Event Study
          │               │
          │               │
   「企業說了什麼？     「市場如何反應？
    為什麼參與？         股價是否改變？」
    如何正當化？」       abnormal return」
          │               │
          └───────┬───────┘
                  ▼
             INTEGRATION
                  │
                  ▼
       Corporate Social Advocacy
          的「訊號效果」
                  │
                  ▼
       組織價值／聲譽／
       利害關係人認知
                  ↓
          Stock Market Value`}
                </pre>
                <div className="text-[11px] text-slate-400 leading-relaxed pt-2 border-t border-slate-800 font-sans">
                  💡 <strong>方法論深意</strong>：這裡不是單純「用了兩種統計方法」。<strong>QUAL 解釋企業行動的內容與意義；QUAN 檢驗市場對該行動的反應。</strong>這是極具說服力的混合方法整合閉環。
                </div>
              </div>

              {/* Right: /MMR文獻篩選 標準輸出 */}
              <div className="bg-slate-900/90 rounded-2xl p-5 border border-slate-800 space-y-3 font-mono text-xs">
                <div className="text-amber-300 font-bold text-xs flex items-center justify-between border-b border-slate-800 pb-2">
                  <span>📋 /MMR文獻篩選 標準輸出</span>
                  <span className="text-[10px] text-emerald-400 font-bold">TRUE MMR</span>
                </div>
                <pre className="text-slate-300 leading-relaxed overflow-x-auto">
{`╔══════════════════════════════════════════════╗
║              /MMR文獻篩選                    ║
╠══════════════════════════════════════════════╣
║                                              ║
║ What Does Corporate Social Advocacy Signal? ║
║ Evidence from Boycott Participation         ║
║ Decisions                                    ║
║                                              ║
║ Afego & Alagidede (2021)                    ║
║ Journal of Capital Markets Studies          ║
║ Vol. 5(1), 49–68                            ║
║ DOI: 10.1108/JCMS-10-2020-0040             ║
╠══════════════════════════════════════════════╣
║ QUAN                                        ║
║ 🟢 YES — Event Study                        ║
║                                              ║
║ QUAL                                        ║
║ 🟢 YES — Content Analysis                   ║
║                                              ║
║ QUAN + QUAL                                 ║
║ 🟢 YES                                      ║
║                                              ║
║ Integration                                 ║
║ 🟢 YES — Strong                             ║
║                                              ║
║ 作者明確宣稱 Mixed Methods                  ║
║ 🟢 YES                                      ║
║                                              ║
║ Multi-method only                           ║
║ 🔴 NO                                       ║
║                                              ║
║ ★ TRUE MMR                                  ║
║ 🟢 YES                                      ║
╚══════════════════════════════════════════════╝`}
                </pre>
              </div>
            </div>

            {/* 第三篇圖檔卡片 (Gamma 原圖獨立卡片) */}
            <div className="bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-800 space-y-3">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                <div>
                  <span className="font-bold text-white flex items-center gap-1.5 text-sm">
                    <ImageIcon className="w-4 h-4 text-emerald-400" />
                    <span>主題七：Afego & Alagidede (2021) TRUE MMR 核心架構圖 (Gamma 原圖同步)</span>
                  </span>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    展示 Content Analysis ➔ Event Study ➔ Abnormal Return (+2.68%) 雙軌整合視覺化流程
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href="https://cdn.gamma.app/qczcgzm3dplba12/0405f12a37e64bb7a5577eb329abb03b/original/image.png"
                    target="_blank"
                    rel="noreferrer"
                    className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30"
                  >
                    <span>開啟原圖 (高畫質)</span>
                    <Maximize2 className="w-3.5 h-3.5" />
                  </a>
                  <button
                    onClick={() => openLightboxWithImage('img7')}
                    className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center gap-1 shadow-xs"
                  >
                    <ZoomIn className="w-3.5 h-3.5" />
                    <span>放大檢視</span>
                  </button>
                </div>
              </div>

              <div 
                onClick={() => openLightboxWithImage('img7')}
                className="group relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 cursor-pointer shadow-inner max-h-72 flex items-center justify-center"
              >
                <img
                  src="https://cdn.gamma.app/qczcgzm3dplba12/0405f12a37e64bb7a5577eb329abb03b/original/image.png"
                  alt="Afego & Alagidede (2021) TRUE MMR 架構圖"
                  className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-300 opacity-90 group-hover:opacity-100"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-slate-950/40 group-hover:bg-slate-950/10 transition-colors flex items-center justify-center">
                  <span className="px-4 py-2 rounded-xl bg-slate-900/90 backdrop-blur-md text-white text-xs font-bold flex items-center gap-2 shadow-lg group-hover:scale-105 transition-transform border border-slate-700">
                    <ZoomIn className="w-4 h-4 text-emerald-400" />
                    <span>點擊放大檢視第三篇高畫質架構圖（Content Analysis ＋ Event Study 整合）</span>
                  </span>
                </div>
              </div>
            </div>

            {/* 博士論文文獻庫收錄建議與評分板 */}
            <div className="p-5 rounded-2xl bg-indigo-950/60 border border-indigo-500/40 space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-indigo-900/60 pb-3">
                <div className="font-bold text-amber-300 text-sm flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-amber-400" />
                  <span>⭐ 特別值得收進博士論文 MMR 文獻庫的核心優勢</span>
                </div>
                <div className="text-xs font-mono font-bold text-emerald-300">
                  MMR Integration 評分：91 / 100 — Strong
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 text-xs">
                <div className="p-3 bg-slate-900/90 rounded-xl border border-indigo-900/40 text-center">
                  <div className="text-slate-400 text-[11px]">QUAN 嚴謹度</div>
                  <div className="text-amber-400 font-black text-sm mt-1">★★★★★</div>
                  <div className="text-slate-300 text-[10px] mt-0.5">Event Study</div>
                </div>
                <div className="p-3 bg-slate-900/90 rounded-xl border border-indigo-900/40 text-center">
                  <div className="text-slate-400 text-[11px]">QUAL 深度</div>
                  <div className="text-amber-400 font-black text-sm mt-1">★★★★★</div>
                  <div className="text-slate-300 text-[10px] mt-0.5">Content Analysis</div>
                </div>
                <div className="p-3 bg-slate-900/90 rounded-xl border border-indigo-900/40 text-center">
                  <div className="text-slate-400 text-[11px]">Integration 整合度</div>
                  <div className="text-amber-400 font-black text-sm mt-1">★★★★☆</div>
                  <div className="text-emerald-400 text-[10px] mt-0.5">雙軌共同回答</div>
                </div>
                <div className="p-3 bg-slate-900/90 rounded-xl border border-indigo-900/40 text-center">
                  <div className="text-slate-400 text-[11px]">股票市場相關性</div>
                  <div className="text-amber-400 font-black text-sm mt-1">★★★★★</div>
                  <div className="text-sky-300 text-[10px] mt-0.5">CAR +2.68%</div>
                </div>
                <div className="p-3 bg-slate-900/90 rounded-xl border border-indigo-900/40 text-center">
                  <div className="text-slate-400 text-[11px]">博論示範價值</div>
                  <div className="text-amber-400 font-black text-sm mt-1">★★★★★</div>
                  <div className="text-emerald-400 text-[10px] mt-0.5">CC BY 4.0 全文開源</div>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                <strong>結論指引：</strong>本研究結果顯示，公開宣布參與抵制活動的公司，在公告後四天平均產生 <strong>+2.68% 的顯著正異常報酬</strong>；質性分析則發現，公司主要透過利他價值、組織價值／信念與「更大的社會利益」來正當化參與。本篇與 Raman et al. (2022) 形成絕佳的互補對照：<strong>一者為文字情緒 × GEE 面板計量，一者為內容分析 × 事件研究</strong>，共同奠定您博士論文「MMR × 股票市場」最堅實的理論與方法論基石！
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 1: The 5 Methodological Reflections for Substantive Value */}
      {critiqueTab === 'traps' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs">
            <div className="max-w-3xl">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-600" />
                <span>深入剖析：研究方法如何避免「形式化」，回歸實質因果洞見？</span>
              </h2>
              <p className="text-sm text-slate-600 mt-2">
                在國際頂級學術評審（Peer Review）與量化投資實務中，評審與決策者最看重的是實質的經濟因果與深層洞察。以下彙整 5 個關鍵的方法論思辨要點：
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-6">
              {/* Trap 1 */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 hover:border-indigo-300 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2.5 py-1 rounded-md text-xs font-mono font-bold bg-indigo-100 text-indigo-800">
                    思辨 01
                  </span>
                  <span className="text-xs text-slate-500 font-medium">實質因果優先</span>
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2">
                  超越工具堆疊，聚焦經濟真理 (Beyond Tool Stacking)
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  研究者即使運用了 GEE、XGBoost 或多元 MMR 設計圖，最關鍵的核心依然是：<strong>「撇開複雜演算法，研究到底揭示了什麼傳統方法看不見的經濟真理與因果機制？」</strong>唯有將焦點放回因果發現，工具才能發揮真正的乘數效應。
                </p>
              </div>

              {/* Trap 2 */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 hover:border-indigo-300 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2.5 py-1 rounded-md text-xs font-mono font-bold bg-indigo-100 text-indigo-800">
                    思辨 02
                  </span>
                  <span className="text-xs text-slate-500 font-medium">兼顧預測與解釋</span>
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2">
                  兼顧預測精度與經濟可解釋性 (Balancing Prediction & Causality)
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  純黑箱機器學習即使測試集 RMSE 表現優異，實務決策仍需理解：<strong>「驅動報酬變化的底層經濟邏輯為何？在何種邊界條件下關係會逆轉？」</strong>結合可解釋的計量模型與因果論述，能大幅提升研究的穩健性。
                </p>
              </div>

              {/* Trap 3 */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 hover:border-indigo-300 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2.5 py-1 rounded-md text-xs font-mono font-bold bg-indigo-100 text-indigo-800">
                    思辨 03
                  </span>
                  <span className="text-xs text-slate-500 font-medium">語境與預期動態</span>
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2">
                  捕捉語境深意與預期反轉 (Context & Expectation Gap)
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  情緒指標不能僅止於詞頻統計，更需辨識市場最具影響力的<strong>「預期差」與「利多出盡」</strong>機制。透過捕捉預期透支與非線性調節，模型才能更準確地反映真實市場動態。
                </p>
              </div>

              {/* Trap 4 */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 hover:border-indigo-300 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2.5 py-1 rounded-md text-xs font-mono font-bold bg-indigo-100 text-indigo-800">
                    思辨 04
                  </span>
                  <span className="text-xs text-slate-500 font-medium">深度質量整合</span>
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2">
                  落實真正質量整合的元推論 (True Meta-Inference Integration)
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  MMR 的核心精髓在於讓質性與量化產生深層對話：<strong>「當量化指標顯示低估值但質性文本出現重大風險訊號時，兩者如何交叉印證？」</strong>藉由元推論整合，方能產生超越單一方法的整體洞察。
                </p>
              </div>

              {/* Trap 5 */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 hover:border-indigo-300 transition-colors md:col-span-2">
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2.5 py-1 rounded-md text-xs font-mono font-bold bg-indigo-100 text-indigo-800">
                    思辨 05
                  </span>
                  <span className="text-xs text-slate-500 font-medium">在地化市場調適</span>
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2">
                  在地化適應與微觀市場結構 (Context-Aware Market Adaptation)
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  將美股文獻模型遷移至台股或其他新興市場時，需深度考量<strong>散戶參與度、三大法人籌碼互動與半導體供應鏈溢出效應</strong>。結合 FinMind 等在地數據工具進行微觀結構調適，才能讓實證結果兼具理論深度與實踐價值。
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: The 4 Real Value Breakthroughs */}
      {critiqueTab === 'real_value' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs">
            <div className="max-w-3xl mb-6">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-amber-500" />
                <span>本篇論文（Raman et al., 2022）的「真正價值」究竟在哪裡？</span>
              </h2>
              <p className="text-sm text-slate-600 mt-2">
                Venkatesh 院士與 Richardson 教授之所以能發表在頂級期刊，絕非因為他們列出了那幾張流程圖，而是因為他們發現了以下 <strong>4 個顛覆傳統直覺的深層經濟真相</strong>：
              </p>
            </div>

            {/* Visual MMR Architecture Card */}
            <div className="mb-6 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white border border-indigo-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
              <div className="flex items-start gap-3.5">
                <div 
                  onClick={() => openLightboxWithImage('img1')}
                  className="w-24 sm:w-28 h-16 sm:h-18 rounded-xl overflow-hidden border border-indigo-400/30 shrink-0 bg-slate-950 relative group cursor-pointer shadow-md"
                  title="點擊放大查看 1536×1024 高清圖"
                >
                  <img
                    src="https://cdn.gamma.app/qczcgzm3dplba12/21329b1e9960461ea76049af3c5883ef/original/image.png"
                    alt="MMR 全景架構圖"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent flex items-center justify-center transition-colors">
                    <ZoomIn className="w-4 h-4 text-white drop-shadow-xs" />
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-white text-sm sm:text-base">
                      混合方法研究 (MMR) 方法論架構全景圖
                    </h3>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-500 text-white">1536×1024</span>
                  </div>
                  <p className="text-xs text-indigo-200/80 mt-1 max-w-xl">
                    為什麼純跑機器學習或純調 FinMind 數據會虧損？因為缺乏此架構圖中的<strong>「實用主義哲學」</strong>與<strong>「三角交叉檢驗」</strong>！
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowImageLightbox(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-xs transition-colors shrink-0"
              >
                <Maximize2 className="w-3.5 h-3.5" />
                <span>放大檢視架構圖</span>
              </button>
            </div>

            <div className="space-y-5">
              {/* Breakthrough 1 */}
              <div className="p-6 rounded-2xl bg-gradient-to-r from-indigo-50/60 to-purple-50/40 border border-indigo-100">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-lg shrink-0 shadow-xs">
                    1
                  </div>
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-bold text-slate-900">
                        情緒不是「主菜」，而是「基本面的放大鏡與扭曲器」（調節變數視角）
                      </h3>
                      <span className="px-2 py-0.5 rounded text-xs font-semibold bg-indigo-200/60 text-indigo-800">
                        核心價值所在
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                      傳統研究把情緒當成單獨的預測因子（Y = β · Sentiment），這在學術與投資界已被證明無效（雜訊太大）。本論文的突破在於：<strong>新聞情緒的作用是「調節（Moderate）」市場對營收成長、本益比與淨值比的定價效率</strong>！新聞不是告訴你股價是多少，而是決定了市場願意給這家公司的基本面打幾折或溢價幾倍。
                    </p>
                    <div className="mt-2 p-2.5 bg-white/90 rounded-lg border border-indigo-200 text-xs text-indigo-950 flex flex-wrap items-center gap-2">
                      <span className="font-bold text-indigo-700 font-mono">📐 Creswell (c) 資料轉化模式落實：</span>
                      <span className="text-slate-700">不是將情緒獨立盲目擬合，而是將 QUAL 質性新聞轉化為 quan 數值特徵後，在 GEE 模型中與 QUAN 營收交互回歸。</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Breakthrough 2: The Expectation Treadmill (Table 2 -102.094) */}
              <div className="p-6 rounded-2xl bg-gradient-to-r from-amber-50/70 to-rose-50/50 border border-amber-200">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center font-bold text-lg shrink-0 shadow-xs">
                    2
                  </div>
                  <div className="space-y-3 flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h3 className="text-base font-bold text-slate-900">
                        驚人的反直覺發現：「預期踏車效應 (Expectation Treadmill)」
                      </h3>
                      <span className="px-2.5 py-1 rounded-md text-xs font-mono font-bold bg-rose-100 text-rose-800 border border-rose-200">
                        Table 2: Sales_growth × Positive = -102.094 (p &lt; 0.001)
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                      一般人以為：<strong>「營收高成長 + 正面新聞樂觀 = 股價大暴漲」</strong>。但論文的實證 GEE 模型卻爆出一個驚人的<strong>負係數 (-102.094)</strong>！
                    </p>
                    <div className="p-4 rounded-xl bg-white/80 border border-amber-200/80 text-xs text-slate-800 space-y-2">
                      <div className="font-semibold text-amber-900 flex items-center gap-1.5">
                        <Zap className="w-4 h-4 text-amber-600" />
                        <span>為什麼營收狂飆 + 新聞大好，超額報酬反而顯著為負？</span>
                      </div>
                      <p className="leading-relaxed">
                        這就是行為財務學上的<strong>「預期被完全透支（Priced to Perfection）」</strong>！當一家公司營收狂增，媒體又日夜歌頌時，市場投資人把預期拉到了天花板。下一季度哪怕公司依舊繳出 25% 的高成長，只要沒有達到瘋狂預期的 35%，或者只要出現任何微小瑕疵，市場就會毫不留情地引發「估值踩踏式崩跌」。這正是台股投資人最常遇到的「利多出盡跌停」現象！
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Breakthrough 3: Asymmetric Penalty */}
              <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-50 to-sky-50/60 border border-slate-200">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-800 text-white flex items-center justify-center font-bold text-lg shrink-0 shadow-xs">
                    3
                  </div>
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h3 className="text-base font-bold text-slate-900">
                        非對稱負面情緒懲罰 (Asymmetric Negative Penalty)
                      </h3>
                      <span className="px-2.5 py-1 rounded-md text-xs font-mono font-bold bg-sky-100 text-sky-800 border border-sky-200">
                        Table 2: MB_ratio × Negative = -6.447 (p &lt; 0.001)
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                      高市值淨值比（MB Ratio 高）的成長股，在面臨負面新聞時，跌幅遠比低估值價值股慘烈得多。因為成長股的估值全部依賴未來敘事；當負面質性文本出現，敘事泡沫被戳破，引發估值懸崖式下修。相反地，傳統價值股（如水電、傳產）即使面臨負面新聞，因有實體資產與淨值支撐，情緒懲罰係數趨近於零。
                    </p>
                  </div>
                </div>
              </div>

              {/* Breakthrough 4: Actionable Meta-Inference */}
              <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-50/60 to-teal-50/40 border border-emerald-200">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-700 text-white flex items-center justify-center font-bold text-lg shrink-0 shadow-xs">
                    4
                  </div>
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-bold text-slate-900">
                        從「黑箱擬合」昇華為「可執行的元推論 (Actionable Meta-Inference)」
                      </h3>
                      <span className="px-2 py-0.5 rounded text-xs font-semibold bg-emerald-200/70 text-emerald-900">
                        解決實戰痛點
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                      這篇論文最珍貴的不是跑出 GEE 數字，而是<strong>「當量化模型失靈（出現極端殘差 Outliers）時，如何借道質性新聞文本還原真相」</strong>。比如公司財報數字極佳但股價重挫，質性分析能瞬間揭示其背後的高層內鬥、海外反壟斷調查或客戶抽單傳聞。這正是純量化工程師最欠缺的「商業情報能力」。
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Interactive Value Diagnostic Tool */}
      {critiqueTab === 'diagnostic' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs">
            <div className="max-w-3xl mb-6">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Sliders className="w-5 h-5 text-emerald-600" />
                <span>研究架構與策略真實價值診斷器 (Value Diagnostic)</span>
              </h2>
              <p className="text-sm text-slate-600 mt-2">
                拉動下方 5 個維度滑桿，評估您眼前的論文、策略或系統架構：究竟是流於「空洞框架堆砌」，還是真正具備「高價值洞察」？
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Sliders Area (7 cols) */}
              <div className="lg:col-span-7 space-y-6">
                {/* 1. Causality */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800 flex items-center gap-1.5">
                      <Target className="w-3.5 h-3.5 text-indigo-600" />
                      <span>1. 因果機理解釋力 (Causal Explanatory Power)</span>
                    </span>
                    <span className="font-mono font-semibold text-indigo-600">{causality}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={causality}
                    onChange={(e) => setCausality(Number(e.target.value))}
                    className="w-full accent-indigo-600 h-2 bg-slate-100 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>純黑箱預測 (0%)</span>
                    <span>能講清楚經濟與行為因果機制 (100%)</span>
                  </div>
                </div>

                {/* 2. Interaction & Non-linearity */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800 flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-amber-600" />
                      <span>2. 交互調節與非線性建模 (Interactions & Asymmetry)</span>
                    </span>
                    <span className="font-mono font-semibold text-amber-600">{interaction}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={interaction}
                    onChange={(e) => setInteraction(Number(e.target.value))}
                    className="w-full accent-amber-600 h-2 bg-slate-100 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>只看單一線性主效應 (0%)</span>
                    <span>捕捉預期踏車與負面情緒非對稱懲罰 (100%)</span>
                  </div>
                </div>

                {/* 3. Meta-Inference */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800 flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-purple-600" />
                      <span>3. 質化量化元推論融合度 (Meta-Inference Synthesis)</span>
                    </span>
                    <span className="font-mono font-semibold text-purple-600">{metaInference}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={metaInference}
                    onChange={(e) => setMetaInference(Number(e.target.value))}
                    className="w-full accent-purple-600 h-2 bg-slate-100 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>質化量化兩層皮各走各路 (0%)</span>
                    <span>用質性敘事解釋量化異常值與黑天鵝 (100%)</span>
                  </div>
                </div>

                {/* 4. Market Adaptation */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800 flex items-center gap-1.5">
                      <Compass className="w-3.5 h-3.5 text-emerald-600" />
                      <span>4. 台股市場微觀結構適配 (Taiwan Market Grounding)</span>
                    </span>
                    <span className="font-mono font-semibold text-emerald-600">{marketAdaptation}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={marketAdaptation}
                    onChange={(e) => setMarketAdaptation(Number(e.target.value))}
                    className="w-full accent-emerald-600 h-2 bg-slate-100 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>盲目照搬美股模型 (0%)</span>
                    <span>結合散戶情緒、法人籌碼與半導體供應鏈 (100%)</span>
                  </div>
                </div>

                {/* 5. Alpha Value */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800 flex items-center gap-1.5">
                      <BarChart2 className="w-3.5 h-3.5 text-sky-600" />
                      <span>5. 實戰決策超額報酬含金量 (Actionable Alpha Substance)</span>
                    </span>
                    <span className="font-mono font-semibold text-sky-600">{alphaValue}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={alphaValue}
                    onChange={(e) => setAlphaValue(Number(e.target.value))}
                    className="w-full accent-sky-600 h-2 bg-slate-100 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>被交易成本與滑價吃光 (0%)</span>
                    <span>提供真金白銀的風險規避與超額 Alpha (100%)</span>
                  </div>
                </div>
              </div>

              {/* Score & Diagnosis Card (5 cols) */}
              <div className="lg:col-span-5 bg-slate-50 rounded-2xl p-6 border border-slate-200 space-y-5">
                <div>
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    綜合價值評分 (True Value Index)
                  </span>
                  <div className="flex items-baseline gap-3 mt-1">
                    <span className="text-5xl font-black font-mono text-slate-900 tracking-tight">
                      {totalScore}
                    </span>
                    <span className="text-sm font-bold text-slate-400">/ 100 分</span>
                  </div>
                </div>

                {/* Diagnosis Level Pill */}
                <div className={`p-4 rounded-xl border text-xs space-y-2 ${currentVerdict.color}`}>
                  <div className="flex items-center justify-between font-bold">
                    <span>{currentVerdict.level}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] bg-white/70 shadow-2xs">
                      {currentVerdict.badge}
                    </span>
                  </div>
                  <p className="leading-relaxed opacity-90">
                    {currentVerdict.summary}
                  </p>
                </div>

                {/* Prescription */}
                <div className="p-4 rounded-xl bg-white border border-slate-200 text-xs space-y-1.5">
                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                    <span>價值提升處方 (Rx Recommendation)：</span>
                  </div>
                  <p className="text-slate-600 leading-relaxed">
                    {currentVerdict.remedy}
                  </p>
                </div>

                <button
                  onClick={() => {
                    setCritiqueTab('gemini_critique');
                    handleAskCritique(`請針對我當前的研究架構診斷評分（總分 ${totalScore} 分：因果 ${causality}%、交互 ${interaction}%、元推論 ${metaInference}%、台股適配 ${marketAdaptation}%、實戰Alpha ${alphaValue}%），進行深度剖析：如何消滅空洞架構，提煉出類似 Raman et al. (2022) 的真價值研究？`);
                  }}
                  className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-sm"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>以當前評分呼叫 AI 進行專家会診</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Gemini Deep Critique Conversation */}
      {critiqueTab === 'gemini_critique' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
            <div className="max-w-3xl">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-600" />
                <span>Gemini AI 學術真價值深度對話</span>
              </h2>
              <p className="text-sm text-slate-600 mt-1">
                以國際頂級期刊資深編輯的視角，直言不諱地剖析「空洞架構如何毀掉一篇論文」，以及如何回歸 Raman et al. (2022) 的經濟學真相與實用價值。
              </p>
            </div>

            {/* Presets */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {presetCritiqueTopics.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setCritiqueQuestion(item.query);
                    handleAskCritique(item.query);
                  }}
                  className="p-3.5 rounded-xl border border-slate-200 hover:border-purple-300 bg-slate-50/70 hover:bg-purple-50/30 text-left transition-all group"
                >
                  <div className="flex items-center justify-between text-xs font-bold text-slate-800 group-hover:text-purple-700">
                    <span>{item.title}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-purple-600 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </button>
              ))}
            </div>

            {/* Custom Input */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleAskCritique();
              }}
              className="space-y-3"
            >
              <div className="relative">
                <textarea
                  rows={3}
                  value={critiqueQuestion}
                  onChange={(e) => setCritiqueQuestion(e.target.value)}
                  placeholder="請輸入您對論文架構、台股回測失真或混合方法空洞化的疑難，讓 AI 進行深度解讀..."
                  className="w-full p-4 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all resize-none"
                />
                <button
                  type="submit"
                  disabled={!critiqueQuestion.trim() || critiqueLoading}
                  className="absolute bottom-3 right-3 px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 disabled:bg-slate-300 text-white font-semibold text-xs flex items-center gap-1.5 transition-all shadow-xs"
                >
                  {critiqueLoading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>專家審查中...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>提交學術審查</span>
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Response Area */}
            {critiqueResponse && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <MarkdownReportViewer
                  content={critiqueResponse}
                  fileName="Gemini_Scholarly_Critique"
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 5: Ph.D. Seminar & Methodology Report */}
      {critiqueTab === 'phd_report' && (
        <div className="space-y-6">
          {/* 🎯 /MMR判定 執行捷徑卡片 */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-950 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl border border-indigo-500/30">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-400 text-slate-950 font-mono">
                  /MMR判定
                </span>
                <span className="text-xs font-bold text-slate-100">
                  Mixed Methods Research in the Age of Analytics: An Exemplar Leveraging Sentiments from News Articles to Predict Firm Performance
                </span>
              </div>
              <p className="text-[11px] text-indigo-200/80">
                點擊右側按鈕，立即啟動 MMR 智慧診斷視窗並使用已勾選的 Skills 執行全景判定！
              </p>
            </div>
            {onOpenUploadModal && (
              <button
                type="button"
                onClick={onOpenUploadModal}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-600 hover:to-rose-700 text-white font-bold text-xs flex items-center gap-2 shadow-lg transition-all shrink-0 active:scale-95 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-amber-200 animate-pulse" />
                <span>執行 /MMR判定 智慧診斷 ➔</span>
              </button>
            )}
          </div>

          <div className="p-6 sm:p-8 rounded-3xl bg-white border-2 border-amber-300 shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
              <div>
                <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-amber-500 text-slate-950">
                  博士班專題研究報告 (Ph.D. Seminar Report)
                </span>
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-2">
                  高頻市場微結構與異常價格反應之混合方法研究：基於臺灣股票市場之實證
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  A Mixed-Methods Approach to High-Frequency Market Microstructure and Anomalous Price Responses in the Taiwan Stock Market
                </p>
              </div>
              <div className="flex items-center gap-2">
                {onNavigateToThesisReport && (
                  <button
                    onClick={onNavigateToThesisReport}
                    className="px-3.5 py-2 bg-gradient-to-r from-amber-500 to-indigo-600 hover:from-amber-600 hover:to-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Presentation className="w-3.5 h-3.5 text-amber-200" />
                    <span>開啟專屬「論文報告與口試簡報」版面 ➔</span>
                  </button>
                )}
                <button
                  onClick={() => {
                    const text = `# 博士班專題研究報告\n## 高頻市場微結構與異常價格反應之混合方法研究\n\n### 1. 文獻矩陣與研究缺口 (Literature Gap)\n根據 2020-2026 SSCI 文獻梳理，明確以 MMR 為核心且直接連接股市的文獻極為稀少（如 Raman et al. 2022 Q1 SSCI; Wang et al. 2023 Q1 SSCI）。本研究填補了「高頻市場微結構 ＋ MMR ＋ 臺灣股市」之研究空白。`;
                    navigator.clipboard.writeText(text);
                    alert('已複製博士班專題研究報告 Markdown 到剪貼簿！');
                  }}
                  className="px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>複製報告 Markdown</span>
                </button>
              </div>
            </div>

            <div className="prose prose-slate max-w-none text-xs sm:text-sm leading-relaxed space-y-5 text-slate-800">
              <h3 className="text-base font-bold text-indigo-900">一、 2020–2026 SSCI 混合方法研究 (MMR) × 股票市場文獻矩陣</h3>
              <p>
                透過系統性交叉檢索 2020 年以後 SSCI 期刊，發現明確將 MMR 納入研究設計並對接股票市場的文獻極為罕見。本研究立足於以下兩大核心標竿文獻：
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-300 text-slate-900">
                      <th className="p-2">核心文獻</th>
                      <th className="p-2">發表年度與期刊</th>
                      <th className="p-2">股票市場與主題</th>
                      <th className="p-2">MMR 類型</th>
                      <th className="p-2">SSCI 資格</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    <tr>
                      <td className="p-2 font-semibold">Raman et al.</td>
                      <td className="p-2">2022 (IJIM)</td>
                      <td className="p-2">S&P 500 / Abnormal Returns</td>
                      <td className="p-2">Data Transformation (QUAN + QUAL ➔ quan)</td>
                      <td className="p-2 text-emerald-700 font-bold">✅ Q1 (IF 27.0)</td>
                    </tr>
                    <tr>
                      <td className="p-2 font-semibold">Wang et al.</td>
                      <td className="p-2">2023 (JBR)</td>
                      <td className="p-2">Hong Kong Stock Market (Event Study)</td>
                      <td className="p-2">Sequential Integration</td>
                      <td className="p-2 text-emerald-700 font-bold">✅ Q1 (IF 9.8)</td>
                    </tr>
                    <tr>
                      <td className="p-2 font-semibold">Afego & Alagidede</td>
                      <td className="p-2">2021 (JCMS)</td>
                      <td className="p-2">US Boycott / Stock Reaction</td>
                      <td className="p-2">Qual Content + Quant Event Study</td>
                      <td className="p-2 text-slate-500">❌ 非 SSCI (具參考價值)</td>
                    </tr>
                    <tr>
                      <td className="p-2 font-semibold">Soon et al.</td>
                      <td className="p-2">2024 (JIS)</td>
                      <td className="p-2">Malaysia KLCI / Pandemic Sentiment</td>
                      <td className="p-2">Exploratory Sequential (QUAN ➔ qual)</td>
                      <td className="p-2 text-amber-700">⚠️ 另行確認</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <h3 className="text-base font-bold text-indigo-900">二、 研究缺口與核心研究問題 (Research Questions)</h3>
              <p>
                現有文獻多聚焦於總體財報或低頻事件研究，忽略了高頻市場微結構 (Market Microstructure) 與質性事件語境的交織。本研究提出以下 4 大核心研究問題 (RQ1 ~ RQ4)：
              </p>
              <div className="p-4 rounded-xl bg-slate-900 text-slate-100 font-sans space-y-2 text-xs">
                <div><strong>RQ1</strong>: 臺灣股票市場中，高頻訂單不平衡 (Order Imbalance) 與報價侵略性 (Price Aggressiveness) 如何影響短天期價格發現 (Price Discovery)？</div>
                <div><strong>RQ2</strong>: 在何種市場微結構條件下，賣壓未能如預期產生顯著的負向價格衝擊 (Price Impact)？</div>
                <div><strong>RQ3</strong>: 質性證據（如新聞事件、法人行為與法說會逐字稿）如何合理解釋市場微結構分析中所發現的量化異常關係？</div>
                <div><strong>RQ4</strong>: 透過量化與質性證據之整合 (Meta-Inference)，如何顯著提升對台股異常價格波動機理的解釋力？</div>
              </div>

              <h3 className="text-base font-bold text-indigo-900">三、 研究設計與實證架構 (Methodological Framework)</h3>
              <p>
                本研究採 <strong>QUAN (70%) ➔ qual (30%) 追蹤解釋式混合方法研究設計 (Explanatory Sequential Design, Follow-up Explanations Model)</strong>：
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>QUAN 階段</strong>：透過 FinMind 高頻金融資料庫提取 Order Imbalance、Price Aggressiveness、Liquidity 與 Price Discovery 指標，執行面板計量與機器學習模型以精準識別異常價格反應。</li>
                <li><strong>qual 階段</strong>：針對量化殘差異常個案，調閱 MOPS 重訊與法說會逐字稿進行主題分析。</li>
                <li><strong>Integration 階段</strong>：進行元推論 (Meta-Inference)，透視賣壓失靈之微結構與機構行為真相。</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Cross Navigation Footnote */}
      <div className="bg-slate-100/80 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-600 border border-slate-200/60">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-indigo-600 shrink-0" />
          <span>
            想直接查看論文原始 GEE 實證回歸表格與係數？前往雙語閱讀器查閱 Table 1-8。
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onAskGemini('請解說 Table 2 實證係數為何會出現預期踏車效應？')}
            className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:border-indigo-300 text-indigo-600 font-medium transition-colors shadow-2xs"
          >
            快速詢問 Table 2 實證機理
          </button>
        </div>
      </div>

      {/* Global Image Lightbox Modal */}
      <ImageLightboxModal
        isOpen={showImageLightbox}
        onClose={() => setShowImageLightbox(false)}
        initialImageId={selectedLightboxImageId}
        onAskGemini={onAskGemini}
      />
    </div>
  );
};
