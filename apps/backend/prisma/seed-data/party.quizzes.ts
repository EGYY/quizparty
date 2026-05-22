import type { SeedQuiz } from './types';

export const partyQuizzes: SeedQuiz[] = [
  // ── 16. Бренды и символы — EASY ──────────────────────────────────────────────
  {
    title: 'Бренды и символы',
    description: 'Логотипы и символы, которые видим каждый день. Но знаем ли мы их?',
    category: 'PARTY',
    difficulty: 'EASY',
    coverUrl: '/assets/covers/party.svg',
    squareCoverUrl: '/assets/covers/square/party.svg',
    themeColor: '#26c6da',
    recommendedPlayersMin: 2,
    recommendedPlayersMax: 10,
    estimatedMinutes: 8,
    tags: ['бренды', 'логотипы', 'поп-культура', 'вечеринка'],
    questions: [
      {
        order: 0,
        questionText: 'Чей фирменный знак — знаменитая "галочка" (Swoosh)?',
        options: ['Adidas', 'Puma', 'Nike', 'Reebok'],
        correctIndex: 2,
        explanation:
          'Nike Swoosh — создана в 1971 году за $35. Одна из самых узнаваемых форм в мире.',
      },
      {
        order: 1,
        questionText: 'Что изображено на логотипе Apple?',
        options: ['Целое яблоко', 'Надкушенное яблоко', 'Яблочный цветок', 'Половина яблока'],
        correctIndex: 1,
        explanation:
          'Надкушенное яблоко — символ Apple с 1977 года. По легенде, откусили чтобы не путать с помидором.',
      },
      {
        order: 2,
        questionText: 'Три полосы — чей фирменный знак?',
        options: ['Nike', 'Puma', 'Adidas', 'Under Armour'],
        correctIndex: 2,
        explanation:
          'Три полосы — Adidas. Компания основана в 1949 году Адольфом (Ади) Дасслером в Германии.',
      },
      {
        order: 3,
        questionText: 'Какого цвета логотип Starbucks?',
        options: ['Коричневый', 'Жёлтый', 'Зелёный', 'Синий'],
        correctIndex: 2,
        explanation:
          'Starbucks — всё зелёное: логотип, фартуки, стаканы. Символ — морская сирена (русалка).',
      },
      {
        order: 4,
        questionText:
          'Какой бренд использует красную упаковку с белой надписью как главный визуальный образ?',
        options: ['Pepsi', "Lay's", 'Coca-Cola', 'Fanta'],
        correctIndex: 2,
        explanation:
          'Красно-белая банка Coca-Cola — один из самых узнаваемых дизайнов в мире. Не менялась десятилетиями.',
      },
      {
        order: 5,
        questionText: "Как зовут клоуна-талисмана McDonald's?",
        options: ['Гамбургляр', 'Мак', 'Рональд', 'Джонни Арч'],
        correctIndex: 2,
        explanation:
          'Рональд Макдональд появился в 1963 году. По некоторым исследованиям — второй по узнаваемости персонаж после Санта-Клауса.',
      },
      {
        order: 6,
        questionText: 'Какого цвета магазины IKEA?',
        options: ['Красно-белый', 'Сине-жёлтый', 'Зелёно-белый', 'Оранжево-синий'],
        correctIndex: 1,
        explanation: 'Синий и жёлтый — цвета шведского флага. IKEA основана в Швеции в 1943 году.',
      },
      {
        order: 7,
        questionText: 'Что за птица была на логотипе Twitter до ребрендинга в X?',
        options: ['Голубь', 'Синяя птица', 'Жёлтый попугай', 'Белая чайка'],
        correctIndex: 1,
        explanation:
          'Синяя птица — Larry the Bird, назван в честь баскетболиста Ларри Бёрда. В 2023 Илон Маск заменил её на X.',
      },
      {
        order: 8,
        questionText:
          'Какой технологический бренд добавляет "i" перед каждым продуктом (iPhone, iPad, iMac)?',
        options: ['Samsung', 'Apple', 'Google', 'Microsoft'],
        correctIndex: 1,
        explanation:
          'Apple начала использовать "i" с iMac в 1998 году. По словам Джобса, "i" означало internet, individual, inspire.',
      },
      {
        order: 9,
        questionText: 'Какой цвет ассоциируется с Facebook и Meta?',
        options: ['Красный', 'Синий', 'Зелёный', 'Чёрный'],
        correctIndex: 1,
        explanation:
          'Марк Цукерберг выбрал синий, потому что плохо различает красный и зелёный. Случайный факт, изменивший цвет интернета.',
      },
      {
        order: 10,
        questionText: 'Что символизирует трёхлучевая звезда Mercedes-Benz?',
        options: [
          'Три основателя компании',
          'Господство на суше, воде и в воздухе',
          'Три страны-производителя',
          'Три класса автомобилей',
        ],
        correctIndex: 1,
        explanation:
          'Трёхлучевая звезда символизирует господство на земле, воде и воздухе. Логотип с 1909 года.',
      },
      {
        order: 11,
        questionText: 'Чей слоган "Just Do It"?',
        options: ['Adidas', 'Apple', 'Nike', 'Under Armour'],
        correctIndex: 2,
        explanation:
          '"Just Do It" — слоган Nike с 1988 года. Один из самых узнаваемых рекламных слоганов в истории.',
      },
    ],
  },

  // ── 17. Мемология 101 — EASY ─────────────────────────────────────────────────
  {
    title: 'Мемология 101',
    description: 'Мемы, которые объединяют поколения. Ну, почти.',
    category: 'PARTY',
    difficulty: 'EASY',
    coverUrl: '/assets/covers/party.svg',
    squareCoverUrl: '/assets/covers/square/party.svg',
    themeColor: '#ffd166',
    recommendedPlayersMin: 2,
    recommendedPlayersMax: 10,
    estimatedMinutes: 8,
    tags: ['мемы', 'поп-культура', 'интернет', 'вечеринка'],
    questions: [
      {
        order: 0,
        questionText: 'Откуда мем "This is fine" с собакой в горящей комнате?',
        options: [
          'Из мультфильма The Simpsons',
          'Из веб-комикса Gunshow',
          'Из Reddit',
          'Из Tumblr',
        ],
        correctIndex: 1,
        explanation:
          'Автор комикса Gunshow — К.С. Грин (2013). Собака Эндо пьёт кофе пока всё горит.',
        mediaPrompt:
          'Простой нарисованный пёс сидит за столом в комнате, которая полностью в огне, выражение спокойствия.',
      },
      {
        order: 1,
        questionText: 'Что означает мем "Stonks"?',
        options: [
          'Иронично об акциях/деньгах, когда всё идёт не так',
          'Криптовалюта',
          'Отсылка к игре в кальмара',
          'Персонаж из аниме',
        ],
        correctIndex: 0,
        explanation:
          'Stonks — кривое написание "stocks". Мем с мужиком в костюме: иронично про "прибыль" любой ценой.',
      },
      {
        order: 2,
        questionText: 'Какой мем связан с фразой "Но это уже другая история"?',
        options: ['Shrek', 'Мем с Карлосоном', 'Мем с Дядей Фёдором', 'Мем Юрия Дудя'],
        correctIndex: 1,
        explanation:
          'Карлсон из советского мультфильма. Фраза "но это уже совсем другая история" — классика.',
      },
      {
        order: 3,
        questionText: 'Что такое "NPC" в мемной культуре?',
        options: [
          'Человек с нестандартным мышлением',
          'Человек, ведущий себя предсказуемо без собственных мыслей',
          'Персонаж из игры',
          'Тот, кто не понимает мемы',
        ],
        correctIndex: 1,
        explanation:
          'NPC (Non-Player Character) — мем о людях, которые "живут по скрипту" без критического мышления.',
      },
      {
        order: 4,
        questionText: 'Из какой игры пришёл мем "ALL YOUR BASE ARE BELONG TO US"?',
        options: ['Mortal Kombat', 'Street Fighter II', 'Zero Wing', 'Mega Man'],
        correctIndex: 2,
        explanation: 'Zero Wing (1989) — шутер с чудовищным переводом. Стал вирусным в нулевых.',
      },
      {
        order: 5,
        questionText: 'Что такое "ratio" в Твиттере/X?',
        options: [
          'Когда у поста больше ответов, чем лайков — знак провала',
          'Количество репостов к лайкам',
          'Метрика охвата',
          'Формат длинного треда',
        ],
        correctIndex: 0,
        explanation:
          'Рейшо — знак того, что пост вызвал возражения. Больше ответов, чем лайков = тебя разнесли.',
      },
      {
        order: 6,
        questionText: 'Как называется формат мема, где описывается ожидание vs реальность?',
        options: ['Expectation vs Reality', 'Me vs Brain', 'Glow Up', 'Two Panels'],
        correctIndex: 0,
        explanation:
          'Expectation vs Reality — классический двухпанельный формат. Верхний идеал, нижний — правда.',
      },
      {
        order: 7,
        questionText: 'Определи лишнее: всё это "вирусные" форматы видео, кроме одного.',
        options: ['Ice Bucket Challenge', 'Harlem Shake', 'Mannequin Challenge', 'Dalgona Coffee'],
        correctIndex: 3,
        explanation:
          'Далгона-кофе — вирусный рецепт из TikTok, а не челлендж с движением. Остальные — танцевальные/двигательные.',
      },
      {
        order: 8,
        questionText: 'Что означает "W" как отдельное слово в комментариях?',
        options: ['Проигрыш (от "waste")', 'Win — победа, молодец', 'Вопрос', 'Безразличие'],
        correctIndex: 1,
        explanation: '"W" = Win. "L" = Loss. Краткий сленг поколения Z для оценки ситуации.',
      },
      {
        order: 9,
        questionText: 'Что такое "Rickroll" и почему Рик Эстли любим в интернете?',
        options: [
          'Он создал первый мем',
          'Его "Never Gonna Give You Up" используют для розыгрышей — переходишь по ссылке и там он',
          'Он стал популярен в TikTok',
          'Он озвучивал персонажей в видеоиграх',
        ],
        correctIndex: 1,
        explanation:
          'Rickroll — классический интернет-розыгрыш: ждёшь один контент, а попадаешь на "Never Gonna Give You Up" 1987 года. Рик сам смеётся над этим.',
      },
      {
        order: 10,
        questionText: 'Что такое "doomscrolling"?',
        options: [
          'Просмотр ужасов перед сном',
          'Бесконечное листание негативных новостей',
          'Прокрутка ленты в темноте',
          'Игра Doom на телефоне',
        ],
        correctIndex: 1,
        explanation:
          'Думскроллинг — компульсивный просмотр плохих новостей. Слово 2020 года по версии Merriam-Webster.',
      },
      {
        order: 11,
        questionText:
          'Как называется мем, где персонаж спрашивает: "Ты сделал это?" — и получает ответ "Yes." — "И мы должны им гордиться?" — "No."?',
        options: [
          'Star Wars: Palpatine',
          'Мем с Терминатором',
          'Мем с Мстителями (Тано и Старк)',
          'Мем из Breaking Bad',
        ],
        correctIndex: 0,
        explanation: 'Это Emperor Palpatine из "Мести ситхов". Адаптируется под любую ситуацию.',
      },
    ],
  },

  // ── 17. Слишком онлайн — MEDIUM ──────────────────────────────────────────────
  {
    title: 'Слишком онлайн',
    description:
      'Интернет-культура, платформы, субкультуры. Если ты понял шутку — ты "too online".',
    category: 'PARTY',
    difficulty: 'MEDIUM',
    coverUrl: '/assets/covers/party.svg',
    squareCoverUrl: '/assets/covers/square/party.svg',
    themeColor: '#ffab40',
    recommendedPlayersMin: 2,
    recommendedPlayersMax: 10,
    estimatedMinutes: 11,
    tags: ['мемы', 'интернет', 'тиктог', 'вечеринка'],
    questions: [
      {
        order: 0,
        questionText: 'Что такое "lore" в контексте не только игр, но и интернет-персон?',
        options: [
          'Фан-арт',
          'Накопленная история и бэкграунд персонажа/события',
          'Неофициальный перевод',
          'Скандальное прошлое',
        ],
        correctIndex: 1,
        explanation:
          'Lore — термин из игр, означающий "скрытую историю". В интернете: всё, что нужно знать о ком-то.',
      },
      {
        order: 1,
        questionText: 'Что такое "parasocial relationship"?',
        options: [
          'Дружба в интернете без встреч офлайн',
          'Односторонняя эмоциональная привязанность к медиа-персоне',
          'Анонимное общение',
          'Отношения стриммера с его комьюнити',
        ],
        correctIndex: 1,
        explanation:
          'Парасоциальные отношения — иллюзия близкой дружбы с блогером/актёром, который о тебе не знает.',
      },
      {
        order: 2,
        questionText: 'Откуда пришёл термин "ship" (шипперство) в фандом-культуру?',
        options: [
          'От "spaceship" в Star Trek-фандоме',
          'Сокращение от "relationship"',
          'От имени персонажа',
          'Из японского аниме-жаргона',
        ],
        correctIndex: 1,
        explanation:
          '"Ship" — сокращение "relationship". Шипперство зародилось в X-Files-фандоме в 90-х.',
      },
      {
        order: 3,
        questionText: 'Что такое "vtuber"?',
        options: [
          'Видеоблогер, снимающий видео на YouTube о технике',
          'Виртуальный YouTuber с анимированным аватаром',
          'Формат коротких видео',
          'Специальный тип стрима',
        ],
        correctIndex: 1,
        explanation:
          'VTuber — стример/блогер с виртуальным анимированным персонажем. Hololive, Nijisanji — топ агентства.',
        mediaPrompt: 'Аниме-персонаж девушка с микрофоном перед экраном, стрим-атмосфера.',
      },
      {
        order: 4,
        questionText:
          'В каком году появился TikTok в его нынешнем виде (после слияния с Musical.ly)?',
        options: ['2016', '2017', '2018', '2019'],
        correctIndex: 2,
        explanation:
          'ByteDance купила Musical.ly в 2017, слила с TikTok в 2018. С тех пор — мировая экспансия.',
      },
      {
        order: 5,
        questionText:
          'Определи лишнее: все это форматы интернет-контента, появившиеся до 2010 года, кроме одного.',
        options: ['Влог', 'Подкаст', 'Стрим на Twitch', 'Форумный ролевой текст (RP)'],
        correctIndex: 2,
        explanation:
          'Twitch появился в 2011. Влоги, подкасты и форумные RP существовали задолго до этого.',
      },
      {
        order: 6,
        questionText: 'Что такое "main character syndrome" в интернет-культуре?',
        options: [
          'Желание быть главным персонажем своей истории',
          'Расстройство, при котором человек ведёт себя как герой фильма в реальной жизни',
          'Тип контента где пользователь — NPC',
          'Синдром перфекционизма в создании контента',
        ],
        correctIndex: 1,
        explanation:
          'Main Character Syndrome — поведение, будто всё происходящее вокруг — твой личный фильм.',
      },
      {
        order: 7,
        questionText: 'Что такое "беспощадный фактчек" как интернет-жанр?',
        options: [
          'Проверка фейков СМИ',
          'Ироничная деконструкция заявлений блогеров через их же слова',
          'Академическая проверка фактов',
          'YouTube-канал',
        ],
        correctIndex: 1,
        explanation:
          'Фактчек-контент разбирает противоречия в словах публичных людей, используя цитаты и архивы.',
      },
      {
        order: 8,
        questionText:
          'Как называется феномен, когда старый контент автора "всплывает" и разрушает его репутацию?',
        options: [
          'Cancel culture',
          'Old tweets resurfacing',
          'Digital archaeology',
          'Context collapse',
        ],
        correctIndex: 1,
        explanation:
          '"Old tweets resurfacing" — интернет ничего не забывает. Иногда это называют и cancel culture.',
      },
      {
        order: 9,
        questionText: 'Что такое "context collapse" в социальных сетях?',
        options: [
          'Удаление публикации из-за нарушений',
          'Когда сообщение, адресованное одной аудитории, видит другая',
          'Потеря аккаунта',
          'Вирусный пост без контекста',
        ],
        correctIndex: 1,
        explanation:
          'Context collapse — публика в соцсети неоднородна, и шутка "для своих" может оказаться у чужих.',
      },
      {
        order: 10,
        questionText: 'Какое русское слово стало интернациональным мемом благодаря аниме-фандому?',
        options: ['Хаха', 'Аниме', 'Смерть', 'Орать'],
        correctIndex: 2,
        explanation:
          '"Смерть" (death) читается как японское "su" — отсюда культовый "Detsu" момент в аниме-мемах.',
      },
      {
        order: 11,
        questionText: 'Что такое "post-irony" в современной культуре?',
        options: [
          'Когда ирония исчезла',
          'Когда граница между иронией и искренностью размыта намеренно',
          'Новый жанр видеоблогов',
          'Реакция на интернет-цинизм',
        ],
        correctIndex: 1,
        explanation:
          'Пост-ирония — непонятно, серьёзно ли это или нет. Иногда обе интерпретации верны одновременно.',
      },
    ],
  },

  // ── 18. Детство без подписки — EASY ──────────────────────────────────────────
  {
    title: 'Детство без подписки',
    description: 'До ютуба, до стриминга, до смартфонов. Помнишь?',
    category: 'PARTY',
    difficulty: 'EASY',
    coverUrl: '/assets/covers/party.svg',
    squareCoverUrl: '/assets/covers/square/party.svg',
    themeColor: '#ff7043',
    recommendedPlayersMin: 2,
    recommendedPlayersMax: 10,
    estimatedMinutes: 8,
    tags: ['ностальгия', 'детство', '90е', '2000е', 'вечеринка'],
    questions: [
      {
        order: 0,
        questionText:
          'Как называется деревня, в которую сбегает дядя Фёдор вместе с котом Матроскиным?',
        options: ['Деревня Антошкино', 'Деревня Кукуевка', 'Простоквашино', 'Деревня Мурлыкино'],
        correctIndex: 2,
        explanation:
          'Простоквашино — название деревни из советского мультфильма. Кот Матроскин, пёс Шарик и дядя Фёдор.',
      },
      {
        order: 1,
        questionText: 'На каком носителе чаще всего хранились фотографии в начале 2000-х?',
        options: ['Дискета', 'CD-диск', 'Плёнка / фотоплёнка', 'SD-карта'],
        correctIndex: 2,
        explanation:
          'В начале 2000-х большинство семей ещё снимало на плёнку. Цифра стала массовой к 2005.',
      },
      {
        order: 2,
        questionText:
          'Как называлась популярная игра, где нужно было кормить и воспитывать виртуального питомца?',
        options: ['Furby', 'Тамагочи', 'Digimon', 'Neopets'],
        correctIndex: 1,
        explanation:
          'Тамагочи — японская электронная игрушка Bandai 1996 года. Настоящий хит детства 90-х.',
        mediaPrompt:
          'Маленькое яйцеобразное устройство с экраном и тремя кнопками, на экране пиксельный зверёк.',
      },
      {
        order: 3,
        questionText:
          'Как называлась советская/российская игровая приставка — главный конкурент Sega в 90-е?',
        options: ['Электроника', 'Денди', 'Синклер', 'Атари'],
        correctIndex: 1,
        explanation:
          'Денди — самая популярная приставка в постсоветском пространстве 90-х. Фактически клон NES. "Dendy — новая реальность!"',
      },
      {
        order: 4,
        questionText:
          'Как назывался пластилиновый герой из советского мультика, который лепил из себя что угодно?',
        options: ['Пластилинка', 'Пластилиновая ворона', 'Хрюша', 'Гоша'],
        correctIndex: 1,
        explanation:
          '"Пластилиновая ворона" — мультфильм 1981 года с культовой музыкой Григория Гладкова.',
      },
      {
        order: 5,
        questionText:
          'Как называлась карточная игра, которую коллекционировали в школах в нулевых?',
        options: ['Magic: The Gathering', 'Yu-Gi-Oh!', 'Chaotic', 'Bakugan'],
        correctIndex: 1,
        explanation:
          'Yu-Gi-Oh! — карточная игра на основе аниме. В нулевых была в каждом школьном пенале.',
      },
      {
        order: 6,
        questionText:
          'Определи лишнее: все это игрушки/предметы из детства 90-2000-х, кроме одного.',
        options: ['Кубик Рубика', 'Тетрис-кирпич', 'AirPods', 'Денди'],
        correctIndex: 2,
        explanation: 'AirPods вышли в 2016. Остальное — чистая ностальгия 90-х.',
      },
      {
        order: 7,
        questionText:
          'Как назывались наклейки-вкладыши из жвачек Donald и Turbo, которые коллекционировали в 90-х?',
        options: ['Карточки', 'Стикеры', 'Вкладыши', 'Боны'],
        correctIndex: 2,
        explanation:
          'Вкладыши в жвачках Donald и Turbo — настоящая валюта школьных дворов 90-х. Их обменивали, выигрывали и собирали сериями.',
      },
      {
        order: 8,
        questionText: 'Какую валюту использовали в браузерной игре "Аватария" или "Клуб Винкс"?',
        options: ['Монеты', 'Алмазы и монеты', 'Звёзды', 'Карточки'],
        correctIndex: 1,
        explanation:
          'Двойная валюта (монеты + премиум-валюта в кристаллах/алмазах) — стандарт браузерных игр нулевых.',
      },
      {
        order: 9,
        questionText: 'Как в нулевых называлось явление, когда переписывались по очереди в ICQ?',
        options: ['Чат', 'Аська', 'Контакт', 'ВКонтакте'],
        correctIndex: 1,
        explanation:
          '"Аська" (ICQ) — мессенджер от Mirabilis (1996). Звук "ta-da" при входе друга — часть памяти поколения.',
      },
      {
        order: 10,
        questionText:
          'Как называлась серия игрушек, у которых была "тайная" жизнь за магнитным стикером?',
        options: ['Zoobles', 'Littlest Pet Shop', 'Polly Pocket', 'Mighty Beanz'],
        correctIndex: 3,
        explanation:
          'Mighty Beanz — бобы с персонажами внутри, коллекционировались и гонялись наперегонки.',
      },
      {
        order: 11,
        questionText: 'В каком формате скачивали музыку в нулевых, ещё до стриминга?',
        options: ['FLAC', 'WAV', 'MP3', 'AAC'],
        correctIndex: 2,
        explanation:
          'MP3 — формат эпохи Napster и eMule. Limewire, Kazaa, eMule — платформы для пиратства того времени.',
      },
    ],
  },

  // ── 19. Нулевые вернулись — MEDIUM ───────────────────────────────────────────
  {
    title: 'Нулевые вернулись',
    description: 'Поп-культура 2000–2010. Самое странное и прекрасное десятилетие.',
    category: 'PARTY',
    difficulty: 'MEDIUM',
    coverUrl: '/assets/covers/party.svg',
    squareCoverUrl: '/assets/covers/square/party.svg',
    themeColor: '#ff6f00',
    recommendedPlayersMin: 2,
    recommendedPlayersMax: 10,
    estimatedMinutes: 11,
    tags: ['ностальгия', '2000е', 'поп-культура', 'вечеринка'],
    questions: [
      {
        order: 0,
        questionText: 'Какой телефон считался самым статусным в 2006–2007 годах?',
        options: ['Nokia 3310', 'Motorola Razr V3', 'Sony Ericsson T610', 'Siemens S65'],
        correctIndex: 1,
        explanation:
          'Motorola Razr V3 — тонкий раскладной телефон, символ середины нулевых. 50 млн продаж.',
        mediaPrompt:
          'Тонкий серебристый раскладной телефон на ладони, нулевые, кожаные брюки на фоне.',
      },
      {
        order: 1,
        questionText: 'Какой сайт был крупнейшей социальной сетью до Facebook?',
        options: ['Friendster', 'LiveJournal', 'MySpace', 'Bebo'],
        correctIndex: 2,
        explanation:
          'MySpace (2003–2008) — пик популярности до 2008. Его обогнал Facebook примерно в 2008.',
      },
      {
        order: 2,
        questionText: 'Определи связь: Paris Hilton, Lindsay Lohan, Britney Spears в нулевых.',
        options: [
          'Все снялись в одном фильме',
          'Все становились объектом бульварной прессы и папарацци-охоты',
          'Все выпускали линейки духов',
          'Все сидели в тюрьме',
        ],
        correctIndex: 1,
        explanation:
          'Нулевые — эпоха таблоидов. Эти трое были главными мишенями бульварной прессы.',
      },
      {
        order: 3,
        questionText:
          'Как называлась вирусная игра на Facebook, где нужно было поливать и собирать урожай?',
        options: ['Happy Farm', 'FarmVille', 'Harvest Moon', 'Township'],
        correctIndex: 1,
        explanation:
          'FarmVille (2009) — вирусная игра Zynga. Десятки миллионов игроков поливали виртуальную клубнику вместо работы.',
      },
      {
        order: 4,
        questionText: 'Что такое "emo" как субкультура нулевых?',
        options: [
          'Хардкор-панк с эмоциональными текстами',
          'Музыкальный жанр + субкультура с чёлкой, чёрным и эмоциями',
          'Скинхед-культура',
          'Поджанр металла',
        ],
        correctIndex: 1,
        explanation:
          'Emo (emotional hardcore) — музыка + эстетика: MCR, Fall Out Boy, чёрная одежда, чёлка.',
      },
      {
        order: 5,
        questionText: 'Что такое влог (vlog) — жанр, ставший популярным с появлением YouTube?',
        options: [
          'Видеоролик о технологиях',
          'Видеодневник о повседневной жизни автора',
          'Музыкальный клип',
          'Короткий рекламный ролик',
        ],
        correctIndex: 1,
        explanation:
          'Влог (video + blog) — видеодневник. После запуска YouTube в 2005 году стал первым массовым жанром платформы.',
      },
      {
        order: 6,
        questionText: 'Что такое Flash-игры и где их в основном играли?',
        options: [
          'Игры на Flash-накопителях',
          'Браузерные игры на технологии Adobe Flash',
          'Игры на MP3-плеерах',
          'Аркадные автоматы в торговых центрах',
        ],
        correctIndex: 1,
        explanation:
          'Flash-игры на Newgrounds, Miniclip, Armor Games — целая эпоха до мобильных игр. Adobe убила Flash в 2020.',
      },
      {
        order: 7,
        questionText: 'Какой гаджет был символом 2001 года и изменил музыкальную индустрию?',
        options: ['CD Walkman', 'iPod', 'MiniDisc-плеер', 'Rio PMP300'],
        correctIndex: 1,
        explanation: 'iPod Apple (2001) + iTunes = конец CD-эпохи. "1000 songs in your pocket."',
      },
      {
        order: 8,
        questionText:
          'Как называлась популярная в СНГ социальная сеть, конкурировавшая с ВКонтакте?',
        options: ['Одноклассники', 'Мой мир', 'Мамба', 'Привет.ру'],
        correctIndex: 0,
        explanation:
          'Одноклассники (ok.ru) — основаны в 2006, Альберт Попков. Нишировались на более взрослую аудиторию.',
      },
      {
        order: 9,
        questionText:
          'Какой хит Рианны 2007 года стал одним из самых продаваемых синглов десятилетия?',
        options: ['Disturbia', 'Umbrella', "Don't Stop the Music", 'SOS'],
        correctIndex: 1,
        explanation: '"Umbrella" — 10 миллионов синглов. Рианна и Jay-Z. Символ 2007 года.',
      },
      {
        order: 10,
        questionText: 'Что такое "аватарка" в интернет-культуре нулевых?',
        options: [
          'Фотка из фильма Кэмерона',
          'Маленькое изображение пользователя в профиле',
          'Никнейм в форуме',
          'Цифровая подпись',
        ],
        correctIndex: 1,
        explanation:
          'Аватар/аватарка — слово пришло из форумной культуры и стало стандартным термином.',
      },
      {
        order: 11,
        questionText: 'Что такое "LiveJournal" и кто его активно использовал в СНГ?',
        options: [
          'Видеохостинг',
          'Блог-платформа, популярная у интеллигенции и IT-специалистов',
          'Форум геймеров',
          'Сайт знакомств',
        ],
        correctIndex: 1,
        explanation:
          'LiveJournal (ЖЖ) — блог-платформа 1999 года. В нулевых — центр русскоязычного блогосферы.',
      },
    ],
  },

  // ── 20. Что было раньше? — MEDIUM ────────────────────────────────────────────
  {
    title: 'Что было раньше?',
    description: 'На скорость и ассоциации. Угадай, что появилось первым.',
    category: 'PARTY',
    difficulty: 'MEDIUM',
    coverUrl: '/assets/covers/party.svg',
    squareCoverUrl: '/assets/covers/square/party.svg',
    themeColor: '#26c6da',
    recommendedPlayersMin: 2,
    recommendedPlayersMax: 10,
    estimatedMinutes: 10,
    tags: ['вечеринка', 'ностальгия', 'хронология', 'факты'],
    questions: [
      {
        order: 0,
        questionText: 'Что появилось раньше: YouTube или Facebook?',
        options: [
          'YouTube (2005)',
          'Facebook (2004)',
          'Оба в одном году',
          'YouTube позже на 3 года',
        ],
        correctIndex: 1,
        explanation:
          'Facebook — 2004, YouTube — 2005. Знаменитый первый ролик YouTube: "Me at the zoo", апрель 2005.',
      },
      {
        order: 1,
        questionText: 'Что вышло раньше: iPhone или Android?',
        options: [
          'Оба в 2007',
          'iPhone (2007) раньше Android (2008)',
          'Android (2006) раньше iPhone',
          'Оба в 2008',
        ],
        correctIndex: 1,
        explanation: 'iPhone — январь 2007. Первый Android-смартфон HTC Dream — сентябрь 2008.',
      },
      {
        order: 2,
        questionText: 'Что старше: Google или Amazon?',
        options: [
          'Google (1998) старше Amazon (1994)',
          'Amazon (1994) старше Google (1998)',
          'Основаны в один год',
          'Amazon моложе',
        ],
        correctIndex: 1,
        explanation: 'Amazon основан Безосом в 1994. Google Брин и Пейдж — в 1998.',
      },
      {
        order: 3,
        questionText: 'Что появилось раньше: интернет-браузер или электронная почта?',
        options: ['Браузер', 'Электронная почта', 'Одновременно', 'Зависит от страны'],
        correctIndex: 1,
        explanation:
          'Электронная почта — 1971 (Рэй Томлинсон). Первый браузер Mosaic — 1993. Разница 22 года.',
      },
      {
        order: 4,
        questionText: 'Что вышло раньше: "Матрица" или "Звёздные войны: Эпизод I"?',
        options: [
          'Матрица (март 1999) раньше Эпизода I (май 1999)',
          'Эпизод I раньше Матрицы',
          'Оба вышли в один день',
          'Матрица вышла в 1998',
        ],
        correctIndex: 0,
        explanation:
          'Матрица — 31 марта 1999. Скрытая угроза — 19 мая 1999. Легендарный год для кино.',
      },
      {
        order: 5,
        questionText: 'Что появилось раньше: WhatsApp или Telegram?',
        options: ['Telegram (2013)', 'WhatsApp (2009)', 'Оба в 2010', 'Telegram старше'],
        correctIndex: 1,
        explanation:
          'WhatsApp — 2009 (Ян Коум и Брайан Актон). Telegram — 2013 (Павел и Николай Дуровы).',
      },
      {
        order: 6,
        questionText: 'Что старше: Pepsi или Coca-Cola?',
        options: ['Coca-Cola (1886)', 'Pepsi (1893)', 'Одного возраста', 'Pepsi на 20 лет старше'],
        correctIndex: 0,
        explanation: 'Coca-Cola — 1886, Pepsi — 1893. Разница 7 лет.',
      },
      {
        order: 7,
        questionText: 'Что появилось раньше в кино: цвет или звук?',
        options: [
          'Цвет (1906) раньше звука',
          'Звук (1927) раньше массового цвета (1935)',
          'Оба в 1930-х',
          'Звук и цвет появились одновременно',
        ],
        correctIndex: 1,
        explanation: 'Первый звуковой фильм "Певец джаза" — 1927. Массовый Technicolor — с 1935.',
      },
      {
        order: 8,
        questionText: 'Что было создано раньше: Nintendo или Sony?',
        options: [
          'Sony (1946)',
          'Nintendo (1889)',
          'Обе основаны в 1946',
          'Nintendo основана в 1960',
        ],
        correctIndex: 1,
        explanation:
          'Nintendo основана в 1889 как производитель карточных игр (карута). Sony — 1946.',
      },
      {
        order: 9,
        questionText: "Что старше: Rolls-Royce или McDonald's?",
        options: [
          "McDonald's (1940) старше Rolls-Royce (1906)",
          "Rolls-Royce (1906) старше McDonald's (1940)",
          'Оба основаны в 1920-х',
          'Rolls-Royce основан в 1930-х',
        ],
        correctIndex: 1,
        explanation: "Rolls-Royce — 1906. McDonald's — 1940. Ролс на 34 года старше.",
      },
      {
        order: 10,
        questionText: 'Что появилось раньше: Instagram или Snapchat?',
        options: ['Snapchat (2011)', 'Instagram (2010)', 'Оба в 2011', 'Instagram появился в 2012'],
        correctIndex: 1,
        explanation: 'Instagram запущен в октябре 2010. Snapchat — в сентябре 2011.',
      },
      {
        order: 11,
        questionText: 'Что произошло раньше: полёт на Луну или появление интернета?',
        options: [
          'Луна (1969) раньше интернета (ARPANET 1969)',
          'Оба в 1969, но Луна чуть раньше',
          'Интернет раньше Луны',
          'ARPANET в 1967, Луна в 1969',
        ],
        correctIndex: 1,
        explanation:
          'Аполлон-11 — июль 1969. ARPANET запущен в октябре 1969. Лунная миссия буквально опередила интернет.',
      },
    ],
  },
];
