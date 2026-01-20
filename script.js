const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const SIZE = 1080;
canvas.width = SIZE;
canvas.height = SIZE;

let img = null;
let frameImg = null;
let zoom = 1, rotate = 0, moveX = 0, moveY = 0;
let nameText = "";

// Load default frame
const frame = new Image();
frame.src = "public/frame.png";
frame.onload = draw;
frameImg = frame;

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

// 4. Sliders
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

// 5. Reset
document.getElementById("reset").onclick = function() {
  zoom = 1;
  rotate = 0;
  moveX = 0;
  moveY = 0;
  nameText = "";
  
  document.getElementById("zoom").value = 1;
  document.getElementById("rotate").value = 0;
  document.getElementById("moveX").value = 0;
  document.getElementById("moveY").value = 0;
  document.getElementById("nameText").value = "";
  
  draw();
};

// 6. MAIN DRAW FUNCTION - Photo pura dikhega, cutting nahi hogi
function draw() {
  ctx.clearRect(0, 0, SIZE, SIZE);
  
  // White background
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, SIZE, SIZE);
  
  // Draw Photo - NO CLIPPING - PURA DIKHEGA
  if (img) {
    ctx.save();
    
    // Move to center
    ctx.translate(SIZE/2, SIZE/2);
    
    // Apply transformations
    ctx.rotate((rotate * Math.PI) / 180);
    ctx.translate(moveX, moveY);
    
    // Calculate dimensions
    let imgWidth = img.width;
    let imgHeight = img.height;
    let scaledWidth = imgWidth * zoom;
    let scaledHeight = imgHeight * zoom;
    
    // Draw image centered - pura image dikhe ga
    ctx.drawImage(img, -scaledWidth/2, -scaledHeight/2, scaledWidth, scaledHeight);
    
    ctx.restore();
  }
  
  // NAME TEXT - NICHE KE ANDAR LIKHE GA
  if (nameText) {
    ctx.save();
    ctx.font = "bold 80px Arial";
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "center";
    ctx.lineWidth = 4;
    ctx.strokeStyle = "#000000";
    
    // Bottom me likhe ga - niche side
    ctx.strokeText(nameText, SIZE/2, SIZE - 120);
    ctx.fillText(nameText, SIZE/2, SIZE - 120);
    
    ctx.restore();
  }
  
  // FRAME ON TOP
  if (frameImg) {
    ctx.drawImage(frameImg, 0, 0, SIZE, SIZE);
  }
}

// 7. Download
document.getElementById("download").onclick = function() {
  const link = document.createElement("a");
  link.href = canvas.toDataURL("image/png");
  link.download = "photo-frame.png";
  link.click();
};
