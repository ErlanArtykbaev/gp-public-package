import React, { PropTypes, Component } from 'react';
import { autobind } from 'core-decorators';
import { withRouter } from 'react-router';
import SimpleDropdown from '@gostgroup/gp-ui-components/lib/dropdown/SimpleDropdown';

import connectToConfig from 'gp-core/lib/modules/connectToConfig';
import get from 'lodash/get';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as objectsActions from 'gp-core/lib/redux/modules/objects';
import * as elementModuleActions from 'gp-core/lib/redux/modules/element';
import { getLoadingState as getElementLoadingState } from 'gp-core/lib/redux/selectors/element';
import { getLoadingState } from 'gp-core/lib/redux/selectors/objects';
import AuiButton from '@gostgroup/gp-ui-components/lib/buttons/AuiButton';

import ConfirmModal from '@gostgroup/gp-ui-components/lib/modals/ConfirmModal';
import BaseNewGroupModal from '../NewGroupModal';
import BaseNewElementModal from '../NewElementModal';

const NewGroupModal = connect(
  state => ({
    isLoading: getLoadingState(state, 'makeCreateGroup'),
  })
)(BaseNewGroupModal);
const EditGroupModal = connect(
  state => ({
    isLoading: getLoadingState(state, 'makeUpdateGroup'),
  })
)(BaseNewGroupModal);
const NewElementModal = connect(
  state => ({
    isLoading: getElementLoadingState(state, 'makeCreateElement'),
  })
)(BaseNewElementModal);


@connect(
  state => ({
    ...state.core.objects,
    elementLikeModalIsLoading: getElementLoadingState(state, 'makeCreateElement') || getLoadingState(state, 'getObjectTree'),
  }),
  dispatch => ({
    actions: bindActionCreators(objectsActions, dispatch),
    elementActions: bindActionCreators(elementModuleActions, dispatch),
  }),
)
@connectToConfig(
  config => ({
    elementLikeEntities: get(config, 'modules.nsi.elementLikeEntities', []),
  })
)
@withRouter
@autobind
export default class Toolbar extends Component {

  state = {
    modals: {},
  }

  addNewGroup(data) {
    const { actions, splat } = this.props;
    actions.createGroup(splat, data);
  }

  editGroup(data) {
    const { actions, splat } = this.props;
    actions.updateGroup(splat.split('/').slice(0, -1).join('/'), data);
  }

  createElement({ schema, main_data }) {
    const { elementActions } = this.props;
    const currentEntity = this.findEntityByType(main_data.type, this.props.elementLikeEntities);

    // ???????? ?????? ???????????????????????? ???????? ???????????? ?? ?????????????? elementService ???? ???????????????????? ??????
    // ?????? ?????????????? ???????????????? ???????????? ????????????????????????
    // :TODO ???????????????????? ?????????? ??????????????
    if (currentEntity && currentEntity.elementService) {
      elementActions.createElement(this.props.item, schema, main_data, currentEntity.elementService);
    } else {
      elementActions.createElement(this.props.item, schema, main_data);
    }
  }

  findEntityByType(type, entities) {
    return entities.find(entity => entity.type === type ? entity : undefined);
  }

  handleGlobalTypeSave(schema) {
    const { elementActions } = this.props;
    elementActions.createGlobalType(schema);
  }

  deleteGroup() {
    const { actions, splat } = this.props;
    actions.deleteGroupRFC(splat);
  }

  deleteGroupHard() {
    const { splat, actions } = this.props;
    actions.deleteGroup(splat);
  }

  restoreGroup() {
    const { splat, actions } = this.props;
    actions.restoreGroupRFC(splat);
  }

  handleDeleteGroupButtonClick() {
    const { item, actions } = this.props;
    const removed = (item.status && item.status === 'not_available');
    if (removed) {
      actions.openRestoreGroupModal();
    } else {
      const permission = item.permissions || [];
      if (permission.includes('hard_admin')) {
        actions.openDeleteHardGroupModal();
      } else {
        actions.openDeleteGroupModal();
      }
    }
  }

  render() {
    const { item, disabled, modalsState, actions,
      elementLikeModalIsLoading } = this.props;
    const removed = (item.status && item.status === 'not_available');
    const permission = item.permissions || [];

    return (
      <div>
        <div className="float-right">
          <div className="aui-buttons">
            <SimpleDropdown title="??????????????">
              <AuiButton
                style={{ width: '100%' }}
                disabled={disabled}
                onClick={actions.openCreateGroupModal}
              >
                ????????????
              </AuiButton>
              <AuiButton
                style={{ width: '100%' }}
                disabled={disabled}
                onClick={actions.openCreateElementModal}
              >
                ????????????????????
              </AuiButton>
              {this.props.elementLikeEntities.map(entity => (
                <AuiButton
                  style={{ width: '100%' }}
                  key={entity.type}
                  onClick={actions.openModal.bind(null, entity.type)}
                >
                  <span className="capitalize">
                    {entity.toolbarTitle || entity.title}
                  </span>
                  <entity.ModalComponent
                    isOpen={modalsState[entity.type]}
                    onSubmit={this.createElement}
                    onGlobalTypeSave={this.handleGlobalTypeSave}
                    onClose={actions.closeModal.bind(null, entity.type)}
                    isLoading={elementLikeModalIsLoading}
                    item={this.props.item}
                    type={entity.type}
                  />
                </AuiButton>
              ))}
            </SimpleDropdown>
            <AuiButton
              disabled={permission.indexOf('edit_group') === -1 || disabled}
              onClick={actions.openEditGroupModal}
              type="button"
            >
              ?????????????????????????? ????????????
            </AuiButton>
            <AuiButton
              disabled={permission.indexOf('delete_group') === -1 || (!removed && disabled)} onClick={this.handleDeleteGroupButtonClick}
            >
              {removed ? '???????????????????????? ????????????' : '?????????????? ????????????'}
            </AuiButton>
          </div>
        </div>

        <NewGroupModal
          isOpen={modalsState.createGroup}
          onSubmit={this.addNewGroup}
          onClose={actions.closeCreateGroupModal}
        />

        <EditGroupModal
          title="?????????????????????????? ????????????"
          isOpen={modalsState.editGroup}
          onSubmit={this.editGroup}
          data={this.props.item}
          onClose={actions.closeEditGroupModal}
          isEditGroup
        />

        <ConfirmModal
          title="???????????????? ????????????"
          isOpen={modalsState.deleteGroup}
          alarm
          onSubmit={this.deleteGroup}
          text="???? ?????????????????????????? ???????????? ?????????????? ????????????"
          name={this.props.item.shortTitle}
          onClose={actions.closeDeleteGroupModal}
        />
        <ConfirmModal
          title="???????????????????????????? ????????????"
          isOpen={modalsState.restoreGroup}
          onSubmit={this.restoreGroup}
          text="???? ?????????????????????????? ???????????? ???????????????????????? ????????????"
          name={this.props.item.shortTitle}
          onClose={actions.closeRestoreGroupModal}
        />
        <ConfirmModal
          title="???????????????? ????????????"
          isOpen={modalsState.deleteHardGroup}
          alarm
          onSubmit={this.deleteGroupHard}
          text="???? ?????????????????? ?????????????? ??????????????????????????????????. ???????????? ?????????? ?????????????? ???? ?????????????? ?????? ?????????????????????? ??????????????????????????. ???? ?????????????????????????? ???????????? ?????????????? ????????????"
          name={this.props.item.shortTitle}
          onClose={actions.closeDeleteHardGroupModal}
        />

        <NewElementModal
          isOpen={modalsState.createElement}
          onSubmit={this.createElement}
          onGlobalTypeSave={this.handleGlobalTypeSave}
          onClose={actions.closeCreateElementModal}
          item={this.props.item}
        />
      </div>
    );
  }

}

Toolbar.propTypes = {
  item: PropTypes.shape({ // TODO move to Group class shape
    shortTitle: PropTypes.string,
  }),
  disabled: PropTypes.bool,
  // path: PropTypes.arrayOf(PropTypes.shape({})),
  modalsState: PropTypes.shape({}),
  actions: PropTypes.shape({}),
  elementActions: PropTypes.shape({}),
  splat: PropTypes.string,
  elementLikeEntities: PropTypes.arrayOf(PropTypes.shape({
    type: PropTypes.string,
    title: PropTypes.string,
    ModalComponent: PropTypes.func,
  })),
};
