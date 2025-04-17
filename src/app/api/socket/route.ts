import { NextResponse } from 'next/server';
import io from '@/lib/socket-server';

// Handle OPTIONS preflight requests
export async function OPTIONS() {
    return new NextResponse(null, {
        status: 200,
        headers: {
            'Access-Control-Allow-Origin': 'http://localhost:3000',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            'Access-Control-Allow-Credentials': 'true',
        },
    });
}

export async function GET() {
    try {
        console.log('📡 Checking Socket.IO server status...');

        if (!io) {
            console.error('❌ Socket.IO server not available');
            return NextResponse.json(
                { error: 'Socket.IO server not available' },
                { status: 500 }
            );
        }

        console.log('✅ Socket.IO server is running and ready to accept connections');
        return NextResponse.json({
            status: 'Socket.IO server is running',
            connectedClients: io.engine.clientsCount
        });
    } catch (error) {
        console.error('❌ Socket initialization error:', error);
        return NextResponse.json(
            { error: 'Failed to initialize Socket.IO server' },
            { status: 500 }
        );
    }
} 