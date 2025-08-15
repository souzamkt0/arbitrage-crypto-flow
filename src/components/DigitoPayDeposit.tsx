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

export const DigitoPayDeposit: React.FC<DigitoPayDepositProps> = ({ onSuccess }) => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const { convertBRLToUSD, formatBRL, formatUSD, convertUSDToBRL, exchangeRate } = useCurrency();
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
          description: 'Cole o código no seu app bancário',
        });
      } catch (error) {
        toast({
          title: 'Erro ao copiar',
          description: 'Copie manualmente o código PIX',
          variant: 'destructive',
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
        variant: 'destructive',
      });
      return;
    }

    if (!amount || !cpf) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Preencha o valor e CPF',
        variant: 'destructive',
      });
      return;
    }

    const usdAmount = parseFloat(amount);
    if (usdAmount < 2) {
      toast({
        title: 'Valor mínimo',
        description: 'O valor mínimo é $2.00',
        variant: 'destructive',
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
      const result = await DigitoPayService.createDeposit(
        brlAmount, // Valor em BRL para o PIX
        cpf,
        profile.display_name || profile.username || 'Nome não informado',
        callbackUrl
      );

      console.log('📋 Resultado do depósito:', result);

      if (result.success && result.id) {
        console.log('✅ Depósito criado com sucesso:', result);
        setDepositData({
          trxId: result.id,
          pixCode: result.pixCopiaECola || '',
          qrCodeBase64: result.qrCodeBase64 || '',
          usdAmount: usdAmount,
          brlAmount: brlAmount,
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
          description: 'Escaneie o QR Code ou copie o código PIX',
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
        variant: 'destructive',
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
        await DigitoPayService.updateTransactionStatus(
          depositData.trxId,
          'completed',
          result
        );

        // Chamar função para processar transação manualmente
        try {
          const response = await fetch('https://cbwpghrkfvczjqzefvix.supabase.co/functions/v1/process-transaction', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ trxId: depositData.trxId })
          });

          const processResult = await response.json();
          console.log('🔧 Resultado do processamento:', processResult);

          if (processResult.success) {
            toast({
              title: 'Pagamento confirmado!',
              description: 'Seu saldo foi atualizado automaticamente',
            });
          } else {
            toast({
              title: 'Pagamento confirmado!',
              description: 'Entre em contato se o saldo não foi atualizado',
            });
          }
        } catch (processError) {
          console.error('❌ Erro ao processar transação:', processError);
          toast({
            title: 'Pagamento confirmado!',
            description: 'Entre em contato se o saldo não foi atualizado',
          });
        }

        setDepositData(null);
        setAmount('');
        onSuccess?.();
      } else if (result.status === 'CANCELLED' || result.status === 'CANCELED' || result.status === 'CANCELADO' || result.status === 'EXPIRED' || result.status === 'EXPIRADO') {
        toast({
          title: 'Pagamento cancelado/expirado',
          description: 'Tente novamente',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Aguardando pagamento',
          description: `Status: ${result.status}`,
        });
      }
    } catch (error) {
      console.error('❌ Erro ao verificar status:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao verificar status',
        variant: 'destructive',
      });
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto h-fit max-h-[80vh] overflow-hidden">
      <CardHeader className="pb-3 px-4">
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
          <QrCode className="h-4 w-4 sm:h-5 sm:w-5" />
          Depósito PIX
        </CardTitle>
        <CardDescription className="text-xs sm:text-sm leading-relaxed">
          Faça um depósito via PIX para adicionar saldo à sua conta
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 px-4 pb-4 overflow-y-auto max-h-[calc(80vh-120px)]">
        {/* Valor para depósito - Box estilizado */}
        <div className="p-3 sm:p-4 bg-gradient-to-r from-primary/20 to-primary/10 rounded-lg border-2 border-primary/20 shadow-md">
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-2">
              <QrCode className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              <h4 className="font-semibold text-sm sm:text-base text-primary">Valor para Depósito</h4>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-lg p-3 sm:p-4 border border-primary/10 shadow-inner">
              {amount && parseFloat(amount) > 0 ? (
                <CurrencyDisplay usdAmount={parseFloat(amount)} size="md" orientation="vertical" />
              ) : (
                <div className="text-xs sm:text-sm text-muted-foreground">Informe o valor em USD para ver o total em reais</div>
              )}
            </div>
          </div>
        </div>

        {!depositData ? (
          <>
            <div className="space-y-2">
              <Label htmlFor="amount" className="text-sm font-medium">Valor (USD)</Label>
              <Input
                id="amount"
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min="2"
                step="0.01"
                className="text-base"
              />
              {/* Mostrar conversão em tempo real */}
              {amount && parseFloat(amount) > 0 && (
                <div className="mt-2 p-2 sm:p-3 bg-gray-50 rounded-lg border">
                  <div className="text-xs text-muted-foreground mb-2">Valor do PIX em reais:</div>
                  <CurrencyDisplay 
                    usdAmount={parseFloat(amount)}
                    size="sm"
                    orientation="horizontal"
                  />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="cpf" className="text-sm font-medium">CPF</Label>
              <Input
                id="cpf"
                placeholder="000.000.000-00"
                value={cpf}
                onChange={(e) => setCpf(formatCPF(e.target.value))}
                maxLength={14}
                className="text-base"
              />
            </div>

            <Button
              onClick={handleCreateDeposit}
              disabled={loading || !amount || !cpf}
              className="w-full text-sm sm:text-base py-2 sm:py-3"
            >
              {loading ? 'Criando depósito...' : 'Criar Depósito'}
            </Button>
          </>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            <div className="text-center">
              <h3 className="text-base sm:text-lg font-semibold mb-2">Pagamento PIX</h3>
              <p className="text-xs sm:text-sm text-muted-foreground mb-2 leading-relaxed">
                Escaneie o QR Code ou copie o código PIX
              </p>
              
              {/* Mostrar valores do depósito */}
              {depositData.brlAmount && depositData.usdAmount && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-2 sm:p-3 mb-3">
                  <div className="text-xs sm:text-sm font-medium text-green-800 mb-2">Detalhes do Depósito</div>
                  <div className="space-y-1 sm:space-y-2">
                    <div className="flex justify-between items-center text-xs sm:text-sm">
                      <span className="text-green-700">Valor PIX:</span>
                      <span className="font-semibold text-green-800">{formatBRL(depositData.brlAmount)}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs sm:text-sm">
                      <span className="text-green-700">Crédito USD:</span>
                      <span className="font-semibold text-green-800">{formatUSD(depositData.usdAmount)}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {depositData.qrCodeBase64 && (
              <div className="flex justify-center py-2">
                <div className="bg-white p-2 sm:p-3 rounded-lg border shadow-sm max-w-full">
                  <img
                    src={depositData.qrCodeBase64.startsWith('data:') 
                      ? depositData.qrCodeBase64 
                      : `data:image/png;base64,${depositData.qrCodeBase64}`}
                    alt="QR Code PIX"
                    className="rounded-md w-full h-auto"
                    style={{ 
                      width: '160px', 
                      height: '160px', 
                      maxWidth: '100%',
                      minWidth: '120px'
                    }}
                    onError={(e) => {
                      console.error('❌ Erro ao carregar QR Code:', e);
                      console.log('📄 QR Code data:', depositData.qrCodeBase64?.substring(0, 100) + '...');
                    }}
                    onLoad={() => {
                      console.log('✅ QR Code carregado com sucesso');
                    }}
                  />
                </div>
              </div>
            )}

            {depositData.pixCode && (
              <div className="space-y-2">
                <Label className="text-xs sm:text-sm font-medium">Código PIX</Label>
                <div className="flex gap-2">
                  <Input
                    value={depositData.pixCode}
                    readOnly
                    className="font-mono text-xs leading-relaxed bg-gray-50"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={copyPixCode}
                    title="Copiar código PIX"
                    className="shrink-0 h-9 w-9 sm:h-10 sm:w-10"
                  >
                    <Copy className="h-3 w-3 sm:h-4 sm:w-4" />
                  </Button>
                </div>
              </div>
            )}

            <div className="flex flex-col gap-2">
              <div className="flex flex-col sm:flex-row gap-2">
                <Button
                  variant="outline"
                  onClick={downloadQRCode}
                  className="flex-1 text-xs sm:text-sm py-2"
                  disabled={!depositData.qrCodeBase64}
                >
                  <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                  <span className="truncate">Baixar QR</span>
                </Button>
                <Button
                  onClick={checkStatus}
                  className="flex-1 text-xs sm:text-sm py-2"
                >
                  <span className="truncate">Verificar Status</span>
                </Button>
              </div>

              <Button
                variant="outline"
                onClick={() => setDepositData(null)}
                className="w-full text-xs sm:text-sm py-2"
              >
                Novo Depósito
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};