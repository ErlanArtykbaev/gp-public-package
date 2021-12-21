import React from 'react';
import FormattedDate from '@gostgroup/gp-ui-components/lib/FormattedDate';
import Modals from '@gostgroup/gp-core/lib/components/objects/record/Modals';
import { connect } from 'react-redux';
import { AuiButton } from '@gostgroup/gp-ui-components/lib/buttons';
import ReportFilter from './filter';
import Report from './Report';
import { getReportUser } from '../redux/modules/reports';

@connect(
  state => ({
    reports: state.core.reports.results,
  }),
  { getReports: getReportUser },
)
export default class UsersView extends Report {

  constructor(props, context) {
    super(props, context);

    this.makeRows = ::this.makeRows;
  }

  makeLinks(data) {
    return <Modals data={data}><AuiButton primary type="button">Подробнее</AuiButton></Modals>;
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
            <ReportFilter type="Users" />
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
          <ReportFilter type="Users" />
          <div>
            Отчетов соответствующих данным параметрам нет.
          </div>
        </div>
      );
    }
    return false;
  }
}
