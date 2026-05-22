import type { SeedQuiz } from './types';

export const musicQuizzes: SeedQuiz[] = [
  // ── 9. Советские и российские хиты — EASY ────────────────────────────────────
  {
    title: 'Советские и российские хиты',
    description: 'Песни, которые знает компания от 15 до 70. Попробуй не вспомнить.',
    category: 'MUSIC',
    difficulty: 'EASY',
    coverUrl: '/assets/covers/music.svg',
    squareCoverUrl: '/assets/covers/square/music.svg',
    themeColor: '#f44336',
    recommendedPlayersMin: 2,
    recommendedPlayersMax: 10,
    estimatedMinutes: 9,
    tags: ['музыка', 'советское', 'россия', 'хиты', 'вечеринка'],
    questions: [
      {
        order: 0,
        questionText: 'Кто поёт "Миллион алых роз"?',
        options: ['Анна Герман', 'Алла Пугачёва', 'София Ротару', 'Эдита Пьеха'],
        correctIndex: 1,
        explanation:
          '"Миллион алых роз" — хит Аллы Пугачёвой 1982 года. Слова Андрея Вознесенского, музыка Раймонда Паулса.',
      },
      {
        order: 1,
        questionText: 'Какая группа записала "Группу крови"?',
        options: ['ДДТ', 'Аквариум', 'Кино', 'Алиса'],
        correctIndex: 2,
        explanation:
          '"Группа крови" — Кино, Виктор Цой, 1988. Один из главных рок-гимнов советской эпохи.',
      },
      {
        order: 2,
        questionText: 'Как зовут вокалиста группы "Кино"?',
        options: ['Юрий Шевчук', 'Борис Гребенщиков', 'Виктор Цой', 'Константин Кинчев'],
        correctIndex: 2,
        explanation:
          'Виктор Цой — основатель и голос группы "Кино". Его стена на Арбате до сих пор место паломничества.',
      },
      {
        order: 3,
        questionText: 'Какая группа исполняла "Белые розы"?',
        options: ['Мираж', 'На-На', 'Ласковый май', 'Комбинация'],
        correctIndex: 2,
        explanation:
          '"Белые розы" — Ласковый май, конец 80-х. Хит подростковой любви целого поколения.',
      },
      {
        order: 4,
        questionText: 'В какой группе пел Юрий Шевчук?',
        options: ['Наутилус Помпилиус', 'Кино', 'ДДТ', 'Машина времени'],
        correctIndex: 2,
        explanation:
          'ДДТ — группа Юрия Шевчука с 1980 года. "Это всё, что останется после меня" — один из главных хитов.',
      },
      {
        order: 5,
        questionText: 'Как звали певицу, которую называли "Примадонной" российской эстрады?',
        options: ['Лариса Долина', 'Валерия', 'Алла Пугачёва', 'Кристина Орбакайте'],
        correctIndex: 2,
        explanation:
          'Алла Пугачёва — "Примадонна". Карьера длиной более 50 лет, сотни хитов, легенда сцены.',
      },
      {
        order: 6,
        questionText: 'В каком жанре работал Владимир Высоцкий?',
        options: ['Джаз', 'Авторская песня (бард)', 'Классический романс', 'Тяжёлый рок'],
        correctIndex: 1,
        explanation:
          'Высоцкий — бард и актёр. Хриплый голос, гитара, песни о войне, спорте и любви. Театр на Таганке.',
      },
      {
        order: 7,
        questionText: 'Как называется группа Бориса Гребенщикова?',
        options: ['ДДТ', 'Кино', 'Аквариум', 'Браво'],
        correctIndex: 2,
        explanation:
          'Аквариум — Борис Гребенщиков. Один из первых советских рок-коллективов, с 1972 года.',
      },
      {
        order: 8,
        questionText:
          'Какая российская группа прославилась на Западе с хитом "All the Things She Said"?',
        options: ['ВИА Гра', 'Тату', 'Земфира', 'Serebro'],
        correctIndex: 1,
        explanation:
          '"All the Things She Said" — международное название "Нас не догонят" группы "Тату". Первая российская группа в топах чартов многих стран.',
      },
      {
        order: 9,
        questionText:
          'Какая советская песня начинается словами "Пусть бегут неуклюже пешеходы по лужам..."?',
        options: ['Голубой вагон', 'Кабы не было зимы', 'Антошка', 'Песня Крокодила Гены'],
        correctIndex: 3,
        explanation:
          'Крокодил Гена поёт эту песню в мультфильме "Крокодил Гена и Чебурашка". Музыка Владимира Шаинского.',
      },
      {
        order: 10,
        questionText: 'Как называется группа, исполнявшая "Скованные одной цепью"?',
        options: ['Кино', 'Алиса', 'Наутилус Помпилиус', 'ДДТ'],
        correctIndex: 2,
        explanation:
          '"Скованные одной цепью" — Наутилус Помпилиус, Вячеслав Бутусов. Один из главных рок-гимнов перестройки.',
      },
      {
        order: 11,
        questionText: 'Какой российский певец выиграл "Евровидение" с песней "Believe"?',
        options: ['Сергей Лазарев', 'Николай Басков', 'Дима Билан', 'Филипп Киркоров'],
        correctIndex: 2,
        explanation:
          'Дима Билан победил на Евровидении-2008 в Белграде. Первая победа России после долгого перерыва.',
      },
    ],
  },

  // ── 10. Пой, если знаешь — EASY ──────────────────────────────────────────────
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
        questionText:
          'Как называется альбом Майкла Джексона, ставший самым продаваемым в истории музыки?',
        options: ['Dangerous', 'Bad', 'Thriller', 'Off the Wall'],
        correctIndex: 2,
        explanation:
          '"Thriller" — более 70 миллионов копий. Одноимённый клип с зомби изменил правила игры в мире видеоклипов.',
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
          'Как называется фирменный танцевальный приём Майкла Джексона — движение назад?',
        options: ['Брейкданс', 'Лунная походка', 'Зомби-шаг', 'Попинг'],
        correctIndex: 1,
        explanation:
          'Лунная походка (moonwalk) — МДж впервые показал её на шоу Motown 25 в 1983 году. С тех пор это его визитная карточка.',
      },
      {
        order: 6,
        questionText: 'Как называется фанатская армия K-pop группы BTS?',
        options: ['Swifties', 'Beehive', 'ARMY', 'Directioners'],
        correctIndex: 2,
        explanation:
          'Фандом BTS — ARMY. Swifties — Taylor Swift, Beehive — Beyoncé, Directioners — One Direction.',
      },
      {
        order: 7,
        questionText: 'С кем у Дрейка был самый громкий рэп-конфликт 2024 года?',
        options: ['Lil Wayne', 'Kendrick Lamar', 'J. Cole', 'Travis Scott'],
        correctIndex: 1,
        explanation:
          'Дрейк vs. Кендрик Ламар — один из самых обсуждаемых рэп-конфликтов десятилетия. "Not Like Us" стал гимном лета.',
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
        questionText: 'Какая группа исполняла "We Will Rock You" и "We Are the Champions"?',
        options: ['Led Zeppelin', 'The Rolling Stones', 'Queen', 'Deep Purple'],
        correctIndex: 2,
        explanation:
          'Queen — обе песни вышли на одном альбоме (1977). До сих пор звучат на стадионах по всему миру.',
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
        questionText: 'Из какой страны родом группа ABBA?',
        options: ['Дания', 'Норвегия', 'Швеция', 'Финляндия'],
        correctIndex: 2,
        explanation:
          'ABBA — шведский квартет: Бьорн, Бенни, Агнета и Аннифрид. "Dancing Queen" — один из самых узнаваемых хитов 70-х.',
      },
      {
        order: 2,
        questionText: 'Что особенного в выступлении Queen на концерте Live Aid?',
        options: [
          'Они играли 3 часа',
          'Это был их последний концерт с Фредди',
          'Оно считается лучшим живым выступлением в истории рок-музыки',
          'Они сыграли без репетиций',
        ],
        correctIndex: 2,
        explanation:
          'Live Aid, Уэмбли — 20 минут Queen с Фредди Меркьюри. Фанаты BBC проголосовали: лучшее живое выступление в истории.',
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
        questionText: 'Кого называют "Королевой попа"?',
        options: ['Britney Spears', 'Madonna', 'Beyoncé', 'Lady Gaga'],
        correctIndex: 1,
        explanation:
          'Мадонна — "Королева попа". Рекордные мировые туры, провокационный образ, 40+ лет на сцене.',
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
          'Какой саундтрек Кристофера Нолана прославился своим низким гудящим звуком "BRАААМ", который теперь копируют все трейлеры?',
        options: ['Интерстеллар', 'Начало', 'Тёмный рыцарь', 'Довод'],
        correctIndex: 1,
        explanation:
          'Саундтрек к "Началу" Ханса Циммера с резким низким звуком стал иконой. Теперь он звучит в половине голливудских трейлеров.',
      },
    ],
  },
];
