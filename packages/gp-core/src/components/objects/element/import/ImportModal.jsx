import React, { PropTypes } from 'react';
import { autobind } from 'core-decorators';
import { AuiButton } from '@gostgroup/gp-ui-components/lib/buttons';
import Modal from '@gostgroup/gp-ui-components/lib/Modal';
import Input from '@gostgroup/gp-ui-components/lib/input/Input';
import Div from '@gostgroup/gp-ui-components/lib/Div';

@autobind
export default class ImportModal extends React.Component {

  static propTypes = {
    onSubmit: PropTypes.func.isRequired,
  }

  constructor(props) {
    super(props);

    this.state = {
      file: {},
    };
  }

  onFileChange(file) {
    this.setState({ file });
  }

  onSubmit() {
    this.props.onSubmit(this.state.file);
  }

  resetState() {
    this.state = {
      file: {},
    };
  }

  render() {
    return (
      <Modal
        title="Импорт данных CSV"
        {...this.props}
        isWidthAdaptive
        width={500}
        resetState={this.resetState}
      >

        <h4>Загрузите CSV файл с данными справочника</h4>

        <Input
          type="file"
          onChange={this.onFileChange}
          fileTypes={'.csv'}
        />

        <Div hidden={!this.state.file.name} style={{ marginTop: 20 }}>
          <h5>Загруженный файл:</h5>
          <div>{this.state.file.name}</div>
        </Div>

        <AuiButton
          primary
          disabled={!this.state.file.name || !this.state.file.data_uri}
          onClick={this.onSubmit}
          style={{ marginTop: 20 }}
        >
          Загрузить
        </AuiButton>

      </Modal>
    );
  }

}
