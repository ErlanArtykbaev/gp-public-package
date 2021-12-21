import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { setValidationResults } from '../../redux/reducer';

import { typesMap } from '../../types.js';
import BaseEditor from '../editors/BaseEditor';

// Добавляет кастомный редактор для свойства определенного типа, если он задан
function PropertyTypeEditor(props) {
  const ConfigEditor = typesMap[props.type].editor;

  return (
    <div>
      <BaseEditor {...props} />
      {ConfigEditor ? <ConfigEditor {...props} /> : <div />}
    </div>
  );
}

PropertyTypeEditor.propTypes = {
  type: PropTypes.string,
  setValidationResults: PropTypes.func,
};

export default connect(
  (state, props) => ({
    validationResults: state.core.editor.validationResults,
    isValid: state.core.editor.validationResults[props.property.get('uuid')] !== false,
  }),
  { setValidationResults }
)(PropertyTypeEditor);
