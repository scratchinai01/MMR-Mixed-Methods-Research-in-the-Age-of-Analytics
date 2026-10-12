import React, { useState, useRef } from 'react';
import { 
  X, 
  UploadCloud, 
  FileText, 
  Sparkles, 
  Loader2, 
  CheckCircle2, 
  AlertCircle, 
  Copy, 
  Check, 
  Download, 
  RefreshCw, 
  BookOpen, 
  FileUp, 
  Layers, 
  Cpu, 
  ArrowRight,
  Workflow,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  HelpCircle,
  BarChart3,
  TableProperties,
  Scale,
  Clock,
  Lightbulb,
  History
} from 'lucide-react';
import { TriangulationAbcdeViewer } from './TriangulationAbcdeViewer.tsx';
import { Table42MajorDesignsViewer } from './Table42MajorDesignsViewer.tsx';
import { MarkdownReportViewer } from './MarkdownReportViewer.tsx';
import { ExplanatoryVsExploratoryDiagram } from './ExplanatoryVsExploratoryDiagram.tsx';
import { analysisStorage, AnalysisRecord } from '../services/analysisStorage.ts';
import { AnalysisHistoryDrawer } from './AnalysisHistoryDrawer.tsx';
import { callAiApi } from '../services/aiHelper.ts';
import { saveFollowupToFirestore } from '../services/firebase.ts';
import { MathRenderer } from './MathRenderer.tsx';

interface PaperUploadAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAskGeminiFollowup?: (question: string) => void;
}

// ── 設計類型的顯示資料（Creswell & Plano Clark 表 4.2） ──
type DesignId = 'triangulation' | 'embedded' | 'explanatory' | 'exploratory' | 'unclear';

function describeDesign(id: string) {
  const table: Record<DesignId, { id: DesignId; name: string; notation: string; timing: string; weight: string; theme: string; badgeBg: string }> = {
    triangulation: { id: 'triangulation', name: '三角校正設計 (Triangulation Design)', notation: 'QUAN + QUAL', timing: '同時進行', weight: '通常相等', theme: 'bg-amber-50 border-amber-300 text-amber-950', badgeBg: 'bg-amber-500 text-slate-950' },
    embedded: { id: 'embedded', name: '嵌入式設計 (Embedded Design)', notation: 'QUAN (qual) / QUAL (quan)', timing: '同時或連續', weight: '不相等 (一主一次)', theme: 'bg-blue-50 border-blue-300 text-blue-950', badgeBg: 'bg-blue-600 text-white' },
    explanatory: { id: 'explanatory', name: '解釋式設計 (Explanatory Design)', notation: 'QUAN ➔ qual', timing: '連續時序 (先量後質)', weight: '通常強調量化', theme: 'bg-emerald-50 border-emerald-300 text-emerald-950', badgeBg: 'bg-emerald-600 text-white' },
    exploratory: { id: 'exploratory', name: '探索式設計 (Exploratory Design)', notation: 'QUAL ➔ quan', timing: '連續時序 (先質後量)', weight: '通常強調質性', theme: 'bg-purple-50 border-purple-300 text-purple-950', badgeBg: 'bg-purple-600 text-white' },
    unclear: { id: 'unclear', name: '未能明確判定', notation: '—', timing: '—', weight: '—', theme: 'bg-slate-50 border-slate-300 text-slate-900', badgeBg: 'bg-slate-600 text-white' },
  };
  return table[(id as DesignId)] || table.unclear;
}

/** 沒有 AI 判定時的備用推測：找報告中「判定為／屬於 XX 設計」的句子，而不是只要出現詞彙就算 */
function guessDesignType(text: string): DesignId {
  const patterns: Array<[DesignId, RegExp]> = [
    ['triangulation', /(判定|屬於|歸類為|為)[^。\n]{0,12}三角校正/],
    ['embedded', /(判定|屬於|歸類為|為)[^。\n]{0,12}嵌入式/],
    ['explanatory', /(判定|屬於|歸類為|為)[^。\n]{0,12}解釋式/],
    ['exploratory', /(判定|屬於|歸類為|為)[^。\n]{0,12}探索式/],
  ];
  const hits = patterns.filter(([, re]) => re.test(text));
  return hits.length === 1 ? hits[0][0] : 'unclear';
}

export const PaperUploadAnalysisModal: React.FC<PaperUploadAnalysisModalProps> = ({
  isOpen,
  onClose,
  onAskGeminiFollowup
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [fileBase64, setFileBase64] = useState<string | null>(null);
  const [fileText, setFileText] = useState<string>('');
  const [pastedText, setPastedText] = useState<string>('');
  const [focusTopic, setFocusTopic] = useState<string>('表 4.2 四大主要設計類型判定 ➔ 次級變型推導 (先定大類再定變型)');
  const [uploadMode, setUploadMode] = useState<'file' | 'paste' | 'preset'>('file');

  const [loading, setLoading] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [analyzedFileName, setAnalyzedFileName] = useState<string>('');
  const [analyzedModelUsed, setAnalyzedModelUsed] = useState<string>('Gemini 3.1 Flash / 3.8 Flash (即時線上推理)');
  const [analyzedLatencyMs, setAnalyzedLatencyMs] = useState<number | undefined>(undefined);
  // AI 從報告萃取的結構化判定（設計類型、子變型、各階段實際做法）；沒有時改用文字推測並標示
  const [verdict, setVerdict] = useState<any | null>(null);
  // true = 沒有呼叫到 Gemini，報告是內建範本
  const [isFallbackReport, setIsFallbackReport] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  // History Drawer state
  const [historyOpen, setHistoryOpen] = useState<boolean>(false);

  // Guide toggle and mode: 'table42' (Major Designs) or 'abcde' (Triangulation Variants)
  const [showGuide, setShowGuide] = useState<boolean>(false);
  const [guideMode, setGuideMode] = useState<'table42' | 'abcde'>('table42');

  // In-modal follow-up Q&A
  const [followupLoading, setFollowupLoading] = useState<boolean>(false);
  const [followupQas, setFollowupQas] = useState<Array<{ q: string; a: string }>>([]);
  const [customQuestion, setCustomQuestion] = useState<string>('');
  const [currentRecordId, setCurrentRecordId] = useState<string | null>(null);

  // PhD Skills Showcase Drawer / Modal state
  const [showSkillsModal, setShowSkillsModal] = useState<boolean>(false);
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null);

  // Checked Skills Checklist state for joint diagnosis
  const [checkedSkillCodes, setCheckedSkillCodes] = useState<string[]>([
    '/MMR判定', '/MMR類型', '/QUANQUAL比例', '/MMR整合度', '/計量架構', '/預期踏車效應'
  ]);
  const [showSkillsChecklist, setShowSkillsChecklist] = useState<boolean>(true);

  const toggleSkillCheck = (code: string) => {
    if (checkedSkillCodes.includes(code)) {
      setCheckedSkillCodes(checkedSkillCodes.filter(c => c !== code));
    } else {
      setCheckedSkillCodes([...checkedSkillCodes, code]);
    }
  };

  const handleSelectAllSkills = () => {
    setCheckedSkillCodes(phdSkillsList.map(s => s.code));
  };

  const handleClearAllSkills = () => {
    setCheckedSkillCodes([]);
  };

  const phdSkillsList = [
    { id: '01', code: '/MMR判定', name: 'MMR判定', desc: '判斷文章是否屬於 Mixed Methods Research (MMR)', category: 'MMR 方法論', icon: '🎯' },
    { id: '02', code: '/MMR類型', name: 'MMR類型', desc: '判斷 Sequential / Concurrent / Embedded / Transformative 等設計', category: 'MMR 方法論', icon: '📐' },
    { id: '03', code: '/QUANQUAL比例', name: 'QUANQUAL比例', desc: '分析 QUAN : QUAL 比例與研究主導性 (例如 80:20 QUAN Dominant)', category: 'MMR 方法論', icon: '⚖️' },
    { id: '04', code: '/MMR整合度', name: 'MMR整合度', desc: '判斷量化與質化是否真正 Integration (資料、變數、分析與預測4層)', category: 'MMR 方法論', icon: '🔗' },
    { id: '05', code: '/MMR流程圖', name: 'MMR流程圖', desc: '自動畫出 QUAN ➔ QUAL ➔ Integration 研究流程與傳導鏈', category: '流程與圖表', icon: '📊' },
    { id: '06', code: '/MMR證據表', name: 'MMR證據表', desc: '找出文章中的量化、質化與整合證據段落與表列', category: '學術證據', icon: '📑' },
    { id: '07', code: '/SSCI判定', name: 'SSCI判定', desc: '判斷期刊是否收錄於 SSCI (Social Sciences Citation Index)', category: '期刊規格', icon: '🟢' },
    { id: '08', code: '/WoS查核', name: 'WoS查核', desc: '查核 Web of Science Core Collection 官方收錄狀態', category: '期刊規格', icon: '🔍' },
    { id: '09', code: '/IF查詢', name: 'IF查詢', desc: '查詢 Journal Impact Factor 最新數值 (如 2025 JIF = 31.0)', category: '期刊指標', icon: '📈' },
    { id: '10', code: '/IF年份', name: 'IF年份', desc: '判斷 IF 對應年度，避免引用錯誤年份 (2022 JIF 21.0 vs 2025 JIF 31.0)', category: '期刊指標', icon: '📅' },
    { id: '11', code: '/JCR分區', name: 'JCR分區', desc: '判斷 Q1 / Q2 / Q3 / Q4 及領域排名 (如 1/172)', category: '期刊指標', icon: '🏆' },
    { id: '12', code: '/期刊等級', name: '期刊等級', desc: '整理 SSCI、JCR、IF、分區等級之多維度總結', category: '期刊規格', icon: '⭐' },
    { id: '13', code: '/ABS判定', name: 'ABS判定', desc: '查核 ABS / AJG 2024 等級 (警示 JCR Q1 ≠ ABS 4*)', category: '商管分級', icon: '⚠️' },
    { id: '14', code: '/FT50判定', name: 'FT50判定', desc: '判斷是否屬 Financial Times 50 (FT50) 商管頂刊清單', category: '商管分級', icon: '🏛️' },
    { id: '15', code: '/論文可信度', name: '論文可信度', desc: '評估期刊權威度、作者機構、資料基礎與模型穩健性', category: '品質評鑑', icon: '🛡️' },
    { id: '16', code: '/變數對齊', name: '變數對齊', desc: '檢驗質化情緒特徵（Sentiment）與量化財務指標（Compustat）尺度與時序對齊', category: '特徵工程', icon: '🔄' },
    { id: '17', code: '/計量架構', name: '計量架構', desc: '檢核 GEE / 固定隨機效果 / 交互作用項之模型穩健性與內生性防禦', category: '計量模型', icon: '📈' },
    { id: '18', code: '/ML預測力', name: 'ML預測力', desc: '評估機器學習分類準確率增量 (ΔAccuracy: 70.7% ➔ 84.0%) 與混淆矩陣', category: '機器學習', icon: '🤖' },
    { id: '19', code: '/預期踏車效應', name: '預期踏車效應', desc: '剖析非線性交互項（-102.094）與市場預期透支（Priced to Perfection）機理', category: '因果機理', icon: '⚡' },
    { id: '20', code: '/博論寫作指引', name: '博論寫作指引', desc: '產出符合國際頂級期刊標準之方法論章節段落建議與口試口委答辯策略', category: '博士指引', icon: '🎓' }
  ];

  // 是否已有可分析的論文（上傳檔案、貼上文字或選了範例論文）
  const hasPaperInput = !!(file || fileBase64 || pastedText.trim() || fileText.trim());
  const [skillHint, setSkillHint] = useState<string | null>(null);

  // 點選快捷指令：已有論文時，立即「只用這個指令」評估上傳的論文；還沒有論文時提示先上傳
  const handleApplySkill = (skillCode: string) => {
    setSelectedSkill(skillCode);
    setFocusTopic(`【博士論文技能】：${skillCode}`);
    setShowSkillsModal(false);
    if (hasPaperInput) {
      setSkillHint(null);
      handleStartAnalysis([skillCode]);
    } else {
      if (!checkedSkillCodes.includes(skillCode)) setCheckedSkillCodes([...checkedSkillCodes, skillCode]);
      setSkillHint(`已選擇 ${skillCode}。請先上傳論文檔案或貼上內容，再按「開始 Gemini AI MMR 深度診斷」，就會以這個指令評估您的論文。`);
    }
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processSelectedFile(e.target.files[0]);
    }
  };

  const processSelectedFile = (selectedFile: File) => {
    setFile(selectedFile);
    const reader = new FileReader();

    if (selectedFile.type === 'application/pdf') {
      reader.onload = () => {
        const resultStr = reader.result as string;
        // Strip data:application/pdf;base64,
        const base64 = resultStr.split(',')[1];
        setFileBase64(base64);
        setFileText('');
      };
      reader.readAsDataURL(selectedFile);
    } else {
      reader.onload = () => {
        const text = reader.result as string;
        setFileText(text);
        setFileBase64(null);
      };
      reader.readAsText(selectedFile);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleSelectPreset = (presetType: 'gupta' | 'raman' | 'loughran' | 'tetlock') => {
    if (presetType === 'gupta') {
      setPastedText(`Influences of artificial intelligence and blockchain technology on financial resilience of supply chains
Authors: Shivam Gupta, Sachin Modgil, Tsan-Ming Choi, Ajay Kumar, Jiju Antony
Journal: International Journal of Production Economics (2023)

Abstract: Emerging technologies, such as artificial intelligence (AI) and blockchain technology (BT), have revolutionized business management, whereas financial resilience remains critical. Adopting a multi-methodological approach, we conduct an empirical and qualitative study to explore the relationship between AI, BT, and supply chain financial resilience. For data collection, 202 survey responses from supply chain professionals were collected to test the theoretical model using WarpPLS 6.0 (PLS-SEM), whereas the qualitative study collected responses from 25 supply chain professionals using semi-structured interviews and the grounded approach (open, axial, selective coding). Findings indicate that blockchain is stronger in facilitating financial resilience under environmental dynamism (ED), and qualitative analysis highlights AI in sensing, blockchain in seizing, and financial resilience in reconfiguring (Sense-Seize-Reconfigure framework).`);
      setFile(null);
      setFileBase64(null);
      setAnalyzedFileName('Gupta_et_al_2023_IJPE.pdf');
    } else if (presetType === 'raman') {
      setPastedText(`Mixed Methods Research in the Age of Analytics: An Exemplar Leveraging Sentiments from News Articles to Predict Firm Performance
Authors: Raji Raman, Ruba Aljafari, Viswanath Venkatesh, Vernon Richardson
Journal: International Journal of Information Management (2022)

Abstract: In an increasingly data-rich business environment, organizations face the dual challenge of interpreting structured financial performance metrics alongside unstructured qualitative data such as news reports. We propose a synergistic mixed-methods framework combining Generalized Estimating Equations (GEE) and machine learning algorithms. Using a panel dataset of S&P 500 firms and 2,500 Wall Street Journal articles analyzed with the Loughran-McDonald financial dictionary, we reveal that positive sentiments interact negatively with sales growth (beta = -102.094, p < 0.001) due to the expectation treadmill. Machine learning models demonstrate that incorporating textual sentiment significantly reduces prediction errors compared to quantitative-only models.`);
      setFile(null);
      setFileBase64(null);
      setAnalyzedFileName('Raman_et_al_2022_Exemplar.pdf');
    } else if (presetType === 'loughran') {
      setPastedText(`When Is a Liability Not a Liability? Textual Analysis, Dictionaries, and 10-Ks
Authors: Tim Loughran, Bill McDonald
Journal: The Journal of Finance (2011)

Abstract: Almost three-fourths of the words identified as negative by the widely used Harvard Dictionary are words not typically considered negative in financial contexts. We develop an alternative word list that better reflects tone in financial communications. We examine 10-K filings and link the newly constructed negative word counts to subsequent stock returns, trading volume, return volatility, and fraud occurrences, demonstrating significant incremental explanatory power beyond standard quantitative financial ratios.`);
      setFile(null);
      setFileBase64(null);
      setAnalyzedFileName('Loughran_McDonald_2011_JF.pdf');
    } else {
      setPastedText(`Giving Content to Investor Sentiment: The Role of Media in the Stock Market
Author: Paul C. Tetlock
Journal: The Journal of Finance (2007)

Abstract: This paper quantitatively measures the interactions between media pessimism and the stock market. Using daily content from the Wall Street Journal column "Abreast of the Market," the study tests whether high media pessimism predicts downward pressure on market prices, followed by a reversion to fundamentals. The results show that unusually high media pessimism reliably predicts downward pressure on prices, consistent with theories of noise and behavioral investor sentiment.`);
      setFile(null);
      setFileBase64(null);
      setAnalyzedFileName('Tetlock_2007_Journal_of_Finance.pdf');
    }
    setUploadMode('preset');
  };

  const handleStartAnalysis = async (skillsOverride?: string[]) => {
    // 單一快捷指令模式：只依這個指令評估；否則用勾選的多個指令做聯合診斷
    const skillsToUse = Array.isArray(skillsOverride) && skillsOverride.length > 0 ? skillsOverride : checkedSkillCodes;
    const skillDetails = skillsToUse.map((code) => {
      const sk = phdSkillsList.find((x) => x.code === code);
      return { code, name: sk?.name || code, desc: sk?.desc || '' };
    });
    const targetText = uploadMode === 'file' ? fileText : pastedText;
    let finalFileName = file ? file.name : (analyzedFileName || '');
    let finalTargetText = targetText;

    if (!file && !targetText.trim() && !fileBase64) {
      // Default to Raman et al. (2022) exemplar if user didn't upload or paste anything
      finalFileName = 'Raman_et_al_2022_Exemplar.pdf';
      finalTargetText = `Mixed Methods Research in the Age of Analytics: An Exemplar Leveraging Sentiments from News Articles to Predict Firm Performance
Authors: Raji Raman, Ruba Aljafari, Viswanath Venkatesh, Vernon Richardson
Journal: International Journal of Information Management (2022)

Abstract: In an increasingly data-rich business environment, organizations face the dual challenge of interpreting structured financial performance metrics alongside unstructured qualitative data such as news reports. We propose a synergistic mixed-methods framework combining Generalized Estimating Equations (GEE) and machine learning algorithms. Using a panel dataset of S&P 500 firms and 2,500 Wall Street Journal articles analyzed with the Loughran-McDonald financial dictionary, we reveal that positive sentiments interact negatively with sales growth (beta = -102.094, p < 0.001) due to the expectation treadmill. Machine learning models demonstrate that incorporating textual sentiment significantly reduces prediction errors compared to quantitative-only models.`;
      setAnalyzedFileName(finalFileName);
      setPastedText(finalTargetText);
    }

    setLoading(true);
    setAnalysisResult(null);
    setVerdict(null);
    setIsFallbackReport(false);

    // 貼上文字時不要沿用範例論文的名稱，避免 AI 把它當成 Raman et al. (2022)
    const fileNameToReport = file ? file.name : (uploadMode === 'paste' && !finalFileName ? '使用者貼上的論文內容' : (finalFileName || '使用者貼上的論文內容'));

    try {
      const data = await callAiApi('/api/gemini/analyze-paper', {
        fileName: fileNameToReport,
        fileType: file?.type || 'text/plain',
        fileBase64: fileBase64,
        textContent: finalTargetText,
        focusTopic,
        checkedSkills: skillsToUse,
        skillDetails,
        singleSkill: Array.isArray(skillsOverride) && skillsOverride.length === 1,
      });

      if (data && data.answer) {
        setAnalysisResult(data.answer);
        setAnalyzedFileName(fileNameToReport);
        if (data.modelUsed) setAnalyzedModelUsed(data.modelUsed);
        if (data.latencyMs) setAnalyzedLatencyMs(data.latencyMs);
        setVerdict(data.verdict || null);
        setIsFallbackReport(!!data.isFallback);

        // 歷史紀錄：以 AI 判定為準；沒有判定時才用報告文字推測
        const d = describeDesign(data.verdict?.designType || guessDesignType(data.answer));
        const savedRec = await analysisStorage.saveRecord({
          fileName: fileNameToReport,
          paperTitle: data.verdict?.paperTitle || fileNameToReport,
          majorDesignId: d.id,
          majorDesignName: d.name,
          subVariantName: data.verdict?.variant || '未判定',
          notation: d.notation,
          timing: d.timing,
          weight: d.weight,
          summary: data.answer.slice(0, 150) + '...',
          markdownReport: data.answer,
          diagramType: d.id,
        });
        if (savedRec && savedRec.id) {
          setCurrentRecordId(savedRec.id);
        }
      } else {
        setAnalysisResult('抱歉，解析論文時發生問題，請稍後重試。');
      }
    } catch (err: any) {
      setAnalysisResult(`分析論文發生錯誤：${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyResult = () => {
    if (!analysisResult) return;
    navigator.clipboard.writeText(analysisResult);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadMarkdown = () => {
    if (!analysisResult) return;
    const blob = new Blob([analysisResult], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `MMR_Analysis_${analyzedFileName || 'Paper'}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleAskFollowup = async (questionText: string) => {
    if (!questionText.trim() || followupLoading) return;
    const q = questionText.trim();
    setFollowupLoading(true);
    setCustomQuestion('');

    try {
      const response = await fetch('/api/gemini/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: q,
          context: `【受評論文】：${analyzedFileName || '學術論文'}\n【前次 MMR 診斷結論重點摘要】：\n${analysisResult?.slice(0, 1500) || ''}`,
          isFollowup: true,
        }),
      });
      const data = await response.json();
      if (data && data.answer) {
        setFollowupQas(prev => [...prev, { q, a: data.answer }]);
        
        // 1. If we have an existing analysis record ID, append to its followups
        if (currentRecordId) {
          await analysisStorage.appendFollowup(currentRecordId, {
            q,
            a: data.answer,
            modelUsed: data.modelUsed || 'Gemini'
          });
        } else {
          // 2. Otherwise save directly to Firebase followup_dialogues collection
          await saveFollowupToFirestore({
            sourceModule: 'paper_upload',
            topic: analyzedFileName || '論文診斷追問',
            question: q,
            answer: data.answer,
            modelUsed: data.modelUsed || 'Gemini',
          });
        }
      } else {
        setFollowupQas(prev => [...prev, { q, a: '抱歉，暫時無法取得延伸回答，請稍後再試。' }]);
      }
    } catch (e: any) {
      setFollowupQas(prev => [...prev, { q, a: `追問發生錯誤：${e.message}` }]);
    } finally {
      setFollowupLoading(false);
    }
  };

  // Detect both Tier 1 (Major Design) and Tier 2 (Sub-variant) from analysisResult
  const detectedAnalysis = (() => {
    if (!analysisResult) return null;
    // 優先使用 AI 結構化判定；沒有時才從報告文字推測（並在畫面上標示「推測」）
    if (verdict) {
      return { major: describeDesign(verdict.designType), variant: verdict.variant || '未判定', source: 'ai' as const };
    }
    return { major: describeDesign(guessDesignType(analysisResult)), variant: '（未能自動判定，請參考下方報告內文）', source: 'guess' as const };
  })();

  // 只有分析的正是 Gupta et al. (2023) 時，才顯示以該論文為例的固定對照圖
  const isGuptaPaper = /gupta/i.test(`${analyzedFileName} ${verdict?.paperTitle || ''}`);

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
        <div 
          className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden text-slate-800"
          onClick={(e) => e.stopPropagation()}
        >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-sm shadow-indigo-500/30">
              <UploadCloud className="w-5 h-5 text-amber-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white">
                  Gemini AI 論文混合方法研究 (MMR) 智慧診斷
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-slate-950">
                  圖 4.1 ABCDE 判定
                </span>
              </div>
              <p className="text-xs text-indigo-200/80">
                上傳任何學術論文 (PDF / TXT)，Gemini AI 自動判定研究範型、三角校正變型與量化質性整合深度
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowSkillsModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-600 hover:to-rose-700 text-white text-xs font-bold transition-all shadow-sm active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-200 animate-pulse" />
              <span>博士論文 15 大 Skills</span>
              <span className="text-[10px] px-1.5 py-0.2 bg-black/30 rounded-full font-mono">15項</span>
            </button>

            <button
              type="button"
              onClick={() => setHistoryOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-colors border border-white/15"
            >
              <History className="w-3.5 h-3.5 text-amber-300" />
              <span>分析歷史存檔庫</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* History Drawer */}
        <AnalysisHistoryDrawer 
          isOpen={historyOpen}
          onClose={() => setHistoryOpen(false)}
          onSelectRecord={(rec: AnalysisRecord) => {
            setAnalysisResult(rec.markdownReport);
            setAnalyzedFileName(rec.fileName);
            setVerdict(null);
            setIsFallbackReport(false);
          }}
        />

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 bg-slate-50/50 space-y-5">
          {/* 🎯 快捷指令 Skills 聯合勾選面板 */}
          <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-4 sm:p-5 border border-indigo-500/30 shadow-lg space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-bold text-xs shadow-xs">
                  ✓
                </span>
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                    <span>這裡 先勾選要用的快捷指令 (已勾選 {checkedSkillCodes.length} / 20 項)</span>
                  </h3>
                  <p className="text-[11px] text-indigo-200/80">
                    利用勾選的 skills 直接進行聯合診斷（如 /MMR判定、/計量架構、/預期踏車效應等）
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <button
                  type="button"
                  onClick={handleSelectAllSkills}
                  className="px-2.5 py-1 rounded bg-white/10 hover:bg-white/20 text-white font-medium transition-colors"
                >
                  全選 (20項)
                </button>
                <button
                  type="button"
                  onClick={handleClearAllSkills}
                  className="px-2.5 py-1 rounded bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white font-medium transition-colors"
                >
                  清空
                </button>
                <button
                  type="button"
                  onClick={() => setShowSkillsChecklist(!showSkillsChecklist)}
                  className="px-2.5 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-colors flex items-center gap-1"
                >
                  <span>{showSkillsChecklist ? '收合清單' : '展開清單'}</span>
                  {showSkillsChecklist ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {showSkillsChecklist && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-indigo-500/20 max-h-56 overflow-y-auto pr-1">
                {phdSkillsList.map((skill) => {
                  const isChecked = checkedSkillCodes.includes(skill.code);
                  return (
                    <button
                      key={skill.id}
                      type="button"
                      onClick={() => toggleSkillCheck(skill.code)}
                      className={`p-2.5 rounded-xl border text-left transition-all flex items-start gap-2 ${
                        isChecked
                          ? 'bg-indigo-600/30 border-indigo-400 text-white shadow-xs'
                          : 'bg-slate-800/60 border-slate-700/80 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}}
                        className="mt-0.5 rounded accent-indigo-500 cursor-pointer"
                      />
                      <div className="overflow-hidden">
                        <div className="text-xs font-bold text-white truncate flex items-center gap-1">
                          <span>{skill.icon}</span>
                          <span className="truncate">{skill.code}</span>
                        </div>
                        <div className="text-[10px] text-slate-300 truncate mt-0.5">
                          {skill.name}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex items-center justify-between flex-wrap gap-2 border-b border-slate-200 pb-3">
            <div className="flex items-center gap-1.5 bg-slate-200/60 p-1 rounded-xl text-xs font-semibold text-slate-600">
              <button
                onClick={() => setUploadMode('file')}
                className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                  uploadMode === 'file' ? 'bg-white text-indigo-700 shadow-xs' : 'hover:text-slate-900'
                }`}
              >
                <FileUp className="w-3.5 h-3.5" />
                <span>上傳論文檔案 (PDF/TXT)</span>
              </button>

              <button
                onClick={() => setUploadMode('paste')}
                className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                  uploadMode === 'paste' ? 'bg-white text-indigo-700 shadow-xs' : 'hover:text-slate-900'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>直接貼上論文內容/摘要</span>
              </button>

              <button
                onClick={() => setUploadMode('preset')}
                className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                  uploadMode === 'preset' ? 'bg-white text-indigo-700 shadow-xs' : 'hover:text-slate-900'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>經典範例一鍵載入</span>
              </button>
            </div>

            {/* Right Quick Controls: Focus Topic & Guide Toggle */}
            <div className="flex items-center gap-2 text-xs flex-wrap">
              <button
                type="button"
                onClick={() => setShowGuide(!showGuide)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                  showGuide
                    ? 'bg-gradient-to-r from-amber-500 to-rose-500 text-white border-transparent shadow-xs'
                    : 'bg-white border-slate-300 text-slate-800 hover:bg-slate-50'
                }`}
              >
                <TableProperties className="w-3.5 h-3.5" />
                <span>表 4.2 主要設計 & 變型手冊</span>
                {showGuide ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>

              <div className="flex items-center gap-1">
                <span className="text-slate-500 font-medium">焦點：</span>
                <select
                  value={focusTopic}
                  onChange={(e) => setFocusTopic(e.target.value)}
                  className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-800 focus:outline-hidden focus:border-indigo-500 max-w-xs font-medium"
                >
                  <optgroup label="🎓 博士論文｜MMR＋SSCI＋IF 20 個 Skills">
                    <option value="【博士論文技能】：/MMR判定 判斷是否屬於 Mixed Methods Research">01. /MMR判定 (MMR判定)</option>
                    <option value="【博士論文技能】：/MMR類型 判定 Sequential/Concurrent/Embedded/Transformative">02. /MMR類型 (四大設計類型)</option>
                    <option value="【博士論文技能】：/QUANQUAL比例 分析 QUAN:QUAL 比例與主導性">03. /QUANQUAL比例 (量質權重比重)</option>
                    <option value="【博士論文技能】：/MMR整合度 判斷量化與質化是否真正 Integration">04. /MMR整合度 (4層整合深度)</option>
                    <option value="【博士論文技能】：/MMR流程圖 自動畫出 QUAN ➔ QUAL ➔ Integration 流程鏈">05. /MMR流程圖 (雙軌傳導鏈)</option>
                    <option value="【博士論文技能】：/MMR證據表 找出文章中的量化、質化與整合證據">06. /MMR證據表 (正文引文證據)</option>
                    <option value="【博士論文技能】：/SSCI判定 判斷期刊是否收錄於 SSCI">07. /SSCI判定 (SSCI核心清單)</option>
                    <option value="【博士論文技能】：/WoS查核 查核 Web of Science Core Collection 狀態">08. /WoS查核 (WoS官方查核)</option>
                    <option value="【博士論文技能】：/IF查詢 查詢 Journal Impact Factor 最新數值 (31.0)">09. /IF查詢 (JIF最新指標)</option>
                    <option value="【博士論文技能】：/IF年份 判斷 IF 對應發表年度，避免年份混淆">10. /IF年份 (2022 vs 2025 JIF)</option>
                    <option value="【博士論文技能】：/JCR分區 判斷 Q1/Q2/Q3/Q4 及領域名次">11. /JCR分區 (JCR Q1 頂尖)</option>
                    <option value="【博士論文技能】：/期刊等級 整理 SSCI、JCR、IF、分區等級之多維度總結">12. /期刊等級 (多體系綜合等級)</option>
                    <option value="【博士論文技能】：/ABS判定 查核 ABS / AJG 2024 等級 (警示 JCR Q1 ≠ ABS 4*)">13. /ABS判定 (AJG 2024 = 2)</option>
                    <option value="【博士論文技能】：/FT50判定 判斷是否屬 Financial Times 50 商管頂刊">14. /FT50判定 (FT50資格審核)</option>
                    <option value="【博士論文技能】：/論文可信度 評估期刊權威、作者機構與資料模型穩健性">15. /論文可信度 (5星品質評估)</option>
                    <option value="【博士論文技能】：/變數對齊 檢驗質化情緒特徵與量化財務指標之尺度與時序對齊">16. /變數對齊 (雙軌特徵對齊)</option>
                    <option value="【博士論文技能】：/計量架構 檢核 GEE/固定隨機效果/交互項之穩健性與內生性防禦">17. /計量架構 (GEE與面板回歸)</option>
                    <option value="【博士論文技能】：/ML預測力 評估機器學習分類準確率增量 (ΔAccuracy) 與混淆矩陣">18. /ML預測力 (70.7%➔84.0%)</option>
                    <option value="【博士論文技能】：/預期踏車效應 剖析非線性交互項（-102.094）與預期透支機理">19. /預期踏車效應 (反直覺負係數)</option>
                    <option value="【博士論文技能】：/博論寫作指引 產出符合國際頂級期刊標準之方法論章節撰寫建議">20. /博論寫作指引 (頂刊寫作規範)</option>
                  </optgroup>
                  <optgroup label="📖 Creswell 經典方法論診斷">
                    <option value="表 4.2 四大主要設計類型判定 ➔ 次級變型推導 (先定大類再定變型)">表 4.2 四大主要設計 ➔ 次級變型推導 (推薦)</option>
                    <option value="Creswell 圖 4.1 三角校正設計 5 大變型 (ABCDE 型) 判定">圖 4.1 三角校正 ABCDE 變型判定</option>
                    <option value="研究範型定性 (QUAN / QUAL 權重分配與時序)">研究範型與權重定性 (QUAN/QUAL)</option>
                    <option value="空洞架構陷阱與元推論 (Meta-Inference) 深度評估">空洞架構診斷與元推論深度</option>
                    <option value="台股 FinMind 實務復刻可行性與微觀結構對齊">台股 FinMind 實務落地建議</option>
                  </optgroup>
                </select>
              </div>
            </div>
          </div>

          {/* Collapsible Reference Guide (Switch between Table 4.2 Major Designs vs ABCDE Variants) */}
          {showGuide && (
            <div className="p-4 sm:p-5 rounded-2xl bg-white border-2 border-indigo-200 shadow-sm space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between flex-wrap gap-2 border-b border-slate-200 pb-3">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500 text-white">
                    首要原則：先定大類
                  </span>
                  <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
                    <button
                      type="button"
                      onClick={() => setGuideMode('table42')}
                      className={`px-3 py-1 rounded-lg transition-colors flex items-center gap-1.5 ${
                        guideMode === 'table42' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <TableProperties className="w-3.5 h-3.5" />
                      <span>表 4.2 主要設計類型 (先定大類)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setGuideMode('abcde')}
                      className={`px-3 py-1 rounded-lg transition-colors flex items-center gap-1.5 ${
                        guideMode === 'abcde' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <Workflow className="w-3.5 h-3.5" />
                      <span>圖 4.1 三角校正子變型 (ABCDE)</span>
                    </button>
                  </div>
                </div>

                <button
                  onClick={() => setShowGuide(false)}
                  className="text-xs text-slate-400 hover:text-slate-700"
                >
                  收合手冊
                </button>
              </div>

              {guideMode === 'table42' ? (
                <Table42MajorDesignsViewer
                  onAskGemini={(prompt) => {
                    if (onAskGeminiFollowup) {
                      onClose();
                      onAskGeminiFollowup(prompt);
                    }
                  }}
                />
              ) : (
                <TriangulationAbcdeViewer
                  onAskGemini={(prompt) => {
                    if (onAskGeminiFollowup) {
                      onClose();
                      onAskGeminiFollowup(prompt);
                    }
                  }}
                />
              )}
            </div>
          )}

          {/* Mode 1: File Upload Dropzone */}
          {uploadMode === 'file' && (
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                file 
                  ? 'border-emerald-400 bg-emerald-50/30' 
                  : 'border-slate-300 hover:border-indigo-400 bg-white hover:bg-indigo-50/20'
              }`}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".pdf,.txt,.md,.json"
                className="hidden"
              />

              <div className="max-w-md mx-auto space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto shadow-xs">
                  <UploadCloud className="w-6 h-6" />
                </div>
                {file ? (
                  <div className="space-y-1">
                    <div className="flex items-center justify-center gap-2 font-bold text-slate-900 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>已選擇檔案：{file.name}</span>
                    </div>
                    <p className="text-xs text-slate-500">
                      大小：{(file.size / 1024 / 1024).toFixed(2)} MB • 格式：{file.type || '文件'}
                    </p>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setFile(null);
                        setFileBase64(null);
                        setFileText('');
                      }}
                      className="text-xs text-rose-600 hover:underline pt-1"
                    >
                      移除重選
                    </button>
                  </div>
                ) : (
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm">
                      點擊瀏覽或將論文 PDF / TXT 拖曳至此處
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      支援完整論文 PDF（自動萃取方法論段落）或文字檔案 (最大支援 50MB)
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Mode 2: Paste Text Area */}
          {uploadMode === 'paste' && (
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-indigo-600" />
                <span>直接貼上論文之標題、摘要、研究設計或完整內容：</span>
              </label>
              <textarea
                rows={7}
                value={pastedText}
                onChange={(e) => setPastedText(e.target.value)}
                placeholder="貼上論文 Abstract, Methodology 或 Results 章節文字..."
                className="w-full p-3.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-sans focus:outline-hidden focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 bg-white leading-relaxed text-slate-800"
              />
            </div>
          )}

          {/* Mode 3: Preset Exemplars */}
          {uploadMode === 'preset' && (
            <div className="space-y-3">
              <div className="text-xs text-slate-600">
                點擊下方頂級財務與管理學經典論文，即可立即載入進行 MMR 深度診斷：
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <button
                  type="button"
                  onClick={() => handleSelectPreset('gupta')}
                  className="p-3.5 rounded-xl border border-rose-300 bg-rose-50/70 hover:bg-rose-100 text-left transition-all space-y-1 group shadow-xs"
                >
                  <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-rose-600 text-white">
                    ③ 解釋式 QUAN ➔ qual
                  </span>
                  <div className="font-bold text-xs text-slate-900 group-hover:text-rose-700">
                    Gupta et al. (2023) IJPE
                  </div>
                  <p className="text-[11px] text-slate-600 line-clamp-2">
                    供應鏈 AI 與區塊鏈財務韌性（202問卷 + 25專家訪談，追蹤解釋模式）。
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectPreset('raman')}
                  className="p-3.5 rounded-xl border border-indigo-200 bg-indigo-50/50 hover:bg-indigo-100/70 text-left transition-all space-y-1 group"
                >
                  <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-400 text-slate-950 uppercase">
                    (c) 資料轉化模式
                  </span>
                  <div className="font-bold text-xs text-slate-900 group-hover:text-indigo-700">
                    Raman et al. (2022)
                  </div>
                  <p className="text-[11px] text-slate-500 line-clamp-2">
                    新聞情緒 (WSJ) 結合 Compustat 財報預測企業績效，IJIM 頂級期刊。
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectPreset('loughran')}
                  className="p-3.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-left transition-all space-y-1 group"
                >
                  <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-slate-200 text-slate-800">
                    金融詞庫開山之作
                  </span>
                  <div className="font-bold text-xs text-slate-900 group-hover:text-indigo-700">
                    Loughran & McDonald (2011)
                  </div>
                  <p className="text-[11px] text-slate-500 line-clamp-2">
                    開發金融情感詞庫，質性文字轉化 quan 特徵分析 10-K 財報，Journal of Finance。
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectPreset('tetlock')}
                  className="p-3.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-left transition-all space-y-1 group"
                >
                  <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-slate-200 text-slate-800">
                    媒體情緒先行者
                  </span>
                  <div className="font-bold text-xs text-slate-900 group-hover:text-indigo-700">
                    Tetlock (2007)
                  </div>
                  <p className="text-[11px] text-slate-500 line-clamp-2">
                    量化 WSJ 專欄悲觀情緒對美股大盤的衝擊與反轉，Journal of Finance。
                  </p>
                </button>
              </div>

              {pastedText && (
                <div className="p-3 rounded-xl bg-white border border-slate-200 text-xs text-slate-600 max-h-32 overflow-y-auto font-mono">
                  {pastedText}
                </div>
              )}
            </div>
          )}

          {skillHint && (
            <div className="p-3 rounded-xl border border-indigo-200 bg-indigo-50 text-indigo-900 text-xs">{skillHint}</div>
          )}

          {/* Action Trigger Button */}
          <div className="flex items-center justify-between pt-2">
            <div className="text-xs text-slate-500 flex items-center gap-1.5">
              <Workflow className="w-3.5 h-3.5 text-indigo-600" />
              <span>將深度檢驗 Creswell 圖 4.1 (a/b/c/d/e) 變型與元推論實質價值</span>
            </div>

            <button
              onClick={() => handleStartAnalysis()}
              disabled={loading || (!file && !fileBase64 && !pastedText.trim() && !fileText.trim())}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 text-white font-semibold text-xs sm:text-sm shadow-md transition-all cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Gemini AI 正在全景審閱論文 MMR...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-200" />
                  <span>開始 Gemini AI MMR 深度診斷</span>
                </>
              )}
            </button>
          </div>

          {/* Analysis Report Section */}
          {analysisResult && (
            <div className="mt-6 pt-6 border-t border-slate-200 space-y-4 animate-in fade-in duration-200">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-indigo-50/70 p-4 rounded-xl border border-indigo-200">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                    MMR
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">
                      論文方法論審查診斷報告出爐
                    </h3>
                    <div className="text-[11px] text-emerald-800 font-bold flex items-center gap-1.5 mt-0.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span>Gemini 實時線上推理完成 • 模型：{analyzedModelUsed} {analyzedLatencyMs ? `(耗時 ${(analyzedLatencyMs / 1000).toFixed(2)} 秒)` : ''}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={handleCopyResult}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-medium transition-colors"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? '已複製' : '複製報告'}</span>
                  </button>

                  <button
                    onClick={handleDownloadMarkdown}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-colors shadow-2xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>下載 Markdown</span>
                  </button>
                </div>
              </div>

              {isFallbackReport && (
                <div className="p-3.5 rounded-xl border border-amber-300 bg-amber-50 text-amber-900 text-xs leading-relaxed">
                  ⚠️ <strong>這份報告是內建範本，不是 AI 針對這篇論文的分析。</strong>
                  伺服器目前無法呼叫 Gemini（可能未設定 GEMINI_API_KEY 或額度不足），可到頁首「AI 連線狀態」測試。
                </div>
              )}

              {/* Two-Tier Deduction Result Summary Card (Table 4.2 Major Design ➔ Sub-Variant) */}
              {detectedAnalysis && (
                <div className={`p-4 sm:p-5 rounded-2xl border-2 space-y-3 ${detectedAnalysis.major.theme}`}>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-full ${detectedAnalysis.major.badgeBg}`}>
                          第 1 階段大類判定
                        </span>
                        <span className="text-xs text-slate-600 font-medium">
                          時機：{detectedAnalysis.major.timing} • 權重：{detectedAnalysis.major.weight}
                        </span>
                      </div>
                      <div className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                        <span>{detectedAnalysis.major.name}</span>
                        <span className="text-xs px-2 py-0.5 rounded font-mono font-bold bg-white/90 border border-black/10">
                          {detectedAnalysis.major.notation}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setShowGuide(true);
                          setGuideMode('table42');
                        }}
                        className="px-3 py-1.5 bg-white/90 hover:bg-white text-xs font-semibold rounded-xl shadow-2xs border border-black/10 transition-colors flex items-center gap-1.5"
                      >
                        <TableProperties className="w-3.5 h-3.5 text-indigo-600" />
                        <span>對照表 4.2 大類推導</span>
                      </button>
                    </div>
                  </div>

                  <div className="pt-2.5 border-t border-black/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-900 text-white">
                        第 2 階段子變型
                      </span>
                      <span className="font-bold text-slate-900">
                        {detectedAnalysis.variant}
                      </span>
                      {detectedAnalysis.source === 'guess' && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/80 border border-black/10 text-slate-600">
                          依報告文字推測，可能不準
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setShowGuide(true);
                        setGuideMode('abcde');
                      }}
                      className="text-xs text-indigo-700 hover:text-indigo-900 font-semibold underline shrink-0"
                    >
                      查看變型圖解 ➔
                    </button>
                  </div>
                </div>
              )}

              {/* 本篇論文的研究流程：由 AI 依報告整理，內容對應這篇論文 */}
              {verdict && verdict.phases?.length > 0 && !isGuptaPaper && (
                <div className="p-4 sm:p-5 rounded-2xl border border-slate-200 bg-white space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="font-bold text-slate-900 text-sm">
                      本篇論文的研究流程
                      {verdict.paperTitle && verdict.paperTitle !== '未說明' && (
                        <span className="ml-2 font-normal text-slate-500">{verdict.paperTitle}</span>
                      )}
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                      AI 依診斷報告整理
                    </span>
                  </div>
                  <div className={`grid gap-3 ${verdict.phases.length === 1 ? 'grid-cols-1' : verdict.phases.length === 2 ? 'sm:grid-cols-2' : 'sm:grid-cols-3'}`}>
                    {verdict.phases.map((ph: any, i: number) => (
                      <div key={i} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2">
                        <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                          <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs flex items-center justify-center shrink-0">{i + 1}</span>
                          <span>{ph.label}</span>
                        </div>
                        <ul className="space-y-1 text-xs text-slate-700 list-disc pl-5">
                          {ph.items.map((it: string, j: number) => <li key={j}>{it}</li>)}
                        </ul>
                      </div>
                    ))}
                  </div>
                  {verdict.evidence && verdict.evidence !== '未說明' && (
                    <p className="text-xs text-slate-600"><strong>判定依據：</strong>{verdict.evidence}</p>
                  )}
                </div>
              )}

              {/* 解釋式 vs 探索式對照圖：內容以 Gupta et al. (2023) 為範例，只在分析該論文時顯示 */}
              {isGuptaPaper && detectedAnalysis?.major.name.includes('解釋式') && (
                <div className="my-4">
                  <ExplanatoryVsExploratoryDiagram 
                    onAskGemini={(prompt) => handleAskFollowup(prompt)}
                  />
                </div>
              )}

              {/* Optimized Markdown & MathJax Analysis Report Viewer */}
              <MarkdownReportViewer 
                content={analysisResult || ''} 
                fileName={analyzedFileName || 'Paper_MMR_Analysis'} 
              />

              {/* Interactive In-Modal Follow-up Q&A Section */}
              <div className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-indigo-300">
                    <MessageSquare className="w-4 h-4 text-indigo-400" />
                    <span>針對此論文 MMR 兩階段判定向 Gemini 深度追問</span>
                  </div>
                  <span className="text-[11px] text-slate-400">
                    可點擊下方快速提問，或直接輸入任何方法論問題
                  </span>
                </div>

                {/* Quick Question Chips */}
                <div className="flex flex-wrap gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => handleAskFollowup('請依據 Creswell 表 4.2，詳細說明本篇論文為何屬於此大類，依據「時機」與「權重」為何排除其他三種主要設計類型（三角校正 / 嵌入式 / 解釋式 / 探索式）？')}
                    disabled={followupLoading}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-indigo-600/60 border border-slate-700 text-slate-200 text-left transition-colors"
                  >
                    💡 為何先定此大類？排除其他三種理由
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAskFollowup('在大類確立後，論文具體是如何進行資料混合（例如將質性 QUAL 轉為 quan 數值）？其與純量化有何本質差別？')}
                    disabled={followupLoading}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-indigo-600/60 border border-slate-700 text-slate-200 text-left transition-colors"
                  >
                    📊 混合機理：質性文本如何轉化為 quan 數值？
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAskFollowup('如何在台股環境下運用 FinMind 工具與 GEE 計量回歸復刻此論文的兩階段設計？請列出具體變數與步驟。')}
                    disabled={followupLoading}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-indigo-600/60 border border-slate-700 text-slate-200 text-left transition-colors"
                  >
                    🇹🇼 如何用 FinMind 工具在台股復刻此設計？
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAskFollowup('這篇論文在元推論 (Meta-Inference) 深度上表現如何？是否有效避開了「空洞架構」的陷阱？')}
                    disabled={followupLoading}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-indigo-600/60 border border-slate-700 text-slate-200 text-left transition-colors"
                  >
                    🛡️ 元推論深度與空洞架構診斷
                  </button>
                </div>

                {/* In-Modal Custom Followup Input */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customQuestion}
                    onChange={(e) => setCustomQuestion(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAskFollowup(customQuestion);
                      }
                    }}
                    placeholder="輸入對本篇論文的任何研究方法、計量統計或模型疑問..."
                    disabled={followupLoading}
                    className="flex-1 bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-400 focus:outline-hidden focus:border-indigo-400"
                  />
                  <button
                    type="button"
                    onClick={() => handleAskFollowup(customQuestion)}
                    disabled={followupLoading || !customQuestion.trim()}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    {followupLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                    <span>追問</span>
                  </button>
                </div>

                {/* Followup Answers List */}
                {followupQas.length > 0 && (
                  <div className="space-y-3 pt-2">
                    {followupQas.map((item, idx) => (
                      <div key={idx} className="p-4 rounded-xl bg-slate-800/90 border border-slate-700 space-y-2 text-xs">
                        <div className="font-semibold text-amber-300 flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-amber-400/20 text-amber-300 flex items-center justify-center text-[10px] font-bold">Q{idx + 1}</span>
                            <span>{item.q}</span>
                          </div>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-800/60 font-mono">
                            🔥 已存入 Firebase
                          </span>
                        </div>
                        <div className="text-slate-200 leading-relaxed pl-4 border-l-2 border-indigo-500 font-sans space-y-1">
                          {item.a.split('\n').map((para, pIdx) => {
                            if (!para.trim()) return <div key={pIdx} className="h-1.5" />;
                            const parts = para.split(/(\*\*.*?\*\*|`.*?`|\$\$.*?\$\$|\$.*?\$|\\\[.*?\\\]|\\\(.*?\\\))/g);
                            return (
                              <p key={pIdx} className="my-1">
                                {parts.map((part, partIdx) => {
                                  if (!part) return null;
                                  if (part.startsWith('**') && part.endsWith('**')) {
                                    return <strong key={partIdx} className="font-bold text-amber-200 bg-amber-400/10 px-1 py-0.5 rounded">{part.slice(2, -2)}</strong>;
                                  }
                                  if (part.startsWith('`') && part.endsWith('`')) {
                                    return <code key={partIdx} className="px-1.5 py-0.5 rounded bg-slate-900 font-mono text-[11px] text-indigo-300 border border-slate-700">{part.slice(1, -1)}</code>;
                                  }
                                  if ((part.startsWith('$$') && part.endsWith('$$')) || (part.startsWith('\\[') && part.endsWith('\\]'))) {
                                    const mathContent = part.replace(/^(\$\$|\\\[)|(\$\$|\\\])$/g, '').trim();
                                    return <MathRenderer key={partIdx} math={mathContent} displayMode={true} />;
                                  }
                                  if ((part.startsWith('$') && part.endsWith('$')) || (part.startsWith('\\(') && part.endsWith('\\)'))) {
                                    const mathContent = part.replace(/^(\$|\\\()|(\$|\\\))$/g, '').trim();
                                    return <MathRenderer key={partIdx} math={mathContent} displayMode={false} />;
                                  }
                                  return part;
                                })}
                              </p>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Followup Consultation Action */}
              {onAskGeminiFollowup && (
                <div className="p-4 rounded-xl bg-slate-100 border border-slate-200 text-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span>想要更完整的全屏對話介面？可轉入 Gemini MMR 專屬對話沙盒。</span>
                  </div>
                  <button
                    onClick={() => {
                      onClose();
                      onAskGeminiFollowup(`針對剛才審閱的論文「${analyzedFileName}」，請深入說明其混合研究方法 (MMR) 的優缺點與改進建議。`);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 font-semibold text-white transition-colors shrink-0"
                  >
                    轉入專屬對話沙盒 ➔
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-white flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">審查依據:</span>
            <span>Creswell & Plano Clark (2018) 表 4.2 ＆ 博士論文 15 大 Skills</span>
          </div>
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg transition-colors"
          >
            關閉
          </button>
        </div>
      </div>
      </div>

      {/* 博士論文｜MMR＋SSCI 15 個 Skills 互動選擇浮層 */}
      {showSkillsModal && (
        <div 
          className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={() => setShowSkillsModal(false)}
        >
          <div 
            className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden text-slate-800"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-6 py-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-950 text-white flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black text-sm shadow-md">
                  PhD
                </div>
                <div>
                  <h3 className="font-bold text-base text-white flex items-center gap-2">
                    <span>🎓 博士論文｜MMR＋SSCI＋IF 20 個 Skills 快速套用</span>
                  </h3>
                  <p className="text-xs text-indigo-200/80">
                    點擊任何項目，即可直接將其指定為本次論文審查焦點，精準執行單元診斷！
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowSkillsModal(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body: 20 Skills Grid & Gamma Guide Image */}
            <div className="p-5 overflow-y-auto space-y-4 flex-1 bg-slate-50/60">
              {/* Gamma Guide Image Card */}
              <div className="bg-slate-900 rounded-2xl p-3.5 border border-slate-800 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400 text-slate-950">
                      主題五：全景導覽圖
                    </span>
                    <span className="text-xs font-bold text-slate-200">
                      MMR 混合方法研究與 20 大 Skills 導覽架構圖 (Gamma 原圖同步)
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    本圖視覺化展示量質雙軌整合、Creswell 表 4.2 判定鏈與 SSCI 頂級期刊品質查核之閉環。
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <a
                    href="https://cdn.gamma.app/qczcgzm3dplba12/ca044b88abba4ab9b7b11c9b1f51c3c3/original/image.png"
                    target="_blank"
                    rel="noreferrer"
                    className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors shadow-xs"
                  >
                    <span>開啟原圖 (高畫質)</span>
                  </a>
                </div>
              </div>

              {/* 20 Skills Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                {phdSkillsList.map((skill) => (
                  <button
                    key={skill.id}
                    onClick={() => handleApplySkill(skill.code)}
                    className="p-3.5 rounded-2xl bg-white border border-slate-200 hover:border-indigo-400 hover:shadow-md text-left transition-all group flex flex-col justify-between space-y-2"
                  >
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                          {skill.id} {skill.code}
                        </span>
                        <span className="text-base">{skill.icon}</span>
                      </div>
                      <div className="font-extrabold text-xs text-slate-900 group-hover:text-indigo-700">
                        {skill.name}
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                        {skill.desc}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-medium">
                      <span>{skill.category}</span>
                      <span className="text-indigo-600 font-bold group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                        套用 ➔
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-3 bg-white border-t border-slate-200 flex items-center justify-between text-xs">
              <span className="text-slate-500">
                可隨時在「焦點」選單中切換或結合「上傳論文」進行全篇交叉審查
              </span>
              <button
                onClick={() => setShowSkillsModal(false)}
                className="px-4 py-1.5 rounded-xl bg-slate-900 text-white font-semibold hover:bg-slate-800 transition-colors"
              >
                關閉
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
