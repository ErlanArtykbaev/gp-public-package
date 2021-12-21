import React, { PropTypes } from 'react';
import FormattedDate from '@gostgroup/gp-ui-components/lib/FormattedDate';
import { connect } from 'react-redux';
import { getReportUserComments } from '../redux/modules/reports';
import ReportFilter from './filter';
import Report from './Report';

@connect(
  state => ({
    reports: state.core.reports.results,
  }),
  { getReports: getReportUserComments },
)
export default class UserComments extends Report {
  static propTypes = {
    reports: PropTypes.array,
  }

  constructor(props, context) {
    super(props, context);

    this.state = {
      reports: props.reports,
    };

    this.makeRows = ::this.makeRows;
  }

  makeLinks(path) {
    if (path) {
      return (
        <a href={path}>Перейти</a>
      );
    }
    return false;
  }

  makeRows(data, index) {
    return (
      <tr key={index}>
        <td>{data.user}</td>
        <td>{data.rfcName}</td>
        <td>{data.action}</td>
        <td><FormattedDate>{data.date}</FormattedDate></td>
        <td>{data.comment}</td>
        <td>{data.refNames}</td>
      </tr>
    );
  }

  render() {
    if (this.state.reports) {
      if (this.state.reports.length > 0) {
        return (
          <div>
            <ReportFilter type="UserComments" />
            <table className="table table-striped table-hover">
              <thead>
                <tr>
                  <th>Пользователь</th>
                  <th>Наименование запроса на изменение</th>
                  <th>Действие</th>
                  <th>Дата действия</th>
                  <th>Комментарий</th>
                  <th>Наименование Справочника</th>
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
          <ReportFilter type="UserComments" />
          <div>
            Отчетов соответствующих данным параметрам нет.
          </div>
        </div>
      );
    }
    return false;
  }
}
