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

const defaultCases: GalleryCase[] = [
  {
    id: "1",
    protocol: "Ultraformer III",
    patientDesc: "Patient: 42 y.o. / 1 Session",
    category: "ultraformer",
    beforeImage: "https://images.unsplash.com/photo-1515377905703-c4788e51af15?q=80&w=1000&auto=format&fit=crop",
    afterImage: "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?q=80&w=1000&auto=format&fit=crop"
  },
  {
    id: "2",
    protocol: "Golden Sun",
    patientDesc: "Patient: 35 y.o. / 3 Sessions",
    category: "goldensun",
    beforeImage: "https://images.unsplash.com/photo-1549405622-c38a221f148e?q=80&w=1000&auto=format&fit=crop",
    afterImage: "https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?q=80&w=1000&auto=format&fit=crop"
  },
  {
    id: "3",
    protocol: "Skin Rejuvenation",
    patientDesc: "Patient: 28 y.o. / 5 Sessions",
    category: "skin",
    beforeImage: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?q=80&w=1000&auto=format&fit=crop",
    afterImage: "https://images.unsplash.com/photo-1552693673-1bf958298935?q=80&w=1000&auto=format&fit=crop"
  },
  {
    id: "4",
    protocol: "SMAS Lifting Protocol",
    patientDesc: "Patient: 45 y.o. / 2 Sessions",
    category: "face",
    beforeImage: "https://images.unsplash.com/photo-1596755389378-c31d21fd1273?q=80&w=1000&auto=format&fit=crop",
    afterImage: "https://images.unsplash.com/photo-1533423996375-f91444985df2?q=80&w=1000&auto=format&fit=crop"
  }
];

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
