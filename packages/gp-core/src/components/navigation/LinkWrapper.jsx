import React, { Component, PropTypes } from 'react';
import { Link, withRouter } from 'react-router';
import { isEmpty } from '@gostgroup/gp-utils/lib/functions';
import enhanceWithPermissions from '../hoc/RequirePermissions';

@enhanceWithPermissions
@withRouter
export default class LinkWrapper extends Component {

  static propTypes = {
    location: PropTypes.object,
    router: PropTypes.object,
    to: PropTypes.string,
    addition: PropTypes.number,
    children: PropTypes.node,
    href: PropTypes.string,
    single: PropTypes.bool,
  }

  getActiveState() {
    if (this.props.to === '/groups/') {
      if (this.props.location.pathname.indexOf('groups/') > -1) {
        return true;
      }
    }
    return this.props.router.isActive(this.props.to);
  }

  render() {
    const { href, to, single } = this.props;
    const isActive = this.getActiveState();
    const className = isActive ? 'aui-nav-selected' : '';

    const element = href
      ?
        <a href={href}>{this.props.children}</a>
      :
        (<Link to={to} activeClassName="">
          {this.props.children} {!isEmpty(this.props.addition) && ` (${this.props.addition})`}
        </Link>);

    if (single) {
      return element;
    }

    return (
      <li className={className}>
        {element}
      </li>
    );
  }

}
