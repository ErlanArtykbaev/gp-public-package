import React, { PropTypes } from 'react';
import { autobind } from 'core-decorators';
import cx from 'classnames';
import Immutable from 'immutable';
import Select from 'react-select';
import Modal from '@gostgroup/gp-ui-components/lib/Modal';
import { AuiButton } from '@gostgroup/gp-ui-components/lib/buttons';
import { GeoJSONFeature, GeoJSONFeatureCollection, parseFeatureCollection } from '@gostgroup/gp-utils/lib/GeoJSON.js';
import GeoJSONEditor from '@gostgroup/gp-constructor/lib/components/editors/GeoJSONEditor';
import LeafletMap from './maps/LeafletMap';
import { getConfig } from '../../config.js';

// TODO eslint

const FEATURE_TYPES_OPTIONS = [
  {
    label: 'Точка',
    value: 'Point',
  },
  {
    label: 'Линия',
    value: 'LineString',
  },
  {
    label: 'Полигон',
    value: 'Polygon',
  },
  {
    label: 'Множественные линии',
    value: 'MultiLineString',
  },
  {
    label: 'Множественные точки',
    value: 'MultiPoint',
  },
];

const MIN_POINTS_COUNT_BY_TYPE = {
  LineString: 2,
  Polygon: 4,
  MultiLineString: 2,
  MultiPoint: 1,
};

function renderGeodataPoint({ onLatitudeChange, onLongitudeChange, error, readOnly, noLabel, pointsCanBeDeleted, type, onPointDelete, coordinates, arrayIndex }, point, index) {
  const latitudeInputClasses = cx('text', 'input--text', {
    'input--invalid': error && error[index] && error[index].latitudeError,
  });

  const longitudeInputClasses = cx('text', 'input--text', {
    'input--invalid': error && error[index] && error[index].longitudeError,
  });

  const labelStyle = { width: 65 };
  const coordinateStyle = { marginTop: 10 };
  const buttonStyle = { marginLeft: 230 };

  let polygonLastPointMessage = '';
  if (type === 'Polygon' && index === coordinates.length - 1) {
    readOnly = true;
    polygonLastPointMessage = ' (последняя точка полигона должна совпадать с первой)';
  }

  return (
    <div key={index} style={{ marginTop: 5 }}>
      {!noLabel ?
        <h5>
          Точка {index + 1} <span>{polygonLastPointMessage}</span>
          {pointsCanBeDeleted && !readOnly ?
            <AuiButton type="button" style={buttonStyle} onClick={() => onPointDelete(index, arrayIndex)}><i className="fa fa-times aui-red" /></AuiButton>
          : ''}
        </h5>
      : ''}
      <div style={coordinateStyle}>
        <label style={labelStyle}>Широта</label>
        <input className={latitudeInputClasses} value={point[1]} disabled={readOnly} onChange={e => onLatitudeChange(e, index, arrayIndex)} placeholder="55.7526176" />
        <div className="error">
          {error && error[index] && error[index].latitudeError ? error[index].latitudeError : ''}
        </div>
      </div>
      <div style={coordinateStyle}>
        <label style={labelStyle}>Долгота</label>
        <input className={longitudeInputClasses} value={point[0]} disabled={readOnly} onChange={e => onLongitudeChange(e, index, arrayIndex)} placeholder="37.6241145" />
        <div className="error">
          {error && error[index] && error[index].longitudeError ? error[index].longitudeError : ''}
        </div>
      </div>
    </div>
  );
}

class PointInput extends React.Component {
  render() {
    return (
      <div>
        {renderGeodataPoint(this.props, this.props.coordinates, 0)}
        {!this.props.readOnly && <div className="small information-text">Вводить координаты нужно в ° градусах в виде десятичной дроби (современный вариант) с разделителем точка.</div>}
      </div>
    );
  }
}

class PointsInput extends React.Component {
  render() {
    return (
      <div>
        {this.props.coordinates.map(renderGeodataPoint.bind(null, this.props))}
        {!this.props.readOnly && <div className="small information-text">Вводить координаты нужно в ° градусах в виде десятичной дроби (современный вариант) с разделителем точка.</div>}
      </div>
    );
  }
}

class LineStringInput extends React.Component {
  render() {
    return (
      <div>
        <PointsInput {...this.props} />
        {!this.props.readOnly ? <AuiButton type="button" style={{ marginTop: 10, marginBottom: 10 }} onClick={() => this.props.onPointAdd(this.props.arrayIndex)}>Добавить точку</AuiButton> : ''}
      </div>
    );
  }
}

class MultiLineStringInput extends React.Component {
  render() {
    const style = {
      marginTop: 10,
      marginBottom: 10,
      border: '1px solid #ddd',
      borderRadius: 3,
      padding: 15,
    };
    return (
      <div style={{ marginTop: 10 }}>
        {this.props.coordinates.map((array, index) => {
          const pointsCanBeDeleted = array.length > MIN_POINTS_COUNT_BY_TYPE.LineString;
          return (
            <div key={index}>
              {!this.props.noLabel ?
                <h5>
                  Линия {index + 1}
                  {this.props.arrayCanBeDeleted && !this.props.readOnly ?
                    <AuiButton type="button" style={{ marginLeft: 230 }} onClick={() => this.props.onArrayDelete(index)}><i className="fa fa-times aui-red" /></AuiButton>
                  : ''}
                </h5>
              : ''}
              <div style={style}>
                <LineStringInput arrayIndex={index} {...this.props} coordinates={array} pointsCanBeDeleted={pointsCanBeDeleted} />
              </div>
            </div>
          )
        })}
        {!this.props.readOnly ? <AuiButton type="button" style={{ marginTop: 10, marginBottom: 10 }} onClick={this.props.onArrayAdd}>Добавить линию</AuiButton> : ''}
      </div>
    );
  }
}

// TODO в будущем это заменить на собственную реализацию, т.к. у полигона могут быть внутренние полигоны
class PolygonInput extends LineStringInput {
  constructor() { super(); }
}

class GeoJSONFeatureInput extends React.Component {

  constructor(props) {
    super(props);
  }

  @autobind
  handleChange(data) {
    this.props.onChange(new GeoJSONFeature(data));
  }

  @autobind
  onTypeChange(type) {
    this.handleChange(new GeoJSONFeature(type));
  }

  @autobind
  onLatitudeChange(e, index, lineIndex) {
    const { feature } = this.props;
    feature.setLatitudeOnCoordinate(e.target.value, index, lineIndex);
    this.handleChange(feature);
  }

  @autobind
  onLongitudeChange(e, index, lineIndex) {
    const { feature } = this.props;
    feature.setLongitudeOnCoordinate(e.target.value, index, lineIndex);
    this.handleChange(feature);
  }

  @autobind
  addPoint(lineIndex = 0) {
    const { feature } = this.props;
    feature.addEmptyPoint(lineIndex);
    this.handleChange(feature);
  }

  @autobind
  addArray() {
    const { feature } = this.props;
    feature.addEmptyArray();
    this.handleChange(feature);
  }

  @autobind
  deletePoint(index, lineIndex) {
    const { feature } = this.props;
    feature.deletePoint(index, lineIndex);
    this.handleChange(feature);
  }

  @autobind
  deleteArray(arrayIndex) {
    const { feature } = this.props;
    feature.deleteArray(arrayIndex);
    this.handleChange(feature);
  }

  getGeodataInput(type, data, error, readOnly) {
    if (!type) return null;

    let coordinates = data.getCoordinates();
    let pointsCanBeDeleted = false;
    let arrayCanBeDeleted = false;
    pointsCanBeDeleted = coordinates.length > MIN_POINTS_COUNT_BY_TYPE[type];

    switch (type) {
      case 'Polygon':
        coordinates = coordinates[0];
        pointsCanBeDeleted = coordinates.length > MIN_POINTS_COUNT_BY_TYPE[type];
        break;
      case 'MultiLineString':
        arrayCanBeDeleted = coordinates.length > 1;
        break;
      default: break;
    }

    const props = {
      data,
      error,
      readOnly,
      type,
      pointsCanBeDeleted,
      arrayCanBeDeleted,
      coordinates,
      onLatitudeChange: this.onLatitudeChange,
      onLongitudeChange: this.onLongitudeChange,
    };

    switch (type) {
      case 'Point':
        return <PointInput {...props} noLabel />;
      case 'LineString':
        return <LineStringInput onPointAdd={this.addPoint} onPointDelete={this.deletePoint} {...props} />;
      case 'Polygon':
        return <PolygonInput onPointAdd={this.addPoint} onPointDelete={this.deletePoint} {...props} />;
      case 'MultiLineString':
        return <MultiLineStringInput onArrayAdd={this.addArray} onArrayDelete={this.deleteArray} onPointAdd={this.addPoint} onPointDelete={this.deletePoint} {...props} />;
      case 'MultiPoint':
        return <LineStringInput onPointAdd={this.addPoint} onPointDelete={this.deletePoint} {...props} />;
      default:
        return null;
    }
  }

  styleChange(e) {
    const { feature } = this.props;
    feature.properties = e;
    delete feature.properties.size;
    delete feature.properties.__altered;
    this.handleChange(feature);
  }

  render() {
    const { feature, error, readOnly, properties, index } = this.props;
    let type;
    if (feature.getGeometry()) {
      type = feature.getGeometryType();
    }

    const { useStyles } = this.props.properties;
    const config = !Object.keys(feature.properties || {}).length ? Immutable.fromJS(this.props.properties.config) : Immutable.fromJS(feature.properties);
    return (
      <div style={{ marginBottom: '20px' }}>
        {index > 0 && <hr />}
        {index > 0 && !readOnly && <span className="glyphicon glyphicon-remove geojson-glyph-remove" onClick={() => this.props.onDelete(index)} />}
        <Select
          name="form-field-name"
          placeholder={'Выберите тип'}
          options={FEATURE_TYPES_OPTIONS}
          searchable={false}
          onChange={this.onTypeChange}
          disabled={readOnly}
          value={type}
          clearable={false}
        />
        <div>
          {this.getGeodataInput(type, feature, error, readOnly)}
        </div>
        <div className="error">
          {error && typeof error === 'string' ? error : ''}
        </div>
        {useStyles && type !== undefined && !readOnly ? <div style={{ width: '50%', marginTop: '15px' }}>
          <label>Стиль</label>
          <GeoJSONEditor value={config} onChange={e => this.styleChange(e.toJS())} />
        </div> : ''}
      </div>
    );
  }
}

class GeoJSONFeatureCollectionInput extends React.Component {

  static propTypes = {
    onChange: PropTypes.func,
    data: PropTypes.object,
    properties: PropTypes.object,
    error: React.PropTypes.oneOfType([
      React.PropTypes.string,
      React.PropTypes.array,
    ]),
    isSingle: PropTypes.bool,
    readOnly: PropTypes.bool,
  }

  constructor(props) {
    super(props);

    this.state = {
      mapModalIsOpen: false,
    };
  }

  @autobind
  handleFeatureChange(index, feature) {
    const collection = new GeoJSONFeatureCollection(this.props.data);
    collection.setFeature(index, feature);
    this.props.onChange(collection);
  }

  @autobind
  addFeature() {
    const collection = new GeoJSONFeatureCollection(this.props.data);
    collection.addFeature();
    this.props.onChange(collection);
  }

  @autobind
  handleFeatureDelete(index) {
    const collection = new GeoJSONFeatureCollection(this.props.data);
    collection.deleteFeature(index);
    this.props.onChange(collection);
  }

  render() {
    let { data, isSingle = false, error = [], readOnly, properties } = this.props;
    if (!Array.isArray(error)) {
      error = [];
    }

    const collection = new GeoJSONFeatureCollection(parseFeatureCollection(data));
    const baseMapConfig = getConfig().form.formRow.input.geojson.map;
    return (
      <div>
        {collection.getFeatures().map((feature, index) =>
          <GeoJSONFeatureInput
            error={error[index]}
            key={index}
            index={index}
            properties={properties}
            feature={feature}
            readOnly={readOnly}
            onChange={this.handleFeatureChange.bind(this, index)}
            onDelete={this.handleFeatureDelete.bind(this, index)}
          />
        )}
        {!readOnly ?
          <AuiButton style={{ marginTop: 10 }} onClick={this.addFeature}>Добавить элемент</AuiButton>
        : null}

        <Modal title="Просмотр геоданных" isOpen={this.state.mapModalIsOpen} onClose={() => this.setState({ mapModalIsOpen: false })}>
          <LeafletMap
            geoJson={collection}
            onGeoJSONChange={this.props.onChange}
            readOnly={readOnly}
            config={baseMapConfig}
          />
        </Modal>

        {
          readOnly && !collection.getFeatures().length
            ?
              <div className="error">Нет геоданных</div>
            :
              <AuiButton style={{ marginTop: 10 }} onClick={() => this.setState({ mapModalIsOpen: true })}>
                {readOnly ? 'Просмотреть' : 'Редактировать'} на карте
              </AuiButton>
        }
      </div>
    );
  }

}

export default class GeoJSONInput extends React.Component {

  static propTypes = {
    data: React.PropTypes.any,
    onDataChange: React.PropTypes.func.isRequired,
    config: React.PropTypes.object,
    error: React.PropTypes.oneOfType([
      React.PropTypes.string,
      React.PropTypes.array,
    ]),
    readOnly: React.PropTypes.bool,
  }

  @autobind
  handleChange(data) {
    if (this.props.onDataChange) {
      this.props.onDataChange(data);
    }
  }

  render() {
    const { error, data = new GeoJSONFeatureCollection(), config, readOnly } = this.props;

    return (
      <GeoJSONFeatureCollectionInput error={error} data={data} readOnly={readOnly} onChange={this.handleChange} properties={config} />
    );
  }
}
