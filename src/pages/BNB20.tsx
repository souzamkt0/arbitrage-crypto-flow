import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { BNB20Deposit } from '@/components/BNB20Deposit';
import { BNB20Withdrawal } from '@/components/BNB20Withdrawal';
import { BNB20History } from '@/components/BNB20History';
import { 
  Coins, 
  TrendingUp, 
  TrendingDown, 
  History, 
  Shield, 
  Zap,
  Info
} from 'lucide-react';

export default function BNB20Page() {
  const [activeTab, setActiveTab] = useState('deposit');
  const [refreshKey, setRefreshKey] = useState(0);

  const handleSuccess = () => {
    // Refresh history when transaction is successful
    setRefreshKey(prev => prev + 1);
    setActiveTab('history');
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2">
          <Coins className="h-8 w-8 text-yellow-600" />
          <h1 className="text-3xl font-bold">BNB20 Gateway</h1>
        </div>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Depósitos e saques via Binance Smart Chain (BSC) com processamento automatizado
          através da integração NOWPayments
        </p>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Zap className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <h3 className="font-medium">Processamento Rápido</h3>
            <p className="text-sm text-muted-foreground">
              Depósitos automáticos após confirmação na blockchain
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Shield className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <h3 className="font-medium">Seguro & Confiável</h3>
            <p className="text-sm text-muted-foreground">
              Integração oficial NOWPayments com validação HMAC
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <History className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <h3 className="font-medium">Histórico Completo</h3>
            <p className="text-sm text-muted-foreground">
              Acompanhe todas suas transações em tempo real
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="deposit" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Depósito
          </TabsTrigger>
          <TabsTrigger value="withdrawal" className="flex items-center gap-2">
            <TrendingDown className="h-4 w-4" />
            Saque
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            Histórico
          </TabsTrigger>
        </TabsList>

        <TabsContent value="deposit" className="space-y-6">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <strong>Como funciona:</strong> Crie um pagamento, envie BNB para o endereço gerado, 
              e seu saldo será creditado automaticamente após confirmação na blockchain.
            </AlertDescription>
          </Alert>
          <BNB20Deposit onSuccess={handleSuccess} />
        </TabsContent>

        <TabsContent value="withdrawal" className="space-y-6">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <strong>Processo de Saque:</strong> Saques são processados manualmente por motivos de segurança. 
              Tempo médio de aprovação: 1-24 horas úteis.
            </AlertDescription>
          </Alert>
          <BNB20Withdrawal onSuccess={handleSuccess} />
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <BNB20History key={refreshKey} />
        </TabsContent>
      </Tabs>

      {/* Technical Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Informações Técnicas
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium mb-2">Rede Suportada</h4>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>• Binance Smart Chain (BSC)</li>
              <li>• Token: BNB (BEP-20)</li>
              <li>• Confirmações: 12 blocos</li>
              <li>• Tempo médio: 3-5 minutos</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium mb-2">Limites & Taxas</h4>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>• Depósito mínimo: $10 USD</li>
              <li>• Saque mínimo: $20 USD</li>
              <li>• Taxa de rede: Incluída</li>
              <li>• Processamento: Automático</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}