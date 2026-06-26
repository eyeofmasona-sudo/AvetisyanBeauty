import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { db } from '../lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export interface SiteVideo {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  posterUrl?: string;
  order: number;
  isActive: boolean;
}

export interface SiteSettings {
  whatsappNumber: string;
  videos: SiteVideo[];
}

const defaultSettings: SiteSettings = {
  whatsappNumber: '+37433101077',
  videos: []
};

interface SettingsState {
  settings: SiteSettings;
  updateWhatsapp: (number: string) => void;
  addVideo: (video: SiteVideo) => void;
  updateVideo: (id: string, video: Partial<SiteVideo>) => void;
  deleteVideo: (id: string) => void;
  setVideos: (videos: SiteVideo[]) => void;
  loadFromDB: () => Promise<void>;
  saveToDB: (settings: SiteSettings) => Promise<void>;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      settings: defaultSettings,
      
      updateWhatsapp: async (number) => {
        const newSettings = { ...get().settings, whatsappNumber: number };
        set({ settings: newSettings });
        await get().saveToDB(newSettings);
      },
      
      addVideo: async (video) => {
        const currentVideos = get().settings?.videos || [];
        const newSettings = { 
          ...get().settings, 
          videos: [...currentVideos, video].sort((a, b) => a.order - b.order)
        };
        set({ settings: newSettings });
        await get().saveToDB(newSettings);
      },
      
      updateVideo: async (id, videoData) => {
        const currentVideos = get().settings?.videos || [];
        const newSettings = {
          ...get().settings,
          videos: currentVideos.map(v => v.id === id ? { ...v, ...videoData } : v).sort((a, b) => a.order - b.order)
        };
        set({ settings: newSettings });
        await get().saveToDB(newSettings);
      },
      
      deleteVideo: async (id) => {
        const currentVideos = get().settings?.videos || [];
        const newSettings = {
          ...get().settings,
          videos: currentVideos.filter(v => v.id !== id)
        };
        set({ settings: newSettings });
        await get().saveToDB(newSettings);
      },
      
      setVideos: async (videos) => {
        const newSettings = { ...get().settings, videos };
        set({ settings: newSettings });
        await get().saveToDB(newSettings);
      },
      
      loadFromDB: async () => {
        try {
          const docSnap = await getDoc(doc(db, 'site', 'settings'));
          if (docSnap.exists()) {
            set({ settings: { ...defaultSettings, ...docSnap.data() as SiteSettings } });
          }
        } catch (e) {
          console.error("Failed to load settings from DB", e);
        }
      },
      
      saveToDB: async (settings) => {
        try {
          await setDoc(doc(db, 'site', 'settings'), settings);
        } catch (e) {
          console.error("Failed to save settings to DB", e);
        }
      }
    }),
    {
      name: 'avetisyan-site-settings'
    }
  )
);
