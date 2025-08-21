import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { DigitoPayService } from '@/services/digitopayService';
import { useAuth } from '@/hooks/useAuth';
import { Copy, Download, QrCode, DollarSign, CheckCircle } from 'lucide-react';
import { CurrencyDisplay } from '@/components/CurrencyDisplay';
import { useCurrency } from '@/hooks/useCurrency';
import { supabase } from '@/integrations/supabase/client';

interface DigitoPayDepositProps {
  onSuccess?: () => void;
}

export const DigitoPayDeposit: React.FC<DigitoPayDepositProps> = ({
  onSuccess
}) => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const { convertBRLToUSD, formatBRL, formatUSD, convertUSDToBRL, exchangeRate } = useCurrency();
  
  const [amount, setAmount] = useState('');
  const [cpf, setCpf] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(false);
  const [autoCheck, setAutoCheck] = useState(false);
  const [depositHistory, setDepositHistory] = useState<Array<{
    trxId: string;
    pixCode: string;
    qrCodeBase64: string;
    usdAmount?: number;
    brlAmount?: number;
    createdAt: number;
    status: 'pending' | 'completed' | 'failed';
  }>>([]);
  const [depositData, setDepositData] = useState<{
    trxId: string;
    pixCode: string;
    qrCodeBase64: string;
    usdAmount?: number;
    brlAmount?: number;
  } | null>(null);

  // Carregar histórico de depósitos
  const loadDepositHistory = async () => {
    if (!user) return;
    
    try {
      const { data: transactions } = await supabase
        .from('digitopay_transactions')
        .select('*')
        .eq('user_id', user.id)
        .eq('type', 'deposit')
        .order('created_at', { ascending: false })
        .limit(10);

      const history = (transactions || []).map(tx => ({
        trxId: tx.trx_id,
        pixCode: tx.pix_code || '',
        qrCodeBase64: tx.qr_code_base64 || '',
        usdAmount: tx.amount,
        brlAmount: tx.amount_brl,
        createdAt: new Date(tx.created_at).getTime(),
        status: tx.status as 'pending' | 'completed' | 'failed'
      }));

      setDepositHistory(history);
      console.log('📊 Histórico carregado:', history);
    } catch (error) {
      console.log('Erro ao carregar histórico:', error);
    }
  };

  // Auto verificação de status em intervalos quando há depósito pendente
  useEffect(() => {
    if (!depositData?.trxId) return;

    const interval = setInterval(async () => {
      try {
        console.log('🔄 Verificação automática de status...');
        
        // Verificar diretamente no banco se há atualização via webhook
        const { data: transaction } = await supabase
          .from('digitopay_transactions')
          .select('status, amount_brl, user_id')
          .eq('trx_id', depositData.trxId)
          .single();

        if (transaction && (transaction.status === 'completed' || transaction.status === 'paid')) {
          console.log('🎉 Depósito confirmado automaticamente!');
          
          toast({
            title: "🎉 SEU DEPÓSITO FOI CONCLUÍDO!",
            description: `Parabéns! R$ ${transaction.amount_brl} foi adicionado à sua conta automaticamente.`,
            duration: 15000,
          });

          // Atualizar status local
          setDepositHistory(prev => 
            prev.map(deposit => 
              deposit.trxId === depositData.trxId 
                ? { ...deposit, status: 'completed' as const }
                : deposit
            )
          );

          // Limpar dados do depósito
          setDepositData(null);
          
          // Parar o polling
          clearInterval(interval);
          
          // Recarregar dados
          loadDepositHistory();
          
          if (onSuccess) onSuccess();
        }
      } catch (error) {
        console.log('Verificação automática silenciosa:', error);
      }
    }, 10000); // Verifica a cada 10 segundos

    // Limpar quando componente desmontar ou depositData mudar
    return () => clearInterval(interval);
  }, [depositData?.trxId]);

  // Carregar histórico ao montar o componente
  useEffect(() => {
    loadDepositHistory();
  }, [user]);

  // Função para formatar data
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

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
    const brlAmount = await convertUSDToBRL(usdAmount);

    // Validação de valor mínimo
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
      console.log('💰 Criando depósito...', { usdAmount, brlAmount, cpf });

      // Usar a edge function diretamente para maior confiabilidade
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

      console.log('✅ Depósito criado:', result);

      const depositDataToSet = {
        trxId: result.id,
        pixCode: result.pixCopiaECola || '',
        qrCodeBase64: result.qrCodeBase64 || '',
        usdAmount: usdAmount,
        brlAmount: brlAmount.brlAmount,
      };

      console.log('📱 Configurando dados do depósito:', depositDataToSet);
      setDepositData(depositDataToSet);

      // Adicionar ao histórico local
      const newDeposit = {
        ...depositDataToSet,
        createdAt: Date.now(),
        status: 'pending' as const
      };
      setDepositHistory(prev => [newDeposit, ...prev.slice(0, 9)]);

      toast({
        title: '✅ PIX gerado com sucesso!',
        description: 'Escaneie o QR Code ou copie o código PIX. Verificaremos automaticamente quando o pagamento for confirmado.',
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

  const checkStatus = async () => {
    if (!depositData?.trxId) return;

    setCheckingStatus(true);

    try {
      console.log('🔍 Verificando status do depósito:', depositData.trxId);

      // Usar a edge function corrigida para verificar status
      const { data: statusResult, error: statusError } = await supabase.functions.invoke('digitopay-status', {
        body: { trxId: depositData.trxId }
      });

      if (statusError) {
        toast({
          title: "Erro ao verificar status",
          description: "Houve um problema ao consultar o status do depósito",
          variant: "destructive"
        });
        return;
      }

      console.log('✅ Status verificado:', statusResult);

      // Se a transação foi confirmada
      if (statusResult?.isConfirmed || statusResult?.data?.status === 'REALIZADO') {
        toast({
          title: "🎉 SEU DEPÓSITO FOI CONCLUÍDO!",
          description: `Parabéns! Seu depósito de $${depositData.usdAmount} foi aprovado e o saldo foi adicionado à sua conta.`,
          duration: 15000,
        });

        // Atualizar status local
        setDepositHistory(prev => 
          prev.map(deposit => 
            deposit.trxId === depositData.trxId 
              ? { ...deposit, status: 'completed' as const }
              : deposit
          )
        );

        // Limpar dados do depósito atual
        setDepositData(null);
        
        // Recarregar histórico
        loadDepositHistory();
        
        if (onSuccess) onSuccess();
      } else {
        toast({
          title: "⏳ Aguardando Pagamento",
          description: "Seu depósito ainda está pendente. Continuaremos verificando automaticamente.",
        });
      }

    } catch (error) {
      toast({
        title: "Erro na verificação",
        description: "Não foi possível verificar o status do depósito",
        variant: "destructive"
      });
    } finally {
      setCheckingStatus(false);
    }
  };

  return (
    <Card className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border-2 border-yellow-500/20">
      <CardHeader>
        <CardTitle className="text-yellow-400 flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Depósito PIX Automático
        </CardTitle>
        <CardDescription className="text-gray-400">
          Gere um PIX e receba confirmação automática quando pago
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {!depositData ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="amount" className="text-yellow-400">Valor (USD)</Label>
                <Input
                  id="amount"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="bg-gray-800 border-yellow-500/30 text-white"
                  placeholder="10.00"
                  min="1"
                  step="0.01"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Valor mínimo: $1.00 USD
                </p>
              </div>
              <div>
                <Label htmlFor="cpf" className="text-yellow-400">CPF</Label>
                <Input
                  id="cpf"
                  value={cpf}
                  onChange={(e) => setCpf(e.target.value)}
                  className="bg-gray-800 border-yellow-500/30 text-white"
                  placeholder="123.456.789-00"
                />
              </div>
            </div>

            {amount && (
              <div className="bg-yellow-500/10 rounded-lg p-4 border border-yellow-500/20">
                <h4 className="text-yellow-400 font-medium mb-2">💰 Resumo do Depósito</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">Você paga (PIX):</span>
                    <div className="text-white font-semibold">
                      {formatBRL(parseFloat(amount) * (exchangeRate || 5.5))}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-400">Recebe (USD):</span>
                    <div className="text-white font-semibold">${parseFloat(amount).toFixed(2)}</div>
                  </div>
                </div>
              </div>
            )}

            <Button
              onClick={handleCreateDeposit}
              disabled={loading}
              className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-bold py-3"
            >
              {loading ? 'Gerando PIX Automático...' : '🚀 Gerar PIX com Confirmação Automática'}
            </Button>
          </>
        ) : (
          <div className="space-y-6">
            <div className="text-center bg-gradient-to-r from-green-500/10 to-yellow-500/10 rounded-lg p-4 border border-green-500/20">
              <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-2" />
              <h3 className="text-lg font-semibold text-green-400 mb-2">✅ PIX Gerado com Sucesso!</h3>
              <p className="text-sm text-gray-300">
                Sistema configurado para confirmação automática. 
                <br />
                <strong>Você receberá uma notificação assim que o pagamento for confirmado!</strong>
              </p>
            </div>

            {depositData.qrCodeBase64 && (
              <div className="text-center space-y-3">
                <div className="bg-white p-4 rounded-xl inline-block">
                  <img
                    src={`data:image/png;base64,${depositData.qrCodeBase64}`}
                    alt="QR Code PIX"
                    className="w-48 h-48 mx-auto"
                  />
                </div>
                <p className="text-sm text-gray-400">Escaneie o QR Code com seu app bancário</p>
              </div>
            )}

            {depositData.pixCode && (
              <div className="space-y-2">
                <Label className="text-yellow-400">Código PIX (Copie e Cole)</Label>
                <div className="flex gap-2">
                  <Input
                    value={depositData.pixCode}
                    readOnly
                    className="bg-gray-800 border-yellow-500/30 text-white font-mono text-sm"
                  />
                  <Button
                    variant="outline"
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(depositData.pixCode);
                        toast({
                          title: '📋 Código PIX copiado!',
                          description: 'Cole no seu app bancário para pagar'
                        });
                      } catch (error) {
                        toast({
                          title: 'Erro ao copiar',
                          description: 'Copie manualmente',
                          variant: 'destructive'
                        });
                      }
                    }}
                    className="border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 rounded-lg p-4 border border-blue-500/20">
                <div className="text-xs text-blue-400 mb-1">Valor a Pagar (PIX)</div>
                <div className="text-xl font-bold text-white">
                  {depositData.brlAmount ? formatBRL(depositData.brlAmount) : 'Calculando...'}
                </div>
              </div>
              <div className="bg-gradient-to-br from-green-500/10 to-green-600/10 rounded-lg p-4 border border-green-500/20">
                <div className="text-xs text-green-400 mb-1">Crédito na Conta (USD)</div>
                <div className="text-xl font-bold text-white">
                  {depositData.usdAmount ? formatUSD(depositData.usdAmount) : 'N/A'}
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-lg p-4 border border-purple-500/20">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-green-400 font-medium">✨ Sistema Automático Ativo</span>
              </div>
              <p className="text-sm text-gray-300">
                Assim que você fizer o pagamento PIX, nosso sistema detectará automaticamente e:
              </p>
              <ul className="text-sm text-gray-300 mt-2 space-y-1 ml-4">
                <li>• ✅ Confirmará o pagamento instantaneamente</li>
                <li>• 💰 Adicionará o saldo à sua conta</li>
                <li>• 🎉 Enviará uma notificação de confirmação</li>
              </ul>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={checkStatus}
                disabled={checkingStatus}
                variant="outline"
                className="flex-1 border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10"
              >
                {checkingStatus ? '🔄 Verificando...' : '🔍 Verificar Agora'}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setDepositData(null);
                  setAmount('');
                  setCpf('');
                }}
                className="border-gray-500/30 text-gray-400 hover:bg-gray-500/10"
              >
                🔄 Novo PIX
              </Button>
            </div>

            <div className="text-xs text-center text-gray-500">
              ID da Transação: {depositData.trxId}
            </div>
          </div>
        )}

        {/* Histórico de Depósitos */}
        {depositHistory.length > 0 && (
          <div className="space-y-4 mt-8 pt-6 border-t border-gray-700">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-yellow-400 mb-2">📋 Histórico de Depósitos</h3>
              <p className="text-sm text-gray-400">Seus depósitos PIX recentes</p>
            </div>
            
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {depositHistory.map((deposit, index) => (
                <div key={deposit.trxId} className="bg-gradient-to-br from-gray-800/30 to-gray-900/30 rounded-xl p-4 border border-gray-600/20">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-full flex items-center justify-center">
                        <QrCode className="h-4 w-4 text-yellow-400" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-yellow-400">
                          Depósito #{index + 1}
                        </div>
                        <div className="text-xs text-gray-400">
                          {formatDate(deposit.createdAt)}
                        </div>
                      </div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${
                      deposit.status === 'completed' ? 'bg-gradient-to-r from-green-500/20 to-green-600/20 text-green-400 border border-green-500/30' :
                      deposit.status === 'pending' ? 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 text-yellow-400 border border-yellow-500/30' :
                      'bg-gradient-to-r from-red-500/20 to-red-600/20 text-red-400 border border-red-500/30'
                    }`}>
                      {deposit.status === 'completed' ? '✅ Concluído' :
                       deposit.status === 'pending' ? '⏳ Pendente' :
                       '❌ Falhou'}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div className="bg-gray-800/50 rounded-lg p-3 text-center">
                      <div className="text-xs text-gray-400 mb-1">Valor PIX</div>
                      <div className="text-sm font-bold text-white">
                        {deposit.brlAmount ? `R$ ${deposit.brlAmount.toFixed(2)}` : 'N/A'}
                      </div>
                    </div>
                    <div className="bg-gray-800/50 rounded-lg p-3 text-center">
                      <div className="text-xs text-gray-400 mb-1">Crédito USD</div>
                      <div className="text-sm font-bold text-white">
                        {deposit.usdAmount ? `$${deposit.usdAmount.toFixed(2)}` : 'N/A'}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    {deposit.pixCode && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={async () => {
                          try {
                            await navigator.clipboard.writeText(deposit.pixCode);
                            toast({
                              title: '📋 Código PIX copiado!',
                              description: 'Cole no seu app bancário'
                            });
                          } catch (error) {
                            toast({
                              title: 'Erro ao copiar',
                              description: 'Copie manualmente',
                              variant: 'destructive'
                            });
                          }
                        }}
                        className="flex-1 text-xs border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10"
                      >
                        📋 Copiar PIX
                      </Button>
                    )}
                    {deposit.qrCodeBase64 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const link = document.createElement('a');
                          link.href = `data:image/png;base64,${deposit.qrCodeBase64}`;
                          link.download = `pix-qr-${deposit.trxId}.png`;
                          link.click();
                        }}
                        className="flex-1 text-xs border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10"
                      >
                        📱 Baixar QR
                      </Button>
                    )}
                  </div>
                  
                  <div className="mt-3 text-xs text-gray-500 font-mono text-center bg-gray-900/50 rounded p-2">
                    ID: {deposit.trxId}
                  </div>
                </div>
              ))}
            </div>
            
            <Button
              variant="outline"
              onClick={loadDepositHistory}
              className="w-full text-sm border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10"
            >
              🔄 Atualizar Histórico
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};