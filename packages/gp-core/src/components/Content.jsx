import React, { Component, PropTypes } from 'react';

export default class Content extends Component {

  static propTypes = {
    children: PropTypes.node,
  }

  static onEnter(getSession, nextState, replace) {
    if (!getSession().session) {
      replace({
        pathname: '/login',
        query: {
          redirectPath: nextState.location.pathname,
        },
      });
    }
  }

  render() {
    return this.props.children;
  }
}
