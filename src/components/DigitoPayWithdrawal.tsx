import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { DigitoPayService } from '@/services/digitopayService';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { 
  Wallet, 
  ArrowUpRight, 
  DollarSign, 
  Zap, 
  Shield, 
  Clock, 
  TrendingUp,
  ArrowRightLeft,
  CheckCircle,
  AlertCircle 
} from 'lucide-react';

interface DigitoPayWithdrawalProps {
  onSuccess?: () => void;
  userBalance?: number;
  referralBalance?: number;
}

export const DigitoPayWithdrawal: React.FC<DigitoPayWithdrawalProps> = ({ onSuccess, userBalance = 0, referralBalance = 0 }) => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [amountUSD, setAmountUSD] = useState('');
  const [pixKey, setPixKey] = useState('');
  const [pixKeyType, setPixKeyType] = useState('');
  const [cpf, setCpf] = useState('');
  const [loading, setLoading] = useState(false);
  const [exchangeRate, setExchangeRate] = useState(5.25); // Taxa USD para BRL simulada
  const [amountBRL, setAmountBRL] = useState(0);
  const [fee, setFee] = useState(0);
  const [netAmountBRL, setNetAmountBRL] = useState(0);

  // Atualizar conversão quando o valor USD muda
  useEffect(() => {
    const usdValue = parseFloat(amountUSD) || 0;
    const brlValue = usdValue * exchangeRate;
    const feeValue = brlValue * 0.02; // Taxa de 2%
    const netValue = brlValue - feeValue;

    setAmountBRL(brlValue);
    setFee(feeValue);
    setNetAmountBRL(netValue);
  }, [amountUSD, exchangeRate]);

  // Simular flutuação da taxa de câmbio
  useEffect(() => {
    const interval = setInterval(() => {
      // Variação de ±0.05 na taxa
      const variation = (Math.random() - 0.5) * 0.1;
      setExchangeRate(prev => Math.max(5.0, Math.min(5.5, prev + variation)));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // Função para formatar CPF
  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  // Função para criar saque
  const handleCreateWithdrawal = async () => {
    if (!user || !profile) {
      toast({
        title: 'Erro de Autenticação',
        description: 'Usuário não autenticado',
        variant: 'destructive',
      });
      return;
    }

    if (!amountUSD || !pixKey || !pixKeyType || !cpf) {
      toast({
        title: 'Campos Obrigatórios',
        description: 'Preencha todos os campos para continuar',
        variant: 'destructive',
      });
      return;
    }

    const usdValue = parseFloat(amountUSD);
    if (usdValue < 10) {
      toast({
        title: 'Valor Mínimo Não Atingido',
        description: 'O valor mínimo para saque é $10.00 USD',
        variant: 'destructive',
      });
      return;
    }

    // Verificar se o usuário tem saldo suficiente em USD
    const currentBalanceUSD = userBalance + referralBalance;
    if (usdValue > currentBalanceUSD) {
      toast({
        title: 'Saldo Insuficiente',
        description: `Seu saldo atual é $${currentBalanceUSD.toFixed(2)} USD`,
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      console.log('Dados do saque:', {
        user_id: user.id,
        amount_usd: usdValue,
        amount_brl: amountBRL,
        type: 'pix',
        status: 'pending',
        holder_name: profile.display_name || profile.username || 'Usuário',
        cpf: cpf.replace(/\D/g, ''),
        pix_key_type: pixKeyType,
        pix_key: pixKey,
        fee: fee,
        net_amount: netAmountBRL,
        exchange_rate: exchangeRate
      });
      
      // Salvar saque na tabela withdrawals para aprovação do administrador
      const { data, error } = await supabase
        .from('withdrawals')
        .insert({
          user_id: user.id,
          amount_usd: usdValue,
          amount_brl: amountBRL,
          type: 'pix',
          status: 'pending',
          holder_name: profile.display_name || profile.username || 'Usuário',
          cpf: cpf.replace(/\D/g, ''),
          pix_key_type: pixKeyType.toUpperCase(),
          pix_key: pixKey,
          exchange_rate: exchangeRate
        })
        .select()
        .single();

      if (error) {
        console.error('Erro detalhado ao salvar saque:', error);
        throw new Error(`Erro ao salvar solicitação de saque: ${error.message}`);
      }

      // Atualizar saldo do usuário (debitar o valor em USD)
      const { error: balanceError } = await supabase
        .from('profiles')
        .update({ 
          balance: (profile.balance || 0) - usdValue 
        })
        .eq('user_id', user.id);

      if (balanceError) {
        console.error('Erro ao atualizar saldo:', balanceError);
        // Reverter a inserção do saque se não conseguir atualizar o saldo
        await supabase
          .from('withdrawals')
          .delete()
          .eq('id', data.id);
        throw new Error('Erro ao processar saque');
      }

      toast({
        title: '✅ Saque Solicitado com Sucesso!',
        description: `Solicitação de $${usdValue.toFixed(2)} USD (R$ ${amountBRL.toFixed(2)}) enviada para aprovação`,
      });

      // Limpar formulário
      setAmountUSD('');
      setPixKey('');
      setPixKeyType('');
      setCpf('');

      onSuccess?.();
    } catch (error) {
      console.error('Erro ao criar saque:', error);
      toast({
        title: 'Erro no Processamento',
        description: error instanceof Error ? error.message : 'Erro interno do sistema',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const totalBalanceUSD = userBalance + referralBalance;
  const isFormValid = amountUSD && pixKey && pixKeyType && cpf && parseFloat(amountUSD) >= 10 && parseFloat(amountUSD) <= totalBalanceUSD;

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Header com animação */}
      <div className="mb-6 text-center">
        <div className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30 px-6 py-3 rounded-xl backdrop-blur-sm animate-fade-in">
          <div className="p-2 bg-blue-500 rounded-lg animate-pulse">
            <ArrowUpRight className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-blue-400">PIX Withdrawal Terminal</h2>
            <p className="text-sm text-blue-300">Sistema de saque instantâneo</p>
          </div>
        </div>
      </div>

      <Card className="bg-gradient-to-br from-blue-500/5 to-cyan-500/5 border border-blue-500/20 backdrop-blur-sm animate-fade-in">
        <CardHeader className="border-b border-blue-500/20 bg-gradient-to-r from-blue-500/10 to-cyan-500/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg">
                <Wallet className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-blue-100 flex items-center gap-2">
                  Saque PIX
                  <div className="px-2 py-1 bg-blue-500/30 rounded-full text-xs font-medium text-blue-300">
                    USD → BRL
                  </div>
                </CardTitle>
                <CardDescription className="text-blue-300">
                  Conversão automática com taxa em tempo real
                </CardDescription>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-blue-400">Saldo Disponível</div>
              <div className="text-lg font-bold text-blue-100">
                ${totalBalanceUSD.toFixed(2)} USD
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          {/* Taxa de Câmbio em Tempo Real */}
          <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-lg p-4 animate-fade-in">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ArrowRightLeft className="h-4 w-4 text-blue-400 animate-pulse" />
                <span className="text-sm font-medium text-blue-300">Taxa de Câmbio</span>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-blue-100">
                  R$ {exchangeRate.toFixed(2)}
                </div>
                <div className="text-xs text-blue-400">por 1 USD</div>
              </div>
            </div>
          </div>

          {/* Valor USD */}
          <div className="space-y-3">
            <Label htmlFor="amountUSD" className="text-blue-300 font-medium">
              Valor em USD *
            </Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-3 h-4 w-4 text-blue-400" />
              <Input
                id="amountUSD"
                type="number"
                placeholder="0.00"
                value={amountUSD}
                onChange={(e) => setAmountUSD(e.target.value)}
                min="10"
                step="0.01"
                className="pl-10 bg-blue-950/20 border-blue-500/30 text-blue-100 placeholder:text-blue-400/50 focus:border-blue-400 focus:ring-blue-400/20"
              />
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-blue-400">Mínimo: $10.00 USD</span>
              <span className="text-blue-400">Máximo: ${totalBalanceUSD.toFixed(2)} USD</span>
            </div>
          </div>

          {/* Preview da Conversão */}
          {amountUSD && (
            <div className="bg-gradient-to-r from-green-500/10 to-blue-500/10 border border-green-500/20 rounded-lg p-4 animate-scale-in">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-green-300">Valor em BRL:</span>
                  <span className="font-bold text-green-100">R$ {amountBRL.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-red-300">Taxa (2%):</span>
                  <span className="font-bold text-red-100">- R$ {fee.toFixed(2)}</span>
                </div>
                <div className="h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent"></div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-blue-300">Valor Líquido:</span>
                  <span className="font-bold text-lg text-blue-100">R$ {netAmountBRL.toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}

          {/* CPF */}
          <div className="space-y-3">
            <Label htmlFor="cpf" className="text-blue-300 font-medium">
              CPF *
            </Label>
            <Input
              id="cpf"
              placeholder="000.000.000-00"
              value={cpf}
              onChange={(e) => setCpf(formatCPF(e.target.value))}
              maxLength={14}
              className="bg-blue-950/20 border-blue-500/30 text-blue-100 placeholder:text-blue-400/50 focus:border-blue-400 focus:ring-blue-400/20"
            />
          </div>

          {/* Tipo de Chave PIX */}
          <div className="space-y-3">
            <Label htmlFor="pixKeyType" className="text-blue-300 font-medium">
              Tipo de Chave PIX *
            </Label>
            <Select value={pixKeyType} onValueChange={setPixKeyType}>
              <SelectTrigger className="bg-blue-950/20 border-blue-500/30 text-blue-100 focus:border-blue-400 focus:ring-blue-400/20">
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent className="bg-blue-950 border-blue-500/30">
                <SelectItem value="CPF" className="text-blue-100 focus:bg-blue-500/20">CPF</SelectItem>
                <SelectItem value="CNPJ" className="text-blue-100 focus:bg-blue-500/20">CNPJ</SelectItem>
                <SelectItem value="EMAIL" className="text-blue-100 focus:bg-blue-500/20">E-mail</SelectItem>
                <SelectItem value="PHONE" className="text-blue-100 focus:bg-blue-500/20">Telefone</SelectItem>
                <SelectItem value="RANDOM" className="text-blue-100 focus:bg-blue-500/20">Chave Aleatória</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Chave PIX */}
          <div className="space-y-3">
            <Label htmlFor="pixKey" className="text-blue-300 font-medium">
              Chave PIX *
            </Label>
            <Input
              id="pixKey"
              placeholder={
                pixKeyType === 'CPF' ? '000.000.000-00' :
                pixKeyType === 'CNPJ' ? '00.000.000/0000-00' :
                pixKeyType === 'EMAIL' ? 'seu@email.com' :
                pixKeyType === 'PHONE' ? '(11) 99999-9999' :
                pixKeyType === 'RANDOM' ? 'Chave aleatória' :
                'Digite sua chave PIX'
              }
              value={pixKey}
              onChange={(e) => setPixKey(e.target.value)}
              className="bg-blue-950/20 border-blue-500/30 text-blue-100 placeholder:text-blue-400/50 focus:border-blue-400 focus:ring-blue-400/20"
            />
          </div>

          {/* Botão de Saque */}
          <Button
            onClick={handleCreateWithdrawal}
            disabled={loading || !isFormValid}
            className={`w-full py-3 text-base font-semibold transition-all duration-300 ${
              isFormValid 
                ? 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white shadow-lg hover:shadow-xl hover:shadow-blue-500/25 animate-pulse hover:animate-none' 
                : 'bg-blue-900/50 text-blue-400 cursor-not-allowed'
            }`}
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Processando Saque...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Solicitar Saque PIX
              </div>
            )}
          </Button>

          {/* Informações do Sistema */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 text-center">
              <Shield className="h-6 w-6 text-blue-400 mx-auto mb-2" />
              <div className="text-xs font-medium text-blue-300">Seguro</div>
              <div className="text-xs text-blue-400">Proteção total</div>
            </div>
            
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 text-center">
              <Clock className="h-6 w-6 text-green-400 mx-auto mb-2" />
              <div className="text-xs font-medium text-green-300">Rápido</div>
              <div className="text-xs text-green-400">2h úteis</div>
            </div>
            
            <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-3 text-center">
              <TrendingUp className="h-6 w-6 text-purple-400 mx-auto mb-2" />
              <div className="text-xs font-medium text-purple-300">Taxa</div>
              <div className="text-xs text-purple-400">Apenas 2%</div>
            </div>
          </div>

          {/* Informações Detalhadas */}
          <div className="bg-blue-500/5 border border-blue-500/20 rounded-lg p-4 space-y-2">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-blue-400 mt-0.5 flex-shrink-0" />
              <div className="space-y-1">
                <h4 className="font-semibold text-blue-300 text-sm">Informações Importantes:</h4>
                <ul className="text-xs text-blue-400 space-y-1">
                  <li>• Valor mínimo: $10.00 USD</li>
                  <li>• Taxa de conversão atualizada em tempo real</li>
                  <li>• Aprovação: Análise administrativa (1-2h)</li>
                  <li>• Processamento PIX: Até 2 horas úteis</li>
                  <li>• Taxa de serviço: 2% sobre o valor BRL</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};