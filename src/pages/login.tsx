import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { Lock, Mail, ArrowRight } from "lucide-react";
import { signInWithGoogle } from "@/utils/auth";
import { useToast } from "@/hooks/use-toast";

const Login = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { signIn, user } = useAuth();
  const { toast } = useToast();

  // Redirect if already authenticated
  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    console.log('🔑 Iniciando processo de login...', { email });
    
    const { error } = await signIn(email, password);
    
    if (error) {
      console.error('❌ Erro retornado do signIn:', error);
      toast({
        title: "Erro no login",
        description: error.message || "Erro desconhecido",
        variant: "destructive",
      });
    } else {
      console.log('✅ Login realizado com sucesso, redirecionando...');
      navigate("/dashboard");
    }
    
    setIsLoading(false);
  };

  // Google OAuth login
  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      console.log('🔄 Iniciando login com Google...');
      await signInWithGoogle();
    } catch (error: any) {
      console.error('❌ Erro no login com Google:', error);
      toast({
        title: "Erro no login",
        description: error.message || "Erro ao fazer login com Google",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-background">
      {/* Clean Background */}
      <div className="absolute inset-0">
        {/* Main gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-muted to-background"></div>
        
        {/* Geometric patterns */}
        <div className="absolute inset-0 opacity-10">
          {/* Large diamond shapes */}
          <div className="absolute top-20 left-20 w-32 h-32 border-2 border-primary transform rotate-45 animate-pulse"></div>
          <div className="absolute top-40 right-32 w-24 h-24 border-2 border-primary transform rotate-45 animate-pulse animation-delay-400"></div>
          <div className="absolute bottom-32 left-1/3 w-28 h-28 border-2 border-primary transform rotate-45 animate-pulse animation-delay-800"></div>
          
          {/* Hexagonal patterns */}
          <div className="absolute top-1/4 left-1/2 w-16 h-16 border-2 border-primary transform rotate-12 animate-spin-slow"></div>
          <div className="absolute bottom-1/4 right-1/4 w-20 h-20 border-2 border-primary transform -rotate-12 animate-spin-slow animation-delay-600"></div>
        </div>
        
        {/* Floating geometric elements */}
        <div className="absolute inset-0">
          {/* Primary accent shapes */}
          <div className="absolute top-16 left-1/4 w-4 h-4 bg-primary transform rotate-45 animate-float"></div>
          <div className="absolute top-32 right-1/3 w-3 h-3 bg-primary rounded-full animate-float animation-delay-200"></div>
          <div className="absolute bottom-40 left-1/5 w-5 h-5 bg-primary transform rotate-45 animate-float animation-delay-400"></div>
          <div className="absolute bottom-24 right-1/5 w-3 h-3 bg-primary rounded-full animate-float animation-delay-600"></div>
          
          {/* Grid pattern overlay */}
          <div className="absolute inset-0 opacity-5">
            <div className="grid grid-cols-12 gap-8 h-full">
              {Array.from({ length: 48 }).map((_, i) => (
                <div key={i} className="border border-primary/20 animate-pulse" style={{ animationDelay: `${i * 100}ms` }}></div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Dynamic lines */}
        <div className="absolute inset-0">
          <div className="absolute top-1/3 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent opacity-20 animate-pulse"></div>
          <div className="absolute bottom-1/3 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent opacity-20 animate-pulse animation-delay-800"></div>
          <div className="absolute left-1/4 top-0 w-0.5 h-full bg-gradient-to-b from-transparent via-primary to-transparent opacity-10 animate-pulse animation-delay-400"></div>
          <div className="absolute right-1/4 top-0 w-0.5 h-full bg-gradient-to-b from-transparent via-primary to-transparent opacity-10 animate-pulse animation-delay-1200"></div>
        </div>

        {/* Floating particles */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-16 w-2 h-2 bg-primary rounded-full animate-ping"></div>
          <div className="absolute top-48 right-20 w-1 h-1 bg-primary rounded-full animate-ping animation-delay-300"></div>
          <div className="absolute bottom-32 left-24 w-1.5 h-1.5 bg-primary rounded-full animate-ping animation-delay-600"></div>
          <div className="absolute bottom-48 right-32 w-1 h-1 bg-primary rounded-full animate-ping animation-delay-900"></div>
        </div>

        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-background/30"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-lg">
          {/* Back to Register Button */}
          <div className="mb-6 animate-fade-in-up">
            <Link to="/register" className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors duration-200">
              <ArrowRight className="h-4 w-4 mr-2 transform rotate-180" />
              <span className="text-sm">Voltar ao Cadastro</span>
            </Link>
          </div>

          {/* Logo */}
          <div className="text-center mb-8 animate-fade-in-up">
            <div className="flex justify-center mb-6">
              <div className="relative">
                {/* Logo Container */}
                <div className="w-24 h-24 bg-gradient-to-br from-muted to-background rounded-2xl flex items-center justify-center border-2 border-primary/30 shadow-2xl transform hover:scale-105 transition-transform duration-300">
                  {/* Diamond Pattern */}
                  <div className="relative">
                    {/* Main diamond shape */}
                    <div className="w-12 h-12 relative">
                      {/* Outer diamond */}
                      <div className="absolute inset-0 border-2 border-primary transform rotate-45 animate-pulse"></div>
                      {/* Inner diamond */}
                      <div className="absolute inset-2 border-2 border-primary transform rotate-45 opacity-60"></div>
                      {/* Center dot */}
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-primary rounded-full animate-ping"></div>
                      
                      {/* Corner accents */}
                      <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary rounded-full"></div>
                      <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary rounded-full"></div>
                      <div className="absolute top-1/2 -left-1 transform -translate-y-1/2 w-1 h-1 bg-primary rounded-full"></div>
                      <div className="absolute top-1/2 -right-1 transform -translate-y-1/2 w-1 h-1 bg-primary rounded-full"></div>
                    </div>
                  </div>
                </div>

                {/* Floating elements */}
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-primary transform rotate-45 animate-float"></div>
                <div className="absolute -bottom-2 -left-2 w-4 h-4 bg-primary rounded-full animate-pulse"></div>
                
                {/* Connection lines */}
                <div className="absolute top-1/2 -left-8 w-6 h-0.5 bg-gradient-to-r from-transparent to-primary opacity-60 animate-pulse"></div>
                <div className="absolute top-1/2 -right-8 w-6 h-0.5 bg-gradient-to-l from-transparent to-primary opacity-60 animate-pulse animation-delay-400"></div>
              </div>
            </div>
            
            {/* Brand Name */}
            <div className="mb-2">
              <h1 className="text-2xl font-bold text-foreground tracking-wider">
                <span className="bg-gradient-to-r from-primary via-primary to-primary bg-clip-text text-transparent">
                  ALPHABIT
                </span>
              </h1>
              <p className="text-muted-foreground text-sm mt-1">Entrar na Conta</p>
            </div>
          </div>

          {/* Login Card */}
          <Card className="bg-card/80 backdrop-blur-xl border-border shadow-2xl animate-fade-in-up animation-delay-400 rounded-3xl overflow-hidden">
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-foreground text-xl font-semibold">
                Entrar na Conta
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-6">
                {/* Email Field */}
                <div className="space-y-2 animate-fade-in-up animation-delay-600">
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-foreground transition-colors duration-200" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="seu@email.com"
                      className="pl-12 pr-4 py-3 bg-transparent border-0 border-b-2 border-border text-foreground placeholder-muted-foreground focus:border-primary focus:ring-0 transition-all duration-200 rounded-none"
                      required
                    />
                  </div>
                </div>
                
                {/* Password Field */}
                <div className="space-y-2 animate-fade-in-up animation-delay-700">
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-foreground transition-colors duration-200" />
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="pl-12 pr-4 py-3 bg-transparent border-0 border-b-2 border-border text-foreground placeholder-muted-foreground focus:border-primary focus:ring-0 transition-all duration-200 rounded-none"
                      required
                    />
                  </div>
                </div>
                
                {/* Login Button */}
                <div className="animate-fade-in-up animation-delay-800">
                  <Button 
                    type="submit" 
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 rounded-xl transform hover:scale-[1.02] transition-all duration-200 shadow-lg" 
                    disabled={isLoading}
                  >
                    {isLoading ? "Entrando..." : "Entrar"}
                    {!isLoading && <ArrowRight className="ml-2 h-4 w-4" />}
                  </Button>
                </div>
              </form>

              {/* Divider */}
              <div className="flex items-center my-6 animate-fade-in-up animation-delay-850">
                <div className="flex-1 border-t border-border"></div>
                <span className="px-4 text-muted-foreground text-sm">ou</span>
                <div className="flex-1 border-t border-border"></div>
              </div>

              {/* Google Login Button */}
              <Button
                type="button"
                onClick={handleGoogleLogin}
                disabled={isLoading}
                className="w-full bg-card hover:bg-muted text-foreground font-semibold py-3 rounded-xl transform hover:scale-[1.02] transition-all duration-200 shadow-lg animate-fade-in-up animation-delay-875 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 border border-border"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                {isLoading ? "Entrando..." : "Entrar com Google"}
              </Button>

              {/* Auto Access Button */}
              <Button
                type="button"
                onClick={() => {
                  setEmail("admin@clean.com");
                  setPassword("123456");
                  setTimeout(() => {
                    const form = document.querySelector('form');
                    if (form) {
                      const event = new Event('submit', { cancelable: true, bubbles: true });
                      form.dispatchEvent(event);
                    }
                  }, 100);
                }}
                disabled={isLoading}
                className="w-full mt-4 bg-success hover:bg-success/90 text-success-foreground font-semibold py-3 rounded-xl transform hover:scale-[1.02] transition-all duration-200 shadow-lg animate-fade-in-up animation-delay-900 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Lock className="h-4 w-4" />
                {isLoading ? "Entrando..." : "Acesso Automático Admin"}
              </Button>

              {/* Register Link */}
              <div className="mt-8 pt-6 border-t border-border animate-fade-in-up animation-delay-900">
                <p className="text-center text-sm text-muted-foreground mb-4">
                  Ainda não tem uma conta?
                </p>
                <Link to="/register">
                  <Button 
                    variant="outline" 
                    className="w-full border-primary/30 text-primary hover:bg-primary/10 hover:border-primary transition-all duration-200 py-3 rounded-xl"
                  >
                    Criar conta
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Login;