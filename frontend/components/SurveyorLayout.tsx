"use client";

import React, { ReactNode, useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import LogoutConfirmationDialog from "./LogoutConfirmationDialog";

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
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  const handleLogoutClick = () => {
    setShowLogoutDialog(true);
  };

  const handleLogoutConfirm = () => {
    setShowLogoutDialog(false);
    handleLogout();
  };

  const handleLogoutCancel = () => {
    setShowLogoutDialog(false);
  };

  if (fullScreen) {
    return (
      <div className="w-full h-screen bg-slate-950 text-slate-200 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto bg-slate-950 p-2 sm:p-4">
          <div className="w-full h-full max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full bg-slate-950 text-slate-200 font-sans overflow-hidden">
      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative md:pb-0">
        {/* Header with top-right logout */}
        <header className="h-16 border-b border-slate-800 flex items-center justify-between px-4 md:px-8 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-20">
          <div>
            <span className="text-sm text-slate-400">Welcome back, <span className="text-white font-medium">{username || "Surveyor"}</span></span>
          </div>
          <button
            onClick={handleLogoutClick}
            className="flex items-center gap-2 px-3 py-1.5 text-sm text-slate-300 hover:text-red-400 transition-colors cursor-pointer"
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
      
      <LogoutConfirmationDialog 
        isOpen={showLogoutDialog}
        onConfirm={handleLogoutConfirm}
        onCancel={handleLogoutCancel}
      />
    </div>
  );
};
