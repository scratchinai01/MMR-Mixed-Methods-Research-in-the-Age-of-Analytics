// =====================================================================
// 40 頁 MMR 報告簡報：依診斷報告與論文內容產生 40 頁（固定 MMR 報告邏輯），
// 網頁預覽，並可下載 PowerPoint (.pptx)，講稿放在每頁的備忘稿
// =====================================================================
import React, { useEffect, useRef, useState } from 'react';
import { Presentation, Download, Loader2, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
import { callAiApi } from '../services/aiHelper.ts';
import { aiClick } from '../services/aiGate.ts';

export interface DeckSlide { no: number; section: string; title: string; bullets: string[]; notes: string }
export interface DeckPayload { fileName: string; fileType: string; fileBase64: string | null; textContent: string }

const SECTION_COLOR: Record<string, string> = {
  '開場': '1E293B', '緒論': '2563EB', '文獻與理論': '7C3AED', 'MMR 研究設計': 'D97706', '量化軌': '0284C7',
  '質性軌': 'DB2777', '整合': '059669', '結果': '0F766E', '整合結果': '047857', '討論': '4F46E5',
  '限制與展望': 'B45309', '結論': '334155',
};

export async function buildPptx(slides: DeckSlide[], paperName: string) {
  const { default: PptxGenJS } = await import('pptxgenjs');
  const pptx = new PptxGenJS();
  pptx.layout = 'LAYOUT_WIDE'; // 13.33 × 7.5 吋
  pptx.title = `${paperName}｜MMR 論文報告`;
  const FONT = 'Microsoft JhengHei';
  for (const s of slides) {
    const color = SECTION_COLOR[s.section] || '334155';
    const sl = pptx.addSlide();
    sl.background = { color: 'FFFFFF' };
    if (s.no === 1) {
      sl.background = { color };
      sl.addText(s.title, { x: 0.8, y: 1.6, w: 11.7, h: 1.6, fontFace: FONT, fontSize: 34, bold: true, color: 'FFFFFF', valign: 'middle' });
      sl.addText(s.bullets.join('\n'), { x: 0.8, y: 3.5, w: 11.7, h: 2.6, fontFace: FONT, fontSize: 18, color: 'E2E8F0', valign: 'top', paraSpaceAfter: 6 });
    } else {
      sl.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 13.33, h: 0.12, fill: { color } });
      sl.addText(s.section, { x: 0.6, y: 0.35, w: 6, h: 0.4, fontFace: FONT, fontSize: 13, bold: true, color });
      sl.addText(s.title, { x: 0.6, y: 0.75, w: 12.1, h: 0.9, fontFace: FONT, fontSize: 28, bold: true, color: '0F172A', valign: 'middle' });
      sl.addShape(pptx.ShapeType.line, { x: 0.6, y: 1.72, w: 12.1, h: 0, line: { color: 'CBD5E1', width: 1 } });
      sl.addText(s.bullets.map((b) => ({ text: b, options: { bullet: { indent: 18 }, paraSpaceAfter: 10 } })), {
        x: 0.7, y: 1.95, w: 11.9, h: 4.9, fontFace: FONT, fontSize: 20, color: '1E293B', valign: 'top',
      });
    }
    sl.addText(`${s.no} / ${slides.length}`, { x: 11.6, y: 7.0, w: 1.4, h: 0.3, fontFace: FONT, fontSize: 10, color: s.no === 1 ? 'CBD5E1' : '94A3B8', align: 'right' });
    if (s.notes) sl.addNotes(s.notes);
  }
  const safe = paperName.replace(/[\\/:*?"<>|]+/g, '_').slice(0, 60) || 'MMR';
  await pptx.writeFile({ fileName: `${safe}_MMR論文報告_40頁.pptx` });
}

export function MmrDeckBuilder({ report, payload, autoStart }: { report: string; payload: DeckPayload | null; autoStart: boolean }) {
  const [slides, setSlides] = useState<DeckSlide[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [meta, setMeta] = useState<{ model?: string; ms?: number; filled?: number }>({});
  const [expanded, setExpanded] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const startedFor = useRef('');

  const generate = async () => {
    if (!payload || !report) return;
    setLoading(true); setError(''); setSlides(null);
    try {
      const data = await callAiApi('/api/gemini/deck-outline', { ...payload, report });
      if (data?.success && Array.isArray(data.slides)) {
        setSlides(data.slides);
        setMeta({ model: data.modelUsed, ms: data.latencyMs, filled: data.filled });
      } else setError(data?.message || data?.error || '簡報產生失敗，請稍後再試。');
    } catch (e: any) {
      setError(e?.message || '簡報產生失敗');
    } finally { setLoading(false); }
  };

  // 勾選「/40頁簡報」時，診斷報告完成後自動產生一次
  useEffect(() => {
    if (autoStart && report && payload && startedFor.current !== report) {
      startedFor.current = report;
      generate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoStart, report, payload]);

  const download = async () => {
    if (!slides) return;
    setDownloading(true);
    try { await buildPptx(slides, payload?.fileName?.replace(/\.[a-z]+$/i, '') || 'MMR'); } finally { setDownloading(false); }
  };

  const shown = slides ? (expanded ? slides : slides.slice(0, 6)) : [];
  return (
    <div className="rounded-2xl border border-indigo-200 bg-white shadow-xs overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 bg-indigo-50/70 border-b border-indigo-100">
        <div className="flex items-center gap-2">
          <Presentation className="w-4 h-4 text-indigo-600" />
          <span className="font-bold text-slate-900 text-sm">40 頁 MMR 論文報告簡報</span>
          {slides && <span className="text-[11px] text-slate-500">{meta.model}{meta.ms ? `（${Math.round(meta.ms / 1000)} 秒）` : ''}</span>}
        </div>
        <div className="flex items-center gap-2">
          {slides && (
            <button onClick={download} disabled={downloading}
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-1 disabled:opacity-60">
              {downloading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}下載 PowerPoint（.pptx）
            </button>
          )}
          <button onClick={aiClick(() => generate())} disabled={loading || !report}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white border border-indigo-200 text-indigo-700 hover:bg-indigo-50 flex items-center gap-1 disabled:opacity-60"
            title="需主帳號登入">
            <RefreshCw className="w-3.5 h-3.5" />{slides ? '重新產生' : '產生 40 頁簡報'}
          </button>
        </div>
      </div>

      <div className="p-4 text-xs sm:text-sm">
        <p className="text-slate-500 text-[11px] mb-3">
          頁序固定依 MMR 報告邏輯：緒論 → 文獻與理論 → MMR 研究設計（設計類型、子變型、時機與權重）→ 量化軌 → 質性軌 → 整合 → 結果 → 聯合展示與元推論 → 討論 → 限制 → 結論。論文沒有的內容會標示「論文未說明」；講稿放在每頁的備忘稿。
        </p>
        {loading && <div className="flex items-center gap-2 text-indigo-700"><Loader2 className="w-4 h-4 animate-spin" />正在依論文內容產生 40 頁簡報，約需 1～2 分鐘…</div>}
        {error && <div className="text-rose-700 bg-rose-50 border border-rose-200 rounded-lg p-2">{error}</div>}
        {slides && (
          <>
            {meta.filled !== undefined && meta.filled < 40 && (
              <div className="mb-2 text-amber-800 bg-amber-50 border border-amber-200 rounded-lg p-2 text-[11px]">模型只產生了 {meta.filled} 頁，缺的頁已依骨架保留標題，可按「重新產生」補齊。</div>
            )}
            <ol className="grid sm:grid-cols-2 gap-2">
              {shown.map((s) => (
                <li key={s.no} className="rounded-xl border border-slate-200 p-3">
                  <div className="text-[10px] font-bold text-indigo-600">{s.no}．{s.section}</div>
                  <div className="font-bold text-slate-900 mb-1">{s.title}</div>
                  <ul className="list-disc pl-4 text-slate-700 space-y-0.5">{s.bullets.map((b, i) => <li key={i}>{b}</li>)}</ul>
                </li>
              ))}
            </ol>
            <button onClick={() => setExpanded((v) => !v)} className="mt-3 text-xs font-semibold text-indigo-700 flex items-center gap-1">
              {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}{expanded ? '只顯示前 6 頁' : `顯示全部 ${slides.length} 頁`}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
