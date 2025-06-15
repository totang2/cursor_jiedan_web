'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ProjectStatus } from '@prisma/client';
import {
    Box,
    Container,
    Heading,
    Text,
    SimpleGrid,
    VStack,
    HStack,
    Badge,
    Button,
    Spinner,
    useToast,
    Menu,
    MenuButton,
    MenuList,
    MenuItem,
    IconButton,
} from '@chakra-ui/react';
import { ChevronDownIcon, EditIcon, DeleteIcon } from '@chakra-ui/icons';
import { useSession } from 'next-auth/react';

interface Application {
    id: string;
    projectId: string;
    userId: string;
    message?: string;
    status: string;
    createdAt: string;
    updatedAt: string;
}

interface Project {
    id: string;
    title: string;
    description: string;
    budget: number;
    deadline: string;
    category: string;
    status: ProjectStatus;
    clientId: string;
    skills: string[];
    createdAt: string;
    updatedAt: string;
    applications: Application[];
}



const statusColorScheme = {
    OPEN: 'green',
    IN_PROGRESS: 'blue',
    COMPLETED: 'gray',
    CANCELLED: 'red',
} as const;

const statusLabels = {
    OPEN: '开放中',
    IN_PROGRESS: '进行中',
    COMPLETED: '已完成',
    CANCELLED: '已取消',
} as const;

export default function MyProjectsPage() {
    const router = useRouter();
    const { data: session } = useSession();
    const toast = useToast();
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchProjects = async () => {
            try { // 添加这行调试信息
                const response = await fetch('/api/projects/my');
                if (!response.ok) {
                    throw new Error('获取项目列表失败');
                }
                const data = await response.json();
                console.log('获取到的项目数据:', data); // 添加这行调试信息
                console.log('数据类型:', Array.isArray(data) ? '数组' : typeof data); // 检查数据类型
                console.log('数据长度:', Array.isArray(data) ? data.length : '非数组'); // 检查数组长度
                setProjects(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : '获取项目列表失败');
                toast({
                    title: '错误',
                    description: err instanceof Error ? err.message : '获取项目列表失败',
                    status: 'error',
                    duration: 5000,
                    isClosable: true,
                });
            } finally {
                setLoading(false);
            }
        };

        fetchProjects();
    }, [toast]);

    const handleStatusChange = async (projectId: string, newStatus: ProjectStatus) => {
        try {
            const response = await fetch(`/api/projects/${projectId}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ status: newStatus }),
            });

            if (!response.ok) {
                throw new Error('更新项目状态失败');
            }

            const updatedProject = await response.json();
            setProjects(projects.map(project =>
                project.id === projectId ? updatedProject : project
            ));

            toast({
                title: '成功',
                description: '项目状态已更新',
                status: 'success',
                duration: 3000,
                isClosable: true,
            });
        } catch (err) {
            toast({
                title: '错误',
                description: err instanceof Error ? err.message : '更新项目状态失败',
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
        }
    };

    const handleDelete = async (projectId: string) => {
        if (!window.confirm('确定要删除这个项目吗？此操作不可撤销。')) {
            return;
        }

        try {
            const response = await fetch(`/api/projects/${projectId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('删除项目失败');
            }

            setProjects(projects.filter(project => project.id !== projectId));
            toast({
                title: '成功',
                description: '项目已删除',
                status: 'success',
                duration: 3000,
                isClosable: true,
            });
        } catch (err) {
            toast({
                title: '错误',
                description: err instanceof Error ? err.message : '删除项目失败',
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
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

    // 在渲染前添加数据验证
    const validProjects = projects.filter(project => {
        const isValid = project && project.id && project.title && project.description;
        if (!isValid) {
            console.warn('发现无效项目数据:', project);
        }
        return isValid;
    });
    
    // 添加调试日志
    console.log('准备渲染，项目数量:', projects.length);
    console.log('loading状态:', loading);
    console.log('error状态:', error);

    return (
        <Container maxW="container.xl" py={8}>
            <VStack spacing={8} align="stretch">
                <Box>
                    <HStack justify="space-between" align="center">
                        <Heading size="xl">我的项目</Heading>
                        <Button
                            colorScheme="blue"
                            onClick={() => router.push('/projects/new')}
                        >
                            发布新项目
                        </Button>
                    </HStack>
                    <Text color="gray.600" fontSize="lg" mt={2}>
                        管理你发布的所有项目
                    </Text>
                </Box>

                <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                    {validProjects.length === 0 ? (
                        <Box p={6} borderWidth="1px" borderRadius="lg">
                            <Text>暂无项目</Text>
                        </Box>
                    ) : (
                        validProjects.map((project) => (
                            <Box
                                key={project.id}
                                p={6}
                                borderWidth="1px"
                                borderRadius="lg"
                                position="relative"
                            >
                                <Badge
                                    colorScheme={statusColorScheme[project.status]}
                                    position="absolute"
                                    top={2}
                                    right={2}
                                >
                                    {statusLabels[project.status]}
                                </Badge>
                                
                                <Menu>
                                    <MenuButton
                                        as={IconButton}
                                        icon={<ChevronDownIcon />}
                                        variant="ghost"
                                        size="sm"
                                        position="absolute"
                                        top={2}
                                        right={16}
                                    />
                                    <MenuList>
                                        <MenuItem
                                            icon={<EditIcon />}
                                            onClick={() => router.push(`/projects/${project.id}/edit`)}
                                        >
                                            编辑
                                        </MenuItem>
                                        <MenuItem
                                            icon={<DeleteIcon />}
                                            onClick={() => handleDelete(project.id)}
                                        >
                                            删除
                                        </MenuItem>
                                    </MenuList>
                                </Menu>
                                
                                <Heading size="md" mb={2} noOfLines={2}>
                                    {project.title}
                                </Heading>
                                <Text color="gray.600" noOfLines={3} mb={4}>
                                    {project.description}
                                </Text>
                                <Text fontWeight="bold" mb={1}>
                                    预算: ¥{project.budget.toLocaleString()}
                                </Text>
                                <Text mb={4}>
                                    申请数: {project.applications.length}
                                </Text>
                                <Button
                                    colorScheme="blue"
                                    size="sm"
                                    width="full"
                                    onClick={() => router.push(`/projects/${project.id}`)}
                                >
                                    查看详情
                                </Button>
                            </Box>
                        ))
                    )}
                </SimpleGrid>
            </VStack>
        </Container>
    );
}