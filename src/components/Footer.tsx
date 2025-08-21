import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  TrendingUp, 
  Users, 
  Settings, 
  BarChart3, 
  Wallet
} from 'lucide-react';

const Footer = () => {
  const location = useLocation();
  
  const menuItems = [
    {
      icon: Home,
      label: 'Início',
      path: '/dashboard'
    },
    {
      icon: TrendingUp,
      label: 'Indicações',
      path: '/referrals'
    },
    {
      icon: BarChart3,
      label: 'Contratos',
      path: '/investments'
    },
    {
      icon: Users,
      label: 'Comunidade',
      path: '/community'
    },
    {
      icon: Wallet,
      label: 'Carteira',
      path: '/history'
    },
    {
      icon: Settings,
      label: 'Config',
      path: '/settings'
    }
  ];

  return (
    <footer className="fixed bottom-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-md border-t border-white/10 md:hidden">
      <div className="px-2 py-1">
        <div className="flex items-center justify-around">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={index}
                to={item.path}
                className="group flex flex-col items-center justify-center p-1 transition-all duration-200"
              >
                <div className="relative">
                  <Icon 
                    className={`h-4 w-4 transition-all duration-200 ${
                      isActive 
                        ? 'text-yellow-500 scale-110' 
                        : 'text-gray-400 group-hover:text-white group-hover:scale-105'
                    }`} 
                  />
                  {isActive && (
                    <div className="absolute -bottom-0.5 left-1/2 transform -translate-x-1/2 w-0.5 h-0.5 bg-yellow-500 rounded-full" />
                  )}
                </div>
                
                <span className={`text-[10px] mt-0.5 transition-colors duration-200 ${
                  isActive 
                    ? 'text-yellow-500 font-medium' 
                    : 'text-gray-500 group-hover:text-gray-300'
                }`}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
      
      {/* Safe area for devices with home indicator */}
      <div className="h-safe-area-inset-bottom" />
    </footer>
  );
};

export default Footer;