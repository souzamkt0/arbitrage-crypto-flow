import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { 
  ArrowLeft, 
  RefreshCw, 
  Eye, 
  Filter,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Users,
  Calendar,
  Hash,
  CreditCard
} from 'lucide-react';

interface DepositTransaction {
  id: string;
  trx_id: string;
  user_id: string;
  type: string;
  amount: number;
  amount_brl: number;
  status: string;
  person_name?: string;
  person_cpf?: string;
  pix_code?: string;
  created_at: string;
  updated_at: string;
  // Dados do usuário
  profiles?: {
    display_name: string;
    email: string;
    username: string;
  };
}

export const AdminDeposits = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, profile } = useAuth();
  
  const [deposits, setDeposits] = useState<DepositTransaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedDeposit, setSelectedDeposit] = useState<DepositTransaction | null>(null);
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    pending: 0,
    cancelled: 0,
    totalValue: 0,
    completedValue: 0
  });

  // Verificar se é admin
  useEffect(() => {
    if (profile && profile.role !== 'admin') {
      toast({
        title: 'Acesso Negado',
        description: 'Apenas administradores podem acessar esta página',
        variant: 'destructive'
      });
      navigate('/dashboard');
    }
  }, [profile, navigate, toast]);

  // Carregar depósitos
  const loadDeposits = async () => {
    setLoading(true);
    try {
      console.log('🔄 Carregando depósitos...');
      
      // Carregar depósitos (query simples primeiro)
      let query = supabase
        .from('digitopay_transactions')
        .select('*')
        .eq('type', 'deposit')
        .order('created_at', { ascending: false });

      if (selectedStatus !== 'all') {
        query = query.eq('status', selectedStatus);
      }

      const { data: transactionsData, error: transactionsError } = await query;

      if (transactionsError) {
        console.error('❌ Erro ao carregar transações:', transactionsError);
        throw new Error(`Erro na query de transações: ${transactionsError.message}`);
      }

      console.log('📊 Transações carregadas:', transactionsData?.length || 0);

      // Se não há transações, definir arrays vazios
      if (!transactionsData || transactionsData.length === 0) {
        console.log('📋 Nenhuma transação encontrada');
        setDeposits([]);
        setStats({
          total: 0,
          completed: 0,
          pending: 0,
          cancelled: 0,
          totalValue: 0,
          completedValue: 0
        });
        return;
      }

      // Carregar profiles separadamente se há transações
      const userIds = [...new Set(transactionsData.map(t => t.user_id).filter(Boolean))];
      let profilesData = [];
      
      if (userIds.length > 0) {
        console.log('👥 Carregando profiles para', userIds.length, 'usuários...');
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('user_id, display_name, email, username')
          .in('user_id', userIds);
        
        if (profilesError) {
          console.error('⚠️ Erro ao carregar profiles (continuando sem eles):', profilesError);
          profilesData = [];
        } else {
          profilesData = profiles || [];
          console.log('👥 Profiles carregados:', profilesData.length);
        }
      }

      // Combinar dados de forma segura
      const depositsWithProfiles = transactionsData.map(transaction => ({
        ...transaction,
        profiles: profilesData.find(p => p && p.user_id === transaction.user_id) || null
      }));

      console.log('✅ Depósitos processados:', depositsWithProfiles.length);
      setDeposits(depositsWithProfiles);

      // Calcular estatísticas de forma segura
      const allDeposits = depositsWithProfiles || [];
      const completed = allDeposits.filter(d => d.status === 'completed');
      const pending = allDeposits.filter(d => d.status === 'pending');
      const cancelled = allDeposits.filter(d => d.status === 'cancelled' || d.status === 'failed');

      const stats = {
        total: allDeposits.length,
        completed: completed.length,
        pending: pending.length,
        cancelled: cancelled.length,
        totalValue: allDeposits.reduce((sum, d) => sum + (Number(d.amount_brl) || 0), 0),
        completedValue: completed.reduce((sum, d) => sum + (Number(d.amount_brl) || 0), 0)
      };

      console.log('📊 Estatísticas calculadas:', stats);
      setStats(stats);

    } catch (error) {
      console.error('❌ Erro ao carregar depósitos:', error);
      toast({
        title: 'Erro',
        description: `Erro ao carregar depósitos: ${error.message}`,
        variant: 'destructive'
      });
      
      // Definir estados vazios em caso de erro
      setDeposits([]);
      setStats({
        total: 0,
        completed: 0,
        pending: 0,
        cancelled: 0,
        totalValue: 0,
        completedValue: 0
      });
    } finally {
      setLoading(false);
    }
  };

  // Carregar ao montar e configurar auto-sync
  useEffect(() => {
    loadDeposits();
    
    // Auto-sync a cada 30 segundos
    const interval = setInterval(loadDeposits, 30000);
    return () => clearInterval(interval);
  }, [selectedStatus]);

  // Formatar data
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Obter cor do status
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'cancelled':
      case 'failed':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  // Traduzir status
  const translateStatus = (status: string) => {
    switch (status) {
      case 'completed': return 'Pago';
      case 'pending': return 'Pendente';
      case 'cancelled': return 'Cancelado';
      case 'failed': return 'Falhou';
      default: return status;
    }
  };

  // Obter ícone do status
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'cancelled':
      case 'failed': return <XCircle className="h-4 w-4" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  if (profile?.role !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900/20 to-slate-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-800/90 to-slate-900/90 backdrop-blur-sm border-b border-blue-500/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/admin')}
                className="hover:bg-blue-500/10 text-blue-400 border border-blue-500/20 p-2"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <DollarSign className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">ADMIN - PIX DEPOSITS</h1>
                  <p className="text-xs text-gray-400">Gerenciamento de depósitos PIX</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 px-3 py-1 bg-green-500/20 rounded-full">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-green-400 text-sm font-medium">SYNC ATIVO</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-400 text-sm font-medium">Total Depósitos</p>
                  <p className="text-2xl font-bold text-white">{stats.total}</p>
                </div>
                <Users className="h-8 w-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500/10 to-green-600/10 border border-green-500/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-400 text-sm font-medium">Pagos</p>
                  <p className="text-2xl font-bold text-white">{stats.completed}</p>
                  <p className="text-xs text-green-300">R$ {stats.completedValue.toFixed(2)}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/10 border border-yellow-500/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-400 text-sm font-medium">Pendentes</p>
                  <p className="text-2xl font-bold text-white">{stats.pending}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-500/10 to-red-600/10 border border-red-500/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-400 text-sm font-medium">Cancelados</p>
                  <p className="text-2xl font-bold text-white">{stats.cancelled}</p>
                </div>
                <XCircle className="h-8 w-8 text-red-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros e Tabela */}
        <Card className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-sm border border-blue-500/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CreditCard className="h-5 w-5 text-blue-400" />
                <CardTitle className="text-white">Depósitos PIX</CardTitle>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-gray-400" />
                  <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                    <SelectTrigger className="w-40 bg-slate-800 border-slate-600">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="completed">Pagos</SelectItem>
                      <SelectItem value="pending">Pendentes</SelectItem>
                      <SelectItem value="cancelled">Cancelados</SelectItem>
                      <SelectItem value="failed">Falhou</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={loadDeposits}
                  disabled={loading}
                  className="border-blue-500/30 text-blue-400 hover:bg-blue-500/20"
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  Atualizar
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            {loading ? (
              <div className="text-center py-12">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-400" />
                <p className="text-gray-400">Carregando depósitos...</p>
              </div>
            ) : deposits.length === 0 ? (
              <div className="text-center py-12">
                <CreditCard className="h-8 w-8 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-400">Nenhum depósito encontrado</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-700">
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">ID</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Usuário</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Valor (USD)</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Valor (BRL)</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Status</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">CPF</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Data</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {deposits.map((deposit) => (
                      <tr key={deposit.id} className="border-b border-slate-800/50 hover:bg-slate-800/30">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <Hash className="h-3 w-3 text-gray-500" />
                            <span className="font-mono text-xs text-gray-300">
                              {deposit.trx_id.substring(0, 8)}...
                            </span>
                          </div>
                        </td>
                        
                        <td className="py-3 px-4">
                          <div>
                            <p className="text-white font-medium">
                              {deposit.profiles?.display_name || deposit.person_name || 'N/A'}
                            </p>
                            <p className="text-xs text-gray-400">
                              {deposit.profiles?.email || 'Email não disponível'}
                            </p>
                          </div>
                        </td>
                        
                        <td className="py-3 px-4">
                          <span className="text-blue-400 font-mono">
                            ${deposit.amount.toFixed(2)}
                          </span>
                        </td>
                        
                        <td className="py-3 px-4">
                          <span className="text-green-400 font-mono">
                            R$ {deposit.amount_brl.toFixed(2)}
                          </span>
                        </td>
                        
                        <td className="py-3 px-4">
                          <Badge className={`${getStatusColor(deposit.status)} border`}>
                            <div className="flex items-center gap-1">
                              {getStatusIcon(deposit.status)}
                              {translateStatus(deposit.status)}
                            </div>
                          </Badge>
                        </td>
                        
                        <td className="py-3 px-4">
                          <span className="font-mono text-sm text-gray-300">
                            {deposit.person_cpf || 'N/A'}
                          </span>
                        </td>
                        
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1 text-sm text-gray-400">
                            <Calendar className="h-3 w-3" />
                            {formatDate(deposit.created_at)}
                          </div>
                        </td>
                        
                        <td className="py-3 px-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedDeposit(deposit)}
                            className="border-blue-500/30 text-blue-400 hover:bg-blue-500/20"
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Modal de detalhes */}
      {selectedDeposit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <Card className="max-w-2xl w-full max-h-[80vh] overflow-y-auto bg-slate-900 border border-blue-500/30">
            <CardHeader className="border-b border-slate-700">
              <div className="flex items-center justify-between">
                <CardTitle className="text-white">Detalhes do Depósito</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedDeposit(null)}
                  className="border-gray-500/30"
                >
                  ×
                </Button>
              </div>
            </CardHeader>
            
            <CardContent className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-400">ID da Transação</label>
                  <p className="font-mono text-white">{selectedDeposit.trx_id}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-400">Status</label>
                  <div className="mt-1">
                    <Badge className={`${getStatusColor(selectedDeposit.status)} border`}>
                      <div className="flex items-center gap-1">
                        {getStatusIcon(selectedDeposit.status)}
                        {translateStatus(selectedDeposit.status)}
                      </div>
                    </Badge>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-400">Valor USD</label>
                  <p className="text-blue-400 font-mono">${selectedDeposit.amount.toFixed(2)}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-400">Valor BRL</label>
                  <p className="text-green-400 font-mono">R$ {selectedDeposit.amount_brl.toFixed(2)}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-400">Nome do Pagador</label>
                  <p className="text-white">{selectedDeposit.person_name || 'N/A'}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-400">CPF</label>
                  <p className="font-mono text-white">{selectedDeposit.person_cpf || 'N/A'}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-400">Criado em</label>
                  <p className="text-white">{formatDate(selectedDeposit.created_at)}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-400">Atualizado em</label>
                  <p className="text-white">{formatDate(selectedDeposit.updated_at)}</p>
                </div>
              </div>
              
              {selectedDeposit.pix_code && (
                <div>
                  <label className="text-sm font-medium text-gray-400">Código PIX</label>
                  <div className="mt-1 p-3 bg-slate-800 rounded border font-mono text-xs break-all text-gray-300">
                    {selectedDeposit.pix_code}
                  </div>
                </div>
              )}
              
              <div>
                <label className="text-sm font-medium text-gray-400">Usuário</label>
                <div className="mt-1 p-3 bg-slate-800 rounded border">
                  <p className="text-white font-medium">
                    {selectedDeposit.profiles?.display_name || 'Nome não disponível'}
                  </p>
                  <p className="text-sm text-gray-400">
                    {selectedDeposit.profiles?.email || 'Email não disponível'}
                  </p>
                  <p className="text-sm text-gray-400">
                    @{selectedDeposit.profiles?.username || 'Username não disponível'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};