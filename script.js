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
frame.onload = () => {
  frameImg = frame;
  draw();
};

// Upload Photo
document.getElementById("upload").addEventListener("change", (e) => {
  if (e.target.files[0]) {
    img = new Image();
    img.onload = draw;
    img.src = URL.createObjectURL(e.target.files[0]);
  }
});

// Upload Custom Frame
document.getElementById("uploadFrame").addEventListener("change", (e) => {
  if (e.target.files[0]) {
    frameImg = new Image();
    frameImg.onload = draw;
    frameImg.src = URL.createObjectURL(e.target.files[0]);
  }
});

// Name Input
document.getElementById("nameText").addEventListener("input", (e) => {
  nameText = e.target.value;
  draw();
});

// Pad Input
document.getElementById("padText").addEventListener("input", (e) => {
  padText = e.target.value;
  draw();
});

// Sliders
document.getElementById("zoom").addEventListener("input", (e) => {
  zoom = parseFloat(e.target.value);
  draw();
});

document.getElementById("rotate").addEventListener("input", (e) => {
  rotate = parseFloat(e.target.value);
  draw();
});

document.getElementById("moveX").addEventListener("input", (e) => {
  moveX = parseFloat(e.target.value);
  draw();
});

document.getElementById("moveY").addEventListener("input", (e) => {
  moveY = parseFloat(e.target.value);
  draw();
});

// Reset
document.getElementById("reset").addEventListener("click", () => {
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
});

// DRAW FUNCTION - BILKUL SAHI
function draw() {
  ctx.clearRect(0, 0, SIZE, SIZE);

  // White background
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, SIZE, SIZE);

  // Draw image - NAHI KATEGA
  if (img) {
    ctx.save();
    ctx.translate(SIZE / 2 + moveX, SIZE / 2 + moveY);
    ctx.rotate((rotate * Math.PI) / 180);

    // Image dimensions ko properly scale karna
    let w = img.width * zoom;
    let h = img.height * zoom;

    // Draw full image without clipping
    ctx.drawImage(img, -w / 2, -h / 2, w, h);

    ctx.restore();
  }

  // Draw Name - NICHE LIKHA HOGA
  if (nameText) {
    ctx.font = "bold 90px Arial";
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "center";
    ctx.lineWidth = 4;
    ctx.strokeStyle = "#000000";
    ctx.strokeText(nameText, SIZE / 2, SIZE - 140);
    ctx.fillText(nameText, SIZE / 2, SIZE - 140);
  }

  // Draw Pad - AUR NICHE
  if (padText) {
    ctx.font = "bold 60px Arial";
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "center";
    ctx.lineWidth = 3;
    ctx.strokeStyle = "#000000";
    ctx.strokeText(padText, SIZE / 2, SIZE - 50);
    ctx.fillText(padText, SIZE / 2, SIZE - 50);
  }

  // Draw frame on top
  if (frameImg) {
    ctx.drawImage(frameImg, 0, 0, SIZE, SIZE);
  }
}

// Download
document.getElementById("download").addEventListener("click", () => {
  const link = document.createElement("a");
  link.href = canvas.toDataURL("image/png");
  link.download = "photo-frame.png";
  link.click();
});
