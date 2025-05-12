const db = require('../config/database');

// Получение списка оборудования
const getEquipment = async (req, res) => {
  try {
    const [equipment] = await db.pool.query(`
      SELECT e.*, u.full_name as owner_name
      FROM equipment e
      LEFT JOIN users u ON e.current_owner = u.id
      ORDER BY e.id DESC
    `);

    res.json(equipment);
  } catch (error) {
    console.error('Error getting equipment:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Получение оборудования по ID
const getEquipmentById = async (req, res) => {
  try {
    const { id } = req.params;

    const [equipment] = await db.pool.query(`
      SELECT e.*, u.full_name as owner_name
      FROM equipment e
      LEFT JOIN users u ON e.current_owner = u.id
      WHERE e.id = ?
    `, [id]);

    if (equipment.length === 0) {
      return res.status(404).json({ error: 'Оборудование не найдено' });
    }

    res.json(equipment[0]);
  } catch (error) {
    console.error('Error getting equipment by id:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Создание нового оборудования
const createEquipment = async (req, res) => {
  try {
    console.log('Received request body:', JSON.stringify(req.body, null, 2));

    const {
      inventory_number,
      type,
      model,
      serial_number,
      uuid,
      manufacturer,
      purchase_date,
      purchase_cost,
      depreciation_period,
      liquidation_value,
      current_owner,
      current_status = 'in_stock',
      description,
      company_id,
      glpi_id
    } = req.body;

    // Проверяем обязательные поля
    if (!type) {
      console.log('Missing required field: type');
      return res.status(400).json({ error: 'Тип оборудования обязателен' });
    }

    if (!inventory_number) {
      console.log('Missing required field: inventory_number');
      return res.status(400).json({ error: 'Инвентарный номер обязателен' });
    }

    if (!model) {
      console.log('Missing required field: model');
      return res.status(400).json({ error: 'Модель обязательна' });
    }

    // Проверяем, существует ли оборудование с таким инвентарным номером
    const [existingEquipment] = await db.pool.query(
      'SELECT id FROM equipment WHERE inventory_number = ?',
      [inventory_number]
    );

    if (existingEquipment.length > 0) {
      console.log('Equipment with this inventory number already exists:', inventory_number);
      return res.status(400).json({ error: 'Оборудование с таким инвентарным номером уже существует' });
    }

    // Преобразуем пустые строки в null для числовых полей
    const currentOwner = current_owner === '' ? null : parseInt(current_owner);
    const companyId = company_id === '' ? null : parseInt(company_id);
    const purchaseCost = purchase_cost === '' ? null : parseFloat(purchase_cost);
    const depreciationPeriod = depreciation_period === '' ? null : parseInt(depreciation_period);
    const liquidationValue = liquidation_value === '' ? null : parseFloat(liquidation_value);

    // Проверяем валидность даты
    let formattedPurchaseDate = null;
    if (purchase_date) {
      try {
        formattedPurchaseDate = new Date(purchase_date).toISOString().split('T')[0];
      } catch (error) {
        console.log('Invalid purchase date:', purchase_date);
        return res.status(400).json({ error: 'Неверный формат даты покупки' });
      }
    }

    // Проверяем валидность статуса
    const validStatuses = ['in_stock', 'in_use', 'in_repair', 'written_off', 'archived'];
    if (!validStatuses.includes(current_status)) {
      console.log('Invalid status:', current_status);
      return res.status(400).json({ error: 'Неверный статус оборудования' });
    }

    // Проверяем длину полей
    if (inventory_number && inventory_number.length > 50) {
      return res.status(400).json({ error: 'Инвентарный номер не должен превышать 50 символов' });
    }
    if (type && type.length > 100) {
      return res.status(400).json({ error: 'Тип не должен превышать 100 символов' });
    }
    if (model && model.length > 100) {
      return res.status(400).json({ error: 'Модель не должна превышать 100 символов' });
    }
    if (serial_number && serial_number.length > 100) {
      return res.status(400).json({ error: 'Серийный номер не должен превышать 100 символов' });
    }
    if (uuid && uuid.length > 100) {
      return res.status(400).json({ error: 'UUID не должен превышать 100 символов' });
    }
    if (manufacturer && manufacturer.length > 100) {
      return res.status(400).json({ error: 'Производитель не должен превышать 100 символов' });
    }
    if (glpi_id && glpi_id.length > 100) {
      return res.status(400).json({ error: 'GLPI ID не должен превышать 100 символов' });
    }

    console.log('Processed values:', {
      inventory_number,
      type,
      model,
      serial_number,
      uuid,
      manufacturer,
      purchase_date: formattedPurchaseDate,
      purchaseCost,
      depreciationPeriod,
      liquidationValue,
      currentOwner,
      current_status,
      description,
      companyId,
      glpi_id
    });

    try {
      // Создаем оборудование
      const [result] = await db.pool.query(
        `INSERT INTO equipment (
          inventory_number, type, model, serial_number, uuid,
          manufacturer, purchase_date, purchase_cost, depreciation_period,
          liquidation_value, current_owner, current_status, description,
          company_id, glpi_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          inventory_number, type, model, serial_number || null, uuid || null,
          manufacturer || null, formattedPurchaseDate, purchaseCost, depreciationPeriod,
          liquidationValue, currentOwner, current_status, description || null,
          companyId, glpi_id || null
        ]
      );

      console.log('Successfully created equipment with ID:', result.insertId);

      res.status(201).json({
        id: result.insertId,
        inventory_number,
        type,
        model,
        serial_number,
        uuid,
        manufacturer,
        purchase_date: formattedPurchaseDate,
        purchase_cost: purchaseCost,
        depreciation_period: depreciationPeriod,
        liquidation_value: liquidationValue,
        current_owner: currentOwner,
        current_status,
        description,
        company_id: companyId,
        glpi_id
      });
    } catch (dbError) {
      console.error('Database error:', {
        message: dbError.message,
        code: dbError.code,
        sqlMessage: dbError.sqlMessage,
        sqlState: dbError.sqlState
      });
      throw dbError;
    }
  } catch (error) {
    console.error('Error creating equipment:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      sqlMessage: error.sqlMessage,
      sqlState: error.sqlState,
      stack: error.stack
    });
    res.status(500).json({ 
      error: 'Ошибка добавления техники', 
      details: error.message,
      sqlMessage: error.sqlMessage
    });
  }
};

// Обновление оборудования
const updateEquipment = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      inventory_number,
      type,
      model,
      serial_number,
      uuid,
      manufacturer,
      purchase_date,
      purchase_cost,
      depreciation_period,
      liquidation_value,
      current_owner,
      current_status,
      description,
      company_id,
      glpi_id
    } = req.body;

    // Проверяем существование оборудования
    const [existingEquipment] = await db.pool.query(
      'SELECT id FROM equipment WHERE id = ?',
      [id]
    );

    if (existingEquipment.length === 0) {
      return res.status(404).json({ error: 'Оборудование не найдено' });
    }

    // Проверяем уникальность инвентарного номера
    const [duplicateEquipment] = await db.pool.query(
      'SELECT id FROM equipment WHERE inventory_number = ? AND id != ?',
      [inventory_number, id]
    );

    if (duplicateEquipment.length > 0) {
      return res.status(400).json({ error: 'Оборудование с таким инвентарным номером уже существует' });
    }

    // Обновляем оборудование
    await db.pool.query(
      `UPDATE equipment SET
        inventory_number = ?,
        type = ?,
        model = ?,
        serial_number = ?,
        uuid = ?,
        manufacturer = ?,
        purchase_date = ?,
        purchase_cost = ?,
        depreciation_period = ?,
        liquidation_value = ?,
        current_owner = ?,
        current_status = ?,
        description = ?,
        company_id = ?,
        glpi_id = ?
      WHERE id = ?`,
      [
        inventory_number, type, model, serial_number, uuid,
        manufacturer, purchase_date, purchase_cost, depreciation_period,
        liquidation_value, current_owner, current_status, description,
        company_id, glpi_id, id
      ]
    );

    res.json({
      id,
      inventory_number,
      type,
      model,
      serial_number,
      uuid,
      manufacturer,
      purchase_date,
      purchase_cost,
      depreciation_period,
      liquidation_value,
      current_owner,
      current_status,
      description,
      company_id,
      glpi_id
    });
  } catch (error) {
    console.error('Error updating equipment:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Удаление оборудования
const deleteEquipment = async (req, res) => {
  try {
    const { id } = req.params;

    // Проверяем существование оборудования
    const [existingEquipment] = await db.pool.query(
      'SELECT id FROM equipment WHERE id = ?',
      [id]
    );

    if (existingEquipment.length === 0) {
      return res.status(404).json({ error: 'Оборудование не найдено' });
    }

    // Удаляем оборудование
    await db.pool.query('DELETE FROM equipment WHERE id = ?', [id]);

    res.json({ message: 'Оборудование успешно удалено' });
  } catch (error) {
    console.error('Error deleting equipment:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  getEquipment,
  getEquipmentById,
  createEquipment,
  updateEquipment,
  deleteEquipment
}; 