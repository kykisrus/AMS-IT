import React from 'react';
import { Form, Input, Button, Select, message } from 'antd';
import axios from '../../utils/axios';
import { useAuth } from '../../contexts/AuthContext';

interface AddUserFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  initialValues?: {
    id: number;
    full_name: string;
    email: string;
    login: string;
    role: string;
  } | null;
}

const AddUserForm: React.FC<AddUserFormProps> = ({ onSuccess, onCancel, initialValues }) => {
  const [form] = Form.useForm();
  const { token } = useAuth();

  React.useEffect(() => {
    if (initialValues) {
      form.setFieldsValue(initialValues);
    }
  }, [initialValues, form]);

  const handleSubmit = async (values: any) => {
    try {
      console.log('Submitting form with values:', values);
      console.log('Token:', token);

      const headers = {
        Authorization: `Bearer ${token}`
      };

      if (initialValues) {
        // Редактирование существующего пользователя
        await axios.put(`/api/users/${initialValues.id}`, values, { headers });
        message.success('Пользователь успешно обновлен');
      } else {
        // Создание нового пользователя
        const response = await axios.post('/api/users', values, { headers });
        console.log('Create user response:', response.data);
        message.success('Пользователь успешно создан');
      }
      
      form.resetFields();
      onSuccess();
    } catch (error: any) {
      console.error('Error submitting form:', error);
      console.error('Error response:', error.response?.data);
      message.error(error.response?.data?.error || 'Произошла ошибка при сохранении пользователя');
    }
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
      initialValues={initialValues || {}}
    >
      <Form.Item
        name="full_name"
        label="ФИО"
        rules={[{ required: true, message: 'Пожалуйста, введите ФИО' }]}
      >
        <Input />
      </Form.Item>

      <Form.Item
        name="login"
        label="Логин"
        rules={[
          { required: true, message: 'Пожалуйста, введите логин' },
          { min: 3, message: 'Логин должен содержать минимум 3 символа' }
        ]}
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
        name="role"
        label="Роль"
        rules={[{ required: true, message: 'Пожалуйста, выберите роль' }]}
      >
        <Select>
          <Select.Option value="admin">Администратор</Select.Option>
          <Select.Option value="office_manager">Руководитель в офисе</Select.Option>
          <Select.Option value="employee">Сотрудник</Select.Option>
        </Select>
      </Form.Item>

      {!initialValues && (
        <Form.Item
          name="password"
          label="Пароль"
          rules={[{ required: true, message: 'Пожалуйста, введите пароль' }]}
        >
          <Input.Password />
        </Form.Item>
      )}

      <Form.Item>
        <Button type="primary" htmlType="submit" block>
          {initialValues ? 'Сохранить' : 'Создать'}
        </Button>
      </Form.Item>
    </Form>
  );
};

export default AddUserForm; 