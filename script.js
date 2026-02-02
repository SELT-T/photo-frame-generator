const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const canvasContainer = document.getElementById("canvasContainer");

// Set canvas size (high resolution for quality)
const SIZE = 1024;
canvas.width = SIZE;
canvas.height = SIZE;

// Variables
let img = null;
let frameImg = null;
let zoom = 1, rotate = 0, moveX = 0, moveY = 0;
let nameText = "", padText = "";
let textSize = 40, textColor = "#ffffff";
let borderRadius = 0, brightness = 1;

// Touch gesture variables
let touchStartDistance = 0;
let touchStartZoom = 1;
let isDragging = false;
let dragStartX = 0, dragStartY = 0;
let dragStartMoveX = 0, dragStartMoveY = 0;

// UI Elements
const displayName = document.getElementById("displayName");
const displayPad = document.getElementById("displayPad");
const textSizeSlider = document.getElementById("textSize");
const textSizeValue = document.getElementById("textSizeValue");
const textColorPicker = document.getElementById("textColor");
const textColorPreview = document.getElementById("textColorPreview");
const zoomSlider = document.getElementById("zoom");
const zoomValue = document.getElementById("zoomValue");
const rotateSlider = document.getElementById("rotate");
const rotateValue = document.getElementById("rotateValue");
const moveXSlider = document.getElementById("moveX");
const moveXValue = document.getElementById("moveXValue");
const moveYSlider = document.getElementById("moveY");
const moveYValue = document.getElementById("moveYValue");
const borderRadiusSlider = document.getElementById("borderRadius");
const borderRadiusValue = document.getElementById("borderRadiusValue");
const brightnessSlider = document.getElementById("brightness");
const brightnessValue = document.getElementById("brightnessValue");
const notification = document.getElementById("notification");
const notificationText = document.getElementById("notificationText");
const touchHint = document.getElementById("touchHint");

// Tab functionality
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', function() {
    const tabName = this.dataset.tab;
    
    // Remove active from all buttons and panes
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
    
    // Add active to clicked button and corresponding pane
    this.classList.add('active');
    document.getElementById(`${tabName}-tab`).classList.add('active');
  });
});

// Load default frame
frameImg = new Image();
frameImg.crossOrigin = "anonymous";
frameImg.src = "frame.png";
frameImg.onload = () => {
  showNotification("Frame loaded!");
  draw();
};

frameImg.onerror = () => {
  frameImg = null;
  draw();
};

// 1. Upload Photo
document.getElementById("upload").onchange = function(e) {
  if (e.target.files && e.target.files[0]) {
    const file = e.target.files[0];
    if (!file.type.match('image.*')) {
      showNotification("Select an image file", "error");
      return;
    }
    
    img = new Image();
    img.crossOrigin = "anonymous";
    img.src = URL.createObjectURL(e.target.files[0]);
    img.onload = () => {
      showNotification("Photo loaded!");
      
      // Auto-adjust zoom
      const scaleX = SIZE / img.width;
      const scaleY = SIZE / img.height;
      zoom = Math.min(scaleX, scaleY) * 0.8;
      
      // Reset position
      moveX = 0;
      moveY = 0;
      rotate = 0;
      
      // Update UI
      updateAllSliders();
      draw();
    };
    img.onerror = () => {
      showNotification("Error loading image", "error");
    };
  }
};

// 2. Upload Frame
document.getElementById("uploadFrame").onchange = function(e) {
  if (e.target.files && e.target.files[0]) {
    const file = e.target.files[0];
    if (!file.type.match('image.*')) {
      showNotification("Select an image file", "error");
      return;
    }
    
    frameImg = new Image();
    frameImg.crossOrigin = "anonymous";
    frameImg.src = URL.createObjectURL(e.target.files[0]);
    frameImg.onload = () => {
      showNotification("Frame loaded!");
      draw();
    };
    frameImg.onerror = () => {
      showNotification("Error loading frame", "error");
    };
  }
};

// 3. Name Input
document.getElementById("nameText").oninput = function() {
  nameText = this.value.trim();
  displayName.textContent = nameText;
  displayName.style.color = textColor;
  displayName.style.fontSize = `${Math.min(textSize * 0.9, 20)}px`;
  draw();
};

// 4. Pad Input
document.getElementById("padText").oninput = function() {
  padText = this.value.trim();
  displayPad.textContent = padText;
  displayPad.style.color = textColor;
  displayPad.style.fontSize = `${Math.min(textSize * 0.6, 14)}px`;
  draw();
};

// 5. Text Controls
textSizeSlider.oninput = function() {
  textSize = parseInt(this.value);
  textSizeValue.textContent = textSize;
  displayName.style.fontSize = `${Math.min(textSize * 0.9, 20)}px`;
  displayPad.style.fontSize = `${Math.min(textSize * 0.6, 14)}px`;
  draw();
};

textColorPicker.oninput = function() {
  textColor = this.value;
  textColorPreview.style.backgroundColor = textColor;
  displayName.style.color = textColor;
  displayPad.style.color = textColor;
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

// 7. Advanced Controls
borderRadiusSlider.oninput = function() {
  borderRadius = parseInt(this.value);
  borderRadiusValue.textContent = `${borderRadius}%`;
  draw();
};

brightnessSlider.oninput = function() {
  brightness = parseFloat(this.value);
  brightnessValue.textContent = brightness.toFixed(2);
  draw();
};

// 8. Reset
document.getElementById("reset").onclick = function() {
  zoom = 1;
  rotate = 0;
  moveX = 0;
  moveY = 0;
  textSize = 40;
  textColor = "#ffffff";
  borderRadius = 0;
  brightness = 1;
  
  // Reset inputs
  document.getElementById("nameText").value = "";
  document.getElementById("padText").value = "";
  nameText = "";
  padText = "";
  displayName.textContent = "";
  displayPad.textContent = "";
  
  updateAllSliders();
  showNotification("Reset complete!");
  draw();
};

function updateAllSliders() {
  zoomSlider.value = zoom;
  zoomValue.textContent = zoom.toFixed(2);
  rotateSlider.value = rotate;
  rotateValue.textContent = `${rotate}°`;
  moveXSlider.value = moveX;
  moveXValue.textContent = moveX;
  moveYSlider.value = moveY;
  moveYValue.textContent = moveY;
  textSizeSlider.value = textSize;
  textSizeValue.textContent = textSize;
  textColorPicker.value = textColor;
  textColorPreview.style.backgroundColor = textColor;
  borderRadiusSlider.value = borderRadius;
  borderRadiusValue.textContent = `${borderRadius}%`;
  brightnessSlider.value = brightness;
  brightnessValue.textContent = brightness.toFixed(2);
}

// TOUCH GESTURES
// Pinch to zoom
canvasContainer.addEventListener('touchmove', function(e) {
  if (e.touches.length === 2) {
    e.preventDefault();
    
    const touch1 = e.touches[0];
    const touch2 = e.touches[1];
    
    const distance = Math.hypot(
      touch1.clientX - touch2.clientX,
      touch1.clientY - touch2.clientY
    );
    
    if (touchStartDistance === 0) {
      touchStartDistance = distance;
      touchStartZoom = zoom;
    } else {
      const scale = distance / touchStartDistance;
      zoom = Math.max(0.3, Math.min(5, touchStartZoom * scale));
      zoomSlider.value = zoom;
      zoomValue.textContent = zoom.toFixed(2);
      draw();
    }
  }
}, { passive: false });

canvasContainer.addEventListener('touchend', function(e) {
  if (e.touches.length < 2) {
    touchStartDistance = 0;
  }
});

// Drag to move
canvasContainer.addEventListener('touchstart', function(e) {
  if (e.touches.length === 1) {
    isDragging = true;
    dragStartX = e.touches[0].clientX;
    dragStartY = e.touches[0].clientY;
    dragStartMoveX = moveX;
    dragStartMoveY = moveY;
  }
}, { passive: true });

canvasContainer.addEventListener('touchmove', function(e) {
  if (isDragging && e.touches.length === 1) {
    const deltaX = e.touches[0].clientX - dragStartX;
    const deltaY = e.touches[0].clientY - dragStartY;
    
    // Scale delta to canvas coordinate system
    const scale = SIZE / canvasContainer.offsetWidth;
    
    moveX = Math.max(-500, Math.min(500, dragStartMoveX + deltaX * scale));
    moveY = Math.max(-500, Math.min(500, dragStartMoveY + deltaY * scale));
    
    moveXSlider.value = moveX;
    moveXValue.textContent = moveX;
    moveYSlider.value = moveY;
    moveYValue.textContent = moveY;
    
    draw();
  }
}, { passive: true });

canvasContainer.addEventListener('touchend', function(e) {
  isDragging = false;
}, { passive: true });

// Mouse support for desktop testing
let mouseDown = false;
let mouseStartX = 0, mouseStartY = 0;
let mouseStartMoveX = 0, mouseStartMoveY = 0;

canvasContainer.addEventListener('mousedown', function(e) {
  mouseDown = true;
  mouseStartX = e.clientX;
  mouseStartY = e.clientY;
  mouseStartMoveX = moveX;
  mouseStartMoveY = moveY;
});

canvasContainer.addEventListener('mousemove', function(e) {
  if (mouseDown && e.buttons === 1) {
    const deltaX = e.clientX - mouseStartX;
    const deltaY = e.clientY - mouseStartY;
    
    const scale = SIZE / canvasContainer.offsetWidth;
    
    moveX = Math.max(-500, Math.min(500, mouseStartMoveX + deltaX * scale));
    moveY = Math.max(-500, Math.min(500, mouseStartMoveY + deltaY * scale));
    
    moveXSlider.value = moveX;
    moveXValue.textContent = moveX;
    moveYSlider.value = moveY;
    moveYValue.textContent = moveY;
    
    draw();
  }
});

canvasContainer.addEventListener('mouseup', function() {
  mouseDown = false;
});

// Wheel zoom
canvasContainer.addEventListener('wheel', function(e) {
  if (e.ctrlKey || e.metaKey) {
    e.preventDefault();
    
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    zoom = Math.max(0.3, Math.min(5, zoom + delta));
    
    zoomSlider.value = zoom;
    zoomValue.textContent = zoom.toFixed(2);
    draw();
  }
}, { passive: false });

// 9. DRAW FUNCTION
function draw() {
  ctx.clearRect(0, 0, SIZE, SIZE);
  
  if (borderRadius > 0) {
    const radius = (borderRadius / 100) * SIZE;
    ctx.beginPath();
    ctx.moveTo(radius, 0);
    ctx.lineTo(SIZE - radius, 0);
    ctx.arcTo(SIZE, 0, SIZE, radius, radius);
    ctx.lineTo(SIZE, SIZE - radius);
    ctx.arcTo(SIZE, SIZE, SIZE - radius, SIZE, radius);
    ctx.lineTo(radius, SIZE);
    ctx.arcTo(0, SIZE, 0, SIZE - radius, radius);
    ctx.lineTo(0, radius);
    ctx.arcTo(0, 0, radius, 0, radius);
    ctx.closePath();
    ctx.clip();
  }
  
  ctx.fillStyle = "transparent";
  ctx.fillRect(0, 0, SIZE, SIZE);
  
  if (img) {
    ctx.save();
    ctx.filter = `brightness(${brightness})`;
    
    const centerX = SIZE / 2 + moveX;
    const centerY = SIZE / 2 + moveY;
    
    ctx.translate(centerX, centerY);
    ctx.rotate(rotate * Math.PI / 180);
    
    const scaledWidth = img.width * zoom;
    const scaledHeight = img.height * zoom;
    
    ctx.drawImage(img, -scaledWidth / 2, -scaledHeight / 2, scaledWidth, scaledHeight);
    ctx.restore();
  }
  
  if (frameImg) {
    ctx.save();
    ctx.drawImage(frameImg, 0, 0, SIZE, SIZE);
    ctx.restore();
  }
  
  if (nameText || padText) {
    ctx.save();
    ctx.fillStyle = textColor;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    
    if (nameText) {
      ctx.font = `bold ${textSize}px 'Poppins', sans-serif`;
      ctx.shadowColor = "rgba(0, 0, 0, 0.8)";
      ctx.shadowBlur = 10;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;
      
      ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
      const nameMetrics = ctx.measureText(nameText);
      const namePadding = 20;
      ctx.fillRect(
        SIZE/2 - nameMetrics.width/2 - namePadding, 
        SIZE - 150 - textSize/2 - 10, 
        nameMetrics.width + namePadding*2, 
        textSize + 20
      );
      
      ctx.fillStyle = textColor;
      ctx.fillText(nameText, SIZE/2, SIZE - 150);
    }
    
    if (padText) {
      const padSize = textSize * 0.7;
      ctx.font = `600 ${padSize}px 'Poppins', sans-serif`;
      ctx.shadowColor = "rgba(0, 0, 0, 0.8)";
      ctx.shadowBlur = 8;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;
      
      ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
      const padMetrics = ctx.measureText(padText);
      const padPadding = 15;
      ctx.fillRect(
        SIZE/2 - padMetrics.width/2 - padPadding, 
        SIZE - 80 - padSize/2 - 8, 
        padMetrics.width + padPadding*2, 
        padSize + 16
      );
      
      ctx.fillStyle = textColor;
      ctx.fillText(padText, SIZE/2, SIZE - 80);
    }
    
    ctx.restore();
  }
}

// 10. Download
document.getElementById("download").onclick = function() {
  if (!img) {
    showNotification("Select photo first", "error");
    return;
  }
  
  const downloadCanvas = document.createElement("canvas");
  const downloadCtx = downloadCanvas.getContext("2d");
  
  const downloadSize = 2048;
  downloadCanvas.width = downloadSize;
  downloadCanvas.height = downloadSize;
  
  const scale = downloadSize / SIZE;
  
  if (borderRadius > 0) {
    const radius = (borderRadius / 100) * downloadSize;
    downloadCtx.beginPath();
    downloadCtx.moveTo(radius, 0);
    downloadCtx.lineTo(downloadSize - radius, 0);
    downloadCtx.arcTo(downloadSize, 0, downloadSize, radius, radius);
    downloadCtx.lineTo(downloadSize, downloadSize - radius);
    downloadCtx.arcTo(downloadSize, downloadSize, downloadSize - radius, downloadSize, radius);
    downloadCtx.lineTo(radius, downloadSize);
    downloadCtx.arcTo(0, downloadSize, 0, downloadSize - radius, radius);
    downloadCtx.lineTo(0, radius);
    downloadCtx.arcTo(0, 0, radius, 0, radius);
    downloadCtx.closePath();
    downloadCtx.clip();
  }
  
  downloadCtx.fillStyle = "transparent";
  downloadCtx.fillRect(0, 0, downloadSize, downloadSize);
  
  if (img) {
    downloadCtx.save();
    downloadCtx.filter = `brightness(${brightness})`;
    
    const scaledMoveX = moveX * scale;
    const scaledMoveY = moveY * scale;
    const centerX = downloadSize / 2 + scaledMoveX;
    const centerY = downloadSize / 2 + scaledMoveY;
    
    downloadCtx.translate(centerX, centerY);
    downloadCtx.rotate(rotate * Math.PI / 180);
    
    const scaledWidth = img.width * zoom * scale;
    const scaledHeight = img.height * zoom * scale;
    
    downloadCtx.drawImage(img, -scaledWidth / 2, -scaledHeight / 2, scaledWidth, scaledHeight);
    downloadCtx.restore();
  }
  
  if (frameImg) {
    downloadCtx.drawImage(frameImg, 0, 0, downloadSize, downloadSize);
  }
  
  if (nameText || padText) {
    downloadCtx.save();
    downloadCtx.fillStyle = textColor;
    downloadCtx.textAlign = "center";
    downloadCtx.textBaseline = "middle";
    
    if (nameText) {
      const scaledTextSize = textSize * scale;
      downloadCtx.font = `bold ${scaledTextSize}px 'Poppins', sans-serif`;
      downloadCtx.shadowColor = "rgba(0, 0, 0, 0.8)";
      downloadCtx.shadowBlur = 15 * scale;
      downloadCtx.shadowOffsetX = 3 * scale;
      downloadCtx.shadowOffsetY = 3 * scale;
      
      downloadCtx.fillStyle = "rgba(0, 0, 0, 0.4)";
      const nameMetrics = downloadCtx.measureText(nameText);
      const namePadding = 25 * scale;
      downloadCtx.fillRect(
        downloadSize/2 - nameMetrics.width/2 - namePadding, 
        downloadSize - 300 * scale - scaledTextSize/2 - 15 * scale, 
        nameMetrics.width + namePadding*2, 
        scaledTextSize + 30 * scale
      );
      
      downloadCtx.fillStyle = textColor;
      downloadCtx.fillText(nameText, downloadSize/2, downloadSize - 300 * scale);
    }
    
    if (padText) {
      const scaledPadSize = textSize * 0.7 * scale;
      downloadCtx.font = `600 ${scaledPadSize}px 'Poppins', sans-serif`;
      downloadCtx.shadowColor = "rgba(0, 0, 0, 0.8)";
      downloadCtx.shadowBlur = 12 * scale;
      downloadCtx.shadowOffsetX = 2 * scale;
      downloadCtx.shadowOffsetY = 2 * scale;
      
      downloadCtx.fillStyle = "rgba(0, 0, 0, 0.4)";
      const padMetrics = downloadCtx.measureText(padText);
      const padPadding = 20 * scale;
      downloadCtx.fillRect(
        downloadSize/2 - padMetrics.width/2 - padPadding, 
        downloadSize - 160 * scale - scaledPadSize/2 - 12 * scale, 
        padMetrics.width + padPadding*2, 
        scaledPadSize + 24 * scale
      );
      
      downloadCtx.fillStyle = textColor;
      downloadCtx.fillText(padText, downloadSize/2, downloadSize - 160 * scale);
    }
    
    downloadCtx.restore();
  }
  
  const link = document.createElement("a");
  link.href = downloadCanvas.toDataURL("image/png", 1.0);
  link.download = "photo-frame-" + Date.now() + ".png";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  showNotification("Downloaded!");
};

// 11. Share
document.getElementById("share").onclick = function() {
  if (!img) {
    showNotification("Select photo first", "error");
    return;
  }
  
  if (navigator.share) {
    canvas.toBlob(function(blob) {
      const file = new File([blob], 'photo-frame.png', { type: 'image/png' });
      
      navigator.share({
        files: [file],
        title: 'My Photo Frame',
        text: 'Check this out!'
      })
      .then(() => showNotification("Shared!"))
      .catch(error => {
        if (error.name !== 'AbortError') {
          showNotification("Share failed", "error");
        }
      });
    });
  } else {
    showNotification("Share not supported", "error");
  }
};

// 12. Notification
function showNotification(message, type = "success") {
  notificationText.textContent = message;
  notification.style.borderLeftColor = type === "error" ? "#f5576c" : "#43e97b";
  notification.style.display = "flex";
  
  setTimeout(() => {
    notification.style.display = "none";
  }, 2500);
}

// Initialize UI
textColorPreview.style.backgroundColor = textColor;
textSizeValue.textContent = textSize;
updateAllSliders();

draw();

// Redraw on resize
window.addEventListener('resize', draw);

// Prevent default touch behavior
document.addEventListener('touchmove', function(e) {
  if (e.target.closest('.canvas-container')) {
    e.preventDefault();
  }
}, { passive: false });
