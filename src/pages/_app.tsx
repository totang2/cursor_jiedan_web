import { ChakraProvider, ColorModeScript } from '@chakra-ui/react';
import { SessionProvider } from 'next-auth/react';
import type { AppProps } from 'next/app';
import theme from '@/theme';

export default function App({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  return (
    <SessionProvider session={session}>
      <ChakraProvider theme={theme}>
        <ColorModeScript initialColorMode={theme.config.initialColorMode} />
        <Component {...pageProps} />
      </ChakraProvider>
    </SessionProvider>
  );
} 