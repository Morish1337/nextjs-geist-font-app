'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import BottomNav from '@/components/ui/BottomNav';
import LoginModal from '@/components/ui/LoginModal';

interface Message {
  id: string;
  content: string;
  username: string;
  role: string;
  created_at: string;
  channel: 'free' | 'vip';
}

export default function ConversationsPage() {
  const { data: session } = useSession();
  const [activeChannel, setActiveChannel] = useState<'free' | 'vip'>('free');
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadMessages();
    const interval = setInterval(loadMessages, 3000); // Refresh toutes les 3 secondes
    return () => clearInterval(interval);
  }, [activeChannel]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadMessages = async () => {
    try {
      const res = await fetch(`/api/socket?channel=${activeChannel}&limit=50`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
      }
    } catch (error) {
      console.error('Erreur chargement messages:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!session) {
      setShowLoginModal(true);
      return;
    }

    if (!newMessage.trim()) return;

    // Vérifier l'accès au canal VIP
    if (activeChannel === 'vip' && session.user?.role !== 'VIP' && session.user?.role !== 'ADMIN') {
      alert('Accès VIP requis pour ce canal');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/socket', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: newMessage,
          channel: activeChannel
        })
      });

      if (res.ok) {
        setNewMessage('');
        loadMessages(); // Recharger les messages
      } else {
        alert('Erreur lors de l\'envoi du message');
      }
    } catch (error) {
      alert('Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  const canAccessVIP = session?.user?.role === 'VIP' || session?.user?.role === 'ADMIN';

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'text-red-400';
      case 'VIP': return 'text-yellow-400';
      default: return 'text-blue-400';
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'ADMIN': return '👑';
      case 'VIP': return '⭐';
      default: return '';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 pb-20">
      {/* Header avec sélecteur de canal */}
      <div className="sticky top-0 z-10 bg-black/80 backdrop-blur-lg border-b border-purple-500/20">
        <div className="flex items-center justify-center p-4">
          <div className="flex bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => setActiveChannel('free')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                activeChannel === 'free'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Chat Free
              <span className="bg-blue-500 text-white text-xs px-1.5 py-0.5 rounded">
                {messages.filter(m => m.channel === 'free').length}
              </span>
            </button>

            <button
              onClick={() => setActiveChannel('vip')}
              disabled={!canAccessVIP}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                activeChannel === 'vip'
                  ? 'bg-yellow-600 text-white'
                  : canAccessVIP 
                    ? 'text-gray-400 hover:text-white'
                    : 'text-gray-600 cursor-not-allowed'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Chat VIP
              {canAccessVIP ? (
                <span className="bg-yellow-500 text-white text-xs px-1.5 py-0.5 rounded">
                  {messages.filter(m => m.channel === 'vip').length}
                </span>
              ) : (
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="chat-container">
        <div className="chat-messages">
          {!session ? (
            <div className="text-center py-12">
              <svg className="w-16 h-16 text-gray-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <h3 className="text-xl font-semibold text-white mb-2">
                Connectez-vous pour participer
              </h3>
              <p className="text-gray-400 mb-4">
                Rejoignez la conversation avec la communauté
              </p>
              <button
                onClick={() => setShowLoginModal(true)}
                className="btn-primary"
              >
                Se connecter
              </button>
            </div>
          ) : activeChannel === 'vip' && !canAccessVIP ? (
            <div className="text-center py-12">
              <svg className="w-16 h-16 text-yellow-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <h3 className="text-xl font-semibold text-white mb-2">
                Chat VIP Premium
              </h3>
              <p className="text-gray-400 mb-4">
                Accès réservé aux membres VIP et administrateurs
              </p>
              <button className="btn-primary">
                Devenir VIP
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-400">Aucun message pour le moment</p>
                  <p className="text-gray-500 text-sm mt-2">Soyez le premier à écrire !</p>
                </div>
              ) : (
                messages
                  .filter(msg => msg.channel === activeChannel)
                  .map((message) => (
                    <div key={message.id} className="flex items-start gap-3 p-3 hover:bg-white/5 rounded-lg">
                      <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-sm font-bold">
                          {message.username.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`font-semibold text-sm ${getRoleColor(message.role)}`}>
                            {message.username}
                          </span>
                          <span className="text-xs">
                            {getRoleBadge(message.role)}
                          </span>
                          <span className="text-xs text-gray-500">
                            {formatTime(message.created_at)}
                          </span>
                        </div>
                        <p className="text-gray-300 text-sm break-words">
                          {message.content}
                        </p>
                      </div>
                    </div>
                  ))
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input de message */}
        {session && (activeChannel === 'free' || canAccessVIP) && (
          <div className="chat-input">
            <form onSubmit={handleSendMessage} className="flex gap-3">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder={`Écrivez dans le chat ${activeChannel === 'vip' ? 'VIP' : 'public'}...`}
                className="flex-1 input-dark"
                disabled={loading}
                maxLength={500}
              />
              <button
                type="submit"
                disabled={loading || !newMessage.trim()}
                className="btn-primary px-6 flex items-center gap-2"
              >
                {loading ? (
                  <div className="loading-spinner"></div>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                )}
                Envoyer
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Modal de connexion */}
      {showLoginModal && (
        <LoginModal onClose={() => setShowLoginModal(false)} />
      )}

      {/* Navigation */}
      <BottomNav />
    </div>
  );
}
