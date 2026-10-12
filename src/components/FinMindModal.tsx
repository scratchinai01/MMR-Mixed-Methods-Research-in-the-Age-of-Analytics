import React from 'react';
import { X, Database, CheckCircle2, Zap, Newspaper, FileSpreadsheet, TrendingUp, ShieldCheck, Code, Globe } from 'lucide-react';
import { FINMIND_PRO_FEATURES } from '../data/finmindTaiwanData.ts';

interface FinMindModalProps {
  isOpen: boolean;
  onClose: () => void;
  finmindVerified: boolean;
  onGoToReplication: () => void;
}

export const FinMindModal: React.FC<FinMindModalProps> = ({
  isOpen,
  onClose,
  finmindVerified,
  onGoToReplication,
}) => {
  if (!isOpen) return null;

  const datasetSpecs = [
    {
      dataset: 'TaiwanStockNews',
      name: '全市場財經新聞正文與標題',
      fields: 'date, stock_id, title, source, content',
      usage: '計算 Loughran-McDonald 詞庫正面/負面詞頻，萃取質性情緒指標'
    },
    {
      dataset: 'TaiwanStockMonthRevenue',
      name: '月營收與年增率數據',
      fields: 'revenue, revenue_month, revenue_year, YoY',
      usage: '構建營收成長率 (Sales Growth) 及其與新聞情緒的非線性交互項'
    },
    {
      dataset: 'TaiwanStockFinancialStatements',
      name: '四大完整財務報表',
      fields: 'balance_sheet, income_statement, cash_flows',
      usage: '精準運算市值淨值比 (MB Ratio)、本益比 (PE) 與企業規模對數 (Size)'
    },
    {
      dataset: 'TaiwanStockPrice',
      name: '日K與高頻歷史報價',
      fields: 'open, high, low, close, volume, date',
      usage: '計算 CAPM 預期報酬率與標準化累積超額報酬 (SCAR / Y)'
    },
    {
      dataset: 'TaiwanStockInstitutionalInvestors',
      name: '三大法人買賣超與籌碼流向',
      fields: 'Foreign, Investment_Trust, Dealer, date',
      usage: '台股在地化控制變數，檢驗法人籌碼與散戶情緒的背離效應'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[88vh] flex flex-col overflow-hidden text-slate-800"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-5 border-b border-slate-200 bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500 text-white flex items-center justify-center font-bold shadow-xs">
              <Database className="w-5 h-5 fill-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-lg text-white">FinMind 台股數據工具規格與介接指引</h3>
                <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-indigo-400/20 text-indigo-300 border border-indigo-400/30">
                  量化實證工具
                </span>
              </div>
              <p className="text-xs text-slate-300">
                專為台股學術研究、計量回測與情緒文字探勘提供的金融數據工具基礎設施
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6 text-sm">
          {/* Status Alert */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-indigo-50/80 border border-indigo-200">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-5 h-5 text-indigo-600" />
              <div>
                <div className="font-bold text-indigo-950 text-xs">當前系統沙盒狀態</div>
                <div className="text-xs text-slate-600">
                  {finmindVerified ? '已成功驗證官方 FinMind API Token，直接調用全市場即時數據' : '目前使用內建台股 50 高擬真歷史研究資料庫 (免 Token 亦可完整體驗)'}
                </div>
              </div>
            </div>
            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
              finmindVerified ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
            }`}>
              {finmindVerified ? 'API 連線中' : '沙盒就緒'}
            </span>
          </div>

          {/* Detailed Features */}
          <div className="space-y-3">
            <div className="font-bold text-slate-900 text-xs uppercase tracking-wider">
              FinMind 工具對復刻本研究之核心賦能：
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {FINMIND_PRO_FEATURES.map((f, i) => (
                <div key={i} className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-indigo-200 transition-colors">
                  <div className="font-semibold text-indigo-900 text-xs mb-1">
                    {f.title}
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {f.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Dataset Specifications Table */}
          <div className="space-y-2">
            <div className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center justify-between">
              <span>核心調用數據集規格表 (FinMind Dataset Schema)</span>
              <span className="text-[11px] text-indigo-600 font-mono">REST API v4</span>
            </div>
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-2.5">資料集名稱 (Dataset)</th>
                    <th className="px-4 py-2.5">涵蓋內容</th>
                    <th className="px-4 py-2.5">研究復刻用途</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-600">
                  {datasetSpecs.map((d, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-4 py-2.5 font-mono font-bold text-indigo-900">
                        {d.dataset}
                      </td>
                      <td className="px-4 py-2.5 font-medium text-slate-800">
                        <div>{d.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{d.fields}</div>
                      </td>
                      <td className="px-4 py-2.5 text-slate-600 text-[11px]">
                        {d.usage}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <span className="text-xs text-slate-500">支援標準 RESTful API 與 Python 函式庫</span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs text-slate-600 hover:bg-slate-200 transition-colors"
            >
              關閉
            </button>
            <button
              onClick={() => {
                onClose();
                onGoToReplication();
              }}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold transition-colors"
            >
              進入台股復刻沙盒
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
