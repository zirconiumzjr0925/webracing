const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

const JSON_HEADERS = {
  "Content-Type": "application/json; charset=utf-8",
  ...CORS_HEADERS,
};

const ROOM_CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    const url = new URL(request.url);

    if (url.pathname === "/api/health") {
      return jsonResponse({ ok: true, now: Date.now() });
    }

    if (url.pathname === "/api/leaderboard" && request.method === "GET") {
      const stub = env.LEADERBOARD.get(env.LEADERBOARD.idFromName("global"));
      return stub.fetch(request);
    }

    if (url.pathname === "/api/leaderboard" && request.method === "POST") {
      const stub = env.LEADERBOARD.get(env.LEADERBOARD.idFromName("global"));
      return stub.fetch(request);
    }

    if (url.pathname === "/api/rooms" && request.method === "POST") {
      const payload = await readJson(request);
      const playerName = sanitizePlayerName(payload.playerName);

      for (let attempt = 0; attempt < 8; attempt += 1) {
        const roomId = createRoomCode();
        const playerId = crypto.randomUUID();
        const stub = env.ROOMS.get(env.ROOMS.idFromName(roomId));
        const response = await stub.fetch(
          "https://room.internal/create",
          createJsonRequest({
            roomId,
            playerId,
            playerName,
          }),
        );

        if (response.ok) {
          return withCors(response);
        }
      }

      return errorResponse("创建房间失败，请稍后重试。", 500);
    }

    if (url.pathname === "/api/rooms/join" && request.method === "POST") {
      const payload = await readJson(request);
      const roomId = normalizeRoomId(payload.roomId);
      if (!roomId) {
        return errorResponse("房间码无效。", 400);
      }

      const stub = env.ROOMS.get(env.ROOMS.idFromName(roomId));
      const response = await stub.fetch(
        "https://room.internal/join",
        createJsonRequest({
          roomId,
          playerId: crypto.randomUUID(),
          playerName: sanitizePlayerName(payload.playerName),
        }),
      );
      return withCors(response);
    }

    if (url.pathname === "/api/rooms/start" && request.method === "POST") {
      const payload = await readJson(request);
      const roomId = normalizeRoomId(payload.roomId);
      if (!roomId) {
        return errorResponse("房间码无效。", 400);
      }

      const stub = env.ROOMS.get(env.ROOMS.idFromName(roomId));
      const response = await stub.fetch(
        "https://room.internal/start",
        createJsonRequest({
          playerId: payload.playerId,
          config: sanitizeRaceConfig(payload.config),
        }),
      );
      return withCors(response);
    }

    if (url.pathname === "/api/rooms/leave" && request.method === "POST") {
      const payload = await readJson(request);
      const roomId = normalizeRoomId(payload.roomId);
      if (!roomId || !payload.playerId) {
        return errorResponse("缺少房间或玩家信息。", 400);
      }

      const stub = env.ROOMS.get(env.ROOMS.idFromName(roomId));
      const response = await stub.fetch(
        "https://room.internal/leave",
        createJsonRequest({
          playerId: payload.playerId,
        }),
      );
      return withCors(response);
    }

    const roomMatch = url.pathname.match(/^\/api\/rooms\/([A-Z0-9]+)\/ws$/);
    if (roomMatch) {
      const roomId = normalizeRoomId(roomMatch[1]);
      const playerId = url.searchParams.get("playerId");
      if (!roomId || !playerId) {
        return errorResponse("缺少房间或玩家信息。", 400);
      }

      const stub = env.ROOMS.get(env.ROOMS.idFromName(roomId));
      return stub.fetch(`https://room.internal/ws?playerId=${encodeURIComponent(playerId)}`, request);
    }

    return errorResponse("未找到对应接口。", 404);
  },
};

export class RaceRoom {
  constructor(state) {
    this.state = state;
    this.sessions = new Map();
    this.room = null;
    this.loadPromise = this.loadRoom();
  }

  async loadRoom() {
    this.room = (await this.state.storage.get("room")) ?? null;
  }

  async persistRoom() {
    await this.state.storage.put("room", this.room);
  }

  async fetch(request) {
    await this.loadPromise;

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    const url = new URL(request.url);

    if (url.pathname === "/create" && request.method === "POST") {
      return this.handleCreate(await readJson(request));
    }

    if (url.pathname === "/join" && request.method === "POST") {
      return this.handleJoin(await readJson(request));
    }

    if (url.pathname === "/start" && request.method === "POST") {
      return this.handleStart(await readJson(request));
    }

    if (url.pathname === "/leave" && request.method === "POST") {
      return this.handleLeave(await readJson(request));
    }

    if (url.pathname === "/ws") {
      return this.handleWebSocket(url.searchParams.get("playerId"));
    }

    if (url.pathname === "/snapshot") {
      return jsonResponse({ room: this.serializeRoom() });
    }

    return errorResponse("房间接口不存在。", 404);
  }

  async handleCreate(payload) {
    if (this.room && this.room.players?.length > 0) {
      return errorResponse("该房间码已被占用。", 409);
    }

    this.room = {
      roomId: normalizeRoomId(payload.roomId),
      hostId: payload.playerId,
      status: "lobby",
      config: null,
      players: [
        {
          id: payload.playerId,
          name: sanitizePlayerName(payload.playerName),
          slotIndex: 0,
          connected: false,
          state: null,
          joinedAt: Date.now(),
        },
      ],
    };
    await this.persistRoom();

    return jsonResponse({
      roomId: this.room.roomId,
      playerId: payload.playerId,
      room: this.serializeRoom(),
    });
  }

  async handleJoin(payload) {
    if (!this.room) {
      return errorResponse("房间不存在。", 404);
    }

    const nextSlot = this.room.players.reduce((maxSlot, player) => Math.max(maxSlot, player.slotIndex), -1) + 1;
    this.room.players.push({
      id: payload.playerId,
      name: sanitizePlayerName(payload.playerName),
      slotIndex: nextSlot,
      connected: false,
      state: null,
      joinedAt: Date.now(),
    });
    await this.persistRoom();
    this.broadcastSnapshot();

    return jsonResponse({
      roomId: this.room.roomId,
      playerId: payload.playerId,
      room: this.serializeRoom(),
    });
  }

  async handleStart(payload) {
    if (!this.room) {
      return errorResponse("房间不存在。", 404);
    }

    if (payload.playerId !== this.room.hostId) {
      return errorResponse("只有房主可以开始比赛。", 403);
    }

    this.room.status = "countdown";
    this.room.config = sanitizeRaceConfig(payload.config);
    await this.persistRoom();

    const message = {
      type: "race_started",
      config: this.room.config,
      room: this.serializeRoom(),
      issuedAt: Date.now(),
    };
    this.broadcast(message);

    return jsonResponse({
      room: this.serializeRoom(),
    });
  }

  async handleLeave(payload) {
    if (!this.room) {
      return jsonResponse({ left: true, room: null });
    }

    const playerId = String(payload.playerId || "");
    const socket = this.sessions.get(playerId);
    if (socket) {
      this.sessions.delete(playerId);
      try {
        socket.close(1000, "player-left");
      } catch {
        // 连接已经关闭时忽略异常，仍然继续清理房间状态。
      }
    }

    const remainingPlayers = this.room.players.filter((player) => player.id !== playerId);
    if (remainingPlayers.length === 0) {
      this.room = null;
      await this.state.storage.delete("room");
      return jsonResponse({
        left: true,
        room: null,
      });
    }

    const orderedPlayers = [...remainingPlayers].sort((left, right) => {
      if (left.slotIndex !== right.slotIndex) {
        return left.slotIndex - right.slotIndex;
      }
      return left.joinedAt - right.joinedAt;
    });

    orderedPlayers.forEach((player, index) => {
      player.slotIndex = index;
    });

    const nextHost = orderedPlayers.find((player) => player.connected) ?? orderedPlayers[0];
    this.room.players = orderedPlayers;
    this.room.hostId = nextHost?.id ?? "";
    await this.persistRoom();
    this.broadcastSnapshot();

    return jsonResponse({
      left: true,
      room: this.serializeRoom(),
    });
  }

  async handleWebSocket(playerId) {
    if (!this.room) {
      return errorResponse("房间不存在。", 404);
    }

    const player = this.room.players.find((entry) => entry.id === playerId);
    if (!player) {
      return errorResponse("房间内不存在该玩家。", 404);
    }

    const pair = new WebSocketPair();
    const client = pair[0];
    const server = pair[1];
    server.accept();

    this.sessions.set(playerId, server);
    player.connected = true;
    await this.persistRoom();

    server.addEventListener("message", async (event) => {
      await this.handleSocketMessage(playerId, event.data);
    });
    server.addEventListener("close", async () => {
      await this.handleSocketClose(playerId);
    });
    server.addEventListener("error", async () => {
      await this.handleSocketClose(playerId);
    });

    this.send(server, {
      type: "snapshot",
      room: this.serializeRoom(),
    });
    this.broadcastSnapshot();

    return new Response(null, {
      status: 101,
      webSocket: client,
    });
  }

  async handleSocketMessage(playerId, rawData) {
    if (!this.room) {
      return;
    }

    let payload = null;
    try {
      payload = JSON.parse(rawData);
    } catch {
      return;
    }

    if (!payload || payload.type !== "state") {
      return;
    }

    const player = this.room.players.find((entry) => entry.id === playerId);
    if (!player) {
      return;
    }

    player.state = sanitizePlayerState(payload.state);
    if (player.state.finished) {
      await this.persistRoom();
    }

    this.broadcast({
      type: "player_state",
      playerId,
      state: player.state,
    }, playerId);
  }

  async handleSocketClose(playerId) {
    this.sessions.delete(playerId);
    if (!this.room) {
      return;
    }

    const player = this.room.players.find((entry) => entry.id === playerId);
    if (player) {
      player.connected = false;
      await this.persistRoom();
    }
    this.broadcastSnapshot();
  }

  serializeRoom() {
    if (!this.room) {
      return null;
    }

    return {
      roomId: this.room.roomId,
      hostId: this.room.hostId,
      status: this.room.status,
      config: this.room.config,
      players: this.room.players.map((player) => ({
        id: player.id,
        name: player.name,
        slotIndex: player.slotIndex,
        connected: Boolean(player.connected),
      })),
    };
  }

  broadcastSnapshot() {
    this.broadcast({
      type: "snapshot",
      room: this.serializeRoom(),
    });
  }

  broadcast(message, excludePlayerId = "") {
    const data = JSON.stringify(message);
    for (const [playerId, socket] of this.sessions) {
      if (playerId === excludePlayerId) {
        continue;
      }

      this.send(socket, data);
    }
  }

  send(socket, message) {
    const payload = typeof message === "string" ? message : JSON.stringify(message);
    try {
      socket.send(payload);
    } catch {
      // 连接已经断开时忽略发送失败，后续会在 close 事件里清理状态。
    }
  }
}

export class LeaderboardStore {
  constructor(state) {
    this.state = state;
  }

  async fetch(request) {
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    const url = new URL(request.url);
    if (url.pathname === "/api/leaderboard" && request.method === "GET") {
      return this.handleList(url);
    }

    if (url.pathname === "/api/leaderboard" && request.method === "POST") {
      return this.handleSubmit(await readJson(request));
    }

    return errorResponse("排行榜接口不存在。", 404);
  }

  async handleList(url) {
    const trackId = normalizeTrackId(url.searchParams.get("trackId"));
    const difficultyId = normalizeDifficultyId(url.searchParams.get("difficultyId"));
    const limit = clampNumber(Number(url.searchParams.get("limit") || 5), 1, 20);
    const entries = ((await this.state.storage.get(this.buildKey(trackId, difficultyId))) ?? []).slice(0, limit);
    return jsonResponse({ entries });
  }

  async handleSubmit(payload) {
    const trackId = normalizeTrackId(payload.trackId);
    const difficultyId = normalizeDifficultyId(payload.difficultyId);
    const entry = {
      id: crypto.randomUUID(),
      playerName: sanitizePlayerName(payload.playerName),
      trackId,
      trackLabel: String(payload.trackLabel || trackId),
      difficultyId,
      difficultyLabel: String(payload.difficultyLabel || difficultyId),
      weatherId: normalizeWeatherId(payload.weatherId),
      weatherLabel: String(payload.weatherLabel || "白天"),
      totalTime: clampNumber(Number(payload.totalTime || 0), 0, 36000),
      bestLap: payload.bestLap === null || payload.bestLap === undefined
        ? null
        : clampNumber(Number(payload.bestLap || 0), 0, 36000),
      createdAt: Date.now(),
    };

    if (!entry.totalTime || !Number.isFinite(entry.totalTime)) {
      return errorResponse("成绩无效，无法写入排行榜。", 400);
    }

    const key = this.buildKey(trackId, difficultyId);
    const currentEntries = (await this.state.storage.get(key)) ?? [];
    currentEntries.push(entry);
    currentEntries.sort((left, right) => {
      if (left.totalTime !== right.totalTime) {
        return left.totalTime - right.totalTime;
      }
      const leftLap = left.bestLap ?? Number.MAX_SAFE_INTEGER;
      const rightLap = right.bestLap ?? Number.MAX_SAFE_INTEGER;
      if (leftLap !== rightLap) {
        return leftLap - rightLap;
      }
      return left.createdAt - right.createdAt;
    });

    const trimmedEntries = currentEntries.slice(0, 20);
    await this.state.storage.put(key, trimmedEntries);

    return jsonResponse({
      accepted: true,
      entries: trimmedEntries.slice(0, 10),
    });
  }

  buildKey(trackId, difficultyId) {
    return `leaderboard:${trackId}:${difficultyId}`;
  }
}

function createJsonRequest(body) {
  return new Request("https://internal.request", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
}

async function readJson(request) {
  try {
    return await request.json();
  } catch {
    return {};
  }
}

function jsonResponse(result, status = 200) {
  return new Response(
    JSON.stringify({
      success: true,
      ...result,
    }),
    {
      status,
      headers: JSON_HEADERS,
    },
  );
}

function errorResponse(message, status = 400) {
  return new Response(
    JSON.stringify({
      success: false,
      error: message,
    }),
    {
      status,
      headers: JSON_HEADERS,
    },
  );
}

function withCors(response) {
  const headers = new Headers(response.headers);
  Object.entries(CORS_HEADERS).forEach(([key, value]) => {
    headers.set(key, value);
  });
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

function createRoomCode() {
  let code = "";
  const randomBytes = crypto.getRandomValues(new Uint8Array(5));
  for (let index = 0; index < 5; index += 1) {
    code += ROOM_CODE_CHARS[randomBytes[index] % ROOM_CODE_CHARS.length];
  }
  return code;
}

function sanitizePlayerName(name) {
  return String(name || "玩家")
    .trim()
    .slice(0, 18) || "玩家";
}

function normalizeRoomId(roomId) {
  return String(roomId || "")
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 8);
}

function sanitizeRaceConfig(config) {
  return {
    trackId: normalizeTrackId(config?.trackId),
    difficultyId: normalizeDifficultyId(config?.difficultyId),
    weatherId: normalizeWeatherId(config?.weatherId),
  };
}

function sanitizePlayerState(state) {
  return {
    x: clampNumber(Number(state?.x || 0), -10000, 10000),
    y: clampNumber(Number(state?.y || 0), -100, 100),
    z: clampNumber(Number(state?.z || 0), -10000, 10000),
    yaw: clampNumber(Number(state?.yaw || 0), -Math.PI * 4, Math.PI * 4),
    speed: clampNumber(Number(state?.speed || 0), -300, 300),
    completedLaps: clampNumber(Number(state?.completedLaps || 0), 0, 99),
    nextCheckpointIndex: clampNumber(Number(state?.nextCheckpointIndex || 0), 0, 99),
    trackProgress: clampNumber(Number(state?.trackProgress || 0), 0, 100000),
    absoluteProgress: clampNumber(Number(state?.absoluteProgress || 0), 0, 100000),
    finished: Boolean(state?.finished),
    finishTime: clampNumber(Number(state?.finishTime || 0), 0, 36000),
  };
}

function normalizeTrackId(value) {
  return ["speedway", "canyon"].includes(value) ? value : "speedway";
}

function normalizeDifficultyId(value) {
  return ["casual", "expert", "legend"].includes(value) ? value : "expert";
}

function normalizeWeatherId(value) {
  return ["day", "dusk", "night"].includes(value) ? value : "day";
}

function clampNumber(value, min, max) {
  if (!Number.isFinite(value)) {
    return min;
  }
  return Math.min(max, Math.max(min, value));
}
