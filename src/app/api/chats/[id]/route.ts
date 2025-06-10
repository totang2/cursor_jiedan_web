import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

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

        // Get chat with other user
        const chat = await prisma.chat.findFirst({
            where: {
                id: params.id,
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
            },
        });

        if (!chat) {
            return Response.json({ error: 'Chat not found' }, { status: 404 });
        }

        return Response.json({
            id: chat.id,
            otherUser: chat.users[0],
        });
    } catch (error) {
        console.error('Error fetching chat:', error);
        return Response.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
} 