import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Descriptions, Table, Tag, Button, Spin } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import axios from 'axios';

interface Act {
  id: number;
  act_number: string;
  type: string;
  status: string;
  date: string;
  equipment: string;
}

interface Employee {
  id: number;
  full_name: string;
  position: string;
  department: string;
  company: string;
  manager: {
    id: number;
    full_name: string;
  };
  equipment: string[];
}

const EmployeeCard: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [acts, setActs] = useState<Act[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEmployeeData = useCallback(async () => {
    try {
      const [employeeResponse, actsResponse] = await Promise.all([
        axios.get(`/api/employees/${id}`),
        axios.get(`/api/employees/${id}/acts`)
      ]);
      setEmployee(employeeResponse.data);
      setActs(actsResponse.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching employee data:', error);
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchEmployeeData();
  }, [fetchEmployeeData]);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'draft':
        return 'default';
      case 'signed':
        return 'success';
      case 'unsigned':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status.toLowerCase()) {
      case 'draft':
        return 'Черновик';
      case 'signed':
        return 'Подписан';
      case 'unsigned':
        return 'Не подписан';
      default:
        return status;
    }
  };

  const columns = [
    {
      title: 'Номер акта',
      dataIndex: 'act_number',
      key: 'act_number',
    },
    {
      title: 'Тип',
      dataIndex: 'type',
      key: 'type',
    },
    {
      title: 'Статус',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>
          {getStatusText(status)}
        </Tag>
      ),
    },
    {
      title: 'Дата',
      dataIndex: 'date',
      key: 'date',
    },
    {
      title: 'Оборудование',
      dataIndex: 'equipment',
      key: 'equipment',
    },
  ];

  if (loading) {
    return <Spin size="large" />;
  }

  if (!employee) {
    return <div>Сотрудник не найден</div>;
  }

  return (
    <div style={{ padding: '24px' }}>
      <Button
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate('/employees')}
        style={{ marginBottom: '16px' }}
      >
        Назад к списку
      </Button>

      <Card title="Информация о сотруднике" style={{ marginBottom: '24px' }}>
        <Descriptions bordered>
          <Descriptions.Item label="ФИО">{employee.full_name}</Descriptions.Item>
          <Descriptions.Item label="Должность">{employee.position}</Descriptions.Item>
          <Descriptions.Item label="Отдел">{employee.department}</Descriptions.Item>
          <Descriptions.Item label="Организация">{employee.company}</Descriptions.Item>
          <Descriptions.Item label="Руководитель">{employee.manager.full_name}</Descriptions.Item>
        </Descriptions>
      </Card>

      <Card title="Используемое оборудование" style={{ marginBottom: '24px' }}>
        {employee.equipment.map((item, index) => (
          <Tag key={index} style={{ margin: '4px' }}>{item}</Tag>
        ))}
      </Card>

      <Card title="Акты">
        <Table
          columns={columns}
          dataSource={acts}
          rowKey="id"
          pagination={false}
        />
      </Card>
    </div>
  );
};

export default EmployeeCard; 