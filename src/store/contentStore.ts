import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface SectionContent {
  title?: string;
  subtitle?: string;
  description?: string;
}

export interface ServiceItem {
  id: string;
  title: string;
  description: string;
  tag: string;
  image_url?: string;
  href?: string;
}

export interface SpecialistItem {
  id: string;
  name: string;
  role: string;
  exp: string;
  spec: string;
  image?: string;
}

export interface ServicesContent extends SectionContent {
  items: ServiceItem[];
}

export interface SpecialistsContent extends SectionContent {
  items: SpecialistItem[];
}

export interface SiteContent {
  hero: SectionContent;
  services: ServicesContent;
  specialists: SpecialistsContent;
  results: SectionContent;
  trust: SectionContent;
  insta: SectionContent;
}

export type LocalizedContent = {
  [key in 'hy' | 'ru' | 'en']: SiteContent;
};

const defaultContent: LocalizedContent = {
  hy: {
    hero: {
      title: "Ultraformer III և Golden Sun ծառայություններ",
      subtitle: "ժամանակակից էսթետիկ խնամքի համար",
      description: "Դեմքի երիտասարդացման և մարմնի կորեկցիայի պրոֆեսիոնալ լուծումներ, որոնք նախագծված են ճշգրտության և բնական արդյունքների համար:"
    },
    services: {
      title: "Գեղեցկության ապագայի կառուցում",
      description: "Մեր կողմից մանրակրկիտ ընտրված FDA-ի կողմից հաստատված տեխնոլոգիաներ և մասնագիտացված արձանագրություններ, որոնք նախատեսված են օպտիմալ, բնական տեսք ունեցող արդյունքների համար:",
      items: [
        { id: "ultraformer", title: "Ultraformer III", description: "Առաջադեմ MMFU տեխնոլոգիա դեմքի լիֆթինգի, մաշկի ձգման և մարմնի կոնտուրավորման համար:", tag: "Ֆլագմանային", href: "/hy/ultraformer", image_url: "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?q=80&w=800&auto=format&fit=crop" },
        { id: "goldensun", title: "Golden Sun", description: "Բացառիկ Golden Sun պրոցեդուրան ապահովում է շքեղ և շողացող արդյունք:", tag: "Առաջնային", href: "/hy/golden-sun", image_url: "https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?q=80&w=800&auto=format&fit=crop" },
        { id: "smas", title: "SMAS Լիֆթինգ", description: "Ճշգրիտ ուլտրաձայնային ալիքներ, որոնք թիրախավորում են հյուսվածքների խորը շերտերը հիմնարար կառուցվածքային բարձրացման համար:", tag: "Հակատարիքային", image_url: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?q=80&w=800&auto=format&fit=crop" },
        { id: "body-contouring", title: "Մարմնի Կոնտուրավորում", description: "Նպատակային ճարպի նվազեցում և մաշկի ձգում՝ օգտագործելով համակցված ՌՖ և ուլտրաձայնային ալիքներ:", tag: "Քանդակում", image_url: "https://images.unsplash.com/photo-1519823551278-64ac92734fb1?q=80&w=800&auto=format&fit=crop" },
        { id: "skin-rejuvenation", title: "Մաշկի Երիտասարդացում", description: "Բջջային մակարդակում թարմացման արձանագրություններ՝ անթերի հյուսվածքի և երանգի համար:", tag: "Էսթետիկ", image_url: "https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?q=80&w=800&auto=format&fit=crop" }
      ]
    },
    specialists: {
      title: "Համաշխարհային մակարդակի փորձառություն",
      description: "Մեր խորհրդի կողմից հաստատված մաշկաբանների և էսթետիկ բժշկության մասնագետների թիմը նվիրված է բացառիկ արդյունքների ապահովմանը ճշգրտությամբ և հոգատարությամբ:",
      items: [
        { id: "elena", name: "Բժ. Ելենա Ռոստովա", role: "Գլխավոր բժշկական տնօրեն", exp: "15+ Տարի", spec: "Հակատարիքային և SMAS Արձանագրություններ", image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=800&auto=format&fit=crop" },
        { id: "marcus", name: "Բժ. Մարկուս Չեն", role: "Առաջատար էսթետիկ վիրաբույժ", exp: "12+ Տարի", spec: "Մարմնի կոնտուրավորման փորձագետ", image: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=800&auto=format&fit=crop" },
        { id: "sarah", name: "Բժ. Սառա Ալ-Ֆայեդ", role: "Ավագ մաշկաբան", exp: "10+ Տարի", spec: "Մաշկի առաջադեմ երիտասարդացում", image: "https://images.unsplash.com/photo-1594824436951-7f12bc58ec53?q=80&w=800&auto=format&fit=crop" }
      ]
    },
    results: {
      title: "Տեսանելի Փոխակերպում",
      description: "Դիտեք մեր պացիենտների տեսանելի փոխակերպումները պրեմիում էսթետիկ պրոցեդուրաներից առաջ և հետո:"
    },
    trust: {
      title: "Պրեմիում Խնամքի Ստանդարտի Վերասահմանում",
      description: "Avetisyan Beauty Clinic-ը միավորում է աշխարհի ամենաառաջադեմ էսթետիկ տեխնոլոգիաները պացիենտների անվտանգության անզիջում հանձնառության և հատուկ ճարտարապետական ձևավորման հետ՝ առաջարկելով փորձ, որը գերազանցում է ավանդական կլինիկական միջավայրը:"
    },
    insta: {
      title: "Instagram",
      description: "Տեղեկացեք մեր նորագույն պրոցեդուրաների, առաջարկների և գեղեցկության խորհուրդների մասին Instagram-ում:"
    }
  },
  ru: {
    hero: {
      title: "Ultraformer III и Golden Sun — ключевые услуги",
      subtitle: "современной эстетической клиники",
      description: "Профессиональные решения для омоложения лица и коррекции фигуры, разработанные для точности и естественных результатов."
    },
    services: {
      title: "Создавая будущее красоты",
      description: "Наши тщательно отобранные технологии, одобренные FDA, и специализированные протоколы разработаны для оптимальных, естественных результатов.",
      items: [
        { id: "ultraformer", title: "Ultraformer III", description: "Передовая технология MMFU для лифтинга лица, подтяжки кожи и контурирования тела.", tag: "Флагманская", href: "/ru/ultraformer", image_url: "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?q=80&w=800&auto=format&fit=crop" },
        { id: "goldensun", title: "Golden Sun", description: "Эксклюзивная процедура Golden Sun обеспечивает роскошный и сияющий результат.", tag: "Приоритетная", href: "/ru/golden-sun", image_url: "https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?q=80&w=800&auto=format&fit=crop" },
        { id: "smas", title: "SMAS Лифтинг", description: "Прецизионный ультразвук, нацеленный на глубокие слои тканей для фундаментального структурного лифтинга.", tag: "Антивозрастной", image_url: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?q=80&w=800&auto=format&fit=crop" },
        { id: "body-contouring", title: "Контурирование тела", description: "Целенаправленное уменьшение жировых отложений и подтяжка кожи с использованием комбинированного RF и ультразвука.", tag: "Скульптурирование", image_url: "https://images.unsplash.com/photo-1519823551278-64ac92734fb1?q=80&w=800&auto=format&fit=crop" },
        { id: "skin-rejuvenation", title: "Омоложение кожи", description: "Протоколы обновления на клеточном уровне для безупречной текстуры и тона.", tag: "Эстетика", image_url: "https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?q=80&w=800&auto=format&fit=crop" }
      ]
    },
    specialists: {
      title: "Экспертиза мирового уровня",
      description: "Наша команда сертифицированных дерматологов и специалистов эстетической медицины стремится обеспечивать исключительные результаты с точностью и заботой.",
      items: [
        { id: "elena", name: "Д-р Елена Ростова", role: "Главный медицинский директор", exp: "15+ Лет", spec: "Протоколы Anti-Aging и SMAS", image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=800&auto=format&fit=crop" },
        { id: "marcus", name: "Д-р Маркус Чен", role: "Ведущий эстетический хирург", exp: "12+ Лет", spec: "Эксперт по контурированию тела", image: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=800&auto=format&fit=crop" },
        { id: "sarah", name: "Д-р Сара Аль-Файед", role: "Старший дерматолог", exp: "10+ Лет", spec: "Передовое омоложение кожи", image: "https://images.unsplash.com/photo-1594824436951-7f12bc58ec53?q=80&w=800&auto=format&fit=crop" }
      ]
    },
    results: {
      title: "Видимая трансформация",
      description: "Посмотрите на видимые трансформации и клинические случаи наших пациентов до и после премиальных эстетических процедур."
    },
    trust: {
      title: "Переопределение Стандарта Премиального Ухода",
      description: "Avetisyan Beauty Clinic объединяет самые передовые в мире эстетические технологии с бескомпромиссной приверженностью безопасности пациентов и индивидуальным архитектурным дизайном, предлагая опыт, выходящий за рамки традиционных клинических условий."
    },
    insta: {
      title: "Instagram",
      description: "Будьте в курсе наших новейших процедур, предложений и советов по красоте в Instagram."
    }
  },
  en: {
    hero: {
      title: "Ultraformer III and Golden Sun — key services",
      subtitle: "for modern aesthetic care",
      description: "Professional solutions for facial rejuvenation and body correction, designed for precision and natural results."
    },
    services: {
      title: "Building the Future of Beauty",
      description: "Our carefully selected FDA-approved technologies and specialized protocols designed for optimal, natural-looking results.",
      items: [
        { id: "ultraformer", title: "Ultraformer III", description: "Advanced MMFU technology for face lifting, skin tightening, and body contouring.", tag: "Flagship", href: "/en/ultraformer", image_url: "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?q=80&w=800&auto=format&fit=crop" },
        { id: "goldensun", title: "Golden Sun", description: "The exclusive Golden Sun treatment provides a luxurious and radiant finish.", tag: "Featured", href: "/en/golden-sun", image_url: "https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?q=80&w=800&auto=format&fit=crop" },
        { id: "smas", title: "SMAS Lifting", description: "Precision ultrasound targeting deep tissue layers for foundational structural lift.", tag: "Anti-Aging", image_url: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?q=80&w=800&auto=format&fit=crop" },
        { id: "body-contouring", title: "Body Contouring", description: "Targeted fat reduction and skin tightening utilizing combined RF and ultrasound.", tag: "Sculpting", image_url: "https://images.unsplash.com/photo-1519823551278-64ac92734fb1?q=80&w=800&auto=format&fit=crop" },
        { id: "skin-rejuvenation", title: "Skin Rejuvenation", description: "Cellular level renewal protocols for flawless texture and tone.", tag: "Aesthetic", image_url: "https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?q=80&w=800&auto=format&fit=crop" }
      ]
    },
    specialists: {
      title: "World-Class Expertise",
      description: "Our team of board-certified dermatologists and aesthetic medicine specialists are dedicated to delivering exceptional results with precision and care.",
      items: [
        { id: "elena", name: "Dr. Elena Rostova", role: "Chief Medical Director", exp: "15+ Years", spec: "Anti-Aging & SMAS Protocols", image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=800&auto=format&fit=crop" },
        { id: "marcus", name: "Dr. Marcus Chen", role: "Lead Aesthetic Surgeon", exp: "12+ Years", spec: "Body Contouring Expert", image: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=800&auto=format&fit=crop" },
        { id: "sarah", name: "Dr. Sarah Al-Fayed", role: "Senior Dermatologist", exp: "10+ Years", spec: "Advanced Skin Rejuvenation", image: "https://images.unsplash.com/photo-1594824436951-7f12bc58ec53?q=80&w=800&auto=format&fit=crop" }
      ]
    },
    results: {
      title: "Visible Transformation",
      description: "View visible transformations and clinical cases of our patients before and after premium aesthetic procedures."
    },
    trust: {
      title: "Redefining the Standard of Premium Care",
      description: "Avetisyan Beauty Clinic integrates the world's most advanced aesthetic technologies with an uncompromising commitment to patient safety and bespoke architectural design, offering an experience that transcends traditional clinical environments."
    },
    insta: {
      title: "Instagram",
      description: "Stay updated with our latest treatments, offers and beauty tips on Instagram."
    }
  }
};

export interface InstagramPost {
  id: number | string;
  image: string;
  link: string;
  likes: number;
  comments: number;
  caption?: string;
}

const defaultInstaPosts: InstagramPost[] = [
  { id: 1, image: 'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?q=80&w=500&auto=format&fit=crop', link: '#', likes: 124, comments: 12 },
  { id: 2, image: 'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?q=80&w=500&auto=format&fit=crop', link: '#', likes: 89, comments: 5 },
  { id: 3, image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?q=80&w=500&auto=format&fit=crop', link: '#', likes: 256, comments: 34 },
  { id: 4, image: 'https://images.unsplash.com/photo-1552693673-1bf958298935?q=80&w=500&auto=format&fit=crop', link: '#', likes: 412, comments: 42 },
  { id: 5, image: 'https://images.unsplash.com/photo-1596755389378-c31d21fd1273?q=80&w=500&auto=format&fit=crop', link: '#', likes: 178, comments: 18 },
  { id: 6, image: 'https://images.unsplash.com/photo-1533423996375-f91444985df2?q=80&w=500&auto=format&fit=crop', link: '#', likes: 315, comments: 27 }
];

interface ContentState {
  content: LocalizedContent;
  instagramPosts: InstagramPost[];
  instagramConnected: boolean;
  instagramHandle: string;
  secondInstagramConnected: boolean;
  secondInstagramHandle: string;
  updateContent: (lang: 'hy' | 'ru' | 'en', section: keyof SiteContent, data: any) => void;
  updateInstagramPost: (index: number, post: Partial<InstagramPost>) => void;
  setInstagramPosts: (posts: InstagramPost[]) => void;
  connectInstagram: (handle: string) => void;
  disconnectInstagram: () => void;
  connectSecondInstagram: (handle: string) => void;
  disconnectSecondInstagram: () => void;
  resetContent: () => void;
}

export const useContentStore = create<ContentState>()(
  persist(
    (set) => ({
      content: defaultContent,
      instagramPosts: defaultInstaPosts,
      instagramConnected: false,
      instagramHandle: '',
      secondInstagramConnected: false,
      secondInstagramHandle: '',
      updateContent: (lang, section, data) => 
        set((state) => ({
          content: {
            ...state.content,
            [lang]: {
              ...state.content[lang],
              [section]: { ...state.content[lang][section], ...data }
            }
          }
        })),
      updateInstagramPost: (index, post) => 
        set((state) => {
          const newPosts = [...state.instagramPosts];
          newPosts[index] = { ...newPosts[index], ...post };
          return { instagramPosts: newPosts };
        }),
      setInstagramPosts: (posts) => set({ instagramPosts: posts }),
      connectInstagram: (handle) => set({ instagramConnected: true, instagramHandle: handle }),
      disconnectInstagram: () => set({ instagramConnected: false, instagramHandle: '' }),
      connectSecondInstagram: (handle) => set({ secondInstagramConnected: true, secondInstagramHandle: handle }),
      disconnectSecondInstagram: () => set({ secondInstagramConnected: false, secondInstagramHandle: '' }),
      resetContent: () => set({ content: defaultContent, instagramPosts: defaultInstaPosts, instagramConnected: false, instagramHandle: '', secondInstagramConnected: false, secondInstagramHandle: '' }),
    }),
    {
      name: 'avetisyan-clinic-content-localized',
    }
  )
);
