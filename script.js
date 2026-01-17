const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

// High Quality Output Size
const SIZE = 1080;
canvas.width = SIZE;
canvas.height = SIZE;

let userImg = null;
let frameImg = new Image();

// Default Frame (Yaha apna frame ka path sahi karein)
frameImg.src = "frame.png"; // Ya public/frame.png
frameImg.onload = draw;

// Variables
let zoom = 1, rotate = 0, moveX = 0, moveY = 0, textY = 0;
let nameText = "", padText = "";

// 1. Upload Photo (Auto Fit Logic)
document.getElementById("upload").onchange = function(e) {
    if (e.target.files && e.target.files[0]) {
        let reader = new FileReader();
        reader.onload = function(event) {
            userImg = new Image();
            userImg.onload = function() {
                // PHOTO FIT LOGIC:
                // Photo ko itna chhota karo ki wo frame me puri dikhe shuru me
                let scale = Math.min(SIZE / userImg.width, SIZE / userImg.height);
                zoom = scale * 0.8; // Thoda aur chhota taaki adjust karne ki jagah mile
                
                // Reset controls
                document.getElementById("zoom").value = zoom;
                document.getElementById("rotate").value = 0;
                document.getElementById("moveX").value = 0;
                document.getElementById("moveY").value = 0;
                rotate = 0; moveX = 0; moveY = 0;
                
                draw();
            }
            userImg.src = event.target.result;
        }
        reader.readAsDataURL(e.target.files[0]);
    }
};

// 2. Upload Frame
document.getElementById("uploadFrame").onchange = function(e) {
    if (e.target.files && e.target.files[0]) {
        let reader = new FileReader();
        reader.onload = function(event) {
            frameImg.src = event.target.result;
        }
        reader.readAsDataURL(e.target.files[0]);
    }
};

// 3. Inputs & Sliders Event Listeners
document.getElementById("nameText").addEventListener("input", function() {
    nameText = this.value; draw();
});
document.getElementById("padText").addEventListener("input", function() {
    padText = this.value; draw();
});

["zoom", "rotate", "moveX", "moveY", "textY"].forEach(id => {
    document.getElementById(id).addEventListener("input", function() {
        if(id === "zoom") zoom = parseFloat(this.value);
        if(id === "rotate") rotate = parseInt(this.value);
        if(id === "moveX") moveX = parseInt(this.value);
        if(id === "moveY") moveY = parseInt(this.value);
        if(id === "textY") textY = parseInt(this.value);
        draw();
    });
});

document.getElementById("reset").onclick = function() {
    zoom = 1; rotate = 0; moveX = 0; moveY = 0; textY = 0;
    nameText = ""; padText = "";
    document.getElementById("nameText").value = "";
    document.getElementById("padText").value = "";
    // Reset range inputs visually
    document.getElementById("zoom").value = 1;
    document.getElementById("rotate").value = 0;
    document.getElementById("moveX").value = 0;
    document.getElementById("moveY").value = 0;
    document.getElementById("textY").value = 0;
    draw();
};

// 4. MAIN DRAWING FUNCTION
function draw() {
    // Clear Screen
    ctx.clearRect(0, 0, SIZE, SIZE);
    
    // Background White
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, SIZE, SIZE);

    // A. Draw User Photo
    if (userImg) {
        ctx.save();
        ctx.translate(SIZE/2 + moveX, SIZE/2 + moveY); // Center point + movement
        ctx.rotate(rotate * Math.PI / 180);
        ctx.scale(zoom, zoom);
        // Draw image centered
        ctx.drawImage(userImg, -userImg.width/2, -userImg.height/2);
        ctx.restore();
    }

    // B. Draw Frame (Frame hamesha upar)
    if (frameImg) {
        ctx.drawImage(frameImg, 0, 0, SIZE, SIZE);
    }

    // C. Draw Text
    if (nameText || padText) {
        ctx.save();
        ctx.textAlign = "center";
        
        let basePath = SIZE - 150 + textY; // Niche se thoda upar

        // Name Styling
        if (nameText) {
            ctx.font = "bold 80px 'Poppins', sans-serif";
            ctx.fillStyle = "#d40000"; // Red color text (change if needed)
            ctx.strokeStyle = "white";
            ctx.lineWidth = 4;
            ctx.strokeText(nameText, SIZE/2, basePath);
            ctx.fillText(nameText, SIZE/2, basePath);
        }

        // Pad Styling
        if (padText) {
            ctx.font = "bold 50px 'Poppins', sans-serif";
            ctx.fillStyle = "#333333"; // Dark grey
            ctx.fillText(padText, SIZE/2, basePath + 70);
        }
        ctx.restore();
    }
}

// 5. Download
document.getElementById("download").onclick = function() {
    let link = document.createElement('a');
    link.download = 'my-photo-frame.png';
    link.href = canvas.toDataURL();
    link.click();
}
