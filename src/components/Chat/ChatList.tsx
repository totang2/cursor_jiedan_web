'use client';

import { useEffect, useState } from 'react';
import {
    Box,
    VStack,
    HStack,
    Text,
    Avatar,
    Badge,
    useToast,
} from '@chakra-ui/react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

interface ChatPreview {
    id: string;
    otherUser: {
        id: string;
        name: string;
        avatar?: string;
    };
    lastMessage?: {
        content: string;
        timestamp: string;
        unread: boolean;
    };
}

export default function ChatList() {
    const [chats, setChats] = useState<ChatPreview[]>([]);
    const [loading, setLoading] = useState(true);
    const { data: session } = useSession();
    const toast = useToast();

    useEffect(() => {
        const fetchChats = async () => {
            try {
                const response = await fetch('/api/chats');
                if (!response.ok) {
                    throw new Error('获取聊天列表失败');
                }
                const data = await response.json();
                setChats(data);
            } catch (error) {
                toast({
                    title: '错误',
                    description: '获取聊天列表失败',
                    status: 'error',
                    duration: 3000,
                    isClosable: true,
                });
            } finally {
                setLoading(false);
            }
        };

        if (session?.user) {
            fetchChats();
        }
    }, [session, toast]);

    if (loading) {
        return <Text>加载中...</Text>;
    }

    if (chats.length === 0) {
        return (
            <Box p={4}>
                <Text color="gray.500">暂无聊天记录</Text>
            </Box>
        );
    }

    return (
        <VStack spacing={0} align="stretch">
            {chats.map((chat) => (
                <Link key={chat.id} href={`/chats/${chat.id}`} passHref>
                    <Box
                        p={4}
                        borderBottomWidth="1px"
                        _hover={{ bg: 'gray.50' }}
                        cursor="pointer"
                    >
                        <HStack spacing={3}>
                            <Avatar
                                size="md"
                                name={chat.otherUser.name}
                                src={chat.otherUser.avatar}
                            />
                            <Box flex={1}>
                                <HStack justify="space-between" mb={1}>
                                    <Text fontWeight="bold">{chat.otherUser.name}</Text>
                                    {chat.lastMessage && (
                                        <Text fontSize="sm" color="gray.500">
                                            {new Date(chat.lastMessage.timestamp).toLocaleTimeString()}
                                        </Text>
                                    )}
                                </HStack>
                                {chat.lastMessage && (
                                    <HStack justify="space-between">
                                        <Text
                                            fontSize="sm"
                                            color="gray.600"
                                            noOfLines={1}
                                            maxW="200px"
                                        >
                                            {chat.lastMessage.content}
                                        </Text>
                                        {chat.lastMessage.unread && (
                                            <Badge colorScheme="blue">新消息</Badge>
                                        )}
                                    </HStack>
                                )}
                            </Box>
                        </HStack>
                    </Box>
                </Link>
            ))}
        </VStack>
    );
} 