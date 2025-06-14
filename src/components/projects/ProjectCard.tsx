import { useRouter } from 'next/navigation';
import {
  Box,
  VStack,
  Heading,
  Text,
  Flex,
  Badge,
  HStack,
  useColorModeValue,
} from '@chakra-ui/react';
import { formatAmount } from '@/lib/currency';

interface ProjectCardProps {
  id: string;
  title: string;
  description: string;
  budget: number;
  currency: string;
  status: string;
  skills: { name: string }[];
}

export default function ProjectCard({
  id,
  title,
  description,
  budget,
  currency,
  status,
  skills,
}: ProjectCardProps) {
  const router = useRouter();
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  // 获取状态显示文本
  const getStatusText = (status: string) => {
    switch (status) {
      case 'OPEN':
        return '招募中';
      case 'IN_PROGRESS':
        return '进行中';
      case 'COMPLETED':
        return '已完成';
      default:
        return status;
    }
  };

  // 获取状态对应的颜色
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN':
        return 'green';
      case 'IN_PROGRESS':
        return 'orange';
      case 'COMPLETED':
        return 'gray';
      default:
        return 'gray';
    }
  };

  return (
    <Box
      bg={bgColor}
      p={6}
      borderRadius="lg"
      border="1px"
      borderColor={borderColor}
      onClick={() => router.push(`/projects/${id}`)}
      cursor="pointer"
      _hover={{ transform: 'translateY(-4px)', transition: 'all 0.2s' }}
    >
      <VStack align="stretch" spacing={4}>
        <Heading size="md">{title}</Heading>
        <Text noOfLines={3}>{description}</Text>
        <Flex wrap="wrap" gap={2}>
          {skills.map((skill) => (
            <Badge key={skill.name} colorScheme="blue">
              {skill.name}
            </Badge>
          ))}
        </Flex>
        <HStack justify="space-between">
          <Text color="green.500" fontWeight="bold">
            {formatAmount(budget, currency)}
          </Text>
          <Badge colorScheme={getStatusColor(status)}>
            {getStatusText(status)}
          </Badge>
        </HStack>
      </VStack>
    </Box>
  );
} 