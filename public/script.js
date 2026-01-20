const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const SIZE = 1080;
canvas.width = SIZE;
canvas.height = SIZE;

let img = null;
let frameImg = null;
let zoom = 1, rotate = 0, moveX = 0, moveY = 0;
let nameText = "", padText = "";
let textX = 0, textY = 0;

// Load default CIRCULAR frame
const frame = new Image();
frame.crossOrigin = "anonymous";
frame.src = "frame.png"; // Your original circular frame
frame.onload = draw;
frameImg = frame;

frame.onerror = function() {
  console.log("Default frame not found, creating circular frame");
  // Create a simple circular frame if frame.png is not found
  const frameCanvas = document.createElement('canvas');
  frameCanvas.width = SIZE;
  frameCanvas.height = SIZE;
  const frameCtx = frameCanvas.getContext('2d');
  
  // Create circular clipping
  frameCtx.beginPath();
  frameCtx.arc(SIZE/2, SIZE/2, SIZE/2 - 10, 0, Math.PI * 2);
  frameCtx.clip();
  
  // Draw circular border
  frameCtx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
  frameCtx.lineWidth = 30;
  frameCtx.beginPath();
  frameCtx.arc(SIZE/2, SIZE/2, SIZE/2 - 20, 0, Math.PI * 2);
  frameCtx.stroke();
  
  // Inner decorative border
  frameCtx.strokeStyle = 'rgba(0, 198, 255, 0.7)';
  frameCtx.lineWidth = 15;
  frameCtx.beginPath();
  frameCtx.arc(SIZE/2, SIZE/2, SIZE/2 - 40, 0, Math.PI * 2);
  frameCtx.stroke();
  
  frameImg = new Image();
  frameImg.src = frameCanvas.toDataURL();
  frameImg.onload = draw;
};

// 1. Upload Photo
document.getElementById("upload").onchange = function(e) {
  if (e.target.files && e.target.files[0]) {
    img = new Image();
    img.src = URL.createObjectURL(e.target.files[0]);
    img.onload = draw;
  }
};

// 2. Upload Frame
document.getElementById("uploadFrame").onchange = function(e) {
  if (e.target.files && e.target.files[0]) {
    frameImg = new Image();
    frameImg.src = URL.createObjectURL(e.target.files[0]);
    frameImg.onload = draw;
  }
};

// 3. Name Input
document.getElementById("nameText").oninput = function() {
  nameText = this.value;
  draw();
};

// 4. Pad Input
document.getElementById("padText").oninput = function() {
  padText = this.value;
  draw();
};

// 5. Text Position Controls
document.getElementById("textX").oninput = function() {
  textX = parseFloat(this.value);
  draw();
};

document.getElementById("textY").oninput = function() {
  textY = parseFloat(this.value);
  draw();
};

// 6. Photo Controls
document.getElementById("zoom").oninput = function() {
  zoom = parseFloat(this.value);
  draw();
};

document.getElementById("rotate").oninput = function() {
  rotate = parseFloat(this.value);
  draw();
};

document.getElementById("moveX").oninput = function() {
  moveX = parseFloat(this.value);
  draw();
};

document.getElementById("moveY").oninput = function() {
  moveY = parseFloat(this.value);
  draw();
};

// 7. Reset
document.getElementById("reset").onclick = function() {
  zoom = 1;
  rotate = 0;
  moveX = 0;
  moveY = 0;
  textX = 0;
  textY = 0;
  nameText = "";
  padText = "";
  
  document.getElementById("zoom").value = 1;
  document.getElementById("rotate").value = 0;
  document.getElementById("moveX").value = 0;
  document.getElementById("moveY").value = 0;
  document.getElementById("textX").value = 0;
  document.getElementById("textY").value = 0;
  document.getElementById("nameText").value = "";
  document.getElementById("padText").value = "";
  
  draw();
};

// 8. DRAW FUNCTION - FIXED: Photo won't be cut, text inside frame only
function draw() {
  // Clear entire canvas
  ctx.clearRect(0, 0, SIZE, SIZE);
  
  // Create circular clipping path for everything
  ctx.save();
  ctx.beginPath();
  ctx.arc(SIZE/2, SIZE/2, SIZE/2, 0, Math.PI * 2);
  ctx.clip();
  
  // White background inside the circle only
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, SIZE, SIZE);
  
  // Draw Photo - NO CLIPPING, PURA DIKHEGA
  if (img) {
    ctx.save();
    
    ctx.translate(SIZE/2 + moveX, SIZE/2 + moveY);
    ctx.rotate(rotate * Math.PI / 180);
    
    // Original dimensions ke saath
    let w = img.width * zoom;
    let h = img.height * zoom;
    
    // Photo draw without clipping
    ctx.drawImage(img, -w/2, -h/2, w, h);
    
    ctx.restore();
  }
  
  // NAME TEXT - INSIDE FRAME ONLY
  if (nameText) {
    ctx.save();
    ctx.font = "bold 80px Arial";
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "center";
    ctx.lineWidth = 4;
    ctx.strokeStyle = "#000000";
    
    // Apply text position adjustments
    const textPosX = SIZE/2 + textX;
    const textPosY = SIZE - 150 + textY;
    
    // Check if text is within circular bounds
    const distanceFromCenter = Math.sqrt(
      Math.pow(textPosX - SIZE/2, 2) + 
      Math.pow(textPosY - SIZE/2, 2)
    );
    
    // Only draw if text is within circle (with some margin)
    if (distanceFromCenter < SIZE/2 - 100) {
      ctx.strokeText(nameText, textPosX, textPosY);
      ctx.fillText(nameText, textPosX, textPosY);
    }
    
    ctx.restore();
  }
  
  // PAD TEXT - INSIDE FRAME ONLY
  if (padText) {
    ctx.save();
    ctx.font = "bold 55px Arial";
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "center";
    ctx.lineWidth = 3;
    ctx.strokeStyle = "#000000";
    
    // Apply text position adjustments
    const textPosX = SIZE/2 + textX;
    const textPosY = SIZE - 55 + textY;
    
    // Check if text is within circular bounds
    const distanceFromCenter = Math.sqrt(
      Math.pow(textPosX - SIZE/2, 2) + 
      Math.pow(textPosY - SIZE/2, 2)
    );
    
    // Only draw if text is within circle (with some margin)
    if (distanceFromCenter < SIZE/2 - 50) {
      ctx.strokeText(padText, textPosX, textPosY);
      ctx.fillText(padText, textPosX, textPosY);
    }
    
    ctx.restore();
  }
  
  // Restore clipping
  ctx.restore();
  
  // FRAME ON TOP - CIRCULAR
  if (frameImg) {
    ctx.save();
    // Apply circular clipping for frame too
    ctx.beginPath();
    ctx.arc(SIZE/2, SIZE/2, SIZE/2, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(frameImg, 0, 0, SIZE, SIZE);
    ctx.restore();
  }
}

// 9. Download
document.getElementById("download").onclick = function() {
  const link = document.createElement("a");
  link.href = canvas.toDataURL("image/png");
  link.download = "photo-frame.png";
  link.click();
};

// Initial draw
draw();
