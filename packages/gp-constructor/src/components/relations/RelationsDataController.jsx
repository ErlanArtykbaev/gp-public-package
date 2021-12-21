import React, { Component, PropTypes } from 'react';
import RelationsEditor from '../relations-editor';

export default class RelationsDataController extends Component {

  static propTypes = {
    cursor: PropTypes.func.isRequired,
  };

  render() {
    const props = this.props;
    window._relationsEditorControllerProps = props;
    const cursor = props.cursor();
    const selected = cursor.get('selected');
    if (!selected) {
      return <div />;
    }
    const globalTypes = cursor.get('global').deref();
    let types = cursor.get('types').deref();
    types = types.concat(globalTypes);
    const type = types.find(t => t.get('uuid') === selected);
    if (!type) {
      return <div />;
    }
    return (
      <RelationsEditor
        type={type}
        onChange={this.onChange}
      />
    );
  }

  onChange(type) {
    const props = this.props;
    const cursor = props.cursor();
    let index = cursor.get('types').findIndex(t => t.get('uuid') === type.get('uuid'));
    if (index > -1) {
      cursor.update('types', types => types.set(index, type));
    } else {
      index = cursor.get('global').findIndex(t => t.get('uuid') === type.get('uuid'));
      if (index > -1) {
        cursor.update('global', types => types.set(index, type));
      }
    }
  }
}
