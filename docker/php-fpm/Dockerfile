FROM php:8.2-fpm-alpine

# Установка системных зависимостей
RUN apk add --no-cache \
    postgresql-dev \
    redis-dev \
    libzip-dev \
    icu-dev \
    oniguruma-dev \
    && docker-php-ext-configure pgsql -with-pgsql=/usr/local/pgsql \
    && docker-php-ext-install \
        pdo \
        pdo_pgsql \
        pgsql \
        zip \
        intl \
        opcache \
    && pecl install redis \
    && docker-php-ext-enable redis

# Установка Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Настройка OPcache для производительности
RUN { \
        echo 'opcache.memory_consumption=128'; \
        echo 'opcache.interned_strings_buffer=8'; \
        echo 'opcache.max_accelerated_files=4000'; \
        echo 'opcache.revalidate_freq=60'; \
        echo 'opcache.fast_shutdown=1'; \
        echo 'opcache.enable_cli=0'; \
    } > /usr/local/etc/php/conf.d/opcache-recommended.ini

# Настройки PHP
RUN { \
        echo 'memory_limit = 256M'; \
        echo 'upload_max_filesize = 10M'; \
        echo 'post_max_size = 10M'; \
        echo 'max_execution_time = 60'; \
        echo 'date.timezone = Europe/Moscow'; \
    } > /usr/local/etc/php/conf.d/custom.ini

# Рабочая директория
WORKDIR /var/www/html/backend

# Копирование composer файлов
COPY composer.json composer.lock* ./

# Установка зависимостей
RUN composer install --no-dev --optimize-autoloader --no-interaction || true

# Права доступа
RUN chown -R www-data:www-data /var/www/html

EXPOSE 9000
CMD ["php-fpm"]
