/** @type {import('next').NextConfig} */
const nextConfig = {
    webpack: (config) => {
        config.externals.push({
            'utf-8-validate': 'commonjs utf-8-validate',
            'bufferutil': 'commonjs bufferutil',
        });
        return config;
    },
    transpilePackages: [
        '@chakra-ui/react',
        '@chakra-ui/next-js',
        '@chakra-ui/icons',
        'framer-motion'
    ]
};

module.exports = nextConfig; 