import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  TrendingUp, 
  DollarSign,
  Clock,
  Activity,
  Calendar,
  Target,
  Zap
} from "lucide-react";
import { TradingProfitsService, TradingProfit, TradingStats } from "@/services/tradingProfitsService";

export const TradingHistory = () => {
  const [profits, setProfits] = useState<TradingProfit[]>([]);
  const [stats, setStats] = useState<TradingStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'all' | 'today' | 'week' | 'month'>('all');

  useEffect(() => {
    loadData();
  }, [selectedPeriod]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Carregar estatísticas
      const userStats = await TradingProfitsService.getUserStats();
      setStats(userStats);

      // Carregar histórico baseado no período selecionado
      let profitsData: TradingProfit[] = [];
      
      if (selectedPeriod === 'all') {
        profitsData = await TradingProfitsService.getUserProfits(100);
      } else {
        const now = new Date();
        let startDate: string;
        
        switch (selectedPeriod) {
          case 'today':
            startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
            break;
          case 'week':
            startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
            break;
          case 'month':
            startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate()).toISOString();
            break;
          default:
            startDate = new Date(0).toISOString();
        }
        
        profitsData = await TradingProfitsService.getProfitsByPeriod(startDate, now.toISOString());
      }
      
      setProfits(profitsData);
    } catch (error) {
      console.error('Erro ao carregar dados de trading:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'USD'
    }).format(value || 0);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPlanColor = (planName: string) => {
    if (planName.includes('4.0.5')) return 'bg-blue-500/20 text-blue-400 border-blue-400/30';
    if (planName.includes('4.1.0')) return 'bg-purple-500/20 text-purple-400 border-purple-400/30';
    return 'bg-green-500/20 text-green-400 border-green-400/30';
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-400 mx-auto"></div>
          <p className="text-gray-400 mt-2">Carregando histórico...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Estatísticas Gerais */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-black/60 border border-green-400/30">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-400/20 rounded-full flex items-center justify-center">
                  <DollarSign className="h-5 w-5 text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Total Investido</p>
                  <p className="text-lg font-bold text-white">{formatCurrency(stats.total_invested)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black/60 border border-green-400/30">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-400/20 rounded-full flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Lucro Total</p>
                  <p className="text-lg font-bold text-green-400">{formatCurrency(stats.total_profit)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black/60 border border-blue-400/30">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-400/20 rounded-full flex items-center justify-center">
                  <Activity className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Operações</p>
                  <p className="text-lg font-bold text-white">{stats.total_operations}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black/60 border border-yellow-400/30">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-yellow-400/20 rounded-full flex items-center justify-center">
                  <Target className="h-5 w-5 text-yellow-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Taxa Média</p>
                  <p className="text-lg font-bold text-yellow-400">{stats.avg_daily_rate.toFixed(2)}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filtros de Período */}
      <div className="flex gap-2">
        {(['all', 'today', 'week', 'month'] as const).map((period) => (
          <Button
            key={period}
            variant={selectedPeriod === period ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedPeriod(period)}
            className={selectedPeriod === period ? "bg-green-400/20 border-green-400 text-green-400" : ""}
          >
            {period === 'all' && 'Todos'}
            {period === 'today' && 'Hoje'}
            {period === 'week' && '7 dias'}
            {period === 'month' && '30 dias'}
          </Button>
        ))}
      </div>

      {/* Histórico de Ganhos */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Zap className="h-5 w-5 text-yellow-400" />
          Histórico de Operações
        </h3>

        {profits.length === 0 ? (
          <Card className="bg-black/60 border border-gray-600/30">
            <CardContent className="p-8 text-center">
              <div className="text-gray-400 mb-2">Nenhuma operação encontrada</div>
              <p className="text-sm text-gray-500">Execute operações de trading para ver o histórico aqui</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {profits.map((profit) => (
              <Card key={profit.id} className="bg-black/60 border border-gray-600/30 hover:border-green-400/30 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-green-400/20 rounded-full flex items-center justify-center">
                        <TrendingUp className="h-6 w-6 text-green-400" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className={getPlanColor(profit.plan_name)}>
                            {profit.plan_name}
                          </Badge>
                          <span className="text-xs text-gray-400">
                            {profit.exchanges_count} exchanges
                          </span>
                        </div>
                        <div className="text-sm text-gray-300">
                          Investimento: {formatCurrency(profit.investment_amount)}
                        </div>
                        <div className="text-xs text-gray-500 flex items-center gap-2">
                          <Clock className="h-3 w-3" />
                          {formatDate(profit.created_at)}
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-lg font-bold text-green-400">
                        +{formatCurrency(profit.total_profit)}
                      </div>
                      <div className="text-xs text-gray-400">
                        Taxa: {profit.daily_rate}%
                      </div>
                      <div className="text-xs text-gray-500">
                        {profit.completed_operations}/{profit.exchanges_count} ops
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
