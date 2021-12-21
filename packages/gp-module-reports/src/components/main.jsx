import React from 'react';
import { Link } from 'react-router';
import requirePermissions from '@gostgroup/gp-core/lib/components/hoc/RequirePermissions';
import REPORTS from '@gostgroup/gp-core/lib/config/navigation/reports';

const ReportLink = requirePermissions(props => (
  <Link activeClassName="active" className="report-menu-link" to={props.to}>
    {props.text}
  </Link>
));

ReportLink.propTypes = {
  to: React.PropTypes.string,
  text: React.PropTypes.string,
};

export default function ReportView({ children }) {
  return (
    <div className="container-fluid">
      <div className="row">
        <div className="aui-page-panel-nav">
          <ul className="report-menu nav nav-pills nav-stacked">
            {REPORTS.map(({ route, title, permissions }) =>
              <li key={route}>
                <ReportLink permissions={permissions} to={route} text={title} />
              </li>
            )}
          </ul>
        </div>
        <div className="aui-page-panel-content">
          <div className="aui-page-panel-content-wrap">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

ReportView.propTypes = {
  children: React.PropTypes.node,
};
