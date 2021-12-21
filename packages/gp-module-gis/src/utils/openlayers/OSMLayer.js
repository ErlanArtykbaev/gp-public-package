

const TILES_URL = 'https://a.tile.openstreetmap.org';

const OSMSource = new ol.source.TileImage({
  url: `${TILES_URL}/{z}/{x}/{y}.png`,
  crossOrigin: 'anonymous',
  projection: ol.proj.get('EPSG:3857'),
});

export default new ol.layer.Tile({
  source: OSMSource,
});
