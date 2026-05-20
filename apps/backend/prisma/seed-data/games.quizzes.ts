import type { SeedQuiz } from './types';

export const gamesQuizzes: SeedQuiz[] = [
  // ── 13. Press F to answer — EASY ─────────────────────────────────────────────
  {
    title: 'Press F to answer',
    description: 'Культовые игры, персонажи, мемы. Для тех, кто хоть раз держал геймпад.',
    category: 'GAMES',
    difficulty: 'EASY',
    coverUrl: '/assets/covers/games.svg',
    squareCoverUrl: '/assets/covers/square/games.svg',
    themeColor: '#9b7cff',
    recommendedPlayersMin: 2,
    recommendedPlayersMax: 10,
    estimatedMinutes: 9,
    tags: ['игры', 'поп-культура', 'вечеринка', 'мемы'],
    questions: [
      {
        order: 0,
        questionText: 'Кто такой Марио по профессии?',
        options: ['Инженер', 'Водопроводчик', 'Электрик', 'Садовник'],
        correctIndex: 1,
        explanation: 'Марио — водопроводчик из Бруклина. Его брат Луиджи тоже.',
        revealMediaPrompt:
          'Марио в красной кепке и комбинезоне прыгает на фоне разноцветных блоков.',
      },
      {
        order: 1,
        questionText: 'В какой игре нужно "ловить покемонов"?',
        options: ['Digimon World', 'Yokai Watch', 'Pokémon', 'Monster Hunter'],
        correctIndex: 2,
        explanation: 'Покемон — серия Nintendo с 1996 года. Цель — поймать их всех.',
      },
      {
        order: 2,
        questionText: 'Как называется главный злодей в серии "Легенда о Зельде"?',
        options: ['Ганон/Ганондорф', 'Мидна', 'Линк', 'Зант'],
        correctIndex: 0,
        explanation: 'Ганондорф — главный антагонист. Линк — герой. Зельда — принцесса.',
      },
      {
        order: 3,
        questionText: 'Что такое "Battle Royale" в игровом жанре?',
        options: [
          'Файтинг 1-на-1',
          'Последний выживший на карте побеждает',
          'Командный захват флага',
          'Гонка к финишу',
        ],
        correctIndex: 1,
        explanation:
          'Battle Royale — жанр, где много игроков сражаются до последнего выжившего. Fortnite, PUBG, Warzone.',
      },
      {
        order: 4,
        questionText: 'Какая компания сделала PlayStation?',
        options: ['Microsoft', 'Nintendo', 'Sony', 'Sega'],
        correctIndex: 2,
        explanation: 'PlayStation — консоль Sony. Первая вышла в 1994 году в Японии.',
      },
      {
        order: 5,
        questionText: 'Из какой игры мем "Press F to pay respects"?',
        options: [
          'Call of Duty: Ghosts',
          'Call of Duty: Advanced Warfare',
          'Battlefield 4',
          'Medal of Honor',
        ],
        correctIndex: 1,
        explanation:
          'В CoD: Advanced Warfare (2014) игрока просят нажать F у гроба. Стало мемом навсегда.',
        mediaPrompt: 'Экран компьютерной игры с подсказкой "[F] Pay Respects" внизу.',
      },
      {
        order: 6,
        questionText: 'Какой персонаж является главным героем серии Halo?',
        options: ['Мастер Чиф', 'Марк-V', 'Спартан', 'Нобл-6'],
        correctIndex: 0,
        explanation: 'Мастер Чиф (Джон-117) — спартанец в зелёной броне. Лицо Xbox.',
      },
      {
        order: 7,
        questionText: 'Определи лишнее: всё это игры с открытым миром, кроме одной.',
        options: ['GTA V', 'The Witcher 3', 'Tetris', 'Red Dead Redemption 2'],
        correctIndex: 2,
        explanation: 'Tetris — паззл с падающими фигурками. Открытый мир к нему не относится.',
      },
      {
        order: 8,
        questionText: 'В каком году вышел оригинальный Minecraft?',
        options: ['2007', '2009', '2011', '2013'],
        correctIndex: 2,
        explanation: 'Minecraft вышел в официальный релиз 18 ноября 2011. Альфа — с 2009.',
      },
      {
        order: 9,
        questionText: 'Как называется главный режим в Among Us?',
        options: ['Охота на предателя', 'Crewmate vs Impostor', 'Командная работа', 'Выживание'],
        correctIndex: 1,
        explanation: 'Crew (команда) vs Impostor (самозванец) — суть игры. Кто шпион среди нас?',
      },
      {
        order: 10,
        questionText: 'Что такое "Easter egg" в контексте видеоигр?',
        options: [
          'Пасхальное задание в игре',
          'Скрытая пасхалка или шутка разработчиков',
          'Особый вид лута',
          'Случайное событие',
        ],
        correctIndex: 1,
        explanation:
          'Easter egg — секрет, спрятанный разработчиками. Традиция идёт с Adventure (Atari 2600, 1979).',
      },
      {
        order: 11,
        questionText:
          'Сколько игроков максимально поддерживает классический Minecraft multiplayer сервер (Java edition)?',
        options: ['20', '100', 'Зависит от сервера', '256'],
        correctIndex: 2,
        explanation:
          'Лимит определяется сервером — стандарт 20-100, но крупные серверы держат тысячи.',
      },
    ],
  },

  // ── 14. Лобби для своих — MEDIUM ─────────────────────────────────────────────
  {
    title: 'Лобби для своих',
    description: 'История, механики, лор. Для тех, кто читает патч-ноуты.',
    category: 'GAMES',
    difficulty: 'MEDIUM',
    coverUrl: '/assets/covers/games.svg',
    squareCoverUrl: '/assets/covers/square/games.svg',
    themeColor: '#7c4dff',
    recommendedPlayersMin: 2,
    recommendedPlayersMax: 10,
    estimatedMinutes: 11,
    tags: ['игры', 'лор', 'история-игр', 'вечеринка'],
    questions: [
      {
        order: 0,
        questionText: 'Кто разработал серию Dark Souls?',
        options: ['Bandai Namco', 'FromSoftware', 'CD Projekt Red', 'Capcom'],
        correctIndex: 1,
        explanation:
          'FromSoftware — японская студия, создавшая Souls-серию под руководством Хидэтаки Миядзаки.',
      },
      {
        order: 1,
        questionText: 'Что такое "рогалик" (roguelike) в геймдизайне?',
        options: [
          'Игра с открытым миром',
          'Пошаговая игра с процедурной генерацией и постоянной смертью',
          'Слешер с прокачкой',
          'Игра про детектива',
        ],
        correctIndex: 1,
        explanation:
          'Roguelike — жанр, названный по Rogue (1980): случайные уровни, смерть = начало сначала.',
      },
      {
        order: 2,
        questionText: 'В каком году вышел первый Counter-Strike (как мод для Half-Life)?',
        options: ['1998', '1999', '2000', '2001'],
        correctIndex: 1,
        explanation:
          'CS 1.0 как мод вышел в 1999, силами Минь Ли и Джесса Клиффа. Valve купила права в 2000.',
      },
      {
        order: 3,
        questionText: 'Как называется способность "паррировать" удар в серии Souls?',
        options: ['Deflect', 'Parry', 'Guard', 'Counter'],
        correctIndex: 1,
        explanation:
          'Парри (Parry) — точное отражение атаки противника, открывающее окно для критического удара.',
        mediaPrompt: 'Два рыцаря в тёмном замке, момент парирования удара, искры.',
      },
      {
        order: 4,
        questionText: 'Определи лишнее: всё это игры жанра MOBA, кроме одной.',
        options: ['Dota 2', 'League of Legends', 'Heroes of the Storm', 'Valorant'],
        correctIndex: 3,
        explanation: 'Valorant — тактический шутер (как CS). Dota 2, LoL и HotS — MOBA.',
      },
      {
        order: 5,
        questionText: 'Кто такой "Геральт из Ривии"?',
        options: [
          'Персонаж из Dark Souls',
          'Ведьмак из серии CD Projekt Red',
          'Герой серии God of War',
          'Протагонист Elder Scrolls',
        ],
        correctIndex: 1,
        explanation:
          'Геральт — ведьмак из книг Анджея Сапковского и игровой серии The Witcher от CD Projekt Red.',
      },
      {
        order: 6,
        questionText: 'Что означает аббревиатура RPG в контексте видеоигр?',
        options: [
          'Real Player Game',
          'Role-Playing Game',
          'Racing Puzzle Game',
          'Random Progression Generator',
        ],
        correctIndex: 1,
        explanation: 'Role-Playing Game — жанр с прокачкой персонажа, историей и выборами.',
      },
      {
        order: 7,
        questionText: 'В каком году вышел первый The Elder Scrolls?',
        options: ['1991', '1994', '1997', '2000'],
        correctIndex: 1,
        explanation:
          'The Elder Scrolls: Arena — 1994. Bethesda тогда называлась просто Bethesda Softworks.',
      },
      {
        order: 8,
        questionText: 'Какая компания разработала оригинальный Doom (1993)?',
        options: ['Blizzard', 'id Software', 'Epic Games', '3D Realms'],
        correctIndex: 1,
        explanation: 'id Software — Джон Кармак и Джон Ромеро. Doom изобрёл FPS как жанр.',
      },
      {
        order: 9,
        questionText: 'Что такое "metroidvania"?',
        options: [
          'JRPG в стиле Final Fantasy',
          'Платформер с нелинейным исследованием и постепенной разблокировкой способностей',
          'Шутер с видом сверху',
          'Ритм-игра',
        ],
        correctIndex: 1,
        explanation:
          'Metroidvania — жанр по Metroid + Castlevania: открытый мир, способности как ключи.',
      },
      {
        order: 10,
        questionText: 'Сколько "Гран При" в году в игровой серии Formula 1?',
        options: ['16', '20', '23', 'Зависит от года'],
        correctIndex: 3,
        explanation:
          'Количество гонок меняется каждый сезон F1 — в играх обычно отражается текущий календарь.',
      },
      {
        order: 11,
        questionText:
          'Как называется механика в Dead Cells, когда после смерти ты становишься немного сильнее?',
        options: ['Permadeath', 'Roguelite progression', 'Respawn system', 'Karma loop'],
        correctIndex: 1,
        explanation:
          'Roguelite (в отличие от roguelike) — смерть откатывает прогресс, но некоторые улучшения остаются навсегда.',
      },
    ],
  },

  // ── 15. Последний сейв был 3 часа назад — HARD ───────────────────────────────
  {
    title: 'Последний сейв был 3 часа назад',
    description: 'История игровой индустрии, глубокий лор, малоизвестные факты.',
    category: 'GAMES',
    difficulty: 'HARD',
    coverUrl: '/assets/covers/games.svg',
    squareCoverUrl: '/assets/covers/square/games.svg',
    themeColor: '#311b92',
    recommendedPlayersMin: 2,
    recommendedPlayersMax: 8,
    estimatedMinutes: 14,
    tags: ['игры', 'история-игр', 'хардкор', 'душнила'],
    questions: [
      {
        order: 0,
        questionText: 'Как называется первая коммерчески успешная видеоигра?',
        options: ['Pong', 'Space Invaders', 'Pac-Man', 'Donkey Kong'],
        correctIndex: 0,
        explanation:
          'Pong (Atari, 1972) — первая коммерчески успешная аркадная игра, задавшая индустрию.',
      },
      {
        order: 1,
        questionText: 'Что случилось с игровой индустрией США в 1983 году?',
        options: [
          'Выход первой PlayStation',
          'Крах рынка видеоигр (Video Game Crash)',
          'Nintendo завоевала рынок',
          'Появился жанр FPS',
        ],
        correctIndex: 1,
        explanation:
          'Крах 1983 года — рынок рухнул на 97% из-за перенасыщения плохими играми. Atari потеряла всё.',
      },
      {
        order: 2,
        questionText: 'Кто придумал Тетрис?',
        options: ['Алексей Пажитнов', 'Нинтендо', 'Дональд Тран', 'Хидэо Кодзима'],
        correctIndex: 0,
        explanation:
          'Алексей Пажитнов создал Тетрис в 1984 году в советском Вычислительном центре в Москве.',
      },
      {
        order: 3,
        questionText:
          'Как называется движок, на котором работает большинство современных ААА-игр от Epic?',
        options: ['CryEngine', 'Unity', 'Unreal Engine', 'Frostbite'],
        correctIndex: 2,
        explanation:
          'Unreal Engine — движок Epic Games. Версия 5 в 2022 снова переопределила графику.',
      },
      {
        order: 4,
        questionText:
          'В чём заключается "парадокс выбора" в видеоигровом дизайне согласно Тому Чизлетту?',
        options: [
          'Слишком много кнопок усложняет управление',
          'Слишком много опций парализует игрока',
          'Выбор персонажа влияет на механики',
          'Нелинейный сюжет снижает продажи',
        ],
        correctIndex: 1,
        explanation:
          'Чрезмерный выбор снижает удовольствие — игроки тратят больше времени на меню, чем на игру.',
      },
      {
        order: 5,
        questionText: 'Какая игра стала первым случаем использования "процедурной генерации" мира?',
        options: ['Rogue (1980)', 'Dwarf Fortress', "No Man's Sky", 'Minecraft'],
        correctIndex: 0,
        explanation:
          'Rogue (1980) — случайно генерируемые подземелья. Отсюда термины "roguelike" и "процедурная генерация".',
      },
      {
        order: 6,
        questionText:
          'Как называется эффект, когда реалистичные, но не вполне человеческие модели вызывают тревогу?',
        options: ['Uncanny Valley', 'Likeness Gap', 'Reality Breach', 'Realism Horror'],
        correctIndex: 0,
        explanation:
          '"Зловещая долина" (Uncanny Valley) — термин робототехника Масахиро Мори. Критична для игровой графики.',
        mediaPrompt: 'Гиперреалистичное лицо персонажа — почти человеческое, но что-то не так.',
      },
      {
        order: 7,
        questionText: 'Что такое "GaaS" в игровой индустрии?',
        options: [
          'Graphics as a Standard',
          'Games as a Service — подписочная модель с постоянными обновлениями',
          'Game AI as Software',
          'Gradual Achievement System',
        ],
        correctIndex: 1,
        explanation:
          'GaaS — бизнес-модель: игра продаётся один раз, но монетизируется годами через DLC, сезонные пропуска.',
      },
      {
        order: 8,
        questionText: 'Какая студия разработала Hollow Knight?',
        options: ['Supergiant Games', 'Team Cherry', 'Ska Studios', 'Motion Twin'],
        correctIndex: 1,
        explanation:
          'Team Cherry — трое разработчиков из Австралии. Hollow Knight (2017) стал инди-хитом.',
      },
      {
        order: 9,
        questionText: 'Что означает "frame data" в файтингах?',
        options: [
          'Количество кадров в секунду',
          'Данные о количестве кадров каждого удара — основа высокоуровневой игры',
          'Скорость загрузки сцены',
          'Частота обновления дисплея',
        ],
        correctIndex: 1,
        explanation:
          'Frame data — количество кадров каждой фазы удара. Без этих данных невозможна профессиональная игра.',
      },
      {
        order: 10,
        questionText: 'Кто из этих разработчиков создал серию Metal Gear Solid?',
        options: ['Тоширо Судзуки', 'Хидэо Кодзима', 'Кэнтаро Миура', 'Синджи Миками'],
        correctIndex: 1,
        explanation: 'Хидэо Кодзима — геймдизайнер, создавший MGS и впоследствии Death Stranding.',
      },
      {
        order: 11,
        questionText: 'Какой жанр описывает Disco Elysium?',
        options: [
          'Тактическая RPG',
          'CRPG с ролевой системой на основе разговоров',
          'Изометрический шутер',
          'Детективная новелла без выборов',
        ],
        correctIndex: 1,
        explanation:
          'Disco Elysium — CRPG без боёв: почти все механики построены на диалогах и внутренних голосах.',
      },
    ],
  },
];
