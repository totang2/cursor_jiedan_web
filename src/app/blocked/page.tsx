'use client';

import { useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  VStack,
  Icon,
} from '@chakra-ui/react';
import { WarningIcon } from '@chakra-ui/icons';

export default function BlockedPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push('/login');
  };

  if (status === 'loading') {
    return (
      <Container maxW="container.md" py={16}>
        <Text>加载中...</Text>
      </Container>
    );
  }

  return (
    <Container maxW="container.md" py={16}>
      <VStack spacing={8} align="center">
        <Icon as={WarningIcon} w={16} h={16} color="red.500" />
        <Heading>账户已被限制</Heading>
        <Text fontSize="lg" textAlign="center">
          您的账户已被管理员限制访问。如有疑问，请联系平台管理员。
        </Text>
        <Button colorScheme="red" onClick={handleLogout}>
          退出登录
        </Button>
      </VStack>
    </Container>
  );
}