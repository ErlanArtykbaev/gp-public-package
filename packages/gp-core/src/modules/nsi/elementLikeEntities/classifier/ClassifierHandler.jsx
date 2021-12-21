import React from 'react';
import ElementLikeHandler from 'gp-core/lib/components/objects/element/ElementLikeHandler';
import NewClassifierModal from './NewClassifierModal';

const ClassifierHandler = props => (
  <ElementLikeHandler
    {...props}
    elementProps={{
      EditModal: p => (
        <NewClassifierModal
          {...p}
          title="Редактирование классификатора"
        />
      ),
    }}
  />
);

export default ClassifierHandler;
