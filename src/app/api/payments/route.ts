import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { alipay, AlipayFormData } from '@/lib/alipay';
import { prisma } from '@/lib/prisma';
import { OrderStatus } from '@prisma/client';

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { orderId } = await req.json();
        if (!orderId) {
            return Response.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: { project: true }
        });

        if (!order) {
            return Response.json({ error: 'Order not found' }, { status: 404 });
        }

        if (order.status !== OrderStatus.PENDING) {
            return Response.json({ error: 'Order cannot be paid' }, { status: 400 });
        }

        // 确保金额格式正确（两位小数的字符串）
        const formattedAmount = Number(order.amount).toFixed(2);
        
        // 使用AlipayFormData创建表单
        const formData = new AlipayFormData();
        formData.setMethod('get');
        
        // 设置回调通知地址
        formData.addField('notifyUrl', `${process.env.NEXT_PUBLIC_APP_URL}/api/payments/notify`);
        formData.addField('returnUrl', `${process.env.NEXT_PUBLIC_APP_URL}/payments/success`);
        
        formData.addField('bizContent', {
            out_trade_no: order.id,
            total_amount: formattedAmount,
            subject: order.project.title,
            product_code: 'FAST_INSTANT_TRADE_PAY'
        });
        
        // 使用正确的方法执行支付页面请求
        const result = await alipay.exec('alipay.trade.page.pay', {}, { formData: formData });
        
        // 返回支付URL给前端
        return Response.json({ payUrl: result });
    } catch (error) {
        console.error('Payment error:', error);
        return Response.json(
            { error: error instanceof Error ? `支付处理失败: ${error.message}` : 'Failed to process payment' },
            { status: 500 }
        );
    }
}

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const outTradeNo = searchParams.get('out_trade_no');
        const tradeNo = searchParams.get('trade_no');

        if (!outTradeNo || !tradeNo) {
            return Response.json({ error: 'Missing parameters' }, { status: 400 });
        }

        const result = await alipay.execute('alipay.trade.query', {
            out_trade_no: outTradeNo,
            trade_no: tradeNo
        });

        if (result.trade_status === 'TRADE_SUCCESS') {
            await prisma.order.update({
                where: { id: outTradeNo },
                data: { status: OrderStatus.PAID }
            });
        }

        return Response.json(result);
    } catch (error) {
        console.error('Payment query error:', error);
        return Response.json(
            { error: 'Failed to query payment status' },
            { status: 500 }
        );
    }
}