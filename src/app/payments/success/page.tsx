import { Box, Container, Heading, Text, Button, VStack } from '@chakra-ui/react';
import Link from 'next/link';

export default function PaymentSuccessPage() {
    return (
        <Container maxW="container.md" py={10}>
            <VStack spacing={6} align="center" textAlign="center">
                <Box
                    w="80px"
                    h="80px"
                    borderRadius="full"
                    bg="green.100"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    mb={4}
                >
                    <Text fontSize="3xl" color="green.500">
                        ✓
                    </Text>
                </Box>

                <Heading size="lg" color="green.500">
                    支付成功
                </Heading>

                <Text color="gray.600">
                    您的付款已经成功处理。我们会尽快处理您的订单。
                </Text>

                <Link href="/orders" passHref>
                    <Button colorScheme="blue" size="lg">
                        查看订单
                    </Button>
                </Link>
            </VStack>
        </Container>
    );
} 