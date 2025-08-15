import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Camera, Upload, Trash2, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface ProfileImageUploadProps {
  currentProfileImage?: string;
  currentCoverImage?: string;
  onProfileImageUpdate?: (url: string) => void;
  onCoverImageUpdate?: (url: string) => void;
}

const ProfileImageUpload = ({
  currentProfileImage,
  currentCoverImage,
  onProfileImageUpdate,
  onCoverImageUpdate
}: ProfileImageUploadProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isUploadingProfile, setIsUploadingProfile] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [profilePreview, setProfilePreview] = useState<string | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  
  const profileInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const validateImage = (file: File): boolean => {
    // Verificar tipo de arquivo
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Tipo de arquivo inválido",
        description: "Por favor, selecione uma imagem (JPEG, PNG, WebP ou GIF).",
        variant: "destructive"
      });
      return false;
    }

    return true;
  };

  const uploadImage = async (file: File, bucket: string, type: 'profile' | 'cover'): Promise<string | null> => {
    if (!user) {
      toast({
        title: "Erro de autenticação",
        description: "Você precisa estar logado para fazer upload de imagens.",
        variant: "destructive"
      });
      return null;
    }

    if (!validateImage(file)) {
      return null;
    }

    // Verificar tamanho do arquivo
    const maxSize = type === 'profile' ? 5 * 1024 * 1024 : 10 * 1024 * 1024; // 5MB para perfil, 10MB para capa
    if (file.size > maxSize) {
      toast({
        title: "Arquivo muito grande",
        description: `O arquivo deve ter no máximo ${type === 'profile' ? '5MB' : '10MB'}.`,
        variant: "destructive"
      });
      return null;
    }

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${type}_${Date.now()}.${fileExt}`;

      // Upload do arquivo
      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) {
        throw uploadError;
      }

      // Obter URL pública
      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(fileName);

      // Atualizar o perfil do usuário na tabela user_profiles
    const { error: updateError } = await supabase
      .from('user_profiles')
      .upsert({
        user_id: user.id,
        [type === 'profile' ? 'profile_photo_url' : 'cover_photo_url']: publicUrl
      }, {
        onConflict: 'user_id'
      });

      if (updateError) {
        throw updateError;
      }

      return publicUrl;
    } catch (error) {
      console.error(`Erro ao fazer upload da ${type === 'profile' ? 'foto de perfil' : 'foto de capa'}:`, error);
      toast({
        title: "Erro no upload",
        description: `Não foi possível fazer upload da ${type === 'profile' ? 'foto de perfil' : 'foto de capa'}.`,
        variant: "destructive"
      });
      return null;
    }
  };

  const handleProfileImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Mostrar preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setProfilePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    setIsUploadingProfile(true);
    const url = await uploadImage(file, 'profile-images', 'profile');
    
    if (url) {
      onProfileImageUpdate?.(url);
      toast({
        title: "Foto de perfil atualizada!",
        description: "Sua foto de perfil foi atualizada com sucesso."
      });
    }
    
    setIsUploadingProfile(false);
    setProfilePreview(null);
  };

  const handleCoverImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Mostrar preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setCoverPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    setIsUploadingCover(true);
    const url = await uploadImage(file, 'cover-images', 'cover');
    
    if (url) {
      onCoverImageUpdate?.(url);
      toast({
        title: "Foto de capa atualizada!",
        description: "Sua foto de capa foi atualizada com sucesso."
      });
    }
    
    setIsUploadingCover(false);
    setCoverPreview(null);
  };

  const removeImage = async (type: 'profile' | 'cover') => {
    if (!user) return;

    try {
      // Remover a URL da imagem do perfil do usuário na tabela user_profiles
      const { error } = await supabase
        .from('user_profiles')
        .update({
          [type === 'profile' ? 'profile_photo_url' : 'cover_photo_url']: null
        })
        .eq('user_id', user.id);

      if (error) throw error;

      if (type === 'profile') {
        onProfileImageUpdate?.('');
      } else {
        onCoverImageUpdate?.('');
      }

      toast({
        title: `${type === 'profile' ? 'Foto de perfil' : 'Foto de capa'} removida!`,
        description: `Sua ${type === 'profile' ? 'foto de perfil' : 'foto de capa'} foi removida com sucesso.`
      });
    } catch (error) {
      console.error(`Erro ao remover ${type === 'profile' ? 'foto de perfil' : 'foto de capa'}:`, error);
      toast({
        title: "Erro",
        description: `Não foi possível remover a ${type === 'profile' ? 'foto de perfil' : 'foto de capa'}.`,
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Foto de Capa */}
      <Card className="bg-gray-900 border-gray-700">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Foto de Capa</h3>
          <div className="relative">
            <div className="w-full h-48 bg-gray-800 rounded-lg overflow-hidden border-2 border-dashed border-gray-600 hover:border-gray-500 transition-colors">
              {coverPreview ? (
                <img 
                  src={coverPreview} 
                  alt="Preview da capa" 
                  className="w-full h-full object-cover"
                />
              ) : currentCoverImage ? (
                <img 
                  src={currentCoverImage} 
                  alt="Foto de capa atual" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <div className="text-center">
                    <Camera className="h-12 w-12 mx-auto mb-2" />
                    <p>Clique para adicionar foto de capa</p>
                    <p className="text-sm text-gray-500">Máximo 10MB</p>
                  </div>
                </div>
              )}
            </div>
            
            <div className="absolute bottom-4 right-4 flex space-x-2">
              <input
                type="file"
                ref={coverInputRef}
                onChange={handleCoverImageChange}
                accept="image/*"
                className="hidden"
              />
              <Button
                onClick={() => coverInputRef.current?.click()}
                disabled={isUploadingCover}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isUploadingCover ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4" />
                )}
              </Button>
              
              {currentCoverImage && (
                <Button
                  onClick={() => removeImage('cover')}
                  size="sm"
                  variant="destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Foto de Perfil */}
      <Card className="bg-gray-900 border-gray-700">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Foto de Perfil</h3>
          <div className="flex items-center space-x-6">
            <div className="relative">
              <Avatar className="h-24 w-24 border-4 border-gray-600">
                <AvatarImage 
                  src={profilePreview || currentProfileImage} 
                  alt="Foto de perfil" 
                />
                <AvatarFallback className="bg-gray-700 text-white text-2xl">
                  {user?.email?.charAt(0).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              
              {isUploadingProfile && (
                <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                  <Loader2 className="h-6 w-6 text-white animate-spin" />
                </div>
              )}
            </div>
            
            <div className="flex flex-col space-y-2">
              <input
                type="file"
                ref={profileInputRef}
                onChange={handleProfileImageChange}
                accept="image/*"
                className="hidden"
              />
              <Button
                onClick={() => profileInputRef.current?.click()}
                disabled={isUploadingProfile}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isUploadingProfile ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Alterar Foto
                  </>
                )}
              </Button>
              
              {currentProfileImage && (
                <Button
                  onClick={() => removeImage('profile')}
                  variant="destructive"
                  size="sm"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Remover
                </Button>
              )}
            </div>
          </div>
          
          <p className="text-sm text-gray-400 mt-4">
            Recomendamos uma imagem quadrada de pelo menos 200x200 pixels. Máximo 5MB.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileImageUpload;