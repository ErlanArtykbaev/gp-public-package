import React, { PropTypes } from 'react';
import defaultStyles from './formGroup.scss';

export default function FormGroup({ topLabel, leftLabel, children, styles }) {
  let className = styles.formGroup;
  if (topLabel) {
    className = styles.formGroupWithTopLabel;
  }
  if (leftLabel) {
    className = styles.formGroupWithLeftLabel;
  }

  return (
    <div className={className}>
      {children}
    </div>
  );
}

FormGroup.propTypes = {
  topLabel: PropTypes.bool,
  leftLabel: PropTypes.bool,
  styles: PropTypes.shape({
    formGroup: PropTypes.string,
    formGroupWithTopLabel: PropTypes.string,
    formGroupWithLeftLabel: PropTypes.string,
  }),
  children: PropTypes.node,
};

FormGroup.defaultProps = {
  topLabel: true,
  leftLabel: false,
  styles: defaultStyles,
};
