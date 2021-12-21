import React from 'react';

const dictionary = {
  login: {
    manual: 'Пожалуйста войдите',
    'no auth': 'Отсутствует сессия',
    'wrong credentials': 'Неверный логин или пароль',
    'user disabled': 'Доступ запрещен',
  },
};

const LoginError = (props) => {
  const err = props.sessionError;
  if (!err || !err.reason) {
    return null;
  }
  return (
    <div className="aui-message error">
      <span className="aui-icon icon-error" />
      <span className="error">{dictionary.login[err.reason]}</span>
    </div>
  );
};

LoginError.propTypes = {
  sessionError: React.PropTypes.shape({ reason: React.PropTypes.string }),
};

export default LoginError;
