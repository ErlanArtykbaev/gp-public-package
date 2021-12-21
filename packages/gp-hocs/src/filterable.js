import React from 'react';
import { autobind } from 'core-decorators';

export default (listName, filterPropertyName, filterFunction) => Cmp => (
  class FilterableCmp extends React.Component {

    @autobind
    filterFunction(el, i) {
      const query = this.props[filterPropertyName];
      return filterFunction(el, query, this.props, i);
    }

    @autobind
    toggle(value) {
      const finalValue = typeof value !== 'undefined' ? value : !this.state.value;
      this.setState({ value: !!finalValue });
    }

    render() {
      const props = {
        ...this.props,
        [listName]: this.props[listName].filter(this.filterFunction),
      };
      return <Cmp {...props} />;
    }
  }
);
