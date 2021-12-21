# Работа с Redux

Для управления состоянием приложения в проекте используется [Redux](redux.js.org).

## Архитектура

В качестве основной архитектуры используется [Modular Redux](https://github.com/erikras/ducks-modular-redux).

## Абстракции Redux

### Store

Инструменты:

+ [redux-persist](https://github.com/rt2zz/redux-persist) - для синхронизации состояния приложения с [localStorage](https://developer.mozilla.org/en/docs/Web/API/Window/localStorage)

Основные моменты:

+ Объект `store` создается с помощью `src/core/redux/createStore`

+ Объект `store` попадает в контекст приложения с помощью компонента `StoreProvider` (`src/core/components/StoreProvider.jsx`)

+ `StoreProvider` так же получает на вход трансформации стора для инструмента `redux-persist` и препятствует инициализации корневого компонента до синхронизации `localStorage` с начальным состоянием приложения


### Middleware

Cторонние `middleware` в проекте:

+ [redux-logger](https://github.com/evgenyrodionov/redux-logger) - для логгирования

+ [redux-thunk](https://github.com/gaearon/redux-thunk) - для более гибкого использования `action creators`

+ [react-router-redux](https://github.com/reactjs/react-router-redux) - для синхронизации и управления `router history` средствами `redux`

Собственные `middleware` используемые в проекте находятся в `src/core/redux/middleware` и служат для уменьшения количества *boilerplate*-кода. К примеру, `promiseMiddleware` помогает однозначно определить асинхронные экшны и на основе результата выполнения асинхронной операции выполняет `store.dispatch()` экшнов с соответствующим  типом (`Init`, `Success`, `Error`) без необходимости описывать все возможные результаты для каждого асинхронного экшна.

Подробнее о работе собственных `middleware` можно узнать из их исходников.

### Action

Инструменты:

+ [redux-actions](https://github.com/reduxactions/redux-actions)

В `src/core/redux/utils/actions` находятся утилиты для создания экшнов, основанные на инструменте `redux-actions`.

Пример создания экшнов:

```javascript
// Модуль Redux
import { actionsFactory } from 'core/redux/utils/actions';

const MODULE_KEY = 'someModule'; // ключ модуля

const createAction = actionsFactory(MODULE_KEY);

const getItems = createAction('getItems', (query) => []);

// ...

// Результат вызова из store.dispatch(getItems('123'))
console.log(getItems('123'));
// {
//   type: 'someModule/getItems',
//   payload: [],
//   meta: {
//     arguments: ['123']
//   }
// }

```

### Reducer

В `src/core/redux/utils/actions` находятся утилиты для создания редьюсеров и обработки экшнов, основанные на инструменте `redux-actions`.

Пример создания редьюсера:

```javascript
// Модуль Redux
import { handleActions } from 'core/redux/utils/actions';

const initialState = {};

const reducer = handleActions({
  [getItems]: (state, { payload }) => ({
    ...state,
    items: payload,
  })
}, initialState);

```

## Использование с React

Инструменты:

+ [react-redux](https://github.com/reactjs/react-redux) - для подключения к компонентам

+ [reselect](https://github.com/reactjs/reselect) - для создания селекторов

### Селекторы

Для безопасного и более оптимального подключения состояния приложения к `React`-компонентам используются селекторы, создаваемые с помощью `reselect`.

Подробнее о селекторах можно прочесть в документации инструмента.

## Важные особенности

Следует обратить внимание на `src/core/redux/utils` и ознакомиться с исходниками утилит платформы для `redux`.
