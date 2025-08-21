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
  Zap,
  Receipt,
  ArrowUpRight,
  ArrowDownLeft,
  FileText,
  Download
} from "lucide-react";
import { TradingProfitsService, TradingProfit, TradingStats } from "@/services/tradingProfitsService";

export const TradingHistoryExtrato = () => {
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

  const formatDateShort = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPlanColor = (planName: string) => {
    if (planName.includes('4.0.5')) return 'text-blue-400';
    if (planName.includes('4.1.0')) return 'text-purple-400';
    return 'text-green-400';
  };

  const getTransactionType = (profit: TradingProfit) => {
    return profit.total_profit > 0 ? 'CRÉDITO' : 'DÉBITO';
  };

  const getTransactionIcon = (profit: TradingProfit) => {
    return profit.total_profit > 0 ? 
      <ArrowUpRight className="h-4 w-4 text-green-400" /> : 
      <ArrowDownLeft className="h-4 w-4 text-red-400" />;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-400 mx-auto"></div>
          <p className="text-gray-400 mt-2">Carregando extrato...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cabeçalho do Extrato Bancário */}
      <Card className="bg-gradient-to-r from-gray-900 to-black border border-green-400/30 shadow-2xl">
        <CardHeader className="border-b border-green-400/20 pb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-400/20 rounded-full flex items-center justify-center">
                <Receipt className="h-6 w-6 text-green-400" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold text-white mb-1">
                  Extrato de Operações
                </CardTitle>
                <p className="text-gray-400 text-sm">
                  Histórico completo de lucros e operações
                </p>
              </div>
            </div>
            <Button variant="outline" className="border-green-400/30 text-green-400 hover:bg-green-400/10">
              <Download className="h-4 w-4 mr-2" />
              Exportar PDF
            </Button>
          </div>
        </CardHeader>

        {/* Resumo Financeiro */}
        {stats && (
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <DollarSign className="h-5 w-5 text-blue-400" />
                  <span className="text-sm text-gray-400 uppercase tracking-wider">Saldo Investido</span>
                </div>
                <div className="text-2xl font-bold text-white">{formatCurrency(stats.total_invested)}</div>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <TrendingUp className="h-5 w-5 text-green-400" />
                  <span className="text-sm text-gray-400 uppercase tracking-wider">Lucro Acumulado</span>
                </div>
                <div className="text-2xl font-bold text-green-400">+{formatCurrency(stats.total_profit)}</div>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Activity className="h-5 w-5 text-yellow-400" />
                  <span className="text-sm text-gray-400 uppercase tracking-wider">Operações</span>
                </div>
                <div className="text-2xl font-bold text-white">{stats.total_operations}</div>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Target className="h-5 w-5 text-purple-400" />
                  <span className="text-sm text-gray-400 uppercase tracking-wider">Taxa Média</span>
                </div>
                <div className="text-2xl font-bold text-purple-400">{stats.avg_daily_rate.toFixed(2)}%</div>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Filtros de Período */}
      <div className="flex gap-2 flex-wrap">
        {(['all', 'today', 'week', 'month'] as const).map((period) => (
          <Button
            key={period}
            variant={selectedPeriod === period ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedPeriod(period)}
            className={selectedPeriod === period 
              ? "bg-green-400/20 border-green-400 text-green-400" 
              : "border-gray-600 text-gray-400 hover:border-green-400/50"
            }
          >
            {period === 'all' && 'Todos os Períodos'}
            {period === 'today' && 'Hoje'}
            {period === 'week' && 'Últimos 7 dias'}
            {period === 'month' && 'Últimos 30 dias'}
          </Button>
        ))}
      </div>

      {/* Extrato de Transações */}
      <Card className="bg-black/80 border border-gray-700/50">
        <CardHeader className="border-b border-gray-700/50 pb-4">
          <CardTitle className="text-lg text-white flex items-center gap-2">
            <FileText className="h-5 w-5 text-green-400" />
            Extrato Detalhado de Transações
          </CardTitle>
        </CardHeader>

        <CardContent className="p-0">
          {profits.length === 0 ? (
            <div className="p-8 text-center">
              <div className="text-gray-400 mb-2">Nenhuma transação encontrada</div>
              <p className="text-sm text-gray-500">Execute operações de trading para ver o extrato aqui</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-700/50">
              {profits.map((profit, index) => (
                <div key={profit.id} className="p-4 hover:bg-gray-800/30 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {/* Ícone da transação */}
                      <div className="w-10 h-10 bg-green-400/10 rounded-full flex items-center justify-center border border-green-400/30">
                        {getTransactionIcon(profit)}
                      </div>
                      
                      {/* Detalhes da transação */}
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-white font-medium">
                            OPERAÇÃO ARBITRAGEM #{String(index + 1).padStart(4, '0')}
                          </span>
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${getPlanColor(profit.plan_name)} border-current`}
                          >
                            {profit.plan_name}
                          </Badge>
                        </div>
                        
                        <div className="text-sm text-gray-400 space-y-1">
                          <div className="flex items-center gap-4">
                            <span>Investimento: {formatCurrency(profit.investment_amount)}</span>
                            <span>•</span>
                            <span>Taxa: {profit.daily_rate}%</span>
                            <span>•</span>
                            <span>{profit.exchanges_count} exchanges</span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Clock className="h-3 w-3" />
                            <span>{formatDate(profit.created_at)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Valor e tipo da transação */}
                    <div className="text-right">
                      <div className="text-lg font-bold text-green-400 mb-1">
                        +{formatCurrency(profit.total_profit)}
                      </div>
                      <div className="text-xs text-gray-500 bg-gray-800/50 px-2 py-1 rounded">
                        {getTransactionType(profit)}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        {profit.completed_operations}/{profit.exchanges_count} ops
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Rodapé do Extrato */}
      <div className="text-center py-4 border-t border-gray-700/50">
        <p className="text-xs text-gray-500">
          Este extrato é gerado automaticamente pelo sistema de arbitragem Alpha • 
          Última atualização: {new Date().toLocaleString('pt-BR')}
        </p>
      </div>
    </div>
  );
};