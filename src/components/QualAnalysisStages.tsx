// =====================================================================
// 近代質性分析的四個發展階段：Raman et al.（2022）與本研究各落在哪裡
// 放在「方法論思辨」MMR 判定段落，四項答辯之後
// 文獻皆為已核對之期刊論文；四階段為本報告整理的教學架構，非文獻上的標準分期
// =====================================================================
import React, { useEffect, useState } from 'react';
import { ZoomIn, X, MapPin, BookOpen } from 'lucide-react';

const IMG = '/images/gamma/bf3d64fe7d52449b8c673a0f5685d6f9.webp';

const STAGES = [
  {
    no: 1, title: '傳統質性分析', sub: '人工閱讀、編碼、分類與詮釋',
    body: '研究者閱讀訪談、文件、新聞或開放式問卷，建立編碼架構，透過主題分析、內容分析或紮根理論理解研究現象。',
    pro: '情境理解與深度詮釋', con: '耗時、規模有限、研究者間可能出現編碼差異',
    tone: 'border-emerald-200 bg-emerald-50/50', badge: 'bg-emerald-600', marks: [] as string[],
  },
  {
    no: 2, title: '傳統機器學習與 NLP', sub: '從文字特徵走向統計辨識',
    body: '使用 TF-IDF、主題模型、詞典情緒分析、支援向量機（SVM）與分類模型，將文字轉換成可分析的特徵。',
    pro: '可規模化、可量化', con: '依賴特徵工程與預先定義的詞彙或標籤',
    tone: 'border-sky-200 bg-sky-50/50', badge: 'bg-sky-600', marks: ['Raman et al.（2022）'],
  },
  {
    no: 3, title: '深度學習與 LLM', sub: '從詞彙統計走向上下文語意理解',
    body: '利用 Transformer、BERT、FinBERT、GPT 等模型進行情緒辨識、語意分類、主題探索、隱喻辨識與論述分析。',
    pro: '能處理上下文、否定語句及較複雜的語意', con: '可能誤判、產生幻覺，結果受提示詞與模型版本影響',
    tone: 'border-orange-200 bg-orange-50/50', badge: 'bg-orange-500', marks: ['本研究（台股復刻）'],
  },
  {
    no: 4, title: 'AI 輔助計算質性與混合方法', sub: '人類詮釋、AI 語意分析與實證驗證整合',
    body: '由研究者定義研究問題、建立理論框架，再以 LLM 分析大量文本、以深度學習萃取語意特徵，最後透過統計模型、案例回查與人工驗證檢驗研究發現。',
    pro: '不只找到模式，還要說明模式的意義、適用範圍與證據', con: '設計與驗證成本最高',
    tone: 'border-violet-200 bg-violet-50/50', badge: 'bg-violet-600', marks: [],
  },
];

type Ref = { key: string; cite: string; url: string; point: string; stage: string };
const REFS: Ref[] = [
  {
    key: 'lm2016', stage: '第 2 階段',
    cite: 'Loughran, T., & McDonald, B. (2016). Textual analysis in accounting and finance: A survey. Journal of Accounting Research, 54(4), 1187–1230.',
    url: 'https://doi.org/10.1111/1475-679X.12123',
    point: '回顧會計與財金領域的文字分析，整理詞典法、詞頻加權等做法及其限制；Raman 使用的正是這套 LM 詞典。',
  },
  {
    key: 'gkt2019', stage: '第 2 階段',
    cite: 'Gentzkow, M., Kelly, B., & Taddy, M. (2019). Text as data. Journal of Economic Literature, 57(3), 535–574.',
    url: 'https://doi.org/10.1257/jel.20181020',
    point: '把文字轉成數值矩陣、再納入經濟計量或預測模型的方法總覽，是「計算文本分析」在經濟財金的代表性定位。',
  },
  {
    key: 'finbert', stage: '第 3 階段',
    cite: 'Huang, A. H., Wang, H., & Yang, Y. (2023). FinBERT: A large language model for extracting information from financial text. Contemporary Accounting Research, 40(2), 806–841.',
    url: 'https://doi.org/10.1111/1911-3846.12832',
    point: '在分析師報告的句子情緒分類上，FinBERT 明顯優於 LM 詞典，訓練樣本少時優勢更大；說明第 2 到第 3 階段的進展。',
  },
  {
    key: 'ziems', stage: '第 3–4 階段',
    cite: 'Ziems, C., Held, W., Shaikh, O., Chen, J., Zhang, Z., & Yang, D. (2024). Can large language models transform computational social science? Computational Linguistics, 50(1), 237–291.',
    url: 'https://doi.org/10.1162/coli_a_00502',
    point: 'LLM 在分類任務上未勝過最佳的微調模型，但與人工標註有一定一致性；作者建議把 LLM 當成人工標註團隊中的成員，與研究者協作，而非取代。',
  },
  {
    key: 'nelson', stage: '第 4 階段',
    cite: 'Nelson, L. K. (2020). Computational grounded theory: A methodological framework. Sociological Methods & Research, 49(1), 3–42.',
    url: 'https://doi.org/10.1177/0049124117729703',
    point: '計算紮根理論三步驟：以電腦偵測模式、研究者深度閱讀原文精煉模式、再以計算方法確認，正是「回到原文」的整合範例。',
  },
  {
    key: 'berente', stage: '第 4 階段',
    cite: 'Berente, N., Seidel, S., & Safadi, H. (2019). Research commentary—Data-driven computationally intensive theory development. Information Systems Research, 30(1), 50–64.',
    url: 'https://doi.org/10.1287/isre.2018.0774',
    point: '資訊系統頂級期刊提出：以數位痕跡資料進行計算密集的理論發展，銜接紮根理論的詮釋傳統與自動化的模式發現；與 IJIM 同屬 IS 領域。',
  },
  {
    key: 'miranda', stage: '第 4 階段',
    cite: 'Miranda, S., Berente, N., Seidel, S., Safadi, H., & Burton-Jones, A. (2022). Editor’s comments: Computationally intensive theory construction: A primer for authors and reviewers. MIS Quarterly, 46(2), iii–xviii.',
    url: 'https://aisel.aisnet.org/misq/vol46/iss2/4',
    point: 'MISQ 編輯評論，為作者與審稿人提供計算密集理論建構的撰寫與審查指引。',
  },
  {
    key: 'sandelowski', stage: '判定依據',
    cite: 'Sandelowski, M., Voils, C. I., & Knafl, G. (2009). On quantitizing. Journal of Mixed Methods Research, 3(3), 208–222.',
    url: 'https://doi.org/10.1177/1558689809334210',
    point: '把質性資料轉成數字（quantitizing）是混合方法常見技術，但轉換本身涉及研究者的判斷，並非中立的計數；這是正方「資料轉化」論點的依據，也是它的限制。',
  },
];

const POSITIONS = [
  {
    name: 'AI 輔助質性分析', en: 'AI-assisted qualitative analysis',
    when: '主要目標是理解文本的意義、主題與論述；AI 協助編碼，研究者負責詮釋。',
    refs: 'Ziems et al.（2024）',
    who: '',
  },
  {
    name: '計算文本分析', en: 'Computational text analysis',
    when: '以 NLP、詞典或語言模型把大量文本轉成變數，再進行統計檢定或預測。',
    refs: 'Loughran & McDonald（2016）；Gentzkow et al.（2019）；Huang et al.（2023）',
    who: 'Raman et al.（2022）、本研究',
  },
  {
    name: '分析驅動的混合方法', en: 'Analytics-driven mixed-methods research',
    when: '質性文本詮釋、語意特徵量化與財務實證，有明確的設計並在詮釋層次相互整合。',
    refs: 'Venkatesh et al.（2013）；Fetters et al.（2013）；Nelson（2020）；Berente et al.（2019）',
    who: 'Raman 的自我定位（爭議所在）',
  },
];

export function QualAnalysisStages() {
  const [zoom, setZoom] = useState(false);
  useEffect(() => {
    if (!zoom) return;
    const k = (e: KeyboardEvent) => { if (e.key === 'Escape') setZoom(false); };
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [zoom]);

  return (
    <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200 space-y-5">
      <div className="space-y-1.5">
        <h3 className="text-base sm:text-lg font-bold text-slate-900">換個角度：從質性分析的發展階段看 MMR 判定</h3>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          判定的關鍵不只是「有沒有用文字資料」，而是文字被分析到哪個程度、有沒有回到原文詮釋並與量化結果整合。
          把研究放到下面四個階段上，爭議點會更清楚。
        </p>
      </div>

      {/* 四階段圖 */}
      <button onClick={() => setZoom(true)} className="group relative block w-full rounded-xl overflow-hidden border border-slate-200 bg-slate-50" title="點擊放大">
        <img src={IMG} alt="近代質性分析的四個發展階段：從傳統分析到 LLM 與深度學習" loading="lazy" className="w-full h-auto object-contain" />
        <span className="absolute right-2 bottom-2 inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-white/90 border border-slate-200 text-[11px] font-semibold text-slate-700 opacity-80 group-hover:opacity-100">
          <ZoomIn className="w-3.5 h-3.5" />放大
        </span>
      </button>

      {/* 四階段文字與定位標記 */}
      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-3">
        {STAGES.map((s) => (
          <div key={s.no} className={`rounded-xl border p-3 space-y-2 text-xs leading-relaxed ${s.tone}`}>
            <div className="flex items-center gap-2">
              <span className={`w-6 h-6 rounded-full text-white font-bold flex items-center justify-center ${s.badge}`}>{s.no}</span>
              <div>
                <div className="font-bold text-slate-900 text-sm">{s.title}</div>
                <div className="text-[11px] text-slate-500">{s.sub}</div>
              </div>
            </div>
            <p className="text-slate-700">{s.body}</p>
            <p><b className="text-emerald-700">優勢</b>　{s.pro}</p>
            <p><b className="text-rose-700">{s.no === 4 ? '代價' : '限制'}</b>　{s.con}</p>
            {s.marks.map((m) => (
              <div key={m} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-900 text-white text-[11px] font-bold">
                <MapPin className="w-3 h-3" />{m}
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* 兩者落點 */}
      <div className="rounded-xl border-l-4 border-indigo-500 bg-indigo-50/60 p-4 text-xs sm:text-sm text-slate-800 leading-relaxed space-y-1.5">
        <p>
          <b>Raman et al.（2022）落在第 2 階段：</b>以 Loughran–McDonald 詞典計算正負面詞頻，再接 GEE 與機器學習；沒有回到原文做詮釋。
          作者自我定位為混合方法，但依下表較接近「計算文本分析」。
        </p>
        <p>
          <b>本研究（台股復刻）落在第 3 階段：</b>以大型語言模型（Gemini）判讀新聞標題情緒，再接 GEE 與機器學習；同樣沒有質性分析軌，因此也屬「計算文本分析」。
          要進入第 4 階段，需補上「回到原文」的質性編碼，並以聯合展示表與迴歸結果相互解釋。
        </p>
      </div>

      {/* 三種定位對照表 */}
      <div className="rounded-2xl border border-slate-200 overflow-hidden">
        <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 font-bold text-slate-900 text-sm">論文中如何定位這類研究：三種方法論定位</div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs sm:text-sm border-collapse min-w-[640px]">
            <thead>
              <tr className="text-left text-slate-600 border-b border-slate-200">
                <th className="py-2 px-4 w-[22%]">研究定位</th>
                <th className="py-2 px-3">適用情況</th>
                <th className="py-2 px-3 w-[26%]">代表文獻</th>
                <th className="py-2 px-3 w-[16%]">落在這裡的研究</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {POSITIONS.map((p) => (
                <tr key={p.name} className={`align-top ${p.who.includes('本研究') ? 'bg-amber-50/60' : ''}`}>
                  <td className="py-2.5 px-4">
                    <div className="font-semibold text-slate-900">{p.name}</div>
                    <div className="text-[11px] text-slate-500 font-mono">{p.en}</div>
                  </td>
                  <td className="py-2.5 px-3 text-slate-700">{p.when}</td>
                  <td className="py-2.5 px-3 text-slate-600">{p.refs}</td>
                  <td className="py-2.5 px-3 font-semibold text-slate-800">{p.who || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="px-4 py-3 text-[11px] text-slate-500 border-t border-slate-100 leading-relaxed">
          以財務績效或超額報酬為結果變數、且量化分析占主導時，較精確的寫法是「計算文本分析，並帶有混合方法的整合特徵」；
          是否構成嚴格意義的混合方法研究，取決於質性與量化分析是否有明確的設計與整合程序（Fetters et al., 2013; Venkatesh et al., 2013）。
        </p>
      </div>

      {/* 頂級期刊文獻 */}
      <div className="rounded-2xl border border-slate-200 overflow-hidden">
        <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 font-bold text-slate-900 text-sm flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-indigo-600" />頂級期刊怎麼說（已核對出處）
        </div>
        <ol className="divide-y divide-slate-100">
          {REFS.map((r) => (
            <li key={r.key} className="px-4 py-3 text-xs sm:text-sm leading-relaxed space-y-1">
              <div className="flex flex-wrap items-start gap-2">
                <span className="shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">{r.stage}</span>
                <a href={r.url} target="_blank" rel="noreferrer" className="text-slate-800 hover:text-indigo-700 hover:underline flex-1 min-w-0">{r.cite}</a>
              </div>
              <p className="text-slate-600">{r.point}</p>
            </li>
          ))}
        </ol>
      </div>

      <p className="text-[11px] text-slate-500 leading-relaxed">
        說明：四個階段是本報告為教學整理的架構，用來說明文字分析方法的演進，不是文獻上的標準分期；引用時請以上列各篇原文為準。
        四階段的劃分也不代表後一階段必然優於前一階段，研究設計仍應依研究問題選擇方法。
      </p>

      {zoom && (
        <div className="fixed inset-0 z-[90] bg-slate-950/85 flex items-center justify-center p-4" onClick={() => setZoom(false)}>
          <button className="absolute top-4 right-4 p-2 rounded-full bg-white/90 text-slate-800" onClick={() => setZoom(false)} aria-label="關閉"><X className="w-5 h-5" /></button>
          <img src={IMG} alt="放大檢視" className="max-w-full max-h-full object-contain rounded-xl shadow-2xl" onClick={(e) => e.stopPropagation()} />
        </div>
      )}
    </div>
  );
}
