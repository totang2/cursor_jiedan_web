import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });
  
  // 如果用户已登录，检查用户状态
  if (token) {
    // 获取用户状态
    const userStatusResponse = await fetch(`${process.env.NEXTAUTH_URL}/api/auth/status`, {
      headers: {
        'Cookie': request.headers.get('cookie') || '',
      },
    });
    
    if (userStatusResponse.ok) {
      const { status } = await userStatusResponse.json();
      
      // 如果用户被拉黑或封禁，重定向到被封页面
      if (status === 'BLOCKED' || status === 'BANNED') {
        return NextResponse.redirect(new URL('/blocked', request.url));
      }
    }
  }
  
  return NextResponse.next();
}

// 配置中间件应用的路径
export const config = {
  matcher: [
    '/projects/:path*',
    '/my-projects/:path*',
    '/chats/:path*',
    '/profile/:path*',
    '/api/((?!auth/login|auth/register|auth/status).*)'
  ],
};