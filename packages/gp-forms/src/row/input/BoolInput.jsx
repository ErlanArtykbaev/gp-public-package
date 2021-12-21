import React from 'react';

export default class BoolInput extends React.Component {
  handleChange = () => {
    if (this.props.onDataChange) {
      this.props.onDataChange(!this.props.data);
    }
  }
  render() {
    const { config, data, readOnly } = this.props;
    const className = `checkbox ${data && !readOnly ? 'checkbox-checked' : ''}`;

    return (
      <div
        className={className}
        onClick={this.handleChange}
      >
        <input
          type="checkbox"
          id={config.id}
          className={className}
          disabled={readOnly}
          name={config.id}
          defaultChecked={!!data}
        />
      </div>
    );
  }
}

BoolInput.propTypes = {
  data: React.PropTypes.bool,
  onDataChange: React.PropTypes.func.isRequired,
  config: React.PropTypes.object.isRequired,
  readOnly: React.PropTypes.bool,
};
