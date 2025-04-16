'use client';

import { Box, Container, Heading, Text, SimpleGrid, VStack, Badge, HStack, Link as ChakraLink } from '@chakra-ui/react';
import { sampleProjects } from '@/data/sampleProjects';
import Link from 'next/link';

const statusColorScheme = {
  OPEN: 'green',
  IN_PROGRESS: 'blue',
  COMPLETED: 'gray',
} as const;

const statusLabels = {
  OPEN: '开放中',
  IN_PROGRESS: '进行中',
  COMPLETED: '已完成',
} as const;

export default function ProjectsPage() {
  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        <Box>
          <Heading size="xl" mb={4}>项目列表</Heading>
          <Text color="gray.600" fontSize="lg">
            浏览所有可用的项目，找到适合你的机会
          </Text>
        </Box>

        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
          {sampleProjects.map((project) => (
            <Link key={project.id} href={`/projects/${project.id}`} passHref legacyBehavior>
              <ChakraLink
                _hover={{ textDecoration: 'none' }}
              >
                <Box
                  p={6}
                  borderWidth="1px"
                  borderRadius="lg"
                  _hover={{ shadow: 'md', transform: 'translateY(-2px)', transition: 'all 0.2s' }}
                  cursor="pointer"
                >
                  <VStack align="stretch" spacing={4}>
                    <HStack justify="space-between">
                      <Heading size="md">{project.title}</Heading>
                      <Badge colorScheme={statusColorScheme[project.status]}>
                        {statusLabels[project.status]}
                      </Badge>
                    </HStack>
                    <Text noOfLines={3} color="gray.600">
                      {project.description}
                    </Text>
                    <Text fontWeight="bold" color="blue.600">
                      预算: ¥{project.budget.toLocaleString()}
                    </Text>
                    <HStack spacing={2} flexWrap="wrap">
                      {project.skills.slice(0, 3).map((skill) => (
                        <Badge key={skill.name} colorScheme="purple">
                          {skill.name}
                        </Badge>
                      ))}
                      {project.skills.length > 3 && (
                        <Badge colorScheme="gray">+{project.skills.length - 3}</Badge>
                      )}
                    </HStack>
                  </VStack>
                </Box>
              </ChakraLink>
            </Link>
          ))}
        </SimpleGrid>
      </VStack>
    </Container>
  );
} 