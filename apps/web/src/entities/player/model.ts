export const phoneAvatars = [
  { id: 'avatar-01', label: 'Максим', imageUrl: '/assets/phone/avatar-01.png' },
  { id: 'avatar-02', label: 'Мира', imageUrl: '/assets/phone/avatar-02.png' },
  { id: 'avatar-03', label: 'Лео', imageUrl: '/assets/phone/avatar-03.png' },
  { id: 'avatar-04', label: 'Соня', imageUrl: '/assets/phone/avatar-04.png' },
  { id: 'avatar-05', label: 'Ник', imageUrl: '/assets/phone/avatar-05.png' },
  { id: 'avatar-06', label: 'Виола', imageUrl: '/assets/phone/avatar-06.png' },
  { id: 'avatar-07', label: 'Дэн', imageUrl: '/assets/phone/avatar-07.png' },
  { id: 'avatar-08', label: 'Ася', imageUrl: '/assets/phone/avatar-08.png' },
] as const;

export type PhoneAvatarId = (typeof phoneAvatars)[number]['id'];
