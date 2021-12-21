import React from 'react';
import isEqual from 'lodash/isEqual';

export default Cmp => (
  class DeepPure extends React.Component {
    shouldComponentUpdate(nextProps) {
      return !isEqual(this.props, nextProps);
    }

    render() {
      return <Cmp {...this.props} />;
    }
  }
);
