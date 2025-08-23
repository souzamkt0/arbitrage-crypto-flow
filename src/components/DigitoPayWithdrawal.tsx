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
  AlertCircle,
  Users,
  Target,
  PiggyBank
} from 'lucide-react';

interface DigitoPayWithdrawalProps {
  onSuccess?: () => void;
  userBalance?: number;
  referralBalance?: number;
}

type WithdrawalType = 'residual' | 'referral' | 'profit' | null;

export const DigitoPayWithdrawal: React.FC<DigitoPayWithdrawalProps> = ({ onSuccess, userBalance = 0, referralBalance = 0 }) => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [selectedType, setSelectedType] = useState<WithdrawalType>(null);
  const [amountUSD, setAmountUSD] = useState('');
  const [pixKey, setPixKey] = useState('');
  const [pixKeyType, setPixKeyType] = useState('');
  const [cpf, setCpf] = useState('');
  const [loading, setLoading] = useState(false);
  const [exchangeRate, setExchangeRate] = useState(5.25);
  const [amountBRL, setAmountBRL] = useState(0);
  const [fee, setFee] = useState(0);
  const [netAmountBRL, setNetAmountBRL] = useState(0);
  const [residualBalance, setResidualBalance] = useState(0);
  const [profitBalance, setProfitBalance] = useState(0);
  const [canWithdraw, setCanWithdraw] = useState(true);
  const [lastWithdrawal, setLastWithdrawal] = useState<string | null>(null);

  // Carregar dados do usuário
  useEffect(() => {
    const loadUserData = async () => {
      if (!user) return;

      try {
        // Verificar último saque
        const { data: lastWithdrawalData } = await supabase
          .from('withdrawals')
          .select('created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (lastWithdrawalData) {
          const lastDate = new Date(lastWithdrawalData.created_at);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          lastDate.setHours(0, 0, 0, 0);
          
          if (lastDate.getTime() === today.getTime()) {
            setCanWithdraw(false);
            setLastWithdrawal(lastWithdrawalData.created_at);
          }
        }

        // Carregar saldo residual
        const { data: residualData } = await supabase
          .from('residual_earnings')
          .select('amount')
          .eq('user_id', user.id)
          .eq('status', 'active');

        const totalResidual = residualData?.reduce((sum, item) => sum + Number(item.amount), 0) || 0;
        setResidualBalance(totalResidual);

        // Simular saldo de lucros (seria calculado com base nos investimentos)
        setProfitBalance(userBalance * 0.1); // 10% do saldo principal como exemplo

      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      }
    };

    loadUserData();
  }, [user, userBalance]);

  // Atualizar conversão quando o valor USD muda
  useEffect(() => {
    const usdValue = parseFloat(amountUSD) || 0;
    const brlValue = usdValue * exchangeRate;
    const feeValue = brlValue * 0.02;
    const netValue = brlValue - feeValue;

    setAmountBRL(brlValue);
    setFee(feeValue);
    setNetAmountBRL(netValue);
  }, [amountUSD, exchangeRate]);

  // Simular flutuação da taxa de câmbio
  useEffect(() => {
    const interval = setInterval(() => {
      const variation = (Math.random() - 0.5) * 0.1;
      setExchangeRate(prev => Math.max(5.0, Math.min(5.5, prev + variation)));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  const getAvailableBalance = () => {
    switch (selectedType) {
      case 'residual':
        return residualBalance;
      case 'referral':
        return referralBalance;
      case 'profit':
        return profitBalance;
      default:
        return 0;
    }
  };

  const handleCreateWithdrawal = async () => {
    if (!user || !profile || !selectedType) return;

    if (!canWithdraw) {
      toast({
        title: 'Limite Diário Atingido',
        description: 'Você já realizou um saque hoje. Tente novamente amanhã.',
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

    const availableBalance = getAvailableBalance();
    if (usdValue > availableBalance) {
      toast({
        title: 'Saldo Insuficiente',
        description: `Saldo disponível para ${selectedType}: $${availableBalance.toFixed(2)} USD`,
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      // Salvar saque na tabela withdrawals
      const { data, error } = await supabase
        .from('withdrawals')
        .insert({
          user_id: user.id,
          amount_usd: usdValue,
          amount_brl: amountBRL,
          type: selectedType,
          status: 'pending',
          holder_name: profile.display_name || profile.username || 'Usuário',
          cpf: cpf.replace(/\D/g, ''),
          pix_key_type: pixKeyType.toUpperCase(),
          pix_key: pixKey,
          exchange_rate: exchangeRate
        })
        .select()
        .single();

      if (error) throw new Error(`Erro ao salvar solicitação de saque: ${error.message}`);

      // Atualizar saldo correspondente
      let updateData = {};
      if (selectedType === 'referral') {
        updateData = { referral_balance: (profile.referral_balance || 0) - usdValue };
      } else {
        // Para residual e profit, atualizar o saldo principal por enquanto
        updateData = { balance: (profile.balance || 0) - usdValue };
      }

      const { error: balanceError } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('user_id', user.id);

      if (balanceError) {
        await supabase.from('withdrawals').delete().eq('id', data.id);
        throw new Error('Erro ao processar saque');
      }

      // Marcar como não pode sacar mais hoje
      setCanWithdraw(false);

      toast({
        title: '✅ Saque Solicitado com Sucesso!',
        description: `Saque de ${getWithdrawalTypeLabel(selectedType)} de $${usdValue.toFixed(2)} USD enviado para aprovação`,
      });

      // Limpar formulário
      setSelectedType(null);
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

  const getWithdrawalTypeLabel = (type: WithdrawalType) => {
    switch (type) {
      case 'residual':
        return 'Saldo Residual';
      case 'referral':
        return 'Saldo de Indicação';
      case 'profit':
        return 'Saldo de Rentabilidade';
      default:
        return '';
    }
  };

  const getWithdrawalTypeIcon = (type: WithdrawalType) => {
    switch (type) {
      case 'residual':
        return PiggyBank;
      case 'referral':
        return Users;
      case 'profit':
        return Target;
      default:
        return Wallet;
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6 text-center">
        <div className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30 px-6 py-3 rounded-xl backdrop-blur-sm animate-fade-in">
          <div className="p-2 bg-blue-500 rounded-lg animate-pulse">
            <ArrowUpRight className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-blue-400">Sistema de Saque Especializado</h2>
            <p className="text-sm text-blue-300">Escolha o tipo de saque desejado</p>
          </div>
        </div>
      </div>

      {/* Aviso de limite diário */}
      {!canWithdraw && (
        <Card className="mb-6 bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-orange-400 flex-shrink-0" />
              <div>
                <p className="text-orange-300 font-medium">Limite Diário Atingido</p>
                <p className="text-orange-200 text-sm">
                  Você já realizou um saque hoje. Próximo saque disponível em 24 horas.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Seleção do Tipo de Saque */}
      {!selectedType && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Saque Residual */}
          <Card className="bg-gradient-to-br from-purple-500/5 to-indigo-500/5 border border-purple-500/20 hover:border-purple-400/40 transition-all duration-300 cursor-pointer group"
                onClick={() => !canWithdraw ? null : setSelectedType('residual')}>
            <CardContent className="p-6 text-center">
              <div className="p-4 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg mx-auto mb-4 w-fit group-hover:scale-110 transition-transform">
                <PiggyBank className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-lg font-bold text-purple-300 mb-2">Saldo Residual</h3>
              <p className="text-purple-200 text-sm mb-4">Ganhos acumulados do sistema</p>
              <div className="text-2xl font-bold text-purple-100">
                ${residualBalance.toFixed(2)}
              </div>
              <p className="text-purple-400 text-xs mt-2">USD disponível</p>
              {!canWithdraw && <div className="mt-3 text-xs text-orange-400 font-medium">Bloqueado por 24h</div>}
            </CardContent>
          </Card>

          {/* Saque de Indicação */}
          <Card className="bg-gradient-to-br from-green-500/5 to-emerald-500/5 border border-green-500/20 hover:border-green-400/40 transition-all duration-300 cursor-pointer group"
                onClick={() => !canWithdraw ? null : setSelectedType('referral')}>
            <CardContent className="p-6 text-center">
              <div className="p-4 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg mx-auto mb-4 w-fit group-hover:scale-110 transition-transform">
                <Users className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-lg font-bold text-green-300 mb-2">Saldo de Indicação</h3>
              <p className="text-green-200 text-sm mb-4">Comissões por referrals</p>
              <div className="text-2xl font-bold text-green-100">
                ${referralBalance.toFixed(2)}
              </div>
              <p className="text-green-400 text-xs mt-2">USD disponível</p>
              {!canWithdraw && <div className="mt-3 text-xs text-orange-400 font-medium">Bloqueado por 24h</div>}
            </CardContent>
          </Card>

          {/* Saque de Rentabilidade */}
          <Card className="bg-gradient-to-br from-blue-500/5 to-cyan-500/5 border border-blue-500/20 hover:border-blue-400/40 transition-all duration-300 cursor-pointer group"
                onClick={() => !canWithdraw ? null : setSelectedType('profit')}>
            <CardContent className="p-6 text-center">
              <div className="p-4 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg mx-auto mb-4 w-fit group-hover:scale-110 transition-transform">
                <Target className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-lg font-bold text-blue-300 mb-2">Saldo de Rentabilidade</h3>
              <p className="text-blue-200 text-sm mb-4">Lucros dos investimentos</p>
              <div className="text-2xl font-bold text-blue-100">
                ${profitBalance.toFixed(2)}
              </div>
              <p className="text-blue-400 text-xs mt-2">USD disponível</p>
              {!canWithdraw && <div className="mt-3 text-xs text-orange-400 font-medium">Bloqueado por 24h</div>}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Formulário de Saque */}
      {selectedType && canWithdraw && (
        <Card className="bg-gradient-to-br from-blue-500/5 to-cyan-500/5 border border-blue-500/20 backdrop-blur-sm animate-fade-in">
          <CardHeader className="border-b border-blue-500/20 bg-gradient-to-r from-blue-500/10 to-cyan-500/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg">
                  {React.createElement(getWithdrawalTypeIcon(selectedType), {
                    className: "h-5 w-5 text-white"
                  })}
                </div>
                <div>
                  <CardTitle className="text-blue-100">
                    Saque: {getWithdrawalTypeLabel(selectedType)}
                  </CardTitle>
                  <CardDescription className="text-blue-300">
                    Conversão automática USD → BRL
                  </CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setSelectedType(null)}
                  className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/20"
                >
                  Voltar
                </Button>
                <div className="text-right">
                  <div className="text-xs text-blue-400">Saldo Disponível</div>
                  <div className="text-lg font-bold text-blue-100">
                    ${getAvailableBalance().toFixed(2)} USD
                  </div>
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-6 space-y-6">
            {/* Taxa de Câmbio */}
            <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-lg p-4">
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
                  max={getAvailableBalance()}
                  step="0.01"
                  className="pl-10 bg-blue-950/20 border-blue-500/30 text-blue-100 placeholder:text-blue-400/50 focus:border-blue-400 focus:ring-blue-400/20"
                />
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-blue-400">Mínimo: $10.00 USD</span>
                <span className="text-blue-400">Máximo: ${getAvailableBalance().toFixed(2)} USD</span>
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
              disabled={loading || !amountUSD || !pixKey || !pixKeyType || !cpf || parseFloat(amountUSD) < 10 || parseFloat(amountUSD) > getAvailableBalance()}
              className="w-full py-3 text-base font-semibold bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white shadow-lg hover:shadow-xl hover:shadow-blue-500/25 transition-all duration-300"
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

            {/* Informações */}
            <div className="bg-blue-500/5 border border-blue-500/20 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-blue-400 mt-0.5 flex-shrink-0" />
                <div className="space-y-1">
                  <h4 className="font-semibold text-blue-300 text-sm">Informações Importantes:</h4>
                  <ul className="text-xs text-blue-400 space-y-1">
                    <li>• Valor mínimo: $10.00 USD</li>
                    <li>• Limite: 1 saque por dia</li>
                    <li>• Taxa: 2% sobre o valor BRL</li>
                    <li>• Processamento: 1-2 horas úteis</li>
                    <li>• Aprovação administrativa necessária</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};