import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { alipay } from '@/config/alipay';

export async function POST(req: Request) {
    try {
        // 获取支付宝通知参数
        const formData = await req.formData();
        const params = Object.fromEntries(formData.entries());

        // 验证通知签名
        const isValid = await alipay.checkNotifySign(params);
        if (!isValid) {
            return Response.json('Invalid signature', { status: 400 });
        }

        const { out_trade_no: orderId, trade_status: tradeStatus, trade_no: tradeNo } = params;

        // 处理支付成功通知
        if (tradeStatus === 'TRADE_SUCCESS') {
            // 查找订单
            const order = await prisma.order.findUnique({
                where: { id: orderId as string },
            });

            if (!order) {
                return Response.json('Order not found', { status: 404 });
            }

            // 如果订单状态为待支付，则更新订单状态
            if (order.status === 'PENDING') {
                await prisma.$transaction(async (tx) => {
                    // 更新订单状态
                    await tx.order.update({
                        where: { id: orderId as string },
                        data: { status: 'PAID' },
                    });

                    // 创建支付记录
                    await tx.payment.create({
                        data: {
                            orderId: orderId as string,
                            amount: order.amount,
                            paymentMethod: 'ALIPAY',
                            transactionId: tradeNo as string,
                            status: 'SUCCESS',
                        },
                    });
                });
            }
        }

        // 返回成功响应给支付宝
        return Response.json('success', { status: 200 });
    } catch (error) {
        console.error('Payment notification error:', error);
        return Response.json('Internal Server Error', { status: 500 });
    }
} 