"use client";

import React, { ReactNode } from "react";
import { SidebarProvider, useSidebar } from "@/contexts/SidebarContext";
import Sidebar from "@/components/Sidebar";
import BottomNav from "@/components/BottomNav";

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
  return (
    <SidebarProvider>
      <LayoutContent username={username} fullScreen={fullScreen}>
        {children}
      </LayoutContent>
    </SidebarProvider>
  );
}

const LayoutContent = ({
  children,
  username,
  fullScreen,
}: SurveyorLayoutProps) => {
  const { isSidebarOpen } = useSidebar();

  if (fullScreen) {
    return (
      <div className="w-full h-screen bg-slate-950 text-[#E5E7EB] flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto bg-slate-950">
          <div className="w-full h-full">{children}</div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex bg-slate-950 min-h-screen text-[#E5E7EB] overflow-hidden">
      {/* Sidebar - Flex Item */}
      <Sidebar role="SURVEYOR" username={username} />

      {/* Main Content Area - Flex Item */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative w-0 min-w-0">
        {/* Header - Clean structure with proper spacing */}
        <header className="sticky top-0 z-20 bg-[#111827] border-b border-slate-800">
          <div className="px-6 md:px-8 py-4 md:py-5 flex items-center justify-between">
            <div>
              <h1 className="text-lg md:text-xl font-bold text-[#38BDF8]">
                SES System
              </h1>
            </div>
            <div className="text-xs md:text-sm text-[#9CA3AF] flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-white border border-slate-700">
                {username?.charAt(0) || "S"}
              </div>
              <span className="hidden md:inline">{username || "Surveyor"}</span>
            </div>
          </div>
        </header>

        {/* Page Content - Structured with proper padding */}
        <main className="flex-1 overflow-y-auto bg-slate-950">
          <div className="px-4 md:px-8 lg:px-12 py-8 md:py-10 max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>

      {/* Bottom Navigation - Mobile only */}
      <BottomNav />
    </div>
  );
};
