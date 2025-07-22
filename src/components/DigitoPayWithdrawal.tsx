import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { DigitoPayService } from '@/services/digitopayService';
import { useAuth } from '@/hooks/useAuth';
import { Wallet, ArrowUpRight } from 'lucide-react';

interface DigitoPayWithdrawalProps {
  onSuccess?: () => void;
}

export const DigitoPayWithdrawal: React.FC<DigitoPayWithdrawalProps> = ({ onSuccess }) => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [amount, setAmount] = useState('');
  const [pixKey, setPixKey] = useState('');
  const [pixKeyType, setPixKeyType] = useState('');
  const [cpf, setCpf] = useState('');
  const [loading, setLoading] = useState(false);

  // Função para formatar CPF
  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  // Função para criar saque
  const handleCreateWithdrawal = async () => {
    if (!user || !profile) {
      toast({
        title: 'Erro',
        description: 'Usuário não autenticado',
        variant: 'destructive',
      });
      return;
    }

    if (!amount || !pixKey || !pixKeyType || !cpf) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Preencha todos os campos',
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

    // Verificar se o usuário tem saldo suficiente
    const currentBalance = profile.balance || 0;
    if (amountValue > currentBalance) {
      toast({
        title: 'Saldo insuficiente',
        description: `Seu saldo atual é R$ ${currentBalance.toFixed(2)}`,
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      // URL de callback para webhook
      const callbackUrl = `${window.location.origin}/api/digitopay/webhook/withdrawal`;

      // Criar saque no DigitoPay
      const result = await DigitoPayService.createWithdrawal(
        amountValue,
        cpf,
        `${profile.first_name || ''} ${profile.last_name || ''}`.trim(),
        pixKey,
        pixKeyType,
        callbackUrl
      );

      if (result.success && result.id) {
        // Salvar transação no banco
        const saveResult = await DigitoPayService.saveTransaction(
          user.id,
          result.id,
          'withdrawal',
          amountValue,
          amountValue, // Valor em BRL
          undefined,
          undefined,
          pixKey,
          pixKeyType,
          `${profile.first_name || ''} ${profile.last_name || ''}`.trim(),
          cpf,
          result
        );

        if (saveResult.success) {
          toast({
            title: 'Saque solicitado!',
            description: 'Aguarde a confirmação do pagamento',
          });

          // Limpar formulário
          setAmount('');
          setPixKey('');
          setPixKeyType('');
          setCpf('');

          onSuccess?.();
        } else {
          throw new Error('Erro ao salvar transação');
        }
      } else {
        throw new Error(result.mensagem || 'Erro ao criar saque');
      }
    } catch (error) {
      console.error('Erro ao criar saque:', error);
      toast({
        title: 'Erro',
        description: error instanceof Error ? error.message : 'Erro interno',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ArrowUpRight className="h-5 w-5" />
          Saque PIX
        </CardTitle>
        <CardDescription>
          Solicite um saque via PIX para sua conta bancária
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">


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
          {profile && (
            <p className="text-xs text-muted-foreground">
              Saldo disponível: R$ {(profile.balance || 0).toFixed(2)}
            </p>
          )}
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

        <div className="space-y-2">
          <Label htmlFor="pixKeyType">Tipo de Chave PIX</Label>
          <Select value={pixKeyType} onValueChange={setPixKeyType}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="CPF">CPF</SelectItem>
              <SelectItem value="CNPJ">CNPJ</SelectItem>
              <SelectItem value="EMAIL">E-mail</SelectItem>
              <SelectItem value="PHONE">Telefone</SelectItem>
              <SelectItem value="EVP">Chave Aleatória</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="pixKey">Chave PIX</Label>
          <Input
            id="pixKey"
            placeholder={
              pixKeyType === 'CPF' ? '000.000.000-00' :
              pixKeyType === 'CNPJ' ? '00.000.000/0000-00' :
              pixKeyType === 'EMAIL' ? 'seu@email.com' :
              pixKeyType === 'PHONE' ? '(11) 99999-9999' :
              pixKeyType === 'EVP' ? 'Chave aleatória' :
              'Digite sua chave PIX'
            }
            value={pixKey}
            onChange={(e) => setPixKey(e.target.value)}
          />
        </div>

        <Button
          onClick={handleCreateWithdrawal}
          disabled={loading || !amount || !pixKey || !pixKeyType || !cpf}
          className="w-full"
        >
          {loading ? 'Solicitando saque...' : 'Solicitar Saque'}
        </Button>

        <div className="text-xs text-muted-foreground space-y-1">
          <p>• Valor mínimo: R$ 10,00</p>
          <p>• Processamento: 1-2 dias úteis</p>
          <p>• Taxa: Gratuita</p>
        </div>
      </CardContent>
    </Card>
  );
}; 