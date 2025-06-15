import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // 验证管理员权限
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return Response.json({ error: '未登录' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user || user.role !== 'ADMIN') {
      return Response.json({ error: '没有管理员权限' }, { status: 403 });
    }

    // 获取所有用户
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return Response.json(users);
  } catch (error) {
    console.error('获取用户列表失败', error);
    return Response.json(
      { error: '获取用户列表失败' },
      { status: 500 }
    );
  }
}