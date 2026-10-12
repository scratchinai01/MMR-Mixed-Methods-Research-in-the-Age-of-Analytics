// =====================================================================
// 在瀏覽器中解析 PDF，逐頁取出「原文」段落（不上傳伺服器）
// ---------------------------------------------------------------------
// - 依文字座標組成行，自動處理期刊常見的雙欄排版（先左欄、後右欄）
// - 依行距與字級切分段落；行尾連字號斷字（analy- sis）會接回
// - 每頁都出現的頁首／頁尾（期刊名、頁碼）會被略過，並計數回報
// - 原文內容不做任何改寫；段落文字＝PDF 中的文字依閱讀順序串接
// =====================================================================

export interface PdfParagraph {
  id: string;
  page: number;
  text: string;
  kind: 'heading' | 'body';
}

export interface PdfDocumentText {
  title: string;
  numPages: number;
  paragraphs: PdfParagraph[];
  removedHeaderFooterLines: number;
  pdf: any; // pdf.js 文件物件，用來繪製原始頁面
}

interface Item { str: string; x: number; y: number; w: number; size: number; bold: boolean }
interface Line { text: string; x0: number; x1: number; y: number; size: number; bold: boolean }

let pdfjsPromise: Promise<any> | null = null;
async function loadPdfjs() {
  if (!pdfjsPromise) {
    pdfjsPromise = (async () => {
      const pdfjs: any = await import('pdfjs-dist');
      const worker: any = await import('pdfjs-dist/build/pdf.worker.min.mjs?url');
      pdfjs.GlobalWorkerOptions.workerSrc = worker.default;
      return pdfjs;
    })();
  }
  return pdfjsPromise;
}

const median = (xs: number[]) => {
  if (!xs.length) return 0;
  const s = [...xs].sort((a, b) => a - b);
  return s[Math.floor(s.length / 2)];
};

/** 把同一列（y 相近）的文字組成行；行內若在頁面中線附近有大空隙，拆成左右兩段 */
function buildLines(items: Item[], pageWidth: number): Line[] {
  const sorted = [...items].sort((a, b) => b.y - a.y || a.x - b.x);
  const rows: Item[][] = [];
  for (const it of sorted) {
    const row = rows[rows.length - 1];
    if (row && Math.abs(row[0].y - it.y) < Math.max(2, it.size * 0.45)) row.push(it);
    else rows.push([it]);
  }
  const mid = pageWidth / 2;
  const lines: Line[] = [];
  for (const row of rows) {
    row.sort((a, b) => a.x - b.x);
    // 依中線空隙拆成左右兩段（雙欄排版）
    const segments: Item[][] = [[]];
    for (let i = 0; i < row.length; i++) {
      const it = row[i];
      const prev = row[i - 1];
      if (prev) {
        const gap = it.x - (prev.x + prev.w);
        const crossesMid = prev.x + prev.w < mid + it.size && it.x > mid - it.size * 2;
        if (gap > it.size * 1.8 && crossesMid) segments.push([]);
      }
      segments[segments.length - 1].push(it);
    }
    for (const seg of segments) {
      if (!seg.length) continue;
      let text = '';
      for (let i = 0; i < seg.length; i++) {
        const it = seg[i];
        const prev = seg[i - 1];
        if (prev) {
          const gap = it.x - (prev.x + prev.w);
          if (gap > it.size * 0.15 && !text.endsWith(' ') && !it.str.startsWith(' ')) text += ' ';
        }
        text += it.str;
      }
      text = text.replace(/\s+/g, ' ').trim();
      if (!text) continue;
      const last = seg[seg.length - 1];
      lines.push({
        text, x0: seg[0].x, x1: last.x + last.w, y: seg[0].y,
        size: median(seg.map((s) => s.size)), bold: seg.some((s) => s.bold),
      });
    }
  }
  return lines;
}

/** 依閱讀順序排列：跨欄的行照順序；遇到一段雙欄區塊時，先輸出左欄再輸出右欄 */
function readingOrder(lines: Line[], pageWidth: number): Line[][] {
  const mid = pageWidth / 2;
  const kind = (l: Line) => (l.x0 < mid - 20 && l.x1 > mid + 20 ? 'full' : l.x1 <= mid + 20 ? 'left' : 'right');
  const ordered = [...lines].sort((a, b) => b.y - a.y || a.x0 - b.x0);
  const blocks: Line[][] = [];
  let i = 0;
  while (i < ordered.length) {
    if (kind(ordered[i]) === 'full') {
      const block: Line[] = [];
      while (i < ordered.length && kind(ordered[i]) === 'full') block.push(ordered[i++]);
      blocks.push(block);
    } else {
      const region: Line[] = [];
      while (i < ordered.length && kind(ordered[i]) !== 'full') region.push(ordered[i++]);
      const left = region.filter((l) => kind(l) === 'left');
      const right = region.filter((l) => kind(l) === 'right');
      if (left.length) blocks.push(left);
      if (right.length) blocks.push(right);
    }
  }
  return blocks;
}

/** 把一欄的行切成段落：行距明顯變大、字級改變、或上一行明顯較短且以句點結尾時分段 */
function toParagraphs(block: Line[], bodySize: number): Array<{ text: string; heading: boolean }> {
  const gaps: number[] = [];
  for (let i = 1; i < block.length; i++) gaps.push(block[i - 1].y - block[i].y);
  const lineGap = median(gaps.filter((g) => g > 0)) || bodySize * 1.2;
  const colWidth = Math.max(...block.map((l) => l.x1 - l.x0));
  const paras: Array<{ lines: Line[] }> = [];
  for (let i = 0; i < block.length; i++) {
    const l = block[i];
    const prev = block[i - 1];
    let newPara = !prev;
    if (prev) {
      const gap = prev.y - l.y;
      const sizeChange = Math.abs(prev.size - l.size) > bodySize * 0.12;
      const shortEnd = prev.x1 - prev.x0 < colWidth * 0.75 && /[.:?!)]$/.test(prev.text);
      const indented = l.x0 - prev.x0 > bodySize * 0.8;
      newPara = gap > lineGap * 1.45 || sizeChange || (shortEnd && (indented || gap > lineGap * 1.15)) || prev.bold !== l.bold && l.text.length < 120;
    }
    if (newPara) paras.push({ lines: [l] });
    else paras[paras.length - 1].lines.push(l);
  }
  return paras.map(({ lines }) => {
    let text = '';
    for (const ln of lines) {
      if (!text) text = ln.text;
      else if (/[A-Za-z]-$/.test(text) && /^[a-z]/.test(ln.text)) text = text.slice(0, -1) + ln.text; // 斷字接回
      else text += ' ' + ln.text;
    }
    const size = median(lines.map((x) => x.size));
    const heading = text.length < 140 && (size > bodySize * 1.12 || (lines.every((x) => x.bold) && lines.length <= 2));
    return { text, heading };
  });
}

const normalizeForRepeat = (t: string) => t.replace(/\d+/g, '#').replace(/\s+/g, ' ').trim().toLowerCase();

export async function extractPdfText(file: File, onProgress?: (done: number, total: number) => void): Promise<PdfDocumentText> {
  const pdfjs = await loadPdfjs();
  const data = new Uint8Array(await file.arrayBuffer());
  const pdf = await pdfjs.getDocument({ data }).promise;
  const pages: Array<{ lines: Line[]; width: number }> = [];
  for (let p = 1; p <= pdf.numPages; p++) {
    const page = await pdf.getPage(p);
    const vp = page.getViewport({ scale: 1 });
    const content = await page.getTextContent();
    const items: Item[] = content.items
      .filter((it: any) => typeof it.str === 'string' && it.str.trim() !== '')
      .map((it: any) => {
        const [a, b, , , e, f] = it.transform;
        const style = content.styles?.[it.fontName] || {};
        return {
          str: it.str, x: e, y: f, w: it.width || 0,
          size: Math.hypot(a, b) || it.height || 10,
          bold: /bold|black|semibold/i.test(`${it.fontName} ${style.fontFamily || ''}`),
        };
      });
    pages.push({ lines: buildLines(items, vp.width), width: vp.width });
    onProgress?.(p, pdf.numPages);
  }

  // 頁首／頁尾：在一半以上頁面的頂端或底端重複出現的行（數字視為相同）
  const edgeCount = new Map<string, number>();
  pages.forEach(({ lines }) => {
    const sorted = [...lines].sort((a, b) => b.y - a.y);
    const edges = [...sorted.slice(0, 3), ...sorted.slice(-3)];
    new Set(edges.map((l) => normalizeForRepeat(l.text))).forEach((k) => edgeCount.set(k, (edgeCount.get(k) || 0) + 1));
  });
  const threshold = Math.max(2, Math.ceil(pdf.numPages * 0.5));
  const isRepeat = (l: Line) => (edgeCount.get(normalizeForRepeat(l.text)) || 0) >= threshold || /^\d{1,4}$/.test(l.text.trim());

  const bodySize = median(pages.flatMap((p) => p.lines.map((l) => l.size))) || 10;
  const paragraphs: PdfParagraph[] = [];
  let removed = 0;
  pages.forEach(({ lines, width }, idx) => {
    const sorted = [...lines].sort((a, b) => b.y - a.y);
    const top = new Set(sorted.slice(0, 3));
    const bottom = new Set(sorted.slice(-3));
    const kept = lines.filter((l) => {
      const drop = (top.has(l) || bottom.has(l)) && isRepeat(l);
      if (drop) removed++;
      return !drop;
    });
    readingOrder(kept, width).forEach((block) => {
      toParagraphs(block, bodySize).forEach((p) => {
        paragraphs.push({ id: `p${idx + 1}-${paragraphs.length}`, page: idx + 1, text: p.text, kind: p.heading ? 'heading' : 'body' });
      });
    });
  });

  // 跨欄或跨頁被切斷的段落：前一段沒有句尾標點，且下一段以小寫開頭 → 接回同一段
  for (let i = paragraphs.length - 1; i > 0; i--) {
    const a = paragraphs[i - 1];
    const b = paragraphs[i];
    if ((b.page === a.page || b.page === a.page + 1) && a.kind === 'body' && b.kind === 'body' && !/[.:?!"”)]$/.test(a.text) && /^[a-z(]/.test(b.text)) {
      a.text = /[A-Za-z]-$/.test(a.text) ? a.text.slice(0, -1) + b.text : `${a.text} ${b.text}`;
      paragraphs.splice(i, 1);
    }
  }

  let title = '';
  try {
    const meta = await pdf.getMetadata();
    title = meta?.info?.Title || '';
  } catch { /* 沒有中繼資料 */ }
  if (!title || title.length < 8) title = paragraphs.find((p) => p.kind === 'heading' && p.text.length > 15)?.text || file.name;

  return { title, numPages: pdf.numPages, paragraphs, removedHeaderFooterLines: removed, pdf };
}

/** 把指定頁面畫成圖片（PNG data URL），供「對照 PDF 原頁」使用 */
export async function renderPdfPage(pdf: any, pageNumber: number, width = 900): Promise<string> {
  const page = await pdf.getPage(pageNumber);
  const vp1 = page.getViewport({ scale: 1 });
  const scale = (width / vp1.width) * (window.devicePixelRatio > 1 ? 1.5 : 1);
  const vp = page.getViewport({ scale });
  const canvas = document.createElement('canvas');
  canvas.width = Math.floor(vp.width);
  canvas.height = Math.floor(vp.height);
  await page.render({ canvasContext: canvas.getContext('2d')!, viewport: vp, canvas }).promise;
  return canvas.toDataURL('image/png');
}

/** 簡單雜湊，用來快取譯文 */
export function hashText(t: string): string {
  let h = 5381;
  for (let i = 0; i < t.length; i++) h = ((h << 5) + h + t.charCodeAt(i)) | 0;
  return (h >>> 0).toString(36) + t.length.toString(36);
}
