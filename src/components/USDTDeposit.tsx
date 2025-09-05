import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { 
  QrCode, 
  Copy, 
  Loader2, 
  Wallet, 
  Clock, 
  CheckCircle,
  AlertTriangle,
  ExternalLink,
  DollarSign,
  Shield,
  Zap
} from "lucide-react";

interface USDTDepositProps {
  onSuccess?: () => void;
}

interface PaymentData {
  payment_id: string;
  pay_address: string;
  pay_amount: number;
  pay_currency: string;
  price_amount: number;
  price_currency: string;
  payment_status: string;
  order_id: string;
  order_description: string;
  expires_at: string;
  qr_code_base64?: string;
}

const USDT_NETWORKS = [
  { 
    value: 'usdttrc20', 
    label: 'USDT TRC-20', 
    network: 'Tron', 
    fee: 'Baixa (~$1)',
    icon: '🔥',
    recommended: true
  },
  { 
    value: 'usdterc20', 
    label: 'USDT ERC-20', 
    network: 'Ethereum', 
    fee: 'Alta (~$15-50)',
    icon: '⚡',
    recommended: false
  },
  { 
    value: 'usdtbep20', 
    label: 'USDT BEP-20', 
    network: 'BSC', 
    fee: 'Baixa (~$0.5)',
    icon: '🚀',
    recommended: false
  }
];

export const USDTDeposit: React.FC<USDTDepositProps> = ({ onSuccess }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [amount, setAmount] = useState('');
  const [selectedNetwork, setSelectedNetwork] = useState('usdttrc20');
  const [loading, setLoading] = useState(false);
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);
  const [checkingStatus, setCheckingStatus] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);

  const selectedNetworkInfo = USDT_NETWORKS.find(n => n.value === selectedNetwork);

  // Countdown timer
  useEffect(() => {
    if (paymentData?.expires_at && timeRemaining > 0) {
      const timer = setInterval(() => {
        const now = new Date().getTime();
        const expiry = new Date(paymentData.expires_at).getTime();
        const remaining = Math.max(0, expiry - now);
        setTimeRemaining(remaining);
        
        if (remaining === 0) {
          toast({
            title: "⏰ Tempo Expirado",
            description: "O pagamento expirou. Crie um novo pagamento.",
            variant: "destructive"
          });
        }
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [paymentData, timeRemaining, toast]);

  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleCreatePayment = async () => {
    if (!user) {
      toast({
        title: "Login necessário",
        description: "Você precisa fazer login para realizar depósitos",
        variant: "destructive"
      });
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      toast({
        title: "Valor inválido",
        description: "Digite um valor válido em USD",
        variant: "destructive"
      });
      return;
    }

    if (parseFloat(amount) < 10) {
      toast({
        title: "Valor mínimo",
        description: "O valor mínimo para depósito é $10.00",
        variant: "destructive"
      });
      return;
    }

    if (parseFloat(amount) > 10000) {
      toast({
        title: "Valor máximo",
        description: "O valor máximo para depósito é $10,000.00",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('nowpayments-create-payment', {
        body: {
          price_amount: parseFloat(amount),
          price_currency: 'usd',
          pay_currency: selectedNetwork,
          order_id: `usdt_${Date.now()}`,
          order_description: `Depósito USDT via ${selectedNetworkInfo?.network} - $${amount}`,
          ipn_callback_url: `${window.location.origin}/api/nowpayments-webhook`,
          success_url: `${window.location.origin}/deposit?success=true`,
          cancel_url: `${window.location.origin}/deposit?cancelled=true`
        }
      });

      if (error) {
        console.error('Edge Function Error:', error);
        throw new Error(error.message || 'Erro na função');
      }

      if (data && data.success && data.pay_address) {
        setPaymentData(data);
        
        // Set initial countdown
        if (data.expires_at) {
          const now = new Date().getTime();
          const expiry = new Date(data.expires_at).getTime();
          setTimeRemaining(Math.max(0, expiry - now));
        }

        toast({
          title: "🎉 Pagamento USDT Criado!",
          description: `Envie ${data.pay_amount.toFixed(6)} ${data.pay_currency.toUpperCase()} para o endereço gerado`,
          duration: 8000
        });
      } else {
        throw new Error(data?.error || 'Dados de pagamento inválidos');
      }
    } catch (error: any) {
      console.error('Error creating USDT payment:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao criar pagamento. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const checkPaymentStatus = async () => {
    if (!paymentData?.payment_id) return;

    setCheckingStatus(true);
    try {
      const { data, error } = await supabase.functions.invoke('nowpayments-status', {
        body: {
          payment_id: paymentData.payment_id
        }
      });

      if (error) {
        throw error;
      }

      if (data && data.success) {
        const status = data.payment_status;
        
        if (status === 'finished' || status === 'confirmed') {
          toast({
            title: "✅ Pagamento Confirmado!",
            description: "Seu depósito foi processado com sucesso",
            duration: 8000
          });
          
          if (onSuccess) {
            onSuccess();
          }
          
          setPaymentData(null);
        } else if (status === 'failed' || status === 'expired') {
          toast({
            title: "❌ Pagamento Falhou",
            description: "O pagamento falhou ou expirou. Crie um novo pagamento.",
            variant: "destructive"
          });
          setPaymentData(null);
        } else {
          toast({
            title: "⏳ Aguardando Confirmação",
            description: `Status: ${status}. Continue verificando.`,
          });
        }
      }
    } catch (error: any) {
      console.error('Error checking status:', error);
      toast({
        title: "Erro",
        description: "Erro ao verificar status",
        variant: "destructive"
      });
    } finally {
      setCheckingStatus(false);
    }
  };

  const copyAddress = () => {
    if (paymentData?.pay_address) {
      navigator.clipboard.writeText(paymentData.pay_address);
      toast({
        title: "✅ Copiado!",
        description: "Endereço USDT copiado para área de transferência"
      });
    }
  };

  const copyAmount = () => {
    if (paymentData?.pay_amount) {
      navigator.clipboard.writeText(paymentData.pay_amount.toString());
      toast({
        title: "✅ Copiado!",
        description: "Valor USDT copiado para área de transferência"
      });
    }
  };

  // Se há dados de pagamento, mostrar a tela de pagamento
  if (paymentData) {
    return (
      <Card className="w-full">
        <CardHeader className="border-b border-yellow-500/20">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-yellow-400">
              <Wallet className="h-5 w-5" />
              Pagamento USDT Gerado
            </CardTitle>
            {timeRemaining > 0 && (
              <Badge variant="outline" className="border-yellow-500/30 text-yellow-400">
                <Clock className="h-3 w-3 mr-1" />
                {formatTime(timeRemaining)}
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-6 p-6">
          <Alert className="border-yellow-500/30 bg-yellow-500/5">
            <Shield className="h-4 w-4" />
            <AlertDescription className="text-yellow-300">
              <strong>Instruções:</strong> Envie exatamente o valor indicado para o endereço abaixo. 
              O saldo será creditado automaticamente após confirmação na blockchain.
            </AlertDescription>
          </Alert>

          {/* Network Info */}
          <div className="flex items-center gap-3 p-4 bg-zinc-900/50 rounded-lg border border-yellow-500/20">
            <div className="text-2xl">{selectedNetworkInfo?.icon}</div>
            <div>
              <div className="font-medium text-yellow-400">{selectedNetworkInfo?.label}</div>
              <div className="text-sm text-yellow-300/70">
                Rede: {selectedNetworkInfo?.network} • Taxa: {selectedNetworkInfo?.fee}
              </div>
            </div>
          </div>

          {/* Payment Details */}
          <div className="space-y-4">
            <div>
              <Label className="text-yellow-300">Valor a Enviar</Label>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex-1 p-3 bg-zinc-900/50 rounded-lg border border-yellow-500/20 font-mono text-yellow-400">
                  {paymentData.pay_amount.toFixed(6)} {paymentData.pay_currency.toUpperCase()}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyAmount}
                  className="border-yellow-500/30 hover:bg-yellow-500/10"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div>
              <Label className="text-yellow-300">Endereço de Destino</Label>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex-1 p-3 bg-zinc-900/50 rounded-lg border border-yellow-500/20 font-mono text-sm text-yellow-400 break-all">
                  {paymentData.pay_address}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyAddress}
                  className="border-yellow-500/30 hover:bg-yellow-500/10"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* QR Code */}
            {paymentData.qr_code_base64 && (
              <div className="text-center">
                <Label className="text-yellow-300">QR Code</Label>
                <div className="mt-2 inline-block p-4 bg-white rounded-lg">
                  <img
                    src={`data:image/png;base64,${paymentData.qr_code_base64}`}
                    alt="QR Code"
                    className="w-48 h-48 mx-auto"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setPaymentData(null)}
              className="flex-1 border-yellow-500/30 hover:bg-yellow-500/10"
            >
              Voltar
            </Button>
            <Button
              onClick={checkPaymentStatus}
              disabled={checkingStatus}
              className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-black"
            >
              {checkingStatus ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Verificando...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Verificar Status
                </>
              )}
            </Button>
          </div>

          <div className="text-xs text-yellow-300/70 space-y-1 text-center">
            <p>• Confirmações necessárias: 12 blocos (~10-20 minutos)</p>
            <p>• ID do Pagamento: {paymentData.payment_id}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Tela de criação de pagamento
  return (
    <Card className="w-full">
      <CardHeader className="border-b border-yellow-500/20">
        <CardTitle className="flex items-center gap-2 text-yellow-400">
          <DollarSign className="h-5 w-5" />
          Depósito USDT
        </CardTitle>
        <p className="text-sm text-yellow-300/70">
          Deposite usando USDT em diferentes redes blockchain
        </p>
      </CardHeader>

      <CardContent className="space-y-6 p-6">
        <Alert className="border-yellow-500/30 bg-yellow-500/5">
          <Zap className="h-4 w-4" />
          <AlertDescription className="text-yellow-300">
            <strong>Processamento Automático:</strong> Seu saldo será creditado automaticamente após confirmação na blockchain.
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          <div>
            <Label htmlFor="amount" className="text-yellow-300">Valor (USD)</Label>
            <Input
              id="amount"
              type="number"
              placeholder="Ex: 100"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="10"
              max="10000"
              step="0.01"
              className="mt-1 bg-zinc-900/50 border-yellow-500/20 focus:border-yellow-500/50 text-yellow-100"
            />
            <p className="text-xs text-yellow-300/70 mt-1">
              Mínimo: $10.00 • Máximo: $10,000.00
            </p>
          </div>

          <div>
            <Label className="text-yellow-300">Rede Blockchain</Label>
            <Select value={selectedNetwork} onValueChange={setSelectedNetwork}>
              <SelectTrigger className="mt-1 bg-zinc-900/50 border-yellow-500/20 focus:border-yellow-500/50 text-yellow-100">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-yellow-500/20">
                {USDT_NETWORKS.map((network) => (
                  <SelectItem key={network.value} value={network.value} className="text-yellow-100">
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{network.icon}</span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span>{network.label}</span>
                          {network.recommended && (
                            <Badge variant="secondary" className="text-xs bg-yellow-500/20 text-yellow-400">
                              Recomendado
                            </Badge>
                          )}
                        </div>
                        <div className="text-xs text-yellow-300/70">
                          {network.network} • Taxa: {network.fee}
                        </div>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button
          onClick={handleCreatePayment}
          disabled={loading || !amount}
          className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-medium"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Criando Pagamento...
            </>
          ) : (
            <>
              <Wallet className="h-4 w-4 mr-2" />
              Criar Pagamento USDT
            </>
          )}
        </Button>

        <div className="text-xs text-yellow-300/70 space-y-1">
          <p>• Pagamentos são processados automaticamente</p>
          <p>• Suporte 24/7 para questões de depósito</p>
          <p>• Todas as transações são criptograficamente seguras</p>
        </div>
      </CardContent>
    </Card>
  );
};
