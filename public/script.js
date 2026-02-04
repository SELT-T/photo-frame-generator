const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const SIZE = 1024;
canvas.width = SIZE;
canvas.height = SIZE;

// Variables with touch support
let img = null;
let frameImg = null;
let zoom = 1, rotate = 0, moveX = 0, moveY = 0;
let nameText = "", padText = "";
let textX = 0, textY = 0;

// Font Settings
let fontSize = 40;
let fontColor = "#ffffff";
let borderColor = "#000000";
let borderSize = 3;
let fontFamily = "'Poppins', sans-serif";
let fontStyle = "normal";
let fontWeight = "normal";

// Touch gesture variables
let isDraggingPhoto = false;
let isDraggingText = false;
let touchStartX = 0;
let touchStartY = 0;
let initialMoveX = 0;
let initialMoveY = 0;
let initialTextX = 0;
let initialTextY = 0;
let initialZoom = 1;
let initialDistance = 0;
let initialRotate = 0;
let isPinching = false;
let isRotating = false;

// UI Elements
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
const fontColorPreview = document.getElementById("fontColorPreview");
const borderColorPicker = document.getElementById("borderColor");
const borderColorPreview = document.getElementById("borderColorPreview");
const borderSizeSlider = document.getElementById("borderSize");
const borderSizeValue = document.getElementById("borderSizeValue");
const fontFamilySelect = document.getElementById("fontFamily");
const styleButtons = document.querySelectorAll(".style-btn");
const modeButtons = document.querySelectorAll(".mode-btn");
const tabContents = document.querySelectorAll(".tab-content");

// Create default circular frame
function createDefaultFrame() {
  const frameCanvas = document.createElement('canvas');
  frameCanvas.width = SIZE;
  frameCanvas.height = SIZE;
  const frameCtx = frameCanvas.getContext('2d');
  
  frameCtx.beginPath();
  frameCtx.arc(SIZE/2, SIZE/2, SIZE/2 - 10, 0, Math.PI * 2);
  frameCtx.clip();
  
  const gradient = frameCtx.createLinearGradient(0, 0, SIZE, SIZE);
  gradient.addColorStop(0, 'rgba(102, 166, 255, 0.8)');
  gradient.addColorStop(0.5, 'rgba(137, 247, 254, 0.8)');
  gradient.addColorStop(1, 'rgba(102, 166, 255, 0.8)');
  
  frameCtx.strokeStyle = gradient;
  frameCtx.lineWidth = 30;
  frameCtx.beginPath();
  frameCtx.arc(SIZE/2, SIZE/2, SIZE/2 - 25, 0, Math.PI * 2);
  frameCtx.stroke();
  
  frameCtx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
  frameCtx.lineWidth = 15;
  frameCtx.beginPath();
  frameCtx.arc(SIZE/2, SIZE/2, SIZE/2 - 45, 0, Math.PI * 2);
  frameCtx.stroke();
  
  frameImg = new Image();
  frameImg.src = frameCanvas.toDataURL();
  frameImg.onload = () => draw();
}

// Load default frame
frameImg = new Image();
frameImg.crossOrigin = "anonymous";
frameImg.src = "frame.png";
frameImg.onload = () => draw();
frameImg.onerror = createDefaultFrame;

// Check if touch is on text
function isTouchOnText(touchX, touchY) {
  if (!nameText && !padText) return false;
  
  const rect = canvas.getBoundingClientRect();
  const scaleX = SIZE / rect.width;
  const scaleY = SIZE / rect.height;
  
  const canvasX = (touchX - rect.left) * scaleX;
  const canvasY = (touchY - rect.top) * scaleY;
  
  // Check name text
  if (nameText) {
    ctx.save();
    ctx.font = `${fontStyle} ${fontWeight} ${fontSize * 2}px ${fontFamily}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    
    const nameWidth = ctx.measureText(nameText).width;
    const nameHeight = fontSize * 2;
    const namePosX = SIZE/2 + (textX * 2);
    const namePosY = SIZE - 200 + (textY * 2);
    
    if (canvasX >= namePosX - nameWidth/2 && canvasX <= namePosX + nameWidth/2 &&
        canvasY >= namePosY - nameHeight/2 && canvasY <= namePosY + nameHeight/2) {
      ctx.restore();
      return true;
    }
    ctx.restore();
  }
  
  // Check pad text
  if (padText) {
    ctx.save();
    const padFontSize = fontSize * 2 * 0.7;
    ctx.font = `${fontStyle} ${fontWeight} ${padFontSize}px ${fontFamily}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    
    const padWidth = ctx.measureText(padText).width;
    const padHeight = padFontSize;
    const padPosX = SIZE/2 + (textX * 2);
    const padPosY = (SIZE - 200 + (textY * 2)) + fontSize * 2 * 0.9;
    
    if (canvasX >= padPosX - padWidth/2 && canvasX <= padPosX + padWidth/2 &&
        canvasY >= padPosY - padHeight/2 && canvasY <= padPosY + padHeight/2) {
      ctx.restore();
      return true;
    }
    ctx.restore();
  }
  
  return false;
}

// Touch event handlers
canvas.addEventListener('touchstart', function(e) {
  e.preventDefault();
  if (e.touches.length === 1) {
    const touch = e.touches[0];
    touchStartX = touch.clientX;
    touchStartY = touch.clientY;
    
    if (isTouchOnText(touch.clientX, touch.clientY)) {
      isDraggingText = true;
      initialTextX = textX;
      initialTextY = textY;
    } else if (img) {
      isDraggingPhoto = true;
      initialMoveX = moveX;
      initialMoveY = moveY;
    }
  } else if (e.touches.length === 2) {
    isPinching = true;
    initialZoom = zoom;
    initialDistance = getTouchDistance(e.touches);
    
    // Calculate initial rotation
    const touch1 = e.touches[0];
    const touch2 = e.touches[1];
    const angle = Math.atan2(touch2.clientY - touch1.clientY, touch2.clientX - touch1.clientX);
    initialRotate = angle * (180 / Math.PI);
  }
});

canvas.addEventListener('touchmove', function(e) {
  e.preventDefault();
  
  if (e.touches.length === 1 && (isDraggingPhoto || isDraggingText)) {
    const touch = e.touches[0];
    const deltaX = touch.clientX - touchStartX;
    const deltaY = touch.clientY - touchStartY;
    
    if (isDraggingPhoto) {
      moveX = initialMoveX + deltaX * 0.5;
      moveY = initialMoveY + deltaY * 0.5;
      
      moveXSlider.value = moveX;
      moveYSlider.value = moveY;
      moveXValue.textContent = Math.round(moveX);
      moveYValue.textContent = Math.round(moveY);
    } else if (isDraggingText) {
      textX = initialTextX + deltaX * 0.2;
      textY = initialTextY + deltaY * 0.2;
      
      textXSlider.value = textX;
      textYSlider.value = textY;
      textXValue.textContent = Math.round(textX);
      textYValue.textContent = Math.round(textY);
    }
    
    draw();
  } else if (e.touches.length === 2 && isPinching) {
    const currentDistance = getTouchDistance(e.touches);
    const zoomDelta = (currentDistance - initialDistance) * 0.01;
    zoom = Math.max(0.5, Math.min(3, initialZoom + zoomDelta));
    
    zoomSlider.value = zoom;
    zoomValue.textContent = zoom.toFixed(2);
    
    // Rotation
    const touch1 = e.touches[0];
    const touch2 = e.touches[1];
    const currentAngle = Math.atan2(touch2.clientY - touch1.clientY, touch2.clientX - touch1.clientX) * (180 / Math.PI);
    const rotateDelta = currentAngle - initialRotate;
    rotate = (rotate + rotateDelta) % 360;
    
    rotateSlider.value = rotate;
    rotateValue.textContent = Math.round(rotate) + '°';
    initialRotate = currentAngle;
    
    draw();
  }
});

canvas.addEventListener('touchend', function(e) {
  isDraggingPhoto = false;
  isDraggingText = false;
  isPinching = false;
});

function getTouchDistance(touches) {
  const dx = touches[0].clientX - touches[1].clientX;
  const dy = touches[0].clientY - touches[1].clientY;
  return Math.sqrt(dx * dx + dy * dy);
}

// Update value displays
function updateValueDisplay(element, value, format = (v) => v) {
  element.textContent = format(value);
}

// 1. Upload Photo
document.getElementById("upload").onchange = function(e) {
  if (e.target.files && e.target.files[0]) {
    const file = e.target.files[0];
    if (!file.type.match('image.*')) {
      alert("Please select an image file!");
      return;
    }
    
    img = new Image();
    img.src = URL.createObjectURL(file);
    img.onload = function() {
      const scaleX = SIZE / img.width;
      const scaleY = SIZE / img.height;
      zoom = Math.min(scaleX, scaleY) * 0.9;
      
      zoomSlider.value = zoom;
      zoomValue.textContent = zoom.toFixed(2);
      draw();
    };
  }
};

// 2. Upload Frame
document.getElementById("uploadFrame").onchange = function(e) {
  if (e.target.files && e.target.files[0]) {
    const file = e.target.files[0];
    if (!file.type.match('image.*')) {
      alert("Please select an image file!");
      return;
    }
    
    frameImg = new Image();
    frameImg.src = URL.createObjectURL(file);
    frameImg.onload = () => draw();
  }
};

// 3. Name Input
document.getElementById("nameText").oninput = function() {
  nameText = this.value.trim();
  draw();
};

// 4. Pad Input
document.getElementById("padText").oninput = function() {
  padText = this.value.trim();
  draw();
};

// 5. Text Position Controls
textXSlider.oninput = function() {
  textX = parseFloat(this.value);
  textXValue.textContent = Math.round(textX);
  draw();
};

textYSlider.oninput = function() {
  textY = parseFloat(this.value);
  textYValue.textContent = Math.round(textY);
  draw();
};

// 6. Photo Controls
zoomSlider.oninput = function() {
  zoom = parseFloat(this.value);
  zoomValue.textContent = zoom.toFixed(2);
  draw();
};

rotateSlider.oninput = function() {
  rotate = parseFloat(this.value);
  rotateValue.textContent = Math.round(rotate) + '°';
  draw();
};

moveXSlider.oninput = function() {
  moveX = parseFloat(this.value);
  moveXValue.textContent = Math.round(moveX);
  draw();
};

moveYSlider.oninput = function() {
  moveY = parseFloat(this.value);
  moveYValue.textContent = Math.round(moveY);
  draw();
};

// 7. Font Controls
fontSizeSlider.oninput = function() {
  fontSize = parseInt(this.value);
  fontSizeValue.textContent = fontSize;
  draw();
};

fontColorPicker.oninput = function() {
  fontColor = this.value;
  fontColorPreview.style.backgroundColor = fontColor;
  draw();
};

borderColorPicker.oninput = function() {
  borderColor = this.value;
  borderColorPreview.style.backgroundColor = borderColor;
  draw();
};

borderSizeSlider.oninput = function() {
  borderSize = parseInt(this.value);
  borderSizeValue.textContent = borderSize + 'px';
  draw();
};

fontFamilySelect.onchange = function() {
  fontFamily = this.value;
  draw();
};

// Style Buttons
styleButtons.forEach(btn => {
  btn.addEventListener("click", function() {
    this.classList.toggle("active");
    const style = this.getAttribute("data-style");
    
    if (style === "bold") {
      fontWeight = this.classList.contains("active") ? "bold" : "normal";
    } else if (style === "italic") {
      fontStyle = this.classList.contains("active") ? "italic" : "normal";
    }
    
    draw();
  });
});

// Mode Switching
modeButtons.forEach(btn => {
  btn.addEventListener("click", function() {
    const mode = this.getAttribute("data-mode");
    
    modeButtons.forEach(b => b.classList.remove("active"));
    this.classList.add("active");
    
    tabContents.forEach(content => {
      content.classList.remove("active");
      if (content.id === `${mode}-tab`) {
        content.classList.add("active");
      }
    });
  });
});

// 8. Reset Function
document.getElementById("reset").onclick = function() {
  // Reset all values
  zoom = 1;
  rotate = 0;
  moveX = 0;
  moveY = 0;
  textX = 0;
  textY = 0;
  fontSize = 40;
  fontColor = "#ffffff";
  borderColor = "#000000";
  borderSize = 3;
  fontFamily = "'Poppins', sans-serif";
  fontStyle = "normal";
  fontWeight = "normal";
  nameText = "";
  padText = "";
  
  // Update sliders
  zoomSlider.value = zoom;
  rotateSlider.value = rotate;
  moveXSlider.value = moveX;
  moveYSlider.value = moveY;
  textXSlider.value = textX;
  textYSlider.value = textY;
  fontSizeSlider.value = fontSize;
  fontColorPicker.value = fontColor;
  borderColorPicker.value = borderColor;
  borderSizeSlider.value = borderSize;
  fontFamilySelect.value = fontFamily;
  
  // Update displays
  zoomValue.textContent = zoom.toFixed(2);
  rotateValue.textContent = Math.round(rotate) + '°';
  moveXValue.textContent = Math.round(moveX);
  moveYValue.textContent = Math.round(moveY);
  textXValue.textContent = Math.round(textX);
  textYValue.textContent = Math.round(textY);
  fontSizeValue.textContent = fontSize;
  borderSizeValue.textContent = borderSize + 'px';
  fontColorPreview.style.backgroundColor = fontColor;
  borderColorPreview.style.backgroundColor = borderColor;
  
  // Clear inputs
  document.getElementById("nameText").value = "";
  document.getElementById("padText").value = "";
  
  // Reset style buttons
  styleButtons.forEach(btn => btn.classList.remove("active"));
  
  // Switch to text tab
  modeButtons.forEach(b => b.classList.remove("active"));
  modeButtons[0].classList.add("active");
  tabContents.forEach(content => content.classList.remove("active"));
  document.getElementById("text-tab").classList.add("active");
  
  draw();
};

// 9. DRAW FUNCTION
function draw() {
  ctx.clearRect(0, 0, SIZE, SIZE);
  
  // Circular clipping
  ctx.save();
  ctx.beginPath();
  ctx.arc(SIZE/2, SIZE/2, SIZE/2 - 5, 0, Math.PI * 2);
  ctx.clip();
  
  // White background
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, SIZE, SIZE);
  
  // Draw Photo
  if (img) {
    ctx.save();
    
    ctx.translate(SIZE/2 + moveX, SIZE/2 + moveY);
    ctx.rotate(rotate * Math.PI / 180);
    
    const w = img.width * zoom;
    const h = img.height * zoom;
    
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    
    ctx.drawImage(img, -w/2, -h/2, w, h);
    
    ctx.restore();
  }
  
  // Draw Text
  if (nameText || padText) {
    ctx.save();
    
    const fontStyleStr = fontStyle === "italic" ? "italic" : "normal";
    const fontWeightStr = fontWeight === "bold" ? "bold" : "normal";
    const fontSizeScaled = fontSize * 2;
    
    ctx.font = `${fontStyleStr} ${fontWeightStr} ${fontSizeScaled}px ${fontFamily}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    
    const textPosX = SIZE/2 + (textX * 2);
    const namePosY = SIZE - 200 + (textY * 2);
    const padPosY = namePosY + fontSizeScaled * 0.9;
    
    // Draw Name with border
    if (nameText) {
      if (borderSize > 0) {
        ctx.strokeStyle = borderColor;
        ctx.lineWidth = borderSize * 2;
        ctx.lineJoin = "round";
        ctx.strokeText(nameText, textPosX, namePosY);
      }
      
      ctx.fillStyle = fontColor;
      ctx.fillText(nameText, textPosX, namePosY);
    }
    
    // Draw Pad/Title with border
    if (padText) {
      const padFontSize = fontSizeScaled * 0.7;
      ctx.font = `${fontStyleStr} ${fontWeightStr} ${padFontSize}px ${fontFamily}`;
      
      if (borderSize > 0) {
        ctx.strokeStyle = borderColor;
        ctx.lineWidth = borderSize * 1.5;
        ctx.lineJoin = "round";
        ctx.strokeText(padText, textPosX, padPosY);
      }
      
      ctx.fillStyle = fontColor;
      ctx.fillText(padText, textPosX, padPosY);
    }
    
    ctx.restore();
  }
  
  ctx.restore();
  
  // Draw Frame on top
  if (frameImg) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(SIZE/2, SIZE/2, SIZE/2, 0, Math.PI * 2);
    ctx.clip();
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(frameImg, 0, 0, SIZE, SIZE);
    ctx.restore();
  }
}

// 10. Download
document.getElementById("download").onclick = function() {
  if (!img) {
    alert("Please select a photo first!");
    return;
  }
  
  const originalHTML = this.innerHTML;
  this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
  this.disabled = true;
  
  setTimeout(() => {
    const downloadCanvas = document.createElement("canvas");
    const downloadCtx = downloadCanvas.getContext("2d");
    
    const downloadSize = 2048;
    downloadCanvas.width = downloadSize;
    downloadCanvas.height = downloadSize;
    
    const scale = downloadSize / SIZE;
    
    downloadCtx.save();
    downloadCtx.beginPath();
    downloadCtx.arc(downloadSize/2, downloadSize/2, downloadSize/2 - 5, 0, Math.PI * 2);
    downloadCtx.clip();
    
    downloadCtx.fillStyle = "#ffffff";
    downloadCtx.fillRect(0, 0, downloadSize, downloadSize);
    
    if (img) {
      downloadCtx.save();
      
      const scaledMoveX = moveX * scale;
      const scaledMoveY = moveY * scale;
      
      downloadCtx.translate(downloadSize/2 + scaledMoveX, downloadSize/2 + scaledMoveY);
      downloadCtx.rotate(rotate * Math.PI / 180);
      
      const scaledWidth = img.width * zoom * scale;
      const scaledHeight = img.height * zoom * scale;
      
      downloadCtx.drawImage(img, -scaledWidth/2, -scaledHeight/2, scaledWidth, scaledHeight);
      downloadCtx.restore();
    }
    
    if (nameText || padText) {
      downloadCtx.save();
      
      const fontSizeScaled = fontSize * 2 * scale;
      const fontStyleStr = fontStyle === "italic" ? "italic" : "normal";
      const fontWeightStr = fontWeight === "bold" ? "bold" : "normal";
      
      downloadCtx.font = `${fontStyleStr} ${fontWeightStr} ${fontSizeScaled}px ${fontFamily}`;
      downloadCtx.textAlign = "center";
      downloadCtx.textBaseline = "middle";
      
      const textPosX = downloadSize/2 + (textX * 2 * scale);
      const namePosY = downloadSize - 200 * scale + (textY * 2 * scale);
      const padPosY = namePosY + fontSizeScaled * 0.9;
      
      if (nameText) {
        if (borderSize > 0) {
          downloadCtx.strokeStyle = borderColor;
          downloadCtx.lineWidth = borderSize * 2 * scale;
          downloadCtx.lineJoin = "round";
          downloadCtx.strokeText(nameText, textPosX, namePosY);
        }
        
        downloadCtx.fillStyle = fontColor;
        downloadCtx.fillText(nameText, textPosX, namePosY);
      }
      
      if (padText) {
        const padFontSize = fontSizeScaled * 0.7;
        downloadCtx.font = `${fontStyleStr} ${fontWeightStr} ${padFontSize}px ${fontFamily}`;
        
        if (borderSize > 0) {
          downloadCtx.strokeStyle = borderColor;
          downloadCtx.lineWidth = borderSize * 1.5 * scale;
          downloadCtx.lineJoin = "round";
          downloadCtx.strokeText(padText, textPosX, padPosY);
        }
        
        downloadCtx.fillStyle = fontColor;
        downloadCtx.fillText(padText, textPosX, padPosY);
      }
      
      downloadCtx.restore();
    }
    
    downloadCtx.restore();
    
    if (frameImg) {
      downloadCtx.save();
      downloadCtx.beginPath();
      downloadCtx.arc(downloadSize/2, downloadSize/2, downloadSize/2, 0, Math.PI * 2);
      downloadCtx.clip();
      downloadCtx.drawImage(frameImg, 0, 0, downloadSize, downloadSize);
      downloadCtx.restore();
    }
    
    const link = document.createElement("a");
    link.href = downloadCanvas.toDataURL("image/png", 1.0);
    link.download = `photo-frame-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    this.innerHTML = originalHTML;
    this.disabled = false;
  }, 300);
};

// 11. Initialize
fontColorPreview.style.backgroundColor = fontColor;
borderColorPreview.style.backgroundColor = borderColor;
zoomValue.textContent = zoom.toFixed(2);
rotateValue.textContent = Math.round(rotate) + '°';
moveXValue.textContent = Math.round(moveX);
moveYValue.textContent = Math.round(moveY);
textXValue.textContent = Math.round(textX);
textYValue.textContent = Math.round(textY);
fontSizeValue.textContent = fontSize;
borderSizeValue.textContent = borderSize + 'px';

// Initial draw
draw();

// Mouse drag for PC
let isMouseDown = false;
canvas.addEventListener('mousedown', function(e) {
  isMouseDown = true;
  touchStartX = e.clientX;
  touchStartY = e.clientY;
  
  if (isTouchOnText(e.clientX, e.clientY)) {
    isDraggingText = true;
    initialTextX = textX;
    initialTextY = textY;
  } else if (img) {
    isDraggingPhoto = true;
    initialMoveX = moveX;
    initialMoveY = moveY;
  }
});

canvas.addEventListener('mousemove', function(e) {
  if (!isMouseDown) return;
  
  const deltaX = e.clientX - touchStartX;
  const deltaY = e.clientY - touchStartY;
  
  if (isDraggingPhoto) {
    moveX = initialMoveX + deltaX * 0.5;
    moveY = initialMoveY + deltaY * 0.5;
    
    moveXSlider.value = moveX;
    moveYSlider.value = moveY;
    moveXValue.textContent = Math.round(moveX);
    moveYValue.textContent = Math.round(moveY);
  } else if (isDraggingText) {
    textX = initialTextX + deltaX * 0.2;
    textY = initialTextY + deltaY * 0.2;
    
    textXSlider.value = textX;
    textYSlider.value = textY;
    textXValue.textContent = Math.round(textX);
    textYValue.textContent = Math.round(textY);
  }
  
  draw();
});

canvas.addEventListener('mouseup', function() {
  isMouseDown = false;
  isDraggingPhoto = false;
  isDraggingText = false;
});

canvas.addEventListener('mouseleave', function() {
  isMouseDown = false;
  isDraggingPhoto = false;
  isDraggingText = false;
});
