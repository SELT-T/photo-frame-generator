/* ================= MAIN FRAME LOGIC ================= */

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

// HIGH QUALITY SIZE
const SIZE = 1080; 
canvas.width = SIZE;
canvas.height = SIZE;

let img = null;
let zoom = 1, rotate = 0, moveX = 0, moveY = 0;

// Load Default Frame
const frame = new Image();
// Ensure 'public/frame.png' exists
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

// 3. Sliders Logic
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

// 4. Reset Button
document.getElementById("reset").onclick = () => {
    zoom = 1; rotate = 0; moveX = 0; moveY = 0;
    
    document.getElementById("zoom").value = 1;
    document.getElementById("rotate").value = 0;
    document.getElementById("moveX").value = 0;
    document.getElementById("moveY").value = 0;
    draw();
};

// 5. DRAW FUNCTION (Your Perfect Logic)
function draw() {
    ctx.clearRect(0, 0, SIZE, SIZE);

    // Draw Photo with Clip
    if (img) {
        ctx.save();
        ctx.translate(SIZE/2 + moveX, SIZE/2 + moveY);
        ctx.rotate(rotate * Math.PI / 180);
        
        ctx.beginPath();
        // Circle Clip Radius
        ctx.arc(0, 0, (SIZE / 2.8) * zoom, 0, Math.PI * 2);
        ctx.clip();
        
        // Fill Image
        let w = SIZE * zoom;
        let h = SIZE * zoom;
        ctx.drawImage(img, -w/2, -h/2, w, h);
        
        ctx.restore();
    }

    // Draw Frame on Top
    ctx.drawImage(frame, 0, 0, SIZE, SIZE);
}

// 6. Download Button
document.getElementById("download").onclick = () => {
    const link = document.createElement("a");
    link.download = "underwater-frame.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
};

// Note: No background animation code needed here. 
// The Video in HTML handles everything automatically.