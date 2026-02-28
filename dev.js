// dev.js — starts Next.js + Socket server together
// Run with: node dev.js

import { spawn } from "child_process";

// Start socket server
const socket = spawn("node", ["socket-server.js"], {
  stdio: "inherit",
  env: { ...process.env },
});

// Start Next.js
const nextjs = spawn("npx", ["next", "dev", "-p", "3000"], {
  stdio: "inherit",
  env: { ...process.env },
});

process.on("SIGINT", () => {
  socket.kill();
  nextjs.kill();
  process.exit();
});

socket.on("exit", () => { nextjs.kill(); process.exit(); });
nextjs.on("exit", () => { socket.kill(); process.exit(); });
