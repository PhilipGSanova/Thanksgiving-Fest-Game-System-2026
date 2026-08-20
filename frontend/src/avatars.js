import { createElement } from 'react';

// Avatar IDs are stored in the database, so keep these keys stable.
export const AVATARS = Object.fromEntries(
  Array.from({ length: 50 }, (_, index) => {
    const number = index + 1;
    const id = `avatar_${number}`;

    return [
      id,
      `https://api.dicebear.com/9.x/adventurer/svg?seed=avatar-${number}`,
    ];
  }),
);

export function avatarUrl(id) {
  return AVATARS[id] || AVATARS.avatar_1;
}

export function Avatar({ id, className = '' }) {
  return createElement('img', {
    className,
    src: avatarUrl(id),
    alt: '',
    'aria-hidden': true,
  });
}
