import React from 'react';
import { Layout, Menu } from 'antd';
import {
  UserOutlined,
  SettingOutlined,
  TeamOutlined,
  ApiOutlined
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';

const { Sider } = Layout;

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      key: 'users',
      icon: <UserOutlined />,
      label: 'Пользователи',
      onClick: () => navigate('/users')
    },
    {
      key: 'employees',
      icon: <TeamOutlined />,
      label: 'Сотрудники',
      onClick: () => navigate('/employees')
    },
    {
      key: 'system',
      icon: <SettingOutlined />,
      label: 'Система',
      children: [
        {
          key: 'settings',
          label: 'Настройки',
          onClick: () => navigate('/system/settings')
        },
        {
          key: 'integration',
          label: 'Интеграция',
          onClick: () => navigate('/system/integration')
        }
      ]
    }
  ];

  const getSelectedKeys = () => {
    const path = location.pathname;
    if (path.startsWith('/users')) return ['users'];
    if (path.startsWith('/employees')) return ['employees'];
    if (path.startsWith('/system/settings')) return ['system', 'settings'];
    if (path.startsWith('/system/integration')) return ['system', 'integration'];
    return [];
  };

  return (
    <Sider width={200} theme="light">
      <Menu
        mode="inline"
        selectedKeys={getSelectedKeys()}
        defaultOpenKeys={['system']}
        style={{ height: '100%', borderRight: 0 }}
        items={menuItems}
      />
    </Sider>
  );
};

export default Sidebar; 