import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import isEqual from 'lodash/isEqual';
import withHandlers from 'recompose/withHandlers';
import Button from 'react-bootstrap/lib/Button';
// import InputGroup from 'react-bootstrap/lib/InputGroup';
import FormGroup from 'react-bootstrap/lib/FormGroup';
import FormControl from 'react-bootstrap/lib/FormControl';
import ControlLabel from 'react-bootstrap/lib/ControlLabel';

import withPopup from 'bg/utils/compositions/withPopup';
import { createRoute } from 'bg/redux/modules/routes';
import { readWGSGeometry, getGeometryDistanceInfo } from 'bg/components/map/utils/openlayers/ol.js';
import fitFeatures from 'bg/components/map/utils/openlayers/fitFeatures';
import Helper from '../Helper';
import styles from './geotools.scss';
import CoordSelector, { withCoordSelection } from './CoordSelector';

const DEFAULT_SPEED = 60;

const RouteInfo = ({ geometryDistanceInfo, speed }) =>
  <div className={styles.popupContainer}>
    <div>{geometryDistanceInfo.str}</div>
    <div>{Number(geometryDistanceInfo.value / speed).toFixed()} мин</div>
  </div>;

class ManualRoutingHelper extends Helper {
  constructor(map) {
    super(map);
    this.layer.setStyle([
      new ol.style.Style({
        stroke: new ol.style.Stroke({ color: '#ff3333', width: 5 }),
      }),
    ]);
  }
  addFeaturesETA({ speed, infoPopup }) {
    /* ADD LABEL TO THE ROUTE WITH ESTIMATED TIME OF ARRIVAL */
    this.source.getFeatures().forEach((feature) => {
      if (feature.getProperties().type === 'ETA') {
        infoPopup.hide();
        this.source.removeFeature(feature);
      }
      if (feature.getProperties().type === 'route') {
        const coords = feature
          .getGeometry()
          .getCoordinates();

        const position = coords[Math.floor(coords.length / 1.8)];
        const geometryDistanceInfo = getGeometryDistanceInfo(feature.getGeometry(), this.map);

        speed = (Math.abs(speed) / 60) * 1000; // -> м/мин
        speed = Number.isNaN(speed) || !Number.isFinite(speed) || speed <= 0 ? 1000 : speed;

        infoPopup.show(position, {
          geometryDistanceInfo,
          speed,
        });
      }
    });
  }

  renderRoutes(routes) {
    const features = routes.map(r => (
      new ol.Feature({
        type: 'route',
        geometry: readWGSGeometry(r.geometry),
      })
    ));
    this.source.addFeatures(features);
    fitFeatures(this.map, features);
  }
}

@withPopup({ component: RouteInfo })
@connect(
  state => state.routes,
  { createRoute }
)
@withCoordSelection({ prefix: 'routeSource' })
@withCoordSelection({ prefix: 'routeTarget' })
@withHandlers({
  searchBoth: p => () => {
    p.routeSource.searchAddress();
    p.routeTarget.searchAddress();
  },
})
export default class RoutingWidget extends React.Component {
  static propTypes = {
    map: PropTypes.object,
    routes: PropTypes.object,
    popup: PropTypes.object,
    createRoute: PropTypes.func.isRequired,
    searchBoth: PropTypes.func.isRequired,

    routeSource: PropTypes.object,
    routeTarget: PropTypes.object,
  }

  state = { dirty: false, speed: '' }

  componentWillMount() {
    this.helper = new ManualRoutingHelper(this.props.map);
  }
  componentWillUpdate(nextProps, nextState) {
    const fromCoord = nextProps.routeSource.coord;
    const toCoord = nextProps.routeTarget.coord;
    const { speed } = nextState;
    const endpointsChanged = !isEqual(
      [fromCoord, toCoord],
      [this.props.routeSource.coord, this.props.routeTarget.coord]
    );
    const routeChanged = !isEqual(nextProps.routes.waypoints, this.props.routes.waypoints);
    const speedChanged = !isEqual(speed, this.state.speed);

    if (endpointsChanged) {
      this.helper.clear();
      if (fromCoord && toCoord && !nextState.dirty) {
        this.setState({ dirty: true });
        this.props.createRoute({ from: fromCoord, to: toCoord });
      }
    }

    if (!fromCoord || !toCoord) {
      this.helper.clear();
    }

    if (routeChanged) {
      this.setState({ dirty: false });
      this.helper.renderRoutes(nextProps.routes.routes, nextState.speed);
      this.helper.addFeaturesETA({ speed, infoPopup: this.props.popup });
    } else if (speedChanged) {
      this.helper.addFeaturesETA({ speed, infoPopup: this.props.popup });
    }
  }
  componentWillUnmount() {
    this.helper.teardown();
    this.props.popup.hide();
  }
  render() {
    const { routeSource, routeTarget, map, searchBoth } = this.props;
    return (
      <FormGroup className={styles.routingContent}>
        <FormGroup>
          <ControlLabel>Откуда (адрес)</ControlLabel>
          <CoordSelector autoFocus placeholder="Откуда (адрес)" map={map} {...routeSource} />
        </FormGroup>
        <FormGroup>
          <ControlLabel>Куда (адрес)</ControlLabel>
          <CoordSelector map={map} placeholder="Куда (адрес)" {...routeTarget} />
        </FormGroup>
        <FormGroup>
          <ControlLabel>Скорость, км/ч</ControlLabel>
          <FormControl
            className={styles.searchBar}
            min="1"
            step="1"
            type="number"
            value={this.state.speed || DEFAULT_SPEED}
            onChange={e => this.setState({ speed: e.target.value })}
          />
        </FormGroup>
        <FormGroup>
          <Button onClick={searchBoth}>
            Проложить маршрут
          </Button>
        </FormGroup>
      </FormGroup>
    );
  }
}
