// =====================================================================
// AI 使用閘門：避免現場大量觀眾誤觸而消耗 Gemini 費用
// - 會用到 Gemini 的按鈕：需以報告人的方式操作才會執行（對外顯示為「需主帳號登入」）
// - 解鎖後，這個分頁的 AI 功能可用 10 分鐘（頁首顯示倒數，可隨時登出）
// - 所有送往 AI 端點的請求都經過這裡：未解鎖時直接擋下，不會送到伺服器
//   （伺服器端另有檢查與每個 IP 的次數上限）
// - 解鎖狀態只存在記憶體中，重新整理頁面就恢復鎖定
// =====================================================================

const UNLOCK_MINUTES = 10;
const AI_PATHS = ['/api/gemini/explain', '/api/gemini/analyze-paper', '/api/gemini/deck-outline', '/api/gemini/critique-value', '/api/gemini/test',
  '/api/ai/dynamic-questions', '/api/sentiment/analyze-headline', '/api/translate'];

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
    // 已解鎖的 10 分鐘內，一般點擊也可以用；未解鎖時才需要報告人操作
    if (!e.shiftKey && !isAiUnlocked()) {
      e.preventDefault?.();
      showAiHint();
      return;
    }
    if (e.shiftKey || isAiUnlocked()) unlockAi();
    window.dispatchEvent(new CustomEvent('ai-gate-clear'));
    handler(e);
  };
}

/** 不需鎖定、但主帳號登入時可改用 Gemini 的請求：解鎖時加上標頭，未解鎖照常送出（伺服器改用免費方式） */
const OPTIONAL_AI_PATHS = ['/api/finmind/live-news', '/api/finmind/ml-train'];

/** 攔截所有 AI 請求：未解鎖就擋下；解鎖時加上伺服器需要的標頭 */
export function installAiFetchGuard() {
  if (typeof window === 'undefined' || (window as any).__aiGuardInstalled) return;
  (window as any).__aiGuardInstalled = true;
  // 任何按鈕只要是以報告人方式點擊（不論該按鈕有沒有包 aiClick），之後 2 秒內發出的 AI 請求都視為已解鎖
  let lastPresenterClick = 0;
  const mark = (e: MouseEvent | KeyboardEvent) => { if (e.shiftKey) lastPresenterClick = Date.now(); };
  window.addEventListener('click', mark, true);
  window.addEventListener('keydown', (e) => { if (e.key === 'Enter') mark(e); }, true);
  const orig = window.fetch.bind(window);
  window.fetch = (input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
    let path = url;
    try { path = new URL(url, window.location.origin).pathname; } catch { /* 保持原字串 */ }
    if (OPTIONAL_AI_PATHS.includes(path)) {
      if (!isAiUnlocked()) return orig(input, init);
      const h = new Headers(init?.headers || (input instanceof Request ? input.headers : undefined));
      h.set('x-ai-unlock', '1');
      return orig(input, { ...init, headers: h });
    }
    if (!AI_PATHS.includes(path)) return orig(input, init);
    if (!isAiUnlocked() && Date.now() - lastPresenterClick < 2000) unlockAi();
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
