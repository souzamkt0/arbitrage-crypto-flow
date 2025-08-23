import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Activity, Send, TestTube } from 'lucide-react';

export const DigitoPayWebhookTest: React.FC = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [externalId, setExternalId] = useState('');
  const [eventType, setEventType] = useState('pix.confirmed');
  const [status, setStatus] = useState('completed');

  const simulateWebhook = async () => {
    if (!externalId) {
      toast({
        title: 'External ID obrigatório',
        description: 'Informe o external_id da transação para testar',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);

    try {
      // Gerar payload do webhook simulado
      const webhookPayload = {
        id: `test_${Date.now()}`,
        external_reference: externalId,
        event_type: eventType,
        status: status,
        timestamp: new Date().toISOString(),
        pix: {
          id: `pix_${Date.now()}`,
          status: status,
          amount: 100,
          external_reference: externalId
        },
        transaction: {
          id: `trx_${Date.now()}`,
          status: status,
          amount: 100,
          external_reference: externalId
        }
      };

      console.log('🧪 Simulando webhook com payload:', webhookPayload);

      // Chamar a edge function webhook diretamente
      const response = await fetch('https://cbwpghrkfvczjqzefvix.supabase.co/functions/v1/digitopay-webhook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        },
        body: JSON.stringify(webhookPayload)
      });

      const result = await response.json();
      console.log('📥 Resposta do webhook:', result);

      if (response.ok && result.success) {
        toast({
          title: '✅ Webhook simulado com sucesso!',
          description: `Status atualizado para ${status}. ${result.trigger_will_activate ? 'Saldo será ativado automaticamente.' : 'Nenhuma ativação de saldo.'}`,
          duration: 8000
        });
      } else {
        toast({
          title: '❌ Erro no webhook',
          description: result.error || 'Falha na simulação',
          variant: 'destructive'
        });
      }

    } catch (error) {
      console.error('❌ Erro ao simular webhook:', error);
      toast({
        title: 'Erro na simulação',
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const checkTransaction = async () => {
    if (!externalId) {
      toast({
        title: 'External ID obrigatório',
        description: 'Informe o external_id para consultar',
        variant: 'destructive'
      });
      return;
    }

    try {
      // Buscar transação pelo external_id
      const { data: transactions, error } = await supabase
        .from('digitopay_transactions')
        .select('*')
        .eq('external_id', externalId)
        .limit(1);

      if (error) {
        throw error;
      }

      if (!transactions || transactions.length === 0) {
        toast({
          title: 'Transação não encontrada',
          description: `Nenhuma transação encontrada com external_id: ${externalId}`,
          variant: 'destructive'
        });
        return;
      }

      const transaction = transactions[0];
      
      toast({
        title: '📄 Transação encontrada',
        description: `ID: ${transaction.id} | Status: ${transaction.status} | Valor: $${transaction.amount}`,
        duration: 10000
      });

      console.log('📄 Dados da transação:', transaction);

    } catch (error) {
      console.error('❌ Erro ao consultar transação:', error);
      toast({
        title: 'Erro na consulta',
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        variant: 'destructive'
      });
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto bg-slate-800 border-slate-700">
      <CardHeader className="bg-gradient-to-r from-purple-600/10 to-blue-600/10 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg">
            <TestTube className="h-6 w-6 text-white" />
          </div>
          <div>
            <CardTitle className="text-xl font-bold text-white">
              Teste de Webhook DigitoPay
            </CardTitle>
            <p className="text-sm text-gray-400">
              Simular webhooks e validar ativação automática de saldo
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        {/* External ID Input */}
        <div className="space-y-2">
          <Label htmlFor="external-id" className="text-purple-400 font-medium">
            External ID da Transação
          </Label>
          <Input
            id="external-id"
            value={externalId}
            onChange={(e) => setExternalId(e.target.value)}
            className="bg-slate-700 border-slate-600 text-white"
            placeholder="dep_1234567890_abc123def"
          />
          <p className="text-xs text-gray-400">
            Use o external_id de uma transação existente para testar
          </p>
        </div>

        {/* Event Type Selection */}
        <div className="space-y-2">
          <Label className="text-purple-400 font-medium">
            Tipo do Evento
          </Label>
          <Select value={eventType} onValueChange={setEventType}>
            <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-700 border-slate-600">
              <SelectItem value="pix.received">PIX Recebido</SelectItem>
              <SelectItem value="pix.confirmed">PIX Confirmado</SelectItem>
              <SelectItem value="payment.approved">Pagamento Aprovado</SelectItem>
              <SelectItem value="withdrawal.completed">Saque Completado</SelectItem>
              <SelectItem value="payment.failed">Pagamento Falhou</SelectItem>
              <SelectItem value="payment.cancelled">Pagamento Cancelado</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Status Selection */}
        <div className="space-y-2">
          <Label className="text-purple-400 font-medium">
            Status da Transação
          </Label>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-700 border-slate-600">
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="realizado">Realizado</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
              <SelectItem value="expired">Expired</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={checkTransaction}
            variant="outline"
            className="flex-1 border-blue-500/30 text-blue-400 hover:bg-blue-500/10"
            disabled={loading}
          >
            <Activity className="h-4 w-4 mr-2" />
            Consultar Transação
          </Button>

          <Button
            onClick={simulateWebhook}
            className="flex-1 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
            disabled={loading || !externalId}
          >
            {loading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Processando...
              </div>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Simular Webhook
              </>
            )}
          </Button>
        </div>

        {/* Instructions */}
        <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
          <h4 className="text-sm font-semibold text-yellow-400 mb-2">
            📝 Como usar:
          </h4>
          <ul className="text-xs text-gray-300 space-y-1">
            <li>• Crie um depósito primeiro para obter um external_id</li>
            <li>• Cole o external_id no campo acima (ex: dep_1234567890_abc123def)</li>
            <li>• Escolha o tipo de evento e status</li>
            <li>• Clique em "Simular Webhook" para testar a ativação automática</li>
            <li>• Verifique se o saldo foi creditado automaticamente</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};