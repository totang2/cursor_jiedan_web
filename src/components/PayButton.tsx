'use client';

import { useState, useEffect } from 'react';
import { Button, useToast, ButtonProps } from '@chakra-ui/react';

interface PayButtonProps {
    projectId: string;
    disabled?: boolean;
    size?: ButtonProps['size'];
}

export default function PayButton({ projectId, disabled, size = 'md' }: PayButtonProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [isPaid, setIsPaid] = useState(false);
    const [isChecking, setIsChecking] = useState(true);
    const toast = useToast();

    useEffect(() => {
        const checkPaymentStatus = async () => {
            try {
                setIsChecking(true);
                const response = await fetch(`/api/projects/${projectId}/payment-status`);
                if (response.ok) {
                    const data = await response.json();
                    setIsPaid(data.isPaid);
                }
            } catch (error) {
                console.error('检查支付状态失败:', error);
            } finally {
                setIsChecking(false);
            }
        };

        checkPaymentStatus();
    }, [projectId]);

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

    if (isChecking) {
        return (
            <Button
                colorScheme="blue"
                isLoading={true}
                loadingText="检查中..."
                disabled={true}
                size={size}
            >
                检查支付状态
            </Button>
        );
    }

    if (isPaid) {
        return (
            <Button
                colorScheme="green"
                disabled={true}
                size={size}
            >
                已支付
            </Button>
        );
    }

    return (
        <Button
            colorScheme="blue"
            isLoading={isLoading}
            loadingText="处理中..."
            onClick={handlePayment}
            disabled={disabled}
            size={size}
        >
            立即支付
        </Button>
    );
}