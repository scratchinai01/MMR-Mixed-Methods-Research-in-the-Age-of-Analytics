import { PAPER_TABLES } from '../data/paperContent.ts';
import { verdictFor } from '../data/thesisDeck.tsx';

// =====================================================================
// 書面報告正文：與「簡報模式」同一份資料
// - 原著數字：本平台論文翻譯的表 2（Model 3, Exchangeable）
// - 台股數字：public/data/ml_results.json（news_ml_study.py 真實計算）
// 尚未計算時顯示「尚未計算」，不放任何示範數字。
// =====================================================================

const TERMS = [
  'Prior_SCAR', 'Size', 'Positive', 'Negative', 'PE_ratio', 'Sales_growth', 'MB_ratio',
  'PE_ratio X Positive', 'Sales_growth X Positive', 'MB_ratio X Positive',
  'PE_ratio X Negative', 'Sales_growth X Negative', 'MB_ratio X Negative',
];

const paperCell = (term: string) => {
  const t2 = PAPER_TABLES.find((t) => t.id === 'table-2');
  const row = t2?.rows.find((r) => {
    const name = String(r[0]).split(' (')[0].trim();
    return name === term;
  });
  return row ? String(row[3]) : '—';
};

const P = ({ children }: { children: React.ReactNode }) => (
  <p className="text-xs sm:text-sm text-slate-800 leading-relaxed text-justify indent-6">{children}</p>
);
const H2 = ({ children }: { children: React.ReactNode }) => (
  <h2 className="text-lg sm:text-xl font-bold text-slate-950 border-b border-slate-300 pb-2">{children}</h2>
);

export function ManuscriptBody({ data }: { data: any | null }) {
  const ctx = { data };
  const ex = data?.gee?.models?.exchangeable?.rows || [];
  const our = (t: string) => ex.find((r: any) => r.term === t);
  const inter = our('Sales_growth X Positive');
  const rows: any[] = data?.rows || [];
  const n = (x?: number) => (x ?? 0).toLocaleString();
  const pct = (x?: number) => `${Math.round((x ?? 0) * 100)}%`;
  const sigNote = (r: any) => (!r ? '尚未計算' : r.p < 0.05 ? `p = ${r.p < 0.001 ? '< .001' : r.p.toFixed(3)}` : `p = ${r.p.toFixed(3)}（不顯著）`);
  const improved = rows.filter((r) => (r.raw?.textAcc ?? 0) > (r.raw?.quantAcc ?? 0)).length;

  return (
    <>
      {/* 摘要 */}
      <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
        <div className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono">摘要 (Abstract)</div>
        <P>
          本報告分為兩部分。第一部分精讀 Raman, Aljafari, Venkatesh 與 Richardson（2022）發表於 <em>International Journal of Information Management</em> 的研究：
          作者以 S&amp;P 500 企業的財務指標結合《華爾街日報》新聞情緒，透過 GEE 與機器學習解釋並預測標準化累積異常報酬（SCAR）。
          第二部分以 FinMind 真實資料在台股復刻其核心模型
          {data ? (
            <>：期間 {data.period?.start} 至 {data.period?.end}，涵蓋 {data.stocks?.length} 檔權值股、{n(data.articleCount)} 則新聞，
              以 {data.sentimentEngine} 判讀新聞情緒，GEE 樣本 {n(data.gee?.n)} 筆。核心交互作用 Sales_growth × Positive 的估計值為 {inter?.display ?? '—'}（{sigNote(inter)}），
              與原著方向{inter && inter.coef < 0 ? '一致' : '不同'}；機器學習方面，加入情緒後 {rows.length} 種演算法中有 {improved} 種準確率上升，但整體接近基準準確率 {data.split?.baselineAcc}。</>
          ) : '（台股結果尚未計算）'}
          最後討論本研究是否屬於混合方法研究，以及復刻結果的限制。
        </P>
        <div className="text-xs text-slate-600 pt-1">
          <strong>關鍵詞：</strong> 混合方法研究、廣義估計方程式 (GEE)、新聞情緒、異常報酬、機器學習、台股復刻
        </div>
      </div>

      {/* 壹 */}
      <section className="space-y-4">
        <H2>壹、研究動機與研究問題</H2>
        <P>
          原著主張：只看財務比率無法完整解釋股價反應，新聞中的情緒資訊可以補充財報數字，而且兩者會產生交互作用。
          本報告延續原著的三階段架構（Identify → Explain → Predict），並提出三個問題：
        </P>
        <div className="p-4 rounded-xl bg-slate-100 space-y-2 text-xs text-slate-800">
          <div><strong>RQ1：</strong>新聞情緒是否會調節財務指標（特別是營收成長）與 SCAR 的關係？</div>
          <div><strong>RQ2：</strong>加入新聞情緒後，機器學習預測 SCAR 方向的能力是否提升？</div>
          <div><strong>RQ3：</strong>原著在美股的發現，在台股是否成立？</div>
        </div>
      </section>

      {/* 貳 */}
      <section className="space-y-4">
        <H2>貳、研究設計與資料</H2>
        <P>
          原著自我定位為混合方法研究：將新聞文本以 Loughran-McDonald 金融詞典轉成正、負面情緒比率（量化轉換），再與財務指標一同進入 GEE 與機器學習模型。
          此定位在學界有爭議：寬鬆定義下可視為收斂設計的資料轉換變體；嚴格定義下，由於文本沒有詮釋性的質性分析，較接近以文字為資料的量化研究或準混合設計。
        </P>
        <ul className="list-disc pl-6 space-y-2 text-xs sm:text-sm text-slate-800">
          <li><strong>資料</strong>：{data ? `FinMind 個股新聞（每檔每日最多 ${data.maxPerDay} 則）、月營收、本益比、股價淨值比、市值；基準指數為 0050。` : '尚未計算'}</li>
          <li><strong>情緒</strong>：{data ? `${data.sentimentEngine} 對每則標題給出 −1～+1 的分數；全樣本正面 ${pct(data.sentimentShare?.positive)}、負面 ${pct(data.sentimentShare?.negative)}。` : '尚未計算'}</li>
          <li><strong>應變數</strong>：{data?.gee?.dv ?? '尚未計算'}</li>
          <li><strong>模型</strong>：GEE，個股為群組，分別使用 Independence、AR(1)、Exchangeable 相關結構；交互作用項先平均數中心化；連續變數 1%／99% 縮尾。</li>
          <li><strong>機器學習</strong>：{data ? `依時間切分訓練集（${data.split?.trainStart}～${data.split?.trainEnd}，${data.split?.trainN} 筆）與測試集（${data.split?.testStart} 起，${data.split?.testN} 筆），中間間隔 5 天避免資訊外洩。` : '尚未計算'}</li>
        </ul>
      </section>

      {/* 參 */}
      <section className="space-y-4">
        <H2>參、GEE 實證結果</H2>
        <P>
          表 1 並列原著與台股的 GEE（Exchangeable）估計值。由於兩邊的情緒衡量方式不同（原著為詞頻比率，本研究為 −1～+1 分數），
          係數大小不能直接比較，比較的重點是<strong>方向與顯著性</strong>。
        </P>
        <div className="py-2">
          <div className="text-xs font-bold text-slate-900 pb-1">表 1. GEE 結果：原著與台股復刻（Exchangeable）</div>
          <div className="overflow-x-auto rounded border-y-2 border-slate-950 py-1 bg-white">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-950 font-bold text-slate-950">
                  <th className="py-2 px-3">變數</th>
                  <th className="py-2 px-3 text-center">原著 S&amp;P 500</th>
                  <th className="py-2 px-3 text-center">台股復刻</th>
                  <th className="py-2 px-3 text-center">比較</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {TERMS.map((t) => (
                  <tr key={t} className={t === 'Sales_growth X Positive' ? 'bg-slate-100 font-bold' : ''}>
                    <td className="py-2 px-3 font-mono">{t}</td>
                    <td className="py-2 px-3 text-center font-mono">{paperCell(t)}</td>
                    <td className="py-2 px-3 text-center font-mono">{our(t)?.display ?? '尚未計算'}</td>
                    <td className="py-2 px-3 text-center">{verdictFor(ctx as any, t)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="text-[11px] text-slate-500 pt-1">
            註：* p &lt; .05，** p &lt; .01，*** p &lt; .001；括號內為穩健標準誤。原著數字取自本平台論文翻譯之表 2，請以原文 PDF 核對。
            {data ? ` 台股樣本 ${n(data.gee?.n)} 筆、${data.gee?.firms} 檔。` : ''}
          </div>
        </div>
        {inter && (
          <P>
            核心交互作用 Sales_growth × Positive 在台股為 {inter.display}（{sigNote(inter)}），
            {inter.coef < 0
              ? '方向與原著相同：營收成長越高的公司，正面新聞帶來的超額報酬越少，與「預期已反映在股價中」的解釋一致。'
              : '方向與原著相反，需要進一步檢查樣本期間與情緒衡量方式的差異。'}
            {inter.p >= 0.01 ? ' 但顯著程度弱於原著，解讀時應保守。' : ''}
          </P>
        )}
      </section>

      {/* 肆 */}
      <section className="space-y-4">
        <H2>肆、機器學習預測結果</H2>
        <P>
          {data
            ? `預測目標為「${data.target}」。全部猜多數類別的基準準確率為 ${data.split?.baselineAcc}，任何模型都必須明顯高於這個數字才有意義。`
            : '尚未計算。'}
        </P>
        <div className="py-2">
          <div className="text-xs font-bold text-slate-900 pb-1">表 2. 純量化 vs 量化＋情緒（測試集）</div>
          <div className="overflow-x-auto rounded border-y-2 border-slate-950 py-1 bg-white">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-950 font-bold text-slate-950">
                  <th className="py-2 px-3">演算法</th>
                  <th className="py-2 px-3 text-center">純量化 Accuracy</th>
                  <th className="py-2 px-3 text-center">量化＋情緒 Accuracy</th>
                  <th className="py-2 px-3 text-center">純量化 AUC</th>
                  <th className="py-2 px-3 text-center">量化＋情緒 AUC</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {rows.length ? rows.map((b, i) => (
                  <tr key={i}>
                    <td className="py-2 px-3 font-semibold">{b.algorithm}</td>
                    <td className="py-2 px-3 text-center font-mono">{b.quantOnlyAcc}</td>
                    <td className="py-2 px-3 text-center font-mono">{b.quantTextAcc}</td>
                    <td className="py-2 px-3 text-center font-mono">{b.quantOnlyAuc}</td>
                    <td className="py-2 px-3 text-center font-mono">{b.quantTextAuc}</td>
                  </tr>
                )) : (
                  <tr><td colSpan={5} className="py-3 text-center text-slate-500">尚未計算</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        {rows.length > 0 && (
          <P>
            加入情緒後，{rows.length} 種演算法中有 {improved} 種準確率上升，但所有模型都只在基準準確率附近。
            換言之，在台股這段期間，新聞情緒在 GEE 中有顯著的平均效果，卻不足以讓模型可靠地預測個別事件的漲跌方向。
            這與原著「加入文字後預測顯著改善」的結論不同，可能原因包括樣本期間較短、標題比全文資訊少，以及台股新聞多為轉載。
          </P>
        )}
      </section>

      {/* 伍 */}
      <section className="space-y-4">
        <H2>伍、討論與限制</H2>
        <div className="space-y-3 text-xs sm:text-sm text-slate-800 leading-relaxed text-justify">
          <P><strong>一、可以帶走的發現：</strong>台股中正、負面新聞都與之後的超額報酬顯著相關，而營收成長與正面新聞的交互作用方向與原著相同，支持「好消息的效果會被既有高預期吸收」的解釋。</P>
          <P><strong>二、與原著不同之處：</strong>機器學習預測沒有因加入情緒而穩定改善；情緒衡量方式與樣本長度不同，係數大小也不能直接對照。</P>
          <P><strong>三、方法論限制：</strong>本復刻與原著一樣，只把文字量化成分數，沒有詮釋性的質性分析；若要成為較完整的混合方法研究，可對極端報酬事件的新聞做主題編碼，回頭解釋迴歸結果。</P>
        </div>
      </section>
    </>
  );
}
