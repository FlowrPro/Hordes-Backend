// Minimal backend WebSocket scaffold for future networking (Node)
// Accepts WebSocket upgrades and provides a small placeholder protocol.
// Usage: node Server.js
const express = require('express');
const http = require('http');
const WebSocket = require('ws');

const PORT = process.env.PORT || 8080;
const app = express();

// (Optional) serve a status route
app.get('/', (req, res) => res.send('io-backend: WebSocket server running'));

// Create HTTP server and attach WebSocket server (useful for same-host deployments)
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws, req) => {
  console.log('Client connected:', req.socket.remoteAddress);

  // Send a simple welcome message (clients can later upgrade to in-game protocol)
  ws.send(JSON.stringify({ type: 'welcome', serverTime: Date.now() }));

  ws.on('message', (data) => {
    // Basic echo of parsed JSON for now; in next steps we'll handle typed messages (join, input, ping, etc.)
    try {
      const msg = JSON.parse(data);
      console.log('received:', msg);

      // Simple debug behaviour: respond to ping
      if (msg.type === 'ping') {
        ws.send(JSON.stringify({ type: 'pong', ts: Date.now() }));
      }

      // Future: handle 'join', 'input', etc.
    } catch (err) {
      // ignore non-JSON
    }
  });

  ws.on('close', () => console.log('Client disconnected'));
});

server.listen(PORT, () => {
  console.log(`Server listening on http://0.0.0.0:${PORT} (WS upgraded on same port)`);
});
