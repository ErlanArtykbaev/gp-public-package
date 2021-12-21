import React, { PropTypes } from 'react';
import moment from 'moment';
import FormattedDate from '@gostgroup/gp-ui-components/lib/FormattedDate';
import { connect } from 'react-redux';
import { createValidDate } from '@gostgroup/gp-utils/lib/dates';
import ReportFilter from './filter';
import { getRestoreRfcReport } from '../redux/modules/reports';

@connect(
  state => ({
    reports: state.core.reports.results,
  }),
  { getReports: getRestoreRfcReport },
)
export default class RfcRestoreView extends React.Component {

  static propTypes = {
    reports: PropTypes.array,
    getReports: PropTypes.func,
  }

  constructor(props) {
    super(props);

    this.state = {
      reports: props.reports,
    };

    this.makeRows = ::this.makeRows;
  }

  componentDidMount() {
    const { getReports } = this.props;
    const dateStart = createValidDate(moment());
    const dateEnd = createValidDate(moment().add(1, 'days'));

    getReports(dateStart, dateEnd);
  }

  componentWillReceiveProps(props) {
    this.setState({
      reports: props.reports,
    });
  }

  makeRows(data) {
    return (
      <tr>
        <td>{data.userName}</td>
        <td>{data.name}</td>
        <td><FormattedDate>{data.time}</FormattedDate></td>
        <td className="small">{data.uuid}</td>
      </tr>
    );
  }

  render() {
    if (this.state.reports) {
      if (this.state.reports.length > 0) {
        return (
          <div>
            <ReportFilter type="RFCRestore" />
            <table className="table table-striped table-hover">
              <thead>
                <tr>
                  <th>Наименование запроса</th>
                  <th>Пользователь</th>
                  <th>Время</th>
                  <th>UUID</th>
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
          <ReportFilter type="RFCRestore" />
          <div>
            Отчетов соответствующих данным параметрам нет.
          </div>
        </div>
      );
    }
    return false;
  }
}
