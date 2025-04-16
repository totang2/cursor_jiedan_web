'use client';

import {
  Box,
  Button,
  Container,
  FormControl,
  FormLabel,
  Input,
  Stack,
  Text,
  Link as ChakraLink,
  useToast,
} from '@chakra-ui/react';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 验证密码匹配
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: '密码不匹配',
        description: '请确保两次输入的密码相同',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      setIsLoading(true);

      // 调用注册 API
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '注册失败');
      }

      // 注册成功
      toast({
        title: '注册成功',
        description: '您的账号已创建，即将跳转到登录页面',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      // 延迟 2 秒后跳转到登录页面
      setTimeout(() => {
        router.push('/login');
      }, 2000);

    } catch (error) {
      toast({
        title: '注册失败',
        description: error instanceof Error ? error.message : '发生未知错误',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <Container maxW="lg" py={{ base: '12', md: '24' }} px={{ base: '0', sm: '8' }}>
      <Stack spacing="8">
        <Stack spacing="6" textAlign="center">
          <Text fontSize="2xl" fontWeight="bold">创建账号</Text>
          <Text color="gray.600">
            已有账号？
            <Link href="/login" passHref legacyBehavior>
              <ChakraLink color="blue.500" ml={1}>
                立即登录
              </ChakraLink>
            </Link>
          </Text>
        </Stack>
        <Box
          py={{ base: '0', sm: '8' }}
          px={{ base: '4', sm: '10' }}
          bg={{ base: 'transparent', sm: 'bg-surface' }}
          boxShadow={{ base: 'none', sm: 'md' }}
          borderRadius={{ base: 'none', sm: 'xl' }}
        >
          <form onSubmit={handleSubmit}>
            <Stack spacing="6">
              <FormControl isRequired>
                <FormLabel>用户名</FormLabel>
                <Input
                  name="username"
                  type="text"
                  value={formData.username}
                  onChange={handleChange}
                  disabled={isLoading}
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>邮箱</FormLabel>
                <Input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={isLoading}
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>密码</FormLabel>
                <Input
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={isLoading}
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>确认密码</FormLabel>
                <Input
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  disabled={isLoading}
                />
              </FormControl>
              <Button
                type="submit"
                colorScheme="blue"
                size="lg"
                isLoading={isLoading}
                loadingText="注册中..."
              >
                注册
              </Button>
            </Stack>
          </form>
        </Box>
      </Stack>
    </Container>
  );
} 