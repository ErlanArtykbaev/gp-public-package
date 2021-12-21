import React, { Component, PropTypes } from 'react';
import { autobind } from 'core-decorators';
import { DEFAULT_STEP_TEMPLATE, TYPE_OPTIONS } from 'gp-core/lib/redux/constants/processDefenition';
import cx from 'classnames';
import get from 'lodash/get';

import ButtonLink from '@gostgroup/gp-ui-components/lib/ButtonLink';
import ProcessStepComponent from './ProcessStepComponent';

@autobind
export default class ProcessElementComponent extends Component {

  static propTypes = {
    processes: PropTypes.shape({}),
    processId: PropTypes.string,
    usersMap: PropTypes.shape({}),
    users: PropTypes.array,
    roles: PropTypes.array,
    organizations: PropTypes.array,
    onElementChange: PropTypes.func,
    error: PropTypes.shape({}),
    insertPenultimate: PropTypes.bool,
  };
  constructor(props) {
    super(props);

    this.state = {
      taskCollapsed: {},
    };
  }

  shouldComponentUpdate(nextProps) {
    if (nextProps.processId !== this.props.processId) {
      this.setState({
        taskCollapsed: {},
      });
    }
    return true;
  }

  onTaskCollapsed(taskId) {
    const { taskCollapsed } = this.state;
    taskCollapsed[taskId] = !taskCollapsed[taskId];
    this.setState({
      taskCollapsed,
    });
  }
  onSkipChange(value, taskId) {
    const { onElementChange, usersMap } = this.props;
    usersMap[taskId].skipped = value;
    onElementChange(usersMap);
  }

  createTask(processId, taskId, i) {
    const { processes, usersMap, error, insertPenultimate } = this.props;
    const { taskCollapsed } = this.state;
    const isCollapsed = taskCollapsed[taskId] || false;
    const skipped = get(usersMap[taskId], 'skipped', false);
    const collapsedIconClass = cx('fa', {
      'fa-angle-right': isCollapsed,
      'fa-angle-down': !isCollapsed,
    });
    const isError = error ? error[taskId] : false;
    const panelClass = cx('panel', 'panel-default', { 'panel-danger': isError });
    const taskDynamic = get(processes[processId].userTasks[taskId], 'category', false);

    return (
      <div className={panelClass}>
        <div key={i} className="panel-heading">
          <ButtonLink
            title={isCollapsed ? 'Развернуть' : 'Свернуть'}
            style={{ display: 'inline-block', width: '12.5px', cursor: 'pointer' }}
            onClick={() => this.onTaskCollapsed(taskId)}
          >
            <i className={collapsedIconClass}>&nbsp;</i>
          </ButtonLink>
          <span
            style={{ userSelect: 'none', height: '40px', cursor: 'pointer', position: 'relative' }}
            onClick={() => this.onTaskCollapsed(taskId)}
          >
            {`Согласование для задачи «${processes[processId].userTasks[taskId].name}»`}
            <span className="aui-icon icon-required" style={{ top: 0 }} />
          </span>
        </div>
        {!isCollapsed &&
          <div className="panel-collapse">
            <div className="panel-body">
              <div className="form-group">
                <div className="checkbox">
                  <label>
                    <input
                      type="checkbox"
                      checked={skipped}
                      onChange={e => this.onSkipChange(e.target.checked, taskId)}
                    />
                    Пропустить задачу
                  </label>
                </div>
              </div>
              {
                usersMap[taskId].steps.map((step, stepIdx) => {
                  const stepError = isError && error[taskId].steps && error[taskId].steps[stepIdx] ? error[taskId].steps[stepIdx] : false;
                  return (
                    <div>
                      <ProcessStepComponent
                        key={`${taskId}-${stepIdx}`}
                        taskId={taskId}
                        stepIdx={stepIdx}
                        usersMap={usersMap}
                        typeOptions={TYPE_OPTIONS}
                        onElementChange={this.props.onElementChange}
                        users={this.props.users}
                        roles={this.props.roles}
                        organizations={this.props.organizations}
                        error={stepError}
                        dynamic={taskDynamic}
                        insertPenultimate
                      />
                    </div>
                  );
                })
              }
              {taskDynamic && <button
                onClick={() => this.addStep(taskId)}
                className="btn btn-default"
              >
                <i className="fa fa-plus"></i> Добавить шаг
              </button>
              }
            </div>
          </div>
        }
      </div>
    );
  }

  addStep(taskId) {
    const { onElementChange, usersMap, insertPenultimate } = this.props;

    if (insertPenultimate) {
      usersMap[taskId].steps.splice(-1, 0, {
        ...DEFAULT_STEP_TEMPLATE,
        sids: [],
      });
    } else {
      usersMap[taskId].steps.push({
        ...DEFAULT_STEP_TEMPLATE,
        sids: [],
      });
    }

    onElementChange(usersMap);
  }

  render() {
    const { processes, processId } = this.props;
    const processDefenition = processes[processId];
    let processTasks = [];
    const userTasks = get(processDefenition, 'userTasks', {});
    if (processDefenition && userTasks) {
      processTasks = Object.keys(userTasks);
    }

    return (
      <div>
        {
          processTasks.map((taskId, i) => this.createTask(processId, taskId, i))
        }
      </div>
    );
  }
}
