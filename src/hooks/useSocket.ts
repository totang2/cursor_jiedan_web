import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

export const useSocket = () => {
    const [socket, setSocket] = useState<Socket | null>(null);

    useEffect(() => {
        const initSocket = async () => {
            try {
                // Explicitly use port 3001 for development
                const baseUrl = process.env.NODE_ENV === 'development'
                    ? 'http://localhost:3001'
                    : window.location.origin;

                // Initialize Socket.IO server
                await fetch(`${baseUrl}/api/socket`);

                // Create Socket.IO client
                const socketInstance = io(baseUrl, {
                    path: '/api/socket',
                    addTrailingSlash: false,
                    transports: ['websocket', 'polling'],
                    reconnection: true,
                    reconnectionAttempts: 5,
                    reconnectionDelay: 1000,
                });

                socketInstance.on('connect', () => {
                    console.log('Socket connected:', socketInstance.id);
                });

                socketInstance.on('connect_error', (error) => {
                    console.error('Socket connection error:', error);
                });

                socketInstance.on('disconnect', (reason) => {
                    console.log('Socket disconnected:', reason);
                });

                setSocket(socketInstance);

                return () => {
                    socketInstance.disconnect();
                };
            } catch (error) {
                console.error('Failed to initialize socket:', error);
            }
        };

        initSocket();
    }, []);

    return socket;
}; 