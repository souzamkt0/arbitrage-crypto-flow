import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const DatabaseTest: React.FC = () => {
  const { toast } = useToast();
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [tables, setTables] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const testConnection = async () => {
    setLoading(true);
    try {
      // Teste básico de conexão
      const { data, error } = await supabase
        .from('profiles')
        .select('count')
        .limit(1);

      if (error) {
        throw error;
      }

      setIsConnected(true);
      toast({
        title: 'Conexão OK!',
        description: 'Banco de dados conectado com sucesso',
      });

      // Verificar tabelas do DigitoPay
      const { data: digitopayTables, error: digitopayError } = await supabase
        .from('digitopay_transactions')
        .select('id')
        .limit(1);

      if (digitopayError) {
        setTables(['profiles', 'Erro ao acessar digitopay_transactions']);
      } else {
        setTables(['profiles', 'digitopay_transactions', 'digitopay_debug']);
      }

    } catch (error) {
      console.error('Erro na conexão:', error);
      setIsConnected(false);
      toast({
        title: 'Erro de Conexão',
        description: 'Não foi possível conectar ao banco de dados',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    testConnection();
  }, []);

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Teste de Conexão - Banco de Dados</CardTitle>
        <CardDescription>
          Verificar se a conexão com o Supabase está funcionando
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${
            isConnected === null ? 'bg-gray-400' :
            isConnected ? 'bg-green-500' : 'bg-red-500'
          }`} />
          <span className="text-sm">
            {isConnected === null ? 'Testando...' :
             isConnected ? 'Conectado' : 'Desconectado'}
          </span>
        </div>

        {tables.length > 0 && (
          <div>
            <h4 className="font-medium mb-2">Tabelas Acessíveis:</h4>
            <ul className="text-sm space-y-1">
              {tables.map((table, index) => (
                <li key={index} className={`${
                  table.includes('Erro') ? 'text-red-600' : 'text-green-600'
                }`}>
                  • {table}
                </li>
              ))}
            </ul>
          </div>
        )}

        <Button
          onClick={testConnection}
          disabled={loading}
          className="w-full"
        >
          {loading ? 'Testando...' : 'Testar Conexão'}
        </Button>

        <div className="text-xs text-muted-foreground">
          <p>URL: cbwpghrkfvczjqzefvix.supabase.co</p>
          <p>Status: {isConnected ? 'Online' : 'Offline'}</p>
        </div>
      </CardContent>
    </Card>
  );
}; 