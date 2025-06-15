'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
    Box,
    Button,
    Container,
    FormControl,
    FormLabel,
    Input,
    Textarea,
    VStack,
    useToast,
    Heading,
    FormErrorMessage,
} from '@chakra-ui/react';
import { useRouter } from 'next/navigation';
import { CurrencyInput } from '@/components/CurrencyInput';

const projectSchema = z.object({
    title: z.string().min(1, 'Title is required'),
    description: z.string().min(1, 'Description is required'),
    budget: z.number().min(0, 'Budget must be positive'),
    currency: z.string(),
    deadline: z.string().optional(),
    skills: z.array(z.string()).min(1, 'At least one skill is required'),
});

type ProjectFormData = z.infer<typeof projectSchema>;

export default function CreateProject() {
    const toast = useToast();
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
        watch,
    } = useForm<ProjectFormData>({
        resolver: zodResolver(projectSchema),
        defaultValues: {
            currency: 'USD',
            budget: 0,
        },
    });

    const onSubmit = async (data: ProjectFormData) => {
        try {
            setIsSubmitting(true);
            const response = await fetch('/api/projects', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                throw new Error('Failed to create project');
            }

            toast({
                title: 'Success',
                description: 'Project created successfully',
                status: 'success',
                duration: 5000,
                isClosable: true,
            });

            router.push('/projects');
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to create project',
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Container maxW="container.md" py={8}>
            <VStack spacing={8} align="stretch">
                <Heading>Create New Project</Heading>

                <form onSubmit={handleSubmit(onSubmit)}>
                    <VStack spacing={6}>
                        <FormControl isInvalid={!!errors.title}>
                            <FormLabel>Title</FormLabel>
                            <Input
                                {...register('title')}
                                placeholder="Enter project title"
                            />
                            <FormErrorMessage>
                                {errors.title && errors.title.message}
                            </FormErrorMessage>
                        </FormControl>

                        <FormControl isInvalid={!!errors.description}>
                            <FormLabel>Description</FormLabel>
                            <Textarea
                                {...register('description')}
                                placeholder="Enter project description"
                            />
                            <FormErrorMessage>
                                {errors.description && errors.description.message}
                            </FormErrorMessage>
                        </FormControl>

                        <FormControl isInvalid={!!errors.budget}>
                            <FormLabel>Budget</FormLabel>
                            <CurrencyInput
                                value={watch('budget')}
                                currency={watch('currency')}
                                onValueChange={(value) => setValue('budget', value)}
                                onCurrencyChange={(currency) => setValue('currency', currency)}
                            />
                            <FormErrorMessage>
                                {errors.budget && errors.budget.message}
                            </FormErrorMessage>
                        </FormControl>

                        <FormControl isInvalid={!!errors.deadline}>
                            <FormLabel>Deadline</FormLabel>
                            <Input
                                type="date"
                                {...register('deadline')}
                            />
                            <FormErrorMessage>
                                {errors.deadline && errors.deadline.message}
                            </FormErrorMessage>
                        </FormControl>

                        <FormControl isInvalid={!!errors.skills}>
                            <FormLabel>Skills</FormLabel>
                            <Input
                                {...register('skills')}
                                placeholder="Enter required skills (comma-separated)"
                            />
                            <FormErrorMessage>
                                {errors.skills && errors.skills.message}
                            </FormErrorMessage>
                        </FormControl>

                        <Button
                            type="submit"
                            colorScheme="blue"
                            isLoading={isSubmitting}
                            loadingText="Creating..."
                            width="full"
                        >
                            Create Project
                        </Button>
                    </VStack>
                </form>
            </VStack>
        </Container>
    );
} 