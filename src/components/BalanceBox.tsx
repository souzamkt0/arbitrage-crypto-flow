import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DollarSign, RefreshCw, TrendingUp, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface BalanceBoxProps {
  onRefresh?: () => void;
}

export const BalanceBox: React.FC<BalanceBoxProps> = ({ onRefresh }) => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [balance, setBalance] = useState(0);
  const [totalProfit, setTotalProfit] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showBalance, setShowBalance] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [recentDeposits, setRecentDeposits] = useState<number>(0);
  const [pendingDeposits, setPendingDeposits] = useState<number>(0);

  const loadBalanceData = async () => {
    if (!user) return;
    
    setLoading(true);
    
    try {
      // Carregar dados do perfil do usuário
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('balance, total_profit')
        .eq('user_id', user.id)
        .single();

      if (profileError) {
        console.error('Erro ao carregar perfil:', profileError);
        return;
      }

      if (profileData) {
        setBalance(profileData.balance || 0);
        setTotalProfit(profileData.total_profit || 0);
      }

      // Carregar depósitos recentes (últimas 24h)
      const last24h = new Date();
      last24h.setHours(last24h.getHours() - 24);

      const { data: deposits, error: depositsError } = await supabase
        .from('digitopay_transactions')
        .select('amount, status, created_at')
        .eq('user_id', user.id)
        .eq('type', 'deposit')
        .gte('created_at', last24h.toISOString());

      if (!depositsError && deposits) {
        const completed = deposits.filter(d => d.status === 'completed' || d.status === 'paid');
        const pending = deposits.filter(d => d.status === 'pending');
        
        setRecentDeposits(completed.reduce((sum, d) => sum + (d.amount || 0), 0));
        setPendingDeposits(pending.length);
      }

      setLastUpdate(new Date());
      
    } catch (error) {
      console.error('Erro ao carregar dados de saldo:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os dados do saldo',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBalanceData();
    
    // Atualizar a cada 30 segundos
    const interval = setInterval(loadBalanceData, 30000);
    
    return () => clearInterval(interval);
  }, [user]);

  const handleRefresh = async () => {
    await loadBalanceData();
    if (onRefresh) onRefresh();
    
    toast({
      title: '✅ Atualizado',
      description: 'Dados de saldo atualizados com sucesso'
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value).replace('US$', '$');
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <Card className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-sm border border-blue-500/20 shadow-xl">
      <CardHeader className="bg-gradient-to-r from-green-600/10 to-emerald-600/10 border-b border-green-500/20 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg">
              <DollarSign className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-white">
                Saldo de Trading
              </CardTitle>
              <p className="text-gray-400 text-sm">
                Saldo disponível para investimentos
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowBalance(!showBalance)}
              className="text-gray-400 hover:text-white p-2"
            >
              {showBalance ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              disabled={loading}
              className="text-gray-400 hover:text-white p-2"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-6 space-y-6">
        {/* Saldo Principal */}
        <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-xl p-6 border border-green-500/20">
          <div className="text-center">
            <div className="text-sm text-green-400 font-medium mb-2">
              💰 Saldo Atual
            </div>
            <div className="text-4xl font-bold text-green-400 mb-2">
              {showBalance ? formatCurrency(balance) : '$••••••'}
            </div>
            <div className="text-xs text-gray-400">
              Disponível para trading e investimentos
            </div>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-slate-800/40 rounded-lg p-4 border border-slate-600/30">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-blue-400" />
              <span className="text-sm text-gray-300 font-medium">Lucro Total</span>
            </div>
            <div className="text-xl font-bold text-blue-400">
              {showBalance ? formatCurrency(totalProfit) : '$••••••'}
            </div>
            <div className="text-xs text-gray-400">
              Ganhos acumulados
            </div>
          </div>

          <div className="bg-slate-800/40 rounded-lg p-4 border border-slate-600/30">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
              <span className="text-sm text-gray-300 font-medium">Depósitos 24h</span>
            </div>
            <div className="text-xl font-bold text-yellow-400">
              {showBalance ? formatCurrency(recentDeposits) : '$••••••'}
            </div>
            <div className="text-xs text-gray-400">
              {pendingDeposits > 0 ? `${pendingDeposits} pendente(s)` : 'Tudo confirmado'}
            </div>
          </div>
        </div>

        {/* Status de Depósito */}
        {pendingDeposits > 0 && (
          <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-lg p-4 border border-yellow-500/20">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></div>
              <span className="text-yellow-400 font-semibold">Depósitos Pendentes</span>
            </div>
            <div className="text-sm text-gray-300">
              Você tem <strong className="text-yellow-400">{pendingDeposits}</strong> depósito(s) aguardando confirmação.
              O saldo será creditado automaticamente após o pagamento.
            </div>
          </div>
        )}

        {/* Informações de Atualização */}
        <div className="text-center text-xs text-gray-500">
          {lastUpdate && (
            <>
              Última atualização: {formatTime(lastUpdate)}
              <br />
              <span className="text-green-400">●</span> Atualização automática a cada 30s
            </>
          )}
        </div>

        {/* Ações Rápidas */}
        <div className="flex gap-3">
          <Button
            onClick={() => window.location.href = '/deposit'}
            className="flex-1 h-10 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium"
          >
            💳 Depositar
          </Button>
          <Button
            onClick={() => window.location.href = '/investments'}
            variant="outline"
            className="flex-1 h-10 border-green-500/30 text-green-400 hover:bg-green-500/10"
          >
            📈 Investir
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default BalanceBox;