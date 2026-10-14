// =====================================================================
// 台股復刻「真實計算結果」摘要：一律讀取 public/data/ml_results.json
// （由 news_ml_study.py 以 FinMind 真實新聞與財報計算），與簡報講稿同一資料來源。
// 尚未計算時只顯示「尚未計算」，不顯示任何示範數字。
// =====================================================================

export function geeTerm(data: any, term: string, model = 'exchangeable') {
  return data?.gee?.models?.[model]?.rows?.find((r: any) => r.term === term);
}

/** 台股主要發現的白話總結（依當天係數方向自動產生） */
function plainSummary(pos: any, neg: any, inter: any): string {
  const parts: string[] = [];
  if (pos && pos.p < 0.05) parts.push(pos.coef > 0 ? '正面新聞多的日子，之後 5 天比大盤好' : '正面新聞多的日子，之後 5 天反而比大盤差');
  if (inter && inter.p < 0.05) parts.push(inter.coef < 0 ? '營收成長越快的公司，這個好處越小（與原著方向相同）' : '營收成長越快的公司，這個好處反而越大（與原著方向相反）');
  else if (inter) parts.push('營收成長快或慢，正面新聞的效果看不出明確差別');
  if (neg && neg.p < 0.05) parts.push(neg.coef > 0 ? '負面新聞多的日子，之後反而也比大盤好，可能是當天已跌完、之後反彈，這點與原著相反' : '負面新聞多的日子，之後比大盤差，與原著相同');
  return parts.length ? parts.join('；') + '。' : '目前沒有達到顯著的結果。';
}

export function RealReplicationFacts({ data }: { data: any }) {
  if (!data) {
    return <div className="text-xs text-slate-300">尚未計算：真實結果產生後會自動顯示在這裡。</div>;
  }
  const inter = geeTerm(data, 'Sales_growth X Positive');
  const pos = geeTerm(data, 'Positive');
  const neg = geeTerm(data, 'Negative');
  const rows: any[] = data.rows || [];
  const best = [...rows].sort((a, b) => (b.raw?.textAcc ?? 0) - (a.raw?.textAcc ?? 0))[0];
  const sign = inter ? (inter.coef < 0 ? '負向，與原論文方向一致' : '正向，與原論文方向相反') : '';
  const sig = inter ? (inter.p < 0.05 ? `p = ${inter.p.toFixed(3)}，達 5% 顯著` : `p = ${inter.p.toFixed(3)}，未達顯著`) : '';
  const Row = ({ k, children }: { k: string; children: React.ReactNode }) => (
    <div className="flex items-start gap-2">
      <span className="text-emerald-300 font-bold shrink-0 w-20">{k}</span>
      <span className="text-slate-200">{children}</span>
    </div>
  );
  return (
    <div className="space-y-2.5 text-xs">
      <Row k="復刻市場:">{(data.stocks || []).map((s: any) => `${s.name}${s.id}`).join('、')}（{data.stocks?.length} 檔）</Row>
      <Row k="期間:">{data.period?.start} ～ {data.period?.end}</Row>
      <Row k="質性語料:">FinMind 新聞 <strong>{data.articleCount?.toLocaleString()}</strong> 則，每檔每日最多取 {data.maxPerDay} 則</Row>
      <Row k="情緒判讀:">{data.sentimentEngine}（正面 {Math.round((data.sentimentShare?.positive ?? 0) * 100)}%、負面 {Math.round((data.sentimentShare?.negative ?? 0) * 100)}%）</Row>
      <Row k="量化財報:">月營收年增率、本益比、股價淨值比、市值（FinMind）</Row>
      <Row k="GEE 樣本:">{data.gee?.n?.toLocaleString()} 筆（{data.gee?.firms} 檔），Exchangeable 相關結構</Row>
      <Row k="主要發現:">
        <span className="font-mono text-amber-300 font-bold">Sales_growth × Positive = {inter?.display ?? '—'}</span>
        <span className="block text-slate-300">{sign}；{sig}。Positive {pos?.display}、Negative {neg?.display}</span>
        <span className="block mt-1 text-sky-200">白話：{plainSummary(pos, neg, inter)}</span>
      </Row>
      <Row k="機器學習:">
        {rows.length} 種演算法（含情緒）準確率 {(Math.min(...rows.map((r) => r.raw?.textAcc ?? 1)) * 100).toFixed(1)}%～
        {best ? best.quantTextAcc : '—'}，全猜多數類別基準為 {data.split?.baselineAcc}；加入情緒後沒有穩定提升
        <span className="block mt-1 text-sky-200">白話：預測「之後 5 天會不會贏大盤」，準確率和每次都猜同一邊（{data.split?.baselineAcc}）差不多；加入新聞情緒也沒有幫上忙。新聞情緒和報酬「平均來說」有關，但不足以預測每一次的漲跌。</span>
      </Row>
      <div className="text-[11px] text-emerald-300/70 pt-1">計算時間 {String(data.generatedAt || '').replace('T', ' ')}・與「論文報告」簡報同一份資料</div>
    </div>
  );
}
