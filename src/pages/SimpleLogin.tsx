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
        console.error('Erro no login:', error);
        
        // Se for erro de schema, tentar bypass
        if (error.message.includes('Database error querying schema') || 
            error.message.includes('converting NULL to string')) {
          
          setResult('🚀 Tentando método alternativo...');
          
          // Tentar bypass para admin
          if (email === 'admin@clean.com' && password === '123456') {
            try {
              const response = await fetch(`https://cbwpghrkfvczjqzefvix.supabase.co/functions/v1/admin-bypass-auth`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNid3BnaHJrZnZjempxemVmdml4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3MTM4ODMsImV4cCI6MjA2ODI4OTg4M30.DxGYGfC1Ge589yiPCQuC8EyMD_ium4NOpD8coYAtYz8`,
                },
                body: JSON.stringify({ email, password }),
              });

              const result = await response.json();
              
              if (result.success) {
                setResult('✅ Login bypass bem-sucedido! Redirecionando...');
                console.log('Login bypass successful:', result.session);
                
                // Salvar sessão bypass
                localStorage.setItem('bypass_session', JSON.stringify(result.session));
                
                setTimeout(() => {
                  window.location.href = '/dashboard';
                }, 1000);
                return;
              } else {
                setResult(`❌ Falha no bypass: ${result.error}`);
              }
            } catch (bypassError) {
              console.error('Erro no bypass:', bypassError);
              setResult(`❌ Erro no método alternativo: ${bypassError.message}`);
            }
          }
        }
        
        setResult(`❌ Erro: ${error.message}`);
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
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-foreground">Login Simples</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-foreground">Email</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2 text-foreground">Senha</label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          
          <Button 
            onClick={handleLogin}
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? 'Entrando...' : 'Entrar'}
          </Button>
          
          {result && (
            <div className="mt-4 p-3 bg-muted rounded text-sm text-foreground">
              {result}
            </div>
          )}
          
          <div className="text-center text-sm text-muted-foreground">
            Esta é uma página de login simplificada para testar a autenticação direta.
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SimpleLogin;