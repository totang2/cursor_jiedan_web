'use client';

import { useState } from 'react';
import { Button, useToast } from '@chakra-ui/react';

interface PayButtonProps {
    projectId: string;
    disabled?: boolean;
}

export default function PayButton({ projectId, disabled }: PayButtonProps) {
    const [isLoading, setIsLoading] = useState(false);
    const toast = useToast();

    const handlePayment = async () => {
        try {
            setIsLoading(true);

            // 1. 创建订单
            const orderRes = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ projectId }),
            });

            if (!orderRes.ok) {
                const error = await orderRes.json();
                throw new Error(error.error || 'Failed to create order');
            }

            const { orderId } = await orderRes.json();

            // 2. 创建支付
            const paymentRes = await fetch('/api/payments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orderId }),
            });

            if (!paymentRes.ok) {
                const error = await paymentRes.json();
                throw new Error(error.error || 'Failed to create payment');
            }

            const { payUrl } = await paymentRes.json();

            // 3. 跳转到支付宝支付页面
            window.location.href = payUrl;
        } catch (error) {
            toast({
                title: '支付失败',
                description: error instanceof Error ? error.message : '请稍后重试',
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Button
            colorScheme="blue"
            isLoading={isLoading}
            loadingText="处理中..."
            onClick={handlePayment}
            disabled={disabled}
        >
            立即支付
        </Button>
    );
} 