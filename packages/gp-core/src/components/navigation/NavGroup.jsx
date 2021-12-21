import React, { Component, PropTypes } from 'react';
import { autobind } from 'core-decorators';
import { withRouter } from 'react-router';
import { connect } from 'react-redux';
import LinkWrapper from './LinkWrapper';
import DropdownMenu from './DropdownMenu';
import coreNavigation from '../../config/navigation';

function extractPermissions(array) {
  return array
    .filter(i => i.permissions)
    .map(i => i.permissions)
    .reduce((p, c) => p.concat(c), []);
}

@withRouter
@connect(state => state.core.sysInfo)
@autobind
export default class NavGroup extends Component {

  static propTypes = {
    sysInfo: PropTypes.object,
    location: PropTypes.object,
    navigation: PropTypes.shape({
      map: PropTypes.func.isRequired,
      children: PropTypes.arrayOf(PropTypes.shape({})),
    }),
  }

  static defaultProps = {
    navigation: coreNavigation,
  }

  navGroupIsHidden() {
    const { location } = this.props;

    return location.pathname === '/login';
  }

  renderLink(object, index) {
    const { sysInfo = {} } = this.props;
    const additions = {
      'rfc/inbox': sysInfo.rfcIncome,
      'rfc/draft': sysInfo.draft,
    };

    if (Array.isArray(object.children)) {
      return (
        <li key={index}>
          <DropdownMenu title={object.title} items={object.children} oneOfPermissions={extractPermissions(object.children)} className="fa fa-bars dropdown-menu-btn" />
        </li>
      );
    }
    return (
      <LinkWrapper
        permissions={object.permissions}
        key={index}
        to={`/${object.route}/`}
        href={object.href}
        {...this.props}
      >
        <div className="menu">
          <div className={object.class} />
          <span className={object.class}>{object.title}</span>
          {additions[object.route] !== undefined && <span className="menu-count" style={{ marginLeft: 5 }}>{additions[object.route]}</span>}
        </div>
      </LinkWrapper>
    );
  }

  render() {
    const { navigation } = this.props;
    const links = navigation.children.map(this.renderLink);

    return (
      <ul hidden={this.navGroupIsHidden()} className="aui-nav">
        {links}
      </ul>
    );
  }
}
