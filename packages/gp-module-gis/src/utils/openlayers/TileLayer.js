const createTileUrlFunction = TILES_URL => (tileCoord) => {
  const z = tileCoord[0];
  const x = tileCoord[1];
  const y = -tileCoord[2] - 1;
  return `${TILES_URL}/${z}/${y}/${x}`;
};

export default ({ TILES_URL, MapServerConfig }) => {
  const RESOLUTIONS = [];
  for (let i = 0, till = MapServerConfig.tileInfo.lods.length; i < till; i++) {
    RESOLUTIONS.push(MapServerConfig.tileInfo.lods[i].resolution);
  }
  const TILE_SIZE = MapServerConfig.tileInfo.rows;
  const ORIGIN = MapServerConfig.tileInfo.origin;
  const FULL_EXTENT = MapServerConfig.fullExtent;
  const EXTENT = [FULL_EXTENT.xmin, FULL_EXTENT.ymin, FULL_EXTENT.xmax, FULL_EXTENT.ymax];
  const PROJECTION = new ol.proj.Projection({
    code: 'EPSG:3857',
    // extent: EXTENT,
  });

  const source = new ol.source.TileImage({
    tileUrlFunction: createTileUrlFunction(TILES_URL),
    crossOrigin: 'anonymous',
    projection: PROJECTION,
    tileGrid: new ol.tilegrid.TileGrid({
      origin: [ORIGIN.x, ORIGIN.y],
      resolutions: RESOLUTIONS,
      tileSize: TILE_SIZE,
    }),
  });

  const layer = new ol.layer.Tile({
    source,
    extent: EXTENT,
  });

  return layer;
};
