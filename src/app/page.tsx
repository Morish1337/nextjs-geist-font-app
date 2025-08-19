'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import LoginModal from '@/components/ui/LoginModal';
import VIPModal from '@/components/ui/VIPModal';
import { Crown, Users, FileText, Star, Lock, TrendingUp } from 'lucide-react';

interface Stats {
  members: number;
  posts: number;
  vip: number;
}

interface Post {
  id: number;
  title: string;
  content: string;
  username: string;
  created_at: string;
  visibility: 'FREE' | 'VIP';
}

export default function HomePage() {
  const { data: session, status } = useSession();
  const [stats, setStats] = useState<Stats>({ members: 0, posts: 0, vip: 0 });
  const [freePosts, setFreePosts] = useState<Post[]>([]);
  const [vipPosts, setVipPosts] = useState<Post[]>([]);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showVIPModal, setShowVIPModal] = useState(false);
  const [viewedPosts, setViewedPosts] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    fetchPosts();
  }, []);

  useEffect(() => {
    if (status !== 'loading') {
      setIsLoading(false);
    }
  }, [status]);

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
      
      const freeResponse = await fetch(`/api/posts?userRole=${userRole}&limit=5`);
      const freeData = await freeResponse.json();
      setFreePosts(freeData.posts || []);

      const vipResponse = await fetch(`/api/posts?userRole=VIP&limit=5`);
      const vipData = await vipResponse.json();
      setVipPosts(vipData.posts || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
  };

  const handleVIPUpgrade = async () => {
    try {
      const response = await fetch('/api/payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: session?.user?.id, plan: 'VIP' })
      });
      
      const data = await response.json();
      if (data.paymentUrl) {
        window.open(data.paymentUrl, '_blank');
      }
      setShowVIPModal(false);
    } catch (error) {
      console.error('Error creating payment session:', error);
    }
  };

  const handlePostClick = () => {
    if (!session) {
      setViewedPosts(prev => prev + 1);
      if (viewedPosts >= 2) {
        setShowLoginModal(true);
        return;
      }
    }
  };

  const handleVIPContentClick = () => {
    if (!session) {
      setShowLoginModal(true);
    } else if (session.user.role !== 'VIP' && session.user.role !== 'ADMIN') {
      setShowVIPModal(true);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring" as const,
        stiffness: 100
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <motion.div
      className="min-h-screen"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Hero Section */}
      <motion.div
        className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-black to-gray-800 p-6 border-b border-gray-700/50"
        variants={itemVariants}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10" />
        <div className="relative z-10">
          <div className="text-center mb-8">
            <motion.div
              className="inline-flex items-center gap-2 mb-4"
              whileHover={{ scale: 1.05 }}
            >
              <Crown className="text-yellow-400" size={32} />
              <h1 className="text-5xl font-bold bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent">
                FinisseurHub
              </h1>
            </motion.div>
            <motion.p
              className="text-gray-300 text-lg mb-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              La communauté premium des finisseurs
            </motion.p>

            {session && (
              <motion.div
                className="inline-flex items-center gap-2 bg-gray-800/50 px-4 py-2 rounded-full border border-gray-600"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5 }}
              >
                <div className={`w-2 h-2 rounded-full ${
                  session.user.role === 'ADMIN' ? 'bg-red-400' :
                  session.user.role === 'VIP' ? 'bg-yellow-400' : 'bg-blue-400'
                }`} />
                <span className="text-white font-medium">
                  {session.user.username}
                </span>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  session.user.role === 'ADMIN' ? 'bg-red-500/20 text-red-400' :
                  session.user.role === 'VIP' ? 'bg-yellow-500/20 text-yellow-400' : 
                  'bg-blue-500/20 text-blue-400'
                }`}>
                  {session.user.role}
                </span>
              </motion.div>
            )}
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <motion.div
              className="text-center p-4 bg-gray-800/30 backdrop-blur-sm rounded-xl border border-gray-700/50 hover:border-gray-600/50 transition-all"
              whileHover={{ scale: 1.05, y: -5 }}
              variants={itemVariants}
            >
              <Users className="mx-auto mb-2 text-blue-400" size={24} />
              <div className="text-2xl font-bold text-white">{stats.members.toLocaleString()}</div>
              <div className="text-xs text-gray-400">Membres</div>
            </motion.div>
            
            <motion.div
              className="text-center p-4 bg-gray-800/30 backdrop-blur-sm rounded-xl border border-gray-700/50 hover:border-gray-600/50 transition-all"
              whileHover={{ scale: 1.05, y: -5 }}
              variants={itemVariants}
            >
              <FileText className="mx-auto mb-2 text-green-400" size={24} />
              <div className="text-2xl font-bold text-white">{stats.posts.toLocaleString()}</div>
              <div className="text-xs text-gray-400">Posts</div>
            </motion.div>
            
            <motion.div
              className="text-center p-4 bg-gradient-to-br from-yellow-600/20 to-orange-600/20 backdrop-blur-sm rounded-xl border border-yellow-600/30 hover:border-yellow-500/50 transition-all"
              whileHover={{ scale: 1.05, y: -5 }}
              variants={itemVariants}
            >
              <Crown className="mx-auto mb-2 text-yellow-400" size={24} />
              <div className="text-2xl font-bold text-yellow-400">{stats.vip.toLocaleString()}</div>
              <div className="text-xs text-yellow-400">VIP</div>
            </motion.div>
          </div>

          {/* VIP CTA */}
          <motion.div
            className="text-center"
            variants={itemVariants}
          >
            <motion.button
              onClick={() => setShowVIPModal(true)}
              className="group relative inline-flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold px-8 py-4 rounded-full overflow-hidden shadow-lg hover:shadow-yellow-500/25 transition-all duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-300 to-orange-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              <Star className="relative z-10" size={20} />
              <span className="relative z-10">Obtenir VIP Premium</span>
              <TrendingUp className="relative z-10" size={16} />
            </motion.button>
          </motion.div>
        </div>
      </motion.div>

      {/* Content Sections */}
      <div className="p-6 space-y-8">
        {/* Free Posts */}
        <motion.section variants={itemVariants}>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1 h-8 bg-gradient-to-b from-blue-400 to-blue-600 rounded-full" />
            <h2 className="text-2xl font-bold text-white">Derniers Posts</h2>
            <div className="flex-1 h-px bg-gradient-to-r from-gray-700 to-transparent" />
          </div>
          
          <div className="grid gap-4">
            <AnimatePresence>
              {freePosts.length > 0 ? (
                freePosts.map((post, index) => (
                  <motion.div
                    key={post.id}
                    className="group bg-gradient-to-r from-gray-900/50 to-gray-800/30 backdrop-blur-sm p-6 rounded-xl border border-gray-700/50 hover:border-gray-600/50 cursor-pointer transition-all duration-300"
                    onClick={handlePostClick}
                    whileHover={{ scale: 1.02, y: -2 }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    layout
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-semibold text-white group-hover:text-blue-300 transition-colors">
                        {post.title}
                      </h3>
                      <div className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full">
                        FREE
                      </div>
                    </div>
                    <p className="text-gray-300 text-sm mb-4 line-clamp-2">{post.content}</p>
                    <div className="flex justify-between items-center text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <div className="w-1.5 h-1.5 bg-green-400 rounded-full" />
                        {post.username}
                      </span>
                      <span>{new Date(post.created_at).toLocaleDateString('fr-FR')}</span>
                    </div>
                  </motion.div>
                ))
              ) : (
                <motion.div
                  className="text-center py-12 text-gray-400"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <FileText className="mx-auto mb-4 opacity-50" size={48} />
                  <p>Aucun post pour le moment</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.section>

        {/* VIP Posts */}
        <motion.section variants={itemVariants}>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1 h-8 bg-gradient-to-b from-yellow-400 to-orange-500 rounded-full" />
            <h2 className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
              Contenu VIP Premium
            </h2>
            <Crown className="text-yellow-400" size={24} />
            <div className="flex-1 h-px bg-gradient-to-r from-yellow-600/50 to-transparent" />
          </div>
          
          {session?.user?.role === 'VIP' || session?.user?.role === 'ADMIN' ? (
            <div className="grid gap-4">
              <AnimatePresence>
                {vipPosts.length > 0 ? (
                  vipPosts.map((post, index) => (
                    <motion.div
                      key={post.id}
                      className="group bg-gradient-to-r from-yellow-900/20 via-orange-900/10 to-gray-900/30 backdrop-blur-sm p-6 rounded-xl border border-yellow-600/30 hover:border-yellow-500/50 transition-all duration-300"
                      whileHover={{ scale: 1.02, y: -2 }}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      layout
                    >
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="font-semibold text-white group-hover:text-yellow-300 transition-colors">
                          {post.title}
                        </h3>
                        <div className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded-full">
                          VIP
                        </div>
                      </div>
                      <p className="text-gray-300 text-sm mb-4 line-clamp-2">{post.content}</p>
                      <div className="flex justify-between items-center text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Crown className="text-yellow-400" size={12} />
                          {post.username}
                        </span>
                        <span>{new Date(post.created_at).toLocaleDateString('fr-FR')}</span>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <motion.div
                    className="text-center py-12 text-yellow-400/70"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <Crown className="mx-auto mb-4 opacity-50" size={48} />
                    <p>Aucun post VIP pour le moment</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <motion.div
              className="relative group bg-gradient-to-br from-yellow-900/10 via-orange-900/5 to-gray-900/20 backdrop-blur-sm p-8 rounded-2xl border border-yellow-600/30 hover:border-yellow-500/50 cursor-pointer transition-all duration-300 overflow-hidden"
              onClick={handleVIPContentClick}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-600/5 to-orange-600/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative z-10 text-center">
                <motion.div
                  className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-yellow-400/20 to-orange-500/20 rounded-full mb-4"
                  whileHover={{ rotate: 10 }}
                >
                  <Lock className="text-yellow-400" size={32} />
                </motion.div>
                <h3 className="text-xl font-bold text-white mb-2">
                  Contenu Premium Exclusif
                </h3>
                <p className="text-gray-300 mb-6 max-w-md mx-auto">
                  Débloquez l'accès aux posts VIP exclusifs, au contenu premium et aux fonctionnalités avancées
                </p>
                <motion.button
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold px-6 py-3 rounded-full hover:from-yellow-300 hover:to-orange-400 transition-all"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Crown size={16} />
                  Débloquer Premium
                </motion.button>
              </div>
            </motion.div>
          )}
        </motion.section>
      </div>

      {/* Modals */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />
      
      <VIPModal
        isOpen={showVIPModal}
        onClose={() => setShowVIPModal(false)}
        onUpgrade={handleVIPUpgrade}
      />
    </motion.div>
  );
}
