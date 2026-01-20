const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const SIZE = 1080;
canvas.width = SIZE;
canvas.height = SIZE;

let img = null;
let frameImg = null;
let zoom = 1, rotate = 0, moveX = 0, moveY = 0;
let nameText = "", padText = "";

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

// 4. Additional Text Input
document.getElementById("padText").oninput = function() {
  padText = this.value;
  draw();
};

// 5. Sliders
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

// 6. Reset
document.getElementById("reset").onclick = function() {
  zoom = 1;
  rotate = 0;
  moveX = 0;
  moveY = 0;
  nameText = "";
  padText = "";
  
  document.getElementById("zoom").value = 1;
  document.getElementById("rotate").value = 0;
  document.getElementById("moveX").value = 0;
  document.getElementById("moveY").value = 0;
  document.getElementById("nameText").value = "";
  document.getElementById("padText").value = "";
  
  draw();
};

// 7. DRAW FUNCTION - Photo pura dikhega, cutting nahi hogi
function draw() {
  ctx.clearRect(0, 0, SIZE, SIZE);
  
  // White background
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, SIZE, SIZE);
  
  // Draw Photo WITHOUT CLIPPING - PURA DIKHEGA
  if (img) {
    ctx.save();
    
    ctx.translate(SIZE/2 + moveX, SIZE/2 + moveY);
    ctx.rotate(rotate * Math.PI / 180);
    
    // Original dimensions ke saath
    let w = img.width * zoom;
    let h = img.height * zoom;
    
    // Photo draw without clipping - image pura aayega
    ctx.drawImage(img, -w/2, -h/2, w, h);
    
    ctx.restore();
  }
  
  // NAME TEXT - NICHE FRAME KE ANDAR
  if (nameText) {
    ctx.save();
    ctx.font = "bold 80px Arial";
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "center";
    ctx.lineWidth = 4;
    ctx.strokeStyle = "#000000";
    
    // Bottom ke andar likhe ga
    ctx.strokeText(nameText, SIZE/2, SIZE - 150);
    ctx.fillText(nameText, SIZE/2, SIZE - 150);
    
    ctx.restore();
  }
  
  // ADDITIONAL TEXT
  if (padText) {
    ctx.save();
    ctx.font = "bold 55px Arial";
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "center";
    ctx.lineWidth = 3;
    ctx.strokeStyle = "#000000";
    
    ctx.strokeText(padText, SIZE/2, SIZE - 55);
    ctx.fillText(padText, SIZE/2, SIZE - 55);
    
    ctx.restore();
  }
  
  // FRAME ON TOP
  if (frameImg) {
    ctx.drawImage(frameImg, 0, 0, SIZE, SIZE);
  }
}

// 8. Download
document.getElementById("download").onclick = function() {
  const link = document.createElement("a");
  link.href = canvas.toDataURL("image/png");
  link.download = "photo-frame.png";
  link.click();
};
