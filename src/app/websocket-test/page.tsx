'use client';

import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { Box, Button, Container, Heading, Text, VStack, Input, useToast } from '@chakra-ui/react';

export default function WebSocketTest() {
    const [socket, setSocket] = useState<any>(null);
    const [connected, setConnected] = useState(false);
    const [messages, setMessages] = useState<string[]>([]);
    const [inputMessage, setInputMessage] = useState('');
    const toast = useToast();

    useEffect(() => {
        // 连接到 WebSocket 服务器
        const socket = io('http://localhost:3000', {
            path: '/api/socket',
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
            timeout: 20000,
        });

        socket.on('connect', () => {
            console.log('Connected to WebSocket server');
            setConnected(true);
            toast({
                title: '连接成功',
                description: '已成功连接到 WebSocket 服务器',
                status: 'success',
                duration: 3000,
                isClosable: true,
            });
        });

        socket.on('disconnect', () => {
            console.log('Disconnected from WebSocket server');
            setConnected(false);
            toast({
                title: '连接断开',
                description: '与 WebSocket 服务器的连接已断开',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
        });

        socket.on('connect_error', (error) => {
            console.error('Connection error:', error);
            toast({
                title: '连接错误',
                description: `无法连接到 WebSocket 服务器: ${error.message}`,
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
        });

        // 监听测试消息
        socket.on('test-message', (message) => {
            console.log('Received test message:', message);
            setMessages((prev) => [...prev, `收到: ${message}`]);
        });

        setSocket(socket);

        // 清理函数
        return () => {
            socket.disconnect();
        };
    }, [toast]);

    const sendTestMessage = () => {
        if (socket && inputMessage.trim()) {
            console.log('Sending test message:', inputMessage);
            socket.emit('test-message', inputMessage);
            setMessages((prev) => [...prev, `发送: ${inputMessage}`]);
            setInputMessage('');
        }
    };

    return (
        <Container maxW="container.md" py={8}>
            <VStack spacing={6} align="stretch">
                <Heading>WebSocket 测试页面</Heading>

                <Box p={4} borderWidth={1} borderRadius="md">
                    <Text>连接状态: {connected ? '已连接' : '未连接'}</Text>
                    <Text>Socket ID: {socket?.id || '未连接'}</Text>
                </Box>

                <Box>
                    <Input
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        placeholder="输入测试消息"
                        mb={2}
                    />
                    <Button
                        colorScheme="blue"
                        onClick={sendTestMessage}
                        isDisabled={!connected || !inputMessage.trim()}
                    >
                        发送测试消息
                    </Button>
                </Box>

                <Box p={4} borderWidth={1} borderRadius="md" maxH="300px" overflowY="auto">
                    <Heading size="md" mb={2}>消息记录</Heading>
                    {messages.length === 0 ? (
                        <Text color="gray.500">暂无消息</Text>
                    ) : (
                        <VStack align="stretch" spacing={2}>
                            {messages.map((msg, index) => (
                                <Text key={index}>{msg}</Text>
                            ))}
                        </VStack>
                    )}
                </Box>
            </VStack>
        </Container>
    );
} 