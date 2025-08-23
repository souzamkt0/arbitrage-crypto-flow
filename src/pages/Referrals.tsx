import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { 
  Users, 
  DollarSign, 
  Search, 
  Copy, 
  Link,
  Phone,
  TrendingUp,
  UserCheck,
  UserX,
  Filter,
  Eye,
  MessageCircle,
  Settings,
  User,
  Key,
  LogOut,
  Menu,
  ArrowLeft,
  Activity,
  Bell,
  Zap,
  Shield,
  Crown,
  Target,
  Rocket,
  Star,
  Gift,
  LineChart,
  PieChart,
  BarChart3,
  Layers,
  Network,
  Share2,
  Globe,
  Smartphone,
  Mail,
  Calendar,
  Award,
  CheckCircle,
  AlertTriangle,
  TrendingDown,
  Hash,
  Download,
  Upload,
  RefreshCw,
  Plus,
  Minus,
  Info,
  MapPin,
  Clock,
  Wifi,
  WifiOff,
  Percent,
  TrendingUpIcon
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ResidualEarnings from "@/components/ResidualEarnings";
import { TradingChart } from "@/components/TradingChart";
import { MarketOverview } from "@/components/MarketOverview";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

interface ReferredUser {
  id: string;
  name: string;
  email: string;
  whatsapp: string;
  plan: string;
  investmentAmount: number;
  commission: number;
  status: "active" | "inactive";
  joinDate: string;
  lastActivity: string;
  city?: string;
  state?: string;
  totalProfit?: number;
  performance?: number;
  activeInvestments?: number;
}

const Referrals = () => {
  console.log('🚀 Referrals component loading...');
  
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [referralLink, setReferralLink] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [whatsappFilter, setWhatsappFilter] = useState<"all" | "with" | "without">("all");
  const [referredUsers, setReferredUsers] = useState<ReferredUser[]>([]);
  const [stats, setStats] = useState({
    totalReferrals: 0,
    activeReferrals: 0,
    totalCommission: 0,
    pendingCommission: 0,
    withWhatsapp: 0,
    withoutWhatsapp: 0
  });
  const [profile, setProfile] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<ReferredUser | null>(null);
  const [selectedMessageType, setSelectedMessageType] = useState<string>("welcome");
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Pre-made message templates with more variety
  const messageTemplates = {
    welcome: {
      title: "🎉 Boas-vindas VIP",
      description: "Mensagem especial de acolhimento para novos usuários",
      template: (userName: string, referrerName: string) => `🚀 *PARABÉNS ${userName.toUpperCase()}!*

🎯 Você acaba de entrar no *ALPHABIT* - o sistema de arbitragem mais avançado do Brasil!

✨ *O que você ganha AGORA:*
💰 Sistema de arbitragem automática 24/7
📈 Lucros de 2-5% ao dia GARANTIDOS
🛡️ Plataforma 100% segura e auditada
👥 Comunidade VIP de traders de elite
🔥 Suporte premium exclusivo

🎁 *BÔNUS ESPECIAL:* Como você foi indicado por mim, tem acesso ao meu suporte PERSONALIZADO!

⚡ *PRÓXIMOS PASSOS:*
1️⃣ Complete seu perfil na plataforma
2️⃣ Faça seu primeiro depósito (mínimo $100)
3️⃣ Ative o bot de arbitragem
4️⃣ Acompanhe seus lucros em tempo real!

💬 Estou aqui para te ajudar 24/7! Me chama AGORA!

🚀 *${referrerName}* - Seu Mentor Alphabit
💎 Equipe Diamante Alphabit`
    },
    follow_up: {
      title: "📊 Check-up Performance", 
      description: "Acompanhar progresso e performance do usuário",
      template: (userName: string, referrerName: string) => `📈 *Oi ${userName}! Como está sua jornada no ALPHABIT?*

🔍 *VAMOS FAZER UM CHECK-UP:*

✅ Já explorou o Dashboard completo?
✅ Entendeu como funciona o sistema de arbitragem?
✅ Fez seu primeiro investimento?
✅ Está acompanhando os lucros diários?

📊 *ESTATÍSTICAS IMPORTANTES:*
• Nossos usuários ganham em média 3.2% ao dia
• 98% dos membros renovam seus investimentos
• Tempo médio para primeiro saque: 24-48h

💡 *DICA PRO:* Diversifique seus investimentos entre os planos para maximizar ganhos!

🤝 Precisa de ajuda com alguma coisa específica?

*${referrerName}* - Seu Analista Pessoal
🏆 Top Performer Alphabit`
    },
    investment: {
      title: "💰 Oportunidade de Investimento",
      description: "Motivar primeiro investimento com dados reais", 
      template: (userName: string, referrerName: string) => `🔥 *${userName}, OPORTUNIDADE IMPERDÍVEL!*

🚨 *ALERT DE MERCADO:* O sistema Alphabit está com performance EXCEPCIONAL!

📈 *RESULTADOS DE HOJE:*
• BTC/USDT: +4.2% em 6 horas
• ETH/USDT: +3.8% em 4 horas  
• BNB/USDT: +5.1% em 8 horas

💎 *RECOMENDAÇÃO PREMIUM:*
📍 Investimento inicial: $500-1000
⚡ Retorno esperado: $25-50/dia
🎯 ROI projetado: 150-300%/mês

🛡️ *GARANTIAS:*
✓ Saque a qualquer momento
✓ Suporte 24/7 dedicado
✓ Transparência total nas operações

⏰ Mercado está quente AGORA! Vamos começar?

💪 Te ajudo com todo o processo!

*${referrerName}* - Especialista em Arbitragem
🥇 Alphabit Elite Team`
    },
    support: {
      title: "🛠️ Suporte Premium",
      description: "Oferecer suporte técnico especializado",
      template: (userName: string, referrerName: string) => `👋 *${userName}, tudo tranquilo por aí?*

🛠️ *SUPORTE PREMIUM ALPHABIT* à sua disposição!

🔧 *POSSO TE AJUDAR COM:*
📱 Configuração completa da conta
💳 Processo de depósito (PIX/TED/Crypto)
🔄 Ativação dos bots de trading
📊 Interpretação dos relatórios
💰 Processo de saque otimizado
📈 Estratégias de reinvestimento

⚡ *SOLUÇÕES RÁPIDAS:*
• Problemas de login ➜ 5 min
• Dúvidas sobre depósito ➜ 10 min
• Config. de arbitragem ➜ 15 min
• Análise de performance ➜ 20 min

💬 *CANAIS DE SUPORTE:*
📞 WhatsApp direto (ESTE)
💻 Plataforma (chat interno)
📧 Email premium
🎥 Chamada de vídeo (casos complexos)

🚀 Qual sua principal dúvida? Respondo em MINUTOS!

*${referrerName}* - Suporte Técnico Premium
⚡ Response Time: < 5 min`
    },
    performance_alert: {
      title: "⚡ Alerta de Performance",
      description: "Notificar sobre performance e oportunidades",
      template: (userName: string, referrerName: string) => `⚡ *ALERTA DE PERFORMANCE - ${userName}!*

🔥 Seu portfólio está com movimento interessante!

📊 *STATUS ATUAL:*
• Lucro acumulado este mês: Verificar na plataforma
• Operações ativas: Em andamento
• Performance média: Acima da meta

🚨 *OPORTUNIDADES DETECTADAS:*
💎 Arbitragem BTC com spread de 4.8%
🚀 Par ETH/USDT com potencial de 6.2%
⭐ Oportunidade ADA com 3.9% garantido

💡 *RECOMENDAÇÃO:*
Considere aumentar sua posição para aproveitar essas oportunidades de alto retorno!

📈 Quer que eu configure isso pra você?

*${referrerName}* - Analista de Performance
📊 Alphabit Analytics Team`
    },
    reactivation: {
      title: "🔄 Reativação Premium",
      description: "Para usuários inativos há alguns dias",
      template: (userName: string, referrerName: string) => `😢 *${userName}, sentimos sua falta!*

🔍 Notei que você não está mais ativo na plataforma...

💔 *O QUE VOCÊ ESTÁ PERDENDO:*
📈 Média de lucros diários: $47/dia
🚀 Oportunidades de arbitragem: 12-18/dia  
💰 ROI médio da comunidade: 247%/mês
🏆 Bônus exclusivos para membros ativos

🎁 *OFERTA ESPECIAL DE VOLTA:*
✨ Bônus de 20% no próximo depósito
⚡ Configuração prioritária dos bots
👑 Acesso ao grupo VIP de sinais
🛡️ Seguro contra perdas (primeiros 30 dias)

🤔 Houve algum problema? Me conta que resolvo!

💪 *VAMOS VOLTAR JUNTOS?*

*${referrerName}* - Seu Parceiro de Sucesso
💎 Alphabit Retention Team`
    },
    custom: {
      title: "✍️ Mensagem Personalizada",
      description: "Escrever sua própria mensagem customizada",
      template: (userName: string, referrerName: string) => `Olá *${userName}*!

[💬 Digite sua mensagem personalizada aqui]

Atenciosamente,
*${referrerName}*
🚀 Alphabit Premium Team`
    }
  };

  useEffect(() => {
    console.log('🚀 useEffect Referrals iniciado');
    console.log('🔍 User atual:', user);
    
    const loadReferralData = async () => {
      if (!user) {
        console.log('❌ Sem usuário, saindo...');
        return;
      }

      try {
        console.log('🔍 Debug Referrals - User ID:', user.id);
        console.log('🔍 Debug Referrals - User Email:', user.email);
        
        // Get user profile with referral code for referral link
        console.log('🔍 Buscando profile para user_id:', user.id);
        const { data: userProfile, error: profileError } = await supabase
          .from('profiles')
          .select('username, referral_code, referral_balance, display_name')
          .eq('user_id', user.id)
          .maybeSingle();

        console.log('🔍 Debug Referrals - Profile encontrado:', userProfile);
        console.log('🔍 Debug Referrals - Profile Error:', profileError);
        
        setProfile(userProfile);

        if (userProfile?.referral_code) {
          const userName = userProfile.display_name || userProfile.username || 'Usuário';
          setReferralLink(`${window.location.origin}/register?ref=${userProfile.referral_code}&name=${encodeURIComponent(userName)}`);
        } else if (userProfile?.username) {
          const userName = userProfile.display_name || userProfile.username || 'Usuário';
          setReferralLink(`${window.location.origin}/register?ref=${userProfile.username}&name=${encodeURIComponent(userName)}`);
        }

        // Buscar usuários indicados com informações detalhadas
        console.log('🔍 Debug Referrals - Buscando usuários indicados por:', user.id);
        
        const { data: referredUsers, error: referralsError } = await supabase
          .from('profiles')
          .select(`
            user_id,
            username, 
            display_name, 
            email, 
            whatsapp, 
            city, 
            state, 
            created_at,
            status,
            balance,
            total_profit,
            referred_by,
            updated_at,
            cpf,
            phone,
            first_name,
            last_name,
            full_name
          `)
          .eq('referred_by', user.id)
          .order('created_at', { ascending: false });

        console.log('🔍 Debug Referrals - Usuários indicados encontrados:', referredUsers);
        
        if (referredUsers && referredUsers.length > 0) {
          // Buscar investimentos ativos dos usuários indicados
          const userIds = referredUsers.map(user => user.user_id);
          const { data: investments } = await supabase
            .from('user_investments')
            .select('user_id, amount, total_earned, status')
            .in('user_id', userIds)
            .eq('status', 'active');

          // Buscar estatísticas de trading
          const { data: tradingStats } = await supabase
            .from('trading_profits')
            .select('user_id, total_profit, investment_amount, completed_operations')
            .in('user_id', userIds);

          // Calcular estatísticas detalhadas
          const activeReferrals = referredUsers.filter(user => user.status === 'active').length;
          const totalCommission = referredUsers.reduce((sum, user) => sum + (user.total_profit || 0) * 0.1, 0); // 10% commission
          
          setStats({
            totalReferrals: referredUsers.length,
            activeReferrals,
            totalCommission,
            pendingCommission: 0,
            withWhatsapp: referredUsers.filter(user => user.whatsapp).length,
            withoutWhatsapp: referredUsers.filter(user => !user.whatsapp).length
          });

          // Converter para o formato esperado com informações detalhadas
          const convertedUsers: ReferredUser[] = referredUsers.map((user) => {
            const userInvestments = investments?.filter(inv => inv.user_id === user.user_id) || [];
            const userTrading = tradingStats?.filter(trade => trade.user_id === user.user_id) || [];
            
            const activeInvestmentsCount = userInvestments.length;
            const totalInvested = userInvestments.reduce((sum, inv) => sum + (inv.amount || 0), 0);
            const totalEarned = userInvestments.reduce((sum, inv) => sum + (inv.total_earned || 0), 0);
            const tradingProfit = userTrading.reduce((sum, trade) => sum + (trade.total_profit || 0), 0);
            
            // Calcular performance (percentual de lucro)
            const performance = totalInvested > 0 ? ((totalEarned + tradingProfit) / totalInvested) * 100 : 0;

            return {
              id: user.user_id,
              name: user.display_name || user.full_name || user.username || 'Usuário',
              email: user.email || '',
              whatsapp: user.whatsapp || '',
              plan: activeInvestmentsCount > 0 ? 'Alphabot Pro' : 'Free',
              investmentAmount: totalInvested,
              commission: (user.total_profit || 0) * 0.1, // 10% commission
              status: user.status as "active" | "inactive",
              joinDate: user.created_at,
              lastActivity: user.updated_at || user.created_at,
              city: user.city,
              state: user.state,
              totalProfit: totalEarned + tradingProfit,
              performance: Math.round(performance * 100) / 100, // Round to 2 decimal places
              activeInvestments: activeInvestmentsCount
            };
          });

          setReferredUsers(convertedUsers);
        } else {
          // Reset all stats to zero
          setStats({
            totalReferrals: 0,
            activeReferrals: 0,
            totalCommission: 0,
            pendingCommission: 0,
            withWhatsapp: 0,
            withoutWhatsapp: 0
          });
          setReferredUsers([]);
        }
      } catch (error) {
        console.error('Erro ao carregar dados de referência:', error);
      }
    };
    
    loadReferralData();
  }, [user]);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      toast({
        title: "✅ LINK COPIED!",
        description: "Your referral link has been copied to clipboard",
      });
    } catch (err) {
      toast({
        title: "Copy Error",
        description: "Could not copy the link",
        variant: "destructive",
      });
    }
  };

  const filteredUsers = referredUsers.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.plan.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || user.status === statusFilter;
    
    const matchesWhatsapp = whatsappFilter === "all" || 
                           (whatsappFilter === "with" && user.whatsapp) ||
                           (whatsappFilter === "without" && !user.whatsapp);
    
    return matchesSearch && matchesStatus && matchesWhatsapp;
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const openMessageModal = (user: ReferredUser) => {
    if (!user.whatsapp) {
      toast({
        title: "❌ WhatsApp indisponível",
        description: "Este usuário não tem WhatsApp cadastrado",
        variant: "destructive"
      });
      return;
    }
    setSelectedUser(user);
    setSelectedMessageType("welcome");
    setShowMessageModal(true);
  };

  const sendWhatsAppMessage = (messageType: string, customMessage?: string) => {
    if (!selectedUser) return;
    
    const cleanWhatsApp = selectedUser.whatsapp.replace(/\D/g, '');
    const referrerName = profile?.display_name || profile?.username || 'Alphabit Team';
    
    let message = '';
    if (messageType === 'custom' && customMessage) {
      message = customMessage;
    } else if (messageTemplates[messageType as keyof typeof messageTemplates]) {
      message = messageTemplates[messageType as keyof typeof messageTemplates].template(selectedUser.name, referrerName);
    }
    
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/55${cleanWhatsApp}?text=${encodedMessage}`;
    
    window.open(whatsappUrl, '_blank');
    
    toast({
      title: "✅ Mensagem enviada!",
      description: `Mensagem enviada para ${selectedUser.name}`,
    });
    
    setShowMessageModal(false);
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900">
        {/* Trading Header */}
        <div className="bg-gradient-to-r from-slate-800/90 to-slate-900/90 backdrop-blur-sm border-b border-purple-500/20 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Left Section */}
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate(-1)}
                  className="hover:bg-purple-500/10 text-purple-400 border border-purple-500/20 p-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                    <Network className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-white">REFERRAL SYSTEM</h1>
                    <p className="text-xs text-gray-400">Advanced affiliate dashboard</p>
                  </div>
                </div>
              </div>

              {/* Center Section - Status */}
              <div className="hidden md:flex items-center gap-4">
                <div className="flex items-center gap-2 px-3 py-1 bg-green-500/20 rounded-full">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-green-400 text-sm font-medium">SYSTEM ONLINE</span>
                </div>
                
                <div className="flex items-center gap-2 px-3 py-1 bg-purple-500/20 rounded-full">
                  <Activity className="h-4 w-4 text-purple-400" />
                  <span className="text-purple-400 text-sm font-medium">REAL-TIME</span>
                </div>
              </div>

              {/* Right Section */}
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                  <Bell className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
          {/* Detailed User Performance Dashboard - MOVED TO TOP */}
          <Card className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-sm border border-purple-500/20">
            <CardHeader className="bg-gradient-to-r from-purple-600/10 to-pink-600/10 border-b border-purple-500/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg">
                    <BarChart3 className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-bold text-white">
                      Team Performance Dashboard
                    </CardTitle>
                    <p className="text-sm text-gray-400">Complete user details and analytics</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                    <Wifi className="h-3 w-3 mr-1" />
                    LIVE
                  </Badge>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-6">
              {/* Filters */}
              <div className="flex flex-wrap items-center gap-4 mb-6">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search team members..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-slate-800/60 border-purple-500/30 text-white w-80"
                  />
                </div>
                
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-gray-400" />
                  <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
                    <SelectTrigger className="w-36 bg-slate-800/60 border-purple-500/30 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-purple-500/30">
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select value={whatsappFilter} onValueChange={(value: any) => setWhatsappFilter(value)}>
                    <SelectTrigger className="w-36 bg-slate-800/60 border-purple-500/30 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-purple-500/30">
                      <SelectItem value="all">All Contact</SelectItem>
                      <SelectItem value="with">With WhatsApp</SelectItem>
                      <SelectItem value="without">No WhatsApp</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="border-purple-500/30 text-purple-400 ml-auto"
                  onClick={async () => {
                    setIsRefreshing(true);
                    // Reload data logic here
                    setTimeout(() => setIsRefreshing(false), 1000);
                  }}
                  disabled={isRefreshing}
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                  {isRefreshing ? 'Refreshing...' : 'Refresh Data'}
                </Button>
              </div>

              {/* Performance Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-400">Avg Performance</p>
                        <p className="text-2xl font-bold text-blue-400">
                          {filteredUsers.length > 0 
                            ? Math.round(filteredUsers.reduce((sum, user) => sum + (user.performance || 0), 0) / filteredUsers.length)
                            : 0}%
                        </p>
                      </div>
                      <TrendingUp className="h-8 w-8 text-blue-400" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-400">Active Investments</p>
                        <p className="text-2xl font-bold text-green-400">
                          {filteredUsers.reduce((sum, user) => sum + (user.activeInvestments || 0), 0)}
                        </p>
                      </div>
                      <Target className="h-8 w-8 text-green-400" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/20">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-400">Total Profits</p>
                        <p className="text-2xl font-bold text-yellow-400">
                          {formatCurrency(filteredUsers.reduce((sum, user) => sum + (user.totalProfit || 0), 0))}
                        </p>
                      </div>
                      <DollarSign className="h-8 w-8 text-yellow-400" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-400">With WhatsApp</p>
                        <p className="text-2xl font-bold text-purple-400">
                          {stats.withWhatsapp}/{stats.totalReferrals}
                        </p>
                      </div>
                      <Phone className="h-8 w-8 text-purple-400" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Detailed Users Table */}
              {filteredUsers.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-slate-600/50 hover:bg-slate-800/30">
                        <TableHead className="text-purple-400 font-medium">User</TableHead>
                        <TableHead className="text-purple-400 font-medium">Status</TableHead>
                        <TableHead className="text-purple-400 font-medium">Location</TableHead>
                        <TableHead className="text-purple-400 font-medium">Performance</TableHead>
                        <TableHead className="text-purple-400 font-medium">Investments</TableHead>
                        <TableHead className="text-purple-400 font-medium">Profit</TableHead>
                        <TableHead className="text-purple-400 font-medium">Commission</TableHead>
                        <TableHead className="text-purple-400 font-medium">Join Date</TableHead>
                        <TableHead className="text-purple-400 font-medium">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.map((user) => (
                        <TableRow key={user.id} className="border-slate-600/30 hover:bg-slate-800/20 transition-colors">
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-10 w-10">
                                <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-600 text-white font-bold">
                                  {user.name.charAt(0).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium text-white">{user.name}</p>
                                <p className="text-sm text-gray-400">{user.email}</p>
                              </div>
                            </div>
                          </TableCell>
                          
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {user.status === 'active' ? (
                                <>
                                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    Active
                                  </Badge>
                                </>
                              ) : (
                                <>
                                  <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                                  <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30">
                                    <UserX className="h-3 w-3 mr-1" />
                                    Inactive
                                  </Badge>
                                </>
                              )}
                            </div>
                          </TableCell>

                          <TableCell>
                            <div className="flex items-center gap-1 text-sm text-gray-300">
                              <MapPin className="h-3 w-3 text-gray-400" />
                              {user.city && user.state ? (
                                <span>{user.city}, {user.state}</span>
                              ) : (
                                <span className="text-gray-500 italic">Not provided</span>
                              )}
                            </div>
                          </TableCell>

                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="flex-1">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-sm font-medium text-white">
                                    {user.performance?.toFixed(1)}%
                                  </span>
                                  {(user.performance || 0) > 0 ? (
                                    <TrendingUp className="h-3 w-3 text-green-400" />
                                  ) : (
                                    <TrendingDown className="h-3 w-3 text-red-400" />
                                  )}
                                </div>
                                <Progress 
                                  value={Math.min(Math.max(user.performance || 0, 0), 100)} 
                                  className="h-1"
                                />
                              </div>
                            </div>
                          </TableCell>

                          <TableCell>
                            <div className="text-center">
                              <p className="text-sm font-medium text-white">
                                {formatCurrency(user.investmentAmount)}
                              </p>
                              <p className="text-xs text-gray-400">
                                {user.activeInvestments || 0} active
                              </p>
                            </div>
                          </TableCell>

                          <TableCell>
                            <p className="text-sm font-medium text-green-400">
                              {formatCurrency(user.totalProfit || 0)}
                            </p>
                          </TableCell>

                          <TableCell>
                            <p className="text-sm font-medium text-yellow-400">
                              {formatCurrency(user.commission)}
                            </p>
                          </TableCell>

                          <TableCell>
                            <div className="text-sm text-gray-300">
                              <p>{formatDate(user.joinDate)}</p>
                              <p className="text-xs text-gray-500 flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {formatDate(user.lastActivity)}
                              </p>
                            </div>
                          </TableCell>

                          <TableCell>
                            <div className="flex items-center gap-1">
                              {user.whatsapp ? (
                                <Button
                                  size="sm"
                                  onClick={() => openMessageModal(user)}
                                  className="bg-green-600 hover:bg-green-700 text-white h-8 w-8 p-0"
                                  title="Send WhatsApp message"
                                >
                                  <MessageCircle className="h-4 w-4" />
                                </Button>
                              ) : (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  disabled
                                  className="border-gray-500/30 text-gray-500 h-8 w-8 p-0"
                                  title="No WhatsApp available"
                                >
                                  <WifiOff className="h-4 w-4" />
                                </Button>
                              )}
                              
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-purple-500/30 text-purple-400 hover:bg-purple-500/10 h-8 w-8 p-0"
                                title="View details"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="p-8 bg-gradient-to-br from-gray-500/10 to-slate-500/10 border border-gray-500/20 rounded-xl inline-block">
                    <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-400 text-xl font-medium mb-2">No team members found</p>
                    <p className="text-gray-500 mb-4">Start sharing your referral link to build your network</p>
                    <Button 
                      onClick={copyToClipboard}
                      className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white"
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy Referral Link
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Referrals */}
            <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 hover-scale">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400 mb-2">Total Referrals</p>
                    <p className="text-3xl font-bold text-purple-400">{stats.totalReferrals}</p>
                    <p className="text-xs text-gray-500 mt-1">Network size</p>
                  </div>
                  <div className="p-3 bg-purple-500/20 rounded-xl">
                    <Users className="h-8 w-8 text-purple-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Active Users */}
            <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 hover-scale">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400 mb-2">Active Users</p>
                    <p className="text-3xl font-bold text-green-400">{stats.activeReferrals}</p>
                    <p className="text-xs text-gray-500 mt-1">Trading now</p>
                  </div>
                  <div className="p-3 bg-green-500/20 rounded-xl">
                    <UserCheck className="h-8 w-8 text-green-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Total Commission */}
            <Card className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 hover-scale">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400 mb-2">Total Earned</p>
                    <p className="text-3xl font-bold text-yellow-400">{formatCurrency(stats.totalCommission)}</p>
                    <p className="text-xs text-gray-500 mt-1">All time</p>
                  </div>
                  <div className="p-3 bg-yellow-500/20 rounded-xl">
                    <DollarSign className="h-8 w-8 text-yellow-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Conversion Rate */}
            <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20 hover-scale">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400 mb-2">Conversion</p>
                    <p className="text-3xl font-bold text-blue-400">
                      {stats.totalReferrals > 0 ? Math.round((stats.activeReferrals / stats.totalReferrals) * 100) : 0}%
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Success rate</p>
                  </div>
                  <div className="p-3 bg-blue-500/20 rounded-xl">
                    <TrendingUp className="h-8 w-8 text-blue-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Left Sidebar - Market Data */}
            <div className="lg:col-span-1 space-y-6">
              <MarketOverview />
              
              {/* Referral Progress */}
              <Card className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-sm border border-purple-500/20">
                <CardHeader className="border-b border-purple-500/20">
                  <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
                    <Target className="h-5 w-5 text-purple-400" />
                    Progress
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-sm">Bronze → Silver</span>
                      <span className="text-white font-medium">{stats.totalReferrals}/10</span>
                    </div>
                    <Progress value={(stats.totalReferrals / 10) * 100} className="h-2" />
                    <p className="text-xs text-gray-500">7 more referrals to Silver tier</p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Crown className="h-4 w-4 text-yellow-400" />
                      <span className="text-sm text-yellow-400">Bronze Level</span>
                    </div>
                    <p className="text-xs text-gray-400">10% commission rate</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Content Area */}
            <div className="lg:col-span-2 space-y-6">
              {/* Referral Link Section - Moved above chart */}
              <Card className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-sm border border-purple-500/20 overflow-hidden">
                <CardHeader className="border-b border-purple-500/20 bg-gradient-to-r from-purple-500/10 to-pink-500/10">
                  <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
                    <Link className="h-5 w-5 text-purple-400" />
                    YOUR REFERRAL LINK
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-4 bg-slate-700/50 rounded-lg border border-purple-500/20">
                      <Input
                        value={referralLink}
                        readOnly
                        className="flex-1 bg-transparent border-none text-white font-mono text-sm focus:ring-0 focus:border-none"
                      />
                      <Button
                        onClick={copyToClipboard}
                        className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white px-6 transition-all duration-300 hover:scale-105"
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        COPY
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <Button
                        onClick={() => {
                          const message = `🚀 Join Alphabit and start earning with automated trading!\n\n${referralLink}\n\n✅ Professional arbitrage system\n✅ Guaranteed daily profits\n✅ 24/7 support\n\nStart today!`;
                          const encodedMessage = encodeURIComponent(message);
                          window.open(`https://wa.me/?text=${encodedMessage}`, '_blank');
                        }}
                        className="bg-green-600 hover:bg-green-700 text-white transition-all duration-300 hover:scale-105"
                      >
                        <Phone className="h-4 w-4 mr-2" />
                        WhatsApp
                      </Button>
                      
                      <Button
                        onClick={() => {
                          const tweetText = `🚀 Discover Alphabit: The future of automated trading!\n\n${referralLink}\n\n#Trading #Crypto #Profit #Arbitrage`;
                          window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`, '_blank');
                        }}
                        className="bg-blue-500 hover:bg-blue-600 text-white transition-all duration-300 hover:scale-105"
                      >
                        <Share2 className="h-4 w-4 mr-2" />
                        Share
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Trading Chart */}
              <TradingChart />

              {/* Referral Interface */}
              <Card className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-sm border border-purple-500/20">
                <CardHeader className="bg-gradient-to-r from-purple-600/10 to-pink-600/10 border-b border-purple-500/20">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg">
                        <Share2 className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-lg font-bold text-white">
                          Referral Terminal
                        </CardTitle>
                        <p className="text-sm text-gray-400">Share your link and earn commissions</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <div className="px-3 py-1 bg-purple-500/20 rounded-full text-purple-400 text-xs font-medium">
                        ACTIVE
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-6">
                  <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-3 mb-6 bg-slate-800/50 border border-slate-600/30 p-1">
                      <TabsTrigger 
                        value="overview" 
                        className="flex items-center space-x-2 data-[state=active]:bg-purple-500 data-[state=active]:text-white"
                      >
                        <BarChart3 className="h-4 w-4" />
                        <span className="font-medium">Overview</span>
                      </TabsTrigger>
                      <TabsTrigger 
                        value="link" 
                        className="flex items-center space-x-2 data-[state=active]:bg-pink-500 data-[state=active]:text-white"
                      >
                        <Link className="h-4 w-4" />
                        <span className="font-medium">Share Link</span>
                      </TabsTrigger>
                      <TabsTrigger 
                        value="users" 
                        className="flex items-center space-x-2 data-[state=active]:bg-blue-500 data-[state=active]:text-white"
                      >
                        <Users className="h-4 w-4" />
                        <span className="font-medium">My Team</span>
                      </TabsTrigger>
                    </TabsList>

                    {/* Overview Tab */}
                    <TabsContent value="overview" className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-xl">
                          <div className="flex items-center gap-3 mb-3">
                            <Rocket className="h-5 w-5 text-purple-400" />
                            <h4 className="font-semibold text-white">Performance</h4>
                          </div>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-400">Click Rate</span>
                              <span className="text-white">95.2%</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Sign-up Rate</span>
                              <span className="text-white">
                                {stats.totalReferrals > 0 ? Math.round((stats.activeReferrals / stats.totalReferrals) * 100) : 0}%
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Avg. Investment</span>
                              <span className="text-white">$250</span>
                            </div>
                          </div>
                        </div>

                        <div className="p-4 bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-xl">
                          <div className="flex items-center gap-3 mb-3">
                            <Award className="h-5 w-5 text-green-400" />
                            <h4 className="font-semibold text-white">Rewards</h4>
                          </div>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-400">This Month</span>
                              <span className="text-green-400">{formatCurrency(stats.totalCommission * 0.3)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">This Week</span>
                              <span className="text-green-400">{formatCurrency(stats.totalCommission * 0.1)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Today</span>
                              <span className="text-green-400">{formatCurrency(stats.totalCommission * 0.02)}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-xl p-4">
                        <div className="flex items-start space-x-3">
                          <Info className="h-5 w-5 text-blue-400 mt-1" />
                          <div>
                            <h4 className="font-semibold text-blue-400 mb-2">How it works:</h4>
                            <ul className="text-gray-300 space-y-1 text-sm">
                              <li>• Share your referral link with friends</li>
                              <li>• Earn 10% commission on their investments</li>
                              <li>• Get instant notifications for new sign-ups</li>
                              <li>• Track your team's performance in real-time</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    {/* Share Link Tab */}
                    <TabsContent value="link" className="space-y-6">
                      <div className="text-center mb-4">
                        <div className="inline-flex items-center space-x-3 bg-purple-500/20 border border-purple-500/30 px-4 py-2 rounded-full">
                          <Globe className="h-4 w-4 text-purple-400" />
                          <span className="text-purple-400 font-medium">Your Referral Link</span>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="relative">
                          <Input
                            value={referralLink}
                            readOnly
                            className="pr-12 bg-slate-800/60 border-purple-500/30 text-white h-12 font-mono text-sm"
                          />
                          <Button
                            onClick={copyToClipboard}
                            className="absolute right-2 top-2 bg-purple-500 hover:bg-purple-600 text-white px-3 h-8"
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <Button 
                            className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-bold h-12"
                          >
                            <Share2 className="h-4 w-4 mr-2" />
                            Share Link
                          </Button>
                          
                          <Button 
                            variant="outline"
                            className="border-purple-500/30 text-purple-400 hover:bg-purple-500/10 h-12"
                          >
                            <Download className="h-4 w-4 mr-2" />
                            QR Code
                          </Button>
                        </div>

                        <div className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-xl p-4">
                          <div className="flex items-start space-x-3">
                            <Gift className="h-5 w-5 text-yellow-400 mt-1" />
                            <div>
                              <h4 className="font-semibold text-yellow-400 mb-2">Share & Earn:</h4>
                              <ul className="text-gray-300 space-y-1 text-sm">
                                <li>• 10% commission on all referral investments</li>
                                <li>• Lifetime earnings from your network</li>
                                <li>• Bonus rewards for active referrals</li>
                                <li>• Exclusive access to VIP features</li>
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    {/* Users Tab */}
                    <TabsContent value="users" className="space-y-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <div className="relative">
                            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input
                              placeholder="Search users..."
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                              className="pl-10 bg-slate-800/60 border-purple-500/30 text-white"
                            />
                          </div>
                          
                          <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
                            <SelectTrigger className="w-32 bg-slate-800/60 border-purple-500/30 text-white">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-800 border-purple-500/30">
                              <SelectItem value="all">All</SelectItem>
                              <SelectItem value="active">Active</SelectItem>
                              <SelectItem value="inactive">Inactive</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <Button variant="outline" size="sm" className="border-purple-500/30 text-purple-400">
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Refresh
                        </Button>
                      </div>

                      {filteredUsers.length > 0 ? (
                        <div className="space-y-3">
                          {filteredUsers.map((user) => (
                            <Card key={user.id} className="bg-slate-800/50 border-slate-600/30 hover:border-purple-500/30 transition-colors">
                              <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center">
                                      <span className="text-white font-bold text-sm">
                                        {user.name.charAt(0).toUpperCase()}
                                      </span>
                                    </div>
                                    <div>
                                      <p className="font-medium text-white">{user.name}</p>
                                      <div className="flex items-center gap-2 text-sm text-gray-400">
                                        <span>{user.email}</span>
                                        {user.status === 'active' ? (
                                          <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Active</Badge>
                                        ) : (
                                          <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30">Inactive</Badge>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                  
                                  <div className="flex items-center gap-2">
                                    <div className="text-right">
                                      <p className="text-sm font-medium text-white">{formatCurrency(user.commission)}</p>
                                      <p className="text-xs text-gray-400">Commission</p>
                                    </div>
                                    
                                    {user.whatsapp && (
                                      <Button
                                        size="sm"
                                        onClick={() => openMessageModal(user)}
                                        className="bg-green-600 hover:bg-green-700 text-white"
                                      >
                                        <MessageCircle className="h-4 w-4" />
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-12">
                          <div className="p-6 bg-gradient-to-br from-gray-500/10 to-slate-500/10 border border-gray-500/20 rounded-xl inline-block">
                            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-400 text-lg font-medium">No team members yet</p>
                            <p className="text-gray-500 mt-2">Start sharing your referral link to build your team</p>
                          </div>
                        </div>
                      )}
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>

            {/* Right Sidebar - Residual Earnings */}
            <div className="lg:col-span-1 space-y-6">
              <ResidualEarnings />
              
              {/* Top Performers */}
              <Card className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-sm border border-yellow-500/20">
                <CardHeader className="border-b border-yellow-500/20">
                  <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
                    <Star className="h-5 w-5 text-yellow-400" />
                    Top Performers
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  {[1, 2, 3].map((rank) => (
                    <div key={rank} className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        rank === 1 ? 'bg-yellow-500/20 text-yellow-400' :
                        rank === 2 ? 'bg-gray-400/20 text-gray-400' :
                        'bg-orange-500/20 text-orange-400'
                      }`}>
                        <span className="font-bold text-sm">#{rank}</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-white font-medium">Trading Master {rank}</p>
                        <p className="text-xs text-gray-400">{50 - rank * 10} referrals</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-green-400">{formatCurrency(5000 - rank * 1000)}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* WhatsApp Message Modal */}
        <Dialog open={showMessageModal} onOpenChange={setShowMessageModal}>
          <DialogContent className="max-w-2xl bg-gradient-to-br from-slate-800/95 to-slate-900/95 border border-purple-500/20 text-white">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
                <MessageCircle className="h-6 w-6 text-green-400" />
                Enviar Mensagem para {selectedUser?.name}
              </DialogTitle>
              <p className="text-gray-400">
                {selectedUser?.whatsapp} • souzamkt0@gmail.com
              </p>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Message Type Selection */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Tipo de Mensagem</h3>
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(messageTemplates).map(([key, template]) => (
                    <Button
                      key={key}
                      variant={selectedMessageType === key ? "default" : "outline"}
                      onClick={() => setSelectedMessageType(key)}
                      className={`h-auto p-4 flex flex-col items-start text-left ${
                        selectedMessageType === key 
                          ? 'bg-gradient-to-r from-green-500 to-green-600 text-white border-green-500' 
                          : 'bg-slate-700/50 border-slate-600/50 text-gray-300 hover:border-green-500/50 hover:bg-green-500/10'
                      }`}
                    >
                      <div className="font-semibold mb-1">{template.title}</div>
                      <div className="text-xs opacity-80">{template.description}</div>
                    </Button>
                  ))}
                </div>
              </div>

              {/* Message Preview */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Preview da Mensagem</h3>
                <div className="bg-slate-700/50 border border-slate-600/50 rounded-lg p-4 max-h-64 overflow-y-auto">
                  {selectedMessageType === 'custom' ? (
                    <Textarea
                      placeholder="Digite sua mensagem personalizada aqui..."
                      className="min-h-32 bg-transparent border-none text-white resize-none focus:ring-0"
                      defaultValue={messageTemplates.custom.template(selectedUser?.name || '', profile?.display_name || 'Alphabit Team')}
                    />
                  ) : (
                    <pre className="text-sm text-gray-300 whitespace-pre-wrap font-mono">
                      {selectedUser && messageTemplates[selectedMessageType as keyof typeof messageTemplates]?.template(
                        selectedUser.name, 
                        profile?.display_name || profile?.username || 'Alphabit Team'
                      )}
                    </pre>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button
                  onClick={() => setShowMessageModal(false)}
                  variant="outline"
                  className="flex-1 border-slate-600/50 text-gray-300 hover:bg-slate-700/50"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={() => {
                    if (selectedMessageType === 'custom') {
                      const customMessage = document.querySelector('textarea')?.value || '';
                      sendWhatsAppMessage('custom', customMessage);
                    } else {
                      sendWhatsAppMessage(selectedMessageType);
                    }
                  }}
                  className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"
                >
                  <Phone className="h-4 w-4 mr-2" />
                  Enviar no WhatsApp
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </ErrorBoundary>
  );
};

export default Referrals;