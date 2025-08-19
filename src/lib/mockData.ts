// Mock data for FinisseurHub when database is not available
export const mockStats = {
  members: 12847,
  posts: 3421,
  vip: 892
};

export const mockCategories = [
  { id: 9, name: 'Finisseur VIP', type: 'VIP' },
  { id: 1, name: 'Finisseur Latina', type: 'FREE' },
  { id: 2, name: 'Finisseur Ass', type: 'FREE' },
  { id: 3, name: 'Finisseur Boobs', type: 'FREE' },
  { id: 4, name: 'Finisseur 92i', type: 'FREE' },
  { id: 5, name: 'Finisseur Cumshot', type: 'FREE' },
  { id: 6, name: 'Finisseur Lesbienne', type: 'FREE' },
  { id: 7, name: 'Finisseur Fellation', type: 'FREE' },
  { id: 8, name: 'Finisseur Lieu Public', type: 'FREE' }
];

export const mockPosts = {
  FREE: [
    {
      id: 1,
      title: "Nouvelle collection Latina 🔥",
      content: "Découvrez les dernières vidéos de notre collection premium...",
      category: "Finisseur Latina",
      created_at: "2024-01-15T10:30:00Z",
      author: "Admin"
    },
    {
      id: 2,
      title: "Session photo exclusive",
      content: "Photos inédites de notre dernière session...",
      category: "Finisseur Boobs",
      created_at: "2024-01-14T15:45:00Z",
      author: "Admin"
    },
    {
      id: 3,
      title: "Compilation du weekend",
      content: "Les meilleurs moments du weekend compilés...",
      category: "Finisseur Ass",
      created_at: "2024-01-13T20:15:00Z",
      author: "Admin"
    },
    {
      id: 4,
      title: "Nouveau contenu 92i",
      content: "Contenu exclusif de la région parisienne...",
      category: "Finisseur 92i",
      created_at: "2024-01-12T12:00:00Z",
      author: "Admin"
    },
    {
      id: 5,
      title: "Collection Cumshot Premium",
      content: "Les meilleures finitions de la semaine...",
      category: "Finisseur Cumshot",
      created_at: "2024-01-11T18:30:00Z",
      author: "Admin"
    }
  ],
  VIP: [
    {
      id: 6,
      title: "🔒 Contenu VIP Exclusif - Latina Premium",
      content: "Accès exclusif aux vidéos HD non censurées...",
      category: "Finisseur VIP",
      created_at: "2024-01-15T22:00:00Z",
      author: "Admin"
    },
    {
      id: 7,
      title: "🔒 Session privée VIP",
      content: "Contenu privé réservé aux membres VIP...",
      category: "Finisseur VIP",
      created_at: "2024-01-14T19:30:00Z",
      author: "Admin"
    },
    {
      id: 8,
      title: "🔒 Collection VIP Lesbienne",
      content: "Vidéos exclusives haute qualité...",
      category: "Finisseur VIP",
      created_at: "2024-01-13T16:45:00Z",
      author: "Admin"
    },
    {
      id: 9,
      title: "🔒 Fellation Premium VIP",
      content: "Contenu premium réservé aux VIP...",
      category: "Finisseur VIP",
      created_at: "2024-01-12T21:15:00Z",
      author: "Admin"
    },
    {
      id: 10,
      title: "🔒 Lieu Public VIP Exclusif",
      content: "Aventures en lieux publics - Version VIP...",
      category: "Finisseur VIP",
      created_at: "2024-01-11T14:20:00Z",
      author: "Admin"
    }
  ]
};

export const mockMessages = [
  {
    id: 1,
    username: "Alex92",
    content: "Salut tout le monde ! Quelqu'un a vu le nouveau contenu ?",
    created_at: "2024-01-15T10:30:00Z",
    role: "VIP"
  },
  {
    id: 2,
    username: "Marie_Paris",
    content: "Oui c'est incroyable ! 🔥",
    created_at: "2024-01-15T10:32:00Z",
    role: "FREE"
  },
  {
    id: 3,
    username: "VIP_User",
    content: "Le contenu VIP de cette semaine est exceptionnel",
    created_at: "2024-01-15T10:35:00Z",
    role: "VIP"
  },
  {
    id: 4,
    username: "Finisseur_Pro",
    content: "Comment on fait pour devenir VIP ?",
    created_at: "2024-01-15T10:40:00Z",
    role: "FREE"
  },
  {
    id: 5,
    username: "Admin",
    content: "Cliquez sur 'Obtenir VIP' pour accéder au contenu premium !",
    created_at: "2024-01-15T10:42:00Z",
    role: "ADMIN"
  }
];

// Helper function to get posts by visibility and limit
export function getMockPosts(visibility: 'FREE' | 'VIP', limit: number = 5) {
  return mockPosts[visibility].slice(0, limit);
}

// Helper function to get posts by category
export function getMockPostsByCategory(categoryName: string, userRole: 'FREE' | 'VIP' | 'ADMIN' = 'FREE') {
  const allPosts = [...mockPosts.FREE, ...mockPosts.VIP];
  let filteredPosts = allPosts.filter(post => post.category === categoryName);
  
  // Filter based on user role
  if (userRole === 'FREE') {
    filteredPosts = filteredPosts.filter(post => !post.title.includes('🔒'));
  }
  
  return filteredPosts;
}
