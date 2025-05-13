# Руководство по стилю AMS IT System

## Структура маршрутизации

### Основные принципы
1. Все защищенные маршруты должны быть обернуты в `PrivateRoute` и находиться внутри `Layout`
2. Используем вложенные маршруты для лучшей организации кода
3. Все маршруты должны соответствовать структуре меню

### Пример структуры маршрутов
```tsx
<Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
  <Route index element={<Dashboard />} />
  <Route path="equipment" element={<EquipmentList />} />
  <Route path="acts" element={<Acts />} />
  <Route path="acts/create" element={<CreateAct />} />
  <Route path="employees" element={<EmployeesPage />} />
  <Route path="employees/:id" element={<EmployeeCard />} />
  <Route path="users" element={<UsersPage />} />
  <Route path="roles" element={<RolesPage />} />
  <Route path="settings" element={<SettingsPage />} />
  <Route path="system/integration" element={<IntegrationPage />} />
</Route>
```

## Стиль меню

### Основные принципы
1. Используем единообразные названия пунктов меню
2. Группируем связанные пункты меню в подменю
3. Используем иконки Material-UI для визуального представления

### Структура меню
```tsx
const menuItems: MenuItem[] = [
  { text: 'Дашборд', icon: <DashboardIcon />, link: '/' },
  { text: 'Сотрудники', icon: <PeopleIcon />, link: '/employees' },
  { text: 'Техника', icon: <DevicesIcon />, link: '/equipment' },
  { text: 'Акты', icon: <AssignmentIcon />, link: '/acts' },
  { 
    text: 'Система', 
    icon: <SettingsIcon />, 
    subItems: [
      { text: 'Пользователи', icon: <PeopleIcon />, link: '/users' },
      { text: 'Роли', icon: <SecurityIcon />, link: '/roles' },
      { text: 'Настройки', icon: <SettingsIcon />, link: '/settings' },
      { text: 'Интеграции', icon: <ApiIcon />, link: '/system/integration' },
    ]
  },
];
```

## Стиль компонентов

### Основные принципы
1. Используем функциональные компоненты с TypeScript
2. Определяем интерфейсы для пропсов и состояний
3. Используем Material-UI для UI компонентов
4. Применяем единый стиль оформления

### Пример компонента
```tsx
interface Props {
  // Определение пропсов
}

const Component: React.FC<Props> = ({ prop1, prop2 }) => {
  // Логика компонента
  return (
    // JSX
  );
};
```

## Стиль оформления

### Цветовая схема
```tsx
const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#90caf9',
    },
    background: {
      default: '#0a1929',
      paper: '#1a2332',
    },
  },
});
```

### Стили компонентов
1. Используем `sx` prop для стилизации Material-UI компонентов
2. Применяем единые отступы и размеры
3. Используем темную тему по умолчанию

### Пример стилизации
```tsx
<Drawer
  sx={{
    width: drawerWidth,
    flexShrink: 0,
    [`& .MuiDrawer-paper`]: { 
      width: drawerWidth, 
      boxSizing: 'border-box', 
      background: '#1a2332', 
      color: '#fff' 
    },
  }}
>
```

## Организация файлов

### Структура директорий
```
src/
  ├── components/     # Переиспользуемые компоненты
  ├── pages/         # Компоненты страниц
  ├── contexts/      # React контексты
  ├── hooks/         # Пользовательские хуки
  ├── utils/         # Вспомогательные функции
  └── docs/          # Документация
```

### Именование файлов
1. Компоненты: PascalCase (например, `Sidebar.tsx`)
2. Утилиты: camelCase (например, `axios.ts`)
3. Страницы: PascalCase с суффиксом Page (например, `UsersPage.tsx`)

## Типизация

### Основные принципы
1. Используем TypeScript для всех компонентов
2. Определяем интерфейсы для всех пропсов
3. Используем строгую типизацию для состояний

### Пример типизации
```tsx
interface MenuItem {
  text: string;
  icon: React.ReactNode;
  link?: string;
  subItems?: MenuItem[];
}
```

## Обработка ошибок

### Основные принципы
1. Используем try-catch для асинхронных операций
2. Показываем пользователю понятные сообщения об ошибках
3. Логируем ошибки в консоль для отладки

### Пример обработки ошибок
```tsx
try {
  const response = await axios.get('/api/endpoint');
  // Обработка успешного ответа
} catch (error: any) {
  console.error('Error:', error.response?.data || error.message);
  setError(error.response?.data?.error || 'Произошла ошибка');
}
``` 