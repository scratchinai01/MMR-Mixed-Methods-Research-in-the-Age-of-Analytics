import { useEffect, useState } from 'react';
import { Lock, Unlock } from 'lucide-react';
import { aiUnlockRemaining, isAiUnlocked, lockAi, subscribeAiGate } from '../services/aiGate.ts';

/** 提示訊息：一般點擊 AI 按鈕時跳出 */
export function AiGateToast() {
  const [msg, setMsg] = useState<string | null>(null);
  useEffect(() => {
    let t: any;
    const on = (e: Event) => {
      setMsg((e as CustomEvent).detail);
      clearTimeout(t);
      t = setTimeout(() => setMsg(null), 4500);
    };
    const clear = () => setMsg(null);
    window.addEventListener('ai-gate-hint', on);
    window.addEventListener('ai-gate-clear', clear);
    return () => { window.removeEventListener('ai-gate-hint', on); window.removeEventListener('ai-gate-clear', clear); clearTimeout(t); };
  }, []);
  if (!msg) return null;
  return (
    <div className="fixed left-1/2 -translate-x-1/2 top-24 z-[200] w-[min(92vw,520px)] animate-in fade-in slide-in-from-top-2 duration-200">
      <div className="rounded-2xl bg-slate-900 text-white shadow-2xl border border-amber-400/60 px-4 py-3 flex items-start gap-3">
        <Lock className="w-5 h-5 text-amber-300 shrink-0 mt-0.5" />
        <div className="text-sm leading-relaxed">
          <div className="font-bold text-amber-300">需要登入主帳號</div>
          <div>{msg}</div>
        </div>
        <button onClick={() => setMsg(null)} className="ml-auto shrink-0 whitespace-nowrap text-slate-400 hover:text-white text-xs">關閉</button>
      </div>
    </div>
  );
}

/** 頁首指示：AI 解鎖中顯示倒數，可一鍵停用 */
export function AiGateBadge() {
  const [, force] = useState(0);
  useEffect(() => {
    const unsub = subscribeAiGate(() => force((x) => x + 1));
    const id = setInterval(() => force((x) => x + 1), 1000);
    return () => { unsub(); clearInterval(id); };
  }, []);
  if (!isAiUnlocked()) return null;
  const s = Math.ceil(aiUnlockRemaining() / 1000);
  return (
    <button onClick={lockAi} title="登出主帳號"
      className="h-9 px-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-extrabold flex items-center gap-1.5 shrink-0">
      <Unlock className="w-3.5 h-3.5" />
      <span>主帳號 {Math.floor(s / 60)}:{String(s % 60).padStart(2, '0')}</span>
      <span className="hidden md:inline opacity-70">｜登出</span>
    </button>
  );
}
