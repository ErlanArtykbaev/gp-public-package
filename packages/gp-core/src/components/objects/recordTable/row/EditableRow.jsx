import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import pick from 'lodash/pick';
import get from 'lodash/get';
import defaultsDeep from 'lodash/defaultsDeep';
import { flushDraft, startRecordEdit, stageDraft, saveDraft } from 'gp-core/lib/redux/modules/recordDraft';
import { deleteEntryRFC, restoreEntryRFC } from 'gp-core/lib/redux/modules/record';
import { recordDraftSelector } from 'gp-core/lib/redux/selectors/recordDraft';
import withFormContext from '@gostgroup/gp-forms/lib/withFormContext';
import { unwrapProperties } from '@gostgroup/gp-forms/lib/helpers';
import assembleNsiDataObject from '@gostgroup/gp-nsi-utils/lib/assembleNsiDataObject';
import createSimpleSchema from '@gostgroup/gp-nsi-utils/lib/createSimpleSchema';
import StaticRow from './StaticRow';


// Закинуть в контекст функциональность формы + сохраниение + отмену
@withFormContext
class EditableRecordTableRow extends React.Component {
  static propTypes = {
    griddleData: PropTypes.object,
    handlePropertyChange: PropTypes.func.isRequired,
    saveDraft: PropTypes.func.isRequired,
    flushDraft: PropTypes.func.isRequired,
    onRemove: PropTypes.func.isRequired,
    restoreEntryRFC: PropTypes.func.isRequired,
  }

  static childContextTypes = {
    onSubmit: PropTypes.func,
    onAbort: PropTypes.func,
    onRemove: PropTypes.func,
    onRestore: PropTypes.func,
    onChange: PropTypes.func,
  }

  getChildContext() {
    const { draftId, $$meta } = this.props.griddleData;
    const { absolutPath } = ($$meta || {});
    return {
      onSubmit: () => this.props.saveDraft(draftId),
      onAbort: () => this.props.flushDraft(draftId),
      onRemove: () => this.props.onRemove(absolutPath, this.props.griddleData),
      onRestore: () => this.props.restoreEntryRFC(absolutPath),
      onChange: this.props.handlePropertyChange,
    };
  }

  render() {
    return <StaticRow {...this.props} data={this.props.griddleData} />;
  }
}

const FormHocPropMapper = props => (
  <EditableRecordTableRow
    {...props}
    config={props.rowSettings.rowMetadata.recordSchema}
    data={defaultsDeep(
      pick(props.data, unwrapProperties(props.rowSettings.rowMetadata.recordSchema).map(p => p.id)),
      assembleNsiDataObject(createSimpleSchema(props.rowSettings.rowMetadata.recordSchema))
    )}
    griddleData={props.data}
    element={props.rowSettings.rowMetadata.element}
    getRowPath={prop => prop.deepPath}
    onChange={(patch, cleanPatch, isValid) => {
      const { data } = props;
      patch = { ...patch, invalid: !isValid };
      if (data.draftId) {
        props.stageDraft(data.draftId, patch);
        return;
      }
      props.onChange(get(data, '$$meta.absolutPath'), get(data, '$$meta.version'), patch, data);
    }}
  />
);

FormHocPropMapper.propTypes = {
  onChange: PropTypes.func.isRequired,
  stageDraft: PropTypes.func.isRequired,
  rowSettings: PropTypes.object,
  data: PropTypes.shape({}),
};


export default connect(
  (state, props) => {
    const { data } = props;
    if (data.isNew) return { data: { ...data, $$edit: data.invalid ? 'invalid' : 'clean' } };

    if (!data.$$meta) return {};

    const draft = recordDraftSelector(state)(data.$$meta.absolutPath);
    if (!draft) {
      const $$removed = data.$$meta.isAvailable === false;
      return { data: { ...data, $$edit: 'clean', $$removed } };
    }

    return {
      data: {
        ...data,
        ...draft.patch,
        draftId: draft.draftId,
        $$edit: (data.invalid || draft.patch.invalid) ? 'invalid' : 'ready',
      },
    };
  },
  { flushDraft, stageDraft, onChange: startRecordEdit, saveDraft, onRemove: deleteEntryRFC, restoreEntryRFC },
  (stateProps, dispatchProps, ownProps) => ({
    ...ownProps,
    ...stateProps,
    ...dispatchProps,
    onRemove: ownProps.rowSettings.rowMetadata.onRemove || dispatchProps.onRemove,
    onChange: ownProps.rowSettings.rowMetadata.onChange || dispatchProps.onChange,
  })
)(FormHocPropMapper);
