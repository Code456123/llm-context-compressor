import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  Zap, 
  History, 
  BarChart3, 
  Settings, 
  Cpu, 
  Sliders
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const location = useLocation();

  const navItems = [
    {
      name: 'Dashboard',
      path: '/dashboard',
      icon: LayoutDashboard,
    },
    {
      name: 'Compression',
      path: '/dashboard/upload',
      icon: Zap,
    },
    {
      name: 'History',
      path: '/dashboard/history',
      icon: History,
    },
    {
      name: 'Analytics',
      path: '/dashboard/analytics',
      icon: BarChart3,
    },
    {
      name: 'Settings',
      path: '/dashboard/settings',
      icon: Settings,
    },
  ];

  return (
    <aside className="sticky top-14 z-30 flex flex-col justify-between border-r border-white/10 bg-[#08090A] w-14 h-[calc(100vh-3.5rem)] py-4 items-center shrink-0">
      {/* Top Navigation Icons */}
      <div className="flex flex-col items-center gap-3 w-full px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            location.pathname === item.path ||
            (item.path !== '/dashboard' && location.pathname.startsWith(item.path));

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`group relative flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'bg-white text-black font-bold shadow-[0_0_15px_rgba(255,255,255,0.2)]'
                  : 'text-zinc-400 hover:bg-white/10 hover:text-white'
              }`}
              title={item.name}
            >
              <Icon className="h-4 w-4 shrink-0" />

              {/* Tooltip on hover */}
              <div className="absolute left-14 px-2.5 py-1 rounded-md bg-zinc-900 border border-white/10 text-white text-xs font-mono opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 shadow-xl">
                {item.name}
              </div>

              {/* Active Indicator Bar */}
              {isActive && (
                <motion.div
                  layoutId="activeSideRail"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-white rounded-r-full"
                />
              )}
            </NavLink>
          );
        })}
      </div>

      {/* Bottom status badge */}
      <div className="flex flex-col items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" title="Engine Operational" />
      </div>
    </aside>
  );
};
