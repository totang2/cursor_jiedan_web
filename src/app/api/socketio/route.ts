import { NextResponse } from 'next/server';
import { initSocket } from '@/lib/socket';
import { headers } from 'next/headers';

export async function GET(req: Request) {
    try {
        console.log('Initializing Socket.IO connection...');
        const io = initSocket();

        if (!io) {
            throw new Error('Failed to initialize Socket.IO server');
        }

        console.log('Socket.IO server initialized successfully');
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Socket.IO initialization error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to initialize Socket.IO' },
            { status: 500 }
        );
    }
} 