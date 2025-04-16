import { Inter } from 'next/font/google';
import { Providers } from '@/components/Providers';
import Navbar from '@/components/Navbar';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata = {
  title: 'DevMarketplace - 连接开发者与项目机会',
  description: '一个连接软件开发者与项目机会的平台',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        <Providers>
          <Navbar />
          <main>{children}</main>
        </Providers>
      </body>
    </html>
  );
}
