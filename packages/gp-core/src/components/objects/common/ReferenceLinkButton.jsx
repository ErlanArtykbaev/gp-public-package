import React, { PropTypes } from 'react';
import get from 'lodash/get';
import { RecordService, ElementService } from '@gostgroup/gp-api-services/lib/services';
import withModal from '@gostgroup/gp-hocs/lib/withModal';
import extractVersionObject from '@gostgroup/gp-nsi-utils/lib/extractVersionObject';

import { connect } from 'react-redux';
import { makeUpdateVersion, getCurrentRecord } from '../../../redux/modules/record';
import { makeCreateRecord } from '../../../redux/modules/element';
import { getLoadingState } from '../../../redux/selectors/record';
import BaseNewRecordModal from '../element/NewRecordModal';

const style = {
  display: 'inline-block',
  marginLeft: '10px',
};

const NewRecordModal = connect(
  state => ({
    isLoading: getLoadingState(state, 'updateVersion'),
  })
)(BaseNewRecordModal);

@connect(
  null,
  { makeUpdateVersion, getCurrentRecord, makeCreateRecord },
)
@withModal
export default class ReferenceLinkButton extends React.Component {

  static propTypes = {
    modalIsOpen: PropTypes.bool,
    openModal: PropTypes.func,
    closeModal: PropTypes.func,
    // getCurrentRecord: PropTypes.func,
    makeUpdateVersion: PropTypes.func,
    makeCreateRecord: PropTypes.func,
    onSave: PropTypes.func,
    referenceKey: PropTypes.string,
    id: PropTypes.string,
    style: PropTypes.shape({}),
  }

  static defaultProps = {
    onSave: () => {},
  }

  state = {}

  onUpdate = (data) => {
    const { referenceKey, id } = this.props;
    this.props.makeUpdateVersion(`${referenceKey}/${id}`, data).then(() => {
      this.props.closeModal();
      this.props.onSave();
    });
  }

  onAdd = (data) => {
    const { referenceKey } = this.props;
    this.props.makeCreateRecord(`${referenceKey}`, data).then(() => {
      this.props.closeModal();
      this.props.onSave();
    });
  }

  fetchElementAndOpenModal = async () => {
    const { referenceKey, id } = this.props;
    const record = await RecordService.path(referenceKey, id).get();
    const element = await ElementService.path(referenceKey).get();
    const { schema } = element;

    this.setState({
      record,
      element,
      schema,
    }, () => {
      this.props.openModal();
    });
  }

  addNew = async () => {
    const { referenceKey } = this.props;
    const element = await ElementService.path(referenceKey).get();
    const { schema } = element;

    this.setState({
      element,
      schema,
    }, () => {
      this.props.openModal();
    });
  }

  render() {
    const { schema, element, record } = this.state;
    const { data, id } = this.props;

    return (
      <div style={{ ...style, ...this.props.style }}>
        {id && <button type="button" className="sh-btn" onClick={this.fetchElementAndOpenModal}>Редактировать</button>}
        {!id && <button type="button" className="sh-btn" onClick={this.addNew}>Добавить</button>}
        <NewRecordModal
          isOpen={this.props.modalIsOpen}
          onSubmit={id ? this.onUpdate : this.onAdd}
          data={data || extractVersionObject(record)}
          version={get(record, 'version')}
          record={record}
          schema={schema}
          element={{ element }}
          onClose={this.props.closeModal}
        />
      </div>
    );
  }
}
