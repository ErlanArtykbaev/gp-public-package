import React, { PropTypes } from 'react';
import ControlLabel from 'react-bootstrap/lib/ControlLabel';
import FormControl from 'react-bootstrap/lib/FormControl';
import BaseFormGroup from 'react-bootstrap/lib/FormGroup';
import cx from 'classnames';
import { compose, getContext } from 'recompose';
import defaultStyles from './form.scss';

const withFormContext = compose(
  getContext({ formContext: PropTypes.shape({}) }),
);

const Span = ({ children, className }) => <span className={className}>{children}</span>;

Span.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
};

const LabeledFormGroup = ({ children, label, formContext = {} }) => (
  <BaseFormGroup
    className={cx(
      {
        [defaultStyles.formGroupHorizontal]: formContext && formContext.horizontal,
      }
    )}
  >
    <ControlLabel>{!!label && label}</ControlLabel>
    {children}
  </BaseFormGroup>
);

LabeledFormGroup.propTypes = {
  children: PropTypes.node,
  label: PropTypes.string,
  formContext: PropTypes.shape({}),
};

const FormGroup = withFormContext(LabeledFormGroup);

export default class Form extends React.Component {

  static childContextTypes = {
    formContext: PropTypes.shape({
      horizontal: PropTypes.bool,
    }),
  }

  getChildContext() {
    return {
      formContext: {
        horizontal: this.props.horizontal,
      },
    };
  }

  render() {
    const { styles, children, horizontal } = this.props;

    return (
      <div
        className={cx(
          styles.form,
          { [styles.formHorizontal]: horizontal }
        )}
      >
        {children}
      </div>
    );
  }

}

Form.propTypes = {
  styles: PropTypes.shape({
    form: PropTypes.string,
  }),
  children: PropTypes.node,
  horizontal: PropTypes.bool,
};

Form.defaultProps = {
  styles: defaultStyles,
};

Form.Label = ControlLabel;
Form.Control = FormControl;
Form.Span = Span;
Form.Group = FormGroup;
