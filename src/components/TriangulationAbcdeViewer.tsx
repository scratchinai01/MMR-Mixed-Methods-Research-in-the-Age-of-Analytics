import React, { useState } from 'react';
import { 
  ArrowRight, 
  ArrowDown, 
  GitMerge, 
  Layers, 
  Sparkles, 
  BookOpen, 
  CheckCircle2, 
  HelpCircle,
  TrendingUp,
  FileText,
  Workflow,
  Cpu,
  Zap,
  Info
} from 'lucide-react';

interface TriangulationAbcdeViewerProps {
  onAskGemini?: (prompt: string) => void;
}

export type AbcdeModelKey = 'a' | 'b' | 'c' | 'd' | 'e';

export const TriangulationAbcdeViewer: React.FC<TriangulationAbcdeViewerProps> = ({
  onAskGemini
}) => {
  const [selectedKey, setSelectedKey] = useState<AbcdeModelKey>('c');

  const models: Record<AbcdeModelKey, {
    letter: string;
    name: string;
    subName: string;
    enName: string;
    priorityNotation: string;
    isPaperChoice?: boolean;
    definition: string;
    keyMechanism: string;
    paperAlignment: string;
    finmindExample: string;
    steps: {
      quantBranch: string[];
      qualBranch: string[];
      mergeAction: string;
      finalOutput: string;
    };
  }> = {
    a: {
      letter: 'a',
      name: '三角校正設計原型',
      subName: '同時並行・等重整合',
      enName: 'Triangulation Design Prototype',
      priorityNotation: 'QUAN + QUAL (等權重同時進行)',
      definition: '研究者在同一時間區間內，以相等的重視程度分別蒐集量化 (QUAN) 與質性 (QUAL) 資料，並在最後階段直接依據兩者的實證結果進行綜合解釋。',
      keyMechanism: '單一階段、同時安排。兩者獨立執行資料蒐集與分析，最後在詮釋層面進行結論的整合與相互印證。',
      paperAlignment: '本論文 (Raman et al., 2022) 雖同時採集新聞與財報，但更進一步將文字質性情緒轉化為數值特徵，因此超越了單純的 (a) 原型，演進為 (c) 資料轉化模式。',
      finmindExample: '同時下載台積電 (2330) 過去三年三大法人買賣超 (QUAN) 與法說會逐字稿 (QUAL)，各自獨立分析後在投資報告中綜合下結論。',
      steps: {
        quantBranch: ['QUAN 資料蒐集', 'QUAN 資料分析'],
        qualBranch: ['QUAL 資料蒐集', 'QUAL 資料分析'],
        mergeAction: '根據 QUAN 與 QUAL 的結果進行解釋',
        finalOutput: '解釋 QUAN + QUAL'
      }
    },
    b: {
      letter: 'b',
      name: '聚斂模式',
      subName: '雙軌獨立產出・對比印證',
      enName: 'Convergence Model',
      priorityNotation: 'QUAN 結果 & QUAL 結果 ➔ 比較和對比',
      definition: '量化與質性研究各自走完完整的「資料蒐集 ➔ 資料分析 ➔ 產生研究結果」三個步驟，最後將兩組各自獨立的「結果」進行比較和對比 (Compare and Contrast)，驗證彼此是否一致。',
      keyMechanism: '強調「結果層級」的對比。若兩組結果聚斂一致，研究信度倍增；若結果衝突，則激發更深層的機制探討。',
      paperAlignment: '論文在 Phase 2 (GEE 計量模型) 與 Phase 3 (機器學習演算法) 的準確率評估中，透過量化結果與質性新聞意涵的對照，體現了聚斂模式的交叉檢驗精髓。',
      finmindExample: '量化模型算出鴻海 (2317) 具備低 PE 高殖利率優勢；質性供應鏈訪談卻指出海外建廠成本超支。將兩組獨立結果放在天平兩端比較對比，找出市場定價盲點。',
      steps: {
        quantBranch: ['QUAN 資料蒐集', 'QUAN 資料分析', 'QUAN 結果'],
        qualBranch: ['QUAL 資料蒐集', 'QUAL 資料分析', 'QUAL 結果'],
        mergeAction: '比較和對比 (Compare and Contrast)',
        finalOutput: '解釋 QUAN + QUAL'
      }
    },
    c: {
      letter: 'c',
      name: '資料轉化模式',
      subName: '質性轉化數值・交互關聯 (本論文核心)',
      enName: 'Data Transformation Model (QUAL into quan)',
      priorityNotation: 'QUAL ➔ 轉化成 quan 資料 ➔ 與 QUAN 相互關聯',
      isPaperChoice: true,
      definition: '研究者在分析階段，將質性資料 (QUAL) 透過詞庫、編碼或自然語言處理 (NLP)「轉化為量化數據 (quan 資料)」，然後將這組轉化後的數值與原有的量化資料 (QUAN) 進行統計關聯與迴歸分析！',
      keyMechanism: '【突破性整合】將質性文本的非結構化語意「數值化/特徵化」，從而能夠直接代入計量回歸模型與機器學習演算法中，與財務變數產生非線性交互作用。',
      paperAlignment: '★【Raman et al., 2022 論文之精髓】華爾街日報 2,500+ 篇非結構化新聞 (QUAL) ➔ 經 Loughran-McDonald 金融詞庫轉化為正面與負面情緒得分 (quan) ➔ 與 Compustat 營收成長與市值淨值比產生 Sales_growth × Positive 交互項 ➔ GEE 計量回歸與機器學習預測！',
      finmindExample: '使用 FinMind API 爬取台股新聞文本 (QUAL) ➔ 經過台股在地化情緒詞庫評分轉為每日情緒得分 (quan) ➔ 輸入 XGBoost 與營收、本益比 (QUAN) 共同預測次日超額報酬！',
      steps: {
        quantBranch: ['QUAN 資料蒐集', 'QUAN 資料分析'],
        qualBranch: ['QUAL 資料蒐集', 'QUAL 資料分析', '【將 QUAL 資料轉化成 quan 資料】'],
        mergeAction: '比較並使兩組 QUAN/quan 資料相互關聯',
        finalOutput: '解釋 QUAN + QUAL'
      }
    },
    d: {
      letter: 'd',
      name: '證實量化資料模式',
      subName: '量化為主體・質性輔助驗證',
      enName: 'Validating Quantitative Data Model',
      priorityNotation: 'QUAN (主體優先) + qual (次要輔助證實)',
      definition: '研究以大規模量化研究 (QUAN) 為核心主體，伴隨蒐集次要、開放式的質性資料 (qual，以小寫表示次要權重)，專門用質性發現來「證實」或豐富量化調查的統計結論。',
      keyMechanism: '非對稱權重 (QUAN 大寫、qual 小寫)。質性資料的作用不是獨立成篇，而是為量化數據提供實務佐證、個案細節與離群值 (Outliers) 的機制說明。',
      paperAlignment: '在論文中，作者對特定極端異常值（如 Facebook 隱私事件）的深入個案剖析，即是利用質性脈絡來證實計量模型預測誤差的關鍵輔助手段。',
      finmindExample: '以台股 1,800 檔股票全市場因子回測 (QUAN) 為主體；針對模型殘差超過 3 個標準差的 10 檔離群個股，調閱重大公開訊息 (qual) 證實異常原因。',
      steps: {
        quantBranch: ['QUAN 資料蒐集：調查', 'QUAN 資料分析', 'QUAN 結果'],
        qualBranch: ['qual 資料蒐集：開放式調查項目', 'qual 資料分析', 'qual 結果'],
        mergeAction: '利用 qual 結果證實 QUAN 結果',
        finalOutput: '解釋 QUAN + qual'
      }
    },
    e: {
      letter: 'e',
      name: '多層次模式',
      subName: '宏觀中觀微觀・立體階層架構',
      enName: 'Multilevel Model',
      priorityNotation: '第1層級 QUAN + 第2層級 QUAL + 第3層級 QUAN ➔ 整體解釋',
      definition: '將複雜研究問題依系統層次拆解為不同層級 (如：國家宏觀層、企業組織層、個體行為層)。在不同層次上各自運用量化或質性方法，最後融合成一個整體的跨層次多維解釋。',
      keyMechanism: '垂直階層式架構。突破單一平面的分析局限，捕捉高層次結構對低層次個體的環境制約，以及低層次行為對高層次績效的湧現效應。',
      paperAlignment: '對應本論文探討：第一層 (宏觀資本市場定價與適應性市場 AMH) + 第二層 (企業財報營收成長與財務體質) + 第三層 (財經新聞媒體的情緒催化)。',
      finmindExample: '第一層次：台灣央行利率與景氣對策信號 (QUAN)；第二層次：個別產業龍頭訪談與董事會治理 (QUAL)；第三層次：散戶融資券與高頻即時成交 (QUAN) ➔ 建構整體多層次選股系統。',
      steps: {
        quantBranch: ['第一層次：QUAN 資料蒐集、分析、結果 (如大盤/宏觀)'],
        qualBranch: [
          '第二層次：QUAL 資料蒐集、分析、結果 (如企業質性策略)',
          '第三層次：QUAN 資料蒐集、分析、結果 (如微觀高頻籌碼)'
        ],
        mergeAction: '跨層次結構整合與湧現機制對齊',
        finalOutput: '整體的解釋 (Overall Interpretation)'
      }
    }
  };

  const current = models[selectedKey];

  return (
    <div className="space-y-6">
      {/* Textbook Context Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-950 p-5 rounded-2xl text-white shadow-md border border-indigo-500/30">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-400 text-slate-950">
                圖 4.1 三角校正設計
              </span>
              <span className="text-xs text-indigo-300 font-mono">
                Creswell & Plano Clark 經典方法論
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-white mt-1.5 font-serif">
              三角校正設計 (Triangulation Design) 5 大變型：ABCDE 型全景解構
            </h3>
            <p className="text-xs text-indigo-200/90 mt-1 max-w-3xl leading-relaxed">
              依據經典混合方法研究教科書《混合方法研究設計與執行》，三角校正設計包含 a、b、c、d、e 五大模式。本篇頂級期刊論文 (Raman et al., 2022) 正是採用 <strong>(c) 資料轉化模式</strong> 的極致代表！
            </p>
          </div>

          {onAskGemini && (
            <button
              onClick={() => onAskGemini(`請依據 Creswell 圖 4.1 三角校正設計的 5 大變型 (ABCDE 型)，詳細分析 Raman et al. (2022) 論文為何屬於「(c) 資料轉化模式」？`)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-xs transition-all shadow-xs shrink-0"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-200" />
              <span>Gemini 剖析 ABCDE 型</span>
            </button>
          )}
        </div>

        {/* Notation Guide Pill */}
        <div className="mt-4 pt-3 border-t border-indigo-500/30 flex flex-wrap items-center gap-y-2 gap-x-4 text-[11px] text-indigo-200/90 font-mono">
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-white bg-indigo-600/60 px-1.5 py-0.5 rounded">大寫 QUAN / QUAL</span>
            <span>＝ 重要性與優先性較高 (Priority)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-white bg-purple-600/60 px-1.5 py-0.5 rounded">小寫 quan / qual</span>
            <span>＝ 重要性與優先性次之 (Secondary)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-amber-300 font-sans font-semibold">＋ 號</span>
            <span>＝ 同時進行 (Concurrent)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-emerald-300 font-sans font-semibold">➔ 箭頭</span>
            <span>＝ 順序進行 (Sequential)</span>
          </div>
        </div>
      </div>

      {/* Model Selector Tabs (A, B, C, D, E) */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
        {(Object.keys(models) as AbcdeModelKey[]).map((key) => {
          const m = models[key];
          const isSelected = selectedKey === key;
          return (
            <button
              key={key}
              onClick={() => setSelectedKey(key)}
              className={`p-3 rounded-xl border text-left transition-all relative overflow-hidden flex flex-col justify-between ${
                isSelected
                  ? 'bg-indigo-600 text-white border-indigo-700 shadow-md ring-2 ring-indigo-300'
                  : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200 shadow-2xs'
              }`}
            >
              {m.isPaperChoice && (
                <span className="absolute top-0 right-0 bg-amber-400 text-slate-950 font-bold text-[9px] px-1.5 py-0.5 rounded-bl-lg uppercase tracking-wider">
                  論文採用
                </span>
              )}
              <div>
                <div className="flex items-center gap-1.5 mb-1">
                  <span className={`w-5 h-5 rounded-md flex items-center justify-center font-bold text-xs ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-800'
                  }`}>
                    {m.letter}
                  </span>
                  <span className="text-xs font-bold truncate">
                    {m.name}
                  </span>
                </div>
                <div className={`text-[10px] truncate ${isSelected ? 'text-indigo-100' : 'text-slate-500'}`}>
                  {m.subName}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Model Detailed Showcase Card */}
      <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-6">
        {/* Title Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="w-7 h-7 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                ({current.letter})
              </span>
              <h4 className="text-lg font-bold text-slate-950">
                {current.name}
              </h4>
              <span className="text-xs font-mono text-slate-400">
                {current.enName}
              </span>
              {current.isPaperChoice && (
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
                  ★ Raman et al. (2022) 核心採用模式
                </span>
              )}
            </div>
            <div className="text-xs font-mono text-indigo-700 font-semibold mt-1">
              符號表達式：{current.priorityNotation}
            </div>
          </div>

          {onAskGemini && (
            <button
              onClick={() => onAskGemini(`請針對三角校正設計中的「(${current.letter}) ${current.name}」，解說在量化金融與台股投資策略中如何具體實現？`)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold transition-colors shrink-0"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>詢問此模式台股實務</span>
            </button>
          )}
        </div>

        {/* Visual Workflow Flowchart (Directly Reproducing Textbook Diagram 4.1) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700">
            <span className="flex items-center gap-1.5">
              <Workflow className="w-4 h-4 text-indigo-600" />
              <span>流程圖解（對照教科書圖 4.1{current.letter} 結構）</span>
            </span>
            <span className="text-[11px] text-slate-400 font-normal">
              左側資料蒐集 ➔ 中間分析轉化 ➔ 右側綜合解釋
            </span>
          </div>

          <div className="bg-slate-50/80 p-5 sm:p-6 rounded-2xl border border-slate-200/80 overflow-x-auto">
            {/* Flowchart Layout */}
            {selectedKey === 'a' && (
              <div className="min-w-[560px] flex items-center justify-between gap-4">
                <div className="space-y-4 flex-1">
                  <div className="p-3 bg-white border border-indigo-300 text-indigo-900 rounded-xl text-xs font-bold text-center shadow-2xs">
                    QUAN 資料蒐集與分析
                  </div>
                  <div className="p-3 bg-white border border-purple-300 text-purple-900 rounded-xl text-xs font-bold text-center shadow-2xs">
                    QUAL 資料蒐集與分析
                  </div>
                </div>

                <div className="flex items-center text-slate-400">
                  <ArrowRight className="w-6 h-6" />
                </div>

                <div className="p-4 bg-indigo-100 border border-indigo-300 text-indigo-950 rounded-xl text-xs font-bold text-center shadow-xs flex-1">
                  根據 QUAN 與 QUAL 的結果進行解釋
                </div>
              </div>
            )}

            {selectedKey === 'b' && (
              <div className="min-w-[680px] flex items-center justify-between gap-3">
                <div className="space-y-4 flex-1">
                  {/* QUAN Branch */}
                  <div className="flex items-center gap-2">
                    <div className="p-2.5 bg-white border border-indigo-300 text-indigo-900 rounded-lg text-xs font-semibold flex-1 text-center">
                      QUAN 資料蒐集
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />
                    <div className="p-2.5 bg-white border border-indigo-300 text-indigo-900 rounded-lg text-xs font-semibold flex-1 text-center">
                      QUAN 資料分析
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />
                    <div className="p-2.5 bg-indigo-50 border border-indigo-400 text-indigo-950 rounded-lg text-xs font-bold flex-1 text-center shadow-2xs">
                      QUAN 結果
                    </div>
                  </div>

                  {/* QUAL Branch */}
                  <div className="flex items-center gap-2">
                    <div className="p-2.5 bg-white border border-purple-300 text-purple-900 rounded-lg text-xs font-semibold flex-1 text-center">
                      QUAL 資料蒐集
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />
                    <div className="p-2.5 bg-white border border-purple-300 text-purple-900 rounded-lg text-xs font-semibold flex-1 text-center">
                      QUAL 資料分析
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />
                    <div className="p-2.5 bg-purple-50 border border-purple-400 text-purple-950 rounded-lg text-xs font-bold flex-1 text-center shadow-2xs">
                      QUAL 結果
                    </div>
                  </div>
                </div>

                <div className="flex items-center text-slate-400">
                  <ArrowRight className="w-5 h-5" />
                </div>

                <div className="p-3 bg-amber-50 border border-amber-300 text-amber-950 rounded-xl text-xs font-bold text-center shrink-0 w-28 shadow-xs">
                  比較和對比
                </div>

                <div className="flex items-center text-slate-400">
                  <ArrowRight className="w-5 h-5" />
                </div>

                <div className="p-3.5 bg-emerald-100 border border-emerald-300 text-emerald-950 rounded-xl text-xs font-bold text-center shrink-0 w-32 shadow-xs">
                  解釋<br />QUAN + QUAL
                </div>
              </div>
            )}

            {selectedKey === 'c' && (
              <div className="min-w-[700px] flex items-center justify-between gap-3">
                <div className="space-y-4 flex-1">
                  {/* QUAN Branch */}
                  <div className="flex items-center gap-2">
                    <div className="p-2.5 bg-white border border-indigo-300 text-indigo-900 rounded-lg text-xs font-semibold w-36 text-center">
                      QUAN 資料蒐集
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />
                    <div className="p-2.5 bg-white border border-indigo-300 text-indigo-900 rounded-lg text-xs font-semibold flex-1 text-center">
                      QUAN 資料分析 (Compustat 財報)
                    </div>
                  </div>

                  {/* QUAL Branch with Transformation */}
                  <div className="flex items-center gap-2">
                    <div className="p-2.5 bg-white border border-purple-300 text-purple-900 rounded-lg text-xs font-semibold w-36 text-center">
                      QUAL 資料蒐集 (WSJ 新聞)
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />
                    <div className="p-2.5 bg-white border border-purple-300 text-purple-900 rounded-lg text-xs font-semibold flex-1 text-center">
                      QUAL 資料分析
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />
                    <div className="p-2.5 bg-amber-100 border-2 border-amber-400 text-amber-950 rounded-lg text-xs font-bold flex-1 text-center shadow-xs">
                      ⚡ 將 QUAL 資料轉化成 quan 資料 (LM情緒分數)
                    </div>
                  </div>
                </div>

                <div className="flex items-center text-slate-400">
                  <ArrowRight className="w-5 h-5" />
                </div>

                <div className="p-3.5 bg-indigo-50 border-2 border-indigo-400 text-indigo-950 rounded-xl text-xs font-bold text-center shrink-0 w-36 shadow-xs">
                  比較並使兩組 QUAN 資料相互關聯<br />(GEE 調節項回歸)
                </div>

                <div className="flex items-center text-slate-400">
                  <ArrowRight className="w-5 h-5" />
                </div>

                <div className="p-3.5 bg-emerald-100 border border-emerald-300 text-emerald-950 rounded-xl text-xs font-bold text-center shrink-0 w-32 shadow-xs">
                  解釋<br />QUAN + QUAL
                </div>
              </div>
            )}

            {selectedKey === 'd' && (
              <div className="min-w-[680px] flex items-center justify-between gap-3">
                <div className="space-y-4 flex-1">
                  {/* QUAN Branch (Major) */}
                  <div className="flex items-center gap-2">
                    <div className="p-2.5 bg-indigo-50 border-2 border-indigo-500 text-indigo-950 rounded-lg text-xs font-bold flex-1 text-center">
                      QUAN 資料蒐集：調查
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />
                    <div className="p-2.5 bg-indigo-50 border-2 border-indigo-500 text-indigo-950 rounded-lg text-xs font-bold flex-1 text-center">
                      QUAN 資料分析
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />
                    <div className="p-2.5 bg-indigo-100 border-2 border-indigo-600 text-indigo-950 rounded-lg text-xs font-bold flex-1 text-center shadow-xs">
                      QUAN 結果
                    </div>
                  </div>

                  {/* qual Branch (Minor, Secondary) */}
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-white border border-slate-300 text-slate-600 rounded-lg text-[11px] flex-1 text-center">
                      qual 資料蒐集：開放式調查項目
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                    <div className="p-2 bg-white border border-slate-300 text-slate-600 rounded-lg text-[11px] flex-1 text-center">
                      qual 資料分析
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                    <div className="p-2 bg-slate-100 border border-slate-300 text-slate-700 rounded-lg text-[11px] flex-1 text-center">
                      qual 結果
                    </div>
                  </div>
                </div>

                <div className="flex items-center text-slate-400">
                  <ArrowRight className="w-5 h-5" />
                </div>

                <div className="p-3 bg-purple-50 border border-purple-300 text-purple-950 rounded-xl text-xs font-bold text-center shrink-0 w-36 shadow-xs">
                  利用 qual 結果證實 QUAN 結果
                </div>

                <div className="flex items-center text-slate-400">
                  <ArrowRight className="w-5 h-5" />
                </div>

                <div className="p-3.5 bg-emerald-100 border border-emerald-300 text-emerald-950 rounded-xl text-xs font-bold text-center shrink-0 w-32 shadow-xs">
                  解釋<br />QUAN + qual
                </div>
              </div>
            )}

            {selectedKey === 'e' && (
              <div className="min-w-[620px] flex items-center justify-between gap-4">
                <div className="space-y-3 flex-1">
                  <div className="p-3 bg-indigo-50 border border-indigo-300 text-indigo-950 rounded-xl text-xs font-bold text-left shadow-2xs">
                    <span className="text-indigo-600 font-extrabold mr-2">第一層次：</span>
                    QUAN 資料蒐集、分析、結果 (宏觀大盤 / 總體市場)
                  </div>
                  <div className="p-3 bg-purple-50 border border-purple-300 text-purple-950 rounded-xl text-xs font-bold text-left shadow-2xs">
                    <span className="text-purple-600 font-extrabold mr-2">第二層次：</span>
                    QUAL 資料蒐集、分析、結果 (中觀企業個案 / 策略訪談)
                  </div>
                  <div className="p-3 bg-indigo-50 border border-indigo-300 text-indigo-950 rounded-xl text-xs font-bold text-left shadow-2xs">
                    <span className="text-indigo-600 font-extrabold mr-2">第三層次：</span>
                    QUAN 資料蒐集、分析、結果 (微觀高頻籌碼 / 交易訂單流)
                  </div>
                </div>

                <div className="flex items-center text-slate-400">
                  <ArrowRight className="w-6 h-6" />
                </div>

                <div className="p-5 bg-gradient-to-br from-indigo-100 to-purple-100 border-2 border-indigo-400 text-indigo-950 rounded-2xl text-xs font-bold text-center shrink-0 w-36 shadow-md">
                  整體的解釋<br />
                  <span className="text-[10px] font-normal text-indigo-700">(Overall Interpretation)</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Deep Dive Breakdown Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Methodological Definition */}
          <div className="p-4.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
              <BookOpen className="w-4 h-4 text-indigo-600" />
              <span>方法論核心定義</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              {current.definition}
            </p>
            <div className="mt-2 text-xs text-slate-500 bg-white p-2.5 rounded-lg border border-slate-200">
              <strong className="text-indigo-700">運作機理：</strong>{current.keyMechanism}
            </div>
          </div>

          {/* Paper Alignment (Why Raman et al. 2022 fits here) */}
          <div className="p-4.5 bg-indigo-50/50 rounded-xl border border-indigo-200 space-y-2">
            <div className="flex items-center gap-2 text-indigo-950 font-bold text-sm">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>論文實證對齊 (Raman et al., 2022)</span>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed">
              {current.paperAlignment}
            </p>
          </div>
        </div>

        {/* Taiwan Stock / FinMind Real Practice Box */}
        <div className="p-4.5 rounded-xl bg-gradient-to-r from-emerald-50 via-teal-50 to-indigo-50 border border-emerald-200">
          <div className="flex items-center gap-2 font-bold text-emerald-950 text-sm mb-1.5">
            <TrendingUp className="w-4 h-4 text-emerald-600" />
            <span>台股金融實戰（FinMind 工具）如何落地此模式？</span>
          </div>
          <p className="text-xs text-emerald-900 leading-relaxed">
            {current.finmindExample}
          </p>
        </div>
      </div>

      {/* Comparison Table of All 5 ABCDE Models */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
          <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-600" />
            <span>圖 4.1 三角校正設計 5 大變型全貌橫向比較表</span>
          </h4>
          <p className="text-xs text-slate-500 mt-0.5">
            清楚對比 a、b、c、d、e 型在資料蒐集、分析手法與整合時機的根本差異
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                <th className="px-4 py-3 whitespace-nowrap">代號</th>
                <th className="px-4 py-3 whitespace-nowrap">模式名稱</th>
                <th className="px-4 py-3 whitespace-nowrap">Creswell 符號表徵</th>
                <th className="px-4 py-3">質性與量化整合的關鍵節點</th>
                <th className="px-4 py-3 whitespace-nowrap">本論文角色</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-sans">
              <tr className={selectedKey === 'a' ? 'bg-indigo-50/70 font-semibold' : 'hover:bg-slate-50'}>
                <td className="px-4 py-3 font-mono font-bold text-indigo-600">(a)</td>
                <td className="px-4 py-3 font-medium">三角校正設計原型</td>
                <td className="px-4 py-3 font-mono text-slate-600">QUAN + QUAL</td>
                <td className="px-4 py-3 text-slate-600">各自獨立蒐集與分析，最後共同解釋</td>
                <td className="px-4 py-3 text-slate-400">基礎原型</td>
              </tr>
              <tr className={selectedKey === 'b' ? 'bg-indigo-50/70 font-semibold' : 'hover:bg-slate-50'}>
                <td className="px-4 py-3 font-mono font-bold text-indigo-600">(b)</td>
                <td className="px-4 py-3 font-medium">聚斂模式 (Convergence)</td>
                <td className="px-4 py-3 font-mono text-slate-600">QUAN結果 & QUAL結果 ➔ 對比</td>
                <td className="px-4 py-3 text-slate-600">各自走完三步產生獨立結果後，在「結果層級」比較對比</td>
                <td className="px-4 py-3 text-slate-500">ML與GEE交叉印證</td>
              </tr>
              <tr className="bg-amber-50/90 font-semibold text-amber-950">
                <td className="px-4 py-3 font-mono font-bold text-amber-700">(c)</td>
                <td className="px-4 py-3 font-bold text-slate-900 flex items-center gap-1.5">
                  <span>資料轉化模式 (Data Transformation)</span>
                  <span className="px-1.5 py-0.2 rounded text-[10px] bg-amber-400 text-slate-950 font-bold">本論文核心</span>
                </td>
                <td className="px-4 py-3 font-mono text-amber-800">QUAL ➔ quan ➔ 與 QUAN 關聯</td>
                <td className="px-4 py-3 text-slate-800"><strong>將質性文字轉化成數值變數 (quan)</strong>，直接納入回歸與ML算法中</td>
                <td className="px-4 py-3 text-emerald-700 font-bold">★ 完美契合典範</td>
              </tr>
              <tr className={selectedKey === 'd' ? 'bg-indigo-50/70 font-semibold' : 'hover:bg-slate-50'}>
                <td className="px-4 py-3 font-mono font-bold text-indigo-600">(d)</td>
                <td className="px-4 py-3 font-medium">證實量化資料模式 (Validating)</td>
                <td className="px-4 py-3 font-mono text-slate-600">QUAN + qual (非對稱權重)</td>
                <td className="px-4 py-3 text-slate-600">以量化為主體，質性用以證實量化異常或調查發現</td>
                <td className="px-4 py-3 text-slate-500">極端異常值個案證實</td>
              </tr>
              <tr className={selectedKey === 'e' ? 'bg-indigo-50/70 font-semibold' : 'hover:bg-slate-50'}>
                <td className="px-4 py-3 font-mono font-bold text-indigo-600">(e)</td>
                <td className="px-4 py-3 font-medium">多層次模式 (Multilevel)</td>
                <td className="px-4 py-3 font-mono text-slate-600">第1層QUAN + 第2層QUAL + 第3層QUAN</td>
                <td className="px-4 py-3 text-slate-600">宏觀、中觀、微觀垂直階層切分，匯流至整體解釋</td>
                <td className="px-4 py-3 text-slate-500">市場/企業/情緒三階層</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
