const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const thicknessDisplay = document.getElementById('thicknessValue');
const decreaseBtn = document.getElementById('decreaseBtn');
const increaseBtn = document.getElementById('increaseBtn');
const modeSelect = document.getElementById('modeSelect');

// Configuration
let lensThickness = 5; // 1 to 10
let mode = 'far'; // 'far' or 'near'

// Eyeball dimensions
const eyeballCenterX = 300;
const eyeballCenterY = 250;
const eyeballRadius = 120;

// Lens position (left side of eyeball, inside)
const lensX = eyeballCenterX - eyeballRadius + 40;
const lensY = eyeballCenterY;
const lensWidth = 18;
const lensHeight = 80;

// Retina position (right side of eyeball)
const retinaX = eyeballCenterX + eyeballRadius - 10;

// Focal length based on lens thickness
function calculateFocalLength(thickness, mode) {
  if (mode === 'far') {
    // For far object: focal length = 280 - thickness * 15.5
    // thickness 1 -> f=264.5 (focus far behind retina)
    // thickness 5 -> f=202.5 (focus on retina)
    // thickness 10 -> f=140.5 (focus in front of retina)
    return 280 - thickness * 15.5;
  } else {
    // For NEAR object at 150px distance:
    // Target: thickness 5 -> focus exactly ON retina (around x=410)
    // Object at lensX - 150, retina at retinaX ≈ 410
    // Image distance from lens = retinaX - lensX ≈ 410 - 160 = 250
    
    // Using thin lens: 1/f = 1/u + 1/v
    // u = 150, target v = 250
    // 1/f = 1/150 + 1/250 = (250+150)/(150*250) = 400/37500 = 0.01067
    // f ≈ 93.7
    
    // So for thickness 5: f should be ~93.7
    // Scale up for thinner: thickness 1 -> f much larger
    // Scale down for thicker: thickness 10 -> f much smaller
    // Linear: f = 93.7 + (5 - thickness) * scale_factor
    
    // For thickness 1: f = 93.7 + 4*k (should be ~200 for behind retina)
    // 93.7 + 4*k = 200 => k = 26.6
    // Check thickness 10: f = 93.7 - 5*26.6 = 93.7 - 133 = -39.3 (negative!)
    
    // Better scaling with steeper gradient:
    // thickness 1 -> f = 180 (weak)
    // thickness 5 -> f = 94 (medium, on retina)
    // thickness 10 -> f = 40 (strong)
    
    // Using piecewise or adjusted formula:
    // f = 94 + (5 - thickness) * 21.2
    // Check: thickness=1: 94 + 4*21.2 = 94 + 84.8 = 178.8 ✓
    // Check: thickness=10: 94 - 5*21.2 = 94 - 106 = -12 (still negative!)
    
    // Use exponential or different scaling:
    // Let's use: f = 40 + (11 - thickness) * 6
    // thickness 1: f = 40 + 10*6 = 100 (too weak)
    // thickness 5: f = 40 + 6*6 = 76 (too strong)
    
    // Try: f = 95 + (5 - thickness) * 18
    // thickness 1: f = 95 + 4*18 = 167 
    // thickness 5: f = 95 + 0 = 95 ✓
    // thickness 10: f = 95 - 5*18 = 95 - 90 = 5 (very strong!)
    
    return 95 + (5 - thickness) * 18;
  }
}

// Calculate where rays converge
function calculateFocusPoint(thickness, mode) {
  const f = calculateFocalLength(thickness, mode);
  
  if (mode === 'far') {
    // For far object with parallel rays: focus = lens + focal length
    return lensX + f;
  } else {
    // For near object: use thin lens equation 1/f = 1/u + 1/v
    // Object is 150px to the left of lens
    const u = 150; // real object distance
    if (Math.abs(f - u) < 0.1) return lensX + 500; // avoid division by zero
    const v = (f * u) / (u - f);
    return lensX + v;
  }
}

function drawEyeball() {
  // Draw eyeball circle
  ctx.strokeStyle = '#333';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(eyeballCenterX, eyeballCenterY, eyeballRadius, 0, Math.PI * 2);
  ctx.stroke();
  
  // Draw retina (red arc on right side)
  ctx.strokeStyle = '#d33';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(eyeballCenterX, eyeballCenterY, eyeballRadius - 3, -Math.PI/3, Math.PI/3);
  ctx.stroke();
  
  // Label
  ctx.fillStyle = '#d33';
  ctx.font = 'bold 14px Arial';
  ctx.fillText('Retina', retinaX + 10, eyeballCenterY + 5);
}

function drawLens() {
  // Draw lens as a scaled ellipse
  ctx.save();
  ctx.translate(lensX, lensY);
  ctx.scale(lensThickness / 5, 1); // thickness controls horizontal scale
  
  ctx.strokeStyle = '#17f';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.ellipse(0, 0, lensWidth, lensHeight, 0, 0, Math.PI * 2);
  ctx.stroke();
  
  ctx.restore();
  
  // Label
  ctx.fillStyle = '#17f';
  ctx.font = 'bold 14px Arial';
  ctx.fillText('Lens', lensX - 25, lensY - 90);
}

function drawFarObjectRays() {
  const focusX = calculateFocusPoint(lensThickness, 'far');
  const rayOffsets = [-40, 0, 40];
  
  ctx.strokeStyle = '#ff8800';
  ctx.lineWidth = 2;
  
  rayOffsets.forEach(offset => {
    const startY = eyeballCenterY + offset;
    const lensEntryY = startY;
    const lensEntryX = lensX - (lensWidth * lensThickness / 5) / 2 - 2;
    
    // Ray from far left to lens (parallel)
    ctx.beginPath();
    ctx.moveTo(50, startY);
    ctx.lineTo(lensEntryX, lensEntryY);
    ctx.stroke();
    
    // Ray from lens to focus point
    ctx.beginPath();
    ctx.moveTo(lensEntryX, lensEntryY);
    ctx.lineTo(focusX, eyeballCenterY);
    ctx.stroke();
  });
  
  // Draw focus point
  ctx.fillStyle = '#282';
  ctx.beginPath();
  ctx.arc(focusX, eyeballCenterY, 6, 0, Math.PI * 2);
  ctx.fill();
}

function drawNearObjectRays() {
  const focusX = calculateFocusPoint(lensThickness, 'near');
  const rayOffsets = [-40, 0, 40];
  const objectX = lensX - 150; // Object outside the eyeball
  const objectY = eyeballCenterY;
  
  ctx.strokeStyle = '#ff8800';
  ctx.lineWidth = 2;
  
  // Draw object point
  ctx.fillStyle = '#444';
  ctx.beginPath();
  ctx.arc(objectX, objectY, 8, 0, Math.PI * 2);
  ctx.fill();
  
  // Label for object
  ctx.fillStyle = '#444';
  ctx.font = '14px Arial';
  ctx.fillText('Near Object', objectX - 40, objectY - 25);
  
  // Draw rays diverging from object point
  rayOffsets.forEach(offset => {
    const rayTargetY = eyeballCenterY + offset;
    const lensEntryX = lensX - (lensWidth * lensThickness / 5) / 2 - 2;
    
    // Ray from object to lens (diverging)
    ctx.beginPath();
    ctx.moveTo(objectX, objectY);
    ctx.lineTo(lensEntryX, rayTargetY);
    ctx.stroke();
    
    // Ray from lens to focus point (converging)
    ctx.beginPath();
    ctx.moveTo(lensEntryX, rayTargetY);
    ctx.lineTo(focusX, eyeballCenterY);
    ctx.stroke();
  });
  
  // Draw focus point
  ctx.fillStyle = '#282';
  ctx.beginPath();
  ctx.arc(focusX, eyeballCenterY, 6, 0, Math.PI * 2);
  ctx.fill();
}

function drawFocusStatus() {
  const focusX = calculateFocusPoint(lensThickness, mode);
  let status = '';
  
  if (Math.abs(focusX - retinaX) < 15) {
    status = '✓ Image focused ON retina';
  } else if (focusX < retinaX) {
    status = '⚠ Image focused IN FRONT of retina (Myopia)';
  } else {
    status = '⚠ Image focused BEHIND retina (Hyperopia)';
  }
  
  ctx.fillStyle = '#282';
  ctx.font = 'bold 16px Arial';
  ctx.fillText(status, 50, 50);
}

function draw() {
  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Draw components
  drawEyeball();
  drawLens();
  
  if (mode === 'far') {
    drawFarObjectRays();
  } else {
    drawNearObjectRays();
  }
  
  drawFocusStatus();
}

// Event listeners
decreaseBtn.addEventListener('click', () => {
  if (lensThickness > 1) {
    lensThickness--;
    thicknessDisplay.textContent = lensThickness;
    draw();
  }
});

increaseBtn.addEventListener('click', () => {
  if (lensThickness < 10) {
    lensThickness++;
    thicknessDisplay.textContent = lensThickness;
    draw();
  }
});

modeSelect.addEventListener('change', (e) => {
  mode = e.target.value;
  draw();
});

// Initial draw
thicknessDisplay.textContent = lensThickness;
draw();
