import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Eye
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
  const { toast } = useToast();

  useEffect(() => {
    // Gerar link de indicação
    const userCode = Math.random().toString(36).substring(2, 15);
    setReferralLink(`${window.location.origin}/register/${userCode}`);

    // Dados simulados de usuários indicados
    const mockReferredUsers: ReferredUser[] = [
      {
        id: "1",
        name: "Maria Silva",
        email: "maria@email.com",
        whatsapp: "+55 11 99999-1234",
        plan: "Alphabot Básico",
        investmentAmount: 500,
        commission: 25,
        status: "active",
        joinDate: "2024-06-15",
        lastActivity: "2024-07-13"
      },
      {
        id: "2", 
        name: "João Santos",
        email: "joao@email.com",
        whatsapp: "+55 11 99999-5678",
        plan: "Alphabot Intermediário",
        investmentAmount: 2000,
        commission: 100,
        status: "active",
        joinDate: "2024-06-20",
        lastActivity: "2024-07-14"
      },
      {
        id: "3",
        name: "Ana Costa",
        email: "ana@email.com", 
        whatsapp: "+55 11 99999-9012",
        plan: "Alphabot Avançado",
        investmentAmount: 5000,
        commission: 250,
        status: "inactive",
        joinDate: "2024-07-01",
        lastActivity: "2024-07-10"
      },
      {
        id: "4",
        name: "Pedro Oliveira",
        email: "pedro@email.com",
        whatsapp: "+55 11 99999-3456",
        plan: "Alphabot Premium",
        investmentAmount: 8000,
        commission: 400,
        status: "active",
        joinDate: "2024-07-05",
        lastActivity: "2024-07-14"
      }
    ];

    setReferredUsers(mockReferredUsers);

    // Calcular estatísticas
    const totalCommission = mockReferredUsers.reduce((sum, user) => sum + user.commission, 0);
    const activeUsers = mockReferredUsers.filter(user => user.status === "active");
    const totalResidualDaily = 22.15; // Simulando ganhos residuais diários
    
    setStats({
      totalReferrals: mockReferredUsers.length,
      activeReferrals: activeUsers.length,
      totalCommission,
      pendingCommission: totalCommission * 0.3 // 30% pendente
    });
  }, []);

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
              <CardContent>
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
                            <div className="flex items-center text-sm">
                              <Phone className="h-3 w-3 mr-1" />
                              {user.whatsapp}
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
                              {user.status === "active" ? (
                                <><UserCheck className="h-3 w-3 mr-1" />Ativo</>
                              ) : (
                                <><UserX className="h-3 w-3 mr-1" />Inativo</>
                              )}
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