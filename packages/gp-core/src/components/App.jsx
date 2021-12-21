import React, { PropTypes } from 'react';
import { compose, withProps } from 'recompose';
import { locationShape } from 'react-router/lib/PropTypes';
import cx from 'classnames';

import { connect } from 'react-redux';
import { initApp } from 'gp-core/lib/redux/modules/app';
import Preloader from '@gostgroup/gp-ui-components/lib/Preloader';
import { getCurrentUserId } from 'gp-core/lib/redux/selectors/session';

import DefaultHeader from './navigation/Header';
import DefaultNavGroup from './navigation/NavGroup';
import DefaultFooter from './Footer';

const OfflineMessage = () => (
  <div style={{ textAlign: 'center' }}>
    <h1 style={{ marginTop: 20, textAlign: 'center' }}>Сервер недоступен. Ведутся технические работы</h1>
    <button className="sh-btn" style={{ marginTop: 20 }} onClick={() => window.location.reload()}>Обновить страницу</button>
  </div>
);

const getPathClassNames = (location) => {
  const pathname = location.pathname || '';
  const pathClassNames = {
    login: 'page-login',
  };
  const classNames = [];
  Object.keys(pathClassNames).forEach((key) => {
    if (pathname.indexOf(key) > -1) {
      classNames.push(pathClassNames[key]);
    }
  });
  return classNames.join(' ');
};

@connect(
  state => ({
    ...state.core.app,
    currentUserId: getCurrentUserId(state),
  }),
  { initApp },
)
export default class App extends React.Component {

  static childContextTypes = {
    config: PropTypes.shape({
      title: PropTypes.string,
      logos: PropTypes.arrayOf(PropTypes.string),
    }),
    appConfig: PropTypes.shape({}),
  }

  static propTypes = {
    initApp: PropTypes.func.isRequired,
    location: locationShape,
    isInitialized: PropTypes.bool,
    initializationFailed: PropTypes.bool,
    children: PropTypes.node,
    config: PropTypes.shape({
      title: PropTypes.string,
      logos: PropTypes.arrayOf(PropTypes.string),
      navigation: PropTypes.shape({
        map: PropTypes.func,
        children: PropTypes.arrayOf(PropTypes.shape({})),
      }),
    }),
    headerComponent: PropTypes.func,
    navComponent: PropTypes.func,
    footerComponent: PropTypes.func,
  }

  getChildContext() {
    return {
      config: this.props.config,
      appConfig: this.props.config,
    };
  }

  componentDidMount() {
    this.props.initApp();
  }

  renderApp() {
    const { location, config, headerComponent, navComponent, footerComponent } = this.props;
    const classNamePage = cx(getPathClassNames(location));
    const { initializationFailed } = this.props;

    const Header = headerComponent || DefaultHeader;
    const NavGroup = compose(
      withProps(() => ({
        navigation: config.navigation, // временно
      }))
    )(navComponent || DefaultNavGroup);
    const Footer = footerComponent || DefaultFooter;
    return (
      <div className={classNamePage}>
        <Header logos={config.logos} title={config.title} {...this.props}>
          <div className="app-header-navgroup-items">
            <NavGroup location={location} />
            {config.navGroupAdditions || ''}
          </div>
        </Header>
        <section id="content">
          <div className="body-content-inner">
            {initializationFailed ? <OfflineMessage /> : this.props.children}
          </div>
        </section>
        <Footer text={config.version_description} />
      </div>
    );
  }

  render() {
    const { isInitialized, initializationFailed } = this.props;
    return !isInitialized && !initializationFailed ? <Preloader /> : this.renderApp();
  }

}
