const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const Filter = require('bad-words')
const { generateMessage, generateLocation } = require('./utils/messages')
const {addUser, removeUsers, getUser, getUsersInRooms} = require('./utils/users')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT || 3000
const publicDirectoryPath = path.join(__dirname, '../public')

app.use(express.static(publicDirectoryPath))



io.on('connection', (socket) => {
    console.log('New WebSocket connection')

    socket.on('join', (options, callback) => {
        const {error, user} = addUser({id: socket.id,...options})

        if(error){
            return callback(error)
        }
        socket.join(user.room)

        socket.emit('message', generateMessage('Welcome'))
        socket.broadcast.to(user.room).emit('message', generateMessage(`${user.username} has joined`))

        callback()
    })

    socket.on('sendMessage', (message, callback)=> {

        const filter = new Filter()

        if(filter.isProfane(message)){
            return callback('Profanity is not allowed')
        }
        
        io.to('araf').emit('message', generateMessage(message))
        callback('delivered')
    })

    socket.on('sendLocation', (coords, callback) => {
        io.emit('locationMessage', generateLocation(`https://google.com/maps?q=${coords.latitude},${coords.longitude}`))
        callback()
    })
    socket.on('disconnect', () => {
        const user = removeUsers(socket.id)

        if(user){
            
        io.to(user.room).emit('message', generateMessage(`${user.username} has left`))
        }

    })

})

server.listen(port, () => {
    console.log(`Server is up on port ${port}`)
})