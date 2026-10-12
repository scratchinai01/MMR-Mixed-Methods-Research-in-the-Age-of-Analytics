// =====================================================================
// 兩小時論文報告投影片（原文報告 40｜台股復刻 60｜復刻後比較 20）
// 每頁固定左右對照：左＝原著論文（藍）、右＝台股復刻（綠，只顯示真實計算結果）
// 內容定義在 src/data/thesisDeck.tsx
// =====================================================================
import React, { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, MessageSquare, ListOrdered } from 'lucide-react';
import { DECK, SECTION_META, DECK_TOTAL_MINUTES, DeckSection } from '../data/thesisDeck.tsx';
import { useMlResults } from '../services/mlResults.ts';
import { PAPER_PARAGRAPHS } from '../data/paperContent.ts';
import { scriptFor } from '../data/deckScripts.ts';

/** 論文原文段落（英文）＋中譯，附 PDF 頁碼；摘要段落已與公開摘要核對 */
const QuoteBlock: React.FC<{ id: string }> = ({ id }) => {
  const [open, setOpen] = useState(false);
  const para = PAPER_PARAGRAPHS.find((p) => p.id === id);
  if (!para) return null;
  const LIMIT = 220;
  const long = para.en.length > LIMIT || para.zh.length > LIMIT;
  const cut = (t: string) => (open || t.length <= LIMIT ? t : `${t.slice(0, LIMIT)}…`);
  const verified = id.startsWith('abs-');
  return (
    <figure className="rounded-xl bg-white/80 border border-blue-200 p-3 space-y-1.5 text-[0.82em] leading-relaxed">
      <blockquote lang="en" className="italic text-slate-700 border-l-4 border-blue-400 pl-3">{cut(para.en)}</blockquote>
      <p className="text-blue-950 pl-4">{cut(para.zh)}</p>
      <figcaption className="flex flex-wrap items-center justify-between gap-2 pl-4 text-[0.9em] text-blue-800/80">
        <span>{para.pdfPage}{verified ? '｜已與公開摘要核對' : '｜請以原文 PDF 核對'}</span>
        {long && (
          <button onClick={() => setOpen(!open)} className="font-semibold text-blue-700 hover:underline">
            {open ? '收合' : '展開全文'}
          </button>
        )}
      </figcaption>
    </figure>
  );
};

interface ThesisDeckProps {
  initialSlide?: number;
  onSlideChange?: (n: number) => void;
  elapsedSeconds?: number; // 計時器已經過的秒數，用來比對進度
  timerActive?: boolean;
}

const SECTIONS: DeckSection[] = ['paper', 'replication', 'compare'];

// 每頁的預計開始／結束分鐘
const SCHEDULE = (() => {
  let t = 0;
  return DECK.map((s) => {
    const start = t;
    t += s.minutes;
    return { start, end: t };
  });
})();

const fmtMin = (m: number) => `${Math.floor(m / 60)}:${String(Math.round(m % 60)).padStart(2, '0')}`;

export const ThesisDeck: React.FC<ThesisDeckProps> = ({ initialSlide = 1, onSlideChange, elapsedSeconds = 0, timerActive = false }) => {
  const [idx, setIdx] = useState(() => Math.min(Math.max(initialSlide, 1), DECK.length) - 1);
  const [showNotes, setShowNotes] = useState(true);
  const [showList, setShowList] = useState(false);
  const [scriptOpen, setScriptOpen] = useState(true);
  const ml = useMlResults();
  // 每次計算的執行紀錄（資料蒐集流程頁使用）
  const [history, setHistory] = useState<any[]>([]);
  useEffect(() => {
    fetch('/data/run_history.json', { cache: 'no-cache' })
      .then((r) => (r.ok ? r.json() : []))
      .then((h) => setHistory(Array.isArray(h) ? h : []))
      .catch(() => setHistory([]));
  }, []);
  const ctx = useMemo(() => ({ data: ml.isDemo ? null : ml.data || null, history }), [ml, history]);

  const clamp = (n: number) => Math.min(Math.max(n, 0), DECK.length - 1);
  const go = (n: number) => setIdx(clamp(n));

  // 換頁後通知上層（記住目前頁碼，切換分頁再回來時停在同一頁）
  useEffect(() => { onSlideChange?.(idx + 1); }, [idx]);

  // 鍵盤：← → 換頁（在輸入框中不觸發）
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      if (e.key === 'ArrowRight' || e.key === 'PageDown') setIdx((i) => clamp(i + 1));
      if (e.key === 'ArrowLeft' || e.key === 'PageUp') setIdx((i) => clamp(i - 1));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const slide = DECK[idx];
  const script = useMemo(() => scriptFor(slide.id, ctx as any), [slide.id, ctx]);
  const sched = SCHEDULE[idx];
  const meta = SECTION_META[slide.section];
  const sectionSlides = DECK.filter((s) => s.section === slide.section);
  const posInSection = sectionSlides.findIndex((s) => s.id === slide.id) + 1;

  // 進度比對：已用時間 vs 本頁預計開始時間
  const elapsedMin = elapsedSeconds / 60;
  const drift = elapsedMin - sched.start; // >0 代表落後
  const showPace = timerActive || elapsedSeconds > 0;

  return (
    <div className="space-y-3">
      {/* 導覽列：三段進度＋頁碼 */}
      <div className="bg-white rounded-2xl p-3 border border-slate-200 space-y-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 shrink-0">
            <button onClick={() => go(idx - 1)} disabled={idx === 0} title="上一頁 (←)"
              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-800">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="font-mono text-sm font-bold text-slate-800 px-1.5 tabular-nums whitespace-nowrap">{idx + 1} / {DECK.length}</span>
            <button onClick={() => go(idx + 1)} disabled={idx === DECK.length - 1} title="下一頁 (→)"
              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-800">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* 三段時間軸：寬度依分鐘數，點選跳到該段第一頁 */}
          <div className="flex-1 min-w-0 flex gap-1">
            {SECTIONS.map((sec) => {
              const m = SECTION_META[sec];
              const first = DECK.findIndex((s) => s.section === sec);
              const active = slide.section === sec;
              return (
                <button key={sec} onClick={() => go(first)} style={{ flex: m.minutes }}
                  className={`min-w-0 h-9 rounded-lg px-2 text-xs font-bold truncate transition-colors ${active ? `${m.color} text-white` : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                  {m.label.split('　')[1]}・{m.minutes} 分
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button onClick={() => setShowList(!showList)} title="全部頁面"
              className={`h-9 px-2.5 rounded-lg text-xs font-bold border ${showList ? 'bg-slate-900 text-white border-slate-900' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'}`}>
              <ListOrdered className="w-4 h-4" />
            </button>
            <button onClick={() => setShowNotes(!showNotes)}
              className={`h-9 px-2.5 rounded-lg text-xs font-bold border flex items-center gap-1.5 ${showNotes ? 'bg-amber-100 text-amber-900 border-amber-300' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'}`}>
              <MessageSquare className="w-4 h-4" />
              <span className="hidden sm:inline">{showNotes ? '隱藏講稿' : '顯示講稿'}</span>
            </button>
          </div>
        </div>

        {showList && (
          <div className="grid sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100">
            {SECTIONS.map((sec) => (
              <div key={sec} className="space-y-1">
                <div className="text-xs font-bold text-slate-500">{SECTION_META[sec].label}（{SECTION_META[sec].minutes} 分）</div>
                {DECK.map((s, i) => s.section !== sec ? null : (
                  <button key={s.id} onClick={() => { go(i); setShowList(false); }}
                    className={`w-full text-left text-xs px-2 py-1 rounded-md flex justify-between gap-2 ${i === idx ? 'bg-indigo-600 text-white' : 'hover:bg-slate-100 text-slate-700'}`}>
                    <span className="truncate">{i + 1}. {s.title}</span>
                    <span className="opacity-70 shrink-0">{s.minutes} 分</span>
                  </button>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 投影片本體 */}
      <div className="w-full min-w-0 bg-white rounded-3xl border border-slate-300 shadow-xl overflow-hidden flex flex-col md:min-h-[640px]">
        {/* 頁首：段落、標題、時間 */}
        <div className="px-6 sm:px-10 pt-6 pb-4 border-b border-slate-200 flex flex-wrap items-end justify-between gap-3">
          <div className="space-y-1.5 min-w-0">
            <div className="flex items-center gap-2 text-xs font-bold">
              <span className={`px-2 py-0.5 rounded-full text-white ${meta.color}`}>{meta.label}</span>
              <span className="text-slate-500">本段第 {posInSection} / {sectionSlides.length} 頁</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">{slide.title}</h2>
          </div>
          <div className="text-right text-xs text-slate-500 font-mono tabular-nums">
            <div>本頁 {slide.minutes} 分鐘</div>
            <div>預計 {fmtMin(sched.start)}–{fmtMin(sched.end)}／共 {fmtMin(DECK_TOTAL_MINUTES)}</div>
          </div>
        </div>

        {/* 左右對照 */}
        <div className="flex-1 grid md:grid-cols-2 gap-4 sm:gap-6 p-5 sm:p-8 text-[15px] sm:text-base leading-relaxed">
          <section className="rounded-2xl border-2 border-blue-200 bg-blue-50/50 text-blue-950 p-5 space-y-3 min-w-0">
            <div className="flex items-center justify-between gap-2 border-b border-blue-200 pb-2">
              <span className="font-bold text-blue-900 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />原著論文
              </span>
              <span className="text-xs text-blue-800/70">Raman et al. (2022)・美股</span>
            </div>
            <div>{slide.left(ctx)}</div>
            {slide.quotes && slide.quotes.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-blue-200/70">
                <div className="text-xs font-bold text-blue-900">原文對照（英／中）</div>
                {slide.quotes.map((q) => <QuoteBlock key={`${slide.id}-${q}`} id={q} />)}
              </div>
            )}
          </section>

          <section className="rounded-2xl border-2 border-emerald-200 bg-emerald-50/50 text-emerald-950 p-5 space-y-3 min-w-0">
            <div className="flex items-center justify-between gap-2 border-b border-emerald-200 pb-2">
              <span className="font-bold text-emerald-900 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />台股復刻
              </span>
              <span className="text-xs text-emerald-800/70">
                {ctx.data ? `FinMind 真實資料・${String(ctx.data.generatedAt || '').slice(0, 10)} 計算` : 'FinMind 真實資料・尚未計算'}
              </span>
            </div>
            <div>{slide.right(ctx)}</div>
          </section>
        </div>

        {/* 底部進度條 */}
        <div className="h-1.5 bg-slate-100">
          <div className={`h-full ${meta.color}`} style={{ width: `${(sched.end / DECK_TOTAL_MINUTES) * 100}%` }} />
        </div>
      </div>

      {/* 講稿與進度提醒 */}
      {showNotes && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-sm text-amber-950 space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="font-bold">講稿重點（第 {idx + 1} 頁・{slide.minutes} 分鐘）</span>
            {showPace && (
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${Math.abs(drift) < 2 ? 'bg-emerald-600 text-white' : drift > 0 ? 'bg-rose-600 text-white' : 'bg-sky-600 text-white'}`}>
                {Math.abs(drift) < 2 ? '進度正常' : drift > 0 ? `落後 ${Math.round(drift)} 分鐘` : `超前 ${Math.round(-drift)} 分鐘`}
              </span>
            )}
          </div>
          <p className="leading-relaxed">{slide.notes}</p>
          {script.length > 0 && (
            <div className="pt-2 border-t border-amber-200">
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <span className="font-bold">逐字講稿（約 {script.join('').length} 字，可直接照念）</span>
                <button onClick={() => setScriptOpen(!scriptOpen)} className="text-xs font-semibold text-amber-800 hover:underline">
                  {scriptOpen ? '收合' : '展開'}
                </button>
              </div>
              {scriptOpen && (
                <div className="space-y-2 leading-[1.9] text-[0.98em]">
                  {script.map((t, i) => <p key={i}>{t}</p>)}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

/** 產生完整逐頁講稿（供「複製口試講稿」使用） */
export function buildDeckScript(ctx: { data: any; history?: any[] } = { data: null }): string {
  const lines: string[] = ['【論文報告講稿】（原文報告 40 分｜台股復刻 60 分｜復刻後比較 20 分）', ''];
  let section = '';
  DECK.forEach((s, i) => {
    if (SECTION_META[s.section].label !== section) {
      section = SECTION_META[s.section].label;
      lines.push(`═══ ${section}（${SECTION_META[s.section].minutes} 分鐘）═══`);
    }
    lines.push(`第 ${i + 1} 頁｜${s.title}（${s.minutes} 分鐘，預計 ${fmtMin(SCHEDULE[i].start)} 開始）`);
    lines.push(`【重點】${s.notes}`);
    const sc = scriptFor(s.id, ctx as any);
    if (sc.length) lines.push('【逐字講稿】', ...sc);
    lines.push('');
  });
  return lines.join('\n');
}
