import React, { useState, useEffect } from 'react';
import { Crown, DollarSign, TrendingUp, Users, Gift, Star, Zap } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PartnerData {
  id: string;
  commission_percentage: number;
  total_deposits: number;
  total_earnings: number;
  status: string;
  display_name?: string;
}

interface PartnerCommission {
  commission_amount: number;
  deposit_amount: number;
  created_at: string;
  status: string;
}

export const PartnerStats = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [partnerData, setPartnerData] = useState<PartnerData | null>(null);
  const [commissions, setCommissions] = useState<PartnerCommission[]>([]);
  const [monthlyEarnings, setMonthlyEarnings] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPartnerData = async () => {
    if (!user?.id) return;

    try {
      setIsLoading(true);
      
      // Buscar dados do parceiro
      const { data: partner, error: partnerError } = await supabase
        .from('partners')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single();

      if (partnerError) {
        console.log('User is not a partner:', partnerError.message);
        setPartnerData(null);
        return;
      }

      setPartnerData(partner);

      // Buscar comissões do parceiro
      const { data: commissionsData, error: commissionsError } = await supabase
        .from('partner_commissions')
        .select('*')
        .eq('partner_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (commissionsError) {
        console.error('Erro ao buscar comissões:', commissionsError);
      } else {
        setCommissions(commissionsData || []);
        
        // Calcular ganhos do mês atual
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        const monthlyTotal = (commissionsData || [])
          .filter(commission => {
            const commissionDate = new Date(commission.created_at);
            return commissionDate.getMonth() === currentMonth && 
                   commissionDate.getFullYear() === currentYear;
          })
          .reduce((sum, commission) => sum + Number(commission.commission_amount), 0);
        
        setMonthlyEarnings(monthlyTotal);
      }

    } catch (error) {
      console.error('Erro ao carregar dados do parceiro:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPartnerData();
  }, [user?.id]);

  // Se não é parceiro ou está carregando, não mostrar
  if (isLoading || !partnerData) {
    return null;
  }

  return (
    <div className="bg-gradient-to-br from-amber-900/90 via-yellow-800/80 to-orange-900/90 rounded-xl border border-amber-500/30 p-6 backdrop-blur-sm hover:border-amber-400/50 transition-all duration-500 relative overflow-hidden group">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-amber-600/10 to-orange-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-radial from-amber-400/10 to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      
      {/* Floating Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-4 right-4 text-amber-300/40 animate-bounce" style={{ animationDelay: '0.5s' }}>
          👑
        </div>
        <div className="absolute bottom-6 left-6 text-yellow-300/30 animate-bounce" style={{ animationDelay: '1.5s' }}>
          💰
        </div>
        <div className="absolute top-1/2 right-8 text-orange-300/20 animate-pulse" style={{ animationDelay: '2s' }}>
          ⭐
        </div>
      </div>

      {/* Header */}
      <div className="relative z-10 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
              <Crown className="w-6 h-6 text-white animate-pulse" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-amber-100 group-hover:text-amber-50 transition-colors">
                🎉 Parabéns, Sócio! 🎉
              </h3>
              <div className="text-xs text-amber-300/80">Parceiro Oficial da AlphaBit</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-green-400 text-xs font-medium">ATIVO</span>
          </div>
        </div>

        {/* Congratulations Message */}
        <div className="bg-gradient-to-r from-amber-800/50 to-orange-800/30 rounded-lg p-4 border border-amber-600/50 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Star className="h-5 w-5 text-amber-300" />
            <span className="text-amber-200 font-semibold">Status: Sócio Oficial</span>
          </div>
          <p className="text-amber-100 text-sm leading-relaxed">
            Você faz parte da elite de parceiros da AlphaBit! 🚀 
            Ganhe <span className="font-bold text-yellow-300">{partnerData.commission_percentage}%</span> de 
            comissão sobre TODOS os depósitos realizados na plataforma.
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Total Earnings */}
        <div className="bg-amber-800/30 rounded-lg p-4 border border-amber-600/30 group-hover:border-amber-500/50 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="h-5 w-5 text-amber-300" />
            <span className="text-amber-200 text-xs">Total Ganho</span>
          </div>
          <div className="text-white font-bold text-xl mb-1">
            ${partnerData.total_earnings.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-amber-300 text-xs">Comissões acumuladas</div>
        </div>

        {/* Monthly Earnings */}
        <div className="bg-amber-800/30 rounded-lg p-4 border border-amber-600/30 group-hover:border-amber-500/50 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="h-5 w-5 text-amber-300" />
            <span className="text-amber-200 text-xs">Este Mês</span>
          </div>
          <div className="text-white font-bold text-xl mb-1">
            ${monthlyEarnings.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-green-400 text-xs">+{Math.round((monthlyEarnings / Math.max(partnerData.total_earnings, 1)) * 100)}% do total</div>
        </div>

        {/* Commission Rate */}
        <div className="bg-amber-800/30 rounded-lg p-4 border border-amber-600/30 group-hover:border-amber-500/50 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <Zap className="h-5 w-5 text-amber-300" />
            <span className="text-amber-200 text-xs">Comissão</span>
          </div>
          <div className="text-white font-bold text-xl mb-1">
            {partnerData.commission_percentage}%
          </div>
          <div className="text-amber-300 text-xs">Sobre todos os depósitos</div>
        </div>

        {/* Total Company Deposits */}
        <div className="bg-amber-800/30 rounded-lg p-4 border border-amber-600/30 group-hover:border-amber-500/50 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <Users className="h-5 w-5 text-amber-300" />
            <span className="text-amber-200 text-xs">Volume Total</span>
          </div>
          <div className="text-white font-bold text-xl mb-1">
            ${partnerData.total_deposits.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-amber-300 text-xs">Depósitos da empresa</div>
        </div>
      </div>

      {/* Partner Benefits */}
      <div className="relative z-10 bg-gradient-to-r from-amber-900/50 to-amber-800/30 rounded-lg p-4 border border-amber-500/30">
        <div className="flex items-center gap-2 mb-3">
          <Gift className="h-5 w-5 text-amber-300" />
          <span className="text-amber-200 font-semibold">Benefícios Exclusivos</span>
        </div>
        <div className="grid grid-cols-1 gap-2 text-xs text-amber-100">
          <div className="flex items-center gap-2">
            <div className="w-1 h-1 bg-amber-400 rounded-full"></div>
            <span>Comissão de {partnerData.commission_percentage}% sobre TODOS os depósitos da plataforma</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1 h-1 bg-amber-400 rounded-full"></div>
            <span>Pagamentos automáticos das comissões</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1 h-1 bg-amber-400 rounded-full"></div>
            <span>Acesso prioritário a novos recursos e funcionalidades</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1 h-1 bg-amber-400 rounded-full"></div>
            <span>Suporte técnico VIP exclusivo para sócios</span>
          </div>
        </div>
      </div>

      {/* Recent Commissions */}
      {commissions.length > 0 && (
        <div className="relative z-10 mt-4">
          <div className="text-amber-200 text-sm font-semibold mb-2">
            Últimas Comissões ({commissions.length})
          </div>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {commissions.slice(0, 3).map((commission, index) => (
              <div 
                key={index}
                className="flex items-center justify-between text-xs bg-amber-800/20 rounded p-2"
              >
                <div className="text-amber-200">
                  ${commission.deposit_amount.toLocaleString()} depósito
                </div>
                <div className="text-green-400 font-semibold">
                  +${commission.commission_amount.toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};