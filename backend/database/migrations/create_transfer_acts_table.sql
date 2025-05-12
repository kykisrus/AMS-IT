CREATE TABLE IF NOT EXISTS transfer_acts (
  id INT PRIMARY KEY AUTO_INCREMENT,
  equipment_id INT NOT NULL,
  from_user_id INT,
  to_user_id INT,
  created_by INT NOT NULL,
  status ENUM('created', 'signed', 'completed', 'cancelled') DEFAULT 'created',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (equipment_id) REFERENCES equipment(id) ON DELETE CASCADE,
  FOREIGN KEY (from_user_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (to_user_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
); 