import { useEffect, useState } from 'react';
import { Download } from 'lucide-react';

// =====================================================================
// 新聞數據下載：
// - 若伺服器上有 news_all.csv（每次真實計算時輸出全部新聞與情緒分數），直接下載完整檔
// - 否則從 ml_results.json 內保存的新聞樣本（最近 3,000 則）即時產生 CSV
// 另提供完整計算結果 ml_results.json 下載。
// =====================================================================

const csvCell = (v: any) => {
  const s = v == null ? '' : String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

export function NewsDownload({ data, dark = false }: { data: any | null; dark?: boolean }) {
  const [fullAvailable, setFullAvailable] = useState(false);

  useEffect(() => {
    fetch('/data/news_all.csv', { method: 'HEAD', cache: 'no-store' })
      .then((r) => setFullAvailable(r.ok && !(r.headers.get('content-type') || '').includes('text/html')))
      .catch(() => setFullAvailable(false));
  }, [data?.generatedAt]);

  if (!data) return null;

  const downloadSample = () => {
    const rows: any[] = data.articles || [];
    const names: Record<string, string> = Object.fromEntries((data.stocks || []).map((s: any) => [s.id, s.name]));
    const header = ['date', 'stock_id', 'stock_name', 'title', 'source', 'link', 'score'];
    const lines = [header.join(',')].concat(
      rows.map((a) => [a.date, a.stock_id, names[a.stock_id] || '', a.title, a.source, a.link, a.score].map(csvCell).join(',')),
    );
    const blob = new Blob(['﻿' + lines.join('\n')], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const el = document.createElement('a');
    el.href = url;
    el.download = `finmind_news_sample_${String(data.generatedAt || '').slice(0, 10)}.csv`;
    document.body.appendChild(el);
    el.click();
    el.remove();
    URL.revokeObjectURL(url);
  };

  const btn = dark
    ? 'h-9 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20'
    : 'h-9 px-3 rounded-xl bg-white hover:bg-slate-50 text-slate-800 border border-slate-300';

  return (
    <div className="flex flex-wrap items-center gap-2 text-xs">
      {fullAvailable ? (
        <a href="/data/news_all.csv" download className={`${btn} font-semibold flex items-center gap-1.5`}>
          <Download className="w-3.5 h-3.5" /> 下載全部新聞（CSV，{data.articleCount?.toLocaleString()} 則）
        </a>
      ) : (
        <button onClick={downloadSample} className={`${btn} font-semibold flex items-center gap-1.5`}>
          <Download className="w-3.5 h-3.5" /> 下載新聞數據（CSV，最近 {(data.articles?.length || 0).toLocaleString()} 則）
        </button>
      )}
      <a href="/data/ml_results.json" download className={`${btn} font-semibold flex items-center gap-1.5`}>
        <Download className="w-3.5 h-3.5" /> 下載計算結果（JSON）
      </a>
      <span className={dark ? 'text-slate-400' : 'text-slate-500'}>
        {fullAvailable
          ? '欄位：日期、股票代號、標題、來源、連結、情緒分數（−1～+1）'
          : `完整 ${data.articleCount?.toLocaleString()} 則會在下一次自動計算後提供下載；目前先提供最近的樣本。`}
      </span>
    </div>
  );
}
