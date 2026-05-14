# QuizParty 🎉

Мультиплеерная викторина для вечеринок: телевизор показывает вопросы, участники отвечают с телефона.

---

## Архитектура монорепо

```
quizparty/
├── apps/
│   ├── backend/          # NestJS API + WebSocket + BullMQ (Node.js)
│   ├── web/              # Vite + React — веб-контроллер для телефона + admin-панель
│   └── tv/               # React Native tvOS / Android TV — экран на телевизоре
└── packages/
    └── shared/           # Zod-схемы, enum'ы событий, общие типы (используется всеми приложениями)
```

### Стек

| Слой        | Технологии                                                         |
| ----------- | ------------------------------------------------------------------ |
| **Backend** | NestJS 11, Prisma 6, PostgreSQL 16, Redis 7, Socket.IO 4, BullMQ 5 |
| **Web**     | Vite 8, React 19, TanStack Query 5, Zustand 5, Framer Motion 12    |
| **TV**      | React Native tvOS (`react-native-tvos` 0.83), React Navigation 7   |
| **Shared**  | TypeScript 5.8, Zod 3                                              |
| **Tooling** | pnpm 9 workspaces, ESLint 9, Prettier 3                            |

### Архитектурные слои (FSD)

Все три приложения организованы по Feature-Sliced Design:

```
shared → entities → features → widgets → pages
```

---

## Быстрый старт

### 1. Зависимости

```bash
pnpm install
```

### 2. Переменные окружения

```bash
cp .env.example .env
```

Содержимое `.env` по умолчанию для локальной разработки:

```dotenv
DATABASE_URL=postgresql://quizparty:quizparty@127.0.0.1:5433/quizparty?schema=public
REDIS_URL=redis://localhost:6379
JWT_ACCESS_SECRET=replace-me-with-a-long-secret
JWT_REFRESH_SECRET=replace-me-with-a-different-long-secret
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=30d
```

> Postgres поднимается на порту `5433` (чтобы не конфликтовать с локальным `5432`).

### 3. Запуск инфраструктуры (Docker)

```bash
pnpm docker:up      # PostgreSQL + Redis в фоне
pnpm docker:ps      # проверить статус контейнеров
```

### 4. Подготовка базы данных

```bash
pnpm server:setup   # db:generate + db:migrate + db:seed
```

Или по шагам:

```bash
pnpm db:generate    # Prisma Client
pnpm db:migrate     # применить миграции
pnpm db:seed        # загрузить демо-квизы
```

### 5. Запуск приложений

```bash
# Терминал 1 — бэкенд
pnpm dev:backend

# Терминал 2 — веб
pnpm dev:web
```

| Сервис          | URL                           |
| --------------- | ----------------------------- |
| Backend API     | `http://localhost:3001/api`   |
| Socket.IO lobby | `http://localhost:3001/lobby` |
| Socket.IO game  | `http://localhost:3001/game`  |
| Телефон (join)  | `http://localhost:5173`       |
| Admin-панель    | `http://localhost:5173/admin` |

Тестовые учётные данные admin: `admin@quizparty.local` / `local-dev`

---

## TV-приложение (React Native)

### iOS / tvOS

```bash
cd apps/tv/ios
bundle install
bundle exec pod install   # установить CocoaPods-зависимости
cd ../../..

pnpm --filter @quizparty/tv start             # Metro
pnpm --filter @quizparty/tv ios:tvos          # симулятор Apple TV 4K
pnpm --filter @quizparty/tv ios:tvos:1080p    # симулятор 1080p
```

### Android TV

```bash
pnpm --filter @quizparty/tv start             # Metro
pnpm --filter @quizparty/tv android:tv        # Android TV-эмулятор или устройство
```

---

## Полезные команды

```bash
# Проверки качества кода
pnpm typecheck          # TypeScript по всему монорепо
pnpm lint               # ESLint по всему монорепо
pnpm lint:fix           # автоисправление ESLint
pnpm format             # Prettier — форматирование
pnpm format:check       # Prettier — только проверка

# Docker
pnpm docker:up          # поднять PostgreSQL + Redis
pnpm docker:down        # остановить контейнеры
pnpm docker:logs        # логи в реальном времени
pnpm docker:ps          # статус сервисов

# База данных
pnpm db:generate        # сгенерировать Prisma Client
pnpm db:migrate         # накатить миграции
pnpm db:seed            # заполнить демо-данными
pnpm db:studio          # открыть Prisma Studio
```

---

## Структура backend

```
apps/backend/
├── src/
│   ├── auth/            # JWT (access + httpOnly refresh), guard'ы
│   ├── quiz/            # CRUD квизов, одобрение, категории
│   ├── room/            # Создание комнат, лобби, Socket.IO namespace /lobby
│   ├── game/            # Игровой цикл, namespace /game, BullMQ-таймеры
│   └── admin/           # Маршруты под /admin с token-защитой
└── prisma/
    ├── schema.prisma
    ├── migrations/
    └── seed.ts
```

## Структура web

```
apps/web/src/
├── app/                 # провайдеры, роутер
├── pages/               # LazyLoad страницы
├── widgets/             # составные UI-блоки
├── features/            # действия (join, answer, react…)
├── entities/            # Quiz, Player, Room модели + UI
└── shared/              # api, hooks, ui-kit, конфиг
```

## Структура TV

```
apps/tv/src/
├── app/                 # навигация (Stack), провайдеры
├── pages/               # Home, Lobby, Game
├── widgets/             # QrPanel, PlayerRoster, RoundTimer…
├── features/            # create-room
├── entities/            # Player, Question, Round, Room
└── shared/              # api, assets, config, ui-kit
```
