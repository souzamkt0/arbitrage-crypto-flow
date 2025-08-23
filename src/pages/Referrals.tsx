import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
  Phone,
  TrendingUp,
  UserCheck,
  UserX,
  Filter,
  Eye,
  MessageCircle,
  Settings,
  ArrowLeft,
  Activity,
  Bell,
  Network,
  BarChart3,
  Target,
  CheckCircle,
  AlertTriangle,
  TrendingDown,
  Clock,
  RefreshCw,
  MapPin,
  Wifi,
  WifiOff,
  Shield,
  Calendar,
  FileCheck
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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

interface ExtendedUserDetails extends ReferredUser {
  detailedProfile?: any;
  investments?: any[];
  contracts?: any[];
  tradingHistory?: any[];
  transactions?: any[];
}

interface UserContract {
  id: string;
  contract_type: string;
  plan_name: string;
  start_date: string;
  end_date: string;
  amount: number;
  daily_rate: number;
  status: string;
  auto_renewal: boolean;
  total_earned: number;
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
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<ReferredUser | null>(null);
  const [selectedMessageType, setSelectedMessageType] = useState<string>("welcome");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [userContract, setUserContract] = useState<UserContract | null>(null);
  const [showUserDetailsModal, setShowUserDetailsModal] = useState(false);
  const [userDetails, setUserDetails] = useState<ExtendedUserDetails | null>(null);

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

        // Buscar contrato ativo do usuário
        const { data: activeContract } = await supabase
          .from('user_contracts')
          .select('*')
          .eq('user_id', user.id)
          .eq('status', 'active')
          .maybeSingle();

        setUserContract(activeContract);

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
          
          // Buscar todos os investimentos (não apenas ativos)
          const { data: investments } = await supabase
            .from('user_investments')
            .select('user_id, amount, total_earned, status')
            .in('user_id', userIds);

          // Buscar estatísticas de trading
          const { data: tradingStats } = await supabase
            .from('trading_profits')
            .select('user_id, total_profit, investment_amount, completed_operations')
            .in('user_id', userIds);

          // Buscar comissões dos referrals (dados reais de comissão)
          const { data: referralCommissions } = await supabase
            .from('referrals')
            .select('referred_id, total_commission')
            .in('referred_id', userIds);

          // Buscar ganhos residuais
          const { data: residualEarnings } = await supabase
            .from('residual_earnings')
            .select('from_user_id, amount, status')
            .in('from_user_id', userIds)
            .eq('status', 'active');

          // Calcular estatísticas detalhadas
          const activeReferrals = referredUsers.filter(user => user.status === 'active').length;
          
          // Calcular comissão total real baseada nos dados da tabela referrals
          const totalCommission = referralCommissions?.reduce((sum, ref) => sum + (ref.total_commission || 0), 0) || 0;
          
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
            const userReferralData = referralCommissions?.find(ref => ref.referred_id === user.user_id);
            const userResidualEarnings = residualEarnings?.filter(res => res.from_user_id === user.user_id) || [];
            
            // Calcular investimentos totais (todos os investimentos, não apenas ativos)
            const totalInvested = userInvestments.reduce((sum, inv) => sum + (inv.amount || 0), 0);
            
            // Calcular ganhos totais dos investimentos
            const totalEarnedFromInvestments = userInvestments.reduce((sum, inv) => sum + (inv.total_earned || 0), 0);
            
            // Calcular lucros de trading
            const tradingProfit = userTrading.reduce((sum, trade) => sum + (trade.total_profit || 0), 0);
            
            // Calcular ganhos residuais
            const userResidualEarningsAmount = userResidualEarnings.reduce((sum, res) => sum + (res.amount || 0), 0);
            
            // Total de lucros = saldo atual + lucros dos investimentos + trading + residuais
            const totalUserProfit = (user.balance || 0) + totalEarnedFromInvestments + tradingProfit + userResidualEarningsAmount;
            
            // Comissão real da tabela referrals
            const realCommission = userReferralData?.total_commission || 0;
            
            // Contar investimentos ativos
            const activeInvestmentsCount = userInvestments.filter(inv => inv.status === 'active').length;
            
            // Calcular performance (percentual de lucro sobre investimento)
            const performance = totalInvested > 0 ? (totalUserProfit / totalInvested) * 100 : 0;

            return {
              id: user.user_id,
              name: user.display_name || user.full_name || user.username || 'Usuário',
              email: user.email || '',
              whatsapp: user.whatsapp || '',
              plan: activeInvestmentsCount > 0 ? 'Alphabot Pro' : 'Free',
              investmentAmount: totalInvested, // Total investido real da tabela user_investments
              commission: realCommission, // Comissão real da tabela referrals
              status: user.status as "active" | "inactive",
              joinDate: user.created_at,
              lastActivity: user.updated_at || user.created_at,
              city: user.city,
              state: user.state,
              totalProfit: totalUserProfit, // Lucro total calculado corretamente
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

  const openUserDetailsModal = async (user: ReferredUser) => {
    try {
      // Buscar informações detalhadas do usuário
      const { data: detailedProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      // Buscar investimentos do usuário
      const { data: investments } = await supabase
        .from('user_investments')
        .select('*')
        .eq('user_id', user.id);

      // Buscar contratos do usuário
      const { data: contracts } = await supabase
        .from('user_contracts')
        .select('*')
        .eq('user_id', user.id);

      // Buscar histórico de trading
      const { data: tradingHistory } = await supabase
        .from('trading_history')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      // Buscar transações DigiToPay
      const { data: transactions } = await supabase
        .from('digitopay_transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      const enrichedUser: ExtendedUserDetails = {
        ...user,
        detailedProfile,
        investments,
        contracts,
        tradingHistory,
        transactions
      };

      setUserDetails(enrichedUser);
      setShowUserDetailsModal(true);
    } catch (error) {
      console.error('Erro ao buscar detalhes do usuário:', error);
      toast({
        title: "❌ Erro",
        description: "Não foi possível carregar os detalhes do usuário",
        variant: "destructive"
      });
    }
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

              {/* Center Section - Contract Status */}
              <div className="hidden md:flex items-center gap-4">
                {userContract ? (
                  <div className="flex items-center gap-2 px-3 py-1 bg-green-500/20 rounded-full">
                    <FileCheck className="h-4 w-4 text-green-400" />
                    <span className="text-green-400 text-sm font-medium">CONTRATO ATIVO</span>
                    <Badge className="bg-green-500/30 text-green-300 text-xs">
                      {userContract.plan_name}
                    </Badge>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 px-3 py-1 bg-gray-500/20 rounded-full">
                    <AlertTriangle className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-400 text-sm font-medium">SEM CONTRATO</span>
                  </div>
                )}
                
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
          {/* Referral Link Card */}
          <Card className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-sm border border-purple-500/20">
            <CardHeader className="bg-gradient-to-r from-purple-600/10 to-pink-600/10 border-b border-purple-500/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg">
                    <Network className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-bold text-white">
                      Referral System
                    </CardTitle>
                    <p className="text-sm text-gray-400">Share your referral link and earn commissions</p>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Network className="h-5 w-5 text-purple-400" />
                  Your Referral Link
                </h3>
                
                <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-xl p-4">
                  <div className="space-y-3">
                    <div className="relative">
                      <Input
                        value={referralLink}
                        readOnly
                        className="pr-12 bg-slate-800/60 border-purple-500/30 text-white font-mono text-sm"
                      />
                      <Button
                        size="sm"
                        onClick={copyToClipboard}
                        className="absolute right-1 top-1 h-8 bg-purple-600 hover:bg-purple-700 text-white"
                      >
                        <Copy className="h-4 w-4" />
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
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Share
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Team Performance Dashboard */}
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
                    window.location.reload();
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
                        <p className="text-sm text-gray-400">Total Referrals</p>
                        <p className="text-2xl font-bold text-blue-400">
                          {stats.totalReferrals}
                        </p>
                      </div>
                      <Users className="h-8 w-8 text-blue-400" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-400">Active Users</p>
                        <p className="text-2xl font-bold text-green-400">
                          {stats.activeReferrals}
                        </p>
                      </div>
                      <UserCheck className="h-8 w-8 text-green-400" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/20">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-400">Total Commission</p>
                        <p className="text-2xl font-bold text-yellow-400">
                          {formatCurrency(stats.totalCommission)}
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
                                onClick={() => openUserDetailsModal(user)}
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
        </div>

        {/* User Details Modal */}
        <Dialog open={showUserDetailsModal} onOpenChange={setShowUserDetailsModal}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-gradient-to-br from-slate-800/95 to-slate-900/95 border border-purple-500/20 text-white">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
                <Eye className="h-6 w-6 text-purple-400" />
                Detalhes Completos do Usuário
              </DialogTitle>
              {userDetails && (
                <p className="text-gray-400">
                  {userDetails.name} • {userDetails.email}
                </p>
              )}
            </DialogHeader>
            
            {userDetails && (
              <div className="space-y-6">
                {/* Informações Pessoais */}
                <div className="bg-gradient-to-br from-slate-700/50 to-slate-800/50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                    <Users className="h-5 w-5 text-blue-400" />
                    Informações Pessoais
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-400">Nome:</span>
                      <p className="text-white font-medium">{userDetails.detailedProfile?.display_name || userDetails.name}</p>
                    </div>
                    <div>
                      <span className="text-gray-400">Email:</span>
                      <p className="text-white font-medium">{userDetails.email}</p>
                    </div>
                    <div>
                      <span className="text-gray-400">WhatsApp:</span>
                      <p className="text-white font-medium">{userDetails.whatsapp || 'Não informado'}</p>
                    </div>
                    <div>
                      <span className="text-gray-400">CPF:</span>
                      <p className="text-white font-medium">{userDetails.detailedProfile?.cpf || 'Não informado'}</p>
                    </div>
                    <div>
                      <span className="text-gray-400">Cidade:</span>
                      <p className="text-white font-medium">{userDetails.city || 'Não informado'}</p>
                    </div>
                    <div>
                      <span className="text-gray-400">Estado:</span>
                      <p className="text-white font-medium">{userDetails.state || 'Não informado'}</p>
                    </div>
                    <div>
                      <span className="text-gray-400">Saldo:</span>
                      <p className="text-green-400 font-medium">{formatCurrency(userDetails.detailedProfile?.balance || 0)}</p>
                    </div>
                    <div>
                      <span className="text-gray-400">Data de Cadastro:</span>
                      <p className="text-white font-medium">{formatDate(userDetails.joinDate)}</p>
                    </div>
                  </div>
                </div>

                {/* Investimentos */}
                {userDetails.investments && userDetails.investments.length > 0 && (
                  <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-green-400" />
                      Investimentos Ativos ({userDetails.investments.length})
                    </h3>
                    <div className="space-y-2">
                      {userDetails.investments.map((investment: any) => (
                        <div key={investment.id} className="bg-slate-800/30 rounded-lg p-3">
                          <div className="grid grid-cols-4 gap-2 text-sm">
                            <div>
                              <span className="text-gray-400">Valor:</span>
                              <p className="text-green-400 font-medium">{formatCurrency(investment.amount)}</p>
                            </div>
                            <div>
                              <span className="text-gray-400">Taxa Diária:</span>
                              <p className="text-blue-400 font-medium">{(investment.daily_rate * 100).toFixed(2)}%</p>
                            </div>
                            <div>
                              <span className="text-gray-400">Ganhos:</span>
                              <p className="text-yellow-400 font-medium">{formatCurrency(investment.total_earned || 0)}</p>
                            </div>
                            <div>
                              <span className="text-gray-400">Status:</span>
                              <Badge className={investment.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}>
                                {investment.status}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Contratos */}
                {userDetails.contracts && userDetails.contracts.length > 0 && (
                  <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                      <FileCheck className="h-5 w-5 text-purple-400" />
                      Contratos ({userDetails.contracts.length})
                    </h3>
                    <div className="space-y-2">
                      {userDetails.contracts.map((contract: any) => (
                        <div key={contract.id} className="bg-slate-800/30 rounded-lg p-3">
                          <div className="grid grid-cols-3 gap-2 text-sm">
                            <div>
                              <span className="text-gray-400">Plano:</span>
                              <p className="text-white font-medium">{contract.plan_name}</p>
                            </div>
                            <div>
                              <span className="text-gray-400">Valor:</span>
                              <p className="text-purple-400 font-medium">{formatCurrency(contract.amount)}</p>
                            </div>
                            <div>
                              <span className="text-gray-400">Status:</span>
                              <Badge className={contract.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}>
                                {contract.status}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Histórico de Trading */}
                {userDetails.tradingHistory && userDetails.tradingHistory.length > 0 && (
                  <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-blue-400" />
                      Histórico de Trading (Últimas 10)
                    </h3>
                    <div className="space-y-2">
                      {userDetails.tradingHistory.map((trade: any) => (
                        <div key={trade.id} className="bg-slate-800/30 rounded-lg p-3">
                          <div className="grid grid-cols-4 gap-2 text-sm">
                            <div>
                              <span className="text-gray-400">Par:</span>
                              <p className="text-white font-medium">{trade.pair}</p>
                            </div>
                            <div>
                              <span className="text-gray-400">Lucro:</span>
                              <p className="text-green-400 font-medium">{formatCurrency(trade.profit)}</p>
                            </div>
                            <div>
                              <span className="text-gray-400">%:</span>
                              <p className="text-blue-400 font-medium">{trade.profit_percent}%</p>
                            </div>
                            <div>
                              <span className="text-gray-400">Data:</span>
                              <p className="text-gray-300 font-medium">{formatDate(trade.created_at)}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Transações DigiToPay */}
                {userDetails.transactions && userDetails.transactions.length > 0 && (
                  <div className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/20 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                      <DollarSign className="h-5 w-5 text-orange-400" />
                      Transações DigiToPay ({userDetails.transactions.length})
                    </h3>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {userDetails.transactions.map((transaction: any) => (
                        <div key={transaction.id} className="bg-slate-800/30 rounded-lg p-3">
                          <div className="grid grid-cols-4 gap-2 text-sm">
                            <div>
                              <span className="text-gray-400">Tipo:</span>
                              <Badge className={transaction.type === 'deposit' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}>
                                {transaction.type}
                              </Badge>
                            </div>
                            <div>
                              <span className="text-gray-400">Valor (BRL):</span>
                              <p className="text-orange-400 font-medium">R$ {transaction.amount_brl}</p>
                            </div>
                            <div>
                              <span className="text-gray-400">Status:</span>
                              <Badge className={transaction.status === 'completed' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}>
                                {transaction.status}
                              </Badge>
                            </div>
                            <div>
                              <span className="text-gray-400">Data:</span>
                              <p className="text-gray-300 font-medium">{formatDate(transaction.created_at)}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Ações */}
                <div className="flex items-center gap-4">
                  <Button
                    onClick={() => setShowUserDetailsModal(false)}
                    className="bg-slate-600 hover:bg-slate-700 text-white"
                  >
                    Fechar
                  </Button>
                  {userDetails.whatsapp && (
                    <Button
                      onClick={() => {
                        setShowUserDetailsModal(false);
                        openMessageModal(userDetails);
                      }}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Enviar WhatsApp
                    </Button>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* WhatsApp Message Modal */}
        <Dialog open={showMessageModal} onOpenChange={setShowMessageModal}>
          <DialogContent className="max-w-2xl bg-gradient-to-br from-slate-800/95 to-slate-900/95 border border-purple-500/20 text-white">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
                <MessageCircle className="h-6 w-6 text-green-400" />
                Enviar Mensagem para {selectedUser?.name}
              </DialogTitle>
              <p className="text-gray-400">
                {selectedUser?.whatsapp} • {selectedUser?.email}
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
              <div className="flex items-center gap-4">
                <Button
                  onClick={() => sendWhatsAppMessage(selectedMessageType)}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                >
                  <Phone className="h-4 w-4 mr-2" />
                  Enviar WhatsApp
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => setShowMessageModal(false)}
                  className="border-slate-600 text-gray-300 hover:bg-slate-700"
                >
                  Cancelar
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