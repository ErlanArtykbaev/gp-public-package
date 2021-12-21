import React, { PropTypes } from 'react';
import wrappedForm from '@gostgroup/gp-hocs/lib/wrappedForm';
import Modal from '@gostgroup/gp-ui-components/lib/Modal';
import Form from '../forms/Form';
import Field from '../forms/Field';

function disabled(data) {
  const { name, email } = data;
  const pattern = new RegExp(/^(("[\w-\s]+")|([\w-]+(?:\.[\w-]+)*)|("[\w-\s]+")([\w-]+(?:\.[\w-]+)*))(@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$)|(@\[?((25[0-5]\.|2[0-4][0-9]\.|1[0-9]{2}\.|[0-9]{1,2}\.))((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\.){2}(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\]?$)/i);

  return !(name && email && pattern.test(email));
}

@wrappedForm
export default class SubscribeChangesModal extends React.Component {

  static propTypes = {
    isOpen: PropTypes.bool,
    onClose: PropTypes.func,
    item: PropTypes.shape({
      absolutPath: PropTypes.string,
    }),
    subscribeChanges: PropTypes.func.isRequired,
  }

  constructor(props) {
    super(props);

    this.state = {
      data: {
        name: '',
        email: '',
      },
    };
  }

  onSubmit = () => {
    const data = this.state.data;
    data.path = this.props.item.absolutPath;

    this.props.subscribeChanges(data);
  }

  handleDataChange = field => (value) => {
    const { data } = this.state;
    data[field] = value;
    this.setState({ data });
  }

  render() {
    const data = this.state.data;

    return (
      <Modal
        title="Подписаться на изменения"
        saveButton
        saveButtonDisabled={disabled(data)}
        saveButtonTitle={'Подписаться'}
        isOpen={this.props.isOpen}
        onSubmit={this.onSubmit}
        onClose={this.props.onClose}
      >
        <Form>
          <Field
            title="Имя"
            value={data.name}
            onChange={this.handleDataChange('name')}
            required
          />
          <Field
            title="Email"
            value={data.email}
            onChange={this.handleDataChange('email')}
            required
          />
        </Form>
      </Modal>
    );
  }
}
