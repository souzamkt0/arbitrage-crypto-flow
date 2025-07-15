import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { 
  Heart, 
  MessageCircle, 
  Repeat2, 
  Share, 
  MoreHorizontal,
  CheckCircle2,
  Reply
} from "lucide-react";
import { UserProfileData } from "./UserProfile";

export interface TwitterPostData {
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
}

interface TwitterPostProps {
  post: TwitterPostData;
  onLike: (postId: string) => void;
  onRetweet: (postId: string) => void;
  onReply: (postId: string, content: string) => void;
  onUserClick: (user: UserProfileData) => void;
  currentUserId: string;
}

const TwitterPost = ({ 
  post, 
  onLike, 
  onRetweet, 
  onReply, 
  onUserClick,
  currentUserId 
}: TwitterPostProps) => {
  const [showReplyBox, setShowReplyBox] = useState(false);
  const [replyContent, setReplyContent] = useState("");

  const handleLike = () => {
    onLike(post.id);
  };

  const handleRetweet = () => {
    onRetweet(post.id);
  };

  const handleReplySubmit = () => {
    if (replyContent.trim()) {
      onReply(post.id, replyContent);
      setReplyContent("");
      setShowReplyBox(false);
    }
  };

  const getLevelColor = (level: number) => {
    if (level >= 8) return "text-yellow-500";
    if (level >= 6) return "text-purple-500";
    if (level >= 4) return "text-blue-500";
    return "text-green-500";
  };

  const formatContent = (content: string) => {
    // Processar menções e hashtags
    return content
      .replace(/@(\w+)/g, '<span class="text-primary hover:underline cursor-pointer">@$1</span>')
      .replace(/#(\w+)/g, '<span class="text-primary hover:underline cursor-pointer">#$1</span>');
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
    <div className="hover:bg-secondary/30 transition-colors">
      {post.replyTo && (
        <div className="flex items-center text-xs text-muted-foreground mb-2 pl-10 sm:pl-12">
          <Reply className="h-3 w-3 mr-1" />
          Respondendo a @{post.replyTo}
        </div>
      )}
      
      <div className="flex space-x-3">
        <div 
          className="cursor-pointer flex-shrink-0"
          onClick={() => onUserClick(post.author)}
        >
          <Avatar className="h-10 w-10 sm:h-12 sm:w-12 hover:opacity-90 transition-opacity">
            <AvatarImage src={post.author.avatar} alt={post.author.displayName} />
            <AvatarFallback>{post.author.displayName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
          </Avatar>
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-1 sm:space-x-2 flex-wrap">
            <span 
              className="font-semibold text-foreground hover:underline cursor-pointer text-sm sm:text-base truncate"
              onClick={() => onUserClick(post.author)}
            >
              {post.author.displayName}
            </span>
            
            {post.author.verified && (
              <CheckCircle2 className="h-3 w-3 sm:h-4 sm:w-4 text-blue-500 flex-shrink-0" />
            )}
            
            <span className="text-muted-foreground text-xs sm:text-sm">@{post.author.username}</span>
            
            <span className="text-muted-foreground text-xs sm:text-sm">·</span>
            
            <span className="text-muted-foreground text-xs sm:text-sm">{formatTimestamp(post.timestamp)}</span>
            
            <div className="ml-auto sm:ml-0">
              <Button variant="ghost" size="sm" className="h-6 w-6 sm:h-8 sm:w-8 p-0">
                <MoreHorizontal className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 mt-1">
            <Badge variant="outline" className={`text-xs ${getLevelColor(post.author.level)}`}>
              {post.author.badge}
            </Badge>
          </div>
          
          <div 
            className="text-foreground mt-2 leading-relaxed whitespace-pre-wrap text-sm sm:text-base"
            dangerouslySetInnerHTML={{ __html: formatContent(post.content) }}
          />
          
          <div className="flex items-center justify-between mt-3 max-w-xs sm:max-w-md">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowReplyBox(!showReplyBox)}
              className="text-muted-foreground hover:text-blue-500 hover:bg-blue-50 group p-1 sm:p-2"
            >
              <MessageCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1 group-hover:fill-blue-100" />
              <span className="text-xs sm:text-sm">{post.replies}</span>
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRetweet}
              className={`group p-1 sm:p-2 ${
                post.retweeted 
                  ? 'text-green-500 hover:text-green-600' 
                  : 'text-muted-foreground hover:text-green-500 hover:bg-green-50'
              }`}
            >
              <Repeat2 className={`h-3 w-3 sm:h-4 sm:w-4 mr-1 ${post.retweeted ? 'text-green-500' : 'group-hover:fill-green-100'}`} />
              <span className="text-xs sm:text-sm">{post.retweets}</span>
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              className={`group p-1 sm:p-2 ${
                post.liked 
                  ? 'text-red-500 hover:text-red-600' 
                  : 'text-muted-foreground hover:text-red-500 hover:bg-red-50'
              }`}
            >
              <Heart className={`h-3 w-3 sm:h-4 sm:w-4 mr-1 ${post.liked ? 'fill-current text-red-500' : 'group-hover:fill-red-100'}`} />
              <span className="text-xs sm:text-sm">{post.likes}</span>
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-blue-500 hover:bg-blue-50 group p-1 sm:p-2"
            >
              <Share className="h-3 w-3 sm:h-4 sm:w-4 group-hover:fill-blue-100" />
            </Button>
          </div>
          
          {showReplyBox && (
            <div className="mt-4 border-t border-border pt-4">
              <div className="flex space-x-2 sm:space-x-3">
                <Avatar className="h-6 w-6 sm:h-8 sm:w-8">
                  <AvatarImage src="/avatars/current-user.jpg" />
                  <AvatarFallback>TU</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <Textarea
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    placeholder={`Responder para @${post.author.username}...`}
                    className="min-h-[60px] sm:min-h-[80px] resize-none border-border text-sm"
                  />
                  <div className="flex justify-end space-x-2 mt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowReplyBox(false)}
                      className="text-xs"
                    >
                      Cancelar
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleReplySubmit}
                      disabled={!replyContent.trim()}
                      className="bg-primary hover:bg-primary/90 text-xs"
                    >
                      Responder
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TwitterPost;