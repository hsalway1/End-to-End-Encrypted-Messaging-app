const chatForm = document.getElementById("chat-form");
const chatMessages = document.querySelector(".chat-messages");

const encryption_key = "hfds82343gdsFDFs#";

const {username, room } = Qs.parse(location.search, {
    ignoreQueryPrefix : true
});

const socket = io("http://localhost:5000");

// join chatroom
socket.emit("joinRoom", {username, room});

socket.on("room-enter-leave", message => {
    outputMessage(message, false);

    // scroll down
    chatMessages.scrollTop = chatMessages.scrollHeight;
})

// get room and usrs
socket.on('roomUsers', ({room, users}) => {
    outputRoomName(room);
    outputUsers(users);
})

// message from server
socket.on("message", message => {
    outputMessage(message);

    // scroll down
    chatMessages.scrollTop = chatMessages.scrollHeight;
})

chatForm.addEventListener("submit", (e) => {
    e.preventDefault();  // preventing the default behavior

    const msg = e.target.elements.msg.value;
    e.target.elements.msg.value = "";

    let encrypted = CryptoJS.AES.encrypt(msg, encryption_key);
    let today = new Date();
    let hours = today.getHours();
    let minutes = today.getMinutes();
    let ampm = hours >= 12 ? "pm" : "am";

    const div = document.createElement("div");
    div.classList.add("message");
    div.style.background = "rgb(7, 94, 84)";
    div.style.float = "right";
    div.innerHTML = `<p class = "meta" style = "color : #3098f;">You <span>  ${hours}:${minutes} ${ampm}</span></p>
    <p class = "text">
    ${msg}
    </p>`;
    document.querySelector(".chat-messages").appendChild(div);

    chatMessages.scrollTop = chatMessages.scrollHeight;

    // emitting the message to server
    socket.emit("chatMessage", encrypted.toString());
})

// output message to dom
function outputMessage(message, fromUser = true){
    let msg;
    if (fromUser){
        msg = CryptoJS.AES.decrypt(message.text, encryption_key).toString(CryptoJS.enc.Utf8);
    }

    else{
        msg = message.text;
    }
    const div = document.createElement("div");
    div.classList.add("message");
    div.innerHTML = `<p class = "meta">${message.username} <span>  ${message.time}</span></p>
    <p class = "text">
    ${msg}
    </p>`;
    document.querySelector(".chat-messages").appendChild(div);
}

// add room name to dom
function outputRoomName(room){
    document.getElementById("room-name").innerText = room;
}

function outputUsers(users){
    let userList = document.getElementById("users");
    userList.innerHTML = "";
    for (let user of users){
        let li = document.createElement("li");
        li.innerText = user.username;

        userList.appendChild(li);
    }
}