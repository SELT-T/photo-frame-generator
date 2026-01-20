const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const SIZE = 1080;
canvas.width = SIZE;
canvas.height = SIZE;

let img = null;
let zoom = 1, rotate = 0, moveX = 0, moveY = 0;
let nameText = "", padText = "";
let currentFrameType = "default";

// Load Default Frame
const frame = new Image();
frame.src = "public/frame.png";
frame.onload = draw;

// FRAME STYLES (SVG DATA URLs)
const frameStyles = {
  default: "public/frame.png",
  circle: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1080 1080'%3E%3Ccircle cx='540' cy='540' r='520' fill='none' stroke='%23FFD700' stroke-width='80'/%3E%3Ccircle cx='540' cy='540' r='450' fill='none' stroke='%23FFA500' stroke-width='20'/%3E%3C/svg%3E",
  gold: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1080 1080'%3E%3Crect x='60' y='60' width='960' height='960' fill='none' stroke='%23FFD700' stroke-width='100' rx='50'/%3E%3Crect x='120' y='120' width='840' height='840' fill='none' stroke='%23FFA500' stroke-width='15' rx='40'/%3E%3C/svg%3E",
  modern: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1080 1080'%3E%3Crect x='80' y='80' width='920' height='920' fill='none' stroke='%236366f1' stroke-width='60' rx='30'/%3E%3Cline x1='150' y1='150' x2='930' y2='150' stroke='%236366f1' stroke-width='10' opacity='0.5'/%3E%3Cline x1='150' y1='930' x2='930' y2='930' stroke='%236366f1' stroke-width='10' opacity='0.5'/%3E%3C/svg%3E"
};

// 1. Upload Photo
document.getElementById("upload").onchange = e => {
    if (e.target.files && e.target.files[0]) {
        img = new Image();
        img.onload = draw;
        img.src = URL.createObjectURL(e.target.files[0]);
    }
};

// 2. Upload Custom Frame
document.getElementById("uploadFrame").onchange = e => {
    if (e.target.files && e.target.files[0]) {
        frame.src = URL.createObjectURL(e.target.files[0]);
        frame.onload = draw;
    }
};

// 3. Frame Style Selector
document.querySelectorAll(".frame-btn").forEach(btn => {
    btn.addEventListener("click", function() {
        document.querySelectorAll(".frame-btn").forEach(b => b.classList.remove("active"));
        this.classList.add("active");
        currentFrameType = this.dataset.frame;
        frame.src = frameStyles[currentFrameType];
        frame.onload = draw;
    });
});

// 4. Name aur Pad Input
document.getElementById("nameText").addEventListener("input", function() {
    nameText = this.value;
    draw();
});

document.getElementById("padText").addEventListener("input", function() {
    padText = this.value;
    draw();
});

// 5. Sliders
function updateVal(id) {
    return parseFloat(document.getElementById(id).value);
}

["zoom", "rotate", "moveX", "moveY"].forEach(id => {
    document.getElementById(id).addEventListener("input", () => {
        zoom = updateVal("zoom");
        rotate = updateVal("rotate");
        moveX = updateVal("moveX");
        moveY = updateVal("moveY");
        draw();
    });
});

// 6. Reset
document.getElementById("reset").onclick = () => {
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

// 7. DRAW FUNCTION - Photo nahi katega, sirf zoom/move
function draw() {
    ctx.clearRect(0, 0, SIZE, SIZE);
    
    // Draw photo with transform but NO CLIPPING
    if (img) {
        ctx.save();
        ctx.translate(SIZE/2 + moveX, SIZE/2 + moveY);
        ctx.rotate(rotate * Math.PI / 180);
        
        // Original image dimensions ko respect karte hue draw
        let aspectRatio = img.width / img.height;
        let displayHeight = SIZE * zoom * 0.65;
        let displayWidth = displayHeight * aspectRatio;
        
        ctx.drawImage(img, -displayWidth/2, -displayHeight/2, displayWidth, displayHeight);
        
        ctx.restore();
    }
    
    // Draw Name Text - Frame ke andar niche side me
    if (nameText) {
        ctx.save();
        ctx.font = "bold 85px Arial";
        ctx.fillStyle = "#FFFFFF";
        ctx.textAlign = "center";
        ctx.strokeStyle = "#000000";
        ctx.lineWidth = 5;
        ctx.strokeText(nameText, SIZE/2, SIZE - 150);
        ctx.fillText(nameText, SIZE/2, SIZE - 150);
        ctx.restore();
    }
    
    // Draw Pad Text - Name ke niche
    if (padText) {
        ctx.save();
        ctx.font = "bold 65px Arial";
        ctx.fillStyle = "#FFFFFF";
        ctx.textAlign = "center";
        ctx.strokeStyle = "#000000";
        ctx.lineWidth = 4;
        ctx.strokeText(padText, SIZE/2, SIZE - 50);
        ctx.fillText(padText, SIZE/2, SIZE - 50);
        ctx.restore();
    }
    
    // Draw Frame on Top - sabse last
    ctx.drawImage(frame, 0, 0, SIZE, SIZE);
}

// 8. Download
document.getElementById("download").onclick = () => {
    const link = document.createElement("a");
    link.download = "photo-frame-" + new Date().getTime() + ".png";
    link.href = canvas.toDataURL("image/png");
    link.click();
};
