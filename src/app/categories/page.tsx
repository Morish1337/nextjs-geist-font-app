'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import { Crown, Lock, Plus, Eye, MessageSquare, Calendar, User, Zap } from 'lucide-react';
import LoginModal from '@/components/ui/LoginModal';
import VIPModal from '@/components/ui/VIPModal';

interface Category {
  id: number;
  name: string;
  type: 'FREE' | 'VIP';
  description?: string;
  post_count?: number;
}

interface Post {
  id: number;
  title: string;
  content: string;
  username: string;
  created_at: string;
  visibility: 'FREE' | 'VIP';
}

export default function CategoriesPage() {
  const { data: session } = useSession();
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showVIPModal, setShowVIPModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryType, setNewCategoryType] = useState<'FREE' | 'VIP'>('FREE');

  useEffect(() => {
    fetchCategories();
  }, [session]);

  useEffect(() => {
    if (selectedCategory) {
      fetchPosts(selectedCategory.id);
    }
  }, [selectedCategory, session]);

  const fetchCategories = async () => {
    try {
      const userRole = session?.user?.role || 'FREE';
      const response = await fetch(`/api/categories?userRole=${userRole}`);
      const data = await response.json();
      setCategories(data.categories || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPosts = async (categoryId: number) => {
    try {
      const userRole = session?.user?.role || 'FREE';
      const response = await fetch(`/api/posts?categoryId=${categoryId}&userRole=${userRole}`);
      const data = await response.json();
      setPosts(data.posts || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
  };

  const handleCategoryClick = (category: Category) => {
    if (category.type === 'VIP' && (!session || (session.user.role !== 'VIP' && session.user.role !== 'ADMIN'))) {
      if (!session) {
        setShowLoginModal(true);
      } else {
        setShowVIPModal(true);
      }
      return;
    }
    setSelectedCategory(category);
  };

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return;
    
    try {
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newCategoryName,
          type: newCategoryType,
          userId: session?.user?.id
        })
      });
      
      if (response.ok) {
        setNewCategoryName('');
        setShowCreateForm(false);
        fetchCategories();
      }
    } catch (error) {
      console.error('Error creating category:', error);
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
          className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <motion.div
      className="min-h-screen p-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div className="mb-8" variants={itemVariants}>
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
            Catégories
          </h1>
          <p className="text-gray-400">
            Explorez nos différentes catégories de contenu
          </p>
        </div>

        {/* Admin Create Button */}
        {session?.user?.role === 'ADMIN' && (
          <motion.div className="text-center mb-6" variants={itemVariants}>
            <motion.button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold px-6 py-3 rounded-xl hover:from-red-700 hover:to-red-800 transition-all shadow-lg"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Plus size={20} />
              Créer une catégorie
            </motion.button>
          </motion.div>
        )}

        {/* Create Form */}
        <AnimatePresence>
          {showCreateForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-gray-800/50 rounded-xl p-6 mb-6 border border-gray-700"
            >
              <h3 className="text-lg font-semibold text-white mb-4">Nouvelle catégorie</h3>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Nom de la catégorie"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none"
                />
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 text-white">
                    <input
                      type="radio"
                      name="categoryType"
                      value="FREE"
                      checked={newCategoryType === 'FREE'}
                      onChange={(e) => setNewCategoryType(e.target.value as 'FREE' | 'VIP')}
                      className="text-blue-500"
                    />
                    FREE
                  </label>
                  <label className="flex items-center gap-2 text-white">
                    <input
                      type="radio"
                      name="categoryType"
                      value="VIP"
                      checked={newCategoryType === 'VIP'}
                      onChange={(e) => setNewCategoryType(e.target.value as 'FREE' | 'VIP')}
                      className="text-yellow-500"
                    />
                    VIP
                  </label>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleCreateCategory}
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition-colors"
                  >
                    Créer
                  </button>
                  <button
                    onClick={() => setShowCreateForm(false)}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg transition-colors"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {!selectedCategory ? (
        /* Categories Grid */
        <motion.div className="space-y-6" variants={itemVariants}>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <div className="w-1 h-6 bg-gradient-to-b from-purple-400 to-pink-500 rounded-full" />
            Toutes les catégories
          </h2>
          
          <div className="grid gap-4">
            <AnimatePresence>
              {categories.map((category, index) => (
                <motion.div
                  key={category.id}
                  className={`group relative bg-gradient-to-r ${
                    category.type === 'VIP' 
                      ? 'from-yellow-900/20 via-orange-900/10 to-gray-900/30 border-yellow-600/30 hover:border-yellow-500/50' 
                      : 'from-gray-900/50 to-gray-800/30 border-gray-700/50 hover:border-gray-600/50'
                  } backdrop-blur-sm p-6 rounded-xl border cursor-pointer transition-all duration-300 overflow-hidden`}
                  onClick={() => handleCategoryClick(category)}
                  whileHover={{ scale: 1.02, y: -2 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  layout
                >
                  {/* Background effect */}
                  <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity ${
                    category.type === 'VIP' 
                      ? 'bg-gradient-to-r from-yellow-600/5 to-orange-600/5' 
                      : 'bg-gradient-to-r from-purple-600/5 to-blue-600/5'
                  }`} />
                  
                  <div className="relative z-10 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-xl ${
                        category.type === 'VIP' 
                          ? 'bg-gradient-to-br from-yellow-400/20 to-orange-500/20' 
                          : 'bg-gradient-to-br from-purple-400/20 to-blue-500/20'
                      }`}>
                        {category.type === 'VIP' ? (
                          <Crown className="text-yellow-400" size={24} />
                        ) : (
                          <Eye className="text-purple-400" size={24} />
                        )}
                      </div>
                      
                      <div>
                        <h3 className={`font-semibold text-lg ${
                          category.type === 'VIP' ? 'text-yellow-100' : 'text-white'
                        } group-hover:${category.type === 'VIP' ? 'text-yellow-200' : 'text-purple-200'} transition-colors`}>
                          {category.name}
                        </h3>
                        <div className="flex items-center gap-4 mt-1">
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            category.type === 'VIP' 
                              ? 'bg-yellow-500/20 text-yellow-400' 
                              : 'bg-blue-500/20 text-blue-400'
                          }`}>
                            {category.type}
                          </span>
                          <span className="text-xs text-gray-400 flex items-center gap-1">
                            <MessageSquare size={12} />
                            {category.post_count || 0} posts
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {category.type === 'VIP' && (!session || (session.user.role !== 'VIP' && session.user.role !== 'ADMIN')) && (
                        <Lock className="text-yellow-400" size={20} />
                      )}
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </motion.div>
      ) : (
        /* Selected Category Posts */
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-6"
        >
          {/* Back Button & Category Header */}
          <div className="flex items-center gap-4 mb-6">
            <motion.button
              onClick={() => setSelectedCategory(null)}
              className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              ←
            </motion.button>
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                {selectedCategory.type === 'VIP' ? (
                  <Crown className="text-yellow-400" size={28} />
                ) : (
                  <Eye className="text-purple-400" size={28} />
                )}
                {selectedCategory.name}
              </h2>
              <p className="text-gray-400 text-sm">
                {posts.length} post{posts.length !== 1 ? 's' : ''} disponible{posts.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>

          {/* Posts */}
          <div className="grid gap-4">
            <AnimatePresence>
              {posts.length > 0 ? (
                posts.map((post, index) => (
                  <motion.div
                    key={post.id}
                    className={`group bg-gradient-to-r ${
                      selectedCategory.type === 'VIP' 
                        ? 'from-yellow-900/20 via-orange-900/10 to-gray-900/30 border-yellow-600/30' 
                        : 'from-gray-900/50 to-gray-800/30 border-gray-700/50'
                    } backdrop-blur-sm p-6 rounded-xl border hover:border-opacity-70 transition-all duration-300`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.01, y: -1 }}
                    layout
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-semibold text-white group-hover:text-purple-200 transition-colors">
                        {post.title}
                      </h3>
                      <div className={`text-xs px-2 py-1 rounded-full ${
                        post.visibility === 'VIP' 
                          ? 'bg-yellow-500/20 text-yellow-400' 
                          : 'bg-blue-500/20 text-blue-400'
                      }`}>
                        {post.visibility}
                      </div>
                    </div>
                    <p className="text-gray-300 text-sm mb-4 line-clamp-2">{post.content}</p>
                    <div className="flex justify-between items-center text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <User size={12} />
                        {post.username}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar size={12} />
                        {new Date(post.created_at).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                  </motion.div>
                ))
              ) : (
                <motion.div
                  className="text-center py-16 text-gray-400"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <MessageSquare className="mx-auto mb-4 opacity-50" size={48} />
                  <p className="text-lg mb-2">Aucun post pour le moment</p>
                  <p className="text-sm">Cette catégorie sera bientôt remplie de contenu exclusif !</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}

      {/* Modals */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />
      
      <VIPModal
        isOpen={showVIPModal}
        onClose={() => setShowVIPModal(false)}
        onUpgrade={() => {
          setShowVIPModal(false);
          // Handle VIP upgrade
        }}
      />
    </motion.div>
  );
}
