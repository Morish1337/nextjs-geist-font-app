'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  Crown, 
  Shield, 
  LogOut, 
  Settings, 
  Star, 
  Calendar, 
  MessageSquare, 
  Eye,
  Edit3,
  Save,
  X
} from 'lucide-react';
import LoginModal from '@/components/ui/LoginModal';
import VIPModal from '@/components/ui/VIPModal';

interface UserStats {
  postsCount: number;
  messagesCount: number;
  joinDate: string;
  lastActive: string;
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showVIPModal, setShowVIPModal] = useState(false);
  const [userStats, setUserStats] = useState<UserStats>({
    postsCount: 0,
    messagesCount: 0,
    joinDate: '',
    lastActive: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editedUsername, setEditedUsername] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status !== 'loading') {
      setIsLoading(false);
      if (session) {
        setEditedUsername(session.user.username);
        fetchUserStats();
      }
    }
  }, [session, status]);

  const fetchUserStats = async () => {
    try {
      // Simulate fetching user stats
      setUserStats({
        postsCount: Math.floor(Math.random() * 50) + 5,
        messagesCount: Math.floor(Math.random() * 200) + 20,
        joinDate: '2024-01-15',
        lastActive: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error fetching user stats:', error);
    }
  };

  const handleSaveProfile = async () => {
    if (!editedUsername.trim()) return;
    
    try {
      // Simulate saving profile
      setIsEditing(false);
      // In real app, update session data
    } catch (error) {
      console.error('Error saving profile:', error);
    }
  };

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' });
  };

  const getRoleInfo = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return {
          icon: Shield,
          color: 'text-red-400',
          bgColor: 'bg-red-500/20',
          borderColor: 'border-red-500/30',
          title: 'Administrateur',
          description: 'Accès complet à toutes les fonctionnalités'
        };
      case 'VIP':
        return {
          icon: Crown,
          color: 'text-yellow-400',
          bgColor: 'bg-yellow-500/20',
          borderColor: 'border-yellow-500/30',
          title: 'Membre VIP',
          description: 'Accès au contenu premium et aux fonctionnalités exclusives'
        };
      default:
        return {
          icon: User,
          color: 'text-blue-400',
          bgColor: 'bg-blue-500/20',
          borderColor: 'border-blue-500/30',
          title: 'Membre Gratuit',
          description: 'Accès au contenu gratuit de la communauté'
        };
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
          className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (!session) {
    return (
      <motion.div
        className="min-h-screen flex items-center justify-center p-6"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <div className="text-center max-w-md">
          <motion.div
            className="w-24 h-24 bg-gradient-to-br from-gray-700 to-gray-800 rounded-full flex items-center justify-center mx-auto mb-6 border border-gray-600"
            whileHover={{ scale: 1.05 }}
          >
            <User className="text-gray-400" size={40} />
          </motion.div>
          
          <h1 className="text-3xl font-bold text-white mb-4">
            Vous n'êtes pas connecté
          </h1>
          <p className="text-gray-400 mb-8">
            Connectez-vous pour accéder à votre profil et profiter de toutes les fonctionnalités de FinisseurHub.
          </p>
          
          <motion.button
            onClick={() => setShowLoginModal(true)}
            className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-semibold px-8 py-4 rounded-xl transition-all duration-300 shadow-lg"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Se connecter
          </motion.button>
        </div>

        <LoginModal
          isOpen={showLoginModal}
          onClose={() => setShowLoginModal(false)}
        />
      </motion.div>
    );
  }

  const roleInfo = getRoleInfo(session.user.role);
  const RoleIcon = roleInfo.icon;

  return (
    <motion.div
      className="min-h-screen p-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Profile Header */}
      <motion.div
        className="bg-gradient-to-br from-gray-900 via-black to-gray-800 rounded-2xl p-8 mb-8 border border-gray-700/50 overflow-hidden relative"
        variants={itemVariants}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-orange-600/5 to-red-600/5" />
        
        <div className="relative z-10">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-6">
              {/* Avatar */}
              <motion.div
                className={`w-20 h-20 rounded-full flex items-center justify-center ${roleInfo.bgColor} border-2 ${roleInfo.borderColor}`}
                whileHover={{ scale: 1.05 }}
              >
                <RoleIcon className={roleInfo.color} size={32} />
              </motion.div>
              
              {/* User Info */}
              <div>
                <div className="flex items-center gap-3 mb-2">
                  {isEditing ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={editedUsername}
                        onChange={(e) => setEditedUsername(e.target.value)}
                        className="bg-gray-800 border border-gray-600 rounded-lg px-3 py-1 text-white text-xl font-bold focus:border-orange-500 outline-none"
                      />
                      <button
                        onClick={handleSaveProfile}
                        className="p-1 text-green-400 hover:text-green-300 transition-colors"
                      >
                        <Save size={16} />
                      </button>
                      <button
                        onClick={() => {
                          setIsEditing(false);
                          setEditedUsername(session.user.username);
                        }}
                        className="p-1 text-red-400 hover:text-red-300 transition-colors"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <h1 className="text-2xl font-bold text-white">
                        {session.user.username}
                      </h1>
                      <button
                        onClick={() => setIsEditing(true)}
                        className="p-1 text-gray-400 hover:text-white transition-colors"
                      >
                        <Edit3 size={16} />
                      </button>
                    </div>
                  )}
                </div>
                
                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${roleInfo.bgColor} border ${roleInfo.borderColor}`}>
                  <RoleIcon className={roleInfo.color} size={16} />
                  <span className={`font-semibold ${roleInfo.color}`}>
                    {roleInfo.title}
                  </span>
                </div>
                
                <p className="text-gray-400 text-sm mt-2">
                  {roleInfo.description}
                </p>
              </div>
            </div>
            
            {/* Actions */}
            <div className="flex items-center gap-2">
              <motion.button
                className="p-2 bg-gray-800/50 hover:bg-gray-700/50 rounded-lg transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Settings className="text-gray-400" size={20} />
              </motion.button>
              
              <motion.button
                onClick={handleSignOut}
                className="p-2 bg-red-600/20 hover:bg-red-600/30 rounded-lg transition-colors border border-red-600/30"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <LogOut className="text-red-400" size={20} />
              </motion.button>
            </div>
          </div>
          
          {/* VIP Upgrade CTA */}
          {session.user.role === 'FREE' && (
            <motion.div
              className="bg-gradient-to-r from-yellow-900/20 to-orange-900/20 rounded-xl p-4 border border-yellow-600/30"
              variants={itemVariants}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Crown className="text-yellow-400" size={24} />
                  <div>
                    <h3 className="font-semibold text-white">Passez au VIP Premium</h3>
                    <p className="text-gray-300 text-sm">Débloquez le contenu exclusif et les fonctionnalités premium</p>
                  </div>
                </div>
                <motion.button
                  onClick={() => setShowVIPModal(true)}
                  className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-semibold px-6 py-2 rounded-lg hover:from-yellow-300 hover:to-orange-400 transition-all"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Upgrade
                </motion.button>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div className="grid grid-cols-2 gap-4 mb-8" variants={itemVariants}>
        <motion.div
          className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 backdrop-blur-sm p-6 rounded-xl border border-gray-700/50"
          whileHover={{ scale: 1.02, y: -2 }}
        >
          <div className="flex items-center gap-3 mb-2">
            <MessageSquare className="text-blue-400" size={24} />
            <h3 className="font-semibold text-white">Messages</h3>
          </div>
          <p className="text-2xl font-bold text-blue-400">{userStats.messagesCount}</p>
          <p className="text-gray-400 text-sm">Messages envoyés</p>
        </motion.div>
        
        <motion.div
          className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 backdrop-blur-sm p-6 rounded-xl border border-gray-700/50"
          whileHover={{ scale: 1.02, y: -2 }}
        >
          <div className="flex items-center gap-3 mb-2">
            <Eye className="text-purple-400" size={24} />
            <h3 className="font-semibold text-white">Vues</h3>
          </div>
          <p className="text-2xl font-bold text-purple-400">{userStats.postsCount}</p>
          <p className="text-gray-400 text-sm">Posts consultés</p>
        </motion.div>
      </motion.div>

      {/* Account Info */}
      <motion.div
        className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 mb-8"
        variants={itemVariants}
      >
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <User className="text-orange-400" size={24} />
          Informations du compte
        </h2>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-gray-700/50">
            <div className="flex items-center gap-3">
              <Calendar className="text-gray-400" size={16} />
              <span className="text-gray-300">Membre depuis</span>
            </div>
            <span className="text-white font-medium">
              {new Date(userStats.joinDate).toLocaleDateString('fr-FR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </span>
          </div>
          
          <div className="flex items-center justify-between py-3 border-b border-gray-700/50">
            <div className="flex items-center gap-3">
              <Star className="text-gray-400" size={16} />
              <span className="text-gray-300">Dernière activité</span>
            </div>
            <span className="text-white font-medium">
              {new Date(userStats.lastActive).toLocaleDateString('fr-FR')}
            </span>
          </div>
          
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-3">
              <Shield className="text-gray-400" size={16} />
              <span className="text-gray-300">Email</span>
            </div>
            <span className="text-white font-medium">
              {session.user.email || 'Non renseigné'}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Admin Panel */}
      {session.user.role === 'ADMIN' && (
        <motion.div
          className="bg-gradient-to-br from-red-900/20 to-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-red-600/30"
          variants={itemVariants}
        >
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Shield className="text-red-400" size={24} />
            Panneau d'administration
          </h2>
          
          <div className="grid grid-cols-2 gap-4">
            <motion.button
              className="p-4 bg-red-600/20 hover:bg-red-600/30 rounded-lg border border-red-600/30 transition-all text-left"
              whileHover={{ scale: 1.02 }}
            >
              <h3 className="font-semibold text-red-400 mb-1">Gestion des utilisateurs</h3>
              <p className="text-gray-400 text-sm">Modérer et gérer les comptes</p>
            </motion.button>
            
            <motion.button
              className="p-4 bg-red-600/20 hover:bg-red-600/30 rounded-lg border border-red-600/30 transition-all text-left"
              whileHover={{ scale: 1.02 }}
            >
              <h3 className="font-semibold text-red-400 mb-1">Modération</h3>
              <p className="text-gray-400 text-sm">Gérer le contenu et les messages</p>
            </motion.button>
          </div>
        </motion.div>
      )}

      {/* Modals */}
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
