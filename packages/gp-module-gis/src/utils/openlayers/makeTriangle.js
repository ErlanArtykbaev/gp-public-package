import degToRad from './degToRad';

export default function makeTriangle(angle = 90) {
  const canvas = document.createElement('canvas');
  canvas.width = 80;
  canvas.height = 80;
  const ctx = canvas.getContext('2d');
  ctx.strokeStyle = 'rgb(40, 97, 220)';
  ctx.fillStyle = 'rgba(40, 97, 220, 0.52)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(40, 40);
  ctx.arc(40, 40, 40, degToRad(270 - (angle / 2)), degToRad(270 + (angle / 2)));
  ctx.lineTo(40, 40);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(40, 40);
  ctx.lineTo(40, 0);
  ctx.closePath();
  ctx.stroke();
  return canvas;
}
