CREATE TABLE IF NOT EXISTS repairs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  equipment_id INT NOT NULL,
  description TEXT NOT NULL,
  repair_cost DECIMAL(10,2) DEFAULT 0.00,
  status ENUM('in_repair', 'waiting_conclusion', 'completed', 'cancelled') DEFAULT 'in_repair',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (equipment_id) REFERENCES equipment(id) ON DELETE CASCADE
); 