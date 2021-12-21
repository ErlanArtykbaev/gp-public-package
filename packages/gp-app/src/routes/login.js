export default function getRoutes({ getSession, index }) {
  function checkLoggedIn(nextState, replace) {
    if (getSession().session) {
      replace(index);
    }
  }

  return {
    name: 'login',
    path: 'login',
    getComponent(nextState, callback) {
      require.ensure([], (require) => {
        callback(null, require('@gostgroup/gp-core/lib/components/login/LoginHandler').default);
      }, 'loginPage');
    },
    onEnter: checkLoggedIn,
  };
}
