import React, { Component } from 'react';
import Modal from '@gostgroup/gp-ui-components/lib/Modal';

export default class ViewGroupModal extends Component {

  render() {
    const { data, title } = this.props;

    return (
      <Modal
        title={title}
        {...this.props}
      >
        <form className="aui top-label">
          <div className="field-group top-label">
            <label>Ключ:</label>
            <span>{data.key}</span>
          </div>
          <div className="field-group top-label">
            <label>Полное наименование:</label>
            <span>{data.fullTitle}</span>
          </div>
          <div className="field-group top-label">
            <label>Краткое наименование:</label>
            <span>{data.shortTitle}</span>
          </div>
        </form>
      </Modal>
    );
  }
}
