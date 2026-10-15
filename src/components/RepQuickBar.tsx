import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { DECK } from '../data/thesisDeck.tsx';
import { REP_ANCHORS, SLIDE_LINKS, RepAnchor } from '../data/deckLinks.ts';

// =====================================================================
// 台股復刻頁的快速標籤列（固定在頁首下方）
// - 一鍵跳到：比對看板／過程重播／股票與新聞／GEE 表／機器學習
// - 依目前捲到的區塊，列出「簡報第幾頁講到這裡」，點了直接回到那一頁
// =====================================================================

/** 依簡報對應表反查：每個區塊被哪些簡報頁引用（頁碼從 1 起算） */
function slidesFor(anchor: RepAnchor): Array<{ n: number; title: string; step?: number }> {
  const out: Array<{ n: number; title: string; step?: number }> = [];
  DECK.forEach((s, i) => {
    const l = SLIDE_LINKS[s.id]?.rep?.find((x) => x.anchor === anchor);
    if (l) out.push({ n: i + 1, title: s.title, step: l.step });
  });
  return out;
}

function flash(el: HTMLElement | null) {
  if (!el) return;
  const target = (el.nextElementSibling as HTMLElement) || el;
  target.animate?.([{ boxShadow: '0 0 0 4px rgba(245,158,11,.9)' }, { boxShadow: '0 0 0 0 rgba(245,158,11,0)' }], { duration: 1600 });
}

export function scrollToAnchor(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  flash(el);
}

/** 從簡報跳過來時，等畫面繪製完再捲動到指定區塊（重播步驟則捲到該步） */
export function useAnchorJump(jump?: { anchor: string; step?: number; nonce: number } | null) {
  useEffect(() => {
    if (!jump) return;
    const t1 = setTimeout(() => scrollToAnchor(jump.anchor), 250);
    const t2 = jump.step ? setTimeout(() => {
      const el = document.getElementById(`replay-step-${jump.step}`);
      el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      el?.animate?.([{ boxShadow: '0 0 0 4px rgba(245,158,11,.9)' }, { boxShadow: '0 0 0 0 rgba(245,158,11,0)' }], { duration: 1600 });
    }, 900) : null;
    return () => { clearTimeout(t1); if (t2) clearTimeout(t2); };
  }, [jump?.nonce]);
}

// Gamma 簡報「研究目的與研究問題（RQ）」
const GAMMA_RQ_URL = 'https://gamma.app/docs/Mixed-Methods-Research-in-the-Age-of-Analytics-An-Exemplar-Levera-1rly67lo5v7wqdd?mode=present#card-fvphacjauv5m68c';

export function RepQuickBar({ returnToThesisSlide, onReturnToThesis }: { returnToThesisSlide: number | null; onReturnToThesis?: (slide?: number) => void }) {
  const [active, setActive] = useState<RepAnchor>('rep-compare');

  // 捲動偵測：目前畫面最上方是哪個區塊
  useEffect(() => {
    const onScroll = () => {
      // 取「已捲過頁首、且最接近頁首」的區塊
      let cur: RepAnchor = 'rep-compare';
      let best = -Infinity;
      for (const a of REP_ANCHORS) {
        const top = document.getElementById(a.id)?.getBoundingClientRect().top;
        if (top !== undefined && top < 220 && top > best) { best = top; cur = a.id; }
      }
      setActive(cur);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const slides = useMemo(() => slidesFor(active), [active]);

  return (
    <div className="sticky top-[117px] z-20 -mx-1 px-1">
      <div className="rounded-2xl bg-white/95 backdrop-blur border border-slate-200 shadow-md p-2 space-y-2">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {REP_ANCHORS.map((a) => (
            <button key={a.id} onClick={() => scrollToAnchor(a.id)}
              className={`h-8 px-3 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${active === a.id ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>
              {a.short}
            </button>
          ))}
          <div className="flex-1" />
          <a href={GAMMA_RQ_URL} target="_blank" rel="noreferrer" title="在新分頁開啟 Gamma 簡報：研究目的與研究問題"
            className="h-8 px-3 rounded-lg text-xs font-bold whitespace-nowrap bg-indigo-50 text-indigo-700 hover:bg-indigo-100 flex items-center gap-1">
            研究目的與 RQ<ExternalLink className="w-3 h-3" />
          </a>
          {onReturnToThesis && (
            <button onClick={() => onReturnToThesis(returnToThesisSlide || undefined)}
              className="h-8 px-3 rounded-lg text-xs font-extrabold whitespace-nowrap bg-amber-400 hover:bg-amber-300 text-slate-950 flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" />{returnToThesisSlide ? `回簡報第 ${returnToThesisSlide} 頁` : '回簡報'}
            </button>
          )}
        </div>
        {onReturnToThesis && slides.length > 0 && (
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar text-[11px]">
            <span className="text-slate-500 whitespace-nowrap shrink-0">簡報講到這裡：</span>
            {slides.map((x) => (
              <button key={x.n} onClick={() => onReturnToThesis(x.n)} title={x.title}
                className={`h-6 px-2 rounded-md font-mono font-bold whitespace-nowrap ${x.n === returnToThesisSlide ? 'bg-amber-400 text-slate-950' : 'bg-blue-50 text-blue-800 hover:bg-blue-100 border border-blue-200'}`}>
                p.{x.n}{x.step ? `・步${x.step}` : ''}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
