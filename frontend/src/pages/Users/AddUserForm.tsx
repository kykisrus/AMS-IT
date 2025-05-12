import React, { useState } from 'react';
import { Form, Input, Select, Button, message } from 'antd';
import axios from 'axios';

interface AddUserFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const AddUserForm: React.FC<AddUserFormProps> = ({ onSuccess, onCancel }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values: any) => {
    try {
      setLoading(true);
      await axios.post('/api/users', values);
      message.success('Пользователь успешно добавлен');
      onSuccess();
    } catch (error) {
      console.error('Error adding user:', error);
      message.error('Ошибка при добавлении пользователя');
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
        name="email"
        label="Email"
        rules={[
          { required: true, message: 'Пожалуйста, введите email' },
          { type: 'email', message: 'Введите корректный email' }
        ]}
      >
        <Input />
      </Form.Item>

      <Form.Item
        name="password"
        label="Пароль"
        rules={[{ required: true, message: 'Пожалуйста, введите пароль' }]}
      >
        <Input.Password />
      </Form.Item>

      <Form.Item
        name="role"
        label="Роль"
        rules={[{ required: true, message: 'Пожалуйста, выберите роль' }]}
      >
        <Select
          placeholder="Выберите роль"
          options={[
            { value: 'admin', label: 'Администратор' },
            { value: 'office_manager', label: 'Руководитель в офисе' },
            { value: 'employee', label: 'Сотрудник' }
          ]}
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

export default AddUserForm; 