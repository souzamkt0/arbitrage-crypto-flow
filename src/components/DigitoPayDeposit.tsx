import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { DigitoPayService } from '@/services/digitopayService';
import { useAuth } from '@/hooks/useAuth';
import { Copy, Download, QrCode, DollarSign, CheckCircle } from 'lucide-react';
import { CurrencyDisplay } from '@/components/CurrencyDisplay';
import { useCurrency } from '@/hooks/useCurrency';
import { supabase } from '@/integrations/supabase/client';

interface DigitoPayDepositProps {
  onSuccess?: () => void;
}

export const DigitoPayDeposit: React.FC<DigitoPayDepositProps> = ({
  onSuccess
}) => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const { convertBRLToUSD, formatBRL, formatUSD, convertUSDToBRL, exchangeRate } = useCurrency();
  
  const [amount, setAmount] = useState('');
  const [cpf, setCpf] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(false);
  const [autoCheck, setAutoCheck] = useState(false);
  const [depositHistory, setDepositHistory] = useState<Array<{
    trxId: string;
    pixCode: string;
    qrCodeBase64: string;
    usdAmount?: number;
    brlAmount?: number;
    createdAt: number;
    status: 'pending' | 'completed' | 'failed';
  }>>([]);
  const [depositData, setDepositData] = useState<{
    trxId: string;
    pixCode: string;
    qrCodeBase64: string;
    usdAmount?: number;
    brlAmount?: number;
  } | null>(null);

  // Carregar histórico de depósitos
  const loadDepositHistory = async () => {
    if (!user) return;
    
    try {
      const { data: transactions } = await supabase
        .from('digitopay_transactions')
        .select('*')
        .eq('user_id', user.id)
        .eq('type', 'deposit')
        .order('created_at', { ascending: false })
        .limit(10);

      const history = (transactions || []).map(tx => ({
        trxId: tx.trx_id,
        pixCode: tx.pix_code || '',
        qrCodeBase64: tx.qr_code_base64 || '',
        usdAmount: tx.amount,
        brlAmount: tx.amount_brl,
        createdAt: new Date(tx.created_at).getTime(),
        status: tx.status as 'pending' | 'completed' | 'failed'
      }));

      setDepositHistory(history);
      console.log('📊 Histórico carregado:', history);
    } catch (error) {
      console.log('Erro ao carregar histórico:', error);
    }
  };

  // Auto verificação de status em intervalos quando há depósito pendente
  useEffect(() => {
    if (!depositData?.trxId) return;

    const interval = setInterval(async () => {
      try {
        console.log('🔄 Verificação automática de status...');
        
        // Verificar diretamente no banco se há atualização via webhook
        const { data: transaction, error: dbError } = await supabase
          .from('digitopay_transactions')
          .select('status, amount_brl, user_id')
          .eq('trx_id', depositData.trxId)
          .maybeSingle();

        if (!dbError && transaction && (transaction.status === 'completed' || transaction.status === 'paid')) {
          console.log('🎉 Depósito confirmado automaticamente!');
          
          toast({
            title: "🎉 PARABÉNS! DEPÓSITO CONFIRMADO!",
            description: `Seu depósito de R$ ${transaction.amount_brl} foi confirmado e o saldo foi adicionado à sua conta! ✅ Saldo está disponível no sistema para trading.`,
            duration: 15000,
          });

          // Atualizar status local
          setDepositHistory(prev => 
            prev.map(deposit => 
              deposit.trxId === depositData.trxId 
                ? { ...deposit, status: 'completed' as const }
                : deposit
            )
          );

          // Limpar dados do depósito
          setDepositData(null);
          
          // Parar o polling
          clearInterval(interval);
          
          // Recarregar dados
          loadDepositHistory();
          
          if (onSuccess) onSuccess();
        }
      } catch (error) {
        console.log('Verificação automática silenciosa:', error);
      }
    }, 10000); // Verifica a cada 10 segundos

    // Limpar quando componente desmontar ou depositData mudar
    return () => clearInterval(interval);
  }, [depositData?.trxId]);

  // Carregar histórico ao montar o componente
  useEffect(() => {
    loadDepositHistory();
  }, [user]);

  // Função para formatar data
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleCreateDeposit = async () => {
    if (!amount || !cpf) {
      toast({
        title: 'Dados obrigatórios',
        description: 'Preencha o valor e CPF',
        variant: 'destructive'
      });
      return;
    }

    const usdAmount = parseFloat(amount);
    const brlAmount = await convertUSDToBRL(usdAmount);

    // Validação de valor mínimo
    if (usdAmount < 1) {
      toast({
        title: 'Valor mínimo',
        description: 'O valor mínimo é $1.00 USD',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);

    try {
      console.log('💰 Criando depósito...', { usdAmount, brlAmount, cpf });

      // FLUXO CORRIGIDO: 
      // 1. Criar transação no Supabase PRIMEIRO (com external_id único)
      const external_id = `dep_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      console.log('📝 1. Criando transação no Supabase com external_id:', external_id);
      
      const { data: transaction, error: transactionError } = await supabase
        .from('digitopay_transactions')
        .insert({
          user_id: user?.id,
          type: 'deposit',
          amount: usdAmount,
          amount_brl: brlAmount.brlAmount,
          person_name: profile?.display_name || 'Usuário',
          person_cpf: cpf,
          status: 'pending',
          external_id: external_id,
          trx_id: external_id // Temporário, será atualizado quando o DigitoPay responder
        })
        .select()
        .single();

      if (transactionError) {
        throw new Error(`Erro ao criar transação: ${transactionError.message}`);
      }

      console.log('✅ 1. Transação criada no Supabase:', transaction);

      // 2. Gerar PIX no DigitoPay com external_reference
      console.log('🏦 2. Gerando PIX no DigitoPay...');
      
      const { data: result, error } = await supabase.functions.invoke('digitopay-deposit', {
        body: {
          amount: usdAmount,
          cpf: cpf,
          name: profile?.display_name || 'Usuário',
          callbackUrl: 'https://cbwpghrkfvczjqzefvix.supabase.co/functions/v1/digitopay-webhook',
          external_reference: external_id, // Vincular ao Supabase
          userId: user?.id,
          transaction_id: transaction.id
        }
      });

      if (error) {
        // Se falhou, remover transação criada
        await supabase
          .from('digitopay_transactions')
          .delete()
          .eq('id', transaction.id);
        
        throw new Error(error.message || 'Erro ao gerar PIX no DigitoPay');
      }

      console.log('✅ 2. PIX gerado no DigitoPay:', result);

      // 3. Atualizar transação com dados do DigitoPay
      console.log('🔄 3. Atualizando transação com dados do DigitoPay...');
      
      const { error: updateError } = await supabase
        .from('digitopay_transactions')
        .update({
          trx_id: result.id || result.transaction_id,
          pix_code: result.pixCopiaECola,
          qr_code_base64: result.qrCodeBase64,
          status: 'waiting_payment',
          gateway_response: result
        })
        .eq('id', transaction.id);

      if (updateError) {
        console.error('⚠️ Erro ao atualizar transação, mas PIX foi gerado:', updateError);
      }

      console.log('✅ 3. Transação atualizada com dados do DigitoPay');

      // 4. Configurar dados para exibição
      const depositDataToSet = {
        trxId: result.id || result.transaction_id,
        pixCode: result.pixCopiaECola || '',
        qrCodeBase64: result.qrCodeBase64 || '',
        usdAmount: usdAmount,
        brlAmount: brlAmount.brlAmount,
      };

      console.log('📱 4. Configurando dados do depósito:', depositDataToSet);
      setDepositData(depositDataToSet);

      // Adicionar ao histórico local
      const newDeposit = {
        ...depositDataToSet,
        createdAt: Date.now(),
        status: 'pending' as const
      };
      setDepositHistory(prev => [newDeposit, ...prev.slice(0, 9)]);

      toast({
        title: '✅ PIX gerado com sucesso!',
        description: `Transação vinculada (${external_id.slice(-6)}). Escaneie o QR Code ou copie o código PIX. O saldo será creditado automaticamente após o pagamento.`,
        duration: 10000,
      });

    } catch (error) {
      console.error('❌ Erro no processo de depósito:', error);
      toast({
        title: 'Erro ao gerar PIX',
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const checkStatus = async () => {
    if (!depositData?.trxId) return;

    setCheckingStatus(true);

    try {
      console.log('🔍 Verificando status do depósito:', depositData.trxId);

      // Usar a edge function corrigida para verificar status
      const { data: statusResult, error: statusError } = await supabase.functions.invoke('digitopay-status', {
        body: { trxId: depositData.trxId }
      });

      if (statusError) {
        toast({
          title: "Erro ao verificar status",
          description: "Houve um problema ao consultar o status do depósito",
          variant: "destructive"
        });
        return;
      }

      console.log('✅ Status verificado:', statusResult);

      // Se a transação foi confirmada
      if (statusResult?.isConfirmed || statusResult?.data?.status === 'REALIZADO') {
        toast({
          title: "🎉 PARABÉNS! DEPÓSITO CONFIRMADO!",
          description: `Seu depósito de $${depositData.usdAmount} foi aprovado e o saldo foi adicionado à sua conta.`,
          duration: 15000,
        });

        // Atualizar status local
        setDepositHistory(prev => 
          prev.map(deposit => 
            deposit.trxId === depositData.trxId 
              ? { ...deposit, status: 'completed' as const }
              : deposit
          )
        );

        // Limpar dados do depósito atual
        setDepositData(null);
        
        // Recarregar histórico
        loadDepositHistory();
        
        if (onSuccess) onSuccess();
      } else {
        toast({
          title: "⏳ Aguardando Pagamento",
          description: "Seu depósito ainda está pendente. Continuaremos verificando automaticamente.",
        });
      }

    } catch (error) {
      toast({
        title: "Erro na verificação",
        description: "Não foi possível verificar o status do depósito",
        variant: "destructive"
      });
    } finally {
      setCheckingStatus(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-2 sm:p-4">
      {/* Trading Header - Responsive */}
      <div className="mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <h1 className="text-xl sm:text-2xl font-bold text-white">DEPÓSITO TRADING</h1>
            <div className="px-2 sm:px-3 py-1 bg-green-500/20 rounded-full text-green-400 text-xs sm:text-sm font-medium">
              AO VIVO
            </div>
          </div>
        </div>
        <p className="text-sm sm:text-base text-gray-400">Depósitos PIX instantâneos • Confirmação em tempo real • Pronto para trading</p>
      </div>

      <Card className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-sm border border-blue-500/20 shadow-2xl shadow-blue-500/10">
        <CardHeader className="bg-gradient-to-r from-blue-600/10 to-purple-600/10 border-b border-blue-500/20">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-1.5 sm:p-2 bg-gradient-to-br from-green-500 to-green-600 rounded-lg">
                <DollarSign className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-lg sm:text-xl font-bold text-white">
                  Depósito PIX Instantâneo
                </CardTitle>
                <CardDescription className="text-gray-400 text-xs sm:text-sm">
                  Confirmação automática • Sem atrasos
                </CardDescription>
              </div>
            </div>
            <div className="text-left sm:text-right">
              <div className="text-xs text-gray-500">Taxa de Câmbio</div>
              <div className="text-base sm:text-lg font-bold text-green-400">
                1 USD = {formatBRL(exchangeRate || 5.5)}
              </div>
            </div>
          </div>
        </CardHeader>
      <CardContent className="p-4 sm:p-6 space-y-6 sm:space-y-8">
        {!depositData ? (
          <>
            {/* Trading Form - Responsive */}
            <div className="bg-gradient-to-br from-slate-700/20 to-slate-800/20 rounded-xl p-4 sm:p-6 border border-slate-600/30">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <h3 className="text-base sm:text-lg font-semibold text-white">Formulário de Depósito</h3>
              </div>
              
              <div className="grid grid-cols-1 gap-4 sm:gap-6">
                <div className="space-y-3">
                  <Label htmlFor="amount" className="text-blue-400 font-medium flex items-center gap-2 text-sm sm:text-base">
                    <DollarSign className="h-4 w-4 flex-shrink-0" />
                    Valor do Depósito (USD)
                  </Label>
                  <div className="relative">
                    <Input
                      id="amount"
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="bg-slate-800/60 border-blue-500/30 text-white text-base sm:text-lg font-medium pl-10 sm:pl-12 h-10 sm:h-12 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                      placeholder="0.00"
                      min="1"
                      step="0.01"
                    />
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400 font-bold">
                      $
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:justify-between gap-1 text-xs">
                    <span className="text-gray-400">Min: $1.00 USD</span>
                    <span className="text-green-400">✓ Confirmação instantânea</span>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <Label htmlFor="cpf" className="text-blue-400 font-medium flex items-center gap-2 text-sm sm:text-base">
                    <div className="w-4 h-4 border border-blue-400 rounded flex items-center justify-center flex-shrink-0">
                      <div className="w-2 h-2 bg-blue-400 rounded-sm"></div>
                    </div>
                    Documento CPF
                  </Label>
                  <Input
                    id="cpf"
                    value={cpf}
                    onChange={(e) => setCpf(e.target.value)}
                    className="bg-slate-800/60 border-blue-500/30 text-white text-base sm:text-lg font-medium h-10 sm:h-12 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                    placeholder="000.000.000-00"
                  />
                  <p className="text-xs text-gray-400">Obrigatório para pagamento PIX</p>
                </div>
              </div>
            </div>

            {/* Trading Calculator - Responsive */}
            {amount && (
              <div className="bg-gradient-to-br from-emerald-500/10 to-blue-500/10 rounded-xl p-4 sm:p-6 border border-emerald-500/20 shadow-lg shadow-emerald-500/5">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-emerald-500 to-blue-500 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-xs sm:text-sm">₮</span>
                    </div>
                    <h4 className="text-emerald-400 font-bold text-base sm:text-lg">Calculadora de Trading</h4>
                  </div>
                  <div className="sm:ml-auto px-2 sm:px-3 py-1 bg-emerald-500/20 rounded-full text-emerald-400 text-xs font-medium">
                    TEMPO REAL
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                  <div className="bg-slate-800/40 rounded-lg p-3 sm:p-4 border border-slate-600/30">
                    <div className="text-xs text-gray-400 mb-1 flex items-center gap-1">
                      <div className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0"></div>
                      Você Paga (PIX)
                    </div>
                    <div className="text-lg sm:text-2xl font-bold text-white mb-1">
                      {formatBRL(parseFloat(amount) * (exchangeRate || 5.5))}
                    </div>
                    <div className="text-xs text-gray-400">Real Brasileiro</div>
                  </div>
                  
                  <div className="bg-slate-800/40 rounded-lg p-3 sm:p-4 border border-slate-600/30 relative">
                    <div className="hidden sm:block absolute -top-2 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-blue-500 rounded-full">
                      <div className="text-xs text-white font-bold">→</div>
                    </div>
                    <div className="text-xs text-gray-400 mb-1 flex items-center gap-1">
                      <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                      Taxa de Câmbio
                    </div>
                    <div className="text-base sm:text-lg font-bold text-blue-400 mb-1">
                      {(exchangeRate || 5.5).toFixed(2)}
                    </div>
                    <div className="text-xs text-gray-400">BRL/USD</div>
                  </div>
                  
                  <div className="bg-slate-800/40 rounded-lg p-3 sm:p-4 border border-slate-600/30">
                    <div className="text-xs text-gray-400 mb-1 flex items-center gap-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
                      Você Recebe (Saldo Trading)
                    </div>
                    <div className="text-lg sm:text-2xl font-bold text-green-400 mb-1">
                      ${parseFloat(amount).toFixed(2)}
                    </div>
                    <div className="text-xs text-gray-400">Dólar Americano</div>
                  </div>
                </div>
                
                <div className="mt-3 sm:mt-4 p-3 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-lg border border-green-500/20">
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-green-400">
                    <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                    <span className="font-medium">Pronto para trading imediatamente após confirmação</span>
                  </div>
                </div>
              </div>
            )}

            {/* Trading Action Button - Enhanced Design */}
            <div className="relative group">
              <Button
                onClick={handleCreateDeposit}
                disabled={loading}
                className="w-full h-16 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:via-purple-500 hover:to-pink-500 text-white font-bold text-xl shadow-2xl shadow-purple-500/30 border-0 relative overflow-hidden transform transition-all duration-300 hover:scale-[1.02] hover:shadow-purple-500/40"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 via-white/10 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500"></div>
                <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-transparent animate-pulse"></div>
                <div className="relative flex items-center justify-center gap-4">
                  {loading ? (
                    <>
                      <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                       <span className="tracking-wider">GERANDO PIX DE TRADING...</span>
                     </>
                   ) : (
                     <>
                       <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/20">
                         <span className="text-lg">⚡</span>
                       </div>
                       <span className="tracking-wider font-extrabold">GERAR PIX INSTANTÂNEO</span>
                    </>
                  )}
                </div>
              </Button>
              
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-3/4 h-2 bg-gradient-to-r from-transparent via-purple-500/40 to-transparent rounded-full blur-sm group-hover:blur-none transition-all duration-300"></div>
            </div>
          </>
        ) : (
          <div className="space-y-8">
            {/* Trading Success Header */}
            <div className="text-center bg-gradient-to-r from-green-500/10 via-emerald-500/10 to-blue-500/10 rounded-xl p-6 border border-green-500/20 shadow-lg shadow-green-500/5">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center animate-pulse">
                  <CheckCircle className="h-6 w-6 text-white" />
                </div>
                <div className="text-left">
                  <h3 className="text-xl font-bold text-green-400">TRADING PIX GENERATED</h3>
                  <p className="text-sm text-gray-300">System ready for automatic confirmation</p>
                </div>
                <div className="px-3 py-1 bg-green-500/20 rounded-full text-green-400 text-xs font-medium">
                  ACTIVE
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-slate-800/50 to-slate-700/50 rounded-lg p-4 border border-slate-600/30">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-gray-300">Auto-detection enabled</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    <span className="text-gray-300">Real-time verification</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                    <span className="text-gray-300">Instant notification</span>
                  </div>
                </div>
              </div>
            </div>

            {/* QR Code Section */}
            {depositData.qrCodeBase64 && (
              <div className="bg-gradient-to-br from-slate-700/20 to-slate-800/20 rounded-xl p-6 border border-slate-600/30">
                <div className="text-center space-y-4">
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <QrCode className="h-5 w-5 text-blue-400" />
                    <h4 className="text-lg font-semibold text-white">PIX QR Code</h4>
                  </div>
                  
                  <div className="relative inline-block">
                    <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 p-6 rounded-2xl border border-blue-500/20">
                      <div className="bg-white p-4 rounded-xl shadow-2xl">
                        <img
                          src={`data:image/png;base64,${depositData.qrCodeBase64}`}
                          alt="PIX QR Code"
                          className="w-56 h-56 mx-auto"
                        />
                      </div>
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">✓</span>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-400 max-w-md mx-auto">
                    Scan this QR code with your banking app to complete the PIX payment
                  </p>
                </div>
              </div>
            )}

            {/* PIX Code Section */}
            {depositData.pixCode && (
              <div className="bg-gradient-to-br from-slate-700/20 to-slate-800/20 rounded-xl p-6 border border-slate-600/30">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Copy className="h-5 w-5 text-blue-400" />
                    <Label className="text-lg font-semibold text-white">PIX Copy & Paste Code</Label>
                  </div>
                  
                  <div className="relative">
                    <Input
                      value={depositData.pixCode}
                      readOnly
                      className="bg-slate-800/60 border-slate-600/30 text-white font-mono text-sm h-12 pr-24"
                    />
                    <Button
                      onClick={async () => {
                        try {
                          await navigator.clipboard.writeText(depositData.pixCode);
                          toast({
                            title: '📋 PIX Code Copied!',
                            description: 'Paste in your banking app to pay'
                          });
                        } catch (error) {
                          toast({
                            title: 'Copy Error',
                            description: 'Copy manually',
                            variant: 'destructive'
                          });
                        }
                      }}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 px-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white text-xs font-medium"
                    >
                      <Copy className="h-3 w-3 mr-1" />
                      COPY
                    </Button>
                  </div>
                  
                  <p className="text-xs text-gray-400">
                    Copy this code and paste it in your banking app's PIX payment section
                  </p>
                </div>
              </div>
            )}

            {/* Trading Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-red-500/10 to-orange-500/10 rounded-xl p-6 border border-red-500/20">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-orange-500 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">OUT</span>
                  </div>
                  <div>
                    <div className="text-xs text-red-400 font-medium">PIX Payment</div>
                    <div className="text-sm text-gray-400">Brazilian Real</div>
                  </div>
                </div>
                <div className="text-3xl font-bold text-white mb-2">
                  {depositData.brlAmount ? formatBRL(depositData.brlAmount) : 'Calculating...'}
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span>From your bank account</span>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-xl p-6 border border-green-500/20">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">IN</span>
                  </div>
                  <div>
                    <div className="text-xs text-green-400 font-medium">Trading Balance</div>
                    <div className="text-sm text-gray-400">US Dollar</div>
                  </div>
                </div>
                <div className="text-3xl font-bold text-green-400 mb-2">
                  {depositData.usdAmount ? formatUSD(depositData.usdAmount) : 'N/A'}
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Available for trading</span>
                </div>
              </div>
            </div>

            {/* Auto System Status */}
            <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-xl p-6 border border-purple-500/20">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-purple-400 font-bold text-lg">⚡ AUTO-CONFIRMATION SYSTEM</span>
                <div className="ml-auto px-3 py-1 bg-green-500/20 rounded-full text-green-400 text-xs font-medium">
                  MONITORING
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="flex items-center gap-3 p-3 bg-slate-800/30 rounded-lg border border-slate-600/30">
                  <CheckCircle className="h-5 w-5 text-green-400" />
                  <div className="text-sm text-gray-300">
                    <div className="font-medium">Payment Detection</div>
                    <div className="text-xs text-gray-400">Real-time monitoring</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-slate-800/30 rounded-lg border border-slate-600/30">
                  <DollarSign className="h-5 w-5 text-blue-400" />
                  <div className="text-sm text-gray-300">
                    <div className="font-medium">Balance Update</div>
                    <div className="text-xs text-gray-400">Instant credit</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-slate-800/30 rounded-lg border border-slate-600/30">
                  <span className="text-purple-400 text-lg">🎉</span>
                  <div className="text-sm text-gray-300">
                    <div className="font-medium">Notification</div>
                    <div className="text-xs text-gray-400">Success alert</div>
                  </div>
                </div>
              </div>
              
              <div className="text-sm text-gray-300">
                Our trading system will automatically detect your PIX payment and instantly credit your account.
                <strong className="text-purple-400"> No manual verification required!</strong>
              </div>
            </div>

            {/* Action Buttons - Enhanced Design */}
            <div className="flex gap-4">
              <div className="flex-1 relative group">
                <Button
                  onClick={checkStatus}
                  disabled={checkingStatus}
                  className="w-full h-14 bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:via-teal-500 hover:to-cyan-500 text-white font-bold text-lg border-0 shadow-2xl shadow-emerald-500/30 relative overflow-hidden transform transition-all duration-300 hover:scale-[1.02] hover:shadow-emerald-500/40"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 via-white/10 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-transparent animate-pulse"></div>
                  <div className="relative flex items-center justify-center gap-3">
                    {checkingStatus ? (
                      <>
                        <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span className="tracking-wider">VERIFICANDO STATUS...</span>
                      </>
                    ) : (
                      <>
                        <div className="w-7 h-7 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/20">
                          <span className="text-lg">🔍</span>
                        </div>
                        <span className="tracking-wider font-extrabold">VERIFICAR STATUS</span>
                      </>
                    )}
                  </div>
                </Button>
                
                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-3/4 h-2 bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent rounded-full blur-sm group-hover:blur-none transition-all duration-300"></div>
              </div>
              
              <Button
                onClick={() => {
                  setDepositData(null);
                  setAmount('');
                  setCpf('');
                }}
                className="h-14 px-8 bg-gradient-to-br from-slate-700 via-slate-600 to-slate-700 hover:from-slate-600 hover:via-slate-500 hover:to-slate-600 text-white font-bold border border-slate-500/30 relative overflow-hidden transform transition-all duration-300 hover:scale-[1.02]"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative flex items-center gap-2">
                  <span className="text-lg">↻</span>
                  <span className="tracking-wider">NOVO PIX</span>
                </div>
              </Button>
            </div>

            {/* Transaction ID */}
            <div className="text-center">
              <div className="inline-block bg-slate-800/50 rounded-lg px-4 py-2 border border-slate-600/30">
                <div className="text-xs text-gray-500 mb-1">Transaction ID</div>
                <div className="text-sm font-mono text-gray-300">{depositData.trxId}</div>
              </div>
            </div>
          </div>
        )}

        {/* Histórico de Depósitos */}
        {depositHistory.length > 0 && (
          <div className="space-y-4 mt-8 pt-6 border-t border-gray-700">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-yellow-400 mb-2">📋 Histórico de Depósitos</h3>
              <p className="text-sm text-gray-400">Seus depósitos PIX recentes</p>
            </div>
            
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {depositHistory.map((deposit, index) => (
                <div key={deposit.trxId} className="bg-gradient-to-br from-gray-800/30 to-gray-900/30 rounded-xl p-4 border border-gray-600/20">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-full flex items-center justify-center">
                        <QrCode className="h-4 w-4 text-yellow-400" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-yellow-400">
                          Depósito #{index + 1}
                        </div>
                        <div className="text-xs text-gray-400">
                          {formatDate(deposit.createdAt)}
                        </div>
                      </div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${
                      deposit.status === 'completed' ? 'bg-gradient-to-r from-green-500/20 to-green-600/20 text-green-400 border border-green-500/30' :
                      deposit.status === 'pending' ? 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 text-yellow-400 border border-yellow-500/30' :
                      'bg-gradient-to-r from-red-500/20 to-red-600/20 text-red-400 border border-red-500/30'
                    }`}>
                      {deposit.status === 'completed' ? '✅ Concluído' :
                       deposit.status === 'pending' ? '⏳ Pendente' :
                       '❌ Falhou'}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div className="bg-gray-800/50 rounded-lg p-3 text-center">
                      <div className="text-xs text-gray-400 mb-1">Valor PIX</div>
                      <div className="text-sm font-bold text-white">
                        {deposit.brlAmount ? `R$ ${deposit.brlAmount.toFixed(2)}` : 'N/A'}
                      </div>
                    </div>
                    <div className="bg-gray-800/50 rounded-lg p-3 text-center">
                      <div className="text-xs text-gray-400 mb-1">Crédito USD</div>
                      <div className="text-sm font-bold text-white">
                        {deposit.usdAmount ? `$${deposit.usdAmount.toFixed(2)}` : 'N/A'}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    {deposit.pixCode && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={async () => {
                          try {
                            await navigator.clipboard.writeText(deposit.pixCode);
                            toast({
                              title: '📋 Código PIX copiado!',
                              description: 'Cole no seu app bancário'
                            });
                          } catch (error) {
                            toast({
                              title: 'Erro ao copiar',
                              description: 'Copie manualmente',
                              variant: 'destructive'
                            });
                          }
                        }}
                        className="flex-1 text-xs border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10"
                      >
                        📋 Copiar PIX
                      </Button>
                    )}
                    {deposit.qrCodeBase64 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const link = document.createElement('a');
                          link.href = `data:image/png;base64,${deposit.qrCodeBase64}`;
                          link.download = `pix-qr-${deposit.trxId}.png`;
                          link.click();
                        }}
                        className="flex-1 text-xs border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10"
                      >
                        📱 Baixar QR
                      </Button>
                    )}
                  </div>
                  
                  <div className="mt-3 text-xs text-gray-500 font-mono text-center bg-gray-900/50 rounded p-2">
                    ID: {deposit.trxId}
                  </div>
                </div>
              ))}
            </div>
            
            <Button
              variant="outline"
              onClick={loadDepositHistory}
              className="w-full text-sm border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10"
            >
              🔄 Atualizar Histórico
            </Button>
          </div>
        )}
      </CardContent>
      </Card>
    </div>
  );
};