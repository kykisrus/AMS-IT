import axios from 'axios';

export const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Добавляем перехватчик для обработки ошибок
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response) {
      // Обработка ошибок от сервера
      console.error('API Error:', error.response.data);
    } else if (error.request) {
      // Обработка ошибок сети
      console.error('Network Error:', error.request);
    } else {
      // Обработка других ошибок
      console.error('Error:', error.message);
    }
    return Promise.reject(error);
  }
); 