export default function fitFeatures(map, features, zoom) {
  const extent = features.reduce(
    (ext, f) => ol.extent.extend(ext, f.getGeometry().getExtent()),
    ol.extent.createEmpty()
  );
  map.getView().fit(extent, map.getSize());
  map.getView().setZoom(zoom || map.getView().getZoom() - 1);
}
