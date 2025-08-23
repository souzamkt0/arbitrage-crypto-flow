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
    <div className="bg-[#1a1f2e] rounded-xl border border-gray-800 overflow-hidden">
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
            ↓
          </div>
          <h3 className="font-semibold text-sm text-white">Depósitos</h3>
        </div>
      </div>
      <div className="p-4">
        <div className="text-2xl font-bold text-white mb-1">
          {loading ? (
            <div className="animate-pulse bg-gray-600 h-8 w-24 rounded"></div>
          ) : (
            `$${totalDeposits.toFixed(2)}`
          )}
        </div>
        <div className="flex items-center">
          <span className="text-xs text-green-400">↗ +20.4%</span>
        </div>
      </div>
    </div>
  );
};