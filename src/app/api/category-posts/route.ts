import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET - Récupérer les posts d'une catégorie
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('categoryId');
    const userRole = searchParams.get('userRole') || 'FREE';

    if (!categoryId) {
      return NextResponse.json({ error: 'Category ID required' }, { status: 400 });
    }

    // Vérifier si la catégorie est VIP et si l'utilisateur a accès
    const [categoryResult] = await pool.execute(
      'SELECT type FROM categories WHERE id = ?',
      [categoryId]
    ) as any[];

    if (categoryResult.length === 0) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    const category = categoryResult[0];
    
    // Si la catégorie est VIP et l'utilisateur n'est pas VIP/ADMIN, refuser l'accès
    if (category.type === 'VIP' && !['VIP', 'ADMIN'].includes(userRole)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Récupérer les posts de la catégorie
    const [posts] = await pool.execute(`
      SELECT 
        cp.*,
        u.username,
        u.role as user_role
      FROM category_posts cp
      JOIN users u ON cp.user_id = u.id
      WHERE cp.category_id = ?
      ORDER BY cp.created_at DESC
      LIMIT 50
    `, [categoryId]) as any[];

    return NextResponse.json({ posts });

  } catch (error) {
    console.error('Category posts API error:', error);
    
    // Fallback avec données mock si DB échoue
    const mockPosts = [
      {
        id: 1,
        title: "Bienvenue dans cette catégorie !",
        content: "Voici le premier post de cette catégorie. Plus de contenu arrive bientôt !",
        media_url: null,
        media_type: null,
        username: "admin",
        user_role: "ADMIN",
        created_at: new Date().toISOString()
      }
    ];

    return NextResponse.json({ posts: mockPosts });
  }
}

// POST - Créer un nouveau post (ADMIN seulement)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { categoryId, title, content, mediaUrl, mediaType } = await request.json();

    if (!categoryId || !title || !content) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Insérer le nouveau post
    const [result] = await pool.execute(`
      INSERT INTO category_posts (category_id, user_id, title, content, media_url, media_type)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [categoryId, session.user.id, title, content, mediaUrl || null, mediaType || null]) as any[];

    // Récupérer le post créé avec les infos utilisateur
    const [newPost] = await pool.execute(`
      SELECT 
        cp.*,
        u.username,
        u.role as user_role
      FROM category_posts cp
      JOIN users u ON cp.user_id = u.id
      WHERE cp.id = ?
    `, [result.insertId]) as any[];

    return NextResponse.json({ 
      success: true, 
      post: newPost[0] 
    });

  } catch (error) {
    console.error('Create category post error:', error);
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 });
  }
}

// DELETE - Supprimer un post (ADMIN seulement)
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const postId = searchParams.get('postId');

    if (!postId) {
      return NextResponse.json({ error: 'Post ID required' }, { status: 400 });
    }

    await pool.execute('DELETE FROM category_posts WHERE id = ?', [postId]);

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Delete category post error:', error);
    return NextResponse.json({ error: 'Failed to delete post' }, { status: 500 });
  }
}
