import { radiusStyleFunction } from 'bg/components/map/utils/openlayers/featureStyles';
import TooltipManager from './TooltipManager';

// контейнер для map + layer + source
export default class Helper {
  constructor(map) {
    this.map = map;
    this.source = new ol.source.Vector();
    this.layer = new ol.layer.Vector({
      source: this.source,
      style: [new ol.style.Style({
        fill: new ol.style.Fill({
          color: 'rgba(255, 255, 255, 0.2)',
        }),
        stroke: new ol.style.Stroke({
          color: '#371DDB',
          width: 2,
        }),
        image: new ol.style.Circle({
          radius: 10,
          fill: new ol.style.Fill({
            color: '#371DDB',
          }),
        }),
      })],
    });
    this.map.addLayer(this.layer);
  }

  markPoint(coord, radius) {
    const pointFeature = new ol.Feature({ geometry: new ol.geom.Point(coord) });
    this.source.addFeature(pointFeature);
    try {
      if (typeof radius !== 'undefined') {
        const affectedAreas = [{
          properties: {},
          radius,
        }];
        this.radiusSource = new ol.source.Vector();
        this.radiusLayer = new ol.layer.Vector({
          source: this.radiusSource,
          style: (f, r) => affectedAreas.map(area => radiusStyleFunction(f, r, area)),
        });
        const circleFeature = new ol.Feature({
          geometry: pointFeature.getGeometry(),
          affectedAreas,
        });
        this.radiusSource.addFeature(circleFeature);
        this.map.addLayer(this.radiusLayer);
      }
    } catch (e) {
      console.log(e);
    }
  }

  markEPSG(coord, radius) {
    if (!Array.isArray(coord)) return;
    const mapProj = this.map.getView().getProjection();
    this.markPoint(ol.proj.transform(coord.slice().reverse(), 'EPSG:4326', mapProj), radius);
  }

  clear() {
    this.source.clear();
    // ПИЗДЕЦ НАДЕЖНОСТЬ
    try {
      this.radiusSource && this.radiusSource.clear();
      this.map && this.radiusLayer && this.map.removeLayer(this.radiusLayer);
    } catch (e) {
      console.log(e);
    }
  }

  createTooltipManager() {
    return new TooltipManager(this.map);
  }

  teardown() {
    this.clear();
    this.map.removeLayer(this.layer);
  }
}
