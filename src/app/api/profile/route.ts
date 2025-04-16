import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json(
                { error: '未授权访问' },
                { status: 401 }
            );
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            include: {
                profile: true,
                skills: true,
            },
        });

        if (!user) {
            return NextResponse.json(
                { error: '用户不存在' },
                { status: 404 }
            );
        }

        return NextResponse.json(user);
    } catch (error) {
        console.error('获取个人资料失败:', error);
        return NextResponse.json(
            { error: '获取个人资料失败' },
            { status: 500 }
        );
    }
}

export async function PUT(request: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json(
                { error: '未授权访问' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { bio, location, website, github, linkedin, hourlyRate, availability } = body;

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            include: { profile: true },
        });

        if (!user) {
            return NextResponse.json(
                { error: '用户不存在' },
                { status: 404 }
            );
        }

        // 更新或创建个人资料
        const updatedProfile = await prisma.profile.upsert({
            where: { userId: user.id },
            update: {
                bio,
                location,
                website,
                github,
                linkedin,
                hourlyRate,
                availability,
            },
            create: {
                userId: user.id,
                bio,
                location,
                website,
                github,
                linkedin,
                hourlyRate,
                availability,
            },
        });

        return NextResponse.json(updatedProfile);
    } catch (error) {
        console.error('更新个人资料失败:', error);
        return NextResponse.json(
            { error: '更新个人资料失败' },
            { status: 500 }
        );
    }
} 