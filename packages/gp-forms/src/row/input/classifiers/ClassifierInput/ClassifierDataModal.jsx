import React, { PropTypes } from 'react';
import { autobind } from 'core-decorators';
import wrappedForm from '@gostgroup/gp-hocs/lib/wrappedForm';
import DefaultModal from '@gostgroup/gp-ui-components/lib/Modal';
/**
 * FIXME Пока не знаю что с этим делать
 */
import DefaultForm from '../../../../Form';

@wrappedForm
@autobind
export default class ClassifierDataModal extends React.Component {
  static defaultProps = {
    Modal: DefaultModal,
  };

  constructor(props) {
    super(props);

    this.state = {
      data: props.data,
    };
  }

  handleSubmit() {
    const { data } = this.state;
    this.props.onSubmit(data);
    this.props.onClose();
  }

  handleChange(data) {
    this.setState({ data });
  }

  render() {
    const { element, config, title, readOnly, Modal, Form } = this.props;
    const { data } = this.state;
    const FormComponent = Form || DefaultForm;
    return (
      <Modal
        isOpen
        saveButton={!readOnly}
        onSubmit={this.handleSubmit}
        onClose={this.props.onClose}
        title={title}
      >
        <FormComponent
          config={config}
          basicData={{}}
          element={{ element }}
          data={data}
          onChange={readOnly ? null : this.handleChange}
        />
      </Modal>
    );
  }
}

ClassifierDataModal.propTypes = {
  Modal: PropTypes.func,
  Form: PropTypes.func,
  config: PropTypes.shape({}),
  element: PropTypes.shape({}),
  data: PropTypes.shape({}).isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  title: PropTypes.string,
  readOnly: PropTypes.bool,
};
