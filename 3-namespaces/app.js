const express = require('express');
const app = express()
const http = require('http').Server(app)
const io = require('socket.io')(http)
const path = require('path')
const logger = require('morgan')
const bodyParser = require('body-parser')


const port = process.env.PORT || 3000
app.set('port', port)

http.listen(port, () => {
    console.log('listening on port ' + port)
});

// view engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, '/public')));

// middleware
app.use(logger('dev'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

let namespaces = ['one', 'two', 'three'];

for (let i = 0; i < namespaces.length; i++) {
    const ns = io.of('/' + namespaces[i]);
    // users is a key-value pairs of socket.id -> user name
    let users = {};
    ns.on('connection', (socket) => {
        // Every socket connection has a unique ID
        console.log('new connection: ' + socket.id)

        // User Logged in
        socket.on('login', (name) => {
            // Map socket.id to the name
            users[socket.id] = name;

            // Broadcast to everyone else (except the sender).
            // Say that the user has logged in.
            socket.broadcast.emit('msg', {
                from: 'server',
                message: `${name} logged in.`
            })
        })

        // Message Recieved
        socket.on('msg', (message) => {
            // Broadcast to everyone else (except the sender)
            socket.broadcast.emit('msg', {
                from: users[socket.id],
                message: message
            })
            // Send back the same message to the sender
            socket.emit('msg', {
                from: users[socket.id],
                message: message
            })
            // You could just do: io.emit('msg', ...)
            // which will send the message to all, including
            // the sender.
        })

        // Disconnected
        socket.on('disconnect', function () {
            // Remove the socket.id -> name mapping of this user
            console.log('disconnect: ' + users[socket.id])
            delete users[socket.id]
            // io.emit('disconnect', socket.id)
        })
    })

}

// Routes
app.get('/lobby', (req, res) => {
    res.render('lobby', {
        namespaces: namespaces
    })
})

app.get('/chat/:namespace', (req, res) => {
    let namespace = req.params.namespace;
    if (!namespaces.includes(namespace)) {
        return res.sendStatus(404);
    }
    res.render('chat')
})