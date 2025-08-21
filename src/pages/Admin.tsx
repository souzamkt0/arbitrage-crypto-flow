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
  ArrowDown,
  RefreshCw,
  Crown,
  Key,
  LogOut,
  User
} from "lucide-react";

interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "user" | "partner";
  status: "active" | "inactive";
  balance: number;
  totalProfit: number;
  joinDate: string;
  lastLogin: string;
  apiConnected: boolean;
  display_name?: string; // Adicionar display_name opcional
}

interface InvestmentPlan {
  id: string;
  name: string;
  dailyRate: number;
  minimumAmount: number;
  maxInvestmentAmount?: number;
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
  source?: string;
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
  
  // Estados para Trading
  const [selectedUserEmail, setSelectedUserEmail] = useState("");
  const [tradingAction, setTradingAction] = useState("reset");
  const [deleteInvestmentEmail, setDeleteInvestmentEmail] = useState("");
  const [deleteInvestmentReason, setDeleteInvestmentReason] = useState("");
  const [isDeleteInvestmentModalOpen, setIsDeleteInvestmentModalOpen] = useState(false);
  const [activeInvestments, setActiveInvestments] = useState<any[]>([]);
  const [isLoadingInvestments, setIsLoadingInvestments] = useState(false);
  const [selectedInvestmentForDeletion, setSelectedInvestmentForDeletion] = useState<any>(null);
  const [isIndividualDeleteModalOpen, setIsIndividualDeleteModalOpen] = useState(false);
  
  // Estados para sistema de sócios
  const [partners, setPartners] = useState<any[]>([]);
  const [selectedPartner, setSelectedPartner] = useState<any>(null);
  const [isPartnerModalOpen, setIsPartnerModalOpen] = useState(false);
  const [isNewPartner, setIsNewPartner] = useState(false);
  const [partnerCommission, setPartnerCommission] = useState(1.0);
  const [totalDeposits, setTotalDeposits] = useState(0);
  const [partnerEarnings, setPartnerEarnings] = useState(0);
  
  // Estados para lista de usuários
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [isUserSelectionModalOpen, setIsUserSelectionModalOpen] = useState(false);
  
  // Estados para seleção de sócio com comissão
  const [selectedUserForPartner, setSelectedUserForPartner] = useState<any>(null);
  const [customCommission, setCustomCommission] = useState(1.0);
  const [isPartnerSelectionModalOpen, setIsPartnerSelectionModalOpen] = useState(false);
  const [deletingUser, setDeletingUser] = useState<string | null>(null);
  
  // Estados para alteração de senha e acesso à conta
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [selectedUserForPassword, setSelectedUserForPassword] = useState<any>(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showAccessAccountModal, setShowAccessAccountModal] = useState(false);
  const [selectedUserForAccess, setSelectedUserForAccess] = useState<any>(null);
  
  // Estados para exclusão de usuário
  const [showDeleteUserModal, setShowDeleteUserModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState<any>(null);

  const { toast } = useToast();
  
  // Função para alterar senha do usuário
  const handleChangePassword = async () => {
    if (!selectedUserForPassword) return;
    
    if (newPassword !== confirmPassword) {
      toast({
        title: "Erro",
        description: "As senhas não coincidem",
        variant: "destructive",
      });
      return;
    }
    
    if (newPassword.length < 6) {
      toast({
        title: "Erro",
        description: "A nova senha deve ter pelo menos 6 caracteres",
        variant: "destructive",
      });
      return;
    }
    
    setIsChangingPassword(true);
    
    try {
      // Como admin, precisamos usar a API de admin do Supabase
      // Por enquanto, vamos mostrar uma mensagem informativa
      toast({
        title: "Aviso",
        description: "Para alterar senha de usuário, use o painel de administração do Supabase",
        variant: "default",
      });
      
      setShowChangePasswordModal(false);
      setNewPassword("");
      setConfirmPassword("");
      setSelectedUserForPassword(null);
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao alterar senha",
        variant: "destructive",
      });
    } finally {
      setIsChangingPassword(false);
    }
  };
  
  // Função para acessar conta do usuário
  const handleAccessAccount = (user: any) => {
    setSelectedUserForAccess(user);
    setShowAccessAccountModal(true);
  };
  
  // Função para confirmar acesso à conta
  const confirmAccessAccount = async () => {
    if (!selectedUserForAccess) return;
    
    try {
      // Salvar informações do admin atual para poder voltar
      const adminInfo = {
        id: user?.id,
        email: user?.email,
        role: 'admin',
        timestamp: new Date().toISOString()
      };
      
      localStorage.setItem('admin_session_backup', JSON.stringify(adminInfo));
      
      // Salvar informações do usuário que será acessado
      const userToAccess = {
        id: selectedUserForAccess.id,
        name: selectedUserForAccess.name,
        email: selectedUserForAccess.email,
        role: selectedUserForAccess.role,
        status: selectedUserForAccess.status,
        balance: selectedUserForAccess.balance,
        totalProfit: selectedUserForAccess.totalProfit
      };
      
      localStorage.setItem('impersonated_user', JSON.stringify(userToAccess));
      
      // Ativar modo de impersonação
      localStorage.setItem('admin_impersonation_mode', 'true');
      
      toast({
        title: "Acesso Concedido",
        description: `Acessando conta de ${selectedUserForAccess.name}. Use o botão "Voltar ao Admin" para retornar.`,
        variant: "default",
      });
      
      // Redirecionar para o dashboard como o usuário
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 1000);
      
    } catch (error: any) {
      console.error('Erro ao acessar conta:', error);
      
      toast({
        title: "Erro",
        description: "Não foi possível acessar a conta. Tente novamente.",
        variant: "destructive",
      });
    }
    
    setShowAccessAccountModal(false);
    setSelectedUserForAccess(null);
  };

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
            userName: 'User',
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

  const handleDeleteUser = async (userId: string) => {
    // Verificar se não está tentando excluir o próprio admin
    if (userId === user?.id) {
    toast({
        title: "Erro",
        description: "Você não pode excluir sua própria conta de administrador.",
        variant: "destructive",
      });
      return;
    }

    // Verificar se é o admin principal (souzamkt0@gmail.com)
    const userToDelete = users.find(u => u.id === userId);
    if (userToDelete?.email === 'souzamkt0@gmail.com') {
      toast({
        title: "Erro",
        description: "Não é possível excluir a conta de administrador principal.",
        variant: "destructive",
      });
      return;
    }

    // Abrir modal de confirmação
    setUserToDelete(userToDelete);
    setShowDeleteUserModal(true);
  };

  const confirmDeleteUser = async () => {
    if (!userToDelete) return;

    setDeletingUser(userToDelete.id);
    setShowDeleteUserModal(false);

    try {
      // Primeiro, excluir o perfil do usuário
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('user_id', userToDelete.id);

      if (profileError) {
        console.error('Erro ao excluir perfil:', profileError);
        toast({
          title: "Erro",
          description: "Erro ao excluir perfil do usuário.",
          variant: "destructive",
        });
        return;
      }

      // Tentar excluir o usuário da autenticação (pode não funcionar dependendo das permissões)
      try {
        const { error: authError } = await supabase.auth.admin.deleteUser(userToDelete.id);
        if (authError) {
          console.warn('Aviso: Não foi possível excluir usuário da autenticação:', authError);
          // Continuar mesmo se falhar na autenticação
        }
      } catch (authError) {
        console.warn('Aviso: Erro ao excluir usuário da autenticação:', authError);
        // Continuar mesmo se falhar na autenticação
      }

      // Excluir dados relacionados (investimentos, transações, etc.)
      const tablesToDelete = [
        'user_investments',
        'deposits', 
        'withdrawals',
        'admin_balance_transactions',
        'community_posts'
      ];

      for (const table of tablesToDelete) {
        try {
          const { error: deleteError } = await supabase
            .from(table)
            .delete()
            .eq('user_id', userToDelete.id);

          if (deleteError) {
            console.warn(`Aviso: Erro ao excluir dados da tabela ${table}:`, deleteError);
          }
        } catch (error) {
          console.warn(`Aviso: Erro ao excluir dados da tabela ${table}:`, error);
        }
      }

      // Atualizar estado local
      setUsers(prevUsers => prevUsers.filter(user => user.id !== userToDelete.id));
      
      toast({
        title: "Usuário excluído",
        description: "Usuário foi excluído do sistema com sucesso.",
        variant: "default",
      });

    } catch (error) {
      console.error('Erro ao excluir usuário:', error);
      toast({
        title: "Erro",
        description: "Erro ao excluir usuário do sistema.",
        variant: "destructive",
      });
    } finally {
      setDeletingUser(null);
    }
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
      maxInvestmentAmount: 1000,
      duration: 40,
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
              duration_days: selectedPlan.duration,
              description: selectedPlan.description,
              status: selectedPlan.status
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
              duration_days: selectedPlan.duration,
              description: selectedPlan.description,
              status: selectedPlan.status
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

  const handleWithdrawalAction = async (withdrawalId: string, action: "approve" | "reject") => {
    try {
      const withdrawal = withdrawals.find(w => w.id === withdrawalId);
      if (!withdrawal) {
        toast({
          title: "Erro",
          description: "Saque não encontrado.",
          variant: "destructive"
        });
        return;
      }

      const newStatus = action === "approve" ? "processing" : "rejected";
      
      // Atualizar no banco de dados
      const { error } = await supabase
        .from('withdrawals')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString(),
          ...(action === "reject" && { completed_date: new Date().toISOString() })
        })
        .eq('id', withdrawalId);

      if (error) {
        console.error('Erro ao atualizar saque:', error);
        toast({
          title: "Erro",
          description: "Erro ao atualizar status do saque.",
          variant: "destructive"
        });
        return;
      }

      // Se aprovado, processar pagamento via DigitoPay
      if (action === "approve" && withdrawal.type === "pix") {
        try {
          // Chamar a Edge Function REAL para processar o pagamento
          const { data: paymentResult, error: paymentError } = await supabase.functions.invoke('digitopay-real-withdrawal', {
            body: {
              withdrawalId: withdrawalId,
              amount: withdrawal.amountBRL,
              pixKey: withdrawal.pixKey,
              pixKeyType: withdrawal.pixKeyType,
              holderName: withdrawal.holderName,
              cpf: withdrawal.cpf
            }
          });

          if (paymentError) {
            console.error('Erro ao processar pagamento:', paymentError);
            // Reverter status para pending em caso de erro
            await supabase
              .from('withdrawals')
              .update({ status: 'pending' })
              .eq('id', withdrawalId);
            
            toast({
              title: "Erro no pagamento",
              description: "Erro ao processar pagamento via DigitoPay. Status revertido para pendente.",
              variant: "destructive"
            });
            return;
          }

          toast({
            title: "Saque aprovado e processado",
            description: "Pagamento enviado via DigitoPay. Aguarde confirmação.",
          });
        } catch (paymentError) {
          console.error('Erro ao processar pagamento:', paymentError);
          // Reverter status para pending em caso de erro
          await supabase
            .from('withdrawals')
            .update({ status: 'pending' })
            .eq('id', withdrawalId);
          
          toast({
            title: "Erro no pagamento",
            description: "Erro ao processar pagamento. Status revertido para pendente.",
            variant: "destructive"
          });
          return;
        }
      }

      // Atualizar estado local
      setWithdrawals(prev =>
        prev.map(w =>
          w.id === withdrawalId
            ? { ...w, status: newStatus }
            : w
        )
      );
      
      if (action === "reject") {
        toast({
          title: "Saque rejeitado",
          description: "Saque foi rejeitado com sucesso.",
        });
      }
    } catch (error) {
      console.error('Erro ao processar ação do saque:', error);
      toast({
        title: "Erro",
        description: "Erro interno ao processar ação.",
        variant: "destructive"
      });
    }
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
        `R$ ${(d.amountBRL || 0).toLocaleString()}`,
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

  // Funções de Trading
  const handleTradingAction = async () => {
    if (!selectedUserEmail.trim()) {
      toast({
        title: "Erro",
        description: "Digite o email do usuário.",
        variant: "destructive"
      });
      return;
    }

    try {
      if (tradingAction === "reset") {
        // Resetar cooldown para usuário específico
        const keys = Object.keys(localStorage);
        const userKeys = keys.filter(key => key.startsWith('lastClaim_'));
        
        userKeys.forEach(key => {
          localStorage.removeItem(key);
        });

        toast({
          title: "Cooldown Resetado",
          description: `Cooldown de trading resetado para ${selectedUserEmail}`,
        });
      } else if (tradingAction === "unlock") {
        // Liberar trading - limpar todas as restrições
        const keys = Object.keys(localStorage);
        const tradingKeys = keys.filter(key => 
          key.startsWith('lastClaim_') || key.startsWith('tradingBlock_')
        );
        
        tradingKeys.forEach(key => {
          localStorage.removeItem(key);
        });

        toast({
          title: "Trading Liberado",
          description: `Trading liberado para ${selectedUserEmail}`,
        });
      } else if (tradingAction === "block") {
        // Bloquear trading - adicionar bloqueio
        localStorage.setItem(`tradingBlock_${selectedUserEmail}`, Date.now().toString());

        toast({
          title: "Trading Bloqueado",
          description: `Trading bloqueado para ${selectedUserEmail}`,
        });
      }

      setSelectedUserEmail("");
    } catch (error) {
      console.error('Erro na ação de trading:', error);
      toast({
        title: "Erro",
        description: "Erro ao executar ação de trading.",
        variant: "destructive"
      });
    }
  };

  const handleResetAllCooldowns = () => {
    try {
      const keys = Object.keys(localStorage);
      const cooldownKeys = keys.filter(key => key.startsWith('lastClaim_'));
      
      cooldownKeys.forEach(key => {
        localStorage.removeItem(key);
      });

      toast({
        title: "Cooldowns Resetados",
        description: `${cooldownKeys.length} cooldowns foram resetados globalmente.`,
      });
    } catch (error) {
      console.error('Erro ao resetar cooldowns:', error);
      toast({
        title: "Erro",
        description: "Erro ao resetar cooldowns.",
        variant: "destructive"
      });
    }
  };

  const handleUnlockAllTrading = () => {
    try {
      const keys = Object.keys(localStorage);
      const tradingKeys = keys.filter(key => 
        key.startsWith('lastClaim_') || key.startsWith('tradingBlock_')
      );
      
      tradingKeys.forEach(key => {
        localStorage.removeItem(key);
      });

      toast({
        title: "Trading Liberado Globalmente",
        description: `Trading liberado para todos os usuários. ${tradingKeys.length} restrições removidas.`,
      });
    } catch (error) {
      console.error('Erro ao liberar trading:', error);
      toast({
        title: "Erro",
        description: "Erro ao liberar trading globalmente.",
        variant: "destructive"
      });
    }
  };

  const handleResetUserCooldown = (userEmail: string) => {
    try {
      const keys = Object.keys(localStorage);
      const userKeys = keys.filter(key => 
        key.startsWith('lastClaim_') && key.includes(userEmail)
      );
      
      userKeys.forEach(key => {
        localStorage.removeItem(key);
      });

      toast({
        title: "Cooldown Resetado",
        description: `Cooldown resetado para ${userEmail}`,
      });
    } catch (error) {
      console.error('Erro ao resetar cooldown do usuário:', error);
      toast({
        title: "Erro",
        description: "Erro ao resetar cooldown do usuário.",
        variant: "destructive"
      });
    }
  };

  // Função para excluir investimentos por email
  const handleDeleteInvestmentByEmail = async () => {
    console.log('🔍 Iniciando exclusão de investimentos...');
    console.log('📧 Email:', deleteInvestmentEmail);
    console.log('📝 Motivo:', deleteInvestmentReason);
    
    if (!deleteInvestmentEmail.trim()) {
      console.log('❌ Email vazio');
      toast({
        title: "Erro",
        description: "Digite o email do usuário.",
        variant: "destructive"
      });
      return;
    }

    if (!deleteInvestmentReason.trim()) {
      console.log('❌ Motivo vazio');
      toast({
        title: "Erro",
        description: "Digite o motivo da exclusão.",
        variant: "destructive"
      });
      return;
    }

    try {
      console.log('🔍 Buscando usuário no banco...');
      // Primeiro, buscar o usuário pelo email
      const { data: userProfile, error: userError } = await supabase
        .from('profiles')
        .select('user_id, email, display_name')
        .eq('email', deleteInvestmentEmail.trim())
        .single();

      console.log('👤 Resultado da busca:', { userProfile, userError });

      if (userError || !userProfile) {
        console.log('❌ Usuário não encontrado:', userError);
        toast({
          title: "Usuário não encontrado",
          description: "Email não encontrado no sistema.",
          variant: "destructive"
        });
        return;
      }

      console.log('✅ Usuário encontrado:', userProfile);

      // Buscar todos os investimentos do usuário
      console.log('🔍 Buscando investimentos do usuário...');
      const { data: investments, error: investmentsError } = await supabase
        .from('user_investments')
        .select('*')
        .eq('user_id', userProfile.user_id);

      console.log('💰 Investimentos encontrados:', { investments, investmentsError });

      if (investmentsError) {
        console.error('❌ Erro ao buscar investimentos:', investmentsError);
        toast({
          title: "Erro",
          description: "Erro ao buscar investimentos do usuário.",
          variant: "destructive"
        });
        return;
      }

      if (!investments || investments.length === 0) {
        console.log('❌ Nenhum investimento encontrado');
        toast({
          title: "Nenhum investimento encontrado",
          description: "Este usuário não possui investimentos ativos.",
          variant: "destructive"
        });
        return;
      }

      console.log(`🗑️ Excluindo ${investments.length} investimentos...`);
      
      // Tentar excluir usando uma abordagem diferente
      let deleteError = null;
      
      // Método 1: Exclusão direta
      const { error: directDeleteError } = await supabase
        .from('user_investments')
        .delete()
        .eq('user_id', userProfile.user_id);

      if (directDeleteError) {
        console.log('❌ Erro na exclusão direta:', directDeleteError);
        
        // Método 2: Exclusão por IDs individuais
        console.log('🔄 Tentando exclusão por IDs individuais...');
        const investmentIds = investments.map(inv => inv.id);
        
        for (const id of investmentIds) {
          const { error: singleDeleteError } = await supabase
            .from('user_investments')
            .delete()
            .eq('id', id);
          
          if (singleDeleteError) {
            console.log(`❌ Erro ao excluir investimento ${id}:`, singleDeleteError);
            deleteError = singleDeleteError;
            break;
          }
        }
      }

      console.log('🗑️ Resultado da exclusão:', { deleteError });

      if (deleteError) {
        console.error('❌ Erro ao excluir investimentos:', deleteError);
        toast({
          title: "Erro",
          description: `Erro ao excluir investimentos: ${deleteError.message}`,
          variant: "destructive"
        });
        return;
      }

      console.log('✅ Investimentos excluídos com sucesso!');

      // Registrar a ação administrativa
      if (user) {
        console.log('📝 Registrando ação administrativa...');
        const { error: transactionError } = await supabase
          .from('admin_balance_transactions')
          .insert([{
            user_id: userProfile.user_id,
            admin_user_id: user.id,
            amount_before: 0,
            amount_after: 0,
            amount_changed: 0,
            transaction_type: 'investment_deletion',
            reason: `Exclusão de investimentos: ${deleteInvestmentReason}. ${investments.length} investimentos removidos.`
          }]);

        if (transactionError) {
          console.error('❌ Erro ao registrar transação administrativa:', transactionError);
          // Não bloquear a operação se falhar o registro
        } else {
          console.log('✅ Ação administrativa registrada');
        }
      }

      toast({
        title: "Investimentos Excluídos",
        description: `${investments.length} investimentos de ${userProfile.display_name || userProfile.email} foram excluídos com sucesso.`,
      });

      // Limpar campos
      setDeleteInvestmentEmail("");
      setDeleteInvestmentReason("");
      setIsDeleteInvestmentModalOpen(false);

    } catch (error) {
      console.error('❌ Erro geral ao excluir investimentos:', error);
      toast({
        title: "Erro",
        description: "Erro interno ao excluir investimentos.",
        variant: "destructive"
      });
    }
  };

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

  // Carregar dados dos sócios quando necessário
  useEffect(() => {
    loadPartners();
    calculatePartnerEarnings();
    loadAllUsers();
  }, []);

  // Carregar investimentos ativos quando a aba de Trading for aberta
  useEffect(() => {
    // Verificar se estamos na aba de Trading antes de carregar
    const checkAndLoadInvestments = async () => {
      console.log('🔄 Verificando se deve carregar investimentos...');
      loadActiveInvestments();
    };
    
    checkAndLoadInvestments();
  }, []);

  // Funções para sistema de sócios
  const loadPartners = async () => {
    try {
      console.log('👥 Carregando sócios da tabela partners...');
      
      // Buscar sócios da tabela partners
      const { data: partnerUsers, error } = await supabase
        .from('partners')
        .select('id, user_id, email, display_name, commission_percentage, total_earnings, total_deposits, status, created_at')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      console.log('📊 Query de sócios executada:', { partnerUsers, error });

      if (error) {
        console.error('❌ Erro ao carregar sócios:', error);
        console.error('❌ Detalhes do erro:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        
        // Fallback para a tabela profiles se a tabela partners não existir
        console.log('🔄 Tentando fallback para tabela profiles...');
        const { data: fallbackPartners, error: fallbackError } = await supabase
          .from('profiles')
          .select('user_id, email, display_name, username, role, created_at, balance')
          .eq('role', 'partner')
          .order('created_at', { ascending: false });

        if (fallbackError) {
          toast({
            title: "Erro",
            description: "Erro ao carregar sócios.",
            variant: "destructive"
          });
          return;
        }

        console.log('✅ Sócios carregados (fallback):', fallbackPartners);
        setPartners(fallbackPartners || []);
        return;
      }

      console.log('✅ Sócios carregados:', partnerUsers);
      console.log('📊 Quantidade de sócios:', partnerUsers?.length || 0);
      
      // Verificar se Admin Souza está na lista
      if (partnerUsers) {
        const adminSouza = partnerUsers.find(p => p.email === 'souzamkt0@gmail.com');
        console.log('🔍 Admin Souza na lista de sócios:', adminSouza);
      }
      
      setPartners(partnerUsers || []);
      
    } catch (error) {
      console.error('❌ Erro ao carregar sócios:', error);
      console.error('❌ Tipo do erro:', typeof error);
      console.error('❌ Mensagem do erro:', error?.message);
      toast({
        title: "Erro",
        description: "Erro interno ao carregar sócios.",
        variant: "destructive"
      });
    }
  };

  const calculatePartnerEarnings = async () => {
    try {
      // Calcular total de depósitos aprovados
      const { data: depositsData, error: depositsError } = await supabase
        .from('deposits')
        .select('amount_usd')
        .eq('status', 'paid');

      if (depositsError) {
        console.error('❌ Erro ao calcular depósitos:', depositsError);
        return;
      }

      const totalDepositsAmount = depositsData?.reduce((sum, deposit) => sum + (deposit.amount_usd || 0), 0) || 0;
      setTotalDeposits(totalDepositsAmount);

      // Calcular ganhos dos sócios (1% do total de depósitos)
      const totalEarnings = totalDepositsAmount * (partnerCommission / 100);
      setPartnerEarnings(totalEarnings);

      console.log('💰 Cálculos de sócios:', {
        totalDeposits: totalDepositsAmount,
        commission: partnerCommission,
        totalEarnings
      });

    } catch (error) {
      console.error('❌ Erro ao calcular ganhos:', error);
    }
  };

  const addPartner = async () => {
    console.log('🔍 Iniciando adição de sócio...');
    console.log('📧 Email do sócio:', selectedPartner?.email);
    console.log('💰 Comissão:', selectedPartner?.commission || partnerCommission);
    
    if (!selectedPartner?.email) {
      console.log('❌ Email não fornecido');
      toast({
        title: "Erro",
        description: "Digite o email do sócio.",
        variant: "destructive"
      });
      return;
    }

    // Buscar usuário pelo email
    console.log('🔍 Buscando usuário...');
    const { data: user, error: userError } = await supabase
      .from('profiles')
      .select('user_id, email, role, display_name')
      .eq('email', selectedPartner.email)
      .single();

    if (userError) {
      console.log('❌ Erro ao buscar usuário:', userError);
      toast({
        title: "Erro ao buscar usuário",
        description: `Erro: ${userError.message}`,
        variant: "destructive"
      });
      return;
    }

    if (!user) {
      console.log('❌ Usuário não encontrado');
      toast({
        title: "Usuário não encontrado",
        description: "Email não encontrado no sistema.",
        variant: "destructive"
      });
      return;
    }

    console.log('✅ Usuário encontrado:', user);

    // Verificar se o usuário já é sócio
    if (user.role === 'partner') {
      console.log('⚠️ Usuário já é sócio');
      toast({
        title: "Usuário já é sócio",
        description: `${user.display_name || user.email} já possui status de sócio.`,
        variant: "default"
      });
      return;
    }

    // Tentar atualizar role para partner
    console.log('🔄 Tentando atualizar role para partner...');
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ role: 'partner' })
      .eq('user_id', user.user_id);

    if (updateError) {
      console.log('❌ Erro no update:', updateError);
      toast({
        title: "Erro ao atualizar usuário",
        description: `Erro: ${updateError.message}`,
        variant: "destructive"
      });
      return;
    }

    console.log('✅ Sócio adicionado com sucesso!');
    toast({
      title: "Sócio Adicionado",
      description: `${user.display_name || user.email} foi adicionado como sócio com ${selectedPartner.commission || partnerCommission}% de comissão.`,
    });

    setIsPartnerModalOpen(false);
    setSelectedPartner(null);
    loadPartners();
  };

  // Função para adicionar sócio selecionando da lista
  const addPartnerFromList = async (userId: string, userEmail: string, userName: string) => {
    try {
      console.log('🔍 Adicionando sócio da lista:', { userId, userEmail, userName });
      
      // Verificar se o usuário já é sócio
      const user = allUsers.find(u => u.user_id === userId);
      if (user?.role === 'partner') {
        toast({
          title: "Usuário já é sócio",
          description: `${userName || userEmail} já possui status de sócio.`,
          variant: "default"
        });
        return;
      }

      // Tentar atualizar role para partner
      console.log('🔄 Atualizando role para partner...');
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ role: 'partner' })
        .eq('user_id', userId);

      if (updateError) {
        console.log('❌ Erro no update:', updateError);
        toast({
          title: "Erro ao adicionar sócio",
          description: `Erro: ${updateError.message}`,
          variant: "destructive"
        });
        return;
      }

      console.log('✅ Sócio adicionado com sucesso!');
      toast({
        title: "Sócio Adicionado",
        description: `${userName || userEmail} foi adicionado como sócio com ${partnerCommission}% de comissão.`,
      });

      // Recarregar listas
      loadPartners();
      loadAllUsers();
      
    } catch (error) {
      console.error('❌ Erro ao adicionar sócio da lista:', error);
      toast({
        title: "Erro",
        description: "Erro interno ao adicionar sócio.",
        variant: "destructive"
      });
    }
  };

  // Função para abrir modal de seleção de sócio com comissão
  const openPartnerSelectionModal = (user: any) => {
    console.log('🔄 Abrindo modal de seleção de sócio para:', user);
    setSelectedUserForPartner(user);
    setCustomCommission(partnerCommission); // Usar comissão padrão como inicial
    setIsPartnerSelectionModalOpen(true);
    console.log('✅ Modal deve estar aberto agora');
  };

  // Função para adicionar sócio com comissão personalizada
  const addPartnerWithCustomCommission = async () => {
    if (!selectedUserForPartner) {
      toast({
        title: "Erro",
        description: "Nenhum usuário selecionado.",
        variant: "destructive"
      });
      return;
    }

    try {
      console.log('🔍 Adicionando sócio com comissão personalizada:', {
        user: selectedUserForPartner,
        commission: customCommission
      });

      // Verificar se o usuário já é sócio
      if (selectedUserForPartner.role === 'partner') {
        toast({
          title: "Usuário já é sócio",
          description: `${selectedUserForPartner.display_name || selectedUserForPartner.email} já possui status de sócio.`,
          variant: "default"
        });
        return;
      }

      // Aviso especial para admins
      if (selectedUserForPartner.role === 'admin') {
        console.log('⚠️ Transformando admin em sócio:', selectedUserForPartner);
      }

      // Preparar dados para atualização
      const updateData: any = { role: 'partner' };
      
      // Tentar adicionar comissão personalizada se a coluna existir
      try {
        updateData.partner_commission = customCommission;
      } catch (e) {
        console.log('⚠️ Coluna partner_commission não disponível');
      }

      console.log('📊 Dados para atualização:', updateData);
      console.log('🆔 User ID:', selectedUserForPartner.user_id);

      // Atualizar usuário para sócio
      console.log('🔄 Atualizando para sócio com comissão:', customCommission);
      const { data: updateResult, error: updateError } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('user_id', selectedUserForPartner.user_id)
        .select();

      console.log('📊 Resultado do update:', { updateResult, updateError });

      if (updateError) {
        console.log('❌ Erro no update:', updateError);
        console.log('❌ Detalhes do erro:', {
          message: updateError.message,
          details: updateError.details,
          hint: updateError.hint,
          code: updateError.code
        });
        
        toast({
          title: "Erro ao adicionar sócio",
          description: `Erro: ${updateError.message}`,
          variant: "destructive"
        });
        return;
      }

      console.log('✅ Sócio adicionado com sucesso!');
      console.log('✅ Resultado:', updateResult);
      
      toast({
        title: "Sócio Adicionado",
        description: `${selectedUserForPartner.display_name || selectedUserForPartner.email} foi adicionado como sócio com ${customCommission}% de comissão.`,
      });

      // Fechar modal e recarregar listas
      setIsPartnerSelectionModalOpen(false);
      setSelectedUserForPartner(null);
      
      // Forçar recarregamento das listas
      console.log('🔄 Recarregando listas...');
      await loadPartners();
      await loadAllUsers();
      
      // Verificar se o sócio foi adicionado
      setTimeout(async () => {
        console.log('🔍 Verificando se sócio foi adicionado...');
        const { data: checkPartners, error: checkError } = await supabase
          .from('profiles')
          .select('user_id, email, role')
          .eq('user_id', selectedUserForPartner.user_id);
        
        console.log('📊 Verificação pós-adicionar:', { checkPartners, checkError });
      }, 1000);
      
    } catch (error) {
      console.error('❌ Erro ao adicionar sócio com comissão:', error);
      console.error('❌ Tipo do erro:', typeof error);
      console.error('❌ Mensagem do erro:', error?.message);
      console.error('❌ Stack trace:', error?.stack);
      
      toast({
        title: "Erro",
        description: "Erro interno ao adicionar sócio.",
        variant: "destructive"
      });
    }
  };

  const removePartner = async (partnerId: string, partnerName: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: 'user' })
        .eq('user_id', partnerId);

      if (error) {
        console.error('❌ Erro ao remover sócio:', error);
        toast({
          title: "Erro",
          description: "Erro ao remover sócio.",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Sócio Removido",
        description: `${partnerName} foi removido como sócio.`,
      });

      loadPartners();
      
    } catch (error) {
      console.error('❌ Erro ao remover sócio:', error);
      toast({
        title: "Erro",
        description: "Erro interno ao remover sócio.",
        variant: "destructive"
      });
    }
  };



  // Função de teste para verificar acesso à tabela
  const testTableAccess = async () => {
    try {
      console.log('🧪 Testando acesso à tabela user_investments...');
      
      // Teste 1: Contar registros
      const { count, error: countError } = await supabase
        .from('user_investments')
        .select('*', { count: 'exact', head: true });
      
      console.log('📊 Total de investimentos:', { count, countError });
      
      // Teste 2: Buscar um registro específico
      const { data: testData, error: testError } = await supabase
        .from('user_investments')
        .select('*')
        .limit(1);
      
      console.log('🔍 Teste de busca:', { testData, testError });
      
      // Teste 3: Verificar estrutura da tabela
      const { data: structure, error: structureError } = await supabase
        .rpc('get_table_structure', { table_name: 'user_investments' });
      
      console.log('🏗️ Estrutura da tabela:', { structure, structureError });
      
    } catch (error) {
      console.error('❌ Erro no teste de acesso:', error);
    }
  };

  // Função de teste para exclusão direta
  const testDirectDeletion = async () => {
    try {
      console.log('🧪 Testando exclusão direta...');
      
      if (!deleteInvestmentEmail.trim()) {
        console.log('❌ Email vazio para teste');
        return;
      }

      // Buscar usuário primeiro
      const { data: userProfile, error: userError } = await supabase
        .from('profiles')
        .select('user_id, email')
        .eq('email', deleteInvestmentEmail.trim())
        .single();

      if (userError || !userProfile) {
        console.log('❌ Usuário não encontrado para teste:', userError);
        return;
      }

      console.log('✅ Usuário encontrado para teste:', userProfile);

      // Tentar excluir diretamente
      const { error: deleteError } = await supabase
        .from('user_investments')
        .delete()
        .eq('user_id', userProfile.user_id);

      console.log('🗑️ Resultado da exclusão direta:', { deleteError });

      if (deleteError) {
        console.error('❌ Erro na exclusão direta:', deleteError);
        toast({
          title: "Erro no Teste",
          description: `Erro: ${deleteError.message}`,
          variant: "destructive"
        });
      } else {
        console.log('✅ Exclusão direta bem-sucedida!');
        toast({
          title: "Teste Bem-sucedido",
          description: "Exclusão direta funcionou!",
        });
      }
      
    } catch (error) {
      console.error('❌ Erro no teste de exclusão direta:', error);
    }
  };

  // Função de teste simples para verificar se a tabela existe
  const simpleTest = async () => {
    try {
      console.log('🧪 Teste simples - verificando acesso à tabela...');
      
      // Teste 1: Verificar se a tabela existe
      const { data: tableExists, error: tableError } = await supabase
        .from('user_investments')
        .select('id')
        .limit(1);
      
      console.log('🔍 Tabela existe:', { tableExists, tableError });
      
      if (tableError) {
        console.error('❌ Tabela não existe ou erro de acesso:', tableError);
        toast({
          title: "Erro",
          description: `Tabela não acessível: ${tableError.message}`,
          variant: "destructive"
        });
        return;
      }
      
      // Teste 2: Contar registros
      const { count, error: countError } = await supabase
        .from('user_investments')
        .select('*', { count: 'exact', head: true });
      
      console.log('📊 Total de investimentos:', { count, countError });
      
      if (countError) {
        console.error('❌ Erro ao contar investimentos:', countError);
        toast({
          title: "Erro no Teste",
          description: `Erro ao acessar tabela: ${countError.message}`,
          variant: "destructive"
        });
        return;
      }
      
      // Teste 2: Buscar um registro
      const { data: sample, error: sampleError } = await supabase
        .from('user_investments')
        .select('id, user_id, amount')
        .limit(1);
      
      console.log('🔍 Amostra de investimento:', { sample, sampleError });
      
      if (sampleError) {
        console.error('❌ Erro ao buscar amostra:', sampleError);
        toast({
          title: "Erro no Teste",
          description: `Erro ao buscar dados: ${sampleError.message}`,
          variant: "destructive"
        });
        return;
      }
      
      if (sample && sample.length > 0) {
        console.log('✅ Tabela acessível, tentando exclusão de teste...');
        
        // Teste 3: Tentar excluir o primeiro registro
        const { error: deleteError } = await supabase
          .from('user_investments')
          .delete()
          .eq('id', sample[0].id);
        
        console.log('🗑️ Resultado da exclusão de teste:', { deleteError });
        
        if (deleteError) {
          console.error('❌ Erro na exclusão de teste:', deleteError);
          toast({
            title: "Erro no Teste",
            description: `Erro na exclusão: ${deleteError.message}`,
            variant: "destructive"
          });
        } else {
          console.log('✅ Exclusão de teste bem-sucedida!');
          toast({
            title: "Teste Bem-sucedido",
            description: "Exclusão funcionou! Tabela acessível.",
          });
        }
      } else {
        console.log('ℹ️ Nenhum investimento encontrado para teste');
        toast({
          title: "Teste Concluído",
          description: "Tabela acessível, mas sem dados para testar exclusão.",
        });
      }
      
    } catch (error) {
      console.error('❌ Erro no teste simples:', error);
      toast({
        title: "Erro no Teste",
        description: `Erro geral: ${error.message}`,
        variant: "destructive"
      });
    }
  };

  // Função para verificar RLS e estrutura da tabela
  const checkTableStructure = async () => {
    try {
      console.log('🔍 Verificando estrutura da tabela user_investments...');
      
      // Verificar se RLS está habilitado
      const { data: rlsInfo, error: rlsError } = await supabase
        .rpc('check_rls_status', { table_name: 'user_investments' });
      
      console.log('🔒 Status RLS:', { rlsInfo, rlsError });
      
      // Verificar estrutura da tabela
      const { data: columns, error: columnsError } = await supabase
        .rpc('get_table_columns', { table_name: 'user_investments' });
      
      console.log('🏗️ Colunas da tabela:', { columns, columnsError });
      
      // Verificar políticas
      const { data: policies, error: policiesError } = await supabase
        .rpc('get_table_policies', { table_name: 'user_investments' });
      
      console.log('📋 Políticas da tabela:', { policies, policiesError });
      
    } catch (error) {
      console.error('❌ Erro ao verificar estrutura:', error);
    }
  };

  // Função para testar estrutura da tabela profiles
  const testProfilesStructure = async () => {
    try {
      console.log('🔍 Testando estrutura da tabela profiles...');
      
      // Verificar se as colunas de sócio existem
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('user_id, email, role, partner_commission, partner_earnings, partner_total_deposits')
        .limit(1);
      
      if (error) {
        console.log('❌ Erro ao acessar profiles:', error);
        toast({
          title: "Erro",
          description: "Erro ao verificar estrutura da tabela profiles.",
          variant: "destructive"
        });
        return;
      }
      
      console.log('✅ Estrutura da tabela profiles:', profiles);
      
      // Verificar se a tabela partner_commissions existe
      const { data: commissions, error: commissionsError } = await supabase
        .from('partner_commissions')
        .select('*')
        .limit(1);
      
      if (commissionsError) {
        console.log('⚠️ Tabela partner_commissions não existe ou não acessível:', commissionsError);
        toast({
          title: "Aviso",
          description: "Tabela de comissões de sócios não encontrada. Execute a migração.",
          variant: "default"
        });
      } else {
        console.log('✅ Tabela partner_commissions existe');
      }
      
    } catch (error) {
      console.error('❌ Erro ao testar estrutura:', error);
    }
  };

  // Função para testar update na tabela profiles
  const testProfilesUpdate = async () => {
    try {
      console.log('🧪 Testando update na tabela profiles...');
      
      // Buscar um usuário para testar
      const { data: testUser, error: userError } = await supabase
        .from('profiles')
        .select('user_id, email, role')
        .limit(1)
        .single();
      
      if (userError || !testUser) {
        console.log('❌ Erro ao buscar usuário para teste:', userError);
        toast({
          title: "Erro no Teste",
          description: "Não foi possível encontrar usuário para teste.",
          variant: "destructive"
        });
        return;
      }
      
      console.log('✅ Usuário para teste encontrado:', testUser);
      
      // Tentar fazer um update simples
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ role: testUser.role }) // Atualizar com o mesmo valor
        .eq('user_id', testUser.user_id);
      
      if (updateError) {
        console.log('❌ Erro no update de teste:', updateError);
        toast({
          title: "Erro no Teste",
          description: `Update falhou: ${updateError.message}`,
          variant: "destructive"
        });
      } else {
        console.log('✅ Update de teste bem-sucedido!');
        toast({
          title: "Teste Bem-sucedido",
          description: "Update na tabela profiles funcionando.",
        });
      }
      
    } catch (error) {
      console.error('❌ Erro no teste de update:', error);
    }
  };

  // Função para testar adição de sócio específica
  const testAddPartner = async () => {
    try {
      console.log('🧪 Testando adição de sócio específica...');
      
      // Simular o email que está sendo usado
      const testEmail = 'souzamkt0@gmail.com';
      console.log('📧 Testando com email:', testEmail);
      
      // Buscar usuário pelo email
      const { data: user, error: userError } = await supabase
        .from('profiles')
        .select('user_id, email, role, display_name')
        .eq('email', testEmail)
        .single();

      if (userError || !user) {
        console.log('❌ Usuário não encontrado:', { userError, user });
        toast({
          title: "Teste - Usuário não encontrado",
          description: `Email ${testEmail} não encontrado no sistema.`,
          variant: "destructive"
        });
        return;
      }

      console.log('✅ Usuário encontrado:', user);

      // Verificar se já é sócio
      if (user.role === 'partner') {
        console.log('⚠️ Usuário já é sócio');
        toast({
          title: "Teste - Já é sócio",
          description: `${user.display_name || user.email} já possui status de sócio.`,
          variant: "default"
        });
        return;
      }

      // Tentar atualizar para partner
      console.log('🔄 Tentando atualizar role para partner...');
      const { data: updateResult, error: updateError } = await supabase
        .from('profiles')
        .update({ role: 'partner' })
        .eq('user_id', user.user_id)
        .select();

      console.log('📊 Resultado do teste:', { updateResult, updateError });

      if (updateError) {
        console.log('❌ Erro no update:', updateError);
        console.log('❌ Detalhes do erro:', {
          message: updateError.message,
          details: updateError.details,
          hint: updateError.hint,
          code: updateError.code
        });
        
        toast({
          title: "Teste - Erro no Update",
          description: `Erro: ${updateError.message}`,
          variant: "destructive"
        });
      } else {
        console.log('✅ Update bem-sucedido!');
        console.log('✅ Resultado:', updateResult);
        
        toast({
          title: "Teste - Sucesso",
          description: `${user.display_name || user.email} foi promovido a sócio!`,
        });
        
        // Recarregar lista de sócios
        await loadPartners();
        
        // Verificar se apareceu na lista
        setTimeout(async () => {
          console.log('🔍 Verificando se sócio apareceu na lista...');
          const { data: checkPartners, error: checkError } = await supabase
            .from('profiles')
            .select('user_id, email, role')
            .eq('role', 'partner');
          
          console.log('📊 Sócios após adição:', { checkPartners, checkError });
        }, 1000);
      }
      
    } catch (error) {
      console.error('❌ Erro no teste de adição de sócio:', error);
      console.error('❌ Tipo do erro:', typeof error);
      console.error('❌ Mensagem do erro:', error?.message);
      
      toast({
        title: "Teste - Erro",
        description: `Erro interno: ${error.message}`,
        variant: "destructive"
      });
    }
  };

  // Função para carregar todos os usuários
  const loadAllUsers = async () => {
    setIsLoadingUsers(true);
    try {
      console.log('👥 Carregando todos os usuários...');
      
      const { data: users, error } = await supabase
        .from('profiles')
        .select('user_id, email, display_name, username, role, created_at, balance')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Erro ao carregar usuários:', error);
        toast({
          title: "Erro",
          description: "Erro ao carregar lista de usuários.",
          variant: "destructive"
        });
        return;
      }

      console.log('✅ Usuários carregados:', users?.length || 0);
      setAllUsers(users || []);
      
    } catch (error) {
      console.error('❌ Erro ao carregar usuários:', error);
      toast({
        title: "Erro",
        description: "Erro interno ao carregar usuários.",
        variant: "destructive"
      });
    } finally {
      setIsLoadingUsers(false);
    }
  };

  // Função para testar acesso básico à tabela profiles
  const testBasicProfilesAccess = async () => {
    try {
      console.log('🔍 Testando acesso básico à tabela profiles...');
      
      // Teste 1: Verificar se conseguimos acessar a tabela
      const { data: allProfiles, error: accessError } = await supabase
        .from('profiles')
        .select('user_id, email, role')
        .limit(5);
      
      if (accessError) {
        console.log('❌ Erro ao acessar tabela profiles:', accessError);
        toast({
          title: "Erro de Acesso",
          description: `Não foi possível acessar a tabela profiles: ${accessError.message}`,
          variant: "destructive"
        });
        return;
      }
      
      console.log('✅ Acesso à tabela profiles OK:', allProfiles);
      
      // Teste 2: Verificar se o email específico existe
      const testEmail = 'souzamkt0@gmail.com';
      const userExists = allProfiles?.some(profile => profile.email === testEmail);
      
      console.log(`📧 Email ${testEmail} existe:`, userExists);
      
      if (!userExists) {
        console.log('❌ Email não encontrado na lista');
        toast({
          title: "Email não encontrado",
          description: `O email ${testEmail} não foi encontrado no sistema.`,
          variant: "destructive"
        });
        return;
      }
      
      // Teste 3: Tentar buscar o usuário específico
      const { data: specificUser, error: specificError } = await supabase
        .from('profiles')
        .select('user_id, email, role, display_name')
        .eq('email', testEmail)
        .single();
      
      if (specificError) {
        console.log('❌ Erro ao buscar usuário específico:', specificError);
        toast({
          title: "Erro ao buscar usuário",
          description: `Erro: ${specificError.message}`,
          variant: "destructive"
        });
        return;
      }
      
      console.log('✅ Usuário específico encontrado:', specificUser);
      
      toast({
        title: "Teste de Acesso OK",
        description: `Acesso à tabela profiles funcionando. Usuário ${specificUser.email} encontrado.`,
      });
      
    } catch (error) {
      console.error('❌ Erro no teste de acesso básico:', error);
      toast({
        title: "Erro no Teste",
        description: `Erro interno: ${error.message}`,
        variant: "destructive"
      });
    }
  };

  // Função para testar se a constraint foi corrigida
  const testRoleConstraint = async () => {
    try {
      console.log('🔍 Testando constraint da coluna role...');
      
      // Buscar o usuário admin
      const { data: adminUser, error: userError } = await supabase
        .from('profiles')
        .select('user_id, email, role, display_name')
        .eq('email', 'souzamkt0@gmail.com')
        .single();

      if (userError || !adminUser) {
        console.log('❌ Usuário admin não encontrado:', { userError, adminUser });
        toast({
          title: "Erro",
          description: "Usuário admin não encontrado.",
          variant: "destructive"
        });
        return;
      }

      console.log('✅ Usuário admin encontrado:', adminUser);

      // Tentar atualizar role para 'partner' (teste da constraint)
      console.log('🔄 Testando update role para partner...');
      const { data: updateResult, error: updateError } = await supabase
        .from('profiles')
        .update({ role: 'partner' })
        .eq('user_id', adminUser.user_id)
        .select();

      console.log('📊 Resultado do teste de constraint:', { updateResult, updateError });

      if (updateError) {
        console.log('❌ Erro na constraint:', updateError);
        console.log('❌ Detalhes do erro:', {
          message: updateError.message,
          details: updateError.details,
          hint: updateError.hint,
          code: updateError.code
        });
        
        toast({
          title: "Erro na Constraint",
          description: `Constraint não permite 'partner': ${updateError.message}`,
          variant: "destructive"
        });
      } else {
        console.log('✅ Constraint OK - update funcionou!');
        console.log('✅ Resultado:', updateResult);
        
        // Reverter para admin
        console.log('🔄 Revertendo para admin...');
        const { error: revertError } = await supabase
          .from('profiles')
          .update({ role: 'admin' })
          .eq('user_id', adminUser.user_id);

        if (revertError) {
          console.log('⚠️ Erro ao reverter para admin:', revertError);
        } else {
          console.log('✅ Revertido para admin com sucesso');
        }
        
        toast({
          title: "Constraint OK",
          description: "A constraint permite o valor 'partner'. Update funcionou!",
        });
      }
      
    } catch (error) {
      console.error('❌ Erro no teste de constraint:', error);
      toast({
        title: "Erro no Teste",
        description: `Erro interno: ${error.message}`,
        variant: "destructive"
      });
    }
  };

  // Função para verificar se há sócios na tabela
  const checkPartnersInDatabase = async () => {
    try {
      console.log('🔍 Verificando sócios no banco de dados...');
      
      // Verificar todos os usuários e seus roles
      const { data: allUsers, error: allUsersError } = await supabase
        .from('profiles')
        .select('user_id, email, role, display_name')
        .order('created_at', { ascending: false });

      if (allUsersError) {
        console.log('❌ Erro ao buscar todos os usuários:', allUsersError);
        toast({
          title: "Erro",
          description: "Erro ao buscar usuários.",
          variant: "destructive"
        });
        return;
      }

      console.log('📊 Todos os usuários:', allUsers);
      
      // Filtrar sócios
      const partners = allUsers?.filter(user => user.role === 'partner') || [];
      console.log('👥 Sócios encontrados:', partners);
      console.log('📊 Quantidade de sócios:', partners.length);
      
      // Mostrar todos os roles únicos
      const uniqueRoles = [...new Set(allUsers?.map(user => user.role) || [])];
      console.log('🏷️ Roles únicos na tabela:', uniqueRoles);
      
      toast({
        title: "Verificação Concluída",
        description: `Encontrados ${partners.length} sócios de ${allUsers?.length || 0} usuários. Roles: ${uniqueRoles.join(', ')}`,
      });
      
    } catch (error) {
      console.error('❌ Erro na verificação:', error);
      toast({
        title: "Erro",
        description: "Erro interno na verificação.",
        variant: "destructive"
      });
    }
  };

  // Função específica para verificar o Admin Souza
  const checkAdminSouza = async () => {
    try {
      console.log('🔍 Verificando especificamente o Admin Souza...');
      
      // Buscar o Admin Souza pelo email
      const { data: adminSouza, error: adminError } = await supabase
        .from('profiles')
        .select('user_id, email, role, display_name, username, created_at, balance')
        .eq('email', 'souzamkt0@gmail.com')
        .single();

      if (adminError) {
        console.log('❌ Erro ao buscar Admin Souza:', adminError);
        toast({
          title: "Erro",
          description: "Erro ao buscar Admin Souza.",
          variant: "destructive"
        });
        return;
      }

      console.log('✅ Admin Souza encontrado:', adminSouza);
      console.log('🏷️ Role atual:', adminSouza.role);
      
      // Verificar se é sócio
      const isPartner = adminSouza.role === 'partner';
      console.log('👥 É sócio?', isPartner);
      
      // Buscar sócios diretamente
      const { data: directPartners, error: directError } = await supabase
        .from('profiles')
        .select('user_id, email, role, display_name')
        .eq('role', 'partner');

      console.log('📊 Sócios diretos da query:', directPartners);
      console.log('❌ Erro da query direta:', directError);
      
      // Verificar se Admin Souza está na lista de sócios
      const adminInPartners = directPartners?.some(p => p.user_id === adminSouza.user_id);
      console.log('🔍 Admin Souza está na lista de sócios?', adminInPartners);
      
      // Comparar com o estado local
      console.log('📊 Estado local de sócios:', partners);
      const adminInLocalState = partners.some(p => p.user_id === adminSouza.user_id);
      console.log('🔍 Admin Souza está no estado local?', adminInLocalState);
      
      toast({
        title: "Verificação Admin Souza",
        description: `Role: ${adminSouza.role} | É sócio: ${isPartner} | Na query: ${adminInPartners} | No estado: ${adminInLocalState}`,
      });
      
    } catch (error) {
      console.error('❌ Erro na verificação do Admin Souza:', error);
      toast({
        title: "Erro",
        description: "Erro interno na verificação.",
        variant: "destructive"
      });
    }
  };

  // Função para verificar constraint
  const checkConstraint = async () => {
    try {
      console.log('🔍 Verificando constraint da coluna role...');
      
      // 1. Verificar se Admin Souza é partner
      const { data: adminSouza, error: adminError } = await supabase
        .from('profiles')
        .select('user_id, email, role, display_name')
        .eq('email', 'souzamkt0@gmail.com')
        .single();
      
      if (adminError) {
        console.log('❌ Erro ao buscar Admin Souza:', adminError);
      } else {
        console.log('✅ Admin Souza encontrado:', adminSouza);
        console.log('🏷️ Role atual:', adminSouza.role);
        
        if (adminSouza.role === 'partner') {
          console.log('✅ Admin Souza é partner!');
          toast({
            title: "Sucesso!",
            description: "Admin Souza é partner!",
          });
          
          // Recarregar listas
          await loadPartners();
          await loadAllUsers();
        } else {
          console.log('❌ Admin Souza não é partner');
          toast({
            title: "Ainda não é partner",
            description: "Admin Souza ainda tem role: " + adminSouza.role,
            variant: "destructive"
          });
        }
      }
      
    } catch (error) {
      console.error('❌ Erro na verificação da constraint:', error);
      toast({
        title: "Erro",
        description: "Erro interno na verificação da constraint.",
        variant: "destructive"
      });
    }
  };

  // Função para adicionar sócio por email
  const addPartnerByEmail = async () => {
    try {
      const email = prompt('Digite o email do usuário para adicionar como sócio:');
      if (!email) return;

      const commission = prompt('Digite a porcentagem de comissão (ex: 1.50 para 1.5%):', '1.00');
      if (!commission) return;

      console.log('🔄 Adicionando sócio por email...');
      console.log('📧 Email:', email);
      console.log('💰 Comissão:', commission);

      const { data: result, error } = await supabase
        .rpc('add_partner_by_email', {
          partner_email: email,
          commission_percentage: parseFloat(commission)
        });

      if (error) {
        console.log('❌ Erro ao adicionar sócio:', error);
        toast({
          title: "Erro",
          description: "Erro ao adicionar sócio: " + error.message,
          variant: "destructive"
        });
      } else {
        console.log('✅ Resultado:', result);
        
        if (result.success) {
          toast({
            title: "Sucesso!",
            description: result.message,
          });
          
          // Recarregar listas
          await loadPartners();
          await loadAllUsers();
        } else {
          toast({
            title: "Erro",
            description: result.error,
            variant: "destructive"
          });
        }
      }
      
    } catch (error) {
      console.error('❌ Erro ao adicionar sócio:', error);
      toast({
        title: "Erro",
        description: "Erro interno ao adicionar sócio.",
        variant: "destructive"
      });
    }
  };

  // Função para atualizar comissão de sócio
  const updatePartnerCommission = async () => {
    try {
      const email = prompt('Digite o email do sócio:');
      if (!email) return;

      const commission = prompt('Digite a nova porcentagem de comissão (ex: 2.50 para 2.5%):');
      if (!commission) return;

      console.log('🔄 Atualizando comissão de sócio...');
      console.log('📧 Email:', email);
      console.log('💰 Nova comissão:', commission);

      const { data: result, error } = await supabase
        .rpc('update_partner_commission', {
          partner_email: email,
          new_commission_percentage: parseFloat(commission)
        });

      if (error) {
        console.log('❌ Erro ao atualizar comissão:', error);
        toast({
          title: "Erro",
          description: "Erro ao atualizar comissão: " + error.message,
          variant: "destructive"
        });
      } else {
        console.log('✅ Resultado:', result);
        
        if (result.success) {
          toast({
            title: "Sucesso!",
            description: result.message,
          });
          
          // Recarregar listas
          await loadPartners();
        } else {
          toast({
            title: "Erro",
            description: result.error,
            variant: "destructive"
          });
        }
      }
      
    } catch (error) {
      console.error('❌ Erro ao atualizar comissão:', error);
      toast({
        title: "Erro",
        description: "Erro interno ao atualizar comissão.",
        variant: "destructive"
      });
    }
  };

  // Função para remover sócio
  const removePartnerByEmail = async () => {
    try {
      const email = prompt('Digite o email do sócio para remover:');
      if (!email) return;

      const confirm = window.confirm(`Tem certeza que deseja remover o sócio ${email}?`);
      if (!confirm) return;

      console.log('🔄 Removendo sócio...');
      console.log('📧 Email:', email);

      const { data: result, error } = await supabase
        .rpc('remove_partner', {
          partner_email: email
        });

      if (error) {
        console.log('❌ Erro ao remover sócio:', error);
        toast({
          title: "Erro",
          description: "Erro ao remover sócio: " + error.message,
          variant: "destructive"
        });
      } else {
        console.log('✅ Resultado:', result);
        
        if (result.success) {
          toast({
            title: "Sucesso!",
            description: result.message,
          });
          
          // Recarregar listas
          await loadPartners();
          await loadAllUsers();
        } else {
          toast({
            title: "Erro",
            description: result.error,
            variant: "destructive"
          });
        }
      }
      
    } catch (error) {
      console.error('❌ Erro ao remover sócio:', error);
      toast({
        title: "Erro",
        description: "Erro interno ao remover sócio.",
        variant: "destructive"
      });
    }
  };



  // Função para confirmar emails de usuários existentes (versão simplificada)
  const confirmarEmailsExistentes = async () => {
    try {
      const confirm = window.confirm('Confirmar emails de todos os usuários não confirmados?');
      if (!confirm) return;

      console.log('🔄 Confirmando emails de usuários existentes...');

      // Usar RPC para confirmar todos os emails
      const { data: result, error } = await supabase
        .rpc('confirm_all_emails');

      if (error) {
        console.log('❌ Erro ao confirmar emails:', error);
        toast({
          title: "Erro",
          description: "Erro ao confirmar emails: " + error.message,
          variant: "destructive"
        });
        return;
      }

      console.log('✅ Resultado da confirmação:', result);
      
      if (result.success) {
        toast({
          title: "✅ Sucesso!",
          description: `${result.affected_count} emails confirmados com sucesso!`,
        });
        
        // Recarregar lista de usuários
        await loadAllUsers();
      } else {
        toast({
          title: "Erro",
          description: result.error,
          variant: "destructive"
        });
      }
      
    } catch (error) {
      console.error('❌ Erro ao confirmar emails:', error);
      toast({
        title: "Erro",
        description: "Erro interno ao confirmar emails.",
        variant: "destructive"
      });
    }
  };



  // Função simples para atualizar Admin Souza
  const simpleUpdateAdminSouza = async () => {
    try {
      console.log('🔄 Tentativa simples de atualizar Admin Souza...');
      
      // 1. Buscar Admin Souza
      const { data: adminSouza, error: adminError } = await supabase
        .from('profiles')
        .select('user_id, email, role')
        .eq('email', 'souzamkt0@gmail.com')
        .single();

      if (adminError) {
        console.log('❌ Erro ao buscar Admin Souza:', adminError);
        toast({
          title: "Erro",
          description: "Não foi possível encontrar o Admin Souza.",
          variant: "destructive"
        });
        return;
      }

      console.log('✅ Admin Souza encontrado:', adminSouza);
      console.log('🏷️ Role atual:', adminSouza.role);

      // 2. Tentar update simples
      console.log('🔄 Executando update simples...');
      const { data: updateResult, error: updateError } = await supabase
        .from('profiles')
        .update({ role: 'partner' })
        .eq('email', 'souzamkt0@gmail.com')
        .select();

      console.log('📊 Resultado do update:', updateResult);
      console.log('❌ Erro do update:', updateError);

      if (updateError) {
        console.log('❌ Update falhou:', updateError);
        
        // 3. Tentar com upsert
        console.log('🔄 Tentando com upsert...');
        const { data: upsertResult, error: upsertError } = await supabase
          .from('profiles')
          .upsert({
            user_id: adminSouza.user_id,
            email: 'souzamkt0@gmail.com',
            role: 'partner'
          }, {
            onConflict: 'user_id'
          })
          .select();

        console.log('📊 Resultado do upsert:', upsertResult);
        console.log('❌ Erro do upsert:', upsertError);

        if (upsertError) {
          toast({
            title: "Erro na Atualização",
            description: "Não foi possível atualizar o Admin Souza.",
            variant: "destructive"
          });
          return;
        }
      }

      // 4. Recarregar listas
      console.log('🔄 Recarregando listas...');
      await loadPartners();
      await loadAllUsers();

      // 5. Verificar se funcionou
      setTimeout(async () => {
        const { data: checkResult, error: checkError } = await supabase
          .from('profiles')
          .select('user_id, email, role')
          .eq('email', 'souzamkt0@gmail.com')
          .single();

        console.log('🔍 Verificação final:', checkResult);
        
        if (checkResult && checkResult.role === 'partner') {
          console.log('✅ Admin Souza atualizado com sucesso!');
          toast({
            title: "Sucesso!",
            description: "Admin Souza foi atualizado para partner!",
          });
        } else {
          console.log('❌ Admin Souza não foi atualizado');
          toast({
            title: "Erro",
            description: "Admin Souza não foi atualizado. Role atual: " + (checkResult?.role || 'desconhecido'),
            variant: "destructive"
          });
        }
      }, 1000);

    } catch (error) {
      console.error('❌ Erro na atualização simples:', error);
      toast({
        title: "Erro",
        description: "Erro interno na atualização simples.",
        variant: "destructive"
      });
    }
  };

  // Função para forçar a atualização do Admin Souza para partner
  const forceUpdateAdminSouza = async () => {
    try {
      console.log('🔄 Forçando atualização do Admin Souza para partner...');
      
      // 1. Buscar Admin Souza
      const { data: adminSouza, error: adminError } = await supabase
        .from('profiles')
        .select('user_id, email, role, display_name')
        .eq('email', 'souzamkt0@gmail.com')
        .single();

      if (adminError) {
        console.log('❌ Erro ao buscar Admin Souza:', adminError);
        toast({
          title: "Erro",
          description: "Não foi possível encontrar o Admin Souza.",
          variant: "destructive"
        });
        return;
      }

      console.log('✅ Admin Souza encontrado:', adminSouza);
      console.log('🏷️ Role atual:', adminSouza.role);

      // 2. Tentar update simples
      console.log('🔄 Executando update simples...');
      const { data: updateResult, error: updateError } = await supabase
        .from('profiles')
        .update({ role: 'partner' })
        .eq('email', 'souzamkt0@gmail.com')
        .select();

      console.log('📊 Resultado do update:', updateResult);
      console.log('❌ Erro do update:', updateError);

      if (updateError) {
        console.log('❌ Update falhou:', updateError);
        console.log('📋 Detalhes do erro:', {
          message: updateError.message,
          details: updateError.details,
          hint: updateError.hint,
          code: updateError.code
        });
        
        // 3. Tentar com RPC
        console.log('🔄 Tentando via RPC...');
        const { data: rpcResult, error: rpcError } = await supabase
          .rpc('update_user_role', {
            user_id_param: adminSouza.user_id,
            new_role: 'partner'
          });

        console.log('📊 Resultado do RPC:', rpcResult);
        console.log('❌ Erro do RPC:', rpcError);

        if (rpcError) {
          console.log('❌ RPC falhou:', rpcError);
          
          // 4. Tentar com SQL direto
          console.log('🔄 Tentando com SQL direto...');
          const { data: sqlResult, error: sqlError } = await supabase
            .rpc('exec_sql', {
              sql: `UPDATE profiles SET role = 'partner' WHERE email = 'souzamkt0@gmail.com'`
            });

          console.log('📊 Resultado do SQL:', sqlResult);
          console.log('❌ Erro do SQL:', sqlError);

          if (sqlError) {
            console.log('❌ SQL falhou:', sqlError);
            
            // 5. Última tentativa: inserir novo registro
            console.log('🔄 Tentativa final: inserir novo registro...');
            const { data: insertResult, error: insertError } = await supabase
              .from('profiles')
              .upsert({
                user_id: adminSouza.user_id,
                email: 'souzamkt0@gmail.com',
                role: 'partner',
                display_name: 'Admin Souza',
                updated_at: new Date().toISOString()
              }, {
                onConflict: 'user_id'
              })
              .select();

            console.log('📊 Resultado do insert:', insertResult);
            console.log('❌ Erro do insert:', insertError);

            if (insertError) {
              toast({
                title: "Erro na Atualização",
                description: "Não foi possível atualizar o Admin Souza. Verifique os logs.",
                variant: "destructive"
              });
              return;
            }
          }
        }
      }

      // 6. Recarregar listas
      console.log('🔄 Recarregando listas...');
      await loadPartners();
      await loadAllUsers();

      // 7. Verificar se funcionou
      setTimeout(async () => {
        const { data: checkResult, error: checkError } = await supabase
          .from('profiles')
          .select('user_id, email, role')
          .eq('email', 'souzamkt0@gmail.com')
          .single();

        console.log('🔍 Verificação final:', checkResult);
        
        if (checkResult && checkResult.role === 'partner') {
          console.log('✅ Admin Souza atualizado com sucesso!');
          toast({
            title: "Sucesso!",
            description: "Admin Souza foi atualizado para partner!",
          });
        } else {
          console.log('❌ Admin Souza não foi atualizado');
          toast({
            title: "Erro",
            description: "Admin Souza não foi atualizado. Role atual: " + (checkResult?.role || 'desconhecido'),
            variant: "destructive"
          });
        }
      }, 2000);

    } catch (error) {
      console.error('❌ Erro na força atualização:', error);
      toast({
        title: "Erro",
        description: "Erro interno na força atualização.",
        variant: "destructive"
      });
    }
  };

  // Função para forçar atualização da lista de sócios
  const forceRefreshPartners = async () => {
    try {
      console.log('🔄 Forçando atualização da lista de sócios...');
      
      // Limpar estado atual
      setPartners([]);
      console.log('🗑️ Estado limpo');
      
      // Aguardar um pouco
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Recarregar sócios
      await loadPartners();
      console.log('✅ Lista recarregada');
      
      // Verificar novamente
      setTimeout(async () => {
        console.log('🔍 Verificação pós-força refresh...');
        const { data: checkPartners, error: checkError } = await supabase
          .from('profiles')
          .select('user_id, email, role, display_name')
          .eq('role', 'partner');
        
        console.log('📊 Sócios após força refresh:', { checkPartners, checkError });
        
        toast({
          title: "Força Refresh Concluído",
          description: `Encontrados ${checkPartners?.length || 0} sócios após força refresh.`,
        });
      }, 1000);
      
    } catch (error) {
      console.error('❌ Erro no força refresh:', error);
      toast({
        title: "Erro",
        description: "Erro no força refresh.",
        variant: "destructive"
      });
    }
  };

  // Função para aplicar migrações e corrigir problemas
  const applyMigrationsAndFix = async () => {
    try {
      console.log('🔧 Aplicando migrações e corrigindo problemas...');
      
      // 1. Verificar se Admin Souza existe
      console.log('👤 Verificando Admin Souza...');
      const { data: adminSouza, error: adminError } = await supabase
        .from('profiles')
        .select('user_id, email, role, display_name')
        .eq('email', 'souzamkt0@gmail.com')
        .single();
      
      if (adminError) {
        console.log('❌ Erro ao buscar Admin Souza:', adminError);
        toast({
          title: "Erro",
          description: "Não foi possível encontrar o Admin Souza.",
          variant: "destructive"
        });
        return;
      }
      
      console.log('✅ Admin Souza encontrado:', adminSouza);
      console.log('🏷️ Role atual:', adminSouza.role);
      
      // 2. Tentar update direto primeiro (mais simples)
      console.log('🔄 Tentando update direto...');
      const { data: directUpdate, error: directError } = await supabase
        .from('profiles')
        .update({ role: 'partner' })
        .eq('user_id', adminSouza.user_id)
        .select();
      
      console.log('📊 Resultado do update direto:', directUpdate);
      console.log('❌ Erro do update direto:', directError);
      
      if (!directError && directUpdate && directUpdate.length > 0) {
        console.log('✅ Update direto bem-sucedido!');
        
        // 3. Recarregar listas
        await loadPartners();
        await loadAllUsers();
        
        toast({
          title: "Sucesso!",
          description: "Admin Souza foi atualizado para partner com sucesso!",
        });
        
        // 4. Verificar se apareceu na lista
        setTimeout(async () => {
          const { data: checkPartners, error: checkError } = await supabase
            .from('profiles')
            .select('user_id, email, role, display_name')
            .eq('role', 'partner');
          
          console.log('🔍 Verificação pós-update:', { checkPartners, checkError });
          console.log('📊 Quantidade de sócios após update:', checkPartners?.length || 0);
          
          if (checkPartners && checkPartners.some(p => p.user_id === adminSouza.user_id)) {
            console.log('✅ Admin Souza confirmado na lista de sócios!');
          } else {
            console.log('❌ Admin Souza não apareceu na lista de sócios');
          }
        }, 1000);
        
      } else {
        console.log('❌ Update direto falhou, tentando RPC...');
        
        // 5. Tentar função RPC como fallback
        const { data: rpcUpdate, error: rpcError } = await supabase
          .rpc('update_user_role', {
            user_id_param: adminSouza.user_id,
            new_role: 'partner'
          });
        
        console.log('📊 Resultado do RPC:', rpcUpdate);
        console.log('❌ Erro do RPC:', rpcError);
        
        if (!rpcError) {
          await loadPartners();
          await loadAllUsers();
          
          toast({
            title: "Sucesso via RPC!",
            description: "Admin Souza foi atualizado para partner via RPC!",
          });
        } else {
          // 6. Última tentativa: SQL direto
          console.log('🔄 Tentando SQL direto...');
          const { data: sqlResult, error: sqlError } = await supabase
            .rpc('exec_sql', {
              sql: `UPDATE profiles SET role = 'partner' WHERE user_id = '${adminSouza.user_id}'`
            });
          
          console.log('📊 Resultado do SQL:', sqlResult);
          console.log('❌ Erro do SQL:', sqlError);
          
          if (!sqlError) {
            await loadPartners();
            await loadAllUsers();
            
            toast({
              title: "Sucesso via SQL!",
              description: "Admin Souza foi atualizado para partner via SQL!",
            });
          } else {
            toast({
              title: "Erro na Atualização",
              description: "Não foi possível atualizar o Admin Souza para partner. Verifique os logs.",
              variant: "destructive"
            });
          }
        }
      }
      
    } catch (error) {
      console.error('❌ Erro na aplicação de migrações:', error);
      toast({
        title: "Erro",
        description: "Erro interno na aplicação de migrações.",
        variant: "destructive"
      });
    }
  };

  // Função para carregar todos os investimentos ativos
  const loadActiveInvestments = async () => {
    setIsLoadingInvestments(true);
    try {
      console.log('📊 Carregando investimentos ativos...');
      
      // Primeiro, tentar uma consulta simples para verificar se a tabela existe
      const { data: simpleTest, error: simpleError } = await supabase
        .from('user_investments')
        .select('*')
        .limit(1);
      
      console.log('🔍 Teste simples da tabela:', { simpleTest, simpleError });
      
      if (simpleError) {
        console.error('❌ Erro no teste simples:', simpleError);
        toast({
          title: "Erro",
          description: `Erro ao acessar tabela: ${simpleError.message}`,
          variant: "destructive"
        });
        return;
      }

      // Agora tentar a consulta completa
      const { data: investments, error } = await supabase
        .from('user_investments')
        .select(`
          id,
          user_id,
          amount,
          daily_rate,
          status,
          created_at,
          updated_at,
          profiles!user_investments_user_id_fkey(
            email,
            display_name,
            username
          )
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      console.log('📊 Resultado da consulta completa:', { investments, error });

      if (error) {
        console.error('❌ Erro ao carregar investimentos:', error);
        
        // Tentar consulta sem joins para ver se o problema é nas relações
        console.log('🔄 Tentando consulta sem joins...');
        const { data: investmentsSimple, error: simpleError2 } = await supabase
          .from('user_investments')
          .select('*')
          .eq('status', 'active')
          .order('created_at', { ascending: false });
        
        console.log('📊 Resultado da consulta simples:', { investmentsSimple, simpleError2 });
        
        if (simpleError2) {
          toast({
            title: "Erro",
            description: `Erro ao carregar investimentos: ${simpleError2.message}`,
            variant: "destructive"
          });
          return;
        }
        
        // Se a consulta simples funcionou, usar esses dados
        setActiveInvestments(investmentsSimple || []);
        toast({
          title: "Aviso",
          description: "Investimentos carregados (sem dados de usuário).",
        });
        return;
      }

      console.log('✅ Investimentos carregados com sucesso:', investments);
      setActiveInvestments(investments || []);
      
    } catch (error) {
      console.error('❌ Erro ao carregar investimentos:', error);
      toast({
        title: "Erro",
        description: `Erro interno: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setIsLoadingInvestments(false);
    }
  };

  // Função para excluir investimento individual
  const deleteIndividualInvestment = async (investmentId: string, userEmail: string, investmentName: string) => {
    try {
      console.log('🗑️ Excluindo investimento individual:', { investmentId, userEmail, investmentName });
      
      const { error } = await supabase
        .from('user_investments')
        .delete()
        .eq('id', investmentId);

      if (error) {
        console.error('❌ Erro ao excluir investimento:', error);
        toast({
          title: "Erro",
          description: `Erro ao excluir investimento: ${error.message}`,
          variant: "destructive"
        });
        return;
      }

      console.log('✅ Investimento excluído com sucesso!');
      
      // Registrar ação administrativa
      if (user) {
        const { error: transactionError } = await supabase
          .from('admin_balance_transactions')
          .insert([{
            user_id: investmentId, // Usar o ID do investimento como referência
            admin_user_id: user.id,
            amount_before: 0,
            amount_after: 0,
            amount_changed: 0,
            transaction_type: 'individual_investment_deletion',
            reason: `Exclusão de investimento individual: ${investmentName} do usuário ${userEmail}`
          }]);

        if (transactionError) {
          console.error('❌ Erro ao registrar transação:', transactionError);
        }
      }

      toast({
        title: "Investimento Excluído",
        description: `Investimento "${investmentName}" de ${userEmail} foi excluído com sucesso.`,
      });

      // Recarregar lista
      loadActiveInvestments();
      
    } catch (error) {
      console.error('❌ Erro ao excluir investimento individual:', error);
      toast({
        title: "Erro",
        description: "Erro interno ao excluir investimento.",
        variant: "destructive"
      });
    }
  };

  // Função para abrir modal de confirmação de exclusão individual
  const openIndividualDeleteModal = (investment: any) => {
    setSelectedInvestmentForDeletion(investment);
    setIsIndividualDeleteModalOpen(true);
  };

  // Função para confirmar exclusão individual
  const confirmIndividualDeletion = async () => {
    if (!selectedInvestmentForDeletion) return;

          await deleteIndividualInvestment(
        selectedInvestmentForDeletion.id,
        selectedInvestmentForDeletion.profiles?.email || `ID: ${selectedInvestmentForDeletion.user_id}`,
        'Plano de Investimento'
      );

    setIsIndividualDeleteModalOpen(false);
    setSelectedInvestmentForDeletion(null);
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

        {/* Main Content with Tabs */}
        <Tabs defaultValue="users" className="w-full">
                  <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="users">Usuários</TabsTrigger>
          <TabsTrigger value="deposits">Depósitos</TabsTrigger>
          <TabsTrigger value="withdrawals">Saques</TabsTrigger>
          <TabsTrigger value="transactions">Transações</TabsTrigger>
          <TabsTrigger value="trading">Trading</TabsTrigger>
          <TabsTrigger value="partners">Sócios</TabsTrigger>
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
                        <div className="text-xs font-medium">${(user.balance || 0).toLocaleString()}</div>
                      <div className="text-xs text-trading-green">+${(user.totalProfit || 0).toLocaleString()}</div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell font-medium text-xs sm:text-sm">
                      ${(user.balance || 0).toLocaleString()}
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-trading-green font-medium text-xs sm:text-sm">
                      +${(user.totalProfit || 0).toLocaleString()}
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
                          title="Ver detalhes"
                        >
                          <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditUser(user)}
                          className="h-8 w-8 p-0"
                          title="Editar usuário"
                        >
                          <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                        {user.role !== 'partner' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openPartnerSelectionModal({
                              user_id: user.id,
                              email: user.email,
                              display_name: user.name,
                              role: user.role,
                              balance: user.balance
                            })}
                            className="h-8 w-8 p-0 text-purple-600 hover:text-purple-700"
                            title={user.role === 'admin' ? "Tornar Admin Sócio" : "Selecionar como sócio"}
                          >
                            <Crown className="h-3 w-3 sm:h-4 sm:w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedUserForPassword(user);
                            setShowChangePasswordModal(true);
                          }}
                          className="h-8 w-8 p-0 text-blue-500 hover:text-blue-600"
                          title="Alterar senha"
                        >
                          <Key className="h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleAccessAccount(user)}
                          className="h-8 w-8 p-0 text-green-500 hover:text-green-600"
                          title="Acessar conta"
                        >
                          <User className="h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteUser(user.id)}
                          disabled={deletingUser === user.id}
                          className="text-destructive hover:text-destructive h-8 w-8 p-0 disabled:opacity-50"
                          title="Excluir usuário"
                        >
                          {deletingUser === user.id ? (
                            <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-destructive"></div>
                          ) : (
                          <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                          )}
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
                          R$ {(deposit.amountBRL || 0).toLocaleString()}
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
                          R$ {(withdrawal.amountBRL || 0).toLocaleString()}
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
                            <div className="font-medium">${(plan.minimumAmount || 0).toLocaleString()}</div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Valor Máx:</span>
                            <div className="font-medium">${(plan.maxInvestmentAmount || 0).toLocaleString()}</div>
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
                      value={selectedPlan.maxInvestmentAmount}
                      onChange={(e) => setSelectedPlan({...selectedPlan, maxInvestmentAmount: parseInt(e.target.value) || 0})}
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
                    <p className="text-sm font-medium text-trading-green">${selectedUser.balance.toLocaleString()}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Lucro Total</Label>
                    <p className="text-sm font-medium text-primary">+${selectedUser.totalProfit.toLocaleString()}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Data de Cadastro</Label>
                    <p className="text-sm text-muted-foreground">{selectedUser.joinDate}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Último Login</Label>
                    <p className="text-sm text-muted-foreground">{selectedUser.lastLogin}</p>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium">API Conectada</Label>
                  <Badge variant={selectedUser.apiConnected ? "default" : "destructive"}>
                    {selectedUser.apiConnected ? "Conectada" : "Desconectada"}
                  </Badge>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Delete Investment Confirmation Modal */}
        <Dialog open={isDeleteInvestmentModalOpen} onOpenChange={setIsDeleteInvestmentModalOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center text-destructive">
                <Trash2 className="h-5 w-5 mr-2" />
                Confirmar Exclusão de Investimentos
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
                  <div className="space-y-2">
                    <h4 className="font-medium text-destructive">Ação Irreversível</h4>
                    <p className="text-sm text-muted-foreground">
                      Você está prestes a excluir TODOS os investimentos do usuário <strong>{deleteInvestmentEmail}</strong>.
                    </p>
                    <p className="text-sm text-muted-foreground">
                      <strong>Motivo:</strong> {deleteInvestmentReason}
                    </p>
                    <p className="text-sm text-destructive font-medium">
                      ⚠️ Esta ação não pode ser desfeita!
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm font-medium">Digite "CONFIRMAR" para prosseguir:</Label>
                <Input
                  placeholder="CONFIRMAR"
                  onChange={(e) => {
                    console.log('🔤 Texto digitado:', e.target.value);
                    if (e.target.value === "CONFIRMAR") {
                      console.log('✅ Confirmação digitada, executando exclusão...');
                      handleDeleteInvestmentByEmail();
                    }
                  }}
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    console.log('❌ Modal cancelado');
                    setIsDeleteInvestmentModalOpen(false);
                  }}
                >
                  Cancelar
                </Button>
                <Button 
                  variant="destructive"
                  onClick={() => {
                    console.log('🚀 Botão de exclusão clicado');
                    handleDeleteInvestmentByEmail();
                  }}
                  className="bg-destructive hover:bg-destructive/90"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Excluir Investimentos
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Partner Selection Modal with Commission */}
        <Dialog open={isPartnerSelectionModalOpen} onOpenChange={setIsPartnerSelectionModalOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center text-purple-600">
                <Crown className="h-5 w-5 mr-2" />
                Adicionar Sócio com Comissão
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {/* Informações do usuário selecionado */}
              {selectedUserForPartner && (
                <div className="p-4 bg-muted/30 rounded-lg border">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-2 h-2 rounded-full ${
                      selectedUserForPartner.role === 'admin' ? 'bg-red-500' : 'bg-green-500'
                    }`}></div>
                    <div>
                      <div className="font-medium">
                        {selectedUserForPartner.display_name || selectedUserForPartner.username || 'Usuário'}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {selectedUserForPartner.email}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Saldo: ${selectedUserForPartner.balance || 0}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={selectedUserForPartner.role === 'admin' ? 'destructive' : 'secondary'}>
                      {selectedUserForPartner.role === 'admin' ? 'Admin' : 'Usuário'}
                    </Badge>
                    {selectedUserForPartner.role === 'admin' && (
                      <Badge variant="outline" className="text-orange-600 border-orange-600">
                        Será transformado em Sócio
                      </Badge>
                    )}
                  </div>
                </div>
              )}
              
              {/* Configuração de comissão */}
              <div className="space-y-2">
                <Label htmlFor="customCommission">Comissão Personalizada (%)</Label>
                <Input
                  id="customCommission"
                  type="number"
                  min="0.1"
                  max="10"
                  step="0.1"
                  placeholder="1.0"
                  value={customCommission}
                  onChange={(e) => setCustomCommission(parseFloat(e.target.value) || 1.0)}
                />
                <p className="text-xs text-muted-foreground">
                  Percentual de comissão sobre cada depósito aprovado
                </p>
              </div>

              {/* Aviso especial para admins */}
              {selectedUserForPartner?.role === 'admin' && (
                <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg dark:bg-orange-950 dark:border-orange-800">
                  <h4 className="text-sm font-medium mb-2 text-orange-800 dark:text-orange-200">
                    ⚠️ Aviso Importante
                  </h4>
                  <ul className="text-xs text-orange-700 dark:text-orange-300 space-y-1">
                    <li>• Este usuário é um <strong>Administrador</strong></li>
                    <li>• Será transformado em <strong>Sócio</strong></li>
                    <li>• Manterá acesso ao painel admin</li>
                    <li>• Receberá comissões como sócio</li>
                  </ul>
                </div>
              )}

              {/* Informações sobre comissão */}
              <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg dark:bg-purple-950 dark:border-purple-800">
                <h4 className="text-sm font-medium mb-2 text-purple-800 dark:text-purple-200">
                  💡 Como Funciona
                </h4>
                <ul className="text-xs text-purple-700 dark:text-purple-300 space-y-1">
                  <li>• Sócio ganha {customCommission}% de cada depósito aprovado</li>
                  <li>• Comissão é calculada automaticamente</li>
                  <li>• Ganhos são creditados no saldo do sócio</li>
                  <li>• Sistema rastreia todas as transações</li>
                </ul>
              </div>

              {/* Exemplo de cálculo */}
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg dark:bg-blue-950 dark:border-blue-800">
                <h4 className="text-sm font-medium mb-2 text-blue-800 dark:text-blue-200">
                  📊 Exemplo de Cálculo
                </h4>
                <div className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
                  <p>• Depósito de $1.000 aprovado</p>
                  <p>• Comissão: {customCommission}% = ${(1000 * customCommission / 100).toFixed(2)}</p>
                  <p>• Sócio recebe automaticamente no saldo</p>
                </div>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setIsPartnerSelectionModalOpen(false);
                    setSelectedUserForPartner(null);
                  }}
                >
                  Cancelar
                </Button>
                <Button 
                  onClick={addPartnerWithCustomCommission}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  <Crown className="h-4 w-4 mr-2" />
                  {selectedUserForPartner?.role === 'admin' ? 'Transformar em Sócio' : 'Adicionar como Sócio'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Partner Management Modal */}
        <Dialog open={isPartnerModalOpen} onOpenChange={setIsPartnerModalOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center text-purple-600">
                <Crown className="h-5 w-5 mr-2" />
                {isNewPartner ? "Adicionar Novo Sócio" : "Editar Sócio"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="modalPartnerEmail">Email do Usuário</Label>
                <Input
                  id="modalPartnerEmail"
                  type="email"
                  placeholder="usuario@exemplo.com"
                  value={selectedPartner?.email || ''}
                  onChange={(e) => setSelectedPartner({
                    ...selectedPartner,
                    email: e.target.value
                  })}
                  disabled={!isNewPartner}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="modalPartnerCommission">Comissão (%)</Label>
                <Input
                  id="modalPartnerCommission"
                  type="number"
                  min="0.1"
                  max="10"
                  step="0.1"
                  placeholder="1.0"
                  value={selectedPartner?.commission || partnerCommission}
                  onChange={(e) => setSelectedPartner({
                    ...selectedPartner,
                    commission: parseFloat(e.target.value) || 1.0
                  })}
                />
                <p className="text-xs text-muted-foreground">
                  Percentual de comissão sobre cada depósito aprovado
                </p>
              </div>

              <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg dark:bg-purple-950 dark:border-purple-800">
                <h4 className="text-sm font-medium mb-2 text-purple-800 dark:text-purple-200">
                  💡 Como Funciona
                </h4>
                <ul className="text-xs text-purple-700 dark:text-purple-300 space-y-1">
                  <li>• Sócio ganha {selectedPartner?.commission || partnerCommission}% de cada depósito aprovado</li>
                  <li>• Comissão é calculada automaticamente</li>
                  <li>• Ganhos são creditados no saldo do sócio</li>
                  <li>• Sistema rastreia todas as transações</li>
                </ul>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setIsPartnerModalOpen(false);
                    setSelectedPartner(null);
                  }}
                >
                  Cancelar
                </Button>
                <Button 
                  onClick={addPartner}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  <Crown className="h-4 w-4 mr-2" />
                  {isNewPartner ? "Adicionar Sócio" : "Salvar Alterações"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Individual Investment Delete Confirmation Modal */}
        <Dialog open={isIndividualDeleteModalOpen} onOpenChange={setIsIndividualDeleteModalOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center text-destructive">
                <Trash2 className="h-5 w-5 mr-2" />
                Confirmar Exclusão de Investimento
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {selectedInvestmentForDeletion && (
                <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
                    <div className="space-y-2">
                      <h4 className="font-medium text-destructive">Excluir Investimento Individual</h4>
                      <div className="space-y-1 text-sm">
                        <p><strong>Plano:</strong> Plano de Investimento</p>
                        <p><strong>Usuário:</strong> {selectedInvestmentForDeletion.profiles?.display_name || selectedInvestmentForDeletion.profiles?.email || 'Usuário Desconhecido'}</p>
                        <p><strong>Valor:</strong> ${(selectedInvestmentForDeletion.amount || 0).toLocaleString()}</p>
                        <p><strong>Taxa:</strong> {(selectedInvestmentForDeletion.daily_rate || 0)}%</p>
                      </div>
                      <p className="text-sm text-destructive font-medium mt-2">
                        ⚠️ Esta ação não pode ser desfeita!
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="flex justify-end space-x-2">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setIsIndividualDeleteModalOpen(false);
                    setSelectedInvestmentForDeletion(null);
                  }}
                >
                  Cancelar
                </Button>
                <Button 
                  variant="destructive"
                  onClick={confirmIndividualDeletion}
                  className="bg-destructive hover:bg-destructive/90"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Excluir Investimento
                </Button>
              </div>
            </div>
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

          {/* Seção de Bônus removida */}

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

          <TabsContent value="trading" className="space-y-6">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-card-foreground flex items-center">
                  <Activity className="h-5 w-5 mr-2 text-primary" />
                  Gerenciamento de Trading
                </CardTitle>
                <CardDescription>
                  Libere trading para usuários que estão bloqueados ou resetem cooldowns
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Liberar Trading para Usuário Específico */}
                <div className="border rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <Shield className="h-5 w-5 mr-2 text-trading-green" />
                    Liberar Trading por Usuário
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                    <div className="space-y-2">
                      <Label htmlFor="userEmail">Email do Usuário</Label>
                      <Input
                        id="userEmail"
                        type="email"
                        placeholder="usuario@exemplo.com"
                        value={selectedUserEmail}
                        onChange={(e) => setSelectedUserEmail(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="tradingAction">Ação</Label>
                      <select
                        id="tradingAction"
                        className="w-full px-3 py-2 border border-border rounded-md"
                        value={tradingAction}
                        onChange={(e) => setTradingAction(e.target.value)}
                      >
                        <option value="reset">Resetar Cooldown</option>
                        <option value="unlock">Liberar Trading</option>
                        <option value="block">Bloquear Trading</option>
                      </select>
                    </div>
                    <Button 
                      onClick={handleTradingAction}
                      className="bg-trading-green hover:bg-trading-green/90"
                    >
                      Executar Ação
                    </Button>
                  </div>
                </div>

                {/* Liberar Trading Global */}
                <div className="border rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <Activity className="h-5 w-5 mr-2 text-warning" />
                    Ações Globais de Trading
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Button 
                      onClick={handleResetAllCooldowns}
                      variant="outline"
                      className="border-warning text-warning hover:bg-warning/10"
                    >
                      <Activity className="h-4 w-4 mr-2" />
                      Resetar Todos os Cooldowns
                    </Button>
                    <Button 
                      onClick={handleUnlockAllTrading}
                      variant="outline" 
                      className="border-trading-green text-trading-green hover:bg-trading-green/10"
                    >
                      <Shield className="h-4 w-4 mr-2" />
                      Liberar Trading para Todos
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    ⚠️ Ações globais afetam todos os usuários do sistema
                  </p>
                </div>

                {/* Status de Trading dos Usuários */}
                <div className="border rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <Users className="h-5 w-5 mr-2 text-primary" />
                    Status de Trading por Usuário
                  </h3>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {users.slice(0, 10).map((user) => (
                      <div key={user.id} className="flex items-center justify-between p-2 bg-muted/30 rounded">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-trading-green"></div>
                          <span className="text-sm font-medium">{user.display_name}</span>
                          <span className="text-xs text-muted-foreground">({user.email})</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs">
                            Trading Ativo
                          </Badge>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleResetUserCooldown(user.email)}
                            className="h-6 px-2 text-xs"
                          >
                            Reset
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Exclusão de Investimentos */}
                <div className="border rounded-lg p-4 border-destructive/20 bg-destructive/5">
                  <h3 className="text-lg font-semibold mb-4 flex items-center text-destructive">
                    <Trash2 className="h-5 w-5 mr-2" />
                    Exclusão de Investimentos
                  </h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="deleteInvestmentEmail" className="text-sm font-medium">
                          Email do Usuário
                        </Label>
                        <Input
                          id="deleteInvestmentEmail"
                          type="email"
                          placeholder="usuario@exemplo.com"
                          value={deleteInvestmentEmail}
                          onChange={(e) => setDeleteInvestmentEmail(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="deleteInvestmentReason" className="text-sm font-medium">
                          Motivo da Exclusão
                        </Label>
                        <Input
                          id="deleteInvestmentReason"
                          placeholder="Ex: Violação de termos, fraude, etc."
                          value={deleteInvestmentReason}
                          onChange={(e) => setDeleteInvestmentReason(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Button 
                        onClick={() => {
                          console.log('🔓 Abrindo modal de exclusão...');
                          console.log('📧 Email:', deleteInvestmentEmail);
                          console.log('📝 Motivo:', deleteInvestmentReason);
                          setIsDeleteInvestmentModalOpen(true);
                        }}
                        variant="destructive"
                        className="bg-destructive hover:bg-destructive/90"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Excluir Investimentos
                      </Button>
                      <Button 
                        onClick={testTableAccess}
                        variant="outline"
                        size="sm"
                        className="text-xs"
                      >
                        🧪 Testar Acesso
                      </Button>
                      <Button 
                        onClick={testDirectDeletion}
                        variant="outline"
                        size="sm"
                        className="text-xs"
                      >
                        🗑️ Testar Exclusão
                      </Button>
                      <Button 
                        onClick={checkTableStructure}
                        variant="outline"
                        size="sm"
                        className="text-xs"
                      >
                        🔍 Verificar Estrutura
                      </Button>
                      <Button 
                        onClick={simpleTest}
                        variant="outline"
                        size="sm"
                        className="text-xs"
                      >
                        🧪 Teste Simples
                      </Button>
                      <Button 
                        onClick={testProfilesStructure}
                        variant="outline"
                        size="sm"
                        className="text-xs"
                      >
                        🔍 Testar Estrutura Profiles
                      </Button>
                      <Button 
                        onClick={testProfilesUpdate}
                        variant="outline"
                        size="sm"
                        className="text-xs"
                      >
                        🧪 Testar Update Profiles
                      </Button>
                      <Button 
                        onClick={testAddPartner}
                        variant="outline"
                        size="sm"
                        className="text-xs"
                      >
                        🧪 Testar Adicionar Sócio
                      </Button>
                      <Button 
                        onClick={testBasicProfilesAccess}
                        variant="outline"
                        size="sm"
                        className="text-xs"
                      >
                        🔍 Testar Acesso Profiles
                      </Button>
                      <Button 
                        onClick={testRoleConstraint}
                        variant="outline"
                        size="sm"
                        className="text-xs"
                      >
                        🔍 Testar Constraint Role
                      </Button>
                      <Button 
                        onClick={checkPartnersInDatabase}
                        variant="outline"
                        size="sm"
                        className="text-xs"
                      >
                        🔍 Verificar Sócios no BD
                      </Button>
                      <Button 
                        onClick={checkAdminSouza}
                        variant="outline"
                        size="sm"
                        className="text-xs"
                      >
                        🔍 Verificar Admin Souza
                      </Button>
                      <Button 
                        onClick={checkConstraint}
                        variant="outline"
                        size="sm"
                        className="text-xs"
                      >
                        🔍 Verificar Partner
                      </Button>

                      <Button 
                        onClick={confirmarEmailsExistentes}
                        variant="outline"
                        size="sm"
                        className="text-xs"
                      >
                        ✅ Confirmar Emails
                      </Button>
                      <Button 
                        onClick={confirmarEmailsExistentes}
                        variant="outline"
                        size="sm"
                        className="text-xs"
                      >
                        ✅ Confirmar Emails
                      </Button>
                      <Button 
                        onClick={addPartnerByEmail}
                        variant="outline"
                        size="sm"
                        className="text-xs"
                      >
                        ➕ Adicionar Sócio
                      </Button>
                      <Button 
                        onClick={updatePartnerCommission}
                        variant="outline"
                        size="sm"
                        className="text-xs"
                      >
                        💰 Ajustar Comissão
                      </Button>
                      <Button 
                        onClick={removePartnerByEmail}
                        variant="outline"
                        size="sm"
                        className="text-xs"
                      >
                        🗑️ Remover Sócio
                      </Button>
                      <Button 
                        onClick={loadActiveInvestments}
                        variant="outline"
                        size="sm"
                        className="text-xs"
                      >
                        🔄 Recarregar Planos
                      </Button>
                      <div className="text-xs text-muted-foreground">
                        ⚠️ Esta ação é irreversível e excluirá TODOS os investimentos do usuário
                      </div>
                    </div>
                  </div>
                </div>

                {/* Planos Ativos */}
                <div className="border rounded-lg p-4 border-primary/20 bg-primary/5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold flex items-center text-primary">
                      <Bot className="h-5 w-5 mr-2" />
                      Planos Ativos ({activeInvestments.length})
                    </h3>
                    <Button 
                      onClick={loadActiveInvestments}
                      variant="outline"
                      size="sm"
                      disabled={isLoadingInvestments}
                      className="text-xs"
                    >
                      {isLoadingInvestments ? (
                        <>
                          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-primary mr-2"></div>
                          Carregando...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="h-3 w-3 mr-2" />
                          Atualizar
                        </>
                      )}
                    </Button>
                  </div>
                  
                  {isLoadingInvestments ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                      <span className="ml-2 text-muted-foreground">Carregando investimentos...</span>
                    </div>
                  ) : activeInvestments.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Bot className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Nenhum plano ativo encontrado</p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {activeInvestments.map((investment) => (
                        <div 
                          key={investment.id} 
                          className="flex items-center justify-between p-3 bg-card border border-border rounded-lg hover:border-primary/30 transition-colors"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-3">
                              <div className="w-2 h-2 rounded-full bg-trading-green"></div>
                              <div>
                                <div className="font-medium text-sm">
                                  Plano de Investimento
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {investment.profiles?.display_name || investment.profiles?.email || `ID: ${investment.user_id}`}
                                </div>
                              </div>
                            </div>
                            <div className="mt-2 grid grid-cols-3 gap-4 text-xs">
                              <div>
                                <span className="text-muted-foreground">Valor:</span>
                                <div className="font-medium text-trading-green">
                                  ${(investment.amount || 0).toLocaleString()}
                                </div>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Taxa:</span>
                                <div className="font-medium text-primary">
                                  {(investment.daily_rate || 0)}%
                                </div>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Status:</span>
                                <div className="font-medium">
                                  <Badge variant="default" className="text-xs">
                                    {investment.status || 'Ativo'}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2 ml-4">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openIndividualDeleteModal(investment)}
                              className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="partners" className="space-y-6">
            {/* Dashboard VIP/Sócio */}
            <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border-purple-500/20">
              <CardHeader>
                <CardTitle className="flex items-center text-purple-600">
                  <Crown className="h-6 w-6 mr-2" />
                  🏆 Você é VIP - Dashboard de Sócio
                </CardTitle>
                <CardDescription>
                  Gerencie sócios e acompanhe ganhos baseados no faturamento total
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card className="bg-gradient-to-br from-green-500/10 to-green-600/10 border-green-500/20">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-green-600">Total de Depósitos</p>
                          <p className="text-3xl font-bold text-green-600">${totalDeposits.toLocaleString()}</p>
                          <p className="text-xs text-muted-foreground">Faturamento total aprovado</p>
                        </div>
                        <DollarSign className="h-8 w-8 text-green-600" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border-blue-500/20">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-blue-600">Comissão Padrão</p>
                          <p className="text-3xl font-bold text-blue-600">{partnerCommission}%</p>
                          <p className="text-xs text-muted-foreground">Por depósito aprovado</p>
                        </div>
                        <Percent className="h-8 w-8 text-blue-600" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border-purple-500/20">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-purple-600">Ganhos Totais</p>
                          <p className="text-3xl font-bold text-purple-600">${partnerEarnings.toLocaleString()}</p>
                          <p className="text-xs text-muted-foreground">Distribuído entre sócios</p>
                        </div>
                        <TrendingUp className="h-8 w-8 text-purple-600" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Gerenciamento de Sócios */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Lista de Usuários */}
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center">
                          <Users className="h-5 w-5 mr-2" />
                          Todos os Usuários ({allUsers.length})
                        </CardTitle>
                        <Button 
                          onClick={loadAllUsers}
                          variant="outline"
                          size="sm"
                          disabled={isLoadingUsers}
                        >
                          <RefreshCw className={`h-4 w-4 mr-2 ${isLoadingUsers ? 'animate-spin' : ''}`} />
                          Atualizar
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {isLoadingUsers ? (
                        <div className="text-center py-8">
                          <RefreshCw className="h-8 w-8 mx-auto mb-4 animate-spin" />
                          <p className="text-muted-foreground">Carregando usuários...</p>
                        </div>
                      ) : allUsers.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <p>Nenhum usuário encontrado</p>
                        </div>
                      ) : (
                        <div className="space-y-3 max-h-96 overflow-y-auto">
                          {allUsers.map((user) => (
                            <div 
                              key={user.user_id} 
                              className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border"
                            >
                              <div className="flex items-center gap-3">
                                <div className={`w-2 h-2 rounded-full ${
                                  user.role === 'partner' ? 'bg-purple-500' : 
                                  user.role === 'admin' ? 'bg-red-500' : 'bg-green-500'
                                }`}></div>
                                <div>
                                  <div className="font-medium">
                                    {user.display_name || user.username || 'Usuário'}
                                  </div>
                                  <div className="text-sm text-muted-foreground">
                                    {user.email}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    Saldo: ${user.balance || 0}
                                  </div>
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-2">
                                <Badge variant={
                                  user.role === 'partner' ? 'default' :
                                  user.role === 'admin' ? 'destructive' : 'secondary'
                                }>
                                  {user.role === 'partner' ? 'Sócio' :
                                   user.role === 'admin' ? 'Admin' : 'Usuário'}
                                </Badge>
                                
                                {user.role !== 'partner' && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => openPartnerSelectionModal(user)}
                                    className="h-8 w-8 p-0 text-purple-600 hover:text-purple-700"
                                    title={user.role === 'admin' ? "Tornar Admin Sócio" : "Selecionar como sócio e definir comissão"}
                                  >
                                    <Crown className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Configurações */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Settings className="h-5 w-5 mr-2" />
                        Configurações de Comissão
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="defaultCommission">Comissão Padrão (%)</Label>
                        <Input
                          id="defaultCommission"
                          type="number"
                          min="0.1"
                          max="10"
                          step="0.1"
                          value={partnerCommission}
                          onChange={(e) => setPartnerCommission(parseFloat(e.target.value) || 1.0)}
                        />
                        <p className="text-xs text-muted-foreground">
                          Comissão padrão aplicada a novos sócios
                        </p>
                      </div>
                      <Button 
                        onClick={calculatePartnerEarnings}
                        variant="outline"
                        className="w-full"
                      >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Recalcular Ganhos
                      </Button>
                      
                      <Button 
                        onClick={() => {
                          setSelectedUserForPartner(null);
                          setCustomCommission(partnerCommission);
                          setIsPartnerSelectionModalOpen(true);
                        }}
                        className="w-full bg-purple-600 hover:bg-purple-700"
                      >
                        <Crown className="h-4 w-4 mr-2" />
                        Adicionar Sócio Manualmente
                      </Button>
                    </CardContent>
                  </Card>
                </div>

                {/* Lista de Sócios */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center">
                        <Users className="h-5 w-5 mr-2" />
                        Sócios Ativos ({partners.length})
                      </CardTitle>
                      <Button 
                        onClick={loadPartners}
                        variant="outline"
                        size="sm"
                      >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Atualizar
                      </Button>
                      <Button 
                        onClick={checkPartnersInDatabase}
                        variant="outline"
                        size="sm"
                        className="ml-2"
                      >
                        🔍 Verificar BD
                      </Button>
                      <Button 
                        onClick={checkAdminSouza}
                        variant="outline"
                        size="sm"
                        className="ml-2"
                      >
                        🔍 Admin Souza
                      </Button>
                      <Button 
                        onClick={simpleUpdateAdminSouza}
                        variant="outline"
                        size="sm"
                        className="ml-2"
                      >
                        🎯 Update Simples
                      </Button>
                      <Button 
                        onClick={forceRefreshPartners}
                        variant="outline"
                        size="sm"
                        className="ml-2"
                      >
                        🔄 Força Refresh
                      </Button>
                      <Button 
                        onClick={applyMigrationsAndFix}
                        variant="outline"
                        size="sm"
                        className="ml-2"
                      >
                        🔧 Aplicar Migrações
                      </Button>
                      <Button 
                        onClick={forceUpdateAdminSouza}
                        variant="outline"
                        size="sm"
                        className="ml-2"
                      >
                        🔄 Forçar Update Souza
                      </Button>
                      <Button 
                        onClick={simpleUpdateAdminSouza}
                        variant="outline"
                        size="sm"
                        className="ml-2"
                      >
                        🎯 Update Simples
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {partners.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>Nenhum sócio encontrado</p>
                        <p className="text-sm">Adicione usuários como sócios para começar</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {partners.map((partner) => (
                          <div 
                            key={partner.user_id} 
                            className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                              <div>
                                <div className="font-medium">
                                  {partner.display_name || partner.username || 'Usuário'}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {partner.email}
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-4">
                              <div className="text-right">
                                <div className="font-medium text-purple-600">
                                  {partnerCommission}%
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  Comissão Padrão
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedPartner(partner);
                                    setIsNewPartner(false);
                                    setIsPartnerModalOpen(true);
                                  }}
                                  className="h-8 w-8 p-0"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removePartner(partner.user_id, partner.display_name || partner.email)}
                                  className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
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

      {/* Modal para Alterar Senha */}
      <Dialog open={showChangePasswordModal} onOpenChange={setShowChangePasswordModal}>
        <DialogContent className="bg-gray-900 border border-gray-700 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-xl font-bold text-blue-400 flex items-center justify-center gap-2">
              <Key className="h-6 w-6" />
              Alterar Senha do Usuário
            </DialogTitle>
          </DialogHeader>
          
          {selectedUserForPassword && (
            <div className="bg-blue-500/10 rounded-lg p-3 border border-blue-500/30 mb-4">
              <div className="text-blue-400 text-sm">
                <strong>Usuário:</strong> {selectedUserForPassword.name}
              </div>
              <div className="text-blue-300 text-xs">
                {selectedUserForPassword.email}
              </div>
            </div>
          )}
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newPassword" className="text-gray-300">Nova Senha</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Digite a nova senha"
                className="bg-gray-800 border-gray-600 text-white"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-gray-300">Confirmar Nova Senha</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirme a nova senha"
                className="bg-gray-800 border-gray-600 text-white"
              />
            </div>
            
            <div className="bg-blue-500/10 rounded-lg p-3 border border-blue-500/30">
              <div className="text-blue-400 text-sm">
                <strong>Requisitos da senha:</strong>
                <ul className="mt-2 space-y-1 text-xs">
                  <li>• Mínimo 6 caracteres</li>
                  <li>• Recomendado: letras, números e símbolos</li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="flex gap-3 pt-4">
            <Button
              onClick={() => {
                setShowChangePasswordModal(false);
                setNewPassword("");
                setConfirmPassword("");
                setSelectedUserForPassword(null);
              }}
              className="flex-1 bg-gray-700 hover:bg-gray-600"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleChangePassword}
              disabled={isChangingPassword || !newPassword || !confirmPassword}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
            >
              {isChangingPassword ? 'Alterando...' : 'Alterar Senha'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal para Acessar Conta */}
      <Dialog open={showAccessAccountModal} onOpenChange={setShowAccessAccountModal}>
        <DialogContent className="bg-gray-900 border border-gray-700 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-xl font-bold text-green-400 flex items-center justify-center gap-2">
              <User className="h-6 w-6" />
              Acessar Conta do Usuário
            </DialogTitle>
          </DialogHeader>
          
          {selectedUserForAccess && (
            <div className="bg-green-500/10 rounded-lg p-3 border border-green-500/30 mb-4">
              <div className="text-green-400 text-sm">
                <strong>Usuário:</strong> {selectedUserForAccess.name}
              </div>
              <div className="text-green-300 text-xs">
                {selectedUserForAccess.email}
              </div>
              <div className="text-green-300 text-xs mt-1">
                <strong>Status:</strong> {selectedUserForAccess.status === 'active' ? 'Ativo' : 'Inativo'}
              </div>
            </div>
          )}
          
          <div className="space-y-4">
            <div className="bg-yellow-500/10 rounded-lg p-3 border border-yellow-500/30">
              <div className="text-yellow-400 text-sm">
                <strong>⚠️ Aviso:</strong>
                <ul className="mt-2 space-y-1 text-xs">
                  <li>• Você será redirecionado para o dashboard como este usuário</li>
                  <li>• Um banner vermelho aparecerá no topo indicando o modo admin</li>
                  <li>• Use o botão "Voltar ao Admin" para retornar ao painel</li>
                  <li>• Todas as ações serão registradas no log de administração</li>
                </ul>
              </div>
            </div>
            
            <div className="bg-blue-500/10 rounded-lg p-3 border border-blue-500/30">
              <div className="text-blue-400 text-sm">
                <strong>O que você poderá fazer:</strong>
                <ul className="mt-2 space-y-1 text-xs">
                  <li>• Navegar por todas as páginas como o usuário</li>
                  <li>• Visualizar investimentos e transações</li>
                  <li>• Verificar configurações da conta</li>
                  <li>• Testar funcionalidades do sistema</li>
                  <li>• Gerar relatórios de atividade</li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="flex gap-3 pt-4">
            <Button
              onClick={() => {
                setShowAccessAccountModal(false);
                setSelectedUserForAccess(null);
              }}
              className="flex-1 bg-gray-700 hover:bg-gray-600"
            >
              Cancelar
            </Button>
            <Button
              onClick={confirmAccessAccount}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              Confirmar Acesso
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Admin;