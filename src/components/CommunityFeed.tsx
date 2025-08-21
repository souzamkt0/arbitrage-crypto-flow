import React from 'react';
import { Users, Image, Trash2, Edit, Check, X, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

interface CommunityMessage {
  id: string;
  user: string;
  avatar: string;
  message: string;
  imageUrl?: string;
  time: string;
  likes: number;
  isVerified: boolean;
  createdAt: string;
}

interface CommunityFeedProps {
  communityMessages: CommunityMessage[];
  hasNewMessages: boolean;
  editingUserName: string | null;
  editingUserNameValue: string;
  setEditingUserName: (id: string | null) => void;
  setEditingUserNameValue: (value: string) => void;
  handleEditCommunityUserName: (id: string, name: string) => void;
  handleDeleteCommunityPost: (id: string) => void;
  handleDeleteCommunityImage: (id: string) => void;
  loadCommunityMessages: () => void;
  onUserClick: (user: string) => void;
}

export const CommunityFeed: React.FC<CommunityFeedProps> = ({
  communityMessages,
  hasNewMessages,
  editingUserName,
  editingUserNameValue,
  setEditingUserName,
  setEditingUserNameValue,
  handleEditCommunityUserName,
  handleDeleteCommunityPost,
  handleDeleteCommunityImage,
  loadCommunityMessages,
  onUserClick
}) => {
  return (
    <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 rounded-xl border border-blue-500/20 p-6 backdrop-blur-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
            <Users className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Community Feed</h3>
            <div className="flex items-center gap-2 text-sm text-slate-400">
              {hasNewMessages && (
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              )}
              <span>{communityMessages.length} mensagens</span>
              <Badge variant="outline" className="text-xs bg-green-500/10 text-green-500 border-green-500/20">
                Live
              </Badge>
            </div>
          </div>
        </div>

        <Button
          onClick={loadCommunityMessages}
          variant="outline"
          size="sm"
          className="border-blue-500/30 text-blue-400 hover:bg-blue-500/20"
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {/* Messages */}
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {communityMessages.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">Nenhuma mensagem ainda...</p>
            <p className="text-xs mt-1">Seja o primeiro a postar na comunidade!</p>
          </div>
        ) : (
          communityMessages.slice(0, 5).map((message, index) => (
            <div
              key={message.id}
              className={`bg-slate-800/30 rounded-lg border border-slate-600/30 p-4 hover:bg-slate-800/50 transition-all duration-200 ${
                index === 0 ? 'ring-1 ring-blue-500/30' : ''
              }`}
            >
              {/* User Info */}
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center cursor-pointer hover:scale-105 transition-transform"
                  onClick={() => onUserClick(message.user)}
                >
                  <span className="text-white font-bold text-sm">{message.avatar}</span>
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    {editingUserName === message.id ? (
                      <div className="flex items-center gap-2">
                        <Input
                          value={editingUserNameValue}
                          onChange={(e) => setEditingUserNameValue(e.target.value)}
                          className="text-sm h-7 px-2 w-32 bg-slate-700 border-slate-600"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              handleEditCommunityUserName(message.id, editingUserNameValue);
                              setEditingUserName(null);
                            }
                          }}
                          autoFocus
                        />
                        <Button
                          size="sm"
                          className="h-7 w-7 p-0 bg-green-500 hover:bg-green-600"
                          onClick={() => {
                            handleEditCommunityUserName(message.id, editingUserNameValue);
                            setEditingUserName(null);
                          }}
                        >
                          <Check className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 w-7 p-0 border-slate-600"
                          onClick={() => setEditingUserName(null)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span
                          className="text-white font-medium cursor-pointer hover:text-blue-400 transition-colors"
                          onClick={() => onUserClick(message.user)}
                        >
                          {message.user}
                        </span>
                        {message.isVerified && (
                          <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs">✓</span>
                          </div>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-4 w-4 p-0 text-slate-400 hover:text-blue-400"
                          onClick={() => {
                            setEditingUserName(message.id);
                            setEditingUserNameValue(message.user);
                          }}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <span>{message.time}</span>
                    {index === 0 && (
                      <Badge variant="outline" className="text-xs bg-green-500/10 text-green-500 border-green-500/20">
                        Nova
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1">
                  {message.imageUrl && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 text-slate-400 hover:text-red-400"
                      onClick={() => handleDeleteCommunityImage(message.id)}
                      title="Remover imagem"
                    >
                      <Image className="h-3 w-3" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 text-slate-400 hover:text-red-400"
                    onClick={() => handleDeleteCommunityPost(message.id)}
                    title="Deletar post"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              {/* Message Content */}
              <p className="text-sm text-slate-200 mb-3 leading-relaxed">{message.message}</p>

              {/* Image */}
              {message.imageUrl && (
                <div className="mb-3 rounded-lg overflow-hidden border border-slate-600/50">
                  <img
                    src={message.imageUrl}
                    alt="Post image"
                    className="w-full max-h-48 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => window.open(message.imageUrl, '_blank')}
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              )}

              {/* Interaction */}
              <div className="flex items-center justify-between text-xs text-slate-400">
                <div className="flex items-center gap-4">
                  <span>{message.likes} curtidas</span>
                </div>
                <span className="text-slate-500">{message.time}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};