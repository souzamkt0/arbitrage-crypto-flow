import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { 
  Users, 
  DollarSign, 
  Search, 
  Copy, 
  Link,
  Phone,
  TrendingUp,
  UserCheck,
  UserX,
  Filter,
  Eye,
  MessageCircle,
  Settings,
  User,
  Key,
  LogOut,
  Menu,
  ArrowLeft,
  Activity,
  Bell,
  Zap,
  Shield,
  Crown,
  Target,
  Rocket,
  Star,
  Gift,
  LineChart,
  PieChart,
  BarChart3,
  Layers,
  Network,
  Share2,
  Globe,
  Smartphone,
  Mail,
  Calendar,
  Award,
  CheckCircle,
  AlertTriangle,
  TrendingDown,
  Hash,
  Download,
  Upload,
  RefreshCw,
  Plus,
  Minus,
  Info
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ResidualEarnings from "@/components/ResidualEarnings";
import { TradingChart } from "@/components/TradingChart";
import { MarketOverview } from "@/components/MarketOverview";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Progress } from "@/components/ui/progress";

interface ReferredUser {
  id: string;
  name: string;
  email: string;
  whatsapp: string;
  plan: string;
  investmentAmount: number;
  commission: number;
  status: "active" | "inactive";
  joinDate: string;
  lastActivity: string;
}

const Referrals = () => {
  console.log('🚀 Referrals component loading...');
  
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [referralLink, setReferralLink] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [whatsappFilter, setWhatsappFilter] = useState<"all" | "with" | "without">("all");
  const [referredUsers, setReferredUsers] = useState<ReferredUser[]>([]);
  const [stats, setStats] = useState({
    totalReferrals: 0,
    activeReferrals: 0,
    totalCommission: 0,
    pendingCommission: 0,
    withWhatsapp: 0,
    withoutWhatsapp: 0
  });
  const [profile, setProfile] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    console.log('🚀 useEffect Referrals iniciado');
    console.log('🔍 User atual:', user);
    
    const loadReferralData = async () => {
      if (!user) {
        console.log('❌ Sem usuário, saindo...');
        return;
      }

      try {
        console.log('🔍 Debug Referrals - User ID:', user.id);
        console.log('🔍 Debug Referrals - User Email:', user.email);
        
        // Get user profile with referral code for referral link
        console.log('🔍 Buscando profile para user_id:', user.id);
        const { data: userProfile, error: profileError } = await supabase
          .from('profiles')
          .select('username, referral_code, referral_balance, display_name')
          .eq('user_id', user.id)
          .maybeSingle();

        console.log('🔍 Debug Referrals - Profile encontrado:', userProfile);
        console.log('🔍 Debug Referrals - Profile Error:', profileError);
        
        setProfile(userProfile);

        if (userProfile?.referral_code) {
          const userName = userProfile.display_name || userProfile.username || 'Usuário';
          setReferralLink(`${window.location.origin}/register?ref=${userProfile.referral_code}&name=${encodeURIComponent(userName)}`);
        } else if (userProfile?.username) {
          const userName = userProfile.display_name || userProfile.username || 'Usuário';
          setReferralLink(`${window.location.origin}/register?ref=${userProfile.username}&name=${encodeURIComponent(userName)}`);
        }

        // Buscar usuários indicados
        console.log('🔍 Debug Referrals - Buscando usuários indicados por:', user.id);
        
        const { data: referredUsers, error: referralsError } = await supabase
          .from('profiles')
          .select(`
            user_id,
            username, 
            display_name, 
            email, 
            whatsapp, 
            city, 
            state, 
            created_at,
            status,
            balance,
            total_profit,
            referred_by
          `)
          .eq('referred_by', user.id)
          .order('created_at', { ascending: false });

        console.log('🔍 Debug Referrals - Usuários indicados encontrados:', referredUsers);
        
        if (referredUsers && referredUsers.length > 0) {
          // Calculate stats based on real data
          const activeReferrals = referredUsers.filter(user => user.status === 'active').length;
          const totalCommission = referredUsers.reduce((sum, user) => sum + (user.total_profit || 0) * 0.1, 0); // 10% commission
          
          setStats({
            totalReferrals: referredUsers.length,
            activeReferrals,
            totalCommission,
            pendingCommission: 0,
            withWhatsapp: referredUsers.filter(user => user.whatsapp).length,
            withoutWhatsapp: referredUsers.filter(user => !user.whatsapp).length
          });

          // Convert to the expected format
          const convertedUsers: ReferredUser[] = referredUsers.map((user) => ({
            id: user.user_id,
            name: user.display_name || user.username || 'Usuário',
            email: user.email || '',
            whatsapp: user.whatsapp || '',
            plan: 'Alphabot Pro',
            investmentAmount: user.balance || 0,
            commission: (user.total_profit || 0) * 0.1, // 10% commission
            status: user.status as "active" | "inactive",
            joinDate: user.created_at,
            lastActivity: user.created_at
          }));

          setReferredUsers(convertedUsers);
        } else {
          // Reset all stats to zero
          setStats({
            totalReferrals: 0,
            activeReferrals: 0,
            totalCommission: 0,
            pendingCommission: 0,
            withWhatsapp: 0,
            withoutWhatsapp: 0
          });
          setReferredUsers([]);
        }
      } catch (error) {
        console.error('Erro ao carregar dados de referência:', error);
      }
    };
    
    loadReferralData();
  }, [user]);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      toast({
        title: "✅ LINK COPIED!",
        description: "Your referral link has been copied to clipboard",
      });
    } catch (err) {
      toast({
        title: "Copy Error",
        description: "Could not copy the link",
        variant: "destructive",
      });
    }
  };

  const filteredUsers = referredUsers.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.plan.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || user.status === statusFilter;
    
    const matchesWhatsapp = whatsappFilter === "all" || 
                           (whatsappFilter === "with" && user.whatsapp) ||
                           (whatsappFilter === "without" && !user.whatsapp);
    
    return matchesSearch && matchesStatus && matchesWhatsapp;
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const sendWhatsAppMessage = (whatsapp: string, userName: string) => {
    if (!whatsapp) {
      toast({
        title: "❌ WhatsApp unavailable",
        description: "This user doesn't have WhatsApp registered",
        variant: "destructive"
      });
      return;
    }

    const cleanWhatsApp = whatsapp.replace(/\D/g, '');
    const referrerName = profile?.display_name || profile?.username || 'Alphabit Team';
    
    const message = `Hello ${userName}! 

Welcome to Alphabit! 🚀

I'm ${referrerName} and I'm excited to have you with us!

What you get here:
• Automatic arbitrage system
• Safe and profitable investments
• 24/7 support
• Exclusive trader community

Tip: Start exploring the Dashboard and see how our system works. I'm here to help you every step of the way!

Need help? Just message me!

Success!
${referrerName}
Alphabit Team`;
    
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/55${cleanWhatsApp}?text=${encodedMessage}`;
    
    window.open(whatsappUrl, '_blank');
    
    toast({
      title: "✅ Message sent!",
      description: `Message sent to ${userName}`,
    });
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900">
        {/* Trading Header */}
        <div className="bg-gradient-to-r from-slate-800/90 to-slate-900/90 backdrop-blur-sm border-b border-purple-500/20 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Left Section */}
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate(-1)}
                  className="hover:bg-purple-500/10 text-purple-400 border border-purple-500/20 p-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                    <Network className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-white">REFERRAL SYSTEM</h1>
                    <p className="text-xs text-gray-400">Advanced affiliate dashboard</p>
                  </div>
                </div>
              </div>

              {/* Center Section - Status */}
              <div className="hidden md:flex items-center gap-4">
                <div className="flex items-center gap-2 px-3 py-1 bg-green-500/20 rounded-full">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-green-400 text-sm font-medium">SYSTEM ONLINE</span>
                </div>
                
                <div className="flex items-center gap-2 px-3 py-1 bg-purple-500/20 rounded-full">
                  <Activity className="h-4 w-4 text-purple-400" />
                  <span className="text-purple-400 text-sm font-medium">REAL-TIME</span>
                </div>
              </div>

              {/* Right Section */}
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                  <Bell className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Referrals */}
            <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 hover-scale">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400 mb-2">Total Referrals</p>
                    <p className="text-3xl font-bold text-purple-400">{stats.totalReferrals}</p>
                    <p className="text-xs text-gray-500 mt-1">Network size</p>
                  </div>
                  <div className="p-3 bg-purple-500/20 rounded-xl">
                    <Users className="h-8 w-8 text-purple-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Active Users */}
            <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 hover-scale">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400 mb-2">Active Users</p>
                    <p className="text-3xl font-bold text-green-400">{stats.activeReferrals}</p>
                    <p className="text-xs text-gray-500 mt-1">Trading now</p>
                  </div>
                  <div className="p-3 bg-green-500/20 rounded-xl">
                    <UserCheck className="h-8 w-8 text-green-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Total Commission */}
            <Card className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 hover-scale">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400 mb-2">Total Earned</p>
                    <p className="text-3xl font-bold text-yellow-400">{formatCurrency(stats.totalCommission)}</p>
                    <p className="text-xs text-gray-500 mt-1">All time</p>
                  </div>
                  <div className="p-3 bg-yellow-500/20 rounded-xl">
                    <DollarSign className="h-8 w-8 text-yellow-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Conversion Rate */}
            <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20 hover-scale">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400 mb-2">Conversion</p>
                    <p className="text-3xl font-bold text-blue-400">
                      {stats.totalReferrals > 0 ? Math.round((stats.activeReferrals / stats.totalReferrals) * 100) : 0}%
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Success rate</p>
                  </div>
                  <div className="p-3 bg-blue-500/20 rounded-xl">
                    <TrendingUp className="h-8 w-8 text-blue-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Left Sidebar - Market Data */}
            <div className="lg:col-span-1 space-y-6">
              <MarketOverview />
              
              {/* Referral Progress */}
              <Card className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-sm border border-purple-500/20">
                <CardHeader className="border-b border-purple-500/20">
                  <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
                    <Target className="h-5 w-5 text-purple-400" />
                    Progress
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-sm">Bronze → Silver</span>
                      <span className="text-white font-medium">{stats.totalReferrals}/10</span>
                    </div>
                    <Progress value={(stats.totalReferrals / 10) * 100} className="h-2" />
                    <p className="text-xs text-gray-500">7 more referrals to Silver tier</p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Crown className="h-4 w-4 text-yellow-400" />
                      <span className="text-sm text-yellow-400">Bronze Level</span>
                    </div>
                    <p className="text-xs text-gray-400">10% commission rate</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Content Area */}
            <div className="lg:col-span-2 space-y-6">
              {/* Referral Link Section - Moved above chart */}
              <Card className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-sm border border-purple-500/20 overflow-hidden">
                <CardHeader className="border-b border-purple-500/20 bg-gradient-to-r from-purple-500/10 to-pink-500/10">
                  <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
                    <Link className="h-5 w-5 text-purple-400" />
                    YOUR REFERRAL LINK
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-4 bg-slate-700/50 rounded-lg border border-purple-500/20">
                      <Input
                        value={referralLink}
                        readOnly
                        className="flex-1 bg-transparent border-none text-white font-mono text-sm focus:ring-0 focus:border-none"
                      />
                      <Button
                        onClick={copyToClipboard}
                        className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white px-6 transition-all duration-300 hover:scale-105"
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        COPY
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <Button
                        onClick={() => {
                          const message = `🚀 Join Alphabit and start earning with automated trading!\n\n${referralLink}\n\n✅ Professional arbitrage system\n✅ Guaranteed daily profits\n✅ 24/7 support\n\nStart today!`;
                          const encodedMessage = encodeURIComponent(message);
                          window.open(`https://wa.me/?text=${encodedMessage}`, '_blank');
                        }}
                        className="bg-green-600 hover:bg-green-700 text-white transition-all duration-300 hover:scale-105"
                      >
                        <Phone className="h-4 w-4 mr-2" />
                        WhatsApp
                      </Button>
                      
                      <Button
                        onClick={() => {
                          const tweetText = `🚀 Discover Alphabit: The future of automated trading!\n\n${referralLink}\n\n#Trading #Crypto #Profit #Arbitrage`;
                          window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`, '_blank');
                        }}
                        className="bg-blue-500 hover:bg-blue-600 text-white transition-all duration-300 hover:scale-105"
                      >
                        <Share2 className="h-4 w-4 mr-2" />
                        Share
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Trading Chart */}
              <TradingChart />

              {/* Referral Interface */}
              <Card className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-sm border border-purple-500/20">
                <CardHeader className="bg-gradient-to-r from-purple-600/10 to-pink-600/10 border-b border-purple-500/20">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg">
                        <Share2 className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-lg font-bold text-white">
                          Referral Terminal
                        </CardTitle>
                        <p className="text-sm text-gray-400">Share your link and earn commissions</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <div className="px-3 py-1 bg-purple-500/20 rounded-full text-purple-400 text-xs font-medium">
                        ACTIVE
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-6">
                  <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-3 mb-6 bg-slate-800/50 border border-slate-600/30 p-1">
                      <TabsTrigger 
                        value="overview" 
                        className="flex items-center space-x-2 data-[state=active]:bg-purple-500 data-[state=active]:text-white"
                      >
                        <BarChart3 className="h-4 w-4" />
                        <span className="font-medium">Overview</span>
                      </TabsTrigger>
                      <TabsTrigger 
                        value="link" 
                        className="flex items-center space-x-2 data-[state=active]:bg-pink-500 data-[state=active]:text-white"
                      >
                        <Link className="h-4 w-4" />
                        <span className="font-medium">Share Link</span>
                      </TabsTrigger>
                      <TabsTrigger 
                        value="users" 
                        className="flex items-center space-x-2 data-[state=active]:bg-blue-500 data-[state=active]:text-white"
                      >
                        <Users className="h-4 w-4" />
                        <span className="font-medium">My Team</span>
                      </TabsTrigger>
                    </TabsList>

                    {/* Overview Tab */}
                    <TabsContent value="overview" className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-xl">
                          <div className="flex items-center gap-3 mb-3">
                            <Rocket className="h-5 w-5 text-purple-400" />
                            <h4 className="font-semibold text-white">Performance</h4>
                          </div>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-400">Click Rate</span>
                              <span className="text-white">95.2%</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Sign-up Rate</span>
                              <span className="text-white">
                                {stats.totalReferrals > 0 ? Math.round((stats.activeReferrals / stats.totalReferrals) * 100) : 0}%
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Avg. Investment</span>
                              <span className="text-white">$250</span>
                            </div>
                          </div>
                        </div>

                        <div className="p-4 bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-xl">
                          <div className="flex items-center gap-3 mb-3">
                            <Award className="h-5 w-5 text-green-400" />
                            <h4 className="font-semibold text-white">Rewards</h4>
                          </div>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-400">This Month</span>
                              <span className="text-green-400">{formatCurrency(stats.totalCommission * 0.3)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">This Week</span>
                              <span className="text-green-400">{formatCurrency(stats.totalCommission * 0.1)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Today</span>
                              <span className="text-green-400">{formatCurrency(stats.totalCommission * 0.02)}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-xl p-4">
                        <div className="flex items-start space-x-3">
                          <Info className="h-5 w-5 text-blue-400 mt-1" />
                          <div>
                            <h4 className="font-semibold text-blue-400 mb-2">How it works:</h4>
                            <ul className="text-gray-300 space-y-1 text-sm">
                              <li>• Share your referral link with friends</li>
                              <li>• Earn 10% commission on their investments</li>
                              <li>• Get instant notifications for new sign-ups</li>
                              <li>• Track your team's performance in real-time</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    {/* Share Link Tab */}
                    <TabsContent value="link" className="space-y-6">
                      <div className="text-center mb-4">
                        <div className="inline-flex items-center space-x-3 bg-purple-500/20 border border-purple-500/30 px-4 py-2 rounded-full">
                          <Globe className="h-4 w-4 text-purple-400" />
                          <span className="text-purple-400 font-medium">Your Referral Link</span>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="relative">
                          <Input
                            value={referralLink}
                            readOnly
                            className="pr-12 bg-slate-800/60 border-purple-500/30 text-white h-12 font-mono text-sm"
                          />
                          <Button
                            onClick={copyToClipboard}
                            className="absolute right-2 top-2 bg-purple-500 hover:bg-purple-600 text-white px-3 h-8"
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <Button 
                            className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-bold h-12"
                          >
                            <Share2 className="h-4 w-4 mr-2" />
                            Share Link
                          </Button>
                          
                          <Button 
                            variant="outline"
                            className="border-purple-500/30 text-purple-400 hover:bg-purple-500/10 h-12"
                          >
                            <Download className="h-4 w-4 mr-2" />
                            QR Code
                          </Button>
                        </div>

                        <div className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-xl p-4">
                          <div className="flex items-start space-x-3">
                            <Gift className="h-5 w-5 text-yellow-400 mt-1" />
                            <div>
                              <h4 className="font-semibold text-yellow-400 mb-2">Share & Earn:</h4>
                              <ul className="text-gray-300 space-y-1 text-sm">
                                <li>• 10% commission on all referral investments</li>
                                <li>• Lifetime earnings from your network</li>
                                <li>• Bonus rewards for active referrals</li>
                                <li>• Exclusive access to VIP features</li>
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    {/* Users Tab */}
                    <TabsContent value="users" className="space-y-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <div className="relative">
                            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input
                              placeholder="Search users..."
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                              className="pl-10 bg-slate-800/60 border-purple-500/30 text-white"
                            />
                          </div>
                          
                          <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
                            <SelectTrigger className="w-32 bg-slate-800/60 border-purple-500/30 text-white">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-800 border-purple-500/30">
                              <SelectItem value="all">All</SelectItem>
                              <SelectItem value="active">Active</SelectItem>
                              <SelectItem value="inactive">Inactive</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <Button variant="outline" size="sm" className="border-purple-500/30 text-purple-400">
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Refresh
                        </Button>
                      </div>

                      {filteredUsers.length > 0 ? (
                        <div className="space-y-3">
                          {filteredUsers.map((user) => (
                            <Card key={user.id} className="bg-slate-800/50 border-slate-600/30 hover:border-purple-500/30 transition-colors">
                              <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center">
                                      <span className="text-white font-bold text-sm">
                                        {user.name.charAt(0).toUpperCase()}
                                      </span>
                                    </div>
                                    <div>
                                      <p className="font-medium text-white">{user.name}</p>
                                      <div className="flex items-center gap-2 text-sm text-gray-400">
                                        <span>{user.email}</span>
                                        {user.status === 'active' ? (
                                          <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Active</Badge>
                                        ) : (
                                          <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30">Inactive</Badge>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                  
                                  <div className="flex items-center gap-2">
                                    <div className="text-right">
                                      <p className="text-sm font-medium text-white">{formatCurrency(user.commission)}</p>
                                      <p className="text-xs text-gray-400">Commission</p>
                                    </div>
                                    
                                    {user.whatsapp && (
                                      <Button
                                        size="sm"
                                        onClick={() => sendWhatsAppMessage(user.whatsapp, user.name)}
                                        className="bg-green-600 hover:bg-green-700 text-white"
                                      >
                                        <MessageCircle className="h-4 w-4" />
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-12">
                          <div className="p-6 bg-gradient-to-br from-gray-500/10 to-slate-500/10 border border-gray-500/20 rounded-xl inline-block">
                            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-400 text-lg font-medium">No team members yet</p>
                            <p className="text-gray-500 mt-2">Start sharing your referral link to build your team</p>
                          </div>
                        </div>
                      )}
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>

            {/* Right Sidebar - Residual Earnings */}
            <div className="lg:col-span-1 space-y-6">
              <ResidualEarnings />
              
              {/* Top Performers */}
              <Card className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-sm border border-yellow-500/20">
                <CardHeader className="border-b border-yellow-500/20">
                  <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
                    <Star className="h-5 w-5 text-yellow-400" />
                    Top Performers
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  {[1, 2, 3].map((rank) => (
                    <div key={rank} className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        rank === 1 ? 'bg-yellow-500/20 text-yellow-400' :
                        rank === 2 ? 'bg-gray-400/20 text-gray-400' :
                        'bg-orange-500/20 text-orange-400'
                      }`}>
                        <span className="font-bold text-sm">#{rank}</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-white font-medium">Trading Master {rank}</p>
                        <p className="text-xs text-gray-400">{50 - rank * 10} referrals</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-green-400">{formatCurrency(5000 - rank * 1000)}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default Referrals;