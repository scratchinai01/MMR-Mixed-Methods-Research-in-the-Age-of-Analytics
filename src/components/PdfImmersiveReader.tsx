// =====================================================================
// PDF 原文逐字閱讀器＋沉浸式翻譯
// ---------------------------------------------------------------------
// - PDF 只在使用者的瀏覽器中解析，不上傳、不公開（避免散布有版權的論文全文）
// - 每段原文照 PDF 文字逐字呈現，下方顯示繁體中文譯文（Gemini Flash-Lite）
// - 可切換「原文＋譯文／只看原文／只看譯文」，並可在旁邊對照 PDF 原頁圖像
// - 譯文快取在瀏覽器（localStorage），重開同一篇不必重新翻譯
// =====================================================================
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { X, Upload, Languages, FileText, Loader2, Eye, EyeOff, Download } from 'lucide-react';
import { extractPdfText, renderPdfPage, hashText, PdfDocumentText, PdfParagraph } from '../services/pdfText.ts';

type ViewMode = 'both' | 'original' | 'translation';

const LS_PREFIX = 'pdf-tr:';
const readCache = (k: string) => { try { return localStorage.getItem(LS_PREFIX + k); } catch { return null; } };
const writeCache = (k: string, v: string) => { try { localStorage.setItem(LS_PREFIX + k, v); } catch { /* 空間不足或無法使用時略過 */ } };

export const PdfImmersiveReader: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [doc, setDoc] = useState<PdfDocumentText | null>(null);
  const [parsing, setParsing] = useState<{ done: number; total: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tr, setTr] = useState<Record<string, string>>({});
  const [pending, setPending] = useState<Set<number>>(new Set());
  const [view, setView] = useState<ViewMode>('both');
  const [showPdf, setShowPdf] = useState(false);
  const [autoTranslate, setAutoTranslate] = useState(true);
  const [pageImages, setPageImages] = useState<Record<number, string>>({});
  const [trError, setTrError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const pages = useMemo(() => {
    const m = new Map<number, PdfParagraph[]>();
    doc?.paragraphs.forEach((p) => m.set(p.page, [...(m.get(p.page) || []), p]));
    return [...m.entries()].sort((a, b) => a[0] - b[0]);
  }, [doc]);

  const translatedCount = doc ? doc.paragraphs.filter((p) => tr[hashText(p.text)]).length : 0;

  const handleFile = async (file: File) => {
    setError(null);
    setDoc(null);
    setPageImages({});
    if (!/pdf$/i.test(file.type) && !/\.pdf$/i.test(file.name)) { setError('請選擇 PDF 檔案'); return; }
    try {
      setParsing({ done: 0, total: 1 });
      const d = await extractPdfText(file, (done, total) => setParsing({ done, total }));
      if (d.paragraphs.length === 0) throw new Error('這份 PDF 沒有可擷取的文字（可能是掃描影像檔，需要先做 OCR）');
      const cached: Record<string, string> = {};
      d.paragraphs.forEach((p) => { const k = hashText(p.text); const v = readCache(k); if (v) cached[k] = v; });
      setTr(cached);
      setDoc(d);
    } catch (e: any) {
      setError(e.message || 'PDF 解析失敗');
    } finally {
      setParsing(null);
    }
  };

  /** 翻譯一頁：把尚未翻譯的段落分批送出（每批最多 12 段、約 8,000 字元） */
  const translatePage = useCallback(async (pageNo: number) => {
    if (!doc || pending.has(pageNo)) return;
    const todo = doc.paragraphs.filter((p) => p.page === pageNo && !tr[hashText(p.text)]);
    if (!todo.length) return;
    setPending((s) => new Set(s).add(pageNo));
    setTrError(null);
    try {
      const batches: PdfParagraph[][] = [[]];
      let size = 0;
      for (const p of todo) {
        const cur = batches[batches.length - 1];
        if (cur.length >= 12 || size + p.text.length > 8000) { batches.push([]); size = 0; }
        batches[batches.length - 1].push(p);
        size += p.text.length;
      }
      for (const batch of batches.filter((b) => b.length)) {
        const resp = await fetch('/api/translate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ texts: batch.map((p) => p.text), context: doc.title }),
        });
        const data = await resp.json();
        if (!resp.ok) throw new Error(data.error || `HTTP ${resp.status}`);
        const add: Record<string, string> = {};
        batch.forEach((p, i) => {
          const t = data.translations?.[i];
          if (t) { const k = hashText(p.text); add[k] = t; writeCache(k, t); }
        });
        setTr((prev) => ({ ...prev, ...add }));
      }
    } catch (e: any) {
      setTrError(e.message);
      setAutoTranslate(false);
    } finally {
      setPending((s) => { const n = new Set(s); n.delete(pageNo); return n; });
    }
  }, [doc, tr, pending]);

  // 沉浸式：頁面捲到畫面中時自動翻譯該頁
  const pageRefs = useRef<Record<number, HTMLElement | null>>({});
  useEffect(() => {
    if (!doc || !autoTranslate || view === 'original') return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => { if (en.isIntersecting) translatePage(Number((en.target as HTMLElement).dataset.page)); });
    }, { rootMargin: '200px 0px' });
    Object.values(pageRefs.current).forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, [doc, autoTranslate, view, translatePage]);

  // 對照 PDF 原頁：需要時才繪製
  useEffect(() => {
    if (!doc || !showPdf) return;
    let alive = true;
    (async () => {
      for (const [pageNo] of pages) {
        if (!alive || pageImages[pageNo]) continue;
        const url = await renderPdfPage(doc.pdf, pageNo, 700);
        if (alive) setPageImages((m) => ({ ...m, [pageNo]: url }));
      }
    })();
    return () => { alive = false; };
  }, [doc, showPdf, pages]);

  const translateAll = async () => {
    setAutoTranslate(true);
    for (const [pageNo] of pages) await translatePage(pageNo);
  };

  // 下載雙語全文（HTML，只存在使用者電腦）
  const downloadBilingual = () => {
    if (!doc) return;
    const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const body = pages.map(([pageNo, ps]) => `<h3 class="pg">第 ${pageNo} 頁</h3>` + ps.map((p) => {
      const t = tr[hashText(p.text)];
      return p.kind === 'heading'
        ? `<h2>${esc(p.text)}${t ? `<br><small>${esc(t)}</small>` : ''}</h2>`
        : `<p class="en">${esc(p.text)}</p>${t ? `<p class="zh">${esc(t)}</p>` : ''}`;
    }).join('')).join('');
    const html = `<!doctype html><html lang="zh-Hant"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(doc.title)}（雙語對照）</title>
<style>body{max-width:820px;margin:0 auto;padding:32px 16px;font-family:"Noto Sans TC",system-ui,sans-serif;line-height:1.8;color:#0f172a}
.en{font-family:Georgia,"Times New Roman",serif;margin:18px 0 4px}.zh{color:#3730a3;margin:0 0 18px;padding-left:12px;border-left:3px solid #c7d2fe}
h2{font-size:1.1rem;margin-top:28px}h2 small{color:#3730a3;font-weight:600}.pg{color:#94a3b8;font-size:.8rem;border-top:1px dashed #e2e8f0;padding-top:12px;margin-top:32px}</style></head>
<body><h1>${esc(doc.title)}</h1><p style="color:#64748b">原文擷取自 PDF（逐字），中文為 AI 翻譯，請以原文為準。僅供個人研讀。</p>${body}</body></html>`;
    const url = URL.createObjectURL(new Blob([html], { type: 'text/html;charset=utf-8' }));
    const a = document.createElement('a');
    a.href = url; a.download = `${doc.title.slice(0, 60).replace(/[\\/:*?"<>|]/g, '_')}_雙語對照.html`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-stretch justify-center p-2 sm:p-4">
      <div className="bg-white w-full max-w-7xl rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* 頂部工具列 */}
        <div className="px-4 sm:px-6 py-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-600 shrink-0" />
              <span className="truncate">{doc ? doc.title : '原文逐字閱讀＋沉浸式翻譯'}</span>
            </div>
            <div className="text-xs text-slate-500">
              {doc
                ? `${doc.numPages} 頁｜${doc.paragraphs.length} 段｜已翻譯 ${translatedCount}/${doc.paragraphs.length}${doc.removedHeaderFooterLines ? `｜已略過重複頁首頁尾 ${doc.removedHeaderFooterLines} 行` : ''}`
                : 'PDF 只在您的瀏覽器中解析，不會上傳或公開；翻譯時段落文字會送到 Gemini。'}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {doc && (
              <>
                <div className="flex items-center h-9 bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs font-bold">
                  {([['both', '原文＋譯文'], ['original', '只看原文'], ['translation', '只看譯文']] as const).map(([k, label]) => (
                    <button key={k} onClick={() => setView(k)}
                      className={`px-2.5 h-full rounded-md ${view === k ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600'}`}>{label}</button>
                  ))}
                </div>
                <button onClick={() => setShowPdf(!showPdf)}
                  className={`h-9 px-3 rounded-lg border text-xs font-bold flex items-center gap-1.5 ${showPdf ? 'bg-slate-900 text-white border-slate-900' : 'bg-white border-slate-200 text-slate-700'}`}>
                  {showPdf ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}對照 PDF 原頁
                </button>
                <button onClick={translateAll} disabled={pending.size > 0}
                  className="h-9 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-xs font-bold flex items-center gap-1.5">
                  {pending.size > 0 ? <Loader2 className="w-4 h-4 animate-spin" /> : <Languages className="w-4 h-4" />}全部翻譯
                </button>
                <button onClick={downloadBilingual} title="下載雙語全文（HTML）"
                  className="h-9 px-3 rounded-lg border border-slate-200 bg-white text-slate-700 text-xs font-bold flex items-center gap-1.5">
                  <Download className="w-4 h-4" />下載雙語
                </button>
              </>
            )}
            <button onClick={onClose} className="h-9 w-9 grid place-items-center rounded-lg hover:bg-slate-100 text-slate-600" title="關閉">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {trError && (
          <div className="px-6 py-2 bg-amber-50 border-b border-amber-200 text-xs text-amber-900">
            翻譯暫停：{trError}。可稍後按「全部翻譯」重試。
          </div>
        )}

        {/* 內容 */}
        <div className="flex-1 overflow-y-auto bg-slate-50">
          {!doc && (
            <div className="h-full grid place-items-center p-6">
              <div className="max-w-lg w-full text-center space-y-4">
                <button onClick={() => inputRef.current?.click()} disabled={!!parsing}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files?.[0]; if (f) handleFile(f); }}
                  className="w-full rounded-2xl border-2 border-dashed border-indigo-300 bg-white hover:bg-indigo-50/50 p-10 space-y-3 transition-colors">
                  {parsing ? <Loader2 className="w-10 h-10 mx-auto text-indigo-600 animate-spin" /> : <Upload className="w-10 h-10 mx-auto text-indigo-600" />}
                  <div className="font-bold text-slate-900">{parsing ? `正在解析第 ${parsing.done} / ${parsing.total} 頁…` : '選擇或拖曳論文 PDF'}</div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    逐頁擷取 PDF 中的原文文字（雙欄排版會依左欄、右欄的順序），每段下方附繁體中文譯文。
                    掃描影像型 PDF 沒有文字層，無法擷取。
                  </p>
                </button>
                <input ref={inputRef} type="file" accept="application/pdf,.pdf" className="hidden"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ''; }} />
                {error && <p className="text-sm text-rose-600">{error}</p>}
              </div>
            </div>
          )}

          {doc && pages.map(([pageNo, ps]) => (
            <section key={pageNo} data-page={pageNo} ref={(el) => { pageRefs.current[pageNo] = el; }}
              className="max-w-7xl mx-auto px-4 sm:px-8 py-6 border-b border-dashed border-slate-200">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-400">第 {pageNo} 頁</span>
                {view !== 'original' && ps.some((p) => !tr[hashText(p.text)]) && (
                  <button onClick={() => translatePage(pageNo)} disabled={pending.has(pageNo)}
                    className="text-xs font-semibold text-indigo-700 hover:underline disabled:opacity-60 flex items-center gap-1">
                    {pending.has(pageNo) && <Loader2 className="w-3 h-3 animate-spin" />}{pending.has(pageNo) ? '翻譯中…' : '翻譯本頁'}
                  </button>
                )}
              </div>
              <div className={showPdf ? 'grid lg:grid-cols-2 gap-6 items-start' : ''}>
                {showPdf && (
                  <div className="lg:sticky lg:top-2 rounded-lg border border-slate-200 bg-white overflow-hidden">
                    {pageImages[pageNo]
                      ? <img src={pageImages[pageNo]} alt={`PDF 第 ${pageNo} 頁`} className="w-full h-auto" />
                      : <div className="aspect-[3/4] grid place-items-center text-xs text-slate-400"><Loader2 className="w-5 h-5 animate-spin" /></div>}
                  </div>
                )}
                <div className={`space-y-4 ${showPdf ? '' : 'max-w-3xl mx-auto'}`}>
                  {ps.map((p) => {
                    const t = tr[hashText(p.text)];
                    const isHead = p.kind === 'heading';
                    return (
                      <div key={p.id} className="space-y-1.5">
                        {view !== 'translation' && (
                          <p lang="en" className={isHead
                            ? 'font-bold text-slate-900 text-lg pt-2'
                            : 'font-serif text-[1.02rem] leading-relaxed text-slate-900 whitespace-pre-wrap break-words'}>
                            {p.text}
                          </p>
                        )}
                        {view !== 'original' && (
                          t ? <p className={isHead ? 'font-bold text-indigo-800' : 'text-indigo-900/90 leading-relaxed pl-3 border-l-[3px] border-indigo-200'}>{t}</p>
                            : view === 'translation' ? <p className="text-slate-400 text-sm">（尚未翻譯）</p> : null
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
};
