import { Server as SocketIOServer } from 'socket.io';

let io: SocketIOServer | null = null;

export const getIO = () => {
    if (!io) {
        io = new SocketIOServer({
            path: '/api/socket',
            addTrailingSlash: false,
            cors: {
                origin: process.env.NODE_ENV === 'development'
                    ? 'http://localhost:3001'
                    : process.env.NEXT_PUBLIC_BASE_URL,
                methods: ['GET', 'POST'],
                credentials: true,
            },
            transports: ['websocket', 'polling'],
            allowEIO3: true,
            pingTimeout: 60000,
            pingInterval: 25000,
        });

        io.on('connection', (socket) => {
            console.log('Client connected:', socket.id);

            socket.on('join-chat', (chatId: string) => {
                socket.join(chatId);
                console.log(`User ${socket.id} joined chat: ${chatId}`);
            });

            socket.on('leave-chat', (chatId: string) => {
                socket.leave(chatId);
                console.log(`User ${socket.id} left chat: ${chatId}`);
            });

            socket.on('send-message', (data: { chatId: string; message: any }) => {
                console.log('Sending message to chat:', data.chatId);
                io?.to(data.chatId).emit('new-message', data.message);
            });

            socket.on('typing', (data: { chatId: string; userId: string }) => {
                socket.to(data.chatId).emit('user-typing', data.userId);
            });

            socket.on('stop-typing', (data: { chatId: string; userId: string }) => {
                socket.to(data.chatId).emit('user-stop-typing', data.userId);
            });

            socket.on('disconnect', () => {
                console.log('Client disconnected:', socket.id);
            });
        });
    }
    return io;
}; 