const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { auth, checkRole } = require('../middleware/auth');

// Получить список техники
router.get('/', auth, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM equipment ORDER BY id DESC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка получения техники' });
  }
});

// Добавить новую технику
router.post('/', auth, checkRole(['super_admin', 'it_specialist']), async (req, res) => {
  try {
    const {
      inventory_number, type, serial_number, uuid, model, manufacturer,
      purchase_date, purchase_cost, depreciation_period, liquidation_value,
      current_status, current_owner, description, company_id, glpi_id
    } = req.body;
    const [result] = await db.query(
      `INSERT INTO equipment (inventory_number, type, serial_number, uuid, model, manufacturer, purchase_date, purchase_cost, depreciation_period, liquidation_value, current_status, current_owner, description, company_id, glpi_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)` ,
      [inventory_number, type, serial_number, uuid, model, manufacturer, purchase_date, purchase_cost, depreciation_period, liquidation_value, current_status, current_owner, description, company_id, glpi_id]
    );
    res.status(201).json({ id: result.insertId });
  } catch (error) {
    console.error('Error adding equipment:', error);
    res.status(500).json({ error: 'Ошибка добавления техники', details: error.message });
  }
});

// Обновить технику
router.put('/:id', auth, checkRole(['super_admin', 'it_specialist']), async (req, res) => {
  try {
    const id = req.params.id;
    const {
      inventory_number, serial_number, uuid, model, manufacturer,
      purchase_date, purchase_cost, depreciation_period, liquidation_value,
      current_status, current_owner_id, company_id, glpi_id
    } = req.body;
    await db.query(
      `UPDATE equipment SET inventory_number=?, serial_number=?, uuid=?, model=?, manufacturer=?, purchase_date=?, purchase_cost=?, depreciation_period=?, liquidation_value=?, current_status=?, current_owner_id=?, company_id=?, glpi_id=? WHERE id=?`,
      [inventory_number, serial_number, uuid, model, manufacturer, purchase_date, purchase_cost, depreciation_period, liquidation_value, current_status, current_owner_id, company_id, glpi_id, id]
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Ошибка обновления техники' });
  }
});

// Удалить технику
router.delete('/:id', auth, checkRole(['super_admin', 'it_specialist']), async (req, res) => {
  try {
    const id = req.params.id;
    await db.query('DELETE FROM equipment WHERE id=?', [id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Ошибка удаления техники' });
  }
});

module.exports = router; 