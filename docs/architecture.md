# Архитектура AMS IT System

## Общее описание
AMS IT System - это веб-приложение для управления актами приёма-передачи техники, с учётом активов, ремонтов и уведомлений.

## Технологический стек

### Backend
- Node.js (Express)
- MySQL
- JWT для аутентификации
- bcryptjs для хеширования паролей

### Frontend
- React
- TypeScript
- Material-UI (MUI)
- React Router для навигации

## Структура базы данных

### Основные таблицы
- users - пользователи системы
- companies - компании
- equipment - техника
- transfer_acts - акты передачи
- repairs - ремонты
- notifications - уведомления
- document_templates - шаблоны документов

## Роли пользователей
- super_admin - супер-администратор
- it_specialist - ИТ-специалист
- mol - материально ответственное лицо
- accountant - бухгалтер
- repair_commission - комиссия по ремонту
- inventory_commission - инвентаризационная комиссия

## API Endpoints

### Аутентификация
- POST /api/auth/login - вход в систему
- POST /api/auth/register - регистрация (только для первого пользователя)

### Техника
- GET /api/equipment - получение списка техники
- POST /api/equipment - добавление техники
- PUT /api/equipment/:id - обновление техники
- DELETE /api/equipment/:id - удаление техники

### Dashboard
- GET /api/dashboard/counts - получение статистики 