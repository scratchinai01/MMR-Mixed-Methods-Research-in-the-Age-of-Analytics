// =====================================================================
// 全站朗讀語音設定：中文聲音、英文聲音、語速
// 聲音來自使用者的瀏覽器與作業系統（Web Speech API，免費、不經伺服器），
// 選擇會記在這台裝置的瀏覽器裡；所有「朗讀」按鈕都用這裡的設定。
// =====================================================================
import { useEffect, useState } from 'react';

export type TtsLang = 'zh' | 'en';
interface Prefs { zh?: string; en?: string; rate: number }

const KEY = 'tts-voice-prefs-v1';
const listeners = new Set<() => void>();

function readPrefs(): Prefs {
  try {
    const p = JSON.parse(localStorage.getItem(KEY) || '{}');
    return { zh: p.zh, en: p.en, rate: typeof p.rate === 'number' ? p.rate : 1 };
  } catch {
    return { rate: 1 };
  }
}
let prefs: Prefs = typeof window !== 'undefined' ? readPrefs() : { rate: 1 };

export function getTtsPrefs(): Prefs {
  return prefs;
}

export function setTtsPrefs(patch: Partial<Prefs>) {
  prefs = { ...prefs, ...patch };
  try { localStorage.setItem(KEY, JSON.stringify(prefs)); } catch { /* 無法儲存時只在本次有效 */ }
  listeners.forEach((fn) => fn());
}

export function allVoices(): SpeechSynthesisVoice[] {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return [];
  return window.speechSynthesis.getVoices();
}

/** 依語言列出可用聲音：中文優先台灣，其次香港、中國；英文優先美、英 */
export function voicesFor(lang: TtsLang): SpeechSynthesisVoice[] {
  const vs = allVoices().filter((v) => v.lang.toLowerCase().startsWith(lang === 'zh' ? 'zh' : 'en'));
  const rank = (v: SpeechSynthesisVoice) => {
    const l = v.lang.toLowerCase();
    const n = v.name;
    let r = 0;
    if (lang === 'zh') {
      if (l.includes('tw') || /Taiwan|台灣|國語|Meijia|Yating|HanHan|Hsiao/i.test(n)) r -= 30;
      else if (l.includes('hk')) r -= 10;
    } else {
      if (l === 'en-us') r -= 20;
      else if (l === 'en-gb') r -= 10;
    }
    if (/Natural|Neural|Online|Google|Premium|Enhanced/i.test(n)) r -= 5;
    return r;
  };
  return [...vs].sort((a, b) => rank(a) - rank(b));
}

/** 取得目前選用的聲音（沒選過就用排序第一的） */
export function pickVoice(lang: TtsLang): SpeechSynthesisVoice | undefined {
  const list = voicesFor(lang);
  const uri = lang === 'zh' ? prefs.zh : prefs.en;
  return list.find((v) => v.voiceURI === uri) || list[0];
}

export const detectLang = (text: string): TtsLang => (/[一-龥]/.test(text) ? 'zh' : 'en');

/** 建立已套用聲音與語速的語音物件 */
export function makeUtterance(text: string, lang: TtsLang = detectLang(text), rate?: number): SpeechSynthesisUtterance {
  const u = new SpeechSynthesisUtterance(text);
  const v = pickVoice(lang);
  u.lang = v?.lang || (lang === 'zh' ? 'zh-TW' : 'en-US');
  if (v) { try { u.voice = v; } catch { /* 部分瀏覽器限制，退回只設定語言 */ } }
  u.rate = rate ?? prefs.rate;
  return u;
}

/** React hook：聲音清單載入完成、或設定改變時重新繪製 */
export function useTtsVoices() {
  const [, force] = useState(0);
  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    const update = () => force((x) => x + 1);
    window.speechSynthesis.addEventListener?.('voiceschanged', update);
    listeners.add(update);
    update();
    return () => {
      window.speechSynthesis.removeEventListener?.('voiceschanged', update);
      listeners.delete(update);
    };
  }, []);
  return { zh: voicesFor('zh'), en: voicesFor('en'), prefs, supported: typeof window !== 'undefined' && 'speechSynthesis' in window };
}
