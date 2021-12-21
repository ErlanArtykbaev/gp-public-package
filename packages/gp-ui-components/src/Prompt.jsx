import React from 'react';
import { render } from 'react-dom';
import Modal from 'react-bootstrap/lib/Modal';
import Button from 'react-bootstrap/lib/Button';
import FormControl from 'react-bootstrap/lib/FormControl';
import { autobind } from 'core-decorators';
import styles from './prompt.scss';

const promptDiv = document.createElement('div');
promptDiv.id = 'prompt';
document.body.appendChild(promptDiv);

@autobind
class Prompt extends React.Component {
  constructor() {
    super();

    this.state = {
      isVisible: false,
      value: '',
      okButtonLabel: 'Ок',
      cancleButtonLabel: 'Отмена',
    };

    window.confirmDialog = global.confirmDialog = this.showConfirm.bind(this);
    window.textDialog = global.textDialog = this.showTextDialog.bind(this);
  }

  showConfirm({
    title,
    body,
    okButtonLabel = this.state.okButtonLabel,
    cancelButtonLabel = this.state.cancelButtonLabel,
  }) {
    const promise = new Promise((res, rej) => {
      this.setState({
        isVisible: true,
        type: 'confirm',
        okButtonLabel,
        cancelButtonLabel,
        title,
        body,
        res,
        rej,
      });
    });
    return promise;
  }

  showTextDialog({ title, message }) {
    const promise = new Promise((res, rej) => {
      this.setState({
        isVisible: true,
        type: 'text',
        title,
        message,
        res,
        rej,
      });
    });
    return promise;
  }

  hide() {
    return this.setState({ isVisible: false, value: '' });
  }

  isOkButtonDisabled() {
    switch (this.state.type) {
      case 'text':
        return !this.state.value.length;
      default:
        return false;
    }
  }

  ok() {
    this.state.res(this.state);
    this.hide();
  }

  cancel() {
    this.state.rej();
    this.hide();
  }

  renderDialog() {
    switch (this.state.type) {
      case 'confirm':
        return this.renderConfirmDialog();
      case 'text':
        return this.renderTextDialog();
      default:
        return this.renderConfirmDialog();
    }
  }

  renderTextDialog() {
    const { message, value } = this.state;
    return (
      <div>
        {typeof message === 'function' ? message(this) : message}
        <FormControl
          className={styles.input}
          componentClass={'textarea'}
          rows="10"
          placeholder="Комментарий"
          value={value}
          onChange={e => this.setState({ value: e.target.value })}
        />
      </div>
    );
  }

  renderConfirmDialog() {
    return typeof this.state.body === 'function' ? this.state.body(this) : this.state.body;
  }

  // TODO make vertical-align config from props
  render() {
    const { okButtonLabel, cancelButtonLabel } = this.state;
    return (
      <Modal
        show={this.state.isVisible}
        keyboard
        dialogClassName={'modal-centered-dialog prompt-text-dialog'}
      >
        {this.state.title && <Modal.Header>
          {this.state.title}
        </Modal.Header>}
        <Modal.Body>
          {this.renderDialog()}
        </Modal.Body>
        <Modal.Footer>
          <Button bsStyle="primary" disabled={this.isOkButtonDisabled()} onClick={this.ok}>{okButtonLabel}</Button>
          <Button bsStyle="primary" onClick={this.cancel}>{cancelButtonLabel}</Button>
        </Modal.Footer>
      </Modal>
    );
  }
}

render(<Prompt />, document.getElementById('prompt'));
