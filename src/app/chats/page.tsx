'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
    Box,
    Container,
    Heading,
    VStack,
    HStack,
    Text,
    Avatar,
    Button,
    useToast,
    Spinner,
} from '@chakra-ui/react';
import Link from 'next/link';

interface ChatUser {
    id: string;
    name: string;
    email: string;
    image: string | null;
}

interface Chat {
    id: string;
    otherUser: ChatUser;
    lastMessage: {
        content: string;
        createdAt: string;
    } | null;
    updatedAt: string;
}

export default function ChatsPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const toast = useToast();
    const [chats, setChats] = useState<Chat[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login');
        }
    }, [status, router]);

    useEffect(() => {
        if (status === 'authenticated') {
            fetchChats();
        }
    }, [status]);

    const fetchChats = async () => {
        try {
            const response = await fetch('/api/chats');
            if (!response.ok) {
                throw new Error('Failed to fetch chats');
            }
            const data = await response.json();
            setChats(data);
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to load chats',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
        } finally {
            setLoading(false);
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
            <Heading mb={6}>我的聊天</Heading>
            <VStack spacing={4} align="stretch">
                {chats.length === 0 ? (
                    <Text>暂无聊天记录</Text>
                ) : (
                    chats.map((chat) => (
                        <Link key={chat.id} href={`/chats/${chat.id}`}>
                            <Box
                                p={4}
                                borderWidth="1px"
                                borderRadius="lg"
                                _hover={{ bg: 'gray.50' }}
                                cursor="pointer"
                            >
                                <HStack spacing={4}>
                                    <Avatar
                                        size="md"
                                        name={chat.otherUser?.name || '未知用户'}
                                        src={chat.otherUser?.image || ''}
                                    />
                                    <Box flex={1}>
                                        <Text fontWeight="bold">{chat.otherUser?.name || '未知用户'}</Text>
                                        {chat.lastMessage && (
                                            <Text color="gray.600" noOfLines={1}>
                                                {chat.lastMessage.content}
                                            </Text>
                                        )}
                                    </Box>
                                    {chat.lastMessage && (
                                        <Text color="gray.500" fontSize="sm">
                                            {new Date(chat.lastMessage.createdAt).toLocaleDateString()}
                                        </Text>
                                    )}
                                </HStack>
                            </Box>
                        </Link>
                    ))
                )}
            </VStack>
        </Container>
    );
} 