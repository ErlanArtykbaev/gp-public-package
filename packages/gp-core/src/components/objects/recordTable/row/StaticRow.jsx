import React, { PropTypes } from 'react';
import get from 'lodash/get';
import GridRow from 'griddle-react/modules/gridRow';

// Переложить данные из props.griddleData в плоский объект и передать в стандартную строку гридла
const StaticRow = (props) => {
  const flatData = props.columnSettings.columnMetadata.reduce((acc, col) => {
    if (col.deepPath) {
      acc[col.columnName] = get(props.griddleData, col.deepPath);
    }
    return acc;
  }, { ...props.griddleData });

  return <GridRow {...props} data={flatData} />;
};

StaticRow.propTypes = {
  columnSettings: PropTypes.object,
  griddleData: PropTypes.shape({}),
};

export default StaticRow;
