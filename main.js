const canvas = document.getElementById('eyeballCanvas');
const ctx = canvas.getContext('2d');
const thicknessDisplay = document.getElementById('thicknessValue');
const decrease = document.getElementById('decrease');
const increase = document.getElementById('increase');
const objectDistance = document.getElementById('objectDistance');

// Geometry constants
const C_X = 400;            // Center of eyeball
const C_Y = 175;
const R = 140;              // Eyeball radius
const LENS_X = C_X - R + 36; // Lens is now near left edge, but just inside the outline
const LENS_RADIUS_X = 20;
const LENS_RADIUS_Y = 60;
const RETINA_X = C_X + R - 8; // Retina arc (right side)

let lensThickness = 5; // 1 (thin) to 10 (thick)
let mode = 'far';

// Focal calculation
function focalLengthForThickness(thickness) {
  // Stronger lens (thicker)=shorter f, weaker=longer f
  return 160 - thickness * 9;
}

function getFocusXForLens(thickness, mode) {
  if (mode === 'far') {
    return LENS_X + focalLengthForThickness(thickness);
  } else {
    // For near, use thin lens formula with object outside the eye
    const objectDistancePx = 90 + 50; // object is 90px left of lens, plus buffer
    const u = -objectDistancePx;
    const f = focalLengthForThickness(thickness);
    const oneOverV = 1/f - 1/u;
    const v = 1/oneOverV;
    return LENS_X + v;
  }
}

function drawScene() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // 1. Eyeball (circle)
  ctx.save();
  ctx.strokeStyle = "#555";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(C_X, C_Y, R, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();

  // 2. Retina (back arc)
  ctx.save();
  ctx.strokeStyle = "#d33";
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.arc(C_X, C_Y, R-4, Math.PI/2.3, Math.PI*1.7);
  ctx.stroke();
  ctx.restore();

  // 3. Lens, now near left edge
  ctx.save();
  ctx.translate(LENS_X, C_Y);
  ctx.scale(lensThickness/5, 1.0);
  ctx.strokeStyle = "#17f";
  ctx.lineWidth = 7;
  ctx.beginPath();
  ctx.ellipse(0, 0, LENS_RADIUS_X, LENS_RADIUS_Y, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();

  // 4. Rays
  ctx.save();
  ctx.strokeStyle = "#fa0";
  ctx.lineWidth = 2;
  const rayOffsets = [-30, 0, 30];
  const focusX = getFocusXForLens(lensThickness, mode);

  if (mode === 'far') {
    // Parallel rays from the far left, through lens, converge
    rayOffsets.forEach(dy => {
      const rayStartX = C_X - R - 40;
      const y = C_Y + dy;
      const enterX = LENS_X - LENS_RADIUS_X - 6;
      // Ray to lens
      ctx.beginPath();
      ctx.moveTo(rayStartX, y);
      ctx.lineTo(enterX, y);
      ctx.stroke();
      // Through lens to focus
      ctx.beginPath();
      ctx.moveTo(enterX, y);
      ctx.lineTo(focusX, C_Y);
      ctx.stroke();
    });
  } else {
    // NEAR OBJECT: Diverge from object point outside eye on the left
    const objX = LENS_X - 90;
    const objY = C_Y;
    const enterX = LENS_X - LENS_RADIUS_X - 6;
    rayOffsets.forEach(dy => {
      // Incoming: object point to lens entrance ("diverging" rays)
      ctx.beginPath();
      ctx.moveTo(objX, objY);
      ctx.lineTo(enterX, C_Y + dy);
      ctx.stroke();
      // Through lens to focus
      ctx.beginPath();
      ctx.moveTo(enterX, C_Y + dy);
      ctx.lineTo(focusX, C_Y);
      ctx.stroke();
    });
    // Draw near object as dot, outside the eyeball
    ctx.save();
    ctx.fillStyle = "#444";
    ctx.beginPath();
    ctx.arc(objX, objY, 8, 0, Math.PI*2);
    ctx.fill();
    ctx.font = "16px sans-serif";
    ctx.fillText("Near object", objX - 55, objY - 18);
    ctx.restore();
  }
  ctx.restore();

  // 5. Highlight focus point
  ctx.save();
  ctx.fillStyle = "#282";
  ctx.beginPath();
  ctx.arc(focusX, C_Y, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // 6. Labels
  ctx.save();
  ctx.fillStyle = "#17f";
  ctx.font = "20px sans-serif";
  ctx.fillText("Lens", LENS_X-24, C_Y-72);
  ctx.fillStyle = "#d33";
  ctx.font = "18px sans-serif";
  ctx.fillText("Retina", RETINA_X + 10, C_Y-15);
  ctx.restore();

  // 7. Focus status text
  ctx.save();
  ctx.fillStyle = "#282";
  ctx.font = "16px sans-serif";
  let place;
  if (Math.abs(focusX - RETINA_X) < 12) place = "ON retina";
  else if (focusX < RETINA_X) place = "IN FRONT of retina";
  else place = "BEHIND retina";
  ctx.fillText(`Image ${place}`, C_X+38, C_Y+R-26);
  ctx.restore();
}

// Controls: no change
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

// Init
thicknessDisplay.innerText = lensThickness;
drawScene();
