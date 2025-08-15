import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Heart, 
  MessageCircle, 
  Repeat2, 
  Share, 
  MoreHorizontal,
  CheckCircle2,
  Reply,
  Edit,
  Trash2
} from "lucide-react";

// Interfaces
interface UserProfileData {
  id: string;
  username: string;
  displayName: string;
  avatar: string;
  verified: boolean;
  level: number;
  badge: string;
}

interface TwitterPostData {
  id: string;
  author: UserProfileData;
  content: string;
  timestamp: string;
  likes: number;
  retweets: number;
  replies: number;
  shares: number;
  liked: boolean;
  retweeted: boolean;
  mentions?: string[];
  hashtags?: string[];
  replyTo?: string;
  imageUrl?: string;
}

interface TwitterPostProps {
  post: TwitterPostData;
  onLike: (postId: string) => void;
  onRetweet: (postId: string) => void;
  onReply: (postId: string, content: string) => void;
  onUserClick: (user: UserProfileData) => void;
  onEdit?: (postId: string, newContent: string) => void;
  onDelete?: (postId: string) => void;
  onDeleteImage?: (postId: string) => void;
  currentUserId: string;
  canEdit?: boolean;
  canDelete?: boolean;
}

// Componente TwitterPost
const TwitterPost = ({ 
  post, 
  onLike, 
  onRetweet, 
  onReply, 
  onUserClick,
  onEdit,
  onDelete,
  onDeleteImage,
  currentUserId,
  canEdit = false,
  canDelete = false
}: TwitterPostProps) => {
  // Validação de segurança para o post
  if (!post || !post.id || !post.author) {
    return (
      <Card className="bg-gray-900 border-gray-700">
        <CardContent className="p-4">
          <div className="text-center text-gray-500 text-sm">
            Post inválido ou dados ausentes
          </div>
        </CardContent>
      </Card>
    );
  }

  // Garantir que o autor tenha dados válidos
  const safeAuthor = {
    id: post.author.id || 'unknown',
    username: post.author.username || 'usuario',
    displayName: post.author.displayName || 'Usuário',
    avatar: post.author.avatar || '',
    verified: post.author.verified || false,
    level: post.author.level || 1,
    badge: post.author.badge || 'Iniciante'
  };

  // Garantir que os dados numéricos sejam válidos
  const safePost = {
    ...post,
    author: safeAuthor,
    content: post.content || '',
    timestamp: post.timestamp || 'agora',
    likes: Math.max(0, post.likes || 0),
    retweets: Math.max(0, post.retweets || 0),
    replies: Math.max(0, post.replies || 0),
    shares: Math.max(0, post.shares || 0),
    liked: post.liked || false,
    retweeted: post.retweeted || false
  };
  const [showReplyBox, setShowReplyBox] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(safePost.content);

  const handleLike = () => {
    onLike(safePost.id);
  };

  const handleRetweet = () => {
    onRetweet(safePost.id);
  };

  const handleReplySubmit = () => {
    if (replyContent.trim()) {
      onReply(safePost.id, replyContent);
      setReplyContent("");
      setShowReplyBox(false);
    }
  };

  const handleEditSubmit = () => {
    if (editContent.trim() && onEdit) {
      onEdit(safePost.id, editContent);
      setIsEditing(false);
    }
  };

  const handleEditCancel = () => {
    setEditContent(safePost.content);
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (onDelete && window.confirm('Tem certeza que deseja deletar este post?')) {
      onDelete(safePost.id);
    }
  };

  const getLevelColor = (level: number) => {
    if (level >= 8) return "text-yellow-500";
    if (level >= 6) return "text-purple-500";
    if (level >= 4) return "text-blue-500";
    return "text-green-500";
  };

  const formatContent = (content: string) => {
    return content
      .replace(/@(\w+)/g, '<span class="text-blue-400 hover:underline cursor-pointer">@$1</span>')
      .replace(/#(\w+)/g, '<span class="text-blue-400 hover:underline cursor-pointer">#$1</span>');
  };

  const formatTimestamp = (timestamp: string) => {
    if (timestamp === "agora") return "agora";
    
    const now = new Date();
    const postTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - postTime.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return "agora";
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`;
    return `${Math.floor(diffInMinutes / 1440)}d`;
  };

  return (
    <Card className="bg-gray-900 border-gray-700 text-white">
      <CardContent className="p-0">
        <div className="relative">
          {safePost.replyTo && (
              <div className="flex items-center space-x-2 mb-3 text-sm text-gray-500 px-4 pt-3">
                <Reply className="h-3 w-3" />
                <span>Respondendo a {safePost.replyTo}</span>
              </div>
            )}
          
          {isEditing && (
            <div className="absolute top-2 right-2 bg-yellow-500 text-black text-xs px-2 py-1 rounded-full font-semibold z-10">
              Editando
            </div>
          )}
          
          {/* Header do Post */}
          <div className={`flex items-center space-x-2 sm:space-x-3 mb-3 p-3 sm:p-4 ${isEditing ? 'bg-yellow-900/10 border-b border-yellow-500/20' : ''}`}>
            <div 
              className="cursor-pointer flex-shrink-0"
              onClick={() => onUserClick(safePost.author)}
            >
              <Avatar className="h-10 w-10 hover:opacity-80 transition-opacity">
                <AvatarImage src={safePost.author.avatar} alt={safePost.author.displayName} />
                <AvatarFallback className="bg-gray-700 text-white">{safePost.author.displayName.split(' ').map(n => n[0]).join('').substring(0, 2)}</AvatarFallback>
              </Avatar>
            </div>
            
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <span 
                  className="font-semibold text-white hover:underline cursor-pointer"
                  onClick={() => onUserClick(safePost.author)}
                >
                  {safePost.author.displayName}
                </span>
                {safePost.author.verified && <CheckCircle2 className="h-4 w-4 text-blue-400" />}
                <Badge variant="outline" className={`text-xs ${getLevelColor(safePost.author.level)} border-current px-2 py-0.5 text-yellow-400 border-yellow-400`}>
                  {safePost.author.badge}
                </Badge>
              </div>
              <div className="flex items-center space-x-1 text-sm text-gray-400">
                <span>{formatTimestamp(safePost.timestamp)}</span>
                <span>·</span>
                <span>🌐</span>
              </div>
            </div>
            
            {/* MENU DROPDOWN COM BOTÕES EDITAR E EXCLUIR */}
            {(canEdit || canDelete) && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-400 hover:text-white hover:bg-gray-700 rounded-full p-2 transition-all duration-200 border border-transparent hover:border-gray-600"
                  >
                    <MoreHorizontal className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent 
                  align="end" 
                  className="bg-gray-900 border-gray-600 shadow-xl min-w-[140px] p-1"
                  sideOffset={5}
                >
                  {canEdit && (
                    <DropdownMenuItem 
                      onClick={() => setIsEditing(true)}
                      className="text-gray-200 hover:bg-gray-700 hover:text-white cursor-pointer rounded-md px-3 py-2 text-sm font-medium transition-colors duration-150 flex items-center gap-2"
                    >
                      <Edit className="h-4 w-4" />
                      Editar
                    </DropdownMenuItem>
                  )}
                  {canDelete && (
                    <DropdownMenuItem 
                      onClick={handleDelete}
                      className="text-red-400 hover:bg-red-900/30 hover:text-red-300 cursor-pointer rounded-md px-3 py-2 text-sm font-medium transition-colors duration-150 flex items-center gap-2"
                    >
                      <Trash2 className="h-4 w-4" />
                      Deletar
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
          
          {/* Conteúdo do Post */}
          <div className="mb-4 px-3 sm:px-4">
            {isEditing ? (
              <div className="space-y-3 animate-in fade-in-0 duration-300">
                <Textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="min-h-[100px] resize-none border-2 border-gray-600 focus-visible:ring-2 focus-visible:ring-yellow-500 focus-visible:border-yellow-500 rounded-lg bg-gray-800 text-white placeholder-gray-400 text-sm transition-all duration-200"
                  placeholder="O que você está pensando?"
                  maxLength={500}
                  autoFocus
                />
                <div className="flex justify-between items-center">
                  <span className={`text-xs transition-colors duration-200 ${
                    editContent.length > 450 ? 'text-red-400' : 
                    editContent.length > 400 ? 'text-yellow-400' : 'text-gray-400'
                  }`}>
                    {editContent.length}/500
                  </span>
                  <div className="space-x-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={handleEditCancel}
                      className="text-gray-300 hover:bg-gray-700 hover:text-white text-xs px-4 py-2 transition-all duration-200 hover:scale-105"
                    >
                      Cancelar
                    </Button>
                    <Button 
                      size="sm" 
                      onClick={handleEditSubmit}
                      disabled={!editContent.trim() || editContent === safePost.content}
                      className="bg-yellow-600 hover:bg-yellow-700 text-black font-semibold text-xs px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105 disabled:hover:scale-100"
                    >
                      Salvar
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div 
                className="text-white text-sm sm:text-base leading-relaxed whitespace-pre-wrap break-words"
                dangerouslySetInnerHTML={{ __html: formatContent(safePost.content) }}
              />
            )}
          </div>
          
          {/* Exibir imagem se existir */}
          {safePost.imageUrl && (
            <div className="mb-4 mx-3 sm:mx-4 rounded-lg overflow-hidden border border-gray-700 relative group">
              <img 
                src={safePost.imageUrl} 
                alt="Imagem do post" 
                className="w-full max-h-96 object-contain bg-gray-800 cursor-pointer hover:opacity-95 transition-opacity"
                onClick={() => window.open(safePost.imageUrl, '_blank')}
              />
              {/* Menu de opções da imagem */}
              {(canEdit || canDelete) && (
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="bg-black/60 hover:bg-black/80 text-white rounded-full p-2 h-8 w-8 backdrop-blur-sm border border-white/20 hover:border-white/40 transition-all duration-200"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent 
                      align="end" 
                      className="bg-gray-900 border-gray-600 shadow-xl min-w-[140px] p-1"
                      sideOffset={5}
                    >
                      <DropdownMenuItem 
                        onClick={() => {
                          if (window.confirm('Tem certeza que deseja excluir esta foto?')) {
                            onDeleteImage?.(safePost.id);
                          }
                        }}
                        className="text-red-400 hover:bg-red-900/30 hover:text-red-300 cursor-pointer rounded-md px-3 py-2 text-sm font-medium transition-colors duration-150 flex items-center gap-2"
                      >
                        <Trash2 className="h-4 w-4" />
                        Excluir foto
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )}
            </div>
          )}
          
          {/* Botões de Interação */}
          <div className="border-t border-gray-800 pt-3 mx-3 sm:mx-4">
            <div className="flex items-center justify-around gap-1">
              <Button
                variant="ghost"
                size="sm"
                className={`flex items-center space-x-1 sm:space-x-2 rounded-lg px-2 sm:px-4 py-2.5 flex-1 justify-center transition-all duration-200 hover:scale-105 ${
                  showReplyBox 
                    ? 'text-blue-400 bg-blue-900/20 hover:bg-blue-900/30' 
                    : 'text-gray-300 hover:bg-gray-800 hover:text-blue-400'
                }`}
                onClick={() => setShowReplyBox(!showReplyBox)}
              >
                <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="text-xs sm:text-sm font-medium hidden sm:inline">Comentar</span>
                {safePost.replies > 0 && <span className="text-xs sm:text-sm font-semibold">({safePost.replies})</span>}
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                className={`flex items-center space-x-1 sm:space-x-2 rounded-lg px-2 sm:px-4 py-2.5 flex-1 justify-center transition-all duration-200 hover:scale-105 ${
                  safePost.retweeted 
                    ? 'text-green-400 bg-green-900/20 hover:bg-green-900/30' 
                    : 'text-gray-300 hover:bg-gray-800 hover:text-green-400'
                }`}
                onClick={handleRetweet}
              >
                <Repeat2 className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="text-xs sm:text-sm font-medium hidden sm:inline">Compartilhar</span>
                {safePost.retweets > 0 && <span className="text-xs sm:text-sm font-semibold">({safePost.retweets})</span>}
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                className={`flex items-center space-x-1 sm:space-x-2 rounded-lg px-2 sm:px-4 py-2.5 flex-1 justify-center transition-all duration-200 hover:scale-105 ${
                  safePost.liked 
                    ? 'text-red-400 bg-red-900/20 hover:bg-red-900/30' 
                    : 'text-gray-300 hover:bg-gray-800 hover:text-red-400'
                }`}
                onClick={handleLike}
              >
                <Heart className={`h-4 w-4 sm:h-5 sm:w-5 transition-all duration-200 ${safePost.liked ? 'fill-current scale-110' : ''}`} />
                <span className="text-xs sm:text-sm font-medium hidden sm:inline">Curtir</span>
                {safePost.likes > 0 && <span className="text-xs sm:text-sm font-semibold">({safePost.likes})</span>}
              </Button>
              
              {canDelete && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center space-x-1 sm:space-x-2 rounded-lg px-2 sm:px-4 py-2.5 flex-1 justify-center transition-all duration-200 hover:scale-105 text-gray-300 hover:bg-gray-800 hover:text-red-400"
                  onClick={handleDelete}
                >
                  <Trash2 className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="text-xs sm:text-sm font-medium hidden sm:inline">Apagar</span>
                </Button>
              )}
            </div>
          </div>
          
          {showReplyBox && (
             <div className="mt-4 pt-4 border-t border-gray-800 mx-3 sm:mx-4 pb-4">
               <div className="flex space-x-2 sm:space-x-3">
                 <Avatar className="h-7 w-7 sm:h-8 sm:w-8">
                   <AvatarImage src="/avatars/current-user.jpg" />
                   <AvatarFallback className="bg-gray-700 text-white text-xs">TU</AvatarFallback>
                 </Avatar>
                 <div className="flex-1">
                   <Textarea
                     value={replyContent}
                     onChange={(e) => setReplyContent(e.target.value)}
                     placeholder={`Escreva um comentário...`}
                     className="min-h-[50px] sm:min-h-[60px] resize-none border border-gray-600 focus-visible:ring-1 focus-visible:ring-yellow-500 focus-visible:border-yellow-500 rounded-lg bg-gray-800 text-white placeholder-gray-400 text-sm"
                     maxLength={280}
                   />
                   <div className="flex justify-between items-center mt-2">
                     <span className="text-xs text-gray-400">{replyContent.length}/280</span>
                     <div className="space-x-1 sm:space-x-2">
                       <Button 
                         variant="ghost" 
                         size="sm" 
                         onClick={() => setShowReplyBox(false)}
                         className="text-gray-300 hover:bg-gray-700 hover:text-white text-xs sm:text-sm px-2 sm:px-3"
                       >
                         Cancelar
                       </Button>
                       <Button 
                         size="sm" 
                         onClick={handleReplySubmit}
                         disabled={!replyContent.trim()}
                         className="bg-yellow-600 hover:bg-yellow-700 text-black font-semibold text-xs sm:text-sm px-2 sm:px-3"
                       >
                         Comentar
                       </Button>
                     </div>
                   </div>
                 </div>
               </div>
             </div>
           )}
        </div>
      </CardContent>
    </Card>
  );
};



export default TwitterPost;
export type { TwitterPostData, UserProfileData };