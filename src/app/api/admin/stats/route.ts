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

    // 获取统计数据
    const [totalUsers, totalProjects, totalOrders, totalPayments] = await Promise.all([
      prisma.user.count(),
      prisma.project.count(),
      prisma.order.count(),
      prisma.payment.aggregate({
        _sum: {
          amount: true,
        },
        where: {
          status: 'SUCCESS',
          currency: 'USD', // 假设所有支付都转换为USD计算
        },
      }),
    ]);

    return Response.json({
      totalUsers,
      totalProjects,
      totalOrders,
      totalPayments: totalPayments._sum.amount || 0,
    });
  } catch (error) {
    console.error('获取管理员统计数据失败', error);
    return Response.json(
      { error: '获取统计数据失败' },
      { status: 500 }
    );
  }
}