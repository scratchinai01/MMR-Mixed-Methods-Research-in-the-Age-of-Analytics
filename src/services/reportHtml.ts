// =====================================================================
// 把 MMR 診斷報告（Markdown）轉成「圖表豐富、可離線開啟」的單一 HTML 檔
// ---------------------------------------------------------------------
// 圖表全部用內嵌 SVG 畫，不需網路、不依賴任何外部套件：
//   1. 設計類型判定：表 4.2 的「時機 × 權重」四宮格，標出判定的類型
//   2. 快捷指令評分：從報告中「分數」表格抓 0–100 分畫長條圖
//   3. QUAN : QUAL 比例：抓到「95:5」這類比例時畫環圈圖
//   4. 研究流程：有 AI 結構化判定時，畫出各階段流程
// 報告內文由簡易 Markdown 轉換器輸出（標題、粗體、清單、表格、引用、分隔線）
// =====================================================================

export interface ReportHtmlInput {
  title: string;              // 論文名稱或檔名
  markdown: string;           // AI 診斷報告原文
  designId?: string;          // triangulation | embedded | explanatory | exploratory | unclear
  designName?: string;
  variant?: string;
  designSource?: 'ai' | 'guess';
  phases?: Array<{ label: string; items: string[] }>;
  evidence?: string;
  modelUsed?: string;
  generatedAt?: string;
}

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** 行內格式：**粗體**、*斜體*、`程式碼` */
function inline(s: string): string {
  return esc(s)
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[^*])\*([^*\s][^*]*)\*/g, '$1<em>$2</em>');
}

const isTableRow = (l: string) => /^\s*\|.*\|\s*$/.test(l);
const isTableSep = (l: string) => /^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)*\|?\s*$/.test(l);
const cells = (l: string) => l.trim().replace(/^\||\|$/g, '').split('|').map((c) => c.trim());

/** 簡易 Markdown → HTML（足以處理 AI 診斷報告的常見格式） */
export function markdownToHtml(md: string): string {
  const lines = md.replace(/\r/g, '').split('\n');
  const out: string[] = [];
  let i = 0;
  let para: string[] = [];
  const flush = () => {
    if (para.length) out.push(`<p>${inline(para.join(' '))}</p>`);
    para = [];
  };
  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) { flush(); i++; continue; }
    const h = line.match(/^(#{1,4})\s+(.*)$/);
    if (h) { flush(); out.push(`<h${h[1].length + 1}>${inline(h[2])}</h${h[1].length + 1}>`); i++; continue; }
    if (/^\s*(-{3,}|\*{3,})\s*$/.test(line)) { flush(); out.push('<hr>'); i++; continue; }
    if (isTableRow(line) && i + 1 < lines.length && isTableSep(lines[i + 1])) {
      flush();
      const head = cells(line);
      i += 2;
      const body: string[][] = [];
      while (i < lines.length && isTableRow(lines[i])) { body.push(cells(lines[i])); i++; }
      out.push(`<div class="table-wrap"><table><thead><tr>${head.map((c) => `<th>${inline(c)}</th>`).join('')}</tr></thead><tbody>${body
        .map((r) => `<tr>${r.map((c) => `<td>${inline(c)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`);
      continue;
    }
    if (/^\s*>/.test(line)) {
      flush();
      const q: string[] = [];
      while (i < lines.length && /^\s*>/.test(lines[i])) { q.push(lines[i].replace(/^\s*>\s?/, '')); i++; }
      out.push(`<blockquote>${inline(q.join(' '))}</blockquote>`);
      continue;
    }
    if (/^\s*([*+-]|\d+\.)\s+/.test(line)) {
      flush();
      // 清單：依縮排建立巢狀結構
      const stack: Array<{ indent: number; tag: string }> = [];
      let html = '';
      while (i < lines.length && (/^\s*([*+-]|\d+\.)\s+/.test(lines[i]) || (lines[i].trim() && /^\s{2,}/.test(lines[i]) && stack.length))) {
        const l = lines[i];
        const m = l.match(/^(\s*)([*+-]|\d+\.)\s+(.*)$/);
        if (!m) { html = html.replace(/<\/li>$/, '') + ' ' + inline(l.trim()) + '</li>'; i++; continue; }
        const indent = m[1].replace(/\t/g, '    ').length;
        const tag = /\d+\./.test(m[2]) ? 'ol' : 'ul';
        if (!stack.length || indent > stack[stack.length - 1].indent) {
          if (stack.length) html = html.replace(/<\/li>$/, '');
          stack.push({ indent, tag });
          html += `<${tag}>`;
        } else {
          while (stack.length && indent < stack[stack.length - 1].indent) {
            html += `</${stack.pop()!.tag}></li>`;
          }
        }
        html += `<li>${inline(m[3])}</li>`;
        i++;
      }
      while (stack.length) {
        const t = stack.pop()!.tag;
        html += `</${t}>` + (stack.length ? '</li>' : '');
      }
      out.push(html);
      continue;
    }
    para.push(line.trim());
    i++;
  }
  flush();
  return out.join('\n');
}

// ─────────────────────────── 從報告抓圖表資料 ───────────────────────────
interface ScoreItem { name: string; score: number; note: string }

/** 找出含「分數」欄的表格，取 0–100 的分數；同時抓 QUAN:QUAL 比例 */
export function extractScores(md: string): { scores: ScoreItem[]; ratio: { quan: number; qual: number } | null } {
  const lines = md.split('\n');
  const scores: ScoreItem[] = [];
  let ratio: { quan: number; qual: number } | null = null;
  for (let i = 0; i < lines.length - 1; i++) {
    if (!isTableRow(lines[i]) || !isTableSep(lines[i + 1])) continue;
    const head = cells(lines[i]);
    const si = head.findIndex((h) => /分數|score|評分/i.test(h));
    if (si < 0) continue;
    const ni = head.findIndex((h) => /結果|判定|結論/.test(h));
    for (let j = i + 2; j < lines.length && isTableRow(lines[j]); j++) {
      const r = cells(lines[j]);
      const name = r[0].replace(/\*\*/g, '');
      const raw = r[si] || '';
      const ratioM = raw.match(/(\d{1,3})\s*[:：]\s*(\d{1,3})/);
      if (ratioM) {
        ratio = { quan: Number(ratioM[1]), qual: Number(ratioM[2]) };
        continue;
      }
      const n = raw.match(/(\d{1,3}(?:\.\d+)?)/);
      if (n && Number(n[1]) <= 100) scores.push({ name, score: Number(n[1]), note: ni >= 0 ? (r[ni] || '').replace(/\*\*/g, '') : '' });
    }
  }
  if (!ratio) {
    const m = md.match(/QUAN[^\n]{0,40}?(\d{1,3})\s*[:：]\s*(\d{1,3})/i);
    if (m) ratio = { quan: Number(m[1]), qual: Number(m[2]) };
  }
  return { scores, ratio };
}

// ─────────────────────────── SVG 圖表 ───────────────────────────
function scoreBars(scores: ScoreItem[]): string {
  const rowH = 38, labelW = 170, barW = 360, h = scores.length * rowH + 10;
  const color = (s: number) => (s >= 80 ? '#059669' : s >= 60 ? '#2563eb' : s >= 40 ? '#d97706' : '#dc2626');
  return `<svg viewBox="0 0 ${labelW + barW + 60} ${h}" class="chart" role="img" aria-label="快捷指令評分長條圖">
${scores.map((s, i) => {
    const y = i * rowH + 6;
    const w = (s.score / 100) * barW;
    return `<text x="0" y="${y + 18}" class="lbl">${esc(s.name)}</text>
<rect x="${labelW}" y="${y + 4}" width="${barW}" height="20" rx="6" class="track"/>
<rect x="${labelW}" y="${y + 4}" width="${w}" height="20" rx="6" fill="${color(s.score)}"/>
<text x="${labelW + barW + 8}" y="${y + 19}" class="val">${s.score}</text>`;
  }).join('\n')}
</svg>`;
}

function ratioDonut(r: { quan: number; qual: number }): string {
  const total = r.quan + r.qual || 1;
  const p = r.quan / total;
  const R = 70, C = 2 * Math.PI * R;
  return `<svg viewBox="0 0 220 200" class="chart donut" role="img" aria-label="QUAN 與 QUAL 比例">
<circle cx="110" cy="100" r="${R}" fill="none" stroke="#a78bfa" stroke-width="28"/>
<circle cx="110" cy="100" r="${R}" fill="none" stroke="#2563eb" stroke-width="28"
  stroke-dasharray="${(p * C).toFixed(1)} ${C.toFixed(1)}" transform="rotate(-90 110 100)"/>
<text x="110" y="96" text-anchor="middle" class="big">${r.quan}:${r.qual}</text>
<text x="110" y="118" text-anchor="middle" class="small">QUAN : QUAL</text>
</svg>
<div class="legend"><span><i style="background:#2563eb"></i>量化 ${Math.round(p * 100)}%</span><span><i style="background:#a78bfa"></i>質性 ${Math.round((1 - p) * 100)}%</span></div>`;
}

/** 表 4.2 四宮格：橫軸時機（同時／連續）、縱軸權重；判定的類型以實心強調 */
function designGrid(designId?: string): string {
  const cellsDef = [
    { id: 'triangulation', name: '三角校正', sub: 'QUAN + QUAL', x: 0, y: 0, timing: '同時', weight: '通常相等' },
    { id: 'embedded', name: '嵌入式', sub: 'QUAN(qual) / QUAL(quan)', x: 1, y: 0, timing: '同時或連續', weight: '一主一次' },
    { id: 'explanatory', name: '解釋式', sub: 'QUAN → qual', x: 0, y: 1, timing: '連續（先量後質）', weight: '強調量化' },
    { id: 'exploratory', name: '探索式', sub: 'QUAL → quan', x: 1, y: 1, timing: '連續（先質後量）', weight: '強調質性' },
  ];
  return `<svg viewBox="0 0 520 300" class="chart" role="img" aria-label="表 4.2 設計類型判定">
${cellsDef.map((c) => {
    const on = c.id === designId;
    const x = 10 + c.x * 255, y = 10 + c.y * 145;
    return `<g>
<rect x="${x}" y="${y}" width="245" height="135" rx="14" class="${on ? 'cell on' : 'cell'}"/>
<text x="${x + 18}" y="${y + 38}" class="${on ? 'cname on' : 'cname'}">${c.name}${on ? '　✓ 判定' : ''}</text>
<text x="${x + 18}" y="${y + 64}" class="${on ? 'csub on' : 'csub'}">${esc(c.sub)}</text>
<text x="${x + 18}" y="${y + 92}" class="${on ? 'csub on' : 'csub'}">時機：${c.timing}</text>
<text x="${x + 18}" y="${y + 114}" class="${on ? 'csub on' : 'csub'}">權重：${c.weight}</text>
</g>`;
  }).join('\n')}
</svg>`;
}

function phaseFlow(phases: Array<{ label: string; items: string[] }>): string {
  return `<div class="flow">${phases.map((p, i) => `
<div class="phase"><div class="phase-h"><span class="num">${i + 1}</span>${esc(p.label)}</div>
<ul>${p.items.map((it) => `<li>${esc(it)}</li>`).join('')}</ul></div>${i < phases.length - 1 ? '<div class="arrow">→</div>' : ''}`).join('')}
</div>`;
}

// ─────────────────────────── 組成完整 HTML ───────────────────────────
export function buildReportHtml(input: ReportHtmlInput): string {
  const { scores, ratio } = extractScores(input.markdown);
  const date = input.generatedAt || new Date().toLocaleString('zh-TW', { hour12: false });
  const sections: string[] = [];

  sections.push(`<section class="card">
<h2>設計類型判定（Creswell &amp; Plano Clark 表 4.2）</h2>
<div class="kpis">
  <div class="kpi"><div class="k">第 1 階段大類</div><div class="v">${esc(input.designName || '未判定')}</div></div>
  <div class="kpi"><div class="k">第 2 階段子變型</div><div class="v">${esc(input.variant || '未判定')}</div></div>
</div>
${designGrid(input.designId)}
${input.designSource === 'guess' ? '<p class="muted">※ 設計類型依報告文字推測，可能不準，請以下方報告內文為準。</p>' : ''}
${input.evidence ? `<p><strong>判定依據：</strong>${esc(input.evidence)}</p>` : ''}
</section>`);

  if (scores.length || ratio) {
    sections.push(`<section class="card">
<h2>快捷指令評分</h2>
<div class="charts">
${scores.length ? `<div class="chart-box grow">${scoreBars(scores)}</div>` : ''}
${ratio ? `<div class="chart-box">${ratioDonut(ratio)}</div>` : ''}
</div>
${scores.some((s) => s.note) ? `<div class="table-wrap"><table><thead><tr><th>指令</th><th>判定</th><th>分數</th></tr></thead><tbody>${scores
      .map((s) => `<tr><td>${esc(s.name)}</td><td>${esc(s.note)}</td><td class="num-cell">${s.score}</td></tr>`).join('')}</tbody></table></div>` : ''}
</section>`);
  }

  if (input.phases && input.phases.length) {
    sections.push(`<section class="card"><h2>本篇論文的研究流程</h2>${phaseFlow(input.phases)}</section>`);
  }

  sections.push(`<section class="card report"><h2>完整診斷報告</h2>${markdownToHtml(input.markdown)}</section>`);

  return `<!doctype html>
<html lang="zh-Hant">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>MMR 診斷報告｜${esc(input.title)}</title>
<style>
:root{--ink:#0f172a;--muted:#64748b;--line:#e2e8f0;--bg:#f8fafc;--card:#fff;--brand:#4f46e5;--blue:#2563eb;--green:#059669}
@media (prefers-color-scheme: dark){:root{--ink:#e2e8f0;--muted:#94a3b8;--line:#334155;--bg:#0b1120;--card:#111827}}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--ink);font-family:"Noto Sans TC","PingFang TC","Microsoft JhengHei",system-ui,sans-serif;line-height:1.75}
.wrap{max-width:960px;margin:0 auto;padding:32px 16px 64px}
header.top{background:linear-gradient(120deg,#312e81,#4f46e5 55%,#7c3aed);color:#fff;border-radius:20px;padding:28px 28px 22px;margin-bottom:20px}
header.top h1{margin:0 0 6px;font-size:1.5rem;line-height:1.35}
header.top .meta{opacity:.85;font-size:.85rem}
.card{background:var(--card);border:1px solid var(--line);border-radius:18px;padding:22px 24px;margin-bottom:18px}
.card h2{margin:0 0 14px;font-size:1.15rem}
.kpis{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:12px;margin-bottom:14px}
.kpi{border:1px solid var(--line);border-radius:14px;padding:12px 14px}
.kpi .k{font-size:.78rem;color:var(--muted)}.kpi .v{font-weight:700;font-size:1.05rem}
.chart{width:100%;height:auto;display:block}
.chart .lbl{font-size:13px;fill:var(--ink)}.chart .val{font-size:13px;font-weight:700;fill:var(--ink)}
.chart .track{fill:var(--line)}
.chart .cell{fill:transparent;stroke:var(--line);stroke-width:2}.chart .cell.on{fill:var(--brand);stroke:var(--brand)}
.chart .cname{font-size:20px;font-weight:700;fill:var(--ink)}.chart .csub{font-size:13px;fill:var(--muted)}
.chart .cname.on,.chart .csub.on{fill:#fff}
.chart .big{font-size:26px;font-weight:800;fill:var(--ink)}.chart .small{font-size:12px;fill:var(--muted)}
.charts{display:flex;flex-wrap:wrap;gap:16px;align-items:center}
.chart-box{flex:0 0 220px}.chart-box.grow{flex:1 1 420px}
.donut{max-width:220px}
.legend{display:flex;gap:14px;justify-content:center;font-size:.82rem;color:var(--muted)}
.legend i{display:inline-block;width:10px;height:10px;border-radius:3px;margin-right:5px}
.flow{display:flex;flex-wrap:wrap;gap:10px;align-items:stretch}
.phase{flex:1 1 220px;border:2px solid var(--line);border-radius:14px;padding:12px 14px}
.phase-h{font-weight:700;display:flex;align-items:center;gap:8px;margin-bottom:6px}
.num{display:inline-grid;place-items:center;width:24px;height:24px;border-radius:999px;background:var(--brand);color:#fff;font-size:.8rem}
.phase ul{margin:0;padding-left:1.1rem;font-size:.92rem}
.arrow{align-self:center;font-size:1.4rem;color:var(--muted)}
.table-wrap{overflow-x:auto;margin:10px 0}
table{border-collapse:collapse;width:100%;font-size:.92rem}
th,td{border-bottom:1px solid var(--line);padding:8px 10px;text-align:left;vertical-align:top}
th{background:color-mix(in srgb,var(--brand) 10%,transparent);white-space:nowrap}
.num-cell{font-variant-numeric:tabular-nums;font-weight:700}
.report h3{margin:22px 0 8px;font-size:1.1rem;color:var(--brand)}.report h4,.report h5{margin:16px 0 6px}
.report hr{border:0;border-top:1px dashed var(--line);margin:18px 0}
blockquote{margin:10px 0;padding:8px 14px;border-left:4px solid var(--brand);background:color-mix(in srgb,var(--brand) 6%,transparent);border-radius:6px}
code{background:color-mix(in srgb,var(--muted) 15%,transparent);padding:1px 5px;border-radius:5px;font-size:.9em}
.muted{color:var(--muted);font-size:.85rem}
footer{color:var(--muted);font-size:.8rem;text-align:center;margin-top:24px}
@media print{body{background:#fff}.card{break-inside:avoid}header.top{-webkit-print-color-adjust:exact;print-color-adjust:exact}}
</style>
</head>
<body>
<div class="wrap">
<header class="top">
  <h1>混合方法研究 (MMR) 診斷報告</h1>
  <div>${esc(input.title)}</div>
  <div class="meta">產生時間：${esc(date)}${input.modelUsed ? `｜分析模型：${esc(input.modelUsed)}` : ''}</div>
</header>
${sections.join('\n')}
<footer>審查依據：Creswell &amp; Plano Clark (2018) 表 4.2｜本報告由 AI 產生，請以論文原文核對。</footer>
</div>
</body>
</html>`;
}
