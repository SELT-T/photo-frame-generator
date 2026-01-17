const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const SIZE = 1080; 
canvas.width = SIZE;
canvas.height = SIZE;

let img = null;
let zoom = 1, rotate = 0, moveX = 0, moveY = 0;
let nameText = "", padText = "";

// Load Default Frame
const frame = new Image();
frame.src = "public/frame.png";
frame.onload = draw;

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
    }
};

// 3. Name Input
document.getElementById("nameText").addEventListener("input", function() {
    nameText = this.value;
    draw();
});

// 4. Pad Input
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

// 7. DRAW FUNCTION
function draw() {
    ctx.clearRect(0, 0, SIZE, SIZE);
    
    // White background
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, SIZE, SIZE);
    
    // Draw Image - Photo pura dikhega, nahi katega
    if (img) {
        ctx.save();
        ctx.translate(SIZE/2 + moveX, SIZE/2 + moveY);
        ctx.rotate(rotate * Math.PI / 180);
        
        // Image ko original aspect ratio me display karna
        const imgAspectRatio = img.width / img.height;
        let drawWidth = SIZE * zoom;
        let drawHeight = drawWidth / imgAspectRatio;
        
        // Agar height zyada ho gyi to width adjust kar
        if (drawHeight > SIZE * zoom) {
            drawHeight = SIZE * zoom;
            drawWidth = drawHeight * imgAspectRatio;
        }
        
        ctx.drawImage(img, -drawWidth/2, -drawHeight/2, drawWidth, drawHeight);
        ctx.restore();
    }
    
    // Name Text - Niche likha hoga
    if (nameText) {
        ctx.save();
        ctx.font = "bold 80px Arial";
        ctx.fillStyle = "#ffffff";
        ctx.textAlign = "center";
        ctx.strokeStyle = "#000000";
        ctx.lineWidth = 4;
        ctx.strokeText(nameText, SIZE/2, SIZE - 140);
        ctx.fillText(nameText, SIZE/2, SIZE - 140);
        ctx.restore();
    }
    
    // Pad Text - Aur niche
    if (padText) {
        ctx.save();
        ctx.font = "bold 60px Arial";
        ctx.fillStyle = "#ffffff";
        ctx.textAlign = "center";
        ctx.strokeStyle = "#000000";
        ctx.lineWidth = 3;
        ctx.strokeText(padText, SIZE/2, SIZE - 50);
        ctx.fillText(padText, SIZE/2, SIZE - 50);
        ctx.restore();
    }
    
    // Draw Frame on Top
    ctx.drawImage(frame, 0, 0, SIZE, SIZE);
}

// 8. Download
document.getElementById("download").onclick = () => {
    const link = document.createElement("a");
    link.download = "photo-frame.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
};
