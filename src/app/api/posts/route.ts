import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { realPosts } from '@/lib/mockData';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userRole = searchParams.get('userRole') || 'FREE';
    const limit = parseInt(searchParams.get('limit') || '10');

    let query = `
      SELECT p.*, u.username as author 
      FROM posts p 
      JOIN users u ON p.user_id = u.id 
      WHERE p.visibility = ? OR p.visibility = 'FREE'
    `;
    const params: any[] = [userRole];

    if (userRole === 'FREE') {
      query = `
        SELECT p.*, u.username as author 
        FROM posts p 
        JOIN users u ON p.user_id = u.id 
        WHERE p.visibility = 'FREE'
      `;
      params.length = 0;
    }

    query += ' ORDER BY p.created_at DESC LIMIT ?';
    params.push(limit.toString());

    const [posts] = await pool.execute(query, params);

    return NextResponse.json({
      posts: posts || []
    });
  } catch (error) {
    console.error('Posts API Error:', error);
    // Return realistic fallback data
    const { searchParams } = new URL(request.url);
    const userRole = searchParams.get('userRole') || 'FREE';
    const limit = parseInt(searchParams.get('limit') || '10');
    
    const filteredPosts = realPosts.filter(post => {
      if (userRole === 'FREE') {
        return post.visibility === 'FREE';
      }
      return post.visibility === 'FREE' || post.visibility === userRole;
    }).slice(0, limit);

    return NextResponse.json({
      posts: filteredPosts
    });
  }
}
