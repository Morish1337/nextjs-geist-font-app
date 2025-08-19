import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { postId, reactionId, action, userId } = await request.json();

    if (!postId || !reactionId || !action) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    try {
      if (action === 'add') {
        // Remove any existing reaction from this user for this post
        await pool.execute(
          'DELETE FROM post_reactions WHERE post_id = ? AND user_id = ?',
          [postId, userId]
        );
        
        // Add new reaction
        await pool.execute(
          'INSERT INTO post_reactions (post_id, user_id, reaction_type, created_at) VALUES (?, ?, ?, NOW())',
          [postId, userId, reactionId]
        );
      } else if (action === 'remove') {
        await pool.execute(
          'DELETE FROM post_reactions WHERE post_id = ? AND user_id = ? AND reaction_type = ?',
          [postId, userId, reactionId]
        );
      }

      // Get updated reaction counts
      const [reactions] = await pool.execute(`
        SELECT reaction_type, COUNT(*) as count 
        FROM post_reactions 
        WHERE post_id = ? 
        GROUP BY reaction_type
      `, [postId]);

      return NextResponse.json({ 
        success: true, 
        reactions: reactions || []
      });

    } catch (dbError) {
      console.error('Database error:', dbError);
      
      // Return mock response for development
      const mockReactions = [
        { reaction_type: 'love', count: Math.floor(Math.random() * 50) + 5 },
        { reaction_type: 'like', count: Math.floor(Math.random() * 30) + 3 },
        { reaction_type: 'fire', count: Math.floor(Math.random() * 20) + 2 },
        { reaction_type: 'smile', count: Math.floor(Math.random() * 15) + 1 },
        { reaction_type: 'star', count: Math.floor(Math.random() * 10) + 1 }
      ];

      return NextResponse.json({ 
        success: true, 
        reactions: mockReactions,
        note: 'Using mock data - database not available'
      });
    }

  } catch (error) {
    console.error('Reactions API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const postId = searchParams.get('postId');

    if (!postId) {
      return NextResponse.json({ error: 'Post ID required' }, { status: 400 });
    }

    try {
      const [reactions] = await pool.execute(`
        SELECT reaction_type, COUNT(*) as count 
        FROM post_reactions 
        WHERE post_id = ? 
        GROUP BY reaction_type
      `, [postId]);

      return NextResponse.json({ reactions: reactions || [] });

    } catch (dbError) {
      console.error('Database error:', dbError);
      
      // Return mock data
      const mockReactions = [
        { reaction_type: 'love', count: Math.floor(Math.random() * 50) + 5 },
        { reaction_type: 'like', count: Math.floor(Math.random() * 30) + 3 },
        { reaction_type: 'fire', count: Math.floor(Math.random() * 20) + 2 },
        { reaction_type: 'smile', count: Math.floor(Math.random() * 15) + 1 },
        { reaction_type: 'star', count: Math.floor(Math.random() * 10) + 1 }
      ];

      return NextResponse.json({ 
        reactions: mockReactions,
        note: 'Using mock data - database not available'
      });
    }

  } catch (error) {
    console.error('Get Reactions API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
