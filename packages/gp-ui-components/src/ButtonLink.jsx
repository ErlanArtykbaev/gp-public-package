import React, { PropTypes } from 'react';

const ButtonLink = props => (
  <a {...props} onClick={(e) => { e.preventDefault(); props.onClick(); }}>
    {props.children}
  </a>
);

ButtonLink.propTypes = {
  children: PropTypes.node,
  onClick: PropTypes.func,
};

export default ButtonLink;
