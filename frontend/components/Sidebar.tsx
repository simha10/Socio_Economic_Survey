"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React, { useState } from "react";
import { useSidebar } from "@/contexts/SidebarContext";
import { LogOut, Menu, X, LayoutDashboard, Map, ClipboardList, TrendingUp, Users, CheckSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import LoadingSpinner from "@/components/LoadingSpinner";
import LogoutConfirmationDialog from "@/components/LogoutConfirmationDialog";

interface SidebarProps {
  role: "SUPERVISOR" | "ADMIN" | "SURVEYOR";
  username?: string;
}

const supervisorItems = [
  { href: "/supervisor/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/supervisor/slums", label: "Slums", icon: Map },
  { href: "/supervisor/assignments", label: "Assignments", icon: ClipboardList },
  { href: "/supervisor/reports", label: "Reports", icon: TrendingUp },
];

const adminItems = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/slums", label: "Slums", icon: Map },
  { href: "/admin/assignments", label: "Assignments", icon: CheckSquare },
];

const surveyorItems = [
  { href: "/surveyor/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/surveyor/slums", label: "Slums", icon: Map },
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

  // Fallback state for sidebar if context fails
  const [isSidebarOpenState, setIsSidebarOpenState] = useState(true);
  
  let isSidebarOpen, toggleSidebar;
  try {
    const sidebarContext = useSidebar();
    isSidebarOpen = sidebarContext.isSidebarOpen;
    toggleSidebar = sidebarContext.toggleSidebar;
  } catch (error) {
    console.warn('Sidebar context not available, using fallback state', error);
    isSidebarOpen = isSidebarOpenState;
    toggleSidebar = () => setIsSidebarOpenState(prev => !prev);
  }
  const [mobileIsOpen, setMobileIsOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      // Simulate a brief delay for UX smoothness if needed, or just proceed.
      // await new Promise(resolve => setTimeout(resolve, 500)); 
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
      // Fallback to traditional redirect if router fails
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
  };

  const handleLogoutClick = (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    setShowLogoutDialog(true);
  };

  const handleLogoutConfirm = (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    setShowLogoutDialog(false);
    handleLogout();
  };

  const handleLogoutCancel = (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    setShowLogoutDialog(false);
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "hidden md:flex flex-col relative h-screen transition-all duration-300 border-r border-slate-800 bg-slate-900 shrink-0",
          isSidebarOpen ? "w-64" : "w-16"
        )}
      >
        {/* Toggle & Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800">
          {isSidebarOpen && (
            <span className="text-xl font-bold tracking-tight text-blue-500 truncate">
              SES System
            </span>
          )}
          <button
            onClick={toggleSidebar}
            className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-800 transition-colors cursor-pointer"
          >
            {isSidebarOpen ? <Menu size={20} /> : <Menu size={20} className="mx-auto" />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-6 py-8 flex flex-col gap-6 overflow-y-auto">
          {items.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-4 text-sm transition-colors duration-200 group",
                  isActive
                    ? "text-white font-semibold"
                    : "text-slate-500 hover:text-slate-300 font-medium"
                )}
                title={item.label}
              >
                <div className={cn(
                    "p-2 rounded-lg transition-all",
                    isActive ? "bg-blue-600 text-white shadow-lg shadow-blue-900/40" : "bg-slate-800/50 text-slate-500 group-hover:bg-slate-800 group-hover:text-slate-300"
                )}>
                    <Icon size={20} />
                </div>
                {isSidebarOpen && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Footer/User */}
        <div className="p-4 border-t border-slate-800">
          <div className={cn("flex items-center gap-3", !isSidebarOpen && "justify-center")}>
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xs ring-2 ring-slate-900 shrink-0">
              {role.charAt(0)}
            </div>
            {isSidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {username || "User"}
                </p>
                <p className="text-xs text-slate-500 truncate capitalize">
                  {role.toLowerCase()}
                </p>
              </div>
            )}
            <button
              onClick={handleLogoutClick}
              className={cn(
                "text-slate-500 hover:text-red-400 transition-colors cursor-pointer",
                isSidebarOpen ? "" : "mx-auto"  // Center the button when sidebar is collapsed
              )}
              title="Logout"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Header (To be used when this component is used in a layout) */}
      {/* Note: In the new layout structure, the header is usually in the main content area, 
          but we provide the mobile toggle logic here or rely on the parent layout to show a toggle.
          Based on the previous Sidebar code, it had its own mobile drawer. Let's keep that. */}

      {/* Mobile Toggle Button (Fixed Position) */}
       <button
        onClick={() => setMobileIsOpen(!mobileIsOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-slate-900 border border-slate-800 rounded-lg text-blue-500 cursor-pointer"
      >
        <Menu size={20} />
      </button>

      {/* Mobile Drawer */}
      {mobileIsOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setMobileIsOpen(false)} />
          <div className="fixed inset-y-0 left-0 w-64 bg-slate-900 border-r border-slate-800 p-4 shadow-xl flex flex-col">
            <div className="flex items-center justify-between mb-8">
               <span className="text-xl font-bold tracking-tight text-blue-500">
                SES System
              </span>
              <button onClick={() => setMobileIsOpen(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X size={20} />
              </button>
            </div>
            
            <nav className="flex-1 space-y-1">
              {items.map((item) => {
                 const isActive = pathname === item.href;
                 const Icon = item.icon;
                 return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileIsOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                      isActive
                        ? "bg-blue-600/10 text-blue-500"
                        : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                    )}
                  >
                    <Icon size={20} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="pt-4 border-t border-slate-800 mt-auto">
               <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xs">
                    {role.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{username || "User"}</p>
                    <p className="text-xs text-slate-500 capitalize">{role.toLowerCase()}</p>
                  </div>
               </div>
               <button
                  onClick={handleLogoutClick}
                  className="w-full flex items-center justify-center gap-2 p-2 rounded-lg border border-slate-700 text-slate-400 hover:text-red-400 hover:border-red-900/50 hover:bg-red-900/10 transition-colors cursor-pointer"
                >
                  <LogOut size={16} />
                  <span className="text-sm">Logout</span>
                </button>
            </div>
          </div>
        </div>
      )}
      <LogoutConfirmationDialog 
        isOpen={showLogoutDialog}
        onConfirm={handleLogoutConfirm}
        onCancel={handleLogoutCancel}
      />
      {isLoggingOut && <LoadingSpinner fullScreen text="Logging out..." />}
    </>
  );
}
