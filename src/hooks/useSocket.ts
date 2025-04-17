import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useSession } from 'next-auth/react';

export const useSocket = () => {
    const { data: session } = useSession();
    const [isConnected, setIsConnected] = useState(false);
    const socketRef = useRef<Socket | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!session?.user?.email) return;

        const connectSocket = async () => {
            try {
                // Initialize socket connection
                const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001', {
                    path: '/api/socket',
                    transports: ['websocket', 'polling'],
                    reconnection: true,
                    reconnectionAttempts: 5,
                    reconnectionDelay: 1000,
                    timeout: 20000,
                });

                // Connection event handlers
                socket.on('connect', () => {
                    console.log('Socket connected');
                    setIsConnected(true);
                    setError(null);
                });

                socket.on('connect_error', (err) => {
                    console.error('Socket connection error:', err);
                    setError('Failed to connect to chat server');
                    setIsConnected(false);
                });

                socket.on('disconnect', (reason) => {
                    console.log('Socket disconnected:', reason);
                    setIsConnected(false);
                });

                socket.on('error', (err) => {
                    console.error('Socket error:', err);
                    setError('Chat server error occurred');
                });

                socketRef.current = socket;

                return () => {
                    if (socket) {
                        socket.disconnect();
                    }
                };
            } catch (err) {
                console.error('Socket initialization error:', err);
                setError('Failed to initialize chat connection');
            }
        };

        connectSocket();
    }, [session?.user?.email]);

    const joinChat = (chatId: string) => {
        if (!socketRef.current || !isConnected) {
            console.warn('Socket not connected, attempting to reconnect...');
            setError('Chat connection lost. Reconnecting...');
            return;
        }

        try {
            socketRef.current.emit('join-chat', chatId);
            console.log('Joined chat:', chatId);
        } catch (err) {
            console.error('Error joining chat:', err);
            setError('Failed to join chat');
        }
    };

    const leaveChat = (chatId: string) => {
        if (!socketRef.current || !isConnected) {
            console.warn('Socket not connected');
            return;
        }

        try {
            socketRef.current.emit('leave-chat', chatId);
            console.log('Left chat:', chatId);
        } catch (err) {
            console.error('Error leaving chat:', err);
            setError('Failed to leave chat');
        }
    };

    const sendMessage = (chatId: string, message: any) => {
        if (!socketRef.current || !isConnected) {
            console.warn('Socket not connected');
            setError('Chat connection lost. Message not sent.');
            return;
        }

        try {
            socketRef.current.emit('send-message', { chatId, message });
            console.log('Message sent to chat:', chatId);
        } catch (err) {
            console.error('Error sending message:', err);
            setError('Failed to send message');
        }
    };

    const onNewMessage = (callback: (message: any) => void) => {
        if (!socketRef.current || !isConnected) {
            console.warn('Socket not connected');
            return;
        }

        try {
            socketRef.current.on('new-message', callback);
            return () => {
                socketRef.current?.off('new-message', callback);
            };
        } catch (err) {
            console.error('Error setting up message listener:', err);
            setError('Failed to set up message listener');
        }
    };

    return {
        socket: socketRef.current,
        isConnected,
        error,
        joinChat,
        leaveChat,
        sendMessage,
        onNewMessage,
    };
}; 