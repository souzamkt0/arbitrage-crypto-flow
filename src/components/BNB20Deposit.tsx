import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { BNB20Service, BNB20PaymentResponse } from '@/services/bnb20Service';
import { Loader2, Copy, QrCode } from 'lucide-react';

interface BNB20DepositProps {
  onSuccess?: () => void;
}

export const BNB20Deposit: React.FC<BNB20DepositProps> = ({ onSuccess }) => {
  const [amount, setAmount] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [paymentData, setPaymentData] = useState<BNB20PaymentResponse | null>(null);

  const handleCreateDeposit = async () => {
    const numAmount = parseFloat(amount);
    
    if (!numAmount || numAmount <= 0) {
      toast.error('Por favor, insira um valor válido');
      return;
    }

    if (numAmount < 10) {
      toast.error('Valor mínimo é $10 USD');
      return;
    }

    if (numAmount > 10000) {
      toast.error('Valor máximo é $10,000 USD');
      return;
    }

    setIsLoading(true);
    
    try {
      const result = await BNB20Service.createDeposit(numAmount);
      setPaymentData(result);
      
      toast.success('Pagamento BNB20 criado com sucesso!');
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('❌ Erro ao criar depósito:', error);
      toast.error(error instanceof Error ? error.message : 'Erro ao criar pagamento');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyAddress = () => {
    if (paymentData?.pay_address) {
      navigator.clipboard.writeText(paymentData.pay_address);
      toast.success('Endereço copiado!');
    }
  };

  const handleCopyAmount = () => {
    if (paymentData?.pay_amount) {
      navigator.clipboard.writeText(paymentData.pay_amount.toString());
      toast.success('Valor copiado!');
    }
  };

  const formatTimeRemaining = (expiresAt?: string) => {
    if (!expiresAt) return 'Sem expiração definida';
    
    const expiry = new Date(expiresAt);
    const now = new Date();
    const diff = expiry.getTime() - now.getTime();
    
    if (diff <= 0) return 'Expirado';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m`;
  };

  if (paymentData) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5" />
            Depósito BNB20 - Pagamento Criado
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert>
            <AlertDescription>
              <strong>Importante:</strong> Envie exatamente {paymentData.pay_amount} {paymentData.pay_currency?.toUpperCase()} 
              para o endereço abaixo. Valores diferentes podem não ser processados automaticamente.
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium">Valor a Pagar</Label>
              <div className="flex items-center gap-2 mt-1">
                <Input 
                  value={`${paymentData.pay_amount} ${paymentData.pay_currency?.toUpperCase()}`}
                  readOnly 
                  className="font-mono"
                />
                <Button size="sm" variant="outline" onClick={handleCopyAmount}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium">Endereço de Pagamento</Label>
              <div className="flex items-center gap-2 mt-1">
                <Input 
                  value={paymentData.pay_address || ''}
                  readOnly 
                  className="font-mono text-sm"
                />
                <Button size="sm" variant="outline" onClick={handleCopyAddress}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {paymentData.qr_code_url && (
              <div className="text-center">
                <Label className="text-sm font-medium">QR Code</Label>
                <div className="mt-2">
                  <img 
                    src={paymentData.qr_code_url} 
                    alt="QR Code para pagamento"
                    className="mx-auto border rounded-lg"
                  />
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <Label className="text-xs text-muted-foreground">Valor USD</Label>
                <p className="font-medium">{BNB20Service.formatUSD(paymentData.amount_usd || 0)}</p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Equivalente BNB</Label>
                <p className="font-medium">{BNB20Service.formatBNB(paymentData.amount_bnb || 0)}</p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Status</Label>
                <p className="font-medium text-blue-600">
                  {BNB20Service.translateStatus(paymentData.status || 'waiting')}
                </p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Tempo Restante</Label>
                <p className="font-medium">{formatTimeRemaining(paymentData.expires_at)}</p>
              </div>
            </div>
          </div>

          <Alert>
            <AlertDescription className="text-sm">
              <strong>Rede:</strong> Use a rede BSC (Binance Smart Chain) para enviar BNB.<br/>
              <strong>Confirmação:</strong> Após o pagamento, aguarde algumas confirmações na blockchain.<br/>
              <strong>Ativação:</strong> Seu saldo será creditado automaticamente após a confirmação.
            </AlertDescription>
          </Alert>

          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => setPaymentData(null)}
              className="flex-1"
            >
              Voltar
            </Button>
            <Button 
              variant="default"
              onClick={() => window.location.reload()}
              className="flex-1"
            >
              Atualizar Status
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <QrCode className="h-5 w-5" />
          Depósito BNB20
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertDescription>
            Depósitos via BNB (Binance Smart Chain) são processados automaticamente após confirmação na blockchain.
          </AlertDescription>
        </Alert>

        <div className="space-y-2">
          <Label htmlFor="amount">Valor (USD)</Label>
          <Input
            id="amount"
            type="number"
            placeholder="Ex: 100"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            min="10"
            max="10000"
            step="0.01"
          />
          <p className="text-xs text-muted-foreground">
            Mínimo: $10 USD • Máximo: $10,000 USD
          </p>
        </div>

        <Button 
          onClick={handleCreateDeposit}
          disabled={isLoading || !amount}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Criando Pagamento...
            </>
          ) : (
            'Criar Pagamento BNB20'
          )}
        </Button>

        <div className="text-xs text-muted-foreground space-y-1">
          <p>• Pagamento processado via NOWPayments</p>
          <p>• Rede: BSC (Binance Smart Chain)</p>
          <p>• Ativação automática após confirmação</p>
        </div>
      </CardContent>
    </Card>
  );
};