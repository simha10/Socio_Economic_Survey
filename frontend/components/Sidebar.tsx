"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React, { useState } from "react";
import { useSidebar } from "@/contexts/SidebarContext";
import { LogOut, Menu, X } from "lucide-react";

interface SidebarProps {
  role: "SUPERVISOR" | "ADMIN" | "SURVEYOR";
  username?: string;
}

const supervisorItems = [
  { href: "/supervisor/dashboard", label: "Dashboard", icon: "📊" },
  { href: "/supervisor/slums", label: "Slums", icon: "🏘️" },
  { href: "/supervisor/assignments", label: "Assignments", icon: "📋" },
  { href: "/supervisor/progress", label: "Progress", icon: "📈" },
];

const adminItems = [
  { href: "/admin/dashboard", label: "Dashboard", icon: "📊" },
  { href: "/admin/users", label: "Users", icon: "👥" },
  { href: "/admin/slums", label: "Slums", icon: "🏘️" },
  { href: "/admin/assignments", label: "Assignments", icon: "📋" },
];

const surveyorItems = [
  { href: "/surveyor/dashboard", label: "Dashboard", icon: "📊" },
  { href: "/surveyor/slums", label: "Slums", icon: "🏘️" },
];

export default function Sidebar({ role, username }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const items =
    role === "ADMIN"
      ? adminItems
      : role === "SUPERVISOR"
        ? supervisorItems
        : surveyorItems;

  const { isSidebarOpen, toggleSidebar, closeSidebar, openSidebar } =
    useSidebar();
  const [mobileIsOpen, setMobileIsOpen] = useState(false);

  const handleLogout = async () => {
    // Clear auth token
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`
          hidden md:flex flex-col relative h-screen ${isSidebarOpen ? "w-64" : "w-20"}
          bg-gradient-to-b from-[#0f1419] to-[#111827] border-r border-slate-800/60 z-40
          flex-shrink-0 transition-all duration-300 shadow-2xl
        `}
      >
        {/* Toggle Button for Collapsed State */}
        <div
          className={`p-4 flex ${isSidebarOpen ? "justify-end" : "justify-center"} border-b border-slate-800/50`}
        >
          <button
            onClick={toggleSidebar}
            className="text-[#9CA3AF] hover:text-[#38BDF8] p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            {isSidebarOpen ? (
              <Menu className="w-5 h-5" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
        {/* Logo Section - Fixed height */}
        {isSidebarOpen && (
          <div className="h-16 flex items-center px-6 border-b border-slate-700/40 space-x-3 flex-shrink-0 bg-gradient-to-r from-slate-900/50 to-transparent">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#38BDF8] via-blue-500 to-blue-600 flex items-center justify-center font-bold text-white text-sm shadow-lg shadow-blue-500/30">
              S
            </div>
            <h1 className="text-lg font-bold tracking-tight bg-gradient-to-r from-[#38BDF8] to-blue-400 bg-clip-text text-transparent truncate">
              SES System
            </h1>
          </div>
        )}

        {/* Navigation Links - Scrollable */}
        <nav className="flex-1 px-4 py-6 space-y-3 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
          {items.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                flex items-center gap-3 px-4 py-3 rounded-xl 
                transition-all duration-300 group relative
                ${
                  isActive
                    ? "bg-gradient-to-r from-[#38BDF8] to-blue-600 text-white shadow-lg shadow-blue-900/40"
                    : "text-[#9CA3AF] hover:bg-slate-800/60 hover:text-[#E5E7EB]"
                }
              `}
                title={item.label}
              >
                <span className="text-lg flex-shrink-0">{item.icon}</span>
                {isSidebarOpen && (
                  <span className="text-sm font-medium truncate">
                    {item.label}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Profile Section - Fixed at bottom */}
        <div className="p-4 border-t border-slate-700/40 space-y-3 flex-shrink-0 bg-gradient-to-t from-slate-900/30 to-transparent">
          {isSidebarOpen && (
            <>
              {/* User Info */}
              <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-br from-slate-800/40 to-slate-900/20 border border-slate-700/40 hover:border-slate-600/60 transition-all duration-300">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#38BDF8] via-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-lg shadow-blue-500/30">
                  {role.charAt(0)}
                </div>
                <div className="flex-1 min-w-0 truncate">
                  <p className="text-sm font-semibold text-[#E5E7EB] truncate">
                    {username || "User"}
                  </p>
                  <p className="text-xs text-[#6B7280] truncate capitalize font-medium">
                    {role === "ADMIN"
                      ? "Administrator"
                      : role === "SUPERVISOR"
                        ? "Supervisor"
                        : "Surveyor"}
                  </p>
                </div>
              </div>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-slate-800/30 to-red-900/20 hover:from-red-600/30 hover:to-red-700/20 text-[#9CA3AF] hover:text-[#FCA5A5] rounded-xl font-medium transition-all duration-300 border border-slate-700/40 hover:border-red-600/50"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm">Logout</span>
              </button>
            </>
          )}
        </div>
      </aside>

      {/* Mobile Sidebar Toggle Button */}
      <button
        onClick={() => setMobileIsOpen(!mobileIsOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-[#111827] border border-slate-700 rounded-lg text-[#38BDF8]"
      >
        {mobileIsOpen ? (
          <X className="w-5 h-5" />
        ) : (
          <Menu className="w-5 h-5" />
        )}
      </button>

      {/* Mobile Sidebar Overlay */}
      {mobileIsOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setMobileIsOpen(false)}
        />
      )}

      {/* Mobile Sidebar Drawer */}
      <aside
        className={`
        md:hidden fixed left-0 top-0 h-screen w-64 bg-gradient-to-b from-[#0f1419] to-[#111827] border-r border-slate-800/60 z-40
        transform transition-transform duration-300 ease-in-out shadow-2xl
        ${mobileIsOpen ? "translate-x-0" : "-translate-x-full"}
      `}
      >
        {/* Mobile Logo Section */}
        <div className="h-16 flex items-center px-6 border-b border-slate-700/40 space-x-3 flex-shrink-0 bg-gradient-to-r from-slate-900/50 to-transparent">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#38BDF8] via-blue-500 to-blue-600 flex items-center justify-center font-bold text-white text-sm shadow-lg shadow-blue-500/30">
            S
          </div>
          <h1 className="text-lg font-bold tracking-tight bg-gradient-to-r from-[#38BDF8] to-blue-400 bg-clip-text text-transparent truncate">
            SES System
          </h1>
        </div>

        {/* Mobile Navigation Links */}
        <nav className="flex-1 px-4 py-6 space-y-3 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
          {items.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                flex items-center gap-3 px-4 py-3 rounded-xl 
                transition-all duration-200 group
                ${
                  isActive
                    ? "bg-gradient-to-r from-[#38BDF8] to-blue-600 text-white shadow-lg shadow-blue-900/30"
                    : "text-[#9CA3AF] hover:bg-slate-800/50 hover:text-[#E5E7EB]"
                }
              `}
                title={item.label}
                onClick={() => setMobileIsOpen(false)}
              >
                <span className="text-lg flex-shrink-0">{item.icon}</span>
                {isSidebarOpen && (
                  <span className="text-sm font-medium truncate">
                    {item.label}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Mobile User Profile */}
        <div className="p-4 border-t border-slate-700/40 space-y-3 flex-shrink-0 bg-gradient-to-t from-slate-900/30 to-transparent">
          {/* User Info */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-br from-slate-800/40 to-slate-900/20 border border-slate-700/40 hover:border-slate-600/60 transition-all duration-300">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#38BDF8] via-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-lg shadow-blue-500/30">
              {role.charAt(0)}
            </div>
            <div className="flex-1 min-w-0 truncate">
              <p className="text-sm font-semibold text-[#E5E7EB] truncate">
                {username || "User"}
              </p>
              <p className="text-xs text-[#6B7280] truncate capitalize font-medium">
                {role === "ADMIN"
                  ? "Administrator"
                  : role === "SUPERVISOR"
                    ? "Supervisor"
                    : "Surveyor"}
              </p>
            </div>
          </div>

          {/* Mobile Logout Button */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-slate-800/30 to-red-900/20 hover:from-red-600/30 hover:to-red-700/20 text-[#9CA3AF] hover:text-[#FCA5A5] rounded-xl font-medium transition-all duration-300 border border-slate-700/40 hover:border-red-600/50"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-sm">Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
