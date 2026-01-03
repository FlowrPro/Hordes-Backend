import WebSocket, { WebSocketServer } from "ws";

/* =========================
   CLASHLANDS.IO SERVER CORE
   ========================= */

const PORT = process.env.PORT || 3000;
const TICK_RATE = 30;
const TICK_INTERVAL = 1000 / TICK_RATE;

const wss = new WebSocketServer({ port: PORT });
console.log(`⚔️ Clashlands.io backend running on port ${PORT}`);

let nextPlayerId = 1;
const players = new Map();

/*
Player object:
{
  id,
  x,
  y,
  vx,
  vy
}
*/

wss.on("connection", (ws) => {
  const id = nextPlayerId++;

  const player = {
    id,
    x: Math.random() * 2000,
    y: Math.random() * 2000,
    vx: 0,
    vy: 0
  };

  players.set(id, player);
  ws.playerId = id;

  console.log(`🟢 Player ${id} connected`);

  ws.on("message", (data) => {
    let msg;
    try {
      msg = JSON.parse(data);
    } catch {
      return;
    }

    if (msg.type === "input") {
      player.vx = msg.vx ?? 0;
      player.vy = msg.vy ?? 0;
    }
  });

  ws.on("close", () => {
    players.delete(id);
    console.log(`🔴 Player ${id} disconnected`);
  });
});

/* =========================
   GAME LOOP
   ========================= */

function tick() {
  for (const p of players.values()) {
    p.x += p.vx;
    p.y += p.vy;
  }

  const snapshot = {
    type: "snapshot",
    players: Array.from(players.values())
  };

  const payload = JSON.stringify(snapshot);

  for (const client of wss.clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(payload);
    }
  }
}

setInterval(tick, TICK_INTERVAL);

