"use client";

import React, { ReactNode } from "react";
import { SidebarProvider } from "@/contexts/SidebarContext";
import Sidebar from "@/components/Sidebar";

interface SupervisorAdminLayoutProps {
  children: ReactNode;
  role: "SUPERVISOR" | "ADMIN";
  username?: string;
}

export default function SupervisorAdminLayout({
  children,
  role,
  username,
}: SupervisorAdminLayoutProps) {
  return (
    <SidebarProvider>
      <LayoutContent role={role} username={username}>
        {children}
      </LayoutContent>
    </SidebarProvider>
  );
}

const LayoutContent = ({
  children,
  role,
  username,
}: SupervisorAdminLayoutProps) => {
  return (
    <div className="flex h-screen w-full bg-slate-950 text-slate-200 font-sans overflow-hidden">
      {/* Sidebar */}
      <Sidebar role={role} username={username} />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative bg-slate-950">
        <header className="h-16 border-b border-slate-800 flex items-center justify-between px-6 md:px-8 bg-slate-950/80 backdrop-blur-md sticky top-0 z-20">
          <div className="ml-10 md:ml-0 flex flex-col justify-center">
            <h1 className="text-lg font-bold text-white tracking-tight leading-tight">
              {role === "ADMIN" ? "Admin Dashboard" : "Supervisor Panel"}
            </h1>
          </div>
        </header>

        {/* Scrollable Content Canvas */}
        <div className="flex-1 overflow-y-auto p-6 md:p-10 scrollbar-none">
          <div className="max-w-7xl mx-auto space-y-10 animate-fade-in">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};
