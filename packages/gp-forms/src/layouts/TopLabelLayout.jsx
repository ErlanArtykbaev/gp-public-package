import React, { PropTypes } from 'react';
import stopEvent from '../utils/stopEvent.js';

const TopLabelLayout = ({ children }) => (
  <form className="aui form gost-nsi-form container-fluid top-label" onSubmit={stopEvent} style={{ marginTop: 0 }}>
    <fieldset className="top-label">
      {children}
    </fieldset>
  </form>
);

TopLabelLayout.propTypes = {
  children: PropTypes.node,
};

export default TopLabelLayout;
