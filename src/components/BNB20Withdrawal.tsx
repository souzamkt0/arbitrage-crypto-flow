import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { BNB20Service } from '@/services/bnb20Service';
import { Loader2, Wallet, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface BNB20WithdrawalProps {
  onSuccess?: () => void;
}

export const BNB20Withdrawal: React.FC<BNB20WithdrawalProps> = ({ onSuccess }) => {
  const { user } = useAuth();
  const [amount, setAmount] = useState<string>('');
  const [bnbAddress, setBnbAddress] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [userBalance, setUserBalance] = useState<number>(0);

  // Buscar saldo do usuário
  React.useEffect(() => {
    const fetchBalance = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('balance')
          .eq('user_id', user.id)
          .single();
        
        if (!error && data) {
          setUserBalance(data.balance || 0);
        }
      } catch (error) {
        console.error('Erro ao buscar saldo:', error);
      }
    };

    fetchBalance();
  }, [user]);

  const handleCreateWithdrawal = async () => {
    const numAmount = parseFloat(amount);
    
    if (!numAmount || numAmount <= 0) {
      toast.error('Por favor, insira um valor válido');
      return;
    }

    if (numAmount < 20) {
      toast.error('Valor mínimo para saque é $20 USD');
      return;
    }

    if (numAmount > userBalance) {
      toast.error('Saldo insuficiente');
      return;
    }

    if (!bnbAddress.trim()) {
      toast.error('Por favor, insira o endereço BNB');
      return;
    }

    if (!BNB20Service.validateBNBAddress(bnbAddress)) {
      toast.error('Endereço BNB inválido');
      return;
    }

    setIsLoading(true);
    
    try {
      const result = await BNB20Service.createWithdrawal(numAmount, bnbAddress.trim());
      
      toast.success('Solicitação de saque criada com sucesso!');
      toast.info('Aguarde a aprovação do administrador');
      
      // Limpar formulário
      setAmount('');
      setBnbAddress('');
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('❌ Erro ao criar saque:', error);
      toast.error(error instanceof Error ? error.message : 'Erro ao criar saque');
    } finally {
      setIsLoading(false);
    }
  };

  const validateAddress = (address: string) => {
    if (!address) return null;
    
    if (BNB20Service.validateBNBAddress(address)) {
      return 'valid';
    } else {
      return 'invalid';
    }
  };

  const addressValidation = validateAddress(bnbAddress);

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="h-5 w-5" />
          Saque BNB20
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Saques BNB20 requerem aprovação manual do administrador. 
            Tempo de processamento: 1-24 horas úteis.
          </AlertDescription>
        </Alert>

        <div className="p-3 bg-muted rounded-lg">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Saldo Disponível:</span>
            <span className="font-medium">{BNB20Service.formatUSD(userBalance)}</span>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="amount">Valor (USD)</Label>
          <Input
            id="amount"
            type="number"
            placeholder="Ex: 100"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            min="20"
            max={userBalance}
            step="0.01"
          />
          <p className="text-xs text-muted-foreground">
            Mínimo: $20 USD • Máximo: {BNB20Service.formatUSD(userBalance)}
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="bnbAddress">Endereço BNB (BSC)</Label>
          <Input
            id="bnbAddress"
            type="text"
            placeholder="0x..."
            value={bnbAddress}
            onChange={(e) => setBnbAddress(e.target.value)}
            className={
              addressValidation === 'valid' 
                ? 'border-green-500 focus:border-green-500' 
                : addressValidation === 'invalid' 
                  ? 'border-red-500 focus:border-red-500' 
                  : ''
            }
          />
          {addressValidation === 'valid' && (
            <p className="text-xs text-green-600">✓ Endereço válido</p>
          )}
          {addressValidation === 'invalid' && (
            <p className="text-xs text-red-600">✗ Endereço inválido</p>
          )}
          <p className="text-xs text-muted-foreground">
            Use apenas endereços da rede BSC (Binance Smart Chain)
          </p>
        </div>

        <Button 
          onClick={handleCreateWithdrawal}
          disabled={
            isLoading || 
            !amount || 
            !bnbAddress || 
            addressValidation !== 'valid' ||
            parseFloat(amount) > userBalance ||
            parseFloat(amount) < 20
          }
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Criando Solicitação...
            </>
          ) : (
            'Solicitar Saque BNB20'
          )}
        </Button>

        <div className="text-xs text-muted-foreground space-y-1">
          <p>• Taxa de rede: Incluída no valor convertido</p>
          <p>• Aprovação: Manual pelo administrador</p>
          <p>• Tempo: 1-24 horas úteis</p>
          <p>• Rede: BSC (Binance Smart Chain)</p>
        </div>
      </CardContent>
    </Card>
  );
};