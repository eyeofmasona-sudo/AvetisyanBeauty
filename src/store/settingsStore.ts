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
  heroVideoUrl?: string;
  heroVideoMobileUrl?: string;
}

const defaultSettings: SiteSettings = {
  whatsappNumber: '+37433101077',
  videos: [],
  heroVideoUrl: '/videos/hero-background.mp4',
  heroVideoMobileUrl: '/videos/hero-background-mobile.mp4'
};

// Older settings docs stored the desktop path as the mobile fallback too,
// since no dedicated mobile video existed yet. Treat that legacy value as
// "unset" so the new dedicated mobile video applies automatically.
const LEGACY_MOBILE_URL = '/videos/hero-background.mp4';

interface SettingsState {
  settings: SiteSettings;
  updateWhatsapp: (number: string) => Promise<void>;
  updateHeroVideoUrl: (url: string, mobileUrl?: string) => Promise<void>;
  addVideo: (video: SiteVideo) => Promise<void>;
  updateVideo: (id: string, video: Partial<SiteVideo>) => Promise<void>;
  deleteVideo: (id: string) => Promise<void>;
  setVideos: (videos: SiteVideo[]) => Promise<void>;
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
      
      updateHeroVideoUrl: async (url, mobileUrl) => {
        const newSettings = { ...get().settings, heroVideoUrl: url };
        if (mobileUrl !== undefined) {
          newSettings.heroVideoMobileUrl = mobileUrl;
        }
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
            const dbSettings = docSnap.data() as SiteSettings;
            if (dbSettings.heroVideoMobileUrl === LEGACY_MOBILE_URL) {
              delete dbSettings.heroVideoMobileUrl;
            }
            set({ settings: { ...defaultSettings, ...dbSettings } });
          }
        } catch (e) {
          console.error("Failed to load settings from DB", e);
        }
      },
      
      saveToDB: async (settings) => {
        try {
          // Firebase doesn't allow undefined values, we serialize and deserialize to strip them
          const cleanSettings = JSON.parse(JSON.stringify(settings));
          await setDoc(doc(db, 'site', 'settings'), cleanSettings, { merge: true });
        } catch (e) {
          console.error("Failed to save settings to DB", e);
          throw e;
        }
      }
    }),
    {
      name: 'avetisyan-site-settings'
    }
  )
);
