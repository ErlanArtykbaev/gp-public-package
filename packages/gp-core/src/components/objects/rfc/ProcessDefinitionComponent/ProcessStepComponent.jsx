import React, { Component, PropTypes } from 'react';
import { autobind } from 'core-decorators';
import cx from 'classnames';
import Radio from 'gp-core/lib/components/forms/Radio';
import ButtonLink from '@gostgroup/gp-ui-components/lib/ButtonLink';
import ProcessSelectComponent from './ProcessSelectComponent';
import style from './style.scss';

@autobind
export default class ProcessStepComponent extends Component {
  static propTypes = {
    onElementChange: PropTypes.func.isRequired,
    usersMap: PropTypes.shape({}),
    taskId: PropTypes.string,
    stepIdx: PropTypes.string,
    typeOptions: PropTypes.array,
    error: PropTypes.bool,
    dynamic: PropTypes.bool,
    insertPenultimate: PropTypes.bool,
  }

  onChange(taskId, selectValue, sidType, stepIdx) {
    const { onElementChange, usersMap } = this.props;
    const stepData = usersMap[taskId].steps[stepIdx];
    const isParallel = stepData.parallel;
    const stepSelected = isParallel
      ? stepData.sids.filter(value => value.sidType.toLowerCase() !== sidType.toLowerCase())
      : [];
    const countRequired = stepData.requiredCompletionCount;
    selectValue
      .filter(id => stepSelected.every(value => value.id !== id))
      .forEach(id => stepSelected.push({ id, sidType: sidType.toLowerCase() }));
    const issetNotUser = stepSelected.some(item =>
      item.sidType.toLowerCase() === 'role' || item.sidType.toLowerCase() === 'organizations'
    );
    const maxRequired = stepSelected.length || 1;
    if (!isParallel) usersMap[taskId].steps[stepIdx].requiredCompletionCount = 1;
    if (countRequired > maxRequired && countRequired !== 1 && isParallel && !issetNotUser) usersMap[taskId].steps[stepIdx].requiredCompletionCount = maxRequired;
    usersMap[taskId].steps[stepIdx].sids = stepSelected;
    onElementChange(usersMap);
  }
  onCountChange(input, stepIdx, taskId) {
    const { onElementChange, usersMap } = this.props;
    const value = Math.min(Math.max(input.value, input.min), input.max);
    usersMap[taskId].steps[stepIdx].requiredCompletionCount = value;
    onElementChange(usersMap);
  }
  onChangeCollapsed(stepIdx, taskId) {
    const { onElementChange, usersMap } = this.props;
    usersMap[taskId].steps[stepIdx].collapsed = !usersMap[taskId].steps[stepIdx].collapsed;
    onElementChange(usersMap);
  }
  deleteStep(taskId, stepIdx) {
    const { onElementChange, usersMap } = this.props;
    usersMap[taskId].steps.splice(stepIdx, 1);
    onElementChange(usersMap);
  }
  sidTypeChange(value, taskId, stepIdx) {
    const { onElementChange, usersMap } = this.props;
    usersMap[taskId].steps[stepIdx].stepType = value;
    usersMap[taskId].steps[stepIdx].sids = [];
    onElementChange(usersMap);
  }
  onParallelChange(value, taskId, stepIdx) {
    const { onElementChange, usersMap } = this.props;
    usersMap[taskId].steps[stepIdx].parallel = value;
    usersMap[taskId].steps[stepIdx].sids = [];
    usersMap[taskId].steps[stepIdx].stepType = 'all';
    onElementChange(usersMap);
  }
  createLabel(isParallel, type, stepType, taskId, stepIdx) {
    if (isParallel) return <label>{ type.label }</label>;
    return (
      <div className={style.processRadio}>
        <Radio
          className={style.vRadio}
          value={type.value}
          title={type.label}
          onChange={value => this.sidTypeChange(value, taskId, stepIdx)}
          checked={type.value === stepType}
        />
      </div>
    );
  }

  render() {
    const { usersMap, taskId, stepIdx, typeOptions, error,
      dynamic, insertPenultimate } = this.props;
    const stepData = usersMap[taskId].steps[stepIdx];
    const stepsCount = usersMap[taskId].steps.length;

    const isCollapsed = stepData.collapsed;
    const isParallel = stepData.parallel;
    let stepType = stepData.stepType || 'users';
    if (stepType === 'all' && !isParallel) stepType = 'users';
    if (!stepData.stepType && !isParallel) stepType = `${stepData.sids[0].sidType.toLowerCase()}s`;
    const issetNotUser = stepData.sids.some(item =>
      item.sidType.toLowerCase() === 'role' || item.sidType.toLowerCase() === 'organizations'
    );

    const isError = error !== false;
    const panelClass = cx('panel', 'panel-default', { 'panel-danger': isError });
    const maxCount = !issetNotUser && stepData.sids.length >= 1 ? stepData.sids.length : 0;

    const collapsedIconClass = cx('fa', {
      'fa-angle-right': isCollapsed,
      'fa-angle-down': !isCollapsed,
    });
    const stepCollapsed = dynamic ? stepData.collapsed : false;

    return (
      <div className={panelClass}>
        {dynamic && <div className="panel-heading">
          <ButtonLink
            title={isCollapsed ? 'Развернуть' : 'Свернуть'}
            style={{ display: 'inline-block', width: '12.5px', cursor: 'pointer' }}
            onClick={() => this.onChangeCollapsed(stepIdx, taskId)}
          >
            <i className={collapsedIconClass}>&nbsp;</i>
          </ButtonLink>
          <span
            style={{ userSelect: 'none', height: '40px', cursor: 'pointer' }}
            onClick={() => this.onChangeCollapsed(stepIdx, taskId)}
          >
            { `Шаг #${stepIdx + 1}` }
          </span>

          {((insertPenultimate && stepIdx < stepsCount - 1) ||
          (!insertPenultimate && stepIdx > 0)) &&
          <ButtonLink
            title="Удалить свойство"
            style={{ cursor: 'pointer', float: 'right' }}
            onClick={() => this.deleteStep(taskId, stepIdx)}
          >
            <i className="fa fa-times" />
          </ButtonLink>
          }
        </div>
        }
        {!stepCollapsed &&
        <div className="panel-body" style={{ padding: '15px 10px' }}>
          {isError && <div className="row" style={{ textAlign: 'center', color: 'red' }}><i>{error.message}</i></div>}
          {dynamic && <div className="row">
            <div className="form-group col-sm-4">
              <div className="checkbox">
                <label>
                  <input
                    type="checkbox"
                    checked={isParallel}
                    onChange={e => this.onParallelChange(e.target.checked, taskId, stepIdx)}
                  />
                  Параллельное согласование
                </label>
              </div>
            </div>
          </div>
          }
          {isParallel && dynamic &&
            <div className="row">
              <div className="form-group col-sm-6">
                <label className="control-label">
                  Количество согласований для перехода на следующий шаг
                </label>
                <input
                  type="number"
                  className="form-control"
                  value={stepData.requiredCompletionCount}
                  min={1}
                  max={isParallel && maxCount ? maxCount : false}
                  onChange={event => this.onCountChange(event.target, stepIdx, taskId)}
                />
              </div>
            </div>
          }
          <div className="row">
            {
              typeOptions.map((type, typeIdx) => {
                const disabled = !isParallel && type.value !== stepType;
                const multiRender = isParallel && dynamic;
                return (
                  <div className="form-group col-sm-4" key={typeIdx} >
                    {
                      this.createLabel(multiRender, type, stepType, taskId, stepIdx)
                    }
                    <ProcessSelectComponent
                      placeholder={multiRender ? type.placeholderMany : type.placeholder}
                      items={this.props[type.value]}
                      selected={stepData.sids.filter(item => item.sidType.toLowerCase() === type.sidType.toLowerCase())}
                      sidType={type.sidType.toLowerCase()}
                      taskId={taskId}
                      onChange={this.onChange}
                      stepIdx={stepIdx}
                      multi={multiRender}
                      disabled={disabled}
                    />
                  </div>
                );
              })
            }
          </div>
        </div>
        }
      </div>
    );
  }
}
