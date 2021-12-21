import React from 'react';
import moment from 'moment';
import get from 'lodash/get';

const formatDate = d => d ? moment(d).format('DD MMMM YYYY HH:mm') : null;

const deepFormatDate = s => (
  s.replace(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/, m => formatDate(m))
);


export default props => <span {...props}>{deepFormatDate(get(props, 'children', get(props, 'data', '')))}</span>;
