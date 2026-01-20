const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

// Set canvas size (high resolution for quality)
const SIZE = 1024;
canvas.width = SIZE;
canvas.height = SIZE;

// Display canvas size
canvas.style.width = "350px";
canvas.style.height = "350px";

// Variables
let img = null;
let frameImg = null;
let zoom = 1, rotate = 0, moveX = 0, moveY = 0;
let nameText = "", padText = "";
let textSize = 40, textColor = "#ffffff", textX = 0, textY = 0;
let borderRadius = 0, brightness = 1;

// UI Elements
const displayName = document.getElementById("displayName");
const displayPad = document.getElementById("displayPad");
const textSizeSlider = document.getElementById("textSize");
const textSizeValue = document.getElementById("textSizeValue");
const textColorPicker = document.getElementById("textColor");
const textColorPreview = document.getElementById("textColorPreview");
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
const borderRadiusSlider = document.getElementById("borderRadius");
const borderRadiusValue = document.getElementById("borderRadiusValue");
const brightnessSlider = document.getElementById("brightness");
const brightnessValue = document.getElementById("brightnessValue");
const toggleOptions = document.getElementById("toggleOptions");
const advancedControls = document.getElementById("advancedControls");
const notification = document.getElementById("notification");
const notificationText = document.getElementById("notificationText");

// Create a default frame (transparent with border)
function createDefaultFrame() {
  const frameCanvas = document.createElement('canvas');
  frameCanvas.width = SIZE;
  frameCanvas.height = SIZE;
  const frameCtx = frameCanvas.getContext('2d');
  
  // Transparent background
  frameCtx.clearRect(0, 0, SIZE, SIZE);
  
  // Draw a simple decorative border
  frameCtx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
  frameCtx.lineWidth = 20;
  frameCtx.strokeRect(50, 50, SIZE - 100, SIZE - 100);
  
  // Create gradient border
  const gradient = frameCtx.createLinearGradient(0, 0, SIZE, SIZE);
  gradient.addColorStop(0, 'rgba(102, 166, 255, 0.5)');
  gradient.addColorStop(0.5, 'rgba(137, 247, 254, 0.5)');
  gradient.addColorStop(1, 'rgba(102, 166, 255, 0.5)');
  
  frameCtx.strokeStyle = gradient;
  frameCtx.lineWidth = 15;
  frameCtx.strokeRect(70, 70, SIZE - 140, SIZE - 140);
  
  // Convert canvas to image
  frameImg = new Image();
  frameImg.src = frameCanvas.toDataURL();
  frameImg.onload = () => {
    draw();
  };
}

// Load default frame
createDefaultFrame();

// 1. Upload Photo
document.getElementById("upload").onchange = function(e) {
  if (e.target.files && e.target.files[0]) {
    const file = e.target.files[0];
    if (!file.type.match('image.*')) {
      showNotification("Please select an image file", "error");
      return;
    }
    
    img = new Image();
    img.crossOrigin = "anonymous";
    img.src = URL.createObjectURL(e.target.files[0]);
    img.onload = () => {
      showNotification("Photo loaded successfully!");
      
      // Auto-adjust zoom to fit photo properly (NO CUTTING)
      const scaleX = SIZE / img.width;
      const scaleY = SIZE / img.height;
      zoom = Math.min(scaleX, scaleY) * 0.9; // 90% of fit to allow some margin
      
      // Reset position
      moveX = 0;
      moveY = 0;
      rotate = 0;
      
      // Update UI
      zoomSlider.value = zoom;
      zoomValue.textContent = zoom.toFixed(2);
      moveXSlider.value = moveX;
      moveXValue.textContent = moveX;
      moveYSlider.value = moveY;
      moveYValue.textContent = moveY;
      rotateSlider.value = rotate;
      rotateValue.textContent = `${rotate}°`;
      
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
      showNotification("Please select an image file", "error");
      return;
    }
    
    frameImg = new Image();
    frameImg.crossOrigin = "anonymous";
    frameImg.src = URL.createObjectURL(e.target.files[0]);
    frameImg.onload = () => {
      showNotification("Frame loaded successfully!");
      draw();
    };
    frameImg.onerror = () => {
      showNotification("Error loading frame image", "error");
      // Revert to default frame
      createDefaultFrame();
    };
  }
};

// 3. Name Input
document.getElementById("nameText").oninput = function() {
  nameText = this.value.trim();
  displayName.textContent = nameText;
  displayName.style.color = textColor;
  displayName.style.fontSize = `${textSize}px`;
  draw();
};

// 4. Pad Input
document.getElementById("padText").oninput = function() {
  padText = this.value.trim();
  displayPad.textContent = padText;
  displayPad.style.color = textColor;
  displayPad.style.fontSize = `${textSize * 0.7}px`;
  draw();
};

// 5. Text Controls
textSizeSlider.oninput = function() {
  textSize = parseInt(this.value);
  textSizeValue.textContent = textSize;
  displayName.style.fontSize = `${textSize}px`;
  displayPad.style.fontSize = `${textSize * 0.7}px`;
  draw();
};

textColorPicker.oninput = function() {
  textColor = this.value;
  textColorPreview.style.backgroundColor = textColor;
  displayName.style.color = textColor;
  displayPad.style.color = textColor;
  draw();
};

textXSlider.oninput = function() {
  textX = parseInt(this.value);
  textXValue.textContent = textX;
  updateTextPosition();
  draw();
};

textYSlider.oninput = function() {
  textY = parseInt(this.value);
  textYValue.textContent = textY;
  updateTextPosition();
  draw();
};

// Update text position in overlay
function updateTextPosition() {
  const canvasRect = document.querySelector('.canvas-wrapper').getBoundingClientRect();
  const canvasWidth = canvasRect.width;
  
  // Calculate position based on canvas size (350px display size)
  const xOffset = (textX / 200) * (canvasWidth / 2);
  const yOffset = (textY / 200) * 50;
  
  displayName.style.transform = `translateX(${xOffset}px) translateY(${yOffset}px)`;
  displayPad.style.transform = `translateX(${xOffset}px) translateY(${yOffset}px)`;
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

// Toggle advanced options
toggleOptions.onclick = function() {
  advancedControls.classList.toggle("show");
  this.innerHTML = advancedControls.classList.contains("show") 
    ? '<i class="fas fa-chevron-up"></i> Hide Advanced Options' 
    : '<i class="fas fa-sliders-h"></i> Advanced Options';
};

// 8. Reset
document.getElementById("reset").onclick = function() {
  zoom = 1;
  rotate = 0;
  moveX = 0;
  moveY = 0;
  textSize = 40;
  textColor = "#ffffff";
  textX = 0;
  textY = 0;
  borderRadius = 0;
  brightness = 1;
  
  // Reset UI
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
  textXSlider.value = textX;
  textXValue.textContent = textX;
  textYSlider.value = textY;
  textYValue.textContent = textY;
  borderRadiusSlider.value = borderRadius;
  borderRadiusValue.textContent = `${borderRadius}%`;
  brightnessSlider.value = brightness;
  brightnessValue.textContent = brightness.toFixed(2);
  
  // Reset text inputs
  document.getElementById("nameText").value = "";
  document.getElementById("padText").value = "";
  nameText = "";
  padText = "";
  displayName.textContent = "";
  displayPad.textContent = "";
  
  // Reset text position
  updateTextPosition();
  
  showNotification("All settings have been reset");
  draw();
};

// 9. DRAW FUNCTION - Fixed: Text inside frame, no outside frame showing
function draw() {
  // Clear canvas
  ctx.clearRect(0, 0, SIZE, SIZE);
  
  // Apply border radius by creating a clipping path
  // This ensures nothing shows outside the frame
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
  } else {
    // Clip to canvas bounds (nothing outside)
    ctx.beginPath();
    ctx.rect(0, 0, SIZE, SIZE);
    ctx.clip();
  }
  
  // Draw background (transparent)
  ctx.fillStyle = "transparent";
  ctx.fillRect(0, 0, SIZE, SIZE);
  
  // Draw Photo - NO CUTTING, FULL PHOTO VISIBLE
  if (img) {
    ctx.save();
    
    // Apply brightness filter
    ctx.filter = `brightness(${brightness})`;
    
    // Calculate position to center the photo
    const centerX = SIZE / 2 + moveX;
    const centerY = SIZE / 2 + moveY;
    
    // Move to center, rotate, then draw
    ctx.translate(centerX, centerY);
    ctx.rotate(rotate * Math.PI / 180);
    
    // Calculate scaled dimensions
    const scaledWidth = img.width * zoom;
    const scaledHeight = img.height * zoom;
    
    // Draw photo centered at the transformation point
    ctx.drawImage(img, -scaledWidth / 2, -scaledHeight / 2, scaledWidth, scaledHeight);
    
    ctx.restore();
  }
  
  // Draw text on canvas (for download) - INSIDE FRAME ONLY
  if (nameText || padText) {
    ctx.save();
    
    // Set text properties
    ctx.fillStyle = textColor;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    
    // Calculate text position with offsets
    const baseNameY = SIZE - 150;
    const basePadY = SIZE - 80;
    
    const adjustedNameX = SIZE/2 + (textX * 2.5); // Scale for high-res canvas
    const adjustedNameY = baseNameY + (textY * 2.5);
    const adjustedPadX = SIZE/2 + (textX * 2.5);
    const adjustedPadY = basePadY + (textY * 2.5);
    
    // Draw name text
    if (nameText) {
      ctx.font = `bold ${textSize * 2}px 'Poppins', sans-serif`;
      ctx.shadowColor = "rgba(0, 0, 0, 0.8)";
      ctx.shadowBlur = 20;
      ctx.shadowOffsetX = 4;
      ctx.shadowOffsetY = 4;
      
      // Draw text with background for better readability
      ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
      const nameMetrics = ctx.measureText(nameText);
      const namePadding = 40;
      ctx.fillRect(
        adjustedNameX - nameMetrics.width/2 - namePadding, 
        adjustedNameY - textSize - 20, 
        nameMetrics.width + namePadding*2, 
        textSize * 2 + 40
      );
      
      // Draw actual text
      ctx.fillStyle = textColor;
      ctx.fillText(nameText, adjustedNameX, adjustedNameY);
    }
    
    // Draw pad text
    if (padText) {
      const padSize = textSize * 1.4;
      ctx.font = `600 ${padSize}px 'Poppins', sans-serif`;
      ctx.shadowColor = "rgba(0, 0, 0, 0.8)";
      ctx.shadowBlur = 15;
      ctx.shadowOffsetX = 3;
      ctx.shadowOffsetY = 3;
      
      // Draw text with background for better readability
      ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
      const padMetrics = ctx.measureText(padText);
      const padPadding = 30;
      ctx.fillRect(
        adjustedPadX - padMetrics.width/2 - padPadding, 
        adjustedPadY - padSize/2 - 16, 
        padMetrics.width + padPadding*2, 
        padSize + 32
      );
      
      // Draw actual text
      ctx.fillStyle = textColor;
      ctx.fillText(padText, adjustedPadX, adjustedPadY);
    }
    
    ctx.restore();
  }
  
  // Draw Frame on top - ONLY INSIDE THE CLIPPED AREA
  if (frameImg) {
    ctx.save();
    ctx.drawImage(frameImg, 0, 0, SIZE, SIZE);
    ctx.restore();
  }
}

// 10. Download
document.getElementById("download").onclick = function() {
  if (!img) {
    showNotification("Please select a photo first", "error");
    return;
  }
  
  // Create a temporary canvas for download (higher quality)
  const downloadCanvas = document.createElement("canvas");
  const downloadCtx = downloadCanvas.getContext("2d");
  
  // Set download canvas size (high quality)
  const downloadSize = 2048;
  downloadCanvas.width = downloadSize;
  downloadCanvas.height = downloadSize;
  
  // Scale everything for download
  const scale = downloadSize / SIZE;
  
  // Apply border radius to download canvas (clipping)
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
  } else {
    // Clip to canvas bounds
    downloadCtx.beginPath();
    downloadCtx.rect(0, 0, downloadSize, downloadSize);
    downloadCtx.clip();
  }
  
  // Draw background
  downloadCtx.fillStyle = "transparent";
  downloadCtx.fillRect(0, 0, downloadSize, downloadSize);
  
  // Draw photo on download canvas
  if (img) {
    downloadCtx.save();
    
    // Apply brightness filter
    downloadCtx.filter = `brightness(${brightness})`;
    
    // Scale transformations
    const scaledMoveX = moveX * scale;
    const scaledMoveY = moveY * scale;
    const centerX = downloadSize / 2 + scaledMoveX;
    const centerY = downloadSize / 2 + scaledMoveY;
    
    downloadCtx.translate(centerX, centerY);
    downloadCtx.rotate(rotate * Math.PI / 180);
    
    // Calculate scaled dimensions
    const scaledWidth = img.width * zoom * scale;
    const scaledHeight = img.height * zoom * scale;
    
    // Draw photo
    downloadCtx.drawImage(img, -scaledWidth / 2, -scaledHeight / 2, scaledWidth, scaledHeight);
    downloadCtx.restore();
  }
  
  // Draw text on download canvas - INSIDE FRAME ONLY
  if (nameText || padText) {
    downloadCtx.save();
    downloadCtx.fillStyle = textColor;
    downloadCtx.textAlign = "center";
    downloadCtx.textBaseline = "middle";
    
    // Calculate text position with offsets
    const baseNameY = downloadSize - 300 * scale;
    const basePadY = downloadSize - 160 * scale;
    
    const adjustedNameX = downloadSize/2 + (textX * 5 * scale);
    const adjustedNameY = baseNameY + (textY * 5 * scale);
    const adjustedPadX = downloadSize/2 + (textX * 5 * scale);
    const adjustedPadY = basePadY + (textY * 5 * scale);
    
    // Draw name text
    if (nameText) {
      const scaledTextSize = textSize * 2 * scale;
      downloadCtx.font = `bold ${scaledTextSize}px 'Poppins', sans-serif`;
      downloadCtx.shadowColor = "rgba(0, 0, 0, 0.8)";
      downloadCtx.shadowBlur = 30 * scale;
      downloadCtx.shadowOffsetX = 6 * scale;
      downloadCtx.shadowOffsetY = 6 * scale;
      
      // Draw text with background for better readability
      downloadCtx.fillStyle = "rgba(0, 0, 0, 0.4)";
      const nameMetrics = downloadCtx.measureText(nameText);
      const namePadding = 80 * scale;
      downloadCtx.fillRect(
        adjustedNameX - nameMetrics.width/2 - namePadding, 
        adjustedNameY - scaledTextSize/2 - 40 * scale, 
        nameMetrics.width + namePadding*2, 
        scaledTextSize + 80 * scale
      );
      
      // Draw actual text
      downloadCtx.fillStyle = textColor;
      downloadCtx.fillText(nameText, adjustedNameX, adjustedNameY);
    }
    
    // Draw pad text
    if (padText) {
      const scaledPadSize = textSize * 1.4 * scale;
      downloadCtx.font = `600 ${scaledPadSize}px 'Poppins', sans-serif`;
      downloadCtx.shadowColor = "rgba(0, 0, 0, 0.8)";
      downloadCtx.shadowBlur = 20 * scale;
      downloadCtx.shadowOffsetX = 4 * scale;
      downloadCtx.shadowOffsetY = 4 * scale;
      
      // Draw text with background for better readability
      downloadCtx.fillStyle = "rgba(0, 0, 0, 0.4)";
      const padMetrics = downloadCtx.measureText(padText);
      const padPadding = 60 * scale;
      downloadCtx.fillRect(
        adjustedPadX - padMetrics.width/2 - padPadding, 
        adjustedPadY - scaledPadSize/2 - 30 * scale, 
        padMetrics.width + padPadding*2, 
        scaledPadSize + 60 * scale
      );
      
      // Draw actual text
      downloadCtx.fillStyle = textColor;
      downloadCtx.fillText(padText, adjustedPadX, adjustedPadY);
    }
    
    downloadCtx.restore();
  }
  
  // Draw frame on download canvas - ONLY INSIDE CLIPPED AREA
  if (frameImg) {
    downloadCtx.drawImage(frameImg, 0, 0, downloadSize, downloadSize);
  }
  
  // Create download link
  const link = document.createElement("a");
  link.href = downloadCanvas.toDataURL("image/png", 1.0);
  link.download = "photo-frame-" + Date.now() + ".png";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  showNotification("Image downloaded successfully!");
};

// 11. Notification function
function showNotification(message, type = "success") {
  notificationText.textContent = message;
  notification.style.borderLeftColor = type === "error" ? "#f5576c" : "#43e97b";
  notification.style.display = "flex";
  
  setTimeout(() => {
    notification.style.display = "none";
  }, 3000);
}

// 12. Initialize UI
textColorPreview.style.backgroundColor = textColor;
textSizeValue.textContent = textSize;
textXValue.textContent = textX;
textYValue.textContent = textY;
zoomValue.textContent = zoom.toFixed(2);
rotateValue.textContent = `${rotate}°`;
moveXValue.textContent = moveX;
moveYValue.textContent = moveY;
borderRadiusValue.textContent = `${borderRadius}%`;
brightnessValue.textContent = brightness.toFixed(2);

// Initial draw
draw();

// Update text position on resize
window.addEventListener('resize', updateTextPosition);
