import React, { PropTypes } from 'react';
import classnames from 'classnames';
import FormattedDate from '@gostgroup/gp-ui-components/lib/FormattedDate';
import { connect } from 'react-redux';
import Modals from '@gostgroup/gp-core/lib/components/objects/record/Modals';
import ReportFilter from './filter';
import Report from './Report';
import { getReportOperations } from '../redux/modules/reports';

@connect(
  state => ({
    reports: state.core.reports.results,
  }),
  { getReports: getReportOperations },
)
export default class OperationsView extends Report {

  static propTypes = {
    reports: PropTypes.array,
  }

  constructor(props, context) {
    super(props, context);

    this.makeRows = ::this.makeRows;
  }

  makeLinks(data) {
    return <Modals data={data}><input className="aui-button aui-primary" type="button" value="Подробнее" /></Modals>;
  }

  makeRows(data, index) {
    return (
      <tr key={index}>
        <td>{data.name}</td>
        <td>{data.currentTaskName}</td>
        <td>{data.user}</td>
        <td><FormattedDate>{data.dateStart}</FormattedDate></td>
        <td><FormattedDate>{data.dateEnd}</FormattedDate></td>
        <td><label className={classnames('label', data.statusClass === 'success' ? 'label-success' : false, data.statusClass === 'current' ? 'label-warning' : false, data.statusClass === 'error' ? 'label-danger' : false)}>{data.statusName}</label></td>
        <td>{this.makeLinks(data)}</td>
      </tr>
    );
  }

  render() {
    if (this.state.reports) {
      if (this.state.reports.length > 0) {
        return (
          <div>
            <ReportFilter type="Operations" />
            <table className="table table-striped table-hover">
              <thead>
                <tr>
                  <th>Название</th>
                  <th>Текущая задача</th>
                  <th>Пользователь</th>
                  <th>Дата отправки</th>
                  <th>Дата завершения</th>
                  <th>Статус</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {this.state.reports.map(this.makeRows)}
              </tbody>
            </table>
          </div>
        );
      }
      return (
        <div>
          <ReportFilter type="Operations" />
          <div>
            Отчетов соответствующих данным параметрам нет.
          </div>
        </div>
      );
    }
    return false;
  }
}
