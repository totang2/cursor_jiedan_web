import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const prisma = new PrismaClient();

// 定义请求体验证 schema
const registerSchema = z.object({
    username: z.string().min(2, '用户名至少需要2个字符'),
    email: z.string().email('请输入有效的邮箱地址'),
    password: z.string().min(6, '密码至少需要6个字符'),
    role: z.enum(['DEVELOPER', 'CLIENT', 'ADMIN']).optional(),
});

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        
        // 验证请求数据
        const validationResult = registerSchema.safeParse(body);
        if (!validationResult.success) {
            return Response.json(
                { error: validationResult.error.errors[0].message },
                { status: 400 }
            );
        }

        const { username, email, password, role = 'DEVELOPER' } = validationResult.data;

        // 如果要创建管理员用户，需要验证当前用户是否为管理员
        if (role === 'ADMIN') {
            const session = await getServerSession(authOptions);
            if (!session?.user) {
                return Response.json(
                    { error: '未登录' },
                    { status: 401 }
                );
            }

            // 检查当前用户是否为管理员
            const currentUser = await prisma.user.findUnique({
                where: { email: session.user.email },
            });

            if (!currentUser || currentUser.role !== 'ADMIN') {
                return Response.json(
                    { error: '没有权限创建管理员用户' },
                    { status: 403 }
                );
            }
        }

        // 检查邮箱是否已被注册
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return Response.json(
                { error: '该邮箱已被注册' },
                { status: 400 }
            );
        }

        // 加密密码
        const hashedPassword = await bcrypt.hash(password, 12);

        // 使用事务创建用户和用户档案
        const result = await prisma.$transaction(async (tx) => {
            // 创建用户
            const user = await tx.user.create({
                data: {
                    email,
                    name: username,
                    password: hashedPassword,
                    role: role,
                },
            });

            // 创建用户档案
            await tx.profile.create({
                data: {
                    userId: user.id,
                },
            });

            return user;
        });

        // 返回成功响应（不包含密码）
        return Response.json({
            success: true,
            user: {
                id: result.id,
                email: result.email,
                name: result.name,
                role: result.role,
            },
        });

    } catch (error) {
        console.error('Registration error:', error);
        return Response.json(
            { error: '注册失败，请稍后重试' },
            { status: 500 }
        );
    } finally {
        await prisma.$disconnect();
    }
}