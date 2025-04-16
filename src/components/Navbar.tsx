'use client';

import {
  Box,
  Flex,
  HStack,
  IconButton,
  Button,
  useDisclosure,
  Stack,
  Container,
  Link as ChakraLink,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Avatar,
  Text,
  useToast,
} from '@chakra-ui/react';
import { HamburgerIcon, CloseIcon } from '@chakra-ui/icons';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';

const Links = [
  { name: '首页', href: '/' },
  { name: '项目列表', href: '/projects' },
];

const NavLink = ({ children, href }: { children: React.ReactNode; href: string }) => {
  const pathname = usePathname();
  const isActive = pathname === href;
  
  return (
    <Box as={Link} href={href}>
      <ChakraLink
        as="span"
        px={2}
        py={1}
        rounded={'md'}
        _hover={{
          textDecoration: 'none',
          bg: 'gray.200',
        }}
        color={isActive ? 'blue.500' : undefined}
        fontWeight={isActive ? 'bold' : undefined}
      >
        {children}
      </ChakraLink>
    </Box>
  );
};

export default function Navbar() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { data: session, status } = useSession();
  const router = useRouter();
  const toast = useToast();

  const handleLogout = async () => {
    try {
      await signOut({ redirect: false });
      toast({
        title: '已退出登录',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
      router.push('/login');
    } catch (error) {
      toast({
        title: '退出登录失败',
        description: '请稍后重试',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Box bg="white" px={4} boxShadow="sm">
      <Container maxW="container.xl">
        <Flex h={16} alignItems={'center'} justifyContent={'space-between'}>
          <IconButton
            size={'md'}
            icon={isOpen ? <CloseIcon /> : <HamburgerIcon />}
            aria-label={'Open Menu'}
            display={{ md: 'none' }}
            onClick={isOpen ? onClose : onOpen}
          />
          <HStack spacing={8} alignItems={'center'}>
            <Box as={Link} href="/" fontWeight="bold" fontSize="xl" _hover={{ textDecoration: 'none' }}>
              DevMarketplace
            </Box>
            <HStack as={'nav'} spacing={4} display={{ base: 'none', md: 'flex' }}>
              {Links.map((link) => (
                <NavLink key={link.name} href={link.href}>{link.name}</NavLink>
              ))}
            </HStack>
          </HStack>
          <Flex alignItems={'center'}>
            {status === 'authenticated' ? (
              <Menu>
                <MenuButton
                  as={Button}
                  rounded={'full'}
                  variant={'link'}
                  cursor={'pointer'}
                  minW={0}
                >
                  <HStack spacing={2}>
                    <Avatar
                      size={'sm'}
                      name={session.user?.name || undefined}
                      src={session.user?.image || undefined}
                    />
                    <Text display={{ base: 'none', md: 'flex' }}>
                      {session.user?.name || '用户'}
                    </Text>
                  </HStack>
                </MenuButton>
                <MenuList>
                  <Box as={Link} href="/profile" w="100%">
                    <MenuItem as="span">
                      个人资料
                    </MenuItem>
                  </Box>
                  <Box as={Link} href="/chats" w="100%">
                    <MenuItem as="span">
                      我的消息
                    </MenuItem>
                  </Box>
                  <Box as={Link} href="/projects/my" w="100%">
                    <MenuItem as="span">
                      我的项目
                    </MenuItem>
                  </Box>
                  <Box as={Link} href="/projects/new" w="100%">
                    <MenuItem as="span">
                      发布项目
                    </MenuItem>
                  </Box>
                  <MenuItem
                    onClick={handleLogout}
                    color="red.500"
                  >
                    退出登录
                  </MenuItem>
                </MenuList>
              </Menu>
            ) : (
              <Stack
                flex={{ base: 1, md: 0 }}
                justify={'flex-end'}
                direction={'row'}
                spacing={6}
              >
                  <Box as={Link} href="/login">
                    <Button
                      display={{ base: 'none', md: 'inline-flex' }}
                      fontSize={'sm'}
                      fontWeight={600}
                      color={'white'}
                      bg={'blue.400'}
                      _hover={{
                        bg: 'blue.300',
                      }}
                    >
                      登录
                    </Button>
                  </Box>
                  <Box as={Link} href="/register">
                    <Button
                      display={{ base: 'none', md: 'inline-flex' }}
                      fontSize={'sm'}
                      fontWeight={600}
                      color={'blue.400'}
                      bg={'white'}
                      border={'1px solid'}
                      borderColor={'blue.400'}
                      _hover={{
                        bg: 'blue.50',
                      }}
                    >
                      注册
                    </Button>
                  </Box>
              </Stack>
            )}
          </Flex>
        </Flex>

        {isOpen ? (
          <Box pb={4} display={{ md: 'none' }}>
            <Stack as={'nav'} spacing={4}>
              {Links.map((link) => (
                <NavLink key={link.name} href={link.href}>
                  {link.name}
                </NavLink>
              ))}
              {status !== 'authenticated' ? (
                <>
                  <Box as={Link} href="/login" w="100%">
                    <Button
                      w="full"
                      colorScheme="blue"
                    >
                      登录
                    </Button>
                  </Box>
                  <Box as={Link} href="/register" w="100%">
                    <Button
                      w="full"
                      variant="outline"
                      colorScheme="blue"
                    >
                      注册
                    </Button>
                  </Box>
                </>
              ) : (
                <Button
                  w="full"
                  colorScheme="red"
                  variant="outline"
                  onClick={handleLogout}
                >
                  退出登录
                </Button>
              )}
            </Stack>
          </Box>
        ) : null}
      </Container>
    </Box>
  );
} 