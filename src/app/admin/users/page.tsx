'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Container,
  Heading,
  Text,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Button,
  HStack,
  useToast,
  Badge,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  useDisclosure,
  Select,
  Input,
  Flex,
} from '@chakra-ui/react';
import { useRef } from 'react';

type User = {
  id: string;
  email: string;
  name: string | null;
  role: string;
  status: string;
  createdAt: string;
};

export default function AdminUsers() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const toast = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [actionType, setActionType] = useState<'delete' | 'block' | 'unblock'>('delete');
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = useRef<HTMLButtonElement>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    // 检查用户是否为管理员
    if (status === 'authenticated') {
      if (session?.user?.role !== 'ADMIN') {
        toast({
          title: '访问被拒绝',
          description: '您没有管理员权限',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        router.push('/');
      } else {
        fetchUsers();
      }
    } else if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, session, router, toast]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/users');
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error('获取用户列表失败', error);
      toast({
        title: '获取用户列表失败',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAction = (user: User, action: 'delete' | 'block' | 'unblock') => {
    setSelectedUser(user);
    setActionType(action);
    onOpen();
  };

  const confirmAction = async () => {
    if (!selectedUser) return;

    try {
      let endpoint = '';
      let method = 'PUT';
      let successMessage = '';

      switch (actionType) {
        case 'delete':
          endpoint = `/api/admin/users/${selectedUser.id}`;
          method = 'DELETE';
          successMessage = '用户已成功删除';
          break;
        case 'block':
          endpoint = `/api/admin/users/${selectedUser.id}/status`;
          successMessage = '用户已成功拉黑';
          break;
        case 'unblock':
          endpoint = `/api/admin/users/${selectedUser.id}/status`;
          successMessage = '用户已成功解除拉黑';
          break;
      }

      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: actionType !== 'delete' ? JSON.stringify({
          status: actionType === 'block' ? 'BLOCKED' : 'ACTIVE'
        }) : undefined,
      });

      if (response.ok) {
        toast({
          title: successMessage,
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        fetchUsers(); // 刷新用户列表
      } else {
        const error = await response.json();
        throw new Error(error.message || '操作失败');
      }
    } catch (error) {
      console.error('操作失败', error);
      toast({
        title: '操作失败',
        description: error instanceof Error ? error.message : '未知错误',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      onClose();
    }
  };

  const getActionText = () => {
    switch (actionType) {
      case 'delete': return '删除';
      case 'block': return '拉黑';
      case 'unblock': return '解除拉黑';
      default: return '操作';
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.name && user.name.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesRole = roleFilter ? user.role === roleFilter : true;
    const matchesStatus = statusFilter ? user.status === statusFilter : true;
    return matchesSearch && matchesRole && matchesStatus;
  });

  return (
    <Container maxW="container.xl" py={8}>
      <Heading mb={6}>用户管理</Heading>
      
      <Flex mb={6} gap={4} flexWrap="wrap">
        <Input
          placeholder="搜索用户邮箱或名称"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          maxW="300px"
        />
        <Select
          placeholder="按角色筛选"
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          maxW="200px"
        >
          <option value="ADMIN">管理员</option>
          <option value="DEVELOPER">开发者</option>
          <option value="CLIENT">客户</option>
        </Select>
        <Select
          placeholder="按状态筛选"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          maxW="200px"
        >
          <option value="ACTIVE">正常</option>
          <option value="BLOCKED">已拉黑</option>
          <option value="BANNED">已封禁</option>
        </Select>
      </Flex>

      {loading ? (
        <Text>加载中...</Text>
      ) : (
        <Box overflowX="auto">
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>ID</Th>
                <Th>邮箱</Th>
                <Th>名称</Th>
                <Th>角色</Th>
                <Th>状态</Th>
                <Th>注册时间</Th>
                <Th>操作</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filteredUsers.map((user) => (
                <Tr key={user.id}>
                  <Td fontSize="sm">{user.id}</Td>
                  <Td>{user.email}</Td>
                  <Td>{user.name || '-'}</Td>
                  <Td>
                    <Badge colorScheme={user.role === 'ADMIN' ? 'red' : user.role === 'DEVELOPER' ? 'green' : 'blue'}>
                      {user.role}
                    </Badge>
                  </Td>
                  <Td>
                    <Badge colorScheme={user.status === 'ACTIVE' ? 'green' : user.status === 'BLOCKED' ? 'orange' : 'red'}>
                      {user.status === 'ACTIVE' ? '正常' : user.status === 'BLOCKED' ? '已拉黑' : '已封禁'}
                    </Badge>
                  </Td>
                  <Td>{new Date(user.createdAt).toLocaleString()}</Td>
                  <Td>
                    <HStack spacing={2}>
                      <Button
                        size="sm"
                        colorScheme="red"
                        onClick={() => handleAction(user, 'delete')}
                        isDisabled={session?.user?.id === user.id} // 不能删除自己
                      >
                        删除
                      </Button>
                      {user.status === 'ACTIVE' ? (
                        <Button
                          size="sm"
                          colorScheme="orange"
                          onClick={() => handleAction(user, 'block')}
                          isDisabled={session?.user?.id === user.id} // 不能拉黑自己
                        >
                          拉黑
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          colorScheme="green"
                          onClick={() => handleAction(user, 'unblock')}
                        >
                          解除拉黑
                        </Button>
                      )}
                    </HStack>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      )}

      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              确认{getActionText()}用户
            </AlertDialogHeader>

            <AlertDialogBody>
              您确定要{getActionText()}用户 {selectedUser?.email} 吗？此操作不可逆。
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose}>
                取消
              </Button>
              <Button colorScheme="red" onClick={confirmAction} ml={3}>
                确认
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Container>
  );
}