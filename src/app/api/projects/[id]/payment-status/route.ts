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
        if (!session?.user) {
            return Response.json(
                { error: '请先登录' },
                { status: 401 }
            );
        }

        const projectId = params.id;

        // 查找项目的支付订单
        const order = await prisma.order.findFirst({
            where: {
                projectId,
                userId: session.user.id,
            },
            include: {
                payment: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        // 检查是否有已支付的订单
        const isPaid = order?.status === 'PAID' || order?.payment?.status === 'SUCCESS';

        return Response.json({ isPaid });
    } catch (error) {
        console.error('获取项目支付状态失败:', error);
        return Response.json(
            { error: '获取项目支付状态失败' },
            { status: 500 }
        );
    }
}