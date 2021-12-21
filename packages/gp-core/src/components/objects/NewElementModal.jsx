import React from 'react';
import NewElementLikeModal from './NewElementLikeModal';

export default props => (
  <NewElementLikeModal
    {...props}
    titleType="справочника"
    editorWrapperProps={{
      disabledTypes: ['classifier_schema'],
    }}
  />
);
