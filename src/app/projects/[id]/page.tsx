'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Badge,
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
} from '@chakra-ui/react';
import { useSession } from 'next-auth/react';

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

export default function ProjectDetailPage() {
  const { id } = useParams();
  const { data: session } = useSession();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await fetch(`/api/projects/${id}`);
        if (!response.ok) {
          throw new Error('获取项目详情失败');
        }
        const data = await response.json();
        setProject(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : '获取项目详情失败');
        toast({
          title: '错误',
          description: err instanceof Error ? err.message : '获取项目详情失败',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [id, toast]);

  const handleApply = async () => {
    if (!message.trim()) {
      toast({
        title: '错误',
        description: '请填写申请信息',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/projects/${id}/apply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '申请失败');
      }

      toast({
        title: '申请成功',
        description: '你的申请已提交，请等待项目方的回复',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      onClose();
      setMessage('');
    } catch (err) {
      toast({
        title: '错误',
        description: err instanceof Error ? err.message : '申请失败',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Container maxW="container.xl" py={8} centerContent>
        <Spinner size="xl" />
      </Container>
    );
  }

  if (error || !project) {
    return (
      <Container maxW="container.xl" py={8}>
        <Text color="red.500">{error || '项目不存在'}</Text>
      </Container>
    );
  }

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        <Box>
          <HStack justify="space-between" align="center" mb={4}>
            <Heading size="xl">{project.title}</Heading>
            <Badge colorScheme={statusColorScheme[project.status]} fontSize="md" px={3} py={1}>
              {statusLabels[project.status]}
            </Badge>
          </HStack>
          <Text color="gray.600" fontSize="lg" mb={4}>
            {project.description}
          </Text>
          <Text fontWeight="bold" color="blue.600" fontSize="xl">
            预算: ¥{typeof project.budget === 'number' ? project.budget.toLocaleString() : '0'}
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