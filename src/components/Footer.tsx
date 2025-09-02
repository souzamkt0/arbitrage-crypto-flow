import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Settings, 
  Wallet,
  User,
  ArrowDown,
  Zap
} from 'lucide-react';

const Footer = () => {
  const location = useLocation();
  
  // Nova versão compacta (5 itens) – evita overflow em telas estreitas
  // Ordem solicitada: Início, Depósito, Trading (centro), Saque, Perfil
  const menuItems = [
    { icon: Home, label: 'Início', path: '/dashboard' },
    { icon: Wallet, label: 'Depósito', path: '/deposit' },
    { icon: Zap, label: 'Trading', path: '/investments' },
    { icon: ArrowDown, label: 'Saque', path: '/withdrawal' },
    { icon: User, label: 'Perfil', path: '/settings' }
  ];

  return (
    <footer className="fixed bottom-0 left-0 right-0 z-50 bg-menu-black/95 backdrop-blur-md border-t border-menu-yellow/20 md:hidden">
      <div className="px-2 py-2">
        <div className="grid grid-cols-5 items-end justify-items-center gap-0 w-full mx-auto max-w-screen">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={index}
                to={item.path}
                className={`group flex flex-col items-center justify-center w-full px-2 py-1 rounded-xl transition-all duration-200 ${index === 2 ? 'relative' : 'hover:bg-menu-yellow/10'}`}
              >
                {index === 2 ? (
                  // Botão central destacado (Depósito)
                  <div className="-mt-6 mb-0 flex flex-col items-center">
                    <div className={`h-12 w-12 rounded-full bg-gradient-to-br from-menu-yellow to-amber-400 shadow-[0_6px_20px_rgba(240,185,11,0.35)] flex items-center justify-center border border-menu-yellow/40 ${isActive ? 'scale-105' : ''}`}>
                      <Icon className="h-5 w-5 text-black" />
                    </div>
                    <span className={`text-[11px] mt-1 font-semibold ${isActive ? 'text-menu-yellow' : 'text-menu-gray'}`}>{item.label}</span>
                  </div>
                ) : (
                  <>
                    <div className="relative">
                      <Icon 
                        className={`h-5 w-5 transition-all duration-200 ${
                          isActive 
                            ? 'text-menu-yellow scale-110' 
                            : 'text-menu-gray hover:text-menu-yellow group-hover:scale-105'
                        }`} 
                      />
                      {isActive && (
                        <div className="absolute -bottom-0.5 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-menu-yellow rounded-full" />
                      )}
                    </div>
                    
                    <span className={`text-[11px] mt-1 font-medium transition-colors duration-200 ${
                      isActive 
                        ? 'text-menu-yellow' 
                        : 'text-menu-gray hover:text-menu-yellow'
                    }`}>
                      {item.label}
                    </span>
                  </>
                )}
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