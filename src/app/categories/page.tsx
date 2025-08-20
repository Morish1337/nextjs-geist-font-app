'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import BottomNav from '@/components/ui/BottomNav';
import LoginModal from '@/components/ui/LoginModal';
import VIPModal from '@/components/ui/VIPModal';

interface Category {
  id: string;
  name: string;
  description: string;
  type: 'FREE' | 'VIP';
  postCount: number;
  icon: string;
}

interface Post {
  id: string;
  title: string;
  content: string;
  author: string;
  created_at: string;
  views: number;
  likes: number;
}

export default function CategoriesPage() {
  const { data: session } = useSession();
  const [categories] = useState<Category[]>([
    {
      id: '1',
      name: 'Finisseur VIP',
      description: 'Contenu exclusif VIP',
      type: 'VIP',
      postCount: 156,
      icon: '👑'
    },
    {
      id: '2',
      name: 'Finisseur Latina',
      description: 'Contenu Latina',
      type: 'FREE',
      postCount: 234,
      icon: '🌶️'
    },
    {
      id: '3',
      name: 'Finisseur Ass',
      description: 'Contenu Ass',
      type: 'FREE',
      postCount: 189,
      icon: '🍑'
    },
    {
      id: '4',
      name: 'Finisseur Boobs',
      description: 'Contenu Boobs',
      type: 'FREE',
      postCount: 167,
      icon: '💎'
    },
    {
      id: '5',
      name: 'Finisseur 92i',
      description: 'Région parisienne',
      type: 'FREE',
      postCount: 98,
      icon: '🏙️'
    },
    {
      id: '6',
      name: 'Finisseur Cumshot',
      description: 'Contenu Cumshot',
      type: 'FREE',
      postCount: 145,
      icon: '💦'
    },
    {
      id: '7',
      name: 'Finisseur Lesbienne',
      description: 'Contenu Lesbienne',
      type: 'FREE',
      postCount: 123,
      icon: '👭'
    },
    {
      id: '8',
      name: 'Finisseur Fellation',
      description: 'Contenu Fellation',
      type: 'FREE',
      postCount: 178,
      icon: '👄'
    },
    {
      id: '9',
      name: 'Finisseur Lieu Public',
      description: 'Contenu Lieu Public',
      type: 'FREE',
      postCount: 87,
      icon: '🌍'
    }
  ]);

  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showVIPModal, setShowVIPModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleCategoryClick = async (category: Category) => {
    // Vérifier les permissions
    if (category.type === 'VIP' && (!session || (session.user.role !== 'VIP' && session.user.role !== 'ADMIN'))) {
      setShowVIPModal(true);
      return;
    }

    setSelectedCategory(category);
    setLoading(true);

    try {
      const response = await fetch(`/api/category-posts?categoryId=${category.id}&userRole=${session?.user?.role || 'FREE'}`);
      const data = await response.json();
      setPosts(data.posts || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePostClick = () => {
    if (!session) {
      setShowLoginModal(true);
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Il y a quelques minutes';
    if (diffInHours < 24) return `Il y a ${diffInHours}h`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `Il y a ${diffInDays}j`;
  };

  const canAccessCategory = (category: Category) => {
    if (category.type === 'FREE') return true;
    if (!session) return false;
    return session.user.role === 'VIP' || session.user.role === 'ADMIN';
  };

  return (
    <>
      <div className="min-h-screen">
        {/* Header Premium */}
        <header className="premium-header">
          <div className="premium-container">
            <div className="flex items-center justify-between">
              <a href="/" className="premium-logo">
                <span className="finisseur">Finisseur</span>
                <span className="hub">Hub</span>
              </a>
              
              {!session && (
                <button 
                  onClick={() => setShowLoginModal(true)}
                  className="text-white hover:text-purple-400 transition-colors font-medium"
                >
                  Se connecter
                </button>
              )}
            </div>
          </div>
        </header>

        <main className="premium-container">
          {!selectedCategory ? (
            // Categories Grid
            <section className="fade-in-up">
              <h1 className="premium-section-title mb-8">
                <span>📂</span>
                Explorez nos différentes catégories de contenu
              </h1>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categories.map((category) => {
                  const hasAccess = canAccessCategory(category);
                  
                  return (
                    <div
                      key={category.id}
                      onClick={() => handleCategoryClick(category)}
                      className={`premium-card cursor-pointer relative ${!hasAccess ? 'opacity-75' : ''}`}
                    >
                      <div className="premium-card-content">
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-4xl">{category.icon}</span>
                          <div className="text-right">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                              category.type === 'VIP' 
                                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' 
                                : 'bg-green-500/20 text-green-400 border border-green-500/30'
                            }`}>
                              {category.type}
                            </span>
                          </div>
                        </div>
                        
                        <h3 className="premium-card-title">{category.name}</h3>
                        <p className="premium-card-text">{category.description}</p>
                        
                        <div className="premium-card-meta">
                          <span className="text-purple-400 font-semibold">
                            Cliquez pour voir les posts
                          </span>
                          <span className="flex items-center gap-1">
                            <span>📄</span>
                            {formatNumber(category.postCount)}
                          </span>
                        </div>

                        {!hasAccess && (
                          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm rounded-lg flex items-center justify-center">
                            <div className="text-center">
                              <div className="text-4xl mb-2">🔒</div>
                              <div className="text-white font-bold">VIP Requis</div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          ) : (
            // Category Posts View
            <section className="fade-in-up">
              <div className="flex items-center gap-4 mb-8">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className="premium-btn-secondary !w-auto px-6 py-3"
                >
                  ← Retour
                </button>
                <div>
                  <h1 className="premium-section-title !mb-0">
                    <span>{selectedCategory.icon}</span>
                    {selectedCategory.name}
                  </h1>
                  <p className="text-gray-400 mt-2">{selectedCategory.description}</p>
                </div>
              </div>

              {loading ? (
                <div className="text-center py-20">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
                  <p className="text-gray-400 mt-4">Chargement des posts...</p>
                </div>
              ) : posts.length > 0 ? (
                <div className="premium-cards">
                  {posts.map((post) => (
                    <article 
                      key={post.id} 
                      className="premium-card"
                      onClick={handlePostClick}
                    >
                      <div className="premium-card-content">
                        <h3 className="premium-card-title">{post.title}</h3>
                        <p className="premium-card-text">{post.content}</p>
                        <div className="premium-card-meta">
                          <a href="#" className="premium-card-author">@{post.author}</a>
                          <div className="premium-card-stats">
                            <span>👁️ {formatNumber(post.views)}</span>
                            <span>❤️ {post.likes}</span>
                            <span>{formatTimeAgo(post.created_at)}</span>
                          </div>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="premium-vip-lock">
                  <div className="premium-vip-lock-icon">📭</div>
                  <h3 className="premium-vip-lock-title">Aucun post pour le moment</h3>
                  <p className="premium-vip-lock-text">
                    Cette catégorie ne contient pas encore de contenu. Revenez plus tard !
                  </p>
                </div>
              )}
            </section>
          )}
        </main>

        <BottomNav />
      </div>

      {showLoginModal && (
        <LoginModal onClose={() => setShowLoginModal(false)} />
      )}

      {showVIPModal && (
        <VIPModal onClose={() => setShowVIPModal(false)} />
      )}
    </>
  );
}
