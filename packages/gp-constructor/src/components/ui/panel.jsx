import React, { PropTypes } from 'react';

const preventCollapse = { minHeight: '35px' };

const Panel = props => (
  <div className="panel panel-default">
    <div className="panel-heading" style={(props.tools && !props.title) ? preventCollapse : null}>
      {props.title}
      <div className="pull-right">
        {props.tools}
      </div>
    </div>
    <div className="panel-body">
      <div>
        <div>
          {props.children}
        </div>
      </div>
    </div>
  </div>
);

Panel.propTypes = {
  children: PropTypes.node,
  tools: PropTypes.node,
  title: PropTypes.string,
};

export default Panel;
