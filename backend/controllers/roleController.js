const db = require('../config/database');

// Получение списка ролей
const getRoles = async (req, res) => {
  try {
    const [roles] = await db.query(
      'SELECT id, name, description, permissions, is_manager, is_mol FROM roles ORDER BY name'
    );
    
    // Преобразуем строку permissions в массив
    const formattedRoles = roles.map(role => ({
      ...role,
      permissions: role.permissions ? JSON.parse(role.permissions) : [],
      is_manager: !!role.is_manager,
      is_mol: !!role.is_mol
    }));
    
    res.json(formattedRoles);
  } catch (error) {
    console.error('Error fetching roles:', error);
    res.status(500).json({ error: 'Ошибка при получении списка ролей' });
  }
};

// Создание новой роли
const createRole = async (req, res) => {
  const { name, description, permissions, is_manager, is_mol } = req.body;

  try {
    // Проверка существования роли
    const [existingRoles] = await db.query('SELECT id FROM roles WHERE name = ?', [name]);
    if (existingRoles.length > 0) {
      return res.status(400).json({ error: 'Роль с таким названием уже существует' });
    }

    // Создание роли
    const [result] = await db.query(
      'INSERT INTO roles (name, description, permissions, is_manager, is_mol) VALUES (?, ?, ?, ?, ?)',
      [name, description, JSON.stringify(permissions), is_manager ? 1 : 0, is_mol ? 1 : 0]
    );

    res.status(201).json({
      id: result.insertId,
      name,
      description,
      permissions,
      is_manager: !!is_manager,
      is_mol: !!is_mol
    });
  } catch (error) {
    console.error('Error creating role:', error);
    res.status(500).json({ error: 'Ошибка при создании роли' });
  }
};

// Обновление роли
const updateRole = async (req, res) => {
  const { id } = req.params;
  const { name, description, permissions, is_manager, is_mol } = req.body;

  try {
    // Проверка существования роли
    const [existingRoles] = await db.query('SELECT id FROM roles WHERE id = ?', [id]);
    if (existingRoles.length === 0) {
      return res.status(404).json({ error: 'Роль не найдена' });
    }

    // Проверка уникальности названия
    const [nameCheck] = await db.query(
      'SELECT id FROM roles WHERE name = ? AND id != ?',
      [name, id]
    );
    if (nameCheck.length > 0) {
      return res.status(400).json({ error: 'Роль с таким названием уже существует' });
    }

    // Обновление роли
    await db.query(
      'UPDATE roles SET name = ?, description = ?, permissions = ?, is_manager = ?, is_mol = ? WHERE id = ?',
      [name, description, JSON.stringify(permissions), is_manager ? 1 : 0, is_mol ? 1 : 0, id]
    );

    res.json({ id, name, description, permissions, is_manager: !!is_manager, is_mol: !!is_mol });
  } catch (error) {
    console.error('Error updating role:', error);
    res.status(500).json({ error: 'Ошибка при обновлении роли' });
  }
};

// Удаление роли
const deleteRole = async (req, res) => {
  const { id } = req.params;

  try {
    // Проверка существования роли
    const [existingRoles] = await db.query('SELECT id FROM roles WHERE id = ?', [id]);
    if (existingRoles.length === 0) {
      return res.status(404).json({ error: 'Роль не найдена' });
    }

    // Проверка использования роли
    const [usersWithRole] = await db.query('SELECT id FROM users WHERE role = ?', [id]);
    if (usersWithRole.length > 0) {
      return res.status(400).json({ error: 'Невозможно удалить роль, так как она используется пользователями' });
    }

    // Удаление роли
    await db.query('DELETE FROM roles WHERE id = ?', [id]);

    res.json({ message: 'Роль успешно удалена' });
  } catch (error) {
    console.error('Error deleting role:', error);
    res.status(500).json({ error: 'Ошибка при удалении роли' });
  }
};

module.exports = {
  getRoles,
  createRole,
  updateRole,
  deleteRole
}; 