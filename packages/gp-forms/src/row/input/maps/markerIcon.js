import retinaMarkerIcon from './images/leaflet/marker-icon-2x.png';
import markerIcon from './images/leaflet/marker-icon.png';
import shadowIcon from './images/leaflet/marker-shadow.png';

let IconCache = null;

export default function setMarkerIcon(L) {
  IconCache = L.Icon.extend({
    options: {
      shadowUrl: shadowIcon,
      iconAnchor: new L.Point(12, 40),
      iconSize: new L.Point(24, 40),
      iconUrl: window.devicePixelRatio > 1 ? retinaMarkerIcon : markerIcon,
    },
  });

  L.Marker.mergeOptions({
    icon: new IconCache(),
  });
}

export function getMarkerIcon() {
  return new IconCache();
}
