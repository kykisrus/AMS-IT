const pool = require('../config/database');

const getDashboardMetrics = async (req, res) => {
  try {
    // Получаем количество техники по статусам
    const equipmentCounts = await pool.query(`
      SELECT 
        COUNT(CASE WHEN current_status = 'in_use' THEN 1 END) as equipment_in_use,
        COUNT(CASE WHEN current_status = 'in_repair' THEN 1 END) as equipment_in_repair,
        COUNT(CASE WHEN current_status = 'written_off' THEN 1 END) as equipment_written_off
      FROM equipment
    `);

    // Получаем количество неподписанных актов
    const unsignedActs = await pool.query(`
      SELECT COUNT(*) as count
      FROM transfer_acts
      WHERE status = 'created'
    `);

    // Получаем затраты на ремонты за последний месяц
    const repairCosts = await pool.query(`
      SELECT 
        DATE(created_at) as date,
        SUM(cost) as total_cost
      FROM repairs
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 1 MONTH)
      GROUP BY DATE(created_at)
      ORDER BY date
    `);

    // Получаем последние события
    const recentEvents = await pool.query(`
      SELECT 
        ta.id,
        ta.created_at as date,
        u.full_name as employee,
        'transfer' as type,
        ta.status,
        e.inventory_number as equipment
      FROM transfer_acts ta
      JOIN users u ON ta.created_by = u.id
      JOIN equipment e ON ta.equipment_id = e.id
      ORDER BY ta.created_at DESC
      LIMIT 5
    `);

    // Получаем текущие ремонты
    const currentRepairs = await pool.query(`
      SELECT 
        r.id,
        e.inventory_number as equipment,
        r.created_at as date,
        r.status
      FROM repairs r
      JOIN equipment e ON r.equipment_id = e.id
      WHERE r.status IN ('in_repair', 'waiting_conclusion')
      ORDER BY r.created_at DESC
      LIMIT 5
    `);

    res.json({
      metrics: {
        equipmentInUse: parseInt(equipmentCounts.rows[0].equipment_in_use) || 0,
        equipmentInRepair: parseInt(equipmentCounts.rows[0].equipment_in_repair) || 0,
        equipmentWrittenOff: parseInt(equipmentCounts.rows[0].equipment_written_off) || 0,
        unsignedActs: parseInt(unsignedActs.rows[0].count) || 0,
        repairCosts: {
          labels: repairCosts.rows.map(row => new Date(row.date).toLocaleDateString()),
          data: repairCosts.rows.map(row => parseFloat(row.total_cost) || 0)
        }
      },
      recentEvents: recentEvents.rows.map(row => ({
        id: row.id,
        date: new Date(row.date).toLocaleDateString(),
        employee: row.employee,
        type: row.type,
        status: row.status === 'created' ? 'pending' : 'completed',
        equipment: row.equipment
      })),
      currentRepairs: currentRepairs.rows.map(row => ({
        id: row.id,
        equipment: row.equipment,
        date: new Date(row.date).toLocaleDateString(),
        status: row.status
      }))
    });
  } catch (error) {
    console.error('Ошибка при получении метрик дашборда:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
};

module.exports = {
  getDashboardMetrics
}; 