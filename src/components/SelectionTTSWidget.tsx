import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Volume2, 
  VolumeX, 
  Play, 
  Pause, 
  Square, 
  Sparkles, 
  Check, 
  Copy, 
  Globe, 
  Zap, 
  Settings2,
  X
} from 'lucide-react';
import { SelectionAnalysisModal } from './SelectionAnalysisModal.tsx';
import { callAiApi } from '../services/aiHelper.ts';

interface SelectionTTSWidgetProps {
  onAskGemini?: (selectedText: string) => void;
}

export const SelectionTTSWidget: React.FC<SelectionTTSWidgetProps> = ({ onAskGemini }) => {
  const [selectedText, setSelectedText] = useState<string>('');
  const [position, setPosition] = useState<{ x: number; y: number; placeAbove: boolean } | null>(null);
  const [isVisible, setIsVisible] = useState<boolean>(false);
  
  // Analysis Modal State
  const [analysisModalOpen, setAnalysisModalOpen] = useState<boolean>(false);
  const [analysisTitle, setAnalysisTitle] = useState<string>('');
  const [analysisContent, setAnalysisContent] = useState<string>('');
  const [analysisLoading, setAnalysisLoading] = useState<boolean>(false);
  const [analysisEngine, setAnalysisEngine] = useState<string>('');
  const [analysisLatency, setAnalysisLatency] = useState<number | undefined>(undefined);
  const [isSpeakingAnalysis, setIsSpeakingAnalysis] = useState<boolean>(false);
  // 開啟分析視窗時固定住的原文；之後在視窗內選字不會改到它
  const [analysisSource, setAnalysisSource] = useState<string>('');

  const handleTranslateSelection = async () => {
    if (!selectedText.trim()) return;
    setAnalysisSource(selectedText);
    setAnalysisTitle('🌐 框選文字高精度學術翻譯');
    setAnalysisContent('');
    setAnalysisEngine('');
    setAnalysisLatency(undefined);
    setAnalysisLoading(true);
    setAnalysisModalOpen(true);
    setIsVisible(false);

    try {
      const data = await callAiApi('/api/gemini/explain', {
        question: `請將以下學術論文段落進行高品質學術繁體中文對譯（信達雅），並提供核心專門術語解構：\n\n${selectedText}`,
        context: '學術論文沈浸式閱讀與翻譯助手',
        isTranslation: true,
      });
      setAnalysisContent(data.answer || '翻譯完成。');
      setAnalysisEngine(data.modelUsed || 'Gemini');
      setAnalysisLatency(data.latencyMs);
    } catch (err: any) {
      setAnalysisContent(`翻譯發生錯誤：${err.message}`);
    } finally {
      setAnalysisLoading(false);
    }
  };

  const handleDeepGeminiAnalysis = async () => {
    if (!selectedText.trim()) return;
    setAnalysisSource(selectedText);
    setAnalysisTitle('💡 框選文字深度學術與微結構解析');
    setAnalysisContent('');
    setAnalysisEngine('');
    setAnalysisLatency(undefined);
    setAnalysisLoading(true);
    setAnalysisModalOpen(true);
    setIsVisible(false);

    try {
      const data = await callAiApi('/api/gemini/explain', {
        question: `請針對以下學術論文段落進行深度的學術解析與計量金融 / 市場微結構觀點解說：\n\n${selectedText}`,
        context: '高頻市場微結構與實證計量學術解析'
      });
      setAnalysisContent(data.answer || '解析完成。');
      setAnalysisEngine(data.modelUsed || 'Gemini');
      setAnalysisLatency(data.latencyMs);
    } catch (err: any) {
      setAnalysisContent(`解析發生錯誤：${err.message}`);
    } finally {
      setAnalysisLoading(false);
    }
  };
  
  // TTS State
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [speechRate, setSpeechRate] = useState<number>(1.0);
  const [detectedLang, setDetectedLang] = useState<'en' | 'zh'>('en');
  const [autoSpeakOnSelect, setAutoSpeakOnSelect] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [supportedVoices, setSupportedVoices] = useState<SpeechSynthesisVoice[]>([]);

  const widgetRef = useRef<HTMLDivElement>(null);
  const currentUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Load available synthesis voices
  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    const updateVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      setSupportedVoices(voices);
    };

    updateVoices();
    window.speechSynthesis.onvoiceschanged = updateVoices;

    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
  }, []);

  // Detect language: Chinese if contains CJK chars, otherwise English
  const detectLanguage = (text: string): 'en' | 'zh' => {
    const hasChinese = /[\u4e00-\u9fa5]/.test(text);
    return hasChinese ? 'zh' : 'en';
  };

  // Speak the given text
  const speakText = useCallback((textToSpeak: string, langOverride?: 'en' | 'zh', rateOverride?: number) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      alert('您的瀏覽器不支援 Web Speech 語音合成。');
      return;
    }

    // Cancel current speech
    window.speechSynthesis.cancel();

    if (!textToSpeak || textToSpeak.trim().length === 0) return;

    const lang = langOverride || detectLanguage(textToSpeak);
    const rate = rateOverride ?? speechRate;

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.rate = rate;
    utterance.pitch = 1.0;

    // Pick best voice
    const voices = supportedVoices.length > 0 ? supportedVoices : window.speechSynthesis.getVoices();
    if (lang === 'zh') {
      utterance.lang = 'zh-TW';
      const twVoice = voices.find(v => v.lang === 'zh-TW' || v.lang.includes('TW') || v.name.includes('Taiwan') || v.name.includes('HanHan') || v.name.includes('Yating'));
      if (twVoice) utterance.voice = twVoice;
      else {
        const anyZh = voices.find(v => v.lang.startsWith('zh'));
        if (anyZh) utterance.voice = anyZh;
      }
    } else {
      utterance.lang = 'en-US';
      const enVoice = voices.find(v => (v.lang === 'en-US' || v.lang === 'en-GB') && (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Samantha') || v.name.includes('Daniel') || v.name.includes('Karen')));
      if (enVoice) utterance.voice = enVoice;
      else {
        const anyEn = voices.find(v => v.lang.startsWith('en'));
        if (anyEn) utterance.voice = anyEn;
      }
    }

    utterance.onstart = () => {
      setIsPlaying(true);
      setIsPaused(false);
    };

    utterance.onpause = () => {
      setIsPaused(true);
      setIsPlaying(false);
    };

    utterance.onresume = () => {
      setIsPlaying(true);
      setIsPaused(false);
    };

    utterance.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };

    utterance.onerror = (e) => {
      console.warn('TTS Speech error:', e);
      setIsPlaying(false);
      setIsPaused(false);
    };

    currentUtteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, [speechRate, supportedVoices]);

  // Pause speech
  const pauseSpeech = () => {
    if ('speechSynthesis' in window && window.speechSynthesis.speaking) {
      window.speechSynthesis.pause();
      setIsPaused(true);
      setIsPlaying(false);
    }
  };

  // Resume speech
  const resumeSpeech = () => {
    if ('speechSynthesis' in window && window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
      setIsPlaying(true);
      setIsPaused(false);
    } else if (selectedText) {
      speakText(selectedText);
    }
  };

  // Stop speech
  const stopSpeech = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      setIsPaused(false);
    }
  };

  // Handle selection on document
  useEffect(() => {
    let timeoutId: any = null;

    const handleSelection = () => {
      // Debounce slightly to allow drag selection to finish smoothly
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        const selection = window.getSelection();
        if (!selection || selection.isCollapsed) {
          return;
        }

        const text = selection.toString().trim();
        // Ignore very short strings (minimum 4 characters), whitespace, or numbers-only single clicks
        if (text.length < 4) {
          setIsVisible(false);
          return;
        }

        // Avoid triggering inside input fields, textareas, or buttons
        const anchorNode = selection.anchorNode;
        const parentElem = anchorNode instanceof HTMLElement ? anchorNode : anchorNode?.parentElement;
        if (parentElem) {
          const tagName = parentElem.tagName.toLowerCase();
          if (tagName === 'input' || tagName === 'textarea' || tagName === 'button' || parentElem.closest('button') || parentElem.closest('[data-no-widget="true"]')) {
            return;
          }
        }

        try {
          const range = selection.getRangeAt(0);
          const rect = range.getBoundingClientRect();

          // If rect is empty, too small, or invisible (e.g. click instead of drag)
          if (rect.width < 12 || rect.height < 8) {
            return;
          }

          // Compute position centered above selection
          const scrollY = window.scrollY || window.pageYOffset;
          const scrollX = window.scrollX || window.pageXOffset;

          const centerX = rect.left + rect.width / 2 + scrollX;
          // If too close to viewport top, show below selection instead
          const placeAbove = rect.top > 70;
          const targetY = placeAbove 
            ? rect.top + scrollY - 12 
            : rect.bottom + scrollY + 12;

          setSelectedText(text);
          setDetectedLang(detectLanguage(text));
          setPosition({ x: centerX, y: targetY, placeAbove });
          setIsVisible(true);

          // If auto-speak is enabled, speak immediately upon selection
          if (autoSpeakOnSelect) {
            speakText(text, detectLanguage(text));
          }
        } catch (e) {
          console.warn('Error reading selection rect:', e);
        }
      }, 260);
    };

    // Close when clicking outside of selection and widget
    const handleDocumentMouseDown = (e: MouseEvent) => {
      if (widgetRef.current && widgetRef.current.contains(e.target as Node)) {
        return;
      }
      // If clicked elsewhere, dismiss widget and stop audio if needed
      setTimeout(() => {
        const sel = window.getSelection();
        if (!sel || sel.isCollapsed) {
          setIsVisible(false);
          // Don't stop audio immediately so user can read while playing
        }
      }, 200);
    };

    document.addEventListener('mouseup', handleSelection);
    document.addEventListener('touchend', handleSelection);
    document.addEventListener('mousedown', handleDocumentMouseDown);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('mouseup', handleSelection);
      document.removeEventListener('touchend', handleSelection);
      document.removeEventListener('mousedown', handleDocumentMouseDown);
    };
  }, [autoSpeakOnSelect, speakText]);

  // Copy text handler
  const handleCopy = () => {
    if (!selectedText) return;
    navigator.clipboard.writeText(selectedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Toggle speed rate (0.8x -> 1.0x -> 1.25x -> 1.5x)
  const cycleRate = () => {
    const nextRate = speechRate === 0.8 ? 1.0 : speechRate === 1.0 ? 1.25 : speechRate === 1.25 ? 1.5 : 0.8;
    setSpeechRate(nextRate);
    if (isPlaying) {
      speakText(selectedText, detectedLang, nextRate);
    }
  };

  // Toggle language override
  const toggleLang = () => {
    const nextLang = detectedLang === 'en' ? 'zh' : 'en';
    setDetectedLang(nextLang);
    if (isPlaying) {
      speakText(selectedText, nextLang);
    }
  };

  // 分析視窗獨立於選字工具列：工具列收起時視窗不能跟著消失
  if (!isVisible && !isPlaying && !isPaused && !analysisModalOpen) return null;

  return (
    <>
      {/* Floating Selection Popup Bar */}
      {isVisible && position && (
        <div
          ref={widgetRef}
          role="toolbar"
          aria-label="即時選取文字語音朗讀 (TTS Toolbar)"
          style={{
            position: 'absolute',
            left: `${Math.max(16, Math.min(window.innerWidth - 340, position.x - 170))}px`,
            top: `${position.y}px`,
            transform: position.placeAbove ? 'translateY(-100%)' : 'translateY(0)',
          }}
          className="z-50 animate-in fade-in zoom-in-95 duration-150 select-none shadow-2xl rounded-2xl bg-slate-900/95 backdrop-blur-md text-white border border-indigo-500/30 p-1.5 flex items-center gap-1.5 ring-4 ring-indigo-500/10"
        >
          {/* Main TTS Action Button */}
          {!isPlaying && !isPaused ? (
            <button
              onClick={() => speakText(selectedText, detectedLang)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-indigo-500 via-indigo-600 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold text-xs shadow-md shadow-indigo-500/30 transition-all active:scale-95 group"
              title="即時朗讀框選文字 (Web Speech TTS)"
            >
              <Volume2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
              <span>朗讀文字</span>
            </button>
          ) : isPaused ? (
            <button
              onClick={resumeSpeech}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-md transition-all active:scale-95"
              title="繼續播放"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>繼續</span>
            </button>
          ) : (
            <button
              onClick={pauseSpeech}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition-all active:scale-95"
              title="暫停朗讀"
            >
              <Pause className="w-3.5 h-3.5 fill-current" />
              <span>暫停</span>
            </button>
          )}

          {/* Sound Wave Indicator when playing */}
          {isPlaying && (
            <div className="flex items-center gap-0.5 px-1.5 py-1 bg-white/10 rounded-lg">
              <span className="w-1 bg-amber-400 rounded-full animate-bounce h-3" style={{ animationDelay: '0ms' }} />
              <span className="w-1 bg-indigo-400 rounded-full animate-bounce h-4" style={{ animationDelay: '150ms' }} />
              <span className="w-1 bg-emerald-400 rounded-full animate-bounce h-2" style={{ animationDelay: '300ms' }} />
              <span className="w-1 bg-purple-400 rounded-full animate-bounce h-3.5" style={{ animationDelay: '75ms' }} />
            </div>
          )}

          {/* Stop Button */}
          {(isPlaying || isPaused) && (
            <button
              onClick={stopSpeech}
              className="p-1.5 hover:bg-white/10 rounded-lg text-slate-300 hover:text-white transition-colors"
              title="停止朗讀"
            >
              <Square className="w-3.5 h-3.5 fill-current" />
            </button>
          )}

          <div className="h-4 w-px bg-white/20 mx-0.5" />

          {/* Translate Selection */}
          <button
            onClick={handleTranslateSelection}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition-all active:scale-95"
            title="將框選文字透過 Gemini AI 進行專業學術翻譯"
          >
            <Globe className="w-3.5 h-3.5 text-indigo-200" />
            <span>翻譯</span>
          </button>

          {/* Deep AI Academic Analysis */}
          <button
            onClick={handleDeepGeminiAnalysis}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-xs shadow-md transition-all active:scale-95"
            title="將框選文字透過 Gemini AI 進行學術與微結構深度解析"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>AI 解析</span>
          </button>

          <div className="h-4 w-px bg-white/20 mx-0.5" />

          {/* Language Toggle Button */}
          <button
            onClick={toggleLang}
            className="flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-white/10 text-[11px] font-mono font-semibold text-indigo-300 transition-colors"
            title={`當前語言：${detectedLang === 'en' ? '英語 (en-US)' : '台灣中文 (zh-TW)'}，點擊切換`}
          >
            <Globe className="w-3 h-3 text-indigo-400" />
            <span>{detectedLang.toUpperCase()}</span>
          </button>

          {/* Speech Rate Button */}
          <button
            onClick={cycleRate}
            className="px-1.5 py-1 rounded-lg hover:bg-white/10 text-[11px] font-mono font-semibold text-slate-300 transition-colors"
            title="點擊切換語速 (0.8x / 1.0x / 1.25x / 1.5x)"
          >
            {speechRate}x
          </button>

          {/* Ask Gemini About Selection */}
          {onAskGemini && (
            <button
              onClick={() => onAskGemini(selectedText)}
              className="p-1.5 hover:bg-white/10 rounded-lg text-purple-300 hover:text-purple-100 transition-colors"
              title="以 Gemini 3.8 Flash 深度解析框選文字"
            >
              <Sparkles className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Copy Button */}
          <button
            onClick={handleCopy}
            className="p-1.5 hover:bg-white/10 rounded-lg text-slate-300 hover:text-white transition-colors"
            title="複製框選文字"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          {/* Toggle Auto-Speak Setting */}
          <button
            onClick={() => setAutoSpeakOnSelect(!autoSpeakOnSelect)}
            className={`p-1.5 rounded-lg transition-colors ${
              autoSpeakOnSelect ? 'bg-amber-400/20 text-amber-300 border border-amber-400/30' : 'hover:bg-white/10 text-slate-400'
            }`}
            title={autoSpeakOnSelect ? '已啟用「框選即時朗讀」（按此關閉）' : '開啟「框選即時朗讀」功能'}
          >
            <Zap className="w-3.5 h-3.5" />
          </button>

          {/* Close Floating Toolbar */}
          <button
            onClick={() => {
              setIsVisible(false);
              stopSpeech();
            }}
            className="p-1 hover:bg-white/10 rounded-md text-slate-400 hover:text-white transition-colors ml-0.5"
            title="關閉語音條"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Persistent Mini Bottom Bar when Audio is playing in background */}
      {(isPlaying || isPaused) && !isVisible && (
        <aside
          aria-label="即時語音播放中浮動控制面板"
          className="fixed bottom-20 left-4 z-40 animate-in slide-in-from-bottom-4 duration-200 bg-slate-900/90 backdrop-blur-md text-white border border-indigo-500/40 shadow-2xl rounded-2xl p-2.5 flex items-center gap-3 ring-4 ring-indigo-500/10 max-w-sm"
        >
          <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center shrink-0">
            {isPlaying ? (
              <Volume2 className="w-4 h-4 text-white animate-pulse" />
            ) : (
              <VolumeX className="w-4 h-4 text-slate-300" />
            )}
          </div>

          <div className="flex-1 min-w-0 pr-1">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-500/30 text-indigo-300 uppercase font-mono">
                TTS {detectedLang.toUpperCase()} ({speechRate}x)
              </span>
              <span className="text-[10px] text-slate-400">
                {isPlaying ? '正在朗讀框選文字' : '已暫停'}
              </span>
            </div>
            <p className="text-xs text-slate-200 truncate mt-0.5 font-medium">
              "{selectedText}"
            </p>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {isPlaying ? (
              <button
                onClick={pauseSpeech}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white"
                title="暫停"
              >
                <Pause className="w-3.5 h-3.5 fill-current" />
              </button>
            ) : (
              <button
                onClick={resumeSpeech}
                className="p-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white"
                title="繼續"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
              </button>
            )}

            <button
              onClick={stopSpeech}
              className="p-1.5 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white"
              title="停止"
            >
              <Square className="w-3.5 h-3.5 fill-current" />
            </button>
          </div>
        </aside>
      )}

      {/* Selection Analysis & Translation Modal */}
      <SelectionAnalysisModal
        isOpen={analysisModalOpen}
        onClose={() => {
          setAnalysisModalOpen(false);
          if (isSpeakingAnalysis) {
            window.speechSynthesis?.cancel();
            setIsSpeakingAnalysis(false);
          }
        }}
        title={analysisTitle}
        sourceText={analysisSource}
        analysisContent={analysisContent}
        loading={analysisLoading}
        engineUsed={analysisEngine}
        latencyMs={analysisLatency}
        isSpeaking={isSpeakingAnalysis}
        onSpeakText={(text) => {
          setIsSpeakingAnalysis(true);
          speakText(text, 'zh', 1.0);
          if ('speechSynthesis' in window) {
            const checkEnd = setInterval(() => {
              if (!window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
                setIsSpeakingAnalysis(false);
                clearInterval(checkEnd);
              }
            }, 300);
          }
        }}
        onStopSpeech={() => {
          if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
          }
          setIsSpeakingAnalysis(false);
        }}
      />
    </>
  );
};
