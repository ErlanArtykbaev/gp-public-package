import React from 'react';
import { formatVersion } from '@gostgroup/gp-utils/lib/util.js';

export default class ModalVersionsList extends React.Component {
  render() {
    const { versions, versionId } = this.props;
    const versionsList = versions
    .filter(v => v.id !== versionId)
    .map((v, index) => (
      <li key={index}>
        <a onClick={this.props.onChange.bind(null, v.id)}>{ formatVersion(v) }</a>
      </li>
      ));

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
