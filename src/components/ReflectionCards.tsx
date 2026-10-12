import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useMlResults } from '../services/mlResults.ts';

// =====================================================================
// 五個方法論思辨：點開即看預先寫好的進階解說（不呼叫 AI，不產生費用）
// 「放到本研究」段落會帶入真實計算結果，與簡報同一份資料。
// =====================================================================

interface Card {
  no: string;
  tag: string;
  title: string;
  summary: React.ReactNode;
  deep: (d: any) => {
    explain: string[];
    apply: string[];
    qa: { q: string; a: string };
    read?: string;
  };
}

const term = (d: any, t: string) => d?.gee?.models?.exchangeable?.rows?.find((r: any) => r.term === t);
const disp = (d: any, t: string) => term(d, t)?.display ?? '（尚未計算）';

const CARDS: Card[] = [
  {
    no: '01',
    tag: '實質因果優先',
    title: '超越工具堆疊，聚焦經濟真理 (Beyond Tool Stacking)',
    summary: <>研究者即使運用了 GEE、XGBoost 或多元 MMR 設計圖，最關鍵的核心依然是：<strong>「撇開複雜演算法，研究到底揭示了什麼傳統方法看不見的經濟機制？」</strong></>,
    deep: (d) => ({
      explain: [
        '方法是為研究問題服務的。評審最常問的不是「你用了什麼模型」，而是「拿掉模型名稱之後，你發現了什麼」。',
        '檢驗方式：試著用一句不含任何方法名詞的話說出研究發現。說不出來，通常代表研究停在「工具展示」。',
        '原著能用一句話說清楚：營收成長越快的公司，正面新聞帶來的超額報酬越少——好消息早已反映在高預期裡。',
      ],
      apply: [
        `台股復刻同一個交互作用為 Sales_growth × Positive = ${disp(d, 'Sales_growth X Positive')}，方向與原著相同。`,
        '所以報告時的主軸應該是「這個機制在台股也看得到，但強度較弱」，而不是「我們跑了五種演算法」。',
      ],
      qa: {
        q: '你們用了這麼多模型，真正的貢獻是什麼？',
        a: '我們的貢獻是檢驗原著的核心機制能否在不同市場重現。工具只是讓檢驗可重複；結論是方向一致、強度較弱，這本身就是對原著外部效度的證據。',
      },
    }),
  },
  {
    no: '02',
    tag: '兼顧預測與解釋',
    title: '兼顧預測精度與經濟可解釋性 (Balancing Prediction & Causality)',
    summary: <>純黑箱機器學習即使測試集表現優異，實務決策仍需理解：<strong>「驅動報酬變化的底層邏輯為何？在何種條件下關係會逆轉？」</strong></>,
    deep: (d) => ({
      explain: [
        '「解釋」和「預測」是兩個不同的問題（Shmueli, 2010）：解釋看係數方向與顯著性，預測看樣本外準確率。一個模型可以很會解釋、卻不太會預測，反之亦然。',
        '因此兩種結果要分開報告、分開下結論，不能用預測準確率去證明因果，也不能用顯著係數去宣稱能賺錢。',
        '另外，預測結果一定要和「全猜多數類別」的基準比較，否則 55% 看起來不錯，其實可能只比亂猜好一點。',
      ],
      apply: [
        `台股 GEE 中 Positive = ${disp(d, 'Positive')}、Negative = ${disp(d, 'Negative')}，平均效果顯著。`,
        `但機器學習的準確率都在基準 ${d?.split?.baselineAcc ?? '—'} 附近，加入情緒後沒有穩定提升。`,
        '這正好示範了兩者的差別：情緒「平均而言」與報酬相關，但不足以預測「單一事件」的漲跌。',
      ],
      qa: {
        q: 'GEE 顯著、機器學習卻沒提升，不是互相矛盾嗎？',
        a: '不矛盾。GEE 檢驗的是平均關係，樣本大時小效果也會顯著；預測要對每一筆判對方向，雜訊大時很難超越基準。兩個結果合起來的結論是：效果真實存在，但經濟上很小。',
      },
      read: 'Shmueli, G. (2010). To explain or to predict? Statistical Science, 25(3), 289–310.',
    }),
  },
  {
    no: '03',
    tag: '語境與預期動態',
    title: '捕捉語境深意與預期反轉 (Context & Expectation Gap)',
    summary: <>情緒指標不能僅止於詞頻統計，更需辨識市場最具影響力的<strong>「預期差」與「利多出盡」</strong>機制。</>,
    deep: (d) => ({
      explain: [
        '股價反應的是「消息比預期好多少」，而不是「消息本身好不好」。同一則正面新聞，對市場已經期待很高的公司，可能只剩很小的反應，甚至下跌（利多出盡）。',
        '詞典法只數正、負面字詞，看不到預期；交互作用項（例如 營收成長 × 正面情緒）是用模型間接捕捉「預期已經很高」的一種做法。',
        '詞典法的另一個限制是語境：「虧損收斂」含負面字，實際是好消息。Loughran & McDonald（2011）指出一般情緒詞典用在財經文本會誤判，這也是他們建立金融專用詞典的原因。',
      ],
      apply: [
        `台股的 Sales_growth × Positive = ${disp(d, 'Sales_growth X Positive')}、PE_ratio × Positive = ${disp(d, 'PE_ratio X Positive')}：高成長、高本益比（市場期待高）的公司，正面新聞的效果都比較小，與預期差的解釋一致。`,
        `台股改用 ${d?.sentimentEngine ?? '語言模型'} 判讀整句標題，比詞典更能處理「虧損收斂」這類語境，但也要說明它不是原著的方法。`,
      ],
      qa: {
        q: '你怎麼證明是「預期」造成的，而不是其他原因？',
        a: '我們沒有直接衡量預期，所以只能說結果「與預期差的解釋一致」。若要更直接，可以加入分析師預估或盈餘驚奇資料，這是後續研究可以補的。',
      },
      read: 'Loughran, T., & McDonald, B. (2011). When is a liability not a liability? Journal of Finance, 66(1), 35–65.',
    }),
  },
  {
    no: '04',
    tag: '深度質量整合',
    title: '落實真正質量整合的元推論 (True Meta-Inference Integration)',
    summary: <>MMR 的核心在於讓質性與量化產生對話：<strong>「當量化指標與質性文本訊號不一致時，兩者如何交叉印證？」</strong></>,
    deep: () => ({
      explain: [
        '元推論（meta-inference）是把質性與量化兩股結果放在一起，得出單一方法得不到的結論。Fetters, Curry & Creswell（2013）把整合分為設計、方法、詮釋三個層次。',
        '關鍵在詮釋層：兩股結果是互相印證、互相補充，還是互相矛盾？矛盾時要回頭解釋原因，這往往是最有價值的發現。',
        '只把文字轉成分數放進迴歸，只做到方法層的「合併」，還沒到詮釋層的「對話」。這也是本篇是否算 MMR 的爭議所在。',
      ],
      apply: [
        '可補強的做法：從台股樣本挑出報酬最極端的事件（例如前後各 20 則），由研究者閱讀新聞全文、做主題編碼，看看迴歸沒捕捉到的是什麼（例如法說會、匯率、地緣政治）。',
        '再把這些主題回饋到量化模型，或用來解釋為什麼機器學習沒有提升。這樣才算有一條真正的質性軌。',
      ],
      qa: {
        q: '你們的研究有元推論嗎？',
        a: '目前只有分析層的整合，沒有完整的詮釋層元推論，這是本研究與原著共同的限制。我們在報告最後提出可行的補強方式：對極端事件新聞做質性編碼。',
      },
      read: 'Fetters, M. D., Curry, L. A., & Creswell, J. W. (2013). Achieving integration in mixed methods designs. Health Services Research, 48(6pt2), 2134–2156.',
    }),
  },
  {
    no: '05',
    tag: '在地化市場調適',
    title: '在地化適應與微觀市場結構 (Context-Aware Market Adaptation)',
    summary: <>將美股模型遷移至台股時，需考量<strong>散戶參與度、三大法人籌碼互動與產業結構</strong>等差異。</>,
    deep: (d) => ({
      explain: [
        '復刻研究最常被問的是外部效度：同一個模型換到另一個市場，為什麼結果會不同？要先列出兩個市場的結構差異，再判斷差異是否合理。',
        '台股與美股的常見差異：散戶交易比重較高、有漲跌幅限制、少數權值股（特別是半導體）占指數比重很大、財經新聞多為轉載且標題化。',
        '另外，台股月營收每月公告，資訊更新比美股季報快，這會影響「營收成長」這個變數的意義。',
      ],
      apply: [
        `本研究選 ${d?.stocks?.length ?? 10} 檔權值股、以 0050 為基準計算超額報酬，並把月營收的公開時間設為次月 10 日，避免使用未公開資訊。`,
        '限制：樣本集中在大型權值股與一年期間，結果不一定能推論到中小型股；也還沒有納入三大法人買賣超，這是可以加入的在地變數。',
      ],
      qa: {
        q: '台股結果比較弱，是復刻失敗嗎？',
        a: '不是。復刻的目的是檢驗結論能否推廣。方向一致代表機制存在；強度較弱可能來自市場結構、樣本期間與情緒衡量方式不同，這些我們都在限制中說明。',
      },
    }),
  },
];

export function ReflectionCards() {
  const ml = useMlResults();
  const d = ml.isDemo ? null : ml.data;
  const [open, setOpen] = useState<string | null>(null);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-6">
      {CARDS.map((c, idx) => {
        const isOpen = open === c.no;
        const deep = c.deep(d);
        return (
          <div key={c.no}
            className={`rounded-2xl border transition-colors ${isOpen ? 'bg-white border-indigo-300 shadow-md md:col-span-2' : 'bg-slate-50 border-slate-200 hover:border-indigo-300'} ${!isOpen && idx === 4 ? 'md:col-span-2' : ''}`}>
            <button type="button" onClick={() => setOpen(isOpen ? null : c.no)} className="w-full text-left p-5 cursor-pointer">
              <div className="flex items-center justify-between mb-3">
                <span className="px-2.5 py-1 rounded-md text-xs font-mono font-bold bg-indigo-100 text-indigo-800">思辨 {c.no}</span>
                <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
                  {c.tag}
                  <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">{c.title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{c.summary}</p>
              {!isOpen && <span className="inline-block mt-3 text-xs font-semibold text-indigo-600">點開看進階解說 →</span>}
            </button>

            {isOpen && (
              <div className="px-5 pb-5 grid grid-cols-1 lg:grid-cols-3 gap-4 text-sm leading-relaxed animate-in fade-in duration-200">
                <div className="p-4 rounded-xl bg-indigo-50/60 border border-indigo-100">
                  <div className="text-xs font-bold text-indigo-900 mb-2">進階解說</div>
                  <ul className="space-y-2 text-slate-700 list-disc pl-4">{deep.explain.map((t, i) => <li key={i}>{t}</li>)}</ul>
                </div>
                <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-100">
                  <div className="text-xs font-bold text-emerald-900 mb-2">放到本研究（真實資料）</div>
                  <ul className="space-y-2 text-slate-700 list-disc pl-4">{deep.apply.map((t, i) => <li key={i}>{t}</li>)}</ul>
                </div>
                <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200">
                  <div className="text-xs font-bold text-amber-900 mb-2">口試可能被問</div>
                  <p className="font-semibold text-slate-900">「{deep.qa.q}」</p>
                  <p className="mt-2 text-slate-700"><span className="font-bold text-amber-800">建議回答：</span>{deep.qa.a}</p>
                  {deep.read && <p className="mt-3 text-[11px] text-slate-500">延伸閱讀：{deep.read}</p>}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
