import { WebSocketServer } from "ws";

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
    sendJson(socket, { message: "Welcome to the Sportzz WebSocket server!" });
    socket.on("error", (error) => {
      console.error("WebSocket error:", error);
    });
  });

  function broadcastMatchUpdate(match) {
    broadcast(wss, { type: "match_update", data: match });
  }
  return { broadcastMatchUpdate };
}
