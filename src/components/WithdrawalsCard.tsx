import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUpRight, AlertCircle, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export const WithdrawalsCard = () => {
  const { user } = useAuth();
  const [totalWithdrawals, setTotalWithdrawals] = useState(0);
  const [pendingWithdrawals, setPendingWithdrawals] = useState(0);
  const [completedWithdrawals, setCompletedWithdrawals] = useState(0);
  const [loading, setLoading] = useState(true);

  const loadWithdrawalsData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Buscar saques do usuário
      const { data: withdrawalsData } = await supabase
        .from('withdrawals')
        .select('amount_usd, status, net_amount')
        .eq('user_id', user.id);

      if (withdrawalsData) {
        const completed = withdrawalsData.filter(w => w.status === 'completed');
        const pending = withdrawalsData.filter(w => 
          w.status === 'pending' || w.status === 'processing'
        );
        
        const totalCompleted = completed.reduce((sum, w) => sum + (Number(w.net_amount) || 0), 0);
        const totalPending = pending.reduce((sum, w) => sum + (Number(w.amount_usd) || 0), 0);
        const total = withdrawalsData.reduce((sum, w) => sum + (Number(w.amount_usd) || 0), 0);
        
        setCompletedWithdrawals(totalCompleted);
        setPendingWithdrawals(totalPending);
        setTotalWithdrawals(total);
      }

    } catch (error) {
      console.error('Erro ao carregar dados de saques:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWithdrawalsData();
    
    // Atualizar a cada 30 segundos
    const interval = setInterval(loadWithdrawalsData, 30000);
    return () => clearInterval(interval);
  }, [user]);

  return (
    <Card className="bg-gradient-to-br from-orange-900/20 to-red-900/20 border-orange-500/20 hover:border-orange-400/30 transition-all duration-300">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white">
            <ArrowUpRight className="h-5 w-5" />
          </div>
          <CardTitle className="text-sm font-medium text-orange-100">
            Saques
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-orange-400">
          {loading ? (
            <div className="animate-pulse bg-orange-400/20 h-8 w-24 rounded"></div>
          ) : (
            `$${totalWithdrawals.toFixed(2)}`
          )}
        </div>
        <div className="flex items-center justify-between text-xs text-orange-300/80 mt-1">
          <div className="flex items-center space-x-1">
            <CheckCircle className="h-3 w-3" />
            <span>Concluído: ${completedWithdrawals.toFixed(2)}</span>
          </div>
        </div>
        {pendingWithdrawals > 0 && (
          <div className="flex items-center space-x-1 text-xs text-yellow-400 mt-1">
            <AlertCircle className="h-3 w-3" />
            <span>Pendente: ${pendingWithdrawals.toFixed(2)}</span>
          </div>
        )}
        <CardDescription className="text-orange-200/60 mt-2">
          Total de saques solicitados
        </CardDescription>
      </CardContent>
    </Card>
  );
};