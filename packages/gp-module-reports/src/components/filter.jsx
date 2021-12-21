import React, { PropTypes } from 'react';
import { autobind } from 'core-decorators';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import moment from 'moment';
import cx from 'classnames';
import DatePicker from '@gostgroup/gp-ui-components/lib/DatePicker';
import styles from './filter.scss';
import * as reportActions from '../redux/modules/reports';

@connect(
  null,
  dispatch => ({ actions: bindActionCreators(reportActions, dispatch) }),
)
@autobind
export default class ReportFilter extends React.Component {

  static propTypes = {
    type: PropTypes.string.isRequired,
    actions: PropTypes.shape({}),
  }

  constructor(props) {
    super(props);

    this.state = {
      type: props.type,
      dateStart: moment().subtract(7, 'd').format(global.APP_DATETIME_FORMAT),
      dateEnd: moment().format(global.APP_DATETIME_FORMAT),
      dateStartError: true,
      dateEndError: true,
      login: '',
    };
  }

  onChange(event, name, data, change) {
    this.setState({
      [name]: change[name],
    });
  }

  onSubmit() {
    const { actions } = this.props;
    let { dateStart, dateEnd } = this.state;
    if (this.state.dateStart) dateStart = moment(this.state.dateStart, global.APP_DATETIME_FORMAT).format(global.SERVER_DATETIME_FORMAT);
    if (this.state.dateEnd) dateEnd = moment(this.state.dateEnd, global.APP_DATETIME_FORMAT).format(global.SERVER_DATETIME_FORMAT);

    if (this.state.dateStartError && this.state.dateEndError) {
      switch (this.state.type) {
        case 'Operations':
          actions.getReportOperations({ dateStart, dateEnd, status: this.state.status });
          break;
        case 'Imports':
          actions.getReportImport({ dateStart, dateEnd });
          break;
        case 'Users':
          actions.getReportUser({ dateStart, dateEnd });
          break;
        case 'Experts':
          actions.getReportExpert({ dateStart, dateEnd });
          break;
        case 'Quality':
          actions.getReportQuality({ dateStart, dateEnd });
          break;
        case 'UserLog':
          actions.getReportUserLog({ dateStart, dateEnd, login: this.state.login });
          break;
        case 'UserComments':
          actions.getReportUserComments({ dateStart, dateEnd, user: this.state.login });
          break;
        case 'RFCRestore':
          actions.getRestoreRfcReport({ dateStart, dateEnd });
          break;
        case 'Security':
          actions.getReportSecurity({ dateStart, dateEnd, status: this.state.status });
          break;
        default:
          console.log('Не передан тип фильтра.'); // eslint-disable-line no-console
          break;
      }
    }
  }

  onDateStartChange(date) {
    this.setState({
      dateStart: moment(date).format(global.APP_DATETIME_FORMAT),
    });
  }

  onDateEndChange(date) {
    this.setState({
      dateEnd: moment(date).format(global.APP_DATETIME_FORMAT),
    });
  }

  onLoginChange(e) {
    const login = e.target ? e.target.value : e;
    this.setState({ login });
  }

  onElementChange(e) {
    const element = e.target ? e.target.value : e;
    this.setState({ element });
  }

  renderStatus() {
    if (this.state.type === 'Operations') {
      return (
        <div className="col-xs-4">
          <label htmlFor="status">Статус</label>
          <select className="form-control" name="status">
            <option value="" />
            <option value="pending">На обработке</option>
            <option value="approved">Завершен</option>
          </select>
        </div>
      );
    }
    return false;
  }

  renderLogin() {
    if (this.state.type === 'UserLog' || this.state.type === 'UserComments') {
      return (
        <div className="col-xs-2">
          <label htmlFor="login">Логин</label>
          <input type="text" className="form-control" name="login" onChange={this.onLoginChange} />
        </div>
      );
    }
    return false;
  }

  renderElement() {
    if (this.state.type === 'UserComments') {
      return (
        <div className="col-xs-2">
          <label htmlFor="element">Справочник</label>
          <input type="text" className="form-control" name="element" onChange={this.onElementChange} />
        </div>
      );
    }
    return false;
  }

  render() {
    return (
      <div className="row">
        <div className="col-xs-3">
          <DatePicker label="Дата начала" value={this.state.dateStart} onChange={this.onDateStartChange} />
        </div>
        <div className="col-xs-3">
          <DatePicker label="Дата конца" value={this.state.dateEnd} onChange={this.onDateEndChange} />
        </div>
        {this.renderStatus()}
        {this.renderLogin()}
        {this.renderElement()}
        <div className="col-xs-2">
          <label htmlFor="button">Фильтр</label>
          <button className={cx('btn btn-primary', styles.filterButton)} type="button" onClick={this.onSubmit} disabled={!this.state.dateStartError || !this.state.dateEndError}>Применить</button>
        </div>
      </div>
    );
  }
}
