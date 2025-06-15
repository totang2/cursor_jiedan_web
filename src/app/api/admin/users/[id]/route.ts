import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;

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

    // 检查是否试图删除自己
    if (admin.id === id) {
      return Response.json({ error: '不能删除自己的账户' }, { status: 400 });
    }

    // 检查用户是否存在
    const userToDelete = await prisma.user.findUnique({
      where: { id },
    });

    if (!userToDelete) {
      return Response.json({ error: '用户不存在' }, { status: 404 });
    }

    // 删除用户
    await prisma.user.delete({
      where: { id },
    });

    return Response.json({ success: true, message: '用户已成功删除' });
  } catch (error) {
    console.error('删除用户失败', error);
    return Response.json(
      { error: '删除用户失败' },
      { status: 500 }
    );
  }
}