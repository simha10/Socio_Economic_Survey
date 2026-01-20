"use client";

import React, { ReactNode } from "react";
import { SidebarProvider, useSidebar } from "@/contexts/SidebarContext";
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
  const { isSidebarOpen } = useSidebar();

  return (
    <div className="flex bg-[#0B1F33] min-h-screen text-[#E5E7EB] overflow-hidden">
      {/* Sidebar - Flex Item */}
      <Sidebar role={role} username={username} />

      {/* Main Content Area - Flex Item */}
      <div
        className="flex-1 flex flex-col h-screen overflow-hidden relative w-0 min-w-0"
      >
        {/* Header - Clean structure with proper spacing */}
        <header className="sticky top-0 z-20 bg-[#111827] border-b border-slate-800">
          <div className="px-6 md:px-8 py-4 md:py-5 flex items-center justify-between">
            <div>
              <h1 className="text-lg md:text-2xl font-bold text-[#38BDF8]">
                {role === "ADMIN" ? "Admin Dashboard" : "Supervisor Dashboard"}
              </h1>
              <p className="text-xs md:text-sm text-[#9CA3AF] mt-1">
                {role === "ADMIN"
                  ? "Manage users, slums, and monitor system activity"
                  : "Manage your team and track survey progress"}
              </p>
            </div>
            <div className="text-xs md:text-sm text-[#9CA3AF]">
              {username || "User"}
            </div>
          </div>
        </header>

        {/* Page Content - Structured with proper padding */}
        <main className="flex-1 overflow-y-auto bg-[#0B1F33]">
          <div className="px-4 md:px-6 lg:px-8 py-6 md:py-8 max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
