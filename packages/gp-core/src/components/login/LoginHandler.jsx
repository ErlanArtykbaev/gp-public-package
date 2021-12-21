import React, { PropTypes } from 'react';
import AutoForm from 'react-auto-form';
import { connect } from 'react-redux';
import { login } from 'gp-core/lib/redux/modules/session';
import gostLogo from 'gp-core/lib/assets/images/logo-gost.png';
import LoginError from './LoginError';
import './login.global.scss';

@connect(state => state.core.session, { login })
export default class LoginHandler extends React.Component {

  static propTypes = {
    sessionError: PropTypes.object,
    isLoading: PropTypes.bool,
    login: PropTypes.func,
  }

  static contextTypes = {
    config: React.PropTypes.object.isRequired,
  }

  constructor(props) {
    super(props);

    this.state = {
      username: '',
      password: '',
    };
  }

  onChange = (event, name, data, change) => {
    this.setState({
      [name]: change[name],
    });
  }

  onSubmit = (event) => {
    // TODO refactor
    event = event || window.event;
    if (typeof event.preventDefault === 'function') {
      event.preventDefault();
    } else {
      event.returnValue = false;
    }

    if (this.state.username && this.state.password) {
      this.props.login({ login: this.state.username, password: this.state.password });
    } else if (this.state.username) {
      global.NOTIFICATION_SYSTEM.notify('Ошибка', 'Поле пароль не может быть пустым.', 'error');
    } else if (this.state.password) {
      global.NOTIFICATION_SYSTEM.notify('Ошибка', 'Поле логин не может быть пустым.', 'error');
    } else {
      global.NOTIFICATION_SYSTEM.notify('Ошибка', 'Поля логин и пароль не могут быть пустыми.', 'error');
    }
  }

  render() {
    const { config } = this.context;
    const { isLoading } = this.props;
    // TODO refactor remove autoform
    return (
      <div className="aui-page-panel login">
        <header className="aui-page-header login__header">
          <div className="aui-page-header-inner">
            <div className="aui-pageheader-main rosseti-logo">
              {/* <h3>Пожалуйста, войдите</h3>*/}
              {/* <img role="presentation" src={config} className="gis-tek-logo" />*/}
              <h3>{config.title}</h3>
            </div>
          </div>
        </header>
        <LoginError sessionError={this.props.sessionError} />
        <AutoForm className="aui top-label" onChange={this.onChange} onSubmit={this.onSubmit} trimOnSubmit>
          <div className="form-group">
            <label htmlFor="username">Логин</label>
            <input autoComplete="off" type="text" name="username" className="form-control" placeholder="Логин" autoFocus="autofocus" defaultValue={this.state.username} />
          </div>
          <div className="form-group">
            <label htmlFor="password">Пароль</label>
            <input autoComplete="off" type="password" name="password" className="form-control" placeholder="Пароль" defaultValue={this.state.password} />
          </div>
          <div className="form-group text-center">
            <div className="buttons">
              <button type="submit" disabled={isLoading} className="btn btn-primary" style={{ minWidth: 140 }}>
                {isLoading ? 'Загрузка...' : 'Войти'}
              </button>
            </div>
          </div>
          {/* <div className="gost-info-block">
            <div className="inline-block gost-info gost-logo">
              <a href="http://gost-group.com"><img role="presentation" src={gostLogo} className="gis-tek-logo" /></a>
            </div>
            <div className="inline-block gost-info">
              <b>GOST Platform</b><br />
              Группа компаний GOST<br />
              Техническая поддержка:<br />
              <i>+7 495 150-12-33</i><br />
              (с 9:00 до 18:00)<br />
              info@gost-group.com
            </div>
          </div> */}
        </AutoForm>
      </div>
    );
  }
}
