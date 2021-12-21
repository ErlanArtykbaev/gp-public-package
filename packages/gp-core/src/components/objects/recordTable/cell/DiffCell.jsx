import React from 'react';
import get from 'lodash/get';
import isEqual from 'lodash/isEqual';
import cellPropTypes from './cellPropTypes';
import '../styles/recordTable.global.scss';
import StaticCell from './StaticCell';

const DiffCell = (props) => {
  const { data, rowData, metadata } = props;
  const oldData = get(rowData.diffAgainst, ['version', 'object', ...metadata.deepPath]);

  if (isEqual(oldData, data)) {
    return <StaticCell {...props} />;
  }

  return (
    <div className="table-diff">
      <div className="table-diff__old">
        <StaticCell {...props} data={oldData} />
      </div>
      <div className="table-diff__new">
        <StaticCell {...props} />
      </div>
    </div>
  );
};

DiffCell.propTypes = cellPropTypes();

export default DiffCell;
