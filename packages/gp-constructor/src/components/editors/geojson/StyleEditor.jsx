import React, { Component, PropTypes } from 'react';
import { ChromePicker } from 'react-color';
import { AuiButton } from '@gostgroup/gp-ui-components/lib/buttons';
import { hexToRgb } from '../../../utils/colors';

export const defaultValue = {
  borderColor: '#D91E18',
  borderWidth: '2',
  fillColor: '#000000',
  fillTransparency: 0.0,
};

class StyleEditor extends Component {

  static propTypes = {
    value: PropTypes.object,
    onChange: PropTypes.func,
    disabled: PropTypes.bool,
  }

  state = {
    displayColorPicker: false,
  }

  handleChange(field, value) {
    const config = Object.assign({}, defaultValue, this.props.value);

    if (field === 'borderColor') {
      value = value.hex.toUpperCase();
    }

    if (field === 'fillColor') {
      config.fillTransparency = value.rgb.a;
      value = value.hex.toUpperCase();
    }

    config[field] = value;
    this.props.onChange(config);
  }

  handleClick(type) {
    this.setState({
      displayColorPicker: type,
    });
  }

  handleClose() {
    this.setState({ displayColorPicker: false });
  }

  render() {
    const { disabled } = this.props;

    const popover = {
      position: 'absolute',
      zIndex: '2',
    };
    const cover = {
      position: 'fixed',
      top: '0px',
      right: '0px',
      bottom: '0px',
      left: '0px',
    };

    const { fillColor, borderColor, fillTransparency, borderWidth } = this.props.value;

    const rgbaFill = hexToRgb(fillColor || defaultValue.fillColor);
    const rgbaBorder = hexToRgb(borderColor || defaultValue.borderColor);
    rgbaFill.a = fillTransparency || defaultValue.fillTransparency;

    return (
      <div className="row style-group">
        <div className="col-md-4" style={{ padding: 0 }}>
          <span className="lg">Цвет границ</span>
          <span className="lg">Цвет заливки</span>
          <span className="lg">Толщина границ</span>
          {/* <span className="lg">Прозрачность заливки</span> */}
        </div>
        <div className="col-md-4" style={{ padding: 0 }}>
          <AuiButton type="button" disabled={disabled} onClick={() => this.handleClick('borderColor')}>{borderColor || defaultValue.borderColor}</AuiButton>
          <AuiButton type="button" disabled={disabled} onClick={() => this.handleClick('fillColor')}>{fillColor || defaultValue.fillColor}</AuiButton>
          <span className="sm">{borderWidth || defaultValue.borderWidth}</span>
          <input type="range" disabled={disabled} className="input-range inpt" min="0" max="10" value={borderWidth || defaultValue.borderWidth} onChange={e => this.handleChange('borderWidth', e.target.value)} />
          {/* <span className="sm">{config.fillTransparency}</span>
          <input type="range" className="input-range inpt" min="0.2" max="1" step="0.1" value={config.fillTransparency} onChange={e => this.handleChange('fillTransparency', e.target.value)} /> */}
        </div>
        <div className="col-md-4" style={{ padding: 0 }}>
          <div
            className="box"
            style={{
              backgroundColor: `rgba(${rgbaFill.r}, ${rgbaFill.g}, ${rgbaFill.b}, ${rgbaFill.a})`,
              borderColor: borderColor || defaultValue.borderColor,
              borderWidth: `${borderWidth}px` || `${defaultValue.borderWidth}px`,
            }}
          />
        </div>
        { this.state.displayColorPicker ? <div style={popover}>
          <div style={cover} onClick={() => this.handleClose()} />
          <ChromePicker
            color={this.state.displayColorPicker === 'fillColor' ? rgbaFill : rgbaBorder}
            onChange={color => this.handleChange(this.state.displayColorPicker, color)}
            disableAlpha={this.state.displayColorPicker !== 'fillColor'}
          />
        </div> : null }
      </div>
    );
  }
}

export default StyleEditor;
