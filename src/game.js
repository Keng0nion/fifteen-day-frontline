/* global THREE */
(() => {
  "use strict";

  const canvas = document.getElementById("gameCanvas");
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
    trackpadModeInput: $("trackpadModeInput"),
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
  const PLAYER_RADIUS = 18;
  const NPC_RADIUS = 17;
  const MAX_DT = 0.05;
  const WORLD_SCALE = 0.09;
  const WORLD_MARGIN = 52;

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
      color: 0xead38b,
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
      color: 0xf2ad66,
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
      color: 0xffdb9d,
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
      color: 0xffd067,
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
      color: 0xbfe8ff,
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
      color: 0xf2e7c0,
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
      color: 0xb8f0ac,
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
      color: 0xd3f1ff,
      sound: { freq: 175, type: "square", length: 0.07 },
      stats: { 伤害: 52, 射速: 68, 精度: 68, 机动: 76, 射程: 58 },
    },
  ];

  const WEAPON_BY_ID = Object.fromEntries(WEAPON_DEFS.map((weapon) => [weapon.id, weapon]));

  const FACTIONS = {
    expedition: { name: "第七远征军", short: "远征军", color: 0x7fd16b, css: "#7fd16b" },
    empire: { name: "钢盔帝国军", short: "帝国军", color: 0xe65b58, css: "#e65b58" },
    raiders: { name: "黑旗掠夺连", short: "黑旗", color: 0xf09b46, css: "#f09b46" },
    partisans: { name: "松林游击队", short: "游击队", color: 0x75b8ff, css: "#75b8ff" },
    medics: { name: "白鸽救护队", short: "救护队", color: 0xf0f2d0, css: "#f0f2d0" },
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
    deer: { name: "鹿", hp: 42, speed: 86, fleeSpeed: 150, meat: [2, 4], color: 0xc69058, behavior: "prey", radius: 13 },
    boar: { name: "野猪", hp: 78, speed: 68, fleeSpeed: 126, meat: [3, 5], color: 0x756154, behavior: "territorial", radius: 15, damage: 12 },
    wolf: { name: "狼", hp: 52, speed: 96, fleeSpeed: 165, meat: [1, 2], color: 0x7d8893, behavior: "predator", radius: 13, damage: 10 },
  };

  const DEFAULT_SETTINGS = {
    difficulty: 1,
    mapSize: 12500,
    dayLengthMinutes: 4,
    npcDensity: 1,
    wildlifeDensity: 1.2,
    sensitivity: 1,
    aimAssist: 0.08,
    trackpadMode: "auto",
    volume: 0.35,
  };

  const input = {
    keys: new Set(),
    mouse: { x: 0, y: 0, worldX: 0, worldY: 0, down: false, right: false },
    interact: false,
    reload: false,
    useItem: null,
    enlargedMap: false,
    aimToggle: false,
    keyboardFire: false,
    clickFireTimer: 0,
  };

  let settings = { ...DEFAULT_SETTINGS };
  let game = createEmptyGame();
  let renderer = null;
  let scene = null;
  let camera = null;
  let raycaster = null;
  let groundPlane = null;
  let sunLight = null;
  let moonLight = null;
  let ambientLight = null;
  let fog = null;
  let audioCtx = null;
  let lastFrame = 0;
  let animationStarted = false;
  let mouseFireWasDown = false;
  let cachedHudSignature = "";
  let bootErrorShown = false;

  const materials = {};
  const geometries = {};

  function createEmptyGame() {
    return {
      state: "menu",
      rng: mulberry32(Date.now() >>> 0),
      width: window.innerWidth || 1280,
      height: window.innerHeight || 720,
      mapSize: settings.mapSize,
      mapWorldSize: settings.mapSize * WORLD_SCALE,
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
      selectedInteraction: null,
      lastHudUpdate: 0,
      lastMiniMapUpdate: 0,
      renderables: new THREE.Group(),
      dynamicGroup: new THREE.Group(),
      projectileGroup: new THREE.Group(),
      particleGroup: new THREE.Group(),
      outcome: null,
      cameraShake: 0,
      cameraZoom: 1,
      spawnSafeRadius: 760,
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
    return a + wrapAngle(b - a) * t;
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

  function to3X(x) {
    return (x - game.mapSize / 2) * WORLD_SCALE;
  }

  function to3Z(y) {
    return (y - game.mapSize / 2) * WORLD_SCALE;
  }

  function from3X(x) {
    return x / WORLD_SCALE + game.mapSize / 2;
  }

  function from3Z(z) {
    return z / WORLD_SCALE + game.mapSize / 2;
  }

  function setMeshPosition(mesh, entity, y = 0) {
    if (!mesh) return;
    mesh.position.set(to3X(entity.x), y, to3Z(entity.y));
  }

  function createMaterial(name, color, roughness = 0.86, metalness = 0.02) {
    materials[name] = new THREE.MeshStandardMaterial({ color, roughness, metalness });
    return materials[name];
  }

  function initThree() {
    if (renderer) return true;
    if (!window.THREE) {
      showBootError("Three.js 未加载。请确认 vendor/three.min.js 存在，或通过本地服务器打开。已无法启动 3D 版。 ");
      return false;
    }

    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(window.innerWidth, window.innerHeight, false);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputEncoding = THREE.sRGBEncoding;

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x9fb1bd);
    fog = new THREE.FogExp2(0x9fb1bd, 0.0018);
    scene.fog = fog;

    camera = new THREE.PerspectiveCamera(68, window.innerWidth / window.innerHeight, 0.1, 2600);
    camera.position.set(0, 62, 74);
    camera.lookAt(0, 0, 0);

    raycaster = new THREE.Raycaster();
    groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);

    ambientLight = new THREE.HemisphereLight(0xd9e8ff, 0x27321f, 1.05);
    scene.add(ambientLight);

    sunLight = new THREE.DirectionalLight(0xfff1c4, 2.4);
    sunLight.position.set(100, 180, 80);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.set(2048, 2048);
    sunLight.shadow.camera.left = -420;
    sunLight.shadow.camera.right = 420;
    sunLight.shadow.camera.top = 420;
    sunLight.shadow.camera.bottom = -420;
    sunLight.shadow.camera.near = 10;
    sunLight.shadow.camera.far = 620;
    scene.add(sunLight);

    moonLight = new THREE.DirectionalLight(0x9bbdff, 0.15);
    moonLight.position.set(-80, 120, -100);
    scene.add(moonLight);

    initAssets();
    window.addEventListener("resize", resizeThree);
    return true;
  }

  function initAssets() {
    createMaterial("ground", 0x263421);
    createMaterial("mud", 0x4a392d);
    createMaterial("grass", 0x314c27);
    createMaterial("forest", 0x1f3e23);
    createMaterial("water", 0x244f62, 0.5);
    createMaterial("crater", 0x1a1915);
    createMaterial("road", 0x4d453a);
    createMaterial("wood", 0x5d4129);
    createMaterial("rock", 0x6b6e69);
    createMaterial("metal", 0x565c5c, 0.55, 0.18);
    createMaterial("sandbag", 0x786846);
    createMaterial("loot", 0xcaa563);
    createMaterial("medical", 0xf0f2d0);
    createMaterial("airdrop", 0xc57442);
    createMaterial("blood", 0x9b2424);
    createMaterial("task", 0xf0d06b);
    createMaterial("white", 0xf4f0d8);

    geometries.cylinder = new THREE.CylinderGeometry(1, 1, 1, 12);
    geometries.box = new THREE.BoxGeometry(1, 1, 1);
    geometries.sphere = new THREE.SphereGeometry(1, 12, 8);
    geometries.cone = new THREE.ConeGeometry(1, 1, 10);
    geometries.plane = new THREE.PlaneGeometry(1, 1);
  }

  function resizeThree() {
    game.width = window.innerWidth;
    game.height = window.innerHeight;
    if (!input.mouse.x && !input.mouse.y) {
      input.mouse.x = game.width / 2;
      input.mouse.y = game.height / 2;
    }
    if (!renderer || !camera) return;
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(window.innerWidth, window.innerHeight, false);
  }

  function showBootError(message) {
    if (bootErrorShown) return;
    bootErrorShown = true;
    ui.endMessage.classList.remove("hidden");
    ui.endMessage.textContent = message;
    showToast(message, "danger");
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
      trackpadMode: ui.trackpadModeInput.value,
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

  function isTrackpadFriendlyMode() {
    if (settings.trackpadMode === "on") return true;
    if (settings.trackpadMode === "off") return false;
    const nav = globalThis.navigator || {};
    return /Mac|iPad|iPhone|Apple/i.test(nav.platform || nav.userAgent || "");
  }

  function isAiming() {
    return input.mouse.right || input.aimToggle;
  }

  function wantsFireInput() {
    return input.mouse.down || input.keyboardFire || input.clickFireTimer > 0;
  }

  function playWeaponSound(def, source) {
    const distanceToPlayer = source && game.player ? dist(source, game.player) : 0;
    const falloff = clamp(1 - distanceToPlayer / 1450, 0.05, 1);
    const freq = def.sound.freq * (0.94 + game.rng() * 0.14);
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
    try {
      readSettings();
      if (!initThree()) return;
      initAudio();
      resetSceneGroups();
      const seed = (Date.now() ^ Math.floor(Math.random() * 1000000000)) >>> 0;
      game = createEmptyGame();
      game.rng = mulberry32(seed);
      game.state = "playing";
      game.mapSize = settings.mapSize;
      game.mapWorldSize = game.mapSize * WORLD_SCALE;
      game.minutes = 8 * 60;
      game.startMinutes = 8 * 60;
      game.serviceEndMinutes = 8 * 60 + SERVICE_DAYS * 1440;
      game.nextAirdropMinutes = game.minutes + rand(75, 145);
      game.nextWeatherMinutes = game.minutes + rand(180, 420);
      resetSceneGroups();
      generateWorld();
      createPlayer();
      generateTasks();
      enforceSpawnSafety();
      buildStaticWorldMeshes();
      buildEntityMeshes();
      input.mouse.x = game.width / 2;
      input.mouse.y = game.height / 2;
      input.mouse.worldX = game.player.x;
      input.mouse.worldY = game.player.y - 220;
      input.mouse.down = false;
      input.mouse.right = false;
      input.aimToggle = false;
      input.keyboardFire = false;
      input.clickFireTimer = 0;
      cachedHudSignature = "";
      ui.menu.classList.add("hidden");
      ui.hud.classList.remove("hidden");
      ui.resumeBtn.classList.add("hidden");
      ui.endMessage.classList.add("hidden");
      ui.minimapPanel.classList.remove("large");
      updateHud(true);
      drawMiniMap();
      showToast("3D 部署完成：完成 5 个系统任务，或活过 15 天。", "good");
      showToast("医疗规则：输血包是唯一回血道具；其他物资只移除对应 debuff。", "warn");
      playTone(420, 0.14, "triangle", 0.08, 120);
    } catch (error) {
      console.error(error);
      showBootError(`启动失败：${error.message || error}`);
    }
  }

  function resetSceneGroups() {
    if (!scene) return;
    for (const groupName of ["renderables", "dynamicGroup", "projectileGroup", "particleGroup"]) {
      const group = game?.[groupName];
      if (group) scene.remove(group);
    }
    if (game) {
      game.renderables = new THREE.Group();
      game.dynamicGroup = new THREE.Group();
      game.projectileGroup = new THREE.Group();
      game.particleGroup = new THREE.Group();
      scene.add(game.renderables, game.dynamicGroup, game.projectileGroup, game.particleGroup);
    }
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
    game.landmarks.push({ id: "base", name: "己方前线壕沟", type: "base", factionId: "expedition", x: center.x, y: center.y, r: 230, color: 0x59795f });

    const landmarkTypes = ["village", "bunker", "relay", "depot", "forestCamp", "fieldHospital", "ruins", "watchPost", "farm", "railYard"];
    const landmarkCount = Math.floor(size / 1120) + 7;
    const minSpacing = landmarkSpacing(size);
    for (let i = 0; i < landmarkCount; i += 1) {
      const position = findLandmarkPosition(i, landmarkCount, center, size, minSpacing);
      const angle = position.angle;
      const radius = position.radius;
      const x = position.x;
      const y = position.y;
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
      game.landmarks.push({ id: `${type}-${i}`, name: names[type], type, factionId, x, y, r: rand(165, 320), color: landmarkColor(type) });
    }

    for (let i = 0; i < game.landmarks.length - 1; i += 1) game.roads.push(makeRoad(game.landmarks[i], game.landmarks[(i + 1) % game.landmarks.length]));
    for (let i = 1; i < game.landmarks.length; i += 3) game.roads.push(makeRoad(game.landmarks[0], game.landmarks[i]));

    const terrainCount = Math.floor(size / 16);
    for (let i = 0; i < terrainCount; i += 1) {
      const typeRoll = game.rng();
      const type = typeRoll < 0.43 ? "grass" : typeRoll < 0.66 ? "mud" : typeRoll < 0.83 ? "forest" : typeRoll < 0.93 ? "crater" : "water";
      game.terrain.push({ type, x: rand(100, size - 100), y: rand(100, size - 100), r: type === "water" ? rand(90, 250) : rand(45, 185), rx: rand(0.8, 1.8), ry: rand(0.65, 1.45), rot: rand(0, TAU), alpha: rand(0.14, 0.5), zOffset: rand(0.006, 0.032) });
    }

    generateObstaclesAroundLandmarks();
    generateNaturalObstacles(size);
    spawnFactionSquads();
    spawnWildlife();
  }

  function landmarkSpacing(size) {
    return clamp(size * 0.115, 900, 1650);
  }

  function findLandmarkPosition(index, count, center, size, minSpacing) {
    const margin = clamp(size * 0.055, 480, 820);
    const baseAngle = (index / count) * TAU;
    let best = null;
    let bestScore = -Infinity;

    for (let tries = 0; tries < 82; tries += 1) {
      const broadSearch = tries > 36;
      const angle = broadSearch ? rand(0, TAU) : baseAngle + rand(-0.46, 0.46);
      const band = (index + tries) % 4;
      const minRadius = size * (band === 0 ? 0.23 : band === 1 ? 0.31 : band === 2 ? 0.39 : 0.45);
      const maxRadius = Math.min(size * 0.49, minRadius + size * 0.12);
      const radius = rand(minRadius, maxRadius);
      const x = clamp(center.x + Math.cos(angle) * radius, margin, size - margin);
      const y = clamp(center.y + Math.sin(angle) * radius, margin, size - margin);
      const actualRadius = distXY(center.x, center.y, x, y);
      const closest = nearestLandmarkDistance(x, y);
      const spacingScore = closest + actualRadius * 0.08 - (broadSearch ? 35 : 0);

      if (closest >= minSpacing) return { x, y, angle, radius: actualRadius };
      if (spacingScore > bestScore) {
        bestScore = spacingScore;
        best = { x, y, angle, radius: actualRadius };
      }
    }

    return best || { x: center.x, y: center.y, angle: baseAngle, radius: 0 };
  }

  function nearestLandmarkDistance(x, y) {
    let closest = Infinity;
    for (const landmark of game.landmarks) closest = Math.min(closest, distXY(x, y, landmark.x, landmark.y));
    return closest;
  }

  function chooseLandmarkFaction(type, angle, radius, size) {
    if (radius < size * 0.24) return game.rng() < 0.72 ? "expedition" : game.rng() < 0.5 ? "partisans" : "medics";
    if (type === "fieldHospital") return game.rng() < 0.62 ? "medics" : "raiders";
    if (type === "forestCamp" || type === "farm") return game.rng() < 0.68 ? "partisans" : "raiders";
    if (type === "ruins") return game.rng() < 0.55 ? "raiders" : "empire";
    if (type === "depot" || type === "bunker" || type === "railYard") return game.rng() < 0.75 ? "empire" : "raiders";
    if (Math.cos(angle) > 0.2) return "empire";
    return game.rng() < 0.52 ? "raiders" : "partisans";
  }

  function landmarkColor(type) {
    const colors = { base: 0x55735a, village: 0x736556, bunker: 0x6c6f6a, relay: 0x678aa1, depot: 0x8b7650, forestCamp: 0x4e764d, fieldHospital: 0x806866, ruins: 0x716a60, farm: 0x777249, railYard: 0x5f6264 };
    return colors[type] || 0x7d846f;
  }

  function makeRoad(from, to) {
    const points = [];
    const segments = randInt(3, 6);
    for (let i = 0; i <= segments; i += 1) {
      const t = i / segments;
      points.push({ x: lerp(from.x, to.x, t) + rand(-95, 95) * Math.sin(t * Math.PI), y: lerp(from.y, to.y, t) + rand(-95, 95) * Math.sin(t * Math.PI) });
    }
    return { points, width: rand(24, 42), color: game.rng() > 0.5 ? 0x4d453a : 0x3f463c };
  }

  function generateObstaclesAroundLandmarks() {
    for (const landmark of game.landmarks) {
      if (landmark.type === "base") {
        for (let i = 0; i < 12; i += 1) {
          const angle = (i / 12) * TAU;
          game.obstacles.push({ type: "trench", x: landmark.x + Math.cos(angle) * 190, y: landmark.y + Math.sin(angle) * 190, w: 135, h: 28, rot: angle, blocks: false, cover: true });
        }
        for (let i = 0; i < 6; i += 1) {
          const p = findOpenPointNear(landmark, 170, 42, 22);
          game.loot.push({ id: id(), type: "cache", name: "己方小补给", x: p.x, y: p.y, radius: 17, searched: false, contents: { bandage: 1, ration: 1, ammo: 1 } });
        }
        continue;
      }

      const structures = landmark.type === "forestCamp" || landmark.type === "farm" ? randInt(3, 6) : randInt(4, 10);
      for (let i = 0; i < structures; i += 1) {
        for (let tries = 0; tries < 14; tries += 1) {
          const angle = rand(0, TAU);
          const radius = rand(35, landmark.r * 0.78);
          const common = { x: landmark.x + Math.cos(angle) * radius, y: landmark.y + Math.sin(angle) * radius, w: rand(46, 122), h: rand(36, 108), rot: rand(0, TAU), blocks: true, cover: true };
          const obstacle = landmark.type === "forestCamp" ? { ...common, type: "tent" } : landmark.type === "farm" ? { ...common, type: game.rng() < 0.4 ? "hay" : "barn" } : { ...common, type: landmark.type === "bunker" ? "bunker" : landmark.type === "relay" ? "tower" : landmark.type === "railYard" ? "railcar" : "building" };
          if (addObstacleIfClear(obstacle, 20)) break;
        }
      }

      if (["depot", "fieldHospital", "ruins", "village", "railYard"].includes(landmark.type)) {
        const p = findOpenPointNear(landmark, landmark.r * 0.55, 32, 24);
        game.loot.push({ id: id(), type: "cache", name: landmark.type === "fieldHospital" ? "医疗箱" : landmark.type === "depot" ? "弹药补给箱" : "遗留补给箱", x: p.x, y: p.y, radius: 18, searched: false, contents: randomCacheContents(landmark.type) });
      }
    }
  }

  function generateNaturalObstacles(size) {
    const naturalCount = Math.floor(size / 14);
    for (let i = 0; i < naturalCount; i += 1) {
      const typeRoll = game.rng();
      const type = typeRoll < 0.6 ? "tree" : typeRoll < 0.86 ? "rock" : "crater";
      const x = rand(80, size - 80);
      const y = rand(80, size - 80);
      if (distXY(x, y, size / 2, size / 2) < 180) continue;
      addObstacleIfClear({ type, x, y, radius: type === "tree" ? rand(16, 34) : rand(12, 34), w: rand(28, 62), h: rand(22, 58), rot: rand(0, TAU), blocks: type !== "crater", cover: type !== "crater" }, 10);
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
      spawnGrace: 7,
      kills: 0,
      harvests: 0,
      mesh: null,
    };
  }

  function spawnFactionSquads() {
    const density = settings.npcDensity;
    for (const landmark of game.landmarks) {
      if (landmark.type === "base") continue;
      const priorityCamp = landmark.type === "bunker" || landmark.type === "depot" || landmark.type === "railYard";
      const squadCount = priorityCamp ? randInt(1, 2) : 1;
      const scaledSquadCount = Math.max(1, Math.round(squadCount * density));
      for (let i = 0; i < scaledSquadCount; i += 1) {
        const size = landmark.factionId === "medics" ? randInt(3, 5) : landmark.factionId === "raiders" ? randInt(4, 6) : randInt(5, 8);
        createSquad(landmark.factionId, landmark, size, landmark.type === "bunker" ? "hold" : "patrol");
      }
    }

    const base = game.landmarks[0];
    const baseSquads = Math.max(2, Math.round(3 * density));
    for (let i = 0; i < baseSquads; i += 1) createSquad("expedition", base, randInt(5, 7), i === 0 ? "guard" : "patrol");

    const mapScale = Math.pow(game.mapSize / 8200, 0.65);
    const targetTotal = Math.floor(90 * mapScale * density * (0.82 + settings.difficulty * 0.22));
    while (game.npcs.length < targetTotal) {
      const landmark = pick(game.landmarks.slice(1));
      createSquad(landmark.factionId, landmark, randInt(3, 6), "patrol");
    }
  }

  function createSquad(factionId, landmark, size, objective) {
    const mapPatrolScale = Math.pow(game.mapSize / 8200, 0.42);
    const doctrinePatrolScale = objective === "hold" || objective === "guard" ? 0.78 : factionId === "partisans" ? 1.24 : factionId === "raiders" ? 1.18 : 1;
    const patrolRadius = clamp(landmark.r * rand(1.15, 2.6) * mapPatrolScale * doctrinePatrolScale, 320, 1250);
    const rally = findOpenPointNear(landmark, patrolRadius * 0.72, Math.min(120, landmark.r * 0.22), NPC_RADIUS + 6);
    const squad = { id: id(), factionId, unitName: pick(UNIT_NAMES[factionId]), home: { x: landmark.x, y: landmark.y, r: landmark.r, name: landmark.name }, rally, objective, target: null, lastEnemy: null, lastEnemyTime: -999, investigation: null, orderTimer: rand(5, 18), scanTimer: rand(0.2, 1.1), patrolRadius, aggression: factionId === "raiders" ? rand(0.75, 1.1) : factionId === "medics" ? rand(0.25, 0.55) : rand(0.48, 0.92), cohesion: rand(0.72, 1.12), morale: rand(0.72, 1.15) };
    game.squads.push(squad);
    const roles = chooseSquadRoles(factionId, size);
    for (let i = 0; i < size; i += 1) {
      const spawn = findOpenPointNear(landmark, Math.max(90, landmark.r * 0.62), 38, NPC_RADIUS + 6);
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
      detour: null,
      stuckTimer: 0,
      taskId: null,
      mesh: null,
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
    const inv = { bandage: game.rng() < 0.62 ? 1 : 0, splint: game.rng() < 0.22 ? 1 : 0, bloodBag: game.rng() < 0.18 ? 1 : 0, ration: game.rng() < 0.58 ? randInt(1, 2) : 0, antibiotic: game.rng() < 0.12 ? 1 : 0, ammo: game.rng() < 0.28 ? 1 : 0 };
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
    const count = Math.floor((size / 8200) * 72 * settings.wildlifeDensity);
    const forests = game.terrain.filter((patch) => patch.type === "forest" || patch.type === "grass");
    for (let i = 0; i < count; i += 1) {
      const roll = game.rng();
      const type = roll < 0.58 ? "deer" : roll < 0.83 ? "boar" : "wolf";
      let x = rand(120, size - 120);
      let y = rand(120, size - 120);
      for (let tries = 0; tries < 18; tries += 1) {
        const forest = forests.length ? pick(forests) : null;
        if (forest && game.rng() < 0.62) {
          x = clamp(forest.x + rand(-forest.r, forest.r), 90, size - 90);
          y = clamp(forest.y + rand(-forest.r, forest.r), 90, size - 90);
        } else {
          x = rand(120, size - 120);
          y = rand(120, size - 120);
        }
        if (!isInsideSpawnSafeZone(x, y, type === "wolf" || type === "boar" ? game.spawnSafeRadius + 180 : game.spawnSafeRadius)) break;
      }
      game.animals.push(createAnimal(type, x, y));
    }
  }

  function isInsideSpawnSafeZone(x, y, radius = game.spawnSafeRadius) {
    return distXY(x, y, game.mapSize / 2, game.mapSize / 2) < radius;
  }

  function createAnimal(type, x, y) {
    const def = ANIMAL_DEFS[type];
    return { id: id(), kind: "animal", type, name: def.name, x, y, vx: 0, vy: 0, radius: def.radius, hp: def.hp, maxHp: def.hp, alive: true, state: "graze", target: randomNearby({ x, y }, 260), thinkTimer: rand(0.3, 2.4), meat: randInt(def.meat[0], def.meat[1]), lastAttackedAt: -999, mesh: null };
  }

  function enforceSpawnSafety() {
    const cx = game.mapSize / 2;
    const cy = game.mapSize / 2;
    const hostileSafeRadius = game.spawnSafeRadius;
    const predatorSafeRadius = game.spawnSafeRadius + 220;

    if (game.player) {
      game.player.hp = game.player.maxHp;
      game.player.hunger = 100;
      game.player.statuses = { bleeding: 0, fracture: 0, infection: 0, starving: 0, suppressed: 0 };
      game.player.spawnGrace = 7;
    }

    for (const npc of game.npcs) {
      if (!isHostileFaction("expedition", npc.factionId)) continue;
      if (distXY(npc.x, npc.y, cx, cy) < hostileSafeRadius) relocateOutsideSpawn(npc, hostileSafeRadius + 180);
    }

    for (const animal of game.animals) {
      if (animal.type === "wolf" || animal.type === "boar") {
        if (distXY(animal.x, animal.y, cx, cy) < predatorSafeRadius) relocateOutsideSpawn(animal, predatorSafeRadius + 120);
      }
    }
  }

  function relocateOutsideSpawn(entity, minRadius) {
    const cx = game.mapSize / 2;
    const cy = game.mapSize / 2;
    for (let tries = 0; tries < 28; tries += 1) {
      const origin = entity.home || pick(game.landmarks.slice(1));
      const candidate = origin ? randomNearby(origin, Math.max(origin.r || 240, minRadius * 0.55)) : null;
      if (candidate && distXY(candidate.x, candidate.y, cx, cy) >= minRadius) {
        entity.x = candidate.x;
        entity.y = candidate.y;
        if (entity.target && distXY(entity.target.x, entity.target.y, cx, cy) < minRadius) entity.target = randomNearby(entity, 260);
        return;
      }
      const angle = rand(0, TAU);
      const radius = rand(minRadius, game.mapSize * 0.48);
      entity.x = clamp(cx + Math.cos(angle) * radius, WORLD_MARGIN, game.mapSize - WORLD_MARGIN);
      entity.y = clamp(cy + Math.sin(angle) * radius, WORLD_MARGIN, game.mapSize - WORLD_MARGIN);
      if (distXY(entity.x, entity.y, cx, cy) >= minRadius) return;
    }
  }

  function randomNearby(origin, radius, minRadius = radius * 0.2) {
    const angle = rand(0, TAU);
    const distance = rand(Math.min(minRadius, radius), radius);
    return { x: clamp(origin.x + Math.cos(angle) * distance, WORLD_MARGIN, game.mapSize - WORLD_MARGIN), y: clamp(origin.y + Math.sin(angle) * distance, WORLD_MARGIN, game.mapSize - WORLD_MARGIN) };
  }

  function findOpenPointNear(origin, radius, minRadius = radius * 0.2, clearance = NPC_RADIUS + 4) {
    let best = clampPoint(origin);
    let bestScore = walkabilityScore(best.x, best.y, clearance);
    for (let tries = 0; tries < 32; tries += 1) {
      const candidate = randomNearby(origin, radius, minRadius);
      const score = walkabilityScore(candidate.x, candidate.y, clearance);
      if (score >= 1) return candidate;
      if (score > bestScore) {
        best = candidate;
        bestScore = score;
      }
    }
    return best;
  }

  function walkabilityScore(x, y, clearance = NPC_RADIUS + 4) {
    if (x < WORLD_MARGIN || y < WORLD_MARGIN || x > game.mapSize - WORLD_MARGIN || y > game.mapSize - WORLD_MARGIN) return -1;
    let score = 1;
    for (const obstacle of game.obstacles) {
      if (!obstacle.blocks) continue;
      const overlap = collisionDepthAt(x, y, clearance, obstacle);
      if (overlap > 0) return -overlap;
      const near = obstacle.radius ? obstacle.radius + clearance + 42 : Math.max(obstacle.w, obstacle.h) * 0.55 + clearance + 42;
      const d = distXY(x, y, obstacle.x, obstacle.y);
      if (d < near) score = Math.min(score, clamp((d - clearance) / Math.max(near, 1), 0, 1));
    }
    return score;
  }

  function addObstacleIfClear(obstacle, padding = 12) {
    for (const existing of game.obstacles) {
      const min = obstacleBoundsRadius(obstacle) + obstacleBoundsRadius(existing) + padding;
      if (distXY(obstacle.x, obstacle.y, existing.x, existing.y) < min) return false;
    }
    game.obstacles.push(obstacle);
    return true;
  }

  function obstacleBoundsRadius(obstacle) {
    if (obstacle.radius) return obstacle.radius;
    return Math.hypot(obstacle.w || 0, obstacle.h || 0) * 0.5;
  }

  function clampPoint(point) {
    return { ...point, x: clamp(point.x, WORLD_MARGIN, game.mapSize - WORLD_MARGIN), y: clamp(point.y, WORLD_MARGIN, game.mapSize - WORLD_MARGIN) };
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
    return { id: id(), type: "capture", title: `占领 ${landmark.name}`, description: "进入目标圈并保持控制。圈内有敌人时进度减慢。", x: landmark.x, y: landmark.y, radius: Math.max(95, landmark.r * 0.55), progress: 0, required: 24, done: false, mesh: null };
  }

  function createIntelTask() {
    const landmark = candidateLandmark(["ruins", "village", "relay", "railYard"], true);
    const point = findOpenPointNear(landmark, landmark.r * 0.58, 34, 24);
    const x = point.x;
    const y = point.y;
    const taskId = id();
    game.loot.push({ id: id(), type: "intel", name: "密封情报筒", x, y, radius: 16, searched: false, contents: { intel: 1 }, taskId, reservedForPlayer: true, mesh: null });
    return { id: taskId, type: "intel", title: `回收 ${landmark.name} 的情报`, description: "抵达标记处按 E 搜索情报筒。", x, y, radius: 54, progress: 0, required: 1, done: false, mesh: null };
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
    return { id: taskId, type: "eliminate", title: `清除 ${landmark.name} 驻守小队`, description: "标记小队会协同防守，并会抢医疗和弹药。", x: landmark.x, y: landmark.y, radius: landmark.r, progress: 0, required, done: false, mesh: null };
  }

  function createMedCacheTask() {
    const landmark = candidateLandmark(["fieldHospital", "depot", "village"], true);
    const point = findOpenPointNear(landmark, landmark.r * 0.62, 34, 24);
    const x = point.x;
    const y = point.y;
    const taskId = id();
    game.loot.push({ id: id(), type: "medcache", name: "分类医疗物资", x, y, radius: 17, searched: false, contents: { bandage: 2, splint: 1, antibiotic: 1, bloodBag: 1 }, taskId, reservedForPlayer: true, mesh: null });
    return { id: taskId, type: "medcache", title: `回收 ${landmark.name} 的医疗物资`, description: "按 E 搜索医疗箱。注意：这些物资各自只解决一种问题。", x, y, radius: 52, progress: 0, required: 1, done: false, mesh: null };
  }

  function createNightTask() {
    return { id: id(), type: "night", title: "完整熬过一个夜晚", description: "20:00 到 06:00 计入进度。夜间能见度下降，枪声更容易暴露位置。", progress: 0, required: 10 * 60, done: false };
  }

  function createDisruptTask() {
    const landmark = candidateLandmark(["relay", "bunker", "depot"], true);
    return { id: id(), type: "disrupt", title: `破坏 ${landmark.name} 的战术设施`, description: "在目标附近按 E 安放炸药并坚守数秒。", x: landmark.x, y: landmark.y, radius: 58, progress: 0, required: 10, armed: false, done: false, mesh: null };
  }

  function buildStaticWorldMeshes() {
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(game.mapWorldSize, game.mapWorldSize, 64, 64), materials.ground);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    game.renderables.add(ground);

    for (const road of game.roads) buildRoadMesh(road);
    for (const patch of game.terrain) buildTerrainPatch(patch);
    for (const landmark of game.landmarks) buildLandmarkMesh(landmark);
    for (const obstacle of game.obstacles) buildObstacleMesh(obstacle);
    for (const loot of game.loot) loot.mesh = buildLootMesh(loot);
    for (const task of game.tasks) if (task.x !== undefined) task.mesh = buildTaskMarkerMesh(task);
  }

  function buildRoadMesh(road) {
    const group = new THREE.Group();
    for (let i = 1; i < road.points.length; i += 1) {
      const a = road.points[i - 1];
      const b = road.points[i];
      const len = distXY(a.x, a.y, b.x, b.y) * WORLD_SCALE;
      const mesh = new THREE.Mesh(geometries.box, materials.road);
      mesh.scale.set(road.width * WORLD_SCALE, 0.08, len);
      mesh.position.set(to3X((a.x + b.x) / 2), 0.06, to3Z((a.y + b.y) / 2));
      mesh.rotation.y = -Math.atan2(b.y - a.y, b.x - a.x) + Math.PI / 2;
      mesh.receiveShadow = true;
      group.add(mesh);
    }
    game.renderables.add(group);
  }

  function buildTerrainPatch(patch) {
    const mat = materials[patch.type] || materials.grass;
    const mesh = new THREE.Mesh(new THREE.CircleGeometry(patch.r * WORLD_SCALE, 24), mat);
    mesh.rotation.x = -Math.PI / 2;
    mesh.rotation.z = patch.rot;
    mesh.position.set(to3X(patch.x), 0.09 + (patch.zOffset || 0), to3Z(patch.y));
    mesh.scale.set(patch.rx, patch.ry, 1);
    mesh.renderOrder = patch.type === "water" ? 3 : 2;
    mesh.receiveShadow = true;
    game.renderables.add(mesh);

    if (patch.type === "water") {
      mesh.material = new THREE.MeshStandardMaterial({ color: 0x244f62, transparent: true, opacity: 0.78, roughness: 0.35, metalness: 0.05, depthWrite: false });
    }
  }

  function buildLandmarkMesh(landmark) {
    const ring = new THREE.Mesh(new THREE.RingGeometry(landmark.r * WORLD_SCALE * 0.96, landmark.r * WORLD_SCALE, 48), new THREE.MeshBasicMaterial({ color: FACTIONS[landmark.factionId]?.color || 0xffffff, transparent: true, opacity: 0.55, side: THREE.DoubleSide, depthWrite: false }));
    ring.rotation.x = -Math.PI / 2;
    ring.position.set(to3X(landmark.x), 0.18, to3Z(landmark.y));
    ring.renderOrder = 5;
    game.renderables.add(ring);
  }

  function buildObstacleMesh(obstacle) {
    let mesh;
    if (obstacle.radius) {
      if (obstacle.type === "tree") {
        const group = new THREE.Group();
        const trunk = new THREE.Mesh(geometries.cylinder, materials.wood);
        trunk.scale.set(obstacle.radius * WORLD_SCALE * 0.24, obstacle.radius * WORLD_SCALE * 0.9, obstacle.radius * WORLD_SCALE * 0.24);
        trunk.position.y = obstacle.radius * WORLD_SCALE * 0.45;
        trunk.castShadow = true;
        const crown = new THREE.Mesh(geometries.cone, materials.forest);
        crown.scale.set(obstacle.radius * WORLD_SCALE * 0.95, obstacle.radius * WORLD_SCALE * 1.45, obstacle.radius * WORLD_SCALE * 0.95);
        crown.position.y = obstacle.radius * WORLD_SCALE * 1.25;
        crown.castShadow = true;
        group.add(trunk, crown);
        group.position.set(to3X(obstacle.x), 0, to3Z(obstacle.y));
        obstacle.mesh = group;
        game.renderables.add(group);
        return group;
      }
      mesh = new THREE.Mesh(geometries.sphere, obstacle.type === "rock" ? materials.rock : materials.crater);
      mesh.scale.set(obstacle.radius * WORLD_SCALE, obstacle.radius * WORLD_SCALE * 0.45, obstacle.radius * WORLD_SCALE * 0.8);
      mesh.position.set(to3X(obstacle.x), obstacle.radius * WORLD_SCALE * 0.35, to3Z(obstacle.y));
    } else {
      mesh = new THREE.Mesh(geometries.box, materialForObstacle(obstacle.type));
      mesh.scale.set(obstacle.w * WORLD_SCALE, obstacle.type === "tower" ? 12 : obstacle.type === "trench" ? 0.35 : rand(3.5, 7.5), obstacle.h * WORLD_SCALE);
      mesh.position.set(to3X(obstacle.x), mesh.scale.y / 2, to3Z(obstacle.y));
      mesh.rotation.y = -obstacle.rot;
    }
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    obstacle.mesh = mesh;
    game.renderables.add(mesh);
    return mesh;
  }

  function materialForObstacle(type) {
    if (type === "bunker" || type === "tower" || type === "railcar") return materials.metal;
    if (type === "trench" || type === "hay") return materials.sandbag;
    if (type === "tent" || type === "barn" || type === "building") return materials.wood;
    return materials.rock;
  }

  function buildLootMesh(loot) {
    const mesh = new THREE.Mesh(geometries.box, loot.type === "medcache" ? materials.medical : loot.type === "intel" ? materials.white : materials.loot);
    mesh.scale.set(2.4, 1.2, 2.4);
    mesh.position.set(to3X(loot.x), 0.8, to3Z(loot.y));
    mesh.castShadow = true;
    game.dynamicGroup.add(mesh);
    return mesh;
  }

  function buildTaskMarkerMesh(task) {
    const ring = new THREE.Mesh(new THREE.RingGeometry((task.radius || 52) * WORLD_SCALE * 0.92, (task.radius || 52) * WORLD_SCALE, 36), new THREE.MeshBasicMaterial({ color: 0xf0d06b, transparent: true, opacity: 0.78, side: THREE.DoubleSide, depthWrite: false }));
    ring.rotation.x = -Math.PI / 2;
    ring.position.set(to3X(task.x), 0.26, to3Z(task.y));
    ring.renderOrder = 6;
    game.dynamicGroup.add(ring);
    return ring;
  }

  function buildEntityMeshes() {
    if (game.player) game.player.mesh = makeHumanMesh(0xd9ffd3, true);
    setMeshPosition(game.player.mesh, game.player, 0);
    game.dynamicGroup.add(game.player.mesh);
    for (const npc of game.npcs) {
      npc.mesh = makeHumanMesh(FACTIONS[npc.factionId].color, false, npc.role);
      setMeshPosition(npc.mesh, npc, 0);
      game.dynamicGroup.add(npc.mesh);
    }
    for (const animal of game.animals) {
      animal.mesh = makeAnimalMesh(animal);
      setMeshPosition(animal.mesh, animal, 0);
      game.dynamicGroup.add(animal.mesh);
    }
  }

  function makeHumanMesh(color, isPlayer, role) {
    const group = new THREE.Group();
    const body = new THREE.Mesh(geometries.cylinder, new THREE.MeshStandardMaterial({ color, roughness: 0.8 }));
    body.scale.set(1.25, 2.6, 1.25);
    body.position.y = 2.6;
    body.castShadow = true;
    const head = new THREE.Mesh(geometries.sphere, new THREE.MeshStandardMaterial({ color: isPlayer ? 0xf0ffd8 : 0xd0c0a0, roughness: 0.7 }));
    head.scale.set(0.82, 0.82, 0.82);
    head.position.y = 5.45;
    head.castShadow = true;
    const barrel = new THREE.Mesh(geometries.box, new THREE.MeshStandardMaterial({ color: 0x202020, roughness: 0.55, metalness: 0.2 }));
    barrel.scale.set(0.35, 0.35, 2.6);
    barrel.position.set(0, 3.4, -1.9);
    barrel.castShadow = true;
    const marker = new THREE.Mesh(geometries.cone, new THREE.MeshBasicMaterial({ color: isPlayer ? 0xd9ffd3 : color }));
    marker.scale.set(0.6, 1.1, 0.6);
    marker.position.set(0, 7.0, 0);
    marker.rotation.x = Math.PI;
    if (role === "medic") {
      const crossA = new THREE.Mesh(geometries.box, materials.blood);
      crossA.scale.set(0.1, 0.55, 0.08);
      crossA.position.set(0, 5.45, -0.82);
      const crossB = new THREE.Mesh(geometries.box, materials.blood);
      crossB.scale.set(0.52, 0.1, 0.08);
      crossB.position.set(0, 5.45, -0.84);
      group.add(crossA, crossB);
    }
    group.add(body, head, barrel, marker);
    group.userData.barrel = barrel;
    return group;
  }

  function makeAnimalMesh(animal) {
    const def = ANIMAL_DEFS[animal.type];
    const group = new THREE.Group();
    const body = new THREE.Mesh(geometries.sphere, new THREE.MeshStandardMaterial({ color: def.color, roughness: 0.82 }));
    body.scale.set(1.8, 0.9, 1.05);
    body.position.y = 1.1;
    body.castShadow = true;
    const head = new THREE.Mesh(geometries.sphere, new THREE.MeshStandardMaterial({ color: def.color, roughness: 0.82 }));
    head.scale.set(0.65, 0.55, 0.65);
    head.position.set(0, 1.45, -1.25);
    head.castShadow = true;
    group.add(body, head);
    return group;
  }

  function update(dt) {
    if (game.state !== "playing") return;
    const step = Math.min(dt, MAX_DT);
    updateMouseWorld();
    updateTime(step);
    updateWeather();
    updateSquads(step);
    updatePlayer(step);
    if (game.state !== "playing") return;
    updateNpcs(step);
    updateAnimals(step);
    updateBullets(step);
    updateParticles(step);
    updateAirdrop(step);
    updateTasks(step);
    refreshInteractPrompt();
    updateCamera(step);
    syncMeshes(step);
    checkEndings();
    cleanupWorld();

    game.lastHudUpdate += step;
    game.lastMiniMapUpdate += step;
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
    input.clickFireTimer = Math.max(0, input.clickFireTimer - step);
    if (!wantsFireInput()) mouseFireWasDown = false;
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
    if (!camera || !raycaster || !groundPlane) return;
    const ndc = new THREE.Vector2((input.mouse.x / game.width) * 2 - 1, -(input.mouse.y / game.height) * 2 + 1);
    raycaster.setFromCamera(ndc, camera);
    const hit = new THREE.Vector3();
    const result = raycaster.ray.intersectPlane(groundPlane, hit);
    if (!result || !Number.isFinite(hit.x) || !Number.isFinite(hit.z)) return;
    input.mouse.worldX = clamp(from3X(hit.x), 0, game.mapSize);
    input.mouse.worldY = clamp(from3Z(hit.z), 0, game.mapSize);
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
    const aiming = isAiming();
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
    const aimDistance = distXY(player.x, player.y, assisted.x, assisted.y);
    if (Number.isFinite(assisted.x) && Number.isFinite(assisted.y) && aimDistance > 42) {
      const desiredAngle = Math.atan2(assisted.y - player.y, assisted.x - player.x);
      player.angle = lerpAngle(player.angle, desiredAngle, 1 - Math.exp(-dt * 10 * settings.sensitivity));
    }

    const hungerDrainPerSecond = (100 / (settings.dayLengthMinutes * 60 * 1.35)) * settings.difficulty;
    player.hunger = clamp(player.hunger - hungerDrainPerSecond * dt * (sprinting && moving ? 2.15 : moving ? 1.18 : 0.72), 0, 100);
    if (player.spawnGrace > 0) player.spawnGrace = Math.max(0, player.spawnGrace - dt);
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
    if (!wantsFireInput()) return false;
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
    const aiming = entity.kind === "player" ? isAiming() : entity.decision?.aiming;
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
    if (isPlayer) game.cameraShake = Math.min(18, game.cameraShake + def.kick * (isAiming() ? 0.56 : 1));
    if (isPlayer || dist(entity, game.player) < 1500) playWeaponSound(def, entity);
    makeMuzzleFlash(entity, angle, def);
    createNoise(entity.x, entity.y, def.noise, entity);
    return true;
  }

  function spawnBullet(owner, def, angle, damageMultiplier) {
    const muzzleDistance = owner.radius + 10;
    const speed = def.bulletSpeed * rand(0.94, 1.04);
    const mesh = new THREE.Mesh(geometries.sphere, new THREE.MeshBasicMaterial({ color: def.color }));
    mesh.scale.set(def.ammoType === "arrow" ? 0.16 : 0.22, def.ammoType === "arrow" ? 0.16 : 0.22, def.ammoType === "arrow" ? 1.1 : 0.75);
    mesh.position.set(to3X(owner.x + Math.cos(angle) * muzzleDistance), 2.7, to3Z(owner.y + Math.sin(angle) * muzzleDistance));
    mesh.rotation.y = -angle - Math.PI / 2;
    game.projectileGroup.add(mesh);
    game.bullets.push({ id: id(), owner, ownerKind: owner.kind, factionId: owner.factionId, x: owner.x + Math.cos(angle) * muzzleDistance, y: owner.y + Math.sin(angle) * muzzleDistance, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, damage: def.damage * damageMultiplier, maxRange: def.range * rand(0.92, 1.08), traveled: 0, radius: def.pellets > 1 ? 2.4 : def.ammoType === "arrow" ? 3.2 : 2.2, color: def.color, def, ttl: 2.4, mesh });
  }

  function makeMuzzleFlash(entity, angle, def) {
    const mesh = new THREE.Mesh(geometries.sphere, new THREE.MeshBasicMaterial({ color: def.color, transparent: true, opacity: def.silent ? 0.4 : 0.9 }));
    mesh.scale.set(def.silent ? 0.5 : 1.2, def.silent ? 0.5 : 1.2, def.silent ? 0.5 : 1.2);
    mesh.position.set(to3X(entity.x + Math.cos(angle) * (entity.radius + 12)), 3.0, to3Z(entity.y + Math.sin(angle) * (entity.radius + 12)));
    game.particleGroup.add(mesh);
    game.particles.push({ type: "flash", mesh, x: entity.x, y: entity.y, vx: 0, vy: 0, life: def.silent ? 0.08 : 0.13, maxLife: def.silent ? 0.08 : 0.13 });
  }

  function createNoise(x, y, volume, sourceEntity) {
    if (volume < 0.2 || !sourceEntity) return;
    const radius = 360 + volume * 620;
    const alertedSquads = new Set();
    for (const npc of game.npcs) {
      if (!npc.alive || npc === sourceEntity) continue;
      const d = distXY(x, y, npc.x, npc.y);
      if (d < radius && sourceEntity.factionId && isHostileFaction(npc.factionId, sourceEntity.factionId)) {
        const uncertainty = clamp((d / radius) * 170 + (1.1 - volume) * 55 + game.weather.fog * 90, 16, 260);
        const heard = {
          x: clamp(x + rand(-uncertainty, uncertainty), WORLD_MARGIN, game.mapSize - WORLD_MARGIN),
          y: clamp(y + rand(-uncertainty, uncertainty), WORLD_MARGIN, game.mapSize - WORLD_MARGIN),
          time: game.minutes,
          target: isAlive(sourceEntity) ? sourceEntity : null,
          heardOnly: true,
          volume,
        };
        npc.memory = heard;
        const squad = getSquad(npc.squadId);
        if (squad && !alertedSquads.has(squad.id)) {
          startSquadInvestigation(squad, heard.x, heard.y, sourceEntity, volume);
          alertedSquads.add(squad.id);
        }
        if (!npc.decision || !["engage", "suppress", "retreat", "flank"].includes(npc.decision.type)) {
          npc.decision = squad ? chooseInvestigationDecision(npc, squad) : { type: "investigate", mode: "approach", target: { x: heard.x, y: heard.y }, focus: { x: heard.x, y: heard.y }, until: game.minutes + rand(18, 52), cautious: true };
        }
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

  function startSquadInvestigation(squad, x, y, sourceEntity, volume = 0.55) {
    if (!squad) return;
    const sourceFaction = sourceEntity?.factionId || null;
    if (sourceFaction && !isHostileFaction(squad.factionId, sourceFaction)) return;
    const suspect = isAlive(sourceEntity) ? sourceEntity : null;
    const suspicion = clamp(volume + squad.aggression * 0.34 + (sourceEntity?.kind === "player" ? 0.18 : 0), 0.28, 1.75);
    const current = squad.investigation;
    if (current && game.minutes < current.until && distXY(current.x, current.y, x, y) < 300) {
      current.x = lerp(current.x, x, 0.38);
      current.y = lerp(current.y, y, 0.38);
      current.suspicion = clamp(Math.max(current.suspicion, suspicion) + 0.08, 0.28, 1.95);
      current.until = Math.max(current.until, game.minutes + rand(58, 116) + current.suspicion * 22);
      current.suspect = suspect || current.suspect;
      current.sourceFaction = sourceFaction || current.sourceFaction;
      squad.target = { x: current.x, y: current.y };
      return;
    }

    const returnObjective = squad.objective === "guard" || squad.objective === "hold" || squad.objective === "airdrop" ? squad.objective : "patrol";
    const previousTarget = squad.target;
    squad.objective = "investigate";
    squad.target = { x, y };
    squad.investigation = {
      x,
      y,
      startedAt: game.minutes,
      phaseStartedAt: game.minutes,
      until: game.minutes + rand(64, 126) + suspicion * rand(12, 28),
      suspicion,
      phase: "approach",
      sourceFaction,
      sourceKind: sourceEntity?.kind || "unknown",
      suspect,
      searchSeed: rand(0, TAU),
      spread: clamp(130 + volume * 90 + rand(0, 95), 130, 340),
      returnObjective,
      returnTarget: returnObjective === "airdrop" ? previousTarget : null,
    };
    squad.rally = investigationStagingPoint(squad);
  }

  function updateSquads(dt) {
    for (const squad of game.squads) {
      squad.orderTimer -= dt;
      squad.scanTimer = (squad.scanTimer || 0) - dt;
      const members = game.npcs.filter((npc) => npc.alive && npc.squadId === squad.id);
      if (!members.length) continue;
      squad.center = members.reduce((acc, npc) => ({ x: acc.x + npc.x / members.length, y: acc.y + npc.y / members.length }), { x: 0, y: 0 });

      if (squad.scanTimer <= 0) {
        squad.scanTimer = rand(0.75, 1.75);
        const spotted = findSquadVisualTarget(squad, members, squad.target || squad.lastEnemy?.target || squad.investigation?.suspect);
        if (spotted) {
          setSquadAttackTarget(squad, spotted);
          continue;
        }
      }

      if (squad.objective === "investigate" && updateSquadInvestigation(squad, members)) continue;

      if (game.airdrop && !game.airdrop.looted && game.airdrop.phase !== "gone") {
        const d = distXY(squad.center.x, squad.center.y, game.airdrop.x, game.airdrop.y);
        const utility = squad.aggression + (squad.factionId === "raiders" ? 0.5 : 0) + (squad.factionId === "medics" ? -0.25 : 0) - d / 3400;
        if (utility > 0.28 && squad.objective !== "attack") {
          squad.objective = "airdrop";
          squad.target = game.airdrop;
        }
      }

      if (squad.lastEnemy && game.minutes - squad.lastEnemyTime < 55 && squad.objective !== "airdrop") {
        const spotted = findSquadVisualTarget(squad, members, squad.lastEnemy.target);
        if (spotted) setSquadAttackTarget(squad, spotted);
        else if (squad.objective !== "investigate") startSquadInvestigation(squad, squad.lastEnemy.x, squad.lastEnemy.y, squad.lastEnemy.target, 0.7);
      }

      if (squad.orderTimer <= 0) {
        squad.orderTimer = rand(9, 24);
        if (squad.objective !== "investigate" && (!squad.lastEnemy || game.minutes - squad.lastEnemyTime > 60)) {
          squad.objective = squad.objective === "guard" || squad.objective === "hold" ? squad.objective : "patrol";
          squad.rally = findOpenPointNear(squad.home, squad.patrolRadius || squad.home.r * rand(0.45, 1.25), squad.home.r * 0.55);
          squad.target = squad.rally;
        }
      }
    }
  }

  function updateSquadInvestigation(squad, members) {
    const investigation = squad.investigation;
    if (!investigation) return false;

    const elapsed = game.minutes - investigation.startedAt;
    const centerDistance = squad.center ? distXY(squad.center.x, squad.center.y, investigation.x, investigation.y) : Infinity;
    if (investigation.phase === "approach" && (centerDistance < 430 || elapsed > 46)) {
      investigation.phase = "fanout";
      investigation.phaseStartedAt = game.minutes;
    } else if (investigation.phase === "fanout" && (game.minutes - investigation.phaseStartedAt > 28 || centerDistance < 230)) {
      investigation.phase = "search";
      investigation.phaseStartedAt = game.minutes;
    } else if (investigation.phase === "search" && squad.aggression > 0.72 && game.minutes - investigation.phaseStartedAt > 34) {
      investigation.phase = "contain";
      investigation.phaseStartedAt = game.minutes;
    }

    if (game.minutes > investigation.until) {
      finishSquadInvestigation(squad);
      return false;
    }

    squad.target = { x: investigation.x, y: investigation.y };
    squad.rally = investigation.phase === "approach" ? investigationStagingPoint(squad) : { x: investigation.x, y: investigation.y };
    return true;
  }

  function finishSquadInvestigation(squad) {
    const investigation = squad.investigation;
    const returnObjective = investigation?.returnObjective;
    const returnTarget = investigation?.returnTarget;
    squad.investigation = null;
    squad.lastEnemy = null;
    squad.lastEnemyTime = -999;
  if (returnObjective === "guard" || returnObjective === "hold") {
      squad.objective = returnObjective;
      squad.rally = findOpenPointNear(squad.home, squad.home.r * 0.9, squad.home.r * 0.25);
      squad.target = squad.rally;
    } else if (returnObjective === "airdrop" && game.airdrop && !game.airdrop.looted && game.airdrop.phase !== "gone") {
      squad.objective = "airdrop";
      squad.target = returnTarget || game.airdrop;
      squad.rally = squad.target;
    } else {
      squad.objective = "patrol";
      squad.rally = findOpenPointNear(squad.home, squad.patrolRadius || squad.home.r, squad.home.r * 0.45);
      squad.target = squad.rally;
    }
  }

  function setSquadAttackTarget(squad, target) {
    if (!squad || !isAlive(target) || !isHostileFaction(squad.factionId, target.factionId)) return;
    squad.objective = "attack";
    squad.target = target;
    squad.investigation = null;
    squad.lastEnemy = { x: target.x, y: target.y, time: game.minutes, target };
    squad.lastEnemyTime = game.minutes;
  }

  function findSquadVisualTarget(squad, members, preferredTarget = null) {
    if (isAlive(preferredTarget) && preferredTarget.factionId && isHostileFaction(squad.factionId, preferredTarget.factionId)) {
      for (const npc of members) if (canNpcSee(npc, preferredTarget)) return preferredTarget;
    }
    for (const npc of members) {
      const target = findVisibleHostile(npc);
      if (target) {
        npc.memory = { x: target.x, y: target.y, time: game.minutes, target };
        return target;
      }
    }
    return null;
  }

  function investigationStagingPoint(squad) {
    const investigation = squad.investigation;
    if (!investigation) return squad.rally || squad.home;
    const from = squad.center || squad.home;
    const angle = Math.atan2(investigation.y - from.y, investigation.x - from.x);
    const distance = clamp(investigation.spread * 1.18, 180, 390);
    return clampPoint({ x: investigation.x - Math.cos(angle) * distance, y: investigation.y - Math.sin(angle) * distance });
  }

  function chooseInvestigationDecision(npc, squad) {
    const investigation = squad?.investigation;
  if (!investigation) return { type: "patrol", target: findOpenPointNear(npc.home, npc.home.r), until: game.minutes + rand(35, 90) };
    const point = investigationPointFor(npc, squad);
    const openPoint = walkabilityScore(point.x, point.y, NPC_RADIUS + 3) >= 1 ? point : findOpenPointNear(point, 135, 24, NPC_RADIUS + 3);
    return {
      type: "investigate",
      mode: point.mode,
      target: { x: openPoint.x, y: openPoint.y },
      focus: { x: investigation.x, y: investigation.y },
      until: game.minutes + rand(18, 46) + investigation.suspicion * 6,
      cautious: true,
    };
  }

  function investigationPointFor(npc, squad) {
    const investigation = squad.investigation;
    const center = { x: investigation.x, y: investigation.y };
    const members = game.npcs.filter((ally) => ally.alive && ally.squadId === squad.id);
    const index = Math.max(0, members.indexOf(npc));
    const count = Math.max(1, members.length);
    const approachFrom = squad.center && distXY(squad.center.x, squad.center.y, center.x, center.y) > 30 ? squad.center : squad.home;
    const approachAngle = Math.atan2(center.y - approachFrom.y, center.x - approachFrom.x);
    const left = approachAngle - Math.PI / 2;
    const lateral = ((index % 2 ? 1 : -1) * (42 + Math.floor(index / 2) * 34));
    const spread = investigation.spread;
    let mode = investigation.phase;
    let forward = 0;
    let side = lateral;

    if (investigation.phase === "approach") {
      if (npc.role === "scout" || npc.role === "hunter") {
        forward = -80;
        side *= 0.55;
      } else if (npc.role === "assault") {
        forward = -135;
        side = (index % 2 ? 1 : -1) * spread * 0.62;
      } else if (npc.role === "gunner") {
        mode = "overwatch";
        forward = -spread * 1.34;
        side *= 0.8;
      } else if (npc.role === "medic") {
        forward = -spread * 1.12;
        side *= 0.45;
      } else {
        forward = -spread * 0.76;
      }
    } else if (investigation.phase === "fanout") {
      if (npc.role === "gunner") {
        mode = "overwatch";
        forward = -spread * 1.05;
        side = lateral * 0.75;
      } else if (npc.role === "assault") {
        forward = -20;
        side = (index % 2 ? 1 : -1) * spread * rand(0.78, 1.12);
      } else if (npc.role === "scout" || npc.role === "hunter") {
        forward = spread * 0.34;
        side *= 0.7;
      } else if (npc.role === "medic") {
        forward = -spread * 0.62;
        side *= 0.42;
      } else {
        forward = -spread * 0.18;
      }
    } else if (investigation.phase === "search") {
      mode = "search";
      const sweepAngle = investigation.searchSeed + (index / count) * TAU + game.minutes * (0.012 + npc.alertness * 0.004);
      const sweepRadius = spread * (npc.role === "scout" || npc.role === "hunter" ? rand(0.62, 1.15) : rand(0.34, 0.92));
      return clampPoint({ x: center.x + Math.cos(sweepAngle) * sweepRadius, y: center.y + Math.sin(sweepAngle) * sweepRadius, mode });
    } else if (investigation.phase === "contain") {
      const containAngle = investigation.searchSeed + (index / count) * TAU;
      const containRadius = spread * (npc.role === "gunner" ? 1.2 : npc.role === "assault" ? 1.05 : 0.85);
      mode = npc.role === "gunner" ? "overwatch" : "contain";
      return clampPoint({ x: center.x + Math.cos(containAngle) * containRadius, y: center.y + Math.sin(containAngle) * containRadius, mode });
    }

    return clampPoint({ x: center.x + Math.cos(approachAngle) * forward + Math.cos(left) * side, y: center.y + Math.sin(approachAngle) * forward + Math.sin(left) * side, mode });
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
    if (npc.decision && game.minutes > npc.decision.until) {
      npc.decision = null;
      npc.detour = null;
    }
    const visibleEnemy = findVisibleHostile(npc);
    if (visibleEnemy) rememberEnemy(npc, visibleEnemy);
    const support = chooseSupportAlly(npc);
    if (support) return support;
    const urgentMedical = chooseNpcMedical(npc);
    if (urgentMedical) return urgentMedical;
    if (visibleEnemy) return chooseCombatDecision(npc, visibleEnemy);
    const loot = findBestNpcLoot(npc);
    if (loot && loot.score > 1.15) return { type: "loot", target: loot.item, until: game.minutes + 25 };
    const memoryTarget = npc.memory && !npc.memory.heardOnly && game.minutes - npc.memory.time < 40 ? npc.memory.target : null;
    const target = visibleEnemy || memoryTarget;
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
      if (squad.objective === "investigate" && squad.investigation) return chooseInvestigationDecision(npc, squad);
      if (squad.objective === "attack" && squad.target) return chooseSquadAttackDecision(npc, squad);
      if (squad.center && distXY(npc.x, npc.y, squad.center.x, squad.center.y) > 260 / squad.cohesion) return { type: "regroup", target: squad.rally || squad.center, until: game.minutes + rand(10, 35) };
      if (!npc.decision || npc.decision.type !== "patrol" || !npc.decision.target || distXY(npc.x, npc.y, npc.decision.target.x, npc.decision.target.y) < 35 || game.minutes > npc.decision.until) return { type: "patrol", target: findOpenPointNear(squad.rally || squad.home, squad.patrolRadius || squad.home.r), until: game.minutes + rand(70, 185) };
    }
    return npc.decision || { type: "patrol", target: findOpenPointNear(npc.home, npc.home.r), until: game.minutes + rand(45, 110) };
  }

  function chooseSquadAttackDecision(npc, squad) {
    const target = squad.target;
    if (!isAlive(target) || !isHostileFaction(npc.factionId, target.factionId)) {
      if (squad.lastEnemy) return chooseInvestigationDecision(npc, squad);
      return { type: "regroup", target: squad.rally || squad.home, until: game.minutes + rand(10, 28) };
    }
    if (canNpcSee(npc, target)) return chooseCombatDecision(npc, target);

    const members = game.npcs.filter((ally) => ally.alive && ally.squadId === squad.id);
    const index = Math.max(0, members.indexOf(npc));
    if (npc.role === "gunner") {
      const anchor = squad.center || npc;
      return { type: "suppress", target, aiming: true, until: game.minutes + rand(8, 18), enemy: target, hold: pointAwayFrom(anchor, target, 80 + index * 18) };
    }
    if (npc.role === "assault" || npc.role === "scout") return { type: "flank", target: flankPoint(npc, target), enemy: target, until: game.minutes + rand(15, 38) };
    if (npc.role === "medic") return { type: "regroup", target: pointAwayFrom(squad.center || npc, target, 110), until: game.minutes + rand(10, 28) };
    return { type: "advance", target, enemy: target, until: game.minutes + rand(8, 18) };
  }

  function chooseCombatDecision(npc, target) {
    if (npc.hp < 26 && npc.inventory.bloodBag <= 0) return { type: "retreat", target: pointAwayFrom(npc, target, 420), until: game.minutes + rand(18, 42), enemy: target };
    const def = WEAPON_BY_ID[npc.weapon.id];
    const preferred = preferredRange(def);
    const d = dist(npc, target);
    if (npc.role === "medic" && npc.hp < 54) return { type: "retreat", target: pointAwayFrom(npc, target, 360), until: game.minutes + rand(12, 30), enemy: target };
    if (d > preferred.max * 1.14) return { type: "advance", target, until: game.minutes + 10, enemy: target };
    if (d < preferred.min && !["huntingShotgun", "trenchSmg"].includes(def.id)) return { type: "retreat", target: pointAwayFrom(npc, target, preferred.min + 80), until: game.minutes + 18, enemy: target };
    if (npc.role === "gunner" || def.id === "stormLmg") return { type: "suppress", target, aiming: true, until: game.minutes + rand(8, 20), enemy: target };
    if ((npc.role === "assault" || npc.role === "scout") && game.rng() < 0.34) return { type: "flank", target: flankPoint(npc, target), enemy: target, until: game.minutes + rand(18, 42) };
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
        engageTarget(npc, decision.enemy || target, dt, true, true);
        speedFactor = 0.2;
        target = decision.hold || combatStrafeTarget(npc, decision.enemy || target, 48);
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
      case "investigate": {
        const focus = decision.focus || target;
        const visible = findVisibleHostile(npc);
        if (visible) {
          rememberEnemy(npc, visible);
          npc.decision = chooseCombatDecision(npc, visible);
          return;
        }
        if (focus && distXY(npc.x, npc.y, focus.x, focus.y) < npcVisionRange(npc, null) * 0.62) {
          const lookAngle = Math.atan2(focus.y - npc.y, focus.x - npc.x);
          npc.angle = lerpAngle(npc.angle, lookAngle + Math.sin(game.minutes * 0.08 + npc.alertness) * 0.32, 1 - Math.exp(-dt * 2.8));
        }
        if (decision.mode === "overwatch") speedFactor = distXY(npc.x, npc.y, target.x, target.y) > 38 ? 0.32 : 0;
        else if (decision.mode === "approach") speedFactor = 0.66;
        else if (decision.mode === "fanout") speedFactor = 0.56;
        else if (decision.mode === "search") speedFactor = 0.48;
        else if (decision.mode === "contain") speedFactor = 0.38;
        else speedFactor = 0.58;
        break;
      }
      case "regroup":
        speedFactor = 1.0;
        break;
      case "patrol":
      default:
        speedFactor = 0.62;
        break;
    }
    if (speedFactor <= 0) {
      npc.vx = 0;
      npc.vy = 0;
      return;
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
    angle += (1 - skill) * rand(-0.24, 0.24) + (npc.statuses.suppressed ? rand(-0.16, 0.16) : 0);
    npc.angle = lerpAngle(npc.angle, angle, 1 - Math.exp(-dt * (aiming ? 7 : 4)));
    npc.decision.aiming = aiming;
    return tryFire(npc, def, npc.weapon, npc.angle, false);
  }

  function moveEntityToward(entity, target, dt, speedFactor = 1) {
    if (!target || target.x === undefined) return;
    if (entity.kind === "npc") target = npcNavigationTarget(entity, target, dt);
    const n = normalize(target.x - entity.x, target.y - entity.y);
    if (n.length < 10) {
      entity.vx = 0;
      entity.vy = 0;
      if (entity.kind === "npc") entity.detour = null;
      return;
    }
    const beforeX = entity.x;
    const beforeY = entity.y;
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
    if (entity.kind === "npc") updateNpcStuckState(entity, target, beforeX, beforeY, dt);
  }

  function npcNavigationTarget(npc, target, dt) {
    if (npc.detour && game.minutes < npc.detour.until && distXY(npc.x, npc.y, npc.detour.x, npc.detour.y) > 20) return npc.detour;
    if (npc.detour && (game.minutes >= npc.detour.until || distXY(npc.x, npc.y, npc.detour.x, npc.detour.y) <= 20)) npc.detour = null;
    if (walkabilityScore(target.x, target.y, NPC_RADIUS + 3) < 0) {
      npc.detour = { ...findOpenPointNear(target, 180, 35, NPC_RADIUS + 3), until: game.minutes + rand(10, 24) };
      return npc.detour;
    }
    return target;
  }

  function updateNpcStuckState(npc, target, beforeX, beforeY, dt) {
    const moved = distXY(npc.x, npc.y, beforeX, beforeY);
    const wanted = target && distXY(npc.x, npc.y, target.x, target.y) > 36;
    if (wanted && moved < Math.max(1.1, npc.speed * dt * 0.09)) npc.stuckTimer += dt;
    else npc.stuckTimer = Math.max(0, npc.stuckTimer - dt * 1.8);

    if (npc.stuckTimer > 0.55) {
      const direct = Math.atan2(target.y - npc.y, target.x - npc.x);
      const side = game.rng() < 0.5 ? -1 : 1;
      const radius = clamp(105 + npc.stuckTimer * 120, 95, 360);
      const detour = findOpenPointNear({ x: npc.x + Math.cos(direct + side * Math.PI / 2) * radius, y: npc.y + Math.sin(direct + side * Math.PI / 2) * radius }, radius * 0.62, 20, NPC_RADIUS + 4);
      npc.detour = { ...detour, until: game.minutes + rand(10, 26) };
      npc.stuckTimer = 0;
      npc.thinkTimer = Math.min(npc.thinkTimer, 0.18);
    }
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
    if (squad) setSquadAttackTarget(squad, target);
  }

  function findVisibleHostile(npc) {
    let best = null;
    let bestScore = Infinity;
    const candidates = [game.player, ...game.npcs];
    for (const target of candidates) {
      if (!target || target === npc || !target.alive || target.factionId === npc.factionId) continue;
      if (!isHostileFaction(npc.factionId, target.factionId)) continue;
      const d = dist(npc, target);
      if (d > npcVisionRange(npc, target)) continue;
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
    const color = item === "bloodBag" ? 0xe65757 : item === "ration" ? 0xf0d06b : item === "ammo" ? 0xd0d0d0 : 0x9ee7a0;
    for (let i = 0; i < 10; i += 1) {
      const mesh = new THREE.Mesh(geometries.sphere, new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.85 }));
      const a = rand(0, TAU);
      mesh.scale.set(0.2, 0.2, 0.2);
      mesh.position.set(to3X(entity.x), 2.4, to3Z(entity.y));
      game.particleGroup.add(mesh);
      game.particles.push({ type: "heal", mesh, x: entity.x, y: entity.y, vx: Math.cos(a) * rand(8, 36), vy: Math.sin(a) * rand(8, 36), rise: rand(1.2, 3.5), life: rand(0.28, 0.65), maxLife: 0.65 });
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
      const push = collisionPushVector(entity.x, entity.y, entity.radius, obstacle);
      if (!push) continue;
      entity.x += push.x;
      entity.y += push.y;
      if (entity.kind === "npc") {
        entity.stuckTimer = Math.max(entity.stuckTimer || 0, 0.25);
        if (!entity.detour && Math.hypot(push.x, push.y) > 2.2) entity.detour = { ...findOpenPointNear(entity, 145, 42, entity.radius + 4), until: game.minutes + rand(8, 18) };
      }
    }
    entity.x = clamp(entity.x, entity.radius, game.mapSize - entity.radius);
    entity.y = clamp(entity.y, entity.radius, game.mapSize - entity.radius);
  }

  function circleRectCollide(cx, cy, radius, rect) {
    return collisionDepthAt(cx, cy, radius, rect) > 0;
  }

  function collisionDepthAt(cx, cy, radius, obstacle) {
    if (obstacle.radius) return obstacle.radius * 0.82 + radius - distXY(cx, cy, obstacle.x, obstacle.y);
    const local = worldToObstacleLocal(cx, cy, obstacle);
    const halfW = obstacle.w / 2;
    const halfH = obstacle.h / 2;
    const closestX = clamp(local.x, -halfW, halfW);
    const closestY = clamp(local.y, -halfH, halfH);
    const dx = local.x - closestX;
    const dy = local.y - closestY;
    const outsideDistance = Math.hypot(dx, dy);
    if (outsideDistance > 0.001) return radius - outsideDistance;
    const insideDepth = Math.min(halfW - Math.abs(local.x), halfH - Math.abs(local.y));
    return radius + insideDepth;
  }

  function collisionPushVector(cx, cy, radius, obstacle) {
    if (obstacle.radius) {
      const dx = cx - obstacle.x;
      const dy = cy - obstacle.y;
      const d = Math.hypot(dx, dy) || 0.001;
      const depth = obstacle.radius * 0.82 + radius - d;
      if (depth <= 0) return null;
      return { x: (dx / d) * depth, y: (dy / d) * depth };
    }

    const local = worldToObstacleLocal(cx, cy, obstacle);
    const halfW = obstacle.w / 2;
    const halfH = obstacle.h / 2;
    const closestX = clamp(local.x, -halfW, halfW);
    const closestY = clamp(local.y, -halfH, halfH);
    let dx = local.x - closestX;
    let dy = local.y - closestY;
    let distance = Math.hypot(dx, dy);
    let depth = radius - distance;

    if (distance <= 0.001) {
      const pushX = halfW - Math.abs(local.x);
      const pushY = halfH - Math.abs(local.y);
      if (pushX < pushY) {
        dx = local.x >= 0 ? 1 : -1;
        dy = 0;
        depth = radius + pushX;
      } else {
        dx = 0;
        dy = local.y >= 0 ? 1 : -1;
        depth = radius + pushY;
      }
      distance = 1;
    }

    if (depth <= 0) return null;
    const localPush = { x: (dx / distance) * depth, y: (dy / distance) * depth };
    return obstacleLocalToWorldVector(localPush.x, localPush.y, obstacle);
  }

  function worldToObstacleLocal(x, y, obstacle) {
    const angle = obstacle.rot || 0;
    const dx = x - obstacle.x;
    const dy = y - obstacle.y;
    const c = Math.cos(angle);
    const s = Math.sin(angle);
    return { x: dx * c + dy * s, y: -dx * s + dy * c };
  }

  function obstacleLocalToWorldVector(x, y, obstacle) {
    const angle = obstacle.rot || 0;
    const c = Math.cos(angle);
    const s = Math.sin(angle);
    return { x: x * c - y * s, y: x * s + y * c };
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
    const local = worldToObstacleLocal(x, y, obstacle);
    return Math.abs(local.x) <= obstacle.w / 2 && Math.abs(local.y) <= obstacle.h / 2;
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
        moveAnimal(animal, animal.target, dt, animal.state === "flee" ? def.fleeSpeed : def.speed);
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
    for (const c of [game.player, ...game.npcs]) {
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
      if (bullet.mesh) bullet.mesh.position.set(to3X(bullet.x), 2.7, to3Z(bullet.y));
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
        makeImpactParticles(bullet.x, bullet.y, target.kind === "animal" ? 0x6b3325 : 0xb33434, 9);
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
      if (pointInsideObstacle(bullet.x, bullet.y, obstacle)) return true;
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
      game.cameraShake = Math.min(8, game.cameraShake + 0.45);
    }
    for (const npc of game.npcs) {
      if (!npc.alive || npc.factionId === bullet.factionId || !isHostileFaction(bullet.factionId, npc.factionId)) continue;
      if (distXY(bullet.x, bullet.y, npc.x, npc.y) < suppressRange) npc.statuses.suppressed = Math.max(npc.statuses.suppressed, 1.1);
    }
  }

  function damageEntity(target, amount, attacker, source = {}) {
    if (!isAlive(target)) return;
    if (target.kind === "player" && target.spawnGrace > 0) return;
    const oldHp = target.hp;
    target.hp -= amount;
    if (attacker?.kind === "player" && target.factionId && target.factionId !== "expedition") provokeFaction(target.factionId);
    if (target.kind === "npc" && attacker?.factionId && isHostileFaction(target.factionId, attacker.factionId)) {
      const squad = getSquad(target.squadId);
      if (canNpcSee(target, attacker)) {
        target.memory = { x: attacker.x, y: attacker.y, time: game.minutes, target: attacker };
        setSquadAttackTarget(squad, attacker);
      } else if (squad) {
        target.memory = { x: target.x, y: target.y, time: game.minutes, target: attacker, heardOnly: true };
        startSquadInvestigation(squad, target.x, target.y, attacker, 0.9);
      }
      target.thinkTimer = Math.min(target.thinkTimer, 0.12);
    }
    if (target.kind === "player" || target.kind === "npc") {
      const bleedChance = source.bleedChance ?? source.def?.bleedChance ?? 0.12;
      const fractureChance = source.fractureChance ?? source.def?.fractureChance ?? 0.03;
      if (game.rng() < bleedChance) target.statuses.bleeding = Math.max(target.statuses.bleeding, amount > 45 ? 1.4 : 1);
      if (game.rng() < fractureChance || amount > 70) target.statuses.fracture = 1;
      if (source.animalAttack && game.rng() < 0.08) target.statuses.infection = 1;
    }
    if (target.kind === "player") {
      game.cameraShake = Math.min(20, game.cameraShake + 8);
      playTone(90, 0.13, "sawtooth", 0.12, -30);
      if (!target.statuses.bleeding && oldHp > target.hp) showToast(`受到伤害：-${Math.round(oldHp - target.hp)} HP`, "danger");
      if (target.statuses.bleeding) showToast("你正在流血：需要绷带，输血包不能止血。", "danger");
      if (target.statuses.fracture) showToast("骨折：移动和换弹变慢，需要夹板。", "danger");
    }
    if (target.hp <= 0) {
      if (target.kind === "player") killPlayer(attacker?.name ? `被 ${attacker.name} 击倒` : "阵亡");
      else if (target.kind === "npc") killNpc(target, attacker);
      else if (target.kind === "animal") killAnimal(target, attacker);
    }
  }

  function killPlayer(reason) {
    if (!game.player?.alive) return;
    game.player.alive = false;
    endGame("death", `你阵亡了：${reason}。死亡会直接回到主界面，本轮战局无法继续。`);
  }

  function killNpc(npc, killer) {
    if (!npc.alive) return;
    npc.alive = false;
    npc.hp = 0;
    const loot = { ...npc.inventory };
    if (npc.weapon.reserve > 0 || npc.weapon.mag > 0) loot.ammo = (loot.ammo || 0) + Math.max(1, Math.floor((npc.weapon.reserve + npc.weapon.mag) / Math.max(WEAPON_BY_ID[npc.weapon.id].magSize, 1)));
    const corpse = { id: id(), type: "npcCorpse", name: `${npc.unitName} 阵亡士兵`, x: npc.x, y: npc.y, radius: 18, loot, searched: false, factionId: npc.factionId, createdAt: game.minutes, mesh: null };
    corpse.mesh = buildCorpseMesh(corpse);
    game.corpses.push(corpse);
    makeImpactParticles(npc.x, npc.y, 0x7a2424, 18);
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
    const corpse = { id: id(), type: "animalCorpse", name: `${animal.name}尸体`, x: animal.x, y: animal.y, radius: animal.radius + 5, meat: animal.meat, harvested: false, createdAt: game.minutes, arrowRecover: killer?.kind === "player" && game.player.currentWeapon === "fieldBow" && game.rng() < 0.55, mesh: null };
    corpse.mesh = buildCorpseMesh(corpse);
    game.corpses.push(corpse);
    makeImpactParticles(animal.x, animal.y, 0x65402d, 12);
    if (killer?.kind === "player") showToast(`${animal.name}倒下了，靠近按 E 处理野味。`, "good");
  }

  function buildCorpseMesh(corpse) {
    const mesh = new THREE.Mesh(geometries.sphere, new THREE.MeshStandardMaterial({ color: corpse.type === "animalCorpse" ? 0x704b38 : 0x4b3b35, roughness: 0.9 }));
    mesh.scale.set(1.7, 0.28, 0.85);
    mesh.position.set(to3X(corpse.x), 0.25, to3Z(corpse.y));
    game.dynamicGroup.add(mesh);
    return mesh;
  }

  function makeImpactParticles(x, y, color, amount) {
    for (let i = 0; i < amount; i += 1) {
      const mesh = new THREE.Mesh(geometries.sphere, new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.82 }));
      mesh.scale.set(0.16, 0.16, 0.16);
      mesh.position.set(to3X(x), 1.2, to3Z(y));
      game.particleGroup.add(mesh);
      const a = rand(0, TAU);
      game.particles.push({ type: "impact", mesh, x, y, vx: Math.cos(a) * rand(20, 170), vy: Math.sin(a) * rand(20, 170), rise: rand(0.6, 2.6), life: rand(0.16, 0.48), maxLife: 0.48 });
    }
  }

  function updateParticles(dt) {
    for (const particle of game.particles) {
      particle.x += (particle.vx || 0) * dt;
      particle.y += (particle.vy || 0) * dt;
      particle.life -= dt;
      if (particle.mesh) {
        const ratio = clamp(particle.life / particle.maxLife, 0, 1);
        particle.mesh.position.set(to3X(particle.x), particle.mesh.position.y + (particle.rise || 0) * dt, to3Z(particle.y));
        particle.mesh.scale.multiplyScalar(1 + dt * 0.6);
        if (particle.mesh.material) particle.mesh.material.opacity = ratio;
      }
    }
  }

  function updateAirdrop(dt) {
    if (!game.airdrop && game.minutes >= game.nextAirdropMinutes) spawnAirdrop();
    if (!game.airdrop) return;
    const drop = game.airdrop;
    if (drop.phase === "falling") {
      drop.timer -= dt;
      drop.z = Math.max(0, drop.z - dt * 95);
      if (drop.mesh) drop.mesh.position.set(to3X(drop.x), drop.z * WORLD_SCALE + 5, to3Z(drop.y));
      if (drop.timer <= 0) {
        drop.phase = "landed";
        drop.z = 0;
        if (drop.mesh) drop.mesh.position.y = 2;
        showToast("空投已落地：所有附近小队都会向烟柱集结。", "warn");
        createNoise(drop.x, drop.y, 1.15, { factionId: "raiders", kind: "airdrop", x: drop.x, y: drop.y });
      }
    } else if (drop.phase === "landed") {
      drop.smoke += dt;
      if (game.rng() < 0.24) spawnSmoke(drop.x + rand(-20, 20), drop.y + rand(-20, 20));
    } else if (drop.phase === "looted") {
      drop.timer -= dt;
      if (drop.timer <= 0) drop.phase = "gone";
    }
  }

  function spawnAirdrop() {
    const landmark = pick(game.landmarks.slice(1));
    const p = findOpenPointNear(landmark, rand(220, 520), 120, 34);
    game.airdrop = { id: id(), type: "airdrop", name: "战区空投箱", x: p.x, y: p.y, z: 190, radius: 22, phase: "falling", timer: 38, smoke: 0, looted: false, contents: { bloodBag: randInt(1, 2), bandage: randInt(1, 3), splint: game.rng() < 0.7 ? 1 : 0, ration: randInt(2, 4), antibiotic: game.rng() < 0.5 ? 1 : 0, ammo: randInt(2, 4) }, mesh: null };
    game.airdrop.mesh = buildAirdropMesh(game.airdrop);
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

  function buildAirdropMesh(drop) {
    const group = new THREE.Group();
    const crate = new THREE.Mesh(geometries.box, materials.airdrop);
    crate.scale.set(4.2, 2.3, 3.4);
    crate.castShadow = true;
    const chute = new THREE.Mesh(new THREE.ConeGeometry(5.5, 2.2, 24, 1, true), new THREE.MeshBasicMaterial({ color: 0xded8bd, transparent: true, opacity: 0.65, side: THREE.DoubleSide }));
    chute.position.y = 7;
    chute.rotation.x = Math.PI;
    group.add(crate, chute);
    group.position.set(to3X(drop.x), drop.z * WORLD_SCALE + 5, to3Z(drop.y));
    game.dynamicGroup.add(group);
    return group;
  }

  function spawnSmoke(x, y) {
    const mesh = new THREE.Mesh(geometries.sphere, new THREE.MeshBasicMaterial({ color: 0xd96b45, transparent: true, opacity: 0.22 }));
    mesh.scale.set(rand(2.2, 4.2), rand(2.2, 4.2), rand(2.2, 4.2));
    mesh.position.set(to3X(x), 2.5, to3Z(y));
    game.particleGroup.add(mesh);
    game.particles.push({ type: "smoke", mesh, x, y, vx: game.weather.wind.x * 14 + rand(-8, 8), vy: game.weather.wind.y * 14 + rand(-8, 8), rise: rand(3, 6), life: rand(1.2, 2.6), maxLife: 2.6 });
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
    if (task.mesh) task.mesh.visible = false;
    game.stats.tasksDone = game.tasks.filter((t) => t.done).length;
    showToast(`任务完成：${task.title}`, "good");
    playTone(520, 0.1, "triangle", 0.08, 160);
  }

  function interact() {
    const interaction = game.selectedInteraction || findInteractable();
    if (!interaction) return;
    const target = interaction.target;
    if (interaction.kind === "loot") playerLoot(target);
    else if (interaction.kind === "animal") harvestAnimal(target);
    else if (interaction.kind === "airdrop") playerLootAirdrop(target);
    else if (interaction.kind === "disrupt") armDisruptTask(target);
  }

  function refreshInteractPrompt() {
    const interaction = findInteractable();
    game.selectedInteraction = interaction;
    if (interaction) {
      ui.centerPrompt.textContent = interaction.text;
      ui.centerPrompt.classList.remove("hidden");
    } else ui.centerPrompt.classList.add("hidden");
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
    if (target.mesh) target.mesh.visible = false;
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
    if (corpse.mesh) corpse.mesh.visible = false;
    game.player.inventory.ration += corpse.meat;
    game.player.harvests += 1;
    game.stats.animalsHarvested += 1;
    if (corpse.arrowRecover) {
      game.player.weapons.fieldBow.reserve += 1;
      showToast(`处理野味：获得 ${corpse.meat} 份口粮，并回收 1 支箭。`, "good");
    } else showToast(`处理野味：获得 ${corpse.meat} 份口粮。`, "good");
    for (const task of game.tasks) if (task.type === "hunt" && !task.done) task.progress = Math.min(task.required, task.progress + 1);
  }

  function playerLootAirdrop(drop) {
    if (drop.looted || drop.phase !== "landed") return;
    addInventory(game.player.inventory, drop.contents);
    drop.looted = true;
    drop.phase = "looted";
    drop.timer = 35;
    if (drop.mesh) drop.mesh.visible = false;
    game.stats.airdropsLooted += 1;
    showToast(`抢到空投：${inventorySummary(drop.contents)}`, "good");
    for (const task of game.tasks) if (task.type === "airdrop" && !task.done) task.progress = task.required;
  }

  function npcLoot(npc, target) {
    if (target.type === "airdrop" || target === game.airdrop) {
      if (target.phase !== "landed" || target.looted) return;
      addInventory(npc.inventory, target.contents);
      target.looted = true;
      target.phase = "looted";
      target.timer = 35;
      if (target.mesh) target.mesh.visible = false;
      if (dist(npc, game.player) < 900) showToast(`${FACTIONS[npc.factionId].short} 抢走了空投！`, "danger");
      return;
    }
    if (target.type === "animalCorpse") {
      if (target.harvested) return;
      target.harvested = true;
      if (target.mesh) target.mesh.visible = false;
      npc.inventory.ration += target.meat;
      return;
    }
    if (target.searched) return;
    addInventory(npc.inventory, target.contents || target.loot || {});
    target.searched = true;
    if (target.mesh) target.mesh.visible = false;
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
    if (!camera || !game.player) return;
    const player = game.player;
    const def = WEAPON_BY_ID[player.currentWeapon];
    const desiredZoom = isAiming() ? (def.id === "marksmanScout" ? 0.74 : 0.86) : 1;
    game.cameraZoom = lerp(game.cameraZoom || 1, desiredZoom, 1 - Math.exp(-dt * 4.2));
    const targetX = to3X(player.x);
    const targetZ = to3Z(player.y);
    const desired = new THREE.Vector3(targetX, 74 * game.cameraZoom, targetZ + 86 * game.cameraZoom);
    const shake = game.cameraShake || 0;
    if (shake > 0) {
      desired.x += rand(-shake, shake) * WORLD_SCALE;
      desired.y += rand(-shake, shake) * WORLD_SCALE * 0.5;
      desired.z += rand(-shake, shake) * WORLD_SCALE;
      game.cameraShake = Math.max(0, game.cameraShake - dt * 18);
    }
    camera.position.lerp(desired, 1 - Math.exp(-dt * 7.5));
    camera.lookAt(targetX, 1.6, targetZ - 12);
  }

  function updateLighting() {
    if (!scene) return;
    const hour = getHour();
    const dayFactor = Math.max(0, Math.sin(((hour - 6) / 12) * Math.PI));
    const dusk = hour >= 18 || hour < 7;
    sunLight.intensity = 0.25 + dayFactor * 2.25;
    moonLight.intensity = dusk ? 0.42 : 0.06;
    ambientLight.intensity = 0.36 + dayFactor * 0.84;
    const sunAngle = ((hour - 6) / 24) * TAU;
    sunLight.position.set(Math.cos(sunAngle) * 180, 80 + dayFactor * 140, Math.sin(sunAngle) * 180);
    const fogAmount = 0.0012 + game.weather.fog * 0.006 + game.weather.rain * 0.0016 + (dusk ? 0.0012 : 0);
    scene.fog.density = fogAmount;
    scene.background.set(dusk ? 0x172236 : dayFactor > 0.4 ? 0x9fb1bd : 0x31445b);
  }

  function syncMeshes(dt) {
    const entities = [game.player, ...game.npcs, ...game.animals];
    for (const entity of entities) {
      if (!entity?.mesh) continue;
      entity.mesh.visible = entity.alive !== false;
      if (!entity.mesh.visible) continue;
      setMeshPosition(entity.mesh, entity, 0);
      entity.mesh.rotation.y = -entity.angle - Math.PI / 2;
      if (entity.kind === "npc" && entity.statuses.suppressed) entity.mesh.position.y = Math.sin(performance.now() / 65) * 0.12;
    }
    for (const task of game.tasks) {
      if (task.mesh) {
        task.mesh.visible = !task.done;
        task.mesh.rotation.z += dt * 0.5;
      }
    }
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
    input.aimToggle = false;
    input.keyboardFire = false;
    input.clickFireTimer = 0;
    ui.hud.classList.add("hidden");
    ui.menu.classList.remove("hidden");
    ui.resumeBtn.classList.add("hidden");
    ui.endMessage.classList.remove("hidden");
    ui.endMessage.textContent = `${message} 战绩：击倒 ${game.stats.playerKills} 人，处理野味 ${game.stats.animalsHarvested} 次，完成任务 ${game.tasks.filter((task) => task.done).length}/${WIN_TASKS}，生存 ${game.stats.daysSurvived} 天。`;
    ui.startBtn.textContent = won ? "再次部署" : "重新开始";
    showToast(message, won ? "good" : "danger");
  }

  function cleanupWorld() {
    for (const bullet of game.bullets) {
      if (bullet.dead && bullet.mesh) {
        game.projectileGroup.remove(bullet.mesh);
        bullet.mesh.geometry?.dispose?.();
      }
    }
    for (const particle of game.particles) {
      if (particle.life <= 0 && particle.mesh) game.particleGroup.remove(particle.mesh);
    }
    game.bullets = game.bullets.filter((bullet) => !bullet.dead);
    game.particles = game.particles.filter((particle) => particle.life > 0);
    game.animals = game.animals.filter((animal) => animal.alive);
    if (game.airdrop?.phase === "gone") game.airdrop = null;
  }

  function updateHud(force = false) {
    const p = game.player;
    if (!p) return;
    ui.hpBar.style.width = `${clamp((p.hp / p.maxHp) * 100, 0, 100)}%`;
    ui.hpText.textContent = `${Math.ceil(p.hp)}`;
    ui.hungerBar.style.width = `${clamp(p.hunger, 0, 100)}%`;
    ui.hungerText.textContent = `${Math.ceil(p.hunger)}`;
    const activeStatuses = Object.entries(p.statuses).filter(([key, value]) => value > 0 && key !== "starving").map(([key]) => key);
    if (p.statuses.starving || p.hunger <= 0) activeStatuses.push("starving");
    const signature = `${force}:${activeStatuses.join("|")}:${p.currentWeapon}:${Math.ceil(p.hp)}:${Math.ceil(p.hunger)}:${game.tasks.map((t) => `${t.id}${t.progress.toFixed(0)}${t.done}`).join(";")}:${Object.values(p.inventory).join(",")}`;
    if (signature !== cachedHudSignature) {
      cachedHudSignature = signature;
      ui.statusChips.innerHTML = activeStatuses.length ? activeStatuses.map((key) => `<span class="chip">${STATUS_LABELS[key]}</span>`).join("") : `<span class="chip good">状态稳定</span>`;
      const weaponDef = WEAPON_BY_ID[p.currentWeapon];
      const weapon = p.weapons[p.currentWeapon];
      ui.weaponName.textContent = `${weaponDef.slot}. ${weaponDef.name}`;
      ui.ammoText.textContent = weapon.reloadTimer > 0 ? `换弹 ${weapon.reloadTimer.toFixed(1)}s` : `${weapon.mag} / ${weapon.reserve}`;
      ui.weaponHint.textContent = `${weaponDef.category} · ${weaponDef.auto ? "按住/空格连射" : "点击/空格射击"} · ${isTrackpadFriendlyMode() ? "Q 精瞄保持" : "右键精瞄"} · ${AMMO_NAMES[weaponDef.ammoType]}`;
      ui.taskList.innerHTML = game.tasks.map((task) => `<li class="${task.done ? "done" : ""}"><b>${task.title}</b><div class="progress-line">${task.description}<br>${formatTaskProgress(task)}</div></li>`).join("");
      ui.inventoryList.innerHTML = Object.entries(ITEM_NAMES).filter(([key]) => key !== "intel").map(([key, name]) => `<div class="inv-item"><span>${name}</span><b>${p.inventory[key] || 0}</b></div>`).join("");
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
    const text = Object.entries(counts).map(([faction, count]) => `${FACTIONS[faction].short} ${count}`).join(" · ");
    ui.factionText.textContent = text ? `附近接触：${text}` : "附近接触：暂无";
    const allies = counts.expedition || 0;
    ui.squadText.textContent = nearest ? `最近威胁：${FACTIONS[nearest.factionId].short} ${Math.round(nearestD)}m` : `附近友军：${Math.max(0, allies - 1)} 人`;
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
      miniCtx.fillStyle = FACTIONS[landmark.factionId]?.css || "#ccc";
      miniCtx.globalAlpha = 0.48;
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
      miniCtx.fillStyle = isHostileFaction("expedition", npc.factionId) ? "#ff615c" : FACTIONS[npc.factionId].css;
      miniCtx.fillRect(npc.x * scale - 1.5, npc.y * scale - 1.5, 3, 3);
    }
    miniCtx.fillStyle = "#d9ffd3";
    miniCtx.strokeStyle = "#071007";
    miniCtx.lineWidth = 2;
    miniCtx.beginPath();
    miniCtx.arc(game.player.x * scale, game.player.y * scale, 5, 0, TAU);
    miniCtx.fill();
    miniCtx.stroke();
  }

  function render() {
    if (!renderer || !scene || !camera) return;
    updateLighting();
    renderer.render(scene, camera);
    drawCrosshairOverlay();
  }

  function drawCrosshairOverlay() {
    if (game.state !== "playing") return;
    const overlay = document.getElementById("crosshairOverlay") || createCrosshairOverlay();
    const p = game.player;
    const def = p ? WEAPON_BY_ID[p.currentWeapon] : null;
    const spread = def ? (isAiming() ? def.aimSpread : def.spread) * 320 + (p.recoil || 0) * 8 : 16;
    overlay.style.left = `${input.mouse.x}px`;
    overlay.style.top = `${input.mouse.y}px`;
    overlay.style.setProperty("--spread", `${spread}px`);
    overlay.classList.toggle("aiming", isAiming());
  }

  function createCrosshairOverlay() {
    const el = document.createElement("div");
    el.id = "crosshairOverlay";
    el.innerHTML = "<i></i><i></i><i></i><i></i><b></b>";
    document.body.appendChild(el);
    return el;
  }

  function setupEventListeners() {
    ui.startBtn.addEventListener("click", startNewGame);
    ui.resumeBtn.addEventListener("click", resumeGame);
    ui.settingsBtn.addEventListener("click", () => toggleDrawer(ui.settingsPanel));
    ui.armoryBtn.addEventListener("click", () => toggleDrawer(ui.armoryPanel));
    ui.helpBtn.addEventListener("click", () => toggleDrawer(ui.helpPanel));
    for (const el of [ui.difficultyInput, ui.mapSizeInput, ui.dayLengthInput, ui.npcDensityInput, ui.wildlifeDensityInput, ui.sensitivityInput, ui.aimAssistInput, ui.trackpadModeInput, ui.volumeInput]) {
      el.addEventListener("input", syncSettingsLabels);
      el.addEventListener("change", syncSettingsLabels);
    }
    canvas.addEventListener("mousemove", (event) => {
      const rect = canvas.getBoundingClientRect();
      input.mouse.x = clamp(event.clientX - rect.left, 0, game.width);
      input.mouse.y = clamp(event.clientY - rect.top, 0, game.height);
    });
    canvas.addEventListener("mousedown", (event) => {
      if (game.state !== "playing") return;
      initAudio();
      if (event.button === 0) {
        input.mouse.down = true;
        input.clickFireTimer = isTrackpadFriendlyMode() ? 0.18 : 0;
      }
      if (event.button === 2) {
        if (isTrackpadFriendlyMode()) input.aimToggle = !input.aimToggle;
        else input.mouse.right = true;
      }
    });
    window.addEventListener("mouseup", (event) => {
      if (event.button === 0) {
        input.mouse.down = false;
        mouseFireWasDown = false;
      }
      if (event.button === 2 && !isTrackpadFriendlyMode()) input.mouse.right = false;
    });
    canvas.addEventListener("contextmenu", (event) => event.preventDefault());
    canvas.addEventListener("wheel", (event) => {
      if (game.state !== "playing") return;
      event.preventDefault();
      if (Math.abs(event.deltaY) > 0) {
        input.enlargedMap = event.deltaY < 0;
        ui.minimapPanel.classList.toggle("large", input.enlargedMap);
      }
    }, { passive: false });
    window.addEventListener("keydown", (event) => {
      if (["Space", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.code)) event.preventDefault();
      input.keys.add(event.code);
      if (game.state !== "playing") return;
      if (event.code === "Escape") return pauseGame();
      if (event.code === "Space") input.keyboardFire = true;
      if (event.code === "KeyQ" && !event.repeat) {
        input.aimToggle = !input.aimToggle;
        showToast(input.aimToggle ? "精瞄保持：开启（Q 关闭）" : "精瞄保持：关闭", "");
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
      if (event.code === "Space") {
        input.keyboardFire = false;
        mouseFireWasDown = false;
      }
      if (event.code === "KeyM") {
        input.enlargedMap = false;
        ui.minimapPanel.classList.remove("large");
      }
    });
  }

  function toggleDrawer(panel) {
    for (const drawer of [ui.settingsPanel, ui.armoryPanel, ui.helpPanel]) if (drawer !== panel) drawer.classList.add("hidden");
    panel.classList.toggle("hidden");
  }

  function pauseGame() {
    if (game.state !== "playing") return;
    game.state = "paused";
    input.mouse.down = false;
    input.mouse.right = false;
    input.keyboardFire = false;
    input.clickFireTimer = 0;
    input.aimToggle = false;
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
    showToast(`切换武器：${WEAPON_BY_ID[weaponId].name}`, "");
    playTone(300 + index * 24, 0.035, "triangle", 0.03, 30);
    updateHud(true);
  }

  function gameLoop(timestamp) {
    if (!lastFrame) lastFrame = timestamp;
    const dt = (timestamp - lastFrame) / 1000;
    lastFrame = timestamp;
    update(dt);
    render();
    requestAnimationFrame(gameLoop);
  }

  function boot() {
    game.width = window.innerWidth || game.width;
    game.height = window.innerHeight || game.height;
    input.mouse.x = game.width / 2;
    input.mouse.y = game.height / 2;
    syncSettingsLabels();
    renderWeaponCards();
    setupEventListeners();
    initThree();
    render();
    if (!animationStarted) {
      animationStarted = true;
      requestAnimationFrame(gameLoop);
    }
  }

  boot();
})();
