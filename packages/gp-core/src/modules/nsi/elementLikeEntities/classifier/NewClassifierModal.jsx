import React from 'react';
import { connect } from 'react-redux';
import NewElementLikeModal from 'gp-core/lib/components/objects/NewElementLikeModal';

const NewClassifierModal = props => (
  <NewElementLikeModal
    {...props}
    titleType="классификатора"
    editorWrapperProps={{
      processes: props.processes,
      useGlobalTypes: false,
      availableContexts: ['mainContext', 'schemaDataContext'],
      disabledTypes: ['classifier'],
    }}
  />
);

NewClassifierModal.propTypes = {
  processes: React.PropTypes.array,
};

export default connect(state => ({ processes: state.core.rfc.config.processes }))(
  NewClassifierModal
);
