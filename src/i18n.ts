import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  hy: {
    translation: {
      "seo": {
        "home": {
          "title": "Avetisyan Beauty Clinic | Պրեմիում Էսթետիկ Բժշկություն",
          "description": "Պրեմիում էսթետիկ կենտրոն, որն առաջարկում է ոչ վիրահատական երիտասարդացում, Ultraformer III, SMAS լիֆթինգ և մարմնի կոնտուրավորում:"
        },
        "ultraformer": {
          "title": "Ultraformer III - Ոչ վիրահատական SMAS Լիֆթինգ | Avetisyan Beauty Clinic",
          "description": "Բացահայտեք ոչ վիրահատական մաշկի ձգման և լիֆթինգի նոր սերունդը Ultraformer III-ի միջոցով Avetisyan Beauty Clinic-ում:"
        },
        "gallery": {
          "title": "Առաջ և Հետո Արդյունքներ | Avetisyan Beauty Clinic",
          "description": "Դիտեք մեր պացիենտների տեսանելի փոխակերպումները պրեմիում էսթետիկ պրոցեդուրաներից առաջ և հետո:"
        },
        "admin": {
          "title": "Ադմինիստրատիվ Պահանակ | Avetisyan Beauty Clinic",
          "description": "Կառավարեք ձեր էսթետիկ կենտրոնը:"
        },
        "goldensun": {
          "title": "Golden Sun | Avetisyan Beauty Clinic",
          "description": "Golden Sun պրոցեդուրան Avetisyan Beauty Clinic-ում:"
        }
      },
      "nav": {
        "services": "Ծառայություններ",
        "results": "Արդյունքներ",
        "specialists": "Մասնագետներ",
        "clinic": "Կլինիկա",
        "consultation": "Խորհրդատվություն",
        "book": "Գրանցվել"
      },
      "hero": {
        "badge": "Էսթետիկայի ապագան",
        "title": "Ultraformer III և Golden Sun ծառայություններ՝ ժամանակակից էսթետիկ խնամքի համար",
        "highlight": "առանց վիրահատության",
        "desc": "Դեմքի երիտասարդացման և մարմնի կորեկցիայի պրոֆեսիոնալ լուծումներ, որոնք նախագծված են ճշգրտության և բնական արդյունքների համար:",
        "bookBtn": "Գրանցվել Ultraformer III-ի համար",
        "consultBtn": "Գրանցվել Golden Sun-ի համար",
        "scroll": "Ոլորեք ներքև"
      },
      "services": {
        "badge": "Առաջադեմ արձանագրություններ",
        "title": "Գեղեցկության ապագայի կառուցում",
        "desc": "Մեր կողմից մանրակրկիտ ընտրված FDA-ի կողմից հաստատված տեխնոլոգիաներ և մասնագիտացված արձանագրություններ, որոնք նախատեսված են օպտիմալ, բնական տեսք ունեցող արդյունքների համար:",
        "items": {
          "ultraformer": {
            "title": "Ultraformer III",
            "desc": "Առաջադեմ MMFU տեխնոլոգիա դեմքի լիֆթինգի, մաշկի ձգման և մարմնի կոնտուրավորման համար:",
            "tag": "Ոչ Ինվազիվ"
          },
          "smas": {
            "title": "SMAS Լիֆթինգ",
            "desc": "Ճշգրիտ ուլտրաձայնային ալիքներ, որոնք թիրախավորում են հյուսվածքների խորը շերտերը հիմնարար կառուցվածքային բարձրացման համար:",
            "tag": "Հակատարիքային"
          },
          "body": {
            "title": "Մարմնի Կոնտուրավորում",
            "desc": "Նպատակային ճարպի նվազեցում և մաշկի ձգում՝ օգտագործելով համակցված ՌՖ և ուլտրաձայնային ալիքներ:",
            "tag": "Քանդակում"
          },
          "skin": {
            "title": "Մաշկի Երիտասարդացում",
            "desc": "Բջջային մակարդակում թարմացման արձանագրություններ՝ անթերի հյուսվածքի և երանգի համար:",
            "tag": "Էսթետիկ"
          }
        }
      },
      "results": {
        "badge": "Կլինիկական արդյունավետություն",
        "title": "Տեսանելի Փոխակերպում",
        "after": "ՀԵՏՈ",
        "before": "ԱՌԱՋ",
        "protocol": "SMAS Լիֆթինգի Արձանագրություն",
        "patient": "Պացիենտ՝ 42 տ. / 1 Սեանս",
        "btn": "Դիտել դեպքի ուսումնասիրությունը",
        "viewGallery": "Դիտել ամբողջ պատկերասրահը",
        "stats": {
          "satisfaction": "Պացիենտների բավարարվածություն",
          "procedures": "Կատարված պրոցեդուրաներ",
          "awards": "Գլոբալ մրցանակներ",
          "surgical": "Վիրաբուժական միջամտություններ"
        }
      },
      "gallery": {
        "title": "Առաջ և Հետո",
        "desc": "Տեսեք մեր պացիենտների տեսանելի փոխակերպումները:",
        "filterAll": "Բոլորը",
        "placeholder": "Արդյունքները կավելացվեն շուտով"
      },
      "insta": {
        "follow_us": "Հետևեք մեզ",
        "desc": "Տեղեկացեք մեր նորագույն պրոցեդուրաների, առաջարկների և գեղեցկության խորհուրդների մասին Instagram-ում:"
      },
      "admin": {
        "title": "Ադմինիստրատիվ Պահանակ",
        "cases": "Դեպքեր",
        "addCase": "Ավելացնել նոր դեպք",
        "protocol": "Արձանագրություն",
        "patientDesc": "Պացիենտի նկարագրություն",
        "category": "Կատեգորիա",
        "save": "Պահպանել",
        "cancel": "Չեղարկել",
        "edit": "Խմբագրել",
        "delete": "Ջնջել",
        "noCases": "Դեպքեր չեն գտնվել",
        "dashboard": "Կառավարման վահանակ",
        "services": "Ծառայություններ",
        "beforeAfter": "Առաջ / Հետո",
        "specialists": "Մասնագետներ",
        "reviews": "Կարծիքներ",
        "blog": "Բլոգ",
        "bookings": "Ամրագրումներ",
        "marketing": "Մարքեթինգ",
        "analytics": "Վիճակագրություն",
        "settings": "Կարգավորումներ",
        "aiAssistant": "Արհեստական Բանականություն",
        "aiTitle": "ԱԲ Մարքեթինգային Օգնական",
        "aiDesc": "Ստեղծեք պրեմիում բովանդակություն ձեր էսթետիկ կենտրոնի համար:",
        "aiActions": {
            "insta": "Ստեղծել Instagram-ի գրառում",
            "seo": "Գրել SEO հոդված",
            "reels": "Ստեղծել Reels-ի սցենար",
            "offer": "Առաջարկել մարքեթինգային արշավ",
            "translate": "Թարգմանել բովանդակությունը"
        },
        "aiPlaceholder": "Նկարագրեք, թե ինչ եք ցանկանում ստեղծել... (օրինակ՝ «Գրել էլեգանտ գրառում նոր Ultraformer III պրոցեդուրայի մասին»)",
        "aiGenerateBtn": "Ստեղծել Բովանդակություն",
        "underConstruction": "Այս բաժինը ներկայումս մշակման փուլում է: Այն կունենա թեթև և էլեգանտ ինտերֆեյս կլինիկայի տվյալների կառավարման համար:",
        "capabilities": "Հնարավորություններ",
        "ideation": "Բովանդակության ստեղծում",
        "seoOpt": "SEO Օպտիմալացում",
        "translation": "Բազմալեզու թարգմանություն",
        "typeRequest": "Մուտքագրեք ձեր հարցումը այստեղ...",
        "stats": {
          "totalBookings": "Ընդհանուր ամրագրումներ",
          "revenue": "Շրջանառություն",
          "conversion": "Կոնվերսիա"
        },
        "recentBookings": "Վերջին ամրագրումները",
        "status": {
          "pending": "Սպասվող",
          "confirmed": "Հաստատված",
          "completed": "Ավարտված"
        },
        "addNewService": "Ավելացնել ծառայություն",
        "addNewSpecialist": "Ավելացնել մասնագետ",
        "addNewReview": "Ավելացնել կարծիք",
        "serviceName": "Ծառայության անվանում",
        "price": "Գին",
        "duration": "Տևողություն",
        "newCampaign": "Նոր արշավ",
        "reach": "Ընդգրկում",
        "spend": "Ծախս",
        "statusCampaign": {
          "active": "Ակտիվ",
          "scheduled": "Պլանավորված",
          "paused": "Կանգնեցված"
        },
        "monthlyRevenue": "Ամսական շահույթ",
        "demographics": "Պացիենտների տվյալներ",
        "clinicInfo": "Կլինիկայի տվյալներ",
        "clinicName": "Կլինիկայի անվանում",
        "contactEmail": "Էլ․ հասցե",
        "phone": "Հեռախոսահամար",
        "adminAccount": "Ադմինիստրատորի հաշիվ",
        "fullName": "Լրիվ անուն",
        "password": "Գաղտնաբառ",
        "saveChanges": "Պահպանել փոփոխությունները",
        "newPost": "Նոր հոդված",
        "statusPost": {
          "published": "Հրապարակված",
          "draft": "Սևագիր"
        },
        "portalTitle": "Ադմինիստրատիվ Պորտալ",
        "portalDesc": "Անվտանգ մուտք դեպի Avetisyan Beauty Clinic-ի կառավարում",
        "username": "Օգտանուն",
        "signIn": "Մուտք գործել",
        "instagramConnect": "Instagram-ի Միացում",
        "manageCarousel": "Կառավարել Կարուսելի Գրառումները",
        "imageUrl": "Նկարի հղում (URL)",
        "postLink": "Գրառման հղում (URL)",
        "likes": "Հավանումներ",
        "comments": "Մեկնաբանություններ"
      },
      "specialists": {
        "badge": "Մեր Փորձագետները",
        "title": "Վարպետություն Էսթետիկ Ճարտարապետությունում",
        "desc": "Համաշխարհային կարգի բժշկական մասնագետներ՝ նվիրված ճշգրտությանը, անվտանգությանը և արվեստին:",
        "diplomas": "Դիպլոմներ",
        "certificates": "Վկայականներ",
        "items": {
          "elena": {
            "name": "Բժ. Ելենա Ռոստովա",
            "role": "Գլխավոր բժշկական տնօրեն",
            "exp": "15+ Տարի",
            "spec": "Հակատարիքային և SMAS Արձանագրություններ"
          },
          "marcus": {
            "name": "Բժ. Մարկուս Չեն",
            "role": "Առաջատար էսթետիկ վիրաբույժ",
            "exp": "12+ Տարի",
            "spec": "Մարմնի կոնտուրավորման փորձագետ"
          },
          "sarah": {
            "name": "Բժ. Սառա Ալ-Ֆայեդ",
            "role": "Ավագ մաշկաբան",
            "exp": "10+ Տարի",
            "spec": "Մաշկի առաջադեմ երիտասարդացում"
          }
        }
      },
      "trust": {
        "badge": "Ճանաչված Գլոբալ Առաջնորդների Կողմից",
        "title": "Պրեմիում Խնամքի Ստանդարտի Վերասահմանում",
        "desc": "Avetisyan Beauty Clinic-ը միավորում է աշխարհի ամենաառաջադեմ էսթետիկ տեխնոլոգիաները պացիենտների անվտանգության անզիջում հանձնառության և հատուկ ճարտարապետական ձևավորման հետ՝ առաջարկելով փորձ, որը գերազանցում է ավանդական կլինիկական միջավայրը:",
        "btn": "Բացահայտել Կլինիկան"
      },
      "footer": {
        "desc": "Ոչ ինվազիվ էսթետիկ բժշկության գագաթնակետը: Համատեղելով առաջադեմ տեխնոլոգիաները ճարպարապետական էլեգանտության հետ:",
        "treatments": "Պրոցեդուրաներ",
        "contact": "Կապ",
        "address": "Ք. Երևան, Ամիրյան 18",
        "rights": "© 2027 Avetisyan Beauty Clinic: Բոլոր իրավունքները պաշտպանված են:",
        "privacy": "Գաղտնիության քաղաքականություն",
        "terms": "Ծառայությունների մատուցման պայմաններ"
      },
      "booking": {
        "title": "Ամրագրել հանդիպում",
        "step": "Քայլ {{current}} / {{total}}",
        "serviceTitle": "Ընտրեք ծառայության կատեգորիան",
        "cats": {
          "face": "Դեմքի երիտասարդացում",
          "body": "Մարմնի կոնտուրավորում",
          "inject": "Ներարկումներ",
          "skin": "Մաշկի կառուցվածք և երանգ"
        },
        "dateTimeTitle": "Ընտրեք ամսաթիվը և ժամը",
        "calPlaceholder": "Ինտերակտիվ օրացույց",
        "availableTimes": "Հասանելի ժամեր",
        "detailsTitle": "Ձեր տվյալները",
        "namePlace": "Լրիվ անուն",
        "emailPlace": "Էլ․ հասցե",
        "phonePlace": "Հեռախոսահամար",
        "confirmBtn": "Հաստատել ամրագրումը",
        "backBtn": "← Հետ",
        "success": "Ամրագրումը հաստատված է:"
      },
      "ultraformer": {
        "badge": "Սարքավորումային կոսմետոլոգիա",
        "title": "Ultraformer III",
        "desc": "Ոչ վիրահատական SMAS լիֆթինգի և մարմնի կոնտուրավորման համաշխարհային առաջատար: MMFU (Միկրո և Մակրո Ֆոկուսացված Ուլտրաձայնային) տեխնոլոգիան ապահովում է անթերի արդյունքներ առանց վերականգնողական շրջանի:",
        "bookBtn": "Գրանցվել պրոցեդուրայի",
        "howItWorks": "Ինչպես է այն աշխատում",
        "howDesc": "Բարձր ինտենսիվության ուլտրաձայնային ալիքները ներթափանցում են մաշկի տարբեր շերտեր՝ խթանելով կոլագենի նորացումը և ապահովելով հզոր լիֆթինգ էֆեկտ:",
        "benefits": "Առավելություններ",
        "benefitsList": [
          "Արագ և արդյունավետ",
          "Առանց ցավի և վերականգնման",
          "Բնական արդյունքներ",
          "Երկարատև ազդեցություն"
        ],
        "3d": {
          "title": "Թիրախային Շերտեր",
          "subtitle": "Սավառնեք շերտերի վրայով՝ ուսումնասիրելու համար • Քաշեք՝ պտտելու համար",
          "epidermis": {
            "name": "Էպիդերմիս",
            "desc": "Մաշկի արտաքին շերտը: Ultraformer III-ը շրջանցում է այս շերտը՝ մակերեսային վնասվածքներից խուսափելու համար:"
          },
          "dermis": {
            "name": "Դերմիս",
            "desc": "Միջին շերտ, որը պարունակում է կոլագեն և էլաստին: Թիրախավորված է կնճիռների նվազեցման և մաշկի ձգման համար:"
          },
          "smas": {
            "name": "SMAS Շերտ",
            "desc": "Մակերեսային մկանային ապոնևրոտիկ համակարգ: Խորը հիմնական շերտը, որը բարձրացվում է վիրաբուժական դեմքի ձգման ժամանակ, այժմ ոչ ինվազիվ թիրախավորված է Ultraformer III-ի կողմից:"
          },
          "viz": "Միկրո և Մակրո Կենտրոնացված Ուլտրաձայնային Վիզուալիզացիա"
        },
        "videoPlaceholder": "Վիդեո (շուտով)"
      },
      "goldensun": {
        "badge": "Առաջնային",
        "title": "Golden Sun",
        "desc": "Բացահայտեք Golden Sun-ի շողշողացող առավելությունները:",
        "bookBtn": "Գրանցվել Golden Sun-ի համար",
        "howItWorks": "Պրոցեդուրայի մասին",
        "howDesc": "Բացառիկ Golden Sun պրոցեդուրան ապահովում է շքեղ և շողացող արդյունք:",
        "benefits": "Առավելություններ",
        "benefitsList": [
          "Շողացող մաշկ",
          "Խորը խոնավացում",
          "Հարթ երանգ",
          "Ակնթարթային փայլ"
        ]
      }
    }
  },
  ru: {
    translation: {
      "seo": {
        "home": {
          "title": "Avetisyan Beauty Clinic | Премиальная эстетическая медицина",
          "description": "Премиальный эстетический центр, предлагающий безоперационное омоложение, Ultraformer III, SMAS-лифтинг и контуринг тела."
        },
        "ultraformer": {
          "title": "Ultraformer III - Безоперационный SMAS Лифтинг | Avetisyan Beauty Clinic",
          "description": "Испытайте новое поколение безоперационной подтяжки кожи и лифтинга с Ultraformer III в Avetisyan Beauty Clinic."
        },
        "gallery": {
          "title": "Результаты До и После | Avetisyan Beauty Clinic",
          "description": "Посмотрите на видимые трансформации и клинические случаи наших пациентов до и после премиальных эстетических процедур."
        },
        "admin": {
          "title": "Панель администратора | Avetisyan Beauty Clinic",
          "description": "Управление вашим эстетическим центром."
        },
        "goldensun": {
          "title": "Golden Sun | Avetisyan Beauty Clinic",
          "description": "Процедура Golden Sun в Avetisyan Beauty Clinic."
        }
      },
      "nav": {
        "services": "Услуги",
        "results": "Результаты",
        "specialists": "Специалисты",
        "clinic": "Клиника",
        "consultation": "Консультация",
        "book": "Записаться"
      },
      "hero": {
        "badge": "Будущее эстетики",
        "title": "Ultraformer III и Golden Sun — ключевые услуги современной эстетической клиники",
        "highlight": "без хирургии",
        "desc": "Профессиональные решения для омоложения лица и коррекции фигуры.",
        "bookBtn": "Записаться на Ultraformer III",
        "consultBtn": "Записаться на Golden Sun",
        "scroll": "Листайте вниз"
      },
      "services": {
        "badge": "Передовые протоколы",
        "title": "Проектирование Будущего Красоты",
        "desc": "Наша тщательно отобранная коллекция одобренных FDA технологий и специализированных протоколов, разработанных для оптимальных, естественно выглядящих результатов.",
        "items": {
          "ultraformer": {
            "title": "Ultraformer III",
            "desc": "Передовая технология MMFU для лифтинга лица, подтяжки кожи и контурирования тела.",
            "tag": "Неинвазивно"
          },
          "smas": {
            "title": "SMAS Лифтинг",
            "desc": "Прецизионный ультразвук, нацеленный на глубокие слои тканей для фундаментального структурного лифтинга.",
            "tag": "Антивозрастной"
          },
          "body": {
            "title": "Контурирование тела",
            "desc": "Целенаправленное уменьшение жировых отложений и подтяжка кожи с использованием комбинированного RF и ультразвука.",
            "tag": "Скульптурирование"
          },
          "skin": {
            "title": "Омоложение кожи",
            "desc": "Протоколы обновления на клеточном уровне для безупречной текстуры и тона.",
            "tag": "Эстетика"
          }
        }
      },
      "results": {
        "badge": "Клиническая эффективность",
        "title": "Видимая трансформация",
        "after": "ПОСЛЕ",
        "before": "ДО",
        "protocol": "Протокол SMAS Лифтинга",
        "patient": "Пациент: 42 года / 1 Сеанс",
        "btn": "Смотреть клинический случай",
        "viewGallery": "Смотреть всю галерею",
        "stats": {
          "satisfaction": "Удовлетворенность пациентов",
          "procedures": "Проведенных процедур",
          "awards": "Мировых наград",
          "surgical": "Хирургических вмешательств"
        }
      },
      "gallery": {
        "title": "До и После",
        "desc": "Ознакомьтесь с видимыми трансформациями наших пациентов.",
        "filterAll": "Все",
        "placeholder": "Результаты будут добавлены скоро"
      },
      "insta": {
        "follow_us": "Подписывайтесь на нас",
        "desc": "Будьте в курсе наших новейших процедур, предложений и советов по красоте в Instagram."
      },
      "admin": {
        "title": "Панель администратора",
        "cases": "Клинические случаи",
        "addCase": "Добавить случай",
        "protocol": "Протокол",
        "patientDesc": "Описание пациента",
        "category": "Категория",
        "save": "Сохранить",
        "cancel": "Отмена",
        "edit": "Редактировать",
        "delete": "Удалить",
        "noCases": "Случаи не найдены",
        "dashboard": "Дашборд",
        "services": "Услуги",
        "beforeAfter": "До / После",
        "specialists": "Специалисты",
        "reviews": "Отзывы",
        "blog": "Блог",
        "bookings": "Заявки",
        "marketing": "Маркетинг",
        "analytics": "Аналитика",
        "settings": "Настройки",
        "aiAssistant": "ИИ Ассистент",
        "aiTitle": "ИИ Маркетинговый Ассистент",
        "aiDesc": "Создавайте премиальный контент для вашего эстетического центра.",
        "aiActions": {
            "insta": "Создать пост для Instagram",
            "seo": "Написать SEO статью",
            "reels": "Сценарий для Reels",
            "offer": "Предложить акцию",
            "translate": "Перевести контент"
        },
        "aiPlaceholder": "Опишите, что вы хотите создать... (например, 'Написать элегантный пост о новой процедуре Ultraformer III')",
        "aiGenerateBtn": "Создать контент",
        "underConstruction": "Этот раздел находится в разработке. Здесь будет легкий и элегантный интерфейс для управления данными клиники.",
        "capabilities": "Возможности",
        "ideation": "Создание контента",
        "seoOpt": "SEO Оптимизация",
        "translation": "Многоязычный перевод",
        "typeRequest": "Введите ваш запрос здесь...",
        "stats": {
          "totalBookings": "Всего заявок",
          "revenue": "Выручка",
          "conversion": "Конверсия"
        },
        "recentBookings": "Последние заявки",
        "status": {
          "pending": "В ожидании",
          "confirmed": "Подтверждено",
          "completed": "Завершено"
        },
        "addNewService": "Добавить услугу",
        "addNewSpecialist": "Добавить специалиста",
        "addNewReview": "Добавить отзыв",
        "serviceName": "Название услуги",
        "price": "Цена",
        "duration": "Длительность",
        "newCampaign": "Новая кампания",
        "reach": "Охват",
        "spend": "Бюджет",
        "statusCampaign": {
          "active": "Активна",
          "scheduled": "Запланирована",
          "paused": "На паузе"
        },
        "monthlyRevenue": "Ежемесячная выручка",
        "demographics": "Демография пациентов",
        "clinicInfo": "Информация о клинике",
        "clinicName": "Название клиники",
        "contactEmail": "Контактный Email",
        "phone": "Номер телефона",
        "adminAccount": "Аккаунт администратора",
        "fullName": "Полное имя",
        "password": "Пароль",
        "saveChanges": "Сохранить изменения",
        "newPost": "Новый пост",
        "statusPost": {
          "published": "Опубликовано",
          "draft": "Черновик"
        },
        "portalTitle": "Панель Администратора",
        "portalDesc": "Безопасный доступ к управлению Avetisyan Beauty Clinic",
        "username": "Имя пользователя",
        "signIn": "Войти",
        "instagramConnect": "Подключение Instagram",
        "manageCarousel": "Управление постами карусели",
        "imageUrl": "URL изображения",
        "postLink": "Ссылка на пост",
        "likes": "Лайки",
        "comments": "Комментарии"
      },
      "specialists": {
        "badge": "Наши Эксперты",
        "title": "Мастерство в Эстетической Архитектуре",
        "desc": "Медицинские специалисты мирового класса, преданные точности, безопасности и артистизму.",
        "diplomas": "Дипломы",
        "certificates": "Сертификаты",
        "items": {
          "elena": {
            "name": "Д-р Елена Ростова",
            "role": "Главный медицинский директор",
            "exp": "15+ Лет",
            "spec": "Протоколы Anti-Aging и SMAS"
          },
          "marcus": {
            "name": "Д-р Маркус Чен",
            "role": "Ведущий эстетический хирург",
            "exp": "12+ Лет",
            "spec": "Эксперт по контурированию тела"
          },
          "sarah": {
            "name": "Д-р Сара Аль-Файед",
            "role": "Старший дерматолог",
            "exp": "10+ Лет",
            "spec": "Передовое омоложение кожи"
          }
        }
      },
      "trust": {
        "badge": "Признаны мировыми лидерами",
        "title": "Переопределение Стандарта Премиального Ухода",
        "desc": "Avetisyan Beauty Clinic объединяет самые передовые в мире эстетические технологии с бескомпромиссной приверженностью безопасности пациентов и индивидуальным архитектурным дизайном, предлагая опыт, выходящий за рамки традиционных клинических условий.",
        "btn": "Исследовать клинику"
      },
      "footer": {
        "desc": "Вершина неинвазивной эстетической медицины. Сочетание передовых технологий с архитектурной элегантностью.",
        "treatments": "Процедуры",
        "contact": "Контакты",
        "address": "г. Ереван, ул. Амиряна 18",
        "rights": "© 2027 Avetisyan Beauty Clinic. Все права защищены.",
        "privacy": "Политика конфиденциальности",
        "terms": "Условия использования"
      },
      "booking": {
        "title": "Запись на прием",
        "step": "Шаг {{current}} из {{total}}",
        "serviceTitle": "Выберите категорию услуг",
        "cats": {
          "face": "Омоложение лица",
          "body": "Контурирование тела",
          "inject": "Инъекции",
          "skin": "Текстура и тон кожи"
        },
        "dateTimeTitle": "Выберите дату и время",
        "calPlaceholder": "Интерактивный календарь (заглушка)",
        "availableTimes": "Доступное время",
        "detailsTitle": "Ваши данные",
        "namePlace": "Полное имя",
        "emailPlace": "Электронная почта",
        "phonePlace": "Номер телефона",
        "confirmBtn": "Подтвердить запись",
        "backBtn": "← Назад",
        "success": "Запись подтверждена!"
      },
      "ultraformer": {
        "badge": "Аппаратная косметология",
        "title": "Ultraformer III",
        "desc": "Мировой лидер в безоперационном SMAS лифтинге и контурировании тела. Технология MMFU (микро- и макросфокусированный ультразвук) обеспечивает безупречные результаты без периода реабилитации.",
        "bookBtn": "Записаться на процедуру",
        "howItWorks": "Как это работает",
        "howDesc": "Высокоинтенсивные ультразвуковые волны проникают в различные слои кожи, стимулируя обновление коллагена и обеспечивая мощный эффект лифтинга.",
        "benefits": "Преимущества",
        "benefitsList": [
          "Быстро и эффективно",
          "Без боли и реабилитации",
          "Естественные результаты",
          "Длительный эффект"
        ],
        "3d": {
          "title": "Целевые Слои",
          "subtitle": "Наведите на слои для изучения • Перетащите для вращения",
          "epidermis": {
            "name": "Эпидермис",
            "desc": "Внешний слой кожи. Ultraformer III обходит этот слой, чтобы избежать повреждения поверхности."
          },
          "dermis": {
            "name": "Дерма",
            "desc": "Средний слой, содержащий коллаген и эластин. Мишень для уменьшения морщин и подтяжки кожи."
          },
          "smas": {
            "name": "Слой SMAS",
            "desc": "Поверхностная мышечно-апоневротическая система. Глубокий базовый слой, подтягиваемый при хирургической подтяжке лица, теперь является неинвазивной мишенью для Ultraformer III."
          },
          "viz": "Визуализация микро- и макро-сфокусированного ультразвука"
        },
        "videoPlaceholder": "Видео (скоро)"
      },
      "goldensun": {
        "badge": "Приоритетная",
        "title": "Golden Sun",
        "desc": "Откройте для себя сияющие преимущества Golden Sun.",
        "bookBtn": "Записаться на Golden Sun",
        "howItWorks": "О процедуре",
        "howDesc": "Эксклюзивная процедура Golden Sun обеспечивает роскошный и сияющий результат.",
        "benefits": "Преимущества",
        "benefitsList": [
          "Сияющая кожа",
          "Глубокое увлажнение",
          "Ровный тон",
          "Мгновенное сияние"
        ]
      }
    }
  },
  en: {
    translation: {
      "seo": {
        "home": {
          "title": "Avetisyan Beauty Clinic | Premium Aesthetic Medicine",
          "description": "Premium aesthetic center offering non-surgical rejuvenation, Ultraformer III, SMAS lifting, and body contouring."
        },
        "ultraformer": {
          "title": "Ultraformer III - Non-Surgical SMAS Lifting | Avetisyan Beauty Clinic",
          "description": "Experience the next generation of non-surgical skin tightening and lifting with Ultraformer III at Avetisyan Beauty Clinic."
        },
        "gallery": {
          "title": "Before & After Results | Avetisyan Beauty Clinic",
          "description": "View visible transformations and clinical cases of our patients before and after premium aesthetic procedures."
        },
        "admin": {
          "title": "Admin Panel | Avetisyan Beauty Clinic",
          "description": "Manage your aesthetic center."
        },
        "goldensun": {
          "title": "Golden Sun | Avetisyan Beauty Clinic",
          "description": "Golden Sun treatment at Avetisyan Beauty Clinic."
        }
      },
      "nav": {
        "services": "Services",
        "results": "Results",
        "specialists": "Specialists",
        "clinic": "Clinic",
        "consultation": "Consultation",
        "book": "Book Now"
      },
      "hero": {
        "badge": "The Future of Aesthetics",
        "title": "Ultraformer III and Golden Sun — key services for modern aesthetic care",
        "highlight": "Without Surgery",
        "desc": "Professional solutions for facial rejuvenation and body contouring, engineered for precision and natural results.",
        "bookBtn": "Book Ultraformer III",
        "consultBtn": "Book Golden Sun",
        "scroll": "Scroll to explore"
      },
      "services": {
        "badge": "Advanced Protocols",
        "title": "Engineering the Future of Beauty",
        "desc": "Our curated selection of FDA-approved technologies and specialized protocols designed for optimal, natural-looking results.",
        "items": {
          "ultraformer": {
            "title": "Ultraformer III",
            "desc": "Advanced MMFU technology for face lifting, skin tightening, and body contouring.",
            "tag": "Non-Invasive"
          },
          "smas": {
            "title": "SMAS Lifting",
            "desc": "Precision ultrasound targeting deep tissue layers for foundational structural lift.",
            "tag": "Anti-Aging"
          },
          "body": {
            "title": "Body Contouring",
            "desc": "Targeted fat reduction and skin tightening utilizing combined RF and ultrasound.",
            "tag": "Sculpting"
          },
          "skin": {
            "title": "Skin Rejuvenation",
            "desc": "Cellular level renewal protocols for flawless texture and tone.",
            "tag": "Aesthetic"
          }
        }
      },
      "results": {
        "badge": "Clinical Efficacy",
        "title": "Visible Transformation",
        "after": "AFTER",
        "before": "BEFORE",
        "protocol": "SMAS Lifting Protocol",
        "patient": "Patient: 42 y.o. / 1 Session",
        "btn": "View Case Study",
        "viewGallery": "View Full Gallery",
        "stats": {
          "satisfaction": "Patient Satisfaction",
          "procedures": "Procedures Performed",
          "awards": "Global Awards",
          "surgical": "Surgical Interventions"
        }
      },
      "gallery": {
        "title": "Before & After",
        "desc": "Explore the visible transformations of our patients.",
        "filterAll": "All",
        "placeholder": "Results will be added soon"
      },
      "insta": {
        "follow_us": "Follow Us",
        "desc": "Stay updated with our latest treatments, offers and beauty tips on Instagram."
      },
      "admin": {
        "title": "Admin Panel",
        "cases": "Cases",
        "addCase": "Add New Case",
        "protocol": "Protocol",
        "patientDesc": "Patient Description",
        "category": "Category",
        "save": "Save",
        "cancel": "Cancel",
        "edit": "Edit",
        "delete": "Delete",
        "noCases": "No cases found",
        "dashboard": "Dashboard",
        "services": "Services",
        "beforeAfter": "Before / After",
        "specialists": "Specialists",
        "reviews": "Reviews",
        "blog": "Blog",
        "bookings": "Booking Requests",
        "marketing": "Marketing Content",
        "analytics": "Analytics",
        "settings": "Settings",
        "aiAssistant": "AI Assistant",
        "aiTitle": "AI Marketing Assistant",
        "aiDesc": "Generate premium content for your aesthetic center.",
        "aiActions": {
            "insta": "Create Instagram Post",
            "seo": "Write SEO Article",
            "reels": "Generate Reels Script",
            "offer": "Propose Marketing Offer",
            "translate": "Translate Content"
        },
        "aiPlaceholder": "Describe what you want to create... (e.g., 'Write an elegant post about the new Ultraformer III procedure')",
        "aiGenerateBtn": "Generate Content",
        "underConstruction": "This section is currently under construction. It will feature a light, elegant interface for managing your clinic's data without the complexity of a full CRM.",
        "capabilities": "Capabilities",
        "ideation": "Content Ideation",
        "seoOpt": "SEO Optimization",
        "translation": "Multi-language Translation",
        "typeRequest": "Type your request here...",
        "stats": {
          "totalBookings": "Total Bookings",
          "revenue": "Revenue",
          "conversion": "Conversion"
        },
        "recentBookings": "Recent Bookings",
        "status": {
          "pending": "Pending",
          "confirmed": "Confirmed",
          "completed": "Completed"
        },
        "addNewService": "Add New Service",
        "addNewSpecialist": "Add Specialist",
        "addNewReview": "Add Review",
        "serviceName": "Service Name",
        "price": "Price",
        "duration": "Duration",
        "newCampaign": "New Campaign",
        "reach": "Reach",
        "spend": "Spend",
        "statusCampaign": {
          "active": "Active",
          "scheduled": "Scheduled",
          "paused": "Paused"
        },
        "monthlyRevenue": "Monthly Revenue",
        "demographics": "Patient Demographics",
        "clinicInfo": "Clinic Information",
        "clinicName": "Clinic Name",
        "contactEmail": "Contact Email",
        "phone": "Phone Number",
        "adminAccount": "Admin Account",
        "fullName": "Full Name",
        "password": "Password",
        "saveChanges": "Save Changes",
        "newPost": "New Post",
        "statusPost": {
          "published": "Published",
          "draft": "Draft"
        },
        "portalTitle": "Admin Portal",
        "portalDesc": "Secure access to Avetisyan Beauty Clinic management",
        "username": "Username",
        "signIn": "Sign In",
        "instagramConnect": "Instagram Connect",
        "manageCarousel": "Manage Carousel Posts",
        "imageUrl": "Image URL",
        "postLink": "Post Link",
        "likes": "Likes",
        "comments": "Comments"
      },
      "specialists": {
        "badge": "Our Experts",
        "title": "Mastery in Aesthetic Architecture",
        "desc": "World-class medical professionals dedicated to precision, safety, and artistry.",
        "diplomas": "Diplomas",
        "certificates": "Certificates",
        "items": {
          "elena": {
            "name": "Dr. Elena Rostova",
            "role": "Chief Medical Director",
            "exp": "15+ Years",
            "spec": "Anti-Aging & SMAS Protocols"
          },
          "marcus": {
            "name": "Dr. Marcus Chen",
            "role": "Lead Aesthetic Surgeon",
            "exp": "12+ Years",
            "spec": "Body Contouring Expert"
          },
          "sarah": {
            "name": "Dr. Sarah Al-Fayed",
            "role": "Senior Dermatologist",
            "exp": "10+ Years",
            "spec": "Advanced Skin Rejuvenation"
          }
        }
      },
      "trust": {
        "badge": "Recognized by Global Leaders",
        "title": "Redefining the Standard of Premium Care",
        "desc": "Avetisyan Beauty Clinic integrates the world's most advanced aesthetic technologies with an uncompromising commitment to patient safety and bespoke architectural design, offering an experience that transcends traditional clinical environments.",
        "btn": "Explore The Clinic"
      },
      "footer": {
        "desc": "The pinnacle of non-invasive aesthetic medicine. Blending advanced technology with architectural elegance.",
        "treatments": "Treatments",
        "contact": "Contact",
        "address": "Yerevan, 18 Amiryan St.",
        "rights": "© 2027 Avetisyan Beauty Clinic. All rights reserved.",
        "privacy": "Privacy Policy",
        "terms": "Terms of Service"
      },
      "booking": {
        "title": "Book Appointment",
        "step": "Step {{current}} of {{total}}",
        "serviceTitle": "Select Service Category",
        "cats": {
          "face": "Facial Rejuvenation",
          "body": "Body Contouring",
          "inject": "Injectables",
          "skin": "Skin Texture & Tone"
        },
        "dateTimeTitle": "Select Date & Time",
        "calPlaceholder": "Interactive Calendar Placeholder",
        "availableTimes": "Available Times",
        "detailsTitle": "Your Details",
        "namePlace": "Full Name",
        "emailPlace": "Email Address",
        "phonePlace": "Phone Number",
        "confirmBtn": "Confirm Booking",
        "backBtn": "← Back",
        "success": "Booking confirmed!"
      },
      "ultraformer": {
        "badge": "Advanced Device",
        "title": "Ultraformer III",
        "desc": "The global leader in non-surgical SMAS lifting and body contouring. MMFU (Micro and Macro Focused Ultrasound) technology provides flawless results with zero downtime.",
        "bookBtn": "Book Procedure",
        "howItWorks": "How it works",
        "howDesc": "High-intensity ultrasound waves penetrate various layers of the skin, stimulating collagen renewal and providing a powerful lifting effect.",
        "benefits": "Benefits",
        "benefitsList": [
          "Fast and effective",
          "No pain or downtime",
          "Natural results",
          "Long-lasting effect"
        ],
        "3d": {
          "title": "Target Layers",
          "subtitle": "Hover over layers to explore • Drag to rotate",
          "epidermis": {
            "name": "Epidermis",
            "desc": "The outer layer of the skin. Ultraformer III bypasses this layer to avoid surface damage."
          },
          "dermis": {
            "name": "Dermis",
            "desc": "The middle layer containing collagen and elastin. Targeted for wrinkle reduction and skin tightening."
          },
          "smas": {
            "name": "SMAS Layer",
            "desc": "Superficial Muscular Aponeurotic System. The deep foundational layer lifted during surgical facelifts, now targeted non-invasively by Ultraformer III."
          },
          "viz": "Micro & Macro Focused Ultrasound Visualization"
        },
        "videoPlaceholder": "Video Placeholder"
      },
      "goldensun": {
        "badge": "Featured",
        "title": "Golden Sun",
        "desc": "Discover the radiant benefits of Golden Sun.",
        "bookBtn": "Book Golden Sun",
        "howItWorks": "About the Treatment",
        "howDesc": "The exclusive Golden Sun treatment provides a luxurious and radiant finish.",
        "benefits": "Benefits",
        "benefitsList": [
          "Radiant skin",
          "Deep hydration",
          "Even tone",
          "Immediate glow"
        ]
      }
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: "hy",
    fallbackLng: "en",
    interpolation: {
      escapeValue: false 
    }
  });

export default i18n;
