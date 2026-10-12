import { 
  saveAnalysisRecordToFirestore, 
  getAnalysisRecordsFromFirestore, 
  deleteAnalysisRecordFromFirestore,
  appendFollowupToAnalysisRecordInFirestore,
  saveFollowupToFirestore
} from './firebase.ts';

export interface AnalysisRecord {
  id: string;
  timestamp: string;
  createdAt: number;
  fileName: string;
  paperTitle: string;
  majorDesignId: 'triangulation' | 'embedded' | 'explanatory' | 'exploratory';
  majorDesignName: string;
  subVariantName: string;
  notation: string;
  timing: string;
  weight: string;
  summary: string;
  markdownReport: string;
  diagramType?: 'explanatory' | 'triangulation' | 'embedded' | 'exploratory';
  followups?: Array<{ q: string; a: string; timestamp?: number; modelUsed?: string }>;
}

const STORAGE_KEY = 'mmr_analysis_history_v1';

export const analysisStorage = {
  // Get all records from local storage with background Firestore sync
  getLocalRecords(): AnalysisRecord[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const list = JSON.parse(raw);
      return Array.isArray(list) ? list : [];
    } catch (e) {
      console.warn('Failed to parse local analysis records:', e);
      return [];
    }
  },

  // Asynchronously fetch latest from Firestore and merge with local records
  async getMergedRecords(): Promise<AnalysisRecord[]> {
    const local = this.getLocalRecords();
    try {
      const remote = await getAnalysisRecordsFromFirestore();
      if (remote && remote.length > 0) {
        // Merge by ID prioritizing remote or latest timestamp
        const map = new Map<string, AnalysisRecord>();
        local.forEach(r => map.set(r.id, r));
        remote.forEach(r => map.set(r.id, r));
        const merged = Array.from(map.values()).sort((a, b) => b.createdAt - a.createdAt);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
        return merged;
      }
    } catch (err) {
      console.warn('Firebase getMergedRecords error:', err);
    }
    return local;
  },

  // Save record to local storage & sync with Firebase Firestore + server endpoint
  async saveRecord(record: Omit<AnalysisRecord, 'id' | 'timestamp' | 'createdAt'> & { id?: string }): Promise<AnalysisRecord> {
    const id = record.id || `record_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    const fullRecord: AnalysisRecord = {
      ...record,
      id,
      timestamp: new Date().toLocaleString('zh-TW', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      }),
      createdAt: Date.now(),
    };

    // 1. Save to local storage first (instant)
    try {
      const existing = this.getLocalRecords();
      const filtered = existing.filter(r => r.id !== id);
      const updated = [fullRecord, ...filtered];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to save to localStorage:', e);
    }

    // 2. Sync to Firebase Firestore directly
    try {
      await saveAnalysisRecordToFirestore(fullRecord);
    } catch (err) {
      console.warn('[Firebase] saveRecord error:', err);
    }

    // 3. Sync to backend API endpoint
    try {
      await fetch('/api/analysis-records', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fullRecord),
      });
    } catch (err) {
      console.warn('Server sync error (saved locally & Firebase):', err);
    }

    return fullRecord;
  },

  // Append a follow-up Q&A to a record in both LocalStorage and Firebase Firestore
  async appendFollowup(recordId: string, qa: { q: string; a: string; modelUsed?: string }): Promise<void> {
    try {
      // 1. Update local storage
      const existing = this.getLocalRecords();
      const target = existing.find(r => r.id === recordId);
      if (target) {
        const followups = target.followups || [];
        target.followups = [...followups, { ...qa, timestamp: Date.now() }];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
      }

      // 2. Append to Firebase Firestore
      await appendFollowupToAnalysisRecordInFirestore(recordId, qa);

      // 3. Save as independent follow-up dialogue entry in Firebase
      await saveFollowupToFirestore({
        sourceModule: 'paper_upload',
        topic: target?.paperTitle || '論文追問探討',
        question: qa.q,
        answer: qa.a,
        modelUsed: qa.modelUsed || 'Gemini',
      });
    } catch (e) {
      console.warn('Failed to append follow-up:', e);
    }
  },

  // Delete record
  async deleteRecord(id: string): Promise<void> {
    try {
      const existing = this.getLocalRecords();
      const updated = existing.filter(r => r.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      await deleteAnalysisRecordFromFirestore(id);
      await fetch(`/api/analysis-records/${id}`, { method: 'DELETE' }).catch(() => {});
    } catch (e) {
      console.warn('Failed to delete record:', e);
    }
  },

  // Get a single record by ID
  getRecord(id: string): AnalysisRecord | null {
    const list = this.getLocalRecords();
    return list.find(r => r.id === id) || null;
  }
};

