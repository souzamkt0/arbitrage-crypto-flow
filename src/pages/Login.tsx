import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Lock, Mail, User, TrendingUp } from "lucide-react";

const Login = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [referralInfo, setReferralInfo] = useState<{code: string, referrerName: string} | null>(null);
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
      name: formData.get("name"),
      email: formData.get("email"),
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
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="name"
                        name="name"
                        type="text"
                        placeholder="Seu nome"
                        className="pl-9"
                        required
                      />
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
                        placeholder="seu@email.com"
                        className="pl-9"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="register-password">Senha</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="register-password"
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