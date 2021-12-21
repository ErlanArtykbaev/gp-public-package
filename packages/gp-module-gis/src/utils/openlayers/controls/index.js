

export const zoomControl = new ol.control.Zoom({
  duration: 400,
  className: 'ol-zoom',
  zoomInTipLabel: 'Приблизить',
  zoomOutTipLabel: 'Отдалить',
  delta: 1,
});

export const scaleLine = new ol.control.ScaleLine();
