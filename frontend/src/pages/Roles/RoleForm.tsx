import React from 'react';
import { Form, Input, Button, Select, message } from 'antd';
import axios from '../../utils/axios';
import { useAuth } from '../../contexts/AuthContext';

interface RoleFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  initialValues?: {
    id: number;
    name: string;
    description: string;
    permissions: string[];
  } | null;
}

const RoleForm: React.FC<RoleFormProps> = ({ onSuccess, onCancel, initialValues }) => {
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
        // Редактирование существующей роли
        await axios.put(`/api/roles/${initialValues.id}`, values, { headers });
        message.success('Роль успешно обновлена');
      } else {
        // Создание новой роли
        const response = await axios.post('/api/roles', values, { headers });
        console.log('Create role response:', response.data);
        message.success('Роль успешно создана');
      }
      
      form.resetFields();
      onSuccess();
    } catch (error: any) {
      console.error('Error submitting form:', error);
      console.error('Error response:', error.response?.data);
      message.error(error.response?.data?.error || 'Произошла ошибка при сохранении роли');
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
        name="name"
        label="Название"
        rules={[{ required: true, message: 'Пожалуйста, введите название роли' }]}
      >
        <Input />
      </Form.Item>

      <Form.Item
        name="description"
        label="Описание"
        rules={[{ required: true, message: 'Пожалуйста, введите описание роли' }]}
      >
        <Input.TextArea rows={3} />
      </Form.Item>

      <Form.Item
        name="permissions"
        label="Разрешения"
        rules={[{ required: true, message: 'Пожалуйста, выберите разрешения' }]}
      >
        <Select mode="multiple">
          <Select.Option value="users.view">Просмотр пользователей</Select.Option>
          <Select.Option value="users.create">Создание пользователей</Select.Option>
          <Select.Option value="users.edit">Редактирование пользователей</Select.Option>
          <Select.Option value="users.delete">Удаление пользователей</Select.Option>
          <Select.Option value="roles.view">Просмотр ролей</Select.Option>
          <Select.Option value="roles.create">Создание ролей</Select.Option>
          <Select.Option value="roles.edit">Редактирование ролей</Select.Option>
          <Select.Option value="roles.delete">Удаление ролей</Select.Option>
        </Select>
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit" block>
          {initialValues ? 'Сохранить' : 'Создать'}
        </Button>
      </Form.Item>
    </Form>
  );
};

export default RoleForm; 