/** REST-маршруты бэкенда. Используется web-клиентом для построения URL запросов.
 *  Динамические маршруты — функции, принимающие id. */
export const API_ROUTES = {
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    me: '/auth/me',
  },
  quizzes: {
    list: '/quizzes',
    approved: '/quizzes/approved',
    approvedDetail: (quizId: string) => `/quizzes/approved/${quizId}`,
    detail: (quizId: string) => `/quizzes/${quizId}`,
    create: '/quizzes',
    update: (quizId: string) => `/quizzes/${quizId}`,
    submitForReview: (quizId: string) => `/quizzes/${quizId}/submit-review`,
    uploadCover: (quizId: string) => `/quizzes/${quizId}/cover`,
  },
  rooms: {
    create: '/rooms',
    detail: (roomCode: string) => `/rooms/${roomCode}`,
  },
  admin: {
    dashboard: '/admin/dashboard',
    reviewQueue: '/admin/review',
    reviewDecision: (quizId: string) => `/admin/review/${quizId}/decision`,
  },
  media: {
    upload: '/media',
    list: '/media',
  },
} as const;
