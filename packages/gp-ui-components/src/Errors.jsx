import React, { Component, PropTypes } from 'react';

export default class Errors extends Component {

  static propTypes = {
    errors: PropTypes.array,
  }

  renderError(error, index) {
    return (
      <div key={index} className="validation-error aui-message aui-message-error">
        {error.toString()}
      </div>
    );
  }

  render() {
    const { errors } = this.props;
    return (
      <div>
        {errors && errors.map(this.renderError)}
      </div>
    );
  }

}
