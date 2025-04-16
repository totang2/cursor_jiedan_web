import { Box, Container, Text, Link } from '@chakra-ui/react';

export default function Footer() {
    return (
        <Box as="footer" py={4} bg="gray.50">
            <Container maxW="container.xl">
                <Text textAlign="center" color="gray.600" fontSize="sm">
                    Copyright © {new Date().getFullYear()} 杭州翻天印网络科技有限公司. All rights reserved.
                </Text>
                <Text textAlign="center" color="gray.600" fontSize="sm" mt={1}>
                    <Link href="https://beian.miit.gov.cn/" target="_blank" rel="noopener noreferrer">
                    浙ICP备19017937号-1
                    </Link>
                </Text>
            </Container>
        </Box>
    );
} 