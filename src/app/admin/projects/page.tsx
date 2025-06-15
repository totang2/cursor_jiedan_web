'use client';

import { useEffect, useState, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Container,
  Heading,
  Text,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Button,
  HStack,
  Badge,
  useToast,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  useDisclosure,
  Input,
  Select,
  Flex,
  Spinner,
  Center,
} from '@chakra-ui/react';
import { format } from 'date-fns';

interface Project {
  id: string;
  title: string;
  description: string;
  budget: number;
  currency: string;
  deadline: string;
  category: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  client: {
    id: string;
    name: string;
    email: string;
  };
  orders?: {
    id: string;
    status: string;
    payment?: {
      status: string;
    };
  }[];
}

export default function AdminProjects() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const toast = useToast();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = useRef<HTMLButtonElement>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

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
        // 获取项目列表
        fetchProjects();
      }
    } else if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, session, router, toast]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/projects?include=orders');
      if (response.ok) {
        const data = await response.json();
        setProjects(data);
      }
    } catch (error) {
      console.error('获取项目列表失败', error);
      toast({
        title: '错误',
        description: '获取项目列表失败',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (project: Project) => {
    setSelectedProject(project);
    onOpen();
  };

  const handleDelete = async () => {
    if (!selectedProject) return;

    try {
      const response = await fetch(`/api/projects/${selectedProject.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setProjects(projects.filter(p => p.id !== selectedProject.id));
        toast({
          title: '成功',
          description: '项目已删除',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } else {
        const error = await response.json();
        throw new Error(error.error || '删除项目失败');
      }
    } catch (error) {
      toast({
        title: '错误',
        description: error instanceof Error ? error.message : '删除项目失败',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      onClose();
      setSelectedProject(null);
    }
  };

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.client.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter ? project.status === statusFilter : true;
    return matchesSearch && matchesStatus;
  });

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

  // 判断项目是否已支付
  const isProjectPaid = (project: Project) => {
    if (!project.orders || project.orders.length === 0) return false;
    
    // 检查是否有已支付的订单
    return project.orders.some(order => 
      order.status === 'PAID' || order.payment?.status === 'SUCCESS'
    );
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
      <Heading mb={6}>项目管理</Heading>
      
      <Flex mb={6} gap={4} flexWrap="wrap">
        <Input
          placeholder="搜索项目或发布者"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          maxW="300px"
        />
        <Select
          placeholder="按状态筛选"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          maxW="200px"
        >
          <option value="">全部状态</option>
          <option value="OPEN">开放中</option>
          <option value="IN_PROGRESS">进行中</option>
          <option value="COMPLETED">已完成</option>
        </Select>
        <Button colorScheme="blue" onClick={fetchProjects}>刷新</Button>
      </Flex>

      {loading ? (
        <Center h="200px">
          <Spinner size="xl" />
        </Center>
      ) : filteredProjects.length > 0 ? (
        <Box overflowX="auto">
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>标题</Th>
                <Th>发布者</Th>
                <Th>预算</Th>
                <Th>状态</Th>
                <Th>支付状态</Th>
                <Th>发布时间</Th>
                <Th>操作</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filteredProjects.map((project) => (
                <Tr key={project.id}>
                  <Td>{project.title}</Td>
                  <Td>{project.client.name}</Td>
                  <Td>{project.budget} {project.currency}</Td>
                  <Td>
                    <Badge colorScheme={statusColorScheme[project.status as keyof typeof statusColorScheme]}>
                      {statusLabels[project.status as keyof typeof statusLabels]}
                    </Badge>
                  </Td>
                  <Td>
                    <Badge colorScheme={isProjectPaid(project) ? 'green' : 'red'}>
                      {isProjectPaid(project) ? '已支付' : '未支付'}
                    </Badge>
                  </Td>
                  <Td>{format(new Date(project.createdAt), 'yyyy-MM-dd')}</Td>
                  <Td>
                    <HStack spacing={2}>
                      <Button
                        size="sm"
                        colorScheme="blue"
                        onClick={() => router.push(`/projects/${project.id}`)}
                      >
                        查看
                      </Button>
                      <Button
                        size="sm"
                        colorScheme="red"
                        onClick={() => handleDeleteClick(project)}
                      >
                        删除
                      </Button>
                    </HStack>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      ) : (
        <Text>没有找到项目</Text>
      )}

      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              删除项目
            </AlertDialogHeader>

            <AlertDialogBody>
              确定要删除项目 "{selectedProject?.title}" 吗？此操作无法撤销。
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose}>
                取消
              </Button>
              <Button colorScheme="red" onClick={handleDelete} ml={3}>
                删除
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Container>
  );
}