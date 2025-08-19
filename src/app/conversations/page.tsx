'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Crown, Shield, User, Smile, Image, Video, Paperclip, MoreVertical, Hash, Lock } from 'lucide-react';
import LoginModal from '@/components/ui/LoginModal';
import ChatFileUpload from '@/components/ui/ChatFileUpload';
import VIPModal from '@/components/ui/VIPModal';

interface Message {
  id: number;
  content: string;
  username: string;
  role: 'FREE' | 'VIP' | 'ADMIN';
  created_at: string;
  channel: string;
  fileUrl?: string;
  fileType?: 'image' | 'video' | 'file';
}

interface Channel {
  id: string;
  name: string;
  type: 'FREE' | 'VIP';
  description: string;
  messageCount: number;
}

export default function ConversationsPage() {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showVIPModal, setShowVIPModal] = useState(false);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [activeChannel, setActiveChannel] = useState('general');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const channels: Channel[] = [
    { id: 'general', name: 'Général', type: 'FREE', description: 'Discussion générale', messageCount: 1247 },
    { id: 'finisseur-latina', name: 'Finisseur Latina', type: 'FREE', description: 'Discussions sur le contenu Latina', messageCount: 892 },
    { id: 'finisseur-ass', name: 'Finisseur Ass', type: 'FREE', description: 'Discussions sur le contenu Ass', messageCount: 634 },
    { id: 'finisseur-boobs', name: 'Finisseur Boobs', type: 'FREE', description: 'Discussions sur le contenu Boobs', messageCount: 445 },
    { id: 'finisseur-92i', name: 'Finisseur 92i', type: 'FREE', description: 'Discussions région parisienne', messageCount: 278 },
    { id: 'finisseur-cumshot', name: 'Finisseur Cumshot', type: 'FREE', description: 'Discussions sur les finitions', messageCount: 567 },
    { id: 'finisseur-lesbienne', name: 'Finisseur Lesbienne', type: 'FREE', description: 'Contenu lesbien', messageCount: 234 },
    { id: 'finisseur-fellation', name: 'Finisseur Fellation', type: 'FREE', description: 'Discussions fellation', messageCount: 389 },
    { id: 'finisseur-lieu-public', name: 'Finisseur Lieu Public', type: 'FREE', description: 'Aventures en public', messageCount: 156 },
    { id: 'finisseur-vip', name: 'Finisseur VIP', type: 'VIP', description: 'Chat exclusif VIP', messageCount: 2341 }
  ];

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [activeChannel]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const response = await fetch(`/api/socket?channel=${activeChannel}&limit=50`);
      const data = await response.json();
      setMessages(data.messages || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleChannelChange = (channelId: string) => {
    const channel = channels.find(c => c.id === channelId);
    if (!channel) return;

    // Check VIP access
    if (channel.type === 'VIP' && (!session || (session.user.role !== 'VIP' && session.user.role !== 'ADMIN'))) {
      if (!session) {
        setShowLoginModal(true);
      } else {
        setShowVIPModal(true);
      }
      return;
    }

    setActiveChannel(channelId);
    setMessages([]);
    setIsLoading(true);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!session) {
      setShowLoginModal(true);
      return;
    }

    if (!newMessage.trim()) return;

    const tempMessage: Message = {
      id: Date.now(),
      content: newMessage,
      username: session.user.username,
      role: session.user.role,
      created_at: new Date().toISOString(),
      channel: activeChannel
    };

    setMessages(prev => [...prev, tempMessage]);
    setNewMessage('');
    
    setIsTyping(true);
    setTimeout(() => setIsTyping(false), 2000);

    try {
      await fetch('/api/socket', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: newMessage,
          userId: session.user.id,
          channel: activeChannel
        })
      });
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleFileSelect = async (file: File, type: 'image' | 'video' | 'file') => {
    if (!session) return;

    // Create file message
    const fileMessage: Message = {
      id: Date.now(),
      content: `${session.user.username} a partagé ${type === 'image' ? 'une image' : type === 'video' ? 'une vidéo' : 'un fichier'}: ${file.name}`,
      username: session.user.username,
      role: session.user.role,
      created_at: new Date().toISOString(),
      channel: activeChannel,
      fileUrl: URL.createObjectURL(file),
      fileType: type
    };

    setMessages(prev => [...prev, fileMessage]);
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return <Shield className="text-red-400" size={14} />;
      case 'VIP':
        return <Crown className="text-yellow-400" size={14} />;
      default:
        return <User className="text-blue-400" size={14} />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'text-red-400';
      case 'VIP':
        return 'text-yellow-400';
      default:
        return 'text-blue-400';
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'VIP':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      default:
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    }
  };

  const currentChannel = channels.find(c => c.id === activeChannel);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Sidebar - Channels */}
      <div className="w-80 bg-gradient-to-b from-gray-900 via-black to-gray-800 border-r border-gray-700/50 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-700/50">
          <h2 className="text-xl font-bold bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
            Conversations
          </h2>
          <p className="text-gray-400 text-sm">
            {channels.length} canaux disponibles
          </p>
        </div>

        {/* Channels List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {channels.map((channel) => {
            const isActive = activeChannel === channel.id;
            const isVIPChannel = channel.type === 'VIP';
            const hasAccess = !isVIPChannel || (session && (session.user.role === 'VIP' || session.user.role === 'ADMIN'));
            
            return (
              <motion.button
                key={channel.id}
                onClick={() => handleChannelChange(channel.id)}
                className={`w-full text-left p-3 rounded-lg transition-all duration-200 ${
                  isActive 
                    ? 'bg-gradient-to-r from-green-600/20 to-blue-600/20 border border-green-500/30' 
                    : 'hover:bg-gray-800/50'
                } ${!hasAccess ? 'opacity-60' : ''}`}
                whileHover={{ scale: hasAccess ? 1.02 : 1 }}
                whileTap={{ scale: hasAccess ? 0.98 : 1 }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Hash size={16} className={isActive ? 'text-green-400' : 'text-gray-400'} />
                  <span className={`font-medium ${isActive ? 'text-white' : 'text-gray-300'}`}>
                    {channel.name}
                  </span>
                  {isVIPChannel && (
                    <div className="flex items-center gap-1">
                      {hasAccess ? (
                        <Crown className="text-yellow-400" size={12} />
                      ) : (
                        <Lock className="text-gray-500" size={12} />
                      )}
                    </div>
                  )}
                </div>
                <p className={`text-xs ${isActive ? 'text-gray-300' : 'text-gray-500'}`}>
                  {channel.description}
                </p>
                <div className="flex items-center justify-between mt-2">
                  <span className={`text-xs ${isActive ? 'text-green-400' : 'text-gray-500'}`}>
                    {channel.messageCount} messages
                  </span>
                  {isVIPChannel && (
                    <span className="text-xs px-2 py-0.5 bg-yellow-500/20 text-yellow-400 rounded-full border border-yellow-500/30">
                      VIP
                    </span>
                  )}
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* User Info */}
        {session && (
          <div className="p-4 border-t border-gray-700/50">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                session.user.role === 'ADMIN' ? 'bg-red-500/20 border border-red-500/30' :
                session.user.role === 'VIP' ? 'bg-yellow-500/20 border border-yellow-500/30' :
                'bg-blue-500/20 border border-blue-500/30'
              }`}>
                {getRoleIcon(session.user.role)}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-white text-sm">
                    {session.user.username}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full border ${getRoleBadge(session.user.role)}`}>
                    {session.user.role}
                  </span>
                </div>
                <div className="flex items-center gap-1 mt-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-xs text-gray-400">En ligne</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="bg-gradient-to-r from-gray-900 via-black to-gray-800 p-4 border-b border-gray-700/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Hash className="text-green-400" size={24} />
              <div>
                <h1 className="text-xl font-bold text-white">
                  {currentChannel?.name}
                </h1>
                <p className="text-gray-400 text-sm">
                  {currentChannel?.description} • {messages.length} message{messages.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-xs text-gray-400">En ligne</span>
            </div>
          </div>
        </div>

        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <AnimatePresence initial={false}>
            {messages.map((message, index) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ 
                  type: "spring",
                  stiffness: 500,
                  damping: 30,
                  delay: index * 0.02
                }}
                className={`flex items-start gap-3 p-4 rounded-xl transition-all duration-300 group ${
                  message.username === session?.user?.username
                    ? 'bg-gradient-to-r from-blue-900/30 to-purple-900/20 border border-blue-600/20 ml-8'
                    : 'bg-gradient-to-r from-gray-900/50 to-gray-800/30 border border-gray-700/30 mr-8 hover:border-gray-600/50'
                }`}
                whileHover={{ scale: 1.01, y: -1 }}
              >
                {/* Avatar */}
                <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                  message.role === 'ADMIN' ? 'bg-gradient-to-br from-red-500/20 to-red-600/20 border border-red-500/30' :
                  message.role === 'VIP' ? 'bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-500/30' :
                  'bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30'
                }`}>
                  {getRoleIcon(message.role)}
                </div>

                {/* Message Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`font-semibold ${getRoleColor(message.role)}`}>
                      {message.username}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${getRoleBadge(message.role)}`}>
                      {message.role}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(message.created_at).toLocaleTimeString('fr-FR', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                  
                  {/* File Content */}
                  {message.fileUrl && (
                    <div className="mb-2">
                      {message.fileType === 'image' && (
                        <img 
                          src={message.fileUrl} 
                          alt="Shared image" 
                          className="max-w-xs rounded-lg border border-gray-600"
                        />
                      )}
                      {message.fileType === 'video' && (
                        <video 
                          src={message.fileUrl} 
                          controls 
                          className="max-w-xs rounded-lg border border-gray-600"
                        />
                      )}
                    </div>
                  )}
                  
                  <p className="text-gray-200 text-sm leading-relaxed break-words">
                    {message.content}
                  </p>
                </div>

                {/* Message Actions */}
                <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="p-1 text-gray-500 hover:text-gray-300 transition-colors">
                    <MoreVertical size={14} />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Typing Indicator */}
          <AnimatePresence>
            {isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center gap-2 text-gray-400 text-sm px-4"
              >
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
                <span>Quelqu'un écrit...</span>
              </motion.div>
            )}
          </AnimatePresence>

          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <motion.div
          className="p-4 bg-gradient-to-t from-black via-gray-900 to-gray-800/95 border-t border-gray-700/50 backdrop-blur-sm"
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {session ? (
            <form onSubmit={handleSendMessage} className="flex items-end gap-3">
              {/* Message Input */}
              <div className="flex-1 relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder={`Message #${currentChannel?.name.toLowerCase()}...`}
                  className="w-full px-4 py-3 pr-32 bg-gray-800/50 border border-gray-600 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all outline-none text-white placeholder-gray-400"
                  maxLength={500}
                />
                
                {/* Input Actions */}
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
                  <button
                    type="button"
                    className="p-1.5 text-gray-400 hover:text-gray-300 transition-colors rounded-lg hover:bg-gray-700/50"
                  >
                    <Smile size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowFileUpload(true)}
                    className="p-1.5 text-gray-400 hover:text-gray-300 transition-colors rounded-lg hover:bg-gray-700/50"
                  >
                    <Image size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowFileUpload(true)}
                    className="p-1.5 text-gray-400 hover:text-gray-300 transition-colors rounded-lg hover:bg-gray-700/50"
                  >
                    <Video size={16} />
                  </button>
                  {session.user.role === 'ADMIN' && (
                    <button
                      type="button"
                      onClick={() => setShowFileUpload(true)}
                      className="p-1.5 text-gray-400 hover:text-gray-300 transition-colors rounded-lg hover:bg-gray-700/50"
                    >
                      <Paperclip size={16} />
                    </button>
                  )}
                </div>
              </div>

              {/* Send Button */}
              <motion.button
                type="submit"
                disabled={!newMessage.trim()}
                className="p-3 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-700 text-white rounded-xl transition-all duration-300 disabled:cursor-not-allowed shadow-lg hover:shadow-green-500/25"
                whileHover={{ scale: newMessage.trim() ? 1.05 : 1 }}
                whileTap={{ scale: 0.95 }}
              >
                <Send size={20} />
              </motion.button>
            </form>
          ) : (
            <motion.div
              className="text-center py-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <p className="text-gray-400 mb-4">
                Vous devez être connecté pour participer aux discussions
              </p>
              <motion.button
                onClick={() => setShowLoginModal(true)}
                className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-semibold px-8 py-3 rounded-xl transition-all duration-300 shadow-lg"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Se connecter pour chatter
              </motion.button>
            </motion.div>
          )}
        </motion.div>
      </div>

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
        }}
      />

      <ChatFileUpload
        isOpen={showFileUpload}
        onClose={() => setShowFileUpload(false)}
        onFileSelect={handleFileSelect}
      />
    </div>
  );
}
