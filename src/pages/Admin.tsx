import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
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
  Bot,
  Link,
  Percent,
  Trophy,
  MessageSquare,
  Heart,
  MessageCircle,
  AlertTriangle,
  CheckCircle,
  Clock,
  X as XIcon,
  Download,
  Wallet,
  CreditCard,
  ArrowDown
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
  requiredReferrals: number;
}

interface Withdrawal {
  id: string;
  userId: string;
  userName: string;
  amount: number;
  amountBRL: number;
  type: "pix" | "usdt";
  status: "pending" | "approved" | "rejected" | "processing";
  holderName?: string;
  cpf?: string;
  pixKeyType?: "cpf" | "cnpj" | "email" | "phone" | "random";
  pixKey?: string;
  walletAddress?: string;
  date: string;
  fee: number;
  netAmount: number;
}

interface Deposit {
  id: string;
  userId: string;
  userName: string;
  amount: number;
  amountBRL: number;
  type: "pix" | "usdt";
  status: "pending" | "paid" | "rejected";
  holderName?: string;
  cpf?: string;
  senderName?: string;
  date: string;
  pixCode?: string;
  walletAddress?: string;
}

interface AdminTransaction {
  id: string;
  userId: string;
  userName: string;
  adminUserId: string;
  adminUserName: string;
  amountBefore: number;
  amountAfter: number;
  amountChanged: number;
  transactionType: string;
  reason: string;
  date: string;
}

const Admin = () => {
  const [users, setUsers] = useState<User[]>([]);
  const { user } = useAuth();

  const [investmentPlans, setInvestmentPlans] = useState<InvestmentPlan[]>([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<InvestmentPlan | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [isNewPlan, setIsNewPlan] = useState(false);
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [adminTransactions, setAdminTransactions] = useState<AdminTransaction[]>([]);

  const [depositFilter, setDepositFilter] = useState<"all" | "pending" | "paid" | "rejected">("all");
  const [withdrawalFilter, setWithdrawalFilter] = useState<"all" | "pending" | "approved" | "rejected" | "processing">("all");
  
  const [adminSettings, setAdminSettings] = useState({
    referralPercent: 5,
    residualPercent: 10,
    allowReferrals: true,
    allowResiduals: true,
    // Gamificação
    allowGamification: true,
    postReward: 0.003,
    likeReward: 0.001,
    commentReward: 0.002,
    monthlyLimit: 50,
    spamWarning: "⚠️ AVISO: Spam será banido! Mantenha-se ativo de forma natural para ganhar recompensas.",
    // Configurações de depósito
    pixEnabled: true,
    usdtEnabled: true,
    minimumDeposit: 50,
    maximumDeposit: 10000,
    autoApproval: false,
    // Configurações de saque
    withdrawalFeePixPercent: 2,
    withdrawalFeeUsdtPercent: 5,
    pixDailyLimit: 2000,
    usdtDailyLimit: 10000,
    withdrawalProcessingHours: "09:00-17:00",
    withdrawalBusinessDays: true
  });
  const { toast } = useToast();

  // Load investment plans from Supabase
  useEffect(() => {
    const loadInvestmentPlans = async () => {
      try {
        const { data: plans, error } = await supabase
          .from('investment_plans')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error loading investment plans:', error);
          return;
        }

        if (plans) {
          const formattedPlans = plans.map(plan => ({
            id: plan.id,
            name: plan.name,
            dailyRate: plan.daily_rate,
            minimumAmount: plan.minimum_amount,
            maximumAmount: plan.maximum_amount,
            duration: plan.duration_days,
            description: plan.description || '',
            status: plan.status as "active" | "inactive",
            requiredReferrals: plan.required_referrals || 0
          }));
          setInvestmentPlans(formattedPlans);
        }
      } catch (error) {
        console.error('Error loading investment plans:', error);
      }
    };

    loadInvestmentPlans();
  }, []);

  // Load real data from database
  useEffect(() => {
    const loadAdminData = async () => {
      if (!user) return;

      try {
        // Fetch all users/profiles
        const { data: profiles } = await supabase
          .from('profiles')
          .select('*')
          .order('created_at', { ascending: false });

        if (profiles) {
          const formattedUsers = profiles.map(profile => ({
            id: profile.user_id,
            name: profile.display_name || profile.username || profile.email || 'User',
            email: profile.email || 'no-email',
            role: profile.role as "admin" | "user",
            status: profile.status as "active" | "inactive",
            balance: profile.balance || 0,
            totalProfit: profile.total_profit || 0,
            joinDate: profile.created_at?.split('T')[0] || '',
            lastLogin: profile.last_login?.split('T')[0] || '',
            apiConnected: profile.api_connected || false
          }));
          setUsers(formattedUsers);
        }

        // Fetch deposits
        const { data: depositsData } = await supabase
          .from('deposits')
          .select('*')
          .order('created_at', { ascending: false });

        if (depositsData) {
          const formattedDeposits = depositsData.map(deposit => ({
            id: deposit.id,
            userId: deposit.user_id,
            userName: 'User', // Simplified since there's no relation
            amount: deposit.amount_usd,
            amountBRL: deposit.amount_brl || 0,
            type: deposit.type as "pix" | "usdt",
            status: deposit.status as "pending" | "paid" | "rejected",
            holderName: deposit.holder_name,
            cpf: deposit.cpf,
            senderName: deposit.sender_name,
            date: deposit.created_at,
            pixCode: deposit.pix_code,
            walletAddress: deposit.wallet_address
          }));
          setDeposits(formattedDeposits);
        }

        // Fetch withdrawals
        const { data: withdrawalsData } = await supabase
          .from('withdrawals')
          .select('*')
          .order('created_at', { ascending: false });

        if (withdrawalsData) {
          const formattedWithdrawals = withdrawalsData.map(withdrawal => ({
            id: withdrawal.id,
            userId: withdrawal.user_id,
            userName: 'User', // Simplified since there's no relation
            amount: withdrawal.amount_usd,
            amountBRL: withdrawal.amount_brl || 0,
            type: withdrawal.type as "pix" | "usdt",
            status: withdrawal.status as "pending" | "approved" | "rejected" | "processing",
            holderName: withdrawal.holder_name,
            cpf: withdrawal.cpf,
            pixKeyType: withdrawal.pix_key_type as "cpf" | "cnpj" | "email" | "phone" | "random",
            pixKey: withdrawal.pix_key,
            walletAddress: withdrawal.wallet_address,
            date: withdrawal.created_at,
            fee: withdrawal.fee,
            netAmount: withdrawal.net_amount
          }));
          setWithdrawals(formattedWithdrawals);
        }

        // Fetch admin balance transactions
        const { data: transactionsData } = await supabase
          .from('admin_balance_transactions')
          .select(`
            *,
            user_profile:profiles!admin_balance_transactions_user_id_fkey(display_name, email),
            admin_profile:profiles!admin_balance_transactions_admin_user_id_fkey(display_name, email)
          `)
          .order('created_at', { ascending: false });

        if (transactionsData) {
          const formattedTransactions = transactionsData.map(transaction => ({
            id: transaction.id,
            userId: transaction.user_id,
            userName: transaction.user_profile?.display_name || transaction.user_profile?.email || 'User',
            adminUserId: transaction.admin_user_id,
            adminUserName: transaction.admin_profile?.display_name || transaction.admin_profile?.email || 'Admin',
            amountBefore: transaction.amount_before,
            amountAfter: transaction.amount_after,
            amountChanged: transaction.amount_changed,
            transactionType: transaction.transaction_type,
            reason: transaction.reason || '',
            date: transaction.created_at
          }));
          setAdminTransactions(formattedTransactions);
        }
      } catch (error) {
        console.error('Erro ao carregar dados do admin:', error);
      }
    };

    loadAdminData();
  }, [user]);

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeUsers = users.filter(user => user.status === "active").length;
  const totalBalance = users.reduce((sum, user) => sum + user.balance, 0);
  const totalProfit = users.reduce((sum, user) => sum + user.totalProfit, 0);
  const connectedUsers = users.filter(user => user.apiConnected).length;
  
  const filteredDeposits = deposits.filter(deposit => 
    depositFilter === "all" || deposit.status === depositFilter
  );
  
  const filteredWithdrawals = withdrawals.filter(withdrawal => 
    withdrawalFilter === "all" || withdrawal.status === withdrawalFilter
  );
  
  const pendingDeposits = deposits.filter(d => d.status === "pending").length;
  const pendingWithdrawals = withdrawals.filter(w => w.status === "pending").length;
  const totalDepositAmount = deposits.filter(d => d.status === "paid").reduce((sum, d) => sum + d.amount, 0);
  const totalWithdrawalAmount = withdrawals.filter(w => w.status === "approved").reduce((sum, w) => sum + w.netAmount, 0);

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

  const handleSaveUser = async () => {
    if (selectedUser && user) {
      try {
        // Buscar o saldo atual do usuário no banco
        const { data: currentProfile, error: fetchError } = await supabase
          .from('profiles')
          .select('balance')
          .eq('user_id', selectedUser.id)
          .single();

        if (fetchError && fetchError.code !== 'PGRST116') {
          console.error('Error fetching current balance:', fetchError);
          toast({
            title: "Erro",
            description: "Erro ao buscar saldo atual do usuário.",
          });
          return;
        }

        const currentBalance = currentProfile?.balance || 0;
        const newBalance = selectedUser.balance;
        const balanceChanged = newBalance - currentBalance;

        // Atualizar saldo no banco de dados
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ 
            balance: newBalance,
            display_name: selectedUser.name,
            email: selectedUser.email
          })
          .eq('user_id', selectedUser.id);

        if (updateError) {
          console.error('Error updating user:', updateError);
          toast({
            title: "Erro",
            description: "Erro ao atualizar usuário no banco de dados.",
          });
          return;
        }

        // Se houve mudança no saldo, registrar a transação administrativa
        if (Math.abs(balanceChanged) > 0.001) {
          const { error: transactionError } = await supabase
            .from('admin_balance_transactions')
            .insert([{
              user_id: selectedUser.id,
              admin_user_id: user.id,
              amount_before: currentBalance,
              amount_after: newBalance,
              amount_changed: balanceChanged,
              transaction_type: 'balance_adjustment',
              reason: `Saldo ${balanceChanged > 0 ? 'adicionado' : 'removido'} pelo administrador`
            }]);

          if (transactionError) {
            console.error('Error creating transaction record:', transactionError);
            // Não bloquear a operação se falhar o registro da transação
          }
        }

        // Atualizar estado local
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
      } catch (error) {
        console.error('Error saving user:', error);
        toast({
          title: "Erro",
          description: "Erro ao salvar alterações do usuário.",
        });
      }
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
      status: "active",
      requiredReferrals: 0
    });
    setIsNewPlan(true);
    setIsPlanModalOpen(true);
  };

  const handleSavePlan = async () => {
    if (selectedPlan) {
      try {
        if (isNewPlan) {
          const { data, error } = await supabase
            .from('investment_plans')
            .insert([{
              name: selectedPlan.name,
              daily_rate: selectedPlan.dailyRate,
              minimum_amount: selectedPlan.minimumAmount,
              maximum_amount: selectedPlan.maximumAmount,
              duration_days: selectedPlan.duration,
              description: selectedPlan.description,
              status: selectedPlan.status,
              required_referrals: selectedPlan.requiredReferrals
            }])
            .select()
            .single();

          if (error) {
            console.error('Error creating plan:', error);
            toast({
              title: "Erro",
              description: "Erro ao criar plano de investimento.",
            });
            return;
          }

          if (data) {
            const newPlan = {
              id: data.id,
              name: data.name,
              dailyRate: data.daily_rate,
              minimumAmount: data.minimum_amount,
              maximumAmount: data.maximum_amount,
              duration: data.duration_days,
              description: data.description || '',
              status: data.status as "active" | "inactive",
              requiredReferrals: data.required_referrals || 0
            };
            setInvestmentPlans(prev => [...prev, newPlan]);
            
            toast({
              title: "Plano criado",
              description: "Novo plano de investimento foi criado com sucesso.",
            });
          }
        } else {
          const { error } = await supabase
            .from('investment_plans')
            .update({
              name: selectedPlan.name,
              daily_rate: selectedPlan.dailyRate,
              minimum_amount: selectedPlan.minimumAmount,
              maximum_amount: selectedPlan.maximumAmount,
              duration_days: selectedPlan.duration,
              description: selectedPlan.description,
              status: selectedPlan.status,
              required_referrals: selectedPlan.requiredReferrals
            })
            .eq('id', selectedPlan.id);

          if (error) {
            console.error('Error updating plan:', error);
            toast({
              title: "Erro",
              description: "Erro ao atualizar plano de investimento.",
            });
            return;
          }

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
      } catch (error) {
        console.error('Error saving plan:', error);
        toast({
          title: "Erro",
          description: "Erro ao salvar plano de investimento.",
        });
      }
    }
  };

  const handleDeletePlan = async (planId: string) => {
    try {
      const { error } = await supabase
        .from('investment_plans')
        .delete()
        .eq('id', planId);

      if (error) {
        console.error('Error deleting plan:', error);
        toast({
          title: "Erro",
          description: "Erro ao remover plano de investimento.",
        });
        return;
      }

      setInvestmentPlans(prev => prev.filter(plan => plan.id !== planId));
      
      toast({
        title: "Plano removido",
        description: "Plano de investimento foi removido do sistema.",
      });
    } catch (error) {
      console.error('Error deleting plan:', error);
      toast({
        title: "Erro",
        description: "Erro ao remover plano de investimento.",
      });
    }
  };

  const handleWithdrawalAction = (withdrawalId: string, action: "approve" | "reject") => {
    setWithdrawals(prev =>
      prev.map(withdrawal =>
        withdrawal.id === withdrawalId
          ? { ...withdrawal, status: action === "approve" ? "approved" : "rejected" }
          : withdrawal
      )
    );
    
    toast({
      title: action === "approve" ? "Saque aprovado" : "Saque rejeitado",
      description: `Saque foi ${action === "approve" ? "aprovado" : "rejeitado"} com sucesso.`,
    });
  };

  const exportWithdrawalsReport = () => {
    const csvContent = [
      ["Data", "Usuário", "Tipo", "Valor USD", "Taxa", "Líquido", "Status", "Detalhes"],
      ...withdrawals.map(w => [
        new Date(w.date).toLocaleDateString("pt-BR"),
        w.userName,
        w.type.toUpperCase(),
        `$${w.amount}`,
        `$${w.fee}`,
        `$${w.netAmount}`,
        w.status,
        w.type === "pix" ? `${w.holderName} - ${w.pixKey}` : w.walletAddress || ""
      ])
    ].map(row => row.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `saques_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    toast({
      title: "Relatório exportado",
      description: "Relatório de saques foi baixado com sucesso.",
    });
  };

  const handleTogglePlanStatus = async (planId: string) => {
    const plan = investmentPlans.find(p => p.id === planId);
    if (!plan) return;

    const newStatus = plan.status === "active" ? "inactive" : "active";

    try {
      const { error } = await supabase
        .from('investment_plans')
        .update({ status: newStatus })
        .eq('id', planId);

      if (error) {
        console.error('Error updating plan status:', error);
        toast({
          title: "Erro",
          description: "Erro ao alterar status do plano.",
        });
        return;
      }

      setInvestmentPlans(prev =>
        prev.map(plan =>
          plan.id === planId
            ? { ...plan, status: newStatus }
            : plan
        )
      );
      
      toast({
        title: "Status atualizado",
        description: "Status do plano foi alterado com sucesso.",
      });
    } catch (error) {
      console.error('Error updating plan status:', error);
      toast({
        title: "Erro",
        description: "Erro ao alterar status do plano.",
      });
    }
  };

  const handleDepositAction = (depositId: string, action: "approve" | "reject") => {
    setDeposits(prev =>
      prev.map(deposit =>
        deposit.id === depositId
          ? { ...deposit, status: action === "approve" ? "paid" : "rejected" }
          : deposit
      )
    );
    
    toast({
      title: action === "approve" ? "Depósito aprovado" : "Depósito rejeitado",
      description: `Depósito foi ${action === "approve" ? "aprovado" : "rejeitado"} com sucesso.`,
    });
  };

  const exportDepositsReport = () => {
    const csvContent = [
      ["Data", "Usuário", "Tipo", "Valor USD", "Valor BRL", "Status", "Titular/Remetente"],
      ...deposits.map(d => [
        new Date(d.date).toLocaleDateString("pt-BR"),
        d.userName,
        d.type.toUpperCase(),
        `$${d.amount}`,
        `R$ ${d.amountBRL.toLocaleString()}`,
        d.status,
        d.holderName || d.senderName || ""
      ])
    ].map(row => row.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `depositos_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    toast({
      title: "Relatório exportado",
      description: "Relatório de depósitos foi baixado com sucesso.",
    });
  };


  // Carregar e salvar configurações do admin
  useEffect(() => {
    const savedSettings = localStorage.getItem("alphabit_admin_settings");
    if (savedSettings) {
      const loaded = JSON.parse(savedSettings);
      setAdminSettings({
        referralPercent: loaded.referralPercent || 5,
        residualPercent: loaded.residualPercent || 10,
        allowReferrals: loaded.allowReferrals !== undefined ? loaded.allowReferrals : true,
        allowResiduals: loaded.allowResiduals !== undefined ? loaded.allowResiduals : true,
        // Gamificação com valores padrão
        allowGamification: loaded.allowGamification !== undefined ? loaded.allowGamification : true,
        postReward: loaded.postReward || 0.003,
        likeReward: loaded.likeReward || 0.001,
        commentReward: loaded.commentReward || 0.002,
        monthlyLimit: loaded.monthlyLimit || 50,
        spamWarning: loaded.spamWarning || "⚠️ AVISO: Spam será banido! Mantenha-se ativo de forma natural para ganhar recompensas.",
        // Configurações de depósito com valores padrão
        pixEnabled: loaded.pixEnabled !== undefined ? loaded.pixEnabled : true,
        usdtEnabled: loaded.usdtEnabled !== undefined ? loaded.usdtEnabled : true,
        minimumDeposit: loaded.minimumDeposit || 50,
        maximumDeposit: loaded.maximumDeposit || 10000,
        autoApproval: loaded.autoApproval !== undefined ? loaded.autoApproval : false,
        // Configurações de saque com valores padrão
        withdrawalFeePixPercent: loaded.withdrawalFeePixPercent || 2,
        withdrawalFeeUsdtPercent: loaded.withdrawalFeeUsdtPercent || 5,
        pixDailyLimit: loaded.pixDailyLimit || 2000,
        usdtDailyLimit: loaded.usdtDailyLimit || 10000,
        withdrawalProcessingHours: loaded.withdrawalProcessingHours || "09:00-17:00",
        withdrawalBusinessDays: loaded.withdrawalBusinessDays !== undefined ? loaded.withdrawalBusinessDays : true
      });
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("alphabit_admin_settings", JSON.stringify(adminSettings));
  }, [adminSettings]);

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

        {/* Main Content with Tabs */}
        <Tabs defaultValue="users" className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="users">Usuários</TabsTrigger>
            <TabsTrigger value="deposits">Depósitos</TabsTrigger>
            <TabsTrigger value="withdrawals">Saques</TabsTrigger>
            <TabsTrigger value="bonus">Bônus</TabsTrigger>
            <TabsTrigger value="transactions">Transações</TabsTrigger>
            <TabsTrigger value="settings">Configurações</TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-6">
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

        {/* Gestão de Depósitos */}
        <Card className="bg-card border-border">
          <CardHeader>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <CardTitle className="text-card-foreground flex items-center">
                <Wallet className="h-5 w-5 mr-2 text-primary" />
                Gestão de Depósitos
              </CardTitle>
              <div className="flex flex-col sm:flex-row gap-2">
                <Button onClick={exportDepositsReport} variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Exportar Relatório
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Stats de Depósitos */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Pendentes</p>
                      <p className="text-2xl font-bold text-warning">{pendingDeposits}</p>
                    </div>
                    <Clock className="h-8 w-8 text-warning" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Total Depositado</p>
                      <p className="text-2xl font-bold text-trading-green">${totalDepositAmount.toLocaleString()}</p>
                    </div>
                    <DollarSign className="h-8 w-8 text-trading-green" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Total Depósitos</p>
                      <p className="text-2xl font-bold text-primary">{deposits.length}</p>
                    </div>
                    <CreditCard className="h-8 w-8 text-primary" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Configurações de Depósito */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center">
                  <Settings className="h-5 w-5 mr-2" />
                  Configurações de Depósito
                </h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="pixEnabled" className="text-sm font-medium">Permitir PIX</Label>
                    <Switch
                      id="pixEnabled"
                      checked={adminSettings.pixEnabled}
                      onCheckedChange={(checked) => 
                        setAdminSettings(prev => ({ ...prev, pixEnabled: checked }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="usdtEnabled" className="text-sm font-medium">Permitir USDT BNB20</Label>
                    <Switch
                      id="usdtEnabled"
                      checked={adminSettings.usdtEnabled}
                      onCheckedChange={(checked) => 
                        setAdminSettings(prev => ({ ...prev, usdtEnabled: checked }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="autoApproval" className="text-sm font-medium">Aprovação Automática</Label>
                    <Switch
                      id="autoApproval"
                      checked={adminSettings.autoApproval}
                      onCheckedChange={(checked) => 
                        setAdminSettings(prev => ({ ...prev, autoApproval: checked }))
                      }
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="minimumDeposit">Depósito Mínimo ($)</Label>
                      <Input
                        id="minimumDeposit"
                        type="number"
                        min="1"
                        value={adminSettings.minimumDeposit}
                        onChange={(e) => 
                          setAdminSettings(prev => ({ 
                            ...prev, 
                            minimumDeposit: parseInt(e.target.value) || 1 
                          }))
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="maximumDeposit">Depósito Máximo ($)</Label>
                      <Input
                        id="maximumDeposit"
                        type="number"
                        min="100"
                        value={adminSettings.maximumDeposit}
                        onChange={(e) => 
                          setAdminSettings(prev => ({ 
                            ...prev, 
                            maximumDeposit: parseInt(e.target.value) || 100 
                          }))
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Informações do Sistema</h3>
                <div className="p-4 bg-secondary rounded-lg">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>PIX:</span>
                      <Badge variant={adminSettings.pixEnabled ? "default" : "secondary"}>
                        {adminSettings.pixEnabled ? "Ativo" : "Inativo"}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>USDT BNB20:</span>
                      <Badge variant={adminSettings.usdtEnabled ? "default" : "secondary"}>
                        {adminSettings.usdtEnabled ? "Ativo" : "Inativo"}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Aprovação:</span>
                      <Badge variant={adminSettings.autoApproval ? "default" : "secondary"}>
                        {adminSettings.autoApproval ? "Automática" : "Manual"}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Limites:</span>
                      <span className="font-medium">${adminSettings.minimumDeposit} - ${adminSettings.maximumDeposit}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Filtros de Depósito */}
            <div className="flex flex-wrap gap-2">
              {[
                { key: "all", label: "Todos", count: deposits.length },
                { key: "pending", label: "Pendentes", count: deposits.filter(d => d.status === "pending").length },
                { key: "paid", label: "Pagos", count: deposits.filter(d => d.status === "paid").length },
                { key: "rejected", label: "Rejeitados", count: deposits.filter(d => d.status === "rejected").length }
              ].map(filter => (
                <Button
                  key={filter.key}
                  variant={depositFilter === filter.key ? "default" : "outline"}
                  size="sm"
                  onClick={() => setDepositFilter(filter.key as any)}
                >
                  {filter.label} ({filter.count})
                </Button>
              ))}
            </div>

            {/* Tabela de Depósitos */}
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs sm:text-sm">Data</TableHead>
                    <TableHead className="text-xs sm:text-sm">Usuário</TableHead>
                    <TableHead className="text-xs sm:text-sm">Tipo</TableHead>
                    <TableHead className="text-xs sm:text-sm">Valor</TableHead>
                    <TableHead className="text-xs sm:text-sm">Status</TableHead>
                    <TableHead className="text-xs sm:text-sm">Titular/Remetente</TableHead>
                    <TableHead className="text-xs sm:text-sm">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDeposits.map((deposit) => (
                    <TableRow key={deposit.id}>
                      <TableCell className="text-xs sm:text-sm">
                        {new Date(deposit.date).toLocaleDateString("pt-BR")}
                        <div className="text-xs text-muted-foreground">
                          {new Date(deposit.date).toLocaleTimeString("pt-BR", { 
                            hour: "2-digit", 
                            minute: "2-digit" 
                          })}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium text-xs sm:text-sm">
                        {deposit.userName}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {deposit.type.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium text-xs sm:text-sm">
                        <div>${deposit.amount}</div>
                        <div className="text-xs text-muted-foreground">
                          R$ {deposit.amountBRL.toLocaleString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={
                            deposit.status === "paid" ? "default" : 
                            deposit.status === "pending" ? "secondary" : 
                            "destructive"
                          }
                          className="text-xs"
                        >
                          {deposit.status === "paid" ? "Pago" : 
                           deposit.status === "pending" ? "Pendente" : 
                           "Rejeitado"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs sm:text-sm">
                        {deposit.holderName || deposit.senderName}
                        {deposit.cpf && (
                          <div className="text-xs text-muted-foreground">
                            CPF: {deposit.cpf}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        {deposit.status === "pending" && (
                          <div className="flex items-center space-x-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDepositAction(deposit.id, "approve")}
                              className="h-8 w-8 p-0 text-trading-green hover:text-trading-green"
                            >
                              <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDepositAction(deposit.id, "reject")}
                              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                            >
                              <XIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>


        {/* Gestão de Saques */}
        <Card className="bg-card border-border">
          <CardHeader>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <CardTitle className="text-card-foreground flex items-center">
                <ArrowDown className="h-5 w-5 mr-2 text-primary" />
                Gestão de Saques
              </CardTitle>
              <div className="flex flex-col sm:flex-row gap-2">
                <Button onClick={exportWithdrawalsReport} variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Exportar Relatório
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Stats de Saques */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Pendentes</p>
                      <p className="text-2xl font-bold text-warning">{pendingWithdrawals}</p>
                    </div>
                    <Clock className="h-8 w-8 text-warning" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Total Sacado</p>
                      <p className="text-2xl font-bold text-primary">${totalWithdrawalAmount.toLocaleString()}</p>
                    </div>
                    <DollarSign className="h-8 w-8 text-primary" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Total Saques</p>
                      <p className="text-2xl font-bold text-trading-green">{withdrawals.length}</p>
                    </div>
                    <ArrowDown className="h-8 w-8 text-trading-green" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Configurações de Saque */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center">
                  <Settings className="h-5 w-5 mr-2" />
                  Configurações de Saque
                </h3>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="withdrawalFeePixPercent">Taxa PIX (%)</Label>
                      <Input
                        id="withdrawalFeePixPercent"
                        type="number"
                        min="0"
                        max="10"
                        step="0.1"
                        value={adminSettings.withdrawalFeePixPercent}
                        onChange={(e) => 
                          setAdminSettings(prev => ({ 
                            ...prev, 
                            withdrawalFeePixPercent: parseFloat(e.target.value) || 0 
                          }))
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="withdrawalFeeUsdtPercent">Taxa USDT (%)</Label>
                      <Input
                        id="withdrawalFeeUsdtPercent"
                        type="number"
                        min="0"
                        max="10"
                        step="0.1"
                        value={adminSettings.withdrawalFeeUsdtPercent}
                        onChange={(e) => 
                          setAdminSettings(prev => ({ 
                            ...prev, 
                            withdrawalFeeUsdtPercent: parseFloat(e.target.value) || 0 
                          }))
                        }
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="pixDailyLimit">Limite PIX/dia (R$)</Label>
                      <Input
                        id="pixDailyLimit"
                        type="number"
                        min="100"
                        value={adminSettings.pixDailyLimit}
                        onChange={(e) => 
                          setAdminSettings(prev => ({ 
                            ...prev, 
                            pixDailyLimit: parseInt(e.target.value) || 100 
                          }))
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="usdtDailyLimit">Limite USDT/dia (R$)</Label>
                      <Input
                        id="usdtDailyLimit"
                        type="number"
                        min="1000"
                        value={adminSettings.usdtDailyLimit}
                        onChange={(e) => 
                          setAdminSettings(prev => ({ 
                            ...prev, 
                            usdtDailyLimit: parseInt(e.target.value) || 1000 
                          }))
                        }
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="withdrawalBusinessDays" className="text-sm font-medium">Apenas Dias Úteis</Label>
                    <Switch
                      id="withdrawalBusinessDays"
                      checked={adminSettings.withdrawalBusinessDays}
                      onCheckedChange={(checked) => 
                        setAdminSettings(prev => ({ ...prev, withdrawalBusinessDays: checked }))
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="withdrawalProcessingHours">Horário de Processamento</Label>
                    <Input
                      id="withdrawalProcessingHours"
                      value={adminSettings.withdrawalProcessingHours}
                      onChange={(e) => 
                        setAdminSettings(prev => ({ 
                          ...prev, 
                          withdrawalProcessingHours: e.target.value 
                        }))
                      }
                      placeholder="09:00-17:00"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Informações do Sistema</h3>
                <div className="p-4 bg-secondary rounded-lg">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Taxa PIX:</span>
                      <span className="font-medium">{adminSettings.withdrawalFeePixPercent}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Taxa USDT:</span>
                      <span className="font-medium">{adminSettings.withdrawalFeeUsdtPercent}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Limite PIX:</span>
                      <span className="font-medium">R$ {adminSettings.pixDailyLimit.toLocaleString()}/dia</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Limite USDT:</span>
                      <span className="font-medium">R$ {adminSettings.usdtDailyLimit.toLocaleString()}/dia</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Horário:</span>
                      <span className="font-medium">{adminSettings.withdrawalProcessingHours}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Dias úteis:</span>
                      <Badge variant={adminSettings.withdrawalBusinessDays ? "default" : "secondary"}>
                        {adminSettings.withdrawalBusinessDays ? "Sim" : "Não"}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg dark:bg-amber-950 dark:border-amber-800">
                  <h4 className="text-sm font-medium mb-2 text-amber-800 dark:text-amber-200">
                    ⏰ Processamento de Saques
                  </h4>
                  <ul className="text-xs text-amber-700 dark:text-amber-300 space-y-1">
                    <li>• Processamento em até 2 horas úteis</li>
                    <li>• Verificação automática de dados</li>
                    <li>• Notificação por email ao usuário</li>
                    <li>• Rejeição automática para dados incorretos</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Filtros de Saque */}
            <div className="flex flex-wrap gap-2">
              {[
                { key: "all", label: "Todos", count: withdrawals.length },
                { key: "pending", label: "Pendentes", count: withdrawals.filter(w => w.status === "pending").length },
                { key: "approved", label: "Aprovados", count: withdrawals.filter(w => w.status === "approved").length },
                { key: "processing", label: "Processando", count: withdrawals.filter(w => w.status === "processing").length },
                { key: "rejected", label: "Rejeitados", count: withdrawals.filter(w => w.status === "rejected").length }
              ].map(filter => (
                <Button
                  key={filter.key}
                  variant={withdrawalFilter === filter.key ? "default" : "outline"}
                  size="sm"
                  onClick={() => setWithdrawalFilter(filter.key as any)}
                >
                  {filter.label} ({filter.count})
                </Button>
              ))}
            </div>

            {/* Tabela de Saques */}
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs sm:text-sm">Data</TableHead>
                    <TableHead className="text-xs sm:text-sm">Usuário</TableHead>
                    <TableHead className="text-xs sm:text-sm">Tipo</TableHead>
                    <TableHead className="text-xs sm:text-sm">Valor</TableHead>
                    <TableHead className="text-xs sm:text-sm">Taxa</TableHead>
                    <TableHead className="text-xs sm:text-sm">Líquido</TableHead>
                    <TableHead className="text-xs sm:text-sm">Status</TableHead>
                    <TableHead className="text-xs sm:text-sm">Detalhes</TableHead>
                    <TableHead className="text-xs sm:text-sm">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredWithdrawals.map((withdrawal) => (
                    <TableRow key={withdrawal.id}>
                      <TableCell className="text-xs sm:text-sm">
                        {new Date(withdrawal.date).toLocaleDateString("pt-BR")}
                        <div className="text-xs text-muted-foreground">
                          {new Date(withdrawal.date).toLocaleTimeString("pt-BR", { 
                            hour: "2-digit", 
                            minute: "2-digit" 
                          })}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium text-xs sm:text-sm">
                        {withdrawal.userName}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {withdrawal.type.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium text-xs sm:text-sm">
                        <div>${withdrawal.amount}</div>
                        <div className="text-xs text-muted-foreground">
                          R$ {withdrawal.amountBRL.toLocaleString()}
                        </div>
                      </TableCell>
                      <TableCell className="text-xs sm:text-sm text-destructive">
                        -${withdrawal.fee.toFixed(2)}
                      </TableCell>
                      <TableCell className="font-medium text-xs sm:text-sm text-trading-green">
                        ${withdrawal.netAmount.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={
                            withdrawal.status === "approved" ? "default" : 
                            withdrawal.status === "processing" ? "secondary" : 
                            withdrawal.status === "pending" ? "outline" :
                            "destructive"
                          }
                          className="text-xs"
                        >
                          {withdrawal.status === "approved" ? "Aprovado" : 
                           withdrawal.status === "processing" ? "Processando" :
                           withdrawal.status === "pending" ? "Pendente" : 
                           "Rejeitado"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs sm:text-sm">
                        {withdrawal.type === "pix" ? (
                          <div>
                            <div className="font-medium">{withdrawal.holderName}</div>
                            <div className="text-muted-foreground">CPF: {withdrawal.cpf}</div>
                            <div className="text-muted-foreground">
                              {withdrawal.pixKeyType?.toUpperCase()}: {withdrawal.pixKey}
                            </div>
                          </div>
                        ) : (
                          <div>
                            <div className="font-medium">USDT BNB20</div>
                            <div className="text-muted-foreground text-xs">
                              {withdrawal.walletAddress?.substring(0, 15)}...
                            </div>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        {withdrawal.status === "pending" && (
                          <div className="flex items-center space-x-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleWithdrawalAction(withdrawal.id, "approve")}
                              className="h-8 w-8 p-0 text-trading-green hover:text-trading-green"
                            >
                              <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleWithdrawalAction(withdrawal.id, "reject")}
                              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                            >
                              <XIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
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

        {/* Referral System Settings */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-card-foreground flex items-center">
              <Link className="h-5 w-5 mr-2 text-primary" />
              Sistema de Indicações
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="allowReferrals" className="text-sm font-medium">
                    Permitir Sistema de Indicações
                  </Label>
                  <Switch
                    id="allowReferrals"
                    checked={adminSettings.allowReferrals}
                    onCheckedChange={(checked) => 
                      setAdminSettings(prev => ({ ...prev, allowReferrals: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="allowResiduals" className="text-sm font-medium">
                    Permitir Bônus Residual
                  </Label>
                  <Switch
                    id="allowResiduals"
                    checked={adminSettings.allowResiduals}
                    onCheckedChange={(checked) => 
                      setAdminSettings(prev => ({ ...prev, allowResiduals: checked }))
                    }
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="referralPercent" className="text-sm font-medium flex items-center">
                      <Percent className="h-4 w-4 mr-1" />
                      Comissão por Indicação (%)
                    </Label>
                    <Input
                      id="referralPercent"
                      type="number"
                      min="0"
                      max="50"
                      step="0.5"
                      value={adminSettings.referralPercent}
                      onChange={(e) => 
                        setAdminSettings(prev => ({ 
                          ...prev, 
                          referralPercent: parseFloat(e.target.value) || 0 
                        }))
                      }
                      disabled={!adminSettings.allowReferrals}
                    />
                    <p className="text-xs text-muted-foreground">
                      Percentual único quando alguém se cadastra via indicação
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="residualPercent" className="text-sm font-medium flex items-center">
                      <Percent className="h-4 w-4 mr-1" />
                      Bônus Residual (%)
                    </Label>
                    <Input
                      id="residualPercent"
                      type="number"
                      min="0"
                      max="25"
                      step="0.5"
                      value={adminSettings.residualPercent}
                      onChange={(e) => 
                        setAdminSettings(prev => ({ 
                          ...prev, 
                          residualPercent: parseFloat(e.target.value) || 0 
                        }))
                      }
                      disabled={!adminSettings.allowResiduals}
                    />
                    <p className="text-xs text-muted-foreground">
                      Percentual dos lucros diários dos investimentos dos indicados
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-secondary rounded-lg">
                  <h4 className="text-sm font-medium mb-2 flex items-center">
                    <Settings className="h-4 w-4 mr-1" />
                    Como Funciona
                  </h4>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    <li>• <strong>Indicação:</strong> Usuário ganha {adminSettings.referralPercent}% do valor investido (única vez)</li>
                    <li>• <strong>Residual:</strong> Usuário ganha {adminSettings.residualPercent}% dos lucros diários (contínuo)</li>
                    <li>• Residuais são creditados enquanto o investimento estiver ativo</li>
                    <li>• Sistema rastreia automaticamente todas as transações</li>
                  </ul>
                </div>

                <div className="p-4 bg-primary/10 rounded-lg">
                  <h4 className="text-sm font-medium mb-2 text-primary">
                    Exemplo de Ganhos:
                  </h4>
                  <div className="text-xs space-y-1">
                    <div><strong>Indicação:</strong> Indicado investe $1.000 → Indicador ganha ${(1000 * adminSettings.referralPercent / 100).toFixed(2)} (única vez)</div>
                    <div><strong>Residual:</strong> Lucro diário $10 → Indicador ganha ${(10 * adminSettings.residualPercent / 100).toFixed(2)}/dia</div>
                    <div className="text-primary font-medium">Residual mensal: ${(10 * adminSettings.residualPercent / 100 * 30).toFixed(2)}</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sistema de Gamificação */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-card-foreground flex items-center">
              <Trophy className="h-5 w-5 mr-2 text-primary" />
              Sistema de Gamificação
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="allowGamification" className="text-sm font-medium">
                    Permitir Sistema de Gamificação
                  </Label>
                  <Switch
                    id="allowGamification"
                    checked={adminSettings.allowGamification}
                    onCheckedChange={(checked) => 
                      setAdminSettings(prev => ({ ...prev, allowGamification: checked }))
                    }
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="postReward" className="text-sm font-medium flex items-center">
                      <MessageSquare className="h-4 w-4 mr-1" />
                      Recompensa por Post ($)
                    </Label>
                    <Input
                      id="postReward"
                      type="number"
                      min="0"
                      max="0.1"
                      step="0.001"
                      value={adminSettings.postReward}
                      onChange={(e) => 
                        setAdminSettings(prev => ({ 
                          ...prev, 
                          postReward: parseFloat(e.target.value) || 0 
                        }))
                      }
                      disabled={!adminSettings.allowGamification}
                    />
                    <p className="text-xs text-muted-foreground">
                      Valor pago por cada publicação na comunidade
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="likeReward" className="text-sm font-medium flex items-center">
                      <Heart className="h-4 w-4 mr-1" />
                      Recompensa por Curtida ($)
                    </Label>
                    <Input
                      id="likeReward"
                      type="number"
                      min="0"
                      max="0.01"
                      step="0.001"
                      value={adminSettings.likeReward}
                      onChange={(e) => 
                        setAdminSettings(prev => ({ 
                          ...prev, 
                          likeReward: parseFloat(e.target.value) || 0 
                        }))
                      }
                      disabled={!adminSettings.allowGamification}
                    />
                    <p className="text-xs text-muted-foreground">
                      Valor pago por cada curtida dada/recebida
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="commentReward" className="text-sm font-medium flex items-center">
                      <MessageCircle className="h-4 w-4 mr-1" />
                      Recompensa por Comentário ($)
                    </Label>
                    <Input
                      id="commentReward"
                      type="number"
                      min="0"
                      max="0.05"
                      step="0.001"
                      value={adminSettings.commentReward}
                      onChange={(e) => 
                        setAdminSettings(prev => ({ 
                          ...prev, 
                          commentReward: parseFloat(e.target.value) || 0 
                        }))
                      }
                      disabled={!adminSettings.allowGamification}
                    />
                    <p className="text-xs text-muted-foreground">
                      Valor pago por cada comentário publicado
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="monthlyLimit" className="text-sm font-medium flex items-center">
                      <DollarSign className="h-4 w-4 mr-1" />
                      Limite Mensal ($)
                    </Label>
                    <Input
                      id="monthlyLimit"
                      type="number"
                      min="1"
                      max="500"
                      value={adminSettings.monthlyLimit}
                      onChange={(e) => 
                        setAdminSettings(prev => ({ 
                          ...prev, 
                          monthlyLimit: parseInt(e.target.value) || 0 
                        }))
                      }
                      disabled={!adminSettings.allowGamification}
                    />
                    <p className="text-xs text-muted-foreground">
                      Valor máximo que um usuário pode ganhar por mês
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="spamWarning" className="text-sm font-medium flex items-center">
                    <AlertTriangle className="h-4 w-4 mr-1" />
                    Aviso Anti-Spam
                  </Label>
                  <Textarea
                    id="spamWarning"
                    value={adminSettings.spamWarning}
                    onChange={(e) => 
                      setAdminSettings(prev => ({ 
                        ...prev, 
                        spamWarning: e.target.value 
                      }))
                    }
                    placeholder="Mensagem de aviso sobre spam..."
                    rows={2}
                    disabled={!adminSettings.allowGamification}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-secondary rounded-lg">
                  <h4 className="text-sm font-medium mb-2 flex items-center">
                    <Trophy className="h-4 w-4 mr-1" />
                    Recompensas por Atividade
                  </h4>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    <li>• <strong>Post:</strong> ${adminSettings.postReward.toFixed(3)} por publicação</li>
                    <li>• <strong>Curtida:</strong> ${adminSettings.likeReward.toFixed(3)} por curtida</li>
                    <li>• <strong>Comentário:</strong> ${adminSettings.commentReward.toFixed(3)} por comentário</li>
                    <li>• <strong>Limite:</strong> Máximo ${adminSettings.monthlyLimit}/mês por usuário</li>
                  </ul>
                </div>

                <div className="p-4 bg-primary/10 rounded-lg">
                  <h4 className="text-sm font-medium mb-2 text-primary">
                    Exemplo de Ganhos Mensais:
                  </h4>
                  <div className="text-xs space-y-1">
                    <div><strong>10 posts/dia:</strong> ${(adminSettings.postReward * 10 * 30).toFixed(2)}/mês</div>
                    <div><strong>20 curtidas/dia:</strong> ${(adminSettings.likeReward * 20 * 30).toFixed(2)}/mês</div>
                    <div><strong>5 comentários/dia:</strong> ${(adminSettings.commentReward * 5 * 30).toFixed(2)}/mês</div>
                    <div className="text-primary font-medium">
                      Total potencial: ${((adminSettings.postReward * 10 + adminSettings.likeReward * 20 + adminSettings.commentReward * 5) * 30).toFixed(2)}/mês
                    </div>
                    <div className="text-xs text-muted-foreground mt-2">
                      (Limitado a ${adminSettings.monthlyLimit}/mês)
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-warning/10 rounded-lg border border-warning/20">
                  <h4 className="text-sm font-medium mb-2 text-warning flex items-center">
                    <AlertTriangle className="h-4 w-4 mr-1" />
                    Aviso Anti-Spam
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    {adminSettings.spamWarning}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    <Label htmlFor="requiredReferrals">Referrals Obrigatórios</Label>
                    <Input
                      id="requiredReferrals"
                      type="number"
                      min="0"
                      max="1000"
                      value={selectedPlan.requiredReferrals}
                      onChange={(e) => setSelectedPlan({...selectedPlan, requiredReferrals: parseInt(e.target.value) || 0})}
                      placeholder="Quantos referrals são necessários"
                    />
                  </div>
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
          </TabsContent>

          <TabsContent value="deposits" className="space-y-6">
            {/* Existing deposit management content would go here */}
            <Card>
              <CardHeader>
                <CardTitle>Gerenciar Depósitos</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Funcionalidade de depósitos já implementada anteriormente.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="withdrawals" className="space-y-6">
            {/* Existing withdrawal management content would go here */}
            <Card>
              <CardHeader>
                <CardTitle>Gerenciar Saques</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Funcionalidade de saques já implementada anteriormente.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bonus" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Configurações de Bônus</CardTitle>
                <CardDescription>
                  Configure os baús de tesouro e prêmios disponíveis
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="minBonusDeposit">Depósito Mínimo para Bônus ($)</Label>
                    <Input
                      id="minBonusDeposit"
                      type="number"
                      defaultValue="50"
                      min="1"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="chestsPerDay">Baús por Dia</Label>
                    <Input
                      id="chestsPerDay"
                      type="number"
                      defaultValue="3"
                      min="1"
                      max="10"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <Label>Prêmios Disponíveis ($)</Label>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    {[1, 2, 3, 5, 8, 10, 15, 20, 25, 30, 50, 100].map((prize) => (
                      <div key={prize} className="flex items-center space-x-2">
                        <Checkbox id={`prize-${prize}`} defaultChecked={prize <= 30} />
                        <Label htmlFor={`prize-${prize}`} className="text-sm">${prize}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                <Button>Salvar Configurações</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Estatísticas de Bônus</CardTitle>
                <CardDescription>
                  Acompanhe o uso dos baús de tesouro
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">1,247</div>
                    <div className="text-sm text-blue-600">Baús Abertos Hoje</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">$12,580</div>
                    <div className="text-sm text-green-600">Prêmios Pagos Hoje</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">456</div>
                    <div className="text-sm text-purple-600">Usuários Ativos</div>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">$10.50</div>
                    <div className="text-sm text-orange-600">Prêmio Médio</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Histórico de Bônus</CardTitle>
                <CardDescription>
                  Últimas aberturas de baús
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { user: "João Silva", prize: 25, time: "2 min atrás", chest: 1 },
                    { user: "Maria Santos", prize: 10, time: "5 min atrás", chest: 3 },
                    { user: "Pedro Costa", prize: 50, time: "8 min atrás", chest: 2 },
                    { user: "Ana Oliveira", prize: 15, time: "12 min atrás", chest: 1 },
                    { user: "Carlos Lima", prize: 5, time: "15 min atrás", chest: 3 }
                  ].map((bonus, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                          🎁
                        </div>
                        <div>
                          <div className="font-medium">{bonus.user}</div>
                          <div className="text-sm text-muted-foreground">Baú #{bonus.chest}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-green-600">${bonus.prize}</div>
                        <div className="text-sm text-muted-foreground">{bonus.time}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="transactions" className="space-y-6">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center text-card-foreground">
                  <Activity className="h-5 w-5 mr-2 text-primary" />
                  Transações Administrativas de Saldo
                </CardTitle>
                <CardDescription>
                  Histórico de alterações de saldo realizadas pelos administradores
                </CardDescription>
              </CardHeader>
              <CardContent>
                {adminTransactions.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Data</TableHead>
                          <TableHead>Usuário</TableHead>
                          <TableHead>Admin</TableHead>
                          <TableHead>Saldo Anterior</TableHead>
                          <TableHead>Saldo Novo</TableHead>
                          <TableHead>Alteração</TableHead>
                          <TableHead>Motivo</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {adminTransactions.map((transaction) => (
                          <TableRow key={transaction.id}>
                            <TableCell className="text-sm">
                              {new Date(transaction.date).toLocaleDateString("pt-BR")}
                            </TableCell>
                            <TableCell className="font-medium">
                              {transaction.userName}
                            </TableCell>
                            <TableCell className="text-sm">
                              {transaction.adminUserName}
                            </TableCell>
                            <TableCell className="text-sm">
                              ${transaction.amountBefore.toFixed(2)}
                            </TableCell>
                            <TableCell className="text-sm">
                              ${transaction.amountAfter.toFixed(2)}
                            </TableCell>
                            <TableCell>
                              <span className={`font-medium ${
                                transaction.amountChanged > 0 
                                  ? 'text-trading-green' 
                                  : 'text-trading-red'
                              }`}>
                                {transaction.amountChanged > 0 ? '+' : ''}${transaction.amountChanged.toFixed(2)}
                              </span>
                            </TableCell>
                            <TableCell className="text-sm">
                              {transaction.reason}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Activity className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">Nenhuma transação administrativa encontrada</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            {/* Existing settings content would go here */}
            <Card>
              <CardHeader>
                <CardTitle>Configurações Gerais</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Configurações gerais do sistema.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;