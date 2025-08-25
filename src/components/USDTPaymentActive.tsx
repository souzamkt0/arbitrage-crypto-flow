import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { USDTPaymentService, PaymentResponse } from '@/services/usdtPaymentService';
import { 
  QrCode, 
  Copy, 
  Timer, 
  CheckCircle, 
  AlertCircle,
  RefreshCw,
  Wallet,
  ExternalLink
} from 'lucide-react';

interface USDTPaymentActiveProps {
  paymentData: PaymentResponse & { order_description?: string; price_amount?: number };
  onPaymentComplete: () => void;
}

export function USDTPaymentActive({ paymentData, onPaymentComplete }: USDTPaymentActiveProps) {
  const [timeLeft, setTimeLeft] = useState<number>(15 * 60); // 15 minutos
  const [status, setStatus] = useState(paymentData.payment_status || 'waiting');
  const [checkingStatus, setCheckingStatus] = useState(false);
  const { toast } = useToast();

  // Timer countdown
  useEffect(() => {
    if (timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  // Check payment status periodically
  useEffect(() => {
    if (!paymentData.payment_id) return;

    const checkStatus = async () => {
      try {
        setCheckingStatus(true);
        const statusResponse = await USDTPaymentService.getPaymentStatus(paymentData.payment_id!);
        const newStatus = statusResponse.payment_status || statusResponse.pay_status || 'waiting';
        
        if (newStatus !== status) {
          setStatus(newStatus);
          
          if (newStatus === 'finished' || newStatus === 'confirmed') {
            toast({
              title: "Pagamento Confirmado!",
              description: "Seu pagamento foi processado com sucesso",
              variant: "default",
            });
            setTimeout(() => onPaymentComplete(), 2000);
          } else if (newStatus === 'failed' || newStatus === 'expired') {
            toast({
              title: "Pagamento Falhou",
              description: "Seu pagamento não foi processado",
              variant: "destructive",
            });
          }
        }
      } catch (error) {
        console.error('Erro ao verificar status:', error);
      } finally {
        setCheckingStatus(false);
      }
    };

    // Check immediately
    checkStatus();

    // Then check every 10 seconds
    const interval = setInterval(checkStatus, 10000);
    return () => clearInterval(interval);
  }, [paymentData.payment_id, status, onPaymentComplete, toast]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copiado!",
      description: `${label} copiado para a área de transferência`,
    });
  };

  const getStatusBadge = () => {
    const statusConfig = {
      waiting: { variant: 'outline' as const, icon: Timer, label: 'Aguardando', color: 'text-yellow-500' },
      confirming: { variant: 'secondary' as const, icon: RefreshCw, label: 'Confirmando', color: 'text-blue-500' },
      confirmed: { variant: 'default' as const, icon: CheckCircle, label: 'Confirmado', color: 'text-green-500' },
      finished: { variant: 'default' as const, icon: CheckCircle, label: 'Concluído', color: 'text-green-500' },
      failed: { variant: 'destructive' as const, icon: AlertCircle, label: 'Falhou', color: 'text-red-500' },
      expired: { variant: 'destructive' as const, icon: AlertCircle, label: 'Expirado', color: 'text-red-500' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.waiting;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className={`${config.color} flex items-center gap-1`}>
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const isExpired = timeLeft <= 0;
  const isCompleted = status === 'finished' || status === 'confirmed';
  const isFailed = status === 'failed' || status === 'expired' || isExpired;

  return (
    <div className="space-y-6 animate-fade-in-scale">
      {/* Status Header */}
      <Card className={`border-2 ${
        isCompleted ? 'border-success' : 
        isFailed ? 'border-destructive' : 
        'border-primary'
      }`}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Status do Pagamento</h2>
            {getStatusBadge()}
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold">${paymentData.price_amount?.toFixed(2) || '0.00'}</p>
              <p className="text-muted-foreground">{paymentData.order_description}</p>
            </div>
            
            <div className="text-right">
              <div className={`text-2xl font-mono ${isExpired ? 'text-destructive' : 'text-primary'}`}>
                {formatTime(timeLeft)}
              </div>
              <p className="text-sm text-muted-foreground">
                {isExpired ? 'Expirado' : 'Tempo restante'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Info */}
      {!isFailed && (
        <div className="grid md:grid-cols-2 gap-6">
          {/* QR Code */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <QrCode className="h-5 w-5" />
                QR Code
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center space-y-4">
              {paymentData.qr_code_base64 ? (
                <div className="p-4 bg-white rounded-lg">
                  <img 
                    src={`data:image/png;base64,${paymentData.qr_code_base64}`}
                    alt="QR Code para pagamento"
                    className="w-48 h-48"
                  />
                </div>
              ) : (
                <div className="w-48 h-48 bg-muted rounded-lg flex items-center justify-center">
                  <QrCode className="h-16 w-16 text-muted-foreground" />
                </div>
              )}
              <p className="text-sm text-center text-muted-foreground">
                Escaneie com sua carteira USDT
              </p>
            </CardContent>
          </Card>

          {/* Payment Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="h-5 w-5" />
                Detalhes do Pagamento
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Address */}
              <div>
                <Label className="text-sm font-medium">Endereço da Carteira</Label>
                <div className="flex items-center gap-2 mt-1">
                  <code className="flex-1 p-2 bg-muted rounded text-sm break-all">
                    {paymentData.pay_address || 'Carregando...'}
                  </code>
                  {paymentData.pay_address && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(paymentData.pay_address!, 'Endereço')}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>

              {/* Amount */}
              <div>
                <Label className="text-sm font-medium">Valor Exato a Pagar</Label>
                <div className="flex items-center gap-2 mt-1">
                  <code className="flex-1 p-2 bg-muted rounded text-sm font-mono">
                    {paymentData.pay_amount?.toFixed(8) || 'Carregando...'} USDT
                  </code>
                  {paymentData.pay_amount && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(paymentData.pay_amount!.toString(), 'Valor')}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>

              {/* Payment ID */}
              {paymentData.payment_id && (
                <div>
                  <Label className="text-sm font-medium">ID do Pagamento</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <code className="flex-1 p-2 bg-muted rounded text-sm">
                      {paymentData.payment_id}
                    </code>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(paymentData.payment_id!, 'ID do Pagamento')}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Instructions */}
      {!isCompleted && !isFailed && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Instruções:</strong>
            <ol className="list-decimal list-inside mt-2 space-y-1">
              <li>Envie exatamente <strong>{paymentData.pay_amount?.toFixed(8)} USDT</strong> para o endereço acima</li>
              <li>Use apenas a rede correspondente ao tipo de USDT selecionado</li>
              <li>O pagamento será confirmado automaticamente após 1-3 confirmações</li>
              <li>Não feche esta página até a confirmação</li>
            </ol>
          </AlertDescription>
        </Alert>
      )}

      {/* Status Messages */}
      {isExpired && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Este pagamento expirou. Por favor, crie um novo pagamento.
          </AlertDescription>
        </Alert>
      )}

      {isCompleted && (
        <Alert className="border-success text-success-foreground bg-success/10">
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            Pagamento confirmado com sucesso! Redirecionando...
          </AlertDescription>
        </Alert>
      )}

      {/* Refresh Button */}
      <div className="flex justify-center">
        <Button
          variant="outline"
          onClick={() => window.location.reload()}
          disabled={checkingStatus}
        >
          {checkingStatus ? (
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4 mr-2" />
          )}
          Atualizar Status
        </Button>
      </div>
    </div>
  );
}

function Label({ className, children, ...props }: { className?: string; children: React.ReactNode; }) {
  return (
    <label className={`text-sm font-medium ${className}`} {...props}>
      {children}
    </label>
  );
}