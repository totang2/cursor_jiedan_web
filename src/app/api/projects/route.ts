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
            return Response.json(
                { error: '未登录' },
                { status: 401 }
            );
        }

        if (!session.user?.email) {
            console.log('No user email in session');
            return Response.json(
                { error: '未授权访问' },
                { status: 401 }
            );
        }

        const data = await request.json();
        console.log('Request data:', data);
        const { title, description, budget, deadline, category, skills, currency, source, originalLink } = data;

        // 验证必填字段
        if (!title || !description || !budget || !deadline || !category || !skills) {
            return Response.json(
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
            return Response.json(
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
                currency: currency || 'CNY',
                deadline: new Date(deadline),
                status: ProjectStatus.OPEN,
                client: {
                    connect: {
                        id: user.id
                    }
                },
                category: category as string,
                skills: skills.split(',').map((skill: string) => skill.trim()),
                source: source || null,           // 添加项目来源
                originalLink: originalLink || null, // 添加原始项目链接
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

        return Response.json(projectWithClient);
    } catch (error) {
        console.error('项目创建失败:', error);
        return Response.json(
            { 
                error: '项目创建失败', 
                details: error instanceof Error ? error.message : '未知错误' 
            },
            { status: 500 }
        );
    }
}

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const includeOrders = searchParams.get('include') === 'orders';
        
        const projects = await prisma.project.findMany({
            include: {
                client: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        profile: {
                            select: {
                                avatar: true
                            }
                        }
                    },
                },
                // 根据参数决定是否包含订单信息
                orders: includeOrders ? {
                    include: {
                        payment: true
                    }
                } : false
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        return Response.json(projects);
    } catch (error) {
        console.error('获取项目列表失败:', error);
        return Response.json(
            { error: '获取项目列表失败' },
            { status: 500 }
        );
    }
}