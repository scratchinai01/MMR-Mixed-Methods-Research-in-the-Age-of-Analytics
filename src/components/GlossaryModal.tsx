import React, { useEffect, useMemo, useRef, useState } from 'react';
import { X, BookOpen, Tag, Volume2, VolumeX, Search, ChevronDown, Calculator } from 'lucide-react';
import { GLOSSARY_PLUS, glossSpeech } from '../data/glossaryPlus.ts';
import { MathRenderer } from './MathRenderer.tsx';
import { makeUtterance } from '../services/ttsVoice.ts';

// =====================================================================
// 名詞辭典：白話說、生活例子、計算公式、算一次給你看、一句話記住
// 全部預先寫好（不呼叫 AI）；可朗讀中文解說與英文原名發音
// =====================================================================

interface GlossaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeTerm?: string | null;
}

export const GlossaryModal: React.FC<GlossaryModalProps> = ({ isOpen, onClose, activeTerm }) => {
  const [q, setQ] = useState('');
  const [open, setOpen] = useState<string | null>(null);
  const [speaking, setSpeaking] = useState<string | null>(null);
  const refs = useRef<Record<string, HTMLDivElement | null>>({});

  // 例子中的台股數字直接讀每日計算結果（{{POS}} 等標記），避免名詞辭典的數字過期
  const [vars, setVars] = useState<Record<string, string>>({});
  useEffect(() => {
    if (!isOpen || Object.keys(vars).length) return;
    fetch('/data/ml_results.json', { cache: 'no-cache' }).then((r) => (r.ok ? r.json() : null)).then((d: any) => {
      const rows: any[] = d?.gee?.models?.exchangeable?.rows || [];
      const get = (t: string) => rows.find((x) => x.term === t);
      const pos = get('Positive'); const it = get('Sales_growth X Positive');
      const sd = d?.gee?.descriptives?.Sales_growth?.sd;
      if (!pos || !it || typeof sd !== 'number') return;
      const f3 = (x: number) => x.toFixed(3);
      const ms = d?.gee?.models || {};
      const qn: Record<string, string> = { independence: 'Independence', ar1: 'AR(1)', exchangeable: 'Exchangeable' };
      const qics = Object.entries(ms).filter(([, m]: any) => typeof m?.qic === 'number') as Array<[string, any]>;
      const qmin = qics.length ? qics.reduce((a, b) => (b[1].qic < a[1].qic ? b : a))[0] : '';
      const mrows: any[] = d?.rows || [];
      const accs = mrows.map((r) => r.raw?.textAcc ?? 0);
      const aucs = mrows.map((r) => r.raw?.textAuc ?? 0);
      const best = accs.length ? Math.max(...accs) * 100 : 0;
      const base = parseFloat(d?.split?.baselineAcc ?? '0');
      const testN = d?.split?.testN ?? 0;
      setVars({
        POS_SE: f3(pos.se), POS_Z: (pos.coef / pos.se).toFixed(1),
        SIZE_MEAN: (d?.gee?.descriptives?.Size?.mean ?? 0).toFixed(1),
        QIC_IND: ms.independence?.qic?.toFixed(1) ?? '—', QIC_AR1: ms.ar1?.qic?.toFixed(1) ?? '—', QIC_EXC: ms.exchangeable?.qic?.toFixed(1) ?? '—',
        QIC_MIN: qn[qmin] || '—',
        TEST_N: String(testN), BASE_N: String(Math.round(testN * base / 100)), BASE_ACC: d?.split?.baselineAcc ?? '—',
        BEST_ACC: best.toFixed(1) + '%', BEST_GAP: (best - base).toFixed(1),
        AUC_LO: accs.length ? Math.min(...aucs).toFixed(2) : '—', AUC_HI: accs.length ? Math.max(...aucs).toFixed(2) : '—',
        POS: f3(pos.coef), INT: f3(it.coef), INT_P: it.p < 0.001 ? '< .001' : it.p.toFixed(3).replace(/^0/, ''),
        SGSD: f3(sd), SGSD_PCT: String(Math.round(sd * 100)),
        EFF_SD: f3(pos.coef + it.coef * sd), EFF_10: f3(pos.coef + it.coef * 0.1),
        DATE: String(d.generatedAt || '').slice(0, 10),
      });
    }).catch(() => {});
  }, [isOpen]);
  const fill = (t: string) => t.replace(/\{\{(\w+)\}\}/g, (_, k) => vars[k] ?? '（讀取中）');

  useEffect(() => {
    if (!isOpen) return;
    const key = activeTerm && Object.keys(GLOSSARY_PLUS).find((k) => k.toLowerCase() === activeTerm.toLowerCase());
    setOpen(key || null);
    setQ('');
    if (key) setTimeout(() => refs.current[key]?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 120);
  }, [isOpen, activeTerm]);

  useEffect(() => () => { try { window.speechSynthesis?.cancel(); } catch { /* 無語音 */ } }, []);

  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    return Object.entries(GLOSSARY_PLUS).filter(([k, g]) =>
      !s || [k, g.zh, g.en, g.cat, g.p].some((t) => t.toLowerCase().includes(s)));
  }, [q]);

  if (!isOpen) return null;

  const speak = (id: string, text: string, lang: 'zh' | 'en') => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    if (speaking === id) { setSpeaking(null); return; }
    const u = makeUtterance(text, lang);
    u.onend = () => setSpeaking(null);
    u.onerror = () => setSpeaking(null);
    setSpeaking(id);
    window.speechSynthesis.speak(u);
  };

  const close = () => { try { window.speechSynthesis.cancel(); } catch { /* 無語音 */ } setSpeaking(null); onClose(); };

  return (
    <div data-no-widget="true" className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="px-5 sm:px-6 py-4 border-b border-slate-200 bg-slate-50 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-600" />
              <h3 className="font-bold text-slate-900 text-base">論文核心術語與指標名詞辭典</h3>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold">{Object.keys(GLOSSARY_PLUS).length} 個・不使用 AI</span>
            </div>
            <button onClick={close} className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg" title="關閉"><X className="w-5 h-5" /></button>
          </div>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="搜尋名詞，例如 SCAR、本益比、p 值、AUC…"
              className="w-full h-10 pl-9 pr-3 rounded-xl border border-slate-300 bg-white text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-hidden" />
          </div>
        </div>

        <div className="p-4 sm:p-6 overflow-y-auto space-y-3">
          {list.map(([key, g]) => {
            const isOpen = open === key;
            const hl = activeTerm && activeTerm.toLowerCase() === key.toLowerCase();
            return (
              <div key={key} ref={(el) => { refs.current[key] = el; }}
                className={`rounded-xl border transition-all ${hl ? 'border-indigo-500 ring-2 ring-indigo-200' : isOpen ? 'border-indigo-300' : 'border-slate-200 hover:border-slate-300'} bg-white`}>
                <button onClick={() => setOpen(isOpen ? null : key)} className="w-full text-left p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-baseline gap-x-2">
                        <span className="font-mono font-bold text-indigo-700 text-sm">{key}</span>
                        <span className="font-semibold text-slate-900">{g.zh}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">{g.en}</div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="hidden sm:inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600"><Tag className="w-3 h-3" />{g.cat}</span>
                      <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                    </div>
                  </div>
                  <p className="text-sm text-slate-700 leading-relaxed mt-2">{g.p}</p>
                </button>

                {isOpen && (
                  <div className="px-4 pb-4 space-y-3 text-sm leading-relaxed animate-in fade-in duration-150">
                    <div className="flex flex-wrap gap-2">
                      <button onClick={() => speak(`${key}-zh`, glossSpeech(key, g), 'zh')}
                        className={`h-8 px-3 rounded-lg text-xs font-bold flex items-center gap-1.5 ${speaking === `${key}-zh` ? 'bg-rose-600 text-white' : 'bg-indigo-600 hover:bg-indigo-700 text-white'}`}>
                        {speaking === `${key}-zh` ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                        {speaking === `${key}-zh` ? '停止' : '朗讀白話解說'}
                      </button>
                      <button onClick={() => speak(`${key}-en`, `${key === g.en ? g.en : `${g.en}`}`, 'en')}
                        className="h-8 px-3 rounded-lg text-xs font-bold flex items-center gap-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700">
                        <Volume2 className="w-3.5 h-3.5" /> 英文發音
                      </button>
                    </div>

                    <div className="p-3 rounded-xl bg-amber-50 border border-amber-200">
                      <div className="text-xs font-bold text-amber-900 mb-1">生活例子</div>
                      <p className="text-slate-800">{g.e}</p>
                    </div>

                    {g.f && (
                      <div className="p-3 rounded-xl bg-indigo-50/70 border border-indigo-200 space-y-2">
                        <div className="text-xs font-bold text-indigo-900 flex items-center gap-1.5"><Calculator className="w-3.5 h-3.5" />計算公式</div>
                        <div className="overflow-x-auto"><MathRenderer math={g.f} displayMode showCopy={false} /></div>
                        {g.fv && (
                          <ul className="text-xs text-slate-700 space-y-1 pl-1">
                            {g.fv.map((v, i) => {
                              const [sym, ...rest] = v.split('：');
                              return <li key={i} className="flex gap-1.5 items-baseline"><MathRenderer math={sym} showCopy={false} /><span>：{rest.join('：')}</span></li>;
                            })}
                          </ul>
                        )}
                      </div>
                    )}

                    {g.calc && (
                      <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                        <div className="text-xs font-bold text-emerald-900 mb-1">{g.f ? '算一次給你看' : '補充'}</div>
                        <ol className="list-decimal pl-5 space-y-1 text-slate-800">{g.calc.map((c, i) => <li key={i}>{fill(c)}</li>)}</ol>
                      </div>
                    )}

                    <div className="p-3 rounded-xl bg-slate-900 text-white">
                      <span className="text-xs font-bold text-amber-300 mr-2">一句話記住</span>{g.k}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
          {!list.length && <p className="text-sm text-slate-500 text-center py-8">找不到「{q}」，試試其他關鍵字。</p>}
        </div>

        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-3">
          <span className="text-[11px] text-slate-500">點名詞展開生活例子與公式；朗讀聲音可在頁首「語音」更換。</span>
          <button onClick={close} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg">我知道了</button>
        </div>
      </div>
    </div>
  );
};
