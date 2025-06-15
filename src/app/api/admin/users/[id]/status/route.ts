import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const body = await request.json();
    const { status } = body;

    // 验证状态值
    if (!status || !['ACTIVE', 'BLOCKED', 'BANNED'].includes(status)) {
      return Response.json({ error: '无效的状态值' }, { status: 400 });
    }

    // 验证管理员权限
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return Response.json({ error: '未登录' }, { status: 401 });
    }

    const admin = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!admin || admin.role !== 'ADMIN') {
      return Response.json({ error: '没有管理员权限' }, { status: 403 });
    }

    // 检查是否试图修改自己的状态
    if (admin.id === id) {
      return Response.json({ error: '不能修改自己的状态' }, { status: 400 });
    }

    // 检查用户是否存在
    const userToUpdate = await prisma.user.findUnique({
      where: { id },
    });

    if (!userToUpdate) {
      return Response.json({ error: '用户不存在' }, { status: 404 });
    }

    // 更新用户状态
    const updatedUser = await prisma.user.update({
      where: { id },
      data: { status },
    });

    return Response.json({
      success: true,
      message: `用户状态已更新为 ${status}`,
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        status: updatedUser.status,
      },
    });
  } catch (error) {
    console.error('更新用户状态失败', error);
    return Response.json(
      { error: '更新用户状态失败' },
      { status: 500 }
    );
  }
}