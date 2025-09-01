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
  }, [user, loadBalanceData]);

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
      
    </Card>
  );
};

export default BalanceBox;