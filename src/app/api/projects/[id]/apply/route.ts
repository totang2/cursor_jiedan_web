import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json(
                { error: '请先登录' },
                { status: 401 }
            );
        }

        const projectId = params.id;
        const { message } = await request.json();

        // 检查项目是否存在
        const project = await prisma.project.findUnique({
            where: { id: projectId },
        });

        if (!project) {
            return NextResponse.json(
                { error: '项目不存在' },
                { status: 404 }
            );
        }

        // 检查项目状态
        if (project.status !== 'OPEN') {
            return NextResponse.json(
                { error: '该项目已不再接受申请' },
                { status: 400 }
            );
        }

        // 检查是否已经申请过
        const existingApplication = await prisma.application.findFirst({
            where: {
                projectId,
                userId: session.user.id,
            },
        });

        if (existingApplication) {
            return NextResponse.json(
                { error: '你已经申请过这个项目了' },
                { status: 400 }
            );
        }

        // 创建申请
        const application = await prisma.application.create({
            data: {
                projectId,
                userId: session.user.id,
                message,
                status: 'PENDING',
            },
        });

        return NextResponse.json(application);
    } catch (error) {
        console.error('申请项目失败:', error);
        return NextResponse.json(
            { error: '申请项目失败' },
            { status: 500 }
        );
    }
} 