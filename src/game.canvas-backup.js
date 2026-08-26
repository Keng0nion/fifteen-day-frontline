const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d", { alpha: false });
const miniMap = document.getElementById("miniMap");
const miniCtx = miniMap.getContext("2d");

const $ = (id) => document.getElementById(id);

const ui = {
  menu: $("menu"),
  hud: $("hud"),
  centerPrompt: $("centerPrompt"),
  toastLog: $("toastLog"),
  endMessage: $("endMessage"),
  startBtn: $("startBtn"),
  resumeBtn: $("resumeBtn"),
  settingsBtn: $("settingsBtn"),
  armoryBtn: $("armoryBtn"),
  helpBtn: $("helpBtn"),
  settingsPanel: $("settingsPanel"),
  armoryPanel: $("armoryPanel"),
  helpPanel: $("helpPanel"),
  weaponCards: $("weaponCards"),
  difficultyInput: $("difficultyInput"),
  mapSizeInput: $("mapSizeInput"),
  dayLengthInput: $("dayLengthInput"),
  dayLengthValue: $("dayLengthValue"),
  npcDensityInput: $("npcDensityInput"),
  npcDensityValue: $("npcDensityValue"),
  wildlifeDensityInput: $("wildlifeDensityInput"),
  wildlifeDensityValue: $("wildlifeDensityValue"),
  sensitivityInput: $("sensitivityInput"),
  sensitivityValue: $("sensitivityValue"),
  aimAssistInput: $("aimAssistInput"),
  aimAssistValue: $("aimAssistValue"),
  volumeInput: $("volumeInput"),
  volumeValue: $("volumeValue"),
  hpBar: $("hpBar"),
  hpText: $("hpText"),
  hungerBar: $("hungerBar"),
  hungerText: $("hungerText"),
  statusChips: $("statusChips"),
  weaponName: $("weaponName"),
  ammoText: $("ammoText"),
  weaponHint: $("weaponHint"),
  timeText: $("timeText"),
  weatherText: $("weatherText"),
  airdropText: $("airdropText"),
  factionText: $("factionText"),
  squadText: $("squadText"),
  taskList: $("taskList"),
  inventoryList: $("inventoryList"),
  minimapPanel: $("minimapPanel"),
};

const TAU = Math.PI * 2;
const SERVICE_DAYS = 15;
const WIN_TASKS = 5;
const PLAYER_RADIUS = 16;
const NPC_RADIUS = 15;
const MAX_DT = 0.05;
const WORLD_MARGIN = 46;

const ITEM_NAMES = {
  bandage: "绷带",
  splint: "夹板",
  bloodBag: "输血包",
  ration: "口粮",
  antibiotic: "抗生素",
  ammo: "弹药箱",
  intel: "情报件",
};

const STATUS_LABELS = {
  bleeding: "流血：绷带",
  fracture: "骨折：夹板",
  infection: "感染：抗生素",
  starving: "饥饿虚弱：口粮",
  suppressed: "火力压制",
};

const AMMO_NAMES = {
  rifle: "步枪弹",
  smg: "冲锋枪弹",
  pistol: "手枪弹",
  shotgun: "霰弹",
  lmg: "机枪弹",
  sniper: "狙击弹",
  arrow: "箭矢",
  carbine: "卡宾枪弹",
};

const WEAPON_DEFS = [
  {
    id: "infantryRifle",
    slot: 1,
    name: "步兵栓动步枪",
    shortName: "栓动步枪",
    ammoType: "rifle",
    category: "中远距离精准压制",
    description: "慢射速、高单发伤害、弹道稳定。适合卡距离点杀敌人；移动射击会明显发飘，精瞄后手感最稳。",
    magSize: 5,
    startReserve: 55,
    damage: 54,
    fireRate: 0.82,
    reloadTime: 2.55,
    bulletSpeed: 1440,
    range: 1280,
    spread: 0.046,
    aimSpread: 0.008,
    recoil: 0.34,
    recoilRecovery: 2.6,
    kick: 4.5,
    pellets: 1,
    auto: false,
    noise: 1,
    weight: 0.96,
    adsMove: 0.69,
    bleedChance: 0.2,
    fractureChance: 0.06,
    color: "#ead38b",
    sound: { freq: 150, type: "square", length: 0.12 },
    stats: { 伤害: 86, 射速: 35, 精度: 82, 机动: 58, 射程: 88 },
  },
  {
    id: "trenchSmg",
    slot: 2,
    name: "壕沟冲锋枪",
    shortName: "冲锋枪",
    ammoType: "smg",
    category: "近距离扫射与冲房",
    description: "高射速、低单发伤害、水平抖动大。近距离像锯子一样切开目标，远距离会快速失控。",
    magSize: 32,
    startReserve: 160,
    damage: 16,
    fireRate: 10.8,
    reloadTime: 2.05,
    bulletSpeed: 980,
    range: 620,
    spread: 0.088,
    aimSpread: 0.034,
    recoil: 0.09,
    recoilRecovery: 4.8,
    kick: 1.15,
    pellets: 1,
    auto: true,
    noise: 0.85,
    weight: 0.9,
    adsMove: 0.76,
    bleedChance: 0.12,
    fractureChance: 0.015,
    color: "#f2ad66",
    sound: { freq: 210, type: "sawtooth", length: 0.045 },
    stats: { 伤害: 42, 射速: 95, 精度: 42, 机动: 82, 射程: 40 },
  },
  {
    id: "huntingShotgun",
    slot: 3,
    name: "猎用霰弹枪",
    shortName: "霰弹枪",
    ammoType: "shotgun",
    category: "近距离爆发与狩猎",
    description: "一次喷出多颗弹丸，贴脸毁灭性强，打鹿和野猪效率极高；远距离伤害衰减严重，换弹偏慢。",
    magSize: 6,
    startReserve: 42,
    damage: 12,
    fireRate: 1.28,
    reloadTime: 3.2,
    bulletSpeed: 920,
    range: 430,
    spread: 0.28,
    aimSpread: 0.16,
    recoil: 0.44,
    recoilRecovery: 2.1,
    kick: 5.9,
    pellets: 9,
    auto: false,
    noise: 1.05,
    weight: 0.93,
    adsMove: 0.66,
    bleedChance: 0.35,
    fractureChance: 0.15,
    color: "#ffdb9d",
    sound: { freq: 110, type: "triangle", length: 0.16 },
    stats: { 伤害: 92, 射速: 38, 精度: 25, 机动: 62, 射程: 28 },
  },
  {
    id: "stormLmg",
    slot: 4,
    name: "风暴轻机枪",
    shortName: "轻机枪",
    ammoType: "lmg",
    category: "持续火力与压制",
    description: "弹匣巨大、越打越难控，站桩扫射可以压制 NPC；重量高，换弹慢，冲刺与转向手感笨重。",
    magSize: 47,
    startReserve: 188,
    damage: 22,
    fireRate: 7.2,
    reloadTime: 4.85,
    bulletSpeed: 1120,
    range: 920,
    spread: 0.074,
    aimSpread: 0.026,
    recoil: 0.14,
    recoilRecovery: 2.8,
    kick: 2.35,
    pellets: 1,
    auto: true,
    noise: 1.2,
    weight: 0.72,
    adsMove: 0.46,
    bleedChance: 0.16,
    fractureChance: 0.04,
    heatPerShot: 0.045,
    color: "#ffd067",
    sound: { freq: 95, type: "square", length: 0.055 },
    stats: { 伤害: 58, 射速: 76, 精度: 51, 机动: 28, 射程: 68 },
  },
  {
    id: "marksmanScout",
    slot: 5,
    name: "侦察狙击步枪",
    shortName: "狙击步枪",
    ammoType: "sniper",
    category: "超远距离高风险高收益",
    description: "精瞄时几乎无散布、弹速最快、射程最长；非精瞄非常难用，开火声会吸引远处敌军。",
    magSize: 5,
    startReserve: 35,
    damage: 88,
    fireRate: 0.48,
    reloadTime: 3.05,
    bulletSpeed: 1740,
    range: 1700,
    spread: 0.12,
    aimSpread: 0.0035,
    recoil: 0.62,
    recoilRecovery: 1.75,
    kick: 7.4,
    pellets: 1,
    auto: false,
    noise: 1.45,
    weight: 0.82,
    adsMove: 0.42,
    bleedChance: 0.28,
    fractureChance: 0.18,
    color: "#bfe8ff",
    sound: { freq: 80, type: "square", length: 0.19 },
    stats: { 伤害: 98, 射速: 21, 精度: 96, 机动: 36, 射程: 100 },
  },
  {
    id: "serviceRevolver",
    slot: 6,
    name: "军用转轮手枪",
    shortName: "转轮手枪",
    ammoType: "pistol",
    category: "可靠副武器",
    description: "抽枪快、边移动边打也能控住。伤害和射程都中等，适合主武器换弹时救命。",
    magSize: 6,
    startReserve: 66,
    damage: 34,
    fireRate: 2.4,
    reloadTime: 2.25,
    bulletSpeed: 850,
    range: 560,
    spread: 0.068,
    aimSpread: 0.026,
    recoil: 0.18,
    recoilRecovery: 5.2,
    kick: 2.2,
    pellets: 1,
    auto: false,
    noise: 0.78,
    weight: 1.03,
    adsMove: 0.84,
    bleedChance: 0.14,
    fractureChance: 0.035,
    color: "#f2e7c0",
    sound: { freq: 190, type: "square", length: 0.08 },
    stats: { 伤害: 56, 射速: 58, 精度: 48, 机动: 90, 射程: 38 },
  },
  {
    id: "fieldBow",
    slot: 7,
    name: "野战猎弓",
    shortName: "猎弓",
    ammoType: "arrow",
    category: "静音狩猎与潜行",
    description: "射速慢、需要预判，但几乎无声，击杀动物后有概率回收箭矢。NPC 在饥饿时也会偏好安静狩猎。",
    magSize: 1,
    startReserve: 28,
    damage: 48,
    fireRate: 0.72,
    reloadTime: 0.68,
    bulletSpeed: 620,
    range: 610,
    spread: 0.04,
    aimSpread: 0.012,
    recoil: 0.02,
    recoilRecovery: 9,
    kick: 0.55,
    pellets: 1,
    auto: false,
    autoReload: true,
    silent: true,
    noise: 0.12,
    weight: 1.08,
    adsMove: 0.8,
    bleedChance: 0.18,
    fractureChance: 0.02,
    color: "#b8f0ac",
    sound: { freq: 340, type: "triangle", length: 0.06 },
    stats: { 伤害: 64, 射速: 25, 精度: 70, 机动: 84, 射程: 43 },
  },
  {
    id: "medicCarbine",
    slot: 8,
    name: "半自动医护卡宾枪",
    shortName: "医护卡宾",
    ammoType: "carbine",
    category: "中距离连射与救场",
    description: "半自动、低后坐、弹匣适中。没有栓动步枪的爆发，也没有冲锋枪的压制，但连续点射最容易稳定命中。",
    magSize: 10,
    startReserve: 90,
    damage: 30,
    fireRate: 4.2,
    reloadTime: 2.0,
    bulletSpeed: 1080,
    range: 820,
    spread: 0.052,
    aimSpread: 0.017,
    recoil: 0.12,
    recoilRecovery: 5.4,
    kick: 1.7,
    pellets: 1,
    auto: false,
    noise: 0.82,
    weight: 0.98,
    adsMove: 0.77,
    bleedChance: 0.15,
    fractureChance: 0.03,
    color: "#d3f1ff",
    sound: { freq: 175, type: "square", length: 0.07 },
    stats: { 伤害: 52, 射速: 68, 精度: 68, 机动: 76, 射程: 58 },
  },
];

const WEAPON_BY_ID = Object.fromEntries(WEAPON_DEFS.map((weapon) => [weapon.id, weapon]));

const FACTIONS = {
  expedition: { name: "第七远征军", short: "远征军", color: "#7fd16b", hostileColor: "#7fd16b" },
  empire: { name: "钢盔帝国军", short: "帝国军", color: "#e65b58", hostileColor: "#ff6b66" },
  raiders: { name: "黑旗掠夺连", short: "黑旗", color: "#f09b46", hostileColor: "#ffad55" },
  partisans: { name: "松林游击队", short: "游击队", color: "#75b8ff", hostileColor: "#75b8ff" },
  medics: { name: "白鸽救护队", short: "救护队", color: "#f0f2d0", hostileColor: "#f0f2d0" },
};

const BASE_RELATIONS = {
  expedition: { expedition: 1, empire: -1, raiders: -0.9, partisans: 0.35, medics: 0.65 },
  empire: { expedition: -1, empire: 1, raiders: -0.45, partisans: -0.85, medics: -0.15 },
  raiders: { expedition: -0.9, empire: -0.45, raiders: 1, partisans: -0.65, medics: -0.95 },
  partisans: { expedition: 0.35, empire: -0.85, raiders: -0.65, partisans: 1, medics: 0.45 },
  medics: { expedition: 0.65, empire: -0.15, raiders: -0.95, partisans: 0.45, medics: 1 },
};

const UNIT_NAMES = {
  expedition: ["鸢尾一班", "第 3 突击排", "榛木侦察组", "灰线预备队"],
  empire: ["铁雨步兵班", "第 12 掷弹队", "黑盔火力组", "山脊守备队"],
  raiders: ["黑旗拾荒组", "灰狼抢夺队", "赤土佣兵队", "铁钩突击队"],
  partisans: ["松针游击组", "河湾猎兵队", "蓝烟侦察队", "林地伏击队"],
  medics: ["白鸽救护组", "教堂转运队", "雪线医护队"],
};

const ROLE_LABELS = {
  leader: "队长",
  rifleman: "步枪手",
  assault: "突击兵",
  gunner: "机枪手",
  scout: "侦察兵",
  medic: "医疗兵",
  hunter: "猎手",
};

const ANIMAL_DEFS = {
  deer: {
    name: "鹿",
    hp: 42,
    speed: 86,
    fleeSpeed: 150,
    meat: [2, 4],
    color: "#c69058",
    behavior: "prey",
    radius: 13,
  },
  boar: {
    name: "野猪",
    hp: 78,
    speed: 68,
    fleeSpeed: 126,
    meat: [3, 5],
    color: "#756154",
    behavior: "territorial",
    radius: 15,
    damage: 12,
  },
  wolf: {
    name: "狼",
    hp: 52,
    speed: 96,
    fleeSpeed: 165,
    meat: [1, 2],
    color: "#7d8893",
    behavior: "predator",
    radius: 13,
    damage: 10,
  },
};

const DEFAULT_SETTINGS = {
  difficulty: 1,
  mapSize: 8200,
  dayLengthMinutes: 4,
  npcDensity: 1,
  wildlifeDensity: 1.2,
  sensitivity: 1,
  aimAssist: 0.08,
  volume: 0.35,
};

const input = {
  keys: new Set(),
  mouse: { x: 0, y: 0, worldX: 0, worldY: 0, down: false, right: false },
  interact: false,
  reload: false,
  useItem: null,
  enlargedMap: false,
};

let settings = { ...DEFAULT_SETTINGS };
let game = createEmptyGame();
let audioCtx = null;
let lastFrame = 0;
let animationStarted = false;
let mouseFireWasDown = false;
let cachedHudSignature = "";

function createEmptyGame() {
  return {
    state: "menu",
    rng: mulberry32(Date.now() >>> 0),
    width: window.innerWidth || 1280,
    height: window.innerHeight || 720,
    mapSize: settings.mapSize,
    camera: { x: 0, y: 0, shake: 0, zoom: 1, targetZoom: 1 },
    player: null,
    npcs: [],
    squads: [],
    animals: [],
    bullets: [],
    particles: [],
    loot: [],
    obstacles: [],
    terrain: [],
    roads: [],
    landmarks: [],
    tasks: [],
    corpses: [],
    airdrop: null,
    minutes: 8 * 60,
    startMinutes: 8 * 60,
    serviceEndMinutes: 8 * 60 + SERVICE_DAYS * 1440,
    nextAirdropMinutes: 10 * 60,
    weather: { type: "晴朗", fog: 0, rain: 0, wind: { x: 0.2, y: 0 } },
    nextWeatherMinutes: 12 * 60,
    relations: cloneRelations(BASE_RELATIONS),
    stats: { playerKills: 0, animalsHarvested: 0, airdropsLooted: 0, tasksDone: 0, daysSurvived: 0, shotsFired: 0 },
    lastHudUpdate: 0,
    lastMiniMapUpdate: 0,
    prompt: "",
    selectedInteraction: null,
    outcome: null,
  };
}

function cloneRelations(source) {
  const copy = {};
  for (const [faction, map] of Object.entries(source)) copy[faction] = { ...map };
  return copy;
}

function mulberry32(seed) {
  return function random() {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function id() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

function rand(min, max) {
  return min + game.rng() * (max - min);
}

function randInt(min, max) {
  return Math.floor(rand(min, max + 1));
}

function pick(array) {
  return array[Math.floor(game.rng() * array.length)];
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function lerpAngle(a, b, t) {
  const delta = wrapAngle(b - a);
  return a + delta * t;
}

function dist(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function distXY(ax, ay, bx, by) {
  return Math.hypot(ax - bx, ay - by);
}

function angleTo(a, b) {
  return Math.atan2(b.y - a.y, b.x - a.x);
}

function normalize(x, y) {
  const length = Math.hypot(x, y) || 1;
  return { x: x / length, y: y / length, length };
}

function wrapAngle(angle) {
  while (angle > Math.PI) angle -= TAU;
  while (angle < -Math.PI) angle += TAU;
  return angle;
}

function isAlive(entity) {
  return Boolean(entity && entity.alive !== false && entity.hp > 0);
}

function getFactionRelation(a, b) {
  if (a === b) return 1;
  return game.relations?.[a]?.[b] ?? 0;
}

function isHostileFaction(a, b) {
  return getFactionRelation(a, b) < -0.1;
}

function provokeFaction(factionId) {
  if (!factionId || factionId === "expedition") return;
  game.relations.expedition[factionId] = Math.min(game.relations.expedition[factionId] ?? 0, -0.75);
  game.relations[factionId].expedition = Math.min(game.relations[factionId].expedition ?? 0, -0.75);
}

function pointInRect(px, py, rect) {
  return px >= rect.x && px <= rect.x + rect.w && py >= rect.y && py <= rect.y + rect.h;
}

function circleRectCollide(cx, cy, radius, rect) {
  const closestX = clamp(cx, rect.x - rect.w / 2, rect.x + rect.w / 2);
  const closestY = clamp(cy, rect.y - rect.h / 2, rect.y + rect.h / 2);
  return distXY(cx, cy, closestX, closestY) < radius;
}

function isInView(obj, margin = 160) {
  const zoom = game.camera.zoom || 1;
  const halfW = game.width / zoom / 2;
  const halfH = game.height / zoom / 2;
  const left = game.camera.x - halfW - margin;
  const right = game.camera.x + halfW + margin;
  const top = game.camera.y - halfH - margin;
  const bottom = game.camera.y + halfH + margin;
  const radius = obj.radius || obj.r || obj.size || Math.max(obj.w || 0, obj.h || 0) || 20;
  return obj.x + radius > left && obj.x - radius < right && obj.y + radius > top && obj.y - radius < bottom;
}

function resizeCanvas() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  game.width = window.innerWidth;
  game.height = window.innerHeight;
  canvas.width = Math.floor(game.width * dpr);
  canvas.height = Math.floor(game.height * dpr);
  canvas.style.width = `${game.width}px`;
  canvas.style.height = `${game.height}px`;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function readSettings() {
  settings = {
    difficulty: Number(ui.difficultyInput.value),
    mapSize: Number(ui.mapSizeInput.value),
    dayLengthMinutes: Number(ui.dayLengthInput.value),
    npcDensity: Number(ui.npcDensityInput.value),
    wildlifeDensity: Number(ui.wildlifeDensityInput.value),
    sensitivity: Number(ui.sensitivityInput.value),
    aimAssist: Number(ui.aimAssistInput.value),
    volume: Number(ui.volumeInput.value),
  };
}

function syncSettingsLabels() {
  ui.dayLengthValue.textContent = `${Number(ui.dayLengthInput.value).toFixed(1)} 分钟`;
  ui.npcDensityValue.textContent = `${Number(ui.npcDensityInput.value).toFixed(1)}x`;
  ui.wildlifeDensityValue.textContent = `${Number(ui.wildlifeDensityInput.value).toFixed(1)}x`;
  ui.sensitivityValue.textContent = `${Number(ui.sensitivityInput.value).toFixed(2)}x`;
  ui.aimAssistValue.textContent = Number(ui.aimAssistInput.value).toFixed(2);
  ui.volumeValue.textContent = `${Math.round(Number(ui.volumeInput.value) * 100)}%`;
  readSettings();
}

function showToast(message, type = "") {
  const node = document.createElement("div");
  node.className = `toast ${type}`.trim();
  node.textContent = message;
  ui.toastLog.appendChild(node);
  setTimeout(() => {
    node.style.opacity = "0";
    node.style.transform = "translateY(-10px)";
  }, 3300);
  setTimeout(() => node.remove(), 4200);
}

function initAudio() {
  const AudioCtor = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtor) return;
  if (!audioCtx) audioCtx = new AudioCtor();
  if (audioCtx.state === "suspended") audioCtx.resume();
}

function playTone(freq, duration, type = "sine", volume = 0.08, slide = 0) {
  if (!audioCtx || settings.volume <= 0) return;
  const now = audioCtx.currentTime;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(Math.max(20, freq), now);
  if (slide !== 0) osc.frequency.exponentialRampToValueAtTime(Math.max(20, freq + slide), now + duration);
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(Math.max(0.0001, volume * settings.volume), now + 0.006);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start(now);
  osc.stop(now + duration + 0.03);
}

function playWeaponSound(def, source) {
  const distanceToPlayer = source && game.player ? dist(source, game.player) : 0;
  const falloff = clamp(1 - distanceToPlayer / 1450, 0.05, 1);
  const freq = def.sound.freq * rand(0.94, 1.08);
  playTone(freq, def.sound.length, def.sound.type, 0.16 * def.noise * falloff, -freq * 0.18);
  if (!def.silent) playTone(freq * 0.48, def.sound.length * 1.45, "sine", 0.05 * def.noise * falloff, -25);
}

function renderWeaponCards() {
  ui.weaponCards.innerHTML = "";
  for (const weapon of WEAPON_DEFS) {
    const card = document.createElement("article");
    card.className = "weapon-card";
    const statsHtml = Object.entries(weapon.stats)
      .map(
        ([name, value]) => `
          <div class="weapon-stat">
            <span>${name}</span>
            <div class="stat-bar"><i style="width:${value}%"></i></div>
            <b>${value}</b>
          </div>`,
      )
      .join("");
    card.innerHTML = `
      <h3>${weapon.slot}. ${weapon.name}</h3>
      <p><b>${weapon.category}</b> · ${weapon.description}</p>
      ${statsHtml}
      <p class="subtle">弹匣 ${weapon.magSize} · ${AMMO_NAMES[weapon.ammoType]} · 换弹 ${weapon.reloadTime.toFixed(1)}s · ${weapon.auto ? "全自动" : weapon.autoReload ? "单发自动搭箭" : "半自动/单发"}</p>
    `;
    ui.weaponCards.appendChild(card);
  }
}

function startNewGame() {
  readSettings();
  initAudio();
  const seed = (Date.now() ^ Math.floor(Math.random() * 1000000000)) >>> 0;
  game = createEmptyGame();
  game.rng = mulberry32(seed);
  game.state = "playing";
  game.mapSize = settings.mapSize;
  game.minutes = 8 * 60;
  game.startMinutes = 8 * 60;
  game.serviceEndMinutes = 8 * 60 + SERVICE_DAYS * 1440;
  game.nextAirdropMinutes = game.minutes + rand(75, 145);
  game.nextWeatherMinutes = game.minutes + rand(180, 420);
  resizeCanvas();
  generateWorld();
  createPlayer();
  generateTasks();
  cachedHudSignature = "";
  ui.menu.classList.add("hidden");
  ui.hud.classList.remove("hidden");
  ui.resumeBtn.classList.add("hidden");
  ui.endMessage.classList.add("hidden");
  ui.minimapPanel.classList.remove("large");
  showToast("部署完成：完成 5 个系统任务，或活过 15 天。", "good");
  showToast("医疗规则：输血包是唯一回血道具；其他物资只移除对应 debuff。", "warn");
  playTone(420, 0.14, "triangle", 0.08, 120);
  playTone(210, 0.22, "sine", 0.05, -40);
}

function generateWorld() {
  const size = game.mapSize;
  game.terrain = [];
  game.obstacles = [];
  game.roads = [];
  game.landmarks = [];
  game.npcs = [];
  game.squads = [];
  game.animals = [];
  game.bullets = [];
  game.particles = [];
  game.loot = [];
  game.corpses = [];
  game.airdrop = null;

  const center = { x: size / 2, y: size / 2 };
  game.landmarks.push({ id: "base", name: "己方前线壕沟", type: "base", factionId: "expedition", x: center.x, y: center.y, r: 230, color: "#59795f" });

  const landmarkTypes = ["village", "bunker", "relay", "depot", "forestCamp", "fieldHospital", "ruins", "watchPost", "farm", "railYard"];
  const landmarkCount = Math.floor(size / 620) + 8;
  for (let i = 0; i < landmarkCount; i += 1) {
    const angle = (i / landmarkCount) * TAU + rand(-0.32, 0.32);
    const radius = rand(size * 0.17, size * 0.48);
    const x = clamp(center.x + Math.cos(angle) * radius, 420, size - 420);
    const y = clamp(center.y + Math.sin(angle) * radius, 420, size - 420);
    const type = landmarkTypes[i % landmarkTypes.length];
    const names = {
      village: "焦土村庄",
      bunker: "混凝土碉堡",
      relay: "无线电高地",
      depot: "弹药补给站",
      forestCamp: "林地猎营",
      fieldHospital: "野战医院遗址",
      ruins: "废弃庄园",
      watchPost: "山脊观察哨",
      farm: "荒废农场",
      railYard: "断轨车站",
    };
    const factionId = chooseLandmarkFaction(type, angle, radius, size);
    game.landmarks.push({ id: `${type}-${i}`, name: names[type], type, factionId, x, y, r: rand(150, 280), color: landmarkColor(type) });
  }

  for (let i = 0; i < game.landmarks.length - 1; i += 1) {
    const from = game.landmarks[i];
    const to = game.landmarks[(i + 1) % game.landmarks.length];
    game.roads.push(makeRoad(from, to));
  }
  for (let i = 1; i < game.landmarks.length; i += 3) game.roads.push(makeRoad(game.landmarks[0], game.landmarks[i]));

  const terrainCount = Math.floor(size / 15);
  for (let i = 0; i < terrainCount; i += 1) {
    const typeRoll = game.rng();
    const type = typeRoll < 0.43 ? "grass" : typeRoll < 0.66 ? "mud" : typeRoll < 0.83 ? "forest" : typeRoll < 0.93 ? "crater" : "water";
    game.terrain.push({
      type,
      x: rand(100, size - 100),
      y: rand(100, size - 100),
      r: type === "water" ? rand(90, 250) : rand(45, 185),
      rx: rand(0.8, 1.8),
      ry: rand(0.65, 1.45),
      rot: rand(0, TAU),
      alpha: rand(0.14, 0.5),
    });
  }

  generateObstaclesAroundLandmarks();
  generateNaturalObstacles(size);
  spawnFactionSquads();
  spawnWildlife();
}

function chooseLandmarkFaction(type, angle, radius, size) {
  if (type === "fieldHospital") return game.rng() < 0.62 ? "medics" : "raiders";
  if (type === "forestCamp" || type === "farm") return game.rng() < 0.68 ? "partisans" : "raiders";
  if (type === "ruins") return game.rng() < 0.55 ? "raiders" : "empire";
  if (type === "depot" || type === "bunker" || type === "railYard") return game.rng() < 0.75 ? "empire" : "raiders";
  if (radius < size * 0.23 && game.rng() < 0.3) return "expedition";
  if (Math.cos(angle) > 0.2) return "empire";
  return game.rng() < 0.52 ? "raiders" : "partisans";
}

function landmarkColor(type) {
  switch (type) {
    case "base":
      return "#55735a";
    case "village":
      return "#736556";
    case "bunker":
      return "#6c6f6a";
    case "relay":
      return "#678aa1";
    case "depot":
      return "#8b7650";
    case "forestCamp":
      return "#4e764d";
    case "fieldHospital":
      return "#806866";
    case "ruins":
      return "#716a60";
    case "farm":
      return "#777249";
    case "railYard":
      return "#5f6264";
    default:
      return "#7d846f";
  }
}

function makeRoad(from, to) {
  const points = [];
  const segments = randInt(3, 6);
  for (let i = 0; i <= segments; i += 1) {
    const t = i / segments;
    points.push({
      x: lerp(from.x, to.x, t) + rand(-95, 95) * Math.sin(t * Math.PI),
      y: lerp(from.y, to.y, t) + rand(-95, 95) * Math.sin(t * Math.PI),
    });
  }
  return { points, width: rand(24, 42), color: rand(0, 1) > 0.5 ? "#4d453a" : "#3f463c" };
}

function generateObstaclesAroundLandmarks() {
  for (const landmark of game.landmarks) {
    if (landmark.type === "base") {
      for (let i = 0; i < 12; i += 1) {
        const angle = (i / 12) * TAU;
        game.obstacles.push({ type: "trench", x: landmark.x + Math.cos(angle) * 190, y: landmark.y + Math.sin(angle) * 190, w: 135, h: 28, rot: angle, blocks: false, cover: true });
      }
      for (let i = 0; i < 6; i += 1) {
        const p = randomNearby(landmark, 160);
        game.loot.push({ id: id(), type: "cache", name: "己方小补给", x: p.x, y: p.y, radius: 17, searched: false, contents: { bandage: 1, ration: 1, ammo: 1 } });
      }
      continue;
    }

    const structures = landmark.type === "forestCamp" || landmark.type === "farm" ? randInt(3, 6) : randInt(4, 10);
    for (let i = 0; i < structures; i += 1) {
      const angle = rand(0, TAU);
      const radius = rand(25, landmark.r * 0.76);
      const common = { x: landmark.x + Math.cos(angle) * radius, y: landmark.y + Math.sin(angle) * radius, w: rand(46, 122), h: rand(36, 108), rot: rand(0, TAU), blocks: true, cover: true };
      if (landmark.type === "forestCamp") game.obstacles.push({ ...common, type: "tent", blocks: true });
      else if (landmark.type === "farm") game.obstacles.push({ ...common, type: game.rng() < 0.4 ? "hay" : "barn" });
      else game.obstacles.push({ ...common, type: landmark.type === "bunker" ? "bunker" : landmark.type === "relay" ? "tower" : landmark.type === "railYard" ? "railcar" : "building" });
    }

    if (["depot", "fieldHospital", "ruins", "village", "railYard"].includes(landmark.type)) {
      game.loot.push({
        id: id(),
        type: "cache",
        name: landmark.type === "fieldHospital" ? "医疗箱" : landmark.type === "depot" ? "弹药补给箱" : "遗留补给箱",
        x: landmark.x + rand(-landmark.r * 0.45, landmark.r * 0.45),
        y: landmark.y + rand(-landmark.r * 0.45, landmark.r * 0.45),
        radius: 18,
        searched: false,
        contents: randomCacheContents(landmark.type),
      });
    }
  }
}

function generateNaturalObstacles(size) {
  const naturalCount = Math.floor(size / 10.5);
  for (let i = 0; i < naturalCount; i += 1) {
    const typeRoll = game.rng();
    const type = typeRoll < 0.6 ? "tree" : typeRoll < 0.86 ? "rock" : "crater";
    const x = rand(80, size - 80);
    const y = rand(80, size - 80);
    if (distXY(x, y, size / 2, size / 2) < 180) continue;
    game.obstacles.push({
      type,
      x,
      y,
      radius: type === "tree" ? rand(16, 34) : rand(12, 34),
      w: rand(28, 62),
      h: rand(22, 58),
      rot: rand(0, TAU),
      blocks: type !== "crater",
      cover: type !== "crater",
    });
  }
}

function randomCacheContents(type) {
  if (type === "fieldHospital") return { bandage: randInt(1, 3), splint: randInt(1, 2), antibiotic: 1, bloodBag: randInt(1, 2) };
  if (type === "depot") return { ammo: randInt(2, 4), bandage: 1, ration: randInt(1, 2) };
  if (type === "railYard") return { ammo: randInt(1, 3), ration: randInt(1, 3), bloodBag: game.rng() < 0.35 ? 1 : 0 };
  if (type === "ruins") return { ration: randInt(1, 2), bandage: game.rng() < 0.55 ? 1 : 0, intel: game.rng() < 0.35 ? 1 : 0 };
  return { ration: randInt(1, 3), bandage: game.rng() < 0.45 ? 1 : 0, ammo: game.rng() < 0.55 ? 1 : 0 };
}

function createPlayer() {
  const size = game.mapSize;
  const weapons = {};
  for (const def of WEAPON_DEFS) weapons[def.id] = { id: def.id, mag: def.magSize, reserve: def.startReserve, reloadTimer: 0, cooldown: 0, heat: 0, isReloading: false };
  game.player = {
    id: "player",
    kind: "player",
    factionId: "expedition",
    name: "你",
    x: size / 2,
    y: size / 2,
    vx: 0,
    vy: 0,
    radius: PLAYER_RADIUS,
    hp: 100,
    maxHp: 100,
    hunger: 100,
    statuses: { bleeding: 0, fracture: 0, infection: 0, starving: 0, suppressed: 0 },
    inventory: { bandage: 4, splint: 2, bloodBag: 2, ration: 5, antibiotic: 1, ammo: 1, intel: 0 },
    weapons,
    weaponOrder: WEAPON_DEFS.map((weapon) => weapon.id),
    currentWeapon: "infantryRifle",
    angle: -Math.PI / 2,
    recoil: 0,
    speed: 178,
    alive: true,
    lastDamageAt: -999,
    kills: 0,
    harvests: 0,
  };
  game.camera.x = game.player.x;
  game.camera.y = game.player.y;
}

function spawnFactionSquads() {
  const density = settings.npcDensity;
  for (const landmark of game.landmarks) {
    if (landmark.type === "base") continue;
    const squadCount = landmark.type === "bunker" || landmark.type === "depot" || landmark.type === "railYard" ? randInt(2, 3) : randInt(1, 2);
    for (let i = 0; i < squadCount * density; i += 1) {
      const size = landmark.factionId === "medics" ? randInt(3, 5) : landmark.factionId === "raiders" ? randInt(4, 6) : randInt(5, 8);
      createSquad(landmark.factionId, landmark, size, landmark.type === "bunker" ? "hold" : "patrol");
    }
  }

  const base = game.landmarks[0];
  for (let i = 0; i < 4 * density; i += 1) createSquad("expedition", base, randInt(5, 7), i === 0 ? "guard" : "patrol");

  const targetTotal = Math.floor((game.mapSize / 8200) * 96 * density * (0.82 + settings.difficulty * 0.22));
  while (game.npcs.length < targetTotal) {
    const landmark = pick(game.landmarks.slice(1));
    createSquad(landmark.factionId, landmark, randInt(3, 6), "patrol");
  }
}

function createSquad(factionId, landmark, size, objective) {
  const squad = {
    id: id(),
    factionId,
    unitName: pick(UNIT_NAMES[factionId]),
    home: { x: landmark.x, y: landmark.y, r: landmark.r, name: landmark.name },
    rally: randomNearby(landmark, landmark.r * 0.75),
    objective,
    target: null,
    lastEnemy: null,
    lastEnemyTime: -999,
    orderTimer: rand(5, 18),
    aggression: factionId === "raiders" ? rand(0.75, 1.1) : factionId === "medics" ? rand(0.25, 0.55) : rand(0.48, 0.92),
    cohesion: rand(0.72, 1.12),
    morale: rand(0.72, 1.15),
  };
  game.squads.push(squad);

  const roles = chooseSquadRoles(factionId, size);
  for (let i = 0; i < size; i += 1) {
    const spawn = randomNearby(landmark, Math.max(70, landmark.r * 0.55));
    game.npcs.push(createNpc(spawn.x, spawn.y, factionId, squad, roles[i] || "rifleman"));
  }
  return squad;
}

function chooseSquadRoles(factionId, size) {
  const roles = ["leader"];
  if (factionId === "medics") roles.push("medic", "medic", "rifleman", "scout");
  else if (factionId === "raiders") roles.push("assault", "assault", "gunner", "hunter", "rifleman");
  else if (factionId === "partisans") roles.push("scout", "hunter", "rifleman", "assault", "medic");
  else roles.push("rifleman", "assault", "gunner", "scout", "medic", "rifleman");
  while (roles.length < size) roles.push(pick(["rifleman", "assault", "scout", "hunter"]));
  return roles.slice(0, size).sort(() => game.rng() - 0.5);
}

function createNpc(x, y, factionId, squad, role) {
  const weaponId = weaponForRole(factionId, role);
  const def = WEAPON_BY_ID[weaponId];
  return {
    id: id(),
    kind: "npc",
    factionId,
    squadId: squad.id,
    unitName: squad.unitName,
    role,
    name: `${FACTIONS[factionId].short}${ROLE_LABELS[role] || "士兵"}`,
    x: clamp(x, WORLD_MARGIN, game.mapSize - WORLD_MARGIN),
    y: clamp(y, WORLD_MARGIN, game.mapSize - WORLD_MARGIN),
    vx: 0,
    vy: 0,
    radius: NPC_RADIUS,
    hp: rand(72, 108) * (0.92 + settings.difficulty * 0.08),
    maxHp: 100,
    hunger: rand(42, 100),
    statuses: { bleeding: 0, fracture: 0, infection: 0, starving: 0, suppressed: 0 },
    inventory: randomNpcInventory(role, factionId),
    weapon: { id: weaponId, mag: Math.ceil(def.magSize * rand(0.45, 1)), reserve: Math.ceil(def.startReserve * rand(0.12, 0.42)), reloadTimer: 0, cooldown: rand(0, 1), heat: 0, isReloading: false },
    angle: rand(0, TAU),
    recoil: 0,
    speed: rand(104, 144) * (role === "gunner" ? 0.86 : role === "scout" ? 1.08 : 1),
    alive: true,
    alertness: rand(0.56, 1.18) * settings.difficulty,
    aggression: clamp(squad.aggression + rand(-0.18, 0.22), 0.1, 1.35),
    medicalDiscipline: role === "medic" ? rand(0.9, 1.22) : rand(0.42, 0.9),
    hungerDiscipline: role === "hunter" ? rand(0.86, 1.16) : rand(0.42, 0.95),
    home: { ...squad.home },
    decision: { type: "regroup", target: squad.rally, until: game.minutes + rand(10, 30) },
    thinkTimer: rand(0.1, 1.2),
    memory: null,
    taskId: null,
    lastDamageAt: -999,
  };
}

function weaponForRole(factionId, role) {
  if (role === "gunner") return "stormLmg";
  if (role === "medic") return game.rng() < 0.8 ? "medicCarbine" : "serviceRevolver";
  if (role === "scout") return game.rng() < 0.55 ? "marksmanScout" : "infantryRifle";
  if (role === "hunter") return game.rng() < 0.62 ? "fieldBow" : "huntingShotgun";
  if (role === "assault") return game.rng() < 0.7 ? "trenchSmg" : "huntingShotgun";
  if (factionId === "raiders") return pick(["trenchSmg", "huntingShotgun", "serviceRevolver", "infantryRifle"]);
  if (factionId === "partisans") return pick(["infantryRifle", "fieldBow", "medicCarbine", "serviceRevolver"]);
  if (factionId === "medics") return pick(["medicCarbine", "serviceRevolver"]);
  return pick(["infantryRifle", "medicCarbine", "trenchSmg", "serviceRevolver"]);
}

function randomNpcInventory(role, factionId) {
  const inv = {
    bandage: game.rng() < 0.62 ? 1 : 0,
    splint: game.rng() < 0.22 ? 1 : 0,
    bloodBag: game.rng() < 0.18 ? 1 : 0,
    ration: game.rng() < 0.58 ? randInt(1, 2) : 0,
    antibiotic: game.rng() < 0.12 ? 1 : 0,
    ammo: game.rng() < 0.28 ? 1 : 0,
  };
  if (role === "medic" || factionId === "medics") {
    inv.bandage += 1;
    inv.bloodBag += game.rng() < 0.55 ? 1 : 0;
    inv.splint += game.rng() < 0.45 ? 1 : 0;
    inv.antibiotic += game.rng() < 0.35 ? 1 : 0;
  }
  if (role === "hunter") inv.ration += 1;
  if (factionId === "raiders") inv.ammo += game.rng() < 0.4 ? 1 : 0;
  return inv;
}

function spawnWildlife() {
  const size = game.mapSize;
  const count = Math.floor((size / 8200) * 82 * settings.wildlifeDensity);
  const forests = game.terrain.filter((patch) => patch.type === "forest" || patch.type === "grass");
  for (let i = 0; i < count; i += 1) {
    const roll = game.rng();
    const type = roll < 0.58 ? "deer" : roll < 0.83 ? "boar" : "wolf";
    let x = rand(120, size - 120);
    let y = rand(120, size - 120);
    const forest = forests.length ? pick(forests) : null;
    if (forest && game.rng() < 0.62) {
      x = clamp(forest.x + rand(-forest.r, forest.r), 90, size - 90);
      y = clamp(forest.y + rand(-forest.r, forest.r), 90, size - 90);
    }
    game.animals.push(createAnimal(type, x, y));
  }
}

function createAnimal(type, x, y) {
  const def = ANIMAL_DEFS[type];
  return {
    id: id(),
    kind: "animal",
    type,
    name: def.name,
    x,
    y,
    vx: 0,
    vy: 0,
    radius: def.radius,
    hp: def.hp,
    maxHp: def.hp,
    alive: true,
    state: "graze",
    target: randomNearby({ x, y }, 260),
    thinkTimer: rand(0.3, 2.4),
    meat: randInt(def.meat[0], def.meat[1]),
    lastAttackedAt: -999,
  };
}

function randomNearby(origin, radius) {
  const angle = rand(0, TAU);
  const distance = rand(radius * 0.2, radius);
  return { x: clamp(origin.x + Math.cos(angle) * distance, WORLD_MARGIN, game.mapSize - WORLD_MARGIN), y: clamp(origin.y + Math.sin(angle) * distance, WORLD_MARGIN, game.mapSize - WORLD_MARGIN) };
}

function generateTasks() {
  const factories = [createCaptureTask, createIntelTask, createHuntTask, createAirdropTask, createEliminateTask, createMedCacheTask, createNightTask, createDisruptTask];
  const shuffled = factories.slice().sort(() => game.rng() - 0.5);
  game.tasks = [];
  for (let i = 0; i < WIN_TASKS; i += 1) game.tasks.push(shuffled[i % shuffled.length]());
}

function candidateLandmark(types, hostileOnly = false) {
  let candidates = game.landmarks.filter((landmark) => types.includes(landmark.type));
  if (hostileOnly) candidates = candidates.filter((landmark) => isHostileFaction("expedition", landmark.factionId));
  return pick(candidates.length ? candidates : game.landmarks.slice(1));
}

function createCaptureTask() {
  const landmark = candidateLandmark(["relay", "watchPost", "bunker", "railYard"], true);
  return { id: id(), type: "capture", title: `占领 ${landmark.name}`, description: "进入目标圈并保持控制。圈内有敌人时进度减慢。", x: landmark.x, y: landmark.y, radius: Math.max(95, landmark.r * 0.55), progress: 0, required: 24, done: false };
}

function createIntelTask() {
  const landmark = candidateLandmark(["ruins", "village", "relay", "railYard"], true);
  const x = landmark.x + rand(-landmark.r * 0.45, landmark.r * 0.45);
  const y = landmark.y + rand(-landmark.r * 0.45, landmark.r * 0.45);
  const taskId = id();
  game.loot.push({ id: id(), type: "intel", name: "密封情报筒", x, y, radius: 16, searched: false, contents: { intel: 1 }, taskId, reservedForPlayer: true });
  return { id: taskId, type: "intel", title: `回收 ${landmark.name} 的情报`, description: "抵达标记处按 E 搜索情报筒。", x, y, radius: 54, progress: 0, required: 1, done: false };
}

function createHuntTask() {
  return { id: id(), type: "hunt", title: "狩猎并处理 3 份野味", description: "击倒动物后靠近尸体按 E 处理，获得口粮并计入任务。", progress: 0, required: 3, done: false };
}

function createAirdropTask() {
  game.nextAirdropMinutes = Math.min(game.nextAirdropMinutes, game.minutes + rand(48, 82));
  return { id: id(), type: "airdrop", title: "抢夺一次空投", description: "空投会吸引多阵营小队，等落地后按 E 搜索。", progress: 0, required: 1, done: false };
}

function createEliminateTask() {
  const landmark = candidateLandmark(["bunker", "depot", "watchPost", "railYard"], true);
  const taskId = id();
  const squad = createSquad(landmark.factionId, landmark, randInt(5, 7), "hold");
  let required = 0;
  for (const npc of game.npcs) {
    if (npc.squadId === squad.id) {
      npc.taskId = taskId;
      npc.alertness += 0.25;
      npc.aggression += 0.15;
      required += 1;
    }
  }
  return { id: taskId, type: "eliminate", title: `清除 ${landmark.name} 驻守小队`, description: "标记小队会协同防守，并会抢医疗和弹药。", x: landmark.x, y: landmark.y, radius: landmark.r, progress: 0, required, done: false };
}

function createMedCacheTask() {
  const landmark = candidateLandmark(["fieldHospital", "depot", "village"], true);
  const x = landmark.x + rand(-landmark.r * 0.55, landmark.r * 0.55);
  const y = landmark.y + rand(-landmark.r * 0.55, landmark.r * 0.55);
  const taskId = id();
  game.loot.push({ id: id(), type: "medcache", name: "分类医疗物资", x, y, radius: 17, searched: false, contents: { bandage: 2, splint: 1, antibiotic: 1, bloodBag: 1 }, taskId, reservedForPlayer: true });
  return { id: taskId, type: "medcache", title: `回收 ${landmark.name} 的医疗物资`, description: "按 E 搜索医疗箱。注意：这些物资各自只解决一种问题。", x, y, radius: 52, progress: 0, required: 1, done: false };
}

function createNightTask() {
  return { id: id(), type: "night", title: "完整熬过一个夜晚", description: "20:00 到 06:00 计入进度。夜间能见度下降，枪声更容易暴露位置。", progress: 0, required: 10 * 60, done: false };
}

function createDisruptTask() {
  const landmark = candidateLandmark(["relay", "bunker", "depot"], true);
  return { id: id(), type: "disrupt", title: `破坏 ${landmark.name} 的战术设施`, description: "在目标附近按 E 安放炸药并坚守数秒。", x: landmark.x, y: landmark.y, radius: 58, progress: 0, required: 10, armed: false, done: false };
}

function update(deltaTime) {
  if (game.state !== "playing") return;
  const dt = Math.min(deltaTime, MAX_DT);
  updateMouseWorld();
  updateTime(dt);
  updateWeather();
  updateSquads(dt);
  updatePlayer(dt);
  if (game.state !== "playing") return;
  updateNpcs(dt);
  updateAnimals(dt);
  updateBullets(dt);
  updateParticles(dt);
  updateAirdrop(dt);
  updateTasks(dt);
  updateCamera(dt);
  refreshInteractPrompt();
  checkEndings();
  cleanupWorld();

  game.lastHudUpdate += dt;
  game.lastMiniMapUpdate += dt;
  if (game.lastHudUpdate > 0.08) {
    updateHud();
    game.lastHudUpdate = 0;
  }
  if (game.lastMiniMapUpdate > 0.18) {
    drawMiniMap();
    game.lastMiniMapUpdate = 0;
  }

  input.interact = false;
  input.reload = false;
  input.useItem = null;
  if (!input.mouse.down) mouseFireWasDown = false;
}

function updateTime(dt) {
  const minutesPerSecond = 1440 / (settings.dayLengthMinutes * 60);
  game.minutes += dt * minutesPerSecond;
  game.stats.daysSurvived = Math.max(0, Math.floor((game.minutes - game.startMinutes) / 1440));
}

function updateWeather() {
  if (game.minutes < game.nextWeatherMinutes) return;
  const roll = game.rng();
  if (roll < 0.48) game.weather = { type: "晴朗", fog: 0, rain: 0, wind: { x: rand(-0.2, 0.2), y: rand(-0.2, 0.2) } };
  else if (roll < 0.73) game.weather = { type: "薄雾", fog: rand(0.18, 0.36), rain: 0, wind: { x: rand(-0.35, 0.35), y: rand(-0.35, 0.35) } };
  else if (roll < 0.9) game.weather = { type: "冷雨", fog: rand(0.12, 0.24), rain: rand(0.28, 0.65), wind: { x: rand(-0.8, 0.8), y: rand(-0.8, 0.8) } };
  else game.weather = { type: "浓雾", fog: rand(0.42, 0.62), rain: 0, wind: { x: rand(-0.25, 0.25), y: rand(-0.25, 0.25) } };
  game.nextWeatherMinutes = game.minutes + rand(300, 780);
  showToast(`天气变化：${game.weather.type}`, game.weather.fog > 0.4 ? "warn" : "");
}

function updateMouseWorld() {
  const zoom = game.camera.zoom || 1;
  input.mouse.worldX = game.camera.x + (input.mouse.x - game.width / 2) / zoom;
  input.mouse.worldY = game.camera.y + (input.mouse.y - game.height / 2) / zoom;
}

function updatePlayer(dt) {
  const player = game.player;
  if (!player?.alive) return;
  const weaponDef = WEAPON_BY_ID[player.currentWeapon];
  const weaponState = player.weapons[player.currentWeapon];
  updateWeaponState(player, weaponDef, weaponState, dt);
  applyStatusEffects(player, dt);
  if (!player.alive) return;

  const direction = { x: 0, y: 0 };
  if (input.keys.has("KeyW")) direction.y -= 1;
  if (input.keys.has("KeyS")) direction.y += 1;
  if (input.keys.has("KeyA")) direction.x -= 1;
  if (input.keys.has("KeyD")) direction.x += 1;
  const moving = direction.x !== 0 || direction.y !== 0;
  const norm = normalize(direction.x, direction.y);
  const sprinting = input.keys.has("ShiftLeft") || input.keys.has("ShiftRight");
  const aiming = input.mouse.right;
  let speed = player.speed * weaponDef.weight * terrainMoveMultiplier(player.x, player.y);
  if (sprinting && moving && !aiming && player.hunger > 4 && !player.statuses.fracture) speed *= 1.55;
  if (aiming) speed *= weaponDef.adsMove;
  if (player.statuses.fracture) speed *= 0.52;
  if (player.statuses.starving) speed *= 0.74;
  if (player.statuses.infection) speed *= 0.88;
  if (weaponState.reloadTimer > 0) speed *= 0.86;
  player.vx = norm.x * speed;
  player.vy = norm.y * speed;
  player.x += player.vx * dt;
  player.y += player.vy * dt;
  resolveWorldCollision(player);

  const aimAssist = settings.aimAssist * (aiming ? 1.35 : 0.7);
  const assisted = aimAssistTarget(player, input.mouse.worldX, input.mouse.worldY, aimAssist);
  const desiredAngle = Math.atan2(assisted.y - player.y, assisted.x - player.x);
  player.angle = lerpAngle(player.angle, desiredAngle, 1 - Math.exp(-dt * 11 * settings.sensitivity));

  const hungerDrainPerSecond = (100 / (settings.dayLengthMinutes * 60 * 1.35)) * settings.difficulty;
  player.hunger = clamp(player.hunger - hungerDrainPerSecond * dt * (sprinting && moving ? 2.15 : moving ? 1.18 : 0.72), 0, 100);
  if (player.hunger <= 0) player.statuses.starving = 1;
  else if (player.hunger > 14) player.statuses.starving = 0;

  if (input.reload) reloadWeapon(player, weaponDef, weaponState);
  if (input.useItem) usePlayerItem(input.useItem);
  if (wantsPlayerShot(weaponDef)) {
    const fired = tryFire(player, weaponDef, weaponState, player.angle, true);
    if (fired && weaponDef.autoReload && weaponState.mag <= 0) reloadWeapon(player, weaponDef, weaponState, true);
  }
  if (input.interact) interact();
}

function updateWeaponState(entity, def, state, dt) {
  state.cooldown = Math.max(0, state.cooldown - dt);
  const wasReloading = state.reloadTimer > 0 || state.isReloading;
  state.reloadTimer = Math.max(0, state.reloadTimer - dt);
  state.heat = Math.max(0, (state.heat || 0) - dt * 0.12);
  entity.recoil = Math.max(0, (entity.recoil || 0) - dt * def.recoilRecovery);
  if (wasReloading && state.reloadTimer <= 0 && state.isReloading) finishReload(entity, def, state);
}

function wantsPlayerShot(def) {
  if (!input.mouse.down) return false;
  if (def.auto) return true;
  if (!mouseFireWasDown) {
    mouseFireWasDown = true;
    return true;
  }
  return false;
}

function aimAssistTarget(player, targetX, targetY, strength) {
  if (strength <= 0) return { x: targetX, y: targetY };
  let best = null;
  let bestScore = 999;
  const aimAngle = Math.atan2(targetY - player.y, targetX - player.x);
  for (const npc of game.npcs) {
    if (!npc.alive || !isHostileFaction(player.factionId, npc.factionId)) continue;
    const d = dist(player, npc);
    if (d > 600) continue;
    const delta = Math.abs(wrapAngle(angleTo(player, npc) - aimAngle));
    const threshold = 0.17 + strength;
    if (delta < threshold && hasLineOfSight(player, npc, true)) {
      const score = delta * 3 + d / 900;
      if (score < bestScore) {
        best = npc;
        bestScore = score;
      }
    }
  }
  if (!best) return { x: targetX, y: targetY };
  return { x: lerp(targetX, best.x, strength), y: lerp(targetY, best.y, strength) };
}

function applyStatusEffects(entity, dt) {
  const playerMultiplier = entity.kind === "player" ? 1 : 0.65;
  if (entity.statuses.bleeding > 0) entity.hp -= dt * (0.78 + entity.statuses.bleeding * 0.35) * playerMultiplier * settings.difficulty;
  if (entity.statuses.infection > 0) {
    entity.hp -= dt * 0.16 * playerMultiplier;
    entity.hunger = clamp(entity.hunger - dt * 0.65, 0, 100);
  }
  if (entity.statuses.starving > 0) entity.hp -= dt * 0.58 * playerMultiplier;
  if (entity.statuses.suppressed > 0) entity.statuses.suppressed = Math.max(0, entity.statuses.suppressed - dt);
  if (entity.hp <= 0) {
    if (entity.kind === "player") killPlayer("身体状态恶化");
    else killNpc(entity, null, "status");
  }
}

function reloadWeapon(entity, def, weaponState, silent = false) {
  if (weaponState.reloadTimer > 0 || weaponState.isReloading) return false;
  if (weaponState.mag >= def.magSize || weaponState.reserve <= 0) return false;
  weaponState.reloadTimer = def.reloadTime * (entity.statuses.fracture ? 1.25 : 1);
  weaponState.isReloading = true;
  if (entity.kind === "player" && !silent) {
    showToast(`${def.shortName} 开始换弹`, "");
    playTone(260, 0.04, "triangle", 0.035, -40);
  }
  return true;
}

function finishReload(entity, def, weaponState) {
  const needed = def.magSize - weaponState.mag;
  const loaded = Math.min(needed, weaponState.reserve);
  weaponState.mag += loaded;
  weaponState.reserve -= loaded;
  weaponState.isReloading = false;
  weaponState.reloadTimer = 0;
  if (entity.kind === "player") playTone(310, 0.045, "triangle", 0.03, 70);
}

function tryFire(entity, def, weaponState, angle, isPlayer = false) {
  if (weaponState.reloadTimer > 0 || weaponState.cooldown > 0) return false;
  if (weaponState.mag <= 0) {
    if (isPlayer) {
      showToast("弹匣已空，按 R 换弹。", "warn");
      playTone(120, 0.05, "square", 0.025, 0);
    }
    reloadWeapon(entity, def, weaponState, !isPlayer);
    return false;
  }

  weaponState.mag -= 1;
  weaponState.cooldown = 1 / def.fireRate;
  weaponState.heat = Math.min(1.4, (weaponState.heat || 0) + (def.heatPerShot || 0.016));
  if (isPlayer) game.stats.shotsFired += 1;

  const movingPenalty = Math.hypot(entity.vx || 0, entity.vy || 0) > 30 ? 0.02 : 0;
  const aiming = entity.kind === "player" ? input.mouse.right : entity.decision?.aiming;
  let spread = aiming ? def.aimSpread : def.spread;
  spread += movingPenalty;
  spread += (entity.recoil || 0) * 0.025;
  spread += (weaponState.heat || 0) * 0.04;
  if (entity.statuses.fracture) spread += 0.05;
  if (entity.statuses.suppressed) spread += 0.035;
  if (!isPlayer) spread *= 1.2 / Math.max(0.72, settings.difficulty);

  const pellets = def.pellets || 1;
  for (let i = 0; i < pellets; i += 1) {
    const pelletSpread = spread * (pellets > 1 ? rand(0.55, 1.35) : 1);
    const shotAngle = angle + rand(-pelletSpread, pelletSpread) + rand(-pelletSpread, pelletSpread) * 0.5;
    spawnBullet(entity, def, shotAngle, pellets > 1 ? 0.92 : 1);
  }

  entity.recoil = Math.min(2.4, (entity.recoil || 0) + def.recoil);
  if (isPlayer) game.camera.shake = Math.min(18, game.camera.shake + def.kick * (input.mouse.right ? 0.56 : 1));
  if (isPlayer || dist(entity, game.player) < 1500) playWeaponSound(def, entity);
  makeMuzzleParticles(entity, angle, def);
  createNoise(entity.x, entity.y, def.noise, entity);
  return true;
}

function spawnBullet(owner, def, angle, damageMultiplier) {
  const muzzleDistance = owner.radius + 10;
  const speed = def.bulletSpeed * rand(0.94, 1.04);
  game.bullets.push({
    id: id(),
    owner,
    ownerKind: owner.kind,
    factionId: owner.factionId,
    x: owner.x + Math.cos(angle) * muzzleDistance,
    y: owner.y + Math.sin(angle) * muzzleDistance,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    damage: def.damage * damageMultiplier,
    maxRange: def.range * rand(0.92, 1.08),
    traveled: 0,
    radius: def.pellets > 1 ? 2.4 : def.ammoType === "arrow" ? 3.2 : 2.2,
    color: def.color,
    def,
    ttl: 2.4,
  });
}

function makeMuzzleParticles(entity, angle, def) {
  const amount = def.silent ? 2 : def.pellets > 1 ? 10 : def.auto ? 4 : 6;
  for (let i = 0; i < amount; i += 1) {
    const particleAngle = angle + rand(-0.55, 0.55);
    const speed = rand(30, def.silent ? 80 : 220);
    game.particles.push({ type: def.silent ? "dust" : "spark", x: entity.x + Math.cos(angle) * (entity.radius + 12), y: entity.y + Math.sin(angle) * (entity.radius + 12), vx: Math.cos(particleAngle) * speed, vy: Math.sin(particleAngle) * speed, life: rand(0.08, 0.24), maxLife: 0.24, color: def.color, size: rand(2, 6) });
  }
}

function createNoise(x, y, volume, sourceEntity) {
  if (volume < 0.2) return;
  const radius = 360 + volume * 620;
  for (const npc of game.npcs) {
    if (!npc.alive || npc === sourceEntity) continue;
    const d = distXY(x, y, npc.x, npc.y);
    if (d < radius && isHostileFaction(npc.factionId, sourceEntity.factionId)) {
      npc.memory = { x, y, time: game.minutes, target: sourceEntity.kind === "player" ? game.player : sourceEntity };
      const squad = getSquad(npc.squadId);
      if (squad) {
        squad.lastEnemy = npc.memory;
        squad.lastEnemyTime = game.minutes;
        if (sourceEntity.kind === "player") squad.objective = "attack";
      }
      if (!npc.decision || !["engage", "retreat"].includes(npc.decision.type)) npc.decision = { type: "investigate", target: { x, y }, until: game.minutes + rand(15, 45) };
      npc.thinkTimer = Math.min(npc.thinkTimer, 0.18);
    }
  }

  for (const animal of game.animals) {
    if (!animal.alive) continue;
    const d = distXY(x, y, animal.x, animal.y);
    if (d < radius * 0.78) {
      animal.state = "flee";
      animal.target = pointAwayFrom(animal, { x, y }, 330);
      animal.thinkTimer = rand(0.6, 1.5);
    }
  }
}

function updateSquads(dt) {
  for (const squad of game.squads) {
    squad.orderTimer -= dt;
    const members = game.npcs.filter((npc) => npc.alive && npc.squadId === squad.id);
    if (!members.length) continue;
    squad.center = members.reduce((acc, npc) => ({ x: acc.x + npc.x / members.length, y: acc.y + npc.y / members.length }), { x: 0, y: 0 });

    if (game.airdrop && !game.airdrop.looted && game.airdrop.phase !== "gone") {
      const d = distXY(squad.center.x, squad.center.y, game.airdrop.x, game.airdrop.y);
      const utility = squad.aggression + (squad.factionId === "raiders" ? 0.5 : 0) + (squad.factionId === "medics" ? -0.25 : 0) - d / 2800;
      if (utility > 0.25) {
        squad.objective = "airdrop";
        squad.target = game.airdrop;
      }
    }

    if (squad.lastEnemy && game.minutes - squad.lastEnemyTime < 50 && squad.objective !== "airdrop") {
      squad.objective = "attack";
      squad.target = squad.lastEnemy.target || squad.lastEnemy;
    }

    if (squad.orderTimer <= 0) {
      squad.orderTimer = rand(9, 24);
      if (!squad.lastEnemy || game.minutes - squad.lastEnemyTime > 60) {
        squad.objective = squad.objective === "guard" ? "guard" : "patrol";
        squad.rally = randomNearby(squad.home, squad.home.r * rand(0.45, 1.25));
        squad.target = squad.rally;
      }
    }
  }
}

function updateNpcs(dt) {
  for (const npc of game.npcs) {
    if (!npc.alive) continue;
    const def = WEAPON_BY_ID[npc.weapon.id];
    updateWeaponState(npc, def, npc.weapon, dt);
    npc.hunger = clamp(npc.hunger - dt * 0.22 * settings.difficulty, 0, 100);
    if (npc.hunger <= 0) npc.statuses.starving = 1;
    else if (npc.hunger > 16) npc.statuses.starving = 0;
    applyStatusEffects(npc, dt);
    if (!npc.alive) continue;

    npc.thinkTimer -= dt;
    if (npc.thinkTimer <= 0) {
      npc.decision = chooseNpcDecision(npc);
      npc.thinkTimer = rand(0.32, 0.9) / clamp(npc.alertness, 0.6, 1.7);
    }
    executeNpcDecision(npc, dt);
  }
}

function chooseNpcDecision(npc) {
  const visibleEnemy = findVisibleHostile(npc);
  if (visibleEnemy) rememberEnemy(npc, visibleEnemy);

  const support = chooseSupportAlly(npc);
  if (support) return support;

  const urgentMedical = chooseNpcMedical(npc);
  if (urgentMedical) return urgentMedical;

  const loot = findBestNpcLoot(npc);
  if (loot && loot.score > 1.15) return { type: "loot", target: loot.item, until: game.minutes + 25 };

  const target = visibleEnemy || (npc.memory && game.minutes - npc.memory.time < 40 ? npc.memory.target : null);
  if (isAlive(target) && isHostileFaction(npc.factionId, target.factionId)) return chooseCombatDecision(npc, target);

  if (npc.hunger < 36 * npc.hungerDiscipline) {
    if (npc.inventory.ration > 0 && npc.hunger < 48) return { type: "use", item: "ration", until: game.minutes + 4 };
    const prey = findNearestAnimal(npc, 900, true);
    if (prey) return { type: "hunt", target: prey, until: game.minutes + rand(25, 70) };
    const carcass = findNearestCarcass(npc, 680);
    if (carcass) return { type: "loot", target: carcass, until: game.minutes + 25 };
  }

  const squad = getSquad(npc.squadId);
  if (squad) {
    if (squad.objective === "airdrop" && game.airdrop && !game.airdrop.looted) return { type: "airdrop", target: game.airdrop, until: game.minutes + rand(35, 95) };
    if (squad.objective === "attack" && squad.target) return { type: "investigate", target: squad.target, until: game.minutes + rand(20, 55) };
    if (squad.center && distXY(npc.x, npc.y, squad.center.x, squad.center.y) > 240 / squad.cohesion) return { type: "regroup", target: squad.rally || squad.center, until: game.minutes + rand(10, 35) };
    if (!npc.decision || npc.decision.type !== "patrol" || !npc.decision.target || distXY(npc.x, npc.y, npc.decision.target.x, npc.decision.target.y) < 35 || game.minutes > npc.decision.until) return { type: "patrol", target: randomNearby(squad.rally || squad.home, squad.home.r), until: game.minutes + rand(55, 150) };
  }
  return npc.decision || { type: "patrol", target: randomNearby(npc.home, npc.home.r), until: game.minutes + rand(45, 110) };
}

function chooseCombatDecision(npc, target) {
  if (npc.hp < 26 && npc.inventory.bloodBag <= 0) return { type: "retreat", target: pointAwayFrom(npc, target, 420), until: game.minutes + rand(18, 42), enemy: target };
  const def = WEAPON_BY_ID[npc.weapon.id];
  const preferred = preferredRange(def);
  const d = dist(npc, target);
  const role = npc.role;
  if (role === "medic" && npc.hp < 54) return { type: "retreat", target: pointAwayFrom(npc, target, 360), until: game.minutes + rand(12, 30), enemy: target };
  if (d > preferred.max * 1.14) return { type: "advance", target, until: game.minutes + 10, enemy: target };
  if (d < preferred.min && !["huntingShotgun", "trenchSmg"].includes(def.id)) return { type: "retreat", target: pointAwayFrom(npc, target, preferred.min + 80), until: game.minutes + 18, enemy: target };
  if (role === "gunner" || def.id === "stormLmg") return { type: "suppress", target, aiming: true, until: game.minutes + rand(8, 20), enemy: target };
  if ((role === "assault" || role === "scout") && game.rng() < 0.34) return { type: "flank", target: flankPoint(npc, target), enemy: target, until: game.minutes + rand(18, 42) };
  return { type: "engage", target, aiming: d > 260 || def.id === "marksmanScout", until: game.minutes + rand(8, 24), enemy: target };
}

function chooseNpcMedical(npc) {
  const discipline = npc.medicalDiscipline;
  if (npc.statuses.bleeding && npc.inventory.bandage > 0 && npc.hp < 92 * discipline) return { type: "use", item: "bandage", until: game.minutes + 4 };
  if (npc.statuses.fracture && npc.inventory.splint > 0) return { type: "use", item: "splint", until: game.minutes + 4 };
  if (npc.hp < 38 * discipline && npc.inventory.bloodBag > 0) return { type: "use", item: "bloodBag", until: game.minutes + 5 };
  if (npc.statuses.infection && npc.inventory.antibiotic > 0) return { type: "use", item: "antibiotic", until: game.minutes + 4 };
  if (npc.hunger < 28 * npc.hungerDiscipline && npc.inventory.ration > 0) return { type: "use", item: "ration", until: game.minutes + 4 };
  if (npc.weapon.reserve < WEAPON_BY_ID[npc.weapon.id].magSize && npc.inventory.ammo > 0) return { type: "use", item: "ammo", until: game.minutes + 3 };
  return null;
}

function chooseSupportAlly(npc) {
  if (npc.role !== "medic" && npc.factionId !== "medics") return null;
  let best = null;
  let bestScore = 0;
  for (const ally of game.npcs) {
    if (!ally.alive || ally === npc || ally.factionId !== npc.factionId) continue;
    const d = dist(npc, ally);
    if (d > 360) continue;
    let score = 0;
    if (ally.statuses.bleeding && npc.inventory.bandage > 0) score += 1.3;
    if (ally.statuses.fracture && npc.inventory.splint > 0) score += 1.0;
    if (ally.hp < 42 && npc.inventory.bloodBag > 0) score += 1.2;
    score -= d / 520;
    if (score > bestScore) {
      best = ally;
      bestScore = score;
    }
  }
  if (best && bestScore > 0.65) return { type: "support", target: best, until: game.minutes + 10 };
  return null;
}

function findBestNpcLoot(npc) {
  let best = null;
  for (const item of [...game.loot, ...game.corpses]) {
    if (item.reservedForPlayer || item.searched || item.harvested || item.looted) continue;
    const d = distXY(npc.x, npc.y, item.x, item.y);
    if (d > 460) continue;
    let score = 0.1;
    const contents = item.contents || item.loot || {};
    if (contents.bandage && npc.statuses.bleeding) score += 1.4;
    if (contents.splint && npc.statuses.fracture) score += 1.2;
    if (contents.bloodBag && npc.hp < 60) score += 1.5;
    if (contents.ration && npc.hunger < 58) score += 1.2;
    if (contents.antibiotic && npc.statuses.infection) score += 1.1;
    if (contents.ammo || item.type === "airdrop") score += npc.weapon.reserve < WEAPON_BY_ID[npc.weapon.id].magSize ? 1 : 0.25;
    if (item.type === "animalCorpse") score += npc.hunger < 62 ? 1.05 : 0.1;
    score += item.type === "airdrop" ? 0.65 : 0;
    score -= d / 650;
    if (!best || score > best.score) best = { item, score };
  }
  if (game.airdrop && game.airdrop.phase === "landed" && !game.airdrop.looted) {
    const d = distXY(npc.x, npc.y, game.airdrop.x, game.airdrop.y);
    const score = 1.35 + npc.aggression - d / 950;
    if (!best || score > best.score) best = { item: game.airdrop, score };
  }
  return best;
}

function preferredRange(def) {
  if (def.id === "trenchSmg") return { min: 80, max: 360 };
  if (def.id === "huntingShotgun") return { min: 35, max: 230 };
  if (def.id === "stormLmg") return { min: 170, max: 620 };
  if (def.id === "marksmanScout") return { min: 360, max: 1050 };
  if (def.id === "serviceRevolver") return { min: 70, max: 320 };
  if (def.id === "fieldBow") return { min: 90, max: 390 };
  if (def.id === "medicCarbine") return { min: 140, max: 600 };
  return { min: 220, max: 760 };
}

function executeNpcDecision(npc, dt) {
  const decision = npc.decision || { type: "patrol", target: npc.home };
  let target = decision.target;
  let speedFactor = 1;

  switch (decision.type) {
    case "use":
      useNpcItem(npc, decision.item);
      npc.decision = { type: "regroup", target: getSquad(npc.squadId)?.rally || npc.home, until: game.minutes + 20 };
      return;
    case "support":
      if (!target || !target.alive) return;
      if (dist(npc, target) < 34) {
        supportAlly(npc, target);
        npc.decision = chooseNpcDecision(npc);
        return;
      }
      speedFactor = 0.9;
      break;
    case "engage":
      engageTarget(npc, decision.enemy || target, dt, decision.aiming);
      speedFactor = decision.aiming ? 0.34 : 0.55;
      target = combatStrafeTarget(npc, decision.enemy || target);
      break;
    case "suppress":
      engageTarget(npc, target, dt, true, true);
      speedFactor = 0.2;
      target = combatStrafeTarget(npc, target, 48);
      break;
    case "advance":
      target = decision.enemy || target;
      speedFactor = 0.86;
      if (isAlive(target) && dist(npc, target) < preferredRange(WEAPON_BY_ID[npc.weapon.id]).max) engageTarget(npc, target, dt, true);
      break;
    case "retreat":
      target = decision.target;
      speedFactor = 1.08;
      if (isAlive(decision.enemy) && canNpcSee(npc, decision.enemy)) engageTarget(npc, decision.enemy, dt, false);
      break;
    case "flank":
      speedFactor = 0.96;
      if (isAlive(decision.enemy) && canNpcSee(npc, decision.enemy) && dist(npc, decision.enemy) < preferredRange(WEAPON_BY_ID[npc.weapon.id]).max) engageTarget(npc, decision.enemy, dt, true);
      break;
    case "hunt":
      if (!target || !target.alive) {
        npc.decision = chooseNpcDecision(npc);
        return;
      }
      speedFactor = 0.92;
      if (dist(npc, target) < preferredRange(WEAPON_BY_ID[npc.weapon.id]).max * 0.65 && hasLineOfSight(npc, target, true)) engageTarget(npc, target, dt, true);
      break;
    case "loot":
      if (!target || target.searched || target.harvested || target.looted) {
        npc.decision = chooseNpcDecision(npc);
        return;
      }
      if (distXY(npc.x, npc.y, target.x, target.y) < 36) {
        npcLoot(npc, target);
        npc.decision = chooseNpcDecision(npc);
        return;
      }
      speedFactor = 0.88;
      break;
    case "airdrop":
      if (!game.airdrop || game.airdrop.looted || game.airdrop.phase === "gone") {
        npc.decision = chooseNpcDecision(npc);
        return;
      }
      target = game.airdrop;
      speedFactor = 1.05;
      if (distXY(npc.x, npc.y, target.x, target.y) < 42 && target.phase === "landed") {
        npcLoot(npc, target);
        return;
      }
      if (canNpcSee(npc, game.player)) engageTarget(npc, game.player, dt, false);
      break;
    case "investigate":
      speedFactor = 0.82;
      break;
    case "regroup":
      speedFactor = 1.0;
      break;
    case "patrol":
    default:
      speedFactor = 0.62;
      break;
  }

  if (target?.x !== undefined) moveEntityToward(npc, target, dt, speedFactor);
}

function engageTarget(npc, target, dt, aiming = true, suppressing = false) {
  if (!isAlive(target)) return false;
  const def = WEAPON_BY_ID[npc.weapon.id];
  if (npc.weapon.mag <= 0) reloadWeapon(npc, def, npc.weapon, true);
  const d = dist(npc, target);
  const max = preferredRange(def).max * (suppressing ? 1.2 : 1);
  if (d > max || !hasLineOfSight(npc, target, true)) return false;
  const lead = def.bulletSpeed > 0 ? clamp(d / def.bulletSpeed, 0, 0.8) : 0;
  const aimX = target.x + (target.vx || 0) * lead;
  const aimY = target.y + (target.vy || 0) * lead;
  let angle = Math.atan2(aimY - npc.y, aimX - npc.x);
  const skill = clamp(0.52 + npc.alertness * 0.18 + settings.difficulty * 0.14, 0.45, 0.96);
  const error = (1 - skill) * rand(-0.24, 0.24) + (npc.statuses.suppressed ? rand(-0.16, 0.16) : 0);
  angle += error;
  npc.angle = lerpAngle(npc.angle, angle, 1 - Math.exp(-dt * (aiming ? 7 : 4)));
  npc.decision.aiming = aiming;
  return tryFire(npc, def, npc.weapon, npc.angle, false);
}

function moveEntityToward(entity, target, dt, speedFactor = 1) {
  const dx = target.x - entity.x;
  const dy = target.y - entity.y;
  const n = normalize(dx, dy);
  if (n.length < 10) {
    entity.vx = 0;
    entity.vy = 0;
    return;
  }
  let speed = entity.speed * speedFactor;
  if (entity.statuses.fracture) speed *= 0.52;
  if (entity.statuses.starving) speed *= 0.74;
  if (entity.statuses.suppressed) speed *= 0.8;
  speed *= terrainMoveMultiplier(entity.x, entity.y);
  entity.vx = n.x * speed;
  entity.vy = n.y * speed;
  entity.x += entity.vx * dt;
  entity.y += entity.vy * dt;
  entity.angle = lerpAngle(entity.angle, Math.atan2(n.y, n.x), 1 - Math.exp(-dt * 4));
  resolveWorldCollision(entity);
}

function combatStrafeTarget(npc, target, radius = 90) {
  if (!target) return npc;
  const side = Math.sin(game.minutes * 0.31 + npc.id.length) > 0 ? 1 : -1;
  const angle = angleTo(target, npc) + side * Math.PI / 2;
  return { x: npc.x + Math.cos(angle) * radius, y: npc.y + Math.sin(angle) * radius };
}

function flankPoint(npc, target) {
  const side = game.rng() < 0.5 ? -1 : 1;
  const base = angleTo(target, npc) + side * rand(0.8, 1.35);
  return { x: clamp(target.x + Math.cos(base) * rand(180, 360), WORLD_MARGIN, game.mapSize - WORLD_MARGIN), y: clamp(target.y + Math.sin(base) * rand(180, 360), WORLD_MARGIN, game.mapSize - WORLD_MARGIN) };
}

function pointAwayFrom(entity, threat, distance) {
  const angle = Math.atan2(entity.y - threat.y, entity.x - threat.x);
  return { x: clamp(entity.x + Math.cos(angle) * distance, WORLD_MARGIN, game.mapSize - WORLD_MARGIN), y: clamp(entity.y + Math.sin(angle) * distance, WORLD_MARGIN, game.mapSize - WORLD_MARGIN) };
}

function rememberEnemy(npc, target) {
  npc.memory = { x: target.x, y: target.y, time: game.minutes, target };
  const squad = getSquad(npc.squadId);
  if (squad) {
    squad.lastEnemy = npc.memory;
    squad.lastEnemyTime = game.minutes;
    squad.target = target;
  }
}

function findVisibleHostile(npc) {
  let best = null;
  let bestScore = Infinity;
  const candidates = [game.player, ...game.npcs];
  for (const target of candidates) {
    if (!target || target === npc || !target.alive || target.factionId === npc.factionId) continue;
    if (!isHostileFaction(npc.factionId, target.factionId)) continue;
    const d = dist(npc, target);
    const max = npcVisionRange(npc, target);
    if (d > max) continue;
    if (!hasLineOfSight(npc, target, true)) continue;
    const score = d - (target.kind === "player" ? 80 : 0) - (target.statuses?.suppressed ? 25 : 0);
    if (score < bestScore) {
      best = target;
      bestScore = score;
    }
  }
  return best;
}

function canNpcSee(npc, target) {
  return isAlive(target) && dist(npc, target) <= npcVisionRange(npc, target) && hasLineOfSight(npc, target, true);
}

function npcVisionRange(npc, target) {
  const hour = getHour();
  const night = hour < 6 || hour >= 20;
  let range = 760 * npc.alertness;
  if (night) range *= 0.58;
  range *= 1 - game.weather.fog * 0.52;
  if (target?.kind === "player" && input.keys.has("ShiftLeft")) range *= 1.12;
  if (target?.statuses?.suppressed) range *= 1.06;
  return clamp(range, 240, 950);
}

function getSquad(squadId) {
  return game.squads.find((squad) => squad.id === squadId);
}

function useNpcItem(npc, item) {
  if (!npc.inventory[item]) return false;
  const def = WEAPON_BY_ID[npc.weapon.id];
  switch (item) {
    case "bandage":
      if (!npc.statuses.bleeding) return false;
      npc.statuses.bleeding = 0;
      break;
    case "splint":
      if (!npc.statuses.fracture) return false;
      npc.statuses.fracture = 0;
      break;
    case "bloodBag":
      if (npc.hp >= npc.maxHp) return false;
      npc.hp = clamp(npc.hp + 42, 0, npc.maxHp);
      break;
    case "ration":
      if (npc.hunger >= 95) return false;
      npc.hunger = clamp(npc.hunger + 46, 0, 100);
      if (npc.hunger > 12) npc.statuses.starving = 0;
      break;
    case "antibiotic":
      if (!npc.statuses.infection) return false;
      npc.statuses.infection = 0;
      break;
    case "ammo":
      npc.weapon.reserve += def.magSize * 3;
      break;
    default:
      return false;
  }
  npc.inventory[item] -= 1;
  makeUseParticles(npc, item);
  return true;
}

function supportAlly(medic, ally) {
  if (ally.statuses.bleeding && medic.inventory.bandage > 0) {
    medic.inventory.bandage -= 1;
    ally.statuses.bleeding = 0;
  } else if (ally.statuses.fracture && medic.inventory.splint > 0) {
    medic.inventory.splint -= 1;
    ally.statuses.fracture = 0;
  } else if (ally.hp < 55 && medic.inventory.bloodBag > 0) {
    medic.inventory.bloodBag -= 1;
    ally.hp = clamp(ally.hp + 40, 0, ally.maxHp);
  }
  makeUseParticles(ally, "bloodBag");
}

function usePlayerItem(item) {
  const player = game.player;
  if (!player.inventory[item]) {
    showToast(`${ITEM_NAMES[item]}不足`, "warn");
    return false;
  }
  const weapon = player.weapons[player.currentWeapon];
  const def = WEAPON_BY_ID[player.currentWeapon];
  switch (item) {
    case "bandage":
      if (!player.statuses.bleeding) return showNoNeed("没有流血，绷带不会回血。"), false;
      player.statuses.bleeding = 0;
      showToast("绷带已使用：流血停止，但没有回血。", "good");
      break;
    case "splint":
      if (!player.statuses.fracture) return showNoNeed("没有骨折，夹板不会回血。"), false;
      player.statuses.fracture = 0;
      showToast("夹板已固定：骨折 debuff 移除。", "good");
      break;
    case "bloodBag":
      if (player.hp >= player.maxHp) return showNoNeed("血量已满，输血包是唯一回血手段。"), false;
      player.hp = clamp(player.hp + 46, 0, player.maxHp);
      showToast("输血完成：恢复血量，但不会治疗流血/骨折/感染。", "good");
      break;
    case "ration":
      if (player.hunger >= 98) return showNoNeed("现在不饿，口粮只恢复饥饿度。"), false;
      player.hunger = clamp(player.hunger + 45, 0, 100);
      if (player.hunger > 12) player.statuses.starving = 0;
      showToast("吃下口粮：饥饿度恢复。", "good");
      break;
    case "antibiotic":
      if (!player.statuses.infection) return showNoNeed("没有感染，抗生素不会回血。"), false;
      player.statuses.infection = 0;
      showToast("抗生素已使用：感染 debuff 移除。", "good");
      break;
    case "ammo":
      weapon.reserve += def.magSize * 3;
      showToast(`${def.shortName} 获得 ${def.magSize * 3} 发备用弹药。`, "good");
      break;
    default:
      return false;
  }
  player.inventory[item] -= 1;
  makeUseParticles(player, item);
  playTone(360, 0.08, "triangle", 0.045, 80);
  return true;
}

function showNoNeed(message) {
  showToast(message, "warn");
}

function makeUseParticles(entity, item) {
  const color = item === "bloodBag" ? "#e65757" : item === "ration" ? "#f0d06b" : item === "ammo" ? "#d0d0d0" : "#9ee7a0";
  for (let i = 0; i < 12; i += 1) {
    const a = rand(0, TAU);
    game.particles.push({ type: "heal", x: entity.x + Math.cos(a) * rand(0, entity.radius), y: entity.y + Math.sin(a) * rand(0, entity.radius), vx: Math.cos(a) * rand(8, 36), vy: Math.sin(a) * rand(8, 36) - 12, life: rand(0.28, 0.65), maxLife: 0.65, color, size: rand(2, 5) });
  }
}

function terrainMoveMultiplier(x, y) {
  for (const patch of game.terrain) {
    if (Math.abs(x - patch.x) > patch.r * patch.rx || Math.abs(y - patch.y) > patch.r * patch.ry) continue;
    const dx = (x - patch.x) / (patch.r * patch.rx);
    const dy = (y - patch.y) / (patch.r * patch.ry);
    if (dx * dx + dy * dy < 1) {
      if (patch.type === "mud") return 0.78;
      if (patch.type === "water") return 0.58;
      if (patch.type === "forest") return 0.88;
      if (patch.type === "crater") return 0.92;
    }
  }
  return 1;
}

function resolveWorldCollision(entity) {
  entity.x = clamp(entity.x, entity.radius, game.mapSize - entity.radius);
  entity.y = clamp(entity.y, entity.radius, game.mapSize - entity.radius);
  for (const obstacle of game.obstacles) {
    if (!obstacle.blocks) continue;
    if (obstacle.radius) {
      const d = distXY(entity.x, entity.y, obstacle.x, obstacle.y);
      const minD = entity.radius + obstacle.radius * 0.82;
      if (d < minD && d > 0.001) {
        const push = (minD - d) / d;
        entity.x += (entity.x - obstacle.x) * push;
        entity.y += (entity.y - obstacle.y) * push;
      }
    } else if (circleRectCollide(entity.x, entity.y, entity.radius, obstacle)) {
      const left = obstacle.x - obstacle.w / 2;
      const right = obstacle.x + obstacle.w / 2;
      const top = obstacle.y - obstacle.h / 2;
      const bottom = obstacle.y + obstacle.h / 2;
      const pushLeft = Math.abs(entity.x - left);
      const pushRight = Math.abs(right - entity.x);
      const pushTop = Math.abs(entity.y - top);
      const pushBottom = Math.abs(bottom - entity.y);
      const min = Math.min(pushLeft, pushRight, pushTop, pushBottom);
      if (min === pushLeft) entity.x = left - entity.radius;
      else if (min === pushRight) entity.x = right + entity.radius;
      else if (min === pushTop) entity.y = top - entity.radius;
      else entity.y = bottom + entity.radius;
    }
  }
  entity.x = clamp(entity.x, entity.radius, game.mapSize - entity.radius);
  entity.y = clamp(entity.y, entity.radius, game.mapSize - entity.radius);
}

function hasLineOfSight(a, b, ignoreSoft = false) {
  const d = dist(a, b);
  const steps = clamp(Math.ceil(d / 52), 2, 34);
  for (let i = 1; i < steps; i += 1) {
    const t = i / steps;
    const x = lerp(a.x, b.x, t);
    const y = lerp(a.y, b.y, t);
    for (const obstacle of game.obstacles) {
      if (!obstacle.cover && !obstacle.blocks) continue;
      if (ignoreSoft && obstacle.type === "tree" && game.rng() < 0.55) continue;
      if (Math.abs(x - obstacle.x) > (obstacle.radius || Math.max(obstacle.w, obstacle.h)) + 16 || Math.abs(y - obstacle.y) > (obstacle.radius || Math.max(obstacle.w, obstacle.h)) + 16) continue;
      if (pointInsideObstacle(x, y, obstacle)) return false;
    }
  }
  return true;
}

function pointInsideObstacle(x, y, obstacle) {
  if (obstacle.radius) return distXY(x, y, obstacle.x, obstacle.y) < obstacle.radius * 0.86;
  return x >= obstacle.x - obstacle.w / 2 && x <= obstacle.x + obstacle.w / 2 && y >= obstacle.y - obstacle.h / 2 && y <= obstacle.y + obstacle.h / 2;
}

function updateAnimals(dt) {
  for (const animal of game.animals) {
    if (!animal.alive) continue;
    const def = ANIMAL_DEFS[animal.type];
    animal.thinkTimer -= dt;
    const nearestThreat = findNearestAnimalThreat(animal);
    if (nearestThreat && dist(animal, nearestThreat) < (animal.type === "wolf" ? 170 : 260)) {
      if (def.behavior === "predator" || (def.behavior === "territorial" && dist(animal, nearestThreat) < 72 && game.rng() < 0.45)) {
        animal.state = "attack";
        animal.target = nearestThreat;
      } else {
        animal.state = "flee";
        animal.target = pointAwayFrom(animal, nearestThreat, 330);
      }
      animal.thinkTimer = rand(0.45, 1.2);
    } else if (animal.thinkTimer <= 0 || distXY(animal.x, animal.y, animal.target.x, animal.target.y) < 22) {
      animal.state = "graze";
      animal.target = randomNearby(animal, rand(120, 320));
      animal.thinkTimer = rand(1.5, 4.5);
    }

    if (animal.state === "attack" && isAlive(animal.target)) {
      moveAnimal(animal, animal.target, dt, def.fleeSpeed * 0.96);
      if (dist(animal, animal.target) < animal.radius + animal.target.radius + 6 && game.minutes - animal.lastAttackedAt > 0.04) {
        animal.lastAttackedAt = game.minutes;
        damageEntity(animal.target, def.damage || 8, animal, { animalAttack: true, bleedChance: 0.1, fractureChance: animal.type === "boar" ? 0.1 : 0.03 });
      }
    } else {
      const speed = animal.state === "flee" ? def.fleeSpeed : def.speed;
      moveAnimal(animal, animal.target, dt, speed);
    }
  }
}

function moveAnimal(animal, target, dt, speed) {
  if (!target) return;
  const n = normalize(target.x - animal.x, target.y - animal.y);
  animal.vx = n.x * speed * terrainMoveMultiplier(animal.x, animal.y);
  animal.vy = n.y * speed * terrainMoveMultiplier(animal.x, animal.y);
  animal.x += animal.vx * dt;
  animal.y += animal.vy * dt;
  animal.angle = Math.atan2(n.y, n.x);
  resolveWorldCollision(animal);
}

function findNearestAnimalThreat(animal) {
  let best = null;
  let bestD = Infinity;
  const candidates = [game.player, ...game.npcs];
  for (const c of candidates) {
    if (!isAlive(c)) continue;
    const d = dist(animal, c);
    const range = animal.type === "wolf" ? 360 : 270;
    if (d < range && d < bestD) {
      best = c;
      bestD = d;
    }
  }
  return best;
}

function findNearestAnimal(entity, maxDistance, preyOnly = false) {
  let best = null;
  let bestD = maxDistance;
  for (const animal of game.animals) {
    if (!animal.alive) continue;
    if (preyOnly && animal.type === "wolf") continue;
    const d = dist(entity, animal);
    if (d < bestD) {
      best = animal;
      bestD = d;
    }
  }
  return best;
}

function findNearestCarcass(entity, maxDistance) {
  let best = null;
  let bestD = maxDistance;
  for (const corpse of game.corpses) {
    if (corpse.type !== "animalCorpse" || corpse.harvested) continue;
    const d = distXY(entity.x, entity.y, corpse.x, corpse.y);
    if (d < bestD) {
      best = corpse;
      bestD = d;
    }
  }
  return best;
}

function updateBullets(dt) {
  for (const bullet of game.bullets) {
    if (bullet.dead) continue;
    const prevX = bullet.x;
    const prevY = bullet.y;
    bullet.x += bullet.vx * dt;
    bullet.y += bullet.vy * dt;
    const moved = distXY(prevX, prevY, bullet.x, bullet.y);
    bullet.traveled += moved;
    bullet.ttl -= dt;

    if (bullet.traveled > bullet.maxRange || bullet.ttl <= 0 || bullet.x < 0 || bullet.y < 0 || bullet.x > game.mapSize || bullet.y > game.mapSize) {
      bullet.dead = true;
      continue;
    }

    if (bulletHitsObstacle(bullet)) {
      bullet.dead = true;
      makeImpactParticles(bullet.x, bullet.y, bullet.color, 6);
      continue;
    }

    const target = findBulletTarget(bullet);
    if (target) {
      bullet.dead = true;
      damageEntity(target, scaledBulletDamage(bullet), bullet.owner, bullet.def);
      makeImpactParticles(bullet.x, bullet.y, target.kind === "animal" ? "#6b3325" : "#b33434", 9);
      continue;
    }

    applySuppression(bullet);
  }
}

function scaledBulletDamage(bullet) {
  const falloff = clamp(1 - bullet.traveled / (bullet.maxRange * 1.35), 0.35, 1);
  return bullet.damage * falloff;
}

function bulletHitsObstacle(bullet) {
  for (const obstacle of game.obstacles) {
    if (!obstacle.blocks && !obstacle.cover) continue;
    if (Math.abs(bullet.x - obstacle.x) > (obstacle.radius || obstacle.w || 30) + 20 || Math.abs(bullet.y - obstacle.y) > (obstacle.radius || obstacle.h || 30) + 20) continue;
    if (obstacle.radius) {
      if (distXY(bullet.x, bullet.y, obstacle.x, obstacle.y) < obstacle.radius) return true;
    } else if (pointInsideObstacle(bullet.x, bullet.y, obstacle)) return true;
  }
  return false;
}

function findBulletTarget(bullet) {
  if (bullet.owner !== game.player && game.player.alive && bullet.factionId !== game.player.factionId && isHostileFaction(bullet.factionId, game.player.factionId) && distXY(bullet.x, bullet.y, game.player.x, game.player.y) < game.player.radius + bullet.radius) return game.player;

  for (const npc of game.npcs) {
    if (!npc.alive || npc === bullet.owner || npc.factionId === bullet.factionId) continue;
    if (bullet.ownerKind !== "player" && !isHostileFaction(bullet.factionId, npc.factionId)) continue;
    if (distXY(bullet.x, bullet.y, npc.x, npc.y) < npc.radius + bullet.radius) return npc;
  }

  for (const animal of game.animals) {
    if (!animal.alive) continue;
    if (distXY(bullet.x, bullet.y, animal.x, animal.y) < animal.radius + bullet.radius) return animal;
  }
  return null;
}

function applySuppression(bullet) {
  const suppressRange = bullet.def.id === "stormLmg" ? 72 : 46;
  if (game.player.alive && bullet.owner !== game.player && isHostileFaction(bullet.factionId, game.player.factionId) && distXY(bullet.x, bullet.y, game.player.x, game.player.y) < suppressRange) {
    game.player.statuses.suppressed = Math.max(game.player.statuses.suppressed, 1.2);
    game.camera.shake = Math.min(8, game.camera.shake + 0.45);
  }
  for (const npc of game.npcs) {
    if (!npc.alive || npc.factionId === bullet.factionId || !isHostileFaction(bullet.factionId, npc.factionId)) continue;
    if (distXY(bullet.x, bullet.y, npc.x, npc.y) < suppressRange) npc.statuses.suppressed = Math.max(npc.statuses.suppressed, 1.1);
  }
}

function damageEntity(target, amount, attacker, source = {}) {
  if (!isAlive(target)) return;
  const oldHp = target.hp;
  target.hp -= amount;
  target.lastDamageAt = game.minutes;

  if (attacker?.kind === "player" && target.factionId && target.factionId !== "expedition") provokeFaction(target.factionId);

  if (target.kind === "player" || target.kind === "npc") {
    const bleedChance = source.bleedChance ?? source.def?.bleedChance ?? source.bleedChance ?? 0.12;
    const fractureChance = source.fractureChance ?? source.def?.fractureChance ?? source.fractureChance ?? 0.03;
    if (game.rng() < bleedChance) target.statuses.bleeding = Math.max(target.statuses.bleeding, amount > 45 ? 1.4 : 1);
    if (game.rng() < fractureChance || amount > 70) target.statuses.fracture = 1;
    if (source.animalAttack && game.rng() < 0.08) target.statuses.infection = 1;
  }

  if (target.kind === "player") {
    game.camera.shake = Math.min(20, game.camera.shake + 8);
    playTone(90, 0.13, "sawtooth", 0.12, -30);
    if (!target.statuses.bleeding && oldHp > target.hp) showToast(`受到伤害：-${Math.round(oldHp - target.hp)} HP`, "danger");
    if (target.statuses.bleeding) showToast("你正在流血：需要绷带，输血包不能止血。", "danger");
    if (target.statuses.fracture) showToast("骨折：移动和换弹变慢，需要夹板。", "danger");
  }

  if (target.hp <= 0) {
    if (target.kind === "player") killPlayer(attacker?.name ? `被 ${attacker.name} 击倒` : "阵亡");
    else if (target.kind === "npc") killNpc(target, attacker, "combat");
    else if (target.kind === "animal") killAnimal(target, attacker);
  }
}

function killPlayer(reason) {
  if (!game.player?.alive) return;
  game.player.alive = false;
  endGame("death", `你阵亡了：${reason}。死亡会直接回到主界面，本轮战局无法继续。`);
}

function killNpc(npc, killer, cause) {
  if (!npc.alive) return;
  npc.alive = false;
  npc.hp = 0;
  const loot = { ...npc.inventory };
  if (npc.weapon.reserve > 0 || npc.weapon.mag > 0) loot.ammo = (loot.ammo || 0) + Math.max(1, Math.floor((npc.weapon.reserve + npc.weapon.mag) / Math.max(WEAPON_BY_ID[npc.weapon.id].magSize, 1)));
  game.corpses.push({ id: id(), type: "npcCorpse", name: `${npc.unitName} 阵亡士兵`, x: npc.x, y: npc.y, radius: 18, loot, searched: false, factionId: npc.factionId, createdAt: game.minutes });
  makeImpactParticles(npc.x, npc.y, "#7a2424", 18);

  if (killer?.kind === "player") {
    game.stats.playerKills += 1;
    game.player.kills += 1;
    if (isHostileFaction("expedition", npc.factionId)) showToast(`击倒 ${FACTIONS[npc.factionId].short} ${ROLE_LABELS[npc.role] || "士兵"}`, "good");
  }
  if (npc.taskId) {
    const task = game.tasks.find((t) => t.id === npc.taskId && t.type === "eliminate");
    if (task && !task.done) task.progress = Math.min(task.required, task.progress + 1);
  }
}

function killAnimal(animal, killer) {
  if (!animal.alive) return;
  animal.alive = false;
  animal.hp = 0;
  game.corpses.push({ id: id(), type: "animalCorpse", name: `${animal.name}尸体`, x: animal.x, y: animal.y, radius: animal.radius + 5, meat: animal.meat, harvested: false, createdAt: game.minutes, arrowRecover: killer?.kind === "player" && game.player.currentWeapon === "fieldBow" && game.rng() < 0.55 });
  makeImpactParticles(animal.x, animal.y, "#65402d", 12);
  if (killer?.kind === "player") showToast(`${animal.name}倒下了，靠近按 E 处理野味。`, "good");
}

function makeImpactParticles(x, y, color, amount) {
  for (let i = 0; i < amount; i += 1) {
    const a = rand(0, TAU);
    const speed = rand(20, 170);
    game.particles.push({ type: "impact", x, y, vx: Math.cos(a) * speed, vy: Math.sin(a) * speed, life: rand(0.16, 0.48), maxLife: 0.48, color, size: rand(2, 5) });
  }
}

function updateParticles(dt) {
  for (const particle of game.particles) {
    particle.x += particle.vx * dt;
    particle.y += particle.vy * dt;
    particle.vx *= 1 - dt * 2.1;
    particle.vy *= 1 - dt * 2.1;
    particle.life -= dt;
  }
}

function updateAirdrop(dt) {
  if (!game.airdrop && game.minutes >= game.nextAirdropMinutes) spawnAirdrop();
  if (!game.airdrop) return;
  const drop = game.airdrop;
  if (drop.phase === "falling") {
    drop.timer -= dt;
    drop.z = Math.max(0, drop.z - dt * 95);
    if (drop.timer <= 0) {
      drop.phase = "landed";
      drop.z = 0;
      showToast("空投已落地：所有附近小队都会向烟柱集结。", "warn");
      createNoise(drop.x, drop.y, 1.15, { factionId: "raiders", kind: "airdrop", x: drop.x, y: drop.y });
    }
  } else if (drop.phase === "landed") {
    drop.smoke += dt;
    if (game.rng() < 0.26) game.particles.push({ type: "smoke", x: drop.x + rand(-20, 20), y: drop.y + rand(-20, 20), vx: game.weather.wind.x * 14 + rand(-8, 8), vy: game.weather.wind.y * 14 - rand(6, 18), life: rand(1.2, 2.6), maxLife: 2.6, color: "#d96b45", size: rand(10, 22) });
  } else if (drop.phase === "looted") {
    drop.timer -= dt;
    if (drop.timer <= 0) drop.phase = "gone";
  }
}

function spawnAirdrop() {
  const landmark = pick(game.landmarks.slice(1));
  const p = randomNearby(landmark, rand(160, 420));
  game.airdrop = { id: id(), type: "airdrop", name: "战区空投箱", x: p.x, y: p.y, z: 190, radius: 22, phase: "falling", timer: 38, smoke: 0, looted: false, contents: { bloodBag: randInt(1, 2), bandage: randInt(1, 3), splint: game.rng() < 0.7 ? 1 : 0, ration: randInt(2, 4), antibiotic: game.rng() < 0.5 ? 1 : 0, ammo: randInt(2, 4) } };
  game.nextAirdropMinutes = game.minutes + rand(300, 560);
  showToast(`侦测到空投航线：目标 ${nearestLandmarkName(p)} 附近，约 40 秒后落地。`, "warn");
  for (const squad of game.squads) {
    const d = distXY(squad.home.x, squad.home.y, p.x, p.y);
    if (d < 2100 || squad.factionId === "raiders") {
      squad.objective = "airdrop";
      squad.target = game.airdrop;
      squad.rally = p;
    }
  }
}

function nearestLandmarkName(point) {
  let best = game.landmarks[0];
  let bestD = Infinity;
  for (const landmark of game.landmarks) {
    const d = distXY(point.x, point.y, landmark.x, landmark.y);
    if (d < bestD) {
      best = landmark;
      bestD = d;
    }
  }
  return best.name;
}

function updateTasks(dt) {
  const player = game.player;
  const minutesPerSecond = 1440 / (settings.dayLengthMinutes * 60);
  for (const task of game.tasks) {
    if (task.done) continue;
    if (task.type === "capture") {
      const inZone = distXY(player.x, player.y, task.x, task.y) < task.radius;
      if (inZone) {
        const hostiles = game.npcs.filter((npc) => npc.alive && isHostileFaction("expedition", npc.factionId) && distXY(npc.x, npc.y, task.x, task.y) < task.radius).length;
        task.progress = clamp(task.progress + dt * (hostiles ? 0.22 : 1), 0, task.required);
      } else task.progress = Math.max(0, task.progress - dt * 0.18);
    }
    if (task.type === "night") {
      const hour = getHour();
      if (hour >= 20 || hour < 6) task.progress = clamp(task.progress + dt * minutesPerSecond, 0, task.required);
    }
    if (task.type === "disrupt" && task.armed) task.progress = clamp(task.progress + dt, 0, task.required);

    if (task.progress >= task.required) completeTask(task);
  }
  game.stats.tasksDone = game.tasks.filter((task) => task.done).length;
}

function completeTask(task) {
  if (task.done) return;
  task.done = true;
  task.progress = task.required;
  game.stats.tasksDone = game.tasks.filter((t) => t.done).length;
  showToast(`任务完成：${task.title}`, "good");
  playTone(520, 0.1, "triangle", 0.08, 160);
  playTone(780, 0.12, "triangle", 0.05, -120);
}

function interact() {
  const interaction = game.selectedInteraction || findInteractable();
  if (!interaction) return;
  const target = interaction.target;
  switch (interaction.kind) {
    case "loot":
      playerLoot(target);
      break;
    case "animal":
      harvestAnimal(target);
      break;
    case "airdrop":
      playerLootAirdrop(target);
      break;
    case "disrupt":
      armDisruptTask(target);
      break;
    default:
      break;
  }
}

function refreshInteractPrompt() {
  const interaction = findInteractable();
  game.selectedInteraction = interaction;
  if (interaction) {
    ui.centerPrompt.textContent = interaction.text;
    ui.centerPrompt.classList.remove("hidden");
  } else {
    ui.centerPrompt.classList.add("hidden");
  }
}

function findInteractable() {
  const player = game.player;
  if (!player?.alive) return null;
  if (game.airdrop && game.airdrop.phase === "landed" && !game.airdrop.looted && distXY(player.x, player.y, game.airdrop.x, game.airdrop.y) < 70) return { kind: "airdrop", target: game.airdrop, text: "按 E 搜索空投（附近 NPC 也会抢）" };
  for (const task of game.tasks) {
    if (!task.done && task.type === "disrupt" && distXY(player.x, player.y, task.x, task.y) < task.radius) return { kind: "disrupt", target: task, text: task.armed ? "炸药已安放：守住区域" : "按 E 安放炸药并坚守" };
  }
  let best = null;
  let bestD = Infinity;
  for (const loot of game.loot) {
    if (loot.searched) continue;
    const d = distXY(player.x, player.y, loot.x, loot.y);
    if (d < 58 && d < bestD) {
      best = { kind: "loot", target: loot, text: `按 E 搜索 ${loot.name}` };
      bestD = d;
    }
  }
  for (const corpse of game.corpses) {
    if ((corpse.type === "animalCorpse" && corpse.harvested) || (corpse.type !== "animalCorpse" && corpse.searched)) continue;
    const d = distXY(player.x, player.y, corpse.x, corpse.y);
    if (d < 58 && d < bestD) {
      best = corpse.type === "animalCorpse" ? { kind: "animal", target: corpse, text: `按 E 处理 ${corpse.name}，获得口粮` } : { kind: "loot", target: corpse, text: `按 E 搜索 ${corpse.name}` };
      bestD = d;
    }
  }
  return best;
}

function playerLoot(target) {
  if (target.searched) return;
  const contents = target.contents || target.loot || {};
  addInventory(game.player.inventory, contents);
  target.searched = true;
  const summary = inventorySummary(contents);
  showToast(summary ? `获得：${summary}` : "没有找到可用物资。", summary ? "good" : "warn");
  if (target.taskId) {
    const task = game.tasks.find((t) => t.id === target.taskId);
    if (task && !task.done) task.progress = task.required;
  }
}

function harvestAnimal(corpse) {
  if (corpse.harvested) return;
  corpse.harvested = true;
  game.player.inventory.ration += corpse.meat;
  game.player.harvests += 1;
  game.stats.animalsHarvested += 1;
  if (corpse.arrowRecover) {
    game.player.weapons.fieldBow.reserve += 1;
    showToast(`处理野味：获得 ${corpse.meat} 份口粮，并回收 1 支箭。`, "good");
  } else showToast(`处理野味：获得 ${corpse.meat} 份口粮。`, "good");
  for (const task of game.tasks) {
    if (task.type === "hunt" && !task.done) task.progress = Math.min(task.required, task.progress + 1);
  }
}

function playerLootAirdrop(drop) {
  if (drop.looted || drop.phase !== "landed") return;
  addInventory(game.player.inventory, drop.contents);
  drop.looted = true;
  drop.phase = "looted";
  drop.timer = 35;
  game.stats.airdropsLooted += 1;
  showToast(`抢到空投：${inventorySummary(drop.contents)}`, "good");
  for (const task of game.tasks) {
    if (task.type === "airdrop" && !task.done) task.progress = task.required;
  }
}

function npcLoot(npc, target) {
  if (target.type === "airdrop" || target === game.airdrop) {
    if (target.phase !== "landed" || target.looted) return;
    addInventory(npc.inventory, target.contents);
    target.looted = true;
    target.phase = "looted";
    target.timer = 35;
    if (dist(npc, game.player) < 900) showToast(`${FACTIONS[npc.factionId].short} 抢走了空投！`, "danger");
    return;
  }
  if (target.type === "animalCorpse") {
    if (target.harvested) return;
    target.harvested = true;
    npc.inventory.ration += target.meat;
    return;
  }
  if (target.searched) return;
  addInventory(npc.inventory, target.contents || target.loot || {});
  target.searched = true;
}

function addInventory(inventory, contents) {
  for (const [key, value] of Object.entries(contents)) inventory[key] = (inventory[key] || 0) + value;
}

function inventorySummary(contents) {
  return Object.entries(contents)
    .filter(([, value]) => value > 0)
    .map(([key, value]) => `${ITEM_NAMES[key] || key} ×${value}`)
    .join("，");
}

function armDisruptTask(task) {
  if (task.armed) return;
  task.armed = true;
  task.progress = 0;
  showToast("炸药已安放：留在附近守住 10 秒。", "warn");
  createNoise(task.x, task.y, 0.9, game.player);
}

function updateCamera(dt) {
  const player = game.player;
  if (!player) return;
  const def = WEAPON_BY_ID[player.currentWeapon];
  const lead = input.mouse.right ? (def.id === "marksmanScout" ? 145 : 90) : 52;
  game.camera.targetZoom = input.mouse.right ? (def.id === "marksmanScout" ? 1.18 : 1.08) : 1;
  const targetX = player.x + Math.cos(player.angle) * lead;
  const targetY = player.y + Math.sin(player.angle) * lead;
  game.camera.x = lerp(game.camera.x, targetX, 1 - Math.exp(-dt * 5.6));
  game.camera.y = lerp(game.camera.y, targetY, 1 - Math.exp(-dt * 5.6));
  game.camera.zoom = lerp(game.camera.zoom, game.camera.targetZoom, 1 - Math.exp(-dt * 4.2));
  game.camera.shake = Math.max(0, game.camera.shake - dt * 18);
  const zoom = game.camera.zoom || 1;
  game.camera.x = clamp(game.camera.x, game.width / zoom / 2, game.mapSize - game.width / zoom / 2);
  game.camera.y = clamp(game.camera.y, game.height / zoom / 2, game.mapSize - game.height / zoom / 2);
}

function checkEndings() {
  if (game.state !== "playing") return;
  if (game.tasks.filter((task) => task.done).length >= WIN_TASKS) endGame("victory", "胜利结局：你完成了五个系统任务，战线指挥部批准你带队撤离。", true);
  else if (game.minutes >= game.serviceEndMinutes) endGame("service", "兵役服役结束结局：你在战场上熬过十五天，退役列车终于抵达。", true);
}

function endGame(type, message, won = false) {
  game.state = "ended";
  game.outcome = type;
  input.mouse.down = false;
  input.mouse.right = false;
  ui.hud.classList.add("hidden");
  ui.menu.classList.remove("hidden");
  ui.resumeBtn.classList.add("hidden");
  ui.endMessage.classList.remove("hidden");
  ui.endMessage.textContent = `${message} 战绩：击倒 ${game.stats.playerKills} 人，处理野味 ${game.stats.animalsHarvested} 次，完成任务 ${game.tasks.filter((task) => task.done).length}/${WIN_TASKS}，生存 ${game.stats.daysSurvived} 天。`;
  ui.startBtn.textContent = won ? "再次部署" : "重新开始";
  showToast(message, won ? "good" : "danger");
}

function cleanupWorld() {
  game.bullets = game.bullets.filter((bullet) => !bullet.dead);
  game.particles = game.particles.filter((particle) => particle.life > 0);
  game.animals = game.animals.filter((animal) => animal.alive);
  if (game.airdrop?.phase === "gone") game.airdrop = null;
}

function updateHud() {
  const p = game.player;
  if (!p) return;
  ui.hpBar.style.width = `${clamp((p.hp / p.maxHp) * 100, 0, 100)}%`;
  ui.hpText.textContent = `${Math.ceil(p.hp)}`;
  ui.hungerBar.style.width = `${clamp(p.hunger, 0, 100)}%`;
  ui.hungerText.textContent = `${Math.ceil(p.hunger)}`;

  const activeStatuses = Object.entries(p.statuses).filter(([key, value]) => value > 0 && key !== "starving").map(([key]) => key);
  if (p.statuses.starving || p.hunger <= 0) activeStatuses.push("starving");
  const signature = `${activeStatuses.join("|")}:${p.currentWeapon}:${Math.ceil(p.hp)}:${Math.ceil(p.hunger)}:${game.tasks.map((t) => `${t.id}${t.progress.toFixed(0)}${t.done}`).join(";")}:${Object.values(p.inventory).join(",")}`;
  if (signature !== cachedHudSignature) {
    cachedHudSignature = signature;
    ui.statusChips.innerHTML = activeStatuses.length ? activeStatuses.map((key) => `<span class="chip">${STATUS_LABELS[key]}</span>`).join("") : `<span class="chip good">状态稳定</span>`;
    const weaponDef = WEAPON_BY_ID[p.currentWeapon];
    const weapon = p.weapons[p.currentWeapon];
    ui.weaponName.textContent = `${weaponDef.slot}. ${weaponDef.name}`;
    ui.ammoText.textContent = weapon.reloadTimer > 0 ? `换弹 ${weapon.reloadTimer.toFixed(1)}s` : `${weapon.mag} / ${weapon.reserve}`;
    ui.weaponHint.textContent = `${weaponDef.category} · ${weaponDef.auto ? "按住连射" : "点击射击"} · ${AMMO_NAMES[weaponDef.ammoType]}`;
    ui.taskList.innerHTML = game.tasks.map((task) => `<li class="${task.done ? "done" : ""}"><b>${task.title}</b><div class="progress-line">${task.description}<br>${formatTaskProgress(task)}</div></li>`).join("");
    ui.inventoryList.innerHTML = Object.entries(ITEM_NAMES)
      .filter(([key]) => key !== "intel")
      .map(([key, name]) => `<div class="inv-item"><span>${name}</span><b>${p.inventory[key] || 0}</b></div>`)
      .join("");
  }

  ui.timeText.textContent = formatTime(game.minutes);
  ui.weatherText.textContent = `天气：${game.weather.type} · 能见度 ${Math.round(visibilityScalar() * 100)}%`;
  ui.airdropText.textContent = formatAirdropText();
  updateFactionHud();
}

function formatTaskProgress(task) {
  if (task.done) return "完成";
  if (["capture", "disrupt"].includes(task.type)) return `进度 ${Math.floor((task.progress / task.required) * 100)}%`;
  if (task.type === "night") return `夜间存活 ${Math.floor(task.progress / 60)} / ${Math.floor(task.required / 60)} 小时`;
  return `进度 ${Math.floor(task.progress)} / ${task.required}`;
}

function formatTime(minutes) {
  const elapsed = Math.max(0, minutes - game.startMinutes);
  const day = Math.floor(elapsed / 1440) + 1;
  const mins = Math.floor(minutes % 1440);
  const h = Math.floor(mins / 60).toString().padStart(2, "0");
  const m = Math.floor(mins % 60).toString().padStart(2, "0");
  return `第 ${day} 天 ${h}:${m}`;
}

function getHour() {
  return (game.minutes / 60) % 24;
}

function visibilityScalar() {
  const hour = getHour();
  const night = hour < 6 || hour >= 20;
  return clamp((night ? 0.58 : 1) * (1 - game.weather.fog * 0.55) * (1 - game.weather.rain * 0.16), 0.24, 1);
}

function formatAirdropText() {
  if (game.airdrop) {
    if (game.airdrop.phase === "falling") return `空投：降落中 ${Math.ceil(game.airdrop.timer)}s`;
    if (game.airdrop.phase === "landed") return `空投：已落地 · ${nearestLandmarkName(game.airdrop)}`;
    return "空投：已被搜索";
  }
  const mins = Math.max(0, game.nextAirdropMinutes - game.minutes);
  return `空投：约 ${Math.ceil(mins)} 战役分钟后`;
}

function updateFactionHud() {
  const counts = {};
  let nearest = null;
  let nearestD = Infinity;
  for (const npc of game.npcs) {
    if (!npc.alive) continue;
    const d = dist(npc, game.player);
    if (d < 1100) {
      counts[npc.factionId] = (counts[npc.factionId] || 0) + 1;
      if (isHostileFaction("expedition", npc.factionId) && d < nearestD) {
        nearest = npc;
        nearestD = d;
      }
    }
  }
  const text = Object.entries(counts)
    .map(([faction, count]) => `${FACTIONS[faction].short} ${count}`)
    .join(" · ");
  ui.factionText.textContent = text ? `附近接触：${text}` : "附近接触：暂无";
  const allies = counts.expedition || 0;
  ui.squadText.textContent = nearest ? `最近威胁：${FACTIONS[nearest.factionId].short} ${Math.round(nearestD)}m` : `附近友军：${Math.max(0, allies - 1)} 人`;
}

function draw() {
  ctx.clearRect(0, 0, game.width, game.height);
  ctx.fillStyle = "#111714";
  ctx.fillRect(0, 0, game.width, game.height);

  if (game.player || game.landmarks.length) {
    const shake = game.camera.shake;
    const sx = shake ? rand(-shake, shake) : 0;
    const sy = shake ? rand(-shake, shake) : 0;
    ctx.save();
    ctx.translate(game.width / 2 + sx, game.height / 2 + sy);
    ctx.scale(game.camera.zoom || 1, game.camera.zoom || 1);
    ctx.translate(-game.camera.x, -game.camera.y);
    drawWorld();
    ctx.restore();
    drawScreenMarkers();
  } else drawMenuBackdrop();

  drawScreenEffects();
  if (game.state === "playing") drawCrosshair();
}

function drawMenuBackdrop() {
  const g = ctx.createRadialGradient(game.width * 0.5, game.height * 0.45, 30, game.width * 0.5, game.height * 0.45, game.width * 0.75);
  g.addColorStop(0, "#243421");
  g.addColorStop(1, "#080b0d");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, game.width, game.height);
}

function drawWorld() {
  ctx.fillStyle = "#20281e";
  ctx.fillRect(0, 0, game.mapSize, game.mapSize);
  drawGrid();
  drawRoads();
  drawTerrain();
  drawLandmarks();
  drawTaskMarkers();
  drawLootAndCorpses();
  drawObstacles();
  drawAirdrop();
  for (const animal of game.animals) if (animal.alive && isInView(animal)) drawAnimal(animal);
  for (const npc of game.npcs) if (npc.alive && isInView(npc)) drawHuman(npc);
  if (game.player?.alive) drawHuman(game.player);
  drawBullets();
  drawParticles();
  drawWorldBounds();
}

function drawGrid() {
  const zoom = game.camera.zoom || 1;
  const step = 400;
  const left = Math.max(0, Math.floor((game.camera.x - game.width / zoom / 2) / step) * step);
  const right = Math.min(game.mapSize, game.camera.x + game.width / zoom / 2 + step);
  const top = Math.max(0, Math.floor((game.camera.y - game.height / zoom / 2) / step) * step);
  const bottom = Math.min(game.mapSize, game.camera.y + game.height / zoom / 2 + step);
  ctx.strokeStyle = "rgba(255,255,255,0.035)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let x = left; x <= right; x += step) {
    ctx.moveTo(x, top);
    ctx.lineTo(x, bottom);
  }
  for (let y = top; y <= bottom; y += step) {
    ctx.moveTo(left, y);
    ctx.lineTo(right, y);
  }
  ctx.stroke();
}

function drawRoads() {
  for (const road of game.roads) {
    ctx.strokeStyle = road.color;
    ctx.lineWidth = road.width;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    road.points.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)));
    ctx.stroke();
    ctx.strokeStyle = "rgba(255,255,255,0.04)";
    ctx.lineWidth = 2;
    ctx.stroke();
  }
}

function drawTerrain() {
  for (const patch of game.terrain) {
    if (!isInView(patch, 260)) continue;
    ctx.save();
    ctx.translate(patch.x, patch.y);
    ctx.rotate(patch.rot);
    ctx.globalAlpha = patch.alpha;
    ctx.fillStyle = terrainColor(patch.type);
    ctx.beginPath();
    ctx.ellipse(0, 0, patch.r * patch.rx, patch.r * patch.ry, 0, 0, TAU);
    ctx.fill();
    ctx.restore();
  }
  ctx.globalAlpha = 1;
}

function terrainColor(type) {
  if (type === "grass") return "#30452a";
  if (type === "mud") return "#3d3328";
  if (type === "forest") return "#1d3c25";
  if (type === "crater") return "#1b1b18";
  if (type === "water") return "#1e3d49";
  return "#2f3a28";
}

function drawLandmarks() {
  for (const landmark of game.landmarks) {
    if (!isInView(landmark, 280)) continue;
    ctx.globalAlpha = 0.26;
    ctx.fillStyle = landmark.color;
    ctx.beginPath();
    ctx.arc(landmark.x, landmark.y, landmark.r, 0, TAU);
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.strokeStyle = FACTIONS[landmark.factionId]?.color || "#ccc";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(landmark.x, landmark.y, landmark.r, 0, TAU);
    ctx.stroke();
    if (distXY(game.camera.x, game.camera.y, landmark.x, landmark.y) < 900) {
      ctx.fillStyle = "rgba(240,244,220,0.78)";
      ctx.font = "700 22px system-ui";
      ctx.textAlign = "center";
      ctx.fillText(landmark.name, landmark.x, landmark.y - landmark.r - 12);
      ctx.font = "12px system-ui";
      ctx.fillStyle = FACTIONS[landmark.factionId]?.color || "#ccc";
      ctx.fillText(FACTIONS[landmark.factionId]?.short || "未知", landmark.x, landmark.y - landmark.r + 8);
    }
  }
}

function drawTaskMarkers() {
  for (const task of game.tasks) {
    if (task.done || task.x === undefined || !isInView(task, 400)) continue;
    const pulse = 0.5 + Math.sin(performance.now() / 260) * 0.5;
    ctx.strokeStyle = `rgba(240, 208, 107, ${0.45 + pulse * 0.35})`;
    ctx.lineWidth = 3;
    ctx.setLineDash([12, 8]);
    ctx.beginPath();
    ctx.arc(task.x, task.y, task.radius || 52, 0, TAU);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = "#f0d06b";
    ctx.font = "700 15px system-ui";
    ctx.textAlign = "center";
    ctx.fillText(task.type === "capture" ? "占领" : task.type === "disrupt" ? "破坏" : "任务", task.x, task.y - (task.radius || 52) - 8);
  }
}

function drawLootAndCorpses() {
  for (const loot of game.loot) {
    if (loot.searched || !isInView(loot)) continue;
    ctx.fillStyle = loot.type === "intel" ? "#8cc8ff" : loot.type === "medcache" ? "#f0f2d0" : "#caa563";
    ctx.strokeStyle = "rgba(0,0,0,0.4)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.rect(loot.x - 10, loot.y - 10, 20, 20);
    ctx.fill();
    ctx.stroke();
  }
  for (const corpse of game.corpses) {
    if ((corpse.type === "animalCorpse" && corpse.harvested) || (corpse.type !== "animalCorpse" && corpse.searched) || !isInView(corpse)) continue;
    ctx.fillStyle = corpse.type === "animalCorpse" ? "#704b38" : "#4b3b35";
    ctx.beginPath();
    ctx.ellipse(corpse.x, corpse.y, corpse.radius + 6, corpse.radius * 0.72, 0.4, 0, TAU);
    ctx.fill();
    if (corpse.type === "animalCorpse") {
      ctx.fillStyle = "#f0d06b";
      ctx.font = "12px system-ui";
      ctx.textAlign = "center";
      ctx.fillText(`肉×${corpse.meat}`, corpse.x, corpse.y - corpse.radius - 8);
    }
  }
}

function drawObstacles() {
  for (const obstacle of game.obstacles) {
    if (!isInView(obstacle, 120)) continue;
    ctx.save();
    ctx.translate(obstacle.x, obstacle.y);
    ctx.rotate(obstacle.rot || 0);
    if (obstacle.radius) {
      if (obstacle.type === "tree") {
        ctx.fillStyle = "#513c24";
        ctx.beginPath();
        ctx.arc(0, 0, obstacle.radius * 0.38, 0, TAU);
        ctx.fill();
        ctx.fillStyle = "#203e20";
        ctx.beginPath();
        ctx.arc(0, 0, obstacle.radius, 0, TAU);
        ctx.fill();
      } else if (obstacle.type === "rock") {
        ctx.fillStyle = "#656762";
        ctx.beginPath();
        ctx.ellipse(0, 0, obstacle.radius * 1.2, obstacle.radius * 0.85, 0, 0, TAU);
        ctx.fill();
      } else {
        ctx.fillStyle = "rgba(20,18,15,0.5)";
        ctx.beginPath();
        ctx.arc(0, 0, obstacle.radius, 0, TAU);
        ctx.fill();
      }
    } else {
      ctx.fillStyle = obstacleColor(obstacle.type);
      ctx.fillRect(-obstacle.w / 2, -obstacle.h / 2, obstacle.w, obstacle.h);
      ctx.strokeStyle = "rgba(0,0,0,0.38)";
      ctx.lineWidth = 3;
      ctx.strokeRect(-obstacle.w / 2, -obstacle.h / 2, obstacle.w, obstacle.h);
      if (obstacle.type === "trench") {
        ctx.strokeStyle = "rgba(255,255,255,0.08)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-obstacle.w / 2 + 10, 0);
        ctx.lineTo(obstacle.w / 2 - 10, 0);
        ctx.stroke();
      }
    }
    ctx.restore();
  }
}

function obstacleColor(type) {
  if (type === "bunker") return "#555a56";
  if (type === "tower") return "#536879";
  if (type === "tent") return "#6e6a4b";
  if (type === "barn") return "#6a4b3f";
  if (type === "hay") return "#8a7541";
  if (type === "railcar") return "#52585a";
  if (type === "trench") return "#3a2e25";
  return "#665f53";
}

function drawAirdrop() {
  const drop = game.airdrop;
  if (!drop || drop.phase === "gone" || !isInView(drop, 520)) return;
  if (drop.phase === "falling") {
    ctx.strokeStyle = "rgba(255,255,255,0.35)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(drop.x, drop.y - drop.z, 38, Math.PI, TAU);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(drop.x - 30, drop.y - drop.z);
    ctx.lineTo(drop.x - 12, drop.y - drop.z + 38);
    ctx.moveTo(drop.x + 30, drop.y - drop.z);
    ctx.lineTo(drop.x + 12, drop.y - drop.z + 38);
    ctx.stroke();
  }
  ctx.fillStyle = drop.looted ? "#5d5144" : "#c57442";
  ctx.strokeStyle = "#2a1811";
  ctx.lineWidth = 3;
  ctx.fillRect(drop.x - 22, drop.y - 17 - drop.z, 44, 34);
  ctx.strokeRect(drop.x - 22, drop.y - 17 - drop.z, 44, 34);
  if (drop.phase === "landed") {
    ctx.strokeStyle = "rgba(217,107,69,0.55)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(drop.x, drop.y, 120 + Math.sin(performance.now() / 240) * 10, 0, TAU);
    ctx.stroke();
  }
}

function drawAnimal(animal) {
  const def = ANIMAL_DEFS[animal.type];
  ctx.save();
  ctx.translate(animal.x, animal.y);
  ctx.rotate(animal.angle || 0);
  ctx.fillStyle = def.color;
  ctx.beginPath();
  ctx.ellipse(0, 0, animal.radius * 1.2, animal.radius * 0.78, 0, 0, TAU);
  ctx.fill();
  ctx.fillStyle = "rgba(0,0,0,0.35)";
  ctx.beginPath();
  ctx.arc(animal.radius * 0.76, -animal.radius * 0.24, 2.4, 0, TAU);
  ctx.fill();
  ctx.restore();
  if (animal.hp < animal.maxHp) drawHealthBar(animal, animal.hp / animal.maxHp);
}

function drawHuman(entity) {
  const faction = FACTIONS[entity.factionId] || FACTIONS.expedition;
  const isPlayer = entity.kind === "player";
  const hostile = !isPlayer && isHostileFaction("expedition", entity.factionId);
  ctx.save();
  ctx.translate(entity.x, entity.y);
  ctx.rotate(entity.angle || 0);
  ctx.fillStyle = isPlayer ? "#d9ffd3" : faction.color;
  ctx.strokeStyle = hostile ? "rgba(255,70,60,0.9)" : "rgba(0,0,0,0.55)";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(0, 0, entity.radius, 0, TAU);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = isPlayer ? "#b5e884" : "rgba(24,28,22,0.82)";
  ctx.fillRect(4, -4, entity.radius + 13, 8);
  ctx.fillStyle = "rgba(255,255,255,0.88)";
  ctx.beginPath();
  ctx.moveTo(entity.radius + 3, 0);
  ctx.lineTo(entity.radius - 4, -6);
  ctx.lineTo(entity.radius - 4, 6);
  ctx.closePath();
  ctx.fill();
  if (entity.role === "medic") {
    ctx.strokeStyle = "#d94444";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-4, 0);
    ctx.lineTo(4, 0);
    ctx.moveTo(0, -4);
    ctx.lineTo(0, 4);
    ctx.stroke();
  }
  ctx.restore();

  if (!isPlayer && (dist(entity, game.player) < 520 || entity.hp < entity.maxHp)) {
    drawHealthBar(entity, entity.hp / entity.maxHp, faction.color);
    ctx.font = "11px system-ui";
    ctx.textAlign = "center";
    ctx.fillStyle = faction.color;
    ctx.fillText(`${faction.short} ${ROLE_LABELS[entity.role] || ""}`, entity.x, entity.y - entity.radius - 18);
  }
}

function drawHealthBar(entity, ratio, color = "#e85f5f") {
  ctx.fillStyle = "rgba(0,0,0,0.55)";
  ctx.fillRect(entity.x - 20, entity.y - entity.radius - 11, 40, 5);
  ctx.fillStyle = color;
  ctx.fillRect(entity.x - 20, entity.y - entity.radius - 11, 40 * clamp(ratio, 0, 1), 5);
}

function drawBullets() {
  for (const bullet of game.bullets) {
    if (!isInView(bullet, 80)) continue;
    ctx.strokeStyle = bullet.color;
    ctx.lineWidth = bullet.def.ammoType === "arrow" ? 2 : 3;
    ctx.globalAlpha = bullet.def.silent ? 0.82 : 0.95;
    ctx.beginPath();
    ctx.moveTo(bullet.x, bullet.y);
    ctx.lineTo(bullet.x - bullet.vx * 0.025, bullet.y - bullet.vy * 0.025);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
}

function drawParticles() {
  for (const particle of game.particles) {
    if (!isInView(particle, 80)) continue;
    const ratio = clamp(particle.life / particle.maxLife, 0, 1);
    ctx.globalAlpha = ratio;
    ctx.fillStyle = particle.color;
    ctx.beginPath();
    ctx.arc(particle.x, particle.y, particle.size * (particle.type === "smoke" ? 1 + (1 - ratio) * 2 : 1), 0, TAU);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

function drawWorldBounds() {
  ctx.strokeStyle = "rgba(255,255,255,0.18)";
  ctx.lineWidth = 8;
  ctx.strokeRect(0, 0, game.mapSize, game.mapSize);
}

function drawScreenMarkers() {
  if (game.state !== "playing") return;
  const markers = game.tasks.filter((task) => !task.done && task.x !== undefined).map((task) => ({ x: task.x, y: task.y, label: "任务", color: "#f0d06b" }));
  if (game.airdrop && !game.airdrop.looted) markers.push({ x: game.airdrop.x, y: game.airdrop.y, label: "空投", color: "#ff8a55" });
  for (const marker of markers) {
    const screen = worldToScreen(marker.x, marker.y);
    if (screen.x > 24 && screen.x < game.width - 24 && screen.y > 24 && screen.y < game.height - 24) continue;
    const cx = clamp(screen.x, 32, game.width - 32);
    const cy = clamp(screen.y, 32, game.height - 32);
    ctx.fillStyle = marker.color;
    ctx.beginPath();
    ctx.arc(cx, cy, 6, 0, TAU);
    ctx.fill();
    ctx.font = "700 12px system-ui";
    ctx.textAlign = "center";
    ctx.fillText(marker.label, cx, cy - 10);
  }
}

function worldToScreen(x, y) {
  const zoom = game.camera.zoom || 1;
  return { x: game.width / 2 + (x - game.camera.x) * zoom, y: game.height / 2 + (y - game.camera.y) * zoom };
}

function drawScreenEffects() {
  const night = nightAlpha();
  if (night > 0) {
    ctx.fillStyle = `rgba(2, 8, 18, ${night})`;
    ctx.fillRect(0, 0, game.width, game.height);
  }
  if (game.weather.fog > 0) {
    ctx.fillStyle = `rgba(185, 194, 190, ${game.weather.fog * 0.22})`;
    ctx.fillRect(0, 0, game.width, game.height);
  }
  if (game.weather.rain > 0) drawRain();
  if (game.player?.alive && game.player.hp < 45) {
    const alpha = clamp((45 - game.player.hp) / 75, 0, 0.42);
    const g = ctx.createRadialGradient(game.width / 2, game.height / 2, game.height * 0.2, game.width / 2, game.height / 2, game.height * 0.78);
    g.addColorStop(0, "rgba(120,0,0,0)");
    g.addColorStop(1, `rgba(120,0,0,${alpha})`);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, game.width, game.height);
  }
}

function nightAlpha() {
  const hour = getHour();
  if (hour >= 7 && hour < 19) return 0;
  if (hour >= 19 && hour < 21) return lerp(0, 0.48, (hour - 19) / 2);
  if (hour >= 5 && hour < 7) return lerp(0.48, 0, (hour - 5) / 2);
  return 0.52;
}

function drawRain() {
  ctx.strokeStyle = `rgba(180,205,220,${0.18 + game.weather.rain * 0.22})`;
  ctx.lineWidth = 1;
  ctx.beginPath();
  const count = Math.floor(80 + game.weather.rain * 120);
  const now = performance.now() * 0.42;
  for (let i = 0; i < count; i += 1) {
    const x = (i * 97 + now * game.weather.wind.x * 0.2) % (game.width + 120) - 60;
    const y = (i * 53 + now * 0.9) % (game.height + 120) - 60;
    ctx.moveTo(x, y);
    ctx.lineTo(x + game.weather.wind.x * 18, y + 24);
  }
  ctx.stroke();
}


function drawCrosshair() {
  const x = input.mouse.x;
  const y = input.mouse.y;
  const p = game.player;
  const def = p ? WEAPON_BY_ID[p.currentWeapon] : null;
  const spread = def ? (input.mouse.right ? def.aimSpread : def.spread) * 320 + (p.recoil || 0) * 8 : 16;
  ctx.strokeStyle = input.mouse.right ? "rgba(210,245,190,0.92)" : "rgba(255,245,200,0.78)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x - 9 - spread, y);
  ctx.lineTo(x - 3 - spread * 0.25, y);
  ctx.moveTo(x + 9 + spread, y);
  ctx.lineTo(x + 3 + spread * 0.25, y);
  ctx.moveTo(x, y - 9 - spread);
  ctx.lineTo(x, y - 3 - spread * 0.25);
  ctx.moveTo(x, y + 9 + spread);
  ctx.lineTo(x, y + 3 + spread * 0.25);
  ctx.stroke();
  ctx.fillStyle = "rgba(255,255,255,0.9)";
  ctx.beginPath();
  ctx.arc(x, y, 1.7, 0, TAU);
  ctx.fill();
}

function drawMiniMap() {
  if (!miniCtx || !game.player) return;
  const w = miniMap.width;
  const h = miniMap.height;
  miniCtx.clearRect(0, 0, w, h);
  miniCtx.fillStyle = "rgba(8, 12, 10, 0.92)";
  miniCtx.fillRect(0, 0, w, h);
  const scale = w / game.mapSize;

  for (const road of game.roads) {
    miniCtx.strokeStyle = "rgba(155, 138, 101, 0.42)";
    miniCtx.lineWidth = Math.max(1, road.width * scale);
    miniCtx.beginPath();
    road.points.forEach((point, i) => {
      const x = point.x * scale;
      const y = point.y * scale;
      if (i) miniCtx.lineTo(x, y);
      else miniCtx.moveTo(x, y);
    });
    miniCtx.stroke();
  }

  for (const landmark of game.landmarks) {
    miniCtx.fillStyle = FACTIONS[landmark.factionId]?.color || "#ccc";
    miniCtx.globalAlpha = 0.5;
    miniCtx.beginPath();
    miniCtx.arc(landmark.x * scale, landmark.y * scale, Math.max(2, landmark.r * scale), 0, TAU);
    miniCtx.fill();
  }
  miniCtx.globalAlpha = 1;

  for (const task of game.tasks) {
    if (task.done || task.x === undefined) continue;
    miniCtx.fillStyle = "#f0d06b";
    miniCtx.beginPath();
    miniCtx.arc(task.x * scale, task.y * scale, 4, 0, TAU);
    miniCtx.fill();
  }

  if (game.airdrop && !game.airdrop.looted) {
    miniCtx.fillStyle = "#ff8a55";
    miniCtx.beginPath();
    miniCtx.arc(game.airdrop.x * scale, game.airdrop.y * scale, 5, 0, TAU);
    miniCtx.fill();
  }

  for (const npc of game.npcs) {
    if (!npc.alive) continue;
    const d = dist(npc, game.player);
    if (d > (input.enlargedMap ? 1800 : 900)) continue;
    miniCtx.fillStyle = isHostileFaction("expedition", npc.factionId) ? "#ff615c" : FACTIONS[npc.factionId].color;
    miniCtx.fillRect(npc.x * scale - 1.5, npc.y * scale - 1.5, 3, 3);
  }

  miniCtx.fillStyle = "#d9ffd3";
  miniCtx.strokeStyle = "#071007";
  miniCtx.lineWidth = 2;
  miniCtx.beginPath();
  miniCtx.arc(game.player.x * scale, game.player.y * scale, 5, 0, TAU);
  miniCtx.fill();
  miniCtx.stroke();

  const viewW = game.width / (game.camera.zoom || 1) * scale;
  const viewH = game.height / (game.camera.zoom || 1) * scale;
  miniCtx.strokeStyle = "rgba(255,255,255,0.35)";
  miniCtx.strokeRect(game.camera.x * scale - viewW / 2, game.camera.y * scale - viewH / 2, viewW, viewH);
}

function setupEventListeners() {
  ui.startBtn.addEventListener("click", startNewGame);
  ui.resumeBtn.addEventListener("click", resumeGame);
  ui.settingsBtn.addEventListener("click", () => toggleDrawer(ui.settingsPanel));
  ui.armoryBtn.addEventListener("click", () => toggleDrawer(ui.armoryPanel));
  ui.helpBtn.addEventListener("click", () => toggleDrawer(ui.helpPanel));

  for (const el of [ui.difficultyInput, ui.mapSizeInput, ui.dayLengthInput, ui.npcDensityInput, ui.wildlifeDensityInput, ui.sensitivityInput, ui.aimAssistInput, ui.volumeInput]) {
    el.addEventListener("input", syncSettingsLabels);
    el.addEventListener("change", syncSettingsLabels);
  }

  window.addEventListener("resize", resizeCanvas);

  canvas.addEventListener("mousemove", (event) => {
    const rect = canvas.getBoundingClientRect();
    input.mouse.x = (event.clientX - rect.left) * settings.sensitivity;
    input.mouse.y = (event.clientY - rect.top) * settings.sensitivity;
    input.mouse.x = clamp(input.mouse.x, 0, game.width);
    input.mouse.y = clamp(input.mouse.y, 0, game.height);
  });

  canvas.addEventListener("mousedown", (event) => {
    if (game.state !== "playing") return;
    initAudio();
    if (event.button === 0) input.mouse.down = true;
    if (event.button === 2) input.mouse.right = true;
  });

  window.addEventListener("mouseup", (event) => {
    if (event.button === 0) {
      input.mouse.down = false;
      mouseFireWasDown = false;
    }
    if (event.button === 2) input.mouse.right = false;
  });

  canvas.addEventListener("contextmenu", (event) => event.preventDefault());

  window.addEventListener("keydown", (event) => {
    if (["Space", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.code)) event.preventDefault();
    input.keys.add(event.code);
    if (game.state !== "playing") return;
    if (event.code === "Escape") {
      pauseGame();
      return;
    }
    if (event.code === "KeyE") input.interact = true;
    if (event.code === "KeyR") input.reload = true;
    if (event.code === "KeyZ") input.useItem = "bandage";
    if (event.code === "KeyX") input.useItem = "splint";
    if (event.code === "KeyC") input.useItem = "bloodBag";
    if (event.code === "KeyV") input.useItem = "ration";
    if (event.code === "KeyB") input.useItem = "antibiotic";
    if (event.code === "KeyG") input.useItem = "ammo";
    if (event.code === "KeyM") {
      input.enlargedMap = true;
      ui.minimapPanel.classList.add("large");
    }
    if (/^Digit[1-8]$/.test(event.code)) switchWeapon(Number(event.code.slice(5)) - 1);
  });

  window.addEventListener("keyup", (event) => {
    input.keys.delete(event.code);
    if (event.code === "KeyM") {
      input.enlargedMap = false;
      ui.minimapPanel.classList.remove("large");
    }
  });
}

function toggleDrawer(panel) {
  for (const drawer of [ui.settingsPanel, ui.armoryPanel, ui.helpPanel]) {
    if (drawer !== panel) drawer.classList.add("hidden");
  }
  panel.classList.toggle("hidden");
}

function pauseGame() {
  if (game.state !== "playing") return;
  game.state = "paused";
  input.mouse.down = false;
  input.mouse.right = false;
  ui.menu.classList.remove("hidden");
  ui.hud.classList.add("hidden");
  ui.resumeBtn.classList.remove("hidden");
  ui.endMessage.classList.add("hidden");
  ui.startBtn.textContent = "重新开始";
}

function resumeGame() {
  if (game.state !== "paused") return;
  game.state = "playing";
  ui.menu.classList.add("hidden");
  ui.hud.classList.remove("hidden");
}

function switchWeapon(index) {
  const player = game.player;
  if (!player?.alive) return;
  const weaponId = player.weaponOrder[index];
  if (!weaponId || weaponId === player.currentWeapon) return;
  input.mouse.down = false;
  mouseFireWasDown = false;
  player.currentWeapon = weaponId;
  player.recoil = 0;
  const def = WEAPON_BY_ID[weaponId];
  showToast(`切换武器：${def.name}`, "");
  playTone(300 + index * 24, 0.035, "triangle", 0.03, 30);
}

function gameLoop(timestamp) {
  if (!lastFrame) lastFrame = timestamp;
  const dt = (timestamp - lastFrame) / 1000;
  lastFrame = timestamp;
  update(dt);
  draw();
  requestAnimationFrame(gameLoop);
}

function boot() {
  resizeCanvas();
  syncSettingsLabels();
  renderWeaponCards();
  setupEventListeners();
  draw();
  if (!animationStarted) {
    animationStarted = true;
    requestAnimationFrame(gameLoop);
  }
}

boot();
