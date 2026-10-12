// =====================================================================
// 台股機器學習比較表的資料來源
// ---------------------------------------------------------------------
// 1. 若伺服器上有 /data/ml_results.json（由 news_ml_study.py 以真實 FinMind 新聞計算產生），
//    就顯示真實結果，並附上樣本數、期間與計算時間。
// 2. 若沒有，退回內建的示範數字（TAIWAN_ML_BENCHMARK），並明確標示為「示範數字」。
// =====================================================================
import { useEffect, useState } from 'react';
import { TAIWAN_ML_BENCHMARK } from '../data/finmindTaiwanData.ts';

export interface MlRow {
  algorithm: string;
  quantOnlyAcc: string;
  quantTextAcc: string;
  quantOnlyAuc: string;
  quantTextAuc: string;
  note: string;
}

export interface MlResults {
  isDemo: boolean;
  rows: MlRow[];
  sourceLabel: string; // 表格下方顯示的資料來源說明
  generatedAt?: string;
  articleCount?: number;
  sampleCount?: number;
  baselineAcc?: string;
  data?: any; // ml_results.json 原始內容（GEE、個股統計、新聞樣本等），論文報告投影片使用
}

const DEMO: MlResults = {
  isDemo: true,
  rows: TAIWAN_ML_BENCHMARK,
  sourceLabel: '⚠️ 示範數字：參照原論文（美股）結果，尚未以台股真實新聞計算。執行 news_ml_study.py 後會自動改為真實結果。',
};

let cache: Promise<MlResults> | null = null;

function loadMlResults(): Promise<MlResults> {
  if (!cache) {
    cache = fetch(`/data/ml_results.json?t=${Date.now()}`, { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((d: any): MlResults => {
        if (!Array.isArray(d?.rows) || d.rows.length === 0) return DEMO;
        const stocks = (d.stocks || []).map((s: any) => `${s.name || ''}${s.id}`).join('、');
        return {
          isDemo: false,
          rows: d.rows,
          generatedAt: d.generatedAt,
          articleCount: d.articleCount,
          sampleCount: d.sampleCount,
          baselineAcc: d.split?.baselineAcc,
          data: d,
          sourceLabel:
            `✅ 真實資料：FinMind 新聞 ${d.articleCount} 則（${stocks}，${d.period?.start}～${d.period?.end}）｜` +
            `情緒判讀：${d.sentimentEngine}｜預測目標：${d.target}｜` +
            `測試集 ${d.split?.testN} 筆（${d.split?.testStart} 起），全猜多數類別的基準準確率 ${d.split?.baselineAcc}｜` +
            `計算時間 ${String(d.generatedAt || '').replace('T', ' ')}`,
        };
      })
      .catch(() => DEMO);
  }
  return cache;
}

const listeners = new Set<(r: MlResults) => void>();

/** 重新向伺服器讀取最新的 ml_results.json（「更新數據」按鈕使用），並通知所有頁面 */
export async function reloadMlResults(): Promise<MlResults> {
  cache = null;
  const r = await loadMlResults();
  listeners.forEach((fn) => fn(r));
  return r;
}

/** React hook：先回傳示範數字，載入完成後若有真實結果就自動替換 */
export function useMlResults(): MlResults {
  const [state, setState] = useState<MlResults>(DEMO);
  useEffect(() => {
    let alive = true;
    loadMlResults().then((r) => alive && setState(r));
    const fn = (r: MlResults) => alive && setState(r);
    listeners.add(fn);
    return () => { alive = false; listeners.delete(fn); };
  }, []);
  return state;
}
