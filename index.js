const express = require('express');
const http = require('http');
const cors = require('cors');
const {Server} = require("socket.io");

const app = express();
app.use(cors());
const server = http.createServer(app);

const io = new Server(server , {
    cors: {
        origin: 'http://localhost:3000',
        methods: ['GET' , 'POST']
    }
})

let allUsers = [];
let chatRoomUsers;

io.on('connection', (socket) => {
    socket.on('join_room' , (data) => {
        let {username , room} = data;
        socket.join(room);
        let __createdtime__ = Date.now();
        socket.emit('user_info' , {
            id: socket.id,
            room,
            username,
            __createdtime__
        })        
        allUsers.push({id: socket.id , username , room})
        chatRoomUsers = allUsers.filter((user) => user.room == room); 
        io.emit('all_users' , {
            chatRoomUsers
        })      
        socket.on('message_sent' , (data) => {
            let {message} = data;
            io.to(room).emit('recieve_message' , {
                message,
                room,
                username,    
            })
        })    
        // let leavedRoom = allUsers.filter(user => user.username !== username);  
        socket.on('leave_room' , (data) => {
            io.emit('all_users' , {
                data
            })
            io.emit('user_info' , {}) 
        } )
     
    })              
})


server.listen('4000' , () => console.log('server has runned'));