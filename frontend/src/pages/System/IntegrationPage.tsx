import React from 'react';
import { Card, Typography, Space, Button, Alert } from 'antd';
import { ApiOutlined, SyncOutlined } from '@ant-design/icons';

const { Title, Paragraph } = Typography;

const IntegrationPage: React.FC = () => {
  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>Интеграция с внешними системами</Title>

      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Card title="GLPI" extra={<Button type="primary" icon={<SyncOutlined />}>Проверить соединение</Button>}>
          <Space direction="vertical" style={{ width: '100%' }}>
            <Alert
              message="Интеграция с GLPI"
              description="Настройте параметры подключения к системе GLPI для автоматической синхронизации данных о сотрудниках и оборудовании."
              type="info"
              showIcon
              icon={<ApiOutlined />}
            />
            <Paragraph>
              Для настройки интеграции с GLPI необходимо указать:
            </Paragraph>
            <ul>
              <li>URL сервера GLPI</li>
              <li>API токен для доступа</li>
              <li>Периодичность синхронизации</li>
            </ul>
            <Button type="primary" disabled>
              Настроить интеграцию
            </Button>
          </Space>
        </Card>

        <Card title="Другие системы" extra={<Button type="primary" icon={<SyncOutlined />}>Проверить соединение</Button>}>
          <Space direction="vertical" style={{ width: '100%' }}>
            <Alert
              message="Дополнительные интеграции"
              description="В будущем здесь будут доступны интеграции с другими системами."
              type="info"
              showIcon
              icon={<ApiOutlined />}
            />
            <Paragraph>
              Планируемые интеграции:
            </Paragraph>
            <ul>
              <li>Система учета рабочего времени</li>
              <li>Система управления проектами</li>
              <li>Система документооборота</li>
            </ul>
          </Space>
        </Card>
      </Space>
    </div>
  );
};

export default IntegrationPage; 