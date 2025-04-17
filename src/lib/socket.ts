import { Server as SocketIOServer } from 'socket.io';

let io: SocketIOServer | null = null;

export const getIO = () => {
    if (!io) {
        console.log('🚀 Initializing Socket.IO server...');

        io = new SocketIOServer({
            path: '/api/socket',
            addTrailingSlash: false,
            cors: {
                origin: ['http://localhost:3000', 'http://localhost:3001'],
                methods: ['GET', 'POST', 'OPTIONS'],
                credentials: true,
                allowedHeaders: ['Content-Type', 'Authorization'],
            },
            transports: ['websocket', 'polling'],
            allowEIO3: true,
            pingTimeout: 60000,
            pingInterval: 25000,
            connectTimeout: 45000,
        });

        console.log('✅ Socket.IO server initialized with config:', {
            path: '/api/socket',
            cors: {
                origin: ['http://localhost:3000', 'http://localhost:3001'],
            },
            transports: ['websocket', 'polling'],
        });

        io.on('connection', (socket) => {
            console.log('👤 New client connected:', {
                id: socket.id,
                transport: socket.conn.transport.name,
                timestamp: new Date().toISOString(),
            });

            socket.on('join-chat', (chatId: string) => {
                socket.join(chatId);
                console.log('📥 User joined chat:', {
                    userId: socket.id,
                    chatId: chatId,
                    timestamp: new Date().toISOString(),
                });
            });

            socket.on('leave-chat', (chatId: string) => {
                socket.leave(chatId);
                console.log('📤 User left chat:', {
                    userId: socket.id,
                    chatId: chatId,
                    timestamp: new Date().toISOString(),
                });
            });

            socket.on('send-message', (data: { chatId: string; message: any }) => {
                console.log('💬 Message sent:', {
                    chatId: data.chatId,
                    messageId: data.message.id,
                    timestamp: new Date().toISOString(),
                });
                io?.to(data.chatId).emit('new-message', data.message);
            });

            socket.on('typing', (data: { chatId: string; userId: string }) => {
                console.log('⌨️ User typing:', {
                    userId: data.userId,
                    chatId: data.chatId,
                    timestamp: new Date().toISOString(),
                });
                socket.to(data.chatId).emit('user-typing', data.userId);
            });

            socket.on('stop-typing', (data: { chatId: string; userId: string }) => {
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

        io.engine.on('connection_error', (err) => {
            console.error('🔥 Engine connection error:', {
                error: err.message,
                timestamp: new Date().toISOString(),
            });
        });
    }
    return io;
}; 