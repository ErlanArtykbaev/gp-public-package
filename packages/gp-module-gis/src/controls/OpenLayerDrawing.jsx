const DRAW_TYPE = new ol.style.Style({
  fill: new ol.style.Fill({
    color: 'rgba(255, 255, 255, 0.2)',
  }),
  stroke: new ol.style.Stroke({
    color: 'rgba(0, 0, 0, 0.5)',
    lineDash: [10, 10],
    width: 2,
  }),
  image: new ol.style.Circle({
    radius: 5,
    stroke: new ol.style.Stroke({
      color: 'rgba(0, 0, 0, 0.7)',
    }),
    fill: new ol.style.Fill({
      color: 'rgba(255, 255, 255, 0.2)',
    }),
  }),
});

export default class {
  constructor(map, source) {
    this.map = map;
    this.source = source;

    this.sketch = null;
    this.interaction = null;
    this.measurementType = 'Polygon';

    this.keydownEvent = this.keydownEvent.bind(this);
  }

  keydownEvent(event) {
    const keyName = event.key;
    if (keyName === 'Escape') {
      this.clear();
      // this.addInteraction();
    }
    if (keyName === 'Enter') {
      this.interaction.finishDrawing();
    }
  }

  addInteraction() {
    this.interaction = new ol.interaction.Draw({
      source: this.source,
      type: this.measurementType,
      style: DRAW_TYPE,
    });

    this.map.addInteraction(this.interaction);

    this.interaction.on('drawstart', (evt) => {
      this.sketch = evt.feature;
    }, this);

    this.interaction.on('drawend', () => {
      const sketch = this.sketch;
      this.clear();
      this.done(sketch);
    }, this);
    document.addEventListener('keydown', this.keydownEvent);
  }

  clear() {
    this.sketch = null;
    this.map.removeInteraction(this.interaction);
    document.removeEventListener('keydown', this.keydownEvent);
  }

  start(type, done) {
    this.measurementType = type;
    this.done = done;
    this.addInteraction();
  }
}
