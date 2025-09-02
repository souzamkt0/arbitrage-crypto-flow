import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { 
  User,
  Lock,
  Users,
  Crown,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Shield,
  Trash2,
  AlertTriangle,
  DollarSign,
  TrendingUp,
  Activity,
  Award,
  Info,
  HelpCircle,
  BookOpen,
  FileText,
  CheckCircle,
  Edit
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const Settings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, profile, signOut } = useAuth();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [referralCount, setReferralCount] = useState(0);
  const [activeInvestments, setActiveInvestments] = useState(0);
  const [totalEarnings, setTotalEarnings] = useState(0);

  // Carregar estatísticas do usuário
  useEffect(() => {
    const loadUserStats = async () => {
      if (!user) return;

      try {
        // Contar indicações
        const { count: refCount } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .eq('referred_by', profile?.referral_code);
        
        setReferralCount(refCount || 0);

        // Contar investimentos ativos
        const { data: investments } = await supabase
          .from('user_investments')
          .select('*')
          .eq('user_id', user.id)
          .eq('status', 'active');
        
        setActiveInvestments(investments?.length || 0);

        // Calcular ganhos totais
        const total = (profile?.balance || 0) + (profile?.total_profit || 0) + (profile?.referral_balance || 0);
        setTotalEarnings(total);
      } catch (error) {
        console.error('Erro ao carregar estatísticas:', error);
      }
    };

    loadUserStats();
  }, [user, profile]);

  const isAdmin = profile?.role === 'admin';

  const handlePasswordChange = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast({
        title: "Erro!",
        description: "Todos os campos são obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "Erro!",
        description: "As senhas não coincidem.",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: "Erro!",
        description: "A nova senha deve ter pelo menos 6 caracteres.",
        variant: "destructive",
      });
      return;
    }

    setIsChangingPassword(true);

    try {
      // Primeiro, verificar a senha atual fazendo login
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user?.email || '',
        password: currentPassword,
      });

      if (signInError) {
        toast({
          title: "Erro!",
          description: "Senha atual incorreta.",
          variant: "destructive",
        });
        return;
      }

      // Atualizar a senha
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (updateError) {
        toast({
          title: "Erro!",
          description: `Erro ao alterar senha: ${updateError.message}`,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Senha alterada!",
        description: "Sua senha foi atualizada com sucesso.",
      });
      
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      toast({
        title: "Erro!",
        description: "Erro inesperado ao alterar senha.",
        variant: "destructive",
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;

    setIsDeletingAccount(true);

    try {
      // Primeiro, deletar o perfil do usuário
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('user_id', user.id);

      if (profileError) {
        console.error('Erro ao deletar perfil:', profileError);
      }

      // Deletar outros dados relacionados (investimentos, depósitos, etc.)
      await Promise.all([
        supabase.from('user_investments').delete().eq('user_id', user.id),
        supabase.from('deposits').delete().eq('user_id', user.id),
        supabase.from('withdrawals').delete().eq('user_id', user.id),
        supabase.from('community_posts').delete().eq('user_id', user.id),
      ]);

      // Por último, fazer logout (o usuário ainda existirá no auth.users, mas sem dados)
      await signOut();

      toast({
        title: "Conta excluída!",
        description: "Sua conta e todos os dados foram removidos com sucesso.",
      });

      navigate('/login');
    } catch (error) {
      toast({
        title: "Erro!",
        description: "Erro ao excluir conta. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsDeletingAccount(false);
    }
  };

  // Usar dados reais do usuário autenticado
  const userInfo = {
    name: profile?.display_name || profile?.first_name || profile?.username || "Usuário",
    email: user?.email || profile?.email || "email@exemplo.com",
    phone: profile?.whatsapp || "Não informado",
    cpf: profile?.cpf || "Não informado",
    joinDate: profile?.created_at ? new Date(profile.created_at).toLocaleDateString('pt-BR') : "Não informado",
    referralCode: profile?.referral_code || "Não disponível",
    referrals: referralCount,
    activePlans: activeInvestments,
    communityRank: profile?.role === 'admin' ? 'Administrador' : profile?.role === 'partner' ? 'Sócio' : 'Membro',
    totalEarnings: totalEarnings,
    balance: profile?.balance || 0,
    profitBalance: profile?.total_profit || 0,
    referralBalance: profile?.referral_balance || 0,
    status: profile?.status || 'active'
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-black p-2 sm:p-4">
      <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6">
        {/* Header - Tema amarelo/preto */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-3 bg-gradient-to-r from-yellow-500/20 to-amber-500/20 border border-yellow-500/30 px-6 py-3 rounded-xl backdrop-blur-sm">
            <User className="h-6 w-6 text-yellow-400" />
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-yellow-400">Meu Perfil</h1>
              <p className="text-xs sm:text-sm text-yellow-300/70">Informações da conta e configurações</p>
            </div>
          </div>
        </div>

        {/* Profile Overview Card - Tema amarelo/preto */}
        <Card className="bg-gradient-to-br from-zinc-900/90 to-black/90 border-yellow-500/20 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-yellow-500/10 to-amber-500/10 border-b border-yellow-500/20">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-yellow-500 to-amber-600 rounded-full flex items-center justify-center">
                  <User className="h-8 w-8 sm:h-10 sm:w-10 text-black" />
                </div>
                <div>
                  <CardTitle className="text-xl sm:text-2xl text-yellow-400">{userInfo.name}</CardTitle>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                      {userInfo.communityRank}
                    </Badge>
                    <Badge className={`${userInfo.status === 'active' ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-red-500/20 text-red-400 border-red-500/30'}`}>
                      {userInfo.status === 'active' ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </div>
                </div>
              </div>
              <Button 
                variant="outline"
                onClick={() => navigate('/edit-profile')}
                className="border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/20"
              >
                <Edit className="h-4 w-4 mr-2" />
                Editar Perfil
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Saldo Total */}
              <div className="bg-zinc-900/60 rounded-lg p-3 border border-yellow-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="h-4 w-4 text-yellow-400" />
                  <p className="text-xs text-yellow-300/70">Saldo Total</p>
                </div>
                <p className="text-lg sm:text-xl font-bold text-yellow-400">
                  ${userInfo.totalEarnings.toFixed(2)}
                </p>
              </div>

              {/* Indicações */}
              <div className="bg-zinc-900/60 rounded-lg p-3 border border-yellow-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="h-4 w-4 text-yellow-400" />
                  <p className="text-xs text-yellow-300/70">Indicações</p>
                </div>
                <p className="text-lg sm:text-xl font-bold text-yellow-400">
                  {userInfo.referrals}
                </p>
              </div>

              {/* Investimentos */}
              <div className="bg-zinc-900/60 rounded-lg p-3 border border-yellow-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-yellow-400" />
                  <p className="text-xs text-yellow-300/70">Investimentos</p>
                </div>
                <p className="text-lg sm:text-xl font-bold text-yellow-400">
                  {userInfo.activePlans}
                </p>
              </div>

              {/* Membro Desde */}
              <div className="bg-zinc-900/60 rounded-lg p-3 border border-yellow-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="h-4 w-4 text-yellow-400" />
                  <p className="text-xs text-yellow-300/70">Membro Desde</p>
                </div>
                <p className="text-sm sm:text-base font-medium text-yellow-400">
                  {userInfo.joinDate}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Informações Pessoais */}
          <Card className="bg-gradient-to-br from-zinc-900/90 to-black/90 border-yellow-500/20">
            <CardHeader className="bg-gradient-to-r from-yellow-500/10 to-amber-500/10 border-b border-yellow-500/20">
              <CardTitle className="flex items-center gap-2 text-yellow-400">
                <Shield className="h-5 w-5" />
                Informações Pessoais
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-yellow-400" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-yellow-200">{userInfo.email}</p>
                    <p className="text-xs text-yellow-300/50">Email</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-yellow-400" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-yellow-200">{userInfo.phone}</p>
                    <p className="text-xs text-yellow-300/50">WhatsApp</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <FileText className="h-4 w-4 text-yellow-400" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-yellow-200">{userInfo.cpf}</p>
                    <p className="text-xs text-yellow-300/50">CPF</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Award className="h-4 w-4 text-yellow-400" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-yellow-200">{userInfo.referralCode}</p>
                    <p className="text-xs text-yellow-300/50">Código de Indicação</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Detalhes de Saldos */}
          <Card className="bg-gradient-to-br from-zinc-900/90 to-black/90 border-yellow-500/20">
            <CardHeader className="bg-gradient-to-r from-yellow-500/10 to-amber-500/10 border-b border-yellow-500/20">
              <CardTitle className="flex items-center gap-2 text-yellow-400">
                <DollarSign className="h-5 w-5" />
                Detalhes Financeiros
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 space-y-4">
              <div className="space-y-3">
                <div className="p-3 bg-zinc-900/60 rounded-lg border border-yellow-500/20">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-yellow-300/70">Saldo Principal</span>
                    <Activity className="h-3 w-3 text-yellow-400" />
                  </div>
                  <p className="text-lg font-bold text-yellow-400">${userInfo.balance.toFixed(2)}</p>
                </div>
                
                <div className="p-3 bg-zinc-900/60 rounded-lg border border-yellow-500/20">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-yellow-300/70">Lucros Acumulados</span>
                    <TrendingUp className="h-3 w-3 text-green-400" />
                  </div>
                  <p className="text-lg font-bold text-green-400">${userInfo.profitBalance.toFixed(2)}</p>
                </div>
                
                <div className="p-3 bg-zinc-900/60 rounded-lg border border-yellow-500/20">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-yellow-300/70">Saldo de Indicações</span>
                    <Users className="h-3 w-3 text-blue-400" />
                  </div>
                  <p className="text-lg font-bold text-blue-400">${userInfo.referralBalance.toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Como Funciona o Sistema */}
        <Card className="bg-gradient-to-br from-zinc-900/90 to-black/90 border-yellow-500/20">
          <CardHeader className="bg-gradient-to-r from-yellow-500/10 to-amber-500/10 border-b border-yellow-500/20">
            <CardTitle className="flex items-center gap-2 text-yellow-400">
              <Info className="h-5 w-5" />
              Como Funciona o Sistema
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Passo 1 */}
              <div className="bg-zinc-900/60 rounded-lg p-4 border border-yellow-500/20">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-yellow-500 to-amber-600 rounded-full flex items-center justify-center">
                    <span className="text-black font-bold">1</span>
                  </div>
                  <h4 className="font-semibold text-yellow-400">Faça um Depósito</h4>
                </div>
                <p className="text-xs sm:text-sm text-yellow-300/70">
                  Deposite via PIX e seu saldo será creditado automaticamente para começar a investir.
                </p>
              </div>

              {/* Passo 2 */}
              <div className="bg-zinc-900/60 rounded-lg p-4 border border-yellow-500/20">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-yellow-500 to-amber-600 rounded-full flex items-center justify-center">
                    <span className="text-black font-bold">2</span>
                  </div>
                  <h4 className="font-semibold text-yellow-400">Escolha um Plano</h4>
                </div>
                <p className="text-xs sm:text-sm text-yellow-300/70">
                  Selecione entre nossos planos de investimento com diferentes rentabilidades.
                </p>
              </div>

              {/* Passo 3 */}
              <div className="bg-zinc-900/60 rounded-lg p-4 border border-yellow-500/20">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-yellow-500 to-amber-600 rounded-full flex items-center justify-center">
                    <span className="text-black font-bold">3</span>
                  </div>
                  <h4 className="font-semibold text-yellow-400">Receba Lucros</h4>
                </div>
                <p className="text-xs sm:text-sm text-yellow-300/70">
                  Acompanhe seus rendimentos diários e faça saques quando desejar.
                </p>
              </div>
            </div>

            {/* Benefícios */}
            <div className="mt-6 p-4 bg-yellow-500/10 rounded-lg border border-yellow-500/25">
              <h4 className="font-semibold text-yellow-400 mb-3 flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Benefícios do Sistema
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm text-yellow-300/70">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full"></div>
                  <span>Rendimentos diários automáticos</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full"></div>
                  <span>Sistema de indicações com bônus</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full"></div>
                  <span>Saques rápidos via PIX</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full"></div>
                  <span>Suporte 24/7</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Alterar Senha */}
        <Card className="bg-gradient-to-br from-zinc-900/90 to-black/90 border-yellow-500/20">
          <CardHeader className="bg-gradient-to-r from-yellow-500/10 to-amber-500/10 border-b border-yellow-500/20">
            <CardTitle className="flex items-center gap-2 text-yellow-400">
              <Lock className="h-5 w-5" />
              Segurança da Conta
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="current-password" className="text-yellow-400 text-sm">Senha Atual</Label>
                <Input
                  id="current-password"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Digite sua senha atual"
                  className="bg-zinc-900/70 border-yellow-500/30 text-yellow-100 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="new-password" className="text-yellow-400 text-sm">Nova Senha</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Digite a nova senha"
                  className="bg-zinc-900/70 border-yellow-500/30 text-yellow-100 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirm-password" className="text-yellow-400 text-sm">Confirmar Senha</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirme a nova senha"
                  className="bg-zinc-900/70 border-yellow-500/30 text-yellow-100 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20"
                />
              </div>
            </div>
            
            <div className="flex justify-end">
              <Button 
                onClick={handlePasswordChange} 
                disabled={isChangingPassword}
                className="bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 text-black font-semibold border border-yellow-500/30"
              >
                <Lock className="h-4 w-4 mr-2" />
                {isChangingPassword ? "Alterando..." : "Alterar Senha"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Zona de Perigo - Apenas para Admin */}
        {isAdmin && (
          <Card className="bg-gradient-to-br from-red-900/20 to-black/90 border-red-500/30">
            <CardHeader className="bg-gradient-to-r from-red-500/10 to-red-600/10 border-b border-red-500/20">
              <CardTitle className="flex items-center gap-2 text-red-400">
                <AlertTriangle className="h-5 w-5" />
                Zona de Perigo (Admin)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <p className="font-medium text-red-400">Excluir Conta</p>
                  <p className="text-sm text-red-300/70">
                    Esta ação é irreversível. Todos os dados serão permanentemente removidos.
                  </p>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button 
                      variant="destructive" 
                      disabled={isDeletingAccount}
                      className="bg-red-600 hover:bg-red-700 text-white"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      {isDeletingAccount ? "Excluindo..." : "Excluir Conta"}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="bg-zinc-900 border-red-500/30">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-red-400">Tem certeza absoluta?</AlertDialogTitle>
                      <AlertDialogDescription className="text-red-300/70">
                        Esta ação não pode ser desfeita. Isso excluirá permanentemente sua conta
                        e removerá todos os seus dados de nossos servidores.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="border-red-500/30 text-red-400 hover:bg-red-500/20">
                        Cancelar
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDeleteAccount}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Sim, excluir permanentemente
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
        )}

        {/* FAQ */}
        <Card className="bg-gradient-to-br from-zinc-900/90 to-black/90 border-yellow-500/20">
          <CardHeader className="bg-gradient-to-r from-yellow-500/10 to-amber-500/10 border-b border-yellow-500/20">
            <CardTitle className="flex items-center gap-2 text-yellow-400">
              <HelpCircle className="h-5 w-5" />
              Perguntas Frequentes
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <div className="space-y-4">
              <div className="p-4 bg-zinc-900/60 rounded-lg border border-yellow-500/20">
                <h4 className="font-semibold text-yellow-400 mb-2">Como faço para sacar meus lucros?</h4>
                <p className="text-xs sm:text-sm text-yellow-300/70">
                  Acesse a página de Saques, escolha entre PIX ou USDT e solicite seu saque. O processamento é feito em até 24h úteis.
                </p>
              </div>
              
              <div className="p-4 bg-zinc-900/60 rounded-lg border border-yellow-500/20">
                <h4 className="font-semibold text-yellow-400 mb-2">Qual o valor mínimo para investir?</h4>
                <p className="text-xs sm:text-sm text-yellow-300/70">
                  O valor mínimo varia de acordo com o plano escolhido. Verifique na página de Investimentos os valores de cada plano.
                </p>
              </div>
              
              <div className="p-4 bg-zinc-900/60 rounded-lg border border-yellow-500/20">
                <h4 className="font-semibold text-yellow-400 mb-2">Como funciona o sistema de indicações?</h4>
                <p className="text-xs sm:text-sm text-yellow-300/70">
                  Compartilhe seu código de indicação e ganhe bônus quando seus indicados realizarem investimentos.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings;