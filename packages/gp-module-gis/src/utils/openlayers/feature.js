export const isPolygon = olFeature => olFeature.getGeometry().getType() === 'Polygon';
