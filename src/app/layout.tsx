import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Providers } from '@/components/Providers';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'DevMarketplace - 软件开发人员接单平台',
  description: '连接软件开发人员与项目需求的在线平台',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh">
      <body className={inter.className}>
        <Providers>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            minHeight: '100vh'
          }}>
            <Navbar />
            <main style={{ flex: '1 0 auto' }}>
              {children}
            </main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
