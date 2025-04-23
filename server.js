require('ts-node').register();
const http = require('http');
const { parse } = require('url');
const next = require('next');
const { Server } = require('socket.io');

const dev = process.env.NODE_ENV !== 'production';
console.log('🚀 Starting server in', dev ? 'development' : 'production', 'mode');

const app = next({ dev });
const handle = app.getRequestHandler();

// 增加数据库连接初始化
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// 在app.prepare前添加数据库连接
async function initializeDatabase() {
    try {
        console.log('🔌 Attempting to connect to database...');
        await prisma.$connect();
        console.log('✅ 数据库连接成功');
    } catch (error) {
        console.error('❌ 数据库连接失败:', error);
        process.exit(1);
    }
}

// 修改启动流程
async function startServer() {
    try {
        console.log('🔄 Initializing server...');
        await initializeDatabase();
        console.log('🔄 Preparing Next.js app...');
        await app.prepare();
        console.log('✅ Next.js app prepared successfully');

        const server = http.createServer((req, res) => {
            try {
                const parsedUrl = parse(req.url, true);
                handle(req, res, parsedUrl);
            } catch (error) {
                console.error('❌ Request handling error:', error);
                res.statusCode = 500;
                res.end('Internal Server Error');
            }
        });

        // 添加保持事件循环的定时器
        const heartbeat = setInterval(() => {
            console.log('❤️ 心跳检测:', new Date().toISOString());
        }, 30000);

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
            if (err) {
                console.error('❌ Server failed to start:', err);
                process.exit(1);
            }
            console.log(`✅ Server running on http://localhost:${PORT}`);
            console.log(`✅ WebSocket server is running on port ${PORT}`);
            console.log('✅ Socket.IO server is running and ready to accept connections');
        });

        // 优雅关闭处理
        const shutdown = async () => {
            console.log('🚨 收到终止信号，优雅关闭服务');
            clearInterval(heartbeat);
            io.close();
            await prisma.$disconnect();
            server.close(() => {
                console.log('✅ 服务已关闭');
                process.exit(0);
            });
        };

        process.on('SIGINT', shutdown);
        process.on('SIGTERM', shutdown);
        process.on('uncaughtException', (err) => {
            console.error('💥 Uncaught Exception:', err);
            shutdown();
        });
        process.on('unhandledRejection', (reason, promise) => {
            console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
            shutdown();
        });
    } catch (error) {
        console.error('💥 启动失败:', error);
        process.exit(1);
    }
}

// 启动服务器
startServer().catch((error) => {
    console.error('💥 启动失败:', error);
    process.exit(1);
});