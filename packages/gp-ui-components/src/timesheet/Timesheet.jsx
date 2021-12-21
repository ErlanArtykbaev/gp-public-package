import React, { PropTypes } from 'react';
import moment from 'moment';
import 'moment-range';
import min from 'lodash/min';
import max from 'lodash/max';
import cx from 'classnames';
import './timesheet.global.scss';
import './timesheet-white.global.scss';

const MONTHS = ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];

/**
 * Timesheet Bubble
 */
class Bubble {

  constructor(sectionWidth, min, start, end, bubblesInSection) {
    this.sectionWidth = sectionWidth;
    this.min = min;
    this.start = start;
    this.end = end;

    this.startOffset = this.getStartOffset(bubblesInSection);
    this.width = this.getWidth(bubblesInSection);
  }

  /**
   * Calculate starting offset for bubble
   */
  getStartOffset(elementsInSection) {
    const minYear = moment(this.min).year();
    const minMonth = moment([minYear, moment(this.min).month()]);
    let countOfElements;
    if (elementsInSection === 30) {
      countOfElements = ((moment(this.start).diff(minMonth, 'days')));
    } else {
      countOfElements = ((moment(this.start).diff(moment([minYear]), 'days')));
    }
    const oneElementWidth = this.sectionWidth / elementsInSection;
    const startOffset = oneElementWidth * countOfElements;
    return startOffset;
  }

  getCount(bubblesInSection) {
    let count = 0;
    switch (bubblesInSection) {
      case 120:
        count = moment(this.end).diff(moment(this.start), 'days') + 1;
        break;
      default:
        count = moment(this.end).diff(moment(this.start), 'days') + 1;
        break;
    }
    return count;
  }

  /**
   * Get bubble's width in pixel
   */
  getWidth(bubblesInSection) {
    let width = (this.sectionWidth / bubblesInSection) * this.getCount(bubblesInSection);
    if (width < 1) width = 1;
    return width;
  }

}

export default class TimeSheet extends React.Component {
  static propTypes = {
    data: PropTypes.array.isRequired,
    theme: PropTypes.string,
    className: PropTypes.string,
  }

  static defaultProps = {
    className: 'timesheet',
  }

  componentDidMount() {
    this.setState({ // eslint-disable-line react/no-did-mount-set-state
      sectionWidth: this.section.offsetWidth,
    });
  }

  setSection(node) {
    this.section = node;
  }

  getLists(data, result, bubblesInSection) {
    const lists = [];
    const sectionWidth = this.state && this.state.sectionWidth;
    if (!sectionWidth) return lists;

    for (let i = 0, l = data.length; i < l; i++) {
      const cur = data[i];
      const bubble = new Bubble(sectionWidth, result.min, cur.start, cur.end, bubblesInSection);

      const style = {
        marginLeft: `${bubble.startOffset}px`,
        width: `${bubble.width}px`,
      };

      const className = `bubble bubble-${cur.color || 'default'}`;

      const line = <span style={style} className={className} />;

      lists.push(<li key={i}>{line}</li>);
    }

    return lists;
  }

  getMaxInterval(data) {
    let dates = [];
    const result = {};
    data.forEach((o) => {
      dates.push.apply(dates, [o.start, o.end]);
    });
    dates = dates.filter(d => !!d);
    const maxDate = max(dates, d => parseInt(d.split('-').join(''), 10));
    const minDate = min(dates, d => parseInt(d.split('-').join(''), 10));
    const intervalInMonths = moment(maxDate).diff(moment(minDate), 'months');
    const range = moment.range(new Date(minDate), new Date(maxDate));

    if (intervalInMonths >= 12) {
      const countOfYears = (moment(maxDate).year() - moment(minDate).year()) + 1;
      result.bubbleCount = 360;
      result.maxScale = countOfYears; // number of columns
      result.min = minDate; // min date
      result.scaleWidth = `${100 / result.maxScale}%`; // width of column
      result.sections = [];
      const sectionStyle = { width: result.scaleWidth };
      for (let year = moment(minDate).year(); year <= moment(maxDate).year(); year++) {
        result.sections.push(<section key={year} ref={this.setSection} style={sectionStyle}>{year}</section>);
      }
    } else {
      result.bubbleCount = 30;
      result.maxScale = intervalInMonths; // number of columns
      result.min = minDate; // min date
      result.scaleWidth = `${100 / (intervalInMonths + 1)}%`; // width of column
      result.sections = [];
      const sectionStyle = { width: result.scaleWidth };
      range.by('months', (month) => {
        result.sections.push(<section key={month.month()} ref={this.setSection} style={sectionStyle}>{MONTHS[month.month()]}</section>);
      });
    }

    return result;
  }

  render() {
    const result = this.getMaxInterval(this.props.data);
    const data = this.props.data;

    const lists = this.getLists(data, result, result.bubbleCount);
    const className = `${this.props.className} ${this.props.theme || ''}`;

    const classes = cx([className, { 'inline-block': true }]);

    return (
      <div>
        <div className="inline-block vertical-top timeline-rows">
          <div key="first_row" className="first" />
          {this.props.data.map((o, i) => <div key={i}>№{i + 1}</div>)}
        </div>
        <div className={classes}>
          <div className="scale" style={{ width: '100%' }}>
            {result.sections}
          </div>
          <ul className="data">
            {lists}
          </ul>
        </div>
      </div>
    );
  }
}
