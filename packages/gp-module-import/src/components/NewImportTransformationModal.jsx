import React, { PropTypes, Component } from 'react';
import { autobind } from 'core-decorators';
import wrappedForm from '@gostgroup/gp-hocs/lib/wrappedForm';
import AuiButton from '@gostgroup/gp-ui-components/lib/buttons/AuiButton';
import Modal from '@gostgroup/gp-ui-components/lib/Modal';
import Form from '@gostgroup/gp-core/lib/components/forms/Form';
import Field from '@gostgroup/gp-core/lib/components/forms/Field';

function disabled(state, asEditor = false) {
  const { title, xml } = state;

  return !((title && xml) || asEditor)/* && xml && (!hasInterval || typeof interval !== 'undefined')*/;
}

function getIntervalObject(interval) {
  if (interval >= 604800000) {
    return {
      interval: 604800000,
      intervalMultiplier: interval / 604800000,
    };
  } else if (interval >= 86400000) {
    return {
      interval: 86400000,
      intervalMultiplier: interval / 86400000,
    };
  } else if (interval >= 3600000) {
    return {
      interval: 3600000,
      intervalMultiplier: interval / 3600000,
    };
  } else if (interval >= 60000) {
    return {
      interval: 60000,
      intervalMultiplier: interval / 60000,
    };
  } else if (interval >= 1000) {
    return {
      interval: 1000,
      intervalMultiplier: interval / 1000,
    };
  }
  return {};
}

@wrappedForm
@autobind
export default class NewImportTransformationModal extends Component {

  static propTypes = {
    asEditor: PropTypes.bool,
    onUpdate: PropTypes.func,
    onSubmit: PropTypes.func,
    onClose: PropTypes.func,
    data: PropTypes.shape({}),
  }

  constructor(props) {
    super(props);

    const { asEditor } = props;

    if (asEditor) {
      const { data } = props;
      const { id, name, interval, transformation, file, params } = data;
      const intervalObject = getIntervalObject(interval);
      this.state = {
        id,
        title: name,
        interval: intervalObject.interval * intervalObject.intervalMultiplier,
        selectedInterval: intervalObject.interval,
        intervalMultiplier: intervalObject.intervalMultiplier,
        xml: transformation,
        hasInterval: !!interval,
        params,
        fileName: file,
      };
    } else {
      this.state = {
        title: '',
        xml: '',
        hasInterval: false,
        fileName: '',
      };
    }
  }

  componentWillReceiveProps(props) {
    if (!this.props.asEditor && props.asEditor) {
      const { data } = props;
      const { id, name, interval, transformation, file, params } = data;
      const intervalObject = getIntervalObject(interval);
      this.setState({
        id,
        title: name,
        interval: intervalObject.interval * intervalObject.intervalMultiplier,
        selectedInterval: intervalObject.interval,
        intervalMultiplier: intervalObject.intervalMultiplier,
        xml: transformation,
        hasInterval: !!interval,
        params,
        fileName: file,
      });
    }
  }

  onSelectedIntervalChange(e) {
    const selectedInterval = Number(e.target.value);
    this.setState({ selectedInterval, interval: this.state.intervalMultiplier * selectedInterval });
  }

  onManualIntervalChange(intervalMultiplier) {
    if (intervalMultiplier < 1) return;
    this.setState({
      intervalMultiplier,
      interval: intervalMultiplier * this.state.selectedInterval,
    });
  }

  async onTransformationFileChange(e) {
    const file = e.target.files[0];
    if (!/\.ktr$/.test(file.name)) {
      this.setState({ xml: '' });
      global.NOTIFICATION_SYSTEM.notify('Ошибка', 'Недопустимое имя файла. Файл должен иметь расширение ".ktr"', 'error');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = (event) => {
      event = event || window.event;
      const xml = event.target.result;
      this.setState({ xml, fileName: file.name });
    };
    reader.readAsText(file);
  }

  onTitleChange(title) {
    this.setState({ title });
  }

  onParamChange = id => (value) => {
    const params = this.state.params;
    params.forEach((param) => {
      if (param.id === id) {
        param.value = value;
      }
    });
    this.setState({ params });
  }

  onSubmit() {
    const data = {
      name: this.state.title,
      transformation: this.state.xml,
      file: this.state.fileName,
    };
    typeof this.state.interval !== 'undefined' && (data.interval = this.state.interval);
    typeof this.state.params !== 'undefined' && (data.params = this.state.params);
    typeof this.state.id !== 'undefined' && (data.id = this.state.id);

    if (this.props.asEditor) {
      this.props.onUpdate(data);
    } else {
      this.props.onSubmit(data);
    }
  }

  onHasIntervalChange(e) {
    const hasInterval = e.target.checked;
    const state = this.state;
    if (hasInterval) {
      this.setState({ hasInterval, interval: 3600000, selectedInterval: 3600000, intervalMultiplier: 1 });
    } else {
      state.hasInterval = hasInterval;
      delete state.interval;
      delete state.intervalMultiplier;
      delete state.selectedInterval;
      this.setState(state);
    }
  }

  render() {
    const state = this.state;
    const { title } = this.state;

    const params = (this.state.params || []).map(param => (
      <Field
        key={param.name}
        title={param.name}
        value={param.value}
        onChange={this.onParamChange(param.id)}
      />
    ));

    return (
      <Modal
        title="Задача импорта"
        isOpen
        saveButton
        saveButtonDisabled={disabled(state, this.props.asEditor)}
        onClose={this.props.onClose}
        onSubmit={this.onSubmit}
      >
        <Form>
          <div className="form form-horizontal">
            <Field
              title="Имя"
              required
              value={title}
              onChange={this.onTitleChange}
            />

            <Field
              type={'file'}
              title={'Загрузить задачу (.ktr)'}
              fileTypes={'.ktr'}
              required
              onChange={this.onTransformationFileChange}
              value={this.state.file}
              error={this.state.fileError}
            />

            {!!this.state.fileName &&
            <div className="field-group">
              <label>Загруженый файл</label>
              <span><p>{this.state.fileName}</p></span>
            </div>
          }
            {params.length ? 'Параметры:' : ''}
            {params}

            <div className="checkbox">
              <label>
                <input
                  type="checkbox"
                  checked={this.state.hasInterval}
                  onChange={this.onHasIntervalChange}
                />
              Периодическое выполнение
            </label>
            </div>

            {!!this.state.hasInterval &&
              <div>
                <div className="col-sm-2">
                  <select className="form-control w-200" disabled={!this.state.hasInterval} value={this.state.selectedInterval} onChange={this.onSelectedIntervalChange}>
                    <option value={1000}>Секунды</option>
                    <option value={60000}>Минуты</option>
                    <option value={3600000}>Часы</option>
                    <option value={86400000}>Дни</option>
                    <option value={604800000}>Недели</option>
                  </select>
                </div>
                <div className="col-sm-4">
                  <Field
                    type={'number'}
                    onChange={this.onManualIntervalChange}
                    value={this.state.intervalMultiplier}
                    disabled={!this.state.hasInterval}
                    min={1}
                  />
                </div>
              </div>
            }
          </div>
        </Form>
        <div style={{ paddingLeft: 15, marginTop: 20 }}>
          {!this.props.asEditor && <AuiButton
            disabled={disabled(state)}
            onClick={this.onSubmit}
          >
            Загрузить трансформацию
          </AuiButton>}
        </div>
      </Modal>
    );
  }

}
