import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { USDTPaymentService, PaymentResponse } from '@/services/usdtPaymentService';
import { 
  CreditCard, 
  Shield, 
  Info,
  DollarSign,
  FileText,
  Loader2
} from 'lucide-react';

interface USDTPaymentFormProps {
  onPaymentCreated: (data: PaymentResponse & { order_description?: string; price_amount?: number }) => void;
}

const USDT_NETWORKS = [
  { value: 'usdttrc20', label: 'USDT TRC-20', network: 'Tron', fee: 'Baixa' },
  { value: 'usdterc20', label: 'USDT ERC-20', network: 'Ethereum', fee: 'Alta' },
  { value: 'usdtbsc', label: 'USDT BSC', network: 'Binance Smart Chain', fee: 'Média' }
];

export function USDTPaymentForm({ onPaymentCreated }: USDTPaymentFormProps) {
  const [amount, setAmount] = useState('');
  const [selectedNetwork, setSelectedNetwork] = useState('usdttrc20');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const selectedNetworkInfo = USDT_NETWORKS.find(n => n.value === selectedNetwork);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || parseFloat(amount) <= 0) {
      toast({
        title: "Erro",
        description: "Por favor, insira um valor válido",
        variant: "destructive",
      });
      return;
    }

    if (parseFloat(amount) < 10) {
      toast({
        title: "Erro",
        description: "Valor mínimo é $10.00",
        variant: "destructive",
      });
      return;
    }

    if (parseFloat(amount) > 10000) {
      toast({
        title: "Erro",
        description: "Valor máximo é $10,000.00",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const orderDescription = description || `Depósito USDT via ${selectedNetworkInfo?.network}`;
      
      const response = await USDTPaymentService.createPayment({
        price_amount: parseFloat(amount),
        price_currency: 'usd',
        pay_currency: selectedNetwork,
        order_id: `order_${Date.now()}`,
        order_description: orderDescription,
        ipn_callback_url: `${window.location.origin}/api/nowpayments-webhook`,
        success_url: `${window.location.origin}/usdt-checkout?success=true`,
        cancel_url: `${window.location.origin}/usdt-checkout?cancel=true`
      });

      toast({
        title: "Sucesso",
        description: "Pagamento criado com sucesso!",
      });

      onPaymentCreated({
        ...response,
        order_description: orderDescription,
        price_amount: parseFloat(amount)
      });
    } catch (error) {
      console.error('Erro ao criar pagamento:', error);
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Não foi possível criar o pagamento",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="animate-fade-in-scale">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-primary" />
          Criar Pagamento USDT
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert>
          <Shield className="h-4 w-4" />
          <AlertDescription>
            Pagamentos processados via NOWPayments com validação HMAC para máxima segurança
          </AlertDescription>
        </Alert>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Valor */}
          <div className="space-y-2">
            <Label htmlFor="amount" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Valor em USD
            </Label>
            <Input
              id="amount"
              type="number"
              placeholder="100.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="10"
              max="10000"
              step="0.01"
              className="text-lg"
              disabled={loading}
            />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Mínimo: $10.00</span>
              <span>Máximo: $10,000.00</span>
            </div>
          </div>

          {/* Tipo USDT */}
          <div className="space-y-2">
            <Label htmlFor="network">Tipo de USDT</Label>
            <Select value={selectedNetwork} onValueChange={setSelectedNetwork} disabled={loading}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo de USDT" />
              </SelectTrigger>
              <SelectContent>
                {USDT_NETWORKS.map(network => (
                  <SelectItem key={network.value} value={network.value}>
                    <div className="flex flex-col">
                      <span className="font-medium">{network.label}</span>
                      <span className="text-sm text-muted-foreground">
                        {network.network} • Taxa: {network.fee}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Network Info */}
          {selectedNetworkInfo && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <strong>{selectedNetworkInfo.label}</strong> - Rede {selectedNetworkInfo.network}
                <br />
                Taxa de transação: {selectedNetworkInfo.fee}
              </AlertDescription>
            </Alert>
          )}

          {/* Descrição do Pedido */}
          <div className="space-y-2">
            <Label htmlFor="description" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Descrição do Pedido (Opcional)
            </Label>
            <Textarea
              id="description"
              placeholder="Ex: Depósito para conta trading..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              maxLength={200}
              disabled={loading}
            />
            <div className="text-right text-sm text-muted-foreground">
              {description.length}/200
            </div>
          </div>

          {/* Resumo */}
          {amount && parseFloat(amount) >= 10 && (
            <Card className="bg-muted/50">
              <CardContent className="p-4">
                <h3 className="font-medium mb-2">Resumo do Pagamento</h3>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Valor:</span>
                    <span className="font-medium">${parseFloat(amount).toFixed(2)} USD</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tipo:</span>
                    <span className="font-medium">{selectedNetworkInfo?.label}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Rede:</span>
                    <span>{selectedNetworkInfo?.network}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Botão Submit */}
          <Button 
            type="submit" 
            className="w-full" 
            size="lg"
            disabled={loading || !amount || parseFloat(amount) < 10}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Criando Pagamento...
              </>
            ) : (
              <>
                <CreditCard className="h-4 w-4 mr-2" />
                Pagar com USDT
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}