import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { useGalleryStore, GalleryCase } from "../store/galleryStore";
import { useContentStore } from "../store/contentStore";
import { SEO } from "../components/SEO";
import { 
  Trash2, Edit2, Plus, X, 
  LayoutDashboard, Sparkles, Image as ImageIcon, 
  Users, Star, FileText, CalendarHeart, 
  TrendingUp, BarChart3, Settings, BrainCircuit,
  Instagram, CheckCircle, Loader2, LogOut
} from "lucide-react";
import { AIPanel } from "../components/AIPanel";
import { AIAssistantModule } from "../components/AIAssistantModule";
import { instagramService } from "../services/instagramService";
import { signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut } from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

export function AdminPanel() {
  const { t } = useTranslation();
  const { cases, addCase, updateCase, deleteCase } = useGalleryStore();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const [editingServiceImageUrl, setEditingServiceImageUrl] = useState<string>('');
  
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [loginError, setLoginError] = useState('');
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
      setIsAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);  
  const [formData, setFormData] = useState<Omit<GalleryCase, 'id'>>({
    protocol: "",
    patientDesc: "",
    category: "face"
  });

  const [isAiDrawerOpen, setIsAiDrawerOpen] = useState(false);
  const [isConnectingInstagram, setIsConnectingInstagram] = useState(false);
  const [tempInstaHandle, setTempInstaHandle] = useState('');
  const [isConnectingSecondInstagram, setIsConnectingSecondInstagram] = useState(false);
  const [tempSecondInstaHandle, setTempSecondInstaHandle] = useState('');
  const [isSyncingInstagram, setIsSyncingInstagram] = useState(false);

  const { content, updateContent, instagramPosts, updateInstagramPost, setInstagramPosts, instagramConnected, instagramHandle, connectInstagram, disconnectInstagram, secondInstagramConnected, secondInstagramHandle, connectSecondInstagram, disconnectSecondInstagram } = useContentStore();

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

  const handleSave = () => {
    if (editingId) {
      updateCase(editingId, formData);
    } else {
      addCase(formData);
    }
    setIsModalOpen(false);
  };

  const handleContentChange = (lang: 'hy' | 'ru' | 'en', section: keyof typeof content['hy'], field: string, value: string) => {
    updateContent(lang, section, { [field]: value });
  };

  const menuItems = [
    { id: "dashboard", icon: LayoutDashboard, label: t("admin.dashboard") },
    { id: "ai_assistant", icon: BrainCircuit, label: "AI Assistant" },
    { id: "ai_marketing", icon: Sparkles, label: "AI Marketing" },
    { id: "content", icon: FileText, label: t("admin.content", "Content") },
    { id: "instagram", icon: ImageIcon, label: t("admin.instagramConnect", "Instagram Connect") },
    { id: "services", icon: Sparkles, label: t("admin.services") },
    { id: "beforeAfter", icon: ImageIcon, label: t("admin.beforeAfter") },
    { id: "specialists", icon: Users, label: t("admin.specialists") },
  ];

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      console.error("Login failed:", error);
      setLoginError(error.message || 'Authentication failed');
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
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
        <SEO titleKey="seo.admin.title" descriptionKey="seo.admin.description" />
        <div className="bg-white w-full max-w-md rounded-[2rem] p-10 shadow-lg border border-graphite/5 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-gold/40 via-gold to-gold/40"></div>
          <div className="text-center mb-8">
            <h1 className="font-display text-3xl text-graphite mb-2">{t("admin.portalTitle", "Admin Portal")}</h1>
            <p className="text-graphite/60 text-sm">{t("admin.portalDesc", "Secure access to Avetisyan Beauty Clinic management")}</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-6">
            {loginError && <div className="p-3 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100">{loginError}</div>}
            <button 
              type="submit" 
              className="w-full bg-graphite text-white px-8 py-3.5 rounded-xl hover:bg-gold transition-colors font-medium text-sm tracking-wide mt-4"
            >
              Sign In with Google
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-pearl min-h-screen text-graphite selection:bg-gold/30 selection:text-graphite">
      <SEO titleKey="seo.admin.title" descriptionKey="seo.admin.description" />
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

                <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
                  <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-graphite/5 flex flex-col justify-between">
                    <div className="w-12 h-12 rounded-full bg-pearl flex items-center justify-center mb-4">
                      <CalendarHeart size={24} className="text-gold" />
                    </div>
                    <p className="text-sm font-medium text-graphite/60 uppercase tracking-widest">{t("admin.stats.totalBookings")}</p>
                    <p className="font-display text-4xl text-graphite mt-2">142</p>
                  </div>
                </div>

                <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-graphite/5 mt-8">
                  <h3 className="font-display text-2xl text-graphite mb-6">{t("admin.recentBookings")}</h3>
                  <div className="space-y-4">
                    {[
                      { name: "Anna S.", service: "Ultraformer III", date: "Today, 14:00", status: "pending" },
                      { name: "Maria K.", service: "SMAS Lifting", date: "Tomorrow, 10:30", status: "confirmed" },
                      { name: "Elena R.", service: "Skin Rejuvenation", date: "May 24, 16:00", status: "completed" }
                    ].map((booking, i) => (
                      <div key={i} className="flex flex-col sm:flex-row justify-between items-center p-4 border border-graphite/10 rounded-2xl hover:border-gold/30 transition-colors">
                        <div>
                          <p className="font-medium text-graphite">{booking.name}</p>
                          <p className="text-sm text-graphite/60">{booking.service}</p>
                        </div>
                        <div className="flex items-center gap-4 mt-4 sm:mt-0">
                          <p className="text-sm text-graphite">{booking.date}</p>
                          <span className={`px-3 py-1 rounded-full text-xs tracking-widest uppercase ${
                            booking.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 
                            booking.status === 'confirmed' ? 'bg-green-100 text-green-700' : 
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {t(`admin.status.${booking.status}`)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
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
                  <button className="flex items-center gap-2 bg-graphite text-white px-5 py-2.5 rounded-full hover:bg-gold transition-colors text-sm font-medium">
                    <Plus size={16} />
                    {t("admin.addNewService")}
                  </button>
                </div>

                <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-graphite/5">
                  <div className="space-y-4">
                    {(content['hy']?.services?.items || []).map((s, i) => (
                      <div key={i} className="flex flex-col p-4 border border-graphite/10 rounded-2xl hover:border-gold/30 transition-colors gap-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                          <div className="flex items-center gap-4">
                            {s.image_url ? (
                              <img src={s.image_url} alt={s.title} className="w-16 h-16 object-cover rounded-xl" />
                            ) : (
                              <div className="w-16 h-16 bg-pearl rounded-xl flex items-center justify-center">
                                <ImageIcon size={24} className="text-graphite/20" />
                              </div>
                            )}
                            <h4 className="font-medium text-lg text-graphite">{s.title}</h4>
                          </div>
                          <div className="flex items-center gap-6">
                            <div className="flex gap-2">
                              <button 
                                onClick={() => {
                                  setEditingServiceId(editingServiceId === s.id ? null : s.id);
                                  setEditingServiceImageUrl(s.image_url || '');
                                }}
                                className="p-2 text-graphite/40 hover:text-gold transition-colors"
                              >
                                <Edit2 size={20} />
                              </button>
                              <button className="p-2 text-graphite/40 hover:text-red-500 transition-colors"><Trash2 size={20} /></button>
                            </div>
                          </div>
                        </div>
                        {editingServiceId === s.id && (
                          <div className="mt-4 pt-4 border-t border-graphite/5 space-y-4">
                            <div>
                              <label className="block text-xs font-medium text-graphite/60 uppercase tracking-widest mb-2">Image URL or Upload</label>
                              <div className="flex gap-4">
                                <input 
                                  type="text" 
                                  value={editingServiceImageUrl}
                                  onChange={(e) => setEditingServiceImageUrl(e.target.value)}
                                  className="flex-1 bg-pearl border-none rounded-2xl px-6 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-gold/30"
                                  placeholder="https://images.unsplash.com/..."
                                />
                                <div className="relative flex items-center justify-center">
                                  <input 
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => {
                                      const file = e.target.files?.[0];
                                      if (file) {
                                        const reader = new FileReader();
                                        reader.onloadend = () => {
                                          setEditingServiceImageUrl(reader.result as string);
                                        };
                                        reader.readAsDataURL(file);
                                      }
                                    }}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                  />
                                  <button className="px-6 py-4 rounded-2xl text-sm font-medium bg-graphite text-white hover:bg-gold transition-colors flex items-center gap-2">
                                    <ImageIcon size={18} />
                                    Upload
                                  </button>
                                </div>
                              </div>
                            </div>
                            <div className="flex justify-end gap-2">
                              <button 
                                onClick={() => setEditingServiceId(null)}
                                className="px-4 py-2 rounded-xl text-sm font-medium text-graphite/60 hover:bg-graphite/5 transition-colors"
                              >
                                Cancel
                              </button>
                              <button 
                                onClick={() => {
                                  ['hy', 'ru', 'en'].forEach(lang => {
                                    const items = [...(content[lang as 'hy' | 'ru' | 'en']?.services?.items || [])];
                                    const index = items.findIndex(item => item.id === s.id);
                                    if (index !== -1) {
                                      items[index] = { ...items[index], image_url: editingServiceImageUrl };
                                      updateContent(lang as 'hy' | 'ru' | 'en', 'services', { items });
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
                              onClick={() => deleteCase(c.id)}
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
                          onClick={() => disconnectInstagram()}
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
                  <h3 className="font-display text-xl text-graphite mb-4 flex items-center gap-2">
                    <ImageIcon size={20} className="text-gold" /> {t("admin.manageCarousel", "Manage Carousel Posts")}
                  </h3>
                  <div className="space-y-6">
                    {instagramPosts.map((post, i) => (
                      <div key={post.id} className="flex flex-col md:flex-row gap-6 items-start p-4 border border-graphite/10 rounded-2xl">
                        <img src={post.image} alt="post" className="w-full md:w-32 h-32 object-cover rounded-xl" />
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

            {activeTab === "specialists" && (
              <div>
                <div className="flex justify-between items-center mb-8">
                  <h1 className="font-display text-3xl text-graphite">
                    {t("admin.specialists")}
                  </h1>
                  <button className="flex items-center gap-2 bg-graphite text-white px-5 py-2.5 rounded-full hover:bg-gold transition-colors text-sm font-medium">
                    <Plus size={16} />
                    {t("admin.addNewSpecialist")}
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {(content['hy']?.specialists?.items || []).map((s, i) => (
                    <div key={i} className="bg-white rounded-[2rem] p-6 shadow-sm border border-graphite/5 flex flex-col items-center text-center group hover:border-gold/30 transition-all">
                      <div className="w-24 h-24 rounded-full bg-pearl mb-4 overflow-hidden border-2 border-transparent group-hover:border-gold/30 transition-colors">
                        <img src={`https://i.pravatar.cc/150?img=${i + 10}`} alt={s.name} className="w-full h-full object-cover" />
                      </div>
                      <h4 className="font-medium text-lg text-graphite">{s.name}</h4>
                      <p className="text-sm text-gold mt-1">{s.role}</p>
                      <p className="text-xs text-graphite/50 mt-2 uppercase tracking-widest">{s.exp}</p>
                      <p className="text-xs text-graphite/60 mt-1">{s.spec}</p>
                      <div className="flex gap-2 mt-6 w-full pt-4 border-t border-graphite/5 justify-center">
                        <button className="p-2 text-graphite/40 hover:text-gold transition-colors"><Edit2 size={18} /></button>
                        <button className="p-2 text-graphite/40 hover:text-red-500 transition-colors"><Trash2 size={18} /></button>
                      </div>
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
                  <input 
                    type="text"
                    value={formData.beforeLabel || ""}
                    onChange={(e) => setFormData({...formData, beforeLabel: e.target.value})}
                    className="w-full border border-graphite/10 rounded-xl px-4 py-3 focus:outline-none focus:border-gold"
                    placeholder="Before"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-graphite/60 mb-1">{t("admin.imageAfter")}</label>
                  <input 
                    type="text"
                    value={formData.afterLabel || ""}
                    onChange={(e) => setFormData({...formData, afterLabel: e.target.value})}
                    className="w-full border border-graphite/10 rounded-xl px-4 py-3 focus:outline-none focus:border-gold"
                    placeholder="After"
                  />
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

      {/* Floating Action Button for AI */}
      <button
        onClick={() => setIsAiDrawerOpen(true)}
        className="fixed bottom-24 right-8 z-40 bg-gold text-white p-4 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center justify-center group"
      >
        <BrainCircuit size={24} />
        <span className="absolute right-full mr-4 bg-white text-graphite px-3 py-1.5 rounded-lg text-sm font-medium shadow-sm opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
          {t("admin.aiAssistant")}
        </span>
      </button>

      {/* AI Marketing Assistant Drawer */}
      {isAiDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-graphite/20 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            <div className="p-6 border-b border-graphite/5 flex justify-between items-center bg-pearl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center">
                  <BrainCircuit size={20} className="text-gold" />
                </div>
                <div>
                  <h3 className="font-display text-xl text-graphite">{t("admin.aiTitle")}</h3>
                  <p className="text-xs text-graphite/60 uppercase tracking-widest mt-1">Copilot</p>
                </div>
              </div>
              <button 
                onClick={() => setIsAiDrawerOpen(false)} 
                className="text-graphite/40 hover:text-graphite p-2 rounded-full hover:bg-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-white">
              <div className="space-y-4">
                <p className="text-sm text-graphite/60">
                  {t("admin.aiDesc")}
                </p>
                <div className="grid grid-cols-1 gap-2">
                  {[
                    t("admin.aiActions.insta"),
                    t("admin.aiActions.seo"),
                    t("admin.aiActions.translate"),
                    t("admin.aiActions.offer")
                  ].map((action, i) => (
                    <button key={i} className="text-left px-4 py-3 bg-pearl hover:bg-gold/10 hover:text-gold text-graphite text-sm rounded-xl transition-colors border border-transparent hover:border-gold/20">
                      {action}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-4 bg-ivory rounded-2xl border border-graphite/5">
                <h4 className="text-xs font-medium text-graphite/60 uppercase tracking-widest mb-2">{t("admin.capabilities")}</h4>
                <ul className="text-sm text-graphite space-y-2">
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-gold"></div> {t("admin.ideation")}
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-gold"></div> {t("admin.seoOpt")}
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-gold"></div> {t("admin.translation")}
                  </li>
                </ul>
              </div>
            </div>

            <div className="p-6 bg-white border-t border-graphite/5">
              <div className="relative">
                <textarea 
                  placeholder={t("admin.typeRequest")}
                  className="w-full bg-pearl border-none rounded-2xl pl-4 pr-12 py-3 min-h-[80px] text-sm focus:outline-none focus:ring-2 focus:ring-gold/30 resize-none"
                ></textarea>
                <button className="absolute bottom-3 right-3 p-2 bg-graphite text-white rounded-full hover:bg-gold transition-colors">
                  <Sparkles size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
