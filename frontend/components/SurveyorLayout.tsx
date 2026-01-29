"use client";

import React, { ReactNode } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LogOut } from "lucide-react";

interface SurveyorLayoutProps {
  children: ReactNode;
  username?: string;
  fullScreen?: boolean;
}

export default function SurveyorLayout({
  children,
  username,
  fullScreen = false,
}: SurveyorLayoutProps) {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  if (fullScreen) {
    return (
      <div className="w-full h-screen bg-slate-950 text-slate-200 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto bg-slate-950 p-4">
          <div className="w-full h-full max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full bg-slate-950 text-slate-200 font-sans overflow-hidden">
      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative pb-20 md:pb-0">
        {/* Header with top-right logout */}
        <header className="h-16 border-b border-slate-800 flex items-center justify-between px-4 md:px-8 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-20">
          <div>
            <span className="text-sm text-slate-400">Welcome back, <span className="text-white font-medium">{username || "Surveyor"}</span></span>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-1.5 text-sm text-slate-300 hover:text-red-400 transition-colors"
            title="Logout"
          >
            <LogOut size={18} />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </header>

        {/* Scrollable Content Canvas */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {children}
          </div>
        </div>
      </main>
      
      {/* Bottom Navigation for mobile */}
      <div className="md:hidden fixed bottom-0 left-0 right-0">
        <nav className="bg-slate-900 border-t border-slate-800 flex items-center justify-around h-20 z-40">
          <Link href="/surveyor/dashboard" className="flex flex-col items-center gap-1 px-4 py-2 transition-colors text-slate-400 hover:text-cyan-400">
            <span className="text-2xl">📊</span>
            <span className="text-xs font-medium">Dashboard</span>
          </Link>
          <Link href="/surveyor/slums" className="flex flex-col items-center gap-1 px-4 py-2 transition-colors text-slate-400 hover:text-cyan-400">
            <span className="text-2xl">🏘️</span>
            <span className="text-xs font-medium">Slums</span>
          </Link>
          <Link href="/surveyor/profile" className="flex flex-col items-center gap-1 px-4 py-2 transition-colors text-slate-400 hover:text-cyan-400">
            <span className="text-2xl">👤</span>
            <span className="text-xs font-medium">Profile</span>
          </Link>
          <button
            onClick={handleLogout}
            className="flex flex-col items-center gap-1 px-4 py-2 transition-colors text-slate-400 hover:text-red-400"
          >
            <LogOut size={20} />
            <span className="text-xs font-medium">Logout</span>
          </button>
        </nav>
      </div>
    </div>
  );
};
