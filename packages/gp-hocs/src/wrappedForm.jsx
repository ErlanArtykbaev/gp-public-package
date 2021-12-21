import React, { Component, PropTypes } from 'react';

export default function wrappedForm(WrappedComponent) {
  return class extends Component {

    static propTypes = {
      isOpen: PropTypes.bool,
    }

    render() {
      if (!this.props.isOpen) {
        return null;
      }
      return <WrappedComponent {...this.props} />;
    }
  };
}
