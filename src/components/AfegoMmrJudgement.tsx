// =====================================================================
// Afego & Alagidede (2021) MMR 判定：與 Raman et al. (2022) 用同一套判準逐列對齊。
// Afego 依原文全文（University of Pretoria 典藏 PDF，CC BY 4.0）核對；
// Raman 依期刊正式版 PDF（IJIM 64, 102451）核對。
// =====================================================================
import React from 'react';
import { CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';

type Mark = 'yes' | 'partial' | 'no';
const Chip = ({ m, children }: { m: Mark; children: React.ReactNode }) => {
  const cls = m === 'yes' ? 'bg-emerald-500/15 text-emerald-300 border-emerald-400/40'
    : m === 'partial' ? 'bg-amber-500/15 text-amber-300 border-amber-400/40'
    : 'bg-rose-500/15 text-rose-300 border-rose-400/40';
  const Icon = m === 'yes' ? CheckCircle2 : m === 'partial' ? AlertTriangle : XCircle;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[11px] font-bold whitespace-nowrap ${cls}`}>
      <Icon className="w-3 h-3" />{children}
    </span>
  );
};

// 同一套判準：與上方 Raman 正反論點表相同的六項，加上設計類型與研究問題
const ROWS: Array<{ k: string; raman: [Mark, string, string]; afego: [Mark, string, string] }> = [
  { k: '量化資料與分析',
    raman: ['yes', '有', 'Compustat／Eventus 財務資料；GEE、固定／隨機效果、機器學習（P.3–7）'],
    afego: ['yes', '有', '事件研究：27 個公告事件，常數平均報酬模型，估計期 200 天（3.3 節）'] },
  { k: '質性資料',
    raman: ['yes', '有（文字）', 'WSJ 約 2,500 篇文章（P.4）'],
    afego: ['yes', '有', '公司參與抵制的公開聲明（3.2 節）'] },
  { k: '質性「分析」（詮釋、編碼、主題）',
    raman: ['no', '沒有', '文字直接以 LM 詞典計數成正負比例，未報告任何質性發現'],
    afego: ['partial', '有，但程序未交代', '內容分析歸納出 6 類正當化主題（表 2）；未說明編碼程序、編碼者、信度與各類次數'] },
  { k: '質性研究問題',
    raman: ['no', '沒有', '研究問題是可檢定的假設：情緒與財務指標如何交互預測績效'],
    afego: ['yes', '有', '企業參與的動機、如何協商其正當性（legitimacy）'] },
  { k: '分析層整合（兩股資料進同一分析）',
    raman: ['yes', '有', '情緒分數與財務變數放進同一迴歸，含交互項'],
    afego: ['no', '沒有', '兩股結果分開呈現；沒有依主題比較 CAR，也沒有橫斷面迴歸'] },
  { k: '詮釋層整合（元推論）',
    raman: ['no', '沒有', '結論只來自統計結果'],
    afego: ['partial', '敘事式', '討論段以 “Taken together…” 把兩股結果放在一起解讀，但沒有系統性對照'] },
  { k: '作者自稱 mixed methods',
    raman: ['yes', '是', '標題與 5.1 節：“leveraging mixed-methods”'],
    afego: ['yes', '是', '“a mixed-methods design that uses both qualitative techniques … and quantitative methods”'] },
  { k: '最接近的設計',
    raman: ['partial', '資料轉換變體', '若接受為 MMR：收斂設計中的資料轉換；但沒有獨立質性軌'],
    afego: ['yes', '收斂並行', '同時蒐集、分開分析、在討論中合併（作者未命名設計）'] },
];

const VERDICT = {
  raman: { label: '有爭議', note: '寬鬆定義可列為 MMR；嚴格定義下為以文字為資料的量化研究（準混合）', m: 'partial' as Mark },
  afego: { label: '屬於 MMR，但整合偏弱', note: '兩種定義下都有質性與量化兩條分析軌，屬收斂並行設計；整合只停在敘事層', m: 'yes' as Mark },
};

export function AfegoMmrJudgement() {
  return (
    <div className="bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 text-slate-100 rounded-3xl p-6 sm:p-8 border-2 border-emerald-500/40 shadow-2xl space-y-6">
      {/* 標題 */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-indigo-900/60 pb-5">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-400 text-slate-950">/MMR文獻篩選：屬於 MMR（收斂並行設計）</span>
            <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-amber-500/15 text-amber-300 border border-amber-400/40">整合程度：偏弱（敘事式）</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-white">What Does Corporate Social Advocacy Signal? Evidence from Boycott Participation Decisions</h3>
          <p className="text-xs sm:text-sm text-slate-300">
            <strong>Afego & Alagidede (2021)</strong>, <em>Journal of Capital Markets Studies</em>, 5(1), 49–68. DOI: 10.1108/JCMS-10-2020-0040（CC BY 4.0）
          </p>
        </div>
      </div>

      {/* 對齊判定表 */}
      <div className="space-y-2">
        <div className="text-sm font-bold text-amber-300">同一套判準，兩篇並排判定</div>
        <p className="text-xs text-slate-400">判準與上方 Raman 的正反論點表相同（Fetters, Curry & Creswell, 2013 的整合層次；Teddlie & Tashakkori, 2009 的準混合）。Afego 依原文全文、Raman 依期刊正式版 PDF 核對。</p>
        <div className="overflow-x-auto rounded-2xl border border-slate-800">
          <table className="w-full min-w-[760px] text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-900 text-slate-200 border-b border-slate-800">
                <th className="p-3 w-44">判準</th>
                <th className="p-3">Raman et al. (2022)</th>
                <th className="p-3">Afego & Alagidede (2021)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {ROWS.map((r) => (
                <tr key={r.k} className="align-top hover:bg-slate-900/40">
                  <td className="p-3 font-semibold text-slate-200">{r.k}</td>
                  {[r.raman, r.afego].map(([m, lab, ev], i) => (
                    <td key={i} className="p-3 space-y-1">
                      <Chip m={m}>{lab}</Chip>
                      <div className="text-slate-400 leading-relaxed">{ev}</div>
                    </td>
                  ))}
                </tr>
              ))}
              <tr className="bg-slate-900/80 align-top border-t-2 border-emerald-500/40">
                <td className="p-3 font-black text-white">判定</td>
                {[VERDICT.raman, VERDICT.afego].map((v, i) => (
                  <td key={i} className="p-3 space-y-1">
                    <Chip m={v.m}>{v.label}</Chip>
                    <div className="text-slate-300 leading-relaxed">{v.note}</div>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          <strong className="text-amber-300">兩篇剛好互補：</strong>Raman 有「分析層整合」但沒有質性分析；Afego 有質性分析但兩股結果沒有在分析層整合。報告時可以用這個對照說明「MMR 的關鍵不在有沒有文字資料，而在兩條軌是否都有分析、以及在哪一層整合」。
        </p>
      </div>

      {/* 流程與標準輸出 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-slate-900/90 rounded-2xl p-5 border border-slate-800 space-y-4 text-xs">
          <div className="font-bold text-emerald-400">雙軌流程（依原文 3–5 節）</div>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-violet-400/40 bg-violet-500/10 p-3 space-y-1.5">
              <div className="text-[11px] font-black text-violet-300">QUAL・內容分析</div>
              <div className="text-slate-200">公司參與抵制的公開聲明</div>
              <div className="text-slate-400">問：企業為何參與？如何正當化？</div>
              <div className="text-slate-300">得到 6 類主題，如強化社區凝聚、共同推動正向改變、安全空間、尊嚴、網路平台的問責與透明、包容與多元</div>
            </div>
            <div className="rounded-xl border border-sky-400/40 bg-sky-500/10 p-3 space-y-1.5">
              <div className="text-[11px] font-black text-sky-300">QUAN・事件研究</div>
              <div className="text-slate-200">27 個公告事件（2020/6/17–7/2）</div>
              <div className="text-slate-400">問：股價是否有異常反應？</div>
              <div className="text-slate-300">CAR(+1,+4) = <strong>+2.68%</strong>（1% 水準顯著）</div>
            </div>
          </div>
          <div className="text-center text-slate-500">↓ 兩股結果分開報告 ↓</div>
          <div className="rounded-xl border border-amber-400/40 bg-amber-500/10 p-3 text-center space-y-1">
            <div className="text-[11px] font-black text-amber-300">合併點：討論段（敘事式整合）</div>
            <div className="text-slate-200">公告具有訊號效果（“informationally strategic”）</div>
          </div>
          <div className="text-[11px] text-slate-500">流程中沒有「主題 → 報酬」的檢驗，所以整合停在詮釋敘事。</div>
        </div>

        <div className="bg-slate-900/90 rounded-2xl p-5 border border-slate-800 space-y-3 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-bold text-amber-300">/MMR文獻篩選　標準輸出</span>
            <Chip m="yes">屬於 MMR</Chip>
          </div>
          <dl className="divide-y divide-slate-800">
            {([
              ['QUAN', 'yes', '有・事件研究（常數平均報酬模型）'],
              ['QUAL', 'yes', '有・內容分析（程序未交代）'],
              ['QUAN + QUAL 回答同一問題', 'yes', '是：企業社會倡議傳遞什麼訊號'],
              ['分析層整合', 'no', '沒有'],
              ['詮釋層整合', 'partial', '敘事式'],
              ['作者自稱 mixed methods', 'yes', '是'],
              ['只是多重方法（multi-method）？', 'yes', '否：一質一量，不是同典範的多種方法'],
              ['設計類型', 'yes', '收斂並行（作者未命名）'],
            ] as Array<[string, Mark, string]>).map(([k, m, v]) => (
              <div key={k} className="flex items-center justify-between gap-3 py-2">
                <dt className="text-slate-300">{k}</dt>
                <dd><Chip m={m}>{v}</Chip></dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      {/* 方法限制 */}
      <div className="p-5 rounded-2xl bg-indigo-950/60 border border-indigo-500/40 space-y-3 text-xs">
        <div className="font-bold text-amber-300 text-sm">收進文獻庫前要知道的限制（依原文）</div>
        <div className="grid sm:grid-cols-2 gap-2 text-slate-300">
          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800"><strong className="text-white">樣本小：</strong>只有 27 個事件、單一抵制案、只看美股；作者也承認沒有對照組。</div>
          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800"><strong className="text-white">公告前已有異常報酬：</strong>CAR(−5,−1) = +2.13% 也顯著，可能有訊息提前反應；但正文把公告前描述為負值，與表 4 不一致。</div>
          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800"><strong className="text-white">質性程序不透明：</strong>沒有交代編碼方式、編碼者、信度與各主題次數。</div>
          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800"><strong className="text-white">整合只在敘事層：</strong>沒有用主題去解釋哪些公司報酬較高。</div>
        </div>
        <p className="text-slate-300 leading-relaxed">
          <strong>結論：</strong>公開宣布參與抵制的公司，公告後四天平均有 +2.68% 的顯著正異常報酬；質性分析發現公司以利他價值與更大的社會利益來正當化參與。本篇比 Raman 更接近一般定義的 MMR，但整合深度有限，適合當作「收斂並行、整合偏弱」的範例，而不是「強整合」的典範。
        </p>
      </div>
    </div>
  );
}
