
import { hexToRgba } from '@gostgroup/gp-constructor/lib/utils/colors';

export default (ops) => {
  if (!ops || (!ops.fillColor && !ops.borderColor)) return null;
  return new ol.style.Style({
    fill: ops.fillColor ? new ol.style.Fill({
      color: hexToRgba(ops.fillColor, ops.fillTransparency),
    }) : null,
    stroke: ops.borderColor ? new ol.style.Stroke({
      color: ops.borderColor,
      width: ops.borderWidth,
    }) : null,
  });
};
