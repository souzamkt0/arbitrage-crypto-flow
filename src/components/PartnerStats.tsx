import React, { useState, useEffect } from 'react';
import { 
  Crown, 
  DollarSign, 
  TrendingUp, 
  Users, 
  Gift, 
  Star, 
  Zap,
  Calendar,
  Calculator,
  Sparkles,
  ArrowUp,
  Clock,
  Banknote
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  const [showSimulator, setShowSimulator] = useState(false);
  const [simulatedAmount, setSimulatedAmount] = useState(1000);

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

  // Calculadora de simulação
  const calculatePartnerAdvantage = (amount: number) => {
    const regularProfit = amount * 0.05; // 5% lucro regular
    const partnerProfit = amount * 0.055; // 5.5% lucro como sócio (10% a mais)
    const advantage = partnerProfit - regularProfit;
    return { regularProfit, partnerProfit, advantage };
  };

  const simulation = calculatePartnerAdvantage(simulatedAmount);

  // Se não é parceiro ou está carregando, não mostrar
  if (isLoading || !partnerData) {
    return null;
  }

  return (
    <div className="bg-gradient-to-br from-navy-900 via-blue-900/95 to-slate-900/95 rounded-xl border-2 border-navy-500/40 p-6 backdrop-blur-sm hover:border-navy-400/60 transition-all duration-500 relative overflow-hidden group shadow-2xl animate-fade-in">
      {/* Enhanced Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-navy-600/15 to-blue-600/15 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-radial from-blue-400/15 to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      <div className="absolute -top-10 -left-10 w-32 h-32 bg-gradient-radial from-navy-400/10 to-transparent rounded-full animate-pulse"></div>
      
      {/* Floating Elements with Enhanced Animation */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-6 right-6 text-3xl animate-bounce" style={{ animationDelay: '0.5s' }}>
          👑
        </div>
        <div className="absolute bottom-8 left-8 text-2xl animate-bounce" style={{ animationDelay: '1.5s' }}>
          💰
        </div>
        <div className="absolute top-1/2 right-12 text-xl animate-pulse" style={{ animationDelay: '2s' }}>
          ⭐
        </div>
        <div className="absolute bottom-1/3 right-1/4 text-lg animate-pulse" style={{ animationDelay: '3s' }}>
          💎
        </div>
      </div>

      {/* Enhanced Header */}
      <div className="relative z-10 mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-navy-400 via-blue-500 to-navy-600 rounded-2xl flex items-center justify-center shadow-xl animate-pulse">
              <Crown className="w-8 h-8 text-white drop-shadow-lg" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-navy-50 group-hover:text-white transition-colors mb-1">
                🎉 PARABÉNS, SÓCIO! 🎉
              </h2>
              <div className="text-sm text-navy-300/90 font-medium">Parceiro Oficial da AlphaBit Trading</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-lg"></div>
            <span className="text-green-400 text-sm font-bold tracking-wide">ATIVO</span>
          </div>
        </div>

        {/* Enhanced Congratulations Message */}
        <div className="bg-gradient-to-r from-navy-800/60 to-blue-800/40 rounded-xl p-6 border-2 border-navy-600/50 mb-6 transform hover:scale-105 transition-all duration-300">
          <div className="flex items-center gap-3 mb-3">
            <Star className="h-6 w-6 text-navy-300 animate-pulse" />
            <span className="text-navy-200 font-bold text-lg">Status: Sócio Elite</span>
          </div>
          <p className="text-navy-100 text-base leading-relaxed">
            Você faz parte da <span className="font-bold text-blue-300">elite de parceiros</span> da AlphaBit! 🚀 
            Ganhe <span className="font-bold text-blue-300 text-xl">{partnerData.commission_percentage}%</span> de 
            comissão sobre <span className="font-bold text-blue-300">TODOS</span> os depósitos realizados na plataforma.
          </p>
        </div>
      </div>

      {/* Enhanced Stats Grid */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Total Earnings */}
        <div className="bg-navy-800/30 rounded-lg p-4 border border-navy-600/30 group-hover:border-navy-500/50 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="h-5 w-5 text-navy-300" />
            <span className="text-navy-200 text-xs">Total Ganho</span>
          </div>
          <div className="text-white font-bold text-xl mb-1">
            R$ {partnerData.total_earnings.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-navy-300 text-xs">Comissões acumuladas</div>
        </div>

        {/* Monthly Earnings */}
        <div className="bg-navy-800/30 rounded-lg p-4 border border-navy-600/30 group-hover:border-navy-500/50 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="h-5 w-5 text-navy-300" />
            <span className="text-navy-200 text-xs">Este Mês</span>
          </div>
          <div className="text-white font-bold text-xl mb-1">
            R$ {monthlyEarnings.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-green-400 text-xs">+{Math.round((monthlyEarnings / Math.max(partnerData.total_earnings, 1)) * 100)}% do total</div>
        </div>

        {/* Commission Rate */}
        <div className="bg-navy-800/30 rounded-lg p-4 border border-navy-600/30 group-hover:border-navy-500/50 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <Zap className="h-5 w-5 text-navy-300" />
            <span className="text-navy-200 text-xs">Comissão</span>
          </div>
          <div className="text-white font-bold text-xl mb-1">
            {partnerData.commission_percentage}%
          </div>
          <div className="text-navy-300 text-xs">Sobre todos os depósitos</div>
        </div>

        {/* Total Company Deposits */}
        <div className="bg-navy-800/30 rounded-lg p-4 border border-navy-600/30 group-hover:border-navy-500/50 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <Users className="h-5 w-5 text-navy-300" />
            <span className="text-navy-200 text-xs">Volume Total</span>
          </div>
          <div className="text-white font-bold text-xl mb-1">
            R$ {partnerData.total_deposits.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-navy-300 text-xs">Depósitos da empresa</div>
        </div>
      </div>

      {/* Informação de Saque Semanal */}
      <div className="relative z-10 bg-gradient-to-r from-blue-900/30 to-navy-900/30 rounded-lg p-4 border border-blue-500/30 mb-6">
        <div className="flex items-center gap-3 mb-2">
          <Calendar className="h-5 w-5 text-blue-400" />
          <span className="text-white font-semibold">Saques Semanais</span>
          <Badge className="bg-blue-500/20 text-blue-300 border-blue-400/30">
            TODA SEXTA
          </Badge>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-navy-200 text-sm">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span>Disponível toda sexta-feira às 18h</span>
          </div>
          <div className="flex items-center gap-2">
            <Banknote className="h-4 w-4" />
            <span>Processamento automático via PIX</span>
          </div>
        </div>
      </div>

      {/* Simulador de Vantagem do Sócio */}
      <div className="relative z-10 bg-gradient-to-r from-green-900/20 to-emerald-900/20 rounded-lg p-4 border border-green-500/30 mb-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-green-400" />
            <span className="text-white font-semibold">Simulador: Ganhos 10% Maiores</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSimulator(!showSimulator)}
            className="border-green-500/30 text-green-300 hover:bg-green-500/10"
          >
            {showSimulator ? 'Ocultar' : 'Mostrar'}
          </Button>
        </div>
        
        {showSimulator && (
          <div className="space-y-4">
            <div>
              <label className="text-navy-200 text-sm block mb-2">
                Valor do Investimento (R$):
              </label>
              <input
                type="number"
                value={simulatedAmount}
                onChange={(e) => setSimulatedAmount(Number(e.target.value))}
                className="w-full bg-navy-800/50 border border-navy-600/30 rounded-lg px-3 py-2 text-white"
                placeholder="1000"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-navy-800/30 rounded-lg p-3">
                <div className="text-navy-300 text-xs mb-1">Usuário Comum</div>
                <div className="text-white font-semibold">
                  R$ {simulation.regularProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
                <div className="text-navy-400 text-xs">5% de lucro</div>
              </div>
              
              <div className="bg-green-900/30 rounded-lg p-3 border border-green-500/30">
                <div className="text-green-300 text-xs mb-1">Sócio VIP</div>
                <div className="text-green-400 font-semibold">
                  R$ {simulation.partnerProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
                <div className="text-green-500 text-xs">5.5% de lucro</div>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-yellow-900/20 to-orange-900/20 rounded-lg p-3 border border-yellow-500/30">
              <div className="flex items-center justify-center gap-2 text-yellow-400">
                <ArrowUp className="h-4 w-4" />
                <span className="font-semibold">
                  +R$ {simulation.advantage.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} 
                </span>
                <span className="text-yellow-300 text-sm">(+10% a mais)</span>
              </div>
              <div className="text-center text-yellow-200 text-xs mt-1">
                Vantagem exclusiva do sócio
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Partner Benefits */}
      <div className="relative z-10 bg-gradient-to-r from-navy-900/50 to-navy-800/30 rounded-lg p-4 border border-navy-500/30 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Gift className="h-5 w-5 text-navy-300" />
          <span className="text-navy-200 font-semibold">Benefícios Exclusivos</span>
        </div>
        <div className="grid grid-cols-1 gap-2 text-xs text-navy-100">
          <div className="flex items-center gap-2">
            <div className="w-1 h-1 bg-navy-400 rounded-full"></div>
            <span>Comissão de {partnerData.commission_percentage}% sobre TODOS os depósitos da plataforma</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1 h-1 bg-navy-400 rounded-full"></div>
            <span>Lucros 10% maiores em todos os investimentos</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1 h-1 bg-navy-400 rounded-full"></div>
            <span>Saques automáticos toda sexta-feira</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1 h-1 bg-navy-400 rounded-full"></div>
            <span>Suporte técnico VIP exclusivo para sócios</span>
          </div>
        </div>
      </div>

      {/* Recent Commissions */}
      {commissions.length > 0 && (
        <div className="relative z-10 mb-4">
          <div className="text-navy-200 text-sm font-semibold mb-2">
            Últimas Comissões ({commissions.length})
          </div>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {commissions.slice(0, 3).map((commission, index) => (
              <div 
                key={index}
                className="flex items-center justify-between text-xs bg-navy-800/20 rounded p-2"
              >
                <div className="text-navy-200">
                  R$ {commission.deposit_amount.toLocaleString('pt-BR')} depósito
                </div>
                <div className="text-green-400 font-semibold">
                  +R$ {commission.commission_amount.toLocaleString('pt-BR')}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Call to Action */}
      <div className="relative z-10 text-center">
        <Button 
          className="bg-gradient-to-r from-blue-600 to-navy-600 hover:from-blue-700 hover:to-navy-700 text-white font-semibold px-6 py-2 shadow-lg"
          onClick={() => {
            toast({
              title: "Parabéns! 🎉",
              description: "Você já é um sócio VIP! Continue aproveitando suas vantagens exclusivas.",
              variant: "default"
            });
          }}
        >
          <Crown className="h-4 w-4 mr-2" />
          Status Sócio Ativo
        </Button>
      </div>
    </div>
  );
};