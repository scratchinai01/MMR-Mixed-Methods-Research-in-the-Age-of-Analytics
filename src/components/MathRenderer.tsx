import React, { useEffect, useRef, useState } from 'react';
import katex from 'katex';
import { Copy, Check, ZoomIn } from 'lucide-react';

interface MathRendererProps {
  math: string;
  displayMode?: boolean;
  className?: string;
  showCopy?: boolean;
}

/**
 * Multi-layer Mathematical Equation Renderer
 * Layer 1: High-performance KaTeX renderToString (native bundled)
 * Layer 2: MathJax 3 global typesetting for complex multiline & AMS environments
 * Layer 3: Resilient semantic fallback with LaTeX source code viewing & copying
 */
export const MathRenderer: React.FC<MathRendererProps> = ({
  math,
  displayMode = false,
  className = '',
  showCopy = true,
}) => {
  const containerRef = useRef<HTMLSpanElement>(null);
  const [copied, setCopied] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [renderedHtml, setRenderedHtml] = useState<string>('');

  // Sanitize and normalize Gemini equation generation artifacts
  const normalizedMath = React.useMemo(() => {
    if (!math) return '';
    let cleaned = math.trim();
    // Strip redundant leading/trailing dollar signs
    cleaned = cleaned.replace(/^(\${1,2})|(\${1,2})$/g, '').trim();
    cleaned = cleaned.replace(/^\\\[|\\\]$/g, '').trim();
    cleaned = cleaned.replace(/^\\\(|\\\)$/g, '').trim();
    
    // Fix unescaped alignment environments or multi-line breaks
    if (cleaned.includes('\\begin{aligned}') && !cleaned.includes('\\end{aligned}')) {
      cleaned += ' \\end{aligned}';
    }
    if (cleaned.includes('\\begin{matrix}') && !cleaned.includes('\\end{matrix}')) {
      cleaned += ' \\end{matrix}';
    }
    return cleaned;
  }, [math]);

  useEffect(() => {
    if (!normalizedMath) {
      setRenderedHtml('');
      return;
    }

    try {
      const html = katex.renderToString(normalizedMath, {
        displayMode,
        throwOnError: false,
        strict: false,
        trust: true,
        output: 'htmlAndMathml',
      });
      setRenderedHtml(html);
      setHasError(false);
    } catch (e) {
      console.warn('KaTeX rendering error:', e);
      setHasError(true);
      // MathJax typesetting fallback if window.MathJax is available
      // @ts-ignore
      if (typeof window !== 'undefined' && window.MathJax && window.MathJax.typesetPromise && containerRef.current) {
        // @ts-ignore
        window.MathJax.typesetPromise([containerRef.current]).catch((mjErr: any) => {
          console.warn('MathJax fallback error:', mjErr);
        });
      }
    }
  }, [normalizedMath, displayMode]);

  const handleCopyLatex = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(normalizedMath);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!normalizedMath) return null;

  if (displayMode) {
    return (
      <div className={`my-3.5 p-3.5 sm:p-4 rounded-xl bg-gradient-to-r from-purple-50/70 via-indigo-50/50 to-purple-50/70 border border-purple-200/80 shadow-xs relative group overflow-x-auto ${className}`}>
        {showCopy && (
          <button
            type="button"
            onClick={handleCopyLatex}
            title="複製 LaTeX 原始碼"
            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg bg-white/90 hover:bg-white text-slate-600 hover:text-indigo-600 border border-purple-200 shadow-2xs text-[11px] flex items-center gap-1 font-sans"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
            <span>{copied ? '已複製' : 'LaTeX'}</span>
          </button>
        )}

        <div className="flex items-center justify-center min-w-max py-1 text-slate-900 overflow-x-auto select-all">
          {hasError ? (
            <span ref={containerRef} className="font-serif italic text-purple-950 font-semibold px-2 py-1">
              $${normalizedMath}$$
            </span>
          ) : (
            <span
              ref={containerRef}
              className="katex-display-formula text-slate-900"
              dangerouslySetInnerHTML={{ __html: renderedHtml }}
            />
          )}
        </div>
      </div>
    );
  }

  return (
    <span
      ref={containerRef}
      className={`inline-flex items-center px-1 text-purple-950 font-medium align-middle select-all ${className}`}
      title={`LaTeX: ${normalizedMath}`}
      dangerouslySetInnerHTML={{ __html: renderedHtml || normalizedMath }}
    />
  );
};
