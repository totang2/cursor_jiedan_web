'use client';

import { useParams } from 'next/navigation';
import {
  Box,
  Container,
  Heading,
  Text,
  Badge,
  VStack,
  HStack,
  Button,
  Divider,
  useColorModeValue,
} from '@chakra-ui/react';
import { sampleProjects } from '@/data/sampleProjects';

const statusColorScheme = {
  open: 'green',
  inProgress: 'blue',
  completed: 'purple',
  cancelled: 'red',
} as const;

const statusLabels = {
  open: 'Open',
  inProgress: 'In Progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
} as const;

export default function ProjectDetailPage() {
  const params = useParams();
  const projectId = params.id as string;
  const project = sampleProjects.find((p) => p.id === projectId);

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  if (!project) {
    return (
      <Container maxW="container.lg" py={8}>
        <Text>Project not found</Text>
      </Container>
    );
  }

  return (
    <Box bg={bgColor} minH="100vh" py={8}>
      <Container maxW="container.lg">
        <VStack spacing={6} align="stretch">
          <HStack justify="space-between" align="center">
            <Heading size="xl">{project.title}</Heading>
            <Badge colorScheme={statusColorScheme[project.status]} fontSize="md" px={3} py={1}>
              {statusLabels[project.status]}
            </Badge>
          </HStack>

          <HStack spacing={4}>
            <Badge colorScheme="blue" fontSize="md" px={3} py={1}>
              Budget: ${project.budget}
            </Badge>
            <Badge colorScheme="purple" fontSize="md" px={3} py={1}>
              Posted: {new Date(project.createdAt).toLocaleDateString()}
            </Badge>
          </HStack>

          <Divider />

          <Box>
            <Heading size="md" mb={4}>Description</Heading>
            <Text>{project.description}</Text>
          </Box>

          <Box>
            <Heading size="md" mb={4}>Required Skills</Heading>
            <HStack spacing={2} wrap="wrap">
              {project.requiredSkills.map((skill) => (
                <Badge key={skill} colorScheme="gray" fontSize="md" px={3} py={1}>
                  {skill}
                </Badge>
              ))}
            </HStack>
          </Box>

          <Button
            colorScheme="brand"
            size="lg"
            width="full"
            mt={4}
          >
            Apply for Project
          </Button>
        </VStack>
      </Container>
    </Box>
  );
} 