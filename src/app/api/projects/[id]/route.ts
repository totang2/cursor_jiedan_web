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
        const projectId = params.id;

        if (!projectId) {
            return Response.json(
                { error: '项目ID不能为空' },
                { status: 400 }
            );
        }

        const project = await prisma.project.findUnique({
            where: { id: projectId },
            include: {
                client: {
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
        });

        if (!project) {
            return Response.json(
                { error: '项目不存在' },
                { status: 404 }
            );
        }

        return Response.json(project);
    } catch (error) {
        console.error('获取项目详情失败:', error);
        return Response.json(
            { error: '获取项目详情失败' },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return Response.json(
                { error: '请先登录' },
                { status: 401 }
            );
        }

        const projectId = params.id;

        // 检查项目是否存在
        const project = await prisma.project.findUnique({
            where: { id: projectId },
        });

        if (!project) {
            return Response.json(
                { error: '项目不存在' },
                { status: 404 }
            );
        }

        // 检查是否是项目所有者
        if (project.clientId !== session.user.id) {
            return Response.json(
                { error: '无权删除此项目' },
                { status: 403 }
            );
        }

        // 删除项目
        await prisma.project.delete({
            where: { id: projectId },
        });

        return Response.json({ success: true });
    } catch (error) {
        console.error('删除项目失败:', error);
        return Response.json(
            { error: '删除项目失败' },
            { status: 500 }
        );
    }
}

export async function PUT(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return Response.json(
                { error: '请先登录' },
                { status: 401 }
            );
        }

        const projectId = params.id;
        const data = await request.json();

        // 检查项目是否存在
        const project = await prisma.project.findUnique({
            where: { id: projectId },
        });

        if (!project) {
            return Response.json(
                { error: '项目不存在' },
                { status: 404 }
            );
        }

        // 检查是否是项目所有者
        if (project.clientId !== session.user.id) {
            return Response.json(
                { error: '无权更新此项目' },
                { status: 403 }
            );
        }

        // 更新项目
        const updatedProject = await prisma.project.update({
            where: { id: projectId },
            data: {
                title: data.title,
                description: data.description,
                budget: parseFloat(data.budget),
                deadline: new Date(data.deadline),
                category: data.category,
                skills: data.skills,
            },
            include: {
                client: {
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
                applications: true,
            },
        });

        return Response.json(updatedProject);
    } catch (error) {
        console.error('更新项目失败:', error);
        return Response.json(
            { error: '更新项目失败' },
            { status: 500 }
        );
    }
}