import isRoot from './isRoot';

export default function redirectFromRoot(pageToRedirect) {
  return (nextState, replace) => {
    if (isRoot(nextState)) {
      replace(pageToRedirect);
    }
  };
}
