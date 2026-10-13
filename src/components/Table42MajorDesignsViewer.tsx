import React, { useState } from 'react';
import { 
  GitMerge, 
  Layers, 
  Sparkles, 
  BookOpen, 
  CheckCircle2, 
  HelpCircle,
  TrendingUp,
  Workflow,
  ArrowRight,
  ArrowDown,
  Clock,
  Scale,
  Combine,
  Binary,
  Compass,
  Check,
  RotateCcw,
  Lightbulb,
  ExternalLink
} from 'lucide-react';

interface Table42MajorDesignsViewerProps {
  onAskGemini?: (prompt: string) => void;
  onSelectDesign?: (designId: string) => void;
}

export type MajorDesignId = 'triangulation' | 'embedded' | 'explanatory' | 'exploratory';

export interface MajorDesignInfo {
  id: MajorDesignId;
  name: string;
  enName: string;
  timing: string;
  timingCategory: 'concurrent' | 'sequential_quan_qual' | 'sequential_qual_quan' | 'both';
  weight: string;
  weightCategory: 'equal' | 'unequal' | 'quan_priority' | 'qual_priority';
  mixing: string;
  notation: string;
  badgeColor: string;
  borderTheme: string;
  bgGradient: string;
  variants: Array<{
    name: string;
    enName: string;
    desc: string;
    isPaperExample?: boolean;
    sampleFinmind: string;
  }>;
  coreLogic: string;
  whenToUse: string;
  finmindPractice: string;
  diagramSteps: {
    phase1: string;
    phase2?: string;
    integration: string;
    outcome: string;
  };
}

export const TABLE_4_2_DESIGNS: Record<MajorDesignId, MajorDesignInfo> = {
  triangulation: {
    id: 'triangulation',
    name: '三角校正 (Triangulation)',
    enName: 'Triangulation Design',
    timing: '同時的：在相同時間執行量化與質性',
    timingCategory: 'concurrent',
    weight: '通常是相等的',
    weightCategory: 'equal',
    mixing: '在解釋或分析階段合併資料',
    notation: 'QUAN + QUAL',
    badgeColor: 'bg-amber-100 text-amber-900 border-amber-300',
    borderTheme: 'border-amber-400',
    bgGradient: 'from-amber-50/70 via-orange-50/40 to-yellow-50/50',
    variants: [
      {
        name: '聚斂模式 (Convergence)',
        enName: 'Convergence Model',
        desc: '量化與質性各自獨立走完分析並產生各自獨立的結果，最後在「結果層級」進行比較和對比。',
        sampleFinmind: '量化計算台積電本益比與均線，質性分析法說會談話，最後在投資結論段落對比兩者是否聚斂。'
      },
      {
        name: '資料轉化模式 (Data Transformation)',
        enName: 'Data Transformation Model',
        desc: '★【Raman et al. 2022 核心典範】將質性文本透過詞庫或 NLP 轉化為 quan 數值特徵，再與 QUAN 財務資料在計量或 ML 中相互關聯。',
        isPaperExample: true,
        sampleFinmind: '利用 FinMind 新聞文本 ➔ 經 LM/台股情緒詞庫計算每日情緒分數 (quan) ➔ 與三大法人買賣超 (QUAN) 輸入 XGBoost。'
      },
      {
        name: '證實量化資料模式 (Validating Quantitative Data)',
        enName: 'Validating Quantitative Data Model',
        desc: '以大規模量化為主體，以次要質性開放式題目證實量化異常值或結論。',
        sampleFinmind: '量化回測全台股 1,800 檔標的，抽樣 10 家異常暴跌個股深入調閱重訊進行驗證。'
      },
      {
        name: '多層次模式 (Multilevel)',
        enName: 'Multilevel Model',
        desc: '不同研究層級（如宏觀經濟量化 + 組織策略質性 + 微觀高頻行情）分別採集不同型態資料後合併詮釋。',
        sampleFinmind: '第 1 層台灣總經利率 (QUAN) + 第 2 層晶圓廠高層深度訪談 (QUAL) + 第 3 層即時逐筆撮合流 (QUAN)。'
      }
    ],
    coreLogic: '研究者欲在單一時間窗口內，綜合「量化數字的廣度」與「質性敘事的深度」，透過多角檢驗確認研究結論的真確性。',
    whenToUse: '當研究問題需要客觀指標與主觀語境相互印證，且研究者具備同時收集兩類資料的資源與能力時。',
    finmindPractice: '在同一個季度內，同時串接 FinMind 季報財報與全市場即時新聞，直接在特徵工程或結論層次進行交叉驗證。',
    diagramSteps: {
      phase1: '同時採集：QUAN (財報/量化) + QUAL (新聞/質性)',
      integration: '在分析或解釋階段進行合併或特徵交叉 (Merge / Transform)',
      outcome: '綜合詮釋：得出全面且具備三角印證的實證結論'
    }
  },
  embedded: {
    id: 'embedded',
    name: '嵌入式 (Embedded)',
    enName: 'Embedded Design',
    timing: '同時的或連續的',
    timingCategory: 'both',
    weight: '不相等的 (一主一次)',
    weightCategory: 'unequal',
    mixing: '將一種類型的資料嵌入到一個較大的、使用另一種類型資料的設計之內',
    notation: 'QUAN (qual) 或 QUAL (quan)',
    badgeColor: 'bg-blue-100 text-blue-900 border-blue-300',
    borderTheme: 'border-blue-400',
    bgGradient: 'from-blue-50/70 via-indigo-50/40 to-sky-50/50',
    variants: [
      {
        name: '嵌入式實驗式 (Embedded Experimental)',
        enName: 'Embedded Experimental Model',
        desc: '在大型量化真實驗或準實驗中（例如量化交易策略回測），嵌入質性訪談以理解受試者決策心理或市場極端異象。',
        sampleFinmind: '進行量化策略實盤 A/B 測試（主），同時對爆倉帳戶交易員進行質性訪談（次嵌入），探討情緒失控機理。'
      },
      {
        name: '嵌入式相關式 (Embedded Correlational)',
        enName: 'Embedded Correlational Model',
        desc: '在大型相關性或回歸分析研究中，嵌入質性個案描述以補充統計數字所無法解釋的情境細節。',
        sampleFinmind: '對台股 50 大市值股進行長期 GEE 面板回歸（主），並在統計異常樣本中嵌入特定年份經營危機質性案例（次）。'
      }
    ],
    coreLogic: '次要型態的資料無法獨立回答主要研究問題，其存在完全是為了「服務並補充」另一個較大的主要研究架構。',
    whenToUse: '當主要研究設計（如純量化實驗）無法完全捕捉某些機理（如心理動機、實務阻力），需要次要資料輔助時。',
    finmindPractice: '以 FinMind 大規模量化統計模型為主體架構，偶爾調閱特定極端離群值個股的質性事件記錄做為補充註腳。',
    diagramSteps: {
      phase1: '大型主要研究軌道：【主 QUAN 或 主 QUAL】',
      phase2: '次要補充軌道嵌入：(輔 qual 或 輔 quan)',
      integration: '將次要資料嵌入主要研究設計之中為其服務',
      outcome: '主要結論由主軌道支撐，次要軌道提供情境補充'
    }
  },
  explanatory: {
    id: 'explanatory',
    name: '解釋式 (Explanatory)',
    enName: 'Explanatory Sequential Design',
    timing: '連續的：先量化，後質性 (先量後質)',
    timingCategory: 'sequential_quan_qual',
    weight: '通常強調量化 (QUAN 優先)',
    weightCategory: 'quan_priority',
    mixing: '連結兩個階段的資料 (以質性解釋量化)',
    notation: 'QUAN ➔ qual',
    badgeColor: 'bg-emerald-100 text-emerald-900 border-emerald-300',
    borderTheme: 'border-emerald-400',
    bgGradient: 'from-emerald-50/70 via-teal-50/40 to-green-50/50',
    variants: [
      {
        name: '追蹤的解釋模式 (Follow-up Explanations)',
        enName: 'Follow-up Explanations Model',
        desc: '第一階段進行量化統計分析，發現令人意外的異常係數或極端值後，第二階段針對這些特殊結果進行質性追蹤探討。',
        sampleFinmind: '先跑 GEE 發現在極度樂觀新聞下高成長股次季大跌，後續調閱法說會質性質疑對話，解釋為何投資人預期破滅。'
      },
      {
        name: '參與者選擇模式 (Participant Selection)',
        enName: 'Participant Selection Model',
        desc: '第一階段利用量化問卷或交易數據篩選出具有特定特徵的極端樣本群體，第二階段再對該群體進行質性訪談。',
        sampleFinmind: '利用 FinMind 籌碼數據篩選出過去一年績效前 1% 的當沖贏家，再逐一進行深度操盤心法訪談。'
      }
    ],
    coreLogic: '「先有量化結果，再用質性深入解釋其內在因果機理」。質性階段的角色是為初期的統計數字提供解釋與脈絡。',
    whenToUse: '當量化分析結果出現反直覺結果（如正面情緒效果遞減）、或僅知道「數字有顯著差異」但不知道「底層為什麼會這樣」時。',
    finmindPractice: 'Phase 1 用 FinMind 跑出量化預測誤差；Phase 2 針對前 10% 預測失誤的個股檢索財經雜誌長篇報導以查明原委。',
    diagramSteps: {
      phase1: '第一階段 (QUAN)：量化數據蒐集與統計回歸 (找出規律與異常)',
      phase2: '第二階段 (qual)：根據第一階段結果，針對性設計質性深度訪談',
      integration: '連結兩階段：利用質性語境解釋量化數字的因果成因',
      outcome: '完成因果機理詮釋，破除單純統計黑箱'
    }
  },
  exploratory: {
    id: 'exploratory',
    name: '探索式 (Exploratory)',
    enName: 'Exploratory Sequential Design',
    timing: '連續的：先質性，後量化 (先質後量)',
    timingCategory: 'sequential_qual_quan',
    weight: '通常強調質性 (QUAL 優先)',
    weightCategory: 'qual_priority',
    mixing: '連結兩個階段的資料 (以量化驗證質性)',
    notation: 'QUAL ➔ quan',
    badgeColor: 'bg-purple-100 text-purple-900 border-purple-300',
    borderTheme: 'border-purple-400',
    bgGradient: 'from-purple-50/70 via-fuchsia-50/40 to-pink-50/50',
    variants: [
      {
        name: '工具發展模式 (Instrument Development)',
        enName: 'Instrument Development Model',
        desc: '第一階段質性探討以萃取新概念或維度，並據此編制量表、詞典或評分指標；第二階段再進行大規模量化驗證。',
        sampleFinmind: '第一階段深度訪談 20 位台股外資交易員整理台股在地黑話，發展「台股特有情緒詞庫」；第二階段應用至 FinMind 萬篇新聞量化回測。'
      },
      {
        name: '分類發展模式 (Taxonomy Development)',
        enName: 'Taxonomy Development Model',
        desc: '第一階段質性探索出新的企業商業模式或市場行為分類，第二階段利用量化數據檢驗此分類架構的普適性與預測力。',
        sampleFinmind: '質性研究半導體供應鏈重組模式，歸納出三種地緣韌性策略，隨後量化比對上市櫃公司毛利率與存貨週轉天數。'
      }
    ],
    coreLogic: '「領域未明、缺乏量化測量工具時，先由質性奠基探索，再用量化進行大樣本普查推論」。',
    whenToUse: '當研究的主題缺乏現成的理論框架、變數指標或衡量工具，需要先進行質性探索以建立架構時。',
    finmindPractice: '先質性提煉出全新量化特徵因子（例如地緣政治敏感度詞表），再調用 FinMind 歷史長河進行十次回測檢驗。',
    diagramSteps: {
      phase1: '第一階段 (QUAL)：質性文本或個案探索 (提煉概念、維度與假設)',
      phase2: '第二階段 (quan)：根據質性發現，開發量化指標並進行大樣本統計檢驗',
      integration: '連結兩階段：將質性發現落實為可測量的量化工具並泛化',
      outcome: '從未知領域的個案探索走向普適性的量化通則'
    }
  }
};

export const Table42MajorDesignsViewer: React.FC<Table42MajorDesignsViewerProps> = ({
  onAskGemini,
  onSelectDesign
}) => {
  const [activeDesignId, setActiveDesignId] = useState<MajorDesignId>('triangulation');
  const [viewMode, setViewModeState] = useState<'decision_tree' | 'table_view' | 'deep_dive'>('decision_tree');
  // 一頁式：三個區塊依序排開，按鈕改為跳到對應區塊
  const setViewMode = (k: 'decision_tree' | 'table_view' | 'deep_dive') => {
    setViewModeState(k);
    document.getElementById(`t42-${k}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // Wizard state for interactive 2-step decision
  const [wizardTiming, setWizardTiming] = useState<'concurrent' | 'sequential_quan_qual' | 'sequential_qual_quan' | null>(null);
  const [wizardWeight, setWizardWeight] = useState<'equal' | 'unequal' | null>(null);
  const [wizardResult, setWizardResult] = useState<MajorDesignId | null>(null);
  const [selectedSubVariant, setSelectedSubVariant] = useState<string | null>(null);

  // Auto-calculate wizard decision based on timing & weight
  const handleWizardSelectTiming = (val: 'concurrent' | 'sequential_quan_qual' | 'sequential_qual_quan') => {
    setWizardTiming(val);
    if (val === 'sequential_quan_qual') {
      setWizardResult('explanatory');
      setActiveDesignId('explanatory');
    } else if (val === 'sequential_qual_quan') {
      setWizardResult('exploratory');
      setActiveDesignId('exploratory');
    } else if (val === 'concurrent' && wizardWeight) {
      const res = wizardWeight === 'equal' ? 'triangulation' : 'embedded';
      setWizardResult(res);
      setActiveDesignId(res);
    }
  };

  const handleWizardSelectWeight = (val: 'equal' | 'unequal') => {
    setWizardWeight(val);
    if (wizardTiming === 'concurrent') {
      const res = val === 'equal' ? 'triangulation' : 'embedded';
      setWizardResult(res);
      setActiveDesignId(res);
    }
  };

  const resetWizard = () => {
    setWizardTiming(null);
    setWizardWeight(null);
    setWizardResult(null);
    setSelectedSubVariant(null);
  };

  const currentDesign = TABLE_4_2_DESIGNS[activeDesignId];

  return (
    <div className="space-y-6">
      {/* Golden Warning Banner: "先決定哪一種，不是直接三角校正！" */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 space-y-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center shrink-0">
            <Lightbulb className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <h3 className="font-bold text-sm sm:text-base text-slate-900 flex items-center gap-2">
              <span>先決定四大主要設計類型，再談三角校正等變型</span>
            </h3>
            <p className="text-xs text-slate-500">
              依據 Creswell & Plano Clark 經典教材《表 4.2 主要的混合方法設計類型》，先依「時機」、「權重」、「混合方式」決定大類，再深入子變型。
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-[11px]">
          <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-200 border-l-4 border-l-amber-400">
            <div className="font-bold text-amber-700">1. 三角校正</div>
            <div className="text-slate-600">同時進行 • 通常等重 • QUAN + QUAL</div>
          </div>
          <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-200 border-l-4 border-l-sky-400">
            <div className="font-bold text-sky-700">2. 嵌入式</div>
            <div className="text-slate-600">同時或連續 • 不相等 • QUAN(qual)</div>
          </div>
          <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-200 border-l-4 border-l-emerald-400">
            <div className="font-bold text-emerald-700">3. 解釋式</div>
            <div className="text-slate-600">連續(先量後質) • 強調量 • QUAN ➔ qual</div>
          </div>
          <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-200 border-l-4 border-l-violet-400">
            <div className="font-bold text-violet-700">4. 探索式</div>
            <div className="text-slate-600">連續(先質後量) • 強調質 • QUAL ➔ quan</div>
          </div>
        </div>
      </div>

      {/* View Switcher: Interactive Wizard vs Table 4.2 Matrix vs Deep Dive */}
      <div className="flex items-center justify-between flex-wrap gap-2 border-b border-slate-200 pb-3">
        <div className="flex items-center gap-1.5 bg-slate-200/60 p-1 rounded-xl text-xs font-semibold text-slate-700">
          <button
            onClick={() => setViewMode('decision_tree')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              viewMode === 'decision_tree'
                ? 'bg-white text-indigo-700 shadow-xs font-bold'
                : 'hover:text-slate-900'
            }`}
          >
            <Compass className="w-3.5 h-3.5 text-indigo-600" />
            <span>兩步驟決策精靈 (先定大類 ➔ 再定變型)</span>
          </button>

          <button
            onClick={() => setViewMode('table_view')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              viewMode === 'table_view'
                ? 'bg-white text-indigo-700 shadow-xs font-bold'
                : 'hover:text-slate-900'
            }`}
          >
            <Binary className="w-3.5 h-3.5 text-amber-600" />
            <span>表 4.2 矩陣全景表</span>
          </button>

          <button
            onClick={() => setViewMode('deep_dive')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              viewMode === 'deep_dive'
                ? 'bg-white text-indigo-700 shadow-xs font-bold'
                : 'hover:text-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-purple-600" />
            <span>四大設計深度圖解剖析</span>
          </button>
        </div>

        {onAskGemini && (
          <button
            onClick={() => onAskGemini('請依據 Creswell 表 4.2，向我詳細說明研究者在選擇混合方法時，為什麼必須「先決定哪一種主要設計類型，而不是直接跳入三角校正」？')}
            className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1 bg-indigo-50 px-2.5 py-1.5 rounded-lg border border-indigo-200 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>問 Gemini 決策原則</span>
          </button>
        )}
      </div>

      {/* MODE 1: Interactive Two-Step Decision Wizard */}
      <div id="t42-decision_tree" />
      {true && (
        <div className="space-y-5 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div className="space-y-1">
            <h4 className="font-bold text-sm sm:text-base text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs">1</span>
              <span>第一步驟：根據研究資源與時序，決定四大主要設計類型 (Major Design)</span>
            </h4>
            <p className="text-xs text-slate-500">
              回答以下關鍵維度，系統將自動依據 Creswell 規範推導出您的研究大類：
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Question 1: Timing */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2.5">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-indigo-600" />
                <span>維度一：量化與質性資料的「時機 (Timing)」？</span>
              </label>
              <div className="space-y-1.5">
                <button
                  type="button"
                  onClick={() => handleWizardSelectTiming('concurrent')}
                  className={`w-full p-2.5 rounded-xl border text-left text-xs transition-all flex items-center justify-between ${
                    wizardTiming === 'concurrent'
                      ? 'border-indigo-600 bg-indigo-50/70 text-indigo-900 font-semibold shadow-2xs'
                      : 'border-slate-200 bg-white hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  <div>
                    <div className="font-bold">A. 同時進行 (Concurrent)</div>
                    <div className="text-[11px] text-slate-500">在相同時間窗口內同步執行量化與質性採集</div>
                  </div>
                  {wizardTiming === 'concurrent' && <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />}
                </button>

                <button
                  type="button"
                  onClick={() => handleWizardSelectTiming('sequential_quan_qual')}
                  className={`w-full p-2.5 rounded-xl border text-left text-xs transition-all flex items-center justify-between ${
                    wizardTiming === 'sequential_quan_qual'
                      ? 'border-emerald-600 bg-emerald-50/70 text-emerald-900 font-semibold shadow-2xs'
                      : 'border-slate-200 bg-white hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  <div>
                    <div className="font-bold">B. 先量化 ➔ 後質性 (先量後質)</div>
                    <div className="text-[11px] text-slate-500">先跑大樣本統計，再用質性個案解釋異常因果</div>
                  </div>
                  {wizardTiming === 'sequential_quan_qual' && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
                </button>

                <button
                  type="button"
                  onClick={() => handleWizardSelectTiming('sequential_qual_quan')}
                  className={`w-full p-2.5 rounded-xl border text-left text-xs transition-all flex items-center justify-between ${
                    wizardTiming === 'sequential_qual_quan'
                      ? 'border-purple-600 bg-purple-50/70 text-purple-900 font-semibold shadow-2xs'
                      : 'border-slate-200 bg-white hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  <div>
                    <div className="font-bold">C. 先質性 ➔ 後量化 (先質後量)</div>
                    <div className="text-[11px] text-slate-500">先訪談探索概念並發展指標，再進行量化檢驗</div>
                  </div>
                  {wizardTiming === 'sequential_qual_quan' && <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0" />}
                </button>
              </div>
            </div>

            {/* Question 2: Weight */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2.5">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Scale className="w-4 h-4 text-amber-600" />
                <span>維度二：量化與質性資料的「權重 (Weight)」？</span>
              </label>

              {wizardTiming === 'concurrent' ? (
                <div className="space-y-1.5">
                  <button
                    type="button"
                    onClick={() => handleWizardSelectWeight('equal')}
                    className={`w-full p-2.5 rounded-xl border text-left text-xs transition-all flex items-center justify-between ${
                      wizardWeight === 'equal'
                        ? 'border-amber-600 bg-amber-50/70 text-amber-900 font-semibold shadow-2xs'
                        : 'border-slate-200 bg-white hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <div>
                      <div className="font-bold">A. 通常是相等的 (Equal Weight)</div>
                      <div className="text-[11px] text-slate-500">量化與質性同等重視，地位對等 (QUAN + QUAL)</div>
                    </div>
                    {wizardWeight === 'equal' && <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleWizardSelectWeight('unequal')}
                    className={`w-full p-2.5 rounded-xl border text-left text-xs transition-all flex items-center justify-between ${
                      wizardWeight === 'unequal'
                        ? 'border-blue-600 bg-blue-50/70 text-blue-900 font-semibold shadow-2xs'
                        : 'border-slate-200 bg-white hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <div>
                      <div className="font-bold">B. 不相等的 (Unequal: 一主一次)</div>
                      <div className="text-[11px] text-slate-500">將次要型態嵌入主要研究骨架中 (QUAN(qual) 或 QUAL(quan))</div>
                    </div>
                    {wizardWeight === 'unequal' && <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />}
                  </button>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-white border border-slate-200 text-xs text-slate-500 flex flex-col justify-center h-[132px]">
                  {wizardTiming === 'sequential_quan_qual' ? (
                    <div>
                      <span className="font-bold text-emerald-700">自動推定：通常強調量化</span>
                      <p className="mt-1">因為是「先量後質」，第一階段的大規模統計通常佔據主導地位，質性用於解釋。</p>
                    </div>
                  ) : wizardTiming === 'sequential_qual_quan' ? (
                    <div>
                      <span className="font-bold text-purple-700">自動推定：通常強調質性</span>
                      <p className="mt-1">因為是「先質後量」，第一階段探索出的理論框架為研究核心，量化用於後續驗證。</p>
                    </div>
                  ) : (
                    <span className="italic">請先在左側選擇「時機」...</span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Step 1 Decision Result Card */}
          {wizardResult && (
            <div className={`p-5 rounded-2xl border-2 transition-all space-y-4 animate-in fade-in duration-200 bg-gradient-to-r ${TABLE_4_2_DESIGNS[wizardResult].bgGradient} ${TABLE_4_2_DESIGNS[wizardResult].borderTheme}`}>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                    {wizardResult === 'triangulation' ? '1' : wizardResult === 'embedded' ? '2' : wizardResult === 'explanatory' ? '3' : '4'}
                  </div>
                  <div>
                    <div className="text-[11px] uppercase tracking-wider font-bold text-slate-600">
                      第一步驟判定結果：您的研究主要設計類型為
                    </div>
                    <div className="text-base sm:text-lg font-extrabold text-slate-900 flex items-center gap-2">
                      <span>{TABLE_4_2_DESIGNS[wizardResult].name}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full font-mono font-bold bg-white/90 border border-black/10 shadow-2xs">
                        {TABLE_4_2_DESIGNS[wizardResult].notation}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={resetWizard}
                  className="px-3 py-1.5 rounded-lg bg-white/80 hover:bg-white text-xs font-semibold text-slate-700 border border-slate-300 transition-colors flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>重置決策條件</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                <div className="bg-white/80 p-3 rounded-xl border border-black/5">
                  <span className="text-slate-500 font-medium">時機判定：</span>
                  <div className="font-bold text-slate-900 mt-0.5">{TABLE_4_2_DESIGNS[wizardResult].timing}</div>
                </div>
                <div className="bg-white/80 p-3 rounded-xl border border-black/5">
                  <span className="text-slate-500 font-medium">權重分配：</span>
                  <div className="font-bold text-slate-900 mt-0.5">{TABLE_4_2_DESIGNS[wizardResult].weight}</div>
                </div>
                <div className="bg-white/80 p-3 rounded-xl border border-black/5">
                  <span className="text-slate-500 font-medium">混合機制：</span>
                  <div className="font-bold text-slate-900 mt-0.5">{TABLE_4_2_DESIGNS[wizardResult].mixing}</div>
                </div>
              </div>

              {/* Step 2: Now select sub-variant */}
              <div className="pt-2 border-t border-black/10 space-y-2.5">
                <div className="flex items-center justify-between">
                  <h5 className="font-bold text-xs sm:text-sm text-slate-900 flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px]">2</span>
                    <span>第二步驟：在此大類下，進一步選擇符合您研究特性的「具體變型 (Variant)」</span>
                  </h5>
                  <span className="text-[11px] text-slate-500">
                    共有 {TABLE_4_2_DESIGNS[wizardResult].variants.length} 種變型可選
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {TABLE_4_2_DESIGNS[wizardResult].variants.map((v, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedSubVariant(v.name)}
                      className={`p-3.5 rounded-xl border text-left transition-all space-y-1.5 ${
                        selectedSubVariant === v.name
                          ? 'border-slate-900 bg-white shadow-md ring-2 ring-slate-900'
                          : 'border-white/80 bg-white/70 hover:bg-white text-slate-800'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                          <span>{v.name}</span>
                          {v.isPaperExample && (
                            <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-400 text-slate-950">
                              論文典範
                            </span>
                          )}
                        </div>
                        {selectedSubVariant === v.name && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                      </div>
                      <p className="text-[11px] text-slate-600 leading-relaxed">
                        {v.desc}
                      </p>
                      <div className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-[10px] text-slate-600">
                        <span className="font-semibold text-indigo-700">台股 FinMind 應用：</span>
                        <span>{v.sampleFinmind}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Consultation Trigger */}
              {onAskGemini && (
                <div className="flex items-center justify-between pt-2">
                  <div className="text-xs text-slate-600">
                    已完成兩步驟判定：<strong>{TABLE_4_2_DESIGNS[wizardResult].name}</strong>
                    {selectedSubVariant ? ` ➔ 【${selectedSubVariant}】` : ''}
                  </div>
                  <button
                    onClick={() => onAskGemini(`請依據 Creswell 表 4.2，向我詳細說明我的研究為何屬於「${TABLE_4_2_DESIGNS[wizardResult].name}」${selectedSubVariant ? `下的「${selectedSubVariant}」` : ''}？請提供具體的研究架構步驟與論文寫作建議。`)}
                    className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>請 Gemini 出具此架構設計企劃 ➔</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* MODE 2: Comprehensive Table 4.2 Matrix View (verbatim from the textbook) */}
      <div id="t42-table_view" />
      {true && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/80 flex items-center justify-between">
            <div>
              <h4 className="font-bold text-sm sm:text-base text-slate-900 flex items-center gap-2">
                <span>表 4.2 主要的混合方法設計類型</span>
                <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-indigo-100 text-indigo-800">
                  Creswell & Plano Clark 經典權威矩陣
                </span>
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                完整收錄教科書原始 4 大設計類型、子變型、時機、權重、混合階段與標準符號記法
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-100/70 text-slate-700 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4 w-[14%]">設計類型</th>
                  <th className="py-3 px-4 w-[24%]">變型 (Variants)</th>
                  <th className="py-3 px-4 w-[18%]">時機 (Timing)</th>
                  <th className="py-3 px-4 w-[14%]">權重 (Weight)</th>
                  <th className="py-3 px-4 w-[20%]">混合 (Mixing)</th>
                  <th className="py-3 px-4 w-[10%]">符號 (Notation)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-sans">
                {/* Row 1: 三角校正 */}
                <tr className={`hover:bg-amber-50/40 transition-colors ${activeDesignId === 'triangulation' ? 'bg-amber-50/60 font-medium' : ''}`}>
                  <td className="py-3.5 px-4 font-bold text-amber-950 align-top">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                      <span>三角校正</span>
                    </div>
                    <div className="text-[10px] text-amber-700 font-normal mt-0.5">Triangulation</div>
                  </td>
                  <td className="py-3.5 px-4 align-top space-y-1">
                    <div className="flex items-center gap-1.5">• 聚斂</div>
                    <div className="flex items-center gap-1.5 text-indigo-700 font-semibold">
                      <span>• 資料轉化</span>
                      <span className="text-[9px] px-1 py-0.2 rounded bg-amber-300 text-slate-950">論文典範</span>
                    </div>
                    <div className="flex items-center gap-1.5">• 證實量化資料</div>
                    <div className="flex items-center gap-1.5">• 多層次</div>
                  </td>
                  <td className="py-3.5 px-4 align-top text-slate-700">
                    <span className="font-semibold text-slate-900">同時的</span>：在相同時間執行量化與質性
                  </td>
                  <td className="py-3.5 px-4 align-top text-slate-700">
                    通常是相等的
                  </td>
                  <td className="py-3.5 px-4 align-top text-slate-700">
                    在解釋或分析階段合併資料
                  </td>
                  <td className="py-3.5 px-4 align-top font-mono font-bold text-indigo-700">
                    QUAN + QUAL
                  </td>
                </tr>

                {/* Row 2: 嵌入式 */}
                <tr className={`hover:bg-blue-50/40 transition-colors ${activeDesignId === 'embedded' ? 'bg-blue-50/60 font-medium' : ''}`}>
                  <td className="py-3.5 px-4 font-bold text-blue-950 align-top">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                      <span>嵌入式</span>
                    </div>
                    <div className="text-[10px] text-blue-700 font-normal mt-0.5">Embedded</div>
                  </td>
                  <td className="py-3.5 px-4 align-top space-y-1">
                    <div>• 嵌入式實驗式</div>
                    <div>• 嵌入式相關式</div>
                  </td>
                  <td className="py-3.5 px-4 align-top text-slate-700">
                    同時的或連續的
                  </td>
                  <td className="py-3.5 px-4 align-top text-slate-700">
                    不相等的 (一主一次)
                  </td>
                  <td className="py-3.5 px-4 align-top text-slate-700">
                    將一種類型的資料嵌入到一個較大的、使用另一種類型資料的設計之內
                  </td>
                  <td className="py-3.5 px-4 align-top font-mono font-bold text-blue-700">
                    QUAN (qual)<br/>或 QUAL (quan)
                  </td>
                </tr>

                {/* Row 3: 解釋式 */}
                <tr className={`hover:bg-emerald-50/40 transition-colors ${activeDesignId === 'explanatory' ? 'bg-emerald-50/60 font-medium' : ''}`}>
                  <td className="py-3.5 px-4 font-bold text-emerald-950 align-top">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      <span>解釋式</span>
                    </div>
                    <div className="text-[10px] text-emerald-700 font-normal mt-0.5">Explanatory</div>
                  </td>
                  <td className="py-3.5 px-4 align-top space-y-1">
                    <div>• 追蹤的解釋模式</div>
                    <div>• 參與者選擇模式</div>
                  </td>
                  <td className="py-3.5 px-4 align-top text-slate-700">
                    <span className="font-semibold text-slate-900">連續的</span>：先量化，後質性
                  </td>
                  <td className="py-3.5 px-4 align-top text-slate-700">
                    通常強調量化
                  </td>
                  <td className="py-3.5 px-4 align-top text-slate-700">
                    連結兩個階段的資料
                  </td>
                  <td className="py-3.5 px-4 align-top font-mono font-bold text-emerald-700">
                    QUAN ➔ qual
                  </td>
                </tr>

                {/* Row 4: 探索式 */}
                <tr className={`hover:bg-purple-50/40 transition-colors ${activeDesignId === 'exploratory' ? 'bg-purple-50/60 font-medium' : ''}`}>
                  <td className="py-3.5 px-4 font-bold text-purple-950 align-top">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                      <span>探索式</span>
                    </div>
                    <div className="text-[10px] text-purple-700 font-normal mt-0.5">Exploratory</div>
                  </td>
                  <td className="py-3.5 px-4 align-top space-y-1">
                    <div>• 工具發展模式</div>
                    <div>• 分類發展模式</div>
                  </td>
                  <td className="py-3.5 px-4 align-top text-slate-700">
                    <span className="font-semibold text-slate-900">連續的</span>：先質性，後量化
                  </td>
                  <td className="py-3.5 px-4 align-top text-slate-700">
                    通常強調質性
                  </td>
                  <td className="py-3.5 px-4 align-top text-slate-700">
                    連結兩個階段的資料
                  </td>
                  <td className="py-3.5 px-4 align-top font-mono font-bold text-purple-700">
                    QUAL ➔ quan
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="p-4 bg-slate-50 border-t border-slate-200 text-xs text-slate-600 flex items-center justify-between">
            <div>
              符號規範：大寫（如 <strong>QUAN / QUAL</strong>）代表主權重；小寫（如 <strong>quan / qual</strong>）代表次權重；加號（<strong>+</strong>）代表同時並行；箭頭（<strong>➔</strong>）代表連續遞進。
            </div>
            <button
              onClick={() => setViewMode('decision_tree')}
              className="text-indigo-600 hover:text-indigo-800 font-bold shrink-0 ml-4"
            >
              進入兩步驟推導精靈 ➔
            </button>
          </div>
        </div>
      )}

      {/* MODE 3: Deep Dive into the 4 Major Designs */}
      <div id="t42-deep_dive" />
      {true && (
        <div className="space-y-4">
          {/* Design Selectors */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {(Object.keys(TABLE_4_2_DESIGNS) as MajorDesignId[]).map((key) => {
              const d = TABLE_4_2_DESIGNS[key];
              const isSelected = activeDesignId === key;
              return (
                <button
                  key={key}
                  onClick={() => setActiveDesignId(key)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    isSelected
                      ? `bg-white ${d.borderTheme} shadow-md ring-2 ring-indigo-500`
                      : 'bg-white/80 border-slate-200 hover:bg-white text-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${d.badgeColor}`}>
                      {d.notation}
                    </span>
                    {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />}
                  </div>
                  <div className="font-bold text-xs text-slate-900 mt-1">
                    {d.name}
                  </div>
                  <div className="text-[10px] text-slate-500 truncate">
                    {d.timing.split('：')[0]}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Detailed Selected Design Card */}
          <div className={`p-6 rounded-2xl border-2 bg-gradient-to-r ${currentDesign.bgGradient} ${currentDesign.borderTheme} shadow-sm space-y-5 animate-in fade-in duration-200`}>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-black/10 pb-4">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                  {currentDesign.enName}
                </span>
                <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                  <span>{currentDesign.name}</span>
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-white border border-black/10">
                    {currentDesign.notation}
                  </span>
                </h3>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <span className="px-2.5 py-1 rounded-lg bg-white/90 font-medium text-slate-700 border border-black/5">
                  時機：{currentDesign.timing}
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-white/90 font-medium text-slate-700 border border-black/5">
                  權重：{currentDesign.weight}
                </span>
              </div>
            </div>

            {/* Core Logic & Flow Steps */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="space-y-3">
                <div className="bg-white/80 p-4 rounded-xl border border-black/5 space-y-1">
                  <div className="font-bold text-slate-900 flex items-center gap-1.5 text-xs">
                    <Compass className="w-4 h-4 text-indigo-600" />
                    <span>核心機制與設計理念：</span>
                  </div>
                  <p className="text-slate-600 leading-relaxed">
                    {currentDesign.coreLogic}
                  </p>
                </div>

                <div className="bg-white/80 p-4 rounded-xl border border-black/5 space-y-1">
                  <div className="font-bold text-slate-900 flex items-center gap-1.5 text-xs">
                    <Lightbulb className="w-4 h-4 text-amber-600" />
                    <span>適用時機 (When to Use)：</span>
                  </div>
                  <p className="text-slate-600 leading-relaxed">
                    {currentDesign.whenToUse}
                  </p>
                </div>
              </div>

              {/* Visual Flow diagram steps */}
              <div className="bg-white/90 p-4 rounded-xl border border-black/5 space-y-2.5 flex flex-col justify-center">
                <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                  <Workflow className="w-4 h-4 text-indigo-600" />
                  <span>資料整合與推進歷程：</span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 font-medium text-slate-800">
                    <span className="text-indigo-600 font-bold mr-1">階段 1：</span>
                    {currentDesign.diagramSteps.phase1}
                  </div>

                  {currentDesign.diagramSteps.phase2 && (
                    <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 font-medium text-slate-800">
                      <span className="text-purple-600 font-bold mr-1">階段 2：</span>
                      {currentDesign.diagramSteps.phase2}
                    </div>
                  )}

                  <div className="p-2.5 rounded-lg bg-indigo-50 border border-indigo-200 font-medium text-indigo-900">
                    <span className="text-indigo-700 font-bold mr-1">整合點：</span>
                    {currentDesign.diagramSteps.integration}
                  </div>

                  <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 font-bold text-emerald-950">
                    <span className="text-emerald-700 font-bold mr-1">最終推論：</span>
                    {currentDesign.diagramSteps.outcome}
                  </div>
                </div>
              </div>
            </div>

            {/* Sub-variants breakdown */}
            <div className="space-y-2.5 pt-2">
              <div className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                <Binary className="w-4 h-4 text-slate-700" />
                <span>此大類收錄之所有子變型 (Variants)：</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {currentDesign.variants.map((v, idx) => (
                  <div key={idx} className="bg-white/90 p-4 rounded-xl border border-black/5 space-y-1.5 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-slate-900 text-xs">
                        {v.name}
                      </div>
                      {v.isPaperExample && (
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-400 text-slate-950">
                          Raman 論文典範
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      {v.desc}
                    </p>
                    <div className="pt-1 text-[10px] text-slate-500 border-t border-slate-100">
                      <span className="font-semibold text-indigo-700">台股案例：</span>
                      <span>{v.sampleFinmind}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
