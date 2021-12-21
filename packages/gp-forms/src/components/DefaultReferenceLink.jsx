import React from 'react';

export default class DefaultReferenceLink extends React.Component {

  static propTypes = {
    title: React.PropTypes.string,
  }

  render() {
    const { title } = this.props;
    return <div className="text">{title}</div>;
  }
}
