import * as THREE from "./vendor/three.module.js";
import { GLTFLoader } from "./vendor/GLTFLoader.js";

// 游戏的全部可调参数集中在这里，便于统一调整手感和赛道尺寸。
const CONFIG = {
  totalLaps: 3,
  countdownSeconds: 3,
  countdownLead: 0.9,
  collision: {
    radius: 1.9,
    restitution: 0.16,
    speedDamping: 0.985,
    iterations: 2,
  },
  items: {
    pickupRadius: 3.3,
    boxRespawnSeconds: 6.5,
    bobAmplitude: 0.38,
    spinSpeed: 2.2,
    boostDuration: 2.2,
    boostAcceleration: 34,
    boostTopSpeedBonus: 18,
    shockwaveRadius: 16,
    shockwaveSlowFactor: 0.58,
    shockwaveSlowSeconds: 1.85,
    shockwaveVisualSeconds: 0.65,
    itemPool: ["boost", "missile", "mine", "shockwave"],
    pickupPoints: 8,
    missileSpeed: 34,
    missileTurnRate: 3.8,
    missileLifeSeconds: 4.8,
    missileHitRadius: 2.1,
    missileSlowSeconds: 2.6,
    missileSpeedDamping: 0.36,
    mineArmSeconds: 0.45,
    mineLifeSeconds: 18,
    mineTriggerRadius: 2.4,
    mineSlowSeconds: 2.2,
    mineSpeedDamping: 0.3,
  },
  ghost: {
    sampleInterval: 1 / 30,
  },
  save: {
    storageKey: "neon-bend-rush-save-v1",
    leaderboardLimit: 10,
  },
  online: {
    storageKey: "neon-bend-rush-online-v1",
    defaultApiBase: "https://neon-bend-rush-service.zirconiumzjr.workers.dev/api",
    leaderboardLimit: 5,
    stateSendInterval: 1 / 12,
    remoteLerpSharpness: 10,
    roomCodeLength: 5,
  },
  trackDefaults: {
    wallHeight: 1.8,
    checkpointCount: 6,
    resetMargin: 1.4,
    startProgress: 6,
  },
  trackPresets: {
    speedway: {
      label: "霓虹环线",
      description: "高速直道更多，适合连续漂移后接增压冲刺。",
      halfX: 68,
      halfZ: 44,
      cornerRadius: 24,
      width: 24,
      straightSamples: 34,
      arcSamples: 26,
      pickupPoints: 8,
      groundRadius: 260,
      innerFieldRadius: 55,
      barrierColors: [0xe7e7e7, 0xff5c62],
      laneMarkerColor: 0xf5f5f5,
      directionMarkerColor: 0xffce56,
      startArchColor: 0x79d8ff,
      startArchEmissive: 0x15354d,
      supportText: "长直道更适合积攒增压后全油门冲线。",
    },
    canyon: {
      label: "赤岩峡谷",
      description: "弯道更密、赛道更窄，更考验控车和道具时机。",
      halfX: 56,
      halfZ: 52,
      cornerRadius: 16,
      width: 22,
      straightSamples: 30,
      arcSamples: 24,
      pickupPoints: 10,
      groundRadius: 248,
      innerFieldRadius: 43,
      barrierColors: [0xf5ddbf, 0xc97a57],
      laneMarkerColor: 0xfff3dd,
      directionMarkerColor: 0xffcf6f,
      startArchColor: 0xffb168,
      startArchEmissive: 0x4d2415,
      supportText: "连续回旋弯更多，别太早把漂移蓄能交掉。",
    },
  },
  audio: {
    masterVolume: 0.18,
    collisionThreshold: 7,
    collisionCooldown: 0.16,
  },
  playerPhysics: {
    maxSpeed: 45,
    maxReverseSpeed: 14,
    acceleration: 34,
    reverseAcceleration: 18,
    braking: 42,
    coastDrag: 1.6,
    airDrag: 0.016,
    lateralGrip: 10.2,
    driftGrip: 5.3,
    steeringPower: 2.6,
    steeringFalloff: 0.5,
    driftTurnBoost: 1.24,
    driftSlideForce: 12.5,
    handbrakeDrag: 1.45,
    minDriftSpeed: 12,
    minBoostCharge: 18,
    maxDriftCharge: 100,
    driftChargeRate: 54,
    boostBaseDuration: 0.8,
    boostExtraDuration: 1.55,
    boostAcceleration: 58,
    boostTopSpeedBonus: 24,
    driftAssist: 0.26,
    driftStability: 7.5,
    driftSlipCap: 10.8,
    driftThrottleBonus: 5.8,
  },
  aiPhysics: {
    maxSpeed: 40,
    maxReverseSpeed: 8,
    acceleration: 28,
    reverseAcceleration: 12,
    braking: 34,
    coastDrag: 1.85,
    airDrag: 0.018,
    lateralGrip: 9.4,
    driftGrip: 5.6,
    steeringPower: 2.2,
    steeringFalloff: 0.46,
    driftTurnBoost: 1.1,
    driftSlideForce: 0,
    handbrakeDrag: 2.4,
    minDriftSpeed: 999,
    minBoostCharge: 999,
    maxDriftCharge: 100,
    driftChargeRate: 0,
    boostBaseDuration: 0,
    boostExtraDuration: 0,
    boostAcceleration: 0,
    boostTopSpeedBonus: 0,
    driftAssist: 0,
    driftStability: 0,
    driftSlipCap: 999,
    driftThrottleBonus: 0,
  },
  wrongWayResetSeconds: 1.6,
  carBaseHeight: 0.45,
  cameraModes: [
    {
      label: "追尾镜头",
      offset: new THREE.Vector3(0, 6.6, -13.5),
      lookAhead: 10,
      lookHeight: 1.5,
      followSharpness: 6,
      lookSharpness: 8,
    },
    {
      label: "低位近景",
      offset: new THREE.Vector3(0, 3.2, -7.8),
      lookAhead: 14,
      lookHeight: 1.2,
      followSharpness: 8,
      lookSharpness: 10,
    },
    {
      label: "俯视跟拍",
      offset: new THREE.Vector3(0, 18, -3.5),
      lookAhead: 8,
      lookHeight: 0.6,
      followSharpness: 5,
      lookSharpness: 6,
    },
  ],
  names: {
    player: "玩家",
    ai: ["赤焰", "苍穹", "雷霆", "飓风", "影袭", "彗星", "裂空", "霜刃", "钢牙"],
  },
  weatherPresets: {
    day: {
      label: "白天",
      description: "白天：视野明亮，赛道边界最清晰。",
      background: 0x87bfe6,
      fogNear: 110,
      fogFar: 300,
      ambientSky: 0xd9f4ff,
      ambientGround: 0x234018,
      ambientIntensity: 1.35,
      sunColor: 0xffffff,
      sunIntensity: 1.1,
      sunPosition: [70, 85, 40],
      groundColor: 0x3d8150,
      innerFieldColor: 0x4d9c56,
      trackColor: 0x2e333e,
    },
    dusk: {
      label: "黄昏",
      description: "黄昏：暖色光照，弯道更有压迫感。",
      background: 0xd68f6c,
      fogNear: 95,
      fogFar: 250,
      ambientSky: 0xffd6bb,
      ambientGround: 0x4a2618,
      ambientIntensity: 1.05,
      sunColor: 0xffc389,
      sunIntensity: 0.9,
      sunPosition: [55, 45, 18],
      groundColor: 0x5b6140,
      innerFieldColor: 0x59693d,
      trackColor: 0x38323a,
    },
    night: {
      label: "夜晚",
      description: "夜晚：环境更暗，需要更依赖路线记忆与车感。",
      background: 0x08111f,
      fogNear: 75,
      fogFar: 200,
      ambientSky: 0x375272,
      ambientGround: 0x081018,
      ambientIntensity: 0.58,
      sunColor: 0x9ac7ff,
      sunIntensity: 0.36,
      sunPosition: [28, 50, 12],
      groundColor: 0x152131,
      innerFieldColor: 0x1b3130,
      trackColor: 0x1c232e,
    },
  },
  difficulties: {
    casual: {
      label: "休闲",
      description: "3 名 AI 参赛，整体节奏更平稳，适合熟悉赛道。",
      aiCount: 3,
      maxSpeedBase: 39,
      maxSpeedStep: 1.1,
      cornerSpeedBase: 22,
      accelerationScale: 0.96,
      lookAheadBase: 15,
      laneBias: 0.9,
    },
    expert: {
      label: "进阶",
      description: "5 名 AI 参赛，对手速度更快，整体节奏更紧。",
      aiCount: 5,
      maxSpeedBase: 43,
      maxSpeedStep: 1.35,
      cornerSpeedBase: 25,
      accelerationScale: 1.08,
      lookAheadBase: 16,
      laneBias: 1,
    },
    legend: {
      label: "极限",
      description: "7 名 AI 参赛，头部车手会明显快于玩家，需要更积极地漂移和抢线。",
      aiCount: 7,
      maxSpeedBase: 46,
      maxSpeedStep: 1.6,
      cornerSpeedBase: 28,
      accelerationScale: 1.18,
      lookAheadBase: 17,
      laneBias: 1.15,
    },
  },
};

// 环境美术资源使用本地化的低模 glTF/GLB，便于静态部署和统一管理。
const MODEL_ASSET_CONFIG = {
  tree: {
    path: "./assets/models/environment/tree.glb",
    fit: "height",
    target: 8.6,
  },
  flowerBushes: {
    path: "./assets/models/environment/flower-bushes.glb",
    fit: "span",
    target: 5.6,
  },
  streetlight: {
    path: "./assets/models/environment/streetlight.glb",
    fit: "height",
    target: 8.4,
  },
  barrierLarge: {
    path: "./assets/models/track/barrier-large.glb",
    fit: "span",
    target: 5.6,
  },
  banner: {
    path: "./assets/models/track/banner.glb",
    fit: "height",
    target: 4.3,
  },
  menuBillboard: {
    path: "./assets/models/props/menu-billboard.glb",
    fit: "height",
    target: 4.6,
  },
  roadCone: {
    path: "./assets/models/props/road-cone.glb",
    fit: "height",
    target: 1.15,
  },
  sportsStands: {
    path: "./assets/models/props/sports-stands.glb",
    fit: "span",
    target: 24,
  },
  raceFlag: {
    path: "./assets/models/props/race-flag.glb",
    fit: "height",
    target: 5.2,
    doubleSide: true,
  },
  sportsSilverCar: {
    path: "./assets/models/cars/sports-silver.glb",
    fit: "span",
    target: 5.1,
    kind: "car",
    paintMaterials: ["White"],
  },
  sportsOrangeCar: {
    path: "./assets/models/cars/sports-orange.glb",
    fit: "span",
    target: 5.1,
    kind: "car",
    paintMaterials: ["Orange", "DarkOrange"],
  },
  carBlueCar: {
    path: "./assets/models/cars/car-blue.glb",
    fit: "span",
    target: 5.1,
    kind: "car",
    paintMaterials: ["Blue"],
  },
  carLightBlueCar: {
    path: "./assets/models/cars/car-light-blue.glb",
    fit: "span",
    target: 5.1,
    kind: "car",
    paintMaterials: ["LightBlue"],
  },
};

const CAR_MODEL_VARIANTS = ["sportsOrangeCar", "carBlueCar", "carLightBlueCar", "sportsSilverCar"];

const inputState = {
  accelerate: false,
  brake: false,
  left: false,
  right: false,
  drift: false,
};

const ui = {
  gameRoot: document.getElementById("game-root"),
  startScreen: document.getElementById("start-screen"),
  startButton: document.getElementById("start-button"),
  countdown: document.getElementById("countdown"),
  hud: document.getElementById("hud"),
  hudRaceCard: document.getElementById("hud-race-card"),
  hudTimeCard: document.getElementById("hud-time-card"),
  hudSpeedCard: document.getElementById("hud-speed-card"),
  lapValue: document.getElementById("lap-value"),
  positionValue: document.getElementById("position-value"),
  speedValue: document.getElementById("speed-value"),
  speedBarFill: document.getElementById("hud-speed-bar-fill"),
  timeValue: document.getElementById("time-value"),
  cameraValue: document.getElementById("camera-value"),
  itemValue: document.getElementById("item-value"),
  boostValue: document.getElementById("boost-value"),
  difficultyValue: document.getElementById("difficulty-value"),
  weatherValue: document.getElementById("weather-value"),
  trackValue: document.getElementById("track-value"),
  modeValue: document.getElementById("mode-value"),
  roomValue: document.getElementById("room-value"),
  statusValue: document.getElementById("status-value"),
  trackDescription: document.getElementById("track-description"),
  trackButtons: [...document.querySelectorAll("[data-track]")],
  onlineSection: document.getElementById("online-section"),
  onlineDescription: document.getElementById("online-description"),
  modeButtons: [...document.querySelectorAll("[data-mode]")],
  onlineControls: document.getElementById("online-controls"),
  onlineNameInput: document.getElementById("online-name-input"),
  onlineApiInput: document.getElementById("online-api-input"),
  onlineRoomInput: document.getElementById("online-room-input"),
  createRoomButton: document.getElementById("create-room-button"),
  joinRoomButton: document.getElementById("join-room-button"),
  leaveRoomButton: document.getElementById("leave-room-button"),
  onlineRoomCodeValue: document.getElementById("online-room-code-value"),
  onlineRoomRoleValue: document.getElementById("online-room-role-value"),
  onlineStatus: document.getElementById("online-status"),
  onlineLeaderboardList: document.getElementById("online-leaderboard-list"),
  onlineRoomMembers: document.getElementById("online-room-members"),
  hudSupportText: document.querySelector("#hud-time-card .hud-support-text"),
  minimapPanel: document.getElementById("minimap-panel"),
  minimapCanvas: document.getElementById("minimap-canvas"),
  minimapTrackLabel: document.getElementById("minimap-track-label"),
  difficultyDescription: document.getElementById("difficulty-description"),
  difficultyButtons: [...document.querySelectorAll("[data-difficulty]")],
  weatherDescription: document.getElementById("weather-description"),
  weatherButtons: [...document.querySelectorAll("[data-weather]")],
  startBestTotal: document.getElementById("start-best-total"),
  startBestLap: document.getElementById("start-best-lap"),
  startLeaderboardList: document.getElementById("start-leaderboard-list"),
  resultScreen: document.getElementById("result-screen"),
  resultTitle: document.getElementById("result-title"),
  resultSummary: document.getElementById("result-summary"),
  resultList: document.getElementById("result-list"),
  lapTimeList: document.getElementById("lap-time-list"),
  historyList: document.getElementById("history-list"),
  onlineResultStatus: document.getElementById("online-result-status"),
  onlineResultList: document.getElementById("online-result-list"),
  recordBestTotal: document.getElementById("record-best-total"),
  recordBestLap: document.getElementById("record-best-lap"),
  recordFlags: document.getElementById("record-flags"),
  restartButton: document.getElementById("restart-button"),
  debugToggle: document.getElementById("debug-toggle"),
  debugPanel: document.getElementById("debug-panel"),
  debugMaxSpeed: document.getElementById("debug-max-speed"),
  debugMaxSpeedValue: document.getElementById("debug-max-speed-value"),
  debugAcceleration: document.getElementById("debug-acceleration"),
  debugAccelerationValue: document.getElementById("debug-acceleration-value"),
  debugGrip: document.getElementById("debug-grip"),
  debugGripValue: document.getElementById("debug-grip-value"),
  debugDriftFactor: document.getElementById("debug-drift-factor"),
  debugDriftFactorValue: document.getElementById("debug-drift-factor-value"),
};

const gameState = {
  scene: null,
  camera: null,
  renderer: null,
  ambientLight: null,
  sunLight: null,
  clock: new THREE.Clock(),
  cameraLookTarget: new THREE.Vector3(),
  status: "start",
  countdownRemaining: 0,
  elapsedTime: 0,
  track: null,
  world: {},
  player: null,
  aiCars: [],
  remoteCars: [],
  cars: [],
  standings: [],
  currentCameraIndex: 0,
  selectedModeId: "local",
  selectedDifficultyId: "expert",
  difficultyConfig: null,
  selectedWeatherId: "day",
  weatherConfig: null,
  selectedTrackId: "speedway",
  trackConfig: null,
  noticeText: "等待开始",
  noticeTimer: 0,
  results: [],
};

const tempVectors = {
  forward: new THREE.Vector3(),
  right: new THREE.Vector3(),
  lookAt: new THREE.Vector3(),
  cameraTarget: new THREE.Vector3(),
};

const hudVisualState = {
  lapText: "",
  rank: null,
  speedBucket: -1,
  timeSecond: -1,
  boostLabel: "",
  itemLabel: "",
  statusText: "",
  boostActive: false,
  driftActive: false,
};

let carIdCounter = 1;
const saveSystem = createSaveSystem();
const weatherSystem = createWeatherSystem();
const ghostSystem = createGhostSystem();
const itemSystem = createItemSystem();
const debugPanel = createDebugPanel();
const modelSystem = createModelSystem();
const minimapSystem = createMiniMapSystem();
const soundSystem = createSoundSystem();
const onlineSystem = createOnlineSystem();

boot();

// 初始化顺序保持固定：渲染器、场景、赛道、UI、输入、初始摆放。
function boot() {
  saveSystem.load();
  gameState.trackConfig = getSelectedTrackConfig(gameState.selectedTrackId);
  setupRenderer();
  setupScene();
  setupWorld();
  setupTrackAndCars();
  modelSystem.init();
  setupUI();
  setupInput();
  weatherSystem.apply(gameState.selectedWeatherId);
  itemSystem.init();
  ghostSystem.init();
  debugPanel.init();
  minimapSystem.init();
  onlineSystem.init();
  saveSystem.renderBoards();
  resetRace();
  renderHUD();
  animate();
}

function setupRenderer() {
  gameState.renderer = new THREE.WebGLRenderer({ antialias: true });
  gameState.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.8));
  gameState.renderer.setSize(window.innerWidth, window.innerHeight);
  gameState.renderer.outputColorSpace = THREE.SRGBColorSpace;
  ui.gameRoot.appendChild(gameState.renderer.domElement);
}

function setupScene() {
  gameState.scene = new THREE.Scene();
  gameState.scene.background = new THREE.Color(0x87bfe6);
  gameState.scene.fog = new THREE.Fog(0x87bfe6, 110, 300);

  gameState.camera = new THREE.PerspectiveCamera(
    58,
    window.innerWidth / window.innerHeight,
    0.1,
    500,
  );

  gameState.ambientLight = new THREE.HemisphereLight(0xd9f4ff, 0x234018, 1.35);
  gameState.sunLight = new THREE.DirectionalLight(0xffffff, 1.1);
  gameState.sunLight.position.set(70, 85, 40);
  gameState.scene.add(gameState.ambientLight, gameState.sunLight);
}

function setupWorld() {
  const ground = new THREE.Mesh(
    new THREE.CircleGeometry(260, 96),
    new THREE.MeshStandardMaterial({ color: 0x3d8150, roughness: 1 }),
  );
  ground.rotation.x = -Math.PI / 2;
  gameState.scene.add(ground);

  const innerField = new THREE.Mesh(
    new THREE.CircleGeometry(55, 64),
    new THREE.MeshStandardMaterial({ color: 0x4d9c56, roughness: 1 }),
  );
  innerField.rotation.x = -Math.PI / 2;
  innerField.position.y = 0.01;
  gameState.scene.add(innerField);
  gameState.world.ground = ground;
  gameState.world.innerField = innerField;
  gameState.world.fallbackTreesGroup = new THREE.Group();
  gameState.world.environmentDecorGroup = new THREE.Group();
  gameState.world.environmentDecorGroup.name = "环境模型装饰";
  gameState.scene.add(gameState.world.fallbackTreesGroup, gameState.world.environmentDecorGroup);

  for (let index = 0; index < 28; index += 1) {
    const tree = new THREE.Group();
    const trunk = new THREE.Mesh(
      new THREE.CylinderGeometry(0.35, 0.5, 2.2, 8),
      new THREE.MeshStandardMaterial({ color: 0x6f4e37 }),
    );
    const foliage = new THREE.Mesh(
      new THREE.ConeGeometry(1.4 + Math.random() * 0.4, 3 + Math.random(), 8),
      new THREE.MeshStandardMaterial({ color: 0x1d6e35 }),
    );
    const angle = (index / 28) * Math.PI * 2;
    const radius = 150 + (index % 4) * 10;
    tree.position.set(Math.cos(angle) * radius, 0, Math.sin(angle) * radius);
    trunk.position.y = 1.1;
    foliage.position.y = 3;
    tree.add(trunk, foliage);
    gameState.world.fallbackTreesGroup.add(tree);
  }
}

function setupTrackAndCars() {
  gameState.track = createTrack();
  gameState.scene.add(gameState.track.group);
  updateWorldForTrack();

  gameState.player = createCar("player", 0xff8648, CONFIG.names.player);
  gameState.scene.add(gameState.player.mesh);
  applyDifficultySelection(gameState.selectedDifficultyId);
  applyTrackSelection(gameState.selectedTrackId);
  weatherSystem.apply(gameState.selectedWeatherId);
  rebuildAIField();
}

function setupUI() {
  for (const button of ui.modeButtons) {
    button.addEventListener("click", () => {
      onlineSystem.applyMode(button.dataset.mode);
    });
  }

  for (const button of ui.trackButtons) {
    button.addEventListener("click", () => {
      applyTrackSelection(button.dataset.track);
    });
  }

  for (const button of ui.difficultyButtons) {
    button.addEventListener("click", () => {
      applyDifficultySelection(button.dataset.difficulty);
    });
  }

  for (const button of ui.weatherButtons) {
    button.addEventListener("click", () => {
      weatherSystem.apply(button.dataset.weather);
    });
  }

  ui.startButton.addEventListener("click", () => {
    soundSystem.init();
    if (onlineSystem.isOnlineMode()) {
      onlineSystem.handleStartButton();
      return;
    }

    ui.startScreen.classList.remove("visible");
    ui.startScreen.classList.add("hidden");
    startCountdown();
  });

  ui.restartButton.addEventListener("click", () => {
    soundSystem.init();
    ui.resultScreen.classList.remove("visible");
    ui.resultScreen.classList.add("hidden");
    if (onlineSystem.isOnlineMode()) {
      ui.hud.classList.add("hidden");
      ui.startScreen.classList.remove("hidden");
      ui.startScreen.classList.add("visible");
      onlineSystem.afterRaceReturnToLobby();
      return;
    }
    startCountdown();
  });

  window.addEventListener("resize", handleResize);
}

// 难度选择会同时影响 AI 数量、最高速度、加速能力和说明文案。
function applyDifficultySelection(difficultyId) {
  const nextDifficulty = CONFIG.difficulties[difficultyId] ?? CONFIG.difficulties.expert;
  gameState.selectedDifficultyId = difficultyId in CONFIG.difficulties ? difficultyId : "expert";
  gameState.difficultyConfig = nextDifficulty;

  ui.difficultyDescription.textContent = nextDifficulty.description;
  for (const button of ui.difficultyButtons) {
    button.classList.toggle("active", button.dataset.difficulty === gameState.selectedDifficultyId);
  }

  renderHUD();
  onlineSystem.refreshLeaderboard();
}

function getSelectedTrackConfig(trackId) {
  const preset = CONFIG.trackPresets[trackId] ?? CONFIG.trackPresets.speedway;
  return {
    ...CONFIG.trackDefaults,
    ...preset,
  };
}

function applyTrackSelection(trackId) {
  gameState.selectedTrackId = trackId in CONFIG.trackPresets ? trackId : "speedway";
  gameState.trackConfig = getSelectedTrackConfig(gameState.selectedTrackId);

  if (ui.trackDescription) {
    ui.trackDescription.textContent = gameState.trackConfig.description;
  }

  for (const button of ui.trackButtons) {
    button.classList.toggle("active", button.dataset.track === gameState.selectedTrackId);
  }

  if (gameState.scene && gameState.track && ui.startScreen.classList.contains("visible")) {
    rebuildTrack();
  }

  renderHUD();
  saveSystem.renderBoards();
  onlineSystem.refreshLeaderboard();
}

function applyWeatherSelection(weatherId) {
  const nextWeather = CONFIG.weatherPresets[weatherId] ?? CONFIG.weatherPresets.day;
  gameState.selectedWeatherId = weatherId in CONFIG.weatherPresets ? weatherId : "day";
  gameState.weatherConfig = nextWeather;

  ui.weatherDescription.textContent = nextWeather.description;
  for (const button of ui.weatherButtons) {
    button.classList.toggle("active", button.dataset.weather === gameState.selectedWeatherId);
  }

  renderHUD();
}

function rebuildTrack() {
  if (gameState.track?.group) {
    gameState.scene.remove(gameState.track.group);
  }

  gameState.track = createTrack();
  gameState.scene.add(gameState.track.group);
  updateWorldForTrack();

  if (itemSystem.boxGroup) {
    itemSystem.buildBoxes();
  }

  if (gameState.cars.length > 0) {
    resetRace();
  }

  minimapSystem.setTrack(gameState.track);
  modelSystem.populateScene();
  weatherSystem.apply(gameState.selectedWeatherId);
}

function updateWorldForTrack() {
  const track = gameState.trackConfig ?? getSelectedTrackConfig(gameState.selectedTrackId);
  if (gameState.world.ground) {
    gameState.world.ground.scale.setScalar(track.groundRadius / 260);
  }
  if (gameState.world.innerField) {
    gameState.world.innerField.scale.setScalar(track.innerFieldRadius / 55);
  }
  if (ui.minimapTrackLabel) {
    ui.minimapTrackLabel.textContent = track.label;
  }
}

function createSaveSystem() {
  return {
    records: {
      bestLap: null,
      bestTotal: null,
      history: [],
    },
    latestFlags: {
      bestLap: false,
      bestTotal: false,
    },
    load() {
      try {
        const raw = window.localStorage.getItem(CONFIG.save.storageKey);
        if (!raw) {
          return;
        }

        const parsed = JSON.parse(raw);
        if (typeof parsed.bestLap === "number") {
          this.records.bestLap = parsed.bestLap;
        }
        if (typeof parsed.bestTotal === "number") {
          this.records.bestTotal = parsed.bestTotal;
        }
        if (Array.isArray(parsed.history)) {
          this.records.history = parsed.history
            .filter((entry) => typeof entry.totalTime === "number")
            .slice(0, CONFIG.save.leaderboardLimit);
        }
      } catch {
        // 本地存档失败时保持静默回退，避免影响比赛主流程。
      }
    },
    prepareForRace() {
      this.latestFlags.bestLap = false;
      this.latestFlags.bestTotal = false;
    },
    updateRecords(player) {
      this.prepareForRace();

      if (!player?.finishTime) {
        return;
      }

      const fastestLap = player.lapTimes.length > 0 ? Math.min(...player.lapTimes) : null;

      if (
        typeof fastestLap === "number" &&
        (this.records.bestLap === null || fastestLap < this.records.bestLap)
      ) {
        this.records.bestLap = fastestLap;
        this.latestFlags.bestLap = true;
      }

      if (this.records.bestTotal === null || player.finishTime < this.records.bestTotal) {
        this.records.bestTotal = player.finishTime;
        this.latestFlags.bestTotal = true;
      }

      this.records.history.unshift({
        totalTime: player.finishTime,
        bestLap: fastestLap,
        rank: player.rank,
        trackId: gameState.selectedTrackId,
        trackLabel: gameState.trackConfig?.label ?? "霓虹环线",
        difficultyId: gameState.selectedDifficultyId,
        difficultyLabel: gameState.difficultyConfig?.label ?? "进阶",
        weatherLabel: gameState.weatherConfig?.label ?? "白天",
        createdAt: new Date().toISOString(),
      });
      this.records.history.sort((left, right) => left.totalTime - right.totalTime);
      this.records.history = this.records.history.slice(0, CONFIG.save.leaderboardLimit);

      try {
        window.localStorage.setItem(CONFIG.save.storageKey, JSON.stringify(this.records));
      } catch {
        // 本地存储不可用时，不阻断结算展示。
      }

      this.renderBoards();
    },
    getBestLapLabel() {
      return this.records.bestLap === null ? "暂无" : formatTime(this.records.bestLap);
    },
    getBestTotalLabel() {
      return this.records.bestTotal === null ? "暂无" : formatTime(this.records.bestTotal);
    },
    getRecordFlagText() {
      const labels = [];
      if (this.latestFlags.bestLap) {
        labels.push("最快单圈新纪录");
      }
      if (this.latestFlags.bestTotal) {
        labels.push("最佳总成绩新纪录");
      }
      return labels.length > 0 ? `新纪录：${labels.join(" / ")}` : "";
    },
    renderBoards() {
      if (ui.startBestTotal) {
        ui.startBestTotal.textContent = `最佳总成绩：${this.getBestTotalLabel()}`;
      }
      if (ui.startBestLap) {
        ui.startBestLap.textContent = `最快单圈：${this.getBestLapLabel()}`;
      }

      const renderList = (listNode) => {
        if (!listNode) {
          return;
        }

        listNode.innerHTML = "";
        if (this.records.history.length === 0) {
          const item = document.createElement("li");
          item.className = "mini-leaderboard-item";
          item.textContent = "暂无历史记录";
          listNode.appendChild(item);
          return;
        }

        this.records.history.slice(0, 5).forEach((entry, index) => {
          const item = document.createElement("li");
          item.className = "mini-leaderboard-item";

          const left = document.createElement("div");
          left.className = "mini-leaderboard-main";

          const title = document.createElement("strong");
          title.textContent = `#${index + 1} ${formatTime(entry.totalTime)}`;

          const meta = document.createElement("span");
          meta.textContent = `${entry.trackLabel} · ${entry.difficultyLabel} · ${entry.weatherLabel}`;

          left.append(title, meta);

          const tag = document.createElement("span");
          tag.className = "mini-leaderboard-tag";
          tag.textContent = entry.bestLap ? `单圈 ${formatTime(entry.bestLap)}` : "无单圈";

          item.append(left, tag);
          listNode.appendChild(item);
        });
      };

      renderList(ui.startLeaderboardList);
      renderList(ui.historyList);
    },
  };
}

function createOnlineSystem() {
  return {
    socket: null,
    room: {
      apiBase: CONFIG.online.defaultApiBase,
      roomId: "",
      playerId: "",
      hostId: "",
      players: [],
      status: "idle",
      connected: false,
      isHost: false,
      config: null,
    },
    onlineEntries: [],
    submitStatus: "在线成绩尚未同步。",
    sendAccumulator: 0,
    remotePalette: [0xb08cff, 0x7ed0ff, 0xffa16b, 0x7af0c3, 0xff7fb2],
    init() {
      this.loadPreferences();
      this.bindControls();
      this.applyMode(gameState.selectedModeId);
      this.renderRoomMembers();
      this.renderLeaderboardLists();
      this.renderResultBoard();
      this.refreshLeaderboard();
      this.updateSelectionLocks();
      this.updateStartButtonState();
    },
    bindControls() {
      ui.onlineNameInput?.addEventListener("change", () => {
        ui.onlineNameInput.value = this.getPlayerName();
        this.savePreferences();
      });

      ui.onlineApiInput?.addEventListener("change", () => {
        ui.onlineApiInput.value = this.normalizeApiBase(ui.onlineApiInput.value);
        this.savePreferences();
        this.refreshLeaderboard();
      });

      ui.createRoomButton?.addEventListener("click", () => {
        this.createRoom();
      });

      ui.joinRoomButton?.addEventListener("click", () => {
        this.joinRoom();
      });

      ui.leaveRoomButton?.addEventListener("click", () => {
        this.leaveRoom(true);
      });
    },
    loadPreferences() {
      const fallbackName = `玩家${Math.floor(100 + Math.random() * 900)}`;
      try {
        const raw = window.localStorage.getItem(CONFIG.online.storageKey);
        if (!raw) {
          if (ui.onlineNameInput) {
            ui.onlineNameInput.value = fallbackName;
          }
          if (ui.onlineApiInput) {
            ui.onlineApiInput.value = this.normalizeApiBase(CONFIG.online.defaultApiBase);
          }
          return;
        }

        const parsed = JSON.parse(raw);
        const storedApiBase = this.normalizeApiBase(parsed.apiBase || CONFIG.online.defaultApiBase);
        const migratedApiBase = storedApiBase === "/api" ? CONFIG.online.defaultApiBase : storedApiBase;
        if (ui.onlineNameInput) {
          ui.onlineNameInput.value = sanitizePlayerName(parsed.playerName || fallbackName);
        }
        if (ui.onlineApiInput) {
          ui.onlineApiInput.value = this.normalizeApiBase(migratedApiBase);
        }
      } catch {
        if (ui.onlineNameInput) {
          ui.onlineNameInput.value = fallbackName;
        }
        if (ui.onlineApiInput) {
          ui.onlineApiInput.value = this.normalizeApiBase(CONFIG.online.defaultApiBase);
        }
      }
    },
    savePreferences() {
      try {
        window.localStorage.setItem(
          CONFIG.online.storageKey,
          JSON.stringify({
            playerName: this.getPlayerName(),
            apiBase: this.normalizeApiBase(ui.onlineApiInput?.value || CONFIG.online.defaultApiBase),
          }),
        );
      } catch {
        // 本地缓存昵称或接口地址失败时，不影响单机和在线主流程。
      }
    },
    normalizeApiBase(value) {
      const trimmed = String(value || CONFIG.online.defaultApiBase).trim();
      if (!trimmed) {
        return CONFIG.online.defaultApiBase;
      }
      return trimmed.replace(/\/+$/, "");
    },
    getPlayerName() {
      return sanitizePlayerName(ui.onlineNameInput?.value || "玩家");
    },
    getRoomCodeInput() {
      return String(ui.onlineRoomInput?.value || "")
        .trim()
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, "")
        .slice(0, 8);
    },
    isOnlineMode() {
      return gameState.selectedModeId === "online";
    },
    applyMode(modeId) {
      const nextMode = modeId === "online" ? "online" : "local";
      if (gameState.selectedModeId === "online" && nextMode === "local" && (this.room.connected || this.room.roomId)) {
        this.leaveRoom(false);
      }

      gameState.selectedModeId = nextMode;
      for (const button of ui.modeButtons) {
        button.classList.toggle("active", button.dataset.mode === nextMode);
      }

      ui.onlineControls?.classList.toggle("hidden", nextMode !== "online");
      if (ui.onlineSection) {
        ui.onlineSection.dataset.mode = nextMode;
      }

      if (nextMode === "online") {
        this.setStatus(
          this.room.connected
            ? `已连接房间 ${this.room.roomId}，${this.room.isHost ? "你是房主" : "等待房主开始"}。`
            : "在线模式已启用，请先创建或加入房间。",
        );
      } else {
        this.setStatus("单机模式下不会连接在线服务。");
      }

      this.updateSelectionLocks();
      this.updateStartButtonState();
      renderHUD();
    },
    updateSelectionLocks() {
      const locked = this.isOnlineMode() && this.room.connected && !this.room.isHost;
      [...ui.difficultyButtons, ...ui.trackButtons, ...ui.weatherButtons].forEach((button) => {
        if (!button) {
          return;
        }
        button.disabled = locked;
        button.title = locked ? "只有房主可以修改房间配置" : "";
      });
    },
    updateStartButtonState() {
      if (!ui.startButton) {
        return;
      }

      if (!this.isOnlineMode()) {
        ui.startButton.disabled = false;
        ui.startButton.textContent = "开始游戏";
        return;
      }

      if (!this.room.connected) {
        ui.startButton.disabled = true;
        ui.startButton.textContent = "先加入房间";
        return;
      }

      if (!this.room.isHost) {
        ui.startButton.disabled = true;
        ui.startButton.textContent = "等待房主开始";
        return;
      }

      ui.startButton.disabled = false;
      ui.startButton.textContent = "开始在线比赛";
    },
    updateRoomMeta() {
      if (ui.onlineRoomCodeValue) {
        ui.onlineRoomCodeValue.textContent = this.room.roomId || "未加入";
      }
      if (ui.onlineRoomRoleValue) {
        ui.onlineRoomRoleValue.textContent = this.isOnlineMode()
          ? this.room.connected
            ? this.room.isHost
              ? "房主"
              : "成员"
            : "未连接"
          : "单机";
      }
      renderHUD();
    },
    setStatus(text) {
      if (ui.onlineStatus) {
        ui.onlineStatus.textContent = text;
      }
    },
    buildApiUrl(pathname, params = null) {
      const base = this.normalizeApiBase(ui.onlineApiInput?.value || this.room.apiBase || CONFIG.online.defaultApiBase);
      const url = new URL(base, window.location.href);
      url.pathname = `${url.pathname.replace(/\/+$/, "")}/${pathname.replace(/^\/+/, "")}`;
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== "") {
            url.searchParams.set(key, String(value));
          }
        });
      }
      return url;
    },
    buildWebSocketUrl(roomId, playerId) {
      const url = this.buildApiUrl(`rooms/${roomId}/ws`, { playerId });
      url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
      return url;
    },
    async requestJson(pathname, options = {}) {
      const url = this.buildApiUrl(pathname, options.query);
      const response = await fetch(url, {
        method: options.method || "GET",
        headers: {
          "Content-Type": "application/json",
          ...(options.headers || {}),
        },
        body: options.body ? JSON.stringify(options.body) : undefined,
      });

      let payload = null;
      try {
        payload = await response.json();
      } catch {
        payload = null;
      }

      if (!response.ok || payload?.success === false) {
        const message = payload?.error || payload?.errors?.[0]?.message || `请求失败（${response.status}）`;
        throw new Error(message);
      }

      return payload;
    },
    async refreshLeaderboard() {
      const shouldFetch = this.isOnlineMode() || this.normalizeApiBase(ui.onlineApiInput?.value || "").length > 0;
      if (!shouldFetch) {
        this.onlineEntries = [];
        this.renderLeaderboardLists();
        return;
      }

      try {
        const payload = await this.requestJson("leaderboard", {
          query: {
            trackId: gameState.selectedTrackId,
            difficultyId: gameState.selectedDifficultyId,
            limit: CONFIG.online.leaderboardLimit,
          },
        });
        this.onlineEntries = Array.isArray(payload.entries) ? payload.entries : [];
        this.renderLeaderboardLists();
        if (this.isOnlineMode()) {
          this.setStatus(this.room.connected ? ui.onlineStatus.textContent : "在线排行榜已刷新，可创建或加入房间。");
        }
      } catch (error) {
        this.onlineEntries = [];
        this.renderLeaderboardLists();
        if (this.isOnlineMode()) {
          this.setStatus(`在线服务不可用：${error.message}`);
        }
      }
    },
    renderLeaderboardLists() {
      const renderList = (targetList) => {
        if (!targetList) {
          return;
        }

        targetList.innerHTML = "";
        if (this.onlineEntries.length === 0) {
          const item = document.createElement("li");
          item.className = "mini-leaderboard-item";
          item.textContent = "暂无在线记录";
          targetList.appendChild(item);
          return;
        }

        this.onlineEntries.forEach((entry, index) => {
          const item = document.createElement("li");
          item.className = "mini-leaderboard-item";

          const main = document.createElement("div");
          main.className = "mini-leaderboard-main";

          const title = document.createElement("strong");
          title.textContent = `#${index + 1} ${entry.playerName || "匿名车手"}`;

          const meta = document.createElement("span");
          meta.textContent = `${formatTime(entry.totalTime)} · ${entry.trackLabel || gameState.trackConfig?.label || "赛道"}`;

          const tag = document.createElement("span");
          tag.className = "mini-leaderboard-tag";
          tag.textContent = entry.bestLap ? `单圈 ${formatTime(entry.bestLap)}` : "完赛";

          main.append(title, meta);
          item.append(main, tag);
          targetList.appendChild(item);
        });
      };

      renderList(ui.onlineLeaderboardList);
      renderList(ui.onlineResultList);
    },
    renderRoomMembers() {
      if (!ui.onlineRoomMembers) {
        return;
      }

      ui.onlineRoomMembers.innerHTML = "";
      if (!this.room.connected || this.room.players.length === 0) {
        const item = document.createElement("li");
        item.className = "mini-leaderboard-item";
        item.textContent = "未连接房间";
        ui.onlineRoomMembers.appendChild(item);
        return;
      }

      const orderedPlayers = [...this.room.players].sort((left, right) => left.slotIndex - right.slotIndex);
      orderedPlayers.forEach((player) => {
        const item = document.createElement("li");
        item.className = "mini-leaderboard-item";

        const main = document.createElement("div");
        main.className = "mini-leaderboard-main";

        const title = document.createElement("strong");
        title.textContent = player.id === this.room.playerId ? `${player.name}（你）` : player.name;

        const meta = document.createElement("span");
        meta.textContent = player.connected ? "已在线" : "暂时离线";

        const tag = document.createElement("span");
        tag.className = "mini-leaderboard-tag";
        tag.textContent = player.id === this.room.hostId ? "房主" : `席位 ${player.slotIndex + 1}`;

        main.append(title, meta);
        item.append(main, tag);
        ui.onlineRoomMembers.appendChild(item);
      });
    },
    async createRoom() {
      this.applyMode("online");
      this.savePreferences();
      this.setStatus("正在创建房间...");

      try {
        const payload = await this.requestJson("rooms", {
          method: "POST",
          body: {
            playerName: this.getPlayerName(),
          },
        });
        this.acceptJoinPayload(payload);
        await this.connectSocket();
        this.setStatus(`房间 ${this.room.roomId} 创建成功，等待其他玩家加入。`);
      } catch (error) {
        this.setStatus(`创建房间失败：${error.message}`);
      }
    },
    async joinRoom() {
      this.applyMode("online");
      this.savePreferences();
      const roomId = this.getRoomCodeInput();
      if (!roomId) {
        this.setStatus("请输入有效房间码。");
        return;
      }

      this.setStatus(`正在加入房间 ${roomId}...`);
      try {
        const payload = await this.requestJson("rooms/join", {
          method: "POST",
          body: {
            roomId,
            playerName: this.getPlayerName(),
          },
        });
        this.acceptJoinPayload(payload);
        await this.connectSocket();
        this.setStatus(`已加入房间 ${this.room.roomId}，等待房主开始。`);
      } catch (error) {
        this.setStatus(`加入房间失败：${error.message}`);
      }
    },
    acceptJoinPayload(payload) {
      this.room.apiBase = this.normalizeApiBase(ui.onlineApiInput?.value || CONFIG.online.defaultApiBase);
      this.room.roomId = payload.roomId || payload.room?.roomId || "";
      this.room.playerId = payload.playerId || payload.player?.id || "";
      this.applyRoomSnapshot(payload.room || null);
      if (ui.onlineRoomInput) {
        ui.onlineRoomInput.value = this.room.roomId;
      }
      this.updateRoomMeta();
      this.updateSelectionLocks();
      this.updateStartButtonState();
      this.renderRoomMembers();
    },
    async connectSocket() {
      if (!this.room.roomId || !this.room.playerId) {
        throw new Error("缺少房间信息");
      }

      this.disconnectSocket();
      const socket = new WebSocket(this.buildWebSocketUrl(this.room.roomId, this.room.playerId));
      this.socket = socket;

      socket.addEventListener("message", (event) => {
        if (this.socket !== socket) {
          return;
        }
        this.handleSocketMessage(event.data);
      });
      socket.addEventListener("close", () => {
        if (this.socket !== socket) {
          return;
        }
        this.socket = null;
        this.room.connected = false;
        this.room.players = this.room.players.map((player) => ({
          ...player,
          connected: false,
        }));
        this.clearRemoteCars();
        this.renderRoomMembers();
        this.updateRoomMeta();
        this.updateStartButtonState();
        if (this.isOnlineMode()) {
          this.setStatus("与房间的实时连接已断开。");
        }
      });

      await new Promise((resolve, reject) => {
        const handleOpen = () => {
          socket.removeEventListener("error", handleError);
          resolve();
        };
        const handleError = () => {
          socket.removeEventListener("open", handleOpen);
          reject(new Error("WebSocket 连接失败"));
        };
        socket.addEventListener("open", handleOpen, { once: true });
        socket.addEventListener("error", handleError, { once: true });
      });

      this.room.connected = true;
      this.updateRoomMeta();
      this.updateStartButtonState();
    },
    disconnectSocket() {
      const socket = this.socket;
      this.socket = null;
      if (socket) {
        try {
          socket.close();
        } catch {
          // 关闭连接失败时直接释放本地引用即可。
        }
      }
    },
    handleSocketMessage(rawData) {
      let message = null;
      try {
        message = JSON.parse(rawData);
      } catch {
        return;
      }

      if (!message || typeof message !== "object") {
        return;
      }

      if (message.type === "snapshot") {
        this.applyRoomSnapshot(message.room || null);
        this.renderRoomMembers();
        this.updateSelectionLocks();
        this.updateStartButtonState();
        return;
      }

      if (message.type === "player_state") {
        this.applyRemoteState(message.playerId, message.state);
        return;
      }

      if (message.type === "race_started") {
        this.handleRaceStarted(message);
      }
    },
    applyRoomSnapshot(roomSnapshot) {
      if (!roomSnapshot) {
        return;
      }

      this.room.roomId = roomSnapshot.roomId || this.room.roomId;
      this.room.hostId = roomSnapshot.hostId || this.room.hostId;
      this.room.players = Array.isArray(roomSnapshot.players) ? roomSnapshot.players : this.room.players;
      this.room.status = roomSnapshot.status || this.room.status;
      this.room.config = roomSnapshot.config || this.room.config;
      this.room.connected = true;
      this.room.isHost = this.room.hostId === this.room.playerId;
      this.syncRemoteCars();
      this.updateRoomMeta();
    },
    syncRemoteCars() {
      const remoteIds = new Set();
      for (const player of this.room.players) {
        if (player.id === this.room.playerId || !player.connected) {
          continue;
        }
        remoteIds.add(player.id);
        let remoteCar = gameState.remoteCars.find((car) => car.onlinePlayerId === player.id);
        if (!remoteCar) {
          const color = this.remotePalette[gameState.remoteCars.length % this.remotePalette.length];
          remoteCar = createCar("remote", color, `${player.name} 联机`);
          remoteCar.onlinePlayerId = player.id;
          remoteCar.onlineSlotIndex = player.slotIndex ?? gameState.remoteCars.length;
          remoteCar.networkTargetPosition = remoteCar.mesh.position.clone();
          remoteCar.networkTargetYaw = remoteCar.yaw;
          gameState.remoteCars.push(remoteCar);
          gameState.scene.add(remoteCar.mesh);
        }
        remoteCar.label = player.name;
        remoteCar.onlineSlotIndex = player.slotIndex ?? remoteCar.onlineSlotIndex ?? 0;
      }

      for (const remoteCar of [...gameState.remoteCars]) {
        if (!remoteIds.has(remoteCar.onlinePlayerId)) {
          gameState.scene.remove(remoteCar.mesh);
          gameState.remoteCars = gameState.remoteCars.filter((car) => car !== remoteCar);
        }
      }
    },
    clearRemoteCars() {
      for (const remoteCar of gameState.remoteCars) {
        gameState.scene.remove(remoteCar.mesh);
      }
      gameState.remoteCars = [];
      computeRanking();
    },
    async handleStartButton() {
      if (!this.room.connected) {
        this.setStatus("请先创建或加入房间。");
        return;
      }

      if (!this.room.isHost) {
        this.setStatus("只有房主可以开始比赛，请等待房主操作。");
        return;
      }

      try {
        await this.requestJson("rooms/start", {
          method: "POST",
          body: {
            roomId: this.room.roomId,
            playerId: this.room.playerId,
            config: {
              trackId: gameState.selectedTrackId,
              difficultyId: gameState.selectedDifficultyId,
              weatherId: gameState.selectedWeatherId,
            },
          },
        });
        this.setStatus("已向房间发送开始指令。");
      } catch (error) {
        this.setStatus(`开始联机比赛失败：${error.message}`);
      }
    },
    handleRaceStarted(message) {
      if (!message?.config) {
        return;
      }

      applyDifficultySelection(message.config.difficultyId || gameState.selectedDifficultyId);
      applyTrackSelection(message.config.trackId || gameState.selectedTrackId);
      weatherSystem.apply(message.config.weatherId || gameState.selectedWeatherId);
      this.room.config = message.config;
      if (message.room) {
        this.applyRoomSnapshot(message.room);
      }

      ui.resultScreen.classList.remove("visible");
      ui.resultScreen.classList.add("hidden");
      ui.startScreen.classList.remove("visible");
      ui.startScreen.classList.add("hidden");
      ui.hud.classList.remove("hidden");
      this.submitStatus = "比赛进行中，等待完赛后同步在线成绩。";
      startCountdown();
    },
    prepareRoomRace() {
      if (!this.isOnlineMode() || !this.room.connected || this.room.players.length === 0) {
        return;
      }

      const orderedPlayers = [...this.room.players].sort((left, right) => left.slotIndex - right.slotIndex);
      const spawnSetups = buildSpawnSetups(orderedPlayers.length);
      const selfPlayer = orderedPlayers.find((player) => player.id === this.room.playerId);
      if (selfPlayer) {
        const spawn = spawnSetups[selfPlayer.slotIndex] ?? spawnSetups[0];
        placeCarOnTrack(gameState.player, spawn.progress, spawn.laneOffset);
      }

      for (const remoteCar of gameState.remoteCars) {
        const remotePlayer = orderedPlayers.find((player) => player.id === remoteCar.onlinePlayerId);
        if (!remotePlayer) {
          continue;
        }
        const spawn = spawnSetups[remotePlayer.slotIndex] ?? spawnSetups[0];
        placeCarOnTrack(remoteCar, spawn.progress, spawn.laneOffset);
        remoteCar.networkTargetPosition = remoteCar.mesh.position.clone();
        remoteCar.networkTargetYaw = remoteCar.yaw;
      }

      computeRanking();
    },
    update(dt) {
      if (!this.isOnlineMode()) {
        return;
      }

      this.updateRemoteCars(dt);

      if (!this.room.connected || !this.socket || this.socket.readyState !== WebSocket.OPEN) {
        return;
      }

      if (gameState.status !== "running") {
        return;
      }

      this.sendAccumulator += dt;
      if (this.sendAccumulator < CONFIG.online.stateSendInterval) {
        return;
      }

      this.sendAccumulator = 0;
      this.sendPlayerState();
    },
    sendPlayerState() {
      if (!gameState.player || !this.socket || this.socket.readyState !== WebSocket.OPEN) {
        return;
      }

      this.socket.send(
        JSON.stringify({
          type: "state",
          state: {
            x: gameState.player.mesh.position.x,
            y: gameState.player.mesh.position.y,
            z: gameState.player.mesh.position.z,
            yaw: gameState.player.yaw,
            speed: getForwardSpeed(gameState.player),
            completedLaps: gameState.player.completedLaps,
            nextCheckpointIndex: gameState.player.nextCheckpointIndex,
            trackProgress: gameState.player.trackProgress,
            absoluteProgress: gameState.player.absoluteProgress,
            finished: gameState.player.finished,
            finishTime: gameState.player.finishTime,
          },
        }),
      );
    },
    applyRemoteState(playerId, state) {
      const remoteCar = gameState.remoteCars.find((car) => car.onlinePlayerId === playerId);
      if (!remoteCar || !state) {
        return;
      }

      remoteCar.networkTargetPosition = new THREE.Vector3(state.x, state.y, state.z);
      remoteCar.networkTargetYaw = state.yaw;
      remoteCar.completedLaps = state.completedLaps || 0;
      remoteCar.nextCheckpointIndex = state.nextCheckpointIndex || 0;
      remoteCar.trackProgress = state.trackProgress || 0;
      remoteCar.absoluteProgress = state.absoluteProgress || 0;
      remoteCar.finished = Boolean(state.finished);
      remoteCar.finishTime = state.finishTime || 0;
      remoteCar.velocity.copy(getForwardVector(state.yaw)).multiplyScalar(state.speed || 0);
      computeRanking();
    },
    updateRemoteCars(dt) {
      const lerpFactor = 1 - Math.exp(-CONFIG.online.remoteLerpSharpness * dt);
      for (const remoteCar of gameState.remoteCars) {
        if (!remoteCar.networkTargetPosition) {
          continue;
        }
        remoteCar.mesh.position.lerp(remoteCar.networkTargetPosition, lerpFactor);
        remoteCar.yaw = lerpAngle(remoteCar.yaw, remoteCar.networkTargetYaw ?? remoteCar.yaw, lerpFactor);
        updateCarVisualAnimation(remoteCar, dt);
        applyCarVisualTransform(remoteCar);
      }
    },
    async finishRace(player) {
      if (!this.isOnlineMode()) {
        this.submitStatus = "单机模式未上传在线成绩。";
        return;
      }

      try {
        await this.requestJson("leaderboard", {
          method: "POST",
          body: {
            playerName: this.getPlayerName(),
            trackId: gameState.selectedTrackId,
            trackLabel: gameState.trackConfig?.label ?? "霓虹环线",
            difficultyId: gameState.selectedDifficultyId,
            difficultyLabel: gameState.difficultyConfig?.label ?? "进阶",
            weatherId: gameState.selectedWeatherId,
            weatherLabel: gameState.weatherConfig?.label ?? "白天",
            totalTime: player.finishTime,
            bestLap: player.lapTimes.length > 0 ? Math.min(...player.lapTimes) : null,
          },
        });
        this.submitStatus = "在线成绩已同步。";
        await this.refreshLeaderboard();
      } catch (error) {
        this.submitStatus = `在线成绩同步失败：${error.message}`;
      }
    },
    renderResultBoard() {
      if (ui.onlineResultStatus) {
        ui.onlineResultStatus.textContent = this.submitStatus;
      }
      this.renderLeaderboardLists();
    },
    afterRaceReturnToLobby() {
      this.submitStatus = this.isOnlineMode()
        ? this.room.connected
          ? "已返回房间，可等待房主重新开始。"
          : "在线连接已断开。"
        : "在线成绩尚未同步。";
      this.renderResultBoard();
      this.updateStartButtonState();
      this.updateSelectionLocks();
    },
    leaveRoom(keepOnlineMode) {
      const roomId = this.room.roomId;
      const playerId = this.room.playerId;
      if (roomId && playerId) {
        this.requestJson("rooms/leave", {
          method: "POST",
          body: {
            roomId,
            playerId,
          },
        }).catch(() => {
          // 离房通知失败时仍然优先完成本地清理，避免界面残留旧房间状态。
        });
      }
      this.disconnectSocket();
      this.room = {
        apiBase: this.normalizeApiBase(ui.onlineApiInput?.value || CONFIG.online.defaultApiBase),
        roomId: "",
        playerId: "",
        hostId: "",
        players: [],
        status: "idle",
        connected: false,
        isHost: false,
        config: null,
      };
      if (ui.onlineRoomInput) {
        ui.onlineRoomInput.value = "";
      }
      this.clearRemoteCars();
      this.updateRoomMeta();
      this.renderRoomMembers();
      this.setStatus(keepOnlineMode ? "已离开房间。你可以创建新房间或重新加入。" : "单机模式下不会连接在线服务。");
      if (!keepOnlineMode) {
        gameState.selectedModeId = "local";
      }
      this.updateSelectionLocks();
      this.updateStartButtonState();
      this.renderResultBoard();
    },
  };
}

function createWeatherSystem() {
  return {
    apply(weatherId) {
      applyWeatherSelection(weatherId);

      if (!gameState.scene || !gameState.ambientLight || !gameState.sunLight) {
        return;
      }

      const preset = gameState.weatherConfig;
      gameState.scene.background = new THREE.Color(preset.background);
      gameState.scene.fog = new THREE.Fog(preset.background, preset.fogNear, preset.fogFar);
      gameState.ambientLight.color.setHex(preset.ambientSky);
      gameState.ambientLight.groundColor.setHex(preset.ambientGround);
      gameState.ambientLight.intensity = preset.ambientIntensity;
      gameState.sunLight.color.setHex(preset.sunColor);
      gameState.sunLight.intensity = preset.sunIntensity;
      gameState.sunLight.position.set(...preset.sunPosition);

      if (gameState.world.ground) {
        gameState.world.ground.material.color.setHex(preset.groundColor);
      }
      if (gameState.world.innerField) {
        gameState.world.innerField.material.color.setHex(preset.innerFieldColor);
      }
      if (gameState.track?.trackMesh) {
        gameState.track.trackMesh.material.color.setHex(preset.trackColor);
      }
    },
  };
}

function createMiniMapSystem() {
  return {
    canvas: null,
    ctx: null,
    bounds: null,
    init() {
      this.canvas = ui.minimapCanvas;
      this.ctx = this.canvas?.getContext("2d") ?? null;
      if (gameState.track) {
        this.setTrack(gameState.track);
      }
    },
    setTrack(track) {
      if (!track || !this.ctx) {
        return;
      }

      const bounds = new THREE.Box3();
      const boundaryPoints = [...(track.outerPoints ?? []), ...(track.innerPoints ?? []), ...track.points];
      for (const point of boundaryPoints) {
        bounds.expandByPoint(point);
      }
      this.bounds = bounds;
      this.render();
    },
    projectPoint(point) {
      if (!this.canvas || !this.bounds) {
        return { x: 0, y: 0 };
      }

      const padding = 18;
      const width = this.canvas.width - padding * 2;
      const height = this.canvas.height - padding * 2;
      const spanX = Math.max(1, this.bounds.max.x - this.bounds.min.x);
      const spanZ = Math.max(1, this.bounds.max.z - this.bounds.min.z);
      const scale = Math.min(width / spanX, height / spanZ);
      const offsetX = (this.canvas.width - spanX * scale) * 0.5;
      const offsetY = (this.canvas.height - spanZ * scale) * 0.5;

      return {
        x: offsetX + (point.x - this.bounds.min.x) * scale,
        y: this.canvas.height - (offsetY + (point.z - this.bounds.min.z) * scale),
      };
    },
    render() {
      if (!this.ctx || !gameState.track) {
        return;
      }

      const ctx = this.ctx;
      const canvas = this.canvas;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = "rgba(8, 16, 28, 0.76)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const drawLoop = (points) => {
        points.forEach((point, index) => {
          const mapPoint = this.projectPoint(point);
          if (index === 0) {
            ctx.moveTo(mapPoint.x, mapPoint.y);
          } else {
            ctx.lineTo(mapPoint.x, mapPoint.y);
          }
        });
        ctx.closePath();
      };

      ctx.beginPath();
      drawLoop(gameState.track.outerPoints ?? gameState.track.points);
      drawLoop(gameState.track.innerPoints ?? gameState.track.points);
      ctx.fillStyle = "rgba(74, 84, 104, 0.42)";
      ctx.fill("evenodd");

      ctx.beginPath();
      drawLoop(gameState.track.outerPoints ?? gameState.track.points);
      ctx.strokeStyle = "rgba(121, 216, 255, 0.88)";
      ctx.lineWidth = 3;
      ctx.lineJoin = "round";
      ctx.lineCap = "round";
      ctx.stroke();

      ctx.beginPath();
      drawLoop(gameState.track.innerPoints ?? gameState.track.points);
      ctx.strokeStyle = "rgba(255, 255, 255, 0.84)";
      ctx.lineWidth = 2.5;
      ctx.lineJoin = "round";
      ctx.lineCap = "round";
      ctx.stroke();

      const drawCarDot = (car, color, radius) => {
        if (!car || car.finished) {
          return;
        }
        const point = this.projectPoint(car.mesh.position);
        ctx.beginPath();
        ctx.arc(point.x, point.y, radius, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
        ctx.strokeStyle = "rgba(6, 11, 19, 0.9)";
        ctx.lineWidth = 2;
        ctx.stroke();
      };

      for (const car of gameState.aiCars) {
        drawCarDot(car, "rgba(255, 177, 104, 0.95)", 4);
      }
      for (const car of gameState.remoteCars) {
        drawCarDot(car, "rgba(180, 140, 255, 0.96)", 4.5);
      }
      drawCarDot(gameState.player, "rgba(94, 231, 255, 1)", 5.5);
    },
  };
}

function createSoundSystem() {
  return {
    context: null,
    masterGain: null,
    engineOscillator: null,
    engineGain: null,
    driftGain: null,
    driftFilter: null,
    driftSource: null,
    collisionCooldown: 0,
    initialized: false,
    init() {
      if (this.initialized) {
        this.context?.resume();
        return;
      }

      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) {
        return;
      }

      this.context = new AudioContextClass();
      this.masterGain = this.context.createGain();
      this.masterGain.gain.value = CONFIG.audio.masterVolume;
      this.masterGain.connect(this.context.destination);

      this.engineOscillator = this.context.createOscillator();
      this.engineOscillator.type = "sawtooth";
      this.engineGain = this.context.createGain();
      this.engineGain.gain.value = 0.0001;
      this.engineOscillator.connect(this.engineGain);
      this.engineGain.connect(this.masterGain);
      this.engineOscillator.start();

      this.driftFilter = this.context.createBiquadFilter();
      this.driftFilter.type = "bandpass";
      this.driftFilter.frequency.value = 1200;
      this.driftFilter.Q.value = 0.6;
      this.driftGain = this.context.createGain();
      this.driftGain.gain.value = 0.0001;
      this.driftSource = this.context.createBufferSource();
      this.driftSource.buffer = createNoiseBuffer(this.context, 1.5);
      this.driftSource.loop = true;
      this.driftSource.connect(this.driftFilter);
      this.driftFilter.connect(this.driftGain);
      this.driftGain.connect(this.masterGain);
      this.driftSource.start();

      this.initialized = true;
      this.context.resume();
    },
    update(dt) {
      if (!this.context || !this.initialized) {
        return;
      }

      this.collisionCooldown = Math.max(0, this.collisionCooldown - dt);

      const player = gameState.player;
      const now = this.context.currentTime;
      const speedRatio = player ? clamp(Math.abs(getForwardSpeed(player)) / CONFIG.playerPhysics.maxSpeed, 0, 1.2) : 0;
      const engineTarget = gameState.status === "running" ? 48 + speedRatio * 92 : 38;
      const engineGainTarget = gameState.status === "running" ? 0.018 + speedRatio * 0.06 : 0.0001;
      this.engineOscillator.frequency.setTargetAtTime(engineTarget, now, 0.08);
      this.engineGain.gain.setTargetAtTime(engineGainTarget, now, 0.08);

      const drifting = player?.wasDrifting && gameState.status === "running";
      const driftGainTarget = drifting ? 0.028 + speedRatio * 0.04 : 0.0001;
      this.driftFilter.frequency.setTargetAtTime(1000 + speedRatio * 900, now, 0.08);
      this.driftGain.gain.setTargetAtTime(driftGainTarget, now, 0.06);
    },
    playCollision(intensity) {
      if (!this.context || !this.initialized || this.collisionCooldown > 0) {
        return;
      }

      this.collisionCooldown = CONFIG.audio.collisionCooldown;
      const now = this.context.currentTime;
      const gain = this.context.createGain();
      const osc = this.context.createOscillator();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(170 + intensity * 16, now);
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.exponentialRampToValueAtTime(0.085, now + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.16);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now);
      osc.stop(now + 0.18);
    },
  };
}

function createGhostSystem() {
  return {
    ghostCar: null,
    recordedFrames: [],
    lastRunFrames: [],
    lastRunTrackId: null,
    playbackFrames: [],
    lastRecordedAt: 0,
    playbackTime: 0,
    init() {
      this.ghostCar = createCar("ghost", 0x79d8ff, "幽灵车");
      this.ghostCar.mesh.visible = false;
      modelSystem.applyCarMaterialState(this.ghostCar);
      gameState.scene.add(this.ghostCar.mesh);
    },
    prepareForRace() {
      this.recordedFrames = [];
      this.lastRecordedAt = 0;
      this.playbackTime = 0;
      this.playbackFrames =
        this.lastRunTrackId === gameState.selectedTrackId ? this.lastRunFrames : [];
      this.ghostCar.mesh.visible = false;

      if (this.playbackFrames.length > 1) {
        this.applyFrame(this.playbackFrames[0]);
      }
    },
    resetPlayback() {
      this.recordedFrames = [];
      this.lastRecordedAt = 0;
      this.playbackTime = 0;
      if (this.ghostCar) {
        this.ghostCar.mesh.visible = false;
      }
    },
    update(dt) {
      if (!this.ghostCar || gameState.status !== "running" || this.playbackFrames.length < 2) {
        return;
      }

      this.ghostCar.mesh.visible = true;

      this.playbackTime += dt;
      const maxTime = this.playbackFrames[this.playbackFrames.length - 1].time;
      if (this.playbackTime >= maxTime) {
        this.applyFrame(this.playbackFrames[this.playbackFrames.length - 1]);
        return;
      }

      const sampleIndex = Math.min(
        this.playbackFrames.length - 2,
        Math.floor(this.playbackTime / CONFIG.ghost.sampleInterval),
      );
      const current = this.playbackFrames[sampleIndex];
      const next = this.playbackFrames[sampleIndex + 1];
      const span = Math.max(0.0001, next.time - current.time);
      const t = clamp((this.playbackTime - current.time) / span, 0, 1);
      this.ghostCar.mesh.position.set(
        lerp(current.x, next.x, t),
        lerp(current.y, next.y, t),
        lerp(current.z, next.z, t),
      );
      this.ghostCar.yaw = lerpAngle(current.yaw, next.yaw, t);
      applyCarVisualTransform(this.ghostCar);
    },
    recordFrame(player, raceTime) {
      if (!player || gameState.status !== "running") {
        return;
      }

      if (
        this.recordedFrames.length > 0 &&
        raceTime - this.lastRecordedAt < CONFIG.ghost.sampleInterval
      ) {
        return;
      }

      this.recordedFrames.push({
        time: raceTime,
        x: player.mesh.position.x,
        y: player.mesh.position.y,
        z: player.mesh.position.z,
        yaw: player.yaw,
      });
      this.lastRecordedAt = raceTime;
    },
    finishRun(player) {
      if (!player || this.recordedFrames.length < 10) {
        return;
      }

      this.recordedFrames.push({
        time: player.finishTime,
        x: player.mesh.position.x,
        y: player.mesh.position.y,
        z: player.mesh.position.z,
        yaw: player.yaw,
      });
      this.lastRunFrames = this.recordedFrames.map((frame) => ({ ...frame }));
      this.lastRunTrackId = gameState.selectedTrackId;
      this.ghostCar.mesh.visible = false;
    },
    applyFrame(frame) {
      if (!frame) {
        return;
      }
      this.ghostCar.mesh.position.set(frame.x, frame.y, frame.z);
      this.ghostCar.yaw = frame.yaw;
      applyCarVisualTransform(this.ghostCar);
    },
  };
}

function createItemSystem() {
  return {
    boxes: [],
    boxGroup: null,
    shockwaves: [],
    missiles: [],
    mines: [],
    init() {
      this.boxGroup = new THREE.Group();
      gameState.scene.add(this.boxGroup);
      this.buildBoxes();
    },
    buildBoxes() {
      this.boxGroup.clear();
      this.boxes = [];
      this.shockwaves = [];
      this.missiles = [];
      this.mines = [];
      const pickupPoints = gameState.trackConfig?.pickupPoints ?? CONFIG.items.pickupPoints;

      for (let index = 0; index < pickupPoints; index += 1) {
        const progress =
          ((index + 0.5) / pickupPoints) * gameState.track.totalLength;
        const frame = getFrameAtProgress(gameState.track, progress);
        const mesh = this.createBoxMesh(index);
        mesh.position.copy(frame.position);
        mesh.position.y = 1.55;
        this.boxGroup.add(mesh);
        this.boxes.push({
          mesh,
          progress,
          baseY: 1.55,
          bobOffset: index * 0.8,
          active: true,
          respawnTimer: 0,
        });
      }
    },
    resetForRace() {
      for (const box of this.boxes) {
        box.active = true;
        box.respawnTimer = 0;
        box.mesh.visible = true;
      }

      for (const car of gameState.cars) {
        car.currentItem = null;
        car.itemBoostTimer = 0;
        car.slowTimer = 0;
      }

      for (const effect of this.shockwaves) {
        effect.life = 0;
        effect.mesh.visible = false;
      }

      for (const missile of this.missiles) {
        missile.life = 0;
        missile.mesh.visible = false;
      }

      for (const mine of this.mines) {
        mine.life = 0;
        mine.mesh.visible = false;
      }
    },
    update(dt) {
      for (const car of gameState.cars) {
        car.slowTimer = Math.max(0, car.slowTimer - dt);
      }

      for (const box of this.boxes) {
        if (box.active) {
          box.mesh.rotation.y += CONFIG.items.spinSpeed * dt;
          box.mesh.position.y =
            box.baseY + Math.sin(gameState.elapsedTime * 2.4 + box.bobOffset) * CONFIG.items.bobAmplitude;
        } else {
          box.respawnTimer = Math.max(0, box.respawnTimer - dt);
          if (box.respawnTimer <= 0) {
            box.active = true;
            box.mesh.visible = true;
          }
        }
      }

      for (const effect of this.shockwaves) {
        if (effect.life <= 0) {
          continue;
        }

        effect.life = Math.max(0, effect.life - dt);
        const progress = 1 - effect.life / CONFIG.items.shockwaveVisualSeconds;
        effect.mesh.visible = effect.life > 0;
        effect.mesh.scale.setScalar(1 + progress * 5.4);
        effect.mesh.material.opacity = (1 - progress) * 0.5;
      }

      this.updateMissiles(dt);
      this.updateMines(dt);
    },
    handlePickups() {
      for (const box of this.boxes) {
        if (!box.active) {
          continue;
        }

        for (const car of gameState.cars) {
          if (car.finished || car.currentItem) {
            continue;
          }

          if (car.mesh.position.distanceTo(box.mesh.position) > CONFIG.items.pickupRadius) {
            continue;
          }

          car.currentItem = sampleArray(CONFIG.items.itemPool);
          box.active = false;
          box.mesh.visible = false;
          box.respawnTimer = CONFIG.items.boxRespawnSeconds;

          if (car.type === "player") {
            setNotice(`获得道具：${this.getItemLabel(car.currentItem)}`, 1.2);
          }
          break;
        }
      }
    },
    updateAIUsage() {
      for (const car of gameState.aiCars) {
        if (!car.currentItem || car.finished) {
          continue;
        }

        if (car.currentItem === "boost") {
          const onStraight = Math.abs(car.steering) < 1.2;
          if (onStraight && getForwardSpeed(car) > 16) {
            this.useItem(car);
          }
          continue;
        }

        if (car.currentItem === "missile") {
          if (this.findMissileTarget(car)) {
            this.useItem(car);
          }
          continue;
        }

        if (car.currentItem === "mine") {
          const hasThreatBehind = gameState.cars.some((target) => {
            if (target === car || target.finished) {
              return false;
            }
            const gap = getRankingProgress(car) - getRankingProgress(target);
            return gap > 3 && gap < 26;
          });
          if (hasThreatBehind) {
            this.useItem(car);
          }
          continue;
        }

        if (car.currentItem === "shockwave") {
          const hasTargets = gameState.cars.some((target) => {
            return (
              target !== car &&
              !target.finished &&
              target.mesh.position.distanceTo(car.mesh.position) < CONFIG.items.shockwaveRadius
            );
          });

          if (hasTargets) {
            this.useItem(car);
          }
        }
      }
    },
    useItem(car) {
      if (!car?.currentItem) {
        return false;
      }

      const itemType = car.currentItem;

      if (itemType === "boost") {
        car.currentItem = null;
        car.itemBoostTimer = Math.max(car.itemBoostTimer, CONFIG.items.boostDuration);
        if (car.type === "player") {
          setNotice("道具加速已触发", 1);
        }
        return true;
      }

      if (itemType === "shockwave") {
        car.currentItem = null;
        this.triggerShockwave(car);
        if (car.type === "player") {
          setNotice("范围冲击波已释放", 1);
        }
        return true;
      }

      if (itemType === "mine") {
        car.currentItem = null;
        this.deployMine(car);
        if (car.type === "player") {
          setNotice("地雷已布设", 1);
        }
        return true;
      }

      if (itemType === "missile") {
        const target = this.findMissileTarget(car);
        if (!target) {
          if (car.type === "player") {
            setNotice("前方没有可锁定目标", 1);
          }
          return false;
        }
        car.currentItem = null;
        this.launchMissile(car, target);
        if (car.type === "player") {
          setNotice(`导弹已锁定：${target.label}`, 1);
        }
        return true;
      }

      return false;
    },
    findMissileTarget(sourceCar) {
      let bestTarget = null;
      let bestGap = Infinity;

      for (const target of gameState.cars) {
        if (target === sourceCar || target.finished) {
          continue;
        }

        const progressGap = getRankingProgress(target) - getRankingProgress(sourceCar);
        if (progressGap <= 2 || progressGap > 90) {
          continue;
        }

        if (progressGap < bestGap) {
          bestGap = progressGap;
          bestTarget = target;
        }
      }

      return bestTarget;
    },
    launchMissile(sourceCar, target) {
      const missile = this.obtainMissile();
      const forward = getForwardVector(sourceCar.yaw).clone();
      missile.owner = sourceCar;
      missile.target = target;
      missile.direction.copy(forward);
      missile.life = CONFIG.items.missileLifeSeconds;
      missile.mesh.position.copy(sourceCar.mesh.position).addScaledVector(forward, 2.4);
      missile.mesh.position.y = 0.9;
      missile.mesh.visible = true;
      missile.mesh.lookAt(missile.mesh.position.clone().add(forward));
    },
    updateMissiles(dt) {
      for (const missile of this.missiles) {
        if (missile.life <= 0 || !missile.mesh.visible) {
          continue;
        }

        missile.life = Math.max(0, missile.life - dt);
        const target = missile.target;
        if (!target || target.finished) {
          missile.life = 0;
          missile.mesh.visible = false;
          continue;
        }

        const desired = target.mesh.position.clone().sub(missile.mesh.position);
        desired.y = 0;
        const distance = desired.length();
        if (distance < CONFIG.items.missileHitRadius) {
          this.triggerMissileHit(missile, target);
          continue;
        }

        desired.normalize();
        missile.direction.lerp(desired, 1 - Math.exp(-CONFIG.items.missileTurnRate * dt)).normalize();
        missile.mesh.position.addScaledVector(missile.direction, CONFIG.items.missileSpeed * dt);
        missile.mesh.position.y = 0.9;
        missile.mesh.lookAt(missile.mesh.position.clone().add(missile.direction));

        if (missile.life <= 0) {
          missile.mesh.visible = false;
        }
      }
    },
    triggerMissileHit(missile, target) {
      target.slowTimer = Math.max(target.slowTimer, CONFIG.items.missileSlowSeconds);
      target.velocity.multiplyScalar(CONFIG.items.missileSpeedDamping);
      missile.life = 0;
      missile.mesh.visible = false;
      this.spawnBurst(target.mesh.position, 0xffb168);

      if (target.type === "player") {
        setNotice("被导弹命中，车速下降", 1.1);
      }
    },
    deployMine(sourceCar) {
      const mine = this.obtainMine();
      mine.owner = sourceCar;
      mine.life = CONFIG.items.mineLifeSeconds;
      mine.armTimer = CONFIG.items.mineArmSeconds;
      mine.mesh.position.copy(sourceCar.mesh.position);
      mine.mesh.position.y = 0.24;
      mine.mesh.visible = true;
    },
    updateMines(dt) {
      for (const mine of this.mines) {
        if (mine.life <= 0 || !mine.mesh.visible) {
          continue;
        }

        mine.life = Math.max(0, mine.life - dt);
        mine.armTimer = Math.max(0, mine.armTimer - dt);
        mine.mesh.rotation.y += dt * 1.6;
        mine.mesh.position.y = 0.24 + Math.sin(gameState.elapsedTime * 3 + mine.phase) * 0.05;

        if (mine.life <= 0) {
          mine.mesh.visible = false;
          continue;
        }

        if (mine.armTimer > 0) {
          continue;
        }

        for (const car of gameState.cars) {
          if (car === mine.owner || car.finished) {
            continue;
          }

          if (car.mesh.position.distanceTo(mine.mesh.position) > CONFIG.items.mineTriggerRadius) {
            continue;
          }

          car.slowTimer = Math.max(car.slowTimer, CONFIG.items.mineSlowSeconds);
          car.velocity.multiplyScalar(CONFIG.items.mineSpeedDamping);
          mine.life = 0;
          mine.mesh.visible = false;
          this.spawnBurst(mine.mesh.position, 0xff6b74);

          if (car.type === "player") {
            setNotice("踩中地雷，车速骤降", 1.1);
          }
          break;
        }
      }
    },
    triggerShockwave(sourceCar) {
      let hitCount = 0;
      for (const target of gameState.cars) {
        if (target === sourceCar || target.finished) {
          continue;
        }

        const distance = target.mesh.position.distanceTo(sourceCar.mesh.position);
        if (distance > CONFIG.items.shockwaveRadius) {
          continue;
        }

        target.slowTimer = Math.max(target.slowTimer, CONFIG.items.shockwaveSlowSeconds);
        target.velocity.multiplyScalar(0.74);
        hitCount += 1;

        if (target.type === "player") {
          setNotice("被冲击波减速", 1);
        }
      }

      const effect = this.obtainShockwaveEffect();
      effect.mesh.position.copy(sourceCar.mesh.position);
      effect.mesh.position.y = 0.18;
      effect.mesh.scale.setScalar(1);
      effect.mesh.visible = true;
      effect.life = CONFIG.items.shockwaveVisualSeconds;

      if (sourceCar.type === "player" && hitCount === 0) {
        setNotice("冲击波已释放，但没有命中目标", 1);
      }
    },
    spawnBurst(position, color) {
      const effect = this.obtainShockwaveEffect(color);
      effect.mesh.position.copy(position);
      effect.mesh.position.y = 0.18;
      effect.mesh.scale.setScalar(1);
      effect.mesh.visible = true;
      effect.life = CONFIG.items.shockwaveVisualSeconds;
    },
    obtainShockwaveEffect(color = 0x79d8ff) {
      const available = this.shockwaves.find((effect) => effect.life <= 0);
      if (available) {
        available.mesh.material.color.setHex(color);
        available.mesh.material.opacity = 0.5;
        return available;
      }

      const mesh = new THREE.Mesh(
        new THREE.TorusGeometry(2.2, 0.22, 12, 28),
        new THREE.MeshBasicMaterial({
          color,
          transparent: true,
          opacity: 0.5,
        }),
      );
      mesh.rotation.x = Math.PI / 2;
      mesh.visible = false;
      gameState.scene.add(mesh);
      const effect = { mesh, life: 0 };
      this.shockwaves.push(effect);
      return effect;
    },
    obtainMissile() {
      const available = this.missiles.find((missile) => missile.life <= 0);
      if (available) {
        return available;
      }

      const group = new THREE.Group();
      const body = new THREE.Mesh(
        new THREE.CylinderGeometry(0.12, 0.12, 1.2, 10),
        new THREE.MeshStandardMaterial({ color: 0xffb168, emissive: 0x4a2310 }),
      );
      body.rotation.z = Math.PI / 2;
      const nose = new THREE.Mesh(
        new THREE.ConeGeometry(0.22, 0.5, 10),
        new THREE.MeshStandardMaterial({ color: 0xffe3c0, emissive: 0x5a3620 }),
      );
      nose.rotation.z = -Math.PI / 2;
      nose.position.x = 0.84;
      group.add(body, nose);
      group.visible = false;
      gameState.scene.add(group);
      const missile = {
        mesh: group,
        owner: null,
        target: null,
        direction: new THREE.Vector3(0, 0, 1),
        life: 0,
      };
      this.missiles.push(missile);
      return missile;
    },
    obtainMine() {
      const available = this.mines.find((mine) => mine.life <= 0);
      if (available) {
        return available;
      }

      const group = new THREE.Group();
      const base = new THREE.Mesh(
        new THREE.CylinderGeometry(0.65, 0.8, 0.22, 10),
        new THREE.MeshStandardMaterial({ color: 0x3c4654, roughness: 0.8 }),
      );
      const core = new THREE.Mesh(
        new THREE.SphereGeometry(0.22, 10, 10),
        new THREE.MeshStandardMaterial({ color: 0xff6b74, emissive: 0x4b161d }),
      );
      core.position.y = 0.2;
      group.add(base, core);
      group.visible = false;
      gameState.scene.add(group);
      const mine = { mesh: group, owner: null, life: 0, armTimer: 0, phase: Math.random() * Math.PI * 2 };
      this.mines.push(mine);
      return mine;
    },
    createBoxMesh(index) {
      const group = new THREE.Group();
      const outer = new THREE.Mesh(
        new THREE.BoxGeometry(2.2, 2.2, 2.2),
        new THREE.MeshStandardMaterial({
          color: index % 2 === 0 ? 0xffce56 : 0x79d8ff,
          emissive: index % 2 === 0 ? 0x4f3300 : 0x12344f,
          transparent: true,
          opacity: 0.8,
        }),
      );
      const inner = new THREE.Mesh(
        new THREE.BoxGeometry(1.1, 1.1, 1.1),
        new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0x2f2f2f }),
      );
      group.add(outer, inner);
      return group;
    },
    getItemLabel(itemType) {
      if (itemType === "boost") {
        return "加速道具";
      }
      if (itemType === "missile") {
        return "锁定导弹";
      }
      if (itemType === "mine") {
        return "地雷陷阱";
      }
      if (itemType === "shockwave") {
        return "范围冲击波";
      }
      return "无";
    },
  };
}

function createDebugPanel() {
  return {
    visible: false,
    init() {
      ui.debugToggle.addEventListener("click", () => {
        this.visible = !this.visible;
        ui.debugPanel.classList.toggle("hidden", !this.visible);
      });

      this.bindRange(ui.debugMaxSpeed, ui.debugMaxSpeedValue, (value) => {
        CONFIG.playerPhysics.maxSpeed = value;
      }, CONFIG.playerPhysics.maxSpeed, 0);

      this.bindRange(ui.debugAcceleration, ui.debugAccelerationValue, (value) => {
        CONFIG.playerPhysics.acceleration = value;
      }, CONFIG.playerPhysics.acceleration, 0);

      this.bindRange(ui.debugGrip, ui.debugGripValue, (value) => {
        CONFIG.playerPhysics.lateralGrip = value;
        CONFIG.playerPhysics.driftGrip = Math.max(2, value * 0.52);
      }, CONFIG.playerPhysics.lateralGrip, 1);

      this.bindRange(ui.debugDriftFactor, ui.debugDriftFactorValue, (value) => {
        CONFIG.playerPhysics.driftSlideForce = value;
        CONFIG.playerPhysics.driftAssist = value / 48;
        CONFIG.playerPhysics.driftStability = 5.8 + value * 0.15;
      }, CONFIG.playerPhysics.driftSlideForce, 1);
    },
    bindRange(input, valueNode, applyValue, initialValue, digits) {
      input.value = String(initialValue);
      valueNode.textContent = Number(initialValue).toFixed(digits);
      applyValue(Number(initialValue));

      input.addEventListener("input", () => {
        const value = Number(input.value);
        valueNode.textContent = value.toFixed(digits);
        applyValue(value);
      });
    },
  };
}

function createModelSystem() {
  return {
    loader: new GLTFLoader(),
    prototypes: new Map(),
    registeredCars: new Set(),
    initPromise: null,
    ready: false,
    init() {
      if (this.initPromise) {
        return this.initPromise;
      }

      this.initPromise = this.loadAll()
        .then(() => {
          this.ready = true;
          this.populateScene();
          this.refreshRegisteredCars();
        })
        .catch((error) => {
          console.warn("本地模型资源初始化失败，将继续使用几何回退资源。", error);
        });

      return this.initPromise;
    },
    async loadAll() {
      const entries = Object.entries(MODEL_ASSET_CONFIG);
      const results = await Promise.allSettled(
        entries.map(async ([key, config]) => {
          const gltf = await this.loadGLTF(config.path);
          const source = gltf.scene || gltf.scenes?.[0];
          if (!source) {
            throw new Error(`模型 ${key} 没有可用场景节点`);
          }
          this.prototypes.set(key, this.preparePrototype(source, config, key));
        }),
      );

      results.forEach((result, index) => {
        if (result.status === "rejected") {
          const [key] = entries[index];
          console.warn(`模型 ${key} 加载失败，已保留现有几何表现。`, result.reason);
        }
      });
    },
    loadGLTF(path) {
      return new Promise((resolve, reject) => {
        this.loader.load(path, resolve, undefined, reject);
      });
    },
    preparePrototype(source, config, key) {
      if (config.kind === "car") {
        return this.prepareCarPrototype(source, config, key);
      }

      const root = source.clone(true);
      const wrapper = new THREE.Group();
      wrapper.add(root);

      root.traverse((child) => {
        if (child.isLight) {
          child.visible = false;
          return;
        }

        if (!child.isMesh) {
          return;
        }

        child.castShadow = false;
        child.receiveShadow = true;
        const materials = Array.isArray(child.material) ? child.material : [child.material];
        for (const material of materials) {
          if (!material) {
            continue;
          }
          if (config.doubleSide) {
            material.side = THREE.DoubleSide;
          }
        }
      });

      const bounds = new THREE.Box3().setFromObject(wrapper);
      const size = bounds.getSize(new THREE.Vector3());
      const center = bounds.getCenter(new THREE.Vector3());
      root.position.x -= center.x;
      root.position.z -= center.z;
      root.position.y -= bounds.min.y;

      const height = Math.max(size.y, 0.001);
      const span = Math.max(size.x, size.z, 0.001);
      const scaleFactor = config.fit === "span" ? config.target / span : config.target / height;
      wrapper.scale.setScalar(scaleFactor);

      return wrapper;
    },
    prepareCarPrototype(source, config, key) {
      const root = source.clone(true);
      const rig = new THREE.Group();
      const meshNodes = [];

      root.traverse((child) => {
        if (child.isLight) {
          child.visible = false;
          return;
        }

        if (!child.isMesh) {
          return;
        }

        child.castShadow = false;
        child.receiveShadow = true;
        child.geometry = child.geometry.clone();
        this.centerMeshGeometry(child);
        meshNodes.push(child);
      });

      const bodyMeshes = [];
      let rearMesh = null;
      let frontLeftMesh = null;
      let frontRightMesh = null;

      for (const mesh of meshNodes) {
        mesh.removeFromParent();
        const name = mesh.name.toLowerCase();

        if (name.includes("frontleft")) {
          frontLeftMesh = mesh;
          continue;
        }

        if (name.includes("frontright")) {
          frontRightMesh = mesh;
          continue;
        }

        if (name.includes("backwheel") || name.includes("rearwheel")) {
          rearMesh = mesh;
          continue;
        }

        bodyMeshes.push(mesh);
      }

      bodyMeshes.forEach((mesh) => {
        mesh.userData.visualRole = "body";
        rig.add(mesh);
      });

      if (rearMesh) {
        rig.add(this.createWheelRig(rearMesh, "rear-pair").root);
      }
      if (frontLeftMesh) {
        rig.add(this.createWheelRig(frontLeftMesh, "front-left").root);
      }
      if (frontRightMesh) {
        rig.add(this.createWheelRig(frontRightMesh, "front-right").root);
      }

      const wrapper = new THREE.Group();
      wrapper.name = `${key}-wrapper`;
      wrapper.add(rig);

      const bounds = new THREE.Box3().setFromObject(wrapper);
      const size = bounds.getSize(new THREE.Vector3());
      const center = bounds.getCenter(new THREE.Vector3());
      rig.position.x -= center.x;
      rig.position.z -= center.z;
      rig.position.y -= bounds.min.y;

      const height = Math.max(size.y, 0.001);
      const span = Math.max(size.x, size.z, 0.001);
      const scaleFactor = config.fit === "span" ? config.target / span : config.target / height;
      wrapper.scale.setScalar(scaleFactor);

      return wrapper;
    },
    centerMeshGeometry(mesh) {
      mesh.geometry.computeBoundingBox();
      const center = mesh.geometry.boundingBox.getCenter(new THREE.Vector3());
      mesh.geometry.translate(-center.x, -center.y, -center.z);
      mesh.position.copy(center);
    },
    createWheelRig(mesh, role) {
      const basePosition = mesh.position.clone();
      const spinPivot = new THREE.Group();
      spinPivot.name = `${role}-spin`;
      spinPivot.userData.wheelRole = role;
      spinPivot.userData.wheelKind = "spinPivot";
      mesh.position.set(0, 0, 0);
      spinPivot.add(mesh);

      if (role.startsWith("front")) {
        const steerPivot = new THREE.Group();
        steerPivot.name = `${role}-steer`;
        steerPivot.position.copy(basePosition);
        steerPivot.userData.wheelRole = role;
        steerPivot.userData.wheelKind = "steerPivot";
        steerPivot.add(spinPivot);
        return { root: steerPivot, steerPivot, spinPivot };
      }

      spinPivot.position.copy(basePosition);
      return { root: spinPivot, steerPivot: null, spinPivot };
    },
    clearGroup(group) {
      if (!group) {
        return;
      }
      group.clear();
    },
    hasPrototype(key) {
      return this.prototypes.has(key);
    },
    createInstance(key, options = {}) {
      const prototype = this.prototypes.get(key);
      if (!prototype) {
        return null;
      }

      const instance = prototype.clone(true);
      if (options.scale !== undefined) {
        instance.scale.multiplyScalar(options.scale);
      }
      if (options.position) {
        instance.position.copy(options.position);
      }
      if (options.rotationY !== undefined) {
        instance.rotation.y = options.rotationY;
      }
      return instance;
    },
    createCarInstance(key, color, type) {
      const prototype = this.prototypes.get(key);
      if (!prototype) {
        return null;
      }

      const instanceRoot = prototype.clone(true);
      const paintMaterialNames = new Set(MODEL_ASSET_CONFIG[key]?.paintMaterials ?? []);
      const targetColor = new THREE.Color(color);

      instanceRoot.traverse((child) => {
        if (!child.isMesh) {
          return;
        }

        const materials = Array.isArray(child.material)
          ? child.material.map((material) => material.clone())
          : [child.material.clone()];

        child.material = Array.isArray(child.material) ? materials : materials[0];

        for (const material of materials) {
          if (!material) {
            continue;
          }

          if (paintMaterialNames.has(material.name)) {
            material.color.lerp(targetColor, type === "player" ? 0.82 : 0.68);
            if ("emissive" in material && type === "player") {
              material.emissive.copy(targetColor).multiplyScalar(0.12);
            }
          } else if (material.name === "Headlights") {
            material.emissive = new THREE.Color(0xffd8a4);
            material.emissiveIntensity = 0.35;
          } else if (/TailLights/i.test(material.name)) {
            material.emissive = new THREE.Color(0xff4b4b);
            material.emissiveIntensity = 0.28;
          }

          this.captureMaterialState(material);
        }
      });

      const controller = { front: [], rear: [] };
      instanceRoot.traverse((child) => {
        if (child.userData?.wheelKind !== "spinPivot") {
          return;
        }

        const wheel = {
          role: child.userData.wheelRole,
          spinPivot: child,
          steerPivot: child.parent?.userData?.wheelKind === "steerPivot" ? child.parent : null,
        };

        if (wheel.role.startsWith("front")) {
          controller.front.push(wheel);
        } else {
          controller.rear.push(wheel);
        }
      });

      return { root: instanceRoot, controller };
    },
    captureMaterialState(material) {
      if (material.userData?.__carStateCaptured) {
        return;
      }

      material.userData = {
        ...material.userData,
        __carStateCaptured: true,
        baseTransparent: material.transparent,
        baseOpacity: material.opacity,
        baseDepthWrite: material.depthWrite,
        baseColor: "color" in material ? material.color.getHex() : null,
        baseEmissive: "emissive" in material ? material.emissive.getHex() : null,
        baseEmissiveIntensity: "emissiveIntensity" in material ? material.emissiveIntensity : 1,
      };
    },
    resetMaterialState(material) {
      if (!material.userData?.__carStateCaptured) {
        this.captureMaterialState(material);
      }

      material.transparent = material.userData.baseTransparent;
      material.opacity = material.userData.baseOpacity;
      material.depthWrite = material.userData.baseDepthWrite;

      if ("color" in material && material.userData.baseColor !== null) {
        material.color.setHex(material.userData.baseColor);
      }

      if ("emissive" in material && material.userData.baseEmissive !== null) {
        material.emissive.setHex(material.userData.baseEmissive);
      }

      if ("emissiveIntensity" in material) {
        material.emissiveIntensity = material.userData.baseEmissiveIntensity ?? 1;
      }
    },
    registerCar(car) {
      if (!car) {
        return;
      }

      this.registeredCars.add(car);
      if (this.ready) {
        this.attachCarVisual(car);
      }
    },
    refreshRegisteredCars() {
      for (const car of this.registeredCars) {
        this.attachCarVisual(car);
      }
    },
    getCarModelKey(car) {
      if (car.type === "player" || car.type === "ghost") {
        return "sportsSilverCar";
      }

      return CAR_MODEL_VARIANTS[(car.id - 1) % CAR_MODEL_VARIANTS.length];
    },
    attachCarVisual(car) {
      if (!car?.visualModelMount || !car?.fallbackVisual) {
        return;
      }

      car.fallbackVisual.visible = true;
      car.visualWheelController = car.fallbackWheelController;
      car.visualModelKey = null;
      this.clearGroup(car.visualModelMount);

      const modelKey = this.getCarModelKey(car);
      const instance = this.createCarInstance(modelKey, car.baseColor, car.type);
      if (instance) {
        car.fallbackVisual.visible = false;
        car.visualModelMount.add(instance.root);
        car.visualWheelController = instance.controller;
        car.visualModelKey = modelKey;
      }

      this.applyCarMaterialState(car);
      applyCarWheelPose(car);
    },
    applyCarMaterialState(car) {
      const seen = new Set();
      car.mesh.traverse((child) => {
        if (!child.isMesh) {
          return;
        }

        const materials = Array.isArray(child.material) ? child.material : [child.material];
        for (const material of materials) {
          if (!material || seen.has(material)) {
            continue;
          }
          seen.add(material);
          this.resetMaterialState(material);

          if (car.type === "ghost") {
            material.transparent = true;
            material.opacity = 0.34;
            material.depthWrite = false;
            if ("emissive" in material) {
              material.emissive.setHex(0x234868);
            }
          }

          if (car.type === "remote") {
            material.transparent = true;
            material.opacity = 0.72;
            if ("emissive" in material) {
              material.emissive.setHex(0x35265b);
              material.emissiveIntensity = 1.15;
            }
          }
        }
      });
    },
    createTrackPlacement(key, ratio, options = {}) {
      if (!gameState.track) {
        return null;
      }

      const frame = getFrameAtProgress(gameState.track, mod(ratio, 1) * gameState.track.totalLength);
      const side = options.side ?? 1;
      const offset = options.offset ?? gameState.track.halfWidth + 6;
      const position = frame.position.clone().addScaledVector(frame.normal, offset * side);
      position.y = options.y ?? 0;

      let rotationY = options.rotationY;
      if (options.align === "track") {
        rotationY = Math.atan2(frame.tangent.x, frame.tangent.z) + (options.rotationOffsetY ?? 0);
      } else if (options.align === "faceTrack") {
        rotationY =
          Math.atan2(frame.position.x - position.x, frame.position.z - position.z) +
          (options.rotationOffsetY ?? 0);
      }

      return this.createInstance(key, {
        position,
        rotationY,
        scale: options.scale,
      });
    },
    addTrackPlacement(group, key, ratio, options = {}) {
      const instance = this.createTrackPlacement(key, ratio, options);
      if (instance) {
        group.add(instance);
      }
      return instance;
    },
    populateScene() {
      if (!gameState.track || !gameState.world.environmentDecorGroup) {
        return;
      }

      this.clearGroup(gameState.world.environmentDecorGroup);
      this.clearGroup(gameState.track.decorationGroup);

      this.populateNature();
      this.populateTrackDecorations();
      this.refreshRegisteredCars();

      if (this.hasPrototype("tree") && gameState.world.fallbackTreesGroup) {
        gameState.world.fallbackTreesGroup.visible = false;
      }
    },
    populateNature() {
      const group = gameState.world.environmentDecorGroup;
      if (!group) {
        return;
      }

      if (this.hasPrototype("tree")) {
        const count = 24;
        for (let index = 0; index < count; index += 1) {
          const angle = (index / count) * Math.PI * 2 + (stableNoise(index + 11) - 0.5) * 0.18;
          const radius = 146 + (index % 4) * 10 + stableNoise(index + 21) * 6;
          const position = new THREE.Vector3(
            Math.cos(angle) * radius,
            0,
            Math.sin(angle) * radius,
          );
          const tree = this.createInstance("tree", {
            position,
            rotationY: stableNoise(index + 31) * Math.PI * 2,
            scale: 0.92 + stableNoise(index + 47) * 0.52,
          });
          if (tree) {
            group.add(tree);
          }
        }
      }

      if (this.hasPrototype("flowerBushes")) {
        const outerBushRatios = [0.04, 0.11, 0.19, 0.27, 0.36, 0.44, 0.55, 0.63, 0.71, 0.82, 0.9];
        outerBushRatios.forEach((ratio, index) => {
          this.addTrackPlacement(group, "flowerBushes", ratio, {
            side: index % 3 === 0 ? -1 : 1,
            offset: gameState.track.halfWidth + 8 + (index % 3),
            align: "faceTrack",
            rotationOffsetY: (stableNoise(index + 71) - 0.5) * 0.8,
            scale: 0.76 + stableNoise(index + 83) * 0.48,
          });
        });
      }
    },
    populateTrackDecorations() {
      const group = gameState.track?.decorationGroup;
      if (!group) {
        return;
      }

      this.populateStreetlights(group);
      this.populateGrandstands(group);
      this.populateBillboards(group);
      this.populateBarrierDecor(group);
      this.populateConeDecor(group);
      this.populateFinishDecor(group);
    },
    populateStreetlights(group) {
      if (!this.hasPrototype("streetlight")) {
        return;
      }

      const placements = [0.04, 0.1, 0.16, 0.31, 0.37, 0.53, 0.59, 0.65, 0.8, 0.86, 0.93];
      placements.forEach((ratio, index) => {
        this.addTrackPlacement(group, "streetlight", ratio, {
          side: 1,
          offset: gameState.track.halfWidth + 11.5 + (index % 2) * 2,
          align: "track",
          scale: 0.95 + stableNoise(index + 101) * 0.16,
        });
      });
    },
    populateGrandstands(group) {
      if (!this.hasPrototype("sportsStands")) {
        return;
      }

      const placements = [0.09, 0.59];
      placements.forEach((ratio, index) => {
        this.addTrackPlacement(group, "sportsStands", ratio, {
          side: 1,
          offset: gameState.track.halfWidth + 34,
          align: "faceTrack",
          scale: 1 + index * 0.04,
        });
      });
    },
    populateBillboards(group) {
      if (!this.hasPrototype("menuBillboard")) {
        return;
      }

      const placements = [0.18, 0.34, 0.68, 0.84];
      placements.forEach((ratio, index) => {
        this.addTrackPlacement(group, "menuBillboard", ratio, {
          side: 1,
          offset: gameState.track.halfWidth + 16 + (index % 2) * 3,
          align: "faceTrack",
          scale: 0.96 + stableNoise(index + 131) * 0.18,
        });
      });
    },
    populateBarrierDecor(group) {
      if (!this.hasPrototype("barrierLarge")) {
        return;
      }

      const placements = [0.2, 0.24, 0.45, 0.49, 0.7, 0.74, 0.95, 0.99];
      placements.forEach((ratio, index) => {
        this.addTrackPlacement(group, "barrierLarge", ratio, {
          side: 1,
          offset: gameState.track.halfWidth + 2.1,
          align: "track",
          scale: 0.92 + stableNoise(index + 151) * 0.18,
        });
      });
    },
    populateConeDecor(group) {
      if (!this.hasPrototype("roadCone")) {
        return;
      }

      const coneGroups = [
        { baseRatio: 0.012, count: 4, spacing: 0.008, side: 1, offset: gameState.track.halfWidth + 1.4 },
        { baseRatio: 0.238, count: 3, spacing: 0.007, side: -1, offset: gameState.track.halfWidth + 1.2 },
        { baseRatio: 0.492, count: 3, spacing: 0.007, side: 1, offset: gameState.track.halfWidth + 1.2 },
        { baseRatio: 0.744, count: 3, spacing: 0.007, side: -1, offset: gameState.track.halfWidth + 1.2 },
      ];

      coneGroups.forEach((coneGroup, groupIndex) => {
        for (let index = 0; index < coneGroup.count; index += 1) {
          this.addTrackPlacement(group, "roadCone", coneGroup.baseRatio + index * coneGroup.spacing, {
            side: coneGroup.side,
            offset: coneGroup.offset + (index % 2) * 0.5,
            align: "track",
            scale: 0.96 + stableNoise(groupIndex * 10 + index + 181) * 0.1,
          });
        }
      });
    },
    populateFinishDecor(group) {
      if (this.hasPrototype("banner")) {
        const bannerPlacements = [
          { ratio: 0.0, side: 1, offset: gameState.track.halfWidth + 13.5, scale: 1.12 },
          { ratio: 0.5, side: 1, offset: gameState.track.halfWidth + 10.5, scale: 1 },
        ];
        bannerPlacements.forEach((placement) => {
          this.addTrackPlacement(group, "banner", placement.ratio, {
            side: placement.side,
            offset: placement.offset,
            align: "track",
            scale: placement.scale,
          });
        });
      }

      if (this.hasPrototype("raceFlag")) {
        const flagPlacements = [
          { ratio: 0.986, side: 1, offset: gameState.track.halfWidth + 8.5 },
          { ratio: 0.024, side: 1, offset: gameState.track.halfWidth + 8.5 },
          { ratio: 0.478, side: 1, offset: gameState.track.halfWidth + 8.5 },
          { ratio: 0.524, side: 1, offset: gameState.track.halfWidth + 8.5 },
        ];
        flagPlacements.forEach((placement, index) => {
          this.addTrackPlacement(group, "raceFlag", placement.ratio, {
            side: placement.side,
            offset: placement.offset,
            align: "faceTrack",
            scale: 0.96 + stableNoise(index + 221) * 0.1,
          });
        });
      }
    },
  };
}

// 根据当前难度重新生成 AI 阵容，避免不同难度只是简单改一个数字。
function rebuildAIField() {
  for (const car of gameState.aiCars) {
    gameState.scene.remove(car.mesh);
  }

  const preset = gameState.difficultyConfig ?? CONFIG.difficulties.expert;
  const colors = [0xff576d, 0x4db8ff, 0xffcc4d, 0x74f0a7, 0xb08cff, 0xff7fb2, 0x62e5d7];
  const aiCars = [];
  const aiCount = onlineSystem.isOnlineMode() ? 0 : preset.aiCount;

  for (let index = 0; index < aiCount; index += 1) {
    const car = createCar("ai", colors[index % colors.length], buildAIName(index));
    car.aiSettings = buildAISettings(preset, index);
    car.physicsProfile = buildAIPhysicsProfile(preset, index);
    aiCars.push(car);
    gameState.scene.add(car.mesh);
  }

  gameState.aiCars = aiCars;
  gameState.cars = [gameState.player, ...aiCars];
}

function buildAIName(index) {
  const baseName = CONFIG.names.ai[index % CONFIG.names.ai.length];
  const suffix = index >= CONFIG.names.ai.length ? ` ${index + 1}` : "";
  return `${baseName} AI${suffix}`;
}

function buildAISettings(preset, index) {
  const laneOffsets = [-4.6, 4.6, -7.4, 7.4, -2.2, 2.2, 0];
  return {
    lookAhead: preset.lookAheadBase + (index % 3),
    laneOffset: laneOffsets[index % laneOffsets.length] * preset.laneBias,
    maxSpeed: preset.maxSpeedBase + index * preset.maxSpeedStep,
    minCornerSpeed: preset.cornerSpeedBase + index * 0.8,
  };
}

function buildAIPhysicsProfile(preset, index) {
  const scale = preset.accelerationScale + index * 0.03;
  const maxSpeed = preset.maxSpeedBase + index * preset.maxSpeedStep + 2;
  return {
    ...CONFIG.aiPhysics,
    maxSpeed,
    acceleration: CONFIG.aiPhysics.acceleration * scale,
    braking: CONFIG.aiPhysics.braking * (0.96 + scale * 0.08),
    coastDrag: Math.max(1.35, CONFIG.aiPhysics.coastDrag - (scale - 1) * 0.3),
  };
}

function setupInput() {
  const onKey = (event, pressed) => {
    const trackedKeys = [
      "ArrowUp",
      "ArrowDown",
      "ArrowLeft",
      "ArrowRight",
      "Space",
      "KeyW",
      "KeyA",
      "KeyS",
      "KeyD",
      "KeyC",
      "KeyR",
      "KeyF",
    ];

    if (trackedKeys.includes(event.code)) {
      event.preventDefault();
    }

    if (event.code === "KeyW" || event.code === "ArrowUp") {
      inputState.accelerate = pressed;
    }
    if (event.code === "KeyS" || event.code === "ArrowDown") {
      inputState.brake = pressed;
    }
    if (event.code === "KeyA" || event.code === "ArrowLeft") {
      inputState.left = pressed;
    }
    if (event.code === "KeyD" || event.code === "ArrowRight") {
      inputState.right = pressed;
    }
    if (event.code === "Space") {
      inputState.drift = pressed;
    }

    if (!pressed || event.repeat) {
      return;
    }

    if (event.code === "KeyC") {
      gameState.currentCameraIndex =
        (gameState.currentCameraIndex + 1) % CONFIG.cameraModes.length;
      setNotice(`已切换到${CONFIG.cameraModes[gameState.currentCameraIndex].label}`, 1.2);
      renderHUD();
    }

    if (event.code === "KeyR" && gameState.status === "running") {
      resetCarToCheckpoint(gameState.player, "手动复位");
    }

    if (event.code === "KeyF" && gameState.status === "running") {
      itemSystem.useItem(gameState.player);
    }
  };

  window.addEventListener("keydown", (event) => onKey(event, true));
  window.addEventListener("keyup", (event) => onKey(event, false));
}

function startCountdown() {
  rebuildAIField();
  resetRace();
  onlineSystem.prepareRoomRace();
  ghostSystem.prepareForRace();
  itemSystem.resetForRace();
  gameState.status = "countdown";
  gameState.countdownRemaining = CONFIG.countdownSeconds + CONFIG.countdownLead;
  ui.hud.classList.remove("hidden");
  ui.countdown.classList.remove("hidden");
  ui.countdown.textContent = String(CONFIG.countdownSeconds);
  setNotice("准备发车", 0.9);
}

function resetRace() {
  gameState.status = "start";
  gameState.elapsedTime = 0;
  gameState.countdownRemaining = 0;
  gameState.results = [];
  gameState.noticeText = "等待开始";
  gameState.noticeTimer = 0;
  saveSystem.prepareForRace();

  const spawnSetups = buildSpawnSetups(gameState.cars.length);

  gameState.cars.forEach((car, index) => {
    const spawn = spawnSetups[index];
    placeCarOnTrack(car, spawn.progress, spawn.laneOffset);
  });

  ghostSystem.resetPlayback();
  computeRanking();
}

// 主循环负责驱动状态机、物理更新、镜头和平视 HUD。
function animate() {
  requestAnimationFrame(animate);

  const dt = Math.min(gameState.clock.getDelta(), 0.05);
  updateGame(dt);
  updateCamera(dt);
  renderHUD();
  minimapSystem.render();
  gameState.renderer.render(gameState.scene, gameState.camera);
}

function updateGame(dt) {
  if (gameState.noticeTimer > 0) {
    gameState.noticeTimer = Math.max(0, gameState.noticeTimer - dt);
  }

  soundSystem.update(dt);
  onlineSystem.update(dt);

  if (gameState.status === "countdown") {
    updateCountdown(dt);
    return;
  }

  if (gameState.status !== "running") {
    return;
  }

  gameState.elapsedTime += dt;
  itemSystem.update(dt);
  ghostSystem.update(dt);

  updatePlayerCar(dt, inputState);

  if (gameState.status !== "running") {
    return;
  }

  for (const car of gameState.aiCars) {
    updateAICar(dt, car, gameState.track);
  }

  resolveCarCollisions();

  for (const car of gameState.cars) {
    finalizeCarStep(car, dt);

    if (car.type === "ai") {
      updateAIRecovery(car, dt);
    }

    if (gameState.status !== "running") {
      return;
    }
  }

  itemSystem.handlePickups();
  itemSystem.updateAIUsage(dt);
  ghostSystem.recordFrame(gameState.player, gameState.elapsedTime);
  computeRanking();
}

function updateCountdown(dt) {
  gameState.countdownRemaining -= dt;

  if (gameState.countdownRemaining > CONFIG.countdownLead) {
    ui.countdown.textContent = String(Math.ceil(gameState.countdownRemaining - CONFIG.countdownLead));
    return;
  }

  if (gameState.countdownRemaining > 0) {
    ui.countdown.textContent = "开始";
    return;
  }

  ui.countdown.classList.add("hidden");
  gameState.status = "running";
  setNotice("比赛中", 1);
}

function updatePlayerCar(dt, input) {
  const control = {
    throttle: input.accelerate,
    brake: input.brake,
    // 追尾镜头下，屏幕右转对应负偏航，因此玩家输入要与 AI 的世界坐标转向分开处理。
    steer: (input.left ? 1 : 0) + (input.right ? -1 : 0),
    drift: input.drift,
  };

  simulateCarPhysics(gameState.player, control, dt, CONFIG.playerPhysics);
}

function updateAICar(dt, car, track) {
  if (car.finished) {
    return;
  }

  // AI 使用前瞻点跟随赛道中心线，并根据前方弯曲程度主动降速。
  const frame = getFrameAtProgress(
    track,
    mod(car.absoluteProgress + car.aiSettings.lookAhead, track.totalLength),
  );
  const futureFrame = getFrameAtProgress(
    track,
    mod(car.absoluteProgress + car.aiSettings.lookAhead + 10, track.totalLength),
  );
  const targetPosition = frame.position.clone().addScaledVector(frame.normal, car.aiSettings.laneOffset);
  const desiredDirection = targetPosition.sub(car.mesh.position);
  const desiredYaw = Math.atan2(desiredDirection.x, desiredDirection.z);
  const headingError = wrapAngle(desiredYaw - car.yaw);
  const bendAmount = 1 - clamp(frame.tangent.dot(futureFrame.tangent), -1, 1);

  const targetSpeed =
    car.aiSettings.maxSpeed -
    bendAmount * (car.aiSettings.maxSpeed - car.aiSettings.minCornerSpeed) -
    Math.abs(headingError) * 9;

  const speed = getForwardSpeed(car);
  const control = {
    throttle: speed < targetSpeed - 1,
    brake: speed > targetSpeed + 2,
    steer: clamp(headingError / 0.75, -1, 1),
    drift: false,
  };

  simulateCarPhysics(car, control, dt, car.physicsProfile ?? CONFIG.aiPhysics);
}

// 所有车辆完成本帧运动后，再统一结算碰撞、赛道投影和圈数进度。
function finalizeCarStep(car, dt) {
  syncCarToTrack(car);
  enforceTrackRules(car, dt);
  updateRaceProgress(car);
}

function updateAIRecovery(car, dt) {
  if (car.finished) {
    return;
  }

  const settledSpeed = Math.abs(getForwardSpeed(car));
  if (Math.abs(car.progressDelta) < 0.03 && settledSpeed < 5) {
    car.stuckTime += dt;
  } else {
    car.stuckTime = 0;
  }

  if (car.stuckTime > 1.8 && car.resetCooldown <= 0) {
    resetCarToCheckpoint(car, "");
    car.stuckTime = 0;
  }
}

// 车辆之间使用简化圆形碰撞体，既能挡住穿模，也能保留街机感的碰撞反馈。
function resolveCarCollisions() {
  const activeCars = gameState.cars.filter((car) => !car.finished);

  for (let iteration = 0; iteration < CONFIG.collision.iterations; iteration += 1) {
    for (let leftIndex = 0; leftIndex < activeCars.length; leftIndex += 1) {
      const leftCar = activeCars[leftIndex];

      for (let rightIndex = leftIndex + 1; rightIndex < activeCars.length; rightIndex += 1) {
        const rightCar = activeCars[rightIndex];
        const delta = rightCar.mesh.position.clone().sub(leftCar.mesh.position);
        delta.y = 0;

        const minDistance = leftCar.collisionRadius + rightCar.collisionRadius;
        const distanceSquared = delta.lengthSq();
        if (distanceSquared >= minDistance * minDistance) {
          continue;
        }

        let distance = Math.sqrt(distanceSquared);
        if (distance < 0.0001) {
          delta.set(1, 0, 0);
          distance = 1;
        }

        const normal = delta.multiplyScalar(1 / distance);
        const overlap = minDistance - distance;
        leftCar.mesh.position.addScaledVector(normal, -overlap * 0.5);
        rightCar.mesh.position.addScaledVector(normal, overlap * 0.5);

        const relativeSpeed = rightCar.velocity.clone().sub(leftCar.velocity).dot(normal);
        if (relativeSpeed < 0) {
          if (Math.abs(relativeSpeed) >= CONFIG.audio.collisionThreshold) {
            soundSystem.playCollision(Math.abs(relativeSpeed));
          }
          const impulse = (-(1 + CONFIG.collision.restitution) * relativeSpeed) / 2;
          leftCar.velocity.addScaledVector(normal, -impulse);
          rightCar.velocity.addScaledVector(normal, impulse);
        }

        leftCar.velocity.multiplyScalar(CONFIG.collision.speedDamping);
        rightCar.velocity.multiplyScalar(CONFIG.collision.speedDamping);
        applyCarVisualTransform(leftCar);
        applyCarVisualTransform(rightCar);
      }
    }
  }
}

// 玩家与 AI 共用同一套街机物理，只是参数不同。
function simulateCarPhysics(car, control, dt, physics) {
  if (car.finished) {
    car.velocity.multiplyScalar(Math.max(0, 1 - dt * 5));
    updateCarVisualAnimation(car, dt);
    applyCarVisualTransform(car);
    return;
  }

  car.resetCooldown = Math.max(0, car.resetCooldown - dt);

  const forward = getForwardVector(car.yaw, tempVectors.forward);
  const right = getRightVector(car.yaw, tempVectors.right);
  let forwardSpeed = car.velocity.dot(forward);
  let lateralSpeed = car.velocity.dot(right);
  const slowFactor = car.slowTimer > 0 ? CONFIG.items.shockwaveSlowFactor : 1;
  const speedRatio = clamp(Math.abs(forwardSpeed) / physics.maxSpeed, 0, 1.25);
  const steeringAmount =
    control.steer *
    physics.steeringPower *
    (1.05 - speedRatio * physics.steeringFalloff) *
    (control.drift ? physics.driftTurnBoost : 1);

  car.steering = lerp(car.steering, steeringAmount, dt * 8);

  if (Math.abs(forwardSpeed) > 0.2) {
    car.yaw += car.steering * dt * (0.42 + Math.abs(forwardSpeed) * 0.035);
  }

  if (control.throttle) {
    forwardSpeed += physics.acceleration * slowFactor * dt;
  }

  if (control.brake) {
    if (forwardSpeed > -1) {
      forwardSpeed -= physics.braking * slowFactor * dt;
    } else {
      forwardSpeed -= physics.reverseAcceleration * slowFactor * dt;
    }
  }

  if (!control.throttle && !control.brake) {
    forwardSpeed *= Math.max(0, 1 - physics.coastDrag * dt);
  }

  if (control.drift && Math.abs(forwardSpeed) > physics.minDriftSpeed) {
    // 漂移时给一个“跟手但不暴走”的目标侧滑量，降低纯数值滑飞的风险。
    lateralSpeed += control.steer * physics.driftSlideForce * dt;
    forwardSpeed *= Math.max(0, 1 - physics.handbrakeDrag * dt);

    const desiredSlip =
      control.steer *
      Math.min(Math.abs(forwardSpeed) * physics.driftAssist, physics.driftSlipCap);
    lateralSpeed = lerp(lateralSpeed, desiredSlip, dt * physics.driftStability);

    if (control.throttle) {
      forwardSpeed += physics.driftThrottleBonus * dt;
    }
  }

  const lateralGrip = control.drift ? physics.driftGrip : physics.lateralGrip;
  lateralSpeed *= Math.max(0, 1 - lateralGrip * dt);

  const drag = Math.abs(forwardSpeed) * physics.airDrag * dt;
  forwardSpeed -= Math.sign(forwardSpeed) * Math.min(Math.abs(forwardSpeed), drag * Math.abs(forwardSpeed));

  if (car.boostTimer > 0) {
    forwardSpeed += physics.boostAcceleration * dt;
    car.boostTimer = Math.max(0, car.boostTimer - dt);
  }

  if (car.itemBoostTimer > 0) {
    forwardSpeed += CONFIG.items.boostAcceleration * dt;
    car.itemBoostTimer = Math.max(0, car.itemBoostTimer - dt);
  }

  const drifting =
    control.drift &&
    Math.abs(forwardSpeed) > physics.minDriftSpeed &&
    Math.abs(lateralSpeed) > 2.2;

  if (drifting && physics.driftChargeRate > 0) {
    const chargeGain =
      physics.driftChargeRate *
      dt *
      (0.75 + clamp(Math.abs(lateralSpeed) / 10, 0, 1) * 0.5);
    car.driftCharge = clamp(car.driftCharge + chargeGain, 0, physics.maxDriftCharge);
  }

  if (!control.drift && car.wasDrifting && car.driftCharge >= physics.minBoostCharge) {
    const chargeRatio = car.driftCharge / physics.maxDriftCharge;
    car.boostTimer = physics.boostBaseDuration + physics.boostExtraDuration * chargeRatio;
    setNotice("漂移增压已触发", 1);
    car.driftCharge = 0;
  } else if (!drifting && !control.drift) {
    car.driftCharge = Math.max(0, car.driftCharge - dt * 8);
  }

  car.wasDrifting = drifting;

  const topSpeedBonus =
    (car.boostTimer > 0 ? physics.boostTopSpeedBonus : 0) +
    (car.itemBoostTimer > 0 ? CONFIG.items.boostTopSpeedBonus : 0);
  forwardSpeed = clamp(
    forwardSpeed,
    -physics.maxReverseSpeed,
    physics.maxSpeed * slowFactor + topSpeedBonus,
  );

  if (!control.throttle && !control.brake && Math.abs(forwardSpeed) < 0.12) {
    forwardSpeed = 0;
  }

  if (Math.abs(lateralSpeed) < 0.06) {
    lateralSpeed = 0;
  }

  car.velocity.copy(forward).multiplyScalar(forwardSpeed).addScaledVector(right, lateralSpeed);
  car.mesh.position.addScaledVector(car.velocity, dt);
  updateCarVisualAnimation(car, dt);
  applyCarVisualTransform(car);
}

// 通过投影到中心线来得到车辆在赛道上的纵向进度与横向偏移。
function syncCarToTrack(car) {
  const projection = projectPointToTrack(gameState.track, car.mesh.position);
  let delta = projection.progress - car.trackProgress;

  if (delta > gameState.track.totalLength / 2) {
    delta -= gameState.track.totalLength;
  } else if (delta < -gameState.track.totalLength / 2) {
    delta += gameState.track.totalLength;
  }

  car.trackProgress = projection.progress;
  car.absoluteProgress += delta;
  car.progressDelta = delta;
  car.trackProjection = projection;
}

function enforceTrackRules(car, dt) {
  const maxLateral = gameState.track.halfWidth - (gameState.trackConfig?.resetMargin ?? CONFIG.trackDefaults.resetMargin);
  if (Math.abs(car.trackProjection.lateralDistance) > maxLateral && car.resetCooldown <= 0) {
    resetCarToCheckpoint(car, "驶出赛道，已自动复位");
    return;
  }

  if (car.type !== "player" || car.finished) {
    return;
  }

  const forwardSpeed = getForwardSpeed(car);
  if (car.progressDelta < -0.35 && forwardSpeed > 6) {
    car.wrongWayTime += dt;
  } else {
    car.wrongWayTime = Math.max(0, car.wrongWayTime - dt * 2);
  }

  if (car.wrongWayTime >= CONFIG.wrongWayResetSeconds && car.resetCooldown <= 0) {
    resetCarToCheckpoint(car, "逆行过久，已自动复位");
  }
}

// 计圈采用“顺序检查点 + 起终线”的双重约束，避免抄近道偷圈。
function updateRaceProgress(car) {
  if (!car.trackProjection || car.finished) {
    return;
  }

  const lapBase = car.completedLaps * gameState.track.totalLength;

  if (car.progressDelta > 0) {
    while (
      car.nextCheckpointIndex < gameState.track.checkpoints.length &&
      car.absoluteProgress >= lapBase + gameState.track.checkpoints[car.nextCheckpointIndex].progress
    ) {
      car.nextCheckpointIndex += 1;
      saveRespawnState(car);
    }

    if (
      car.nextCheckpointIndex >= gameState.track.checkpoints.length &&
      car.absoluteProgress >= (car.completedLaps + 1) * gameState.track.totalLength
    ) {
      completeLap(car);
    }
  }
}

function completeLap(car) {
  car.completedLaps += 1;
  car.lapTimes.push(gameState.elapsedTime - car.lapStartTime);
  car.lapStartTime = gameState.elapsedTime;
  car.nextCheckpointIndex = 0;
  saveRespawnState(car);

  if (car.completedLaps >= CONFIG.totalLaps) {
    car.finished = true;
    car.finishTime = gameState.elapsedTime;
    car.velocity.set(0, 0, 0);
    computeRanking();

    if (car.type === "player") {
      finishRace();
    }
  }
}

function finishRace() {
  gameState.status = "finished";
  for (const car of gameState.cars) {
    car.velocity.set(0, 0, 0);
  }
  ghostSystem.finishRun(gameState.player);
  saveSystem.updateRecords(gameState.player);
  onlineSystem.finishRace(gameState.player);
  computeRanking();
  gameState.results = [...gameState.standings];
  ui.resultScreen.classList.remove("hidden");
  ui.resultScreen.classList.add("visible");
  showResults();
}

// 排名严格遵循：完成圈数 > 检查点 > 当前赛段进度 > 完赛时间。
function computeRanking() {
  gameState.standings = [...gameState.cars, ...gameState.remoteCars].sort((left, right) => {
    if (left.finished && right.finished && left.finishTime !== right.finishTime) {
      return left.finishTime - right.finishTime;
    }

    if (left.completedLaps !== right.completedLaps) {
      return right.completedLaps - left.completedLaps;
    }

    if (left.nextCheckpointIndex !== right.nextCheckpointIndex) {
      return right.nextCheckpointIndex - left.nextCheckpointIndex;
    }

    const progressGap = getRankingProgress(right) - getRankingProgress(left);
    if (Math.abs(progressGap) > 0.01) {
      return progressGap;
    }

    if (left.finished !== right.finished) {
      return left.finished ? -1 : 1;
    }

    return left.id - right.id;
  });

  gameState.standings.forEach((car, index) => {
    car.rank = index + 1;
  });
}

function getRankingProgress(car) {
  if (car.finished) {
    return CONFIG.totalLaps * gameState.track.totalLength;
  }
  return car.completedLaps * gameState.track.totalLength + car.trackProgress;
}

function renderHUD() {
  const player = gameState.player;
  if (!player) {
    return;
  }

  const currentLap = player.finished ? CONFIG.totalLaps : Math.min(CONFIG.totalLaps, player.completedLaps + 1);
  const lapText = `${currentLap} / ${CONFIG.totalLaps}`;
  const totalOpponents = gameState.standings.length > 0 ? gameState.standings.length : gameState.cars.length;
  const positionText = `第 ${player.rank} / ${totalOpponents} 名`;
  const speedKmh = Math.round(player.velocity.length() * 3.6);
  const speedText = `${speedKmh} km/h`;
  const timeText = formatTime(gameState.elapsedTime);
  const itemText = itemSystem.getItemLabel(player.currentItem);
  const boostText = getBoostLabel(player);
  const statusText = getStatusLabel(player);
  const boostActive = player.boostTimer > 0 || player.itemBoostTimer > 0;
  const driftActive = player.wasDrifting;
  const timeSecond = Math.floor(gameState.elapsedTime);
  const speedBucket = Math.floor(speedKmh / 18);

  ui.lapValue.textContent = lapText;
  ui.positionValue.textContent = positionText;
  ui.speedValue.textContent = speedText;
  ui.timeValue.textContent = timeText;
  ui.cameraValue.textContent = CONFIG.cameraModes[gameState.currentCameraIndex].label;
  ui.itemValue.textContent = itemText;
  ui.boostValue.textContent = boostText;
  ui.difficultyValue.textContent = gameState.difficultyConfig?.label ?? "进阶";
  ui.weatherValue.textContent = gameState.weatherConfig?.label ?? "白天";
  ui.trackValue.textContent = gameState.trackConfig?.label ?? "霓虹环线";
  ui.modeValue.textContent = onlineSystem.isOnlineMode() ? "在线" : "单机";
  ui.roomValue.textContent = onlineSystem.isOnlineMode() ? (onlineSystem.room.roomId || "等待加入") : "无";
  ui.statusValue.textContent = statusText;
  ui.statusValue.dataset.tone = getStatusTone(player, boostActive, driftActive);
  if (ui.hudSupportText) {
    ui.hudSupportText.textContent =
      gameState.trackConfig?.supportText ?? "保持稳定路线，尽量减少无效打滑。";
  }

  ui.hud.classList.toggle("is-drifting", driftActive);
  ui.hud.classList.toggle("is-boosting", boostActive);

  setSpeedVisuals(speedKmh);

  if (hudVisualState.lapText !== lapText) {
    pulseUIElement(ui.lapValue, "ui-value-pop");
    hudVisualState.lapText = lapText;
  }

  if (hudVisualState.rank !== player.rank) {
    pulseUIElement(ui.positionValue, "ui-rank-pop");
    pulseUIElement(ui.hudRaceCard, "ui-status-pop");
    hudVisualState.rank = player.rank;
  }

  if (hudVisualState.speedBucket !== speedBucket) {
    pulseUIElement(ui.speedValue, "ui-value-pop");
    hudVisualState.speedBucket = speedBucket;
  }

  if (hudVisualState.timeSecond !== timeSecond) {
    pulseUIElement(ui.timeValue, "ui-value-pop");
    hudVisualState.timeSecond = timeSecond;
  }

  if (hudVisualState.itemLabel !== itemText) {
    pulseUIElement(ui.itemValue, "ui-status-pop");
    hudVisualState.itemLabel = itemText;
  }

  if (hudVisualState.boostLabel !== boostText) {
    pulseUIElement(ui.boostValue, "ui-status-pop");
    hudVisualState.boostLabel = boostText;
  }

  if (hudVisualState.statusText !== statusText) {
    pulseUIElement(ui.statusValue, "ui-status-pop");
    hudVisualState.statusText = statusText;
  }

  if (boostActive && !hudVisualState.boostActive) {
    pulseUIElement(ui.hudSpeedCard, "boost-burst");
    pulseUIElement(ui.speedValue, "ui-rank-pop");
  }

  hudVisualState.boostActive = boostActive;
  hudVisualState.driftActive = driftActive;
}

function showResults() {
  const player = gameState.player;
  ui.resultTitle.textContent = `你获得了第 ${player.rank} 名`;
  ui.resultSummary.textContent =
    `${gameState.trackConfig?.label ?? "霓虹环线"} · ${gameState.difficultyConfig?.label ?? "进阶"}难度 · ${gameState.weatherConfig?.label ?? "白天"}环境，总用时 ` +
    `${formatTime(player.finishTime || gameState.elapsedTime)}，本场共有 ${gameState.standings.length || gameState.cars.length} 辆赛车。`;
  ui.recordBestTotal.textContent = `最佳总成绩：${saveSystem.getBestTotalLabel()}`;
  ui.recordBestLap.textContent = `最快单圈：${saveSystem.getBestLapLabel()}`;
  ui.recordFlags.textContent = saveSystem.getRecordFlagText();
  saveSystem.renderBoards();
  onlineSystem.renderResultBoard();

  ui.resultList.innerHTML = "";
  for (const car of gameState.results) {
    const item = document.createElement("li");
    item.className = "result-item";
    if (car === player) {
      item.classList.add("is-player");
    }
    if (car.rank === 1) {
      item.classList.add("is-first");
    }

    const suffix = car.finished
      ? `完赛时间 ${formatTime(car.finishTime)}`
      : `停留在第 ${Math.min(CONFIG.totalLaps, car.completedLaps + 1)} 圈`;
    const badge = document.createElement("span");
    badge.className = "result-rank-badge";
    badge.textContent = car.rank === 1 ? "冠军" : `第 ${car.rank} 名`;

    const main = document.createElement("div");
    main.className = "result-item-main";

    const name = document.createElement("strong");
    name.className = "result-item-name";
    name.textContent = car.label;

    const meta = document.createElement("span");
    meta.className = "result-item-meta";
    meta.textContent = suffix;

    const tag = document.createElement("span");
    tag.className = "result-item-tag";
    tag.textContent =
      car === player
        ? "玩家"
        : car.type === "remote"
          ? "联机"
          : car.rank === 1
            ? "头名"
            : "对手";

    main.append(name, meta);
    item.append(badge, main, tag);
    ui.resultList.appendChild(item);
  }

  ui.lapTimeList.innerHTML = "";
  const bestLap = player.lapTimes.length > 0 ? Math.min(...player.lapTimes) : null;
  player.lapTimes.forEach((lapTime, index) => {
    const item = document.createElement("li");
    item.className = "lap-time-item";

    const badge = document.createElement("span");
    badge.className = "lap-time-badge";
    badge.textContent = `第 ${index + 1} 圈`;

    const main = document.createElement("div");
    main.className = "lap-time-main";

    const title = document.createElement("strong");
    title.className = "lap-time-title";
    title.textContent = formatTime(lapTime);

    const meta = document.createElement("span");
    meta.className = "lap-time-meta";
    meta.textContent = bestLap !== null && lapTime === bestLap ? "本场最快单圈" : "保持节奏推进";

    main.append(title, meta);
    item.append(badge, main);
    ui.lapTimeList.appendChild(item);
  });
}

function updateCamera(dt) {
  const player = gameState.player;
  if (!player) {
    return;
  }

  const mode = CONFIG.cameraModes[gameState.currentCameraIndex];
  const forward = getForwardVector(player.yaw, tempVectors.forward);
  const right = getRightVector(player.yaw, tempVectors.right);
  const desiredPosition = tempVectors.cameraTarget
    .copy(player.mesh.position)
    .addScaledVector(right, mode.offset.x)
    .addScaledVector(forward, mode.offset.z);

  desiredPosition.y += mode.offset.y;
  const positionLerp = 1 - Math.exp(-mode.followSharpness * dt);
  gameState.camera.position.lerp(desiredPosition, positionLerp);

  const lookTarget = tempVectors.lookAt
    .copy(player.mesh.position)
    .addScaledVector(forward, mode.lookAhead);
  lookTarget.y += mode.lookHeight;

  const lookLerp = 1 - Math.exp(-mode.lookSharpness * dt);
  gameState.cameraLookTarget.lerp(lookTarget, lookLerp);
  gameState.camera.lookAt(gameState.cameraLookTarget);
}

// 赛道几何使用圆角矩形闭环，既稳定又适合简单 AI 路径跟随。
function createTrack() {
  const trackGroup = new THREE.Group();
  const decorationGroup = new THREE.Group();
  const trackConfig = gameState.trackConfig ?? getSelectedTrackConfig(gameState.selectedTrackId);
  const halfWidth = trackConfig.width / 2;
  const centerPoints = buildRoundedRectLoop(
    trackConfig.halfX,
    trackConfig.halfZ,
    trackConfig.cornerRadius,
    trackConfig.straightSamples,
    trackConfig.arcSamples,
  );
  const totalLength = computeTotalLength(centerPoints);
  const checkpoints = buildCheckpoints(totalLength, trackConfig.checkpointCount);
  const outerPoints = buildRoundedRectLoop(
    trackConfig.halfX + halfWidth,
    trackConfig.halfZ + halfWidth,
    trackConfig.cornerRadius + halfWidth,
    trackConfig.straightSamples,
    trackConfig.arcSamples,
  );
  const innerPoints = buildRoundedRectLoop(
    trackConfig.halfX - halfWidth,
    trackConfig.halfZ - halfWidth,
    trackConfig.cornerRadius - halfWidth,
    trackConfig.straightSamples,
    trackConfig.arcSamples,
  ).reverse();
  const trackData = {
    group: trackGroup,
    points: centerPoints,
    outerPoints,
    innerPoints,
    totalLength,
    halfWidth,
    checkpoints,
    trackMesh: null,
    decorationGroup,
    config: trackConfig,
  };

  const trackShape = new THREE.Shape(outerPoints.map((point) => new THREE.Vector2(point.x, point.z)));
  trackShape.holes.push(new THREE.Path(innerPoints.map((point) => new THREE.Vector2(point.x, point.z))));

  const trackMesh = new THREE.Mesh(
    new THREE.ShapeGeometry(trackShape, 96).rotateX(-Math.PI / 2),
    new THREE.MeshStandardMaterial({ color: trackConfig.trackColor, roughness: 0.92, metalness: 0.02 }),
  );
  trackMesh.position.y = 0.02;
  trackGroup.add(trackMesh);
  trackData.trackMesh = trackMesh;

  addLaneMarkers(trackGroup, centerPoints, trackConfig);
  addBarriers(trackGroup, centerPoints, halfWidth, trackConfig);
  addDirectionMarkers(trackGroup, centerPoints, halfWidth, trackConfig);
  addStartLine(trackGroup, trackData, halfWidth, trackConfig);
  trackGroup.add(decorationGroup);

  return trackData;
}

function buildRoundedRectLoop(halfX, halfZ, radius, straightSamples, arcSamples) {
  const points = [];
  const pushPoint = (x, z) => {
    const point = new THREE.Vector3(x, 0, z);
    const previous = points[points.length - 1];
    if (!previous || previous.distanceToSquared(point) > 1e-6) {
      points.push(point);
    }
  };

  for (let index = 0; index <= straightSamples; index += 1) {
    const t = index / straightSamples;
    pushPoint(lerp(-halfX + radius, halfX - radius, t), halfZ);
  }

  for (let index = 1; index <= arcSamples; index += 1) {
    const angle = Math.PI / 2 - (Math.PI / 2) * (index / arcSamples);
    pushPoint(halfX - radius + Math.cos(angle) * radius, halfZ - radius + Math.sin(angle) * radius);
  }

  for (let index = 1; index <= straightSamples; index += 1) {
    const t = index / straightSamples;
    pushPoint(halfX, lerp(halfZ - radius, -halfZ + radius, t));
  }

  for (let index = 1; index <= arcSamples; index += 1) {
    const angle = 0 - (Math.PI / 2) * (index / arcSamples);
    pushPoint(halfX - radius + Math.cos(angle) * radius, -halfZ + radius + Math.sin(angle) * radius);
  }

  for (let index = 1; index <= straightSamples; index += 1) {
    const t = index / straightSamples;
    pushPoint(lerp(halfX - radius, -halfX + radius, t), -halfZ);
  }

  for (let index = 1; index <= arcSamples; index += 1) {
    const angle = -Math.PI / 2 - (Math.PI / 2) * (index / arcSamples);
    pushPoint(-halfX + radius + Math.cos(angle) * radius, -halfZ + radius + Math.sin(angle) * radius);
  }

  for (let index = 1; index <= straightSamples; index += 1) {
    const t = index / straightSamples;
    pushPoint(-halfX, lerp(-halfZ + radius, halfZ - radius, t));
  }

  for (let index = 1; index <= arcSamples; index += 1) {
    const angle = Math.PI - (Math.PI / 2) * (index / arcSamples);
    pushPoint(-halfX + radius + Math.cos(angle) * radius, halfZ - radius + Math.sin(angle) * radius);
  }

  if (points[0].distanceToSquared(points[points.length - 1]) < 1e-6) {
    points.pop();
  }

  return points;
}

function computeTotalLength(points) {
  let total = 0;
  for (let index = 0; index < points.length; index += 1) {
    total += points[index].distanceTo(points[(index + 1) % points.length]);
  }
  return total;
}

function buildCheckpoints(totalLength, count) {
  const checkpoints = [];
  for (let index = 1; index <= count; index += 1) {
    checkpoints.push({ progress: (totalLength * index) / (count + 1) });
  }
  return checkpoints;
}

function addLaneMarkers(group, centerPoints, trackConfig) {
  const markerGeometry = new THREE.BoxGeometry(3.6, 0.12, 0.35);
  const markerMaterial = new THREE.MeshStandardMaterial({ color: trackConfig.laneMarkerColor, roughness: 0.8 });

  for (let index = 0; index < centerPoints.length; index += 8) {
    const next = centerPoints[(index + 1) % centerPoints.length];
    const current = centerPoints[index];
    const direction = next.clone().sub(current);
    const length = direction.length();
    const tangent = direction.normalize();
    const marker = new THREE.Mesh(markerGeometry, markerMaterial);
    marker.scale.x = Math.max(0.75, length / 3.6);
    marker.position.copy(current.clone().lerp(next, 0.5));
    marker.position.y = 0.07;
    marker.rotation.y = Math.atan2(tangent.z, tangent.x);
    group.add(marker);
  }
}

function addBarriers(group, centerPoints, halfWidth, trackConfig) {
  const barrierGeometry = new THREE.BoxGeometry(4.2, trackConfig.wallHeight, 1.1);
  const materials = [
    new THREE.MeshStandardMaterial({ color: trackConfig.barrierColors[0], roughness: 0.7 }),
    new THREE.MeshStandardMaterial({ color: trackConfig.barrierColors[1], roughness: 0.7 }),
  ];

  for (let index = 0; index < centerPoints.length; index += 3) {
    const current = centerPoints[index];
    const next = centerPoints[(index + 3) % centerPoints.length];
    const direction = next.clone().sub(current);
    const length = direction.length();
    const tangent = direction.normalize();
    const normal = new THREE.Vector3(-tangent.z, 0, tangent.x);
    const midpoint = current.clone().lerp(next, 0.5);

    for (const sign of [-1, 1]) {
      const barrier = new THREE.Mesh(
        barrierGeometry,
        materials[(index / 3 + (sign === 1 ? 1 : 0)) % 2],
      );
      barrier.scale.x = Math.max(0.8, length / 4.2);
      barrier.position.copy(midpoint).addScaledVector(normal, sign * halfWidth);
      barrier.position.y = trackConfig.wallHeight / 2;
      barrier.rotation.y = Math.atan2(tangent.z, tangent.x);
      group.add(barrier);
    }
  }
}

function addDirectionMarkers(group, centerPoints, halfWidth, trackConfig) {
  const markerMaterial = new THREE.MeshStandardMaterial({ color: trackConfig.directionMarkerColor, roughness: 0.6 });
  const markerGeometry = new THREE.ConeGeometry(1, 2.4, 4);

  for (let index = 0; index < centerPoints.length; index += 28) {
    const current = centerPoints[index];
    const next = centerPoints[(index + 2) % centerPoints.length];
    const direction = next.clone().sub(current).normalize();
    const normal = new THREE.Vector3(-direction.z, 0, direction.x);
    const marker = new THREE.Mesh(markerGeometry, markerMaterial);
    marker.position.copy(current).addScaledVector(normal, halfWidth + 3.2);
    marker.position.y = 1.8;
    marker.rotation.x = Math.PI / 2;
    marker.rotation.z = -Math.atan2(direction.z, direction.x);
    group.add(marker);
  }
}

function addStartLine(group, track, halfWidth, trackConfig) {
  const startFrame = getFrameAtProgress(track, 0);

  for (let index = -3; index <= 3; index += 1) {
    const strip = new THREE.Mesh(
      new THREE.BoxGeometry(1.15, 0.15, 2.6),
      new THREE.MeshStandardMaterial({
        color: index % 2 === 0 ? 0xffffff : 0x101010,
        roughness: 0.7,
      }),
    );
    strip.position.copy(startFrame.position).addScaledVector(startFrame.normal, index * 1.8);
    strip.position.y = 0.1;
    strip.rotation.y = Math.atan2(startFrame.normal.x, startFrame.normal.z);
    group.add(strip);
  }

  const arch = new THREE.Mesh(
    new THREE.BoxGeometry(halfWidth * 2 + 4, 0.6, 0.8),
    new THREE.MeshStandardMaterial({ color: trackConfig.startArchColor, emissive: trackConfig.startArchEmissive }),
  );
  arch.position.copy(startFrame.position);
  arch.position.y = 3.6;
  arch.rotation.y = Math.atan2(startFrame.normal.z, startFrame.normal.x);
  group.add(arch);
}

function buildSpawnSetups(totalCars) {
  const laneOffsets = [0, -4.6, 4.6, -7.4, 7.4];
  const rowSpacing = 7.2;
  const frontProgress = (gameState.trackConfig?.startProgress ?? CONFIG.trackDefaults.startProgress) + 10;
  const setups = [];

  for (let index = 0; index < totalCars; index += 1) {
    const row = Math.floor(index / laneOffsets.length);
    const laneIndex = index % laneOffsets.length;
    setups.push({
      progress: frontProgress - row * rowSpacing,
      laneOffset: laneOffsets[laneIndex],
    });
  }

  return setups;
}

function createFallbackWheel(x, y, z) {
  const steerPivot = new THREE.Group();
  const spinPivot = new THREE.Group();
  const wheel = new THREE.Mesh(
    new THREE.CylinderGeometry(0.46, 0.46, 0.4, 14),
    new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.95 }),
  );
  wheel.rotation.z = Math.PI / 2;
  steerPivot.position.set(x, y, z);
  spinPivot.add(wheel);
  steerPivot.add(spinPivot);
  return { root: steerPivot, steerPivot, spinPivot };
}

// 车辆的物理根节点保持不变，外部模型只挂到可视层，确保比赛逻辑和碰撞半径不受影响。
function createFallbackCarVisual(color) {
  const group = new THREE.Group();
  group.rotation.y = Math.PI;

  const body = new THREE.Mesh(
    new THREE.BoxGeometry(2.35, 0.82, 4.4),
    new THREE.MeshStandardMaterial({ color, roughness: 0.4, metalness: 0.18 }),
  );
  body.position.y = 0.75;

  const cabin = new THREE.Mesh(
    new THREE.BoxGeometry(1.65, 0.72, 2.1),
    new THREE.MeshStandardMaterial({ color: 0xdfe8ff, roughness: 0.2, metalness: 0.12 }),
  );
  cabin.position.set(0, 1.26, -0.15);

  const spoiler = new THREE.Mesh(
    new THREE.BoxGeometry(1.7, 0.12, 0.42),
    new THREE.MeshStandardMaterial({ color: 0x16181d, roughness: 0.4 }),
  );
  spoiler.position.set(0, 1.1, 1.95);

  const rearLeft = createFallbackWheel(-1.08, 0.42, -1.45);
  const rearRight = createFallbackWheel(1.08, 0.42, -1.45);
  const frontLeft = createFallbackWheel(-1.08, 0.42, 1.45);
  const frontRight = createFallbackWheel(1.08, 0.42, 1.45);

  group.add(
    body,
    cabin,
    spoiler,
    rearLeft.root,
    rearRight.root,
    frontLeft.root,
    frontRight.root,
  );

  return {
    group,
    controller: {
      front: [
        { role: "front-left", steerPivot: frontLeft.steerPivot, spinPivot: frontLeft.spinPivot },
        { role: "front-right", steerPivot: frontRight.steerPivot, spinPivot: frontRight.spinPivot },
      ],
      rear: [
        { role: "rear-left", steerPivot: null, spinPivot: rearLeft.spinPivot },
        { role: "rear-right", steerPivot: null, spinPivot: rearRight.spinPivot },
      ],
    },
  };
}

function createCar(type, color, label) {
  const mesh = new THREE.Group();
  const visualRoot = new THREE.Group();
  const visualModelMount = new THREE.Group();
  const fallbackVisual = createFallbackCarVisual(color);
  visualRoot.add(fallbackVisual.group, visualModelMount);
  mesh.add(visualRoot);
  mesh.position.y = CONFIG.carBaseHeight;

  const car = {
    id: carIdCounter++,
    type,
    label,
    baseColor: color,
    mesh,
    visualRoot,
    visualModelMount,
    fallbackVisual: fallbackVisual.group,
    fallbackWheelController: fallbackVisual.controller,
    visualWheelController: fallbackVisual.controller,
    visualModelKey: null,
    wheelSpin: 0,
    velocity: new THREE.Vector3(),
    yaw: 0,
    steering: 0,
    wasDrifting: false,
    driftCharge: 0,
    boostTimer: 0,
    itemBoostTimer: 0,
    currentItem: null,
    slowTimer: 0,
    completedLaps: 0,
    nextCheckpointIndex: 0,
    lapTimes: [],
    lapStartTime: 0,
    trackProgress: 0,
    absoluteProgress: 0,
    progressDelta: 0,
    finished: false,
    finishTime: 0,
    rank: 1,
    resetCooldown: 0,
    wrongWayTime: 0,
    stuckTime: 0,
    collisionRadius: CONFIG.collision.radius,
    respawnState: null,
    trackProjection: null,
    aiSettings: null,
    physicsProfile: null,
  };

  modelSystem.registerCar(car);
  modelSystem.applyCarMaterialState(car);
  return car;
}

function applyCarWheelPose(car) {
  const controller = car.visualWheelController ?? car.fallbackWheelController;
  if (!controller) {
    return;
  }

  const steerAngle = clamp(-car.steering * 0.22, -0.48, 0.48);
  for (const wheel of controller.front) {
    if (wheel.steerPivot) {
      wheel.steerPivot.rotation.y = steerAngle;
    }
    if (wheel.spinPivot) {
      wheel.spinPivot.rotation.x = car.wheelSpin;
    }
  }

  for (const wheel of controller.rear) {
    if (wheel.spinPivot) {
      wheel.spinPivot.rotation.x = car.wheelSpin;
    }
  }
}

function updateCarVisualAnimation(car, dt) {
  const forwardSpeed = getForwardSpeed(car);
  car.wheelSpin -= (forwardSpeed / 0.46) * dt;
  applyCarWheelPose(car);
}

function applyCarVisualTransform(car) {
  car.mesh.position.y = CONFIG.carBaseHeight;
  car.mesh.rotation.y = car.yaw;
  applyCarWheelPose(car);
}

function placeCarOnTrack(car, progress, laneOffset) {
  const frame = getFrameAtProgress(gameState.track, progress);
  const spawnPosition = frame.position.clone().addScaledVector(frame.normal, laneOffset);
  const spawnYaw = Math.atan2(frame.tangent.x, frame.tangent.z);

  car.mesh.position.copy(spawnPosition);
  car.yaw = spawnYaw;
  applyCarVisualTransform(car);
  car.velocity.set(0, 0, 0);
  car.steering = 0;
  car.wheelSpin = 0;
  car.wasDrifting = false;
  car.driftCharge = 0;
  car.boostTimer = 0;
  car.itemBoostTimer = 0;
  car.currentItem = null;
  car.slowTimer = 0;
  car.completedLaps = 0;
  car.nextCheckpointIndex = 0;
  car.lapTimes = [];
  car.lapStartTime = 0;
  car.trackProgress = progress;
  car.absoluteProgress = progress;
  car.progressDelta = 0;
  car.finished = false;
  car.finishTime = 0;
  car.rank = 1;
  car.resetCooldown = 0.8;
  car.wrongWayTime = 0;
  car.trackProjection = projectPointToTrack(gameState.track, car.mesh.position);
  car.trackProgress = car.trackProjection.progress;
  car.absoluteProgress = car.trackProjection.progress;
  applyCarVisualTransform(car);
  saveRespawnState(car);
}

function saveRespawnState(car) {
  car.respawnState = {
    position: car.mesh.position.clone(),
    yaw: car.yaw,
    trackProgress: car.trackProgress,
    absoluteProgress: car.absoluteProgress,
    completedLaps: car.completedLaps,
    nextCheckpointIndex: car.nextCheckpointIndex,
  };
}

function resetCarToCheckpoint(car, noticeText) {
  if (!car.respawnState) {
    return;
  }

  // 自动复位统一回到最近有效进度对应的赛道中心线，并按赛道前进方向回正。
  const respawnFrame = getFrameAtProgress(gameState.track, car.respawnState.trackProgress);
  car.mesh.position.copy(respawnFrame.position);
  car.yaw = Math.atan2(respawnFrame.tangent.x, respawnFrame.tangent.z);
  car.velocity.set(0, 0, 0);
  car.steering = 0;
  car.wheelSpin = 0;
  car.driftCharge = 0;
  car.boostTimer = 0;
  car.itemBoostTimer = 0;
  car.currentItem = null;
  car.slowTimer = 0;
  car.wasDrifting = false;
  car.trackProgress = car.respawnState.trackProgress;
  car.absoluteProgress = car.respawnState.absoluteProgress;
  car.completedLaps = car.respawnState.completedLaps;
  car.nextCheckpointIndex = car.respawnState.nextCheckpointIndex;
  car.progressDelta = 0;
  car.finished = false;
  car.resetCooldown = 1.1;
  car.wrongWayTime = 0;
  car.stuckTime = 0;
  car.trackProjection = projectPointToTrack(gameState.track, car.mesh.position);
  car.trackProgress = car.trackProjection.progress;
  car.absoluteProgress = car.completedLaps * gameState.track.totalLength + car.trackProjection.progress;
  applyCarVisualTransform(car);

  if (car.type === "player") {
    setNotice(noticeText, 1.4);
  }
}

function projectPointToTrack(track, position) {
  let bestDistance = Infinity;
  let bestProgress = 0;
  let bestPoint = track.points[0];
  let bestTangent = new THREE.Vector3(1, 0, 0);
  let bestNormal = new THREE.Vector3(0, 0, 1);
  let bestLateralDistance = 0;
  let accumulated = 0;

  for (let index = 0; index < track.points.length; index += 1) {
    const start = track.points[index];
    const end = track.points[(index + 1) % track.points.length];
    const segment = end.clone().sub(start);
    const segmentLength = segment.length();
    const direction = segment.clone().normalize();
    const toPoint = position.clone().sub(start);
    const projectionRatio = clamp(toPoint.dot(segment) / (segmentLength * segmentLength), 0, 1);
    const projectedPoint = start.clone().addScaledVector(segment, projectionRatio);
    const distanceSquared = projectedPoint.distanceToSquared(position);

    if (distanceSquared < bestDistance) {
      bestDistance = distanceSquared;
      bestProgress = accumulated + segmentLength * projectionRatio;
      bestPoint = projectedPoint;
      bestTangent = direction;
      bestNormal = new THREE.Vector3(-direction.z, 0, direction.x);
      const offset = position.clone().sub(projectedPoint);
      bestLateralDistance = offset.dot(bestNormal);
    }

    accumulated += segmentLength;
  }

  return {
    progress: bestProgress,
    position: bestPoint,
    tangent: bestTangent,
    normal: bestNormal,
    lateralDistance: bestLateralDistance,
  };
}

function getFrameAtProgress(track, progress) {
  const wrappedProgress = mod(progress, track.totalLength);
  let accumulated = 0;

  for (let index = 0; index < track.points.length; index += 1) {
    const start = track.points[index];
    const end = track.points[(index + 1) % track.points.length];
    const segment = end.clone().sub(start);
    const length = segment.length();

    if (wrappedProgress <= accumulated + length) {
      const t = (wrappedProgress - accumulated) / length;
      const tangent = segment.normalize();
      const position = start.clone().lerp(end, t);
      const normal = new THREE.Vector3(-tangent.z, 0, tangent.x);
      return { position, tangent, normal };
    }

    accumulated += length;
  }

  const fallbackStart = track.points[track.points.length - 1];
  const fallbackEnd = track.points[0];
  const tangent = fallbackEnd.clone().sub(fallbackStart).normalize();
  return {
    position: fallbackStart.clone(),
    tangent,
    normal: new THREE.Vector3(-tangent.z, 0, tangent.x),
  };
}

function getForwardVector(yaw, target = new THREE.Vector3()) {
  return target.set(Math.sin(yaw), 0, Math.cos(yaw));
}

function getRightVector(yaw, target = new THREE.Vector3()) {
  return target.set(Math.cos(yaw), 0, -Math.sin(yaw));
}

function getForwardSpeed(car) {
  const forward = getForwardVector(car.yaw);
  return car.velocity.dot(forward);
}

function pulseUIElement(element, className) {
  if (!element) {
    return;
  }

  element.classList.remove(className);
  void element.offsetWidth;
  element.classList.add(className);
}

function setSpeedVisuals(speedKmh) {
  const ratio = clamp(speedKmh / 230, 0, 1);
  const speedColor = getSpeedColor(ratio);
  ui.speedValue.style.color = speedColor;
  ui.speedValue.style.textShadow = `0 0 26px ${speedColor}`;
  ui.speedBarFill.style.width = `${Math.round(ratio * 100)}%`;
}

function getSpeedColor(ratio) {
  if (ratio <= 0.56) {
    return mixColor("#f6fbff", "#79d8ff", ratio / 0.56);
  }

  return mixColor("#79d8ff", "#ff6b74", (ratio - 0.56) / 0.44);
}

function mixColor(startHex, endHex, ratio) {
  const t = clamp(ratio, 0, 1);
  const start = parseHexColor(startHex);
  const end = parseHexColor(endHex);
  const red = Math.round(lerp(start.r, end.r, t));
  const green = Math.round(lerp(start.g, end.g, t));
  const blue = Math.round(lerp(start.b, end.b, t));
  return `rgb(${red}, ${green}, ${blue})`;
}

function parseHexColor(hex) {
  const safeHex = hex.replace("#", "");
  return {
    r: Number.parseInt(safeHex.slice(0, 2), 16),
    g: Number.parseInt(safeHex.slice(2, 4), 16),
    b: Number.parseInt(safeHex.slice(4, 6), 16),
  };
}

function getStatusTone(player, boostActive, driftActive) {
  if (player.wrongWayTime > 0.35) {
    return "warning";
  }

  if (boostActive) {
    return "boost";
  }

  if (driftActive) {
    return "drift";
  }

  if (gameState.noticeTimer > 0 || gameState.status === "countdown") {
    return "notice";
  }

  return "neutral";
}

function getBoostLabel(player) {
  if (player.itemBoostTimer > 0) {
    return "道具加速中";
  }

  if (player.boostTimer > 0) {
    return "增压中";
  }

  if (player.driftCharge > 0) {
    return `蓄能 ${Math.round(player.driftCharge)}%`;
  }

  return "未蓄能";
}

function getStatusLabel(player) {
  if (gameState.status === "countdown") {
    return "倒计时";
  }

  if (gameState.status === "finished") {
    return "比赛结束";
  }

  if (gameState.noticeTimer > 0) {
    return gameState.noticeText;
  }

  if (player.wrongWayTime > 0.35) {
    return "逆行警告";
  }

  return "比赛中";
}

function setNotice(text, duration) {
  gameState.noticeText = text;
  gameState.noticeTimer = duration;
}

function handleResize() {
  gameState.camera.aspect = window.innerWidth / window.innerHeight;
  gameState.camera.updateProjectionMatrix();
  gameState.renderer.setSize(window.innerWidth, window.innerHeight);
  minimapSystem.render();
}

function sanitizePlayerName(value) {
  return String(value || "玩家")
    .trim()
    .replace(/\s+/g, " ")
    .slice(0, 18) || "玩家";
}

function formatTime(seconds) {
  const safeSeconds = Math.max(0, seconds || 0);
  const minutes = Math.floor(safeSeconds / 60);
  const remainder = safeSeconds - minutes * 60;
  const wholeSeconds = Math.floor(remainder);
  const milliseconds = Math.floor((remainder - wholeSeconds) * 1000);
  return `${String(minutes).padStart(2, "0")}:${String(wholeSeconds).padStart(2, "0")}.${String(milliseconds).padStart(3, "0")}`;
}

function lerpAngle(start, end, t) {
  return start + wrapAngle(end - start) * t;
}

function wrapAngle(angle) {
  let wrapped = angle;
  while (wrapped > Math.PI) {
    wrapped -= Math.PI * 2;
  }
  while (wrapped < -Math.PI) {
    wrapped += Math.PI * 2;
  }
  return wrapped;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function lerp(start, end, t) {
  return start + (end - start) * t;
}

function stableNoise(seed) {
  const raw = Math.sin(seed * 12.9898) * 43758.5453123;
  return raw - Math.floor(raw);
}

function sampleArray(values) {
  if (!Array.isArray(values) || values.length === 0) {
    return null;
  }
  return values[Math.floor(Math.random() * values.length)];
}

function createNoiseBuffer(context, seconds) {
  const length = Math.max(1, Math.floor(context.sampleRate * seconds));
  const buffer = context.createBuffer(1, length, context.sampleRate);
  const channel = buffer.getChannelData(0);
  for (let index = 0; index < length; index += 1) {
    channel[index] = Math.random() * 2 - 1;
  }
  return buffer;
}

function mod(value, base) {
  return ((value % base) + base) % base;
}
