import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Wallet,
  Copy,
  QrCode,
  Timer,
  CheckCircle,
  RefreshCw,
  AlertCircle,
  CreditCard,
  DollarSign
} from 'lucide-react';

interface PaymentData {
  payment_id: string;
  pay_address: string;
  pay_amount: number;
  qr_code_base64?: string;
  status: string;
  expires_at?: string;
}

type USDTNetwork = 'TRC20' | 'ERC20' | 'BSC';

const USDT_NETWORKS = [
  { id: 'TRC20', name: 'TRC-20 (Tron)', fee: 'Baixa taxa', color: 'bg-green-100 text-green-800' },
  { id: 'ERC20', name: 'ERC-20 (Ethereum)', fee: 'Taxa alta', color: 'bg-blue-100 text-blue-800' },
  { id: 'BSC', name: 'BSC (Binance)', fee: 'Taxa média', color: 'bg-yellow-100 text-yellow-800' }
] as const;

export default function SimpleUSDTPayment() {
  const [usdAmount, setUsdAmount] = useState('');
  const [selectedNetwork, setSelectedNetwork] = useState<USDTNetwork>('TRC20');
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const { toast } = useToast();

  // Timer countdown for payment expiration
  useEffect(() => {
    if (timeLeft <= 0 || !paymentData) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, paymentData]);

  // Real-time payment status updates
  useEffect(() => {
    if (!paymentData?.payment_id) return;

    const subscription = supabase
      .channel('payment_status_updates')
      .on('postgres_changes', 
        { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'payments',
          filter: `payment_id=eq.${paymentData.payment_id}`
        },
        (payload) => {
          const newStatus = payload.new.status;
          if (newStatus !== paymentData.status) {
            setPaymentData(prev => prev ? { ...prev, status: newStatus } : null);
            
            if (newStatus === 'finished' || newStatus === 'confirmed') {
              toast({
                title: "Pagamento Confirmado! ✅",
                description: "Seu pagamento foi processado com sucesso",
                variant: "default",
              });
            } else if (newStatus === 'failed' || newStatus === 'expired') {
              toast({
                title: "Pagamento Falhou ❌",
                description: "Seu pagamento não foi processado",
                variant: "destructive",
              });
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [paymentData?.payment_id, paymentData?.status, toast]);

  const createPayment = async () => {
    if (!usdAmount || parseFloat(usdAmount) <= 0) {
      toast({
        title: "Erro",
        description: "Por favor, insira um valor válido em USD",
        variant: "destructive",
      });
      return;
    }

    const amount = parseFloat(usdAmount);
    if (amount < 10) {
      toast({
        title: "Valor Mínimo",
        description: "O valor mínimo é $10 USD",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('nowpayments-create-payment', {
        body: {
          price_amount: amount,
          price_currency: 'usd',
          pay_currency: `usdt${selectedNetwork.toLowerCase()}`,
          order_id: `simple_${Date.now()}`,
          order_description: `Pagamento USDT ${selectedNetwork}`,
          ipn_callback_url: `${window.location.origin}/api/nowpayments-webhook`
        }
      });

      if (error) throw error;

      if (data.success && data.payment) {
        setPaymentData({
          payment_id: data.payment.payment_id,
          pay_address: data.payment.pay_address,
          pay_amount: data.payment.pay_amount,
          qr_code_base64: data.payment.qr_code,
          status: data.payment.payment_status || 'waiting',
          expires_at: data.payment.expires_at
        });
        
        // Set timer for 15 minutes
        setTimeLeft(15 * 60);
        
        toast({
          title: "Pagamento Criado! 🎉",
          description: "Complete o pagamento no tempo limite",
          variant: "default",
        });
      } else {
        throw new Error(data.error || 'Erro ao criar pagamento');
      }
    } catch (error: any) {
      console.error('Erro ao criar pagamento:', error);
      toast({
        title: "Erro",
        description: error.message || "Não foi possível criar o pagamento",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copiado! 📋",
      description: `${label} copiado para área de transferência`,
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusBadge = () => {
    if (!paymentData) return null;

    const statusConfig = {
      waiting: { variant: 'outline' as const, icon: Timer, label: 'Aguardando', color: 'text-yellow-600' },
      confirming: { variant: 'secondary' as const, icon: RefreshCw, label: 'Confirmando', color: 'text-blue-600' },
      confirmed: { variant: 'default' as const, icon: CheckCircle, label: 'Confirmado', color: 'text-green-600' },
      finished: { variant: 'default' as const, icon: CheckCircle, label: 'Concluído', color: 'text-green-600' },
      failed: { variant: 'destructive' as const, icon: AlertCircle, label: 'Falhou', color: 'text-red-600' },
      expired: { variant: 'destructive' as const, icon: AlertCircle, label: 'Expirado', color: 'text-red-600' }
    };

    const config = statusConfig[paymentData.status as keyof typeof statusConfig] || statusConfig.waiting;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className={`${config.color} flex items-center gap-1`}>
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const isCompleted = paymentData?.status === 'finished' || paymentData?.status === 'confirmed';
  const isFailed = paymentData?.status === 'failed' || paymentData?.status === 'expired' || timeLeft <= 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 p-4">
      <div className="container mx-auto max-w-4xl space-y-6">
        {/* Header */}
        <div className="text-center py-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <Wallet className="h-8 w-8 text-primary" />
            </div>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Pagamento USDT Simples
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Faça pagamentos rápidos e seguros com USDT
          </p>
        </div>

        {!paymentData ? (
          /* Payment Form */
          <Card className="mx-auto max-w-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Criar Pagamento
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* USD Amount Input */}
              <div className="space-y-2">
                <Label htmlFor="usd-amount" className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Valor em USD
                </Label>
                <Input
                  id="usd-amount"
                  type="number"
                  placeholder="0.00"
                  value={usdAmount}
                  onChange={(e) => setUsdAmount(e.target.value)}
                  min="10"
                  step="0.01"
                  className="text-lg font-mono"
                />
                <p className="text-sm text-muted-foreground">
                  Valor mínimo: $10 USD
                </p>
              </div>

              {/* USDT Network Selection */}
              <div className="space-y-3">
                <Label>Selecione a Rede USDT</Label>
                <div className="grid gap-3">
                  {USDT_NETWORKS.map((network) => (
                    <button
                      key={network.id}
                      onClick={() => setSelectedNetwork(network.id)}
                      className={`p-4 rounded-lg border-2 transition-all text-left ${
                        selectedNetwork === network.id
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">{network.name}</div>
                          <div className="text-sm text-muted-foreground">{network.fee}</div>
                        </div>
                        <Badge className={network.color} variant="secondary">
                          {network.id}
                        </Badge>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* USDT Conversion Preview */}
              {usdAmount && parseFloat(usdAmount) > 0 && (
                <div className="p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Valor em USDT:</span>
                    <span className="font-mono font-semibold">
                      ≈ {parseFloat(usdAmount).toFixed(2)} USDT
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-sm text-muted-foreground">Rede:</span>
                    <span className="text-sm font-medium">{selectedNetwork}</span>
                  </div>
                </div>
              )}

              <Button 
                onClick={createPayment} 
                disabled={loading || !usdAmount || parseFloat(usdAmount) < 10}
                className="w-full"
                size="lg"
              >
                {loading ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Criando Pagamento...
                  </>
                ) : (
                  <>
                    <Wallet className="h-4 w-4 mr-2" />
                    Criar Pagamento USDT
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        ) : (
          /* Payment Details */
          <div className="space-y-6">
            {/* Status Card */}
            <Card className={`border-2 ${
              isCompleted ? 'border-green-200 bg-green-50' : 
              isFailed ? 'border-red-200 bg-red-50' : 
              'border-primary/20 bg-primary/5'
            }`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold">Status do Pagamento</h2>
                  {getStatusBadge()}
                </div>
                
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Valor</p>
                    <p className="text-2xl font-bold">${usdAmount}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">USDT a Pagar</p>
                    <p className="text-xl font-mono">{paymentData.pay_amount?.toFixed(6)} USDT</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Tempo Restante</p>
                    <p className={`text-xl font-mono ${timeLeft <= 300 ? 'text-destructive' : 'text-primary'}`}>
                      {timeLeft > 0 ? formatTime(timeLeft) : 'Expirado'}
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
                      <div className="p-4 bg-white rounded-xl shadow-inner">
                        <img 
                          src={`data:image/png;base64,${paymentData.qr_code_base64}`}
                          alt="QR Code para pagamento"
                          className="w-48 h-48"
                        />
                      </div>
                    ) : (
                      <div className="w-48 h-48 bg-muted rounded-xl flex items-center justify-center">
                        <QrCode className="h-16 w-16 text-muted-foreground" />
                      </div>
                    )}
                    <p className="text-sm text-center text-muted-foreground">
                      Escaneie com sua carteira {selectedNetwork}
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
                      <Label className="text-sm font-medium">Endereço da Carteira ({selectedNetwork})</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <code className="flex-1 p-3 bg-muted rounded-lg text-sm break-all font-mono">
                          {paymentData.pay_address}
                        </code>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copyToClipboard(paymentData.pay_address, 'Endereço')}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Amount */}
                    <div>
                      <Label className="text-sm font-medium">Valor Exato a Pagar</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <code className="flex-1 p-3 bg-muted rounded-lg text-sm font-mono">
                          {paymentData.pay_amount?.toFixed(8)} USDT
                        </code>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copyToClipboard(paymentData.pay_amount?.toString() || '', 'Valor')}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Payment ID */}
                    <div>
                      <Label className="text-sm font-medium">ID do Pagamento</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <code className="flex-1 p-3 bg-muted rounded-lg text-xs">
                          {paymentData.payment_id}
                        </code>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copyToClipboard(paymentData.payment_id, 'ID do Pagamento')}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Instructions */}
            {!isCompleted && !isFailed && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Instruções de Pagamento:</strong>
                  <ol className="list-decimal list-inside mt-2 space-y-1">
                    <li>Envie exatamente <strong>{paymentData.pay_amount?.toFixed(8)} USDT</strong> para o endereço acima</li>
                    <li>Use apenas a rede <strong>{selectedNetwork}</strong></li>
                    <li>Complete o pagamento dentro do tempo limite</li>
                    <li>Aguarde 1-3 confirmações para processamento</li>
                  </ol>
                </AlertDescription>
              </Alert>
            )}

            {/* Status Messages */}
            {isCompleted && (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-700">
                  <strong>Pagamento Confirmado! ✅</strong> Sua transação foi processada com sucesso.
                </AlertDescription>
              </Alert>
            )}

            {isFailed && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Pagamento Expirado ou Falhou ❌</strong> 
                  {timeLeft <= 0 ? ' O tempo limite foi atingido.' : ' Houve um problema com sua transação.'}
                </AlertDescription>
              </Alert>
            )}

            {/* Action Buttons */}
            <div className="flex justify-center gap-4">
              <Button
                variant="outline"
                onClick={() => window.location.reload()}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Atualizar Status
              </Button>
              
              <Button
                variant="secondary"
                onClick={() => {
                  setPaymentData(null);
                  setUsdAmount('');
                  setTimeLeft(0);
                }}
              >
                Novo Pagamento
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}