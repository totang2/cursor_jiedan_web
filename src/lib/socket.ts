import { Server as NetServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { NextApiResponse } from 'next';

export type NextApiResponseWithSocket = NextApiResponse & {
    socket: {
        server: NetServer & {
            io?: SocketIOServer;
        };
    };
};

export const initSocket = (res: NextApiResponseWithSocket) => {
    if (!res.socket.server.io) {
        const io = new SocketIOServer(res.socket.server);
        res.socket.server.io = io;

        io.on('connection', (socket) => {
            console.log('Client connected:', socket.id);

            // 加入私人聊天室
            socket.on('join-chat', (chatId: string) => {
                socket.join(chatId);
                console.log(`User joined chat: ${chatId}`);
            });

            // 发送消息
            socket.on('send-message', (data: {
                chatId: string;
                message: string;
                senderId: string;
                senderName: string;
            }) => {
                io.to(data.chatId).emit('receive-message', {
                    ...data,
                    timestamp: new Date().toISOString(),
                });
            });

            // 用户正在输入
            socket.on('typing', (data: { chatId: string; userId: string; userName: string }) => {
                socket.to(data.chatId).emit('user-typing', {
                    userId: data.userId,
                    userName: data.userName,
                });
            });

            // 用户停止输入
            socket.on('stop-typing', (data: { chatId: string; userId: string }) => {
                socket.to(data.chatId).emit('user-stop-typing', {
                    userId: data.userId,
                });
            });

            socket.on('disconnect', () => {
                console.log('Client disconnected:', socket.id);
            });
        });
    }
    return res.socket.server.io;
}; 