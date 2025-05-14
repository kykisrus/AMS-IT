## Запуск сервера с логированием

Для запуска backend с логированием в файл logs/server.log используйте:

```bash
npm run dev:log
```

Для одновременного запуска backend с логированием и frontend используйте:

```bash
npm run dev:full-log
```

Все логи будут сохраняться в папку logs, файл server.log. Это удобно для мониторинга работы сервера в фоновом режиме. 

## Работа с ролями и разрешениями

### Структура таблицы `roles`

| Поле         | Тип данных     | Описание                        |
|--------------|----------------|----------------------------------|
| `id`         | INT            | Уникальный ID                   |
| `name`       | VARCHAR(50)    | Название роли                   |
| `description`| VARCHAR(255)   | Описание роли                   |
| `permissions`| TEXT           | JSON-массив разрешений          |

### Пример разрешений

```json
[
  "users.view",
  "users.create",
  "users.edit",
  "users.delete",
  "roles.view",
  "roles.create",
  "roles.edit",
  "roles.delete"
]
```

### Как задаются разрешения
- В интерфейсе создания/редактирования роли используется список чекбоксов (Material-UI Checkbox).
- Можно выбрать любое количество разрешений для роли.
- Список разрешений можно расширять в файле `permissionsList` в компоненте формы ролей.

### Рекомендации по расширению
- Для добавления новых разрешений добавьте их в массив `permissionsList` в `RoleForm.tsx`.
- Для проверки разрешений на сервере используйте массив из поля `permissions` роли пользователя.

### Пример кода чекбоксов (React + Material-UI)
```tsx
<FormGroup>
  {permissionsList.map((perm) => (
    <FormControlLabel
      key={perm.value}
      control={
        <Checkbox
          checked={permissions.includes(perm.value)}
          onChange={() => handlePermissionChange(perm.value)}
          value={perm.value}
        />
      }
      label={perm.label}
    />
  ))}
</FormGroup>
```

### Примечание
- Все стили и компоненты соответствуют гайдлайнам проекта (Material-UI, тёмная тема).
- Для хранения разрешений используется JSON-массив в поле `permissions` таблицы `roles`. 

### Специальные разрешения: "Является руководителем" и "Может быть МОЛ"

- Разрешения `is_manager` (Является руководителем) и `is_mol` (Может быть МОЛ) теперь являются обычными разрешениями и добавляются в массив `permissions` роли.
- Для назначения этих прав используйте соответствующие чекбоксы в общем списке разрешений при создании или редактировании роли.
- Если в массиве разрешений роли присутствует `is_manager`, пользователи с этой ролью могут быть выбраны как руководители.
- Если присутствует `is_mol`, пользователи с этой ролью могут быть выбраны как МОЛ.
- Эти разрешения обрабатываются наравне с остальными (например, `users.view`, `roles.edit` и т.д.).

**Пример массива разрешений для роли МОЛ:**
```json
[
  "is_mol",
  "users.view",
  "users.edit"
]
```

### Триггер проверки МОЛ в базе данных

- В базе данных реализован триггер `check_mol_role`, который не позволяет создать или обновить организацию с пользователем, не имеющим права `is_mol` в своей роли.
- Проверка идёт по JSON-массиву permissions в таблице roles.
- Если у выбранного пользователя нет права `is_mol`, операция будет прервана с ошибкой.

**SQL-триггер:**
```sql
DROP TRIGGER IF EXISTS check_mol_role;
DELIMITER //
CREATE TRIGGER check_mol_role 
BEFORE INSERT ON companies
FOR EACH ROW
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM users u
    JOIN roles r ON u.role = r.name
    WHERE u.id = NEW.mol_id
      AND JSON_CONTAINS(r.permissions, '"is_mol"')
  ) THEN
    SIGNAL SQLSTATE '45000' 
    SET MESSAGE_TEXT = 'Указанный пользователь не является МОЛ';
  END IF;
END;//
DELIMITER ;
``` 