'use client';

import { useEffect, useRef, useState } from 'react';
import {
    Box,
    VStack,
    HStack,
    Text,
    Input,
    Button,
    Avatar,
    useToast,
    Divider,
    Spinner,
} from '@chakra-ui/react';
import { useSession } from 'next-auth/react';
import io, { Socket } from 'socket.io-client';

interface Message {
    id: string;
    chatId: string;
    content: string;
    senderId: string;
    sender: {
        id: string;
        name: string;
        profile?: {
            avatar?: string;
        };
    };
    createdAt: string;
    read: boolean;
}

interface ChatWindowProps {
    chatId: string;
    otherUser: {
        id: string;
        name: string;
        avatar?: string;
    };
}

export default function ChatWindow({ chatId, otherUser }: ChatWindowProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [typingUser, setTypingUser] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const socketRef = useRef<Socket | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const { data: session } = useSession();
    const toast = useToast();

    // 加载消息历史
    useEffect(() => {
        const fetchMessages = async () => {
            try {
                const response = await fetch(`/api/chats/${chatId}/messages`);
                if (!response.ok) {
                    throw new Error('获取消息历史失败');
                }
                const data = await response.json();
                setMessages(data);
                scrollToBottom();
            } catch (error) {
                toast({
                    title: '错误',
                    description: '获取消息历史失败',
                    status: 'error',
                    duration: 3000,
                    isClosable: true,
                });
            } finally {
                setLoading(false);
            }
        };

        if (session?.user) {
            fetchMessages();
        }
    }, [chatId, session, toast]);

    // 初始化 Socket.IO 连接
    useEffect(() => {
        const initSocket = async () => {
            await fetch('/api/socket');
            socketRef.current = io();

            socketRef.current.on('connect', () => {
                console.log('Connected to socket server');
                socketRef.current?.emit('join-chat', chatId);
            });

            socketRef.current.on('receive-message', (message: Message) => {
                setMessages((prev) => [...prev, message]);
                scrollToBottom();
            });

            socketRef.current.on('user-typing', (data: { userName: string }) => {
                setTypingUser(data.userName);
                setIsTyping(true);
            });

            socketRef.current.on('user-stop-typing', () => {
                setIsTyping(false);
                setTypingUser(null);
            });
        };

        initSocket();

        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
            }
        };
    }, [chatId]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleSendMessage = async () => {
        if (!newMessage.trim() || !session?.user) return;

        try {
            // 发送消息到服务器
            const response = await fetch(`/api/chats/${chatId}/messages`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ content: newMessage }),
            });

            if (!response.ok) {
                throw new Error('发送消息失败');
            }

            const message = await response.json();

            // 通过 Socket.IO 发送消息
            socketRef.current?.emit('send-message', {
                chatId,
                message: message.content,
                senderId: session.user.id,
                senderName: session.user.name || 'Unknown',
            });

            setNewMessage('');
        } catch (error) {
            toast({
                title: '错误',
                description: '发送消息失败',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
        }
    };

    const handleTyping = () => {
        if (!session?.user) return;

        socketRef.current?.emit('typing', {
            chatId,
            userId: session.user.id,
            userName: session.user.name || 'Unknown',
        });

        const timeout = setTimeout(() => {
            socketRef.current?.emit('stop-typing', {
                chatId,
                userId: session.user.id,
            });
        }, 1000);

        return () => clearTimeout(timeout);
    };

    if (loading) {
        return (
            <Box
                borderWidth="1px"
                borderRadius="lg"
                overflow="hidden"
                h="600px"
                display="flex"
                alignItems="center"
                justifyContent="center"
            >
                <Spinner size="xl" />
            </Box>
        );
    }

    return (
        <Box
            borderWidth="1px"
            borderRadius="lg"
            overflow="hidden"
            h="600px"
            display="flex"
            flexDirection="column"
        >
            {/* 聊天头部 */}
            <Box p={4} borderBottomWidth="1px">
                <HStack spacing={3}>
                    <Avatar size="sm" name={otherUser.name} src={otherUser.avatar} />
                    <Text fontWeight="bold">{otherUser.name}</Text>
                </HStack>
            </Box>

            {/* 消息列表 */}
            <VStack
                flex={1}
                overflowY="auto"
                p={4}
                spacing={4}
                align="stretch"
            >
                {messages.map((message) => (
                    <Box
                        key={message.id}
                        alignSelf={
                            message.senderId === session?.user?.id ? 'flex-end' : 'flex-start'
                        }
                        maxW="70%"
                    >
                        <HStack
                            spacing={2}
                            align="start"
                            direction={message.senderId === session?.user?.id ? 'row-reverse' : 'row'}
                        >
                            <Avatar
                                size="sm"
                                name={message.sender.name}
                                src={message.sender.profile?.avatar}
                            />
                            <Box>
                                <Text
                                    bg={message.senderId === session?.user?.id ? 'blue.500' : 'gray.100'}
                                    color={message.senderId === session?.user?.id ? 'white' : 'black'}
                                    p={2}
                                    borderRadius="lg"
                                >
                                    {message.content}
                                </Text>
                                <Text fontSize="xs" color="gray.500" mt={1}>
                                    {new Date(message.createdAt).toLocaleTimeString()}
                                </Text>
                            </Box>
                        </HStack>
                    </Box>
                ))}
                {isTyping && typingUser && (
                    <Text fontSize="sm" color="gray.500">
                        {typingUser} 正在输入...
                    </Text>
                )}
                <div ref={messagesEndRef} />
            </VStack>

            {/* 输入框 */}
            <Box p={4} borderTopWidth="1px">
                <HStack>
                    <Input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                                handleSendMessage();
                            }
                        }}
                        onKeyDown={handleTyping}
                        placeholder="输入消息..."
                    />
                    <Button
                        colorScheme="blue"
                        onClick={handleSendMessage}
                        isDisabled={!newMessage.trim()}
                    >
                        发送
                    </Button>
                </HStack>
            </Box>
        </Box>
    );
} 