import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// 获取用户的聊天列表
export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
        });

        if (!user) {
            return Response.json({ error: 'User not found' }, { status: 404 });
        }

        const chats = await prisma.chat.findMany({
            where: {
                users: {
                    some: {
                        id: user.id,
                    },
                },
            },
            include: {
                users: {
                    where: {
                        id: {
                            not: user.id,
                        },
                    },
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        image: true,
                    },
                },
                messages: {
                    orderBy: {
                        createdAt: 'desc',
                    },
                    take: 1,
                },
            },
            orderBy: {
                updatedAt: 'desc',
            },
        });

        const formattedChats = chats.map((chat) => ({
            id: chat.id,
            otherUser: chat.users[0],
            lastMessage: chat.messages[0],
            updatedAt: chat.updatedAt,
        }));

        return Response.json(formattedChats);
    } catch (error) {
        console.error('Error fetching chats:', error);
        return Response.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// 创建新的聊天
export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { userId } = await request.json();
        if (!userId) {
            return Response.json(
                { error: 'User ID is required' },
                { status: 400 }
            );
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
        });

        if (!user) {
            return Response.json({ error: 'User not found' }, { status: 404 });
        }

        // Check if chat already exists
        const existingChat = await prisma.chat.findFirst({
            where: {
                AND: [
                    {
                        users: {
                            some: {
                                id: user.id,
                            },
                        },
                    },
                    {
                        users: {
                            some: {
                                id: userId,
                            },
                        },
                    },
                ],
            },
        });

        if (existingChat) {
            return Response.json(existingChat);
        }

        // Create new chat
        const newChat = await prisma.chat.create({
            data: {
                users: {
                    connect: [
                        { id: user.id },
                        { id: userId },
                    ],
                },
            },
        });

        return Response.json(newChat);
    } catch (error) {
        console.error('Error creating chat:', error);
        return Response.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
} 