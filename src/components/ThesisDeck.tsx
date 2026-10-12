// =====================================================================
// 兩小時論文報告投影片（原文報告 40｜台股復刻 60｜復刻後比較 20）
// 每頁固定左右對照：左＝原著論文（藍）、右＝台股復刻（綠，只顯示真實計算結果）
// 內容定義在 src/data/thesisDeck.tsx
// =====================================================================
import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, MessageSquare, ListOrdered, Minimize2 } from 'lucide-react';
import { VoicePickerButton } from './VoicePicker.tsx';
import { DECK, SECTION_META, DECK_TOTAL_MINUTES, DeckSection } from '../data/thesisDeck.tsx';
import { useMlResults } from '../services/mlResults.ts';
import { PAPER_PARAGRAPHS } from '../data/paperContent.ts';
import { scriptFor } from '../data/deckScripts.ts';
import { talkFor } from '../data/deckTalk.ts';
import { makeUtterance } from '../services/ttsVoice.ts';
import { SLIDE_LINKS, READER_SECTION_LABEL, repLinkLabel, RepLink } from '../data/deckLinks.ts';
import { PARA_EXPLAIN } from '../data/paraExplain.ts';

/** 論文原文段落（英文）＋中譯，附 PDF 頁碼；摘要段落已與公開摘要核對 */
const QuoteBlock: React.FC<{ id: string }> = ({ id }) => {
  const [open, setOpen] = useState(false);
  const [plainOpen, setPlainOpen] = useState(false);
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
      {plainOpen && PARA_EXPLAIN[id] && (
        <div className="ml-4 rounded-lg border border-amber-200 bg-amber-50/80 p-2.5 space-y-1.5 text-slate-800">
          <div><span className="font-bold text-amber-900">白話說　</span>{PARA_EXPLAIN[id].p}</div>
          <div><span className="font-bold text-amber-900">生活例子　</span>{PARA_EXPLAIN[id].e}</div>
          <div><span className="font-bold text-amber-900">一句話記住　</span>{PARA_EXPLAIN[id].k}</div>
          {PARA_EXPLAIN[id].w && <div className="text-[0.92em] text-rose-800">小提醒：{PARA_EXPLAIN[id].w}</div>}
        </div>
      )}
      <figcaption className="flex flex-wrap items-center justify-between gap-2 pl-4 text-[0.9em] text-blue-800/80">
        <span>{para.pdfPage}{verified ? '｜已與公開摘要核對' : '｜請以原文 PDF 核對'}</span>
        <span className="flex items-center gap-3">
          {PARA_EXPLAIN[id] && (
            <button onClick={() => setPlainOpen(!plainOpen)} className="font-semibold text-amber-700 hover:underline">
              {plainOpen ? '收合白話' : '白話解說'}
            </button>
          )}
          {long && (
            <button onClick={() => setOpen(!open)} className="font-semibold text-blue-700 hover:underline">
              {open ? '收合' : '展開全文'}
            </button>
          )}
        </span>
      </figcaption>
    </figure>
  );
};

interface ThesisDeckProps {
  initialSlide?: number;
  onSlideChange?: (n: number) => void;
  elapsedSeconds?: number; // 計時器已經過的秒數，用來比對進度
  timerActive?: boolean;
  /** 跳到台股復刻的對應區塊（帶上目前頁碼，方便返回） */
  onJumpReplication?: (link: RepLink, slideNum: number) => void;
  /** 跳到論文翻譯的對應章節 */
  onJumpReader?: (section: string, slideNum: number) => void;
  /** 投影（全螢幕）模式：投影片填滿畫面 */
  present?: boolean;
  onExitPresent?: () => void;
}


// ---------------------------------------------------------------------
// 固定版面：每頁都以 1280×720（16:9）設計，再整體縮放到螢幕大小，
// 所以每一頁的框大小一致；內容太多的欄位會自動縮小字級（最小 72%），
// 真的放不下才在欄內捲動。手機寬度（<768px）維持原本的流動排版。
// ---------------------------------------------------------------------
const DESIGN_W = 1280;
const DESIGN_H = 720;
const ZOOM_OK = typeof CSS !== 'undefined' && !!CSS.supports?.('zoom', '2');

function useWide() {
  const q = '(min-width: 768px)';
  const [wide, setWide] = useState(() => typeof window !== 'undefined' && window.matchMedia(q).matches);
  useEffect(() => {
    const m = window.matchMedia(q);
    const on = () => setWide(m.matches);
    m.addEventListener('change', on);
    return () => m.removeEventListener('change', on);
  }, []);
  return wide && ZOOM_OK;
}

/** 欄位自動縮放：內容超出欄高時把整欄縮小，直到放得下（下限 0.72） */
const FitBox: React.FC<{ enabled: boolean; resetKey: string; className?: string; innerClassName?: string; children: React.ReactNode }> = ({ enabled, resetKey, className = '', innerClassName = '', children }) => {
  const outer = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  const [fit, setFit] = useState(1);
  const fitRef = useRef(1);
  fitRef.current = fit;

  const refit = useCallback(() => {
    const o = outer.current, i = inner.current;
    if (!enabled || !o || !i) return;
    const oh = o.getBoundingClientRect().height;
    const ih = i.getBoundingClientRect().height;
    if (!oh || !ih) return;
    const natural = ih / fitRef.current;
    if (ih <= oh + 1) return;
    // 只往下縮（避免縮放→換行→再放大的來回震盪）；換頁時才重置回 100%
    // 先用比例估算一個下限，再每次只退 3%，停在「剛好放得下」的最大字級
    const est = Math.floor((oh / natural) * 100) / 100;
    const next = Math.max(0.72, est > fitRef.current - 0.03 ? est : fitRef.current - 0.03);
    if (next < fitRef.current - 0.005) { fitRef.current = next; setFit(next); }
  }, [enabled]);

  useLayoutEffect(() => { fitRef.current = 1; setFit(1); }, [resetKey, enabled]);
  useLayoutEffect(() => { refit(); }, [resetKey, enabled, fit, refit]);
  useEffect(() => {
    if (!enabled) return;
    const ro = new ResizeObserver(() => refit());
    if (inner.current) ro.observe(inner.current);
    if (outer.current) ro.observe(outer.current);
    return () => ro.disconnect();
  }, [enabled, refit]);

  return (
    <div ref={outer} className={`${className} ${enabled ? 'min-h-0 overflow-y-auto overscroll-contain' : ''}`}>
      <div ref={inner} className={innerClassName} style={enabled && fit < 1 ? ({ zoom: fit } as React.CSSProperties) : undefined}>
        {children}
      </div>
    </div>
  );
};

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

export const ThesisDeck: React.FC<ThesisDeckProps> = ({ initialSlide = 1, onSlideChange, elapsedSeconds = 0, timerActive = false, onJumpReplication, onJumpReader, present = false, onExitPresent }) => {
  const [idx, setIdx] = useState(() => Math.min(Math.max(initialSlide, 1), DECK.length) - 1);
  const [showNotes, setShowNotes] = useState(false);
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
  const links = SLIDE_LINKS[slide.id];
  const talk = useMemo(() => talkFor(slide.id, ctx as any), [slide.id, ctx]);
  const [talkSpeaking, setTalkSpeaking] = useState(false);
  useEffect(() => { try { window.speechSynthesis?.cancel(); } catch { /* 無語音 */ } setTalkSpeaking(false); }, [slide.id]);
  const speakTalk = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    if (talkSpeaking) { setTalkSpeaking(false); return; }
    const u = makeUtterance(text, 'zh');
    u.onend = () => setTalkSpeaking(false);
    u.onerror = () => setTalkSpeaking(false);
    setTalkSpeaking(true);
    window.speechSynthesis.speak(u);
  };
  const script = useMemo(() => scriptFor(slide.id, ctx as any), [slide.id, ctx]);
  const sched = SCHEDULE[idx];
  const meta = SECTION_META[slide.section];
  const sectionSlides = DECK.filter((s) => s.section === slide.section);
  const posInSection = sectionSlides.findIndex((s) => s.id === slide.id) + 1;

  // 進度比對：已用時間 vs 本頁預計開始時間
  const elapsedMin = elapsedSeconds / 60;
  const drift = elapsedMin - sched.start; // >0 代表落後
  const showPace = timerActive || elapsedSeconds > 0;

  // 16:9 固定框的縮放比例
  const wide = useWide();
  const frameRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  useLayoutEffect(() => {
    const el = frameRef.current;
    if (!el || !wide) return;
    const measure = () => {
      const w = el.clientWidth;
      const h = present ? el.clientHeight : Infinity;
      if (w > 0) setScale(Math.max(0.3, Math.min(w / DESIGN_W, h / DESIGN_H)));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [wide, present, showNotes]);
  const framed = wide;

  return (
    <div className={present ? 'h-full flex flex-col gap-2' : 'space-y-3'}>
      {/* 導覽列：三段進度＋頁碼 */}
      <div className={`bg-white rounded-2xl border border-slate-200 space-y-3 ${present ? 'p-2 shrink-0' : 'p-3'}`}>
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
            {present && (
              <>
                <VoicePickerButton className="h-9 px-2.5 rounded-lg text-xs font-bold border bg-white border-slate-200 text-slate-700 hover:bg-slate-50 flex items-center gap-1.5" />
                <button onClick={onExitPresent} title="退出全螢幕（Esc）"
                  className="h-9 px-2.5 rounded-lg text-xs font-bold bg-slate-900 hover:bg-black text-white flex items-center gap-1.5">
                  <Minimize2 className="w-4 h-4" /><span className="hidden sm:inline">退出全螢幕</span>
                </button>
              </>
            )}
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
      <div ref={frameRef} className={present ? 'flex-1 min-h-0 min-w-0 flex items-center justify-center' : 'w-full min-w-0'}>
      <div
        className={`min-w-0 bg-white border border-slate-300 shadow-xl overflow-hidden flex flex-col ${framed ? 'rounded-[28px]' : 'w-full rounded-3xl'}`}
        style={framed ? ({ width: DESIGN_W, height: DESIGN_H, zoom: scale } as React.CSSProperties) : undefined}
      >
        {/* 頁首：段落、標題、時間 */}
        <div className={`border-b border-slate-200 flex items-end justify-between gap-3 shrink-0 ${framed ? 'px-10 pt-5 pb-3.5' : 'px-6 sm:px-10 pt-6 pb-4 flex-wrap'}`}>
          <div className="space-y-1.5 min-w-0">
            <div className="flex items-center gap-2 text-xs font-bold">
              <span className={`px-2 py-0.5 rounded-full text-white ${meta.color}`}>{meta.label}</span>
              <span className="text-slate-500">本段第 {posInSection} / {sectionSlides.length} 頁</span>
            </div>
            <h2 className={`font-extrabold text-slate-900 tracking-tight ${framed ? 'text-[30px] leading-tight line-clamp-1' : 'text-2xl sm:text-3xl'}`}>{slide.title}</h2>
          </div>
          <div className="text-right text-xs text-slate-500 font-mono tabular-nums shrink-0">
            <div>本頁 {slide.minutes} 分鐘</div>
            <div>預計 {fmtMin(sched.start)}–{fmtMin(sched.end)}／共 {fmtMin(DECK_TOTAL_MINUTES)}</div>
          </div>
        </div>

        {/* 左右對照 */}
        <div className={`grid gap-4 leading-relaxed ${framed ? 'flex-1 min-h-0 grid-cols-2 grid-rows-[minmax(0,1fr)] gap-5 px-6 py-5 text-[16.5px]' : 'flex-1 md:grid-cols-2 sm:gap-6 p-5 sm:p-8 text-[15px] sm:text-base'}`}>
          <FitBox enabled={framed} resetKey={`${slide.id}-L`} className="rounded-2xl border-2 border-blue-200 bg-blue-50/50 text-blue-950 min-w-0" innerClassName="p-5 space-y-3">
            <div className="flex items-center justify-between gap-2 border-b border-blue-200 pb-2">
              <span className="font-bold text-blue-900 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />原著論文
              </span>
              <span className="flex items-center gap-2">
                {links?.read && onJumpReader && (
                  <button onClick={() => onJumpReader(links.read!, idx + 1)}
                    className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-600 text-white hover:bg-blue-700"
                    title="跳到論文翻譯的對應章節（可再返回本頁）">
                    📖 原文：{READER_SECTION_LABEL[links.read] || links.read} ↗
                  </button>
                )}
                <span className="text-xs text-blue-800/70 hidden lg:inline">Raman et al. (2022)・美股</span>
              </span>
            </div>
            <div>{slide.left(ctx)}</div>
            {slide.quotes && slide.quotes.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-blue-200/70">
                <div className="text-xs font-bold text-blue-900">原文對照（英／中）</div>
                {slide.quotes.map((q) => <QuoteBlock key={`${slide.id}-${q}`} id={q} />)}
              </div>
            )}
          </FitBox>

          <FitBox enabled={framed} resetKey={`${slide.id}-R`} className="rounded-2xl border-2 border-emerald-200 bg-emerald-50/50 text-emerald-950 min-w-0" innerClassName="p-5 space-y-3">
            <div className="flex items-center justify-between gap-2 border-b border-emerald-200 pb-2">
              <span className="font-bold text-emerald-900 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />台股復刻
              </span>
              <span className="text-xs text-emerald-800/70">
                {ctx.data ? `FinMind 真實資料・${String(ctx.data.generatedAt || '').slice(0, 10)} 計算` : 'FinMind 真實資料・尚未計算'}
              </span>
            </div>
            {links?.rep && onJumpReplication && (
              <div className="flex flex-wrap items-center gap-1.5 -mt-1">
                <span className="text-[11px] font-bold text-emerald-800">到台股復刻看：</span>
                {links.rep.map((l, i) => (
                  <button key={i} onClick={() => onJumpReplication(l, idx + 1)}
                    className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-600 text-white hover:bg-emerald-700"
                    title="跳到台股復刻頁的對應區塊（可再返回本頁）">
                    {repLinkLabel(l)} ↗
                  </button>
                ))}
              </div>
            )}
            <div>{slide.right(ctx)}</div>
            {talk && (
              <div className="rounded-xl border border-orange-200 bg-orange-50/90 p-3.5 space-y-2 text-slate-800">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-extrabold text-orange-800">生活化台詞（可直接對台下說）</span>
                  <button onClick={() => speakTalk(`${talk.say}${talk.ex}`)}
                    className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-orange-500 hover:bg-orange-600 text-white">
                    {talkSpeaking ? '停止' : '朗讀'}
                  </button>
                </div>
                <p className="font-bold text-slate-900 leading-relaxed">「{talk.say}」</p>
                <p className="leading-relaxed text-[0.95em]"><span className="font-bold text-orange-800">舉例：</span>{talk.ex}</p>
              </div>
            )}
          </FitBox>
        </div>

        {/* 底部進度條 */}
        <div className="h-1.5 bg-slate-100 shrink-0">
          <div className={`h-full ${meta.color}`} style={{ width: `${(sched.end / DECK_TOTAL_MINUTES) * 100}%` }} />
        </div>
      </div>
      </div>

      {/* 講稿與進度提醒 */}
      {showNotes && (
        <div className={`bg-amber-50 border border-amber-200 rounded-2xl p-4 text-sm text-amber-950 space-y-2 ${present ? 'shrink-0 max-h-[32vh] overflow-y-auto' : ''}`}>
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
