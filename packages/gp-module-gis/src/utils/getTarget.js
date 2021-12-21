import { featureIsPoint, featureIsLine } from './openlayers/featureUtils';

const betterTarget = (feature, hoveredCluster) => (
  // приоритеты: иконки > линии > (полигоны по возрастанию площади)
  // логика: фича с большим приоритетом не может полностью загородить фичу с меньшим
  // например, линия не может закрыть полигон
  !hoveredCluster ||
    (featureIsPoint(feature) && !featureIsPoint(hoveredCluster)) ||
    (featureIsLine(feature) && !featureIsLine(hoveredCluster) && !featureIsPoint(hoveredCluster)) ||
    feature.get('area') < hoveredCluster.get('area')
);

const getTarget = (map, pixel, mapper = f => f) => {
  const hoveredFeatures = [];
  map.forEachFeatureAtPixel(pixel, (feature, layer) => {
    hoveredFeatures.push({ feature: mapper(feature), layer });
  });
  let best = {};
  hoveredFeatures.forEach((cand) => {
    if (cand.feature && betterTarget(cand.feature, best.feature)) {
      best = cand;
    }
  });
  return best;
};

export default getTarget;
