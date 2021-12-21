import { diff as deepDiff } from 'deep-diff';
import get from 'lodash/get';
import values from 'lodash/values';
import merge from 'lodash/merge';
import pick from 'lodash/pick';
import set from 'lodash/set';
import keyBy from 'lodash/keyBy';
import omit from 'lodash/omit';
import isEmpty from 'lodash/isEmpty';

const KIND_TO_NAME = {
  N: 'ADD',
  D: 'REMOVE',
  E: 'CHANGE',
};

// Поля элемента, кроме схемы
const getMainDiffable = e => pick(e, ['id', 'description', 'fullTitle', 'key', 'shortTitle']);
// Общие поля типа и схемы, кроме properties
const getTypeMainDiffable = e => pick(e, ['id', 'extends', 'title', 'isInlineEditable']);
// uuid типа ведет себя странно, пока просто уберем его
const getPropertyDiffable = p => ({ ...p, config: omit(p.config, 'type') });
// Пляски: поменять порядок полей типа - не значит поменять тип
const getTypeDiffable = t => ({
  ...getTypeMainDiffable(t),
  config: {
    properties: keyBy(t.config.properties.map(getPropertyDiffable), p => p.id),
  },
});

const restoreDiffShape = (diff) => {
  const diffFlag = KIND_TO_NAME[diff.kind];
  if (diff.rhs instanceof Object || diff.lhs instanceof Object) {
    const res = diff.lhs || diff.rhs;
    return { ...res, diff: diffFlag };
  }
  return { rhs: diff.rhs, lhs: diff.lhs, diff: diffFlag };
};
// То же, что _.keyBy, но получает из элемента не ключ, а путь
const diffKeyBy = (arr, pathGetter) => (
  (arr || []).reduce((obj, item) => set(obj, pathGetter(item), restoreDiffShape(item)), {})
);
// Собирает из массива диффов объект, всем родителям измененных свойств
// проставляет флаг diff: 'CHANGE'
const deepDiffWithFlags = (arr, pathGetter) => {
  const obj = diffKeyBy(arr, pathGetter);
  obj.diff = isEmpty(arr) ? null : 'CHANGE';
  (arr || []).forEach((diffItem) => {
    const path = [];
    diffItem.path.forEach((pathItem) => {
      if (get(obj, path) instanceof Object) {
        set(obj, path.concat('diff'), 'CHANGE');
      }
      path.push(pathItem);
    });
  });
  return obj;
};
// обертка для deep-diff: принимает 2 объекта и преобразование,
// возвращает объект в форме merge(<curr, next>), но с диффами
// по изменившимся путям и флагом diff: 'CHANGE' для всех родителей
// изменившихся свойств
const objDiff = (curr, next, prefilter) => {
  const currObj = prefilter(curr);
  return merge(
    {},
    currObj,
    deepDiffWithFlags(deepDiff(prefilter(next), currObj), i => i.path)
  );
};

// слишком много цирка:
const restoreTypeFromDiffable = (t) => {
  const properties = values(omit(t.config.properties, 'diff'));
  const propsChanged = properties.some(p => p.diff) ? 'CHANGE' : null;
  return {
    ...getTypeMainDiffable(t),
    config: { properties, diff: propsChanged },
    diff: t.diff || propsChanged,
  };
};

// Пляски: поменять порядок типов - не значит поменять типы
const toDiffableTypes = typeArr => keyBy(typeArr.map(getTypeDiffable), t => t.id);
const restoreTypesShape = typeDiffObject => (
  values(omit(typeDiffObject, 'diff')).map(restoreTypeFromDiffable)
);
const typesDiff = (t1, t2) => restoreTypesShape(objDiff(t1, t2, toDiffableTypes));

const schemaDiff = (s1, s2) => {
  const selfDiff = restoreTypeFromDiffable(objDiff(s1, s2, getTypeDiffable));
  const subtypeDiff = typesDiff(s1.types, s2.types);
  return { ...selfDiff, types: subtypeDiff };
};

// На пальцах: убираем некоторые поля, перекладываем типы и их свойства по id,
// чтобы перестановка не считалась изменением, делаем дифф через deep-diff.
// В результате каждое поле может быть своей нормальной формы, а может быть
// диффом вида { lhs: <старый>, rhs: <новый>, kind: 'N' | 'D' | 'E' <вид изменения> }
// Кроме того, у всех свойств с изменившимися под-свойствами стоит флаг
// diff: 'CHANGE'
const diffElements = (e1, e2) => {
  if (!e1 || !e2) {
    return e1 || e2 || {};
  }
  const main = objDiff(e1, e2, getMainDiffable);
  const schema = schemaDiff(e1.schema, e2.schema);
  return { ...main, schema };
};

export default diffElements;
