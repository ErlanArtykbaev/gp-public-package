import React, { PropTypes } from 'react';
import FormGroup from 'react-bootstrap/lib/FormGroup';
import Helper from '../Helper';
import styles from './geotools.scss';
import CoordSelector, { withCoordSelection } from './CoordSelector';

class AddressHelper extends Helper {
  toCoord(coord) {
    const mapProj = this.map.getView().getProjection();
    const mapCoord = ol.proj.transform(coord, 'EPSG:4326', mapProj);
    this.clear();
    this.markPoint(mapCoord);
    this.map.getView().setCenter(mapCoord);
    this.map.getView().setZoom(17);
  }
}

@withCoordSelection()
export default class AddressWidget extends React.Component {
  static propTypes = {
    map: PropTypes.object,
    coord: PropTypes.arrayOf(PropTypes.number),
  }

  componentWillMount() {
    this.helper = new AddressHelper(this.props.map);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.coord !== this.props.coord) {
      this.helper.toCoord(nextProps.coord.slice().reverse());
    }
  }

  componentWillUnmount() {
    this.helper.teardown();
  }

  render() {
    return (
      <FormGroup className={styles.addressContent}>
        <CoordSelector placeholder="Адрес" {...this.props} />
      </FormGroup>
    );
  }
}
