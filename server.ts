import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import http from "http";
import { Server } from "socket.io";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});

const PORT = 3000;

interface Player {
  id: string;
  name: string;
  score: number;
}

interface Room {
  id: string;
  hostId: string;
  players: Record<string, Player>;
  config: {
    start: number;
    end: number;
    timeLimit: number;
  };
  state: 'waiting' | 'playing' | 'completed';
  currentNumber: number | null;
  targetGeneratedAt: number | null;
  endTime: number | null;
}

const rooms: Record<string, Room> = {};

function generateRandomTarget(start: number, end: number): number {
  return Math.floor(Math.random() * (end - start + 1)) + start;
}

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  socket.on("create_room", (data, cb) => {
    // Generate simple 6 char room code
    const roomId = Math.random().toString(36).substring(2, 8).toUpperCase();
    const { name, config } = data;
    
    rooms[roomId] = {
      id: roomId,
      hostId: socket.id,
      players: {
        [socket.id]: { id: socket.id, name, score: 0 }
      },
      config,
      state: 'waiting',
      currentNumber: null,
      targetGeneratedAt: null,
      endTime: null,
    };
    
    socket.join(roomId);
    cb({ success: true, roomId, room: rooms[roomId] });
  });

  socket.on("join_room", (data, cb) => {
    const { roomId, name } = data;
    const room = rooms[roomId];
    if (!room) {
      return cb({ success: false, error: "Room not found" });
    }
    if (room.state !== 'waiting') {
      return cb({ success: false, error: "Game already started" });
    }
    
    // Check name uniqueness
    const nameExists = Object.values(room.players).some(p => p.name.toLowerCase() === name.toLowerCase());
    if (nameExists) {
      return cb({ success: false, error: "Name already taken in this room" });
    }
    
    room.players[socket.id] = { id: socket.id, name, score: 0 };
    socket.join(roomId);
    io.to(roomId).emit("room_updated", room);
    cb({ success: true, room });
  });

  socket.on("start_game", (roomId) => {
    const room = rooms[roomId];
    if (room && room.hostId === socket.id) {
      room.state = 'playing';
      room.endTime = Date.now() + room.config.timeLimit * 1000;
      room.currentNumber = generateRandomTarget(room.config.start, room.config.end);
      room.targetGeneratedAt = Date.now();
      
      // Reset scores just in case
      Object.values(room.players).forEach(p => p.score = 0);
      
      io.to(roomId).emit("game_started", room);
    }
  });

  socket.on("found_number", (data) => {
    const { roomId, number } = data;
    const room = rooms[roomId];
    if (!room || room.state !== 'playing') return;
    
    if (room.currentNumber === number) {
      const now = Date.now();
      // Calculate points
      const elapsedSeconds = (now - (room.targetGeneratedAt || now)) / 1000;
      let points = 10;
      if (elapsedSeconds < 2) points = 30;
      else if (elapsedSeconds < 5) points = 20;
      
      if (room.players[socket.id]) {
        room.players[socket.id].score += points;
      }
      
      const winnerName = room.players[socket.id]?.name || "Someone";
      
      // Pick new number
      room.currentNumber = generateRandomTarget(room.config.start, room.config.end);
      room.targetGeneratedAt = now;
      
      io.to(roomId).emit("number_found", {
        playerName: winnerName,
        pointsAwarded: points,
        room
      });
    }
  });

  socket.on("end_game", (roomId) => {
    const room = rooms[roomId];
    if (room && room.state === 'playing') {
      room.state = 'completed';
      io.to(roomId).emit("game_ended", room);
    }
  });

  socket.on("restart_game", (roomId) => {
    const room = rooms[roomId];
    if (room && room.hostId === socket.id) {
      room.state = 'waiting';
      // Clear scores
      Object.values(room.players).forEach(p => p.score = 0);
      io.to(roomId).emit("room_updated", room);
    }
  });

  socket.on("leave_room", (roomId) => {
    const room = rooms[roomId];
    if (room) {
      delete room.players[socket.id];
      socket.leave(roomId);
      if (Object.keys(room.players).length === 0) {
        delete rooms[roomId];
      } else {
        // If host leaves, maybe reassign host or just let it be (for simplicity)
        if (room.hostId === socket.id) {
          room.hostId = Object.keys(room.players)[0];
        }
        io.to(roomId).emit("room_updated", room);
      }
    }
  });

  socket.on("disconnect", () => {
    // Find rooms user was in and remove them
    for (const roomId in rooms) {
      const room = rooms[roomId];
      if (room.players[socket.id]) {
        delete room.players[socket.id];
        if (Object.keys(room.players).length === 0) {
          delete rooms[roomId];
        } else {
          if (room.hostId === socket.id) {
            room.hostId = Object.keys(room.players)[0];
          }
          io.to(roomId).emit("room_updated", room);
        }
      }
    }
  });
});

async function startServer() {
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
