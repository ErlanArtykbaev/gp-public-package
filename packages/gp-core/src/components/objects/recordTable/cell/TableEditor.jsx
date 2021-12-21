import React from 'react';
import Modal from '@gostgroup/gp-ui-components/lib/Modal';
import AuiButton from '@gostgroup/gp-ui-components/lib/buttons/AuiButton';
import TableForm from '@gostgroup/gp-forms/lib/table/TableForm';
import togglable from '@gostgroup/gp-hocs/lib/togglable';
import wrappedForm from '@gostgroup/gp-hocs/lib/wrappedForm';

@wrappedForm
class TableModal extends React.Component {
  componentWillMount() {
    this.state = { initialValue: this.props.value };
  }

  render() {
    const close = () => this.props.toggle(false);
    const quit = () => {
      this.props.onValueChange(this.props.config, this.state.initialValue);
      close();
    };
    return (<Modal isOpen={this.props.isOpen} onClose={quit} onSubmit={close} saveButton>
      <TableForm {...this.props} />
    </Modal>);
  }
}

// TODO сделать уже наконец HOC для того чтобы была кнопка с модалкой
@togglable('isOpen', 'toggle', false)
export default class TableEditor extends React.Component {

  render() {
    return (
      <div>
        <AuiButton onClick={this.props.toggle}>Редактирование таблицы</AuiButton>
        {this.props.isOpen && <TableModal {...this.props} />}
      </div>
    );
  }
}
