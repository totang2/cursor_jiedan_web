'use client';

import { Box, Container, Heading, Text, Button, VStack, useToast } from '@chakra-ui/react';
import Link from 'next/link';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

function PaymentSuccessContent() {
    const searchParams = useSearchParams();
    const toast = useToast();
    const [paymentStatus, setPaymentStatus] = useState<'success' | 'pending' | 'failed' | 'checking'>('checking');

    useEffect(() => {
        const checkPaymentStatus = async () => {
            if (!searchParams) return;

            const outTradeNo = searchParams.get('out_trade_no');
            const tradeNo = searchParams.get('trade_no');

            if (outTradeNo && tradeNo) {
                try {
                    const response = await fetch(`/api/payments?out_trade_no=${outTradeNo}&trade_no=${tradeNo}`);
                    const data = await response.json();

                    if (data.trade_status === 'TRADE_SUCCESS') {
                        setPaymentStatus('success');
                        toast({
                            title: '支付成功',
                            status: 'success',
                            duration: 3000,
                            isClosable: true,
                        });
                    } else if (data.trade_status === 'WAIT_BUYER_PAY') {
                        setPaymentStatus('pending');
                        toast({
                            title: '等待支付',
                            description: '您的订单尚未完成支付',
                            status: 'warning',
                            duration: 5000,
                            isClosable: true,
                        });
                    } else {
                        setPaymentStatus('failed');
                        toast({
                            title: '支付失败',
                            description: '请重新尝试支付',
                            status: 'error',
                            duration: 5000,
                            isClosable: true,
                        });
                    }
                } catch (error) {
                    console.error('Failed to check payment status:', error);
                    setPaymentStatus('failed');
                    toast({
                        title: '查询支付状态失败',
                        description: '请稍后查看订单状态',
                        status: 'error',
                        duration: 5000,
                        isClosable: true,
                    });
                }
            }
        };

        checkPaymentStatus();
    }, [searchParams, toast]);

    const renderContent = () => {
        switch (paymentStatus) {
            case 'success':
                return (
                    <>
                        <Box
                            w="80px"
                            h="80px"
                            borderRadius="full"
                            bg="green.100"
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                            mb={4}
                        >
                            <Text fontSize="3xl" color="green.500">
                                ✓
                            </Text>
                        </Box>
                        <Heading size="lg" color="green.500">
                            支付成功
                        </Heading>
                        <Text color="gray.600">
                            您的付款已经成功处理。我们会尽快处理您的订单。
                        </Text>
                    </>
                );
            case 'pending':
                return (
                    <>
                        <Box
                            w="80px"
                            h="80px"
                            borderRadius="full"
                            bg="yellow.100"
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                            mb={4}
                        >
                            <Text fontSize="3xl" color="yellow.500">
                                ⏳
                            </Text>
                        </Box>
                        <Heading size="lg" color="yellow.500">
                            等待支付
                        </Heading>
                        <Text color="gray.600">
                            您的订单尚未完成支付，请尽快完成支付。
                        </Text>
                    </>
                );
            case 'failed':
                return (
                    <>
                        <Box
                            w="80px"
                            h="80px"
                            borderRadius="full"
                            bg="red.100"
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                            mb={4}
                        >
                            <Text fontSize="3xl" color="red.500">
                                ✕
                            </Text>
                        </Box>
                        <Heading size="lg" color="red.500">
                            支付失败
                        </Heading>
                        <Text color="gray.600">
                            支付过程中出现错误，请重新尝试支付。
                        </Text>
                    </>
                );
            case 'checking':
                return (
                    <>
                        <Box
                            w="80px"
                            h="80px"
                            borderRadius="full"
                            bg="blue.100"
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                            mb={4}
                        >
                            <Text fontSize="3xl" color="blue.500">
                                ⌛
                            </Text>
                        </Box>
                        <Heading size="lg" color="blue.500">
                            正在查询支付状态
                        </Heading>
                        <Text color="gray.600">
                            请稍候，我们正在查询您的支付状态...
                        </Text>
                    </>
                );
        }
    };

    return (
        <Container maxW="container.md" py={10}>
            <VStack spacing={6} align="center" textAlign="center">
                {renderContent()}
                <Link href="/orders" passHref>
                    <Button colorScheme="blue" size="lg">
                        查看订单
                    </Button>
                </Link>
            </VStack>
        </Container>
    );
}

export default function PaymentSuccessPage() {
    return (
        <Suspense fallback={
            <Container maxW="container.md" py={10}>
                <VStack spacing={6} align="center" textAlign="center">
                    <Box
                        w="80px"
                        h="80px"
                        borderRadius="full"
                        bg="blue.100"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        mb={4}
                    >
                        <Text fontSize="3xl" color="blue.500">
                            ⌛
                        </Text>
                    </Box>
                    <Heading size="lg" color="blue.500">
                        加载中...
                    </Heading>
                    <Text color="gray.600">
                        正在加载支付状态...
                    </Text>
                </VStack>
            </Container>
        }>
            <PaymentSuccessContent />
        </Suspense>
    );
} 