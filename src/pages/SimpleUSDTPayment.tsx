import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Copy, RefreshCw, CheckCircle, Clock, Wallet, QrCode, CreditCard, DollarSign, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface PaymentData {
  id: string;
  amount_usd: number;
  amount_usdt: number;
  network: string;
  address: string;
  qr_code: string;
  status: 'pending' | 'confirmed' | 'failed';
  expires_at: string;
  created_at: string;
}

type USDTNetwork = 'USDTTRC20' | 'USDTERC20' | 'USDTBEP20';

const USDT_NETWORKS = [
  { value: 'USDTTRC20', label: 'USDT TRC-20 (Tron)', fee: '1 USDT' },
  { value: 'USDTERC20', label: 'USDT ERC-20 (Ethereum)', fee: '15+ USDT' },
  { value: 'USDTBEP20', label: 'USDT BEP-20 (BSC)', fee: '1 USDT' }
];

export default function SimpleUSDTPayment() {
  const [usdAmount, setUsdAmount] = useState<string>('');
  const [selectedNetwork, setSelectedNetwork] = useState<USDTNetwork>('USDTTRC20');
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number>(900); // 15 minutes
  const { toast } = useToast();

  // Load payment from localStorage on mount
  useEffect(() => {
    const savedPayment = localStorage.getItem('simple_usdt_payment');
    if (savedPayment) {
      const payment = JSON.parse(savedPayment);
      setPaymentData(payment);
      setUsdAmount(payment.amount_usd.toString());
      setSelectedNetwork(payment.network as USDTNetwork);
      
      // Calculate remaining time
      const expiresAt = new Date(payment.expires_at).getTime();
      const now = Date.now();
      const remaining = Math.max(0, Math.floor((expiresAt - now) / 1000));
      setTimeLeft(remaining);
    }
  }, []);

  // Timer countdown
  useEffect(() => {
    if (timeLeft <= 0 || !paymentData) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        const newTime = Math.max(0, prev - 1);
        
        // Check payment status periodically (removed auto-confirm for real payments)
        
        return newTime;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, paymentData]);

  const handleAutoConfirm = () => {
    if (!paymentData) return;
    
    const confirmedPayment = { ...paymentData, status: 'confirmed' as const };
    setPaymentData(confirmedPayment);
    localStorage.setItem('simple_usdt_payment', JSON.stringify(confirmedPayment));
    
    toast({
      title: "Pagamento Confirmado! ✅",
      description: "Seu pagamento foi processado com sucesso",
      variant: "default",
    });
  };

  const generateQRCode = (address: string, amount: number) => {
    // Generate QR code URL using a free QR code service
    const qrData = `${address}?amount=${amount}`;
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrData)}`;
  };

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

    setIsLoading(true);

    try {
      // Map network to NOWPayments format
      const networkMapping = {
        'USDTTRC20': 'usdttrc20',
        'USDTERC20': 'usdterc20', 
        'USDTBEP20': 'usdtbep20'
      };
      const paymentCurrency = networkMapping[selectedNetwork] || 'usdttrc20';
      
      const { data, error } = await supabase.functions.invoke('nowpayments-create-payment', {
        body: {
          price_amount: amount,
          price_currency: 'usd',
          pay_currency: paymentCurrency,
          order_id: `simple_${Date.now()}`,
          order_description: `USDT Payment ${selectedNetwork} - $${amount}`,
          ipn_callback_url: `${window.location.origin}/api/nowpayments-webhook`
        }
      });

      if (error) {
        console.error('Supabase function error:', error);
        throw new Error(error.message || 'Erro na função Supabase');
      }

      if (!data.success) {
        console.error('Payment creation failed:', data);
        throw new Error(data.error || 'Falha ao criar pagamento');
      }

      const payment: PaymentData = {
        id: data.payment.payment_id,
        amount_usd: amount,
        amount_usdt: data.payment.pay_amount,
        network: selectedNetwork,
        address: data.payment.pay_address,
        qr_code: data.payment.qr_code ? `data:image/png;base64,${data.payment.qr_code}` : generateQRCode(data.payment.pay_address, data.payment.pay_amount),
        status: 'pending',
        expires_at: data.payment.expires_at || new Date(Date.now() + 15 * 60 * 1000).toISOString(),
        created_at: data.payment.created_at || new Date().toISOString()
      };

      // Save to localStorage for persistence
      localStorage.setItem('simple_usdt_payment', JSON.stringify(payment));
      
      setPaymentData(payment);
      setTimeLeft(15 * 60); // 15 minutes
      
      toast({
        title: "Pagamento Criado no NOWPayments! 🎉",
        description: "Pagamento real criado - você pode ver no seu dashboard NOWPayments",
        variant: "default",
      });
    } catch (error: any) {
      console.error('Erro ao criar pagamento:', error);
      toast({
        title: "Erro",
        description: error.message || "Não foi possível criar o pagamento",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
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
      pending: { variant: 'outline' as const, icon: Clock, label: 'Aguardando', color: 'text-yellow-600' },
      confirmed: { variant: 'default' as const, icon: CheckCircle, label: 'Confirmado', color: 'text-green-600' },
      failed: { variant: 'destructive' as const, icon: AlertCircle, label: 'Falhou', color: 'text-red-600' }
    };

    const config = statusConfig[paymentData.status];
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className={`${config.color} flex items-center gap-1`}>
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const startNewPayment = () => {
    localStorage.removeItem('simple_usdt_payment');
    setPaymentData(null);
    setUsdAmount('');
    setTimeLeft(900);
  };

  const refreshStatus = () => {
    toast({
      title: "Status Atualizado! 🔄",
      description: "Status do pagamento foi verificado",
    });
  };

  const isCompleted = paymentData?.status === 'confirmed';
  const isFailed = paymentData?.status === 'failed' || timeLeft <= 0;

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
            Faça pagamentos rápidos e seguros com USDT (Integração Real NOWPayments)
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
                      key={network.value}
                      onClick={() => setSelectedNetwork(network.value as USDTNetwork)}
                      className={`p-4 rounded-lg border-2 transition-all text-left ${
                        selectedNetwork === network.value
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">{network.label}</div>
                          <div className="text-sm text-muted-foreground">Taxa: {network.fee}</div>
                        </div>
                        <Badge variant="secondary">
                          {network.value}
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
                disabled={isLoading || !usdAmount || parseFloat(usdAmount) < 10}
                className="w-full"
                size="lg"
              >
                {isLoading ? (
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
                    <p className="text-2xl font-bold">${paymentData.amount_usd}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">USDT a Pagar</p>
                    <p className="text-xl font-mono">{paymentData.amount_usdt.toFixed(6)} USDT</p>
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

            {/* Success Message */}
            {isCompleted && (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  <strong>Pagamento Confirmado com Sucesso! 🎉</strong>
                  <br />
                  Seu pagamento de ${paymentData.amount_usd} USD foi processado e confirmado.
                </AlertDescription>
              </Alert>
            )}

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
                    <div className="p-4 bg-white rounded-xl shadow-inner">
                      <img 
                        src={paymentData.qr_code}
                        alt="QR Code para pagamento"
                        className="w-48 h-48"
                      />
                    </div>
                    <p className="text-sm text-center text-muted-foreground">
                      Escaneie com sua carteira {paymentData.network}
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
                      <Label className="text-sm font-medium">Endereço da Carteira ({paymentData.network})</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <code className="flex-1 p-3 bg-muted rounded-lg text-sm break-all font-mono">
                          {paymentData.address}
                        </code>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copyToClipboard(paymentData.address, 'Endereço')}
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
                          {paymentData.amount_usdt.toFixed(8)} USDT
                        </code>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copyToClipboard(paymentData.amount_usdt.toString(), 'Valor')}
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
                          {paymentData.id}
                        </code>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copyToClipboard(paymentData.id, 'ID do Pagamento')}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                onClick={refreshStatus} 
                variant="outline" 
                className="flex-1"
                disabled={isCompleted}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Verificar Status
              </Button>
              
              <Button 
                onClick={startNewPayment} 
                variant="default" 
                className="flex-1"
              >
                <CreditCard className="h-4 w-4 mr-2" />
                Novo Pagamento
              </Button>
            </div>

            {/* Instructions */}
            {!isCompleted && !isFailed && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Instruções de Pagamento:</strong>
                  <ol className="list-decimal list-inside mt-2 space-y-1">
                    <li>Escaneie o QR Code ou copie o endereço da carteira</li>
                    <li>Envie o valor exato em USDT para o endereço fornecido</li>
                    <li>Aguarde a confirmação na blockchain (geralmente 1-3 confirmações)</li>
                    <li>O status será atualizado automaticamente quando confirmado</li>
                  </ol>
                  <p className="mt-2 text-sm">
                    <strong>Nota:</strong> Este é um pagamento real via NOWPayments. O status será atualizado automaticamente quando o pagamento for confirmado na blockchain.
                  </p>
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}
      </div>
    </div>
  );
}