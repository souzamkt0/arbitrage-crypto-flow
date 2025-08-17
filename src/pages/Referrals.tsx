import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  MessageCircle
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ResidualEarnings from "@/components/ResidualEarnings";

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
}

const Referrals = () => {
  const [referralLink, setReferralLink] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [referredUsers, setReferredUsers] = useState<ReferredUser[]>([]);
  const [stats, setStats] = useState({
    totalReferrals: 0,
    activeReferrals: 0,
    totalCommission: 0,
    pendingCommission: 0
  });
  const [profile, setProfile] = useState<any>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    const loadReferralData = async () => {
      if (!user) return;

      try {
        console.log('🔍 Debug Referrals - User ID:', user.id);
        
        // Get user profile with referral code for referral link
        const { data: userProfile, error: profileError } = await supabase
          .from('profiles')
          .select('username, referral_code, referral_balance')
          .eq('user_id', user.id)
          .single();

        console.log('🔍 Debug Referrals - Profile:', userProfile);
        console.log('🔍 Debug Referrals - Profile Error:', profileError);

        setProfile(userProfile);

        if (userProfile?.referral_code) {
          setReferralLink(`${window.location.origin}/register?ref=${userProfile.referral_code}`);
        } else if (userProfile?.username) {
          setReferralLink(`${window.location.origin}/register?ref=${userProfile.username}`);
        }

        // Get referral data - buscar usuários que foram indicados por este usuário
        console.log('🔍 Debug Referrals - Buscando usuários indicados por:', user.id);
        
        // Buscar usuários que têm este usuário como referência (referred_by)
        // Primeiro, buscar pelo user_id
        let { data: referredUsers, error: referralsError } = await supabase
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
            total_profit
          `)
          .eq('referred_by', user.id)
          .order('created_at', { ascending: false });

        // Se não encontrar pelo user_id, tentar pelo referral_code
        if ((!referredUsers || referredUsers.length === 0) && userProfile?.referral_code) {
          console.log('🔍 Tentando buscar por referral_code:', userProfile.referral_code);
          const { data: referredByCode, error: codeError } = await supabase
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
              total_profit
            `)
            .eq('referred_by', userProfile.referral_code)
            .order('created_at', { ascending: false });

          if (referredByCode && referredByCode.length > 0) {
            referredUsers = referredByCode;
            referralsError = codeError;
          }
        }

        console.log('🔍 Debug Referrals - Usuários encontrados:', referredUsers);
        console.log('🔍 Debug Referrals - Error:', referralsError);

        console.log('📊 Dados de usuários indicados:', referredUsers);
        console.log('❌ Erro:', referralsError);

        if (referredUsers && referredUsers.length > 0) {
          // Calculate stats based on real data
          const activeReferrals = referredUsers.filter(user => user.status === 'active').length;
          const totalCommission = referredUsers.reduce((sum, user) => sum + (user.total_profit || 0) * 0.1, 0); // 10% commission
          
          setStats({
            totalReferrals: referredUsers.length,
            activeReferrals,
            totalCommission,
            pendingCommission: 0
          });

          // Convert to the expected format
          const convertedUsers: ReferredUser[] = referredUsers.map((user) => ({
            id: user.user_id,
            name: user.display_name || user.username || 'Usuário',
            email: user.email || '',
            whatsapp: user.whatsapp || '',
            plan: 'Alphabot Básico',
            investmentAmount: user.balance || 0,
            commission: (user.total_profit || 0) * 0.1, // 10% commission
            status: user.status as "active" | "inactive",
            joinDate: user.created_at,
            lastActivity: user.created_at
          }));

          setReferredUsers(convertedUsers);
        } else {
          // Reset all stats to zero
          setStats({
            totalReferrals: 0,
            activeReferrals: 0,
            totalCommission: 0,
            pendingCommission: 0
          });
          setReferredUsers([]);
        }
      } catch (error) {
        console.error('Erro ao carregar dados de referência:', error);
      }
    };

          // Generate fallback referral code if no username or referral_code
      const userCode = Math.random().toString(36).substring(2, 15);
      setReferralLink(`${window.location.origin}/register?ref=${userCode}`);
    
    loadReferralData();

    // Remove mock data - use real data from database
  }, [user]);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      toast({
        title: "Link copiado!",
        description: "O link de indicação foi copiado para a área de transferência.",
      });
    } catch (err) {
      toast({
        title: "Erro ao copiar",
        description: "Não foi possível copiar o link.",
        variant: "destructive",
      });
    }
  };

  const filteredUsers = referredUsers.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.plan.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || user.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const sendWelcomeMessage = (whatsapp: string, userName: string) => {
    if (!whatsapp) {
      toast({
        title: "❌ WhatsApp não disponível",
        description: "Este usuário não possui WhatsApp cadastrado.",
        variant: "destructive"
      });
      return;
    }

    // Remover formatação do WhatsApp
    const cleanWhatsApp = whatsapp.replace(/\D/g, '');
    
    // Mensagem de boas-vindas personalizada
    const welcomeMessage = `Olá ${userName}! 

Bem-vindo(a) ao Alphabit!

Sou o ${profile?.display_name || profile?.username || 'Souza'} e estou muito feliz em ter você conosco!

O que você ganha aqui:
• Sistema de arbitragem automática
• Investimentos seguros e lucrativos
• Suporte 24/7
• Comunidade exclusiva de traders

Dica: Comece explorando o Dashboard e veja como nosso sistema funciona. Estou aqui para te ajudar em cada passo!

Precisa de ajuda? Me chama aqui mesmo!

Abraços e sucesso!
${profile?.display_name || profile?.username || 'Souza'}
Alphabit Team`;

    // Codificar a mensagem para URL
    const encodedMessage = encodeURIComponent(welcomeMessage);
    
    // Criar link do WhatsApp
    const whatsappUrl = `https://wa.me/55${cleanWhatsApp}?text=${encodedMessage}`;
    
    // Abrir WhatsApp
    window.open(whatsappUrl, '_blank');
    
    toast({
      title: "✅ Mensagem enviada!",
      description: `Mensagem de boas-vindas enviada para ${userName}`,
    });
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center">
              <Users className="h-6 md:h-8 w-6 md:w-8 mr-3 text-primary" />
              Sistema de Indicações
            </h1>
            <p className="text-muted-foreground">Gerencie suas indicações e acompanhe comissões</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-card-foreground">
                Total de Indicações
              </CardTitle>
              <Users className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-xl md:text-2xl font-bold text-primary">
                {stats.totalReferrals}
              </div>
              <p className="text-xs text-muted-foreground">
                usuários indicados
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-card-foreground">
                Indicações Ativas
              </CardTitle>
              <UserCheck className="h-4 w-4 text-trading-green" />
            </CardHeader>
            <CardContent>
              <div className="text-xl md:text-2xl font-bold text-trading-green">
                {stats.activeReferrals}
              </div>
              <p className="text-xs text-muted-foreground">
                ativamente investindo
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-card-foreground">
                Comissão Total
              </CardTitle>
              <DollarSign className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-xl md:text-2xl font-bold text-warning">
                {formatCurrency(stats.totalCommission)}
              </div>
              <p className="text-xs text-muted-foreground">
                total acumulado
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-card-foreground">
                Comissão Pendente
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-xl md:text-2xl font-bold text-primary">
                {formatCurrency(stats.pendingCommission)}
              </div>
              <p className="text-xs text-muted-foreground">
                aguardando pagamento
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content with Tabs */}
        <Tabs defaultValue="referrals" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="referrals">Indicações</TabsTrigger>
            <TabsTrigger value="residuals">Residuais</TabsTrigger>
          </TabsList>

          <TabsContent value="referrals" className="space-y-6">
            {/* Referral Link */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-card-foreground flex items-center">
                  <Link className="h-5 w-5 mr-2 text-primary" />
                  Seu Link de Indicação
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Código de Indicação */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <label className="text-sm font-medium text-muted-foreground mb-2 block">
                      Seu Código de Indicação
                    </label>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-secondary border border-border rounded-md px-3 py-2">
                        <span className="text-lg font-mono font-bold text-primary">
                          {profile?.referral_code || profile?.username || 'N/A'}
                        </span>
                      </div>
                      <Button
                        onClick={() => {
                          navigator.clipboard.writeText(profile?.referral_code || profile?.username || '');
                          toast({
                            title: "Código copiado!",
                            description: "Seu código de indicação foi copiado.",
                          });
                        }}
                        variant="outline"
                        size="sm"
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Copiar
                      </Button>
                    </div>
                  </div>
                </div>
                
                {/* Link Completo */}
                <div className="flex flex-col sm:flex-row gap-2">
                  <Input
                    value={referralLink}
                    readOnly
                    className="font-mono text-xs flex-1"
                  />
                  <Button
                    onClick={copyToClipboard}
                    className="bg-primary hover:bg-primary/90 whitespace-nowrap"
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copiar Link
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Compartilhe este link para ganhar comissão sobre os investimentos dos seus indicados
                </p>
              </CardContent>
            </Card>

            {/* Filters and Search */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-card-foreground">
                  Usuários Indicados
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar por nome, email ou plano..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={(value: "all" | "active" | "inactive") => setStatusFilter(value)}>
                    <SelectTrigger className="w-full sm:w-48">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="active">Ativos</SelectItem>
                      <SelectItem value="inactive">Inativos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Table */}
                <div className="rounded-md border overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead className="hidden md:table-cell">Email</TableHead>
                        <TableHead className="hidden lg:table-cell">WhatsApp</TableHead>
                        <TableHead>Plano</TableHead>
                        <TableHead>Investimento</TableHead>
                        <TableHead>Comissão</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="hidden xl:table-cell">Data Cadastro</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">
                            <div>
                              <div className="font-medium">{user.name}</div>
                              <div className="text-xs text-muted-foreground md:hidden">
                                {user.email}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell text-sm">
                            {user.email}
                          </TableCell>
                          <TableCell className="hidden lg:table-cell">
                            <div className="flex items-center gap-2">
                              {user.whatsapp ? (
                                <>
                                  <div className="flex items-center text-sm">
                                    📞 {user.whatsapp}
                                  </div>
                                  <Button
                                    onClick={() => sendWelcomeMessage(user.whatsapp, user.name)}
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0 text-green-500 hover:text-green-600 hover:bg-green-500/10"
                                    title="Enviar mensagem de boas-vindas"
                                  >
                                    📱
                                  </Button>
                                </>
                              ) : (
                                <span className="text-muted-foreground text-sm">Não informado</span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-xs">
                              {user.plan}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-medium">
                            {formatCurrency(user.investmentAmount)}
                          </TableCell>
                          <TableCell className="font-medium text-trading-green">
                            {formatCurrency(user.commission)}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={user.status === "active" ? "default" : "secondary"}
                              className={user.status === "active" ? "bg-trading-green" : ""}
                            >
                              {user.status === "active" ? "Ativo" : "Inativo"}
                            </Badge>
                          </TableCell>
                          <TableCell className="hidden xl:table-cell text-sm text-muted-foreground">
                            {formatDate(user.joinDate)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {filteredUsers.length === 0 && (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium text-foreground mb-2">
                      Nenhuma indicação encontrada
                    </h3>
                    <p className="text-muted-foreground">
                      {searchTerm || statusFilter !== "all" 
                        ? "Tente ajustar os filtros de busca"
                        : "Compartilhe seu link de indicação para começar"
                      }
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="residuals">
            <ResidualEarnings />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Referrals;