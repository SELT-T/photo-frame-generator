const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const SIZE = 1024;
canvas.width = SIZE;
canvas.height = SIZE;

let img = null;
let frameImg = null;
let zoom = 1, rotate = 0, moveX = 0, moveY = 0;
let nameText = "", padText = "";
let textX = 0, textY = 0;

// Font Settings
let fontSize = 40;
let fontColor = "#ffffff";
let fontFamily = "'Poppins', sans-serif";
let fontStyle = "normal";
let fontWeight = "normal";
let textDecoration = "none";
let textAlign = "center";

// UI Elements
const displayName = document.getElementById("displayName");
const displayPad = document.getElementById("displayPad");
const textXSlider = document.getElementById("textX");
const textXValue = document.getElementById("textXValue");
const textYSlider = document.getElementById("textY");
const textYValue = document.getElementById("textYValue");
const zoomSlider = document.getElementById("zoom");
const zoomValue = document.getElementById("zoomValue");
const rotateSlider = document.getElementById("rotate");
const rotateValue = document.getElementById("rotateValue");
const moveXSlider = document.getElementById("moveX");
const moveXValue = document.getElementById("moveXValue");
const moveYSlider = document.getElementById("moveY");
const moveYValue = document.getElementById("moveYValue");
const fontSizeSlider = document.getElementById("fontSize");
const fontSizeValue = document.getElementById("fontSizeValue");
const fontColorPicker = document.getElementById("fontColor");
const fontColorDisplay = document.getElementById("fontColorDisplay");
const fontFamilySelect = document.getElementById("fontFamily");
const styleButtons = document.querySelectorAll(".style-btn");
const alignButtons = document.querySelectorAll(".align-btn");
const tabButtons = document.querySelectorAll(".tab-btn");
const tabPanes = document.querySelectorAll(".tab-pane");

// Load default circular frame
const frame = new Image();
frame.crossOrigin = "anonymous";
frame.src = "frame.png";
frame.onload = draw;
frameImg = frame;

frame.onerror = function() {
  console.log("Default frame not found, creating circular frame");
  createDefaultFrame();
};

function createDefaultFrame() {
  const frameCanvas = document.createElement('canvas');
  frameCanvas.width = SIZE;
  frameCanvas.height = SIZE;
  const frameCtx = frameCanvas.getContext('2d');
  
  frameCtx.beginPath();
  frameCtx.arc(SIZE/2, SIZE/2, SIZE/2 - 10, 0, Math.PI * 2);
  frameCtx.clip();
  
  frameCtx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
  frameCtx.lineWidth = 30;
  frameCtx.beginPath();
  frameCtx.arc(SIZE/2, SIZE/2, SIZE/2 - 20, 0, Math.PI * 2);
  frameCtx.stroke();
  
  frameCtx.strokeStyle = 'rgba(0, 198, 255, 0.7)';
  frameCtx.lineWidth = 15;
  frameCtx.beginPath();
  frameCtx.arc(SIZE/2, SIZE/2, SIZE/2 - 40, 0, Math.PI * 2);
  frameCtx.stroke();
  
  frameImg = new Image();
  frameImg.src = frameCanvas.toDataURL();
  frameImg.onload = draw;
}

// 1. Upload Photo
document.getElementById("upload").onchange = function(e) {
  if (e.target.files && e.target.files[0]) {
    img = new Image();
    img.src = URL.createObjectURL(e.target.files[0]);
    img.onload = function() {
      // Auto adjust zoom for mobile
      const scaleX = SIZE / img.width;
      const scaleY = SIZE / img.height;
      zoom = Math.min(scaleX, scaleY) * 0.85;
      zoomSlider.value = zoom;
      zoomValue.textContent = zoom.toFixed(2);
      
      draw();
      updateTextDisplay();
    };
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
  nameText = this.value.trim();
  updateTextDisplay();
  draw();
};

// 4. Pad Input
document.getElementById("padText").oninput = function() {
  padText = this.value.trim();
  updateTextDisplay();
  draw();
};

// 5. Text Position Controls
textXSlider.oninput = function() {
  textX = parseFloat(this.value);
  textXValue.textContent = textX;
  updateTextPosition();
  draw();
};

textYSlider.oninput = function() {
  textY = parseFloat(this.value);
  textYValue.textContent = textY;
  updateTextPosition();
  draw();
};

function updateTextPosition() {
  const xOffset = (textX / 100) * 20;
  const yOffset = (textY / 100) * 20;
  
  displayName.style.transform = `translate(${xOffset}px, ${yOffset}px)`;
  displayPad.style.transform = `translate(${xOffset}px, ${yOffset}px)`;
}

// 6. Photo Controls
zoomSlider.oninput = function() {
  zoom = parseFloat(this.value);
  zoomValue.textContent = zoom.toFixed(2);
  draw();
};

rotateSlider.oninput = function() {
  rotate = parseFloat(this.value);
  rotateValue.textContent = `${rotate}°`;
  draw();
};

moveXSlider.oninput = function() {
  moveX = parseFloat(this.value);
  moveXValue.textContent = moveX;
  draw();
};

moveYSlider.oninput = function() {
  moveY = parseFloat(this.value);
  moveYValue.textContent = moveY;
  draw();
};

// 7. Font Controls
fontSizeSlider.oninput = function() {
  fontSize = parseInt(this.value);
  fontSizeValue.textContent = fontSize;
  updateTextDisplay();
  draw();
};

fontColorPicker.oninput = function() {
  fontColor = this.value;
  updateColorDisplay();
  updateTextDisplay();
  draw();
};

function updateColorDisplay() {
  const colorNames = {
    "#ffffff": "White",
    "#000000": "Black",
    "#ff0000": "Red",
    "#00ff00": "Green",
    "#0000ff": "Blue",
    "#ffff00": "Yellow",
    "#ff00ff": "Magenta",
    "#00ffff": "Cyan"
  };
  
  fontColorDisplay.textContent = colorNames[fontColor] || "Custom";
  fontColorDisplay.style.color = fontColor;
}

fontFamilySelect.onchange = function() {
  fontFamily = this.value;
  updateTextDisplay();
  draw();
};

// Style Buttons
styleButtons.forEach(btn => {
  btn.addEventListener("click", function() {
    const style = this.getAttribute("data-style");
    
    if (style === "bold") {
      this.classList.toggle("active");
      fontWeight = this.classList.contains("active") ? "bold" : "normal";
    } else if (style === "italic") {
      this.classList.toggle("active");
      fontStyle = this.classList.contains("active") ? "italic" : "normal";
    } else if (style === "underline") {
      this.classList.toggle("active");
      textDecoration = this.classList.contains("active") ? "underline" : "none";
    }
    
    updateTextDisplay();
    draw();
  });
});

// Align Buttons
alignButtons.forEach(btn => {
  btn.addEventListener("click", function() {
    alignButtons.forEach(b => b.classList.remove("active"));
    this.classList.add("active");
    
    textAlign = this.getAttribute("data-align");
    updateTextDisplay();
    draw();
  });
});

// Tab Switching
tabButtons.forEach(btn => {
  btn.addEventListener("click", function() {
    const tabId = this.getAttribute("data-tab");
    
    // Update active tab button
    tabButtons.forEach(b => b.classList.remove("active"));
    this.classList.add("active");
    
    // Show corresponding tab pane
    tabPanes.forEach(pane => {
      pane.classList.remove("active");
      if (pane.id === `${tabId}-tab`) {
        pane.classList.add("active");
      }
    });
  });
});

// 8. Update Text Display
function updateTextDisplay() {
  displayName.textContent = nameText;
  displayPad.textContent = padText;
  
  displayName.style.fontSize = `${fontSize}px`;
  displayPad.style.fontSize = `${fontSize * 0.7}px`;
  
  displayName.style.color = fontColor;
  displayPad.style.color = fontColor;
  
  displayName.style.fontFamily = fontFamily;
  displayPad.style.fontFamily = fontFamily;
  
  displayName.style.fontWeight = fontWeight;
  displayPad.style.fontWeight = fontWeight;
  
  displayName.style.fontStyle = fontStyle;
  displayPad.style.fontStyle = fontStyle;
  
  displayName.style.textDecoration = textDecoration;
  displayPad.style.textDecoration = textDecoration;
  
  displayName.style.textAlign = textAlign;
  displayPad.style.textAlign = textAlign;
  
  updateTextPosition();
}

// 9. Reset
document.getElementById("reset").onclick = function() {
  zoom = 1;
  rotate = 0;
  moveX = 0;
  moveY = 0;
  textX = 0;
  textY = 0;
  nameText = "";
  padText = "";
  
  // Reset font settings
  fontSize = 40;
  fontColor = "#ffffff";
  fontFamily = "'Poppins', sans-serif";
  fontStyle = "normal";
  fontWeight = "normal";
  textDecoration = "none";
  textAlign = "center";
  
  // Reset UI
  zoomSlider.value = zoom;
  zoomValue.textContent = zoom.toFixed(2);
  rotateSlider.value = rotate;
  rotateValue.textContent = `${rotate}°`;
  moveXSlider.value = moveX;
  moveXValue.textContent = moveX;
  moveYSlider.value = moveY;
  moveYValue.textContent = moveY;
  textXSlider.value = textX;
  textXValue.textContent = textX;
  textYSlider.value = textY;
  textYValue.textContent = textY;
  fontSizeSlider.value = fontSize;
  fontSizeValue.textContent = fontSize;
  fontColorPicker.value = fontColor;
  fontFamilySelect.value = fontFamily;
  
  // Reset style buttons
  styleButtons.forEach(btn => btn.classList.remove("active"));
  alignButtons.forEach(btn => {
    btn.classList.remove("active");
    if (btn.getAttribute("data-align") === "center") {
      btn.classList.add("active");
    }
  });
  
  document.getElementById("nameText").value = "";
  document.getElementById("padText").value = "";
  
  updateColorDisplay();
  updateTextDisplay();
  draw();
  
  // Switch to text tab
  tabButtons.forEach(b => b.classList.remove("active"));
  tabButtons[0].classList.add("active");
  tabPanes.forEach(pane => pane.classList.remove("active"));
  document.getElementById("text-tab").classList.add("active");
};

// 10. DRAW FUNCTION
function draw() {
  ctx.clearRect(0, 0, SIZE, SIZE);
  
  // Circular clipping
  ctx.save();
  ctx.beginPath();
  ctx.arc(SIZE/2, SIZE/2, SIZE/2, 0, Math.PI * 2);
  ctx.clip();
  
  // White background
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, SIZE, SIZE);
  
  // Draw Photo
  if (img) {
    ctx.save();
    
    ctx.translate(SIZE/2 + moveX, SIZE/2 + moveY);
    ctx.rotate(rotate * Math.PI / 180);
    
    let w = img.width * zoom;
    let h = img.height * zoom;
    
    ctx.drawImage(img, -w/2, -h/2, w, h);
    
    ctx.restore();
  }
  
  // Draw Text
  if (nameText || padText) {
    ctx.save();
    
    // Build font string
    const fontStyleStr = fontStyle === "italic" ? "italic" : "normal";
    const fontWeightStr = fontWeight === "bold" ? "bold" : "normal";
    const fontSizeScaled = fontSize * 2;
    
    ctx.font = `${fontStyleStr} ${fontWeightStr} ${fontSizeScaled}px ${fontFamily}`;
    ctx.fillStyle = fontColor;
    ctx.textAlign = textAlign;
    ctx.textBaseline = "middle";
    
    // Calculate text position
    let textPosX;
    if (textAlign === "left") {
      textPosX = 100 + textX * 2;
    } else if (textAlign === "right") {
      textPosX = SIZE - 100 + textX * 2;
    } else {
      textPosX = SIZE/2 + textX * 2;
    }
    
    const textPosY = SIZE - 150 + textY * 2;
    
    // Draw name text
    if (nameText) {
      // Text shadow for readability
      ctx.shadowColor = "rgba(0, 0, 0, 0.8)";
      ctx.shadowBlur = 15;
      ctx.shadowOffsetX = 3;
      ctx.shadowOffsetY = 3;
      
      ctx.fillText(nameText, textPosX, textPosY);
      
      // Reset shadow for next text
      ctx.shadowColor = "transparent";
    }
    
    // Draw pad text
    if (padText) {
      const padFontSize = fontSizeScaled * 0.7;
      ctx.font = `${fontStyleStr} ${fontWeightStr} ${padFontSize}px ${fontFamily}`;
      
      // Text shadow for readability
      ctx.shadowColor = "rgba(0, 0, 0, 0.8)";
      ctx.shadowBlur = 10;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;
      
      const padPosY = textPosY + fontSizeScaled * 0.8;
      ctx.fillText(padText, textPosX, padPosY);
    }
    
    ctx.restore();
  }
  
  ctx.restore();
  
  // Draw Frame
  if (frameImg) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(SIZE/2, SIZE/2, SIZE/2, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(frameImg, 0, 0, SIZE, SIZE);
    ctx.restore();
  }
}

// 11. Download
document.getElementById("download").onclick = function() {
  if (!img) {
    alert("Please select a photo first!");
    return;
  }
  
  const link = document.createElement("a");
  link.href = canvas.toDataURL("image/png");
  link.download = `photo-frame-${Date.now()}.png`;
  link.click();
};

// 12. Initialize
updateColorDisplay();
updateTextDisplay();
draw();

// Mobile optimization
document.addEventListener('touchmove', function(e) {
  if (e.target.tagName === 'INPUT' && e.target.type === 'range') {
    e.preventDefault();
  }
}, { passive: false });
