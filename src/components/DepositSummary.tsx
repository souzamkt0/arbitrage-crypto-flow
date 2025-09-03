import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { TrendingUp, RefreshCw, DollarSign, CreditCard } from 'lucide-react';

interface DepositData {
  id: string;
  amount: number;
  amount_brl: number;
  status: string;
  created_at: string;
  source: 'digitopay' | 'deposits';
}

export const DepositSummary: React.FC = () => {
  const { user } = useAuth();
  const [deposits, setDeposits] = useState<DepositData[]>([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalDeposits: 0,
    totalBRL: 0,
    completedCount: 0,
    pendingCount: 0
  });

  const loadDeposits = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Buscar de ambas as tabelas
      const [digitopayResult, depositsResult] = await Promise.all([
        supabase
          .from('digitopay_transactions')
          .select('id, amount, amount_brl, status, created_at')
          .eq('user_id', user.id)
          .eq('type', 'deposit')
          .order('created_at', { ascending: false }),
        supabase
          .from('deposits')
          .select('id, amount_usd, amount_brl, status, created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
      ]);

      const allDeposits: DepositData[] = [];
      
      // Processar transações DigitoPay
      if (digitopayResult.data) {
        digitopayResult.data.forEach(d => {
          allDeposits.push({
            id: d.id,
            amount: d.amount || 0,
            amount_brl: d.amount_brl || 0,
            status: d.status,
            created_at: d.created_at,
            source: 'digitopay'
          });
        });
      }
      
      // Processar depósitos tradicionais
      if (depositsResult.data) {
        depositsResult.data.forEach(d => {
          allDeposits.push({
            id: d.id,
            amount: d.amount_usd || 0,
            amount_brl: d.amount_brl || 0,
            status: d.status === 'paid' ? 'completed' : d.status,
            created_at: d.created_at,
            source: 'deposits'
          });
        });
      }

      // Ordenar por data
      allDeposits.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      
      setDeposits(allDeposits);
      
      // Calcular estatísticas
      const completed = allDeposits.filter(d => d.status === 'completed' || d.status === 'paid');
      const pending = allDeposits.filter(d => d.status === 'pending');
      
      setStats({
        totalDeposits: completed.reduce((sum, d) => sum + d.amount, 0),
        totalBRL: completed.reduce((sum, d) => sum + d.amount_brl, 0),
        completedCount: completed.length,
        pendingCount: pending.length
      });
      
    } catch (error) {
      console.error('Erro ao carregar depósitos:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDeposits();
  }, [user]);

  const getStatusBadge = (status: string) => {
    const statusMap: { [key: string]: { color: string; text: string } } = {
      'completed': { color: 'bg-green-100 text-green-800', text: 'Concluído' },
      'paid': { color: 'bg-green-100 text-green-800', text: 'Pago' },
      'pending': { color: 'bg-yellow-100 text-yellow-800', text: 'Pendente' },
      'cancelled': { color: 'bg-red-100 text-red-800', text: 'Cancelado' },
      'failed': { color: 'bg-red-100 text-red-800', text: 'Falhou' }
    };
    
    const statusInfo = statusMap[status] || { color: 'bg-gray-100 text-gray-800', text: status };
    return <Badge className={statusInfo.color}>{statusInfo.text}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-green-100 dark:bg-green-900 rounded-lg p-2">
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total USD</p>
                <p className="text-lg font-bold">${stats.totalDeposits.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 dark:bg-blue-900 rounded-lg p-2">
                <CreditCard className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total BRL</p>
                <p className="text-lg font-bold">R$ {stats.totalBRL.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-green-100 dark:bg-green-900 rounded-lg p-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Concluídos</p>
                <p className="text-lg font-bold">{stats.completedCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-yellow-100 dark:bg-yellow-900 rounded-lg p-2">
                <RefreshCw className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pendentes</p>
                <p className="text-lg font-bold">{stats.pendingCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Deposits */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Depósitos Recentes
            </CardTitle>
            <Button
              onClick={loadDeposits}
              variant="outline"
              size="sm"
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {deposits.length > 0 ? (
              deposits.slice(0, 5).map((deposit) => (
                <div key={deposit.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${
                      deposit.status === 'completed' || deposit.status === 'paid' 
                        ? 'bg-green-500' 
                        : deposit.status === 'pending'
                        ? 'bg-yellow-500'
                        : 'bg-red-500'
                    }`} />
                    <div>
                      <div className="font-medium">R$ {deposit.amount_brl.toFixed(2)}</div>
                      <div className="text-sm text-muted-foreground">
                        ${deposit.amount.toFixed(2)} • {deposit.source === 'digitopay' ? 'DigitoPay' : 'Tradicional'}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    {getStatusBadge(deposit.status)}
                    <div className="text-sm text-muted-foreground mt-1">
                      {new Date(deposit.created_at).toLocaleDateString('pt-BR')}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                Nenhum depósito encontrado
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DepositSummary;
