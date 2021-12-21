import React from 'react';
import union from 'lodash/union';

export default Cmp => (
  class VerbosePure extends React.Component {
    shouldComponentUpdate(nextProps) {
      const changed = union(Object.keys(nextProps), Object.keys(this.props))
        .filter(k => nextProps[k] !== this.props[k]);
      const shouldUpdate = changed.length > 0;
      if (shouldUpdate) {
        console.warn( // eslint-disable-line no-console
          'rerender', Cmp.name,
          changed.join(', '), 'changed.',
          this.props, '->', nextProps
        );
      }
      return shouldUpdate;
    }

    render() {
      return <Cmp {...this.props} />;
    }
  }
);
