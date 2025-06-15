import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return Response.json({ error: '未登录' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { status: true },
    });

    if (!user) {
      return Response.json({ error: '用户不存在' }, { status: 404 });
    }

    return Response.json({ status: user.status });
  } catch (error) {
    console.error('获取用户状态失败', error);
    return Response.json(
      { error: '获取用户状态失败' },
      { status: 500 }
    );
  }
}