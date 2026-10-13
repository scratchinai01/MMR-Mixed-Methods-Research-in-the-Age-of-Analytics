// =====================================================================
// Machine Learning 範例影片：以辨識新聞頭條的用字遣詞為例
// 影片內容是 Machine Learning for Kids「了解你的機器學習模型」逐步講解
// =====================================================================
import React, { useState } from 'react';
import { PlayCircle, ExternalLink } from 'lucide-react';

const VIDEO_ID = '5hXdbBU0rjk';

const STEPS: [string, string][] = [
  ['輸入層', '一則新聞標題，例如「30,000 ILLEGAL BIDS TO GET TO UK FROM CALAIS THIS YEAR」。'],
  ['編碼', '模型只能處理數字，先把文字轉成一串數字。'],
  ['詞袋', '計算每個字出現幾次（如 "TO"、"MAY"、"BREXIT"）。'],
  ['提取特徵', '再加上字母數、標點、大寫字母數、音節、是否有問號、動詞數等。'],
  ['輸出層', '得出四家報紙各自的分數：Daily_Mail、Daily_Telegraph、Independent、The_Guardian。'],
  ['損失函數', '把輸出和正確答案（訓練標籤）相比，算出每一類的錯誤。'],
  ['逆向傳播', '依錯誤大小，從輸出往回逐層微調每條線的權重與每個節點的偏差值。'],
];

export function MlExampleVideo() {
  const [play, setPlay] = useState(false);
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 sm:p-5 space-y-4">
      <div className="space-y-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="px-2 py-0.5 rounded-md text-xs font-bold bg-sky-100 text-sky-800">範例影片</span>
          <h3 className="text-base font-bold text-slate-900">Machine Learning 範例：辨識新聞頭條的用字遣詞</h3>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed">
          不同的報紙會有不同的用字遣詞習慣。這個專案包含來自四家英國報紙的主要頭條新聞，可以用來訓練機器學習模型，讓它學習預測新的標題可能來自哪一家報紙。
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[3fr_2fr]">
        <div className="relative w-full overflow-hidden rounded-xl bg-black aspect-video">
          {play ? (
            <iframe
              className="absolute inset-0 w-full h-full"
              src={`https://www.youtube-nocookie.com/embed/${VIDEO_ID}?autoplay=1&rel=0`}
              title="Machine Learning 範例：辨識新聞頭條的用字遣詞"
              allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
              allowFullScreen
            />
          ) : (
            <button
              type="button"
              onClick={() => setPlay(true)}
              className="absolute inset-0 w-full h-full group cursor-pointer"
              aria-label="播放影片"
            >
              <img
                src={`https://i.ytimg.com/vi/${VIDEO_ID}/hqdefault.jpg`}
                alt=""
                className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                loading="lazy"
                onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
              />
              <span className="absolute inset-0 flex items-center justify-center">
                <PlayCircle className="w-16 h-16 text-white drop-shadow-lg group-hover:scale-110 transition-transform" />
              </span>
            </button>
          )}
        </div>

        <ol className="space-y-1.5 text-xs text-slate-700">
          {STEPS.map(([t, d], i) => (
            <li key={t} className="flex gap-2">
              <span className="shrink-0 w-5 h-5 rounded-full bg-sky-600 text-white text-[10px] font-bold flex items-center justify-center">{i + 1}</span>
              <span><b className="text-slate-900">{t}</b>：{d}</span>
            </li>
          ))}
        </ol>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500">
        <span>與本研究的關係：本研究同樣先把新聞標題轉成數字（Gemini 情緒分數），再交給模型預測；差別在預測目標是股價超額報酬，而不是報紙來源。</span>
        <a
          href={`https://youtu.be/${VIDEO_ID}`}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 font-semibold text-sky-700 hover:underline"
        >
          <ExternalLink className="w-3.5 h-3.5" />在 YouTube 開啟
        </a>
      </div>
    </div>
  );
}
