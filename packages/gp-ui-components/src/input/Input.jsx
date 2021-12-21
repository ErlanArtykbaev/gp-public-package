import React from 'react';
import TextInput from './TextInput';
import FileInput from './FileInput';

export default class Input extends React.Component {

  static propTypes = {
    data: React.PropTypes.any,
    error: React.PropTypes.string,
    type: React.PropTypes.string,
  }

  constructor(props) {
    super(props);
  }

  render() {
    const { type } = this.props;

    switch (type) {
      case 'text':
        return <TextInput {...this.props} />;
      case 'file':
        return <FileInput {...this.props} />;
      default:
        return <TextInput {...this.props} />;
    }
  }

}
