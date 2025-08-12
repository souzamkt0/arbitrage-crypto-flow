import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Lock, Mail, User, TrendingUp, MapPin, Building, Phone, Users } from "lucide-react";
import AvatarSVG from "@/components/AvatarSVG";

const Register = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [referralInfo, setReferralInfo] = useState<{code: string, referrerName: string} | null>(null);
  const [selectedAvatar, setSelectedAvatar] = useState("avatar1");
  const [referralCode, setReferralCode] = useState("");
  const [referralError, setReferralError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    whatsapp: "",
    city: "",
    state: ""
  });

  const avatarOptions = [
    "avatar1", "avatar2", "avatar3", "avatar4", 
    "avatar5", "avatar6", "avatar7", "avatar8"
  ];

  const navigate = useNavigate();
  const { toast } = useToast();
  const { signUp, user } = useAuth();
  const { referralCode: urlReferralCode } = useParams();

  // Redirect if already authenticated
  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  // Verificar código de referência no banco
  const checkReferralCode = async (code: string) => {
    if (!code) {
      setReferralInfo(null);
      setReferralError("");
      return;
    }

    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('display_name, username')
        .eq('username', code.toLowerCase())
        .single();

      if (error || !profile) {
        setReferralInfo(null);
        setReferralError("Código de referência inválido");
      } else {
        setReferralInfo({ 
          code: code, 
          referrerName: profile.display_name || profile.username
        });
        setReferralError("");
      }
    } catch (error) {
      setReferralInfo(null);
      setReferralError("Código de referência inválido");
    }
  };

  useEffect(() => {
    if (urlReferralCode) {
      setReferralCode(urlReferralCode);
      checkReferralCode(urlReferralCode);
    }
    // Set default referral code to souzamkt0
    else {
      setReferralCode("souzamkt0");
      checkReferralCode("souzamkt0");
    }
  }, [urlReferralCode]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!referralInfo) {
      setReferralError("Código de referência é obrigatório");
      return;
    }
    
    setIsLoading(true);
    
    const { error } = await signUp(formData.email, formData.password, referralCode);
    
    if (!error) {
      toast({
        title: "Cadastro realizado!",
        description: `Indicado por: ${referralInfo.referrerName}`,
      });
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary flex items-center justify-center p-3 md:p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-6 md:mb-8">
          <div className="flex items-center justify-center mb-4">
            <TrendingUp className="h-8 w-8 md:h-12 md:w-12 text-primary mr-2" />
            <h1 className="text-3xl md:text-4xl font-bold text-primary">Alphabit</h1>
          </div>
          <p className="text-sm md:text-base text-muted-foreground">
            Sistema de Arbitragem Automatizada
          </p>
        </div>

        <Card className="bg-card border-border shadow-xl">
          <CardHeader>
            <CardTitle className="text-center text-card-foreground">
              Criar conta - Indicação obrigatória
            </CardTitle>
            <p className="text-center text-sm text-muted-foreground">
              É necessário um código de indicação para se cadastrar
            </p>
            {referralInfo && (
              <div className="text-center mt-2 p-3 bg-primary/10 rounded-lg border border-primary/20">
                <p className="text-sm text-primary font-medium">
                  ✅ Indicado por: <strong>{referralInfo.referrerName}</strong>
                </p>
                <p className="text-xs text-primary/80 mt-1">
                  Código válido! Pode prosseguir com o cadastro.
                </p>
              </div>
            )}
            {referralError && (
              <div className="text-center mt-2 p-3 bg-destructive/10 rounded-lg border border-destructive/20">
                <p className="text-sm text-destructive font-medium">
                  ❌ {referralError}
                </p>
              </div>
            )}
          </CardHeader>
          <CardContent>
            <div className="w-full">
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-4 text-center">Cadastro</h3>
                
                {/* Código de Referência - Obrigatório */}
                <div className="space-y-2 mb-6">
                  <Label htmlFor="referral">Código de Indicação *</Label>
                  <div className="relative">
                    <Users className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="referral"
                      type="text"
                      placeholder="Digite o código de indicação"
                      className="pl-9"
                      value={referralCode}
                      onChange={(e) => {
                        const value = e.target.value;
                        setReferralCode(value);
                        checkReferralCode(value);
                      }}
                      required
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Use: souzamkt0 (padrão) ou peça um código para quem te indicou.
                  </p>
                </div>

                <form onSubmit={handleRegister} className="space-y-4">
                  {/* Foto de Perfil */}
                  <div className="space-y-2">
                    <Label>Foto de Perfil</Label>
                    <div className="flex items-center space-x-4">
                      <div className="h-16 w-16 rounded-full overflow-hidden border-2 border-primary bg-background">
                        <AvatarSVG type={selectedAvatar} />
                      </div>
                      <div className="grid grid-cols-4 gap-2">
                        {avatarOptions.map((avatar) => (
                          <button
                            key={avatar}
                            type="button"
                            onClick={() => setSelectedAvatar(avatar)}
                            className={`relative rounded-full overflow-hidden border-2 transition-all ${
                              selectedAvatar === avatar 
                                ? "border-primary shadow-lg" 
                                : "border-muted hover:border-primary/50"
                            }`}
                          >
                            <div className="h-8 w-8">
                              <AvatarSVG type={avatar} />
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nome Completo</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="name"
                          type="text"
                          placeholder="João Silva"
                          className="pl-9"
                          value={formData.name}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="username">Usuário</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-3 text-sm text-muted-foreground">@</span>
                        <Input
                          id="username"
                          type="text"
                          placeholder="joaosilva"
                          className="pl-8"
                          value={formData.username}
                          onChange={(e) => handleInputChange('username', e.target.value)}
                          required
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="register-email">Email *</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="register-email"
                        type="email"
                        placeholder="joao@email.com"
                        className="pl-9"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="whatsapp">WhatsApp *</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="whatsapp"
                        type="tel"
                        placeholder="(11) 99999-9999"
                        className="pl-9"
                        value={formData.whatsapp}
                        onChange={(e) => handleInputChange('whatsapp', e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">Cidade *</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="city"
                          type="text"
                          placeholder="São Paulo"
                          className="pl-9"
                          value={formData.city}
                          onChange={(e) => handleInputChange('city', e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="state">Estado *</Label>
                      <div className="relative">
                        <Building className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="state"
                          type="text"
                          placeholder="SP"
                          className="pl-9"
                          value={formData.state}
                          onChange={(e) => handleInputChange('state', e.target.value)}
                          required
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="register-password">Senha *</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="register-password"
                        type="password"
                        placeholder="••••••••"
                        className="pl-9"
                        value={formData.password}
                        onChange={(e) => handleInputChange('password', e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-primary hover:bg-primary/90" 
                    disabled={isLoading || !referralInfo}
                  >
                    {isLoading ? "Criando conta..." : "Criar conta"}
                  </Button>
                </form>

                <div className="mt-6 pt-4 border-t border-border">
                  <p className="text-center text-sm text-muted-foreground mb-3">
                    Já tem uma conta?
                  </p>
                  <Link to="/login">
                    <Button 
                      variant="outline" 
                      className="w-full"
                    >
                      Fazer Login
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Register;