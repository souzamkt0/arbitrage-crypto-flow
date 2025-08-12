import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { DigitoPayService } from '@/services/digitopayService';
import { Eye, EyeOff, TestTube } from 'lucide-react';

export const DigitoPayDebug: React.FC = () => {
  const { toast } = useToast();
  const [showSecrets, setShowSecrets] = useState(false);
  const [loading, setLoading] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);

  // Configurações do DigitoPay
  const config = {
    baseUrl: 'https://api.digitopayoficial.com.br/api',
    clientId: import.meta.env.VITE_DIGITOPAY_CLIENT_ID || 'NÃO CONFIGURADO',
    clientSecret: import.meta.env.VITE_DIGITOPAY_CLIENT_SECRET || 'NÃO CONFIGURADO',
    webhookSecret: import.meta.env.VITE_DIGITOPAY_WEBHOOK_SECRET || 'NÃO CONFIGURADO'
  };

  const testConnection = async () => {
    setLoading(true);
    try {
      // Teste de autenticação
      const authResult = await DigitoPayService.authenticate();
      setTestResult({
        auth: authResult,
        config: config,
        timestamp: new Date().toISOString()
      });

      if (authResult.success) {
        toast({
          title: 'Conexão OK!',
          description: 'DigitoPay conectado com sucesso',
        });
      } else {
        toast({
          title: 'Erro de Conexão',
          description: authResult.message || 'Erro ao conectar com DigitoPay',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Erro no teste:', error);
      setTestResult({
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        config: config,
        timestamp: new Date().toISOString()
      });
      toast({
        title: 'Erro no Teste',
        description: 'Erro ao testar conexão com DigitoPay',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TestTube className="h-5 w-5" />
          Debug DigitoPay
        </CardTitle>
        <CardDescription>
          Verificar configurações e testar conexão com a API
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Configurações */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="font-medium">Configurações do DigitoPay</Label>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSecrets(!showSecrets)}
            >
              {showSecrets ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>

          <div className="space-y-2">
            <div>
              <Label className="text-xs text-muted-foreground">Base URL</Label>
              <Input value={config.baseUrl} readOnly className="font-mono text-sm" />
            </div>

            <div>
              <Label className="text-xs text-muted-foreground">Client ID</Label>
              <Input 
                value={showSecrets ? config.clientId : '••••••••••••••••'} 
                readOnly 
                className="font-mono text-sm" 
              />
            </div>

            <div>
              <Label className="text-xs text-muted-foreground">Client Secret</Label>
              <Input 
                value={showSecrets ? config.clientSecret : '••••••••••••••••'} 
                readOnly 
                className="font-mono text-sm" 
              />
            </div>

            <div>
              <Label className="text-xs text-muted-foreground">Webhook Secret</Label>
              <Input 
                value={showSecrets ? config.webhookSecret : '••••••••••••••••'} 
                readOnly 
                className="font-mono text-sm" 
              />
            </div>
          </div>
        </div>

        {/* Status das configurações */}
        <div className="space-y-2">
          <Label className="font-medium">Status das Configurações</Label>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className={`p-2 rounded ${config.clientId !== 'NÃO CONFIGURADO' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              Client ID: {config.clientId !== 'NÃO CONFIGURADO' ? '✅ Configurado' : '❌ Não configurado'}
            </div>
            <div className={`p-2 rounded ${config.clientSecret !== 'NÃO CONFIGURADO' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              Client Secret: {config.clientSecret !== 'NÃO CONFIGURADO' ? '✅ Configurado' : '❌ Não configurado'}
            </div>
            <div className={`p-2 rounded ${config.webhookSecret !== 'NÃO CONFIGURADO' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              Webhook Secret: {config.webhookSecret !== 'NÃO CONFIGURADO' ? '✅ Configurado' : '❌ Não configurado'}
            </div>
            <div className="p-2 rounded bg-blue-100 text-blue-800">
              Base URL: ✅ Configurado
            </div>
          </div>
        </div>

        {/* Botão de teste */}
        <Button
          onClick={testConnection}
          disabled={loading || config.clientId === 'NÃO CONFIGURADO' || config.clientSecret === 'NÃO CONFIGURADO'}
          className="w-full"
        >
          {loading ? 'Testando...' : 'Testar Conexão DigitoPay'}
        </Button>

        {/* Resultado do teste */}
        {testResult && (
          <div className="space-y-2">
            <Label className="font-medium">Resultado do Teste</Label>
            <div className="bg-muted p-3 rounded-lg">
              <pre className="text-xs overflow-auto max-h-40">
                {JSON.stringify(testResult, null, 2)}
              </pre>
            </div>
          </div>
        )}

        {/* Instruções */}
        <div className="text-xs text-muted-foreground space-y-1">
          <p>• Verifique se o arquivo .env está configurado corretamente</p>
          <p>• As credenciais devem estar no formato correto</p>
          <p>• A API do DigitoPay deve estar acessível</p>
        </div>
      </CardContent>
    </Card>
  );
}; 