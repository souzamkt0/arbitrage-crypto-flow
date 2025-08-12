import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { DigitoPayService } from '@/services/digitopayService';
import { Badge } from '@/components/ui/badge';

export const DigitoPayTest: React.FC = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [authResult, setAuthResult] = useState<any>(null);

  const testAuthentication = async () => {
    setLoading(true);
    try {
      const result = await DigitoPayService.authenticate();
      setAuthResult(result);
      
      if (result.success) {
        toast({
          title: 'Autenticação bem-sucedida!',
          description: 'Token obtido com sucesso',
          variant: 'default',
        });
      } else {
        toast({
          title: 'Erro na autenticação',
          description: result.message || 'Erro desconhecido',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Falha na conexão',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Teste DigitoPay API</CardTitle>
        <CardDescription>
          Testar conexão com a API oficial do DigitoPay
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={testAuthentication} 
          disabled={loading}
          className="w-full"
        >
          {loading ? 'Testando...' : 'Testar Autenticação'}
        </Button>

        {authResult && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="font-medium">Status:</span>
              <Badge variant={authResult.success ? 'default' : 'destructive'}>
                {authResult.success ? 'Sucesso' : 'Erro'}
              </Badge>
            </div>
            
            {authResult.message && (
              <div className="text-sm text-muted-foreground">
                <strong>Mensagem:</strong> {authResult.message}
              </div>
            )}
            
            {authResult.accessToken && (
              <div className="text-sm text-muted-foreground">
                <strong>Token:</strong> {authResult.accessToken.substring(0, 20)}...
              </div>
            )}
          </div>
        )}

        <div className="text-xs text-muted-foreground space-y-1">
          <p><strong>Base URL:</strong> https://api.digitopayoficial.com.br/api</p>
          <p><strong>Endpoint Auth:</strong> /token/api</p>
          <p><strong>Client ID:</strong> da0cdf6c-06dd-4e04-a046-abd00e8b43ed</p>
        </div>
      </CardContent>
    </Card>
  );
};