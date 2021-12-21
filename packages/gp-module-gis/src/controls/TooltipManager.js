import without from 'lodash/without';

export default class TooltipManager {
  constructor(map) {
    this.map = map;
    // активные И зафиксированные тултипы
    this.tooltips = [];
  }

  create(options = {}, className = '') {
    if (this.tooltipElement) {
      this.tooltipElement.parentNode.removeChild(this.tooltipElement);
    }
    this.tooltipElement = document.createElement('div');
    this.tooltipElement.className = className;

    this.tooltip = new ol.Overlay({
      ...options,
      element: this.tooltipElement,
    });
    this.map.addOverlay(this.tooltip);
    this.tooltips.push(this.tooltip);
  }

  setText(text = '') {
    this.tooltipElement.innerHTML = text;
  }

  setPos(coord) {
    this.tooltip.setPosition(coord);
  }

  fix() {
    this.tooltipElement.className = 'tooltip tooltip-static';
    // unset tooltip so that a new one can be created
    // this.tooltipElement = null;
    this.tooltip.setOffset([0, -7]);
  }

  remove(removeChild) {
    if (removeChild) {
      this.map.removeOverlay(this.tooltip);
      this.tooltips = without(this.tooltips, this.tooltip);
      this.tooltip = null;
    }
    if (this.tooltipElement) {
      this.tooltipElement.remove();
      this.tooltipElement = null;
    }
  }

  clear(rc) {
    this.remove(rc);
    this.tooltips.forEach(tooltip => this.map.removeOverlay(tooltip));
    const tooltipsLength = this.tooltips.length;
    if (tooltipsLength > 0) {
      this.map.removeOverlay(this.tooltips[tooltipsLength - 1]);
    }
  }

  addElement(child) {
    this.tooltipElement.appendChild(child);
  }
}
