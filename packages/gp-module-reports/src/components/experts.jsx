import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import FormattedDate from '@gostgroup/gp-ui-components/lib/FormattedDate';
import Modals from '@gostgroup/gp-core/lib/components/objects/record/Modals';
import ReportFilter from './filter';
import Report from './Report';
import { getReportExpert } from '../redux/modules/reports';

@connect(
  state => ({
    reports: state.core.reports.results,
  }),
  { getReports: getReportExpert },
)
export default class ExpertsView extends Report {

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
        <td>{data.rfcName}</td>
        <td>{data.action}</td>
        <td>{data.user}</td>
        <td><FormattedDate>{data.date}</FormattedDate></td>
        <td>{this.makeLinks(data)}</td>
      </tr>
    );
  }

  render() {
    if (this.state.reports) {
      if (this.state.reports.length > 0) {
        return (
          <div>
            <ReportFilter type="Experts" />
            <table className="table table-striped table-hover">
              <thead>
                <tr>
                  <th>Название</th>
                  <th>Действие</th>
                  <th>Пользователь</th>
                  <th>Дата действия</th>
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
          <ReportFilter type="Experts" />
          <div>
            Отчетов соответствующих данным параметрам нет.
          </div>
        </div>
      );
    }
    return false;
  }
}
