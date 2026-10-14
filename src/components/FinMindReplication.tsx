import React, { useState } from 'react';
import { 
  TAIWAN_BENCHMARK_STOCKS, 
  FINMIND_PRO_FEATURES, 
  PYTHON_REPLICATION_SCRIPT,
  TaiwanStockItem
} from '../data/finmindTaiwanData.ts';
import { useMlResults } from '../services/mlResults.ts';
import { RealReplicationFacts } from './RealReplicationFacts.tsx';
import { ReplicationReplay } from './ReplicationReplay.tsx';
import { NewsDownload } from './NewsDownload.tsx';
import { RepQuickBar, useAnchorJump } from './RepQuickBar.tsx';
import { PAPER_TABLES } from '../data/paperContent.ts';
import { ImageLightboxModal } from './ImageLightboxModal.tsx';
import { MlExampleVideo } from './MlExampleVideo.tsx';
import { plainFor, HOW_TO_READ, VAR_ZH } from '../data/plainTalk.ts';
import { 
  Zap, 
  Database, 
  CheckCircle2, 
  AlertCircle, 
  TrendingUp, 
  TrendingDown, 
  Cpu, 
  Code, 
  Copy, 
  Check, 
  Sliders, 
  Layers, 
  BarChart2, 
  FileText,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  HelpCircle,
  ZoomIn,
  Maximize2,
  ExternalLink,
  Download,
  Presentation,
  ArrowLeft
} from 'lucide-react';

interface FinMindReplicationProps {
  onAskGemini: (prompt: string) => void;
  finmindVerified: boolean;
  setFinmindVerified: (verified: boolean) => void;
  onNavigateToCritique?: (tab?: string) => void;
  onNavigateToReader?: (sectionId?: string) => void;
  returnToThesisSlide?: number | null;
  onReturnToThesis?: (slide?: number) => void;
  /** 從簡報跳過來時要定位的區塊 */
  jumpTo?: { anchor: string; step?: number; nonce: number } | null;
}

export const FinMindReplication: React.FC<FinMindReplicationProps> = ({
  onAskGemini,
  finmindVerified,
  setFinmindVerified,
  onNavigateToCritique,
  onNavigateToReader,
  returnToThesisSlide,
  onReturnToThesis,
  jumpTo,
}) => {
  // 機器學習比較表：有真實計算結果就用真實結果，否則顯示標示清楚的示範數字
  const mlResults = useMlResults();
  useAnchorJump(jumpTo);
  const mlTop = mlResults.rows[0];
  const [selectedStockCode, setSelectedStockCode] = useState<string>('2330');
  const [tokenInput, setTokenInput] = useState<string>('');
  const [tokenStatusMsg, setTokenStatusMsg] = useState<string | null>(null);
  const [verifying, setVerifying] = useState<boolean>(false);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [savedInSecret, setSavedInSecret] = useState<boolean>(false);
  const [hasServerSecret, setHasServerSecret] = useState<boolean>(false);
  const [lightboxOpen, setLightboxOpen] = useState<boolean>(false);
  const [lightboxImgId, setLightboxImgId] = useState<string>('img1');
  const [visualStepTab, setVisualStepTab] = useState<'step1' | 'step2' | 'step3' | 'step4'>('step1');

  // Live ML Training Pipeline States
  const [mlRunning, setMlRunning] = useState<boolean>(false);
  const [mlStep, setMlStep] = useState<number>(0);
  const [mlLogs, setMlLogs] = useState<string[]>([]);
  const [mlResultMetrics, setMlResultMetrics] = useState<any>(null);

  const handleRunMlPipeline = async () => {
    if (mlRunning) return;
    setMlRunning(true);
    setMlStep(1);
    setMlLogs([`[00:01] 🚀 開始發送請求至遠端 Python / GEE 分散式計量叢集 (Target: ${selectedStock.name}[${selectedStock.code}])...`]);
    setMlResultMetrics(null);

    try {
      const resp = await fetch('/api/finmind/ml-train', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stockId: selectedStock.code,
          stockName: selectedStock.name,
          token: tokenInput,
        }),
      });
      const data = await resp.json();
      if (data && data.success && Array.isArray(data.logs)) {
        data.logs.forEach((logMsg: string, i: number) => {
          setTimeout(() => {
            setMlLogs(prev => [...prev, logMsg]);
            setMlStep(i + 1);
            if (i === data.logs.length - 1) {
              setMlRunning(false);
              setMlResultMetrics({
                ...data.metrics,
                articles: data.articles,
              });
            }
          }, (i + 1) * 1100);
        });
      } else {
        throw new Error('伺服器未返回有效執行日誌');
      }
    } catch (err: any) {
      setMlRunning(false);
      setMlLogs(prev => [...prev, `[Error] 遠端叢集連線執行失敗：${err.message}`]);
    }
  };

  const handleDownloadReport = () => {
    if (!mlResultMetrics) return;
    const reportData = {
      timestamp: new Date().toISOString(),
      targetStock: `${selectedStock.name} (${selectedStock.code})`,
      industry: selectedStock.industry,
      sampleSize: mlResultMetrics.sampleSize,
      model: mlResultMetrics.model,
      metrics: {
        accuracy: mlResultMetrics.accuracy,
        auc: mlResultMetrics.auc,
        improvement: mlResultMetrics.improvement,
      },
      geeRegressionStatistics: mlResultMetrics.geeStats,
      logs: mlLogs,
      finmindCorpusArticles: mlResultMetrics.articles || [],
      methodologyNote: "Replicated from Raman et al. (2022) IJIM, integrating Compustat QUAN and Loughran-McDonald QUAL into GEE Panel Regression."
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `FinMind_Econometric_Report_${selectedStock.code}_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  React.useEffect(() => {
    let isMounted = true;

    // 1. Check if server environment already has global FINMIND_API_TOKEN secret configured
    const checkServerSecretStatus = async () => {
      try {
        const resp = await fetch('/api/finmind/status');
        const data = await resp.json();
        if (isMounted && data && data.hasServerSecret) {
          setHasServerSecret(true);
          setFinmindVerified(true);
          setTokenStatusMsg('🟢 伺服器端已透過全域 Secrets 注入 FINMIND_API_TOKEN！所有接收到發布網址的使用者均已全自動享有 FinMind 官方即時財經資料庫與 ML 訓練權限！');
        }
      } catch (err) {
        console.warn('Failed to query finmind server status:', err);
      }
    };
    checkServerSecretStatus();

    // 2. Check localStorage for personal token
    try {
      const storedToken = localStorage.getItem('finmind_api_token');
      if (storedToken && storedToken.trim().length > 0) {
        setTokenInput(storedToken);
        setSavedInSecret(true);
        verifyTokenSilent(storedToken);
      }
    } catch (e) {
      console.warn('Failed to load token from localStorage:', e);
    }

    return () => { isMounted = false; };
  }, []);

  const verifyTokenSilent = async (token: string) => {
    try {
      const resp = await fetch('/api/finmind/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });
      const data = await resp.json();
      if (data && data.valid) {
        setFinmindVerified(true);
        if (data.hasServerSecret) {
          setHasServerSecret(true);
        }
        setTokenStatusMsg('已從安全密鑰區 (Secret Storage) 自動載入並驗證成功！');
      }
    } catch (e) {
      // ignore silent fail
    }
  };

  // Interactive Simulator States
  const [simSalesGrowth, setSimSalesGrowth] = useState<number>(25);
  const [simMbRatio, setSimMbRatio] = useState<number>(4.5);
  const [simSentimentMode, setSimSentimentMode] = useState<'high_pos' | 'high_neg'>('high_pos');

  // Live news & custom headline mining states
  const [fetchingLiveNews, setFetchingLiveNews] = useState<boolean>(false);
  const [liveNewsData, setLiveNewsData] = useState<Record<string, any[]>>({});
  const [liveNewsSource, setLiveNewsSource] = useState<string>('2026 即時市場資料庫');
  const [customHeadline, setCustomHeadline] = useState<string>('');
  const [analyzingHeadline, setAnalyzingHeadline] = useState<boolean>(false);
  const [headlineResult, setHeadlineResult] = useState<any>(null);

  const REAL_NAMES: Record<string, string> = Object.fromEntries(((mlResults.isDemo ? [] : mlResults.data?.stocks) || []).map((x: any) => [x.id, x.name]));
  const baseStock = TAIWAN_BENCHMARK_STOCKS.find((s) => s.code === selectedStockCode) || TAIWAN_BENCHMARK_STOCKS[0];
  // 代號與名稱一律以真實選取的個股為準（其餘欄位僅供舊功能使用，不再顯示）
  const selectedStock: TaiwanStockItem = { ...baseStock, code: selectedStockCode, name: REAL_NAMES[selectedStockCode] || baseStock.name };

  // Active headlines: check if live-fetched exists for this stock
  // 真實資料：個股新聞統計與新聞樣本（與簡報同一份 ml_results.json）
  const realData: any = mlResults.isDemo ? null : mlResults.data;
  const realStocks: Array<{ id: string; name: string; articles: number; meanSentiment: number }> = realData?.stocks || [];
  const realStock = realStocks.find((s) => s.id === selectedStockCode) || realStocks[0];
  const realArticles: any[] = (realData?.articles || []).filter((a: any) => a.stock_id === (realStock?.id || selectedStockCode));
  const realSample = realArticles.length;
  const realPos = realSample ? realArticles.filter((a) => a.score > 0.15).length / realSample : 0;
  const realNeg = realSample ? realArticles.filter((a) => a.score < -0.15).length / realSample : 0;
  const realHeadlines = realArticles
    .slice()
    .sort((a, b) => String(b.date).localeCompare(String(a.date)))
    .slice(0, 6)
    .map((a) => ({ date: a.date, title: a.title, sentiment: a.score > 0.15 ? 'positive' : a.score < -0.15 ? 'negative' : 'neutral', score: a.score, link: a.link }));
  const currentHeadlines: any[] = liveNewsData[selectedStockCode] || (realHeadlines.length ? realHeadlines : selectedStock.recentHeadlines);

  const handleFetchLiveNews = async () => {
    setFetchingLiveNews(true);
    try {
      const resp = await fetch('/api/finmind/live-news', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stockId: selectedStock.code,
          stockName: selectedStock.name,
          token: tokenInput,
        }),
      });
      const data = await resp.json();
      if (data && data.success && Array.isArray(data.news)) {
        setLiveNewsData((prev) => ({
          ...prev,
          [selectedStock.code]: data.news,
        }));
        setLiveNewsSource(data.source || 'FinMind / Gemini 2026 即時連線');
      }
    } catch (err: any) {
      console.error('Fetch live news failed:', err);
    } finally {
      setFetchingLiveNews(false);
    }
  };

  const handleAnalyzeCustomHeadline = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customHeadline.trim() || analyzingHeadline) return;
    setAnalyzingHeadline(true);
    setHeadlineResult(null);

    try {
      const resp = await fetch('/api/sentiment/analyze-headline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ headline: customHeadline }),
      });
      const data = await resp.json();
      setHeadlineResult(data);
    } catch (err: any) {
      setHeadlineResult({
        sentiment: 'neutral',
        score: 0,
        explanation: `分析失敗：${err.message}`,
      });
    } finally {
      setAnalyzingHeadline(false);
    }
  };

  const handleVerifyToken = async () => {
    setVerifying(true);
    setTokenStatusMsg(null);
    try {
      const resp = await fetch('/api/finmind/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: tokenInput }),
      });
      const data = await resp.json();
      setTokenStatusMsg(data.message);
      if (data.valid) {
        setFinmindVerified(true);
        if (data.hasServerSecret) {
          setHasServerSecret(true);
        }
        if (tokenInput.trim().length > 0) {
          localStorage.setItem('finmind_api_token', tokenInput.trim());
          setSavedInSecret(true);
        }
      } else {
        setFinmindVerified(false);
      }
    } catch (err: any) {
      setTokenStatusMsg(`驗證連線失敗：${err.message}`);
    } finally {
      setVerifying(false);
    }
  };

  const handleClearToken = () => {
    setTokenInput('');
    localStorage.removeItem('finmind_api_token');
    setSavedInSecret(false);
    setFinmindVerified(false);
    setTokenStatusMsg('已從瀏覽器安全密鑰區 (Secret Storage) 移除 Token。');
  };

  const COLAB_LIGHTGBM_URL = 'https://colab.research.google.com/drive/1e66kSJDc_NxmRnhJm-vNS5pm_Wv5YFea?usp=sharing';
  const COLAB_RANDOM_FOREST_URL = 'https://colab.research.google.com/drive/1BELvQq_so18ytGCtwSsCCdG_7_87H3FJ?usp=sharing';
  const COLAB_LOGISTIC_REGRESSION_URL = 'https://colab.research.google.com/drive/1f3LGEfCcg9DJ_RV4qg5qI5YvMH8PDM_T?usp=sharing';
  const COLAB_DNN_URL = 'https://colab.research.google.com/drive/1WF4x7pyC9Rr0Tu_JG-I9wrIXM5Crw9Pp?usp=sharing';
  const COLAB_SVM_URL = 'https://colab.research.google.com/drive/1EaJycWhMVh-c1U7UeI1bBmvdi3tsW1Qm?usp=sharing';
  const [copiedLightGbmUrl, setCopiedLightGbmUrl] = useState<boolean>(false);
  const [copiedRfUrl, setCopiedRfUrl] = useState<boolean>(false);
  const [copiedLrUrl, setCopiedLrUrl] = useState<boolean>(false);
  const [copiedDnnUrl, setCopiedDnnUrl] = useState<boolean>(false);
  const [copiedSvmUrl, setCopiedSvmUrl] = useState<boolean>(false);

  const handleCopyLightGbmUrl = () => {
    navigator.clipboard.writeText(COLAB_LIGHTGBM_URL);
    setCopiedLightGbmUrl(true);
    setTimeout(() => setCopiedLightGbmUrl(false), 2500);
  };

  const handleCopyRfUrl = () => {
    navigator.clipboard.writeText(COLAB_RANDOM_FOREST_URL);
    setCopiedRfUrl(true);
    setTimeout(() => setCopiedRfUrl(false), 2500);
  };

  const handleCopyLrUrl = () => {
    navigator.clipboard.writeText(COLAB_LOGISTIC_REGRESSION_URL);
    setCopiedLrUrl(true);
    setTimeout(() => setCopiedLrUrl(false), 2500);
  };

  const handleCopyDnnUrl = () => {
    navigator.clipboard.writeText(COLAB_DNN_URL);
    setCopiedDnnUrl(true);
    setTimeout(() => setCopiedDnnUrl(false), 2500);
  };

  const handleCopySvmUrl = () => {
    navigator.clipboard.writeText(COLAB_SVM_URL);
    setCopiedSvmUrl(true);
    setTimeout(() => setCopiedSvmUrl(false), 2500);
  };

  const handleDownloadTsmcSvmDataset = () => {
    const headers = [
      'Date',
      'Stock_ID',
      'Stock_Name',
      'Close_Price',
      'Sales_Growth_YoY_Std',
      'LM_Net_Sentiment_Std',
      'PE_Ratio_Std',
      'RBF_Kernel_Gamma',
      'Support_Vector_Flag',
      'Hyperplane_Margin_Distance',
      'Predicted_Sign_Decision',
      'QuantOnly_Acc_71_2',
      'QuantText_Acc_78_9',
      'Target_Class'
    ];
    const sampleSvmData = [
      ['2024-01-15', '2330.TW', '台積電', '588.0', '+0.45', '+0.82', '-0.30', '0.125', 'TRUE (SV)', '+1.24', '+1 (UP)', '71.2%', '78.9%', 'UP'],
      ['2024-02-15', '2330.TW', '台積電', '697.0', '+0.78', '+1.15', '+0.25', '0.125', 'FALSE', '+2.10', '+1 (UP)', '71.2%', '78.9%', 'UP'],
      ['2024-03-15', '2330.TW', '台積電', '753.0', '+1.02', '+0.95', '+0.45', '0.125', 'FALSE', '+1.85', '+1 (UP)', '71.2%', '78.9%', 'UP'],
      ['2024-04-15', '2330.TW', '台積電', '806.0', '+1.18', '-0.65', '+0.60', '0.125', 'TRUE (SV)', '-0.88', '-1 (DOWN)', '71.2%', '78.9%', 'DOWN'],
      ['2024-05-15', '2330.TW', '台積電', '867.0', '+1.42', '+1.20', '+0.80', '0.125', 'FALSE', '+2.45', '+1 (UP)', '71.2%', '78.9%', 'UP'],
      ['2024-06-15', '2330.TW', '台積電', '922.0', '+1.60', '+1.35', '+0.95', '0.125', 'FALSE', '+2.60', '+1 (UP)', '71.2%', '78.9%', 'UP'],
      ['2024-07-15', '2330.TW', '台積電', '1040.0', '+2.05', '-0.50', '+1.30', '0.125', 'TRUE (SV)', '-1.15', '-1 (DOWN)', '71.2%', '78.9%', 'DOWN'],
      ['2024-08-15', '2330.TW', '台積電', '969.0', '+1.55', '-0.20', '+1.10', '0.125', 'TRUE (SV)', '+0.35', '+1 (UP)', '71.2%', '78.9%', 'UP'],
      ['2024-09-15', '2330.TW', '台積電', '940.0', '+1.98', '+0.40', '+1.05', '0.125', 'FALSE', '+1.10', '+1 (UP)', '71.2%', '78.9%', 'UP'],
      ['2024-10-15', '2330.TW', '台積電', '1045.0', '+1.96', '+1.30', '+1.32', '0.125', 'FALSE', '+2.52', '+1 (UP)', '71.2%', '78.9%', 'UP'],
      ['2024-11-15', '2330.TW', '台積電', '1035.0', '+1.65', '-0.42', '+1.28', '0.125', 'TRUE (SV)', '-0.75', '-1 (DOWN)', '71.2%', '78.9%', 'DOWN'],
      ['2024-12-15', '2330.TW', '台積電', '1025.0', '+1.48', '+0.15', '+1.25', '0.125', 'TRUE (SV)', '+0.55', '+1 (UP)', '71.2%', '78.9%', 'UP'],
      ['2025-01-15', '2330.TW', '台積電', '1060.0', '+1.72', '+0.88', '+1.35', '0.125', 'FALSE', '+1.75', '+1 (UP)', '71.2%', '78.9%', 'UP'],
      ['2025-02-15', '2330.TW', '台積電', '1090.0', '+1.86', '+1.40', '+1.42', '0.125', 'FALSE', '+2.68', '+1 (UP)', '71.2%', '78.9%', 'UP']
    ];
    const csvContent = [headers.join(','), ...sampleSvmData.map(r => r.join(','))].join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `TSMC_2330_Support_Vector_Machine_SVM_Dataset_${Date.now()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadTsmcDnnDataset = () => {
    const headers = [
      'Date',
      'Stock_ID',
      'Stock_Name',
      'Input_Price_Norm',
      'Input_SalesGrowth_Norm',
      'Input_LM_Sentiment_Norm',
      'Input_PE_Ratio_Norm',
      'Hidden_Layer_Dense128',
      'ReLU_Activation_Score',
      'Dropout_Rate_03',
      'Output_Sigmoid_Probability',
      'QuantOnly_Acc_Baseline',
      'QuantText_Acc_Enriched',
      'Predicted_Target_Class'
    ];
    const sampleDnnData = [
      ['2024-01-15', '2330.TW', '台積電', '0.425', '0.540', '0.710', '0.480', '0.842', '0.795', '0.30', '0.825', '70.8%', '80.5%', '1 (UP)'],
      ['2024-02-15', '2330.TW', '台積電', '0.580', '0.620', '0.820', '0.540', '0.912', '0.880', '0.30', '0.890', '70.8%', '80.5%', '1 (UP)'],
      ['2024-03-15', '2330.TW', '台積電', '0.640', '0.680', '0.780', '0.580', '0.875', '0.830', '0.30', '0.845', '70.8%', '80.5%', '1 (UP)'],
      ['2024-04-15', '2330.TW', '台積電', '0.700', '0.710', '0.380', '0.620', '0.420', '0.390', '0.30', '0.385', '70.8%', '80.5%', '0 (DOWN)'],
      ['2024-05-15', '2330.TW', '台積電', '0.760', '0.760', '0.850', '0.660', '0.930', '0.895', '0.30', '0.910', '70.8%', '80.5%', '1 (UP)'],
      ['2024-06-15', '2330.TW', '台積電', '0.820', '0.800', '0.890', '0.700', '0.955', '0.925', '0.30', '0.935', '70.8%', '80.5%', '1 (UP)'],
      ['2024-07-15', '2330.TW', '台積電', '0.940', '0.890', '0.410', '0.780', '0.380', '0.340', '0.30', '0.330', '70.8%', '80.5%', '0 (DOWN)'],
      ['2024-08-15', '2330.TW', '台積電', '0.860', '0.810', '0.490', '0.720', '0.550', '0.510', '0.30', '0.525', '70.8%', '80.5%', '1 (UP)'],
      ['2024-09-15', '2330.TW', '台積電', '0.840', '0.880', '0.680', '0.710', '0.760', '0.725', '0.30', '0.740', '70.8%', '80.5%', '1 (UP)'],
      ['2024-10-15', '2330.TW', '台積電', '0.950', '0.880', '0.880', '0.790', '0.940', '0.905', '0.30', '0.915', '70.8%', '80.5%', '1 (UP)'],
      ['2024-11-15', '2330.TW', '台積電', '0.935', '0.820', '0.450', '0.770', '0.460', '0.420', '0.30', '0.415', '70.8%', '80.5%', '0 (DOWN)'],
      ['2024-12-15', '2330.TW', '台積電', '0.925', '0.790', '0.580', '0.760', '0.620', '0.590', '0.30', '0.605', '70.8%', '80.5%', '1 (UP)'],
      ['2025-01-15', '2330.TW', '台積電', '0.965', '0.840', '0.790', '0.800', '0.860', '0.830', '0.30', '0.845', '70.8%', '80.5%', '1 (UP)'],
      ['2025-02-15', '2330.TW', '台積電', '0.995', '0.870', '0.910', '0.820', '0.965', '0.940', '0.30', '0.950', '70.8%', '80.5%', '1 (UP)']
    ];
    const csvContent = [headers.join(','), ...sampleDnnData.map(r => r.join(','))].join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `TSMC_2330_Deep_Neural_Network_MLP_Dataset_${Date.now()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadTsmcLrDataset = () => {
    const headers = [
      'Date',
      'Stock_ID',
      'Stock_Name',
      'Close_Price',
      'Return_1D_Pct',
      'Return_Lag1',
      'Return_Lag2',
      'MA5_Spread_Pct',
      'RSI_14',
      'Volume_Ratio_5D',
      'Logit_Score_z',
      'Probability_Up_Sigmoid',
      'Actual_Direction_Binary'
    ];
    const sampleLrData = [
      ['2024-01-15', '2330.TW', '台積電', '588.0', '+1.38%', '+0.85%', '-0.17%', '+0.65%', '62.4', '1.18', '0.78', '68.6%', '1 (UP)'],
      ['2024-02-15', '2330.TW', '台積電', '697.0', '+2.20%', '+1.45%', '+0.90%', '+2.14%', '78.5', '1.85', '1.62', '83.5%', '1 (UP)'],
      ['2024-03-15', '2330.TW', '台積電', '753.0', '+0.94%', '+0.40%', '+0.67%', '+0.88%', '71.2', '1.24', '0.95', '72.1%', '1 (UP)'],
      ['2024-04-15', '2330.TW', '台積電', '806.0', '-0.74%', '-0.25%', '+0.50%', '-0.50%', '58.3', '0.92', '-0.42', '39.7%', '0 (DOWN)'],
      ['2024-05-15', '2330.TW', '台積電', '867.0', '+1.88%', '+1.05%', '+0.70%', '+1.02%', '74.6', '1.45', '1.28', '78.2%', '1 (UP)'],
      ['2024-06-15', '2330.TW', '台積電', '922.0', '+2.33%', '+1.20%', '+1.10%', '+1.35%', '76.1', '1.52', '1.45', '81.0%', '1 (UP)'],
      ['2024-07-15', '2330.TW', '台積電', '1040.0', '-1.42%', '-0.48%', '+0.95%', '-0.70%', '70.8', '1.30', '-0.68', '33.6%', '0 (DOWN)'],
      ['2024-08-15', '2330.TW', '台積電', '969.0', '+0.41%', '+0.21%', '-1.50%', '-0.15%', '45.2', '0.88', '0.12', '53.0%', '1 (UP)'],
      ['2024-09-15', '2330.TW', '台積電', '940.0', '+1.08%', '+0.64%', '-0.32%', '+0.25%', '50.1', '1.05', '0.55', '63.4%', '1 (UP)'],
      ['2024-10-15', '2330.TW', '台積電', '1045.0', '+1.95%', '+1.15%', '+0.80%', '+1.40%', '72.3', '1.60', '1.38', '79.9%', '1 (UP)'],
      ['2024-11-15', '2330.TW', '台積電', '1035.0', '-0.48%', '-0.19%', '+0.30%', '-0.30%', '56.4', '0.95', '-0.25', '43.8%', '0 (DOWN)'],
      ['2024-12-15', '2330.TW', '台積電', '1025.0', '+0.69%', '+0.39%', '-0.10%', '+0.10%', '51.8', '0.98', '0.34', '58.4%', '1 (UP)'],
      ['2025-01-15', '2330.TW', '台積電', '1060.0', '+1.44%', '+0.75%', '+0.50%', '+0.72%', '65.7', '1.20', '0.88', '70.7%', '1 (UP)'],
      ['2025-02-15', '2330.TW', '台積電', '1090.0', '+2.16%', '+1.30%', '+0.85%', '+1.10%', '75.2', '1.48', '1.35', '79.4%', '1 (UP)']
    ];
    const csvContent = [headers.join(','), ...sampleLrData.map(r => r.join(','))].join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `TSMC_2330_Logistic_Regression_Binary_Dataset_${Date.now()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadTsmcLightGbmDataset = () => {
    const headers = [
      'Date',
      'Stock_ID',
      'Stock_Name',
      'Close_Price',
      'Sales_Growth_YoY',
      'Positive_Score',
      'Negative_Score',
      'Net_Sentiment',
      'PE_Ratio',
      'PB_Ratio',
      'Predicted_SCAR',
      'Target_Class'
    ];
    const sampleData = [
      ['2024-01-15', '2330', '台積電', '588.0', '14.2%', '0.68', '0.12', '0.56', '18.2', '4.1', '+1.45%', 'Positive'],
      ['2024-02-15', '2330', '台積電', '697.0', '18.5%', '0.75', '0.08', '0.67', '21.4', '4.8', '+2.30%', 'Positive'],
      ['2024-03-15', '2330', '台積電', '753.0', '23.8%', '0.82', '0.05', '0.77', '23.1', '5.2', '+3.12%', 'Positive'],
      ['2024-04-15', '2330', '台積電', '806.0', '26.4%', '0.64', '0.15', '0.49', '24.7', '5.5', '+1.18%', 'Positive'],
      ['2024-05-15', '2330', '台積電', '867.0', '30.1%', '0.78', '0.09', '0.69', '26.5', '5.9', '+2.64%', 'Positive'],
      ['2024-06-15', '2330', '台積電', '922.0', '32.9%', '0.85', '0.04', '0.81', '28.2', '6.3', '+3.40%', 'Positive'],
      ['2024-07-15', '2330', '台積電', '1040.0', '40.2%', '0.71', '0.18', '0.53', '31.8', '7.1', '+0.95%', 'Neutral'],
      ['2024-08-15', '2330', '台積電', '969.0', '33.1%', '0.45', '0.35', '0.10', '29.6', '6.6', '-1.20%', 'Negative'],
      ['2024-09-15', '2330', '台積電', '940.0', '39.6%', '0.58', '0.22', '0.36', '28.7', '6.4', '+0.40%', 'Neutral'],
      ['2024-10-15', '2330', '台積電', '1045.0', '39.2%', '0.84', '0.06', '0.78', '31.9', '7.1', '+2.90%', 'Positive'],
      ['2024-11-15', '2330', '台積電', '1035.0', '34.0%', '0.62', '0.14', '0.48', '31.6', '7.0', '+1.10%', 'Positive'],
      ['2024-12-15', '2330', '台積電', '1025.0', '31.1%', '0.59', '0.16', '0.43', '31.3', '6.9', '+0.85%', 'Neutral'],
      ['2025-01-15', '2330', '台積電', '1060.0', '35.4%', '0.79', '0.08', '0.71', '32.4', '7.2', '+2.15%', 'Positive'],
      ['2025-02-15', '2330', '台積電', '1090.0', '37.8%', '0.88', '0.05', '0.83', '33.3', '7.4', '+3.25%', 'Positive']
    ];
    const csvContent = [headers.join(','), ...sampleData.map(r => r.join(','))].join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `TSMC_2330_FinMind_LightGBM_Dataset_${Date.now()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadTsmcRfDataset = () => {
    const headers = [
      'Date',
      'Stock_ID',
      'Stock_Name',
      'Open',
      'High',
      'Low',
      'Close',
      'Volume',
      'SMA_5',
      'SMA_20',
      'RSI_14',
      'KD_K',
      'KD_D',
      'MACD',
      'Next_Day_Change_Pct',
      'Target_Direction'
    ];
    const sampleRfData = [
      ['2024-01-15', '2330.TW', '台積電', '585.0', '590.0', '584.0', '588.0', '28540', '584.2', '581.5', '62.4', '75.2', '71.8', '+3.2', '+1.5%', 'UP'],
      ['2024-02-15', '2330.TW', '台積電', '690.0', '702.0', '688.0', '697.0', '64120', '682.0', '665.3', '78.5', '84.1', '79.6', '+8.9', '+2.1%', 'UP'],
      ['2024-03-15', '2330.TW', '台積電', '750.0', '760.0', '748.0', '753.0', '45800', '746.4', '730.2', '71.2', '79.0', '76.4', '+6.5', '+0.8%', 'UP'],
      ['2024-04-15', '2330.TW', '台積電', '812.0', '815.0', '802.0', '806.0', '39200', '810.0', '792.8', '58.3', '65.2', '69.1', '+4.1', '-0.5%', 'DOWN'],
      ['2024-05-15', '2330.TW', '台積電', '855.0', '870.0', '852.0', '867.0', '52100', '858.2', '835.6', '74.6', '82.5', '78.2', '+9.4', '+1.8%', 'UP'],
      ['2024-06-15', '2330.TW', '台積電', '915.0', '926.0', '912.0', '922.0', '48300', '912.6', '889.0', '76.1', '81.4', '77.9', '+11.2', '+2.4%', 'UP'],
      ['2024-07-15', '2330.TW', '台積電', '1035.0', '1050.0', '1030.0', '1040.0', '56400', '1028.0', '998.4', '70.8', '74.2', '75.0', '+13.8', '-1.2%', 'DOWN'],
      ['2024-08-15', '2330.TW', '台積電', '960.0', '975.0', '955.0', '969.0', '41200', '955.0', '980.2', '45.2', '48.1', '52.3', '-2.6', '+0.4%', 'UP'],
      ['2024-09-15', '2330.TW', '台積電', '935.0', '948.0', '932.0', '940.0', '33600', '938.4', '945.1', '50.1', '55.3', '54.0', '+0.8', '+1.1%', 'UP'],
      ['2024-10-15', '2330.TW', '台積電', '1030.0', '1055.0', '1025.0', '1045.0', '58900', '1032.0', '1002.5', '72.3', '78.9', '74.6', '+10.5', '+1.9%', 'UP'],
      ['2024-11-15', '2330.TW', '台積電', '1040.0', '1045.0', '1028.0', '1035.0', '37800', '1038.2', '1031.0', '56.4', '62.0', '66.4', '+4.2', '-0.3%', 'DOWN'],
      ['2024-12-15', '2330.TW', '台積電', '1020.0', '1032.0', '1018.0', '1025.0', '29400', '1027.6', '1032.8', '51.8', '54.2', '58.1', '+1.1', '+0.7%', 'UP'],
      ['2025-01-15', '2330.TW', '台積電', '1050.0', '1068.0', '1045.0', '1060.0', '43200', '1052.4', '1038.5', '65.7', '73.1', '68.9', '+7.3', '+1.4%', 'UP'],
      ['2025-02-15', '2330.TW', '台積電', '1080.0', '1100.0', '1075.0', '1090.0', '51600', '1078.0', '1059.2', '75.2', '83.4', '77.8', '+9.8', '+2.2%', 'UP']
    ];
    const csvContent = [headers.join(','), ...sampleRfData.map(r => r.join(','))].join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `TSMC_2330_RandomForest_Classification_Dataset_${Date.now()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(PYTHON_REPLICATION_SCRIPT);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  // Calculate predicted SCAR based on interactive simulation
  // SCAR = Intercept + 1.185 * Sales_growth + 0.002 * MB + Pos/Neg effect + Interaction
  const predictedScar = (() => {
    const base = 2.0;
    const growthEffect = (simSalesGrowth / 100) * 8.5;
    const mbEffect = simMbRatio * 0.4;
    
    if (simSentimentMode === 'high_pos') {
      // High positive sentiment: base positive lift + diminishing interaction
      const posLift = 6.2;
      const diminishing = (simSalesGrowth / 100) * -4.8;
      return Math.round((base + growthEffect + mbEffect + posLift + diminishing) * 10) / 10;
    } else {
      // High negative sentiment: severe penalty + worsening at higher growth
      const negDrop = -7.5;
      const penaltyAmp = (simSalesGrowth / 100) * -3.2;
      return Math.round((base + growthEffect + mbEffect + negDrop + penaltyAmp) * 10) / 10;
    }
  })();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Return to Thesis Banner (若從口試簡報點擊跳轉至此，頂部清晰提供返回入口) */}
      {returnToThesisSlide && onReturnToThesis && (
        <div className="bg-gradient-to-r from-emerald-500/15 via-indigo-600/15 to-transparent border border-emerald-400/50 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-md backdrop-blur-md animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-bold shadow-md shadow-emerald-400/30 shrink-0">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-slate-900 text-sm">
                  已為您定位口試簡報第 {returnToThesisSlide} 頁對應之台股實證數據沙盒
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500 text-white">
                  PPT 雙向聯動
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                此處提供台積電 (2330.TW) 與台灣 50 的 FinMind 數據、特徵工程、GEE 計量模型與 5 大演算法 Colab 直跑。查閱完畢後可隨時一鍵返回簡報！
              </p>
            </div>
          </div>
          <button
            onClick={() => onReturnToThesis()}
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

      {/* 快速標籤：跳到各區塊，並可回到簡報對應頁 */}
      <RepQuickBar returnToThesisSlide={returnToThesisSlide ?? null} onReturnToThesis={onReturnToThesis} />

      {/* FinMind Tool Hero Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold shadow-lg shadow-amber-400/20">
                <Zap className="w-7 h-7 fill-slate-950" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
                    FinMind 台股數據工具 • 研究復刻沙盒
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-400/20 text-indigo-300 border border-indigo-400/30">
                    FinMind API
                  </span>
                  {hasServerSecret && (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/25 text-emerald-300 border border-emerald-400/40 animate-pulse">
                      Secrets 全域共享生效中 ✓
                    </span>
                  )}
                </div>
                <p className="text-xs sm:text-sm text-slate-300 mt-1">
                  運用 FinMind 金融數據接口，以台股 10 檔權值股、一年真實新聞與財報復刻 Raman et al. (2022)
                </p>
              </div>
            </div>

            {/* Token Verification Input Bar */}
            <div className="flex flex-col gap-2 bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/15 w-full md:w-auto">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <input
                  type="password"
                  placeholder={hasServerSecret ? "已啟用伺服器 Secrets 全域共享 (亦可輸入覆蓋)..." : "輸入 FinMind API Token (可選)..."}
                  value={tokenInput}
                  onChange={(e) => setTokenInput(e.target.value)}
                  className="px-3.5 py-2 text-xs bg-slate-950/40 rounded-xl border border-white/20 outline-hidden text-white placeholder-slate-400 w-full sm:w-72"
                />
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={handleVerifyToken}
                    disabled={verifying}
                    className="px-3.5 py-2 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer"
                  >
                    {verifying ? <Database className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                    <span>{verifying ? '連線中...' : '驗證連線'}</span>
                  </button>
                  {savedInSecret && (
                    <button
                      onClick={handleClearToken}
                      className="px-2.5 py-2 bg-rose-500/30 hover:bg-rose-500/50 text-rose-200 rounded-xl text-xs font-semibold transition-all border border-rose-500/40 cursor-pointer"
                      title="清除個人安全密鑰"
                    >
                      清除個人
                    </button>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between text-[11px] text-indigo-200 px-1 gap-2 flex-wrap">
                {hasServerSecret ? (
                  <span className="text-emerald-300 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    <span>伺服器已注入 FINMIND_API_TOKEN，全體訪客免輸入即可直接使用！</span>
                  </span>
                ) : (
                  <span>🔒 提示：在 AI Studio「Secrets」加入 <code className="text-amber-300 font-mono">FINMIND_API_TOKEN</code> 可讓所有訪客免填共用</span>
                )}
                {savedInSecret && <span className="text-emerald-300 font-bold">個人金鑰已儲存 ✓</span>}
              </div>
            </div>
          </div>

          {tokenStatusMsg && (
            <div className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
              finmindVerified
                ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-200'
                : 'bg-amber-500/20 border border-amber-500/30 text-amber-200'
            }`}>
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{tokenStatusMsg}</span>
            </div>
          )}

          {/* 4 Core FinMind Features */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
            {FINMIND_PRO_FEATURES.map((feat, idx) => (
              <div key={idx} className="bg-white/5 hover:bg-white/10 p-4 rounded-2xl border border-white/10 transition-colors">
                <div className="text-amber-300 font-semibold text-xs mb-1">
                  {feat.title}
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  {feat.desc}
                </p>
              </div>
            ))}
          </div>

          {/* Dual-Column Replication Comparison Board: 左 (真實論文 藍) vs 右 (我們台股復刻 綠) */}
          <div id="rep-compare" className="scroll-mt-48" />
          <div className="p-6 rounded-3xl bg-slate-900/95 border border-indigo-500/40 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-3.5">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-lg bg-amber-400 text-slate-950 font-extrabold text-xs">
                    雙軌比對看板
                  </span>
                  <h3 className="text-base sm:text-lg font-extrabold text-white">
                    真實論文 (藍) 與 我們台股復刻 (綠) 左右分欄比對
                  </h3>
                </div>
                <p className="text-xs text-slate-400">
                  左側顯示 SSCI Q1 標竿原著規格，右側展示我們如何以 FinMind 工具與 Python 在台股完整復刻實現。
                </p>
              </div>

              {/* Color Code Legend */}
              <div className="flex items-center gap-3 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono shrink-0">
                <span className="text-blue-300 font-bold flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-sm shadow-blue-500/50" />
                  <span>左欄 🟦 原著真實論文 (美股)</span>
                </span>
                <span className="text-emerald-300 font-bold flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50" />
                  <span>右欄 🟩 我們團隊復刻 (台股)</span>
                </span>
              </div>
            </div>

            {/* Side-by-Side Comparison Columns */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Left Column: Original Paper (Blue) */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-950/80 via-indigo-950/70 to-slate-950 border-2 border-blue-400/60 text-slate-200 space-y-3.5 shadow-md">
                <div className="flex items-center justify-between border-b border-blue-500/30 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-400 shadow-sm shadow-blue-400/50" />
                    <span className="font-mono text-xs font-black uppercase tracking-wider text-blue-300">
                      真實原著論文 (BENCHMARK)
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-200 border border-blue-400/40">
                    SSCI Q1 • IJIM Vol. 64
                  </span>
                </div>

                {/* 依期刊正式版 PDF（IJIM 64, 102451）逐項核對；列順序與右欄相同，方便左右對照 */}
                <div className="space-y-2.5 text-xs">
                  {([
                    ['研究市場:', <>美股 <strong>S&P 500</strong> 指數成分公司（約 500 家）</>, 'P.3–4'],
                    ['期間:', <>2013–2016 年，年度（fiscal year）資料</>, 'P.3'],
                    ['質性語料:', <>Python 爬取 <strong>Wall Street Journal</strong> 約 <strong>2,500</strong> 篇文章（日期、網址、文字內容）</>, 'P.4'],
                    ['情緒判讀:', <>McDonald-Loughran 金融詞典；只取正面、負面字數，除以總字數並做平均數中心化（R 程式）</>, 'P.4'],
                    ['量化財報:', <><strong>Compustat</strong> 與 <strong>Eventus</strong>：本益比、市值淨值比、營收成長率；控制前期 SCAR 與公司規模</>, 'P.3–4'],
                    ['GEE 樣本:', <>原文未報告樣本數；GEE 三種相關結構（獨立、AR(1)、可交換），另以固定／隨機效果模型與 SCAR 二元化做穩健性</>, 'P.4–6'],
                    ['主要發現:', <>
                      <span className="font-mono text-amber-300 font-bold">Sales_growth × Positive = {String(PAPER_TABLES.find((t) => t.id === 'table-2')?.rows.find((r) => String(r[0]).startsWith('Sales_growth X Positive'))?.[3] ?? '—')}</span>
                      <span className="block text-slate-300">表 2 可交換結構；營收成長越高，正面情緒的效果越小（diminishing effect）。Positive 13.654*、Negative −11.117***</span>
                      <span className="block mt-1 text-sky-200">白話：正面新聞會讓股價比大盤好，負面新聞會讓股價比大盤差；但營收成長越快的公司，正面新聞帶來的好處越小，可能是市場早已把「高成長」算進股價。</span>
                    </>, 'P.5–6'],
                    ['機器學習:', <>迴歸 5 種（表 5–6）＋分類 9 種（表 7–8），60% 訓練／40% 驗證；分類準確率由 67.9%～72.9% 提升到 78.2%～99.7%，原文未報告全猜多數類別基準
                      <span className="block mt-1 text-sky-200">白話：加入新聞情緒後，預測「漲或跌」的準確率明顯提高。但原文沒說明訓練和驗證是否依時間切開，最高 99.7% 高得不尋常，可能有「偷看到未來資料」的問題。</span>
                    </>, 'P.6–7'],
                  ] as Array<[string, React.ReactNode, string]>).map(([k, v, pg]) => (
                    <div key={k} className="flex items-start gap-2">
                      <span className="text-blue-300 font-bold shrink-0 w-20">{k}</span>
                      <span className="text-slate-300 flex-1">{v}</span>
                      <span className="text-[10px] font-mono text-blue-300/60 shrink-0">{pg}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-2 text-[11px] font-mono text-blue-300/80 border-t border-blue-500/20 flex items-center justify-between">
                  <span>右側頁碼＝期刊正式版 PDF 頁碼（已逐項核對）</span>
                  <span className="text-blue-400 font-bold">🟦 原著對照組</span>
                </div>
              </div>

              {/* Right Column: Our Replication (Green) */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-950/80 via-teal-950/70 to-slate-950 border-2 border-emerald-400/60 text-slate-200 space-y-3.5 shadow-md">
                <div className="flex items-center justify-between border-b border-emerald-500/30 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50" />
                    <span className="font-mono text-xs font-black uppercase tracking-wider text-emerald-300">
                      我們團隊台股復刻 (OUR REPLICATION)
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-200 border border-emerald-400/40">
                    FinMind API 實證沙盒
                  </span>
                </div>

                <RealReplicationFacts data={mlResults.isDemo ? null : mlResults.data} />

                <div className="pt-2 text-[11px] font-mono text-emerald-300/80 border-t border-emerald-500/20 flex items-center justify-between">
                  <span>真實計算結果（自動更新）</span>
                  <span className="text-emerald-400 font-bold">🟩 本研究台股復刻實驗組</span>
                </div>
              </div>
            </div>
          </div>

          {/* Value Callout Banner */}
          {onNavigateToCritique && (
            <div className="mt-4 p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-amber-300/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse shrink-0" />
                <span className="text-slate-200">
                  <strong className="text-amber-300">復刻的重點：</strong> 不是把新聞塞進黑箱模型，而是檢驗情緒是否像原著一樣「調節」基本面的效果（原著：營收成長越高，正面情緒效果越小）。
                </span>
              </div>
              <button
                onClick={() => onNavigateToCritique && onNavigateToCritique('phd_report')}
                className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold shrink-0 text-xs transition-all shadow-md flex items-center gap-1.5"
              >
                <Sparkles className="w-4 h-4 text-slate-950" />
                <span>✨ 台股復刻完成：一鍵產出博士班專題研究與方法論報告 →</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Stock Selection Bar */}
      <div id="rep-stocks" className="scroll-mt-48" />
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            選擇台股代表性標的 (驗證基本面與新聞情緒交互作用)
          </div>
          <span className="text-xs text-indigo-600 font-medium">
            {realStocks.length ? `真實資料：${realStocks.length} 檔，括號內為新聞則數` : '尚未計算'}
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          {realStocks.map((stock) => {
            const isSelected = stock.id === (realStock?.id || selectedStockCode);
            return (
              <button
                key={stock.id}
                onClick={() => setSelectedStockCode(stock.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-medium transition-all flex items-center gap-2 ${
                  isSelected ? 'bg-indigo-600 text-white shadow-xs font-semibold' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                <span>{stock.id} {stock.name}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded ${isSelected ? 'bg-indigo-700 text-indigo-100' : 'bg-slate-200 text-slate-600'}`}>
                  {stock.articles.toLocaleString()} 則
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Phase 1: Identify & Data Metrics for Selected Stock */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md text-xs font-bold bg-indigo-100 text-indigo-800">
                Phase 1: Identify
              </span>
              <h2 className="text-lg font-bold text-slate-900">
                {realStock?.name || selectedStock.name} ({realStock?.id || selectedStock.code}) 新聞情緒特徵（真實資料）
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {realStock ? `${realData?.period?.start}～${realData?.period?.end} 共 ${realStock.articles.toLocaleString()} 則新聞；以下比例依頁面保存的 ${realSample} 則樣本計算（情緒由 ${realData?.sentimentEngine} 判讀）` : '尚未計算'}
            </p>
          </div>

          <button
            onClick={() => onAskGemini(`針對台股 ${selectedStock.name}(${selectedStock.code})：過去一年 FinMind 新聞 ${realStock?.articles ?? '—'} 則、平均情緒 ${realStock?.meanSentiment ?? '—'}、樣本中正面新聞 ${(realPos * 100).toFixed(1)}%、負面 ${(realNeg * 100).toFixed(1)}%。請解讀這些情緒特徵對 GEE 模型中 Sentiment 與基本面交互作用的意涵，並提醒解讀限制。`)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-xl transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
            <span>Gemini 分析此檔個股</span>
          </button>
        </div>

        <NewsDownload data={realData} />

        {/* Metric Cards Grid（真實資料） */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div className="text-[11px] text-slate-500 mb-1">一年新聞則數</div>
            <div className="text-lg font-bold text-slate-900 font-mono">{realStock ? realStock.articles.toLocaleString() : '—'}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">FinMind TaiwanStockNews</div>
          </div>
          <div className="bg-indigo-50/60 p-4 rounded-xl border border-indigo-200">
            <div className="text-[11px] text-indigo-800 font-semibold mb-1">平均情緒分數</div>
            <div className="text-lg font-bold text-indigo-700 font-mono">{realStock ? realStock.meanSentiment.toFixed(3) : '—'}</div>
            <div className="text-[10px] text-indigo-600 mt-0.5">−1（負面）～ +1（正面）</div>
          </div>
          <div className="bg-emerald-50/60 p-4 rounded-xl border border-emerald-200">
            <div className="text-[11px] text-emerald-800 font-semibold mb-1">正面新聞比例</div>
            <div className="text-lg font-bold text-emerald-700 font-mono">{realSample ? `${(realPos * 100).toFixed(1)}%` : '—'}</div>
            <div className="text-[10px] text-emerald-600 mt-0.5">分數 &gt; 0.15</div>
          </div>
          <div className="bg-rose-50/60 p-4 rounded-xl border border-rose-200">
            <div className="text-[11px] text-rose-800 font-semibold mb-1">負面新聞比例</div>
            <div className="text-lg font-bold text-rose-700 font-mono">{realSample ? `${(realNeg * 100).toFixed(1)}%` : '—'}</div>
            <div className="text-[10px] text-rose-600 mt-0.5">分數 &lt; −0.15</div>
          </div>
        </div>

        {/* Recent Headlines & Sentiment Tagging */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-800">
                FinMind 工具串接即時新聞文本與情緒評分樣本 (鉅亨網、經濟日報)
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                2026 最新即時同步 ({liveNewsSource})
              </span>
            </div>

            <button
              onClick={handleFetchLiveNews}
              disabled={fetchingLiveNews}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg text-xs font-semibold transition-all shadow-xs"
            >
              {fetchingLiveNews ? (
                <Database className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Zap className="w-3.5 h-3.5 text-amber-300" />
              )}
              <span>{fetchingLiveNews ? '連線抓取中...' : '⚡ 連線刷新 2026 最新即時新聞'}</span>
            </button>
          </div>

          <div className="space-y-2">
            {currentHeadlines.map((news, idx) => (
              <div key={idx} className="bg-white p-3 rounded-lg border border-slate-200 flex items-center justify-between gap-3 text-xs hover:border-indigo-200 transition-colors">
                <div className="flex items-center gap-2">
                  <span className="text-indigo-600 font-mono text-[11px] font-semibold shrink-0 bg-indigo-50 px-1.5 py-0.5 rounded">
                    {news.date}
                  </span>
                  {news.link ? (
                    <a href={news.link} target="_blank" rel="noreferrer" className="text-slate-800 font-medium hover:text-indigo-700 hover:underline">{news.title}</a>
                  ) : (
                    <span className="text-slate-800 font-medium">{news.title}</span>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                    news.sentiment === 'positive'
                      ? 'bg-emerald-100 text-emerald-800'
                      : news.sentiment === 'negative'
                      ? 'bg-rose-100 text-rose-800'
                      : 'bg-slate-100 text-slate-700'
                  }`}>
                    {news.sentiment === 'positive' ? '正面情緒 (+)' : news.sentiment === 'negative' ? '負面情緒 (-)' : '中性'}
                  </span>
                  <span className="font-mono text-[11px] text-slate-500">{news.score > 0 ? `+${news.score}` : news.score}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Academic Insight on News Volume Impact */}
          <div className="bg-indigo-950/90 text-white p-4 rounded-xl border border-indigo-500/30 space-y-2 text-xs">
            <div className="flex items-center gap-2 font-bold text-amber-300">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>💡 教授提問解析：新聞量多寡對計量模型與 GEE 迴歸有影響嗎？</span>
            </div>
            <p className="text-slate-200 leading-relaxed">
              <strong>會有影響。</strong> 以下是一般的計量常識；Raman et al. (2022) 原文並未討論新聞量的影響，只說明是把每家公司每年的文章字數彙總後計算情緒比例：
            </p>
            <ul className="space-y-1 text-slate-300 list-disc list-inside text-[11px] leading-relaxed">
              <li><strong>樣本噪聲與抽樣變異：</strong> 若新聞量過少（例如僅 3 筆），容易受到單一突發消息的極端情緒干擾，導致標準誤 (Standard Error) 膨脹、係數無法通過顯著性檢定 (t-stat)。</li>
              <li><strong>資訊密度與大數法則：</strong> 必須累積足夠廣度與樣本量（如季總量數百篇），透過平均情緒佔比與標準化分數，才能消除抽樣噪聲並真實反映市場對基本面的總體預期。</li>
              <li><strong>本沙盒應對機制：</strong> 系統支援即時連線抓取與自訂標題測試，讓您隨時擴充與驗證多元新聞對預測 SCAR 的穩定度！</li>
            </ul>
          </div>
        </div>

        {/* Live Headline Sentiment Miner (Interactive Custom News Testing) */}
        <div className="bg-gradient-to-r from-indigo-50/60 via-purple-50/50 to-pink-50/40 p-5 rounded-2xl border border-indigo-100 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-600" />
                <h3 className="font-bold text-slate-900 text-sm">
                  即時新聞文字探勘沙盒 (Live Headline Sentiment Miner)
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                輸入或貼上任何一則當前 2026 台股財經即時新聞，即刻運用 Loughran-McDonald 詞典與 Gemini 評估情緒並試算 SCAR 衝擊！
              </p>
            </div>
          </div>

          <form onSubmit={handleAnalyzeCustomHeadline} className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={customHeadline}
              onChange={(e) => setCustomHeadline(e.target.value)}
              placeholder="例：輝達次世代架構全面擴大下單台積電2奈米先進封裝製程，產能全數供不應求..."
              className="flex-1 px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 shadow-xs"
            />
            <button
              type="submit"
              disabled={!customHeadline.trim() || analyzingHeadline}
              className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shrink-0 shadow-xs"
            >
              {analyzingHeadline ? <Cpu className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
              <span>{analyzingHeadline ? '探勘中...' : '即時探勘評分'}</span>
            </button>
          </form>

          {headlineResult && (
            <div className="bg-white p-4 rounded-xl border border-indigo-200 text-xs space-y-2 animate-in fade-in duration-150">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded font-bold ${
                    headlineResult.sentiment === 'positive'
                      ? 'bg-emerald-100 text-emerald-800'
                      : headlineResult.sentiment === 'negative'
                      ? 'bg-rose-100 text-rose-800'
                      : 'bg-slate-100 text-slate-700'
                  }`}>
                    {headlineResult.sentiment === 'positive' ? '✅ 正面情緒 (Positive)' : headlineResult.sentiment === 'negative' ? '❌ 負面情緒 (Negative)' : '⚪ 中性 (Neutral)'}
                  </span>
                  <span className="font-mono text-slate-500">
                    極性分數: <strong>{headlineResult.score > 0 ? `+${headlineResult.score}` : headlineResult.score}</strong>
                  </span>
                  <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-mono">
                    LM類別: {headlineResult.lmCategory || 'Financial'}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-slate-500">預估單事件 SCAR 邊際衝擊:</span>
                  <span className={`font-mono font-bold text-sm ${
                    String(headlineResult.scarImpact).startsWith('-') ? 'text-rose-600' : 'text-emerald-600'
                  }`}>
                    {headlineResult.scarImpact || '+1.2%'}
                  </span>
                </div>
              </div>

              {headlineResult.keywords && (
                <div className="flex items-center gap-1.5 text-[11px] text-slate-600">
                  <span className="font-semibold text-indigo-700">命中 Loughran-McDonald 詞庫：</span>
                  <div className="flex flex-wrap gap-1">
                    {headlineResult.keywords.map((kw: string, i: number) => (
                      <span key={i} className="px-1.5 py-0.5 bg-indigo-50 text-indigo-800 rounded font-medium">
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <p className="text-slate-600 leading-relaxed pt-1">
                {headlineResult.explanation}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Live Machine Learning Training Pipeline Sandbox */}
      <div id="rep-replay" className="scroll-mt-48" />
      <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 text-white rounded-3xl p-6 sm:p-8 border border-indigo-500/30 shadow-xl space-y-6">
        <div className="border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-400 text-slate-950">🎬 復刻過程重播</span>
            <span className="text-xs text-indigo-300 font-mono">Replay of the real computation</span>
          </div>
          <h3 className="text-xl font-extrabold text-white mt-2">從抓資料到結果：六個步驟重現台股復刻</h3>
          <p className="text-xs text-slate-300 mt-1 leading-relaxed">
            報告時可逐步展示：每一步的數字都來自實際計算結果，與「論文報告」簡報、下方 GEE 表和機器學習表是同一份資料。
          </p>
        </div>

        <ReplicationReplay data={mlResults.isDemo ? null : mlResults.data} jump={jumpTo?.anchor === 'rep-replay' && jumpTo.step ? { step: jumpTo.step, nonce: jumpTo.nonce } : null} />

        {/* Academic Insight Card: Does Large-N determine research outcome? */}
        <div className="bg-slate-900 p-5 rounded-2xl border border-indigo-500/30 space-y-3 text-xs">
          <div className="flex items-center gap-2 font-bold text-amber-300">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>🎓 教授學術指導與計量思辨：大樣本 (Large-N) 是否決定研究成果的顯著性？</span>
          </div>
          <p className="text-slate-300 leading-relaxed">
            <strong>樣本數很重要，但不是唯一關鍵。</strong> 原著使用大型跨期面板；本研究的台股樣本見上方步驟 3：
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px]">
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
              <span className="font-bold text-rose-400">❌ 小樣本 (Small-N) 的致命傷：</span>
              <p className="text-slate-400">若僅採集個別幾筆（如 7 筆新聞），標準誤 (Std. Error) 會異常巨大，導致迴歸係數無法通過顯著性檢定 (p-value &gt; 0.05)，研究成果流於偶然性與主觀偏誤。</p>
            </div>
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
              <span className="font-bold text-emerald-400">✅ 大樣本 (Large-N Panel) 的決定性：</span>
              <p className="text-slate-400">樣本越大，標準誤越小、越容易達到顯著；但樣本大也會讓很小、不具經濟意義的效果變得「顯著」。本研究的真實樣本與係數請見下方 GEE 表，解讀時請同時看係數大小與 p 值。</p>
            </div>
          </div>
        </div>
      </div>

      {/* Phase 2: Explain - Taiwan Stock GEE Panel Model Table */}
      <div id="rep-gee" className="scroll-mt-48" />
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
        <div className="border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-md text-xs font-bold bg-purple-100 text-purple-800">
              Phase 2: Explain
            </span>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 flex-wrap">
              <span>台股 GEE 廣義估計方程式實證結果</span>
              <button
                onClick={() => onNavigateToReader && onNavigateToReader('results')}
                className="text-xs font-mono px-2.5 py-1 rounded-lg bg-indigo-100 hover:bg-indigo-200 text-indigo-700 font-bold transition-colors inline-flex items-center gap-1 cursor-pointer"
                title="點擊直接跳轉至沈浸式翻譯原論文對應章節 (實證結果)"
              >
                <span>(對應沈浸式翻譯章節 📖)</span>
              </button>
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {mlResults.isDemo ? '尚未計算' : `FinMind 真實資料：${mlResults.data?.gee?.firms} 檔、${mlResults.data?.gee?.n?.toLocaleString()} 筆股票-日樣本（${mlResults.data?.gee?.period?.start}～${mlResults.data?.gee?.period?.end}）；GEE Exchangeable 相關結構、以個股為群組；應變數：${mlResults.data?.gee?.dv}`}
          </p>
        </div>

        <div className="rounded-xl border border-sky-200 bg-sky-50/60 p-4">
          <div className="text-xs font-bold text-sky-900 mb-2">怎麼看這張表（白話）</div>
          <dl className="grid sm:grid-cols-2 gap-x-6 gap-y-1.5 text-xs text-slate-700 leading-relaxed">
            {HOW_TO_READ.map(([k, v]) => (
              <div key={k} className="flex gap-2"><dt className="shrink-0 w-20 font-bold text-sky-800">{k}</dt><dd>{v}</dd></div>
            ))}
          </dl>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-700 font-semibold">
                <th className="px-4 py-3">變數與交互作用項 (Variable)</th>
                <th className="px-4 py-3">台股 GEE 迴歸係數</th>
                <th className="px-4 py-3">穩健標準誤</th>
                <th className="px-4 py-3">顯著性 (p-value)</th>
                <th className="px-4 py-3 min-w-[18rem]">白話解讀（上台可直接講）</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-mono">
              {(mlResults.isDemo ? [] : (mlResults.data?.gee?.models?.exchangeable?.rows || [])).map((row: any, idx: number) => {
                const isHighlight = row.term === 'Sales_growth X Positive';
                return (
                  <tr key={idx} className={isHighlight ? 'bg-amber-50 font-semibold text-amber-950' : 'hover:bg-slate-50'}>
                    <td className="px-4 py-2.5 font-sans font-medium">
                      <div>{row.term}</div>
                      <div className="text-[11px] font-normal text-slate-500">{row.term.split(' X ').map((t: string) => VAR_ZH[t] || t).join(' × ')}</div>
                    </td>
                    <td className="px-4 py-2.5">{row.coef.toFixed(3)}{row.stars}</td>
                    <td className="px-4 py-2.5 text-slate-400">({row.se.toFixed(3)})</td>
                    <td className="px-4 py-2.5 text-indigo-600 font-sans">{row.p < 0.001 ? '< 0.001' : row.p.toFixed(3)}</td>
                    <td className="px-4 py-2.5 font-sans text-xs text-slate-700 leading-relaxed">
                      <span className={`inline-block mr-1.5 px-1.5 py-0.5 rounded text-[10px] font-bold ${row.p < 0.05 ? (row.coef > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800') : 'bg-slate-100 text-slate-500'}`}>
                        {row.p < 0.05 ? (row.coef > 0 ? '顯著正向' : '顯著負向') : row.p < 0.1 ? '接近顯著' : '不顯著'}
                      </span>
                      {plainFor(row.term, row.coef, row.p, isHighlight ? -1 : undefined)}
                    </td>
                  </tr>
                );
              })}
              {mlResults.isDemo && (
                <tr><td colSpan={5} className="px-4 py-6 text-center font-sans text-slate-500">尚未計算：真實 GEE 結果產生後會自動顯示。</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Phase 3: Predict - Machine Learning Benchmark on Taiwan Stocks */}
      <div id="rep-ml" className="scroll-mt-48" />
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
        <div className="border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-md text-xs font-bold bg-emerald-100 text-emerald-800">
              Phase 3: Predict
            </span>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 flex-wrap">
              <span>台股機器學習預測精度對比</span>
              <button
                onClick={() => onNavigateToReader && onNavigateToReader('results')}
                className="text-xs font-mono px-2.5 py-1 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-bold transition-colors inline-flex items-center gap-1 cursor-pointer"
                title="點擊直接跳轉至沈浸式翻譯原論文對應章節 (實證結果)"
              >
                <span>(對應沈浸式翻譯章節 📖)</span>
              </button>
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            純量化財務指標 (Quant Only) vs. 量化 + FinMind 新聞情緒雙軌模型 (Quant + Sentiment)
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-700 font-semibold">
                <th className="px-4 py-3">演算法 (Machine Learning Model)</th>
                <th className="px-4 py-3">純財務量化準確率</th>
                <th className="px-4 py-3 text-indigo-700">加入情緒後準確率 💥</th>
                <th className="px-4 py-3">純量化 AUC</th>
                <th className="px-4 py-3 text-indigo-700">加入情緒後 AUC 💥</th>
                <th className="px-4 py-3">特徵重要性與機制分析</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-mono">
              {mlResults.rows.map((ml, idx) => (
                <tr key={idx} className={ml.algorithm.includes('Boosted') ? 'bg-indigo-50/70 font-semibold text-indigo-950' : 'hover:bg-slate-50'}>
                  <td className="px-4 py-3 font-sans font-medium">{ml.algorithm}</td>
                  <td className="px-4 py-3 text-slate-500">{ml.quantOnlyAcc}</td>
                  <td className="px-4 py-3 text-indigo-700 font-bold">{ml.quantTextAcc}</td>
                  <td className="px-4 py-3 text-slate-500">{ml.quantOnlyAuc}</td>
                  <td className="px-4 py-3 text-indigo-700 font-bold">{ml.quantTextAuc}</td>
                  <td className="px-4 py-3 font-sans text-xs text-slate-600">{ml.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className={`text-[11px] leading-relaxed px-3 py-2 rounded-xl border ${mlResults.isDemo ? 'bg-amber-50 border-amber-200 text-amber-900' : 'bg-emerald-50 border-emerald-200 text-emerald-900'}`}>
          {mlResults.sourceLabel}
        </p>

        {/* Accuracy Comparison Bar Display */}
        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
          <div className="text-xs font-bold text-slate-800">
            📊 提升決策樹 (Boosted Decision Tree)：加入新聞情緒前後的準確率
          </div>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs text-slate-600 mb-1">
                <span>純量化財務指標 (Quant Only)</span>
                <span className="font-mono font-bold">{mlTop.quantOnlyAcc}</span>
              </div>
              <div className="h-3 w-full bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full bg-slate-400 rounded-full" style={{ width: mlTop.quantOnlyAcc }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs text-indigo-700 font-semibold mb-1">
                <span>量化 + FinMind 新聞情緒 (Quant + Sentiment)</span>
                <span className="font-mono font-bold">{mlTop.quantTextAcc}{mlResults.isDemo ? '（示範數字）' : ''}</span>
              </div>
              <div className="h-3.5 w-full bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full" style={{ width: mlTop.quantTextAcc }}></div>
              </div>
            </div>
          </div>
          <p className="text-[11px] text-slate-500 italic">
            {mlResults.isDemo
              ? '示範數字來自原論文。實務上用新聞預測股價，準確率穩定超過 55%～60% 已屬不易；原文表 8 出現 99.7%，而原文沒有說明 60/40 是否依時間切分，可能有資料洩漏（模型偷看到未來資訊）的疑慮，值得帶學生一起檢討。'
              : `真實結果：比較「純量化」與「量化＋情緒」兩列，看加入新聞情緒後是否真的贏過基準準確率 ${mlResults.baselineAcc}（全部猜多數類別）。差距很小或反而變差，也是有意義的實證發現。`}
          </p>
        </div>

        <MlExampleVideo />
      </div>

      {/* Interactive Simulator: Sensitivity & Interaction Surface */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
        <div className="border-b border-slate-100 pb-4">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Sliders className="w-5 h-5 text-indigo-600" />
            台股交互作用動態敏感度模擬器 (Interactive Sensitivity Simulator)
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            滑動調整台股營收成長與淨值比，親自體驗「正面情緒邊際遞減」與「負面情緒落井下石」的計量動力學
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Controls */}
          <div className="lg:col-span-5 space-y-5">
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                <span>營收年增率 (Sales Growth)</span>
                <span className="font-mono text-indigo-600">{simSalesGrowth}%</span>
              </div>
              <input
                type="range"
                min="-20"
                max="80"
                value={simSalesGrowth}
                onChange={(e) => setSimSalesGrowth(Number(e.target.value))}
                className="w-full accent-indigo-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>-20% (衰退)</span>
                <span>+30% (高成長)</span>
                <span>+80% (超高速成長)</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                <span>市值淨值比 (MB Ratio / PB)</span>
                <span className="font-mono text-indigo-600">{simMbRatio}x</span>
              </div>
              <input
                type="range"
                min="1.0"
                max="10.0"
                step="0.5"
                value={simMbRatio}
                onChange={(e) => setSimMbRatio(Number(e.target.value))}
                className="w-full accent-indigo-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>1.0x (深度價值)</span>
                <span>5.0x (一般成長)</span>
                <span>10.0x (極致溢價)</span>
              </div>
            </div>

            <div>
              <div className="text-xs font-semibold text-slate-700 mb-2">新聞輿情情緒氛圍：</div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setSimSentimentMode('high_pos')}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                    simSentimentMode === 'high_pos'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>偏多正面新聞 (High Pos)</span>
                </button>
                <button
                  onClick={() => setSimSentimentMode('high_neg')}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                    simSentimentMode === 'high_neg'
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <TrendingDown className="w-3.5 h-3.5" />
                  <span>偏空負面新聞 (High Neg)</span>
                </button>
              </div>
            </div>
          </div>

          {/* Result Card */}
          <div className="lg:col-span-7 bg-gradient-to-br from-slate-50 to-indigo-50/40 p-6 rounded-2xl border border-indigo-100 flex flex-col justify-between h-full space-y-4">
            <div>
              <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1">
                模型預測之標準化累積超額報酬 (Predicted SCAR)
              </div>
              <div className="flex items-baseline gap-3">
                <span className={`text-4xl font-extrabold font-mono ${
                  predictedScar >= 0 ? 'text-indigo-700' : 'text-rose-600'
                }`}>
                  {predictedScar >= 0 ? `+${predictedScar}%` : `${predictedScar}%`}
                </span>
                <span className="text-xs text-slate-500">超額 Alpha 預期</span>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-2">
              <div className="font-bold text-slate-900 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-500" />
                當前參數下的交互作用解碼：
              </div>
              {simSentimentMode === 'high_pos' ? (
                <p className="leading-relaxed">
                  目前處於<strong>利多情緒</strong>環境。當營收年增率為 {simSalesGrowth}% 時：
                  {simSalesGrowth > 30 ? (
                    <span className="text-amber-700 font-medium">
                      ⚠️ 邊際遞減已啟動！因營收已大幅成長，正面新聞對股價推升的邊際效益明顯縮小（利多出盡效應）。
                    </span>
                  ) : (
                    <span className="text-emerald-700 font-medium">
                      ✅ 在中低成長區間，正面新聞情緒能發揮最強大的激勵推升力道！
                    </span>
                  )}
                </p>
              ) : (
                <p className="leading-relaxed">
                  目前處於<strong>利空負面情緒</strong>環境。
                  {simSalesGrowth > 30 ? (
                    <span className="text-rose-700 font-medium">
                      💥 嚴重警訊！高成長股 ({simSalesGrowth}%) 遭遇負面新聞時，市場給予雙重懲罰，超額報酬劇烈暴跌！
                    </span>
                  ) : (
                    <span className="text-slate-700">
                      負面情緒使得超額報酬大幅轉負，低成長股雪上加霜。
                    </span>
                  )}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Copyable Python FinMind Script */}
      <div className="bg-slate-900 rounded-2xl p-6 sm:p-8 text-slate-200 shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <Code className="w-5 h-5 text-indigo-400" />
            <h3 className="text-base font-bold text-white">
              FinMind 工具台股完整復刻 Python 腳本 (支援下載與複製)
            </h3>
          </div>
          <button
            onClick={handleCopyCode}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-colors"
          >
            {copiedCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedCode ? '已複製到剪貼簿！' : '複製 Python 程式碼'}</span>
          </button>
        </div>

        <p className="text-xs text-slate-400">
          此腳本封裝了 FinMind 數據工具調取、台股財報特徵建構、中文化金融情緒詞典探勘，以及 GEE 與梯度提升決策樹訓練管線。
        </p>

        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 overflow-x-auto max-h-96">
          <pre className="font-mono text-xs text-indigo-300 leading-relaxed">
            {PYTHON_REPLICATION_SCRIPT}
          </pre>
        </div>
      </div>

      {/* Machine Learning Cloud Tools Section Header */}
      <div className="pt-4 space-y-2">
        <div className="flex items-center gap-2">
          <Cpu className="w-5 h-5 text-indigo-400" />
          <h3 className="text-lg font-bold text-slate-800">
            台積電 (2330.TW) 機器學習雲端實戰工具專區 (Google Colab Notebooks)
          </h3>
        </div>
        <div className="text-xs px-3 py-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-900">
          ⚠️ 教學示範區：以下工具卡中的表格、準確率與 CSV 範例都是<strong>虛構的示範資料</strong>，只用來說明程式怎麼跑，<strong>不是本研究的結果</strong>。
          本研究的真實結果請看上方的 GEE 表與機器學習比較表（與「論文報告」簡報同一份資料）。
        </div>
        <p className="text-xs text-slate-500">
          提供免本地配置、在 Google 雲端即開即跑的完整 Python Notebook，涵蓋支持向量機 (SVM) 高維情緒空間超平面、深度神經網路 (MLP) 多層特徵交互抽取、二元邏輯迴歸 (Logistic Regression)、隨機森林 (Random Forest) 與梯度提升決策樹 (LightGBM)。
        </p>
      </div>

      {/* Tool: TSMC Support Vector Machine (SVM) Tool */}
      <div className="bg-gradient-to-br from-slate-900 via-cyan-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-slate-100 shadow-2xl border border-cyan-500/40 space-y-6 relative overflow-hidden">
        {/* Glow ambient background effect */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-teal-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 pb-6 border-b border-cyan-800/40">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-cyan-400 text-slate-950 flex items-center gap-1.5 shadow-sm">
                <Sparkles className="w-3.5 h-3.5" />
                新增工具
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-cyan-500/25 text-cyan-300 border border-cyan-400/40">
                Google Colab 雲端免配置環境
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-teal-500/20 text-teal-300 border border-teal-400/30">
                支持向量機 (Support Vector Machine / SVM)
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-sky-500/20 text-sky-300 border border-sky-400/30">
                台積電 (2330.TW)
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-400/30">
                高維情緒空間超平面
              </span>
            </div>
            
            <h3 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
              <span>下載台積電後 Support Vector Machine (支持向量機 SVM) 71.2% 78.9% 50.3% 79.2% 高維情緒空間超平面</span>
            </h3>

            {/* Performance Benchmark Highlight Chips */}
            <div className="flex flex-wrap items-center gap-3 py-1">
              <div className="px-3 py-1.5 rounded-xl bg-slate-950/80 border border-cyan-500/30 flex items-center gap-2 text-xs">
                <span className="text-slate-400">分類準確率 (Accuracy):</span>
                <span className="text-slate-400 line-through">71.2%</span>
                <ArrowRight className="w-3 h-3 text-cyan-400" />
                <span className="text-cyan-300 font-bold">78.9% (+7.7%)</span>
              </div>
              <div className="px-3 py-1.5 rounded-xl bg-slate-950/80 border border-teal-500/30 flex items-center gap-2 text-xs">
                <span className="text-slate-400">辨識指標 (AUC):</span>
                <span className="text-slate-400 line-through">50.3%</span>
                <ArrowRight className="w-3 h-3 text-teal-400" />
                <span className="text-teal-300 font-bold">79.2% (+28.9%)</span>
              </div>
              <div className="px-3 py-1.5 rounded-xl bg-slate-950/80 border border-emerald-500/30 flex items-center gap-2 text-xs text-emerald-300 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>重現論文 Table 4 高維核函數映射與最大邊際超平面</span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-3xl">
              專為台積電（2330.TW）量化回測與情緒實證打造之支持向量機 (SVM) 雲端筆記本。復刻論文基準實驗，利用高斯徑向基核函數 (RBF Kernel) 將台積電基本面量化財務指標與新聞情感向量投射至高維特徵空間，尋求最大邊際分離超平面 (Maximum Margin Hyperplane)。加入文本情緒後，AUC 從 50.3% 巨幅躍升至 79.2%，準確率提升至 78.9%。
            </p>
          </div>

          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 shrink-0">
            <a
              href={COLAB_SVM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-cyan-400 via-teal-400 to-emerald-400 hover:from-cyan-300 hover:to-emerald-300 text-slate-950 font-extrabold text-xs sm:text-sm flex items-center gap-2 shadow-lg hover:shadow-cyan-500/20 transition-all active:scale-95 group"
            >
              <ExternalLink className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              <span>開啟 Google Colab 筆記本</span>
            </a>

            <button
              onClick={handleCopySvmUrl}
              className="px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-slate-600 font-semibold text-xs flex items-center gap-2 transition-all active:scale-95"
              title="複製 Google Colab 筆記本分享網址"
            >
              {copiedSvmUrl ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copiedSvmUrl ? '已複製網址！' : '複製 Colab 連結'}</span>
            </button>

            <button
              onClick={handleDownloadTsmcSvmDataset}
              className="px-4 py-3 rounded-xl bg-cyan-950/80 hover:bg-cyan-900 text-cyan-200 border border-cyan-700/50 hover:border-cyan-600 font-semibold text-xs flex items-center gap-2 transition-all active:scale-95"
              title="下載台積電支持向量機 SVM 特徵資料集 CSV"
            >
              <Download className="w-4 h-4 text-cyan-300" />
              <span>下載特徵資料集 (.csv)</span>
            </button>
          </div>
        </div>

        {/* 3 Step Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative z-10">
          <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-xs">
              01
            </div>
            <h4 className="font-bold text-sm text-white">高維特徵投影與核函數 (RBF Kernel)</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              下載台積電歷史走勢與新聞情感分數，透過高斯徑向基函數 (RBF) 投射至無窮維希爾伯特空間，解決線性不可分難題。
            </p>
          </div>

          <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold text-xs">
              02
            </div>
            <h4 className="font-bold text-sm text-white">最大間距超平面與支持向量抽取</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              透過二次規劃對偶問題計算拉格朗日乘子，鎖定決策邊界上的關鍵支持向量 (Support Vectors)，構建強健分類邊界。
            </p>
          </div>

          <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
              03
            </div>
            <h4 className="font-bold text-sm text-white">效能大幅躍升 (71.2%➔78.9% / 50.3%➔79.2%)</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              繪製決策超平面邊界投影、ROC-AUC 辨識曲線與混淆矩陣，驗證文本特徵能實質拉開正負樣本間距 (Margin)。
            </p>
          </div>
        </div>

        {/* Colab Link Box */}
        <div className="bg-slate-950/90 p-4 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono relative z-10">
          <div className="flex items-center gap-2 text-slate-400 overflow-hidden w-full sm:w-auto">
            <span className="text-cyan-400 font-bold shrink-0">Colab 網址:</span>
            <span className="truncate text-cyan-300 select-all font-mono">
              {COLAB_SVM_URL}
            </span>
          </div>
          <a
            href={COLAB_SVM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1 shrink-0 transition-colors"
          >
            <span>直接前往執行</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Tool: TSMC Deep Neural Network (MLP) Tool */}
      <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-slate-100 shadow-2xl border border-blue-500/40 space-y-6 relative overflow-hidden">
        {/* Glow ambient background effect */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 pb-6 border-b border-blue-800/40">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-400 text-slate-950 flex items-center gap-1.5 shadow-sm">
                <Sparkles className="w-3.5 h-3.5" />
                新增工具
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/25 text-blue-300 border border-blue-400/40">
                Google Colab 雲端免配置環境
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                深度神經網路 (Deep Neural Network / MLP)
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-sky-500/20 text-sky-300 border border-sky-400/30">
                台積電 (2330.TW)
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-400/30">
                多層特徵交互抽取
              </span>
            </div>
            
            <h3 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
              <span>下載台積電後 執行 Deep Neural Network (深度神經網路 MLP) 70.8% 80.5% 52.0% 75.2% 多層特徵交互抽取</span>
            </h3>

            {/* Performance Benchmark Highlight Chips */}
            <div className="flex flex-wrap items-center gap-3 py-1">
              <div className="px-3 py-1.5 rounded-xl bg-slate-950/80 border border-blue-500/30 flex items-center gap-2 text-xs">
                <span className="text-slate-400">分類準確率 (Accuracy):</span>
                <span className="text-slate-400 line-through">70.8%</span>
                <ArrowRight className="w-3 h-3 text-blue-400" />
                <span className="text-blue-300 font-bold">80.5% (+9.7%)</span>
              </div>
              <div className="px-3 py-1.5 rounded-xl bg-slate-950/80 border border-indigo-500/30 flex items-center gap-2 text-xs">
                <span className="text-slate-400">辨識指標 (AUC):</span>
                <span className="text-slate-400 line-through">52.0%</span>
                <ArrowRight className="w-3 h-3 text-indigo-400" />
                <span className="text-indigo-300 font-bold">75.2% (+23.2%)</span>
              </div>
              <div className="px-3 py-1.5 rounded-xl bg-slate-950/80 border border-emerald-500/30 flex items-center gap-2 text-xs text-emerald-300 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>重現論文 Table 4 文字情緒消除邊界模糊效應</span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-3xl">
              專為台積電（2330.TW）量化實證打造之深度神經網路 (Deep Neural Network / MLP) 筆記本。復刻論文基準實驗，利用多層隱藏層神經元與非線性激活函數（ReLU / Dropout），自動抽取基本面量化財務指標與金融新聞情緒分數間的高階非線性特徵交互作用項 (Multi-Layer Feature Interaction)，成功將準確率由 70.8% 大幅推升至 80.5%、AUC 由 52.0% 突破至 75.2%。
            </p>
          </div>

          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 shrink-0">
            <a
              href={COLAB_DNN_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-blue-400 via-indigo-400 to-violet-400 hover:from-blue-300 hover:to-violet-300 text-slate-950 font-extrabold text-xs sm:text-sm flex items-center gap-2 shadow-lg hover:shadow-blue-500/20 transition-all active:scale-95 group"
            >
              <ExternalLink className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              <span>開啟 Google Colab 筆記本</span>
            </a>

            <button
              onClick={handleCopyDnnUrl}
              className="px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-slate-600 font-semibold text-xs flex items-center gap-2 transition-all active:scale-95"
              title="複製 Google Colab 筆記本分享網址"
            >
              {copiedDnnUrl ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copiedDnnUrl ? '已複製網址！' : '複製 Colab 連結'}</span>
            </button>

            <button
              onClick={handleDownloadTsmcDnnDataset}
              className="px-4 py-3 rounded-xl bg-blue-950/80 hover:bg-blue-900 text-blue-200 border border-blue-700/50 hover:border-blue-600 font-semibold text-xs flex items-center gap-2 transition-all active:scale-95"
              title="下載台積電深度神經網路 MLP 特徵資料集 CSV"
            >
              <Download className="w-4 h-4 text-blue-300" />
              <span>下載特徵資料集 (.csv)</span>
            </button>
          </div>
        </div>

        {/* 3 Step Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative z-10">
          <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-xs">
              01
            </div>
            <h4 className="font-bold text-sm text-white">多模態特徵標準化與輸入管線</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              下載台積電 (2330.TW) 日線量價、營收 YoY 與 LM 詞典金融情緒分數，進行 Min-Max 歸一化建構高維張量輸入矩陣。
            </p>
          </div>

          <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-xs">
              02
            </div>
            <h4 className="font-bold text-sm text-white">多層感知機 (MLP) 深度交互抽取</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              構建 Dense(128) ➔ ReLU ➔ Dropout(0.3) ➔ Dense(64) ➔ Sigmoid 架構，由神經元權重自動學習跨領域高階非線性交互項。
            </p>
          </div>

          <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-violet-500/20 text-violet-400 flex items-center justify-center font-bold text-xs">
              03
            </div>
            <h4 className="font-bold text-sm text-white">效能大幅躍升 (70.8%➔80.5% / 52.0%➔75.2%)</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              產出 Loss 訓練收斂曲線、ROC-AUC 辨識曲線與混淆矩陣，驗證文字情緒能有效消解決策邊界的模糊模糊點。
            </p>
          </div>
        </div>

        {/* Colab Link Box */}
        <div className="bg-slate-950/90 p-4 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono relative z-10">
          <div className="flex items-center gap-2 text-slate-400 overflow-hidden w-full sm:w-auto">
            <span className="text-blue-400 font-bold shrink-0">Colab 網址:</span>
            <span className="truncate text-blue-300 select-all font-mono">
              {COLAB_DNN_URL}
            </span>
          </div>
          <a
            href={COLAB_DNN_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1 shrink-0 transition-colors"
          >
            <span>直接前往執行</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Tool: TSMC (2330.TW) Two-Class Logistic Regression Model */}
      <div className="bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-slate-100 shadow-2xl border border-purple-500/40 space-y-6 relative overflow-hidden">
        {/* Glow ambient background effect */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-purple-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-fuchsia-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 pb-6 border-b border-purple-800/40">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-400 text-slate-950 flex items-center gap-1.5 shadow-sm">
                <Sparkles className="w-3.5 h-3.5" />
                新增工具
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/25 text-purple-300 border border-purple-400/40">
                Google Colab 雲端免配置環境
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-400/30">
                二元分類邏輯迴歸 (Two-Class Logistic Regression)
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-sky-500/20 text-sky-300 border border-sky-400/30">
                台積電 (2330.TW)
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                漲跌機率建模
              </span>
            </div>
            
            <h3 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
              <span>下載台積電（2330.TW）的歷史股價數據，並建立一個二元分類的邏輯迴歸（Two-Class Logistic Regression）模型來預測股價漲跌。</span>
            </h3>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-3xl">
              專為台積電（2330.TW）量身打造之統計機器學習二元分類筆記本。從歷史股價時序數據中自動提取動能報酬率、多期移動平均線偏差 (MA Spread)、RSI 強弱指標與成交量變動比，透過 Sigmoid 激活函數建立邏輯迴歸模型，預測次日股價「上漲 (Class 1)」或「下跌 (Class 0)」之精確機率 (Probability)，並輸出對數勝算比 (Log-Odds)、顯著性係數、ROC 曲線與最佳分類閾值。
            </p>
          </div>

          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 shrink-0">
            <a
              href={COLAB_LOGISTIC_REGRESSION_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-purple-400 via-fuchsia-400 to-pink-400 hover:from-purple-300 hover:to-pink-300 text-slate-950 font-extrabold text-xs sm:text-sm flex items-center gap-2 shadow-lg hover:shadow-purple-500/20 transition-all active:scale-95 group"
            >
              <ExternalLink className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              <span>開啟 Google Colab 筆記本</span>
            </a>

            <button
              onClick={handleCopyLrUrl}
              className="px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-slate-600 font-semibold text-xs flex items-center gap-2 transition-all active:scale-95"
              title="複製 Google Colab 筆記本分享網址"
            >
              {copiedLrUrl ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copiedLrUrl ? '已複製網址！' : '複製 Colab 連結'}</span>
            </button>

            <button
              onClick={handleDownloadTsmcLrDataset}
              className="px-4 py-3 rounded-xl bg-purple-950/80 hover:bg-purple-900 text-purple-200 border border-purple-700/50 hover:border-purple-600 font-semibold text-xs flex items-center gap-2 transition-all active:scale-95"
              title="下載台積電邏輯迴歸二元分類特徵資料集 CSV"
            >
              <Download className="w-4 h-4 text-purple-300" />
              <span>下載特徵資料集 (.csv)</span>
            </button>
          </div>
        </div>

        {/* 3 Step Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative z-10">
          <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-xs">
              01
            </div>
            <h4 className="font-bold text-sm text-white">歷史時序與動能指標特徵工程</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              提取台積電 (2330.TW) 日線數據，建構滯後報酬率 (Lag Returns)、MA5 乖離率、RSI14 與量能放大倍數，並標記次日漲跌二元標籤。
            </p>
          </div>

          <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-fuchsia-500/20 text-fuchsia-400 flex items-center justify-center font-bold text-xs">
              02
            </div>
            <h4 className="font-bold text-sm text-white">二元邏輯迴歸模型 (Sigmoid) 擬合</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              透過最大概似估計法 (MLE) 求解迴歸係數，輸出對數勝算比 (Odds Ratio) 與次日上漲機率 P(y=1|X) 預測分佈。
            </p>
          </div>

          <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-pink-500/20 text-pink-400 flex items-center justify-center font-bold text-xs">
              03
            </div>
            <h4 className="font-bold text-sm text-white">分類閾值微調與統計顯著性驗證</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              繪製 ROC-AUC 曲線圖、混淆矩陣 (Confusion Matrix) 與各變數統計顯著性指標，提供可解釋性極高的量化決策邊界。
            </p>
          </div>
        </div>

        {/* Colab Link Box */}
        <div className="bg-slate-950/90 p-4 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono relative z-10">
          <div className="flex items-center gap-2 text-slate-400 overflow-hidden w-full sm:w-auto">
            <span className="text-purple-400 font-bold shrink-0">Colab 網址:</span>
            <span className="truncate text-purple-300 select-all font-mono">
              {COLAB_LOGISTIC_REGRESSION_URL}
            </span>
          </div>
          <a
            href={COLAB_LOGISTIC_REGRESSION_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-purple-400 hover:text-purple-300 font-semibold flex items-center gap-1 shrink-0 transition-colors"
          >
            <span>直接前往執行</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Tool 1: TSMC (2330.TW) Random Forest Classification and Evaluation Tool */}
      <div className="bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-slate-100 shadow-2xl border border-emerald-500/40 space-y-6 relative overflow-hidden">
        {/* Glow ambient background effect */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-teal-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 pb-6 border-b border-emerald-800/40">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-400 text-slate-950 flex items-center gap-1.5 shadow-sm">
                <Sparkles className="w-3.5 h-3.5" />
                新增工具
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/25 text-emerald-300 border border-emerald-400/40">
                Google Colab 雲端免配置環境
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-teal-500/20 text-teal-300 border border-teal-400/30">
                隨機森林 (Random Forest)
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-sky-500/20 text-sky-300 border border-sky-400/30">
                台積電 (2330.TW)
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-400/30">
                分類預測與評估
              </span>
            </div>
            
            <h3 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
              <span>下載台積電（2330.TW）的歷史股價數據，並使用隨機森林（Random Forest）演算法進行分類預測與評估</span>
            </h3>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-3xl">
              專為台股龍頭台積電（2330.TW）設計之機器學習分類實戰筆記本。自動下載歷史日 K 棒數據，建構移動平均線 (SMA)、相對強弱指標 (RSI)、KD 隨機指標、MACD 與成交量能等多維特徵，運用隨機森林集成袋裝法 (Random Forest / Bagging) 進行漲跌方向二元預測、袋外評估 (OOB Score)、混淆矩陣分析與特徵重要性權重排序。
            </p>
          </div>

          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 shrink-0">
            <a
              href={COLAB_RANDOM_FOREST_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 hover:from-emerald-300 hover:to-cyan-300 text-slate-950 font-extrabold text-xs sm:text-sm flex items-center gap-2 shadow-lg hover:shadow-emerald-500/20 transition-all active:scale-95 group"
            >
              <ExternalLink className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              <span>開啟 Google Colab 筆記本</span>
            </a>

            <button
              onClick={handleCopyRfUrl}
              className="px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-slate-600 font-semibold text-xs flex items-center gap-2 transition-all active:scale-95"
              title="複製 Google Colab 筆記本分享網址"
            >
              {copiedRfUrl ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copiedRfUrl ? '已複製網址！' : '複製 Colab 連結'}</span>
            </button>

            <button
              onClick={handleDownloadTsmcRfDataset}
              className="px-4 py-3 rounded-xl bg-emerald-950/80 hover:bg-emerald-900 text-emerald-200 border border-emerald-700/50 hover:border-emerald-600 font-semibold text-xs flex items-center gap-2 transition-all active:scale-95"
              title="下載台積電隨機森林特徵資料集 CSV"
            >
              <Download className="w-4 h-4 text-emerald-300" />
              <span>下載特徵資料集 (.csv)</span>
            </button>
          </div>
        </div>

        {/* 3 Step Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative z-10">
          <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
              01
            </div>
            <h4 className="font-bold text-sm text-white">台積電 (2330.TW) 數據調取與特徵擴展</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              下載歷史開高低收與成交量數據，自動計算 SMA(5/20)、RSI(14)、KD 指標、MACD 差離值與報酬標籤 (Next-Day Direction)。
            </p>
          </div>

          <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold text-xs">
              02
            </div>
            <h4 className="font-bold text-sm text-white">隨機森林集成決策樹建模</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              建立 100+ 棵決策樹組成的隨機森林（RandomForestClassifier），以隨機特徵採樣與 Bagging 技術有效避免單一樹的過擬合問題。
            </p>
          </div>

          <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-xs">
              03
            </div>
            <h4 className="font-bold text-sm text-white">模型分類評估與特徵重要性分析</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              輸出 Accuracy、Precision、Recall、F1-Score 及混淆矩陣熱力圖，並排列 Feature Importance 關鍵指標貢獻排行。
            </p>
          </div>
        </div>

        {/* Colab Link Box */}
        <div className="bg-slate-950/90 p-4 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono relative z-10">
          <div className="flex items-center gap-2 text-slate-400 overflow-hidden w-full sm:w-auto">
            <span className="text-emerald-400 font-bold shrink-0">Colab 網址:</span>
            <span className="truncate text-emerald-300 select-all font-mono">
              {COLAB_RANDOM_FOREST_URL}
            </span>
          </div>
          <a
            href={COLAB_RANDOM_FOREST_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1 shrink-0 transition-colors"
          >
            <span>直接前往執行</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Tool 2: TSMC LightGBM / Boosted Decision Tree Google Colab Notebook Tool */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-slate-100 shadow-2xl border border-indigo-500/40 space-y-6 relative overflow-hidden">
        {/* Glow ambient background effect */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 pb-6 border-b border-indigo-800/40">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-400 text-slate-950 flex items-center gap-1.5 shadow-sm">
                <Sparkles className="w-3.5 h-3.5" />
                新增工具
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/25 text-indigo-300 border border-indigo-400/40">
                Google Colab 雲端免配置環境
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                LightGBM / GBDT 決策樹
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-sky-500/20 text-sky-300 border border-sky-400/30">
                台積電 (2330)
              </span>
            </div>
            
            <h3 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
              <span>下載台積電後 Boosted Decision Tree (梯度提升決策樹 / LightGBM)</span>
            </h3>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-3xl">
              專為復刻 Raman et al. (2022) 論文第三階段設計之 Python 實戰筆記本。整合 FinMind 數據工具調取台積電 (2330) 股價、月營收年增率 (YoY) 與 Loughran-McDonald 金融情緒詞庫交互項，並以高效 LightGBM / 梯度提升決策樹訓練超額報酬分類預測器。
            </p>
          </div>

          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 shrink-0">
            <a
              href={COLAB_LIGHTGBM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-extrabold text-xs sm:text-sm flex items-center gap-2 shadow-lg hover:shadow-amber-500/20 transition-all active:scale-95 group"
            >
              <ExternalLink className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              <span>開啟 Google Colab 筆記本</span>
            </a>

            <button
              onClick={handleCopyLightGbmUrl}
              className="px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-slate-600 font-semibold text-xs flex items-center gap-2 transition-all active:scale-95"
              title="複製 Google Colab 筆記本分享網址"
            >
              {copiedLightGbmUrl ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copiedLightGbmUrl ? '已複製網址！' : '複製 Colab 連結'}</span>
            </button>

            <button
              onClick={handleDownloadTsmcLightGbmDataset}
              className="px-4 py-3 rounded-xl bg-indigo-900/60 hover:bg-indigo-800/80 text-indigo-200 border border-indigo-700/50 hover:border-indigo-600 font-semibold text-xs flex items-center gap-2 transition-all active:scale-95"
              title="下載台積電 LightGBM 特徵資料集 CSV"
            >
              <Download className="w-4 h-4 text-indigo-300" />
              <span>下載台積電資料集 (.csv)</span>
            </button>
          </div>
        </div>

        {/* 3 Step Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative z-10">
          <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-xs">
              01
            </div>
            <h4 className="font-bold text-sm text-white">台積電 (2330) 數據調取與特徵工程</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              透過 FinMind 自動調取歷史日 K 棒、財務月營收年增率、本益比，並結合 Loughran-McDonald 金融情感詞庫清洗新聞輿情分數。
            </p>
          </div>

          <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs">
              02
            </div>
            <h4 className="font-bold text-sm text-white">LightGBM / GBDT 梯度提升決策樹</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              重現論文 Table 4，將非線性交互作用項（Sales Growth × Sentiment）導入決策樹演算法，訓練高效且可解釋的分支權重。
            </p>
          </div>

          <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
              03
            </div>
            <h4 className="font-bold text-sm text-white">一鍵 Run All 視覺化產出</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Google Colab 環境自動配置相依套件，提供 ROC-AUC 曲線繪製、混淆矩陣分析與特徵重要性 (Feature Importance) 權重圖表。
            </p>
          </div>
        </div>

        {/* Colab Link Box */}
        <div className="bg-slate-950/90 p-4 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono relative z-10">
          <div className="flex items-center gap-2 text-slate-400 overflow-hidden w-full sm:w-auto">
            <span className="text-amber-400 font-bold shrink-0">Colab 網址:</span>
            <span className="truncate text-indigo-300 select-all font-mono">
              {COLAB_LIGHTGBM_URL}
            </span>
          </div>
          <a
            href={COLAB_LIGHTGBM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1 shrink-0 transition-colors"
          >
            <span>直接前往執行</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Image Lightbox Modal */}
      <ImageLightboxModal
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        initialImageId={lightboxImgId}
        onAskGemini={onAskGemini}
      />
    </div>
  );
};
