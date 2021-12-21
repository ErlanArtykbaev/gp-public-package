import React, { PropTypes, Component } from 'react';
import { autobind } from 'core-decorators';
import moment from 'moment';
import get from 'lodash/get';
import Timeline from '@gostgroup/gp-utils/lib/Timeline.js';
import { queryRFCReferences } from '@gostgroup/gp-api-services/lib/helpers/queryReferences';
import { createValidDate } from '@gostgroup/gp-utils/lib/dates';
import wrappedForm from '@gostgroup/gp-hocs/lib/wrappedForm';
import { Form } from '@gostgroup/gp-forms';
import Modal from '@gostgroup/gp-ui-components/lib/Modal';
import BasicVersionData from '../common/BasicVersionData';

function getModalTitle(record, version) {
  if (get(version, 'id')) {
    return `Редактирование версии записи "${record.title}" справочника ${get(record, 'element.schema.title', '')}`;
  } else if (get(record, 'id') && get(record, 'id') > 0) {
    return `Добавление новой версии записи "${record.title}" справочника ${get(record, 'element.schema.title', '')}`;
  }
  return 'Добавить запись';
  // `Редактирование новой записи в справочнике ${schema.title}` RfcModalEdit
}

@wrappedForm
@autobind
export default class NewRecordModal extends Component {

  static propTypes = {
    onSubmit: PropTypes.func,
    onClose: PropTypes.func,
    isOpen: PropTypes.bool,
    element: PropTypes.shape({}),
    schema: PropTypes.shape({}),
    // versions: PropTypes.arrayOf(PropTypes.shape({})),
    version: PropTypes.shape({}),
    rfcProcessId: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number,
    ]),
    startDate: PropTypes.string,
    endDate: PropTypes.string,
    data: PropTypes.shape({}),
    title: PropTypes.string,
    record: PropTypes.shape({}), // TODO add record class and shape
    readOnly: PropTypes.bool,
    isLoading: PropTypes.bool,
  }

  static defaultProps = {
    startDate: createValidDate(moment()),
    endDate: null,
    data: {},
    // title: getModalTitle(),
  }

  static disabled(state) {
    if (!state.formDataValid) return true;
    const { basicData } = state;

    return !basicData.isValid;
  }

  constructor(props) {
    super(props);

    const { data, endDate, record } = this.props;
    const versions = get(record, 'versions');
    let { startDate } = this.props;

    if (!startDate && versions) {
      const timeline = new Timeline(versions.map(({ dateStart, dateEnd }) => [dateStart, dateEnd]));
      startDate = timeline.next();
    }

    this.state = {
      basicData: {
        startDate,
        endDate,
        errors: {},
        isValid: true,
      },
      data,
      cleanData: null,
      formDataValid: false,
    };
  }

  onChange(data, cleanData, formDataValid = true) {
    this.setState({ data, cleanData, formDataValid });
  }

  onSubmit() {
    const { basicData, data } = this.state;
    const { startDate, endDate } = basicData;
    const cleanData = this.state.cleanData || data;

    this.props.onSubmit({ startDate, endDate, cleanData, version: this.props.version });
  }

  handleBasicDataChange(basicData) {
    this.setState({ basicData });
  }

  render() {
    const state = this.state;
    const { schema, element, rfcProcessId, record, readOnly, version } = this.props;
    const { data, basicData } = state;
    const title = this.props.title || getModalTitle(record, version);

    let resultQueryReferences;

    if (rfcProcessId) {
      resultQueryReferences = fullPath => queryRFCReferences(fullPath, rfcProcessId);
    }

    return (
      <Modal
        title={title}
        saveButton
        saveButtonDisabled={NewRecordModal.disabled(state)}
        onSubmit={this.onSubmit}
        isOpen={this.props.isOpen}
        onClose={this.props.onClose}
        isLoading={this.props.isLoading}
      >
        <BasicVersionData basicData={basicData} onChange={this.handleBasicDataChange} readOnly={readOnly} />
        <Form
          config={schema}
          readOnly={readOnly}
          basicData={basicData}
          data={data}
          element={element}
          onChange={this.onChange}
          queryReferencesForEdit={resultQueryReferences}
        />
      </Modal>
    );
  }

}
