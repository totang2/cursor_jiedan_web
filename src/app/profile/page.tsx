'use client';

import { useState, useEffect } from 'react';
import {
    Box,
    Container,
    Heading,
    Text,
    VStack,
    HStack,
    Button,
    FormControl,
    FormLabel,
    Input,
    Textarea,
    Avatar,
    AvatarBadge,
    IconButton,
    useToast,
    Divider,
    SimpleGrid,
    Badge,
    Flex,
    Spinner,
} from '@chakra-ui/react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { EditIcon } from '@chakra-ui/icons';

interface UserProfile {
    bio: string;
    location: string;
    website: string;
    github: string;
    linkedin: string;
    hourlyRate: number;
    availability: boolean;
}

interface SessionUser {
    id: string;
    email: string;
    name?: string | null;
    image?: string | null;
    role: string;
}

export default function ProfilePage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const toast = useToast();
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [profile, setProfile] = useState<UserProfile>({
        bio: '',
        location: '',
        website: '',
        github: '',
        linkedin: '',
        hourlyRate: 0,
        availability: true,
    });

    const user = session?.user as SessionUser | undefined;

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login');
            return;
        }

        if (status === 'authenticated') {
            // 获取用户资料
            const fetchProfile = async () => {
                try {
                    const response = await fetch('/api/profile');
                    if (!response.ok) {
                        throw new Error('获取个人资料失败');
                    }
                    const data = await response.json();

                    if (data.profile) {
                        setProfile({
                            bio: data.profile.bio || '',
                            location: data.profile.location || '',
                            website: data.profile.website || '',
                            github: data.profile.github || '',
                            linkedin: data.profile.linkedin || '',
                            hourlyRate: data.profile.hourlyRate || 0,
                            availability: data.profile.availability ?? true,
                        });
                    }
                    setIsLoading(false);
                } catch (error) {
                    console.error('获取个人资料失败:', error);
                    toast({
                        title: '加载失败',
                        description: '无法加载个人资料，请稍后重试',
                        status: 'error',
                        duration: 3000,
                        isClosable: true,
                    });
                    setIsLoading(false);
                }
            };

            fetchProfile();
        }
    }, [status, router, toast]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        setProfile(prev => ({
            ...prev,
            [name]: type === 'number' ? parseFloat(value) : value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
    
        try {
            // 确保hourlyRate是数字类型
            const dataToSubmit = {
                ...profile,
                hourlyRate: parseFloat(profile.hourlyRate.toString()) || 0
            };
            
            const response = await fetch('/api/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(dataToSubmit),
            });
    
            if (!response.ok) {
                throw new Error('更新个人资料失败');
            }
    
            toast({
                title: '保存成功',
                description: '您的个人资料已更新',
                status: 'success',
                duration: 3000,
                isClosable: true,
            });
        } catch (error) {
            console.error('更新个人资料失败:', error);
            toast({
                title: '保存失败',
                description: '无法更新个人资料，请稍后重试',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
        } finally {
            setIsSaving(false);
        }
    };

    if (status === 'loading' || isLoading) {
        return (
            <Container maxW="container.lg" py={10} centerContent>
                <Spinner size="xl" />
                <Text mt={4}>加载个人资料...</Text>
            </Container>
        );
    }

    return (
        <Container maxW="container.lg" py={10}>
            <VStack spacing={8} align="stretch">
                <Flex justify="space-between" align="center">
                    <Heading size="xl">个人资料</Heading>
                    <Button
                        leftIcon={<EditIcon />}
                        colorScheme="blue"
                        onClick={handleSubmit}
                        isLoading={isSaving}
                        loadingText="保存中..."
                    >
                        保存更改
                    </Button>
                </Flex>

                <Divider />

                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8}>
                    <Box>
                        <VStack spacing={6} align="stretch">
                            <Box textAlign="center">
                                <Avatar
                                    size="2xl"
                                    name={user?.name || undefined}
                                    src={user?.image || undefined}
                                >
                                    <AvatarBadge boxSize="1.25em" bg="green.500" />
                                </Avatar>
                                <Heading size="md" mt={4}>{user?.name || '用户'}</Heading>
                                <Text color="gray.500">{user?.email}</Text>
                                <Badge colorScheme="blue" mt={2} px={3} py={1} borderRadius="full">
                                    {user?.role || '开发者'}
                                </Badge>
                            </Box>

                            <FormControl>
                                <FormLabel>个人简介</FormLabel>
                                <Textarea
                                    name="bio"
                                    value={profile.bio}
                                    onChange={handleChange}
                                    placeholder="介绍一下你自己..."
                                    rows={4}
                                />
                            </FormControl>

                            <FormControl>
                                <FormLabel>所在地</FormLabel>
                                <Input
                                    name="location"
                                    value={profile.location}
                                    onChange={handleChange}
                                    placeholder="例如：上海"
                                />
                            </FormControl>
                        </VStack>
                    </Box>

                    <Box>
                        <VStack spacing={6} align="stretch">
                            <FormControl>
                                <FormLabel>个人网站</FormLabel>
                                <Input
                                    name="website"
                                    value={profile.website}
                                    onChange={handleChange}
                                    placeholder="https://..."
                                />
                            </FormControl>

                            <FormControl>
                                <FormLabel>GitHub</FormLabel>
                                <Input
                                    name="github"
                                    value={profile.github}
                                    onChange={handleChange}
                                    placeholder="https://github.com/..."
                                />
                            </FormControl>

                            <FormControl>
                                <FormLabel>LinkedIn</FormLabel>
                                <Input
                                    name="linkedin"
                                    value={profile.linkedin}
                                    onChange={handleChange}
                                    placeholder="https://linkedin.com/in/..."
                                />
                            </FormControl>

                            <FormControl>
                                <FormLabel>时薪（元/小时）</FormLabel>
                                <Input
                                    name="hourlyRate"
                                    type="number"
                                    value={profile.hourlyRate}
                                    onChange={(e) => {
                                        const value = e.target.value === '' ? 0 : parseFloat(e.target.value);
                                        setProfile(prev => ({
                                            ...prev,
                                            hourlyRate: value
                                        }));
                                    }}
                                    placeholder="0"
                                />
                            </FormControl>

                            <FormControl>
                                <FormLabel>接单状态</FormLabel>
                                <Button
                                    name="availability"
                                    colorScheme={profile.availability ? 'green' : 'gray'}
                                    onClick={() => setProfile(prev => ({
                                        ...prev,
                                        availability: !prev.availability
                                    }))}
                                >
                                    {profile.availability ? '可接单' : '暂不接单'}
                                </Button>
                            </FormControl>
                        </VStack>
                    </Box>
                </SimpleGrid>
            </VStack>
        </Container>
    );
}