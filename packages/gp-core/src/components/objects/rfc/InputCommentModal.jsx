import React, { Component } from 'react';
import Modal from '@gostgroup/gp-ui-components/lib/Modal';
import Form from '../../forms/Form';
import { AuiButton } from '@gostgroup/gp-ui-components/lib/buttons';

function disabled(state) {
  return !(state.data && state.data.length > 3);
}

export default class InputCommentModal extends Component {

  constructor(props) {
    super(props);

    this.onTextChange = this.onTextChange.bind(this);
    this.onSubmit = this.onSubmit.bind(this);

    const { data = '' } = this.props;

    this.state = {
      data,
    };
  }

  render() {
    const props = this.props;
    const state = this.state;
    const data = state.data;

    return (
      <Modal
        title={props.modalTitle}
        {...props}
      >
        <Form action={this.onSubmit}>
          <div className="field-group">
            <label>{props.textAreaTitle}</label>
            <input type="text" className="editor__rfc" value={data} onChange={this.onTextChange} />
            {disabled(state) ? <div className="error">Название ЗНИ должно содержать не менее 4-х символов</div> : null}
          </div>
        </Form>
        <div style={{ paddingLeft: 145 }}>
          <AuiButton primary disabled={disabled(state)} onClick={this.onSubmit}>
            {props.saveButtonName}
          </AuiButton>
        </div>
      </Modal>
    );
  }

  onTextChange(data) {
    this.setState({ data: data.target.value });
  }

  onSubmit() {
    const { data } = this.state;
    this.props.onSubmit(data);
  }
}
