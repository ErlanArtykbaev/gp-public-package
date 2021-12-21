import roundRect from '../roundRect';

const canvasCache = {};

export default function textCanvas(text, style = {}) {
  const instanceKey = `${text}:${JSON.stringify(style)}`;

  if (!canvasCache[instanceKey]) {
    const textSizePx = style.fontSize || 12;
    const margin = style.margin || 2;
    const bgColor = style.backgroundColor || 'white';
    const color = style.color || 'black';
    const borderRadius = style.borderRadius || 8;
    const rectWidth = style.width || 18;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    // TODO use textWidth
    const textWidth = ctx.measureText(text).width; // eslint-disable-line no-unused-vars
    const canvasWidth = 30; // textWidth + (2 * margin); // TODO use textWidth
    canvas.setAttribute('width', canvasWidth);
    canvas.setAttribute('height', canvasWidth);
    // Border
    ctx.fillStyle = style.borderColor || 'white';
    ctx.strokeStyle = style.borderColor || 'white';
    const borderWidth = rectWidth + 2;
    roundRect(ctx, 3, 4, borderWidth, borderWidth, borderRadius);
    // Main rect
    ctx.fillStyle = bgColor;
    ctx.strokeStyle = 'black';
    roundRect(ctx, 4, 5, rectWidth, rectWidth, borderRadius);
    ctx.fillStyle = color;
    ctx.font = `${textSizePx}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, (canvasWidth / 2) - margin, (canvasWidth / 2) - (margin - 1));

    canvasCache[instanceKey] = canvas;
  }

  return canvasCache[instanceKey];
}
