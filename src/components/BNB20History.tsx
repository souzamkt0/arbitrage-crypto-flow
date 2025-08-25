import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { BNB20Service, BNB20Transaction } from '@/services/bnb20Service';
import { 
  RefreshCw, 
  ExternalLink, 
  Copy, 
  Eye, 
  TrendingUp, 
  TrendingDown,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export const BNB20History: React.FC = () => {
  const [transactions, setTransactions] = useState<BNB20Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTransaction, setSelectedTransaction] = useState<BNB20Transaction | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadTransactions = async () => {
    try {
      const data = await BNB20Service.getUserTransactions();
      setTransactions(data);
    } catch (error) {
      console.error('❌ Erro ao carregar transações:', error);
      toast.error('Erro ao carregar histórico');
    } finally {
      setIsLoading(false);
    }
  };

  const refreshTransactions = async () => {
    setIsRefreshing(true);
    try {
      await loadTransactions();
      toast.success('Histórico atualizado!');
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadTransactions();
    
    // Auto-refresh a cada 30 segundos
    const interval = setInterval(loadTransactions, 30000);
    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'finished':
      case 'admin_approved':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'failed':
      case 'admin_rejected':
      case 'expired':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'pending':
      case 'waiting':
        return <Clock className="h-4 w-4 text-blue-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
    }
  };

  const handleCopyTxId = (txId: string) => {
    navigator.clipboard.writeText(txId);
    toast.success('ID copiado!');
  };

  const handleViewDetails = (transaction: BNB20Transaction) => {
    setSelectedTransaction(transaction);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  const pendingTransactions = transactions.filter(tx => 
    ['pending', 'waiting', 'confirming'].includes(tx.status)
  );
  
  const completedTransactions = transactions.filter(tx => 
    !['pending', 'waiting', 'confirming'].includes(tx.status)
  );

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <RefreshCw className="h-6 w-6 animate-spin" />
            <span className="ml-2">Carregando histórico...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Histórico BNB20</CardTitle>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={refreshTransactions}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <Alert>
              <AlertDescription>
                Nenhuma transação BNB20 encontrada. Crie seu primeiro depósito ou saque!
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-6">
              {/* Transações Pendentes */}
              {pendingTransactions.length > 0 && (
                <div>
                  <h3 className="font-medium text-blue-600 mb-3">⏳ Transações Pendentes</h3>
                  <div className="space-y-3">
                    {pendingTransactions.map((transaction) => (
                      <div 
                        key={transaction.id}
                        className="flex items-center justify-between p-4 border border-blue-200 rounded-lg bg-blue-50"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex flex-col items-center">
                            {transaction.type === 'deposit' ? (
                              <TrendingUp className="h-5 w-5 text-green-600" />
                            ) : (
                              <TrendingDown className="h-5 w-5 text-red-600" />
                            )}
                            <span className="text-xs text-muted-foreground">
                              {transaction.type === 'deposit' ? 'Depósito' : 'Saque'}
                            </span>
                          </div>
                          
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">
                                {BNB20Service.formatUSD(transaction.amount_usd)}
                              </span>
                              <span className="text-sm text-muted-foreground">
                                → {BNB20Service.formatBNB(transaction.amount_bnb)}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              {getStatusIcon(transaction.status)}
                              <span>{BNB20Service.translateStatus(transaction.status)}</span>
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {formatDate(transaction.created_at)}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewDetails(transaction)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Histórico Geral */}
              <div>
                <h3 className="font-medium mb-3">📋 Histórico Completo</h3>
                <div className="space-y-3">
                  {completedTransactions.map((transaction) => (
                    <div 
                      key={transaction.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex flex-col items-center">
                          {transaction.type === 'deposit' ? (
                            <TrendingUp className="h-5 w-5 text-green-600" />
                          ) : (
                            <TrendingDown className="h-5 w-5 text-red-600" />
                          )}
                          <span className="text-xs text-muted-foreground">
                            {transaction.type === 'deposit' ? 'Depósito' : 'Saque'}
                          </span>
                        </div>
                        
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">
                              {BNB20Service.formatUSD(transaction.amount_usd)}
                            </span>
                            <span className="text-sm text-muted-foreground">
                              → {BNB20Service.formatBNB(transaction.amount_bnb)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            {getStatusIcon(transaction.status)}
                            <span className={BNB20Service.getStatusColor(transaction.status)}>
                              {BNB20Service.translateStatus(transaction.status)}
                            </span>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {formatDate(transaction.created_at)}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewDetails(transaction)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {transaction.payment_id && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCopyTxId(transaction.payment_id!)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de Detalhes */}
      <Dialog open={!!selectedTransaction} onOpenChange={() => setSelectedTransaction(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Detalhes da Transação</DialogTitle>
          </DialogHeader>
          {selectedTransaction && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-muted-foreground">Tipo</label>
                  <p className="font-medium">
                    {selectedTransaction.type === 'deposit' ? 'Depósito' : 'Saque'}
                  </p>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Status</label>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(selectedTransaction.status)}
                    <span className={BNB20Service.getStatusColor(selectedTransaction.status)}>
                      {BNB20Service.translateStatus(selectedTransaction.status)}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Valor USD</label>
                  <p className="font-medium">{BNB20Service.formatUSD(selectedTransaction.amount_usd)}</p>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Valor BNB</label>
                  <p className="font-medium">{BNB20Service.formatBNB(selectedTransaction.amount_bnb)}</p>
                </div>
              </div>

              {selectedTransaction.pay_address && (
                <div>
                  <label className="text-xs text-muted-foreground">Endereço</label>
                  <div className="flex items-center gap-2">
                    <code className="text-xs bg-muted p-2 rounded flex-1 overflow-hidden">
                      {selectedTransaction.pay_address}
                    </code>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleCopyTxId(selectedTransaction.pay_address!)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              {selectedTransaction.payment_id && (
                <div>
                  <label className="text-xs text-muted-foreground">ID do Pagamento</label>
                  <div className="flex items-center gap-2">
                    <code className="text-xs bg-muted p-2 rounded flex-1">
                      {selectedTransaction.payment_id}
                    </code>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleCopyTxId(selectedTransaction.payment_id!)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              <div>
                <label className="text-xs text-muted-foreground">Criado em</label>
                <p className="text-sm">{formatDate(selectedTransaction.created_at)}</p>
              </div>

              {selectedTransaction.admin_notes && (
                <div>
                  <label className="text-xs text-muted-foreground">Observações do Admin</label>
                  <p className="text-sm bg-muted p-2 rounded">{selectedTransaction.admin_notes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};