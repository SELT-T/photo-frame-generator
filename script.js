const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const SIZE = 1080;
canvas.width = SIZE;
canvas.height = SIZE;

let img = null;
let zoom = 1, rotate = 0, moveX = 0, moveY = 0;
let nameText = "", padText = "";

const frames = [
  "public/frame1.png",
  "public/frame2.png",
  "public/frame3.png"
];
let frameIndex = 0;

const frame = new Image();
frame.src = frames[frameIndex];
frame.onload = draw;

// Upload photo
upload.onchange = e => {
  img = new Image();
  img.onload = draw;
  img.src = URL.createObjectURL(e.target.files[0]);
};

// Change frame
nextFrame.onclick = () => {
  frameIndex = (frameIndex + 1) % frames.length;
  frame.src = frames[frameIndex];
};

nameText.addEventListener("input", e => {
  nameText = e.target.value;
  draw();
});

padText.addEventListener("input", e => {
  padText = e.target.value;
  draw();
});

["zoom","rotate","moveX","moveY"].forEach(id=>{
  document.getElementById(id).addEventListener("input",()=>{
    zoom = +zoomEl.value;
    rotate = +rotateEl.value;
    moveX = +moveXEl.value;
    moveY = +moveYEl.value;
    draw();
  });
});

const zoomEl = zoom;
const rotateEl = rotate;
const moveXEl = moveX;
const moveYEl = moveY;

function draw(){
  ctx.clearRect(0,0,SIZE,SIZE);

  if(img){
    const scale = Math.min(
      SIZE / img.width,
      SIZE / img.height
    ) * zoom;

    ctx.save();
    ctx.translate(SIZE/2 + moveX, SIZE/2 + moveY);
    ctx.rotate(rotate * Math.PI/180);
    ctx.drawImage(
      img,
      -img.width*scale/2,
      -img.height*scale/2,
      img.width*scale,
      img.height*scale
    );
    ctx.restore();
  }

  if(nameText){
    ctx.font="bold 90px Poppins";
    ctx.fillStyle="#fff";
    ctx.strokeStyle="#000";
    ctx.lineWidth=4;
    ctx.textAlign="center";
    ctx.strokeText(nameText, SIZE/2, SIZE-160);
    ctx.fillText(nameText, SIZE/2, SIZE-160);
  }

  if(padText){
    ctx.font="bold 60px Poppins";
    ctx.strokeText(padText, SIZE/2, SIZE-80);
    ctx.fillText(padText, SIZE/2, SIZE-80);
  }

  ctx.drawImage(frame,0,0,SIZE,SIZE);
}

reset.onclick = ()=>{
  zoom=1;rotate=0;moveX=0;moveY=0;
  zoomEl.value=1;
  rotateEl.value=0;
  moveXEl.value=0;
  moveYEl.value=0;
  nameText.value="";
  padText.value="";
  nameText="";
  padText="";
  draw();
};

download.onclick=()=>{
  const a=document.createElement("a");
  a.download="photo-frame.png";
  a.href=canvas.toDataURL("image/png");
  a.click();
};
