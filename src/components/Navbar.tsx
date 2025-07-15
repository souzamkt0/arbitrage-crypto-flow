import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp,
  Users,
  BarChart3, 
  History, 
  Settings, 
  Image, 
  LogOut,
  Menu,
  X,
  Shield,
  PiggyBank,
  MessageSquare,
  Bot,
  Wallet,
  ArrowDown,
  Gift
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();

  const navItems = [
    { path: "/dashboard", label: "Dashboard", icon: BarChart3 },
    { path: "/bot", label: "Bot", icon: Bot },
    { path: "/deposit", label: "Depósito", icon: Wallet },
    { path: "/withdrawal", label: "Saque", icon: ArrowDown },
    { path: "/market", label: "Mercado", icon: TrendingUp },
    { path: "/investments", label: "Investimentos", icon: PiggyBank },
    { path: "/bonus", label: "Bônus", icon: Gift },
    { path: "/community", label: "Comunidade", icon: MessageSquare },
    { path: "/referrals", label: "Indicações", icon: Users },
    { path: "/history", label: "Histórico", icon: History },
    { path: "/admin", label: "Admin", icon: Shield },
    { path: "/settings", label: "Configurações", icon: Settings },
  ];

  const handleLogout = () => {
    localStorage.removeItem("alphabit_user");
    localStorage.removeItem("binance_api_key");
    localStorage.removeItem("binance_secret_key");
    toast({
      title: "Logout realizado",
      description: "Você foi desconectado com sucesso",
    });
    navigate("/login");
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-card border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
        <div className="flex justify-between h-14 sm:h-16">
          <div className="flex items-center">
            {/* Logo */}
            <Link to="/dashboard" className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8 text-primary" />
              <span className="text-base sm:text-lg lg:text-2xl font-bold text-primary">Alphabit</span>
              <Badge variant="secondary" className="hidden sm:inline-flex ml-2 text-xs">
                v1.0
              </Badge>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-6 xl:space-x-8">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-2 px-2 lg:px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive(item.path)
                      ? "text-primary bg-primary/10"
                      : "text-muted-foreground hover:text-card-foreground hover:bg-secondary"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden xl:inline">{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Right Side */}
          <div className="hidden lg:flex items-center space-x-4">
            <Button
              onClick={handleLogout}
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-destructive"
            >
              <LogOut className="h-4 w-4 mr-2" />
              <span className="hidden xl:inline">Sair</span>
            </Button>
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden flex items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(!isOpen)}
              className="text-card-foreground"
            >
              {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="lg:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 bg-card border-t border-border max-h-screen overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center space-x-3 px-3 py-3 rounded-md text-base font-medium transition-colors ${
                    isActive(item.path)
                      ? "text-primary bg-primary/10"
                      : "text-muted-foreground hover:text-card-foreground hover:bg-secondary"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
            <div className="border-t border-border pt-3 mt-3">
              <Button
                onClick={() => {
                  handleLogout();
                  setIsOpen(false);
                }}
                variant="ghost"
                className="w-full justify-start text-muted-foreground hover:text-destructive px-3 py-3"
              >
                <LogOut className="h-5 w-5 mr-3" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;