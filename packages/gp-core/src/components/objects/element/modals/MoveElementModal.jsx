import React, { Component, PropTypes } from 'react';
import Select from 'react-select';
// TODO CRITICAL заменить на getImmutableRefs (тут используется отдельный модуль
// чисто для получения списка групп, но это бред)
import * as packControlActions from '@gostgroup/gp-module-pack-control/lib/redux/modules/packControl';
import * as elementActions from 'gp-core/lib/redux/modules/element';
import { elementSelector, currentElementSchemaSelector } from 'gp-core/lib/redux/selectors/element';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { isEmpty } from '@gostgroup/gp-utils/lib/functions';
import wrappedForm from '@gostgroup/gp-hocs/lib/wrappedForm';
import Modal from '@gostgroup/gp-ui-components/lib/Modal';

// TODO заменить использование packControl на получение списка групп
@connect(
  state => ({
    ...state.core.packControl,
    title: 'Перемещение справочника',
    isOpen: state.core.element.modalsState.move,
    element: elementSelector(state),
    schema: currentElementSchemaSelector(state),
  }),
  dispatch => ({
    actions: bindActionCreators(packControlActions, dispatch),
    elementActions: bindActionCreators(elementActions, dispatch),
    onClose: bindActionCreators(elementActions.closeMoveElementModal, dispatch),
    onMove: bindActionCreators(elementActions.moveElement, dispatch),
  }),
)
@wrappedForm
export default class MoveElementModal extends Component {

  static propTypes = {
    config: PropTypes.shape({}),
    actions: PropTypes.shape({}),
    onMove: PropTypes.func,
    element: PropTypes.shape({}),
  }

  constructor() {
    super();

    this.state = {
      selectedGroup: null,
    };
  }

  componentDidMount() {
    const { actions } = this.props;
    actions.getPacketControlConfig();
  }

  onGroupChange = (selectedGroup) => {
    if (isEmpty(selectedGroup)) {
      selectedGroup = null;
    }
    this.setState({ selectedGroup });
  }

  handleElementMove = () => {
    const { selectedGroup } = this.state;
    const { element } = this.props;
    const { absolutPath } = element;
    this.props.onMove(absolutPath, selectedGroup);
  }

  render() {
    const { config = {} } = this.props;
    if (config === null) return null;
    const { groups = [] } = config;
    const GROUP_OPTIONS = groups.map(({ id, title }) => ({ value: id, label: title }));

    return (
      <Modal
        {...this.props}
        saveButton
        saveButtonTitle="Переместить"
        saveButtonDisabled={this.state.selectedGroup === null}
        onSubmit={this.handleElementMove}
      >
        <div className="form-group">
          <label>Группа НСИ</label>
          <div style={{ width: 400, minHeight: 200 }}>
            <Select
              id="group-select"
              value={this.state.selectedGroup}
              options={GROUP_OPTIONS}
              placeholder={'Выберите группу'}
              onChange={this.onGroupChange}
            />
          </div>
        </div>
      </Modal>
    );
  }
}
