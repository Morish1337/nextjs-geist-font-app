import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

// Mock messages by channel for development
const mockMessagesByChannel: { [key: string]: any[] } = {
  'general': [
    {
      id: 1,
      content: "Bienvenue sur FinisseurHub ! 🎉",
      username: "Admin",
      role: "ADMIN",
      created_at: new Date(Date.now() - 3600000).toISOString(),
      channel: "general"
    },
    {
      id: 2,
      content: "Salut tout le monde ! Comment ça va ?",
      username: "Alex92",
      role: "VIP",
      created_at: new Date(Date.now() - 1800000).toISOString(),
      channel: "general"
    },
    {
      id: 3,
      content: "Super bien ! J'adore ce site 😍",
      username: "Marie_Paris",
      role: "FREE",
      created_at: new Date(Date.now() - 900000).toISOString(),
      channel: "general"
    }
  ],
  'finisseur-latina': [
    {
      id: 4,
      content: "Le nouveau contenu Latina est incroyable ! 🔥",
      username: "Latino_Fan",
      role: "VIP",
      created_at: new Date(Date.now() - 2400000).toISOString(),
      channel: "finisseur-latina"
    },
    {
      id: 5,
      content: "Quelqu'un a vu la dernière vidéo ?",
      username: "Finisseur_Pro",
      role: "FREE",
      created_at: new Date(Date.now() - 1200000).toISOString(),
      channel: "finisseur-latina"
    }
  ],
  'finisseur-ass': [
    {
      id: 6,
      content: "Collection Ass mise à jour ! 🍑",
      username: "Admin",
      role: "ADMIN",
      created_at: new Date(Date.now() - 3000000).toISOString(),
      channel: "finisseur-ass"
    },
    {
      id: 7,
      content: "Les nouvelles vidéos sont de qualité HD !",
      username: "Quality_Fan",
      role: "VIP",
      created_at: new Date(Date.now() - 1500000).toISOString(),
      channel: "finisseur-ass"
    }
  ],
  'finisseur-vip': [
    {
      id: 8,
      content: "Contenu VIP exclusif disponible ! 👑",
      username: "Admin",
      role: "ADMIN",
      created_at: new Date(Date.now() - 7200000).toISOString(),
      channel: "finisseur-vip"
    },
    {
      id: 9,
      content: "Les privilèges VIP sont vraiment worth it !",
      username: "VIP_Premium",
      role: "VIP",
      created_at: new Date(Date.now() - 3600000).toISOString(),
      channel: "finisseur-vip"
    },
    {
      id: 10,
      content: "Accès aux vidéos HD non censurées 🎬",
      username: "VIP_User",
      role: "VIP",
      created_at: new Date(Date.now() - 1800000).toISOString(),
      channel: "finisseur-vip"
    }
  ]
};

// Get chat messages for a specific channel
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const channel = searchParams.get('channel') || 'general';

    try {
      // Try to get real data from database
      const [messages] = await pool.execute(`
        SELECT m.*, u.username, u.role 
        FROM messages m
        JOIN users u ON m.user_id = u.id 
        WHERE m.channel = ?
        ORDER BY m.created_at DESC 
        LIMIT ?
      `, [channel, limit]);

      return NextResponse.json({
        messages: (messages as any[]).reverse() || []
      });

    } catch (dbError) {
      console.error('Database error:', dbError);
      
      // Return mock messages for the specific channel
      const channelMessages = mockMessagesByChannel[channel] || mockMessagesByChannel['general'];
      
      return NextResponse.json({
        messages: channelMessages.slice(-limit),
        note: 'Using mock data - database not available'
      });
    }

  } catch (error) {
    console.error('Socket Messages API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Send a message to a specific channel
export async function POST(request: NextRequest) {
  try {
    const { content, userId, channel = 'general' } = await request.json();

    if (!content || !userId) {
      return NextResponse.json({ error: 'Content and userId are required' }, { status: 400 });
    }

    // Content validation
    if (content.length > 500) {
      return NextResponse.json({ error: 'Message trop long (max 500 caractères)' }, { status: 400 });
    }

    // Basic spam protection
    const words = content.toLowerCase().split(' ');
    const spamWords = ['spam', 'bot', 'hack', 'cheat'];
    if (spamWords.some(word => words.includes(word))) {
      return NextResponse.json({ error: 'Message détecté comme spam' }, { status: 400 });
    }

    try {
      // Verify user exists and is active
      const [userResult] = await pool.execute(
        'SELECT username, role, status FROM users WHERE id = ?',
        [userId]
      );

      const users = userResult as any[];
      if (users.length === 0) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      const user = users[0];
      if (user.status !== 'ACTIVE') {
        return NextResponse.json({ error: 'User account is not active' }, { status: 403 });
      }

      // Insert message with channel support
      const [result] = await pool.execute(
        'INSERT INTO messages (user_id, content, channel, created_at) VALUES (?, ?, ?, NOW())',
        [userId, content, channel]
      );

      const messageId = (result as any).insertId;

      // Return the created message
      const newMessage = {
        id: messageId,
        content,
        username: user.username,
        role: user.role,
        created_at: new Date().toISOString(),
        channel
      };

      return NextResponse.json({
        success: true,
        message: newMessage
      });

    } catch (dbError) {
      console.error('Database error:', dbError);
      
      // Return mock response when database is not available
      const mockMessage = {
        id: Date.now(),
        content,
        username: 'TestUser',
        role: 'FREE',
        created_at: new Date().toISOString(),
        channel
      };

      // Add to mock data for persistence during session
      if (!mockMessagesByChannel[channel]) {
        mockMessagesByChannel[channel] = [];
      }
      mockMessagesByChannel[channel].push(mockMessage);

      return NextResponse.json({
        success: true,
        message: mockMessage,
        note: 'Mock response - database not available'
      });
    }

  } catch (error) {
    console.error('Send Message API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Get channel statistics and manage channels
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'stats') {
      try {
        const [channelStats] = await pool.execute(`
          SELECT 
            channel,
            COUNT(*) as message_count,
            COUNT(DISTINCT user_id) as unique_users,
            MAX(created_at) as last_message
          FROM messages 
          GROUP BY channel
          ORDER BY message_count DESC
        `);

        return NextResponse.json({
          channels: channelStats || []
        });

      } catch (dbError) {
        console.error('Database error:', dbError);
        
        // Return mock stats
        const mockStats = [
          { channel: 'finisseur-vip', message_count: 2341, unique_users: 89, last_message: new Date().toISOString() },
          { channel: 'general', message_count: 1247, unique_users: 234, last_message: new Date().toISOString() },
          { channel: 'finisseur-latina', message_count: 892, unique_users: 156, last_message: new Date().toISOString() },
          { channel: 'finisseur-ass', message_count: 634, unique_users: 123, last_message: new Date().toISOString() },
          { channel: 'finisseur-boobs', message_count: 445, unique_users: 98, last_message: new Date().toISOString() },
          { channel: 'finisseur-cumshot', message_count: 567, unique_users: 134, last_message: new Date().toISOString() }
        ];

        return NextResponse.json({
          channels: mockStats,
          note: 'Mock data - database not available'
        });
      }
    }

    if (action === 'online') {
      // Return online users count (mock for now)
      return NextResponse.json({
        online: Math.floor(Math.random() * 500) + 100,
        channels: {
          'general': Math.floor(Math.random() * 50) + 20,
          'finisseur-vip': Math.floor(Math.random() * 30) + 10,
          'finisseur-latina': Math.floor(Math.random() * 40) + 15
        }
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error) {
    console.error('Channel management error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Delete message (admin only)
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const messageId = searchParams.get('messageId');
    const userId = searchParams.get('userId');

    if (!messageId || !userId) {
      return NextResponse.json({ error: 'Message ID and User ID required' }, { status: 400 });
    }

    try {
      // Check if user is admin
      const [userResult] = await pool.execute(
        'SELECT role FROM users WHERE id = ?',
        [userId]
      );

      const user = (userResult as any[])[0];
      if (!user || user.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 403 });
      }

      // Delete message
      const [result] = await pool.execute(
        'DELETE FROM messages WHERE id = ?',
        [messageId]
      );

      return NextResponse.json({
        success: true,
        deleted: (result as any).affectedRows > 0
      });

    } catch (dbError) {
      console.error('Database error:', dbError);
      
      // Mock response for development
      return NextResponse.json({
        success: true,
        deleted: true,
        note: 'Mock response - database not available'
      });
    }

  } catch (error) {
    console.error('Delete message error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
