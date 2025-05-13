const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { checkRole } = require('../middleware/auth');

// Получение списка актов
router.get('/', auth, async (req, res) => {
  try {
    const [acts] = await req.db.query(`
      SELECT 
        a.id,
        a.number,
        a.date,
        a.type,
        a.status,
        CONCAT(u.last_name, ' ', u.first_name) as created_by,
        COUNT(e.id) as equipment_count,
        SUM(e.cost) as total_cost
      FROM acts a
      LEFT JOIN users u ON a.created_by = u.id
      LEFT JOIN act_equipment ae ON a.id = ae.act_id
      LEFT JOIN equipment e ON ae.equipment_id = e.id
      GROUP BY a.id
      ORDER BY a.date DESC
    `);

    res.json({ acts });
  } catch (error) {
    console.error('Error fetching acts:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Генерация номера акта
const generateActNumber = (type) => {
  const prefix = type === 'transfer' ? 'ПП' : type === 'repair' ? 'РЕМ' : 'СПИ';
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${prefix}-${date}-${random}`;
};

// Создание нового акта
router.post('/', auth, checkRole(['super_admin', 'it_specialist', 'mol']), async (req, res) => {
  try {
    const { type, equipment_ids } = req.body;
    
    // Генерация номера акта
    const newNumber = generateActNumber(type);

    // Создание акта
    const [result] = await req.db.query(
      'INSERT INTO acts (number, date, type, status, created_by) VALUES (?, NOW(), ?, ?, ?)',
      [newNumber, type, 'draft', req.user.id]
    );

    // Добавление техники в акт
    if (equipment_ids && equipment_ids.length > 0) {
      const values = equipment_ids.map(equipment_id => [result.insertId, equipment_id]);
      await req.db.query(
        'INSERT INTO act_equipment (act_id, equipment_id) VALUES ?',
        [values]
      );
    }

    res.status(201).json({ 
      message: 'Act created successfully',
      act_id: result.insertId,
      number: newNumber
    });
  } catch (error) {
    console.error('Error creating act:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Получение акта по ID
router.get('/:id', auth, async (req, res) => {
  try {
    const [acts] = await req.db.query(`
      SELECT 
        a.*,
        CONCAT(u.last_name, ' ', u.first_name) as created_by,
        GROUP_CONCAT(e.id) as equipment_ids,
        GROUP_CONCAT(e.name) as equipment_names,
        GROUP_CONCAT(e.inventory_number) as inventory_numbers,
        GROUP_CONCAT(e.cost) as costs
      FROM acts a
      LEFT JOIN users u ON a.created_by = u.id
      LEFT JOIN act_equipment ae ON a.id = ae.act_id
      LEFT JOIN equipment e ON ae.equipment_id = e.id
      WHERE a.id = ?
      GROUP BY a.id
    `, [req.params.id]);

    if (acts.length === 0) {
      return res.status(404).json({ error: 'Act not found' });
    }

    const act = acts[0];
    
    // Преобразование строк с разделителями в массивы
    if (act.equipment_ids) {
      act.equipment = act.equipment_ids.split(',').map((id, index) => ({
        id: parseInt(id),
        name: act.equipment_names.split(',')[index],
        inventory_number: act.inventory_numbers.split(',')[index],
        cost: parseFloat(act.costs.split(',')[index])
      }));
    } else {
      act.equipment = [];
    }

    // Удаление временных полей
    delete act.equipment_ids;
    delete act.equipment_names;
    delete act.inventory_numbers;
    delete act.costs;

    res.json({ act });
  } catch (error) {
    console.error('Error fetching act:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Обновление акта
router.put('/:id', auth, checkRole(['super_admin', 'it_specialist', 'mol']), async (req, res) => {
  try {
    const { type, equipment_ids, status } = req.body;
    const actId = req.params.id;

    // Проверка существования акта
    const [acts] = await req.db.query('SELECT status FROM acts WHERE id = ?', [actId]);
    if (acts.length === 0) {
      return res.status(404).json({ error: 'Act not found' });
    }

    // Проверка возможности редактирования
    if (acts[0].status !== 'draft') {
      return res.status(400).json({ error: 'Can only edit draft acts' });
    }

    // Обновление акта
    await req.db.query(
      'UPDATE acts SET type = ?, status = ? WHERE id = ?',
      [type, status || 'draft', actId]
    );

    // Обновление списка техники
    if (equipment_ids) {
      await req.db.query('DELETE FROM act_equipment WHERE act_id = ?', [actId]);
      if (equipment_ids.length > 0) {
        const values = equipment_ids.map(equipment_id => [actId, equipment_id]);
        await req.db.query(
          'INSERT INTO act_equipment (act_id, equipment_id) VALUES ?',
          [values]
        );
      }
    }

    res.json({ message: 'Act updated successfully' });
  } catch (error) {
    console.error('Error updating act:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Удаление акта
router.delete('/:id', auth, checkRole(['super_admin', 'it_specialist', 'mol']), async (req, res) => {
  try {
    const actId = req.params.id;

    // Проверка существования акта
    const [acts] = await req.db.query('SELECT status FROM acts WHERE id = ?', [actId]);
    if (acts.length === 0) {
      return res.status(404).json({ error: 'Act not found' });
    }

    // Проверка возможности удаления
    if (acts[0].status !== 'draft') {
      return res.status(400).json({ error: 'Can only delete draft acts' });
    }

    // Удаление связей с техникой
    await req.db.query('DELETE FROM act_equipment WHERE act_id = ?', [actId]);
    
    // Удаление акта
    await req.db.query('DELETE FROM acts WHERE id = ?', [actId]);

    res.json({ message: 'Act deleted successfully' });
  } catch (error) {
    console.error('Error deleting act:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router; 