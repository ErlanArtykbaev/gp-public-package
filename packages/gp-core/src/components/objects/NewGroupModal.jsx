import React, { PropTypes, Component } from 'react';
import { autobind } from 'core-decorators';
import wrappedForm from '@gostgroup/gp-hocs/lib/wrappedForm';

import { connect } from 'react-redux';
import { treePathSelector } from 'gp-core/lib/redux/selectors/objects';
import { validateKey, validateShortTitle } from '@gostgroup/gp-utils/lib/validate/main';

import transliterate from 'transliterate';
import Modal from '@gostgroup/gp-ui-components/lib/Modal';
import Form from '../forms/Form';
import Field from '../forms/Field';
import ProcessDefinitionComponent from './rfc/ProcessDefinitionComponent/ProcessDefinitionComponent';

function disabled(state) {
  const { key, keyError } = state;
  const { shortTitle, shortTitleError } = state;

  return !(key && !keyError && shortTitle && !shortTitleError);
}

@connect(
  state => ({
    path: treePathSelector(state.core.objects),
  }),
)
@wrappedForm
@autobind
export default class NewGroupModal extends Component {

  static propTypes = {
    data: PropTypes.shape({
      key: PropTypes.string,
    }),
    onClose: PropTypes.func,
    onSubmit: PropTypes.func,
    path: PropTypes.arrayOf(PropTypes.shape({})),
  }

  constructor(props) {
    super(props);

    const { data = {} } = props;

    this.state = {
      warning: false,
      isTouched: false,
      key: data.key || '',
      processDefenitionId: data.processDefenitionId || '',
      assignedUserTasks: data.assignedUserTasks || {},
      keyError: null,
      fullTitle: data.fullTitle || '',
      shortTitle: data.shortTitle || '',
      shortTitleError: null,
      isMutable: !props.data,
    };
  }

  onCloseConfirm() {
    this.setState({ warning: false });
    this.props.onClose();
  }

  onCloseReject() {
    this.setState({ warning: false });
  }

  onClose() {
    if (!this.state.warning) {
      this.setState({ warning: true });
    } else {
      this.props.onClose();
    }
  }

  onKeyChange(key) {
    const { path } = this.props;
    const state = this.state;
    state.key = key;
    state.keyError = validateKey(key, path);
    state.isTouched = !!key;

    this.setState(state);
  }

  onShortTitleChange(shortTitle) {
    const { path } = this.props;
    const state = {
      shortTitle, shortTitleError: validateShortTitle(shortTitle),
    };
    let key;

    if (!this.state.isTouched && this.state.isMutable) {
      key = transliterate(shortTitle)
        .toLowerCase()
        .replace(/[^a-z_0-9]/g, '_');
      state.key = key;
      state.keyError = validateKey(key, path);
    }
    this.setState(state);
  }

  onFullTitleChange(fullTitle) {
    this.setState({ fullTitle });
  }

  onProcessChange(processDefenitionId, assignedUserTasks) {
    this.setState({ processDefenitionId, assignedUserTasks });
  }

  handleSubmit() {
    const { key, shortTitle, fullTitle, processDefenitionId, assignedUserTasks, type } = this.state;
    this.props.onSubmit({ key, shortTitle, fullTitle, processDefenitionId, assignedUserTasks, type });
  }

  render() {
    const state = this.state;
    const {
      key, fullTitle, shortTitle, keyError, shortTitleError,
      processDefenitionId, assignedUserTasks, isMutable } = state;

    return (
      <Modal
        title="СОЗДАТЬ ГРУППУ"
        isOpen
        {...this.props}
        warning={this.state.warning}
        onClose={this.onClose}
        onCloseConfirm={this.onCloseConfirm}
        onCloseReject={this.onCloseReject}
        saveButton
        saveButtonDisabled={disabled(state)}
        onSubmit={this.handleSubmit}
      >
        <Form>
          <div className="form form-horizontal">
            <div className="form-group">
              <label className="col-sm-3">Процесс согласования</label>
              <div className="col-sm-3">
                <ProcessDefinitionComponent
                  processDefenitionId={processDefenitionId}
                  usersMap={assignedUserTasks}
                  onProcessChange={this.onProcessChange}
                />
              </div>
            </div>

            <hr className="new-group-modal-hr" />

            <Field
              title="Ключ"
              required
              value={key}
              onChange={this.onKeyChange}
              disabled={!isMutable}
              error={keyError}
              max="255"
            />
            <Field
              title="Краткое наименование"
              required
              value={shortTitle}
              onChange={this.onShortTitleChange}
              error={shortTitleError}
            />
            <Field
              title="Полное наименование"
              size="long"
              value={fullTitle}
              onChange={this.onFullTitleChange}
            />
          </div>
        </Form>
      </Modal>
    );
  }
}
