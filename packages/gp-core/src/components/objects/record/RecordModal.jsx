import React, { Component } from 'react';
import isEmpty from 'lodash/isEmpty';
import last from 'lodash/last';
import { computableField, formatDate } from '@gostgroup/gp-utils/lib/util.js';
import { Form } from '@gostgroup/gp-forms';
import ModalVersionsList from './ModalVersionsList';
import Modal from '@gostgroup/gp-ui-components/lib/Modal';
import ReferenceLink from '../ReferenceLink';

export default class RecordModal extends Component {

  constructor(props) {
    super(props);

    this.state = {
      params: {},
    };
  }

  changeVersion(versionId) {
    this.setState({ params: { versionId } });
  }

  render() {
    const { record } = this.props;
    const versions = record.versions;
    let versionId = this.props.versionId;
    let version = record.versions.find(v => v.id == versionId);
    if (!versionId || !version) {
      versionId = record.versionId;
      if (!versionId) {
        version = last(record.versions);
      } else {
        version = record.versions.find(v => v.id == versionId);
      }
    }
    const fullTitleText = computableField(record.fullTitle, version.object);
    const disabled = !!(typeof record.isAvailable !== 'undefined' && record.isAvailable === false);
    const fullTitle = disabled ? <h1 style={{ color: '#999' }}>{`${fullTitleText} (Не доступен)`}</h1> : <h1>{fullTitleText}</h1>;

    if (this.state.params.versionId) {
      versionId = `${this.state.params.versionId}`;
      version = record.versions.find(v => v.id == versionId);
    }

    return (
      <Modal title="Запись" {...this.props}>
        <div>
          {fullTitle}
          <div>
            <div className="aui-group">
              <div className="aui-item">
                <h3>Версия</h3>
                <form className="aui top-label">
                  <div className="field-group top-label">
                    <label>Начало действия:</label>
                    <span>{formatDate(version.dateStart) || 'Не указано'}</span>
                  </div>
                  <div className="field-group top-label">
                    <label>Окончание действия:</label>
                    <span>{formatDate(version.dateEnd) || 'Не указано'}</span>
                  </div>
                </form>
              </div>
              {!isEmpty(versionId) &&
              <div className="aui-item">
                <ModalVersionsList splat={this.props.splat} versions={versions} versionId={versionId} onChange={this.changeVersion.bind(this)} />
              </div>
              }
            </div>
            <Form
              config={record.element.schema}
              data={version.object}
              ReferenceLink={ReferenceLink}
              element={record}
              basicData={record}
            />
          </div>
        </div>
      </Modal>
    );
  }
}
