import React, { PropTypes } from 'react';
import moment from 'moment';
import SimpleGriddle from '@gostgroup/gp-ui-components/lib/SimpleGriddle';
import { connect } from 'react-redux';
import { createValidDate } from '@gostgroup/gp-utils/lib/dates';
import FormattedDate from '@gostgroup/gp-ui-components/lib/FormattedDate';
import ReportFilter from './filter';
import { getReportSecurity } from '../redux/modules/reports';

const columns = ['id', 'time', 'ip', 'action'];

const columnMetadata = [
  {
    columnName: 'id',
    displayName: 'Номер',
  },
  {
    columnName: 'ip',
    displayName: 'IP',
  },
  {
    columnName: 'action',
    displayName: 'Событие',
  },
  {
    columnName: 'time',
    displayName: 'Дата',
    customComponent: FormattedDate,
  },
];

@connect(
  state => ({
    reports: state.core.reports.results,
  }),
  { getReport: getReportSecurity },
)
export default class SecurityView extends React.Component {

  static propTypes = {
    reports: PropTypes.array,
    getReport: PropTypes.func,
  }

  constructor(props) {
    super(props);

    this.state = {
      reports: props.reports,
    };
  }

  componentDidMount() {
    const { getReport } = this.props;
    const dateStart = createValidDate(moment().subtract(7, 'd'));
    const dateEnd = createValidDate(moment());

    getReport(dateStart, dateEnd);
  }

  componentWillReceiveProps(props) {
    this.setState({
      reports: props.reports,
    });
  }

  render() {
    if (this.state.reports) {
      if (this.state.reports.length > 0) {
        const reports = this.state.reports; /* .length > 0 ? this.state.reports : fakeData;*/
        return (
          <div>
            <ReportFilter type="Security" />
            <SimpleGriddle
              results={reports}
              showFilter
              showSettings={false}
              enableSort
              resultsPerPage={5}
              filterPlaceholderText={'поиск'}
              settingsText={'настройки'}
              columnMetadata={columnMetadata}
              columns={columns}
            />
          </div>
        );
      }
      return (
        <div>
          <ReportFilter type="Security" />
          <div>
            Отчетов соответствующих данным параметрам нет.
          </div>
        </div>
      );
    }
    return null;
  }
}
