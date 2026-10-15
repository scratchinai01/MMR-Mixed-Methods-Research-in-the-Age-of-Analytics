// =====================================================================
// 嵌入 Gamma 簡報（研究目的與研究問題）：iframe 載入 Gamma 官方嵌入頁，可在框內翻頁
// =====================================================================
import React, { useState } from 'react';
import { Presentation, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';

const DOC = '1rly67lo5v7wqdd';
const CARD = 'fvphacjauv5m68c'; // 研究目的與研究問題（RQ）
const EMBED_URL = `https://gamma.app/embed/${DOC}#card-${CARD}`;
const OPEN_URL = `https://gamma.app/docs/Mixed-Methods-Research-in-the-Age-of-Analytics-An-Exemplar-Levera-${DOC}?mode=present#card-${CARD}`;

export function GammaEmbed() {
  const [open, setOpen] = useState(true);
  return (
    <div className="rounded-3xl border border-slate-200 bg-white shadow-xs overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 sm:px-5 py-3 border-b border-slate-100">
        <div className="flex items-center gap-2 min-w-0">
          <Presentation className="w-4 h-4 text-indigo-600 shrink-0" />
          <span className="font-bold text-slate-900 text-sm sm:text-base">研究目的與研究問題（RQ）</span>
          <span className="text-[11px] text-slate-500 hidden sm:inline">Gamma 簡報・可在框內左右翻頁</span>
        </div>
        <div className="flex items-center gap-2">
          <a href={OPEN_URL} target="_blank" rel="noreferrer"
            className="px-3 py-1.5 rounded-xl text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 flex items-center gap-1">
            <ExternalLink className="w-3.5 h-3.5" />全螢幕開啟
          </a>
          <button onClick={() => setOpen((v) => !v)}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 flex items-center gap-1">
            {open ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}{open ? '收合' : '展開'}
          </button>
        </div>
      </div>
      {open && (
        <div className="relative w-full bg-slate-50" style={{ aspectRatio: '16 / 10' }}>
          <iframe
            src={EMBED_URL}
            title="研究目的與研究問題（Gamma 簡報）"
            className="absolute inset-0 w-full h-full border-0"
            allow="fullscreen"
            allowFullScreen
            loading="lazy"
          />
        </div>
      )}
    </div>
  );
}
