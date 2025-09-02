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
  FileCheck,
  Coins
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
      <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-black">
        <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
          {/* Referral Link Card */}
          <Card className="bg-gradient-to-br from-zinc-900/90 to-black/90 backdrop-blur-sm border border-yellow-500/20">
            <CardHeader className="bg-gradient-to-r from-yellow-500/10 to-amber-500/10 border-b border-yellow-500/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-yellow-500 to-amber-600 rounded-lg">
                    <Network className="h-5 w-5 text-black" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-bold text-yellow-400">
                      Sistema de Indicações
                    </CardTitle>
                    <p className="text-sm text-yellow-300/70">Compartilhe seu link de indicação e ganhe comissões</p>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Network className="h-5 w-5 text-yellow-400" />
                  Seu Link de Indicação
                </h3>
                
                <div className="bg-gradient-to-br from-yellow-500/10 to-amber-500/10 border border-yellow-500/20 rounded-xl p-4">
                  <div className="space-y-3">
                    <div className="relative">
                      <Input
                        value={referralLink}
                        readOnly
                        className="pr-12 bg-zinc-900/60 border-yellow-500/30 text-yellow-100 font-mono text-sm"
                      />
                      <Button
                        size="sm"
                        onClick={copyToClipboard}
                        className="absolute right-1 top-1 h-8 bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 text-black"
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
                        className="bg-gradient-to-r from-emerald-500 to-lime-500 hover:from-emerald-400 hover:to-lime-400 text-black font-semibold transition-all duration-300 hover:scale-105"
                      >
                        <Phone className="h-4 w-4 mr-2" />
                        WhatsApp
                      </Button>
                      
                      <Button
                        onClick={() => {
                          const tweetText = `🚀 Descubra a Alphabit: O futuro do trading automatizado!\n\n${referralLink}\n\n#Trading #Crypto #Lucro #Arbitragem`;
                          window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`, '_blank');
                        }}
                        className="bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 text-black font-semibold transition-all duration-300 hover:scale-105"
                      >
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Compartilhar
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Team Performance Dashboard */}
          <Card className="bg-gradient-to-br from-zinc-900/90 to-black/90 backdrop-blur-sm border border-yellow-500/20">
            <CardHeader className="bg-gradient-to-r from-yellow-500/10 to-amber-500/10 border-b border-yellow-500/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-yellow-500 to-amber-600 rounded-lg">
                    <BarChart3 className="h-5 w-5 text-black" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-bold text-yellow-400">
                      Dashboard de Performance da Equipe
                    </CardTitle>
                    <p className="text-sm text-yellow-300/70">Detalhes completos dos usuários e análises</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Badge className="bg-yellow-500/15 text-yellow-400 border-yellow-500/30">
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
                    placeholder="Buscar membros da equipe..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-zinc-900/60 border-yellow-500/30 text-yellow-100 w-80"
                  />
                </div>
                
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-gray-400" />
                  <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
                    <SelectTrigger className="w-36 bg-zinc-900/60 border-yellow-500/30 text-yellow-100">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-yellow-500/30">
                      <SelectItem value="all">Todos Status</SelectItem>
                      <SelectItem value="active">Ativo</SelectItem>
                      <SelectItem value="inactive">Inativo</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select value={whatsappFilter} onValueChange={(value: any) => setWhatsappFilter(value)}>
                    <SelectTrigger className="w-36 bg-zinc-900/60 border-yellow-500/30 text-yellow-100">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-yellow-500/30">
                      <SelectItem value="all">Todos Contatos</SelectItem>
                      <SelectItem value="with">Com WhatsApp</SelectItem>
                      <SelectItem value="without">Sem WhatsApp</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="border-yellow-500/40 text-yellow-400 ml-auto hover:bg-yellow-500/10"
                  onClick={async () => {
                    setIsRefreshing(true);
                    window.location.reload();
                  }}
                  disabled={isRefreshing}
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                  {isRefreshing ? 'Atualizando...' : 'Atualizar Dados'}
                </Button>
              </div>

              {/* Performance Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <Card className="bg-gradient-to-br from-yellow-500/10 to-amber-500/10 border border-yellow-500/25">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-yellow-300/80">Total de Indicações</p>
                        <p className="text-2xl font-bold text-yellow-400">
                          {stats.totalReferrals}
                        </p>
                      </div>
                      <Users className="h-8 w-8 text-yellow-400" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-yellow-500/10 to-amber-500/10 border border-yellow-500/25">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-yellow-300/80">Usuários Ativos</p>
                        <p className="text-2xl font-bold text-yellow-400">
                          {stats.activeReferrals}
                        </p>
                      </div>
                      <UserCheck className="h-8 w-8 text-yellow-400" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-yellow-500/10 to-amber-500/10 border border-yellow-500/25">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-yellow-300/80">Total de Comissões</p>
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
                        <p className="text-sm text-gray-400">Com WhatsApp</p>
                        <p className="text-2xl font-bold text-purple-400">
                          {stats.withWhatsapp}/{stats.totalReferrals}
                        </p>
                      </div>
                      <Phone className="h-8 w-8 text-purple-400" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Users Display - Responsive */}
              {filteredUsers.length > 0 ? (
                <>
                  {/* Desktop Table */}
                  <div className="hidden lg:block overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-slate-600/50 hover:bg-slate-800/30">
                          <TableHead className="text-yellow-400 font-medium">Usuário</TableHead>
                          <TableHead className="text-yellow-400 font-medium">Status</TableHead>
                          <TableHead className="text-yellow-400 font-medium">Localização</TableHead>
                          <TableHead className="text-yellow-400 font-medium">Investimentos</TableHead>
                          <TableHead className="text-yellow-400 font-medium">Lucro</TableHead>
                          <TableHead className="text-yellow-400 font-medium">Comissão</TableHead>
                          <TableHead className="text-yellow-400 font-medium">Data de Entrada</TableHead>
                          <TableHead className="text-yellow-400 font-medium">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.map((user) => (
                        <TableRow key={user.id} className="border-slate-600/30 hover:bg-slate-800/20 transition-colors">
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-10 w-10">
                                  <AvatarFallback className="bg-gradient-to-br from-yellow-500 to-orange-600 text-white font-bold">
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
                                    Ativo
                                  </Badge>
                                </>
                              ) : (
                                <>
                                  <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                                  <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30">
                                    <UserX className="h-3 w-3 mr-1" />
                                    Inativo
                                  </Badge>
                                </>
                              )}
                            </div>
                          </TableCell>

                          <TableCell>
                            <div className="flex items-center gap-1 text-sm text-gray-300">
                                <MapPin className="h-3 w-3 text-yellow-400" />
                              {user.city && user.state ? (
                                <span>{user.city}, {user.state}</span>
                              ) : (
                                <span className="text-gray-500 italic">Não informado</span>
                              )}
                            </div>
                          </TableCell>

                          <TableCell>
                            <div className="text-center">
                              <p className="text-sm font-medium text-white">
                                {formatCurrency(user.investmentAmount)}
                              </p>
                                <p className="text-xs text-gray-400">
                                  {user.activeInvestments || 0} ativo(s)
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
                                  title="Enviar mensagem WhatsApp"
                                >
                                  <MessageCircle className="h-4 w-4" />
                                </Button>
                              ) : (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  disabled
                                  className="border-gray-500/30 text-gray-500 h-8 w-8 p-0"
                                  title="WhatsApp não disponível"
                                >
                                  <WifiOff className="h-4 w-4" />
                                </Button>
                              )}
                              
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => openUserDetailsModal(user)}
                                  className="border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10 h-8 w-8 p-0"
                                title="Ver detalhes"
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

                  {/* Mobile Cards */}
                  <div className="lg:hidden space-y-4">
                    {filteredUsers.map((user) => (
                      <Card key={user.id} className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 border border-yellow-500/20 backdrop-blur-sm">
                        <CardContent className="p-4">
                          {/* User Header */}
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-12 w-12">
                                <AvatarFallback className="bg-gradient-to-br from-yellow-500 to-orange-600 text-white font-bold text-lg">
                                  {user.name.charAt(0).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <h3 className="font-semibold text-white text-lg">{user.name}</h3>
                                <p className="text-sm text-gray-400">{user.email}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {user.status === 'active' ? (
                                <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                                  <CheckCircle className="h-3 w-3 mr-1" /> Ativo
                                </Badge>
                              ) : (
                                <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30">
                                  <UserX className="h-3 w-3 mr-1" /> Inativo
                                </Badge>
                              )}
                            </div>
                          </div>

                          {/* User Info Grid */}
                          <div className="grid grid-cols-2 gap-3 mb-4">
                            <div className="bg-slate-700/30 rounded-lg p-3">
                              <div className="flex items-center gap-2 mb-1">
                                <MapPin className="h-4 w-4 text-yellow-400" />
                                <span className="text-xs text-gray-400">Localização</span>
                              </div>
                              <p className="text-sm text-white">
                                {user.city && user.state ? `${user.city}, ${user.state}` : 'Não informado'}
                              </p>
                            </div>

                            <div className="bg-slate-700/30 rounded-lg p-3">
                              <div className="flex items-center gap-2 mb-1">
                                <DollarSign className="h-4 w-4 text-yellow-400" />
                                <span className="text-xs text-gray-400">Investimento</span>
                              </div>
                              <p className="text-sm text-white">{formatCurrency(user.investmentAmount)}</p>
                              <p className="text-xs text-gray-400">{user.activeInvestments || 0} ativo(s)</p>
                            </div>

                            {/* Lucro e Comissão ocultos para não-admin */}
                          </div>

                          {/* Date Info */}
                          <div className="bg-slate-700/30 rounded-lg p-3 mb-4">
                            <div className="flex items-center gap-2 mb-1">
                              <Calendar className="h-4 w-4 text-yellow-400" />
                              <span className="text-xs text-gray-400">Informações de Data</span>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div>
                                <span className="text-gray-400">Entrada: </span>
                                <span className="text-white">{formatDate(user.joinDate)}</span>
                              </div>
                              <div>
                                <span className="text-gray-400">Atividade: </span>
                                <span className="text-white">{formatDate(user.lastActivity)}</span>
                              </div>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-2">
                            {user.whatsapp ? (
                              <Button
                                onClick={() => openMessageModal(user)}
                                className="flex-1 h-11 rounded-lg bg-gradient-to-r from-emerald-500 to-lime-500 hover:from-emerald-400 hover:to-lime-400 text-black font-semibold active:scale-95 transition-transform"
                              >
                                <MessageCircle className="h-5 w-5 mr-2" />
                                WhatsApp
                              </Button>
                            ) : (
                              <Button
                                variant="outline"
                                disabled
                                className="flex-1 h-11 rounded-lg border-gray-600 text-gray-500"
                              >
                                <WifiOff className="h-5 w-5 mr-2" />
                                Sem WhatsApp
                              </Button>
                            )}
                            
                            <Button
                              variant="outline"
                              onClick={() => openUserDetailsModal(user)}
                              className="border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center py-12">
                  <div className="p-8 bg-gradient-to-br from-gray-500/10 to-slate-500/10 border border-gray-500/20 rounded-xl inline-block">
                    <Users className="h-16 w-16 text-yellow-400 mx-auto mb-4" />
                    <p className="text-gray-400 text-xl font-medium mb-2">Nenhum membro da equipe encontrado</p>
                    <p className="text-gray-500 mb-4">Comece compartilhando seu link de indicação para construir sua rede</p>
                    <Button 
                      onClick={copyToClipboard}
                      className="bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-black font-semibold"
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copiar Link de Indicação
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
                                {investment.status === 'active' ? 'Ativo' : 'Inativo'}
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
                                {contract.status === 'active' ? 'Ativo' : 'Inativo'}
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
                                {transaction.type === 'deposit' ? 'Depósito' : 'Saque'}
                              </Badge>
                            </div>
                            <div>
                              <span className="text-gray-400">Valor (BRL):</span>
                              <p className="text-orange-400 font-medium">R$ {transaction.amount_brl}</p>
                            </div>
                            <div>
                              <span className="text-gray-400">Status:</span>
                              <Badge className={transaction.status === 'completed' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}>
                                {transaction.status === 'completed' ? 'Concluído' : transaction.status === 'pending' ? 'Pendente' : transaction.status}
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
          <DialogContent className="w-[92vw] sm:w-[560px] max-w-[92vw] bg-gradient-to-br from-black/95 to-zinc-900/95 border border-yellow-500/20 text-white p-4 sm:p-6 rounded-xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
                <MessageCircle className="h-6 w-6 text-yellow-400" />
                Boas-vindas para {selectedUser?.name}
              </DialogTitle>
              <p className="text-gray-400">
                {selectedUser?.whatsapp} • {selectedUser?.email}
              </p>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Message Type Selection */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Escolha rápida</h3>
                <Select value={selectedMessageType} onValueChange={(v:any)=>setSelectedMessageType(v)}>
                  <SelectTrigger className="w-full bg-zinc-900/70 border-yellow-500/30 text-yellow-100">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-yellow-500/30">
                  {Object.entries(messageTemplates).map(([key, template]) => (
                      <SelectItem key={key} value={key}>
                        <div className="flex flex-col text-left">
                          <span className="font-semibold text-yellow-300">{template.title}</span>
                          <span className="text-xs text-zinc-400">{template.description}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
              <div className="flex items-center gap-3 sm:gap-4">
                <Button
                  onClick={() => sendWhatsAppMessage(selectedMessageType)}
                  className="flex-1 h-12 rounded-lg bg-gradient-to-r from-emerald-500 to-lime-500 hover:from-emerald-400 hover:to-lime-400 text-black font-semibold active:scale-95 transition-transform"
                >
                  <Phone className="h-5 w-5 mr-2" />
                  Enviar WhatsApp
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => setShowMessageModal(false)}
                  className="h-12 rounded-lg border-zinc-700 text-gray-300 hover:bg-zinc-800"
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