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
    FormErrorMessage,
    InputGroup,
    InputRightElement,
    IconButton,
} from '@chakra-ui/react';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons';
import { useAuthStore } from '@/store/useAuthStore';

export default function LoginPage() {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [errors, setErrors] = useState({
        email: '',
        password: '',
    });
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const toast = useToast();
    const router = useRouter();

    const validateForm = () => {
        const newErrors = {
            email: '',
            password: '',
        };
        let isValid = true;

        if (!formData.email) {
            newErrors.email = '请输入邮箱';
            isValid = false;
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = '请输入有效的邮箱地址';
            isValid = false;
        }

        if (!formData.password) {
            newErrors.password = '请输入密码';
            isValid = false;
        } else if (formData.password.length < 6) {
            newErrors.password = '密码长度至少为6位';
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || '登录失败');
            }

            // 使用 auth store 保存用户信息
            useAuthStore.getState().login(data.user, data.token);

            toast({
                title: '登录成功',
                description: '欢迎回来！',
                status: 'success',
                duration: 3000,
                isClosable: true,
            });

            // 登录成功后跳转到首页
            router.push('/');
        } catch (error) {
            toast({
                title: '登录失败',
                description: error instanceof Error ? error.message : '请检查邮箱和密码是否正确',
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
        // 清除对应字段的错误信息
        if (errors[name as keyof typeof errors]) {
            setErrors(prev => ({
                ...prev,
                [name]: '',
            }));
        }
    };

    return (
        <Container maxW="lg" py={{ base: '12', md: '24' }} px={{ base: '0', sm: '8' }}>
            <Stack spacing="8">
                <Stack spacing="6" textAlign="center">
                    <Text fontSize="2xl" fontWeight="bold">登录</Text>
                    <Text color="gray.600">
                        还没有账号？
                        <Link href="/register" passHref legacyBehavior>
                            <ChakraLink color="blue.500" ml={1}>
                                立即注册
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
                            <FormControl isRequired isInvalid={!!errors.email}>
                                <FormLabel>邮箱</FormLabel>
                                <Input
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="请输入邮箱"
                                />
                                <FormErrorMessage>{errors.email}</FormErrorMessage>
                            </FormControl>
                            <FormControl isRequired isInvalid={!!errors.password}>
                                <FormLabel>密码</FormLabel>
                                <InputGroup>
                                    <Input
                                        name="password"
                                        type={showPassword ? 'text' : 'password'}
                                        value={formData.password}
                                        onChange={handleChange}
                                        placeholder="请输入密码"
                                    />
                                    <InputRightElement>
                                        <IconButton
                                            aria-label={showPassword ? '隐藏密码' : '显示密码'}
                                            icon={showPassword ? <ViewOffIcon /> : <ViewIcon />}
                                            variant="ghost"
                                            onClick={() => setShowPassword(!showPassword)}
                                        />
                                    </InputRightElement>
                                </InputGroup>
                                <FormErrorMessage>{errors.password}</FormErrorMessage>
                            </FormControl>
                            <Button
                                type="submit"
                                colorScheme="blue"
                                size="lg"
                                isLoading={isLoading}
                                loadingText="登录中..."
                            >
                                登录
                            </Button>
                        </Stack>
                    </form>
                </Box>
            </Stack>
        </Container>
    );
} 