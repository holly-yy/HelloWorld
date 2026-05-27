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

// Focal length mapping to thickness (simplified for illustration)
function focalLengthForThickness(thickness) {
  // Lower thickness → longer focal length (weaker lens),
  // higher thickness → shorter focal length (stronger lens)
  return 180 - thickness * 10;
}

// For "far": rays parallel, focus is at LENS_X + focal length
// For "near": use 1/f = 1/v + 1/u ==> v = 1/(1/f - 1/u),
//   with object at fixed distance (u, negative per sign convention)
function getFocusXForLens(thickness, mode) {
  if (mode === 'far') {
    return LENS_X + focalLengthForThickness(thickness);
  } else {
    // object set at 130px left of lens
    const objectDistancePx = 130;
    const u = -objectDistancePx; // negative for real object
    const f = focalLengthForThickness(thickness);
    const oneOverV = 1/f - 1/u;
    const v = 1/oneOverV;
    return LENS_X + v;
  }
}

function drawScene() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Eye outline -- circle
  ctx.strokeStyle = "#777";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(C_X, C_Y, R, 0, Math.PI * 2);
  ctx.stroke();

  // Retina
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

  // Calculate focus
  const focusX = getFocusXForLens(lensThickness, mode);

  // Draw rays
  ctx.strokeStyle = "#fa0";
  ctx.lineWidth = 2;
  const rayOffsets = [-30, 0, 30];

  if (mode === 'far') {
    // Draw parallel rays (horizontal left-to-right)
    rayOffsets.forEach(offsetY => {
      const enterX = LENS_X - LENS_RADIUS_X - 5;
      const rayStartX = C_X - R + 5;
      const y = C_Y + offsetY;
      // First segment: left to lens
      ctx.beginPath();
      ctx.moveTo(rayStartX, y);
      ctx.lineTo(enterX, y);
      ctx.stroke();
      // Second segment: lens to focus
      ctx.beginPath();
      ctx.moveTo(enterX, y);
      ctx.lineTo(focusX, C_Y);
      ctx.stroke();
    });
  } else {
    // "Near" case: diverging rays from object point
    const objX = LENS_X - 130;
    const objY = C_Y; // object on visual axis
    // For each ray, pick three object points slightly above/below or three angles
    const raysFrom = [
      {fromX: objX, fromY: objY - 30, toY: C_Y - 30},
      {fromX: objX, fromY: objY,     toY: C_Y},
      {fromX: objX, fromY: objY + 30, toY: C_Y + 30}
    ];
    const enterX = LENS_X - LENS_RADIUS_X - 5;
    raysFrom.forEach(ray => {
      // Incoming: object point to lens entrance
      ctx.beginPath();
      ctx.moveTo(ray.fromX, ray.fromY);
      ctx.lineTo(enterX, ray.toY);
      ctx.stroke();
      // Outgoing: lens entrance to focus
      ctx.beginPath();
      ctx.moveTo(enterX, ray.toY);
      ctx.lineTo(focusX, C_Y);
      ctx.stroke();
    });
    // Draw near object as dot
    ctx.save();
    ctx.fillStyle = "#444";
    ctx.beginPath();
    ctx.arc(objX, objY, 7, 0, Math.PI*2);
    ctx.fill();
    ctx.font = "16px sans-serif";
    ctx.fillText("Near object", objX - 55, objY - 15);
    ctx.restore();
  }

  // Highlight focus point
  ctx.fillStyle = "#282";
  ctx.beginPath();
  ctx.arc(focusX, C_Y, 5, 0, Math.PI * 2);
  ctx.fill();

  // Labels
  ctx.fillStyle = "#17f";
  ctx.font = "20px sans-serif";
  ctx.fillText("Lens", LENS_X-30, C_Y-70);
  ctx.fillStyle = "#d33";
  ctx.fillText("Retina", RETINA_X + 14, C_Y-15);

  // Status text
  ctx.fillStyle = "#282";
  ctx.font = "16px sans-serif";
  let place;
  if (Math.abs(focusX-RETINA_X)<12) place = "ON retina";
  else if (focusX < RETINA_X) place = "IN FRONT of retina";
  else place = "BEHIND retina";
  ctx.fillText(`Image ${place}`, C_X+45, C_Y+R-20);
}

// Controls
decrease.onclick = () => {
  if (lensThickness > 1) {
    lensThickness--;
    thicknessDisplay.innerText = lensThickness;
    drawScene();
  }
};
increase.onclick = () => {
  if (lensThickness < 10) {
    lensThickness++;
    thicknessDisplay.innerText = lensThickness;
    drawScene();
  }
};
objectDistance.onchange = (e) => {
  mode = e.target.value;
  drawScene();
};

// Initial
thicknessDisplay.innerText = lensThickness;
drawScene();
