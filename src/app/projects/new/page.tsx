'use client';

import {
    Box,
    Button,
    Container,
    FormControl,
    FormLabel,
    Input,
    Stack,
    Textarea,
    Select,
    NumberInput,
    NumberInputField,
    NumberInputStepper,
    NumberIncrementStepper,
    NumberDecrementStepper,
    useToast,
    Heading,
    FormErrorMessage,
} from '@chakra-ui/react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

export default function NewProjectPage() {
    const { data: session } = useSession();
    const router = useRouter();
    const toast = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        budget: '',
        deadline: '',
        category: '',
        skills: '',
    });
    const [errors, setErrors] = useState({
        title: '',
        description: '',
        budget: '',
        deadline: '',
        category: '',
        skills: '',
    });

    const validateForm = () => {
        const newErrors = {
            title: '',
            description: '',
            budget: '',
            deadline: '',
            category: '',
            skills: '',
        };
        let isValid = true;

        if (!formData.title) {
            newErrors.title = '请输入项目标题';
            isValid = false;
        }

        if (!formData.description) {
            newErrors.description = '请输入项目描述';
            isValid = false;
        }

        if (!formData.budget) {
            newErrors.budget = '请输入项目预算';
            isValid = false;
        }

        if (!formData.deadline) {
            newErrors.deadline = '请选择项目截止日期';
            isValid = false;
        }

        if (!formData.category) {
            newErrors.category = '请选择项目类别';
            isValid = false;
        }

        if (!formData.skills) {
            newErrors.skills = '请输入所需技能';
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
            const response = await fetch('/api/projects', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                throw new Error('发布项目失败');
            }

            toast({
                title: '项目发布成功',
                status: 'success',
                duration: 3000,
                isClosable: true,
            });

            router.push('/projects');
        } catch (error) {
            toast({
                title: '发布失败',
                description: error instanceof Error ? error.message : '请稍后重试',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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

    if (!session) {
        router.push('/login');
        return null;
    }

    return (
        <Container maxW="container.md" py={8}>
            <Box bg="white" p={8} borderRadius="lg" boxShadow="sm">
                <Heading mb={6} size="lg">发布新项目</Heading>
                <form onSubmit={handleSubmit}>
                    <Stack spacing={6}>
                        <FormControl isRequired isInvalid={!!errors.title}>
                            <FormLabel>项目标题</FormLabel>
                            <Input
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                placeholder="请输入项目标题"
                            />
                            <FormErrorMessage>{errors.title}</FormErrorMessage>
                        </FormControl>

                        <FormControl isRequired isInvalid={!!errors.description}>
                            <FormLabel>项目描述</FormLabel>
                            <Textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                placeholder="请详细描述项目需求、目标和期望"
                                rows={6}
                            />
                            <FormErrorMessage>{errors.description}</FormErrorMessage>
                        </FormControl>

                        <FormControl isRequired isInvalid={!!errors.budget}>
                            <FormLabel>项目预算（元）</FormLabel>
                            <NumberInput min={0}>
                                <NumberInputField
                                    name="budget"
                                    value={formData.budget}
                                    onChange={handleChange}
                                    placeholder="请输入项目预算"
                                />
                                <NumberInputStepper>
                                    <NumberIncrementStepper />
                                    <NumberDecrementStepper />
                                </NumberInputStepper>
                            </NumberInput>
                            <FormErrorMessage>{errors.budget}</FormErrorMessage>
                        </FormControl>

                        <FormControl isRequired isInvalid={!!errors.deadline}>
                            <FormLabel>截止日期</FormLabel>
                            <Input
                                name="deadline"
                                type="date"
                                value={formData.deadline}
                                onChange={handleChange}
                            />
                            <FormErrorMessage>{errors.deadline}</FormErrorMessage>
                        </FormControl>

                        <FormControl isRequired isInvalid={!!errors.category}>
                            <FormLabel>项目类别</FormLabel>
                            <Select
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                placeholder="请选择项目类别"
                            >
                                <option value="web">Web开发</option>
                                <option value="mobile">移动应用</option>
                                <option value="desktop">桌面应用</option>
                                <option value="other">其他</option>
                            </Select>
                            <FormErrorMessage>{errors.category}</FormErrorMessage>
                        </FormControl>

                        <FormControl isRequired isInvalid={!!errors.skills}>
                            <FormLabel>所需技能</FormLabel>
                            <Input
                                name="skills"
                                value={formData.skills}
                                onChange={handleChange}
                                placeholder="请输入所需技能，用逗号分隔"
                            />
                            <FormErrorMessage>{errors.skills}</FormErrorMessage>
                        </FormControl>

                        <Button
                            type="submit"
                            colorScheme="blue"
                            size="lg"
                            isLoading={isLoading}
                            loadingText="发布中..."
                        >
                            发布项目
                        </Button>
                    </Stack>
                </form>
            </Box>
        </Container>
    );
} 