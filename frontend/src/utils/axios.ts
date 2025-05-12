import axios from 'axios';

// Создаем экземпляр axios с базовым URL
const instance = axios.create({
  baseURL: 'http://127.0.0.1:3001',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Добавляем перехватчик для добавления токена к каждому запросу
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Добавляем перехватчик для обработки ошибок
instance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Проверяем, не находимся ли мы уже на странице логина
      if (window.location.pathname !== '/login') {
        // Если токен истек или недействителен, очищаем данные и перенаправляем на страницу входа
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default instance; 