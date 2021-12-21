import React, { Component, PropTypes } from 'react';
import { autobind } from 'core-decorators';
import forEach from 'lodash/forEach';
import get from 'lodash/get';
import wrappedForm from '@gostgroup/gp-hocs/lib/wrappedForm';
import { DEFAULT_STEP_TEMPLATE } from 'gp-core/lib/redux/constants/processDefenition';
import Modal from '@gostgroup/gp-ui-components/lib/Modal';
import Form from 'gp-core/lib/components/forms/Form';
import ProcessElementComponent from './ProcessElementComponent';

@wrappedForm
@autobind
export default class ProcessDefinitionModal extends Component {

  static propTypes = {
    processes: PropTypes.shape({}),
    processDefenitionId: PropTypes.string,
    usersMap: PropTypes.shape({}),
    users: PropTypes.array,
    roles: PropTypes.array,
    organizations: PropTypes.array,
    onCancel: PropTypes.func,
    onAccept: PropTypes.func,
    isOpen: PropTypes.bool,
    isLoading: PropTypes.bool,
    insertPenultimate: PropTypes.bool,
  };

  constructor(props) {
    super(props);

    const { processDefenitionId, usersMap } = this.props;
    this.state = {
      usersMap: usersMap || {},
      processElement: processDefenitionId ? this.createProcessElementById(processDefenitionId, usersMap, null) : null,
      processDefenitionId: processDefenitionId || null,
      error: null,
      taskExpanded: {},
    };
    this.resetState();
  }

  resetState(processDefenitionId) {
    const defenitionId = processDefenitionId || this.props.processDefenitionId;
    this.setState({
      processElement: defenitionId ? this.createProcessElementById(defenitionId, {}, null) : null,
      usersMap: this.createUserMap(defenitionId) || {},
      processDefenitionId: defenitionId || null,
      error: null,
    });
  }

  createUserMap(processDefenitionId) {
    const { processes } = this.props;
    const usersMap = {};
    forEach(get(processes, [processDefenitionId, 'userTasks'], {}), (task, key) => {
      usersMap[key] = {
        taskName: task.name,
        taskId: key,
        skipped: false,
        steps: [{
          ...DEFAULT_STEP_TEMPLATE,
          sids: [],
        }],
      };
    });
    return usersMap;
  }

  createProcessElementById(processDefenitionId, usersMap, error = this.state.error) {
    const { processes, users, roles, organizations, insertPenultimate } = this.props;
    const taskExpanded = {};
    const processElement = (<ProcessElementComponent
      processId={processDefenitionId}
      usersMap={usersMap}
      users={users}
      roles={roles}
      organizations={organizations}
      onElementChange={this.onElementChange}
      processes={processes}
      error={error}
      insertPenultimate
    />);
    this.setState({
      processElement,
      processDefenitionId,
      usersMap,
      error,
      taskExpanded,
    });
  }

  async onElementChange(usersMap) {
    const { processDefenitionId } = this.state;
    await this.setState({ usersMap });
    this.createProcessElementById(processDefenitionId, usersMap);
  }

  onProcessChange(e) {
    const processDefenitionId = e.target.value;
    const usersMap = this.createUserMap(processDefenitionId);
    const error = null;
    this.createProcessElementById(processDefenitionId, usersMap, error);
  }

  onSave() {
    const { processes } = this.props;
    const { processDefenitionId, usersMap } = this.state;
    const error = {};
    if (processDefenitionId && processDefenitionId.length > 0) {
      const processDefenition = processes[processDefenitionId];
      Object.keys(processDefenition.userTasks).forEach((taskId) => {
        if (!usersMap[taskId] || !usersMap[taskId].steps || usersMap[taskId].steps.length === 0) {
          error[taskId] = {
            type: 'no-step',
            message: 'Необходимо заполнить согласующих для всех задач',
            steps: {},
          };
        } else {
          usersMap[taskId].steps.forEach((step, idx) => {
            usersMap[taskId].steps[idx].collapsed = true;
            if ((!step.sids || step.sids.length === 0) && !usersMap[taskId].skipped) {
              error[taskId] = error[taskId] || { steps: {} };
              usersMap[taskId].steps[idx].collapsed = false;
              error[taskId].steps[idx] = {
                type: 'no-select',
                message: 'Необходимо заполнить согласующих для данного шага!',
              };
            }
          });
        }
      });
      this.setState({
        error: (Object.keys(error).length > 0 ? error : null),
        processDefenitionId,
        usersMap,
      });
    }
    this.createProcessElementById(processDefenitionId, usersMap, Object.keys(error).length > 0 ? error : null);
    if (Object.keys(error).length === 0) {
      this.props.onAccept(processDefenitionId, usersMap);
    }
  }

  render() {
    const { processes, isOpen, onCancel, usersMap, processDefenitionId, isLoading } = this.props;

    let processElement = null;
    if (processDefenitionId && processDefenitionId.length > 0 && !isLoading) {
      if (!this.state.processElement) {
        processElement = this.createProcessElementById(processDefenitionId, usersMap);
      }
    }

    const noneOption = <option value="">не привязан к процессу</option>;
    const processSelect = Object.keys(processes).map(id => <option value={processes[id].id} key={processes[id].id}>{processes[id].title}</option>);

    return (
      <Modal
        isOpen={isOpen}
        onClose={onCancel}
        closeTimeoutMS={150}
        title="Настройка процесса согласования"
        cancelButton
        cancelButtonTitle="Отмена"
        onCancel={onCancel}
        saveButton
        saveButtonTitle="Сохранить"
        onSubmit={this.onSave}
      >
        <Form>
          <div style={{ paddingBottom: 40 }}>
            <div className="form-group">
              <label>Процесс согласования</label>
              <select
                name="process"
                id="process"
                className="form-control"
                disabled={false}
                value={this.state.processDefenitionId}
                onChange={this.onProcessChange}
              >
                {noneOption}
                {processSelect}
              </select>
            </div>
            {processElement || this.state.processElement}
          </div>
        </Form>
      </Modal>
    );
  }
}
