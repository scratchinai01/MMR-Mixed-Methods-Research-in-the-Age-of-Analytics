// =====================================================================
// AI 回答的區塊排版：標題、清單（含縮排）、引言、表格、程式碼、分隔線、獨立算式
// 行內粗體／斜體／程式碼／數學式交給 renderRichInline
// =====================================================================
import React from 'react';
import { MathRenderer } from './MathRenderer.tsx';
import { normalizeMathBlocks, renderRichInline } from './RichInline.tsx';

const inl = (t: string) => renderRichInline(t);

function splitRow(row: string): string[] {
  let r = row.trim();
  if (r.startsWith('|')) r = r.slice(1);
  if (r.endsWith('|')) r = r.slice(0, -1);
  // 數學式裡的 | 不拆：先保護 $…$
  const keep: string[] = [];
  r = r.replace(/\$[^$]*\$/g, (m) => { keep.push(m); return `${keep.length - 1}`; });
  return r.split('|').map((c) => c.trim().replace(/(\d+)/g, (_, i) => keep[Number(i)]));
}

export function RichMarkdown({ content }: { content: string }) {
  if (!content) return null;
  const lines = normalizeMathBlocks(content).split('\n');
  const out: React.ReactNode[] = [];
  let i = 0;
  let k = 0;

  while (i < lines.length) {
    const line = lines[i];
    const t = line.trim();

    // 程式碼區塊
    if (t.startsWith('```')) {
      const lang = t.slice(3).trim();
      const code: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith('```')) code.push(lines[i++]);
      i++;
      out.push(
        <div key={k++} className="my-3 rounded-xl overflow-hidden border border-slate-800 bg-slate-950">
          {lang && <div className="px-3 py-1 text-[10px] font-mono text-slate-400 bg-slate-900 border-b border-slate-800">{lang}</div>}
          <pre className="p-3 overflow-x-auto text-xs font-mono text-emerald-300 leading-relaxed"><code>{code.join('\n')}</code></pre>
        </div>
      );
      continue;
    }

    // 獨立算式（normalizeMathBlocks 已合併成單行）
    if (t.startsWith('$$') && t.endsWith('$$') && t.length > 4) {
      out.push(<MathRenderer key={k++} math={t.slice(2, -2)} displayMode={true} />);
      i++;
      continue;
    }

    // 表格
    if (t.startsWith('|') && i + 1 < lines.length && /^\|?\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)*\|?$/.test(lines[i + 1].trim())) {
      const header = splitRow(t);
      const aligns = splitRow(lines[i + 1].trim()).map((c) => (c.startsWith(':') && c.endsWith(':') ? 'center' : c.endsWith(':') ? 'right' : 'left')) as Array<'left' | 'center' | 'right'>;
      i += 2;
      const body: string[][] = [];
      while (i < lines.length && lines[i].trim().startsWith('|')) body.push(splitRow(lines[i++]));
      out.push(
        <div key={k++} className="my-3 overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-xs sm:text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                {header.map((h, j) => <th key={j} style={{ textAlign: aligns[j] || 'left' }} className="px-3 py-2 font-bold text-slate-800 whitespace-nowrap">{inl(h)}</th>)}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {body.map((r, ri) => (
                <tr key={ri}>{header.map((_, j) => <td key={j} style={{ textAlign: aligns[j] || 'left' }} className="px-3 py-2 text-slate-700 align-top leading-relaxed">{inl(r[j] ?? '')}</td>)}</tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      continue;
    }

    // 分隔線
    if (/^(-{3,}|\*{3,}|_{3,})$/.test(t)) {
      out.push(<hr key={k++} className="my-4 border-slate-200" />);
      i++;
      continue;
    }

    // 標題
    const h = t.match(/^(#{1,6})\s+(.*?)\s*#*$/);
    if (h) {
      const level = h[1].length;
      const text = h[2];
      if (level <= 2) {
        out.push(<h3 key={k++} className="font-bold text-slate-900 text-lg sm:text-xl mt-5 mb-3 border-b border-indigo-200 pb-1.5">{inl(text)}</h3>);
      } else {
        out.push(
          <h4 key={k++} className="font-bold text-indigo-950 text-base sm:text-lg mt-4 mb-2 flex items-start gap-2">
            <span className="w-1.5 h-4 mt-1.5 bg-indigo-600 rounded-full shrink-0" />
            <span>{inl(text)}</span>
          </h4>
        );
      }
      i++;
      continue;
    }

    // 引言（連續多行合併）
    if (t.startsWith('>')) {
      const q: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith('>')) q.push(lines[i++].trim().replace(/^>\s?/, ''));
      out.push(
        <div key={k++} className="my-2.5 p-3 rounded-xl bg-amber-50/80 border-l-4 border-amber-500 text-amber-950 font-medium text-xs sm:text-sm leading-relaxed space-y-1">
          {q.map((x, j) => (x ? <div key={j}>{inl(x)}</div> : <div key={j} className="h-1" />))}
        </div>
      );
      continue;
    }

    // 清單（無序／有序，依縮排決定層級）
    const li = line.match(/^(\s*)([-*+]|\d+[.)])\s+(.*)$/);
    if (li) {
      const items: Array<{ depth: number; ordered: boolean; num: string; text: string }> = [];
      while (i < lines.length) {
        const m = lines[i].match(/^(\s*)([-*+]|\d+[.)])\s+(.*)$/);
        if (m) {
          items.push({ depth: Math.floor(m[1].replace(/\t/g, '    ').length / 2), ordered: /\d/.test(m[2]), num: m[2].replace(/[.)]$/, ''), text: m[3] });
          i++;
        } else if (lines[i].trim() && /^\s{2,}/.test(lines[i]) && items.length && !lines[i].trim().startsWith('$$')) {
          items[items.length - 1].text += ' ' + lines[i].trim(); // 清單項目的續行
          i++;
        } else break;
      }
      out.push(
        <div key={k++} className="my-1.5 space-y-1">
          {items.map((it, j) => (
            <div key={j} className="flex items-start gap-2 text-slate-700 leading-relaxed" style={{ paddingLeft: `${it.depth * 1.25 + 0.5}rem` }}>
              {it.ordered
                ? <span className="font-bold text-indigo-700 shrink-0">{it.num}.</span>
                : <span className={`shrink-0 mt-[0.6em] w-1.5 h-1.5 rounded-full ${it.depth > 0 ? 'border border-slate-500' : 'bg-slate-500'}`} />}
              <div className="min-w-0 flex-1">{inl(it.text)}</div>
            </div>
          ))}
        </div>
      );
      continue;
    }

    if (t === '') {
      out.push(<div key={k++} className="h-2" />);
      i++;
      continue;
    }

    out.push(<p key={k++} className="my-1.5 text-slate-700 leading-relaxed">{inl(t)}</p>);
    i++;
  }
  return <>{out}</>;
}
