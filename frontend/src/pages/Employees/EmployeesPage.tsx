import React, { useState, useEffect } from 'react';
import {
  Table,
  Input,
  Space,
  Button,
  Modal,
  message,
  Card,
  Tag,
  Tooltip
} from 'antd';
import { SearchOutlined, UserAddOutlined, ImportOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AddEmployeeForm from './AddEmployeeForm';
import './EmployeesPage.css';

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

const EmployeesPage: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await axios.get('/api/employees');
      setEmployees(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching employees:', error);
      setLoading(false);
    }
  };

  const handleAddEmployee = () => {
    setIsAddModalVisible(true);
  };

  const handleImportClick = () => {
    message.info('Функция импорта будет доступна после интеграции с GLPI');
  };

  const handleAddSuccess = () => {
    setIsAddModalVisible(false);
    fetchEmployees();
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      sorter: (a: Employee, b: Employee) => a.id - b.id,
    },
    {
      title: 'ФИО',
      dataIndex: 'full_name',
      key: 'full_name',
      sorter: (a: Employee, b: Employee) => a.full_name.localeCompare(b.full_name),
    },
    {
      title: 'Должность',
      dataIndex: 'position',
      key: 'position',
      sorter: (a: Employee, b: Employee) => a.position.localeCompare(b.position),
    },
    {
      title: 'Отдел',
      dataIndex: 'department',
      key: 'department',
      sorter: (a: Employee, b: Employee) => a.department.localeCompare(b.department),
    },
    {
      title: 'Организация',
      dataIndex: 'company',
      key: 'company',
      sorter: (a: Employee, b: Employee) => a.company.localeCompare(b.company),
    },
    {
      title: 'Руководитель',
      dataIndex: ['manager', 'full_name'],
      key: 'manager',
      sorter: (a: Employee, b: Employee) => 
        a.manager.full_name.localeCompare(b.manager.full_name),
    },
    {
      title: 'Оборудование',
      dataIndex: 'equipment',
      key: 'equipment',
      render: (equipment: string[]) => equipment.join(', '),
    },
    {
      title: 'Действия',
      key: 'actions',
      render: (_: any, record: Employee) => (
        <Button type="link" onClick={() => navigate(`/employees/${record.id}`)}>
          Подробнее
        </Button>
      ),
    },
  ];

  const filteredEmployees = employees.filter(employee =>
    Object.values(employee).some(value =>
      String(value).toLowerCase().includes(searchText.toLowerCase())
    )
  );

  return (
    <div className="employees-page">
      <Card title="Сотрудники" className="employees-card">
        <Space className="employees-filters" style={{ marginBottom: 16 }}>
          <Input
            placeholder="Поиск..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchText(e.target.value)}
            style={{ width: 200 }}
          />
          <Button
            type="primary"
            icon={<UserAddOutlined />}
            onClick={handleAddEmployee}
          >
            Добавить сотрудника
          </Button>
          <Tooltip title="Будет доступно после интеграции с GLPI">
            <Button
              icon={<ImportOutlined />}
              onClick={handleImportClick}
              disabled
            >
              Импорт из GLPI
            </Button>
          </Tooltip>
        </Space>

        <Table
          columns={columns}
          dataSource={filteredEmployees}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total: number) => `Всего ${total} сотрудников`,
          }}
        />
      </Card>

      <Modal
        title="Добавление сотрудника"
        open={isAddModalVisible}
        onCancel={() => setIsAddModalVisible(false)}
        footer={null}
        width={600}
      >
        <AddEmployeeForm
          onSuccess={handleAddSuccess}
          onCancel={() => setIsAddModalVisible(false)}
        />
      </Modal>
    </div>
  );
};

export default EmployeesPage; 