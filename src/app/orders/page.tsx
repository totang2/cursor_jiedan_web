'use client';

import { useEffect, useState } from 'react';
import {
    Container,
    Heading,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    Badge,
    Box,
    Text,
    Spinner,
    Center,
} from '@chakra-ui/react';
import { format } from 'date-fns';

interface Order {
    id: string;
    amount: number;
    status: string;
    createdAt: string;
    project: {
        title: string;
    };
    payment?: {
        status: string;
        transactionId: string;
    };
}

const statusColors = {
    PENDING: 'yellow',
    PAID: 'green',
    CANCELLED: 'red',
    REFUNDED: 'purple',
};

export default function OrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const res = await fetch('/api/orders');
                if (!res.ok) {
                    throw new Error('Failed to fetch orders');
                }
                const data = await res.json();
                setOrders(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : '获取订单失败');
            } finally {
                setIsLoading(false);
            }
        };

        fetchOrders();
    }, []);

    if (isLoading) {
        return (
            <Center h="50vh">
                <Spinner size="xl" />
            </Center>
        );
    }

    if (error) {
        return (
            <Center h="50vh">
                <Text color="red.500">{error}</Text>
            </Center>
        );
    }

    return (
        <Container maxW="container.lg" py={8}>
            <Heading mb={6}>我的订单</Heading>

            {orders.length === 0 ? (
                <Box p={6} textAlign="center">
                    <Text color="gray.500">暂无订单记录</Text>
                </Box>
            ) : (
                <Table variant="simple">
                    <Thead>
                        <Tr>
                            <Th>项目</Th>
                            <Th>金额</Th>
                            <Th>状态</Th>
                            <Th>创建时间</Th>
                            <Th>交易号</Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                        {orders.map((order) => (
                            <Tr key={order.id}>
                                <Td>{order.project.title}</Td>
                                <Td>¥{order.amount.toFixed(2)}</Td>
                                <Td>
                                    <Badge colorScheme={statusColors[order.status as keyof typeof statusColors]}>
                                        {order.status}
                                    </Badge>
                                </Td>
                                <Td>{format(new Date(order.createdAt), 'yyyy-MM-dd HH:mm:ss')}</Td>
                                <Td>{order.payment?.transactionId || '-'}</Td>
                            </Tr>
                        ))}
                    </Tbody>
                </Table>
            )}
        </Container>
    );
} 