// =====================================================================
// Raman et al.（2022）答辯：針對四項方法論質疑逐點回應
// 頁碼已對照期刊正式版 PDF（IJIM 64, 102451）核對
// =====================================================================
import React, { useEffect, useState } from 'react';
import { ShieldQuestion, ShieldCheck, FileSearch, ZoomIn, X } from 'lucide-react';

const IMG = {
  d1: 'https://cdn.gamma.app/qczcgzm3dplba12/69284f7e524448df83d5bfb4c58ee656/original/image.png',
  sum: 'https://cdn.gamma.app/qczcgzm3dplba12/7a419ee5879f4267a66bf77d992d399b/original/image.png',
};

type Strength = '中等' | '中等偏弱';
const POINTS: Array<{ no: number; title: string; attack: string; defense: string[]; evidence: string; strength: Strength; note: string; img?: string }> = [
  {
    no: 1,
    title: '「文字資料」不等於「質性研究」',
    attack: '研究者將新聞文本直接轉換成正負面情緒分數，沒有呈現質性編碼、主題分析或意義建構，因此文字資料不等於質性研究。',
    defense: [
      '這項質疑指出了重要的方法論問題，但需要區分「文字資料的性質」與「文字資料的分析方法」。本研究確實使用 Loughran–McDonald 財務詞典計算正負面情緒，而不是傳統的質性主題分析；然而，這不代表文字資料不能與量化財務資料共同構成整合式分析設計。',
      '本研究的合理主張應是：新聞文本提供不同於財務報表的資訊來源，並被操作化為情緒變數，進一步檢驗其與財務指標的關係。這可以支持跨資料來源整合，但不能單憑這一點宣稱已完成嚴格意義的質性研究。',
    ],
    evidence: '第 4 頁（3.1 節）：以 Loughran–McDonald 詞典辨識情緒類別，最後只使用正面與負面情緒的詞頻資料進行分析。',
    strength: '中等',
    note: '不能否認原文沒有報告系統性質性主題分析。',
    img: IMG.d1,
  },
  {
    no: 2,
    title: '只有一個典範、一種邏輯',
    attack: '全部研究問題都以假設檢定為主，文字只是增加一組自變數，整體仍是後實證主義的量化設計。',
    defense: [
      '本研究採用量化推論作為主要分析邏輯，這點沒有必要迴避。但研究典範的判定，不能只看是否使用假設檢定，也必須檢視研究如何界定問題、蒐集不同來源的資料，以及如何整合分析結果。',
      '論文並非單純將新聞情緒當作另一個獨立變數。作者還檢驗正負面情緒與財務指標之間的交互作用，並比較納入文字資料前後的預測表現。因此，研究確實存在跨資料來源的分析整合。',
      '不過，這些證據主要支持分析設計具有整合特徵，尚不足以單獨證明研究採取了多典範的哲學立場。我們應反駁過度簡化的判定，而不是把量化研究強行說成多典範研究。',
    ],
    evidence: '第 3 頁圖 1：Identify、Explain、Predict 三階段；第 7 頁：比較只用財務資料與結合文字資料的預測結果（表 5–8）。',
    strength: '中等',
    note: '能證明研究程序不只是單一的詞頻統計，但無法據此確認多重研究典範。',
  },
  {
    no: 3,
    title: '沒有詮釋層面的整合',
    attack: '依 Fetters、Curry 與 Creswell（2013）的整合觀點，研究需要檢視設計、方法及詮釋層面的整合。這篇論文沒有讓質性發現與量化結果相互解釋，因此缺少元推論。',
    defense: [
      '這是四項質疑中最需要謹慎處理的一項。論文確實進行了不同分析階段的銜接：先以計量模型分析情緒與財務指標的關係，再以機器學習評估預測表現，並透過不同變數操作方式進行穩健性檢驗。',
      '因此，不能說研究完全沒有整合。更精確的說法是，它具有分析程序與預測結果層次的整合，但是否達到質性與量化證據相互詮釋、產生整合性元推論的程度，仍須進一步檢驗。',
      '尤其必須區分兩件事：計量模型與機器學習的結果相互補充，不等於質性研究結果與量化研究結果已經完成詮釋性整合。',
    ],
    evidence: '第 4–7 頁：GEE、固定效果與隨機效果模型、SCAR 二元化的穩健性分析與機器學習預測。這些程序證明存在多階段分析，但不能單獨證明已完成質性—量化的詮釋整合。',
    strength: '中等偏弱',
    note: '若對方要求嚴格的詮釋性整合，這是最難完全反駁的質疑。',
  },
  {
    no: 4,
    title: '混的是量化技術，不是研究方法',
    attack: '情緒詞典分析、計量經濟學及機器學習都是量化技術，依 Morse 與 Niehaus（2009）的區分，這比較接近多重方法（multimethod），而不是混合方法。',
    defense: [
      '必須承認：情緒詞典計數、GEE 與機器學習確實不能因為名稱不同，就自動被視為三種不同的研究方法論。',
      '但另一方面，混合方法研究也不要求每個分析工具都屬於不同的方法論。真正需要判定的是，研究是否具備不同研究方法的實質要素，以及這些要素是否被有目的地整合。',
      '本篇最有力的辯護，不是宣稱三種量化技術等於三種研究方法，而是指出作者試圖整合新聞文本與財務數據，並透過解釋性模型及預測模型建立不同層次的證據。這使其具備整合式分析設計的特徵，但是否足以構成嚴格 MMR，仍取決於採用的定義與判準。',
    ],
    evidence: '第 3–4 頁：文字資料與財務資料的取得及分析流程；第 7 頁：比較不同資料組合的預測表現。這支持多種分析技術與資料來源的整合，但不能直接證明存在獨立的質性研究方法。',
    strength: '中等',
    note: '重點是證明整合，而非單純羅列技術名稱。',
  },
];

const SUMMARY: Array<[string, string]> = [
  ['1. 文字資料不等於質性研究', '承認詞典分析本身不是完整的質性詮釋，主張文本與財務資料確有整合'],
  ['2. 只有一個典範、一種邏輯', '承認量化推論為主，但指出研究具有多階段分析與資料整合'],
  ['3. 沒有詮釋層面的整合', '指出分析層次的整合確實存在，但不誇大為完整的質性—量化元推論'],
  ['4. 混的是量化技術，不是研究方法', '承認工具不等於方法論，將辯護重點放在整合設計及推論目的'],
];

function Figure({ src, alt, onOpen }: { src: string; alt: string; onOpen: (s: string) => void }) {
  return (
    <button onClick={() => onOpen(src)} className="group relative block w-full rounded-xl overflow-hidden border border-slate-200 bg-slate-50" title="點擊放大">
      <img src={src} alt={alt} loading="lazy" className="w-full h-auto object-contain" />
      <span className="absolute right-2 bottom-2 inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-white/90 border border-slate-200 text-[11px] font-semibold text-slate-700 opacity-80 group-hover:opacity-100">
        <ZoomIn className="w-3.5 h-3.5" />放大
      </span>
    </button>
  );
}

export function MmrDefense() {
  const [zoom, setZoom] = useState<string | null>(null);
  useEffect(() => {
    if (!zoom) return;
    const k = (e: KeyboardEvent) => { if (e.key === 'Escape') setZoom(null); };
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [zoom]);

  return (
    <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200 space-y-5">
      <div className="space-y-1.5">
        <h3 className="text-base sm:text-lg font-bold text-slate-900">答辯：針對四項方法論質疑逐點回應</h3>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          答辯的核心策略：不否認論文採用詞典計數，也不把量化技術誤稱為質性方法；而是說明研究的整合設計、分析程序與推論目的，為何可能支持 MMR 的定位。
          但要注意：反駁「質疑不充分」不等於證明「所有 MMR 判準都已滿足」。
        </p>
      </div>

      {POINTS.map((p) => (
        <div key={p.no} className="rounded-2xl border border-slate-200 overflow-hidden">
          <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
            <div className="font-bold text-slate-900 text-sm">答辯 {p.no}｜{p.title}</div>
            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${p.strength === '中等' ? 'bg-amber-50 text-amber-800 border-amber-200' : 'bg-rose-50 text-rose-800 border-rose-200'}`}>
              答辯強度：{p.strength}
            </span>
          </div>
          <div className="grid lg:grid-cols-5 gap-4 p-4">
            <div className={`${p.img ? 'lg:col-span-3' : 'lg:col-span-5'} space-y-3 text-xs sm:text-sm leading-relaxed`}>
              <div className="rounded-xl bg-rose-50/60 border border-rose-100 p-3">
                <div className="flex items-center gap-1.5 font-bold text-rose-800 text-xs mb-1"><ShieldQuestion className="w-4 h-4" />質疑方的論點</div>
                <p className="text-slate-700">{p.attack}</p>
              </div>
              <div className="rounded-xl bg-emerald-50/60 border border-emerald-100 p-3 space-y-2">
                <div className="flex items-center gap-1.5 font-bold text-emerald-800 text-xs"><ShieldCheck className="w-4 h-4" />答辯方的回應</div>
                {p.defense.map((t, i) => <p key={i} className="text-slate-700">{t}</p>)}
              </div>
              <div className="rounded-xl bg-slate-50 border border-slate-200 p-3">
                <div className="flex items-center gap-1.5 font-bold text-slate-700 text-xs mb-1"><FileSearch className="w-4 h-4" />論文證據（期刊正式版 PDF）</div>
                <p className="text-slate-700">{p.evidence}</p>
                <p className="text-[11px] text-slate-500 mt-1.5">強度說明：{p.note}</p>
              </div>
            </div>
            {p.img && (
              <div className="lg:col-span-2">
                <Figure src={p.img} alt={`答辯 ${p.no}：${p.title}`} onOpen={setZoom} />
              </div>
            )}
          </div>
        </div>
      ))}

      <div className="rounded-2xl border border-slate-200 overflow-hidden">
        <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 font-bold text-slate-900 text-sm">四項質疑的攻防結論</div>
        <div className="grid lg:grid-cols-5 gap-4 p-4">
          <div className="lg:col-span-3 space-y-3">
            <table className="w-full text-xs sm:text-sm border-collapse">
              <thead>
                <tr className="text-left text-slate-600 border-b border-slate-200">
                  <th className="py-2 pr-3 w-[42%]">質疑</th>
                  <th className="py-2">最適當的答辯立場</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {SUMMARY.map(([q, a]) => (
                  <tr key={q} className="align-top">
                    <td className="py-2 pr-3 font-semibold text-slate-800">{q}</td>
                    <td className="py-2 text-slate-700">{a}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <blockquote className="border-l-4 border-indigo-400 bg-indigo-50/50 rounded-r-xl p-3 text-xs sm:text-sm text-slate-800 leading-relaxed">
              <div className="text-[11px] font-bold text-indigo-800 mb-1">答辯時最重要的一句話</div>
              本研究的 MMR 定位，不應只由資料格式或分析工具的數量決定，而應依據資料來源、研究方法及推論層次的實質整合程度判定。
              Raman et al.（2022）已展現資料與分析層次的整合，但其是否充分達到嚴格混合方法研究所要求的詮釋性整合，仍是需要明確界定並接受檢驗的核心問題。
            </blockquote>
            <p className="text-[11px] text-slate-500">這樣的答辯比全面否定四項質疑更有說服力，也能避免在口試或期刊審查時，因為過度主張而被反問到無法回答。</p>
          </div>
          <div className="lg:col-span-2">
            <Figure src={IMG.sum} alt="四項質疑的攻防" onOpen={setZoom} />
          </div>
        </div>
      </div>

      {zoom && (
        <div className="fixed inset-0 z-[90] bg-slate-950/85 flex items-center justify-center p-4" onClick={() => setZoom(null)}>
          <button className="absolute top-4 right-4 p-2 rounded-full bg-white/90 text-slate-800" onClick={() => setZoom(null)} aria-label="關閉"><X className="w-5 h-5" /></button>
          <img src={zoom} alt="放大檢視" className="max-w-full max-h-full object-contain rounded-xl shadow-2xl" onClick={(e) => e.stopPropagation()} />
        </div>
      )}
    </div>
  );
}
