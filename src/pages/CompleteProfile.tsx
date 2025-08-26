import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { User, Mail, Phone, CreditCard, Save, ArrowRight, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const CompleteProfile = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    username: "",
    cpf: "",
    whatsapp: "",
    bio: "",
    avatar: "avatar1",
    referredBy: ""
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [currentStep, setCurrentStep] = useState(1);
  const [isCompleted, setIsCompleted] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { user, profile } = useAuth();

  // Verificar se o usuário está logado
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    // Se já tem perfil completo, redirecionar para dashboard
    if (profile && profile.display_name && profile.first_name) {
      navigate('/dashboard');
      return;
    }

    // Carregar dados existentes se disponíveis
    if (profile) {
      setFormData(prev => ({
        ...prev,
        firstName: profile.first_name || "",
        lastName: profile.last_name || "",
        username: profile.username || "",
        cpf: profile.cpf || "",
        whatsapp: profile.whatsapp || "",
        bio: profile.bio || "",
        avatar: profile.avatar || "avatar1"
      }));
    }

    // Pré-preencher dados do Google se disponíveis
    if (user && user.user_metadata) {
      const metadata = user.user_metadata;
      console.log('📊 Dados do Google:', metadata);
      
      setFormData(prev => ({
        ...prev,
        firstName: prev.firstName || metadata.full_name?.split(' ')[0] || metadata.name?.split(' ')[0] || "",
        lastName: prev.lastName || metadata.full_name?.split(' ').slice(1).join(' ') || metadata.name?.split(' ').slice(1).join(' ') || "",
        username: prev.username || metadata.email?.split('@')[0] || "",
        bio: prev.bio || `Usuário ${metadata.full_name || metadata.name || 'Google'}`
      }));
    }
  }, [user, profile, navigate]);

  // CPF mask function
  const formatCPF = (value: string) => {
    const cpf = value.replace(/\D/g, '');
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  // WhatsApp mask function
  const formatWhatsApp = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 2) return numbers;
    if (numbers.length <= 7) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
  };

  const handleInputChange = (field: string, value: string) => {
    let formattedValue = value;
    
    if (field === 'cpf') {
      formattedValue = formatCPF(value);
    } else if (field === 'whatsapp') {
      formattedValue = formatWhatsApp(value);
    }

    setFormData(prev => ({
      ...prev,
      [field]: formattedValue
    }));

    // Limpar erro do campo
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ""
      }));
    }
  };

  const validateStep = (step: number) => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.firstName.trim()) {
        newErrors.firstName = "Nome é obrigatório";
      }
      if (!formData.lastName.trim()) {
        newErrors.lastName = "Sobrenome é obrigatório";
      }
      if (!formData.username.trim()) {
        newErrors.username = "Nome de usuário é obrigatório";
      }
    }

    if (step === 2) {
      if (!formData.cpf.trim()) {
        newErrors.cpf = "CPF é obrigatório";
      } else if (formData.cpf.replace(/\D/g, '').length !== 11) {
        newErrors.cpf = "CPF deve ter 11 dígitos";
      }
      if (!formData.whatsapp.trim()) {
        newErrors.whatsapp = "WhatsApp é obrigatório";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePreviousStep = () => {
    setCurrentStep(prev => Math.max(1, prev - 1));
  };

  const handleCompleteProfile = async () => {
    if (!user) return;

    setIsLoading(true);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          display_name: `${formData.firstName} ${formData.lastName}`,
          first_name: formData.firstName,
          last_name: formData.lastName,
          username: formData.username,
          cpf: formData.cpf,
          whatsapp: formData.whatsapp,
          bio: formData.bio,
          avatar: formData.avatar,
          referred_by: formData.referredBy,
          profile_completed: true
        })
        .eq('user_id', user.id);

      if (error) {
        throw error;
      }

      setIsCompleted(true);
      
      toast({
        title: "✅ Perfil completado!",
        description: "Suas informações foram salvas com sucesso.",
      });

      // Redirecionar para dashboard após 2 segundos
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);

    } catch (error: any) {
      console.error('Erro ao completar perfil:', error);
      toast({
        title: "❌ Erro",
        description: error.message || "Erro ao salvar informações",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const avatars = [
    { id: "avatar1", name: "Avatar 1" },
    { id: "avatar2", name: "Avatar 2" },
    { id: "avatar3", name: "Avatar 3" },
    { id: "avatar4", name: "Avatar 4" },
    { id: "avatar5", name: "Avatar 5" },
    { id: "avatar6", name: "Avatar 6" }
  ];

  if (isCompleted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-gray-900 border-gray-700">
          <CardContent className="p-8 text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Perfil Completado!</h2>
            <p className="text-gray-300 mb-6">
              Suas informações foram salvas com sucesso. Redirecionando para o dashboard...
            </p>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl bg-gray-900 border-gray-700">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-white flex items-center justify-center gap-2">
            <User className="h-6 w-6 text-yellow-400" />
            Complete seu Perfil
          </CardTitle>
          <p className="text-gray-400">
            Passo {currentStep} de 3 - Configure suas informações pessoais
          </p>
        </CardHeader>

        <CardContent className="p-6">
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between mb-2">
              <span className="text-sm text-gray-400">Progresso</span>
              <span className="text-sm text-yellow-400">{Math.round((currentStep / 3) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-yellow-500 to-yellow-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(currentStep / 3) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Step 1: Informações Básicas */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName" className="text-gray-300">Nome</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    className={`mt-1 ${errors.firstName ? 'border-red-500' : 'border-gray-600'}`}
                    placeholder="Seu nome"
                  />
                  {errors.firstName && (
                    <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="lastName" className="text-gray-300">Sobrenome</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    className={`mt-1 ${errors.lastName ? 'border-red-500' : 'border-gray-600'}`}
                    placeholder="Seu sobrenome"
                  />
                  {errors.lastName && (
                    <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="username" className="text-gray-300">Nome de Usuário</Label>
                <Input
                  id="username"
                  value={formData.username}
                  onChange={(e) => handleInputChange('username', e.target.value)}
                  className={`mt-1 ${errors.username ? 'border-red-500' : 'border-gray-600'}`}
                  placeholder="nome_usuario"
                />
                {errors.username && (
                  <p className="text-red-500 text-sm mt-1">{errors.username}</p>
                )}
              </div>
            </div>
          )}

          {/* Step 2: Documentos */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="cpf" className="text-gray-300">CPF</Label>
                <Input
                  id="cpf"
                  value={formData.cpf}
                  onChange={(e) => handleInputChange('cpf', e.target.value)}
                  className={`mt-1 ${errors.cpf ? 'border-red-500' : 'border-gray-600'}`}
                  placeholder="000.000.000-00"
                />
                {errors.cpf && (
                  <p className="text-red-500 text-sm mt-1">{errors.cpf}</p>
                )}
              </div>

              <div>
                <Label htmlFor="whatsapp" className="text-gray-300">WhatsApp</Label>
                <Input
                  id="whatsapp"
                  value={formData.whatsapp}
                  onChange={(e) => handleInputChange('whatsapp', e.target.value)}
                  className={`mt-1 ${errors.whatsapp ? 'border-red-500' : 'border-gray-600'}`}
                  placeholder="(11) 99999-9999"
                />
                {errors.whatsapp && (
                  <p className="text-red-500 text-sm mt-1">{errors.whatsapp}</p>
                )}
              </div>

              <div>
                <Label htmlFor="referredBy" className="text-gray-300">Quem te Indicou? (Opcional)</Label>
                <Input
                  id="referredBy"
                  value={formData.referredBy}
                  onChange={(e) => handleInputChange('referredBy', e.target.value)}
                  className="mt-1 border-gray-600"
                  placeholder="Código de indicação ou nome"
                />
              </div>
            </div>
          )}

          {/* Step 3: Avatar e Bio */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <Label className="text-gray-300">Escolha seu Avatar</Label>
                <div className="grid grid-cols-3 gap-4 mt-2">
                  {avatars.map((avatar) => (
                    <div
                      key={avatar.id}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        formData.avatar === avatar.id
                          ? 'border-yellow-500 bg-yellow-500/10'
                          : 'border-gray-600 hover:border-gray-500'
                      }`}
                      onClick={() => handleInputChange('avatar', avatar.id)}
                    >
                      <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full mx-auto mb-2"></div>
                      <p className="text-sm text-center text-gray-300">{avatar.name}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="bio" className="text-gray-300">Bio (Opcional)</Label>
                <textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  className="mt-1 w-full p-3 bg-gray-800 border border-gray-600 rounded-md text-white resize-none"
                  rows={3}
                  placeholder="Conte um pouco sobre você..."
                />
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            <Button
              onClick={handlePreviousStep}
              disabled={currentStep === 1}
              variant="outline"
              className="border-gray-600 text-gray-300 hover:bg-gray-800"
            >
              Anterior
            </Button>

            {currentStep < 3 ? (
              <Button
                onClick={handleNextStep}
                className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700"
              >
                Próximo
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={handleCompleteProfile}
                disabled={isLoading}
                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Completar Perfil
                  </>
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CompleteProfile;
