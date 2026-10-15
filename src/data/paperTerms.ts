// =====================================================================
// 本篇專有名詞對照：翻譯與解說時優先使用的譯名（伺服器在呼叫 Gemini 前附上）
// 來源：termVocab（段落名詞小辭典）＋ 本篇變數名稱（大小寫須相符才算變數）
// =====================================================================
import { findTerms } from './termVocab.ts';

/** 本篇的變數名稱：以原文寫法（大小寫、底線）出現時，一律當作變數 */
export const PAPER_VARS: Array<{ name: string; zh: string; def: string }> = [
  { name: 'Positive', zh: '正面情緒（比例）', def: '原著：一篇報導中正面詞佔總字數的比例（Loughran–McDonald 詞典）；台股復刻：當天新聞中判讀為正面的則數比例。不是「實證的」「積極的」。' },
  { name: 'Negative', zh: '負面情緒（比例）', def: '原著：一篇報導中負面詞佔總字數的比例；台股復刻：當天新聞中判讀為負面的則數比例。' },
  { name: 'Sales_growth', zh: '營收成長率', def: '本期營收相對去年同期的成長率；台股用月營收年增率。' },
  { name: 'PE_ratio', zh: '本益比', def: '股價 ÷ 每股盈餘。' },
  { name: 'MB_ratio', zh: '股價淨值比（市值淨值比）', def: '市值 ÷ 帳面價值。' },
  { name: 'Size', zh: '公司規模', def: '以市值衡量（取對數）。' },
  { name: 'Prior_SCAR', zh: '前期 SCAR', def: '控制先前漲跌的變數。原著：前一年的 SCAR；台股復刻：新聞前 5 個交易日的 SCAR。' },
  { name: 'SCAR', zh: '標準化累積超額報酬', def: '本篇的結果變數：新聞後一段期間比大盤多漲或少漲的幅度，除以平常的波動。' },
];

const escRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** 找出文字中出現的本篇專有名詞，回傳給 Gemini 的對照區塊；exact 表示選取文字本身就是某個名詞 */
export function paperTermNote(text: string): { note: string; exact: string | null } {
  if (!text) return { note: '', exact: null };
  const lines: string[] = [];
  const seen = new Set<string>();
  const sel = text.trim().replace(/^["'“”‘’]+|["'“”‘’.,;:]+$/g, '').trim();
  let exact: string | null = null;

  for (const v of PAPER_VARS) {
    // 大小寫須相符；Sales_growth X Positive 這類交互作用項也會比到
    if (new RegExp(`(^|[^A-Za-z_])${escRe(v.name)}(?=$|[^A-Za-z_])`).test(text)) {
      lines.push(`- ${v.name} → ${v.zh}：${v.def}`);
      seen.add(v.name.toLowerCase());
      if (sel === v.name) exact = `**${v.name}** 在本篇是變數名稱，譯為「${v.zh}」。${v.def}`;
    }
  }
  if (/\bX\b/.test(text) && /(Positive|Negative)/.test(text)) {
    lines.push('- A X B（例如 Sales_growth X Positive）→ 交互作用項，譯為「A × B」，意思是 A 的效果是否因 B 而不同。');
  }
  for (const t of findTerms(text, 20)) {
    const key = t.en.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    lines.push(`- ${t.en} → ${t.zh}：${t.x}`);
    if (!exact && sel.toLowerCase() === key) exact = `**${t.en}** 在本篇譯為「${t.zh}」。${t.x}`;
  }
  if (!lines.length) return { note: '', exact };
  const note = `【本篇專有名詞對照】翻譯與解說時，以下名詞必須優先使用這裡的譯名與定義；一般字義只能放在後面並標明「一般字義」。
大寫開頭、與變數同名的 Positive、Negative 等視為變數；句中一般形容詞 positive／negative（例如 positive effect）依上下文譯為「正向／負向」。
${lines.join('\n')}`;
  return { note, exact };
}
