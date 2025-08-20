const API_URL = 'https://norma.nomoreparties.space/api';

type RequestOptions = RequestInit & { headers?: HeadersInit };

const ensureBearer = (token?: string | null) =>
  token ? (token.startsWith('Bearer ') ? token : `Bearer ${token}`) : undefined;

// Функция запроса с автоматическим обновлением токена при 401
export const request = async <T>(endpoint: string, options: RequestOptions = {}) => {
  let res = await fetch(`${API_URL}${endpoint}`, options);

  // Если токен истёк, пробуем обновить
  if (res.status === 401 && localStorage.getItem('refreshToken')) {
    const refreshRes = await fetch(`${API_URL}/auth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: localStorage.getItem('refreshToken') })
    });

    if (!refreshRes.ok) {
      throw new Error('Unauthorized');
    }

    const refreshData = await refreshRes.json();

    // Сохраняем новые токены
    localStorage.setItem('refreshToken', refreshData.refreshToken);
    localStorage.setItem('accessToken', refreshData.accessToken);

    // Повторяем исходный запрос с новым токеном (с Bearer)
  const baseHeaders = new Headers(options.headers as HeadersInit);
  baseHeaders.set('Authorization', ensureBearer(refreshData.accessToken) as string);
  options.headers = baseHeaders;

    res = await fetch(`${API_URL}${endpoint}`, options);
  }

  if (!res.ok) {
    let errorText = 'Ошибка запроса';
    try {
      const errorData = await res.json();
      errorText = errorData.message || errorText;
    } catch {}
    throw new Error(errorText);
  }

  return (await res.json()) as T;
};

export const getUserData = () =>
  request(`${'/auth/user'}`, {
    headers: new Headers({
      Authorization: ensureBearer(localStorage.getItem('accessToken')) as string
    })
  });

export const createOrder = (ingredientIds: string[]) =>
  request(`${'/orders'}`, {
    method: 'POST',
    headers: new Headers({
      'Content-Type': 'application/json',
      Authorization: ensureBearer(localStorage.getItem('accessToken')) as string
    }),
    body: JSON.stringify({ ingredients: ingredientIds })
  });

export { API_URL };
