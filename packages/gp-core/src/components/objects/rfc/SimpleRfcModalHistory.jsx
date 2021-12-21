import React, { Component, PropTypes } from 'react';
import wrappedForm from '@gostgroup/gp-hocs/lib/wrappedForm';
import StatusComponent from '@gostgroup/gp-ui-components/lib/StatusComponent';
import FormattedDate from '@gostgroup/gp-ui-components/lib/FormattedDate';
import Modal from '@gostgroup/gp-ui-components/lib/Modal';

@wrappedForm
export default class SimpleRfcModalHistory extends Component {

  static propTypes = {
    historyData: PropTypes.shape({}),
  }

  constructor(props) {
    super(props);

    this.state = {
      selectedTab: 0,
    };
  }

  selectTab(selectedTab) {
    this.setState({ selectedTab });
  }

  renderHistoryItemList(historyData) {
    const { selectedTab } = this.state;
    const tabsLi = historyData.history.map((historyItem, i) =>
      <li key={i} className={i === selectedTab ? 'menu-item active-tab' : 'menu-item'} role="presentation">
        <a role="tab" aria-selected={i === selectedTab ? 'true' : 'false'} onClick={() => this.selectTab(i)}>
          <strong>{ i + 1 }</strong>
        </a>
      </li>
    );

    return (
      <ul className="tabs-menu" role="tablist">
        {tabsLi}
      </ul>
    );
  }

  render() {
    const { historyData } = this.props;
    const { selectedTab } = this.state;

    const tabsDivs = historyData.history.map((historyItem, i) =>
      <div key={i} className={i === selectedTab ? 'tabs-pane active-pane' : 'tabs-pane'} role="tabpanel" aria-hidden={i === selectedTab ? 'false' : 'true'}>
        <h2>{`Этап "${historyItem.startActionName}"`}</h2>
        <h3>Атрибуты этапа изменения</h3>
        <form className="aui top-label">
          <div className="field-group top-label">
            <label>Время начала этапа:</label>
            <FormattedDate>{historyItem.startDate}</FormattedDate>
          </div>
          <div className="field-group top-label">
            <label>Время завершения этапа:</label>
            <FormattedDate>{historyItem.endDate}</FormattedDate>
          </div>
          <div className="field-group top-label">
            <label>Пользователь, запустивший этап:</label>
            <span>{historyItem.startUserId}</span>
          </div>
          <div className="field-group top-label">
            <label>Пользователь, получивший задачу после завершения этапа:</label>
            <span>{historyItem.endUserId}</span>
          </div>
        </form>
        <img role="presentation" src={`data:image/png;base64,${historyItem.diagram}`} />
      </div>
    );

    console.log(this.props);

    return (
      <Modal title={'История процесса'} {...this.props}>
        <form className="aui top-label">
          <div className="field-group top-label">
            <label>Имя процесса:</label>
            <span>{historyData.name}</span>
          </div>
          {/* <div className="field-group top-label">
            <label>Текущая задача:</label>
            <span>{historyData.currentTaskName}</span>
          </div> */}
          <div className="field-group top-label">
            <label>Дата старта процесса:</label>
            <FormattedDate>{historyData.dateStart}</FormattedDate>
          </div>
          <div className="field-group top-label">
            <label>Дата завершения процесса:</label>
            <FormattedDate>{historyData.dateEnd}</FormattedDate>
          </div>
          <div className="field-group top-label">
            <label>Статус:</label>
            <StatusComponent rowData={historyData} />
          </div>
        </form>
        <h2>Этапы процесса</h2>
        <div className="aui-tabs horizontal-tabs" role="application">
          {this.renderHistoryItemList(historyData)}
          {tabsDivs}
        </div>
      </Modal>
    );
  }
}
