/** Usuario persistido en localStorage tras el login */
export type StoredUser = {
  id?: string;
  userId?: string;
  role?: string;
  name?: string;
  userData?: { name?: string };
};

export function getStoredUserId(user: StoredUser | null | undefined): string | undefined {
  return user?.userId ?? user?.id;
}

/** Normaliza id/userId para compatibilidad con respuestas antiguas del backend */
export function normalizeStoredUser(user: StoredUser): StoredUser {
  const userId = user.userId ?? user.id;
  if (!userId) return user;
  return { ...user, userId, id: userId };
}

export function parseStoredUser(): StoredUser | null {
  const raw = localStorage.getItem('user');
  if (!raw) return null;
  try {
    return normalizeStoredUser(JSON.parse(raw) as StoredUser);
  } catch {
    return null;
  }
}

export function saveStoredUser(user: StoredUser): void {
  localStorage.setItem('user', JSON.stringify(normalizeStoredUser(user)));
}
