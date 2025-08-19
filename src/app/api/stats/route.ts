import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { mockStats } from '@/lib/mockData';

export async function GET() {
  try {
    // Try to get real data from database
    const [membersResult] = await pool.execute(
      'SELECT COUNT(*) as count FROM users WHERE status = "ACTIVE"'
    );
    const members = (membersResult as any)[0].count;

    const [postsResult] = await pool.execute(
      'SELECT COUNT(*) as count FROM posts'
    );
    const posts = (postsResult as any)[0].count;

    const [vipResult] = await pool.execute(
      'SELECT COUNT(*) as count FROM users WHERE role = "VIP" AND status = "ACTIVE"'
    );
    const vip = (vipResult as any)[0].count;

    const stats = {
      members,
      posts,
      vip
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Stats API Error:', error);
    // Return mock data when database is not available
    return NextResponse.json(mockStats);
  }
}
