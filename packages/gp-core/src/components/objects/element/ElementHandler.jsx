import React from 'react';
import last from 'lodash/last';
import get from 'lodash/get';
import connectToConfig from 'gp-core/lib/modules/connectToConfig';
import { connect } from 'react-redux';
import { objectSelector } from 'gp-core/lib/redux/selectors/objects';
import { elementMetaSelector, getLoadingState as getElementLoadingState } from 'gp-core/lib/redux/selectors/element';
import { getLoadingState as getRecordLoadingState } from 'gp-core/lib/redux/selectors/record';
import { bindActionCreators } from 'redux';
import { splatSelector, querySelector } from 'gp-core/lib/redux/selectors/routing';
import * as elementActions from 'gp-core/lib/redux/modules/element';
import ElementLikeHandler from './ElementLikeHandler';

const ElementHandler = (props) => {
  const { element, elementLikeEntities, path } = props;
  /*
   * NOTE узнаем тип справочника, если это не 'element' (обычный справочник)
   * то выбираем из elementLikeEntities нужный для этого типа справочника компонент
   */
  const elementType = get(element, 'element.type', get(last(path), 'type'));
  const elementLikeEntity = (elementLikeEntities || []).find(e => e.type === elementType);
  const Handler = get(elementLikeEntity, 'HandlerComponent', ElementLikeHandler);
  return <Handler {...props} />;
};

const configuredElementHandler = connectToConfig(
  appConfig => ({
    elementLikeEntities: get(appConfig, 'modules.nsi.elementLikeEntities'),
  }),
)(ElementHandler);

export default connect(
  (state) => {
    const path = objectSelector(state);
    const elementMeta = elementMetaSelector(state)(get(last(path), 'absolutPath'));
    return {
      ...state.core.element,
      splat: splatSelector(state),
      query: querySelector(state),
      path,
      pageSetting: elementMeta,
      isFetching: getElementLoadingState(state, 'fetchElement'),
      isSaving: getElementLoadingState(state, 'makeCreateRecord') ||
        getRecordLoadingState(state, 'updateVersion', 'addNewVersion'),
    };
  },
  dispatch => ({ actions: bindActionCreators(elementActions, dispatch) }),
)(configuredElementHandler);
