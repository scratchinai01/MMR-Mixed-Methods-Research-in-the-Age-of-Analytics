import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  deleteDoc, 
  query, 
  orderBy, 
  limit, 
  updateDoc,
  where,
  arrayUnion,
  Firestore 
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { AnalysisRecord } from './analysisStorage.ts';

export interface FollowupDialogueRecord {
  id: string;
  sourceModule: 'paper_upload' | 'selection_analysis' | 'value_critique' | 'mmr_reader' | 'general';
  topic: string;
  sourceText?: string;
  question: string;
  answer: string;
  modelUsed?: string;
  stage?: number;
  timestamp: string;
  createdAt: number;
  /** 論文段落編號（學習軌跡用）；kind：analysis＝段落解析，followup＝追問 */
  paraId?: string;
  paraLabel?: string;
  kind?: 'analysis' | 'followup';
}

let db: Firestore | null = null;

/** 連不上 Firestore 時 SDK 可能一直等待：超過時間就放棄，改用本機紀錄 */
const withTimeout = <T,>(p: Promise<T>, ms: number): Promise<T> =>
  Promise.race([p, new Promise<T>((_, reject) => setTimeout(() => reject(new Error(`Firestore 逾時 ${ms}ms`)), ms))]);
let isInitialized = false;

export function getFirebaseDb(): Firestore | null {
  if (db) return db;
  try {
    const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    const dbId = (firebaseConfig as any).firestoreDatabaseId || undefined;
    db = dbId ? getFirestore(app, dbId) : getFirestore(app);
    isInitialized = true;
    return db;
  } catch (err) {
    console.warn('[Firebase] Firestore init warning:', err);
    return null;
  }
}

/**
 * Persist every follow-up question and AI answer to Firebase Firestore
 */
export async function saveFollowupToFirestore(
  dialogue: Omit<FollowupDialogueRecord, 'id' | 'timestamp' | 'createdAt'> & { id?: string }
): Promise<FollowupDialogueRecord> {
  const recordId = dialogue.id || `followup_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const now = Date.now();
  const fullRecord: FollowupDialogueRecord = {
    ...dialogue,
    id: recordId,
    timestamp: new Date(now).toLocaleString('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }),
    createdAt: now,
  };

  // Also save to localStorage for instant local access
  try {
    const localKey = 'mmr_followup_dialogues_v1';
    const localRaw = localStorage.getItem(localKey);
    const list: FollowupDialogueRecord[] = localRaw ? JSON.parse(localRaw) : [];
    const updated = [fullRecord, ...list.filter(item => item.id !== recordId)].slice(0, 500);
    localStorage.setItem(localKey, JSON.stringify(updated));
  } catch (e) {
    console.warn('[LocalStorage] Followup backup failed:', e);
  }
  if (fullRecord.paraId) invalidateTrajectoryCounts();

  // Persist to Firebase Firestore
  try {
    const firestore = getFirebaseDb();
    if (firestore) {
      const docRef = doc(firestore, 'followup_dialogues', recordId);
      await withTimeout(setDoc(docRef, fullRecord, { merge: true }), 8000);
      console.log(`[Firebase] Successfully saved follow-up to Firestore: ${recordId}`);
    }
  } catch (err) {
    console.warn('[Firebase] Firestore save error (fallback to local):', err);
  }

  if (fullRecord.paraId) invalidateTrajectoryCounts();
  return fullRecord;
}

/**
 * Fetch all follow-up questions from Firestore
 */
export async function getFollowupDialoguesFromFirestore(limitCount: number = 50): Promise<FollowupDialogueRecord[]> {
  try {
    const firestore = getFirebaseDb();
    if (firestore) {
      const q = query(
        collection(firestore, 'followup_dialogues'),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );
      const snapshot = await getDocs(q);
      const records: FollowupDialogueRecord[] = [];
      snapshot.forEach(docSnap => {
        records.push(docSnap.data() as FollowupDialogueRecord);
      });
      if (records.length > 0) {
        return records;
      }
    }
  } catch (err) {
    console.warn('[Firebase] Failed to fetch followups from Firestore, reading local fallback:', err);
  }

  // Fallback to local
  try {
    const localKey = 'mmr_followup_dialogues_v1';
    const localRaw = localStorage.getItem(localKey);
    return localRaw ? JSON.parse(localRaw) : [];
  } catch {
    return [];
  }
}

/**
 * Persist full analysis record to Firestore
 */
export async function saveAnalysisRecordToFirestore(record: AnalysisRecord): Promise<void> {
  try {
    const firestore = getFirebaseDb();
    if (firestore) {
      const docRef = doc(firestore, 'analysis_records', record.id);
      await setDoc(docRef, record, { merge: true });
      console.log(`[Firebase] Saved analysis record to Firestore: ${record.id}`);
    }
  } catch (err) {
    console.warn('[Firebase] Failed to save analysis record to Firestore:', err);
  }
}

/**
 * Append a follow-up Q&A to an existing AnalysisRecord in Firestore
 */
export async function appendFollowupToAnalysisRecordInFirestore(
  recordId: string, 
  qa: { q: string; a: string; modelUsed?: string }
): Promise<void> {
  const qaEntry = {
    ...qa,
    timestamp: Date.now(),
    modelUsed: qa.modelUsed || 'Gemini',
  };

  try {
    const firestore = getFirebaseDb();
    if (firestore) {
      const docRef = doc(firestore, 'analysis_records', recordId);
      await updateDoc(docRef, {
        followups: arrayUnion(qaEntry)
      });
      console.log(`[Firebase] Appended follow-up to record ${recordId}`);
    }
  } catch (err) {
    console.warn('[Firebase] Error appending follow-up to Firestore record:', err);
  }
}

/**
 * Fetch all analysis records from Firestore
 */
export async function getAnalysisRecordsFromFirestore(): Promise<AnalysisRecord[]> {
  try {
    const firestore = getFirebaseDb();
    if (firestore) {
      const q = query(
        collection(firestore, 'analysis_records'),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      const list: AnalysisRecord[] = [];
      snapshot.forEach(docSnap => {
        list.push(docSnap.data() as AnalysisRecord);
      });
      return list;
    }
  } catch (err) {
    console.warn('[Firebase] Error fetching analysis records from Firestore:', err);
  }
  return [];
}

/**
 * Delete analysis record from Firestore
 */
export async function deleteAnalysisRecordFromFirestore(id: string): Promise<void> {
  try {
    const firestore = getFirebaseDb();
    if (firestore) {
      const docRef = doc(firestore, 'analysis_records', id);
      await deleteDoc(docRef);
      console.log(`[Firebase] Deleted record ${id} from Firestore`);
    }
  } catch (err) {
    console.warn('[Firebase] Error deleting record from Firestore:', err);
  }
}


// =====================================================================
// 學習軌跡：依段落讀回過去的解析與追問（只讀 followup_dialogues，不需另建索引）
// =====================================================================
const LOCAL_KEY = 'mmr_followup_dialogues_v1';
const readLocal = (): FollowupDialogueRecord[] => {
  try { return JSON.parse(localStorage.getItem(LOCAL_KEY) || '[]'); } catch { return []; }
};

export const normalizeQuestion = (q: string) => q.replace(/\s+/g, '').replace(/[？?。.!！，,、：:「」"']/g, '').toLowerCase();

/** 某一段的學習軌跡（依時間先後）；source 表示資料來自雲端資料庫或僅本機 */
export async function getParaTrajectory(paraId: string): Promise<{ records: FollowupDialogueRecord[]; source: 'cloud' | 'local' }> {
  const local = readLocal().filter((r) => r.paraId === paraId);
  let cloud: FollowupDialogueRecord[] | null = null;
  try {
    const firestore = getFirebaseDb();
    if (firestore) {
      const snap = await withTimeout(getDocs(query(collection(firestore, 'followup_dialogues'), where('paraId', '==', paraId), limit(200))), 6000);
      // 連不上伺服器時 SDK 會改回傳本機快取（fromCache），這時不算雲端資料
      if (!snap.metadata.fromCache) {
        cloud = [];
        snap.forEach((d) => cloud!.push(d.data() as FollowupDialogueRecord));
      }
    }
  } catch (err) {
    console.warn('[Firebase] 讀取學習軌跡失敗，改用本機紀錄：', err);
  }
  const map = new Map<string, FollowupDialogueRecord>();
  [...(cloud || []), ...local].forEach((r) => map.set(r.id, r));
  const records = [...map.values()].sort((a, b) => a.createdAt - b.createdAt);
  return { records, source: cloud ? 'cloud' : 'local' };
}

let countsCache: { at: number; counts: Record<string, number> } | null = null;
/** 各段落的學習軌跡筆數（論文翻譯頁的段落標記用；快取 60 秒） */
export async function getTrajectoryCounts(force = false): Promise<Record<string, number>> {
  if (!force && countsCache && Date.now() - countsCache.at < 60_000) return countsCache.counts;
  const seen = new Map<string, string>();
  readLocal().forEach((r) => { if (r.paraId) seen.set(r.id, r.paraId); });
  try {
    const firestore = getFirebaseDb();
    if (firestore) {
      const snap = await withTimeout(getDocs(query(collection(firestore, 'followup_dialogues'), where('sourceModule', '==', 'mmr_reader'), limit(2000))), 6000);
      snap.forEach((d) => { const r = d.data() as FollowupDialogueRecord; if (r.paraId) seen.set(r.id, r.paraId); });
    }
  } catch (err) {
    console.warn('[Firebase] 讀取學習軌跡筆數失敗：', err);
  }
  const counts: Record<string, number> = {};
  seen.forEach((pid) => { counts[pid] = (counts[pid] || 0) + 1; });
  countsCache = { at: Date.now(), counts };
  return counts;
}
export const invalidateTrajectoryCounts = () => { countsCache = null; window.dispatchEvent(new CustomEvent('trajectory-updated')); };
