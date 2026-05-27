const canvas = document.getElementById('eyeballCanvas');
const ctx = canvas.getContext('2d');
const thicknessDisplay = document.getElementById('thicknessValue');
const decrease = document.getElementById('decrease');
const increase = document.getElementById('increase');
const objectDistance = document.getElementById('objectDistance');

let lensThickness = 5; // "thickness" controls lens curvature and thus focal length
let mode = 'far'; // or 'near'

// Helper to compute (fake, for illustration) focal length as a function of thickness
function calculateFocalLength(mode, thickness) {
  // Arbitrary constants to show effect
  if (mode === 'far') {
    return 150 - thickness * 8;
  } else {
    return 100 - thickness * 8;
  }
}

function drawScene() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw outline of eye
  ctx.strokeStyle = "#777";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.ellipse(350, 175, 300, 120, 0, 0, Math.PI*2);
  ctx.stroke();

  // Retina line (back of eyeball)
  const retinaX = 650;
  ctx.strokeStyle = "#d33";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(retinaX, 70);
  ctx.lineTo(retinaX, 280);
  ctx.stroke();

  // Draw adjustable lens
  ctx.save();
  ctx.translate(450, 175);
  ctx.scale(lensThickness/5, 1);
  ctx.strokeStyle = "#17f";
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.ellipse(0, 0, 24, 60, 0, 0, Math.PI*2);
  ctx.stroke();
  ctx.restore();

  // Draw rays
  let raysY = [-30, 0, 30];
  ctx.strokeStyle = "#fa0";
  ctx.lineWidth = 2;

  let focal = calculateFocalLength(mode, lensThickness);
  raysY.forEach(offsetY => {
    // start: left of lens
    let startX = 100, startY = 175 + offsetY;
    let lensX = 450, lensY = 175 + offsetY;

    // draw ray to the lens (straight, parallel, as object is distant or near)
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(lensX, lensY);
    ctx.stroke();

    // fake convergence point: ideal (on retina), hyperopic (behind), myopic (in front)
    let imageX = lensX + focal;
    if (imageX > retinaX) imageX = retinaX + 30;   // behind retina (hyperopia)
    if (imageX < retinaX) imageX = retinaX - 30;   // in front (myopia)

    // converge all rays to a single point; fudge for demo
    ctx.beginPath();
    ctx.moveTo(lensX, lensY);
    ctx.lineTo(imageX, 175);
    ctx.stroke();
  });

  // Guide marks
  ctx.fillStyle = "#17f";
  ctx.font = "20px sans-serif";
  ctx.fillText("Lens", 430, 170);
  ctx.fillStyle = "#d33";
  ctx.fillText("Retina", retinaX + 10, 170);
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

// Initial draw
drawScene();