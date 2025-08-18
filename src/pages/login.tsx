import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { Lock, Mail, ArrowRight } from "lucide-react";

const Login = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { signIn, user } = useAuth();

  // Redirect if already authenticated
  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    const { error } = await signIn(email, password);
    
    if (!error) {
      navigate("/dashboard");
    }
    
    setIsLoading(false);
  };


  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-gray-900 via-black to-gray-800">
      {/* Binance-inspired Background */}
      <div className="absolute inset-0">
        {/* Main gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-800"></div>
        
        {/* Geometric patterns */}
        <div className="absolute inset-0 opacity-20">
          {/* Large diamond shapes */}
          <div className="absolute top-20 left-20 w-32 h-32 border-2 border-yellow-400 transform rotate-45 animate-pulse"></div>
          <div className="absolute top-40 right-32 w-24 h-24 border-2 border-yellow-400 transform rotate-45 animate-pulse animation-delay-400"></div>
          <div className="absolute bottom-32 left-1/3 w-28 h-28 border-2 border-yellow-400 transform rotate-45 animate-pulse animation-delay-800"></div>
          
          {/* Hexagonal patterns */}
          <div className="absolute top-1/4 left-1/2 w-16 h-16 border-2 border-yellow-400 transform rotate-12 animate-spin-slow"></div>
          <div className="absolute bottom-1/4 right-1/4 w-20 h-20 border-2 border-yellow-400 transform -rotate-12 animate-spin-slow animation-delay-600"></div>
        </div>
        
        {/* Floating geometric elements */}
        <div className="absolute inset-0">
          {/* Yellow accent shapes */}
          <div className="absolute top-16 left-1/4 w-4 h-4 bg-yellow-400 transform rotate-45 animate-float"></div>
          <div className="absolute top-32 right-1/3 w-3 h-3 bg-yellow-400 rounded-full animate-float animation-delay-200"></div>
          <div className="absolute bottom-40 left-1/5 w-5 h-5 bg-yellow-400 transform rotate-45 animate-float animation-delay-400"></div>
          <div className="absolute bottom-24 right-1/5 w-3 h-3 bg-yellow-400 rounded-full animate-float animation-delay-600"></div>
          
          {/* Grid pattern overlay */}
          <div className="absolute inset-0 opacity-10">
            <div className="grid grid-cols-12 gap-8 h-full">
              {Array.from({ length: 48 }).map((_, i) => (
                <div key={i} className="border border-yellow-400/20 animate-pulse" style={{ animationDelay: `${i * 100}ms` }}></div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Dynamic lines */}
        <div className="absolute inset-0">
          <div className="absolute top-1/3 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-yellow-400 to-transparent opacity-30 animate-pulse"></div>
          <div className="absolute bottom-1/3 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-yellow-400 to-transparent opacity-30 animate-pulse animation-delay-800"></div>
          <div className="absolute left-1/4 top-0 w-0.5 h-full bg-gradient-to-b from-transparent via-yellow-400 to-transparent opacity-20 animate-pulse animation-delay-400"></div>
          <div className="absolute right-1/4 top-0 w-0.5 h-full bg-gradient-to-b from-transparent via-yellow-400 to-transparent opacity-20 animate-pulse animation-delay-1200"></div>
        </div>

        {/* Binance-style particles */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-16 w-2 h-2 bg-yellow-400 rounded-full animate-ping"></div>
          <div className="absolute top-48 right-20 w-1 h-1 bg-yellow-400 rounded-full animate-ping animation-delay-300"></div>
          <div className="absolute bottom-32 left-24 w-1.5 h-1.5 bg-yellow-400 rounded-full animate-ping animation-delay-600"></div>
          <div className="absolute bottom-48 right-32 w-1 h-1 bg-yellow-400 rounded-full animate-ping animation-delay-900"></div>
        </div>

        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-lg">
          {/* Back to Register Button */}
          <div className="mb-6 animate-fade-in-up">
            <Link to="/register" className="inline-flex items-center text-gray-400 hover:text-white transition-colors duration-200">
              <ArrowRight className="h-4 w-4 mr-2 transform rotate-180" />
              <span className="text-sm">Voltar ao Cadastro</span>
            </Link>
          </div>

          {/* Crypto Finance Logo */}
          <div className="text-center mb-8 animate-fade-in-up">
            <div className="flex justify-center mb-6">
              <div className="relative">
                {/* Binance-inspired Logo Container */}
                <div className="w-24 h-24 bg-gradient-to-br from-gray-900 to-black rounded-2xl flex items-center justify-center border-2 border-yellow-400/30 shadow-2xl transform hover:scale-105 transition-transform duration-300">
                  {/* Binance-style Diamond Pattern */}
                  <div className="relative">
                    {/* Main diamond shape */}
                    <div className="w-12 h-12 relative">
                      {/* Outer diamond */}
                      <div className="absolute inset-0 border-2 border-yellow-400 transform rotate-45 animate-pulse"></div>
                      {/* Inner diamond */}
                      <div className="absolute inset-2 border-2 border-yellow-400 transform rotate-45 opacity-60"></div>
                      {/* Center dot */}
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-yellow-400 rounded-full animate-ping"></div>
                      
                      {/* Corner accents */}
                      <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-yellow-400 rounded-full"></div>
                      <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-yellow-400 rounded-full"></div>
                      <div className="absolute top-1/2 -left-1 transform -translate-y-1/2 w-1 h-1 bg-yellow-400 rounded-full"></div>
                      <div className="absolute top-1/2 -right-1 transform -translate-y-1/2 w-1 h-1 bg-yellow-400 rounded-full"></div>
                    </div>
                  </div>
                </div>

                {/* Floating elements */}
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 transform rotate-45 animate-float"></div>
                <div className="absolute -bottom-2 -left-2 w-4 h-4 bg-yellow-400 rounded-full animate-pulse"></div>
                
                {/* Connection lines */}
                <div className="absolute top-1/2 -left-8 w-6 h-0.5 bg-gradient-to-r from-transparent to-yellow-400 opacity-60 animate-pulse"></div>
                <div className="absolute top-1/2 -right-8 w-6 h-0.5 bg-gradient-to-l from-transparent to-yellow-400 opacity-60 animate-pulse animation-delay-400"></div>
              </div>
            </div>
            
            {/* Brand Name */}
            <div className="mb-2">
              <h1 className="text-2xl font-bold text-white tracking-wider">
                <span className="bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-500 bg-clip-text text-transparent">
                  ALPHABIT
                </span>
              </h1>
              <p className="text-gray-400 text-sm mt-1">Entrar na Conta</p>
            </div>
          </div>

          {/* Login Card */}
          <Card className="bg-gradient-to-b from-gray-900/80 to-black/80 backdrop-blur-xl border-white/10 shadow-2xl animate-fade-in-up animation-delay-400 rounded-3xl overflow-hidden">
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-white text-xl font-semibold">
                Entrar na Conta
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-6">
                {/* Email Field */}
                <div className="space-y-2 animate-fade-in-up animation-delay-600">
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-white transition-colors duration-200" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="seu@email.com"
                      className="pl-12 pr-4 py-3 bg-transparent border-0 border-b-2 border-white/20 text-white placeholder-gray-400 focus:border-yellow-400 focus:ring-0 transition-all duration-200 rounded-none"
                      required
                    />
                  </div>
                </div>
                
                {/* Password Field */}
                <div className="space-y-2 animate-fade-in-up animation-delay-700">
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-white transition-colors duration-200" />
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="pl-12 pr-4 py-3 bg-transparent border-0 border-b-2 border-white/20 text-white placeholder-gray-400 focus:border-yellow-400 focus:ring-0 transition-all duration-200 rounded-none"
                      required
                    />
                  </div>
                </div>
                
                {/* Login Button */}
                <div className="animate-fade-in-up animation-delay-800">
                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-black font-semibold py-3 rounded-xl transform hover:scale-[1.02] transition-all duration-200 shadow-lg hover:shadow-yellow-400/25" 
                    disabled={isLoading}
                  >
                    {isLoading ? "Entrando..." : "Entrar"}
                    {!isLoading && <ArrowRight className="ml-2 h-4 w-4" />}
                  </Button>
                </div>
              </form>

              {/* Register Link */}
              <div className="mt-8 pt-6 border-t border-white/10 animate-fade-in-up animation-delay-900">
                <p className="text-center text-sm text-gray-400 mb-4">
                  Ainda não tem uma conta?
                </p>
                <Link to="/register">
                  <Button 
                    variant="outline" 
                    className="w-full border-yellow-400/30 text-yellow-400 hover:bg-yellow-400/10 hover:border-yellow-400 transition-all duration-200 py-3 rounded-xl"
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