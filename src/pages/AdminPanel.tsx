import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { useGalleryStore, GalleryCase } from "../store/galleryStore";
import { useContentStore } from "../store/contentStore";
import { useSettingsStore, SiteVideo } from "../store/settingsStore";
import { SEO } from "../components/SEO";
import { 
  Trash2, Edit2, Plus, X, 
  LayoutDashboard, Sparkles, Image as ImageIcon, 
  Users, Star, FileText,
  TrendingUp, BarChart3, Settings, BrainCircuit,
  Instagram, CheckCircle, Loader2, LogOut, Video
} from "lucide-react";
import { AIPanel } from "../components/AIPanel";
import { AIAssistantModule } from "../components/AIAssistantModule";
import { instagramService } from "../services/instagramService";
import { db, auth } from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

export function AdminPanel() {
  const { t } = useTranslation();
  const { cases, addCase, updateCase, deleteCase } = useGalleryStore();
  const { settings, updateWhatsapp, updateHeroVideoUrl, addVideo, updateVideo, deleteVideo } = useSettingsStore();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const [editingServiceData, setEditingServiceData] = useState<any>(null);
  const [editingSpecialistId, setEditingSpecialistId] = useState<string | null>(null);
  const [editingSpecialistData, setEditingSpecialistData] = useState<any>(null);
  
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [editingVideoId, setEditingVideoId] = useState<string | null>(null);
  const [videoFormData, setVideoFormData] = useState<Omit<SiteVideo, 'id'>>({
    title: "", description: "", videoUrl: "", posterUrl: "", order: 0, isActive: true
  });
  const [waNumberInput, setWaNumberInput] = useState(settings?.whatsappNumber || "");
  const [isWaSaving, setIsWaSaving] = useState(false);
  const [waSaveSuccess, setWaSaveSuccess] = useState(false);
  
  const [heroVideoInput, setHeroVideoInput] = useState(settings?.heroVideoUrl || "/videos/hero-background.mp4");
  const [heroVideoMobileInput, setHeroVideoMobileInput] = useState(settings?.heroVideoMobileUrl || "/videos/hero-background.mp4");
  const [isHeroSaving, setIsHeroSaving] = useState(false);
  const [heroSaveSuccess, setHeroSaveSuccess] = useState(false);

  useEffect(() => {
    if (settings?.whatsappNumber) setWaNumberInput(settings.whatsappNumber);
    if (settings?.heroVideoUrl) setHeroVideoInput(settings.heroVideoUrl);
    if (settings?.heroVideoMobileUrl) setHeroVideoMobileInput(settings.heroVideoMobileUrl);
  }, [settings?.whatsappNumber, settings?.heroVideoUrl, settings?.heroVideoMobileUrl]);

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [loginError, setLoginError] = useState('');
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });

  const uploadFile = async (file: File): Promise<string> => {
    try {
      const { storage } = await import('../lib/firebase');
      const { ref, uploadBytes, getDownloadURL } = await import('firebase/storage');
      const fileName = `uploads/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
      const storageRef = ref(storage, fileName);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      return downloadURL;
    } catch (e: any) {
      console.error("Firebase upload error:", e);
      // Fallback to local server upload if Firebase storage fails (e.g., missing bucket/permissions)
      const formData = new FormData();
      formData.append('file', file);
      const response = await fetch('/api/upload', {
        method: 'POST',
        credentials: 'include',
        body: formData
      });
      if (!response.ok) {
        throw new Error('Upload failed');
      }
      const data = await response.json();
      return data.url;
    }
  };

  useEffect(() => {
    import('firebase/auth').then(({ onAuthStateChanged }) => {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        if (user && user.email === 'eyeofmasona@gmail.com') {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
        setIsAuthLoading(false);
      });
      return () => unsubscribe();
    });
  }, []);
  const [formData, setFormData] = useState<Omit<GalleryCase, 'id'>>({
    protocol: "",
    patientDesc: "",
    category: "face"
  });

  const [isConnectingInstagram, setIsConnectingInstagram] = useState(false);
  const [tempInstaHandle, setTempInstaHandle] = useState('');
  const [isConnectingSecondInstagram, setIsConnectingSecondInstagram] = useState(false);
  const [tempSecondInstaHandle, setTempSecondInstaHandle] = useState('');
  const [isSyncingInstagram, setIsSyncingInstagram] = useState(false);

  const { content, updateContent, instagramPosts, updateInstagramPost, setInstagramPosts, instagramConnected, instagramHandle, connectInstagram, disconnectInstagram, secondInstagramConnected, secondInstagramHandle, connectSecondInstagram, disconnectSecondInstagram } = useContentStore();

  useEffect(() => {
    setWaNumberInput(settings?.whatsappNumber || "");
  }, [settings?.whatsappNumber]);

  useEffect(() => {
    if (isAuthenticated) {
      instagramService.fetchStatus().then(statusList => {
        statusList.forEach((status: any) => {
          if (status.accountIndex === 0) {
            if (status.connected) {
              connectInstagram(status.handle || instagramHandle);
            } else {
              disconnectInstagram();
            }
          } else if (status.accountIndex === 1) {
            if (status.connected) {
              connectSecondInstagram(status.handle || secondInstagramHandle);
            } else {
              disconnectSecondInstagram();
            }
          }
        });
      });
    }
  }, [isAuthenticated]);

  const handleOpenModal = (caseItem?: GalleryCase) => {
    if (caseItem) {
      setEditingId(caseItem.id);
      setFormData({
        protocol: caseItem.protocol,
        patientDesc: caseItem.patientDesc,
        category: caseItem.category,
        beforeLabel: caseItem.beforeLabel || "",
        afterLabel: caseItem.afterLabel || ""
      });
    } else {
      setEditingId(null);
      setFormData({
        protocol: "",
        patientDesc: "",
        category: "face",
        beforeLabel: "",
        afterLabel: ""
      });
    }
    setIsModalOpen(true);
  };

  const handleOpenVideoModal = (video?: SiteVideo) => {
    if (video) {
      setEditingVideoId(video.id);
      setVideoFormData({
        title: video.title,
        description: video.description,
        videoUrl: video.videoUrl,
        posterUrl: video.posterUrl || "",
        order: video.order,
        isActive: video.isActive
      });
    } else {
      setEditingVideoId(null);
      setVideoFormData({
        title: "",
        description: "",
        videoUrl: "",
        posterUrl: "",
        order: (settings?.videos?.length || 0) + 1,
        isActive: true
      });
    }
    setIsVideoModalOpen(true);
  };

  const handleSaveVideo = async () => {
    try {
      if (editingVideoId) {
        await updateVideo(editingVideoId, videoFormData);
      } else {
        await addVideo({ id: Date.now().toString(), ...videoFormData });
      }
      setIsVideoModalOpen(false);
      alert("Видео успешно сохранено! / Video successfully saved!");
    } catch (error) {
      alert("Ошибка при сохранении видео / Error saving video");
    }
  };

  const handleSave = async () => {
    try {
      if (editingId) {
        await updateCase(editingId, formData);
      } else {
        await addCase(formData);
      }
      setIsModalOpen(false);
      alert("Кейс успешно сохранен! / Case successfully saved!");
    } catch (error) {
      alert("Ошибка при сохранении кейса / Error saving case");
    }
  };

  const handleToggleVideoStatus = async (video: SiteVideo) => {
    try {
      await updateVideo(video.id, { isActive: !video.isActive });
      alert("Статус видео обновлен! / Video status updated!");
    } catch (error) {
      alert("Ошибка при обновлении статуса видео / Error updating video status");
    }
  };

  const handleDeleteVideo = async (id: string) => {
    if (window.confirm('Delete this video? / Удалить это видео?')) {
      try {
        await deleteVideo(id);
        alert("Видео успешно удалено! / Video successfully deleted!");
      } catch (error) {
        alert("Ошибка при удалении видео / Error deleting video");
      }
    }
  };

  const handleDeleteCase = async (id: string) => {
    if (window.confirm('Delete this case? / Удалить этот кейс?')) {
      try {
        await deleteCase(id);
        alert("Кейс успешно удален! / Case successfully deleted!");
      } catch (error) {
        alert("Ошибка при удалении кейса / Error deleting case");
      }
    }
  };

  const handleContentChange = (lang: 'hy' | 'ru' | 'en', section: keyof typeof content['hy'], field: string, value: string) => {
    updateContent(lang, section, { [field]: value }).catch((e) => {
      console.error("Error saving content change", e);
    });
  };

  const menuItems = [
    { id: "dashboard", icon: LayoutDashboard, label: t("admin.dashboard") },
    { id: "ai_assistant", icon: BrainCircuit, label: "AI Assistant" },
    { id: "ai_marketing", icon: Sparkles, label: "AI Marketing" },
    { id: "content", icon: FileText, label: t("admin.content", "Content") },
    { id: "instagram", icon: ImageIcon, label: t("admin.instagramConnect", "Instagram Connect") },
    { id: "settings", icon: Settings, label: "Site Settings" },
    { id: "services", icon: Sparkles, label: t("admin.services") },
    { id: "beforeAfter", icon: ImageIcon, label: t("admin.beforeAfter") },
    { id: "specialists", icon: Users, label: t("admin.specialists") },
  ];

  const handleLogin = async (e?: React.FormEvent | React.MouseEvent) => {
    if (e) e.preventDefault();
    setLoginError('');
    try {
      const { signInWithPopup, GoogleAuthProvider, signOut } = await import('firebase/auth');
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      if (result.user.email === 'eyeofmasona@gmail.com') {
        const idToken = await result.user.getIdToken();
        const res = await fetch('/api/auth/login-firebase', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ idToken })
        });
        const data = await res.json();
        if (data.success) {
          setIsAuthenticated(true);
        } else {
          setLoginError('Backend auth failed: ' + data.error);
          await signOut(auth);
        }
      } else {
        setLoginError('Unauthorized email: ' + result.user.email);
        const { signOut } = await import('firebase/auth');
        await signOut(auth);
      }
    } catch (error: any) {
      console.error("Login failed:", error);
      setLoginError(error.message || 'Authentication failed');
    }
  };

  const handleLogout = async () => {
    try {
      const { signOut } = await import('firebase/auth');
      await signOut(auth);
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
      setIsAuthenticated(false);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  if (isAuthLoading) {
    return (
      <div className="bg-pearl min-h-screen text-graphite flex flex-col items-center justify-center p-6">
        <Loader2 className="animate-spin text-gold" size={48} />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="bg-pearl min-h-screen text-graphite flex flex-col items-center justify-center p-6 selection:bg-gold/30 selection:text-graphite">
        <SEO titleKey="seo.admin.title" descriptionKey="seo.admin.description" noindex />
        <div className="bg-white w-full max-w-md rounded-[2rem] p-10 shadow-lg border border-graphite/5 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-gold/40 via-gold to-gold/40"></div>
          <div className="text-center mb-8">
            <h1 className="font-display text-3xl text-graphite mb-2">{t("admin.portalTitle", "Admin Portal")}</h1>
            <p className="text-graphite/60 text-sm">{t("admin.portalDesc", "Secure access to Avetisyan Beauty Clinic management")}</p>
          </div>
          <div className="space-y-6">
            {loginError && <div className="p-3 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100">{loginError}</div>}
            <button 
              onClick={handleLogin} 
              className="w-full bg-graphite text-white px-8 py-3.5 rounded-xl hover:bg-gold transition-colors font-medium text-sm tracking-wide mt-4"
            >
              Sign In with Google
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-pearl min-h-screen text-graphite selection:bg-gold/30 selection:text-graphite">
      <SEO titleKey="seo.admin.title" descriptionKey="seo.admin.description" noindex />
      <Navbar onBookClick={() => {}} />

      <main className="pt-32 pb-24">
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex flex-col md:flex-row gap-8">
          
          {/* Sidebar */}
          <aside className="w-full md:w-64 flex-shrink-0">
            <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-graphite/5 sticky top-32">
              <h2 className="font-display text-xl mb-6 px-4 flex justify-between items-center">
                <span>{t("admin.title")}</span>
                <button onClick={handleLogout} className="text-graphite/40 hover:text-graphite transition-colors" title="Log out">
                  <LogOut size={18} />
                </button>
              </h2>
              <nav className="flex flex-col gap-1">
                {menuItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-medium ${
                      activeTab === item.id 
                        ? "bg-graphite text-white shadow-md" 
                        : "text-graphite/60 hover:bg-pearl hover:text-graphite"
                    }`}
                  >
                    <item.icon size={18} className={activeTab === item.id ? "text-gold" : ""} />
                    {item.label}
                  </button>
                ))}
              </nav>
            </div>
          </aside>

          {/* Main Content Area */}
          <div className="flex-1">
            {activeTab === "dashboard" && (
              <div className="space-y-6">
                <div className="flex justify-between items-center mb-4">
                  <h1 className="font-display text-3xl text-graphite">
                    {t("admin.dashboard")}
                  </h1>
                </div>

                <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-graphite/5 mt-8">
                  <h3 className="font-display text-2xl text-graphite mb-6">{t("admin.recentBookings")}</h3>
                  <p className="text-graphite/40 text-center py-12">{t("admin.noBookings")}</p>
                </div>
              </div>
            )}

            {activeTab === "content" && (
              <div>
                <div className="flex justify-between items-center mb-8">
                  <h1 className="font-display text-3xl text-graphite">
                    {t("admin.content", "Content Management")}
                  </h1>
                </div>

                <div className="space-y-8">
                  {(['hy', 'ru', 'en'] as const).map(lang => (
                    <div key={lang} className="bg-white rounded-[2rem] p-8 shadow-sm border border-graphite/5">
                      <h2 className="text-xl font-display mb-6 capitalize">{lang} Language</h2>
                      
                      {/* Hero Section */}
                      <div className="mb-8">
                        <h3 className="font-medium text-lg mb-4 text-graphite/80 border-b border-graphite/10 pb-2">Hero Section</h3>
                        <div className="grid gap-4">
                          <div>
                            <label className="block text-sm font-medium text-graphite/60 mb-1">Title</label>
                            <input type="text" className="w-full border border-graphite/10 rounded-xl px-4 py-2 focus:outline-none focus:border-gold" 
                              value={content[lang].hero.title}
                              onChange={(e) => handleContentChange(lang, 'hero', 'title', e.target.value)}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-graphite/60 mb-1">Subtitle</label>
                            <input type="text" className="w-full border border-graphite/10 rounded-xl px-4 py-2 focus:outline-none focus:border-gold" 
                              value={content[lang].hero.subtitle}
                              onChange={(e) => handleContentChange(lang, 'hero', 'subtitle', e.target.value)}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-graphite/60 mb-1">Description</label>
                            <textarea className="w-full border border-graphite/10 rounded-xl px-4 py-2 focus:outline-none focus:border-gold" rows={3}
                              value={content[lang].hero.description}
                              onChange={(e) => handleContentChange(lang, 'hero', 'description', e.target.value)}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Services Section */}
                      <div className="mb-8">
                        <h3 className="font-medium text-lg mb-4 text-graphite/80 border-b border-graphite/10 pb-2">Services Section</h3>
                        <div className="grid gap-4">
                          <div>
                            <label className="block text-sm font-medium text-graphite/60 mb-1">Title</label>
                            <input type="text" className="w-full border border-graphite/10 rounded-xl px-4 py-2 focus:outline-none focus:border-gold" 
                              value={content[lang].services.title}
                              onChange={(e) => handleContentChange(lang, 'services', 'title', e.target.value)}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-graphite/60 mb-1">Description</label>
                            <textarea className="w-full border border-graphite/10 rounded-xl px-4 py-2 focus:outline-none focus:border-gold" rows={3}
                              value={content[lang].services.description}
                              onChange={(e) => handleContentChange(lang, 'services', 'description', e.target.value)}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Specialists Section */}
                      <div className="mb-8">
                        <h3 className="font-medium text-lg mb-4 text-graphite/80 border-b border-graphite/10 pb-2">Specialists Section</h3>
                        <div className="grid gap-4">
                          <div>
                            <label className="block text-sm font-medium text-graphite/60 mb-1">Title</label>
                            <input type="text" className="w-full border border-graphite/10 rounded-xl px-4 py-2 focus:outline-none focus:border-gold" 
                              value={content[lang].specialists.title}
                              onChange={(e) => handleContentChange(lang, 'specialists', 'title', e.target.value)}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-graphite/60 mb-1">Description</label>
                            <textarea className="w-full border border-graphite/10 rounded-xl px-4 py-2 focus:outline-none focus:border-gold" rows={3}
                              value={content[lang].specialists.description}
                              onChange={(e) => handleContentChange(lang, 'specialists', 'description', e.target.value)}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Results Section */}
                      <div className="mb-8">
                        <h3 className="font-medium text-lg mb-4 text-graphite/80 border-b border-graphite/10 pb-2">Results Section</h3>
                        <div className="grid gap-4">
                          <div>
                            <label className="block text-sm font-medium text-graphite/60 mb-1">Title</label>
                            <input type="text" className="w-full border border-graphite/10 rounded-xl px-4 py-2 focus:outline-none focus:border-gold" 
                              value={content[lang].results?.title || ''}
                              onChange={(e) => handleContentChange(lang, 'results', 'title', e.target.value)}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-graphite/60 mb-1">Description</label>
                            <textarea className="w-full border border-graphite/10 rounded-xl px-4 py-2 focus:outline-none focus:border-gold" rows={3}
                              value={content[lang].results?.description || ''}
                              onChange={(e) => handleContentChange(lang, 'results', 'description', e.target.value)}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Trust Section */}
                      <div className="mb-8">
                        <h3 className="font-medium text-lg mb-4 text-graphite/80 border-b border-graphite/10 pb-2">Trust Section</h3>
                        <div className="grid gap-4">
                          <div>
                            <label className="block text-sm font-medium text-graphite/60 mb-1">Title</label>
                            <input type="text" className="w-full border border-graphite/10 rounded-xl px-4 py-2 focus:outline-none focus:border-gold" 
                              value={content[lang].trust?.title || ''}
                              onChange={(e) => handleContentChange(lang, 'trust', 'title', e.target.value)}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-graphite/60 mb-1">Description</label>
                            <textarea className="w-full border border-graphite/10 rounded-xl px-4 py-2 focus:outline-none focus:border-gold" rows={3}
                              value={content[lang].trust?.description || ''}
                              onChange={(e) => handleContentChange(lang, 'trust', 'description', e.target.value)}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Instagram Section */}
                      <div>
                        <h3 className="font-medium text-lg mb-4 text-graphite/80 border-b border-graphite/10 pb-2">Instagram Section</h3>
                        <div className="grid gap-4">
                          <div>
                            <label className="block text-sm font-medium text-graphite/60 mb-1">Title</label>
                            <input type="text" className="w-full border border-graphite/10 rounded-xl px-4 py-2 focus:outline-none focus:border-gold" 
                              value={content[lang].insta?.title || ''}
                              onChange={(e) => handleContentChange(lang, 'insta', 'title', e.target.value)}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-graphite/60 mb-1">Description</label>
                            <textarea className="w-full border border-graphite/10 rounded-xl px-4 py-2 focus:outline-none focus:border-gold" rows={3}
                              value={content[lang].insta?.description || ''}
                              onChange={(e) => handleContentChange(lang, 'insta', 'description', e.target.value)}
                            />
                          </div>
                        </div>
                      </div>

                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "services" && (
              <div>
                <div className="flex justify-between items-center mb-8">
                  <h1 className="font-display text-3xl text-graphite">
                    {t("admin.services")}
                  </h1>
                  <button 
                    onClick={() => {
                      const newId = 'service_' + Date.now();
                      const newService = { id: newId, title: 'New Service', description: 'Description', tag: '', price: '', image_url: '' };
                      ['hy', 'ru', 'en'].forEach(lang => {
                        const l = lang as 'hy' | 'ru' | 'en';
                        const items = [...(content[l]?.services?.items || [])];
                        items.push(newService);
                        updateContent(l, 'services', { items });
                      });
                      setEditingServiceId(newId);
                      setEditingServiceData(newService);
                    }}
                    className="flex items-center gap-2 bg-graphite text-white px-5 py-2.5 rounded-full hover:bg-gold transition-colors text-sm font-medium"
                  >
                    <Plus size={16} />
                    {t("admin.addNewService")}
                  </button>
                </div>

                <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-graphite/5">
                  <div className="space-y-4">
                    {(content['hy']?.services?.items || []).map((s, i) => (
                      <div key={s.id} className="flex flex-col p-4 border border-graphite/10 rounded-2xl hover:border-gold/30 transition-colors gap-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                          <div className="flex items-center gap-4">
                            {s.image_url ? (
                              <img src={s.image_url || undefined} alt={s.title} className="w-16 h-16 object-cover rounded-xl" />
                            ) : (
                              <div className="w-16 h-16 bg-pearl rounded-xl flex items-center justify-center">
                                <ImageIcon size={24} className="text-graphite/20" />
                              </div>
                            )}
                            <h4 className="font-medium text-lg text-graphite">{s.title}</h4>
                            {s.price && <span className="text-sm text-gold ml-2">{s.price}</span>}
                          </div>
                          <div className="flex items-center gap-6">
                            <div className="flex gap-2">
                              <button 
                                onClick={() => {
                                  setEditingServiceId(editingServiceId === s.id ? null : s.id);
                                  setEditingServiceData({ ...s });
                                }}
                                className="p-2 text-graphite/40 hover:text-gold transition-colors"
                              >
                                <Edit2 size={20} />
                              </button>
                              <button 
                                onClick={() => {
                                  if (window.confirm("Delete this service?")) {
                                    ['hy', 'ru', 'en'].forEach(lang => {
                                      const items = (content[lang as 'hy' | 'ru' | 'en']?.services?.items || []).filter(item => item.id !== s.id);
                                      updateContent(lang as 'hy' | 'ru' | 'en', 'services', { items });
                                    });
                                  }
                                }}
                                className="p-2 text-graphite/40 hover:text-red-500 transition-colors"
                              >
                                <Trash2 size={20} />
                              </button>
                            </div>
                          </div>
                        </div>
                        {editingServiceId === s.id && editingServiceData && (
                          <div className="mt-4 pt-4 border-t border-graphite/5 space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-xs font-medium text-graphite/60 uppercase tracking-widest mb-2">Title</label>
                                <input 
                                  type="text" 
                                  value={editingServiceData.title}
                                  onChange={(e) => setEditingServiceData({...editingServiceData, title: e.target.value})}
                                  className="w-full bg-pearl border-none rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gold/30"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-graphite/60 uppercase tracking-widest mb-2">Price</label>
                                <input 
                                  type="text" 
                                  value={editingServiceData.price || ''}
                                  onChange={(e) => setEditingServiceData({...editingServiceData, price: e.target.value})}
                                  className="w-full bg-pearl border-none rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gold/30"
                                />
                              </div>
                              <div className="sm:col-span-2">
                                <label className="block text-xs font-medium text-graphite/60 uppercase tracking-widest mb-2">Description</label>
                                <textarea 
                                  value={editingServiceData.description}
                                  onChange={(e) => setEditingServiceData({...editingServiceData, description: e.target.value})}
                                  className="w-full bg-pearl border-none rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gold/30 h-24 resize-none"
                                />
                              </div>
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-graphite/60 uppercase tracking-widest mb-2">Image URL or Upload</label>
                              <div className="flex gap-4">
                                <input 
                                  type="text" 
                                  value={editingServiceData.image_url || ''}
                                  onChange={(e) => setEditingServiceData({...editingServiceData, image_url: e.target.value})}
                                  className="flex-1 bg-pearl border-none rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gold/30"
                                  placeholder="https://images.unsplash.com/..."
                                />
                                <div className="relative flex items-center justify-center">
                                  <input 
                                    type="file"
                                    accept="image/*"
                                    onChange={async (e) => {
                                      const file = e.target.files?.[0];
                                      if (file) {
                                        try {
                                          const url = await uploadFile(file);
                                          setEditingServiceData({...editingServiceData, image_url: url});
                                        } catch (err) {
                                          alert("Upload failed");
                                        }
                                      }
                                    }}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                  />
                                  <button className="px-6 py-3 rounded-xl text-sm font-medium bg-graphite text-white hover:bg-gold transition-colors flex items-center gap-2">
                                    <ImageIcon size={18} />
                                    Upload
                                  </button>
                                </div>
                              </div>
                            </div>
                            <div className="flex justify-end gap-2 mt-4">
                              <button 
                                onClick={() => setEditingServiceId(null)}
                                className="px-4 py-2 rounded-xl text-sm font-medium text-graphite/60 hover:bg-graphite/5 transition-colors"
                              >
                                Cancel
                              </button>
                              <button 
                                onClick={() => {
                                  ['hy', 'ru', 'en'].forEach(lang => {
                                    const l = lang as 'hy' | 'ru' | 'en';
                                    const items = [...(content[l]?.services?.items || [])];
                                    const index = items.findIndex(item => item.id === s.id);
                                    if (index !== -1) {
                                      if (l === 'hy') {
                                        items[index] = { ...items[index], ...editingServiceData };
                                      } else {
                                        items[index] = { ...items[index], image_url: editingServiceData.image_url, price: editingServiceData.price };
                                      }
                                      updateContent(l, 'services', { items });
                                    }
                                  });
                                  setEditingServiceId(null);
                                }}
                                className="px-4 py-2 rounded-xl text-sm font-medium bg-gold text-white hover:bg-gold/90 transition-colors"
                              >
                                Save Changes
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "beforeAfter" && (
              <div>
                <div className="flex justify-between items-center mb-8">
                  <h1 className="font-display text-3xl text-graphite">
                    {t("admin.cases")}
                  </h1>
                  <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center gap-2 bg-graphite text-white px-5 py-2.5 rounded-full hover:bg-gold transition-colors text-sm font-medium"
                  >
                    <Plus size={16} />
                    {t("admin.addCase")}
                  </button>
                </div>

                <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-graphite/5">
                  {cases.length === 0 ? (
                    <p className="text-graphite/40 text-center py-12">{t("admin.noCases")}</p>
                  ) : (
                    <div className="space-y-4">
                      {cases.map((c) => (
                        <div key={c.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-graphite/10 rounded-2xl hover:border-gold/30 transition-colors gap-4">
                          <div>
                            <h4 className="font-medium text-lg text-graphite">{c.protocol}</h4>
                            <p className="text-sm text-graphite/60">{c.patientDesc}</p>
                            <span className="inline-block mt-2 px-3 py-1 bg-pearl rounded-full text-xs text-graphite/50 tracking-widest uppercase">
                              {t(`booking.cats.${c.category}`)}
                            </span>
                          </div>
                          <div className="flex gap-2 self-end sm:self-auto">
                            <button 
                              onClick={() => handleOpenModal(c)}
                              className="p-2 text-graphite/40 hover:text-gold transition-colors"
                              title={t("admin.edit")}
                            >
                              <Edit2 size={20} />
                            </button>
                            <button 
                              onClick={() => handleDeleteCase(c.id)}
                              className="p-2 text-graphite/40 hover:text-red-500 transition-colors"
                              title={t("admin.delete")}
                            >
                              <Trash2 size={20} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === "ai_marketing" && (
              <AIPanel />
            )}

            {activeTab === "ai_assistant" && (
              <AIAssistantModule />
            )}

            {activeTab === "instagram" && (
              <div>
                <div className="flex justify-between items-center mb-8">
                  <h1 className="font-display text-3xl text-graphite">
                    {t("admin.instagramConnect", "Instagram Connect")}
                  </h1>
                </div>

                <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-graphite/5 mb-8">
                  <h3 className="font-display text-xl text-graphite mb-6 flex items-center gap-2">
                    <Instagram size={24} className="text-gold" /> 
                    {instagramConnected ? "Account Connected" : "Connect Account"}
                  </h3>
                  
                  {instagramConnected ? (
                    <div className="flex flex-col sm:flex-row items-center gap-6 p-6 rounded-2xl bg-pearl border border-gold/20">
                      <div className="w-16 h-16 rounded-full bg-gold/10 flex items-center justify-center">
                        <Instagram size={32} className="text-gold" />
                      </div>
                      <div className="flex-1 text-center sm:text-left">
                        <h4 className="font-medium text-graphite text-lg flex items-center justify-center sm:justify-start gap-2">
                          @{instagramHandle}
                          <CheckCircle size={16} className="text-green-500" />
                        </h4>
                        <p className="text-graphite/60 text-sm mt-1">Successfully synced with Instagram Graph API.</p>
                      </div>
                      <div className="flex gap-3">
                        <button 
                          onClick={async () => {
                            setIsSyncingInstagram(true);
                            try {
                              const posts = await instagramService.fetchPosts();
                              if (posts && posts.length > 0) {
                                setInstagramPosts(posts);
                                alert("Successfully synced posts from Instagram!");
                              }
                            } catch (error) {
                              console.error(error);
                              alert("Failed to sync posts. Check API token.");
                            } finally {
                              setIsSyncingInstagram(false);
                            }
                          }}
                          disabled={isSyncingInstagram}
                          className="px-6 py-3 rounded-xl bg-gold text-white font-medium hover:bg-gold/90 transition-colors disabled:opacity-50 flex items-center gap-2"
                        >
                          {isSyncingInstagram ? <Loader2 size={16} className="animate-spin" /> : <TrendingUp size={16} />}
                          Sync Now
                        </button>
                        <button 
                          onClick={async () => {
                            await instagramService.removeToken(0);
                            disconnectInstagram();
                          }}
                          className="px-6 py-3 rounded-xl border border-red-500/20 text-red-500 font-medium hover:bg-red-50 transition-colors"
                        >
                          Disconnect
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col md:flex-row gap-6">
                      <div className="flex-1 space-y-4">
                        <p className="text-graphite/70 text-sm">
                          Connect your clinic's Instagram account to automatically sync your latest posts and reels to the website's carousel.
                        </p>
                        <div>
                          <label className="block text-xs font-medium text-graphite/60 mb-2">Instagram Handle (e.g. avetisyan_clinic)</label>
                          <input 
                            type="text" 
                            value={tempInstaHandle}
                            onChange={e => setTempInstaHandle(e.target.value)}
                            placeholder="@username"
                            className="w-full max-w-md border border-graphite/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gold mb-4"
                          />
                          <label className="block text-xs font-medium text-graphite/60 mb-2">Long-Lived Access Token</label>
                          <input 
                            type="password" 
                            id="instaToken"
                            placeholder="IGQ..."
                            className="w-full max-w-md border border-graphite/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gold"
                          />
                        </div>
                        <button 
                          onClick={async () => {
                            if (!tempInstaHandle) return;
                            const tokenInput = (document.getElementById('instaToken') as HTMLInputElement)?.value;
                            if (!tokenInput) {
                              alert("Please enter the access token");
                              return;
                            }
                            
                            setIsConnectingInstagram(true);
                            try {
                              const success = await instagramService.saveToken(tokenInput);
                              if (success) {
                                connectInstagram(tempInstaHandle.replace('@', ''));
                                setTempInstaHandle('');
                                (document.getElementById('instaToken') as HTMLInputElement).value = '';
                                
                                // Auto sync after connect
                                const posts = await instagramService.fetchPosts();
                                if (posts && posts.length > 0) {
                                  setInstagramPosts(posts);
                                }
                              } else {
                                alert("Failed to save token");
                              }
                            } catch (error) {
                              console.error(error);
                              alert("Error connecting");
                            } finally {
                              setIsConnectingInstagram(false);
                            }
                          }}
                          disabled={!tempInstaHandle || isConnectingInstagram}
                          className="flex items-center gap-2 bg-gold text-white px-6 py-3 rounded-xl hover:bg-gold/90 transition-colors font-medium disabled:opacity-50"
                        >
                          {isConnectingInstagram ? (
                            <>
                              <Loader2 size={18} className="animate-spin" /> Connecting...
                            </>
                          ) : (
                            <>
                              <Instagram size={18} /> Connect with Instagram
                            </>
                          )}
                        </button>
                      </div>
                      <div className="flex-1 bg-pearl p-6 rounded-2xl border border-graphite/10">
                        <h4 className="text-sm font-medium text-graphite mb-2">Required Permissions</h4>
                        <ul className="text-xs text-graphite/60 space-y-2">
                          <li className="flex items-center gap-2"><CheckCircle size={12} className="text-gold" /> Read public profile</li>
                          <li className="flex items-center gap-2"><CheckCircle size={12} className="text-gold" /> Read media (photos, videos)</li>
                        </ul>
                      </div>
                    </div>
                  )}
                </div>

                <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-graphite/5 mb-8">
                  <h3 className="font-display text-xl text-graphite mb-6 flex items-center gap-2">
                    <Instagram size={24} className="text-gold" /> 
                    {secondInstagramConnected ? "Second Account Connected" : "Connect Second Account"}
                  </h3>
                  
                  {secondInstagramConnected ? (
                    <div className="flex flex-col sm:flex-row items-center gap-6 p-6 rounded-2xl bg-pearl border border-gold/20">
                      <div className="w-16 h-16 rounded-full bg-gold/10 flex items-center justify-center">
                        <Instagram size={32} className="text-gold" />
                      </div>
                      <div className="flex-1 text-center sm:text-left">
                        <h4 className="font-medium text-graphite text-lg flex items-center justify-center sm:justify-start gap-2">
                          @{secondInstagramHandle}
                          <CheckCircle size={16} className="text-green-500" />
                        </h4>
                        <p className="text-graphite/60 text-sm mt-1">Successfully synced with Instagram Graph API.</p>
                      </div>
                      <div className="flex gap-3">
                        <button 
                          onClick={async () => {
                            setIsSyncingInstagram(true);
                            try {
                              const posts = await instagramService.fetchPosts();
                              if (posts && posts.length > 0) {
                                setInstagramPosts(posts);
                                alert("Successfully synced posts from both Instagram accounts!");
                              }
                            } catch (error) {
                              console.error(error);
                              alert("Failed to sync posts. Check API token.");
                            } finally {
                              setIsSyncingInstagram(false);
                            }
                          }}
                          disabled={isSyncingInstagram}
                          className="px-6 py-3 rounded-xl bg-gold text-white font-medium hover:bg-gold/90 transition-colors disabled:opacity-50 flex items-center gap-2"
                        >
                          {isSyncingInstagram ? <Loader2 size={16} className="animate-spin" /> : <TrendingUp size={16} />}
                          Sync Now
                        </button>
                        <button 
                          onClick={async () => {
                            await instagramService.removeToken(1);
                            disconnectSecondInstagram();
                          }}
                          className="px-6 py-3 rounded-xl border border-red-500/20 text-red-500 font-medium hover:bg-red-50 transition-colors"
                        >
                          Disconnect
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col md:flex-row gap-6">
                      <div className="flex-1 space-y-4">
                        <p className="text-graphite/70 text-sm">
                          Connect a second Instagram account to merge posts into the carousel.
                        </p>
                        <div>
                          <label className="block text-xs font-medium text-graphite/60 mb-2">Second Instagram Handle</label>
                          <input 
                            type="text" 
                            value={tempSecondInstaHandle}
                            onChange={e => setTempSecondInstaHandle(e.target.value)}
                            placeholder="@username"
                            className="w-full max-w-md border border-graphite/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gold mb-4"
                          />
                          <label className="block text-xs font-medium text-graphite/60 mb-2">Long-Lived Access Token</label>
                          <input 
                            type="password" 
                            id="secondInstaToken"
                            placeholder="IGQ..."
                            className="w-full max-w-md border border-graphite/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gold"
                          />
                        </div>
                        <button 
                          onClick={async () => {
                            if (!tempSecondInstaHandle) return;
                            const tokenInput = (document.getElementById('secondInstaToken') as HTMLInputElement)?.value;
                            if (!tokenInput) {
                              alert("Please enter the access token");
                              return;
                            }
                            
                            setIsConnectingSecondInstagram(true);
                            try {
                              const success = await instagramService.saveToken(tokenInput, 1);
                              if (success) {
                                connectSecondInstagram(tempSecondInstaHandle.replace('@', ''));
                                setTempSecondInstaHandle('');
                                (document.getElementById('secondInstaToken') as HTMLInputElement).value = '';
                                
                                // Auto sync after connect
                                const posts = await instagramService.fetchPosts();
                                if (posts && posts.length > 0) {
                                  setInstagramPosts(posts);
                                }
                              } else {
                                alert("Failed to save token");
                              }
                            } catch (error) {
                              console.error(error);
                              alert("Error connecting");
                            } finally {
                              setIsConnectingSecondInstagram(false);
                            }
                          }}
                          disabled={!tempSecondInstaHandle || isConnectingSecondInstagram}
                          className="flex items-center gap-2 bg-gold text-white px-6 py-3 rounded-xl hover:bg-gold/90 transition-colors font-medium disabled:opacity-50"
                        >
                          {isConnectingSecondInstagram ? (
                            <>
                              <Loader2 size={18} className="animate-spin" /> Connecting...
                            </>
                          ) : (
                            <>
                              <Instagram size={18} /> Connect 2nd Account
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-graphite/5 mb-8">
                  <h3 className="font-display text-xl text-graphite mb-4 flex items-center gap-2">
                    <ImageIcon size={20} className="text-gold" /> {t("admin.manageCarousel", "Manage Carousel Posts")}
                  </h3>
                  <div className="space-y-6">
                    {instagramPosts.map((post, i) => (
                      <div key={post.id} className="flex flex-col md:flex-row gap-6 items-start p-4 border border-graphite/10 rounded-2xl">
                        <img src={post.image || undefined} alt="post" className="w-full md:w-32 h-32 object-cover rounded-xl" />
                        <div className="flex-1 space-y-4 w-full">
                          <div>
                            <label className="block text-xs font-medium text-graphite/60 mb-1">{t("admin.imageUrl", "Image URL")}</label>
                            <input 
                              type="text" 
                              value={post.image}
                              onChange={e => updateInstagramPost(i, { image: e.target.value })}
                              className="w-full border border-graphite/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-gold"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-graphite/60 mb-1">{t("admin.postLink", "Post Link")}</label>
                            <input 
                              type="text" 
                              value={post.link}
                              onChange={e => updateInstagramPost(i, { link: e.target.value })}
                              className="w-full border border-graphite/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-gold"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-medium text-graphite/60 mb-1">{t("admin.likes", "Likes")}</label>
                              <input 
                                type="number" 
                                value={post.likes}
                                onChange={e => updateInstagramPost(i, { likes: parseInt(e.target.value) || 0 })}
                                className="w-full border border-graphite/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-gold"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-graphite/60 mb-1">{t("admin.comments", "Comments")}</label>
                              <input 
                                type="number" 
                                value={post.comments}
                                onChange={e => updateInstagramPost(i, { comments: parseInt(e.target.value) || 0 })}
                                className="w-full border border-graphite/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-gold"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "settings" && (
              <div>
                <div className="flex justify-between items-center mb-8">
                  <h1 className="font-display text-3xl text-graphite">
                    Site Settings
                  </h1>
                </div>

                <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-graphite/5 mb-8">
                  <h3 className="font-display text-xl text-graphite mb-4 flex items-center gap-2">
                    <Settings size={20} className="text-gold" /> WhatsApp Settings
                  </h3>
                  <div className="max-w-md space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-graphite/60 mb-1">WhatsApp Number</label>
                      <input 
                        type="text" 
                        value={waNumberInput}
                        onChange={e => setWaNumberInput(e.target.value)}
                        placeholder="+37433101077"
                        className="w-full border border-graphite/10 rounded-xl px-4 py-3 focus:outline-none focus:border-gold"
                      />
                      <p className="text-xs text-graphite/50 mt-1">Include country code. Example: +37433101077</p>
                    </div>
                    <button 
                      onClick={async () => {
                        setIsWaSaving(true);
                        setWaSaveSuccess(false);
                        try {
                          await updateWhatsapp(waNumberInput);
                          setWaSaveSuccess(true);
                          setTimeout(() => setWaSaveSuccess(false), 3000);
                        } catch (e) {
                          alert("Ошибка при сохранении / Error saving");
                        } finally {
                          setIsWaSaving(false);
                        }
                      }}
                      disabled={isWaSaving}
                      className="bg-graphite text-white px-6 py-2.5 rounded-xl hover:bg-gold transition-colors text-sm font-medium flex items-center gap-2 disabled:opacity-50"
                    >
                      {isWaSaving ? <Loader2 size={16} className="animate-spin" /> : null}
                      {waSaveSuccess ? 'Saved!' : 'Save Number'}
                    </button>
                  </div>
                </div>

                <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-graphite/5 mb-8">
                  <h3 className="font-display text-xl text-graphite mb-4 flex items-center gap-2">
                    <Video size={20} className="text-gold" /> Hero Video Background
                  </h3>
                  <div className="max-w-md space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-graphite/60 mb-1">Desktop Video (Upload or URL)</label>
                      <div className="flex gap-2">
                        <input 
                          type="text" 
                          value={heroVideoInput}
                          onChange={e => setHeroVideoInput(e.target.value)}
                          placeholder="https://example.com/video-desktop.mp4"
                          className="flex-1 border border-graphite/10 rounded-xl px-4 py-3 focus:outline-none focus:border-gold text-sm"
                        />
                        <div className="relative">
                          <input 
                            type="file" 
                            accept="video/*"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                try {
                                  const url = await uploadFile(file);
                                  setHeroVideoInput(url);
                                } catch (err) {
                                  alert("Upload failed");
                                }
                              }
                            }}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          />
                          <button className="h-full px-4 rounded-xl bg-graphite text-white text-sm font-medium hover:bg-gold transition-colors">
                            Upload
                          </button>
                        </div>
                      </div>
                      <p className="text-xs text-graphite/50 mt-1">Direct link or upload an MP4 video file. Used as the main background on desktop.</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-graphite/60 mb-1">Mobile Video (Upload or URL)</label>
                      <div className="flex gap-2">
                        <input 
                          type="text" 
                          value={heroVideoMobileInput}
                          onChange={e => setHeroVideoMobileInput(e.target.value)}
                          placeholder="https://example.com/video-mobile.mp4"
                          className="flex-1 border border-graphite/10 rounded-xl px-4 py-3 focus:outline-none focus:border-gold text-sm"
                        />
                        <div className="relative">
                          <input 
                            type="file" 
                            accept="video/*"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                try {
                                  const url = await uploadFile(file);
                                  setHeroVideoMobileInput(url);
                                } catch (err) {
                                  alert("Upload failed");
                                }
                              }
                            }}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          />
                          <button className="h-full px-4 rounded-xl bg-graphite text-white text-sm font-medium hover:bg-gold transition-colors">
                            Upload
                          </button>
                        </div>
                      </div>
                      <p className="text-xs text-graphite/50 mt-1">Direct link or upload an MP4 video file. Used as the main background on mobile devices.</p>
                    </div>
                    <button 
                      onClick={async () => {
                        setIsHeroSaving(true);
                        setHeroSaveSuccess(false);
                        try {
                          await updateHeroVideoUrl(heroVideoInput, heroVideoMobileInput);
                          setHeroSaveSuccess(true);
                          setTimeout(() => setHeroSaveSuccess(false), 3000);
                        } catch (e) {
                          alert("Ошибка при сохранении / Error saving");
                        } finally {
                          setIsHeroSaving(false);
                        }
                      }}
                      disabled={isHeroSaving}
                      className="bg-graphite text-white px-6 py-2.5 rounded-xl hover:bg-gold transition-colors text-sm font-medium flex items-center gap-2 disabled:opacity-50"
                    >
                      {isHeroSaving ? <Loader2 size={16} className="animate-spin" /> : null}
                      {heroSaveSuccess ? 'Saved!' : 'Save Video URL'}
                    </button>
                  </div>
                </div>

                <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-graphite/5">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="font-display text-xl text-graphite flex items-center gap-2">
                      <Video size={20} className="text-gold" /> Video Gallery
                    </h3>
                    <button 
                      onClick={() => handleOpenVideoModal()}
                      className="flex items-center gap-2 bg-graphite text-white px-4 py-2 rounded-xl hover:bg-gold transition-colors text-sm font-medium"
                    >
                      <Plus size={16} /> Add Video
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {settings?.videos?.map(video => (
                      <div key={video.id} className={`border border-graphite/10 rounded-2xl p-4 flex flex-col gap-4 ${!video.isActive ? 'opacity-60' : ''}`}>
                        <div className="aspect-[9/16] bg-black rounded-xl overflow-hidden relative max-w-xs mx-auto w-full">
                          <video src={video.videoUrl || undefined} poster={video.posterUrl || undefined} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <h4 className="font-bold text-graphite truncate">{video.title || 'Untitled'}</h4>
                          <p className="text-sm text-graphite/60 line-clamp-2 mt-1">{video.description}</p>
                        </div>
                        <div className="flex items-center justify-between mt-auto pt-4 border-t border-graphite/5">
                          <span className="text-xs text-graphite/50 font-medium tracking-widest uppercase">Order: {video.order}</span>
                          <div className="flex gap-2">
                            <button onClick={() => handleToggleVideoStatus(video)} className="p-2 text-graphite/60 hover:text-gold bg-pearl rounded-lg">
                              {video.isActive ? 'Hide' : 'Show'}
                            </button>
                            <button onClick={() => handleOpenVideoModal(video)} className="p-2 text-graphite/60 hover:text-gold bg-pearl rounded-lg">
                              <Edit2 size={16} />
                            </button>
                            <button onClick={() => handleDeleteVideo(video.id)} className="p-2 text-graphite/60 hover:text-red-500 bg-pearl rounded-lg">
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                    {(!settings?.videos || settings.videos.length === 0) && (
                      <div className="col-span-full py-12 text-center text-graphite/40">
                        No videos added yet
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "specialists" && (
              <div>
                <div className="flex justify-between items-center mb-8">
                  <h1 className="font-display text-3xl text-graphite">
                    {t("admin.specialists")}
                  </h1>
                  <button 
                    onClick={async () => {
                      const newId = 'spec_' + Date.now();
                      const newSpec = { id: newId, name: 'New Specialist', role: 'Role', exp: '0 Years', spec: 'Specialization', image: '' };
                      try {
                        await Promise.all(['hy', 'ru', 'en'].map(lang => {
                          const l = lang as 'hy' | 'ru' | 'en';
                          const items = [...(content[l]?.specialists?.items || [])];
                          items.push(newSpec);
                          return updateContent(l, 'specialists', { items });
                        }));
                        setEditingSpecialistId(newId);
                        setEditingSpecialistData(newSpec);
                      } catch (error) {
                        alert("Ошибка при добавлении / Error adding");
                      }
                    }}
                    className="flex items-center gap-2 bg-graphite text-white px-5 py-2.5 rounded-full hover:bg-gold transition-colors text-sm font-medium"
                  >
                    <Plus size={16} />
                    {t("admin.addNewSpecialist")}
                  </button>
                </div>

                <div className="space-y-6">
                  {(content['hy']?.specialists?.items || []).map((s) => (
                    <div key={s.id} className="bg-white rounded-[2rem] p-6 shadow-sm border border-graphite/5 transition-all">
                      {!editingSpecialistId || editingSpecialistId !== s.id ? (
                        <div className="flex flex-col md:flex-row items-center gap-6">
                          <div className="w-24 h-24 rounded-full bg-pearl overflow-hidden border-2 border-transparent flex items-center justify-center">
                            {s.image ? (
                              <img src={s.image} alt={s.name} className="w-full h-full object-cover" />
                            ) : (
                              <Users size={32} className="text-graphite/20" />
                            )}
                          </div>
                          <div className="flex-1 text-center md:text-left">
                            <h4 className="font-medium text-lg text-graphite">{s.name}</h4>
                            <p className="text-sm text-gold mt-1">{s.role}</p>
                            <p className="text-xs text-graphite/50 mt-2 uppercase tracking-widest">{s.exp}</p>
                            <p className="text-xs text-graphite/60 mt-1">{s.spec}</p>
                          </div>
                          <div className="flex gap-2 w-full md:w-auto pt-4 md:pt-0 border-t md:border-t-0 border-graphite/5 justify-center">
                            <button 
                              onClick={() => {
                                setEditingSpecialistId(s.id);
                                setEditingSpecialistData({...s});
                              }}
                              className="p-3 text-graphite/40 hover:text-gold hover:bg-gold/10 rounded-xl transition-colors"
                            >
                              <Edit2 size={18} />
                            </button>
                            <button 
                              onClick={async () => {
                                if (window.confirm("Delete this specialist? / Удалить этого специалиста?")) {
                                  try {
                                    await Promise.all(['hy', 'ru', 'en'].map(lang => {
                                      const l = lang as 'hy' | 'ru' | 'en';
                                      const items = (content[l]?.specialists?.items || []).filter(item => item.id !== s.id);
                                      return updateContent(l, 'specialists', { items });
                                    }));
                                    alert("Специалист удален! / Specialist deleted!");
                                  } catch (error) {
                                    alert("Ошибка при удалении / Error deleting");
                                  }
                                }
                              }}
                              className="p-3 text-graphite/40 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-medium text-graphite/60 uppercase tracking-widest mb-2">Name</label>
                              <input 
                                type="text" 
                                value={editingSpecialistData.name}
                                onChange={(e) => setEditingSpecialistData({...editingSpecialistData, name: e.target.value})}
                                className="w-full bg-pearl border-none rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gold/30"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-graphite/60 uppercase tracking-widest mb-2">Role</label>
                              <input 
                                type="text" 
                                value={editingSpecialistData.role}
                                onChange={(e) => setEditingSpecialistData({...editingSpecialistData, role: e.target.value})}
                                className="w-full bg-pearl border-none rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gold/30"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-graphite/60 uppercase tracking-widest mb-2">Experience</label>
                              <input 
                                type="text" 
                                value={editingSpecialistData.exp}
                                onChange={(e) => setEditingSpecialistData({...editingSpecialistData, exp: e.target.value})}
                                className="w-full bg-pearl border-none rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gold/30"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-graphite/60 uppercase tracking-widest mb-2">Specialization</label>
                              <input 
                                type="text" 
                                value={editingSpecialistData.spec}
                                onChange={(e) => setEditingSpecialistData({...editingSpecialistData, spec: e.target.value})}
                                className="w-full bg-pearl border-none rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gold/30"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-graphite/60 uppercase tracking-widest mb-2">Image URL or Upload</label>
                            <div className="flex gap-4">
                              <input 
                                type="text" 
                                value={editingSpecialistData.image || ''}
                                onChange={(e) => setEditingSpecialistData({...editingSpecialistData, image: e.target.value})}
                                className="flex-1 bg-pearl border-none rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gold/30"
                                placeholder="https://images.unsplash.com/..."
                              />
                              <div className="relative flex items-center justify-center">
                                <input 
                                  type="file"
                                  accept="image/*"
                                  onChange={async (e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      try {
                                        const url = await uploadFile(file);
                                        setEditingSpecialistData({...editingSpecialistData, image: url});
                                      } catch (err) {
                                        alert("Upload failed");
                                      }
                                    }
                                  }}
                                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                                <button className="px-6 py-3 rounded-xl text-sm font-medium bg-graphite text-white hover:bg-gold transition-colors flex items-center gap-2">
                                  <ImageIcon size={18} />
                                  Upload
                                </button>
                              </div>
                            </div>
                          </div>
                          <div className="flex justify-end gap-2 mt-6">
                            <button 
                              onClick={() => setEditingSpecialistId(null)}
                              className="px-4 py-2 rounded-xl text-sm font-medium text-graphite/60 hover:bg-graphite/5 transition-colors"
                            >
                              Cancel
                            </button>
                            <button 
                              onClick={async () => {
                                try {
                                  await Promise.all(['hy', 'ru', 'en'].map(lang => {
                                    const l = lang as 'hy' | 'ru' | 'en';
                                    const items = [...(content[l]?.specialists?.items || [])];
                                    const index = items.findIndex(item => item.id === s.id);
                                    if (index !== -1) {
                                      if (l === 'hy') {
                                        items[index] = { ...items[index], ...editingSpecialistData };
                                      } else {
                                        items[index] = { ...items[index], image: editingSpecialistData.image };
                                      }
                                      return updateContent(l, 'specialists', { items });
                                    }
                                  }));
                                  setEditingSpecialistId(null);
                                  alert("Специалист успешно сохранен! / Specialist saved successfully!");
                                } catch (error) {
                                  alert("Ошибка при сохранении / Error saving specialist");
                                }
                              }}
                              className="px-4 py-2 rounded-xl text-sm font-medium bg-gold text-white hover:bg-gold/90 transition-colors"
                            >
                              Save Changes
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}













            {activeTab !== "dashboard" && activeTab !== "content" && activeTab !== "services" && activeTab !== "specialists" && activeTab !== "beforeAfter" && activeTab !== "ai" && activeTab !== "ai_assistant" && activeTab !== "ai_marketing" && activeTab !== "instagram" && (
              <div className="flex flex-col items-center justify-center h-[60vh] bg-white rounded-[2rem] border border-graphite/5 shadow-sm p-8 text-center">
                <div className="w-16 h-16 rounded-full bg-pearl flex items-center justify-center mb-4 text-graphite/30">
                  {React.createElement(menuItems.find(m => m.id === activeTab)?.icon || LayoutDashboard, { size: 32 })}
                </div>
                <h2 className="font-display text-2xl text-graphite mb-2">
                  {menuItems.find(m => m.id === activeTab)?.label}
                </h2>
                <p className="text-graphite/50 font-light max-w-md">
                  {t("admin.underConstruction")}
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Modal for Before/After */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-graphite/20 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-[2rem] p-8 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-display text-2xl">
                {editingId ? t("admin.edit") : t("admin.addCase")}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-graphite/40 hover:text-graphite">
                <X size={24} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-graphite/60 mb-1">{t("admin.protocol")}</label>
                <input 
                  type="text"
                  value={formData.protocol}
                  onChange={(e) => setFormData({...formData, protocol: e.target.value})}
                  className="w-full border border-graphite/10 rounded-xl px-4 py-3 focus:outline-none focus:border-gold"
                  placeholder="e.g. SMAS Lifting"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-graphite/60 mb-1">{t("admin.patientDesc")}</label>
                <input 
                  type="text"
                  value={formData.patientDesc}
                  onChange={(e) => setFormData({...formData, patientDesc: e.target.value})}
                  className="w-full border border-graphite/10 rounded-xl px-4 py-3 focus:outline-none focus:border-gold"
                  placeholder="e.g. 42 y.o. / 1 Session"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-graphite/60 mb-1">{t("admin.category")}</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className="w-full border border-graphite/10 rounded-xl px-4 py-3 focus:outline-none focus:border-gold bg-white"
                >
                  <option value="face">{t("booking.cats.face")}</option>
                  <option value="body">{t("booking.cats.body")}</option>
                  <option value="skin">{t("booking.cats.skin")}</option>
                  <option value="inject">{t("booking.cats.inject")}</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-graphite/60 mb-1">{t("admin.imageBefore")}</label>
                  <div className="relative h-12">
                    <input 
                      type="file"
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          try {
                            const url = await uploadFile(file);
                            setFormData({...formData, beforeImage: url});
                          } catch (err) {
                            alert("Upload failed");
                          }
                        }
                      }}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <div className="absolute inset-0 flex items-center justify-between border border-graphite/10 rounded-xl px-4 py-3 bg-white text-sm text-graphite/60 overflow-hidden">
                      <span className="truncate">{formData.beforeImage ? 'Image uploaded' : 'Upload Before Image'}</span>
                      <ImageIcon size={16} />
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-graphite/60 mb-1">{t("admin.imageAfter")}</label>
                  <div className="relative h-12">
                    <input 
                      type="file"
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          try {
                            const url = await uploadFile(file);
                            setFormData({...formData, afterImage: url});
                          } catch (err) {
                            alert("Upload failed");
                          }
                        }
                      }}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <div className="absolute inset-0 flex items-center justify-between border border-graphite/10 rounded-xl px-4 py-3 bg-white text-sm text-graphite/60 overflow-hidden">
                      <span className="truncate">{formData.afterImage ? 'Image uploaded' : 'Upload After Image'}</span>
                      <ImageIcon size={16} />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 flex gap-4">
              <button 
                onClick={handleSave}
                className="flex-1 bg-graphite text-white py-3 rounded-full hover:bg-gold transition-colors font-medium"
              >
                {t("admin.save")}
              </button>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="flex-1 bg-pearl text-graphite py-3 rounded-full hover:bg-graphite/5 transition-colors font-medium"
              >
                {t("admin.cancel")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal for Video Gallery */}
      {isVideoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-graphite/20 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-[2rem] p-8 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-display text-2xl">
                {editingVideoId ? "Edit Video" : "Add Video"}
              </h3>
              <button onClick={() => setIsVideoModalOpen(false)} className="text-graphite/40 hover:text-graphite">
                <X size={24} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-graphite/60 mb-1">Title</label>
                <input 
                  type="text"
                  value={videoFormData.title}
                  onChange={(e) => setVideoFormData({...videoFormData, title: e.target.value})}
                  className="w-full border border-graphite/10 rounded-xl px-4 py-3 focus:outline-none focus:border-gold"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-graphite/60 mb-1">Description</label>
                <textarea 
                  value={videoFormData.description}
                  onChange={(e) => setVideoFormData({...videoFormData, description: e.target.value})}
                  className="w-full border border-graphite/10 rounded-xl px-4 py-3 focus:outline-none focus:border-gold"
                  rows={2}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-graphite/60 mb-1">Video (Upload or URL)</label>
                <div className="flex gap-2">
                  <input 
                    type="text"
                    value={videoFormData.videoUrl}
                    onChange={(e) => setVideoFormData({...videoFormData, videoUrl: e.target.value})}
                    className="flex-1 border border-graphite/10 rounded-xl px-4 py-3 focus:outline-none focus:border-gold"
                    placeholder="https://example.com/video.mp4"
                  />
                  <div className="relative">
                    <input 
                      type="file" 
                      accept="video/*"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          try {
                            const url = await uploadFile(file);
                            setVideoFormData({...videoFormData, videoUrl: url});
                          } catch (err) {
                            alert("Upload failed");
                          }
                        }
                      }}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <button className="h-full px-6 rounded-xl bg-graphite text-white text-sm font-medium hover:bg-gold transition-colors">
                      Upload
                    </button>
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-graphite/60 mb-1">Poster Image URL (Optional)</label>
                <input 
                  type="text"
                  value={videoFormData.posterUrl}
                  onChange={(e) => setVideoFormData({...videoFormData, posterUrl: e.target.value})}
                  className="w-full border border-graphite/10 rounded-xl px-4 py-3 focus:outline-none focus:border-gold"
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-graphite/60 mb-1">Order Index</label>
                  <input 
                    type="number"
                    value={videoFormData.order}
                    onChange={(e) => setVideoFormData({...videoFormData, order: parseInt(e.target.value) || 0})}
                    className="w-full border border-graphite/10 rounded-xl px-4 py-3 focus:outline-none focus:border-gold"
                  />
                </div>
                <div className="flex items-center pt-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox"
                      checked={videoFormData.isActive}
                      onChange={(e) => setVideoFormData({...videoFormData, isActive: e.target.checked})}
                      className="w-5 h-5 rounded border-gray-300 text-gold focus:ring-gold"
                    />
                    <span className="text-sm font-medium text-graphite/80">Active</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="mt-8 flex gap-4">
              <button 
                onClick={handleSaveVideo}
                className="flex-1 bg-graphite text-white py-3 rounded-full hover:bg-gold transition-colors font-medium"
              >
                Save Video
              </button>
              <button 
                onClick={() => setIsVideoModalOpen(false)}
                className="flex-1 bg-pearl text-graphite py-3 rounded-full hover:bg-graphite/5 transition-colors font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
