import React, { useState } from 'react';
import { X, Sparkles, CheckCircle2, AlertTriangle, RefreshCw, Zap, ShieldCheck, Key, ExternalLink } from 'lucide-react';
import { callAiApi } from '../services/aiHelper.ts';

interface GeminiStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GeminiStatusModal: React.FC<GeminiStatusModalProps> = ({ isOpen, onClose }) => {
  const [testing, setTesting] = useState<boolean>(false);
  const providerName = 'Gemini';
  const [testResult, setTestResult] = useState<{
    success?: boolean;
    model?: string;
    latencyMs?: number;
    reply?: string;
    error?: string;
    diagnosis?: string;
    keyMasked?: string;
  } | null>(null);

  if (!isOpen) return null;

  const handleRunTest = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const data = await callAiApi('/api/gemini/test', {});
      setTestResult(data);
    } catch (err: any) {
      setTestResult({
        success: false,
        error: err.message || '連線測試請求發生網路錯誤',
        diagnosis: '無法連線至本地後端伺服器或 API 閘道逾時。',
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg flex flex-col overflow-hidden text-slate-800"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-indigo-950 via-slate-900 to-purple-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-md">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>AI 連線狀態診斷（Gemini）</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500 text-white">
                  Live Test
                </span>
              </h2>
              <p className="text-xs text-indigo-200">
                即時驗證 Gemini 金鑰、額度與模型連線狀態（翻譯與解析皆使用低成本 Flash-Lite）
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 text-xs sm:text-sm">
          <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100 text-slate-700 space-y-2">
            <div className="font-bold text-indigo-950 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
              <span>API 開通確認機制</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              點擊下方按鈕將向後端伺服器發送即時測試請求，直接調用所選 AI 模型的 <code className="font-mono text-indigo-700">generateContent</code> API，確認金鑰是否有效且額度正常。
            </p>
          </div>

          {/* Test Action & Status */}
          <div className="flex items-center justify-between gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <div>
              <div className="text-xs font-bold text-slate-700">連線診斷狀態</div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                {testing ? '正在發送測試請求...' : testResult ? (testResult.success ? `✅ 診斷完成：${providerName} API 運作正常` : '❌ 診斷完成：發現異常或額度限制') : '尚未執行測試'}
              </div>
            </div>
            <button
              onClick={handleRunTest}
              disabled={testing}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer shrink-0"
            >
              {testing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4 text-amber-300" />}
              <span>{testing ? '測試中...' : `⚡ 執行 ${providerName} API 測試`}</span>
            </button>
          </div>

          {/* Test Results Display */}
          {testResult && (
            <div className={`p-4 rounded-2xl border space-y-3 animate-in fade-in duration-200 ${
              testResult.success 
                ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
                : 'bg-rose-50/80 border-rose-200 text-rose-950'
            }`}>
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs uppercase tracking-wider flex items-center gap-1.5">
                  {testResult.success ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span className="text-emerald-800">{providerName} API 開通驗證成功</span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="w-4 h-4 text-rose-600" />
                      <span className="text-rose-800">{providerName} API 調用發生異常</span>
                    </>
                  )}
                </span>
                {testResult.keyMasked && (
                  <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-600">
                    Key: {testResult.keyMasked}
                  </span>
                )}
              </div>

              {testResult.success ? (
                <div className="space-y-2 text-xs bg-white p-3.5 rounded-xl border border-emerald-200/60 shadow-2xs">
                  <div className="flex items-center justify-between text-slate-600">
                    <span>模型：<strong className="font-mono text-indigo-700">{testResult.model}</strong></span>
                    <span>反應時間：<strong className="font-mono text-emerald-700">{testResult.latencyMs}ms</strong></span>
                  </div>
                  <div className="text-slate-700 pt-1 border-t border-slate-100">
                    <span>測試回應：</span>
                    <p className="font-serif italic text-slate-900 mt-0.5">"{testResult.reply}"</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-2 text-xs bg-white p-3.5 rounded-xl border border-rose-200/60 shadow-2xs">
                  {testResult.diagnosis && (
                    <div className="text-rose-900 font-bold flex items-start gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                      <span>{testResult.diagnosis}</span>
                    </div>
                  )}
                  {testResult.error && (
                    <div className="text-slate-600 font-mono text-[11px] bg-slate-50 p-2 rounded-lg border border-slate-200 overflow-x-auto">
                      {testResult.error}
                    </div>
                  )}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">如何解決額度或憑證問題？</span>
                    <a
                      href="https://ai.studio/projects"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1"
                    >
                      <span>前往 AI Studio 管理專案與帳單</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs">
          <div className="text-slate-500">
            官方說明：<a href="https://ai.google.dev/gemini-api/docs/billing#prepay" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">預付額度與計費說明</a>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium rounded-xl transition-colors"
          >
            關閉視窗
          </button>
        </div>
      </div>
    </div>
  );
};
