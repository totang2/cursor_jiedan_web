import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// 模拟用户数据库
const users = [
    {
        id: '1',
        email: 'test@example.com',
        password: '123456', // 实际应用中应该使用加密密码
        username: '测试用户',
    },
];

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email, password } = body;

        // 验证请求数据
        if (!email || !password) {
            return NextResponse.json(
                { error: '邮箱和密码不能为空' },
                { status: 400 }
            );
        }

        // 查找用户
        const user = users.find(u => u.email === email);

        // 验证用户和密码
        if (!user || user.password !== password) {
            return NextResponse.json(
                { error: '邮箱或密码错误' },
                { status: 401 }
            );
        }

        // 创建会话令牌（实际应用中应该使用JWT或其他安全的令牌）
        const token = 'mock_token_' + Date.now();

        // 返回成功响应
        return NextResponse.json({
            user: {
                id: user.id,
                email: user.email,
                username: user.username,
            },
            token,
        });
    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json(
            { error: '服务器错误' },
            { status: 500 }
        );
    }
} 