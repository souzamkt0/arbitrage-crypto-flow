import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Shield, ArrowLeft, User, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ImpersonatedUser {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  balance: number;
  totalProfit: number;
}

interface AdminBackup {
  id: string;
  email: string;
  role: string;
  timestamp: string;
}

const AdminImpersonationBanner = () => {
  const [isImpersonating, setIsImpersonating] = useState(false);
  const [impersonatedUser, setImpersonatedUser] = useState<ImpersonatedUser | null>(null);
  const [adminBackup, setAdminBackup] = useState<AdminBackup | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const checkImpersonationMode = () => {
      const impersonationMode = localStorage.getItem('admin_impersonation_mode');
      const userData = localStorage.getItem('impersonated_user');
      const adminData = localStorage.getItem('admin_session_backup');

      if (impersonationMode === 'true' && userData && adminData) {
        try {
          const user = JSON.parse(userData);
          const admin = JSON.parse(adminData);
          
          setImpersonatedUser(user);
          setAdminBackup(admin);
          setIsImpersonating(true);
        } catch (error) {
          console.error('Erro ao carregar dados de impersonação:', error);
          clearImpersonationMode();
        }
      }
    };

    checkImpersonationMode();
  }, []);

  const clearImpersonationMode = () => {
    localStorage.removeItem('admin_impersonation_mode');
    localStorage.removeItem('impersonated_user');
    localStorage.removeItem('admin_session_backup');
    setIsImpersonating(false);
    setImpersonatedUser(null);
    setAdminBackup(null);
  };

  const handleReturnToAdmin = () => {
    clearImpersonationMode();
    
    toast({
      title: "Retornando ao Admin",
      description: "Voltando ao painel administrativo...",
      variant: "default",
    });

    // Redirecionar para o painel admin
    setTimeout(() => {
      window.location.href = '/admin';
    }, 1000);
  };

  if (!isImpersonating || !impersonatedUser) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-lg border-b-2 border-red-400">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-yellow-300" />
              <AlertTriangle className="h-5 w-5 text-yellow-300" />
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-sm">
                <span className="font-semibold">MODO ADMIN ATIVO:</span>
                <span className="ml-2">Acessando conta de</span>
                <span className="ml-1 font-bold text-yellow-300">
                  {impersonatedUser.name}
                </span>
              </div>
              
              <div className="text-xs opacity-90">
                <span>Email:</span>
                <span className="ml-1 font-mono">{impersonatedUser.email}</span>
              </div>
              
              <div className="text-xs opacity-90">
                <span>Saldo:</span>
                <span className="ml-1 font-bold">${impersonatedUser.balance?.toLocaleString() || '0'}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="text-xs opacity-90">
              <span>Admin:</span>
              <span className="ml-1 font-mono">{adminBackup?.email}</span>
            </div>
            
            <Button
              onClick={handleReturnToAdmin}
              className="bg-white text-red-600 hover:bg-gray-100 font-semibold px-4 py-2 rounded-lg flex items-center space-x-2 transition-all duration-200 hover:scale-105"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Voltar ao Admin</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminImpersonationBanner;

