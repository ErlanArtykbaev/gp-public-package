import React, { Component } from 'react';
import createRecord from '@gostgroup/gp-api-services/lib/helpers/record/createRecord';
import updateVersion from '@gostgroup/gp-api-services/lib/helpers/record/updateVersion';
import fetchAndAssembleElement from '@gostgroup/gp-api-services/lib/helpers/element/fetchAndAssembleEmbedRefs';
import createElement from '@gostgroup/gp-api-services/lib/helpers/element/createElement';
import { AuiButton } from '@gostgroup/gp-ui-components/lib/buttons';
import { today } from '@gostgroup/gp-utils/lib/util.js';
import {
  RELATIONS_PATH_PREFIX,
  RELATIONS_METADATA_REFERENCE,
} from './relations-editor';

const DEFAULT_LOW_RANGE = 0;
const DEFAULT_HIGH_RANGE = 1000000;

/**
 * @returns {Promise}
 */
const createMetaReference = () => {
  const params = {
    id: 'metadata',
    fullTitle: 'Метаданные связей между справочниками',
    shortTitle: 'Метаданные связей между справочниками',
    description: '',
    parent: RELATIONS_PATH_PREFIX,
    isAvailable: true,
    schema: {
      id: 'novii_tip',
      title: 'Новый тип',
      extends: 'object',
      config: {
        properties: [{
          type: 'string',
          id: 'reference1',
          title: 'Справочник 1',
          required: true,
        }, {
          type: 'string',
          id: 'reference2',
          title: 'Справочник 2',
          required: true,
        }, {
          type: 'bool',
          id: 'check_unique_for_relations',
          title: 'Контролировать уникальность',
        }, {
          type: 'number',
          id: 'min_connections1',
          title: 'Минимальное количество элементов 1',
        }, {
          type: 'number',
          id: 'max_connections1',
          title: 'Максимальное количество элементов 1',
        }, {
          type: 'bool',
          id: 'is_unlimited_connections1',
          title: 'Безлимитное количество элементов 1',
        }, {
          type: 'number',
          id: 'min_connections2',
          title: 'Минимальное количество элементов 2',
        }, {
          type: 'number',
          id: 'max_connections2',
          title: 'Максимальное количество элементов 2',
        }, {
          type: 'bool',
          id: 'is_unlimited_connections2',
          title: 'Безлимитное количество элементов 2',
        }],
      },
      types: [],
      validationRules: [],
      deduplicationRules: {},
      exportTempltes:[],
    },
  };

  return createElement(params);
};

/**
 * @param {Object} [data]
 * @returns {Object}
 */
const getStateFromMeta = (data) => {
  const finalData = data || {};
  return {
    checkUnique:
      finalData.check_unique_for_relations !== undefined
        ? finalData.check_unique_for_relations
        : false,
    connection1LowRange:
      finalData.min_connections1 !== undefined
        ? finalData.min_connections1
        : DEFAULT_LOW_RANGE,
    connection1HighRange:
      finalData.max_connections1 !== undefined
        ? finalData.max_connections1
        : DEFAULT_HIGH_RANGE,
    isConnection1Unlimited:
      finalData.is_unlimited_connections1 !== undefined
        ? finalData.is_unlimited_connections1
        : true,
    connection2LowRange:
      finalData.min_connections2 !== undefined
        ? finalData.min_connections2
        : DEFAULT_LOW_RANGE,
    connection2HighRange:
      finalData.max_connections2 !== undefined
        ? finalData.max_connections2
        : DEFAULT_HIGH_RANGE,
    isConnection2Unlimited:
      finalData.is_unlimited_connections2 !== undefined
        ? finalData.is_unlimited_connections2
        : true,
  };
};

/**
 * @param {Object} [state]
 * @returns {Object}
 */
const getMetaFromState = (state) => {
  const finalState = state || {};
  return {
    check_unique_for_relations:
      finalState.checkUnique !== undefined
        ? finalState.checkUnique
        : false,
    min_connections1:
      finalState.connection1LowRange !== undefined
        ? parseInt(finalState.connection1LowRange, 10)
        : DEFAULT_LOW_RANGE,
    max_connections1:
      finalState.connection1HighRange !== undefined
        ? parseInt(finalState.connection1HighRange, 10)
        : DEFAULT_HIGH_RANGE,
    is_unlimited_connections1:
      finalState.isConnection1Unlimited !== undefined
        ? finalState.isConnection1Unlimited
        : true,
    min_connections2:
      finalState.connection2LowRange !== undefined
        ? finalState.connection2LowRange
        : DEFAULT_LOW_RANGE,
    max_connections2:
      finalState.connection2HighRange !== undefined
        ? finalState.connection2HighRange
        : DEFAULT_HIGH_RANGE,
    is_unlimited_connections2:
      finalState.isConnection2Unlimited !== undefined
        ? finalState.isConnection2Unlimited
        : true,
  };
};

/**
 * @param {Object} relationInfo
 * @param {String} relationInfo.title
 * @param {String} relationInfo.reference1Id
 * @param {String} relationInfo.reference2Id
 * @param {Object} [state]
 * @returns {Promise}
 */
function createMetaRecord(relationInfo, data) {
  const { title, reference1Id, reference2Id } = relationInfo;
  const params = {
    fullTitle: title,
    shortTitle: title,
    isAvailable: true,
    version: {
      dateStart: today(),
      data: Object.assign({
        reference1: reference1Id,
        reference2: reference2Id,
      }, data),
    },
  };
  // FIXME починить
  const newRecordCreated =
    createRecord(RELATIONS_METADATA_REFERENCE, params, today())
      .then(metadata => findMetaRecord(metadata, relationInfo));

  return newRecordCreated;
}

/**
 * @param {Object} metadataElement
 * @param {Object} relationInfo
 * @param {String} relationInfo.title
 * @param {String} relationInfo.reference1Id
 * @param {String} relationInfo.reference2Id
 * @returns {Object|Boolean}
 */
const findMetaRecord = (metadataElement, relationInfo) => {
  const { reference1Id, reference2Id } = relationInfo;
  const items = (metadataElement.versions && metadataElement.versions.items) || [];
  let result = false;
  console.log('findMetaRecord', { relationInfo, metadataElement }); // eslint-disable-line no-console
  items.forEach((item) => {
    const record = item.version.object;
    const isDirectedMatch =
      (record.reference1 === reference1Id)
      && (record.reference2 === reference2Id);
    const isInvertedMatch =
      (record.reference1 === reference2Id)
      && (record.reference2 === reference1Id);
    if (isDirectedMatch || isInvertedMatch) {
      result = record;
    }
  });
  return result;
};

const updateMetaRecord = (metadataElement, relationInfo, data) => {
  const finalData = Object.assign({
    reference1: relationInfo.reference1Id,
    reference2: relationInfo.reference2Id,
  }, data);
  console.log('updateMetaRecord', { metadataElement, finalData });
  const items = metadataElement.versions.items;
  let matched;
  items.forEach((item) => {
    if (item.title === relationInfo.title) {
      matched = item;
    }
  });
  if (!matched) {
    return createMetaRecord(relationInfo, data);
  } else {
    console.log('updateVersion', matched);
    return updateVersion(matched.absolutPath, {
      version: {
        id: matched.versionId,
      },
      startDate: today(),
      cleanData: finalData,
    });
  }
};

export default class RelationConfigEditor extends Component {
  constructor(props, context) {
    super(props, context);

    this.handleSaveClick = this.handleSaveClick.bind(this);

    this.state = Object.assign({
      isDataLoading: true,
      isModified: false,
      reference1Title: 'Справочник A',
      reference2Title: 'Справочник B',
    }, getStateFromMeta(null));
  }

  componentDidMount() {
    const self = this;
    const { props } = self;

    const metadataElementLoaded = fetchAndAssembleElement(RELATIONS_METADATA_REFERENCE, { date: today() })
      .then((response) => {
        if (response.element.error) {
          return null;
        }
        console.log('RelationConfigEditor: relations metadata found', response);
        return response;
      })
      .then((metadataElement) => {
        if (!metadataElement) {
          const metadataElementCreated =
            createMetaReference()
              .then((metadata) => {
                console.log('RelationConfigEditor: relations metadata created', metadata);
                return metadata;
              })
              .then(() => fetchAndAssembleElement(RELATIONS_METADATA_REFERENCE, { date: today() }));
          return metadataElementCreated;
        }
        return metadataElement;
      });

    const relationReferenceId = props.item.id;
    const relationInfoLoaded = fetchAndAssembleElement(relationReferenceId, { date: today() })
      .then((response) => {
        console.log('RelationConfigEditor: relation reference loaded', response);
        if (response && response.element) {
          const element = response.element;
          const relationInfo = { title: element.fullTitle };
          const properties = element.schema.config.properties;
          properties.forEach((it) => {
            if (it.id === 'reference_1') {
              relationInfo.reference1Title = it.title;
              relationInfo.reference1Id = it.config && it.config.key;
            }
            if (it.id === 'reference_2') {
              relationInfo.reference2Title = it.title;
              relationInfo.reference2Id = it.config && it.config.key;
            }
          });
          return relationInfo;
        }
      });

    Promise.all([metadataElementLoaded, relationInfoLoaded])
      .then(([metadataElement, relationInfo]) => {
        self._metadataElement = metadataElement;
        self._relationInfo = relationInfo;
        let stateFromMeta;
        const metaRecord = findMetaRecord(metadataElement, relationInfo);
        console.log('findMetaRecord', metaRecord);
        if (metaRecord) {
          console.log('metaRecord', metaRecord);
          stateFromMeta = getStateFromMeta(metaRecord);
        }
        const { reference1Title, reference2Title } = relationInfo;
        const finalState = Object.assign({
          isDataLoading: false,
          isModified: false,
          reference1Title,
          reference2Title,
        }, stateFromMeta);
        self.setState(finalState);
      });
  }

  render() {
    const self = this;
    const { state } = self;

    const regex0 = /^(?:0|[1-9][0-9]*)$/;
    const regex1 = /^[1-9][0-9]*$/;

    const validateConnection = !state.isModified
      || +state.connection1HighRange <= +state.connection1LowRange
      || +state.connection2HighRange <= +state.connection2LowRange
      || !regex1.test(state.connection1HighRange)
      || !regex0.test(state.connection1LowRange)
      || !regex1.test(state.connection2HighRange)
      || !regex0.test(state.connection2LowRange);

    const validate1High = +state.connection1HighRange <= +state.connection1LowRange || !regex1.test(state.connection1HighRange);
    const validate1Low = !regex0.test(state.connection1LowRange);
    const validate2High = +state.connection2HighRange <= +state.connection2LowRange || !regex1.test(state.connection2HighRange);
    const validate2Low = !regex0.test(state.connection2LowRange);

    return (
      <div>
        {state.isDataLoading ? [
          'Загрузка данных...',
        ] : [
          <div key="relationConfigEditor" className="panel panel-default">
            <div className="panel-heading">
                Конфигурация связи
              </div>
            <div className="panel-body">
              <div className="checkbox" style={{ marginBottom: 30 }}>
                <label>
                  <input
                    type="checkbox"
                    checked={state.checkUnique}
                    onChange={event => self.setState({
                      checkUnique: event.target.checked,
                      isModified: true,
                    })}
                  />
                    Контролировать уникальность
                    <p className="help-block">
                      Ограничение возможности создания дублирующихся связей (записей с одними
                      и теми же парами значений записей связываемых справочников).
                    </p>
                </label>
              </div>
              <div className="page-header">
                <h4>
                    Кардинальность связи
                  </h4>
              </div>
              <div className="col-sm-6 col-lg-6">
                <h5>{state.reference1Title || 'Справочник 1'}</h5>

                <p className="help-block">Укажите ограничение на количество элементов с этой стороны связи.</p>

                <form className="form-horizontal">
                  <div className="form-group">
                    <label htmlFor="lowRange1" className="col-sm-3 col-lg-3 control-label">
                        От:
                      </label>
                    <div className="col-sm-9 col-lg-9">
                      <input
                        id="lowRange1" type="number"
                        className="form-control"
                        placeholder="Число от 0 и выше"
                        value={state.connection1LowRange}
                        onChange={event => self.setState({
                          connection1LowRange: event.target.value,
                          isModified: true,
                        })}
                      />
                      {validate1Low ? <label style={{ color: 'red' }}>Число должно быть целым, от 0 и выше</label> : ''}
                    </div>
                  </div>
                  <div className="form-group">
                    <label htmlFor="highRange1" className="col-sm-3 col-lg-3 control-label">
                        До:
                      </label>

                    <div className="col-sm-9 col-lg-9">
                      <input
                        id="highRange1" type="number"
                        className="form-control"
                        placeholder="Число от 1 и выше"
                        disabled={state.isConnection1Unlimited}
                        value={state.connection1HighRange}
                        onChange={event => self.setState({
                          connection1HighRange: event.target.value,
                          isModified: true,
                        })}
                      />
                      {validate1High ? <label style={{ color: 'red' }}>Число должно быть целым, больше поля "От", от 1 и выше</label> : ''}
                      <div key="highRange1Unlimited" className="checkbox">
                        <label>
                          <input
                            type="checkbox"
                            checked={state.isConnection1Unlimited}
                            onChange={event => self.setState({
                              isConnection1Unlimited: !state.isConnection1Unlimited,
                              isModified: true,
                            })}
                          />
                            Неограничено
                          </label>
                      </div>
                    </div>
                  </div>
                </form>
              </div>
              <div className="col-sm-6 col-lg-6">
                <h5>{state.reference2Title || 'Справочник 2'}</h5>

                <p className="help-block">Укажите ограничение на количество элементов с этой стороны связи.</p>

                <form className="form-horizontal">
                  <div className="form-group">
                    <label htmlFor="lowRange1" className="col-sm-3 col-lg-3 control-label">
                        От:
                      </label>

                    <div className="col-sm-9 col-lg-9">
                      <input
                        id="lowRange2" type="number"
                        className="form-control"
                        placeholder="Число от 0 и выше"
                        min="0"
                        value={state.connection2LowRange}
                        onChange={event => self.setState({
                          connection2LowRange: event.target.value,
                          isModified: true,
                        })}
                      />
                      {validate2Low ? <label style={{ color: 'red' }}>Число должно быть целым, от 0 и выше</label> : ''}
                    </div>
                  </div>
                  <div className="form-group">
                    <label htmlFor="highRange2" className="col-sm-3 col-lg-3 control-label">
                        До:
                      </label>

                    <div className="col-sm-9 col-lg-9">
                      <input
                        id="highRange2" type="number"
                        className="form-control"
                        placeholder="Число от 1 и выше"
                        disabled={state.isConnection2Unlimited}
                        min="0"
                        value={state.connection2HighRange}
                        onChange={event => self.setState({
                          connection2HighRange: event.target.value,
                          isModified: true,
                        })}
                      />
                      {validate2High ? <label style={{ color: 'red' }}>Число должно быть целым, больше поля "От", от 1 и выше</label> : ''}
                      <div key="highRange1Unlimited" className="checkbox">
                        <label>
                          <input
                            type="checkbox"
                            checked={state.isConnection2Unlimited}
                            onChange={event => self.setState({
                              isConnection2Unlimited: !state.isConnection2Unlimited,
                              isModified: true,
                            })}
                          />
                            Неограничено
                          </label>
                      </div>
                    </div>
                  </div>
                </form>
              </div>
              <p key="buttons" className="text-right">
                <AuiButton primary disabled={validateConnection} onClick={this.handleSaveClick}>
                  Применить
                </AuiButton>
              </p>
            </div>
          </div>,
        ]}
      </div>
    );
  }

  handleSaveClick() {
    const dataForMeta = getMetaFromState(this.state);
    updateMetaRecord(this._metadataElement, this._relationInfo, dataForMeta);
    this.setState({
      isModified: false,
    });
  }
}
