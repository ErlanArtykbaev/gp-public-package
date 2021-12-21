const asyncReducersEnhancer = createStore => (reducer, preloadedState, enhancer) => {
  const store = createStore(reducer, preloadedState, enhancer);

  return {
    ...store,
    asyncReducers: {},
  };
};

export default function injectableStore(createReducer) {
  return createStore => (reducer, preloadedState) => {
    const store = createStore(reducer, preloadedState, asyncReducersEnhancer);

    return {
      ...store,
      injectReducer: (reducers) => {
        Object.keys(reducers).forEach((k) => {
          store.asyncReducers[k] = reducers[k];
        });
        store.replaceReducer(createReducer(store.asyncReducers));
      },
    };
  };
}
