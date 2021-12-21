import React, { PropTypes, Component } from 'react';
import { autobind } from 'core-decorators';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Select from 'react-select';
import SimpleConfirmModal from '@gostgroup/gp-ui-components/lib/SimpleConfirmModal';
import { AuiButton } from '@gostgroup/gp-ui-components/lib/buttons';
import CheckResultModal from './CheckResultModal';
import * as packControlActions from '../redux/modules/packControl';

@connect(
  state => state.core.packControl,
  dispatch => ({ actions: bindActionCreators(packControlActions, dispatch) }),
)
@autobind
export default class PackControlHandler extends Component {

  static propTypes = {
    config: PropTypes.shape({
      types: PropTypes.arrayOf(PropTypes.shape({})),
    }),
    actions: PropTypes.shape({}),
    singleResult: PropTypes.shape({}),
  }

  constructor(props) {
    super(props);
    this.state = {
      all: false,
      group: false,
      element: false,
      selectedElement: null,
      infoModal: null,
      updateTimer: null,
      checkResultModal: null,
      errors: [],
    };
  }

  componentDidMount() {
    const { actions } = this.props;
    actions.getPacketControlConfig();
  }

  onElementChange(selectedElement) {
    this.setState({ selectedElement });
  }

  onGroupChange(selectedGroup) {
    this.setState({ selectedGroup });
  }

  startCheck() {
    const { config, actions } = this.props;
    if (!this.state.all && !this.state.group && !this.state.element) {
      this.setState({
        infoModal: {
          content: (
            <span>
              <h2>ВНИМАНИЕ</h2>
              Для запуска проверки необходимо выбрать область данных.
            </span>
          ),
          onAccept: () => {
            this.setState({ infoModal: null });
          },
        },
      });
    } else {
      const types = [];
      config.types.forEach((type) => {
        if (document.getElementById(type.id).checked) {
          types.push(type.id);
        }
      });
      if (types.length === 0) {
        this.setState({
          infoModal: {
            content: (
              <span>
                <h2>ВНИМАНИЕ</h2>
                Для запуска проверки необходимо включить хотя бы один тип проверки.
              </span>
            ),
            onAccept: () => {
              this.setState({ infoModal: null });
            },
          },
        });
      } else {
        const data = {};
        data.types = types;
        if (this.state.element) {
          data.element = this.state.selectedElement;
        }
        if (this.state.group) {
          data.group = this.state.selectedGroup;
        }
        actions.startPacketCheck(data);
      }
    }
  }

  resetResult() {
    const { actions } = this.props;
    actions.resetPacketCheckResult();
  }

  showErrors(uuid) {
    const { actions } = this.props;
    actions.getSingleResult(uuid)
      .then(() => this.showErrorsCallback(), this.showErrorsCallback);
  }

  showErrorsCallback() {
    const { singleResult } = this.props;
    this.setState({
      checkResultModal: true,
      errors: (singleResult || {}).items,
    });
  }

  refreshConfig() {
    const { actions } = this.props;
    actions.getPacketControlConfig();
  }

  stopChecking() {
    const { actions } = this.props;
    actions.packetControlStop();
  }

  render() {
    const { config } = this.props;
    if (!config) return <div />;
    if (config.stopping) {
      return (
        <div style={{ margin: 50, marginTop: 0, paddingTop: 30 }}>
          <h2>Производится остановка проверки, пожалуйста, подождите</h2>
          <AuiButton type="button" onClick={this.refreshConfig} style={{ marginTop: 20 }}>
            Обновить
          </AuiButton>
        </div>
      );
    }
    if (config.runing) {
      return (
        <div style={{ margin: 50, marginTop: 0, paddingTop: 30 }}>
          <h2>Производится проверка</h2>
          <span style={config.current === 0 ? { display: 'none' } : {}}>{`${config.current} из ${config.count} справочников проверено.`}</span>
          <div id="pack-control" className="aui-progress-indicator" style={{ display: 'none', marginTop: 20 }}>
            <span
              className="aui-progress-indicator-value-fill"
              style={{
                background: '#3572b0',
                width: (`${Math.round(100 * (config.current / config.count))}%`) }}
            />
            <span className="aui-progress-indicator-value" />
          </div>
          <br />
          <AuiButton type="button" onClick={this.refreshConfig} style={{ marginTop: 20 }}>
            Обновить статус
          </AuiButton>
          <AuiButton type="button" onClick={this.stopChecking} style={{ marginTop: 20 }}>
            Остановить проверку
          </AuiButton>
        </div>
      );
    }
    if (config.result) {
      return (
        <div style={{ margin: 50, marginTop: 0, paddingTop: 30 }}>
          <h2>Проверка завершена</h2>
          <form className="aui" style={{ width: 500, paddingTop: 30, marginBottom: 30 }}>
            <fieldset className="group">
              <div className="form-group">
                <label>Идентификатор проверки</label>
                <br />
                <span>{config.result.uuid}</span>
              </div>
              <div className="form-group">
                <label>Время запуска</label>
                <br />
                <span>{config.result.dateStart}</span>
              </div>
              <div className="form-group">
                <label>Время завершения</label>
                <br />
                <span>{config.result.dateEnd}</span>
              </div>
              <div className="form-group">
                <label>Инициализатор проверки</label>
                <br />
                <span>{config.result.user}</span>
              </div>
              <div className="form-group">
                <label>Общая информация о проверке</label>
                <br />
                <span>{config.result.info}</span>
              </div>
              <div className="form-group">
                <label>Общее количество ошибок</label>
                <br />
                <span>{config.result.errors}</span>
              </div>
              <div className="field-group">
                <AuiButton
                  primary
                  type="button"
                  onClick={() => this.showErrors(config.result.uuid)}
                >Смотреть ошибки</AuiButton>
                <AuiButton
                  primary
                  type="button"
                  onClick={this.resetResult}
                >Запустить другую проверку</AuiButton>
              </div>
            </fieldset>
          </form>
          <CheckResultModal
            isOpen={this.state.checkResultModal}
            errors={this.state.errors}
            onClose={() => this.setState({ checkResultModal: null })}
          />
        </div>
      );
    }

    const groupOptions = config.groups.map(({ id, title }) => ({ value: id, label: title }));
    const groups = this.state.group ?
      (<div className="form-group">
        <label>Группа НСИ</label>
        <div style={{ width: 400 }}>
          <Select
            id="group-select"
            value={this.state.selectedGroup}
            options={groupOptions}
            placeholder={'Выберите группу'}
            onChange={this.onGroupChange}
          />
        </div>
      </div>) : null;

    const elementOptions = config.elements.map(({ id, title }) => ({ value: id, label: title }));
    const elements = this.state.element ?
      (<div className="form-group">
        <label>Справочник НСИ</label>
        <div style={{ width: 400 }}>
          <Select
            id="elemen-select"
            value={this.state.selectedElement}
            options={elementOptions}
            placeholder={'Выберите справочник'}
            onChange={this.onElementChange}
          />
        </div>
      </div>) : null;

    return (
      <div style={{ margin: 50, marginTop: 0, paddingTop: 30 }}>
        <h2>Пакетный контроль качества данных системы НСИ</h2>
        <form className="aui" style={{ width: 500, paddingTop: 30, marginBottom: 30 }}>
          <fieldset className="group">
            <div className="form-group">
              <label>Область данных системы</label>
              <div className="aui-buttons">
                <button
                  type="button" className={`aui-button${this.state.all ? ' active' : ''}`}
                  onClick={() => this.setState({ all: true, group: false, element: false })}
                >
                  Все данные системы
                </button>
                <button
                  type="button" className={`aui-button${this.state.group ? ' active' : ''}`}
                  onClick={() => this.setState({ all: false, group: true, element: false })}
                >
                  Группа
                </button>
                <button
                  type="button" className={`aui-button${this.state.element ? ' active' : ''}`}
                  onClick={() => this.setState({ all: false, group: false, element: true })}
                >
                  Справочник
                </button>
              </div>
            </div>
            {groups}
            {elements}
            <div className="form-group">
              <label>Тип проверки</label>
              {this.props.config.types.map(type =>
                <div className="checkbox" key={type.id}>
                  <input className="checkbox" type="checkbox" name={type.id} id={type.id} />
                  <label htmlFor={type.id}>{type.title}</label>
                </div>
              )}
            </div>
            <div className="field-group">
              <AuiButton primary type="button" onClick={this.startCheck}>Запустить проверку</AuiButton>
            </div>
          </fieldset>
          <SimpleConfirmModal
            isOpen={!!this.state.infoModal}
            infoOnly
            {...this.state.infoModal}
          />
        </form>
      </div>
    );
  }
}
