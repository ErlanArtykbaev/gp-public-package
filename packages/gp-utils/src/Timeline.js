import { createValidDate } from './dates';

export default class Timeline {

  constructor(intervals) {
    this._intervals = intervals.map((interval) => {
      const start = interval[0] ? +new Date(interval[0]) : -Infinity;
      const end = interval[1] ? +new Date(interval[1]) : Infinity;
      return [start, end];
    });

    this._intervals.sort((int1, int2) => int1[0] - int2[0]);
  }

  next() {
    const intervals = this._intervals;
    const last = intervals[intervals.length - 1];
    const lastEnd = last[1];

    if (!isFinite(lastEnd)) return null;

    const nextDateTimestamp = lastEnd + (24 * 60 * 60 * 1000);
    const nextDate = new Date(nextDateTimestamp);

    return createValidDate(nextDate);
  }

}
