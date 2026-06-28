import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { db } from '../lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export interface GalleryCase {
  id: string;
  protocol: string;
  patientDesc: string;
  category: string;
  beforeLabel?: string;
  afterLabel?: string;
  beforeImage?: string;
  afterImage?: string;
}

interface GalleryStore {
  cases: GalleryCase[];
  addCase: (newCase: Omit<GalleryCase, 'id'>) => Promise<void>;
  updateCase: (id: string, updatedCase: Omit<GalleryCase, 'id'>) => Promise<void>;
  deleteCase: (id: string) => Promise<void>;
}

// No fabricated before/after cases are shipped by default. Real cases are
// populated by the clinic via the admin panel and stored in Firestore.
const defaultCases: GalleryCase[] = [];

export const loadGalleryFromDB = async () => {
  try {
    const docSnap = await getDoc(doc(db, 'site', 'gallery'));
    if (docSnap.exists()) {
      useGalleryStore.setState({ cases: docSnap.data().cases as GalleryCase[] });
    }
  } catch (e) {
    console.error("Failed to load gallery from DB", e);
  }
};

export const saveGalleryToDB = async (cases: GalleryCase[]) => {
  try {
    const cleanCases = JSON.parse(JSON.stringify(cases));
    await setDoc(doc(db, 'site', 'gallery'), { cases: cleanCases }, { merge: true });
  } catch (e) {
    console.error("Failed to save gallery to DB", e);
    throw e;
  }
};

export const useGalleryStore = create<GalleryStore>()(
  persist(
    (set, get) => ({
      cases: defaultCases,
      addCase: async (newCase) => {
        const newCases = [...get().cases, { ...newCase, id: Date.now().toString() }];
        set({ cases: newCases });
        await saveGalleryToDB(newCases);
      },
      updateCase: async (id, updatedCase) => {
        const newCases = get().cases.map(c => c.id === id ? { ...c, ...updatedCase } : c);
        set({ cases: newCases });
        await saveGalleryToDB(newCases);
      },
      deleteCase: async (id) => {
        const newCases = get().cases.filter(c => c.id !== id);
        set({ cases: newCases });
        await saveGalleryToDB(newCases);
      }
    }),
    {
      name: 'golden-sun-gallery'
    }
  )
);
