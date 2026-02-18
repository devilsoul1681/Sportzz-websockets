import express, { json } from "express";
import http from "http";
import dotenv from "dotenv";
dotenv.config();
import matchsRouter from "./src/routes/matches.js";
import setupWebSocketServer from "./src/ws/server.js";
const app = express();
const PORT = process.env.PORT || 8000;
const HOST = process.env.HOST || "0.0.0.0";
const server = http.createServer(app);

// Middleware
app.use(json());

// Routes
app.get("/", (req, res) => {
  res.json({ message: "Welcome to Sportzz API" });
});

app.use("/matches", matchsRouter);
const { broadcastMatchUpdate } = setupWebSocketServer(server);
app.locals.broadcastMatchUpdate = broadcastMatchUpdate;
// Start server
server.listen(PORT, HOST, () => {
  const baseURL =
    HOST === "0.0.0.0" ? `http://localhost:${PORT}` : `http://${HOST}:${PORT}`;
  console.log(`Server is running on ${baseURL}`);
  console.log(
    `WebSocket server is running on ${baseURL.replace(/^http/, "ws")}/ws`,
  );
});
