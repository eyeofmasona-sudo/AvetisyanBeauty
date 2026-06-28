import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  hy: {
    translation: {
      "seo": {
        "home": {
          "title": "Avetisyan Beauty Clinic | Ժամանակակից էսթետիկ խնամք Երևանում",
          "description": "Avetisyan Beauty Clinic-ում առաջարկում ենք ժամանակակից կոսմետոլոգիական և էսթետիկ ծառայություններ՝ առանց վիրահատության։ Մեր նպատակն է ընդգծել Ձեր բնական գեղեցկությունը և ապահովել անվտանգ, խնամված արդյունք։"
        },
        "ultraformer": {
          "title": "Ultraformer III | SMAS լիֆթինգ առանց վիրահատության | Avetisyan Beauty Clinic",
          "description": "Ultraformer III-ը ժամանակակից մեթոդ է մաշկի ձգման, դեմքի օվալի բարելավման և մարմնի որոշ հատվածների շտկման համար՝ առանց վիրահատական միջամտության։"
        },
        "gallery": {
          "title": "Առաջ և հետո արդյունքներ | Avetisyan Beauty Clinic",
          "description": "Տեսեք մեր այցելուների իրական արդյունքները տարբեր էսթետիկ և կոսմետոլոգիական ծառայություններից առաջ և հետո։"
        },
        "admin": {
          "title": "Ադմին պանել | Avetisyan Beauty Clinic",
          "description": "Կառավարեք կլինիկայի ծառայությունները, մասնագետներին, ամրագրումները, պատկերները և կայքի հիմնական տվյալները։"
        },
        "goldensun": {
          "title": "Golden Sun | Avetisyan Beauty Clinic",
          "description": "Golden Sun ծառայությունը նախատեսված է մաշկին խնամված, թարմ և գեղեցիկ երանգ հաղորդելու համար։"
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
        "badge": "Ժամանակակից էսթետիկ խնամք",
        "title": "Ultraformer III և Golden Sun ծառայություններ՝ բնական գեղեցկության համար",
        "highlight": "առանց վիրահատության",
        "desc": "Դեմքի երիտասարդացման, մաշկի ձգման և մարմնի խնամքի ժամանակակից լուծումներ՝ բնական, նուրբ և խնամված արդյունքի համար։",
        "bookBtn": "Գրանցվել Ultraformer III-ի համար",
        "consultBtn": "Գրանցվել Golden Sun-ի համար",
        "scroll": "Տեսնել ավելին"
      },
      "services": {
        "badge": "Մեր ծառայությունները",
        "title": "Ժամանակակից լուծումներ Ձեր գեղեցկության և ինքնավստահության համար",
        "desc": "Մենք ընտրում ենք անվտանգ և արդյունավետ մեթոդներ, որոնք օգնում են խնամել մաշկը, բարելավել դեմքի ու մարմնի տեսքը և պահպանել բնական արդյունքը։",
        "items": {
          "ultraformer": {
            "title": "Ultraformer III",
            "desc": "Ժամանակակից սարքային մեթոդ՝ դեմքի մաշկի ձգման, օվալի բարելավման և մարմնի որոշ հատվածների խնամքի համար։",
            "tag": "Առանց վիրահատության"
          },
          "smas": {
            "title": "SMAS լիֆթինգ",
            "desc": "Ուլտրաձայնային ալիքների միջոցով իրականացվող մաշկի ձգում, որը օգնում է դեմքին տալ ավելի թարմ և խնամված տեսք։",
            "tag": "Երիտասարդացում"
          },
          "body": {
            "title": "Մարմնի կոնտուրավորում",
            "desc": "Մարմնի որոշ հատվածների տեսքի բարելավում, մաշկի ձգում և ձևերի ավելի հստակ ընդգծում՝ անհատական մոտեցմամբ։",
            "tag": "Մարմնի խնամք"
          },
          "skin": {
            "title": "Մաշկի երիտասարդացում",
            "desc": "Խնամքի մեթոդներ, որոնք օգնում են թարմացնել մաշկի տեսքը, բարելավել երանգը և դարձնել այն ավելի հարթ ու առողջ տեսք ունեցող։",
            "tag": "Մաշկի խնամք"
          }
        }
      },
      "results": {
        "badge": "Տեսանելի արդյունքներ",
        "title": "Բնական և նկատելի փոփոխություն",
        "after": "ՀԵՏՈ",
        "before": "ԱՌԱՋ",
        "protocol": "SMAS լիֆթինգ",
        "patient": "Այցելու՝ 42 տ. / 1 սեանս",
        "btn": "Տեսնել արդյունքը",
        "viewGallery": "Տեսնել ամբողջ պատկերասրահը",
        "stats": {
          "satisfaction": "Այցելուների գոհունակություն",
          "procedures": "Կատարված ծառայություններ",
          "awards": "Մասնագիտական փորձ",
          "surgical": "Առանց վիրահատական միջամտության ծառայություններ"
        }
      },
      "gallery": {
        "title": "Առաջ և հետո",
        "desc": "Տեսեք մեր այցելուների տեսանելի արդյունքները ծառայություններից առաջ և հետո։",
        "filterAll": "Բոլորը",
        "placeholder": "Արդյունքները շուտով կավելացվեն"
      },
      "insta": {
        "follow_us": "Հետևեք մեզ Instagram-ում",
        "desc": "Հետևեք մեր էջին՝ նոր ծառայություններին, առաջարկներին, արդյունքներին և գեղեցկության խնամքի խորհուրդներին ծանոթանալու համար։"
      },
      "video": {
        "label": "Վիդեո պատկերասրահ",
        "title": "Դիտեք մեր ծառայությունները",
        "mute": "Անջատել ձայնը",
        "unmute": "Միացնել ձայնը"
      },
      "admin": {
        "title": "Ադմին պանել",
        "cases": "Դեպքեր",
        "addCase": "Ավելացնել նոր դեպք",
        "protocol": "Արձանագրություն",
        "patientDesc": "Այցելուի նկարագրություն",
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
        "underConstruction": "Այս բաժինը դեռ մշակման փուլում է։ Այստեղ կլինի պարզ և հարմար միջավայր՝ կլինիկայի տվյալները կառավարելու համար։",
        "recentBookings": "Վերջին ամրագրումները",
        "noBookings": "Առայժմ ամրագրումներ չկան",
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
        "monthlyRevenue": "Ամսական եկամուտ",
        "demographics": "Այցելուների տվյալներ",
        "clinicInfo": "Կլինիկայի տվյալներ",
        "clinicName": "Կլինիկայի անվանում",
        "contactEmail": "Էլ․ հասցե",
        "phone": "Հեռախոսահամար",
        "adminAccount": "Ադմինի հաշիվ",
        "fullName": "Անուն և ազգանուն",
        "password": "Գաղտնաբառ",
        "saveChanges": "Պահպանել փոփոխությունները",
        "newPost": "Նոր հոդված",
        "statusPost": {
          "published": "Հրապարակված",
          "draft": "Սևագիր"
        },
        "portalTitle": "Ադմին մուտք",
        "portalDesc": "Անվտանգ մուտք Avetisyan Beauty Clinic-ի կառավարման բաժին",
        "username": "Օգտանուն",
        "signIn": "Մուտք գործել",
        "instagramConnect": "Instagram-ի միացում",
        "manageCarousel": "Կառավարել կարուսելի հրապարակումները",
        "imageUrl": "Նկարի հղում՝ URL",
        "postLink": "Հրապարակման հղում՝ URL",
        "likes": "Հավանումներ",
        "comments": "Մեկնաբանություններ"
      },
      "specialists": {
        "badge": "Մեր մասնագետները",
        "title": "Վստահելի մասնագետներ՝ անհատական մոտեցմամբ",
        "desc": "Մեր թիմը կարևորում է անվտանգությունը, ուշադիր մոտեցումը և բնական արդյունքը։ Յուրաքանչյուր այցելու ստանում է անհատական խորհրդատվություն և իրեն համապատասխան խնամքի պլան։",
        "diplomas": "Դիպլոմներ",
        "certificates": "Վկայականներ",
        "items": {
          "elena": {
            "name": "Անուն Ազգանուն",
            "role": "Գլխավոր մասնագետ",
            "exp": "—",
            "spec": "Դեմքի խնամք և երիտասարդացում"
          },
          "marcus": {
            "name": "Անուն Ազգանուն",
            "role": "Էսթետիկ կոսմետոլոգ",
            "exp": "—",
            "spec": "Մարմնի խնամք և սարքային մեթոդներ"
          },
          "sarah": {
            "name": "Անուն Ազգանուն",
            "role": "Մաշկի խնամքի մասնագետ",
            "exp": "—",
            "spec": "Մաշկի որակ, երանգ և խնամք"
          }
        }
      },
      "trust": {
        "badge": "Վստահություն և որակ",
        "title": "Խնամք, որտեղ կարևոր է յուրաքանչյուր մանրուք",
        "desc": "Avetisyan Beauty Clinic-ում համադրում ենք ժամանակակից տեխնոլոգիաները, մասնագիտական մոտեցումը և հարմարավետ միջավայրը։ Մեզ համար կարևոր է, որ յուրաքանչյուր այցելու իրեն զգա վստահ, տեղեկացված և խնամված։",
        "btn": "Բացահայտել կլինիկան"
      },
      "footer": {
        "desc": "Ժամանակակից էսթետիկ խնամք՝ առանց վիրահատության։ Անվտանգ մեթոդներ, անհատական մոտեցում և բնական արդյունք։",
        "treatments": "Ծառայություններ",
        "contact": "Կապ",
        "address": "ք. Երևան, Ամիրյան 18",
        "rights": "© 2026 Avetisyan Beauty Clinic. Բոլոր իրավունքները պաշտպանված են։",
        "privacy": "Գաղտնիության քաղաքականություն",
        "terms": "Ծառայությունների պայմաններ"
      },
      "booking": {
        "title": "Գրանցվել խորհրդատվության",
        "step": "Քայլ {{current}} / {{total}}",
        "serviceTitle": "Ընտրեք ծառայության ուղղությունը",
        "cats": {
          "face": "Դեմքի երիտասարդացում",
          "body": "Մարմնի խնամք",
          "inject": "Ներարկումային ծառայություններ",
          "skin": "Մաշկի որակ և երանգ"
        },
        "dateTimeTitle": "Ընտրեք հարմար օրն ու ժամը",
        "calPlaceholder": "Օրացույց",
        "availableTimes": "Հասանելի ժամեր",
        "detailsTitle": "Լրացրեք Ձեր տվյալները",
        "namePlace": "Անուն և ազգանուն",
        "emailPlace": "Էլ․ հասցե",
        "phonePlace": "Հեռախոսահամար",
        "confirmBtn": "Հաստատել գրանցումը",
        "backBtn": "← Հետ",
        "success": "Ձեր գրանցման հայտը պատրաստ է ուղարկման։"
      },
      "ultraformer": {
        "badge": "Սարքային կոսմետոլոգիա",
        "title": "Ultraformer III",
        "desc": "Ultraformer III-ը ոչ վիրահատական մեթոդ է, որն օգնում է ձգել մաշկը, բարելավել դեմքի օվալը և խնամել մարմնի որոշ հատվածներ։ Այն աշխատում է ուլտրաձայնային ալիքների միջոցով և նպաստում է մաշկի ավելի թարմ ու խնամված տեսքին։",
        "bookBtn": "Գրանցվել ծառայության համար",
        "howItWorks": "Ինչպես է աշխատում",
        "howDesc": "Ուլտրաձայնային ալիքները հասնում են մաշկի տարբեր շերտերին և խթանում կոլագենի բնական արտադրությունը։ Արդյունքում մաշկը կարող է դառնալ ավելի ձիգ, հարթ և թարմ տեսք ունեցող։",
        "benefits": "Առավելություններ",
        "benefitsList": [
          "Առանց վիրահատության",
          "Առանց երկար վերականգնման շրջանի",
          "Բնական տեսք ունեցող արդյունք",
          "Անհատական մոտեցում յուրաքանչյուր այցելուի համար"
        ],
        "3d": {
          "title": "Մաշկի շերտերը",
          "subtitle": "Մոտեցրեք մկնիկը շերտերին՝ ավելին իմանալու համար • Քաշեք՝ պտտելու համար",
          "epidermis": {
            "name": "Էպիդերմիս",
            "desc": "Մաշկի արտաքին շերտն է։ Ultraformer III-ը աշխատում է այնպես, որ մակերեսային շերտը հնարավորինս պաշտպանված մնա։"
          },
          "dermis": {
            "name": "Դերմա",
            "desc": "Մաշկի միջին շերտն է, որտեղ գտնվում են կոլագենն ու էլաստինը։ Այս շերտի խնամքը օգնում է մաշկին ունենալ ավելի հարթ և ձիգ տեսք։"
          },
          "smas": {
            "name": "SMAS շերտ",
            "desc": "Ավելի խորը շերտ է, որը կարևոր դեր ունի դեմքի ձևի և ձգվածության համար։ Ultraformer III-ը թույլ է տալիս աշխատել այս հատվածի հետ առանց վիրահատության։"
          },
          "viz": "Կենտրոնացված ուլտրաձայնային ալիքների աշխատանքը"
        },
        "videoPlaceholder": "Վիդեո՝ շուտով"
      },
      "goldensun": {
        "badge": "Հատուկ ծառայություն",
        "title": "Golden Sun",
        "desc": "Golden Sun ծառայությունը նախատեսված է մաշկին խնամված, թարմ և գեղեցիկ երանգ հաղորդելու համար։ Այն կարող է լինել լավ ընտրություն, եթե ցանկանում եք ունենալ ավելի պայծառ և առողջ տեսք ունեցող մաշկ։",
        "bookBtn": "Գրանցվել Golden Sun-ի համար",
        "howItWorks": "Ծառայության մասին",
        "howDesc": "Golden Sun-ը օգնում է մաշկին ստանալ ավելի գեղեցիկ երանգ և խնամված տեսք։ Ծառայության մանրամասները, տևողությունը և հակացուցումները խորհուրդ է տրվում ներկայացնել խորհրդատվության ընթացքում՝ ըստ այցելուի մաշկի տեսակի և ցանկալի արդյունքի։",
        "benefits": "Առավելություններ",
        "benefitsList": [
          "Թարմ և խնամված տեսք",
          "Գեղեցիկ երանգ",
          "Մաշկի ավելի պայծառ տեսք",
          "Հարմար տարբերակ հատուկ առիթներից առաջ"
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
      "video": {
        "label": "Видеогалерея",
        "title": "Посмотрите наши процедуры",
        "mute": "Выключить звук",
        "unmute": "Включить звук"
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
        "underConstruction": "Этот раздел находится в разработке. Здесь будет легкий и элегантный интерфейс для управления данными клиники.",
        "recentBookings": "Последние заявки",
        "noBookings": "Заявок пока нет",
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
        "rights": "© 2026 Avetisyan Beauty Clinic. Все права защищены.",
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
      "video": {
        "label": "Video Gallery",
        "title": "Watch Our Treatments",
        "mute": "Mute",
        "unmute": "Unmute"
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
        "underConstruction": "This section is currently under construction. It will feature a light, elegant interface for managing your clinic's data without the complexity of a full CRM.",
        "recentBookings": "Recent Bookings",
        "noBookings": "No bookings yet",
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
        "rights": "© 2026 Avetisyan Beauty Clinic. All rights reserved.",
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
