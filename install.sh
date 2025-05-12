#!/bin/bash

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

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
    
    # Проверка подключения
    if ! mysql -u"$DB_USER" -p"$DB_PASSWORD" -e "SELECT 1" >/dev/null 2>&1; then
        echo -e "${RED}Не удалось подключиться к MySQL. Проверьте учетные данные и права доступа${NC}"
        exit 1
    fi

    echo -e "${GREEN}MySQL работает корректно${NC}"
}

# Функция для настройки npm
setup_npm() {
    echo -e "${YELLOW}Настройка npm...${NC}"
    
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
    
    # Установка глобальных зависимостей локально в проект
    echo -e "${YELLOW}Установка необходимых пакетов...${NC}"
    npm install concurrently nodemon --save-dev
    
    # Исправление прав доступа для npm
    sudo chown -R $USER:$(id -gn $USER) ~/.npm-global
    sudo chown -R $USER:$(id -gn $USER) ~/.config
    
    # Обновление package.json для использования локальных пакетов
    npm pkg set scripts.dev="nodemon backend/server.js"
    npm pkg set scripts.client="cd frontend && npm start"
    npm pkg set scripts."dev:full"="concurrently \"npm run dev\" \"npm run client\""
    
    echo -e "${GREEN}Настройка npm завершена${NC}"
}

# Функция для настройки базы данных
setup_database() {
    echo -e "${YELLOW}Настройка базы данных...${NC}"

    # Проверка наличия MySQL
    if ! command -v mysql &> /dev/null; then
        echo -e "${RED}MySQL не установлен. Пожалуйста, установите MySQL 8.0 или выше${NC}"
        exit 1
    fi

    # Запрос учетных данных MySQL
    read -p "Введите имя пользователя MySQL (по умолчанию: root): " DB_USER
    DB_USER=${DB_USER:-root}
    
    read -sp "Введите пароль MySQL: " DB_PASSWORD
    echo
    
    # Проверка и запуск MySQL
    check_mysql
    
    # Создание базы данных
    echo -e "${YELLOW}Создание базы данных...${NC}"
    mysql -u"$DB_USER" -p"$DB_PASSWORD" -e "CREATE DATABASE IF NOT EXISTS ams_it CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
    
    if [ $? -ne 0 ]; then
        echo -e "${RED}Ошибка при создании базы данных${NC}"
        exit 1
    fi
    
    # Импорт схемы базы данных
    echo -e "${YELLOW}Импорт схемы базы данных...${NC}"
    if [ -f "database/init.sql" ]; then
        mysql -u"$DB_USER" -p"$DB_PASSWORD" ams_it < database/init.sql
    else
        echo -e "${RED}Файл init.sql не найден в директории database/${NC}"
        exit 1
    fi
    
    # Сохранение учетных данных в .env
    sed -i "s/DB_USER=.*/DB_USER=$DB_USER/" .env
    sed -i "s/DB_PASSWORD=.*/DB_PASSWORD=$DB_PASSWORD/" .env
    
    echo -e "${GREEN}База данных успешно настроена${NC}"
}

# Функция для настройки frontend
setup_frontend() {
    echo -e "${YELLOW}Настройка frontend...${NC}"
    cd frontend
    
    # Очистка node_modules
    rm -rf node_modules package-lock.json
    
    # Обновление package.json
    npm pkg set dependencies.typescript="^4.9.5"
    npm pkg set dependencies.react="^18.2.0"
    npm pkg set dependencies.react-dom="^18.2.0"
    npm pkg set dependencies."@types/react"="^18.2.0"
    npm pkg set dependencies."@types/react-dom"="^18.2.0"
    npm pkg set dependencies.ajv="^8.12.0"
    npm pkg set dependencies."ajv-keywords"="^5.1.0"
    
    # Установка зависимостей
    npm install --legacy-peer-deps
    
    cd ..
    echo -e "${GREEN}Frontend настроен${NC}"
}

# Функция для настройки конфигурации
setup_config() {
    echo -e "${YELLOW}Настройка конфигурации...${NC}"

    # Генерация JWT секрета
    JWT_SECRET=$(openssl rand -base64 32)
    
    # Обновление .env файла
    cat > .env << EOL
# Настройки базы данных
DB_HOST=localhost
DB_USER=$DB_USER
DB_PASSWORD=$DB_PASSWORD
DB_NAME=ams_it

# Настройки JWT
JWT_SECRET=$JWT_SECRET

# Настройки сервера
PORT=3001
EOL
    
    echo -e "${GREEN}Конфигурация успешно настроена${NC}"
}

# Функция для настройки прав доступа
setup_permissions() {
    echo -e "${YELLOW}Настройка прав доступа...${NC}"
    
    # Получаем текущего пользователя
    CURRENT_USER=$(whoami)
    
    # Если скрипт запущен от root, используем www-data
    if [ "$CURRENT_USER" = "root" ]; then
        CHOWN_USER="www-data:www-data"
    else
        CHOWN_USER="$CURRENT_USER:$CURRENT_USER"
    fi
    
    # Устанавливаем права на все файлы и папки
    echo -e "${YELLOW}Установка владельца файлов: $CHOWN_USER${NC}"
    sudo chown -R $CHOWN_USER .
    
    # Устанавливаем права на выполнение для скриптов
    find . -type f -name "*.sh" -exec chmod +x {} \;
    
    # Устанавливаем права на запись для папок
    find . -type d -exec chmod 755 {} \;
    
    # Устанавливаем права на запись для файлов
    find . -type f -exec chmod 644 {} \;
    
    # Устанавливаем права на node_modules
    if [ -d "node_modules" ]; then
        sudo chown -R $CHOWN_USER node_modules
        sudo chmod -R 755 node_modules
    fi
    
    if [ -d "frontend/node_modules" ]; then
        sudo chown -R $CHOWN_USER frontend/node_modules
        sudo chmod -R 755 frontend/node_modules
    fi
    
    echo -e "${GREEN}Права доступа настроены${NC}"
}

# Функция для проверки версии Node.js
check_node_version() {
    local version=$(node -v | cut -d'v' -f2)
    local major=$(echo $version | cut -d'.' -f1)
    if [ "$major" -lt 16 ]; then
        echo -e "${RED}Требуется Node.js версии 16.x или выше. Текущая версия: $version${NC}"
        exit 1
    fi
    echo -e "${GREEN}Node.js версия $version - OK${NC}"
}

# Функция для очистки node_modules
clean_node_modules() {
    if [ -d "node_modules" ]; then
        echo -e "${YELLOW}Удаление существующих node_modules...${NC}"
        sudo rm -rf node_modules
    fi
    if [ -d "frontend/node_modules" ]; then
        echo -e "${YELLOW}Удаление существующих node_modules во фронтенде...${NC}"
        sudo rm -rf frontend/node_modules
    fi
}

echo -e "${GREEN}Начинаем установку AMS-IT...${NC}"

# Настройка npm
setup_npm

# Настройка прав доступа
setup_permissions

# Проверка наличия Node.js и npm
if ! command -v node &> /dev/null; then
    echo -e "${RED}Node.js не установлен. Пожалуйста, установите Node.js версии 16.x или выше${NC}"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo -e "${RED}npm не установлен. Пожалуйста, установите npm${NC}"
    exit 1
fi

# Проверка версии Node.js
check_node_version

# Очистка существующих node_modules
clean_node_modules

# Настройка базы данных
setup_database

# Установка зависимостей бэкенда
echo -e "${GREEN}Установка зависимостей бэкенда...${NC}"
npm install

# Настройка frontend
setup_frontend

# Настройка конфигурации
setup_config

# Повторная настройка прав после установки
setup_permissions

# Применение миграций
echo "Applying migrations..."
mysql -u IT -p'HardWork@1LP' ams_it < backend/database/migrations/create_equipment_table.sql
mysql -u IT -p'HardWork@1LP' ams_it < backend/database/migrations/add_uuid_to_equipment.sql
mysql -u IT -p'HardWork@1LP' ams_it < backend/database/migrations/add_cost_fields_to_equipment.sql
mysql -u IT -p'HardWork@1LP' ams_it < backend/database/migrations/add_type_to_equipment.sql

# Проверка успешности установки
if [ $? -eq 0 ]; then
    echo -e "${GREEN}Установка успешно завершена!${NC}"
    echo -e "${GREEN}Для запуска проекта используйте:${NC}"
    echo -e "npm run dev:full"
    
    # Обновление PATH для текущей сессии
    source ~/.bashrc
    
    echo -e "${YELLOW}Пожалуйста, перезапустите терминал или выполните:${NC}"
    echo -e "source ~/.bashrc"
else
    echo -e "${RED}Произошла ошибка при установке. Пожалуйста, проверьте логи выше.${NC}"
    exit 1
fi
