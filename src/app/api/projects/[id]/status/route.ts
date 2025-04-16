import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PATCH(
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
        const { status } = await request.json();

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

        // 检查是否是项目所有者
        if (project.clientId !== session.user.id) {
            return NextResponse.json(
                { error: '无权修改此项目' },
                { status: 403 }
            );
        }

        // 更新项目状态
        const updatedProject = await prisma.project.update({
            where: { id: projectId },
            data: { status },
        });

        return NextResponse.json(updatedProject);
    } catch (error) {
        console.error('更新项目状态失败:', error);
        return NextResponse.json(
            { error: '更新项目状态失败' },
            { status: 500 }
        );
    }
} 