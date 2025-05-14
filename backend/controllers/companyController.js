const db = require('../config/database');

const getCompanies = async (req, res) => {
  try {
    const [companies] = await db.query('SELECT id, name, phone, email, website, logo_url, mol_id FROM companies ORDER BY name');
    res.json(companies);
  } catch (error) {
    console.error('Error getting companies:', error);
    res.status(500).json({ error: 'Ошибка при получении списка организаций' });
  }
};

const createCompany = async (req, res) => {
  try {
    const { name, phone, email, website, mol_id, logo_url } = req.body;
    if (!name || !mol_id) {
      return res.status(400).json({ error: 'Название и МОЛ обязательны' });
    }
    // Проверка: mol_id должен иметь право is_mol
    const [molCheck] = await db.query(
      `SELECT 1 FROM users u JOIN roles r ON u.role = r.name WHERE u.id = ? AND JSON_CONTAINS(r.permissions, '"is_mol"')`,
      [mol_id]
    );
    if (molCheck.length === 0) {
      return res.status(400).json({ error: 'Указанный пользователь не является МОЛ' });
    }
    await db.query(
      'INSERT INTO companies (name, phone, email, website, mol_id, logo_url) VALUES (?, ?, ?, ?, ?, ?)',
      [name, phone || null, email || null, website || null, mol_id, logo_url || null]
    );
    res.status(201).json({ message: 'Организация создана' });
  } catch (error) {
    console.error('Error creating company:', error);
    res.status(500).json({ error: 'Ошибка при создании организации' });
  }
};

const updateCompany = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, phone, email, website, mol_id, logo_url } = req.body;
    if (!name || !mol_id) {
      return res.status(400).json({ error: 'Название и МОЛ обязательны' });
    }
    // Проверка: mol_id должен иметь право is_mol
    const [molCheck] = await db.query(
      `SELECT 1 FROM users u JOIN roles r ON u.role = r.name WHERE u.id = ? AND JSON_CONTAINS(r.permissions, '"is_mol"')`,
      [mol_id]
    );
    if (molCheck.length === 0) {
      return res.status(400).json({ error: 'Указанный пользователь не является МОЛ' });
    }
    await db.query(
      'UPDATE companies SET name = ?, phone = ?, email = ?, website = ?, mol_id = ?, logo_url = ? WHERE id = ?',
      [name, phone || null, email || null, website || null, mol_id, logo_url || null, id]
    );
    res.json({ message: 'Организация обновлена' });
  } catch (error) {
    console.error('Error updating company:', error);
    res.status(500).json({ error: 'Ошибка при обновлении организации' });
  }
};

module.exports = { getCompanies, createCompany, updateCompany }; 