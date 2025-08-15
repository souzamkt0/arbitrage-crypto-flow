export const communityUsers: any[] = [
  {
    id: "user-1",
    username: "cryptomaster",
    displayName: "Crypto Master",
    bio: "Especialista em trading de criptomoedas e arbitragem",
    avatar: "avatar1",
    verified: true,
    followers: 1520,
    following: 340,
    posts: 89,
    joinDate: "Janeiro 2023",
    city: "São Paulo",
    state: "SP",
    location: "São Paulo, SP",
    isFollowing: false,
    isBlocked: false,
    earnings: 3200.50,
    level: 8,
    badge: "Master"
  },
  {
    id: "user-2",
    username: "traderpro",
    displayName: "Trader Pro",
    bio: "Analista técnico e trader profissional",
    avatar: "avatar2",
    verified: true,
    followers: 890,
    following: 210,
    posts: 156,
    joinDate: "Março 2023",
    city: "Rio de Janeiro",
    state: "RJ",
    location: "Rio de Janeiro, RJ",
    isFollowing: false,
    isBlocked: false,
    earnings: 2100.25,
    level: 7,
    badge: "Expert"
  },
  {
    id: "user-3",
    username: "bitcoinbull",
    displayName: "Bitcoin Bull",
    bio: "Entusiasta Bitcoin e HODLer desde 2017",
    avatar: "avatar3",
    verified: false,
    followers: 650,
    following: 180,
    posts: 203,
    joinDate: "Maio 2023",
    city: "Belo Horizonte",
    state: "MG",
    location: "Belo Horizonte, MG",
    isFollowing: false,
    isBlocked: false,
    earnings: 1800.75,
    level: 6,
    badge: "Avançado"
  }
];

// Adicionar os usuários com códigos de referência no localStorage automaticamente
if (typeof window !== 'undefined') {
  const existingUsers = JSON.parse(localStorage.getItem("alphabit_users") || "[]");
  if (existingUsers.length === 0) {
    localStorage.setItem("alphabit_users", JSON.stringify(communityUsers));
  }
}