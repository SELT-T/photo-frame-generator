/* ================= MAIN FRAME LOGIC ================= */
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const SIZE = 1080; 
canvas.width = SIZE;
canvas.height = SIZE;

let img = null;
let frameImg = null;
let zoom = 1, rotate = 0, moveX = 0, moveY = 0;
let nameText = "";
let padText = "";

// Load Default Frame
const frame = new Image();
frame.src = "public/frame.png";
frame.onload = draw;
frameImg = frame;

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
        frameImg = new Image();
        frameImg.onload = draw;
        frameImg.src = URL.createObjectURL(e.target.files[0]);
    }
};

// 3. Name Text Input
document.getElementById("nameText").addEventListener("input", function() {
    nameText = this.value;
    draw();
});

// 4. Pad Text Input
document.getElementById("padText").addEventListener("input", function() {
    padText = this.value;
    draw();
});

// 5. Sliders Logic
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

// 6. Reset Button
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

// 7. DRAW FUNCTION - Photo pura dikhega, cut nahi hoga
function draw() {
    ctx.clearRect(0, 0, SIZE, SIZE);
    
    // White background
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, SIZE, SIZE);
    
    // Draw Photo WITHOUT CLIPPING - Full dikhega
    if (img) {
        ctx.save();
        ctx.translate(SIZE/2 + moveX, SIZE/2 + moveY);
        ctx.rotate(rotate * Math.PI / 180);
        
        // Pura photo draw hoga, sirf positioning change hogi
        let w = img.width * zoom;
        let h = img.height * zoom;
        ctx.drawImage(img, -w/2, -h/2, w, h);
        
        ctx.restore();
    }
    
    // Draw Name Text - Photo ke andar niche
    if (nameText) {
        ctx.save();
        ctx.font = "bold 70px Arial";
        ctx.fillStyle = "#ffffff";
        ctx.textAlign = "center";
        ctx.strokeStyle = "#000000";
        ctx.lineWidth = 4;
        ctx.strokeText(nameText, SIZE/2, SIZE - 150);
        ctx.fillText(nameText, SIZE/2, SIZE - 150);
        ctx.restore();
    }
    
    // Draw Pad Text - Photo ke andar aur niche
    if (padText) {
        ctx.save();
        ctx.font = "bold 50px Arial";
        ctx.fillStyle = "#ffffff";
        ctx.textAlign = "center";
        ctx.strokeStyle = "#000000";
        ctx.lineWidth = 3;
        ctx.strokeText(padText, SIZE/2, SIZE - 60);
        ctx.fillText(padText, SIZE/2, SIZE - 60);
        ctx.restore();
    }
    
    // Draw Frame on Top
    if (frameImg) {
        ctx.drawImage(frameImg, 0, 0, SIZE, SIZE);
    }
}

// 8. Download Button
document.getElementById("download").onclick = () => {
    const link = document.createElement("a");
    link.download = "photo-frame.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
};
