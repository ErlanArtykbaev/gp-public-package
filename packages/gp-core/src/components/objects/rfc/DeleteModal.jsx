import React, { Component } from 'react';
import { AuiButton } from '@gostgroup/gp-ui-components/lib/buttons';
import Modal from '@gostgroup/gp-ui-components/lib/Modal';

export default class DeleteModal extends Component {

  static propTypes = {
    title: React.PropTypes.string.isRequired,
    description: React.PropTypes.string.isRequired,
    onSubmit: React.PropTypes.func.isRequired,
    onClose: React.PropTypes.func.isRequired,
  }

  render() {
    return (
      <Modal title={this.props.title} {...this.props}>
        <h4>{`Вы действительно хотите ${this.props.description}?`}</h4>

        <div style={{ width: '100%', textAlign: 'center' }}>
          <AuiButton primary onClick={this.props.onSubmit}>Да</AuiButton>
          <AuiButton primary onClick={this.props.onClose}>Нет</AuiButton>
        </div>
      </Modal>
    );
  }
}
