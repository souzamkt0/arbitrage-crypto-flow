import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { TestTube, CheckCircle, AlertCircle } from 'lucide-react';

export const DepositTestButton: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const createTestDeposit = async () => {
    if (!user) {
      toast({
        title: 'Erro',
        description: 'Usuário não autenticado',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    
    try {
      console.log('🧪 Criando depósito de teste...');
      
      // Criar depósito de teste via edge function
      const { data: depositResult, error: depositError } = await supabase.functions.invoke('digitopay-deposit', {
        body: {
          amount: 100, // $100 USD
          cpf: '123.456.789-00',
          name: 'Teste Automático',
          callbackUrl: window.location.origin + '/deposit',
          userId: user.id
        }
      });

      if (depositError) {
        console.error('❌ Erro da edge function:', depositError);
        throw new Error(`Erro da edge function: ${depositError.message}`);
      }

      if (!depositResult || !depositResult.success) {
        console.error('❌ Erro no resultado:', depositResult);
        throw new Error(depositResult?.message || depositResult?.error || 'Erro ao criar depósito');
      }

      const trxId = depositResult.id;
      console.log('📋 Depósito criado:', trxId);

      toast({
        title: '✅ Depósito Criado',
        description: `Depósito de teste criado: ${trxId}`,
      });

      // Aguardar 3 segundos e depois simular aprovação
      setTimeout(async () => {
        try {
          console.log('🚀 Simulando aprovação automática...');
          
          const { data: approvalResult, error: approvalError } = await supabase.functions.invoke('simulate-deposit-approval', {
            body: {
              trx_id: trxId
            }
          });

          if (approvalError || !approvalResult.success) {
            throw new Error(approvalResult?.error || 'Erro na aprovação automática');
          }

          console.log('✅ Aprovação simulada:', approvalResult);

          toast({
            title: '🎉 PIX Aprovado Automaticamente!',
            description: `Depósito de $${approvalResult.balance_update.difference} foi creditado na sua conta`,
          });

          // Recarregar a página para mostrar o saldo atualizado
          setTimeout(() => {
            window.location.reload();
          }, 2000);

        } catch (error) {
          console.error('❌ Erro na aprovação:', error);
          toast({
            title: 'Erro na Aprovação',
            description: error.message,
            variant: 'destructive'
          });
        }
      }, 3000);

    } catch (error) {
      console.error('❌ Erro no teste:', error);
      toast({
        title: 'Erro no Teste',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <Button
        onClick={createTestDeposit}
        disabled={loading}
        className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-bold"
      >
        {loading ? (
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            <span>Testando...</span>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <TestTube className="h-4 w-4" />
            <span>Testar Depósito PIX</span>
          </div>
        )}
      </Button>
      
      <div className="text-xs text-gray-400 space-y-1">
        <div className="flex items-center gap-1">
          <CheckCircle className="h-3 w-3 text-green-500" />
          <span>Cria depósito de $100 automaticamente</span>
        </div>
        <div className="flex items-center gap-1">
          <CheckCircle className="h-3 w-3 text-green-500" />
          <span>Aprova em 3 segundos</span>
        </div>
        <div className="flex items-center gap-1">
          <AlertCircle className="h-3 w-3 text-yellow-500" />
          <span>Credita saldo na conta</span>
        </div>
      </div>
    </div>
  );
};