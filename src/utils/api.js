const API_URL = 'https://norma.nomoreparties.space/api';

// Функция запроса с автоматическим обновлением токена при 401
const request = async (endpoint, options = {}) => {
  let res = await fetch(`${API_URL}${endpoint}`, options);

  // Если токен истёк, пробуем обновить
  if (res.status === 401 && localStorage.getItem('refreshToken')) {
    console.warn('Токен устарел, пробуем обновить...');
    const refreshRes = await fetch(`${API_URL}/auth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: localStorage.getItem('refreshToken') })
    });

    if (!refreshRes.ok) {
      console.error('Не удалось обновить токен');
      throw new Error('Unauthorized');
    }

    const refreshData = await refreshRes.json();

    // Сохраняем новые токены
    localStorage.setItem('accessToken', refreshData.accessToken);
    localStorage.setItem('refreshToken', refreshData.refreshToken);

    // Повторяем исходный запрос с новым токеном
    options.headers = {
      ...options.headers,
      Authorization: refreshData.accessToken
    };

    res = await fetch(`${API_URL}${endpoint}`, options);
  }

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || 'Ошибка запроса');
  }

  return res.json();
};

// Пример запроса к /auth/user
export const getUserData = () =>
  request('/auth/user', {
    headers: {
      Authorization: localStorage.getItem('accessToken')
    }
  });

// Пример запроса оформления заказа
export const createOrder = (ingredientIds) =>
  request('/orders', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: localStorage.getItem('accessToken')
    },
    body: JSON.stringify({ ingredients: ingredientIds })
  });

export { request, API_URL };
