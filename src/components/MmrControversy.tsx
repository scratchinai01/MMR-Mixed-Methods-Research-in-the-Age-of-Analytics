import { Scale, ThumbsUp, ThumbsDown, BookOpen, MessageSquareQuote } from 'lucide-react';

// =====================================================================
// 「這篇算不算 MMR？」——學界爭議並陳
// 不替讀者下定論：分別整理正方與反方的論點、所依據的定義，
// 並提供在報告／論文中引用時較不會被挑戰的中性寫法。
// =====================================================================

const CRITERIA: Array<{ item: string; paper: string; broad: 'pass' | 'partial' | 'fail'; strict: 'pass' | 'partial' | 'fail' }> = [
  { item: '同時使用量化資料與文字資料', paper: '財務指標＋新聞文本', broad: 'pass', strict: 'pass' },
  { item: '有質性「分析」（詮釋、編碼、主題）', paper: '文本以詞典／演算法轉成情緒分數，未報告質性發現', broad: 'partial', strict: 'fail' },
  { item: '有質性研究問題', paper: '研究問題都是可檢定的假設', broad: 'partial', strict: 'fail' },
  { item: '兩股資料在分析層面整合', paper: '情緒分數與財務變數放進同一迴歸，含交互項', broad: 'pass', strict: 'partial' },
  { item: '在詮釋層面整合（元推論）', paper: '結論來自統計結果，沒有質性與量化結果的對照或互證', broad: 'partial', strict: 'fail' },
  { item: '作者自稱 mixed methods', paper: '標題與理論意涵明確使用', broad: 'pass', strict: 'partial' },
];

const mark = (v: 'pass' | 'partial' | 'fail') =>
  v === 'pass' ? <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">符合</span>
    : v === 'partial' ? <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-900 font-bold">可辯論</span>
      : <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 font-bold">不符合</span>;

export function MmrControversy() {
  return (
    <div className="space-y-6">
      {/* 結論橫幅 */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-amber-950 text-white shadow-xl border border-amber-700/40 space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-400 text-slate-950 flex items-center gap-1.5">
            <Scale className="w-4 h-4" />
            <span>判定：有爭議</span>
          </span>
          <span className="text-xs text-amber-200/80">結論取決於採用哪一種 MMR 定義</span>
        </div>
        <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold leading-tight">
          這篇是「作者自稱的 MMR」，但是否為<span className="text-amber-300">真正的混合方法研究</span>，學界看法分歧
        </h2>
        <p className="text-sm sm:text-base text-slate-200 leading-relaxed max-w-4xl">
          爭議核心只有一個：<strong>把新聞文字用詞典或演算法轉成情緒分數，再放進迴歸，算不算「質性研究」？</strong>
          採寬鬆定義（看資料種類、看作者定位）會說算；採嚴格定義（質性軌必須有詮釋性分析，且兩軌要在詮釋層面整合）會說這是
          「以文字為資料的量化研究」，最多只是準混合（quasi-mixed）。
        </p>
        <p className="text-xs text-slate-400">
          下方的正反論點依 MMR 方法論文獻整理，是對這類研究常見的論證方式，並非特定學者對本篇的公開評論。
        </p>
      </div>

      {/* 正反並陳 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="p-6 rounded-3xl bg-emerald-50/70 border border-emerald-200 space-y-3">
          <div className="flex items-center gap-2 font-extrabold text-emerald-950">
            <ThumbsUp className="w-5 h-5 text-emerald-600" />
            <span>正方：可以列為 MMR</span>
          </div>
          <ul className="space-y-2.5 text-sm text-emerald-950/90 leading-relaxed list-disc pl-5">
            <li><strong>寬鬆定義成立。</strong>Johnson, Onwuegbuzie &amp; Turner（2007）把 MMR 定義為結合質性與量化研究「元素」以取得廣度與深度；本篇同時使用結構化財務資料與非結構化新聞文本。</li>
            <li><strong>量化轉換（quantitizing）是公認的混合技術。</strong>Sandelowski, Voils &amp; Knafl（2009）專文討論 quantitizing；Creswell &amp; Plano Clark 也把「資料轉換」列為收斂設計的一種變體。</li>
            <li><strong>有分析層面的整合。</strong>文字情緒與財務變數同在一個模型，並以交互項檢驗兩者的共同作用，不是兩份各自獨立的報告。</li>
            <li><strong>作者明確定位為 MMR 範例。</strong>標題即為 mixed-methods research，共同作者 Venkatesh 也是資訊管理領域 MMR 準則的主要作者（Venkatesh, Brown &amp; Bala, 2013, <em>MIS Quarterly</em>）。</li>
          </ul>
        </div>

        <div className="p-6 rounded-3xl bg-rose-50/70 border border-rose-200 space-y-3">
          <div className="flex items-center gap-2 font-extrabold text-rose-950">
            <ThumbsDown className="w-5 h-5 text-rose-600" />
            <span>反方：不符合 MMR</span>
          </div>
          <ul className="space-y-2.5 text-sm text-rose-950/90 leading-relaxed list-disc pl-5">
            <li><strong>「文字資料」不等於「質性研究」。</strong>質性的關鍵在詮釋性分析（編碼、主題、意義建構），不在資料格式。本篇的文本一進來就被詞典計數成分數，沒有任何質性發現被報告。</li>
            <li><strong>只有一個典範、一種邏輯。</strong>所有研究問題都是假設檢定，整體是後實證主義的量化設計；文字只是多了一組自變數（text-as-data）。</li>
            <li><strong>沒有詮釋層面的整合。</strong>Fetters, Curry &amp; Creswell（2013）把整合分為設計、方法、詮釋三層；本篇沒有讓質性與量化結果互相對照、解釋或修正，缺少元推論。Teddlie &amp; Tashakkori（2009）稱這類「蒐集兩種資料但未真正整合」的研究為準混合設計（quasi-mixed）。</li>
            <li><strong>混的是「量化技術」，不是「研究方法」。</strong>情緒分析＋計量＋機器學習都是量化技術。依 Morse &amp; Niehaus（2009）的區分，這比較接近多重方法（multimethod），而非混合方法。</li>
          </ul>
        </div>
      </div>

      {/* 判準對照 */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
        <h3 className="text-lg font-bold text-slate-900">同一篇論文，兩種定義下的判定</h3>
        <div className="overflow-x-auto rounded-2xl border border-slate-200">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="bg-slate-100 text-slate-900 border-b border-slate-200 font-bold">
                <th className="p-3">判準</th>
                <th className="p-3">本篇的做法</th>
                <th className="p-3 text-center w-28">寬鬆定義</th>
                <th className="p-3 text-center w-28">嚴格定義</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {CRITERIA.map((c) => (
                <tr key={c.item}>
                  <td className="p-3 font-bold text-slate-900">{c.item}</td>
                  <td className="p-3 text-slate-700">{c.paper}</td>
                  <td className="p-3 text-center">{mark(c.broad)}</td>
                  <td className="p-3 text-center">{mark(c.strict)}</td>
                </tr>
              ))}
              <tr className="bg-slate-50 font-bold">
                <td className="p-3 text-slate-900" colSpan={2}>結論</td>
                <td className="p-3 text-center text-emerald-800">可列為 MMR</td>
                <td className="p-3 text-center text-rose-800">量化研究／準混合</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-xs text-slate-500">
          另一個常被指出的矛盾：若接受為 MMR，本篇最接近的是收斂設計中的「資料轉換」變體；但收斂設計預設有一條獨立的質性分析軌，而本篇沒有。
          因此「並行／收斂」這個標籤本身也有爭議。
        </p>
      </div>

      {/* 引用建議 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="p-5 rounded-2xl bg-slate-900 text-slate-100 space-y-3">
          <div className="text-amber-300 font-bold text-sm flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            <span>論文中較不會被挑戰的引用寫法</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-4 rounded-xl border border-slate-800">
            「Raman et al.（2022）自我定位為分析學時代的混合方法研究範例，將新聞文本量化為情緒指標後，與財務指標共同解釋累積異常報酬。
            惟其文本軌以詞典法量化處理、未進行詮釋性質性分析，依較嚴格的定義（如 Fetters et al., 2013）較接近以文字為資料的量化研究或準混合設計。」
          </p>
        </div>
        <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 space-y-3">
          <div className="text-amber-950 font-bold text-sm flex items-center gap-2">
            <MessageSquareQuote className="w-4 h-4 text-amber-600" />
            <span>報告時被問「這篇算 MMR 嗎？」可以這樣回答</span>
          </div>
          <p className="text-xs text-amber-950/90 leading-relaxed">
            「作者自稱是，寬鬆定義下也成立；但它的質性軌只有量化轉換，沒有詮釋性分析，也沒有詮釋層面的整合，所以嚴格定義下會被歸為準混合。
            我們的台股復刻同樣把新聞轉成情緒分數，因此也繼承了這個限制。若要補強成較完整的 MMR，可以加一條質性軌，
            例如對極端報酬事件的新聞做主題編碼，再回頭解釋迴歸結果。」
          </p>
        </div>
      </div>

      <div className="text-xs text-slate-500 px-1">
        以下保留原本的「正方」完整論證，供對照閱讀。
      </div>
    </div>
  );
}
