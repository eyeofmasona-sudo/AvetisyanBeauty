import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../lib/supabase';

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
// populated by the clinic via the admin panel and stored in Supabase.
const defaultCases: GalleryCase[] = [];

export const loadGalleryFromDB = async () => {
  try {
    const { data, error } = await supabase
      .from('site')
      .select('data')
      .eq('key', 'gallery')
      .maybeSingle();

    if (error) throw error;
    if (data?.data?.cases) {
      useGalleryStore.setState({ cases: data.data.cases as GalleryCase[] });
    }
  } catch (e) {
    console.error("Failed to load gallery from DB", e);
  }
};

export const saveGalleryToDB = async (cases: GalleryCase[]) => {
  try {
    // Routed through the admin-only backend endpoint (cookie-authenticated).
    const res = await fetch('/api/db/site/gallery', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ cases }),
    });
    if (!res.ok) throw new Error('Failed to save gallery');
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
