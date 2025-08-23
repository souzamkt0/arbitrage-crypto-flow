import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, DollarSign } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export const TotalProfitCard = () => {
  const { user } = useAuth();
  const [totalProfit, setTotalProfit] = useState(0);
  const [dailyProfit, setDailyProfit] = useState(0);
  const [loading, setLoading] = useState(true);

  const loadTotalProfit = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Buscar lucro total do perfil
      const { data: profile } = await supabase
        .from('profiles')
        .select('total_profit')
        .eq('user_id', user.id)
        .single();

      if (profile) {
        setTotalProfit(profile.total_profit || 0);
      }

      // Buscar lucro diário
      const { data: dailyData } = await supabase.rpc('calculate_and_store_daily_profit', {
        target_user_id: user.id
      });

      if (dailyData) {
        setDailyProfit(Number(dailyData) || 0);
      }

    } catch (error) {
      console.error('Erro ao carregar lucro total:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTotalProfit();
    
    // Atualizar a cada 30 segundos
    const interval = setInterval(loadTotalProfit, 30000);
    return () => clearInterval(interval);
  }, [user]);

  const profitPercentage = dailyProfit > 0 ? ((dailyProfit / (totalProfit || 1)) * 100) : 0;

  return (
    <div className="bg-[#1a1f2e] rounded-xl border border-gray-800 overflow-hidden">
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
            ↗
          </div>
          <h3 className="font-semibold text-sm text-white">Lucro Total</h3>
        </div>
      </div>
      <div className="p-4">
        <div className="text-2xl font-bold text-white mb-1">
          {loading ? (
            <div className="animate-pulse bg-gray-600 h-8 w-24 rounded"></div>
          ) : (
            `$${totalProfit.toFixed(2)}`
          )}
        </div>
        <div className="flex items-center">
          <span className="text-xs text-green-400">↗ +12.5%</span>
        </div>
      </div>
    </div>
  );
};