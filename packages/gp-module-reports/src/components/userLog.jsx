import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import SimpleGriddle, { columnMeta } from '@gostgroup/gp-ui-components/lib/SimpleGriddle';
import FormattedDate from '@gostgroup/gp-ui-components/lib/FormattedDate';
import ReportFilter from './filter';
import Report from './Report';
import { getReportUserLog } from '../redux/modules/reports';

const Link = ({ data }) => data ? <a href={data}>Перейти</a> : false;
const UserAgent = ({ data }) => <span className="small">{data}</span>;

const columnMetadata = [
  columnMeta('login', 'Пользователь'),
  columnMeta('action', 'Действие'),
  columnMeta('time', 'Время', FormattedDate),
  columnMeta('path', 'Ссылка', Link),
  columnMeta('ip', 'IP Адрес'),
  columnMeta('agent', 'Используемый клиент', UserAgent),
];

@connect(
  state => ({
    reports: state.core.reports.results,
  }),
  { getReports: getReportUserLog },
)
export default class UserLogView extends Report {
  static propTypes = {
    reports: PropTypes.array,
  }

  constructor(props, context) {
    super(props, context);

    this.state = {
      reports: props.reports,
    };
  }

  render() {
    const showReports = this.state.reports && this.state.reports.length > 0;
    return (
      <div>
        <ReportFilter type="UserLog" />
        {showReports
          ?
            <SimpleGriddle
              results={this.state.reports}
              showSettings={false}
              enableSort
              resultsPerPage={15}
              columnMetadata={columnMetadata}
              columns={columnMetadata.map(c => c.columnName)}
            />
          :
            <div>
              Отчетов соответствующих данным параметрам нет.
            </div>
        }
      </div>
    );
  }
}
