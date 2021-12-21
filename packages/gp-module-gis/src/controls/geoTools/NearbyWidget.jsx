import React, { PropTypes } from 'react';
import Button from 'react-bootstrap/lib/Button';
import Select from 'react-select';
import ControlLabel from 'react-bootstrap/lib/ControlLabel';
import FormGroup from 'react-bootstrap/lib/FormGroup';
import FormControl from 'react-bootstrap/lib/FormControl';
import Row from 'react-bootstrap/lib/Row';
import Col from 'react-bootstrap/lib/Col';
import Glyphicon from 'react-bootstrap/lib/Glyphicon';
import isEqual from 'lodash/isEqual';
import { shouldUpdate } from 'recompose';
import isEmpty from 'lodash/isEmpty';
import reduce from 'lodash/reduce';
import values from 'lodash/values';
import findIndex from 'lodash/findIndex';
import { ObjectParamsService, ObjectParamValuesService } from 'bg/api/services';
import Preloader from '@gostgroup/gp-ui-components/lib/Preloader';

import { connect } from 'react-redux';
import { getNearby, disableNearby } from 'bg/redux/modules/geoObjects';
import { getCurrentUserId } from '@gostgroup/gp-core/lib/redux/selectors/session';

import Helper from '../Helper';
import styles from './geotools.scss';
import OpenLayerDrawing from '../OpenLayerDrawing';
import CoordSelector, { withCoordSelection } from './CoordSelector';

const NEARBY_MODES = {
  POINT: 'point',
  POLY: 'polygon',
};

// ЗА ЧТО ЭТОТ ПИЗДЕЦ
@connect(
  state => ({
    currentUserId: getCurrentUserId(state),
    layers: state.geoObjects.geoObjectsTypes,
  }), {
    getNearby,
    disableNearby,
  },
)
@withCoordSelection({ prefix: 'origin' })
@shouldUpdate((p, n) => !isEqual(p, n))
export default class NearbyWidget extends React.Component {
  static propTypes = {
    map: PropTypes.object,
    layers: PropTypes.object,
    currentUserId: PropTypes.string,
    origin: PropTypes.shape({}),

    getNearby: PropTypes.func.isRequired,
    disableNearby: PropTypes.func.isRequired,
  }

  constructor(p, c) {
    super(p, c);
    this.state = {
      addr: '',
      distance: 300,
      loading: false,
      layers: {},
      objects: [],
      mode: NEARBY_MODES.POINT,
      polygon: null,
      geocodeError: false,
    };
    this.keydownEvent = this.keydownEvent.bind(this);
  }

  componentWillMount() {
    this.helper = new Helper(this.props.map);
    this.drawing = new OpenLayerDrawing(this.props.map, this.helper.source);
    this.setState({ layers: { object: [] } });
  }

  async componentWillUpdate(nextProps, nextState) {
    const { objects, distance } = nextState;
    const { coord } = nextProps.origin;
    const originChanged = coord && !isEqual(coord, this.props.origin.coord);
    const distanceChanged = distance != null && !isEqual(distance, this.state.distance);

    if (originChanged) {
      this.helper.clear();
      this.helper.markEPSG(coord, Number(distance));
      if (this.state.mode === NEARBY_MODES.ADDR) {
        this.props.map.getView().setCenter(coord);
      }
    }

    if (distanceChanged) {
      this.helper.clear();
      this.helper.markEPSG(coord, Number(distance));
      if (this.state.mode === NEARBY_MODES.ADDR) {
        this.props.map.getView().setCenter(coord);
      }
    }

    if (objects && objects.length) {
      for (const o of objects) {
        let changed = false;
        if (!o.paramList) {
          o.paramList = await this.getParamList(o);
          changed = true;
        }
        if (o.params && o.params.length) {
          for (const p of o.params) {
            if (!p.valueList) {
              p.valueList = await this.getParamValues(p, o);
              changed = true;
            }
          }
        }
        changed && this.setState({ objects });
      }
    }

    if (this.state.mode !== nextState.mode) {
      this.helper.clear();
      if (nextState.mode === NEARBY_MODES.POLY) {
        document.addEventListener('keydown', this.keydownEvent);
        this.drawing.start('Polygon', polygon => this.setState({ polygon }));
      } else if (this.state.mode === NEARBY_MODES.POLY) {
        this.drawing.clear();
      }
    }
  }

  componentWillUnmount() {
    if (this.drawing) document.removeEventListener('keydown', this.keydownEvent);
    this.helper.teardown();
    this.props.disableNearby();
    this.drawing.clear();
  }

  async getParamList(object) {
    const type = object.id;
    const list = await ObjectParamsService.get({ type });
    return list;
  }

  async getParamValues(param, object) {
    const type_id = param.id;
    const layer_id = object.id;
    const list = await ObjectParamValuesService.get({ type_id, layer_id });
    return list;
  }

  keydownEvent(event) {
    const keyName = event.key;
    if (keyName === 'Escape') {
      this.setState({ polygon: null });
      this.helper.teardown();
      this.helper = new Helper(this.props.map);
      this.drawing = new OpenLayerDrawing(this.props.map, this.helper.source);
      this.drawing.start('Polygon', polygon => this.setState({ polygon }));
    }
  }

  dispatchNearby() {
    this.props.disableNearby();
    if (this.state.loading) {
      return;
    }
    this.setState({ loading: true });
    // собрать фильтр по параметрам
    const objects = this.state.objects.map(o => ({
      id: o.id,
      params: (o.params || []).map(p => ({ id: p.id, values: p.values })),
    }));
    // искать только по слоям, на которых что-нибудь выбрано
    const layers = reduce(
      { ...this.state.layers, object: objects },
      (acc, vals, key) => isEmpty(vals) ? acc : { ...acc, [key]: vals },
      {}
    );

    const polygonMode = this.state.mode === NEARBY_MODES.POLY;
    const makeOrigin = (c = []) => new ol.Feature({
      geometry: new ol.geom.Point(ol.proj.transform(c.slice().reverse(), 'EPSG:4326', 'EPSG:3857')),
    });
    const feature = polygonMode ? this.state.polygon : makeOrigin(this.props.origin.coord);
    const distance = polygonMode ? 0 : Number(this.state.distance);

    this.props.getNearby(feature, distance, layers)
      .catch(() => {})
      .then(() => this.setState({ loading: false }));
  }

  changeLayers(field, value) {
    const { layers } = this.state;
    layers[field] = value ? value.split(',').map(id => ({ id, params: [] })) : [];
    this.setState({ layers });
  }

  toggleObjectType(value, label) {
    const { objects } = this.state;
    const index = findIndex(objects, o => o.id === value);
    if (index > -1) {
      objects.splice(index, 1);
    } else {
      objects.push({ id: value, name: label });
    }
    this.setState({ objects });
  }

  toggleParam(objectId, paramId, label) {
    const { objects } = this.state;
    const index = findIndex(objects, o => o.id === objectId);
    if (!objects[index].params) objects[index].params = [];
    if (index > -1) {
      const paramIndex = findIndex(objects[index].params, p => p.id === paramId);
      if (paramIndex > -1) {
        objects[index].params.splice(paramIndex, 1);
      } else {
        objects[index].params.push({ id: paramId, name: label });
      }
    }
    this.setState({ objects });
  }

  handleParamChange(objectId, paramId, v) {
    const { objects } = this.state;
    objects.forEach((o) => {
      if (o.id === objectId) {
        o.params.forEach((p) => {
          if (p.id === paramId) p.values = v ? v.split('^.^') : [];
        });
      }
    });
    this.setState({ objects });
  }

  renderObjects(objects) {
    return objects.map((o, i) => {
      const { params = [], paramList } = o;
      const options = (paramList || [])
        .filter(p => !params.find(e => e.id === p.id))
        .map(p => ({ label: p.title, value: p.id }));
      return (
        <div key={i} className={styles.object}>
          {o.name}
          <Glyphicon glyph="remove" onClick={() => this.toggleObjectType(o.id)} />
          {!paramList && <div>Загрузка...</div>}
          {!isEmpty(options) && (
            <Select
              className={styles.multiselect}
              clearable={false}
              options={options}
              onChange={(v, op) => this.toggleParam(o.id, v, op[0].label)}
              placeholder="Выберите атрибут для добавления"
            />
          )}
          <table>
            <tbody>
              {params.map((p, j) => {
                const { valueList = [] } = p;
                return (
                  <tr key={j}>
                    <td>
                      <Glyphicon glyph="remove" onClick={() => this.toggleParam(o.id, p.id)} />
                      {p.name}
                    </td>
                    <td>
                      {valueList.length ? (
                        <Select
                          className={styles.multiselect}
                          clearable={false}
                          value={p.values}
                          multi
                          delimiter={'^.^'}
                          options={valueList.map(v => ({ label: v, value: v }))}
                          onChange={v => this.handleParamChange(o.id, p.id, v)}
                          placeholder="Выберите значение"
                        />
                      ) : 'Загрузка...'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      );
    });
  }

  render() {
    const layers = { ...this.props.layers };
    const isAdmin = this.props.currentUserId === 'sys';
    const { situation = [], resources = [], security = [] } = this.state.layers;
    Object.keys(layers).forEach((k) => { layers[k] = layers[k].map(e => ({ label: e.title, value: e.id })); });
    const { objects = [] } = this.state;
    const layersIsEmpty = values(this.state.layers).every(l => isEmpty(l)) && objects.length === 0;
    const invalid = layersIsEmpty ||
      (this.state.mode === NEARBY_MODES.POLY && !this.state.polygon) ||
      (this.state.mode !== NEARBY_MODES.POLY && !this.props.origin.coord) ||
      ((this.state.distance == null || this.state.distance === '') && Number(this.state.distance) >= 0);

    return (
      <FormGroup className={styles.nearbyContent}>
        <FormGroup>
          <Row>
            <Col md={isAdmin ? 6 : 12}>
              <ControlLabel>Выберите тип объекта</ControlLabel>
              <Select
                className={styles.multiselect}
                clearable={false}
                options={layers.object.filter(o => !objects.find(e => e.id === o.value))}
                onChange={(v, o) => this.toggleObjectType(v, o[0].label)}
                placeholder="Выберите тип"
              />
              {this.renderObjects(objects)}
            </Col>
            {isAdmin && <Col md={6}>
              <ControlLabel>ЧС/КСиП</ControlLabel>
              <Select
                className={styles.multiselect}
                value={situation.map(s => s.id)}
                clearable={false}
                options={layers.situation}
                multi
                clearValueText="Очистить поле"
                clearAllText="Очистить поле"
                noResultsText="Не найдено"
                onChange={v => this.changeLayers('situation', v)}
                placeholder=""
              />
            </Col>}
          </Row>
          {isAdmin && <Row>
            <Col md={6}>
              <ControlLabel>Средства контроля</ControlLabel>
              <Select
                className={styles.multiselect}
                value={resources.map(s => s.id)}
                clearable={false}
                options={layers.resources}
                multi
                clearValueText="Очистить поле"
                clearAllText="Очистить поле"
                noResultsText="Не найдено"
                onChange={v => this.changeLayers('resources', v)}
                placeholder=""
              />
            </Col>
            <Col md={6}>
              <ControlLabel>Средства обнаружения РСЧС</ControlLabel>
              <Select
                className={styles.multiselect}
                value={security.map(s => s.id)}
                clearable={false}
                options={layers.security}
                multi
                clearValueText="Очистить поле"
                clearAllText="Очистить поле"
                noResultsText="Не найдено"
                onChange={v => this.changeLayers('security', v)}
                placeholder=""
              />
            </Col>
          </Row>}
        </FormGroup>
        <FormGroup>
          <ControlLabel>Режим</ControlLabel>
          <Select
            value={this.state.mode}
            clearable={false}
            searchable={false}
            options={[
              { value: NEARBY_MODES.POINT, label: 'Рядом с точкой' },
              { value: NEARBY_MODES.POLY, label: 'В области' },
            ]}
            onChange={mode => this.setState({ mode })}
          />
        </FormGroup>
        {this.state.mode === NEARBY_MODES.POINT && <FormGroup>
          <ControlLabel>Адрес</ControlLabel>
          <CoordSelector map={this.props.map} placeholder="Введите адрес" {...this.props.origin} />
        </FormGroup>}
        {this.state.mode === NEARBY_MODES.POINT && <FormGroup>
          <ControlLabel>Радиус, м.</ControlLabel>
          <FormControl
            type="number"
            placeholder="300"
            min="0"
            value={this.state.distance}
            onChange={e => this.setState({ distance: e.target.value })}
          />
        </FormGroup>}
        <FormGroup>
          <Button onClick={() => this.dispatchNearby()} disabled={invalid}>
            Найти объекты
          </Button>
        </FormGroup>
        {(this.state.loading || this.props.origin.loading) &&
          <Preloader faded />
        }
      </FormGroup>
    );
  }
}
