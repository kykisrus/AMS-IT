import React, { useState, useEffect } from 'react';
import { Form, Input, Select, Button, message } from 'antd';
import axios from '../../utils/axios';

interface AddEquipmentFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

interface Employee {
  id: number;
  full_name: string;
}

const AddEquipmentForm: React.FC<AddEquipmentFormProps> = ({ onSuccess, onCancel }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await axios.get('/api/employees');
      setEmployees(response.data);
    } catch (error) {
      console.error('Error fetching employees:', error);
      message.error('Ошибка при загрузке списка сотрудников');
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      setLoading(true);
      await axios.post('/api/equipment', values);
      message.success('Техника успешно добавлена');
      onSuccess();
    } catch (error) {
      console.error('Error adding equipment:', error);
      message.error('Ошибка при добавлении техники');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
    >
      <Form.Item
        name="inventory_number"
        label="Инвентарный номер"
        rules={[{ required: true, message: 'Пожалуйста, введите инвентарный номер' }]}
      >
        <Input />
      </Form.Item>

      <Form.Item
        name="type"
        label="Тип техники"
        rules={[{ required: true, message: 'Пожалуйста, выберите тип техники' }]}
      >
        <Select
          placeholder="Выберите тип техники"
          options={[
            { value: 'laptop', label: 'Ноутбук' },
            { value: 'desktop', label: 'Стационарный компьютер' },
            { value: 'monitor', label: 'Монитор' },
            { value: 'printer', label: 'Принтер' },
            { value: 'other', label: 'Другое' }
          ]}
        />
      </Form.Item>

      <Form.Item
        name="model"
        label="Модель"
        rules={[{ required: true, message: 'Пожалуйста, введите модель' }]}
      >
        <Input />
      </Form.Item>

      <Form.Item
        name="serial_number"
        label="Серийный номер"
        rules={[{ required: true, message: 'Пожалуйста, введите серийный номер' }]}
      >
        <Input />
      </Form.Item>

      <Form.Item
        name="current_owner"
        label="Текущий владелец"
      >
        <Select
          placeholder="Выберите владельца"
          allowClear
          options={employees.map(employee => ({
            value: employee.id,
            label: employee.full_name
          }))}
        />
      </Form.Item>

      <Form.Item
        name="description"
        label="Описание"
      >
        <Input.TextArea rows={4} />
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit" loading={loading}>
          Добавить
        </Button>
        <Button style={{ marginLeft: 8 }} onClick={onCancel}>
          Отмена
        </Button>
      </Form.Item>
    </Form>
  );
};

export default AddEquipmentForm; 