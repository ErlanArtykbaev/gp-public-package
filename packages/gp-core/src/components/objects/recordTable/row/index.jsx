import React, { PropTypes } from 'react';
import StaticRow from './StaticRow';
import EditableRow from './EditableRow';

// Для не-редактируемых таблиц рендерим сразу строку, без HOC.
const RowSelector = props => (props.columnSettings.columnMetadata.some(c => c.isInlineEditable)
  ? <EditableRow {...props} />
  : <StaticRow {...props} griddleData={props.data} />
);

RowSelector.propTypes = {
  data: PropTypes.shape({}),
  columnSettings: PropTypes.shape({
    columnMetadata: PropTypes.arrayOf(PropTypes.shape({})),
  }),
};

export default RowSelector;
