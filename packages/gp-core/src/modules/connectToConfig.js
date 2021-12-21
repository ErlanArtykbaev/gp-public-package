import React, { PropTypes } from 'react';

export default resolver => ComposedComponent => class extends React.Component { // eslint-disable-line react/prefer-stateless-function
  static contextTypes = {
    appConfig: PropTypes.shape({}),
  }

  render() {
    const { appConfig } = this.context;
    const props = typeof resolver === 'function' ? resolver(appConfig, this.props) : {};

    return <ComposedComponent {...props} {...this.props} />;
  }
};
