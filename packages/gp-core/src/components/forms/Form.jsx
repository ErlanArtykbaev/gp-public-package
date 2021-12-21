import React from 'react';

const Form = props => (
  <form className="aui" action="javascript: void 0" onSubmit={props.action}>
    <fieldset>
      {props.children}
    </fieldset>
  </form>
);

Form.propTypes = {
  action: React.PropTypes.func,
};

export default Form;
