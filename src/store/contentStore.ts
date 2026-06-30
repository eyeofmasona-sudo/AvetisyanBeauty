import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../lib/supabase';

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
  price?: string;
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

const realSpecialists: SpecialistItem[] = [
  {
    id: "lika-petrosyan",
    name: "Լիկա Պետրոսյան",
    role: "",
    exp: "",
    spec: "",
    image: "/images/specialists/lika-petrosyan.png",
  },
  {
    id: "maria-avetisyan",
    name: "Մարիա Ավետիսյան",
    role: "",
    exp: "",
    spec: "",
    image: "/images/specialists/maria-avetisyan.jpg",
  },
  {
    id: "lilit-hovhannisyan",
    name: "Լիլիթ Հովհաննիսյան",
    role: "",
    exp: "",
    spec: "",
    image: "/images/specialists/lilit-hovhannisyan.jpg",
  },
];

const serviceImageById: Record<string, string> = {
  ultraformer: "/images/services/ultraformer-hero.png",
  smas: "/images/services/wrinkle-reduction-card.png",
  goldensun: "/images/services/golden-sun-before-after.png",
  "body-contouring": "/images/services/body-contouring-card.png",
  "skin-rejuvenation": "/images/services/skin-rejuvenation-card.png",
};

const normalizeServiceItems = (items: ServiceItem[]) =>
  items.map((item) => {
    const fallbackImage = serviceImageById[item.id];

    if (!fallbackImage) {
      return item;
    }

    return {
      ...item,
      image_url: fallbackImage,
    };
  });

/**
 * Normalize content loaded from Supabase.
 *
 * IMPORTANT: We ONLY normalize service image URLs (to ensure each service
 * card always has the right fallback image). We do NOT touch the specialists
 * array — the admin's saved names, roles, specializations and uploaded photo
 * URLs must be preserved verbatim. The previous implementation overwrote
 * specialists with a hardcoded `realSpecialists` array on every load, which
 * caused admin edits and photo uploads to silently disappear.
 */
const normalizeContent = (content: LocalizedContent): LocalizedContent => {
  const normalizeLang = (lang: keyof LocalizedContent) => ({
    ...content[lang],
    services: {
      ...content[lang].services,
      items: normalizeServiceItems(content[lang].services.items),
    },
  });

  return {
    hy: normalizeLang("hy"),
    ru: normalizeLang("ru"),
    en: normalizeLang("en"),
  };
};

export const defaultContent: LocalizedContent = {
  hy: {
    hero: {
      title: "Ultraformer III և Golden Sun ծառայություններ՝ բնական գեղեցկության համար",
      subtitle: "առանց վիրահատության",
      description: "Դեմքի երիտասարդացման, մաշկի ձգման և մարմնի խնամքի ժամանակակից լուծումներ՝ բնական, նուրբ և խնամված արդյունքի համար։"
    },
    services: {
      title: "Ժամանակակից լուծումներ Ձեր գեղեցկության և ինքնավստահության համար",
      description: "Մենք ընտրում ենք անվտանգ և արդյունավետ մեթոդներ, որոնք օգնում են խնամել մաշկը, բարելավել դեմքի ու մարմնի տեսքը և պահպանել բնական արդյունքը։",
      items: [
        { id: "ultraformer", title: "Ultraformer III", description: "Ժամանակակից սարքային մեթոդ՝ դեմքի մաշկի ձգման, օվալի բարելավման և մարմնի որոշ հատվածների խնամքի համար։", tag: "Առանց վիրահատության", href: "/hy/ultraformer", image_url: serviceImageById.ultraformer },
        { id: "goldensun", title: "Golden Sun", description: "Golden Sun ծառայությունը նախատեսված է մաշկին խնամված, թարմ և գեղեցիկ երանգ հաղորդելու համար։", tag: "Հատուկ ծառայություն", href: "/hy/golden-sun", image_url: serviceImageById.goldensun },
        { id: "smas", title: "SMAS լիֆթինգ", description: "Ուլտրաձայնային ալիքների միջոցով իրականացվող մաշկի ձգում, որը օգնում է դեմքին տալ ավելի թարմ և խնամված տեսք։", tag: "Երիտասարդացում", image_url: serviceImageById.smas },
        { id: "body-contouring", title: "Մարմնի կոնտուրավորում", description: "Մարմնի որոշ հատվածների տեսքի բարելավում, մաշկի ձգում և ձևերի ավելի հստակ ընդգծում՝ անհատական մոտեցմամբ։", tag: "Մարմնի խնամք", image_url: serviceImageById["body-contouring"] },
        { id: "skin-rejuvenation", title: "Մաշկի երիտասարդացում", description: "Խնամքի մեթոդներ, որոնք օգնում են թարմացնել մաշկի տեսքը, բարելավել երանգը և դարձնել այն ավելի հարթ ու առողջ տեսք ունեցող։", tag: "Մաշկի խնամք", image_url: serviceImageById["skin-rejuvenation"] }
      ]
    },
    specialists: {
      title: "Վստահելի մասնագետներ՝ անհատական մոտեցմամբ",
      description: "Մեր թիմը կարևորում է անվտանգությունը, ուշադիր մոտեցումը և բնական արդյունքը։ Յուրաքանչյուր այցելու ստանում է անհատական խորհրդատվություն և իրեն համապատասխան խնամքի պլան։",
      items: realSpecialists
    },
    results: {
      title: "Բնական և նկատելի փոփոխություն",
      description: "Տեսեք մեր այցելուների տեսանելի արդյունքները ծառայություններից առաջ և հետո։"
    },
    trust: {
      title: "Խնամք, որտեղ կարևոր է յուրաքանչյուր մանրուք",
      description: "Avetisyan Beauty Clinic-ում համադրում ենք ժամանակակից տեխնոլոգիաները, մասնագիտական մոտեցումը և հարմարավետ միջավայրը։ Մեզ համար կարևոր է, որ յուրաքանչյուր այցելու իրեն զգա վստահ, տեղեկացված և խնամված։"
    },
    insta: {
      title: "Հետևեք մեզ Instagram-ում",
      description: "Հետևեք մեր էջին՝ նոր ծառայություններին, առաջարկներին, արդյունքներին և գեղեցկության խնամքի խորհուրդներին ծանոթանալու համար։"
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
        { id: "ultraformer", title: "Ultraformer III", description: "Передовая технология MMFU для лифтинга лица, подтяжки кожи и контурирования тела.", tag: "Флагманская", href: "/ru/ultraformer", image_url: serviceImageById.ultraformer },
        { id: "goldensun", title: "Golden Sun", description: "Эксклюзивная процедура Golden Sun обеспечивает роскошный и сияющий результат.", tag: "Приоритетная", href: "/ru/golden-sun", image_url: serviceImageById.goldensun },
        { id: "smas", title: "SMAS Лифтинг", description: "Прецизионный ультразвук, нацеленный на глубокие слои тканей для фундаментального структурного лифтинга.", tag: "Антивозрастной", image_url: serviceImageById.smas },
        { id: "body-contouring", title: "Контурирование тела", description: "Целенаправленное уменьшение жировых отложений и подтяжка кожи с использованием комбинированного RF и ультразвука.", tag: "Скульптурирование", image_url: serviceImageById["body-contouring"] },
        { id: "skin-rejuvenation", title: "Омоложение кожи", description: "Протоколы обновления на клеточном уровне для безупречной текстуры и тона.", tag: "Эстетика", image_url: serviceImageById["skin-rejuvenation"] }
      ]
    },
    specialists: {
      title: "Экспертиза мирового уровня",
      description: "Наша команда сертифицированных дерматологов и специалистов эстетической медицины стремится обеспечивать исключительные результаты с точностью и заботой.",
      items: realSpecialists
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
        { id: "ultraformer", title: "Ultraformer III", description: "Advanced MMFU technology for face lifting, skin tightening, and body contouring.", tag: "Flagship", href: "/en/ultraformer", image_url: serviceImageById.ultraformer },
        { id: "goldensun", title: "Golden Sun", description: "The exclusive Golden Sun treatment provides a luxurious and radiant finish.", tag: "Featured", href: "/en/golden-sun", image_url: serviceImageById.goldensun },
        { id: "smas", title: "SMAS Lifting", description: "Precision ultrasound targeting deep tissue layers for foundational structural lift.", tag: "Anti-Aging", image_url: serviceImageById.smas },
        { id: "body-contouring", title: "Body Contouring", description: "Targeted fat reduction and skin tightening utilizing combined RF and ultrasound.", tag: "Sculpting", image_url: serviceImageById["body-contouring"] },
        { id: "skin-rejuvenation", title: "Skin Rejuvenation", description: "Cellular level renewal protocols for flawless texture and tone.", tag: "Aesthetic", image_url: serviceImageById["skin-rejuvenation"] }
      ]
    },
    specialists: {
      title: "World-Class Expertise",
      description: "Our team of board-certified dermatologists and aesthetic medicine specialists are dedicated to delivering exceptional results with precision and care.",
      items: realSpecialists
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

// No fabricated posts are shipped by default. Real posts are populated by
// the clinic via the admin panel's Instagram integration.
const defaultInstaPosts: InstagramPost[] = [];

interface ContentState {
  content: LocalizedContent;
  instagramPosts: InstagramPost[];
  instagramConnected: boolean;
  instagramHandle: string;
  secondInstagramConnected: boolean;
  secondInstagramHandle: string;
  updateContent: (lang: 'hy' | 'ru' | 'en', section: keyof SiteContent, data: any) => Promise<void>;
  updateInstagramPost: (index: number, post: Partial<InstagramPost>) => void;
  setInstagramPosts: (posts: InstagramPost[]) => void;
  connectInstagram: (handle: string) => void;
  disconnectInstagram: () => void;
  connectSecondInstagram: (handle: string) => void;
  disconnectSecondInstagram: () => void;
  resetContent: () => void;
}

export const loadContentFromDB = async () => {
  try {
    const { data, error } = await supabase
      .from('site')
      .select('data')
      .eq('key', 'content')
      .maybeSingle();

    if (error) throw error;
    if (data?.data && Object.keys(data.data).length > 0) {
      useContentStore.setState({ content: normalizeContent(data.data as LocalizedContent) });
    }
  } catch (e) {
    console.error("Failed to load content from DB", e);
  }
};

export const saveContentToDB = async (content: LocalizedContent) => {
  try {
    // Routed through the admin-only backend endpoint (cookie-authenticated)
    // because the server uses the service role key to bypass RLS — anon
    // client cannot write to `site` from the browser.
    const res = await fetch('/api/db/site/content', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(content),
    });
    if (!res.ok) throw new Error('Failed to save content');
  } catch (e) {
    console.error("Failed to save content to DB", e);
    throw e;
  }
};

export const useContentStore = create<ContentState>()(
  persist(
    (set, get) => ({
      content: defaultContent,
      instagramPosts: defaultInstaPosts,
      instagramConnected: false,
      instagramHandle: '',
      secondInstagramConnected: false,
      secondInstagramHandle: '',
      updateContent: async (lang, section, data) => {
        const newContent = {
          ...get().content,
          [lang]: {
            ...get().content[lang],
            [section]: { ...get().content[lang][section], ...data }
          }
        };
        set({ content: newContent });
        await saveContentToDB(newContent);
      },
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
