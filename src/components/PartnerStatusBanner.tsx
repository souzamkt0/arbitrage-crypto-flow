import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Crown, Shield, DollarSign, Users, RefreshCw, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface PartnerStatus {
  isPartner: boolean;
  isAdmin: boolean;
  partnerData?: {
    commission_percentage: number;
    total_earnings: number;
    total_deposits: number;
    status: string;
  };
  totalPlatformDeposits: number;
}

export const PartnerStatusBanner = () => {
  const { user } = useAuth();
  const [partnerStatus, setPartnerStatus] = useState<PartnerStatus>({
    isPartner: false,
    isAdmin: false,
    totalPlatformDeposits: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      checkPartnerStatus();
    }
  }, [user]);

  const checkPartnerStatus = async () => {
    try {
      setLoading(true);
      console.log('🔍 Iniciando verificação de status de sócio para usuário:', user?.id);

      // Verificar se é admin e sócio
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('role, email')
        .eq('user_id', user?.id)
        .single();

      console.log('📊 Dados do perfil:', profileData);
      console.log('⚠️ Erro do perfil:', profileError);

      if (!profileData) {
        console.log('❌ Perfil não encontrado');
        return;
      }

      const isAdmin = profileData.role === 'admin';
      console.log('👑 É admin?', isAdmin);
      console.log('📧 Email do perfil:', profileData.email);

      // Verificar se é sócio
      const { data: partnerData, error: partnerError } = await supabase
        .from('partners')
        .select('*')
        .eq('email', profileData.email)
        .eq('status', 'active')
        .single();

      console.log('🤝 Dados do sócio:', partnerData);
      console.log('⚠️ Erro do sócio:', partnerError);

      // Também verificar sem filtro de status para debug
      const { data: allPartnerData, error: allPartnerError } = await supabase
        .from('partners')
        .select('*')
        .eq('email', profileData.email);

      console.log('🔍 Todos os dados de sócio para este email:', allPartnerData);
      console.log('⚠️ Erro na busca completa:', allPartnerError);

      const isPartner = !!partnerData;
      console.log('🎯 É sócio?', isPartner);

      // Calcular total de depósitos da plataforma
      const { data: depositsData, error: depositsError } = await supabase
        .from('deposits')
        .select('amount_usd')
        .eq('status', 'paid');

      console.log('💰 Dados de depósitos:', depositsData);
      console.log('⚠️ Erro de depósitos:', depositsError);

      const totalDeposits = depositsData?.reduce((sum, deposit) => 
        sum + (deposit.amount_usd || 0), 0) || 0;

      console.log('📈 Total de depósitos calculado:', totalDeposits);

      setPartnerStatus({
        isPartner,
        isAdmin,
        partnerData: partnerData || undefined,
        totalPlatformDeposits: totalDeposits
      });

      console.log('✅ Status final definido:', {
        isAdmin,
        isPartner,
        partnerData,
        totalDeposits,
        showBanner: isAdmin || isPartner
      });

    } catch (error) {
      console.error('❌ Erro ao verificar status:', error);
    } finally {
      setLoading(false);
    }
  };

  // Se o usuário não estiver logado, não mostrar nada
  if (!user) {
    console.log('❌ Usuário não logado, não exibindo banner');
    return null;
  }

  // Se não for admin nem sócio, não mostrar nada
  if (!partnerStatus.isAdmin && !partnerStatus.isPartner) {
    console.log('❌ Usuário não é admin nem sócio, não exibindo banner:', {
      isAdmin: partnerStatus.isAdmin,
      isPartner: partnerStatus.isPartner,
      loading
    });
    return null;
  }

  if (loading) {
    return (
      <Card className="mb-6 bg-gradient-to-r from-primary/10 to-warning/10 border-primary/20">
        <CardContent className="p-4">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            <span className="ml-2 text-sm text-muted-foreground">Verificando status...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const calculatePartnerEarnings = () => {
    if (!partnerStatus.partnerData) return 0;
    return partnerStatus.totalPlatformDeposits * (partnerStatus.partnerData.commission_percentage / 100);
  };

  return (
    <Card className="mb-6 bg-gradient-to-r from-primary/20 to-warning/20 border-2 border-primary/40 shadow-lg">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              {partnerStatus.isAdmin && (
                <Badge variant="destructive" className="flex items-center gap-1 text-sm px-3 py-1">
                  <Shield className="h-4 w-4" />
                  Administrador
                </Badge>
              )}
              {partnerStatus.isPartner && (
                <Badge className="flex items-center gap-1 bg-gradient-to-r from-primary to-warning text-primary-foreground text-sm px-3 py-1 shadow-md">
                  <Crown className="h-4 w-4" />
                  🎯 SÓCIO VIP
                </Badge>
              )}
            </div>
          </div>

          <Button
            onClick={checkPartnerStatus}
            variant="outline"
            size="sm"
            className="border-primary/50 hover:bg-primary/10"
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>

        {partnerStatus.isPartner && (
          <div className="space-y-4">
            {/* Contador Principal de Ganhos */}
            <div className="text-center p-6 bg-gradient-to-r from-success/10 to-trading-green/10 rounded-xl border border-success/20">
              <div className="text-3xl font-bold text-success mb-2">
                ${calculatePartnerEarnings().toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <div className="text-lg font-semibold text-muted-foreground mb-1">
                💰 Ganhos com 1% dos Depósitos
              </div>
              <div className="text-sm text-muted-foreground">
                📈 Total da Plataforma: ${partnerStatus.totalPlatformDeposits.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
            </div>

            {/* Informações Detalhadas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-primary/5 rounded-lg border border-primary/20">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <DollarSign className="h-5 w-5 text-primary" />
                  <span className="font-semibold text-primary">Comissão</span>
                </div>
                <div className="text-2xl font-bold text-primary">
                  {partnerStatus.partnerData?.commission_percentage || 1}%
                </div>
              </div>
              
              <div className="text-center p-4 bg-secondary/20 rounded-lg border border-secondary/40">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Users className="h-5 w-5 text-secondary-foreground" />
                  <span className="font-semibold text-secondary-foreground">Status</span>
                </div>
                <div className="text-lg font-bold text-secondary-foreground">
                  {partnerStatus.partnerData?.status === 'active' ? '✅ Ativo' : '❌ Inativo'}
                </div>
              </div>
              
              <div className="text-center p-4 bg-warning/10 rounded-lg border border-warning/20">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Crown className="h-5 w-5 text-warning" />
                  <span className="font-semibold text-warning">Nível</span>
                </div>
                <div className="text-lg font-bold text-warning">
                  VIP
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};