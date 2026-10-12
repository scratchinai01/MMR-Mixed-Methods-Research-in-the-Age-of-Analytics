import React from 'react';
import { X, BookOpen, Tag } from 'lucide-react';
import { GLOSSARY_DICT } from '../data/paperContent.ts';

interface GlossaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeTerm?: string | null;
}

export const GlossaryModal: React.FC<GlossaryModalProps> = ({
  isOpen,
  onClose,
  activeTerm,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-600" />
            <h3 className="font-bold text-slate-900 text-base">論文核心術語與指標名詞辭典</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-4">
          {Object.entries(GLOSSARY_DICT).map(([termKey, item]) => {
            const isHighlighted = activeTerm && activeTerm.toLowerCase() === termKey.toLowerCase();
            return (
              <div
                key={termKey}
                className={`p-4 rounded-xl border transition-all ${
                  isHighlighted
                    ? 'border-indigo-500 bg-indigo-50/60 ring-2 ring-indigo-200'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-indigo-700 text-sm">{termKey}</span>
                    <span className="text-slate-400 text-xs">/</span>
                    <span className="font-semibold text-slate-900 text-sm">{item.termZh}</span>
                  </div>
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                    <Tag className="w-3 h-3 text-slate-400" />
                    {item.category}
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {item.definition}
                </p>
              </div>
            );
          })}
        </div>

        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg transition-colors"
          >
            我知道了
          </button>
        </div>
      </div>
    </div>
  );
};
