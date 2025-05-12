import React, { useState, useEffect } from 'react';
import { Form, Input, Select, Button, message } from 'antd';
import axios from 'axios';

interface Manager {
  id: number;
  full_name: string;
}

interface AddEmployeeFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const AddEmployeeForm: React.FC<AddEmployeeFormProps> = ({ onSuccess, onCancel }) => {
  const [form] = Form.useForm();
  const [managers, setManagers] = useState<Manager[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchManagers();
  }, []);

  const fetchManagers = async () => {
    try {
      const response = await axios.get('/api/users/managers');
      setManagers(response.data);
    } catch (error) {
      console.error('Error fetching managers:', error);
      message.error('Ошибка при загрузке списка руководителей');
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      setLoading(true);
      await axios.post('/api/employees', values);
      message.success('Сотрудник успешно добавлен');
      onSuccess();
    } catch (error) {
      console.error('Error adding employee:', error);
      message.error('Ошибка при добавлении сотрудника');
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
        name="full_name"
        label="ФИО"
        rules={[{ required: true, message: 'Пожалуйста, введите ФИО' }]}
      >
        <Input />
      </Form.Item>

      <Form.Item
        name="position"
        label="Должность"
        rules={[{ required: true, message: 'Пожалуйста, введите должность' }]}
      >
        <Input />
      </Form.Item>

      <Form.Item
        name="department"
        label="Отдел"
        rules={[{ required: true, message: 'Пожалуйста, введите отдел' }]}
      >
        <Input />
      </Form.Item>

      <Form.Item
        name="company"
        label="Организация"
        rules={[{ required: true, message: 'Пожалуйста, введите организацию' }]}
      >
        <Input />
      </Form.Item>

      <Form.Item
        name="manager_id"
        label="Руководитель"
        rules={[{ required: true, message: 'Пожалуйста, выберите руководителя' }]}
      >
        <Select
          placeholder="Выберите руководителя"
          options={managers.map(manager => ({
            value: manager.id,
            label: manager.full_name
          }))}
        />
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

export default AddEmployeeForm; 