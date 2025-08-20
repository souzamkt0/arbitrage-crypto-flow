import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';

const SimpleLogin = () => {
  const [email, setEmail] = useState('admin@clean.com');
  const [password, setPassword] = useState('123456');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string>('');

  const handleLogin = async () => {
    setIsLoading(true);
    setResult('');

    try {
      console.log('🔄 Tentando login direto com Supabase...');
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setResult(`❌ Erro: ${error.message}`);
        console.error('Erro no login:', error);
      } else {
        setResult('✅ Login bem-sucedido! Redirecionando...');
        console.log('Login successful:', data.user?.email);
        
        // Redirecionar para dashboard após 1 segundo
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 1000);
      }
    } catch (err: any) {
      setResult(`❌ Erro interno: ${err.message}`);
      console.error('Erro interno:', err);
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white p-4">
      <Card className="w-full max-w-md bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-center text-white">Login Simples</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-gray-700 border-gray-600 text-white"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Senha</label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-gray-700 border-gray-600 text-white"
            />
          </div>
          
          <Button 
            onClick={handleLogin}
            disabled={isLoading}
            className="w-full bg-yellow-600 hover:bg-yellow-700"
          >
            {isLoading ? 'Entrando...' : 'Entrar'}
          </Button>
          
          {result && (
            <div className="mt-4 p-3 bg-gray-700 rounded text-sm">
              {result}
            </div>
          )}
          
          <div className="text-center text-sm text-gray-400">
            Esta é uma página de login simplificada para testar a autenticação direta.
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SimpleLogin;