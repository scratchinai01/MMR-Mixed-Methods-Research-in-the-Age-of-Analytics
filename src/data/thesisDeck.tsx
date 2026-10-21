// =====================================================================
// 兩小時論文報告投影片內容（三大段、34 頁、每頁左右對照）
// ---------------------------------------------------------------------
//   第一部分 原文報告   40 分鐘（含摘要逐句精讀）
//   第二部分 台股復刻   60 分鐘（含資料蒐集流程）
//   第三部分 復刻後比較 20 分鐘（6 頁）
//
// 每頁固定「左：原著論文（藍）｜右：台股復刻（綠）」。
// 右欄的所有數字都來自 public/data/ml_results.json（由 news_ml_study.py 以 FinMind 真實資料計算）；
// 還沒計算時一律顯示「尚未計算」，不放任何假數字。
// 左欄原著數字取自本平台的論文翻譯（src/data/paperContent.ts），報告前請以原文 PDF 核對。
// =====================================================================
import React from 'react';
import { PARA_EXPLAIN } from './paraExplain.ts';
import { NewsDownload } from '../components/NewsDownload.tsx';
import { PAPER_TABLES, ORIGINAL_PAPER_SOURCE, PAPER_PARAGRAPHS } from './paperContent.ts';

export type DeckSection = 'paper' | 'replication' | 'compare';

export interface DeckContext {
  data: any | null; // ml_results.json；null = 尚未計算
  history?: any[];   // run_history.json：每次計算的執行紀錄
}

export interface DeckSlide {
  id: string;
  section: DeckSection;
  title: string;
  minutes: number;
  left: (ctx: DeckContext) => React.ReactNode;
  right: (ctx: DeckContext) => React.ReactNode;
  notes: string;
  quotes?: string[]; // 左欄附上的論文原文段落（PAPER_PARAGRAPHS 的 id），英中對照
}

export const SECTION_META: Record<DeckSection, { label: string; minutes: number; color: string }> = {
  paper: { label: '第一部分　原文報告', minutes: 40, color: 'bg-blue-600' },
  replication: { label: '第二部分　台股復刻', minutes: 60, color: 'bg-emerald-600' },
  compare: { label: '第三部分　復刻後比較', minutes: 20, color: 'bg-amber-500' },
};

// ── 原著數字：直接讀本平台論文翻譯的表格，避免兩處數字不一致 ──
const table = (id: string) => PAPER_TABLES.find((t) => t.id === id);
const T2 = table('table-2');
const T78 = table('table-7-8');

/** 取原著表 2 某一列（例如 'Sales_growth X Positive'）的 Model 3 (Exchangeable) 欄 */
export function paperCell(term: string, col = 3): string {
  const row = T2?.rows.find((r) => String(r[0]).startsWith(term));
  return row ? String(row[col]) : '—';
}

/** 解析 '−102.094** (39.289)' → { coef, stars } */
function parsePaper(term: string) {
  const s = paperCell(term).replace('−', '-');
  const m = s.match(/(-?\d+(?:\.\d+)?)(\**\+?)/);
  return m ? { coef: Number(m[1]), stars: m[2] } : null;
}

// ── 台股結果讀取 ──
const gee = (ctx: DeckContext) => ctx.data?.gee || null;
const geeModel = (ctx: DeckContext, key = 'exchangeable') => gee(ctx)?.models?.[key] || null;
export function ourTerm(ctx: DeckContext, term: string, key = 'exchangeable') {
  return geeModel(ctx, key)?.rows?.find((r: any) => r.term === term) || null;
}

type Verdict = '一致' | '方向相同但不顯著' | '方向相反但不顯著' | '相反' | '尚未計算';

/** 比較原著與台股：同號且 p<.05 → 一致；同號但不顯著；異號但不顯著；異號且顯著 → 相反 */
export function verdictFor(ctx: DeckContext, term: string): Verdict {
  const ours = ourTerm(ctx, term);
  const paper = parsePaper(term);
  if (!ours || !paper) return '尚未計算';
  const same = Math.sign(ours.coef) === Math.sign(paper.coef);
  if (same && ours.p < 0.05) return '一致';
  if (!same && ours.p < 0.05) return '相反';
  return same ? '方向相同但不顯著' : '方向相反但不顯著';
}

// ─────────────────────────── 小元件 ───────────────────────────
const Bullets: React.FC<{ items: React.ReactNode[] }> = ({ items }) => (
  <ul className="space-y-2 list-disc pl-5 marker:text-current/50">
    {items.map((it, i) => <li key={i}>{it}</li>)}
  </ul>
);

const KV: React.FC<{ rows: Array<[string, React.ReactNode]> }> = ({ rows }) => (
  <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5">
    {rows.map(([k, v], i) => (
      <React.Fragment key={i}>
        <dt className="font-semibold whitespace-nowrap opacity-80">{k}</dt>
        <dd>{v}</dd>
      </React.Fragment>
    ))}
  </dl>
);

const MiniTable: React.FC<{ headers: string[]; rows: React.ReactNode[][]; dense?: boolean }> = ({ headers, rows, dense }) => (
  <div className="overflow-x-auto">
    <table className={`w-full text-left ${dense ? 'text-[0.82em]' : ''}`}>
      <thead>
        <tr className="border-b border-current/20">
          {headers.map((h, i) => <th key={i} className="py-1.5 pr-3 font-semibold whitespace-nowrap">{h}</th>)}
        </tr>
      </thead>
      <tbody>
        {rows.map((r, i) => (
          <tr key={i} className="border-b border-current/10 last:border-0">
            {r.map((c, j) => <td key={j} className={`py-1.5 pr-3 ${j > 0 ? 'font-mono tabular-nums whitespace-nowrap' : ''}`}>{c}</td>)}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export const Pending: React.FC<{ what?: string }> = ({ what }) => (
  <div className="rounded-xl border border-dashed border-emerald-400/70 bg-emerald-50/60 p-4 text-emerald-900 space-y-1.5">
    <div className="font-bold">尚未計算{what ? `：${what}` : ''}</div>
    <p className="text-[0.85em] leading-relaxed">
      這一欄只顯示以 FinMind 真實資料算出的結果。請在 Cloud Shell 執行 <code className="font-mono">python3 news_ml_study.py</code>，
      再把 <code className="font-mono">public/data/ml_results.json</code> 推送到 GitHub，網站更新後這裡會自動出現數字。
    </p>
  </div>
);

const VerdictChip: React.FC<{ v: Verdict }> = ({ v }) => {
  const cls = v === '一致' ? 'bg-emerald-600 text-white'
    : v === '相反' ? 'bg-rose-600 text-white'
    : v === '方向相同但不顯著' ? 'bg-amber-400 text-slate-950'
    : v === '方向相反但不顯著' ? 'bg-rose-100 text-rose-800'
    : 'bg-slate-200 text-slate-700';
  return <span className={`inline-block px-2 py-0.5 rounded-full text-[0.8em] font-bold whitespace-nowrap ${cls}`}>{v}</span>;
};

const pct = (x?: number) => (typeof x === 'number' ? `${(x * 100).toFixed(1)}%` : '—');
const num = (x?: number, d = 3) => (typeof x === 'number' && Number.isFinite(x) ? x.toFixed(d) : '—');
const stockList = (ctx: DeckContext) => (ctx.data?.stocks || []).map((s: any) => `${s.name}${s.id}`).join('、');

/** 依係數方向與顯著性產生一句白話解讀 */
function explain(row: any, positiveMeaning: string, negativeMeaning: string) {
  if (!row) return null;
  const sig = row.p < 0.05 ? `達統計顯著（p = ${num(row.p)}）` : `未達統計顯著（p = ${num(row.p)}）`;
  return `${row.coef >= 0 ? positiveMeaning : negativeMeaning}，${sig}。`;
}

/** 台股 GEE 表格：指定變數 × 指定模型 */
function OurCoefTable({ ctx, terms }: { ctx: DeckContext; terms: string[] }) {
  const m = geeModel(ctx);
  if (!m) return <Pending what="表 2 GEE 復刻" />;
  return (
    <MiniTable
      headers={['變數', '係數 (標準誤)', 'p 值']}
      rows={terms.map((t) => {
        const r = m.rows.find((x: any) => x.term === t);
        return [t, r ? r.display : '（未納入）', r ? num(r.p) : '—'];
      })}
    />
  );
}

function PaperCoefTable({ terms }: { terms: string[] }) {
  return (
    <MiniTable
      headers={['變數', '係數 (標準誤)']}
      rows={terms.map((t) => [t, paperCell(t)])}
    />
  );
}

const SourceNote: React.FC = () => (
  <p className="text-[0.75em] opacity-70 pt-2">原著數字取自本平台論文翻譯（表 2：Model 3 Exchangeable），報告前請以原文 PDF 核對。</p>
);



/** 表 4.2 四大主要設計縮圖：標出本研究的位置 */
function Table42Grid() {
  const items: Array<[string, string, boolean]> = [
    ['三角校正', '同時進行・通常並重', true],
    ['嵌入式', '一軌嵌入另一軌', false],
    ['解釋性', '先 QUAN 後 qual', false],
    ['探索性', '先 QUAL 後 quan', false],
  ];
  return (
    <div>
      <div className="text-[0.78em] font-bold opacity-80 mb-1.5">表 4.2 四大主要設計（Creswell &amp; Plano Clark 的分類，非原著內容）</div>
      <div className="grid grid-cols-4 gap-1.5 text-center">
        {items.map(([name, sub, on]) => (
          <div key={name} className={`rounded-lg border p-2 ${on ? 'bg-blue-600 text-white border-blue-600 shadow' : 'bg-white/70 border-slate-300 text-slate-600'}`}>
            <div className="font-bold text-[0.85em]">{name}</div>
            <div className="text-[0.7em] opacity-90 leading-snug">{sub}</div>
          </div>
        ))}
      </div>
      <div className="text-[0.72em] mt-1 opacity-80">本報告判讀（原著沒有自行標示設計類型）：最接近三角校正設計中的「資料轉化」變體——新聞與財務數字涵蓋同一期間，文字先量化，再和財務數字放進同一組模型。</div>
    </div>
  );
}

/** 資料轉化流程圖：質性文字 → 量化轉換 → 與量化資料合併 → 結果；虛線為缺少的質性詮釋軌 */
function DesignFlow(p: { qual: string; convert: string; quanFromQual: string; quan: string; merge: string; result: string; tone: 'blue' | 'green' }) {
  const c = p.tone === 'blue'
    ? { qual: 'bg-violet-100 border-violet-300 text-violet-900', quan: 'bg-blue-100 border-blue-300 text-blue-900', merge: 'bg-blue-600 text-white border-blue-600' }
    : { qual: 'bg-violet-100 border-violet-300 text-violet-900', quan: 'bg-emerald-100 border-emerald-300 text-emerald-900', merge: 'bg-emerald-600 text-white border-emerald-600' };
  const Box = ({ cls, tag, text }: { cls: string; tag: string; text: string }) => (
    <div className={`rounded-lg border px-2.5 py-1.5 ${cls}`}>
      <div className="text-[0.68em] font-bold opacity-70">{tag}</div>
      <div className="text-[0.82em] font-semibold leading-snug">{text}</div>
    </div>
  );
  const Down = () => <div className="text-center leading-none opacity-60 text-[0.9em]">↓</div>;
  return (
    <div className="space-y-1">
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <Box cls={c.qual} tag="QUAL 質性資料" text={p.qual} />
          <Down />
          <Box cls="bg-amber-50 border-amber-300 text-amber-900" tag="資料轉化" text={p.convert} />
          <Down />
          <Box cls={c.quan} tag="quan 轉成數字" text={p.quanFromQual} />
        </div>
        <div className="space-y-1 flex flex-col">
          <Box cls={c.quan} tag="QUAN 量化資料" text={p.quan} />
          <div className="flex-1 rounded-lg border-2 border-dashed border-slate-400 px-2.5 py-1.5 text-slate-500 flex flex-col justify-center">
            <div className="text-[0.68em] font-bold">缺少：質性詮釋軌</div>
            <div className="text-[0.75em] leading-snug">閱讀新聞、編碼、找主題，再回頭解釋統計結果</div>
          </div>
        </div>
      </div>
      <div className="text-center leading-none opacity-60 text-[0.9em]">↘　↙</div>
      <Box cls={c.merge} tag="整合（分析層）" text={p.merge} />
      <Down />
      <Box cls="bg-slate-800 text-white border-slate-800" tag="結果" text={p.result} />
    </div>
  );
}

/** 摘要逐句精讀：左欄完整英文原文＋中譯（摘要已與 Virginia Tech 典藏頁的公開摘要核對） */
function AbstractFull({ id, focus }: { id: string; focus: string[] }) {
  const para = PAPER_PARAGRAPHS.find((p) => p.id === id);
  if (!para) return null;
  return (
    <div className="space-y-3">
      <blockquote lang="en" className="italic text-slate-800 border-l-4 border-blue-500 pl-3 leading-relaxed">{para.en}</blockquote>
      <p className="pl-4 leading-relaxed">{para.zh}</p>
      <div className="pl-4">
        <div className="text-[0.8em] font-bold opacity-80 mb-1">本句重點</div>
        <Bullets items={focus} />
      </div>
      {PARA_EXPLAIN[id] && (
        <div className="ml-4 rounded-xl border border-amber-200 bg-amber-50/80 p-3 space-y-2 text-[0.92em] leading-relaxed">
          <div><span className="font-bold text-amber-900">白話說　</span>{PARA_EXPLAIN[id].p}</div>
          <div><span className="font-bold text-amber-900">生活例子　</span>{PARA_EXPLAIN[id].e}</div>
          <div className="rounded-lg bg-slate-900 text-white px-3 py-1.5"><span className="font-bold text-amber-300 mr-2">一句話記住</span>{PARA_EXPLAIN[id].k}</div>
        </div>
      )}
      <p className="text-[0.75em] opacity-70 pl-4">{para.pdfPage}｜已與期刊正式版 PDF 逐字核對</p>
    </div>
  );
}

/** 新聞來源統計（從實際抓到的新聞計算） */
function topSources(ctx: DeckContext, n = 6): Array<[string, number]> {
  const counts: Record<string, number> = {};
  (ctx.data?.articles || []).forEach((a: any) => {
    const src = String(a.source || '未標示').replace(/\s+/g, '');
    counts[src] = (counts[src] || 0) + 1;
  });
  return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, n);
}

const fmtSecs = (s?: number | null) => (typeof s === 'number' ? (s >= 60 ? `${Math.floor(s / 60)} 分 ${Math.round(s % 60)} 秒` : `${Math.round(s)} 秒`) : '—');

// ─────────────────────────── 投影片內容 ───────────────────────────
export const DECK: DeckSlide[] = [
  // ════════════ 第一部分　原文報告（40 分鐘） ════════════
  {
    quotes: ['abs-1', 'abs-3'],
    id: 'p1', section: 'paper', minutes: 2, title: '封面與報告架構',
    left: () => (
      <div className="space-y-3">
        <div className="text-[1.15em] font-bold leading-snug">{ORIGINAL_PAPER_SOURCE.titleEn}</div>
        <KV rows={[
          ['作者', 'Raman, Aljafari, Venkatesh & Richardson'],
          ['期刊', `${ORIGINAL_PAPER_SOURCE.journal}，${ORIGINAL_PAPER_SOURCE.volume}`],
          ['DOI', ORIGINAL_PAPER_SOURCE.doi],
        ]} />
      </div>
    ),
    right: (ctx) => (
      <div className="space-y-3">
        <div className="text-[1.15em] font-bold leading-snug">台股復刻：新聞情緒 × 財務指標 → 超額報酬</div>
        <KV rows={[
          ['資料來源', 'FinMind（新聞、股價、月營收、本益比／淨值比、市值）'],
          ['樣本', ctx.data ? `${stockList(ctx)}；${ctx.data.period.start}～${ctx.data.period.end}` : '尚未計算'],
          ['報告架構', '原文報告 40 分 → 台股復刻 60 分 → 復刻後比較 20 分'],
          ['報告人', '程瑋翔'],
        ]} />
      </div>
    ),
    notes: '開場說明今天的三段結構：先完整報告原論文，再報告我們用台股真實資料做的復刻，最後逐項比較兩者的異同。每一頁左邊是原著、右邊是台股復刻。',
  },
  {
    id: 'a1', section: 'paper', minutes: 3, title: '摘要精讀①：投資決策與多元資訊',
    left: () => <AbstractFull id="abs-1" focus={['投資人一向結合多元資訊做決策', '網路資訊與預測分析興起，投資人不再只看傳統財務指標']} />,
    right: (ctx) => ctx.data ? (
      <div className="space-y-2">
        <p>台股新聞來源（本研究實際抓到的新聞，取最近 {Math.min(3000, ctx.data.articles?.length || 0).toLocaleString()} 則統計）：</p>
        <MiniTable dense headers={['來源', '則數']} rows={topSources(ctx).map(([k, v]) => [k, v.toLocaleString()])} />
        <p className="text-[0.85em]">台灣投資人同樣面對多家媒體同時報導，正是本文「多元資訊來源」的情境。</p>
      </div>
    ) : <Pending what="新聞來源統計" />,
    notes: '逐句精讀摘要第一句：說明作者的出發點是「投資人結合多元資訊」。右邊用我們實際抓到的新聞來源，說明台股也有同樣的多元媒體環境。',
  },
  {
    id: 'a2', section: 'paper', minutes: 3, title: '摘要精讀②：研究缺口',
    left: () => <AbstractFull id="abs-2" focus={['既有研究：多種資訊來源彼此互補', '缺口：網路上持續出現、觸及更多投資人的文字內容，其作用尚未被檢驗']} />,
    right: () => <Bullets items={[
      '台股情境的缺口：中文財經新聞的情緒，是否同樣與財務指標互補？',
      '多數台股研究以社群論壇或單一指標為主，較少複製原著的「情緒 × 財務指標」交互作用設計',
      '本研究定位：以相同模型設定在台股重做一次，檢驗原著結論能否推廣到新興市場',
    ]} />,
    notes: '第二句點出研究缺口。右邊說明我們把同樣的缺口放到台股脈絡，定位為「可推廣性檢驗」。',
  },
  {
    id: 'a3', section: 'paper', minutes: 4, title: '摘要精讀③：資料與方法',
    left: () => <AbstractFull id="abs-3" focus={['資料：商業報刊（《華爾街日報》）＋財務總結指標', '結果變數：累積超額報酬', '方法：情緒分析＋機器學習＋計量經濟']} />,
    right: (ctx) => <KV rows={[
      ['新聞', ctx.data ? `FinMind 台股新聞 ${ctx.data.articleCount.toLocaleString()} 則` : 'FinMind 台股新聞（尚未計算）'],
      ['公司', ctx.data ? stockList(ctx) : '台灣 50 前 10 大權值股'],
      ['期間', ctx.data ? `${ctx.data.period.start}～${ctx.data.period.end}` : '最近 365 天'],
      ['結果變數', '新聞日後 5 日標準化超額報酬（相對 0050）'],
      ['方法', `情緒分析（${ctx.data?.sentimentEngine || 'Gemini Flash-Lite'}）＋ GEE ＋ 5 種機器學習`],
    ]} />,
    notes: '第三句說明資料與方法。右邊逐項對應我們的資料與方法，這也是第二部分的預告。',
  },
  {
    id: 'a4', section: 'paper', minutes: 4, title: '摘要精讀④：直接效果、交互效果與負面情緒',
    left: () => <AbstractFull id="abs-4" focus={['新聞文字與財務指標對超額報酬有直接效果與交互效果', '換用不同變數定義，結果仍一致（穩健性）', '負面情緒的影響大於正面情緒']} />,
    right: (ctx) => {
      const n = ourTerm(ctx, 'Negative'); const p = ourTerm(ctx, 'Positive');
      if (!n || !p) return <Pending what="直接效果" />;
      return <div className="space-y-2">
        <KV rows={[['Negative', n.display], ['Positive', p.display], ['負面效果', <VerdictChip v={verdictFor(ctx, 'Negative')} />]]} />
        <p className="text-[0.85em]">預告：台股的負面情緒比例係數為{n.coef >= 0 ? '正' : '負'}，{n.coef >= 0 ? '與原著「負面降低報酬」方向相反' : '與原著方向相同'}；詳見第二部分。</p>
      </div>;
    },
    notes: '第四句是全文主要發現。右邊先預告台股結果，第三部分再完整討論差異的原因。',
  },
  {
    id: 'a5', section: 'paper', minutes: 3, title: '摘要精讀⑤：量化指標高時，正面情緒效果減弱',
    left: () => <AbstractFull id="abs-5" focus={['先前量化指標（例如營收成長）高時，正面情緒的效果變弱', '貢獻：網路資訊持續出現下，對金融市場情緒分析實務的意義']} />,
    right: (ctx) => {
      const r = ourTerm(ctx, 'Sales_growth X Positive');
      if (!r) return <Pending what="Sales_growth × Positive" />;
      return <div className="space-y-2">
        <KV rows={[['Sales_growth X Positive', r.display], ['與原著比較', <VerdictChip v={verdictFor(ctx, 'Sales_growth X Positive')} />]]} />
        <p className="text-[0.85em]">{explain(r, '台股方向與原著相反', '台股也觀察到營收成長高時，正面新聞效果減弱')}</p>
      </div>;
    },
    notes: '第五句是本文最核心的機制。右邊直接呈現台股的對應結果，作為整場報告的主軸。',
  },
  {
    quotes: ['intro-12'],
    id: 'p3', section: 'paper', minutes: 2, title: '研究問題',
    left: () => <Bullets items={[
      'RQ1：新聞正面／負面情緒是否直接影響超額報酬？',
      'RQ2：情緒的效果是否會被財務指標（營收成長、本益比、淨值比）調節？',
      'RQ3：加入新聞情緒後，機器學習預測能力是否提升？',
    ]} />,
    right: () => <Bullets items={[
      'RQ1′：台股新聞情緒對 5 日標準化超額報酬 (SCAR) 的直接效果',
      'RQ2′：同樣 6 個交互作用項，以月營收年增率、本益比、淨值比衡量',
      'RQ3′：5 種模型比較「純財務」與「財務＋情緒」，並以「全猜多數類別」為基準',
    ]} />,
    notes: '三個研究問題一一對應，右邊說明我們在台股如何操作化每個問題。',
  },
  {
    quotes: ['theory-1', 'abs-5'],
    id: 'p4', section: 'paper', minutes: 3, title: '理論基礎與預期',
    left: () => <Bullets items={[
      '資訊處理觀點：新聞文字傳遞財務報表以外的訊息',
      '負面偏誤：負面消息對價格的影響大於正面消息',
      '預期效應：基本面已經很好時，正面新聞的邊際效果會變小（摘要指出：先前量化指標高時，正面情緒效果減弱）',
    ]} />,
    right: () => <Bullets items={[
      '預期 1：Negative 係數為負，且絕對值大於 Positive',
      '預期 2：Sales_growth × Positive 為負（營收成長高時，利多效果遞減）',
      '預期 3：加入情緒後，模型表現應高於純財務模型與基準準確率',
    ]} />,
    notes: '把原論文的理論轉成三個可在台股檢驗的預期，第三部分會逐一對照。',
  },
  {
    quotes: ['theory-10'],
    id: 'p5', section: 'paper', minutes: 3, title: '混合方法設計：表 4.2 定位與資料轉化流程',
    left: () => (
      <div className="space-y-4">
        <Table42Grid />
        <DesignFlow
          qual="《華爾街日報》新聞文本（約 2,500 篇）"
          convert="LM 金融詞典計數"
          quanFromQual="正／負面詞比例"
          quan="Compustat 財務指標＋股價報酬"
          merge="GEE 解釋 → 機器學習預測（同一組變數）"
          result="解釋與預測超額報酬 SCAR"
          tone="blue"
        />
      </div>
    ),
    right: () => (
      <div className="space-y-4">
        <DesignFlow
          qual="FinMind 台股新聞標題"
          convert="Gemini 判讀 −1～+1"
          quanFromQual="每日正／負面新聞比例"
          quan="股價、月營收、本益比／淨值比、市值"
          merge="GEE 解釋 → 5 種機器學習預測（同一組變數）"
          result="解釋與預測 5 日 SCAR（相對 0050）"
          tone="green"
        />
        <p className="text-[0.82em] leading-relaxed">
          兩邊都是「先把文字量化，再和財務數字合併分析」。虛線框是嚴格定義下 MMR 應有、但兩邊都<strong>沒有</strong>的質性詮釋軌——這正是本篇是否算 MMR 的爭議所在。
        </p>
      </div>
    ),
    notes: '左上用表 4.2 定位（原著沒有自己標示設計類型，這是我們的判讀）：同時期資料、兩股資料進同一組模型，最接近三角校正（收斂）設計的資料轉化變體。原著流程是三階段：選變數 → GEE 解釋 → 機器學習預測。下方流程圖說明文字如何變成數字。右邊台股流程完全對應；虛線框指出兩邊都缺少質性詮釋軌。',
  },
  {
    quotes: ['abs-3', 'intro-18'],
    id: 'p6', section: 'paper', minutes: 2, title: '資料與樣本',
    left: () => <KV rows={[
      ['公司', 'S&P 500 成分股'],
      ['新聞', '《華爾街日報》2013–2016 年相關報導'],
      ['財務', 'Compustat 年度資料（表 1）'],
      ['報酬', '標準化累積超額報酬 SCAR'],
    ]} />,
    right: (ctx) => <KV rows={[
      ['公司', ctx.data ? stockList(ctx) : '預設：台灣 50 市值前 10 大'],
      ['新聞', ctx.data ? `${ctx.data.articleCount.toLocaleString()} 則（${ctx.data.period.start}～${ctx.data.period.end}，每檔每天最多 ${ctx.data.maxPerDay} 則）` : '尚未計算'],
      ['財務', '月營收（年增率）、每日本益比／淨值比、市值'],
      ['報酬', '新聞日後 5 個交易日、相對 0050 的標準化超額報酬'],
    ]} />,
    notes: '比較兩邊的資料來源。重點：原著用年度財報，我們用月營收與每日估值，時間頻率不同，第三部分會討論這個差異的影響。',
  },
  {
    quotes: ['methods-7'],
    id: 'p7', section: 'paper', minutes: 3, title: '變數定義',
    left: () => <MiniTable dense headers={['變數', '原著定義']} rows={[
      ['SCAR', '標準化累積超額報酬'],
      ['Positive / Negative', 'LM 詞典正面／負面詞比例'],
      ['Sales_growth', '年度營收年增率'],
      ['PE_ratio', '市值 ÷ 淨利'],
      ['MB_ratio', '市值 ÷ 股東權益'],
      ['Size', '公司規模（市值）'],
      ['Prior_SCAR', '前期超額報酬'],
    ]} />,
    right: () => <MiniTable dense headers={['變數', '台股操作化']} rows={[
      ['SCAR', '5 日超額報酬 ÷（60 日波動度 × √5）'],
      ['Positive / Negative', '當日正面／負面新聞則數比例'],
      ['Sales_growth', '最近已公布月營收的年增率'],
      ['PE_ratio', 'FinMind 每日本益比'],
      ['MB_ratio', 'FinMind 每日股價淨值比'],
      ['Size', '市值取對數'],
      ['Prior_SCAR', '新聞日前 5 日標準化超額報酬'],
    ]} />,
    notes: '逐一對照變數。誠實說明我們的情緒是「新聞則數比例」，原著是「詞彙比例」，這是重要的方法差異。',
  },
  {
    quotes: ['methods-10', 'methods-13'],
    id: 'p8', section: 'paper', minutes: 2, title: '情緒分析方法',
    left: () => <Bullets items={[
      'Loughran–McDonald 金融情緒詞典',
      '計算每篇文章正面詞、負面詞占總詞數的比例',
      '詞典法的優點：透明、可重現；缺點：無法理解上下文',
    ]} />,
    right: (ctx) => <Bullets items={[
      `判讀引擎：${ctx.data?.sentimentEngine || 'Gemini Flash-Lite（無金鑰時用中文關鍵詞）'}`,
      '每則標題給 −1 到 1 的分數，> 0.15 視為正面、< −0.15 視為負面',
      '中文沒有對應的 LM 詞典，因此以語言模型判讀；報告時應說明這會帶來的差異',
    ]} />,
    notes: '說明為何不能直接套用英文 LM 詞典，以及我們的替代做法與其限制。',
  },
  {
    quotes: ['methods-15'],
    id: 'p9', section: 'paper', minutes: 2, title: '計量模型：GEE',
    left: () => <Bullets items={[
      '廣義估計方程式（GEE），處理同一公司跨期觀測值的相關性',
      '比較三種工作相關結構：Independent、AR(1)、Exchangeable',
      '交互作用項的變數先做平均數中心化',
      '模型配適以 QIC 比較',
    ]} />,
    right: () => <Bullets items={[
      '相同的 GEE 設定：以個股為群組、依交易日排序',
      '同樣比較 Independent、AR(1)、Exchangeable 三種結構',
      '同樣先中心化再建交互作用項；本益比等變數截尾 1% / 99%',
      '以 Python statsmodels 估計，程式碼公開於 repo（news_ml_study.py）',
    ]} />,
    notes: '強調我們刻意保持模型設定與原著一致，差異只來自資料與變數操作化。',
  },
  {
    quotes: ['abs-4', 'results-5'],
    id: 'p10', section: 'paper', minutes: 2, title: '原著主要結果（表 2）',
    left: () => (
      <div className="space-y-2">
        <PaperCoefTable terms={['Positive', 'Negative', 'Sales_growth', 'Sales_growth X Positive', 'Sales_growth X Negative', 'MB_ratio X Negative']} />
        <SourceNote />
      </div>
    ),
    right: () => <Bullets items={[
      '台股的同一張表在第二部分逐列報告',
      '屆時會逐列放在原著旁邊，並標示「一致／方向相同但不顯著／相反」',
    ]} />,
    notes: '解讀原著表 2：負面情緒顯著降低超額報酬；營收成長與正面情緒的交互作用顯著為負，也就是基本面已好時，利多新聞的效果遞減。',
  },
  {
    quotes: ['results-14'],
    id: 'p11', section: 'paper', minutes: 2, title: '原著機器學習結果與結論',
    left: () => (
      <div className="space-y-2">
        <MiniTable dense headers={['演算法', '純量化', '加入情緒']} rows={(T78?.rows || []).slice(0, 4).map((r) => [String(r[0]).replace(/ \(.*\)/, ''), String(r[1]), String(r[2]).replace(/💥.*$/, '').trim()])} />
        <p className="text-[0.85em]">結論：文字情緒能補充財務指標；負面情緒的影響大於正面情緒。</p>
      </div>
    ),
    right: () => <Bullets items={[
      '提醒：準確率接近 100% 在股價預測中極不尋常，報告時宜保留態度',
      '我們採「依時間切分」：前 70% 日期訓練、後 30% 測試，並留 5 日間隔避免資訊洩漏',
      '另報告「全猜多數類別」的基準準確率，判斷模型是否真的有用',
    ]} />,
    notes: '總結原著結論，同時提出我們對超高準確率的保留，並說明我們用更保守的驗證方式。',
  },

  // ════════════ 第二部分　台股復刻（60 分鐘） ════════════
  {
    quotes: ['abs-4', 'abs-5'],
    id: 'r1', section: 'replication', minutes: 3, title: '復刻目標與原則',
    left: () => <Bullets items={[
      '原著主張一：負面情緒顯著降低超額報酬',
      '原著主張二：營收成長高時，正面情緒效果遞減',
      '原著主張三：加入情緒能提升預測',
    ]} />,
    right: () => <Bullets items={[
      '全部使用 FinMind 真實資料，程式與結果檔公開可重現',
      '不使用任何未來資訊（月營收依公布時間、新聞對應下一個交易日）',
      '不論顯著與否，所有結果都完整報告',
    ]} />,
    notes: '第二部分開場：說明我們要檢驗哪些主張，以及確保真實性的三個原則。',
  },
  {
    quotes: ['methods-8', 'methods-9'],
    id: 'r0', section: 'replication', minutes: 4, title: '資料蒐集流程與執行紀錄',
    left: () => <Bullets items={['以 Python 程式擷取《華爾街日報》新聞', '以 R 進行文字探勘與 LM 詞典情緒計分', '財務資料取自 Compustat、報酬取自 Eventus']} />,
    right: (ctx) => {
      const rl = ctx.data?.runLog;
      const hist = ctx.history || [];
      const first = hist[0];
      return <div className="space-y-3">
        <ol className="list-decimal pl-5 space-y-1 text-[0.92em]">
          <li>FinMind 新聞逐日查詢：{ctx.data ? `${ctx.data.stocks.length} 檔 × ${Math.round((Date.parse(ctx.data.period.end) - Date.parse(ctx.data.period.start)) / 864e5) + 1} 天` : '10 檔 × 365 天'}（每次只回傳一檔一天，約 3,650 次查詢；每檔每天最多採用 {ctx.data?.maxPerDay ?? 8} 則）</li>
          <li>另查詢股價、月營收、本益比／淨值比、市值（各檔各 1 次，含 0050 基準）</li>
          <li>Gemini Flash-Lite 判讀標題情緒（每次 80 則）</li>
          <li>對齊交易日、建立面板 → GEE（表 2）→ 機器學習（表 7–8）</li>
          <li>GitHub Actions 自動執行、寫回結果並上架；每個交易日 22:10 更新</li>
        </ol>
        {first && <KV rows={[
          ['首次完整抓取', `${String(first.startedAt).replace('T', ' ').slice(0, 16)}，耗時 ${fmtSecs(first.totalSeconds)}`],
          ['FinMind 方案', 'Sponsor（每小時 6,000 次查詢）'],
          ['取得資料', `${(first.articles ?? 0).toLocaleString()} 則新聞、${(first.samples ?? 0).toLocaleString()} 筆個股 × 交易日樣本`],
        ]} />}
        {rl && <p className="text-[0.82em]">最近一次更新：{String(rl.startedAt).replace('T', ' ').slice(0, 16)}，耗時 {fmtSecs(rl.totalSeconds)}；FinMind 新查詢 {rl.finmindQueries?.new ?? '—'} 次、沿用快取 {rl.finmindQueries?.fromCache ?? '—'} 次；Gemini 呼叫 {rl.geminiCalls ?? '—'} 次。</p>}
        {(rl?.runUrl || first?.runUrl) && <p className="text-[0.8em] break-all">執行紀錄：<a className="underline" href={rl?.runUrl || first?.runUrl} target="_blank" rel="noreferrer">{rl?.runUrl || first?.runUrl}</a></p>}
      </div>;
    },
    notes: '說明資料是怎麼來的：查詢次數、方案額度、實際耗時，以及每天自動更新的機制。口委若質疑資料真實性，可直接點開 GitHub Actions 的執行紀錄。',
  },
  {
    quotes: ['intro-18'],
    id: 'r2', section: 'replication', minutes: 3, title: '樣本股票',
    left: () => <KV rows={[['樣本', 'S&P 500 成分股（大型權值股）'], ['期間', '2013–2016']]} />,
    right: (ctx) => ctx.data ? (
      <MiniTable dense headers={['股票', '新聞則數', '平均情緒']} rows={(ctx.data.stocks || []).map((s: any) => [`${s.name} ${s.id}`, (s.articles ?? 0).toLocaleString(), num(s.meanSentiment, 2)])} />
    ) : <Pending what="樣本股票統計" />,
    notes: '介紹樣本股票與每檔新聞量。新聞量差異很大時，要提醒觀眾結果可能由新聞量大的公司主導。',
  },
  {
    quotes: ['methods-8'],
    id: 'r3', section: 'replication', minutes: 4, title: '新聞語料概況',
    left: () => <KV rows={[['來源', '《華爾街日報》'], ['單位', '文章全文'], ['情緒', 'LM 詞比例']]} />,
    right: (ctx) => ctx.data ? <div className="space-y-3"><KV rows={[
      ['新聞總數', `${ctx.data.articleCount.toLocaleString()} 則`],
      ['期間', `${ctx.data.period.start}～${ctx.data.period.end}`],
      ['正面占比', pct(ctx.data.sentimentShare?.positive)],
      ['負面占比', pct(ctx.data.sentimentShare?.negative)],
      ['判讀引擎', ctx.data.sentimentEngine],
      ['計算時間', String(ctx.data.generatedAt || '').replace('T', ' ')],
    ]} /><NewsDownload data={ctx.data} /></div> : <Pending what="新聞語料統計" />,
    notes: '報告語料規模與正負面比例。若正面遠多於負面，可呼應原著「負面新聞較稀少但影響較大」的論點。',
  },
  {
    quotes: ['methods-11'],
    id: 'r4', section: 'replication', minutes: 4, title: '情緒判讀實例',
    left: () => <p>原著以詞典計算詞比例，論文中未逐篇列出分類結果。</p>,
    right: (ctx) => {
      const arts: any[] = ctx.data?.articles || [];
      if (!arts.length) return <Pending what="新聞實例" />;
      const pos = arts.filter((a) => a.score > 0.15).slice(0, 4);
      const neg = arts.filter((a) => a.score < -0.15).slice(0, 4);
      return (
        <MiniTable dense headers={['日期', '標題', '分數']} rows={[...pos, ...neg].map((a) => [
          a.date, <span className="font-sans whitespace-normal">{a.title}</span>, num(a.score, 2),
        ])} />
      );
    },
    notes: '展示真實新聞標題與判讀分數，讓口委看到資料是真實的，也可以討論判讀錯誤的例子。',
  },
  {
    quotes: ['methods-3'],
    id: 'r5', section: 'replication', minutes: 3, title: '財務變數敘述統計',
    left: () => <p>原著財務變數來自 Compustat 年度資料（見表 1 定義）。</p>,
    right: (ctx) => {
      const d = gee(ctx)?.descriptives;
      if (!d) return <Pending what="敘述統計" />;
      return (
        <div className="space-y-2">
          <MiniTable dense headers={['變數', '平均數', '標準差']} rows={Object.entries(d).map(([k, v]: any) => [k, num(v.mean), num(v.sd)])} />
          {ctx.data?.missingDatasets?.length > 0 && <p className="text-[0.8em]">⚠️ 未取得：{ctx.data.missingDatasets.join('、')}</p>}
        </div>
      );
    },
    notes: '報告各變數的平均與標準差，並說明是否有資料集抓不到而被排除。',
  },
  {
    quotes: ['theory-14'],
    id: 'r6', section: 'replication', minutes: 3, title: 'SCAR 的建構',
    left: () => <Bullets items={['異常報酬資料來自 Eventus（原文未說明預期報酬模型）', '累積後再標準化（SCAR）', '衡量新聞事件後的股價反應']} />,
    right: (ctx) => <Bullets items={[
      '每日超額報酬 = 個股報酬 − 0050 報酬',
      'SCAR = 新聞日後 5 日累積超額報酬 ÷（前 60 日超額報酬標準差 × √5）',
      ctx.data?.gee ? `SCAR 平均 ${num(ctx.data.gee.descriptives?.SCAR?.mean)}、標準差 ${num(ctx.data.gee.descriptives?.SCAR?.sd)}` : '敘述統計：尚未計算',
    ]} />,
    notes: '說明我們以 0050 作為市場基準，並用個股自身波動度標準化，概念上對應原著的 SCAR。',
  },
  {
    quotes: ['methods-18', 'methods-22'],
    id: 'r7', section: 'replication', minutes: 3, title: '避免前視偏誤',
    left: () => <p>原著使用年度財務資料與事件後報酬，時間順序清楚。</p>,
    right: () => <Bullets items={[
      '月營收：第 m 月營收視為次月 10 日後才可用',
      '新聞：對應到「當天或之後的第一個交易日」',
      '機器學習：依時間切分，訓練與測試間留 5 個交易日間隔',
    ]} />,
    notes: '這頁是真實性的關鍵：說明每個變數都只使用當時已公開的資訊。',
  },
  {
    quotes: ['results-2'],
    id: 'r8', section: 'replication', minutes: 3, title: 'GEE 估計設定',
    left: () => <KV rows={[['模型', 'GEE，三種相關結構'], ['配適', 'QIC']]} />,
    right: (ctx) => {
      const g = gee(ctx);
      if (!g) return <Pending what="GEE 設定與樣本" />;
      return <KV rows={[
        ['觀測值', `${g.n.toLocaleString()} 筆（個股 × 有新聞的交易日）`],
        ['公司數', `${g.firms} 檔`],
        ['期間', `${g.period.start}～${g.period.end}`],
        ['依變數', g.dv],
        ['排除變數', g.droppedTerms?.length ? g.droppedTerms.join('、') : '無'],
      ]} />;
    },
    notes: '報告 GEE 的實際樣本數與期間；若有變數因資料不足被排除，要在這裡說清楚。',
  },
  {
    quotes: ['results-4'],
    id: 'r9', section: 'replication', minutes: 4, title: 'GEE 主效果',
    left: () => <div className="space-y-2"><PaperCoefTable terms={['Prior_SCAR', 'Size', 'Positive', 'Negative', 'PE_ratio', 'Sales_growth', 'MB_ratio']} /><SourceNote /></div>,
    right: (ctx) => <OurCoefTable ctx={ctx} terms={['Prior_SCAR', 'Size', 'Positive', 'Negative', 'PE_ratio', 'Sales_growth', 'MB_ratio']} />,
    notes: '逐列比較主效果。注意兩邊的情緒變數單位不同（詞比例 vs 新聞則數比例），係數大小不能直接比，應比較方向與顯著性。',
  },
  {
    quotes: ['results-5'],
    id: 'r10', section: 'replication', minutes: 4, title: '關鍵交互作用：營收成長 × 正面情緒',
    left: () => <div className="space-y-2">
      <KV rows={[['Sales_growth X Positive', paperCell('Sales_growth X Positive')]]} />
      <p>營收成長高時，正面新聞帶來的超額報酬變小。</p>
      <SourceNote />
    </div>,
    right: (ctx) => {
      const r = ourTerm(ctx, 'Sales_growth X Positive');
      if (!r) return <Pending what="Sales_growth × Positive" />;
      return <div className="space-y-2">
        <KV rows={[['Sales_growth X Positive', r.display], ['p 值', num(r.p)], ['與原著比較', <VerdictChip v={verdictFor(ctx, 'Sales_growth X Positive')} />]]} />
        <p>{explain(r, '台股中營收成長越高，正面新聞的效果反而越大（與原著方向相反）', '台股中營收成長越高，正面新聞的效果越小（與原著方向相同）')}</p>
      </div>;
    },
    notes: '這是原著最重要的發現。依右邊結果說明台股是否也有「正面情緒效果遞減」的現象。',
  },
  {
    quotes: ['results-7', 'results-8'],
    id: 'r11', section: 'replication', minutes: 3, title: '其他交互作用項',
    left: () => <div className="space-y-2"><PaperCoefTable terms={['PE_ratio X Positive', 'MB_ratio X Positive', 'PE_ratio X Negative', 'Sales_growth X Negative', 'MB_ratio X Negative']} /><SourceNote /></div>,
    right: (ctx) => <OurCoefTable ctx={ctx} terms={['PE_ratio X Positive', 'MB_ratio X Positive', 'PE_ratio X Negative', 'Sales_growth X Negative', 'MB_ratio X Negative']} />,
    notes: '比較其餘五個交互作用項，指出哪些與原著方向一致、哪些不一致。',
  },
  {
    quotes: ['results-2'],
    id: 'r12', section: 'replication', minutes: 3, title: '三種相關結構的穩健性',
    left: () => <p>原著三個模型的係數幾乎相同（例如 Sales_growth X Positive：{paperCell('Sales_growth X Positive', 1)}／{paperCell('Sales_growth X Positive', 2)}／{paperCell('Sales_growth X Positive', 3)}）。</p>,
    right: (ctx) => {
      const g = gee(ctx);
      if (!g) return <Pending what="穩健性比較" />;
      const keys = ['independence', 'ar1', 'exchangeable'].filter((k) => g.models[k]);
      const terms = ['Positive', 'Negative', 'Sales_growth X Positive', 'Sales_growth X Negative'];
      return <MiniTable dense headers={['變數', ...keys.map((k) => g.models[k].label.replace(/^Model \d \(|\)$/g, ''))]} rows={[
        ...terms.map((t) => [t, ...keys.map((k) => g.models[k].rows.find((r: any) => r.term === t)?.display || '—')]),
        ['QIC', ...keys.map((k) => num(g.models[k].qic, 1))],
      ]} />;
    },
    notes: '若三種結構的結果一致，表示結論不受相關結構假設影響；若 AR(1) 無法估計，會在表中顯示空白。',
  },
  {
    quotes: ['methods-17', 'methods-18'],
    id: 'r13', section: 'replication', minutes: 3, title: '機器學習設定',
    left: () => <Bullets items={['8 種二元分類演算法', '比較純量化與量化＋文字兩組特徵', '指標：準確率與 AUC']} />,
    right: (ctx) => <KV rows={[
      ['模型', '梯度提升樹、隨機森林、邏輯迴歸、神經網路、SVM'],
      ['純財務特徵', ctx.data?.features?.quant?.join('、') || '尚未計算'],
      ['情緒特徵', ctx.data?.features?.sentiment?.join('、') || '尚未計算'],
      ['切分', ctx.data?.split ? `訓練 ${ctx.data.split.trainN} 筆（至 ${ctx.data.split.trainEnd}）／測試 ${ctx.data.split.testN} 筆（${ctx.data.split.testStart} 起）` : '尚未計算'],
      ['預測目標', ctx.data?.target || 'SCAR 是否為正'],
    ]} />,
    notes: '說明特徵與資料切分方式，強調測試期完全在訓練期之後。',
  },
  {
    quotes: ['results-14'],
    id: 'r14', section: 'replication', minutes: 4, title: '機器學習結果',
    left: () => <MiniTable dense headers={['演算法', '準確率', 'AUC']} rows={(T78?.rows || []).slice(0, 5).map((r) => [String(r[0]).replace(/ \(.*\)/, ''), `${r[1]} → ${String(r[2]).replace(/💥.*$/, '').trim()}`, `${r[3]} → ${String(r[4]).replace(/💥.*$/, '').trim()}`])} />,
    right: (ctx) => ctx.data?.rows ? <MiniTable dense headers={['演算法', '準確率', 'AUC']} rows={ctx.data.rows.map((r: any) => [r.algorithm.replace(/ \(.*\)/, ''), `${r.quantOnlyAcc} → ${r.quantTextAcc}`, `${r.quantOnlyAuc} → ${r.quantTextAuc}`])} /> : <Pending what="機器學習結果" />,
    notes: '箭頭左邊是純財務、右邊是加入情緒。逐一說明哪些模型因加入情緒而改善。',
  },
  {
    quotes: ['results-14'],
    id: 'r15', section: 'replication', minutes: 3, title: '模型是否優於基準',
    left: () => <p>原著未報告「全猜多數類別」的基準準確率。</p>,
    right: (ctx) => {
      if (!ctx.data?.rows) return <Pending what="基準比較" />;
      const base = parseFloat(ctx.data.split.baselineAcc);
      const best = ctx.data.rows.reduce((a: any, r: any) => (r.raw.textAcc > a.raw.textAcc ? r : a));
      const gap = best.raw.textAcc * 100 - base;
      const auc = best.raw.textAuc * 100;
      return <Bullets items={[
        `基準準確率（全部猜多數類別）：${ctx.data.split.baselineAcc}`,
        `加入情緒後最佳模型：${best.algorithm.replace(/ \(.*\)/, '')}，準確率 ${best.quantTextAcc}、AUC ${best.quantTextAuc}`,
        gap >= 2 ? `最佳模型高於基準 ${gap.toFixed(1)} 個百分點，仍需檢驗是否穩定`
          : gap > 0 ? `最佳模型僅比基準高 ${gap.toFixed(1)} 個百分點，實質預測力有限`
          : '最佳模型未高於基準：以現有特徵，新聞情緒對短期報酬的預測力有限',
        auc < 55 ? `AUC ${auc.toFixed(1)}% 接近 50%，幾乎沒有區辨力` : auc < 60 ? `AUC ${auc.toFixed(1)}%，區辨力偏弱` : `AUC ${auc.toFixed(1)}%，具一定區辨力`,
      ]} />;
    },
    notes: '這頁回答「模型到底有沒有用」。若沒有贏過基準，這本身就是重要且誠實的發現。',
  },
  {
    quotes: ['disc-2'],
    id: 'r16', section: 'replication', minutes: 3, title: '個股差異',
    left: () => <p>原著以大樣本面板估計平均效果，未逐家公司報告。</p>,
    right: (ctx) => ctx.data?.stocks ? (
      <div className="space-y-1.5">
        {[...ctx.data.stocks].sort((a: any, b: any) => (b.articles || 0) - (a.articles || 0)).map((s: any) => {
          const max = Math.max(...ctx.data.stocks.map((x: any) => x.articles || 0), 1);
          return (
            <div key={s.id} className="grid grid-cols-[6.5rem_1fr_3.5rem] items-center gap-2 text-[0.85em]">
              <span>{s.name} {s.id}</span>
              <div className="h-2.5 rounded-full bg-emerald-100 overflow-hidden"><div className="h-full bg-emerald-600" style={{ width: `${((s.articles || 0) / max) * 100}%` }} /></div>
              <span className="font-mono text-right">{(s.articles || 0).toLocaleString()}</span>
            </div>
          );
        })}
      </div>
    ) : <Pending what="個股新聞量" />,
    notes: '新聞量集中在少數權值股，討論這對估計結果的可能影響。',
  },
  {
    quotes: ['disc-8'],
    id: 'r17', section: 'replication', minutes: 3, title: '復刻的限制',
    left: () => <Bullets items={['原著的限制：單一新聞來源（WSJ）、美國市場、2013–2016 年']} />,
    right: () => <Bullets items={[
      '情緒以「新聞標題」判讀，非全文；以則數比例代替詞比例',
      'SCAR 為 5 日短窗，原著為較長期的事件窗',
      '月營收年增率代替年度營收成長，頻率不同',
      '5 日視窗互相重疊，殘差可能自我相關（GEE 可部分處理）',
      '樣本期間約一年，結論可能受當期市場狀態影響',
    ]} />,
    notes: '主動說明限制，讓口委知道哪些差異來自方法而不一定是市場不同。',
  },

  // ════════════ 第三部分　復刻後比較（20 分鐘） ════════════
  {
    quotes: ['abs-4'],
    id: 'c1', section: 'compare', minutes: 4, title: '比較總表',
    left: () => <MiniTable dense headers={['檢驗項目', '原著結果']} rows={[
      ['Negative 主效果', paperCell('Negative')],
      ['Positive 主效果', paperCell('Positive')],
      ['Sales_growth X Positive', paperCell('Sales_growth X Positive')],
      ['Sales_growth X Negative', paperCell('Sales_growth X Negative')],
      ['MB_ratio X Negative', paperCell('MB_ratio X Negative')],
    ]} />,
    right: (ctx) => gee(ctx) ? <MiniTable dense headers={['台股結果', '比較']} rows={['Negative', 'Positive', 'Sales_growth X Positive', 'Sales_growth X Negative', 'MB_ratio X Negative'].map((t) => [
      ourTerm(ctx, t)?.display || '—', <VerdictChip v={verdictFor(ctx, t)} />,
    ])} /> : <Pending what="比較總表" />,
    notes: '用一張表總結：左右同一列對照，右邊的標籤由係數方向與顯著性自動判定。',
  },
  {
    quotes: ['abs-4'],
    id: 'c2', section: 'compare', minutes: 3, title: '負面情緒是否影響較大？',
    left: () => <p>原著：Negative {paperCell('Negative')}，Positive {paperCell('Positive')}；摘要指出負面情緒的影響大於正面情緒。</p>,
    right: (ctx) => {
      const n = ourTerm(ctx, 'Negative'); const p = ourTerm(ctx, 'Positive');
      if (!n || !p) return <Pending what="正負面效果比較" />;
      const stronger = Math.abs(n.coef) > Math.abs(p.coef);
      return <Bullets items={[
        `Negative ${n.display}；Positive ${p.display}`,
        stronger ? '台股負面情緒係數的絕對值較大，方向上支持負面偏誤' : '台股正面情緒係數的絕對值較大，未支持負面偏誤',
        n.p < 0.05 ? '負面情緒效果達顯著' : '負面情緒效果未達顯著，結論需保留',
      ]} />;
    },
    notes: '比較正負面情緒的相對大小，回應原著「負面影響較大」的主張。',
  },
  {
    quotes: ['abs-5'],
    id: 'c3', section: 'compare', minutes: 3, title: '正面情緒效果遞減是否存在？',
    left: () => <p>原著：Sales_growth X Positive = {paperCell('Sales_growth X Positive')}，營收成長高時正面新聞效果減弱。</p>,
    right: (ctx) => {
      const r = ourTerm(ctx, 'Sales_growth X Positive');
      if (!r) return <Pending what="正面情緒效果遞減" />;
      return <div className="space-y-2">
        <div>判定：<VerdictChip v={verdictFor(ctx, 'Sales_growth X Positive')} /></div>
        <p>{explain(r, '台股方向與原著相反', '台股方向與原著相同')}</p>
      </div>;
    },
    notes: '聚焦原著最核心的發現，說明台股證據支持、部分支持或不支持。',
  },
  {
    quotes: ['results-12'],
    id: 'c4', section: 'compare', minutes: 3, title: '新聞情緒的預測增益',
    left: () => <p>原著：加入情緒後各模型準確率與 AUC 均大幅提升（例如提升決策樹 {String(T78?.rows?.[0]?.[1] ?? '')} → {String(T78?.rows?.[0]?.[2] ?? '').replace(/💥.*$/, '').trim()}）。</p>,
    right: (ctx) => {
      if (!ctx.data?.rows) return <Pending what="預測增益" />;
      const gains = ctx.data.rows.map((r: any) => (r.raw.textAcc - r.raw.quantAcc) * 100);
      const avg = gains.reduce((a: number, b: number) => a + b, 0) / gains.length;
      return <Bullets items={[
        `5 個模型加入情緒後，準確率平均變化 ${avg >= 0 ? '+' : ''}${avg.toFixed(1)} 個百分點`,
        `基準準確率 ${ctx.data.split.baselineAcc}`,
        avg > 2 ? '情緒帶來可觀察的增益，但幅度遠小於原著' : '增益很小或沒有，與原著的大幅提升不同',
      ]} />;
    },
    notes: '比較預測增益的幅度，並討論為何原著的提升遠大於我們（資料洩漏的可能、市場差異、樣本規模）。',
  },
  {
    quotes: ['disc-7'],
    id: 'c5', section: 'compare', minutes: 4, title: '差異來源與混合方法元推論',
    left: () => <Bullets items={[
      '原著元推論：質性文字補足財務數字無法反映的資訊',
      '量化面板確認規律；文字情緒解釋規律中的例外',
    ]} />,
    right: () => <Bullets items={[
      '市場差異：台股散戶比重高、新聞量集中於少數權值股',
      '資料差異：中文標題 vs 英文全文；月營收 vs 年度財報',
      '方法差異：語言模型判讀 vs 詞典；5 日 vs 較長事件窗',
      '元推論：若結果不一致，代表原著的機制可能依賴市場與資料情境，而非普遍成立',
    ]} />,
    notes: '用混合方法的元推論角度整合：不只說結果一不一致，而是說明為什麼，以及這對理論的意義。',
  },
  {
    quotes: ['abs-5'],
    id: 'c6', section: 'compare', minutes: 3, title: '結論與 Q&A',
    left: () => <Bullets items={[
      '原著貢獻：示範如何在分析時代做混合方法研究',
      '證明新聞情緒與財務指標有直接與交互效果',
    ]} />,
    right: (ctx) => <Bullets items={[
      '貢獻：以完全可重現的真實台股資料檢驗原著主張',
      ctx.data?.gee ? `核心發現：Sales_growth × Positive 在台股「${verdictFor(ctx, 'Sales_growth X Positive')}」` : '核心發現：待計算後填入',
      '未來研究：拉長期間、改用全文、加入法人籌碼與社群情緒',
    ]} />,
    notes: '總結雙方貢獻，開放提問。準備好回答：情緒判讀可靠度、樣本選擇、為何結果與原著不同。',
  },
];

export const DECK_TOTAL_MINUTES = DECK.reduce((a, s) => a + s.minutes, 0);
