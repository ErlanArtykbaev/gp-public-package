import React, { PropTypes } from 'react';
import { getStatusLabels, isDisabledByParent } from '@gostgroup/gp-utils/lib/util.js';
import get from 'lodash/get';
import Form from '@gostgroup/gp-ui-components/lib/forms/Form';
import withModal from '@gostgroup/gp-hocs/lib/withModal';
import connectToConfig from 'gp-core/lib/modules/connectToConfig';

import { connect } from 'react-redux';
import { subscribeChanges, openSubscribeChangesModal, closeSubscribeChangesModal } from 'gp-core/lib/redux/modules/objects';

import ChangesModal from './record/ChangesModal';
import SubscribeChangesModal from './SubscribeChangesModal';

const OBJECT_TITLES = {
  group: 'Группа',
  element: 'Справочник',
};

@connectToConfig(
  appConfig => ({
    elementLikeEntitites: get(appConfig, 'modules.nsi.elementLikeEntities'),
  })
)
@connect(
  state => ({
    modalsState: state.core.objects.modalsState,
  }),
  { subscribeChanges, openSubscribeChangesModal, closeSubscribeChangesModal },
  null,
  { pure: false }
)
@withModal
export default class ItemData extends React.Component {

  static propTypes = {
    item: PropTypes.object.isRequired,
    children: PropTypes.node,
    modalIsOpen: PropTypes.bool,
    openModal: PropTypes.func,
    closeModal: PropTypes.func,
    subscribeChanges: PropTypes.func,
    openSubscribeChangesModal: PropTypes.func,
    closeSubscribeChangesModal: PropTypes.func,
    modalsState: PropTypes.shape({
      subscribeChanges: PropTypes.bool,
    }),
  }

  render() {
    const { item } = this.props;
    const { modalIsOpen, openModal, closeModal, elementLikeEntitites } = this.props;
    const type = OBJECT_TITLES[item.type] || get((elementLikeEntitites || []).find(e => e.type === item.type), 'title', 'Нет данных');
    const disabled = isDisabledByParent(item);
    const status = disabled ? 'not_available_parent' : item.status;

    return (
      <div style={{ marginTop: 60 }}>
        <Form>
          <Form.Group>
            <Form.Label>
              Ключ:
            </Form.Label>
            <Form.Span>{item.key}</Form.Span>
          </Form.Group>
          <Form.Group>
            <Form.Label>
              Полное наименование:
            </Form.Label>
            <Form.Span>{item.fullTitle}</Form.Span>
          </Form.Group>
          <Form.Group>
            <Form.Label>
              Тип:
            </Form.Label>
            <Form.Span className="capitalize">{type}</Form.Span>
          </Form.Group>
          {!!status &&
          <Form.Group>
            <Form.Label>Статус:</Form.Label>
            <Form.Span>{getStatusLabels(status, item.type)}</Form.Span>
          </Form.Group>}
          <Form.Group>
            <a className="pointer" onClick={openModal}>Посмотреть историю изменений</a>
          </Form.Group>
          {item.type !== 'group' &&
          <Form.Group>
            <a className="pointer" href={`#/graph/${item.id}`}>Посмотреть зависимости на графе</a>
          </Form.Group>}
          <Form.Group>
            <a className="pointer" onClick={this.props.openSubscribeChangesModal}>Подписаться на изменения</a>
          </Form.Group>
          {this.props.children}
        </Form>
        <ChangesModal
          record={item}
          isOpen={modalIsOpen}
          onClose={closeModal}
        />
        <SubscribeChangesModal
          isOpen={this.props.modalsState.subscribeChanges}
          item={item}
          subscribeChanges={this.props.subscribeChanges}
          onClose={this.props.closeSubscribeChangesModal}
        />
      </div>
    );
  }
}
