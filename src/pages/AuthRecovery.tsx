import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { RefreshCw, ArrowLeft, AlertTriangle } from 'lucide-react';

const AuthRecovery = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleAuthRecovery = async () => {
    setIsLoading(true);
    
    try {
      // Limpar todas as sessões locais
      localStorage.clear();
      sessionStorage.clear();
      
      // Fazer logout completo do Supabase
      await supabase.auth.signOut();
      
      // Aguardar um pouco para limpeza completa
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "✅ Recuperação Concluída",
        description: "Sessão limpa. Redirecionando para login...",
      });
      
      // Redirecionar para login
      setTimeout(() => {
        navigate('/login');
      }, 1500);
      
    } catch (error) {
      console.error('Erro na recuperação:', error);
      toast({
        title: "Erro na recuperação",
        description: "Tente novamente ou entre em contato com suporte.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-4 flex items-center justify-center">
      <Card className="w-full max-w-md bg-slate-800/90 border-slate-600">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <AlertTriangle className="h-12 w-12 text-yellow-500" />
          </div>
          <CardTitle className="text-slate-100">
            Recuperação de Autenticação
          </CardTitle>
          <p className="text-slate-300 text-sm mt-2">
            Detectamos um problema de autenticação. Vamos limpar a sessão e reconectar.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center text-slate-400 text-sm">
            <p>Esta ação irá:</p>
            <ul className="mt-2 space-y-1 text-left">
              <li>• Limpar dados de sessão corrompidos</li>
              <li>• Fazer logout completo do sistema</li>
              <li>• Redirecionar para nova autenticação</li>
            </ul>
          </div>
          
          <Button
            onClick={handleAuthRecovery}
            disabled={isLoading}
            className="w-full bg-primary hover:bg-primary/90"
          >
            {isLoading ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Recuperando...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Recuperar Autenticação
              </>
            )}
          </Button>
          
          <Button
            variant="outline"
            onClick={() => navigate('/login')}
            className="w-full border-slate-600 text-slate-300 hover:bg-slate-700"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar ao Login
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthRecovery;