import React, { PropTypes } from 'react';

import { connect } from 'react-redux';
import connectToConfig from '@gostgroup/gp-core/lib/modules/connectToConfig';

import { getLayers, getLayer } from './redux/modules/gis';
import BaseMap from './Map';
import SidebarRight from './components/sidebarRight/SidebarRight';
import styles from './Container.scss';
import ObjectsLayerGroup from './layers/ObjectsLayerGroup';

const Map = connectToConfig(
  config => ({
    initialView: config.modules.map.map.initialView,
    tileLayerConfig: config.modules.map.map.tileLayerConfig,
  })
)(BaseMap);

class Container extends React.Component {

  componentWillMount() {
    this.init();
  }

  init() {
    const { layersPaths } = this.props;
    this.props.getLayers(layersPaths.layers.object);
  }

  render() {
    return (
      <div className={styles.container}>
        <div className={styles.mainContainer}>
          <Map>
            <ObjectsLayerGroup />
          </Map>
          <SidebarRight />
        </div>
      </div>
    );
  }

}

Container.propTypes = {
  getLayers: PropTypes.func,
  layersPaths: PropTypes.shape({}),
};

const withConfig = connectToConfig(
  config => ({
    layersPaths: config.modules.map.map.layers,
  })
)(Container);

export default connect(
  null,
  { getLayers, getLayer }
)(withConfig);
