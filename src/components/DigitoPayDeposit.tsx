import React, { useState } from 'react';
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
  const [depositData, setDepositData] = useState<{
    trxId: string;
    pixCode: string;
    qrCodeBase64: string;
    usdAmount?: number;
    brlAmount?: number;
  } | null>(null);

  // Função para formatar CPF
  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
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
    if (usdAmount < 2) {
      toast({
        title: 'Valor mínimo',
        description: 'O valor mínimo é $2.00',
        variant: 'destructive'
      });
      return;
    }
    setLoading(true);
    try {
      // Converter USD para BRL para criar o PIX
      const conversion = await convertUSDToBRL(usdAmount);
      const brlAmount = conversion.brlAmount;
      console.log('💱 Conversão de moeda:', {
        usd: usdAmount,
        brl: brlAmount,
        rate: conversion.exchangeRate
      });

      // URL de callback para webhook
      const callbackUrl = `https://cbwpghrkfvczjqzefvix.supabase.co/functions/v1/digitopay-webhook`;
      console.log('🚀 Iniciando criação de depósito...');

      // Criar depósito no DigitoPay via Edge Function
      // A Edge Function já salva a transação automaticamente
      const result = await DigitoPayService.createDeposit(brlAmount,
      // Valor em BRL para o PIX
      cpf, profile.display_name || profile.username || 'Nome não informado', callbackUrl);
      console.log('📋 Resultado do depósito:', result);
      if (result.success && result.id) {
        console.log('✅ Depósito criado com sucesso:', result);
        setDepositData({
          trxId: result.id,
          pixCode: result.pixCopiaECola || '',
          qrCodeBase64: result.qrCodeBase64 || '',
          usdAmount: usdAmount,
          brlAmount: brlAmount
        });
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
    try {
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
              title: 'Pagamento confirmado!',
              description: 'Seu saldo foi atualizado automaticamente'
            });
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
    }
  };

  // Valores pré-definidos para facilitar a seleção
  const quickAmounts = [10, 25, 50, 100, 250, 500];
  return <Card className="w-full max-w-lg mx-auto h-fit max-h-[85vh] overflow-hidden shadow-lg">
      <CardHeader className="pb-4 px-4 bg-gradient-to-r from-primary/5 to-primary/10">
        <CardTitle className="flex items-center gap-2 text-lg sm:text-xl font-bold">
          <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
            <QrCode className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
          </div>
          💰 Depósito PIX
        </CardTitle>
        <CardDescription className="text-sm leading-relaxed text-muted-foreground">
          Adicione saldo à sua conta de forma rápida e segura
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 px-4 pb-4 overflow-y-auto max-h-[calc(85vh-140px)]">
        {!depositData ? <>
            {/* Seção de Valor Melhorada */}
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-foreground mb-2">💵 Escolha o Valor</h3>
                <p className="text-sm text-muted-foreground">Selecione um valor ou digite o valor desejado</p>
              </div>

              {/* Botões de Valores Rápidos */}
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                {quickAmounts.map(quickAmount => <Button key={quickAmount} variant={amount === quickAmount.toString() ? "default" : "outline"} onClick={() => setAmount(quickAmount.toString())} className="h-12 sm:h-14 text-sm sm:text-base font-semibold transition-all duration-200 hover:scale-105">
                    ${quickAmount}
                  </Button>)}
              </div>

              {/* Input Personalizado */}
              <div className="space-y-2">
                <Label htmlFor="amount" className="text-sm font-medium flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Valor Personalizado (USD)
                </Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input id="amount" type="number" placeholder="Digite o valor..." value={amount} onChange={e => setAmount(e.target.value)} min="2" step="0.01" className="pl-10 text-base h-12 text-center font-semibold" />
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  Valor mínimo: $2.00
                </p>
              </div>

              {/* Preview do Valor */}
              {amount && parseFloat(amount) > 0 && <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border-2 border-green-200 shadow-sm bg-slate-950">
                  <div className="text-center space-y-2">
                    <div className="text-sm font-medium text-green-800">💳 Valor do PIX</div>
                    <CurrencyDisplay usdAmount={parseFloat(amount)} size="lg" orientation="vertical" />
                    <div className="text-xs text-green-700 bg-green-100 px-3 py-1 rounded-full inline-block">
                      ✅ Processamento instantâneo
                    </div>
                  </div>
                </div>}
            </div>

            {/* Seção CPF Melhorada */}
            <div className="space-y-3">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-foreground mb-2">🆔 Identificação</h3>
                <p className="text-sm text-muted-foreground">Informe seu CPF para processar o depósito</p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="cpf" className="text-sm font-medium">CPF do Titular</Label>
                <Input id="cpf" placeholder="000.000.000-00" value={cpf} onChange={e => setCpf(formatCPF(e.target.value))} maxLength={14} className="text-base h-12 text-center font-mono" />
              </div>
            </div>

            {/* Botão de Ação Melhorado */}
            <div className="space-y-3 pt-2">
              <Button onClick={handleCreateDeposit} disabled={loading || !amount || !cpf || parseFloat(amount) < 2} className="w-full h-14 text-base font-bold bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 transition-all duration-200 hover:scale-[1.02] shadow-lg">
                {loading ? <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Gerando PIX...
                  </div> : <div className="flex items-center gap-2">
                    <QrCode className="h-5 w-5" />
                    🚀 Gerar PIX Agora
                  </div>}
              </Button>
              
              {/* Informações de Segurança */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs">🔒</span>
                  </div>
                  <div className="text-xs text-blue-800 leading-relaxed">
                    <strong>Seguro e Confiável:</strong> Seus dados são protegidos e o PIX é processado instantaneamente pela DigitoPay.
                  </div>
                </div>
              </div>
            </div>
          </> : <div className="space-y-4">
            {/* Header do PIX Gerado */}
            <div className="text-center bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border-2 border-green-200">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <QrCode className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-green-800 mb-2">🎉 PIX Gerado com Sucesso!</h3>
              <p className="text-sm text-green-700 leading-relaxed">
                Escaneie o QR Code ou copie o código PIX para finalizar o pagamento
              </p>
            </div>

            {/* Detalhes do Depósito */}
            {depositData.brlAmount && depositData.usdAmount && <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-4">
                <div className="text-center space-y-3">
                  <div className="text-sm font-semibold text-blue-800 mb-3">💰 Resumo do Depósito</div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/70 rounded-lg p-3 border border-blue-100">
                      <div className="text-xs text-blue-600 mb-1">Valor PIX</div>
                      <div className="text-lg font-bold text-blue-800">{formatBRL(depositData.brlAmount)}</div>
                    </div>
                    <div className="bg-white/70 rounded-lg p-3 border border-blue-100">
                      <div className="text-xs text-blue-600 mb-1">Crédito USD</div>
                      <div className="text-lg font-bold text-blue-800">{formatUSD(depositData.usdAmount)}</div>
                    </div>
                  </div>
                </div>
              </div>}

            {/* QR Code Melhorado */}
            {depositData.qrCodeBase64 && <div className="bg-white rounded-xl p-4 border-2 border-gray-200 shadow-sm">
                <div className="text-center space-y-3">
                  <h4 className="text-lg font-semibold text-foreground">📱 Escaneie o QR Code</h4>
                  <div className="flex justify-center">
                    <div className="bg-white p-3 rounded-xl border-2 border-gray-100 shadow-md">
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
                  <p className="text-sm text-muted-foreground">
                    Abra seu app bancário e escaneie o código
                  </p>
                </div>
              </div>}

            {/* Código PIX Melhorado */}
            {depositData.pixCode && <div className="bg-white rounded-xl p-4 border-2 border-gray-200 shadow-sm">
                <div className="space-y-3">
                  <h4 className="text-lg font-semibold text-foreground text-center">💳 Ou copie o código PIX</h4>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">Código PIX Copia e Cola</Label>
                    <div className="flex gap-2">
                      <Input value={depositData.pixCode} readOnly className="font-mono text-sm bg-gray-50 border-2 border-gray-200" />
                      <Button onClick={copyPixCode} className="h-12 px-4 bg-primary hover:bg-primary/90 shadow-md" title="Copiar código PIX">
                        <Copy className="h-4 w-4 mr-2" />
                        Copiar
                      </Button>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground text-center">
                    Cole este código no seu app bancário na opção "PIX Copia e Cola"
                  </p>
                </div>
              </div>}

            {/* Ações Melhoradas */}
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" onClick={downloadQRCode} className="h-12 text-sm font-semibold border-2 hover:bg-gray-50" disabled={!depositData.qrCodeBase64}>
                  <Download className="h-4 w-4 mr-2" />
                  Baixar QR
                </Button>
                <Button onClick={checkStatus} className="h-12 text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white">
                  🔍 Verificar Status
                </Button>
              </div>

              <Button variant="outline" onClick={() => setDepositData(null)} className="w-full h-12 text-sm font-semibold border-2 hover:bg-gray-50">
                ➕ Fazer Novo Depósito
              </Button>
            </div>

            {/* Instruções de Pagamento */}
            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4">
              <div className="text-center space-y-2">
                <div className="text-sm font-semibold text-yellow-800">⏰ Como pagar:</div>
                <div className="text-xs text-yellow-700 space-y-1 text-left">
                  <p>• <strong>Pelo QR Code:</strong> Abra seu app bancário → PIX → Ler QR Code</p>
                  <p>• <strong>Por Copia e Cola:</strong> Copie o código → Cole no app bancário → PIX</p>
                  <p>• <strong>Processamento:</strong> Instantâneo após confirmação do pagamento</p>
                </div>
              </div>
            </div>
          </div>}
      </CardContent>
    </Card>;
};