const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const router = require('./router')
const cors = require('cors');
const port = process.env.PORT || 3001
const {getUser,getUserInRoom,addUser,removeUser} = require('./users')
const app = express();
const server = http.createServer(app);
const io = socketio(server);

// 

io.on('connection',(socket)=>{
    console.log("user joined")

    socket.on('join',({name,room},callback)=>{
        const {user,error} = addUser({id:socket.id,name,room});
        if(error){
            return callback(error);
        }
        socket.emit('message',{user:'admin',text:`${user.name} welcome to room ${user.room}`});
        socket.broadcast.to(user.room).emit('message',{user:'admin',text:`${user.name} has joined`})

        socket.join(user.room);

        io.to(user.room).emit('roomData',{room:user.room,users:getUserInRoom(user.room)})

        callback()
    })

    socket.on('sendMessage',(message,callback)=>{
        const user = getUser(socket.id);

        io.to(user.room).emit('message',{user:user.name,text:message});
        io.to(user.room).emit('roomData',{room:user.room,users:getUserInRoom(user.room)})
        callback()
    })

    socket.on('disconnect',()=>{
        const user = removeUser(socket.id);
        if(user){
            io.to(user.room).emit('message',{user:'admin',text:`${user.name} has left`})
        }
    })
})

// 


app.use(router);
app.use(cors());
server.listen(port,()=>{
    console.log(`server is up and running on ${port}`);
})