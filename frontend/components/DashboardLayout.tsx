"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Home,
  Zap,
  Menu,
  X,
  LogOut,
} from "lucide-react";
import { useEffect } from "react";
import LogoutConfirmationDialog from "./LogoutConfirmationDialog";

interface DashboardLayoutProps {
  children: React.ReactNode;
  role: "ADMIN" | "SUPERVISOR" | "SURVEYOR";
}

export default function DashboardLayout({
  children,
  role,
}: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [user, setUser] = useState<{name?: string; username?: string; role?: string} | null>(null);
  const [loading, setLoading] = useState(true);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const initializeAuth = () => {
      const token = localStorage.getItem("token");
      const userStr = localStorage.getItem("user");

      if (!token || !userStr) {
        router.push("/login");
        return;
      }

      try {
        const userData = JSON.parse(userStr);
        setUser(userData);
        setLoading(false);
      } catch (error) {
        console.error("Failed to parse user data:", error);
        router.push("/login");
      }
    };

    initializeAuth();
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-600 mb-4 animate-pulse">
            <span className="text-white">⟳</span>
          </div>
          <p className="text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // Define navigation items based on role
  const navItems: { name: string; href: string; icon: React.ReactNode }[] = [];

  if (role === "ADMIN") {
    navItems.push(
      {
        name: "Dashboard",
        href: "/admin/dashboard",
        icon: <LayoutDashboard className="w-5 h-5" />,
      },
      {
        name: "Users",
        href: "/admin/users",
        icon: <Users className="w-5 h-5" />,
      },
      {
        name: "Slums",
        href: "/admin/slums",
        icon: <Home className="w-5 h-5" />,
      },
    );
  } else if (role === "SUPERVISOR") {
    navItems.push(
      {
        name: "Dashboard",
        href: "/supervisor/dashboard",
        icon: <LayoutDashboard className="w-5 h-5" />,
      },
      {
        name: "Slums",
        href: "/supervisor/slums",
        icon: <Home className="w-5 h-5" />,
      },
      {
        name: "Assignments",
        href: "/supervisor/assignments",
        icon: <Zap className="w-5 h-5" />,
      },
    );
  } else if (role === "SURVEYOR") {
    navItems.push(
      {
        name: "Dashboard",
        href: "/surveyor/dashboard",
        icon: <LayoutDashboard className="w-5 h-5" />,
      },
      {
        name: "Surveys",
        href: "/surveyor/surveys",
        icon: <Home className="w-5 h-5" />,
      },
    );
  }

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    // Don't remove remembered credentials - they should persist across sessions
    // localStorage.removeItem("rememberedCredentials");
    // localStorage.removeItem("rememberMeState");
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

  // Surveyor uses bottom nav instead of sidebar
  if (role === "SURVEYOR") {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100">
        <main className="pb-24 min-h-screen">{children}</main>
        {/* Bottom Nav */}
        <nav className="fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 flex items-center justify-around h-20 z-40">
          {navItems.map((item: {name: string; href: string; icon: React.ReactNode}) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex flex-col items-center gap-1 px-4 py-2 transition-colors ${
                  isActive ? "text-cyan-400" : "text-slate-400 hover:text-white"
                }`}
              >
                {item.icon}
                <span className="text-xs font-medium">{item.name}</span>
              </Link>
            );
          })}
          <button
            onClick={handleLogoutClick}
            className="flex flex-col items-center gap-1 px-4 py-2 text-slate-400 hover:text-red-400 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-xs font-medium">Logout</span>
          </button>
        </nav>
      </div>
    );
  }

  // Admin and Supervisor use sidebar
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex selection:bg-blue-500/30">
      {/* --- SIDEBAR (Fixed) --- */}
      <aside
        className={`fixed top-0 left-0 z-40 h-screen w-64 bg-slate-900 border-r border-slate-800 transition-transform duration-300 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        <div className="flex flex-col h-full">
          {/* Logo Area */}
          <div className="h-16 flex items-center px-6 border-b border-slate-800 bg-slate-900/50">
            <div className="w-8 h-8 rounded-lg bg-blue-600 mr-3 flex items-center justify-center font-bold text-white">
              S
            </div>
            <span className="font-bold text-lg tracking-tight">SES System</span>
          </div>

          {/* Nav Links */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {navItems.map((item: {name: string; href: string; icon: React.ReactNode}) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                    isActive
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-900/20"
                      : "text-slate-400 hover:bg-slate-800 hover:text-white"
                  }`}
                >
                  <span
                    className={
                      isActive
                        ? "text-white"
                        : "text-slate-500 group-hover:text-white"
                    }
                  >
                    {item.icon}
                  </span>
                  <span className="font-medium">{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* User Profile Footer */}
          <div className="p-4 border-t border-slate-800 space-y-3">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-950/50 border border-slate-800">
              <div className="w-10 h-10 rounded-full bg-linear-to-tr from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold text-sm">
                {role.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {user?.name || user?.username}
                </p>
                <p className="text-xs text-slate-500 truncate capitalize">
                  {role}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogoutClick}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-slate-800 hover:bg-red-600/20 text-slate-400 hover:text-red-400 rounded-xl font-medium transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* --- MAIN CONTENT WRAPPER --- */}
      <div className="flex-1 ml-0 lg:ml-64 transition-all duration-300">
        {/* Top Header */}
        <header className="h-16 sticky top-0 z-30 bg-slate-950/80 backdrop-blur-md border-b border-slate-800 px-8 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden text-white p-2 hover:bg-slate-800 rounded-lg transition-colors"
          >
            {sidebarOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
          <h2 className="text-sm font-medium text-slate-400 ml-auto">
            Socio-Economic Survey /{" "}
            <span className="text-white capitalize">{role} Dashboard</span>
          </h2>
        </header>

        {/* Page Content - This is where your Dashboard components go */}
        <main className="p-8 min-h-[calc(100vh-64px)]">{children}</main>
      </div>
      <LogoutConfirmationDialog 
        isOpen={showLogoutDialog}
        onConfirm={handleLogoutConfirm}
        onCancel={handleLogoutCancel}
      />
    </div>
  );
}
