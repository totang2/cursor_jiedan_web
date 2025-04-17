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
    Alert,
    AlertIcon,
    AlertTitle,
    AlertDescription,
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
    const { socket, error, isConnected, joinChat, leaveChat, sendMessage, startTyping, stopTyping, onNewMessage, onTypingStatus, onStopTyping } = useSocket();
    const [chatError, setChatError] = useState<string | null>(null);

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
        } catch (err) {
            console.error('Error fetching messages:', err);
            setChatError('Failed to load messages');
        } finally {
            setLoading(false);
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login');
        }
    }, [status, router]);

    useEffect(() => {
        if (!session?.user?.email) {
            router.push('/login');
            return;
        }

        fetchMessages();
    }, [params.id, session?.user?.email]);

    useEffect(() => {
        if (!isConnected) {
            console.log('Waiting for socket connection...');
            return;
        }

        console.log('Joining chat:', params.id);
        joinChat(params.id);

        const messageCleanup = onNewMessage((message) => {
            setMessages((prev) => [...prev, message]);
            scrollToBottom();
        });

        const typingCleanup = onTypingStatus((userId) => {
            if (userId !== session?.user?.id) {
                setIsTyping(true);
            }
        });

        const stopTypingCleanup = onStopTyping((userId) => {
            if (userId !== session?.user?.id) {
                setIsTyping(false);
            }
        });

        return () => {
            console.log('Leaving chat:', params.id);
            leaveChat(params.id);
            messageCleanup?.();
            typingCleanup?.();
            stopTypingCleanup?.();
        };
    }, [params.id, isConnected, joinChat, leaveChat, onNewMessage, onTypingStatus, onStopTyping, session?.user?.id]);

    useEffect(() => {
        if (error) {
            console.error('Socket error:', error);
            setChatError(error);
        }
    }, [error]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = async (content: string) => {
        if (!session?.user?.email || !isConnected) {
            setChatError('Not connected to chat server');
            return;
        }

        try {
            const response = await fetch(`/api/chats/${params.id}/messages`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ content }),
            });

            if (!response.ok) {
                throw new Error('Failed to send message');
            }

            const message = await response.json();
            sendMessage(params.id, message);
            setNewMessage('');
        } catch (err) {
            console.error('Error sending message:', err);
            setChatError('Failed to send message');
        }
    };

    const handleTyping = () => {
        if (params.id && session?.user?.id) {
            startTyping(params.id, session.user.id);
        }
    };

    const handleStopTyping = () => {
        if (params.id && session?.user?.id) {
            stopTyping(params.id, session.user.id);
        }
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

    if (chatError) {
        return (
            <Box p={4}>
                <Alert status="error">
                    <AlertIcon />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{chatError}</AlertDescription>
                </Alert>
            </Box>
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
                                handleSendMessage(newMessage);
                            }
                        }}
                        onFocus={handleTyping}
                        onBlur={handleStopTyping}
                        placeholder="输入消息..."
                    />
                    <Button colorScheme="blue" onClick={() => handleSendMessage(newMessage)}>
                        发送
                    </Button>
                </HStack>
            </VStack>
        </Container>
    );
} 