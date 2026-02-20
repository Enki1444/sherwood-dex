import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Link, useLocation } from 'react-router-dom';
import { ArrowLeftRight, Droplets, BarChart3 } from 'lucide-react';

export function Header() {
  const location = useLocation();
  
  const navItems = [
    { path: '/', label: 'Swap', icon: ArrowLeftRight },
    { path: '/liquidity', label: 'Liquidity', icon: Droplets },
    { path: '/analytics', label: 'Analytics', icon: BarChart3 },
  ];

  return (
    <header className="border-b border-emerald-500/20 bg-gray-900/50 backdrop-blur-xl">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center">
                🏹
              </div>
              <span className="text-xl font-bold text-white">Sherwood</span>
            </Link>
            
            <nav className="flex gap-2">
              {navItems.map(({ path, label, icon: Icon }) => (
                <Link
                  key={path}
                  to={path}
                  className={`
                    flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all
                    ${location.pathname === path 
                      ? 'bg-emerald-500/20 text-emerald-400' 
                      : 'text-gray-400 hover:text-white hover:bg-gray-800'}
                  `}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </Link>
              ))}
            </nav>
          </div>
          
          <ConnectButton />
        </div>
      </div>
    </header>
  );
}
