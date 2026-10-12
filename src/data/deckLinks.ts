// =====================================================================
// 簡報 ⇄ 台股復刻／論文翻譯 的快速對應標籤
// 每頁簡報可以：左欄跳到「論文翻譯」的對應章節；右欄跳到「台股復刻」的對應區塊（含過程重播第幾步）
// 台股復刻頁也用這張表反查：目前看的區塊，在簡報第幾頁講到
// =====================================================================

export type RepAnchor = 'rep-compare' | 'rep-replay' | 'rep-stocks' | 'rep-gee' | 'rep-ml';

export const REP_ANCHORS: Array<{ id: RepAnchor; label: string; short: string }> = [
  { id: 'rep-compare', label: '左右比對看板', short: '比對看板' },
  { id: 'rep-stocks', label: '樣本股票・新聞・下載', short: '股票與新聞' },
  { id: 'rep-replay', label: '過程重播（6 步）', short: '過程重播' },
  { id: 'rep-gee', label: 'GEE 實證表', short: 'GEE 表' },
  { id: 'rep-ml', label: '機器學習比較', short: '機器學習' },
];

export const REPLAY_STEP_LABEL = ['抓取新聞', '情緒判讀', '組成樣本', 'GEE 估計', '機器學習', '與原著比較'];

export interface RepLink { anchor: RepAnchor; step?: number } // step：過程重播第幾步（1–6）

export const READER_SECTION_LABEL: Record<string, string> = {
  meta: '引用資訊', abstract: '摘要', intro: '1 引言', theory: '2 理論', methods: '3 方法', results: '4 結果', discussion: '5 討論', conclusion: '6 結論',
};

/** 每頁簡報（以 DECK 的 id）對應的論文章節與台股區塊 */
export const SLIDE_LINKS: Record<string, { read?: string; rep?: RepLink[] }> = {
  p1: { read: 'meta', rep: [{ anchor: 'rep-compare' }] },
  a1: { read: 'abstract', rep: [{ anchor: 'rep-stocks' }, { anchor: 'rep-replay', step: 1 }] },
  a2: { read: 'abstract', rep: [{ anchor: 'rep-compare' }] },
  a3: { read: 'abstract', rep: [{ anchor: 'rep-compare' }, { anchor: 'rep-replay', step: 1 }] },
  a4: { read: 'abstract', rep: [{ anchor: 'rep-gee' }, { anchor: 'rep-replay', step: 6 }] },
  a5: { read: 'abstract', rep: [{ anchor: 'rep-gee' }, { anchor: 'rep-replay', step: 6 }] },
  p3: { read: 'intro', rep: [{ anchor: 'rep-compare' }] },
  p4: { read: 'theory', rep: [{ anchor: 'rep-gee' }] },
  p5: { read: 'theory', rep: [{ anchor: 'rep-replay', step: 2 }] },
  p6: { read: 'methods', rep: [{ anchor: 'rep-stocks' }, { anchor: 'rep-replay', step: 1 }] },
  p7: { read: 'methods', rep: [{ anchor: 'rep-replay', step: 3 }] },
  p8: { read: 'methods', rep: [{ anchor: 'rep-replay', step: 2 }, { anchor: 'rep-stocks' }] },
  p9: { read: 'methods', rep: [{ anchor: 'rep-replay', step: 4 }, { anchor: 'rep-gee' }] },
  p10: { read: 'results', rep: [{ anchor: 'rep-gee' }] },
  p11: { read: 'results', rep: [{ anchor: 'rep-ml' }, { anchor: 'rep-replay', step: 5 }] },
  r1: { read: 'abstract', rep: [{ anchor: 'rep-compare' }] },
  r0: { read: 'methods', rep: [{ anchor: 'rep-replay', step: 1 }, { anchor: 'rep-stocks' }] },
  r2: { read: 'intro', rep: [{ anchor: 'rep-stocks' }, { anchor: 'rep-replay', step: 1 }] },
  r3: { read: 'methods', rep: [{ anchor: 'rep-replay', step: 2 }, { anchor: 'rep-stocks' }] },
  r4: { read: 'methods', rep: [{ anchor: 'rep-stocks' }, { anchor: 'rep-replay', step: 2 }] },
  r5: { read: 'methods', rep: [{ anchor: 'rep-replay', step: 3 }] },
  r6: { read: 'theory', rep: [{ anchor: 'rep-replay', step: 3 }] },
  r7: { read: 'methods', rep: [{ anchor: 'rep-replay', step: 3 }] },
  r8: { read: 'results', rep: [{ anchor: 'rep-gee' }, { anchor: 'rep-replay', step: 4 }] },
  r9: { read: 'results', rep: [{ anchor: 'rep-gee' }] },
  r10: { read: 'results', rep: [{ anchor: 'rep-gee' }, { anchor: 'rep-replay', step: 6 }] },
  r11: { read: 'results', rep: [{ anchor: 'rep-gee' }] },
  r12: { read: 'results', rep: [{ anchor: 'rep-replay', step: 4 }, { anchor: 'rep-gee' }] },
  r13: { read: 'methods', rep: [{ anchor: 'rep-ml' }, { anchor: 'rep-replay', step: 5 }] },
  r14: { read: 'results', rep: [{ anchor: 'rep-ml' }, { anchor: 'rep-replay', step: 5 }] },
  r15: { read: 'results', rep: [{ anchor: 'rep-ml' }] },
  r16: { read: 'discussion', rep: [{ anchor: 'rep-stocks' }] },
  r17: { read: 'discussion', rep: [{ anchor: 'rep-compare' }] },
  c1: { read: 'results', rep: [{ anchor: 'rep-replay', step: 6 }, { anchor: 'rep-gee' }] },
  c2: { read: 'results', rep: [{ anchor: 'rep-gee' }] },
  c3: { read: 'results', rep: [{ anchor: 'rep-gee' }, { anchor: 'rep-replay', step: 6 }] },
  c4: { read: 'results', rep: [{ anchor: 'rep-ml' }] },
  c5: { read: 'discussion', rep: [{ anchor: 'rep-compare' }] },
  c6: { read: 'conclusion', rep: [{ anchor: 'rep-compare' }] },
};

export function repLinkLabel(l: RepLink): string {
  const a = REP_ANCHORS.find((x) => x.id === l.anchor);
  return l.step ? `重播 ${l.step}・${REPLAY_STEP_LABEL[l.step - 1]}` : a?.short || l.anchor;
}
