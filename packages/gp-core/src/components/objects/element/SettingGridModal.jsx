import React, { PropTypes, Component } from 'react';
import get from 'lodash/get';
import last from 'lodash/last';
import Immutable from 'immutable';

import { connect } from 'react-redux';
import { splatSelector } from 'gp-core/lib/redux/selectors/routing';
import { objectSelector } from 'gp-core/lib/redux/selectors/objects';
import { elementMetaSelector, currentElementSchemaSelector } from 'gp-core/lib/redux/selectors/element';
import { closeElementSettingsModal, setElementMeta } from 'gp-core/lib/redux/modules/element';

import { autobind } from 'core-decorators';
import wrappedForm from '@gostgroup/gp-hocs/lib/wrappedForm';
import { flattenSchema } from '@gostgroup/gp-utils/lib/flattenSchema';
import Modal from '@gostgroup/gp-ui-components/lib/Modal';
import SettingGridItems from './SettingGridItems';
import ConditionFilters from './ConditionFilters';
import Input from '@gostgroup/gp-constructor/lib/components/ui/Input';

@connect(
  (state) => {
    const path = objectSelector(state);
    return {
      isOpen: state.core.element.modalsState.settings,
      schema: currentElementSchemaSelector(state),
      splat: splatSelector(state),
      setting: elementMetaSelector(state)(get(last(path), 'absolutPath')),
    };
  },
  { onClose: closeElementSettingsModal, onSet: setElementMeta },
)
@wrappedForm
@autobind
export default class SettingGridModal extends Component {

  static propTypes = {
    onClose: PropTypes.func,
    onSet: PropTypes.func.isRequired,
    setting: PropTypes.shape({
      itemsForPage: PropTypes.number,
      conditionFilters: PropTypes.arrayOf(PropTypes.shape({})),
    }),
    splat: PropTypes.string.isRequired,
    schema: PropTypes.shape({}),
  }

  constructor(props) {
    super(props);

    const { setting } = props;

    this.state = {
      metadata: [],
      itemsForPage: setting.itemsForPage,
      itemsForPageError: '',
      disabled: false,
      conditionFilters: setting.conditionFilters || [],
    };
  }

  componentWillMount() {
    const { schema, setting } = this.props;
    const { columns } = setting;

    const metadata_store_ids = columns.map(prop => prop.columnName);

    const metadata = flattenSchema(schema)
      .filter(prop => !metadata_store_ids.includes(prop.id))
      .map(prop => ({
        columnName: prop.id,
        displayName: prop.title,
        type: prop.type,
        isHidden: columns.length !== 0,
      }));
    this.setState({
      metadata: Immutable.fromJS(columns.concat(metadata)),
    });
  }

  onColumnsChange(metadata) {
    return this.setState({ metadata });
  }

  handleConditionFiltersChange(conditionFilters) {
    this.setState({ conditionFilters });
  }

  handleItemsForPageChange(itemsForPage) {
    let error_text = '';

    if (/[^\d]+/.test(itemsForPage)) {
      error_text = 'Поле должно быть целочисленным!';
    }

    itemsForPage = parseInt(itemsForPage, 10);

    this.setState({ itemsForPage, itemsForPageError: error_text, disabled: !!error_text });
  }

  handleSubmit() {
    const { splat, onSet } = this.props;
    let { conditionFilters } = this.state;
    const metadata = this.state.metadata.toJS();
    conditionFilters = conditionFilters.filter(filter => filter.statements.length && filter.color);

    onSet(conditionFilters, splat, 'conditionFilters');
    onSet(metadata.filter(prop => !!prop), splat, 'columns');
    onSet(this.state.itemsForPage, splat, 'itemsForPage');

    this.props.onClose();
  }

  render() {
    const { itemsForPage, conditionFilters, disabled, metadata } = this.state;
    const { schema } = this.props;

    return (
      <Modal
        title="Настройка отображения для справочника"
        onClose={this.props.onClose}
        onSubmit={this.handleSubmit}
        saveButtonDisabled={disabled}
        saveButton
        isOpen
      >
        <SettingGridItems
          metadata={metadata}
          onChange={this.onColumnsChange}
        />
        <ConditionFilters
          metadata={metadata}
          conditionFilters={conditionFilters}
          onChange={this.handleConditionFiltersChange}
          properties={schema.config.properties}
        />
        <Input
          type={'text'}
          label={'Количество элементов на странице'}
          onChange={this.handleItemsForPageChange}
          value={itemsForPage}
          error={this.state.itemsForPageError}
        />
      </Modal>
    );
  }
}
