import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ProfileImageUpload from "@/components/ProfileImageUpload";
import { 
  Camera, 
  ArrowLeft, 
  Save,
  X,
  MapPin,
  Calendar,
  Link as LinkIcon,
  CheckCircle2
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

const EditProfile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Estados do perfil
  const [profileData, setProfileData] = useState({
    displayName: "João Silva",
    username: "joaosilva",
    bio: "Trader experiente focado em arbitragem de criptomoedas",
    location: "São Paulo, Brasil",
    website: "https://joaotrader.com",
    avatar: "https://images.unsplash.com/photo-1535268647677-300dbf3d78d1?w=400&h=400&fit=crop&crop=face",
    coverImage: ""
  });

  const [originalData] = useState(profileData);
  const [isUploading, setIsUploading] = useState(false);

  // Avatars predefinidos do Unsplash
  const predefinedAvatars = [
    "https://images.unsplash.com/photo-1535268647677-300dbf3d78d1?w=400&h=400&fit=crop&crop=face",
    "https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=400&h=400&fit=crop&crop=face",
    "https://images.unsplash.com/photo-1501286353178-1ec881214838?w=400&h=400&fit=crop&crop=face",
    "https://images.unsplash.com/photo-1582562124811-c09040d0a901?w=400&h=400&fit=crop&crop=face",
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face",
    "https://images.unsplash.com/photo-1494790108755-2616b9f3c5cd?w=400&h=400&fit=crop&crop=face",
    "https://images.unsplash.com/photo-1552058544-f2b08422138a?w=400&h=400&fit=crop&crop=face",
    "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=400&h=400&fit=crop&crop=face"
  ];

  const [showAvatarPicker, setShowAvatarPicker] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleUsernameChange = (value: string) => {
    // Remove caracteres especiais e espaços, converte para minúsculo
    const cleanUsername = value.toLowerCase().replace(/[^a-z0-9_]/g, '');
    handleInputChange('username', cleanUsername);
  };

  const handleAvatarSelect = (avatarUrl: string) => {
    setProfileData(prev => ({
      ...prev,
      avatar: avatarUrl
    }));
    setShowAvatarPicker(false);
  };

  const handleSave = () => {
    setIsUploading(true);
    
    // Simular salvamento (em produção seria uma API call)
    setTimeout(() => {
      // Salvar no localStorage
      localStorage.setItem('alphabit_user_profile', JSON.stringify(profileData));
      
      setIsUploading(false);
      toast({
        title: "Perfil atualizado!",
        description: "Suas informações foram salvas com sucesso.",
      });
      
      // Voltar para a comunidade ou página anterior
      navigate('/community');
    }, 1000);
  };

  const hasChanges = JSON.stringify(profileData) !== JSON.stringify(originalData);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 bg-background/95 backdrop-blur-md border-b border-border z-10">
        <div className="flex items-center justify-between p-4 max-w-2xl mx-auto">
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-xl font-bold">Editar perfil</h1>
              <p className="text-sm text-muted-foreground">@{profileData.username}</p>
            </div>
          </div>
          
          <Button 
            onClick={handleSave}
            disabled={!hasChanges || isUploading}
            className="bg-primary hover:bg-primary/90 rounded-full px-6"
          >
            {isUploading ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Salvando...</span>
              </div>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Salvar
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-4 space-y-6">
        {/* Cover e Avatar */}
        <Card className="overflow-hidden">
          <div className="relative">
            {/* Cover Image */}
            <div className="h-48 bg-gradient-to-r from-primary/20 to-secondary/20 relative">
              {profileData.coverImage && (
                <img 
                  src={profileData.coverImage} 
                  alt="Foto de capa" 
                  className="w-full h-full object-cover"
                />
              )}
              <div className="absolute top-4 right-4">
                <ProfileImageUpload 
                  type="cover"
                  currentImageUrl={profileData.coverImage}
                  onImageUpdate={(url) => handleInputChange('coverImage', url)}
                  userId={user?.id}
                />
              </div>
            </div>
            
            {/* Avatar */}
            <div className="absolute -bottom-16 left-4">
              <div className="relative">
                <Avatar className="h-32 w-32 border-4 border-background">
                  <AvatarImage src={profileData.avatar} alt={profileData.displayName} />
                  <AvatarFallback className="text-2xl">
                    {profileData.displayName.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute bottom-0 right-0">
                  <ProfileImageUpload 
                    type="profile"
                    currentImageUrl={profileData.avatar}
                    onImageUpdate={(url) => handleInputChange('avatar', url)}
                    userId={user?.id}
                  />
                </div>
              </div>
            </div>
          </div>
          
          <div className="pt-20 pb-4"></div>
        </Card>

        {/* Seletor de Avatar */}
        {showAvatarPicker && (
          <Card className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Escolher foto de perfil</h3>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowAvatarPicker(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="grid grid-cols-4 gap-4">
              {predefinedAvatars.map((avatar, index) => (
                <div 
                  key={index}
                  className="relative cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => handleAvatarSelect(avatar)}
                >
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={avatar} alt={`Avatar ${index + 1}`} />
                    <AvatarFallback>A{index + 1}</AvatarFallback>
                  </Avatar>
                  {profileData.avatar === avatar && (
                    <div className="absolute inset-0 bg-primary/20 rounded-full flex items-center justify-center">
                      <CheckCircle2 className="h-6 w-6 text-primary" />
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            <div className="mt-4 p-3 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">
                💡 Dica: Escolha uma foto que represente você profissionalmente. 
                Perfis com fotos recebem mais interações na comunidade!
              </p>
            </div>
          </Card>
        )}

        {/* Informações Básicas */}
        <Card>
          <CardHeader>
            <CardTitle>Informações básicas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Nome */}
            <div className="space-y-2">
              <Label htmlFor="displayName">Nome</Label>
              <Input
                id="displayName"
                value={profileData.displayName}
                onChange={(e) => handleInputChange('displayName', e.target.value)}
                placeholder="Seu nome completo"
                maxLength={50}
              />
              <p className="text-xs text-muted-foreground">
                {profileData.displayName.length}/50
              </p>
            </div>

            {/* Username */}
            <div className="space-y-2">
              <Label htmlFor="username">Nome de usuário</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                  @
                </span>
                <Input
                  id="username"
                  value={profileData.username}
                  onChange={(e) => handleUsernameChange(e.target.value)}
                  placeholder="nomedeusuario"
                  className="pl-8"
                  maxLength={20}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Apenas letras minúsculas, números e underscore. {profileData.username.length}/20
              </p>
            </div>

            {/* Bio */}
            <div className="space-y-2">
              <Label htmlFor="bio">Biografia</Label>
              <Textarea
                id="bio"
                value={profileData.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                placeholder="Conte um pouco sobre você e sua experiência no trading..."
                className="min-h-[100px] resize-none"
                maxLength={160}
              />
              <p className="text-xs text-muted-foreground">
                {profileData.bio.length}/160
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Informações Adicionais */}
        <Card>
          <CardHeader>
            <CardTitle>Informações adicionais</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Localização */}
            <div className="space-y-2">
              <Label htmlFor="location">
                <MapPin className="h-4 w-4 inline mr-2" />
                Localização
              </Label>
              <Input
                id="location"
                value={profileData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                placeholder="Cidade, País"
                maxLength={30}
              />
            </div>

            {/* Website */}
            <div className="space-y-2">
              <Label htmlFor="website">
                <LinkIcon className="h-4 w-4 inline mr-2" />
                Website
              </Label>
              <Input
                id="website"
                value={profileData.website}
                onChange={(e) => handleInputChange('website', e.target.value)}
                placeholder="https://seusite.com"
                maxLength={100}
              />
            </div>
          </CardContent>
        </Card>

        {/* Preview do Perfil */}
        <Card>
          <CardHeader>
            <CardTitle>Preview do perfil</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-start space-x-4 p-4 border border-border rounded-lg">
              <Avatar className="h-12 w-12">
                <AvatarImage src={profileData.avatar} alt={profileData.displayName} />
                <AvatarFallback>
                  {profileData.displayName.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <h3 className="font-bold text-foreground">{profileData.displayName}</h3>
                  <CheckCircle2 className="h-4 w-4 text-blue-500" />
                </div>
                <p className="text-muted-foreground text-sm">@{profileData.username}</p>
                
                {profileData.bio && (
                  <p className="text-sm text-foreground mt-2">{profileData.bio}</p>
                )}
                
                <div className="flex items-center space-x-4 mt-2 text-xs text-muted-foreground">
                  {profileData.location && (
                    <div className="flex items-center space-x-1">
                      <MapPin className="h-3 w-3" />
                      <span>{profileData.location}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-3 w-3" />
                    <span>Entrou em março de 2024</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Aviso */}
        <Card className="bg-muted/50">
          <CardContent className="p-4">
            <div className="flex items-start space-x-2">
              <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
              <div className="text-sm text-muted-foreground">
                <strong>Dica:</strong> Um perfil completo e profissional aumenta suas chances de 
                conectar com outros traders e receber mais seguidores na comunidade Alphabit.
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Espaçamento para mobile navigation */}
        <div className="h-20 lg:h-0"></div>
      </div>
    </div>
  );
};

export default EditProfile;