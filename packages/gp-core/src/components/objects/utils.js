import React from 'react';
import moment from 'moment';

const griddleString = { data: React.PropTypes.string };

export const formatDate = d => d ? moment(d).format('DD MMMM YYYY HH:mm') : null;

export const GriddleDate = ({ data }) => <span>{formatDate(data)}</span>;
GriddleDate.propTypes = griddleString;

export const deepFormatDate = s => (
  s.replace(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/, m => formatDate(m))
);

export const DeepGriddleDate = ({ data }) => <span>{deepFormatDate(data)}</span>;
DeepGriddleDate.propTypes = griddleString;
