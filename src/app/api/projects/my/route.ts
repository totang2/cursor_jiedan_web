import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json(
                { error: '请先登录' },
                { status: 401 }
            );
        }

        const projects = await prisma.project.findMany({
            where: {
                clientId: session.user.id,
            },
            include: {
                applications: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                                profile: {
                                    select: {
                                        avatar: true,
                                        bio: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        return NextResponse.json(projects);
    } catch (error) {
        console.error('获取我的项目失败:', error);
        return NextResponse.json(
            { error: '获取我的项目失败' },
            { status: 500 }
        );
    }
} 