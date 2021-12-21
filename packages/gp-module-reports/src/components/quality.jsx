import React, { PropTypes } from 'react';
import moment from 'moment';
import { connect } from 'react-redux';
import Result from '@gostgroup/gp-module-pack-control/lib/components/QualityModal';
import { getReportQuality } from '../redux/modules/reports';
import ReportFilter from './filter';
import Report from './Report';

@connect(
  state => ({
    reports: state.core.reports.results,
  }),
  { getReports: getReportQuality },
)
export default class QualityView extends Report {

  static propTypes = {
    reports: PropTypes.array,
  }

  constructor(props, context) {
    super(props, context);

    this.state = {
      reports: props.reports,
    };
  }

  // TODO cannot dispatch on result
  makeRows(data, index) {
    return (
      <tr key={index}>
        <td>{data.info}</td>
        <td>{moment(data.dateStart).format(global.APP_DATE_FORMAT)}</td>
        <td>{moment(data.dateEnd).format(global.APP_DATE_FORMAT)}</td>
        <td>{data.user}</td>
        <td><span className="badge">{data.errors}</span></td>
        <td><Result uuid={data.uuid} /></td>
      </tr>
    );
  }

  render() {
    if (this.state.reports) {
      if (this.state.reports.length > 0) {
        return (
          <div>
            <ReportFilter type="Quality" />
            <table className="table table-striped table-hover">
              <thead>
                <tr>
                  <th>Общая информация</th>
                  <th>Дата начала</th>
                  <th>Дата завершения</th>
                  <th>Инициатор проверки</th>
                  <th>Количество ошибок</th>
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
          <ReportFilter type="Quality" />
          <div>
            Отчетов соответствующих данным параметрам нет.
          </div>
        </div>
      );
    }
    return false;
  }
}
