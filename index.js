import express, { json } from "express";
import matchsRouter from "./src/routes/matches.js";
const app = express();
const PORT = 8000;

// Middleware
app.use(json());

// Routes
app.get("/", (req, res) => {
  res.json({ message: "Welcome to Sportzz API" });
});

app.use("/matches", matchsRouter);

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
