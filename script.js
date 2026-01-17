const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

// High Resolution Output
const SIZE = 1080; 
canvas.width = SIZE;
canvas.height = SIZE;

let img = null;
// Default Frame Path (Change this to your default frame image path)
let frameSrc = "frame.png"; 

// Variables
let zoom = 1;
let rotate = 0;
let moveX = 0;
let moveY = 0;
let textY = 0; // Text ko upar niche karne ke liye
let nameText = "";
let padText = "";

// Load Default Frame
const frame = new Image();
frame.crossOrigin = "anonymous"; // Imp for some browsers
frame.src = frameSrc; 
frame.onload = draw;

// 1. Upload Photo & Auto Fit (Photo katne wali problem solve)
document.getElementById("upload").onchange = e => {
    if (e.target.files && e.target.files[0]) {
        const reader = new FileReader();
        reader.onload = event => {
            img = new Image();
            img.onload = () => {
                // Logic: Calculate Zoom to FIT the image initially (Contain)
                // Photo puri dikhegi shuru me
                const scale = Math.min(SIZE / img.width, SIZE / img.height);
                
                // Set initial values
                zoom = scale * 0.8; // Thoda sa aur chhota taki frame ke andar rahe
                rotate = 0;
                moveX = 0;
                moveY = 0;
                
                // Update Sliders
                document.getElementById("zoom").value = zoom;
                document.getElementById("rotate").value = 0;
                document.getElementById("moveX").value = 0;
                document.getElementById("moveY").value = 0;
                
                draw();
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(e.target.files[0]);
    }
};

// 2. Upload Custom Frame
document.getElementById("uploadFrame").onchange = e => {
    if (e.target.files && e.target.files[0]) {
        const reader = new FileReader();
        reader.onload = event => {
            frame.src = event.target.result;
            // Frame load hone ke bad draw apne ap call hoga (onload upar laga hai)
        };
        reader.readAsDataURL(e.target.files[0]);
    }
};

// 3. Text Inputs
document.getElementById("nameText").addEventListener("input", function() {
    nameText = this.value;
    draw();
});

document.getElementById("padText").addEventListener("input", function() {
    padText = this.value;
    draw();
});

// 4. Sliders Logic
function updateVal(id) {
    return parseFloat(document.getElementById(id).value);
}

const inputs = ["zoom", "rotate", "moveX", "moveY", "textY"];
inputs.forEach(id => {
    document.getElementById(id).addEventListener("input", () => {
        zoom = updateVal("zoom");
        rotate = updateVal("rotate");
        moveX = updateVal("moveX");
        moveY = updateVal("moveY");
        textY = updateVal("textY");
        draw();
    });
});

// 5. Reset Function
document.getElementById("reset").onclick = () => {
    // Reset Image values
    if(img) {
         const scale = Math.min(SIZE / img.width, SIZE / img.height);
         zoom = scale * 0.8;
    } else {
        zoom = 1;
    }
    
    rotate = 0; moveX = 0; moveY = 0; textY = 0;
    nameText = ""; padText = "";
    
    document.getElementById("zoom").value = zoom;
    document.getElementById("rotate").value = 0;
    document.getElementById("moveX").value = 0;
    document.getElementById("moveY").value = 0;
    document.getElementById("textY").value = 0;
    document.getElementById("nameText").value = "";
    document.getElementById("padText").value = "";
    
    draw();
};

// 6. MAIN DRAW FUNCTION
function draw() {
    // Clear Canvas
    ctx.clearRect(0, 0, SIZE, SIZE);
    
    // A. Draw Background (Optional: White/Black bg if transparent image)
    ctx.fillStyle = "#fff"; // White background piche
    // ctx.fillRect(0,0, SIZE, SIZE); 

    // B. Draw User Photo
    if (img) {
        ctx.save();
        // Center pe le jao
        ctx.translate(SIZE/2 + moveX, SIZE/2 + moveY);
        ctx.rotate(rotate * Math.PI / 180);
        ctx.scale(zoom, zoom);
        
        // Draw image centered
        ctx.drawImage(img, -img.width/2, -img.height/2);
        
        ctx.restore();
    }
    
    // C. Draw Frame (Frame hamesha upar rahega photo ke)
    if(frame) {
        ctx.drawImage(frame, 0, 0, SIZE, SIZE);
    }

    // D. Draw Text (Name & Pad) - Frame ke upar
    // Isse text hamesha dikhega chahe frame kaisa bhi ho
    if (nameText || padText) {
        ctx.save();
        ctx.textAlign = "center";
        ctx.shadowColor="black";
        ctx.shadowBlur=7;
        
        // Base position bottom center
        let basePath = SIZE - 180 + textY; // TextY slider se adjust hoga

        // 1. NAME
        if (nameText) {
            ctx.font = "bold 70px 'Poppins', Arial";
            ctx.fillStyle = "#FFD700"; // Golden color text
            ctx.strokeStyle = "black";
            ctx.lineWidth = 4;
            
            ctx.strokeText(nameText, SIZE/2, basePath);
            ctx.fillText(nameText, SIZE/2, basePath);
        }

        // 2. PAD (Designation)
        if (padText) {
            ctx.font = "bold 50px 'Poppins', Arial";
            ctx.fillStyle = "#ffffff"; // White color
            ctx.strokeStyle = "black";
            ctx.lineWidth = 3;
            
            // Name ke niche aayega
            ctx.strokeText(padText, SIZE/2, basePath + 65);
            ctx.fillText(padText, SIZE/2, basePath + 65);
        }
        
        ctx.restore();
    }
}

// 7. Download Function
document.getElementById("download").onclick = () => {
    const link = document.createElement("a");
    // Date ke sath file name taki overwrite na ho
    link.download = `photo-frame-${Date.now()}.png`; 
    link.href = canvas.toDataURL("image/png", 1.0); // 1.0 = High Quality
    link.click();
};

// Initial Draw (Empty)
draw();
