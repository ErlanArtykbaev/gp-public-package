# Gost Platform (Frontend)

## Предварительная настройка `npm registry`

Чтобы получить доступ (получение и деплой пакетов) к нашим приватным репозиториям необходимо залогиниться в 2 registry (данные для входа берём от `Nexus`) и поставить активный registry:

```bash
  npm login --registry http://nexus.gost-group.com/repository/gp-npm-private/
  npm login --registry http://nexus.gost-group.com/repository/gp-npm-group/

  npm config set registry http://nexus.gost-group.com/repository/gp-npm-group/
```

При создании нового пакета необходимо в его `package.json` добавить `registry` для публикации и наш `scope` (группа в nexus, namespace, говоря обычными словами). Имя пакета в `package.json` должно начинаться с `@gostgroup`.

```json
  "name": "@gostgroup/gp-my-awesome-package",
  "publishConfig": {
    "registry": "http://nexus.gost-group.com/repository/gp-npm-private/",
    "scope": "gostgroup"
  }
```

> ## ⚠️ Имя пакета в папке /packages/ указывается без префикса @gostgroup

## Особенности использования модулей из npm-пакетов

Некоторые компоненты или функции платформы написаны на `TypeScript` (ts) и это превносит некоторые особенности работы с ними.
Сейчас сборка ts-кода происходит таким образом, что собранные js-файлы кладутся рядом с исходными ts-файлами.
> ⚠️ Поэтому важно для каждого проекта, использующего модули платформы, в настройках `webpack` в секции `resolve.extensions` указывать `.js`-расширение в списке **первым**.

```js
extensions: ['.js', '.jsx', '.json', '.ts', '.tsx']
```

## Модули (пакеты) платформы

1. [📋 gp-forms](docs/modules/gp-forms.md)

## Getting started

Install modules

`npm install`

Initialize lerna and modules

`npm run bootstrap`

Build libs

`npm run build`

Run module `gp-app`

В packages/gp-app создать файл .env со следующим содержанием
`APIHOST=адрес_бэкэнда`

Теперь запускаем dev сервер
`npm run dev`

## Documentation

[Lerna](https://github.com/lerna/lerna)

## Проблемы при установке

`yarn: error: no such option: --mutex`

Решается установкой последней версии yarn
