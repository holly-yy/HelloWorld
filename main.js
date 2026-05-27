const canvas = document.getElementById('eyeballCanvas');
const ctx = canvas.getContext('2d');
const thicknessDisplay = document.getElementById('thicknessValue');
const decrease = document.getElementById('decrease');
const increase = document.getElementById('increase');
const objectDistance = document.getElementById('objectDistance');

// Geometry
const C_X = 400;    // Eye center X
const C_Y = 175;    // Eye center Y
const R = 150;      // Eyeball radius
const LENS_X = C_X + 70; // Lens center X
const LENS_RADIUS_X = 22;
const LENS_RADIUS_Y = 60;
const RETINA_X = C_X + R - 8;

// Variable
let lensThickness = 5; // 1 (thin) to 10 (thick)
let mode = 'far';

// Focal calculation (simplified). Stronger lens = shorter focal length.
function focalLengthForThickness(thickness) {
  // Map lensThickness 1-10 to focal 170 (thin) ... 90 (thick)
  return 180 - thickness * 10;
}

// For far/near object, get focus point based on lens
function getFocusXForLens(thickness, mode) {
  if (mode === 'far') {
    return LENS_X + focalLengthForThickness(thickness);
  } else {
    // Near object: object distance much less; use thin lens formula
    // 1/f = 1/v + 1/u  (u is negative in sign convention)
    // Let's pick u = -(C_X - R + 70), "objectDistancePx" pixels left of lens
    const objectDistancePx = 170; // as e.g. 170px to the left of cornea
    const u = -objectDistancePx;
    const f = focalLengthForThickness(thickness);

    // 1/f = 1/v + 1/u  => 1/v = 1/f - 1/u
    const oneOverV = 1/f - 1/u;
    const v = 1/oneOverV; // image distance from lens

    return LENS_X + v;
  }
}

function drawScene() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Eyeball as a circle
  ctx.strokeStyle = "#777";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(C_X, C_Y, R, 0, Math.PI * 2);
  ctx.stroke();

  // Retina (arc, back of eye)
  ctx.save();
  ctx.strokeStyle = "#d33";
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.arc(C_X, C_Y, R-5, Math.PI/2.3, Math.PI*1.7);
  ctx.stroke();
  ctx.restore();

  // Lens
  ctx.save();
  ctx.translate(LENS_X, C_Y);
  ctx.scale(lensThickness/5, 1.0);
  ctx.strokeStyle = "#17f";
  ctx.lineWidth = 7;
  ctx.beginPath();
  ctx.ellipse(0, 0, LENS_RADIUS_X, LENS_RADIUS_Y, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();

  // Ray origins:
  let rayYs = [-30, 0, 30];
  ctx.strokeStyle = "#fa0";
  ctx.lineWidth = 2;
  let focusX = getFocusXForLens(lensThickness, mode);

  if (mode === 'far') {
    // FAR object: parallel rays
    rayYs.forEach(offsetY => {
      // Incoming parallel rays
      const rayStartX = C_X - R + 5;
      const rayStartY = C_Y + offsetY;
      const lensEntranceX = LENS_X - LENS_RADIUS_X - 5;

      ctx.beginPath();
      ctx.moveTo(rayStartX, rayStartY);
      ctx.lineTo(lensEntranceX, rayStartY);
      ctx.stroke();

      // Refracted, pass through common focus
      ctx.beginPath();
      ctx.moveTo(lensEntrance*

