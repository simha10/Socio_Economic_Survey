"use client";

import React, { ReactNode, useState } from 'react';
import { LayoutDashboard, Map, Menu, X, FileText, Users, Settings } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  href: string;
  active?: boolean;
}

const NavItem = ({ icon, label, href, active }: NavItemProps) => {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
        active
          ? "bg-primary/10 text-blue-500"
          : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
      )}
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
};

interface LayoutSkeletonProps {
  children: ReactNode;
}

export default function LayoutSkeleton({ children }: LayoutSkeletonProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  // Helper to determine if a link is active
  const isActive = (path: string) => pathname === path;

  return (
    <div className="flex h-screen w-full bg-slate-950 text-slate-200 font-sans overflow-hidden">
      {/* Sidebar: Fixed width, sticky on desktop */}
      <aside className="w-64 shrink-0 border-r border-slate-800 bg-slate-900 hidden md:flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-slate-800">
          <span className="text-xl font-bold tracking-tight text-blue-500">SES System</span>
        </div>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <div className="mb-4 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Main
          </div>
          <NavItem 
            icon={<LayoutDashboard size={18} />} 
            label="Dashboard" 
            href="/dashboard"
            active={isActive('/dashboard')} 
          />
           <NavItem 
            icon={<Map size={18} />} 
            label="Slum Data" 
            href="/slums"
            active={isActive('/slums')} 
          />
          <NavItem 
            icon={<FileText size={18} />} 
            label="Surveys" 
            href="/surveys"
            active={isActive('/surveys') || pathname?.startsWith('/surveys')} 
          />
          
          <div className="mt-8 mb-4 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Administration
          </div>
          <NavItem 
            icon={<Users size={18} />} 
            label="Users" 
            href="/users"
            active={isActive('/users')} 
          />
          <NavItem 
            icon={<Settings size={18} />} 
            label="Settings" 
            href="/settings"
            active={isActive('/settings')} 
          />
        </nav>
        
        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xs">
              JD
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">John Doe</p>
              <p className="text-xs text-slate-500 truncate">Admin</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Mobile Header (Visible only on small screens) */}
        <header className="md:hidden h-16 border-b border-slate-800 flex items-center justify-between px-4 bg-slate-900 shrink-0">
          <span className="text-lg font-bold tracking-tight text-blue-500">SES System</span>
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 text-slate-400 hover:text-white"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </header>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="absolute inset-0 z-50 bg-slate-950/95 backdrop-blur-sm md:hidden flex flex-col p-4 animate-fade-in">
             <div className="flex justify-end mb-4">
               <button 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 text-slate-400 hover:text-white"
                >
                  <X size={24} />
                </button>
             </div>
             <nav className="space-y-2">
                <NavItem 
                  icon={<LayoutDashboard size={20} />} 
                  label="Dashboard" 
                  href="/dashboard"
                  active={isActive('/dashboard')} 
                />
                <NavItem 
                  icon={<Map size={20} />} 
                  label="Slum Data" 
                  href="/slums"
                  active={isActive('/slums')} 
                />
                <NavItem 
                  icon={<FileText size={20} />} 
                  label="Surveys" 
                  href="/surveys"
                  active={isActive('/surveys')} 
                />
                <NavItem 
                  icon={<Users size={20} />} 
                  label="Users" 
                  href="/users"
                  active={isActive('/users')} 
                />
             </nav>
          </div>
        )}

        {/* Scrollable Content Canvas */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
          <div className="max-w-7xl mx-auto space-y-8 animate-slide-up">
            {/* Page Content Injected Here */}
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
