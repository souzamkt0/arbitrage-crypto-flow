import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Lock, Mail, User, TrendingUp, MapPin, Building, Camera, Phone, Users } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import AvatarSVG from "@/components/AvatarSVG";

const Login = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [referralInfo, setReferralInfo] = useState<{code: string, referrerName: string} | null>(null);
  const [selectedAvatar, setSelectedAvatar] = useState("avatar1");
  const [referralCode, setReferralCode] = useState("");
  const [referralError, setReferralError] = useState("");

  const avatarOptions = [
    "avatar1", // Homem Executivo 
    "avatar2", // Mulher Executiva
    "avatar3", // Homem Jovem Casual
    "avatar4", // Mulher Jovem Casual
    "avatar5", // Homem Maduro Barbudo
    "avatar6", // Mulher Madura Elegante
    "avatar7", // Homem Atlético
    "avatar8"  // Mulher Artista
  ];

  const navigate = useNavigate();
  const { toast } = useToast();
  const { referralCode: urlReferralCode } = useParams();

  // Verificar código de referência
  const checkReferralCode = (code: string) => {
    if (!code) {
      setReferralInfo(null);
      setReferralError("");
      return;
    }

    const users = JSON.parse(localStorage.getItem("alphabit_users") || "[]");
    const referrer = users.find((u: any) => u.referralCode === code);
    
    if (referrer) {
      setReferralInfo({ 
        code: code, 
        referrerName: referrer.displayName || referrer.name 
      });
      setReferralError("");
    } else {
      setReferralInfo(null);
      setReferralError("Código de referência inválido");
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate login
    setTimeout(() => {
      localStorage.setItem("alphabit_user", "true");
      toast({
        title: "Login realizado com sucesso!",
        description: "Bem-vindo ao Alphabit",
      });
      navigate("/dashboard");
    }, 1500);
  };

  useEffect(() => {
    if (urlReferralCode) {
      setReferralCode(urlReferralCode);
      checkReferralCode(urlReferralCode);
    }
  }, [urlReferralCode]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Verificar se tem código de referência válido
    if (!referralInfo) {
      setReferralError("Código de referência é obrigatório");
      return;
    }
    
    setIsLoading(true);
    
    const formData = new FormData(e.target as HTMLFormElement);
    const userData = {
      id: Math.random().toString(36).substring(2, 15),
      username: formData.get("username") as string,
      displayName: formData.get("name") as string,
      email: formData.get("email") as string,
      whatsapp: formData.get("whatsapp") as string,
      city: formData.get("city") as string,
      state: formData.get("state") as string,
      avatar: selectedAvatar,
      verified: false,
      followers: 0,
      following: 0,
      posts: 0,
      joinDate: new Date().toLocaleDateString('pt-BR'),
      isFollowing: false,
      isBlocked: false,
      earnings: 0,
      level: 1,
      badge: "Iniciante",
      bio: "",
      referredBy: referralInfo?.code || null,
      referralCode: Math.random().toString(36).substring(2, 15),
      registeredAt: new Date().toISOString()
    };
    
    // Save user data
    const users = JSON.parse(localStorage.getItem("alphabit_users") || "[]");
    users.push(userData);
    localStorage.setItem("alphabit_users", JSON.stringify(users));
    
    // Process referral reward if applicable
    if (referralInfo) {
      const settings = JSON.parse(localStorage.getItem("alphabit_admin_settings") || "{}");
      const referralPercent = settings.referralPercent || 5;
      
      toast({
        title: "Conta criada via indicação!",
        description: `Parabéns! ${referralInfo.referrerName} receberá ${referralPercent}% de comissão.`,
      });
    }
    
    // Simulate registration
    setTimeout(() => {
      localStorage.setItem("alphabit_user", "true");
      navigate("/api-connection");
    }, 1500);
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
                    Este campo é obrigatório. Peça o código para quem te indicou.
                  </p>
                </div>

                <form onSubmit={handleRegister} className="space-y-4">
                  {/* Foto de Perfil */}
                  <div className="space-y-2">
                    <Label>Foto de Perfil</Label>
                    <div className="flex items-center space-x-4">
                      <div className="h-16 w-16 rounded-full overflow-hidden border-2 border-primary bg-background animate-scale-in">
                        <AvatarSVG type={selectedAvatar} />
                      </div>
                      <div className="grid grid-cols-4 gap-2">
                        {avatarOptions.map((avatar) => (
                          <button
                            key={avatar}
                            type="button"
                            onClick={() => setSelectedAvatar(avatar)}
                            className={`relative rounded-full overflow-hidden border-2 transition-all hover-scale ${
                              selectedAvatar === avatar 
                                ? "border-primary shadow-lg animate-scale-in" 
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
                          name="name"
                          type="text"
                          placeholder="João Silva"
                          className="pl-9"
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
                          name="username"
                          type="text"
                          placeholder="joaosilva"
                          className="pl-8"
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
                        name="email"
                        type="email"
                        placeholder="joao@email.com"
                        className="pl-9"
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
                        name="whatsapp"
                        type="tel"
                        placeholder="(11) 99999-9999"
                        className="pl-9"
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
                          name="city"
                          type="text"
                          placeholder="São Paulo"
                          className="pl-9"
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
                          name="state"
                          type="text"
                          placeholder="SP"
                          className="pl-9"
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
                        name="password"
                        type="password"
                        placeholder="••••••••"
                        className="pl-9"
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

                {/* Login Button */}
                <div className="mt-6 pt-4 border-t border-border">
                  <p className="text-center text-sm text-muted-foreground mb-3">
                    Já tem uma conta?
                  </p>
                  <Button 
                    onClick={handleLogin}
                    variant="outline" 
                    className="w-full"
                    disabled={isLoading}
                  >
                    {isLoading ? "Entrando..." : "Fazer Login"}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;