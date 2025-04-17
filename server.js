require('ts-node').register();
const http = require('http');
const { parse } = require('url');
const next = require('next');
const { Server } = require('socket.io');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
    console.log('🚀 Preparing Next.js app...');

    const server = http.createServer((req, res) => {
        const parsedUrl = parse(req.url, true);
        handle(req, res, parsedUrl);
    });

    // Initialize Socket.IO server
    console.log('🔌 Initializing Socket.IO server...');
    const io = new Server(server, {
        path: '/api/socket',
        addTrailingSlash: false,
        cors: {
            origin: ['http://localhost:3000', 'http://localhost:3001'],
            methods: ['GET', 'POST', 'OPTIONS'],
            credentials: true,
        },
        transports: ['websocket', 'polling'],
        pingTimeout: 60000,
        pingInterval: 25000,
    });

    // Socket.IO event handlers
    io.on('connection', (socket) => {
        console.log('👤 New client connected:', {
            id: socket.id,
            transport: socket.conn.transport.name,
            timestamp: new Date().toISOString(),
        });

        // 测试消息处理
        socket.on('test-message', (message) => {
            console.log('📝 Test message received:', {
                from: socket.id,
                message: message,
                timestamp: new Date().toISOString(),
            });

            // 将消息回显给发送者
            socket.emit('test-message', message);
        });

        socket.on('join-chat', (chatId) => {
            socket.join(chatId);
            console.log('📥 User joined chat:', {
                userId: socket.id,
                chatId: chatId,
                timestamp: new Date().toISOString(),
            });
        });

        socket.on('leave-chat', (chatId) => {
            socket.leave(chatId);
            console.log('📤 User left chat:', {
                userId: socket.id,
                chatId: chatId,
                timestamp: new Date().toISOString(),
            });
        });

        socket.on('send-message', (data) => {
            console.log('💬 Message sent:', {
                chatId: data.chatId,
                messageId: data.message.id,
                timestamp: new Date().toISOString(),
            });
            io.to(data.chatId).emit('new-message', data.message);
        });

        socket.on('typing', (data) => {
            console.log('⌨️ User typing:', {
                userId: data.userId,
                chatId: data.chatId,
                timestamp: new Date().toISOString(),
            });
            socket.to(data.chatId).emit('user-typing', data.userId);
        });

        socket.on('stop-typing', (data) => {
            console.log('⏹️ User stopped typing:', {
                userId: data.userId,
                chatId: data.chatId,
                timestamp: new Date().toISOString(),
            });
            socket.to(data.chatId).emit('user-stop-typing', data.userId);
        });

        socket.on('disconnect', (reason) => {
            console.log('👋 Client disconnected:', {
                id: socket.id,
                reason: reason,
                timestamp: new Date().toISOString(),
            });
        });

        socket.on('error', (error) => {
            console.error('❌ Socket error:', {
                id: socket.id,
                error: error.message,
                timestamp: new Date().toISOString(),
            });
        });

        socket.on('connect_error', (error) => {
            console.error('⚠️ Connection error:', {
                id: socket.id,
                error: error.message,
                timestamp: new Date().toISOString(),
            });
        });
    });

    // Start the server
    const PORT = process.env.PORT || 3000;
    server.listen(PORT, (err) => {
        if (err) throw err;
        console.log(`✅ Server running on http://localhost:${PORT}`);
        console.log(`✅ WebSocket server is running on port ${PORT}`);
        console.log('✅ Socket.IO server is running and ready to accept connections');
    });
}); 