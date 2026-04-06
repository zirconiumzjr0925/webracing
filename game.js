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
  lapValue: document.getElementById("lap-value"),
  positionValue: document.getElementById("position-value"),
  speedValue: document.getElementById("speed-value"),
  timeValue: document.getElementById("time-value"),
  cameraValue: document.getElementById("camera-value"),
  boostValue: document.getElementById("boost-value"),
  difficultyValue: document.getElementById("difficulty-value"),
  statusValue: document.getElementById("status-value"),
  difficultyDescription: document.getElementById("difficulty-description"),
  difficultyButtons: [...document.querySelectorAll(".difficulty-option")],
  resultScreen: document.getElementById("result-screen"),
  resultTitle: document.getElementById("result-title"),
  resultSummary: document.getElementById("result-summary"),
  resultList: document.getElementById("result-list"),
  lapTimeList: document.getElementById("lap-time-list"),
  restartButton: document.getElementById("restart-button"),
};

const gameState = {
  scene: null,
  camera: null,
  renderer: null,
  clock: new THREE.Clock(),
  cameraLookTarget: new THREE.Vector3(),
  status: "start",
  countdownRemaining: 0,
  elapsedTime: 0,
  track: null,
  player: null,
  aiCars: [],
  cars: [],
  standings: [],
  currentCameraIndex: 0,
  selectedDifficultyId: "expert",
  difficultyConfig: null,
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

let carIdCounter = 1;

boot();

// 初始化顺序保持固定：渲染器、场景、赛道、UI、输入、初始摆放。
function boot() {
  setupRenderer();
  setupScene();
  setupWorld();
  setupTrackAndCars();
  setupUI();
  setupInput();
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

  const ambientLight = new THREE.HemisphereLight(0xd9f4ff, 0x234018, 1.35);
  const sunLight = new THREE.DirectionalLight(0xffffff, 1.1);
  sunLight.position.set(70, 85, 40);
  gameState.scene.add(ambientLight, sunLight);
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
  rebuildAIField();
}

function setupUI() {
  for (const button of ui.difficultyButtons) {
    button.addEventListener("click", () => {
      applyDifficultySelection(button.dataset.difficulty);
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
  };

  window.addEventListener("keydown", (event) => onKey(event, true));
  window.addEventListener("keyup", (event) => onKey(event, false));
}

function startCountdown() {
  rebuildAIField();
  resetRace();
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

  const spawnSetups = buildSpawnSetups(gameState.cars.length);

  gameState.cars.forEach((car, index) => {
    const spawn = spawnSetups[index];
    placeCarOnTrack(car, spawn.progress, spawn.laneOffset);
  });

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
    forwardSpeed += physics.acceleration * dt;
  }

  if (control.brake) {
    if (forwardSpeed > -1) {
      forwardSpeed -= physics.braking * dt;
    } else {
      forwardSpeed -= physics.reverseAcceleration * dt;
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

  const topSpeedBonus = car.boostTimer > 0 ? physics.boostTopSpeedBonus : 0;
  forwardSpeed = clamp(forwardSpeed, -physics.maxReverseSpeed, physics.maxSpeed + topSpeedBonus);

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
  ui.lapValue.textContent = `${currentLap} / ${CONFIG.totalLaps}`;
  ui.positionValue.textContent = `第 ${player.rank} / ${gameState.cars.length} 名`;
  ui.speedValue.textContent = `${Math.round(player.velocity.length() * 3.6)} km/h`;
  ui.timeValue.textContent = formatTime(gameState.elapsedTime);
  ui.cameraValue.textContent = CONFIG.cameraModes[gameState.currentCameraIndex].label;
  ui.boostValue.textContent = getBoostLabel(player);
  ui.difficultyValue.textContent = gameState.difficultyConfig?.label ?? "进阶";
  ui.statusValue.textContent = getStatusLabel(player);
}

function showResults() {
  const player = gameState.player;
  ui.resultTitle.textContent = `你获得了第 ${player.rank} 名`;
  ui.resultSummary.textContent =
    `${gameState.difficultyConfig?.label ?? "进阶"}难度，总用时 ` +
    `${formatTime(player.finishTime || gameState.elapsedTime)}，本场共有 ${gameState.cars.length} 辆赛车。`;

  ui.resultList.innerHTML = "";
  for (const car of gameState.results) {
    const item = document.createElement("li");
    const suffix = car.finished
      ? `完赛时间 ${formatTime(car.finishTime)}`
      : `停留在第 ${Math.min(CONFIG.totalLaps, car.completedLaps + 1)} 圈`;
    item.textContent = `${car.label}  ·  ${suffix}`;
    ui.resultList.appendChild(item);
  }

  ui.lapTimeList.innerHTML = "";
  player.lapTimes.forEach((lapTime, index) => {
    const item = document.createElement("li");
    item.textContent = `第 ${index + 1} 圈：${formatTime(lapTime)}`;
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

function getBoostLabel(player) {
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
