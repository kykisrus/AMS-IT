import React, { useState } from 'react';
import styled from '@emotion/styled';
import { Form, Select, InputNumber, Switch, Radio, Tooltip, Button as AntButton } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import {
  ImportType,
  ImportSettings,
  ValidationMode,
  DuplicateHandling,
  LogLevel,
  BatchSizeOption
} from '../../types/import';

interface ImportSettingsStepProps {
  type: ImportType;
  onStart: (settings: ImportSettings) => void;
}

const SettingsContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
`;

const FormSection = styled.div`
  margin-bottom: 30px;
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);

  h3 {
    margin: 0 0 20px;
    color: #333;
  }
`;

const FormItem = styled(Form.Item)`
  margin-bottom: 20px;

  .ant-form-item-label {
    font-weight: 500;
  }

  .description {
    color: #666;
    font-size: 14px;
    margin-top: 4px;
  }
`;

const Button = styled(AntButton)`
  &.ant-btn {
    padding: 10px 20px;
    background-color: #4a90e2;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.2s;

    &:hover {
      background-color: #357abd;
    }
  }
`;

const batchSizeOptions: BatchSizeOption[] = [
  {
    value: 100,
    label: '100 записей',
    description: 'Рекомендуется для небольших файлов'
  },
  {
    value: 500,
    label: '500 записей',
    description: 'Оптимально для средних файлов'
  },
  {
    value: 1000,
    label: '1000 записей',
    description: 'Для больших файлов с простыми данными'
  },
  {
    value: 5000,
    label: '5000 записей',
    description: 'Для очень больших файлов'
  }
];

const ImportSettingsStep: React.FC<ImportSettingsStepProps> = ({ type, onStart }) => {
  const [form] = Form.useForm<ImportSettings>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (values: ImportSettings) => {
    try {
      setIsSubmitting(true);
      await onStart(values);
    } catch (error) {
      console.error('Error starting import:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SettingsContainer>
      <h2>Настройки импорта</h2>
      
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          duplicateHandling: 'skip',
          validationMode: ValidationMode.STRICT,
          logLevel: 'basic',
          batchSize: 500,
          notifyOnComplete: true,
          skipEmptyValues: true
        }}
        onFinish={handleSubmit}
      >
        <FormSection>
          <h3>Обработка данных</h3>
          
          <FormItem
            label={
              <span>
                Режим валидации{' '}
                <Tooltip title="Строгий режим прерывает импорт при любой ошибке. Мягкий режим пропускает ошибочные записи.">
                  <QuestionCircleOutlined />
                </Tooltip>
              </span>
            }
            name="validationMode"
          >
            <Radio.Group>
              <Radio.Button value={ValidationMode.STRICT}>Строгий</Radio.Button>
              <Radio.Button value={ValidationMode.LENIENT}>Мягкий</Radio.Button>
            </Radio.Group>
          </FormItem>

          <FormItem
            label="Обработка дубликатов"
            name="duplicateHandling"
          >
            <Select>
              <Select.Option value="skip">Пропускать</Select.Option>
              <Select.Option value="update">Обновлять</Select.Option>
              <Select.Option value="create_new">Создавать новые</Select.Option>
            </Select>
          </FormItem>

          <FormItem
            label="Размер пакета"
            name="batchSize"
          >
            <Select>
              {batchSizeOptions.map(option => (
                <Select.Option key={option.value} value={option.value}>
                  <div>{option.label}</div>
                  <div className="description">{option.description}</div>
                </Select.Option>
              ))}
            </Select>
          </FormItem>
        </FormSection>

        <FormSection>
          <h3>Дополнительные настройки</h3>
          
          <FormItem
            label="Уровень логирования"
            name="logLevel"
          >
            <Radio.Group>
              <Radio.Button value="basic">Базовый</Radio.Button>
              <Radio.Button value="detailed">Детальный</Radio.Button>
            </Radio.Group>
          </FormItem>

          <FormItem
            label="Пропускать пустые значения"
            name="skipEmptyValues"
            valuePropName="checked"
          >
            <Switch />
          </FormItem>

          <FormItem
            label="Уведомить о завершении"
            name="notifyOnComplete"
            valuePropName="checked"
          >
            <Switch />
          </FormItem>
        </FormSection>

        <Button 
          type="primary"
          htmlType="submit"
          loading={isSubmitting}
        >
          Начать импорт
        </Button>
      </Form>
    </SettingsContainer>
  );
};

export default ImportSettingsStep; 