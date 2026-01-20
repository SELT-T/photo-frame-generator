const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const SIZE = 1024;
canvas.width = SIZE;
canvas.height = SIZE;

// Variables with smooth animation support
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

// Animation variables
let isDrawing = false;
let animationFrame = null;
let lastRenderTime = 0;

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
const tabButtons = document.querySelectorAll(".tab-btn");
const tabPanes = document.querySelectorAll(".tab-pane");

// Create default circular frame if not found
function createDefaultFrame() {
  const frameCanvas = document.createElement('canvas');
  frameCanvas.width = SIZE;
  frameCanvas.height = SIZE;
  const frameCtx = frameCanvas.getContext('2d');
  
  // Create circular clipping
  frameCtx.beginPath();
  frameCtx.arc(SIZE/2, SIZE/2, SIZE/2 - 10, 0, Math.PI * 2);
  frameCtx.clip();
  
  // Decorative circular border with gradient
  const gradient = frameCtx.createLinearGradient(0, 0, SIZE, SIZE);
  gradient.addColorStop(0, 'rgba(102, 166, 255, 0.8)');
  gradient.addColorStop(0.5, 'rgba(137, 247, 254, 0.8)');
  gradient.addColorStop(1, 'rgba(102, 166, 255, 0.8)');
  
  frameCtx.strokeStyle = gradient;
  frameCtx.lineWidth = 30;
  frameCtx.beginPath();
  frameCtx.arc(SIZE/2, SIZE/2, SIZE/2 - 25, 0, Math.PI * 2);
  frameCtx.stroke();
  
  // Inner glow
  frameCtx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
  frameCtx.lineWidth = 15;
  frameCtx.beginPath();
  frameCtx.arc(SIZE/2, SIZE/2, SIZE/2 - 45, 0, Math.PI * 2);
  frameCtx.stroke();
  
  // Convert to image
  frameImg = new Image();
  frameImg.src = frameCanvas.toDataURL();
  frameImg.onload = () => requestAnimationFrame(draw);
}

// Load default frame
frameImg = new Image();
frameImg.crossOrigin = "anonymous";
frameImg.src = "frame.png";
frameImg.onload = () => requestAnimationFrame(draw);
frameImg.onerror = createDefaultFrame;

// Smooth value updater with animation
function updateValueWithAnimation(element, value, format = (v) => v) {
  const current = parseFloat(element.textContent.replace(/[^\d.-]/g, ''));
  const target = value;
  const diff = target - current;
  
  if (Math.abs(diff) < 0.1) {
    element.textContent = format(target);
    return;
  }
  
  const step = diff * 0.1;
  element.textContent = format(current + step);
  
  requestAnimationFrame(() => updateValueWithAnimation(element, target, format));
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
      // Auto-adjust zoom for optimal fit
      const scaleX = SIZE / img.width;
      const scaleY = SIZE / img.height;
      zoom = Math.min(scaleX, scaleY) * 0.9;
      
      // Smooth transition to new zoom
      let currentZoom = parseFloat(zoomSlider.value);
      const zoomStep = (zoom - currentZoom) / 10;
      
      function animateZoom() {
        currentZoom += zoomStep;
        zoomSlider.value = currentZoom;
        updateValueWithAnimation(zoomValue, currentZoom, v => v.toFixed(2));
        draw();
        
        if (Math.abs(zoom - currentZoom) > 0.01) {
          requestAnimationFrame(animateZoom);
        }
      }
      animateZoom();
      
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
    frameImg.onload = () => requestAnimationFrame(draw);
  }
};

// 3. Name Input
document.getElementById("nameText").oninput = function() {
  nameText = this.value.trim();
  requestAnimationFrame(draw);
};

// 4. Pad Input
document.getElementById("padText").oninput = function() {
  padText = this.value.trim();
  requestAnimationFrame(draw);
};

// 5. Text Position Controls
textXSlider.oninput = function() {
  textX = parseFloat(this.value);
  updateValueWithAnimation(textXValue, textX);
  requestAnimationFrame(draw);
};

textYSlider.oninput = function() {
  textY = parseFloat(this.value);
  updateValueWithAnimation(textYValue, textY);
  requestAnimationFrame(draw);
};

// 6. Photo Controls
zoomSlider.oninput = function() {
  zoom = parseFloat(this.value);
  updateValueWithAnimation(zoomValue, zoom, v => v.toFixed(2));
  requestAnimationFrame(draw);
};

rotateSlider.oninput = function() {
  rotate = parseFloat(this.value);
  updateValueWithAnimation(rotateValue, rotate, v => `${Math.round(v)}°`);
  requestAnimationFrame(draw);
};

moveXSlider.oninput = function() {
  moveX = parseFloat(this.value);
  updateValueWithAnimation(moveXValue, moveX, v => Math.round(v));
  requestAnimationFrame(draw);
};

moveYSlider.oninput = function() {
  moveY = parseFloat(this.value);
  updateValueWithAnimation(moveYValue, moveY, v => Math.round(v));
  requestAnimationFrame(draw);
};

// 7. Font Controls
fontSizeSlider.oninput = function() {
  fontSize = parseInt(this.value);
  updateValueWithAnimation(fontSizeValue, fontSize);
  requestAnimationFrame(draw);
};

fontColorPicker.oninput = function() {
  fontColor = this.value;
  fontColorPreview.style.backgroundColor = fontColor;
  requestAnimationFrame(draw);
};

borderColorPicker.oninput = function() {
  borderColor = this.value;
  borderColorPreview.style.backgroundColor = borderColor;
  requestAnimationFrame(draw);
};

borderSizeSlider.oninput = function() {
  borderSize = parseInt(this.value);
  updateValueWithAnimation(borderSizeValue, borderSize, v => `${v}px`);
  requestAnimationFrame(draw);
};

fontFamilySelect.onchange = function() {
  fontFamily = this.value;
  requestAnimationFrame(draw);
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
    
    // Smooth button animation
    this.style.transform = "scale(0.95)";
    setTimeout(() => {
      this.style.transform = "";
    }, 150);
    
    requestAnimationFrame(draw);
  });
});

// Tab Switching with smooth animation
tabButtons.forEach(btn => {
  btn.addEventListener("click", function() {
    const tabId = this.getAttribute("data-tab");
    
    // Smooth transition
    tabButtons.forEach(b => {
      b.style.transform = "scale(0.95)";
      b.style.opacity = "0.8";
      b.classList.remove("active");
      setTimeout(() => {
        b.style.transform = "";
        b.style.opacity = "";
      }, 200);
    });
    
    this.classList.add("active");
    
    // Show corresponding tab pane with animation
    tabPanes.forEach(pane => {
      pane.style.opacity = "0";
      pane.style.transform = "translateY(10px)";
      pane.classList.remove("active");
      
      if (pane.id === `${tabId}-tab`) {
        setTimeout(() => {
          pane.classList.add("active");
          pane.style.opacity = "1";
          pane.style.transform = "translateY(0)";
        }, 50);
      }
    });
  });
});

// 8. Reset Function with smooth animation
document.getElementById("reset").onclick = function() {
  // Button press animation
  this.style.transform = "scale(0.95)";
  setTimeout(() => this.style.transform = "", 200);
  
  // Smoothly reset all values
  const resetValues = [
    { element: zoomSlider, target: 1, current: zoom, step: (1 - zoom) / 20 },
    { element: rotateSlider, target: 0, current: rotate, step: (0 - rotate) / 20 },
    { element: moveXSlider, target: 0, current: moveX, step: (0 - moveX) / 20 },
    { element: moveYSlider, target: 0, current: moveY, step: (0 - moveY) / 20 },
    { element: textXSlider, target: 0, current: textX, step: (0 - textX) / 20 },
    { element: textYSlider, target: 0, current: textY, step: (0 - textY) / 20 },
    { element: fontSizeSlider, target: 40, current: fontSize, step: (40 - fontSize) / 20 }
  ];
  
  function animateReset() {
    let allDone = true;
    
    resetValues.forEach(item => {
      if (Math.abs(item.current - item.target) > 0.1) {
        item.current += item.step;
        item.element.value = item.current;
        allDone = false;
      }
    });
    
    // Update display values
    zoom = parseFloat(zoomSlider.value);
    rotate = parseFloat(rotateSlider.value);
    moveX = parseFloat(moveXSlider.value);
    moveY = parseFloat(moveYSlider.value);
    textX = parseFloat(textXSlider.value);
    textY = parseFloat(textYSlider.value);
    fontSize = parseInt(fontSizeSlider.value);
    
    zoomValue.textContent = zoom.toFixed(2);
    rotateValue.textContent = `${Math.round(rotate)}°`;
    moveXValue.textContent = Math.round(moveX);
    moveYValue.textContent = Math.round(moveY);
    textXValue.textContent = Math.round(textX);
    textYValue.textContent = Math.round(textY);
    fontSizeValue.textContent = fontSize;
    
    draw();
    
    if (!allDone) {
      requestAnimationFrame(animateReset);
    } else {
      // Final reset
      nameText = "";
      padText = "";
      fontColor = "#ffffff";
      borderColor = "#000000";
      borderSize = 3;
      fontFamily = "'Poppins', sans-serif";
      fontStyle = "normal";
      fontWeight = "normal";
      
      document.getElementById("nameText").value = "";
      document.getElementById("padText").value = "";
      fontColorPicker.value = fontColor;
      borderColorPicker.value = borderColor;
      borderSizeSlider.value = borderSize;
      fontFamilySelect.value = fontFamily;
      fontColorPreview.style.backgroundColor = fontColor;
      borderColorPreview.style.backgroundColor = borderColor;
      borderSizeValue.textContent = `${borderSize}px`;
      
      styleButtons.forEach(btn => btn.classList.remove("active"));
      
      // Switch to text tab
      tabButtons.forEach(b => b.classList.remove("active"));
      tabButtons[0].classList.add("active");
      tabPanes.forEach(pane => pane.classList.remove("active"));
      document.getElementById("text-tab").classList.add("active");
    }
  }
  
  animateReset();
};

// 9. Optimized DRAW FUNCTION
function draw(timestamp) {
  if (!timestamp) timestamp = performance.now();
  
  // Throttle drawing to 60fps
  if (timestamp - lastRenderTime < 16) {
    animationFrame = requestAnimationFrame(draw);
    return;
  }
  lastRenderTime = timestamp;
  
  // Clear with fade effect
  ctx.clearRect(0, 0, SIZE, SIZE);
  
  // Circular clipping
  ctx.save();
  ctx.beginPath();
  ctx.arc(SIZE/2, SIZE/2, SIZE/2 - 5, 0, Math.PI * 2);
  ctx.clip();
  
  // White background
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, SIZE, SIZE);
  
  // Draw Photo with smooth transformations
  if (img) {
    ctx.save();
    
    ctx.translate(SIZE/2 + moveX, SIZE/2 + moveY);
    ctx.rotate(rotate * Math.PI / 180);
    
    const w = img.width * zoom;
    const h = img.height * zoom;
    
    // Smooth anti-aliasing
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    
    ctx.drawImage(img, -w/2, -h/2, w, h);
    
    ctx.restore();
  }
  
  // Draw Text with border/outline
  if (nameText || padText) {
    ctx.save();
    
    // Build font string
    const fontStyleStr = fontStyle === "italic" ? "italic" : "normal";
    const fontWeightStr = fontWeight === "bold" ? "bold" : "normal";
    const fontSizeScaled = fontSize * 2;
    
    ctx.font = `${fontStyleStr} ${fontWeightStr} ${fontSizeScaled}px ${fontFamily}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    
    // Calculate text position
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
  
  animationFrame = null;
}

// 10. Download with loading animation
document.getElementById("download").onclick = function() {
  if (!img) {
    alert("Please select a photo first!");
    return;
  }
  
  // Button animation
  const originalHTML = this.innerHTML;
  this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
  this.disabled = true;
  
  // Create high-quality download canvas
  setTimeout(() => {
    const downloadCanvas = document.createElement("canvas");
    const downloadCtx = downloadCanvas.getContext("2d");
    
    const downloadSize = 2048;
    downloadCanvas.width = downloadSize;
    downloadCanvas.height = downloadSize;
    
    // Scale factor
    const scale = downloadSize / SIZE;
    
    // Circular clipping for download
    downloadCtx.save();
    downloadCtx.beginPath();
    downloadCtx.arc(downloadSize/2, downloadSize/2, downloadSize/2 - 5, 0, Math.PI * 2);
    downloadCtx.clip();
    
    // White background
    downloadCtx.fillStyle = "#ffffff";
    downloadCtx.fillRect(0, 0, downloadSize, downloadSize);
    
    // Draw photo
    if (img) {
      downloadCtx.save();
      
      const scaledMoveX = moveX * scale;
      const scaledMoveY = moveY * scale;
      const centerX = downloadSize/2 + scaledMoveX;
      const centerY = downloadSize/2 + scaledMoveY;
      
      downloadCtx.translate(centerX, centerY);
      downloadCtx.rotate(rotate * Math.PI / 180);
      
      const scaledWidth = img.width * zoom * scale;
      const scaledHeight = img.height * zoom * scale;
      
      downloadCtx.drawImage(img, -scaledWidth/2, -scaledHeight/2, scaledWidth, scaledHeight);
      downloadCtx.restore();
    }
    
    // Draw text for download
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
      
      // Draw Name
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
      
      // Draw Pad
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
    
    // Draw frame
    if (frameImg) {
      downloadCtx.save();
      downloadCtx.beginPath();
      downloadCtx.arc(downloadSize/2, downloadSize/2, downloadSize/2, 0, Math.PI * 2);
      downloadCtx.clip();
      downloadCtx.drawImage(frameImg, 0, 0, downloadSize, downloadSize);
      downloadCtx.restore();
    }
    
    // Create download
    const link = document.createElement("a");
    link.href = downloadCanvas.toDataURL("image/png", 1.0);
    link.download = `photo-frame-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Reset button
    this.innerHTML = originalHTML;
    this.disabled = false;
    
    // Success animation
    this.style.background = "linear-gradient(135deg, #4cd964, #5ac8fa)";
    setTimeout(() => {
      this.style.background = "";
    }, 1000);
    
  }, 300);
};

// 11. Initialize
fontColorPreview.style.backgroundColor = fontColor;
borderColorPreview.style.backgroundColor = borderColor;
updateValueWithAnimation(zoomValue, zoom, v => v.toFixed(2));
updateValueWithAnimation(rotateValue, rotate, v => `${Math.round(v)}°`);
updateValueWithAnimation(moveXValue, moveX, v => Math.round(v));
updateValueWithAnimation(moveYValue, moveY, v => Math.round(v));
updateValueWithAnimation(textXValue, textX, v => Math.round(v));
updateValueWithAnimation(textYValue, textY, v => Math.round(v));
updateValueWithAnimation(fontSizeValue, fontSize);
updateValueWithAnimation(borderSizeValue, borderSize, v => `${v}px`);

// Smooth initial animation
setTimeout(() => {
  document.querySelector('.app-container').style.opacity = "1";
  document.querySelector('.app-container').style.transform = "translateY(0)";
}, 100);

// Initial draw
requestAnimationFrame(draw);

// Optimize performance
window.addEventListener('blur', () => {
  if (animationFrame) {
    cancelAnimationFrame(animationFrame);
    animationFrame = null;
  }
});

window.addEventListener('focus', () => {
  if (!animationFrame) {
    requestAnimationFrame(draw);
  }
});
