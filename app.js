const express = require("express");
const socket = require("socket.io");
const path = require("path");

const app = express();
const cors = require('cors');

const corsOptions = {
    cors: true,
    origin: '*'
};

app.use(cors(corsOptions));
app.use(express.static("public"));

app.get("/room", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "room.html"));
});

app.get("/:roomId", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
  });

let port = process.env.PORT || 5000;
let server = app.listen(port, () => {
    console.log("Listening to port " + port);
});

let io = socket(server);

io.on("connection", (socket) => {
    console.log("Made socket connection");
    const roomId = socket.handshake.query.roomId;
    socket.join(roomId);
    socket.on("beginPath", (data) => {
        io.to(roomId).emit("beginPath", data);
    });

    socket.on("drawStroke", (data) => {
        io.to(roomId).emit("drawStroke", data);
    });

    socket.on("redoUndo", (data) => {
        io.to(roomId).emit("redoUndo", data);
    });
    socket.on("stickyCreate", (data) => {
        io.to(roomId).emit("stickyCreate", data);
    });
    socket.on("stickyContainerMove", (data) => {
        io.to(roomId).emit("stickyContainerMove", data);
    });
    socket.on("stickyContainerDragStart", (data) => {
        io.to(roomId).emit("stickyContainerMove", data);
    });
    socket.on("stickyContainerActions", (data) => {
        io.to(roomId).emit("stickyContainerActions", data);
    });
    socket.on("txtchange", (data) => {
        io.to(roomId).emit("txtchange", data);
    });
    socket.on("optionToggle", (data) => {
        io.to(roomId).emit("optionToggle", data);
    });
});
