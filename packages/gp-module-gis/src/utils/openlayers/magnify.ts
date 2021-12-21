

interface CacheObject {
  style: string;
  scale: number;
  scaledStyle: any;
}

const cache: CacheObject[] = [];

const scaleStyle = (style, scale) => {
  const image = style.getImage();
  const stroke = style.getStroke();
  if (!image && !stroke) return style;

  // cache lookup
  const cachedStyle = cache.find(c => c.style === style);
  if (cachedStyle) {
    return cachedStyle.scaledStyle;
  }

  // scale
  const scaledStyle: ol.style.Style = (style as any).clone();
  if (image) {
    scaledStyle.getImage().setScale(image.getScale() * scale);
  }
  if (stroke) {
    scaledStyle.getStroke().setWidth(stroke.getWidth() * 2);
  }
  cache.push({ style, scale, scaledStyle });

  return scaledStyle;
};

export function magnify(map: ol.Map, layer: ol.layer.Vector, hoveredCluster: ol.Feature, scale: number) {
  const styles = (layer.getStyleFunction() as ol.StyleFunction)(
    hoveredCluster,
    map.getView().getResolution(),
  ) as ol.style.Style[];
  const magnifiedStyle = [].concat(styles || []).map(style => scaleStyle(style, scale));
  if (!hoveredCluster.get('__styleStash')) {
    hoveredCluster.set('__styleStash', hoveredCluster.getStyle());
  }
  hoveredCluster.setStyle(magnifiedStyle);
  return hoveredCluster;
}

export function unmagnify(feature: ol.Feature) {
  feature && feature.setStyle(feature.get('__styleStash'));
  return feature;
}
