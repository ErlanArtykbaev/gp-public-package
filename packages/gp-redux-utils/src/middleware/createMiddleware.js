export default middlewares => store => next => (action) => {
  const maybeMiddlewareFunction = middlewares[action.type];

  let continueDispatch = true;
  if (typeof maybeMiddlewareFunction === 'function') {
    const finallyContinueDispatch = maybeMiddlewareFunction(store, action);
    if (finallyContinueDispatch === false) {
      continueDispatch = false;
    }
  }

  if (continueDispatch) {
    next(action);
  }
};
