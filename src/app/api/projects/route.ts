import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Prisma, ProjectStatus } from '@prisma/client';

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        console.log('Session:', session);

        if (!session) {
            console.log('No session found');
            return NextResponse.json(
                { error: '未登录' },
                { status: 401 }
            );
        }

        if (!session.user?.email) {
            console.log('No user email in session');
            return NextResponse.json(
                { error: '未授权访问' },
                { status: 401 }
            );
        }

        const data = await request.json();
        console.log('Request data:', data);
        const { title, description, budget, deadline, category, skills } = data;

        // 验证必填字段
        if (!title || !description || !budget || !deadline || !category || !skills) {
            return NextResponse.json(
                { error: '请填写所有必填字段' },
                { status: 400 }
            );
        }

        // 先查找用户
        const user = await prisma.user.findUnique({
            where: {
                email: session.user.email,
            },
        });

        console.log('Found user:', user);

        if (!user) {
            return NextResponse.json(
                { error: '用户不存在' },
                { status: 404 }
            );
        }

        // 创建项目
        const project = await prisma.project.create({
            data: {
                title,
                description,
                budget: parseFloat(budget),
                deadline: new Date(deadline),
                status: ProjectStatus.OPEN,
                client: {
                    connect: {
                        id: user.id
                    }
                },
                category: category as string,
                skills: skills.split(',').map((skill: string) => skill.trim()),
            },
        });

        const projectWithClient = await prisma.project.findUnique({
            where: {
                id: project.id,
            },
            include: {
                client: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });

        console.log('Created project:', projectWithClient);

        return NextResponse.json(projectWithClient);
    } catch (error) {
        console.error('项目创建失败:', error);
        return NextResponse.json(
            { error: '项目创建失败', details: error instanceof Error ? error.message : '未知错误' },
            { status: 500 }
        );
    }
}

export async function GET() {
    try {
        const projects = await prisma.project.findMany({
            include: {
                client: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        return NextResponse.json(projects);
    } catch (error) {
        console.error('获取项目列表失败:', error);
        return NextResponse.json(
            { error: '获取项目列表失败' },
            { status: 500 }
        );
    }
} 