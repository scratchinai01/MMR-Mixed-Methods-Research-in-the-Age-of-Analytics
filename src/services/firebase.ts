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
}

let db: Firestore | null = null;
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
    const updated = [fullRecord, ...list.filter(item => item.id !== recordId)].slice(0, 100);
    localStorage.setItem(localKey, JSON.stringify(updated));
  } catch (e) {
    console.warn('[LocalStorage] Followup backup failed:', e);
  }

  // Persist to Firebase Firestore
  try {
    const firestore = getFirebaseDb();
    if (firestore) {
      const docRef = doc(firestore, 'followup_dialogues', recordId);
      await setDoc(docRef, fullRecord, { merge: true });
      console.log(`[Firebase] Successfully saved follow-up to Firestore: ${recordId}`);
    }
  } catch (err) {
    console.warn('[Firebase] Firestore save error (fallback to local):', err);
  }

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
    modelUsed: qa.modelUsed || 'Gemini 2.5 Flash',
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
