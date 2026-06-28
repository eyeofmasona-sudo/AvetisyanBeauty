import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { db } from '../lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

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
        { id: "ultraformer", title: "Ultraformer III", description: "Ժամանակակից սարքային մեթոդ՝ դեմքի մաշկի ձգման, օվալի բարելավման և մարմնի որոշ հատվածների խնամքի համար։", tag: "Առանց վիրահատության", href: "/hy/ultraformer" },
        { id: "goldensun", title: "Golden Sun", description: "Golden Sun ծառայությունը նախատեսված է մաշկին խնամված, թարմ և գեղեցիկ երանգ հաղորդելու համար։", tag: "Հատուկ ծառայություն", href: "/hy/golden-sun" },
        { id: "smas", title: "SMAS լիֆթինգ", description: "Ուլտրաձայնային ալիքների միջոցով իրականացվող մաշկի ձգում, որը օգնում է դեմքին տալ ավելի թարմ և խնամված տեսք։", tag: "Երիտասարդացում" },
        { id: "body-contouring", title: "Մարմնի կոնտուրավորում", description: "Մարմնի որոշ հատվածների տեսքի բարելավում, մաշկի ձգում և ձևերի ավելի հստակ ընդգծում՝ անհատական մոտեցմամբ։", tag: "Մարմնի խնամք" },
        { id: "skin-rejuvenation", title: "Մաշկի երիտասարդացում", description: "Խնամքի մեթոդներ, որոնք օգնում են թարմացնել մաշկի տեսքը, բարելավել երանգը և դարձնել այն ավելի հարթ ու առողջ տեսք ունեցող։", tag: "Մաշկի խնամք" }
      ]
    },
    specialists: {
      title: "Վստահելի մասնագետներ՝ անհատական մոտեցմամբ",
      description: "Մեր թիմը կարևորում է անվտանգությունը, ուշադիր մոտեցումը և բնական արդյունքը։ Յուրաքանչյուր այցելու ստանում է անհատական խորհրդատվություն և իրեն համապատասխան խնամքի պլան։",
      items: [
        { id: "specialist-1", name: "Անուն Ազգանուն", role: "Գլխավոր մասնագետ", exp: "", spec: "Դեմքի խնամք և երիտասարդացում" },
        { id: "specialist-2", name: "Անուն Ազգանուն", role: "Էսթետիկ կոսմետոլոգ", exp: "", spec: "Մարմնի խնամք և սարքային մեթոդներ" },
        { id: "specialist-3", name: "Անուն Ազգանուն", role: "Մաշկի խնամքի մասնագետ", exp: "", spec: "Մաշկի որակ, երանգ և խնամք" }
      ]
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
        { id: "ultraformer", title: "Ultraformer III", description: "Передовая технология MMFU для лифтинга лица, подтяжки кожи и контурирования тела.", tag: "Флагманская", href: "/ru/ultraformer" },
        { id: "goldensun", title: "Golden Sun", description: "Эксклюзивная процедура Golden Sun обеспечивает роскошный и сияющий результат.", tag: "Приоритетная", href: "/ru/golden-sun" },
        { id: "smas", title: "SMAS Лифтинг", description: "Прецизионный ультразвук, нацеленный на глубокие слои тканей для фундаментального структурного лифтинга.", tag: "Антивозрастной" },
        { id: "body-contouring", title: "Контурирование тела", description: "Целенаправленное уменьшение жировых отложений и подтяжка кожи с использованием комбинированного RF и ультразвука.", tag: "Скульптурирование" },
        { id: "skin-rejuvenation", title: "Омоложение кожи", description: "Протоколы обновления на клеточном уровне для безупречной текстуры и тона.", tag: "Эстетика" }
      ]
    },
    specialists: {
      title: "Экспертиза мирового уровня",
      description: "Наша команда сертифицированных дерматологов и специалистов эстетической медицины стремится обеспечивать исключительные результаты с точностью и заботой.",
      items: [
        { id: "specialist-1", name: "Главный медицинский директор", role: "", exp: "", spec: "Протоколы Anti-Aging и SMAS" },
        { id: "specialist-2", name: "Ведущий эстетический хирург", role: "", exp: "", spec: "Эксперт по контурированию тела" },
        { id: "specialist-3", name: "Старший дерматолог", role: "", exp: "", spec: "Передовое омоложение кожи" }
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
        { id: "ultraformer", title: "Ultraformer III", description: "Advanced MMFU technology for face lifting, skin tightening, and body contouring.", tag: "Flagship", href: "/en/ultraformer" },
        { id: "goldensun", title: "Golden Sun", description: "The exclusive Golden Sun treatment provides a luxurious and radiant finish.", tag: "Featured", href: "/en/golden-sun" },
        { id: "smas", title: "SMAS Lifting", description: "Precision ultrasound targeting deep tissue layers for foundational structural lift.", tag: "Anti-Aging" },
        { id: "body-contouring", title: "Body Contouring", description: "Targeted fat reduction and skin tightening utilizing combined RF and ultrasound.", tag: "Sculpting" },
        { id: "skin-rejuvenation", title: "Skin Rejuvenation", description: "Cellular level renewal protocols for flawless texture and tone.", tag: "Aesthetic" }
      ]
    },
    specialists: {
      title: "World-Class Expertise",
      description: "Our team of board-certified dermatologists and aesthetic medicine specialists are dedicated to delivering exceptional results with precision and care.",
      items: [
        { id: "specialist-1", name: "Chief Medical Director", role: "", exp: "", spec: "Anti-Aging & SMAS Protocols" },
        { id: "specialist-2", name: "Lead Aesthetic Surgeon", role: "", exp: "", spec: "Body Contouring Expert" },
        { id: "specialist-3", name: "Senior Dermatologist", role: "", exp: "", spec: "Advanced Skin Rejuvenation" }
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
    const docSnap = await getDoc(doc(db, 'site', 'content'));
    if (docSnap.exists()) {
      useContentStore.setState({ content: docSnap.data() as LocalizedContent });
    }
  } catch (e) {
    console.error("Failed to load content from DB", e);
  }
};

export const saveContentToDB = async (content: LocalizedContent) => {
  try {
    const cleanContent = JSON.parse(JSON.stringify(content));
    await setDoc(doc(db, 'site', 'content'), cleanContent, { merge: true });
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
