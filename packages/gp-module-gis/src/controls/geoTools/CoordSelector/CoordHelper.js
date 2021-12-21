import Helper from '../../Helper';

export default class CoordHelper extends Helper {
  constructor(map, handler) {
    super(map);
    this.handler = handler;
    this.mapClickListener = e => this.handler(this.toEPSG(e.coordinate));
  }

  start() {
    this.map.once('click', this.mapClickListener);
    return this;
  }

  stop() {
    this.map.un('click', this.mapClickListener);
  }

  toEPSG(coord) {
    const sourceProj = this.map.getView().getProjection();
    return ol.proj.transform(coord, sourceProj, 'EPSG:4326').reverse();
  }

  markEPSG(coord) {
    if (!Array.isArray(coord)) return;
    const mapProj = this.map.getView().getProjection();
    this.markPoint(ol.proj.transform(coord.slice().reverse(), 'EPSG:4326', mapProj));
  }

  teardown() {
    this.stop();
    super.teardown();
  }
}
