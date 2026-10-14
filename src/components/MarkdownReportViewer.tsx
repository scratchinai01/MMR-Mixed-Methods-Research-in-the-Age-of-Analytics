import React, { useState } from 'react';
import { 
  Copy, 
  Check, 
  Download, 
  FileText, 
  Sparkles, 
  Terminal, 
  Layers, 
  Sigma, 
  HelpCircle,
  AlertCircle,
  Lightbulb,
  BookOpen
} from 'lucide-react';
import { MathRenderer } from './MathRenderer.tsx';
import { normalizeMathBlocks, renderRichInline } from './RichInline.tsx';

interface MarkdownReportViewerProps {
  content: string;
  fileName?: string;
  onCopy?: () => void;
  onDownload?: () => void;
}

export const MarkdownReportViewer: React.FC<MarkdownReportViewerProps> = ({
  content,
  fileName = 'MMR_Analysis_Report',
  onCopy,
  onDownload
}) => {
  const [copied, setCopied] = useState(false);
  const [copiedCodeBlockId, setCopiedCodeBlockId] = useState<string | null>(null);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    if (onCopy) onCopy();
  };

  const handleDownload = () => {
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${fileName.replace(/\.[^/.]+$/, "")}_MMR_Analysis.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    if (onDownload) onDownload();
  };

  const copyCode = (codeText: string, blockId: string) => {
    navigator.clipboard.writeText(codeText);
    setCopiedCodeBlockId(blockId);
    setTimeout(() => setCopiedCodeBlockId(null), 2000);
  };

  // 行內格式：粗體／斜體／程式碼／數學式（共用 renderRichInline，粗體內含算式也不會拆壞）
  const renderInlineFormatting = (text: string): React.ReactNode =>
    renderRichInline(text, { bold: 'font-extrabold text-slate-950 bg-amber-100/70 px-1 py-0.5 rounded shadow-2xs' });

  // Format and render structured markdown sections with MathJax / KaTeX
  const renderFormattedMarkdown = (raw: string) => {
    if (!raw) return null;
    const lines = normalizeMathBlocks(raw).split('\n');
    const elements: React.ReactNode[] = [];
    
    let inTable = false;
    let tableRows: string[][] = [];

    let inCodeBlock = false;
    let codeLanguage = '';
    let codeLines: string[] = [];

    let inMathBlock = false;
    let mathLines: string[] = [];

    const flushTable = (keyIndex: number) => {
      if (tableRows.length > 0) {
        const header = tableRows[0];
        const body = tableRows.slice(1).filter(r => !r.every(c => c.match(/^:?-+:?$/)));
        elements.push(
          <div key={`table-${keyIndex}`} className="my-5 overflow-x-auto rounded-xl border border-slate-200/90 bg-white shadow-xs">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-gradient-to-r from-slate-100 to-indigo-50/50 border-b border-slate-200 font-bold text-slate-800">
                  {header.map((col, cIdx) => (
                    <th key={cIdx} className="py-2.5 px-3.5 whitespace-nowrap text-slate-900">
                      {renderInlineFormatting(col.trim())}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {body.map((row, rIdx) => (
                  <tr key={rIdx} className="hover:bg-indigo-50/30 transition-colors">
                    {row.map((cell, cIdx) => (
                      <td key={cIdx} className="py-2.5 px-3.5 text-slate-700 font-sans leading-relaxed">
                        {renderInlineFormatting(cell.trim())}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
        tableRows = [];
        inTable = false;
      }
    };

    const flushCodeBlock = (keyIndex: number) => {
      if (codeLines.length > 0) {
        const fullCode = codeLines.join('\n');
        const blockId = `code-${keyIndex}`;
        const isCopied = copiedCodeBlockId === blockId;
        elements.push(
          <div key={blockId} className="my-4 rounded-xl overflow-hidden border border-slate-800 bg-slate-950 text-slate-100 shadow-md">
            <div className="flex items-center justify-between px-3.5 py-2 bg-slate-900 border-b border-slate-800 text-[11px]">
              <div className="flex items-center gap-2 text-slate-400 font-mono font-medium">
                <Terminal className="w-3.5 h-3.5 text-indigo-400" />
                <span>{codeLanguage || 'text'}</span>
              </div>
              <button
                type="button"
                onClick={() => copyCode(fullCode, blockId)}
                className="flex items-center gap-1 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors text-[10px]"
              >
                {isCopied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{isCopied ? '已複製' : '複製代碼'}</span>
              </button>
            </div>
            <pre className="p-4 overflow-x-auto text-xs font-mono text-emerald-300 leading-relaxed">
              <code>{fullCode}</code>
            </pre>
          </div>
        );
        codeLines = [];
        codeLanguage = '';
        inCodeBlock = false;
      }
    };

    const flushMathBlock = (keyIndex: number) => {
      if (mathLines.length > 0) {
        const mathContent = mathLines.join('\n');
        elements.push(
          <MathRenderer
            key={`math-block-${keyIndex}`}
            math={mathContent}
            displayMode={true}
          />
        );
        mathLines = [];
        inMathBlock = false;
      }
    };

    lines.forEach((line, index) => {
      const trimmed = line.trim();

      // Math block delimiter check ($$)
      if (trimmed === '$$') {
        if (inMathBlock) {
          flushMathBlock(index);
          return;
        } else {
          if (inTable) flushTable(index);
          if (inCodeBlock) flushCodeBlock(index);
          inMathBlock = true;
          return;
        }
      }

      if (inMathBlock) {
        if (trimmed.endsWith('$$') && trimmed.length > 2) {
          mathLines.push(trimmed.slice(0, -2));
          flushMathBlock(index);
        } else {
          mathLines.push(line);
        }
        return;
      }

      // Code block delimiter check (```)
      if (trimmed.startsWith('```')) {
        if (inCodeBlock) {
          flushCodeBlock(index);
          return;
        } else {
          if (inTable) flushTable(index);
          inCodeBlock = true;
          codeLanguage = trimmed.slice(3).trim();
          return;
        }
      }

      if (inCodeBlock) {
        codeLines.push(line);
        return;
      }

      // Standalone single-line $$...$$ equation
      if (trimmed.startsWith('$$') && trimmed.endsWith('$$') && trimmed.length > 4) {
        if (inTable) flushTable(index);
        const formula = trimmed.slice(2, -2).trim();
        elements.push(
          <MathRenderer
            key={`math-${index}`}
            math={formula}
            displayMode={true}
          />
        );
        return;
      }

      // LaTeX environments: \begin{equation}, \begin{align}, \begin{gather}
      if (trimmed.startsWith('\\begin{equation}') || trimmed.startsWith('\\begin{align}') || trimmed.startsWith('\\begin{aligned}')) {
        if (inTable) flushTable(index);
        elements.push(
          <MathRenderer
            key={`math-env-${index}`}
            math={trimmed}
            displayMode={true}
          />
        );
        return;
      }

      // Table row detection
      if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
        inTable = true;
        const cells = trimmed.slice(1, -1).split('|');
        tableRows.push(cells);
        return;
      } else if (inTable) {
        flushTable(index);
      }

      // Horizontal rule
      if (trimmed === '---' || trimmed === '***') {
        elements.push(<hr key={index} className="my-6 border-slate-200" />);
        return;
      }

      // Headers (####)
      if (/^#{4,6}\s/.test(trimmed)) {
        const headerText = trimmed.replace(/^#{4,6}\s+/, '');
        elements.push(
          <div key={index} className="mt-5 mb-2 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-purple-600"></span>
            <h4 className="font-bold text-xs sm:text-sm text-slate-800 tracking-tight">
              {renderInlineFormatting(headerText)}
            </h4>
          </div>
        );
        return;
      }

      // Headers (###)
      if (trimmed.startsWith('### ')) {
        const headerText = trimmed.replace('### ', '');
        elements.push(
          <div key={index} className="mt-6 mb-3 pt-2 border-b border-slate-200/90 pb-2 flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 shadow-xs"></span>
            <h3 className="font-extrabold text-sm sm:text-base text-slate-900 tracking-tight">
              {renderInlineFormatting(headerText)}
            </h3>
          </div>
        );
        return;
      }

      // Headers (##)
      if (trimmed.startsWith('## ')) {
        const headerText = trimmed.replace('## ', '');
        elements.push(
          <div key={index} className="mt-7 mb-3.5 p-3.5 rounded-xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-xs">
            <h2 className="font-extrabold text-sm sm:text-base tracking-wide flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-300 shrink-0" />
              <span>{renderInlineFormatting(headerText)}</span>
            </h2>
          </div>
        );
        return;
      }

      // Headers (#)
      if (trimmed.startsWith('# ')) {
        const headerText = trimmed.replace('# ', '');
        elements.push(
          <h1 key={index} className="text-lg sm:text-xl font-black text-slate-950 mt-6 mb-3 border-b-2 border-indigo-600 pb-2">
            {renderInlineFormatting(headerText)}
          </h1>
        );
        return;
      }

      // Blockquote (> )
      if (trimmed.startsWith('>')) {
        const quoteText = trimmed.replace(/^>\s?/, '');
        const isWarning = quoteText.includes('⚠️') || quoteText.includes('注意') || quoteText.includes('警示');
        const isCore = quoteText.includes('核心結論') || quoteText.includes('💡');

        let bgColor = 'bg-amber-50/90 border-amber-500 text-amber-950';
        let IconComp = Lightbulb;
        if (isWarning) {
          bgColor = 'bg-rose-50/90 border-rose-500 text-rose-950';
          IconComp = AlertCircle;
        }

        elements.push(
          <div key={index} className={`my-3.5 p-3.5 sm:p-4 rounded-xl border-l-4 ${bgColor} text-xs sm:text-sm font-medium shadow-2xs space-y-1 flex items-start gap-2.5`}>
            <IconComp className="w-4 h-4 shrink-0 mt-0.5 opacity-80" />
            <div className="flex-1 leading-relaxed">
              {renderInlineFormatting(quoteText)}
            </div>
          </div>
        );
        return;
      }

      // Bullet points (- or *)
      if (/^[-*+]\s+/.test(trimmed)) {
        const itemText = trimmed.replace(/^[-*+]\s+/, '');
        const depth = Math.floor((line.match(/^\s*/)?.[0] ?? '').replace(/\t/g, '    ').length / 2);
        elements.push(
          <div key={index} className="flex items-start gap-2.5 my-1.5 text-xs sm:text-sm text-slate-700 leading-relaxed pl-1" style={depth ? { paddingLeft: `${depth * 1.25 + 0.25}rem` } : undefined}>
            <span className={`w-1.5 h-1.5 rounded-full mt-2 shrink-0 ${depth ? 'border border-indigo-500' : 'bg-indigo-500'}`}></span>
            <div className="flex-1">{renderInlineFormatting(itemText)}</div>
          </div>
        );
        return;
      }

      // Numbered items (1. )
      if (/^\d+[.)]\s+/.test(trimmed)) {
        const numMatch = trimmed.match(/^(\d+)[.)]\s+(.*)/);
        if (numMatch) {
          elements.push(
            <div key={index} className="flex items-start gap-2.5 my-2 text-xs sm:text-sm text-slate-800 leading-relaxed pl-1">
              <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-800 font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5 border border-indigo-200">
                {numMatch[1]}
              </span>
              <div className="flex-1">{renderInlineFormatting(numMatch[2])}</div>
            </div>
          );
          return;
        }
      }

      // Normal paragraph
      if (trimmed.length > 0) {
        elements.push(
          <p key={index} className="my-2 text-xs sm:text-sm text-slate-700 leading-relaxed">
            {renderInlineFormatting(trimmed)}
          </p>
        );
      } else {
        elements.push(<div key={index} className="h-2"></div>);
      }
    });

    if (inTable) flushTable(lines.length);
    if (inCodeBlock) flushCodeBlock(lines.length);
    if (inMathBlock) flushMathBlock(lines.length);

    return elements;
  };

  return (
    <div className="space-y-4">
      {/* Top Floating Control Bar */}
      <div className="flex items-center justify-between flex-wrap gap-2 p-2.5 sm:p-3 bg-slate-100/90 rounded-xl border border-slate-200">
        <div className="flex items-center gap-2 flex-wrap">
          <FileText className="w-4 h-4 text-indigo-600" />
          <span className="text-xs font-bold text-slate-800">
            {fileName}
          </span>
          <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
            <Sigma className="w-3 h-3" />
            <span>MathJax 多層次方程式渲染</span>
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            🔥 Firebase 雲端同步
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-all shadow-2xs active:scale-95"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? '已複製全文' : '複製 Markdown'}</span>
          </button>

          <button
            type="button"
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-all shadow-xs active:scale-95"
          >
            <Download className="w-3.5 h-3.5" />
            <span>下載 .md 報告</span>
          </button>
        </div>
      </div>

      {/* Styled Markdown Content Body */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-2">
        {renderFormattedMarkdown(content)}
      </div>
    </div>
  );
};
