// =====================================================================
// 框選文字是否為內建專有名詞：是的話直接用內建辭典解釋，不呼叫 Gemini（不需主帳號）
// 比對順序：名詞辭典（GLOSSARY_PLUS）→ 本篇變數 → 段落名詞小辭典（TERMS）
// =====================================================================
import { GLOSSARY_PLUS } from './glossaryPlus.ts';
import { TERMS, type Term } from './termVocab.ts';
import { PAPER_VARS } from './paperTerms.ts';

export type BuiltinHit =
  | { kind: 'gloss'; key: string; label: string }
  | { kind: 'vocab'; term: Term; label: string };

const VAR_TO_GLOSS: Record<string, string> = { Positive: 'Sentiment', Negative: 'Sentiment' };

/** 名詞名稱表：[比對用字串, 命中結果]；英文不分大小寫，變數名稱需大小寫相符 */
function names(): Array<{ s: string; cs: boolean; hit: BuiltinHit }> {
  const out: Array<{ s: string; cs: boolean; hit: BuiltinHit }> = [];
  for (const [key, g] of Object.entries(GLOSSARY_PLUS)) {
    const hit: BuiltinHit = { kind: 'gloss', key, label: key };
    out.push({ s: key, cs: false, hit }, { s: g.en, cs: false, hit });
    for (const z of g.zh.split(/[（）()／/、]/).map((x) => x.trim()).filter((x) => x.length >= 2)) out.push({ s: z, cs: false, hit });
  }
  for (const v of PAPER_VARS) {
    const key = VAR_TO_GLOSS[v.name] || (GLOSSARY_PLUS[v.name] ? v.name : null);
    if (key) out.push({ s: v.name, cs: true, hit: { kind: 'gloss', key, label: v.name } });
  }
  for (const t of TERMS) {
    const hit: BuiltinHit = t.g && GLOSSARY_PLUS[t.g] ? { kind: 'gloss', key: t.g, label: t.en } : { kind: 'vocab', term: t, label: t.en };
    out.push({ s: t.en, cs: false, hit }, { s: t.zh.replace(/（.*?）/g, ''), cs: false, hit });
  }
  return out.filter((n) => n.s.length >= 2).sort((a, b) => b.s.length - a.s.length);
}

let cache: ReturnType<typeof names> | null = null;
const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const isAscii = (s: string) => /^[\x00-\x7f]+$/.test(s);

/**
 * 框選的是內建名詞（完全相同，或很短的選取中含有名詞，例如「GEE 樣本」）就回傳命中結果。
 * 長句子不比對，仍交給 AI 翻譯。
 */
export function lookupBuiltinTerm(selection: string): BuiltinHit | null {
  const sel = (selection || '').trim().replace(/^["'“”‘’「」『』]+|["'“”‘’「」『』.,;:：，。]+$/g, '').trim();
  if (!sel || sel.length > 30) return null;
  cache ||= names();
  // 交互作用項（例如 Sales_growth × Positive、Sales_growth X Positive）
  if (/[A-Za-z_]+\s*(×|\bX\b|\*)\s*[A-Za-z_]+/.test(sel) && GLOSSARY_PLUS['Interaction Term']) {
    return { kind: 'gloss', key: 'Interaction Term', label: sel };
  }
  // 1. 完全相同
  for (const n of cache) {
    if (n.cs ? sel === n.s : sel.toLowerCase() === n.s.toLowerCase()) return n.hit;
  }
  // 2. 短選取中含有名詞（取最長的那個）；英文需整字相符
  for (const n of cache) {
    if (isAscii(n.s)) {
      const re = new RegExp(`(^|[^A-Za-z_])${esc(n.s)}(?=$|[^A-Za-z_])`, n.cs ? '' : 'i');
      if (re.test(sel)) return n.hit;
    } else if (n.s.length >= 2 && sel.includes(n.s)) {
      return n.hit;
    }
  }
  return null;
}
