import React from 'react';
import { autobind } from 'core-decorators';

export default (paramName, toggleName, initValue) => Cmp => (
  class TogglableCmp extends React.Component {
    constructor(p, c) {
      super(p, c);
      const value = initValue instanceof Function ? initValue(this.props) : initValue;
      this.state = { value };
    }

    @autobind
    toggle(value) {
      const finalValue = typeof value === 'boolean' ? value : !this.state.value;
      this.setState({ value: !!finalValue });
    }

    render() {
      const props = {
        ...this.props,
        [paramName]: this.state.value,
        [toggleName]: this.toggle,
      };
      return <Cmp {...props} />;
    }
  }
);
