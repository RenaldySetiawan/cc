let xr;
let reticle;

let cubeModel, chairModel, cylinderModel, potModel;
let selectedModel = "cube";
let placedObjects = [];
let arStarted = false;
let tapSound;

// ============================
// PRELOAD
// ============================
function preload() {
  cubeModel = loadModel("assets/cube.obj");
  chairModel = loadModel("assets/chair.obj");
  cylinderModel = loadModel("assets/cylinder.obj");
  potModel = loadModel("assets/pot.obj");
  tapSound = loadSound("assets/tap.mp3");
}

// ============================
// SETUP
// ============================
function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);

  xr = new p5xr();
  xr.setCameraPosition(0, 0, 0);

  reticle = xr.createReticle();
}

// ============================
// START AR (USER GESTURE)
// ============================
function startAR() {
  if (arStarted) return;
  
  tapSound.playMode("restart");
  tapSound.setVolume(0.3);

  userStartAudio(); // WAJIB di mobile
  xr.start();
  arStarted = true;
}

// ============================
// DRAW
// ============================
function draw() {
  background(0, 0);

  if (!arStarted) return;
  
  // LIGHTING
  ambientLight(60);
  directionalLight(255, 255, 255, -0.5, -1, -0.5);
  pointLight(255, 255, 255, 0, -1, 0);

  // Reticle
  if (reticle.visible) {
    push();
    translate(
      reticle.position.x,
      reticle.position.y,
      reticle.position.z
    );
    rotateX(-HALF_PI);
    noFill();
    stroke(0, 255, 0);
    circle(0, 0, 0.15);
    pop();
  }

  for (let obj of placedObjects) {
    obj.update();
    obj.display();
  }
}

// ============================
// TAP TO PLACE
// ============================

let lastTapTime = 0;

function mousePressed() {
  let now = millis();
  if (now - lastTapTime < 300) return;
  lastTapTime = now;

  if (!arStarted || !reticle.visible) return;
  if (getAudioContext().state !== "running") return;
  if (!tapSound || !tapSound.isLoaded()) return;

  tapSound.play();

  placedObjects.push(
    new ARObject(
      reticle.position.x,
      reticle.position.y,
      reticle.position.z,
      selectedModel
    )
  );
}



// ============================
// UI FUNCTIONS
// ============================
function selectModel(name) {
  selectedModel = name;
}

function rotateLastObject() {
  if (placedObjects.length === 0) return;
  placedObjects.at(-1).rotationY += PI / 6;
}

function undoLastObject() {
  if (placedObjects.length === 0) return;
  placedObjects.pop();
}

function touchStarted() {
  mousePressed();
  return false;
}

// ============================
// AR OBJECT CLASS
// ============================
class ARObject {
  constructor(x, y, z, type) {
    this.pos = createVector(x, y, z);
    this.baseY = y;
    this.type = type;
    this.rotationY = 0;
    this.offset = random(TWO_PI);
  }

  update() {
    this.pos.y =
      this.baseY + sin(frameCount * 0.03 + this.offset) * 0.03;
  }

  display() {
  push();
  translate(this.pos.x, this.pos.y, this.pos.z);
  rotateY(this.rotationY);

  // MATERIAL
  specularMaterial(230);
  shininess(80);

  switch (this.type) {
    case "cube":
      scale(0.1);
      model(cubeModel);
      break;

    case "chair":
      scale(0.15);
      model(chairModel);
      break;

    case "cylinder":
      scale(0.12);
      model(cylinderModel);
      break;

    case "pot":
      scale(0.12);
      model(potModel);
      break;
  }

  pop();
}
}
