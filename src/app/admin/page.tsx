'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Container,
  Heading,
  Text,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Card,
  CardBody,
  Stack,
  Divider,
  Button,
  Flex,
  useToast,
} from '@chakra-ui/react';

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const toast = useToast();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProjects: 0,
    totalOrders: 0,
    totalPayments: 0,
  });

  useEffect(() => {
    // 检查用户是否为管理员
    if (status === 'authenticated') {
      if (session?.user?.role !== 'ADMIN') {
        toast({
          title: '访问被拒绝',
          description: '您没有管理员权限',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        router.push('/');
      } else {
        // 获取统计数据
        fetchStats();
      }
    } else if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, session, router, toast]);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('获取统计数据失败', error);
    }
  };

  if (status === 'loading') {
    return (
      <Container maxW="container.xl" py={8}>
        <Text>加载中...</Text>
      </Container>
    );
  }

  return (
    <Container maxW="container.xl" py={8}>
      <Heading mb={6}>管理员控制台</Heading>
      
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} mb={8}>
        <Stat>
          <Card>
            <CardBody>
              <StatLabel>总用户数</StatLabel>
              <StatNumber>{stats.totalUsers}</StatNumber>
              <StatHelpText>平台注册用户总数</StatHelpText>
            </CardBody>
          </Card>
        </Stat>
        
        <Stat>
          <Card>
            <CardBody>
              <StatLabel>总项目数</StatLabel>
              <StatNumber>{stats.totalProjects}</StatNumber>
              <StatHelpText>平台发布项目总数</StatHelpText>
            </CardBody>
          </Card>
        </Stat>
        
        <Stat>
          <Card>
            <CardBody>
              <StatLabel>总订单数</StatLabel>
              <StatNumber>{stats.totalOrders}</StatNumber>
              <StatHelpText>平台创建订单总数</StatHelpText>
            </CardBody>
          </Card>
        </Stat>
        
        <Stat>
          <Card>
            <CardBody>
              <StatLabel>总支付额</StatLabel>
              <StatNumber>{stats.totalPayments}</StatNumber>
              <StatHelpText>平台支付总额(USD)</StatHelpText>
            </CardBody>
          </Card>
        </Stat>
      </SimpleGrid>
      
      <Stack spacing={6}>
        <Card>
          <CardBody>
            <Heading size="md" mb={4}>用户管理</Heading>
            <Text mb={4}>管理平台用户，包括查看、编辑、删除和拉黑用户。</Text>
            <Button colorScheme="blue" onClick={() => router.push('/admin/users')}>进入用户管理</Button>
          </CardBody>
        </Card>
        
        <Card>
          <CardBody>
            <Heading size="md" mb={4}>项目管理</Heading>
            <Text mb={4}>管理平台项目，包括查看、编辑和删除项目。</Text>
            <Button colorScheme="green" onClick={() => router.push('/admin/projects')}>进入项目管理</Button>
          </CardBody>
        </Card>
        
        <Card>
          <CardBody>
            <Heading size="md" mb={4}>订单管理</Heading>
            <Text mb={4}>管理平台订单，包括查看订单详情和处理退款。</Text>
            <Button colorScheme="purple" onClick={() => router.push('/admin/orders')}>进入订单管理</Button>
          </CardBody>
        </Card>
      </Stack>
    </Container>
  );
}