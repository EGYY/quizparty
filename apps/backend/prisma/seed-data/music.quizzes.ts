import type { SeedQuiz } from './types';

export const musicQuizzes: SeedQuiz[] = [
  // ── 9. Пой, если знаешь — EASY ───────────────────────────────────────────────
  {
    title: 'Пой, если знаешь',
    description: 'Хиты, которые знают все — даже те, кто "не слушает музыку".',
    category: 'MUSIC',
    difficulty: 'EASY',
    coverUrl: '/assets/covers/music.svg',
    squareCoverUrl: '/assets/covers/square/music.svg',
    themeColor: '#ff7ac8',
    recommendedPlayersMin: 2,
    recommendedPlayersMax: 10,
    estimatedMinutes: 9,
    tags: ['музыка', 'хиты', 'вечеринка'],
    questions: [
      {
        order: 0,
        questionText: 'Кто исполняет "Bohemian Rhapsody"?',
        options: ['The Beatles', 'Queen', 'Led Zeppelin', 'David Bowie'],
        correctIndex: 1,
        explanation: '"Bohemian Rhapsody" — Queen, 1975. Фредди Меркьюри написал песню целиком.',
      },
      {
        order: 1,
        questionText: 'Как называется дебютный альбом Майкла Джексона как сольного исполнителя?',
        options: ['Thriller', 'Off the Wall', 'Bad', 'Dangerous'],
        correctIndex: 1,
        explanation:
          '"Off the Wall" (1979) — первый сольный альбом МДж. "Thriller" — второй и самый продаваемый.',
      },
      {
        order: 2,
        questionText: 'Определи лишнее: все они — бойз-бэнды 90-х, кроме одного.',
        options: ['Backstreet Boys', 'NSYNC', 'Take That', 'Radiohead'],
        correctIndex: 3,
        explanation:
          'Radiohead — альтернативный рок. Остальные — классические бойз-бэнды девяностых.',
      },
      {
        order: 3,
        questionText: 'Из какого города родом группа The Beatles?',
        options: ['Лондон', 'Манчестер', 'Бирмингем', 'Ливерпуль'],
        correctIndex: 3,
        explanation:
          'Ливерпуль — родина The Beatles. Там до сих пор есть клуб The Cavern, где они играли.',
        revealMediaPrompt: 'Культовый пешеходный переход Эбби-роуд с четырьмя силуэтами.',
      },
      {
        order: 4,
        questionText: 'Какой исполнитель выпустил альбом "21"?',
        options: ['Beyoncé', 'Rihanna', 'Adele', 'Amy Winehouse'],
        correctIndex: 2,
        explanation:
          '"21" — второй студийный альбом Adele (2011). Один из самых продаваемых в XXI веке.',
      },
      {
        order: 5,
        questionText:
          'Как называется знаменитый клуб в Нью-Йорке, где выступали Джими Хендрикс, Дженис Джоплин и Doors?',
        options: ['CBGB', 'Fillmore East', 'Madison Square Garden', 'Carnegie Hall'],
        correctIndex: 1,
        explanation:
          'Fillmore East — легендарная концертная площадка конца 60-х. CBGB — место рождения панка.',
      },
      {
        order: 6,
        questionText: 'Сколько участников в группе BTS?',
        options: ['5', '6', '7', '9'],
        correctIndex: 2,
        explanation: 'BTS — семь участников: RM, Jin, Suga, J-Hope, Jimin, V, Jungkook.',
      },
      {
        order: 7,
        questionText:
          'Какой трек Дрейка стал первым в истории, набравшим 1 миллиард стримов на Spotify?',
        options: ['Hotline Bling', "God's Plan", 'One Dance', 'In My Feelings'],
        correctIndex: 2,
        explanation: '"One Dance" (2016) первым среди всех треков достиг 1 миллиарда на Spotify.',
      },
      {
        order: 8,
        questionText: 'Как зовут вокалиста группы Coldplay?',
        options: ['Тим Бёртон', 'Крис Мартин', 'Гай Берримэн', 'Джонни Баклэнд'],
        correctIndex: 1,
        explanation: 'Крис Мартин — вокалист и пианист Coldplay. Гай и Джонни — бас и гитара.',
      },
      {
        order: 9,
        questionText: 'Какой год считается "годом рождения" рок-н-ролла как массового явления?',
        options: ['1948', '1951', '1955', '1962'],
        correctIndex: 2,
        explanation:
          '1955 — год выхода "Rock Around the Clock" Билла Хейли и успеха Элвиса Пресли.',
      },
      {
        order: 10,
        questionText:
          'Угадай исполнителя по описанию: певица в образе Lady — сценический псевдоним с животным в названии.',
        options: ['Lady Gaga', 'Katy Perry', 'Nicki Minaj', 'Cardi B'],
        correctIndex: 0,
        explanation:
          'Lady Gaga — Стефани Джерманотта. Её псевдоним вдохновлён треком Queen "Radio Ga Ga".',
      },
      {
        order: 11,
        questionText: 'Какая из этих групп никогда официально не распадалась?',
        options: ['The Beatles', 'Led Zeppelin', 'ABBA', 'Oasis'],
        correctIndex: 2,
        explanation:
          'ABBA никогда официально не объявляли о распаде. В 2021 они даже выпустили новый альбом "Voyage".',
      },
    ],
  },

  // ── 10. Плейлист вечеринки — MEDIUM ─────────────────────────────────────────
  {
    title: 'Плейлист вечеринки',
    description: 'Хиты десятилетий, жанры, факты. Для тех, кто спорит о музыке на кухне.',
    category: 'MUSIC',
    difficulty: 'MEDIUM',
    coverUrl: '/assets/covers/music.svg',
    squareCoverUrl: '/assets/covers/square/music.svg',
    themeColor: '#e91e8c',
    recommendedPlayersMin: 2,
    recommendedPlayersMax: 10,
    estimatedMinutes: 11,
    tags: ['музыка', 'хиты', 'жанры', 'вечеринка'],
    questions: [
      {
        order: 0,
        questionText: 'Какой альбом Нирваны сделал гранж мейнстримом?',
        options: ['Bleach', 'Nevermind', 'In Utero', 'MTV Unplugged in New York'],
        correctIndex: 1,
        explanation:
          '"Nevermind" (1991) с синглом "Smells Like Teen Spirit" изменил всю музыкальную индустрию.',
      },
      {
        order: 1,
        questionText: 'Кто придумал термин "грамофон"?',
        options: ['Томас Эдисон', 'Эмиль Берлинер', 'Александр Белл', 'Никола Тесла'],
        correctIndex: 1,
        explanation: 'Эмиль Берлинер изобрёл граммофон в 1887 году и создал формат диска.',
      },
      {
        order: 2,
        questionText:
          'В каком году состоялся легендарный концерт Live Aid, собравший почти всех рок-звёзд?',
        options: ['1981', '1983', '1985', '1987'],
        correctIndex: 2,
        explanation:
          'Live Aid — 13 июля 1985, Уэмбли + Филадельфия. Выступление Queen вошло в историю.',
        mediaPrompt:
          'Огромная сцена на стадионе Уэмбли, море людей перед ней, ретро-атмосфера 80-х.',
      },
      {
        order: 3,
        questionText: 'Что такое "фичеринг" в современной музыке?',
        options: [
          'Совместный трек двух исполнителей',
          'Ремикс старой песни',
          'Инструментальная версия альбома',
          'Концертная запись',
        ],
        correctIndex: 0,
        explanation:
          'Фичеринг (feat.) — приглашённый исполнитель, участвующий в треке другого артиста.',
      },
      {
        order: 4,
        questionText: 'Какой жанр породил хип-хоп как культурное явление?',
        options: ['Джаз', 'Регги', 'Фанк и соул', 'Диско'],
        correctIndex: 2,
        explanation: 'Хип-хоп вырос из фанка, соула и диско через DJ-культуру Бронкса в 1970-х.',
      },
      {
        order: 5,
        questionText: 'Определи лишнее: все это альбомы одного исполнителя, кроме одного.',
        options: ['Abbey Road', 'Revolver', 'Dark Side of the Moon', "Sgt. Pepper's"],
        correctIndex: 2,
        explanation: '"Dark Side of the Moon" — Pink Floyd. Остальные — The Beatles.',
      },
      {
        order: 6,
        questionText:
          'Как называется техника вокала, когда певец переключается между грудным голосом и фальцетом?',
        options: ['Вибрато', 'Фальцет', 'Йодль', 'Мелизма'],
        correctIndex: 2,
        explanation:
          'Йодль — техника быстрого переключения регистров. Характерна для альпийской музыки и некоторых R&B.',
      },
      {
        order: 7,
        questionText: 'Кто является рекордсменом по числу Grammy за всю историю премии?',
        options: ['Beyoncé', 'Jay-Z', 'Paul McCartney', 'Georg Solti'],
        correctIndex: 0,
        explanation: 'Beyoncé — абсолютный рекордсмен. 32 Grammy к 2024 году.',
      },
      {
        order: 8,
        questionText: 'В каком городе родился джаз как музыкальный жанр?',
        options: ['Нью-Йорк', 'Чикаго', 'Новый Орлеан', 'Канзас-Сити'],
        correctIndex: 2,
        explanation: 'Новый Орлеан — колыбель джаза. Сплав блюза, регтайма и духовых традиций.',
      },
      {
        order: 9,
        questionText: 'Какая из этих групп образовалась позже всех?',
        options: ['Red Hot Chili Peppers', 'Radiohead', 'Arctic Monkeys', 'Muse'],
        correctIndex: 2,
        explanation:
          'Arctic Monkeys основаны в 2002 году. RHCP — 1983, Muse — 1994, Radiohead — 1985.',
      },
      {
        order: 10,
        questionText:
          'Как называется метод записи музыки, при котором каждый инструмент пишется отдельно на отдельную дорожку?',
        options: ['Мастеринг', 'Многодорожечная запись', 'Живая запись', 'Аудиофазинг'],
        correctIndex: 1,
        explanation:
          'Многодорожечная запись (multitrack recording) — изобретение, изменившее студийную музыку в 1950-х.',
      },
      {
        order: 11,
        questionText: 'У Дэвида Боуи был гетерохромия. Что это?',
        options: [
          'Родимое пятно',
          'Разный цвет глаз',
          'Способность к вокалу в нескольких регистрах',
          'Редкое дыхательное заболевание',
        ],
        correctIndex: 1,
        explanation:
          'Разные цвета глаз. У Боуи один глаз был голубым, другой казался тёмным из-за травмы — расширенный зрачок.',
      },
    ],
  },

  // ── 11. Музыкальный бардак — HARD ────────────────────────────────────────────
  {
    title: 'Музыкальный бардак',
    description: 'Для тех, кто слушает не попсу и помнит, кто открывал концерт.',
    category: 'MUSIC',
    difficulty: 'HARD',
    coverUrl: '/assets/covers/music.svg',
    squareCoverUrl: '/assets/covers/square/music.svg',
    themeColor: '#9c27b0',
    recommendedPlayersMin: 2,
    recommendedPlayersMax: 8,
    estimatedMinutes: 14,
    tags: ['музыка', 'рок', 'история-музыки', 'душнила'],
    questions: [
      {
        order: 0,
        questionText: 'Какой альбом считается первым концепт-альбомом в рок-музыке?',
        options: [
          "Sgt. Pepper's (The Beatles)",
          'Pet Sounds (Beach Boys)',
          'In the Court of the Crimson King (King Crimson)',
          'Tommy (The Who)',
        ],
        correctIndex: 3,
        explanation:
          '"Tommy" The Who (1969) — первая рок-опера, рассказывающая единую историю через весь альбом.',
      },
      {
        order: 1,
        questionText: 'Что означает термин "пентатоника"?',
        options: ['Гамма из 5 нот', 'Аккорд из 5 звуков', 'Метр с 5 долями', 'Строй из 5 струн'],
        correctIndex: 0,
        explanation:
          'Пентатоника — гамма из 5 нот на октаву. Основа блюза, джаза, рока и много чего ещё.',
      },
      {
        order: 2,
        questionText: 'Кто из этих музыкантов НЕ входил в "Клуб 27"?',
        options: ['Курт Кобейн', 'Джими Хендрикс', 'Фредди Меркьюри', 'Эми Уайнхаус'],
        correctIndex: 2,
        explanation:
          'Фредди Меркьюри умер в 45 лет от СПИДа в 1991. Клуб 27 — артисты, умершие в 27.',
      },
      {
        order: 3,
        questionText: 'Какую группу основал Брайан Ино до того, как стал продюсером-авангардистом?',
        options: ['Eno', 'Roxy Music', 'Talking Heads', 'Cluster'],
        correctIndex: 1,
        explanation:
          'Брайан Ино — сооснователь Roxy Music (начало 70-х). Потом продюсировал Bowie, U2, Talking Heads.',
      },
      {
        order: 4,
        questionText:
          'Как называется техника в электронной музыке, когда сэмпл чужой записи используется как основа трека?',
        options: ['Мэшап', 'Sampling', 'Beatboxing', 'Layering'],
        correctIndex: 1,
        explanation:
          'Сэмплирование (sampling) — использование фрагментов чужих записей. Основа хип-хопа и многих жанров.',
      },
      {
        order: 5,
        questionText: 'Какой лейбл выпускал большинство ранних альбомов The Rolling Stones в США?',
        options: ['Columbia', 'London Records', 'Decca', 'Atlantic'],
        correctIndex: 1,
        explanation:
          'London Records — американский лейбл для Decca. У Stones был конфликт с Decca, поэтому они основали свой лейбл.',
      },
      {
        order: 6,
        questionText: 'Определи связь: Massive Attack, Portishead, Tricky — что их объединяет?',
        options: [
          'Все из Бристоля и основали трип-хоп',
          'Все из Манчестера и мэдчестерской сцены',
          'Все выступали на Гластонбери 1994',
          'Все подписаны на один лейбл',
        ],
        correctIndex: 0,
        explanation:
          'Все трое — из Бристоля и являются отцами-основателями трип-хопа в начале 90-х.',
      },
      {
        order: 7,
        questionText: 'Какой музыкальный размер является нестандартным в треке "Money" Pink Floyd?',
        options: ['5/4', '7/4', '7/8', '11/8'],
        correctIndex: 1,
        explanation:
          '"Money" идёт в размере 7/4 — нетипично для рок-музыки. Кассу открывают ровно 7 долей.',
      },
      {
        order: 8,
        questionText:
          'Как называется легендарный берлинский клуб, считающийся собором техно-культуры?',
        options: ['Fabric', 'Tresor', 'Berghain', 'Rex Club'],
        correctIndex: 2,
        explanation:
          'Berghain — бывшая котельная в Берлине. Попасть туда сложнее, чем в некоторые VIP-клубы Москвы.',
        mediaPrompt: 'Массивное здание из тёмного бетона, длинная очередь снаружи ночью.',
      },
      {
        order: 9,
        questionText: 'Что такое "вувузела" в контексте музыки и спорта?',
        options: [
          'Перкуссионный инструмент из Бразилии',
          'Пластиковый рожок с Чемпионата мира по футболу 2010',
          'Стиль африканской музыки',
          'Электронный звук в техно',
        ],
        correctIndex: 1,
        explanation: 'Вувузела — пластиковый рожок, сводивший всех с ума на ЧМ-2010 в ЮАР.',
      },
      {
        order: 10,
        questionText:
          'Кто придумал концепт "четырёх на полу" (four-on-the-floor) как основу диско и электронной музыки?',
        options: ['Giorgio Moroder', 'Frankie Knuckles', 'Larry Levan', 'DJ Kool Herc'],
        correctIndex: 0,
        explanation:
          'Джорджо Мородер — продюсер Донны Саммер, один из отцов диско и электронной танцевальной музыки.',
      },
      {
        order: 11,
        questionText:
          'Какой альбом Radiohead считается переломным переходом от гитарного рока к электронике?',
        options: ['The Bends', 'OK Computer', 'Kid A', 'Amnesiac'],
        correctIndex: 2,
        explanation:
          '"Kid A" (2000) — радикальный разрыв с роком. Многие фанаты были в шоке, сейчас это шедевр.',
      },
    ],
  },

  // ── 12. Саундтреки, которые засели в голове — MEDIUM ────────────────────────
  {
    title: 'Саундтреки, которые засели в голове',
    description: 'Музыка из фильмов, игр и сериалов. Ты точно их слышал.',
    category: 'MUSIC',
    difficulty: 'MEDIUM',
    coverUrl: '/assets/covers/music.svg',
    squareCoverUrl: '/assets/covers/square/music.svg',
    themeColor: '#f06292',
    recommendedPlayersMin: 2,
    recommendedPlayersMax: 10,
    estimatedMinutes: 11,
    tags: ['музыка', 'саундтреки', 'кино', 'игры'],
    questions: [
      {
        order: 0,
        questionText: 'Кто написал музыку к "Звёздным войнам"?',
        options: ['Ханс Циммер', 'Джон Уильямс', 'Говард Шор', 'Эннио Морриконе'],
        correctIndex: 1,
        explanation: 'Джон Уильямс — автор практически всей великой музыки Спилберга и Лукаса.',
      },
      {
        order: 1,
        questionText: 'Какой саундтрек из игры стал первым, выигравшим Grammy?',
        options: ['Journey', 'Minecraft', 'The Last of Us', 'Journey to the Savage Planet'],
        correctIndex: 0,
        explanation:
          'Austin Wintory за саундтрек к Journey (2013) — первая Grammy-номинация в истории видеоигровой музыки.',
      },
      {
        order: 2,
        questionText: 'Кто написал культовый саундтрек к "Властелину колец"?',
        options: ['Говард Шор', 'Ханс Циммер', 'Джон Уильямс', 'Джеймс Ньютон Ховард'],
        correctIndex: 0,
        explanation: 'Говард Шор написал трилогию саундтреков — более 12 часов музыки. Три Grammy.',
      },
      {
        order: 3,
        questionText: 'Из какого фильма знаменитая тема "My Heart Will Go On"?',
        options: ['Призрак оперы', 'Ромео и Джульетта', 'Титаник', 'Лебединое озеро'],
        correctIndex: 2,
        explanation:
          '"My Heart Will Go On" — Селин Дион, саундтрек к "Титанику" (1997). Джеймс Хорнер.',
      },
      {
        order: 4,
        questionText: 'Кто написал музыку к большинству фильмов Marvel (MCU)?',
        options: ['Брайан Тайлер', 'Алан Сильвестри', 'Ханс Циммер', 'Генри Джекман'],
        correctIndex: 1,
        explanation:
          'Алан Сильвестри написал темы "Мстителей" и "Первого Мстителя". Другие тоже участвовали.',
        mediaPrompt: 'Симфонический оркестр в студии звукозаписи, экран с кадрами фильма.',
      },
      {
        order: 5,
        questionText:
          'Определи лишнее: всё это саундтреки, которые продавались как отдельные альбомы-хиты, кроме одного.',
        options: ['Grease', 'Saturday Night Fever', 'The Dark Knight', 'Purple Rain'],
        correctIndex: 2,
        explanation:
          '"The Dark Knight" — великий саундтрек Ханса Циммера, но в хит-парады он не попал. Остальные продавались миллионами.',
      },
      {
        order: 6,
        questionText:
          'Как называется техника в кино, когда музыка буквально совпадает с действием на экране?',
        options: ['Лейтмотив', 'Мики-маусинг', 'Диегетическая музыка', 'Остинато'],
        correctIndex: 1,
        explanation:
          'Мики-маусинг — музыка точно следует каждому движению персонажа, как в мультфильмах Disney.',
      },
      {
        order: 7,
        questionText: 'Кто автор знаменитой темы из сериала "Игра престолов"?',
        options: ['Ханс Циммер', 'Рэмин Джавади', 'Трент Резнор', 'Марко Белтрами'],
        correctIndex: 1,
        explanation: 'Рэмин Джавади — иранско-немецкий композитор, написавший все 8 сезонов GoT.',
      },
      {
        order: 8,
        questionText: 'Из какой видеоигры знаменитая мелодия "Still Alive"?',
        options: ['Half-Life 2', 'Portal', 'Bioshock', "Mirror's Edge"],
        correctIndex: 1,
        explanation:
          '"Still Alive" — финальная песня Portal (2007), написанная Джонатаном Коултоном.',
      },
      {
        order: 9,
        questionText: 'Что такое "диегетическая музыка" в кино?',
        options: [
          'Музыка, написанная специально для фильма',
          'Музыка, которую слышат сами персонажи',
          'Музыка без слов',
          'Живая запись оркестра',
        ],
        correctIndex: 1,
        explanation:
          'Диегетическая — музыка внутри мира фильма: радио, концерт, телефон персонажа.',
      },
      {
        order: 10,
        questionText: 'Кто написал тему Бэтмена для серии фильмов Тима Бёртона?',
        options: ['Ханс Циммер', 'Дэнни Эльфман', 'Джеймс Ньютон Ховард', 'Майкл Кейман'],
        correctIndex: 1,
        explanation:
          'Дэнни Эльфман — постоянный коллаборатор Тима Бёртона. Бэтмен 1989, Эдвард Руки-ножницы.',
      },
      {
        order: 11,
        questionText:
          'В каком году на церемонию "Оскар" была добавлена категория "Лучший оригинальный саундтрек"?',
        options: ['1934', '1945', '1959', '1972'],
        correctIndex: 0,
        explanation: 'Категория существует с 1934 года — одна из старейших на церемонии.',
      },
    ],
  },
];
