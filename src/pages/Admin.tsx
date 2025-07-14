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
  Eye
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

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
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

        {/* Investment Configuration */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-card-foreground">Configuração de Investimentos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Investment Plans */}
              <div className="space-y-4">
                <h3 className="font-semibold text-secondary-foreground">Planos de Investimento</h3>
                <div className="space-y-3">
                  {[
                    { name: "Plano Básico", rate: 1.5, min: 100, max: 5000, duration: 30 },
                    { name: "Plano Premium", rate: 2.0, min: 1000, max: 20000, duration: 60 },
                    { name: "Plano VIP", rate: 2.5, min: 5000, max: 100000, duration: 90 }
                  ].map((plan, index) => (
                    <div key={index} className="p-3 bg-secondary rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-medium text-sm">{plan.name}</h4>
                          <p className="text-xs text-muted-foreground">
                            ${plan.min.toLocaleString()} - ${plan.max.toLocaleString()}
                          </p>
                        </div>
                        <Badge variant="default" className="text-xs">
                          {plan.rate}% / dia
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-muted-foreground">{plan.duration} dias</span>
                        <div className="flex space-x-1">
                          <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Switch defaultChecked />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Investment Stats */}
              <div className="space-y-4">
                <h3 className="font-semibold text-secondary-foreground">Estatísticas de Investimento</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-secondary rounded-lg">
                    <div className="text-sm text-muted-foreground">Total Investido</div>
                    <div className="text-lg font-bold text-primary">$567,890</div>
                  </div>
                  <div className="p-3 bg-secondary rounded-lg">
                    <div className="text-sm text-muted-foreground">Pagamentos Diários</div>
                    <div className="text-lg font-bold text-trading-green">$12,345</div>
                  </div>
                  <div className="p-3 bg-secondary rounded-lg">
                    <div className="text-sm text-muted-foreground">Investimentos Ativos</div>
                    <div className="text-lg font-bold text-warning">156</div>
                  </div>
                  <div className="p-3 bg-secondary rounded-lg">
                    <div className="text-sm text-muted-foreground">Taxa Média</div>
                    <div className="text-lg font-bold text-primary">1.8%</div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Plano Básico</span>
                    <span className="font-medium">45 investimentos</span>
                  </div>
                  <Progress value={45} className="h-2" />
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Plano Premium</span>
                    <span className="font-medium">78 investimentos</span>
                  </div>
                  <Progress value={78} className="h-2" />
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Plano VIP</span>
                    <span className="font-medium">33 investimentos</span>
                  </div>
                  <Progress value={33} className="h-2" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* View User Modal */}
        <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Detalhes do Usuário</DialogTitle>
            </DialogHeader>
            {selectedUser && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Nome</Label>
                    <p className="text-lg font-medium">{selectedUser.name}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Email</Label>
                    <p className="text-lg">{selectedUser.email}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Role</Label>
                    <Badge variant={selectedUser.role === "admin" ? "default" : "secondary"}>
                      {selectedUser.role}
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                    <Badge variant={selectedUser.status === "active" ? "default" : "destructive"}>
                      {selectedUser.status}
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Saldo</Label>
                    <p className="text-xl font-bold text-primary">${selectedUser.balance.toLocaleString()}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Lucro Total</Label>
                    <p className="text-xl font-bold text-trading-green">+${selectedUser.totalProfit.toLocaleString()}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Data de Cadastro</Label>
                    <p className="text-lg">{new Date(selectedUser.joinDate).toLocaleDateString("pt-BR")}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Último Login</Label>
                    <p className="text-lg">{new Date(selectedUser.lastLogin).toLocaleDateString("pt-BR")}</p>
                  </div>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">API Connection</Label>
                  <div className="mt-2">
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