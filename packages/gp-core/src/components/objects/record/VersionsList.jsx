import React from 'react';
import { Link } from 'react-router';
import { formatVersion } from '@gostgroup/gp-utils/lib/util.js';
import getVersionDate from '@gostgroup/gp-nsi-utils/lib/record/getVersionDate';

export default class VersionsList extends React.Component {
  render() {
    const { versions, versionId, splat } = this.props;
    const versionsList = versions
      .filter(v => v.id != versionId)
      .map((v, index) => {
        const to = {
          pathname: `/records/${splat}`,
          query: {
            version: v.id,
            date: getVersionDate(v),
          },
        };
        return (
          <li key={index}>
            <Link to={to}>{ formatVersion(v) }</Link>
          </li>
        );
      });

    if (versionsList.length < 1) return <div />;

    return (
      <div>
        <h3>Другие версии</h3>
        <nav className="aui-navgroup aui-navgroup-vertical">
          <div className="aui-navgroup-inner">
            <ul className="aui-nav">
              {versionsList}
            </ul>
          </div>
        </nav>
      </div>
    );
  }
}
