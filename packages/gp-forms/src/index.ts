import Form from './Form';
import FormRow from './row/FormRow';
import * as validate from './validate/index.js';
import { withFormValidator, configurableFormValidator, WithFormValidatorInjectedProps } from './utils/hoc/withFormValidator';
import './styles/main.global.scss';

export default Form;

export {
  Form,
  FormRow,
  validate,
  withFormValidator,
  configurableFormValidator,
  WithFormValidatorInjectedProps,
};
