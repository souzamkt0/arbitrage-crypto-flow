import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  TrendingUp, 
  Users, 
  DollarSign, 
  Calendar,
  ArrowUpRight,
  Sparkles,
  Target,
  Gift,
  BarChart3,
  Zap,
  Activity,
  LineChart,
  TrendingDown
} from "lucide-react";

interface ReferralStats {
  total_referrals: number;
  active_referrals: number;
  total_commissions: number;
  residual_balance: number;
  this_month_earnings: number;
}

const ResidualBalanceBox = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchReferralStats = async () => {
    if (!user?.id) return;

    try {
      setIsLoading(true);
      const { data, error } = await supabase.rpc('get_user_referral_stats', {
        target_user_id: user.id
      });

      if (error) throw error;

      if (data && data.length > 0) {
        setStats(data[0]);
      } else {
        setStats({
          total_referrals: 0,
          active_referrals: 0,
          total_commissions: 0,
          residual_balance: 0,
          this_month_earnings: 0
        });
      }
    } catch (error) {
      console.error('Erro ao buscar estatísticas de indicação:', error);
      toast({
        title: "Erro",
        description: "Falha ao carregar estatísticas de indicação",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReferralStats();
  }, [user?.id]);

  if (isLoading) {
    return (
      <div className="bg-[#1a1f2e] rounded-xl border border-gray-800 overflow-hidden animate-pulse">
        <div className="p-4 border-b border-gray-800">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-blue-500/30 rounded-full"></div>
            <div className="flex-1">
              <div className="w-24 h-4 bg-gray-700 rounded mb-1"></div>
              <div className="w-16 h-3 bg-gray-600 rounded"></div>
            </div>
          </div>
        </div>
        <div className="p-4 space-y-3">
          <div className="w-32 h-8 bg-gray-700 rounded mx-auto"></div>
          <div className="grid grid-cols-2 gap-3">
            <div className="h-16 bg-gray-700 rounded"></div>
            <div className="h-16 bg-gray-700 rounded"></div>
          </div>
          <div className="h-20 bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#1a1f2e] rounded-xl border border-gray-800 overflow-hidden group hover:border-blue-500/40 transition-all duration-500 shadow-xl hover:shadow-blue-500/20">
      {/* Background Trading Animation */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      
      {/* Floating Trading Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-3 right-3 text-blue-400/60 animate-bounce" style={{ animationDelay: '0.5s' }}>
          <BarChart3 className="w-4 h-4" />
        </div>
        <div className="absolute bottom-3 left-3 text-cyan-300/40 animate-pulse" style={{ animationDelay: '1.5s' }}>
          <LineChart className="w-3 h-3" />
        </div>
        <div className="absolute top-1/2 right-1/4 text-green-400/30 animate-pulse" style={{ animationDelay: '2s' }}>
          <TrendingUp className="w-3 h-3" />
        </div>
        <div className="absolute bottom-1/4 right-1/3 w-1 h-1 bg-blue-400/40 rounded-full animate-ping" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/4 left-1/3 w-1 h-1 bg-cyan-400/40 rounded-full animate-ping" style={{ animationDelay: '2.5s' }}></div>
      </div>

      {/* Header with trading theme */}
      <div className="p-4 border-b border-gray-800 relative z-10">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-full flex items-center justify-center shadow-md group-hover:shadow-blue-400/50 transition-all duration-300 animate-pulse">
            <Activity className="w-3 h-3 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-sm text-white group-hover:text-blue-300 transition-colors">
              Saldo Residual
            </h3>
            <div className="text-xs text-gray-400 flex items-center gap-1">
              <Zap className="w-3 h-3 text-yellow-400 animate-pulse" />
              Trading Network
            </div>
          </div>
          <div className="bg-gradient-to-r from-blue-600/90 to-cyan-600/90 text-white font-bold px-2 py-1 rounded text-xs border border-blue-400/50">
            10%
          </div>
        </div>
      </div>

      {/* Main Content with better padding */}
      <div className="p-4 space-y-4 relative z-10">
        {/* Balance Display with trading animations */}
        <div className="text-center bg-gradient-to-br from-slate-800/60 to-blue-950/40 rounded-lg p-4 border border-blue-500/30">
          <div className="text-2xl font-bold text-blue-400 flex items-center justify-center animate-pulse">
            <DollarSign className="w-5 h-5 mr-1 text-cyan-500 animate-bounce" />
            {stats?.residual_balance?.toFixed(2) || '0.00'}
          </div>
          <div className="text-blue-300/80 text-xs mt-1 flex items-center justify-center gap-1">
            <Activity className="w-3 h-3 text-green-400 animate-pulse" />
            Trading Residual Balance
          </div>
        </div>

        {/* Trading Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-800/60 rounded-lg p-3 border border-blue-500/40 hover:border-blue-400/60 transition-all duration-300 group/card">
            <div className="flex items-center justify-between mb-2">
              <Users className="h-4 w-4 text-blue-400 group-hover/card:animate-pulse" />
              <span className="text-blue-300 text-xs">Network</span>
            </div>
            <div className="text-blue-400 font-bold text-lg">{stats?.active_referrals || 0}</div>
            <div className="text-xs text-gray-400">Active Traders</div>
          </div>

          <div className="bg-slate-800/60 rounded-lg p-3 border border-green-500/40 hover:border-green-400/60 transition-all duration-300 group/card">
            <div className="flex items-center justify-between mb-2">
              <Calendar className="h-4 w-4 text-green-400 group-hover/card:animate-pulse" />
              <span className="text-green-300 text-xs">Monthly</span>
            </div>
            <div className="text-green-400 font-bold text-sm">
              ${stats?.this_month_earnings?.toFixed(2) || '0.00'}
            </div>
            <div className="text-xs text-gray-400">This Month</div>
          </div>
        </div>

        {/* Total Commissions with trading animation */}
        <div className="bg-gradient-to-r from-slate-800/80 to-blue-950/60 rounded-lg p-3 border border-blue-500/60 hover:border-cyan-400/80 transition-all duration-300 group/total">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <LineChart className="h-4 w-4 text-cyan-400 group-hover/total:animate-bounce" />
              <span className="text-cyan-300 text-sm font-semibold">Total Commissions</span>
            </div>
            <div className="flex items-center space-x-1">
              <TrendingUp className="h-3 w-3 text-green-400 animate-pulse" />
              <ArrowUpRight className="h-3 w-3 text-green-400" />
            </div>
          </div>
          <div className="text-cyan-400 font-bold text-lg flex items-center">
            <BarChart3 className="w-4 h-4 mr-1 text-green-400 animate-pulse" />
            ${stats?.total_commissions?.toFixed(2) || '0.00'}
          </div>
        </div>

        {/* Trading Action Buttons */}
        <div className="space-y-2">
          <Button
            onClick={() => window.location.href = '/referrals'}
            className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-blue-500/30 py-2.5 hover-scale"
          >
            <Target className="h-4 w-4 mr-2 animate-pulse" />
            Trading Network
            <Activity className="h-4 w-4 ml-2" />
          </Button>
          
          <Button
            variant="outline"
            onClick={fetchReferralStats}
            className="w-full border-gray-600 text-gray-300 hover:text-white hover:bg-gray-700 transition-all duration-300 py-2"
            size="sm"
          >
            <Sparkles className="h-4 w-4 mr-2 animate-spin" />
            Refresh Data
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ResidualBalanceBox;