import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { 
  Trash2, 
  Search,
  AlertTriangle,
  ArrowLeft,
  RefreshCw,
  Target,
  DollarSign,
  Calendar,
  User,
  TrendingUp,
  CheckCircle,
  XCircle
} from "lucide-react";

interface Investment {
  investment_id: string;
  user_email: string;
  user_name: string;
  plan_name: string;
  amount: number;
  daily_rate: number;
  total_earned: number;
  status: string;
  created_at: string;
  days_remaining: number;
}

const DeleteInvestment = () => {
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const { toast } = useToast();
  
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [filteredInvestments, setFilteredInvestments] = useState<Investment[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedInvestment, setSelectedInvestment] = useState<Investment | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteReason, setDeleteReason] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Redirect if not admin
  useEffect(() => {
    if (!isAdmin) {
      navigate('/admin');
      return;
    }
  }, [isAdmin, navigate]);

  // Load investments
  const loadInvestments = async () => {
    setIsLoading(true);
    try {
      console.log('🔍 Carregando investimentos ativos...');
      
      const { data: investmentsData, error } = await supabase
        .rpc('admin_get_all_investments_fixed');

      if (error) {
        console.error('❌ Erro ao carregar investimentos:', error);
        toast({
          title: "Erro",
          description: "Erro ao carregar investimentos: " + error.message,
          variant: "destructive",
        });
        return;
      }

      console.log('📊 Investimentos carregados:', investmentsData?.length || 0);
      
      const formattedInvestments = investmentsData?.map((inv: any) => ({
        investment_id: inv.investment_id,
        user_email: inv.user_email,
        user_name: inv.user_name,
        plan_name: inv.plan_name,
        amount: inv.amount,
        daily_rate: inv.daily_rate,
        total_earned: inv.total_earned,
        status: inv.status,
        created_at: inv.created_at,
        days_remaining: inv.days_remaining
      })) || [];

      setInvestments(formattedInvestments);
      setFilteredInvestments(formattedInvestments);
    } catch (error: any) {
      console.error('❌ Erro ao carregar investimentos:', error);
      toast({
        title: "Erro",
        description: "Erro interno ao carregar investimentos",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Filter investments
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredInvestments(investments);
      return;
    }

    const filtered = investments.filter(inv => 
      inv.user_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.plan_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    setFilteredInvestments(filtered);
  }, [searchTerm, investments]);

  // Load data on component mount
  useEffect(() => {
    loadInvestments();
  }, []);

  // Delete investment
  const handleDeleteInvestment = async () => {
    if (!selectedInvestment || !deleteReason.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, informe o motivo da exclusão",
        variant: "destructive",
      });
      return;
    }

    setIsDeleting(true);
    try {
      console.log('🗑️ Deletando investimento:', {
        investment_id: selectedInvestment.investment_id,
        reason: deleteReason
      });

      const { data: result, error } = await supabase
        .rpc('admin_cancel_user_investment', {
          investment_id_param: selectedInvestment.investment_id,
          admin_reason: deleteReason
        });

      if (error) {
        console.error('❌ Erro ao deletar investimento:', error);
        toast({
          title: "Erro",
          description: "Erro ao deletar investimento: " + error.message,
          variant: "destructive",
        });
        return;
      }

      if (result?.success) {
        console.log('✅ Investimento deletado com sucesso:', result);
        toast({
          title: "Sucesso! ✅",
          description: `Investimento de ${selectedInvestment.user_name} deletado com sucesso`,
        });

        // Reload investments
        await loadInvestments();
        
        // Close modal and reset form
        setIsDeleteModalOpen(false);
        setSelectedInvestment(null);
        setDeleteReason("");
      } else {
        toast({
          title: "Erro",
          description: result?.error || "Erro desconhecido ao deletar investimento",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error('❌ Erro ao deletar investimento:', error);
      toast({
        title: "Erro",
        description: "Erro interno ao deletar investimento",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const openDeleteModal = (investment: Investment) => {
    setSelectedInvestment(investment);
    setDeleteReason("");
    setIsDeleteModalOpen(true);
  };

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-muted/30 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/admin')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar ao Admin
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
                <Trash2 className="h-8 w-8 text-destructive" />
                Deletar Investimentos
              </h1>
              <p className="text-muted-foreground">
                Gerencie e delete investimentos de usuários do sistema
              </p>
            </div>
          </div>
          <Button
            onClick={loadInvestments}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Recarregar
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <Target className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Investimentos</p>
                  <p className="text-2xl font-bold">{investments.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <DollarSign className="h-6 w-6 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Valor Total</p>
                  <p className="text-2xl font-bold">
                    ${investments.reduce((sum, inv) => sum + inv.amount, 0).toFixed(2)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-500/10 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-yellow-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Lucro Total</p>
                  <p className="text-2xl font-bold">
                    ${investments.reduce((sum, inv) => sum + inv.total_earned, 0).toFixed(2)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/10 rounded-lg">
                  <User className="h-6 w-6 text-purple-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Usuários Únicos</p>
                  <p className="text-2xl font-bold">
                    {new Set(investments.map(inv => inv.user_email)).size}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter */}
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Buscar Investimentos
            </CardTitle>
            <CardDescription>
              Busque por email, nome do usuário ou nome do plano
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Label htmlFor="search">Buscar</Label>
                <Input
                  id="search"
                  type="text"
                  placeholder="Digite email, nome ou plano..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div className="flex items-end">
                <Badge variant="secondary">
                  {filteredInvestments.length} de {investments.length} encontrados
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Investments Table */}
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Investimentos Ativos
            </CardTitle>
            <CardDescription>
              Lista de todos os investimentos que podem ser deletados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Usuário</TableHead>
                    <TableHead>Plano</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Taxa Diária</TableHead>
                    <TableHead>Lucro Atual</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Dias Restantes</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInvestments.map((investment) => (
                    <TableRow key={investment.investment_id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{investment.user_name}</p>
                          <p className="text-sm text-muted-foreground">{investment.user_email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{investment.plan_name}</Badge>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">${investment.amount.toFixed(2)}</span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {(investment.daily_rate * 100).toFixed(2)}%
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-green-600 font-medium">
                          ${investment.total_earned.toFixed(2)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={investment.status === 'active' ? 'default' : 'destructive'}
                        >
                          {investment.status === 'active' ? (
                            <><CheckCircle className="h-3 w-3 mr-1" /> Ativo</>
                          ) : (
                            <><XCircle className="h-3 w-3 mr-1" /> {investment.status}</>
                          )}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>{investment.days_remaining} dias</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => openDeleteModal(investment)}
                          className="flex items-center gap-2"
                        >
                          <Trash2 className="h-4 w-4" />
                          Deletar
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              {filteredInvestments.length === 0 && !isLoading && (
                <div className="p-8 text-center text-muted-foreground">
                  <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>
                    {searchTerm 
                      ? "Nenhum investimento encontrado com os critérios de busca"
                      : "Nenhum investimento ativo encontrado"
                    }
                  </p>
                </div>
              )}

              {isLoading && (
                <div className="p-8 text-center">
                  <RefreshCw className="h-8 w-8 mx-auto mb-4 animate-spin text-primary" />
                  <p className="text-muted-foreground">Carregando investimentos...</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Confirmar Exclusão de Investimento
            </DialogTitle>
          </DialogHeader>
          
          {selectedInvestment && (
            <div className="space-y-4">
              <div className="bg-muted/30 p-4 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span className="font-medium">Usuário:</span>
                  <span>{selectedInvestment.user_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Email:</span>
                  <span>{selectedInvestment.user_email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Plano:</span>
                  <span>{selectedInvestment.plan_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Valor:</span>
                  <span>${selectedInvestment.amount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Lucro Atual:</span>
                  <span className="text-green-600">${selectedInvestment.total_earned.toFixed(2)}</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="deleteReason">Motivo da Exclusão *</Label>
                <Textarea
                  id="deleteReason"
                  value={deleteReason}
                  onChange={(e) => setDeleteReason(e.target.value)}
                  placeholder="Digite o motivo para deletar este investimento..."
                  className="min-h-[80px]"
                />
              </div>

              <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <strong>Atenção:</strong> Esta ação não pode ser desfeita. O investimento será cancelado permanentemente.
                </p>
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsDeleteModalOpen(false);
                    setSelectedInvestment(null);
                    setDeleteReason("");
                  }}
                  className="flex-1"
                  disabled={isDeleting}
                >
                  Cancelar
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDeleteInvestment}
                  disabled={isDeleting || !deleteReason.trim()}
                  className="flex-1"
                >
                  {isDeleting ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4 mr-2" />
                  )}
                  {isDeleting ? 'Deletando...' : 'Confirmar Exclusão'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DeleteInvestment;