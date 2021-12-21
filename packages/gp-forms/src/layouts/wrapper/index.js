import { PropTypes } from 'react';

export const WrapperLayoutPropTypes = {
  allProperties: PropTypes.arrayOf(PropTypes.shape({})),
  mainProperties: PropTypes.arrayOf(PropTypes.shape({})),
  complexProperties: PropTypes.arrayOf(PropTypes.shape({})),
  schema: PropTypes.shape({}),
  FormLayout: PropTypes.func,
  FormRowLayout: PropTypes.func,
  renderProperty: PropTypes.func,
};
