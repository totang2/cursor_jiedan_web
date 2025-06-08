'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import {
  Container,
  Box,
  Heading,
  Text,
  Badge,
  VStack,
  HStack,
  Divider,
  Avatar,
  Button,
  Spinner,
  useToast,
  Textarea,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
  Center,
} from '@chakra-ui/react';
import { useSession } from 'next-auth/react';
import { format } from 'date-fns';
import PayButton from '@/components/PayButton';

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

interface Project {
  id: string;
  title: string;
  description: string;
  budget: number;
  deadline: string;
  category: string;
  status: string;
  skills: string[];
  createdAt: string;
  client: {
    id: string;
    name: string;
    email: string;
    profile?: {
      avatar?: string;
      bio?: string;
    };
  };
}

export default function ProjectDetailPage() {
  const params = useParams();
  const { data: session } = useSession();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchProject = async () => {
      if (!params?.id) return;

      try {
        const response = await fetch(`/api/projects/${params.id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch project');
        }
        const data = await response.json();
        setProject(data);
      } catch (error) {
        console.error('Error fetching project:', error);
        setError('Failed to load project details');
        toast({
          title: 'Error',
          description: 'Failed to load project details',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProject();
  }, [params?.id, toast]);

  const handleApply = async () => {
    if (!params?.id) return;
    setIsSubmitting(true);
  
    try {
      const response = await fetch(`/api/projects/${params.id}/apply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message }), // 使用用户输入的消息
      });
      if (!response.ok) {
        // 尝试解析服务端返回的错误信息
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to apply for project');
      }
      toast({
        title: 'Success',
        description: 'Application submitted successfully',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      onClose(); // 关闭弹框
      setMessage(''); // 清空消息
    } catch (error) {
      console.error('Error applying for project:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to submit application',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <Center h="50vh">
        <Spinner size="xl" />
      </Center>
    );
  }

  if (error || !project) {
    return (
      <Center h="50vh">
        <Text color="red.500">{error || '项目不存在'}</Text>
      </Center>
    );
  }

  return (
    <Container maxW="container.lg" py={8}>
      <VStack spacing={6} align="stretch">
        <Box>
          <Heading size="lg" mb={2}>
            {project.title}
          </Heading>
          <HStack spacing={4} mb={4}>
            <Badge colorScheme="blue">{project.category}</Badge>
            <Badge colorScheme={statusColorScheme[project.status as keyof typeof statusColorScheme]}>
              {statusLabels[project.status as keyof typeof statusLabels]}
            </Badge>
          </HStack>
        </Box>

        <Box>
          <Text fontSize="lg" mb={4}>
            {project.description}
          </Text>
        </Box>

        <Divider />

        <Box>
          <Heading size="md" mb={4}>所需技能</Heading>
          <HStack spacing={2} flexWrap="wrap">
            {project.skills?.map((skill) => (
              <Badge key={skill} colorScheme="purple" fontSize="md" px={3} py={1}>
                {skill}
              </Badge>
            )) || []}
          </HStack>
        </Box>

        <Divider />

        <Box>
          <Heading size="md" mb={4}>项目发布者</Heading>
          <HStack spacing={4}>
            <Avatar
              size="lg"
              name={project.client?.name}
              src={project.client?.profile?.avatar}
            />
            <VStack align="start" spacing={1}>
              <Text fontWeight="bold">{project.client?.name}</Text>
              <Text color="gray.600">{project.client?.email}</Text>
              {project.client?.profile?.bio && (
                <Text color="gray.600">{project.client.profile.bio}</Text>
              )}
            </VStack>
          </HStack>
        </Box>

        <Divider />

        <HStack justify="space-between" align="center">
          <VStack align="start" spacing={2}>
            <Text>
              <strong>预算：</strong>¥{project.budget ? project.budget.toFixed(2) : '0.00'}
            </Text>
            <Text>
              <strong>截止日期：</strong>
              {project.deadline ? format(new Date(project.deadline), 'yyyy-MM-dd') : '未设置'}
            </Text>
            <Text>
              <strong>发布时间：</strong>
              {project.createdAt ? format(new Date(project.createdAt), 'yyyy-MM-dd HH:mm') : '未知'}
            </Text>
          </VStack>

          {session?.user?.id && project.client?.id && session.user.id !== project.client.id && (
            <Box>
              <PayButton projectId={project.id} />
            </Box>
          )}
        </HStack>

        {session && project.status === 'OPEN' && (
          <Box>
            <Button
              colorScheme="blue"
              size="lg"
              width="full"
              onClick={onOpen}
            >
              申请项目
            </Button>
          </Box>
        )}

        <Modal isOpen={isOpen} onClose={onClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>申请项目</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Textarea
                placeholder="请简要介绍你的经验和技能，以及为什么适合这个项目..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                size="lg"
                rows={6}
              />
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onClose}>
                取消
              </Button>
              <Button
                colorScheme="blue"
                onClick={handleApply}
                isLoading={isSubmitting}
              >
                提交申请
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </VStack>
    </Container>
  );
}