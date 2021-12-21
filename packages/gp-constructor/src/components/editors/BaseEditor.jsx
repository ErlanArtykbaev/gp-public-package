import React, { PropTypes } from 'react';
import { autobind } from 'core-decorators';
import Immutable from 'immutable';
import Div from '@gostgroup/gp-ui-components/lib/Div';
import Input from '../ui/Input';
import styles from './baseEditor.scss';
import AccessRightsConfig from './AccessRightsConfig';

@autobind
export default class BaseEditor extends React.Component {

  static contextTypes = {
    container: PropTypes.shape({
      permissionGroups: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.string,
        title: PropTypes.string,
      })),
    }),
  }

  static propTypes = {
    value: PropTypes.object.isRequired,
    onChange: PropTypes.func,
  }

  constructor() {
    super();

    this.state = {};
  }

  handleChange = field => (value) => {
    this.props.onChange(this.props.value.set(field, value));
  }

  handleHasAccessConfigChange(hasAccessConfig) {
    let typeConfig = this.props.value;

    typeConfig = typeConfig
      .set('hasAccessConfig', hasAccessConfig)
      .set('accessConfig', new Immutable.Map());

    this.props.onChange(typeConfig);
  }

  handleExpireTimeControlFieldChange(value) {
    this.props.onChange(this.props.value.set('expireTimeControlField', value));
  }

  handleUseExpireTimeChange(useExpireTime) {
    this.props.onChange(this.props.value.set('useExpireTime', useExpireTime));
  }

  handleAccessConfigChange = type => (value) => {
    const typeConfig = this.props.value;

    this.props.onChange(typeConfig.setIn(['accessConfig', type], value));
  }

  render() {
    const { container } = this.context;
    const { permissionGroups = [], store } = container;
    const typeConfig = this.props.value;
    // TODO закинуть вместо переменных в this.getConfig('somevalue') или что-то подобное
    const hasAccessConfig = typeConfig.get('hasAccessConfig');
    // const useExpireTime = typeConfig.get('useExpireTime');
    const useComment = typeConfig.get('useComment');
    const comment = typeConfig.get('comment');
    const hidden = typeConfig.get('hidden');
    // TODO сохранять консистентность
    // const expireTimeControlField = typeConfig.get('expireTimeControlField');
    const accessConfig = typeConfig.get('accessConfig');
    // const allProperties = store.getSelectedType().get('properties');
    // const dateFieldOptions = allProperties
    //   .filter(p => p.get('type') === 'date')
    //   .map(p => ({ value: p.getIn(['id', 'value']), label: p.getIn(['title', 'value']) }))
    //   .toJS();

    return (
      <div>
        <div className={styles.accessConfigBlock}>
          <Input
            type="bool"
            value={hasAccessConfig}
            label="Настройка прав доступа"
            onChange={this.handleHasAccessConfigChange}
          />
          <AccessRightsConfig
            hidden={!hasAccessConfig}
            permissionGroups={permissionGroups}
            accessConfig={accessConfig}
            onChange={this.handleAccessConfigChange}
          />
        </div>
        {/* <div className={styles.accessConfigBlock}>
          <Input
            type="bool"
            value={useExpireTime}
            label="Указывать время действия"
            onChange={this.handleUseExpireTimeChange}
          />
          <Div hidden={!useExpireTime}>
            <Select
              label="Поле для установки времени действия"
              options={dateFieldOptions}
              value={expireTimeControlField}
              onChange={this.handleExpireTimeControlFieldChange}
            />
          </Div>
        </div>*/}
        <div className={styles.accessConfigBlock}>
          <Input
            type="bool"
            value={hidden}
            label="Скрыто по умолчанию"
            onChange={this.handleChange('hidden')}
          />
        </div>
        <div className={styles.accessConfigBlock}>
          <Input
            type="bool"
            value={useComment}
            label="Добавить комментарий"
            onChange={this.handleChange('useComment')}
          />
          <Div hidden={!useComment}>
            <Input
              label="Комментарий"
              value={comment}
              onChange={this.handleChange('comment')}
            />
          </Div>
        </div>
      </div>
    );
  }

}
