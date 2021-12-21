import React, { PropTypes } from 'react';
import { autobind } from 'core-decorators';
import { createValidDate } from '@gostgroup/gp-utils/lib/dates';
import transliterate from 'transliterate';
import Cursor from 'immutable/contrib/cursor';
import Immutable from 'immutable';
import map from 'lodash/map';
import { getElementStatuses, formatDate } from '@gostgroup/gp-utils/lib/util.js';
import ProcessDefinitionComponent from '@gostgroup/gp-core/lib/components/objects/rfc/ProcessDefinitionComponent';
import { validateKey, validateShortTitle, validateDate, validateDates } from '@gostgroup/gp-utils/lib/validate/main';
import Form from '@gostgroup/gp-core/lib/components/forms/Form';
import Field from '@gostgroup/gp-core/lib/components/forms/Field';

const validateProcess = pid => !pid ? 'Привяжите процесс согласования' : null;

// Вкладка "Главная" при создании справочника
@autobind
export default class MainDataController extends React.Component {

  static contextTypes = {
    container: PropTypes.shape({
      path: PropTypes.arrayOf(PropTypes.shape({})),
    }),
  }

  static propTypes = {
    readOnly: PropTypes.bool,
    isMutable: PropTypes.bool,
    main_data: PropTypes.shape({
      type: PropTypes.string,
      key: PropTypes.string,
      dateStart: PropTypes.string,
      dateEnd: PropTypes.string,
      fullTitle: PropTypes.string,
      shortTitle: PropTypes.string,
    }),
    onChangeMainValue: PropTypes.func,
    cursor: PropTypes.func,
    checkValidate: PropTypes.func,
    hideFields: PropTypes.arrayOf(PropTypes.string),
    mainType: PropTypes.object.isRequired,
    insertPenultimate: PropTypes.bool,
    requireProcess: PropTypes.bool,
  }

  constructor(props) {
    super(props);

    this.state = {
      keyError: null,
      shortTitleError: null,
      dateStartError: null,
      dateEndError: null,
      dateError: null,
    };
  }

  componentDidMount() {
    this.checkErrors();
  }

  onKeyChange(key) {
    const { container } = this.context;
    const { path } = container;
    const state = this.state;
    state.idTouched = !!key;
    state.keyError = validateKey(key, path);
    this.props.onChangeMainValue('key', key);
    if (!state.keyError) {
      this.updateTypeKey(key);
    }
    this.checkValidate(state);
  }

  onShortTitleChange(shortTitle) {
    const { container } = this.context;
    const { path } = container;
    const state = this.state;
    state.shortTitleError = validateShortTitle(shortTitle);

    if (!this.state.idTouched && this.props.isMutable) {
      const key = transliterate(shortTitle).toLowerCase().replace(/[^a-z_0-9]/g, '_');
      state.keyError = validateKey(key, path);
      this.props.onChangeMainValue('key', key);

      if (!state.keyError) {
        this.updateTypeKey(key);
      }
    }
    if (!this.props.main_data.fullTitle || this.props.main_data.shortTitle === this.props.main_data.fullTitle) {
      this.props.onChangeMainValue('fullTitle', shortTitle);
    }
    this.props.onChangeMainValue('shortTitle', shortTitle);
    this.checkValidate(state);
  }

  onDateStartChange(valueLang) {
    const value = createValidDate(valueLang);
    const state = this.state;
    state.dateStartError = validateDate(value);
    state.dateError = validateDates(value, this.props.main_data.dateEnd);
    this.props.onChangeMainValue('dateStart', value);
    this.checkValidate(state);
  }

  onDateEndChange(valueLang) {
    const value = createValidDate(valueLang);
    const state = this.state;
    state.dateEndError = validateDate(value);
    state.dateError = validateDates(this.props.main_data.dateStart, value);
    this.props.onChangeMainValue('dateEnd', value);
    this.checkValidate(state);
  }

  onFullTitleChange(value) {
    this.props.onChangeMainValue('fullTitle', value);
  }

  onProcessChange(processDefenitionId, assignedUserTasks) {
    this.props.onChangeMainValue('processDefenitionId', processDefenitionId);
    this.props.onChangeMainValue('assignedUserTasks', assignedUserTasks);
    const processError = this.props.requireProcess && validateProcess(processDefenitionId);
    this.setState({ processError }, () => this.checkValidate(this.state));
  }

  onStatusChange(value) {
    this.props.onChangeMainValue('status', value.target.value);
  }

  onInlineEditableChange(value) {
    this.props.mainType.set('isInlineEditable', Immutable.fromJS(value));
  }

  onEditableChange(type) {
    const cursor = this.props.cursor(['typeList']);
    let index = cursor.get('types').findIndex(t => t.get('uuid') === type.get('uuid'));

    if (index > -1) {
      cursor.update('types', types => types.set(index, type));
    } else {
      index = cursor.get('global').findIndex(t => t.get('uuid') === type.get('uuid'));
      if (index > -1) {
        cursor.update('global', types => types.set(index, type));
      }
    }
  }

  // Обновляет ключ главного типа (схемы) в случае изменения ключа справочника
  updateTypeKey(key) {
    const { cursor } = this.props;
    const typesCursor = cursor(['typeList']);

    typesCursor.update('types', (typesArray) => {
      if (typesArray.size > 0) {
        const mainTypeIndex = typesArray.findIndex(t => t.get('main') === true);
        let mainType = typesArray.get(mainTypeIndex);
        if (mainType) {
          mainType = mainType.setIn(['id', 'value'], key);
          mainType = mainType.setIn(['title', 'value'], key);
        }
        typesArray = typesArray.set(mainTypeIndex, mainType);
      }
      return Cursor.from(typesArray).deref();
    });
  }

  checkErrors() {
    const { container } = this.context;
    const { path } = container;
    const state = this.state;
    const { shortTitle = '', dateStart = '', dateEnd = '', key = '', processDefenitionId } = this.props.main_data;

    state.dateStartError = validateDate(dateStart);
    state.dateEndError = validateDate(dateEnd);
    state.shortTitleError = validateShortTitle(shortTitle);
    state.dateError = validateDates(dateStart, dateEnd);
    state.processError = this.props.requireProcess && validateProcess(processDefenitionId);
    if (this.props.isMutable) {
      state.keyError = validateKey(key, path);
    }
    this.setState(state);
  }

  // получает измененный объект state, чекает на наличие ошибок, передает в родителя и сеттит стейт
  checkValidate(state) {
    const { keyError, shortTitleError, dateStartError, dateEndError, dateError, processError } = state;
    const valid = (!keyError && !shortTitleError && !dateStartError && !dateEndError && !dateError && !processError);
    this.props.checkValidate('main_data', valid);
    this.setState(state);
  }

  render() {
    const { main_data, hideFields, requireProcess, insertPenultimate } = this.props;
    const isInlineEditable = this.props.mainType.get('isInlineEditable');
    const showField = name => !hideFields || !hideFields.includes(name);

    return (
      <Form>
        <div className="form form-horizontal">
          {showField('process') && (<Field
            title="Процесс согласования"
            required={!!requireProcess}
            error={this.state.processError}
          >
            <ProcessDefinitionComponent
              processDefenitionId={main_data.processDefenitionId}
              usersMap={main_data.assignedUserTasks}
              onProcessChange={this.onProcessChange}
              insertPenultimate
            />
          </Field>)}

          {showField('status') && (<Field title="Статус">
            <select
              name="status"
              id="status"
              className="select"
              disabled={this.props.readOnly}
              value={main_data.status}
              onChange={this.onStatusChange}
            >
              {map(getElementStatuses(), (label, status) =>
                <option value={status} key={status}>{label}</option>
              )}
            </select>
          </Field>)}

          <hr className="new-group-modal-hr" />

          {showField('shortTitle') && (<Field
            title="Краткое наименование"
            required
            value={main_data.shortTitle}
            onChange={this.onShortTitleChange}
            disabled={this.props.readOnly}
            error={this.state.shortTitleError}
          />)}

          {showField('key') && (<Field
            title="Ключ"
            required
            value={main_data.key}
            disabled={!this.props.isMutable}
            onChange={this.onKeyChange}
            error={this.state.keyError}
          />)}

          {showField('fullTitle') && (<Field
            title="Полное наименование"
            size="long"
            value={main_data.fullTitle}
            disabled={this.props.readOnly}
            onChange={this.onFullTitleChange}
          />)}

          {showField('isInlineEditable') && (<Field
            title="Отображать в табличном ввиде"
            type="bool"
            value={isInlineEditable}
            onChange={v => this.onInlineEditableChange(v)}
          />)}

          {showField('dateStart') && (<Field
            title="Начало действия"
            type={this.props.readOnly ? 'text' : 'date'}
            value={formatDate(main_data.dateStart)}
            onChange={this.onDateStartChange}
            disabled={this.props.readOnly}
            error={this.state.dateStartError}
          />)}

          {showField('dateEnd') && (<Field
            title="Окончание действия"
            type={this.props.readOnly ? 'text' : 'date'}
            value={formatDate(main_data.dateEnd)}
            onChange={this.onDateEndChange}
            disabled={this.props.readOnly}
            error={this.state.dateEndError}
          />)}

          {this.state.dateError &&
            <div style={{ marginLeft: 145 }} className="error">{this.state.dateError}</div>
          }
        </div>
      </Form>
    );
  }

}
