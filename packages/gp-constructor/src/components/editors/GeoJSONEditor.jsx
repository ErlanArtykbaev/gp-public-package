import React, { Component, PropTypes } from 'react';
import Immutable from 'immutable';
import StyleEditor from './geojson/StyleEditor';

class GeoJSONEditor extends Component {

  static propTypes = {
    value: PropTypes.object,
    onChange: PropTypes.func,
    property: PropTypes.object,
  }

  handleStyleChange = (value) => {
    this.props.onChange(Immutable.fromJS(value));
  }

  render() {
    const useStyles = this.props.property ? this.props.property.get('useStyles') : true;
    const disabled = this.props.property ? !this.props.property.get('isMutable') : false;
    if (!useStyles) return <div />;

    return (
      <StyleEditor disabled={disabled} value={this.props.value.toJS()} onChange={this.handleStyleChange} />
    );
  }
}

export default GeoJSONEditor;
