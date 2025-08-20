import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Lock, Mail, User, CreditCard, Eye, EyeOff, ArrowLeft, Phone } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { signInWithGoogle } from "@/utils/auth";

const Register = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    username: "",
    cpf: "",
    email: "",
    whatsapp: "",
    password: "",
    confirmPassword: ""
  });
  const [referralCode, setReferralCode] = useState("");
  const [referrerName, setReferrerName] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, signUp, signIn } = useAuth();

  // Redirect if already authenticated
  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  // Capturar código de indicação da URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const refCode = urlParams.get('ref');
    const refName = urlParams.get('name');
    if (refCode) {
      setReferralCode(refCode);
      console.log('🎯 Código de indicação capturado:', refCode);
    }
    if (refName) {
      setReferrerName(decodeURIComponent(refName));
      console.log('👤 Nome do indicador capturado:', refName);
    }
  }, []);

  // Teste automático comentado para evitar execução automática
  // useEffect(() => {
  //   console.log('🧪 === TESTE AUTOMÁTICO DE CADASTRO ===');
  //   testarCadastroAutomatico();
  // }, []);

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

  // Validation functions
  const validateCPF = (cpf: string) => {
    const cleanCPF = cpf.replace(/\D/g, '');
    if (cleanCPF.length !== 11) return false;
    
    // Check for repeated digits
    if (/^(\d)\1{10}$/.test(cleanCPF)) return false;
    
    // Validate first digit
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cleanCPF.charAt(i)) * (10 - i);
    }
    let remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cleanCPF.charAt(9))) return false;
    
    // Validate second digit
    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cleanCPF.charAt(i)) * (11 - i);
    }
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cleanCPF.charAt(10))) return false;
    
    return true;
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string) => {
    return password.length >= 6;
  };

  const validateWhatsApp = (whatsapp: string) => {
    const cleanWhatsApp = whatsapp.replace(/\D/g, '');
    return cleanWhatsApp.length >= 10 && cleanWhatsApp.length <= 11;
  };

  // Google OAuth login
  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      console.log('🔄 Iniciando cadastro com Google...');
      await signInWithGoogle();
    } catch (error: any) {
      console.error('❌ Erro no cadastro com Google:', error);
      toast({
        title: "Erro no cadastro",
        description: error.message || "Erro ao fazer cadastro com Google",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = "Nome é obrigatório";
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "Sobrenome é obrigatório";
    }

    if (!formData.username.trim()) {
      newErrors.username = "Nome de usuário é obrigatório";
    } else if (formData.username.length < 3) {
      newErrors.username = "Nome de usuário deve ter pelo menos 3 caracteres";
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      newErrors.username = "Nome de usuário deve conter apenas letras, números e _";
    }

    if (!formData.cpf) {
      newErrors.cpf = "CPF é obrigatório";
    } else if (!validateCPF(formData.cpf)) {
      newErrors.cpf = "CPF inválido";
    }

    if (!formData.email) {
      newErrors.email = "Email é obrigatório";
    } else if (!validateEmail(formData.email)) {
      newErrors.email = "Email inválido";
    }

    if (!formData.whatsapp) {
      newErrors.whatsapp = "WhatsApp é obrigatório";
    } else if (!/^\(\d{2}\) \d{5}-\d{4}$/.test(formData.whatsapp)) {
      newErrors.whatsapp = "WhatsApp deve estar no formato (11) 99999-9999";
    }

    if (!formData.password) {
      newErrors.password = "Senha é obrigatória";
    } else if (!validatePassword(formData.password)) {
      newErrors.password = "Senha deve ter pelo menos 6 caracteres";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Confirme sua senha";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Senhas não coincidem";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: string, value: string) => {
    let processedValue = value;
    
    // Apply CPF mask
    if (field === 'cpf') {
      processedValue = formatCPF(value);
    }
    
    // Apply WhatsApp mask
    if (field === 'whatsapp') {
      processedValue = formatWhatsApp(value);
    }
    
    setFormData(prev => ({
      ...prev,
      [field]: processedValue
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ""
      }));
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prevenir múltiplas submissões
    if (isSubmitting) {
      toast({
        title: "⏳ Aguarde",
        description: "Cadastro em andamento, aguarde...",
        variant: "default"
      });
      return;
    }
    
    if (!validateForm()) {
      toast({
        title: "❌ Erro na validação",
        description: "Por favor, corrija os campos em vermelho",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    setIsSubmitting(true);
    
    console.log('🔄 Iniciando cadastro normal...', formData);
    
    try {
      console.log('🔄 Iniciando cadastro real...', formData);
      
      const { error } = await signUp(formData.email, formData.password, {
        firstName: formData.firstName,
        lastName: formData.lastName,
        username: formData.username,
        cpf: formData.cpf,
        whatsapp: formData.whatsapp,
        referralCode: referralCode
      });
      
      if (error) {
        console.error('❌ Erro no cadastro:', error);
        
        // Tratar erros específicos
        let errorMessage = error.message || "Erro interno do sistema";
        
        if (error.message.includes('security purposes')) {
          errorMessage = "Aguarde alguns segundos antes de tentar novamente";
        } else if (error.message.includes('already registered')) {
          errorMessage = "Este email já está cadastrado";
        } else if (error.message.includes('Invalid email')) {
          errorMessage = "Email inválido";
        } else if (error.message.includes('Password should be at least')) {
          errorMessage = "A senha deve ter pelo menos 6 caracteres";
        }
        
        toast({
          title: "❌ Erro no cadastro",
          description: errorMessage,
          variant: "destructive"
        });
        return;
      }
      
      toast({
        title: "✅ Cadastro realizado!",
        description: "Conta criada com sucesso! Você já pode fazer login.",
      });
      
      // Redirecionar para login
      setTimeout(() => {
        navigate('/login');
      }, 2000);

    } catch (error: any) {
      console.error('❌ Erro no cadastro:', error);
      
      toast({
        title: "❌ Erro no cadastro",
        description: error.message || "Erro interno do sistema",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
      setIsSubmitting(false);
    }
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
          {/* Back to Login Button */}
          <div className="mb-6 animate-fade-in-up">
            <Link to="/login">
              <Button 
                variant="ghost" 
                className="text-white hover:bg-white/5 transition-all duration-200 transform hover:scale-[1.02] text-sm font-medium flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Voltar ao Login
              </Button>
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
              <p className="text-gray-400 text-sm mt-1">Criar Nova Conta</p>
            </div>
          </div>

          {/* Register Card */}
          <Card className="bg-gradient-to-b from-gray-900/80 to-black/80 backdrop-blur-xl border-white/10 shadow-2xl animate-fade-in-up animation-delay-400 rounded-3xl overflow-hidden">
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-white text-xl font-semibold">
                Cadastro de Usuário
              </CardTitle>
              {referralCode && (
                <div className="mt-3 p-3 bg-gradient-to-r from-yellow-500/20 to-yellow-400/10 border border-yellow-500/30 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <User className="h-4 w-4 text-yellow-400" />
                    <p className="text-yellow-400 text-sm font-medium">
                      Você foi indicado por: <span className="font-bold">{referrerName || referralCode}</span>
                    </p>
                  </div>
                  <p className="text-yellow-300/80 text-xs">
                    ✨ Parabéns! Você terá vantagens especiais ao se cadastrar
                  </p>
                </div>
              )}
            </CardHeader>
            <CardContent>
                <form onSubmit={handleRegister} className="space-y-4">
                {/* Name Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in-up animation-delay-600">
                  {/* First Name */}
                  <div className="space-y-2">
                    <div className="relative group">
                      <User className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-white transition-colors duration-200" />
                      <Input
                        id="firstName"
                        name="firstName"
                        type="text"
                        value={formData.firstName}
                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                        placeholder="Nome"
                        className={`pl-12 pr-4 py-3 bg-transparent border-0 border-b-2 ${errors.firstName ? 'border-red-500' : 'border-white/20'} text-white placeholder-gray-400 focus:border-yellow-400 focus:ring-0 transition-all duration-200 rounded-none`}
                        required
                      />
                    </div>
                    {errors.firstName && (
                      <p className="text-red-400 text-xs">{errors.firstName}</p>
                    )}
                  </div>

                  {/* Last Name */}
                  <div className="space-y-2">
                    <div className="relative group">
                      <User className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-white transition-colors duration-200" />
                      <Input
                        id="lastName"
                        name="lastName"
                        type="text"
                        value={formData.lastName}
                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                        placeholder="Sobrenome"
                        className={`pl-12 pr-4 py-3 bg-transparent border-0 border-b-2 ${errors.lastName ? 'border-red-500' : 'border-white/20'} text-white placeholder-gray-400 focus:border-yellow-400 focus:ring-0 transition-all duration-200 rounded-none`}
                        required
                      />
                    </div>
                    {errors.lastName && (
                      <p className="text-red-400 text-xs">{errors.lastName}</p>
                    )}
                    </div>
                  </div>

                {/* Username Field */}
                <div className="space-y-2 animate-fade-in-up animation-delay-700">
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-white transition-colors duration-200" />
                        <Input
                      id="username"
                      name="username"
                          type="text"
                      value={formData.username}
                      onChange={(e) => handleInputChange('username', e.target.value)}
                      placeholder="Nome de usuário"
                      className={`pl-12 pr-4 py-3 bg-transparent border-0 border-b-2 ${errors.username ? 'border-red-500' : 'border-white/20'} text-white placeholder-gray-400 focus:border-yellow-400 focus:ring-0 transition-all duration-200 rounded-none`}
                          required
                        />
                      </div>
                  {errors.username && (
                    <p className="text-red-400 text-xs">{errors.username}</p>
                  )}
                    </div>
                    
                {/* CPF Field */}
                <div className="space-y-2 animate-fade-in-up animation-delay-800">
                  <div className="relative group">
                    <CreditCard className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-white transition-colors duration-200" />
                        <Input
                      id="cpf"
                      name="cpf"
                          type="text"
                      value={formData.cpf}
                      onChange={(e) => handleInputChange('cpf', e.target.value)}
                      placeholder="CPF (000.000.000-00)"
                      maxLength={14}
                      className={`pl-12 pr-4 py-3 bg-transparent border-0 border-b-2 ${errors.cpf ? 'border-red-500' : 'border-white/20'} text-white placeholder-gray-400 focus:border-yellow-400 focus:ring-0 transition-all duration-200 rounded-none`}
                          required
                        />
                      </div>
                  {errors.cpf && (
                    <p className="text-red-400 text-xs">{errors.cpf}</p>
                  )}
                    </div>

                                {/* Email Field */}
                <div className="space-y-2 animate-fade-in-up animation-delay-900">
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-white transition-colors duration-200" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="Email"
                      className={`pl-12 pr-4 py-3 bg-transparent border-0 border-b-2 ${errors.email ? 'border-red-500' : 'border-white/20'} text-white placeholder-gray-400 focus:border-yellow-400 focus:ring-0 transition-all duration-200 rounded-none`}
                      required
                    />
                  </div>
                  {errors.email && (
                    <p className="text-red-400 text-xs">{errors.email}</p>
                  )}
                </div>

                {/* WhatsApp Field */}
                <div className="space-y-2 animate-fade-in-up animation-delay-1000">
                  <div className="relative group">
                    <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-white transition-colors duration-200" />
                    <Input
                      id="whatsapp"
                      name="whatsapp"
                      type="text"
                      value={formData.whatsapp}
                      onChange={(e) => handleInputChange('whatsapp', e.target.value)}
                      placeholder="WhatsApp (11) 99999-9999"
                      maxLength={15}
                      className={`pl-12 pr-4 py-3 bg-transparent border-0 border-b-2 ${errors.whatsapp ? 'border-red-500' : 'border-white/20'} text-white placeholder-gray-400 focus:border-yellow-400 focus:ring-0 transition-all duration-200 rounded-none`}
                      required
                    />
                  </div>
                  {errors.whatsapp && (
                    <p className="text-red-400 text-xs">{errors.whatsapp}</p>
                  )}
                  </div>
                  
                {/* Password Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in-up animation-delay-1100">
                  {/* Password */}
                  <div className="space-y-2">
                    <div className="relative group">
                      <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-white transition-colors duration-200" />
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={(e) => handleInputChange('password', e.target.value)}
                        placeholder="Senha"
                        className={`pl-12 pr-12 py-3 bg-transparent border-0 border-b-2 ${errors.password ? 'border-red-500' : 'border-white/20'} text-white placeholder-gray-400 focus:border-yellow-400 focus:ring-0 transition-all duration-200 rounded-none`}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors duration-200"
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="text-red-400 text-xs">{errors.password}</p>
                    )}
                  </div>
                  
                  {/* Confirm Password */}
                  <div className="space-y-2">
                    <div className="relative group">
                      <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-white transition-colors duration-200" />
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        value={formData.confirmPassword}
                        onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                        placeholder="Confirmar Senha"
                        className={`pl-12 pr-12 py-3 bg-transparent border-0 border-b-2 ${errors.confirmPassword ? 'border-red-500' : 'border-white/20'} text-white placeholder-gray-400 focus:border-yellow-400 focus:ring-0 transition-all duration-200 rounded-none`}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors duration-200"
                      >
                        {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <p className="text-red-400 text-xs">{errors.confirmPassword}</p>
                    )}
                  </div>
                </div>

                {/* Terms and Conditions */}
                <div className="flex items-start space-x-2 animate-fade-in-up animation-delay-1200">
                  <input
                    type="checkbox"
                    id="terms"
                    className="mt-1 rounded border-white/20 bg-transparent text-yellow-400 focus:ring-yellow-400"
                    required
                  />
                  <label htmlFor="terms" className="text-sm text-gray-300">
                    Concordo com os{" "}
                    <a href="#" className="text-yellow-400 hover:text-yellow-300 underline">
                      Termos de Uso
                    </a>{" "}
                    e{" "}
                    <a href="#" className="text-yellow-400 hover:text-yellow-300 underline">
                      Política de Privacidade
                    </a>
                  </label>
                </div>

                                {/* Register Button */}
                  <Button 
                    type="submit" 
                    disabled={isLoading}
                  className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-semibold py-4 rounded-2xl transform hover:scale-[1.02] transition-all duration-200 shadow-lg hover:shadow-yellow-500/25 animate-fade-in-up animation-delay-1300 text-lg disabled:opacity-50 disabled:cursor-not-allowed" 
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black mr-2"></div>
                      Criando conta...
                    </span>
                  ) : (
                    "Criar Conta"
                  )}
                  </Button>
                </form>

                {/* Divider */}
                <div className="flex items-center my-6 animate-fade-in-up animation-delay-1400">
                  <div className="flex-1 border-t border-white/10"></div>
                  <span className="px-4 text-gray-400 text-sm">ou</span>
                  <div className="flex-1 border-t border-white/10"></div>
                </div>

                {/* Google Login Button */}
                <Button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={isLoading}
                  className="w-full bg-white hover:bg-gray-100 text-black font-semibold py-4 rounded-2xl transform hover:scale-[1.02] transition-all duration-200 shadow-lg animate-fade-in-up animation-delay-1500 text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  {isLoading ? "Cadastrando..." : "Cadastrar com Google"}
                </Button>

              {/* Login Link */}
              <div className="mt-6 pt-6 border-t border-white/10 animate-fade-in-up animation-delay-1400">
                <p className="text-center text-gray-400 mb-4 text-sm">
                    Já tem uma conta?
                  </p>
                  <Link to="/login">
                    <Button 
                    variant="ghost" 
                    className="w-full text-white hover:bg-white/5 transition-all duration-200 transform hover:scale-[1.02] text-sm font-medium"
                    >
                      Fazer Login
                    </Button>
                  </Link>
            </div>
          </CardContent>
        </Card>
      </div>
      </div>

      <style>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes gradient-x {
          0%, 100% {
            background-size: 200% 200%;
            background-position: left center;
          }
          50% {
            background-size: 200% 200%;
            background-position: right center;
          }
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out forwards;
        }
        
        .animate-gradient-x {
          animation: gradient-x 3s ease infinite;
        }
        
        .animation-delay-200 {
          animation-delay: 0.2s;
        }
        
        .animation-delay-400 {
          animation-delay: 0.4s;
        }
        
        .animation-delay-600 {
          animation-delay: 0.6s;
        }
        
        .animation-delay-700 {
          animation-delay: 0.7s;
        }
        
        .animation-delay-800 {
          animation-delay: 0.8s;
        }
        
        .animation-delay-900 {
          animation-delay: 0.9s;
        }
        
        .animation-delay-1000 {
          animation-delay: 1.0s;
        }
        
        .animation-delay-1100 {
          animation-delay: 1.1s;
        }
        
        .animation-delay-1200 {
          animation-delay: 1.2s;
        }
        
        .animation-delay-1300 {
          animation-delay: 1.3s;
        }
        
        .animation-delay-1400 {
          animation-delay: 1.4s;
        }
        
        @keyframes float {
          0%, 100% {
            transform: translateY(0px) rotate(45deg);
          }
          50% {
            transform: translateY(-10px) rotate(45deg);
          }
        }
        
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        
        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        
        .animate-spin-slow {
          animation: spin-slow 20s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default Register;
