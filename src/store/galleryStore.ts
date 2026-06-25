import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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
  addCase: (newCase: Omit<GalleryCase, 'id'>) => void;
  updateCase: (id: string, updatedCase: Omit<GalleryCase, 'id'>) => void;
  deleteCase: (id: string) => void;
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

export const useGalleryStore = create<GalleryStore>()(
  persist(
    (set) => ({
      cases: defaultCases,
      addCase: (newCase) => set((state) => ({
        cases: [...state.cases, { ...newCase, id: Date.now().toString() }]
      })),
      updateCase: (id, updatedCase) => set((state) => ({
        cases: state.cases.map(c => c.id === id ? { ...c, ...updatedCase } : c)
      })),
      deleteCase: (id) => set((state) => ({
        cases: state.cases.filter(c => c.id !== id)
      }))
    }),
    {
      name: 'golden-sun-gallery'
    }
  )
);
