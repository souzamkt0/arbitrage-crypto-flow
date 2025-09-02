import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Settings, 
  Wallet,
  User,
  ArrowDown,
  Zap,
  Sparkles
} from 'lucide-react';

const Footer = () => {
  const location = useLocation();
  const [activeIndex, setActiveIndex] = useState(-1);
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([]);
  
  // Nova versão compacta (5 itens) – evita overflow em telas estreitas
  // Ordem solicitada: Início, Depósito, Trading (centro), Saque, Perfil
  const menuItems = [
    { icon: Home, label: 'Início', path: '/dashboard' },
    { icon: Wallet, label: 'Depósito', path: '/deposit' },
    { icon: Zap, label: 'Trading', path: '/investments' },
    { icon: ArrowDown, label: 'Saque', path: '/withdrawal' },
    { icon: User, label: 'Perfil', path: '/settings' }
  ];

  // Atualizar índice ativo baseado na rota
  useEffect(() => {
    const currentIndex = menuItems.findIndex(item => location.pathname === item.path);
    setActiveIndex(currentIndex);
  }, [location.pathname]);

  // Função para criar efeito ripple
  const createRipple = (e: React.MouseEvent<HTMLAnchorElement>, index: number) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const rippleId = Date.now();
    
    setRipples(prev => [...prev, { id: rippleId, x, y }]);
    
    // Remover ripple após animação
    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== rippleId));
    }, 600);
  };

    return (
    <footer className="fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-t from-black via-zinc-900/95 to-zinc-900/90 backdrop-blur-lg border-t border-menu-yellow/30 md:hidden shadow-[0_-10px_40px_rgba(240,185,11,0.15)]">
      {/* Glow effect animado */}
      <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-menu-yellow to-transparent animate-pulse" />
      
      <div className="px-2 py-2 relative overflow-visible">
        <div className="grid grid-cols-5 items-end justify-items-center gap-0 w-full mx-auto max-w-screen relative">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={index}
                to={item.path}
                onClick={(e) => createRipple(e, index)}
                className={`group relative flex flex-col items-center justify-center w-full px-2 py-1 rounded-xl transition-all duration-300 ${index === 2 ? 'static' : 'hover:bg-menu-yellow/10'} overflow-visible`}
              >
                {/* Ripple effect */}
                {ripples.map(ripple => (
                  <span
                    key={ripple.id}
                    className="absolute bg-menu-yellow/30 rounded-full animate-ripple pointer-events-none"
                    style={{
                      left: ripple.x - 20,
                      top: ripple.y - 20,
                      width: 40,
                      height: 40,
                    }}
                  />
                ))}
                
                {index === 2 ? (
                  // Botão Trading Central - ELEVADO E IMPORTANTE
                  <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 flex flex-col items-center z-[9999]">
                    <div className="relative">
                      {/* Pulso de fundo mais intenso */}
                      <div className="absolute inset-0 h-14 w-14 rounded-full bg-gradient-to-br from-menu-yellow to-amber-400 animate-ping opacity-40" />
                      
                      {/* Anel de destaque */}
                      <div className="absolute inset-0 h-14 w-14 rounded-full bg-gradient-to-br from-menu-yellow/20 to-amber-400/20 animate-pulse" />
                      
                      {/* Botão principal - MAIOR E MAIS IMPORTANTE */}
                      <div className={`relative h-14 w-14 rounded-full bg-gradient-to-br from-menu-yellow via-amber-400 to-yellow-500 shadow-[0_12px_35px_rgba(240,185,11,0.6)] flex items-center justify-center border-3 border-menu-yellow/80 transform transition-all duration-300 ${isActive ? 'scale-115 rotate-15' : 'hover:scale-110 hover:rotate-8'}`}>
                        <Zap className={`h-6 w-6 text-black ${isActive ? 'animate-pulse' : ''}`} />
                        
                        {/* Sparkle effect mais intenso */}
                        {isActive && (
                          <>
                            <Sparkles className="absolute -top-2 -right-2 h-4 w-4 text-menu-yellow animate-sparkle" />
                            <Sparkles className="absolute -bottom-2 -left-2 h-3 w-3 text-amber-300 animate-sparkle-delayed" />
                            <Sparkles className="absolute top-1 left-1 h-2 w-2 text-yellow-200 animate-sparkle" />
                          </>
                        )}
                      </div>
                      
                      {/* Glow effect mais intenso */}
                      {isActive && (
                        <div className="absolute inset-0 h-14 w-14 rounded-full bg-gradient-to-br from-menu-yellow/40 to-amber-400/40 blur-2xl animate-pulse" />
                      )}
                    </div>
                    
                    {/* Label Trading com destaque */}
                    <span className={`text-[11px] mt-2 font-black transition-all duration-300 ${isActive ? 'text-menu-yellow scale-115' : 'text-menu-gray'}`}>
                      Trading
                    </span>
                  </div>
                ) : (
                  <>
                    <div className="relative">
                      {/* Ícone com animação */}
                      <Icon 
                        className={`h-5 w-5 transition-all duration-300 transform ${
                          isActive 
                            ? 'text-menu-yellow scale-110 rotate-0' 
                            : 'text-menu-gray hover:text-menu-yellow group-hover:scale-110 group-hover:-rotate-12'
                        }`} 
                      />
                      
                      {/* Indicador ativo com animação */}
                      {isActive && (
                        <>
                          <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 bg-menu-yellow rounded-full animate-pulse" />
                          <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-menu-yellow/30 rounded-full animate-ping" />
                        </>
                      )}
                      
                      {/* Hover glow */}
                      <div className={`absolute inset-0 rounded-full bg-menu-yellow/20 blur-xl transition-opacity duration-300 ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`} />
                    </div>
                    
                    <span className={`text-[11px] mt-1 font-medium transition-all duration-300 ${
                      isActive 
                        ? 'text-menu-yellow font-bold' 
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
      
      {/* Styles for animations */}
      <style>{`
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px) translateX(0px); opacity: 0.3; }
          33% { transform: translateY(-8px) translateX(2px); opacity: 0.6; }
          66% { transform: translateY(-4px) translateX(-2px); opacity: 0.4; }
        }
        
        @keyframes float-medium {
          0%, 100% { transform: translateY(0px) translateX(0px); opacity: 0.2; }
          50% { transform: translateY(-6px) translateX(-3px); opacity: 0.5; }
        }
        
        @keyframes float-fast {
          0%, 100% { transform: translateY(0px); opacity: 0.25; }
          50% { transform: translateY(-4px); opacity: 0.45; }
        }
        
        @keyframes sparkle {
          0%, 100% { opacity: 0; transform: scale(0) rotate(0deg); }
          50% { opacity: 1; transform: scale(1) rotate(180deg); }
        }
        
        @keyframes sparkle-delayed {
          0%, 100% { opacity: 0; transform: scale(0) rotate(0deg); }
          25%, 75% { opacity: 1; transform: scale(1) rotate(-180deg); }
        }
        
        @keyframes ripple {
          to {
            transform: scale(4);
            opacity: 0;
          }
        }
        
        .animate-float-slow { animation: float-slow 6s ease-in-out infinite; }
        .animate-float-medium { animation: float-medium 4s ease-in-out infinite; }
        .animate-float-fast { animation: float-fast 3s ease-in-out infinite; }
        .animate-sparkle { animation: sparkle 2s ease-in-out infinite; }
        .animate-sparkle-delayed { animation: sparkle-delayed 2s ease-in-out infinite 0.5s; }
        .animate-ripple { animation: ripple 0.6s ease-out; }
      `}</style>
    </footer>
  );
};

export default Footer;