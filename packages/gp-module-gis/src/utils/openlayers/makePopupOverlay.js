import './ol3Popup.js';

export default (container, id, options = {}) => {
  const newOverlay = document.createElement('div');
  container.appendChild(newOverlay);
  const overlayOptions = {
    element: newOverlay,
    stopEvent: false,
    autoPan: true,
    // autoPanMargin: 70,
    positioning: 'bottom-left',
    // offset: [10, -40],
    // panMapIfOutOfView: true,
    ...options,
    id,
  };
  return new ol.Overlay.Popup(overlayOptions);
};
