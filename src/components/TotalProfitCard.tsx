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
    <Card className="bg-gradient-to-br from-green-900/20 to-emerald-900/20 border-green-500/20 hover:border-green-400/30 transition-all duration-300">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-green-100">
          Lucro Total
        </CardTitle>
        <TrendingUp className="h-4 w-4 text-green-400" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-green-400">
          {loading ? (
            <div className="animate-pulse bg-green-400/20 h-8 w-24 rounded"></div>
          ) : (
            `$${totalProfit.toFixed(2)}`
          )}
        </div>
        <div className="flex items-center space-x-2 text-xs text-green-300/80 mt-1">
          <DollarSign className="h-3 w-3" />
          <span>
            Hoje: ${dailyProfit.toFixed(2)} 
            {profitPercentage > 0 && (
              <span className="text-green-400 ml-1">
                (+{profitPercentage.toFixed(1)}%)
              </span>
            )}
          </span>
        </div>
        <CardDescription className="text-green-200/60 mt-2">
          Ganhos acumulados de investimentos
        </CardDescription>
      </CardContent>
    </Card>
  );
};