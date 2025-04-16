'use client';

import { Box, Button, Container, Heading, Text, VStack, SimpleGrid, Icon, HStack } from '@chakra-ui/react';
import { FaCode, FaUsers, FaHandshake } from 'react-icons/fa';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

export default function HomePage() {
  const router = useRouter();
  const { data: session } = useSession();

  const features = [
    {
      icon: FaCode,
      title: '高质量项目',
      description: '精选优质项目，确保开发者的时间和技能得到合理回报',
    },
    {
      icon: FaUsers,
      title: '专业社区',
      description: '加入由专业开发者组成的社区，分享经验，共同成长',
    },
    {
      icon: FaHandshake,
      title: '安全交易',
      description: '平台提供安全的支付和合同管理，保障双方权益',
    },
  ];

  return (
    <Box bg="gray.50" minH="calc(100vh - 64px)">
      <Container maxW="container.xl" py={16}>
        <VStack spacing={12} align="center">
          <Box textAlign="center" maxW="3xl">
            <Heading
              as="h1"
              size="2xl"
              bgGradient="linear(to-r, blue.400, purple.500)"
              bgClip="text"
              mb={6}
            >
              连接开发者与项目机会
            </Heading>
            <Text fontSize="xl" color="gray.600" mb={8}>
              加入我们的平台，找到适合你的项目，或者发布你的项目需求
            </Text>
            <HStack spacing={4} justify="center">
              <Button
                size="lg"
                colorScheme="blue"
                onClick={() => router.push('/projects')}
              >
                浏览项目
              </Button>
              {session ? (
                <Button
                  size="lg"
                  colorScheme="purple"
                  onClick={() => router.push('/projects/new')}
                >
                  发布项目
                </Button>
              ) : (
                <Button
                  size="lg"
                  colorScheme="purple"
                  onClick={() => router.push('/login')}
                >
                  登录后发布
                </Button>
              )}
            </HStack>
          </Box>

          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={10} w="full">
            {features.map((feature, index) => (
              <Box
                key={index}
                p={8}
                bg="white"
                borderRadius="lg"
                boxShadow="md"
                textAlign="center"
              >
                <Icon
                  as={feature.icon}
                  w={12}
                  h={12}
                  color="blue.500"
                  mb={4}
                />
                <Heading size="md" mb={4}>
                  {feature.title}
                </Heading>
                <Text color="gray.600">{feature.description}</Text>
              </Box>
            ))}
          </SimpleGrid>
        </VStack>
      </Container>
    </Box>
  );
} 