# Руководство разработчика

## Структура проекта

```
|-- /
    |-- .babelrc                * конфигурация Babel
    |-- .editorconfig           * конфигурация EditorConfig
    |-- .env.example            * конфигурация обязательных переменных окружения
    |-- .eslintignore           * конфигурация игнорируемых Eslint файлов
    |-- .eslintrc.js            * конфигурация ESLint
    |-- .gitignore              * .gitignore
    |-- README.md               * README.md
    |-- index.html              * index.html для development режима
    |-- package.json            * package.json
    |-- platform.json           * метаданные по платформе
    |-- static-server.js        * сервер, отдающий статику из папки dist (собранного приложения)
    |-- tsconfig.json           * конфигурация компилятора TypeScript
    |-- tslint.json             * конфигурация TSLint
    |-- bin                     * вспомогательные bash-скрипты
    |-- docs                    * документация
    |-- src                     * исходники приложения
    |   |-- index.js            * стартовый файл приложения
    |   |-- core                * ядро платформы
    |       |-- globals.js      * глобальные переменные
    |       |-- index.js        * файл инициализации ядра
    |       |-- @types          * TypeScript type definitions
    |       |-- api             * файлы для работы с Backend API
    |       |-- app             * пример приложения на основе ядра (приложение состоящее только из ядра)
    |       |-- assets          * статика (стили, картинки и т.п.)
    |       |-- components      * компоненты React
    |       |-- config          * утилиты для конфигурации ядра
    |       |-- constants       * константы ядра
    |       |-- dep             * сторонние библиотеки без возможности их импорта из npm
    |       |-- editor          * Модуль GOST-Platform (Editor) - редактор схем
    |       |-- gistek_forms    * Модуль GOST-Platform (Form) - динамические формы, создаваемые из схем
    |       |-- models          * вспомогательные классы, описывающие модели
    |       |-- modules         * Модули GOST-Platform
    |       |-- nsi             * утилиты для модуля Editor
    |       |-- redux           * все что связано с Redux
    |       |-- routes          * конфигурация роутов для React-Router
    |       |-- utils           * утилиты (вспомогательные функции)
    |       |-- validate        * утилиты валидации
    |-- test                    * тесты
    |-- webpack                 * скрипты для webpack и различные вспомогательные функции
```

## Описание архитектуры

*В процессе (необходима доработка концепции модулей GOST-Platform)*

## Дополнительно

### Описание применения технологий

+ [Redux](redux.md)
