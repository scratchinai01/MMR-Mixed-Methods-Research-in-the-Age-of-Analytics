// =====================================================================
// AI 回答（Gemini）共用的 Markdown＋LaTeX 前處理與行內渲染
// 1. normalizeMathBlocks：把跨行的 $$…$$、\[…\]、\begin{…}…\end{…} 合併成單行 $$…$$；
//    沒有包分隔符、整行都是 LaTeX 的算式也補成 $$…$$。程式碼區塊內不動。
// 2. renderRichInline：先把數學式與行內程式碼換成佔位符，再處理粗體／斜體，
//    所以「**粗體裡有 $0.226^{**}$**」這類寫法不會被拆壞。
// =====================================================================
import React from 'react';
import { MathRenderer } from './MathRenderer.tsx';

const CJK = /[㐀-鿿＀-￯　-〿]/;
const LATEX_CMD = /\\(frac|text|mathrm|mathbf|beta|alpha|gamma|delta|epsilon|sigma|mu|rho|theta|lambda|partial|times|cdot|cdots|ldots|sum|prod|sqrt|hat|bar|overline|left|right|le|ge|leq|geq|neq|approx|sim|in|log|ln|exp|operatorname|mathbb|mathcal|infty|pm)\b/;

/** 整行看起來是沒有分隔符的 LaTeX 算式（例如 \text{SCAR} = \beta_1 …） */
function isBareLatexLine(t: string): boolean {
  if (!t || t.includes('$') || t.startsWith('\\[') || t.startsWith('\\(')) return false;
  if (/^(#|>|\||[-*+]\s|\d+\.\s|```)/.test(t)) return false;
  // 去掉 \text{…} 裡的中文再判斷，算式外不能有中文
  const outside = t.replace(/\\(text|mathrm|operatorname)\{[^{}]*\}/g, '');
  if (CJK.test(outside)) return false;
  return LATEX_CMD.test(t) && /[=<>]|\\(approx|le|ge|leq|geq|sim)\b/.test(t);
}

export function normalizeMathBlocks(raw: string): string {
  if (!raw) return '';
  const lines = raw.replace(/\r\n?/g, '\n').split('\n');
  const out: string[] = [];
  let inCode = false;
  let buf: string[] | null = null;
  let closer: RegExp | null = null;

  const flush = () => {
    if (buf) {
      const body = buf.join(' ').replace(/\s+/g, ' ').trim();
      if (body) out.push(`$$${body}$$`);
    }
    buf = null;
    closer = null;
  };

  for (const line of lines) {
    const t = line.trim();
    if (buf) {
      if (closer && closer.test(t)) {
        const m = t.match(closer)!;
        const before = t.slice(0, m.index).trim();
        if (before) buf.push(before);
        if (closer.source.includes('end')) buf.push(m[0]);
        flush();
        const after = t.slice((m.index ?? 0) + m[0].length).trim();
        if (after) out.push(after);
      } else {
        buf.push(t);
      }
      continue;
    }
    if (t.startsWith('```')) { inCode = !inCode; out.push(line); continue; }
    if (inCode) { out.push(line); continue; }

    // $$ 開頭但同一行沒有收尾
    if (t.startsWith('$$') && !(t.length > 4 && t.endsWith('$$'))) {
      buf = []; closer = /\$\$/;
      const rest = t.slice(2).trim();
      if (rest) buf.push(rest);
      continue;
    }
    if (t.startsWith('\\[') && !t.endsWith('\\]')) {
      buf = []; closer = /\\\]/;
      const rest = t.slice(2).trim();
      if (rest) buf.push(rest);
      continue;
    }
    if (t.startsWith('\\[') && t.endsWith('\\]') && t.length > 4) { out.push(`$$${t.slice(2, -2).trim()}$$`); continue; }
    const env = t.match(/^\\begin\{(equation\*?|align\*?|aligned|gather\*?|cases|array)\}/);
    if (env) {
      const endTag = `\\end{${env[1]}}`;
      if (t.includes(endTag)) { out.push(`$$${t}$$`); continue; }
      buf = [t]; closer = new RegExp(endTag.replace(/[\\{}*]/g, (c) => '\\' + c));
      continue;
    }
    if (isBareLatexLine(t)) {
      const lead = line.match(/^\s*/)?.[0] ?? '';
      out.push(`${lead}$$${t}$$`);
      continue;
    }
    out.push(line);
  }
  if (buf) flush();
  // equation/align 環境 KaTeX 不支援編號環境，改成 aligned／一般式
  return out
    .join('\n')
    .replace(/\\begin\{(equation\*?|gather\*?)\}/g, '')
    .replace(/\\end\{(equation\*?|gather\*?)\}/g, '')
    .replace(/\\begin\{align\*?\}/g, '\\begin{aligned}')
    .replace(/\\end\{align\*?\}/g, '\\end{aligned}');
}

type Seg = { kind: 'math' | 'dmath' | 'code'; v: string };

/** 找出行內數學式與程式碼，換成佔位符 */
function protect(text: string): { s: string; segs: Seg[] } {
  const segs: Seg[] = [];
  let s = '';
  let i = 0;
  const put = (seg: Seg) => { s += `${segs.length}`; segs.push(seg); };
  while (i < text.length) {
    const c = text[i];
    if (c === '`') {
      const j = text.indexOf('`', i + 1);
      if (j > i) { put({ kind: 'code', v: text.slice(i + 1, j) }); i = j + 1; continue; }
    }
    if (c === '\\' && (text[i + 1] === '(' || text[i + 1] === '[')) {
      const close = text[i + 1] === '(' ? '\\)' : '\\]';
      const j = text.indexOf(close, i + 2);
      if (j > i) { put({ kind: text[i + 1] === '(' ? 'math' : 'dmath', v: text.slice(i + 2, j) }); i = j + 2; continue; }
    }
    if (c === '\\' && text[i + 1] === '$') { s += '$'; i += 2; continue; }
    if (c === '$') {
      if (text[i + 1] === '$') {
        const j = text.indexOf('$$', i + 2);
        if (j > i + 2) { put({ kind: 'dmath', v: text.slice(i + 2, j) }); i = j + 2; continue; }
      } else {
        // 行內 $…$：開頭後不可是空白，結尾前不可是空白；避免把「$5 和 $10」當成算式
        let j = i + 1;
        while (j < text.length) {
          if (text[j] === '\\') { j += 2; continue; }
          if (text[j] === '$') break;
          j++;
        }
        const body = text.slice(i + 1, j);
        if (j < text.length && body && !/^\s/.test(body) && !/\s$/.test(body) && !/^\d+(\.\d+)?\s/.test(body)) {
          put({ kind: 'math', v: body });
          i = j + 1;
          continue;
        }
      }
    }
    s += c;
    i++;
  }
  return { s, segs };
}

export interface RichInlineStyle {
  bold?: string;
  italic?: string;
  code?: string;
}

const DEFAULT_STYLE: Required<RichInlineStyle> = {
  bold: 'font-extrabold text-slate-900 bg-amber-100/60 px-1 py-0.5 rounded',
  italic: 'italic',
  code: 'px-1.5 py-0.5 rounded bg-slate-100 font-mono text-[11px] font-bold text-indigo-700 border border-slate-200',
};

export function renderRichInline(text: string, style: RichInlineStyle = {}): React.ReactNode {
  if (!text) return null;
  const st = { ...DEFAULT_STYLE, ...style };
  const { s, segs } = protect(text);
  let key = 0;

  const restore = (chunk: string): React.ReactNode[] =>
    chunk.split(/(\d+)/g).filter(Boolean).map((p) => {
      const m = p.match(/^(\d+)$/);
      if (!m) return p;
      const seg = segs[Number(m[1])];
      if (seg.kind === 'code') return <code key={`c${key++}`} className={st.code}>{seg.v}</code>;
      // 句子中間的 $$…$$ 以 \displaystyle 行內呈現（避免 <p> 裡放 <div> 造成版面錯亂）
      return <MathRenderer key={`m${key++}`} math={seg.kind === 'dmath' ? `\\displaystyle ${seg.v}` : seg.v} displayMode={false} />;
    });

  const italics = (chunk: string): React.ReactNode[] =>
    chunk.split(/((?<![*\w])\*(?![\s*])[^*\n]+?(?<![\s*])\*(?![*\w]))/g).filter(Boolean).flatMap((p): React.ReactNode[] =>
      /^\*[^*]+\*$/.test(p) ? [<em key={`i${key++}`} className={st.italic}>{restore(p.slice(1, -1))}</em>] : restore(p));

  // 粗體：**…** 或 __…__
  return s.split(/(\*\*[^\n]+?\*\*|__[^\n_]+?__)/g).filter(Boolean).flatMap((p): React.ReactNode[] => {
    if ((p.startsWith('**') && p.endsWith('**') && p.length > 4) || (p.startsWith('__') && p.endsWith('__') && p.length > 4)) {
      return [<strong key={`b${key++}`} className={st.bold}>{italics(p.slice(2, -2))}</strong>];
    }
    return italics(p.replace(/\*\*/g, ''));
  });
}
