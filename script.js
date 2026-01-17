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

// 3. Name aur Pad Input
document.getElementById("nameText").addEventListener("input", function() {
    nameText = this.value;
    draw();
});

document.getElementById("padText").addEventListener("input", function() {
    padText = this.value;
    draw();
});

// 4. Sliders
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

// 5. Reset
document.getElementById("reset").onclick = () => {
    zoom = 1; rotate = 0; moveX = 0; moveY = 0;
    nameText = ""; padText = "";
    
    document.getElementById("zoom").value = 1;
    document.getElementById("rotate").value = 0;
    document.getElementById("moveX").value = 0;
    document.getElementById("moveY").value = 0;
    document.getElementById("nameText").value = "";
    document.getElementById("padText").value = "";
    draw();
};

// 6. DRAW FUNCTION - Photo nahi katega
function draw() {
    ctx.clearRect(0, 0, SIZE, SIZE);
    
    // Draw photo with transform but NO CLIPPING
    if (img) {
        ctx.save();
        ctx.translate(SIZE/2 + moveX, SIZE/2 + moveY);
        ctx.rotate(rotate * Math.PI / 180);
        
        // Original image dimensions ko respect karte hue draw
        let aspectRatio = img.width / img.height;
        let displayHeight = SIZE * zoom;
        let displayWidth = displayHeight * aspectRatio;
        
        ctx.drawImage(img, -displayWidth/2, -displayHeight/2, displayWidth, displayHeight);
        
        ctx.restore();
    }
    
    // Draw Name Text - Niche photo ke
    if (nameText) {
        ctx.save();
        ctx.font = "bold 90px Arial";
        ctx.fillStyle = "#FFFFFF";
        ctx.textAlign = "center";
        ctx.strokeStyle = "#000000";
        ctx.lineWidth = 4;
        ctx.strokeText(nameText, SIZE/2, SIZE - 140);
        ctx.fillText(nameText, SIZE/2, SIZE - 140);
        ctx.restore();
    }
    
    // Draw Pad Text - Aur niche
    if (padText) {
        ctx.save();
        ctx.font = "bold 60px Arial";
        ctx.fillStyle = "#FFFFFF";
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

// 7. Download
document.getElementById("download").onclick = () => {
    const link = document.createElement("a");
    link.download = "photo-frame.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
};
