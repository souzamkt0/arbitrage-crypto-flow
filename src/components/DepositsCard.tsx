import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowDownLeft, CreditCard, Banknote } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export const DepositsCard = () => {
  const { user } = useAuth();
  const [totalDeposits, setTotalDeposits] = useState(0);
  const [totalDepositsBRL, setTotalDepositsBRL] = useState(0);
  const [pendingDeposits, setPendingDeposits] = useState(0);
  const [loading, setLoading] = useState(true);

  const loadDepositsData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Buscar depósitos do DigiToPay (fonte principal)
      const { data: digitopayData } = await supabase
        .from('digitopay_transactions')
        .select('amount, amount_brl, status')
        .eq('user_id', user.id)
        .eq('type', 'deposit');

      if (digitopayData) {
        const completed = digitopayData.filter(d => d.status === 'completed');
        const pending = digitopayData.filter(d => d.status === 'pending');
        
        const totalUSD = completed.reduce((sum, d) => sum + (Number(d.amount) || 0), 0);
        const totalBRL = completed.reduce((sum, d) => sum + (Number(d.amount_brl) || 0), 0);
        const pendingUSD = pending.reduce((sum, d) => sum + (Number(d.amount) || 0), 0);
        
        setTotalDeposits(totalUSD);
        setTotalDepositsBRL(totalBRL);
        setPendingDeposits(pendingUSD);
      }

    } catch (error) {
      console.error('Erro ao carregar dados de depósitos:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDepositsData();
    
    // Atualizar a cada 30 segundos para sincronizar com DigiToPay
    const interval = setInterval(loadDepositsData, 30000);
    return () => clearInterval(interval);
  }, [user]);

  const exchangeRate = totalDepositsBRL > 0 && totalDeposits > 0 ? 
    (totalDepositsBRL / totalDeposits).toFixed(2) : '5.50';

  return (
    <Card className="bg-gradient-to-br from-blue-900/20 to-cyan-900/20 border-blue-500/20 hover:border-blue-400/30 transition-all duration-300">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white">
            <ArrowDownLeft className="h-5 w-5" />
          </div>
          <CardTitle className="text-sm font-medium text-blue-100">
            Depósitos
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-blue-400">
          {loading ? (
            <div className="animate-pulse bg-blue-400/20 h-8 w-24 rounded"></div>
          ) : (
            `$${totalDeposits.toFixed(2)}`
          )}
        </div>
        <div className="flex items-center justify-between text-xs text-blue-300/80 mt-1">
          <div className="flex items-center space-x-1">
            <Banknote className="h-3 w-3" />
            <span>R$ {totalDepositsBRL.toFixed(2)}</span>
          </div>
          <div className="flex items-center space-x-1">
            <CreditCard className="h-3 w-3" />
            <span className="text-cyan-400">DigiToPay</span>
          </div>
        </div>
        <div className="flex items-center justify-between text-xs mt-2">
          <span className="text-blue-200/60">
            Taxa: R$ {exchangeRate}/USD
          </span>
          {pendingDeposits > 0 && (
            <span className="text-yellow-400">
              Pendente: ${pendingDeposits.toFixed(2)}
            </span>
          )}
        </div>
        <CardDescription className="text-blue-200/60 mt-2">
          Sincronizado com DigiToPay
        </CardDescription>
      </CardContent>
    </Card>
  );
};