'use client';

import { useEffect, useState, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
    Box,
    Container,
    VStack,
    HStack,
    Text,
    Input,
    Button,
    Avatar,
    useToast,
    Spinner,
} from '@chakra-ui/react';
import { useSocket } from '@/hooks/useSocket';

interface Message {
    id: string;
    content: string;
    senderId: string;
    createdAt: string;
}

interface ChatUser {
    id: string;
    name: string;
    email: string;
    image: string | null;
}

export default function ChatPage({ params }: { params: { id: string } }) {
    const { data: session, status } = useSession();
    const router = useRouter();
    const toast = useToast();
    const [messages, setMessages] = useState<Message[]>([]);
    const [otherUser, setOtherUser] = useState<ChatUser | null>(null);
    const [loading, setLoading] = useState(true);
    const [newMessage, setNewMessage] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const socket = useSocket();

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login');
        }
    }, [status, router]);

    useEffect(() => {
        if (status === 'authenticated' && socket) {
            fetchMessages();

            // 加入聊天室
            socket.emit('join-chat', params.id);
            console.log('Joining chat:', params.id);

            // 监听新消息
            socket.on('new-message', (message: Message) => {
                console.log('Received new message:', message);
                setMessages(prev => [...prev, message]);
                scrollToBottom();
            });

            // 监听输入状态
            socket.on('user-typing', (userId: string) => {
                if (userId !== session?.user?.id) {
                    setIsTyping(true);
                }
            });

            socket.on('user-stop-typing', (userId: string) => {
                if (userId !== session?.user?.id) {
                    setIsTyping(false);
                }
            });

            // 监听连接错误
            socket.on('connect_error', (error) => {
                console.error('Socket connection error:', error);
                toast({
                    title: '连接错误',
                    description: '无法连接到聊天服务器',
                    status: 'error',
                    duration: 3000,
                });
            });

            return () => {
                console.log('Leaving chat:', params.id);
                socket.emit('leave-chat', params.id);
                socket.off('new-message');
                socket.off('user-typing');
                socket.off('user-stop-typing');
                socket.off('connect_error');
            };
        }
    }, [status, socket, params.id, session?.user?.id]);

    const fetchMessages = async () => {
        try {
            const response = await fetch(`/api/chats/${params.id}/messages`);
            if (!response.ok) {
                throw new Error('Failed to fetch messages');
            }
            const data = await response.json();
            setMessages(data.messages);
            setOtherUser(data.otherUser);
            scrollToBottom();
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to load messages',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
        } finally {
            setLoading(false);
        }
    };

    const handleSendMessage = async () => {
        if (!newMessage.trim() || !socket) return;

        try {
            const response = await fetch(`/api/chats/${params.id}/messages`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ content: newMessage }),
            });

            if (!response.ok) {
                throw new Error('Failed to send message');
            }

            const message = await response.json();

            // 立即更新本地消息列表
            setMessages(prev => [...prev, message]);

            // 发送到 WebSocket
            socket.emit('send-message', {
                chatId: params.id,
                message: {
                    ...message,
                    sender: {
                        id: session?.user?.id,
                        name: session?.user?.name,
                        image: session?.user?.image,
                    },
                },
            });

            setNewMessage('');
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        } catch (error) {
            console.error('Error sending message:', error);
            toast({
                title: '发送消息失败',
                status: 'error',
                duration: 3000,
            });
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleTyping = () => {
        if (!socket) return;
        socket.emit('typing', { chatId: params.id, userId: session?.user?.id });
    };

    const handleStopTyping = () => {
        if (!socket) return;
        socket.emit('stop-typing', { chatId: params.id, userId: session?.user?.id });
    };

    if (status === 'loading' || loading) {
        return (
            <Container maxW="container.xl" py={8}>
                <Box display="flex" justifyContent="center" alignItems="center" minH="200px">
                    <Spinner size="xl" />
                </Box>
            </Container>
        );
    }

    return (
        <Container maxW="container.xl" py={8}>
            <VStack spacing={4} align="stretch" h="calc(100vh - 200px)">
                <HStack spacing={4} p={4} borderBottomWidth={1}>
                    <Avatar
                        size="md"
                        name={otherUser?.name || ''}
                        src={otherUser?.image || ''}
                    />
                    <Text fontWeight="bold">{otherUser?.name || '未知用户'}</Text>
                    {isTyping && (
                        <Text color="gray.500" fontSize="sm">
                            正在输入...
                        </Text>
                    )}
                </HStack>

                <Box flex={1} overflowY="auto" p={4}>
                    <VStack spacing={4} align="stretch">
                        {messages?.map((message) => (
                            <HStack
                                key={message.id}
                                spacing={4}
                                alignSelf={message.senderId === session?.user?.id ? 'flex-end' : 'flex-start'}
                            >
                                {message.senderId !== session?.user?.id && (
                                    <Avatar
                                        size="sm"
                                        name={otherUser?.name || ''}
                                        src={otherUser?.image || ''}
                                    />
                                )}
                                <Box
                                    maxW="70%"
                                    p={3}
                                    borderRadius="lg"
                                    bg={message.senderId === session?.user?.id ? 'blue.500' : 'gray.100'}
                                    color={message.senderId === session?.user?.id ? 'white' : 'black'}
                                >
                                    <Text>{message.content}</Text>
                                    <Text fontSize="xs" color={message.senderId === session?.user?.id ? 'white' : 'gray.500'}>
                                        {new Date(message.createdAt).toLocaleTimeString()}
                                    </Text>
                                </Box>
                            </HStack>
                        ))}
                        <div ref={messagesEndRef} />
                    </VStack>
                </Box>

                <HStack p={4} borderTopWidth={1}>
                    <Input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                                handleSendMessage();
                            }
                        }}
                        onFocus={handleTyping}
                        onBlur={handleStopTyping}
                        placeholder="输入消息..."
                    />
                    <Button colorScheme="blue" onClick={handleSendMessage}>
                        发送
                    </Button>
                </HStack>
            </VStack>
        </Container>
    );
} 