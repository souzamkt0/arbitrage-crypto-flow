import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Activity, 
  TrendingUp, 
  TrendingDown, 
  DollarSign,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw
} from 'lucide-react';

interface DashboardStats {
  totalTransactions: number;
  successfulTransactions: number;
  failedTransactions: number;
  pendingTransactions: number;
  totalVolume: number;
  todayVolume: number;
  totalUsers: number;
  activeUsers: number;
}

interface RecentTransaction {
  id: string;
  amount_usd: number;
  pay_currency: string;
  pay_currency_variant: string;
  status: string;
  created_at: string;
  user_email?: string;
}

export default function USDTPaymentDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalTransactions: 0,
    successfulTransactions: 0,
    failedTransactions: 0,
    pendingTransactions: 0,
    totalVolume: 0,
    todayVolume: 0,
    totalUsers: 0,
    activeUsers: 0,
  });
  const [recentTransactions, setRecentTransactions] = useState<RecentTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    checkAdminStatus();
  }, []);

  useEffect(() => {
    if (isAdmin) {
      loadDashboardData();
    }
  }, [isAdmin]);

  const checkAdminStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('user_id', user.id)
        .single();

      setIsAdmin(profile?.role === 'admin');
    } catch (error) {
      console.error('Erro ao verificar admin:', error);
    }
  };

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadTransactionStats(),
        loadRecentTransactions(),
      ]);
    } catch (error) {
      console.error('Erro ao carregar dashboard:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados do dashboard",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadTransactionStats = async () => {
    try {
      // Buscar estatísticas das transações
      const { data: transactions, error } = await supabase
        .from('bnb20_transactions')
        .select('amount_usd, status, created_at, user_id');

      if (error) throw error;

      const today = new Date().toISOString().split('T')[0];
      const todayTransactions = transactions?.filter(t => 
        t.created_at.startsWith(today)
      ) || [];

      const successful = transactions?.filter(t => t.status === 'finished') || [];
      const failed = transactions?.filter(t => ['failed', 'expired'].includes(t.status)) || [];
      const pending = transactions?.filter(t => ['pending', 'waiting', 'confirming'].includes(t.status)) || [];

      const totalVolume = successful.reduce((sum, t) => sum + (t.amount_usd || 0), 0);
      const todayVolume = todayTransactions
        .filter(t => t.status === 'finished')
        .reduce((sum, t) => sum + (t.amount_usd || 0), 0);

      const uniqueUsers = new Set(transactions?.map(t => t.user_id) || []).size;
      const activeUsers = new Set(todayTransactions.map(t => t.user_id)).size;

      setStats({
        totalTransactions: transactions?.length || 0,
        successfulTransactions: successful.length,
        failedTransactions: failed.length,
        pendingTransactions: pending.length,
        totalVolume,
        todayVolume,
        totalUsers: uniqueUsers,
        activeUsers,
      });
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  };

  const loadRecentTransactions = async () => {
    try {
      const { data, error } = await supabase
        .from('bnb20_transactions')
        .select(`
          id,
          amount_usd,
          pay_currency,
          pay_currency_variant,
          status,
          created_at,
          user_id
        `)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      // Buscar emails dos usuários
      const userIds = [...new Set(data?.map(t => t.user_id) || [])];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, email')
        .in('user_id', userIds);

      const transactionsWithEmails = data?.map(transaction => ({
        ...transaction,
        user_email: profiles?.find(p => p.user_id === transaction.user_id)?.email || 'N/A'
      })) || [];

      setRecentTransactions(transactionsWithEmails);
    } catch (error) {
      console.error('Erro ao carregar transações recentes:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      'pending': { variant: 'outline' as const, icon: Clock, label: 'Pendente' },
      'waiting': { variant: 'outline' as const, icon: Clock, label: 'Aguardando' },
      'confirming': { variant: 'secondary' as const, icon: RefreshCw, label: 'Confirmando' },
      'finished': { variant: 'default' as const, icon: CheckCircle, label: 'Concluído' },
      'failed': { variant: 'destructive' as const, icon: XCircle, label: 'Falhou' },
      'expired': { variant: 'destructive' as const, icon: AlertCircle, label: 'Expirado' }
    };

    const config = statusMap[status as keyof typeof statusMap] || statusMap.pending;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  if (!isAdmin) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Dashboard disponível apenas para administradores</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 mx-auto animate-spin text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Carregando dashboard...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header com botão de atualizar */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Dashboard Administrativo</h2>
          <p className="text-muted-foreground">Visão geral do sistema de pagamentos USDT</p>
        </div>
        <Button onClick={loadDashboardData} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Atualizar
        </Button>
      </div>

      {/* Cards de estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Transações</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTransactions}</div>
            <p className="text-xs text-muted-foreground">
              {stats.todayVolume > 0 && `$${stats.todayVolume.toLocaleString()} hoje`}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Volume Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalVolume.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Taxa de sucesso: {stats.totalTransactions > 0 ? Math.round((stats.successfulTransactions / stats.totalTransactions) * 100) : 0}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transações Concluídas</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{stats.successfulTransactions}</div>
            <p className="text-xs text-muted-foreground">
              Pendentes: {stats.pendingTransactions}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuários Únicos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              Ativos hoje: {stats.activeUsers}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Transações recentes */}
      <Card>
        <CardHeader>
          <CardTitle>Transações Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          {recentTransactions.length === 0 ? (
            <div className="text-center py-8">
              <Activity className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Nenhuma transação encontrada</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentTransactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">${transaction.amount_usd}</p>
                      <Badge variant="outline">
                        {transaction.pay_currency?.toUpperCase()} {transaction.pay_currency_variant}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {transaction.user_email}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(transaction.created_at).toLocaleString('pt-BR')}
                    </p>
                  </div>
                  <div className="text-right">
                    {getStatusBadge(transaction.status)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}