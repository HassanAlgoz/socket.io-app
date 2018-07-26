const path = require('path')
const logger = require('morgan')
const bodyParser = require('body-parser')
const express = require('express')
const app = express()
// Socket.IO
const http = require('http').Server(app)
const io = require('socket.io')(http)

const port = 3000
// Start the server
http.listen(port, () => {
    console.log('Listening on port ' + port)
})

// view engine setup
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))
app.use(express.static(path.join(__dirname, 'public')))
// middleware
app.use(logger('dev'))

// Routes
app.get('/chat', (req, res) => {
    res.render('chat')
})

io.on('connection', function (socket) {

    // Every socket connection has a unique ID
    console.log('new connection: ' + socket.id)

    // Message Recieved
    socket.on('msg', (message) => {
        // Broadcast to everyone else (except the sender)
        socket.broadcast.emit('msg', {
            from: socket.id,
            message: message
        })
        // Send back the same message to the sender
        socket.emit('msg', {
            from: socket.id,
            message: message
        })
        // You could just do: io.emit('msg', ...)
        // which will send the message to all, including
        // the sender.
    })

    // Disconnected
    socket.on('disconnect', function () {
        console.log('disconnect: ' + socket.id)
        // io.emit('disconnect', socket.id)
    })
})