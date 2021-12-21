import React from 'react';

export default class Div extends React.Component {
  render() {
    return this.props.hidden ? <div /> : <div {...this.props}>{this.props.children}</div>;
  }
}
