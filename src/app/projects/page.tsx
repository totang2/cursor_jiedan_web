'use client';

import { Box, Container, Heading, Text, SimpleGrid, VStack, Badge, HStack, Link as ChakraLink, Spinner, Avatar, Divider, Button } from '@chakra-ui/react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { formatAmount } from '@/lib/currency';
import { useToast } from '@chakra-ui/react';
import { Spacer } from '@chakra-ui/react';

interface Client {
  id: string;
  name?: string;
  profile?: {
    avatar?: string;
  };
}

interface Project {
  id: string;
  title: string;
  description: string;
  budget: number;
  currency: string;
  deadline: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'COMPLETED';
  skills: string[];
  createdAt: string;
  updatedAt: string;
  client: Client;
  orders?: {
    id: string;
    status: string;
    payment?: {
      status: string;
    };
  }[];
}

const statusColorScheme = {
  OPEN: 'green',
  IN_PROGRESS: 'blue',
  COMPLETED: 'gray',
} as const;

const statusLabels = {
  OPEN: '开放中',
  IN_PROGRESS: '进行中',
  COMPLETED: '已完成',
} as const;

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { data: session } = useSession();
  const router = useRouter();
  const toast  = useToast();

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch('/api/projects?include=orders');
        if (!response.ok) {
          throw new Error('获取项目列表失败');
        }
        const data = await response.json();
        setProjects(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : '获取项目列表失败');
        toast({
          title: 'Error',
          description: 'Failed to fetch projects',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [toast]);

  // 判断项目是否已支付
  const isProjectPaid = (project: Project) => {
    if (!project.orders || project.orders.length === 0) return false;
    
    // 检查是否有已支付的订单
    return project.orders.some(order => 
      order.status === 'PAID' || order.payment?.status === 'SUCCESS'
    );
  };

  const createChat = async (userId: string) => {
    if (!userId) return;

    try {
      const response = await fetch('/api/chats', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });

      if (!response.ok) {
        throw new Error('创建聊天失败');
      }

      const data = await response.json();
      router.push(`/chats/${data.id}`);
    } catch (error) {
      console.error('创建聊天失败:', error);
      // 可以添加一个 toast 提示
    }
  };

  if (loading) {
    return (
      <Container maxW="container.xl" py={8} centerContent>
        <Spinner size="xl" />
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxW="container.xl" py={8}>
        <Text color="red.500">{error}</Text>
      </Container>
    );
  }

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        <Box>
          <HStack justify="space-between" align="center" mb={4}>
            <Heading size="xl">项目列表</Heading>
            {session ? (
              <Button
                colorScheme="blue"
                size="lg"
                onClick={() => router.push('/projects/new')}
              >
                发布项目
              </Button>
            ) : (
              <Button
                colorScheme="blue"
                size="lg"
                onClick={() => router.push('/login')}
              >
                登录后发布
              </Button>
            )}
          </HStack>
          <Text color="gray.600" fontSize="lg">
            浏览所有可用的项目，找到适合你的机会
          </Text>
        </Box>

        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
          {projects.map((project) => (
            <Link key={project.id} href={`/projects/${project.id}`} passHref legacyBehavior>
              <ChakraLink
                _hover={{ textDecoration: 'none' }}
              >
                <Box
                  p={6}
                  borderWidth="1px"
                  borderRadius="lg"
                  _hover={{ shadow: 'md', transform: 'translateY(-2px)', transition: 'all 0.2s' }}
                  cursor="pointer"
                >
                  <VStack align="stretch" spacing={4}>
                    <HStack justify="space-between">
                      <Heading size="md">{project.title}</Heading>
                      <Badge colorScheme={statusColorScheme[project.status]}>
                        {statusLabels[project.status]}
                      </Badge>
                    </HStack>
                    
                    {/* 显示项目来源 */}
                    {project.source && (
                        <HStack spacing={2} align="center" justify="flex-start">
                            <Text fontSize="sm" color="gray.500">来源:</Text>
                            <Badge colorScheme="teal">
                                {project.source === 'upwork' && 'Upwork'}
                                {project.source === 'freelancer' && 'Freelancer'}
                                {project.source === 'programinn' && '程序员客栈'}
                                {project.source === 'other' && '其他'}
                            </Badge>
                            {project.originalLink && (
                                <>
                                    <Spacer minW="4px" />
                                    <a href={project.originalLink} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
                                        <Badge colorScheme="blue" cursor="pointer">原始链接</Badge>
                                    </a>
                                </>
                            )}
                        </HStack>
                    )}
                    
                    <Text noOfLines={3} color="gray.600">
                      {project.description}
                    </Text>
                    <Text fontWeight="bold" color="blue.600">
                      预算: {formatAmount(project.budget, project.currency)}
                    </Text>
                    <Text fontWeight="bold" color="blue.600">
                      截止日期: {new Date(project.deadline).toLocaleDateString()}
                    </Text>
                    <HStack spacing={2} flexWrap="wrap">
                      {project.skills?.slice(0, 3).map((skill) => (
                        <Badge key={skill} colorScheme="purple">
                          {skill}
                        </Badge>
                      ))}
                      {project.skills?.length > 3 && (
                        <Badge colorScheme="gray">+{project.skills.length - 3}</Badge>
                      )}
                    </HStack>
                    {/* 添加支付状态显示 */}
                    {isProjectPaid(project) ? (
                      <Badge colorScheme="green" alignSelf="flex-start">
                        已支付
                      </Badge>
                    ) : (
                      <Badge colorScheme="red" alignSelf="flex-start">
                        未支付
                      </Badge>
                    )}
                    <Divider />
                    <HStack spacing={3}>
                      <Avatar
                        size="sm"
                        name={project.client?.name}
                        src={project.client?.profile?.avatar}
                      />
                      <VStack align="start" spacing={0}>
                        <Text fontWeight="medium" fontSize="sm">
                          {project.client?.name || '匿名用户'}
                        </Text>
                        <Text fontSize="xs" color="gray.500">
                          {new Date(project.createdAt).toLocaleDateString('zh-CN')}
                        </Text>
                      </VStack>
                      {session && project.client?.id && session.user.id !== project.client.id && (
                        <Button
                          size="sm"
                          colorScheme="blue"
                          variant="outline"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            createChat(project.client.id);
                          }}
                        >
                          联系发布者
                        </Button>
                      )}
                    </HStack>
                  </VStack>
                </Box>
              </ChakraLink>
            </Link>
          ))}
        </SimpleGrid>
      </VStack>
    </Container>
  );
}