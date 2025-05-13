#!/bin/bash

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Глобальные переменные для базы данных
DB_USER=""
DB_PASSWORD=""
PROJECT_ROOT="/var/www/html/AMS-IT"

# Функция для проверки и запуска MySQL
check_mysql() {
    echo -e "${YELLOW}Проверка MySQL...${NC}"

    # Проверка статуса MySQL
    if ! systemctl is-active --quiet mysql; then
        echo -e "${YELLOW}MySQL не запущен. Попытка запуска...${NC}"
        sudo systemctl start mysql
        
        if [ $? -ne 0 ]; then
            echo -e "${RED}Не удалось запустить MySQL. Пожалуйста, проверьте установку MySQL${NC}"
            exit 1
        fi
    fi

    # Проверка версии MySQL
    MYSQL_VERSION=$(mysql -V | awk '{print $5}' | cut -d'.' -f1,2)
    if (( $(echo "$MYSQL_VERSION < 8.0" | bc -l) )); then
        echo -e "${RED}Требуется MySQL версии 8.0 или выше. Текущая версия: $MYSQL_VERSION${NC}"
        exit 1
    fi
    
    # Проверка подключения
    if ! mysql -u"$DB_USER" -p"$DB_PASSWORD" -e "SELECT 1" >/dev/null 2>&1; then
        echo -e "${RED}Не удалось подключиться к MySQL. Проверьте учетные данные и права доступа${NC}"
        exit 1
    fi

    # Настройка кодировки
    mysql -u"$DB_USER" -p"$DB_PASSWORD" -e "SET GLOBAL character_set_server = 'utf8mb4';"
    mysql -u"$DB_USER" -p"$DB_PASSWORD" -e "SET GLOBAL collation_server = 'utf8mb4_unicode_ci';"

    echo -e "${GREEN}MySQL работает корректно${NC}"
}

# Функция для настройки npm
setup_npm() {
    echo -e "${YELLOW}Настройка npm...${NC}"
    
    # Переход в корневую директорию проекта
    cd "$PROJECT_ROOT" || exit 1
    
    # Создание директории для глобальных пакетов
    mkdir -p ~/.npm-global
    
    # Настройка npm для использования новой директории
    npm config set prefix '~/.npm-global'
    
    # Добавление пути в .bashrc если его там нет
    if ! grep -q "export PATH=~/.npm-global/bin:\$PATH" ~/.bashrc; then
        echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
    fi
    
    # Обновление PATH для текущей сессии
    export PATH=~/.npm-global/bin:$PATH
    
    # Установка основных зависимостей
    echo -e "${YELLOW}Установка основных зависимостей...${NC}"
    npm install --save \
        express@4.18.2 \
        cors@2.8.5 \
        dotenv@16.4.5 \
        mysql2@3.9.2 \
        jsonwebtoken@9.0.2 \
        bcryptjs@2.4.3 \
        antd@5.15.0 \
        body-parser@1.20.2 \
        multer@1.4.5-lts.1 \
        helmet@7.1.0 \
        morgan@1.10.0
    
    # Установка dev-зависимостей
    echo -e "${YELLOW}Установка dev-зависимостей...${NC}"
    npm install --save-dev \
        concurrently@8.2.2 \
        nodemon@3.1.0 \
        eslint@8.57.0 \
        prettier@3.2.5
    
    # Исправление прав доступа для npm
    sudo chown -R $USER:$(id -gn $USER) ~/.npm-global
    sudo chown -R $USER:$(id -gn $USER) ~/.config
    
    # Обновление package.json для использования локальных пакетов
    npm pkg set scripts.dev="nodemon backend/server.js"
    npm pkg set scripts.client="cd frontend && npm start"
    npm pkg set scripts."dev:full"="concurrently \"npm run dev\" \"npm run client\""
    
    echo -e "${GREEN}Настройка npm завершена${NC}"
}

# Функция для удаления базы данных
remove_database() {
    echo -e "${YELLOW}Удаление существующей базы данных (если есть)...${NC}"
    mysql -u"$DB_USER" -p"$DB_PASSWORD" -e "DROP DATABASE IF EXISTS ams_it;"
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}База данных ams_it удалена (или не существовала)${NC}"
    else
        echo -e "${RED}Ошибка при удалении базы данных${NC}"
        exit 1
    fi
}

# Функция для настройки базы данных
setup_database() {
    echo -e "${YELLOW}Настройка базы данных...${NC}"

    # Проверка наличия MySQL
    if ! command -v mysql &> /dev/null; then
        echo -e "${RED}MySQL не установлен. Пожалуйста, установите MySQL 8.0 или выше${NC}"
        exit 1
    fi

    # Проверка существования .env файла
    if [ -f "$PROJECT_ROOT/.env" ]; then
        echo -e "${YELLOW}Найден существующий .env файл${NC}"
        # Чтение существующих данных из .env
        DB_USER=$(grep DB_USER "$PROJECT_ROOT/.env" | cut -d'=' -f2)
        DB_PASSWORD=$(grep DB_PASSWORD "$PROJECT_ROOT/.env" | cut -d'=' -f2)
        
        # Запрос на удаление базы данных
        read -p "Хотите удалить существующую базу данных? (y/N): " delete_db
        if [[ $delete_db =~ ^[Yy]$ ]]; then
            echo -e "${YELLOW}Удаление существующей базы данных...${NC}"
            remove_database
        fi
    else
        # Запрос учетных данных MySQL
        read -p "Введите имя пользователя MySQL: " mysql_user
        read -s -p "Введите пароль MySQL: " mysql_password
        echo

        # Установка глобальных переменных
        DB_USER="$mysql_user"
        DB_PASSWORD="$mysql_password"
    fi

    # Проверка MySQL
    check_mysql

    # Удаление базы данных, если она существует
    remove_database

    # Создание базы данных и таблиц
    echo "Создание базы данных и таблиц..."
    mysql -u "$DB_USER" -p"$DB_PASSWORD" < "$PROJECT_ROOT/backend/database/setup.sql"

    if [ $? -ne 0 ]; then
        echo -e "${RED}Ошибка при создании базы данных${NC}"
        exit 1
    fi

    # Создание .env файла только если его нет
    if [ ! -f "$PROJECT_ROOT/.env" ]; then
        setup_config
    fi

    echo -e "${GREEN}База данных успешно настроена${NC}"
}

# Функция для настройки frontend
setup_frontend() {
    echo "Настройка frontend..."
    cd frontend

    # Удаляем существующие node_modules и package-lock.json
    rm -rf node_modules package-lock.json

    # Создаем базовый package.json
    cat > package.json << EOF
{
  "name": "ams-it-frontend",
  "version": "0.1.0",
  "private": true,
  "dependencies": {
    "react": "18.2.0",
    "react-dom": "18.2.0",
    "react-scripts": "5.0.1",
    "typescript": "4.9.5",
    "@mui/material": "5.15.10",
    "@mui/icons-material": "5.15.10",
    "@mui/lab": "5.0.0-alpha.165",
    "@emotion/react": "11.11.3",
    "@emotion/styled": "11.11.0",
    "axios": "1.6.7",
    "react-router-dom": "6.22.1",
    "antd": "5.15.0",
    "@ant-design/icons": "5.3.0",
    "react-chartjs-2": "5.2.0",
    "chart.js": "4.4.1",
    "web-vitals": "3.5.2",
    "@testing-library/react": "14.2.1",
    "date-fns": "3.3.1",
    "formik": "2.4.5",
    "yup": "1.3.3",
    "@tanstack/react-query": "5.20.5"
  },
  "devDependencies": {
    "@types/node": "20.11.19",
    "@types/react": "18.2.55",
    "@types/react-dom": "18.2.19",
    "@types/react-router-dom": "5.3.3",
    "@types/jest": "29.5.12",
    "@testing-library/jest-dom": "6.4.2",
    "@mui/types": "7.2.4",
    "@typescript-eslint/eslint-plugin": "7.0.2",
    "@typescript-eslint/parser": "7.0.2",
    "eslint-config-prettier": "9.1.0",
    "eslint-plugin-react": "7.33.2",
    "eslint-plugin-react-hooks": "4.6.0"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  },
  "eslintConfig": {
    "extends": [
      "react-app"
    ]
  },
  "browserslist": {
    "production": [
      ">0.2%",
      "not dead",
      "not op_mini all"
    ],
    "development": [
      "last 1 chrome version",
      "last 1 firefox version",
      "last 1 safari version"
    ]
  }
}
EOF

    # Устанавливаем зависимости
    echo "Установка зависимостей frontend..."
    npm install

    # Создаем tsconfig.json с правильными настройками
    cat > tsconfig.json << EOF
{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noFallthroughCasesInSwitch": true,
    "module": "esnext",
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "baseUrl": "src",
    "noImplicitAny": false,
    "typeRoots": [
      "./node_modules/@types",
      "./node_modules/@mui/types"
    ],
    "paths": {
      "@mui/material/*": ["./node_modules/@mui/material/*"],
      "@mui/icons-material/*": ["./node_modules/@mui/icons-material/*"]
    }
  },
  "include": ["src"]
}
EOF

    # Создаем .env файл для frontend
    cat > .env << EOF
REACT_APP_API_URL=http://localhost:3001
REACT_APP_ENV=development
EOF

    cd ..
    echo "Frontend настроен"
}

# Функция для настройки конфигурации
setup_config() {
    echo -e "${YELLOW}Настройка конфигурации...${NC}"

    # Генерация JWT секрета
    JWT_SECRET=$(openssl rand -base64 32)
    
    # Обновление .env файла
    cat > "$PROJECT_ROOT/.env" << EOL
# Настройки базы данных
DB_HOST=localhost
DB_USER=$DB_USER
DB_PASSWORD=$DB_PASSWORD
DB_NAME=ams_it

# Настройки JWT
JWT_SECRET=$JWT_SECRET

# Настройки сервера
PORT=3001
NODE_ENV=development

# Настройки безопасности
CORS_ORIGIN=http://localhost:3000
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
SECURITY_HEADERS=true

# Настройки загрузки файлов
UPLOAD_DIR=uploads
MAX_FILE_SIZE=5242880
EOL
    
    # Создание директории для загрузки файлов
    mkdir -p "$PROJECT_ROOT/uploads"
    chmod 755 "$PROJECT_ROOT/uploads"
    
    echo -e "${GREEN}Конфигурация успешно настроена${NC}"
}

# Функция для настройки прав доступа
setup_permissions() {
    echo -e "${YELLOW}Настройка прав доступа...${NC}"
    
    # Получаем текущего пользователя
    CURRENT_USER=$(whoami)
    CHOWN_USER="$CURRENT_USER:$CURRENT_USER"
    
    # Устанавливаем права на все файлы и папки
    echo -e "${YELLOW}Установка владельца файлов: $CHOWN_USER${NC}"
    sudo chown -R $CHOWN_USER "$PROJECT_ROOT"
    
    # Устанавливаем права на выполнение для скриптов
    find "$PROJECT_ROOT" -type f -name "*.sh" -exec chmod +x {} \;
    
    # Устанавливаем права на запись для папок
    find "$PROJECT_ROOT" -type d -exec chmod 755 {} \;
    
    # Устанавливаем права на запись для файлов
    find "$PROJECT_ROOT" -type f -exec chmod 644 {} \;
    
    # Устанавливаем права на node_modules и package-lock.json
    if [ -d "$PROJECT_ROOT/node_modules" ]; then
        sudo chown -R $CHOWN_USER "$PROJECT_ROOT/node_modules"
        sudo chmod -R 755 "$PROJECT_ROOT/node_modules"
    fi
    
    if [ -d "$PROJECT_ROOT/frontend/node_modules" ]; then
        sudo chown -R $CHOWN_USER "$PROJECT_ROOT/frontend/node_modules"
        sudo chmod -R 755 "$PROJECT_ROOT/frontend/node_modules"
    fi
    
    # Устанавливаем права на package-lock.json
    if [ -f "$PROJECT_ROOT/package-lock.json" ]; then
        sudo chown $CHOWN_USER "$PROJECT_ROOT/package-lock.json"
        sudo chmod 644 "$PROJECT_ROOT/package-lock.json"
    fi
    
    if [ -f "$PROJECT_ROOT/frontend/package-lock.json" ]; then
        sudo chown $CHOWN_USER "$PROJECT_ROOT/frontend/package-lock.json"
        sudo chmod 644 "$PROJECT_ROOT/frontend/package-lock.json"
    fi
    
    echo -e "${GREEN}Права доступа настроены${NC}"
}

# Функция для проверки версии Node.js
check_node_version() {
    local version=$(node -v | cut -d'v' -f2)
    local major=$(echo $version | cut -d'.' -f1)
    if [ "$major" -lt 18 ]; then
        echo -e "${RED}Требуется Node.js версии 18.x или выше. Текущая версия: $version${NC}"
        exit 1
    fi
    echo -e "${GREEN}Node.js версия $version - OK${NC}"
}

# Функция для очистки node_modules
clean_node_modules() {
    echo -e "${YELLOW}Очистка существующих node_modules...${NC}"
    
    # Очистка корневой директории
    if [ -d "$PROJECT_ROOT/node_modules" ]; then
        rm -rf "$PROJECT_ROOT/node_modules"
        rm -f "$PROJECT_ROOT/package-lock.json"
    fi
    
    # Очистка frontend
    if [ -d "$PROJECT_ROOT/frontend/node_modules" ]; then
        rm -rf "$PROJECT_ROOT/frontend/node_modules"
        rm -f "$PROJECT_ROOT/frontend/package-lock.json"
    fi
    
    # Очистка backend
    if [ -d "$PROJECT_ROOT/backend/node_modules" ]; then
        rm -rf "$PROJECT_ROOT/backend/node_modules"
        rm -f "$PROJECT_ROOT/backend/package-lock.json"
    fi
    
    echo -e "${GREEN}Очистка завершена${NC}"
}

# Основной процесс установки
echo -e "${YELLOW}Начало установки AMS-IT...${NC}"

# Проверка версии Node.js
check_node_version

# Очистка существующих node_modules
clean_node_modules

# Настройка npm
setup_npm

# Настройка базы данных
setup_database

# Настройка frontend
setup_frontend

# Настройка прав доступа
setup_permissions

echo -e "${GREEN}Установка AMS-IT завершена успешно!${NC}"
echo -e "${YELLOW}Для запуска приложения выполните:${NC}"
echo -e "cd $PROJECT_ROOT && npm run dev:full"
