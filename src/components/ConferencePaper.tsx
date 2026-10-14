import React from 'react';
import { PAPER_TABLES } from '../data/paperContent.ts';
import { verdictFor } from '../data/thesisDeck.tsx';
import { MathRenderer } from './MathRenderer.tsx';

// =====================================================================
// 書面報告：依國內管理／財務類學術研討會論文的標準格式撰寫
//   題目、作者、摘要（中英）、關鍵詞 → 壹 緒論 → 貳 文獻探討與研究假說 → 參 研究方法
//   → 肆 實證結果 → 伍 結論與建議 → 參考文獻（APA 第 7 版）
// 數字全部由 ml_results.json（FinMind 真實資料）帶入；原著數字取自本平台論文翻譯表 2。
// =====================================================================

const TERMS = [
  'Prior_SCAR', 'Size', 'Positive', 'Negative', 'PE_ratio', 'Sales_growth', 'MB_ratio',
  'PE_ratio X Positive', 'Sales_growth X Positive', 'MB_ratio X Positive',
  'PE_ratio X Negative', 'Sales_growth X Negative', 'MB_ratio X Negative',
];
const LABEL: Record<string, string> = {
  Prior_SCAR: '前期超額報酬', Size: '公司規模', Positive: '正面情緒', Negative: '負面情緒',
  PE_ratio: '本益比', Sales_growth: '營收成長率', MB_ratio: '股價淨值比', SCAR: '標準化累積超額報酬',
};
const labelOf = (t: string) => t.split(' X ').map((x) => LABEL[x] || x).join(' × ');

const paperCell = (term: string, col = 3) => {
  const row = PAPER_TABLES.find((t) => t.id === 'table-2')?.rows.find((r) => String(r[0]).split(' (')[0].trim() === term);
  return row ? String(row[col]) : '—';
};

const f3 = (x?: number) => (typeof x === 'number' && Number.isFinite(x) ? x.toFixed(3) : '—');
const pTxt = (p?: number) => (typeof p !== 'number' ? '—' : p < 0.001 ? 'p < .001' : `p = ${p.toFixed(3).replace(/^0/, '')}`);
const n = (x?: number) => (typeof x === 'number' ? x.toLocaleString() : '—');
const pct = (x?: number) => (typeof x === 'number' ? `${(x * 100).toFixed(1)}%` : '—');

// ── 排版元件 ──
const H1 = ({ children }: { children: React.ReactNode }) => <h2 className="text-[1.15em] font-bold text-center mt-10 mb-4">{children}</h2>;
const H2 = ({ children }: { children: React.ReactNode }) => <h3 className="text-[1.02em] font-bold mt-6 mb-2">{children}</h3>;
const P = ({ children }: { children: React.ReactNode }) => <p className="indent-[2em] text-justify leading-[2] my-2">{children}</p>;
const Eq = ({ tex, no }: { tex: string; no: number }) => (
  <div className="my-4 flex items-center gap-4">
    <div className="flex-1 overflow-x-auto"><MathRenderer math={tex} displayMode showCopy={false} /></div>
    <span className="shrink-0 text-[0.95em]">({no})</span>
  </div>
);
const TableBox = ({ no, title, note, children }: { no: number | string; title: string; note?: React.ReactNode; children: React.ReactNode }) => (
  <figure className="my-6 break-inside-avoid">
    <figcaption className="text-center font-bold text-[0.95em] mb-2">表 {no}　{title}</figcaption>
    <div className="overflow-x-auto border-t-2 border-b-2 border-slate-900">
      <table className="w-full text-[0.85em] leading-relaxed">{children}</table>
    </div>
    {note && <div className="text-[0.78em] text-slate-600 mt-1.5 leading-relaxed">{note}</div>}
  </figure>
);
const Th = ({ children, left }: { children: React.ReactNode; left?: boolean }) => (
  <th className={`py-1.5 px-2 font-semibold border-b border-slate-900 ${left ? 'text-left' : 'text-center'} whitespace-nowrap`}>{children}</th>
);
const Td = ({ children, left, bold }: { children: React.ReactNode; left?: boolean; bold?: boolean }) => (
  <td className={`py-1 px-2 ${left ? 'text-left' : 'text-center font-mono tabular-nums'} ${bold ? 'font-bold' : ''} whitespace-nowrap`}>{children}</td>
);

export function ConferencePaper({ data }: { data: any | null }) {
  const ctx = { data } as any;
  const g = data?.gee;
  const mods = g?.models || {};
  const ex = mods.exchangeable?.rows || [];
  const r = (t: string) => ex.find((x: any) => x.term === t);
  const rows: any[] = data?.rows || [];
  const ds = g?.descriptives || {};
  const inter = r('Sales_growth X Positive');
  const pos = r('Positive');
  const neg = r('Negative');
  const peInter = r('PE_ratio X Positive');
  const improved = rows.filter((x) => (x.raw?.textAcc ?? 0) > (x.raw?.quantAcc ?? 0)).length;
  const best = rows.length ? rows.reduce((a, b) => ((b.raw?.textAcc ?? 0) > (a.raw?.textAcc ?? 0) ? b : a)) : null;
  const avgGain = rows.length ? rows.reduce((a, x) => a + ((x.raw?.textAcc ?? 0) - (x.raw?.quantAcc ?? 0)) * 100, 0) / rows.length : 0;
  const v = (t: string) => verdictFor(ctx, t);
  const consistency = (() => {
    const keys = ['Positive', 'Negative', 'Sales_growth X Positive'];
    const diff: string[] = [];
    keys.forEach((t) => {
      const vals = ['independence', 'ar1', 'exchangeable'].map((k) => mods[k]?.rows.find((x: any) => x.term === t)).filter(Boolean);
      const signs = vals.map((x: any) => Math.sign(x.coef));
      const sig = vals.map((x: any) => x.p < 0.05);
      if (!(signs.every((x) => x === signs[0]) && sig.every((x) => x === sig[0]))) diff.push(labelOf(t));
    });
    return { all: diff.length === 0, diff };
  })();
  const supported = (t: string, sign: 1 | -1) => {
    const x = r(t);
    if (!x) return '尚未計算';
    if (Math.sign(x.coef) === sign && x.p < 0.05) return '支持';
    if (Math.sign(x.coef) === sign) return '方向一致但不顯著';
    return x.p < 0.05 ? '不支持（方向相反且顯著）' : '不支持';
  };
  const h4 = !rows.length ? '尚未計算' : avgGain > 2 && best && (best.raw.textAcc * 100 - parseFloat(data.split.baselineAcc)) > 2 ? '部分支持' : '不支持';
  const periodTxt = data ? `${data.period.start} 至 ${data.period.end}` : '（尚未計算）';
  const modelKeys = ['independence', 'ar1', 'exchangeable'].filter((k) => mods[k]);
  const modelName: Record<string, string> = { independence: '獨立', ar1: 'AR(1)', exchangeable: '可交換' };

  return (
    <article className="text-slate-900 text-[15px] sm:text-[16px] leading-relaxed">
      {/* ── 題目與作者 ── */}
      <header className="text-center space-y-3 pb-6">
        <h1 className="text-[1.6em] sm:text-[1.8em] font-bold leading-snug">
          新聞情緒、財務指標與股票超額報酬：<br />Raman 等人（2022）混合方法研究之台股複製
        </h1>
        <div className="text-[1.02em] italic text-slate-700 leading-snug">
          News Sentiment, Financial Indicators, and Abnormal Stock Returns:<br />A Taiwan Replication of Raman et al. (2022)
        </div>
        <div className="pt-3 text-[0.95em]">
          <span className="border-b border-dashed border-slate-400 px-6 text-slate-400">作者姓名</span>
          <sup>1</sup>
        </div>
        <div className="text-[0.85em] text-slate-500"><sup>1</sup>服務單位／系所（請填寫）　電子郵件：（請填寫）</div>
      </header>

      {/* ── 中文摘要 ── */}
      <section className="border-t border-b border-slate-300 py-5 my-4">
        <h2 className="text-center font-bold mb-2">摘　要</h2>
        <P>
          網路新聞的大量出現，使投資人得以結合財務數字與文字資訊做出決策。Raman、Aljafari、Venkatesh 與 Richardson（2022）以美國 S&amp;P 500 企業為樣本，
          發現新聞情緒與財務指標對股票超額報酬具有直接與交互效果，且營收成長較高時正面情緒的效果減弱。本研究以相同的模型設定，
          在台灣股票市場進行複製研究，以檢驗其結論之可推廣性。
          {data ? (
            <>
              研究樣本為台灣 50 指數市值前 {data.stocks.length} 大成分股，期間為 {periodTxt}，自 FinMind 取得新聞 {n(data.articleCount)} 則及股價、月營收、
              本益比、股價淨值比與市值資料；新聞情緒以大型語言模型（{data.sentimentEngine}）判讀，並以廣義估計方程式（GEE）分析 {n(g?.n)} 筆個股—交易日觀測值。
              實證結果顯示，正面新聞情緒對新聞日後五日標準化累積超額報酬具顯著正向影響（β = {f3(pos?.coef)}，{pTxt(pos?.p)}）；
              營收成長率與正面情緒之交互作用為{(inter?.coef ?? 0) < 0 ? '負' : '正'}（β = {f3(inter?.coef)}，{pTxt(inter?.p)}），
              {(inter?.coef ?? 0) < 0 && (inter?.p ?? 1) < 0.05 ? '與原研究方向一致，支持「高預期下利多效果遞減」之論點' : '未能支持原研究之論點'}；
              負面情緒之係數為{(neg?.coef ?? 0) > 0 ? '正' : '負'}（β = {f3(neg?.coef)}），{(neg?.coef ?? 0) > 0 ? '與原研究方向相反' : '與原研究方向相同'}。
              在預測方面，以時間序列切分進行樣本外驗證後，加入情緒特徵之五種機器學習模型準確率介於
              {' '}{pct(Math.min(...rows.map((x) => x.raw?.textAcc ?? 1)))} 至 {pct(best?.raw?.textAcc)}，與多數類別基準（{data.split.baselineAcc}）相近，未重現原研究之大幅提升。
            </>
          ) : '（實證結果尚未計算。）'}
          本研究之結果顯示，原研究所提出之調節機制於新興市場具有一定之外部效度，但新聞情緒之直接效果與預測能力受市場結構與驗證方式影響。
        </P>
        <p className="mt-3 text-[0.95em]"><strong>關鍵詞：</strong>新聞情緒、超額報酬、廣義估計方程式、混合方法研究、複製研究</p>
      </section>

      {/* ── 英文摘要 ── */}
      <section className="border-b border-slate-300 pb-5 mb-4">
        <h2 className="text-center font-bold mb-2">Abstract</h2>
        <p className="text-justify leading-[1.9] my-2">
          Raman, Aljafari, Venkatesh, and Richardson (2022) show that news sentiment and financial indicators jointly explain abnormal stock returns among S&amp;P 500 firms,
          and that the effect of positive sentiment weakens when prior quantitative measures are high. This study replicates their design in the Taiwan stock market.
          {data ? (
            <>
              {' '}Using {n(data.articleCount)} news articles on the {data.stocks.length} largest constituents of the Taiwan 50 Index from {data.period.start} to {data.period.end},
              sentiment scored by a large language model, and generalized estimating equations on {n(g?.n)} firm-day observations, we find that positive sentiment is positively
              associated with five-day standardized cumulative abnormal returns (β = {f3(pos?.coef)}, {pTxt(pos?.p)}) and that the interaction between sales growth and positive
              sentiment is {(inter?.coef ?? 0) < 0 ? 'negative' : 'positive'} (β = {f3(inter?.coef)}, {pTxt(inter?.p)}). Out-of-sample classifiers with sentiment features achieve accuracies
              close to the majority-class baseline ({data.split.baselineAcc}).
            </>
          ) : ''}
          {' '}The moderating mechanism generalizes to an emerging market, whereas the direct effect of negative news and the predictive gains do not.
        </p>
        <p className="mt-3 text-[0.95em]"><strong>Keywords:</strong> news sentiment, abnormal returns, generalized estimating equations, mixed methods research, replication</p>
      </section>

      {/* ── 壹、緒論 ── */}
      <H1>壹、緒論</H1>
      <H2>一、研究背景與動機</H2>
      <P>
        傳統財務研究多以財務報表數字作為預測企業績效之主要依據。然而隨著網路新聞與預測分析技術的發展，投資人可即時取得大量文字資訊，
        財務數字以外之訊息對股價的影響日益受到重視（Tetlock, 2007; Huang, Zang, &amp; Zheng, 2014）。Raman 等人（2022）結合《華爾街日報》新聞情緒與
        Compustat 財務指標，以三階段架構（辨識、解釋、預測）分析 S&amp;P 500 企業之超額報酬，並將其定位為分析時代之混合方法研究範例。
      </P>
      <P>
        然而，該研究之樣本僅限於美國市場與 2013 至 2016 年，其結論是否適用於投資人結構、資訊揭露頻率與新聞生態皆不同之新興市場，尚待檢驗。
        台灣股票市場散戶交易比重較高，上市公司每月公告營收，財經新聞亦多以轉載與標題化方式傳播，為檢驗原研究外部效度之合適場域。
      </P>
      <H2>二、研究目的與研究問題</H2>
      <P>本研究以複製研究（replication study）之方式，在盡量維持原研究模型設定的前提下，以台灣股票市場資料回答以下問題：</P>
      <ol className="list-decimal pl-[3.5em] space-y-1 my-2 leading-[1.9]">
        <li>新聞正面與負面情緒，是否直接影響股票之超額報酬？</li>
        <li>新聞情緒之效果，是否受營收成長、本益比與股價淨值比等財務指標調節？</li>
        <li>加入新聞情緒後，機器學習模型對超額報酬方向之預測能力是否提升？</li>
      </ol>

      {/* ── 貳、文獻探討 ── */}
      <H1>貳、文獻探討與研究假說</H1>
      <H2>一、資訊理論與適應性市場假說</H2>
      <P>
        資訊理論（Shannon, 1948）指出，資訊之價值在於降低不確定性；適應性市場假說（Lo, 2004）則認為市場效率會隨環境與參與者而改變，
        過去之量化指標無法完全反映企業當下之狀態。兩者共同支持投資人需整合多元資訊來源，以評估企業未來績效（Raman et al., 2022）。
      </P>
      <H2>二、新聞情緒與股票報酬</H2>
      <P>
        Tetlock（2007）發現財經媒體之悲觀程度可預測市場報酬；Loughran 與 McDonald（2011）指出一般情緒詞典應用於財務文件時誤判比例偏高，
        因而建立財務專用情緒詞典。此外，行為財務文獻普遍發現投資人對負面資訊之反應強於正面資訊。據此提出：
      </P>
      <div className="pl-[2em] my-2 space-y-1">
        <p><strong>H1：</strong>新聞正面情緒與超額報酬呈正向關係。</p>
        <p><strong>H2：</strong>新聞負面情緒與超額報酬呈負向關係。</p>
      </div>
      <H2>三、財務指標之調節效果</H2>
      <P>
        當企業之營收成長已處於高水準時，市場對其未來表現之預期已反映於股價，額外之正面消息所能帶來之意外成分較小，
        正面情緒之邊際效果因而遞減（Raman et al., 2022）。據此提出：
      </P>
      <div className="pl-[2em] my-2"><p><strong>H3：</strong>營收成長率負向調節正面情緒與超額報酬之關係。</p></div>
      <H2>四、解釋與預測</H2>
      <P>
        Shmueli 與 Koppius（2011）主張解釋性模型與預測性模型應分別評估。原研究發現加入情緒特徵後，各分類演算法之準確率與 AUC 均大幅提升。據此提出：
      </P>
      <div className="pl-[2em] my-2"><p><strong>H4：</strong>加入新聞情緒特徵，可提升機器學習模型對超額報酬方向之樣本外預測能力。</p></div>
      <H2>五、混合方法研究之定位</H2>
      <P>
        Johnson、Onwuegbuzie 與 Turner（2007）將混合方法研究定義為結合質性與量化研究元素之研究取向。原研究將新聞文字量化為情緒指標後與財務資料整合，
        屬 Creswell 與 Plano Clark（2018）所稱收斂設計之資料轉換變體。惟依 Fetters、Curry 與 Creswell（2013）之整合層次觀點，
        其文字資料未經詮釋性質性分析，亦缺乏詮釋層面之整合，故是否屬嚴格意義之混合方法研究仍有討論空間。
        Sandelowski、Voils 與 Knafl（2009）指出，將質性資料轉為數字（quantitizing）雖為混合方法之常見技術，但轉換過程涉及研究者之判斷，並非中立之計數；
        原研究以詞典計算正、負面詞頻，正屬此類轉換，卻未說明轉換所依據之詮釋判斷。
        就財金領域之文字研究脈絡而言，此類將文字轉為變數、再納入計量或預測模型之做法，通常歸為計算文本分析（Gentzkow, Kelly, &amp; Taddy, 2019; Loughran &amp; McDonald, 2016）。
        若要成為整合質性詮釋之研究，資訊系統領域已提出計算密集之理論建構途徑，強調以計算方法偵測模式後，由研究者回到原始資料詮釋與精煉，再以計算方法確認
        （Berente, Seidel, &amp; Safadi, 2019; Miranda et al., 2022; Nelson, 2020）。本研究沿用原研究之設計，定位為以文字為資料之計算文本分析，並於結論中討論此限制。
      </P>

      {/* ── 參、研究方法 ── */}
      <H1>參、研究方法</H1>
      <H2>一、樣本與資料來源</H2>
      <P>
        {data ? (
          <>本研究以台灣 50 指數市值前 {data.stocks.length} 大成分股為樣本（{data.stocks.map((s: any) => `${s.name}（${s.id}）`).join('、')}），
          研究期間為 {periodTxt}。新聞、股價、月營收、本益比、股價淨值比與市值資料均取自 FinMind 開放資料平台，並以元大台灣 50 ETF（0050）作為市場基準。
          新聞資料逐日逐股查詢，共取得 {n(data.articleCount)} 則；為避免少數事件日之新聞數量主導結果，每檔股票每日最多保留 {data.maxPerDay} 則。</>
        ) : '樣本資料尚未計算。'}
      </P>
      <H2>二、變數定義</H2>
      <TableBox no={1} title="變數定義與操作化" note="註：原研究之情緒變數為 Loughran-McDonald 詞典之正、負面詞占全文字數比例；本研究以當日正、負面新聞則數比例衡量，兩者單位不同，係數大小不宜直接比較。">
        <thead><tr><Th left>變數</Th><Th left>原研究（Raman et al., 2022）</Th><Th left>本研究</Th></tr></thead>
        <tbody>
          {[
            ['SCAR', '標準化累積超額報酬', '新聞日後 5 個交易日相對 0050 之買入持有超額報酬，除以 60 日超額報酬標準差 × √5（式 1–2）'],
            ['Positive / Negative', 'LM 詞典正、負面詞比例', '當日判讀為正面（分數 > 0.15）、負面（< −0.15）之新聞則數比例（式 3）'],
            ['Sales_growth', '年度營收年增率', '最近已公告月營收之年增率（第 m 月營收視為次月 10 日後可得）'],
            ['PE_ratio', '市值 ÷ 淨利', '每日本益比'],
            ['MB_ratio', '市值 ÷ 股東權益', '每日股價淨值比'],
            ['Size', '市值', '市值取自然對數'],
            ['Prior_SCAR', '前期 SCAR', '新聞日前 5 個交易日之標準化超額報酬'],
          ].map(([a, b, c]) => (
            <tr key={a} className="align-top"><Td left bold>{a}</Td><td className="py-1 px-2">{b}</td><td className="py-1 px-2">{c}</td></tr>
          ))}
        </tbody>
      </TableBox>
      <P>
        依變數之計算如下。令 <MathRenderer math={'P_{i,t}'} showCopy={false} /> 為股票 <MathRenderer math={'i'} showCopy={false} /> 於交易日 <MathRenderer math={'t'} showCopy={false} /> 之收盤價，
        <MathRenderer math={'B_t'} showCopy={false} /> 為 0050 收盤價，<MathRenderer math={'t'} showCopy={false} /> 為新聞所對應之交易日，<MathRenderer math={'h = 5'} showCopy={false} />。
        新聞日後 <MathRenderer math={'h'} showCopy={false} /> 日之累積超額報酬採買入持有形式：
      </P>
      <Eq no={1} tex={'CAR_{i,t}^{(h)} = \\left(\\frac{P_{i,t+h}}{P_{i,t}} - 1\\right) - \\left(\\frac{B_{t+h}}{B_{t}} - 1\\right)'} />
      <P>
        再以個股超額報酬之波動度標準化。令每日超額報酬 <MathRenderer math={'e_{i,t} = r_{i,t} - r_{B,t}'} showCopy={false} />，
        <MathRenderer math={'\\sigma_{i,t}'} showCopy={false} /> 為截至 <MathRenderer math={'t'} showCopy={false} /> 日之前 60 個交易日 <MathRenderer math={'e_{i,t}'} showCopy={false} /> 之標準差（至少需 40 個觀測值），則
      </P>
      <Eq no={2} tex={'SCAR_{i,t} = \\frac{CAR_{i,t}^{(h)}}{\\sigma_{i,t}\\sqrt{h}}'} />
      <P>
        乘以 <MathRenderer math={'\\sqrt{h}'} showCopy={false} /> 係將日波動度換算為 <MathRenderer math={'h'} showCopy={false} /> 日波動度（假設每日超額報酬獨立且變異數相同），
        使 SCAR 成為無單位之標準化數值，波動度不同之個股可置於同一模型比較。Prior_SCAR 以相同方式計算新聞日前 5 個交易日（<MathRenderer math={'t-5'} showCopy={false} /> 至 <MathRenderer math={'t'} showCopy={false} />）之超額報酬。
        由於 SCAR 自 <MathRenderer math={'t'} showCopy={false} /> 日收盤起算，新聞當日盤中之價格反應不包含在 SCAR 內，而反映於 Prior_SCAR。
      </P>
      <H2>三、情緒衡量</H2>
      <P>
        由於中文缺乏與 Loughran-McDonald 詞典對應之公認金融情緒詞典，本研究以大型語言模型{data ? `（${data.sentimentEngine}）` : ''}判讀每則新聞標題，
        給予 −1 至 +1 之情緒分數（正面為正、負面為負、中性為 0）。判讀時溫度參數設為 0.1，每次送出 80 則標題，並將結果依標題快取，同一標題不重複判讀；
        若 API 呼叫失敗，該批改以關鍵詞詞典評分，失敗則數記錄於執行紀錄。
        {data ? `全樣本中正面新聞約占 ${pct(data.sentimentShare?.positive)}，負面新聞約占 ${pct(data.sentimentShare?.negative)}。` : ''}
      </P>
      <P>
        新聞依發布日期對應至「當日或其後第一個交易日」，例如週末之新聞對應至下週一。令 <MathRenderer math={'N_{i,t}'} showCopy={false} /> 為股票 <MathRenderer math={'i'} showCopy={false} /> 於交易日 <MathRenderer math={'t'} showCopy={false} /> 之新聞則數，
        <MathRenderer math={'s_k'} showCopy={false} /> 為第 <MathRenderer math={'k'} showCopy={false} /> 則新聞之情緒分數，則
      </P>
      <Eq no={3} tex={'Pos_{i,t} = \\frac{1}{N_{i,t}}\\sum_{k=1}^{N_{i,t}} \\mathbf{1}(s_k > 0.15), \\qquad Neg_{i,t} = \\frac{1}{N_{i,t}}\\sum_{k=1}^{N_{i,t}} \\mathbf{1}(s_k < -0.15)'} />
      <P>
        分數介於 −0.15 與 0.15 之新聞視為中性，因此 <MathRenderer math={'Pos + Neg \\le 1'} showCopy={false} />。
        <MathRenderer math={'N_{i,t} = 0'} showCopy={false} /> 之交易日（無新聞）不列入樣本，亦即本研究為「個股—新聞交易日」之事件樣本，而非全部交易日之面板；
        因此結果解釋為「有新聞之交易日」情緒與其後報酬之關係。本研究以新聞日期對應交易日，未依發布時點區分盤中與盤後新聞。
      </P>
      <H2>四、實證模型</H2>
      <P>本研究沿用原研究之模型設定，以廣義估計方程式估計下列模型：</P>
      <Eq no={4} tex={'\\begin{aligned} SCAR_{it} ={}& \\beta_0 + \\beta_1 Prior\\_SCAR_{it} + \\beta_2 Size_{it} + \\beta_3 Pos_{it} + \\beta_4 Neg_{it} \\\\ &+ \\beta_5 PE_{it} + \\beta_6 SG_{it} + \\beta_7 MB_{it} + \\sum_{F}\\sum_{S} \\gamma_{FS}\\,(F_{it} \\times S_{it}) + \\varepsilon_{it} \\end{aligned}'} />
      <P>
        其中 <MathRenderer math={'F \\in \\{PE, SG, MB\\}'} showCopy={false} />，<MathRenderer math={'S \\in \\{Pos, Neg\\}'} showCopy={false} />，共六個交互作用項；
        所有解釋變數均先進行平均數中心化，交互作用項以中心化後之變數相乘；本益比、股價淨值比、營收成長率、SCAR 與 Prior_SCAR 於 1% 與 99% 分位數進行縮尾處理。
        GEE（Liang &amp; Zeger, 1986）採高斯分配與恆等連結函數（identity link），以個股為群組、依交易日排序，
        分別設定獨立（Independence）、一階自我相關（AR(1)）與可交換（Exchangeable）三種工作相關矩陣，並以 QIC（Pan, 2001）比較模型配適。
        標準誤一律採穩健（sandwich）估計，即使工作相關矩陣設定錯誤，係數之推論仍具一致性；惟群組僅 {data ? data.stocks.length : 10} 檔，穩健標準誤在少群組下可能低估，解讀顯著性時宜保守。
        依 H3，預期 <MathRenderer math={'\\gamma_{SG \\times Pos} < 0'} showCopy={false} />。
      </P>
      <H2>五、預測模型與驗證</H2>
      <P>
        預測目標為新聞日後五日之 SCAR 是否為正。本研究比較梯度提升樹、隨機森林、邏輯迴歸、神經網路與支持向量機五種演算法，
        分別以「僅財務特徵」與「財務加情緒特徵」訓練。為避免前視偏誤，樣本依時間切分：
        {data ? `訓練期為 ${data.split.trainStart} 至 ${data.split.trainEnd}（${n(data.split.trainN)} 筆），測試期為 ${data.split.testStart} 至 ${data.split.testEnd}（${n(data.split.testN)} 筆），` : ''}
        切點為全部交易日之第 70 百分位，兩者間保留五個交易日之間隔，避免訓練期最後幾筆之標籤用到測試期股價。
      </P>
      <P>
        標籤定義為 <MathRenderer math={'y_{i,t} = \\mathbf{1}(SCAR_{i,t} > 0)'} showCopy={false} />。僅財務特徵包括 Prior_SCAR、Size、PE、SG 與 MB；
        財務加情緒特徵另加入 Pos、Neg、當日平均情緒分數與新聞則數。模型輸出之預測機率 <MathRenderer math={'\\hat{p}'} showCopy={false} /> 以 0.5 為門檻，
        於測試集（<MathRenderer math={'n'} showCopy={false} /> 筆）計算準確率，並與多數類別基準比較：
      </P>
      <Eq no={5} tex={'Acc = \\frac{1}{n}\\sum_{j=1}^{n} \\mathbf{1}(\\hat{y}_j = y_j), \\qquad Acc_{base} = \\max(\\bar{y},\\, 1 - \\bar{y})'} />
      <P>
        其中 <MathRenderer math={'\\bar{y}'} showCopy={false} /> 為測試集中 SCAR 為正之比例。另報告 AUC，以衡量不受門檻影響之排序能力。
        比較同一演算法「僅財務」與「財務加情緒」兩組預測時，因兩者在同一測試樣本上預測，屬成對資料，故採 McNemar 精確檢定（McNemar, 1947; Dietterich, 1998）：
        令 <MathRenderer math={'b'} showCopy={false} /> 為僅財務模型答對而加情緒模型答錯之筆數，<MathRenderer math={'c'} showCopy={false} /> 為相反情形，
        虛無假設下 <MathRenderer math={'b \\sim \\text{Binomial}(b + c,\\, 0.5)'} showCopy={false} />，
      </P>
      <Eq no={6} tex={'p = \\min\\!\\left(1,\\; 2\\sum_{k=0}^{\\min(b,c)} \\binom{b+c}{k} 0.5^{\\,b+c}\\right)'} />
      <P>
        各演算法之超參數列於附錄表 A1，均未另行調參，以避免在小樣本下過度擬合測試期；隨機種子固定為 42。
      </P>

      {/* ── 肆、實證結果 ── */}
      <H1>肆、實證結果</H1>
      <H2>一、敘述統計</H2>
      {g ? (
        <TableBox no={2} title="主要變數敘述統計" note={`註：N = ${n(g.n)}（${g.firms} 檔股票）。SCAR 已依個股波動標準化。`}>
          <thead><tr><Th left>變數</Th><Th>平均數</Th><Th>標準差</Th></tr></thead>
          <tbody>
            {Object.entries(ds).map(([k, x]: any) => (
              <tr key={k}><Td left>{LABEL[k] ? `${LABEL[k]}（${k}）` : k}</Td><Td>{f3(x.mean)}</Td><Td>{f3(x.sd)}</Td></tr>
            ))}
          </tbody>
        </TableBox>
      ) : <P>（尚未計算）</P>}
      <P>
        {g ? `SCAR 之平均數為 ${f3(ds.SCAR?.mean)}、標準差為 ${f3(ds.SCAR?.sd)}，符合標準化後之預期。正面情緒比例平均為 ${f3(ds.Positive?.mean)}，明顯高於負面情緒之 ${f3(ds.Negative?.mean)}，顯示財經新聞整體偏向正面報導；樣本公司之本益比平均約 ${Number(ds.PE_ratio?.mean ?? 0).toFixed(1)} 倍，反映研究期間市場對大型權值股之高度期待。` : ''}
      </P>

      <H2>二、GEE 估計結果</H2>
      {g ? (
        <TableBox no={3} title="新聞情緒、財務指標與 SCAR 之 GEE 估計結果"
          note={<>註：括號內為穩健標準誤。+ p &lt; .10，* p &lt; .05，** p &lt; .01，*** p &lt; .001。原研究欄位取自 Raman 等人（2022）表 2 之可交換結構模型，係數單位與本研究不同，僅比較方向與顯著性。</>}>
          <thead>
            <tr><Th left>變數</Th>{modelKeys.map((k) => <Th key={k}>台股：{modelName[k]}</Th>)}<Th>原研究（可交換）</Th></tr>
          </thead>
          <tbody>
            {TERMS.map((t) => (
              <tr key={t} className={t === 'Sales_growth X Positive' ? 'bg-slate-100' : ''}>
                <Td left>{labelOf(t)}</Td>
                {modelKeys.map((k) => <Td key={k}>{mods[k].rows.find((x: any) => x.term === t)?.display ?? '—'}</Td>)}
                <Td>{paperCell(t)}</Td>
              </tr>
            ))}
            <tr className="border-t border-slate-400"><Td left>QIC</Td>{modelKeys.map((k) => <Td key={k}>{Number(mods[k].qic).toFixed(1)}</Td>)}<Td>{paperCell('Goodness of Fit', 3)}</Td></tr>
            <tr><Td left>觀測值</Td>{modelKeys.map((k) => <Td key={k}>{n(g.n)}</Td>)}<Td>—</Td></tr>
          </tbody>
        </TableBox>
      ) : <P>（尚未計算）</P>}
      {g && (
        <>
          <P>
            表 3 以可交換結構為主要模型（與原研究相同）。{consistency.all
              ? '三種工作相關結構之主要係數方向一致，顯示結論不受相關結構假設影響。'
              : `獨立與可交換結構之主要係數方向一致，但 AR(1) 結構下${consistency.diff.join('、')}之方向或顯著性不同，顯示部分結果對相關結構設定具敏感性，解讀時宜保守；此點與原研究三種結構結果幾乎相同之情形有所差異。`}正面情緒之係數為 {pos?.display}，達統計顯著，
            表示正面新聞比例較高之交易日，其後五日之超額報酬較高，{supported('Positive', 1) === '支持' ? 'H1 獲得支持' : 'H1 未獲支持'}。
            負面情緒之係數為 {neg?.display}，
            {(neg?.coef ?? 0) > 0 ? '方向與預期相反，H2 未獲支持。可能原因在於台股對負面消息反應迅速，股價於新聞當日即已調整，其後五日反而出現反彈；此外，大型權值股之負面新聞多屬短期事件，市場隨即回歸基本面評價。' : `${supported('Negative', -1) === '支持' ? 'H2 獲得支持' : 'H2 未獲支持'}。`}
          </P>
          <P>
            就調節效果而言，營收成長率與正面情緒之交互作用為 {inter?.display}（{pTxt(inter?.p)}），
            {(inter?.coef ?? 0) < 0 && (inter?.p ?? 1) < 0.05
              ? '表示營收成長越高之企業，正面新聞所帶來之超額報酬越小，H3 獲得支持，與原研究之發現一致。'
              : 'H3 未獲支持。'}
            {peInter && (peInter.coef < 0 && peInter.p < 0.05)
              ? `此外，本益比與正面情緒之交互作用亦顯著為負（${peInter.display}），顯示市場預期較高之企業，正面消息之邊際效果亦較小，與營收成長之調節效果形成一致之解釋。`
              : ''}
            以原研究為基準，各係數之比較結果彙整於表 5。
          </P>
        </>
      )}

      <H2>三、預測結果</H2>
      {rows.length > 0 ? (
        <TableBox no={4} title="樣本外分類預測結果"
          note={<>註：測試期 {n(data.split.testN)} 筆；多數類別基準準確率為 {data.split.baselineAcc}。原研究採 60%／40% 切分，但未說明是否依時間切分（Raman et al., 2022，表 7–8）；本研究採時間序列切分。McNemar 欄括號內為 b／c（僅財務答對／僅加情緒答對之筆數），檢定兩組特徵之準確率差異（式 6）。</>}>
          <thead>
            <tr><Th left>演算法</Th><Th>準確率（財務）</Th><Th>準確率（財務＋情緒）</Th><Th>AUC（財務）</Th><Th>AUC（財務＋情緒）</Th><Th>McNemar <i>p</i></Th></tr>
          </thead>
          <tbody>
            {rows.map((x) => (
              <tr key={x.algorithm}>
                <Td left>{x.algorithm.replace(/ \(.*\)/, '')}</Td>
                <Td>{x.quantOnlyAcc}</Td><Td>{x.quantTextAcc}</Td><Td>{x.quantOnlyAuc}</Td><Td>{x.quantTextAuc}</Td><Td>{x.mcnemar ? `${x.mcnemar.p < 0.001 ? '< .001' : x.mcnemar.p.toFixed(3).replace(/^0/, '')}（${x.mcnemar.b}／${x.mcnemar.c}）` : '—'}</Td>
              </tr>
            ))}
          </tbody>
        </TableBox>
      ) : <P>（尚未計算）</P>}
      {rows.length > 0 && (
        <P>
          表 4 顯示，加入情緒特徵後，五種演算法中有 {improved} 種準確率上升，平均變化 {avgGain >= 0 ? '+' : ''}{avgGain.toFixed(1)} 個百分點；
          表現最佳之 {best?.algorithm.replace(/ \(.*\)/, '')} 準確率為 {best?.quantTextAcc}、AUC 為 {best?.quantTextAuc}，與多數類別基準相近。
          {rows.some((x) => x.mcnemar) && (() => {
            const sigUp = rows.filter((x) => x.mcnemar && x.mcnemar.p < 0.05 && x.mcnemar.c > x.mcnemar.b);
            const sigDown = rows.filter((x) => x.mcnemar && x.mcnemar.p < 0.05 && x.mcnemar.b > x.mcnemar.c);
            const nm = (x: any) => `${x.algorithm.replace(/ \(.*\)/, '')}（p = ${x.mcnemar.p.toFixed(3).replace(/^0/, '')}）`;
            return <>McNemar 檢定顯示，{sigUp.length ? `${sigUp.map(nm).join('、')}加入情緒後準確率顯著提升` : '沒有任何演算法因加入情緒特徵而顯著提升準確率'}；
              {sigDown.length ? `${sigDown.map(nm).join('、')}加入情緒後反而顯著下降，顯示在樣本有限時額外特徵可能造成過度擬合。` : '亦無演算法顯著下降。'}</>;
          })()}
          H4 {h4 === '不支持' ? '未獲支持' : '僅獲部分支持'}。此結果與原研究準確率大幅提升之發現不同，推測原因包括：
          本研究採時間序列切分以避免資訊洩漏、僅使用新聞標題而非全文，以及台股價格對公開資訊之反應速度較快。
          值得注意的是，GEE 顯示情緒與報酬之平均關係顯著，但此關係不足以準確預測個別事件之報酬方向，兩者並不矛盾。
        </P>
      )}

      <H2>四、與原研究之比較</H2>
      <TableBox no={5} title="研究假說檢定結果與原研究比較" note="註：比較判定依係數方向與 5% 顯著水準：同號且顯著為「一致」，同號不顯著為「方向相同但不顯著」，異號不顯著為「方向相反但不顯著」，異號且顯著為「相反」。">
        <thead><tr><Th left>假說</Th><Th left>檢定變數</Th><Th>本研究結果</Th><Th>與原研究比較</Th></tr></thead>
        <tbody>
          <tr><Td left bold>H1</Td><td className="py-1 px-2">正面情緒</td><Td>{supported('Positive', 1)}</Td><Td>{v('Positive')}</Td></tr>
          <tr><Td left bold>H2</Td><td className="py-1 px-2">負面情緒</td><Td>{supported('Negative', -1)}</Td><Td>{v('Negative')}</Td></tr>
          <tr><Td left bold>H3</Td><td className="py-1 px-2">營收成長率 × 正面情緒</td><Td>{supported('Sales_growth X Positive', -1)}</Td><Td>{v('Sales_growth X Positive')}</Td></tr>
          <tr><Td left bold>H4</Td><td className="py-1 px-2">情緒特徵之預測增益</td><Td>{h4}</Td><Td>{h4 === '不支持' ? '未重現' : '部分重現'}</Td></tr>
        </tbody>
      </TableBox>

      {/* ── 伍、結論與建議 ── */}
      <H1>伍、結論與建議</H1>
      <H2>一、研究結論</H2>
      <P>
        本研究以台灣股票市場複製 Raman 等人（2022）之研究。結果顯示，原研究最核心之調節機制——企業營收成長較高時，正面新聞之效果遞減——
        {(inter?.coef ?? 0) < 0 && (inter?.p ?? 1) < 0.05 ? (consistency.all ? '於台股同樣成立' : '在可交換與獨立結構下於台股同樣成立（AR(1) 結構下不顯著）') : '於台股未獲充分支持'}；
        然而負面情緒之直接效果{(neg?.coef ?? 0) > 0 ? '與原研究方向相反' : '與原研究方向一致'}，
        且新聞情緒對樣本外報酬方向之預測增益{h4 === '不支持' ? '未能重現' : '僅部分重現'}。
        整體而言，「預期越高、利多越被吸收」之機制具有跨市場之一致性，而新聞情緒之直接效果與預測能力則較依賴市場結構、資料型態與驗證方式。
      </P>
      <H2>二、理論與實務意涵</H2>
      <P>
        在理論上，本研究提供原研究調節機制於新興市場之外部效度證據，並顯示解釋性模型之顯著結果不必然轉化為預測能力，呼應 Shmueli 與 Koppius（2011）
        對解釋與預測應分別評估之主張。在實務上，投資人於高成長或高評價企業之利多新聞密集時，宜留意其邊際效果遞減之可能；
        研究者在評估文字特徵之預測價值時，亦應採用時間序列切分並報告基準準確率，以避免高估模型效能。
      </P>
      <H2>三、研究限制與未來研究方向</H2>
      <P>
        本研究具有下列限制：第一，情緒衡量以新聞標題與大型語言模型判讀為基礎，與原研究以全文及詞典衡量之方式不同。
        既有研究顯示，語言模型之財金情緒分類表現可優於 Loughran-McDonald 詞典（Huang, Wang, &amp; Yang, 2023），
        但大型語言模型之分類與人工標註僅具一定程度之一致性，宜作為人工編碼之輔助而非取代（Ziems et al., 2024）；本研究尚未以人工標註樣本檢驗判讀之信度，此為後續應補強之處；第二，研究期間約一年，
        且樣本集中於大型權值股，結論未必適用於中小型企業或其他市場狀態；第三，五日事件窗口相互重疊，殘差可能存在自我相關，GEE 僅能部分處理，且部分係數在不同工作相關結構下並不穩定；
        第四，本研究與原研究相同，未對新聞文字進行詮釋性之質性分析，嚴格而言較接近以文字為資料之量化研究。
        未來研究可延長研究期間並擴大樣本、納入三大法人買賣超與社群情緒等台灣市場特有變數，並參考計算紮根理論（Nelson, 2020）之程序，
        針對極端報酬事件之新聞全文進行主題編碼，以詮釋性質性分析回頭解釋量化結果，使研究成為較完整之混合方法設計。
      </P>

      {/* ── 參考文獻 ── */}
      <H1>參考文獻</H1>
      <div className="text-[0.9em] space-y-1.5 pl-[2em] -indent-[2em] leading-[1.8]">
        <p>Berente, N., Seidel, S., &amp; Safadi, H. (2019). Research commentary—Data-driven computationally intensive theory development. <em>Information Systems Research, 30</em>(1), 50–64. https://doi.org/10.1287/isre.2018.0774</p>
        <p>Breiman, L. (2001). Random forests. <em>Machine Learning, 45</em>(1), 5–32.</p>
        <p>Cortes, C., &amp; Vapnik, V. (1995). Support-vector networks. <em>Machine Learning, 20</em>(3), 273–297.</p>
        <p>Creswell, J. W., &amp; Plano Clark, V. L. (2018). <em>Designing and conducting mixed methods research</em> (3rd ed.). SAGE.</p>
        <p>Dietterich, T. G. (1998). Approximate statistical tests for comparing supervised classification learning algorithms. <em>Neural Computation, 10</em>(7), 1895–1923.</p>
        <p>Fetters, M. D., Curry, L. A., &amp; Creswell, J. W. (2013). Achieving integration in mixed methods designs—Principles and practices. <em>Health Services Research, 48</em>(6pt2), 2134–2156.</p>
        <p>Friedman, J. H. (2001). Greedy function approximation: A gradient boosting machine. <em>The Annals of Statistics, 29</em>(5), 1189–1232.</p>
        <p>Gentzkow, M., Kelly, B., &amp; Taddy, M. (2019). Text as data. <em>Journal of Economic Literature, 57</em>(3), 535–574. https://doi.org/10.1257/jel.20181020</p>
        <p>Huang, A. H., Wang, H., &amp; Yang, Y. (2023). FinBERT: A large language model for extracting information from financial text. <em>Contemporary Accounting Research, 40</em>(2), 806–841. https://doi.org/10.1111/1911-3846.12832</p>
        <p>Huang, A. H., Zang, A. Y., &amp; Zheng, R. (2014). Evidence on the information content of text in analyst reports. <em>The Accounting Review, 89</em>(6), 2151–2180.</p>
        <p>Johnson, R. B., Onwuegbuzie, A. J., &amp; Turner, L. A. (2007). Toward a definition of mixed methods research. <em>Journal of Mixed Methods Research, 1</em>(2), 112–133.</p>
        <p>Liang, K.-Y., &amp; Zeger, S. L. (1986). Longitudinal data analysis using generalized linear models. <em>Biometrika, 73</em>(1), 13–22.</p>
        <p>Lo, A. W. (2004). The adaptive markets hypothesis. <em>The Journal of Portfolio Management, 30</em>(5), 15–29.</p>
        <p>Loughran, T., &amp; McDonald, B. (2011). When is a liability not a liability? Textual analysis, dictionaries, and 10-Ks. <em>The Journal of Finance, 66</em>(1), 35–65.</p>
        <p>Loughran, T., &amp; McDonald, B. (2016). Textual analysis in accounting and finance: A survey. <em>Journal of Accounting Research, 54</em>(4), 1187–1230. https://doi.org/10.1111/1475-679X.12123</p>
        <p>McNemar, Q. (1947). Note on the sampling error of the difference between correlated proportions or percentages. <em>Psychometrika, 12</em>(2), 153–157.</p>
        <p>Miranda, S., Berente, N., Seidel, S., Safadi, H., &amp; Burton-Jones, A. (2022). Editor's comments: Computationally intensive theory construction: A primer for authors and reviewers. <em>MIS Quarterly, 46</em>(2), iii–xviii.</p>
        <p>Nelson, L. K. (2020). Computational grounded theory: A methodological framework. <em>Sociological Methods &amp; Research, 49</em>(1), 3–42. https://doi.org/10.1177/0049124117729703</p>
        <p>Pan, W. (2001). Akaike's information criterion in generalized estimating equations. <em>Biometrics, 57</em>(1), 120–125.</p>
        <p>Pedregosa, F., Varoquaux, G., Gramfort, A., Michel, V., Thirion, B., Grisel, O., … Duchesnay, É. (2011). Scikit-learn: Machine learning in Python. <em>Journal of Machine Learning Research, 12</em>, 2825–2830.</p>
        <p>Raman, R., Aljafari, R., Venkatesh, V., &amp; Richardson, V. (2022). Mixed-methods research in the age of analytics, an exemplar leveraging sentiments from news articles to predict firm performance. <em>International Journal of Information Management, 64</em>, 102451. https://doi.org/10.1016/j.ijinfomgt.2021.102451</p>
        <p>Sandelowski, M., Voils, C. I., &amp; Knafl, G. (2009). On quantitizing. <em>Journal of Mixed Methods Research, 3</em>(3), 208–222. https://doi.org/10.1177/1558689809334210</p>
        <p>Shannon, C. E. (1948). A mathematical theory of communication. <em>Bell System Technical Journal, 27</em>(3), 379–423.</p>
        <p>Shmueli, G., &amp; Koppius, O. R. (2011). Predictive analytics in information systems research. <em>MIS Quarterly, 35</em>(3), 553–572.</p>
        <p>Tetlock, P. C. (2007). Giving content to investor sentiment: The role of media in the stock market. <em>The Journal of Finance, 62</em>(3), 1139–1168.</p>
        <p>Venkatesh, V., Brown, S. A., &amp; Bala, H. (2013). Bridging the qualitative–quantitative divide: Guidelines for conducting mixed methods research in information systems. <em>MIS Quarterly, 37</em>(1), 21–54.</p>
        <p>Ziems, C., Held, W., Shaikh, O., Chen, J., Zhang, Z., &amp; Yang, D. (2024). Can large language models transform computational social science? <em>Computational Linguistics, 50</em>(1), 237–291. https://doi.org/10.1162/coli_a_00502</p>
      </div>

      {/* ── 附錄 ── */}
      <H1>附錄</H1>
      <TableBox no="A1" title="預測模型之演算法與超參數" note="註：以 scikit-learn（Pedregosa et al., 2011）實作；未列出之參數均為該套件預設值。標準化指以訓練集之平均數與標準差將特徵轉為 z 分數，測試集沿用訓練集之參數。">
        <thead><tr><Th left>演算法</Th><Th left>主要超參數</Th><Th left>前處理</Th><Th left>文獻</Th></tr></thead>
        <tbody>
          {[
            ['梯度提升樹', '100 棵樹、學習率 0.1、最大深度 3', '無', 'Friedman (2001)'],
            ['隨機森林', '300 棵樹、葉節點最少 5 筆、每次分裂隨機取「特徵數平方根」個特徵', '無', 'Breiman (2001)'],
            ['邏輯迴歸', 'L2 正則化（C = 1）、最多 2,000 次迭代', '標準化', '—'],
            ['神經網路（多層感知器）', '兩層隱藏層 32、16 個節點，ReLU，Adam；提前停止（保留 10% 訓練資料驗證）', '標準化', '—'],
            ['支持向量機', 'RBF 核、C = 1；以三折交叉驗證之 Platt 校準輸出機率', '標準化', 'Cortes & Vapnik (1995)'],
          ].map(([a, b, c, d]) => (
            <tr key={a} className="align-top"><Td left bold>{a}</Td><td className="py-1 px-2">{b}</td><td className="py-1 px-2">{c}</td><td className="py-1 px-2">{d}</td></tr>
          ))}
        </tbody>
      </TableBox>

      <p className="mt-10 pt-3 border-t border-slate-300 text-[0.75em] text-slate-500">
        資料來源：FinMind 開放資料平台；實證數字計算時間 {String(data?.generatedAt || '—').replace('T', ' ')}。原研究數字取自本平台論文翻譯之表 2 與表 7–8，正式發表前請以原文核對。
      </p>
    </article>
  );
}
