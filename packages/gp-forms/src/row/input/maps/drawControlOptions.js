import { getMarkerIcon } from './markerIcon.js';

export default function drawControlOptions(featureGroup) {
  const options = {
    position: 'topright',
    draw: {
      marker: {
        icon: getMarkerIcon(),
      },
      polyline: {
        shapeOptions: {
          color: '#f357a1',
          weight: 10,
        },
      },
      polygon: {
        allowIntersection: false, // Restricts shapes to simple polygons
        drawError: {
          color: '#e1e100', // Color the shape will turn when intersects
          message: '<strong>Oh snap!<strong> you can\'t draw that!', // Message that will show when intersect
        },
        shapeOptions: {
          color: '#bada55',
        },
      },
      circle: false,
      // rectangle: {
      //   shapeOptions: {
      //     clickable: false,
      //   },
      // },
    },
    edit: {
      featureGroup, // REQUIRED!!
    },
  };

  return options;
}
