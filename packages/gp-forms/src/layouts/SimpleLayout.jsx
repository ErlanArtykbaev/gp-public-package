import React, { PropTypes } from 'react';
import stopEvent from '../utils/stopEvent.js';

const SimpleForm = ({ children }) => (
  <form className="aui form gost-nsi-form container-fluid" onSubmit={stopEvent}>
    <fieldset>
      {children}
    </fieldset>
  </form>
);

SimpleForm.propTypes = {
  children: PropTypes.node,
};

export default SimpleForm;
