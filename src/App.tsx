import React, { useState, useEffect } from 'react';
import { AiGateToast } from './components/AiGateUI.tsx';
import { makeUtterance } from './services/ttsVoice.ts';
import { Header } from './components/Header.tsx';
import { PaperReader } from './components/PaperReader.tsx';
import { FinMindReplication } from './components/FinMindReplication.tsx';
import { PaperValueCritique } from './components/PaperValueCritique.tsx';
import { ThesisReportView } from './components/ThesisReportView.tsx';
import { MixedMethodModal } from './components/MixedMethodModal.tsx';
import { GlossaryModal } from './components/GlossaryModal.tsx';
import { FinMindModal } from './components/FinMindModal.tsx';
import { SelectionTTSWidget } from './components/SelectionTTSWidget.tsx';
import { PaperUploadAnalysisModal } from './components/PaperUploadAnalysisModal.tsx';
import { SelectionAnalysisModal } from './components/SelectionAnalysisModal.tsx';
import { GeminiStatusModal } from './components/GeminiStatusModal.tsx';
import { callAiApi } from './services/aiHelper.ts';
import { saveFollowupToFirestore, getParaTrajectory } from './services/firebase.ts';

export type ParaMeta = { paraId: string; paraLabel: string; openTrajectory?: boolean };
import { X, Presentation, ArrowLeft } from 'lucide-react';

export default function App() {
  const [currentTab, setCurrentTab] = useState<'reader' | 'replication' | 'critique' | 'thesis_report'>('thesis_report');
  const [initialCritiqueTab, setInitialCritiqueTab] = useState<'traps' | 'real_value' | 'diagnostic' | 'gemini_critique' | 'phd_report'>('traps');
  const [mmrModalOpen, setMmrModalOpen] = useState<boolean>(false);
  const [uploadModalOpen, setUploadModalOpen] = useState<boolean>(false);
  const [glossaryModalOpen, setGlossaryModalOpen] = useState<boolean>(false);
  const [activeGlossaryTerm, setActiveGlossaryTerm] = useState<string | null>(null);
  const [finmindModalOpen, setFinmindModalOpen] = useState<boolean>(false);
  const [geminiTestModalOpen, setGeminiTestModalOpen] = useState<boolean>(false);
  const [bannerDismissed, setBannerDismissed] = useState<boolean>(false);
  const [finmindVerified, setFinmindVerified] = useState<boolean>(false);
  const [seniorMode, setSeniorMode] = useState<boolean>(false);
  const [initialReaderSection, setInitialReaderSection] = useState<string>('abstract');

  // Thesis PPT Navigation Tracking (支援從 PPT 跳轉至沉浸式翻譯或台股，並快速返回)
  const [lastThesisSlide, setLastThesisSlide] = useState<number>(1);
  const [navigatedFromThesis, setNavigatedFromThesis] = useState<boolean>(false);
  // 從簡報跳到台股復刻時要定位的區塊（nonce 讓同一區塊也能重複觸發）
  const [repJump, setRepJump] = useState<{ anchor: string; step?: number; nonce: number } | null>(null);

  // Global Escape key listener: 一鍵返回 PPT 口試簡報
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && navigatedFromThesis && currentTab !== 'thesis_report') {
        if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
        setCurrentTab('thesis_report');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigatedFromThesis, currentTab]);

  // Check on mount if server has global Secrets for FinMind configured
  React.useEffect(() => {
    fetch('/api/finmind/status')
      .then((r) => r.json())
      .then((d) => {
        if (d && (d.hasServerSecret || d.isConfigured)) {
          setFinmindVerified(true);
        }
      })
      .catch(() => {});
  }, []);

  // Dedicated Paragraph AI Analysis State
  const [paraModalOpen, setParaModalOpen] = useState<boolean>(false);
  const [paraModalTitle, setParaModalTitle] = useState<string>('💡 Gemini AI 論文論述深度解析');
  const [paraModalSource, setParaModalSource] = useState<string>('');
  const [paraModalContent, setParaModalContent] = useState<string>('');
  const [paraModalEngine, setParaModalEngine] = useState<string>('');
  const [paraModalLatency, setParaModalLatency] = useState<number | undefined>(undefined);
  const [paraModalLoading, setParaModalLoading] = useState<boolean>(false);
  const [isSpeakingPara, setIsSpeakingPara] = useState<boolean>(false);
  const [paraModalOffline, setParaModalOffline] = useState<boolean>(false);
  const [paraModalMeta, setParaModalMeta] = useState<ParaMeta | null>(null);

  // 預先寫好的白話解說：直接顯示，不呼叫 AI
  const handleExplainPara = (title: string, source: string, markdown: string, meta?: ParaMeta) => {
    setParaModalMeta(meta || null);
    setParaModalOffline(true);
    setParaModalSource(source);
    setParaModalTitle(title);
    setParaModalContent(markdown);
    setParaModalEngine('預寫白話解說（不使用 AI）');
    setParaModalLatency(undefined);
    setParaModalLoading(false);
    setParaModalOpen(true);
  };

  // Trigger real AI analysis on specific paragraph/query
  const handleAskAi = async (promptText: string, meta?: ParaMeta) => {
    let sourceSnippet = promptText.trim();
    if (sourceSnippet.includes('：\n')) {
      sourceSnippet = sourceSnippet.split('：\n')[1]?.trim() || sourceSnippet;
    }
    setParaModalMeta(meta || null);
    setParaModalOffline(false);
    setParaModalSource(sourceSnippet);
    setParaModalTitle('💡 Gemini AI 論文論述深度解析');
    setParaModalContent('');
    setParaModalEngine('');
    setParaModalLatency(undefined);
    setParaModalLoading(true);
    setParaModalOpen(true);

    // 學習軌跡：這一段之前已解析過，就直接顯示當時的解析，不重複呼叫 AI
    if (meta) {
      try {
        const { records } = await getParaTrajectory(meta.paraId);
        const prev = [...records].reverse().find((r) => r.kind === 'analysis');
        if (prev) {
          setParaModalContent(prev.answer);
          setParaModalEngine(`學習軌跡：${prev.timestamp} 的解析（${prev.modelUsed || 'Gemini'}）`);
          setParaModalLoading(false);
          return;
        }
      } catch { /* 讀不到就照常解析 */ }
    }

    try {
      const data = await callAiApi('/api/gemini/explain', {
        question: `請針對以下學術論文段落進行深度的學術解析與計量金融 / 市場微結構觀點解說：\n\n${sourceSnippet}`,
        context: '高頻市場微結構與混合方法研究 (MMR) 博士生導師專用解析系統'
      });
      setParaModalContent(data.answer || '解析完成。');
      setParaModalEngine(data.modelUsed || 'Gemini');
      setParaModalLatency(data.latencyMs);

      // Persist to Firebase
      if (data.answer) {
        saveFollowupToFirestore({
          sourceModule: meta ? 'mmr_reader' : 'selection_analysis',
          topic: meta?.paraLabel || '論文段落深度解析',
          sourceText: sourceSnippet.slice(0, 500),
          question: meta ? `段落解析：${meta.paraLabel}` : `針對段落深度解析：${sourceSnippet.slice(0, 80)}...`,
          answer: data.answer,
          modelUsed: data.modelUsed || 'Gemini',
          ...(meta ? { paraId: meta.paraId, paraLabel: meta.paraLabel, kind: 'analysis' as const } : {}),
        }).catch(e => console.warn('Firebase save warning:', e));
      }
    } catch (err: any) {
      setParaModalContent(`解析發生錯誤：${err.message}`);
    } finally {
      setParaModalLoading(false);
    }
  };

  const handleSpeakPara = (text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = makeUtterance(text);
    utterance.onend = () => setIsSpeakingPara(false);
    utterance.onerror = () => setIsSpeakingPara(false);
    setIsSpeakingPara(true);
    window.speechSynthesis.speak(utterance);
  };

  const handleStopSpeechPara = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    setIsSpeakingPara(false);
  };

  const handleOpenGlossaryTerm = (term: string) => {
    setActiveGlossaryTerm(term);
    setGlossaryModalOpen(true);
  };

  // 框選工具列點到內建專有名詞時，直接打開名詞辭典對應的那一條（不使用 AI）
  useEffect(() => {
    const onTerm = (e: Event) => handleOpenGlossaryTerm(String((e as CustomEvent).detail || ''));
    window.addEventListener('open-glossary-term', onTerm);
    return () => window.removeEventListener('open-glossary-term', onTerm);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col selection:bg-indigo-100 selection:text-indigo-900">
      {seniorMode && (
        <style>{`
          body, p, span, div, button, table, th, td, input, select {
            font-size: 1.25rem !important;
            line-height: 1.85 !important;
          }
          h1 { font-size: 2.5rem !important; }
          h2 { font-size: 2.1rem !important; }
          h3 { font-size: 1.75rem !important; }
          h4 { font-size: 1.45rem !important; }
          .text-xs { font-size: 1.1rem !important; }
          .text-sm { font-size: 1.25rem !important; }
          .text-base { font-size: 1.4rem !important; }
          .text-lg { font-size: 1.6rem !important; }
          .text-xl { font-size: 1.85rem !important; }
        `}</style>
      )}

      {/* Top Header */}
      <Header
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onOpenMmrModal={() => setMmrModalOpen(true)}
        onOpenGlossaryModal={() => {
          setActiveGlossaryTerm(null);
          setGlossaryModalOpen(true);
        }}
        finmindVerified={finmindVerified}
        onOpenFinmindModal={() => setFinmindModalOpen(true)}
        onOpenUploadModal={() => setUploadModalOpen(true)}
        onOpenGeminiTestModal={() => setGeminiTestModalOpen(true)}
        seniorMode={seniorMode}
        onToggleSeniorMode={() => setSeniorMode(!seniorMode)}
        returnToThesisSlide={navigatedFromThesis && currentTab !== 'thesis_report' ? lastThesisSlide : null}
        onReturnToThesis={() => setCurrentTab('thesis_report')}
      />

      {/* Main Body */}
      <main className="flex-1 pb-16">
        {currentTab === 'thesis_report' ? (
          <ThesisReportView
            onAskGemini={handleAskAi}
            initialSlide={lastThesisSlide}
            onSlideChange={(s) => setLastThesisSlide(s)}
            onNavigateToReplication={(slideNum, link) => {
              setNavigatedFromThesis(true);
              if (slideNum) setLastThesisSlide(slideNum);
              setRepJump(link ? { anchor: link.anchor, step: link.step, nonce: Date.now() } : null);
              setCurrentTab('replication');
            }}
            onNavigateToReader={(section, slideNum) => {
              setNavigatedFromThesis(true);
              if (slideNum) setLastThesisSlide(slideNum);
              setInitialReaderSection(section || 'abstract');
              setCurrentTab('reader');
            }}
          />
        ) : currentTab === 'critique' ? (
          <PaperValueCritique
            onAskGemini={handleAskAi}
            initialTab={initialCritiqueTab}
            onOpenUploadModal={() => setUploadModalOpen(true)}
            onNavigateToThesisReport={() => setCurrentTab('thesis_report')}
          />
        ) : currentTab === 'reader' ? (
          <PaperReader
            onAskGemini={handleAskAi}
            onOpenGlossaryTerm={handleOpenGlossaryTerm}
            onExplainPara={handleExplainPara}
            onNavigateToCritique={() => {
              setInitialCritiqueTab('traps');
              setCurrentTab('critique');
            }}
            onOpenMmrModal={() => setMmrModalOpen(true)}
            initialSection={initialReaderSection}
            returnToThesisSlide={navigatedFromThesis ? lastThesisSlide : null}
            onReturnToThesis={() => setCurrentTab('thesis_report')}
          />
        ) : (
          <FinMindReplication
            onAskGemini={handleAskAi}
            finmindVerified={finmindVerified}
            setFinmindVerified={setFinmindVerified}
            onNavigateToCritique={(tab) => {
              if (tab === 'phd_report') {
                setCurrentTab('thesis_report');
              } else {
                setInitialCritiqueTab('traps');
                setCurrentTab('critique');
              }
            }}
            onNavigateToReader={(section) => {
              setInitialReaderSection(section || 'results');
              setCurrentTab('reader');
            }}
            returnToThesisSlide={navigatedFromThesis ? lastThesisSlide : null}
            onReturnToThesis={(slide?: number) => { if (slide) setLastThesisSlide(slide); setCurrentTab('thesis_report'); }}
            jumpTo={repJump}
          />
        )}
      </main>

      {/* Persistent Floating Return to PPT Button (當從簡報跳轉至論文或台股時常駐顯示) */}
      {navigatedFromThesis && currentTab !== 'thesis_report' && currentTab !== 'replication' && (
        <div className="fixed bottom-20 right-4 sm:right-6 z-40 animate-in slide-in-from-bottom duration-300">
          <button
            onClick={() => setCurrentTab('thesis_report')}
            className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 via-indigo-600 to-indigo-700 hover:from-amber-400 hover:to-indigo-600 text-white font-bold text-xs sm:text-sm shadow-2xl hover:shadow-indigo-500/40 border border-white/20 backdrop-blur-md transition-all active:scale-95 group cursor-pointer ring-4 ring-amber-400/20"
            title="一鍵返回剛才瀏覽的口試簡報頁面（亦可隨時按 Esc 鍵）"
          >
            <Presentation className="w-4 h-4 text-amber-200 group-hover:scale-110 transition-transform" />
            <span>返回口試簡報 (Slide {lastThesisSlide})</span>
            <span className="px-2 py-0.5 rounded-md bg-white/20 text-[10px] font-mono hidden sm:inline">
              Esc 返回
            </span>
          </button>
        </div>
      )}

      {/* Global Interactive Selection TTS Speech Widget */}
      <SelectionTTSWidget 
        onAskGemini={handleAskAi} 
      />

      {/* Bottom Floating Quick MMR Banner (dismissible) */}
      {!bannerDismissed && (
        <aside aria-label="Mixed Method Research 快速解析導覽" className="fixed bottom-4 right-4 z-20 flex items-center gap-2">
          <button
            onClick={() => setMmrModalOpen(true)}
            className="flex items-center gap-2.5 px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-2xl bg-slate-900/95 hover:bg-slate-900 text-white shadow-xl hover:shadow-2xl border border-indigo-500/30 backdrop-blur-md transition-all active:scale-95 group cursor-pointer"
          >
            <div className="w-9 h-9 rounded-xl overflow-hidden border border-indigo-400/40 shrink-0 bg-slate-950 relative shadow-xs">
              <img
                src="/images/paper_framework_diagram.png"
                alt="MMR 縮圖"
                onError={(e) => {
                  e.currentTarget.src = "/images/gamma/21329b1e9960461ea76049af3c5883ef.webp";
                }}
                className="w-full h-full object-contain transition-transform"
              />
            </div>
            <div className="text-left hidden sm:block">
              <div className="text-xs font-bold leading-tight flex items-center gap-1.5">
                <span>Mixed Method 研究解析</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-rose-500/80 text-white font-semibold">
                  表 4.2 先定大類
                </span>
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                4大設計類型推導 • 圖 4.1 變型 • 附全景架構圖
              </div>
            </div>
          </button>
          <button
            type="button"
            onClick={() => setBannerDismissed(true)}
            className="p-2 rounded-full bg-slate-800/90 hover:bg-slate-900 text-slate-300 hover:text-white shadow-lg border border-slate-700 transition-colors cursor-pointer"
            title="關閉此浮動導覽列"
          >
            <X className="w-4 h-4" />
          </button>
        </aside>
      )}

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <div className="font-semibold text-slate-700">
              Mixed Methods Research in the Age of Analytics 台股實證復刻系統
            </div>
            <div>
              文獻出處：Raman, Aljafari, Venkatesh, & Richardson (2022), IJIM. 數據引擎：FinMind 台股數據工具 API.
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMmrModalOpen(true)}
              className="text-indigo-600 hover:text-indigo-800 font-medium cursor-pointer"
            >
              混合方法深度解說
            </button>
            <span>•</span>
            <button
              onClick={() => setFinmindModalOpen(true)}
              className="text-slate-600 hover:text-slate-800 cursor-pointer"
            >
              FinMind 工具規格
            </button>
            <span>•</span>
            <button
              onClick={() => {
                setActiveGlossaryTerm(null);
                setGlossaryModalOpen(true);
              }}
              className="text-slate-600 hover:text-slate-800 cursor-pointer"
            >
              專業術語表
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <MixedMethodModal
        isOpen={mmrModalOpen}
        onClose={() => setMmrModalOpen(false)}
        onOpenUploadModal={() => {
          setMmrModalOpen(false);
          setUploadModalOpen(true);
        }}
      />

      <AiGateToast />

      <GlossaryModal
        isOpen={glossaryModalOpen}
        onClose={() => {
          setGlossaryModalOpen(false);
          setActiveGlossaryTerm(null);
        }}
        activeTerm={activeGlossaryTerm}
      />

      <FinMindModal
        isOpen={finmindModalOpen}
        onClose={() => setFinmindModalOpen(false)}
        finmindVerified={finmindVerified}
        onGoToReplication={() => {
          setCurrentTab('replication');
        }}
      />

      <GeminiStatusModal
        isOpen={geminiTestModalOpen}
        onClose={() => setGeminiTestModalOpen(false)}
      />

      {/* Full Paper MMR Analysis Modal */}
      <PaperUploadAnalysisModal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onAskGeminiFollowup={handleAskAi}
      />

      {/* Paragraph AI Analysis Modal */}
      <SelectionAnalysisModal
        isOpen={paraModalOpen}
        onClose={() => {
          setParaModalOpen(false);
          if (isSpeakingPara) {
            window.speechSynthesis?.cancel();
            setIsSpeakingPara(false);
          }
        }}
        title={paraModalTitle}
        sourceText={paraModalSource}
        analysisContent={paraModalContent}
        offline={paraModalOffline}
        loading={paraModalLoading}
        engineUsed={paraModalEngine}
        latencyMs={paraModalLatency}
        paraMeta={paraModalMeta}
        isSpeaking={isSpeakingPara}
        onSpeakText={(text) => handleSpeakPara(text)}
        onStopSpeech={() => handleStopSpeechPara()}
      />
    </div>
  );
}
