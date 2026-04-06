import * as THREE from "./vendor/three.module.js";

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
    pickupPoints: 8,
  },
  ghost: {
    sampleInterval: 1 / 30,
  },
  save: {
    storageKey: "neon-bend-rush-save-v1",
  },
  track: {
    halfX: 68,
    halfZ: 44,
    cornerRadius: 24,
    width: 24,
    wallHeight: 1.8,
    straightSamples: 34,
    arcSamples: 26,
    checkpointCount: 6,
    resetMargin: 1.4,
    startProgress: 6,
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
  statusValue: document.getElementById("status-value"),
  difficultyDescription: document.getElementById("difficulty-description"),
  difficultyButtons: [...document.querySelectorAll("[data-difficulty]")],
  weatherDescription: document.getElementById("weather-description"),
  weatherButtons: [...document.querySelectorAll("[data-weather]")],
  resultScreen: document.getElementById("result-screen"),
  resultTitle: document.getElementById("result-title"),
  resultSummary: document.getElementById("result-summary"),
  resultList: document.getElementById("result-list"),
  lapTimeList: document.getElementById("lap-time-list"),
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
  cars: [],
  standings: [],
  currentCameraIndex: 0,
  selectedDifficultyId: "expert",
  difficultyConfig: null,
  selectedWeatherId: "day",
  weatherConfig: null,
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

boot();

// 初始化顺序保持固定：渲染器、场景、赛道、UI、输入、初始摆放。
function boot() {
  saveSystem.load();
  setupRenderer();
  setupScene();
  setupWorld();
  setupTrackAndCars();
  setupUI();
  setupInput();
  weatherSystem.apply(gameState.selectedWeatherId);
  itemSystem.init();
  ghostSystem.init();
  debugPanel.init();
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
    gameState.scene.add(tree);
  }
}

function setupTrackAndCars() {
  gameState.track = createTrack();
  gameState.scene.add(gameState.track.group);

  gameState.player = createCar("player", 0xff8648, CONFIG.names.player);
  gameState.scene.add(gameState.player.mesh);
  applyDifficultySelection(gameState.selectedDifficultyId);
  weatherSystem.apply(gameState.selectedWeatherId);
  rebuildAIField();
}

function setupUI() {
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
    ui.startScreen.classList.remove("visible");
    ui.startScreen.classList.add("hidden");
    startCountdown();
  });

  ui.restartButton.addEventListener("click", () => {
    ui.resultScreen.classList.remove("visible");
    ui.resultScreen.classList.add("hidden");
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

function createSaveSystem() {
  return {
    records: {
      bestLap: null,
      bestTotal: null,
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

      try {
        window.localStorage.setItem(CONFIG.save.storageKey, JSON.stringify(this.records));
      } catch {
        // 本地存储不可用时，不阻断结算展示。
      }
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

function createGhostSystem() {
  return {
    ghostCar: null,
    recordedFrames: [],
    lastRunFrames: [],
    playbackFrames: [],
    lastRecordedAt: 0,
    playbackTime: 0,
    init() {
      this.ghostCar = createCar("ghost", 0x79d8ff, "幽灵车");
      this.ghostCar.mesh.visible = false;
      this.ghostCar.mesh.traverse((child) => {
        if (child.isMesh) {
          child.material = child.material.clone();
          child.material.transparent = true;
          child.material.opacity = 0.34;
          child.material.depthWrite = false;
          if ("emissive" in child.material) {
            child.material.emissive = new THREE.Color(0x234868);
          }
        }
      });
      gameState.scene.add(this.ghostCar.mesh);
    },
    prepareForRace() {
      this.recordedFrames = [];
      this.lastRecordedAt = 0;
      this.playbackTime = 0;
      this.playbackFrames = this.lastRunFrames;
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
    init() {
      this.boxGroup = new THREE.Group();
      gameState.scene.add(this.boxGroup);
      this.buildBoxes();
    },
    buildBoxes() {
      this.boxGroup.clear();
      this.boxes = [];
      this.shockwaves = [];

      for (let index = 0; index < CONFIG.items.pickupPoints; index += 1) {
        const progress =
          ((index + 0.5) / CONFIG.items.pickupPoints) * gameState.track.totalLength;
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

          car.currentItem = Math.random() < 0.5 ? "boost" : "shockwave";
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
      car.currentItem = null;

      if (itemType === "boost") {
        car.itemBoostTimer = Math.max(car.itemBoostTimer, CONFIG.items.boostDuration);
        if (car.type === "player") {
          setNotice("道具加速已触发", 1);
        }
        return true;
      }

      if (itemType === "shockwave") {
        this.triggerShockwave(car);
        if (car.type === "player") {
          setNotice("冲击波已释放", 1);
        }
        return true;
      }

      return false;
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
    obtainShockwaveEffect() {
      const available = this.shockwaves.find((effect) => effect.life <= 0);
      if (available) {
        return available;
      }

      const mesh = new THREE.Mesh(
        new THREE.TorusGeometry(2.2, 0.22, 12, 28),
        new THREE.MeshBasicMaterial({
          color: 0x79d8ff,
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
      if (itemType === "shockwave") {
        return "冲击波";
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

// 根据当前难度重新生成 AI 阵容，避免不同难度只是简单改一个数字。
function rebuildAIField() {
  for (const car of gameState.aiCars) {
    gameState.scene.remove(car.mesh);
  }

  const preset = gameState.difficultyConfig ?? CONFIG.difficulties.expert;
  const colors = [0xff576d, 0x4db8ff, 0xffcc4d, 0x74f0a7, 0xb08cff, 0xff7fb2, 0x62e5d7];
  const aiCars = [];

  for (let index = 0; index < preset.aiCount; index += 1) {
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
  gameState.renderer.render(gameState.scene, gameState.camera);
}

function updateGame(dt) {
  if (gameState.noticeTimer > 0) {
    gameState.noticeTimer = Math.max(0, gameState.noticeTimer - dt);
  }

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
  const maxLateral = gameState.track.halfWidth - CONFIG.track.resetMargin;
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
  computeRanking();
  gameState.results = [...gameState.standings];
  ui.resultScreen.classList.remove("hidden");
  ui.resultScreen.classList.add("visible");
  showResults();
}

// 排名严格遵循：完成圈数 > 检查点 > 当前赛段进度 > 完赛时间。
function computeRanking() {
  gameState.standings = [...gameState.cars].sort((left, right) => {
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
  const positionText = `第 ${player.rank} / ${gameState.cars.length} 名`;
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
  ui.statusValue.textContent = statusText;
  ui.statusValue.dataset.tone = getStatusTone(player, boostActive, driftActive);

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
    `${gameState.difficultyConfig?.label ?? "进阶"}难度，总用时 ` +
    `${formatTime(player.finishTime || gameState.elapsedTime)}，本场共有 ${gameState.cars.length} 辆赛车。`;
  ui.recordBestTotal.textContent = `最佳总成绩：${saveSystem.getBestTotalLabel()}`;
  ui.recordBestLap.textContent = `最快单圈：${saveSystem.getBestLapLabel()}`;
  ui.recordFlags.textContent = saveSystem.getRecordFlagText();

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
    tag.textContent = car === player ? "玩家" : car.rank === 1 ? "头名" : "对手";

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
  const halfWidth = CONFIG.track.width / 2;
  const centerPoints = buildRoundedRectLoop(
    CONFIG.track.halfX,
    CONFIG.track.halfZ,
    CONFIG.track.cornerRadius,
    CONFIG.track.straightSamples,
    CONFIG.track.arcSamples,
  );
  const totalLength = computeTotalLength(centerPoints);
  const checkpoints = buildCheckpoints(totalLength, CONFIG.track.checkpointCount);
  const trackData = {
    group: trackGroup,
    points: centerPoints,
    totalLength,
    halfWidth,
    checkpoints,
    trackMesh: null,
  };

  const outerPoints = buildRoundedRectLoop(
    CONFIG.track.halfX + halfWidth,
    CONFIG.track.halfZ + halfWidth,
    CONFIG.track.cornerRadius + halfWidth,
    CONFIG.track.straightSamples,
    CONFIG.track.arcSamples,
  );
  const innerPoints = buildRoundedRectLoop(
    CONFIG.track.halfX - halfWidth,
    CONFIG.track.halfZ - halfWidth,
    CONFIG.track.cornerRadius - halfWidth,
    CONFIG.track.straightSamples,
    CONFIG.track.arcSamples,
  ).reverse();

  const trackShape = new THREE.Shape(outerPoints.map((point) => new THREE.Vector2(point.x, point.z)));
  trackShape.holes.push(new THREE.Path(innerPoints.map((point) => new THREE.Vector2(point.x, point.z))));

  const trackMesh = new THREE.Mesh(
    new THREE.ShapeGeometry(trackShape, 96).rotateX(-Math.PI / 2),
    new THREE.MeshStandardMaterial({ color: 0x2e333e, roughness: 0.92, metalness: 0.02 }),
  );
  trackMesh.position.y = 0.02;
  trackGroup.add(trackMesh);
  trackData.trackMesh = trackMesh;

  addLaneMarkers(trackGroup, centerPoints);
  addBarriers(trackGroup, centerPoints, halfWidth);
  addDirectionMarkers(trackGroup, centerPoints, halfWidth);
  addStartLine(trackGroup, trackData, halfWidth);

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

function addLaneMarkers(group, centerPoints) {
  const markerGeometry = new THREE.BoxGeometry(3.6, 0.12, 0.35);
  const markerMaterial = new THREE.MeshStandardMaterial({ color: 0xf5f5f5, roughness: 0.8 });

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

function addBarriers(group, centerPoints, halfWidth) {
  const barrierGeometry = new THREE.BoxGeometry(4.2, CONFIG.track.wallHeight, 1.1);
  const materials = [
    new THREE.MeshStandardMaterial({ color: 0xe7e7e7, roughness: 0.7 }),
    new THREE.MeshStandardMaterial({ color: 0xff5c62, roughness: 0.7 }),
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
      barrier.position.y = CONFIG.track.wallHeight / 2;
      barrier.rotation.y = Math.atan2(tangent.z, tangent.x);
      group.add(barrier);
    }
  }
}

function addDirectionMarkers(group, centerPoints, halfWidth) {
  const markerMaterial = new THREE.MeshStandardMaterial({ color: 0xffce56, roughness: 0.6 });
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

function addStartLine(group, track, halfWidth) {
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
    new THREE.MeshStandardMaterial({ color: 0x79d8ff, emissive: 0x15354d }),
  );
  arch.position.copy(startFrame.position);
  arch.position.y = 3.6;
  arch.rotation.y = Math.atan2(startFrame.normal.z, startFrame.normal.x);
  group.add(arch);
}

function buildSpawnSetups(totalCars) {
  const laneOffsets = [0, -4.6, 4.6, -7.4, 7.4];
  const rowSpacing = 7.2;
  const frontProgress = CONFIG.track.startProgress + 10;
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

// 赛车模型使用简单几何体拼装，保证加载快且容易区分玩家与 AI。
function createCar(type, color, label) {
  const mesh = new THREE.Group();
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

  mesh.add(body, cabin, spoiler);

  const wheelGeometry = new THREE.CylinderGeometry(0.46, 0.46, 0.4, 14);
  const wheelMaterial = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.95 });
  const wheelOffsets = [
    [-1.08, 0.42, -1.45],
    [1.08, 0.42, -1.45],
    [-1.08, 0.42, 1.45],
    [1.08, 0.42, 1.45],
  ];

  for (const [x, y, z] of wheelOffsets) {
    const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
    wheel.rotation.z = Math.PI / 2;
    wheel.position.set(x, y, z);
    mesh.add(wheel);
  }

  mesh.position.y = CONFIG.carBaseHeight;

  return {
    id: carIdCounter++,
    type,
    label,
    mesh,
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
}

// 车辆模型默认车头朝向与物理前进轴相反，这里统一做一次可视方向修正。
function applyCarVisualTransform(car) {
  car.mesh.position.y = CONFIG.carBaseHeight;
  car.mesh.rotation.y = car.yaw + Math.PI;
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

  car.mesh.position.copy(car.respawnState.position);
  car.yaw = car.respawnState.yaw;
  applyCarVisualTransform(car);
  car.velocity.set(0, 0, 0);
  car.steering = 0;
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

function mod(value, base) {
  return ((value % base) + base) % base;
}
