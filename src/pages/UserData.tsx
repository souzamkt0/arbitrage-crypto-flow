import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import UserDataTable from "@/components/UserDataTable";
import { useAuth } from "@/hooks/useAuth";
import { Database, Info, CheckCircle, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const UserData = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [testingConnection, setTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const testTableConnection = async () => {
    if (!user) {
      toast({
        title: "Erro",
        description: "Usuário não autenticado",
        variant: "destructive"
      });
      return;
    }

    setTestingConnection(true);
    setConnectionStatus('idle');

    try {
      // Testar se a tabela existe e está acessível
      const { data, error } = await supabase
        .from('user_data')
        .select('count')
        .eq('user_id', user.id);

      if (error) {
        console.error('Erro ao testar conexão:', error);
        setConnectionStatus('error');
        toast({
          title: "Erro de Conexão",
          description: `Erro ao acessar tabela: ${error.message}`,
          variant: "destructive"
        });
      } else {
        setConnectionStatus('success');
        toast({
          title: "Conexão Bem-sucedida",
          description: "Tabela user_data está acessível e funcionando!",
          variant: "default"
        });
      }
    } catch (error: any) {
      console.error('Erro geral:', error);
      setConnectionStatus('error');
      toast({
        title: "Erro",
        description: error.message || "Erro desconhecido",
        variant: "destructive"
      });
    } finally {
      setTestingConnection(false);
    }
  };

  const getStatusBadge = () => {
    switch (connectionStatus) {
      case 'success':
        return (
          <Badge variant="default" className="bg-green-500">
            <CheckCircle className="h-3 w-3 mr-1" />
            Conectado
          </Badge>
        );
      case 'error':
        return (
          <Badge variant="destructive">
            <AlertCircle className="h-3 w-3 mr-1" />
            Erro
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary">
            <Info className="h-3 w-3 mr-1" />
            Não testado
          </Badge>
        );
    }
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dados do Usuário</h1>
          <p className="text-muted-foreground">
            Gerencie seus dados pessoais na tabela user_data
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {getStatusBadge()}
        </div>
      </div>

      {/* Status da Tabela */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Database className="h-5 w-5" />
              <CardTitle>Status da Tabela</CardTitle>
            </div>
            <Button 
              onClick={testTableConnection} 
              disabled={testingConnection}
              size="sm"
            >
              {testingConnection ? 'Testando...' : 'Testar Conexão'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 border rounded-lg">
                <h3 className="font-semibold">Tabela</h3>
                <p className="text-sm text-muted-foreground">user_data</p>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <h3 className="font-semibold">Usuário</h3>
                <p className="text-sm text-muted-foreground">
                  {user?.email || 'Não logado'}
                </p>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <h3 className="font-semibold">Status</h3>
                <div className="flex justify-center mt-1">
                  {getStatusBadge()}
                </div>
              </div>
            </div>
            
            {connectionStatus === 'error' && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h4 className="font-semibold text-red-800 mb-2">Possíveis Soluções:</h4>
                <ul className="text-sm text-red-700 space-y-1">
                  <li>• Verifique se a migração foi aplicada no Supabase</li>
                  <li>• Execute: <code className="bg-red-100 px-1 rounded">node apply-user-table-migration.js</code></li>
                  <li>• Verifique as credenciais do Supabase no arquivo .env</li>
                  <li>• Confirme se a tabela user_data existe no banco</li>
                </ul>
              </div>
            )}
            
            {connectionStatus === 'success' && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-green-800">
                  ✅ Tabela user_data está funcionando corretamente!
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Informações da Implementação */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Info className="h-5 w-5" />
            <span>Sobre esta Implementação</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Arquivos Criados:</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• <code>supabase/migrations/20250115000001_create_user_table.sql</code> - Migração SQL</li>
                <li>• <code>apply-user-table-migration.js</code> - Script para aplicar migração</li>
                <li>• <code>src/components/UserDataTable.tsx</code> - Componente da tabela</li>
                <li>• <code>src/pages/UserData.tsx</code> - Esta página</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">Funcionalidades:</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• ✅ Criar, editar, visualizar e excluir dados</li>
                <li>• ✅ Segurança RLS (Row Level Security)</li>
                <li>• ✅ Validação de dados</li>
                <li>• ✅ Interface responsiva</li>
                <li>• ✅ Feedback visual com toasts</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">Como Usar:</h4>
              <ol className="text-sm space-y-1 text-muted-foreground">
                <li>1. Execute a migração: <code className="bg-gray-100 px-1 rounded">node apply-user-table-migration.js</code></li>
                <li>2. Teste a conexão clicando no botão "Testar Conexão"</li>
                <li>3. Use o botão "Adicionar" para criar novos registros</li>
                <li>4. Edite ou exclua registros usando os botões da tabela</li>
              </ol>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabela de Dados */}
      <UserDataTable />
    </div>
  );
};

export default UserData;