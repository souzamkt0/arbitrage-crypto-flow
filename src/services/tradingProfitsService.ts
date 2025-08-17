import { supabase } from '@/integrations/supabase/client';

export interface TradingProfit {
  id: string;
  user_id: string;
  investment_amount: number;
  daily_rate: number;
  plan_name: string;
  total_profit: number;
  exchanges_count: number;
  completed_operations: number;
  execution_time_seconds?: number;
  profit_per_exchange?: number;
  status: string;
  metadata?: any;
  created_at: string;
  updated_at: string;
}

export interface TradingStats {
  total_invested: number;
  total_profit: number;
  total_operations: number;
  avg_daily_rate: number;
  best_profit: number;
  total_execution_time: number;
}

export class TradingProfitsService {
  /**
   * Registrar um novo ganho de trading
   */
  static async recordProfit(data: {
    investment_amount: number;
    daily_rate: number;
    plan_name: string;
    total_profit: number;
    exchanges_count: number;
    completed_operations: number;
    execution_time_seconds?: number;
    profit_per_exchange?: number;
    metadata?: any;
  }): Promise<TradingProfit | null> {
    try {
      const { data: profit, error } = await supabase
        .from('trading_profits')
        .insert([data])
        .select()
        .single();

      if (error) {
        console.error('Erro ao registrar ganho:', error);
        return null;
      }

      return profit;
    } catch (error) {
      console.error('Erro ao registrar ganho de trading:', error);
      return null;
    }
  }

  /**
   * Buscar histórico de ganhos do usuário
   */
  static async getUserProfits(limit: number = 50): Promise<TradingProfit[]> {
    try {
      const { data: profits, error } = await supabase
        .from('trading_profits')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Erro ao buscar ganhos:', error);
        return [];
      }

      return profits || [];
    } catch (error) {
      console.error('Erro ao buscar ganhos de trading:', error);
      return [];
    }
  }

  /**
   * Buscar estatísticas de trading do usuário
   */
  static async getUserStats(): Promise<TradingStats | null> {
    try {
      const { data: stats, error } = await supabase
        .rpc('get_user_trading_stats');

      if (error) {
        console.error('Erro ao buscar estatísticas:', error);
        return null;
      }

      return stats?.[0] || {
        total_invested: 0,
        total_profit: 0,
        total_operations: 0,
        avg_daily_rate: 0,
        best_profit: 0,
        total_execution_time: 0
      };
    } catch (error) {
      console.error('Erro ao buscar estatísticas de trading:', error);
      return null;
    }
  }

  /**
   * Buscar ganhos por período
   */
  static async getProfitsByPeriod(startDate: string, endDate: string): Promise<TradingProfit[]> {
    try {
      const { data: profits, error } = await supabase
        .from('trading_profits')
        .select('*')
        .gte('created_at', startDate)
        .lte('created_at', endDate)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar ganhos por período:', error);
        return [];
      }

      return profits || [];
    } catch (error) {
      console.error('Erro ao buscar ganhos por período:', error);
      return [];
    }
  }

  /**
   * Buscar ganhos por plano
   */
  static async getProfitsByPlan(planName: string): Promise<TradingProfit[]> {
    try {
      const { data: profits, error } = await supabase
        .from('trading_profits')
        .select('*')
        .eq('plan_name', planName)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar ganhos por plano:', error);
        return [];
      }

      return profits || [];
    } catch (error) {
      console.error('Erro ao buscar ganhos por plano:', error);
      return [];
    }
  }

  /**
   * Deletar um registro de ganho
   */
  static async deleteProfit(profitId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('trading_profits')
        .delete()
        .eq('id', profitId);

      if (error) {
        console.error('Erro ao deletar ganho:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Erro ao deletar ganho de trading:', error);
      return false;
    }
  }

  /**
   * Calcular lucro total esperado baseado na taxa diária
   */
  static calculateExpectedProfit(investmentAmount: number, dailyRate: number): number {
    return (investmentAmount * dailyRate) / 100;
  }

  /**
   * Calcular lucro por exchange
   */
  static calculateProfitPerExchange(totalProfit: number, exchangesCount: number): number {
    return totalProfit / exchangesCount;
  }

  /**
   * Validar dados de ganho
   */
  static validateProfitData(data: any): boolean {
    return (
      data.investment_amount > 0 &&
      data.daily_rate > 0 &&
      data.plan_name &&
      data.total_profit >= 0 &&
      data.exchanges_count > 0 &&
      data.completed_operations >= 0
    );
  }
}
