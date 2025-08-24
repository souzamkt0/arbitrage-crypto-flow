import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
  User,
  Copy,
  ExternalLink,
  Calculator,
  BarChart3,
  PieChart,
  Target,
  Zap,
  Database,
  Monitor,
  Globe,
  Ban
} from "lucide-react";
import { TradingConfig } from "@/components/TradingConfig";

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
  display_name?: string;
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
  status: "pending" | "paid" | "rejected" | "completed";
  holderName?: string;
  cpf?: string;
  senderName?: string;
  date: string;
  pixCode?: string;
  walletAddress?: string;
  source?: string;
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
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const { user, isAdmin } = useAuth();
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

  const [depositFilter, setDepositFilter] = useState<"all" | "pending" | "paid" | "rejected" | "completed">("all");
  const [withdrawalFilter, setWithdrawalFilter] = useState<"all" | "pending" | "approved" | "rejected" | "processing">("all");
  
  const [adminSettings, setAdminSettings] = useState({
    referralPercent: 5,
    residualPercent: 10,
    allowReferrals: true,
    allowResiduals: true,
    allowGamification: true,
    postReward: 0.003,
    likeReward: 0.001,
    commentReward: 0.002,
    monthlyLimit: 50,
    spamWarning: "⚠️ AVISO: Spam será banido! Mantenha-se ativo de forma natural para ganhar recompensas.",
    pixEnabled: true,
    usdtEnabled: true,
    minimumDeposit: 50,
    maximumDeposit: 10000,
    autoApproval: false,
    withdrawalFeePixPercent: 2,
    withdrawalFeeUsdtPercent: 5,
    pixDailyLimit: 2000,
    usdtDailyLimit: 10000,
    withdrawalProcessingHours: "09:00-17:00",
    withdrawalBusinessDays: true,
    alphabotEnabled: true,
    alphabotDailyRate: 0.05,
    alphabotOperationDuration: 60,
    alphabotMaxOperations: 12,
    alphabotAutoRestart: true,
    alphabotMinInvestment: 100,
    alphabotMaxInvestment: 10000,
    alphabotRiskLevel: "medium"
  });
  
  const [selectedUserEmail, setSelectedUserEmail] = useState("");
  const [tradingAction, setTradingAction] = useState("reset");
  const [deleteInvestmentEmail, setDeleteInvestmentEmail] = useState("");
  const [deleteInvestmentReason, setDeleteInvestmentReason] = useState("");
  const [isDeleteInvestmentModalOpen, setIsDeleteInvestmentModalOpen] = useState(false);
  const [activeInvestments, setActiveInvestments] = useState<any[]>([]);
  const [isLoadingInvestments, setIsLoadingInvestments] = useState(false);
  const [selectedInvestmentForDeletion, setSelectedInvestmentForDeletion] = useState<any>(null);
  const [isIndividualDeleteModalOpen, setIsIndividualDeleteModalOpen] = useState(false);
  const [confTradingSearchTerm, setConfTradingSearchTerm] = useState("");
  const [selectedInvestments, setSelectedInvestments] = useState<string[]>([]);
  const [isMultiDeleteModalOpen, setIsMultiDeleteModalOpen] = useState(false);
  
  const [partners, setPartners] = useState<any[]>([]);
  const [selectedPartner, setSelectedPartner] = useState<any>(null);
  const [isPartnerModalOpen, setIsPartnerModalOpen] = useState(false);
  const [isNewPartner, setIsNewPartner] = useState(false);
  const [partnerCommission, setPartnerCommission] = useState(1.0);
  const [totalDeposits, setTotalDeposits] = useState(0);
  const [partnerEarnings, setPartnerEarnings] = useState(0);
  
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [isUserSelectionModalOpen, setIsUserSelectionModalOpen] = useState(false);
  
  const [selectedUserForPartner, setSelectedUserForPartner] = useState<any>(null);
  const [customCommission, setCustomCommission] = useState(1.0);
  const [isPartnerSelectionModalOpen, setIsPartnerSelectionModalOpen] = useState(false);
  const [deletingUser, setDeletingUser] = useState<string | null>(null);
  
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [selectedUserForPassword, setSelectedUserForPassword] = useState<any>(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showAccessAccountModal, setShowAccessAccountModal] = useState(false);
  const [selectedUserForAccess, setSelectedUserForAccess] = useState<any>(null);
  
  const [showDeleteUserModal, setShowDeleteUserModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState<any>(null);
  
  // Balance management states
  const [showBalanceModal, setShowBalanceModal] = useState(false);
  const [selectedUserForBalance, setSelectedUserForBalance] = useState<any>(null);
  const [balanceOperation, setBalanceOperation] = useState<'add' | 'subtract'>('add');
  const [balanceAmount, setBalanceAmount] = useState('');
  const [balanceReason, setBalanceReason] = useState('');
  const [isUpdatingBalance, setIsUpdatingBalance] = useState(false);

  const { toast } = useToast();

  // Load investment plans function
  const loadInvestmentPlans = async () => {
    try {
      const { data: plans, error } = await supabase
        .from('investment_plans')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading investment plans:', error);
        toast({
          title: "Erro",
          description: "Erro ao carregar planos de investimento",
          variant: "destructive",
        });
        return;
      }

      const formattedPlans = plans?.map(plan => ({
        id: plan.id,
        name: plan.name,
        dailyRate: plan.daily_rate,
        minimumAmount: plan.minimum_amount,
        maxInvestmentAmount: plan.max_investment_amount,
        duration: plan.duration_days,
        description: plan.description,
        status: plan.status,
        requiredReferrals: plan.minimum_indicators
      })) || [];

      setInvestmentPlans(formattedPlans);
    } catch (error) {
      console.error('Error loading investment plans:', error);
      toast({
        title: "Erro",
        description: "Erro interno ao carregar planos",
        variant: "destructive",
      });
    }
  };

  // Delete plan function
  const deletePlan = async (planId: string) => {
    try {
      const { error } = await supabase
        .from('investment_plans')
        .delete()
        .eq('id', planId);

      if (error) {
        console.error('Error deleting plan:', error);
        toast({
          title: "Erro",
          description: "Erro ao excluir plano de investimento",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Sucesso",
        description: "Plano de investimento excluído com sucesso",
      });

      // Reload plans
      await loadInvestmentPlans();
    } catch (error) {
      console.error('Error deleting plan:', error);
      toast({
        title: "Erro",
        description: "Erro interno ao excluir plano",
        variant: "destructive",
      });
    }
  };

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
  
  const handleAccessAccount = (user: any) => {
    setSelectedUserForAccess(user);
    setShowAccessAccountModal(true);
  };
  
  const confirmAccessAccount = async () => {
    if (!selectedUserForAccess) return;
    
    try {
      const adminInfo = {
        id: user?.id,
        email: user?.email,
        role: 'admin',
        timestamp: new Date().toISOString()
      };
      
      localStorage.setItem('admin_session_backup', JSON.stringify(adminInfo));
      
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
      localStorage.setItem('admin_impersonation_mode', 'true');
      
      toast({
        title: "Acesso Concedido",
        description: `Acessando conta de ${selectedUserForAccess.name}. Use o botão "Voltar ao Admin" para retornar.`,
        variant: "default",
      });
      
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

  // Balance management functions
  const handleBalanceUpdate = async () => {
    if (!selectedUserForBalance || !balanceAmount || !balanceReason.trim()) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive",
      });
      return;
    }

    const amount = parseFloat(balanceAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Erro",
        description: "Digite um valor válido maior que zero",
        variant: "destructive",
      });
      return;
    }

    setIsUpdatingBalance(true);

    try {
      // Calculate new balance
      const currentBalance = selectedUserForBalance.balance;
      const newBalance = balanceOperation === 'add' 
        ? currentBalance + amount 
        : currentBalance - amount;

      if (newBalance < 0) {
        toast({
          title: "Erro",
          description: "O saldo não pode ficar negativo",
          variant: "destructive",
        });
        setIsUpdatingBalance(false);
        return;
      }

      // Call the admin function to update balance
      const { data: result, error } = await supabase.rpc('admin_update_user_balance', {
        target_user_id: selectedUserForBalance.id,
        new_balance: newBalance,
        admin_email: user?.email || 'admin@clean.com',
        reason: `${balanceOperation === 'add' ? 'Adição' : 'Subtração'} de saldo: ${balanceReason}`
      });

      if (error) {
        console.error('Error updating balance:', error);
        toast({
          title: "Erro",
          description: `Erro ao atualizar saldo: ${error.message}`,
          variant: "destructive",
        });
        return;
      }

      if (result?.success) {
        toast({
          title: "Sucesso",
          description: `Saldo ${balanceOperation === 'add' ? 'adicionado' : 'subtraído'} com sucesso!`,
        });

        // Update local state
        const updatedUsers = users.map(u => 
          u.id === selectedUserForBalance.id 
            ? { ...u, balance: newBalance }
            : u
        );
        setUsers(updatedUsers);
        setSelectedUserForBalance({ ...selectedUserForBalance, balance: newBalance });

        // Reload data to get updated transactions
        await loadAdminData();

        // Reset form
        setBalanceAmount('');
        setBalanceReason('');
        setShowBalanceModal(false);
      } else {
        toast({
          title: "Erro",
          description: result?.error || "Erro desconhecido ao atualizar saldo",
          variant: "destructive",
        });
      }

    } catch (error: any) {
      console.error('Error updating balance:', error);
      toast({
        title: "Erro",
        description: "Erro interno ao atualizar saldo",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingBalance(false);
    }
  };

  // Sync withdrawal balances function
  const syncWithdrawalBalances = async () => {
    try {
      toast({
        title: "Sincronizando...",
        description: "Sincronizando saldos de saque de todos os usuários",
      });

      const { data: result, error } = await supabase.rpc('sync_all_withdrawal_balances');

      if (error) {
        console.error('Error syncing withdrawal balances:', error);
        toast({
          title: "Erro",
          description: `Erro ao sincronizar saldos: ${error.message}`,
          variant: "destructive",
        });
        return;
      }

      if (result?.success) {
        toast({
          title: "Sucesso",
          description: `${result.users_processed} usuários sincronizados com sucesso!`,
        });

        // Reload data to show updated balances
        await loadAdminData();
      } else {
        toast({
          title: "Erro",
          description: result?.error || "Erro desconhecido ao sincronizar saldos",
          variant: "destructive",
        });
      }

    } catch (error: any) {
      console.error('Error syncing withdrawal balances:', error);
      toast({
        title: "Erro",
        description: "Erro interno ao sincronizar saldos",
        variant: "destructive",
      });
    }
  };

  // Sync user specific withdrawal balance
  const syncUserWithdrawalBalance = async (userId: string) => {
    try {
      const { data: result, error } = await supabase.rpc('sync_user_withdrawal_balance', {
        target_user_id: userId
      });

      if (error) {
        console.error('Error syncing user withdrawal balance:', error);
        toast({
          title: "Erro",
          description: `Erro ao sincronizar saldo: ${error.message}`,
          variant: "destructive",
        });
        return;
      }

      if (result?.success) {
        toast({
          title: "Saldo Sincronizado",
          description: `Saldo disponível: R$ ${result.available_withdrawal_balance.toFixed(2)}`,
        });

        // Reload data to show updated balances
        await loadAdminData();
      } else {
        toast({
          title: "Erro",
          description: result?.error || "Erro desconhecido ao sincronizar saldo",
          variant: "destructive",
        });
      }

    } catch (error: any) {
      console.error('Error syncing user withdrawal balance:', error);
      toast({
        title: "Erro",
        description: "Erro interno ao sincronizar saldo do usuário",
        variant: "destructive",
      });
    }
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
  const loadAdminData = async () => {
    if (!user) return;

      try {
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

        // Carregar dados de depósitos das duas tabelas
        const { data: depositsData } = await supabase
          .from('deposits')
          .select('*')
          .order('created_at', { ascending: false });

        const { data: digitopayDeposits } = await supabase
          .from('digitopay_transactions')
          .select('*')
          .eq('type', 'deposit')
          .order('created_at', { ascending: false });

        // Combinar os depósitos de ambas as tabelas
        const allDeposits = [];
        
        if (depositsData) {
          const formattedDeposits = depositsData.map(deposit => ({
            id: deposit.id,
            userId: deposit.user_id,
            userName: 'User',
            amount: deposit.amount_usd,
            amountBRL: deposit.amount_brl || 0,
            type: deposit.type as "pix" | "usdt",
            status: deposit.status as "pending" | "paid" | "rejected",
            holderName: deposit.holder_name,
            cpf: deposit.cpf,
            senderName: deposit.sender_name,
            date: deposit.created_at,
            pixCode: deposit.pix_code,
            walletAddress: deposit.wallet_address,
            source: 'deposits'
          }));
          allDeposits.push(...formattedDeposits);
        }

        if (digitopayDeposits) {
          const formattedDigitoPayDeposits = digitopayDeposits.map(deposit => ({
            id: deposit.id,
            userId: deposit.user_id,
            userName: deposit.person_name || 'User',
            amount: deposit.amount,
            amountBRL: deposit.amount_brl || 0,
            type: 'pix' as "pix" | "usdt",
            status: deposit.status === 'completed' ? 'paid' : deposit.status as "pending" | "paid" | "rejected",
            holderName: deposit.person_name,
            cpf: deposit.person_cpf,
            senderName: deposit.person_name,
            date: deposit.created_at,
            pixCode: deposit.pix_code,
            walletAddress: null,
            source: 'digitopay'
          }));
          allDeposits.push(...formattedDigitoPayDeposits);
        }

        // Ordenar por data
        allDeposits.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setDeposits(allDeposits);

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

  // Load data on component mount and user change
  useEffect(() => {
    loadAdminData();
    
    // Carregar dados a cada 30 segundos para atualizar automaticamente
    const interval = setInterval(() => {
      loadAdminData();
    }, 30000);
    
    return () => clearInterval(interval);
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

  const handleToggleStatus = async (userId: string) => {
    try {
      // Encontrar o usuário atual
      const currentUser = users.find(u => u.id === userId);
      if (!currentUser) {
        toast({
          title: "Erro",
          description: "Usuário não encontrado.",
          variant: "destructive"
        });
        return;
      }

      // Não permitir banir outros admins
      if (currentUser.role === 'admin' && currentUser.id !== user?.id) {
        toast({
          title: "Erro",
          description: "Não é possível alterar status de outros administradores.",
          variant: "destructive"
        });
        return;
      }

      // Alternar status
      const newStatus = currentUser.status === 'active' ? 'inactive' : 'active';

      // Atualizar no banco
      const { error } = await supabase
        .from('profiles')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);

      if (error) {
        console.error('Error updating user status:', error);
        toast({
          title: "Erro",
          description: "Erro ao alterar status do usuário.",
          variant: "destructive"
        });
        return;
      }

      // Atualizar localmente
      setUsers(prevUsers =>
        prevUsers.map(user =>
          user.id === userId
            ? { ...user, status: newStatus }
            : user
        )
      );

      toast({
        title: newStatus === 'active' ? "Usuário ativado" : "Usuário banido",
        description: `Status do usuário alterado para ${newStatus === 'active' ? 'ativo' : 'inativo'}.`,
        variant: "default"
      });

    } catch (error) {
      console.error('Error toggling user status:', error);
      toast({
        title: "Erro",
        description: "Erro ao alterar status do usuário.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (userId === user?.id) {
    toast({
        title: "Erro",
        description: "Você não pode excluir sua própria conta de administrador.",
        variant: "destructive",
      });
      return;
    }

    const userToDelete = users.find(u => u.id === userId);
    if (userToDelete?.email === 'souzamkt0@gmail.com') {
      toast({
        title: "Erro",
        description: "Não é possível excluir a conta de administrador principal.",
        variant: "destructive",
      });
      return;
    }

    setUserToDelete(userToDelete);
    setShowDeleteUserModal(true);
  };

  const confirmDeleteUser = async () => {
    if (!userToDelete) return;

    setDeletingUser(userToDelete.id);
    setShowDeleteUserModal(false);

    try {
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

      try {
        const { error: authError } = await supabase.auth.admin.deleteUser(userToDelete.id);
        if (authError) {
          console.warn('Aviso: Não foi possível excluir usuário da autenticação:', authError);
        }
      } catch (authError) {
        console.warn('Aviso: Erro ao excluir usuário da autenticação:', authError);
      }

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
        // Atualizar todos os campos diretamente no banco
        const { error } = await supabase
          .from('profiles')
          .update({ 
            display_name: selectedUser.name,
            email: selectedUser.email,
            balance: selectedUser.balance,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', selectedUser.id);

        if (error) {
          console.error('Error updating user:', error);
          toast({
            title: "Erro",
            description: "Erro ao atualizar dados do usuário.",
            variant: "destructive"
          });
          return;
        }

        // Registrar transação administrativa se o saldo foi alterado
        const originalUser = users.find(u => u.id === selectedUser.id);
        if (originalUser && originalUser.balance !== selectedUser.balance) {
          try {
            await supabase
              .from('admin_balance_transactions')
              .insert({
                user_id: selectedUser.id,
                admin_user_id: user.id,
                amount_before: originalUser.balance,
                amount_after: selectedUser.balance,
                amount_changed: selectedUser.balance - originalUser.balance,
                transaction_type: 'balance_adjustment',
                reason: 'Ajuste de saldo pelo administrador'
              });
          } catch (logError) {
            console.warn('Erro ao registrar transação administrativa:', logError);
          }
        }

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
          variant: "destructive"
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

      if (action === "approve" && withdrawal.type === "pix") {
        try {
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

  const handleDepositAction = async (depositId: string, action: "approve" | "reject") => {
    try {
      const deposit = deposits.find(d => d.id === depositId);
      if (!deposit) {
        toast({
          title: "Erro",
          description: "Depósito não encontrado.",
          variant: "destructive"
        });
        return;
      }

      const newStatus = action === "approve" ? "paid" : "rejected";
      
      // Atualizar no banco dependendo da origem
      if (deposit.source === 'deposits') {
        const { error } = await supabase
          .from('deposits')
          .update({ 
            status: newStatus,
            updated_at: new Date().toISOString()
          })
          .eq('id', depositId);

        if (error) {
          console.error('Erro ao atualizar depósito:', error);
          toast({
            title: "Erro",
            description: "Erro ao atualizar status do depósito.",
            variant: "destructive"
          });
          return;
        }
      } else if (deposit.source === 'digitopay') {
        const { error } = await supabase
          .from('digitopay_transactions')
          .update({ 
            status: action === "approve" ? "completed" : "rejected",
            updated_at: new Date().toISOString()
          })
          .eq('id', depositId);

        if (error) {
          console.error('Erro ao atualizar transação DigitoPay:', error);
          toast({
            title: "Erro",
            description: "Erro ao atualizar status da transação.",
            variant: "destructive"
          });
          return;
        }
      }

      // Se aprovado, adicionar saldo ao usuário
      if (action === "approve") {
        // Buscar saldo atual do usuário
        const { data: userProfile } = await supabase
          .from('profiles')
          .select('balance')
          .eq('user_id', deposit.userId)
          .single();

        if (userProfile) {
          const newBalance = (userProfile.balance || 0) + deposit.amount;
          
          const { error: balanceError } = await supabase
            .from('profiles')
            .update({ balance: newBalance })
            .eq('user_id', deposit.userId);

          if (balanceError) {
            console.error('Erro ao atualizar saldo:', balanceError);
            toast({
              title: "Aviso",
              description: "Depósito aprovado, mas erro ao atualizar saldo. Verifique manualmente.",
              variant: "destructive"
            });
          }
        }
      }

      // Atualizar localmente
      setDeposits(prev =>
        prev.map(d =>
          d.id === depositId
            ? { ...d, status: newStatus }
            : d
        )
      );
      
      toast({
        title: action === "approve" ? "Depósito aprovado" : "Depósito rejeitado",
        description: `Depósito foi ${action === "approve" ? "aprovado" : "rejeitado"} com sucesso.`,
      });

    } catch (error) {
      console.error('Erro ao processar depósito:', error);
      toast({
        title: "Erro",
        description: "Erro ao processar ação do depósito.",
        variant: "destructive"
      });
    }
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
      
      let deleteError = null;
      
      const { error: directDeleteError } = await supabase
        .from('user_investments')
        .delete()
        .eq('user_id', userProfile.user_id);

      if (directDeleteError) {
        console.log('❌ Erro na exclusão direta:', directDeleteError);
        
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
        } else {
          console.log('✅ Ação administrativa registrada');
        }
      }

      toast({
        title: "Investimentos Excluídos",
        description: `${investments.length} investimentos de ${userProfile.display_name || userProfile.email} foram excluídos com sucesso.`,
      });

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
        allowGamification: loaded.allowGamification !== undefined ? loaded.allowGamification : true,
        postReward: loaded.postReward || 0.003,
        likeReward: loaded.likeReward || 0.001,
        commentReward: loaded.commentReward || 0.002,
        monthlyLimit: loaded.monthlyLimit || 50,
        spamWarning: loaded.spamWarning || "⚠️ AVISO: Spam será banido! Mantenha-se ativo de forma natural para ganhar recompensas.",
        pixEnabled: loaded.pixEnabled !== undefined ? loaded.pixEnabled : true,
        usdtEnabled: loaded.usdtEnabled !== undefined ? loaded.usdtEnabled : true,
        minimumDeposit: loaded.minimumDeposit || 50,
        maximumDeposit: loaded.maximumDeposit || 10000,
        autoApproval: loaded.autoApproval !== undefined ? loaded.autoApproval : false,
        withdrawalFeePixPercent: loaded.withdrawalFeePixPercent || 2,
        withdrawalFeeUsdtPercent: loaded.withdrawalFeeUsdtPercent || 5,
        pixDailyLimit: loaded.pixDailyLimit || 2000,
        usdtDailyLimit: loaded.usdtDailyLimit || 10000,
        withdrawalProcessingHours: loaded.withdrawalProcessingHours || "09:00-17:00",
        withdrawalBusinessDays: loaded.withdrawalBusinessDays !== undefined ? loaded.withdrawalBusinessDays : true,
        alphabotEnabled: loaded.alphabotEnabled !== undefined ? loaded.alphabotEnabled : true,
        alphabotDailyRate: loaded.alphabotDailyRate || 0.05,
        alphabotOperationDuration: loaded.alphabotOperationDuration || 60,
        alphabotMaxOperations: loaded.alphabotMaxOperations || 12,
        alphabotAutoRestart: loaded.alphabotAutoRestart !== undefined ? loaded.alphabotAutoRestart : true,
        alphabotMinInvestment: loaded.alphabotMinInvestment || 100,
        alphabotMaxInvestment: loaded.alphabotMaxInvestment || 10000,
        alphabotRiskLevel: loaded.alphabotRiskLevel || "medium"
      });
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("alphabit_admin_settings", JSON.stringify(adminSettings));
  }, [adminSettings]);

  useEffect(() => {
    loadPartners();
    calculatePartnerEarnings();
    loadAllUsers();
    loadInvestmentPlans();
  }, []);

  useEffect(() => {
    const checkAndLoadInvestments = async () => {
      console.log('🔄 Verificando se deve carregar investimentos...');
      loadActiveInvestments();
    };
    
    checkAndLoadInvestments();
  }, []);

  const loadPartners = async () => {
    try {
      console.log('👥 Carregando sócios da tabela partners...');
      
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

    if (user.role === 'partner') {
      console.log('⚠️ Usuário já é sócio');
      toast({
        title: "Usuário já é sócio",
        description: `${user.display_name || user.email} já possui status de sócio.`,
        variant: "default"
      });
      return;
    }

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

  const addPartnerFromList = async (userId: string, userEmail: string, userName: string) => {
    try {
      console.log('🔍 Adicionando sócio da lista:', { userId, userEmail, userName });
      
      const user = allUsers.find(u => u.user_id === userId);
      if (user?.role === 'partner') {
        toast({
          title: "Usuário já é sócio",
          description: `${userName || userEmail} já possui status de sócio.`,
          variant: "default"
        });
        return;
      }

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

  const openPartnerSelectionModal = (user: any) => {
    console.log('🔄 Abrindo modal de seleção de sócio para:', user);
    setSelectedUserForPartner(user);
    setCustomCommission(partnerCommission);
    setIsPartnerSelectionModalOpen(true);
    console.log('✅ Modal deve estar aberto agora');
  };

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
        commission: customCommission,
        currentUser: user?.email,
        isAdmin: isAdmin
      });

      if (selectedUserForPartner.role === 'partner') {
        toast({
          title: "Usuário já é sócio",
          description: `${selectedUserForPartner.display_name || selectedUserForPartner.email} já possui status de sócio.`,
          variant: "default"
        });
        return;
      }

      if (user?.email === 'souzamkt0@gmail.com') {
        console.log('🔄 Bypass para souzamkt0 - Adicionando sócio diretamente...');
        
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ role: 'partner' })
          .eq('user_id', selectedUserForPartner.user_id);

        if (profileError) {
          console.log('❌ Erro ao atualizar profile:', profileError);
          toast({
            title: "Erro ao atualizar perfil",
            description: `Erro: ${profileError.message}`,
            variant: "destructive"
          });
          return;
        }

        const { error: partnerError } = await supabase
          .from('partners')
          .insert({
            user_id: selectedUserForPartner.user_id,
            email: selectedUserForPartner.email,
            display_name: selectedUserForPartner.display_name || selectedUserForPartner.name,
            commission_percentage: customCommission || 1.0,
            status: 'active'
          });

        if (partnerError) {
          console.log('❌ Erro ao adicionar na tabela partners:', partnerError);
          await supabase
            .from('profiles')
            .update({ role: selectedUserForPartner.role })
            .eq('user_id', selectedUserForPartner.user_id);
          
          toast({
            title: "Erro ao criar sócio",
            description: `Erro: ${partnerError.message}`,
            variant: "destructive"
          });
          return;
        }

        console.log('✅ Sócio adicionado com sucesso via bypass!');
      } else {
        console.log('🔄 Usando função RPC para adicionar sócio:', {
          email: selectedUserForPartner.email,
          commission: customCommission
        });

        const { data: result, error } = await supabase.rpc('add_partner_by_email', {
          partner_email: selectedUserForPartner.email,
          commission_percentage: customCommission || 1.0
        });

        console.log('📊 Resultado da função RPC:', { result, error });

        if (error) {
          console.log('❌ Erro na função RPC:', error);
          toast({
            title: "Erro ao adicionar sócio",
            description: `Erro: ${error.message}`,
            variant: "destructive"
          });
          return;
        }

        if (result && !result.success) {
          toast({
            title: "Erro ao adicionar sócio",
            description: result.error || "Erro desconhecido ao adicionar sócio",
            variant: "destructive"
          });
          return;
        }
      }
      
      toast({
        title: "Sócio Adicionado",
        description: `${selectedUserForPartner.display_name || selectedUserForPartner.email} foi adicionado como sócio com ${customCommission}% de comissão.`,
      });

      setIsPartnerSelectionModalOpen(false);
      setSelectedUserForPartner(null);
      
      console.log('🔄 Recarregando listas...');
      await loadPartners();
      await loadAllUsers();
      
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
      console.log('🔄 Removendo sócio:', { partnerId, partnerName });
      
      // Buscar email do sócio
      const { data: partner, error: partnerError } = await supabase
        .from('partners')
        .select('email')
        .eq('user_id', partnerId)
        .single();
      
      if (partnerError || !partner) {
        console.error('❌ Erro ao buscar sócio:', partnerError);
        toast({
          title: "Erro",
          description: "Sócio não encontrado.",
          variant: "destructive"
        });
        return;
      }
      
      // Obter email do admin atual (padrão admin@clean.com)
      const adminEmail = localStorage.getItem('preferred_admin') || 'admin@clean.com';
      
      // Usar a nova função que funciona com bypass
      const { data: result, error } = await supabase
        .rpc('remove_partner_by_admin', {
          partner_email: partner.email,
          admin_email: adminEmail
        });

      if (error) {
        console.error('❌ Erro ao remover sócio:', error);
        toast({
          title: "Erro",
          description: `Erro ao remover sócio: ${error.message}`,
          variant: "destructive"
        });
        return;
      }

      console.log('📊 Resultado da remoção:', result);
      
      if (result?.success) {
        toast({
          title: "Sócio Removido ✅",
          description: `${partnerName} foi removido como sócio.`,
        });
        
        await loadPartners();
        await loadAllUsers();
      } else {
        toast({
          title: "Erro",
          description: result?.error || "Erro desconhecido ao remover sócio.",
          variant: "destructive"
        });
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

  const testTableAccess = async () => {
    try {
      console.log('🧪 Testando acesso à tabela user_investments...');
      
      const { count, error: countError } = await supabase
        .from('user_investments')
        .select('*', { count: 'exact', head: true });
      
      console.log('📊 Total de investimentos:', { count, countError });
      
      const { data: testData, error: testError } = await supabase
        .from('user_investments')
        .select('*')
        .limit(1);
      
      console.log('🔍 Teste de busca:', { testData, testError });
      
      const { data: structure, error: structureError } = await supabase
        .rpc('get_table_structure', { table_name: 'user_investments' });
      
      console.log('🏗️ Estrutura da tabela:', { structure, structureError });
      
    } catch (error) {
      console.error('❌ Erro no teste de acesso:', error);
    }
  };

  const testDirectDeletion = async () => {
    try {
      console.log('🧪 Testando exclusão direta...');
      
      if (!deleteInvestmentEmail.trim()) {
        console.log('❌ Email vazio para teste');
        return;
      }

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

  const simpleTest = async () => {
    try {
      console.log('🧪 Teste simples - verificando acesso à tabela...');
      
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

  const checkTableStructure = async () => {
    try {
      console.log('🔍 Verificando estrutura da tabela user_investments...');
      
      const { data: rlsInfo, error: rlsError } = await supabase
        .rpc('check_rls_status', { table_name: 'user_investments' });
      
      console.log('🔒 Status RLS:', { rlsInfo, rlsError });
      
      const { data: columns, error: columnsError } = await supabase
        .rpc('get_table_columns', { table_name: 'user_investments' });
      
      console.log('🏗️ Colunas da tabela:', { columns, columnsError });
      
      const { data: policies, error: policiesError } = await supabase
        .rpc('get_table_policies', { table_name: 'user_investments' });
      
      console.log('📋 Políticas da tabela:', { policies, policiesError });
      
    } catch (error) {
      console.error('❌ Erro ao verificar estrutura:', error);
    }
  };

  const testProfilesStructure = async () => {
    try {
      console.log('🔍 Testando estrutura da tabela profiles...');
      
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

  const testProfilesUpdate = async () => {
    try {
      console.log('🧪 Testando permissões de edição completas...');
      
      // Testar sessão atual
      const { data: sessionData } = await supabase.auth.getSession();
      console.log('🔍 Usuário logado:', sessionData?.session?.user?.email);
      
      // Testar leitura básica
      const { data: users, error: readError } = await supabase
        .from('profiles')
        .select('user_id, email, display_name, balance')
        .limit(3);
      
      if (readError) {
        console.log('❌ Erro na leitura:', readError);
        toast({
          title: "Erro de Leitura",
          description: `Sem permissão para ler: ${readError.message}`,
          variant: "destructive"
        });
        return;
      }
      
      console.log('✅ Leitura OK. Usuários encontrados:', users?.length);
      
      if (!users || users.length === 0) {
        toast({
          title: "Sem Dados",
          description: "Nenhum usuário encontrado para teste.",
        });
        return;
      }
      
      // Testar edição
      const testUser = users[0];
      const originalName = testUser.display_name;
      const testName = originalName + ' [teste-admin]';
      
      console.log(`🔄 Testando edição do usuário: ${testUser.email}`);
      
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ display_name: testName })
        .eq('user_id', testUser.user_id);
      
      if (updateError) {
        console.log('❌ Erro na edição:', updateError);
        toast({
          title: "🚫 Sem Permissão de Edição",
          description: `Erro: ${updateError.message}`,
          variant: "destructive"
        });
      } else {
        console.log('✅ Edição bem-sucedida! Revertendo...');
        
        // Reverter
        await supabase
          .from('profiles')
          .update({ display_name: originalName })
          .eq('user_id', testUser.user_id);
        
        toast({
          title: "✅ Permissões OK!",
          description: "Você pode ler e editar usuários. Sistema funcionando!",
        });
        
        // Recarregar dados
        await loadAllUsers();
      }
      
    } catch (error) {
      console.error('❌ Erro no teste:', error);
      toast({
        title: "Erro",
        description: "Erro interno no teste de permissões.",
        variant: "destructive"
      });
    }
  };

  const testAddPartner = async () => {
    try {
      console.log('🧪 Testando adição de sócio específica...');
      
      const testEmail = 'souzamkt0@gmail.com';
      console.log('📧 Testando com email:', testEmail);
      
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

      if (user.role === 'partner') {
        console.log('⚠️ Usuário já é sócio');
        toast({
          title: "Teste - Já é sócio",
          description: `${user.display_name || user.email} já possui status de sócio.`,
          variant: "default"
        });
        return;
      }

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
        
        await loadPartners();
        
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
      
      // Atualizar também o estado principal users para os cards do dashboard
      if (users) {
        const formattedUsers = users.map(profile => ({
          id: profile.user_id,
          name: profile.display_name || profile.username || 'Sem nome',
          username: profile.username || profile.display_name || 'Sem nome',
          email: profile.email || 'no-email',
          role: profile.role as "admin" | "user",
          status: 'active' as "active" | "inactive",
          balance: profile.balance || 0,
          totalProfit: 0,
          joinDate: profile.created_at?.split('T')[0] || '',
          lastLogin: '',
          apiConnected: false
        }));
        setUsers(formattedUsers);
      }
      
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

  const testBasicProfilesAccess = async () => {
    try {
      console.log('🔍 Testando acesso básico à tabela profiles...');
      
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

  const testRoleConstraint = async () => {
    try {
      console.log('🔍 Testando constraint da coluna role...');
      
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

  const checkPartnersInDatabase = async () => {
    try {
      console.log('🔍 Verificando sócios no banco de dados...');
      
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
      
      const partners = allUsers?.filter(user => user.role === 'partner') || [];
      console.log('👥 Sócios encontrados:', partners);
      console.log('📊 Quantidade de sócios:', partners.length);
      
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

  const checkAdminSouza = async () => {
    try {
      console.log('🔍 Verificando especificamente o Admin Souza...');
      
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
      
      const isPartner = adminSouza.role === 'partner';
      console.log('👥 É sócio?', isPartner);
      
      const { data: directPartners, error: directError } = await supabase
        .from('profiles')
        .select('user_id, email, role, display_name')
        .eq('role', 'partner');

      console.log('📊 Sócios diretos da query:', directPartners);
      console.log('❌ Erro da query direta:', directError);
      
      const adminInPartners = directPartners?.some(p => p.user_id === adminSouza.user_id);
      console.log('🔍 Admin Souza está na lista de sócios?', adminInPartners);
      
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

  const checkConstraint = async () => {
    try {
      console.log('🔍 Verificando constraint da coluna role...');
      
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

  const removePartnerByEmail = async () => {
    try {
      const email = prompt('Digite o email do sócio para remover:');
      if (!email) return;

      const confirm = window.confirm(`Tem certeza que deseja remover o sócio ${email}?`);
      if (!confirm) return;

      console.log('🔄 Removendo sócio por email...');
      console.log('📧 Email:', email);

      // Obter email do admin atual (padrão admin@clean.com)
      const adminEmail = localStorage.getItem('preferred_admin') || 'admin@clean.com';

      const { data: result, error } = await supabase
        .rpc('remove_partner_by_admin', {
          partner_email: email,
          admin_email: adminEmail
        });

      if (error) {
        console.error('❌ Erro ao remover sócio:', error);
        toast({
          title: "Erro",
          description: `Erro ao remover sócio: ${error.message}`,
          variant: "destructive"
        });
      } else {
        console.log('✅ Resultado da remoção:', result);
        
        if (result?.success) {
          toast({
            title: "Sucesso! ✅",
            description: result.message,
          });
          
          await loadPartners();
          await loadAllUsers();
        } else {
          toast({
            title: "Erro",
            description: result?.error || "Erro desconhecido",
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

  const confirmarEmailsExistentes = async () => {
    try {
      const confirm = window.confirm('Confirmar emails de todos os usuários não confirmados?');
      if (!confirm) return;

      console.log('🔄 Confirmando emails de usuários existentes...');

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

  const simpleUpdateAdminSouza = async () => {
    try {
      console.log('🔄 Tentativa simples de atualizar Admin Souza...');
      
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

      console.log('🔄 Recarregando listas...');
      await loadPartners();
      await loadAllUsers();

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

  const forceUpdateAdminSouza = async () => {
    try {
      console.log('🔄 Forçando atualização do Admin Souza para partner...');
      
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
          
          console.log('🔄 Tentando com SQL direto...');
          const { data: sqlResult, error: sqlError } = await supabase
            .rpc('exec_sql', {
              sql: `UPDATE profiles SET role = 'partner' WHERE email = 'souzamkt0@gmail.com'`
            });

          console.log('📊 Resultado do SQL:', sqlResult);
          console.log('❌ Erro do SQL:', sqlError);

          if (sqlError) {
            console.log('❌ SQL falhou:', sqlError);
            
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

      console.log('🔄 Recarregando listas...');
      await loadPartners();
      await loadAllUsers();

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

  const forceRefreshPartners = async () => {
    try {
      console.log('🔄 Forçando atualização da lista de sócios...');
      
      setPartners([]);
      console.log('🗑️ Estado limpo');
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      await loadPartners();
      console.log('✅ Lista recarregada');
      
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

  const applyMigrationsAndFix = async () => {
    try {
      console.log('🔧 Aplicando migrações e corrigindo problemas...');
      
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
        
        await loadPartners();
        await loadAllUsers();
        
        toast({
          title: "Sucesso!",
          description: "Admin Souza foi atualizado para partner com sucesso!",
        });
        
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

  const loadActiveInvestments = async () => {
    setIsLoadingInvestments(true);
    try {
      console.log('📊 Carregando investimentos ativos usando admin_get_all_investments_fixed...');
      console.log('👤 User atual:', user);
      console.log('🔑 User ID:', user?.id);
      console.log('📧 User email:', user?.email);
      console.log('🛡️ Is admin:', isAdmin);
      
      // Usar a função admin corrigida que traz todos os dados necessários
      const { data: investmentsData, error: investmentsError } = await supabase.rpc('admin_get_all_investments_fixed');

      if (investmentsError) {
        console.error('❌ Erro ao carregar investimentos:', investmentsError);
        console.error('❌ Erro detalhado:', JSON.stringify(investmentsError, null, 2));
        toast({
          title: "Erro",
          description: `Erro ao carregar investimentos: ${investmentsError.message}`,
          variant: "destructive"
        });
        return;
      }

      console.log('📊 Investimentos carregados via admin function:', investmentsData?.length || 0);
      console.log('📊 Dados recebidos:', investmentsData);

      // Mapear os dados para o formato esperado pela tabela
      const activeInvestmentsData = investmentsData?.map((inv: any) => ({
        investment_id: inv.investment_id, // Manter investment_id para compatibilidade
        id: inv.investment_id, // Também manter id por compatibilidade
        user_email: inv.user_email,
        user_name: inv.user_name,
        plan_name: inv.plan_name,
        amount: inv.amount,
        daily_rate: inv.daily_rate,
        total_earned: inv.total_earned || 0,
        status: inv.status,
        created_at: inv.created_at,
        days_remaining: inv.days_remaining
      })).filter(inv => inv.status === 'active') || [];
      
      console.log('✅ Investimentos ativos carregados:', activeInvestmentsData.length);
      setActiveInvestments(activeInvestmentsData);
      
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

  const deleteIndividualInvestment = async (investmentId: string, userEmail: string, investmentName: string) => {
    try {
      console.log('🗑️ Excluindo investimento individual usando admin_cancel_user_investment_dev:', { investmentId, userEmail, investmentName });
      console.log('🗑️ Dados completos do investimento:', selectedInvestmentForDeletion);
      
      // Verificar se temos um ID válido
      if (!investmentId || investmentId === 'undefined') {
        console.error('❌ ID do investimento inválido:', investmentId);
        toast({
          title: "Erro",
          description: "ID do investimento não encontrado. Recarregue a página e tente novamente.",
          variant: "destructive"
        });
        return;
      }
      
      // Usar a função admin temporária para cancelar investimento (modo desenvolvimento)
      const { data: result, error } = await supabase.rpc('admin_cancel_user_investment_dev', {
        investment_id_param: investmentId,
        admin_reason: 'Cancelado pelo administrador via interface admin'
      });

      if (error) {
        console.error('❌ Erro ao cancelar investimento:', error);
        toast({
          title: "Erro",
          description: `Erro ao cancelar investimento: ${error.message}`,
          variant: "destructive"
        });
        return;
      }

      if (!result?.success) {
        console.error('❌ Falha na operação:', result?.error);
        toast({
          title: "Erro",
          description: `Falha ao cancelar: ${result?.error || 'Erro desconhecido'}`,
          variant: "destructive"
        });
        return;
      }

      console.log('✅ Investimento cancelado com sucesso:', result);
      toast({
        title: "Sucesso",
        description: `Investimento cancelado: ${userEmail} - ${investmentName}`,
        variant: "default"
      });

      // Recarregar a lista de investimentos
      await loadActiveInvestments();
      setIsIndividualDeleteModalOpen(false);
      setSelectedInvestmentForDeletion(null);
      
    } catch (error) {
      console.error('❌ Erro interno:', error);
      toast({
        title: "Erro",
        description: "Erro interno do sistema",
        variant: "destructive"
      });
    }
  };

  const openIndividualDeleteModal = (investment: any) => {
    setSelectedInvestmentForDeletion(investment);
    setIsIndividualDeleteModalOpen(true);
  };

  const confirmIndividualDeletion = async () => {
    if (!selectedInvestmentForDeletion) return;

    await deleteIndividualInvestment(
      selectedInvestmentForDeletion.investment_id,
      selectedInvestmentForDeletion.user_email || `ID: ${selectedInvestmentForDeletion.investment_id}`,
      selectedInvestmentForDeletion.plan_name || 'Plano de Investimento'
    );

    setIsIndividualDeleteModalOpen(false);
    setSelectedInvestmentForDeletion(null);
  };

  const deleteMultipleInvestments = async () => {
    if (selectedInvestments.length === 0) return;

    const selectedInvestmentData = activeInvestments.filter(inv => 
      selectedInvestments.includes(inv.investment_id)
    );

    for (const investment of selectedInvestmentData) {
      await deleteIndividualInvestment(
        investment.investment_id,
        investment.user_email || `ID: ${investment.investment_id}`,
        investment.plan_name || 'Plano de Investimento'
      );
    }

    setSelectedInvestments([]);
    setIsMultiDeleteModalOpen(false);
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/50 to-background flex items-center justify-center">
        <Card className="w-96 shadow-2xl border-destructive/20">
          <CardContent className="p-8 text-center">
            <Shield className="h-16 w-16 text-destructive mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-foreground mb-2">Acesso Negado</h1>
            <p className="text-muted-foreground">Você não tem permissão para acessar esta área.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-emerald-500/20 text-emerald-300 border-emerald-500/30";
      case "inactive": return "bg-red-500/20 text-red-300 border-red-500/30";
      case "pending": return "bg-yellow-500/20 text-yellow-300 border-yellow-500/30";
      case "approved": return "bg-green-500/20 text-green-300 border-green-500/30";
      case "paid": return "bg-blue-500/20 text-blue-300 border-blue-500/30";
      case "rejected": return "bg-red-500/20 text-red-300 border-red-500/30";
      case "processing": return "bg-orange-500/20 text-orange-300 border-orange-500/30";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin": return "bg-purple-500/20 text-purple-300 border-purple-500/30";
      case "partner": return "bg-amber-500/20 text-amber-300 border-amber-500/30";
      case "user": return "bg-blue-500/20 text-blue-300 border-blue-500/30";
      default: return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      {/* Modern Header */}
      <div className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Painel Administrativo</h1>
                <p className="text-sm text-muted-foreground">Sistema de Gestão AlphaBit Trading</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
                <Crown className="h-3 w-3 mr-1" />
                Admin
              </Badge>
              <div className="text-right">
                <p className="text-sm font-medium text-foreground">{user?.email}</p>
                <p className="text-xs text-muted-foreground">Última sessão: {new Date().toLocaleDateString('pt-BR')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto p-6">
        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20 hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total de Usuários</p>
                  <p className="text-3xl font-bold text-primary">{users.length}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    +{users.filter(u => u.status === 'active').length} ativos
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-primary/20">
                  <Users className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border-emerald-500/20 hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Depósitos Hoje</p>
                  <p className="text-3xl font-bold text-emerald-400">
                    {deposits.filter(d => d.date.startsWith(new Date().toISOString().split('T')[0])).length}
                  </p>
                  <p className="text-xs text-emerald-300 mt-1">
                    R$ {deposits.filter(d => d.date.startsWith(new Date().toISOString().split('T')[0])).reduce((sum, d) => sum + d.amountBRL, 0).toLocaleString('pt-BR')}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-emerald-500/20">
                  <TrendingUp className="h-6 w-6 text-emerald-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-500/10 to-amber-500/5 border-amber-500/20 hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Saques Pendentes</p>
                  <p className="text-3xl font-bold text-amber-400">
                    {withdrawals.filter(w => w.status === 'pending').length}
                  </p>
                  <p className="text-xs text-amber-300 mt-1">
                    R$ {withdrawals.filter(w => w.status === 'pending').reduce((sum, w) => sum + w.amountBRL, 0).toLocaleString('pt-BR')}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-amber-500/20">
                  <Clock className="h-6 w-6 text-amber-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20 hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Planos Ativos</p>
                  <p className="text-3xl font-bold text-blue-400">
                    {investmentPlans.filter(p => p.status === 'active').length}
                  </p>
                  <p className="text-xs text-blue-300 mt-1">
                    de {investmentPlans.length} total
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-blue-500/20">
                  <Target className="h-6 w-6 text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-11 lg:w-auto lg:grid-cols-11 bg-muted/50 backdrop-blur-sm">
            <TabsTrigger value="overview" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <BarChart3 className="h-4 w-4" />
              Visão Geral
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Users className="h-4 w-4" />
              Usuários
            </TabsTrigger>
            <TabsTrigger value="deposits" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <ArrowDown className="h-4 w-4" />
              Depósitos
            </TabsTrigger>
            <TabsTrigger value="withdrawals" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Wallet className="h-4 w-4" />
              Saques
            </TabsTrigger>
            <TabsTrigger value="balance" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Calculator className="h-4 w-4" />
              Saldo
            </TabsTrigger>
            <TabsTrigger value="plans" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Target className="h-4 w-4" />
              Planos
            </TabsTrigger>
            <TabsTrigger value="partners" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Crown className="h-4 w-4" />
              Sócios
            </TabsTrigger>
            <TabsTrigger value="trading" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Activity className="h-4 w-4" />
              Trading
            </TabsTrigger>
            <TabsTrigger value="conf-trading" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Monitor className="h-4 w-4" />
              Conf Trading
            </TabsTrigger>
            <TabsTrigger value="alphabot" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Bot className="h-4 w-4" />
              AlphaBot
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Settings className="h-4 w-4" />
              Configurações
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Activity */}
              <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-primary" />
                    Atividade Recente
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {adminTransactions.slice(0, 5).map((transaction, index) => (
                      <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/30">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-full bg-primary/20">
                            <DollarSign className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-foreground">{transaction.userName}</p>
                            <p className="text-xs text-muted-foreground">{transaction.transactionType}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`text-sm font-bold ${transaction.amountChanged >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                            {transaction.amountChanged >= 0 ? '+' : ''}R$ {Math.abs(transaction.amountChanged).toLocaleString('pt-BR')}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(transaction.date).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* System Status */}
              <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Monitor className="h-5 w-5 text-primary" />
                    Status do Sistema
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-emerald-400" />
                        <span className="text-sm font-medium text-foreground">Banco de Dados</span>
                      </div>
                      <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30">Online</Badge>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-emerald-400" />
                        <span className="text-sm font-medium text-foreground">API DigitoPayt</span>
                      </div>
                      <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30">Online</Badge>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-emerald-400" />
                        <span className="text-sm font-medium text-foreground">Trading Bot</span>
                      </div>
                      <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30">Ativo</Badge>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                      <div className="flex items-center gap-3">
                        <Clock className="h-5 w-5 text-amber-400" />
                        <span className="text-sm font-medium text-foreground">Última Sincronização</span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date().toLocaleTimeString('pt-BR')}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar usuários..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-muted/50 border-border/50"
                />
              </div>
              <Button className="bg-primary hover:bg-primary/90">
                <UserPlus className="h-4 w-4 mr-2" />
                Novo Usuário
              </Button>
            </div>

            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-border/50">
                        <TableHead className="text-muted-foreground">Usuário</TableHead>
                        <TableHead className="text-muted-foreground">Role</TableHead>
                        <TableHead className="text-muted-foreground">Status</TableHead>
                        <TableHead className="text-muted-foreground">Saldo</TableHead>
                        <TableHead className="text-muted-foreground">Lucro Total</TableHead>
                        <TableHead className="text-muted-foreground">Último Login</TableHead>
                        <TableHead className="text-muted-foreground">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.map((user) => (
                        <TableRow key={user.id} className="border-border/30 hover:bg-muted/20">
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                                <User className="h-4 w-4 text-primary" />
                              </div>
                              <div>
                                <p className="font-medium text-foreground">{user.name}</p>
                                <p className="text-xs text-muted-foreground">{user.email}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={getRoleColor(user.role)}>
                              {user.role === 'admin' ? 'Admin' : user.role === 'partner' ? 'Sócio' : 'Usuário'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={getStatusColor(user.status)}>
                              {user.status === 'active' ? 'Ativo' : 'Inativo'}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-mono text-emerald-400">
                            R$ {user.balance.toLocaleString('pt-BR')}
                          </TableCell>
                          <TableCell className="font-mono text-primary">
                            R$ {user.totalProfit.toLocaleString('pt-BR')}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {user.lastLogin || 'Nunca'}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-8 w-8 p-0 hover:bg-primary/20"
                                onClick={() => handleViewUser(user)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-8 w-8 p-0 hover:bg-amber-500/20"
                                onClick={() => handleEditUser(user)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className={`h-8 w-8 p-0 ${user.status === 'active' ? 'hover:bg-red-500/20' : 'hover:bg-emerald-500/20'}`}
                                onClick={() => handleToggleStatus(user.id)}
                                title={user.status === 'active' ? 'Banir usuário' : 'Ativar usuário'}
                              >
                                {user.status === 'active' ? (
                                  <Ban className="h-4 w-4" />
                                ) : (
                                  <CheckCircle className="h-4 w-4" />
                                )}
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-8 w-8 p-0 hover:bg-red-500/20"
                                onClick={() => handleDeleteUser(user.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Conf Trading Tab */}
          <TabsContent value="conf-trading" className="space-y-6">
            <TradingConfig />
          </TabsContent>
          
          <TabsContent value="trading" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground">Gerenciar Investimentos</h2>
              <p className="text-muted-foreground">Visualize e delete investimentos ativos do sistema</p>
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
                      <p className="text-2xl font-bold">{activeInvestments.length}</p>
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
                        ${activeInvestments.reduce((sum, inv) => sum + (inv.amount || 0), 0).toFixed(2)}
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
                        ${activeInvestments.reduce((sum, inv) => sum + (inv.total_earned || 0), 0).toFixed(2)}
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
                        {new Set(activeInvestments.map(inv => inv.user_email)).size}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Search and Actions */}
            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  Buscar e Gerenciar Investimentos
                </CardTitle>
                <CardDescription>
                  Busque por email, nome do usuário ou nome do plano
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <Label htmlFor="confTradingSearch">Buscar</Label>
                      <Input
                        id="confTradingSearch"
                        type="text"
                        placeholder="Digite email, nome ou plano..."
                        value={confTradingSearchTerm}
                        onChange={(e) => setConfTradingSearchTerm(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div className="flex items-end gap-2">
                      <Button
                        onClick={loadActiveInvestments}
                        disabled={isLoadingInvestments}
                        size="sm"
                        variant="outline"
                      >
                        <RefreshCw className={`h-4 w-4 mr-2 ${isLoadingInvestments ? 'animate-spin' : ''}`} />
                        Recarregar
                      </Button>
                      <Badge variant="secondary">
                        {activeInvestments.filter(inv => 
                          !confTradingSearchTerm || 
                          inv.user_email?.toLowerCase().includes(confTradingSearchTerm.toLowerCase()) ||
                          inv.user_name?.toLowerCase().includes(confTradingSearchTerm.toLowerCase()) ||
                          inv.plan_name?.toLowerCase().includes(confTradingSearchTerm.toLowerCase())
                        ).length} de {activeInvestments.length} encontrados
                      </Badge>
                    </div>
                  </div>

                  {/* Bulk Actions */}
                  {selectedInvestments.length > 0 && (
                    <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                      <span className="text-sm font-medium">
                        {selectedInvestments.length} investimento(s) selecionado(s)
                      </span>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => setIsMultiDeleteModalOpen(true)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Deletar Selecionados
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedInvestments([])}
                      >
                        Limpar Seleção
                      </Button>
                    </div>
                  )}
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
                  Lista de todos os investimentos que podem ser gerenciados
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">
                          <Checkbox
                            checked={
                              activeInvestments.length > 0 && 
                              selectedInvestments.length === activeInvestments.filter(inv => 
                                !confTradingSearchTerm || 
                                inv.user_email?.toLowerCase().includes(confTradingSearchTerm.toLowerCase()) ||
                                inv.user_name?.toLowerCase().includes(confTradingSearchTerm.toLowerCase()) ||
                                inv.plan_name?.toLowerCase().includes(confTradingSearchTerm.toLowerCase())
                              ).length
                            }
                            onCheckedChange={(checked) => {
                              const filteredInvestments = activeInvestments.filter(inv => 
                                !confTradingSearchTerm || 
                                inv.user_email?.toLowerCase().includes(confTradingSearchTerm.toLowerCase()) ||
                                inv.user_name?.toLowerCase().includes(confTradingSearchTerm.toLowerCase()) ||
                                inv.plan_name?.toLowerCase().includes(confTradingSearchTerm.toLowerCase())
                              );
                              
                              if (checked) {
                                setSelectedInvestments(filteredInvestments.map(inv => inv.investment_id));
                              } else {
                                setSelectedInvestments([]);
                              }
                            }}
                          />
                        </TableHead>
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
                      {activeInvestments
                        .filter(inv => 
                          !confTradingSearchTerm || 
                          inv.user_email?.toLowerCase().includes(confTradingSearchTerm.toLowerCase()) ||
                          inv.user_name?.toLowerCase().includes(confTradingSearchTerm.toLowerCase()) ||
                          inv.plan_name?.toLowerCase().includes(confTradingSearchTerm.toLowerCase())
                        )
                        .map((investment) => (
                          <TableRow key={investment.investment_id}>
                            <TableCell>
                              <Checkbox
                                checked={selectedInvestments.includes(investment.investment_id)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    setSelectedInvestments(prev => [...prev, investment.investment_id]);
                                  } else {
                                    setSelectedInvestments(prev => prev.filter(id => id !== investment.investment_id));
                                  }
                                }}
                              />
                            </TableCell>
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
                              <span className="font-medium">${investment.amount?.toFixed(2)}</span>
                            </TableCell>
                            <TableCell>
                              <Badge variant="secondary">
                                {((investment.daily_rate || 0) * 100).toFixed(2)}%
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <span className="text-green-600 font-medium">
                                ${(investment.total_earned || 0).toFixed(2)}
                              </span>
                            </TableCell>
                            <TableCell>
                              <Badge 
                                variant={investment.status === 'active' ? 'default' : 'destructive'}
                              >
                                {investment.status === 'active' ? (
                                  <>
                                    <CheckCircle className="h-3 w-3 mr-1" /> 
                                    Ativo
                                  </>
                                ) : (
                                  <>
                                    <XIcon className="h-3 w-3 mr-1" /> 
                                    {investment.status}
                                  </>
                                )}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4 text-muted-foreground" />
                                <span>{investment.days_remaining || 0} dias</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => {
                                  setSelectedInvestmentForDeletion(investment);
                                  setIsIndividualDeleteModalOpen(true);
                                }}
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
                  
                  {activeInvestments.filter(inv => 
                    !confTradingSearchTerm || 
                    inv.user_email?.toLowerCase().includes(confTradingSearchTerm.toLowerCase()) ||
                    inv.user_name?.toLowerCase().includes(confTradingSearchTerm.toLowerCase()) ||
                    inv.plan_name?.toLowerCase().includes(confTradingSearchTerm.toLowerCase())
                  ).length === 0 && !isLoadingInvestments && (
                    <div className="p-8 text-center text-muted-foreground">
                      <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>
                        {confTradingSearchTerm 
                          ? "Nenhum investimento encontrado com os critérios de busca"
                          : "Nenhum investimento ativo encontrado"
                        }
                      </p>
                    </div>
                  )}

                  {isLoadingInvestments && (
                    <div className="p-8 text-center">
                      <RefreshCw className="h-8 w-8 mx-auto mb-4 animate-spin text-primary" />
                      <p className="text-muted-foreground">Carregando investimentos...</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Robots Tab */}
          <TabsContent value="robots" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground">Gerenciar Robôs de Arbitragem</h2>
              <p className="text-muted-foreground">Visualize, edite e exclua os planos de investimento (robôs) do sistema</p>
            </div>

            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bot className="h-5 w-5 text-primary" />
                  Robôs Disponíveis
                </CardTitle>
                <CardDescription>
                  Gerencie todos os robôs de arbitragem do sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Filter and Actions */}
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Button 
                        onClick={loadInvestmentPlans}
                        size="sm"
                        variant="outline"
                      >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Recarregar
                      </Button>
                      <Button 
                        onClick={() => {
                          setSelectedPlan(null);
                          setIsNewPlan(true);
                          setIsPlanModalOpen(true);
                        }}
                        size="sm"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Novo Robô
                      </Button>
                    </div>
                    <Badge variant="secondary">
                      {investmentPlans.length} robô(s) encontrado(s)
                    </Badge>
                  </div>

                  {/* Robots Table */}
                  <div className="border rounded-lg">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nome</TableHead>
                          <TableHead>Taxa Diária</TableHead>
                          <TableHead>Valor Min/Max</TableHead>
                          <TableHead>Duração</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {investmentPlans.map((plan) => (
                          <TableRow key={plan.id}>
                            <TableCell>
                              <div>
                                <p className="font-medium">{plan.name}</p>
                                <p className="text-sm text-muted-foreground">
                                  Min. {plan.requiredReferrals} indicações
                                </p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">
                                {(plan.dailyRate * 100).toFixed(2)}%
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">
                                <p>${plan.minimumAmount} - ${plan.maxInvestmentAmount || '∞'}</p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="secondary">
                                {plan.duration} dias
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge 
                                variant={plan.status === 'active' ? 'default' : 'destructive'}
                              >
                                {plan.status === 'active' ? 'Ativo' : 'Inativo'}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center gap-2 justify-end">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setSelectedPlan(plan);
                                    setIsNewPlan(false);
                                    setIsPlanModalOpen(true);
                                  }}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => {
                                    if (window.confirm(`Tem certeza que deseja excluir o robô ${plan.name}?`)) {
                                      deletePlan(plan.id);
                                    }
                                  }}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    
                    {investmentPlans.length === 0 && (
                      <div className="p-8 text-center text-muted-foreground">
                        <Bot className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>Nenhum robô encontrado</p>
                        <Button 
                          className="mt-2"
                          size="sm"
                          onClick={() => {
                            setSelectedPlan(null);
                            setIsNewPlan(true);
                            setIsPlanModalOpen(true);
                          }}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Criar Primeiro Robô
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Partners Tab */}
          <TabsContent value="partners" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground">Gestão de Sócios</h2>
              <p className="text-muted-foreground">Gerencie sócios e suas comissões</p>
            </div>

            <div className="grid grid-cols-1 gap-6">
              {/* Partners Management */}
              <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Crown className="h-5 w-5 text-primary" />
                    Sócios Ativos
                  </CardTitle>
                  <CardDescription>
                    {partners.length} sócios cadastrados
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-2">
                      <Button
                        onClick={addPartnerByEmail}
                        className="bg-emerald-600 hover:bg-emerald-700"
                      >
                        <UserPlus className="h-4 w-4 mr-2" />
                        Adicionar por Email
                      </Button>
                      <Button
                        onClick={updatePartnerCommission}
                        variant="outline"
                      >
                        <Percent className="h-4 w-4 mr-2" />
                        Atualizar Comissão
                      </Button>
                      <Button
                        onClick={loadPartners}
                        variant="outline"
                      >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Recarregar
                      </Button>
                    </div>

                    {/* Partners Table */}
                    <div className="border rounded-lg overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-muted/50">
                            <TableHead>Nome</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Comissão (%)</TableHead>
                            <TableHead>Total Ganhos</TableHead>
                            <TableHead>Total Depósitos</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Data Cadastro</TableHead>
                            <TableHead className="text-center">Ações</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {partners.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                                Nenhum sócio encontrado
                              </TableCell>
                            </TableRow>
                          ) : (
                            partners.map((partner) => (
                              <TableRow key={partner.id || partner.user_id} className="hover:bg-muted/30">
                                <TableCell className="font-medium">
                                  <div>
                                    <p className="font-medium">{partner.display_name || 'N/A'}</p>
                                    {partner.user_id && (
                                      <p className="text-xs text-muted-foreground">ID: {partner.user_id}</p>
                                    )}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm">{partner.email}</span>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-6 w-6 p-0"
                                      onClick={() => navigator.clipboard.writeText(partner.email)}
                                    >
                                      <Copy className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Badge variant="secondary" className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30">
                                    {partner.commission_percentage || 1.0}%
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <span className="text-emerald-400 font-medium">
                                    ${(partner.total_earnings || 0).toFixed(2)}
                                  </span>
                                </TableCell>
                                <TableCell>
                                  <span className="text-blue-400 font-medium">
                                    ${(partner.total_deposits || 0).toFixed(2)}
                                  </span>
                                </TableCell>
                                <TableCell>
                                  <Badge 
                                    variant={partner.status === 'active' ? 'default' : 'secondary'}
                                    className={partner.status === 'active' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : ''}
                                  >
                                    {partner.status || 'active'}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <span className="text-sm text-muted-foreground">
                                    {partner.created_at ? new Date(partner.created_at).toLocaleDateString('pt-BR') : 'N/A'}
                                  </span>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-1">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-8 w-8 p-0 hover:bg-amber-500/20"
                                      onClick={() => {
                                        const newCommission = prompt(
                                          `Digite a nova comissão para ${partner.display_name || partner.email}:`,
                                          String(partner.commission_percentage || 1.0)
                                        );
                                        if (newCommission && !isNaN(parseFloat(newCommission))) {
                                          supabase.rpc('update_partner_commission', {
                                            partner_email: partner.email,
                                            new_commission_percentage: parseFloat(newCommission)
                                          }).then(({ data, error }) => {
                                            if (error) {
                                              toast({
                                                title: "Erro",
                                                description: error.message,
                                                variant: "destructive"
                                              });
                                            } else {
                                              toast({
                                                title: "Sucesso",
                                                description: `Comissão atualizada para ${newCommission}%`
                                              });
                                              loadPartners();
                                            }
                                          });
                                        }
                                      }}
                                    >
                                      <Percent className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-8 w-8 p-0 hover:bg-red-500/20"
                                      onClick={() => {
                                        if (confirm(`Tem certeza que deseja remover ${partner.display_name || partner.email} como sócio?`)) {
                                          supabase.rpc('remove_partner_safe', {
                                            partner_email: partner.email
                                          }).then(({ data, error }) => {
                                            if (error) {
                                              toast({
                                                title: "Erro",
                                                description: error.message,
                                                variant: "destructive"
                                              });
                                            } else {
                                              toast({
                                                title: "Sucesso",
                                                description: "Sócio removido com sucesso"
                                              });
                                              loadPartners();
                                            }
                                          });
                                        }
                                      }}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </div>

                    {/* Summary */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                      <div className="p-4 rounded-lg bg-muted/30 border border-border/30">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-primary" />
                          <span className="text-sm font-medium">Total Sócios</span>
                        </div>
                        <p className="text-xl font-bold text-primary">{partners.length}</p>
                      </div>
                      <div className="p-4 rounded-lg bg-muted/30 border border-border/30">
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-emerald-400" />
                          <span className="text-sm font-medium">Total Ganhos</span>
                        </div>
                        <p className="text-xl font-bold text-emerald-400">
                          ${partners.reduce((sum, p) => sum + (p.total_earnings || 0), 0).toFixed(2)}
                        </p>
                      </div>
                      <div className="p-4 rounded-lg bg-muted/30 border border-border/30">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="h-4 w-4 text-blue-400" />
                          <span className="text-sm font-medium">Total Depósitos</span>
                        </div>
                        <p className="text-xl font-bold text-blue-400">
                          ${partners.reduce((sum, p) => sum + (p.total_deposits || 0), 0).toFixed(2)}
                        </p>
                      </div>
                      <div className="p-4 rounded-lg bg-muted/30 border border-border/30">
                        <div className="flex items-center gap-2">
                          <Percent className="h-4 w-4 text-amber-400" />
                          <span className="text-sm font-medium">Comissão Média</span>
                        </div>
                        <p className="text-xl font-bold text-amber-400">
                          {partners.length > 0 
                            ? (partners.reduce((sum, p) => sum + (p.commission_percentage || 1.0), 0) / partners.length).toFixed(1)
                            : '0.0'
                          }%
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground">Configurações do Sistema</h2>
              <p className="text-muted-foreground">Configure parâmetros gerais da plataforma</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* General Settings */}
              <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5 text-primary" />
                    Configurações Gerais
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="referrals">Sistema de Indicações</Label>
                        <p className="text-sm text-muted-foreground">Permitir programa de indicações</p>
                      </div>
                      <Switch 
                        id="referrals"
                        checked={adminSettings.allowReferrals}
                        onCheckedChange={(checked) => setAdminSettings(prev => ({ ...prev, allowReferrals: checked }))}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="referralPercent">Percentual de Indicação (%)</Label>
                      <Input
                        id="referralPercent"
                        type="number"
                        value={adminSettings.referralPercent}
                        onChange={(e) => setAdminSettings(prev => ({ ...prev, referralPercent: Number(e.target.value) }))}
                        min="0"
                        max="100"
                        step="0.1"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="gamification">Sistema de Gamificação</Label>
                        <p className="text-sm text-muted-foreground">Ativar recompensas por atividade</p>
                      </div>
                      <Switch 
                        id="gamification"
                        checked={adminSettings.allowGamification}
                        onCheckedChange={(checked) => setAdminSettings(prev => ({ ...prev, allowGamification: checked }))}
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="postReward">Recompensa por Post</Label>
                        <Input
                          id="postReward"
                          type="number"
                          value={adminSettings.postReward}
                          onChange={(e) => setAdminSettings(prev => ({ ...prev, postReward: Number(e.target.value) }))}
                          step="0.001"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="likeReward">Recompensa por Like</Label>
                        <Input
                          id="likeReward"
                          type="number"
                          value={adminSettings.likeReward}
                          onChange={(e) => setAdminSettings(prev => ({ ...prev, likeReward: Number(e.target.value) }))}
                          step="0.001"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="commentReward">Recompensa por Comentário</Label>
                        <Input
                          id="commentReward"
                          type="number"
                          value={adminSettings.commentReward}
                          onChange={(e) => setAdminSettings(prev => ({ ...prev, commentReward: Number(e.target.value) }))}
                          step="0.001"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Settings */}
              <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-primary" />
                    Configurações de Pagamento
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="pixEnabled">PIX Habilitado</Label>
                        <p className="text-sm text-muted-foreground">Permitir depósitos via PIX</p>
                      </div>
                      <Switch 
                        id="pixEnabled"
                        checked={adminSettings.pixEnabled}
                        onCheckedChange={(checked) => setAdminSettings(prev => ({ ...prev, pixEnabled: checked }))}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="usdtEnabled">USDT Habilitado</Label>
                        <p className="text-sm text-muted-foreground">Permitir depósitos via USDT</p>
                      </div>
                      <Switch 
                        id="usdtEnabled"
                        checked={adminSettings.usdtEnabled}
                        onCheckedChange={(checked) => setAdminSettings(prev => ({ ...prev, usdtEnabled: checked }))}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="minimumDeposit">Depósito Mínimo (R$)</Label>
                        <Input
                          id="minimumDeposit"
                          type="number"
                          value={adminSettings.minimumDeposit}
                          onChange={(e) => setAdminSettings(prev => ({ ...prev, minimumDeposit: Number(e.target.value) }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="maximumDeposit">Depósito Máximo (R$)</Label>
                        <Input
                          id="maximumDeposit"
                          type="number"
                          value={adminSettings.maximumDeposit}
                          onChange={(e) => setAdminSettings(prev => ({ ...prev, maximumDeposit: Number(e.target.value) }))}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="withdrawalFeePixPercent">Taxa PIX (%)</Label>
                        <Input
                          id="withdrawalFeePixPercent"
                          type="number"
                          value={adminSettings.withdrawalFeePixPercent}
                          onChange={(e) => setAdminSettings(prev => ({ ...prev, withdrawalFeePixPercent: Number(e.target.value) }))}
                          step="0.1"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="withdrawalFeeUsdtPercent">Taxa USDT (%)</Label>
                        <Input
                          id="withdrawalFeeUsdtPercent"
                          type="number"
                          value={adminSettings.withdrawalFeeUsdtPercent}
                          onChange={(e) => setAdminSettings(prev => ({ ...prev, withdrawalFeeUsdtPercent: Number(e.target.value) }))}
                          step="0.1"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="autoApproval">Aprovação Automática</Label>
                        <p className="text-sm text-muted-foreground">Aprovar depósitos automaticamente</p>
                      </div>
                      <Switch 
                        id="autoApproval"
                        checked={adminSettings.autoApproval}
                        onCheckedChange={(checked) => setAdminSettings(prev => ({ ...prev, autoApproval: checked }))}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* AlphaBot Settings */}
              <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bot className="h-5 w-5 text-primary" />
                    Configurações AlphaBot
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="alphabotEnabled">AlphaBot Ativo</Label>
                        <p className="text-sm text-muted-foreground">Ativar sistema de trading automático</p>
                      </div>
                      <Switch 
                        id="alphabotEnabled"
                        checked={adminSettings.alphabotEnabled}
                        onCheckedChange={(checked) => setAdminSettings(prev => ({ ...prev, alphabotEnabled: checked }))}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="alphabotDailyRate">Taxa Diária (%)</Label>
                        <Input
                          id="alphabotDailyRate"
                          type="number"
                          value={adminSettings.alphabotDailyRate}
                          onChange={(e) => setAdminSettings(prev => ({ ...prev, alphabotDailyRate: Number(e.target.value) }))}
                          step="0.01"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="alphabotOperationDuration">Duração Operação (s)</Label>
                        <Input
                          id="alphabotOperationDuration"
                          type="number"
                          value={adminSettings.alphabotOperationDuration}
                          onChange={(e) => setAdminSettings(prev => ({ ...prev, alphabotOperationDuration: Number(e.target.value) }))}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="alphabotMinInvestment">Investimento Mín. (R$)</Label>
                        <Input
                          id="alphabotMinInvestment"
                          type="number"
                          value={adminSettings.alphabotMinInvestment}
                          onChange={(e) => setAdminSettings(prev => ({ ...prev, alphabotMinInvestment: Number(e.target.value) }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="alphabotMaxInvestment">Investimento Máx. (R$)</Label>
                        <Input
                          id="alphabotMaxInvestment"
                          type="number"
                          value={adminSettings.alphabotMaxInvestment}
                          onChange={(e) => setAdminSettings(prev => ({ ...prev, alphabotMaxInvestment: Number(e.target.value) }))}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="alphabotAutoRestart">Reinício Automático</Label>
                        <p className="text-sm text-muted-foreground">Reiniciar operações automaticamente</p>
                      </div>
                      <Switch 
                        id="alphabotAutoRestart"
                        checked={adminSettings.alphabotAutoRestart}
                        onCheckedChange={(checked) => setAdminSettings(prev => ({ ...prev, alphabotAutoRestart: checked }))}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Save Settings */}
              <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardContent className="p-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-semibold">Salvar Configurações</h3>
                      <p className="text-sm text-muted-foreground">Aplicar todas as alterações realizadas</p>
                    </div>
                    <Button className="bg-primary hover:bg-primary/90">
                      <Database className="h-4 w-4 mr-2" />
                      Salvar Tudo
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Balance Update Modal */}
        <Dialog open={showBalanceModal} onOpenChange={setShowBalanceModal}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                {balanceOperation === 'add' ? 'Adicionar Saldo' : 'Subtrair Saldo'}
              </DialogTitle>
            </DialogHeader>
            
            {selectedUserForBalance && (
              <div className="space-y-4">
                <div className="p-4 bg-muted/50 rounded-lg">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">{selectedUserForBalance.name}</p>
                      <p className="text-sm text-muted-foreground">{selectedUserForBalance.email}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Saldo atual</p>
                      <p className="text-lg font-semibold">R$ {selectedUserForBalance.balance.toFixed(2)}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="balanceAmount">
                    Valor a {balanceOperation === 'add' ? 'adicionar' : 'subtrair'}
                  </Label>
                  <Input
                    id="balanceAmount"
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={balanceAmount}
                    onChange={(e) => setBalanceAmount(e.target.value)}
                    placeholder="0.00"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="balanceReason">Motivo *</Label>
                  <Textarea
                    id="balanceReason"
                    value={balanceReason}
                    onChange={(e) => setBalanceReason(e.target.value)}
                    placeholder="Digite o motivo desta operação..."
                    className="min-h-[80px]"
                  />
                </div>

                {balanceAmount && (
                  <div className="p-3 bg-muted/30 rounded-lg">
                    <p className="text-sm text-muted-foreground">Novo saldo será:</p>
                    <p className="text-lg font-semibold">
                      R$ {(balanceOperation === 'add' 
                        ? selectedUserForBalance.balance + parseFloat(balanceAmount || '0')
                        : selectedUserForBalance.balance - parseFloat(balanceAmount || '0')
                      ).toFixed(2)}
                    </p>
                  </div>
                )}

                <div className="flex gap-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowBalanceModal(false);
                      setBalanceAmount('');
                      setBalanceReason('');
                    }}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleBalanceUpdate}
                    disabled={isUpdatingBalance || !balanceAmount || !balanceReason.trim()}
                    className="flex-1"
                  >
                    {isUpdatingBalance ? (
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Calculator className="h-4 w-4 mr-2" />
                    )}
                    {balanceOperation === 'add' ? 'Adicionar' : 'Subtrair'}
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Individual Investment Delete Modal */}
        <Dialog open={isIndividualDeleteModalOpen} onOpenChange={setIsIndividualDeleteModalOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="h-5 w-5" />
                Confirmar Exclusão
              </DialogTitle>
              <p className="text-sm text-muted-foreground">
                Tem certeza de que deseja excluir este investimento?
              </p>
            </DialogHeader>
            {selectedInvestmentForDeletion && (
              <div className="space-y-4">
                
                <div className="bg-muted/30 p-4 rounded-lg space-y-2">
                  <div className="flex justify-between">
                    <span className="font-medium">Usuário:</span>
                    <span>{selectedInvestmentForDeletion.user_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Email:</span>
                    <span>{selectedInvestmentForDeletion.user_email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Plano:</span>
                    <span>{selectedInvestmentForDeletion.plan_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Valor:</span>
                    <span>${selectedInvestmentForDeletion.amount?.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Total Ganho:</span>
                    <span className="text-green-600">${selectedInvestmentForDeletion.total_earned?.toFixed(2)}</span>
                  </div>
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
                      setIsIndividualDeleteModalOpen(false);
                      setSelectedInvestmentForDeletion(null);
                    }}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={confirmIndividualDeletion}
                    className="flex-1"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Excluir Investimento
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Multiple Investments Delete Modal */}
        <Dialog open={isMultiDeleteModalOpen} onOpenChange={setIsMultiDeleteModalOpen}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="h-5 w-5" />
                Confirmar Exclusão Múltipla
              </DialogTitle>
              <p className="text-sm text-muted-foreground">
                Tem certeza de que deseja excluir {selectedInvestments.length} investimento(s) selecionado(s)?
              </p>
            </DialogHeader>
            <div className="space-y-4">
              <div className="bg-muted/30 p-4 rounded-lg max-h-48 overflow-y-auto">
                <h4 className="font-medium mb-3">Investimentos que serão excluídos:</h4>
                <div className="space-y-2">
                  {activeInvestments
                    .filter(inv => selectedInvestments.includes(inv.investment_id))
                    .map((investment) => (
                      <div key={investment.investment_id} className="flex justify-between items-center p-2 bg-background rounded border">
                        <div>
                          <p className="font-medium text-sm">{investment.user_name}</p>
                          <p className="text-xs text-muted-foreground">{investment.user_email}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">{investment.plan_name}</p>
                          <p className="text-xs text-muted-foreground">${investment.amount?.toFixed(2)}</p>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              <div className="bg-red-50 border border-red-200 p-3 rounded-lg">
                <p className="text-sm text-red-800">
                  <strong>Atenção:</strong> Esta ação não pode ser desfeita. Todos os investimentos selecionados serão cancelados permanentemente.
                </p>
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsMultiDeleteModalOpen(false);
                  }}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  variant="destructive"
                  onClick={deleteMultipleInvestments}
                  className="flex-1"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Excluir {selectedInvestments.length} Investimento(s)
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Admin;
