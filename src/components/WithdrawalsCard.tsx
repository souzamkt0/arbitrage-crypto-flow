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
    <div className="bg-[#1a1f2e] rounded-xl border border-gray-800 overflow-hidden">
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 bg-purple-400 rounded-full flex items-center justify-center text-white text-xs font-bold">
            ↑
          </div>
          <h3 className="font-semibold text-sm text-white">Saques</h3>
        </div>
      </div>
      <div className="p-4">
        <div className="text-2xl font-bold text-white mb-1">
          {loading ? (
            <div className="animate-pulse bg-gray-600 h-8 w-24 rounded"></div>
          ) : (
            `$${totalWithdrawals.toFixed(2)}`
          )}
        </div>
        <div className="flex items-center">
          <span className="text-xs text-red-400">↓ -5.8%</span>
        </div>
      </div>
    </div>
  );
};