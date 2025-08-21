import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { DigitoPayService } from '@/services/digitopayService';
import { useAuth } from '@/hooks/useAuth';
import { Copy, Download, QrCode, DollarSign } from 'lucide-react';
import { CurrencyDisplay } from '@/components/CurrencyDisplay';
import { useCurrency } from '@/hooks/useCurrency';
import { supabase } from '@/integrations/supabase/client';
interface DigitoPayDepositProps {
  onSuccess?: () => void;
}
export const DigitoPayDeposit: React.FC<DigitoPayDepositProps> = ({
  onSuccess
}) => {
  const {
    user,
    profile
  } = useAuth();
  const {
    toast
  } = useToast();
  const {
    convertBRLToUSD,
    formatBRL,
    formatUSD,
    convertUSDToBRL,
    exchangeRate
  } = useCurrency();
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

  // Monitorar mudanças no depositData
  useEffect(() => {
    if (depositData) {
      console.log('🔄 Estado depositData atualizado:', {
        hasTrxId: !!depositData.trxId,
        hasPixCode: !!depositData.pixCode,
        hasQrCode: !!depositData.qrCodeBase64,
        qrCodeLength: depositData.qrCodeBase64?.length || 0
      });
    }
  }, [depositData]);

  // Verificação automática de status
  useEffect(() => {
    if (autoCheck && depositData?.trxId) {
      const interval = setInterval(() => {
        console.log('🔄 Verificação automática de status...');
        checkStatus();
      }, 5000); // Verificar a cada 5 segundos

      return () => clearInterval(interval);
    }
  }, [autoCheck, depositData?.trxId]);

  // Carregar histórico de depósitos
  const loadDepositHistory = async () => {
    if (!user) return;
    
    try {
      const { data: transactions, error } = await supabase
        .from('digitopay_transactions')
        .select('*')
        .eq('user_id', user.id)
        .eq('type', 'deposit')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error('❌ Erro ao carregar histórico:', error);
        return;
      }

      const history = transactions.map(tx => ({
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
      console.error('❌ Erro ao carregar histórico:', error);
    }
  };

  // Carregar histórico ao montar o componente
  useEffect(() => {
    loadDepositHistory();
  }, [user]);

  // Função para formatar CPF
  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

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

  // Função para copiar código PIX
  const copyPixCode = async () => {
    if (depositData?.pixCode) {
      try {
        await navigator.clipboard.writeText(depositData.pixCode);
        toast({
          title: 'Código PIX copiado!',
          description: 'Cole o código no seu app bancário'
        });
      } catch (error) {
        toast({
          title: 'Erro ao copiar',
          description: 'Copie manualmente o código PIX',
          variant: 'destructive'
        });
      }
    }
  };

  // Função para baixar QR Code
  const downloadQRCode = () => {
    if (depositData?.qrCodeBase64) {
      const link = document.createElement('a');
      link.href = `data:image/png;base64,${depositData.qrCodeBase64}`;
      link.download = 'pix-qr-code.png';
      link.click();
    }
  };

  // Função para criar depósito
  const handleCreateDeposit = async () => {
    if (!user || !profile) {
      toast({
        title: 'Erro',
        description: 'Usuário não autenticado',
        variant: 'destructive'
      });
      return;
    }
    if (!amount || !cpf) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Preencha o valor e CPF',
        variant: 'destructive'
      });
      return;
    }
    const usdAmount = parseFloat(amount);
    if (usdAmount < 1) {
      toast({
        title: 'Valor mínimo',
        description: 'O valor mínimo é $1.00',
        variant: 'destructive'
      });
      return;
    }
    setLoading(true);
    try {
      // Converter USD para BRL para criar o PIX
      const conversion = await convertUSDToBRL(usdAmount);
      const brlAmount = conversion.brlAmount;
      
      // Permitir valores a partir de R$ 1,00
      if (brlAmount < 1) {
        toast({
          title: 'Valor muito baixo',
          description: `O valor mínimo em reais é R$ 1,00. Tente um valor maior que $${(1 / conversion.exchangeRate).toFixed(2)}`,
          variant: 'destructive'
        });
        return;
      }
      
      console.log('💱 Conversão de moeda:', {
        usd: usdAmount,
        brl: brlAmount,
        rate: conversion.exchangeRate
      });

      // URL de callback para webhook - Conforme documentação oficial DigitoPay
      // Usar URL direta do Supabase Edge Function para garantir funcionamento
      const callbackUrl = `https://cbwpghrkfvczjqzefvix.supabase.co/functions/v1/digitopay-deposit-webhook`;
      console.log('🚀 Iniciando criação de depósito...');
      console.log('🔗 URL do webhook configurada:', callbackUrl);

      // Criar depósito no DigitoPay via Edge Function
      // A Edge Function já salva a transação automaticamente
      const result = await DigitoPayService.createDeposit(brlAmount,
      // Valor em BRL para o PIX
      cpf, profile.display_name || profile.username || 'Nome não informado', callbackUrl);
      console.log('📋 Resultado do depósito:', result);
      if (result.success && result.id) {
        console.log('✅ Depósito criado com sucesso:', result);
        console.log('🔍 Verificando dados do QR Code:');
        console.log('  - ID:', result.id);
        console.log('  - PIX Code:', result.pixCopiaECola ? 'Presente' : 'Ausente');
        console.log('  - QR Code Base64:', result.qrCodeBase64 ? `Presente (${result.qrCodeBase64.length} chars)` : 'Ausente');
        
        const depositDataToSet = {
          trxId: result.id,
          pixCode: result.pixCopiaECola || '',
          qrCodeBase64: result.qrCodeBase64 || '',
          usdAmount: usdAmount,
          brlAmount: brlAmount,
          createdAt: Date.now() // Adicionar timestamp para simulação
        };
        
        console.log('📱 Configurando dados do depósito:', depositDataToSet);
        setDepositData(depositDataToSet);
        
        // Adicionar ao histórico
        const newDeposit = {
          ...depositDataToSet,
          status: 'pending' as const
        };
        setDepositHistory(prev => [newDeposit, ...prev.slice(0, 9)]); // Manter apenas os 10 mais recentes
        console.log('📱 Dados do depósito configurados:', {
          trxId: result.id,
          hasPixCode: !!result.pixCopiaECola,
          hasQrCode: !!result.qrCodeBase64,
          qrCodeLength: result.qrCodeBase64?.length || 0,
          usdAmount: usdAmount,
          brlAmount: brlAmount
        });
        toast({
          title: 'Depósito criado!',
          description: 'Escaneie o QR Code ou copie o código PIX'
        });
        onSuccess?.();
      } else {
        throw new Error(result.message || 'Erro ao criar depósito');
      }
    } catch (error) {
      console.error('❌ Erro ao criar depósito:', error);
      toast({
        title: 'Erro',
        description: error instanceof Error ? error.message : 'Erro interno',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // Função para verificar status
  const checkStatus = async () => {
    if (!depositData?.trxId) return;
    
    setCheckingStatus(true);
    try {
      console.log('🔍 Verificando status do depósito:', depositData.trxId);
      
      // 1. Primeiro, verificar se há registros na tabela de debug
      const { data: debugData, error: debugError } = await supabase
        .from('digitopay_debug')
        .select('*')
        .eq('tipo', 'webhook_received')
        .contains('payload', { id: depositData.trxId })
        .order('created_at', { ascending: false })
        .limit(1);

      if (debugError) {
        console.error('❌ Erro ao verificar debug:', debugError);
      }

      console.log('📊 Dados de debug encontrados:', debugData);

      // 2. Verificar se há webhook confirmando o pagamento
      if (debugData && debugData.length > 0) {
        const webhookData = debugData[0];
        console.log('🎯 Webhook encontrado:', webhookData);
        
        // Verificar se o status é de pagamento confirmado
        if (webhookData.payload?.status === 'REALIZADO' || webhookData.payload?.status === 'PAID') {
          console.log('✅ Pagamento confirmado via webhook!');
          
          // Processar transação automaticamente
          try {
            const response = await fetch('https://cbwpghrkfvczjqzefvix.supabase.co/functions/v1/process-transaction', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                trxId: depositData.trxId
              })
            });
            
            const processResult = await response.json();
            console.log('🔧 Resultado do processamento:', processResult);
            
            if (processResult.success) {
              toast({
                title: '🎉 Pagamento Confirmado!',
                description: 'Seu saldo foi atualizado automaticamente'
              });
              
              // Atualizar o perfil do usuário
              if (profile) {
                const newBalance = parseFloat(profile.balance || '0') + parseFloat(depositData.brlAmount.toString());
                await supabase
                  .from('profiles')
                  .update({ balance: newBalance })
                  .eq('user_id', profile.user_id);
                console.log('✅ Saldo atualizado no perfil:', newBalance);
              }
              
              setDepositData(null);
              setAmount('');
              onSuccess?.();
              return;
            }
          } catch (processError) {
            console.error('❌ Erro ao processar transação:', processError);
          }
        }
      }

      // 3. Se não encontrou webhook, verificar status via API
      console.log('🔍 Verificando status via API...');
      
      // Em desenvolvimento, simular verificação
      const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      
      if (isLocalhost) {
        // Simular verificação para desenvolvimento
        console.log('🔄 Modo desenvolvimento - simulando verificação...');
        
        // Simular que o pagamento foi confirmado após alguns segundos
        const timeSinceCreation = Date.now() - (depositData as any).createdAt;
        if (timeSinceCreation > 10000) { // 10 segundos
          console.log('✅ Simulando pagamento confirmado em desenvolvimento');
          
          // Processar transação
          try {
            const response = await fetch('https://cbwpghrkfvczjqzefvix.supabase.co/functions/v1/process-transaction', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                trxId: depositData.trxId
              })
            });
            const processResult = await response.json();
            console.log('🔧 Resultado do processamento:', processResult);
            
            if (processResult.success) {
              toast({
                title: '🎉 Pagamento Confirmado!',
                description: 'Seu saldo foi atualizado automaticamente'
              });
              // Atualizar o perfil do usuário
              if (profile) {
                const newBalance = parseFloat(profile.balance || '0') + parseFloat(depositData.brlAmount.toString());
                await supabase
                  .from('profiles')
                  .update({ balance: newBalance })
                  .eq('user_id', profile.user_id);
                console.log('✅ Saldo atualizado no perfil:', newBalance);
              }
              setDepositData(null);
              setAmount('');
              onSuccess?.();
            }
          } catch (processError) {
            console.error('❌ Erro ao processar transação:', processError);
          }
        } else {
          toast({
            title: '⏳ Aguardando pagamento',
            description: `Aguarde ${Math.ceil((10000 - timeSinceCreation) / 1000)}s para simular confirmação`
          });
        }
        return;
      }

      // Em produção, usar verificação real
      const result = await DigitoPayService.checkTransactionStatus(depositData.trxId);
      console.log('📊 Status da transação:', result);

      // Mapear status do DigitoPay para status interno
      let isCompleted = false;
      if (result.status === 'PAID' || result.status === 'REALIZADO') {
        isCompleted = true;
      }
      
      if (isCompleted) {
        // Atualizar status no banco
        await DigitoPayService.updateTransactionStatus(depositData.trxId, 'completed', result);

        // Chamar função para processar transação manualmente
        try {
          const response = await fetch('https://cbwpghrkfvczjqzefvix.supabase.co/functions/v1/process-transaction', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              trxId: depositData.trxId
            })
          });
          const processResult = await response.json();
          console.log('🔧 Resultado do processamento:', processResult);
          if (processResult.success) {
            toast({
              title: '🎉 Pagamento Confirmado!',
              description: 'Seu saldo foi atualizado automaticamente'
            });
            // Atualizar o perfil do usuário
            if (profile) {
              const newBalance = parseFloat(profile.balance || '0') + parseFloat(depositData.brlAmount.toString());
              await supabase
                .from('profiles')
                .update({ balance: newBalance })
                .eq('user_id', profile.user_id);
              console.log('✅ Saldo atualizado no perfil:', newBalance);
            }
          } else {
            toast({
              title: 'Pagamento confirmado!',
              description: 'Entre em contato se o saldo não foi atualizado'
            });
          }
        } catch (processError) {
          console.error('❌ Erro ao processar transação:', processError);
          toast({
            title: 'Pagamento confirmado!',
            description: 'Entre em contato se o saldo não foi atualizado'
          });
        }
        setDepositData(null);
        setAmount('');
        onSuccess?.();
      } else if (result.status === 'CANCELLED' || result.status === 'CANCELED' || result.status === 'CANCELADO' || result.status === 'EXPIRED' || result.status === 'EXPIRADO') {
        toast({
          title: 'Pagamento cancelado/expirado',
          description: 'Tente novamente',
          variant: 'destructive'
        });
      } else {
        toast({
          title: 'Aguardando pagamento',
          description: `Status: ${result.status}`
        });
      }
    } catch (error) {
      console.error('❌ Erro ao verificar status:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao verificar status',
        variant: 'destructive'
      });
    } finally {
      setCheckingStatus(false);
    }
  };

  // Verificação automática a cada 5 segundos
  useEffect(() => {
    if (depositData?.trxId) {
      const interval = setInterval(() => {
        checkStatus();
      }, 5000); // Verificar a cada 5 segundos

      return () => clearInterval(interval);
    }
  }, [depositData?.trxId]);

  // Valores pré-definidos para facilitar a seleção
  const quickAmounts = [10, 25, 50, 100, 250, 500];
  return <Card className="w-full max-w-lg mx-auto h-fit max-h-[85vh] overflow-hidden shadow-2xl bg-gradient-to-br from-gray-900/80 to-black/80 border border-yellow-500/20 backdrop-blur-sm">
      <CardHeader className="pb-4 px-4 bg-gradient-to-r from-yellow-500/10 to-yellow-600/10 border-b border-yellow-500/20">
        <CardTitle className="flex items-center gap-2 text-lg sm:text-xl font-bold">
          <div className="w-8 h-8 bg-yellow-500/20 rounded-full flex items-center justify-center">
            <QrCode className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-400" />
          </div>
          <span className="bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">💰 Depósito PIX</span>
        </CardTitle>
        <CardDescription className="text-sm leading-relaxed text-gray-400">
          Adicione saldo à sua conta de forma rápida e segura
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 px-4 pb-4 overflow-y-auto max-h-[calc(85vh-140px)] bg-black">
        {!depositData ? <>
            {/* Seção de Valor Melhorada */}
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-yellow-400 mb-2">💵 Escolha o Valor</h3>
                <p className="text-sm text-gray-400">Selecione um valor ou digite o valor desejado</p>
              </div>

              {/* Botões de Valores Rápidos */}
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                {quickAmounts.map(quickAmount => <Button key={quickAmount} variant={amount === quickAmount.toString() ? "default" : "outline"} onClick={() => setAmount(quickAmount.toString())} className={`h-12 sm:h-14 text-sm sm:text-base font-semibold transition-all duration-200 hover:scale-105 ${
                  amount === quickAmount.toString() 
                    ? "bg-yellow-500 hover:bg-yellow-600 text-black" 
                    : "border-yellow-500/20 text-yellow-400 hover:bg-yellow-500/10 hover:border-yellow-400"
                }`}>
                    ${quickAmount}
                  </Button>)}
              </div>

              {/* Input Personalizado */}
              <div className="space-y-2">
                <Label htmlFor="amount" className="text-sm font-medium flex items-center gap-2 text-yellow-400">
                  <DollarSign className="h-4 w-4" />
                  Valor Personalizado (USD)
                </Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-yellow-400" />
                  <Input id="amount" type="number" placeholder="Digite o valor..." value={amount} onChange={e => setAmount(e.target.value)} min="1" step="0.01" className="pl-10 text-base h-12 text-center font-semibold bg-gray-800/50 border border-yellow-500/20 text-white placeholder-gray-400 focus:border-yellow-400 focus:ring-yellow-400/20 rounded-xl" />
                </div>
                <p className="text-xs text-green-400 text-center font-bold">
                  ✅ Valor mínimo: $1.00
                </p>
              </div>

              {/* Preview do Valor */}
              {amount && parseFloat(amount) > 0 && <div className="p-4 bg-gradient-to-br from-yellow-500/10 to-yellow-600/10 rounded-xl border-2 border-yellow-500/30 shadow-sm">
                  <div className="text-center space-y-2">
                    <div className="text-sm font-medium text-yellow-400">💳 Valor do PIX</div>
                    <CurrencyDisplay usdAmount={parseFloat(amount)} size="lg" orientation="vertical" />
                    <div className="text-xs text-yellow-400 bg-yellow-500/20 px-3 py-1 rounded-full inline-block border border-yellow-500/30">
                      ✅ Processamento instantâneo
                    </div>
                  </div>
                </div>}
            </div>

            {/* Seção CPF Melhorada */}
            <div className="space-y-3">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-yellow-400 mb-2">🆔 Identificação</h3>
                <p className="text-sm text-gray-400">Informe seu CPF para processar o depósito</p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="cpf" className="text-sm font-medium text-yellow-400">CPF do Titular</Label>
                <Input id="cpf" placeholder="000.000.000-00" value={cpf} onChange={e => setCpf(formatCPF(e.target.value))} maxLength={14} className="text-base h-12 text-center font-mono bg-gray-800/50 border border-yellow-500/20 text-white placeholder-gray-400 focus:border-yellow-400 focus:ring-yellow-400/20 rounded-xl" />
              </div>
            </div>

            {/* Botão de Ação Melhorado */}
            <div className="space-y-3 pt-2">
              <Button onClick={handleCreateDeposit} disabled={loading || !amount || !cpf || parseFloat(amount) < 1} className="w-full h-14 text-base font-bold bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black transition-all duration-200 hover:scale-[1.02] shadow-lg rounded-xl">
                {loading ? <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
                    Gerando PIX...
                  </div> : <div className="flex items-center gap-2">
                    <QrCode className="h-5 w-5" />
                    🚀 Gerar PIX Agora
                  </div>}
              </Button>
              
              {/* Informações de Segurança */}
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <div className="w-5 h-5 bg-yellow-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs">🔒</span>
                  </div>
                  <div className="text-xs text-yellow-400 leading-relaxed">
                    <strong>Seguro e Confiável:</strong> Seus dados são protegidos e o PIX é processado instantaneamente pela DigitoPay.
                  </div>
                </div>
              </div>
            </div>
          </> : <div className="space-y-4">
            {/* Header do PIX Gerado */}
            <div className="text-center bg-gradient-to-br from-yellow-500/10 to-yellow-600/10 rounded-xl p-4 border-2 border-yellow-500/30">
              <div className="w-12 h-12 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <QrCode className="h-6 w-6 text-yellow-400" />
              </div>
              <h3 className="text-xl font-bold text-yellow-400 mb-2">🎉 PIX Gerado com Sucesso!</h3>
              <p className="text-sm text-gray-300 leading-relaxed">
                Escaneie o QR Code ou copie o código PIX para finalizar o pagamento
              </p>
            </div>

            {/* Detalhes do Depósito */}
            {depositData.brlAmount && depositData.usdAmount && <div className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/10 border-2 border-yellow-500/30 rounded-xl p-4">
                <div className="text-center space-y-3">
                  <div className="text-sm font-semibold text-yellow-400 mb-3">💰 Resumo do Depósito</div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-800/50 rounded-lg p-3 border border-yellow-500/20">
                      <div className="text-xs text-yellow-400 mb-1">Valor PIX</div>
                      <div className="text-lg font-bold text-white">{formatBRL(depositData.brlAmount)}</div>
                    </div>
                    <div className="bg-gray-800/50 rounded-lg p-3 border border-yellow-500/20">
                      <div className="text-xs text-yellow-400 mb-1">Crédito USD</div>
                      <div className="text-lg font-bold text-white">{formatUSD(depositData.usdAmount)}</div>
                    </div>
                  </div>
                </div>
              </div>}

            {/* QR Code Melhorado */}
            {depositData.qrCodeBase64 && <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl p-4 border-2 border-yellow-500/20 shadow-sm">
                <div className="text-center space-y-3">
                  <h4 className="text-lg font-semibold text-yellow-400">📱 Escaneie o QR Code</h4>
                  <div className="flex justify-center">
                    <div className="bg-white p-3 rounded-xl border-2 border-yellow-500/20 shadow-md">
                      <img src={depositData.qrCodeBase64.startsWith('data:') ? depositData.qrCodeBase64 : `data:image/png;base64,${depositData.qrCodeBase64}`} alt="QR Code PIX" className="rounded-lg" style={{
                  width: '200px',
                  height: '200px',
                  maxWidth: '100%'
                }} onError={e => {
                  console.error('❌ Erro ao carregar QR Code:', e);
                  console.log('📄 QR Code data:', depositData.qrCodeBase64?.substring(0, 100) + '...');
                }} onLoad={() => {
                  console.log('✅ QR Code carregado com sucesso');
                }} />
                    </div>
                  </div>
                  <p className="text-sm text-gray-400">
                    Abra seu app bancário e escaneie o código
                  </p>
                </div>
              </div>}

            {/* Código PIX Melhorado */}
            {depositData.pixCode && <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl p-4 border-2 border-yellow-500/20 shadow-sm">
                <div className="space-y-3">
                  <h4 className="text-lg font-semibold text-yellow-400 text-center">💳 Ou copie o código PIX</h4>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-400">Código PIX Copia e Cola</Label>
                    <div className="flex gap-2">
                      <Input value={depositData.pixCode} readOnly className="font-mono text-sm bg-gray-800/50 border-2 border-yellow-500/20 text-yellow-400" />
                      <Button onClick={copyPixCode} className="h-12 px-4 bg-yellow-500 hover:bg-yellow-600 text-black shadow-md" title="Copiar código PIX">
                        <Copy className="h-4 w-4 mr-2" />
                        Copiar
                      </Button>
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 text-center">
                    Cole este código no seu app bancário na opção "PIX Copia e Cola"
                  </p>
                </div>
              </div>}

            {/* Ações Melhoradas */}
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" onClick={downloadQRCode} className="h-12 text-sm font-semibold border-2 border-yellow-500/20 text-yellow-400 hover:bg-yellow-500/10 hover:border-yellow-400" disabled={!depositData.qrCodeBase64}>
                  <Download className="h-4 w-4 mr-2" />
                  Baixar QR
                </Button>
                <Button 
                  onClick={checkStatus} 
                  disabled={checkingStatus}
                  className="h-12 text-sm font-semibold bg-yellow-500 hover:bg-yellow-600 text-black disabled:opacity-50"
                >
                  {checkingStatus ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
                      Verificando...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                  🔍 Verificar Status
                    </div>
                  )}
                </Button>
              </div>

              {/* Check Automático */}
              <div className="bg-yellow-500/10 border-2 border-yellow-500/30 rounded-xl p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-yellow-500/20 rounded-full flex items-center justify-center">
                      <span className="text-xs">⚡</span>
                    </div>
                    <span className="text-sm font-medium text-yellow-400">Verificação Automática</span>
                  </div>
                  <Button
                    variant={autoCheck ? "default" : "outline"}
                    size="sm"
                    onClick={() => setAutoCheck(!autoCheck)}
                    className={`text-xs ${autoCheck ? 'bg-green-500 hover:bg-green-600 text-white' : 'border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10'}`}
                  >
                    {autoCheck ? '🟢 Ativo' : '⚪ Inativo'}
                  </Button>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  {autoCheck ? 'Verificando status automaticamente a cada 5 segundos' : 'Clique para ativar verificação automática'}
                </p>
              </div>

              <Button variant="outline" onClick={() => setDepositData(null)} className="w-full h-12 text-sm font-semibold border-2 border-yellow-500/20 text-yellow-400 hover:bg-yellow-500/10 hover:border-yellow-400">
                ➕ Fazer Novo Depósito
              </Button>
            </div>

            {/* Instruções de Pagamento */}
            <div className="bg-yellow-500/10 border-2 border-yellow-500/30 rounded-xl p-4">
              <div className="text-center space-y-2">
                <div className="text-sm font-semibold text-yellow-400">⏰ Como pagar:</div>
                <div className="text-xs text-gray-300 space-y-1 text-left">
                  <p>• <strong>Pelo QR Code:</strong> Abra seu app bancário → PIX → Ler QR Code</p>
                  <p>• <strong>Por Copia e Cola:</strong> Copie o código → Cole no app bancário → PIX</p>
                  <p>• <strong>Processamento:</strong> Instantâneo após confirmação do pagamento</p>
                </div>
              </div>
            </div>
          </div>}

          {/* Histórico de Depósitos */}
          {depositHistory.length > 0 && (
            <div className="space-y-4 mt-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-yellow-400 mb-2">📋 Histórico de Depósitos</h3>
                <p className="text-sm text-gray-400">Seus últimos depósitos PIX</p>
              </div>
              
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {depositHistory.map((deposit, index) => (
                  <div key={deposit.trxId} className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl p-4 border-2 border-yellow-500/20">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-yellow-500/20 rounded-full flex items-center justify-center">
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
                      <div className="flex items-center gap-2">
                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                          deposit.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                          deposit.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-red-500/20 text-red-400'
                        }`}>
                          {deposit.status === 'completed' ? '✅ Pago' :
                           deposit.status === 'pending' ? '⏳ Pendente' :
                           '❌ Falhou'}
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div className="bg-gray-800/30 rounded-lg p-2">
                        <div className="text-xs text-gray-400">Valor PIX</div>
                        <div className="text-sm font-semibold text-white">
                          {deposit.brlAmount ? `R$ ${deposit.brlAmount.toFixed(2)}` : 'N/A'}
                        </div>
                      </div>
                      <div className="bg-gray-800/30 rounded-lg p-2">
                        <div className="text-xs text-gray-400">Crédito USD</div>
                        <div className="text-sm font-semibold text-white">
                          {deposit.usdAmount ? `$${deposit.usdAmount.toFixed(2)}` : 'N/A'}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
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
                      {deposit.pixCode && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={async () => {
                            try {
                              await navigator.clipboard.writeText(deposit.pixCode);
                              toast({
                                title: 'Código PIX copiado!',
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
                    </div>
                    
                    <div className="mt-2 text-xs text-gray-500 font-mono">
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
        </div>
      </CardContent>
    </Card>
  );
};