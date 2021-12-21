import { createSelector } from 'reselect';
import Immutable from 'immutable';
import { makeGetLoadingState } from '@gostgroup/gp-redux-utils/lib/flow';

// NOTE может нам стоит использовать конфиг для задания места, где лежит кор в стейте?

export const isObjectFavourite = createSelector(
  state => state.core.objects,
  ({ favourites }) => absolutPath => typeof favourites[absolutPath] !== 'undefined',
);

const stateSelector = state => state.core.objects;
const objectsTreeSelector = createSelector(
  stateSelector,
  ({ objectsTree }) => objectsTree,
);
const selectedPathSelector = createSelector(
  stateSelector,
  ({ selectedPath }) => selectedPath,
);

export const objectSelector = createSelector(
  selectedPathSelector,
  objectsTreeSelector,
  (absolutePath, objectsTree) => {
    // NOTE может есть смысл добавить второй аргумент для построения из части дерева
    const result = [objectsTree];
    if (!absolutePath) {
      return result;
    }
    const parts = absolutePath.split('/').slice(1);
    let current = objectsTree;
    while (parts.length > 0) {
      const part = parts.shift();
      if (!current.children) {
        // NOTE для записей это норм
        // console.warn('Wrong object path'); // eslint-disable-line no-console
        return result;
      }
      const matched = current.children.filter(child => child.key === part);
      if (matched.length !== 1) {
        console.warn(`Group ${current.key} has no or more than one occurence of ${part}`); // eslint-disable-line no-console
        return result;
        // throw new Error('something fucked up happened');
      }
      const singleMatched = matched[0];
      result.push(singleMatched);
      current = singleMatched;
    }
    return result;
  },
);

export const treePathSelector = createSelector(
  state => state,
  state => [state.objectsTree],
);

const createImmutableItemsSelector = (type = 'element') => createSelector(
  objectsTreeSelector,
  (objectsTree) => {
    const refs = [];

    function processOne(item) {
      if (item.type !== 'group') {
        const disabled = (item.status && item.status === 'not_available') ||
            (typeof item.isAvailable !== 'undefined' && item.isAvailable === false);
        if (disabled) return;
        refs.push({
          id: item.absolutPath,
          title: item.shortTitle,
          type: item.type,
        });
      }

      if (item.children) {
        item.children.forEach(processOne);
      }
    }

    if (objectsTree) {
      processOne(objectsTree);
    }

    return Immutable.fromJS(refs);
  },
);

export const getImmutableItems = createImmutableItemsSelector();

export const getImmutableRefs = createImmutableItemsSelector('element');

export const getImmutableClassifiers = createImmutableItemsSelector('classifier');

export const getLoadingState = makeGetLoadingState('objects');
