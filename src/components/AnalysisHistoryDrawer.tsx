import React from 'react';
import { 
  History, 
  X, 
  Trash2, 
  FileText, 
  ExternalLink, 
  Calendar, 
  CheckCircle2, 
  Sparkles,
  CloudCheck,
  ChevronRight,
  Database
} from 'lucide-react';
import { AnalysisRecord, analysisStorage } from '../services/analysisStorage.ts';

interface AnalysisHistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectRecord: (record: AnalysisRecord) => void;
}

export const AnalysisHistoryDrawer: React.FC<AnalysisHistoryDrawerProps> = ({
  isOpen,
  onClose,
  onSelectRecord
}) => {
  const [records, setRecords] = React.useState<AnalysisRecord[]>([]);

  React.useEffect(() => {
    if (isOpen) {
      setRecords(analysisStorage.getLocalRecords());
      // Asynchronously fetch and merge Firestore records
      analysisStorage.getMergedRecords().then(merged => {
        if (merged && merged.length > 0) {
          setRecords(merged);
        }
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm('確定要刪除這筆分析歷史記錄嗎？')) {
      analysisStorage.deleteRecord(id);
      setRecords(prev => prev.filter(r => r.id !== id));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md h-full bg-white shadow-2xl flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center">
              <History className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base flex items-center gap-1.5">
                <span>論文分析歷史存檔庫</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded font-bold bg-emerald-500/80 text-white flex items-center gap-1">
                  <Database className="w-2.5 h-2.5" />
                  <span>Firebase 同步</span>
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                每一次上傳分析皆已自動持久化保存
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List of saved analyses */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/70">
          {records.length === 0 ? (
            <div className="p-8 text-center space-y-2 text-slate-400">
              <History className="w-10 h-10 mx-auto opacity-30" />
              <p className="text-xs font-semibold text-slate-500">
                目前尚無分析歷史記錄
              </p>
              <p className="text-[11px] text-slate-400">
                在主頁上傳論文或載入經典範例，每次分析結果都會自動保存在此！
              </p>
            </div>
          ) : (
            records.map((record) => {
              const isExplanatory = record.majorDesignId === 'explanatory';
              const isTriangulation = record.majorDesignId === 'triangulation';
              return (
                <div
                  key={record.id}
                  onClick={() => {
                    onSelectRecord(record);
                    onClose();
                  }}
                  className="p-4 rounded-xl border border-slate-200 bg-white hover:border-indigo-400 hover:shadow-md transition-all cursor-pointer space-y-2 group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                      isExplanatory 
                        ? 'bg-rose-100 text-rose-800 border border-rose-200' 
                        : isTriangulation 
                        ? 'bg-amber-100 text-amber-900 border border-amber-200' 
                        : 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                    }`}>
                      {record.majorDesignName}
                    </span>

                    <button
                      onClick={(e) => handleDelete(e, record.id)}
                      className="text-slate-300 hover:text-rose-600 p-1 transition-colors"
                      title="刪除此記錄"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div>
                    <h4 className="font-bold text-xs sm:text-sm text-slate-900 line-clamp-2 group-hover:text-indigo-600 transition-colors">
                      {record.paperTitle || record.fileName}
                    </h4>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className="text-[11px] text-slate-500 font-medium">
                        {record.subVariantName}
                      </span>
                      {record.followups && record.followups.length > 0 && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded-full font-bold bg-amber-100 text-amber-800 border border-amber-200">
                          💬 {record.followups.length} 則追問
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-100">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>{record.timestamp}</span>
                    </div>

                    <span className="text-indigo-600 font-bold group-hover:underline flex items-center gap-0.5">
                      <span>載入報告</span>
                      <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="p-3 bg-white border-t border-slate-200 text-center text-[11px] text-slate-400 flex items-center justify-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>支援點擊任意歷史記錄即刻復原報告、圖表與延伸追問</span>
        </div>
      </div>
    </div>
  );
};
