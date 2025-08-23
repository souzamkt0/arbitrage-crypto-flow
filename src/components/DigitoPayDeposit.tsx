import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { Copy, QrCode, DollarSign, Timer, CheckCircle2, AlertCircle } from 'lucide-react';
import { useCurrency } from '@/hooks/useCurrency';
import { supabase } from '@/integrations/supabase/client';
import { QRCodeDisplay } from '@/components/QRCodeDisplay';
import { DepositTimer } from '@/components/DepositTimer';
import { PixCodeDisplay } from '@/components/PixCodeDisplay';

interface DigitoPayDepositProps {
  onSuccess?: () => void;
}

export const DigitoPayDeposit: React.FC<DigitoPayDepositProps> = ({
  onSuccess
}) => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const { convertUSDToBRL, formatBRL, formatUSD, exchangeRate } = useCurrency();
  
  const [amount, setAmount] = useState('');
  const [cpf, setCpf] = useState('');
  const [loading, setLoading] = useState(false);
  const [depositData, setDepositData] = useState<{
    trxId: string;
    pixCode: string;
    qrCodeBase64: string;
    usdAmount: number;
    brlAmount: number;
    expiresAt: number;
  } | null>(null);

  // Auto verificação de status
  useEffect(() => {
    if (!depositData?.trxId) return;

    const interval = setInterval(async () => {
      try {
        const { data: transaction } = await supabase
          .from('digitopay_transactions')
          .select('status, amount_brl')
          .eq('trx_id', depositData.trxId)
          .maybeSingle();

        if (transaction && (transaction.status === 'completed' || transaction.status === 'paid')) {
          toast({
            title: "🎉 DEPÓSITO CONFIRMADO!",
            description: `Pagamento de ${formatBRL(transaction.amount_brl)} confirmado com sucesso!`,
            duration: 10000,
          });

          setDepositData(null);
          clearInterval(interval);
          if (onSuccess) onSuccess();
        }
      } catch (error) {
        console.log('Verificação automática:', error);
      }
    }, 5000); // Verifica a cada 5 segundos

    return () => clearInterval(interval);
  }, [depositData?.trxId]);

  const handleCreateDeposit = async () => {
    if (!amount || !cpf) {
      toast({
        title: 'Dados obrigatórios',
        description: 'Preencha o valor e CPF',
        variant: 'destructive'
      });
      return;
    }

    const usdAmount = parseFloat(amount);
    
    if (usdAmount < 1) {
      toast({
        title: 'Valor mínimo',
        description: 'O valor mínimo é $1.00 USD',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);

    try {
      const brlResult = await convertUSDToBRL(usdAmount);

      const { data: result, error } = await supabase.functions.invoke('digitopay-deposit', {
        body: {
          amount: usdAmount,
          cpf: cpf,
          name: profile?.display_name || 'Usuário',
          callbackUrl: 'https://cbwpghrkfvczjqzefvix.supabase.co/functions/v1/digitopay-deposit-webhook',
          userId: user?.id
        }
      });

      if (error) {
        throw new Error(error.message || 'Erro ao criar depósito');
      }

      const expiresAt = Date.now() + (15 * 60 * 1000); // 15 minutos

      setDepositData({
        trxId: result.id,
        pixCode: result.pixCopiaECola || '',
        qrCodeBase64: result.qrCodeBase64 || '',
        usdAmount: usdAmount,
        brlAmount: brlResult.brlAmount,
        expiresAt
      });

      toast({
        title: '✅ PIX Gerado com Sucesso!',
        description: 'Escaneie o QR Code ou copie o código PIX para pagamento',
        duration: 8000,
      });

    } catch (error) {
      toast({
        title: 'Erro ao gerar PIX',
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExpired = () => {
    setDepositData(null);
    toast({
      title: "PIX Expirado",
      description: "Gere um novo código PIX para continuar",
      variant: "destructive"
    });
  };

  const handleNewDeposit = () => {
    setDepositData(null);
    setAmount('');
    setCpf('');
  };

  return (
    <div className="space-y-6">
      {!depositData ? (
        <>
          {/* Formulário de Depósito */}
          <div className="bg-gradient-to-br from-card to-muted/5 rounded-xl p-6 border border-border">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-3 h-3 bg-success rounded-full animate-pulse"></div>
              <h3 className="text-lg font-semibold text-foreground">Formulário de Depósito</h3>
            </div>
            
            <div className="grid gap-6">
              <div className="space-y-3">
                <Label htmlFor="amount" className="text-foreground font-medium flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-success" />
                  Valor em USD
                </Label>
                <div className="relative">
                  <Input
                    id="amount"
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="bg-background border-border text-foreground text-lg font-medium pl-12 h-12"
                    placeholder="0.00"
                    min="1"
                    step="0.01"
                  />
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-success font-bold">
                    $
                  </div>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Mínimo: $1.00 USD</span>
                  <span className="text-success">✓ Confirmação instantânea</span>
                </div>
              </div>
              
              <div className="space-y-3">
                <Label htmlFor="cpf" className="text-foreground font-medium flex items-center gap-2">
                  <div className="w-4 h-4 border border-foreground rounded flex items-center justify-center">
                    <div className="w-2 h-2 bg-foreground rounded-sm"></div>
                  </div>
                  CPF do Pagador
                </Label>
                <Input
                  id="cpf"
                  value={cpf}
                  onChange={(e) => setCpf(e.target.value)}
                  className="bg-background border-border text-foreground text-lg font-medium h-12"
                  placeholder="000.000.000-00"
                />
                <p className="text-xs text-muted-foreground">Obrigatório para transações PIX</p>
              </div>
            </div>
          </div>

          {/* Calculadora */}
          {amount && (
            <div className="bg-gradient-to-br from-success/10 to-trading-green/10 rounded-xl p-6 border border-success/20">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-success to-trading-green rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">₮</span>
                </div>
                <h4 className="text-success font-bold text-lg">Calculadora em Tempo Real</h4>
                <div className="ml-auto px-3 py-1 bg-success/20 rounded-full text-success text-xs font-medium">
                  TEMPO REAL
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-background/60 rounded-lg p-4 border border-border">
                  <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                    <div className="w-2 h-2 bg-destructive rounded-full"></div>
                    Você Paga (PIX)
                  </div>
                  <div className="text-2xl font-bold text-foreground mb-1">
                    {formatBRL(parseFloat(amount) * (exchangeRate || 5.5))}
                  </div>
                  <div className="text-xs text-muted-foreground">Real Brasileiro</div>
                </div>
                
                <div className="bg-background/60 rounded-lg p-4 border border-border relative">
                  <div className="hidden sm:block absolute -top-2 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-binance-yellow rounded-full">
                    <div className="text-xs text-binance-black font-bold">→</div>
                  </div>
                  <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                    <div className="w-2 h-2 bg-binance-yellow rounded-full"></div>
                    Taxa de Câmbio
                  </div>
                  <div className="text-lg font-bold text-binance-yellow mb-1">
                    {(exchangeRate || 5.5).toFixed(2)}
                  </div>
                  <div className="text-xs text-muted-foreground">BRL/USD</div>
                </div>
                
                <div className="bg-background/60 rounded-lg p-4 border border-border">
                  <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                    <div className="w-2 h-2 bg-success rounded-full"></div>
                    Você Recebe
                  </div>
                  <div className="text-2xl font-bold text-success mb-1">
                    ${parseFloat(amount).toFixed(2)}
                  </div>
                  <div className="text-xs text-muted-foreground">Saldo Trading</div>
                </div>
              </div>
            </div>
          )}

          {/* Botão de Gerar PIX */}
          <Button
            onClick={handleCreateDeposit}
            disabled={loading || !amount || !cpf}
            className="w-full h-14 bg-gradient-to-r from-success to-trading-green hover:from-success/90 hover:to-trading-green/90 text-white text-lg font-bold shadow-lg"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Gerando PIX...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <QrCode className="h-5 w-5" />
                Gerar PIX Instantâneo
              </div>
            )}
          </Button>
        </>
      ) : (
        <>
          {/* PIX Gerado */}
          <Card className="bg-gradient-to-br from-success/5 to-trading-green/5 border border-success/20">
            <CardHeader className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <CheckCircle2 className="h-6 w-6 text-success" />
                <CardTitle className="text-success">PIX Gerado com Sucesso!</CardTitle>
              </div>
              <CardDescription>
                Escaneie o QR Code ou copie o código PIX para efetuar o pagamento
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Timer */}
              <DepositTimer 
                expiresAt={depositData.expiresAt}
                onExpired={handleExpired}
              />

              {/* Informações do Depósito */}
              <div className="bg-background rounded-lg p-4 border border-border">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-sm text-muted-foreground">Valor USD</div>
                    <div className="text-lg font-bold text-success">
                      ${depositData.usdAmount.toFixed(2)}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Valor PIX</div>
                    <div className="text-lg font-bold text-foreground">
                      {formatBRL(depositData.brlAmount)}
                    </div>
                  </div>
                </div>
              </div>

              {/* QR Code */}
              <QRCodeDisplay 
                qrCodeBase64={depositData.qrCodeBase64}
                amount={formatBRL(depositData.brlAmount)}
              />

              {/* Código PIX */}
              <PixCodeDisplay pixCode={depositData.pixCode} />

              {/* Status */}
              <div className="bg-warning/10 border border-warning/20 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <Timer className="h-5 w-5 text-warning" />
                  <div>
                    <div className="font-medium text-warning">Aguardando Pagamento</div>
                    <div className="text-sm text-muted-foreground">
                      Verificaremos automaticamente quando o pagamento for confirmado
                    </div>
                  </div>
                </div>
              </div>

              {/* Botão Novo Depósito */}
              <Button
                onClick={handleNewDeposit}
                variant="outline"
                className="w-full border-border hover:bg-accent"
              >
                Gerar Novo PIX
              </Button>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};