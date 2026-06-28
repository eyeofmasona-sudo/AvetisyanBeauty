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
    protocol: "Wrinkle Reduction",
    patientDesc: "Natural facial smoothing / 1 Session",
    category: "face",
    beforeImage: "/images/results/wrinkle-before.png",
    afterImage: "/images/results/wrinkle-after.png"
  },
  {
    id: "2",
    protocol: "Golden Sun",
    patientDesc: "Even bronze tone / 1 Session",
    category: "goldensun",
    beforeImage: "/images/services/golden-sun-before-after.png",
    afterImage: "/images/services/golden-sun-before-after.png"
  },
  {
    id: "3",
    protocol: "SMAS Lifting Protocol",
    patientDesc: "Lower face tightening / 1 Session",
    category: "ultraformer",
    beforeImage: "/images/results/smas-before.png",
    afterImage: "/images/results/smas-after.png"
  },
  {
    id: "4",
    protocol: "Skin Rejuvenation",
    patientDesc: "Texture and glow refinement",
    category: "skin",
    beforeImage: "/images/services/skin-rejuvenation-card.png",
    afterImage: "/images/services/skin-rejuvenation-card.png"
  }
];

// No fabricated before/after cases are shipped by default. Real cases are
// populated by the clinic via the admin panel and stored in Firestore.

const defaultCaseById = new Map(defaultCases.map(item => [item.id, item]));

const normalizeGalleryCases = (cases: GalleryCase[] = defaultCases) =>
  cases.map((item) => {
    const defaultCase = defaultCaseById.get(item.id);
    const hasExternalImage = [item.beforeImage, item.afterImage].some(image => image?.includes("images.unsplash.com"));
    const hasOldSmasImages = item.id === "3" && [item.beforeImage, item.afterImage].some(image => image?.includes("/images/results/face-"));

    if (!defaultCase || (!hasExternalImage && !hasOldSmasImages)) {
      return item;
    }

    return {
      ...item,
      protocol: defaultCase.protocol,
      patientDesc: defaultCase.patientDesc,
      category: defaultCase.category,
      beforeImage: defaultCase.beforeImage,
      afterImage: defaultCase.afterImage,
    };
  });

export const loadGalleryFromDB = async () => {
  try {
    const docSnap = await getDoc(doc(db, 'site', 'gallery'));
    if (docSnap.exists()) {
      useGalleryStore.setState({ cases: normalizeGalleryCases(docSnap.data().cases as GalleryCase[]) });
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
        const newCases = normalizeGalleryCases([...get().cases, { ...newCase, id: Date.now().toString() }]);
        set({ cases: newCases });
        await saveGalleryToDB(newCases);
      },
      updateCase: async (id, updatedCase) => {
        const newCases = normalizeGalleryCases(get().cases.map(c => c.id === id ? { ...c, ...updatedCase } : c));
        set({ cases: newCases });
        await saveGalleryToDB(newCases);
      },
      deleteCase: async (id) => {
        const newCases = normalizeGalleryCases(get().cases.filter(c => c.id !== id));
        set({ cases: newCases });
        await saveGalleryToDB(newCases);
      }
    }),
    {
      name: 'golden-sun-gallery'
    }
  )
);
