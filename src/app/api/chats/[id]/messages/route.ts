import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// 获取聊天消息历史
export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
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

        // Verify user is part of the chat
        const chat = await prisma.chat.findFirst({
            where: {
                id: params.id,
                users: {
                    some: {
                        id: user.id,
                    },
                },
            },
        });

        if (!chat) {
            return Response.json({ error: 'Chat not found' }, { status: 404 });
        }

        // Get messages and mark unread messages as read
        const messages = await prisma.message.findMany({
            where: {
                chatId: params.id,
            },
            include: {
                sender: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        image: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'asc',
            },
        });

        // Get other user
        const otherUser = await prisma.user.findFirst({
            where: {
                chats: {
                    some: {
                        id: params.id,
                    },
                },
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
        });

        // Mark unread messages as read
        await prisma.message.updateMany({
            where: {
                chatId: params.id,
                senderId: {
                    not: user.id,
                },
                read: false,
            },
            data: {
                read: true,
            },
        });

        return Response.json({
            messages: messages.map(msg => ({
                id: msg.id,
                content: msg.content,
                senderId: msg.senderId,
                createdAt: msg.createdAt,
            })),
            otherUser,
        });
    } catch (error) {
        console.error('Error fetching messages:', error);
        return Response.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// 发送新消息
export async function POST(
    request: Request,
    { params }: { params: { id: string } }
) {
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

        // Verify user is part of the chat
        const chat = await prisma.chat.findFirst({
            where: {
                id: params.id,
                users: {
                    some: {
                        id: user.id,
                    },
                },
            },
        });

        if (!chat) {
            return Response.json({ error: 'Chat not found' }, { status: 404 });
        }

        const { content } = await request.json();
        if (!content) {
            return Response.json(
                { error: 'Message content is required' },
                { status: 400 }
            );
        }

        // Create new message
        const message = await prisma.message.create({
            data: {
                content,
                chatId: params.id,
                senderId: user.id,
            },
            include: {
                sender: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        image: true,
                    },
                },
            },
        });

        // Update chat's updatedAt timestamp
        await prisma.chat.update({
            where: { id: params.id },
            data: { updatedAt: new Date() },
        });

        return Response.json(message);
    } catch (error) {
        console.error('Error sending message:', error);
        return Response.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
} 