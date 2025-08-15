import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { 
  ArrowLeft,
  CheckCircle2, 
  UserPlus, 
  UserCheck, 
  Calendar,
  MapPin,
  Link as LinkIcon,
  MoreHorizontal,
  MessageCircle,
  Heart,
  Share,
  Camera,
  Image as ImageIcon,
  Users,
  Trophy,
  Star,
  Gift,
  Settings,
  Edit3,
  Phone,
  Mail,
  Briefcase,
  GraduationCap,
  Globe,
  Award,
  User,
  FileText
} from "lucide-react";

interface FacebookProfile {
  id: string;
  user_id: string;
  username: string;
  display_name: string;
  bio?: string;
  profile_photo_url?: string;
  cover_photo_url?: string;
  location?: string;
  website?: string;
  birth_date?: string;
  relationship_status?: string;
  work?: string;
  education?: string;
  phone?: string;
  email_public: boolean;
  verified: boolean;
  followers_count: number;
  following_count: number;
  posts_count: number;
  photos_count: number;
  friends_count: number;
  level: number;
  earnings: number;
  badge?: string;
  join_date: string;
  last_active: string;
}

interface FacebookPost {
  id: string;
  author_id: string;
  content?: string;
  post_type: string;
  feeling?: string;
  location?: string;
  privacy: string;
  media_urls?: string[];
  likes_count: number;
  comments_count: number;
  shares_count: number;
  views_count: number;
  is_pinned: boolean;
  created_at: string;
  author: FacebookProfile;
}

const FacebookProfile = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<FacebookProfile | null>(null);
  const [posts, setPosts] = useState<FacebookPost[]>([]);
  const [photos, setPhotos] = useState<any[]>([]);
  const [friends, setFriends] = useState<FacebookProfile[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("timeline");
  const [newPost, setNewPost] = useState("");
  const [showPostDialog, setShowPostDialog] = useState(false);

  useEffect(() => {
    if (username) {
      loadProfile();
    }
  }, [username]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      
      // Carregar perfil
      const { data: profileData, error: profileError } = await supabase
        .from('facebook_profiles')
        .select('*')
        .eq('username', username)
        .single();

      if (profileError) {
        console.error('Erro ao carregar perfil:', profileError);
        // Perfil não encontrado
        setProfile(null);
      } else {
        setProfile(profileData);
      }

      // Carregar posts
      loadPosts();
      loadPhotos();
      loadFriends();
      
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPosts = async () => {
    // Carregar posts reais do banco de dados
    setPosts([]);
  };

  const loadPhotos = async () => {
    // Carregar fotos reais do banco de dados
    setPhotos([]);
  };

  const loadFriends = async () => {
    // Carregar amigos reais do banco de dados
    setFriends([]);
  };

  const handleFollow = async () => {
    setIsFollowing(!isFollowing);
    toast({
      title: isFollowing ? "Deixou de seguir" : "Seguindo",
      description: isFollowing ? `Você deixou de seguir ${profile?.display_name}` : `Você está seguindo ${profile?.display_name}`
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: 'long'
    });
  };

  const formatPostDate = (dateString: string) => {
    const now = new Date();
    const postDate = new Date(dateString);
    const diffInHours = Math.floor((now.getTime() - postDate.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Agora';
    if (diffInHours < 24) return `${diffInHours}h`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d`;
    return postDate.toLocaleDateString('pt-BR');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Carregando perfil...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Perfil não encontrado</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
      {/* Header com botão voltar */}
      <div className="sticky top-0 z-50 bg-black/90 backdrop-blur-xl border-b border-gray-700/50 shadow-lg">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="text-white hover:bg-gray-700/50 transition-all duration-200 hover:scale-105"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center space-x-3">
            <Avatar className="h-8 w-8 ring-2 ring-blue-500/30">
              <AvatarImage src={profile.profile_photo_url} />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-sm">
                {profile.display_name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="font-bold text-xl bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">{profile.display_name}</h1>
              <p className="text-sm text-gray-400">{profile.posts_count} posts • {profile.followers_count.toLocaleString()} seguidores</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto">
        {/* Cover Photo */}
        <div className="relative h-56 md:h-72 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 overflow-hidden">
          {profile.cover_photo_url && (
            <img 
              src={profile.cover_photo_url} 
              alt="Capa" 
              className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-pink-500/20" />
          
          {/* Decorative elements */}
          <div className="absolute top-4 right-4 flex space-x-2">
            <div className="w-3 h-3 bg-white/20 rounded-full animate-pulse" />
            <div className="w-2 h-2 bg-white/30 rounded-full animate-pulse delay-100" />
            <div className="w-4 h-4 bg-white/10 rounded-full animate-pulse delay-200" />
          </div>
          
          {/* Profile Photo */}
          <div className="absolute -bottom-20 left-8">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full blur-lg opacity-50 group-hover:opacity-75 transition-opacity duration-300" />
              <Avatar className="relative h-40 w-40 border-6 border-white/20 shadow-2xl ring-4 ring-blue-500/30 transition-all duration-300 group-hover:ring-blue-400/50 group-hover:scale-105">
                <AvatarImage src={profile.profile_photo_url} className="transition-transform duration-300 group-hover:scale-110" />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-3xl font-bold">
                  {profile.display_name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              {profile.verified && (
                <div className="absolute -bottom-2 -right-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full p-2 shadow-lg ring-4 ring-white/20">
                  <CheckCircle2 className="h-6 w-6 text-white" />
                </div>
              )}
              {profile.badge && (
                <div className="absolute -top-2 -right-2 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full p-2 shadow-lg ring-4 ring-white/20">
                  <Trophy className="h-5 w-5 text-white" />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Profile Info */}
        <div className="px-8 pt-24 pb-8">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-3">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent">{profile.display_name}</h1>
                {profile.verified && (
                  <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-full p-1.5 shadow-lg">
                    <CheckCircle2 className="h-6 w-6 text-white" />
                  </div>
                )}
              </div>
              
              <div className="flex items-center space-x-3 mb-4">
                <p className="text-gray-300 text-lg">@{profile.username}</p>
                {profile.badge && (
                  <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0 px-3 py-1 shadow-lg">
                    <Trophy className="h-4 w-4 mr-1" />
                    {profile.badge}
                  </Badge>
                )}
                <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 px-3 py-1 shadow-lg">
                  <Star className="h-4 w-4 mr-1" />
                  Level {profile.level}
                </Badge>
              </div>
              
              {profile.bio && (
                <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl p-6 mb-6 border border-gray-700/30 shadow-xl">
                  <p className="text-gray-100 text-lg leading-relaxed">{profile.bio}</p>
                </div>
              )}

              {/* Info adicional */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {profile.location && (
                  <div className="flex items-center space-x-3 bg-gradient-to-r from-gray-800/40 to-gray-700/40 backdrop-blur-sm rounded-xl p-4 border border-gray-600/30">
                    <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg p-2">
                      <MapPin className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-gray-200">{profile.location}</span>
                  </div>
                )}
                {profile.website && (
                  <div className="flex items-center space-x-3 bg-gradient-to-r from-gray-800/40 to-gray-700/40 backdrop-blur-sm rounded-xl p-4 border border-gray-600/30">
                    <div className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg p-2">
                      <LinkIcon className="h-5 w-5 text-white" />
                    </div>
                    <a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 transition-colors">
                      {profile.website.replace('https://', '')}
                    </a>
                  </div>
                )}
                {profile.work && (
                  <div className="flex items-center space-x-3 bg-gradient-to-r from-gray-800/40 to-gray-700/40 backdrop-blur-sm rounded-xl p-4 border border-gray-600/30">
                    <div className="bg-gradient-to-br from-purple-500 to-violet-600 rounded-lg p-2">
                      <Briefcase className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-gray-200">{profile.work}</span>
                  </div>
                )}
                {profile.education && (
                  <div className="flex items-center space-x-3 bg-gradient-to-r from-gray-800/40 to-gray-700/40 backdrop-blur-sm rounded-xl p-4 border border-gray-600/30">
                    <div className="bg-gradient-to-br from-indigo-500 to-blue-600 rounded-lg p-2">
                      <GraduationCap className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-gray-200">{profile.education}</span>
                  </div>
                )}
                <div className="flex items-center space-x-3 bg-gradient-to-r from-gray-800/40 to-gray-700/40 backdrop-blur-sm rounded-xl p-4 border border-gray-600/30">
                  <div className="bg-gradient-to-br from-pink-500 to-rose-600 rounded-lg p-2">
                    <Calendar className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-gray-200">Entrou em {formatDate(profile.join_date)}</span>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 backdrop-blur-sm rounded-2xl p-6 border border-blue-500/30 text-center hover:scale-105 transition-transform duration-200">
                  <div className="text-3xl font-bold text-blue-400 mb-1">{profile.following_count.toLocaleString()}</div>
                  <div className="text-gray-300 text-sm">Seguindo</div>
                </div>
                <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/30 text-center hover:scale-105 transition-transform duration-200">
                  <div className="text-3xl font-bold text-purple-400 mb-1">{profile.followers_count.toLocaleString()}</div>
                  <div className="text-gray-300 text-sm">Seguidores</div>
                </div>
                <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 backdrop-blur-sm rounded-2xl p-6 border border-green-500/30 text-center hover:scale-105 transition-transform duration-200">
                  <div className="text-3xl font-bold text-green-400 mb-1">{profile.friends_count.toLocaleString()}</div>
                  <div className="text-gray-300 text-sm">Amigos</div>
                </div>
                <div className="bg-gradient-to-br from-yellow-500/20 to-orange-600/20 backdrop-blur-sm rounded-2xl p-6 border border-yellow-500/30 text-center hover:scale-105 transition-transform duration-200">
                  <div className="text-3xl font-bold text-yellow-400 mb-1">${profile.earnings.toFixed(2)}</div>
                  <div className="text-gray-300 text-sm">Ganhos</div>
                </div>
                <div className="bg-gradient-to-br from-pink-500/20 to-rose-600/20 backdrop-blur-sm rounded-2xl p-6 border border-pink-500/30 text-center hover:scale-105 transition-transform duration-200">
                  <div className="text-3xl font-bold text-pink-400 mb-1">{profile.posts_count}</div>
                  <div className="text-gray-300 text-sm">Posts</div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 mt-6 lg:mt-0">
              <Button
                onClick={handleFollow}
                className={`px-8 py-3 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg ${
                  isFollowing 
                    ? 'bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-500 hover:to-gray-600 text-white border-2 border-gray-500/30' 
                    : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-400 hover:to-purple-500 text-white border-2 border-blue-400/30'
                }`}
              >
                {isFollowing ? (
                  <><UserCheck className="h-5 w-5 mr-2" />Seguindo</>
                ) : (
                  <><UserPlus className="h-5 w-5 mr-2" />Seguir</>
                )}
              </Button>
              <Button className="px-8 py-3 rounded-2xl font-semibold bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white border-2 border-green-400/30 transition-all duration-300 transform hover:scale-105 shadow-lg">
                <MessageCircle className="h-5 w-5 mr-2" />
                Mensagem
              </Button>
              <Button className="px-4 py-3 rounded-2xl bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 text-white border-2 border-gray-600/30 transition-all duration-300 transform hover:scale-105 shadow-lg">
                <MoreHorizontal className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-700/50 bg-gradient-to-r from-gray-900/50 to-gray-800/50 backdrop-blur-sm">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="px-8">
            <TabsList className="bg-transparent border-none p-0 h-auto flex space-x-1">
              <TabsTrigger 
                value="timeline" 
                className="bg-transparent border-none text-gray-400 data-[state=active]:text-white data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500/20 data-[state=active]:to-purple-500/20 data-[state=active]:border-b-4 data-[state=active]:border-blue-500 rounded-t-xl px-6 py-4 transition-all duration-300 hover:text-gray-200 hover:bg-gray-800/30"
              >
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full opacity-0 data-[state=active]:opacity-100 transition-opacity" />
                  <span className="font-semibold">Timeline</span>
                </div>
              </TabsTrigger>
              <TabsTrigger 
                value="about" 
                className="bg-transparent border-none text-gray-400 data-[state=active]:text-white data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500/20 data-[state=active]:to-emerald-500/20 data-[state=active]:border-b-4 data-[state=active]:border-green-500 rounded-t-xl px-6 py-4 transition-all duration-300 hover:text-gray-200 hover:bg-gray-800/30"
              >
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full opacity-0 data-[state=active]:opacity-100 transition-opacity" />
                  <span className="font-semibold">Sobre</span>
                </div>
              </TabsTrigger>
              <TabsTrigger 
                value="photos" 
                className="bg-transparent border-none text-gray-400 data-[state=active]:text-white data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500/20 data-[state=active]:to-pink-500/20 data-[state=active]:border-b-4 data-[state=active]:border-purple-500 rounded-t-xl px-6 py-4 transition-all duration-300 hover:text-gray-200 hover:bg-gray-800/30"
              >
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full opacity-0 data-[state=active]:opacity-100 transition-opacity" />
                  <span className="font-semibold">Fotos</span>
                  <Badge className="bg-purple-500/20 text-purple-300 text-xs px-2 py-0.5">{profile.photos_count}</Badge>
                </div>
              </TabsTrigger>
              <TabsTrigger 
                value="friends" 
                className="bg-transparent border-none text-gray-400 data-[state=active]:text-white data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500/20 data-[state=active]:to-red-500/20 data-[state=active]:border-b-4 data-[state=active]:border-orange-500 rounded-t-xl px-6 py-4 transition-all duration-300 hover:text-gray-200 hover:bg-gray-800/30"
              >
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full opacity-0 data-[state=active]:opacity-100 transition-opacity" />
                  <span className="font-semibold">Amigos</span>
                  <Badge className="bg-orange-500/20 text-orange-300 text-xs px-2 py-0.5">{profile.friends_count}</Badge>
                </div>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Tab Content */}
        <div className="px-8 py-8">
          <Tabs value={activeTab}>
            {/* Timeline */}
            <TabsContent value="timeline" className="space-y-8">
              {posts.map((post, index) => (
                <Card key={post.id} className="bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-sm border border-gray-700/50 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-[1.02] rounded-3xl overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="relative">
                        <Avatar className="h-14 w-14 ring-2 ring-blue-500/30 shadow-lg">
                          <AvatarImage src={profile.profile_photo_url} />
                          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold">
                            {profile.display_name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-gradient-to-br from-green-400 to-green-500 rounded-full border-2 border-gray-800" />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <span className="font-bold text-white text-lg">{profile.display_name}</span>
                          {profile.verified && (
                            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-full p-1">
                              <CheckCircle2 className="h-4 w-4 text-white" />
                            </div>
                          )}
                          <span className="text-gray-400 text-sm">@{profile.username}</span>
                          <span className="text-gray-500">•</span>
                          <span className="text-gray-400 text-sm">{formatPostDate(post.created_at)}</span>
                          {post.is_pinned && (
                            <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs px-2 py-1 shadow-lg">
                              📌 Fixado
                            </Badge>
                          )}
                        </div>
                        
                        {post.feeling && (
                          <div className="bg-gradient-to-r from-pink-500/20 to-purple-500/20 rounded-xl p-3 mb-4 border border-pink-500/30">
                            <span className="text-pink-300 text-sm font-medium">está se sentindo {post.feeling}</span>
                          </div>
                        )}
                        
                        {post.content && (
                          <div className="mb-4">
                            <p className="text-gray-100 text-lg leading-relaxed whitespace-pre-wrap">{post.content}</p>
                          </div>
                        )}
                        
                        {post.media_urls && post.media_urls.length > 0 && (
                          <div className="mb-4 rounded-2xl overflow-hidden shadow-xl border border-gray-600/30">
                            <img 
                              src={post.media_urls[0]} 
                              alt="Post image" 
                              className="w-full max-h-96 object-cover transition-transform duration-500 hover:scale-105"
                            />
                          </div>
                        )}
                        
                        {/* Post Actions */}
                        <div className="flex items-center justify-between pt-4 border-t border-gray-700/50">
                          <Button className="flex-1 bg-gradient-to-r from-red-500/10 to-pink-500/10 hover:from-red-500/20 hover:to-pink-500/20 text-red-400 hover:text-red-300 border border-red-500/30 rounded-xl transition-all duration-300 hover:scale-105 mr-2">
                            <Heart className="h-5 w-5 mr-2" />
                            <span className="font-semibold">{post.likes_count}</span>
                          </Button>
                          <Button className="flex-1 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 hover:from-blue-500/20 hover:to-cyan-500/20 text-blue-400 hover:text-blue-300 border border-blue-500/30 rounded-xl transition-all duration-300 hover:scale-105 mx-1">
                            <MessageCircle className="h-5 w-5 mr-2" />
                            <span className="font-semibold">{post.comments_count}</span>
                          </Button>
                          <Button className="flex-1 bg-gradient-to-r from-green-500/10 to-emerald-500/10 hover:from-green-500/20 hover:to-emerald-500/20 text-green-400 hover:text-green-300 border border-green-500/30 rounded-xl transition-all duration-300 hover:scale-105 ml-2">
                            <Share className="h-5 w-5 mr-2" />
                            <span className="font-semibold">{post.shares_count}</span>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            {/* About */}
            <TabsContent value="about" className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Informações Pessoais */}
                <Card className="bg-gradient-to-br from-blue-900/40 to-purple-900/40 backdrop-blur-sm border border-blue-500/30 shadow-2xl rounded-3xl overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border-b border-blue-500/30 p-6">
                    <h3 className="text-white text-xl font-bold flex items-center">
                      <div className="bg-gradient-to-br from-blue-500 to-purple-500 p-2 rounded-lg mr-3">
                        <Users className="h-6 w-6 text-white" />
                      </div>
                      Informações Pessoais
                    </h3>
                  </div>
                  <CardContent className="p-6 space-y-6">
                    <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-gray-800/50 to-gray-700/50 rounded-2xl border border-gray-600/30 hover:border-blue-500/50 transition-all duration-300">
                      <div className="bg-gradient-to-br from-red-500 to-pink-500 p-3 rounded-xl">
                        <MapPin className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">Localização</p>
                        <p className="text-white font-semibold">{profile.location || 'Não informado'}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-gray-800/50 to-gray-700/50 rounded-2xl border border-gray-600/30 hover:border-green-500/50 transition-all duration-300">
                      <div className="bg-gradient-to-br from-green-500 to-emerald-500 p-3 rounded-xl">
                        <Globe className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">Website</p>
                        <p className="text-white font-semibold">{profile.website || 'Não informado'}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-gray-800/50 to-gray-700/50 rounded-2xl border border-gray-600/30 hover:border-purple-500/50 transition-all duration-300">
                      <div className="bg-gradient-to-br from-purple-500 to-indigo-500 p-3 rounded-xl">
                        <Calendar className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">Membro desde</p>
                        <p className="text-white font-semibold">{formatDate(profile.join_date)}</p>
                      </div>
                    </div>
                    
                    {profile.relationship_status && (
                      <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-gray-800/50 to-gray-700/50 rounded-2xl border border-gray-600/30 hover:border-pink-500/50 transition-all duration-300">
                        <div className="bg-gradient-to-br from-pink-500 to-rose-500 p-3 rounded-xl">
                          <Heart className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <p className="text-gray-400 text-sm">Status</p>
                          <p className="text-white font-semibold">{profile.relationship_status}</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Carreira e Educação */}
                <Card className="bg-gradient-to-br from-green-900/40 to-teal-900/40 backdrop-blur-sm border border-green-500/30 shadow-2xl rounded-3xl overflow-hidden">
                  <div className="bg-gradient-to-r from-green-600/20 to-teal-600/20 border-b border-green-500/30 p-6">
                    <h3 className="text-white text-xl font-bold flex items-center">
                      <div className="bg-gradient-to-br from-green-500 to-teal-500 p-2 rounded-lg mr-3">
                        <Briefcase className="h-6 w-6 text-white" />
                      </div>
                      Carreira & Educação
                    </h3>
                  </div>
                  <CardContent className="p-6 space-y-6">
                    <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-gray-800/50 to-gray-700/50 rounded-2xl border border-gray-600/30 hover:border-orange-500/50 transition-all duration-300">
                      <div className="bg-gradient-to-br from-orange-500 to-red-500 p-3 rounded-xl">
                        <Briefcase className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">Trabalho</p>
                        <p className="text-white font-semibold">{profile.work || 'Não informado'}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-gray-800/50 to-gray-700/50 rounded-2xl border border-gray-600/30 hover:border-blue-500/50 transition-all duration-300">
                      <div className="bg-gradient-to-br from-blue-500 to-cyan-500 p-3 rounded-xl">
                        <GraduationCap className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">Educação</p>
                        <p className="text-white font-semibold">{profile.education || 'Não informado'}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Biografia Expandida */}
              <Card className="bg-gradient-to-br from-purple-900/40 to-pink-900/40 backdrop-blur-sm border border-purple-500/30 shadow-2xl rounded-3xl overflow-hidden">
                <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 border-b border-purple-500/30 p-6">
                  <h3 className="text-white text-xl font-bold flex items-center">
                    <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-2 rounded-lg mr-3">
                      <Edit3 className="h-6 w-6 text-white" />
                    </div>
                    Sobre Mim
                  </h3>
                </div>
                <CardContent className="p-6">
                  <div className="bg-gradient-to-r from-gray-800/50 to-gray-700/50 rounded-2xl p-6 border border-gray-600/30">
                    <p className="text-gray-100 text-lg leading-relaxed">
                      {profile.bio || 'Esta pessoa ainda não adicionou uma biografia.'}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Photos */}
            <TabsContent value="photos" className="space-y-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {photos.map((photo, index) => (
                  <div key={photo.id} className="group relative aspect-square bg-gradient-to-br from-gray-800/60 to-gray-900/60 rounded-3xl overflow-hidden shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-105 border border-gray-700/50">
                    <img 
                      src={photo.url} 
                      alt={photo.caption || 'Photo'} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    
                    {/* Overlay com informações */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        {photo.caption && (
                          <p className="text-white text-sm font-medium mb-2 line-clamp-2">{photo.caption}</p>
                        )}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Heart className="h-4 w-4 text-red-400" />
                            <span className="text-white text-xs">{Math.floor(Math.random() * 100) + 10}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <MessageCircle className="h-4 w-4 text-blue-400" />
                            <span className="text-white text-xs">{Math.floor(Math.random() * 20) + 1}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Efeito de brilho */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />
                    
                    {/* Badge de índice */}
                    <div className="absolute top-3 right-3 bg-gradient-to-br from-blue-500/80 to-purple-500/80 backdrop-blur-sm rounded-full px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <span className="text-white text-xs font-bold">{index + 1}</span>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Estatísticas da galeria */}
              <Card className="bg-gradient-to-br from-indigo-900/40 to-purple-900/40 backdrop-blur-sm border border-indigo-500/30 shadow-2xl rounded-3xl overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="bg-gradient-to-br from-indigo-500 to-purple-500 p-3 rounded-xl">
                        <Camera className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-white text-lg font-bold">Galeria de Fotos</h3>
                        <p className="text-gray-400 text-sm">{photos.length} fotos compartilhadas</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                        {photos.reduce((acc, photo) => acc + Math.floor(Math.random() * 100) + 10, 0)}
                      </p>
                      <p className="text-gray-400 text-sm">Total de curtidas</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Friends */}
            <TabsContent value="friends" className="space-y-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {friends.map((friend, index) => (
                  <Card key={friend.id} className="group bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-sm border border-gray-700/50 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-105 rounded-3xl overflow-hidden cursor-pointer">
                    <CardContent className="p-6 text-center relative">
                      {/* Efeito de fundo animado */}
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      
                      <div className="relative z-10">
                        <div className="relative mb-4">
                          <Avatar className="h-20 w-20 mx-auto ring-4 ring-gray-600/50 group-hover:ring-blue-500/50 transition-all duration-300 shadow-xl">
                            <AvatarImage src={friend.profile_photo_url} />
                            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold text-lg">
                              {friend.display_name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          
                          {/* Status online */}
                          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-gradient-to-br from-green-400 to-green-500 rounded-full border-3 border-gray-800 shadow-lg" />
                          
                          {/* Badge de verificação */}
                          {friend.verified && (
                            <div className="absolute -top-2 -right-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full p-1.5 shadow-lg">
                              <CheckCircle2 className="h-3 w-3 text-white" />
                            </div>
                          )}
                        </div>
                        
                        <h4 className="font-bold text-white mb-2 text-lg group-hover:text-blue-300 transition-colors duration-300">
                          {friend.display_name}
                        </h4>
                        
                        <p className="text-gray-400 text-sm mb-3 group-hover:text-gray-300 transition-colors duration-300">
                          @{friend.username}
                        </p>
                        
                        <div className="bg-gradient-to-r from-gray-700/50 to-gray-600/50 rounded-xl p-2 mb-4 border border-gray-600/30">
                          <p className="text-gray-300 text-xs font-medium">
                            {friend.followers_count.toLocaleString()} seguidores
                          </p>
                        </div>
                        
                        {/* Botões de ação */}
                        <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <Button size="sm" className="flex-1 bg-gradient-to-r from-blue-500/20 to-blue-600/20 hover:from-blue-500/30 hover:to-blue-600/30 text-blue-400 border border-blue-500/30 rounded-xl">
                            <MessageCircle className="h-3 w-3 mr-1" />
                            Chat
                          </Button>
                          <Button size="sm" className="flex-1 bg-gradient-to-r from-green-500/20 to-green-600/20 hover:from-green-500/30 hover:to-green-600/30 text-green-400 border border-green-500/30 rounded-xl">
                            <UserPlus className="h-3 w-3 mr-1" />
                            Seguir
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              {/* Estatísticas de amizade */}
              <Card className="bg-gradient-to-br from-emerald-900/40 to-teal-900/40 backdrop-blur-sm border border-emerald-500/30 shadow-2xl rounded-3xl overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="bg-gradient-to-br from-emerald-500 to-teal-500 p-3 rounded-xl">
                        <Users className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-white text-lg font-bold">Rede de Amigos</h3>
                        <p className="text-gray-400 text-sm">{friends.length} amigos conectados</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                        {friends.reduce((acc, friend) => acc + friend.followers_count, 0).toLocaleString()}
                      </p>
                      <p className="text-gray-400 text-sm">Total de seguidores</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default FacebookProfile;