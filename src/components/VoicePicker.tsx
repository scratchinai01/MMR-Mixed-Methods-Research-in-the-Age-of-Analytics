import { useEffect, useRef, useState } from 'react';
import { Volume2, X } from 'lucide-react';
import { makeUtterance, pickVoice, setTtsPrefs, useTtsVoices, TtsLang } from '../services/ttsVoice.ts';

const SAMPLE: Record<TtsLang, string> = {
  zh: '您好，這是中文朗讀試聽。營收成長越高，正面新聞帶來的超額報酬越小。',
  en: 'Hello, this is an English voice preview. Negative sentiments have more profound effects on abnormal returns.',
};

const label = (v: SpeechSynthesisVoice) => `${v.name}（${v.lang}）${v.localService ? '' : '・線上'}`;

/** 朗讀語音設定：頁首按鈕＋彈出面板 */
export function VoicePickerButton({ className = '' }: { className?: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(!open)} className={className} title="選擇朗讀的聲音與語速">
        <Volume2 className="w-4 h-4" />
        <span className="hidden md:inline">語音</span>
      </button>
      {open && <VoicePanel onClose={() => setOpen(false)} />}
    </div>
  );
}

export function VoicePanel({ onClose }: { onClose?: () => void }) {
  const { zh, en, prefs, supported } = useTtsVoices();
  const preview = (lang: TtsLang) => {
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(makeUtterance(SAMPLE[lang], lang));
  };

  const Row = ({ lang, list }: { lang: TtsLang; list: SpeechSynthesisVoice[] }) => (
    <div className="space-y-1.5">
      <div className="text-xs font-bold text-slate-700">{lang === 'zh' ? '中文聲音' : '英文聲音'}（{list.length} 種）</div>
      <div className="flex gap-2">
        <select
          value={pickVoice(lang)?.voiceURI || ''}
          onChange={(e) => setTtsPrefs(lang === 'zh' ? { zh: e.target.value } : { en: e.target.value })}
          className="flex-1 min-w-0 h-9 px-2 rounded-lg border border-slate-300 bg-white text-sm"
          disabled={!list.length}
        >
          {list.length ? list.map((v) => <option key={v.voiceURI} value={v.voiceURI}>{label(v)}</option>) : <option>此裝置沒有可用的聲音</option>}
        </select>
        <button onClick={() => preview(lang)} disabled={!list.length}
          className="h-9 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white text-xs font-bold shrink-0">試聽</button>
      </div>
    </div>
  );

  return (
    <div className="fixed left-4 right-4 top-16 sm:left-auto sm:right-6 sm:w-[380px] z-[80] rounded-2xl bg-white border border-slate-200 shadow-2xl p-4 space-y-4 text-slate-800">
      <div className="flex items-center justify-between">
        <span className="font-bold">朗讀語音設定</span>
        {onClose && <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-100" title="關閉"><X className="w-4 h-4" /></button>}
      </div>
      {!supported ? (
        <p className="text-sm text-rose-700">這個瀏覽器不支援朗讀功能。</p>
      ) : (
        <>
          <Row lang="zh" list={zh} />
          <Row lang="en" list={en} />
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700">
              <span>語速</span><span className="font-mono">{prefs.rate.toFixed(2)}×</span>
            </div>
            <input type="range" min={0.6} max={1.6} step={0.05} value={prefs.rate}
              onChange={(e) => setTtsPrefs({ rate: Number(e.target.value) })} className="w-full accent-indigo-600" />
            <div className="flex justify-between text-[10px] text-slate-400"><span>慢</span><span>正常</span><span>快</span></div>
          </div>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            聲音來自您的瀏覽器與作業系統，免費、不經過伺服器；不同裝置能選的聲音不一樣。Chrome 通常有「Google 國語（臺灣）」，Mac／iPhone 有「美佳」等台灣口音，Windows Edge 有自然語音。設定會記在這台裝置上，全站朗讀按鈕都會套用。
          </p>
        </>
      )}
    </div>
  );
}
