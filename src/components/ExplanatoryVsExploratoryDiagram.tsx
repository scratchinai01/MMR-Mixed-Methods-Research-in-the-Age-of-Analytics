import React, { useState } from 'react';
import { 
  ArrowRight, 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  Lightbulb, 
  Sparkles, 
  FileText, 
  Layers, 
  Users, 
  BrainCircuit, 
  Blocks, 
  TrendingUp, 
  Compass, 
  Download,
  Share2,
  Check,
  Maximize2,
  Workflow
} from 'lucide-react';

interface ExplanatoryVsExploratoryDiagramProps {
  paperTitle?: string;
  onAskGemini?: (prompt: string) => void;
}

export const ExplanatoryVsExploratoryDiagram: React.FC<ExplanatoryVsExploratoryDiagramProps> = ({
  paperTitle = 'Gupta et al. (2023) IJPE - AI & Blockchain in Supply Chain Financial Resilience',
  onAskGemini
}) => {
  const [highlightPhase, setHighlightPhase] = useState<'all' | 'phase1' | 'phase2'>('all');
  const [activeTab, setActiveTab] = useState<'infographic' | 'table' | 'checklist' | 'phd-thesis'>('infographic');

  return (
    <div className="bg-white rounded-2xl border-2 border-indigo-200 shadow-md overflow-hidden space-y-4">
      {/* Top Banner Header */}
      <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500 text-white font-extrabold text-xs shadow-xs">
            <span>③ 解釋式</span>
            <span className="text-[10px] opacity-80">(Explanatory)</span>
          </div>
          <span className="text-amber-300 font-bold text-xs sm:text-sm">VS</span>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-600 text-white font-extrabold text-xs shadow-xs">
            <span>④ 探索式</span>
            <span className="text-[10px] opacity-80">(Exploratory)</span>
          </div>
          <span className="text-xs text-slate-300 hidden md:inline-block">混合方法研究設計全景對比</span>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center bg-black/30 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setActiveTab('infographic')}
              className={`px-3 py-1 rounded-lg transition-all ${
                activeTab === 'infographic' ? 'bg-white text-indigo-950 font-bold shadow-2xs' : 'text-slate-300 hover:text-white'
              }`}
            >
              視覺流程圖
            </button>
            <button
              onClick={() => setActiveTab('table')}
              className={`px-3 py-1 rounded-lg transition-all ${
                activeTab === 'table' ? 'bg-white text-indigo-950 font-bold shadow-2xs' : 'text-slate-300 hover:text-white'
              }`}
            >
              對照比較表
            </button>
            <button
              onClick={() => setActiveTab('checklist')}
              className={`px-3 py-1 rounded-lg transition-all ${
                activeTab === 'checklist' ? 'bg-white text-indigo-950 font-bold shadow-2xs' : 'text-slate-300 hover:text-white'
              }`}
            >
              4大判定鐵證
            </button>
            <button
              onClick={() => setActiveTab('phd-thesis')}
              className={`px-3 py-1 rounded-lg transition-all ${
                activeTab === 'phd-thesis' ? 'bg-white text-indigo-950 font-bold shadow-2xs' : 'text-slate-300 hover:text-white'
              }`}
            >
              🎓 博士論文標準論述與台股復刻
            </button>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="p-4 sm:p-6 space-y-6">
        {/* VIEW 1: Dual Infographic Cards */}
        {activeTab === 'infographic' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* LEFT CARD: ③ 解釋式混合研究設計 (本研究 Gupta et al., 2023) */}
              <div className="p-5 rounded-2xl border-2 border-rose-300 bg-gradient-to-b from-rose-50/50 via-white to-rose-50/20 shadow-xs space-y-4 relative">
                {/* Title & Badge */}
                <div className="flex items-start justify-between gap-2 border-b border-rose-200/80 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-rose-500 text-white font-bold text-xs flex items-center justify-center">
                        3
                      </span>
                      <h3 className="font-extrabold text-slate-900 text-base">
                        解釋式混合研究設計 (Explanatory)
                      </h3>
                    </div>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded font-mono text-xs font-black bg-rose-100 text-rose-800 border border-rose-300">
                        核心流程：QUAN ➔ qual (先量化，後質性)
                      </span>
                    </div>
                  </div>

                  <span className="px-2.5 py-1 rounded-xl text-[11px] font-black bg-amber-400 text-slate-950 shadow-2xs shrink-0 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>本研究 Gupta et al. (2023)</span>
                  </span>
                </div>

                {/* Flow: Phase 1 (QUAN) ➔ Phase 2 (qual) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 relative">
                  {/* Step 1: 量化研究階段 (QUAN) */}
                  <div className="p-4 rounded-xl border border-rose-200 bg-white shadow-2xs space-y-2.5">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">
                        1
                      </span>
                      <span className="font-bold text-xs text-rose-950">
                        量化研究階段 (QUAN)
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 font-medium">
                      檢驗假設、建立實證結果
                    </div>

                    <div className="space-y-1.5 text-xs text-slate-700 pt-1">
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                        <span><strong>研究對象</strong>：202位供應鏈專業人士</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                        <span><strong>問卷設計</strong>：文獻回顧、專家審查</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                        <span><strong>資料分析</strong>：PLS-SEM 結構方程模型</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                        <span><strong>假設檢定</strong>：H1~H4 (H4a未顯著)</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                        <span><strong>結果</strong>：得到量化因果結果</span>
                      </div>
                    </div>

                    <div className="p-2 rounded-lg bg-rose-50 border border-rose-200 text-center font-bold text-rose-900 text-[11px]">
                      量化結果 (Beta、p值、假設檢定)
                    </div>
                  </div>

                  {/* Step 2: 質性研究階段 (qual) */}
                  <div className="p-4 rounded-xl border border-purple-200 bg-white shadow-2xs space-y-2.5">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-purple-600 text-white text-[10px] font-bold flex items-center justify-center">
                        2
                      </span>
                      <span className="font-bold text-xs text-purple-950">
                        質性研究階段 (qual)
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 font-medium">
                      驗證、補充與深化量化結果
                    </div>

                    <div className="space-y-1.5 text-xs text-slate-700 pt-1">
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                        <span><strong>受訪者</strong>：25位供應鏈專業人士</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                        <span><strong>訪談</strong>：半結構式訪談 (Appendix B)</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                        <span><strong>方法</strong>：Grounded approach (扎根)</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                        <span><strong>編碼</strong>：Open ➔ Axial ➔ Selective</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                        <span><strong>分析</strong>：主題分析與 Triangulation</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                        <span><strong>產出</strong>：形成 P1~P4 命題</span>
                      </div>
                    </div>

                    <div className="p-2 rounded-lg bg-purple-50 border border-purple-200 text-center font-bold text-purple-900 text-[11px]">
                      質性結果 (主題、命題、驗證量化發現)
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-950 flex items-center justify-between">
                  <span>🎯 <strong>關鍵機制</strong>：用 25 位專家質性對話，解釋為何 AI 在環境動態下無法直接保證財務韌性（解開 H4a 不顯著之謎）。</span>
                </div>
              </div>

              {/* RIGHT CARD: ④ 探索式混合研究設計 (Exploratory) */}
              <div className="p-5 rounded-2xl border-2 border-blue-300 bg-gradient-to-b from-blue-50/50 via-white to-blue-50/20 shadow-xs space-y-4">
                {/* Title & Badge */}
                <div className="flex items-start justify-between gap-2 border-b border-blue-200/80 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
                        4
                      </span>
                      <h3 className="font-extrabold text-slate-900 text-base">
                        探索式混合研究設計 (Exploratory)
                      </h3>
                    </div>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded font-mono text-xs font-black bg-blue-100 text-blue-800 border border-blue-300">
                        核心流程：QUAL ➔ quan (先質性，後量化)
                      </span>
                    </div>
                  </div>

                  <span className="px-2.5 py-1 rounded-xl text-[11px] font-bold bg-slate-200 text-slate-700 shrink-0">
                    對照類型 (本論文不符合)
                  </span>
                </div>

                {/* Flow: Phase 1 (QUAL) ➔ Phase 2 (quan) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 relative">
                  {/* Step 1: 質性研究階段 (QUAL) */}
                  <div className="p-4 rounded-xl border border-blue-200 bg-white shadow-2xs space-y-2.5">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center">
                        1
                      </span>
                      <span className="font-bold text-xs text-blue-950">
                        質性研究階段 (QUAL)
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 font-medium">
                      探索現象、發展概念或工具
                    </div>

                    <div className="space-y-1.5 text-xs text-slate-700 pt-1">
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span><strong>受訪者</strong>：訪談特定對象 (如專家)</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span><strong>資料蒐集</strong>：半結構式訪談、焦點團體</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span><strong>分析方法</strong>：Grounded approach</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span><strong>編碼過程</strong>：Open ➔ Axial ➔ Selective</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span><strong>主題分析</strong>：Thematic Analysis</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span><strong>目的</strong>：發展問卷題項 / 初步概念</span>
                      </div>
                    </div>

                    <div className="p-2 rounded-lg bg-blue-50 border border-blue-200 text-center font-bold text-blue-900 text-[11px]">
                      質性結果 (概念、構面、量表、分類)
                    </div>
                  </div>

                  {/* Step 2: 量化研究階段 (quan) */}
                  <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-2.5">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-slate-700 text-white text-[10px] font-bold flex items-center justify-center">
                        2
                      </span>
                      <span className="font-bold text-xs text-slate-900">
                        量化研究階段 (quan)
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 font-medium">
                      驗證質性結果、進行普化
                    </div>

                    <div className="space-y-1.5 text-xs text-slate-700 pt-1">
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                        <span><strong>研究對象</strong>：大量樣本普查</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                        <span><strong>問卷設計</strong>：依據質性結果發展指標</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                        <span><strong>分析方法</strong>：PLS-SEM、多元迴歸</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                        <span><strong>目的</strong>：驗證質性發現，並進行普化</span>
                      </div>
                    </div>

                    <div className="p-2 rounded-lg bg-slate-100 border border-slate-200 text-center font-bold text-slate-800 text-[11px]">
                      量化結果 (驗證質性發現)
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-600">
                  ❌ <strong>排除理由</strong>：本論文並非先進行質性探索後編制量表，而是直接引用成熟量表進行 202 份大樣本問卷調查，隨後才進行訪談。
                </div>
              </div>
            </div>

            {/* Bottom Proof Checklist & Conclusion Card */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-indigo-50 border-2 border-emerald-300 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
                    <Check className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm sm:text-base text-slate-900">
                      本研究為何是「解釋式 (Explanatory)」，而不是「探索式 (Exploratory)」？
                    </h4>
                    <p className="text-xs text-slate-600">
                      Creswell 表 4.2 方法論四大判定鐵證審查
                    </p>
                  </div>
                </div>

                <div className="px-3 py-1 rounded-xl bg-emerald-600 text-white font-extrabold text-xs shadow-2xs flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>符合表 4.2 第 ③ 類 解釋式</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                <div className="p-3 bg-white rounded-xl border border-emerald-200 shadow-2xs space-y-1">
                  <div className="font-bold text-emerald-900 flex items-center gap-1">
                    <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-[10px]">1</span>
                    <span>研究順序：QUAN ➔ qual</span>
                  </div>
                  <p className="text-slate-600 leading-relaxed text-[11px]">
                    先進行 202 份量化問卷與 PLS-SEM 分析，再進行 25 位專家訪談。順序完全符合先量後質。
                  </p>
                </div>

                <div className="p-3 bg-white rounded-xl border border-emerald-200 shadow-2xs space-y-1">
                  <div className="font-bold text-emerald-900 flex items-center gap-1">
                    <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-[10px]">2</span>
                    <span>質性目的：驗證與深化</span>
                  </div>
                  <p className="text-slate-600 leading-relaxed text-[11px]">
                    論文明確指出：<em>"To validate the results of the empirical study ... a qualitative study is conducted."</em>
                  </p>
                </div>

                <div className="p-3 bg-white rounded-emerald border border-emerald-200 shadow-2xs space-y-1">
                  <div className="font-bold text-emerald-900 flex items-center gap-1">
                    <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-[10px]">3</span>
                    <span>研究流程 (Figure 2)</span>
                  </div>
                  <p className="text-slate-600 leading-relaxed text-[11px]">
                    流程圖明確標示：先 PLS-SEM ➔ 得到 Findings ➔ 進入 Qualitative study 驗證 ➔ 提煉命題。
                  </p>
                </div>

                <div className="p-3 bg-white rounded-xl border border-emerald-200 shadow-2xs space-y-1">
                  <div className="font-bold text-emerald-900 flex items-center gap-1">
                    <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-[10px]">4</span>
                    <span>探索式 QUAL ➔ quan 排除</span>
                  </div>
                  <p className="text-slate-600 leading-relaxed text-[11px]">
                    本研究並未先進行質性探索後再編制問卷，因此徹底排除第 4 類探索式設計。
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-white border border-emerald-300 text-xs text-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-amber-500 shrink-0" />
                  <div>
                    <span className="font-bold text-slate-900">學術結論：</span>
                    <span>本研究屬於表 4.2 之 <strong>③ 解釋式混合研究設計 (QUAN ➔ qual)</strong>，次級變型為 <strong>【追蹤的解釋模式 (Follow-up Explanations Model)】</strong>！</span>
                  </div>
                </div>

                {onAskGemini && (
                  <button
                    onClick={() => onAskGemini('請依據 Gupta et al. (2023) 論文，詳細向我說明為何此篇論文判定為「解釋式混合研究設計 (QUAN ➔ qual)」而非探索式？質性訪談如何深化了 PLS-SEM 的未顯著發現？')}
                    className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shrink-0 transition-colors shadow-2xs flex items-center gap-1"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>深入諮詢 Gemini ➔</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* VIEW 2: Comparison Table Matrix */}
        {activeTab === 'table' && (
          <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-2xs bg-white">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-200 text-slate-800 font-bold">
                  <th className="py-3 px-4 w-[16%]">比較項目</th>
                  <th className="py-3 px-4 w-[42%] bg-rose-50/70 text-rose-950 font-extrabold border-r border-rose-200">
                    ③ 解釋式 (Explanatory) 【本研究 Gupta et al.】
                  </th>
                  <th className="py-3 px-4 w-[42%] bg-blue-50/70 text-blue-950 font-extrabold">
                    ④ 探索式 (Exploratory)
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                <tr className="hover:bg-slate-50/60">
                  <td className="py-3 px-4 font-bold text-slate-900">研究順序</td>
                  <td className="py-3 px-4 bg-rose-50/30 font-bold text-rose-900 border-r border-rose-200">
                    QUAN ➔ qual (先量化，後質性)
                  </td>
                  <td className="py-3 px-4 text-slate-700">
                    QUAL ➔ quan (先質性，後量化)
                  </td>
                </tr>
                <tr className="hover:bg-slate-50/60">
                  <td className="py-3 px-4 font-bold text-slate-900">主要目的</td>
                  <td className="py-3 px-4 bg-rose-50/30 text-rose-900 border-r border-rose-200 font-medium">
                    用質性資料解釋、驗證、補充與深化量化結果
                  </td>
                  <td className="py-3 px-4 text-slate-700">
                    先探索現象，發展概念、工具或量表，再以量化驗證
                  </td>
                </tr>
                <tr className="hover:bg-slate-50/60">
                  <td className="py-3 px-4 font-bold text-slate-900">研究時機</td>
                  <td className="py-3 px-4 bg-rose-50/30 text-slate-800 border-r border-rose-200">
                    連續的：先量化，後質性
                  </td>
                  <td className="py-3 px-4 text-slate-700">
                    連續的：先質性，後量化
                  </td>
                </tr>
                <tr className="hover:bg-slate-50/60">
                  <td className="py-3 px-4 font-bold text-slate-900">權重分配</td>
                  <td className="py-3 px-4 bg-rose-50/30 font-bold text-rose-900 border-r border-rose-200">
                    通常強調量化 (QUAN 為主體)
                  </td>
                  <td className="py-3 px-4 text-slate-700 font-bold">
                    通常強調質性 (QUAL 為主體)
                  </td>
                </tr>
                <tr className="hover:bg-slate-50/60">
                  <td className="py-3 px-4 font-bold text-slate-900">混合整合點</td>
                  <td className="py-3 px-4 bg-rose-50/30 text-slate-800 border-r border-rose-200">
                    解釋 QUAN 結果、驗證與深化異常發現
                  </td>
                  <td className="py-3 px-4 text-slate-700">
                    探索現象、發展概念或工具量表
                  </td>
                </tr>
                <tr className="hover:bg-slate-50/60">
                  <td className="py-3 px-4 font-bold text-slate-900">檢驗焦點</td>
                  <td className="py-3 px-4 bg-rose-50/30 text-slate-800 border-r border-rose-200">
                    檢驗假設、建立實證結果
                  </td>
                  <td className="py-3 px-4 text-slate-700">
                    驗證質性研究發現，進行普化
                  </td>
                </tr>
                <tr className="hover:bg-slate-50/60">
                  <td className="py-3 px-4 font-bold text-slate-900">符號記法</td>
                  <td className="py-3 px-4 bg-rose-50/30 font-mono font-bold text-rose-700 border-r border-rose-200">
                    QUAN ➔ qual
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-blue-700">
                    QUAL ➔ quan
                  </td>
                </tr>
                <tr className="bg-slate-50 font-bold">
                  <td className="py-3.5 px-4 text-slate-900">本研究符合度</td>
                  <td className="py-3.5 px-4 bg-rose-100/70 text-emerald-700 border-r border-rose-200 flex items-center gap-1.5 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>✔ 符合 (本研究典範)</span>
                  </td>
                  <td className="py-3.5 px-4 bg-slate-100 text-rose-600 text-sm">
                    <div className="flex items-center gap-1.5">
                      <XCircle className="w-4 h-4 text-rose-500" />
                      <span>✘ 不符合</span>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* VIEW 4: PhD Thesis Academic Standard Wording & Taiwan Stock Replication Flow */}
        {activeTab === 'phd-thesis' && (
          <div className="space-y-5">
            <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 to-indigo-950 text-white shadow-md space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-lg bg-amber-400 text-slate-950 font-extrabold text-xs">
                    博士論文方法論金句
                  </span>
                  <span className="text-xs text-indigo-200">
                    SSCI 頂級期刊與博士論文標準英文與中文論述
                  </span>
                </div>
              </div>

              <div className="space-y-3 text-xs sm:text-sm leading-relaxed">
                <div className="p-3.5 rounded-xl bg-white/10 border border-white/20 space-y-1">
                  <div className="font-bold text-amber-300">英文標準寫法 (Recommended English phrasing):</div>
                  <div className="font-mono text-white bg-black/40 p-2.5 rounded-lg border border-white/10 select-all">
                    An explanatory sequential mixed-methods design using a follow-up explanations model (QUAN → qual)
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-white/10 border border-white/20 space-y-1">
                  <div className="font-bold text-amber-300">中文標準寫法 (Recommended Chinese phrasing):</div>
                  <div className="font-sans font-bold text-white bg-black/40 p-2.5 rounded-lg border border-white/10">
                    採用追蹤解釋模式之解釋式序列混合方法研究設計
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-white/10 border border-white/20 space-y-1">
                  <div className="font-bold text-amber-300">完整段落論述 (Complete Thesis Methodology Paragraph):</div>
                  <p className="text-slate-200 font-serif leading-relaxed bg-black/30 p-3 rounded-lg border border-white/10 text-xs sm:text-sm">
                    本研究採用 explanatory sequential mixed-methods design，並採取 follow-up explanations model。第一階段以量化方法檢驗 AI technology、Blockchain Technology、Environmental Dynamism 與 Financial Resilience 之間的關係；第二階段則依據量化分析所辨識之非預期、異常或需要進一步解釋的結果，進行目的性個案選取與質性資料分析，以深化對量化結果背後機制的理解，最後透過整合兩階段結果形成 meta-inferences。
                  </p>
                </div>
              </div>
            </div>

            {/* Taiwan Stock Replication Flowchart Card */}
            <div className="p-5 rounded-2xl bg-white border-2 border-indigo-200 shadow-xs space-y-4">
              <h4 className="font-extrabold text-sm sm:text-base text-slate-900 flex items-center gap-2">
                <Workflow className="w-5 h-5 text-indigo-600" />
                <span>台股復刻架構：追蹤解釋模式 (Follow-up Explanations Model) 實戰流程圖</span>
              </h4>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex flex-col items-center space-y-2 text-xs font-bold text-slate-800">
                  <div className="px-4 py-2 rounded-xl bg-indigo-600 text-white shadow-xs">
                    MMR 混合方法研究架構
                  </div>
                  <div className="text-indigo-600 font-mono">↓</div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                    <div className="p-3.5 rounded-xl bg-white border border-indigo-200 shadow-2xs space-y-2">
                      <div className="font-extrabold text-indigo-900 flex items-center gap-1.5">
                        <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-800 flex items-center justify-center text-[11px]">1</span>
                        <span>QUAN Phase (量化階段)</span>
                      </div>
                      <div className="space-y-1 text-slate-600 font-normal text-[11px]">
                        <div>• <strong>FinMind data</strong>：抓取台股上市公司財報與資本支出</div>
                        <div>• <strong>PLS-SEM / Panel</strong>：檢驗變數因果與係數顯著性</div>
                        <div>• <strong>Identify unexpected / anomalous results</strong>：識別統計殘差異常或未顯著路徑</div>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-white border border-purple-200 shadow-2xs space-y-2">
                      <div className="font-extrabold text-purple-900 flex items-center gap-1.5">
                        <span className="w-5 h-5 rounded-full bg-purple-100 text-purple-800 flex items-center justify-center text-[11px]">2</span>
                        <span>QUAL Phase (質性追蹤階段)</span>
                      </div>
                      <div className="space-y-1 text-slate-600 font-normal text-[11px]">
                        <div>• <strong>Purposeful case selection</strong>：目的性選取異常個案企業</div>
                        <div>• <strong>MOPS / 法說會重訊 / 年報</strong>：調閱文字檔案與逐字稿</div>
                        <div>• <strong>Thematic Analysis</strong>：主題分析與三級編碼解釋</div>
                      </div>
                    </div>
                  </div>

                  <div className="text-indigo-600 font-mono">↓</div>
                  <div className="px-4 py-2 rounded-xl bg-emerald-600 text-white shadow-xs text-center">
                    Explanation ➔ <strong>Meta-inference (元推論整合)</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
