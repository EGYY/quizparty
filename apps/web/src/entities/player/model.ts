export const phoneAvatars = [
  { id: 'avatar-01', label: 'Максим', imageUrl: '/assets/phone/avatar-01.webp' },
  { id: 'avatar-02', label: 'Мира', imageUrl: '/assets/phone/avatar-02.webp' },
  { id: 'avatar-03', label: 'Лео', imageUrl: '/assets/phone/avatar-03.webp' },
  { id: 'avatar-04', label: 'Соня', imageUrl: '/assets/phone/avatar-04.webp' },
  { id: 'avatar-05', label: 'Ник', imageUrl: '/assets/phone/avatar-05.webp' },
  { id: 'avatar-06', label: 'Виола', imageUrl: '/assets/phone/avatar-06.webp' },
  { id: 'avatar-07', label: 'Дэн', imageUrl: '/assets/phone/avatar-07.webp' },
  { id: 'avatar-08', label: 'Ася', imageUrl: '/assets/phone/avatar-08.webp' },
] as const;

export type PhoneAvatarId = (typeof phoneAvatars)[number]['id'];
