const express = require("express");
const path = require("path");
const http = require("http");
const socketio = require("socket.io");
const {userJoin, getCurrentUser, userLeaves, getRoomUsers} = require("./utils/users");
const formatMessage = require("./utils/messages");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

// Set static folder
app.use(express.static(path.join(__dirname, "public")));

let botName = "App";

// run when client connects
io.on("connection", socket => {
    socket.on("joinRoom", ({username, room}) => {
        // Broadcast when a user connects

        const user = userJoin(socket.id, username, room);

        socket.join(user.room);
        socket.emit("room-enter-leave", formatMessage(botName, "Welcome to the room"));

        // this will broadcase the message to everyone accept the user who is connecting
        socket.broadcast.to(user.room).emit("room-enter-leave", formatMessage(botName, `${user.username} has joined the chat`));

        // send users and room info
        io.to(user.room).emit("roomUsers", {
            room : user.room,
            users : getRoomUsers(user.room)
        })
    })
    // sending message to the client side
    // open bidirectionaly communication

    // listen for chatMessage
    socket.on("chatMessage", (msg) => {
        
        const user = getCurrentUser(socket.id);

        console.log("Encrypted Message received : " + msg);

        socket.broadcast.to(user.room).emit("message", formatMessage(user.username, msg));
    })

    // Runs when client Disconnects
    socket.on("disconnect", () => {
        const user = userLeaves(socket.id);

        if(user) {
            io.to(user.room).emit("room-enter-leave", formatMessage(botName, `${user.username} has left the chat`));

            // send usres and room info
            io.to(user.room).emit("roomUsers", {
                room : user.room,
                users : getRoomUsers(user.room)
            })
        }
    })
})

const PORT = 5000;

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
})