import React, { PropTypes } from 'react';
import Form from '../../../Form';

export default function ClassifierData(props) {
  const { element, config, data } = props;
  return (
    <Form
      config={config}
      basicData={{}}
      element={{ element }}
      data={data}
      readOnly
    />
  );
}

ClassifierData.propTypes = {
  config: PropTypes.shape({}),
  element: PropTypes.shape({}),
  data: PropTypes.shape({}).isRequired,
};
