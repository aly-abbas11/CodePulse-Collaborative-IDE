const express = require('express');
const app = express();

const http = require('http');
const path = require('path');
const {Server} = require('socket.io');

const ACTIONS = require('./src/actions/Actions');
const {executeCode} = require('./executeCode');

const server = http.createServer(app);
const io = new Server(server, {
    cors: {origin: '*'},
});

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});
app.use(express.json({limit: '128kb'}));

app.post('/api/execute', async (req, res) => {
    try {
        const {code, language, stdin} = req.body;
        if (!code || typeof code !== 'string') {
            return res.status(400).json({error: 'Code is required.'});
        }
        const result = await executeCode(code, language, stdin);
        res.json(result);
    } catch (err) {
        res.status(400).json({error: err.message});
    }
});

app.use(express.static(path.join(__dirname, 'build')));

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

const userSocketMap = {};
function getAllConnectedClients(roomId) {
    // Map
    return Array.from(io.sockets.adapter.rooms.get(roomId) || []).map(
        (socketId) => {
            return {
                socketId,
                username: userSocketMap[socketId],
            };
        }
    );
}

io.on('connection', (socket) => {
    console.log('socket connected', socket.id);

    socket.on(ACTIONS.JOIN, ({roomId, username}) => {
        userSocketMap[socket.id] = username;
        socket.join(roomId);
        const clients = getAllConnectedClients(roomId);
        clients.forEach(({socketId}) => {
            io.to(socketId).emit(ACTIONS.JOINED, {
                clients,
                username,
                socketId: socket.id,
            });
        });
    });

    socket.on(ACTIONS.CODE_CHANGE, ({roomId, code}) => {
        socket.in(roomId).emit(ACTIONS.CODE_CHANGE, {code});
    });

    socket.on(ACTIONS.SYNC_CODE, ({socketId, code}) => {
        io.to(socketId).emit(ACTIONS.CODE_CHANGE, {code});
    });

    socket.on(ACTIONS.RUN_CODE, async ({roomId, code, language, stdin, username}) => {
        try {
            const result = await executeCode(code, language, stdin);
            io.to(roomId).emit(ACTIONS.RUN_RESULT, {...result, username});
        } catch (err) {
            io.to(roomId).emit(ACTIONS.RUN_RESULT, {
                error: err.message,
                username,
            });
        }
    });

    socket.on('disconnecting', () => {
        const rooms = [...socket.rooms];
        rooms.forEach((roomId) => {
            socket.in(roomId).emit(ACTIONS.DISCONNECTED, {
                socketId: socket.id,
                username: userSocketMap[socket.id],
            });
        });
        delete userSocketMap[socket.id];
        socket.leave();
    });
});

const PORT = process.env.PORT || process.env.SERVER_PORT || 5000;
server.listen(PORT, '0.0.0.0', () =>
    console.log(`CodePulse server listening on 0.0.0.0:${PORT}`)
);