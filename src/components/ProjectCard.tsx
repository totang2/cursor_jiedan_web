// 首先在文件顶部导入 formatAmount 函数
import {
  Box,
  Badge,
  Heading,
  Text,
  Stack,
  HStack,
  Tag,
  useColorModeValue,
} from '@chakra-ui/react';
import { useRouter } from 'next/router';
import { formatAmount } from '@/lib/currency'; // 添加这一行

type Project = {
  id: string;
  title: string;
  description: string;
  budget: number;
  currency: string; // 添加这一行
  status: 'OPEN' | 'IN_PROGRESS' | 'COMPLETED';
  skills: { name: string }[];
};

type ProjectCardProps = {
  project: Project;
};

const statusColors = {
  OPEN: 'green',
  IN_PROGRESS: 'blue',
  COMPLETED: 'gray',
};

const statusLabels = {
  OPEN: '开放中',
  IN_PROGRESS: '进行中',
  COMPLETED: '已完成',
};

export function ProjectCard({ project }: ProjectCardProps) {
  const router = useRouter();
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const handleClick = () => {
    router.push(`/projects/${project.id}`);
  };

  return (
    <Box
      p={6}
      bg={cardBg}
      borderRadius="lg"
      borderWidth="1px"
      borderColor={borderColor}
      cursor="pointer"
      onClick={handleClick}
      transition="all 0.2s"
      _hover={{
        transform: 'translateY(-4px)',
        shadow: 'lg',
      }}
    >
      <Stack spacing={4}>
        <HStack justify="space-between" align="start">
          <Heading size="md" noOfLines={2}>
            {project.title}
          </Heading>
          <Badge colorScheme={statusColors[project.status]}>
            {statusLabels[project.status]}
          </Badge>
        </HStack>

        <Text color="gray.600" noOfLines={3}>
          {project.description}
        </Text>

        // 然后在组件中修改预算显示部分
        <Box>
          <Text fontWeight="bold" mb={2}>
            预算: {formatAmount(project.budget, project.currency || 'CNY')}
          </Text>
          <HStack spacing={2} flexWrap="wrap">
            {project.skills.map((skill) => (
              <Tag key={skill.name} size="sm" colorScheme="blue">
                {skill.name}
              </Tag>
            ))}
          </HStack>
        </Box>
      </Stack>
    </Box>
  );
}