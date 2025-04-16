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
    Avatar,
    Input,
    Button,
    useToast,
    Spinner,
    Flex,
} from '@chakra-ui/react';

interface Message {
    id: string;
    content: string;
    senderId: string;
    createdAt: string;
    sender: {
        id: string;
        name: string;
        image: string | null;
    };
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
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login');
        }
    }, [status, router]);

    useEffect(() => {
        if (status === 'authenticated') {
            fetchMessages();
            fetchChatUser();
        }
    }, [status, params.id]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const fetchMessages = async () => {
        try {
            const response = await fetch(`/api/chats/${params.id}/messages`);
            if (!response.ok) {
                throw new Error('Failed to fetch messages');
            }
            const data = await response.json();
            setMessages(data);
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

    const fetchChatUser = async () => {
        try {
            const response = await fetch(`/api/chats/${params.id}`);
            if (!response.ok) {
                throw new Error('Failed to fetch chat user');
            }
            const data = await response.json();
            setOtherUser(data.otherUser);
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to load chat user',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
        }
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

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
            setMessages((prev) => [...prev, message]);
            setNewMessage('');
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to send message',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
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

    return (
        <Container maxW="container.xl" py={8}>
            <Box borderWidth="1px" borderRadius="lg" overflow="hidden">
                <Box p={4} borderBottomWidth="1px">
                    <HStack>
                        <Avatar
                            size="md"
                            name={otherUser?.name || ''}
                            src={otherUser?.image || ''}
                        />
                        <Text fontWeight="bold">{otherUser?.name}</Text>
                    </HStack>
                </Box>

                <Box p={4} height="60vh" overflowY="auto">
                    <VStack spacing={4} align="stretch">
                        {messages.map((message) => (
                            <Box
                                key={message.id}
                                alignSelf={message.senderId === session?.user?.id ? 'flex-end' : 'flex-start'}
                                maxW="70%"
                            >
                                <HStack
                                    spacing={2}
                                    align={message.senderId === session?.user?.id ? 'end' : 'start'}
                                >
                                    {message.senderId !== session?.user?.id && (
                                        <Avatar
                                            size="sm"
                                            name={message.sender.name}
                                            src={message.sender.image || ''}
                                        />
                                    )}
                                    <Box
                                        bg={message.senderId === session?.user?.id ? 'blue.500' : 'gray.100'}
                                        color={message.senderId === session?.user?.id ? 'white' : 'black'}
                                        p={3}
                                        borderRadius="lg"
                                    >
                                        <Text>{message.content}</Text>
                                    </Box>
                                </HStack>
                                <Text fontSize="xs" color="gray.500" mt={1}>
                                    {new Date(message.createdAt).toLocaleTimeString()}
                                </Text>
                            </Box>
                        ))}
                        <div ref={messagesEndRef} />
                    </VStack>
                </Box>

                <Box p={4} borderTopWidth="1px">
                    <form onSubmit={handleSendMessage}>
                        <HStack>
                            <Input
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder="输入消息..."
                                size="lg"
                            />
                            <Button type="submit" colorScheme="blue" size="lg">
                                发送
                            </Button>
                        </HStack>
                    </form>
                </Box>
            </Box>
        </Container>
    );
} 