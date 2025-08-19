import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { mockCategories } from '@/lib/mockData';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userRole = searchParams.get('userRole') || 'FREE';

    let query = 'SELECT * FROM categories WHERE 1=1';
    const params: any[] = [];

    // Filter categories based on user role
    if (userRole !== 'VIP' && userRole !== 'ADMIN') {
      query += ' AND type = "FREE"';
    }

    query += ' ORDER BY id ASC';

    const [categories] = await pool.execute(query, params);

    return NextResponse.json({
      categories
    });
  } catch (error) {
    console.error('Categories API Error:', error);
    
    // Return mock categories when database is not available
    const { searchParams } = new URL(request.url);
    const userRole = searchParams.get('userRole') || 'FREE';
    
    let filteredCategories = mockCategories;
    
    // Filter categories based on user role
    if (userRole !== 'VIP' && userRole !== 'ADMIN') {
      filteredCategories = mockCategories.filter(cat => cat.type === 'FREE');
    }
    
    return NextResponse.json({
      categories: filteredCategories
    });
  }
}
