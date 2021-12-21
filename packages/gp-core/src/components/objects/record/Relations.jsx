import React, { PropTypes } from 'react';
import Immutable from 'immutable';
import { RecordService } from '@gostgroup/gp-api-services/lib/services';
import createRecord from '@gostgroup/gp-api-services/lib/helpers/record/createRecord';
import fetchAndAssembleElement from '@gostgroup/gp-api-services/lib/helpers/element/fetchAndAssembleEmbedRefs';

import { today } from '@gostgroup/gp-utils/lib/dates';

import { connect } from 'react-redux';
import { deleteEntryRFC } from 'gp-core/lib/redux/modules/record';
// import * as recordActions from 'gp-core/lib/redux/modules/record';
// import { objectSelector } from 'gp-core/lib/redux/selectors/objects';
// import { bindActionCreators } from 'redux';

import { AuiButton } from '@gostgroup/gp-ui-components/lib/buttons';
import RelationModal from '../RelationModal';
import {
  RELATIONS_PATH_PREFIX,
  RELATIONS_TITLE_DELIMITER,
  getRelationsFromTree,
  getRelationReferenceId,
  getRelatedTitle,
} from '@gostgroup/gp-constructor/lib/components/relations-editor';

@connect(
  state => state.core.objects,
  { onDelete: deleteEntryRFC },
)
export default class Relations extends React.Component {

  static propTypes = {
    record: PropTypes.shape({}),
    version: PropTypes.shape({}),
    objectsTree: PropTypes.shape({}),
    onDelete: PropTypes.func,
  }

  constructor(props, context) {
    super(props, context);

    this.handleRemoveRelationClick = this.handleRemoveRelationClick.bind(this);

    const { record, objectsTree } = props;
    const currentReferenceId = record.element.absolutPath;
    const currentElementId = record.id;
    const currentElementTitle = record.title;
    const relations = getRelationsFromTree(currentReferenceId, objectsTree);
    this.state = {
      newRelationModalVisible: false,
      currentReferenceId,
      currentElementId,
      currentElementTitle,
      relations,
      relatedItems: [],
      pendingRemoveRelation: new Immutable.Map(),
    };
    this.loadRelations();
  }

  // componentWillReceiveProps() {
  //   const currentReferenceId = record.element.absolutPath;
  //   const currentElementId = record.id;
  //   const currentElementTitle = record.title;
  //   const relations = getRelationsFromTree(currentReferenceId, objectsTree);
  //   this.setState({
  //     relatedItems: [],
  //     currentReferenceId,
  //     currentElementId,
  //     currentElementTitle,
  //     relations,
  //   });
  //
  //   this.loadRelations();
  // }
  //

  componentDidUpdate(prevProps, prevState) {
    if (prevState.currentReferenceId !== this.state.currentReferenceId ||
      prevState.currentElementId !== this.state.currentElementId) {
      this.loadRelations();
    }
  }

  handleRemoveRelationClick(recordPath, event) {
    event = event || window.event;
    event.preventDefault ? event.preventDefault() : (event.returnValue = false);
    const { pendingRemoveRelation } = this.state;
    if (!pendingRemoveRelation.get(recordPath)) {
      this.setState({
        pendingRemoveRelation: pendingRemoveRelation.set(recordPath, true),
      });
      // const ownerPath = this.props.record.absolutPath;
      // console.log('handleRemoveRelationClick', recordPath);
      this.props.onDelete(recordPath)
        .then(() => {
          this.loadRelations()
            .then(() => this.setState({
              pendingRemoveRelation: pendingRemoveRelation.set(recordPath, false),
            }));
        })
        .catch(() => this.setState({
          pendingRemoveRelation: pendingRemoveRelation.set(recordPath, false),
        }));
    }
  }

  async loadRelations() {
    const { relations, currentReferenceId, currentElementId } = this.state;
    const { record } = this.props;
    const result = [];
    const promises = relations.map((it, index) => fetchAndAssembleElement(it.id, { date: today(true) })
          .then((response) => {
            result[index] = [];
            if (response.element && response.versions &&
              response.versions.items &&
              response.versions.items.length > 0) {
              // Determinate prop id
              let propertyForCurrentReference;
              let propertyForRelatedReference;
              let relatedReferenceId;
              const properties = response.element.schema.config.properties;
              properties.forEach((prop) => {
                if (prop.type === 'reference') {
                  if (prop.config.key === currentReferenceId) {
                    propertyForCurrentReference = prop.id;
                  } else {
                    propertyForRelatedReference = prop.id;
                    relatedReferenceId = prop.config.key;
                  }
                }
              });
              // Extract values for current element
              response.versions.items.forEach((version) => {
                const objectData = version.version.object;
                const elementId = objectData[propertyForCurrentReference];
                if (currentElementId === elementId && version.isAvailable) {
                  result[index].push({
                    title: getRelatedTitle(objectData.title, record.fullTitle),
                    reference_id: relatedReferenceId,
                    reference_title: getRelatedTitle(response.element.fullTitle, record.element.fullTitle),
                    element_id: objectData[propertyForRelatedReference],
                    relation_path: version.absolutPath,
                  });
                }
              });
            }
          })
    );
    await Promise.all(promises);
    // transform array of arrays to flat array
    this.setState({
      relatedItems: Array.prototype.concat.apply([], result),
    });
  }

  /**
   * @param {String} referenceId
   * @param {String} elementId
   * @returns {Promise|undefined}
   */
  addNewRelation = ({ referenceId, elementId }) => {
    if (elementId === '') return null;
    const { state } = this;
    return RecordService.path(referenceId, elementId).get()
      .then((relatedElement) => {
        const relationReferences = [referenceId, state.currentReferenceId].sort();
        const relationReferenceId = getRelationReferenceId(relationReferences);
        const relation = relationReferences.map((id) => {
          if (id === referenceId) {
            return {
              id: elementId,
              title: relatedElement.title,
            };
          }
          return {
            id: state.currentElementId,
            title: state.currentElementTitle,
          };
        });
        const title = relation[0].title + RELATIONS_TITLE_DELIMITER + relation[1].title;
        const payload = {
          id: '',
          fullTitle: title,
          shortTitle: title,
          isAvailable: true,
          version: {
            id: '',
            dateStart: today,
            data: {
              reference_1: relation[0].id,
              reference_2: relation[1].id,
              title,
            },
          },
        };
        createRecord(`${RELATIONS_PATH_PREFIX}/${relationReferenceId}`, payload)
          .then(() => {
            this.setState({ newRelationModalVisible: false });
            this.loadRelations();
          });
      })
      .catch(error => console.error('addNewRelation', { error }));
  }

  renderRelations() {
    const { state } = this;
    if (state.relatedItems.length === 0) {
      return (
        <li key="noRelations">Существующих ссылок не обнаружено.</li>
      );
    }

    const byGroups = {};
    state.relatedItems.forEach((it) => {
      const name = it.reference_title;
      if (!byGroups[name]) {
        byGroups[name] = [];
      }
      byGroups[name].push(it);
    });

    const items = [];
    Object.keys(byGroups).forEach((groupName, index) => {
      items.push(
        <li key={`group${index}`} style={{ paddingBottom: 15 }}>
          <b>{groupName}</b>
          <ul>
            {byGroups[groupName].map((it, index) => {
              const relatedPath = `${it.reference_id}/${it.element_id}`;
              return (
                <li key={`relation${index}`}>
                  <a
                    href={`#/records/${relatedPath}`}
                    style={{ marginRight: 15 }}
                  >
                    {it.title}
                  </a>
                  <a
                    style={{ color: '#666' }}
                    onClick={this.handleRemoveRelationClick.bind(this, it.relation_path)}
                  >
                    <span
                      className={`aui-icon aui-icon-small ${
                      state.pendingRemoveRelation.get(relatedPath) ?
                      'aui-icon-wait' :
                      'aui-iconfont-delete'}`
                    }
                    />
                  </a>
                </li>
              );
            })}
          </ul>
        </li>
      );
    });
    return <ul>{items}</ul>;
  }

  render() {
    const { record, version } = this.props;
    const schema = record.element.schema;
    const { state } = this;

    return (
      <div>
        {state.relations.length > 0 &&
          <div>
            <h2>Связи</h2>
            <div className="float-right">
              <div className="aui-buttons">
                <AuiButton onClick={() => this.setState({ newRelationModalVisible: true })}>
                  Добавить ссылку...
                </AuiButton>
              </div>
            </div>
            {this.renderRelations()}
          </div>
        }
        <RelationModal
          title="Добавить ссылку"
          schema={schema}
          version={version}
          isOpen={state.newRelationModalVisible}
          onClose={() => this.setState({ newRelationModalVisible: false, errors: [] })}
          onSubmit={this.addNewRelation}
          errors={state.errors}
          record={record}
        />
      </div>
    );
  }
}
