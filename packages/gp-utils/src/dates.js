import moment from 'moment';

export function makeDate(date) {
  return moment(date).format(`${global.APP_DATE_FORMAT}`);
}

export function makeUnixTime(time) {
  if (typeof time === 'string') {
    time = moment(time).toDate();
  }
  return Math.floor(time / 1000);
}

export function makeTime(date, withSeconds = false) {
  date = new Date(date);
  return moment(date).format(`HH:mm${withSeconds ? ':ss' : ''}`);
}

export function makeMinutes(date) {
  date = new Date(date);
  return moment(date).format('mm:ss');
}

export function getStartOfToday() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

export function today(format = false) {
  return format ? moment().format('YYYY-MM-DD') : moment();
}

export function createValidDate(date, useDateTime = true) {
  if (!date) return null;
  let format = global.SERVER_DATETIME_FORMAT;
  if (!useDateTime) {
    format = global.SERVER_DATE_FORMAT;
  }
  return moment(date, format).format(format);
}

export function formatDate(date) {
  if (!date) return null;
  return moment(date).format('YYYY-MM-DD');
}

export function createValidDateTime(date) {
  if (!date) return null;
  return moment(date).format('YYYY-MM-DDThh:mm:ss');
}

export function getFormattedDateTime(date) {
  if (!date) return '';
  return moment(date).format(`${global.APP_DATE_FORMAT} HH:mm`);
}

export function getFormattedDateTimeSeconds(date) {
  if (!date) return '';
  return moment(date).format(`${global.APP_DATE_FORMAT} HH:mm:ss`);
}

export function makeDateFromUnix(date) {
  if (!date) return '-';
  return moment.unix(date).format(`${global.APP_DATE_FORMAT} HH:mm:ss`);
}

// смены за вчера, сегодня, завтра

export function getYesterday0am() {
  const now = new Date();

  return new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 0, 0);
}

export function getYesterday2359() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 23, 59);
}

export function getYesterday9am() {
  const now = new Date();

  return new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 9, 0);
}

export function getDate9am(date) {
  const now = new Date(date);
  return new Date(now.getFullYear(), now.getMonth(), now.getDate(), 9, 0);
}

export function getNextDay859am(date) {
  const now = new Date(date);
  return new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 8, 59);
}

export function getToday9am() {
  const now = new Date();

  return new Date(now.getFullYear(), now.getMonth(), now.getDate(), 9, 0);
}

export function getToday859am() {
  const now = new Date();

  return new Date(now.getFullYear(), now.getMonth(), now.getDate(), 8, 59);
}

export function getToday0am() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0);
}

export function getToday2359() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59);
}

export function getTomorrow9am() {
  const now = new Date();

  return new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 8, 59);
}

export function getDatesByShift() {
  const now = new Date();
  if (now.getHours() > 18) {
    return [
      new Date(now.getFullYear(), now.getMonth(), now.getDate(), 19, 0),
      new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 7, 0),
    ];
  }
  return [
    new Date(now.getFullYear(), now.getMonth(), now.getDate(), 7, 0),
    new Date(now.getFullYear(), now.getMonth(), now.getDate(), 19, 0),
  ];
}
