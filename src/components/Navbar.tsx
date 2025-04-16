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
} from '@chakra-ui/react';
import { HamburgerIcon, CloseIcon } from '@chakra-ui/icons';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const Links = [
  { name: '首页', href: '/' },
  { name: '项目列表', href: '/projects' },
];

const NavLink = ({ children, href }: { children: React.ReactNode; href: string }) => {
  const pathname = usePathname();
  const isActive = pathname === href;
  
  return (
    <Link href={href} passHref legacyBehavior>
      <ChakraLink
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
    </Link>
  );
};

export default function Navbar() {
  const { isOpen, onOpen, onClose } = useDisclosure();

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
            <Box fontWeight="bold" fontSize="xl">DevMarketplace</Box>
            <HStack as={'nav'} spacing={4} display={{ base: 'none', md: 'flex' }}>
              {Links.map((link) => (
                <NavLink key={link.name} href={link.href}>{link.name}</NavLink>
              ))}
            </HStack>
          </HStack>
          <Flex alignItems={'center'}>
            <Stack
              flex={{ base: 1, md: 0 }}
              justify={'flex-end'}
              direction={'row'}
              spacing={6}
            >
              <Button
                as={'a'}
                display={{ base: 'none', md: 'inline-flex' }}
                fontSize={'sm'}
                fontWeight={600}
                color={'white'}
                bg={'blue.400'}
                href={'/login'}
                _hover={{
                  bg: 'blue.300',
                }}
              >
                登录
              </Button>
              <Button
                as={'a'}
                display={{ base: 'none', md: 'inline-flex' }}
                fontSize={'sm'}
                fontWeight={600}
                color={'blue.400'}
                bg={'white'}
                href={'/register'}
                border={'1px solid'}
                borderColor={'blue.400'}
                _hover={{
                  bg: 'blue.50',
                }}
              >
                注册
              </Button>
            </Stack>
          </Flex>
        </Flex>

        {isOpen ? (
          <Box pb={4} display={{ md: 'none' }}>
            <Stack as={'nav'} spacing={4}>
              {Links.map((link) => (
                <NavLink key={link.name} href={link.href}>{link.name}</NavLink>
              ))}
            </Stack>
          </Box>
        ) : null}
      </Container>
    </Box>
  );
} 