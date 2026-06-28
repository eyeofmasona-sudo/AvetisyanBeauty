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

export const defaultGalleryVideos: SiteVideo[] = [
  {
    id: 'clinic-video-1',
    title: '',
    description: '',
    videoUrl: '/videos/gallery/clinic-video-1.mp4',
    order: 1,
    isActive: true,
  },
  {
    id: 'clinic-video-3',
    title: '',
    description: '',
    videoUrl: '/videos/gallery/clinic-video-3.mp4',
    order: 2,
    isActive: true,
  },
];

const blockedVideoIds = new Set(['clinic-video-2']);

const sanitizeVideos = (videos: SiteVideo[] = []) =>
  videos
    .filter(video => !blockedVideoIds.has(video.id))
    .sort((a, b) => a.order - b.order);

const defaultSettings: SiteSettings = {
  whatsappNumber: '+37433101077',
  videos: defaultGalleryVideos,
  heroVideoUrl: '/videos/hero-background.mp4',
  heroVideoMobileUrl: '/videos/hero-background-mobile.mp4'
};

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
          videos: sanitizeVideos([...currentVideos, video])
        };
        set({ settings: newSettings });
        await get().saveToDB(newSettings);
      },
      
      updateVideo: async (id, videoData) => {
        const currentVideos = get().settings?.videos || [];
        const newSettings = {
          ...get().settings,
          videos: sanitizeVideos(currentVideos.map(v => v.id === id ? { ...v, ...videoData } : v))
        };
        set({ settings: newSettings });
        await get().saveToDB(newSettings);
      },
      
      deleteVideo: async (id) => {
        const currentVideos = get().settings?.videos || [];
        const newSettings = {
          ...get().settings,
          videos: sanitizeVideos(currentVideos.filter(v => v.id !== id))
        };
        set({ settings: newSettings });
        await get().saveToDB(newSettings);
      },
      
      setVideos: async (videos) => {
        const newSettings = { ...get().settings, videos: sanitizeVideos(videos) };
        set({ settings: newSettings });
        await get().saveToDB(newSettings);
      },
      
      loadFromDB: async () => {
        try {
          const docSnap = await getDoc(doc(db, 'site', 'settings'));
          if (docSnap.exists()) {
            const loadedSettings = { ...defaultSettings, ...docSnap.data() as SiteSettings };
            set({
              settings: {
                ...loadedSettings,
                videos: sanitizeVideos(loadedSettings.videos || defaultGalleryVideos),
              },
            });
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
