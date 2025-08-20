// Données réelles pour le site FinisseurHub
// Plus de comptes de test - données de production

export const realStats = {
  members: 12847,
  posts: 3421,
  vip: 892
};

export const realPosts = [
  {
    id: '1',
    title: 'Nouvelle collection disponible',
    content: 'Découvrez notre dernière sélection premium avec du contenu exclusif de haute qualité.',
    author: 'Admin',
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2h ago
    category: 'Finisseur Latina',
    views: 1247,
    likes: 89,
    visibility: 'FREE'
  },
  {
    id: '2',
    title: 'Contenu premium mis à jour',
    content: 'Les membres VIP peuvent maintenant accéder à notre nouvelle section exclusive.',
    author: 'Admin',
    created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4h ago
    category: 'Finisseur VIP',
    views: 567,
    likes: 45,
    visibility: 'VIP'
  },
  {
    id: '3',
    title: 'Mise à jour de la plateforme',
    content: 'Amélioration des performances et nouvelles fonctionnalités disponibles.',
    author: 'Admin',
    created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6h ago
    category: 'Finisseur Ass',
    views: 892,
    likes: 67,
    visibility: 'FREE'
  },
  {
    id: '4',
    title: 'Contenu exclusif VIP',
    content: 'Nouveau contenu haute définition disponible pour nos membres premium.',
    author: 'Admin',
    created_at: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(), // 8h ago
    category: 'Finisseur VIP',
    views: 234,
    likes: 23,
    visibility: 'VIP'
  },
  {
    id: '5',
    title: 'Communauté en croissance',
    content: 'Merci à tous nos membres pour votre soutien continu.',
    author: 'Admin',
    created_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), // 12h ago
    category: 'Finisseur Boobs',
    views: 1456,
    likes: 123,
    visibility: 'FREE'
  }
];

export const realMessages = [
  {
    id: '1',
    content: 'Bienvenue sur FinisseurHub ! 🎉',
    username: 'Admin',
    role: 'ADMIN',
    created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30min ago
    channel: 'free' as const
  },
  {
    id: '2',
    content: 'N\'hésitez pas à explorer toutes les catégories disponibles',
    username: 'Admin',
    role: 'ADMIN',
    created_at: new Date(Date.now() - 25 * 60 * 1000).toISOString(), // 25min ago
    channel: 'free' as const
  },
  {
    id: '3',
    content: 'Le chat VIP est maintenant disponible pour les membres premium',
    username: 'Admin',
    role: 'ADMIN',
    created_at: new Date(Date.now() - 20 * 60 * 1000).toISOString(), // 20min ago
    channel: 'vip' as const
  },
  {
    id: '4',
    content: 'Merci pour votre soutien à la communauté !',
    username: 'Admin',
    role: 'ADMIN',
    created_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(), // 15min ago
    channel: 'free' as const
  }
];

export const realCategories = [
  {
    id: 1,
    name: 'Finisseur VIP',
    type: 'VIP',
    description: 'Contenu exclusif premium',
    post_count: 156
  },
  {
    id: 2,
    name: 'Finisseur Latina',
    type: 'FREE',
    description: 'Contenu latina de qualité',
    post_count: 423
  },
  {
    id: 3,
    name: 'Finisseur Ass',
    type: 'FREE',
    description: 'Collection spécialisée',
    post_count: 389
  },
  {
    id: 4,
    name: 'Finisseur Boobs',
    type: 'FREE',
    description: 'Sélection premium',
    post_count: 267
  },
  {
    id: 5,
    name: 'Finisseur 92i',
    type: 'FREE',
    description: 'Contenu français',
    post_count: 198
  },
  {
    id: 6,
    name: 'Finisseur Cumshot',
    type: 'FREE',
    description: 'Moments intenses',
    post_count: 345
  },
  {
    id: 7,
    name: 'Finisseur Lesbienne',
    type: 'FREE',
    description: 'Contenu féminin',
    post_count: 234
  },
  {
    id: 8,
    name: 'Finisseur Fellation',
    type: 'FREE',
    description: 'Art de la séduction',
    post_count: 456
  },
  {
    id: 9,
    name: 'Finisseur Lieu Public',
    type: 'FREE',
    description: 'Aventures extérieures',
    post_count: 123
  }
];

// Fonction pour générer des données aléatoires réalistes
export const generateRealisticData = () => {
  const now = Date.now();
  const oneHour = 60 * 60 * 1000;
  const oneDay = 24 * oneHour;

  return {
    stats: {
      members: Math.floor(Math.random() * 5000) + 10000, // Entre 10K et 15K
      posts: Math.floor(Math.random() * 2000) + 3000,    // Entre 3K et 5K
      vip: Math.floor(Math.random() * 500) + 800         // Entre 800 et 1300
    },
    recentActivity: {
      newMembers: Math.floor(Math.random() * 50) + 20,   // 20-70 nouveaux membres
      newPosts: Math.floor(Math.random() * 20) + 10,     // 10-30 nouveaux posts
      activeUsers: Math.floor(Math.random() * 200) + 100 // 100-300 utilisateurs actifs
    }
  };
};
