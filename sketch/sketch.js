// Josef Albers — Mitered Square
// Interactive p5.js sketch — drag the center square, colours cycle every 0.5s

const palettes = [
  // 1: Mint / emerald
  { center: [8,   159, 118], tb: [230, 240, 230], sides: [180, 222, 200], bg: [245, 248, 244] },
  // 2: Cool grey / slate
  { center: [168, 182, 195], tb: [232, 234, 236], sides: [215, 218, 222], bg: [238, 239, 241] },
  // 3: Olive / sage
  { center: [148, 175, 105], tb: [230, 228, 195], sides: [208, 210, 168], bg: [228, 226, 190] },
  // 4: Blush / crimson
  { center: [168,  22,  30], tb: [238, 222, 215], sides: [222, 200, 193], bg: [238, 224, 218] },
  // 5: Warm yellow
  { center: [255, 210,   0], tb: [248, 238, 198], sides: [240, 220, 158], bg: [248, 236, 190] },
];

const LERP_SPEED  = 0.12;   // colour blend speed per frame
const INTERVAL_MS = 500;    // ms between palette switches

let currentPalette = 0;
let targetPalette  = 0;
let lerpAmt        = 1.0;   // 1 = fully settled, 0 = start of transition

let s = 122;          // center square size
let x, y;             // current square position (top-left corner)
let startX, startY;   // resting position
let dragging = false;

// ─── colour helpers ───────────────────────────────────────────────────────────

function lerpChannel(a, b, t) {
  return [
    a[0] + (b[0] - a[0]) * t,
    a[1] + (b[1] - a[1]) * t,
    a[2] + (b[2] - a[2]) * t,
  ];
}

function getBlendedPalette() {
  const a = palettes[currentPalette];
  const b = palettes[targetPalette];
  const t = lerpAmt;
  return {
    center: lerpChannel(a.center, b.center, t),
    tb:     lerpChannel(a.tb,     b.tb,     t),
    sides:  lerpChannel(a.sides,  b.sides,  t),
    bg:     lerpChannel(a.bg,     b.bg,     t),
  };
}

// ─── p5 lifecycle ─────────────────────────────────────────────────────────────

function setup() {
  createCanvas(600, 600);
  startX = x = 239;
  startY = y = 360;

  // cycle palette every INTERVAL_MS
  setInterval(() => {
    targetPalette = (targetPalette + 1) % palettes.length;
    lerpAmt = 0;
  }, INTERVAL_MS);
}

function draw() {
  // advance colour blend
  if (lerpAmt < 1) {
    lerpAmt = min(1, lerpAmt + LERP_SPEED);
    if (lerpAmt >= 1) currentPalette = targetPalette;
  }

  const pal = getBlendedPalette();
  background(pal.bg[0], pal.bg[1], pal.bg[2]);
  noStroke();

  // move or spring-return the square
  if (dragging) {
    x = mouseX - s / 2;
    y = mouseY - s / 2;
  } else {
    x += (startX - x) * 0.1;
    y += (startY - y) * 0.1;
  }

  x = constrain(x, 75, 403);
  y = constrain(y, 75, 403);

  let x1 = x,     x2 = x + s;
  let y1 = y,     y2 = y + s;

  // midpoints between square corners and canvas corners
  let topLX = x1 / 2,           topLY = y1 / 2;
  let topRX = (600 + x2) / 2,   topRY = y1 / 2;
  let botLX = x1 / 2,           botLY = (600 + y2) / 2;
  let botRX = (600 + x2) / 2,   botRY = (600 + y2) / 2;

  // light fill — top/bottom inner trapezoids + left/right outer strips
  fill(pal.tb[0], pal.tb[1], pal.tb[2]);
  quad(topLX, topLY, topRX, topRY, x2, y1, x1, y1);   // top inner
  quad(x1, y2, x2, y2, botRX, botRY, botLX, botLY);   // bottom inner
  quad(0, 0, topLX, topLY, botLX, botLY, 0, 600);      // left outer
  quad(topRX, topRY, 600, 0, 600, 600, botRX, botRY);  // right outer

  // side fill — left/right inner trapezoids + top/bottom outer strips
  fill(pal.sides[0], pal.sides[1], pal.sides[2]);
  quad(topLX, topLY, x1, y1, x1, y2, botLX, botLY);   // left inner
  quad(x2, y1, topRX, topRY, botRX, botRY, x2, y2);   // right inner
  quad(0, 0, 600, 0, topRX, topRY, topLX, topLY);      // top outer
  quad(botLX, botLY, botRX, botRY, 600, 600, 0, 600);  // bottom outer

  // center accent square
  fill(pal.center[0], pal.center[1], pal.center[2]);
  square(x1, y1, s);
}

function mousePressed() { dragging = true;  }
function mouseReleased() { dragging = false; }
