import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { createAdminUser } from '@/utils/createAdminUser';

const CreateAdmin = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [result, setResult] = useState<string>('');

  const handleCreateAdmin = async () => {
    setIsCreating(true);
    setResult('');

    const response = await createAdminUser();
    
    if (response.success) {
      setResult('✅ Usuário admin criado com sucesso! Tente fazer login com admin@clean.com / 123456');
    } else {
      setResult(`❌ Erro: ${response.error?.message || 'Erro desconhecido'}`);
    }
    
    setIsCreating(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">Criar Usuário Admin</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground text-center">
            Clique no botão abaixo para criar o usuário administrador usando a API oficial do Supabase.
          </p>
          
          <Button 
            onClick={handleCreateAdmin}
            disabled={isCreating}
            className="w-full"
          >
            {isCreating ? 'Criando...' : 'Criar Admin'}
          </Button>
          
          {result && (
            <div className="mt-4 p-3 bg-muted rounded text-sm text-foreground">
              {result}
            </div>
          )}
          
          <div className="text-center">
            <a href="/login" className="text-primary hover:underline text-sm">
              ← Voltar para Login
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateAdmin;