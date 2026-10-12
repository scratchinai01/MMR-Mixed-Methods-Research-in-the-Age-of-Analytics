import { useEffect, useMemo, useRef, useState } from 'react';
import { aiClick } from '../services/aiGate.ts';
import { Play, SkipForward, RotateCcw, RefreshCw, ExternalLink, Pause } from 'lucide-react';
import { reloadMlResults } from '../services/mlResults.ts';
import { verdictFor } from '../data/thesisDeck.tsx';
import { NewsDownload } from './NewsDownload.tsx';

// =====================================================================
// 復刻過程重播（給報告現場用）
// 「舊數據復刻」：用已經算好的真實資料，一步一步重現整個計算流程；
//   第 2 步的情緒分布是在瀏覽器裡即時從保存的新聞樣本重新計算。
// 「更新數據」：重新讀取伺服器上最新一次的計算結果；
//   要重新向 FinMind 抓資料並重算，連到 GitHub Actions 的「台股復刻計算」。
// 全程不呼叫 AI，不產生費用。
// =====================================================================

const REPO = 'https://github.com/scratchinai01/MMR-Mixed-Methods-Research-in-the-Age-of-Analytics';
const WORKFLOW_URL = `${REPO}/actions/workflows/replication.yml`;

const STEPS = [
  { title: '抓取新聞', sub: 'FinMind TaiwanStockNews，每檔每天一次查詢' },
  { title: '新聞情緒判讀', sub: '每則標題給 −1～+1 的分數' },
  { title: '組成分析樣本', sub: '新聞日 × 個股，合併財報與報酬' },
  { title: 'GEE 估計', sub: '三種相關結構，個股為群組' },
  { title: '機器學習預測', sub: '依時間切分訓練／測試' },
  { title: '與原著比較', sub: '方向與顯著性' },
];

const fmtSecs = (s?: number) => (s == null ? '—' : s >= 60 ? `${Math.floor(s / 60)} 分 ${Math.round(s % 60)} 秒` : `${Math.round(s)} 秒`);

export function ReplicationReplay({ data, jump }: { data: any | null; jump?: { step: number; nonce: number } | null }) {
  const [step, setStep] = useState(-1); // -1 = 尚未開始
  const [playing, setPlaying] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [updateMsg, setUpdateMsg] = useState('');
  const [updating, setUpdating] = useState(false);
  const timer = useRef<any>(null);

  // 從簡報跳過來：直接停在指定步驟（並把前面的步驟一起展開）
  useEffect(() => {
    if (!jump) return;
    setPlaying(false);
    setStep(Math.min(Math.max(jump.step - 1, 0), STEPS.length - 1));
  }, [jump?.nonce]);

  useEffect(() => {
    fetch(`/data/run_history.json?t=${Date.now()}`, { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : []))
      .then((h) => Array.isArray(h) && setHistory(h))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!playing) return;
    if (step >= STEPS.length - 1) { setPlaying(false); return; }
    timer.current = setTimeout(() => setStep((s) => s + 1), step < 0 ? 300 : 2600);
    return () => clearTimeout(timer.current);
  }, [playing, step]);

  // 第 2 步：從保存的新聞樣本「現場」重新計算情緒分布
  const sentimentStats = useMemo(() => {
    const arts: any[] = data?.articles || [];
    const bins = [
      { label: '−1 ~ −0.6', lo: -1.01, hi: -0.6 },
      { label: '−0.6 ~ −0.2', lo: -0.6, hi: -0.2 },
      { label: '−0.2 ~ 0.2', lo: -0.2, hi: 0.2 },
      { label: '0.2 ~ 0.6', lo: 0.2, hi: 0.6 },
      { label: '0.6 ~ 1', lo: 0.6, hi: 1.01 },
    ].map((b) => ({ ...b, n: arts.filter((a) => a.score > b.lo && a.score <= b.hi).length }));
    const mean = arts.length ? arts.reduce((s, a) => s + (a.score || 0), 0) / arts.length : 0;
    const examples = [...arts].sort((a, b) => b.score - a.score);
    return {
      n: arts.length,
      bins,
      mean,
      pos: examples.slice(0, 2),
      neg: examples.slice(-2).reverse(),
    };
  }, [data]);

  const last = history[history.length - 1];
  const rows: any[] = data?.rows || [];
  const models = data?.gee?.models || {};
  const KEY_TERMS = ['Positive', 'Negative', 'Sales_growth X Positive', 'PE_ratio X Positive'];

  const start = () => { setStep(-1); setPlaying(true); };
  const next = () => { setPlaying(false); setStep((s) => Math.min(STEPS.length - 1, s + 1)); };
  const reset = () => { setPlaying(false); setStep(-1); };

  const handleUpdate = async () => {
    setUpdating(true);
    setUpdateMsg('');
    const before = data?.generatedAt;
    try {
      const r = await reloadMlResults();
      const h = await fetch(`/data/run_history.json?t=${Date.now()}`, { cache: 'no-store' }).then((x) => (x.ok ? x.json() : []));
      if (Array.isArray(h)) setHistory(h);
      const after = r.data?.generatedAt;
      setUpdateMsg(
        after && after !== before
          ? `已更新到最新一次計算（${String(after).replace('T', ' ')}）。`
          : `目前已是最新一次計算（${String(after || before || '—').replace('T', ' ')}）。系統會在週一到週五 22:10 自動重新抓取並計算。`,
      );
      reset();
    } catch {
      setUpdateMsg('讀取失敗，請稍後再試。');
    } finally {
      setUpdating(false);
    }
  };

  if (!data) {
    return <div className="text-sm text-slate-300">尚未計算：第一次真實計算完成後，這裡就能重播整個過程。</div>;
  }

  const shown = (i: number) => step >= i;

  return (
    <div className="space-y-5">
      {/* 控制列 */}
      <div className="flex flex-wrap items-center gap-2">
        <button onClick={start} disabled={playing}
          className="h-10 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 disabled:opacity-60 text-slate-950 text-sm font-extrabold flex items-center gap-2">
          <Play className="w-4 h-4" /> 舊數據復刻（重播計算過程）
        </button>
        {playing ? (
          <button onClick={() => setPlaying(false)} className="h-10 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm font-semibold flex items-center gap-1.5">
            <Pause className="w-4 h-4" /> 暫停
          </button>
        ) : (
          <button onClick={next} disabled={step >= STEPS.length - 1}
            className="h-10 px-3 rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-40 text-white text-sm font-semibold flex items-center gap-1.5">
            <SkipForward className="w-4 h-4" /> 下一步
          </button>
        )}
        <button onClick={reset} className="h-10 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm font-semibold flex items-center gap-1.5">
          <RotateCcw className="w-4 h-4" /> 重來
        </button>
        <div className="flex-1" />
        <button onClick={aiClick(() => handleUpdate())} disabled={updating} title="需主帳號登入"
          className="h-10 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-60 text-slate-950 text-sm font-extrabold flex items-center gap-2">
          <RefreshCw className={`w-4 h-4 ${updating ? 'animate-spin' : ''}`} /> 更新數據
        </button>
        <a href={WORKFLOW_URL} target="_blank" rel="noreferrer" onClick={aiClick(() => {})} title="需主帳號登入"
          className="h-10 px-3 rounded-xl border border-white/20 hover:bg-white/10 text-slate-200 text-xs font-semibold flex items-center gap-1.5">
          <ExternalLink className="w-3.5 h-3.5" /> 重新抓取並計算
        </a>
      </div>
      <div className="text-[11px] text-slate-400 leading-relaxed">
        「舊數據復刻」用已保存的真實資料重現每一步（第 2 步的分布在瀏覽器裡現場重算），不呼叫 AI、不產生費用。
        「更新數據」讀取伺服器上最新一次的計算結果。「重新抓取並計算」會開啟 GitHub Actions，按 Run workflow 即向 FinMind 重抓並重算（上次約 {fmtSecs(last?.totalSeconds)}）。
        {updateMsg && <span className="block text-emerald-300 mt-1">{updateMsg}</span>}
      </div>
      <NewsDownload data={data} dark />

      {/* 步驟進度 */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
        {STEPS.map((s, i) => (
          <button key={s.title} onClick={() => { setPlaying(false); setStep(i); }}
            className={`text-left p-2.5 rounded-xl border transition-colors ${
              step === i ? 'bg-amber-400 text-slate-950 border-amber-300' : shown(i) ? 'bg-emerald-500/15 border-emerald-400/40 text-emerald-100' : 'bg-white/5 border-white/10 text-slate-400'
            }`}>
            <div className="text-[10px] font-mono">步驟 {i + 1}</div>
            <div className="text-xs font-bold">{s.title}</div>
          </button>
        ))}
      </div>

      {step < 0 && (
        <div className="p-5 rounded-2xl bg-slate-950/60 border border-white/10 text-sm text-slate-300">
          上次真實計算：{String(data.generatedAt || '').replace('T', ' ')}
          {last && <>，執行環境 {last.runner}，總耗時 {fmtSecs(last.totalSeconds)}{last.runUrl && <> （<a className="underline" href={last.runUrl} target="_blank" rel="noreferrer">執行紀錄</a>）</>}</>}。
          按「舊數據復刻」開始重播，或按「下一步」逐步說明。
        </div>
      )}

      {/* 步驟 1 */}
      {shown(0) && (
        <StepCard i={0} active={step === 0}>
          <p>期間 {data.period?.start} ～ {data.period?.end}，共 {data.stocks?.length} 檔、{data.articleCount?.toLocaleString()} 則新聞（每檔每天最多保留 {data.maxPerDay} 則）。</p>
          <div className="space-y-1.5 mt-3">
            {(data.stocks || []).map((s: any) => {
              const max = Math.max(...(data.stocks || []).map((x: any) => x.articles));
              return (
                <div key={s.id} className="flex items-center gap-2 text-xs">
                  <span className="w-24 shrink-0 text-slate-300">{s.id} {s.name}</span>
                  <div className="flex-1 h-3 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-sky-400 rounded-full transition-all duration-1000" style={{ width: `${(s.articles / max) * 100}%` }} />
                  </div>
                  <span className="w-14 text-right font-mono text-slate-200">{s.articles.toLocaleString()}</span>
                </div>
              );
            })}
          </div>
        </StepCard>
      )}

      {/* 步驟 2 */}
      {shown(1) && (
        <StepCard i={1} active={step === 1}>
          <p>由 {data.sentimentEngine} 判讀；全樣本正面 {Math.round((data.sentimentShare?.positive ?? 0) * 100)}%、負面 {Math.round((data.sentimentShare?.negative ?? 0) * 100)}%。
            下圖是用頁面保存的 {sentimentStats.n.toLocaleString()} 則新聞<strong>現場重新計算</strong>的分數分布（平均 {sentimentStats.mean.toFixed(3)}）。</p>
          <div className="flex items-end gap-2 h-28 mt-3">
            {sentimentStats.bins.map((b, idx) => {
              const max = Math.max(...sentimentStats.bins.map((x) => x.n), 1);
              const color = idx < 2 ? 'bg-rose-400' : idx === 2 ? 'bg-slate-400' : 'bg-emerald-400';
              return (
                <div key={b.label} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-[10px] font-mono text-slate-300">{b.n}</span>
                  <div className={`w-full ${color} rounded-t transition-all duration-1000`} style={{ height: `${(b.n / max) * 80}px` }} />
                  <span className="text-[10px] text-slate-400">{b.label}</span>
                </div>
              );
            })}
          </div>
          <div className="grid sm:grid-cols-2 gap-2 mt-3 text-[11px]">
            {[...sentimentStats.pos, ...sentimentStats.neg].map((a: any, k: number) => (
              <div key={k} className="p-2 rounded-lg bg-white/5 border border-white/10">
                <span className={`font-mono font-bold mr-1 ${a.score > 0 ? 'text-emerald-300' : 'text-rose-300'}`}>{a.score > 0 ? '+' : ''}{a.score}</span>
                <span className="text-slate-300">{a.title}</span>
              </div>
            ))}
          </div>
        </StepCard>
      )}

      {/* 步驟 3 */}
      {shown(2) && (
        <StepCard i={2} active={step === 2}>
          <p>以「新聞日 × 個股」為一筆觀察值，共 <strong>{data.gee?.n?.toLocaleString()}</strong> 筆（{data.gee?.firms} 檔）。月營收以次月 10 日後才視為公開，避免偷看未來資料。</p>
          <p className="mt-1 text-slate-300">應變數：{data.gee?.dv}</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3 text-[11px] font-mono">
            {Object.entries(data.gee?.descriptives || {}).map(([k, v]: any) => (
              <div key={k} className="p-2 rounded-lg bg-white/5 border border-white/10">
                <div className="text-slate-400">{k}</div>
                <div className="text-slate-100">平均 {Number(v.mean).toFixed(3)}｜標準差 {Number(v.sd).toFixed(3)}</div>
              </div>
            ))}
          </div>
        </StepCard>
      )}

      {/* 步驟 4 */}
      {shown(3) && (
        <StepCard i={3} active={step === 3}>
          <div className="overflow-x-auto">
            <table className="w-full text-xs font-mono">
              <thead>
                <tr className="text-slate-400 border-b border-white/10">
                  <th className="text-left py-1.5 font-sans">變數</th>
                  {Object.values(models).map((m: any) => <th key={m.label} className="text-right py-1.5">{m.label}</th>)}
                </tr>
              </thead>
              <tbody>
                {KEY_TERMS.map((t) => (
                  <tr key={t} className={`border-b border-white/5 ${t === 'Sales_growth X Positive' ? 'text-amber-300 font-bold' : 'text-slate-200'}`}>
                    <td className="py-1.5 font-sans">{t}</td>
                    {Object.values(models).map((m: any) => (
                      <td key={m.label} className="text-right py-1.5">{m.rows.find((r: any) => r.term === t)?.display ?? '—'}</td>
                    ))}
                  </tr>
                ))}
                <tr className="text-slate-400">
                  <td className="py-1.5 font-sans">QIC（越小越好）</td>
                  {Object.values(models).map((m: any) => <td key={m.label} className="text-right py-1.5">{m.qic != null ? Number(m.qic).toFixed(1) : '—'}</td>)}
                </tr>
              </tbody>
            </table>
          </div>
          <p className="mt-2 text-slate-300">
            {KEY_TERMS.every((t) => {
              const xs = Object.values(models).map((m: any) => m.rows.find((r: any) => r.term === t)).filter(Boolean);
              return xs.every((x: any) => Math.sign(x.coef) === Math.sign(xs[0].coef) && (x.p < 0.05) === (xs[0].p < 0.05));
            })
              ? '三種相關結構的方向與顯著性一致，代表結果不是某一種設定碰巧產生的。'
              : '獨立與可交換結構的結果接近，但 AR(1) 結構下部分係數的方向或顯著性不同，表示結果對相關結構設定有一定敏感性，解讀時要保守。'}
            完整係數見下方 GEE 表。
          </p>
        </StepCard>
      )}

      {/* 步驟 5 */}
      {shown(4) && (
        <StepCard i={4} active={step === 4}>
          <p>訓練 {data.split?.trainStart}～{data.split?.trainEnd}（{data.split?.trainN} 筆），測試 {data.split?.testStart}～{data.split?.testEnd}（{data.split?.testN} 筆）。
            全猜多數類別的基準準確率 <strong>{data.split?.baselineAcc}</strong>（橘線）。</p>
          <div className="space-y-2 mt-3">
            {rows.map((r) => {
              const base = parseFloat(String(data.split?.baselineAcc)) || 50;
              const scale = (x: number) => `${Math.max(0, Math.min(100, ((x * 100 - 40) / 30) * 100))}%`;
              return (
                <div key={r.algorithm} className="text-[11px]">
                  <div className="text-slate-300 mb-0.5">{r.algorithm}</div>
                  {[['純量化', r.raw?.quantAcc, 'bg-slate-400', r.quantOnlyAcc], ['量化＋情緒', r.raw?.textAcc, 'bg-indigo-400', r.quantTextAcc]].map(([lab, v, c, txt]: any) => (
                    <div key={lab} className="flex items-center gap-2">
                      <span className="w-16 shrink-0 text-slate-400">{lab}</span>
                      <div className="relative flex-1 h-2.5 bg-white/10 rounded-full">
                        <div className={`h-full ${c} rounded-full transition-all duration-1000`} style={{ width: scale(v ?? 0) }} />
                        <div className="absolute top-[-3px] bottom-[-3px] w-0.5 bg-amber-400" style={{ left: scale(base / 100) }} />
                      </div>
                      <span className="w-12 text-right font-mono text-slate-200">{txt}</span>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
          <p className="mt-2 text-slate-400 text-[11px]">橫軸 40%～70%。所有模型都在基準附近，加入情緒後沒有穩定提升。</p>
        </StepCard>
      )}

      {/* 步驟 6 */}
      {shown(5) && (
        <StepCard i={5} active={step === 5}>
          <div className="grid sm:grid-cols-2 gap-2 text-xs">
            {['Positive', 'Negative', 'Sales_growth X Positive', 'Sales_growth X Negative', 'PE_ratio X Positive', 'MB_ratio X Negative'].map((t) => (
              <div key={t} className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/10">
                <span className="font-mono text-slate-200">{t}</span>
                <span className="font-bold text-amber-300">{verdictFor({ data } as any, t)}</span>
              </div>
            ))}
          </div>
          <p className="mt-2 text-slate-300">判定規則：同號且 p &lt; .05 為「一致」；同號但不顯著為「方向相同但不顯著」；異號但不顯著為「方向相反但不顯著」；異號且顯著為「相反」。</p>
        </StepCard>
      )}
    </div>
  );
}

function StepCard({ i, active, children }: { i: number; active: boolean; children: React.ReactNode }) {
  return (
    <div id={`replay-step-${i + 1}`} className={`scroll-mt-48 p-5 rounded-2xl border text-sm text-slate-200 leading-relaxed animate-in fade-in slide-in-from-bottom-2 duration-500 ${active ? 'bg-slate-950/80 border-amber-400/60' : 'bg-slate-950/50 border-white/10'}`}>
      <div className="flex items-baseline gap-2 mb-2">
        <span className="text-[11px] font-mono text-amber-300">步驟 {i + 1}</span>
        <span className="font-bold text-white">{STEPS[i].title}</span>
        <span className="text-[11px] text-slate-400">{STEPS[i].sub}</span>
      </div>
      {children}
    </div>
  );
}
