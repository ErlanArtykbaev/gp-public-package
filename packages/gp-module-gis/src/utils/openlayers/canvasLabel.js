import memoize from 'lodash/memoize';
import textCanvas from './textCanvas';

export default memoize(
  (text) => {
    // Cluster size label
    const label = textCanvas(text, { fontSize: 12, margin: 2, backgroundColor: '#2cddc8' });
    return new ol.style.Style({
      image: new ol.style.Icon({
        img: label,
        imgSize: [label.width, label.height],
        anchorXUnits: 'pixels',
        anchorYUnits: 'pixels',
        // TODO: adjust for base icon size
        anchor: [-10 + (label.width / 2), -10 + (label.height / 2)],
      }),
      zIndex: 9999,
    });
  }
);
