import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { DigitoPayService } from '@/services/digitopayService';
import { useAuth } from '@/hooks/useAuth';
import { History, RefreshCw, Eye } from 'lucide-react';
interface Transaction {
  id: string;
  trx_id: string;
  type: 'deposit' | 'withdrawal';
  amount: number;
  amount_brl: number;
  status: string;
  created_at: string;
  updated_at: string;
  pix_code?: string;
  pix_key?: string;
  pix_key_type?: string;
  person_name?: string;
  person_cpf?: string;
}
export const DigitoPayHistory: React.FC = () => {
  const {
    user
  } = useAuth();
  const {
    toast
  } = useToast();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  // Função para carregar transações
  const loadTransactions = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const result = await DigitoPayService.getUserTransactions(user.id);
      if (result.success) {
        setTransactions(result.data);
      } else {
        throw new Error('Erro ao carregar transações');
      }
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao carregar histórico',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // Carregar transações ao montar o componente
  useEffect(() => {
    loadTransactions();
  }, [user]);

  // Função para formatar data
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Função para obter cor do status
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Função para traduzir status
  const translateStatus = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Concluído';
      case 'pending':
        return 'Pendente';
      case 'failed':
        return 'Falhou';
      case 'cancelled':
        return 'Cancelado';
      default:
        return status;
    }
  };

  // Função para traduzir tipo
  const translateType = (type: string) => {
    return type === 'deposit' ? 'Depósito' : 'Saque';
  };
  return <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <History className="h-5 w-5" />
              <CardTitle>Histórico de Transações</CardTitle>
            </div>
            <Button variant="outline" size="sm" onClick={loadTransactions} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
          </div>
          <CardDescription>
            Histórico de depósitos e saques via PIX
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? <div className="text-center py-8">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2" />
              <p>Carregando transações...</p>
            </div> : transactions.length === 0 ? <div className="text-center py-8">
              <History className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-muted-foreground">Nenhuma transação encontrada</p>
            </div> : <div className="space-y-3">
              {transactions.map(transaction => <div key={transaction.id} className="border rounded-lg p-4 transition-colors bg-gray-900">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-medium">
                          {translateType(transaction.type)}
                        </span>
                        <Badge className={getStatusColor(transaction.status)}>
                          {translateStatus(transaction.status)}
                        </Badge>
                      </div>
                      
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p>Valor: R$ {transaction.amount_brl.toFixed(2)}</p>
                        <p>Data: {formatDate(transaction.created_at)}</p>
                        <p>ID: {transaction.trx_id}</p>
                      </div>
                    </div>

                    <Button variant="outline" size="sm" onClick={() => setSelectedTransaction(transaction)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>)}
            </div>}
        </CardContent>
      </Card>

      {/* Modal de detalhes da transação */}
      {selectedTransaction && <Card className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <CardContent className="rounded-lg p-6 max-w-md w-full mx-4 max-h-[80vh] overflow-y-auto bg-gray-950">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Detalhes da Transação</h3>
              <Button variant="outline" size="sm" onClick={() => setSelectedTransaction(null)}>
                ×
              </Button>
            </div>

            <div className="space-y-3 text-sm">
              <div>
                <span className="font-medium">Tipo:</span>
                <span className="ml-2">{translateType(selectedTransaction.type)}</span>
              </div>
              
              <div>
                <span className="font-medium">Status:</span>
                <Badge className={`ml-2 ${getStatusColor(selectedTransaction.status)}`}>
                  {translateStatus(selectedTransaction.status)}
                </Badge>
              </div>
              
              <div>
                <span className="font-medium">Valor:</span>
                <span className="ml-2">R$ {selectedTransaction.amount_brl.toFixed(2)}</span>
              </div>
              
              <div>
                <span className="font-medium">ID da Transação:</span>
                <span className="ml-2 font-mono">{selectedTransaction.trx_id}</span>
              </div>
              
              <div>
                <span className="font-medium">Data de Criação:</span>
                <span className="ml-2">{formatDate(selectedTransaction.created_at)}</span>
              </div>
              
              <div>
                <span className="font-medium">Última Atualização:</span>
                <span className="ml-2">{formatDate(selectedTransaction.updated_at)}</span>
              </div>

              {selectedTransaction.person_name && <div>
                  <span className="font-medium">Nome:</span>
                  <span className="ml-2">{selectedTransaction.person_name}</span>
                </div>}

              {selectedTransaction.person_cpf && <div>
                  <span className="font-medium">CPF:</span>
                  <span className="ml-2">{selectedTransaction.person_cpf}</span>
                </div>}

              {selectedTransaction.pix_code && <div>
                  <span className="font-medium">Código PIX:</span>
                  <div className="mt-1 p-2 rounded font-mono text-xs break-all bg-zinc-700">
                    {selectedTransaction.pix_code}
                  </div>
                </div>}

              {selectedTransaction.pix_key && <div>
                  <span className="font-medium">Chave PIX:</span>
                  <span className="ml-2">{selectedTransaction.pix_key}</span>
                </div>}

              {selectedTransaction.pix_key_type && <div>
                  <span className="font-medium">Tipo da Chave:</span>
                  <span className="ml-2">{selectedTransaction.pix_key_type}</span>
                </div>}
            </div>
          </CardContent>
        </Card>}
    </div>;
};