'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Box,
  Container,
  Heading,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Button,
  VStack,
  useToast,
  Spinner,
} from '@chakra-ui/react';
import { useSession } from 'next-auth/react';

// 定义项目接口
interface Project {
  id: string;
  title: string;
  description: string;
  budget: number;
  deadline: string;
  category: string;
  skills: string[];
  // 其他必要字段
}

export default function EditProjectPage() {
  const params = useParams();
  const router = useRouter();
  const toast = useToast();
  const { data: session } = useSession();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    budget: '',
    deadline: '',
    category: '',
    skills: '',
  });

  useEffect(() => {
    // 获取项目数据的逻辑
    const fetchProject = async () => {
      if (!params?.id) return;
      
      try {
        setLoading(true);
        const response = await fetch(`/api/projects/${params.id}`);
        if (!response.ok) {
          throw new Error('获取项目信息失败');
        }
        
        const data = await response.json();
        setProject(data);
        setFormData({
          title: data.title,
          description: data.description,
          budget: data.budget.toString(),
          deadline: data.deadline.split('T')[0], // 格式化日期
          category: data.category,
          skills: data.skills.join(', '),
        });
      } catch (err) {
        toast({
          title: '错误',
          description: err instanceof Error ? err.message : '获取项目信息失败',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [params?.id, toast]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSubmitting(true);
      const response = await fetch(`/api/projects/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          budget: parseFloat(formData.budget),
          skills: formData.skills.split(',').map(skill => skill.trim()),
        }),
      });

      if (!response.ok) {
        throw new Error('更新项目失败');
      }

      toast({
        title: '成功',
        description: '项目已更新',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      router.push(`/projects/${params.id}`);
    } catch (err) {
      toast({
        title: '错误',
        description: err instanceof Error ? err.message : '更新项目失败',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Container maxW="container.md" py={8} centerContent>
        <Spinner size="xl" />
      </Container>
    );
  }

  return (
    <Container maxW="container.md" py={8}>
      <VStack spacing={8} align="stretch">
        <Heading size="xl">编辑项目</Heading>
        
        <Box as="form" onSubmit={handleSubmit}>
          <VStack spacing={4} align="stretch">
            <FormControl isRequired>
              <FormLabel>项目标题</FormLabel>
              <Input
                name="title"
                value={formData.title}
                onChange={handleChange}
              />
            </FormControl>
            
            <FormControl isRequired>
              <FormLabel>项目描述</FormLabel>
              <Textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={6}
              />
            </FormControl>
            
            <FormControl isRequired>
              <FormLabel>预算</FormLabel>
              <Input
                name="budget"
                type="number"
                value={formData.budget}
                onChange={handleChange}
              />
            </FormControl>
            
            <FormControl isRequired>
              <FormLabel>截止日期</FormLabel>
              <Input
                name="deadline"
                type="date"
                value={formData.deadline}
                onChange={handleChange}
              />
            </FormControl>
            
            <FormControl isRequired>
              <FormLabel>类别</FormLabel>
              <Input
                name="category"
                value={formData.category}
                onChange={handleChange}
              />
            </FormControl>
            
            <FormControl isRequired>
              <FormLabel>技能要求（用逗号分隔）</FormLabel>
              <Input
                name="skills"
                value={formData.skills}
                onChange={handleChange}
              />
            </FormControl>
            
            <Button
              mt={4}
              colorScheme="blue"
              type="submit"
              isLoading={submitting}
              loadingText="提交中"
            >
              更新项目
            </Button>
          </VStack>
        </Box>
      </VStack>
    </Container>
  );
}