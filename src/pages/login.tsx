import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { Lock, Mail, TrendingUp, Bitcoin, DollarSign, Zap } from "lucide-react";

// Componente de animação de criptomoedas flutuantes
const FloatingCrypto = ({ icon: Icon, delay = 0, duration = 20 }: { icon: any, delay?: number, duration?: number }) => {
  const size = Math.random() * 30 + 25;
  const opacity = Math.random() * 0.3 + 0.1;
  
  return (
    <div 
      className="absolute text-primary animate-float-crypto"
      style={{
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        animationDelay: `${delay}s`,
        animationDuration: `${duration}s`,
        opacity,
        transform: 'translateZ(0)'
      }}
    >
      <Icon 
        size={size} 
        className="drop-shadow-lg filter" 
        style={{
          filter: 'drop-shadow(0 0 10px hsl(45 100% 50% / 0.3))'
        }}
      />
    </div>
  );
};

// Componente de partículas flutuantes
const FloatingParticles = () => {
  const cryptoIcons = [Bitcoin, DollarSign, TrendingUp, Zap];
  const particles = Array.from({ length: 15 }, (_, i) => {
    const Icon = cryptoIcons[Math.floor(Math.random() * cryptoIcons.length)];
    return (
      <FloatingCrypto 
        key={i} 
        icon={Icon} 
        delay={Math.random() * 10} 
        duration={15 + Math.random() * 10}
      />
    );
  });
  
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {particles}
    </div>
  );
};

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const { error } = await signIn(email, password);
      
      if (error) {
        console.error("Erro no login:", error.message);
        // Aqui você pode adicionar um toast ou alert para mostrar o erro
      } else {
        console.log("Login realizado com sucesso!");
        navigate('/dashboard');
      }
    } catch (error) {
      console.error("Erro inesperado:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4 relative overflow-hidden">
      <FloatingParticles />
      
      {/* Efeito de brilho no fundo */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent animate-pulse" />
      
      <Card className="w-full max-w-md relative z-10 backdrop-blur-sm bg-background/95 border-primary/20 shadow-2xl animate-shimmer">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Alphabit Login
          </CardTitle>
          <CardDescription className="text-muted-foreground/80">
            Entre com suas credenciais para acessar sua conta de trading
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2 text-sm font-medium">
                <Mail className="h-4 w-4 text-primary" />
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border-primary/20 focus:border-primary transition-colors"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="flex items-center gap-2 text-sm font-medium">
                <Lock className="h-4 w-4 text-primary" />
                Senha
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="border-primary/20 focus:border-primary transition-colors"
                required
              />
            </div>
            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 transition-all duration-300 transform hover:scale-[1.02] shadow-lg" 
              disabled={isLoading}
            >
              <div className="flex items-center gap-2">
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                    Entrando...
                  </>
                ) : (
                  <>
                    <TrendingUp className="h-4 w-4" />
                    Entrar na Plataforma
                  </>
                )}
              </div>
            </Button>
          </form>
          <div className="mt-6 text-center">
            <div className="text-sm text-muted-foreground/80">
              Não tem uma conta?{" "}
              <Link to="/register" className="text-primary hover:text-primary/80 font-medium hover:underline transition-colors">
                Cadastre-se agora
              </Link>
            </div>
            <div className="mt-3 text-xs text-muted-foreground/60">
              🚀 Plataforma de Trading de Criptomoedas
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;