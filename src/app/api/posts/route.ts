import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getMockPosts } from '@/lib/mockData';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('categoryId');
    const userRole = searchParams.get('userRole') || 'FREE';
    const limit = parseInt(searchParams.get('limit') || '10');

    let query = `
      SELECT p.*, c.name as category_name, c.type as category_type, u.username
      FROM posts p
      JOIN categories c ON p.category_id = c.id
      JOIN users u ON p.user_id = u.id
      WHERE 1=1
    `;
    
    const params: any[] = [];

    // Filter by category if specified
    if (categoryId) {
      query += ' AND p.category_id = ?';
      params.push(categoryId);
    }

    // Filter by user role permissions
    if (userRole !== 'VIP' && userRole !== 'ADMIN') {
      query += ' AND p.visibility = "FREE" AND c.type = "FREE"';
    }

    query += ' ORDER BY p.created_at DESC LIMIT ?';
    params.push(limit);

    const [posts] = await pool.execute(query, params);

    return NextResponse.json({
      posts,
      message: (posts as any[]).length === 0 ? 'Aucun post pour le moment' : null
    });
  } catch (error) {
    console.error('Posts API Error:', error);
    
    // Return mock data when database is not available
    const { searchParams } = new URL(request.url);
    const userRole = searchParams.get('userRole') || 'FREE';
    const limit = parseInt(searchParams.get('limit') || '10');
    
    const visibility = userRole === 'VIP' || userRole === 'ADMIN' ? 'VIP' : 'FREE';
    const mockPosts = getMockPosts(visibility, limit);
    
    return NextResponse.json({
      posts: mockPosts,
      message: mockPosts.length === 0 ? 'Aucun post pour le moment' : null
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { categoryId, title, content, visibility, userId } = await request.json();

    // Verify user is ADMIN (only ADMIN can post)
    const [userResult] = await pool.execute(
      'SELECT role FROM users WHERE id = ? AND status = "ACTIVE"',
      [userId]
    );

    const user = (userResult as any[])[0];
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Seuls les administrateurs peuvent publier du contenu' },
        { status: 403 }
      );
    }

    // Insert new post
    const [result] = await pool.execute(
      'INSERT INTO posts (category_id, user_id, title, content, visibility) VALUES (?, ?, ?, ?, ?)',
      [categoryId, userId, title, content, visibility]
    );

    return NextResponse.json({
      message: 'Post créé avec succès',
      postId: (result as any).insertId
    });
  } catch (error) {
    console.error('Create Post API Error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création du post' },
      { status: 500 }
    );
  }
}
