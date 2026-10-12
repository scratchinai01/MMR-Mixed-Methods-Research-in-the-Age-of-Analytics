// =====================================================================
// AI 使用閘門：避免現場大量觀眾誤觸而消耗 Gemini 費用
// - 會用到 Gemini 的按鈕：需以報告人的方式操作才會執行（對外顯示為「需主帳號登入」）
// - 解鎖後，這個分頁的 AI 功能可用 10 分鐘（頁首顯示倒數，可隨時登出）
// - 所有送往 AI 端點的請求都經過這裡：未解鎖時直接擋下，不會送到伺服器
//   （伺服器端另有檢查與每個 IP 的次數上限）
// - 解鎖狀態只存在記憶體中，重新整理頁面就恢復鎖定
// =====================================================================

const UNLOCK_MINUTES = 10;
const AI_PATHS = ['/api/gemini/explain', '/api/gemini/analyze-paper', '/api/gemini/critique-value', '/api/gemini/test',
  '/api/ai/dynamic-questions', '/api/sentiment/analyze-headline', '/api/translate', '/api/finmind/live-news'];

let unlockedUntil = 0;
const listeners = new Set<() => void>();
const notify = () => listeners.forEach((fn) => fn());

export const isAiUnlocked = () => Date.now() < unlockedUntil;
export const aiUnlockRemaining = () => Math.max(0, unlockedUntil - Date.now());
export function unlockAi(minutes = UNLOCK_MINUTES) { unlockedUntil = Date.now() + minutes * 60 * 1000; notify(); }
export function lockAi() { unlockedUntil = 0; notify(); }
export function subscribeAiGate(fn: () => void) { listeners.add(fn); return () => { listeners.delete(fn); }; }

/** 顯示提示（由 AiGateToast 元件接收） */
export function showAiHint(message = '這個功能需要以主帳號登入才能使用。目前為公開閱讀模式，其他內容都可以正常瀏覽。') {
  window.dispatchEvent(new CustomEvent('ai-gate-hint', { detail: message }));
}

/**
 * 包裝會使用 AI 的按鈕：
 *   onClick={aiClick(() => doSomething())}
 * 一般點擊只顯示提示；報告人操作才解鎖並執行。
 */
export function aiClick<E extends { shiftKey: boolean; preventDefault?: () => void }>(handler: (e: E) => void) {
  return (e: E) => {
    if (!e.shiftKey) {
      e.preventDefault?.();
      showAiHint();
      return;
    }
    unlockAi();
    window.dispatchEvent(new CustomEvent('ai-gate-clear'));
    handler(e);
  };
}

/** 攔截所有 AI 請求：未解鎖就擋下；解鎖時加上伺服器需要的標頭 */
export function installAiFetchGuard() {
  if (typeof window === 'undefined' || (window as any).__aiGuardInstalled) return;
  (window as any).__aiGuardInstalled = true;
  const orig = window.fetch.bind(window);
  window.fetch = (input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
    let path = url;
    try { path = new URL(url, window.location.origin).pathname; } catch { /* 保持原字串 */ }
    if (!AI_PATHS.includes(path)) return orig(input, init);
    if (!isAiUnlocked()) {
      showAiHint();
      const body = JSON.stringify({ success: false, error: 'AI_LOCKED', message: '此功能需要以主帳號登入才能使用（目前為公開閱讀模式）。' });
      return Promise.resolve(new Response(body, { status: 403, headers: { 'Content-Type': 'application/json' } }));
    }
    const headers = new Headers(init?.headers || (input instanceof Request ? input.headers : undefined));
    headers.set('x-ai-unlock', '1');
    return orig(input, { ...init, headers });
  };
}
