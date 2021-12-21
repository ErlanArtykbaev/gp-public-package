import merge from 'lodash/merge';
import cloneDeep from 'lodash/cloneDeep';
import isStatePlainEnough from './isStatePlainEnough';

// NOTE Дефолтный реконсилер - https://github.com/rt2zz/redux-persist/blob/master/src/autoRehydrate.js
// function defaultStateReconciler(state, inboundState, reducedState, log) {
//   const newState = { ...reducedState };
//
//   Object.keys(inboundState).forEach((key) => {
//     // if initialState does not have key, skip auto rehydration
//     if (!state.hasOwnProperty(key)) return;
//
//     // if initial state is an object but inbound state is null/undefined, skip
//     if (typeof state[key] === 'object' && !inboundState[key]) {
//       if (log) console.log('redux-persist/autoRehydrate: sub state for key `%s` is falsy but initial state is an object, skipping autoRehydrate.', key);
//       return;
//     }
//
//     // if reducer modifies substate, skip auto rehydration
//     if (state[key] !== reducedState[key]) {
//       if (log) console.log('redux-persist/autoRehydrate: sub state for key `%s` modified, skipping autoRehydrate.', key);
//       newState[key] = reducedState[key];
//       return;
//     }
//
//     // otherwise take the inboundState
//     if (isStatePlainEnough(inboundState[key]) && isStatePlainEnough(state[key])) newState[key] = { ...state[key], ...inboundState[key] }; // shallow merge
//     else newState[key] = inboundState[key]; // hard set
//
//     if (log) console.log('redux-persist/autoRehydrate: key `%s`, rehydrated to ', key, newState[key]);
//   });
//   return newState;
// }

export default function customStateReconciler(state, inboundState, reducedState, log) {
  const newState = { ...reducedState };

  Object.keys(inboundState).forEach((key) => {
    // if initialState does not have key, skip auto rehydration
    if (!state.hasOwnProperty(key)) return;  // eslint-disable-line no-prototype-builtins

    // if initial state is an object but inbound state is null/undefined, skip
    if (typeof state[key] === 'object' && !inboundState[key]) {
      if (log) console.log('redux-persist/autoRehydrate: sub state for key `%s` is falsy but initial state is an object, skipping autoRehydrate.', key); // eslint-disable-line no-console
      return;
    }

    // if reducer modifies substate, skip auto rehydration
    if (state[key] !== reducedState[key]) {
      if (log) console.log('redux-persist/autoRehydrate: sub state for key `%s` modified, skipping autoRehydrate.', key); // eslint-disable-line no-console
      newState[key] = reducedState[key];
      return;
    }

    // otherwise take the inboundState
    if (isStatePlainEnough(inboundState[key]) && isStatePlainEnough(state[key])) {
      // NOTE ну а хули еще делать?
      newState[key] = merge(cloneDeep(state[key]), inboundState[key]);// { ...state[key], ...inboundState[key] }; // shallow merge
    } else {
      // console.info('COMPLEX');
      // console.info(inboundState[key], state[key]);
      newState[key] = inboundState[key]; // hard set
    }

    if (log) console.log('redux-persist/autoRehydrate: key `%s`, rehydrated to ', key, newState[key]); // eslint-disable-line no-console
  });
  return newState;
}
