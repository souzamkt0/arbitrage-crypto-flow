import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { 
  Users, 
  UserPlus, 
  Edit, 
  Trash2, 
  Search,
  Shield,
  Activity,
  DollarSign,
  TrendingUp,
  Eye,
  Settings,
  Plus,
  Bot
} from "lucide-react";

interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "user";
  status: "active" | "inactive";
  balance: number;
  totalProfit: number;
  joinDate: string;
  lastLogin: string;
  apiConnected: boolean;
}

interface InvestmentPlan {
  id: string;
  name: string;
  dailyRate: number;
  minimumAmount: number;
  maximumAmount: number;
  duration: number;
  description: string;
  status: "active" | "inactive";
}

const Admin = () => {
  const [users, setUsers] = useState<User[]>([
    {
      id: "1",
      name: "João Silva",
      email: "joao@email.com",
      role: "user",
      status: "active",
      balance: 15420.89,
      totalProfit: 2340.56,
      joinDate: "2024-01-15",
      lastLogin: "2024-07-13",
      apiConnected: true
    },
    {
      id: "2", 
      name: "Maria Santos",
      email: "maria@email.com",
      role: "user",
      status: "active",
      balance: 8765.43,
      totalProfit: 1245.78,
      joinDate: "2024-02-20",
      lastLogin: "2024-07-12",
      apiConnected: false
    },
    {
      id: "3",
      name: "Pedro Oliveira", 
      email: "pedro@email.com",
      role: "admin",
      status: "active",
      balance: 25678.90,
      totalProfit: 4567.89,
      joinDate: "2023-12-01",
      lastLogin: "2024-07-13",
      apiConnected: true
    },
    {
      id: "4",
      name: "Ana Costa",
      email: "ana@email.com", 
      role: "user",
      status: "inactive",
      balance: 3456.78,
      totalProfit: 567.90,
      joinDate: "2024-03-10",
      lastLogin: "2024-06-15",
      apiConnected: false
    }
  ]);

  const [investmentPlans, setInvestmentPlans] = useState<InvestmentPlan[]>([
    {
      id: "1",
      name: "Alphabot Básico",
      dailyRate: 0.3,
      minimumAmount: 100,
      maximumAmount: 1000,
      duration: 30,
      description: "Bot básico para iniciantes. Operações simples com baixo risco.",
      status: "active"
    },
    {
      id: "2",
      name: "Alphabot Intermediário",
      dailyRate: 0.5,
      minimumAmount: 500,
      maximumAmount: 5000,
      duration: 45,
      description: "Bot intermediário com estratégias moderadas de arbitragem.",
      status: "active"
    },
    {
      id: "3",
      name: "Alphabot Avançado",
      dailyRate: 1.0,
      minimumAmount: 1000,
      maximumAmount: 10000,
      duration: 60,
      description: "Bot avançado com múltiplas estratégias de trading.",
      status: "active"
    },
    {
      id: "4",
      name: "Alphabot Premium",
      dailyRate: 1.6,
      minimumAmount: 5000,
      maximumAmount: 25000,
      duration: 75,
      description: "Bot premium com algoritmos otimizados para máximo retorno.",
      status: "active"
    },
    {
      id: "5",
      name: "Alphabot VIP",
      dailyRate: 2.0,
      minimumAmount: 10000,
      maximumAmount: 100000,
      duration: 90,
      description: "Bot VIP com as melhores estratégias disponíveis.",
      status: "active"
    }
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<InvestmentPlan | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [isNewPlan, setIsNewPlan] = useState(false);
  const { toast } = useToast();

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeUsers = users.filter(user => user.status === "active").length;
  const totalBalance = users.reduce((sum, user) => sum + user.balance, 0);
  const totalProfit = users.reduce((sum, user) => sum + user.totalProfit, 0);
  const connectedUsers = users.filter(user => user.apiConnected).length;

  const handleToggleStatus = (userId: string) => {
    setUsers(prevUsers => 
      prevUsers.map(user => 
        user.id === userId 
          ? { ...user, status: user.status === "active" ? "inactive" : "active" }
          : user
      )
    );
    toast({
      title: "Status atualizado",
      description: "Status do usuário foi alterado com sucesso.",
    });
  };

  const handleDeleteUser = (userId: string) => {
    setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
    toast({
      title: "Usuário removido",
      description: "Usuário foi removido do sistema.",
    });
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setIsEditModalOpen(true);
  };

  const handleViewUser = (user: User) => {
    setSelectedUser(user);
    setIsViewModalOpen(true);
  };

  const handleSaveUser = () => {
    if (selectedUser) {
      setUsers(prevUsers =>
        prevUsers.map(user =>
          user.id === selectedUser.id ? selectedUser : user
        )
      );
      setIsEditModalOpen(false);
      toast({
        title: "Usuário atualizado",
        description: "Dados do usuário foram atualizados com sucesso.",
      });
    }
  };

  const handleEditPlan = (plan: InvestmentPlan) => {
    setSelectedPlan(plan);
    setIsNewPlan(false);
    setIsPlanModalOpen(true);
  };

  const handleNewPlan = () => {
    setSelectedPlan({
      id: "",
      name: "",
      dailyRate: 1.0,
      minimumAmount: 100,
      maximumAmount: 1000,
      duration: 30,
      description: "",
      status: "active"
    });
    setIsNewPlan(true);
    setIsPlanModalOpen(true);
  };

  const handleSavePlan = () => {
    if (selectedPlan) {
      if (isNewPlan) {
        const newId = (investmentPlans.length + 1).toString();
        const newPlan = { ...selectedPlan, id: newId };
        setInvestmentPlans(prev => [...prev, newPlan]);
        
        toast({
          title: "Plano criado",
          description: "Novo plano de investimento foi criado com sucesso.",
        });
      } else {
        setInvestmentPlans(prev =>
          prev.map(plan =>
            plan.id === selectedPlan.id ? selectedPlan : plan
          )
        );
        
        toast({
          title: "Plano atualizado",
          description: "Plano de investimento foi atualizado com sucesso.",
        });
      }
      setIsPlanModalOpen(false);
    }
  };

  const handleDeletePlan = (planId: string) => {
    setInvestmentPlans(prev => prev.filter(plan => plan.id !== planId));
    
    toast({
      title: "Plano removido",
      description: "Plano de investimento foi removido do sistema.",
    });
  };

  const handleTogglePlanStatus = (planId: string) => {
    setInvestmentPlans(prev =>
      prev.map(plan =>
        plan.id === planId
          ? { ...plan, status: plan.status === "active" ? "inactive" : "active" }
          : plan
      )
    );
    
    toast({
      title: "Status atualizado",
      description: "Status do plano foi alterado com sucesso.",
    });
  };

  // Salvar planos no localStorage quando houver mudanças
  useEffect(() => {
    localStorage.setItem("alphabit_investment_plans", JSON.stringify(investmentPlans));
  }, [investmentPlans]);

  return (
    <div className="min-h-screen bg-background p-3 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center">
              <Shield className="h-6 w-6 sm:h-8 sm:w-8 mr-2 sm:mr-3 text-primary" />
              <span className="hidden sm:inline">Painel Administrativo</span>
              <span className="sm:hidden">Admin</span>
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">Gerencie usuários e monitore atividades</p>
          </div>
          
          <Button className="bg-primary hover:bg-primary/90 w-full sm:w-auto">
            <UserPlus className="h-4 w-4 mr-2" />
            <span className="sm:inline">Novo Usuário</span>
            <span className="sm:hidden">Novo</span>
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-card-foreground">
                Usuários Ativos
              </CardTitle>
              <Users className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                {activeUsers}
              </div>
              <p className="text-xs text-muted-foreground">
                de {users.length} usuários totais
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-card-foreground">
                Saldo Total
              </CardTitle>
              <DollarSign className="h-4 w-4 text-trading-green" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-trading-green">
                ${totalBalance.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                Em todas as contas
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-card-foreground">
                Lucro Total
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                +${totalProfit.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                Lucro acumulado
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-card-foreground">
                APIs Conectadas
              </CardTitle>
              <Activity className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-warning">
                {connectedUsers}
              </div>
              <p className="text-xs text-muted-foreground">
                de {users.length} usuários
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center text-card-foreground text-sm sm:text-base">
              <Search className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-primary" />
              Buscar Usuários
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome ou email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 text-sm sm:text-base"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-card-foreground text-sm sm:text-base">Usuários ({filteredUsers.length})</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs sm:text-sm">Usuário</TableHead>
                  <TableHead className="hidden sm:table-cell text-xs sm:text-sm">Role</TableHead>
                  <TableHead className="text-xs sm:text-sm">Status</TableHead>
                  <TableHead className="hidden md:table-cell text-xs sm:text-sm">Saldo</TableHead>
                  <TableHead className="hidden md:table-cell text-xs sm:text-sm">Lucro</TableHead>
                  <TableHead className="hidden lg:table-cell text-xs sm:text-sm">API</TableHead>
                  <TableHead className="hidden lg:table-cell text-xs sm:text-sm">Último Login</TableHead>
                  <TableHead className="text-xs sm:text-sm">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="min-w-[120px]">
                      <div>
                        <div className="font-medium text-xs sm:text-sm">{user.name}</div>
                        <div className="text-xs text-muted-foreground truncate max-w-[100px] sm:max-w-none">{user.email}</div>
                        <div className="sm:hidden mt-1">
                          <Badge variant={user.role === "admin" ? "default" : "secondary"} className="text-xs">
                            {user.role}
                          </Badge>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <Badge variant={user.role === "admin" ? "default" : "secondary"} className="text-xs">
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-1 sm:space-y-0 sm:space-x-2">
                        <Switch
                          checked={user.status === "active"}
                          onCheckedChange={() => handleToggleStatus(user.id)}
                        />
                        <span className={`text-xs sm:text-sm ${user.status === "active" ? "text-trading-green" : "text-muted-foreground"}`}>
                          {user.status === "active" ? "Ativo" : "Inativo"}
                        </span>
                      </div>
                      <div className="md:hidden mt-1 space-y-1">
                        <div className="text-xs font-medium">${user.balance.toLocaleString()}</div>
                        <div className="text-xs text-trading-green">+${user.totalProfit.toLocaleString()}</div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell font-medium text-xs sm:text-sm">
                      ${user.balance.toLocaleString()}
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-trading-green font-medium text-xs sm:text-sm">
                      +${user.totalProfit.toLocaleString()}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <Badge variant={user.apiConnected ? "default" : "destructive"} className="text-xs">
                        {user.apiConnected ? "Conectada" : "Desconectada"}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-xs text-muted-foreground">
                      {new Date(user.lastLogin).toLocaleDateString("pt-BR")}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewUser(user)}
                          className="h-8 w-8 p-0"
                        >
                          <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditUser(user)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteUser(user.id)}
                          className="text-destructive hover:text-destructive h-8 w-8 p-0"
                        >
                          <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Edit User Modal */}
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Usuário</DialogTitle>
            </DialogHeader>
            {selectedUser && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome</Label>
                  <Input
                    id="name"
                    value={selectedUser.name}
                    onChange={(e) => setSelectedUser({...selectedUser, name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    value={selectedUser.email}
                    onChange={(e) => setSelectedUser({...selectedUser, email: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="balance">Saldo</Label>
                  <Input
                    id="balance"
                    type="number"
                    value={selectedUser.balance}
                    onChange={(e) => setSelectedUser({...selectedUser, balance: Number(e.target.value)})}
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleSaveUser}>
                    Salvar
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Investment Plans Management */}
        <Card className="bg-card border-border">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-card-foreground flex items-center">
                <Bot className="h-5 w-5 mr-2 text-primary" />
                Gerenciar Planos de Investimento
              </CardTitle>
              <Button onClick={handleNewPlan} className="bg-primary hover:bg-primary/90">
                <Plus className="h-4 w-4 mr-2" />
                Novo Plano
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {investmentPlans.map((plan) => (
                <Card key={plan.id} className="bg-secondary border-border">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2">
                          <Bot className="h-4 w-4 text-primary" />
                          <h3 className="font-semibold text-secondary-foreground">{plan.name}</h3>
                          <Badge variant={plan.status === "active" ? "default" : "destructive"}>
                            {plan.status === "active" ? "Ativo" : "Inativo"}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Taxa Diária:</span>
                            <div className="font-medium text-primary">{plan.dailyRate}%</div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Valor Mín:</span>
                            <div className="font-medium">${plan.minimumAmount.toLocaleString()}</div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Valor Máx:</span>
                            <div className="font-medium">${plan.maximumAmount.toLocaleString()}</div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Duração:</span>
                            <div className="font-medium">{plan.duration} dias</div>
                          </div>
                        </div>
                        
                        <p className="text-sm text-muted-foreground">{plan.description}</p>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={plan.status === "active"}
                          onCheckedChange={() => handleTogglePlanStatus(plan.id)}
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditPlan(plan)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeletePlan(plan.id)}
                          className="text-destructive hover:text-destructive h-8 w-8 p-0"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Edit Plan Modal */}
        <Dialog open={isPlanModalOpen} onOpenChange={setIsPlanModalOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {isNewPlan ? "Criar Novo Plano" : "Editar Plano de Investimento"}
              </DialogTitle>
            </DialogHeader>
            {selectedPlan && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="planName">Nome do Plano</Label>
                    <Input
                      id="planName"
                      value={selectedPlan.name}
                      onChange={(e) => setSelectedPlan({...selectedPlan, name: e.target.value})}
                      placeholder="Ex: Alphabot Basic"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dailyRate">Taxa Diária (%)</Label>
                    <Input
                      id="dailyRate"
                      type="number"
                      step="0.1"
                      min="0.1"
                      max="10"
                      value={selectedPlan.dailyRate}
                      onChange={(e) => setSelectedPlan({...selectedPlan, dailyRate: parseFloat(e.target.value) || 0})}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="minAmount">Valor Mínimo ($)</Label>
                    <Input
                      id="minAmount"
                      type="number"
                      min="1"
                      value={selectedPlan.minimumAmount}
                      onChange={(e) => setSelectedPlan({...selectedPlan, minimumAmount: parseInt(e.target.value) || 0})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maxAmount">Valor Máximo ($)</Label>
                    <Input
                      id="maxAmount"
                      type="number"
                      min="1"
                      value={selectedPlan.maximumAmount}
                      onChange={(e) => setSelectedPlan({...selectedPlan, maximumAmount: parseInt(e.target.value) || 0})}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duration">Duração (dias)</Label>
                  <Input
                    id="duration"
                    type="number"
                    min="1"
                    max="365"
                    value={selectedPlan.duration}
                    onChange={(e) => setSelectedPlan({...selectedPlan, duration: parseInt(e.target.value) || 0})}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    value={selectedPlan.description}
                    onChange={(e) => setSelectedPlan({...selectedPlan, description: e.target.value})}
                    placeholder="Descreva as características e benefícios do plano..."
                    rows={3}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    checked={selectedPlan.status === "active"}
                    onCheckedChange={(checked) => setSelectedPlan({...selectedPlan, status: checked ? "active" : "inactive"})}
                  />
                  <Label>Plano Ativo</Label>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsPlanModalOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleSavePlan}>
                    {isNewPlan ? "Criar Plano" : "Salvar Alterações"}
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* View User Modal */}
        <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Detalhes do Usuário</DialogTitle>
            </DialogHeader>
            {selectedUser && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Nome</Label>
                    <p className="text-sm text-muted-foreground">{selectedUser.name}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Email</Label>
                    <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Role</Label>
                    <Badge variant={selectedUser.role === "admin" ? "default" : "secondary"}>
                      {selectedUser.role}
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Status</Label>
                    <Badge variant={selectedUser.status === "active" ? "default" : "destructive"}>
                      {selectedUser.status === "active" ? "Ativo" : "Inativo"}
                    </Badge>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Saldo</Label>
                    <p className="text-sm font-semibold text-trading-green">${selectedUser.balance.toLocaleString()}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Lucro Total</Label>
                    <p className="text-sm font-semibold text-primary">+${selectedUser.totalProfit.toLocaleString()}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Data de Cadastro</Label>
                    <p className="text-sm text-muted-foreground">{new Date(selectedUser.joinDate).toLocaleDateString("pt-BR")}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Último Login</Label>
                    <p className="text-sm text-muted-foreground">{new Date(selectedUser.lastLogin).toLocaleDateString("pt-BR")}</p>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium">API Status</Label>
                  <div className="mt-1">
                    <Badge variant={selectedUser.apiConnected ? "default" : "destructive"}>
                      {selectedUser.apiConnected ? "Conectada" : "Desconectada"}
                    </Badge>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Admin;