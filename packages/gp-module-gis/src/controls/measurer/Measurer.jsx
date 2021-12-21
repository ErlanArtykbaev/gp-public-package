import React from 'react';
import lifecycle from 'recompose/lifecycle';

import { formatArea, formatLength } from './measureFormatters';
import * as MSG from './measureMessages';
import Helper from '../Helper';
import OpenLayerDrawing from '../OpenLayerDrawing';
import '../styles/measureTooltip.global.scss';
import styles from '../TooltipManager.scss';

let helper = null;
let tooltips = [];

function createHelpTooltip() {
  const helpTooltip = helper.createTooltipManager();
  helpTooltip.create({
    id: 'helpTooltip',
    offset: [15, 0],
    positioning: 'center-left',
  }, 'tooltip');
  return helpTooltip;
}

function createMeasureTooltip() {
  const measureTooltip = helper.createTooltipManager();
  measureTooltip.create({
    id: 'measureTooltip',
    offset: [0, -15],
    positioning: 'bottom-center',
  }, 'tooltip tooltip-measure');
  return measureTooltip;
}

/**
 * Handle pointer move.
 * @param {ol.MapBrowserEvent} evt
 */
const updateTooltips = (drawing, object) => (evt) => {
  const { helpTooltip, measureTooltip } = object;
  if (evt.dragging) {
    return;
  }

  let helpMsg = MSG.startMeasure;

  if (drawing.sketch) {
    let tooltipCoord = evt.coordinate;
    let size;
    const geom = drawing.sketch.getGeometry();
    if (geom instanceof ol.geom.Polygon) {
      size = formatArea(/** @type {ol.geom.Polygon} */ (geom), helper.map);
      helpMsg = MSG.continuePolygon;
      tooltipCoord = geom.getInteriorPoint().getCoordinates();
    } else if (geom instanceof ol.geom.LineString) {
      size = formatLength(/** @type {ol.geom.LineString} */ (geom), helper.map);
      helpMsg = MSG.continueLine;
      tooltipCoord = geom.getLastCoordinate();
    }
    measureTooltip.setText(size);
    measureTooltip.setPos(tooltipCoord);
  }

  helpTooltip.setText(helpMsg);
  helpTooltip.setPos(evt.coordinate);
};

const getDefaultOptions = () => ({
  element: document.getElementById('measurer'),
});

function Measurer(options = {}) {
  options = { ...getDefaultOptions(), ...options };
  // const onToggleContext = options.onToggleContext;

  helper = helper || new Helper(options.map);

  const btnClass = ext => `measurer-button measurer-button-${ext}`;

  const onClearAll = () => {
    // onToggleContext(true);
    tooltips.forEach(t => t.clear());
    tooltips = [];
    helper.source.clear();
  };

  const onStartDrawing = (type) => {
    // onToggleContext(false);
    const helpTooltip = createHelpTooltip();
    const measureTooltip = createMeasureTooltip();
    tooltips.push(helpTooltip);
    tooltips.push(measureTooltip);

    const drawing = new OpenLayerDrawing(helper.map, helper.source);
    const moveHandler = helper.map.on('pointermove', updateTooltips(drawing, { helpTooltip, measureTooltip }));

    const keydownEvent = (event) => {
      const keyName = event.key;
      if (keyName === 'Escape') {
        measureTooltip.clear();
        helpTooltip.clear();
        helper.map.unByKey(moveHandler);
      }
    };

    drawing.start(type, (sketch) => {
      if (sketch) {
        helper.map.unByKey(moveHandler);
        measureTooltip.fix();
        document.removeEventListener('keydown', keydownEvent);

        const tooltipDeleteElement = document.createElement('div');
        tooltipDeleteElement.innerHTML = '✖';
        tooltipDeleteElement.className = styles.cross;
        tooltipDeleteElement.onclick = () => {
          helper.source.removeFeature(sketch);
          drawing.clear();
          measureTooltip.clear();
        };

        measureTooltip.addElement(tooltipDeleteElement);
        helpTooltip.clear();
      }
    });

    document.addEventListener('keydown', keydownEvent);
  };

  return (
    <div className="measurer">
      <div className="measurer-button-wrap">
        <div
          className={btnClass('line')}
          title="Измерить расстояние"
          onClick={() => onStartDrawing('LineString')}
        />
        <div
          className={btnClass('area')}
          title="Измерить площадь"
          onClick={() => onStartDrawing('Polygon')}
        />
        <div
          className={btnClass('clear')}
          title="Убрать измерения"
          onClick={() => onClearAll()}
        />
      </div>
    </div>
  );
}

export default lifecycle({
  componentWillUnmount() {
    helper = null;
    tooltips = [];
  },
})(Measurer);
