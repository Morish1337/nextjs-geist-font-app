'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import AgeVerificationModal from '@/components/ui/AgeVerificationModal';
import BottomNav from '@/components/ui/BottomNav';
import LoginModal from '@/components/ui/LoginModal';
import VIPModal from '@/components/ui/VIPModal';

interface Stats {
  members: number;
  posts: number;
  vip: number;
}

interface Post {
  id: string;
  title: string;
  content: string;
  author: string;
  created_at: string;
  category: string;
  views: number;
  likes: number;
  visibility: 'FREE' | 'VIP';
}

export default function HomePage() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<Stats>({ members: 0, posts: 0, vip: 0 });
  const [freePosts, setFreePosts] = useState<Post[]>([]);
  const [vipPosts, setVipPosts] = useState<Post[]>([]);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showVIPModal, setShowVIPModal] = useState(false);
  const [viewedPosts, setViewedPosts] = useState(0);

  useEffect(() => {
    fetchStats();
    fetchPosts();
  }, [session]);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/stats');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchPosts = async () => {
    try {
      const userRole = session?.user?.role || 'FREE';
      
      // Fetch FREE posts
      const freeResponse = await fetch(`/api/posts?userRole=FREE&limit=5`);
      const freeData = await freeResponse.json();
      setFreePosts(freeData.posts || []);

      // Fetch VIP posts
      const vipResponse = await fetch(`/api/posts?userRole=VIP&limit=5`);
      const vipData = await vipResponse.json();
      setVipPosts(vipData.posts || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
  };

  const handlePostClick = () => {
    if (!session) {
      const newViewedPosts = viewedPosts + 1;
      setViewedPosts(newViewedPosts);
      
      if (newViewedPosts >= 2) {
        setShowLoginModal(true);
      }
    }
  };

  const handleVIPUpgrade = () => {
    setShowVIPModal(true);
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
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

  return (
    <>
      <AgeVerificationModal />
      
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
          {/* Hero Section Premium */}
          <section className="premium-hero fade-in-up">
            <h1 className="premium-title">
              <span className="finisseur">Finisseur</span>
              <span className="hub">Hub</span>
            </h1>
            <p className="premium-subtitle">
              La communauté premium française #1 pour les connaisseurs
            </p>
            
            {/* Stats Premium */}
            <div className="premium-stats">
              <div className="premium-stat">
                <span className="premium-stat-number">{formatNumber(stats.members)}</span>
                <span className="premium-stat-label">Membres</span>
              </div>
              <div className="premium-stat">
                <span className="premium-stat-number">{formatNumber(stats.posts)}</span>
                <span className="premium-stat-label">Posts</span>
              </div>
              <div className="premium-stat">
                <span className="premium-stat-number">{formatNumber(stats.vip)}</span>
                <span className="premium-stat-label">VIP</span>
              </div>
            </div>

            <button 
              onClick={handleVIPUpgrade}
              className="premium-vip-btn pulse-hover"
            >
              <span>🔥</span>
              Obtenir VIP Premium
            </button>
          </section>

          {/* Free Content Section */}
          <section className="premium-content-section fade-in-up">
            <h2 className="premium-section-title">
              <span>🆓</span>
              Derniers Posts (Gratuit)
            </h2>
            <div className="premium-cards">
              {freePosts.map((post) => (
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
          </section>

          {/* VIP Content Section */}
          <section className="premium-content-section fade-in-up">
            <h2 className="premium-section-title">
              <span>💎</span>
              Derniers Posts (VIP)
            </h2>
            
            {session?.user?.role === 'VIP' || session?.user?.role === 'ADMIN' ? (
              <div className="premium-cards">
                {vipPosts.map((post) => (
                  <article key={post.id} className="premium-card">
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
                <div className="premium-vip-lock-icon">🔒</div>
                <h3 className="premium-vip-lock-title">Contenu VIP Exclusif</h3>
                <p className="premium-vip-lock-text">
                  Accédez à du contenu premium exclusif, des discussions privées et des fonctionnalités avancées réservées aux membres VIP.
                </p>
                <button 
                  onClick={handleVIPUpgrade}
                  className="premium-vip-btn"
                >
                  <span>💎</span>
                  Débloquer Premium
                </button>
              </div>
            )}
          </section>
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
