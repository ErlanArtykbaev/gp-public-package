import React, { Component, PropTypes } from 'react';
import createElement from '@gostgroup/gp-api-services/lib/helpers/element/createElement';
import {
  RootService,
} from '@gostgroup/gp-api-services/lib/services';
import Immutable from 'immutable';
import { AuiButton } from '@gostgroup/gp-ui-components/lib/buttons';
import ReferenceInput from './ui/Reference';
import RelationConfigEditor from './relation-config-editor';

export const RELATIONS_PATH_PREFIX = 'nsi/tech/links';
export const RELATIONS_PATH_DELIMITER = '___and___';
export const RELATIONS_PATH_SLASH_REPLACEMENT = '-';
export const RELATIONS_TITLE_DELIMITER = ' ⇆ ';
export const RELATIONS_METADATA_REFERENCE = 'nsi/tech/links/metadata';

/**
 * @param {Object} node
 * @param {String} node.id
 * @param {String} node.title
 * @param {Object[]} node.children
 * @returns {Object[]}
 * @private
 */
function _getReferencesListFromTree(node) {
  let result = [{
    id: node.absolutPath,
    title: node.shortTitle,
  }];
  (node.children || []).forEach((it) => {
    result = result.concat(_getReferencesListFromTree(it));
  });
  return result;
}

/**
 * @param {String} [referenceId] absolute path
 * @param {Object} [referencesTree] with {'id': String} objects
 * @param {Object} [ownerElement]
 * @returns {Array}
 */
export function getRelationsFromTree(referenceId, referencesTree, ownerElement) {
  const referencesList = _getReferencesListFromTree(referencesTree);
  return getRelationsFromList(referenceId, referencesList, ownerElement);
}

/**
 * @param {String} fullTitle
 * @param {String} ownerTitle
 * @returns {String}
 */
export function getRelatedTitle(fullTitle, ownerTitle) {
  return fullTitle
    .replace(RELATIONS_TITLE_DELIMITER + ownerTitle, '')
    .replace(ownerTitle + RELATIONS_TITLE_DELIMITER, '');
}

/**
 * @param {String} [referenceId] absolute path
 * @param {Array} [references] with {'id': String} objects
 * @param {Object} [ownerElement]
 * @returns {Array}
 */
export function getRelationsFromList(referenceId, references, ownerElement) {
  const result = [];
  try {
    const referencePart = referenceId.replace(/\//g, RELATIONS_PATH_SLASH_REPLACEMENT);
    const ownerTitle = ownerElement && ownerElement.fullTitle;
    references.forEach((it) => {
      if (it.id.indexOf(`${RELATIONS_PATH_PREFIX}/`) === 0) {
        const names = it.id.replace(`${RELATIONS_PATH_PREFIX}/`, '').split(RELATIONS_PATH_DELIMITER);
        if (names[0] === referencePart || names[1] === referencePart) {
          if (typeof ownerTitle !== 'undefined') {
            const changes = {};
            changes.title = getRelatedTitle(it.title, ownerTitle);
            result.push(Object.assign({}, it, changes));
          } else {
            result.push(it);
          }
        }
      }
    });
  } catch (e) {
    console.error(e, arguments);
  }
  return result;
}

export function getRelationReferenceId(references) {
  return references
    .join(RELATIONS_PATH_DELIMITER)
    .replace(/\//g, RELATIONS_PATH_SLASH_REPLACEMENT);
}

export default class RelationsEditor extends Component {

  static propTypes = {
    type: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired,
  };

  static contextTypes = {
    container: PropTypes.object.isRequired,
  };

  constructor(props, context) {
    super(props, context);

    this.handleReferenceChange = this.handleReferenceChange.bind(this);
    this.handleCreateClick = this.handleCreateClick.bind(this);
    this.handleRemoveClick = this.handleRemoveClick.bind(this);

    const { container } = context;
    const currentReferenceId = window.location.hash.split('?')[0].split('#/elements/')[1]; // @todo quick hack
    let references;
    let relations;
    if (container.refs) {
      references = container.refs.toJS();
      relations = getRelationsFromList(currentReferenceId, references, container.main_data);
    } else {
      references = [];
      relations = [];
    }
    this.state = {
      references,
      currentReferenceId,
      isSelectedReferenceAvailable: true,
      selectedReferenceMessage: {
        type: 'danger',
        content: '',
      },
      createButtonDisabled: false,
      relations,
      pendingRemoveRelation: Immutable.Map(),
    };
  }

  render() {
    const self = this;
    const { state } = self;
    return (
      <div>
        {state.editingRelation ? [
          <div key="relationEditor">
            <h5 style={{ marginBottom: 10 }}>
              <AuiButton
                default
                onClick={() => self.setState({ editingRelation: null })}
                style={{ marginRight: 10 }}
              >
                &larr;
                назад
              </AuiButton>
              {state.editingRelation.title}
            </h5>
            <RelationConfigEditor
              references={state.references}
              item={state.editingRelation}
            />
          </div>,
        ] : [
          <div key="relationsCreator" className="col-lg-5">
            <div className="panel panel-default" style={{ minHeight: '350px' }}>
              <div className="panel-heading">
                Новая связь
              </div>
              <div className="panel-body">
                <div style={{ paddingBottom: 15 }}>
                  <p>Выберите справочник для создания связи с текущим:</p>
                  <ReferenceInput
                    value={state.selectedReference}
                    ignorePath={RELATIONS_PATH_PREFIX}
                    onChange={this.handleReferenceChange}
                  />
                </div>
                {(state.selectedReferenceMessage.content !== '') ? [
                  <div
                    className={`alert${(state.selectedReferenceMessage.type !== '') ?
                  ` alert-${state.selectedReferenceMessage.type}` : ''}`} role="alert"
                  >
                    {state.selectedReferenceMessage.content}
                  </div>,
                ] : []}
                {state.selectedReference && state.selectedReferenceMessage.content === '' ? (
                  state.isSelectedReferenceAvailable === false ? (
                    <div className="alert alert-warning">
                      Связь с выбранным справочником уже существует.
                    </div>
                  ) : (
                    <AuiButton
                      default
                      onClick={this.handleCreateClick}
                      disabled={this.state.createButtonDisabled}
                    >
                      Создать связь
                      &rarr;
                    </AuiButton>
                  )
                ) : []}
              </div>
            </div>
          </div>,
          <div key="relationsList" className="col-lg-7">
            <div className="panel panel-default">
              <div className="panel-heading">
                Существующие связи
              </div>
              <div className="panel-body">
                <ul>
                  {(state.relations.length === 0) ? [
                    <li key="no-relations-list-item">Существующих связей не обнаружено.</li>,
                  ] : []}
                  {state.relations.map(it => (
                    <li>
                      <a
                        href={`#/groups/${it.id}`}
                        style={{ marginRight: 15 }}
                        onClick={this.handleEditClick.bind(this, it)}
                      >
                        {it.title}
                      </a>

                      <a
                        href="javascript:void(0)" style={{ color: '#666' }}
                        data-relation={it.id}
                        onClick={this.handleRemoveClick}
                      >
                        <span
                          className={`aui-icon aui-icon-small ${
                         state.pendingRemoveRelation.get(it.id) ?
                         'aui-icon-wait' :
                         'aui-iconfont-delete'}`
                         }
                        />
                      </a>

                    </li>
                    ))}
                </ul>
              </div>
            </div>
          </div>,
        ]}
      </div>
    );
  }

  handleReferenceChange(value) {
    const selectedReference = value;
    let isSelectedReferenceAvailable = true;
    const linkingReferences = [this.state.currentReferenceId, value].sort();
    const relationReferenceId = `${RELATIONS_PATH_PREFIX}/${getRelationReferenceId(linkingReferences)}`;
    if (this.state.relations) {
      this.state.relations.forEach((it) => {
        // console.log(it['id'] === relationReferenceId, [it['id'], relationReferenceId]);
        if (it.id === relationReferenceId) {
          isSelectedReferenceAvailable = false;
        }
      });
    }
    // console.log('relations-editor:handleReferenceChange', value, relationReferenceId, this.state.relations);
    const selectedReferenceMessage = {
      content: '',
      type: 'danger',
    };
    this.setState({
      selectedReference,
      isSelectedReferenceAvailable,
      selectedReferenceMessage,
    });
  }

  handleCreateClick(event) {
    const self = this;
    const { state, context } = self;
    const { selectedReference } = state;
    const targetReference = selectedReference;
    if (targetReference) {
      // @todo quick hack, implement it in right way
      if (this.state.currentReferenceId) {
        // Build request body
        const linkingReferences = [this.state.currentReferenceId, targetReference].sort();
        const relationReferenceId = getRelationReferenceId(linkingReferences);
        // Build a title for relation references
        let title1 = linkingReferences[0];
        let title2 = linkingReferences[1];
        const { container } = context;
        if (container.refs) {
          const references = container.refs.toJS();
          references.forEach((it) => {
            if (it.id === linkingReferences[0]) {
              title1 = it.title;
            }
            if (it.id === linkingReferences[1]) {
              title2 = it.title;
            }
          });
        }
        const relationReferenceTitle = title1 + RELATIONS_TITLE_DELIMITER + title2;
        // console.log('create between', linkingReferences);
        const params = {
          id: relationReferenceId,
          fullTitle: relationReferenceTitle,
          shortTitle: relationReferenceTitle,
          description: '',
          parent: RELATIONS_PATH_PREFIX,
          isAvailable: true,
          schema: {
            id: relationReferenceId,
            title: relationReferenceTitle,
            extends: 'object',
            config: {
              properties: [{
                type: 'string',
                config: {},
                id: 'title',
                title: 'Наименование',
                required: true,
              }, {
                type: 'reference',
                config: {
                  key: linkingReferences[0],
                },
                id: 'reference_1',
                title: 'Справочник 1',
                required: true,
              }, {
                type: 'reference',
                config: {
                  key: linkingReferences[1],
                },
                id: 'reference_2',
                title: 'Справочник 2',
                required: false,
              }],
            },
            types: [],
            validationRules: [],
            deduplicationRules: {},
            exportTemplates:[],
          },
        };
        // Send a request
        createElement(params)
          .then(() => {
            const ownerTitle = context.container.main_data.fullTitle;
            const newRelation = {
              id: `${RELATIONS_PATH_PREFIX}/${relationReferenceId}`,
              title: getRelatedTitle(relationReferenceTitle, ownerTitle),
            };
            const newRelations = [].concat([newRelation], state.relations);
            self.setState({
              relations: newRelations,
              selectedReferenceMessage: {
                content: 'Связь успешно создана',
                type: 'success',
              },
            });
          })
          .catch((e) => {
            self.setState({
              selectedReferenceMessage: {
                content: `Ошибка при добавлении связи!<br />${e}`,
                type: 'danger',
              },
            });
          });
      }
    }
  }

  handleEditClick(item, event) {
    event = event || window.event;

    console.log(`Edit #/${RELATIONS_PATH_PREFIX}/${item.id}`);
    this.setState({
      editingRelation: item,
    });
    event.preventDefault ? event.preventDefault() : (event.returnValue = false);
  }


  handleRemoveClick(event) {
    event = event || window.event;
    event.preventDefault ? event.preventDefault() : (event.returnValue = false);

    const relationId = event.currentTarget.getAttribute('data-relation');
    const self = this;
    const { state, context } = self;
    const { pendingRemoveRelation } = state;
    if (!pendingRemoveRelation.get(relationId)) {
      self.setState({
        pendingRemoveRelation: pendingRemoveRelation.set(relationId, true),
      });
      RootService.path(relationId).delete()
        .then(() => {
          const { container } = context;
          const newRefs = container.refs.filter(it => it.get('id') !== relationId);

          // @todo test it!
          container.refs = newRefs;

          const relations = getRelationsFromList(state.currentReferenceId, newRefs.toJS(), container.main_data);
          self.setState({
            pendingRemoveRelation: pendingRemoveRelation.set(relationId, false),
            relations,
          });
        })
        .catch(() => self.setState({
          pendingRemoveRelation: pendingRemoveRelation.set(relationId, false),
        }));
    }
  }
}
