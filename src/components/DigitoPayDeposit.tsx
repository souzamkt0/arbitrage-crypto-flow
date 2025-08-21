import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { DigitoPayService } from '@/services/digitopayService';
import { useAuth } from '@/hooks/useAuth';
import { Copy, Download, QrCode, DollarSign } from 'lucide-react';
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

  // Monitorar mudanças no depositData
  useEffect(() => {
    if (depositData) {
      console.log('🔄 Estado depositData atualizado:', {
        hasTrxId: !!depositData.trxId,
        hasPixCode: !!depositData.pixCode,
        hasQrCode: !!depositData.qrCodeBase64,
        qrCodeLength: depositData.qrCodeBase64?.length || 0
      });
    }
  }, [depositData]);

  // Verificação automática de status
  useEffect(() => {
    if (autoCheck && depositData?.trxId) {
      const interval = setInterval(() => {
        console.log('🔄 Verificação automática de status...');
        checkStatus();
      }, 5000); // Verificar a cada 5 segundos

      return () => clearInterval(interval);
    }
  }, [autoCheck, depositData?.trxId]);

  // Carregar histórico de depósitos
  const loadDepositHistory = async () => {
    if (!user) return;
    
    try {
      const { data: transactions, error } = await supabase
        .from('digitopay_transactions')
        .select('*')
        .eq('user_id', user.id)
        .eq('type', 'deposit')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        toast({
          title: "Erro ao carregar histórico",
          description: "Não foi possível carregar as transações",
          variant: "destructive"
        });
        return;
      }

      const history = transactions.map(tx => ({
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
      console.error('❌ Erro ao carregar histórico:', error);
    }
  };

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

      // Simulação para localhost
      if (window.location.hostname === 'localhost') {
        console.log('🔄 Simulando depósito para localhost...');
        
        const mockTrxId = 'LOCAL-' + Date.now();
        const mockPixCode = '00020126580014br.gov.bcb.pix0136123e4567-e12b-12d1-a456-426614174000520400005303986540510.005802BR5913Teste Empresa6008Brasilia62070503***6304E2CA';
        const mockQrCode = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';

        const depositDataToSet = {
          trxId: mockTrxId,
          pixCode: mockPixCode,
          qrCodeBase64: mockQrCode,
          usdAmount: usdAmount,
          brlAmount: brlAmount.brlAmount,
          createdAt: Date.now()
        };

        console.log('📱 Configurando dados do depósito:', depositDataToSet);
        setDepositData(depositDataToSet);

        // Adicionar ao histórico
        const newDeposit = {
          ...depositDataToSet,
          status: 'pending' as const
        };
        setDepositHistory(prev => [newDeposit, ...prev.slice(0, 9)]);

        // Simular pagamento após 10 segundos
        setTimeout(async () => {
          console.log('✅ Simulando pagamento...');
          
          try {
            // Atualizar saldo diretamente
            const { error: updateError } = await supabase
              .from('profiles')
              .update({ 
                balance: (profile?.balance || 0) + brlAmount,
                total_profit: (profile?.total_profit || 0) + brlAmount
              })
              .eq('user_id', user?.id);

            if (updateError) {
              toast({
                title: "Erro ao atualizar saldo",
                description: "Houve um problema ao atualizar seu saldo",
                variant: "destructive"
              });
            } else {
              
              // Atualizar histórico
              setDepositHistory(prev => 
                prev.map(deposit => 
                  deposit.trxId === mockTrxId 
                    ? { ...deposit, status: 'completed' as const }
                    : deposit
                )
              );

              toast({
                title: 'Pagamento confirmado!',
                description: `Saldo atualizado: R$ ${(profile?.balance || 0) + brlAmount}`,
              });

              if (onSuccess) onSuccess();
            }
          } catch (error) {
            console.error('❌ Erro na simulação:', error);
          }
        }, 10000);

        return;
      }

      // Produção - usar DigitoPay
      const callbackUrl = 'https://cbwpghrkfvczjqzefvix.supabase.co/functions/v1/digitopay-deposit-webhook';
      
      const result = await DigitoPayService.createDeposit(
        usdAmount,
        cpf,
        profile?.display_name || 'Usuário',
        callbackUrl
      );

      console.log('✅ Depósito criado:', result);

      const depositDataToSet = {
        trxId: result.id,
        pixCode: result.pixCopiaECola || '',
        qrCodeBase64: result.qrCodeBase64 || '',
        usdAmount: usdAmount,
        brlAmount: brlAmount.brlAmount,
        createdAt: Date.now()
      };

      console.log('📱 Configurando dados do depósito:', depositDataToSet);
      setDepositData(depositDataToSet);

      // Adicionar ao histórico
      const newDeposit = {
        ...depositDataToSet,
        status: 'pending' as const
      };
      setDepositHistory(prev => [newDeposit, ...prev.slice(0, 9)]);

      toast({
        title: 'PIX gerado!',
        description: 'Escaneie o QR Code ou copie o código PIX',
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

      // Primeiro, verificar logs de debug
      const { data: debugLogs, error: debugError } = await supabase
        .from('digitopay_debug')
        .select('*')
        .eq('payload->>trxId', depositData.trxId)
        .eq('tipo', 'webhook_received')
        .order('created_at', { ascending: false })
        .limit(1);

      if (debugError) {
        console.error('❌ Erro ao buscar logs de debug:', debugError);
      } else if (debugLogs && debugLogs.length > 0) {
        const webhookData = debugLogs[0].payload;
        console.log('📡 Webhook encontrado:', webhookData);

        if (webhookData.status === 'REALIZADO' || webhookData.status === 'PAID') {
          console.log('✅ Pagamento confirmado via webhook!');
          
          // Processar transação
          const { data: processResult, error: processError } = await supabase.functions.invoke('process-transaction', {
            body: {
              trxId: depositData.trxId,
              userId: user?.id
            }
          });

          if (processError) {
            console.error('❌ Erro ao processar transação:', processError);
          } else {
            console.log('✅ Transação processada:', processResult);
            
            // Atualizar histórico
            setDepositHistory(prev => 
              prev.map(deposit => 
                deposit.trxId === depositData.trxId 
                  ? { ...deposit, status: 'completed' as const }
                  : deposit
              )
            );

            toast({
              title: 'Pagamento confirmado!',
              description: 'Seu saldo foi atualizado',
            });

            if (onSuccess) onSuccess();
            return;
          }
        }
      }

      // Fallback: verificar via API
      const status = await DigitoPayService.checkTransactionStatus(depositData.trxId);
      console.log('📊 Status da transação:', status);

      if (status.status === 'REALIZADO' || status.status === 'PAID') {
        console.log('✅ Pagamento confirmado!');
        
        // Atualizar histórico
        setDepositHistory(prev => 
          prev.map(deposit => 
            deposit.trxId === depositData.trxId 
              ? { ...deposit, status: 'completed' as const }
              : deposit
          )
        );

        toast({
          title: 'Pagamento confirmado!',
          description: 'Seu saldo foi atualizado',
        });

        if (onSuccess) onSuccess();
      } else {
        console.log('⏳ Pagamento ainda pendente');
        toast({
          title: 'Pagamento pendente',
          description: 'Aguardando confirmação do pagamento',
        });
      }

    } catch (error) {
      console.error('❌ Erro ao verificar status:', error);
      toast({
        title: 'Erro ao verificar status',
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        variant: 'destructive'
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
          Depósito PIX
        </CardTitle>
        <CardDescription className="text-gray-400">
          Gere um PIX para adicionar saldo à sua conta
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

            <Button
              onClick={handleCreateDeposit}
              disabled={loading}
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-bold"
            >
              {loading ? 'Gerando PIX...' : 'Gerar PIX'}
            </Button>
          </>
        ) : (
          <div className="space-y-4">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-yellow-400 mb-2">📱 PIX Gerado</h3>
              <p className="text-sm text-gray-400">Escaneie o QR Code ou copie o código PIX</p>
            </div>

            {depositData.qrCodeBase64 && (
              <div className="flex justify-center">
                <div className="bg-white p-4 rounded-lg">
                  <img
                    src={`data:image/png;base64,${depositData.qrCodeBase64}`}
                    alt="QR Code PIX"
                    className="w-48 h-48"
                  />
                </div>
              </div>
            )}

            {depositData.pixCode && (
              <div className="space-y-2">
                <Label className="text-yellow-400">Código PIX</Label>
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
                          title: 'Código PIX copiado!',
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
                    className="border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="bg-gray-800/30 rounded-lg p-3">
                <div className="text-xs text-gray-400">Valor PIX</div>
                <div className="text-lg font-semibold text-white">
                  {depositData.brlAmount ? formatBRL(depositData.brlAmount) : 'N/A'}
                </div>
              </div>
              <div className="bg-gray-800/30 rounded-lg p-3">
                <div className="text-xs text-gray-400">Crédito USD</div>
                <div className="text-lg font-semibold text-white">
                  {depositData.usdAmount ? formatUSD(depositData.usdAmount) : 'N/A'}
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={checkStatus}
                disabled={checkingStatus}
                className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-black"
              >
                {checkingStatus ? 'Verificando...' : 'Verificar Status'}
              </Button>
              <Button
                variant="outline"
                onClick={() => setDepositData(null)}
                className="border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10"
              >
                Novo PIX
              </Button>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-yellow-400">Verificação Automática</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setAutoCheck(!autoCheck)}
                  className={`text-xs ${
                    autoCheck 
                      ? 'bg-yellow-500/20 border-yellow-500 text-yellow-400' 
                      : 'border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10'
                  }`}
                >
                  {autoCheck ? '✅ Ativa' : '⏸️ Inativa'}
                </Button>
              </div>
              <p className="text-xs text-gray-400">
                {autoCheck 
                  ? 'Verificando status automaticamente a cada 5 segundos...' 
                  : 'Clique para ativar verificação automática'
                }
              </p>
            </div>
          </div>
        )}

        {/* Histórico de Depósitos */}
        {depositHistory.length > 0 && (
          <div className="space-y-4 mt-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-yellow-400 mb-2">📋 Histórico de Depósitos</h3>
              <p className="text-sm text-gray-400">Seus últimos depósitos PIX</p>
            </div>
            
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {depositHistory.map((deposit, index) => (
                <div key={deposit.trxId} className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl p-4 border-2 border-yellow-500/20">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-yellow-500/20 rounded-full flex items-center justify-center">
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
                    <div className="flex items-center gap-2">
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                        deposit.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                        deposit.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>
                        {deposit.status === 'completed' ? '✅ Pago' :
                         deposit.status === 'pending' ? '⏳ Pendente' :
                         '❌ Falhou'}
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div className="bg-gray-800/30 rounded-lg p-2">
                      <div className="text-xs text-gray-400">Valor PIX</div>
                      <div className="text-sm font-semibold text-white">
                        {deposit.brlAmount ? `R$ ${deposit.brlAmount.toFixed(2)}` : 'N/A'}
                      </div>
                    </div>
                    <div className="bg-gray-800/30 rounded-lg p-2">
                      <div className="text-xs text-gray-400">Crédito USD</div>
                      <div className="text-sm font-semibold text-white">
                        {deposit.usdAmount ? `$${deposit.usdAmount.toFixed(2)}` : 'N/A'}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
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
                    {deposit.pixCode && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={async () => {
                          try {
                            await navigator.clipboard.writeText(deposit.pixCode);
                            toast({
                              title: 'Código PIX copiado!',
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
                  </div>
                  
                  <div className="mt-2 text-xs text-gray-500 font-mono">
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