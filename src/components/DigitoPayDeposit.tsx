import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { DigitoPayService } from '@/services/digitopayService';
import { useAuth } from '@/hooks/useAuth';
import { Copy, Download, QrCode } from 'lucide-react';

interface DigitoPayDepositProps {
  onSuccess?: () => void;
}

export const DigitoPayDeposit: React.FC<DigitoPayDepositProps> = ({ onSuccess }) => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [amount, setAmount] = useState('');
  const [cpf, setCpf] = useState('');
  const [loading, setLoading] = useState(false);
  const [depositData, setDepositData] = useState<{
    trxId: string;
    pixCode: string;
    qrCodeBase64: string;
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

    const amountValue = parseFloat(amount);
    if (amountValue < 10) {
      toast({
        title: 'Valor mínimo',
        description: 'O valor mínimo é R$ 10,00',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      // URL de callback para webhook
      const callbackUrl = `${window.location.origin}/api/digitopay/webhook/deposit`;

      // Criar depósito no DigitoPay
      const result = await DigitoPayService.createDeposit(
        amountValue,
        cpf,
        profile.display_name || profile.username || 'Nome não informado',
        callbackUrl
      );

      if (result.success && result.id) {
        // Salvar transação no banco
        const saveResult = await DigitoPayService.saveTransaction(
          user.id,
          result.id,
          'deposit',
          amountValue,
          amountValue, // Valor em BRL
          result.pixCopiaECola,
          result.qrCodeBase64,
          undefined,
          undefined,
          profile.display_name || profile.username || 'Nome não informado',
          cpf,
          result
        );

        if (saveResult.success) {
          console.log('✅ Transação salva com sucesso:', result);
          setDepositData({
            trxId: result.id,
            pixCode: result.pixCopiaECola || '',
            qrCodeBase64: result.qrCodeBase64 || '',
          });

          console.log('📱 Dados do depósito configurados:', {
            trxId: result.id,
            hasPixCode: !!result.pixCopiaECola,
            hasQrCode: !!result.qrCodeBase64,
            qrCodeLength: result.qrCodeBase64?.length || 0
          });

          toast({
            title: 'Depósito criado!',
            description: 'Escaneie o QR Code ou copie o código PIX',
          });

          onSuccess?.();
        } else {
          throw new Error('Erro ao salvar transação');
        }
      } else {
        throw new Error(result.message || 'Erro ao criar depósito');
      }
    } catch (error) {
      console.error('Erro ao criar depósito:', error);
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
      
      if (result.status === 'PAID') {
        toast({
          title: 'Pagamento confirmado!',
          description: 'Seu saldo foi atualizado',
        });
        
        // Atualizar status no banco
        await DigitoPayService.updateTransactionStatus(
          depositData.trxId,
          'completed',
          result
        );

        setDepositData(null);
        setAmount('');
        onSuccess?.();
      } else if (result.status === 'CANCELLED' || result.status === 'EXPIRED') {
        toast({
          title: 'Pagamento cancelado/expirado',
          description: 'Tente novamente',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Aguardando pagamento',
          description: 'O pagamento ainda não foi confirmado',
        });
      }
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao verificar status',
        variant: 'destructive',
      });
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <QrCode className="h-5 w-5" />
          Depósito PIX
        </CardTitle>
        <CardDescription>
          Faça um depósito via PIX para adicionar saldo à sua conta
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">


        {!depositData ? (
          <>
            <div className="space-y-2">
              <Label htmlFor="amount">Valor (R$)</Label>
              <Input
                id="amount"
                type="number"
                placeholder="0,00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min="10"
                step="0.01"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cpf">CPF</Label>
              <Input
                id="cpf"
                placeholder="000.000.000-00"
                value={cpf}
                onChange={(e) => setCpf(formatCPF(e.target.value))}
                maxLength={14}
              />
            </div>

            <Button
              onClick={handleCreateDeposit}
              disabled={loading || !amount || !cpf}
              className="w-full"
            >
              {loading ? 'Criando depósito...' : 'Criar Depósito'}
            </Button>
          </>
        ) : (
          <div className="space-y-4">
            <div className="text-center">
              <h3 className="font-semibold mb-2">Pagamento PIX</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Escaneie o QR Code ou copie o código PIX
              </p>
            </div>

            {depositData.qrCodeBase64 && (
              <div className="flex justify-center">
                <img
                  src={depositData.qrCodeBase64.startsWith('data:') 
                    ? depositData.qrCodeBase64 
                    : `data:image/png;base64,${depositData.qrCodeBase64}`}
                  alt="QR Code PIX"
                  className="border rounded-lg"
                  width={200}
                  height={200}
                  onError={(e) => {
                    console.error('❌ Erro ao carregar QR Code:', e);
                    console.log('📄 QR Code data:', depositData.qrCodeBase64?.substring(0, 100) + '...');
                  }}
                  onLoad={() => {
                    console.log('✅ QR Code carregado com sucesso');
                  }}
                />
              </div>
            )}

            {depositData.pixCode && (
              <div className="space-y-2">
                <Label>Código PIX</Label>
                <div className="flex gap-2">
                  <Input
                    value={depositData.pixCode}
                    readOnly
                    className="font-mono text-sm"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={copyPixCode}
                    title="Copiar código PIX"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={downloadQRCode}
                className="flex-1"
                disabled={!depositData.qrCodeBase64}
              >
                <Download className="h-4 w-4 mr-2" />
                Baixar QR Code
              </Button>
              <Button
                onClick={checkStatus}
                className="flex-1"
              >
                Verificar Status
              </Button>
            </div>

            <Button
              variant="outline"
              onClick={() => setDepositData(null)}
              className="w-full"
            >
              Novo Depósito
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}; 