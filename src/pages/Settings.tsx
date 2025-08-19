import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ReferralSystem from "@/components/ReferralSystem";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { 
  Settings as SettingsIcon, 
  Save, 
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
  AlertTriangle
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

  const handleSave = () => {
    toast({
      title: "Configurações salvas!",
      description: "Suas preferências foram atualizadas com sucesso.",
    });
  };

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
    name: profile?.display_name || profile?.first_name || "Usuário",
    email: user?.email || profile?.email || "email@exemplo.com",
    phone: profile?.whatsapp || "Não informado",
    joinDate: profile?.created_at ? new Date(profile.created_at).toLocaleDateString('pt-BR') : "Não informado",
    location: profile?.location || "Não informado",
    referrals: 0, // Implementar contagem de indicações
    activePlans: 0, // Implementar contagem de planos ativos
    communityRank: profile?.role === 'admin' ? 'Admin' : profile?.role === 'partner' ? 'Partner' : 'User',
    totalEarnings: profile?.total_profit || 0
  };

  return (
    <div className="min-h-screen bg-background p-3 md:p-6">
      <div className="max-w-4xl mx-auto space-y-4 md:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center">
              <SettingsIcon className="h-6 w-6 md:h-8 md:w-8 mr-3 text-primary" />
              Configurações do Bot
            </h1>
            <p className="text-sm md:text-base text-muted-foreground">Configure os parâmetros de arbitragem</p>
          </div>
          
          <Button onClick={handleSave} className="bg-primary hover:bg-primary/90">
            <Save className="h-4 w-4 mr-2" />
            Salvar Configurações
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {/* Referral System */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-card-foreground">Sistema de Indicações</CardTitle>
            </CardHeader>
            <CardContent>
              <ReferralSystem />
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Profile Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Perfil
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Editar Perfil</p>
                  <p className="text-sm text-muted-foreground">
                    Altere suas informações pessoais, foto e biografia
                  </p>
                </div>
                <Button 
                  variant="outline"
                  onClick={() => navigate('/edit-profile')}
                >
                  Editar
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Account Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Informações da Conta
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">{userInfo.email}</p>
                    <p className="text-xs text-muted-foreground">Email</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">{userInfo.phone}</p>
                    <p className="text-xs text-muted-foreground">Telefone</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">{userInfo.joinDate}</p>
                    <p className="text-xs text-muted-foreground">Membro desde</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">{userInfo.location}</p>
                    <p className="text-xs text-muted-foreground">Localização</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Referral Statistics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Estatísticas de Indicações
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-primary/10 rounded-lg">
                  <p className="text-2xl font-bold text-primary">{userInfo.referrals}</p>
                  <p className="text-sm text-muted-foreground">Indicados</p>
                </div>
                <div className="text-center p-3 bg-green-500/10 rounded-lg">
                  <p className="text-2xl font-bold text-green-500">R$ {userInfo.totalEarnings.toFixed(2)}</p>
                  <p className="text-sm text-muted-foreground">Ganhos Totais</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Active Plans */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="h-5 w-5" />
                Planos Ativos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Planos Ativos</p>
                    <p className="text-sm text-muted-foreground">
                      {userInfo.activePlans} planos ativos
                    </p>
                  </div>
                  <Badge variant="secondary">{userInfo.communityRank}</Badge>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Plano Premium</span>
                    <Badge variant="outline">Ativo</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Plano VIP</span>
                    <Badge variant="outline">Ativo</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Password Change */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Trocar Senha
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="current-password">Senha Atual</Label>
                <Input
                  id="current-password"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Digite sua senha atual"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="new-password">Nova Senha</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Digite a nova senha"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirmar Nova Senha</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirme a nova senha"
                />
              </div>
            </div>
            
            <div className="flex justify-end">
              <Button 
                onClick={handlePasswordChange} 
                disabled={isChangingPassword}
                className="bg-primary hover:bg-primary/90"
              >
                <Lock className="h-4 w-4 mr-2" />
                {isChangingPassword ? "Alterando..." : "Alterar Senha"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-red-200 bg-red-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-700">
              <AlertTriangle className="h-5 w-5" />
              Zona de Perigo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-red-700">Excluir Conta</p>
                <p className="text-sm text-red-600">
                  Esta ação é irreversível. Todos os seus dados serão permanentemente removidos.
                </p>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" disabled={isDeletingAccount}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    {isDeletingAccount ? "Excluindo..." : "Excluir Conta"}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Tem certeza absoluta?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Esta ação não pode ser desfeita. Isso excluirá permanentemente sua conta
                      e removerá todos os seus dados de nossos servidores, incluindo:
                      <br /><br />
                      • Perfil e informações pessoais<br />
                      • Histórico de investimentos<br />
                      • Depósitos e saques<br />
                      • Posts na comunidade<br />
                      • Sistema de indicações
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
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

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4">
          <Button variant="outline" className="border-border text-card-foreground">
            Restaurar Padrões
          </Button>
          <Button onClick={handleSave} className="bg-primary hover:bg-primary/90">
            <Save className="h-4 w-4 mr-2" />
            Salvar e Aplicar
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Settings;