import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { alipay } from '@/lib/alipay';
import { prisma } from '@/lib/prisma';
import { OrderStatus } from '@prisma/client';

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { orderId } = await req.json();
        if (!orderId) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: { project: true }
        });

        if (!order) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        if (order.status !== OrderStatus.PENDING) {
            return NextResponse.json({ error: 'Order cannot be paid' }, { status: 400 });
        }

        const amount = order.amount; // 从订单中获取金额

        const result = await alipay.execute('alipay.trade.page.pay', {
            out_trade_no: order.id,
            total_amount: amount,
            subject: order.project.title,
            product_code: 'FAST_INSTANT_TRADE_PAY'
        });

        await prisma.order.update({
            where: { id: orderId },
            data: { status: OrderStatus.PAID }
        });

        return NextResponse.json(result);
    } catch (error) {
        console.error('Payment error:', error);
        return NextResponse.json(
            { error: 'Failed to process payment' },
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
            return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
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

        return NextResponse.json(result);
    } catch (error) {
        console.error('Payment query error:', error);
        return NextResponse.json(
            { error: 'Failed to query payment status' },
            { status: 500 }
        );
    }
}