import React from 'react';
import { Link } from 'react-router';
import ReferenceLinkButton from './common/ReferenceLinkButton';

export default class ReferenceLink extends React.Component {

  render() {
    const { referenceKey, id, title, versionId, date, editable } = this.props;
    const to = {
      pathname: `/records/${referenceKey}/${id}`,
      query: {
        version: versionId,
        date,
      },
    };
    return (
      <div style={{ display: 'table', width: '100%', padding: '5px' }}>
        <Link style={{ display: 'table-cell', width: '25%' }} to={to}>{title}</Link>
        {editable && <ReferenceLinkButton style={{ display: 'table-cell' }} referenceKey={referenceKey} id={id} versionId={versionId} />}
      </div>
    );
  }

}
