import React, { Component, PropTypes } from 'react';
import { autobind } from 'core-decorators';
import { AuiButton } from '@gostgroup/gp-ui-components/lib/buttons';
import {
  ElementService,
} from '@gostgroup/gp-api-services/lib/services';
import Errors from '@gostgroup/gp-ui-components/lib/Errors';

import { connect } from 'react-redux';

import {
  getRelationsFromTree,
} from '@gostgroup/gp-constructor/lib/components/relations-editor';
import { Form } from '@gostgroup/gp-forms';
import Modal from '@gostgroup/gp-ui-components/lib/Modal';

const DEFAULT_RELATED_FORM_DATA = {
  link_to: '',
};

async function _getRelatedReference(relationReferenceId, referenceId) {
  if (!relationReferenceId) {
    return undefined;
  }
  let result;
  try {
    // console.log(' _getRelatedReference: URL ', '/element/' + relationReferenceId);
    const data = await ElementService.path(relationReferenceId).get();
    if (data && data.schema) {
      data.schema.config.properties.forEach((it) => {
        if (it.type === 'reference') {
          if (it.config.key !== referenceId) {
            result = it.config.key;
          }
        }
      });
    }
  } catch (e) {
    console.error('_getRelatedReference', { // eslint-disable-line no-console
      relationReferenceId,
      referenceId,
      result: e,
    });
  }
  return result;
}

@connect(
  state => ({
    objectsTree: state.core.objects.objectsTree,
  })
)
@autobind
export default class NewRelationModal extends Component {

  static propTypes = {
    isOpen: PropTypes.bool,
    onSubmit: PropTypes.func,
    objectsTree: PropTypes.shape({}),
    record: PropTypes.shape({}).isRequired,
  }

  constructor(props, context) {
    super(props, context);
    const { record, objectsTree } = props;
    const currentReferenceId = record.element.absolutPath;
    const relations = getRelationsFromTree(currentReferenceId, objectsTree, record.element);
    const relationReferenceId = relations[0] && relations[0].id;
    const element = record;

    this.state = {
      element,
      currentReferenceId,
      relationReferenceId,
      relations,
      isProcessing: false,
      relatedReferenceId: '',
      relatedElementId: '',
    };
    const self = this;
    _getRelatedReference(relationReferenceId, currentReferenceId)
      .then((result) => {
        self.setState({
          relatedReferenceId: result,
        });
        self._setRelatedReference(result);
      });
  }

  componentWillUpdate(nextProps) {
    if (nextProps.isOpen && this.props.isOpen === false) {
      this.setState({
        isProcessing: false,
      });
    }
  }

  handleSubmit() {
    const { relatedReferenceId, relatedElementId } = this.state;
    const submitter = this.props.onSubmit({
      referenceId: relatedReferenceId,
      elementId: relatedElementId,
    });
    if (typeof submitter === 'object' && typeof submitter.then === 'function') {
      const self = this;
      self.setState({ isProcessing: true });
      submitter.catch(() => self.setState({ isProcessing: false }));
    }
  }

  handleReferenceChange(event) {
    event = event || window.event;

    const { state } = this;
    const relationReferenceId = event.target.value;
    this.setState({
      relationReferenceId,
      relatedElementId: '',
      relatedFormData: DEFAULT_RELATED_FORM_DATA,
    });

    const self = this;
    _getRelatedReference(
      relationReferenceId,
      state.currentReferenceId,
    ).then(relatedReferenceId => self._setRelatedReference(relatedReferenceId));
  }

  handleElementChange(value) {
    this.setState({
      relatedElementId: value.link_to,
      relatedFormData: value,
    });
  }


  _setRelatedReference(id) {
    this.setState({
      relatedReferenceId: id,
      relatedFormSchema: {
        config: {
          properties: [{
            config: {
              key: id,
            },
            id: 'link_to',
            required: true,
            title: 'Элемент',
            type: 'reference',
          }],
        },
      },
    });
  }

  render() {
    const { props, state } = this;
    const { errors } = props;
    return (
      <Modal title={props.title} {...props}>
        <Errors errors={errors} />

        <form className="aui form">
          <fieldset>
            <div className="field-group">
              <label htmlFor="reference_id">
                <span>Справочник</span>
                <span className="aui-icon icon-required" />
              </label>
              <select
                id="reference_id"
                className="select"
                value={state.relationReferenceId}
                onChange={this.handleReferenceChange}
              >
                {state.relations.map((it, index) => (
                  <option key={index} value={it.id}>{it.title}</option>
                ))}
              </select>
            </div>
          </fieldset>
        </form>
        {state.relatedFormSchema ? (
          <Form
            config={state.relatedFormSchema}
            basicData={{}}
            element={state.element}
            data={state.relatedFormData || DEFAULT_RELATED_FORM_DATA}
            onChange={this.handleElementChange}
          />
        ) : []}
        <div style={{ paddingLeft: 145 }}>
          <AuiButton
            primary
            onClick={this.handleSubmit}
            disabled={state.isProcessing || state.relatedElementId === '' || isNaN(state.relatedElementId)}
          >
            Добавить
          </AuiButton>
        </div>
      </Modal>
    );
  }
}
