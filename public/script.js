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
let textSize = 40, textColor = "#ffffff";
let borderRadius = 0, brightness = 1;

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
const toggleOptions = document.getElementById("toggleOptions");
const advancedControls = document.getElementById("advancedControls");
const notification = document.getElementById("notification");
const notificationText = document.getElementById("notificationText");

// Load default frame
frameImg = new Image();
frameImg.crossOrigin = "anonymous";
frameImg.src = "frame.png"; // Default frame
frameImg.onload = () => {
  showNotification("Frame loaded successfully!");
  draw();
};

// If default frame fails, create a simple frame
frameImg.onerror = () => {
  console.log("Default frame not found, using generated frame");
  frameImg = null;
  draw();
};

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
      zoom = Math.min(scaleX, scaleY) * 0.8; // 80% of fit to allow some margin
      
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
  
  showNotification("All settings have been reset");
  draw();
};

// 9. DRAW FUNCTION - PHOTO WILL NOT BE CUT
function draw() {
  // Clear canvas
  ctx.clearRect(0, 0, SIZE, SIZE);
  
  // Apply border radius by creating a clipping path
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
    // This ensures the photo is not cut - it can extend beyond canvas bounds
    ctx.drawImage(img, -scaledWidth / 2, -scaledHeight / 2, scaledWidth, scaledHeight);
    
    ctx.restore();
  }
  
  // Draw Frame on top
  if (frameImg) {
    ctx.save();
    ctx.drawImage(frameImg, 0, 0, SIZE, SIZE);
    ctx.restore();
  }
  
  // Draw text on canvas (for download)
  if (nameText || padText) {
    ctx.save();
    
    // Set text properties
    ctx.fillStyle = textColor;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    
    // Draw name text
    if (nameText) {
      ctx.font = `bold ${textSize}px 'Poppins', sans-serif`;
      ctx.shadowColor = "rgba(0, 0, 0, 0.8)";
      ctx.shadowBlur = 10;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;
      
      // Draw text with background for better readability
      ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
      const nameMetrics = ctx.measureText(nameText);
      const namePadding = 20;
      ctx.fillRect(
        SIZE/2 - nameMetrics.width/2 - namePadding, 
        SIZE - 150 - textSize/2 - 10, 
        nameMetrics.width + namePadding*2, 
        textSize + 20
      );
      
      // Draw actual text
      ctx.fillStyle = textColor;
      ctx.fillText(nameText, SIZE/2, SIZE - 150);
    }
    
    // Draw pad text
    if (padText) {
      const padSize = textSize * 0.7;
      ctx.font = `600 ${padSize}px 'Poppins', sans-serif`;
      ctx.shadowColor = "rgba(0, 0, 0, 0.8)";
      ctx.shadowBlur = 8;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;
      
      // Draw text with background for better readability
      ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
      const padMetrics = ctx.measureText(padText);
      const padPadding = 15;
      ctx.fillRect(
        SIZE/2 - padMetrics.width/2 - padPadding, 
        SIZE - 80 - padSize/2 - 8, 
        padMetrics.width + padPadding*2, 
        padSize + 16
      );
      
      // Draw actual text
      ctx.fillStyle = textColor;
      ctx.fillText(padText, SIZE/2, SIZE - 80);
    }
    
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
  
  // Apply border radius to download canvas
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
  
  // Draw frame on download canvas
  if (frameImg) {
    downloadCtx.drawImage(frameImg, 0, 0, downloadSize, downloadSize);
  }
  
  // Draw text on download canvas
  if (nameText || padText) {
    downloadCtx.save();
    downloadCtx.fillStyle = textColor;
    downloadCtx.textAlign = "center";
    downloadCtx.textBaseline = "middle";
    
    // Draw name text
    if (nameText) {
      const scaledTextSize = textSize * scale;
      downloadCtx.font = `bold ${scaledTextSize}px 'Poppins', sans-serif`;
      downloadCtx.shadowColor = "rgba(0, 0, 0, 0.8)";
      downloadCtx.shadowBlur = 15 * scale;
      downloadCtx.shadowOffsetX = 3 * scale;
      downloadCtx.shadowOffsetY = 3 * scale;
      
      // Draw text with background for better readability
      downloadCtx.fillStyle = "rgba(0, 0, 0, 0.4)";
      const nameMetrics = downloadCtx.measureText(nameText);
      const namePadding = 25 * scale;
      downloadCtx.fillRect(
        downloadSize/2 - nameMetrics.width/2 - namePadding, 
        downloadSize - 300 * scale - scaledTextSize/2 - 15 * scale, 
        nameMetrics.width + namePadding*2, 
        scaledTextSize + 30 * scale
      );
      
      // Draw actual text
      downloadCtx.fillStyle = textColor;
      downloadCtx.fillText(nameText, downloadSize/2, downloadSize - 300 * scale);
    }
    
    // Draw pad text
    if (padText) {
      const scaledPadSize = textSize * 0.7 * scale;
      downloadCtx.font = `600 ${scaledPadSize}px 'Poppins', sans-serif`;
      downloadCtx.shadowColor = "rgba(0, 0, 0, 0.8)";
      downloadCtx.shadowBlur = 12 * scale;
      downloadCtx.shadowOffsetX = 2 * scale;
      downloadCtx.shadowOffsetY = 2 * scale;
      
      // Draw text with background for better readability
      downloadCtx.fillStyle = "rgba(0, 0, 0, 0.4)";
      const padMetrics = downloadCtx.measureText(padText);
      const padPadding = 20 * scale;
      downloadCtx.fillRect(
        downloadSize/2 - padMetrics.width/2 - padPadding, 
        downloadSize - 160 * scale - scaledPadSize/2 - 12 * scale, 
        padMetrics.width + padPadding*2, 
        scaledPadSize + 24 * scale
      );
      
      // Draw actual text
      downloadCtx.fillStyle = textColor;
      downloadCtx.fillText(padText, downloadSize/2, downloadSize - 160 * scale);
    }
    
    downloadCtx.restore();
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

// 11. Share button
document.getElementById("share").onclick = function() {
  if (!img) {
    showNotification("Please select a photo first", "error");
    return;
  }
  
  if (navigator.share) {
    canvas.toBlob(function(blob) {
      const file = new File([blob], 'photo-frame.png', { type: 'image/png' });
      
      navigator.share({
        files: [file],
        title: 'My Photo Frame',
        text: 'Check out this photo frame I created!'
      })
      .then(() => showNotification("Image shared successfully!"))
      .catch(error => {
        if (error.name !== 'AbortError') {
          showNotification("Sharing cancelled or failed", "error");
        }
      });
    });
  } else {
    showNotification("Sharing is not supported in your browser", "error");
  }
};

// 12. Notification function
function showNotification(message, type = "success") {
  notificationText.textContent = message;
  notification.style.borderLeftColor = type === "error" ? "#f5576c" : "#43e97b";
  notification.style.display = "flex";
  
  setTimeout(() => {
    notification.style.display = "none";
  }, 3000);
}

// 13. Initialize UI
textColorPreview.style.backgroundColor = textColor;
textSizeValue.textContent = textSize;
zoomValue.textContent = zoom.toFixed(2);
rotateValue.textContent = `${rotate}°`;
moveXValue.textContent = moveX;
moveYValue.textContent = moveY;
borderRadiusValue.textContent = `${borderRadius}%`;
brightnessValue.textContent = brightness.toFixed(2);

// Initial draw
draw();

// 14. Make sure photo is not cut on window resize
window.addEventListener('resize', draw);
