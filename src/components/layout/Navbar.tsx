import {
  Box,
  Flex,
  Button,
  useColorModeValue,
  Stack,
  useColorMode,
  Container,
  IconButton,
  HStack,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Avatar,
} from '@chakra-ui/react';
import { MoonIcon, SunIcon, HamburgerIcon } from '@chakra-ui/icons';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/router';

interface SessionUser {
  id: string;
  email: string;
  name?: string | null;
  image?: string | null;
  role: string;
}

export default function Navbar() {
  const { colorMode, toggleColorMode } = useColorMode();
  const { data: session } = useSession();
  const router = useRouter();
  const user = session?.user as SessionUser | undefined;

  return (
    <Box bg={useColorModeValue('white', 'gray.900')} px={4} boxShadow="sm">
      <Container maxW="container.xl">
        <Flex h={16} alignItems="center" justifyContent="space-between">
          <IconButton
            size="md"
            icon={<HamburgerIcon />}
            aria-label="Open Menu"
            display={{ md: 'none' }}
          />
          <HStack spacing={8} alignItems="center">
            <Box fontWeight="bold" fontSize="xl">
              <Link href="/">DevMarketplace</Link>
            </Box>
            <HStack as="nav" spacing={4} display={{ base: 'none', md: 'flex' }}>
              <Link href="/projects">项目</Link>
              <Link href="/developers">开发者</Link>
              <Link href="/how-it-works">如何运作</Link>
            </HStack>
          </HStack>

          <Flex alignItems="center">
            <Stack direction="row" spacing={4}>
              <Button onClick={toggleColorMode}>
                {colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
              </Button>
              {session ? (
                <Menu>
                  <MenuButton
                    as={Button}
                    rounded="full"
                    variant="link"
                    cursor="pointer"
                    minW={0}
                  >
                    <Avatar
                      size="sm"
                      src={user?.image || undefined}
                      name={user?.name || undefined}
                    />
                  </MenuButton>
                  <MenuList>
                    <MenuItem onClick={() => router.push('/dashboard')}>
                      控制面板
                    </MenuItem>
                    <MenuItem onClick={() => router.push('/profile')}>
                      个人资料
                    </MenuItem>
                    <MenuItem onClick={() => signOut()}>退出登录</MenuItem>
                  </MenuList>
                </Menu>
              ) : (
                <>
                  <Button
                    variant="ghost"
                    onClick={() => router.push('/login')}
                  >
                    登录
                  </Button>
                  <Button
                    colorScheme="blue"
                    onClick={() => router.push('/register')}
                  >
                    注册
                  </Button>
                </>
              )}
            </Stack>
          </Flex>
        </Flex>
      </Container>
    </Box>
  );
} 