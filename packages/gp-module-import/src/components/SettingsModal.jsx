import React, { PropTypes, Component } from 'react';
import get from 'lodash/get';
import { autobind } from 'core-decorators';
import Immutable from 'immutable';
import Select from 'react-select';
import wrappedForm from '@gostgroup/gp-hocs/lib/wrappedForm';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { getImmutableRefs } from '@gostgroup/gp-core/lib/redux/selectors/objects';
import { getUsers, getRoles, getOrganizations } from '@gostgroup/gp-core/lib/redux/modules/rfc/config';

import Modal from '@gostgroup/gp-ui-components/lib/Modal';
import Form from '@gostgroup/gp-core/lib/components/forms/Form';
import { RELATIONS_PATH_PREFIX } from '@gostgroup/gp-constructor/lib/components/relations-editor';
import { BaseProcessDefinitionComponent } from '@gostgroup/gp-core/lib/components/objects/rfc/ProcessDefinitionComponent/ProcessDefinitionComponent';

import * as importActions from '../redux/modules/import';

const ProcessDefinitionComponent = connect(
  state => ({
    users: state.core.rfc.config.users,
    roles: state.core.rfc.config.roles,
    organizations: state.core.rfc.config.organizations,
    processes: state.core.import.processes_import,
  }),
  { getUsers, getProcessesList: importActions.getProcessesImportList, getRoles, getOrganizations }
)(BaseProcessDefinitionComponent);

@connect(
  state => ({
    ...state.core.import,
    immutableRefs: getImmutableRefs(state),
  }),
  dispatch => ({
    actions: bindActionCreators(importActions, dispatch),
  }),
)
@wrappedForm
@autobind
export default class SettingsModal extends Component {

  static propTypes = {
    onClose: PropTypes.func.isRequired,
    actions: PropTypes.shape({}),
    externalSystems: PropTypes.arrayOf(PropTypes.shape({})),
    data: PropTypes.shape({
      elementKey: PropTypes.string,
      users: PropTypes.shape({}),
      processId: PropTypes.string,
      externalSystemName: PropTypes.string,
    }),
    immutableRefs: PropTypes.shape({}),
  }

  constructor(props, context) {
    super(props, context);

    const { data } = props;

    this.state = {
      canEdit: true,
      isEditMode: false,
      elementKey: get(data, 'elementKey', ''),
      externalSystems: [],
      externalSystemName: get(data, 'externalSystemName', ''),
      externalSystemId: null,
      processId: get(data, 'processId', ''),
      users: get(data, 'users', {}),
    };
  }

  componentWillReceiveProps(props) {
    if (props.isOpen) {
      if (this.state.canEdit) {
        this.setState(props.data);
        this.setState({
          canEdit: false,
        });
      }
    }

    this.setState({
      isEditMode: !!props.data,
    });
  }

  onKeyChange(elementKey) {
    this.setState({ elementKey });
  }

  onSystemChange(externalSystemPath) {
    const { externalSystems } = this.props;
    const extSys = externalSystems;
    let externalSystemId = null;
    let externalSystemName = '';

    for (let i = 0; i < extSys.length; ++i) {
      if (extSys[i].absolutPath === externalSystemPath) {
        externalSystemId = extSys[i].id;
        externalSystemName = extSys[i].title;
      }
    }
    this.setState({
      externalSystemId,
      externalSystemName,
    });
  }

  onProcessChange(processId, users) {
    this.setState({ processId, users });
  }

  onSubmit() {
    const { actions } = this.props;

    const data = {
      externalSystemId: this.state.externalSystemId,
      elementKey: this.state.elementKey,
      processId: this.state.processId,
      tasks: this.state.users,
    };

    actions.postProcessImportMap(data)
      .then(() => {
        this.props.onClose();
      });
  }

  render() {
    const state = this.state;
    const { immutableRefs } = this.props;
    const refs = Immutable.fromJS(immutableRefs);
    const optionsDictionary = refs.toJS()
      .filter(({ id }) => (id.substr(0, RELATIONS_PATH_PREFIX.length) !== RELATIONS_PATH_PREFIX))
      .map(({ id, title }) => ({ value: id, label: title }));
    const externalSystems = (this.props.externalSystems || [])
      .map(({ absolutPath, title }) => ({ value: absolutPath, label: title }));
    const { elementKey, externalSystemName, processId, users } = this.state;

    return (
      <Modal
        title="Новая настройка импорта"
        resetState={this.resetState}
        isOpen
        saveButton
        saveButtonDisabled={!elementKey || !externalSystemName || !processId}
        onClose={this.props.onClose}
        onSubmit={this.onSubmit}
      >
        <Form>
          <div className="field-group">
            <label className="control-label">Ключ справочника</label>
            <Select
              value={elementKey}
              disabled={state.isEditMode}
              onChange={this.onKeyChange}
              options={optionsDictionary}
              placeholder={'Выберите справочник'}
            />
          </div>

          <div className="field-group">
            <label className="control-label">Внешняя система</label>
            <Select
              value={externalSystemName}
              onChange={this.onSystemChange}
              options={externalSystems}
              disabled={state.isEditMode}
              placeholder={'Выберите внешнюю систему'}
            />
          </div>

          <div className="field-group">
            <label>Процесс согласования</label>
            <ProcessDefinitionComponent
              processDefenitionId={processId}
              usersMap={users}
              onProcessChange={this.onProcessChange}
            />
          </div>
        </Form>
      </Modal>
    );
  }
}
