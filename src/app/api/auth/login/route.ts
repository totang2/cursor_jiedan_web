import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email, password } = body;

        // 验证请求数据
        if (!email || !password) {
            return Response.json(
                { error: '邮箱和密码不能为空' },
                { status: 400 }
            );
        }

        // 查找用户
        const user = await prisma.user.findUnique({
            where: { email },
            include: {
                profile: true,
            },
        });

        // 如果用户不存在
        if (!user) {
            return Response.json(
                { error: '邮箱或密码错误' },
                { status: 401 }
            );
        }

        // 验证密码
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return Response.json(
                { error: '邮箱或密码错误' },
                { status: 401 }
            );
        }

        // 创建 JWT token
        const token = jwt.sign(
            {
                userId: user.id,
                email: user.email,
                role: user.role
            },
            process.env.JWT_SECRET || 'your-jwt-secret',
            { expiresIn: '24h' }
        );

        // 返回成功响应
        return Response.json({
            success: true,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                profile: user.profile,
            },
            token,
        });
    } catch (error) {
        console.error('Login error:', error);
        return Response.json(
            { error: '服务器错误' },
            { status: 500 }
        );
    } finally {
        await prisma.$disconnect();
    }
} 