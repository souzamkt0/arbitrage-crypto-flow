import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Lock, Mail, User, TrendingUp, MapPin, Building, Camera } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const Login = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [referralInfo, setReferralInfo] = useState<{code: string, referrerName: string} | null>(null);
  const [selectedAvatar, setSelectedAvatar] = useState("photo-1649972904349-6e44c42644a7");

  const avatarOptions = [
    "photo-1649972904349-6e44c42644a7",
    "photo-1581091226825-a6a2a5aee158", 
    "photo-1526374965328-7f61d4dc18c5",
    "photo-1506744038136-46273834b3fb",
    "photo-1582562124811-c09040d0a901",
    "photo-1472099645785-5658abf4ff4e",
    "photo-1507003211169-0a1dd7228f2d",
    "photo-1494790108755-2616b612b977"
  ];
  const navigate = useNavigate();
  const { toast } = useToast();
  const { referralCode } = useParams();

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
    if (referralCode) {
      // Get referral info from localStorage (simulando busca no banco)
      const users = JSON.parse(localStorage.getItem("alphabit_users") || "[]");
      const referrer = users.find((u: any) => u.referralCode === referralCode);
      
      if (referrer) {
        setReferralInfo({ code: referralCode, referrerName: referrer.name });
      }
    }
  }, [referralCode]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    const formData = new FormData(e.target as HTMLFormElement);
    const userData = {
      id: Math.random().toString(36).substring(2, 15),
      username: formData.get("username") as string,
      displayName: formData.get("name") as string,
      email: formData.get("email") as string,
      city: formData.get("city") as string,
      state: formData.get("state") as string,
      avatar: `https://images.unsplash.com/${selectedAvatar}?w=400&h=400&fit=crop&crop=face`,
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
              {referralInfo ? "Cadastre-se via indicação" : "Acesse sua conta"}
            </CardTitle>
            {referralInfo && (
              <div className="text-center mt-2 p-3 bg-primary/10 rounded-lg">
                <p className="text-sm text-primary font-medium">
                  🎉 Você foi indicado por: <strong>{referralInfo.referrerName}</strong>
                </p>
              </div>
            )}
          </CardHeader>
          <CardContent>
            <Tabs defaultValue={referralInfo ? "register" : "login"} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4 md:mb-6">
                <TabsTrigger value="login" disabled={!!referralInfo} className="text-sm">Login</TabsTrigger>
                <TabsTrigger value="register" className="text-sm">Cadastro</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="seu@email.com"
                        className="pl-9"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="password">Senha</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="password"
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
                    disabled={isLoading}
                  >
                    {isLoading ? "Entrando..." : "Entrar"}
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="register">
                <form onSubmit={handleRegister} className="space-y-4">
                  {/* Foto de Perfil */}
                  <div className="space-y-2">
                    <Label>Foto de Perfil</Label>
                    <div className="flex items-center space-x-4">
                      <Avatar className="h-16 w-16">
                        <AvatarImage src={`https://images.unsplash.com/${selectedAvatar}?w=400&h=400&fit=crop&crop=face`} />
                        <AvatarFallback>
                          <Camera className="h-6 w-6" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="grid grid-cols-4 gap-2">
                        {avatarOptions.map((avatar) => (
                          <button
                            key={avatar}
                            type="button"
                            onClick={() => setSelectedAvatar(avatar)}
                            className={`relative rounded-full overflow-hidden border-2 transition-all ${
                              selectedAvatar === avatar 
                                ? "border-primary shadow-lg scale-105" 
                                : "border-muted hover:border-primary/50"
                            }`}
                          >
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={`https://images.unsplash.com/${avatar}?w=400&h=400&fit=crop&crop=face`} />
                            </Avatar>
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
                    <Label htmlFor="register-email">Email</Label>
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

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">Cidade</Label>
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
                      <Label htmlFor="state">Estado</Label>
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
                    <Label htmlFor="register-password">Senha</Label>
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
                    disabled={isLoading}
                  >
                    {isLoading ? "Criando conta..." : "Criar conta"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;