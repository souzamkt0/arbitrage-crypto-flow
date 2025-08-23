import React, { useState, useEffect } from 'react';
import { DigitoPayWebhookTest } from '@/components/DigitoPayWebhookTest';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { RefreshCw, Database, CheckCircle, AlertTriangle } from 'lucide-react';

interface Transaction {
  id: string;
  external_id: string;
  trx_id: string;
  type: string;
  amount: number;
  amount_brl: number;
  status: string;
  created_at: string;
  user_id: string;
}

interface WebhookLog {
  id: string;
  provider: string;
  event_type: string;
  external_id: string;
  status: string;
  error_message?: string;
  received_at: string;
  processed_at?: string;
}

const DigitoPayTest: React.FC = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [webhookLogs, setWebhookLogs] = useState<WebhookLog[]>([]);
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Carregar transações recentes
      const { data: transactionsData, error: transactionsError } = await supabase
        .from('digitopay_transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (transactionsError) {
        console.error('Erro ao carregar transações:', transactionsError);
      } else {
        setTransactions(transactionsData || []);
      }

      // Carregar logs de webhook recentes
      const { data: logsData, error: logsError } = await supabase
        .from('webhook_logs')
        .select('*')
        .eq('provider', 'digitopay')
        .order('received_at', { ascending: false })
        .limit(10);

      if (logsError) {
        console.error('Erro ao carregar logs:', logsError);
      } else {
        setWebhookLogs(logsData || []);
      }

    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
      case 'paid':
      case 'processed':
        return 'text-green-400';
      case 'pending':
      case 'waiting_payment':
      case 'received':
        return 'text-yellow-400';
      case 'failed':
      case 'error':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-4 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Acesso Restrito</h1>
          <p className="text-gray-400">Faça login para acessar o teste de webhooks</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            🧪 Teste DigitoPay Webhook
          </h1>
          <p className="text-gray-400">
            Sistema de teste para validar ativação automática de saldo
          </p>
        </div>

        {/* Componente de Teste */}
        <DigitoPayWebhookTest />

        {/* Dados do Sistema */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Transações Recentes */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="border-b border-slate-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Database className="h-5 w-5 text-blue-400" />
                  <CardTitle className="text-white">Transações Recentes</CardTitle>
                </div>
                <Button
                  onClick={loadData}
                  variant="outline"
                  size="sm"
                  disabled={loading}
                  className="border-slate-600 text-slate-300"
                >
                  <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {transactions.length === 0 ? (
                  <p className="text-gray-400 text-center py-4">
                    Nenhuma transação encontrada
                  </p>
                ) : (
                  transactions.map((tx) => (
                    <div key={tx.id} className="bg-slate-700/50 rounded-lg p-3 border border-slate-600">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="text-sm font-medium text-white">
                            {tx.external_id || tx.trx_id}
                          </p>
                          <p className="text-xs text-gray-400">
                            {formatDate(tx.created_at)}
                          </p>
                        </div>
                        <span className={`text-xs font-medium px-2 py-1 rounded ${getStatusColor(tx.status)} bg-slate-600`}>
                          {tx.status}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">{tx.type}</span>
                        <span className="text-green-400 font-medium">
                          ${tx.amount} / R$ {tx.amount_brl}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Logs de Webhook */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="border-b border-slate-700">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-400" />
                <CardTitle className="text-white">Logs de Webhook</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {webhookLogs.length === 0 ? (
                  <p className="text-gray-400 text-center py-4">
                    Nenhum webhook recebido
                  </p>
                ) : (
                  webhookLogs.map((log) => (
                    <div key={log.id} className="bg-slate-700/50 rounded-lg p-3 border border-slate-600">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="text-sm font-medium text-white">
                            {log.event_type}
                          </p>
                          <p className="text-xs text-gray-400">
                            {log.external_id}
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          {log.status === 'processed' ? (
                            <CheckCircle className="h-4 w-4 text-green-400" />
                          ) : log.status === 'error' ? (
                            <AlertTriangle className="h-4 w-4 text-red-400" />
                          ) : (
                            <div className="h-4 w-4 bg-yellow-400 rounded-full" />
                          )}
                          <span className={`text-xs font-medium ${getStatusColor(log.status)}`}>
                            {log.status}
                          </span>
                        </div>
                      </div>
                      <div className="text-xs text-gray-400">
                        Recebido: {formatDate(log.received_at)}
                        {log.processed_at && (
                          <span className="block">
                            Processado: {formatDate(log.processed_at)}
                          </span>
                        )}
                        {log.error_message && (
                          <span className="block text-red-400 mt-1">
                            Erro: {log.error_message}
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Instruções */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">📋 Como Testar o Sistema</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-green-400 font-semibold mb-2">✅ Fluxo Correto:</h4>
                <ol className="text-sm text-gray-300 space-y-1 list-decimal list-inside">
                  <li>Vá para a página de Depósito</li>
                  <li>Crie um depósito (valor mínimo $1)</li>
                  <li>Copie o external_id da transação criada</li>
                  <li>Volte aqui e cole no campo "External ID"</li>
                  <li>Selecione "PIX Confirmado" e "Completed"</li>
                  <li>Clique em "Simular Webhook"</li>
                  <li>Verifique se o saldo foi creditado automaticamente</li>
                </ol>
              </div>
              <div>
                <h4 className="text-yellow-400 font-semibold mb-2">🔍 O que Verificar:</h4>
                <ul className="text-sm text-gray-300 space-y-1 list-disc list-inside">
                  <li>Transação encontrada pelo external_id</li>
                  <li>Status atualizado para "completed"</li>
                  <li>Trigger automático ativou o saldo</li>
                  <li>Log de webhook registrado como "processed"</li>
                  <li>Saldo do usuário foi incrementado</li>
                  <li>Mensagem de sucesso no toast</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DigitoPayTest;