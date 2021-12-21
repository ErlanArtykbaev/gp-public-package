import TimeSheet from '@gostgroup/gp-ui-components/lib/timesheet/Timesheet';
import React, { PropTypes, Component } from 'react';
import sortBy from 'lodash/sortBy';
import max from 'lodash/max';
import min from 'lodash/min';
import moment from 'moment';
import { createValidDate } from '@gostgroup/gp-utils/lib/dates';

/*
  Возвращает первый и последний день года по дате.
  Используется для случая, когда все версии бесконечны
  и год берется от сегодняшней даты.
*/
function getYear(date) {
  const year = moment(date).year().toString();
  return {
    start: `${year}-01-01`,
    end: `${year}-12-31`,
  };
}

/*
  Возвращает последний день максимального года из всех версий
  для ограничения версий, не имеющих конца.
  Используется только если есть хотя бы одна дата.
*/
function getMaxYear(versions) {
  let dates = [];
  versions.forEach((v) => {
    dates.push.apply(dates, [v.dateStart, v.dateEnd]);
  });
  dates = dates.filter(d => !!d);
  const maxDate = max(dates, date => parseInt(date.split('-').join(''), 10));
  const maxYear = `${moment(maxDate).year().toString()}-12-31`;
  return maxYear;
}

/*
  Возвращает первый день минимального года из всех версий
  для ограничения версий, не имеющих начала.
  Используется только если есть хотя бы одна дата.
*/
function getMinYear(versions) {
  let dates = [];
  versions.forEach((v) => {
    dates.push.apply(dates, [v.dateStart, v.dateEnd]);
  });
  dates = dates.filter(d => !!d);
  const minDate = min(dates, date => parseInt(date.split('-').join(''), 10));
  const minYear = `${moment(minDate).year().toString()}-01-01`;
  return minYear;
}

export default class VersionsTimeline extends Component {

  static propTypes = {
    versions: PropTypes.arrayOf(PropTypes.shape({
      dateStart: PropTypes.string,
      dateEnd: PropTypes.string,
    })),
  }

  render() {
    const { versions } = this.props;

    let fullTimelineInterval;

    const hasAnyDate = versions.findIndex(v => v.dateStart || v.dateEnd);

    if (hasAnyDate === -1) {
      fullTimelineInterval = getYear(createValidDate(moment()));
    } else {
      fullTimelineInterval = {
        start: getMinYear(this.props.versions),
        end: getMaxYear(this.props.versions),
      };
    }

    const data = sortBy(versions, 'id')
      .map((v) => {
        let start;
        let end;
        if (v.dateStart && !v.dateEnd) {
          start = v.dateStart;
          end = fullTimelineInterval.end;
        } else if (!v.dateStart && v.dateEnd) {
          start = fullTimelineInterval.start;
          end = v.dateEnd;
        } else if (!v.dateStart && !v.dateEnd) {
          start = fullTimelineInterval.start;
          end = fullTimelineInterval.end;
        } else {
          start = v.dateStart;
          end = v.dateEnd;
        }
        return { start, end, color: 'lorem' };
      });
    const minYear = moment(fullTimelineInterval.start).year();
    const maxYear = moment(fullTimelineInterval.end).year();

    return (
      <div>
        { data && data.length > 1 ?
          <div>
            <h3>Визуализация истории изменений</h3>
            <TimeSheet min={minYear} max={maxYear} theme={'white'} data={data} />
          </div>
          : '' }
      </div>
    );
  }
}
