import { MmrControversy } from './MmrControversy';
import { ReflectionCards } from './ReflectionCards';
import { AfegoMmrJudgement } from './AfegoMmrJudgement';
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

  type CritKey = 'traps' | 'real_value' | 'diagnostic' | 'gemini_critique' | 'phd_report' | 'mmr_verdict';
  const SECTION_ORDER: CritKey[] = ['mmr_verdict', 'traps', 'real_value', 'diagnostic', 'gemini_critique', 'phd_report'];
  // 一頁式：上方標籤只負責捲動到對應段落，並隨捲動自動亮起
  const goSection = (key: CritKey) => {
    setCritiqueTab(key);
    document.getElementById(`crit-${key}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  React.useEffect(() => {
    if (initialTab && initialTab !== 'mmr_verdict') {
      const t = setTimeout(() => document.getElementById(`crit-${initialTab}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 300);
      setCritiqueTab(initialTab);
      return () => clearTimeout(t);
    }
  }, [initialTab]);

  React.useEffect(() => {
    const onScroll = () => {
      let cur: CritKey = 'mmr_verdict';
      let best = -Infinity;
      for (const k of SECTION_ORDER) {
        const top = document.getElementById(`crit-${k}`)?.getBoundingClientRect().top;
        if (top !== undefined && top < 240 && top > best) { best = top; cur = k; }
      }
      setCritiqueTab(cur);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

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
        summary: '真正掌握了混合方法研究 (MMR) 的精髓：將質性敘事與量化面板進行深度交叉印證，不僅能精準捕捉「正面效果遞減」與非線性轉折，更具備強大的實戰決策指導價值！',
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
          modelUsed: data.modelUsed || 'Gemini',
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
      query: '請深入解構 Raman et al. (2022) Table 2 中最震撼的反直覺發現：為何營收成長越高，正面情緒對超額報酬的加分越小（交互項係數 −102.094**）？這如何揭露了市場正面效果遞減的真價值？'
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
              onClick={() => goSection('mmr_verdict')}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-emerald-500/25 hover:bg-emerald-500/35 text-xs backdrop-blur-md text-emerald-200 border border-emerald-400/40 transition-all font-bold shadow-sm cursor-pointer ring-2 ring-emerald-400/20"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>論文判定：⚖️ 是否屬於 MMR 有爭議（點擊查看正反論點）</span>
            </button>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 text-xs backdrop-blur-md text-slate-200 border border-white/10">
              <span className="w-2 h-2 rounded-full bg-indigo-400" />
              <span>思辨：超越表層工具，聚焦因果機制</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 text-xs backdrop-blur-md text-slate-200 border border-white/10">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span>突破：Table 2 正面效果遞減 (-102.094)</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 text-xs backdrop-blur-md text-slate-200 border border-white/10">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>典範：從統計擬合走向高價值元推論</span>
            </div>
          </div>
        </div>
      </div>

      {/* 段落導覽（一頁式，點了捲到該段） */}
      <div className="sticky top-[117px] z-20 flex items-center justify-between border border-slate-200 bg-white/95 backdrop-blur px-4 py-2.5 rounded-2xl shadow-md">
        <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto">
          <button
            onClick={() => goSection('mmr_verdict')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
              critiqueTab === 'mmr_verdict'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-md'
                : 'text-emerald-900 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200'
            }`}
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-300" />
            <span>判定：是否屬於 MMR</span>
            <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
              critiqueTab === 'mmr_verdict' ? 'bg-amber-400 text-slate-950' : 'bg-emerald-600 text-white'
            }`}>
              有爭議
            </span>
          </button>

          <button
            onClick={() => goSection('traps')}
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
            onClick={() => goSection('real_value')}
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
            onClick={() => goSection('diagnostic')}
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
            onClick={() => goSection('gemini_critique')}
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
            onClick={() => goSection('phd_report')}
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
      <div id="crit-mmr_verdict" className="scroll-mt-48" />
      {true && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <MmrControversy />

          {/* MMR Design Classification Section: /MMR類型 */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-2 border-b border-slate-200 pb-4">
              <div>
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800 font-mono">
                  /MMR類型
                </span>
                <h3 className="text-xl font-extrabold text-slate-900 mt-1">
                  🎯 正方觀點：若列為 MMR，最接近哪一種設計？
                </h3>
              </div>
              <span className="text-xs font-bold px-3 py-1 rounded-lg bg-emerald-100 text-emerald-900 border border-emerald-300">
                正方論證，反方不接受此前提
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
                className="group relative rounded-2xl overflow-hidden border border-purple-400/30 bg-slate-950 cursor-pointer shadow-inner flex items-center justify-center"
              >
                <img
                  src="https://cdn.gamma.app/qczcgzm3dplba12/ceace1f12f5f471d90b70107fa6747b5/original/image.png"
                  alt="Quantitative 與 Qualitative 字根對照"
                  className="w-full h-auto object-contain"
                  loading="lazy"
                />
                <div className="absolute inset-0 flex items-end justify-end p-2.5 pointer-events-none opacity-80 group-hover:opacity-100 transition-opacity">
                  <span className="px-3.5 py-1.5 rounded-xl bg-slate-900/90 backdrop-blur-md text-white text-xs font-bold flex items-center gap-2 shadow-lg group-hover:scale-105 transition-transform border border-purple-400/40">
                    <ZoomIn className="w-4 h-4 text-amber-300" />
                    <span>點擊放大檢視「量化與質性」字根對照圖</span>
                  </span>
                </div>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
              針對 Raman et al. (2022) 全文進行深度結構剖析，我們依據「<strong>資料取得 ➔ 分析 ➔ 整合 ➔ 結果</strong>」做分類：若接受本篇為 MMR，它<strong>不是 Sequential（循序式）</strong>，也不是 Embedded（嵌入式），最接近 <strong>Concurrent / Convergent（並行／收斂）設計中的資料轉換變體</strong>。反方則認為本篇沒有獨立的質性分析軌，談不上收斂。
            </p>

            {/* Design Evaluation Table */}
            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="bg-slate-100 text-slate-900 border-b border-slate-200 font-bold">
                    <th className="p-3.5">MMR 設計類型 (Design)</th>
                    <th className="p-3.5 text-center w-28">判定結果</th>
                                        <th className="p-3.5">全文證據與方法學理由</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-sans text-xs">
                  <tr className="hover:bg-slate-50 transition-colors">
                    <td className="p-3.5 font-bold text-slate-900">Sequential Design (循序式)</td>
                    <td className="p-3.5 text-center"><span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 font-bold">❌ 否定</span></td>
                    <td className="p-3.5 text-slate-700">無 QUAN ➔ qual 或 QUAL ➔ quan 的前後研究鏈（儘管文章提及 phases，但第一階段已同時獲取雙軌資料）。</td>
                  </tr>
                  <tr className="hover:bg-indigo-50/50 transition-colors font-bold">
                    <td className="p-3.5 text-indigo-950">Concurrent / Convergent (並行／收斂整合)</td>
                    <td className="p-3.5 text-center"><span className="px-2 py-0.5 rounded bg-emerald-600 text-white font-bold">最接近（正方）</span></td>
                    <td className="p-3.5 text-indigo-950">Quantitative financial data 與 Textual/Qualitative data 同時進入同一分析與交互模型。</td>
                  </tr>
                  <tr className="hover:bg-slate-50 transition-colors">
                    <td className="p-3.5 font-bold text-slate-900">Embedded Design (嵌入式)</td>
                    <td className="p-3.5 text-center"><span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 font-bold">❌ 否定</span></td>
                    <td className="p-3.5 text-slate-700">無任何方法被明確「嵌入」另一主要研究設計中，雙軌地位對等。</td>
                  </tr>
                  <tr className="hover:bg-slate-50 transition-colors">
                    <td className="p-3.5 font-bold text-slate-900">Transformative Design (轉化性)</td>
                    <td className="p-3.5 text-center"><span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 font-bold">❌ 否定</span></td>
                    <td className="p-3.5 text-slate-700">未以批判理論或社會正義作為研究主軸。</td>
                  </tr>
                  <tr className="hover:bg-slate-50 transition-colors">
                    <td className="p-3.5 font-bold text-slate-900">Multiphase Design (多階段)</td>
                    <td className="p-3.5 text-center"><span className="px-2 py-0.5 rounded bg-amber-100 text-amber-900 font-bold">⚠️ 部分特徵</span></td>
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
                  <span>正方的整合證據：Model A vs. Model B（反方：這是變數消融比較，不是詮釋整合）</span>
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
                <span>🎓 正方的引用寫法（反方會質疑「並行處理質性資料」這一句）</span>
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
                整合層次：分析層（詮釋層缺）
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
                  <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-emerald-100 text-emerald-800" title="本平台依正方觀點的主觀評分；反方認為缺少詮釋層整合">正方主觀評分：93 / 100</span>
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
                原文表 7→8：加入文字情緒後，九種分類演算法的準確率全部提升；但連續 SCAR 的迴歸預測（表 5→6）並非全面改善，五個模型中有四個 RMSE 上升。分類結果例如以 <strong>Two-Class Bayes Point Machine</strong> 為例：
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-white rounded-xl border border-emerald-200 text-center">
                  <div className="text-slate-500 font-semibold">Model A (僅財務量化數據)</div>
                  <div className="text-lg font-extrabold text-slate-800 mt-1">70.7% 準確率</div>
                </div>
                <div className="p-3 bg-emerald-600 text-white rounded-xl border border-emerald-500 text-center shadow-md">
                  <div className="text-emerald-100 font-semibold">Model B (財務量化 + WSJ 文字情緒)</div>
                  <div className="text-lg font-extrabold text-amber-300 mt-1">84.0% 準確率 <span className="text-xs font-mono font-bold text-white">(+13.3 個百分點)</span></div>
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
                  <div className="text-amber-300 font-bold mt-0.5">⚖️ 有爭議（依定義而定）</div>
                </div>
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                  <div className="text-slate-400">Design 類型</div>
                  <div className="text-indigo-300 font-bold mt-0.5">正方：收斂設計／資料轉換</div>
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
                  <div className="text-emerald-400 font-bold mt-0.5">93 / 100（正方主觀評分；僅分析層）</div>
                </div>
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                  <div className="text-slate-400">核心應用領域</div>
                  <div className="text-purple-300 font-bold mt-0.5">財務計量 • 異常報酬 • 新聞情緒</div>
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
                        理由：① 頂級出版商 Elsevier 權威來源；② 名校作者群 (Virginia Tech, Pittsburgh, Arkansas)；③ 資料來源明確（S&P 500 + Compustat + Eventus + 約 2,500 篇 WSJ 文章）；④ LM 金融詞典、GEE 與固定／隨機效果模型；⑤ 分類預測加入文字後提升（貝氏點機 70.7% → 84.0%）。注意：表 2 部分星號與括號數字不一致、未說明資料切分方式，引用時宜保留。
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
                  <dl className="divide-y divide-slate-800 font-sans">
                    {([
                      ['期刊', 'International Journal of Information Management', ''],
                      ['ISSN／eISSN', '0268-4012／1873-4707', ''],
                      ['出版社', 'Elsevier', ''],
                      ['Web of Science 核心合輯', '✅ 收錄', 'ok'],
                      ['SSCI', '🟢 是', 'ok'],
                      ['SCIE／A&HCI', '否／否', ''],
                      ['JCR 學門', 'Information Science & Library Science', ''],
                      ['JCR 分區', '🟢 Q1（排名 1/172，請以最新 JCR 核對）', 'ok'],
                      ['JIF', '2025＝31.0；發表當年 2022＝21.0', 'ok'],
                      ['AJG（ABS）2024', '2（請以最新 AJG 核對）', 'warn'],
                      ['FT50', '否', 'no'],
                    ] as Array<[string, string, string]>).map(([k, v, t]) => (
                      <div key={k} className="grid grid-cols-[8.5rem_1fr] gap-3 py-1.5">
                        <dt className="text-slate-400">{k}</dt>
                        <dd className={t === 'ok' ? 'text-emerald-300' : t === 'warn' ? 'text-amber-300' : t === 'no' ? 'text-rose-300' : 'text-slate-200'}>{v}</dd>
                      </div>
                    ))}
                  </dl>
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
                        <span>主題一：SSCI 期刊查核與 8 項檢核總表圖</span>
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
                <span>放大檢視 MMR 文獻篩選判別流程圖</span>
              </button>
            </div>

            {/* Theme 5 Image Independent Card */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800 flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-indigo-600" />
                  <span>MMR 文獻篩選判別流程圖</span>
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
                className="group relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-950 cursor-pointer shadow-inner flex items-center justify-center"
              >
                <img
                  src="https://cdn.gamma.app/qczcgzm3dplba12/ca044b88abba4ab9b7b11c9b1f51c3c3/original/image.png"
                  alt="MMR 文獻篩選判別流程"
                  className="w-full h-auto object-contain"
                  loading="lazy"
                />
                <div className="absolute inset-0 flex items-end justify-end p-2.5 pointer-events-none opacity-80 group-hover:opacity-100 transition-opacity">
                  <span className="px-3.5 py-1.5 rounded-xl bg-slate-900/90 backdrop-blur-md text-white text-xs font-semibold flex items-center gap-1.5 shadow-md group-hover:scale-105 transition-transform">
                    <ZoomIn className="w-3.5 h-3.5 text-amber-300" />
                    <span>點擊放大檢視 MMR 文獻篩選判別流程（五關判定）</span>
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
                    <td className="p-3 text-center"><span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900">⚖️ 有爭議</span></td>
                    <td className="p-3 text-center">
                      <button onClick={() => onAskGemini('請依據 /MMR判定，詳細解析 Raman et al. (2022) 判定為 Mixed Methods Research 的全部證據？')} className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold text-[11px]">解析</button>
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50 transition-colors">
                    <td className="p-3 font-mono font-bold text-slate-500 text-center">02</td>
                    <td className="p-3 font-mono font-bold text-indigo-700 bg-indigo-50/50">/MMR類型</td>
                    <td className="p-3 text-slate-800 font-medium">判斷 Sequential / Concurrent / Embedded / Transformative</td>
                    <td className="p-3 text-slate-600">正方：收斂設計的資料轉換變體；反方：無獨立質性軌，屬準混合</td>
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
                    <td className="p-3 text-slate-600">資料、變數、分析與預測 4 層整合（正方觀點；反方認為缺詮釋層整合）；建構交互項並比較模型預測增量</td>
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
                    <td className="p-3 text-slate-600">未收錄於 Financial Times 50 期刊清單中（FT50 中的資訊系統期刊為 ISR 與 MISQ）</td>
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
                    <td className="p-3 text-slate-600">2013–2016 年 S&P 500 的年度（fiscal year）財務指標，搭配每家公司每年的新聞情緒彙總；字數以總字數標準化並做平均數中心化。原文未說明時間對齊（是否落後一期）</td>
                    <td className="p-3 text-center"><span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800">⚠️ 原文未交代對齊</span></td>
                    <td className="p-3 text-center">
                      <button onClick={() => onAskGemini('請依據 /變數對齊，解析文本情感詞頻轉化為年度面板指標時的時間對齊方式（原文未說明，請指出可能的風險）？')} className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold text-[11px]">解析</button>
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50 transition-colors">
                    <td className="p-3 font-mono font-bold text-slate-500 text-center">17</td>
                    <td className="p-3 font-mono font-bold text-indigo-700 bg-indigo-50/50">/計量架構</td>
                    <td className="p-3 text-slate-800 font-medium">檢核 GEE / 固定隨機效果 / 交互項之模型穩健性與內生性防禦</td>
                    <td className="p-3 text-slate-600">以 GEE 處理自我相關，並報告獨立、AR(1)、可交換三種相關結構（表 2）；原文未說明是否使用穩健（sandwich）標準誤</td>
                    <td className="p-3 text-center"><span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-indigo-100 text-indigo-800">📈 三種結構＋固定／隨機效果</span></td>
                    <td className="p-3 text-center">
                      <button onClick={() => onAskGemini('請依據 /計量架構，解析 GEE 在處理重複測量面板資料時相比 OLS 的統計優越性？')} className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold text-[11px]">解析</button>
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50 transition-colors">
                    <td className="p-3 font-mono font-bold text-slate-500 text-center">18</td>
                    <td className="p-3 font-mono font-bold text-indigo-700 bg-indigo-50/50">/ML預測力</td>
                    <td className="p-3 text-slate-800 font-medium">評估機器學習分類準確率增量 (ΔAccuracy) 與混淆矩陣</td>
                    <td className="p-3 text-slate-600">Model B (加入情緒特徵) 比 Model A (純量化) 分類準確率從 70.7% 顯著躍升至 84.0% (+13.3 個百分點)</td>
                    <td className="p-3 text-center"><span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">🤖 ΔAccuracy +13.3 pp</span></td>
                    <td className="p-3 text-center">
                      <button onClick={() => onAskGemini('請依據 /ML預測力，分析 Two-Class Bayes Point Machine 為何在非平衡樣本中表現最優？')} className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold text-[11px]">解析</button>
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50 transition-colors">
                    <td className="p-3 font-mono font-bold text-slate-500 text-center">19</td>
                    <td className="p-3 font-mono font-bold text-indigo-700 bg-indigo-50/50">/交互作用解讀</td>
                    <td className="p-3 text-slate-800 font-medium">剖析交互項（−102.094）與「預期已反映」的解讀（本報告用語）</td>
                    <td className="p-3 text-slate-600">表 2 交互項 Sales_growth × Positive = −102.094**（p &lt; 0.01）：營收成長越高，正面情緒的效果越小（原文：diminishing effect）定價</td>
                    <td className="p-3 text-center"><span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800">⚡ 反直覺負係數</span></td>
                    <td className="p-3 text-center">
                      <button onClick={() => onAskGemini('請依據 /交互作用解讀，詳細推導 Sales_growth × Positive 負係數的資本市場微觀定價原理？')} className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold text-[11px]">解析</button>
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
                <span>正方的 7 項判準（反方對第 2、5、6 項有異議）</span>
              </h3>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200">
                正方觀點
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
                    <td className="p-3.5 text-slate-700">華爾街日報 (Wall Street Journal) 約 2,500 篇商業新聞文本、LM 專業金融詞典 sentiment。</td>
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
                    <td className="p-3.5 text-slate-700">直接比較「quantitative only」與「quantitative + text」模型：分類準確率全部提升（表 7→8）；連續迴歸則有 4/5 模型 RMSE 上升（表 5→6）。</td>
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
                      <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-amber-400 text-slate-950 shadow-xs">⚖️ 有爭議</span>
                    </td>
                    <td className="p-3.5 font-bold text-emerald-900">正方判定為 Analytics-based MMR；嚴格定義下為量化研究或準混合設計（見上方正反論點）。</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* 為什麼這篇可以判定 MMR？三大深層證據剖析 */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-500" />
              <span>🔬 正方的三大論據（以及反方的回應）</span>
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
                  質性部分不是傳統訪談，而是 <strong>Wall Street Journal 的自然語言非結構化文字</strong>。抓取約 2,500 篇文章進行 sentiment analysis，且在 Methods 明確區分 quantitative measures 與 qualitative data。反方回應：文本隨即被詞典計數成分數，沒有詮釋性分析，因此是「文字資料」而非「質性研究」。
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
                  作者不是把兩種資料各做一次分析各自結束，而是直接建立交互項（如 Sales_growth × Positive），並比較「quantitative only」與「quantitative + text」模型。<strong>正方認為這是整合的證據</strong>。反方回應：這是加入一組變數的模型比較，屬於分析層面的合併，不是質性與量化結果的詮釋整合。
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
                  作者直接把這個三階段架構定位為 mixed-methods。反方提醒：作者自稱不等於符合方法論定義，引用時建議同時註明爭議（見上方的中性寫法）。
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
           (Boosted DT, Decision Forest, NN, BPM, SVM…)
                     │
                     ▼
              Firm Performance
                     │
                     ▼
            Abnormal Returns (SCAR)`}
                </pre>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400">
                💡 <strong>核心機理</strong>：文字情緒指標與財務變數進入同一個計量模型（含交互項），發現營收成長越高、正面情緒的效果越小（原文：diminishing effect）；機器學習則比較加入文字前後的預測表現。
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
                  <div>QUAL / Text：<span className="text-amber-300 font-bold">⚠️ 只有文字資料，無質性分析</span></div>
                  <div>QUAN + QUAL：<span className="text-emerald-400 font-bold">✅ 確立</span></div>
                  <div>Integration：<span className="text-amber-300 font-bold">⚠️ 僅分析層面</span></div>
                  <div>MMR 框架：<span className="text-emerald-400 font-bold">✅ 三階段協同</span></div>
                  <div>作者自稱 MMR：<span className="text-emerald-400 font-bold">✅ Section 5.1</span></div>
                </div>
                <div className="border-t border-slate-800 pt-2 flex items-center justify-between text-xs font-bold">
                  <span>MMR 判定結論：</span>
                  <span className="px-2 py-0.5 rounded bg-amber-400 text-slate-950 font-bold">⚖️ 有爭議</span>
                </div>
                <div className="text-[11px] text-slate-400 pt-1">
                  • 類型：Analytics-based MMR<br />
                  • 結構：QUAN (財務) + Textual/QUAL (WSJ新聞)<br />
                  • 核心方法：Sentiment + Econometrics + Machine Learning
                </div>
              </div>
            </div>
          </div>

          {/* 第三篇：Afego & Alagidede (2021)，與 Raman 同一套判準對齊判定 */}
          <AfegoMmrJudgement />
        </div>
      )}

      {/* Tab 1: The 5 Methodological Reflections for Substantive Value */}
      <div id="crit-traps" className="scroll-mt-48" />
      {true && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs">
            <div className="max-w-3xl">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-600" />
                <span>深入剖析：研究方法如何避免「形式化」，回歸實質因果洞見？</span>
              </h2>
              <p className="text-sm text-slate-600 mt-2">
                在國際頂級學術評審（Peer Review）與量化投資實務中，評審與決策者最看重的是實質的經濟因果與深層洞察。以下彙整 5 個關鍵的方法論思辨要點，點選卡片即可展開進階解說與口試建議回答：
              </p>
            </div>

            <ReflectionCards />
          </div>
        </div>
      )}

      {/* Tab 2: The 4 Real Value Breakthroughs */}
      <div id="crit-real_value" className="scroll-mt-48" />
      {true && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs">
            <div className="max-w-3xl mb-6">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-amber-500" />
                <span>本篇論文（Raman et al., 2022）的「真正價值」究竟在哪裡？</span>
              </h2>
              <p className="text-sm text-slate-600 mt-2">
                以下是本報告對本篇價值的解讀（非原文主張）；重點不在流程圖，而是因為他們發現了以下 <strong>4 個顛覆傳統直覺的深層經濟真相</strong>：
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
                    className="w-full h-full object-contain transition-transform"
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
                    本報告觀點：只跑機器學習、不交代機制，結果很難解釋也難以重現。架構圖中的「實用主義」「三角交叉檢驗」是 MMR 方法論的概念，<strong>原文並未使用</strong>。
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
                      原文同時發現情緒的<strong>直接效應</strong>（表 2：正面 13.665*、負面 −11.119***）與<strong>交互效應</strong>。本報告認為較有新意的是後者：情緒會<strong>調節</strong>營收成長率與市值淨值比對累積異常報酬的影響（原文：sentiments shape the effects of quantitative measures）。用白話說，新聞不只直接影響報酬，也會改變市場怎麼看待同一份基本面數字。
                    </p>
                    <div className="mt-2 p-2.5 bg-white/90 rounded-lg border border-indigo-200 text-xs text-indigo-950 flex flex-wrap items-center gap-2">
                      <span className="font-bold text-indigo-700 font-mono">📐 Creswell (c) 資料轉化模式落實：</span>
                      <span className="text-slate-700">不是將情緒獨立盲目擬合，而是將 QUAL 質性新聞轉化為 quan 數值特徵後，在 GEE 模型中與 QUAN 營收交互回歸。</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 突破 2：正面情緒效果遞減（表 2 −102.094） */}
              <div className="p-6 rounded-2xl bg-gradient-to-r from-amber-50/70 to-rose-50/50 border border-amber-200">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center font-bold text-lg shrink-0 shadow-xs">
                    2
                  </div>
                  <div className="space-y-3 flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h3 className="text-base font-bold text-slate-900">
                        反直覺的交互作用：正面情緒在高營收成長時「效果遞減」（原文：diminishing effect）
                      </h3>
                      <span className="px-2.5 py-1 rounded-md text-xs font-mono font-bold bg-rose-100 text-rose-800 border border-rose-200">
                        表 2：Sales_growth × Positive = −102.094**（p &lt; 0.01）
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                      一般人以為：<strong>「營收高成長 + 正面新聞 = 效果加倍」</strong>。但 GEE 的交互項是<strong>負的（−102.094）</strong>。原文的解讀是：<em>positive sentiments show a diminishing effect at higher values of sales growth</em>——營收成長越高，正面新聞的加分越小。注意：這是「加分變小」，不是「超額報酬變成負的」。
                    </p>
                    <div className="p-4 rounded-xl bg-white/80 border border-amber-200/80 text-xs text-slate-800 space-y-2">
                      <div className="font-semibold text-amber-900 flex items-center gap-1.5">
                        <Zap className="w-4 h-4 text-amber-600" />
                        <span>為什麼營收越好，正面新聞的加分越小？（以下為本報告的解讀，原文未提出此機制）</span>
                      </div>
                      <p className="leading-relaxed">
                        一個可能的解釋是<strong>「預期已反映（priced in）」</strong>：營收已經很好的公司，市場早有高預期，再多的好消息帶來的「意外」就比較少，所以正面新聞的邊際效果變小。這和台股常說的「利多出盡」概念相近。但原文只報告了係數方向，並沒有檢驗這個機制；而且依表 2，營收成長率本身的主效應仍為正（1.225***）。
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
                        表 2：MB_ratio × Negative = −0.052**（括號 0.081）
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                      原文的解讀是：市值淨值比越高，負面情緒的效果越強（the magnitude of the negative sentiments effect becomes strong at higher values of MB_ratio）。本報告的延伸理解：高估值公司的股價較依賴未來預期，壞消息的衝擊可能較大。但要注意兩點：係數只有 −0.052，且若括號內是標準誤，z ≈ −0.64，按一般檢定並不顯著；原文也沒有分「成長股／價值股」做比較。
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
                        本篇「沒有做到」、但 MMR 應該做的：用質性分析解釋異常值（元推論）
                      </h3>
                      <span className="px-2 py-0.5 rounded text-xs font-semibold bg-emerald-200/70 text-emerald-900">
                        解決實戰痛點
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                      原文<strong>沒有</strong>針對極端殘差或異常個案做質性分析，所有結論都來自統計結果。這正是反方認為它「不算完整 MMR」的原因。若要補強，可以挑出模型解釋不了的極端事件（例如財報很好但股價大跌），回頭閱讀新聞做主題編碼，看看是否有高層異動、訴訟、客戶流失等統計變數沒捕捉到的因素——這才是質性與量化互相對話的元推論。
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Interactive Value Diagnostic Tool */}
      <div id="crit-diagnostic" className="scroll-mt-48" />
      {true && (
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
                    <span>捕捉交互作用與正負情緒不對稱 (100%)</span>
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
                    goSection('gemini_critique');
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
      <div id="crit-gemini_critique" className="scroll-mt-48" />
      {true && (
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
      <div id="crit-phd_report" className="scroll-mt-48" />
      {true && (
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
                      <td className="p-2 text-emerald-700 font-bold">✅ Q1（JIF 2025＝31.0；發表當年 2022＝21.0）</td>
                    </tr>
                    <tr>
                      <td className="p-2 font-semibold">Wang et al.</td>
                      <td className="p-2">2023 (JBR)</td>
                      <td className="p-2">Hong Kong Stock Market (Event Study)</td>
                      <td className="p-2">Sequential Integration</td>
                      <td className="p-2 text-emerald-700 font-bold">✅ Q1（IF 請以最新 JCR 核對）</td>
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
                      <td className="p-2">2025 (Journal of International Studies, UUM, 21(2))</td>
                      <td className="p-2">Malaysia FTSE Bursa KLCI / COVID-19 與經濟指標對報酬波動</td>
                      <td className="p-2">Exploratory Sequential（原文自稱；探索式通常為 QUAL ➔ quan）</td>
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
            onClick={() => onAskGemini('請解說 Table 2 的交互項為何顯示正面情緒在高營收成長時效果遞減？')}
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
