import WebSocket, { WebSocketServer } from "ws";
function sendJson(socket, payload) {
  if (socket.readyState !== WebSocket.OPEN) return;
  socket.send(JSON.stringify(payload));
}

function broadcast(wss, payload) {
  wss.clients.forEach((client) => {
    sendJson(client, payload);
  });
}

export default function setupWebSocketServer(server) {
  const wss = new WebSocketServer({
    server,
    path: "/ws",
    maxPayload: 1024 * 1024,
  });

  wss.on("connection", (socket) => {
    socket.isAlive = true;

    sendJson(socket, { message: "Welcome to the Sportzz WebSocket server!" });

    socket.on("pong", () => {
      socket.isAlive = true;
    });

    socket.on("error", (error) => {
      console.error("WebSocket error:", error);
    });

    socket.on("close", () => {
      socket.isAlive = false;
    });
  });

  // Heartbeat interval to detect dead connections
  const heartbeatInterval = setInterval(() => {
    wss.clients.forEach((socket) => {
      if (!socket.isAlive) {
        return socket.terminate();
      }

      socket.isAlive = false;
      socket.ping();
    });
  }, 30000); // 30 seconds

  // Cleanup on wss close
  wss.on("close", () => {
    clearInterval(heartbeatInterval);
  });

  function broadcastMatchUpdate(match) {
    broadcast(wss, { type: "match_update", data: match });
  }

  return { broadcastMatchUpdate };
}
