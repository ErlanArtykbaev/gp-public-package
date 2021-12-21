import React, { PropTypes } from 'react';
import Form from '@gostgroup/gp-forms/Form';
import { cluster, makePopupOverlay } from '../utils/openlayers';
import styles from './popup.scss';

const popupStyle = {
  background: 'white',
  border: '1px solid grey',
  borderRadius: '3px',
};

const TabWrapperLayout = ({ schema, mainProperties, complexProperties, FormLayout, renderProperty }) => (
  <FormLayout>
    {mainProperties.map(prop => renderProperty(prop))}
  </FormLayout>
);

class Popup extends React.Component {

  static propTypes = {
    store: PropTypes.shape({}),
    properties: PropTypes.shape({}),
    url: PropTypes.shape({}),
  }

  static childContextTypes = {
    store: PropTypes.shape({}),
  }

  getChildContext() {
    return {
      store: this.props.store,
    };
  }

  render() {
    const { properties, url } = this.props;
    return (
      <div style={{ ...popupStyle }} className={styles.popup}>
        <Form
          config={properties.nsiFormProperties.schema}
          data={properties.nsiFormProperties.data}
          WrapperLayout={TabWrapperLayout}
          readOnly
        />
        <a className={styles.href} href={`/#/records/${url}`}>Открыть в НСИ</a>
      </div>
    );
  }
}

export default MapComponent => class MapWithHoverPopup extends React.Component {

  static contextTypes = {
    store: PropTypes.shape({}),
  }

  onFeatureHoverEnter = (hoveredCluster, layerFeatureIsIn, evt, mapComponentContext) => {
    if (cluster.isCluster(hoveredCluster)) {
      if (cluster.isSingularCluster(hoveredCluster)) {
        const feature = cluster.getClickableFeature(hoveredCluster);
        this.createAndShowPopup(feature, mapComponentContext.map, evt);
      } else {
        console.log('cluster');
      }
    } else {
      this.createAndShowPopup(hoveredCluster, mapComponentContext.map, evt);
    }
  }

  createAndShowPopup(feature, map, evt) {
    this.popup = makePopupOverlay(map.getTarget(), '123', { store: this.context.store });
    map.addOverlay(this.popup);
    this.popup.show(evt.coordinate, Popup, feature.getProperties());
  }

  onFeatureHoverExit = (feature, evt, mapComponentContext) => {
    const map = mapComponentContext.map;
    map.removeOverlay(this.popup);
    delete this.popup;
  }

  render() {
    return (
      <MapComponent
        {...this.props}
        // onFeatureClick={this.onFeatureClick}
        onFeatureHoverExit={this.onFeatureHoverExit}
        onFeatureHoverEnter={this.onFeatureHoverEnter}
      />
    );
  }
};
